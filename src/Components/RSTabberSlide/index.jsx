/**
 * RSTabberSlide — legacy wrapper
 *
 * Delegates all rendering to ResTabber with variant="slide".
 */
import { memo } from 'react';
import PropTypes from 'prop-types';
import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';

const RSTabbarSlide = (props) => <ResTabber variant="slide" {...props} />;

RSTabbarSlide.propTypes = {
    tabData: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,
    defaultTab: PropTypes.number,
    callBack: PropTypes.func,
    componentClassname: PropTypes.string,
    isCustomDropDown: PropTypes.bool,
    activeClass: PropTypes.string,
    isBorderWhite: PropTypes.bool,
    onTabClick: PropTypes.func,
    isDetailAnalytics: PropTypes.bool,
};

export default memo(RSTabbarSlide);
