/**
 * RSTabber — legacy wrapper
 *
 * Delegates all rendering to ResTabber with variant="default".
 * Maintains the original prop surface so existing call-sites require zero changes.
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';

const RSTabbar = (props) => <ResTabber variant="default" {...props} />;

RSTabbar.propTypes = {
    tabData: PropTypes.array.isRequired,
    defaultClass: PropTypes.string,
    defaultSelectedItem: PropTypes.number,
    dynamicTab: PropTypes.string,
    activeClass: PropTypes.string,
    smallText: PropTypes.string,
    callBack: PropTypes.func,
    animate: PropTypes.bool,
    arrow: PropTypes.bool,
    subText: PropTypes.bool,
    or: PropTypes.bool,
    flatTabs: PropTypes.bool,
    ccTabs: PropTypes.bool,
    cTabsBig: PropTypes.bool,
    noMarginLeftRight: PropTypes.bool,
    className: PropTypes.string,
    textClass: PropTypes.string,
    disableOtherTabs: PropTypes.bool,
    remove: PropTypes.bool,
    add: PropTypes.bool,
    onAddMenu: PropTypes.func,
    onRemoveMenu: PropTypes.func,
    isRefreshConfirmation: PropTypes.bool,
    isClearConfirmation: PropTypes.bool,
    isHeadingBlock: PropTypes.bool,
    onRefresh: PropTypes.func,
    singleTab: PropTypes.bool,
    isLoginScreen: PropTypes.bool,
    isTooltipText: PropTypes.bool,
    clear: PropTypes.bool,
    onClear: PropTypes.func,
    tooltiptext: PropTypes.string,
    isCreateCommunication: PropTypes.bool,
    deliverytext_center: PropTypes.bool,
    noHeader: PropTypes.bool,
    disableWrapperTransition: PropTypes.bool,
};

export default memo(RSTabbar);
