import { SELECT_CLASSIFICATION, SELECT_DATA_TYPE, SELECT_FILTER_GROUP, SELECT_INPUT_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { ATTRIBUTE_NAME_RULES, FALLBACK_ATTRIBUTE_RULES } from 'Constants/GlobalConstant/Rules';
import { ATTRIBUTE_NAME, FALLBACK_ATTRIBUTE_NAME, PERSONALISATION } from 'Constants/GlobalConstant/Placeholders';
import { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';

import { INPUT_TYPE_DATA, DATA_TYPE_DATA, FILTER_GROUP, CLASSIFICATIONS } from '../../constant';

const EditModal = ({ handleClose, show }) => {
    const { control, handleSubmit: formSubmit } = useForm();
    const handleSubmit = (data) => {};
    const [personalizeShow, setpersonalizeShow] = useState(false);
    return (
        <RSModal
            show={show}
            size={'md'}
            header={'New category'}
            handleClose={handleClose}
            body={
                <>
                    <form className="mt15" onSubmit={formSubmit(handleSubmit)}>
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSInput
                                        type={'text'}
                                        name={'AttributeName'}
                                        control={control}
                                        required
                                        placeholder={ATTRIBUTE_NAME}
                                        rules={ATTRIBUTE_NAME_RULES}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name={'InputType'}
                                        control={control}
                                        data={INPUT_TYPE_DATA}
                                        required
                                        textField={'name'}
                                        dataItemKey={'id'}
                                        label={'Input type'}
                                        rules={{ required: SELECT_INPUT_TYPE }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name={'DataType'}
                                        control={control}
                                        data={DATA_TYPE_DATA}
                                        required
                                        textField={'name'}
                                        dataItemKey={'id'}
                                        label={'Data type'}
                                        rules={{ required: SELECT_DATA_TYPE }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name={'filterGroup'}
                                        control={control}
                                        data={FILTER_GROUP}
                                        required
                                        textField={'name'}
                                        dataItemKey={'id'}
                                        label={'Filter group'}
                                        rules={{ required: SELECT_FILTER_GROUP }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name={'Classification'}
                                        control={control}
                                        data={CLASSIFICATIONS}
                                        required
                                        textField={'name'}
                                        dataItemKey={'id'}
                                        label={'Classification'}
                                        rules={{ required: SELECT_CLASSIFICATION }}
                                        handleChange={(e) => {
                                            {
                                                e.value.name === 'Personalisation' || e.value.name === PERSONALISATION
                                                    ? setpersonalizeShow(true)
                                                    : setpersonalizeShow(false);
                                            }
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {personalizeShow && (
                            <Row>
                                <Col sm={12}>
                                    <div className="form-group">
                                        <RSInput
                                            type={'text'}
                                            name={'Personalisation'}
                                            control={control}
                                            required
                                            placeholder={FALLBACK_ATTRIBUTE_NAME}
                                            rules={FALLBACK_ATTRIBUTE_RULES}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        )}
                        <div className="buttons-holder m0">
                            <Row>
                                <Col>
                                    <RSSecondaryButton onClick={() => handleClose()}>Cancel</RSSecondaryButton>
                                    <RSPrimaryButton type="submit">Save</RSPrimaryButton>
                                </Col>
                            </Row>
                        </div>
                    </form>
                </>
            }
        />
    );
};

export default EditModal;
