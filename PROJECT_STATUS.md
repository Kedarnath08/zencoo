# Zencoo — Project Status

**Last updated:** 2026-07-08 (backend efficiency pass + pagination, screens folder restructuring, Google Sign-In)
**Scope of this doc:** a living status dashboard — what's done, what's live vs mock, what's next. For the full architectural overview see [PROJECT.md](PROJECT.md).

Legend: ✅ done & backend-wired · 🟡 UI done, still on mock data · 🔴 not built / placeholder

---

## Feature status

| Feature | Frontend | Backend | Status |
|---|---|---|---|
| Sign up (multi-step) | ✅ | ✅ auto-login, returns JWT | **Live** |
| Login | ✅ | ✅ BCrypt + JWT | **Live** |
| Persistent login / auto-logout | ✅ AuthContext | ✅ JWT validate | **Live** |
| Logout | ✅ profile button | ✅ | **Live** |
| My profile (view/edit bio, hometown, avatar) | ✅ | ✅ `/api/profile*` | **Live** |
| Feed (list) | ✅ | ✅ `GET /api/posts` | **Live** |
| Likes | ✅ optimistic | ✅ toggle endpoint | **Live** |
| Comments | ✅ modal | ✅ list/add endpoints | **Live** |
| Create post (image upload) | ✅ | ✅ Cloudinary → `POST /api/posts` | **Live** |
| Residents directory (by wing) | ✅ | ✅ `GET /api/residents` | **Live** |
| Other user's profile | ✅ | ✅ `GET /api/residents/{id}` | **Live** |
| Profile posts grid (own & others) | ✅ | ✅ `GET /posts/user/{id}` | **Live** |
| Delete own posts (profile edit mode) | ✅ | ✅ `DELETE /posts/{id}` | **Live** |
| Post pricing (optional "list for sale" price) | ✅ posting screen + price tag | ✅ `Post.price` | **Live** |
| Place an order (from feed cart, price snapshotted) | ✅ | ✅ `POST /api/orders` | **Live** |
| Orders — placed / received lists | ✅ | ✅ `GET /api/orders/{placed,received}` | **Live** |
| Order detail screen (timeline, price, actions) | ✅ | ✅ `GET /api/orders/{id}` | **Live** |
| Order status flow (accept/reject/complete/cancel) | ✅ | ✅ `PATCH /api/orders/{id}/status` | **Live** |
| Follow (follow/unfollow, follower counts) | ✅ | ✅ `POST/DELETE /api/users/{id}/follow` | **Live** |
| Followers / following lists | ✅ | ✅ `GET /api/users/{id}/followers\|following` | **Live** |
| Post detail (single post, like, comments, delete-if-mine) | ✅ | ✅ `GET /api/posts/{id}` | **Live** |
| Notifications (bell badge + list) | ✅ | ✅ `GET /api/notifications*` | **Live** |
| Messaging | 🔴 placeholder button | 🔴 | **Not built — deferred to last** |
| Google Sign-In | ✅ button + onboarding screen | ✅ `POST /api/auth/google*` | **Built, needs Cloud Console credentials to actually run** |

---

## Completed work log

### Production-hardening pass (Phases 1–6)
1. **Backend security** — BCrypt password hashing; removed credential logging; JWT secret, DB creds & CORS origins externalized to env vars.
2. **Persistent login** — new `AuthContext` (auto-login from stored JWT, auto-logout on any 401, `signIn`/`signOut`); boot splash; logout button. `/register` now returns a JWT.
3. **Centralized API client** — `axiosInstance` with Bearer interceptor + 401 handling; env-driven, platform-aware base URL; removed all hardcoded `localhost:8080`.
4. **Feed/posts backend** — `Post` / `PostLike` / `PostComment` entities, repositories, `PostService` (ownership checks), `PostController`; Feed screen wired live (like/comment/refresh).
5. **Posting** — pick image → compress/upload to Cloudinary → `POST /api/posts`; Feed refreshes on focus.
6. **Audit & fixes** — global exception handler (consistent `{message}` JSON); auth input normalization; CORS now allows `PATCH`; fixed a native crash (`window.confirm`); modernized `JwtUtil` (raw-UTF-8 HMAC key, fixing a Base64-secret landmine); `User.createdAt` now populates; H2 integration test suite.

