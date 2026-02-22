# Architectural Decisions

This document captures the key technical decisions made during implementation, the reasoning behind each choice, and the trade-offs considered. It is intended for evaluators reviewing the codebase.

---

## 1. Framework: Next.js 16 App Router

**Decision:** Use Next.js 16 with the App Router (not Pages Router).

**Reasoning:** The App Router is the current production standard. It enables Server Components by default, keeps client JS to a minimum, and provides file-based routing with async `params` resolution. The feed and post detail pages are thin server wrappers that delegate rendering to `features/` client components — this keeps the routing layer clean and makes the feature logic independently testable.

**Trade-off:** The App Router requires careful boundary management between Server and Client Components. Passing functions (e.g., render-prop fallbacks) across the boundary is not allowed — solved with a `'use client'` wrapper (`PostDetailErrorBoundary`).

---

## 2. State Management: Redux Toolkit + RTK Query

**Decision:** Use Redux Toolkit for local UI state and RTK Query for all API interactions.

**Reasoning:**
- RTK Query eliminates boilerplate for loading/error states, caching, and deduplication. Each `useGetXQuery` call for the same args returns from cache after the first fetch.
- A single `createApi` instance (`baseApi`) with `injectEndpoints` per feature enables code splitting without duplicating the base query config.
- Redux slice (`feedSlice`) holds UI-only state: accumulated posts across pages, scroll position, and real-time new posts. This state does not belong in RTK Query cache because it is accumulated across multiple paginated requests.

**Trade-off:** Redux adds boilerplate compared to React Query or SWR. For a project of this size, React Query would be simpler — but Redux was chosen to demonstrate familiarity with the full RTK ecosystem.

---

## 3. Architecture: Feature-First (Screaming Architecture)

**Decision:** Organise code by feature (`features/feed`, `features/post`, `features/users`), not by type (`components/`, `hooks/`, `utils/`).

**Reasoning:** Feature-first colocation makes it immediately clear what each folder is responsible for. Tests live next to the code they test. Moving or deleting a feature means deleting one folder. `shared/` is reserved for genuinely cross-feature utilities (used by 2+ features).

**Trade-off:** Barrel exports (`index.ts`) require discipline to avoid circular imports. Features import from `@/shared` and from each other only via their public barrel.

**Known exception:** `shared/lib/store.ts` imports `feedReducer` directly from `@/features/feed/slice` — Redux requires the reducer at store configuration time, before any component tree renders. Exporting reducers from feature barrels would be unconventional. This is the only case where `shared` has a direct dependency on a feature internals.

---

## 4. Styling: Tailwind CSS v4 (CSS-first config)

**Decision:** Use Tailwind v4 with `@theme inline` in `globals.css` instead of `tailwind.config.js`.

**Reasoning:** Tailwind v4 eliminates the config file and uses CSS custom properties as the source of truth for design tokens. Tokens defined in `:root` are exposed to utility classes via `@theme inline`. This keeps the entire design system in one place (`globals.css`) and avoids a separate build step for config.

**Trade-off:** Multi-word animation token names (e.g., `new-post-enter`) do not map reliably to utility classes in Tailwind v4. CSS animations were applied via direct classes (`.new-post-enter { animation: ... }`) rather than `@theme inline` tokens.

---

## 5. Infinite Scroll: IntersectionObserver over scroll events

**Decision:** Use `IntersectionObserver` on a sentinel `<div>` at the bottom of the list to trigger pagination.

**Reasoning:** `IntersectionObserver` is compositor-thread-based — it does not fire on every scroll event and does not cause layout thrashing. A sentinel element at the bottom of the list is observed; when it enters the viewport the next page is requested.

**Trade-off:** `IntersectionObserver` requires a polyfill for very old browsers (not a concern here). In tests, React 19 StrictMode double-invokes effects, causing multiple observer constructions. Solved by storing all callbacks in an array (`intersectionCallbacks.push(cb)`) and calling all of them in integration tests.

---

## 6. Pagination State: Local `useState` accumulation

**Decision:** Accumulate paginated posts in local `useState` (`loadedPosts`) inside `FeedList`, not in Redux.

**Reasoning:** Pagination state is view-local — it resets when the user navigates away and returns. Storing it in Redux would require explicit reset logic on unmount. The accumulation happens in the `handleLoadMore` callback (not in an effect) to avoid stale closure issues.

**Trade-off:** If the user navigates to a post detail and back, the feed re-fetches from page 1. Scroll position is preserved via Redux (`scrollPosition`), but the full post list is not. This is the expected behaviour for the scope of this project.

---

## 7. Real-Time Simulation: setInterval + POST /posts/add

**Decision:** `useNewPostSimulator` fires every 8 seconds, calls `POST /posts/add` on dummyjson, and dispatches `addNewPost` to the Redux slice.

