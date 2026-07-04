import { useEffect, useLayoutEffect, useRef, useState, lazy, Suspense } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastifyNotificationIcon } from 'Utils/ToastifyNotificationIcon';
import MainPageSkeleton from 'Components/Skeleton/Components/MainPageSkeleton';
import RSFooter from 'Components/RSFooter';
import RSHeader from 'Components/RSHeader';
import MainRoutes from './Routes/MainRoutes';
import ErrorBoundary from 'Components/ErrorBoundary';
import SessionTimeout from 'Components/SessionTimeout';
import NetworkLostAlert from 'Components/NetworkLostAlert';
import CaSupport from './Pages/RegistrationModule/Login/Component/CASupport/index';
import { ToasterContainer } from 'Components/CustomToast/CustomToast';

import { getMasterData, repairPersistedGlobalListsIfNeeded } from 'Reducers/globalState/request';
import { setTabforEdit, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import {
    reset_failures_API_Errors,
    updateAuth,
    updateSessionModal,
    updatedisLicenseId,
} from 'Reducers/globalState/reducer';
import {
    encodeUrl,
    getUserDetails,
    cleanupOldQueryStates,
} from './Utils/modules/crypto';
import {
    handleCSSLoad,
    handleCSSUnload,
    reenableGenieDisabledStyles, whenHostStylesheetsApplied,
} from './Utils/modules/cssDom';
import {
    loadAppShellStyles,
    isAppShellStylesLoaded,
    isLoginHandoffActive,
    POST_LOGIN_SHELL_READY_EVENT,
    SESSION_RECOVERED_EVENT,
    prefetchRouteModule,
} from './Utils/modules/postLoginShell';
import { resetModalShellAfterSessionRecovery } from 'Hooks/useBodyPointerLock';
import { getEnvironment } from './Utils/modules/environment';
import { mountFullAppReducer, isFullReducerMounted } from 'Store/mountFullAppReducer';
import RSLoader, { LoginRouteLoading } from 'Components/Loader';
import { isPublicAuthPath } from './Routes/appRouteConfig';
import { navigateToLoginAfterSessionClear } from 'Reducers/login/existingUser/request';
import '@progress/kendo-theme-default/dist/all.css';

const resolveInitialAppStylesLoaded = () => {
    if (typeof window !== 'undefined' && isPublicAuthPath(window.location.pathname)) {
        return true;
    }
    return isAppShellStylesLoaded();
};

const GenieHostFeatures = lazy(() => import('Components/GenieHost/GenieHostFeatures'));

function isMasterDataCacheMissing() {
    const raw = localStorage.getItem('masterData');
    if (raw == null || raw === '' || raw === 'null') return true;
    try {
        const parsed = JSON.parse(raw);
        return parsed == null || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).length === 0;
    } catch {
        return true;
    }
}