### Residents domain
- Backend: `ResidentDto` / `ResidentProfileDto`, `ResidentService` (maps `User`→resident, derives wing from door number, strips stored `@`, pulls real posts, excludes self), `ResidentController` (`GET /api/residents?wing=`, `GET /api/residents/{id}`).
- Frontend: `src/api/residents.ts`; `Residents.tsx` now fetches per-wing from the backend (with loading state, removed debug logs); `OthersProfile.tsx` now fetches by id and renders Cloudinary URLs (loading + not-found states).
- Test: `residentsDirectoryExcludesSelfAndDerivesWing` added to the integration suite.

### Orders domain (this session)
- Backend: `OrderStatus` enum (PENDING/ACCEPTED/REJECTED/COMPLETED/CANCELLED), `Order` entity (buyer, seller, product, quantity, note, status, created/updated), `OrderRepository`, `OrderDto`, `OrderService` (create with validation, placed/received lists, **role-aware status transitions**), `OrderController` (`GET /orders/placed`, `GET /orders/received`, `POST /orders`, `PATCH /orders/{id}/status`).
  - Rules: seller does PENDING→ACCEPTED/REJECTED and ACCEPTED→COMPLETED/CANCELLED; buyer does PENDING→CANCELLED; can't order from yourself; strangers get 403; terminal states are final.
- Frontend: `src/api/orders.ts`; `Orders.tsx` fully backend-driven (loads on focus, sorts, wires accept/reject/complete/cancel); `PlacedOrderCard`/`ReceivedOrderCard` consume the DTO and render Cloudinary images + formatted timestamps.
- **Create flow**: the feed post's cart button now places an order for that post's item from its author (`Feed.tsx` → `createOrder`), giving a full place→manage lifecycle. (The old `placedOrders.json`/`recievedOrders.json` mocks are now unused.)
- Test: `orderLifecycleAndAuthorization` added to the integration suite.

### My Profile posts grid
- `MyProfile.tsx` now loads the user's real posts via `GET /api/posts/user/{me}` (renders Cloudinary images, real post count), and the edit-mode "delete" now actually deletes via `DELETE /api/posts/{id}` (multi-select, with a spinner). Selection is tracked by post id.

