import { memo } from 'react';
import { Col, Row } from 'react-bootstrap';

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const FormRowSkeleton = ({ showRefresh = false, rowClassName = '' }) => (
    <div className={`form-group pt10 add-audience-skeleton-form__row ${rowClassName}`.trim()}>
        <Row className="align-items-center">
            <Col sm={{ span: 3, offset: 1 }} className="text-right">
                <Shimmer className="add-audience-skeleton-form__label" style={{ width: 120, height: 24, marginLeft: 'auto' }} />
            </Col>
            <Col sm={5}>
                <Row>
                    <Col sm={10}>
                        <Shimmer className="add-audience-skeleton-form__field" style={{ height: 24, borderRadius: 5 }} /></Col>

                    {showRefresh ? (
                        <Col md={1} className="pl0 d-flex align-items-center justify-content-center">
                            <Shimmer
                                className="add-audience-skeleton-form__refresh"
                                style={{ width: 24, height: 24, borderRadius: '50%' }}
                            />
                        </Col>
                    ) : null}  </Row>
            </Col>

        </Row>
    </div>
);

/** Matches AddAudience › box-design form (Add audience by + content area + actions). */
const AddAudienceFormSkeleton = ({ compact = false }) => (
    <>
        <div className="box-design p21 add-audience-skeleton-form" aria-hidden="true">
            <FormRowSkeleton showRefresh rowClassName="add-audience-skeleton-form__row--first" />
            {!compact ? <FormRowSkeleton rowClassName="add-audience-skeleton-form__row--second" /> : null}
        </div>
        {!compact ? (
            <div className="add-audience-skeleton-footer buttons-holder d-flex justify-content-end gap-3">
                <Shimmer className="add-audience-skeleton-footer__cancel" style={{ width: 72, height: 36, borderRadius: 4 }} />
                <Shimmer className="add-audience-skeleton-footer__upload" style={{ width: 88, height: 36, borderRadius: 4 }} />
            </div>
        ) : null}
    </>
);

export default memo(AddAudienceFormSkeleton);
