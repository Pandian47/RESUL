import { FORM_INITIAL_STATE, FREQUENCY_TAB_CONFIG } from './Constants';
import { EMAIL_MESSAGE_RULES, EMAIL_RULES } from 'Constants/GlobalConstant/Rules';
import { ENTER_EMAIL_ID, ENTER_EMAIL_MESSAGE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSModal from 'Components/RSModal';
import RSTabbar from 'Components/RSTabber';
const SendMailModal = ({ show, handleClose }) => {
    const methods = useForm(FORM_INITIAL_STATE);

    const { control, handleSubmit, watch, resetField } = methods;

    const [scheduleStatus] = watch(['schedule']);

    const formSubmitHandler = (formState) => {
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit((data) => formSubmitHandler(data))}>
                <RSModal
                    show={show === 'Email'}
                    handleClose={handleClose}
                    header="Email"
                    footer={
                        <Fragment>
                            <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                            <RSPrimaryButton type="submit" onClick={handleSubmit((data) => formSubmitHandler(data))}>
                                Send
                            </RSPrimaryButton>
                        </Fragment>
                    }
                    body={
                        <Row>
                            <Col sm="3" className="mt20">
                                <label>To</label>
                            </Col>
                            <Col sm="9" className="mt20">
                                <RSInput
                                    name={'mailTo'}
                                    placeholder={ENTER_EMAIL_ID}
                                    control={control}
                                    required
                                    rules={EMAIL_RULES}
                                    autoComplete={'off'}
                                />
                            </Col>
                            <Col sm="3" className="mt20">
                                <label>Message</label>
                            </Col>
                            <Col sm="9" className="mt20">
                                <RSTextarea
                                    name="message"
                                    control={control}
                                    required
                                    placeholder={ENTER_EMAIL_MESSAGE}
                                    rules={EMAIL_MESSAGE_RULES}
                                />{' '}
                            </Col>
                            <Col sm="3" className="mt20">
                                <label>Schedule download</label>
                            </Col>
                            <Col sm="9" className="mt20">
                                <RSSwitch name="schedule" control={control} />{' '}
                            </Col>
                            {scheduleStatus && (
                                <Fragment>
                                    <Col sm="3" className="mt20">
                                        <label>Frequency</label>
                                    </Col>
                                    <Col sm="9" className="mt20">
                                        <RSTabbar
                                            dynamicTab={`rs-content-tabs-2 rct-ra`}
                                            activeClass={`active`}
                                            tabData={FREQUENCY_TAB_CONFIG(control)}
                                            defaultTab={0}
                                            callBack={() => {
                                                resetField('daily');
                                                resetField('weekly');
                                                resetField('monthly');
                                            }}
                                        />
                                    </Col>
                                </Fragment>
                            )}
                        </Row>
                    }
                />
            </form>
        </FormProvider>
    );
};

export default SendMailModal;
