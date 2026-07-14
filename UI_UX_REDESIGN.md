# Zencoo — UI/UX Audit & Redesign Plan

**Status:** Phase 1 (design system foundation) in progress. This is a living document — update it as phases land.
**Scope:** Visual/interaction design only. No changes to navigation structure, data layer, or backend — see [PROJECT.md](PROJECT.md) for that. Brand colors stay **white + orange**; everything else (spacing, type, shadows, component shapes, motion) is fair game.

---

## How this audit was done

Read every screen's `.tsx` + its `styles/*.ts` file, ran the app live on an emulator (see `PROJECT_STATUS.md` — local MySQL + backend + Android build now working), and screenshotted the auth flow. The findings below are grounded in actual current code, not guesses — file references included so each point is checkable.

---

## Part 1 — What's wrong today

### 1.1 No real design system — values are copy-pasted and drift
`src/theme/colors.ts` exists but is thin (11 tokens) and under-used. Every screen's `styles/*.ts` file re-declares its own hex literals instead of referencing shared tokens, and they drift:

- **Border radius has no scale**: 6, 8, 10, 12, 16, 18, 20, 22, 24, 27, 36, 50 all appear across the app for conceptually similar things (a card is 16px in `ordersStyles.ts` but 22px in `feedStyles.ts`/`FeedPostCard.tsx`; a button is 24px in `signupStyles.ts` but 8px in `ordersStyles.ts`'s action button).
- **Grays have no scale**: `#f0f0f0`, `#f2f2f2`, `#f5f5f5`, `#f9f9f9`, `#F6F7F9`, `#E0E0E0`, `#eee`, `#ddd`, `#bbb`, `#aaa`, `#555`, `#666`, `#333` all appear as one-off neutral colors with no naming or hierarchy.
- **Off-brand colors leak in**: `#007AFF` (iOS system blue) is used for the "Save" button and a back-link in `myProfileStyles.ts` and `residentsStyles.ts` — not orange, not anywhere else in the app, looks like a copy-pasted default that was never swapped. `#e74c3c`/`#c0392b` (a different red than the app's own `colors.danger`) shows up for delete buttons in `myProfileStyles.ts`. `#526797` (a random blue-gray) is the bio text color in `myProfileStyles.ts`. `#ff9800` is a *third* orange, distinct from `colors.primary` (`#FF8C00`) and `colors.primaryLight` (`#FFA500`), used only for search-bar focus.
- **The declared "background" token contradicts the white+orange brief**: `colors.background = "#E5ECF6"` (a cool light blue-gray) is used as the base screen background on Residents, Orders, Notifications, OrderDetail, MyProfile — i.e. a meaningful chunk of the app isn't white at all, it's tinted blue. This is probably the single biggest reason the app doesn't currently *read* as "white and orange."

### 1.2 Duplicate, conflicting styles for the same component
`src/styles/feedStyles.ts` defines a full set of `card`/`avatar`/`actionBar` styles for feed posts — but `Feed.tsx` actually renders posts via `FeedPostCard.tsx`, which has its **own separate, different** inline `StyleSheet` (different avatar size, different action-bar background — `feedStyles.ts` says a light `#FFF7E6` action bar, the component that's actually used renders a dark `rgba(0,0,0,0.22)` overlay instead). Half of `feedStyles.ts` is dead code nobody looked at while iterating on the real component. This kind of drift is very likely present elsewhere too and is itself a maintainability problem, not just a visual one.

### 1.3 Inputs and buttons look dated
Every text input across auth screens (`signupStyles.ts`, `loginStyles.ts`) is a fully-pill-shaped (`borderRadius: 24`, `height: 48`) bordered box with **placeholder text as the only label** — the label disappears the moment you start typing, which is a well-known usability regression (you lose context on long forms, screen readers have a worse time, and it reads as an older, pre-Material-Design-3 / pre-iOS-13 convention). Buttons are the same full-pill shape with a flat single color and a barely-there shadow (`shadowOpacity: 0.15`). Nothing distinguishes primary vs. secondary vs. destructive actions by shape — only by color, and not always consistently (the "Continue with Google" button, "Cancel" buttons, and the pill nav tabs all use different radius/border treatments for what is conceptually the same "secondary button" role).

### 1.4 Weak typographic hierarchy
There's no type scale — font sizes are picked per-screen (13, 14, 15, 16, 17, 18, 20, 22, 40 all appear ad hoc) with no naming (no "heading/body/caption" convention), and the system default font is used everywhere (no custom typeface, which is fine, but combined with inconsistent sizing/weight it makes screens feel flat — e.g. on the Welcome screen the body paragraph and nothing else establishes a size hierarchy against the headline; on Feed, the author name (17-18px bold) and the caption (14-15px regular) are the only two levels of hierarchy on a screen with much denser information than that).

### 1.5 Whitespace is unbalanced, not "generous"
The Welcome screen (see screenshot below) has enormous dead space above the logo and below the footer link — this isn't intentional breathing room, it's `justifyContent: "center"` on a `flex: 1` container with a short amount of content, so the layout just centers a small block in a very tall screen. Compare to Feed/Orders/Residents, which are comparatively dense with tight `marginBottom: 8-18` values between elements and cards. The app swings between "too empty" (auth flow) and "too tight" (list screens) rather than having a deliberate spacing rhythm.

### 1.6 Shadows/elevation are inconsistent and mostly decorative, not hierarchical
Nearly every card/header/button has *some* shadow, but the values are arbitrary per-file (`shadowOpacity` ranges from 0.06 to 0.15 with no logic tying it to z-order or importance) — everything floats at roughly the same visual "height," so shadows add visual noise without adding information (which is what elevation is supposed to communicate: this is above that).

### 1.7 Iconography is mixed-source and inconsistently colored
The app mixes `@expo/vector-icons` (`MaterialCommunityIcons`, `Ionicons`) with hand-drawn custom SVGs (`assets/icons/*.svg` for the bottom nav) and Unicode characters (feed comment modal's close button is a literal `×` glyph in `feedStyles.ts`'s `closeButton` style, not an icon component). Icon colors are hardcoded per-instance (`"#222"`, `"#444"`, `"#888"`, `colors.textMuted`) rather than deriving from a single "icon color" token, so the same conceptual icon (e.g. a back arrow) can render in different grays on different screens (`ScreenHeader`'s default `iconColor` is `colors.textMuted` = `#444`, but `OrderDetail.tsx`'s own back button uses a raw `#444` too, while `MyProfile.tsx`'s uses `#444` yet `Residents.tsx`'s `backBtnText` is `#007AFF` — three different conventions for "go back").

### 1.8 The Welcome/auth screens don't establish the brand
First impression matters most and is currently the weakest part of the app: a centered logo, a paragraph of body text, and two full-width pill buttons on an otherwise empty white screen (see screenshot). There's no illustration, no color moment beyond the orange button, nothing that visually says "Zencoo" beyond the wordmark. For an app whose whole pitch is "hyper-local social + marketplace," the first screen a new resident sees should feel warmer and more specific than a generic auth template.

### 1.9 Forms give weak, late feedback
`SignUpStepOne` only shows a validation error (`"Door Number is required"`, red text below the field) after an invalid submit attempt — there's no inline "this looks good" affirmation as you type (contrast with the username step later in signup, which *does* have a live-checking pattern — so the app knows how to do this well in one place but doesn't apply it consistently). Required fields aren't marked. The community field is pre-filled and displayed as if editable (same border/style as every other input) but is actually a fixed, non-interactive value — nothing communicates "this one's locked" (no disabled styling, no lock icon, no plain-text treatment).

### 1.10 No dark mode, no accessibility pass
Not necessarily in scope for this pass, but worth naming: no `prefers-color-scheme` handling anywhere, no minimum-contrast check done on any color pairing (e.g. `colors.textSecondary` `#888` on `colors.background` `#E5ECF6` is a fairly low-contrast gray-on-light-blue combination), no `accessibilityLabel`s on icon-only buttons (the "..." menu, the cart icon, the send icon in comments, etc.).

---

## Part 2 — Proposed design system

Keep the brand: **white surfaces, orange as the single accent color.** The plan below is a *refinement*, not a rebrand — same colors, disciplined into a real system, applied consistently, with a more current interaction/shape language layered on top.

### 2.1 Color tokens (replaces `src/theme/colors.ts`)

```
Brand
  primary        #FF8C00   (unchanged — main orange, buttons/active states/links)
  primaryDark     #E67A00   (new — pressed states, on-brand emphasis text)
  primaryTint     #FFF3E0   (new — replaces #FFF7E6/#FFECD9-style ad hoc tints;
                              used for subtle highlight backgrounds — selected
                              tab pill, badges, the feed action bar, etc.)

Neutrals (replaces the ~13 ungoverned grays)
  ink900         #1A1A1A   (primary text — slightly softer than pure #222)
  ink600         #6B7280   (secondary text — replaces #888/#7B8CA6/#B0B0B0 etc.)
  ink400         #9CA3AF   (tertiary/placeholder text, disabled)
  line           #E8E8EC   (hairline borders — replaces #E0E0E0/#ddd/#eee)
  surface        #FFFFFF   (cards, inputs, sheets)
  canvas         #FAFAFA   (screen background — replaces #E5ECF6 everywhere;
                              this single change is what makes the app read as
                              "white" instead of "light blue")

Status (unify with StatusBadge's existing STATUS_COLORS map, no change needed
  to the semantics, just the exact hex — reuse across the app instead of
  each screen inventing its own red/green)
  success        #2E9E5B   (was colors.success #43A047 — kept close, tuned)
  danger         #E5484D   (was colors.danger #F44336 / the stray #e74c3c/#c0392b
                              pair in myProfileStyles.ts — all three collapse to one)
  warning        #F5A524   (new — currently nothing fills this role; PENDING
                              status today reuses success-green, which reads as
                              "already accepted" at a glance — a real amber for
                              PENDING is a UX fix, not just a palette fix)
```

No blue anywhere (removes the stray `#007AFF`, `#526797`). No second/third orange (removes `#ff9800`, `primaryLight` gets folded into `primaryDark`/`primaryTint` usage instead of being a second ambiguous brand shade).

### 2.2 Type scale (new `src/theme/typography.ts`)

A named scale, used via a small `<Text variant="...">` wrapper (or plain style objects if a wrapper component feels like overkill) rather than picking a raw `fontSize` per screen:

```
display   28 / bold     — Welcome-screen headline only
title     20 / bold     — screen headers (ScreenHeader title, "Orders", etc.)
heading   17 / semibold — card titles, section headers ("POSTS"), names
body      15 / regular  — primary readable content (captions, bios)
label     13 / medium   — form labels, stat numbers' labels, tab text
caption   12 / regular  — timestamps, counts, helper text
```

### 2.3 Spacing & radius scale

```
space:  4, 8, 12, 16, 24, 32, 48   (an 8-based scale; today's values like
                                     6, 10, 14, 18, 22, 26 all round to one
                                     of these)
radius: sm 8, md 12, lg 16, xl 24, pill 999
  — sm: chips/small icon buttons
  — md: inputs, secondary buttons, small images (avatars use pill)
  — lg: cards (unifies the 16-vs-22 split)
  — xl: sheets/modals, the Welcome screen's big illustration area
  — pill: primary buttons, avatars, status badges, tab selectors
```

### 2.4 Elevation

Three levels only, tied to actual meaning instead of per-file guesswork:

```
flat      no shadow           — inline content, list rows on a card background
raised    shadowOpacity 0.06, radius 8, offset (0,2), elevation 2   — cards
floating  shadowOpacity 0.12, radius 16, offset (0,6), elevation 6  — app bar,
                                                                       bottom nav,
                                                                       modals/sheets
```

### 2.5 Component patterns (the actual reusable pieces to build/rebuild)

- **`Button`** — primary (solid orange, `radius.pill`), secondary (white bg + orange 1.5px border + orange text — replaces the borderless "Continue with Google" pattern with something reusable), destructive (danger color, same shape), all with a real pressed state (opacity/scale, not just relying on OS default touch feedback) and a loading state built in (spinner replaces label, doesn't reflow the button).
- **`TextField`** — floating/persistent label above the input (not placeholder-as-label), `radius.md` (not full pill — pill-shaped multi-line-capable inputs is where the dated look comes from most directly), clear focus ring in `primaryTint`, inline validation message + a subtle success checkmark state (reuse the pattern `SignUpstepThree`'s username check already proves out), a distinct visually-locked/disabled appearance (gray fill, no border, small lock icon) for things like the fixed community field.
- **`Card`** — one shared card primitive (`radius.lg`, `elevation.raised`, `surface` background) used everywhere a card currently gets hand-rolled per screen (Feed post, order row, resident row, wing tile) instead of four near-identical-but-different `StyleSheet` blocks.
- **`Avatar`** — extend the existing `Avatar.tsx` to own its sizing via a `size="sm"|"md"|"lg"` prop instead of every screen passing its own ad hoc `{width, height, borderRadius}` style object (currently 44/48/54/78px versions all exist, unstyled-consistently).
- **`Badge`** (generalizes `StatusBadge`) — pill shape, uses the new status colors including the new `warning` for PENDING.
- Icons: standardize on `Ionicons` as the single icon set for all UI chrome (back arrows, menu dots, action icons) — keep the custom SVGs only for the 5 bottom-nav glyphs, which are already bespoke brand marks, not swappable for a stock icon. Icon color always comes from `ink900`/`ink600`/`primary` — never a raw hex.

### 2.6 Screen-specific notes

- **Welcome/auth**: rebalance vertical rhythm (stop centering a small block in a tall flex container — anchor content to the top third with deliberate spacing instead), add a light `primaryTint` decorative shape/illustration area behind the logo so the screen has *some* color before the button, apply the new `TextField`/`Button` everywhere in the 3-step signup + login, add a step indicator (1/3, 2/3, 3/3) to the signup flow since it's currently unclear how many steps remain.
- **Feed**: reconcile `feedStyles.ts` vs `FeedPostCard.tsx` into one source of truth using the new `Card`; swap the dark `rgba(0,0,0,0.22)` action-bar overlay for the lighter `primaryTint` treatment `feedStyles.ts` originally intended (dark-on-photo overlays read as an Instagram-in-2016 pattern; today's convention is a clean light bar below the image, which also fixes the "white icons on a translucent dark bar" contrast issue for good/bad lighting photos).
- **Orders/Residents**: apply `Card` + the new radius/spacing scale to rows; give PENDING its own `warning` amber instead of reusing green.
- **Profile (My/Others)**: replace the flat `#595554` gray header block with a `primaryTint`-to-white gradient or a simple warm neutral that ties back to the brand instead of an unrelated dark gray; unify avatar sizing via the extended `Avatar` component.
- **Bottom nav**: keep the general shape (solid orange bar, center plus button) — it's actually one of the more distinctive, on-brand pieces already — just tidy the active-indicator/icon-color consistency against the new tokens.

---

## Part 3 — Phased implementation plan

Each phase should ship independently and be typecheck-clean (`npx tsc --noEmit`) before moving to the next — same discipline as the TanStack Query migration.

1. **Design system foundation** *(current phase)* — rewrite `src/theme/colors.ts` into the token set above, add `src/theme/typography.ts` and `src/theme/spacing.ts`, build the shared primitives (`Button`, `TextField`, `Card`, extend `Avatar`, generalize `StatusBadge`→`Badge`). No screens change yet — this phase is additive/foundational only, verifiable by the app still looking identical (old styles untouched) plus the new pieces existing and typechecking.
2. **Auth flow** (`WelcomePage`, `Login`, `SignUpStepOne/Two/Three`, `CompleteGoogleProfile`) — highest-visibility, most self-contained flow; swap in the new primitives, fix the vertical-rhythm/whitespace issue, add the step indicator.
3. **Feed** (`Feed.tsx`, `FeedPostCard.tsx`, comments modal) — reconcile the duplicate-styles problem, apply `Card`, fix the action-bar treatment.
4. **Orders + Residents** (list/card-heavy screens, share the most patterns) — apply `Card`, new status colors including `warning`.
5. **Profile screens** (`MyProfile`, `OthersProfile`, `FollowList`, `PostDetail`, `Notifications`) — apply remaining primitives, fix the profile header treatment.
6. **Sweep pass** — grep for remaining raw hex literals / ad hoc radii across `src/styles/*.ts` and component-local `StyleSheet.create` calls, migrate stragglers, delete now-dead style blocks (starting with `feedStyles.ts`'s superseded card/avatar/action-bar entries).

---

## Non-goals

- No navigation/IA changes (tab structure, stack composition stay as-is).
- No new dependencies unless something in Phase 1 genuinely can't be done with what's already installed (expect none needed — this is `StyleSheet`/token work, not a UI-kit swap).
- No behavior changes to data flow — this sits entirely in `src/theme/`, `src/components/`, and `src/styles/*.ts` / screen JSX presentation, not `src/api/`, `src/hooks/`, or navigation.
