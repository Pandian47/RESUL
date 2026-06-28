import PropTypes from 'prop-types';
import { GRID_CONFIG, gridClass } from './config';

const GridEmptyState = ({ message, children, showIcon = true }) => {
    const content = children ?? message ?? GRID_CONFIG.defaultEmptyMessage;

    return (
        <div className={gridClass('empty')} role="status" aria-live="polite">
            {showIcon && (
                <span className={gridClass('empty-icon')} aria-hidden="true">
                    <i className="icon-rs-data-empty-medium icon-lg color-secondary-grey" />
                </span>
            )}
            <div className={gridClass('empty-message')}>{content}</div>
        </div>
    );
};

GridEmptyState.propTypes = {
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    children: PropTypes.node,
    showIcon: PropTypes.bool,
};

export default GridEmptyState;
