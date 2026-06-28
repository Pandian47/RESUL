import { APPROVAL_STATUS, CONTENT, LIST, PRE_COMMUNICATION_ANALYTICS } from 'Constants/GlobalConstant/Placeholders';
import { memo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';

import { isCommunicationExecuteRoiFlow } from '../../../Components/getRouteTabIndex';

import {
    BreadcrumbSkeleton,
    RSPageHeaderSkeleton,
    skeletonShellSharedCriticalCss,
} from '../../../Components/common';
import { MainNavBar, pageLayoutSkeletonCriticalCss } from '../../../Components/PageLayoutSkeleton';
import PlanProgressStepsSkeleton from '../creation/PlanProgressStepsSkeleton';
import CampaignInfoSkeleton from '../creation/CampaignInfoSkeleton';
import { communicationExecuteSkeletonCriticalCss } from './communicationExecuteSkeletonCriticalCss';

const EXECUTE_PROGRESS_STEP_COUNT = 4;
const EXECUTE_ANALYSIS_STEP_COUNT = 4;
/** Shimmer widths — match execute channel tab labels (Email, SMS, Mobile Push, …). */
const EXECUTE_CHANNEL_TAB_WIDTHS = [44, 36, 88, 72, 28, 72, 36, 40, 36];

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const ExecuteChannelTabsSkeleton = () => (
    <div className="tabs-right-align mt30 pageSub_tab execute-channel-tabs-skeleton">
        <ul className="rs-tabs row justify-content-center execute-channel-tabs-skeleton__list mb0 mini list-unstyled">
            {EXECUTE_CHANNEL_TAB_WIDTHS.map((width, index) => (
                <li
                    key={index}
                    className={`tabTransparent tabDefault execute-channel-tabs-skeleton__item`}
                >
                    <Shimmer className="execute-channel-tabs-skeleton__pill" style={{ width: 70, height: 24 }} />
                </li>
            ))}
        </ul>
    </div>
);

const ExecuteAnalysisProgressSkeleton = () => (
    <div className="mt50 execute-analysis-progress-skeleton">
        <PlanProgressStepsSkeleton stepCount={EXECUTE_ANALYSIS_STEP_COUNT} />
    </div>
);

const ExecutePortletTitle = ({ children }) => <h4 className="execute-portlet-skeleton-title">{children}</h4>;

const ExecutePortletRowsSkeleton = ({ rowCount = 7 }) => (
    <div className="portlet-body execute-skeleton-portlet__body" aria-hidden="true">
        {Array.from({ length: rowCount }, (_, index) => (
            <div key={index} className="skeleton-shimmer execute-skeleton-portlet__row" />
        ))}
    </div>
);

const ExecuteListPortletSkeleton = () => (
    <div className="portlet-container portlet-md mb20 pfooter execute-skeleton-portlet">
        <div className="portlet-header">
            <ExecutePortletTitle>{LIST}</ExecutePortletTitle>
        </div>
        <ExecutePortletRowsSkeleton />
    </div>
);

const ExecuteContentPortletSkeleton = () => (
    <div className="portlet-container portlet-md mb20 pfooter execute-skeleton-portlet">
        <div className="portlet-header">
            <ExecutePortletTitle>{CONTENT}</ExecutePortletTitle>
        </div>
        <ExecutePortletRowsSkeleton />
    </div>
);

const ExecutePredictiveAnalysisSkeleton = () => (
    <div className="execute-predictive-analysis-skeleton portlet-body" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
            <div key={`predictive-bar-${index}`} className="execute-predictive-analysis-skeleton__row">
                <div className="execute-predictive-analysis-skeleton__label-col">
                    <div className="skeleton-shimmer execute-predictive-analysis-skeleton__label" />
                </div>
                <div className="execute-predictive-analysis-skeleton__bar-col">
                    <div className="skeleton-shimmer execute-predictive-analysis-skeleton__bar" />
                </div>
            </div>
        ))}
        <div className="skeleton-shimmer execute-predictive-analysis-skeleton__insights-title" />
        {Array.from({ length: 2 }, (_, index) => (
            <div key={`predictive-insight-${index}`} className="execute-predictive-analysis-skeleton__insight">
                <div className="skeleton-shimmer execute-predictive-analysis-skeleton__insight-line execute-predictive-analysis-skeleton__insight-line--primary" />
                <div className="skeleton-shimmer execute-predictive-analysis-skeleton__insight-line execute-predictive-analysis-skeleton__insight-line--secondary" />
            </div>
        ))}
    </div>
);

