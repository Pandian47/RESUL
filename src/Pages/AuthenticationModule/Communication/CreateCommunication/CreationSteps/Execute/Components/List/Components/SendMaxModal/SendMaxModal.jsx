import { DIDNT_CLICK, DIDNT_OPEN, ENABLE, MAX_2_TRIGGERS, SEND_MAX, SUBMIT, UNDELIVERED } from 'Constants/GlobalConstant/Placeholders';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { RSPrimaryButton } from 'Components/Buttons';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

import { handleClickOff } from '../../constant';
import { useSelector } from 'react-redux';

const SendMaxModal = ({ show, handleClose, tab }) => {
    const { control, watch } = useFormContext();
    const sendMaxList = watch('sendMaxList');
    const { channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    return (
        <div>
            <RSModal
                show={show}
                handleClose={handleClose}
                size="md"
                header={
                    <div className='align-items-center d-flex'>
                        <span>{SEND_MAX}</span>
                        <small className='ml10'>{MAX_2_TRIGGERS}</small>
                    </div>
                }
                body={
                    <>
                        <Row className='align-items-end'>
                            <Col sm={2} className='pr0'>
                                <label className="fs19">{ENABLE}</label>
                            </Col>
                            <Col sm={10}>
                                <RSSwitch control={control} name={'sendMaxList'} />
                            </Col>
                        </Row>
                        {sendMaxList && (
                            <>
                                <div className="d-flex mt30">
                                    <RSCheckbox
                                        control={control}
                                        name={'undelivered'}
                                        labelName={UNDELIVERED}
                                    />
                                     <RSCheckbox
                                        control={control}
                                        name={'didNotOpen'}
                                        labelName={DIDNT_OPEN}
                                    />
                                     <RSCheckbox
                                        control={control}
                                        name={'didNotClick'}
                                        labelName={DIDNT_CLICK}
                                    />
                                </div>
                               
                            </>
                        )}
                    </>
                }
                footer={
                    <span className={`m0 ${handleClickOff(channelDetails?.[tab])}`}>
                        <RSPrimaryButton
                            onClick={(e) => {
                                                                handleClose();
                            }}
                        >
                            {SUBMIT}
                        </RSPrimaryButton>
                    </span>
                }
                bodyClassName={handleClickOff(channelDetails?.[tab])}
            />
        </div>
    );
};

export default SendMaxModal;
