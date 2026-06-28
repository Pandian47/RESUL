/**
 * RSPTab — legacy wrapper
 *
 * Delegates all rendering to ResTabber with variant="portlet".
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';

const RSPTab = (props) => <ResTabber variant="portlet" {...props} />;

RSPTab.propTypes = {
    tabData: PropTypes.array.isRequired,
    defaultClass: PropTypes.string,
    defaultSelectedItem: PropTypes.number,
    dynamicTab: PropTypes.string,
    activeClass: PropTypes.string,
    callBack: PropTypes.func,
    arrow: PropTypes.bool,
    subText: PropTypes.bool,
    or: PropTypes.bool,
    className: PropTypes.string,
    textClass: PropTypes.string,
    isRemoveConfirmation: PropTypes.bool,
};

export default memo(RSPTab);
