import { DOWNLOAD_CSV_CONTENT, FORM_INITIAL_STATE } from './constants';
import { ENTER_VALID_OTP } from 'Constants/GlobalConstant/ValidationMessage';
import { EMAIL_MOBILE } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';

import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSOTPForm from 'Components/RSOTPForm';

const DownloadModal = ({ show, setDownloadModal }) => {
    // const [show, setShow] = useState(true);
    const { control, handleSubmit: formSubmit, setFocus } = useForm(FORM_INITIAL_STATE);
    const [otp, setOtp] = useState('');
    const [data, setData] = useState('');
    const [otpValid, setOtpValid] = useState(false);
    const [otpShow, setOtpShow] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    const handleSubmit = () => {};
    const footerData = (
        <div>
            <RSSecondaryButton onClick={() => setDownloadModal(false)}>Cancel</RSSecondaryButton>
            <RSPrimaryButton onClick={handleSubmit} className={!otpValid ? 'click-off' : ''}>
                Proceed
            </RSPrimaryButton>
        </div>
    );
    return (
        <RSModal
            show={show}
            size="lg"
            header="Request to download CSV"
            footer={footerData}
            handleClose={() => setDownloadModal(false)}
            isBorder
            settings={{
                style: {
                    background: 'white',
                },
            }}
            body={
                <div>
                    <span className="mb30">{DOWNLOAD_CSV_CONTENT}</span>

                    <form onSubmit={formSubmit(handleSubmit)} className="m-2">
                        <div className="form-group mt30">
                            <Row>
                                <Col sm={3}>
                                    <label>OTP has sent to</label>
                                </Col>
                                <Col sm={5}>
                                    <RSKendoDropdown
                                        data={FORM_INITIAL_STATE}
                                        dataItemKey={'id'}
                                        textField={'field'}
                                        name="otp_send_to"
                                        required
                                        label={EMAIL_MOBILE}
                                        control={control}
                                        handleChange={(e) => {
                                            setData(e.value.data);
                                            setSuccessModal(true);
                                        }}
                                    />
                                </Col>
                                {data && (
                                    <Col sm={4}>
                                        <span>{data}</span>
                                    </Col>
                                )}
                            </Row>
                            {successModal && (
                                <Row className="">
                                    <Col sm={{ colspan: 5, offset: 3 }}>
                                        <div className="alert alert-success p5 mt20 mb20">OTP sent successfully!</div>
                                    </Col>
                                </Row>
                            )}
                            {data && (
                                <>
                                    <Row>
                                        <Col sm={{ colspan: 8, offset: 3 }} className="mr8">
                                            <RSOTPForm
                                                control={control}
                                                setFocus={setFocus}
                                                otpShow={(value) => setOtpShow(value)}
                                                otpSuccess={(value) => setOtpValid(value)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={{ colspan: 5, offset: 3 }} className="pl0">
                                            {otpShow && (
                                                <div className="mr-10">
                                                    <div
                                                        className={`alert m15 ${
                                                            otpValid ? 'alert-success' : 'alert-danger'
                                                        }`}
                                                    >
                                                        <i
                                                            className={`position-relative mr10 p5 white ${
                                                                otpValid
                                                                    ? circle_tick_medium
                                                                    : alert_medium
                                                            }  ${
                                                                otpValid ? 'bg-primary-green' : 'bg-primary-red'
                                                            } icon-md `}
                                                        ></i>
                                                        <span>{otpValid ? '' : ENTER_VALID_OTP}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            }
        />
    );
};

export default DownloadModal;
