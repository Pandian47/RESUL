import { CALCULATE_LATER, CALCULATE_NOW } from 'Constants/GlobalConstant/Placeholders';
import { circle_time_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import RSModal from 'Components/RSModal';
import { Row } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
const SegmentationRecalculate = ({ show, handleClose, recalculateLater, getBQAudienceCount, partnerData = false }) => {
    return (
        <Fragment>
            <div>
                <RSModal
                    header={'Calculate potential audience'}
                    show={show}
                    size="lg"
                    // isBorder={false}
                    body={
                        <div>
                            <Row className="text-center">
                                <i className={`${circle_time_large} icon-xxl`}></i>
                                <p className="font-smd mt10">
                                    Your segment has not been calculated yet.
                                </p>
                                <p className="font-smd" >                                    Calculate now or calculate later and close?
                                </p>
                            </Row>
                        </div>
                    }
                    footer={
                        <>
                            <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                            {!partnerData && (
                                <RSSecondaryButton
                                    onClick={() => recalculateLater(true)}
                                    className="color-primary-blue"
                                >
                                    {CALCULATE_LATER}
                                </RSSecondaryButton>
                            )}
                            <RSPrimaryButton
                                onClick={() => {
                                    handleClose(false);
                                    getBQAudienceCount(true);
                                }}
                            >


                                {CALCULATE_NOW}
                            </RSPrimaryButton>
                        </>
                    }
                    handleClose={() => handleClose(false)}
                />
            </div>
        </Fragment>
    );
};

export default SegmentationRecalculate;
