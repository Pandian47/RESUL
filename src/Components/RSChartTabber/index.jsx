/**
 * RSChartTabber — legacy wrapper
 *
 * Delegates all rendering to ResTabber with variant="chartTabber".
 * Maintains the original prop surface so existing call-sites require zero changes.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';

const RSChartTabber = (props) => <ResTabber variant="chartTabber" {...props} />;

RSChartTabber.propTypes = {
    tabData: PropTypes.array.isRequired,
    defaultClass: PropTypes.string,
    defaultSelectedItem: PropTypes.number,
    dynamicTab: PropTypes.string,
    activeClass: PropTypes.string,
    smallText: PropTypes.string,
    callBack: PropTypes.func,
    arrow: PropTypes.bool,
    subText: PropTypes.bool,
    or: PropTypes.bool,
    className: PropTypes.string,
    textClass: PropTypes.string,
    chartHeading: PropTypes.string,
    footer: PropTypes.bool,
    isRemoveConfirmation: PropTypes.bool,
};

export default memo(RSChartTabber);
