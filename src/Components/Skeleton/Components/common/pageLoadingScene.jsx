import { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import { skeletonShellSharedCriticalCss } from './skeletonShellSharedCriticalCss';
import { getRouteTabIndex } from '../getRouteTabIndex';
import { getMainNavActiveIndex } from '../mainSkeletonVariants';

/** bootstrap = App shell; route = Suspense; body = in-page / API only */
export const PAGE_LOADING_LAYER = {
    BODY: 'body',
    ROUTE: 'route',
    BOOTSTRAP: 'bootstrap',
};

export const resolvePageLoadingLayer = ({ inline, contentOnly, withAppShell }) => {
    if (inline || contentOnly) return PAGE_LOADING_LAYER.BODY;
    if (withAppShell) return PAGE_LOADING_LAYER.BOOTSTRAP;
    return PAGE_LOADING_LAYER.ROUTE;
};

export const shouldSkipDataLayerSkeleton = (consumeRouteSkeleton) => {
    if (typeof consumeRouteSkeleton !== 'function') return false;
    return consumeRouteSkeleton();
};

const MAIN_NAV_ICON_SIZES = [39, 43, 52, 43, 39];
const MAIN_NAV_ITEM_MARGIN = '0 3px';
const MAIN_NAV_HEADER_BG = '#00006e';
const MAIN_NAV_ACTIVE_BG = '#fd2d32';
const MAIN_NAV_BORDER = '#0043ff';
const MAIN_NAV_INACTIVE_BG = '#ffffff';

export const pageLayoutSkeletonCriticalCss = `
.page-layout-skeleton--inline{min-height:100vh;background:#f5f7fc;font-family:Arial,sans-serif}
.page-layout-skeleton--inline .pls-page-header{padding:12px 24px 0;display:flex;align-items:flex-end;justify-content:space-between;min-height:58px;box-sizing:border-box}
.page-layout-skeleton--inline .pls-title-block h1{margin:0;font-size:32px;font-weight:500;color:#0018f9;line-height:1.1}
.page-layout-skeleton--inline .pls-title-block .pls-sub{font-size:13px;color:#333;margin-bottom:2px}
.page-layout-skeleton--inline .pls-header-right{display:flex;align-items:center;gap:12px}
.page-layout-skeleton--inline .pls-breadcrumb{font-size:12px;color:#666;white-space:nowrap}
.page-layout-skeleton--inline .pls-dd{height:32px;width:120px;background:#e2e7ee;border-radius:4px}
.page-layout-skeleton--inline .pls-tabs-wrap{background:#fff;border-bottom:1px solid #e2e7ee}
.page-layout-skeleton--inline .pls-tabs{display:flex;margin:0;padding:0 24px;list-style:none}
.page-layout-skeleton--inline .pls-tab{flex:1;max-width:33.33%;text-align:center;padding:2px 6px;background:#e9e9e9;border-left:3px solid #f5f7fc;position:relative;min-height:41px;display:flex;align-items:center;justify-content:center}
.page-layout-skeleton--inline .pls-tab:first-child{border-left:none}
.page-layout-skeleton--inline .pls-tab-label{height:10px;border-radius:4px;background:#c5ced8;width:72%}
.page-layout-skeleton--inline .pls-content{padding:21px 24px 24px}
.page-layout-skeleton--inline .skeleton-shimmer{position:relative;overflow:hidden;background:#e2e7ee;border-radius:4px;display:block}
.page-layout-skeleton--inline .skeleton-shimmer:after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,#eef2f9,transparent);animation:plsShimmer 1.6s infinite}
.page-layout-skeleton--inline .pls-box{background:#fff;border:1px solid #c2cfe3;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,.08);padding:16px}
@keyframes plsShimmer{0%{left:-100%}100%{left:100%}}
`;

const SKELETON_NON_INTERACTIVE = { pointerEvents: 'auto', cursor: 'not-allowed' };

const withSkeletonIconCursor = (icon) => (
    <span style={{ display: 'inline-flex', lineHeight: 0, ...SKELETON_NON_INTERACTIVE }}>{icon}</span>
);

const getMainNavItemStyle = (index, activeNavIndex) => {
    const size = MAIN_NAV_ICON_SIZES[index] ?? 39;
    const isActive = activeNavIndex === index;

    return {
        width: size,
        height: size,
        margin: MAIN_NAV_ITEM_MARGIN,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isActive ? MAIN_NAV_ACTIVE_BG : MAIN_NAV_INACTIVE_BG,
        border: `1px solid ${isActive ? MAIN_NAV_ACTIVE_BG : MAIN_NAV_BORDER}`,
        filter: 'drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.25))',
        boxSizing: 'border-box',
        listStyle: 'none',
        ...SKELETON_NON_INTERACTIVE,
    };
};

const getNavIconSvg = (index, isActive) => {
    switch (index) {
        case 0:
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <path fill="#ffffff" strokeWidth="0" d="M21.11,14.55c-.42-.21-.86-.37-1.31-.49-.02,0-.72-.2-1.37-.43.04-.27-.12-.57-.47-.57-.16,0-.28.07-.37.16-.09-.09-.15-.2-.15-.34v-.86s1.91.06,2.82-.87c0,0-1.32-.37-1.08-2.78.24-2.4-.3-4.51-2.24-4.33,0,0-.84-1.01-2.5-.37-.57.22-2.11.77-2.03,4.1.08,3.33-1.18,3.35-1.18,3.35,0,0,.66.95,2.87.93v.83c0,.15-.07.28-.18.37.65.55,1.17,1.11,1.55,1.95.39.88.41,2.04.51,2.91h5.52c.28,0,.5-.22.5-.5v-1.8c-.05-.55-.39-1.03-.89-1.27Z" />
                    <path fill="#ffffff" strokeWidth="0" d="M14.86,16.22c-.35-1.13-.96-1.84-1.87-2.54-.01-.01-.02-.02-.03-.03-.7-.49-1.99-1.04-2.97-1.5.02-.06.05-.09.06-.16.04-.24.05-.52.05-.76,0-.11-.01-.1-.26-.19-.07-.03-.4-.18-.44-.16.53-.29.87-1.51.94-1.87.19.11.46.04.77-1.05.27-.9.12-1.19-.12-1.27h-.08c.04-.11.04-.19.04-.19.85-3.43-1.12-3.28-1.12-3.28-.15-.67-1.15-1.38-2.08-1.19-.92.19-2.85-.04-2.85-.04-.04.41.31.67.31.67-1.96,1.16-1.15,3.84-1.15,3.84-.31-.04-.65.15-.31,1.27.23.82.46,1.05.65,1.08.08.48.49,1.73.95,2.04-.03.01-.07,0-.1.03-.1.05-.2.1-.29.15-.11.06-.31.09-.38.2-.07.11.04.7.06.84,0,.03.02.05.02.08-1.37.69-3.13,1.56-4.17,2.41-.33.27-.51.68-.51,1.1v2.57c0,.28.22.5.5.5h14.06c.28,0,.51-.23.5-.52-.03-.67-.07-1.65-.19-2.04Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <path fill="#fc2d32" strokeWidth="0" d="M21.11,14.55c-.42-.21-.86-.37-1.31-.49-.02,0-.72-.2-1.37-.43.04-.27-.12-.57-.47-.57-.16,0-.28.07-.37.16-.09-.09-.15-.2-.15-.34v-.86s1.91.06,2.82-.87c0,0-1.32-.37-1.08-2.78.24-2.4-.3-4.51-2.24-4.33,0,0-.84-1.01-2.5-.37-.57.22-2.11.77-2.03,4.1.08,3.33-1.18,3.35-1.18,3.35,0,0,.66.95,2.87.93v.83c0,.15-.07.28-.18.37.65.55,1.17,1.11,1.55,1.95.39.88.41,2.04.51,2.91h5.52c.28,0,.5-.22.5-.5v-1.8c-.05-.55-.39-1.03-.89-1.27Z" />
                    <path fill="#00006e" strokeWidth="0" d="M14.86,16.22c-.35-1.13-.96-1.84-1.87-2.54-.01-.01-.02-.02-.03-.03-.7-.49-1.99-1.04-2.97-1.5.02-.06.05-.09.06-.16.04-.24.05-.52.05-.76,0-.11-.01-.1-.26-.19-.07-.03-.4-.18-.44-.16.53-.29.87-1.51.94-1.87.19.11.46.04.77-1.05.27-.9.12-1.19-.12-1.27h-.08c.04-.11.04-.19.04-.19.85-3.43-1.12-3.28-1.12-3.28-.15-.67-1.15-1.38-2.08-1.19-.92.19-2.85-.04-2.85-.04-.04.41.31.67.31.67-1.96,1.16-1.15,3.84-1.15,3.84-.31-.04-.65.15-.31,1.27.23.82.46,1.05.65,1.08.08.48.49,1.73.95,2.04-.03.01-.07,0-.1.03-.1.05-.2.1-.29.15-.11.06-.31.09-.38.2-.07.11.04.7.06.84,0,.03.02.05.02.08-1.37.69-3.13,1.56-4.17,2.41-.33.27-.51.68-.51,1.1v2.57c0,.28.22.5.5.5h14.06c.28,0,.51-.23.5-.52-.03-.67-.07-1.65-.19-2.04Z" />
                </svg>
            );
        case 1:
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <polygon fill="#ffffff" strokeWidth="0" points="23.58 .42 .42 10.95 7.45 14.82 23.58 .42" />
                    <polygon fill="#ffffff" strokeWidth="0" points="8.84 16.21 23.58 .42 18.32 22.53 8.84 16.21 12.48 19.94 8.84 23.58 8.84 16.21" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <polygon fill="#fc2d32" strokeWidth="0" points="23.58 .42 .42 10.95 7.45 14.82 23.58 .42" />
                    <polygon fill="#00006e" strokeWidth="0" points="8.84 16.21 23.58 .42 18.32 22.53 8.84 16.21 12.48 19.94 8.84 23.58 8.84 16.21" />
                </svg>
            );
        case 2:
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <path fill="#ffffff" strokeWidth="0" d="M19,27.71l9.1-19.5c.2-.4,0-1-.4-1.2s-1-.1-1.3.3l-12.5,17.5v.1c-.6,1-.7,2.1-.2,3,.2.4.6.8,1,1.1.7.5,1.5.7,2.2.5.8-.3,1.6-.9,2.1-1.8,0,.1,0,0,0,0Z" />
                    <path fill="#ffffff" strokeWidth="0" d="M4.36,24.05c0-7.52,6.12-13.64,13.64-13.64,1.46,0,2.86.24,4.18.66l2.41-3.37c-2.04-.82-4.26-1.29-6.59-1.29C8.27,6.41.36,14.32.36,24.05c0,1.15.12,2.27.33,3.36h4.11c-.27-1.08-.44-2.2-.44-3.36Z" />
                    <path fill="#ffffff" strokeWidth="0" d="M35.64,24.05c0-5.73-2.76-10.82-7-14.04l-1.74,3.72c2.9,2.5,4.74,6.19,4.74,10.32,0,1.16-.16,2.28-.44,3.36h4.11c.21-1.09.33-2.21.33-3.36Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <path fill="#fc2d32" strokeWidth="0" d="M19,27.71l9.1-19.5c.2-.4,0-1-.4-1.2s-1-.1-1.3.3l-12.5,17.5v.1c-.6,1-.7,2.1-.2,3,.2.4.6.8,1,1.1.7.5,1.5.7,2.2.5.8-.3,1.6-.9,2.1-1.8,0,.1,0,0,0,0Z" />
                    <path fill="#00006e" strokeWidth="0" d="M4.36,24.05c0-7.52,6.12-13.64,13.64-13.64,1.46,0,2.86.24,4.18.66l2.41-3.37c-2.04-.82-4.26-1.29-6.59-1.29C8.27,6.41.36,14.32.36,24.05c0,1.15.12,2.27.33,3.36h4.11c-.27-1.08-.44-2.2-.44-3.36Z" />
                    <path fill="#00006e" strokeWidth="0" d="M35.64,24.05c0-5.73-2.76-10.82-7-14.04l-1.74,3.72c2.9,2.5,4.74,6.19,4.74,10.32,0,1.16-.16,2.28-.44,3.36h4.11c.21-1.09.33-2.21.33-3.36Z" />
                </svg>
            );
        case 3:
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <rect fill="#ffffff" x="1" y="16" width="6" height="8" />
                    <rect fill="#ffffff" x="9" y="9" width="6" height="15" />
                    <rect fill="#ffffff" x="17" width="6" height="24" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <rect fill="#00006e" x="2.17" y="15.58" width="5.36" height="7.15" />
                    <rect fill="#00006e" x="9.32" y="9.32" width="5.36" height="13.41" />
                    <rect fill="#fc2d32" x="16.47" y="1.27" width="5.36" height="21.45" />
                </svg>
            );
        case 4:
            return isActive ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <path fill="#ffffff" d="M20.37,2.5h-2.7l.26.68c.1.26.16.55.16.82s-.05.56-.16.82l-.26.68h2.7c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z" />
                    <path fill="#ffffff" d="M12.96,2.5H1.63c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h11.33l-.26-.68c-.1-.26-.16-.55-.16-.82s.05-.55.16-.82l.26-.68Z" />
                    <path fill="#ffffff" d="M17.33,4c0-1.12-.91-2.02-2.02-2.02s-2.02.91-2.02,2.02.91,2.02,2.02,2.02,2.02-.91,2.02-2.02Z" />
                    <path fill="#ffffff" d="M14.49,16.5H1.63c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h12.85l-.26-.68c-.1-.26-.16-.55-.16-.82s.05-.56.16-.82l.26-.68Z" />
                    <path fill="#ffffff" d="M20.37,16.5h-1.18l.26.68c.1.26.16.55.16.82s-.05.56-.16.82l-.26.68h1.18c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z" />
                    <path fill="#ffffff" d="M18.89,18c0-1.12-.91-2.02-2.02-2.02s-2.02.91-2.02,2.02.91,2.02,2.02,2.02,2.02-.91,2.02-2.02Z" />
                    <path fill="#ffffff" d="M4.6,11v-.2c.02-.21.07-.42.15-.62l.26-.68H1.63c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h3.39l-.26-.68c-.1-.26-.16-.55-.16-.82Z" />
                    <path fill="#ffffff" d="M20.37,9.5h-10.65l.26.68c.1.26.16.55.16.82s-.05.56-.16.82l-.26.68h10.65c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z" />
                    <path fill="#ffffff" d="M9.39,11c0-1.12-.91-2.02-2.02-2.02s-2.02.91-2.02,2.02.91,2.02,2.02,2.02,2.02-.91,2.02-2.02Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                    <path fill="#fc2d32" d="M20.37,2.5h-2.7l.26.68c.1.26.16.55.16.82s-.05.56-.16.82l-.26.68h2.7c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z" />
                    <path fill="#fc2d32" d="M12.96,2.5H1.63c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h11.33l-.26-.68c-.1-.26-.16-.55-.16-.82s.05-.55.16-.82l.26-.68Z" />
                    <path fill="#00006e" d="M17.33,4c0-1.12-.91-2.02-2.02-2.02s-2.02.91-2.02,2.02.91,2.02,2.02,2.02,2.02-.91,2.02-2.02Z" />
                    <path fill="#fc2d32" d="M14.49,16.5H1.63c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h12.85l-.26-.68c-.1-.26-.16-.55-.16-.82s.05-.56.16-.82l.26-.68Z" />
                    <path fill="#fc2d32" d="M20.37,16.5h-1.18l.26.68c.1.26.16.55.16.82s-.05.56-.16.82l-.26.68h1.18c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z" />
                    <path fill="#00006e" d="M18.89,18c0-1.12-.91-2.02-2.02-2.02s-2.02.91-2.02,2.02.91,2.02,2.02,2.02,2.02-.91,2.02-2.02Z" />
                    <path fill="#fc2d32" d="M4.6,11v-.2c.02-.21.07-.42.15-.62l.26-.68H1.63c-.83,0-1.5.67-1.5,1.5s.67,1.5,1.5,1.5h3.39l-.26-.68c-.1-.26-.16-.55-.16-.82Z" />
                    <path fill="#fc2d32" d="M20.37,9.5h-10.65l.26.68c.1.26.16.55.16.82s-.05.56-.16.82l-.26.68h10.65c.83,0,1.5-.67,1.5-1.5s-.67-1.5-1.5-1.5Z" />
                    <path fill="#00006e" d="M9.39,11c0-1.12-.91-2.02-2.02-2.02s-2.02.91-2.02,2.02.91,2.02,2.02,2.02,2.02-.91,2.02-2.02Z" />
                </svg>
            );
        default:
            return null;
    }
};

