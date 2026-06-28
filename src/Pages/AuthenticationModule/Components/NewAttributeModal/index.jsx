import { getUserDetails } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { INITIAL_STATE, SENSITIVE_DATA_MASKING_OPTIONS, VALIDATION_REQUIRED_LABEL, brandIdCheck, formatSensitiveDataRule, formatValidationRules, kpiConstruction, kpiRetrieve, mapToItemRender, retrieveSensitiveDataRule, retrieveValidationRules } from './constant';
import { MAX_LENGTH10, MAX_LENGTH150, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ENTER_ATTRIBUTE_NAME, SELECT_CLASSIFICATION, SELECT_DATA_TYPE, SELECT_DATE_FORMAT, SELECT_FILTER_GROUP, SELECT_INPUT_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { FALLBACK_ATTRIBUTE_RULES, LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { ARE_YOU_SURE_WANT_TO_CHANGE_CONTENT, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_NAME, ATTRIBUTE_SAVED_SUCCESSFULLY, ATTRIBUTE_UPDATED_SUCCESSFULLY, BRAND_ID, BRAND_ID_CREATED_SUCCESSFULLY, BRAND_ID_UNPQUE_IDENTIFIER, CANCEL, CLASSIFICATION, CONFIRMATION, DATA_TYPE, DATEFORMAT_TYPE, DO_YOU_WISH_TO_CONTINUE, ENTER_VALUE, FALLBACK_ATTRIBUTE_NAME, FILTER_GROUP, INPUT_TYPE, INPUT_TYPE_HELP, ISANNUALREMINDER, ISANNUALREMINDER_DESCRIPTION, ISTIME, MAX_150_CHARACTERS, OK, SAVE, SELECT_DATATYPE_HELP, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, circle_thumbs_up_fill_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import _cloneDeep from 'lodash/cloneDeep';
import _filter from 'lodash/filter';
import _split from 'lodash/split';
import _isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector } from 'react-redux';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';

import RSTextarea from 'Components/FormFields/RSTextarea';
import TransactionData from './Components/TransactionData';
import KPIData from './Components/KPIData';
import ValidationRules from './Components/ValidationRules';
import {
    checkIsUiPrintableNameExists,
    getClassifications,
    getDataTypes,
    getDateFormat,
    getFilterGroups,
    getInputTypes,
} from 'Reducers/preferences/datacatalogue/request';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { getSessionId } from 'Reducers/globalState/selector';
import ListNameExists from 'Components/ListNameExists';
import WarningPopup from '../WarningPopup/WarningPopup';

import useQueryParams from 'Hooks/useQueryParams';
import RSTooltip from 'Components/RSTooltip';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { NewAttributeModalFormSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';

var payloadData = {};

const NewAttributeModal = ({
    show,
    handleClose,
    handleSaveAttribute,
    editData,
    editAttributeId = null,
    catType,
    addAudience,
}) => {
    const [lastActionType, setLastActionType] = useState('create');
    const [lastUiPrintableName, setLastUiPrintableName] = useState('');
    const state = useQueryParams('/audience/add-import-audience');
    // console.log('state: ', state);
    const isEditMode = Boolean(editData) || Boolean(editAttributeId);
    const dispatch = useDispatch();
    const { dataTypes, inputTypes, dateformats, filterGroups, classifications, dataCatalogueAttrs } = useSelector(
        ({ dataCatalogueReducer }) => dataCatalogueReducer,
    );
    const env = getEnvironment();
    const isProductionEnv = ['RUN', 'RUN19'].includes(env);
    // console.log('filterGroups: ', filterGroups);
    const sortdatatypes = dataTypes
        ?.map((item) => item)
        .sort((a, b) => {
            if (a.dataTypeName < b.dataTypeName) {
                return -1;
            }
            if (a.dataTypeName > b.dataTypeName) {
                return 1;
            }
            return 0;
        });

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    // const isAudience = 0;
    const { isAudience, isCampaign } = getUserDetails();
    const isBrandExists = _find(dataCatalogueAttrs, ['isBrandId', 1]);
    const [warningModal, setWarningModal] = useState({
        show: false,
        type: 0,
    });
    const [nameValid, setNameValid] = useState(false);
    const [isShowMsgModal, setIsShowMsgModal] = useState(false);
    const [isBrandId, setIsBrandId] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [modalOptionsReady, setModalOptionsReady] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const exists = useRef();
    const methods = useForm(INITIAL_STATE);
    const {
        control,
        reset,
        handleSubmit: formSubmit,
        watch,
        unregister,
        setValue,
        getValues,
        setError,
        clearErrors,
        formState: { isDirty, isValid },
    } = methods;

    const [
        dataType,
        classification,
        inputType,
        uIPrintableName,
        brandIdWatch,
        dateTimeFormatWatch,
        validationrequired,
        textDataLength,
        StringDataLength,
        textValidationType,
        sensitiveDatavalue,
    ] = watch([
        'dataType',
        'classification',
        'inputType',
        'uIPrintableName',
        'brandId',
        'dateTimeFormat',
        'validationrequired',
        'textDataLength',
        'StringDataLength',
        'textValidationType',
        'sensitiveDatavalue',
    ]);
    const checkForDateType = inputType?.fieldTypeId === 8;

    const isUpdate = Boolean(editData);
    const isCapType = dataType?.name === 'CAP Type';
        
    const capTypeRules = (name) => {
        if (!isCapType) {
            switch (name) {
                case 'inputType':
                    return { required: SELECT_INPUT_TYPE };
                case 'filterGroup':
                    return { required: SELECT_FILTER_GROUP };
                default:
                    return { required: SELECT_CLASSIFICATION };
            }
        } else return {};
    };
        const handleSubmit = async (data) => {
            if (isSubmitting) return;

            /* ---------------- Sensitive Data Check ---------------- */
            const hasSensitiveData =
                data.classification?.some(item =>
                    item?.dataClassificationName?.includes('Sensitive data')
                ) || false;

            const actionType = editData ? 'update' : 'create';

            /* ---------------- Initial Setup ---------------- */
            const nameExistCheckPayload = {
                attributeName: data.uIPrintableName,
                clientId,
                departmentId,
                userId,
            };

            let finalData = {};
            let callApi = true;

            /* ---------------- EDIT FLOW ---------------- */
            if (editData) {
                if (!editData?.isBrandId && data?.brandId) {
                    setWarningModal(prev => ({ ...prev, show: data?.brandId }));
                    setIsShowMsgModal(true);
                    setLastActionType(actionType);
                    setIsBrandId(true);
                    callApi = false;
                }

                const validationRules = formatValidationRules(data, data.inputType);
                const sensitiveDataRule = formatSensitiveDataRule(data, data.classification);

                finalData = {
                    dataAttributeId: data.dataAttributeId,
                    attributeName: data.attributeName,
                    uIPrintableName: data.uIPrintableName,
                    description: data.description,
                    clientId,
                    departmentId,
                    userId,
                    isBrandId: data?.brandId ? 1 : 0,
                    fallbackAttributeName: data.fallbackAttributeName || '',
                    isAnnualReminder: data.inputType.fieldTypeId === 8 ? data?.isAnnualReminder ?? false : false,
                    isTime: data.inputType.fieldTypeId === 8 ? data?.isTime ?? false : false,
                    isValidationRequired: data.validationrequired ?? false,
                    validationRuleJSON: validationRules,
                    sensitiveDataRule,
                };
            }

            /* ---------------- CREATE FLOW ---------------- */
            else {
                if (data?.brandId) {
                    setWarningModal(prev => ({ ...prev, show: data?.brandId }));
                    setIsBrandId(true);
                    setLastActionType('create');
                    callApi = false;
                }

                const validationRules = formatValidationRules(data, data.inputType);
                const sensitiveDataRule = formatSensitiveDataRule(data, data.classification);

                let catTypeName = data?.categoryTypeText ? data?.categoryType : '';

                finalData = {
                    catType: data?.categoryType ? 'child' : '',
                    catTypeName: data?.categoryType?.id === 0 ? catTypeName : data?.categoryType,
                    name: data.uIPrintableName || '',
                    description: data.description || '',
                    attributeFlag: data.attributeFlag || '',
                    attributeFlagValue: data.attributeFlagValue?.dataAttributeId || '',
                    dataType: data.dataType?.dataTypeId || 0,
                    inputType: data.inputType?.fieldTypeId || 0,
                    filterGroup: data.filterGroup?.filterGroupId || 0,
                    classification: data?.classification?.map(c => c.dataClassificationId),
                    dateTimeFormat: data.dateTimeFormat?.attributeDateFormatId || 0,
                    isAnnualReminder: data?.isAnnualReminder ?? false,
                    isTime: data?.isTime ?? false,
                    fallbackAttributeName: data.fallbackAttributeName || '',
                    kpiType: data.kpiType || '',
                    kPICondition: kpiConstruction(data.kpiConditions),
                    isBrandId: data?.brandId ? 1 : 0,
                    departmentId,
                    clientId,
                    userId,
                    isValidationRequired: data.validationrequired ?? false,
                    validationRuleJSON: data.validationrequired ? validationRules : '',
                    sensitiveDataRule: (hasSensitiveData && !isProductionEnv) ? sensitiveDataRule : '',
                };
            }

            /* ---------------- API CALL ---------------- */
            if (!callApi) {
                payloadData = finalData;
                return;
            }

            setIsSubmitting(true);
            try {
                const isSaveSuccess = await handleSaveAttribute(finalData);

                if (isSaveSuccess?.status) {
                    setIsShowMsgModal(true);
                    setLastActionType(actionType);
                    setLastUiPrintableName(data?.uIPrintableName || '');
                    setIsBrandId(false);
                }
            } catch (error) {
            } finally {
                setIsSubmitting(false);
            }
            };

    useEffect(() => {
        const payload = {
            clientId,
            userId,
            departmentId,
        };
        if (!show) {
            setModalOptionsReady(false);
            setIsSubmitting(false);
            reset();
            return;
        }

        let cancelled = false;
        const loadModalOptions = async () => {
            setModalOptionsReady(false);
            const tasks = [];
            if (_isEmpty(dataTypes)) tasks.push(dispatch(getDataTypes(payload, false)));
            if (_isEmpty(inputTypes)) tasks.push(dispatch(getInputTypes(payload, false)));
            if (_isEmpty(filterGroups)) tasks.push(dispatch(getFilterGroups(payload)));
            if (_isEmpty(classifications)) tasks.push(dispatch(getClassifications(payload)));
            if (tasks.length) {
                await Promise.all(tasks);
            }
            if (!cancelled) {
                setModalOptionsReady(true);
            }
        };

        loadModalOptions();
        if (isUpdate && editData) {
            setValue('brandId', editData?.isBrandId ? true : false);
        }

        return () => {
            cancelled = true;
        };
    }, [show, departmentId, clientId, userId]);
    useEffect(() => {
        if (!isUpdate || !editData) return;

        if (!getValues('dataType') || !getValues('inputType') || !getValues('dateTimeFormat')) {
            const data = {
                dataType: _find(dataTypes, ['dataTypeId', editData?.dataTypeId]),
                inputType: _find(inputTypes, ['fieldTypeId', +editData?.fieldTypeId]),
                dateTimeFormat: _find(dateformats, ['attributeDateFormatId', editData?.attributeDateFormatId]),
            };
            reset((formState) => ({ ...formState, ...data }));
        }
    }, [dataTypes, inputTypes, dateformats, editData, isUpdate]);

    useEffect(() => {
        if (checkForDateType && !dateformats?.length) {
            dispatch(getDateFormat({ clientId, userId, departmentId }, false));
        }
    }, [inputType]);
    useEffect(() => {
        if (catType !== '' && catType !== undefined) {
            const data = {
                dataType: _find(dataTypes, ['dataTypeId', 2]),
            };
            reset((formState) => ({ ...formState, ...data }));
        } else {
            if (addAudience) {
                const data = {
                    dataType: _find(dataTypes, ['dataTypeId', 1]),
                };
                reset((formState) => ({ ...formState, ...data }));
            }
        }
    }, [state, catType, dataTypes, addAudience]);

    useEffect(() => {
        if (!show || !isUpdate || !editData) return;

        let tmpClassifications = [];

        if (editData?.dataClassificationId) {
            tmpClassifications = _split(editData.dataClassificationId, ',');

            tmpClassifications = tmpClassifications.map((cls) =>
                _find(classifications, ['dataClassificationId', +cls]),
            );
        }

        const currentInputType = _find(inputTypes, ['fieldTypeId', +editData?.fieldTypeId]);
        const validationData = retrieveValidationRules(editData, currentInputType);
        const sensitiveData = retrieveSensitiveDataRule(editData);

        const data = {
            dataAttributeId: editData?.dataAttributeId,
            uIPrintableName: editData?.uIPrintableName,
            attributeName: editData?.attributeName,
            description: editData?.description,
            dataType: _find(dataTypes, ['dataTypeId', editData?.dataTypeId]),
            inputType: currentInputType,
            dateTimeFormat: _find(dateformats, ['attributeDateFormatId', editData?.attributeDateFormatId]),
            filterGroup: _find(filterGroups, ['filterGroupId', +editData?.filterGroupId]),
            attributeFlagValue: _find(dataCatalogueAttrs, ['dataAttributeId', +editData?.attributeFlagValue]),
            attributeFlag: editData?.attributeFlag,
            classification: tmpClassifications,
            fallbackAttributeName: editData?.fallbackAttributeName,
            kpiConditions: editData?.kPIType ? kpiRetrieve(editData?.sOLRExpression) : '',
            kpiType: editData?.kPIType ? JSON.parse(editData.kPIType) : '',
            brandId: editData?.isBrandId ? true : false,
            isAnnualReminder: editData?.isAnnualReminder ? true : false,
            isTime: editData?.isTime ? true : false,
            ...validationData,
            ...sensitiveData,
        };
        exists.current = data.uIPrintableName;
        reset((formState) => ({ ...formState, ...data }));
    }, [editData]);

    useEffect(() => {
        if (isCapType) {
            unregister(['inputType', 'classification', 'filterGroup']);
        }
    }, [dataType]);

    const handlePopup = () => {
        if (isSubmitting) return;

        setIsSubmitting(false);
        reset(_cloneDeep(INITIAL_STATE.defaultValues));
        handleClose(false);
        // setIsShowMsgModal(false)
    };

    // useEffect(() => {
    //     if (!show && saveSuccess && loading === 0) {
    //         setIsShowMsgModal(true);
    //         setTimeout(() => {
    //             setIsShowMsgModal(false);
    //         }, 3000);
    //     }
    // }, [loading, saveSuccess]);

    const disabledItems = () => {
        if (_findIndex(classification, ['dataClassificationId', 5]) === -1) return [];
        else return [4];
    };

    const handleChange = ({ value }) => {
        clearErrors('classification');
        if (
            _findIndex(value, ['dataClassificationId', 4]) !== -1 &&
            _findIndex(value, ['dataClassificationId', 5]) !== -1
        ) {
            setConfirm(true);
        }
    };

    const handleInputTypeChange = () => {
        const fieldsToReset = [
            'textDataLength',
            'specialCharacters',
            'StringDataLength',
            'textminlength',
            'textmaxlength',
            'textfulllength',
            'textValidationType',
            'negativevalue',
            'currencyformat',
            'startdate',
            'enddate'
        ];
        clearErrors(fieldsToReset);
        // Reset other fields
        fieldsToReset.slice(1).forEach(field => setValue(field, ''));
    };
    const sortedData = filterGroups
        .filter((e) => e.filterGroupName !== 'Source')
        .sort((a, b) => {
            if (a.filterGroupName < b.filterGroupName) return -1;
            if (a.filterGroupName > b.filterGroupName) return 1;
            return 0;
        });

    function hasTimeComponent(dateFormatObj) {
        if (!dateFormatObj || !dateFormatObj.dateFormat) {
            return false;
        }
        const timePatterns = [/hh:mm/, /HH:MM/];
        return timePatterns.some((pattern) => pattern.test(dateFormatObj.dateFormat));
    }
    const isTimedateFormat = hasTimeComponent(dateTimeFormatWatch);
    const isModalFormLoading = show && (!modalOptionsReady || (isEditMode && !editData));

    return (
        <FormProvider {...methods}>
            <RSModal
                show={show && !warningModal?.show}
                size={'lg'}
                header={`${isEditMode ? 'Edit' : 'New'} attribute`}
                handleClose={handlePopup}
                isCloseDisabled={isSubmitting}
                lockBackground={isSubmitting}
                closeClassName={isSubmitting ? 'click-off' : ''}
                body={
                    isModalFormLoading ? (
                        <NewAttributeModalFormSkeleton />
                    ) : (
                    <form
                        id="rs-new-attribute-modal-form"
                        onSubmit={(e) => {
                            // Prevent bubbling to any ancestor <form> (e.g. Form Generator). Submit events
                            // bubble in modern browsers; a portaled modal is usually safe, but Kendo /
                            // layout edge cases can still surface this — and in edit mode the parent
                            // form calls save+publishing immediately on submit.
                            e.preventDefault();
                            e.stopPropagation();
                            return formSubmit(handleSubmit)(e);
                        }}
                    >
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSInput type="hidden" name="attributeName" />
                                    <ListNameExists
                                        name="uIPrintableName"
                                        field="attributeName"
                                        apiCallback={checkIsUiPrintableNameExists}
                                        condition={({ status }) => {
                                            setNameValid(!status);
                                            return !status;
                                        }}
                                        disabled={
                                            isBrandExists?.dataAttributeId === editData?.dataAttributeId &&
                                            isCampaign &&
                                            isUpdate
                                            // ||
                                            // (isUpdate && editData?.dataClassificationId?.length > 0)
                                        }
                                        onChange={(e) => {
                                            if (
                                                e.target.value?.toLowerCase().trim() ===
                                                editData?.uIPrintableName?.toLowerCase().trim()
                                            ) {
                                                setNameValid(true);
                                            } else {
                                                setNameValid(false);
                                            }
                                        }}
                                        nameExists={nameValid}
                                        currentValue={exists.current}
                                        rules={LIST_NAME_RULES(ENTER_ATTRIBUTE_NAME)}
                                        placeholder={ATTRIBUTE_NAME}
                                        // customError={attributeNameExistsError}
                                        maxLength={MAX_LENGTH75}
                                    />
                                    {isUpdate && editData?.attributeName && (
                                        <small className="float-start">DB name: {editData?.attributeName}</small>
                                    )}

                                    {isUpdate &&
                                        (() => {
                                            try {
                                                const history = JSON.parse(editData?.uIPrintableNameHistory || '[]');
                                                return (
                                                    history?.[0]?.uiPrintableName && (
                                                        <small className="ml5 float-start">
                                                            | Previously: {history[0].uiPrintableName}
                                                        </small>
                                                    )
                                                );
                                            } catch {
                                                return null;
                                            }
                                        })()}
                                    {!!isBrandExists &&
                                        !!editData &&
                                        isBrandExists?.dataAttributeId === editData?.dataAttributeId &&
                                        isAudience === 1 ? (
                                        <>
                                            <span className="float-end">
                                                {editData?.uIPrintableName} acts as a unique identifier (Brand ID)
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <RSCheckbox
                                                // containerClass={!!uIPrintableName ? 'float-end' : 'click-off float-end'}
                                                containerClass={'float-end'}
                                                control={control}
                                                name="brandId"
                                                labelName={BRAND_ID}
                                                popover
                                                popover_overlayClass={'modalOverlayZindexCSS'}
                                                popover_class={'top2 pl5'}
                                                popover_icon={`${circle_question_mark_mini}  icon-xs color-primary-blue mr0`}
                                                popover_position="top"
                                                popover_content={BRAND_ID_UNPQUE_IDENTIFIER}
                                                disabled={
                                                    !brandIdCheck(
                                                        isAudience,
                                                        isBrandExists,
                                                        editData,
                                                        isCampaign,
                                                        isEditMode,
                                                    )
                                                } //brandIdUpdate || isBrandExists
                                                handleChange={(e) => {
                                                    const currentFallback = getValues('fallbackAttributeName');
                                                    unregister('fallbackAttributeName');
                                                    if (currentFallback) {
                                                        setValue('fallbackAttributeName', currentFallback);
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </div>
                            </Col>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSTextarea
                                        type={'text'}
                                        name={'description'}
                                        control={control}
                                        placeholder={ATTRIBUTE_DESCRIPTION}
                                        // minLength={MAX_LENGTH10}
                                        maxLength={MAX_LENGTH150}
                                        className={
                                            isUpdate && editData?.dataClassificationId?.length > 0 ? 'click-off' : ''
                                        }
                                    // rules={{
                                    //     validate: (value) => {
                                    //         if (value?.length < 15) {
                                    //             return 'Min 15 characters';
                                    //         }
                                    //     },
                                    // }}
                                    />
                                    <small className="k-font-italic">{MAX_150_CHARACTERS}</small>
                                </div>
                            </Col>
                            <Col sm={(inputType?.fieldType?.length && !isProductionEnv) ? 6 : 12} id="rs_NewAttributeModal_inputType">
                                 <div className={`form-group ${inputType?.fieldType ==='Date' ? '':'mb21'}`}>
                                    <RSKendoDropdown
                                        name={'inputType'}
                                        control={control}
                                        data={inputTypes}
                                        required={!isCapType}
                                        textField={'fieldType'}
                                        dataItemKey={'fieldTypeId'}
                                        label={INPUT_TYPE}
                                        rules={!isUpdate && capTypeRules('inputType')}
                                        disabled={isUpdate || isCapType}
                                        handleChange={handleInputTypeChange}
                                    />
                                    {!checkForDateType && (
                                        <div className="float-end">
                                            <RSTooltip
                                                text={INPUT_TYPE_HELP}
                                                popover_overlayClass={'modalOverlayZindexCSS'}
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            {inputType?.fieldType?.length > 0 && !isProductionEnv && (
                                <Col sm={6}>
                                    <div className="d-flex gap-3 mt2">
                                        <label className="">{VALIDATION_REQUIRED_LABEL}</label>
                                        <RSSwitch name="validationrequired" control={control} />
                                    </div>
                                </Col>
                            )}
                            {validationrequired ? (
                                <Col sm={12}>
                                    <ValidationRules
                                        inputType={inputType}
                                        validationrequired={validationrequired}
                                        isUpdate={isUpdate}
                                        textDataLength={textDataLength}
                                        StringDataLength={StringDataLength}
                                    />
                                </Col>
                            ) : null}
                            {checkForDateType && (
                                <>
                                    <Col sm={isTimedateFormat ? 7 : dateTimeFormatWatch ? 8 : 12}>
                                        <div className="form-group">
                                            <RSKendoDropdown
                                                name={'dateTimeFormat'}
                                                control={control}
                                                required
                                                rules={!isUpdate && { required: SELECT_DATE_FORMAT }}
                                                data={dateformats}
                                                textField={'dateFormat'}
                                                dataItemKey={'attributeDateFormatId'}
                                                label={DATEFORMAT_TYPE}
                                                disabled={isUpdate}
                                            />
                                        </div>
                                    </Col>
                                    {checkForDateType && isTimedateFormat && dateTimeFormatWatch && (
                                        <Col sm={2}>
                                            <RSCheckbox
                                                control={control}
                                                name="isTime"
                                                labelName={ISTIME}
                                                popover
                                                popover_overlayClass={'modalOverlayZindexCSS'}
                                                popover_class={'top2 pl5'}
                                                popover_icon={`${circle_question_mark_mini}  icon-xs color-primary-blue mr0`}
                                                popover_position="top"
                                                popover_content={ISTIME}
                                                disabled={isUpdate && editData?.isTime}
                                            />
                                        </Col>
                                    )}
                                    {checkForDateType && dateTimeFormatWatch && (
                                        <Col sm={isTimedateFormat ? 3 : 4}>
                                            <RSCheckbox
                                                control={control}
                                                name="isAnnualReminder"
                                                labelName={ISANNUALREMINDER}
                                                containerClass="float-end"
                                                popover
                                                popover_overlayClass={'modalOverlayZindexCSS'}
                                                popover_class={'top2 pl5'}
                                                popover_icon={`${circle_question_mark_mini}  icon-xs color-primary-blue mr0`}
                                                popover_position="top"
                                                popover_content={ISANNUALREMINDER_DESCRIPTION}
                                                disabled={isUpdate && editData?.isAnnualReminder}
                                            />
                                        </Col>
                                    )}
                                </>
                            )}
                            <Col sm={12} id="rs_NewAttributeModal_dataType">
                                <div className="form-group mb21">
                                    <RSKendoDropdown
                                        name={'dataType'}
                                        control={control}
                                        data={sortdatatypes}
                                        required
                                        disabled={isUpdate || addAudience}
                                        textField={'dataTypeName'}
                                        dataItemKey={'dataTypeId'}
                                        label={DATA_TYPE}
                                        rules={!isUpdate && { required: SELECT_DATA_TYPE }}
                                    />
                                    <div className="float-end">
                                        <RSTooltip
                                            text={SELECT_DATATYPE_HELP}
                                            popover_overlayClass={'modalOverlayZindexCSS'}
                                        >
                                            <i
                                                className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                id="circle_question_mark"
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                </div>
                            </Col>

                            {dataType?.dataTypeId === 2 && (
                                <TransactionData isUpdate={isUpdate} catType={catType} editData={editData} />
                            )}
                            {dataType?.dataTypeId === 3 && <KPIData isUpdate={isUpdate} />}
                        </Row>

                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name={'filterGroup'}
                                        control={control}
                                        data={sortedData}
                                        // required={!isCapType}
                                        textField={'filterGroupName'}
                                        dataItemKey={'filterGroupId'}
                                        label={FILTER_GROUP}
                                        // rules={!isUpdate && capTypeRules('filterGroup')}
                                        disabled={isUpdate || isCapType}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSMultiSelect
                                        control={control}
                                        name={'classification'}
                                        data={classifications}
                                        textField={'dataClassificationName'}
                                        dataItemKey={'dataClassificationId'}
                                        placeholder="Classification"
                                        label={CLASSIFICATION}
                                        disabled={isUpdate}
                                        handleChange={handleChange}
                                        isCustomRender
                                        itemRender={(ele, props) =>
                                            mapToItemRender(ele, props, disabledItems())
                                        }
                                    />
                                </div>
                            </Col>
                        </Row>
                        {classification?.some((clas)=>clas?.dataClassificationName === 'Sensitive data') && !isProductionEnv && (
                            <Row className="form-group">
                                <Col sm={3} className="d-flex pr0">
                                    <label>Data masking</label></Col>
                                <Col sm={6} className="d-flex pr0">
                                    <div className="d-flex">
                                        {SENSITIVE_DATA_MASKING_OPTIONS.map((option) => (
                                            <div key={option}>
                                                <RSRadioButton
                                                    control={control}
                                                    name={'sensitiveDatavalue'}
                                                    labelName={option}
                                                    rules={{ required: THIS_FIELD_IS_REQUIRED }}
                                                    handleChange={(e) => {
                                                        clearErrors('digitstoshow');
                                                        if (e.target.value !== SENSITIVE_DATA_MASKING_OPTIONS[1]) {
                                                            setValue('digitstoshow', '');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                                {sensitiveDatavalue === SENSITIVE_DATA_MASKING_OPTIONS[1] && !isProductionEnv &&  (
                                    <Col sm={3}>
                                        <RSInput
                                            type={'text'}
                                            name={'digitstoshow'}
                                            control={control}
                                            required={sensitiveDatavalue === SENSITIVE_DATA_MASKING_OPTIONS[1]}
                                            placeholder={'Digits to show'}
                                            rules={{
                                                required: ENTER_VALUE,
                                                validate: (value) => {
                                                    if (value <= 0) {
                                                        return 'Enter valid value';
                                                    } else if (value > 3) {
                                                        return 'Value less than or equal to 3';
                                                    }
                                                }
                                            }}
                                            maxLength={1}
                                        />
                                    </Col>
                                )}
                            </Row>
                        )}
                        {_findIndex(classification, ['dataClassificationId', 3]) !== -1 && (
                            <Row>
                                <Col sm={12}>
                                    <div className="form-group">
                                        <RSInput
                                            type={'text'}
                                            name={'fallbackAttributeName'}
                                            control={control}
                                            required={brandIdWatch ? false : true}
                                            placeholder={FALLBACK_ATTRIBUTE_NAME}
                                            rules={brandIdWatch ? {} : FALLBACK_ATTRIBUTE_RULES}
                                        // disabled={isUpdate}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        )}
                        <div className="buttons-holder m0">
                            <Row>
                                <Col>
                                    <RSSecondaryButton
                                        onClick={() => handlePopup()}
                                        id="rs_NewAttributeModal_Cancel"
                                        blockInteraction={isSubmitting}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        type="button"
                                        disabledClass={`${isUpdate && !isDirty ? 'pe-none click-off' : ''} 
                                        ${(nameValid && isDirty) || isUpdate ? '' : 'pe-none click-off'}
                                        ${!isUpdate && !isValid ? 'click-off' : ''}
                                        ${isSubmitting ? 'pe-none click-off' : ''}`}
                                        id="rs_NewAttributeModal_Save"
                                        isLoading={isSubmitting}
                                        blockBodyPointerEvents={isSubmitting}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            formSubmit(handleSubmit)(e);
                                        }}
                                    >
                                        {isUpdate ? UPDATE : SAVE}
                                    </RSPrimaryButton>
                                </Col>
                            </Row>
                        </div>
                    </form>
                    )
                }
            />
            <RSModal
                size={'md'}
                show={isShowMsgModal && !warningModal?.show}
                header={CONFIRMATION}
                handleClose={() => {
                    setIsShowMsgModal(false);
                }}
                body={
                    <div className="d-flex flex-column align-items-center">
                        <i className={`${circle_thumbs_up_fill_large}  color-primary-green fs75 cursor-normal`} />
                        <div className="mt10">
                            {/* {lastUiPrintableName ? <span className='attribute-popup-msg'>{lastUiPrintableName}</span> : 'Attribute'}  */}
                            {isBrandId
                                ? lastActionType === 'create' || lastActionType === 'update'
                                    ? BRAND_ID_CREATED_SUCCESSFULLY
                                    : ATTRIBUTE_UPDATED_SUCCESSFULLY
                                : lastActionType === 'update'
                                    ? ATTRIBUTE_UPDATED_SUCCESSFULLY
                                    : ATTRIBUTE_SAVED_SUCCESSFULLY}
                        </div>
                    </div>
                }
                footer={
                    <div className="float-right">
                        <RSPrimaryButton onClick={() => setIsShowMsgModal(false)}>{OK}</RSPrimaryButton>
                    </div>
                }
                primaryButton={true}
            />
            <RSConfirmationModal
                show={confirm}
                text={ARE_YOU_SURE_WANT_TO_CHANGE_CONTENT}
                primaryButtonText={OK}
                handleClose={() => {
                    const removed = _filter(classification, function (o) {
                        return o.dataClassificationId !== 5;
                    });
                    setValue('classification', removed);
                    setConfirm(false);
                }}
                handleConfirm={() => {
                    const removed = _filter(classification, function (o) {
                        return o.dataClassificationId !== 4;
                    });
                    setValue('classification', removed);
                    setConfirm(false);
                }}
            />
            <WarningPopup
                show={warningModal?.show}
                handleClose={(type) => {
                    if (type) handleSaveAttribute(payloadData);
                    setWarningModal({
                        show: false,
                        type: type,
                    });
                }}
                name={uIPrintableName}
                text={DO_YOU_WISH_TO_CONTINUE}
                type={'New Attribute'}
                showCancel={true}
                customHeader="Confirmation"
            />
        </FormProvider>
    );
};

export default NewAttributeModal;
