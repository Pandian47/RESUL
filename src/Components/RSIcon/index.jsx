import { CLOSE } from 'Constants/GlobalConstant/Placeholders';
import { circle_close_edge_medium, circle_close_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useState } from 'react';
import PropTypes from 'prop-types';

import RSTooltip from 'Components/RSTooltip';

const RSIcon = ({
    defaultItem = circle_close_edge_medium,
    hoverItem = circle_close_fill_edge_medium,
    closeTooltipPosition = 'top',
    placeholderText = CLOSE,
    normalIcon,
    className = '',
    color = '',
    handleClose = () => {},
    customCloseClass='',
    innerCloseContent = true,
}) => {
    const [buttonClass, setButtonClass] = useState(defaultItem);
    return (
        <div
            className={`${normalIcon ? '' : 'close'} ${customCloseClass}`}
            onMouseEnter={(e) => setButtonClass(hoverItem)}
            onMouseLeave={(e) => setButtonClass(defaultItem)}
        >
            <RSTooltip text={placeholderText} position={closeTooltipPosition} innerContent={innerCloseContent} tooltipOverlayClass={'toolTipOverlayZindexCSS'}>
                <i
                    className={`${className} ${buttonClass} ${color ? color : ''}`}
                    id="rs_circle_close_edge"
                    onClick={(e) => handleClose()}
                ></i>
            </RSTooltip>
        </div>
    );
};
RSIcon.propTypes = {
    defaultItem: PropTypes.string,
    hoverItem: PropTypes.string,
    className: PropTypes.string,
    color: PropTypes.string,
    handleClose: PropTypes.func,
    innerCloseContent: PropTypes.bool,
};

export default memo(RSIcon);
