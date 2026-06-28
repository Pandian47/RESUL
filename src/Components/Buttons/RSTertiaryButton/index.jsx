import { memo } from 'react';
import PropTypes from 'prop-types';
import RSButton from '../RSButton';

const RSTertiaryButton = ({ bgc, disabledClass = '', className = '', paddingright, color, children, type = 'button', ...props }) => {
    return (
        <RSButton
            disabledClass={`${disabledClass}`}
            className={`${className} rs-button-tertiary`}
            style={{
                backgroundColor: bgc,
                paddingRight: paddingright,
                color: color,
            }}
            type={type}
            {...props}
        >
            {children}
        </RSButton>
    );
};

RSTertiaryButton.propTypes = {
    bgc: PropTypes.string,
    paddingright: PropTypes.string,
    color: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.oneOf(['submit', 'button', 'reset']),
};

export default memo(RSTertiaryButton);
