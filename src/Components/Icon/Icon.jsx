import { memo, useRef } from 'react';
import RSPTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';
import PropTypes from 'prop-types';

const Icon = ({
    icon = '',
    size = 'default',
    color = 'color-primary-blue',
    tooltip = '',
    pophover,
    position = 'top',
    iconClass = '',
    circle = '',
    mainClass = '',
    nocp,
    inline,
    callBack = () => {},
    innerContent = false,
    id,
    ...props
}) => {
    const ref = useRef();
    return (
        <div
            className={`res-icon res-icon-${size} ${circle ? 'res-circle' : ''} ${mainClass ? mainClass : ''} ${
                inline ? 'inline' : ''
            }`}
            ref={tooltip ? ref : null}
        >
            {tooltip ? (
                <RSPTooltip
                    position={position ? position : 'top'}
                    text={tooltip}
                    className="lh0"
                    innerContent={innerContent}
                >
                    <i
                        id={id ?? 'rs_icon'}
                        className={`${icon} icon-${size} ${circle ? '' : color} ${iconClass} ${
                            nocp ? 'cursor-default' : 'cursor-pointer'
                        }`}
                        {...props}
                        onClick={(e) => callBack()}
                    />
                </RSPTooltip>
            ) : pophover ? (
                <RSPPophover position={position ? position : 'top'} text={pophover}>
                    <i
                        id={id ?? 'rs_icon'}
                        className={`${icon} icon-${size} ${circle ? '' : color} ${iconClass} ${
                            nocp ? 'cursor-default' : 'cursor-pointer'
                        }`}
                        {...props}
                        onClick={(e) => callBack()}
                    />
                </RSPPophover>
            ) : (
                <i
                    id={id ?? 'rs_icon'}
                    className={`${icon} icon-${size} ${circle ? '' : color} ${iconClass} ${
                        nocp ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    {...props}
                    onClick={(e) => callBack()}
                />
            )}
        </div>
    );
};
export default memo(Icon);

Icon.propTypes = {
    icon: PropTypes.string,
    hover: PropTypes.string,
    mainClass: PropTypes.string,
    circle: PropTypes.string,
    tooltip: PropTypes.string,
    position: PropTypes.string,
    size: PropTypes.string,
    iconClass: PropTypes.string,
    callBack: PropTypes.func,
};

export const Icons = ({ groupCass = '', ...props }) => {
    const { children } = props;
    return <div className={`res-icon-group ${groupCass ? groupCass : ''}`}>{children}</div>;
};

Icons.propTypes = {
    groupCass: PropTypes.string,
};