function App() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { pathname, search } = location;
    const isLoginPage = pathname === '/';
    const isPublicAuthRoute = isPublicAuthPath(pathname);
    const {
        showSessionModal,
        isAuth,
        accountAdminClientId,
    } = useSelector(
        (state) => ({
            showSessionModal: state.globalstate?.showSessionModal,
            isAuth: state.globalstate?.isAuth,
            accountAdminClientId: state.globalstate?.accountAdmin?.clientId,
        }),
        shallowEqual,
    );
    const isGenieShellRoute = pathname === '/genie' || pathname.startsWith('/genie/');
    const isGenieStylesIsolationActive = isGenieShellRoute && !showSessionModal;
    const [isAppStylesLoaded, setIsAppStylesLoaded] = useState(resolveInitialAppStylesLoaded);
    const wasGenieIsolatedRef = useRef(isGenieStylesIsolationActive);

    // Leaving the Genie shell (exit Genie, or redirect to the platform from communication /
    // segmentation edit / email builder): re-enable the host stylesheets and show RSLoader
    // until the platform CSS is re-applied, so the platform never flashes unstyled.
    useLayoutEffect(() => {
        const wasIsolated = wasGenieIsolatedRef.current;
        wasGenieIsolatedRef.current = isGenieStylesIsolationActive;
        if (isGenieStylesIsolationActive) return;
        reenableGenieDisabledStyles();
        if (wasIsolated) setIsAppStylesLoaded(false);
    }, [isGenieStylesIsolationActive]);
    const env = getEnvironment();
    const navigate = useNavigate();
    const hasToken = !!localStorage.getItem('accessToken');
    const needsFullReducer = isAuth || hasToken;
    // Keep login.scss on the login route; do not pull app.scss/Kendo until leaving `/`.
    const shouldLoadStyles = showSessionModal || (needsFullReducer && !isLoginPage);
    const [fullReducerReady, setFullReducerReady] = useState(() => isFullReducerMounted());
    // Never hide login routes while the full reducer is still mounting (e.g. stale token on `/`).
    const isAppShellReady = isLoginPage || !needsFullReducer || fullReducerReady || isFullReducerMounted();
    const showAppLoaderFallback =
        !isLoginPage &&
        (!isAppStylesLoaded || !isAppShellReady || (!isPublicAuthRoute && !hasToken));
    const canAccessProtectedShell = isPublicAuthRoute || hasToken;
    const canRenderRoutes =
        isAppStylesLoaded && (isLoginPage || isAppShellReady) && canAccessProtectedShell;

    const [online, offline] = useState(() => navigator.onLine);
    useEffect(() => {
        window.ononline = () => {
            offline(true);
        };
        window.onoffline = () => {
            offline(false);
        };
        return () => {
            window.ononline = null;
            window.onoffline = null;
        };
    }, []);
    //Disable web history back and added hash query string
    useEffect(() => {
        const hashVal = !!window.location.hash ? '?' + window.location.hash : '';
        window.history.pushState(null, null, window.location.pathname + window.location.search + hashVal);
        window.onpopstate = function () {
            window.history.go();
        };
    }, []);

    useEffect(() => {
        dispatch(reset_failures_API_Errors());
    }, [dispatch]);

    // Clear stale session-timeout flag on login so Http does not block sign-in POSTs
    useEffect(() => {
        if (!isPublicAuthRoute) return;
        localStorage.setItem('sessionModal', 'false');
        dispatch(updateSessionModal(false));
    }, [dispatch, isPublicAuthRoute]);

    // Handle authentication on mount (fixes reload issue)
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token || isAuth) return;
        let cancelled = false;
        (async () => {
            if (!isFullReducerMounted()) {
                await mountFullAppReducer();
            }
            if (!cancelled) {
                dispatch(updateAuth(true));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [dispatch, isAuth]);

    useEffect(() => {
        if (!needsFullReducer) {
            setFullReducerReady(true);
            return;
        }
        if (isFullReducerMounted()) {
            setFullReducerReady(true);
            return;
        }
        let cancelled = false;
        mountFullAppReducer().then(() => {
            if (!cancelled) setFullReducerReady(true);
        });
        const onMounted = () => {
            if (!cancelled) setFullReducerReady(true);
        };
        window.addEventListener('resul:full-reducer-mounted', onMounted);
        return () => {
            cancelled = true;
            window.removeEventListener('resul:full-reducer-mounted', onMounted);
        };
    }, [needsFullReducer]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const { licenseTypeId } = getUserDetails() ?? {};
        const n = parseInt(licenseTypeId, 10);
        if (Number.isFinite(n) && n > 0) {
            dispatch(updatedisLicenseId(n));
        }
        void dispatch(repairPersistedGlobalListsIfNeeded());
    }, [dispatch]);

    useEffect(() => {
        const builderTab = new URLSearchParams(search).get('builder');
        if (builderTab !== null) {
            dispatch(
                setTabforEdit({
                    type: 'notification',
                    currentTab: 2,
                }),
            );
            dispatch(
                updateTab({
                    field: 'notification',
                    data: {
                        tabName: builderTab,
                        currentIndex: builderTab === 'web' ? 0 : 1,
                    },
                }),
            );
        }
    }, [search]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return () => {};
        const onContextMenu = (e) => {
            const target = e.target;
            const isLink = target?.tagName === 'A' || target?.closest?.('a') || target?.hasAttribute?.('href');
            if (!isLink) {
                e.preventDefault();
            }
        };
        document.addEventListener('contextmenu', onContextMenu);
        return () => document.removeEventListener('contextmenu', onContextMenu);
    }, []);
    useEffect(() => {
        cleanupOldQueryStates();
    }, []);

    useLayoutEffect(() => {
        if (isPublicAuthRoute) return;
        if (localStorage.getItem('accessToken')) return;
        navigateToLoginAfterSessionClear(dispatch, navigate);
    }, [dispatch, navigate, isPublicAuthRoute]);

    useEffect(() => {
        if (isPublicAuthRoute) return;

        const validateClientSession = () => {
            if (document.visibilityState === 'hidden') return;
            if (localStorage.getItem('accessToken')) return;
            navigateToLoginAfterSessionClear(dispatch, navigate);
        };

        window.addEventListener('focus', validateClientSession);
        document.addEventListener('visibilitychange', validateClientSession);
        return () => {
            window.removeEventListener('focus', validateClientSession);
            document.removeEventListener('visibilitychange', validateClientSession);
        };
    }, [dispatch, navigate, isPublicAuthRoute]);

    useEffect(() => {
        if (isPublicAuthRoute || !hasToken) return;
        if (!isMasterDataCacheMissing()) return;
        dispatch(getMasterData(false));
    }, [dispatch, isPublicAuthRoute, hasToken, pathname]);

    useEffect(() => {
        if (isPublicAuthRoute || !hasToken) return;

        const refetchMasterDataIfMissing = () => {
            if (document.visibilityState === 'hidden') return;
            if (!isMasterDataCacheMissing()) return;
            dispatch(getMasterData(false));
        };

        window.addEventListener('focus', refetchMasterDataIfMissing);
        document.addEventListener('visibilitychange', refetchMasterDataIfMissing);
        return () => {
            window.removeEventListener('focus', refetchMasterDataIfMissing);
            document.removeEventListener('visibilitychange', refetchMasterDataIfMissing);
        };
    }, [dispatch, isPublicAuthRoute, hasToken]);
    useLayoutEffect(() => {
        if (isLoginPage || isPublicAuthRoute) return;
        void prefetchRouteModule(pathname);
    }, [pathname, isLoginPage, isPublicAuthRoute]);

    useLayoutEffect(() => {
        if (!shouldLoadStyles || isPublicAuthRoute) {
            setIsAppStylesLoaded(true);
            return;
        }
        if (isGenieStylesIsolationActive) {
            setIsAppStylesLoaded(true);
            return;
        }
        if (isAppShellStylesLoaded()) {
            setIsAppStylesLoaded(true);
            if (!isPublicAuthRoute && !isLoginPage) void prefetchRouteModule(pathname);
            return;
        }

        setIsAppStylesLoaded(false);
        if (!isPublicAuthRoute && !isLoginPage) void prefetchRouteModule(pathname);

        let cancelled = false;
        let cancelWait = () => {};
        loadAppShellStyles()
            .then(() => {
                if (cancelled) return;
                reenableGenieDisabledStyles();
                cancelWait = whenHostStylesheetsApplied(() => {
                    if (!cancelled) setIsAppStylesLoaded(true);
                });
            })
            .catch((err) => {
                console.error('Failed to load global styles:', err);
                if (!cancelled) setIsAppStylesLoaded(true);
            });

        return () => {
            cancelled = true;
            cancelWait();
        };
    }, [shouldLoadStyles, isGenieShellRoute, isPublicAuthRoute, showSessionModal, isGenieStylesIsolationActive, pathname, isLoginPage]);

    useEffect(() => {
        const onShellReady = () => {
            if (isAppShellStylesLoaded()) setIsAppStylesLoaded(true);
        };
        window.addEventListener(POST_LOGIN_SHELL_READY_EVENT, onShellReady);
        return () => window.removeEventListener(POST_LOGIN_SHELL_READY_EVENT, onShellReady);
    }, []);

    useEffect(() => {
        if (showSessionModal) return;
        requestAnimationFrame(resetModalShellAfterSessionRecovery);
    }, [showSessionModal]);

    useEffect(() => {
        const onSessionRecovered = () => {
            requestAnimationFrame(resetModalShellAfterSessionRecovery);
        };
        window.addEventListener(SESSION_RECOVERED_EVENT, onSessionRecovered);
        return () => window.removeEventListener(SESSION_RECOVERED_EVENT, onSessionRecovered);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!isAuth && !token) return;
        const loadScriptOnce = (id, src, attrs = {}) => {
            if (document.getElementById(id)) return;
            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            script.defer = true;
            Object.entries(attrs).forEach(([key, value]) => {
                script.setAttribute(key, value);
            });
            document.body.appendChild(script);
        };

        loadScriptOnce('thirdparty-socket-io', 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js');
        loadScriptOnce('thirdparty-resul-sdk', 'https://sdk.resul.io/handlers/d24f9dd3ccc7416680164c2b6470e615.sdk', {
            fcm_service_path: 'firebase-messaging-sw.js',
        });
        loadScriptOnce('thirdparty-entri', 'https://cdn.goentri.com/entri.js', { type: 'text/javascript' });
    }, [isAuth]);

    useEffect(() => {
        //Add promo code
        if (new URLSearchParams(window.location.search).get('code') === null) {
            localStorage.setItem('cpCode', '');
            localStorage.setItem('promoCode', '');
        } else {
            localStorage.setItem('cpCode', new URLSearchParams(window.location.search).get('code'));
            localStorage.setItem('promoCode', new URLSearchParams(window.location.search).get('promocode'));
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        if (
            pathname?.endsWith('/email-builder') ||
            pathname?.endsWith('/footer-builder') ||
            pathname?.endsWith('/offer-builder')
        ) {
            document.documentElement.classList = 'rsp-email-builder-theme';
            const loadBuilderStyles = async () => {
                try {
                    await import('Styles/app.scss');
                } catch (error) {
                    console.error('Failed to load Styles/app.scss', error);
                }

                if (!cancelled) {
                    handleCSSLoad('/aiemailbuildercss.css?v2.0.5');
                }
            };

            loadBuilderStyles();
        } else {
            document.documentElement.classList = '';
            handleCSSUnload();
        }

        return () => {
            cancelled = true;
        };
    }, [pathname]);

    useEffect(() => {
        if (typeof showSessionModal === 'boolean') {
            localStorage.setItem('sessionModal', showSessionModal);
        }
    }, [showSessionModal]);

    useEffect(() => {
        if (!showSessionModal || !isGenieShellRoute) return;

        const returnUrl = `${pathname}${search}${window.location.hash}`;
        sessionStorage.setItem('genie-return-url', returnUrl || '/dashboard');

        const encryptState = encodeUrl({ index: 0 });
        navigate(`/dashboard?q=${encryptState}`, { replace: true });
    }, [showSessionModal, isGenieShellRoute, pathname, search, navigate]);

    useEffect(() => {
        const isSession = localStorage.getItem('accessToken');
        if (!isAuth || !isSession) return;

        const mid = new URLSearchParams(window.location.search).get('mid');
        const id = new URLSearchParams(window.location.search).get('id');
        const lkey = new URLSearchParams(window.location.search).get('lkey');
        const decodedValue = mid ? atob(mid) : null;
        const urlId = decodedValue ? Number(decodedValue) : NaN;
        const parentClientID = Number(accountAdminClientId);
        const clientID = id ? Number(atob(id)) : NaN;

        if (!isNaN(urlId) && !isNaN(parentClientID) && !isNaN(clientID)) {
            const state = {
                clientId: clientID,
                urlParentId: urlId,
                LoginName: '',
                LoginPassword: '',
                from: 'companies',
                isLicenseKeyValue: lkey ? atob(lkey) : '',
                isMailActivation: true,
            };
            const url = '/preferences/company-list/account-activate';
            const encryptState = encodeUrl(state);
            navigate(`${url}?q=${encryptState}`, { state });
            return;
        }

        if (pathname === '/' && isAppShellReady && !isLoginHandoffActive()) {
            const url = '/dashboard';
            const state1 = { index: Number(0) };
            const encryptState = encodeUrl(state1);
            navigate(`${url}?q=${encryptState}`, { state: { index: 0 } });
        }
    }, [accountAdminClientId, isAuth, navigate, pathname, isAppShellReady]);

    return (
        <ErrorBoundary>
            <ToastContainer
                hideProgressBar={false}
                pauseOnFocusLoss={false}
                autoClose={false}
                newestOnTop
                closeOnClick
                style={{ zIndex: 100000000 }}
                icon={({ type }) => <ToastifyNotificationIcon type={type} />}
            />
            <RSLoader />
            <ToasterContainer />
            <div>
                <section
                    className={
                        isLoginPage ? 'rs-page-content-wrapper-container login-route-loading' : ''
                    }
                >
                    {showAppLoaderFallback && !isPublicAuthRoute && (
                        <div
                            className="app-boot-skeleton-overlay"
                            aria-hidden="true"
                            style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
                        >
                            <MainPageSkeleton withAppShell />
                        </div>
                    )}
                    {isLoginPage && !canRenderRoutes && <LoginRouteLoading />}
                    {canRenderRoutes && (
                        <>
                            {(!isPublicAuthRoute || pathname !== '/') && (
                                <RSHeader isNoAuth={isPublicAuthRoute} />
                            )}
                            <MainRoutes />
                        </>
                    )}
                    <div className={showSessionModal ? 'genie-timeout' : ''}>
                        {!isPublicAuthRoute && (
                            <Suspense fallback={null}>
                                <GenieHostFeatures
                                    isGenieStylesIsolationActive={isGenieStylesIsolationActive}
                                    search={search}
                                    pathname={pathname}
                                    isAppStylesLoaded={isAppStylesLoaded}
                                />
                            </Suspense>
                        )}
                    </div>
                </section>
            </div>
            {isAuth && env !== 'TEAM' && isAppStylesLoaded && <CaSupport />}
            {!isGenieShellRoute && isAppStylesLoaded && <RSFooter />}
            {!isPublicAuthRoute && showSessionModal && isAppStylesLoaded && <SessionTimeout />}
            <NetworkLostAlert online={online} />
        </ErrorBoundary>
    );
}

export default App;
