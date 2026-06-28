import { Col, Row } from 'react-bootstrap';

const SkelBar = ({ width, height = 14, className = '' }) => (
    <span
        className={`skeleton-shimmer planner-event-info-skeleton__bar ${className}`.trim()}
        style={{ width, height, display: 'block' }}
        aria-hidden="true"
    />
);

/** Small square for channel icon placeholder (not circle, not carousel chrome). */
const SkelChannelIcon = () => (
    <span
        className="skeleton-shimmer planner-event-info-skeleton__channel-icon"
        style={{
            display: 'inline-block',
            width: 28,
            height: 28,
            minWidth: 28,
            borderRadius: 6,
        }}
        aria-hidden="true"
    />
);

/** Inner card only — no carousel arrows or pagination dots. */
const PlannerEventInfoSkeleton = () => (
    <div className="planner-event-info-skeleton" aria-hidden="true">
        <div className="planner-event-info-skeleton__card border p5 border-r10">
            <div className="border-bottom mb10 pb10 px5">
                <SkelBar width={150} height={14} />
                <SkelBar width="72%" height={22} className="mt5" />
            </div>

            <div className="border-bottom pb10">
                <Row className="px5">
                    <Col sm={6}>
                        <SkelBar width={62} height={12} />
                        <SkelBar width={96} height={16} className="mt5" />
                    </Col>
                    <Col sm={6}>
                        <SkelBar width={52} height={12} />
                        <SkelBar width={96} height={16} className="mt5" />
                    </Col>
                </Row>
            </div>

            <div className="bg-tertiary-blue py10">
                <Row className="p5 align-items-center">
                    <Col sm={6}>
                        <SkelBar width={128} height={16} />
                    </Col>
                    <Col sm={6} className="text-end">
                        <SkelBar width={72} height={16} className="ms-auto" />
                    </Col>
                </Row>
            </div>

            <div className="p5 py10">
                <Row className="align-items-center">
                    <Col sm={6}>
                        <SkelBar width={96} height={16} />
                    </Col>
                    <Col sm={6} className="text-end">
                        <SkelBar width={36} height={16} className="ms-auto" />
                    </Col>
                </Row>
            </div>

            <div className="bg-tertiary-blue py10">
                <Row className="p5 align-items-center">
                    <Col sm={6}>
                        <SkelBar width={64} height={16} />
                    </Col>
                    <Col sm={6}>
                        <SkelChannelIcon />
                    </Col>
                </Row>
            </div>
        </div>
    </div>
);

export default PlannerEventInfoSkeleton;
