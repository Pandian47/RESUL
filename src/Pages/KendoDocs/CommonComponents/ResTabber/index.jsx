/**
 * ResTabber - Consolidated Tab Component
 *
 * Replaces RSTabber, RSPTab, RSTabberFluid, RSTabberSlide, RSTabSlide, and RSChartTabber.
 * All layouts are controlled through the `variant` prop and shared tabData API.
 *
 * @example
 * // Default variant (RSTabber equivalent)
 * <ResTabber variant="default" tabData={tabs} heading="Settings" />
 *
 * @example
 * // Portlet icon tabs (RSPTab equivalent)
 * <ResTabber variant="portlet" tabData={iconTabs} />
 *
 * @example
 * // Fluid full-width with overflow dropdown (RSTabberFluid equivalent)
 * <ResTabber variant="fluid" tabData={tabs} count={7} />
 *
 * @example
 * // Horizontal scroll tabs (RSTabberSlide equivalent)
 * <ResTabber variant="slide" tabData={tabs} tabMaxLength={5} />
 *
 * @example
 * // Smart slide with add/remove and label edit (RSTabSlide equivalent)
 * <ResTabber variant="smartSlide" tabData={tabs} enableTabLabelEdit />
 *
 * @example
 * // Chart portlet tabs (RSChartTabber equivalent)
 * <ResTabber variant="chartTabber" tabData={tabs} chartHeading="Performance" />
 */
import { memo } from 'react';
import PropTypes from 'prop-types';

import './restabber.scss';

import { TAB_VARIANTS } from './config';
import { normalizeTabberProps } from './utils';

import DefaultVariant from './variants/DefaultVariant';
import PortletVariant from './variants/PortletVariant';
import FluidVariant from './variants/FluidVariant';
import SlideVariant from './variants/SlideVariant';
import SmartSlideVariant from './variants/SmartSlideVariant';
import ChartTabberVariant from './variants/ChartTabberVariant';

const VARIANT_COMPONENTS = {
    default: DefaultVariant,
    portlet: PortletVariant,
    fluid: FluidVariant,
    slide: SlideVariant,
    smartSlide: SmartSlideVariant,
    chartTabber: ChartTabberVariant,
};

const ResTabber = (props) => {
    const { variant = 'default', features, tabData = [], ...rest } = props;
    const normalizedProps = normalizeTabberProps({ variant, features, tabData, ...rest });

    const resolvedVariant = VARIANT_COMPONENTS[variant] ? variant : 'default';
    const VariantComponent = VARIANT_COMPONENTS[resolvedVariant];

    return (
        <div className="res-tabber">
            <VariantComponent tabData={tabData} {...normalizedProps} />
        </div>
    );
};

ResTabber.propTypes = {
    variant: PropTypes.oneOf(TAB_VARIANTS),
    tabData: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,
    defaultTab: PropTypes.number,
    callBack: PropTypes.func,
    onTabChange: PropTypes.func,
    features: PropTypes.object,
    className: PropTypes.string,
    defaultClass: PropTypes.string,
    activeClass: PropTypes.string,
    componentClassName: PropTypes.string,
    heading: PropTypes.string,
    flatTabs: PropTypes.bool,
    ccTabs: PropTypes.bool,
    cTabsBig: PropTypes.bool,
    animate: PropTypes.bool,
    arrow: PropTypes.bool,
    subText: PropTypes.bool,
    or: PropTypes.bool,
    dynamicTab: PropTypes.string,
    disableOtherTabs: PropTypes.bool,
    singleTab: PropTypes.bool,
    refresh: PropTypes.bool,
    clear: PropTypes.bool,
    onRefresh: PropTypes.func,
    onClear: PropTypes.func,
    onAddMenu: PropTypes.func,
    onRemoveMenu: PropTypes.func,
    isRefreshConfirmation: PropTypes.bool,
    isClearConfirmation: PropTypes.bool,
    isRemoveConfirmation: PropTypes.bool,
    isTabChangeConfirmation: PropTypes.bool,
    count: PropTypes.number,
    remTabs: PropTypes.number,
    tabMaxLength: PropTypes.number,
    customRender: PropTypes.bool,
    renderItem: PropTypes.node,
    isBorderWhite: PropTypes.bool,
    isDetailAnalytics: PropTypes.bool,
    onTabClick: PropTypes.func,
    enableTabLabelEdit: PropTypes.bool,
    onTabLabelSave: PropTypes.func,
    onTabLabelChange: PropTypes.func,
    onTabLabelCancel: PropTypes.func,
    tabLabelMaxLength: PropTypes.number,
    tabLabelsExternallyControlled: PropTypes.bool,
    children: PropTypes.node,
    isLoginScreen: PropTypes.bool,
    isCreateCommunication: PropTypes.bool,
    chartHeading: PropTypes.string,
    footer: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    headerIcon: PropTypes.node,
    autoHeight: PropTypes.bool,
    expandView: PropTypes.bool,
    gridView: PropTypes.node,
    expandIcon: PropTypes.func,
    hideTabs: PropTypes.bool,
    containerClass: PropTypes.string,
};

export default memo(ResTabber);
