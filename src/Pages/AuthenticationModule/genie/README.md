# RESUL Genie embed (`AuthenticationModule/genie`)

This folder is the **host application surface** for Genie inside RESUL. The actual chat UI, layout, and most API path constants live in the **`resul-genie-ui`** npm package. These files exist to **wire RESUL-specific session, Redux, routing, styling, and communication-edit flows** into that package so behavior matches the legacy **GenieAINew** experience without duplicating the whole UI.

---

## Files in this folder

| File | Role |
|------|------|
| `index.jsx` | Route component: bootstrap data, build `genieConfig`, render `GenieApp`. |
| `constants.js` | Host transport: `baseURL`, auth headers, shared re-exports from `resul-genie-ui`. |
| `genieCommunicationEditFlow.js` | Opens Plan/Create communication screens from Genie cards with the same Redux + `q` bootstrap as `CommunicationCards`. |

---

## `index.jsx` — why this file and what the main blocks do

### Imports from `resul-genie-ui`

- **`GenieApp` / `buildResulGenieEmbedConfig`** — Single entry: the package renders the product UI; the host supplies config (APIs, session, callbacks, loaders).
- **`genieUiStylesUrl` + `useGenieEmbedStylesheet`** — The RESUL shell **disables most host CSS on Genie routes** (see `App.jsx` + package hooks). Genie’s styles must load explicitly; the `?url` import gives a resolvable stylesheet URL, and the hook gates rendering until styles are ready (with a loader fallback).
- **`createResulSegmentPanelSpaceidResolver`** — Insights/Workings requests need a **`spaceid`**. Session in the package can be briefly empty while the chat thread is already active; this resolver falls back to **`sessionStorage`** (`GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY`) so APIs are not called with a blank `spaceid`.
- **`mapExecutiveDashboardFromTokenUsages` / `mapSidebarTokenUsageFromTokensV1`** — Maps RESUL token APIs into the shape the package expects for the token dashboard and sidebar (parity with GenieAINew formatting).
- **`pickEdmTemplateIdFromGenieDetail`** — Normalizes template id from Genie “open in email builder” payloads.
- **`runResulGenieCreateSpaceThenDateRange`** — After creating a space, the host also loads date range for the gallery; this helper sequences those calls like **GenieAINew `handleNewChat`**.
- **`useResulGenieEntryPrefetchFetchSpaceIdData`** — Aligns initial fetch of space-scoped data when entering Genie (e.g. from logo/deep link) with **`lastActiveSpace`** in storage/query.

### RESUL-specific imports

- **`Reducers/genie`** — `getInsights`, `getWorkingsSegment`, `updateUI`: package thunks/actions bound into config for insights/workings and for closing modals when navigating away to edit flows.
- **`getSessionId` / `globalStateSelector` / `getUserDetails` / formatters** — Session and display parity with the rest of RESUL (user id, client, department, avatar, dates, numbers).
- **`useTabNavigation`** — Campaign edit sets **`commPlanTab`** in Redux before opening **communication-creation**, same pattern as elsewhere in the app.
- **`./genieCommunicationEditFlow`** — Keeps **campaign/channel/segment** edit behavior in one module (see below).

### State: `spaceId` and “last active space”

- **Initialized from `sessionStorage`** — So refresh or return from another tab can restore the active thread.
- **`onExitGenie`** — Clears the storage key and navigates to `/dashboard` so the next Genie entry does not auto-restore an old thread when a fresh prompt is desired.
- **Effects on `/genie`** — When the package fires **“New prompt”**, it clears storage; React state might still hold an old `spaceId`. Effects listen for **`GENIE_LAST_ACTIVE_SPACE_CLEARED_EVENT`** and pathname to **reset `spaceId`**, bump **`newPromptEpoch`**, clear listing preview caches, and **pre-create a new space + date range** even when the route does not change (repeated “New prompt” on the same URL).

### Callbacks (`onSegmentEdit`, `onChannelEdit`, `onCampaignEdit`, `onOpenEmailBuilder`)

- **`updateUI` dispatches** — Match GenieAINew: hide modal/workings/insights when leaving for an editor so the shell state is consistent.
- **`isGen=true` / `cardIndex` on opened URLs** — Lets target screens know the user came from Genie and which card to scroll to or highlight.
- **Segment edit** — If Genie returns a **communication** URL, open it in a new tab with query params; otherwise fall back to **audience create-target-list** (list editor) like **Chatmessages** segment edit.
- **Channel edit** — If the URL already has encrypted **`q`**, open as-is; if not, **`runGenieChannelEdit`** builds full create-state (same as **CommunicationCards `handleChannelEdit`**).
- **Campaign edit** — **`runGenieCampaignEdit`** for encrypted plan edit state when there is no direct URL.
- **`onOpenEmailBuilder`** — Opens **email-builder** with **`encodeUrl`** (`q` only, not duplicate template fetch). **`sessionStorage`** flags (`genieFromEmailBuilderEdit`, `scrollToCard`) coordinate with the builder. Comment in code documents why **FetchTemplateById** is not called here (avoid duplicate fetches from prefetch + Strict Mode + effects).

