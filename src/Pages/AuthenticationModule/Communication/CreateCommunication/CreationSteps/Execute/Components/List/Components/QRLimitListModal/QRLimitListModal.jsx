import { numberWithCommas } from 'Utils/modules/formatters';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { CANCEL, DEVICE, EXPECTED_AUDIENCE, GATE_MESSAGE, LIMIT_SCAN_BY, OFFER_IS_COMPLETED, SCAN_CONTROL, SCAN_COUNT, SELECT_DURATION, SUBMIT, UNIQUE, USER } from 'Constants/GlobalConstant/Placeholders';
import { form_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSModal from 'Components/RSModal';
import RSTextarea from 'Components/FormFields/RSTextarea';


import { handleClickOff } from '../../constant';
import { useSelector } from 'react-redux';

const QRLimitListModal = ({ show, handleClose, setShowScanLimit, tab }) => {
    const { control, watch, resetField, setValue } = useFormContext();
    const [expectedAudience, limitScanBy, scanCount] = watch(['expectedAudience', 'limitScanBy', 'scanCount']);
    const [gateToggle, setGateToggle] = useState(false);
    const [endDate, setEndDate] = useState('');
    const { channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);

    return (
        <div>
            <RSModal
                show={show}
                handleClose={handleClose}
                header={SCAN_CONTROL}
                headerText={<span>{EXPECTED_AUDIENCE} : {numberWithCommas(expectedAudience)}</span>}
                size="md"
                body={
                    <Row>
                        <Col sm={4}>
                            <label className='fs19'>{LIMIT_SCAN_BY} </label>
                        </Col>
                        <Col sm={8}>
                        <div className='form-group'>
                            <Row>
                                <Col sm={4} className="position-relative top-1">
                                    <RSRadioButton
                                        name={'limitScanBy'}
                                        control={control}
                                        labelName={DEVICE}
                                    />
                                </Col>
                                <Col className="position-relative top-1 pl30">
                                    <RSRadioButton
                                        name={'limitScanBy'}
                                        control={control}
                                        labelName={USER}
                                    />
                                </Col>
                            </Row>
                            </div>
                            </Col>
                            {limitScanBy !== '' && (
                                <div className='form-group mb0'>
                                    <Row>
                                        <Col sm={7}>
                                            <RSInput
                                                name={'scanCount'}
                                                control={control}
                                                placeholder={SCAN_COUNT}
                                                onKeyDown={onlyNumbers}
                                                required
                                                handleOnBlur={(e) =>
                                                    setValue('scanCount', numberWithCommas(e.target.value))
                                                }
                                            />
                                            <div className='align-items-center d-flex justify-content-between'>
                                                    <RSCheckbox
                                                        name={'uniqueCheck'}
                                                        control={control}
                                                        labelName={UNIQUE}
                                                    />
                                                    <span>
                                                    <span>{GATE_MESSAGE}</span>{' '}
                                                    <i
                                                        className={`${form_edit_medium} icon-md color-primary-blue position-relative top5`}
                                                        onClick={() => setGateToggle(!gateToggle)}
                                                    ></i>
                                                    </span>
                                               
                                            </div>
                                        </Col>
                                        <Col sm={5}>
                                            <RSKendoDropdown
                                                control={control}
                                                name={'scanTime'}
                                                data={['All time', 'Day', 'Week', 'Month']}
                                                label={SELECT_DURATION}
                                            />
                                        </Col>
                                    </Row>
                                    {gateToggle && (
                                        <>
                                            <RSTextarea
                                                name={'gateMessage'}
                                                control={control}
                                                placeholder={OFFER_IS_COMPLETED}
                                                customWebpushClassname="mt41"
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        
                    </Row>
                }
                footer={
                    <span className={`m0 ${handleClickOff(channelDetails?.[tab])}`}>
                        <RSSecondaryButton onClick={() => handleClose()}>{CANCEL}</RSSecondaryButton>
                        <RSPrimaryButton
                            className={scanCount !== '' ? '' : 'click-off'}
                            onClick={() => {
                                setShowScanLimit(true);
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

export default QRLimitListModal;
