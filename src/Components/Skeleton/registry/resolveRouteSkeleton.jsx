import { resolveSkeletonRouteKey, SKELETON_KEYS } from './skeletonRouteConfig';
import {
    AddAudiencePageSkeleton,
    AudienceSuspenseFallback,
    AudienceTargetListCreationSkeleton,
    DynamicListCreationPageSkeleton,
} from '../pages/audience';
import { AudienceMdmPanelSkeleton } from '../pages/audience/mdm';
import { DashboardSuspenseFallback } from '../pages/dashboard';
import {
    CommunicationAuthoringSuspenseFallback,
    CommunicationCreationSuspenseFallback,
    CommunicationExecuteSuspenseFallback,
    CommunicationSuspenseFallback,
} from '../pages/communication';
import { MdcAuthoringSuspenseFallback } from '../pages/communication/mdcAuthoring';
import { ConfigureAnalyticsSuspenseFallback } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create/ConfigureAnalytics/components/LandingAnalyticsSkeletons';
import {
    AnalyticsReportSuspenseFallback,
    AnalyticsSuspenseFallback,
    DetailAnalyticsPageSkeleton,
} from '../pages/analytics';
import PreferencesRouteSkeleton from '../Components/PreferencesRouteSkeleton';
import PreferencesSubPageRouteSkeleton from '../Components/PreferencesSubPageRouteSkeleton';
import { RSLoaderOverlay } from 'Components/Loader';
import AccountSetupPageSkeleton from '../pages/accountSetup/AccountSetupPageSkeleton';
import SetupCompletePageSkeleton from '../pages/setupComplete/SetupCompletePageSkeleton';
import MdcWorkflowSkeleton from 'Components/Loader/MdcWorkflowSkeleton';
import AddImportAudienceSkeleton from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/AddImportAudienceSkeleton';
import SyncHistorySkeleton from 'Pages/AuthenticationModule/Audience/Pages/SyncHistory/Components/SyncHistorySkeleton';

/**
 * Suspense fallback component for the current route, or null → use generic PageContentSkeleton.
 */
const SKELETON_SUSPENSE_MAP = {
    [SKELETON_KEYS.audienceMainTabs]: AudienceSuspenseFallback,
    [SKELETON_KEYS.audienceTargetListCreation]: AudienceTargetListCreationSkeleton,
    [SKELETON_KEYS.audienceAddAudience]: AddAudiencePageSkeleton,
    [SKELETON_KEYS.audienceAddImportAudience]: AddImportAudienceSkeleton,
    [SKELETON_KEYS.audienceSyncHistory]: SyncHistorySkeleton,
    [SKELETON_KEYS.audienceDynamicListCreation]: DynamicListCreationPageSkeleton,
    [SKELETON_KEYS.audienceMdm]: () => (
        <div className="page-content-holder audience-skeleton-scope" aria-busy="true" aria-label="Loading audience">
            <AudienceMdmPanelSkeleton showTabs={false} />
        </div>
    ),
    [SKELETON_KEYS.dashboard]: DashboardSuspenseFallback,
    [SKELETON_KEYS.communicationList]: CommunicationSuspenseFallback,
    [SKELETON_KEYS.communicationCreation]: CommunicationCreationSuspenseFallback,
    [SKELETON_KEYS.communicationAuthoring]: CommunicationAuthoringSuspenseFallback,
    [SKELETON_KEYS.mdcAuthoring]: MdcAuthoringSuspenseFallback,
    [SKELETON_KEYS.configureAnalytics]: ConfigureAnalyticsSuspenseFallback,
    [SKELETON_KEYS.communicationExecute]: CommunicationExecuteSuspenseFallback,
    [SKELETON_KEYS.mdcWorkflow]: MdcWorkflowSkeleton,
    [SKELETON_KEYS.analyticsReport]: AnalyticsReportSuspenseFallback,
    [SKELETON_KEYS.analyticsDetail]: DetailAnalyticsPageSkeleton,
    [SKELETON_KEYS.analytics]: AnalyticsSuspenseFallback,
    [SKELETON_KEYS.preferences]: PreferencesRouteSkeleton,
    [SKELETON_KEYS.preferencesSubPage]: PreferencesSubPageRouteSkeleton,
    [SKELETON_KEYS.login]: () => <RSLoaderOverlay />,
    [SKELETON_KEYS.genie]: () => <RSLoaderOverlay />,
    [SKELETON_KEYS.accountSetup]: AccountSetupPageSkeleton,
    [SKELETON_KEYS.setupComplete]: SetupCompletePageSkeleton,
};

export const getRouteSuspenseFallback = (pathname = '') => {
    const key = resolveSkeletonRouteKey(pathname);
    return SKELETON_SUSPENSE_MAP[key] ?? null;
};

export { resolveSkeletonRouteKey };

