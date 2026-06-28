import { ENTER_PASSWORD, ENTER_PATH, ENTER_USERNAME } from 'Constants/GlobalConstant/ValidationMessage';
import { Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';

const LDAP = ({ handleClose }) => {
    const { control, handleSubmit } = useForm();
    return (
        <Fragment>
            <Row>
                <Col md={12}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'path'}
                            placeholder={'Path'}
                            control={control}
                            required
                            rules={{ required: ENTER_PATH }}
                        />
                    </div>
                </Col>
                <Col md={12}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'username'}
                            placeholder={'Username'}
                            control={control}
                            required
                            rules={{ required: ENTER_USERNAME }}
                        />
                    </div>
                </Col>
                <Col md={12}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'password'}
                            placeholder={'Password'}
                            control={control}
                            required
                            rules={{ required: ENTER_PASSWORD }}
                        />
                    </div>
                </Col>
            </Row>
            <div className="buttons-holder mt0">
                <Row>
                    <Col>
                        <RSSecondaryButton
                            onClick={() => {
                                handleClose();
                            }}
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleSubmit((data) => {
                                                                handleClose(false);
                            })}
                            type="submit"
                        >
                            Apply
                        </RSPrimaryButton>
                    </Col>
                </Row>
            </div>
        </Fragment>
    );
};

export default LDAP;
