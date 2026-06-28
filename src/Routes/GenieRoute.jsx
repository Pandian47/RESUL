import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ProtectedPages as Pages } from './pageModuleRegistry';
import { RESUL_GENIE_ACCESS_STRICT_MODE } from 'resul-genie-ui';
import { isGenieEnabledForSelectedDepartment } from 'Utils/modules/crypto';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateSessionModal } from 'Reducers/globalState/reducer';

/**
 * When `RESUL_GENIE_ACCESS_STRICT_MODE` is true, blocks `/genie` for logged-in users with no
 * `isGenieEnabled` BU (see `resul-genie-ui` config).
 */
export default function GenieRoute() {
    const isAuth = useSelector((s) => s.globalstate?.isAuth);
    const hasToken = !!localStorage.getItem('accessToken');
    const departmentListRedux = useSelector((s) => s.globalstate?.departmentList);
    const selectedDepartmentId = useSelector((s) => s.globalstate?.departmentId?.departmentId);
    const departmentList = Array.isArray(departmentListRedux) ? departmentListRedux : [];
    const showSessionModal = useSelector((s) => s.globalstate?.showSessionModal);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isAuth && !hasToken) {
            dispatch(updateSessionModal(true));
        }
    }, [isAuth, hasToken, dispatch]);

    if (!isAuth && !hasToken) {
        return null;
    }

    if (showSessionModal) {
        return null;
    }

    if (
        RESUL_GENIE_ACCESS_STRICT_MODE &&
        isAuth &&
        !isGenieEnabledForSelectedDepartment(departmentList, selectedDepartmentId)
    ) {
        return <Navigate to="/dashboard" replace />;
    }
    return <Pages.Genie />;
}
