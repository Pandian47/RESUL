import { memo } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import MdcWorkflowSkeleton from 'Components/Loader/MdcWorkflowSkeleton';
import PageLayoutSkeleton from './PageLayoutSkeleton';
import PreferencesRouteSkeleton from './PreferencesRouteSkeleton';
import PreferencesSubPageRouteSkeleton, {
    PREFERENCES_SUBPAGE_VARIANT,
    resolvePreferencesSubPageVariant,
} from './PreferencesSubPageRouteSkeleton';
import LaunchPadRouteSkeleton from './LaunchPadRouteSkeleton';
import { MainNavBar, pageLayoutSkeletonCriticalCss } from './common/pageLoadingScene';
import { BreadcrumbSkeleton, skeletonShellSharedCriticalCss } from './common';
import {
    audienceScoreSkeletonCriticalCss,
    dataExchangeSkeletonCriticalCss,
    communicationSettingsSkeletonCriticalCss,
    communicationSubscriptionSkeletonCriticalCss,
    preferencesSkeletonCriticalCss,
} from './preferencesSkeletonCriticalCss';
import { PreferencesSectionsSkeleton } from './PreferencesPageContentSkeleton';
import { Container } from 'react-bootstrap';
import { CommonSkeleton } from './SkeletonOverall';
import { DashboardRouteSkeleton } from '../pages/dashboard';
import {
    CommunicationAuthoringRouteSkeleton,
    CommunicationCreationRouteSkeleton,
    CommunicationExecuteRouteSkeleton,
    CommunicationRouteSkeleton,
} from '../pages/communication';
import { MdcAuthoringRouteSkeleton } from '../pages/communication/mdcAuthoring';
import { AnalyticsRouteSkeleton, AnalyticsReportRouteSkeleton } from '../pages/analytics';
import { AudienceRouteSkeleton } from '../pages/audience';
import { getMainNavActiveIndex, getMainSkeletonVariant } from './mainSkeletonVariants';
import { getRouteTabIndex, isCommunicationExecuteRoiFlow } from './getRouteTabIndex';
import { RSLoaderOverlay } from 'Components/Loader';

export { getMainSkeletonVariant };

