/**
 * RSMdcTooltip — legacy wrapper
 *
 * Delegates to ResTooltip with variant="mdc".
 * Used by MDC workflow edge labels (schedule / wait timers).
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResTooltip from 'Pages/KendoDocs/CommonComponents/ResTooltip';

const RSMdcTooltip = (props) => <ResTooltip variant="mdc" {...props} />;

RSMdcTooltip.propTypes = {
    position: PropTypes.string.isRequired,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    className: PropTypes.string,
    isDefaultShow: PropTypes.bool,
    container: PropTypes.shape({ current: PropTypes.any }),
    children: PropTypes.node,
};

export default memo(RSMdcTooltip);
