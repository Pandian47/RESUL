import { memo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import PreferencesRouteSkeleton from './PreferencesRouteSkeleton';
import PreferencesSubPageRouteSkeleton from './PreferencesSubPageRouteSkeleton';
import LaunchPadRouteSkeleton from './LaunchPadRouteSkeleton';
import {
    AddAudiencePageSkeleton,
    AudienceSuspenseFallback,
    AudienceTargetListCreationSuspenseFallback,
    DynamicListCreationPageSkeleton,
} from '../pages/audience';
import { DashboardPageContentSkeleton } from '../pages/dashboard';
import {
    CommunicationAuthoringSuspenseFallback,
    CommunicationCreationSuspenseFallback,
    CommunicationExecuteSuspenseFallback,
    CommunicationSuspenseFallback,
} from '../pages/communication';
import { MdcAuthoringSuspenseFallback } from '../pages/communication/mdcAuthoring';
import { ConfigureAnalyticsSuspenseFallback } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create/ConfigureAnalytics/components/LandingAnalyticsSkeletons';
import {
    AnalyticsReportPageSkeleton,
    AnalyticsSuspenseFallback,
    DetailAnalyticsPageSkeleton,
} from '../pages/analytics';
import MdcWorkflowSkeleton from 'Components/Loader/MdcWorkflowSkeleton';
import AddImportAudienceSkeleton from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/AddImportAudienceSkeleton';
import SyncHistorySkeleton from 'Pages/AuthenticationModule/Audience/Pages/SyncHistory/Components/SyncHistorySkeleton';
import { getMainSkeletonVariant } from './mainSkeletonVariants';
import { getRouteTabIndex } from './getRouteTabIndex';
/** Route-level content skeleton (RSHeader already rendered). */
const PageContentSkeleton = ({ variant: variantProp, activeTabIndex: activeTabIndexProp }) => {
    const { pathname, search } = useLocation();
    const variant = variantProp || getMainSkeletonVariant(pathname);
    const activeTabIndex = activeTabIndexProp ?? getRouteTabIndex(pathname, search);

    if (variant === 'dashboard') {
        return (
            <div className="dashboard-skeleton-scope" aria-busy="true" aria-label="Loading dashboard">
                <DashboardPageContentSkeleton tabIndex={activeTabIndex} inline />
            </div>
        );
    }

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
        return <SyncHistorySkeleton />;
    }

    if (variant === 'audienceDynamicListCreation') {
        return <DynamicListCreationPageSkeleton />;
    }

    if (variant === 'audience') {
        return <AudienceSuspenseFallback />;
    }

    if (variant === 'communicationList') {
        return <CommunicationSuspenseFallback />;
    }

    if (variant === 'communicationCreation') {
        return <CommunicationCreationSuspenseFallback />;
    }

    if (variant === 'communicationAuthoring') {
        return <CommunicationAuthoringSuspenseFallback />;
    }

    if (variant === 'mdcAuthoring') {
        return <MdcAuthoringSuspenseFallback />;
    }

    if (variant === 'configureAnalytics') {
        return <ConfigureAnalyticsSuspenseFallback />;
    }

    if (variant === 'communicationExecute') {
        return <CommunicationExecuteSuspenseFallback />;
    }

    if (variant === 'mdcWorkflow') {
        return <MdcWorkflowSkeleton />;
    }

    if (variant === 'analyticsReport') {
        return <AnalyticsReportPageSkeleton />;
    }

    if (variant === 'analyticsDetail') {
        return <DetailAnalyticsPageSkeleton />;
    }

    if (variant === 'analytics') {
        return <AnalyticsSuspenseFallback />;
    }

    if (variant === 'launchPad') {
        return <LaunchPadRouteSkeleton />;
    }

    if (variant === 'preferences') {
        return <PreferencesRouteSkeleton />;
    }

    if (variant === 'preferencesSubPage') {
        return <PreferencesSubPageRouteSkeleton />;
    }

    return null;
};

PageContentSkeleton.propTypes = {
    variant: PropTypes.string,
    activeTabIndex: PropTypes.number,
};

export default memo(PageContentSkeleton);
