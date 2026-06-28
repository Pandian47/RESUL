import { alert_medium, circle_tick_medium, close_large } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSOTPForm from 'Components/RSOTPForm';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const LinksCsvModal = ({ show, handleClose, confirm }) => {
    const methods = useForm();
    const { handleSubmit } = methods;
    const [otpShow, setOtpShow] = useState(false);
    const [otpValid, setOtpValid] = useState(false);

    return (
        <RSModal
            size={'md'}
            show={show}
            handleClose={handleClose}
            header={'Request to download CSV'}
            body={
                <FormProvider {...methods}>
                    <div className="mx20">
                        <p className="mb20">
                        RESUL sent on OTP to the key contact person Email ID and Mobile number. Kindly enter the OTP
                            here to process your request
                        </p>

                        <div className="d-flex align-items-center mb15">
                            <Col sm={4}>Email Id</Col>
                            <Col className="ellispis">lil****in@interaktco.com</Col>
                        </div>
                        <div className="d-flex align-items-center mb15">
                            <Col sm={4}>Mobile</Col>
                            <Col>1-212-***-*700</Col>
                        </div>
                        <div className="d-flex ">
                            <Col sm={4}>Enter the OTP </Col>
                            <Col sm={{ colspan: 2 }} className="otp-lable">
                                <RSOTPForm
                                    otpShow={(value) => setOtpShow(value)}
                                    otpSuccess={(value) => setOtpValid(value)}
                                    validateOTP={() => {}}
                                    isOTPValid={otpValid}
                                />
                            </Col>
                        </div>
                        <Col sm={{ colspan: 8, offset: 3 }} className="pl0">
                            {/* {otp !== '' && <i className={`${close_large} color-primary-red`}></i>} */}
                            {otpShow && (
                                <div className="">
                                    <div
                                        className={`alert mt15 mb15 ml35  ${
                                            otpValid ? 'alert-success' : 'alert-danger'
                                        }`}
                                    >
                                        <i
                                            className={`position-relative mr10 p5 white ${
                                                otpValid ? circle_tick_medium : alert_medium
                                            }  ${otpValid ? 'bg-primary-green' : 'bg-primary-red'} icon-md `}
                                        ></i>
                                        <span>{otpValid ? 'Valid OTP' : 'Invalid OTP'}</span>
                                    </div>
                                </div>
                            )}
                        </Col>
                    </div>
                </FormProvider>
            }
            footer={
                <div className="mx24">
                    <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton onClick={handleSubmit(confirm)}>Save</RSPrimaryButton>
                </div>
            }
        />
    );
};

export default LinksCsvModal;
