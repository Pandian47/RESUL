import { arrow_left_right_mini, circle_minus_fill_large } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';
import move_Icon from 'Assets/Images/icon-move.png';

const HowerIcon = ({ data, isContentNavigation }) => {
    const { removeContent, dragChange, ind } = data;

    const [warningMsg, setWarningMsg] = useState(false);

    const handleDelete = () => {
        removeContent(ind);
        handleClose();
    };

    const handleClose = (status) => {
        if (!status) {
            setWarningMsg(status);
        }
    };

    return (
        <div className="dragDelete_block">
            <div className="left-10 position-absolute top-10 test pop">
                <div className="position-relative">
                    <RSTooltip text="Move">
                        <img
                            className={`color-primary-blue icon-md  `}
                            style={{ cursor: 'all-scroll' }}
                            src={move_Icon}
                            onDragStart={(event) => {
                                dragChange(event, ind);
                            }}
                            draggable
                        />
                    </RSTooltip>
                </div>
            </div>

            <div className="d-flex right-6 position-absolute top-10 z-1">
                <div className="position-relative">
                    <RSTooltip text="Delete">
                        <i
                            className={`icon-rs-circle-minus-fill-mini color-primary-red icon-md pop ${
                                isContentNavigation ? 'click-off' : ''
                            }`}
                            onClick={() => {
                                setWarningMsg(true);
                            }}
                        ></i>
                    </RSTooltip>
                </div>
            </div>
            {/* <div className="icons-email-footer justify-content-between">
                <RSTooltip text="Move">
                    <i
                        onDragStart={(event) => {
                            dragChange(event, ind);
                        }}
                        draggable
                        className={arrow_left_right_mini}
                    ></i>
                </RSTooltip>
                <RSTooltip text="Delete">
                    <i
                        className={circle_minus_fill_large}
                        onClick={() => {
                            setWarningMsg(true);
                        }}
                    ></i>
                </RSTooltip>
            </div> */}
            <RSModal
                show={warningMsg}
                size="md"
                header={false}
                isCloseButton={false}
                handleClose={handleClose}
                body={
                    <div>
                        <Row className="form-group text-center">
                            <label>Are you sure, you want to delete?</label>
                        </Row>
                        <div className="buttons-holder mt0 mb0">
                            <Row>
                                <Col>
                                    <RSSecondaryButton onClick={() => setWarningMsg(false)}>Cancel</RSSecondaryButton>
                                    <RSPrimaryButton onClick={handleDelete}>Delete</RSPrimaryButton>
                                </Col>
                            </Row>
                        </div>
                    </div>
                }
            />
        </div>
    );
};

export default memo(HowerIcon);