export const MainNavBar = ({ inline = false, activeNavIndex: activeNavIndexProp = -1 }) => {
    const { pathname } = useLocation();
    const resolvedActiveNavIndex =
        activeNavIndexProp >= 0 ? activeNavIndexProp : getMainNavActiveIndex(pathname);

    if (!inline) return null;

    const headerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1048,
        height: 60,
        padding: '0 calc(1.5rem * 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: MAIN_NAV_HEADER_BG,
        boxSizing: 'border-box',
        ...SKELETON_NON_INTERACTIVE,
    };

    const logoStyle = {
        flexShrink: 0,
        lineHeight: 0,
        ...SKELETON_NON_INTERACTIVE,
    };

    const navStyle = {
        position: 'absolute',
        left: '50%',
        top: 20,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        ...SKELETON_NON_INTERACTIVE,
    };

    const headerActionsStyle = {
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        ...SKELETON_NON_INTERACTIVE,
    };

    const getHeaderActionItemStyle = (index) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minWidth: index === 2 ? 'auto' : 44,
        padding: index === 2 ? '6px 0 6px 6px' : 6,
        borderLeft: index === 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.35)',
        boxSizing: 'border-box',
        ...SKELETON_NON_INTERACTIVE,
    });

    const notificationsIcon = withSkeletonIconCursor(
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
            <path fill="#ffffff" d="M21.34,4.88H2.66c-.34,0-.62.28-.62.62s.28.62.62.62h18.68c.34,0,.62-.28.62-.62s-.28-.62-.62-.62Z" />
            <path fill="#ffffff" d="M21.34,11.38h-12.65c-.34,0-.62.28-.62.62s.28.62.62.62h12.65c.34,0,.62-.28.62-.62s-.28-.62-.62-.62Z" />
            <path fill="#ffffff" d="M21.34,17.88H5.63c-.34,0-.62.28-.62.62s.28.62.62.62h15.71c.34,0,.62-.28.62-.62s-.28-.62-.62-.62Z" />
        </svg>,
    );

    const profileAvatarStyle = {
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    };

    const profileIcon = withSkeletonIconCursor(
        <span style={{ ...profileAvatarStyle, ...SKELETON_NON_INTERACTIVE }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 135 135" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                <path
                    fill="#d8dce3"
                    d="m68.28,75.63c-15.03,0-24.73-14.53-24.73-37.03s14.69-25.81,23.45-25.81c7.6,0,13.23,1.97,16.75,5.87,4.67,4.82,6.68,12.16,6.68,24.49,0,16.17-6.85,32.48-22.15,32.48Z"
                />
                <path
                    fill="#c5cad3"
                    d="m120.81,135.2H14.19v-36.22c0-10.5,16.06-23.98,37.57-26.31l1.68-.18-.04,1.69c0,.12,0,3.17,2.53,5.74,2.35,2.38,6.12,3.59,11.2,3.59,13.8,0,14.55-9.07,14.58-9.45l.1-1.56,1.55.18c1.53.19,37.45,4.83,37.45,26.31v36.22h0Z"
                />
            </svg>
        </span>,
    );

    const logoutIcon = withSkeletonIconCursor(
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
            <path
                fill="#ffffff"
                d="M16,3.89c-.32-.13-.68.03-.81.35-.13.32.03.68.35.81,3.07,1.24,5.05,4.19,5.04,7.53,0,2.17-.84,4.21-2.37,5.75-1.53,1.53-3.55,2.38-5.71,2.38h0c-2.16,0-4.18-.84-5.71-2.38-1.53-1.53-2.37-3.57-2.37-5.75,0-3.32,1.98-6.28,5.04-7.53.32-.13.47-.5.34-.82-.13-.32-.5-.47-.82-.34-3.54,1.44-5.82,4.85-5.82,8.69,0,2.5.97,4.86,2.73,6.63s4.1,2.75,6.6,2.75h0c2.49,0,4.83-.98,6.6-2.75s2.73-4.12,2.73-6.63c.01-3.84-2.27-7.25-5.82-8.69Z"
            />
            <path
                fill="#ffffff"
                d="M12.5,11.7c.34,0,.62-.28.62-.62V2.67c0-.34-.28-.62-.62-.62s-.62.28-.62.62v8.41c0,.34.28.62.62.62Z"
            />
        </svg>,
    );

    const headerActionItems = [
        { key: 'notifications', content: notificationsIcon },
        { key: 'profile', content: profileIcon },
        { key: 'logout', content: logoutIcon },
    ];

    const headerLogo = (
        <span style={logoStyle}>
            <svg xmlns="http://www.w3.org/2000/svg" id="a" width="140" height="32" viewBox="0 0 140 32" aria-hidden="true" style={SKELETON_NON_INTERACTIVE}>
                <path d="m24.46,19.06h0c-.66-.82-1.16-1.35-1.54-1.62-.09-.07-.2-.14-.31-.2.38-.16.73-.33,1.03-.51,1.27-.77,2.28-1.78,3.01-3.02.73-1.25,1.1-2.74,1.1-4.43,0-1.94-.49-3.62-1.44-5-.97-1.38-2.26-2.35-3.83-2.86-1.48-.48-3.62-.72-6.36-.72H.93v29.54h10.34v-11.3c.58.02,1.08.17,1.52.48.2.14.62.57,1.31,1.86l4.84,8.95h11.62l-4.8-9.3c-.23-.46-.66-1.08-1.3-1.88Zm-13.18-11.04h2.93c1.78,0,2.43.33,2.66.52.38.32.55.77.55,1.42,0,.42-.12.77-.36,1.1-.24.31-.52.49-.91.56-1.39.31-1.91.36-2.09.36h-2.78v-3.96Z" fill="#fff" strokeWidth="0" />
                <polygon points="42.27 18.9 55.14 18.9 55.14 11.78 42.27 11.78 42.27 9.19 56.15 9.19 56.15 1.82 32.33 1.82 32.33 30.23 56.55 30.23 56.55 22.52 42.27 22.52 42.27 18.9" fill="#fff" strokeWidth="0" />
                <path d="m80.04,13.6c-1.84-.96-3.93-1.52-5.89-1.99-1.4-.34-2.86-.55-4.23-1.04-.26-.09-.53-.21-.72-.42-.58-.66-.31-1.73.38-2.18.45-.29,1.01-.38,1.54-.38.49,0,.99.06,1.46.22.79.29,1.34.9,1.74,1.62.24.44.54,1.13.54,1.13l9.51-.13-.12-.68c-.38-3.15-1.63-5.49-3.69-6.96-2-1.43-4.9-2.15-8.62-2.15-3,0-5.41.39-7.18,1.17-1.81.8-3.2,1.92-4.11,3.34-.92,1.42-1.39,2.96-1.39,4.57,0,2.45.92,4.98,2.73,6.56,1.71,1.5,4.55,2.71,8.44,3.59.81.18,1.63.38,2.42.65.94.32,2.49,1.01,2.27,2.27-.06.36-.32.66-.63.87-1.24.83-3.49.59-4.69-.21-1.21-.8-1.6-1.59-2.11-2.86l-.08-.25-9.47.1s.08.92.08.92c.25,2.96,1.41,5.31,3.71,7.27,2.77,2.37,6.56,2.72,10.07,2.72,2.8,0,5.17-.42,7.04-1.25,1.92-.85,3.43-2.11,4.51-3.76,1.08-1.65,1.74-3.46,1.62-5.47-.1-1.66-.72-3.28-1.75-4.58-.91-1.16-2.08-2.02-3.37-2.69Z" fill="#fff" strokeWidth="0" />
                <path d="m104.38,19.17c0,1.3-.33,2.29-.97,2.96-.65.68-1.56,1.01-2.76,1.01s-2.12-.33-2.78-1.02c-.66-.69-.97-1.66-.97-2.95V1.8h-9.91v16.98c0,1.44.27,3.11.8,4.95.35,1.21,1,2.4,1.93,3.52.92,1.12,1.96,1.99,3.08,2.6,1.12.61,2.51,1.02,4.15,1.22,1.57.19,3.03.29,4.36.29,2.34,0,4.38-.33,6.07-.98,1.26-.48,2.48-1.33,3.61-2.5,1.14-1.18,1.98-2.58,2.51-4.15.52-1.54.79-3.21.79-4.94V1.8h-9.91v17.37Z" fill="#fff" strokeWidth="0" />
                <polygon points="126.16 1.82 116.24 1.82 116.24 30.23 139.07 30.23 139.07 21.99 126.16 21.99 126.16 1.82" fill="#fff" strokeWidth="0" />
            </svg>
        </span>
    );
    return (
        <header style={headerStyle}>
            {headerLogo}
            <ul style={navStyle} aria-hidden="true">
                {MAIN_NAV_ICON_SIZES.map((_, index) => (
                    <li key={index} style={getMainNavItemStyle(index, resolvedActiveNavIndex)}>
                        {withSkeletonIconCursor(getNavIconSvg(index, resolvedActiveNavIndex === index))}
                    </li>
                ))}
            </ul>
            <div style={headerActionsStyle} aria-hidden="true">
                {headerActionItems.map((item, index) => (
                    <span key={item.key} style={getHeaderActionItemStyle(index)}>
                        {item.content}
                    </span>
                ))}
            </div>
        </header>
    );
};

