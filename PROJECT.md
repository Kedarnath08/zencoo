# Zencoo

> A community / social-media mobile app for residents of a housing society (gated apartment community). Think of it as a private Instagram + neighbourhood marketplace, scoped to a single residential complex ("Sobha HRC Prestine, Jakkuru").

This document is a recovered overview of what has actually been built, reconstructed by reading the source. Use it to re-orient yourself before continuing work.

---

## The idea in one paragraph

Residents of an apartment community sign up (tied to their door number and wing), get a feed of posts from neighbours (mostly food/homemade-goods photos), can browse a directory of residents by wing, view each other's profiles, create their own posts, and place/receive **orders** for goods sold between residents. It's a hyper-local social + micro-commerce app for a single community.

The project is split into two independent repos/folders:

| Folder | Stack | Purpose |
|--------|-------|---------|
| `zencoo-backend-main` | **Java 17 + Spring Boot 3.5.3 + MySQL** | REST API: auth + user profile |
| `zencoo-frontend-main` | **React Native 0.79 + Expo 53 + TypeScript** | The mobile app (Android-focused) |

---

## Current state (updated 2026-07-07)

A production-hardening pass (phases 1–6) and feature-completion pass (residents, orders, follow, post-detail, notifications) were done on top of the original prototype. Status now:

- ✅ **Real, wired to backend:** Sign-up (auto-login), login (BCrypt + JWT), **persistent login** across restarts, fetch own profile, edit bio / hometown / profile picture, **the whole feed** (posts, likes, comments), **creating posts** (image upload → Cloudinary → post record), logout.
- ✅ **Now also live:** Residents directory + Other users' profiles (`/api/residents`); the full **Orders** system (`/api/orders`); **My Profile's posts grid** (real posts + delete); the **Follow** system — follow/unfollow with real follower counts (`/api/users/{id}/follow`); **followers/following list screens** (`/api/users/{id}/followers|following`); a **post-detail screen** (`GET /api/posts/{id}`) reachable from any post grid; and a **real-time notifications system** (bell icon with unread badge, tap → notifications screen, auto-created for likes/comments/follows/order-status-changes).
- 🟢 **Core app is feature-complete and backend-driven.** Only profile `headerBg` still comes from a local default (no backend concept yet). Remaining features are net-new (richer commerce flow, messaging) — see below.
- 🔴 **Intentionally dropped:** Google login (commented out on both ends; `firebase`/`expo-auth-session`/`expo-random`/`expo-crypto` were removed as unused deps in the cleanup pass).

### What the hardening pass changed
1. **Passwords** are now BCrypt-hashed (`BCryptPasswordEncoder`); credential logging removed.
2. **JWT secret + DB creds + CORS origins** are externalized to env vars (`JWT_SECRET`, `DB_URL/DB_USERNAME/DB_PASSWORD`, `CORS_ALLOWED_ORIGINS`) with dev defaults.
3. **`JwtUtil` modernized** — derives an HMAC key from raw UTF-8 secret bytes (any secret ≥ 64 bytes works; the old code required the secret to be valid Base64, a production landmine) and uses the non-deprecated parser API.
4. **`/register` now returns a JWT** (auto-login after signup — previously it returned nothing, so the app became "authenticated" with no token).
5. **Persistent login**: a new `AuthContext` reads the stored JWT on boot, auto-logs-in, auto-logs-**out** on any 401, and exposes `signIn`/`signOut`. Added a logout button on the profile screen.
6. **Centralized API client** (`src/api/axiosInstance.ts`): env-driven base URL (platform-aware), Bearer-token interceptor, 401 handler. All screens go through it — no more hardcoded `http://localhost:8080`.
7. **New `posts` backend domain**: `Post` / `PostLike` / `PostComment` entities, repositories, `PostService`, `PostController` with ownership/authorization checks. Feed + Posting screens are wired to it.
8. **Robustness**: global exception handler (consistent `{message}` JSON), auth input normalization (lowercased email, blank guards), CORS now allows `PATCH` (profile updates would have failed CORS on web before), fixed a native crash (`window.confirm` in the profile screen), `User.createdAt` now actually populates.
9. **Tests**: added an H2-backed integration suite (`AuthAndPostFlowTests`) that boots the whole app and exercises register→login→post→feed→like→comment + authorization — runs with `./mvnw test`, no MySQL needed.

