import { memo } from 'react';
import PropTypes from 'prop-types';

const SpinnerLoader = ({ className = '', ariaLabel = 'Loading' }) => (
    <span
        className={`segment_loader ${className}`.trim()}
        role="status"
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
    />
);

SpinnerLoader.propTypes = {
    className: PropTypes.string,
    ariaLabel: PropTypes.string,
};

export default memo(SpinnerLoader);
