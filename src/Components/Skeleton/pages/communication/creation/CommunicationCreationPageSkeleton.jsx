import { memo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    skeletonShellSharedCriticalCss,
} from '../../../Components/common';
import { MainNavBar, pageLayoutSkeletonCriticalCss } from '../../../Components/PageLayoutSkeleton';
import { communicationCreationSkeletonCriticalCss } from './communicationCreationSkeletonCriticalCss';
import DeliveryTypeSelectSkeleton from './DeliveryTypeSelectSkeleton';
import CommunicationCreationDeliverySkeleton from './CommunicationCreationDeliverySkeleton';
import PlanProgressStepsSkeleton from './PlanProgressStepsSkeleton';
import {
    COMMUNICATION_CREATION_SKELETON_PHASE,
    getCommunicationCreationSkeletonPhase,
} from './communicationCreationSkeletonUtils';

const CommunicationCreationBodySkeleton = ({
    phase,
    deliveryType,
    activeTabIndex,
    showProgressSteps = true,
}) => {
    const isDelivery = phase === COMMUNICATION_CREATION_SKELETON_PHASE.DELIVERY;

    const body = (
        <div className="cc-page-skeleton__body communication-create">
            {isDelivery ? (
                <CommunicationCreationDeliverySkeleton
                    deliveryType={deliveryType}
                    activeTabIndex={activeTabIndex}
                />
            ) : (
                <DeliveryTypeSelectSkeleton />
            )}
        </div>
    );

    if (!showProgressSteps) {
        return body;
    }

    return (
        <div className="cc-page-skeleton__planning planning-layout">
            {isDelivery ? <PlanProgressStepsSkeleton /> : null}
            {body}
        </div>
    );
};

CommunicationCreationBodySkeleton.propTypes = {
    phase: PropTypes.oneOf(Object.values(COMMUNICATION_CREATION_SKELETON_PHASE)),
    deliveryType: PropTypes.oneOf(['single', 'event', 'multi']),
    activeTabIndex: PropTypes.number,
    showProgressSteps: PropTypes.bool,
};

export const CommunicationCreationPlanLoadingBlock = ({
    phase,
    deliveryType = 'single',
    activeTabIndex = 0,
}) => (
    <>
        <style>{communicationCreationSkeletonCriticalCss}</style>
        <div className="communication-creation-skeleton-scope communication-creation-inline-skeleton cc-page-skeleton__inline">
            <CommunicationCreationBodySkeleton
                phase={phase}
                deliveryType={deliveryType}
                activeTabIndex={activeTabIndex}
                showProgressSteps={false}
            />
        </div>
    </>
);

CommunicationCreationPlanLoadingBlock.propTypes = {
    phase: PropTypes.oneOf(Object.values(COMMUNICATION_CREATION_SKELETON_PHASE)),
    deliveryType: PropTypes.oneOf(['single', 'event', 'multi']),
    activeTabIndex: PropTypes.number,
};

export const CommunicationCreationPageContentSkeleton = ({
    wrapScope = true,
    phase: phaseProp,
    deliveryType = 'single',
    activeTabIndex = 0,
}) => {
    const { search } = useLocation();
    const phase = phaseProp ?? getCommunicationCreationSkeletonPhase(search);
    const isSelectTypePhase = phase === COMMUNICATION_CREATION_SKELETON_PHASE.SELECT_TYPE;

    const shell = (
        <>
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{communicationCreationSkeletonCriticalCss}</style>
            <RSPageHeaderSkeleton variant="communicationCreation" className="communication-creation-page-header-skeleton" />
            <BreadcrumbSkeleton tabIndex={0} />
            <div
                className={`cc-page-skeleton__fluid communication-creation-page-fluid${
                    isSelectTypePhase ? ' communication-creation-page-fluid--select-type' : ''
                }`}
            >
                <div className="cc-page-skeleton__content page-content">
                    <div className="cc-page-skeleton__inner communication-creation-page-inner">
                        <CommunicationCreationBodySkeleton
                            phase={phase}
                            deliveryType={deliveryType}
                            activeTabIndex={activeTabIndex}
                        />
                    </div>
                </div>
            </div>
        </>
    );

    if (!wrapScope) {
        return shell;
    }

    return <div className="communication-creation-skeleton-scope cc-page-skeleton">{shell}</div>;
};

export const CommunicationCreationSuspenseFallback = () => {
    const { search } = useLocation();
    const phase = getCommunicationCreationSkeletonPhase(search);

    return (
        <div
            className="page-content-holder communication-creation-suspense-fallback communication-creation-skeleton-scope cc-page-skeleton"
            aria-busy="true"
            aria-label={
                phase === COMMUNICATION_CREATION_SKELETON_PHASE.DELIVERY
                    ? 'Loading communication plan'
                    : 'Loading delivery method options'
            }
        >
            <CommunicationCreationPageContentSkeleton wrapScope={false} phase={phase} />
        </div>
    );
};

export const CommunicationCreationRouteSkeleton = ({
    withAppShell = false,
    activeNavIndex = -1,
    phase: phaseProp,
    deliveryType = 'single',
    activeTabIndex = 0,
}) => {
    const { search } = useLocation();
    const phase = phaseProp ?? getCommunicationCreationSkeletonPhase(search);

    const body = (
        <CommunicationCreationPageContentSkeleton
            wrapScope={false}
            phase={phase}
            deliveryType={deliveryType}
            activeTabIndex={activeTabIndex}
        />
    );

    if (!withAppShell) {
        return (
            <div
                className="page-content-holder communication-creation-skeleton-scope cc-page-skeleton"
                aria-busy="true"
                aria-label="Loading communication creation"
            >
                {body}
            </div>
        );
    }

    return (
        <>
            <style>{pageLayoutSkeletonCriticalCss}</style>
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{communicationCreationSkeletonCriticalCss}</style>
            <div
                className="page-content-holder communication-creation-skeleton-scope cc-page-skeleton page-layout-skeleton--inline"
                aria-busy="true"
                aria-label="Loading communication creation"
            >
                <MainNavBar activeNavIndex={activeNavIndex} inline />
                <div className="cc-page-skeleton__route-body">{body}</div>
            </div>
        </>
    );
};

CommunicationCreationPageContentSkeleton.propTypes = {
    wrapScope: PropTypes.bool,
    phase: PropTypes.oneOf(Object.values(COMMUNICATION_CREATION_SKELETON_PHASE)),
    deliveryType: PropTypes.oneOf(['single', 'event', 'multi']),
    activeTabIndex: PropTypes.number,
};

CommunicationCreationRouteSkeleton.propTypes = {
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
    phase: PropTypes.oneOf(Object.values(COMMUNICATION_CREATION_SKELETON_PHASE)),
    deliveryType: PropTypes.oneOf(['single', 'event', 'multi']),
    activeTabIndex: PropTypes.number,
};

export default memo(CommunicationCreationPageContentSkeleton);