> ⚠️ **Migration note:** because login now uses BCrypt, any users created by the old plaintext code cannot log in — they must re-register. (The DB also hasn't been migrated to the current dev machine yet; set `DB_PASSWORD` etc. to point at your MySQL.)

---

## Backend — `zencoo-backend-main`

Spring Boot app, package root `com.zencoo`. MySQL database `zencoo_userdb` on `localhost:3306` (creds `root`/`root` in `application.properties`). Hibernate `ddl-auto=update` auto-creates the schema. Runs on port **8080**, bound to `0.0.0.0`.

### Structure
```
com.zencoo
├── BackendApplication.java        # Spring Boot entrypoint
├── config/
│   ├── SecurityConfig.java        # JWT filter chain; /api/auth/** is public, everything else needs a token; stateless
│   └── WebConfig.java             # CORS (allows http://localhost:8080 — note: not the Expo dev origin)
├── controller/
│   ├── AuthController.java        # /api/auth/*  (login, register, check-email, check-username; google-login commented out)
│   └── UserProfileController.java # /api/*       (get profile, patch bio/hometown/profile-pic)
├── dto/UserProfileDto.java        # Shape returned to the client for a profile
├── model/User.java                # JPA @Entity -> "users" table
├── repository/UserRepository.java # Spring Data JPA (findByEmail/Username, existsBy...)
├── security/
│   ├── CustomUserDetails.java     # Wraps userId as the Spring Security principal
│   └── JwtAuthenticationFilter.java # Reads "Authorization: Bearer <jwt>", sets auth context
├── util/
│   ├── JwtUtil.java               # HS512 JWT sign/verify; secret hardcoded; 1-day expiry
│   └── GoogleTokenVerifier.java   # Entirely commented out (Google sign-in was abandoned)
└── resources/application.properties
```

### API endpoints

**Auth** (`/api/auth`, public):
- `POST /login` — body `{email, password}` → returns `{token, message}` (JWT) or 401.
- `POST /register` — body `{email, username, password, fullName, doorNumber, community}` → creates user.
- `GET /check-email?email=` → `{exists: boolean}`.
- `GET /check-username?username=` → `{unique: boolean}`.

**Profile** (`/api`, requires JWT; user identified from token's subject = userId):
- `GET /profile` → `UserProfileDto`.
- `PATCH /profile/bio` — body `{bio}`.
- `PATCH /profile/hometown` — body `{hometown}`.
- `PATCH /profile/profile-pic` — body `{profilePic}` (a Cloudinary URL).

**Posts / feed** (`/api/posts`, requires JWT):
- `GET /posts` → feed (all posts, newest first); each `PostDto` has author info, `likeCount`, `commentCount`, `likedByMe`.
- `GET /posts/{postId}` → a single post (same `PostDto` shape) — backs the post-detail screen; 404 if missing.
- `GET /posts/user/{authorId}` → posts by one user (profile grids).
- `POST /posts` — body `{imageUrl, caption}` → creates a post (201).
- `DELETE /posts/{postId}` → delete own post (403 if not owner).
- `POST /posts/{postId}/like` → toggles like, returns the updated `PostDto`.
- `GET /posts/{postId}/comments` → list of `CommentDto`.
- `POST /posts/{postId}/comments` — body `{text}` → adds a comment (201).

### Entities
- `User`: `id, email (unique), username (unique), passwordHash (BCrypt), fullName, doorNumber, community, bio, hometown, createdAt, profilePic`.
- `Post`: `id, user (FK), imageUrl, caption, createdAt`.
- `PostLike`: `id, post (FK), user (FK)` — unique on `(post, user)`.
- `PostComment`: `id, post (FK), user (FK), text, createdAt`.

### Config (env vars, with dev defaults in `application.properties`)
`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (≥ 64 bytes), `JWT_EXPIRATION_MS`, `CORS_ALLOWED_ORIGINS`.

**Residents** (`/api/residents`, requires JWT) — a resident is a `User`:
- `GET /residents?wing=` → directory (excludes self; optional wing filter; wing derived from door number).
- `GET /residents/{id}` → full `ResidentProfileDto` (bio, hometown, follower/following counts, and `posts: PostSummaryDto[]` — `{id, imageUrl}` pairs so the profile grid can open a specific post's detail view, not just display its image).

**Orders** (`/api/orders`, requires JWT) — resident-to-resident orders:
- `GET /orders/placed` → orders I placed (buyer = me).
- `GET /orders/received` → orders placed with me (seller = me).
- `POST /orders` — body `{sellerId, productName, productImage?, quantity?, note?}` → creates a PENDING order (can't order from yourself).
- `PATCH /orders/{id}/status` — body `{status}` → role-aware transitions: seller does PENDING→ACCEPTED/REJECTED and ACCEPTED→COMPLETED/CANCELLED; buyer does PENDING→CANCELLED. Wrong party → 403; illegal transition → 400.

`Order` entity: `id, buyer (FK), seller (FK), productName, productImage, quantity, note, status (enum), createdAt, updatedAt`.

**Follow** (`/api/users/{id}/...`, requires JWT) — asymmetric follow (Instagram-style):
- `POST /users/{id}/follow` → current user follows `{id}` (idempotent; can't follow yourself).
- `DELETE /users/{id}/follow` → unfollow.
- Both return `{followedByMe, followersCount, followingCount}`. Follow data is also embedded in `GET /residents/{id}` (`followersCount`/`followingCount`/`followedByMe`) and `GET /profile` (`followersCount`/`followingCount`).
- `GET /users/{id}/followers` / `GET /users/{id}/following` → lists of `ResidentDto` (backs the Followers/Following screen).

`Follow` entity: `id, follower (FK), following (FK), createdAt` — unique on `(follower, following)`. Mapping to `ResidentDto` (wing derivation, `@`-stripping) is factored into a shared `ResidentMapper` util so `ResidentService` and `FollowService` don't duplicate it.

### Hardening in place
- **Bean validation**: mutating endpoints bind typed `@Valid` request DTOs (`dto/request/*`); validation failures return `400 {message}` via `GlobalExceptionHandler`.
- **`spring.jpa.open-in-view=false`** — all DTO mapping happens inside service transactions.
- **Auth rate limiting**: `RateLimitFilter` caps `/api/auth/login|register` per IP (`AUTH_RATE_LIMIT_MAX`/`AUTH_RATE_LIMIT_WINDOW`, default 10/60s) → `429`. In-memory / single-instance.

---

## Frontend — `zencoo-frontend-main`

Expo (managed-ish, `newArchEnabled: true`) React Native app in TypeScript. Entry `index.ts` → `App.tsx` → `AuthNavigator`. Android package `com.kedarnath08.zfrontend`. Uses EAS (project id in `app.json`).

### Key libraries
`@react-navigation` (bottom-tabs + native-stack), `axios`, `formik` + `yup` (forms/validation), `expo-image-picker` + `expo-image-manipulator` (posting & avatar), `expo-secure-store` (JWT storage), `react-native-svg` (icons), `firebase` (installed but not obviously used), `expo-auth-session` (for the abandoned Google login).

### Auth architecture (post-hardening)
- `src/context/AuthContext.tsx` — holds the JWT, persists it in SecureStore, reads it on boot (auto-login), and auto-logs-out on any 401 from the API. Exposes `signIn(token)` / `signOut()` / `isAuthenticated` / `ready`.
- `src/api/axiosInstance.ts` — the one axios instance every call uses; attaches the Bearer token and routes 401s to the auth layer.
- `src/config/env.ts` — resolves `API_BASE_URL` (from `EXPO_PUBLIC_API_URL`, else a platform-aware localhost default) and the Cloudinary config.
- `src/utils/secureStore.ts` — `saveJWT` / `getJWT` / `deleteJWT`.
- `src/utils/uploadImage.ts` — shared "compress to WEBP + upload to Cloudinary" used by both the posting screen and the profile-pic hook.

### Navigation flow
```
App.tsx  (wraps everything in <AuthProvider>)
└── AuthNavigator (reads AuthContext; shows a splash until the token check finishes)
    ├── if NOT authed → Stack:
    │     WelcomePage → SignUpStepOne → SignUpStepTwo → SignUpStepThree → signIn(token)
    │     Login → signIn(token)
    └── if authed → AppNavigator (bottom tab bar, custom <BottomNavBar/>):
          ├── Feed            (src/screens/Feed.tsx)
          ├── Residents       → ResidentsStack: Wing → ResidentsList → OthersProfile → PostDetail / FollowList
          ├── NewPost         → PostStack: PostingScreen
          ├── Orders          (src/screens/Orders.tsx)  — Placed / Received tabs
          └── Myprofile       → ProfileStack: ProfileMain (MyProfile) → OthersProfile → PostDetail / FollowList
```
`ProfileStack` and `ResidentsStack` both register `OthersProfile`, `PostDetail`, and `FollowList` (same component files, registered under each navigator) so either entry point — the residents directory or your own profile — can push into a post's detail view or a followers/following list. This is a deliberate lightweight choice: React Navigation doesn't let two sibling tab-stacks share a screen instance, and a full root-level stack refactor wasn't warranted for two shared screens.

### Screens & what they do

**Auth (`src/screens/userAuth/`)**
- `WelcomePage` — logo + Sign Up / Login entry.
- `SignUpStepOne` — full name, email, door number, community (community is hardcoded to "Sobha HRC Prestine, Jakkuru"). Live-checks email isn't already registered via backend.
- `SignUpStepTwo` — set + confirm password (min 6 chars).
- `SignUpstepThree` — auto-generates a suggested `@username`, debounced live uniqueness check, then `registerUser` → `signIn(token)` (auto-login).
- `Login` — Formik + Yup → `loginUser` → `signIn(token)`. Google button removed.

**Main app**
- `Feed.tsx` — `GET /api/posts`, pull-to-refresh, refreshes on focus (so a new post appears), optimistic like toggle (`POST /posts/{id}/like`), a comments modal (`GET/POST /posts/{id}/comments`), and a cart button that places an order for that post's item from its author (`POST /api/orders`).
- `residents/wings/Wing.tsx` — lists 5 hardcoded wings; tapping one opens the residents list.
- `residents/Residents.tsx` — `GET /api/residents?wing=`, filters by search box, tap a resident → `OthersProfile`.
- `userProfile/OthersProfile.tsx` — `GET /api/residents/{id}`. Avatar, bio, **Followers**/Posts stats (Followers tappable → `FollowList`), posts grid (tap a post → `PostDetail`), a working **Follow/Following** toggle (`POST`/`DELETE /users/{id}/follow`). Message button is still a placeholder.
- `userProfile/MyProfile.tsx` — merges real data from `GET /api/profile`. Inline-editable **bio**/**hometown** (PATCH), avatar upload → Cloudinary → PATCH, **logout button**, a live posts grid (`GET /posts/user/{me}`) whose edit mode deletes real posts (`DELETE /posts/{id}`, tap a post when not in edit mode → `PostDetail`), and a **Followers** stat → `FollowList`.
- `PostDetail.tsx` (`src/screens/`, shared) — single post view: image, author, like toggle, inline (non-modal) comment list + input, and a delete button shown only when opened with `isOwn: true` (avoids an extra call to determine ownership).
- `FollowList.tsx` (`src/screens/`, shared) — Followers/Following tabs for a given user id; tapping a row opens `OthersProfile`.
- `posting/PostingScreen.tsx` — pick from camera/gallery → `uploadImageToCloudinary` → `POST /api/posts`, with a spinner and error handling. Navigates to Feed, which refreshes on focus.
- `Orders.tsx` — two tabs, both live. **Placed** (`GET /api/orders/placed`) with cancel-if-pending. **Received** (`GET /api/orders/received`) with Accept/Reject/Complete/Cancel (`PATCH /api/orders/{id}/status`). Status colour badges.

### Components (`src/components/`)
- `BottomNavBar.tsx` — custom orange (`#FF8C00`) tab bar with SVG icons and an active indicator; center "NewPost" has a circular bordered plus.
- `FeedPostCard.tsx` — a feed post card (avatar, image, like/comment/share/save/cart action bar overlay, description, time).
- `PlacedOrderCard.tsx` / `RecievedOrderCard.tsx` — order cards for the two Orders tabs.

### API layer (`src/api/`)
- `axiosInstance.ts` — the one axios instance every call goes through: Bearer-token interceptor + 401 handler routed to `AuthContext`.
- `user.ts` — auth (`checkEmailRegistered`, `checkUsernameUnique`, `registerUser`, `loginUser`) + own profile (`fetchMyProfile`, `updateBio`, `updateHometown`, `updateProfilePic`).
- `posts.ts` — `fetchFeed`, `fetchPost`, `fetchUserPosts`, `createPost`, `deletePost`, `toggleLike`, `fetchComments`, `addComment`.
- `residents.ts` — `fetchResidents`, `fetchResident` (returns `ResidentProfile` with `posts: PostSummary[]`).
- `orders.ts` — `fetchPlacedOrders`, `fetchReceivedOrders`, `createOrder`, `updateOrderStatus`.
- `follow.ts` — `followUser`, `unfollowUser`, `fetchFollowers`, `fetchFollowing`.
- `src/utils/secureStore.ts` — `saveJWT`/`getJWT`/`deleteJWT`. `src/utils/uploadImage.ts` — shared Cloudinary upload used by posting + the profile-pic hook. `src/data/myProfile.json` is the only mock file left (supplies the `headerBg` default and avatar fallback).

### Styling
All screen styles live in `src/styles/*.ts` as `StyleSheet` objects (one file per screen); `PostDetail.tsx` and `FollowList.tsx` reuse `feedStyles`/`residentsStyles`/`ordersStyles` rather than adding new style files. Brand colour is orange (`#FF8C00` / `#FFA500`). Icons are SVGs in `assets/icons/` loaded via `react-native-svg-transformer` (see `metro.config.js`, `src/@types/svg.d.ts`).

### Remaining frontend gaps / tech debt
- Follow / Message / Share / Save buttons: **Follow now works**; Message/Share/Save are still placeholders.
- Notification bell (Feed app bar) is not wired to anything (no notification system yet).

---

## How to run

**Backend:**
1. Start MySQL locally and create the `zencoo_userdb` database (Hibernate creates the *tables*, but the database itself must exist).
2. Point the app at your DB — either edit `application.properties` or set env vars: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. (The committed default is `root`/`root`; the current dev machine's MySQL uses a different password and the DB hasn't been migrated here yet.) For production also set `JWT_SECRET` (≥ 64 chars) and `CORS_ALLOWED_ORIGINS`.
3. `cd zencoo-backend-main && ./mvnw spring-boot:run` → serves on `:8080`.
4. **No DB? Run the tests:** `./mvnw test` boots the whole app on in-memory H2 and exercises the auth + posts flow — good for verifying changes without MySQL.

**Frontend:**
1. `cd zencoo-frontend-main && npm install`.
2. Android emulator: `adb reverse tcp:8080 tcp:8080` (then `localhost` works). Real device: set `EXPO_PUBLIC_API_URL=http://<your-PC-LAN-IP>:8080`.
3. `npx expo start` (or `npm run android`). Needs a dev build (`expo-dev-client`) for the native modules (secure-store, image-picker).

---

## Suggested next steps (if you resume this)

Done so far: ✅ BCrypt + secrets, ✅ persistent login, ✅ centralized API client, ✅ posts/feed + wiring, ✅ posting, ✅ residents + other-user profiles, ✅ orders (place + manage), ✅ My Profile posts grid + delete, ✅ follow system, ✅ dead-code/deps cleanup, ✅ prod hardening (validation, rate limiting, open-in-view), ✅ post-detail screen, ✅ followers/following list screens. Remaining:

1. **Notifications** — feed bell + order/follow events have no notification system.
2. **Richer ordering** — a real product/checkout flow (price, catalog) instead of the minimal "order this post's item" shortcut; an order-detail screen (analogous to the post-detail screen).
3. **Messaging — DEFERRED TO LAST.** A full secure real-time chat (WhatsApp/Instagram-grade): 1:1/group conversations, persistence, delivery/read receipts, WebSocket transport, and end-to-end encryption (server stores only ciphertext). Its own subproject; the profile "Message" button stays a placeholder until then.

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current feature-by-feature status dashboard.

---

*Originally recovered 2026-07-05; updated 2026-07-06 after a production-hardening pass, follow/friends system, dead-code cleanup, and post-detail/followers-list screens. Owner: kedarnath08 (Expo). If details here drift from the code, trust the code.*
