import { Fragment, Suspense, lazy, memo } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

import LoginFooterView from './LoginFooterView';

const AppFooter = lazy(() => import('./AppFooter'));

const RSFooter = () => {
    const { pathname } = useLocation();
    const isLoginPage = pathname === '/';

    return (
        <Fragment>
            {isLoginPage ? (
                <LoginFooterView />
            ) : (
                <Suspense fallback={null}>
                    <AppFooter />
                </Suspense>
            )}
            <Outlet />
        </Fragment>
    );
};

export default memo(RSFooter);
