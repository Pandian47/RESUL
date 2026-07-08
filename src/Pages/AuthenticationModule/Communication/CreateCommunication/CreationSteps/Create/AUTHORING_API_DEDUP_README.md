# Create Communication — Authoring guide

Use this doc when fixing **duplicate API calls**, **sub-tab index / navigation bugs**, or other Create / Edit authoring issues (Email, Messaging, Notification, etc.). Attach or reference it in new chats so context is clear without re-investigating.

---

## Part 1 — API deduplication

### Main goal

**Prevent repeat API calls** when:

- Switching tabs (Split A/B, content type tabs)
- Remounting the same component with the same data need
- Edit flow already loaded campaign content from `Get*Communication` APIs

**Still call the API** when:

- Payload actually changes (pagination, category, date range, search, filters)
- User explicitly resets content (refresh icon on Email content tabs)
- Create flow with no data yet
- First load for a new payload signature

### Three-layer pattern (apply in order)

#### 1. Redux — skip if list already loaded

Before `dispatch(getXList(...))` in parent edit-load effects:

```js
if (!existingListFromSelector?.length) {
  await dispatch(getXList({ payload, loading: false }));
}
```

**Example:** `Email.jsx` edit load for `getUnSubscriptionList`.

#### 2. Request thunk — in-flight dedup by payload signature

In `src/Reducers/communication/createCommunication/Create/request.js` (or channel request file):

```js
let xListInFlight = null;

const buildClientScopedSignature = (payload = {}) =>
  JSON.stringify({
    clientId: payload?.clientId ?? '',
    userId: payload?.userId ?? '',
    departmentId: payload?.departmentId ?? '',
  });

export const getXList = ({ payload, loading = false }) => async (dispatch) => {
  const signature = buildClientScopedSignature(payload);
  if (xListInFlight?.signature === signature) {
    return xListInFlight.promise;
  }
  const requestPromise = dispatch(request.post({ /* ... */ }));
  xListInFlight = { signature, promise: requestPromise };
  return requestPromise.finally(() => {
    if (xListInFlight?.promise === requestPromise) {
      xListInFlight = null;
    }
  });
};
```

**Examples:** `getEmailFooterList`, `getUnSubscriptionList`.

#### 3. Component — module-level cache + skip when content exists

For UI that **remounts** on tab switch (`ResTabber` only renders active panel):

- Do **not** rely on `useRef` alone for “already fetched” — refs reset on unmount.
- Use a **module-level** `Set` or `Map` keyed by `JSON.stringify(normalizedPayload)`.
- Skip fetch when form already has the data (edit flow).

**Example:** `Email/Component/Template/Template.jsx`

| Mechanism | Purpose |
|-----------|---------|
| `templateGalleryRequestsInFlight` | Concurrent duplicate requests (same payload, same moment) |
| `templateGalleryFetchedKeys` | Completed fetch survives Split A/B remount |
| `hasExistingTemplateContent()` | Edit flow — skip `GetTemplateLists` when `templateContent` / `edmContent` exists |
| `clearTemplateGalleryCache()` | Called on Email content **Reset** so gallery can load again |

### Known API issues fixed (reference)

| API | Symptom | Root cause | Fix location |
|-----|---------|------------|--------------|
| `GetUnSubscribeSetting` | 2× on Email edit | `Email.jsx` + `SplitABTab` both fetch; hydrated ref reset on mount | `request.js` in-flight dedup; `Email.jsx` skip if Redux has list; `SplitABTab` preserve hydrated ref |
| `GetTemplateLists` | Every Split A/B switch | `Template` remounts; per-instance `lastGalleryFetchKeyRef` resets | `Template.jsx` module cache + skip when template content exists |
| `GetTemplateLists` | Edit with template preview | Gallery hidden (`d-none`) but `useEffect` still fetched | Skip when `templateContent` / `edmContent` has length |
| `GetUtcTimeJson` | Every channel mount / split switch | Channel `useEffect` + `ResScheduler` mount both fetched UTC | `ResScheduler` `onPickerOpen` only; remove mount calls from channel pages; Redux + in-flight dedup in `getUtcTimeNow` |
| Dropdown empty rows | Blank list items | API rows with empty labels | `hasDropdownDisplayLabel()` in `stringUtils.jsx` — `ResKendoDropdown`, `RSBootstrapdown`, `ResMultiSelect` |

