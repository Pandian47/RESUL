import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';

import history from 'Utils/history';
import usePermission from 'Hooks/usePersmission';
import HTTPRequestHandler from 'Utils/Http';

import { globalStateSelector } from 'Utils/Selectors/app';

/**
 * Shared “protected shell”: permissions + history POP handling. Used by {@link ProtectedLayout}
 * and the legacy {@link protectedRoute} HOC.
 *
 * Note: Hooks must not run inside try/catch; any previous Navigate fallback on hook throw is
 * removed so this stays valid for the rules of hooks.
 */
function useProtectedRouteShell() {
    const dispatch = useDispatch();
    const { pathname, search } = useLocation();
    const routeLeaveKey = `${pathname}${search}`;
    const { permissions } = usePermission();
    const globalState = useSelector((state) => globalStateSelector(state));
    void globalState.isAuth;

    useEffect(() => {
        return () => HTTPRequestHandler.dispatchUnreadCountRefreshOnPageLeave(dispatch);
    }, [routeLeaveKey, dispatch]);

    useEffect(() => {
        try {
            const unListen = history.listen(({ action }) => {
                if (action === 'POP') history.forward();
            });
            return unListen;
        } catch (error) {
        }
    }, []);

    return { permissions };
}

/**
 * Pathless layout: passes `permissions` to child routes via
 * {@link https://reactrouter.com/en/main/hooks/use-outlet-context useOutletContext}.
 */
export function ProtectedLayout() {
    const { permissions } = useProtectedRouteShell();
    return <Outlet context={{ permissions }} />;
}

const protectedRoute = (Component) => (props) => {
    const { permissions } = useProtectedRouteShell();
    return <Component {...props} permissions={permissions} />;
};

export default protectedRoute;
