import { memo } from 'react';
import PropTypes from 'prop-types';
import { Col, Container, Row } from 'react-bootstrap';

import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    TabBarViewSkeleton,
    createPageLoadingScene,
} from '../../Components/common';
import { CommonSkeleton } from '../../Components/SkeletonOverall';
import { communicationSkeletonCriticalCss } from './communicationSkeletonCriticalCss';
import { markCommunicationRouteSkeleton } from './communicationRouteSkeletonPhase';
import { ListTabSkeleton } from './list';
import { GalleryTabSkeleton } from './gallery';
import { PlannerTabSkeleton } from './planner';

const COMMUNICATION_TAB_COUNT = 3;

/** Split A/B modal — matches SplitABScheduler (split-header-box + split-card-box layout). */
export const SplitABSchedulerModalSkeleton = ({
    splitCount = 2,
    showScheduleRow = false,
    showScheduleDateInput = false,
    showHeaderStats = true,
}) => (
    <div className="split-ab-scheduler-modal-skeleton" aria-hidden="true">
        {showHeaderStats && (
        <ul className="split-header-box mb30 d-flex align-items-center justify-content-between py10 mx-9">
            <li className="left">
                <CommonSkeleton box height={16} width="92%" stopAnimation mainClass="mb-2" />
                <CommonSkeleton box height={14} width="68%" stopAnimation />
            </li>
            <li className="middle align-items-start lh-sm d-flex flex-column">
                <CommonSkeleton box height={14} width={165} stopAnimation mainClass="mb-2" />
                <CommonSkeleton box height={14} width={180} stopAnimation />
            </li>
        </ul>
        )}
        <div className="form-group">
            <div className="container">
                <Row className="splitAB-wrapper mx-0">
                    {Array.from({ length: splitCount }, (_, index) => (
                        <Col key={`split-ab-skel-${index}`} className="d-flex">
                            <span className="split-card-box h-100 w-100 d-flex flex-column">
                                <div className="split-card-radio" aria-hidden="true">
                                    <CommonSkeleton circle width={20} height={20} stopAnimation />
                                </div>
                                <div className="split-card-inner flex-grow-1 d-flex flex-column w-100">
                                    <div className="scb-header bg-tertiary-blue border-tlr10 border-trr10 p19">
                                        <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                                            <CommonSkeleton box height={20} width="42%" stopAnimation />
                                            <CommonSkeleton circle width={24} height={24} stopAnimation />
                                        </div>
                                    </div>
                                    <div className="split-card-dimmed-body flex-grow-1 d-flex flex-column">
                                        <div className="scb-size">
                                            <CommonSkeleton box height={14} width={72} stopAnimation />
                                            <CommonSkeleton box height={24} width={36} stopAnimation />
                                            <CommonSkeleton box height={14} width={32} stopAnimation />
                                        </div>
                                        <div className="scb-preview flex-grow-1 d-flex flex-column bg-light p10 px19">
                                            <CommonSkeleton box height={12} width={88} stopAnimation mainClass="mb-2" />
                                            <CommonSkeleton box height={18} width="55%" stopAnimation />
                                        </div>
                                    </div>
                                </div>
                            </span>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
        {showScheduleRow && (
            <div className="form-group px13 mb0">
                <Row className="align-items-start gy-2 gx-2">
                    <Col xs="auto" className="flex-shrink-0">
                        <CommonSkeleton box height={14} width={72} stopAnimation />
                    </Col>
                    <Col xs="auto" className="flex-shrink-0">
                        <CommonSkeleton box height={28} width={56} stopAnimation />
                    </Col>
                    {showScheduleDateInput && (
                        <Col sm={6} className="min-w-0">
                            <CommonSkeleton box height={36} width="100%" stopAnimation />
                        </Col>
                    )}
                </Row>
            </div>
        )}
    </div>
);

SplitABSchedulerModalSkeleton.propTypes = {
    splitCount: PropTypes.number,
    showScheduleRow: PropTypes.bool,
    showScheduleDateInput: PropTypes.bool,
    showHeaderStats: PropTypes.bool,
};

export const CommunicationPageHeaderSkeleton = () => (
    <RSPageHeaderSkeleton variant="tabber" className="communication-page-header-skeleton" />
);

const CommunicationTabsSkeleton = (props) => (
    <TabBarViewSkeleton
        tabCount={COMMUNICATION_TAB_COUNT}
        scopeClass="communication-tabs-skeleton"
        tabsListClass="communication-tabs-skeleton__list"
        tabsRowClass="rs-tabs row mb0 mini w-100 m-0"
        containerClass="communication-tabs-skeleton__container"
        wrapperClassName="mb0"
        omitColClass
        {...props}
    />
);

export const CommunicationTabBodySkeleton = ({ tabIndex = 0 }) => {
    if (tabIndex === 1) return <GalleryTabSkeleton />;
    if (tabIndex === 2) return <PlannerTabSkeleton />;
    return <ListTabSkeleton />;
};

CommunicationTabBodySkeleton.propTypes = { tabIndex: PropTypes.number };

const CommunicationPageShellSkeleton = ({ tabIndex = 0, children }) => (
    <>
        <CommunicationPageHeaderSkeleton />
        <BreadcrumbSkeleton tabIndex={tabIndex} />
        <div className="pc-tabs-wrapper">
            <div className="page-content pc-communication-plan">
                    <div className="page-content">
                        <div className="fullWhiteBackground">
                            <CommunicationTabsSkeleton activeTabIndex={tabIndex} />
                        </div>
                        <Container className="px0">{children}</Container>
                    </div>
            </div>
        </div>
    </>
);

const communicationLoadingScene = createPageLoadingScene({
    scopeClass: 'communication-skeleton-scope',
    suspenseFallbackClass: 'communication-suspense-fallback',
    ariaLabel: 'Loading communication',
    pageCriticalCss: communicationSkeletonCriticalCss,
    markRouteSkeleton: markCommunicationRouteSkeleton,
    TabBodySkeleton: CommunicationTabBodySkeleton,
    PageShellSkeleton: CommunicationPageShellSkeleton,
});

export const CommunicationPageContentSkeleton = communicationLoadingScene.PageContentSkeleton;
export const CommunicationRouteSkeleton = communicationLoadingScene.RouteSkeleton;
export const CommunicationSuspenseFallback = communicationLoadingScene.SuspenseFallback;

export {
    CommunicationPageShellSkeleton,
    CommunicationTabsSkeleton,
    ListTabSkeleton,
    GalleryTabSkeleton,
    PlannerTabSkeleton,
};
export default memo(CommunicationPageContentSkeleton);

CommunicationRouteSkeleton.propTypes = {
    activeTabIndex: PropTypes.number,
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
    contentOnly: PropTypes.bool,
    layer: PropTypes.string,
};
