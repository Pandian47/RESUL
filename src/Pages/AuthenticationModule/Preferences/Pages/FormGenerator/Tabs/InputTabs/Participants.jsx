import { EMAIID_MOBILENO_MANDATORY, SAVE, SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, memo, useContext, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';

import { SETTINGS_ICON, SALUTATION, BODYCONFIG, PARTICIPANT_LIST, PARTICIPANT_COUNT } from '../../constant';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import RSTooltip from 'Components/RSTooltip';


const Participants = ({ labelName, index, preview, participant: participantProp, participantTotal: participantTotalProp }) => {
    const {
        control,
        setValue,
        setError,
        watch,
        handleSubmit,
        clearErrors,
        formState: { errors },
    } = useFormContext();
    const [openSettingsModal, setOpenSettingsModal] = useState(false);
    const [showError, setShowError] = useState(false);
    const [salutation, fullName, email, mobile, participantCount] = watch([
        'Salutation' + index,
        'Full name' + index,
        'Email' + index,
        'Mobile' + index,
        `formGenerator[${index}].participantTotal`
    ]);
    const { tag } = useContext(FormGeneratorContext);

    const [originalParticipantData, setOriginalParticipantData] = useState({
        participant: [],
        count: '1'
    });

    const participantData = useWatch({ control, name: `formGenerator[${index}]` });
    const participant = preview ? (participantProp || [false, true, true, false]) : participantData?.participant;

    const handleOpenModal = () => {
        setOriginalParticipantData({
            participant: [...(participant || [])],
            count: participantCount || '1'
        });
        setShowError(false); // Reset error when opening modal
        setOpenSettingsModal(true);
    };

    const handleClose = (status) => {
        if (status) {
            // Validate: Check if Email OR Mobile is selected
            if (!participant?.[2] && !participant?.[3]) {
                // Neither Email nor Mobile is selected - show error and prevent save
                setShowError(true);
                return; // Don't close the modal
            }

            // Validation passed - proceed with save
            setOriginalParticipantData({
                participant: [...(participant || [])],
                count: participantCount || '1',
            });
            setShowError(false);
            setOpenSettingsModal(false);
        } else {
            // Cancel button - restore original data
            setValue(`formGenerator[${index}].participant`, originalParticipantData.participant);
            setValue(`formGenerator[${index}].participantTotal`, originalParticipantData.count || '1');
            setShowError(false);
            setOpenSettingsModal(false);
        }
    };

    return (
        <>
            <div className={`Addparticipants ${preview ? 'fbc-preview' : 'form-builder-component'}`}>
                <div className="rs-form-element-wrapper">
                    <div className="rs-form-content-holder rsfch-2">
                        <div className={`rsfch-label `}>
                            <RSEditorPopup
                                name={`formGenerator[${index}].tinyMceLable`}
                                control={control}
                                initialValue={labelName}
                                init={BODYCONFIG}
                                required
                                minChars={tag === 'Survey' ? 3 : 3}
                                maxChars={120}
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                }}
                                handleChange={(e) => {
                                                                        clearErrors(`formGenerator[${index}].tinyMceLable`);
                                }}
                            />
                        </div>
                        <div className={` participant-content ${preview ? " ml0" : ""}`}>
                            <div className={`rsfch-content   `}>
                                <Row className='click-off'>
                                    {participant?.[0] && (
                                        <Col>
                                            <RSKendoDropDownList
                                                name={`formGenerator[${index}].selectField`}
                                                data={SALUTATION}
                                                control={control}
                                                label={'Salutation'}
                                            // rules={{
                                            //     required: THIS_FIELD_IS_REQUIRED,
                                            // }}
                                            />
                                        </Col>
                                    )}
                                    {participant?.[1] ? (
                                        <Col>
                                            <RSInput
                                                control={control}
                                                name={`formGenerator[${index}].FullName`}
                                                placeholder={'Full name'}
                                                className="form-control"
                                            />
                                        </Col>
                                    ) : (
                                        <>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`formGenerator[${index}].FirstName`}
                                                    placeholder={'First name'}
                                                    className="form-control"
                                                />
                                            </Col>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`formGenerator[${index}].LastName`}
                                                    placeholder={'Last name'}
                                                    className="form-control"
                                                />
                                            </Col>
                                        </>
                                    )}
                                </Row>
                                <Row className="mt30 click-off">
                                    {participant?.[2] && (
                                        <Col>
                                            <RSInput
                                                control={control}
                                                name={`formGenerator[${index}].email`}
                                                placeholder={'Email'}
                                                className="form-control"
                                            />
                                        </Col>
                                    )}
                                    {participant?.[3] && (
                                        <Col>
                                            <RSPhoneInput
                                                control={control}
                                                name={`formGenerator[${index}].mobile`}
                                                label={'Enter mobile number'}
                                                // enableSearch={true}
                                                setError={setError}
                                                clearErrors={clearErrors}
                                                className="form-control"
                                            />
                                        </Col>
                                    )}
                                </Row>
                                {!preview && (
                                    // <div className="rs-form-properties-holder position-absolute bottom16 right0">
                                    //     <div className="rsfph-icons ">
                                    <RSTooltip position="top" text={SETTINGS} className="position-relative bottom29  float-end ">
                                        <i
                                            className={`${SETTINGS_ICON} icon-md color-primary-blue`}
                                            onClick={handleOpenModal}
                                        ></i></RSTooltip>
                                    //     </div>
                                    // </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <RSModal
                show={openSettingsModal}
                size="md"
                header={'Add participants settings'}
                handleClose={() => handleClose(false)}
                body={
                    <Fragment>
                        <div className="form-group">
                            <Row>
                                {PARTICIPANT_LIST?.map((item, ind) => {
                                    return (
                                        <Col sm={3} key={ind}>
                                            <RSCheckbox
                                                className="smaller"
                                                name={`formGenerator[${index}].participant[${ind}]`}
                                                defaultValue={item?.name === 'Email'}
                                                control={control}
                                                labelName={item.name}
                                                rules={{
                                                    validate: (data) => {
                                                                                                                return participantData?.participant?.[2] &&
                                                            participantData?.participant?.[3] &&
                                                            ind === 2
                                                            ? ''
                                                            : true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                    );
                                })}
                            </Row>
                        </div>
                        <div className="form-group mb0">
                            <Row>
                                <Col sm={{ span: 9 }} className="text-start">
                                    <label className="control-label-left">Maximum number of referrals allowed</label>
                                </Col>
                                <Col sm={{ span: 2, offset: 0 }}>
                                    <RSKendoDropDownList
                                        name={`formGenerator[${index}].participantTotal`}
                                        data={PARTICIPANT_COUNT}
                                        defaultValue={'1'}
                                        control={control}
                                        label={'Count'}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Fragment>
                }
                footer={
                    <div className="m0 d-flex align-items-center justify-content-end">
                        {showError && (
                            <span className="color-primary-red mr-3">
                                {EMAIID_MOBILENO_MANDATORY}
                            </span>
                        )}
                        <RSPrimaryButton onClick={() => handleClose(true)}>
                            {SAVE}
                        </RSPrimaryButton>
                    </div>
                }
            />
        </>
    );
};

export default memo(Participants);
