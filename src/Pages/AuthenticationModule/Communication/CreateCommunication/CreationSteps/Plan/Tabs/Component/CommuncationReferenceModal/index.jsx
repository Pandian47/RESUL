import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { LIST_NAME_CREATION, NUMBER_REGEX } from 'Constants/GlobalConstant/Regex';
import { CANCEL, COMM_REFERENCE_CONFIRM_CONTENT, COMMUNICATION_REFERENCE, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { close_mini, restart_medium, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import _get from 'lodash/get';
import _map from 'lodash/map';
import { FormProvider, useForm } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RenderComponent from './Component/RenderComponent';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Col, Row } from 'react-bootstrap';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useQueryParams from 'Hooks/useQueryParams';

import { formatColumnName } from '../../../constants';

const CommuncationReferenceModal = ({ show, handleClose, onSubmit, formState, reducerState }) => {
    const [saved, setSaved] = useState(false);
    const [referenceConfirmModal, setRefernceConfirmModal] = useState(false);
    const locationState = useQueryParams('/communication');
    const [editMode, setEditMode] = useState(false);

    const methods = useForm({
        defaultValues: {
            newGrouping: false,
        },
        mode: 'onTouched',
    });
    const {
        handleSubmit,
        reset,
        control,
        setValue,
        getValues,
        clearErrors,
        watch,
        trigger,
        setFocus,
        formState: { isValid, errors },
    } = methods;
    const [newGrouping] = watch(['newGrouping']);

    // const editMode = locationState?.mode === 'edit';
    // console.log('editMode: ', editMode);

    const docketFilename = watch('docketFileName');
    const handleModalClose = () => {
        // debugger;
        if (!reducerState?.isReferenceSaved && locationState?.mode !== 'edit') {
            reset();
            const updateReferenceValue = formState?.reference?.map((item) => ({
                ...item,
                value: '',
            })); // const updateReferenceValue = _map(...formState?.reference, (form) => ({ ...form, value: '' }));
            let tempGrouping = {
                ...formState?.grouping,
                value: '',
            };
            let tempPriority = {
                ...formState?.priority,
                value: '',
            };
            let tempForm = {
                grouping: Object?.keys(formState?.grouping)?.length > 0 ? tempGrouping : {},
                priority: Object?.keys(formState?.grouping)?.length > 0 ? tempPriority : {},
                reference: updateReferenceValue,
                isSaved: false,
                docketFilename: reducerState?.isReferenceSaved ? docketFilename : 'Choose file',
            };
            handleClose(tempForm);
            return;
        } else {
            handleClose(formState);
        }
        // let result = [formState?.grouping, formState?.priority, ...formState?.reference];
        // const updateReferenceValue = formState?.reference?.map((item) => ({
        //     ...item,
        //     value: '',
        // }));
        // const updateReferenceValue = _map(...formState?.reference, (form) => ({ ...form, value: '' }));
        // let tempGrouping = {
        //     ...formState?.grouping,
        //     value: '',
        // };
        // let tempPriority = {
        //     ...formState?.priority,
        //     value: '',
        // };
        // let tempForm = {
        //     grouping: Object?.keys(formState?.grouping)?.length > 0 ? tempGrouping : {},
        //     priority: Object?.keys(formState?.grouping)?.length > 0 ? tempPriority : {},
        //     reference: updateReferenceValue,
        // };
        // handleClose(tempForm);
        // handleClose(formState);
    };

    const campaignGroupNameExists = async (name) => {
        const payload = {
            campaignGroupingId: name,
            campaignId: 1,
            departmentId: 3,
        };
    };

    const handleSave = () => {
        setSaved(true);
        return true;
    };

    useEffect(() => {
        const editModeStatus = statusIdCheck(locationState?.statusId);

        if (formState?.grouping?.value && formState?.priority?.value) {
            setValue(formState?.grouping?.columnValue?.replace(' ', ''), formState?.grouping?.value);
            setValue(formState?.priority?.columnValue?.replace(' ', ''), formState?.priority?.value);
        }
        if (formState) {
            const refStatus = formState?.reference?.every((ref) => ref.value);
            if (
                formState?.priority?.value > 0 &&
                formState?.priority?.value &&
                formState?.grouping?.value &&
                formState?.grouping?.value > 0 &&
                refStatus &&
                !editModeStatus
            ) {
                setEditMode(true);
            } else {
                setEditMode(false);
            }
        }
    }, [formState, locationState]);
    // console.log(formState?.grouping?.columnValue?.replace(' ', ''), '####');

    // console.log('Form state :::: ', formState, getValues('newGrouping'));

    const getFindValue = (state, field, defaultValue = '') => {
        const value = _get(state, field, defaultValue);
        return value;
    };

    const [groupingMin, groupingMax, groupingPattern, groupingColumnValue, groupingFriendlyName] = [
        getFindValue(formState?.grouping?.columnValueConfig?.rules, 'min', false),
        getFindValue(formState?.grouping?.columnValueConfig?.rules, 'max', false),
        getFindValue(formState?.grouping?.columnValueConfig?.rules, 'pattern', false),
        getFindValue(formState?.grouping, 'columnValue', ''),
        getFindValue(formState?.grouping, 'friendlyName', ''),
    ];

    return (
        <>
            <RSModal
                show={show}
                size="xl"
                handleClose={handleModalClose}
                header={COMMUNICATION_REFERENCE}
                closeTooltipPosition={true}
                body={
                    <FormProvider {...methods}>
                        {Object?.keys(formState?.grouping)?.length > 0 && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={4}>
                                        <span>{formatColumnName(formState?.grouping?.columnValue)}</span>
                                    </Col>
                                    <Col sm={4} className={`referenceModal ${editMode ? 'click-off' : ''}`}>
                                        {!newGrouping ? (
                                            <RSKendoDropdown
                                                control={control}
                                                label={formatColumnName(formState?.grouping?.columnValue)}
                                                data={['Enter value manually']}
                                                name={formState?.grouping?.columnValue?.replace(' ', '')}
                                                rules={{
                                                    ...(_get(
                                                        formState?.grouping?.columnValueConfig?.rules,
                                                        'required',
                                                    ) && {
                                                        required: 'Enter your ' + formState?.grouping?.columnValue,
                                                    }),
                                                }}
                                                handleChange={(e) => {
                                                    // debugger;
                                                    if (e.target.value === 'Enter value manually') {
                                                        setValue('newGrouping', true);
                                                    }
                                                }}
                                                required={_get(
                                                    formState?.grouping?.columnValueConfig?.rules,
                                                    'required',
                                                )}
                                            />
                                        ) : (
                                            <div className="position-relative">
                                                <RSInput
                                                    name={formState?.grouping?.columnValue?.replace(' ', '') + 'New'}
                                                    control={control}
                                                    id="rs_CommunicationReferenceModal_groupingidmanually"
                                                    required
                                                    label={'Enter grouping id manually'}
                                                    className='pr25'
                                                    rules={{
                                                        ...(_get(
                                                            formState?.grouping?.columnValueConfig?.rules,
                                                            'required',
                                                        ) && {
                                                            required: 'Enter group id manually ',
                                                        }),
                                                        ...(groupingMin > 0 && {
                                                            minLength: {
                                                                value: groupingMin,
                                                                message:
                                                                    'Enter ' + ' min. ' + groupingMin + ' characters',
                                                            },
                                                        }),
                                                        ...(groupingMax > 0 && {
                                                            maxLength: {
                                                                value: groupingMax,
                                                                message:
                                                                    'Enter ' +
                                                                        groupingColumnValue +
                                                                        ' less than ' +
                                                                        groupingMax +
                                                                        groupingPattern ===
                                                                    'alphanumeric'
                                                                        ? 'characters'
                                                                        : '',
                                                            },
                                                        }),
                                                        ...(groupingPattern && {
                                                            pattern: {
                                                                value:
                                                                    groupingPattern === 'alphanumeric'
                                                                        ? LIST_NAME_CREATION
                                                                        : NUMBER_REGEX,
                                                                message: 'Enter valid ' + groupingColumnValue,
                                                            },
                                                        }),
                                                    }}
                                                    handleOnBlur={(e) => {
                                                        // debugger;
                                                        if (!!e.target.value) {
                                                            // setValue('inboxClassification', {
                                                            //     cdId: 0,
                                                            //     classificationId: e.target.value,
                                                            // });
                                                            // getInboxClassificationData(undefined, e.target.value, 'notSave');
                                                            if (!!e?.value) {
                                                                setValue(
                                                                    formState?.grouping?.columnValue?.replace(' ', ''),
                                                                    e?.value,
                                                                );
                                                            }
                                                        }
                                                    }}
                                                />
                                                {/* <div className="align-items-center d-flex justify-content-between position-absolute top4 right5 zIndex2">
                                        <RSTooltip
                                            position="top"
                                            text="Save"
                                            className="position-absolute right40 top5 lh0"
                                        >
                                            <i
                                                onClick={() => {
                                                    // saveCategoryData();
                                                    getInboxClassificationData(
                                                        undefined,
                                                        getValues('newInboxName'),
                                                        'save',
                                                    );
                                                }}
                                                className={`${save_mini} ${
                                                    clickOff ? 'click-off' : ''
                                                } icon-xs color-primary-blue `}
                                            ></i>
                                        </RSTooltip>
                                        <RSTooltip
                                            position="top"
                                            text="Close"
                                            className="position-absolute top4 right12 zIndex2 lh0"
                                        >
                                            <i
                                                className={`${close_mini} color-primary-red icon-xs`}
                                                onClick={() => {
                                                    setValue('newInbox', false);
                                                    // setAudioList( );
                                                    setValue('inboxClassification', '');
                                                    setValue('newInboxName', '');
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </div> */}
                                                {/* <RSInput
                                        control={control}
                                        name={formState?.grouping?.columnValue?.replace(' ', '') + 'New'}
                                        rules={{
                                            ...(_get(formState?.grouping?.columnValueConfig?.rules, 'required') && {
                                                required: 'Enter your ' + formState?.grouping?.columnValue,
                                            }),
                                        }}
                                        label={'Enter grouping id manually'}
                                        handleOnBlur={(e) => {
                                            if (!!e?.value) {
                                                setValue(formState?.grouping?.columnValue?.replace(' ', ''), e?.value);
                                            }
                                        }}
                                    /> */}
                                                <i
                                                    id="rs_CommuncationReferenceModal_mini"
                                                    className={`${close_mini} icon-xs color-primary-red position-absolute right5 top6 cp zIndex2`}
                                                    onClick={() => {
                                                        setValue('newGrouping', false);
                                                        setValue(
                                                            formState?.grouping?.columnValue?.replace(' ', '') + 'New',
                                                            '',
                                                        );
                                                        setValue(
                                                            formState?.grouping?.columnValue?.replace(' ', ''),
                                                            '',
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Col>
                                    <Col sm={3} className={` ${editMode ? 'click-off' : ''} pr0`}>
                                        <RSKendoDropdown
                                            control={control}
                                            label={formatColumnName(formState?.priority?.columnValue)}
                                            data={[1, 2, 3, 4, 5]}
                                            name={formState?.priority?.columnValue?.replace(' ', '')}
                                            rules={{
                                                ...(_get(formState?.priority?.columnValueConfig?.rules, 'required') && {
                                                    required: 'Enter your ' + formState?.priority?.columnValue,
                                                }),
                                            }}
                                            required={_get(formState?.priority?.columnValueConfig?.rules, 'required')}
                                        />
                                    </Col>
                                    <Col sm={1} className="mt5 d-flex flex-right">
                                        <RSTooltip text={'Reset'} className="lh0" position="top">
                                            <i
                                                id="rs_data_refresh"
                                                className={`${restart_medium} icon-md color-primary-blue`}
                                                onClick={() => {
                                                    clearErrors();
                                                    setValue(formState?.grouping?.columnValue?.replace(' ', ''), '');
                                                    setValue(formState?.priority?.columnValue?.replace(' ', ''), '');
                                                    setValue('CommunicationGrouping IDNew', '');
                                                    setValue('newGrouping', false);
                                                }}
                                            />
                                        </RSTooltip>
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {_map(formState?.reference, (con, ind) => (
                            <Fragment key={ind}>
                                {/* <Row> */}
                                {/* {con?.columnValue === 'Communication Grouping ID' || con?.columnValue === 'Priority' ? (
                                // <Fragment>
                                <Col sm={4}>
                                    <RSKendoDropdown
                                        control={control}
                                        label={con.columnValue}
                                        data={
                                            con?.columnValue === 'Priority' ? [1, 2, 3, 4, 5] : ['Enter value manually']
                                        }
                                        name={con?.columnValue?.replace(' ', '')}
                                        rules={{
                                            ...(_get(con?.columnValueConfig?.rules, 'required') && {
                                                required: 'Enter your ' + con?.columnValue,
                                            }),
                                        }}
                                    />
                                </Col>
                            ) : ( */}
                                {/* </Fragment> */}
                                <div className="form-group">
                                    <Row>
                                        <Col sm={4}>
                                            <span>{formatColumnName(con?.columnValueConfig?.label)}</span>
                                        </Col>
                                        <Col sm={8}>
                                            <RenderComponent
                                                {...con}
                                                editMode={editMode}
                                                key={con.columnValue}
                                                reducerState={reducerState}
                                                docketFilename={formState?.docketFilename}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                {/* )} */}
                                {/* </Row> */}
                            </Fragment>
                        ))}
                    </FormProvider>
                }
                footer={
                    <div className="d-flex justify-content-end m0">
                        <RSSecondaryButton onClick={handleModalClose} id="rs_CommuncationReferenceModal_Cancel">
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={async () => {
                                await setFocus(Object.keys(errors)[0]);
                                const status = await trigger();
                                status &&
                                    (docketFilename !== undefined || docketFilename !== 'Choose  file') &&
                                    Object.keys(errors)?.length === 0 &&
                                    setRefernceConfirmModal(true);
                            }}
                            id="rs_CommuncationReferenceModal_Save"
                            className={`${editMode ? 'click-off' : ''}`}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    </div>
                }
            />

            <RSConfirmationModal
                show={referenceConfirmModal}
                text={COMM_REFERENCE_CONFIRM_CONTENT}
                handleConfirm={handleSubmit((data) => {
                    setRefernceConfirmModal(true);
                    const status = handleSave();
                    const payload = _map(formState?.reference, (form) => {
                        return {
                            ...form,
                            value: data[form.columnValue] ?? '',
                        };
                    });
                    let tempGrouping = {
                        ...formState?.grouping,
                        value: !newGrouping
                            ? data[formState?.grouping?.columnValue?.replace(' ', '')] ?? ''
                            : data['CommunicationGrouping IDNew'] ?? '',
                    };
                    let tempPriority = {
                        ...formState?.priority,
                        value: data[formState?.priority?.columnValue?.replace(' ', '')] ?? '',
                    };
                    let tempForm = {
                        grouping: tempGrouping,
                        priority: tempPriority,
                        reference: payload,
                        isSaved: status,
                        docketFilename: docketFilename ?? reducerState.communicationReferenceData?.docketFilename,
                    };
                    onSubmit(tempForm);
                })}
                handleClose={() => {
                    setRefernceConfirmModal(false);
                }}
            />
        </>
    );
};

export default CommuncationReferenceModal;