const ExecuteApprovalStatusSkeleton = () => (
    <div className="execute-approval-status-skeleton portlet-body" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
            <div key={`approval-row-${index}`} className="execute-approval-status-skeleton__row">
                <div className="execute-approval-status-skeleton__main">
                    <div className="skeleton-shimmer execute-approval-status-skeleton__line execute-approval-status-skeleton__line--sm" />
                    <div className="skeleton-shimmer execute-approval-status-skeleton__line execute-approval-status-skeleton__line--md" />
                    <div className="skeleton-shimmer execute-approval-status-skeleton__line execute-approval-status-skeleton__line--lg" />
                </div>
                <div className="execute-approval-status-skeleton__side">
                    <div className="skeleton-shimmer execute-approval-status-skeleton__line execute-approval-status-skeleton__line--status" />
                </div>
            </div>
        ))}
    </div>
);

const ExecutePredictivePortletSkeleton = () => (
    <div className="portlet-container portlet-md mb20 execute-skeleton-portlet">
        <div className="portlet-header">
            <ExecutePortletTitle>{PRE_COMMUNICATION_ANALYTICS}</ExecutePortletTitle>
        </div>
        <ExecutePredictiveAnalysisSkeleton />
    </div>
);

const ExecuteApprovalPortletSkeleton = () => (
    <div className="portlet-container portlet-md p0 mb20 execute-skeleton-portlet">
        <div className="portlet-header p19 mb0" style={{ height: 'auto' }}>
            <ExecutePortletTitle>{APPROVAL_STATUS}</ExecutePortletTitle>
            <div className="float-end">
                <ul className="rs-tabs row mb0 mini list-unstyled execute-approval-portlet-skeleton__tabs">
                    <li className="tabTransparent tabDefault execute-approval-portlet-skeleton__tab">
                        <Shimmer className="execute-approval-portlet-skeleton__tab-pill" style={{ width: 96, height: 24 }} />
                    </li>
                    <li className="tabTransparent tabDefault execute-approval-portlet-skeleton__tab">
                        <Shimmer className="execute-approval-portlet-skeleton__tab-pill" style={{ width: 40, height: 24 }} />
                    </li>
                </ul>
            </div>
        </div>
        <ExecuteApprovalStatusSkeleton />
    </div>
);

const ExecuteFooterSkeleton = () => (
    <div className="execute-footer-skeleton buttons-holder mt0">
        <Shimmer style={{ width: 88, height: 36, borderRadius: 4 }} />
        <Shimmer className="execute-footer-skeleton__next" style={{ width: 80, height: 36, borderRadius: 4 }} />
    </div>
);

export const ExecuteMainPanelSkeleton = () => (
    <div className="box-design execute-main-panel-skeleton">
        <ExecuteChannelTabsSkeleton />
        <ExecuteAnalysisProgressSkeleton />
    </div>
);

export const ExecuteContentSkeleton = () => (
    <div className="mt26 precommunicationAnalytics execute-content-skeleton">
        <Row className="execute-content-skeleton__row-top">
            <Col sm={6}>
                <ExecuteListPortletSkeleton />
            </Col>
            <Col sm={6}>
                <ExecuteContentPortletSkeleton />
            </Col>
        </Row>
        <Row className="execute-content-skeleton__row-bottom">
            <Col>
                <ExecutePredictivePortletSkeleton />
            </Col>
            <Col>
                <ExecuteApprovalPortletSkeleton />
            </Col>
        </Row>
        <ExecuteFooterSkeleton />
    </div>
);

/** Analyze panel only (channel tabs + 4 portlets). */
export const ExecuteAnalyzeBodySkeletonBlock = () => (
    <div className="rsv-tabs-content">
        <ExecuteMainPanelSkeleton />
        <ExecuteContentSkeleton />
    </div>
);

const EXECUTE_ROI_CONTROL_HEIGHT = 24;

