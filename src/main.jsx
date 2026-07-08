import history from 'Utils/history';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { useLocation } from 'react-router-dom';
import { captureRuntimeError, installRuntimeConsoleCapture } from 'Utils/RSPLogger/RSPLogger';

installRuntimeConsoleCapture();

if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        captureRuntimeError({
            type: 'window-error',
            message: event.message,
            stack: event.error?.stack,
            source: `${event.filename}:${event.lineno}:${event.colno}`,
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        captureRuntimeError({
            type: 'unhandled-rejection',
            message: reason?.message || String(reason),
            stack: reason?.stack,
        });
    });
}

import CustomRouter from 'Hoc/CustomRouter';
import MainPageSkeleton from 'Components/Skeleton/Components/MainPageSkeleton';
import { LoginRouteLoading } from 'Components/Loader';
import { isPublicAuthPath } from './Routes/appRouteConfig';
import './i18n';
import 'Styles/login.scss';

(function normalizeGenieDuplicatePrefix() {
    if (typeof window === 'undefined') return;
    const fix = (url) => (typeof url === 'string' ? url.replace(/^(\/genie){2,}(?=\/|$)/, '/genie') : url);
    const { pathname, search, hash } = window.location;
    const fixed = fix(pathname);
    if (fixed !== pathname) window.history.replaceState(null, '', `${fixed}${search}${hash}`);
    for (const method of ['pushState', 'replaceState']) {
        const orig = window.history[method];
        window.history[method] = function (state, title, url) { return orig.call(this, state, title, fix(url)); };
    }
})();

function BootSkeletonFallback() {
    const { pathname } = useLocation();
    if (isPublicAuthPath(pathname)) {
        return <LoginRouteLoading />;
    }
    return <MainPageSkeleton withAppShell />;
}

function renderEarlyBootSkeleton(pathname = '') {
    const skeleton = isPublicAuthPath(pathname) ? <LoginRouteLoading /> : <MainPageSkeleton withAppShell />;
    return <CustomRouter history={history}>{skeleton}</CustomRouter>;
}

const rootElement = document.getElementById('root');

/** Protected routes require accessToken in LS; stale redux-persist isAuth alone is not enough. */
function redirectToLoginWhenClientSessionMissing(pathname = '') {
    if (isPublicAuthPath(pathname)) return false;
    if (localStorage.getItem('accessToken')) return false;
    try {
        sessionStorage.clear();
    } catch {
        // ignore storage errors
    }
    window.location.replace('/');
    return true;
}

async function bootstrap() {
    if (!rootElement) {
        console.error('Root element #root not found');
        return;
    }

    const bootPathname = window.location.pathname;
    if (redirectToLoginWhenClientSessionMissing(bootPathname)) {
        return;
    }

    const existingRoot = globalThis.__appRoot;
    const root = existingRoot || createRoot(rootElement);
    if (!existingRoot) {
        globalThis.__appRoot = root;
    }

    const isLoginBoot = isPublicAuthPath(bootPathname);

    root.render(renderEarlyBootSkeleton(bootPathname));

    const storeModulePromise = import('./Store');
    const shellModulePromise = isLoginBoot ? import('./LoginApp') : import('./App');

    if (isLoginBoot) {
        void import('Pages/RegistrationModule/Login');
        void import('./App');
    } else {
        void import('./Utils/modules/postLoginShell').then(({ prefetchRouteModule, loadAppShellStyles }) => {
            prefetchRouteModule(bootPathname);
            return loadAppShellStyles();
        });
    }

    const [{ default: createReduxStore }, { default: ShellApp }] = await Promise.all([
        storeModulePromise,
        shellModulePromise,
    ]);

    const { store, persistor, setFullReducer } = await createReduxStore();
    if (!store) {
        console.error('Redux store failed to initialize');
        return;
    }
    store.__setFullReducer = setFullReducer;

    root.render(
        <CustomRouter history={history}>
            <Provider store={store}>
                <PersistGate loading={<BootSkeletonFallback />} persistor={persistor}>
                    <ShellApp />
                </PersistGate>
            </Provider>
        </CustomRouter>,
    );
}

bootstrap();
