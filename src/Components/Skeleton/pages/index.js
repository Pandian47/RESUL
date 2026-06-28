/**
 * Route-level page skeletons live under `pages/<module>/`.
 * Tabbed routes use `createPageLoadingScene` from `Components/Skeleton/Components/common/pageLoadingScene.jsx`
 * (one file: layers + app nav + factory for bootstrap / Suspense / in-page).
 *
 * @example
 * import { AnalyticsSuspenseFallback } from 'Components/Skeleton/pages/analytics';
 * import { createPageLoadingScene, shouldSkipDataLayerSkeleton } from 'Components/Skeleton/Components/common';
 */
export * from './audience';
export * from './analytics';
export * from './communication';
export * from './dashboard';