const ExecuteROILabelCol = ({ width = 150 }) => (
    <Col sm={3} className="text-right execute-roi-label-col">
        <Shimmer style={{ width, height: EXECUTE_ROI_CONTROL_HEIGHT, marginLeft: 'auto' }} />
    </Col>
);

const ExecuteROIFieldCol = () => (
    <Col sm={3} className="execute-roi-field-col">
        <Shimmer style={{ width: '100%', height: EXECUTE_ROI_CONTROL_HEIGHT, borderRadius: 4 }} />
    </Col>
);

/** ROI calculation portlet — matches ROIContent.jsx form rows. */
export const ExecuteROICalculationSkeleton = () => (
    <>
        <div className="execute-roi-calculation-skeleton portlet-container pfooter calculateROI">
            <div className="portlet-header">
                <Shimmer style={{ width: 148, height: 20 }} />
            </div>
            <div className="portlet-body">
                <Row className="mt5">
                    <Col sm={{ span: 11, offset: 1 }}>
                        <div className="form-group">
                            <Row className="align-items-center">
                                <ExecuteROILabelCol width={168} />
                                <ExecuteROIFieldCol />
                                <Col sm={3} className="execute-roi-field-col">
                                    <Shimmer
                                        style={{ width: '100%', height: EXECUTE_ROI_CONTROL_HEIGHT, borderRadius: 4 }}
                                    />
                                    <Shimmer style={{ width: 120, height: 15, marginTop: 6 }} />
                                </Col>
                               
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row className="align-items-center">
                                <ExecuteROILabelCol width={175} />
                                <ExecuteROIFieldCol />
                                <ExecuteROIFieldCol />
                            </Row>
                        </div>
                        <div className="form-group">
                            <Row className="align-items-center">
                                <ExecuteROILabelCol width={140} />
                                <ExecuteROIFieldCol />
                                <ExecuteROIFieldCol />
                                <ExecuteROIFieldCol />
                            </Row>
                        </div>
                        <div className="form-group mb0">
                            <Row className="align-items-center">
                                <ExecuteROILabelCol width={110} />
                                <ExecuteROIFieldCol />
                                <ExecuteROIFieldCol />
                                <ExecuteROIFieldCol />
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
        <div className="buttons-holder execute-roi-footer-skeleton d-flex justify-content-end">
            <Shimmer style={{ width: 88, height: 36, borderRadius: 4 }} />
            <Shimmer style={{ width: 72, height: 36, borderRadius: 4 }} />
            <Shimmer style={{ width: 80, height: 36, borderRadius: 4 }} />
        </div>
    </>
);

/** ROI step while campaign analyze list loads (refresh / edit with ?roi). */
export const ExecuteROIPageLoadingBlock = () => (
    <>
        <style>{communicationExecuteSkeletonCriticalCss}</style>
        <div className="communication-execute-skeleton-scope communication-execute-inline-skeleton execute-roi-page-loading">
            <CampaignInfoSkeleton className="rs-columns-block mdc-header d-flex mb21" />
            <ExecuteROICalculationSkeleton />
        </div>
    </>
);

/** Full execute content while API loads — matches route skeleton (steps + campaign + portlets). */
export const ExecutePageLoadingSkeletonBlock = () => (
    <>
        <style>{communicationExecuteSkeletonCriticalCss}</style>
        <div className="communication-execute-skeleton-scope communication-execute-inline-skeleton execute-page-loading-skeleton">
            <PlanProgressStepsSkeleton stepCount={EXECUTE_PROGRESS_STEP_COUNT} />
            <CampaignInfoSkeleton className="rs-columns-block mdc-header d-flex mb21" />
            <ExecuteAnalyzeBodySkeletonBlock />
        </div>
    </>
);

const CommunicationExecuteAnalyzePageShell = () => (
    <>
        <RSPageHeaderSkeleton variant="tabber" className="communication-execute-page-header-skeleton" />
        <BreadcrumbSkeleton tabIndex={0} />
        <div className="pc-tabs-wrapper">
            <div className="page-content pc-communication-plan">
                <Container fluid>
                    <div className="page-content">
                        <Container className="px0 execute-page-body">
                            <PlanProgressStepsSkeleton stepCount={EXECUTE_PROGRESS_STEP_COUNT} />
                            <CampaignInfoSkeleton className="rs-columns-block mdc-header d-flex mb21" />
                            <div className="rsv-tabs-content">
                                <ExecuteMainPanelSkeleton />
                                <ExecuteContentSkeleton />
                            </div>
                        </Container>
                    </div>
                </Container>
            </div>
        </div>
    </>
);

