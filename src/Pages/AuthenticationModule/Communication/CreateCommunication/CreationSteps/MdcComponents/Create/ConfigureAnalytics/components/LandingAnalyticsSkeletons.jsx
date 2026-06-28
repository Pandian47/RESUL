import { Container, Row, Col } from 'react-bootstrap';

import { MainNavBar, RSPageHeaderSkeleton, skeletonShellSharedCriticalCss } from 'Components/Skeleton/Components/common';

import { LOADER_TYPE } from 'Hooks/useApiLoader';

/** Scoped layout CSS — avoids live `.rs-cc-sub-tabs` float rules collapsing tabs beside the form box. */
export const configureAnalyticsSkeletonCriticalCss = `
.configure-analytics-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
    background-color: #f5f7fc;
}
.configure-analytics-skeleton-scope.page-content-holder,
.configure-analytics-skeleton-scope.configure-analytics-suspense-fallback {
    padding-top: 78px;
    margin: 0;
    width: 100%;
    max-width: 100%;
    min-height: calc(100vh - 74px);
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .main-heading-wrapper.container-fluid {
    width: 100%;
    margin-bottom: 0;
    background-color: #f5f7fc;
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .main-heading-wrapper .mhw-container.container {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 45px;
    padding-top: 10px;
    padding-bottom: 10px;
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .configure-analytics-page-header-skeleton {
    margin-bottom: 0;
    padding-bottom: 0;
}
.configure-analytics-skeleton-scope .configure-analytics-page-header-skeleton .mhw-container {
    padding-top: 5px;
    padding-bottom: 5px;
    min-height: 40px;
}
.configure-analytics-skeleton-scope .rs-page-header-skeleton .skeleton-page-header-bar {
    background-color: #e2e7ee !important;
}
.configure-analytics-skeleton-scope .page-content.px0 {
    max-width: 1260px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 12px;
    padding-right: 12px;
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .configure-analytics-skeleton__sub-tabs {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    width: 100%;
    max-width: 100%;
    margin: 0 0 0 0;
    padding: 0;
    list-style: none;
    gap: 5px;
    float: none;
    clear: both;
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .configure-analytics-skeleton__sub-tab {
    flex: 0 0 auto;
    min-width: 96px;
    height: 78px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    margin: 0;
    border: 1px solid #e9e9e9;
    background: #fff;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .configure-analytics-skeleton__sub-tab-icon {
    border-radius: 50% !important;
    margin-bottom: 4px;
}
.configure-analytics-skeleton-scope .configure-analytics-skeleton__sub-tab-label {
    margin: 0 auto;
}
.configure-analytics-skeleton-scope .configure-analytics-skeleton__tabs-content {
    width: 100%;
    max-width: 100%;
    clear: both;
    float: none;
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .configure-analytics-skeleton__tabs-content .box-design.bd-top-border {
    width: 100%;
    box-sizing: border-box;
}
.configure-analytics-skeleton-scope .skeleton-shimmer {
    position: relative;
    overflow: hidden;
    background-color: #e2e7ee;
    border-radius: 4px;
    display: block;
}
.configure-analytics-skeleton-scope .skeleton-shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #eef2f9, transparent);
    animation: configureAnalyticsSkeletonShimmer 1.6s infinite;
}
@keyframes configureAnalyticsSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
`;

const CONFIGURE_ANALYTICS_SUB_TAB_COUNT = 7;

export const ConfigureAnalyticsFieldSkeleton = ({
    height = 33,
    width = '100%',
    className = '',
}) => (
    <span
        className={`skeleton-shimmer d-block ${className}`.trim()}
        style={{ width, height, borderRadius: 4 }}
        aria-hidden="true"
    />
);

const ConfigureAnalyticsSubTabsSkeleton = ({ tabCount = CONFIGURE_ANALYTICS_SUB_TAB_COUNT }) => (
    <ul className="configure-analytics-skeleton__sub-tabs list-unstyled mb0" aria-hidden="true">
        {Array.from({ length: tabCount }, (_, index) => (
            <li key={`configure-analytics-tab-skel-${index}`} className="configure-analytics-skeleton__sub-tab">
                <ConfigureAnalyticsFieldSkeleton
                    height={32}
                    width={32}
                    className="configure-analytics-skeleton__sub-tab-icon"
                />
                <ConfigureAnalyticsFieldSkeleton height={12} width={70} className="configure-analytics-skeleton__sub-tab-label" />
            </li>
        ))}
    </ul>
);

export const CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG = {
    create: LOADER_TYPE.FIELD,
    edit: LOADER_TYPE.FIELD,
};

/** Matches h4.mb20 section titles in offline conversion. */
const ConfigureAnalyticsSectionHeadingSkeleton = ({ width = 160 }) => (
    <ConfigureAnalyticsFieldSkeleton height={22} width={width} className="mb20" />
);

/** Kendo / RS field: floating label line + input underline block (Col sm={4} pattern). */
const ConfigureAnalyticsKendoFieldSkeleton = ({ labelWidth = '42%' }) => (
    <>
        <ConfigureAnalyticsFieldSkeleton height={12} width={labelWidth} className="mb6" />
        <ConfigureAnalyticsFieldSkeleton height={33} />
    </>
);

