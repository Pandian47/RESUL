import { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { PublicLayout } from 'Hoc/NonProtectedRoute';
import { PublicPages } from './pageModuleRegistry';
import NotFound from 'Components/NotFound';
import RouteSuspenseFallback from './RouteSuspenseFallback';
import { PUBLIC_APP_ROUTE_TREE, renderRouteNodes } from './appRouteConfig';

const LoginRoutes = () => {
    const state = useLocation();
    const pathname =  state?.pathname || '';
   const isLoginPage = pathname === '/';
    const sectionClassName = isLoginPage
        ? 'rs-page-content-wrapper login-bg-img'
        : 'rs-page-content-wrapper';

    return (
        <section className={sectionClassName}>
            <Suspense fallback={<RouteSuspenseFallback />}>
                <Routes>
                    <Route element={<PublicLayout />}>
                        {renderRouteNodes(PUBLIC_APP_ROUTE_TREE, 'public', PublicPages)}
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </section>
    );
};

export default LoginRoutes;
