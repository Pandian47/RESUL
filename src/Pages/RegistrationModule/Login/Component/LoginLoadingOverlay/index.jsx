import { memo } from 'react';
import { useSelector } from 'react-redux';

import { globalStateSelector } from 'Utils/Selectors/app';

/** Scoped loading overlay for the login card (not full-viewport RSLoader). */
const LoginLoadingOverlay = () => {
    const { loading } = useSelector((state) => globalStateSelector(state));

    if (loading <= 0) {
        return null;
    }

    return (
        <div
            className="login-loading-overlay"
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="login-loading-overlay__spinner" />
        </div>
    );
};

export default memo(LoginLoadingOverlay);
