/**
 * RSTooltip — legacy wrapper
 *
 * Delegates to ResTooltip with variant="default".
 * Maintains the original prop surface so existing call-sites require zero changes.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResTooltip from 'Pages/KendoDocs/CommonComponents/ResTooltip';

const RSTooltip = (props) => <ResTooltip variant="default" {...props} />;

RSTooltip.propTypes = {
    position: PropTypes.string,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.number]),
    className: PropTypes.string,
    tooltipOverlayClass: PropTypes.string,
    innerContent: PropTypes.bool,
    trigger: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    show: PropTypes.bool,
    customText: PropTypes.string,
    wrapperTag: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
    children: PropTypes.node,
};

export default memo(RSTooltip);
