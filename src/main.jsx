import history from 'Utils/history';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { PersistGate } from 'redux-persist/integration/react';
import { useLocation } from 'react-router-dom';

import CustomRouter from 'Hoc/CustomRouter';
import MainPageSkeleton from 'Components/Skeleton/Components/MainPageSkeleton';
import { isPublicAuthPath } from './Routes/appRouteConfig';
import './i18n';
import 'Styles/login.scss';
import 'react-toastify/dist/ReactToastify.css';

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
    if (isPublicAuthPath(pathname)) return null;
    return <MainPageSkeleton withAppShell />;
}

function shouldShowBootSkeleton(pathname = '') {
    return !isPublicAuthPath(pathname);
}

const rootElement = document.getElementById('root');

async function bootstrap() {
    if (!rootElement) {
        console.error('Root element #root not found');
        return;
    }

    const existingRoot = globalThis.__appRoot;
    const root = existingRoot || createRoot(rootElement);
    if (!existingRoot) {
        globalThis.__appRoot = root;
    }

    const bootPathname = window.location.pathname;
    if (shouldShowBootSkeleton(bootPathname)) {
        root.render(
            <CustomRouter history={history}>
                <MainPageSkeleton withAppShell />
            </CustomRouter>,
        );
        void import('./Utils/modules/postLoginShell').then(({ prefetchRouteModule, loadAppShellStyles }) => {
            prefetchRouteModule(bootPathname);
            return loadAppShellStyles();
        });
    }

    const [{ default: createReduxStore }, { default: App }] = await Promise.all([
        import('./Store'),
        import('./App'),
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
                    <App />
                </PersistGate>
            </Provider>
        </CustomRouter>,
    );
}

bootstrap();
