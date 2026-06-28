/**
 * Preferences sub-page **read** APIs use `loading: false` + inline skeleton (usePreferencesSubPageApi).
 * Save / update / delete thunks keep `loading: true` so RSLoader increment/decrement still works.
 */
export const PREFERENCES_SUBPAGE_SUPPRESS_GLOBAL_LOADER = Object.freeze({ loading: false });