### Email Split A/B + Template tab flow

```
Outer RSTabbar (Split A/B)
  └─ Only active split mounted → SplitABTab remounts on switch
       └─ Inner RSTabbar (Text / Import / Template)
            └─ Template.jsx mounts on Template tab
                 └─ useEffect → GetTemplateLists (unless skipped)
```

**Skip `GetTemplateLists` when:**

- `getValues('templateContent')` or `getValues('splitX.templateContent')` has content (edit / already selected)
- `galleryFetchKey` already in `templateGalleryFetchedKeys` (same filters, different split)

**Fetch `GetTemplateLists` when:**

- Create flow, no template selected
- User changes pagination / category / date range (new `galleryFetchKey`)
- User clicks **Reset** on content tabs → `clearTemplateGalleryCache()` + `updateTemplate([])`

### UTC time (`GetUtcTimeJson`)

**Do not fetch on channel mount or Scheduler mount** — use picker open only.

**Channels with mount `getUtcTimeNow` removed:** Email, Messaging, WhatsApp, RCS, Notification, Mobile Notification, Voice, VMS, Social Post, Plan Delivery Method, Messaging Split A/B.

| When | Call API? |
|------|-----------|
| Page load / split switch | **No** |
| User opens schedule date-time picker | **Yes** (`onPickerOpen` → `ensureUtcTime`) |
| User changes timezone in scheduler | **Yes** (`getUtcTimeNow({ force: true })`) |
| Form submit (Next/Save) | **Yes** — reuses Redux if already loaded (`getUtcTimeNow` skip) |

**Implementation:**

- `ResScheduler/index.jsx` — removed mount `useEffect`; `onPickerOpen={ensureUtcTime}` for all schedulers
- `Reducers/globalState/request.js` — `getUtcTimeNow(loading, { force })` with Redux cache + in-flight dedup

---

## Part 2 — Notification sub-tab index (Web / Mobile)

Use when fixing **wrong Web vs Mobile tab** on the Notification vertical (edit flow, cross-channel navigation, or plan with only one notification type).

### Sub-tabs

| Index | Tab    | Channel id | Plan analytics type (`analyticsTypes`) |
|-------|--------|------------|----------------------------------------|
| 0     | Web    | 8          | 6                                      |
| 1     | Mobile | 14         | 16                                     |

Config: `NOTIFICATION_TAB_CONFIG` in `constant.jsx`.

### Resolver entry point

`resolveNotificationSubTabIndexFromSharedState` in `constant.jsx` — used by `pages/Notification/index.jsx`.

**Inputs**

- `location` — query state (`currentIndex`, `channels`, `analyticsTypes`, `editSourceChannelId`, …)
- `tabsState` — Redux sub-tab indices per vertical (`messaging`, `notification`, …)
- `notificationReduxIndex` — `tabsState.notification.currentIndex` (always pass this; do not gate on `channels.includes(8)`)

**Outputs**

- `fromIndex` — 0 (Web) or 1 (Mobile)
- `usedEditSource` — true when opened from edit on channel 8 or 14
- `rawLocationCurrentIndex`, `channelId` — for trigger / dual-analytics handling in the page

### Resolution order

1. **Direct notification edit** (`editSourceChannelId` 8 or 14)  
   Use `getCreateCommNotificationSubTabIndexFromEditSource` when peek index is out of range or foreign.

2. **URL intent** (`channelId` 8/14 or `typeId` query)  
   Map to 0 / 1 explicitly.

3. **Foreign / polluted index** — ignore `location.currentIndex` and fall back:
   - `isSharedCreateCommIndexForeignToVertical` — same numeric index used by another vertical (e.g. Messaging WhatsApp index 1).
   - `isLocationIndexPollutedByNonNotificationEdit` — edit opened from non-notification channel (WhatsApp, SMS, …) without URL intent; gallery edit often sets `currentIndex: 1` for any non-8 channel.

4. **Fallback**
   - Prefer `notificationReduxIndex` if set.
   - Else `getDefaultNotificationSubTabIndexFromPlan(location)` using `analyticsTypes` **6/16** and `channels` **8/14**.

### Known index issues fixed (reference)

