import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { onlyNumbers, onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { _isSingleWord } from './constant';
import { ENTER_GREATEST_VALUE, ENTER_LESSER_VALUE, ENTER_VALID_DATE, ENTER_VALID_NUMBER, SELECT_INPUT_VALUES, SELECT_VALUE } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_WANT_TO_RESET, ENTER_NUMBER, OK, RESET, SELECT } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSInput from 'Components/FormFields/RSInput';
import RSDatePicker from 'Components/FormFields/RSDatePicker';

import { ZERO_DAY_ATTRIBUTE_TYPES, ZERO_DAY_FIELD_NAME, filterValue, getArrayType, solrFieldNameSplit } from 'Pages/AuthenticationModule/Audience/Pages/TargetListCreation/constant';
import { communicationStatus, communicationTypes, channelMap, handleDuplicateAttributes, handleAttributeDropDownWithSortData, handleMultiSelectDropDownData } from '../../constant';
import { update_target_list } from 'Reducers/audience/targetListCreation/reducer';
import { useDispatch, useSelector } from 'react-redux';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { getAttributeValues, GetChannelList } from 'Reducers/audience/targetListCreation/request';
import { getSessionId } from 'Reducers/globalState/selector';

const ZERO_DAY_ATTRIBUTE = ['Contains', 'Not contains'];

const INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH = 15;

