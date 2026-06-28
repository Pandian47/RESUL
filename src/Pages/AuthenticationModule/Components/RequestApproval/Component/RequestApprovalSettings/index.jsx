import { ALL, ANY, APPROVAL_SETTINGS, CANCEL, COUNT, FOLLOW_HIERARCHY, GET_APPROVAL_FROM, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const RequestApprovalSettings = ({
    parent,
    approvalSettings,
    show,
    handleClose,
    setRequestApprovalSettings,
    requestApprovalSettings,
}) => {
    const { control, resetField, setValue, reset, watch , getValues} = useFormContext();
    const [saved, setSaved] = useState(false);
    const [form, approvalCount] = watch([`${parent}.approvalFrom`, `${parent}.approvalCount`]);
    const { approvalFrom } = approvalSettings || {};

    useEffect(() => {
        //debugger
        if (requestApprovalSettings?.approvalFrom === 'All' && approvalCount) {
            resetField(`${parent}.approvalCount`);
            setValue(`${parent}.approvalCount`, '');
        }
    }, [form]);
    const handleModalClose = () => {
        // if (!saved) {
        //     restFieldList.forEach((name) => resetField(`${parent}.${name}`));
        // }
        setValue(`${parent}.approvalCount`, requestApprovalSettings?.approvalCount);
        setValue(`${parent}.approvalFrom`, requestApprovalSettings?.approvalFrom);
        setValue(`${parent}.followHierarchy`, requestApprovalSettings?.followHierarchy);
        handleClose();
    };

    const dropDownData = approvalSettings?.name?.length === 2 ? [1] : [1, 2];

    // console.log(watch(`${parent}.approvalCount`), 'ooo');

    return (
        <RSModal
            show={show}
            size="md"
            header={APPROVAL_SETTINGS}
            handleClose={handleModalClose}
            body={
                <Fragment>
                    <div className="form-group">
                    <Row className='align-items-end'>
                        <Col md={5}>{GET_APPROVAL_FROM}</Col>
                        <Col  md={7} >
                        <div className={approvalFrom === 'Any' ? 'align-items-end d-flex gap-3 justify-content-around' :'d-flex gap-3'}>
                            <RSRadioButton
                                control={control}
                                name={`${parent}.approvalFrom`}
                                labelName={ALL}
                                defaultValue={approvalFrom ?? 'All'}
                            />
                            <RSRadioButton
                                control={control}
                                name={`${parent}.approvalFrom`}
                                labelName={ANY}
                                defaultValue={approvalFrom}
                                handleChange={(e) => setValue(`${parent}.followHierarchy`, false)}
                            />
                            {approvalFrom === 'Any' && (
                                <RSKendoDropDownList
                                    control={control}
                                    name={`${parent}.approvalCount`}
                                    data={dropDownData}
                                    label ={COUNT}
                                    required
                                />
                            )}
                            </div>
                        </Col>
                    </Row>
                    </div>
                    <Row>
                        <Col md={5}>{FOLLOW_HIERARCHY}</Col>
                        <Col  md={7} className={approvalFrom === 'Any' ? 'pe-none click-off' : ''}>
                            <RSSwitch control={control} name={`${parent}.followHierarchy`} />
                        </Col>
                    </Row>
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={handleModalClose}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            // setSaved(true);
                            setRequestApprovalSettings({
                                approvalFrom: approvalSettings.approvalFrom,
                                approvalCount: approvalSettings.approvalCount,
                                followHierarchy: approvalSettings.followHierarchy,
                            });
                            setValue(`${parent}.approvalCount`, approvalSettings.approvalCount);
                            setValue(`${parent}.approvalFrom`, approvalSettings.approvalFrom);
                            setValue(`${parent}.followHierarchy`, approvalSettings.followHierarchy);
                            getValues(`approvalList.name`)?.forEach((name, idx) => {
                                setValue(`approvalList.name[${idx}].mandatory`, false);
                            });
                            handleClose();
                        }}
                        disabledClass={!approvalCount && form === 'Any' ? 'pe-none click-off' : ''}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default RequestApprovalSettings;
