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

## Current state (updated 2026-07-14)

A production-hardening pass (phases 1–6) and feature-completion pass (residents, orders, follow, post-detail, notifications) were done on top of the original prototype, followed by a backend efficiency/pagination pass, a screens folder reorganization, a from-scratch Google Sign-In implementation, a TanStack Query migration, and — most recently — standing up a real local dev environment (MySQL + backend + Android emulator) and verifying the app live for the first time. Status now:

- ✅ **Real, wired to backend, and now verified live (not just typechecked/H2-tested):** Sign-up (auto-login), login (BCrypt + JWT), **Google Sign-In** (sign in or onboard with a Google account, own `com.zencoo.google` backend package + `screens/userAuth/google/` frontend folder — the password-based half of this is live-verified; the actual Google OAuth handshake still needs Cloud Console credentials, see below), **persistent login** across restarts, fetch own profile, edit bio / hometown / profile picture, **the whole feed** (posts, likes, comments), **creating posts** (image upload → Cloudinary → post record), logout.
- ✅ **Now also live:** Residents directory + Other users' profiles (`/api/residents`); the full **Orders** system (`/api/orders`) with an **order-detail screen** (status timeline, price, role-aware actions); **post pricing** (optional price on a post, snapshotted into the order at purchase time so later edits don't rewrite history); **My Profile's posts grid** (real posts + delete); the **Follow** system — follow/unfollow with real follower counts (`/api/users/{id}/follow`); **followers/following list screens** (`/api/users/{id}/followers|following`); a **post-detail screen** (`GET /api/posts/{id}`) reachable from any post grid; and a **real-time notifications system** (bell icon with unread badge, tap → notifications screen, auto-created for likes/comments/follows/order-status-changes).
- ✅ **Pagination**: feed, residents directory, post comments, and orders (placed/received) are all infinite-scroll (`page`/`size` query params backend-side, `useInfiniteQuery` frontend-side) instead of loading unbounded lists.
- ✅ **Server-state caching**: the frontend adopted `@tanstack/react-query` as a data-fetching/caching layer (not a global state store — the app still has no Redux/MobX/Zustand, deliberately) — see "Data layer" under the frontend section below. Confirmed working live: pagination survives navigating away and back instead of collapsing to page 1.
- 🟢 **Core app is feature-complete and backend-driven, and the local dev loop (MySQL → backend → emulator) now works end to end.** Only profile `headerBg` still comes from a local default (no backend concept yet). Only messaging remains as a major unbuilt feature — see below.
- ⚠️ **Google Sign-In needs one more setup step to be fully live-tested** — Google Cloud Console OAuth client IDs (Web/iOS/Android), not yet configured. Everything else it depends on (DB, backend, emulator) is now in place.

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
│   ├── AuthController.java        # /api/auth/*  (login, register, check-email, check-username)
│   └── UserProfileController.java # /api/*       (get profile, patch bio/hometown/profile-pic)
├── google/                        # Google Sign-In, kept separate from AuthController/AuthService
│   ├── GoogleAuthController.java  # /api/auth/google/*  (login, complete)
│   ├── GoogleAuthService.java     # verify → look up/link/create → issue JWT
│   ├── GoogleTokenVerifier.java   # wraps GoogleIdTokenVerifier; audience from google.oauth.client-ids
│   └── dto/                       # GoogleLoginRequest, GoogleCompleteRegistrationRequest
├── dto/UserProfileDto.java        # Shape returned to the client for a profile
├── model/User.java                # JPA @Entity -> "users" table
├── repository/UserRepository.java # Spring Data JPA (findByEmail/Username, findByGoogleId, existsBy...)
├── security/
│   ├── CustomUserDetails.java     # Wraps userId as the Spring Security principal
│   └── JwtAuthenticationFilter.java # Reads "Authorization: Bearer <jwt>", sets auth context
├── util/JwtUtil.java              # HS512 JWT sign/verify; secret from JWT_SECRET env var; 1-day expiry
└── resources/application.properties
```

### API endpoints

**Auth** (`/api/auth`, public):
- `POST /login` — body `{email, password}` → returns `{token, message}` (JWT) or 401.
- `POST /register` — body `{email, username, password, fullName, doorNumber, community}` → creates user.
- `GET /check-email?email=` → `{exists: boolean}`.
- `GET /check-username?username=` → `{unique: boolean}`.

**Google Sign-In** (`/api/auth/google`, public — covered by the same `/api/auth/**` rule):
- `POST /` — body `{idToken}`. Verifies the Google ID token server-side; if the identity is already linked (or its verified email matches an existing password account, which gets auto-linked) → `{token, isNewUser: false}`; otherwise → `{isNewUser: true, email, fullName, suggestedUsername}` (no account created yet).
- `POST /complete` — body `{idToken, username, doorNumber, community}`. Re-verifies the token server-side, creates the account (`passwordHash: null`, `googleId` set) → `{token}`.

**Profile** (`/api`, requires JWT; user identified from token's subject = userId):
- `GET /profile` → `UserProfileDto`.
- `PATCH /profile/bio` — body `{bio}`.
- `PATCH /profile/hometown` — body `{hometown}`.
- `PATCH /profile/profile-pic` — body `{profilePic}` (a Cloudinary URL).

**Posts / feed** (`/api/posts`, requires JWT):
- `GET /posts?page=&size=` → feed (all posts, newest first, paginated — defaults `page=0`, `size=20`); each `PostDto` has author info, `likeCount`, `commentCount`, `likedByMe`.
- `GET /posts/{postId}` → a single post (same `PostDto` shape) — backs the post-detail screen; 404 if missing.
- `GET /posts/user/{authorId}` → posts by one user (profile grids).
- `POST /posts` — body `{imageUrl, caption, price?}` → creates a post (201). `price` is optional — when set, the post is listed for sale and can be ordered.
- `DELETE /posts/{postId}` → delete own post (403 if not owner).
- `POST /posts/{postId}/like` → toggles like, returns the updated `PostDto`.
- `GET /posts/{postId}/comments?page=&size=` → paginated list of `CommentDto` (oldest first, defaults `page=0`, `size=20`).
- `POST /posts/{postId}/comments` — body `{text}` → adds a comment (201).

### Entities
- `User`: `id, email (unique), username (unique), passwordHash (BCrypt, nullable for Google-only accounts), googleId (unique, nullable), fullName, doorNumber, community, bio, hometown, createdAt, profilePic`.
- `Post`: `id, user (FK), imageUrl, caption, price (optional, BigDecimal), createdAt`.
- `PostLike`: `id, post (FK), user (FK)` — unique on `(post, user)`.
- `PostComment`: `id, post (FK), user (FK), text, createdAt`.
- `Notification`: `id, user (FK), type (LIKE/COMMENT/ORDER_STATUS/FOLLOW), relatedId, title, message, isRead, createdAt`.

### Config (env vars, with dev defaults in `application.properties`)
`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (≥ 64 bytes), `JWT_EXPIRATION_MS`, `CORS_ALLOWED_ORIGINS`, `GOOGLE_OAUTH_CLIENT_IDS` (comma-separated Web/iOS/Android client IDs; empty by default, so `/api/auth/google*` rejects every token until set). Depends on `com.google.api-client:google-api-client` for Google ID token verification.

**Residents** (`/api/residents`, requires JWT) — a resident is a `User`:
- `GET /residents?wing=&page=&size=` → paginated directory (excludes self; optional wing filter, applied at the DB level; wing derived from door number; defaults `page=0`, `size=20`).
- `GET /residents/{id}` → full `ResidentProfileDto` (bio, hometown, follower/following counts, and `posts: PostSummaryDto[]` — `{id, imageUrl}` pairs so the profile grid can open a specific post's detail view, not just display its image).

**Orders** (`/api/orders`, requires JWT) — resident-to-resident orders:
- `GET /orders/placed?page=&size=` → paginated orders I placed (buyer = me, defaults `page=0`, `size=20`).
- `GET /orders/received?page=&size=` → paginated orders placed with me (seller = me, defaults `page=0`, `size=20`).
- `GET /orders/{orderId}` → single order detail (`OrderDto`, adds `unitPrice`/`totalPrice`); 403 if you're neither buyer nor seller, 404 if missing. Backs the order-detail screen.
- `POST /orders` — body `{sellerId, productName, productImage?, quantity?, price?, note?}` → creates a PENDING order (can't order from yourself). `price` is snapshotted onto the order as `unitPrice` (defaults to 0) so later edits to the post's price don't retroactively change past orders.
- `PATCH /orders/{id}/status` — body `{status}` → role-aware transitions: seller does PENDING→ACCEPTED/REJECTED and ACCEPTED→COMPLETED/CANCELLED; buyer does PENDING→CANCELLED. Wrong party → 403; illegal transition → 400.

`Order` entity: `id, buyer (FK), seller (FK), productName, productImage, quantity, unitPrice, note, status (enum), createdAt, updatedAt`.

**Follow** (`/api/users/{id}/...`, requires JWT) — asymmetric follow (Instagram-style):
- `POST /users/{id}/follow` → current user follows `{id}` (idempotent; can't follow yourself).
- `DELETE /users/{id}/follow` → unfollow.
- Both return `{followedByMe, followersCount, followingCount}`. Follow data is also embedded in `GET /residents/{id}` (`followersCount`/`followingCount`/`followedByMe`) and `GET /profile` (`followersCount`/`followingCount`).
- `GET /users/{id}/followers` / `GET /users/{id}/following` → lists of `ResidentDto` (backs the Followers/Following screen).

`Follow` entity: `id, follower (FK), following (FK), createdAt` — unique on `(follower, following)`. Mapping to `ResidentDto` (wing derivation, `@`-stripping) is factored into a shared `ResidentMapper` util so `ResidentService` and `FollowService` don't duplicate it.

**Notifications** (`/api/notifications`, requires JWT):
- `GET /notifications` → paginated list, newest first.
- `GET /notifications/unread-count` → `{unreadCount}`.
- `PUT /notifications/{id}/read` → marks one as read.
- `PUT /notifications/mark-all-read` → marks all as read.
- Auto-created by `PostService` (like/comment, excludes the post's own author), `FollowService` (new follower), and `OrderService` (status changes → the relevant party).

### Hardening in place
- **Bean validation**: mutating endpoints bind typed `@Valid` request DTOs (`dto/request/*`); validation failures return `400 {message}` via `GlobalExceptionHandler`.
- **`spring.jpa.open-in-view=false`** — all DTO mapping happens inside service transactions.
- **Auth rate limiting**: `RateLimitFilter` caps `/api/auth/login|register` per IP (`AUTH_RATE_LIMIT_MAX`/`AUTH_RATE_LIMIT_WINDOW`, default 10/60s) → `429`. In-memory / single-instance.

---

## Frontend — `zencoo-frontend-main`

Expo (managed-ish, `newArchEnabled: true`) React Native app in TypeScript. Entry `index.ts` → `App.tsx` → `AuthNavigator`. Android package `com.kedarnath08.zfrontend`. Uses EAS (project id in `app.json`).

### Key libraries
`@react-navigation` (bottom-tabs + native-stack), `axios`, `@tanstack/react-query` (server-state caching), `formik` + `yup` (forms/validation), `expo-image-picker` + `expo-image-manipulator` (posting & avatar), `expo-secure-store` (JWT storage), `react-native-svg` (icons), `expo-auth-session` + `expo-web-browser` (Google Sign-In, PKCE-based).

### Auth architecture (post-hardening)
- `src/context/AuthContext.tsx` — holds the JWT, persists it in SecureStore, reads it on boot (auto-login), and auto-logs-out on any 401 from the API. Exposes `signIn(token)` / `signOut()` / `isAuthenticated` / `ready`. `signOut` also calls `queryClient.clear()` so no cached server data survives a logout.
- `src/api/axiosInstance.ts` — the one axios instance every call uses; attaches the Bearer token and routes 401s to the auth layer.
- `src/config/env.ts` — resolves `API_BASE_URL` (from `EXPO_PUBLIC_API_URL`, else a platform-aware localhost default) and the Cloudinary config.
- `src/utils/secureStore.ts` — `saveJWT` / `getJWT` / `deleteJWT`.
- `src/utils/uploadImage.ts` — shared "compress to WEBP + upload to Cloudinary" used by both the posting screen and the profile-pic hook.

### Data layer (TanStack Query)
The app has **no global app-state library** (no Redux/MobX/Zustand) — that was a deliberate architectural review finding: this app's state is ~95% cached server data, not client-only UI state, so a query-caching layer fits better than a global store. Every data-fetching screen uses `@tanstack/react-query`:
- `src/api/queryClient.ts` — the `QueryClient` singleton (20s default `staleTime`), provided via `QueryClientProvider` in `App.tsx`, which also wires RN's `focusManager` to `AppState` (covers app background↔foreground; React Navigation tab/stack focus is handled per-screen, see below).
- `src/api/queryKeys.ts` — single source of truth for every cache key (`feed`, `post`, `comments`, `myPosts`, `residents`, `resident`, `ordersPlaced`, `ordersReceived`, `order`, `followers`, `following`, `notifications`, `unreadCount`, `myProfile`) — no hand-written key arrays elsewhere.
- `src/api/postsCache.ts` / `src/api/ordersCache.ts` — `patchPostInCache`/`removePostFromCache`/`patchOrderInCache` update a post or order everywhere it's cached (its own entry, every loaded page of the relevant infinite query, `myPosts`) in one call. This is what makes a like, comment, or order-status-change instantly visible on every screen showing that data — e.g. liking a post in `Feed.tsx` updates the same post if it's also open in `PostDetail.tsx`; an order status change from either `Orders.tsx` or `OrderDetail.tsx` updates both.
- `src/hooks/useComments.ts`, `useAddComment.ts`, `useLikePost.ts`, `useUpdateOrderStatus.ts` — shared query/mutation hooks reused verbatim across the screens that touch the same data.
- Lists use `useInfiniteQuery` (feed, residents, orders×2, comments) instead of a hand-rolled pagination hook; `getNextPageParam` uses the same "returned page shorter than page size ⇒ no more pages" heuristic the backend's flat-array-per-page convention requires (no total-count envelope).
- **Focus-refetch**: `useInfiniteQuery`'s `refetch()` re-fetches all currently-loaded pages (not just page 0), so returning to a list after navigating away preserves scroll depth instead of collapsing back to page 1. Feed, Orders, OrderDetail, and the unread-count badge explicitly refetch on screen focus (via `useRefreshOnFocus`, see below); other screens (Residents, PostDetail, OthersProfile, FollowList, MyProfile) rely on the passive `staleTime`.
- `src/hooks/useRefreshOnFocus.ts` — re-runs a callback on React Navigation focus; reads the callback through a ref rather than as a `useFocusEffect` dependency, since React Navigation re-invokes its effect whenever the callback's identity changes while a screen stays focused — a footgun for non-memoized callbacks like Query's `refetch`.

### Navigation flow
```
App.tsx  (wraps everything in <AuthProvider>)
└── AuthNavigator (reads AuthContext; shows a splash until the token check finishes)
    ├── if NOT authed → Stack:
    │     WelcomePage → SignUpStepOne → SignUpStepTwo → SignUpStepThree → signIn(token)
    │     WelcomePage / Login → GoogleSignInButton → signIn(token) or → CompleteGoogleProfile → signIn(token)
    │     Login → signIn(token)
    └── if authed → AppNavigator (bottom tab bar, custom <BottomNavBar/>):
          ├── Feed            → FeedStack: FeedMain (Feed.tsx) → Notifications
          ├── Residents       → ResidentsStack: Wing → ResidentsList → OthersProfile → PostDetail / FollowList
          ├── NewPost         → PostStack: PostingScreen
          ├── Orders          → OrdersStack: OrdersMain (Orders.tsx) → OrderDetail → OthersProfile
          └── Myprofile       → ProfileStack: ProfileMain (MyProfile) → OthersProfile → PostDetail / FollowList
```
`ProfileStack`, `ResidentsStack`, and `OrdersStack` all register `OthersProfile` (same component file, registered under each navigator) so any entry point can push into a user's profile; `ProfileStack`/`ResidentsStack` additionally share `PostDetail`/`FollowList` the same way. This is a deliberate lightweight choice: React Navigation doesn't let sibling tab-stacks share a screen instance, and a full root-level stack refactor wasn't warranted for a handful of shared screens. `Feed` and `Orders` were originally bare tab screens with no stack (couldn't push anywhere) — `FeedStack`/`OrdersStack` were added specifically to enable Notifications and OrderDetail respectively.

### Screens & what they do

**Auth (`src/screens/userAuth/`)**
- `WelcomePage` — logo + Sign Up / Login entry.
- `SignUpStepOne` — full name, email, door number, community (community is hardcoded to "Sobha HRC Prestine, Jakkuru"). Live-checks email isn't already registered via backend.
- `SignUpStepTwo` — set + confirm password (min 6 chars).
- `SignUpstepThree` — auto-generates a suggested `@username`, debounced live uniqueness check, then `registerUser` → `signIn(token)` (auto-login).
- `Login` — Formik + Yup → `loginUser` → `signIn(token)`, plus a `GoogleSignInButton`.
- `google/GoogleSignInButton.tsx` (dropped into both `WelcomePage` and `Login`) — runs the `expo-auth-session` Google OAuth prompt, calls `POST /api/auth/google`; existing identities go straight to `signIn(token)`, new ones navigate to `CompleteGoogleProfile`.
- `google/CompleteGoogleProfile.tsx` — collects/edits the suggested username (same live-uniqueness-check UX as `SignUpstepThree`) + door number (community is the same hardcoded value as `SignUpStepOne`), then `POST /api/auth/google/complete` → `signIn(token)`.

**Main app**
- `Feed.tsx` — `GET /api/posts`, pull-to-refresh, refreshes on focus (so a new post appears), optimistic like toggle (`POST /posts/{id}/like`), a comments modal (`GET/POST /posts/{id}/comments`), a bell icon with unread-count badge (`GET /notifications/unread-count`, refreshes on focus) → `Notifications`, and a cart button that places an order for that post's item from its author, including its price if listed (`POST /api/orders`).
- `Notifications.tsx` (`src/screens/`) — list of notifications (type icon, title/message, unread dot), tap marks as read and navigates to the related content (post detail, profile, or Orders depending on type).
- `residents/Wing.tsx` — lists 5 hardcoded wings; tapping one opens the residents list.
- `residents/Residents.tsx` — `GET /api/residents?wing=`, filters by search box, tap a resident → `OthersProfile`.
- `userProfile/OthersProfile.tsx` — `GET /api/residents/{id}`. Avatar, bio, **Followers**/Posts stats (Followers tappable → `FollowList`), posts grid (tap a post → `PostDetail`), a working **Follow/Following** toggle (`POST`/`DELETE /users/{id}/follow`). Message button is still a placeholder.
- `userProfile/MyProfile.tsx` — merges real data from `GET /api/profile`. Inline-editable **bio**/**hometown** (PATCH), avatar upload → Cloudinary → PATCH, **logout button**, a live posts grid (`GET /posts/user/{me}`) whose edit mode deletes real posts (`DELETE /posts/{id}`, tap a post when not in edit mode → `PostDetail`), and a **Followers** stat → `FollowList`.
- `PostDetail.tsx` (`src/screens/`, shared) — single post view: image, author, like toggle, inline (non-modal) comment list + input, and a delete button shown only when opened with `isOwn: true` (avoids an extra call to determine ownership).
- `FollowList.tsx` (`src/screens/`, shared) — Followers/Following tabs for a given user id; tapping a row opens `OthersProfile`.
- `posting/PostingScreen.tsx` — pick from camera/gallery → `uploadImageToCloudinary` → `POST /api/posts`, with an optional price field (₹, lists the item for sale) and a spinner/error handling. Navigates to Feed, which refreshes on focus.
- `orders/Orders.tsx` — two tabs, both live. **Placed** (`GET /api/orders/placed`) with cancel-if-pending. **Received** (`GET /api/orders/received`) with Accept/Reject/Complete/Cancel (`PATCH /api/orders/{id}/status`). Status colour badges, price/total shown when set. Tapping a card opens `OrderDetail`; tapping the seller/customer name opens `OthersProfile`.
- `orders/OrderDetail.tsx` — product image/name, unit price × quantity = total, a visual status timeline (Placed → Accepted → Completed, or a red terminal badge for Rejected/Cancelled), the counterparty (tappable → profile), note, timestamps, and the same role-aware accept/reject/complete/cancel actions as the list cards.

### Components (`src/components/`)
- `BottomNavBar.tsx` — custom orange (`#FF8C00`) tab bar with SVG icons and an active indicator; center "NewPost" has a circular bordered plus.
- `FeedPostCard.tsx` — a feed post card (avatar, image, like/comment/share/save/cart action bar overlay, description, time).
- `PlacedOrderCard.tsx` / `RecievedOrderCard.tsx` — order cards for the two Orders tabs.

### API layer (`src/api/`)
- `axiosInstance.ts` — the one axios instance every call goes through: Bearer-token interceptor + 401 handler routed to `AuthContext`.
- `queryClient.ts` / `queryKeys.ts` / `postsCache.ts` / `ordersCache.ts` — the TanStack Query data layer, see "Data layer" above.
- `user.ts` — auth (`checkEmailRegistered`, `checkUsernameUnique`, `registerUser`, `loginUser`) + own profile (`fetchMyProfile`, `updateBio`, `updateHometown`, `updateProfilePic`).
- `googleAuth.ts` — `loginWithGoogle(idToken)`, `completeGoogleSignup(idToken, username, doorNumber, community)`.
- `posts.ts` — `fetchFeed`, `fetchPost`, `fetchUserPosts`, `createPost`, `deletePost`, `toggleLike`, `fetchComments`, `addComment`.
- `residents.ts` — `fetchResidents`, `fetchResident` (returns `ResidentProfile` with `posts: PostSummary[]`).
- `orders.ts` — `fetchPlacedOrders`, `fetchReceivedOrders`, `fetchOrder`, `createOrder`, `updateOrderStatus`.
- `follow.ts` — `followUser`, `unfollowUser`, `fetchFollowers`, `fetchFollowing`.
- `notifications.ts` — `fetchNotifications`, `fetchUnreadCount`, `markAsRead`, `markAllAsRead`.
- `src/utils/secureStore.ts` — `saveJWT`/`getJWT`/`deleteJWT`. `src/utils/uploadImage.ts` — shared Cloudinary upload used by posting + the profile-pic hook. `src/utils/currency.ts` — `formatPrice` (₹, trims trailing `.00`). `src/data/myProfile.json` is the only mock file left (supplies the `headerBg` default and avatar fallback).

### Styling
All screen styles live in `src/styles/*.ts` as `StyleSheet` objects (one file per screen); `PostDetail.tsx` and `FollowList.tsx` reuse `feedStyles`/`residentsStyles`/`ordersStyles` rather than adding new style files. Brand colour is orange (`#FF8C00` / `#FFA500`). Icons are SVGs in `assets/icons/` loaded via `react-native-svg-transformer` (see `metro.config.js`, `src/@types/svg.d.ts`).

### Remaining frontend gaps / tech debt
- Follow / Message / Share / Save buttons: **Follow now works**; Message/Share/Save are still placeholders (Message is deliberately deferred — see below).

---

## How to run

**Backend:**
1. Start MySQL locally and create the `zencoo_userdb` database (Hibernate creates the *tables*, but the database itself must exist).
2. Point the app at your DB. Preferred for local dev: create a gitignored `zencoo-backend-main/application.properties` (project root, sibling to `pom.xml`) with just `spring.datasource.password=...` (or whichever fields differ from the committed default `root`/`root`) — Spring Boot auto-merges this over the classpath config, so you never need to set an env var per run. Alternatively set env vars: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. For production also set `JWT_SECRET` (≥ 64 chars) and `CORS_ALLOWED_ORIGINS`.
3. `cd zencoo-backend-main && ./mvnw spring-boot:run` → serves on `:8080`.
4. **No DB? Run the tests:** `./mvnw test` boots the whole app on in-memory H2 and exercises the auth + posts flow — good for verifying changes without MySQL.

**Frontend:**
1. `cd zencoo-frontend-main && npm install`.
2. Set `ANDROID_HOME` (Android SDK location, typically `%LOCALAPPDATA%\Android\Sdk` on Windows).
3. Android emulator: `adb reverse tcp:8080 tcp:8080` and `adb reverse tcp:8081 tcp:8081` (then `localhost` works for both the backend and Metro — more robust than relying on the emulator's LAN-IP auto-discovery, which breaks if the host's IP changes between sessions). Real device: set `EXPO_PUBLIC_API_URL=http://<your-PC-LAN-IP>:8080`.
4. `npx expo start` (or `npm run android` for the first native build / after adding a native dependency). Needs a dev build (`expo-dev-client`) for the native modules (secure-store, image-picker, auth-session, crypto, application, web-browser).
5. **If a fresh native dependency throws `Cannot find native module 'X'` at runtime**: check whether `X` actually landed in the top-level `node_modules/X` — some packages (e.g. `expo-auth-session`'s own dependencies) can get installed *nested* inside another package's `node_modules` instead of hoisted, which Metro resolves fine but Android's native autolinking misses entirely. Fix: `npx expo install <missing-package>` to force it to the top level, then `npx expo prebuild --clean --platform android` and rebuild. (`android/` itself is gitignored/regenerated — any local `local.properties`/`gradle.properties` tweaks need re-adding after a clean prebuild.)

---

## Suggested next steps (if you resume this)

Done so far: ✅ BCrypt + secrets, ✅ persistent login, ✅ centralized API client, ✅ posts/feed + wiring, ✅ posting, ✅ residents + other-user profiles, ✅ orders (place + manage), ✅ My Profile posts grid + delete, ✅ follow system, ✅ dead-code/deps cleanup, ✅ prod hardening (validation, rate limiting, open-in-view), ✅ post-detail screen, ✅ followers/following list screens, ✅ notifications system, ✅ richer ordering (post pricing + order-detail screen), ✅ backend efficiency pass + pagination (feed/residents/comments/orders), ✅ screens folder restructuring, ✅ Google Sign-In (code-complete; password-based accounts live-verified, OAuth handshake itself still needs Cloud Console credentials), ✅ TanStack Query adoption (server-state caching, cross-screen cache sync — now confirmed live, not just typechecked), ✅ **live local environment stood up** (real MySQL + backend + Android emulator, first live end-to-end verification this project has had). Remaining:

1. **Google Sign-In needs one more setup step to go fully live**: Google Cloud Console OAuth client IDs (Web/iOS/Android). Everything else it depends on (DB, backend, emulator) is done.
2. **Manually exercise the rest of the app live**: most of the feature table is H2/typecheck-verified but hasn't yet been clicked through in the running app the way signup/feed/navigation have (posting, orders, follow, notifications, profile editing).
3. **Messaging — DEFERRED TO LAST.** A full secure real-time chat (WhatsApp/Instagram-grade): 1:1/group conversations, persistence, delivery/read receipts, WebSocket transport, and end-to-end encryption (server stores only ciphertext). Its own subproject; the profile "Message" button stays a placeholder until then.

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the current feature-by-feature status dashboard.

---

*Originally recovered 2026-07-05; updated 2026-07-14 after a production-hardening pass, follow/friends system, dead-code cleanup, post-detail/followers-list screens, backend efficiency + pagination pass, screens folder restructuring, Google Sign-In, TanStack Query adoption, and standing up a live local dev environment (MySQL + backend + Android emulator, verified end-to-end). Owner: kedarnath08 (Expo). If details here drift from the code, trust the code.*
