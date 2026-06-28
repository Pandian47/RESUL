import { Col, Row } from 'react-bootstrap';
import { CommonSkeleton } from './SkeletonOverall';

const LabelCol = ({ width }) => (
    <Col
        sm={{ span: 3, offset: 1 }}
        className="text-right d-flex justify-content-end align-items-center"
    >
        <CommonSkeleton width={120} height={24} box stopAnimation />
    </Col>
);

const DropdownFieldSkeleton = ({ labelWidth = 56, stopAnimation }) => (
    <>
        <CommonSkeleton width="100%" height={24} box stopAnimation={stopAnimation} />

    </>
);

const CsvFileCardSkeleton = ({ stopAnimation = false }) => (
    <Col sm={4}>
        <div className="rsfb-valid rs-file-box" aria-hidden="true">
            <div className="rsfb-file-info">
                <div className="align-items-center d-flex justify-content-between">
                    <div className="flex-grow-1 min-w-0 pe-2">
                        <CommonSkeleton width="100%" height={17} box stopAnimation />
                    </div>
                    <div className="rsfb-status-icon position-static flex-shrink-0">
                        <div className="d-flex align-items-center">
                            <CommonSkeleton width={24} height={24} circle stopAnimation />
                            <CommonSkeleton
                                width={24}
                                height={24}
                                circle
                                stopAnimation
                                mainClass="ml10"
                            />
                        </div>
                    </div>
                </div>
                <CommonSkeleton width={50} height={12} box stopAnimation mainClass="mt-5" />
            </div>
            <div className=" rsfb-file-status rsfb-skeleton py1">
                <div className="d-flex align-items-center justify-content-between w-100">
                    <CommonSkeleton width={110} height={14} box stopAnimation mainClass="pl10" />
                    <CommonSkeleton width={20} height={20} circle stopAnimation mainClass="mr10 flex-shrink-0" />
                </div>
            </div>
        </div>
    </Col>
);
const AddFileCardSkeleton = ({ stopAnimation }) => (
    <div
        className="rsfb-valid rs-file-box create-new-skeleton px10 pb2 d-flex flex-column align-items-center justify-content-center"
        aria-hidden="true"
    >
        <CommonSkeleton width={28} height={24} circle stopAnimation={stopAnimation} />
        <CommonSkeleton width={64} height={14} box stopAnimation={stopAnimation} mainClass="mt8" />
    </div>
);

