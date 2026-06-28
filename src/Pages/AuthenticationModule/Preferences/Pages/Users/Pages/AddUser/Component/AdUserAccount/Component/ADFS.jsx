import { ENTER_ADFS_URL, ENTER_APPLICATION_ID, ENTER_APPLICATION_SECRET, ENTER_DIRECTORY_ID, ENTER_ENDPOINT_URL, ENTER_GROUP_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
const ADFS = ({ handleClose }) => {
    const { control, handleSubmit } = useForm();
    return (
        <Fragment>
            <Row>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'directoryID'}
                            id="rs_ADFS_directoryID"
                            placeholder={'Directory ID'}
                            control={control}
                            required
                            rules={{ required: ENTER_DIRECTORY_ID }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'applicationID'}
                            id="rs_ADFS_applicationID"
                            placeholder={'Application ID'}
                            control={control}
                            required
                            rules={{ required: ENTER_APPLICATION_ID }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'applicationSecret'}
                            id="rs_ADFS_applicationSecret"
                            placeholder={'Application secret'}
                            control={control}
                            required
                            rules={{ required: ENTER_APPLICATION_SECRET }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'groupID'}
                            id="rs_ADFS_groupID"
                            placeholder={'Group ID'}
                            control={control}
                            required
                            rules={{ required: ENTER_GROUP_ID }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'ADFSURL'}
                            id="rs_ADFS_ADFSURL"
                            placeholder={'ADFS URL'}
                            control={control}
                            required
                            rules={{ required: ENTER_ADFS_URL }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'EndPointUrl'}
                            id="rs_ADFS_EndPointUrl"
                            placeholder={'End point URL'}
                            control={control}
                            required
                            rules={{ required: ENTER_ENDPOINT_URL }}
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
                            id="rs_ADFS_Cancel"
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleSubmit((data) => {
                                                                handleClose(false);
                            })}
                            type="submit"
                            id="rs_ADFS_Connect"
                        >
                            Connect
                        </RSPrimaryButton>
                    </Col>
                </Row>
            </div>
        </Fragment>
    );
};

export default ADFS;