### Follow system (this session)
- Backend: `Follow` entity (asymmetric follower→following, unique pair), `FollowRepository`, `FollowService`, `FollowController` (`POST` / `DELETE /api/users/{id}/follow`, idempotent, can't follow yourself). Follow data added to profiles: `ResidentProfileDto` now returns `followersCount` / `followingCount` / `followedByMe`; `UserProfileDto` (own profile) returns `followersCount` / `followingCount`.
- Frontend: `src/api/follow.ts`; `OthersProfile.tsx` Follow button now toggles Follow/Following against the backend and updates the count live; the profile stat is now real **Followers** (both OthersProfile and MyProfile — replaces the old hardcoded "Friends").
- Test: `followAndUnfollowUpdatesCounts` added (follow → idempotent → counts on both profiles → unfollow → self-follow guard).

### Cleanup pass
- Deleted dead mock JSON (`feed`, `residents`, `placedOrders`, `recievedOrders`, `othersProfiles`, `users`) — only `myProfile.json` remains (still supplies `headerBg` default + avatar fallback).
- Removed unused deps `firebase`, `expo-auth-session`, `expo-random`, `expo-crypto`, `expo-web-browser` (leftovers from the abandoned Google login) and dropped `expo-web-browser` from the Expo plugins.

### Post detail + followers/following screens (this session)
- Backend:
  - **`GET /api/posts/{postId}`** — fetch a single post (same `PostDto` shape as the feed), 404 if missing. Used to open a post from any grid.
  - **`ResidentMapper`** — extracted the `User`→`ResidentDto` mapping (wing derivation, `@`-stripping) out of `ResidentService` into a shared package-private util, so `FollowService` can reuse it without duplicating logic or creating a circular dependency.
  - **`ResidentProfileDto.posts`** changed from `List<String>` (bare image URLs) to `List<PostSummaryDto>` (`{id, imageUrl}`) — needed so profile grids can navigate to a specific post's detail view, not just display its image.
  - **`GET /api/users/{id}/followers`** / **`GET /api/users/{id}/following`** — new `FollowListController`, backed by two new `FollowRepository` queries (`findByFollowingIdOrderByCreatedAtDesc` / `findByFollowerIdOrderByCreatedAtDesc`) and `FollowService.getFollowers/getFollowing`, returning lists of `ResidentDto`.
- Frontend — **navigation architecture change**: `MyProfile` was a bare tab screen with no stack, so it couldn't push new screens. Added a new **`ProfileStack`** (`ProfileMain` → `MyProfile`, plus `OthersProfile`, `PostDetail`, `FollowList`) and pointed the `Myprofile` tab at it instead of the screen directly. `ResidentsStack` also got `PostDetail`/`FollowList` added (screens are duplicated by name across the two stacks — same component files — since React Navigation doesn't share screens cross-stack; this is a deliberate lightweight choice over a full root-stack refactor).
  - New `src/screens/PostDetail.tsx` — image, author, like toggle, inline (non-modal) comment list + input, and a delete button shown only when the caller passes `isOwn: true` (avoids an extra API call to figure out post ownership).
  - New `src/screens/FollowList.tsx` — Followers/Following tabs (reusing `ordersStyles` tab chrome and `residentsStyles` row styling for visual consistency), tapping a row opens `OthersProfile`.
  - Wired: `MyProfile`'s Followers stat + post grid taps; `OthersProfile`'s Followers stat + post grid taps.
  - `src/api/posts.ts` gained `fetchPost`; `src/api/follow.ts` gained `fetchFollowers`/`fetchFollowing`; `src/api/residents.ts`'s `ResidentProfile.posts` is now `PostSummary[]`.
- Tests: extended `fullAuthAndPostLifecycle` (fetch-by-id + 404) and `followAndUnfollowUpdatesCounts` (followers/following list contents, including the empty-list and post-unfollow-removal cases).

### Prod-hardening pass
- **Bean validation**: added `spring-boot-starter-validation` and typed request DTOs (`RegisterRequest`, `LoginRequest`, `CreatePostRequest`, `CommentRequest`, `CreateOrderRequest`, `UpdateOrderStatusRequest`) with `@NotBlank`/`@Email`/`@Size`/`@Min`/`@NotNull`; controllers now bind `@Valid` typed bodies instead of raw `Map`s. `GlobalExceptionHandler` maps validation failures to `400 {message}`. (Frontend JSON contract unchanged.)
- **`spring.jpa.open-in-view=false`** — lazy access now stays inside the service transactions (all DTO mapping already does), failing fast on misuse instead of silently opening a session per request.
- **Auth rate limiting**: `RateLimitFilter` — in-memory fixed-window per-IP limiter on `/api/auth/login` + `/api/auth/register` (configurable via `AUTH_RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_WINDOW`, default 10/60s), returns `429 {message}`. Noted as single-instance; swap for Redis/gateway in multi-instance prod.
- Tests: `registrationValidationRejectsBadInput` + a dedicated `RateLimitTests` (4th login in-window → 429).

### Notifications system (this session)
- Backend:
  - **`Notification` entity** (id, userId FK, type enum, relatedId, title, message, isRead, createdAt).
  - **`NotificationService`** with CRUD + `getUnreadCount`, triggered automatically when:
    - Post is liked (excludes author)
    - Comment added (excludes author)
    - User followed
    - Order status changes (ACCEPTED/REJECTED/COMPLETED/CANCELLED)
  - **`NotificationController`** (`GET /api/notifications`, `/unread-count`, `PUT /{id}/read`, `/mark-all-read`).
  - Integrated into `PostService`, `FollowService`, `OrderService` — each triggers notifications on relevant events.
  - Test: `notificationsTriggeredByPostLikeCommentFollowAndOrderStatus` verifies all types, self-notifications excluded, mark-as-read works.