const AddAudienceSkeleton = ({ isError = false, className = '' }) => {
    const stopAnimation = isError;

    return (
        <>
            <div className={`box-design p21 pt10 ${className}`.trim()} aria-hidden="true">
                {/* Add audience by */}
                <div className="form-group">
                    <Row className="align-items-start">
                        <LabelCol width={118} />
                        <Col sm={4}>
                            <DropdownFieldSkeleton labelWidth={52} stopAnimation={stopAnimation} />
                        </Col>
                        <Col md={1} className="d-flex align-items-end ps-0" style={{ paddingBottom: 6 }}>
                            <CommonSkeleton width={24} height={24} circle stopAnimation={stopAnimation} />
                        </Col>
                    </Row>
                </div>

                {/* List type + refresh */}
                <div className="form-group">
                    <Row className="align-items-start">
                        <LabelCol width={72} />
                        <Col sm={4}>
                            <DropdownFieldSkeleton labelWidth={68} stopAnimation={stopAnimation} />
                        </Col>
                        <Col md={1} className="d-flex align-items-end ps-0" style={{ paddingBottom: 6 }}>
                            <CommonSkeleton width={24} height={24} circle stopAnimation={stopAnimation} />
                        </Col>
                    </Row>
                </div>

                {/* Attribute mapping — two dropdowns */}
                <div className="form-group">
                    <Row className="align-items-start">
                        <LabelCol width={132} />
                        <Col sm={4}>
                            <DropdownFieldSkeleton labelWidth={48} stopAnimation={stopAnimation} />
                        </Col>
                        <Col sm={4}>
                            <DropdownFieldSkeleton labelWidth={88} stopAnimation={stopAnimation} />
                        </Col>
                    </Row>
                </div>

                {/* Import description */}
                <div className="form-group">
                    <Row className="align-items-start">
                        <LabelCol width={128} />
                        <Col sm={4}>
                            <CommonSkeleton width="100%" height={24} box stopAnimation={stopAnimation} />
                        </Col>
                    </Row>
                </div>

                {/* Choose your file(s) */}
                <div className="form-group">
                    <Row className="align-items-start">
                        <LabelCol width={124} />
                        <Col sm={5} className="widthCustomizeFileUpload">
                            <div className="d-flex align-items-start gap-3">
                                <div className="flex-grow-1 min-w-0">
                                    <CommonSkeleton width="100%" height={30} box stopAnimation={stopAnimation} />
                                    <div className="d-flex align-items-center mt8 gap-2 flex-wrap">
                                        <CommonSkeleton width={240} height={15} box stopAnimation={stopAnimation} />
                                        <CommonSkeleton width={15} height={15} circle stopAnimation={stopAnimation} />
                                    </div>
                                </div>
                                <CommonSkeleton
                                    width={92}
                                    height={30}
                                    box
                                    stopAnimation={stopAnimation}
                                    mainClass="flex-shrink-0"
                                />
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Uploaded file + Add file cards */}
                <div className="form-group mb0 d-flex align-items-center gap-5">
                    <CsvFileCardSkeleton stopAnimation={stopAnimation} />
                    <AddFileCardSkeleton stopAnimation={stopAnimation} />

                  
                </div>
            </div>

            {/* Import preferences */}
            <Row>
                <Col sm={12}>
                    <div className="d-flex align-items-center my21 ">
                        <CommonSkeleton width={220} height={24} box stopAnimation={stopAnimation} />
                        <CommonSkeleton width={24} height={24} circle stopAnimation={stopAnimation} mainClass="ml10" />
                        <CommonSkeleton width={24} height={24} circle stopAnimation={stopAnimation} mainClass="ml10" />
                    </div>
                    <div className="d-flex align-items-start mb10">
                        <CommonSkeleton width={24} height={24} circle stopAnimation={stopAnimation} />
                        <CommonSkeleton width={400} height={24} box stopAnimation={stopAnimation} mainClass="ml10" />
                    </div>
                    <div className="d-flex align-items-start">
                        <CommonSkeleton width={24} height={24} circle stopAnimation={stopAnimation} />
                        <CommonSkeleton width={400} height={24} box stopAnimation={stopAnimation} mainClass="ml10" />
                    </div>
                </Col>
            </Row>

            {/* Cancel + Upload */}
            <div className="buttons-holder d-flex justify-content-end gap-3">
                <CommonSkeleton width={72} height={36} box stopAnimation={stopAnimation} />
                <CommonSkeleton width={88} height={36} box stopAnimation={stopAnimation} />
            </div>
        </>
    );
};

const INSIGHT_TAB_SKELETON_WIDTHS = [132, 72, 88, 56];

export const AudienceInsightsSkeleton = ({ stopAnimation = false }) => (
    <div className="box-design my25 audience-insights-skeleton" aria-busy="true" aria-label="Loading insights">
        <div className="tabs-right-align pageSub_tab">
            <h4 className="m0">Insights</h4>
            <div className="audience-insights-skeleton__tabs d-flex justify-content-end gap-4">
                {INSIGHT_TAB_SKELETON_WIDTHS.map((width, index) => (
                    <CommonSkeleton
                        key={`insight-tab-${index}`}
                        width={width}
                        height={16}
                        box
                        stopAnimation={stopAnimation}
                    />
                ))}
            </div>
        </div>
        <div className="sampleListDemographicsCharts d-flex flex-wrap mt10">
            <div className="box-design no-box-shadow sampleListDemographicsCharts-item audience-insights-skeleton__chart">
                <CommonSkeleton width={36} height={20} box stopAnimation={stopAnimation} mainClass="mb20" />
                <div className="d-flex justify-content-center">
                    <CommonSkeleton width={200} height={200} circle stopAnimation={stopAnimation} />
                </div>
                <div className="audience-insights-skeleton__legend d-flex flex-wrap justify-content-center gap-4 mt20">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`insight-legend-${index}`} className="d-flex align-items-center gap-2">
                            <CommonSkeleton width={12} height={12} box stopAnimation={stopAnimation} />
                            <CommonSkeleton width={48} height={12} box stopAnimation={stopAnimation} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default AddAudienceSkeleton;