/** ROI step refresh — progress + campaign summary + ROI form (not pre-campaign analyze). */
const CommunicationExecuteRoiPageShell = () => (
    <>
        <RSPageHeaderSkeleton variant="tabber" className="communication-execute-page-header-skeleton" />
        <BreadcrumbSkeleton tabIndex={0} />
        <div className="pc-tabs-wrapper">
            <div className="page-content pc-communication-plan">
                <Container fluid>
                    <div className="page-content">
                        <Container className="px0 execute-page-body execute-roi-flow-skeleton">
                            <PlanProgressStepsSkeleton stepCount={EXECUTE_PROGRESS_STEP_COUNT} />
                            <CampaignInfoSkeleton className="rs-columns-block mdc-header d-flex mb21" />
                            <ExecuteROICalculationSkeleton />
                        </Container>
                    </div>
                </Container>
            </div>
        </div>
    </>
);

const resolveExecuteRoiFlow = (isRoiFlow) =>
    isRoiFlow !== undefined
        ? isRoiFlow
        : isCommunicationExecuteRoiFlow(typeof window !== 'undefined' ? window.location.search : '');

export const CommunicationExecutePageContentSkeleton = ({ wrapScope = true, isRoiFlow }) => {
    const roiFlow = resolveExecuteRoiFlow(isRoiFlow);
    const shell = (
        <>
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{communicationExecuteSkeletonCriticalCss}</style>
            {roiFlow ? <CommunicationExecuteRoiPageShell /> : <CommunicationExecuteAnalyzePageShell />}
        </>
    );

    if (!wrapScope) {
        return shell;
    }

    return (
        <div
            className={`communication-execute-skeleton-scope${roiFlow ? ' communication-execute-skeleton-scope--roi' : ''}`}
        >
            {shell}
        </div>
    );
};

export const CommunicationExecuteSuspenseFallback = () => {
    const { search } = useLocation();
    const isRoiFlow = isCommunicationExecuteRoiFlow(search);

    return (
        <div
            className={`page-content-holder communication-execute-suspense-fallback communication-execute-skeleton-scope${
                isRoiFlow ? ' communication-execute-skeleton-scope--roi' : ''
            }`}
            aria-busy="true"
            aria-label={isRoiFlow ? 'Loading communication ROI' : 'Loading communication execute'}
        >
            <CommunicationExecutePageContentSkeleton wrapScope={false} isRoiFlow={isRoiFlow} />
        </div>
    );
};

export const CommunicationExecuteRouteSkeleton = ({
    withAppShell = false,
    activeNavIndex = -1,
    isRoiFlow,
}) => {
    const roiFlow = resolveExecuteRoiFlow(isRoiFlow);
    const body = <CommunicationExecutePageContentSkeleton wrapScope={false} isRoiFlow={roiFlow} />;

    if (!withAppShell) {
        return (
            <div
                className="page-content-holder communication-execute-skeleton-scope"
                aria-busy="true"
                aria-label="Loading communication execute"
            >
                {body}
            </div>
        );
    }

    return (
        <>
            <style>{pageLayoutSkeletonCriticalCss}</style>
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{communicationExecuteSkeletonCriticalCss}</style>
            <div
                className="page-content-holder communication-execute-skeleton-scope page-layout-skeleton--inline"
                aria-busy="true"
                aria-label="Loading communication execute"
            >
                <MainNavBar activeNavIndex={activeNavIndex} inline />
                <div>{body}</div>
            </div>
        </>
    );
};

CommunicationExecutePageContentSkeleton.propTypes = {
    wrapScope: PropTypes.bool,
    isRoiFlow: PropTypes.bool,
};

CommunicationExecuteRouteSkeleton.propTypes = {
    withAppShell: PropTypes.bool,
    activeNavIndex: PropTypes.number,
    isRoiFlow: PropTypes.bool,
};

export default memo(CommunicationExecutePageContentSkeleton);