export const ConfigureAnalyticsLabelFieldRowSkeleton = ({
    labelWidth = '50%',
    labelSpan = 4,
    fieldSpan = 7,
    withIcon = false,
    twoFields = false,
    secondFieldSpan = 4,
}) => (
    <div className="form-group configure-analytics-skeleton__row">
        <Row className="align-items-center">
            <Col sm={labelSpan} className="text-right">
                <ConfigureAnalyticsFieldSkeleton height={14} width={labelWidth} className="ms-auto" />
            </Col>
            {twoFields ? (
                <>
                    <Col sm={3}>
                        <ConfigureAnalyticsFieldSkeleton />
                    </Col>
                    <Col sm={secondFieldSpan}>
                        <ConfigureAnalyticsFieldSkeleton />
                    </Col>
                </>
            ) : (
                <Col sm={fieldSpan}>
                    <ConfigureAnalyticsFieldSkeleton />
                </Col>
            )}
            {withIcon ? (
                <Col sm={1} className="fg-icons-wrapper pl0">
                    <ConfigureAnalyticsFieldSkeleton height={24} width={24} />
                </Col>
            ) : null}
        </Row>
    </div>
);

/** Landing page Web tab — label-left rows (communication_lable_left). */
export const LandingPageWebEditSkeleton = () => (
    <>
        <ConfigureAnalyticsLabelFieldRowSkeleton labelWidth="55%" />
        <ConfigureAnalyticsLabelFieldRowSkeleton labelWidth="50%" />
        <ConfigureAnalyticsLabelFieldRowSkeleton labelWidth="60%" withIcon />
        <ConfigureAnalyticsLabelFieldRowSkeleton labelWidth="35%" twoFields secondFieldSpan={4} />
    </>
);

/**
 * Offline conversion — mirrors live layout:
 * Business unit (optional) → Conversion attributes → Grace period → Conversion value
 */
export const OfflineConversionEditSkeleton = ({ showBUSection = false }) => (
    <>
        {showBUSection ? (
            <>
                <ConfigureAnalyticsSectionHeadingSkeleton width={120} />
                <div className="form-group">
                    <Row>
                        <Col sm={4}>
                            <ConfigureAnalyticsKendoFieldSkeleton labelWidth="38%" />
                        </Col>
                        <Col sm={4}>
                            <ConfigureAnalyticsKendoFieldSkeleton labelWidth="48%" />
                        </Col>
                        <Col sm={1} className="ml0 pl0">
                            <ConfigureAnalyticsFieldSkeleton height={24} width={24} className="mt5" />
                        </Col>
                    </Row>
                </div>
            </>
        ) : null}

        <ConfigureAnalyticsSectionHeadingSkeleton width={180} />
        <div className="form-group">
            <Row>
                <Col sm={4}>
                    <ConfigureAnalyticsKendoFieldSkeleton labelWidth="36%" />
                </Col>
                <Col sm={1} className="fg-icons-wrapper pl0">
                    <ConfigureAnalyticsFieldSkeleton height={24} width={24} className="mt5" />
                </Col>
            </Row>
        </div>

        <ConfigureAnalyticsSectionHeadingSkeleton width={280} />
        <div className="form-group">
            <Row className="align-items-end">
                <Col sm={4}>
                    <ConfigureAnalyticsKendoFieldSkeleton labelWidth="52%" />
                </Col>
                <Col sm={1} className="ml0 pl0">
                    <ConfigureAnalyticsFieldSkeleton height={14} width={36} className="mb8" />
                </Col>
            </Row>
        </div>

        <ConfigureAnalyticsSectionHeadingSkeleton width={140} />
        <div className="form-group mb0">
            <Row>
                <Col sm={4}>
                    <ConfigureAnalyticsKendoFieldSkeleton labelWidth="55%" />
                </Col>
            </Row>
        </div>
    </>
);

/** Route / Suspense while configure-analytics chunk loads — mirrors ConfigureAnalytics/index.jsx. */
export const ConfigureAnalyticsPageContentSkeleton = () => (
    <>
        <style>{skeletonShellSharedCriticalCss}</style>
        <style>{configureAnalyticsSkeletonCriticalCss}</style>
        <MainNavBar  inline />
        <RSPageHeaderSkeleton
            variant="tabber"
            titleWidth={220}
            className="configure-analytics-page-header-skeleton"
        />
        <Container className="page-content px0">
            <ConfigureAnalyticsSubTabsSkeleton />
            <div className="tabs-content configure-analytics-skeleton__tabs-content">
                <div className="box-design bd-top-border communication_lable_left">
                    <LandingPageWebEditSkeleton />
                </div>
            </div>
        </Container>
    </>
);

export const ConfigureAnalyticsSuspenseFallback = () => (
    <div
        className="page-content-holder configure-analytics-skeleton-scope configure-analytics-suspense-fallback"
        aria-busy="true"
        aria-label="Loading landing page preferences"
    >
        <ConfigureAnalyticsPageContentSkeleton />
    </div>
);