const MainPageSkeleton = ({ variant: variantProp, withAppShell = false, activeTabIndex: activeTabIndexProp }) => {
    const { pathname, search } = useLocation();
    const variant = variantProp || getMainSkeletonVariant(pathname);
    const activeTabIndex = activeTabIndexProp ?? getRouteTabIndex(pathname, search);

    if (variant === 'mdcWorkflow') {
        return <MdcWorkflowSkeleton />;
    }

    if (variant === 'launchPad') {
        return (
            <LaunchPadRouteSkeleton
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
            />
        );
    }

    if (variant === 'preferences' && withAppShell) {
        return (
            <>
                <style>{pageLayoutSkeletonCriticalCss}</style>
                <style>{skeletonShellSharedCriticalCss}</style>
                <style>{preferencesSkeletonCriticalCss}</style>
                <div
                    className="page-content-holder preferences-skeleton-scope page-layout-skeleton--inline"
                    aria-busy="true"
                    aria-label="Loading preferences"
                >
                    <MainNavBar activeNavIndex={getMainNavActiveIndex(pathname)} inline />
                    <BreadcrumbSkeleton />
                    <Container fluid className="main-heading-wrapper mb0">
                        <Container className="mhw-container">
                            <div className="mhwc-left">
                                <div className="heading-title-text">
                                    <h1>
                                        <CommonSkeleton box width={180} height={36} stopAnimation />
                                    </h1>
                                </div>
                            </div>
                        </Container>
                    </Container>
                        <div className="page-content">
                               <Container className='' style={{padding : "0"}}>
                                 <PreferencesSectionsSkeleton />
                               </Container>
                        </div>
                </div>
            </>
        );
    }

    if (variant === 'preferences' && !withAppShell) {
        return <PreferencesRouteSkeleton />;
    }

    if (variant === 'preferencesSubPage' && withAppShell) {
        const subPageVariant = resolvePreferencesSubPageVariant(pathname);
        const isDataCatalogue =
            subPageVariant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE ||
            subPageVariant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE_GRID;
        const isCommunicationSettings =
            subPageVariant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS;
        const isCommunicationSubscription =
            subPageVariant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SUBSCRIPTION;
        const isAudienceScore = subPageVariant === PREFERENCES_SUBPAGE_VARIANT.AUDIENCE_SCORE;
        const isDataExchange = subPageVariant === PREFERENCES_SUBPAGE_VARIANT.DATA_EXCHANGE;
        return (
            <>
                <style>{pageLayoutSkeletonCriticalCss}</style>
                <style>{preferencesSkeletonCriticalCss}</style>
                {isCommunicationSettings ? (
                    <style>{communicationSettingsSkeletonCriticalCss}</style>
                ) : null}
                {isCommunicationSubscription ? (
                    <style>{communicationSubscriptionSkeletonCriticalCss}</style>
                ) : null}
                {isAudienceScore ? (
                    <style>{audienceScoreSkeletonCriticalCss}</style>
                ) : null}
                {isDataExchange ? (
                    <style>{dataExchangeSkeletonCriticalCss}</style>
                ) : null}
                <div
                    className={[
                        'page-content-holder',
                        'preferences-skeleton-scope',
                        'preferences-subpage-skeleton-scope',
                        isDataCatalogue ? 'data-catalogue' : '',
                        isCommunicationSettings ? 'communication-settings' : '',
                        isCommunicationSubscription ? 'communication-subscription' : '',
                        isAudienceScore ? 'pc-audience-score' : '',
                        isDataExchange ? 'pc-data-exchange' : '',
                        'page-layout-skeleton--inline',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    aria-busy="true"
                    aria-label="Loading preferences"
                >
                    <MainNavBar activeNavIndex={getMainNavActiveIndex(pathname)} inline />
                    <PreferencesSubPageRouteSkeleton variant={subPageVariant} withAppShell />
                </div>
            </>
        );
    }

    if (variant === 'preferencesSubPage' && !withAppShell) {
        return (
            <PreferencesSubPageRouteSkeleton variant={resolvePreferencesSubPageVariant(pathname)} />
        );
    }

    if (variant === 'dashboard') {
        return (
            <DashboardRouteSkeleton
                activeTabIndex={activeTabIndex}
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
                contentOnly={false}
            />
        );
    }

    if (variant === 'communicationList') {
        return (
            <CommunicationRouteSkeleton
                activeTabIndex={activeTabIndex}
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
                contentOnly={false}
            />
        );
    }

    if (variant === 'communicationCreation') {
        return (
            <CommunicationCreationRouteSkeleton
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
            />
        );
    }

    if (variant === 'mdcAuthoring') {
        /* MDC canvas authoring hides RSHeader — no MainNavBar skeleton. */
        return <MdcAuthoringRouteSkeleton />;
    }

    if (variant === 'configureAnalytics') {
        return (
            <PageLayoutSkeleton
                variant="configureAnalytics"
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
                contentOnly={false}
            />
        );
    }

    if (variant === 'communicationAuthoring') {
        return (
            <CommunicationAuthoringRouteSkeleton
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
            />
        );
    }

    if (variant === 'communicationExecute') {
        return (
            <CommunicationExecuteRouteSkeleton
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
                isRoiFlow={isCommunicationExecuteRoiFlow(search)}
            />
        );
    }

    if (variant === 'analyticsReport') {
        return (
            <AnalyticsReportRouteSkeleton
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
            />
        );
    }

    if (variant === 'analyticsDetail') {
        return <PageLayoutSkeleton variant={variant} inline={withAppShell} activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1} activeTabIndex={0} />;
    }

    if (variant === 'analytics') {
        return (
            <AnalyticsRouteSkeleton
                activeTabIndex={activeTabIndex}
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
                contentOnly={false}
            />
        );
    }

    if (
        variant === 'audienceTargetListCreation' ||
        variant === 'audienceAddAudience' ||
        variant === 'audienceAddImportAudience' ||
        variant === 'audienceSyncHistory' ||
        variant === 'audienceDynamicListCreation'
    ) {
        return <PageLayoutSkeleton variant={variant} inline={withAppShell} activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1} activeTabIndex={0} />;
    }

    if (variant === 'audience') {
        return (
            <AudienceRouteSkeleton
                activeTabIndex={activeTabIndex}
                withAppShell={withAppShell}
                activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
            />
        );
    }
    if (variant === 'genie') {
        return <RSLoaderOverlay />;
    }
    /* Other routes: PageLayoutSkeleton — MDM body from pages/audience/mdm */
    return (
        <PageLayoutSkeleton
            variant={variant}
            inline={withAppShell}
            activeNavIndex={withAppShell ? getMainNavActiveIndex(pathname) : -1}
            activeTabIndex={activeTabIndex}
        />
    );
};

MainPageSkeleton.propTypes = {
    variant: PropTypes.oneOf([
        'mdcWorkflow',
        'communicationCreation',
        'communicationAuthoring',
        'mdcAuthoring',
        'configureAnalytics',
        'communicationExecute',
        'communicationList',
        'audience',
        'audienceTargetListCreation',
        'audienceAddAudience',
        'audienceAddImportAudience',
        'audienceSyncHistory',
        'audienceDynamicListCreation',
        'analytics',
        'analyticsReport',
        'analyticsDetail',
        'dashboard',
        'preferences',
        'preferencesSubPage',
        'launchPad',
        'genie',
        'default',
    ]),
    withAppShell: PropTypes.bool,
    activeTabIndex: PropTypes.number,
};

export default memo(MainPageSkeleton);
