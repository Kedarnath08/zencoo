# Zencoo — Project Status

**Last updated:** 2026-07-06 (follow system, cleanup, prod-hardening, post-detail + followers/following screens)
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
| Place an order (from feed cart) | ✅ | ✅ `POST /api/orders` | **Live** |
| Orders — placed / received lists | ✅ | ✅ `GET /api/orders/{placed,received}` | **Live** |
| Order status flow (accept/reject/complete/cancel) | ✅ | ✅ `PATCH /api/orders/{id}/status` | **Live** |
| Follow (follow/unfollow, follower counts) | ✅ | ✅ `POST/DELETE /api/users/{id}/follow` | **Live** |
| Followers / following lists | ✅ | ✅ `GET /api/users/{id}/followers\|following` | **Live** |
| Post detail (single post, like, comments, delete-if-mine) | ✅ | ✅ `GET /api/posts/{id}` | **Live** |
| Notifications (bell badge + list) | ✅ | ✅ `GET /api/notifications*` | **Live** |
| Messaging | 🔴 placeholder button | 🔴 | **Not built** |
| Google login | 🔴 removed | 🔴 removed | **Dropped** |

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

---

## Verification

- **Backend:** `./mvnw test` — **10 tests pass** on in-memory H2 (register → login(BCrypt) → JWT auth → post → feed → like → comment → get-post-by-id → residents (with post summaries) → order lifecycle & authorization → follow/unfollow & counts → followers/following lists → **notifications (like, comment, follow, order status)** → input validation → auth rate limiting). No MySQL required.
- **Frontend:** `npx tsc --noEmit` — **clean**.
- ⚠️ **Not yet run against a live DB** — the dev machine's MySQL password differs from the committed default and `zencoo_userdb` isn't migrated here yet. Set `DB_PASSWORD` (etc.) and create the database to run for real.

---

## Remaining roadmap

1. **Richer ordering** — a real product/checkout flow (price, product catalog) instead of the minimal "order this post's item" shortcut; an order-detail screen (analogous to the new post-detail screen).
2. **Messaging — DEFERRED TO LAST (biggest, most complex piece).** Must be **secure real-time chat** on par with WhatsApp/Instagram DMs: 1:1 (and later group) conversations, message persistence + delivery/read receipts, real-time transport (WebSocket/STOMP or similar), and **end-to-end encryption** (client-side key management; server stores only ciphertext). This is effectively its own subproject and will be scoped separately once everything above is done. The "Message" button on profiles stays a placeholder until then.

---

## Migration notes

- BCrypt means any users created by the **old plaintext code cannot log in** — they must re-register.
- Usernames are stored with a leading `@`; `/api/profile` returns it as-is, `/api/residents*` strips it (the directory/other-profile screens add their own `@`).
