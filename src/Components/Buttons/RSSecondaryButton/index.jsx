import { memo } from 'react';
import PropTypes from 'prop-types';
import RSButton from '../RSButton';
import useBodyPointerLock from 'Hooks/useBodyPointerLock';
import { motion, AnimatePresence } from 'framer-motion';

const RSSecondaryButton = ({
    bgc,
    disabledClass = '',
    disabled,
    className = '',
    color,
    paddingright,
    type = 'button',
    children,
    isLoading = false,
    loading = false,
    loadingText,
    blockBodyPointerEvents = false,
    blockInteraction = false,
    ...props
}) => {
    const showLoading = isLoading || loading;
    const isBlocked = showLoading || blockInteraction;

    useBodyPointerLock(showLoading && blockBodyPointerEvents);

    return (
        <RSButton
            {...props}
            disabledClass={`${disabledClass} ${isBlocked ? 'pe-none click-off' : ''}`}
            className={` ${className} rs-button-link`}
            style={{
                backgroundColor: bgc,
                paddingRight: paddingright,
                color: color,
            }}
            type={type}
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

RSSecondaryButton.propTypes = {
    disabled: PropTypes.bool,
    className: PropTypes.string,
    bgc: PropTypes.string,
    paddingright: PropTypes.string,
    color: PropTypes.string,
    type: PropTypes.oneOf(['submit', 'button', 'reset']),
    isLoading: PropTypes.bool,
    loading: PropTypes.bool,
    loadingText: PropTypes.node,
    blockBodyPointerEvents: PropTypes.bool,
    blockInteraction: PropTypes.bool,
};

export default memo(RSSecondaryButton);