| Symptom | Cause | Fix location |
|---------|--------|--------------|
| WhatsApp edit → Notification opens **Mobile** | `location.currentIndex === 1` (messaging WhatsApp index) treated as notification index | `constant.jsx` — pollution guard + plan fallback |
| Plan only **16** (Mobile analytics), no **8** | Fallback only checked `channels` | `getDefaultNotificationSubTabIndexFromPlan` |
| Foreign check fails after leaving Messaging | Messaging unmount resets `tabsState.messaging.currentIndex` to 0 | Pollution guard on `editSourceChannelId` |
| Gallery card edit | `Card/index.jsx` sets `currentIndex: channelId === 8 ? 0 : 1` | Pollution guard unless `channelId`/`typeId` in URL |

### Related helpers (`constant.jsx`)

| Function | Role |
|----------|------|
| `getCreateCommSubTabMaxIndex` | Max sub-tab index per vertical |
| `isSharedCreateCommIndexForeignToVertical` | Detect index shared with another vertical's Redux state |
| `getCreateCommNotificationSubTabIndexFromEditSource` | Map edit channel 8 → 0, 14 → 1 |
| `getDefaultNotificationSubTabIndexFromPlan` | Plan-based default when index is invalid or polluted |
| `peekCreateCommNotificationRawIndexFromLocation` | Read raw index from URL + location (internal) |

### Page integration

`pages/Notification/index.jsx`:

- Calls resolver on mount / location change (unless user picked a sub-tab).
- Enables/disables tabs from `location.analyticsTypes` vs `NOTIFICATION_TAB_CONFIG.notifyType`.
- For trigger campaigns, `handleIsChannelPresent` uses `eligibleChannelType[8]` / `[14]`.

Do **not** pass `notificationReduxIndex: null` when channel 8 is missing from plan — that breaks foreign-index detection.

---

## Checklist for new authoring pages

When adding or debugging list/detail APIs on channel tabs:

- [ ] Does parent edit-load already fetch this list? Coordinate with child.
- [ ] Remove channel-level `useEffect(() => dispatch(getUtcTimeNow()), [])` — use `ResScheduler` picker open instead
- [ ] Does child mount/unmount on tab switch? Use module-level or Redux cache, not only `useRef`.
- [ ] Is dedup keyed on **normalized payload** (not object reference)?
- [ ] Does edit flow already populate form fields? Skip list API if UI only shows preview.
- [ ] Does Reset / clear action invalidate cache?
- [ ] Pass `loading: false` on thunks when using `useApiLoader` for field spinners.

When adding or debugging **sub-tab index** across verticals:

- [ ] Does `location.currentIndex` come from another vertical's edit? Use foreign/pollution guards.
- [ ] Does fallback use **plan** `analyticsTypes` (not only `channels`)?
- [ ] Is Redux sub-tab index always passed to the resolver?

---

## Related files

| Area | Path |
|------|------|
| Sub-tab index resolver | `constant.jsx` → `resolveNotificationSubTabIndexFromSharedState` |
| Notification sub-tabs page | `pages/Notification/index.jsx` |
| Email submit flow | `Tabs/Email/Email.jsx` → `formSubmitHandler` |
| Split A/B content | `Tabs/Email/Component/SplitABTab/SplitABTab.jsx` |
| Template gallery | `Tabs/Email/Component/Template/Template.jsx` |
| Scheduler / UTC lazy load | `Pages/KendoDocs/CommonComponents/ResScheduler/index.jsx` |
| UTC thunk | `Reducers/globalState/request.js` → `getUtcTimeNow` |
| Email thunks | `Reducers/communication/createCommunication/Create/request.js` |
| Tab remount behavior | `Pages/KendoDocs/CommonComponents/ResTabber/variants/TabContentTransition.jsx` |
| Dropdown label filter | `Utils/modules/stringUtils.jsx` → `hasDropdownDisplayLabel` |
| Gallery edit navigation | `CommunicationLists/Pages/Card/index.jsx` |

---

## Updating this doc

When you fix another authoring issue:

1. Add a row to **Known API issues fixed** or **Known index issues fixed**.
2. For APIs: note the **payload key** used for dedup and **skip vs must-fetch** conditions.
3. For index bugs: note which **vertical** leaked index and which **guard/fallback** fixed it.

This keeps the next session aligned without re-tracing Network tab calls or tab-state bugs.
