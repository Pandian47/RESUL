import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shallowEqual, useSelector } from 'react-redux';
import {
    genielogowhite,
    genieTextWhite,
    genieLogoWhiteWithoutStar,
    useResulGenieAppLastActiveSpaceQuerySync,
    useResulGenieShellStylesIsolation,
    RESUL_GENIE_ACCESS_STRICT_MODE,
} from 'resul-genie-ui';
import { isGenieEnabledForSelectedDepartment } from 'Utils/modules/crypto';

/**
 * Genie UI hooks + floating launcher — lazy-loaded so login/public routes
 * do not pay the resul-genie-ui bundle cost on first paint.
 */
const GenieHostFeatures = ({ isGenieStylesIsolationActive, search, pathname, isAppStylesLoaded }) => {
    const navigate = useNavigate();
    const [isGenieLogoHover, setIsGenieLogoHover] = useState(false);
    const { departmentListRedux, selectedDepartmentId, departmentChangePending } = useSelector(
        (state) => ({
            departmentListRedux: state.globalstate?.departmentList,
            selectedDepartmentId: state.globalstate?.departmentId?.departmentId,
            departmentChangePending: state.globalstate?.departmentChangePending,
        }),
        shallowEqual,
    );
    const departmentListForGenie = Array.isArray(departmentListRedux) ? departmentListRedux : [];
    const genieEnabledForAccount =
        !RESUL_GENIE_ACCESS_STRICT_MODE ||
        isGenieEnabledForSelectedDepartment(departmentListForGenie, selectedDepartmentId);
    const showGenie = genieEnabledForAccount && !departmentChangePending;
    const isGenieUIRoute = pathname.startsWith('/genie');

    useResulGenieShellStylesIsolation(isGenieStylesIsolationActive);
    useResulGenieAppLastActiveSpaceQuerySync(search, pathname, navigate);

    const handleOpenGenie = () => {
        if (!genieEnabledForAccount) return;
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        sessionStorage.setItem('genie-return-url', currentUrl || '/dashboard');
        navigate('/genie');
        setIsGenieLogoHover(false);
    };

    if (!showGenie || isGenieUIRoute || !isAppStylesLoaded) {
        return null;
    }

    return (
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
    );
};

export default GenieHostFeatures;
