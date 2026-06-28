import { ENTER_LIST_NAME, REQUEST_APPROVAL, SEND_APPROVAL_REQUEST } from 'Constants/GlobalConstant/Placeholders';
import { memo } from 'react';
import { Col, Row } from 'react-bootstrap';

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

/** Matches DynamicListCreation — real labels + grid (CreateDynamicListCSS / _dynamicListCreate.scss). */
const DynamicListCreationFormSkeleton = () => (
    <div className="CreateDynamicListCSS dl-skeleton-form d-grid" aria-hidden="true">
        <Row className="mt30 mb15 align-items-center">
            <Col sm={2}>
                <label className="control-label-left">{ENTER_LIST_NAME}</label>
            </Col>
            <Col sm={7} className="pl30 pr0">
                <Shimmer className="dl-skeleton-form__field" />
            </Col>
        </Row>

        <div className="createDynamicListBox">
            <div className="position-relative">
                <h4 className="dl-skeleton-rule-group__title">Rule Group</h4>
                <Row className="mb30 dynamiclistError align-items-center">
                    <Col sm={2} className="dl-skeleton-col-label">
                        Match type
                    </Col>
                    <Col sm={2} className="mr76">
                        <div className="d-flex align-items-end h32">
                            <Shimmer className="dl-skeleton-radio-pill" />
                            <Shimmer className="dl-skeleton-radio-pill ml45" />
                        </div>
                    </Col>
                </Row>
                <Row className="align-items-center mb30">
                    <Col sm={2} className="dl-skeleton-col-label">
                        Trigger source
                    </Col>
                    <Col sm={9}>
                        <Shimmer className="dl-skeleton-form__field" />
                    </Col>
                </Row>
                <div className="rightOutSidePlusIcon position-absolute dl-skeleton-plus-wrap">
                    <Shimmer style={{ width: 28, height: 28, borderRadius: '50%' }} />
                </div>
            </div>
        </div>

        <div className="dl-skeleton-approval form-group audienceRFA rfa mb0">
            <Row>
                <Col sm={{ offset: 3, span: 6 }}>
                    <div className="d-flex align-items-center dl-skeleton-approval__checkbox-row">
                        <Shimmer style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }} />
                        <span className="dl-skeleton-approval__checkbox-label">{REQUEST_APPROVAL}</span>
                        <Shimmer style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0 }} />
                    </div>
                </Col>
            </Row>
            <Row className="requestApprovalBlock align-items-center dl-skeleton-approval__send-row">
                <Col sm={{ offset: 0, span: 3 }}>
                    <label className="control-label-left">{SEND_APPROVAL_REQUEST}</label>
                </Col>
                <Col sm={6}>
                    <Shimmer className="dl-skeleton-form__field" />
                </Col>
                <Col sm={1} className="pl0">
                    <Shimmer style={{ width: 28, height: 28, borderRadius: '50%' }} />
                </Col>
            </Row>
        </div>

        <div className="dl-skeleton-footer buttons-holder d-flex justify-content-end align-items-center gap-3">
            <Shimmer className="dl-skeleton-footer__cancel" />
            <Shimmer className="dl-skeleton-footer__primary" />
        </div>
    </div>
);

export default memo(DynamicListCreationFormSkeleton);