### Bootstrap `useEffect`

- **Parallel `Promise.allSettled`** — Loads chat list, prompt types, token usages (v1 + legacy) without failing the whole bootstrap if one call fails.
- **Gallery** — Uses **GetDateRangeGenie** bounds and **fetchPromptGalleryApi** with **`GENIE_PROMPT_GROUP_MY`** and segment category derived from prompt types so the gallery matches RESUL categories.
- **`hasSessionForGenie`** — Avoids calling APIs without `userId` / `clientId` / `departmentId`.

### Render gate

- **`!isGenieCssReady`** — Shows **`RSLoader`** until Genie CSS is applied so users do not see unstyled UI while the host shell has stripped competing styles.

---

## `constants.js` — why this file

- **Single place for HTTP wiring** — `createResulGenieTransport` needs RESUL’s **`baseURL`** (from `Constants/EndPoints`) and **`getAuthHeaders`** (localStorage tokens, JWT, UUID header) so every Genie API call matches the rest of the app.
- **`GENIE_ENVIRONMENT`** — Passed into `buildResulGenieEmbedConfig` (`DEV` vs `PROTO` behavior inside the package).
- **Re-exports** — Avoids importing dozens of helpers from `resul-genie-ui` directly inside `index.jsx`; keeps the page focused on orchestration.
- **`mapPreviousPrompts`** — Uses **`createMapPreviousPromptGroups`** with **`getUserDateTimeFormat`** so previous-prompt timestamps match the user’s locale/settings.

`GENIE_SYSTEM_PROMPT` is defined for potential host or future use; the live system prompt may also be configured server-side or in the package depending on deployment.

---

## `genieCommunicationEditFlow.js` — why this file

Genie cards can trigger **edit campaign**, **edit channel**, or open tabs that expect **the same Redux bootstrap and encrypted `q` payload** as **`CommunicationCards.jsx`**. Putting that logic here:

- Avoids a **very large** `index.jsx`.
- Keeps **parity** with existing communication flows (same reducers, tab constants, MDC URLs, dynamic list channel eligibility).
- Reuses **`resul-genie-ui`** helpers: **`normalizeCommunicationCardRow`**, **`getApiResponseRow`**, **`firstResolvedCampaignId`**, **`resolveEmailChannelDetailId`**, **`openResulGeniePathInNewTab`** (re-exported as `openAppPathInNewTab` for naming consistency with the host).

Important implementation details (also in code comments):

- **`savedChannelsId` inside encrypted state** — A new tab has an **empty Redux** tree; **`tempSavedChannelsId`** built from the card must be embedded in `q`, not assumed from the opener’s `savedChannelsId`.
- **`genieCreateTabBootstrap`** — Tab state was dispatched in the Genie window; the new tab replays vertical/tab indices from this blob.
- **`mdcContentSetupDetails`** — Email path needs **`channelDetailId`** for **GetEmailCommunicationById** when Redux is empty in the new tab.

---

## Related code **outside** this folder (integration points)

These are not in `genie/`, but they explain **why** the embed behaves the way it does:

| Location | Why it matters |
|----------|----------------|
| `src/Reducers/genie/index.js` | `createResulGenieHostRedux` — Genie Redux slice + thunks (insights, workings, chat, etc.) using RESUL `request` + `baseURL`. |
| `src/Reducers/index.js` | Registers `genieReducer` on the root reducer. |
| `src/Store/index.js` | Root persist uses `whitelist: ['globalstate']` only — `genieReducer` is not persisted (in-memory Genie state). |
| `src/Routes/pageModuleRegistry.jsx` | Registers the `Genie` dynamic import; `/genie` renders `Pages.Genie` via `GenieRoute.jsx`. |
| `src/Routes/GenieRoute.jsx` | Wraps the page; when `RESUL_GENIE_ACCESS_STRICT_MODE` is true (package default), redirects to `/dashboard` if no BU has `isGenieEnabled`. |
| `src/App.jsx` | `useResulGenieShellStylesIsolation` on Genie shell routes; floating Genie launcher; Kendo/app SCSS deferral on `/genie` so Genie styles dominate. |
| `src/main.jsx` | Imports `resul-genie-ui/resul-host-genie.css` (launcher + shell helpers). |
| `src/Routes/MainRoutes.jsx` / `src/Components/RSHeader/index.jsx` | Route + header treatment for paths under `/genie`. |
| `src/Utils/index.jsx` | `hasGenieEnabledDepartment` for launcher/route gating with strict mode. |

---

## Mental model

```text
RESUL shell (session, Redux, CSS rules)
       │
       ▼
  genie/index.jsx  ──config──►  resul-genie-ui (GenieApp UI + chat)
       │
       ├── constants.js (HTTP + re-exports)
       └── genieCommunicationEditFlow.js (deep links into Communication modules)
```

For standalone Genie UI work outside RESUL, the parallel project is **`Genie-UI/`** in this workspace; this folder is intentionally the **RESUL embed** only.
