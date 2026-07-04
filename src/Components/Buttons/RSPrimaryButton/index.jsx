import { memo } from 'react';
import PropTypes from 'prop-types';
import RSButton from '../RSButton';
import useBodyPointerLock from 'Hooks/useBodyPointerLock';
import { motion, AnimatePresence } from 'framer-motion';

const RSPrimaryButton = ({
    bgc,
    disabledClass = '',
    className = '',
    paddingright,
    color,
    children,
    type = 'button',
    isLoading = false,
    loading = false,
    loadingText,
    blockBodyPointerEvents = false,
    blockInteraction = false,
    disabled,
    ...props
}) => {
    const showLoading = isLoading || loading;
    const isBlocked = showLoading || blockInteraction;

    useBodyPointerLock(showLoading && blockBodyPointerEvents);

    return (
        <RSButton
            disabledClass={`${disabledClass} ${isBlocked ? 'pe-none click-off' : ''}`}
            className={`${className} rs-button-primary`}
            style={{
                backgroundColor: bgc,
                paddingRight: paddingright,
                color: color,
            }}
            type={type}
            {...props}
            disabled={isBlocked || disabled}
        >
            <div className="d-flex justify-content-center align-items-center gap-2">
                <AnimatePresence>
                    {showLoading && (
                        <motion.div
                            className="segment_loader"
                            initial={{ width: 0, height: 0, opacity: 0, x: 15 }}
                            animate={{ width: 16, height: 16, opacity: 1, x: 0 }}
                            exit={{ width: 0, height: 0, opacity: 0, x: -15 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                        />
                    )}
                </AnimatePresence>
                <span style={{ display: 'inline-block' }}>
                    {showLoading && loadingText ? loadingText : children}
                </span>
            </div>
        </RSButton>
    );
};

RSPrimaryButton.propTypes = {
    bgc: PropTypes.string,
    paddingright: PropTypes.string,
    color: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.oneOf(['submit', 'button', 'reset']),
    isLoading: PropTypes.bool,
    loading: PropTypes.bool,
    loadingText: PropTypes.node,
    blockBodyPointerEvents: PropTypes.bool,
    blockInteraction: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default memo(RSPrimaryButton);
