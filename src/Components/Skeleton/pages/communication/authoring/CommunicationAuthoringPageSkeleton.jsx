import { memo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    skeletonShellSharedCriticalCss,
} from '../../../Components/common';
import { MainNavBar, pageLayoutSkeletonCriticalCss } from '../../../Components/PageLayoutSkeleton';
import PlanProgressStepsSkeleton from '../creation/PlanProgressStepsSkeleton';
import CampaignInfoSkeleton from '../creation/CampaignInfoSkeleton';
import { communicationAuthoringSkeletonCriticalCss } from './communicationAuthoringSkeletonCriticalCss';
import { getAuthoringChannelIndex, getAuthoringSkeletonVariant } from './authoringSkeletonUtils';
import { getAuthoringChannelIdFromVerticalIndex } from './authoringChannelSkeletonConfig';
import { getAuthoringChannelInnerVariant } from './authoringChannelEditSkeletonProfiles';
import { AuthoringChannelInnerSkeletonLayout } from './authoringChannelInnerSkeletonLayouts';

const VERTICAL_TAB_LABELS = ['Email', 'Messaging', 'Notification', 'Social post', 'Voice', 'Ad', 'QR', 'Analytics'];

const Shimmer = ({ className = '', isText = false }) => (
    <span
        className={`skeleton-shimmer ca-skeleton-shimmer--block${isText ? ' ca-skeleton-shimmer--text' : ''} ${className}`.trim()}
        aria-hidden="true"
    />
);

/** One form skeleton — channel variant drives layout (SDC + MDC inner gate). */
const AuthoringFormPanelSkeleton = ({ channelId, channelIndex, innerVariant }) => {
    const resolvedVariant = innerVariant ?? getAuthoringChannelInnerVariant(channelId);
    return (
        <AuthoringChannelInnerSkeletonLayout
            innerVariant={resolvedVariant}
            channelId={channelId}
            channelIndex={channelIndex}
            isSubTab={true}
        />
    );
};

/** Left vertical channel tabs + right sub-tabs and form. */
export const AuthoringCreateChannelSkeleton = ({ channelIndex = 0 }) => {
    const channelId = getAuthoringChannelIdFromVerticalIndex(channelIndex);
    return (
        <div className="authoring-vertical-tabs-skeleton">
            <ul className="authoring-vertical-tabs-skeleton__list">
                {VERTICAL_TAB_LABELS.map((label) => (
                    <li key={label} className="authoring-vertical-tabs-skeleton__tab">
                        <Shimmer className="authoring-vertical-tabs-skeleton__icon" />
                        <Shimmer isText className="authoring-vertical-tabs-skeleton__label" />
                    </li>
                ))}
            </ul>
            <div className="authoring-channel-fields-skeleton">
                <AuthoringFormPanelSkeleton channelId={channelId} channelIndex={channelIndex} />
            </div>
        </div>
    );
};

/** Inline on Create page while tabData is still empty — vertical tabs + fields (no sub-tabber). */
export const AuthoringCreateChannelSkeletonBlock = ({ channelIndex = 0 }) => (
    <>
        <style>{communicationAuthoringSkeletonCriticalCss}</style>
        <div className="communication-authoring-skeleton-scope communication-authoring-inline-channel-skeleton">
            <AuthoringCreateChannelSkeleton channelIndex={channelIndex} />
        </div>
    </>
);

const CommunicationAuthoringPageShell = ({ channelIndex = 0 }) => (
    <>
        <RSPageHeaderSkeleton variant="tabber" className="communication-authoring-page-header-skeleton" />
        <BreadcrumbSkeleton tabIndex={0} />
        <div className="ca-page-skeleton__tabs-wrapper">
            <div className="ca-page-skeleton__plan ca-page-skeleton__plan--channel-tabs">
                <div className="ca-page-skeleton__fluid">
                    <div className="ca-page-skeleton__content">
                        <div className="ca-page-skeleton__inner authoring-page-body">
                            <PlanProgressStepsSkeleton />
                            <CampaignInfoSkeleton />
                            <AuthoringCreateChannelSkeleton channelIndex={channelIndex} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

export const CommunicationAuthoringPageContentSkeleton = ({
    wrapScope = true,
    variant: variantProp,
    channelIndex: channelIndexProp,
}) => {
    const { search } = useLocation();
    const channelIndex = channelIndexProp ?? getAuthoringChannelIndex(search);
    const variant = variantProp ?? getAuthoringSkeletonVariant(channelIndex);

    const shell = (
        <>
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{communicationAuthoringSkeletonCriticalCss}</style>
            <CommunicationAuthoringPageShell channelIndex={channelIndex} />
        </>
    );

    if (!wrapScope) {
        return shell;
    }

    return (
        <div
            className={`communication-authoring-skeleton-scope communication-authoring-skeleton-scope--${variant}`}
            data-channel-index={channelIndex}
        >
            {shell}
        </div>
    );
};

export const CommunicationAuthoringSuspenseFallback = () => {
    const { search } = useLocation();
    const channelIndex = getAuthoringChannelIndex(search);
    const variant = getAuthoringSkeletonVariant(channelIndex);

    return (
        <div
            className={`page-content-holder communication-authoring-suspense-fallback communication-authoring-skeleton-scope communication-authoring-skeleton-scope--${variant}`}
            data-channel-index={channelIndex}
            aria-busy="true"
            aria-label="Loading communication authoring"
        >
            <CommunicationAuthoringPageContentSkeleton
                wrapScope={false}
                variant={variant}
                channelIndex={channelIndex}
            />
        </div>
    );
};

export const CommunicationAuthoringRouteSkeleton = ({ withAppShell = false, activeNavIndex = -1 }) => {
    const { search } = useLocation();
    const channelIndex = getAuthoringChannelIndex(search);
    const variant = getAuthoringSkeletonVariant(channelIndex);
    const body = (
        <CommunicationAuthoringPageContentSkeleton
            wrapScope={false}
            variant={variant}
            channelIndex={channelIndex}
        />
    );

    if (!withAppShell) {
        return (
            <div
                className={`page-content-holder communication-authoring-skeleton-scope communication-authoring-skeleton-scope--${variant}`}
                data-channel-index={channelIndex}
                aria-busy="true"
                aria-label="Loading communication authoring"
            >
                {body}
            </div>
        );
    }

    return (
        <>
            <style>{pageLayoutSkeletonCriticalCss}</style>
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{communicationAuthoringSkeletonCriticalCss}</style>
            <div
                className={`page-content-holder communication-authoring-skeleton-scope communication-authoring-skeleton-scope--${variant} page-layout-skeleton--inline`}
                data-channel-index={channelIndex}
                aria-busy="true"
                aria-label="Loading communication authoring"
            >
                <MainNavBar activeNavIndex={activeNavIndex} inline />
                <div className="ca-page-skeleton__route-body">{body}</div>
            </div>
        </>
    );
};

CommunicationAuthoringPageContentSkeleton.propTypes = {
    wrapScope: PropTypes.bool,
    variant: PropTypes.oneOf(['full', 'basic']),
    channelIndex: PropTypes.number,
};

CommunicationAuthoringRouteSkeleton.propTypes = {
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
};

export default memo(CommunicationAuthoringPageContentSkeleton);
