import { circle_minus_fill_medium, crown_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { getSecurityGroup } from './constants';
import { SELECT_ROLE } from 'Constants/GlobalConstant/ValidationMessage';
import RSConfirmationModal from 'Components/ConfirmationModal';

const RenderFields = ({ index, responseApiData = {}, removeUser }) => {
    const { control, setValue } = useFormContext();
    const fieldName = `assignRole[${index}].selectedBUs`;

    const { fields: selectedBUFields, remove: removeField } = useFieldArray({ control, name: fieldName });
    const [warningModal, setWarningModal] = useState({
        show: false,
        data: {},
        index: null,
    });
    // Watch the selectedBUs to handle updates if needed (metadata flat fields)
    const watchedBUs = useWatch({
        control,
        name: fieldName,
    });

    const securityGroups = useMemo(() => {
        return responseApiData?.securityGroup ? getSecurityGroup(responseApiData?.securityGroup) : [];
    }, [responseApiData]);

    return (
        <>
            {!!selectedBUFields?.length && (
                <div className="assign-entity-fields-container">
                    {selectedBUFields.map((field, idx) => {
                        const currentBUData = watchedBUs?.[idx] || {};
                        const selectedRoleId = currentBUData?.selectedRole?.groupId || currentBUData?.roleId;
                        const isKeyPerson = currentBUData?.isKeyPerson;
                        const isLastBU = idx === selectedBUFields?.length - 1 || false;
                        return (
                            <Row
                                key={field.id}
                                className={`assign-entity-card p10 mx0 align-items-center ${isLastBU ? ' no-border-bottom' : ''}`}
                            >
                                <Col md={4} className="assign-entity-card-info pl15">
                                    <span className="assign-entity-card-name font-weight-500 color-dark-grey">
                                        <TruncatedCell value={field?.name} noTable={true} />
                                    </span>
                                </Col>

                                <Col md={6} className="assign-entity-card-role">
                                    <div className="d-flex align-items-center">
                                        <RSKendoDropDownList
                                            data={securityGroups}
                                            control={control}
                                            name={`${fieldName}[${idx}].selectedRole`}
                                            label={'User role'}
                                            dataItemKey={'groupId'}
                                            textField={'groupSecurity'}
                                            rules={{ required: SELECT_ROLE }}
                                            className="w-100"
                                            handleChange={(e) => {
                                                const role = e?.value;
                                                setValue(`${fieldName}[${idx}].role`, role?.groupSecurity);
                                                setValue(`${fieldName}[${idx}].roleId`, role?.groupId);

                                                // Reset Key Person if role changes and isn't eligible
                                                if (role?.groupId !== 4 && role?.groupId !== 5) {
                                                    setValue(`${fieldName}[${idx}].isKeyPerson`, false);
                                                }
                                            }}
                                        />
                                    </div>
                                </Col>

                                <Col md={2} className="d-flex gap-2 justify-content-end p10">
                                    {(selectedRoleId === 4 || selectedRoleId === 5) && (
                                        <RSTooltip text="Key Contact">
                                            <i
                                                onClick={() => {
                                                    setValue(`${fieldName}[${idx}].isKeyPerson`, !isKeyPerson);
                                                }}
                                                className={`${crown_fill_medium} ${
                                                    isKeyPerson ? 'color-primary-orange' : 'color-primary-grey'
                                                } cp icon-md`}
                                            />
                                        </RSTooltip>
                                    )}
                                    <RSTooltip text="Remove" position="top">
                                        <i
                                            className={`${circle_minus_fill_medium} color-primary-red icon-md cp`}
                                            onClick={() => {
                                                setWarningModal({
                                                    show: true,
                                                    data: field,
                                                    index: idx,
                                                });
                                            }}
                                        ></i>
                                    </RSTooltip>
                                </Col>
                            </Row>
                        );
                    })}
                </div>
            )}

            {warningModal?.show && (
                <RSConfirmationModal
                    show={warningModal?.show}
                    handleClose={() =>
                        setWarningModal((prev) => ({
                            ...prev,
                            show: false,
                            data: {},
                            index: null,
                        }))
                    }
                    handleConfirm={() => {
                        if (selectedBUFields.length === 1) {
                            removeUser();
                        } else {
                            removeField(warningModal?.index);
                        }
                        setWarningModal((prev) => ({
                            ...prev,
                            show: false,
                            data: {},
                            index: null,
                        }));
                    }}
                />
            )}
        </>
    );
};

export default RenderFields;
