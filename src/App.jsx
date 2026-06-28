import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
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
    isGenieEnabledForSelectedDepartment,
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
    prefetchRouteModule,
} from './Utils/modules/postLoginShell';
import { getEnvironment } from './Utils/modules/environment';
import { mountFullAppReducer, isFullReducerMounted } from 'Store/mountFullAppReducer';
import {
    genielogowhite,
    genieTextWhite,
    genieLogoWhiteWithoutStar,
    useResulGenieAppLastActiveSpaceQuerySync,
    useResulGenieShellStylesIsolation,
    RESUL_GENIE_ACCESS_STRICT_MODE,
} from 'resul-genie-ui';
import RSLoader from 'Components/Loader';
import { isPublicAuthPath } from './Routes/appRouteConfig';

function App() {
    const dispatch = useDispatch();
    const location = useLocation();
    const { pathname, search } = location;
    const isLoginPage = pathname === '/';
    const isPublicAuthRoute = isPublicAuthPath(pathname);
    const {
        departmentListRedux,
        selectedDepartmentId,
        departmentChangePending,
        showSessionModal,
        isAuth,
        accountAdminClientId,
    } = useSelector(
        (state) => ({
            departmentListRedux: state.globalstate?.departmentList,
            selectedDepartmentId: state.globalstate?.departmentId?.departmentId,
            departmentChangePending: state.globalstate?.departmentChangePending,
            showSessionModal: state.globalstate?.showSessionModal,
            isAuth: state.globalstate?.isAuth,
            accountAdminClientId: state.globalstate?.accountAdmin?.clientId,
        }),
        shallowEqual,
    );
    const departmentListForGenie = useMemo(
        () => (Array.isArray(departmentListRedux) ? departmentListRedux : []),
        [departmentListRedux],
    );
    const genieEnabledForAccount =
        !RESUL_GENIE_ACCESS_STRICT_MODE ||
        isGenieEnabledForSelectedDepartment(departmentListForGenie, selectedDepartmentId);
    const showGenie = genieEnabledForAccount && !departmentChangePending;
    const isGenieUIRoute = pathname.startsWith('/genie');
    const isGenieShellRoute = pathname === '/genie' || pathname.startsWith('/genie/');
    const isGenieStylesIsolationActive = isGenieShellRoute && !showSessionModal;
    useResulGenieShellStylesIsolation(isGenieStylesIsolationActive);
    const [isAppStylesLoaded, setIsAppStylesLoaded] = useState(() => isAppShellStylesLoaded());
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
    const showAppLoaderFallback = !isLoginPage && (!isAppStylesLoaded || !isAppShellReady);

    const [online, offline] = useState(() => {
        if (navigator.onLine) {
            return true;
        } else {
            return false;
        }
    });
    const [isGenieLogoHover, setIsGenieLogoHover] = useState(false);
    const handleOpenGenie = () => {
        if (!genieEnabledForAccount) return;
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        sessionStorage.setItem('genie-return-url', currentUrl || '/dashboard');
        navigate('/genie');
        setIsGenieLogoHover(false);
    };
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

    useResulGenieAppLastActiveSpaceQuerySync(search, pathname, navigate);

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
        const isMasterData = localStorage.getItem('masterData');
        if (isMasterData === 'null' || isMasterData === undefined || isMasterData === null)
            dispatch(getMasterData(false));

        // Clean up old query states from sessionStorage on app load
        cleanupOldQueryStates();
    }, []);
    useLayoutEffect(() => {
        if (isLoginPage || isPublicAuthRoute) return;
        void prefetchRouteModule(pathname);
    }, [pathname, isLoginPage, isPublicAuthRoute]);

    useEffect(() => {
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
        const onShellReady = () => setIsAppStylesLoaded(true);
        window.addEventListener(POST_LOGIN_SHELL_READY_EVENT, onShellReady);
        return () => window.removeEventListener(POST_LOGIN_SHELL_READY_EVENT, onShellReady);
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
                    handleCSSLoad('/aiemailbuildercss.css?v2.0.4');
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
                <section className={isLoginPage ? 'rs-page-content-wrapper-container' : ''}>
                    {showAppLoaderFallback && !isPublicAuthRoute && (
                        <div
                            className="app-boot-skeleton-overlay"
                            aria-hidden="true"
                            style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
                        >
                            <MainPageSkeleton withAppShell />
                        </div>
                    )}
                    {isAppStylesLoaded && (isLoginPage || isAppShellReady) && (
                        <>
                            {(!isPublicAuthRoute || pathname !== '/') && (
                                <RSHeader isNoAuth={isPublicAuthRoute} />
                            )}
                            <MainRoutes />
                        </>
                    )}
                    <div className={showSessionModal ? 'genie-timeout' : ''}>
                        {showGenie && !isPublicAuthRoute && !isGenieUIRoute && isAppStylesLoaded && (
                            <div
                                className="floating-logo"
                                onClick={handleOpenGenie}
                                onMouseEnter={() => setIsGenieLogoHover(true)}
                                onMouseLeave={() => setIsGenieLogoHover(false)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleOpenGenie();
                                    }
                                }}
                                aria-label="Open Genie"
                            >
                                <div className="floating-logo__inner">
                                    <img
                                        src={isGenieLogoHover ? genielogowhite : genieLogoWhiteWithoutStar}
                                        alt=""
                                        className="floating-logo__image"
                                    />
                                    <img src={genieTextWhite} alt="" className="floating-logo__text" />
                                </div>
                            </div>
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
