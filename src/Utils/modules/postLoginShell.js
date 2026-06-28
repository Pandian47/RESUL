import { reenableGenieDisabledStyles, whenHostStylesheetsApplied } from './cssDom';
import { gridHeaderFilterFocusCriticalCss } from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/gridLoadingSkeletonCriticalCss';

const GRID_HEADER_FILTER_FOCUS_STYLE_ID = 'rs-kendo-grid-header-filter-focus';

function injectGridHeaderFilterFocusStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(GRID_HEADER_FILTER_FOCUS_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = GRID_HEADER_FILTER_FOCUS_STYLE_ID;
    style.textContent = gridHeaderFilterFocusCriticalCss;
    document.head.appendChild(style);
}
export const LOGIN_HANDOFF_KEY = 'resul:login-handoff';
export const POST_LOGIN_SHELL_READY_EVENT = 'resul:post-login-shell-ready';

/** @type {Promise<void> | null} */
let appShellStylesPromise = null;
let appShellStylesLoaded = false;

const waitForHostStylesApplied = () =>
    new Promise((resolve) => {
        reenableGenieDisabledStyles();
        whenHostStylesheetsApplied(resolve);
    });

/** Load platform CSS once (shared by App.jsx and login handoff). */
export function loadAppShellStyles() {
    if (appShellStylesLoaded) return Promise.resolve();
    if (appShellStylesPromise) return appShellStylesPromise.then(waitForHostStylesApplied);

    if (typeof document !== 'undefined' && areAppShellStylesPresentInDom()) {
        injectGridHeaderFilterFocusStyles();
        appShellStylesLoaded = true;
        return Promise.resolve();
    }

    appShellStylesPromise = Promise.all([
        import('Styles/app.scss'),
        import('resul-genie-ui/resul-host-genie.css'),
        import('@progress/kendo-theme-default/dist/all.css'),
    ])
        .then(() => {
            injectGridHeaderFilterFocusStyles();
            appShellStylesLoaded = true;
        })
        .then(waitForHostStylesApplied)
        .catch((err) => {
            appShellStylesPromise = null;
            throw err;
        });

    return appShellStylesPromise;
}

export function isAppShellStylesLoaded() {
    if (appShellStylesLoaded) return true;
    return typeof document !== 'undefined' && areAppShellStylesPresentInDom();
}

/** Route segment → dynamic import for the post-login destination page. */
const ROUTE_MODULE_LOADERS = [
    { match: (path) => path.includes('/add-audience'), load: () => import('Pages/AuthenticationModule/Audience/Pages/AddAudience') },
    {
        match: (path) => path.includes('create-dynamic-list'),
        load: () => import('Pages/AuthenticationModule/Audience/Pages/DynamicListCreation'),
    },
    {
        match: (path) => path.includes('create-target-list'),
        load: () => import('Pages/AuthenticationModule/Audience/Pages/TargetListCreation'),
    },
    { match: (path) => path.startsWith('/audience'), load: () => import('Pages/AuthenticationModule/Audience') },
    { match: (path) => path.includes('/communication-creation'), load: () => import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan') },
    { match: (path) => path.includes('/create-communication'), load: () => import('Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create') },
    { match: (path) => path.startsWith('/communication'), load: () => import('Pages/AuthenticationModule/Communication/CommunicationLists/CommunicationLists') },
    { match: (path) => path.startsWith('/analytics'), load: () => import('Pages/AuthenticationModule/Analytics') },
    { match: (path) => path.startsWith('/preferences'), load: () => import('Pages/AuthenticationModule/Preferences') },
    { match: (path) => path.startsWith('/dashboard'), load: () => import('Pages/AuthenticationModule/Dashboard/Dashboard') },
    { match: (path) => path.startsWith('/launch-pad'), load: () => import('Pages/AuthenticationModule/LaunchPad') },
    {
        match: (path) => path.includes('/add-companies'),
        load: () => import('Pages/AuthenticationModule/Preferences/Pages/Companies/AddCompanies'),
    },
    {
        match: (path) => path.startsWith('/preferences/my-profile'),
        load: () => import('Pages/AuthenticationModule/Preferences/Pages/MyProfile'),
    },
];

function areAppShellStylesPresentInDom() {
    if (typeof document === 'undefined') return false;
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    let hasKendo = false;
    let hasAppStyles = false;
    for (const link of links) {
        if (link.disabled) continue;
        const href = link.href || '';
        if (href.includes('kendo')) hasKendo = true;
        if (href.includes('app') || href.includes('resul-host-genie')) hasAppStyles = true;
    }
    return hasKendo && (hasAppStyles || document.querySelector('style[data-vite-dev-id]'));
}

function hasInjectedAppShellStyles() {
    if (typeof document === 'undefined') return false;
    return Boolean(document.querySelector('style[data-vite-dev-id]'));
}

/** Prefetch the lazy route chunk for a path (header hover, navigation intent, refresh). */
export function prefetchRouteModule(path) {
    const normalized = path?.split('?')[0] || '/launch-pad';
    const entry = ROUTE_MODULE_LOADERS.find(({ match }) => match(normalized));
    return entry ? entry.load() : Promise.resolve();
}

/**
 * Preload app shell styles, header, and the destination route chunk while still on the login page.
 * Keeps the login screen visible under the loader until navigation.
 */
export async function prefetchPostLoginShell(targetPath) {
    await Promise.all([loadAppShellStyles(), import('Components/RSHeader'), prefetchRouteModule(targetPath)]);
    window.dispatchEvent(new CustomEvent(POST_LOGIN_SHELL_READY_EVENT));
}

/**
 * Resolve the first path segment accountResponse will navigate to (without query string).
 */
export function resolvePostLoginTarget(response, lastURL, licenseTypeId, departmentList) {
    if (lastURL) return lastURL.split('?')[0];

    if (response?.isCampaign && response?.isAudience === 1) return '/dashboard';
    if (!response?.isCampaign && response?.isAudience === 1) return '/audience';

    if (licenseTypeId === '3') {
        const isDepartmentListInvalid = departmentList?.every(
            (department) => parseInt(department?.departmentId, 10) === 0,
        );
        if ((departmentList?.length === 1 && isDepartmentListInvalid) || !departmentList?.length) {
            return '/preferences/company-list/add-companies';
        }
    }

    return '/launch-pad';
}

export function beginLoginHandoff() {
    sessionStorage.setItem(LOGIN_HANDOFF_KEY, '1');
}

export function endLoginHandoff() {
    sessionStorage.removeItem(LOGIN_HANDOFF_KEY);
}

export function isLoginHandoffActive() {
    return sessionStorage.getItem(LOGIN_HANDOFF_KEY) === '1';
}
