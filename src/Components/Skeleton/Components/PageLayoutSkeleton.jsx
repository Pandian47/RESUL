import { memo } from 'react';
import { Container, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';

import { MainNavBar, pageLayoutSkeletonCriticalCss } from './common/pageLoadingScene';
import { skeletonShellSharedCriticalCss } from './common';
import {
    AddAudiencePageSkeleton,
    AudiencePageContentSkeleton,
    AudienceTargetListCreationSuspenseFallback,
    AudienceTabsSkeleton,
    audienceSkeletonCriticalCss,
    DynamicListCreationPageSkeleton,
} from '../pages/audience';
import { addAudienceSkeletonCriticalCss } from '../pages/audience/addAudience';
import { addImportAudienceSkeletonCriticalCss } from '../pages/audience/addImportAudience/addImportAudienceSkeletonCriticalCss';
import { audienceTargetListCreationCriticalCss } from '../pages/audience/audienceTargetListCreationCriticalCss';
import { segmentSkeletonCriticalCss } from '../Components/segmentSkeletonCriticalCss';
import { dynamicListCreationSkeletonCriticalCss } from '../pages/audience/dynamicList';
import AddImportAudienceSkeleton from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/AddImportAudienceSkeleton';
import SyncHistorySkeleton from 'Pages/AuthenticationModule/Audience/Pages/SyncHistory/Components/SyncHistorySkeleton';
import { DashboardPageContentSkeleton } from '../pages/dashboard';
import {
    CommunicationPageContentSkeleton,
    communicationSkeletonCriticalCss,
} from '../pages/communication';
import { CommunicationAuthoringPageContentSkeleton } from '../pages/communication/authoring';
import { MdcAuthoringPageContentSkeleton } from '../pages/communication/mdcAuthoring';
import {
    ConfigureAnalyticsPageContentSkeleton,
    configureAnalyticsSkeletonCriticalCss,
} from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create/ConfigureAnalytics/components/LandingAnalyticsSkeletons';
import { CommunicationExecutePageContentSkeleton } from '../pages/communication/execute';
import { CommunicationCreationPageContentSkeleton } from '../pages/communication/creation';
import {
    AnalyticsPageContentSkeleton,
    AnalyticsReportPageContentSkeleton,
    AnalyticsTabsSkeleton,
    DetailAnalyticsPageSkeleton,
} from '../pages/analytics';
import { analyticsSkeletonCriticalCss } from '../pages/analytics/analyticsSkeletonCriticalCss';
import { analyticsReportSkeletonCriticalCss } from '../pages/analytics/analyticsReportSkeletonCriticalCss';
import { detailAnalyticsSkeletonCriticalCss } from '../pages/analytics/detailAnalyticsSkeletonCriticalCss';
import PreferencesPageContentSkeleton from './PreferencesPageContentSkeleton';
import PreferencesSubPageRouteSkeleton from './PreferencesSubPageRouteSkeleton';
import { preferencesSkeletonCriticalCss } from './preferencesSkeletonCriticalCss';
const TAB_CONFIG = {
    audience: { count: 3, widths: ['34%', '22%', '24%'], subHeading: true },
    dashboard: { count: 3, widths: ['34%', '30%', '28%'], subHeading: false },
    analytics: { count: 3, widths: ['36%', '32%', '26%'], subHeading: false },
    communicationList: { count: 3, widths: ['32%', '22%', '20%'], subHeading: false },
    preferences: { count: 0, widths: [], subHeading: false, hideTabs: true, titleWidth: 180 },
    preferencesSubPage: { count: 0, widths: [], subHeading: false, hideTabs: true, titleWidth: 200 },
    default: { count: 3, widths: ['33%', '33%', '33%'], subHeading: false },
};

const Shimmer = ({ className = '', style = {} }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const PageHeadingBlock = ({ variant, inline, activeTabIndex }) => {
    const tabCfg = TAB_CONFIG[variant] || TAB_CONFIG.default;
    const tabCount = tabCfg.count;
    const hideTabs = tabCfg.hideTabs || tabCount === 0;
    const titleWidth = tabCfg.titleWidth || (inline ? 140 : 280);

    /** Audience / creation chrome is rendered only via dedicated skeleton components. */
    if (
        variant === 'audience' ||
        variant === 'audienceTargetListCreation' ||
        variant === 'audienceAddAudience' ||
        variant === 'audienceAddImportAudience' ||
        variant === 'audienceSyncHistory' ||
        variant === 'audienceDynamicListCreation' ||
        variant === 'analyticsReport' ||
        variant === 'analyticsDetail' ||
        variant === 'communicationCreation' ||
        variant === 'communicationAuthoring' ||
        variant === 'mdcAuthoring' ||
        variant === 'configureAnalytics' ||
        variant === 'communicationExecute' ||
        variant === 'preferences' ||
        variant === 'preferencesSubPage'
    ) {
        return null;
    }

    if (inline) {
        return (
            <>
                <div className="pls-page-header">
                    <div className="pls-title-block">
                        {tabCfg.subHeading && <div className="pls-sub skeleton-shimmer" style={{ width: 110, height: 13, marginBottom: 4 }} />}
                        <h1>
                            <span className="skeleton-shimmer" style={{ display: 'inline-block', width: titleWidth, height: 34, verticalAlign: 'middle' }} />
                        </h1>
                    </div>
                    {!hideTabs && (
                        <div className="pls-header-right">
                            <span className="pls-breadcrumb skeleton-shimmer" style={{ width: 160, height: 12, display: 'inline-block' }} />
                            <span className="pls-dd skeleton-shimmer" />
                            <span className="pls-dd skeleton-shimmer" style={{ width: 90 }} />
                        </div>
                    )}
                </div>
                {!hideTabs && (
                    <div className="pls-tabs-wrap">
                        <ul className="pls-tabs">
                            {Array.from({ length: tabCount }, (_, index) => (
                                <li key={index} className="pls-tab" aria-hidden="true">
                                    <span
                                        className="pls-tab-label skeleton-shimmer"
                                        style={{
                                            width: tabCfg.widths[index] || '70%',
                                            height: 12,
                                            margin: '14px auto',
                                            display: 'block',
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <Container fluid className="main-heading-wrapper mb0">
                <Container className="mhw-container">
                    <div className="mhwc-left">
                        {tabCfg.subHeading ? (
                            <h1 className="repo-title">
                                <div className="sh">
                                    <Shimmer style={{ width: 120, height: 13 }} />
                                </div>
                                <div className="mh-wrapper d-flex">
                                    <span className="mh-text">
                                        <Shimmer style={{ width: 100, height: 23 }} />
                                    </span>
                                </div>
                            </h1>
                        ) : (
                            <div className="heading-title-text">
                                <h1>
                                    <Shimmer style={{ width: titleWidth, height: 36 }} />
                                </h1>
                            </div>
                        )}
                    </div>
                    {!hideTabs && (
                        <div className="mhwc-right position-relative d-flex align-items-center" style={{ gap: 12 }}>
                            <Shimmer style={{ width: 150, height: 12 }} />
                            <Shimmer style={{ width: 120, height: 23 }} />
                            <Shimmer style={{ width: 100, height: 23 }} />
                        </div>
                    )}
                </Container>
            </Container>
            {!hideTabs && variant === 'audience' && (
                <AudienceTabsSkeleton activeTabIndex={activeTabIndex} />
            )}
            {!hideTabs && variant === 'analytics' && (
                <AnalyticsTabsSkeleton activeTabIndex={activeTabIndex} />
            )}
            {!hideTabs && variant !== 'audience' && variant !== 'analytics' && (
            <div className="fullWhiteBackground">
                <Container>
                    <Row>
                        <ul className="rs-tabs row rst-left-space mb0 mini w-100 m-0">
                            {Array.from({ length: tabCount }, (_, index) => (
                                <li
                                    key={index}
                                    className="tabDefault col-md-4"
                                >
                                    <span>
                                        <Shimmer
                                            style={{
                                                height: 12,
                                                width: '72%',
                                                margin: '12px auto',
                                                opacity: 1,
                                            }}
                                        />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Row>
                </Container>
            </div>
            )}
        </>
    );
};

function DefaultPageContentSkeleton({ inline }) {
    if (inline) {
        return (
            <div className="pls-content">
                <div className="pls-box">
                    <Shimmer style={{ height: 20, width: '35%', marginBottom: 12 }} />
                    <Shimmer style={{ height: 14, width: '100%', marginBottom: 8 }} />
                    <Shimmer style={{ height: 14, width: '92%', marginBottom: 8 }} />
                    <Shimmer style={{ height: 160, width: '100%' }} />
                </div>
            </div>
        );
    }

    return (
        <Container fluid className="page-content pt21">
            <Row>
                <div className="col-12">
                    <div className="box-design mb20 p20">
                        <Shimmer style={{ height: 20, width: '35%', marginBottom: 12 }} />
                        <Shimmer style={{ height: 14, width: '100%', marginBottom: 8 }} />
                        <Shimmer style={{ height: 200, width: '100%' }} />
                    </div>
                </div>
            </Row>
        </Container>
    );
}

const renderBodyContent = (variant, inline, activeTabIndex) => {
    if (variant === 'audienceTargetListCreation') {
        return <AudienceTargetListCreationSuspenseFallback />;
    }
    if (variant === 'audienceAddAudience') {
        return <AddAudiencePageSkeleton />;
    }
    if (variant === 'audienceAddImportAudience') {
        return <AddImportAudienceSkeleton />;
    }
    if (variant === 'audienceSyncHistory') {
        return <SyncHistorySkeleton inline ={inline}/>;
    }
    if (variant === 'audienceDynamicListCreation') {
        return <DynamicListCreationPageSkeleton />;
    }
    if (variant === 'audience') {
        return <AudiencePageContentSkeleton tabIndex={activeTabIndex} />;
    }
    if (variant === 'dashboard') {
        return <DashboardPageContentSkeleton tabIndex={activeTabIndex} inline={inline} />;
    }
    if (variant === 'communicationList') {
        return <CommunicationPageContentSkeleton tabIndex={activeTabIndex} inline={inline} />;
    }
    if (variant === 'communicationCreation') {
        return <CommunicationCreationPageContentSkeleton wrapScope={false} />;
    }
    if (variant === 'communicationAuthoring') {
        return <CommunicationAuthoringPageContentSkeleton wrapScope={false} />;
    }
    if (variant === 'mdcAuthoring') {
        return <MdcAuthoringPageContentSkeleton wrapScope={false} />;
    }
    if (variant === 'configureAnalytics') {
        return <ConfigureAnalyticsPageContentSkeleton />;
    }
    if (variant === 'communicationExecute') {
        return <CommunicationExecutePageContentSkeleton wrapScope={false} />;
    }
    if (variant === 'analyticsReport') {
        return <AnalyticsReportPageContentSkeleton inline={inline} />;
    }
    if (variant === 'analyticsDetail') {
        return <DetailAnalyticsPageSkeleton />;
    }
    if (variant === 'analytics') {
        return <AnalyticsPageContentSkeleton tabIndex={activeTabIndex} inline={inline} />;
    }
    if (variant === 'preferences') {
        return (
            <>
                <style>{preferencesSkeletonCriticalCss}</style>
                <PreferencesPageContentSkeleton inline={inline} />
            </>
        );
    }
    if (variant === 'preferencesSubPage') {
        return <PreferencesSubPageRouteSkeleton />;
    }
    return null;
};

const PageLayoutSkeleton = ({
    variant = 'default',
    contentOnly = false,
    inline = false,
    activeNavIndex = -1,
    activeTabIndex = 0,
}) => {
    const holderClass = [
        inline
            ? `page-layout-skeleton--inline${contentOnly ? ' page-layout-skeleton--content-only' : ''}`
            : `page-content-holder main-page-skeleton${contentOnly ? ' page-content-skeleton--content-only' : ''}`,
        variant === 'audience' ||
        variant === 'audienceTargetListCreation' ||
        variant === 'audienceAddAudience' ||
        variant === 'audienceAddImportAudience' ||
        variant === 'audienceSyncHistory' ||
        variant === 'audienceDynamicListCreation'
            ? 'audience-skeleton-scope'
            : variant === 'communicationList'
              ? 'communication-skeleton-scope'
              : variant === 'analytics' || variant === 'analyticsReport' || variant === 'analyticsDetail'
                ? 'analytics-skeleton-scope'
                : variant === 'configureAnalytics'
                  ? 'configure-analytics-skeleton-scope'
                  : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            {inline && <style>{pageLayoutSkeletonCriticalCss}</style>}
            {variant === 'audience' && <style>{audienceSkeletonCriticalCss}</style>}
            {variant === 'audienceAddAudience' && <style>{addAudienceSkeletonCriticalCss}</style>}
            {variant === 'audienceAddImportAudience' && <style>{addImportAudienceSkeletonCriticalCss}</style>}
            {variant === 'audienceTargetListCreation' && <style>{audienceTargetListCreationCriticalCss}</style>}
            {variant === 'audienceTargetListCreation' && <style>{segmentSkeletonCriticalCss}</style>}
            {variant === 'audienceDynamicListCreation' && <style>{dynamicListCreationSkeletonCriticalCss}</style>}
            {variant === 'communicationList' && <style>{communicationSkeletonCriticalCss}</style>}
            {variant === 'analytics' && <style>{analyticsSkeletonCriticalCss}</style>}
            {variant === 'analyticsReport' && <style>{analyticsReportSkeletonCriticalCss}</style>}
            {variant === 'analyticsDetail' && <style>{detailAnalyticsSkeletonCriticalCss}</style>}
            {variant === 'configureAnalytics' && (
                <>
                    <style>{skeletonShellSharedCriticalCss}</style>
                    <style>{configureAnalyticsSkeletonCriticalCss}</style>
                </>
            )}
            <div className={holderClass} aria-busy="true" aria-label="Loading page">
                {inline && !contentOnly && <MainNavBar activeNavIndex={activeNavIndex} inline />}
                <div>
                    {!contentOnly && (
                        <PageHeadingBlock variant={variant} inline={inline} activeTabIndex={activeTabIndex} />
                    )}
                    {(variant === 'audience' ||
                        variant === 'audienceTargetListCreation' ||
                        variant === 'audienceAddAudience' ||
                        variant === 'audienceAddImportAudience' ||
                        variant === 'audienceSyncHistory' ||
                        variant === 'audienceDynamicListCreation') &&
                    inline ? (
                        <div className="page-content-holder audience-skeleton-scope">
                            {renderBodyContent(variant, inline, activeTabIndex)}
                        </div>
                    ) : (
                        renderBodyContent(variant, inline, activeTabIndex)
                    )}
                </div>
            </div>
        </>
    );
};

PageLayoutSkeleton.propTypes = {
    variant: PropTypes.string,
    contentOnly: PropTypes.bool,
    inline: PropTypes.bool,
    activeNavIndex: PropTypes.number,
    activeTabIndex: PropTypes.number,
};

export { pageLayoutSkeletonCriticalCss, MainNavBar };

export default memo(PageLayoutSkeleton);
