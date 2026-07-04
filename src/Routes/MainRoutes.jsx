import { Suspense, memo, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { ProtectedLayout } from 'Hoc/ProtectedRoutes';
import { PublicLayout } from 'Hoc/NonProtectedRoute';
import { ProtectedPages, PublicPages } from './pageModuleRegistry';
import NotFound from 'Components/NotFound';
import RouteSuspenseFallback from './RouteSuspenseFallback';
import GenieRoute from './GenieRoute';
import {
    PROTECTED_APP_ROUTE_TREE,
    PUBLIC_APP_ROUTE_TREE,
    renderRouteNodes,
} from './appRouteConfig';

const MainRoutes = () => {
    const { pathname } = useLocation();
    const sessionRecoverySeq = useSelector((state) => state.globalstate?.sessionRecoverySeq ?? 0);
    const sectionClassName = useMemo(() => {
        const isLoginPage = pathname === '/';
        const isGenieShell = pathname === '/genie' || pathname.startsWith('/genie/');
        const parts = ['rs-page-content-wrapper'];
        if (isLoginPage) parts.push('login-bg-img');
        if (isGenieShell) parts.push('rs-page-content-wrapper--genie-shell');
        return parts.join(' ');
    }, [pathname]);
    return (
        <section className={sectionClassName}>
            <Suspense fallback={<RouteSuspenseFallback />}>
                <Routes key={sessionRecoverySeq}>
                    <Route element={<PublicLayout />}>
                        {renderRouteNodes(PUBLIC_APP_ROUTE_TREE, 'public', PublicPages)}
                    </Route>
                    <Route element={<ProtectedLayout />}>
                        {renderRouteNodes(PROTECTED_APP_ROUTE_TREE, 'protected', ProtectedPages)}
                        <Route path="genie/*" element={<GenieRoute />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </section>
    );
};

export default memo(MainRoutes);
