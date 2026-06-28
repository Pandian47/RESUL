import { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { globalStateSelector } from 'Utils/Selectors/app';
import MdcWorkflowSkeleton from './MdcWorkflowSkeleton';

const RS_LOADER_DISABLED_PATHS = [] || ['/communication/mdc-workflow', '/communicationTwins/mdc-workflow'];

/** Presentational loader — safe before Redux `<Provider>` (boot skeleton, route suspense). */
export const RSLoaderOverlay = memo(({ className = '' }) => (
    <div id="loading" className={['rsloading', className].filter(Boolean).join(' ')}>
        <div className="loading">
            <div className="loading-content"></div>
            <div className="loading-tick"></div>
        </div>
    </div>
));

RSLoaderOverlay.propTypes = {
    className: PropTypes.string,
};

const RSLoaderConnected = memo(({ className = '' }) => {
    const { loading } = useSelector((state) => globalStateSelector(state));
    if (!loading) return null;
    return <RSLoaderOverlay className={className} />;
});

const RSLoader = ({ className = '', fallback = false }) => {
    const { pathname } = useLocation();
    const isLoginSurface = pathname === '/';
    const isLoaderDisabled = RS_LOADER_DISABLED_PATHS.some((path) => pathname.startsWith(path));

    if (isLoaderDisabled) {
        return fallback ? <MdcWorkflowSkeleton /> : null;
    }

    // Login uses button-level loading only — avoid full-viewport RSLoader during sign-in / handoff.
    if (isLoginSurface && !fallback) {
        return null;
    }

    const overlayClassName = [className, isLoginSurface ? 'rsloading--over-login' : ''].filter(Boolean).join(' ');

    if (fallback) {
        return <RSLoaderOverlay className={overlayClassName} />;
    }

    return (
        <Fragment>
            <RSLoaderConnected className={overlayClassName} />
        </Fragment>
    );
};

RSLoader.propTypes = {
    fallback: PropTypes.bool,
    className: PropTypes.string,
};

export default memo(RSLoader);
