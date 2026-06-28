/**
 * RSTabberFluid — legacy wrapper
 *
 * Delegates all rendering to ResTabber with variant="fluid".
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';

const RSTabbarFluid = (props) => <ResTabber variant="fluid" {...props} />;

RSTabbarFluid.propTypes = {
    tabData: PropTypes.array.isRequired,
    defaultClass: PropTypes.string,
    defaultSelectedItem: PropTypes.number,
    dynamicTab: PropTypes.string,
    activeClass: PropTypes.string,
    callBack: PropTypes.func,
    defaultSelectedObjectValue: PropTypes.object,
    animate: PropTypes.bool,
    arrow: PropTypes.bool,
    subText: PropTypes.bool,
    or: PropTypes.bool,
    componentClassname: PropTypes.string,
};

export default memo(RSTabbarFluid);
