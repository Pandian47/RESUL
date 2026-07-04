import { lazy, Suspense, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import ErrorBoundary from 'Components/ErrorBoundary';
import NetworkLostAlert from 'Components/NetworkLostAlert';
import { LoginRouteLoading } from 'Components/Loader';
import { ToasterContainer } from 'Components/CustomToast/CustomToast';
import RSHeader from 'Components/RSHeader';
import LoginRoutes from './Routes/LoginRoutes';
import { reset_failures_API_Errors, updateSessionModal } from 'Reducers/globalState/reducer';
import { cleanupOldQueryStates } from './Utils/modules/crypto';
import { clearClientSessionForLoginRedirect } from 'Reducers/login/existingUser/request';

const FullApp = lazy(() => import('./App'));

function LoginAppShell() {
    const dispatch = useDispatch();
    const state = useLocation();
    const pathname =  state?.pathname || '';
    const isLoginPage = pathname === '/';
    const [online, setOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        window.ononline = () => setOnline(true);
        window.onoffline = () => setOnline(false);
        return () => {
            window.ononline = null;
            window.onoffline = null;
        };
    }, []);

    useEffect(() => {
        const hashVal = window.location.hash ? `?${window.location.hash}` : '';
        window.history.pushState(
            null,
            null,
            window.location.pathname + window.location.search + hashVal,
        );
        window.onpopstate = function onPopState() {
            window.history.go();
        };
    }, []);

    useEffect(() => {
        dispatch(reset_failures_API_Errors());
    }, [dispatch]);

    useEffect(() => {
        localStorage.setItem('sessionModal', 'false');
        dispatch(updateSessionModal(false));
    }, [dispatch]);

    useEffect(() => {
        cleanupOldQueryStates();
    }, []);

    return (
        <ErrorBoundary>
            <ToasterContainer />
            <div>
                <section
                    className={
                        isLoginPage ? 'rs-page-content-wrapper-container login-route-loading' : ''
                    }
                >
                    {!isLoginPage && <RSHeader isNoAuth />}
                    <LoginRoutes />
                </section>
            </div>
            <NetworkLostAlert online={online} />
        </ErrorBoundary>
    );
}

/**
 * Lightweight login/registration shell — avoids pulling the full App bundle on `/`.
 * Upgrades to App after sign-in or when restoring a session with a stored token.
 */
export default function LoginApp() {
    const dispatch = useDispatch();
    const { isAuth } = useSelector(
        (state) => ({
            isAuth: state.globalstate?.isAuth,
        }),
        shallowEqual,
    );
    const hasToken = !!localStorage.getItem('accessToken');
    const [upgradeFullApp, setUpgradeFullApp] = useState(hasToken);

    useEffect(() => {
        if (hasToken) {
            setUpgradeFullApp(true);
            return;
        }
        if (isAuth) {
            clearClientSessionForLoginRedirect(dispatch);
        }
    }, [hasToken, isAuth, dispatch]);

    if (upgradeFullApp) {
        return (
            <Suspense fallback={<LoginRouteLoading />}>
                <FullApp />
            </Suspense>
        );
    }

    return <LoginAppShell />;
}
