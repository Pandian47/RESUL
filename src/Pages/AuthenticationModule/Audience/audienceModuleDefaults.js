/**
 * Standalone audience listing defaults — no Placeholders / AdvanceSearch / Regex barrel imports.
 * Used at module init to avoid circular-import TDZ errors in the audience production chunk.
 */

/** API default: "Created: Newest first" — mirrors Constants/AdvanceSearch DEFAULT_ADVANCE_SEARCH_SORT_BY_ID */
export const AUDIENCE_LIST_DEFAULT_SORT_BY_ID = 1;

/** Mirrors Constants/GlobalConstant/Regex LAST30DAYS_DATEFILTER */
export const AUDIENCE_LIST_LAST_30_DAYS_OFFSET = -29;
