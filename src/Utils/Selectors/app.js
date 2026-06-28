/** Returns the globalstate slice; plain selector (not createSelector) to avoid identity memoization warnings. */
const globalStateSelector = (state) => state?.globalstate ?? {};

export { globalStateSelector };
