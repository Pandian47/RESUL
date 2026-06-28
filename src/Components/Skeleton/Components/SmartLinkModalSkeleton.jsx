import { Col, Row } from 'react-bootstrap';

import { smartLinkModalSkeletonCriticalCss } from './smartLinkModalSkeletonCriticalCss';

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer ${className}`.trim()} style={style} aria-hidden="true" />
);

/** Matches Create → SmartLinkModal tab bar, friendly name, Web accordion, and Generate button. */
const SmartLinkModalSkeleton = () => (
    <>
        <style>{smartLinkModalSkeletonCriticalCss}</style>
        <div className="smartlink-modal-skeleton-scope" aria-busy="true" aria-label="Loading smart link">
            <div className="smartlink-modal-skeleton__tab-bar">
                <div className="smartlink-modal-skeleton__tab smartlink-modal-skeleton__tab--active">
                    <Shimmer style={{ width: 72, height: 21 }} />
                </div>
                <div className="smartlink-modal-skeleton__tab-add">
                    <Shimmer style={{ width: 16, height: 16, borderRadius: 2 }} />
                </div>
            </div>

            <div className="smartlink-modal-skeleton__friendly-name">
                <Shimmer />
            </div>

            <Row className="smartlink-modal-skeleton__accordion-row mb10">
                <Col className="px30 position-relative">
                    <div className="smartlink-modal-skeleton__accordion">
                        <div className="smartlink-modal-skeleton__accordion-header">
                            <Shimmer style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0 }} />
                            <Shimmer style={{ width: 36, height: 14, marginLeft: 8 }} />
                        </div>
                        <div className="smartlink-modal-skeleton__accordion-body">
                            <Shimmer className="smartlink-modal-skeleton__url-field" />
                            <div className="smartlink-modal-skeleton__accordion-footer">
                                <Shimmer style={{ width: 22, height: 22, borderRadius: 4 }} />
                                <div className="smartlink-modal-skeleton__utm">
                                    <Shimmer style={{ width: 16, height: 16, borderRadius: 2, flexShrink: 0 }} />
                                    <Shimmer style={{ width: 140, height: 12, marginLeft: 8 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="justify-content-end mx0 mt21" style={{paddingRight:'30px'}}>
                <Shimmer className="smartlink-modal-skeleton__generate-btn" />
            </Row>
        </div>
    </>
);

export default SmartLinkModalSkeleton;
