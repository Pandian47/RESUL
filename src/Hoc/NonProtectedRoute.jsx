import { useEffect } from 'react';
import history from 'history/browser';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { globalStateSelector } from 'Utils/Selectors/app';
import { resetGlobalState } from 'Reducers/globalState/reducer';

/**
 * Shared side effects for “public” (login / registration) surfaces: history POP handling and
 * selective localStorage + Redux reset when already authenticated. Used by {@link PublicLayout}
 * and the legacy {@link NonProtectedRoute} HOC.
 */
function useNonProtectedRouteShell() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuth } = useSelector((state) => globalStateSelector(state));

    useEffect(() => {
        try {
            history.listen(({ action }) => {
                if (action === 'POP') navigate(1);
            });
            if (isAuth && location?.state?.from !== 'companies' && !location?.state?.fromClientUpgrade) {
                const tempMasterData = localStorage.getItem('masterData');
                const tempipAddressData = localStorage.getItem('ipAddressData');
                const tempdisable_plugin_last_shown = localStorage.getItem('disable_plugin_last_shown');
                const temp_session_credentials = localStorage.getItem('sessionCredentials');
                const tempNewVersionConfirm = localStorage.getItem('newVersionConfirm');
                localStorage.clear();
                localStorage.setItem('masterData', tempMasterData);
                localStorage.setItem('ipAddressData', tempipAddressData);
                localStorage.setItem('disable_plugin_last_shown', tempdisable_plugin_last_shown);
                localStorage.setItem('newVersionConfirm', tempNewVersionConfirm);
                if (temp_session_credentials) {
                    localStorage.setItem('sessionCredentials', temp_session_credentials);
                }
                dispatch(resetGlobalState());
            }
        } catch (error) {
        }
    }, []);
}

/** Pathless layout for registration/login routes (same side effects as legacy NonProtectedRoute HOC). */
export function PublicLayout() {
    useNonProtectedRouteShell();
    return <Outlet />;
}

const NonProtectedRoute = (Component) => {
    return (props) => {
        useNonProtectedRouteShell();

        // if (!isAuth) return <Navigate to={'/'} />;

        return <Component {...props} />;
    };
};

export default NonProtectedRoute;
