import { circle_minus_fill_edge_medium, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { selectIcon } from 'Utils/modules/display';
import { ENTER_PASSWORD, ENTER_USERNAME } from 'Constants/GlobalConstant/ValidationMessage';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import { useEffect } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';


const SMTPServerSettings = ({ show, handleClose, handleSave }) => {
    const {
        control,
        watch,
        trigger,
        reset,
        setError,
        handleSubmit,
        clearErrors,
        formState: { isValid },
    } = useFormContext();
    const [checkSMTPConfiguration] = watch(['smtpServerSettings.checkSMTPConfiguration']);
    const [smtpServerSettings] = watch(['smtpServerSettings']);
    useEffect(() => {
        clearErrors('smtpServerSettings.serverNameIP');
        clearErrors('smtpServerSettings.portNumber');
    }, [checkSMTPConfiguration]);
    const { fields, append, remove } = useFieldArray({ control, name: `smtpServerSettings.credentials` });
    const smtpServerSettingsWatch = useWatch({
        control,
        name: `smtpServerSettings.credentials`,
    });
    const addCredentials = (index) => {
        if (index === 0) {
            let validationState = smtpServerSettingsWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });
            if (validationState === -1) {
                append({ userName: '', password: '' });
            } else {
                trigger();
            }
        } else {
            let temp = smtpServerSettingsWatch[index];

            remove(index);
        }
    };
    const handleCloseAction = (data) => {
        if (data) {
            let validationState = smtpServerSettingsWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });
            if (validationState !== -1) {
                trigger(`smtpServerSettings.credentials[${validationState}]`);
            } else if (!smtpServerSettings.checkSMTPConfiguration) {
                if (smtpServerSettings.portNumber === '') {
                    trigger(`smtpServerSettings.portNumber`);
                } else {
                    handleSave();
                }
                if (smtpServerSettings.serverNameIP === '') {
                    trigger(`smtpServerSettings.serverNameIP`);
                } else {
                    handleSave();
                }
            } else {
                handleSave();
            }
        } else {
            reset((prev) => ({
                ...prev,
                smtpServerSettings: {
                    credentials: [
                        {
                            userName: '',
                            password: '',
                        },
                    ],
                    serverNameIP: '',
                    portNumber: '',
                    checkSMTPConfiguration: true,
                },
            }));
            handleClose();
        }
    };
    return (
        <RSModal
            show={show}
            handleClose={handleCloseAction}
            header={'SMTP server settings'}
            size="lg"
            body={
                <>
                   <div className='form-group'>
                   <RSCheckbox
                        control={control}
                        name={'smtpServerSettings.checkSMTPConfiguration'}
                        labelName={'Check to use the same SMTP configuration'}
                    />
                   </div>
                    {!checkSMTPConfiguration && (
                        <>
                            <div className="form-group">
                                <Row>
                                    <Col sm={11}>
                                        <RSInput
                                            control={control}
                                            label={'Server name / IP'}
                                            name={'smtpServerSettings.serverNameIP'}
                                            required
                                            rules={{
                                                required: ENTER_USERNAME,
                                                validate: (data) => (!!data ? true : ENTER_USERNAME),
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={11}>
                                        <RSInput
                                            control={control}
                                            label={'Port number'}
                                            name={'smtpServerSettings.portNumber'}
                                            required
                                            rules={{
                                                validate: (data) => (!!data ? true : 'Enter port number'),
                                                required: 'Enter port number',
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}
                    <Row >
                        <Col>
                            <h4>Credentials</h4>
                        </Col>
                    </Row>
                    {fields?.map((item, idx) => {
                        return (
                            <div key={item.id} className={`rs-smtp-block ${idx == 0 ? '' : 'mt20'} `}>
                                <Row>
                                    <Col sm={{span:11,offset:1}} className='rs-box-repeat rsbr-block ml17'>
                                        <div className="form-group  ">
                                            <RSInput
                                                control={control}
                                                name={`smtpServerSettings.credentials[${idx}].userName`}
                                                label={'Username'}
                                                required
                                                rules={{
                                                    required: ENTER_USERNAME,
                                                    validate: (data) => (!!data ? true : ENTER_USERNAME),
                                                }}
                                            />
                                        </div>
                                        <div className="form-group mb0">
                                            <RSInput
                                                control={control}
                                                name={`smtpServerSettings.credentials[${idx}].password`}
                                                label={'Password'}
                                                type={'password'}
                                                required
                                                rules={{
                                                    required: ENTER_PASSWORD,
                                                    validate: (data) => (!!data ? true : ENTER_PASSWORD),
                                                }}
                                            />
                                        </div>
                                    </Col>

                                    {/* <Col sm={1} className="pl0 d-flex">
                                        
                                    </Col> */}
                                    {/* {idx == 0 && (
                                        <Col sm={1} className="pl0 d-flex">
                                            <div className="d-flex flex-column-reverse position-relative top-7">
                                                <RSTooltip text={'Add'} position="top">
                                                    <i
                                                        className={`${
                                                            circle_plus_fill_edge_medium
                                                        } color-primary-blue icon-md float-right ${
                                                            fields?.length < 4 ? '' : 'click-off'
                                                        }`}
                                                        onClick={() => addCredentials()}
                                                    />
                                                </RSTooltip>
                                            </div>
                                        </Col>
                                    )}
                                    {idx !== 0 && (
                                        <Col sm={1} className="pl0 d-flex">
                                            <div className="rs-smtp-close d-flex flex-column-reverse position-relative top0">
                                                <RSTooltip text={'Remove'} position="top">
                                                    <i
                                                        className={`${circle_minus_fill_edge_medium} color-primary-red icon-md`}
                                                        onClick={() => {
                                                            remove(idx);
                                                        }}
                                                    />
                                                </RSTooltip>
                                            </div>
                                        </Col>
                                    )} */}
                                </Row>
                                <div className="position-absolute right3 bottom-10">
                                            <RSTooltip text={idx === 0 ? 'Add' : 'Delete'} position="top">
                                                <i
                                                    onClick={() => addCredentials(idx)}
                                                    className={`${selectIcon(idx)} icon-md cp ${
                                                        fields?.length > 4 && idx == 0 ? 'click-off' : ''
                                                    }`}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                            </div>
                        );
                    })}
                </>
            }
            footer={
                <div className="buttons-holder">
                    <RSSecondaryButton onClick={() => handleCloseAction(false)}>{'Cancel'}</RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            handleCloseAction(true);
                        }}
                    >
                        {'Save'}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default SMTPServerSettings;
