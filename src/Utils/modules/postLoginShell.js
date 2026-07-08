import { reenableGenieDisabledStyles, whenHostStylesheetsApplied } from './cssDom';
import { gridHeaderFilterFocusCriticalCss } from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/gridLoadingSkeletonCriticalCss';

const GRID_HEADER_FILTER_FOCUS_STYLE_ID = 'rs-kendo-grid-header-filter-focus';
const APP_SHELL_STYLES_ATTR = 'data-resul-app-shell-styles';

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
/** Dispatched when the session-timeout modal closes after successful re-authentication. */
export const SESSION_RECOVERED_EVENT = 'resul:session-recovered';

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
        markAppShellStylesLoaded();
        return Promise.resolve();
    }

    appShellStylesPromise = Promise.all([
        import('@progress/kendo-theme-default/dist/all.css'),
        import('Styles/app.scss'),
        import('resul-genie-ui/resul-host-genie.css'),
    ])
        .then(() => {
            injectGridHeaderFilterFocusStyles();
            markAppShellStylesLoaded();
        })
        .then(waitForHostStylesApplied)
        .catch((err) => {
            appShellStylesPromise = null;
            throw err;
        });

    return appShellStylesPromise;
}

function markAppShellStylesLoaded() {
    appShellStylesLoaded = true;
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute(APP_SHELL_STYLES_ATTR, 'loaded');
    }
}

export function isAppShellStylesLoaded() {
    if (appShellStylesLoaded) return true;
    if (typeof document === 'undefined') return false;
    if (document.documentElement.getAttribute(APP_SHELL_STYLES_ATTR) === 'loaded') {
        appShellStylesLoaded = true;
        return true;
    }
    return areAppShellStylesPresentInDom();
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
    if (document.documentElement.getAttribute(APP_SHELL_STYLES_ATTR) === 'loaded') return true;

    const links = document.querySelectorAll('link[rel="stylesheet"]');
    let hasKendo = false;
    let hasAppStyles = false;
    for (const link of links) {
        if (link.disabled) continue;
        const href = link.href || '';
        if (href.includes('kendo')) hasKendo = true;
        if (href.includes('app') || href.includes('resul-host-genie')) hasAppStyles = true;
    }
    // login.scss also injects style[data-vite-dev-id] — do not treat that as the full app shell.
    return hasKendo && hasAppStyles;
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

export function isLoginHandoffActive() {
    return sessionStorage.getItem(LOGIN_HANDOFF_KEY) === '1';
}