MainNavBar.propTypes = {
    inline: PropTypes.bool,
    activeNavIndex: PropTypes.number,
};

const resolveLayer = ({ layer: layerProp, contentOnly, withAppShell }) =>
    layerProp ??
    (contentOnly ? PAGE_LOADING_LAYER.BODY : withAppShell ? PAGE_LOADING_LAYER.BOOTSTRAP : PAGE_LOADING_LAYER.ROUTE);

/**
 * One factory for bootstrap / Suspense / in-page layers.
 * Tabbed routes: pass TabBodySkeleton + PageShellSkeleton (+ optional getTabBodyProps).
 * Other routes: pass BodySkeleton (+ optional renderFullPage, InlineBlock).
 */
export function createPageLoadingScene({
    scopeClass,
    suspenseFallbackClass,
    ariaLabel,
    pageCriticalCss,
    markRouteSkeleton,
    loadingHolderStyle = null,
    TabBodySkeleton,
    PageShellSkeleton,
    getTabBodyProps,
    BodySkeleton,
    renderFullPage,
    InlineBlock,
    extraStyles = null,
    skipSharedCriticalCss = false,
}) {
    const isTabbed = Boolean(TabBodySkeleton && PageShellSkeleton);

    const SkeletonStyles = () => (
        <>
            {!skipSharedCriticalCss ? <style>{skeletonShellSharedCriticalCss}</style> : null}
            {pageCriticalCss ? <style>{pageCriticalCss}</style> : null}
            {extraStyles}
        </>
    );

    const renderTabBody = (tabIndex) => {
        const extra = getTabBodyProps?.(tabIndex) ?? {};
        return <TabBodySkeleton tabIndex={tabIndex} {...extra} />;
    };

    const renderBodyOnly = (tabIndex = 0, bodyProps = {}) => {
        if (isTabbed) return renderTabBody(tabIndex);
        if (InlineBlock) return <InlineBlock {...bodyProps} />;
        return <BodySkeleton {...bodyProps} />;
    };

    const renderFullContent = (tabIndex = 0, bodyProps = {}) => {
        if (isTabbed) {
            return (
                <>
                    <SkeletonStyles />
                    <PageShellSkeleton tabIndex={tabIndex}>{renderTabBody(tabIndex)}</PageShellSkeleton>
                </>
            );
        }
        const body = <BodySkeleton {...bodyProps} />;
        return (
            <>
                <SkeletonStyles />
                {renderFullPage ? renderFullPage(body, bodyProps) : body}
            </>
        );
    };

    const PageContentSkeleton = ({ tabIndex = 0, inline = false, wrapScope = true, ...bodyProps }) => {
        if (inline) {
            return (
                <>
                    <SkeletonStyles />
                    {renderBodyOnly(tabIndex, bodyProps)}
                </>
            );
        }

        const shell = renderFullContent(tabIndex, bodyProps);
        if (!wrapScope) return shell;
        return <div className={scopeClass}>{shell}</div>;
    };

    const RouteSkeleton = ({
        activeTabIndex = 0,
        withAppShell = false,
        activeNavIndex = -1,
        contentOnly = false,
        layer: layerProp,
        ...bodyProps
    }) => {
        const layer = resolveLayer({ layer: layerProp, contentOnly, withAppShell });

        const body =
            layer === PAGE_LOADING_LAYER.BODY ? (
                renderBodyOnly(activeTabIndex, bodyProps)
            ) : (
                <PageContentSkeleton
                    tabIndex={activeTabIndex}
                    wrapScope={false}
                    {...bodyProps}
                />
            );

        if (layer === PAGE_LOADING_LAYER.BOOTSTRAP) {
            return (
                <>
                    <style>{pageLayoutSkeletonCriticalCss}</style>
                    <SkeletonStyles />
                    <div
                        className={`page-content-holder ${scopeClass} page-layout-skeleton--inline`}
                        aria-busy="true"
                        aria-label={ariaLabel}
                    >
                        <MainNavBar activeNavIndex={activeNavIndex} inline />
                        <div>{body}</div>
                    </div>
                </>
            );
        }

        const routeClass =
            layer === PAGE_LOADING_LAYER.ROUTE && suspenseFallbackClass ? ` ${suspenseFallbackClass}` : '';

        return (
            <div
                className={`page-content-holder ${scopeClass}${routeClass}`.trim()}
                style={loadingHolderStyle ?? undefined}
                aria-busy="true"
                aria-label={ariaLabel}
            >
                {body}
            </div>
        );
    };

    const SuspenseFallback = (props = {}) => {
        const { pathname, search } = useLocation();
        const tabIndex = isTabbed ? getRouteTabIndex(pathname, search) : props.tabIndex ?? 0;

        useLayoutEffect(() => {
            markRouteSkeleton?.();
        }, []);

        return (
            <div
                className={`page-content-holder ${suspenseFallbackClass} ${scopeClass}`.trim()}
                style={loadingHolderStyle ?? undefined}
                aria-busy="true"
                aria-label={ariaLabel}
            >
                <PageContentSkeleton tabIndex={tabIndex} wrapScope={false} {...props} />
            </div>
        );
    };

    return {
        PageContentSkeleton,
        RouteSkeleton,
        SuspenseFallback,
        SkeletonStyles,
        renderTabBody: isTabbed ? renderTabBody : undefined,
        renderBodyOnly,
    };
}

/** @deprecated use createPageLoadingScene — same API when TabBody + PageShell are passed */
export const createTabbedPageLoadingScene = createPageLoadingScene;

export default createPageLoadingScene;