const RenderInputs = ({ fieldName, index, targetListContext, field, handleResetCount }) => {
    // console.log('fieldName: ', fieldName);
    const { targetListState, handleZeroDayAttributes, dispatchState } = useContext(targetListContext);
    const {
        filterLabels,
        type,
        attributeTypes,
        isZeroDayFiles,
        virtualValues,
        filterGroups,
        attributesError,
        activeListIndex,
    } = targetListState;
    // console.log('attributeTypes: ', attributeTypes);
    // console.log('filterValue: ', filterValue);
    const dispatch = useDispatch();
    const { control, resetField, setValue, getValues, setError, clearErrors, watch, unregister } = useFormContext();
    const { createdDate } = getUserDetails();
    const {
        attributeType,
        fieldType,
        attributeValue,
        virtualStart,
        virtualEnd,
        attributeValueOne,
        virtualType,
        virtualInput,
        isVirtualSave,
    } = useWatch({
        control,
        name: `${fieldName}.${index}`,
    });
    const watchRule = useWatch({
        control,
        name: fieldName,
    });
    const [isZerodayChange, setIsZerodayChange] = useState(false);
    const [zeroDayRefresh, setZeroDayRefresh] = useState(false);
    const virtualFieldApiCalledRef = useRef(false);
    // const [selectedField, setSelectedField] = useState(isZeroDayFiles ? 'Contains' : 'Is equal to')
    const attributesCount = useWatch({
        control,
        name: `${['attributeslistCount']}.${fieldName}`,
    });

    const attributeField = useWatch({
        control,
        name: `${fieldName}.${index}`,
    });

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [sortedData, setSortedData] = useState([]);

    const [channelListData, setChannelListData] = useState([]);
    const [communicationStatusData, setCommunicationStatusData] = useState([]);

    useEffect(() => {
        handleDuplicates();
    }, []);

    const attributeList = `${fieldName}.${index}`;

    const isPersona = type === 'persona';

    const watchCommunicationType = watch(`${attributeList}.communicationType`);
    const communicationNameValue = watch(`${attributeList}.communicationName`);
    const watchVirtualFields = watch(`${attributeList}.virtualFields`);

    // function checkArrayType(arr) {
    //     if (!Array.isArray(arr)) return 'Not an array';

    //     if (arr.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))) {
    //         return 'Array of objects';
    //     }

    //     if (arr.every((item) => typeof item === 'string')) {
    //         return 'Array of strings';
    //     }

    //     return 'Mixed or other type';
    // }

    // const handleAttributeDropDownWithSortData = (fieldName, filterLabels, attributeField) => {
    //     if (!attributeField?.sOLRFieldName) return [];

    //     const fieldName = attributeField.sOLRFieldName;
    //     let data = filterLabels?.[fieldName] || [];

    //     const noSortFields = [
    //        'ImportDescription_ss',
    //         'FileName_ss',
    //         'Subscriptionform_d',
    //         'v_h_esthhldincome_s',
    //         'v_f_networth_s',
    //         'v_h_home_value_s',
    //         'v_f_creditrating_s',
    //         'ZeroDayFiles',
    //         "v_h_esthhldincome_s",
    //         "v_demo_female_age_group_ss",
    //         "v_demo_male_age_group_ss",
    //         "v_demo_people_age_group_ss",
    //         "v_demo_unknown_gender_age_group_ss",
    //     ];
    //     if (!noSortFields.includes(fieldName)) {
    //         data = data.sort((a, b) => {
    //             if (typeof a === 'string' && typeof b === 'string') {
    //                 return a.localeCompare(b);
    //             }
    //             return 0;
    //         });
    //     }

    //     if (fieldName === 'Remotedatasource_s') {
    //         if (checkArrayType(data) !== 'Array of objects') {
    //             data = data.map((item) => {
    //                 const [name, id] = item.split('|');
    //                 const idSplit = id?.split(':@');
    //                 return { name, id: Number(idSplit[0] || 0) };
    //             });
    //         }
    //     }
    //     if (fieldName === 'Subscriptionform_d') {
    //         if (checkArrayType(data) !== 'Array of objects') {
    //             data = data.map((item) => {
    //                 const [RecipientFormID, FormName] = item.split('|');
    //                 const FormNameSplit = FormName?.split(':@');
    //                 return { FormName: FormNameSplit[0] ?? '', RecipientFormID };
    //             });
    //         }
    //     }
    //     if (fieldName === 'Campaign_name_s') {
    //         if (checkArrayType(data) !== 'Array of objects') {
    //             data = data.map((item) => {
    //                 const [campaignName, campaignShortCode] = item.split('||');
    //                 return { campaignName, campaignShortCode };
    //             });
    //         }
    //     }
    //     return data;
    // };

    useEffect(() => {
        const finalSortData = handleAttributeDropDownWithSortData(fieldName, filterLabels, attributeField);
        setSortedData(finalSortData);
    }, [fieldName, filterLabels]);

    useEffect(() => {
        if (field?.sOLRFieldName === 'Campaign_name_s') {
            const payload = {
                clientId,
                departmentId,
            };

            const fetchChannelList = async () => {
                const response = await dispatch(GetChannelList(payload));

                if (response?.status) {
                    const apiChannels = response?.data?.channels || [];

                    const formattedList = apiChannels.map((channel) => channelMap[channel]).filter(Boolean); // removes null values

                    setChannelListData(formattedList);
                }
            };

            fetchChannelList();
        }
    }, [field, channelMap, clientId, departmentId, dispatch]);

    // Sync status dropdown options from selected channel (survives reset/remount after count API)
    useEffect(() => {
        if (field?.sOLRFieldName === 'Campaign_name_s' && watchCommunicationType?.type && communicationStatus[watchCommunicationType.type]) {
            setCommunicationStatusData(communicationStatus[watchCommunicationType.type]);
        }
    }, [field?.sOLRFieldName, watchCommunicationType?.type]);

    useEffect(() => {
        if (
            (field?.sOLRFieldName === 'Campaign_name_s' || field?.sOLRFieldName === 'Campaign_summary_s') &&
            field?.attributeValue?.length > 0
        ) {
            if (field?.dateValue?.length > 0 && sortedData?.length) {
                const findValue = sortedData?.filter((value) =>
                    field?.dateValue?.some((item) => value?.campaignShortCode === item?.campaignShortCode),
                );
                // console.log('findValue:@@@@@@@@@@@@@@@@@if', findValue);
                setValue(`${attributeList}.communicationName`, findValue);
            }

            if (field?.typeStatus?.length > 0) {
                const findType = communicationTypes?.find(
                    (item) =>
                        item?.type?.replaceAll(' ', '')?.toLowerCase() ===
                        field?.typeStatus[0]?.replaceAll(' ', '')?.toLowerCase(),
                );
                // console.log('findType:@@@@@@@@@@@@@@@@@', findType);
                setValue(`${attributeList}.communicationType`, findType);

                const findStatus = communicationStatus[findType?.type]?.find(
                    (item) => item?.status === field?.typeStatus[1],
                );
                // console.log('findStatus:@@@@@@@@@@@@@@@@@', findStatus);
                setValue(`${attributeList}.communicationStatus`, findStatus);
            }
        }
        if (field?.sOLRFieldName === 'Remotedatasource_s' && field?.attributeType?.length > 0) {
            if (field?.dateValue?.length && sortedData?.length) {
                const findValue = sortedData.filter((e) => e.id === parseInt(field.attributeType, 10));
                // console.log('findValue:@@@@@@@@@@@@@@@@@if rds', findValue);
                setValue(`${attributeList}.attributeType`, findValue[0]);
            }
        }
        if (field?.sOLRFieldName === 'Subscriptionform_d' && field?.attributeType?.length > 0) {
            if (sortedData?.length) {
                const findValue = sortedData?.filter(
                    (e) => parseInt(e.RecipientFormID, 10) === parseInt(field.attributeType, 10),
                );
                // console.log('findValue:@@@@@@@@@@@@@@@@@if rds', findValue);
                setValue(`${attributeList}.attributeType`, findValue[0]);
            }
        }

        const notEligibleHoverCount = ['Campaign_name_s', 'Subscriptionform_d', 'Remotedatasource_s'];
        // handle count value to reset selectvalue
        if (
            field?.attributeValue &&
            parseInt(field?.fieldType, 10) === 1 &&
            filterLabels[field?.sOLRFieldName] &&
            !notEligibleHoverCount?.includes(field?.sOLRFieldName)
        ) {
            if (getArrayType(field?.attributeValue) === 'object') {
                const attributeValue = getValues(`${attributeList}.attributeValue`);
                const updateAttributeValue = attributeValue?.map((value) => {
                    let sData = handleAttributeDropDownWithSortData(fieldName, filterLabels, field)
                    const updateData = handleMultiSelectDropDownData(sData);
                    const matchData = updateData?.find((item) => item?.data === value?.data);
                    if (matchData) {
                        return {
                            ...value,
                            ...matchData,
                        };
                    } else {
                        return value;
                    }
                });
                setValue(`${attributeList}.attributeValue`, updateAttributeValue);
            }
        }
    }, [field, filterLabels, sortedData]);

    useMemo(() => {
        const handleVirtualFieldEditFlow = async () => {
            const currentVirtualData = virtualValues?.[field?.sOLRFieldName];
            if (currentVirtualData?.length) {
                const isLabelexists = field?.sOLRFieldName in filterLabels;
                !isLabelexists && (await handleAttributeValueFetchAPI(field?.virtualFields));
                const findVirtualValue = currentVirtualData?.find(
                    (value) => value?.VirtualDataAttributeName === field?.virtualFields,
                );
                findVirtualValue && setValue(`${attributeList}.virtualFields`, findVirtualValue);
            }
        };
        if (field?.isvirtualfield) {
            handleVirtualFieldEditFlow();
        }
    }, [JSON.stringify(field), JSON.stringify(virtualValues)]);

    const handleFields = ({ index: fieldIndex, type, value }) => {
        if (!isPersona) {
            let tempattributesCount = [...attributesCount];
            tempattributesCount = tempattributesCount?.map((count, countIndex) => {
                // debugger;
                if (fieldIndex <= countIndex) {
                    setValue(`${fieldName}[${countIndex}].isStatus`, false);
                    return [];
                } else {
                    return count;
                }
            });
            // console.log('tempattributesCount: ', tempattributesCount);
            const getAttributeField = { ...attributeField };
            getAttributeField.isStatus = false;
            getAttributeField.attributeType = !!type ? type : getAttributeField.attributeType;
            getAttributeField.attributeValue = !!value ? value : getAttributeField.attributeValue;
            // getAttributeField.attributeValue = '';
            // getAttributeField.attributeValueOne = '';
            // console.log('getAttributeField: ', getAttributeField);
            setValue(`${fieldName}.${index}`, getAttributeField);
            setValue(`${['attributeslistCount']}.${fieldName}`, tempattributesCount);
            if (tempattributesCount?.length) handleResetCount();
            setTimeout(() => {
                handleDuplicates();
            }, 100)

        }
        // Set virtual values api call
    };

    const handleDuplicates = () => {
        // const group = getGroupNameByLists(fieldName);
        // let tempErrors = { ...attributesError };
        // handleDuplicateAttributes dispatches full attributesError (message + *ErrorIndex). Do not dispatch again
        // with a stale { ...attributesError } spread — that overwrites filterListsErrorIndex back to null.
        handleDuplicateAttributes(filterGroups, getValues, attributesError, dispatchState, fieldName, activeListIndex);
    };

    const handleFieldDropdown = (fieldIndex, attri_type = '', value) => {
        let tempattributesCount = [...attributesCount];
        tempattributesCount = tempattributesCount?.map((count, countIndex) => {
            if (fieldIndex <= countIndex) {
                if (fieldName !== 'zeroDayLists') {
                    setValue(`${fieldName}[${countIndex}].isStatus`, false);
                }
                return [];
            } else {
                return count;
            }
        });
        const currentAttributeValue = getValues(`${fieldName}.${index}`) ?? getValues(fieldName)?.[index];
        const getAttributeField = { ...attributeField, ...currentAttributeValue };
        const resolvedAttributeType =
            attri_type === '' || attri_type === 'communicationType' || attri_type === 'communicationStatus'
                ? attributeType ?? currentAttributeValue?.attributeType
                : attri_type;
        getAttributeField.isStatus = false;
        getAttributeField.attributeType = resolvedAttributeType;
        const preserveAttributeValues =
            attri_type === '' ||
            attri_type === 'communicationType' ||
            attri_type === 'communicationStatus';
        if (!preserveAttributeValues) {
            getAttributeField.attributeValue =
                resolvedAttributeType === 'Between' ||
                resolvedAttributeType === 'Not between' ||
                attributeField?.sOLRFieldName === 'Remotedatasource_s' ||
                attributeField?.sOLRFieldName === 'Subscriptionform_d'
                    ? getAttributeField.attributeValue
                    : '';
            getAttributeField.attributeValueOne =
                resolvedAttributeType === 'Between' ||
                resolvedAttributeType === 'Not between' ||
                attributeField?.sOLRFieldName === 'Remotedatasource_s' ||
                attributeField?.sOLRFieldName === 'Subscriptionform_d'
                    ? getAttributeField.attributeValueOne
                    : '';
        }
        getAttributeField.communicationType =
            attri_type === 'communicationType' ? value : getAttributeField.communicationType;
        getAttributeField.communicationStatus =
            attri_type === 'communicationStatus' ? value : getAttributeField.communicationStatus;
        setValue(`${fieldName}.${index}`, getAttributeField);
        setValue(`${['attributeslistCount']}.${fieldName}`, tempattributesCount);
        setTimeout(() => {
            handleDuplicates();
        }, 100)
    };

    const resetfieldType = ({ index: fieldIndex, type, value }) => {
        resetField(`${attributeList}.attributeValue`, {
            defaultValue: '',
            keepDirty: false,
            keepTouched: false,
        });
        resetField(`${attributeList}.virtualFields`, {
            defaultValue: '',
            keepDirty: false,
            keepTouched: false,
        });
        setValue(`${fieldName}.${fieldIndex}.isRunenabled`, false);
        handleFields({ index: fieldIndex, type, value });
    };

    async function handleAttributeValueFetchAPI(virtualValue) {
        let updateWatchRule = watchRule ? watchRule : [];
        const loaderIndex = !updateWatchRule?.length ? 0 : activeListIndex + 1;
        const splitValues = solrFieldNameSplit(attributeField?.sOLRFieldName);
        const splitAttrName = `${splitValues?.before}_${virtualValue}_${splitValues?.last}`;
        let finalAttrPayload = splitValues?.last ? splitAttrName : attributeField?.sOLRFieldName;
        const payload = {
            attributeName: finalAttrPayload,
            clientId,
            userId,
            departmentId,
            partnerID: 0,
        };
        const response = await dispatch(
            getAttributeValues(payload, dispatchState, attributeField?.sOLRFieldName, loaderIndex, true),
        );
        return response?.status ? response?.data : [];
    }

    const handleVirtualField = async (val) => {
        let notEligibleCall = [3, 4, 8];
        let notEligibleCallInSolrFieldName = ['Campaign_summary_s'];
        if (
            !notEligibleCall?.includes(parseInt(field?.fieldType, 10)) &&
            !notEligibleCallInSolrFieldName?.includes(field?.sOLRFieldName)
        ) {
            setValue(`${fieldName}.${index}.attributeValue`, []);
            let isCustomVirtualAttrValue = val?.value?.VirtualDataAttributeName || '';
            const isLabelexists = field?.sOLRFieldName in filterLabels;
            const response = await handleAttributeValueFetchAPI(isCustomVirtualAttrValue);
        }
        const name = val?.value?.UIPrintableName?.toLowerCase() || '';
        setValue(`${fieldName}.${index}.isVirtualSave`, false);
        setValue(`${fieldName}.${index}.virtualStart`, '');
        setValue(`${fieldName}.${index}.virtualEnd`, '');
        setValue(`${fieldName}.${index}.virtualInput`, '');
        setValue(`${fieldName}.${index}.isStatus`, false);
        setValue(`${fieldName}.${index}.isLoading`, false);
        if (name.includes('custom')) {
            setValue(`${fieldName}.${index}.virtual`, true);
            setValue(`${fieldName}.${index}.virtualType`, 'virtualDate');
        } else if (name?.includes('r(n)')) {
            setValue(`${fieldName}.${index}.virtual`, true);
            setValue(`${fieldName}.${index}.virtualType`, 'virtualInput');
        } else {
            setValue(`${fieldName}.${index}.virtual`, false);
            setValue(`${fieldName}.${index}.virtualType`, 'virtualDefault');
        }
        let tempattributesCount = [...attributesCount];
        tempattributesCount = tempattributesCount?.map((count, countIndex) => {
            if (index <= countIndex) {
                setValue(`${fieldName}[${countIndex}].isStatus`, false);
                return [];
            } else {
                return count;
            }
        });
        setValue(`${['attributeslistCount']}.${fieldName}`, tempattributesCount);
    };
    // console.log(
    //     'Value :::: ',
    //     attributeType,
    //     fieldType,
    //     attributeValue,
    //     virtualStart,
    //     virtualEnd,
    //     attributeValueOne,
    //     targetListState,
    // );

    const VirtualField = () => {
        if (field?.isvirtualfield) {
            return (
                <Col md={field?.sOLRFieldName === 'Campaign_summary_s' ? 0 : 3}>
                    <RSKendoDropDownList
                        control={control}
                        name={`${attributeList}.virtualFields`}
                        data={virtualValues[field.sOLRFieldName]}
                        rules={{
                            required: SELECT_INPUT_VALUES,
                        }}
                        required
                        label={SELECT}
                        textField={'UIPrintableName'}
                        dataItemKey={'VirtualDataAttributeID'}
                        // defaultValue="Is equal to"
                        handleChange={(value) => {
                            handleVirtualField(value);
                        }}
                        // className={attributeValue?.length ? '' : 'click-off'}
                        className={
                            !['Has no value', 'Has value'].includes(attributeType)
                                ? !!attributeValue
                                    ? ''
                                    : 'click-off'
                                : ''
                        }
                    />
                    {virtualType !== 'virtualInput' ? (
                        virtualStart &&
                        virtualEnd &&
                        isVirtualSave && (
                            <p className="position-absolute">
                                {/* ({dateFormat(virtualStart)}-{dateFormat(virtualEnd)}) */}(
                                {getUserCurrentFormat(virtualStart)?.dateFormat} -{' '}
                                {getUserCurrentFormat(virtualEnd)?.dateFormat})
                            </p>
                        )
                    ) : virtualInput && isVirtualSave ? (
                        <p className="position-absolute">{virtualInput}</p>
                    ) : null}
                </Col>
            );
        } else return null;
    };

    const handleTextFieldDataItemKeyTypeDynamic = () => {
        if (attributeField.sOLRFieldName === 'Subscriptionform_d') {
            return {
                textField: 'FormName',
                dataItemKey: 'RecipientFormID',
            };
        } else {
            return {
                textField: 'name',
                dataItemKey: 'id',
            };
        }
    };

    const getRenderTwoDatePickerComponent = () => {
        return (
            <>
                <Col md={3}>
                    <>
                        <RSKendoDropDownList
                            control={control}
                            name={`${attributeList}.attributeType`}
                            required
                            label={SELECT}
                            data={sortedData}
                            // defaultValue={sortedData[0]}
                            textField={handleTextFieldDataItemKeyTypeDynamic().textField}
                            dataItemKey={handleTextFieldDataItemKeyTypeDynamic().dataItemKey}
                            handleChange={(e) => {
                                resetField(`${attributeList}.attributeValue`, {
                                    defaultValue: '',
                                    keepDirty: false,
                                    keepTouched: false,
                                });
                                handleFieldDropdown(index, e.value);
                            }}
                        />
                    </>
                </Col>
                <Col md={6}>
                    <div className="d-flex justify-content-between attr_error">
                        <RSDatePicker
                            control={control}
                            name={`${attributeList}.attributeValue`}
                            format={'dd MMM yyyy'}
                            isTargetList
                            rules={{
                                required: ENTER_VALID_DATE,
                                validate: (dateValueOne) =>
                                    new Date(dateValueOne).getTime() > new Date(attributeValueOne).getTime()
                                        ? ENTER_LESSER_VALUE
                                        : true,
                            }}
                            required
                            handleChange={() => {
                                if (!isPersona) {
                                    handleFieldDropdown(index);
                                    // handleFields(index);
                                }
                            }}
                            {...(field?.sOLRFieldName === 'Remotedatasource_s' ||
                                field?.sOLRFieldName === 'Subscriptionform_d'
                                ? { min: new Date(createdDate) }
                                : {})}
                        />
                        <label className="px15">To</label>
                        <RSDatePicker
                            control={control}
                            format={'dd MMM yyyy'}
                            isTargetList
                            name={`${attributeList}.attributeValueOne`}
                            required
                            rules={{
                                required: ENTER_VALID_DATE,
                                validate: (dateValueOne) =>
                                    new Date(dateValueOne).getTime() < new Date(attributeValue).getTime()
                                        ? ENTER_GREATEST_VALUE
                                        : true,
                            }}
                            handleChange={() => {
                                if (!isPersona) {
                                    // handleFields(index);
                                    handleFieldDropdown(index);
                                }
                            }}
                            {...(field?.sOLRFieldName === 'Remotedatasource_s' ||
                                field?.sOLRFieldName === 'Subscriptionform_d'
                                ? { min: new Date(createdDate) }
                                : {})}
                        />
                    </div>
                </Col>
            </>
        );
    };

    // const handleMultiSelectDropDownData = (data) => {
    //     const finalData = data?.map((item, index) => {
    //         const splitValue = item?.split(':@');
    //         const value = splitValue[0] ?? '';
    //         const count = splitValue[1]?.split('@;')[1] ?? 0;
    //         return {
    //             id: index,
    //             data: value,
    //             count,
    //         };
    //     });
    //     return finalData;
    // };
    
    const handleCampaignSummmaryRenderField = () => {
        const isCampaignSummaryHasType = attributeType === 'Has no value' || attributeType === 'Has value';
        return (
            <>
                <Col>
                    <>
                        <RSKendoDropDownList
                            control={control}
                            name={`${attributeList}.communicationType`}
                            required
                            textField={'label'}
                            dataItemKey={'id'}
                            label={SELECT_VALUE}
                            data={communicationTypes}
                            handleChange={(e) => {
                                if (e.value?.type && communicationStatus[e.value?.type]) {
                                    const statusData = communicationStatus[e.value?.type];
                                    setCommunicationStatusData(statusData);
                                    setValue(`${attributeList}.communicationStatus`, null);
                                }
                                handleFieldDropdown(index, 'communicationType', e.value);
                            }}
                        />
                    </>
                </Col>
                <Col>
                    <>
                        <RSKendoDropDownList
                            control={control}
                            name={`${attributeList}.communicationStatus`}
                            required
                            textField={'label'}
                            dataItemKey={'id'}
                            label={SELECT_VALUE}
                            data={communicationStatus[watchCommunicationType?.type] || []}
                            key={`${watchCommunicationType?.type}-${communicationStatusData?.length || 0}`}
                            handleChange={(e) => {
                                handleFieldDropdown(index, 'communicationStatus', e.value);
                            }}
                        />
                    </>
                </Col>
                <Col sm={2}>
                    <RSKendoDropDownList
                        control={control}
                        name={`${attributeList}.attributeType`}
                        required
                        data={Object.values(attributeTypes?.Integer).filter((type) => type !== 'Between')}
                        label={SELECT_VALUE}
                        isTagRender
                        handleChange={(e) => {
                            clearErrors(`${attributeList}.attributeValue`);
                            // Reset attributeValue field when switching to "Has value" or "Has no value"
                            if (e.value === 'Has value' || e.value === 'Has no value') {
                                setValue(`${attributeList}.attributeValue`, '');
                            }
                            // Reset attributeValue field when switching to "Has value" or "Has no value"
                            if (e.value === 'Has value' || e.value === 'Has no value') {
                                setValue(`${attributeList}.attributeValue`, '');
                            }
                            handleFieldDropdown(index, e.value);
                        }}
                    />
                </Col>
                <Col className="position-relative">
                    <RSInput
                        control={control}
                        name={`${attributeList}.attributeValue`}
                        id={
                            isCampaignSummaryHasType
                                ? 'rs_RenderInputs_attributeselectinputs_disabled'
                                : 'rs_RenderInputs_attributeselectinputs'
                        }
                        maxLength={INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH}
                        disabled={isCampaignSummaryHasType}
                        required={!isCampaignSummaryHasType}
                        // rules={
                        //     !isCampaignSummaryHasType
                        //         ? {
                        //               required: SELECT_INPUT_VALUES,
                        //               validate: (value) => _isSingleWord(value),
                        //           }
                        //         : {}
                        // }
                        handleOnchange={() => {
                            if (!isCampaignSummaryHasType) {
                                handleFieldDropdown(index);
                            }
                        }}
                    />
                </Col>
            </>
        );
    };

    const getOperatorsList = () => {
        const originalData = fieldName === 'zeroDayLists'
            ? Object.values(ZERO_DAY_ATTRIBUTE_TYPES)
            : Object.keys(attributeTypes)?.length === 0
                ? Object.values(filterValue?.String)
                : Object.values(attributeTypes?.String);
        if (field?.sOLRFieldName === 'Channel_s') {
            const allowedOperators = ['Is equal to', 'Is not equal to', 'Contains', 'Not contains'];
            return originalData.filter((item) => allowedOperators.includes(item));
        }
        return originalData;
    };

    switch (fieldType) {
        case '3': //decimalFormat
        case 3:
            const isAttribute = attributeType === 'Between';
            const isTypeHas = attributeType === 'Has no value' || attributeType === 'Has value';
            return (
                <Fragment>
                    {field?.sOLRFieldName === 'Subscriptionform_d' ? (
                        getRenderTwoDatePickerComponent()
                    ) : (
                        <Fragment>
                            <Col md={3}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={`${attributeList}.attributeType`}
                                    required
                                    data={
                                        attributeTypes?.length === 0
                                            ? Object.values(filterValue?.Integer)
                                            : Object.values(attributeTypes?.Integer)
                                    }
                                    defaultValue="Is equal to"
                                    handleChange={(e) => {
                                        unregister(`${attributeList}.attributeValue`)
                                        unregister(`${attributeList}.attributeValueOne`)
                                        setValue(`${attributeList}.attributeValue`, '')
                                        setValue(`${attributeList}.attributeValueOne`, '')
                                        clearErrors(`${attributeList}.attributeValue`);
                                        clearErrors(`${attributeList}.attributeValueOne`);
                                        handleFieldDropdown(index, e.value);
                                        //   resetfieldType({ index, type: e?.value, value: undefined });
                                    }}
                                />
                            </Col>
                            <Col md={field?.isvirtualfield && isAttribute ? 4 : field?.isvirtualfield ? 3 : 6}>
                                <div className="d-flex justify-content-between">
                                    {!isAttribute && !isTypeHas && (
                                        <RSInput
                                            control={control}
                                            name={`${attributeList}.attributeValue`}
                                            id="rs_RenderInputs_attributeValueList"
                                            onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                            required
                                            rules={{
                                                required: ENTER_VALID_NUMBER,
                                                // validate: (value) => {
                                                //     const findIndex = value.indexOf('.');
                                                //     if (findIndex === -1 && value.includes('.')) {
                                                //         return ENTER_GREATEST_VALUE;
                                                //     }
                                                //     return true;
                                                // },
                                            }}
                                            disabled={isTypeHas ? true : false}
                                            handleOnchange={(e) => {
                                                if (!isPersona) {
                                                    // let temp = {
                                                    //     index,
                                                    //     type: undefined,
                                                    //     value: e.target.value,
                                                    // };
                                                    // handleFields(temp);
                                                    handleFieldDropdown(index);
                                                }
                                            }}
                                            //  type="number"
                                            isNumber
                                            placeholder={ENTER_NUMBER}
                                        />
                                    )}
                                    {isAttribute && (
                                        <>
                                            <RSInput
                                                control={control}
                                                name={`${attributeList}.attributeValue`}
                                                id="rs_RenderInputs_Lesservalue"
                                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                required
                                                rules={{
                                                    required: ENTER_VALID_NUMBER,
                                                    validate: (value) => {
                                                        if (parseInt(value, 10) >= parseInt(attributeValueOne, 10)) {
                                                            return ENTER_LESSER_VALUE;
                                                        }
                                                        return true;
                                                    },
                                                }}
                                                disabled={isTypeHas ? true : false}
                                                handleOnchange={({ target: { value } }) => {
                                                    if (parseInt(value, 10) <= parseInt(attributeValueOne, 10)) {
                                                        clearErrors(`${attributeList}.attributeValueOne`);
                                                    }
                                                    if (!isPersona) {
                                                        // let temp = {
                                                        //     index,
                                                        //     type: undefined,
                                                        //     value,
                                                        // };
                                                        // handleFields(temp);
                                                        handleFieldDropdown(index);
                                                    }
                                                }}
                                                //type="number"
                                                isNumber
                                                placeholder={ENTER_NUMBER}
                                            />
                                            <label className="px15">To</label>
                                            <RSInput
                                                control={control}
                                                name={`${attributeList}.attributeValueOne`}
                                                id="rs_RenderInputs_greatestvalue"
                                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                required
                                                rules={{
                                                    required: ENTER_VALID_NUMBER,
                                                    validate: (valueOne) => {
                                                        if (
                                                            parseFloat(valueOne, 10) <= parseFloat(attributeValue, 10)
                                                        ) {
                                                            return ENTER_GREATEST_VALUE;
                                                        }
                                                        return true;
                                                    },
                                                }}
                                                handleOnchange={({ target: { value } }) => {
                                                    if (parseFloat(value, 10) >= parseFloat(attributeValue, 10)) {
                                                        clearErrors(`${attributeList}.attributeValue`);
                                                    }
                                                    if (!isPersona) {
                                                        // let temp = {
                                                        //     index,
                                                        //     type: undefined,
                                                        //     value,
                                                        // };
                                                        // handleFields(temp);
                                                        handleFieldDropdown(index);
                                                    }
                                                }}
                                                //  type="number"
                                                isNumber
                                                placeholder={ENTER_NUMBER}
                                            />
                                        </>
                                    )}
                                    {isTypeHas && (
                                        <RSInput control={control} name={`${attributeList}.attributeSample`} disabled />
                                    )}
                                </div>
                            </Col>
                        </Fragment>
                    )}

                    {field?.isvirtualfield && VirtualField()}
                </Fragment>
            );
        case '4':
        case 4:
            const isNumericType = attributeType === 'Between';
            const isNumericTypeHas = attributeType === 'Has no value' || attributeType === 'Has value';
            return (
                <Fragment>
                    <Col md={3}>
                        <RSKendoDropDownList
                            control={control}
                            name={`${attributeList}.attributeType`}
                            required
                            data={
                                attributeTypes?.length === 0
                                    ? Object.values(filterValue?.Integer)
                                    : Object.values(attributeTypes?.Integer)
                            }
                            defaultValue="Is equal to"
                            handleChange={(e) => {
                                unregister(`${attributeList}.attributeValue`)
                                unregister(`${attributeList}.attributeValueOne`)
                                setValue(`${attributeList}.attributeValue`, '')
                                setValue(`${attributeList}.attributeValueOne`, '')
                                clearErrors(`${attributeList}.attributeValue`);
                                clearErrors(`${attributeList}.attributeValueOne`);
                                handleFieldDropdown(index, e.value);
                                // resetfieldType({ index, type: e?.value, value: undefined });
                            }}
                        />
                    </Col>
                    <Col md={field?.isvirtualfield && isNumericType ? 4 : field?.isvirtualfield ? 3 : 6}>
                        <div className="d-flex justify-content-between onlynumberinput">
                            {!isNumericType && !isNumericTypeHas && (
                                <RSInput
                                    control={control}
                                    name={`${attributeList}.attributeValue`}
                                    id="rs_RenderInputs_onlynumber"
                                    onKeyDown={onlyNumbers}
                                    maxLength={INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH}
                                    required
                                    rules={{
                                        required: ENTER_VALID_NUMBER,
                                    }}
                                    disabled={isNumericTypeHas ? true : false}
                                    handleOnBlur={() => {
                                        if (!isPersona) {
                                            handleFieldDropdown(index);
                                        }
                                    }}
                                    placeholder={ENTER_NUMBER}
                                />
                            )}
                            {isNumericType && (
                                <>
                                    <RSInput
                                        control={control}
                                        name={`${attributeList}.attributeValue`}
                                        onKeyDown={onlyNumbers}
                                        id="rs_RenderInputs_onlyvalidnumber"
                                        // type={'number'}
                                        maxLength={INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH}
                                        required
                                        rules={{
                                            required: ENTER_VALID_NUMBER,
                                            validate: (value) => {
                                                if (parseInt(value, 10) >= parseInt(attributeValueOne, 10)) {
                                                    return ENTER_LESSER_VALUE;
                                                }
                                                return true;
                                            },
                                        }}
                                        //  disabled={isNumericTypeHas ? true : false}
                                        handleOnBlur={({ target: { value } }) => {
                                            if (parseInt(value, 10) <= parseInt(attributeValueOne, 10)) {
                                                clearErrors(`${attributeList}.attributeValueOne`);
                                            }
                                            if (!isPersona) {
                                                // let temp = {
                                                //     index,
                                                //     type: undefined,
                                                //     value: e.target.value,
                                                // };
                                                handleFieldDropdown(index);
                                                // handleFields(temp);
                                            }
                                        }}
                                        placeholder={ENTER_NUMBER}
                                    />
                                    <label className="px15">To</label>
                                    <RSInput
                                        control={control}
                                        name={`${attributeList}.attributeValueOne`}
                                        id="rs_RenderInputs_attributevaluecontrol"
                                        onKeyDown={onlyNumbers}
                                        maxLength={INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH}
                                        required
                                        rules={{
                                            required: ENTER_VALID_NUMBER,
                                            validate: (valueOne) => {
                                                if (parseInt(valueOne, 10) <= parseInt(attributeValue, 10)) {
                                                    return ENTER_GREATEST_VALUE;
                                                }
                                                return true;
                                            },
                                        }}
                                        handleOnBlur={({ target: { value } }) => {
                                            if (parseInt(value, 10) >= parseInt(attributeValue, 10)) {
                                                clearErrors(`${attributeList}.attributeValue`);
                                            }
                                            if (!isPersona) {
                                                handleFieldDropdown(index);
                                            }
                                        }}
                                        // handleOnchange={({ target: { value } }) => {
                                        //     if (parseInt(value) >= parseInt(attributeValue)) {
                                        //         clearErrors(`${attributeList}.attributeValue`);
                                        //     }
                                        //     //  if (!isPersona) {
                                        //     // let temp = {
                                        //     //     index,
                                        //     //     type: undefined,
                                        //     //     value,
                                        //     // };
                                        //     handleFieldDropdown(index);
                                        //     // handleFields(temp);
                                        //     // }
                                        // }}
                                        placeholder={ENTER_NUMBER}
                                    />
                                </>
                            )}
                            {isNumericTypeHas && (
                                <RSInput
                                    control={control}
                                    name={`${attributeList}.attributeSample`}
                                    disabled
                                    maxLength={INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH}
                                />
                            )}
                        </div>
                    </Col>
                    {field?.isvirtualfield && VirtualField()}
                </Fragment>
            );
        case '8':
        case 8:
            const isDateType = attributeType === 'Between' || attributeType === 'Not between';
            const isDateTypeHas = attributeType === 'Has no value' || attributeType === 'Has value';
            // console.log('isDateTypeHas: ', isDateTypeHas);
            return (
                <Fragment>
                    <Col md={3}>
                        <RSKendoDropDownList
                            control={control}
                            name={`${attributeList}.attributeType`}
                            data={[
                                'Is equal to',
                                'Is not equal to',
                                'Is after or equal to',
                                'Is after',
                                'Is before or equal to',
                                'Is before',
                                'Between',
                                // 'Not between',
                                'Has no value',
                                'Has value',
                            ]}
                            required
                            defaultValue="Is equal to"
                            handleChange={(e) => {
                                unregister(`${attributeList}.attributeValue`)
                                unregister(`${attributeList}.attributeValueOne`)
                                setValue(`${attributeList}.attributeValue`, '')
                                setValue(`${attributeList}.attributeValueOne`, '')
                                clearErrors(`${attributeList}.attributeValue`);
                                clearErrors(`${attributeList}.attributeValueOne`);
                                handleFieldDropdown(index, e.value);
                                // resetfieldType({ index, type: e?.value, value: undefined });
                            }}
                        />
                    </Col>
                    <Col md={field?.isvirtualfield && isDateType ? 4 : field?.isvirtualfield ? 3 : 6}>
                        <div className="d-flex justify-content-between">
                            {!isDateType && !isDateTypeHas && (
                                <RSDatePicker
                                    control={control}
                                    name={`${attributeList}.attributeValue`}
                                    rules={{ required: ENTER_VALID_DATE }}
                                    required
                                    disabled={isDateTypeHas ? true : false}
                                    format={'dd MMM yyyy'}
                                    handleChange={() => {
                                        if (!isPersona) {
                                            handleFieldDropdown(index);
                                            // handleFields(index);
                                        }
                                    }}
                                    isTargetList
                                />
                            )}
                            {isDateType && (
                                <>
                                    <RSDatePicker
                                        control={control}
                                        name={`${attributeList}.attributeValue`}
                                        format={'dd MMM yyyy'}
                                        isTargetList
                                        rules={{
                                            required: ENTER_VALID_DATE,
                                            validate: (dateValueOne) =>
                                                new Date(dateValueOne).getTime() > new Date(attributeValueOne).getTime()
                                                    ? ENTER_LESSER_VALUE
                                                    : true,
                                        }}
                                        required
                                        disabled={isDateTypeHas ? true : false}
                                        handleChange={() => {
                                            if (!isPersona) {
                                                handleFieldDropdown(index);
                                                // handleFields(index);
                                            }
                                        }}
                                    />
                                    <label className="px15">To</label>
                                    <RSDatePicker
                                        control={control}
                                        name={`${attributeList}.attributeValueOne`}
                                        format={'dd MMM yyyy'}
                                        isTargetList
                                        required
                                        rules={{
                                            required: ENTER_VALID_DATE,
                                            validate: (dateValueOne) =>
                                                new Date(dateValueOne).getTime() < new Date(attributeValue).getTime()
                                                    ? ENTER_GREATEST_VALUE
                                                    : true,
                                        }}
                                        handleChange={() => {
                                            if (!isPersona) {
                                                // handleFields(index);
                                                handleFieldDropdown(index);
                                            }
                                        }}
                                    />
                                </>
                            )}
                            {isDateTypeHas && (
                                <RSDatePicker
                                    control={control}
                                    format={'dd MMM yyyy'}
                                    isTargetList
                                    name={`${attributeList}.attributeSample`}
                                    className="click-off"
                                    disabled={true}
                                />
                            )}
                        </div>
                    </Col>
                    {field?.isvirtualfield && VirtualField()}
                </Fragment>
            );
        default:
            const isAttributeType =
                attributeType === 'Like' ||
                attributeType === 'Does not like' ||
                attributeType === 'Starts with' ||
                attributeType === 'Ends with';
            const isAttributeValue = attributeType === 'Has no value' || attributeType === 'Has value';
            return (
                <Fragment>
                    {/* {!isPersona && ( */}
                    {field?.sOLRFieldName === 'Campaign_name_s' ? (
                        <>
                            <Col md={3} className={'tl-custom-wd-mutliselect'}>
                                <>
                                    <RSMultiSelect
                                        control={control}
                                        name={`${attributeList}.communicationName`}
                                        required
                                        data={sortedData ?? []}
                                        dataItemKey="campaignShortCode"
                                        textField="campaignName"
                                        rules={{
                                            required: SELECT_INPUT_VALUES,
                                            validate: (value) => {
                                                if (value?.length > 25) {
                                                    return 'Recommended max. 25 Data values ';
                                                }
                                                return true;
                                            },
                                        }}
                                        // defaultValue={[]}
                                        handleChange={(value) => {
                                            if (value?.value?.length > 25) {
                                                setError(`${attributeList}.attributeValue`, {
                                                    type: 'custom',
                                                    message: 'Recommended max. 25 Data values ',
                                                });
                                                return;
                                            } else {
                                                if (!isPersona) {
                                                    // const getAttributeField = { ...attributeField };
                                                    // getAttributeField.isStatus = false;
                                                    // getAttributeField.attributeValue = '';
                                                    // setValue(`${fieldName}.${index}`, getAttributeField);
                                                    handleFieldDropdown(index);
                                                }
                                            }
                                        }}
                                        handleOnBlur={() => {
                                            handleDuplicates();
                                        }}
                                        placeholder="Select.."
                                    />
                                </>
                            </Col>
                            <Col md={3}>
                                <>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${attributeList}.communicationType`}
                                        required
                                        textField={'label'}
                                        dataItemKey={'id'}
                                        label={SELECT_VALUE}
                                        // data={communicationTypes}
                                        data={channelListData}
                                        // defaultValue={communicationTypes[0]}
                                        handleChange={(e) => {
                                            if (e.value?.type && communicationStatus[e.value?.type]) {
                                                const statusData = communicationStatus[e.value?.type];
                                                setCommunicationStatusData(statusData);
                                                setValue(`${attributeList}.communicationStatus`, null);
                                            }
                                            handleFieldDropdown(index, 'communicationType', e.value);
                                        }}
                                        disabled={!communicationNameValue || communicationNameValue?.length === 0}
                                    />
                                </>
                            </Col>
                            <Col md={3}>
                                <>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${attributeList}.communicationStatus`}
                                        required
                                        textField={'label'}
                                        dataItemKey={'id'}
                                        label={SELECT_VALUE}
                                        data={communicationStatusData}
                                        key={`${watchCommunicationType?.type}-${communicationStatusData?.length || 0}`}
                                        // defaultValue={communicationStatus['Email'][0]}
                                        handleChange={(e) => {
                                            handleFieldDropdown(index, 'communicationStatus', e.value);
                                        }}
                                        disabled={!communicationNameValue || communicationNameValue?.length === 0}
                                    />
                                </>
                            </Col>
                        </>
                    ) : field?.sOLRFieldName === 'Remotedatasource_s' ? (
                        getRenderTwoDatePickerComponent()
                    ) : field?.sOLRFieldName === 'Campaign_summary_s' ? (
                        handleCampaignSummmaryRenderField()
                    ) : (
                        <>
                            {true && (
                                <Col md={3}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${attributeList}.attributeType`}
                                        required
                                        placeholder={SELECT_VALUE}
                                        data={getOperatorsList()}
                                        // defaultValue={isZeroDayFiles ? 'Contains' : 'Is equal to'}
                                        defaultValue={'Is equal to'}
                                        handleChange={(e) => {
                                            // console.log('e: ', e.value);
                                            resetField(`${attributeList}.attributeValue`, {
                                                defaultValue: '',
                                                keepDirty: false,
                                                keepTouched: false,
                                            });
                                            handleFieldDropdown(index, e.value);
                                        }}
                                        disabled={field?.sOLRFieldName === ZERO_DAY_FIELD_NAME}
                                    />
                                </Col>
                            )}
                            <Col
                                md={field?.isvirtualfield && isAttributeType ? 4 : field?.isvirtualfield ? 3 : 6}
                                className="position-relative"
                            >
                                {isAttributeType && !isAttributeValue && (
                                    <RSInput
                                        control={control}
                                        // onKeyDown={onKeyChar}
                                        name={`${attributeList}.attributeValue`}
                                        id="rs_RenderInputs_attributeselectinputs"
                                        maxLength={INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH}
                                        required
                                        rules={{
                                            required: SELECT_INPUT_VALUES,
                                            validate: (value) => _isSingleWord(value),
                                        }}
                                        placeholder={'All'}
                                        handleOnchange={() => {
                                            // if (!isPersona) {
                                            // const getAttributeField = { ...attributeField };
                                            // getAttributeField.isStatus = false;
                                            // getAttributeField.attributeValue = '';
                                            // setValue(`${fieldName}.${index}`, getAttributeField);
                                            handleFieldDropdown(index);

                                            // }
                                        }}
                                    />
                                )}
                                {!isAttributeType && !isAttributeValue && (
                                    <>
                                        <RSMultiSelect
                                            control={control}
                                            filterable
                                            name={`${attributeList}.attributeValue`}
                                            required
                                            data={handleMultiSelectDropDownData(sortedData)}
                                            rules={{
                                                required: SELECT_INPUT_VALUES,
                                                validate: (value) => {
                                                    if (value?.length > 25) {
                                                        return 'Recommended max. 25 Data values ';
                                                    }
                                                    return true;
                                                },
                                            }}
                                            disabled={
                                                (field?.sOLRFieldName === ZERO_DAY_FIELD_NAME) &&
                                                (isZerodayChange ||
                                                    (getValues('isZerodayDisable') &&
                                                        field?.attributeValue &&
                                                        index === 0))
                                            }
                                            defaultValue={[]}
                                            className={`${((field?.sOLRFieldName === ZERO_DAY_FIELD_NAME) &&
                                                isZerodayChange &&
                                                field?.attributeValue) ||
                                                ((field?.sOLRFieldName === ZERO_DAY_FIELD_NAME) &&
                                                    getValues('isZerodayDisable') &&
                                                    field?.attributeValue)
                                                ? 'click-off'
                                                : ''
                                                }`}
                                            handleChange={(value) => {
                                                if (field?.sOLRFieldName == ZERO_DAY_FIELD_NAME && value?.value?.length === 1) {
                                                    setValue('isResetSearchInput', true);
                                                    setValue('isZerodayDisable', true);
                                                    setIsZerodayChange(true);
                                                    handleZeroDayAttributes(value?.value[0]?.data);
                                                } else {
                                                    if (value?.value?.length > 25) {
                                                        setError(`${attributeList}.attributeValue`, {
                                                            type: 'custom',
                                                            message: 'Recommended max. 25 Data values ',
                                                        });
                                                        return;
                                                    } else {
                                                        if (!isPersona) {
                                                            // const getAttributeField = { ...attributeField };
                                                            // getAttributeField.isStatus = false;
                                                            // getAttributeField.attributeValue = '';
                                                            // setValue(`${fieldName}.${index}`, getAttributeField);
                                                            handleFieldDropdown(index);
                                                        }
                                                    }
                                                }
                                            }}
                                            placeholder="Select.."
                                            allowCustom
                                            isTagRender
                                            dataItemKey={'id'}
                                            textField={'data'}
                                        // disabled={field?.nAME === ZERO_DAY_FIELD_NAME && value?.length === 1}
                                        />{' '}
                                        {field?.sOLRFieldName !== ZERO_DAY_FIELD_NAME && (
                                            <small className="position-absolute">Rec. 10 / Max. 25 Data values</small>
                                        )}
                                    </>
                                )}
                                {/* {field?.nAME === ZERO_DAY_FIELD_NAME && (
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${attributeList}.attributeValue`}
                                        required
                                        // data={Object.values(ZERO_DAY_ATTRIBUTE_TYPES)}
                                        data={sortedData}
                                        label="Select"
                                        rules={{
                                            required: SELECT_INPUT_VALUES,
                                        }}
                                        className={'sdf'}
                                        // defaultValue="Is equal to"
                                        handleChange={(value) => {
                                            if (!isPersona) handleZeroDayAttributes(value);
                                        }}
                                    />
                                )} */}

                                {field?.sOLRFieldName === ZERO_DAY_FIELD_NAME && (
                                    <div
                                        className="position-absolute right-40 top6 z-5"
                                        style={{ zIndex: 100 }}
                                        onClick={() => {
                                            setZeroDayRefresh(true);
                                        }}
                                    >
                                        <i className={`${restart_medium} icon-md color-primary-blue z-5 cp`}></i>
                                    </div>
                                )}

                                {isAttributeValue && (
                                    <RSInput
                                        control={control}
                                        name={`${attributeList}.attributeSample`}
                                        disabled
                                        maxLength={INTEGER_ATTRIBUTE_INPUT_MAX_LENGTH}
                                    />
                                )}
                            </Col>
                        </>
                    )}
                    {field?.isvirtualfield && VirtualField()}
                    {zeroDayRefresh && (
                        <RSConfirmationModal
                            show={zeroDayRefresh}
                            text={ARE_YOU_SURE_WANT_TO_RESET}
                            primaryButtonText={OK}
                            isBorder
                            header={RESET}
                            handleClose={() => {
                                setZeroDayRefresh(false);
                            }}
                            handleConfirm={(status) => {
                                const zeroDayLists = getValues('zeroDayLists');
                                const firstZeroDayItem = zeroDayLists[0];

                                const zeroDayFields = zeroDayLists
                                    .filter((item, idx) => idx > 0 && (item?.sOLRFieldName || item?.Field))
                                    .map((item) => item?.sOLRFieldName || item?.Field);

                                const updatedZeroDayLists = [
                                    {
                                        ...firstZeroDayItem,
                                        attributeValue: '',
                                    },
                                ];

                                setValue('zeroDayLists', updatedZeroDayLists);
                                setValue('isZerodayDisable', false);
                                setIsZerodayChange(false);

                                zeroDayFields.forEach((fieldKey) => {
                                    if (fieldKey && targetListState?.filterLabels?.[fieldKey]) {
                                        dispatchState({
                                            type: 'UPDATE_ATTRIBUTE_VALUES',
                                            payload: {
                                                loading: false,
                                                index: null,
                                                attrName: fieldKey,
                                                values: [],
                                            },
                                        });
                                    }
                                });

                                setTimeout(() => {
                                    dispatchState({
                                        type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                                        field: 'default',
                                    });
                                }, 0);

                                dispatchState({
                                    type: 'UPDATE_ATTRIBUTES',
                                    field: 'zeroDay',
                                    payload: {
                                        attributesData: [],
                                        leftPanelAttributes: [],
                                        searchAttributes: [],
                                    },
                                });

                                dispatch(
                                    update_target_list({
                                        field: 'leftPanelAtt_Zero',
                                        data: [],
                                    }),
                                );
                            }}
                        />
                    )}
                </Fragment>
            );
    }
};

export default memo(RenderInputs);