- Frontend:
  - **`NotificationsScreen`** — list of notifications with unread state, type icons (heart/comment/person-add/cart), swipe-to-read, tap to navigate to related content (post detail, user profile, orders).
  - **`FeedStack`** — new stack navigator (replaces bare Feed tab) containing Feed + Notifications for proper navigation.
  - **Bell icon** in Feed header with red **unread count badge** — tap navigates to Notifications, count refreshes on tab focus.
  - Reuses existing app colors/styles (orange #FF8C00 for primary, red for likes, gray for others).

### Richer ordering (this session)
- Backend:
  - **`Post.price`** (optional `BigDecimal`) — a post can be listed for sale; `CreatePostRequest`/`PostDto` carry it through (`@DecimalMin(0)`).
  - **`Order.unitPrice`** — snapshotted from the post's price at order-creation time (defaults to 0 if omitted), so later price edits on the post don't rewrite past orders. `OrderDto` adds `unitPrice` + a computed `totalPrice` (`unitPrice × quantity`).
  - **`GET /api/orders/{orderId}`** — single order detail, authorized to buyer/seller only (403 for anyone else, 404 if missing).
  - Test: `postPriceFlowsIntoOrderAndOrderDetailIsAuthorized` (price on post → snapshotted on order → total computed → detail endpoint authorization → 404 for missing order).
- Frontend:
  - **Posting screen** gained an optional price field (₹, numeric, validated non-negative); **`FeedPostCard`** shows a price tag overlay on the image when set; `Feed.tsx`'s order confirmation includes the price and passes it through to `createOrder`.
  - **`OrderDetail.tsx`** (new) — product image/name, price × qty = total, a visual status timeline (Placed → Accepted → Completed, or a red terminal badge for Rejected/Cancelled), counterparty (buyer/seller) tappable to their profile, note, timestamps, and role-aware accept/reject/complete/cancel actions.
  - **`OrdersStack`** (new) — replaces the bare `Orders` tab screen (was previously unable to push new screens) with `OrdersMain` + `OrderDetail` + `OthersProfile`.
  - `Orders.tsx` order cards are now tappable (→ `OrderDetail`); the seller/customer name links, previously unwired no-ops, now navigate to `OthersProfile`.

### Codebase cleanup / best-practices audit (this session)
A full pass over both codebases for dead code, N+1 queries, and consistency issues, prompted by a direct ask to check standard practices:
- **N+1 query fix**: `PostService.getFeed`/`getUserPosts` previously ran 3 queries *per post* (like count, comment count, liked-by-me). Now batched via new `countByPostIdIn`/`findLikedPostIds` repository queries — O(1) queries regardless of feed size instead of O(3n+1).
- **`NotificationService.markAllAsRead`** now does a single bulk `UPDATE` instead of loading every notification into memory to filter+resave.
- **`CustomUserDetails.getAuthorities()`** was returning `null` (violates the `UserDetails` contract, latent NPE risk) — now returns `Collections.emptyList()`.
- **`UserProfileController`** was building the same `UserProfileDto` by hand 3 times and taking raw `Map<String,String>` bodies (no validation — an oversized bio could 500 instead of a clean 400). Added `UpdateBioRequest`/`UpdateHometownRequest`/`UpdateProfilePicRequest` (`@Valid`, size-capped) and a shared `toDto` helper in `UserProfileService`; this also fixed a real bug where `followersCount`/`followingCount` came back as 0 on the update responses (the manual DTO reconstruction never set them).
- **Dead code removed**: `GoogleTokenVerifier.java` (fully commented out) + the commented Google-login block in `AuthController`; unused frontend files `navigation/types.ts` and `structure.txt` (a stale directory dump referencing files deleted long ago); unused npm deps `react-native-tab-view`, `@react-native-picker/picker`, `react-native-vector-icons` (app uses `@expo/vector-icons`).
- **Consistency fix**: `ResidentsStack`/`ProfileStack` required 4 extra `OthersProfile` params (`displayName/username/wing/door`) that the screen never reads (it refetches by id) — now matches `FeedStack`/`OrdersStack`'s `{id}`-only shape; the two call sites (`Residents.tsx`, `FollowList.tsx`) simplified to match.
- Stray leftover comments (`// <-- add this`, `// <-- FIXED`, etc.) cleaned up across both codebases.
- **Flagged but intentionally not changed**: the repeated `if (userId == null) return 401` boilerplate in every controller (technically unreachable — Spring Security already blocks unauthenticated requests upstream — but harmless and touching all 7 controllers wasn't worth the blast radius); heavy `any` typing on navigation props in the auth-flow screens and `MyProfile.tsx` (a real gap, but a bigger separate refactor); the committed dev-default JWT secret / DB `root`/`root` password (already documented as "override in production").
- Verified: 11/11 backend tests still pass, frontend typechecks clean — no behavior changes, only internal cleanup.

### Backend efficiency pass + pagination (this session)
A follow-up audit specifically on backend efficiency/standards, then an explicit ask to add pagination to the four unbounded list endpoints:
- **N+1 fixes**: `ResidentService` previously loaded *all* users via `findAll()` and filtered by wing in Java — replaced with `UserRepository.findResidents(currentUserId, wing, Pageable)` filtering at the DB level (`SUBSTRING(u.doorNumber, 1, 1) = :wing`). `FollowRepository`'s followers/following queries lazy-loaded each `follower`/`following` individually — added `JOIN FETCH`.
- **Pagination added to all four unbounded endpoints** (feed, residents directory, post comments, orders placed/received), backend + frontend:
  - Backend: `PostRepository.findAllByOrderByCreatedAtDesc`, `PostCommentRepository.findByPostIdOrderByCreatedAtAsc`, `UserRepository.findResidents`, `OrderRepository.findByBuyerId.../findBySellerId...` all now return `Page<T>` from a `Pageable`, each with an explicit `countQuery` alongside its `JOIN FETCH` (required — without it Spring Data falls back to counting via the fetch-joined query, which double-counts). `PostService`/`ResidentService`/`OrderService` build `PageRequest.of(page, size)`; `PostController`/`ResidentController`/`OrderController` gained `page`/`size` query params (defaults `0`/`20`), reusing the response-shape convention already established by `Notifications`.
  - Frontend: new generic `usePaginatedList<T>` hook (`items`, `loading`, `refreshing`, `loadingMore`, `hasMore`, `reset()`, `loadMore()`) wired into `Feed.tsx`, `Residents.tsx`, `Orders.tsx` (used twice — placed + received, sharing one error alert), and `PostDetail.tsx`'s comment list — all four now infinite-scroll instead of loading an unbounded list up front.
- Tests: `residentsDirectoryWingFilterMatchesOnlyThatWing`, `residentsDirectoryIsPaginated`, `feedIsPaginated`, `commentsArePaginated`, `ordersArePaginated` added (11 → 16).

### Screens folder restructuring (this session)
The user flagged that `screens/` was inconsistent — some multi-concern screens lived in their own subfolder (`posting/`, `residents/`), others sat loose at the top level (`Feed.tsx`, `FollowList.tsx`, `Notifications.tsx`, `Orders.tsx`, `OrderDetail.tsx`...) with no clear rule. Fixed via a scoped reorg (not a full restructure — single-file screens stay flat):
- `Orders.tsx` + `OrderDetail.tsx` → grouped into new `screens/orders/` (they're one feature, always navigated together).
- `screens/residents/wings/Wing.tsx` → flattened to `screens/residents/Wing.tsx` (the `wings/` subfolder held only one file).
- All moves done via `git mv` to preserve rename history; import paths in the moved files and in `OrdersStack.tsx`/`ResidentsStack.tsx` updated to match.

### Google Sign-In (this session)
Implemented from scratch in a dedicated `com.zencoo.google` backend package and `screens/userAuth/google/` frontend folder, kept fully separate from the existing password-based `AuthController`/`AuthService` (a prior, non-functional attempt at this had been found commented-out and deleted during the earlier cleanup pass).
- Backend: `User.googleId` (nullable, unique) + `UserRepository.findByGoogleId`; `GoogleTokenVerifier` wraps `GoogleIdTokenVerifier` (from the new `com.google.api-client` dependency) to validate a Google ID token's signature/issuer/audience/expiry against `google.oauth.client-ids` (comma-separated, env-driven — empty by default, so the endpoint fails closed until the user configures real client IDs); `GoogleAuthService` — `POST /api/auth/google` looks up by `googleId`, falling back to matching-verified-email accounts (auto-linking a Google identity to an existing password account, since Google already verified the email), returning a JWT if matched or `{isNewUser:true, email, fullName, suggestedUsername}` if not; `POST /api/auth/google/complete` re-verifies the token server-side (never trusts client-supplied identity fields) and creates the account (`passwordHash: null`) once username + door number are supplied. Both endpoints already covered by the existing `"/api/auth/**".permitAll()` rule — no `SecurityConfig` change needed.
- Frontend: `expo-auth-session` + `expo-web-browser` (PKCE-based Google OAuth); `GoogleSignInButton` (dropped into both `WelcomePage.tsx` and `Login.tsx`) handles the OAuth prompt and calls the backend; new-user responses navigate to `CompleteGoogleProfile.tsx` (reuses the existing username-uniqueness-check UX from `SignUpstepThree.tsx` + the fixed community value from `SignUpStepOne.tsx`) to collect the door number before the account is created. `AuthContext` needed zero changes — it already just accepts a JWT string regardless of source.
- Tests: new `GoogleAuthTests.java` (5 tests, mocking `GoogleTokenVerifier` since real Google tokens can't be minted in tests) — new-identity suggests a username without creating an account, invalid token → 401, completing registration creates a working account, taken username is rejected, an existing password account with a matching verified email gets auto-linked. (16 → 21).
- ⚠️ **Not live-testable yet** — needs the user's own Google Cloud Console OAuth client IDs (Web/iOS/Android) and a running MySQL instance, both explicitly deferred to a later step by the user.

---

## Verification

- **Backend:** `./mvnw test` — **21 tests pass** on in-memory H2 (register → login(BCrypt) → JWT auth → post → feed(paginated) → like → comment(paginated) → get-post-by-id → residents(paginated, wing filter) → order lifecycle & authorization → orders(paginated) → follow/unfollow & counts → followers/following lists → notifications (like, comment, follow, order status) → post pricing → order snapshot/total → order-detail authorization → input validation → auth rate limiting → **Google Sign-In (new identity, invalid token, complete registration, taken username, account linking)**). No MySQL required.
- **Frontend:** `npx tsc --noEmit` — **clean**.
- ⚠️ **Not yet run against a live DB** — the dev machine's MySQL password differs from the committed default and `zencoo_userdb` isn't migrated here yet. Set `DB_PASSWORD` (etc.) and create the database to run for real. The user plans to set up a fresh local MySQL instance next, which will also unblock live Google Sign-In testing.

---

## Remaining roadmap

1. **Google Sign-In — needs manual setup before it can be tested live**: a Google Cloud Console OAuth consent screen + 3 client IDs (Web/iOS/Android — Android needs the app's package name and a SHA-1 keystore fingerprint), fed into `GOOGLE_OAUTH_CLIENT_ID_WEB/IOS/ANDROID` (frontend) and `GOOGLE_OAUTH_CLIENT_IDS` (backend). Also needs the fresh local MySQL instance the user is setting up.
2. **Messaging — DEFERRED TO LAST (biggest, most complex piece).** Must be **secure real-time chat** on par with WhatsApp/Instagram DMs: 1:1 (and later group) conversations, message persistence + delivery/read receipts, real-time transport (WebSocket/STOMP or similar), and **end-to-end encryption** (client-side key management; server stores only ciphertext). This is effectively its own subproject and will be scoped separately once everything above is done. The "Message" button on profiles stays a placeholder until then.

---

## Migration notes

- BCrypt means any users created by the **old plaintext code cannot log in** — they must re-register.
- Usernames are stored with a leading `@`; `/api/profile` returns it as-is, `/api/residents*` strips it (the directory/other-profile screens add their own `@`).