**Reasoning:** The challenge requires simulating real-time post arrival. A `setInterval` is the simplest approach that demonstrates the concept without WebSocket infrastructure. The hook is self-contained, cleans up on unmount, and guards against dispatch after unmount with an `isMounted` ref.

**Known limitation:** dummyjson always returns `id: 251` from `POST /posts/add`. Local IDs (≥10,001) are generated with a module-level counter to avoid React key conflicts. Simulated posts are intentionally non-navigable — their IDs do not exist in the API. A "Fake" label persists on the card to avoid confusing users.

---

## 8. User Data: `keepUnusedDataFor: Infinity`

**Decision:** Cache user profiles forever in RTK Query.

**Reasoning:** User profiles (`firstName`, `lastName`, `image`) are immutable in this context. Caching them permanently means each author is fetched exactly once across the entire session, even if the same user appears across 50+ posts. The `?select=id,firstName,lastName,image` query parameter reduces the payload by excluding fields unused by the UI.

**Trade-off:** In a real app with mutable user profiles, this would need a cache invalidation strategy (tags, TTL). Acceptable here given the read-only nature of the data source.

---

## 9. Error Boundaries: Class Component + Contextual Fallbacks

**Decision:** Implement `ErrorBoundary` as a class component with a render-prop fallback.

**Reasoning:** React error boundaries must be class components — there is no hooks equivalent. The render-prop pattern (`fallback: ReactNode | ((error: Error) => ReactNode)`) allows error-aware fallbacks (e.g., distinguishing 404 from network errors in the post detail view) without coupling the boundary to a specific fallback UI.

**Trade-off:** Render-prop functions cannot be passed across the server/client boundary in Next.js App Router. Solved with a `'use client'` wrapper (`PostDetailErrorBoundary`) that keeps the function entirely on the client side.

---

## 10. Testing: Vitest + React Testing Library (manual mocks)

**Decision:** Use Vitest with RTL and manual `fetch` mocks instead of MSW (Mock Service Worker).

**Reasoning:** MSW requires a service worker in the browser or a Node integration. For this scope, `vi.stubGlobal('fetch', mockFetch)` is simpler and avoids adding a dependency. Each test file configures its own mock responses, keeping tests self-contained.

**Trade-off:** Manual mocks are more verbose than MSW and don't validate the actual request URL format. MSW is listed as a future improvement.

**StrictMode double-invoke:** React 19 StrictMode double-invokes effects in development. The `IntersectionObserver` integration test stores all observer callbacks in an array (not a single variable) to handle the double construction correctly.

---

## 11. Performance

| Technique | Location | Reason |
|---|---|---|
| `React.memo` | `PostCard`, `PostCardWithAuthor` | Prevents re-renders of the entire list on `isFetching` changes |
| `useCallback` | `saveScroll`, `handleLoadMore` | Stable references required for memoized children to skip re-renders |
| `useMemo` | `allPosts`, `currentPage` | Avoids recomputing accumulated posts on every render |
| `next/image` | All avatars | Automatic WebP, lazy loading, size optimisation |
| `next/dynamic` | `PostDetail` | Keeps post detail JS out of the feed bundle |
| `?select=` fields | All API calls | Reduces payload ~40% by excluding unused fields |
| `keepUnusedDataFor: Infinity` | Users API | Each author fetched exactly once per session |

---

## 12. Accessibility

| Feature | Implementation |
|---|---|
| Skip-to-content | `<a href="#main-content">` in `layout.tsx`, visually hidden until focused |
| Feed semantics | `role="feed"`, `aria-busy`, `aria-label="Posts"` |
| New post announcement | `aria-live="polite"` region announces count to screen readers |
| Loading states | `aria-busy="true"` + `aria-label="Loading posts/post"` on skeletons |
| Avatar images | `alt="{name} avatar"` on all `next/image` instances |
| Back button | `aria-label="Back to feed"`, `min-h-[44px]` touch target |
| Simulated post badge | `aria-hidden="true"` on "New", `aria-label="Simulated post"` on "Fake" |
| Motion | `prefers-reduced-motion` overrides all animations to `0.01ms` |
| Contrast | Dark palette verified: `#fff` / `#a0a0a0` on `#141414` pass WCAG AA |

---

## Known Tech Debt

- **MSW** instead of manual fetch mocks for more robust API test coverage
- **Simulated post navigation**: local IDs (≥10,001) don't exist in the API — future work would store full post data in Redux and serve detail from local state
- **SSR for post detail**: currently client-side fetch via RTK Query — a server component fetch would eliminate the loading flash on initial navigation
- **Scroll position on back navigation**: RTK Query cache restores page 1 instantly on return. The scroll Y position is also restored via Redux. However, if the user had scrolled past page 1, `loadedPosts` (local state) resets — so pages 2+ are missing until the IntersectionObserver re-triggers them. The user lands at the correct Y position but with a content gap that fills in quickly.
