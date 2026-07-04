import { numberWithCommas } from 'Utils/modules/formatters';
import { safeObjectKeys } from 'Utils/modules/misc';
import { AUDIENCE_COUNT_RESPONSE, DUPLICATE, EXCLUSIONSWITCHOPTIONS, REMOVE, VIEW_COUNT, addBrandError, addPartnerError, allExpressionSOLRFieldNameWiseByValue, buildVirtualFieldFormExtras, checkIsEmpty, convertExpressionToAttributesObjectFormat, dispatchGroupAudienceCount, getGroupNameByLists, getSideList, getallAttributes, groupTitle, handleDuplicateAttributes, handleExclusionMerge, handleRemoveIconEligible, handleSelectedList, resetFieldCountStatus } from './constant';
import { ARE_YOU_SURE_DELETE, ARE_YOU_SURE_REMOVE, CHOOSE_ATTRIBUTES, DELETE_GROUP, DELETE_USER_ROLE, EXCLUSION_COUNT, INCLUSION_COUNT, OK, RECOMMENDED_8_10_ATTRIBUTES, RECOMMENDED_8_25_ATTRIBUTES, SEGMENT } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_right_medium, circle_minus_fill_medium, circle_tick_medium, delete_medium, duplicate_medium, recycle_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, forwardRef, useContext, useEffect, useImperativeHandle, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { Col, Container, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RenderInputs from './Components/RenderInputs/RenderInputs';
import RenderSwitchButton from './Components/RenderSwitchButton/RenderSwitchButton';
import RSSwitch from 'Components/FormFields/RSSwitch';

import RenderAudienceCount from './Components/RenderAudienceCount/RenderAudienceCount';
import RSConfirmationModal from 'Components/ConfirmationModal';
import {
    ALLOW_MIXED_BRAND_PARTNER_IN_GROUP,
    ZERO_DAY_FIELD_NAME,
    _isAttributesErrors,
    applyLookAlikeAttributes,
    checkIsMulticlusion,
    getFinalAudienceCount,
    getListMaxValue,
    getListTypeDetail,
    normalflowConfig,
    oneAJSONTemp,
    safeParse,
    shortKeyNormalFlowConfig,
    shortKeySubSegmentFlowConfig,
    solrFieldNameSplit,
} from 'Pages/AuthenticationModule/Audience/Pages/TargetListCreation/constant';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import VirtualField from './Components/VirtualField';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAttributeValues,
    getCommunicationNames,
    getVirtualFieldData,
    get_Zeroday_AttributeValues,
    getAttributeValues_zeroDay,
    getAttributeValueByAdhocList,
    getSubScriptionFormList,
    needAttributeAPICall,
} from 'Reducers/audience/targetListCreation/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { CommonSkeleton, SegmentCreateSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { useLocation } from 'react-router-dom';
import usePartnerDataEnabled from 'Hooks/usePartnerDataEnabled';

const SegmentationLists = (
    {
        fieldName,
        index,
        getSelectedList,
        activeGroup,
        targetListContext,
        children,
        isUpdate,
        isDisable,
        isDisableGroup,
        countDisable,
        updateVersium,
        versiumDataSegment,
        ispartnerDigipop = false,
        ispartnerDigipopstate = {},
        setIsFinalCount,
        isLocationData = {},
        isUniqueID = '',
        isDisableFilterGroupNameList = [],
    },
    ref,
) => {
    const MAX_ATTRIBUTES = 25;
    const MAX_ATTRIBUTES_LOOKALIKE = 10;
    const isPartnerDataEnabled = usePartnerDataEnabled();

    const isBrandData = !isPartnerDataEnabled && !ispartnerDigipop;
    const currMaxAtts = fieldName === 'lookALikeAttrLists' ? MAX_ATTRIBUTES_LOOKALIKE : MAX_ATTRIBUTES;
    const { targetListState, dispatchState, apicallStatusDetail } = useContext(targetListContext);
    const {
        filterGroups,
        activeListIndex,
        filterLabels,
        attributesError,
        loading,
        loadIndex,
        attributesData,
        leftPanelAttributes,
        isDeleteGroup,
        deleteGroupName,
        type,
        isZeroDayFiles,
        attributeTypes,
        zeroDayConstructed,
        virtualValues,
        attributesLoading,
        searchAttributes,
    } = targetListState;

    const { pathname } = useLocation();
    // console.log('pathName: ', pathname);
    const combinedDataOneAJSON = oneAJSONTemp.reduce((acc, curr) => {
        return { ...acc, ...curr };
    }, {});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // console.log('combinedData', combinedDataOneAJSON);
    // console.log('isUpdate', isUpdate);
    // console.log('oneAJSON', oneAJSONTemp);
    // console.log('filterLabels', filterLabels);
    // console.log(
    //     'oneAJSON',
    //     oneAJSONTemp.map((item) => Object.keys(item)[0]),
    // );
    const { control, watch, trigger, setValue, formState, getFieldState, getValues, reset, setError, setFocus } =
        useFormContext();

    const { fields, insert, remove, replace } = useFieldArray({
        control,
        name: fieldName,
    });

    const [showRemove, setShowRemove] = useState({
        show: false,
        fieldName: '',
        fieldIndex: 0,
        field: {},
    });
    // const watchFields = watch();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { editList, oneAJSON, SubSegmentExp_List, fullAttributeJSONValues } = useSelector(
        ({ dataTargetListReducer }) => dataTargetListReducer,
    );
    const userInfoIds = { departmentId, clientId, userId };

    const watchRule = useWatch({
        control,
        name: fieldName,
    });
    const attributeField = useWatch({
        control,
        name: `${fieldName}.${index}`,
    });
    const attributesCount = getValues()['attributeslistCount']?.[`${fieldName}`] ?? [];
    const isPersona = type === 'persona';

    const checkEditEligibility = (isUpdate, editList, isPersona, oneAJSON, fullAttributeJSONValues, isLocationData) => {
        if (!isUpdate) return false;
        const hasEditListEntries = editList && Object.entries(editList)?.length > 0;
        if (!hasEditListEntries) return false;

        if (isPersona) return true;

        const hasOneAJSONValues = oneAJSON && Object.keys(oneAJSON)?.length > 0;
        const hasFullAttributeJSONValues = fullAttributeJSONValues && Object.keys(fullAttributeJSONValues)?.length > 0;
        const isValidLocationAdhocList = isLocationData?.isMDCSubSegment && isLocationData?.isAdhocList;
        const isValidAPIStatus =
            apicallStatusDetail?.current?.oneAJSONAPICallStatus &&
            apicallStatusDetail?.current?.fullAttributeJSONAPICall;

        return hasOneAJSONValues || hasFullAttributeJSONValues || isValidLocationAdhocList || isValidAPIStatus;
    };

    useEffect(() => {
        if (checkEditEligibility(isUpdate, editList, isPersona, oneAJSON, fullAttributeJSONValues, isLocationData)) {
            const partnerData = Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2;
            let loadField = [];
            let finalSOLRFieldNameWiseByAttributeValue = {};
            if (isPersona && Object.entries(editList)?.length > 0) {
                loadField = getSideList(editList?.personaRule, isPersona, partnerData);
            } else if (!isPersona && Object.entries(editList)?.length > 0) {
                let multiFilterAllGroupList = [];
                try {
                    multiFilterAllGroupList = editList?.allGroups ? JSON.parse(editList.allGroups) : [];
                } catch (_) {}

                const handleExpressionInMDCSubSegment = (ruleJson) => {
                    const finalExpression = ruleJson?.reduce((acc, curr) => {
                        if (curr?.FilterGroup?.includes('IG1_Subsegment')) {
                            acc['expressionJSON'] = curr;
                        } else if (curr?.FilterGroup?.includes('IG2_Subsegment')) {
                            acc['fG2ExpressionJSON'] = curr;
                        } else if (curr?.FilterGroup?.includes('Ex1_Subsegment')) {
                            acc['exclusion1ExpressionJSON'] = curr;
                        }
                        return acc;
                    }, {});
                    return finalExpression;
                };

                if (isLocationData?.isMDCSubSegment) {
                    if (multiFilterAllGroupList?.length) {
                        multiFilterAllGroupList?.forEach((groupList) => {
                            const sideListValue = getSideList(groupList, isPersona, partnerData, false, true);
                            loadField = [...loadField, ...sideListValue];
                        });
                    } else {
                        const mdcSubSegmentFlowExpression = handleExpressionInMDCSubSegment(
                            safeParse(editList.RuleJSON, {}),
                        );
                        const allExpressionJSON = [
                            mdcSubSegmentFlowExpression?.expressionJSON,
                            mdcSubSegmentFlowExpression?.fG2ExpressionJSON,
                            mdcSubSegmentFlowExpression?.exclusion1ExpressionJSON,
                        ];

                        allExpressionJSON?.forEach((expressionJSON) => {
                            const sideListValue = getSideList(expressionJSON, isPersona, partnerData);
                            loadField = [...loadField, ...sideListValue];
                        });

                        const inclusionExpressions = mdcSubSegmentFlowExpression?.fG2ExpressionJSON;
                        setValue('inclusionAudience', inclusionExpressions?.TotalInclusionCount);

                        let allFilterInclusionExclusionList = [
                            ...(mdcSubSegmentFlowExpression?.expressionJSON?.Expressions ?? []),
                            ...(mdcSubSegmentFlowExpression?.fG2ExpressionJSON?.Expressions ?? []),
                            ...(mdcSubSegmentFlowExpression?.exclusion1ExpressionJSON?.Expressions ?? []),
                        ];

                        finalSOLRFieldNameWiseByAttributeValue = allExpressionSOLRFieldNameWiseByValue(
                            allFilterInclusionExclusionList,
                        );
                    }
                } else {
                    if (multiFilterAllGroupList?.length) {
                        multiFilterAllGroupList?.forEach((groupList) => {
                            const sideListValue = getSideList(groupList, isPersona, partnerData, false, true);
                            loadField = [...loadField, ...sideListValue];
                        });
                    } else {
                        const allExpressionJSON = [
                            editList?.expressionJSON,
                            editList?.fG2ExpressionJSON,
                            editList?.exclusion1ExpressionJSON,
                        ];

                        allExpressionJSON?.forEach((expressionJSON) => {
                            const sideListValue = getSideList(expressionJSON, isPersona, partnerData);
                            loadField = [...loadField, ...sideListValue];
                        });
                        const inclusionExpressions = safeParse(editList?.fG2ExpressionJSON, {});
                        //setValue('inclusionAudience', inclusionExpressions?.TotalInclusionCount);
                    }
                }
            }
            const temploadField = loadField.filter((e) => {
                return e !== undefined;
            });

            let finalAttributeJSON = {};
            if (Array.isArray(fullAttributeJSONValues) && fullAttributeJSONValues.length > 0) {
                finalAttributeJSON = Object.assign({}, ...fullAttributeJSONValues);
            } else if (oneAJSON && Object.keys(oneAJSON).length > 0) {
                finalAttributeJSON = oneAJSON;
            }

            const matchedKeys = Object.keys(finalAttributeJSON).filter((key) => temploadField.includes(key));
            const notFoundKeys = temploadField.filter(
                (item) => !Object.keys(finalAttributeJSON).includes(item) || needAttributeAPICall?.includes(item),
            ); //Object.keys(combinedDataOneAJSON).filter((key) => !temploadField.includes(key));
            // console.log(
            //     'notFoundKeys: ',
            //      temploadField.filter((item) => !Object.keys(combinedDataOneAJSON).includes(item)),
            // );
            // if (temploadField?.length > 0) {
            //     temploadField?.forEach((item) => {
            //         getAttributeValuesByAttributeName(item, 'directSolorValue');
            //     });
            // }
            setValue('notFoundKeys', notFoundKeys);

            if (notFoundKeys?.length > 0) {
                notFoundKeys?.forEach((item) => {
                    const alreadyCallAttribute = getValues('alreadyCallAttribute');
                    const checkIsAlreadyCallAttribute = alreadyCallAttribute && alreadyCallAttribute[item];
                    if (checkIsAlreadyCallAttribute || filterLabels.hasOwnProperty(item)) {
                        return;
                    }

                    const currentAttributeValue = finalSOLRFieldNameWiseByAttributeValue?.[item];
                    const updateAttributeValue =
                        isLocationData?.isMDCSubSegment &&
                        convertExpressionToAttributesObjectFormat(currentAttributeValue);
                    const statusSolorValue =
                        isLocationData?.isMDCSubSegment && isLocationData?.isAdhocList
                            ? 'withSolorValue'
                            : 'directSolorValue';

                    const currentValue =
                        isLocationData?.isMDCSubSegment && isLocationData?.isAdhocList ? updateAttributeValue : item;

                    if (
                        oneAJSON &&
                        Object.keys(oneAJSON)?.length > 0 &&
                        apicallStatusDetail?.current?.fullAttributeJSONAPICall
                    ) {
                        getAttributeValuesByAttributeName(currentValue, statusSolorValue);
                        const alreadyCallAttributeValue = getValues('alreadyCallAttribute')
                            ? getValues('alreadyCallAttribute')
                            : {};
                        setValue('alreadyCallAttribute', {
                            ...alreadyCallAttributeValue,
                            [item]: true,
                        });
                    } else {
                        if (
                            apicallStatusDetail?.current?.fullAttributeJSONAPICall &&
                            apicallStatusDetail?.current?.oneAJSONAPICallStatus &&
                            !safeObjectKeys(oneAJSON).length
                        ) {
                            getAttributeValuesByAttributeName(currentValue, statusSolorValue);
                            const alreadyCallAttributeValue = getValues('alreadyCallAttribute')
                                ? getValues('alreadyCallAttribute')
                                : {};
                            setValue('alreadyCallAttribute', {
                                ...alreadyCallAttributeValue,
                                [item]: true,
                            });
                        }
                    }
                });
            }

            const handleAttributeValue = (item) => {
                return finalAttributeJSON[item].map((item) => {
                    if (typeof item === 'object') {
                        return item;
                    } else {
                        return item;
                    }
                });
            };

            if (matchedKeys?.length > 0) {
                matchedKeys?.forEach((item) => {
                    dispatchState({
                        type: 'UPDATE_ATTRIBUTE_VALUES',
                        payload: {
                            loading: false,
                            index: null,
                            attrName: [item],
                            values: handleAttributeValue(item),
                        },
                    });
                });
            }
        } else if (updateVersium) {
            let loadField = [];
            if (versiumDataSegment?.ruleJSON !== null) {
                if (Object.keys(versiumDataSegment.ruleJSON)?.length > 0) {
                    if (JSON.parse(JSON.parse(versiumDataSegment?.ruleJSONCount).split('||')[2])?.length > 0) {
                        setValue('inclusionAudience', JSON.parse(versiumDataSegment?.ruleJSONCount).split('||')[0]);
                    } else if (JSON.parse(JSON.parse(versiumDataSegment?.ruleJSONCount).split('||')[3])?.length > 0) {
                        setValue('finalAudienceCount', JSON.parse(versiumDataSegment?.ruleJSONCount).split('||')[0]);
                    } else {
                        setValue('finalAudienceCount', JSON.parse(versiumDataSegment?.ruleJSONCount).split('||')[0]);
                    }
                }
            }
            loadField = versiumDataSegment?.tableDropDown?.filterAttributes?.sOLRFieldName || ['v_contact_state_s'];

            // if (versiumDataSegment?.ruleJSON !== null) {
            if (versiumDataSegment?.ruleJSON !== null && Object.keys(versiumDataSegment.ruleJSON)?.length > 0) {
                loadField = getSideList(
                    JSON.parse(versiumDataSegment.ruleJSON)?.OriginalBaseExprVal,
                    isPersona,
                    false,
                    true,
                );
                loadField = [
                    ...loadField,
                    ...getSideList(
                        JSON.parse(versiumDataSegment.ruleJSON)?.FilterGroup2ExprVal,
                        isPersona,
                        false,
                        true,
                    ),
                ];

                loadField = [
                    ...loadField,
                    ...getSideList(
                        JSON.parse(versiumDataSegment.ruleJSON)?.Exclusion1ExprVal,
                        isPersona,
                        false,
                        true,
                    ),
                ];
            }

            const temploadField = loadField?.filter((e) => {
                return e !== undefined;
            });

            if (temploadField?.length > 0) {
                temploadField?.forEach((item) => {
                    getAttributeValuesByAttributeName(item, 'directSolorValue');
                });
            }
        }
    }, [editList, updateVersium, oneAJSON, fullAttributeJSONValues, apicallStatusDetail]);

    const notFoundKeys = getValues('notFoundKeys');
    useEffect(() => {
        if (notFoundKeys?.length) {
            notFoundKeys?.forEach((item) => {
                const alreadyCallAttribute = getValues('alreadyCallAttribute');
                const checkIsAlreadyCallAttribute = alreadyCallAttribute && alreadyCallAttribute[item];
                if (!checkIsAlreadyCallAttribute) {
                    if (
                        oneAJSON &&
                        Object.keys(oneAJSON)?.length &&
                        apicallStatusDetail?.current?.fullAttributeJSONAPICall
                    ) {
                        getAttributeValuesByAttributeName(item, 'directSolorValue');
                        const alreadyCallAttributeValue = getValues('alreadyCallAttribute')
                            ? getValues('alreadyCallAttribute')
                            : {};
                        setValue('alreadyCallAttribute', {
                            ...alreadyCallAttributeValue,
                            [item]: true,
                        });
                    } else {
                        if (
                            apicallStatusDetail?.current?.fullAttributeJSONAPICall &&
                            apicallStatusDetail?.current?.oneAJSONAPICallStatus &&
                            !Object.keys(oneAJSON)?.length
                        ) {
                            getAttributeValuesByAttributeName(item, 'directSolorValue');
                            const alreadyCallAttributeValue = getValues('alreadyCallAttribute')
                                ? getValues('alreadyCallAttribute')
                                : {};
                            setValue('alreadyCallAttribute', {
                                ...alreadyCallAttributeValue,
                                [item]: true,
                            });
                        }
                    }
                }
            });
        }
    }, [notFoundKeys, oneAJSON, fullAttributeJSONValues, apicallStatusDetail]);

    const handleGroupOperatorSwitchReset = () => {
        if (isPersona) return;

        const groups = filterGroups?.groups || [];
        const { attributeslistCount } = watch();
        const tempAttributesCount = { ...attributeslistCount };

        groups.forEach((group, groupIdx) => {
            if (groupIdx < index) return;

            tempAttributesCount[group] = [];
            const listItems = getValues()[group] || [];
            listItems.forEach((_, fieldIdx) => {
                setValue(`${group}.${fieldIdx}.isStatus`, false);
                setValue(`${group}.${fieldIdx}.isLoading`, false);
            });
        });

        setValue('attributeslistCount', tempAttributesCount);
        setValue('inclusionAudience', 0);
        setValue('finalAudienceCount', 0);
        setIsFinalCount(false);
        dispatchState({
            type: 'UPDATE',
            payload: null,
            field: 'activeListIndex',
        });
    };

    const handleResetCount = (switchChange, ind, type) => {
        // debugger;
        const { filterLists, attributeslistCount } = watch();

        let tempAttributesCount = {
            ...attributeslistCount,
            filterLists: [],
        };
        let tempFilterList = [...filterLists];
        // debugger;
        if (ind !== undefined) {
            tempFilterList = filterLists?.map((item, idx) => {
                if (idx === ind) {
                    return {
                        ...item,
                        isSwitched: type === 'filterLists' ? switchChange : item?.isSwitched,
                    };
                } else
                    return {
                        ...item,
                    };
            });
        }

        if (!isPersona) {
            const { zeroDayLists, inclusionLists, exclusionLists, lookALikeAudLists, lookALikeAttrLists } = watch();
            tempAttributesCount = {
                ...tempAttributesCount,
                zeroDayLists: [],
                inclusionLists: [],
                exclusionLists: [],
                lookALikeAudLists: [],
                lookALikeAttrLists: [],
            };
            reset((formState) => {
                // console.log('Form state :::: ', formState);
                return {
                    ...formState,
                    segmentation: {
                        listName: formState?.segmentation?.listName,
                        isinclusionSwitched:
                            type === 'inclusion' ? switchChange : formState?.segmentation?.isinclusionSwitched,
                    },
                    filterLists: ind !== undefined ? tempFilterList : formState?.filterLists,
                    zeroDayLists: resetFieldCountStatus(zeroDayLists, false, switchChange, ind, type),
                    inclusionLists: resetFieldCountStatus(
                        inclusionLists,
                        false,
                        switchChange,
                        ind,
                        type,
                        'inclusionLists',
                    ),
                    exclusionLists: resetFieldCountStatus(exclusionLists, false, switchChange, ind, type),
                    lookALikeAudLists: resetFieldCountStatus(
                        lookALikeAudLists,
                        false,
                        switchChange,
                        ind,
                        type,
                    ),
                    lookALikeAttrLists: resetFieldCountStatus(
                        lookALikeAttrLists,
                        false,
                        switchChange,
                        ind,
                        type,
                    ),
                };
            });
        }

        reset((formState) => ({
            ...formState,
            segmentation: {
                listName: formState?.segmentation?.listName,
                isinclusionSwitched: type === 'inclusion' ? switchChange : formState?.segmentation?.isinclusionSwitched,
            },
            filterLists: resetFieldCountStatus(filterLists, false, switchChange, ind, type, 'filterLists'),
            attributeslistCount: tempAttributesCount,
            inclusionAudience: 0,
            finalAudienceCount: 0,
        }));
        setIsFinalCount(false);
        dispatchState({
            type: 'UPDATE',
            payload: null,
            field: 'activeListIndex',
        });
    };

    const handleRemoveFieldValue = (fieldValues) => {
        const sOLRFieldName = fieldValues?.sOLRFieldName;
        const handleVirtualFieldReset = () => {
            if (fieldValues?.isvirtualfield) {
                return {
                    virtualType: '',
                    virtualFields: '',
                    virtualStart: '',
                    virtualEnd: '',
                    virtualInput: '',
                    isVirtualSave: false,
                    virtual: false,
                };
            } else {
                return {};
            }
        };
        switch (sOLRFieldName) {
            case 'Subscriptionform_d':
            case 'Remotedatasource_s': {
                return { attributeValue: '', attributeValueOne: '', ...handleVirtualFieldReset() };
            }
            case 'Campaign_name_s': {
                return {
                    communicationType: '',
                    communicationStatus: '',
                    communicationName: [],
                    ...handleVirtualFieldReset(),
                };
            }
            default: {
                return { attributeValue: '', ...handleVirtualFieldReset() };
            }
        }
    };

    useImperativeHandle(ref, () => ({
        async appendPayload(payload = {}) {
            let tempErrors = { ...attributesError };
            const group = getGroupNameByLists(fieldName);
            const getLengthStatus = getValues(fieldName)?.length >= currMaxAtts;
            if (!getLengthStatus) {
                if (
                    handleDuplicateAttributes(
                        filterGroups,
                        getValues,
                        attributesError,
                        dispatchState,
                        fieldName,
                        activeListIndex,
                    )
                ) {
                    if (!ALLOW_MIXED_BRAND_PARTNER_IN_GROUP && fields?.length > 0) {
                        const groupValues = getValues(fieldName) || [];
                        const firstRow = groupValues[0];
                        const firstPartnerId = firstRow?.partnerId ?? 0;
                        const newPartnerId = payload?.partnerId ?? 0;
                        if (Number(firstPartnerId) !== Number(newPartnerId)) {
                            const isFirstBrand = firstPartnerId === 0;
                            const message = isFirstBrand ? addPartnerError : addBrandError;
                            dispatchState({
                                type: 'UPDATE',
                                payload: { ...attributesError, [fieldName]: message },
                                field: 'attributesError',
                            });
                            setTimeout(() => {
                                let tempErrors = { ...attributesError };
                                tempErrors[`${fieldName}`] = null;
                                dispatchState({
                                    type: 'UPDATE',
                                    payload: tempErrors,
                                    field: 'attributesError',
                                });
                            }, 5000);
                            return;
                        }
                    }
                    const isLabelexists = _get(payload, 'isvirtualfield')
                        ? false
                        : payload?.sOLRFieldName in filterLabels;
                    const handleAttributeApi = () => {
                        const fieldType = _get(payload, 'fieldType');
                        const initFieldType = parseInt(fieldType, 10);
                        const sOLRFieldName = payload?.sOLRFieldName;
                        if (!isLabelexists) {
                            const notEligibleAttributeCall = ['Campaign_summary_s'];
                            if (initFieldType === 1) {
                                if (!notEligibleAttributeCall?.includes(sOLRFieldName)) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else if (initFieldType === 3 && sOLRFieldName === 'Subscriptionform_d') {
                                return true;
                            }
                        }
                        return false;
                    };

                    let virtualFieldApiData = [];
                    if (_get(payload, 'isvirtualfield')) {
                        if (!virtualValues[payload?.sOLRFieldName]?.length) {
                            const virtualPayload = {
                                attributeName: payload?.name || payload?.nAME,
                                departmentId,
                                clientId,
                                userId,
                            };
                            const response = await dispatch(
                                getVirtualFieldData(virtualPayload, dispatchState, payload?.sOLRFieldName),
                            );
                            try {
                                virtualFieldApiData = response?.data ? JSON.parse(response?.data) : [];
                            } catch (error) {
                                virtualFieldApiData = [];
                            }
                        } else {
                            virtualFieldApiData = virtualValues[payload?.sOLRFieldName] ?? [];
                        }
                    }

                    let isCustomVirtualAttrValue = '';
                    let extraFormState = {};
                    if (_get(payload, 'isvirtualfield') && virtualFieldApiData?.length) {
                        const virtualRow = virtualFieldApiData[0];
                        isCustomVirtualAttrValue = virtualRow?.VirtualDataAttributeName || '';
                        extraFormState = {
                            virtualFields: virtualRow,
                            ...buildVirtualFieldFormExtras(virtualRow),
                        };
                    }
                    let isZeroAttributeFlow = false;
                    const isZeroDayContain = filterGroups?.groups?.some((group) => group.includes('zeroDayLists'));
                    const zeroDayFormState = getValues('zeroDayLists') || [];
                    if (zeroDayFormState?.length && isZeroDayContain && group !== 'Zero Day') {
                        const firstZeroDayValue = zeroDayFormState[0];
                        if (firstZeroDayValue?.attributeValue?.length) {
                            isZeroAttributeFlow = firstZeroDayValue?.attributeValue?.some((item) =>
                                item?.data?.includes(payload?.FieldName),
                            );
                        }
                    }
                    !isZeroAttributeFlow &&
                        insert(
                            payload.name === ZERO_DAY_FIELD_NAME ? 0 : activeListIndex + 1,
                            handleSelectedList(
                                { ...payload, ...handleRemoveFieldValue(payload), ...extraFormState },
                                group,
                                filterLabels,
                                fieldName,
                                attributeField,
                            ),
                        );

                    if (handleAttributeApi()) {
                        getAttributeValuesByAttributeName(
                            payload,
                            'withSolorvalue',
                            fieldName,
                            isCustomVirtualAttrValue,
                        );
                    }

                    let tempattributesCount = isPersona ? [] : [...attributesCount];
                    let tempCount = tempattributesCount?.map((count, countIndex) => {
                        // debugger;
                        if (activeListIndex + 1 <= countIndex) {
                            setValue(`${fieldName}[${countIndex}].isStatus`, false);
                            setValue(`${fieldName}[${countIndex + 1}].isStatus`, false);
                            return [];
                        } else {
                            return count;
                        }
                    });
                    setValue(`${['attributeslistCount']}.${fieldName}`, fields?.length > 0 ? [...tempCount, []] : []);
                    // setValue(`${fieldName}.${activeListIndex + 1}.attributeValue`, '');
                    // handleResetCount();
                }
            } else {
                tempErrors[`${fieldName}`] = `${group} group filter should not exceed ${currMaxAtts} attributes`;
                dispatchState({
                    type: 'UPDATE',
                    payload: tempErrors,
                    field: 'attributesError',
                });
                setTimeout(() => {
                    let tempErrors = { ...attributesError };
                    tempErrors[`${fieldName}`] = null;
                    dispatchState({
                        type: 'UPDATE',
                        payload: tempErrors,
                        field: 'attributesError',
                    });
                }, 5000);
            }
        },
        getAttributes() {},
        async handleAudienceCount(
            isLookAlike = false,
            onlyCount = false,
            selectedOption = {},
            isEditCountRes = false,
            editCountRes = {},
        ) {
            return getBQAudienceCount(
                activeListIndex,
                AUDIENCE_COUNT_RESPONSE,
                '',
                isLookAlike,
                onlyCount,
                selectedOption,
                fieldName,
                isEditCountRes,
                editCountRes,
            );
        },
    }));

    const handleOtherAttributeAPI = async ({ attribute, dispatchState, labelText, loaderIndex }) => {
        if (!attribute?.sOLRFieldName && !attribute) return false;
        switch (attribute.sOLRFieldName || attribute) {
            case 'Campaign_name_s': {
                const payload = {
                    searchtext: '',
                    departmentId,
                    clientId,
                    userId,
                };
                await dispatch(getCommunicationNames(payload, dispatchState, labelText, loaderIndex));
                return true;
            }
            case 'Subscriptionform_d': {
                const payload = {
                    searchtext: '',
                    departmentId,
                    clientId,
                    userId,
                };
                await dispatch(getSubScriptionFormList(payload, dispatchState, labelText, loaderIndex));
                return true;
            }
            default:
                return false;
        }
    };

    const getAttributeValuesByAttributeName = async (
        attribute,
        value,
        fieldName = '',
        isCustomVirtualAttrValue = '',
    ) => {
        let finalAttrPayload = '';
        const labelText = value === 'directSolorValue' ? attribute : attribute?.sOLRFieldName;
        if (isCustomVirtualAttrValue) {
            const splitAttr = solrFieldNameSplit(labelText);
            const splitAttrName = `${splitAttr?.before}_${isCustomVirtualAttrValue}_${splitAttr?.last}`;
            finalAttrPayload = splitAttr?.last?.length ? splitAttrName : labelText;
        } else {
            finalAttrPayload = labelText;
        }
        let updateWatchRule = watchRule ? watchRule : [];
        const loaderIndex = !updateWatchRule?.length ? 0 : activeListIndex + 1;
        dispatchState({
            type: 'UPDATE_LOADING',
            payload: {
                loading: true,
                index: loaderIndex,
            },
        });

        const checkAttributeAPICall = await handleOtherAttributeAPI({
            attribute,
            dispatchState,
            labelText,
            loaderIndex,
        });
        if (!checkAttributeAPICall) {
            const payload = {
                attributeName: finalAttrPayload,
                clientId,
                userId,
                departmentId,
                partnerID:
                    versiumDataSegment !== undefined && versiumDataSegment !== ''
                        ? 40
                        : Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2
                          ? 41
                          : 0,
            };
            if (attribute?.sOLRFieldName === ZERO_DAY_FIELD_NAME || (isUpdate && attribute === ZERO_DAY_FIELD_NAME)) {
                await dispatch(get_Zeroday_AttributeValues(payload, dispatchState, labelText, loaderIndex));
            } else if (fieldName === 'zeroDayLists') {
                const payload = {
                    fileName: Object.keys(leftPanelAttributes[0])[0].split('(')[0].trim(),
                    fileHeader: attribute.labelText, //labelText,
                    attributeName: ZERO_DAY_FIELD_NAME,
                    clientId,
                    userId,
                    departmentId,
                    partnerID: 0,
                };
                await dispatch(getAttributeValues_zeroDay(payload, dispatchState, labelText, loaderIndex));
            } else {
                if ((attribute?.category === 'File' || isLocationData?.isAdhocList) && SubSegmentExp_List?.length) {
                    const { segmentationListID = 0, segmentationName = '' } = SubSegmentExp_List[0];
                    const payload = {
                        attributeName: attribute?.AttributeName,
                        clientId,
                        userId,
                        departmentId,
                        listId: segmentationListID,
                        listName: segmentationName,
                        columnName: attribute?.sOLRFieldName,
                    };
                    await dispatch(getAttributeValueByAdhocList(payload, dispatchState, labelText, loaderIndex));
                } else {
                    await dispatch(getAttributeValues(payload, dispatchState, labelText, loaderIndex));
                }
            }
        }
    };

    function updateDisableGroups(filteredGroups, filterDisableLists, tempfilterGroups) {
        const inclusionLimit = 'inclusionLists9';
        const exclusionLimit = 'exclusionLists5';

        let finalDisableGroups = [...filterDisableLists];

        if (filteredGroups?.includes(inclusionLimit)) {
            if (!finalDisableGroups.includes('Inclusion')) {
                finalDisableGroups.push('Inclusion');
            }
        } else {
            finalDisableGroups = finalDisableGroups.filter((group) => group !== 'Inclusion');
        }

        if (filteredGroups?.includes(exclusionLimit)) {
            if (!finalDisableGroups.includes('Exclusion')) {
                finalDisableGroups.push('Exclusion');
            }
        } else {
            finalDisableGroups = finalDisableGroups.filter((group) => group !== 'Exclusion');
        }

        tempfilterGroups.disableGroups = finalDisableGroups;
    }

    const removeFilterGroup = (fieldName) => {
        if (fieldName === 'zeroDayLists') {
            setValue(`${fieldName}.0.attributeValue`, '');
            dispatchState({
                type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                field: 'zeroDay',
            });
            dispatchState({
                type: 'UPDATE_ATTRIBUTES_ZERODAY',
                field: 'zeroDay',
                payload: {
                    attributesData: [],
                    leftPanelAttributes: [],
                    searchAttributes: [],
                },
            });
            const tempzeroDayList = watch();
            const { zeroDayLists, attributeslistCount } = tempzeroDayList;
        } else {
            let tempfilterGroups = { ...filterGroups };
            const filteredGroups = tempfilterGroups.groups.filter((grp) => grp !== fieldName);
            let removeDisable = '';
            if (tempfilterGroups.groups.includes('zeroDayLists') && fieldName === 'filterLists') {
                removeDisable = 'Inclusion';
            } else removeDisable = getGroupNameByLists(fieldName);
            const filterDisableLists = tempfilterGroups.disableGroups.filter((grp) => grp !== removeDisable);
            tempfilterGroups.groups = [...filteredGroups];
            tempfilterGroups.exclusionListGroup = false;
            tempfilterGroups.activeGroup = tempfilterGroups.groups.at(-1) || 'filterLists';

            let tempErrors = { ...attributesError };
            tempErrors[`${fieldName}`] = null;

            // disable groups
            updateDisableGroups(filteredGroups, filterDisableLists, tempfilterGroups);

            // resetField(fieldName);
            setValue(fieldName, []);

            dispatchState({
                type: 'UPDATE',
                payload: tempfilterGroups,
                field: 'filterGroups',
            });
            dispatchState({
                type: 'UPDATE',
                payload: tempErrors,
                field: 'attributesError',
            });
            setValue(`${['attributeslistCount']}.${fieldName}`, []);
            if (fieldName === 'inclusionLists') {
                setValue(`inclusionAudience`, 0);
            }

            if (fieldName === 'lookALikeAttrLists') {
                applyLookAlikeAttributes({
                    isLookAlike: false,
                    recommendedAttributes: [],
                    attributesData,
                    leftPanelAttributes,
                    searchAttributes,
                    dispatchState,
                });
            }
        }
    };

    const removeField = (field, fieldName, fieldIndex) => {
        remove(fieldIndex);
        if ((field.name ?? field.nAME) === ZERO_DAY_FIELD_NAME) {
            dispatchState({ type: 'UPDATE_ZERO_DAY_FILES' });
            dispatchState({
                type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                field: 'zeroDay',
            });
            setValue(`zeroDayLists`, []);
            let tempFilterGroups = { ...filterGroups };
            tempFilterGroups.groups.splice(0, 1);
            tempFilterGroups.activeGroup = 'filterLists';
            dispatchState({
                type: 'UPDATE',
                payload: tempFilterGroups,
                field: 'filterGroups',
            });
            dispatchState({
                type: 'UPDATE_ATTRIBUTES',
                field: 'zeroDay',
                payload: {
                    attributesData: [],
                    leftPanelAttributes: [],
                    searchAttributes: [],
                },
            });
            setTimeout(() => {
                dispatchState({
                    type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                    field: 'default',
                });
            }, 0);
        } else {
            const allFormStateValue = getValues();
            const { attributeslistCount } = allFormStateValue;

            let tempAttributesCount = {
                ...attributeslistCount,
                [fieldName]: [...(attributeslistCount?.[fieldName] || [])],
            };

            tempAttributesCount[fieldName].splice(fieldIndex, 1);

            tempAttributesCount[fieldName] = tempAttributesCount[fieldName].map((count, countIndex) => {
                if (fieldIndex <= countIndex) {
                    if (fieldName !== 'zeroDayLists') {
                        setValue(`${fieldName}[${countIndex}].isStatus`, false);
                    }
                    return [];
                } else {
                    return count;
                }
            });

            setValue('attributeslistCount', tempAttributesCount);

            let getAllCurrentAttributes = [];
            if (!isPersona) {
                filterGroups?.groups?.forEach((group) => {
                    const currentListFormStateValue = allFormStateValue[group] ?? [];
                    getAllCurrentAttributes = [...getAllCurrentAttributes, ...currentListFormStateValue];
                });

                let index = null,
                    category = null,
                    categoryIndex = null;
                const tempAttributes = [...attributesData];

                tempAttributes?.forEach((item, index) => {
                    if (field.category === Object.keys(item)[0]) {
                        category = item[field.category];
                        categoryIndex = index;
                    }
                });

                index = category?.findIndex((item, _) => {
                    return item?.labelText?.toLowerCase() === field?.labelText?.toLowerCase();
                });

                // Only proceed if categoryIndex and index are valid
                if (
                    categoryIndex !== null &&
                    categoryIndex !== undefined &&
                    index !== null &&
                    index !== undefined &&
                    index !== -1
                ) {
                    if (
                        !allFormStateValue[fieldName]?.some(
                            (attribute) => attribute?.labelText?.toLowerCase() === field?.labelText?.toLowerCase(),
                        )
                    ) {
                        if (!isPersona && tempAttributes?.[categoryIndex]?.[field?.category]?.[index]) {
                            const currentItem = tempAttributes[categoryIndex][field?.category][index] || {};

                            const updatedItem = { ...currentItem, isChecked: false };

                            tempAttributes[categoryIndex][field?.category][index] = updatedItem;
                        }
                    }

                    let templeftAttributes = [];
                    if (tempAttributes?.[categoryIndex]) {
                        let value = Object.values(tempAttributes[categoryIndex])[0];
                        let keys = Object.keys(tempAttributes[categoryIndex])[0];
                        if (keys === field.category && value) {
                            for (let i = 0; i <= value?.length - 1; i++) {
                                templeftAttributes.push(value[i]?.labelText?.toLowerCase());
                            }
                        }
                    }

                    if (!getAllCurrentAttributes.some((currAttr) => currAttr.name === field?.name)) {
                        let temporaryLeft = [...leftPanelAttributes];
                        if (
                            !allFormStateValue[fieldName]?.some(
                                (elem) => elem?.labelText?.toLowerCase() === field?.labelText?.toLowerCase(),
                            ) &&
                            temporaryLeft?.[categoryIndex]?.[field?.category]
                        ) {
                            temporaryLeft[categoryIndex][field?.category] = temporaryLeft[categoryIndex][
                                field?.category
                            ]?.filter((attr) => {
                                if (templeftAttributes.includes(attr?.labelText?.toLowerCase())) {
                                    return attr;
                                }
                                if (attr?.labelText?.toLowerCase() !== field?.labelText?.toLowerCase()) {
                                    return attr;
                                }
                            });
                            dispatchState({
                                type: 'UPDATE',
                                payload: temporaryLeft,
                                field: 'leftPanelAttributes',
                            });
                        }
                    }
                }
                const getLengthStatus = allFormStateValue[fieldName]?.length < currMaxAtts;
                if (getLengthStatus) {
                    let tempErrors = { ...attributesError };
                    tempErrors[`${fieldName}`] = null;
                    tempErrors[`${fieldName}ErrorIndex`] = null;
                    dispatchState({
                        type: 'UPDATE',
                        payload: tempErrors,
                        field: 'attributesError',
                    });
                }
                if (fieldName === 'lookALikeAttrLists') {
                    const newCount = fieldIndex > 0 ? tempAttributesCount[fieldName]?.[fieldIndex - 1]?.[0] || 0 : 0;
                    setValue('finalAudienceCount', Number(newCount));
                    return;
                }
                // handleBQAudience
                const alreadyTakenBQCount = getAllCurrentAttributes?.some((attribute) => attribute?.isStatus === true);
                if (alreadyTakenBQCount && allFormStateValue[fieldName]?.length) {
                    if (fieldName !== 'zeroDayLists') {
                        if (
                            filterGroups?.groups?.length === 1 &&
                            filterGroups?.groups?.[0] !== 'zeroDayLists' &&
                            fields?.length - 1 === fieldIndex
                        ) {
                            setValue('finalAudienceCount', attributesCount?.[attributesCount.length - 1]?.[0] || 0);
                            return;
                        }
                        // const updateCurrentAttribute = allFormStateValue[fieldName]?.map((attribute) => {
                        //     return {
                        //         ...attribute,
                        //         isStatus: false,
                        //     };
                        // });
                        //setValue(`${['attributeslistCount']}`, tempattCount);
                        if (getAllCurrentAttributes?.length < 3) {
                            getBQAudienceCount(fieldIndex, '', false, false, false, {}, fieldName);
                        }
                    }
                }
            }
        }
        handleDuplicateAttributes(
            filterGroups,
            getValues,
            attributesError,
            dispatchState,
            fieldName,
            activeListIndex,
        );
    };

    /** Dispatches group count API and returns parsed `countRes` (no form side-effects). */
    const fetchAudienceCountRes = async ({ switchChange, isLookAlike, selectedOption = {}, loading = true }) => {
        let transformedData_SubSegmentExp = [],
            listType = 0;
        if (isLocationData?.isMDCSubSegment && SubSegmentExp_List?.length > 0) {
            const SubSegmentListResponse = SubSegmentExp_List[0];
            listType = parseInt(SubSegmentListResponse?.listType, 10);
        }
        const { attributeslistCount } = watch();
        const response = await dispatchGroupAudienceCount({
            dispatch,
            pathname,
            watch,
            filterGroups,
            attributeslistCount,
            attributeTypes,
            userInfoIds,
            switchChange,
            updateVersium,
            versiumDataSegment,
            ispartnerDigipopstate,
            transformedData_SubSegmentExp,
            isLocationData,
            isUniqueID,
            listType,
            SubSegmentExp_List,
            isLookAlike,
            selectedOption,
            loading,
        });
        return isLocationData?.isMDCSubSegment ? response?.data : safeParse(response?.data, {});
    };

    const getBQAudienceCount = async (
        fieldIndex,
        res,
        switchChange,
        isLookAlike = false,
        onlyCount = false,
        selectedOption = {},
        activeFieldName = null,
        isEditCountRes = false,
        counResAPI = {},
    ) => {
        const duplicateStatus = handleDuplicateAttributes(
            filterGroups,
            getValues,
            attributesError,
            dispatchState,
            activeFieldName ?? fieldName,
            fieldIndex,
        );
        await trigger();
        if (Object.keys(formState?.errors || {}).length) {
            return;
        }
        if (!duplicateStatus) return;
        // handleDuplicateAttributes just cleared errors in reducer; closure still has stale attributesError.
        let checkGroupIsExistEmptyAttribute = Object.fromEntries(
            Object.keys(attributesError || {}).map((k) => [k, null]),
        );

        let isValidTakeCount = true;

        filterGroups?.groups?.forEach((group) => {
            const allFormState = getValues();
            const currentGroupList = allFormState[group];
            if (!currentGroupList?.length && group !== 'lookALikeAttrLists') {
                isValidTakeCount = false;
                checkGroupIsExistEmptyAttribute[group] = 'Select alteast one attribute';
                checkGroupIsExistEmptyAttribute[`${group}ErrorIndex`] = null;
            }
        });

        if (!isValidTakeCount) {
            dispatchState({
                type: 'UPDATE',
                payload: checkGroupIsExistEmptyAttribute,
                field: 'attributesError',
            });
            return;
        }

        if (onlyCount && !isEditCountRes) {
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'isAPIRequest',
            });
            if (isLookAlike) {
                dispatchState({
                    type: 'UPDATE',
                    payload: true,
                    field: 'lookAlikeLeftPanelLoading',
                });
            }
            try {
                return await fetchAudienceCountRes({ switchChange, isLookAlike, selectedOption });
            } finally {
                if (isLookAlike) {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'lookAlikeLeftPanelLoading',
                    });
                }
                dispatchState({
                    type: 'UPDATE',
                    payload: false,
                    field: 'isAPIRequest',
                });
            }
        }

        filterGroups?.groups?.forEach((group) => {
            const groupFieldValues = getValues()[group] ?? [];
            groupFieldValues.forEach((fieldValue, index) => {
                if (!fieldValue?.isStatus) {
                    setValue(`${group}.${index}.isLoading`, true);
                }
            });
        });
        const { attributeslistCount, inclusionLists, exclusionLists, lookALikeAudLists, lookALikeAttrLists } = watch();
        dispatchState({
            type: 'UPDATE',
            payload: true,
            field: 'isAPIRequest',
        });

        if (isLookAlike) {
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'lookAlikeLeftPanelLoading',
            });
        }

        let countRes;
        try {
            countRes = isEditCountRes
                ? counResAPI
                : await fetchAudienceCountRes({ switchChange, isLookAlike, loading: false });

            if (isLookAlike && Array.isArray(countRes?.LookAlikeResponse)) {
                const recommendedAttributes = countRes?.LookAlikeResponse?.[0]?.recommended_attributes;
                applyLookAlikeAttributes({
                    isLookAlike,
                    recommendedAttributes: recommendedAttributes,
                    attributesData,
                    leftPanelAttributes,
                    searchAttributes,
                    dispatchState,
                });
                dispatchState({
                    type: 'UPDATE',
                    payload: recommendedAttributes,
                    field: 'lookAlikeRecAtts',
                });
            }
            const isMultiInclusion = counResAPI?.isLookAlike ? true : checkIsMulticlusion(filterGroups?.groups);

            setValue('finalAudienceCount', countRes?.FinalAudienceCount || 0);
            setIsFinalCount(countRes?.FinalAudienceCount === 0 ? false : true);
            const inclusions = inclusionLists?.length ? inclusionLists : [];
            const exclusions = exclusionLists?.length ? exclusionLists : [];
            const lookALikesAud = lookALikeAudLists?.length ? lookALikeAudLists : [];
            const lookALikesAttr = lookALikeAttrLists?.length ? lookALikeAttrLists : [];
            let tempListsCount = { ...attributeslistCount };
            let updateFormStateCountStatus = {};

            const defaultRemoveList = () => {
                tempListsCount['zeroDayLists'] = [];
                tempListsCount['filterLists'] = [];
                tempListsCount['inclusionLists'] = [];
                tempListsCount['exclusionLists'] = [];
                tempListsCount['lookALikeAudLists'] = [];
                tempListsCount['lookALikeAttrLists'] = [];
            };

            const handleClearTempFilterListCount = () => {
                if (isMultiInclusion) {
                    defaultRemoveList();
                    filterGroups?.groups?.forEach((group) => {
                        tempListsCount[group] = [];
                    });
                } else {
                    defaultRemoveList();
                }
            };

            const handleUpdateFormStateInCountStatus = () => {
                filterGroups?.groups?.forEach((group) => {
                    let currentFormStateListValue = getValues()[group] ?? [];
                    const filterFinalGroupList = currentFormStateListValue?.filter(
                        (listValue) => listValue?.sOLRFieldName,
                    );
                    updateFormStateCountStatus[group] = resetFieldCountStatus(filterFinalGroupList, true);
                });
            };

            handleClearTempFilterListCount();
            handleUpdateFormStateInCountStatus();

            // const zerodayCounts = Object?.values(response.OriginalBase || {});
            // zerodayCounts?.forEach((list, index) => {
            //     let leftCount =
            //         index === 0
            //             ? getValues()?.totalAudiences - list
            //             : tempListsCount['zeroDayLists']?.[index - 1]?.[0] - list;
            //     tempListsCount['zeroDayLists']?.push([list, leftCount?.toString()?.replace(/[*\/+-]/g, '')]);
            // });

            // const handleSortWiseOrderList = (countRes , prefix, suffix) => {
            //     const orderedKeys = [
            //         ...Array.from({ length: 10 }, (_, i) => `${prefix}${i + 1}${suffix}`),
            //         ...Array.from({ length: 5 }, (_, i) => `${prefix}${i + 1}${suffix}`),
            //     ];
            //     const result = {};
            //     for (const key of orderedKeys) {
            //         if (Array.isArray(countRes?.[key])) {
            //             result[key] = countRes[key];
            //         }
            //     }
            //     return result;
            // };

            const handleMaxShortKey = (allShortKeys) => {
                return allShortKeys.reduce((max, current) => {
                    const currentNum = parseInt(current.replace(/^\D+/, ''));
                    const maxNum = parseInt(max.replace(/^\D+/, ''));
                    return currentNum > maxNum ? current : max;
                });
            };

            const updateTempAttributesCount = (tempAttributesCount, currentListType, waterFall, remaining) => {
                if (!Array.isArray(tempAttributesCount[currentListType])) {
                    tempAttributesCount[currentListType] = [];
                }
                tempAttributesCount[currentListType].push([waterFall, remaining]);
                return tempAttributesCount;
            };

            const handleWaterFallCountInNormalFlow = (currentList, currentShortKey, allCountList, countApiResponse) => {
                const currentListType = normalflowConfig[currentShortKey];
                const availableCountListShortKeys = Object.keys(allCountList);
                const isMuliFilter = availableCountListShortKeys?.includes('MultipleFilter');
                if (
                    currentListType === 'filterLists' ||
                    currentListType === 'inclusionLists' ||
                    currentListType === 'lookALikeAttrLists'
                ) {
                    currentList?.forEach((list, index) => {
                        let leftCount;
                        if (index === 0) {
                            leftCount = getValues()?.totalAudiences - list.count;
                        } else {
                            leftCount = tempListsCount[currentListType]?.[index - 1]?.[0] - list.count;
                        }
                        tempListsCount[currentListType]?.push([
                            list.count,
                            leftCount?.toString()?.replace(/[*\/+-]/g, ''),
                        ]);
                    });
                } else {
                    if (currentListType) {
                        currentList?.forEach((list, index) => {
                            let leftCount;
                            const finalCount = isMuliFilter
                                ? countApiResponse['MultipleFilterFinalCount']
                                : countApiResponse['OriginalBaseFinalCount'];
                            if (index === 0) {
                                leftCount = finalCount - list.count;
                            } else {
                                leftCount = tempListsCount[currentListType]?.[index - 1]?.[0] - list.count;
                            }
                            tempListsCount[currentListType]?.push([
                                list.count,
                                leftCount?.toString()?.replace(/[*\/+-]/g, ''),
                            ]);
                        });
                    }
                }
                updateFormStateCountStatus['inclusionAudience'] = countRes?.MultipleFilterFinalCount ?? 0;
            };

            const handleWaterFallCountInMulitFilter = (
                currentList,
                currentShortKey,
                allCountList,
                countApiResponse,
            ) => {
                const availableCountListShortKeys = Object.keys(allCountList);
                const isExistInclusion = availableCountListShortKeys?.includes('IG2');
                const inclusionShortKeysList = availableCountListShortKeys?.filter((keys) => keys.includes('IG'));
                const findMaxValue = handleMaxShortKey(inclusionShortKeysList);
                if (currentShortKey?.includes('IG')) {
                    const currentListType = isLocationData?.isMDCSubSegment
                        ? shortKeySubSegmentFlowConfig[currentShortKey]
                        : shortKeyNormalFlowConfig[currentShortKey];
                    currentList?.forEach((list, index) => {
                        let leftCount;
                        if (index === 0) {
                            leftCount = getValues()?.totalAudiences - list.count;
                        } else {
                            leftCount = tempListsCount[currentListType]?.[index - 1]?.[0] - list.count;
                        }
                        updateTempAttributesCount(
                            tempListsCount,
                            currentListType,
                            list?.count,
                            leftCount?.toString()?.replace(/[*\/+-]/g, ''),
                        );
                    });
                } else {
                    const currentListType = isLocationData?.isMDCSubSegment
                        ? shortKeySubSegmentFlowConfig[currentShortKey]
                        : shortKeyNormalFlowConfig[currentShortKey];
                    currentList?.forEach((list, index) => {
                        let leftCount;
                        if (index === 0) {
                            if (isExistInclusion) {
                                leftCount = countApiResponse[`${findMaxValue}FinalCount`] - list.count;
                            } else {
                                leftCount = countApiResponse[`IG1FinalCount`] - list.count;
                            }
                        } else {
                            leftCount = tempListsCount[currentListType]?.[index - 1]?.[0] - list.count;
                        }
                        updateTempAttributesCount(
                            tempListsCount,
                            currentListType,
                            list?.count,
                            leftCount?.toString()?.replace(/[*\/+-]/g, ''),
                        );
                    });
                }
                updateFormStateCountStatus['inclusionAudience'] = countApiResponse[`${findMaxValue}FinalCount`] ?? 0;
            };

            const handleWaterFallCountInSubSegment = (currentList, currentShortKey, allCountList, countApiResponse) => {
                const availableCountListShortKeys = Object.keys(allCountList);
                const isExistInclusion = availableCountListShortKeys?.includes('IG2_Subsegment');
                const inclusionShortKeysList = availableCountListShortKeys?.filter((keys) => keys.includes('IG'));
                const findMaxValue = handleMaxShortKey(inclusionShortKeysList, 'IG');
                if (currentShortKey?.includes('IG')) {
                    const currentListType = shortKeySubSegmentFlowConfig[currentShortKey];
                    currentList?.forEach((list, index) => {
                        let leftCount;
                        if (index === 0) {
                            leftCount = getValues()?.totalAudiences - list.count;
                        } else {
                            leftCount = tempListsCount[currentListType]?.[index - 1]?.[0] - list.count;
                        }
                        updateTempAttributesCount(
                            tempListsCount,
                            currentListType,
                            list?.count,
                            leftCount?.toString()?.replace(/[*\/+-]/g, ''),
                        );
                    });
                } else {
                    const currentListType = shortKeySubSegmentFlowConfig[currentShortKey];
                    currentList?.forEach((list, index) => {
                        let leftCount;
                        if (index === 0) {
                            if (isExistInclusion) {
                                leftCount = countApiResponse[`${findMaxValue}FinalCount`] - list.count;
                            } else {
                                leftCount = countApiResponse[`IG1_SubsegmentFinalCount`] - list.count;
                            }
                        } else {
                            leftCount = tempListsCount[currentListType]?.[index - 1]?.[0] - list.count;
                        }
                        updateTempAttributesCount(
                            tempListsCount,
                            currentListType,
                            list?.count,
                            leftCount?.toString()?.replace(/[*\/+-]/g, ''),
                        );
                    });
                }
                updateFormStateCountStatus['inclusionAudience'] = countApiResponse[`${findMaxValue}FinalCount`] ?? 0;
            };

            if (isLocationData?.isMDCSubSegment) {
                const finalAvailableCountList = Object.fromEntries(
                    Object.entries(countRes).filter(([key, value]) => Array.isArray(value)),
                );

                // const finalOrderWiseCountList = handleSortWiseOrderList(finalAvailableCountList);
                Object.entries(finalAvailableCountList)?.forEach(([key, value]) => {
                    handleWaterFallCountInSubSegment(value, key, finalAvailableCountList, countRes);
                });
            } else if (isMultiInclusion) {
                const finalAvailableCountList = Object.fromEntries(
                    Object.entries(countRes).filter(([key, value]) => Array.isArray(value)),
                );

                // const finalOrderWiseCountList = handleSortWiseOrderList(finalAvailableCountList);
                Object.entries(finalAvailableCountList)?.forEach(([key, value]) => {
                    handleWaterFallCountInMulitFilter(value, key, finalAvailableCountList, countRes);
                });
            } else {
                const finalAvailableCountList = Object.fromEntries(
                    Object.entries(countRes).filter(([key, value]) => Array.isArray(value)),
                );
                Object.entries(finalAvailableCountList)?.forEach(([key, value]) => {
                    handleWaterFallCountInNormalFlow(value, key, finalAvailableCountList, countRes);
                });
            }

            // const lookALikelistCounts = Object?.values(res?.countValue.Exclusion1ExprVal || {});
            // lookALikelistCounts?.forEach((list, index) => {
            //     let leftCount = index === 0 ? 500 - list : tempListsCount['lookALikeAudLists']?.[index - 1]?.[0] - list;
            //     tempListsCount['lookALikeAudLists']?.push([list, leftCount?.toString()?.replace(/[*\/+-]/g, '')]);
            // });

            reset(
                (formState) => ({
                    ...formState,
                    attributeslistCount: tempListsCount,
                    inclusionAudience: isLocationData?.isMDCSubSegment
                        ? countRes?.IG2_SubsegmentFinalCount
                        : countRes?.MultipleFilterFinalCount,
                    finalAudienceCount: countRes?.FinalAudienceCount,
                    ...updateFormStateCountStatus,
                    // inclusionAudience: res?.inclusionIG1IG2Count,
                    // [`${fieldName}.${fieldIndex}.isLoading`]: false,
                }),
                {
                    keepDirty: true,
                },
            );
            if (watch(fieldName)?.length === fieldIndex + 1) {
                setValue(`${fieldName}.${fieldIndex}.isLoading`, false);
            }
            // setValue(`${fieldName}.${fieldIndex}.isLoading`, false);

            dispatchState({
                type: 'UPDATE',
                payload: false,
                field: 'isAPIRequest',
            });
            const [extractionLimit, extractionCheck] = getValues(['extractionLimit', 'extractionCheck']);

            if (extractionCheck && Number(extractionLimit) > 0) {
                const finalCount = getFinalAudienceCount(getValues);
                if (Number(extractionLimit) > Number(finalCount)) {
                    setError('extractionLimit', {
                        type: 'custom',
                        message: 'Extraction limit exceeds potential audience',
                    });
                    setFocus('extractionLimit');
                }
            }
        } finally {
            if (isLookAlike) {
                dispatchState({
                    type: 'UPDATE',
                    payload: false,
                    field: 'lookAlikeLeftPanelLoading',
                });
            }
            dispatchState({
                type: 'UPDATE',
                payload: false,
                field: 'isAPIRequest',
            });
        }
    };

    const validateAllField = (currentWatchFormState = {}, isInvalid) => {
        const solrFieldName = currentWatchFormState?.sOLRFieldName;
        switch (solrFieldName) {
            case 'Campaign_name_s':
                return (
                    checkIsEmpty(currentWatchFormState?.communicationName) &&
                    checkIsEmpty(currentWatchFormState?.communicationType) &&
                    checkIsEmpty(currentWatchFormState?.communicationStatus)
                );

            case 'Campaign_summary_s':
                return (
                    checkIsEmpty(currentWatchFormState?.attributeValue) &&
                    checkIsEmpty(currentWatchFormState?.communicationType) &&
                    checkIsEmpty(currentWatchFormState?.communicationStatus)
                );

            default:
                return checkIsEmpty(currentWatchFormState?.attributeValue) && !isInvalid;
        }
    };

    const getFieldsStatus = (fieldIndex, isvirtual) => {
        const virtalFieldValue = getValues(`${fieldName}.${fieldIndex}.virtualFields`);
        const virtualStart = getValues(`${fieldName}.${fieldIndex}.virtualStart`);
        const virtualEnd = getValues(`${fieldName}.${fieldIndex}.virtualEnd`);
        const virtualType = getValues(`${fieldName}.${fieldIndex}.virtualType`);
        const virtualInput = getValues(`${fieldName}.${fieldIndex}.virtualInput`);
        const inputFieldValue = getValues(`${fieldName}.${fieldIndex}.attributeValue`);
        const selectedFilter = getValues(`${fieldName}.${fieldIndex}.attributeType`);
        const getAttributeState = getFieldState(`${fieldName}.${fieldIndex}.attributeValue`, formState);
        const { invalid } = getFieldState(`${fieldName}.${fieldIndex}.attributeValueOne`, formState);
        const attributeType = _get(watchRule?.[fieldIndex], 'attributeType', '');
        const attributeValue = _get(watchRule?.[fieldIndex], 'attributeValue', '');
        const attributeValueOne = _get(watchRule?.[fieldIndex], 'attributeValueOne', '');
        const selectedType = attributeType === 'Has no value' || attributeType === 'Has value';
        const isValidAttribute = selectedType
            ? true
            : validateAllField(watchRule?.[fieldIndex], getAttributeState.invalid);
        const isValidAttributeOne =
            attributeType === 'Between' || attributeType === 'Not between'
                ? checkIsEmpty(attributeValueOne) && !invalid
                : true;
        let isValidVirtualAttribute = false;

        if (isvirtual && virtalFieldValue) {
            if (virtualType === 'virtualDate' && virtualStart && virtualEnd) {
                isValidVirtualAttribute = true;
            } else if (virtualType === 'virtualInput' && virtualInput) {
                isValidVirtualAttribute = true;
            } else if (virtualType === 'virtualDefault') {
                isValidVirtualAttribute = true;
            }
        }

        if (isvirtual) {
            if (isValidVirtualAttribute && isValidAttribute && isValidAttributeOne) {
                return selectedType ? true : isValidAttribute && isValidAttributeOne;
            }
        } else {
            return selectedType ? true : isValidAttribute && isValidAttributeOne;
        }
    };

    const getExclusionMergeDisabledItems = (currentMergeValue) =>
        currentMergeValue === 'Merge' ? ['Merge'] : ['Unmerge'];

    const onExclusionMerge = (value, fieldIndex) => {
        const allFormState = watch();
        const currentExclsuionList = allFormState[fieldName];
        const mergeExclusion = handleExclusionMerge(currentExclsuionList, fieldIndex);
        setValue(fieldName, mergeExclusion);
        setValue(`${fieldName}.${fieldIndex}.mergeValue`, value);
    };
    const handleFieldSwitch = (fieldIndex, e) => {
        let tempattributesCount = [...attributesCount];
        tempattributesCount = tempattributesCount?.map((count, countIndex) => {
            if (fieldIndex <= countIndex) {
                setValue(`${fieldName}[${countIndex}].isStatus`, false);
                return [];
            } else {
                return count;
            }
        });

        setValue(`${['attributeslistCount']}.${fieldName}`, tempattributesCount);
    };
    // console.log('AAAA attributesError', attributesError);
    // console.log('AAAA ', fields);

    const getRenderCount = (listGroup, isExclusion, field, editFlowMergeValue, mergeValue, fieldIndex) => {
        if (listGroup['isStatus'] && !isPersona && !isExclusion && fieldName !== 'zeroDayLists') {
            return <RenderAudienceCount fieldName={fieldName} key={field.id} fieldIndex={fieldIndex} />;
        } else if (listGroup['isStatus'] && !isPersona && fieldName !== 'zeroDayLists') {
            if (isUpdate && editFlowMergeValue === 'Unmerge') {
                return <RenderAudienceCount fieldName={fieldName} key={field.id} fieldIndex={fieldIndex} />;
            } else if (mergeValue === 'Unmerge') {
                return <RenderAudienceCount fieldName={fieldName} key={field.id} fieldIndex={fieldIndex} />;
            }
        } else if (fieldName === 'zeroDayLists' && fieldIndex === 0) {
            return (
                <RenderAudienceCount
                    fieldName={fieldName}
                    // audienceCount={Object.values(leftPanelAttributes[0])[0][0]?.audienceCount || 0}
                    audienceCount={zeroDayConstructed?.searchAttributes[0]?.audienceCount || 0}
                    key={field.id}
                    fieldIndex={fieldIndex}
                />
            );
        }
    };

    const getGroupCountLabel = (groupFieldName) =>
        groupFieldName?.includes('exclusionLists') ? EXCLUSION_COUNT : INCLUSION_COUNT;

    const hasSegmentCountStatus = () => {
        const groups = filterGroups?.groups || [];
        const hasAttributes = groups.some((group) => (getValues()[group] || []).length > 0);
        if (!hasAttributes) return false;

        return groups.some((group) =>
            (getValues()[group] || []).some((field) => field?.isStatus === true),
        );
    };

    const handleFinalAudienceCountRender = () => {
        if (!hasSegmentCountStatus()) {
            return null;
        }

        const groups = filterGroups?.groups || [];
        const lastGroupCount = attributesCount?.[attributesCount.length - 1]?.[0] || 0;
        const { finalAudienceCount, inclusionAudience } = getValues();

        if (fieldName === 'lookALikeAttrLists') {
            return (
                <Col>
                    <p className="pt5 mb20 text-end small font-sm">
                        {SEGMENT} {numberWithCommas(finalAudienceCount || lastGroupCount)}
                    </p>
                </Col>
            );
        }

        const hasInclusionGroups = groups.some((g) => g.includes('inclusionLists'));
        const hasExclusionGroups = groups.some((g) => g.includes('exclusionLists'));
        const hasLookAlikeGroup = groups.includes('lookALikeAttrLists');

        let segmentTargetGroup = 'filterLists';
        if (hasExclusionGroups && !hasLookAlikeGroup) {
            segmentTargetGroup = getListMaxValue(groups, 'exclusionLists').key;
        } else if (hasInclusionGroups) {
            segmentTargetGroup = getListMaxValue(groups, 'inclusionLists').key;
        }

        if (fieldName !== segmentTargetGroup) {
            return null;
        }

        let segmentCount = lastGroupCount;
        if (hasExclusionGroups && !hasLookAlikeGroup) {
            segmentCount = finalAudienceCount || lastGroupCount;
        } else if (hasInclusionGroups) {
            segmentCount = inclusionAudience || lastGroupCount;
        }

        return (
            <Col>
                <p className="pt5 mb20 text-end small font-sm">
                    {SEGMENT}
                    <span className="font-bold font-sm">{numberWithCommas(segmentCount)}</span>
                </p>
            </Col>
        );
    };

    const handleVirtualFieldRender = ({ field, listGroup, fieldIndex, fieldName }) => {
        // console.log('field, listGroup, fieldIndex, fieldName: ', field, listGroup, fieldIndex, fieldName);
        if (listGroup?.['virtual']) {
            return <VirtualField name={field?.labelText} index={fieldIndex} fieldName={fieldName} />;
        }
    };

    return (
        <Fragment>
            {!isPersona && fieldName !== 'lookALikeAttrLists' && fieldName !== 'lookALikeAttrLists' && (
                <div
                    className={`groupSwitchIcon ${
                        isUpdate &&
                        Object.keys(ispartnerDigipopstate)?.length > 0 &&
                        ispartnerDigipopstate?.listId === 2
                            ? 'pe-none'
                            : ''
                    }  ${updateVersium && index === 0 ? 'mb10' : 'mb20'}`}
                >
                    <RenderSwitchButton
                        handleChange={() => {
                            handleGroupOperatorSwitchReset();
                        }}
                        group={fieldName}
                        isZeroDayFiles={isZeroDayFiles}
                        ispartnerDigipopstate={
                            Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2
                        }
                        isDisable={isLocationData?.isMDCSubSegment}
                    />
                </div>
            )}
            {attributesLoading ? (
                <SegmentCreateSkeleton />
            ) : (
                <>
                    {fieldName === 'lookALikeAttrLists' && (
                        <div className="d-flex justify-content-end">
                            <RSTooltip text={'Sync attributes'} position="top">
                                <i
                                    className={`${recycle_medium} icon-md color-primary-blue`}
                                    onClick={() => {
                                        getBQAudienceCount(index, '', '', true, false, {}, fieldName);
                                    }}
                                />
                            </RSTooltip>
                        </div>
                    )}
                    <Container
                        className={`targetListGroupBlock ${
                            isUpdate &&
                            Object.keys(ispartnerDigipopstate)?.length > 0 &&
                            ispartnerDigipopstate?.listId === 2
                                ? 'pe-none'
                                : ''
                        } ${fieldName} ${getListTypeDetail(fieldName)?.key} ${
                            !_isAttributesErrors(attributesError) ? 'border-danger' : 'border-primary'
                        }`}
                        onClick={() => {
                            if (filterGroups.activeGroup !== fieldName) {
                                let tempfilterGroups = { ...filterGroups };
                                tempfilterGroups.activeGroup = fieldName;
                                dispatchState({
                                    type: 'UPDATE',
                                    payload: tempfilterGroups,
                                    field: 'filterGroups',
                                });
                            }
                        }}
                    >
                        {handleRemoveIconEligible(index, filterGroups.groups, fieldName) && (
                            <div className="groupRemoveMinusIcon">
                                <RSTooltip text={DELETE_GROUP} position="top">
                                    <i
                                        className={`${delete_medium} icon-md color-primary-red`}
                                        onClick={() => {
                                            setShowDeleteModal(true);
                                            dispatchState({
                                                type: 'UPDATE_DELETEGROUP',
                                                payload: {
                                                    isDeleteGroup: true,
                                                    deleteGroupName: fieldName,
                                                },
                                            });
                                        }}
                                    />
                                </RSTooltip>
                            </div>
                        )}
                        <div className={`${fieldName !== filterGroups.activeGroup ? 'disableGroup' : 'active'}`}>
                            <div className="d-flex align-items-center justify-content-between px15 py5">
                                <h4 className={fields?.length === 0 ? 'pt5' : 'mb0'}>
                                    {groupTitle(filterGroups.groups, fieldName)}
                                </h4>
                                {!isPersona && fields?.length ? (
                                    <>
                                        {fieldName === 'zeroDayLists' ? (
                                            <></>
                                        ) : (
                                            <p className="d-flex align-items-center">
                                                {getGroupCountLabel(fieldName)}:
                                                <span className="font-bold font-sm ml5">
                                                    {numberWithCommas(
                                                        attributesCount?.[attributesCount?.length - 1]?.[0] || 0,
                                                    )}
                                                </span>
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    ''
                                )}
                            </div>
                            <ul className={`attributeList`}>
                                {fields?.map((field, fieldIndex) => {
                                    let listGroup = getValues()[`${fieldName}`][`${fieldIndex}`];
                                    // if (Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2) {
                                    //     listGroup.isSwitched = false;
                                    // }
                                    // console.log('Check :::: ', listGroup, fieldName, fieldIndex, getValues());
                                    const isRunnable = getFieldsStatus(fieldIndex, field.isvirtualfield);
                                    const isViewCountClickOff = !isRunnable || !countDisable || isDisable;
                                    const isDuplicateClickOff =
                                        !isRunnable || field?.sOLRFieldName === ZERO_DAY_FIELD_NAME;
                                    const isRefreshClickOff = !listGroup.attributeValue;

                                    const isLoading = loading && loadIndex === fieldIndex && activeGroup === fieldName;
                                    const attributeType = _get(watchRule?.[fieldIndex], 'attributeType', '');
                                    const isExclusion = fieldName?.includes('exclusionLists');
                                    let mergeValue = '';
                                    let isMerged = false;
                                    if (fieldName?.includes('exclusionLists')) {
                                        // mergeValue = watch(`${fieldName}.${fieldIndex}.mergeValue`);
                                        mergeValue =
                                            watch(`${fieldName}.${fieldIndex}.mergeValue`) !== undefined
                                                ? watch(`${fieldName}.${fieldIndex}.mergeValue`)
                                                : watch(`${fieldName}.${fieldIndex}.WithInOperatorCountEnd`) !==
                                                        'off' &&
                                                    watch(`${fieldName}.${fieldIndex}.WithInOperatorCountEnd`) !==
                                                        undefined &&
                                                    watch(`${fieldName}.${fieldIndex}.WithInOperatorCountEnd`) !== null
                                                  ? mergeValue
                                                  : undefined;
                                        isMerged = watch(`${fieldName}.${fieldIndex}.WithInOperatorCount`);
                                        isMerged = isMerged !== undefined && isMerged === 'off' ? false : true;
                                        // isMerged = isMerged !== undefined && isMerged === 'And' ? true : false;
                                    }

                                    let editFlowMergeValue;

                                    const getEditFlowMergeValue = () => {
                                        if (
                                            !watch(`${fieldName}.${fieldIndex}.WithInOperatorCountEnd`) &&
                                            !watch(`${fieldName}.${fieldIndex}.WithInOperatorCountStart`)
                                        ) {
                                            editFlowMergeValue = 'Unmerge';
                                        } else if (
                                            !!watch(`${fieldName}.${fieldIndex}.WithInOperatorCountEnd`) &&
                                            !!watch(`${fieldName}.${fieldIndex}.WithInOperatorCountStart`)
                                        ) {
                                            editFlowMergeValue = 'Unmerge';
                                        } else if (
                                            watch(`${fieldName}.${fieldIndex}.WithInOperatorCountEnd`) ===
                                            'WithInOperatorCountEnd'
                                        ) {
                                            editFlowMergeValue = 'merge';
                                        } else if (
                                            watch(`${fieldName}.${fieldIndex}.WithInOperatorCountEnd`) !==
                                            'WithInOperatorCountEnd'
                                        ) {
                                            editFlowMergeValue = 'Unmerge';
                                        }
                                    };
                                    getEditFlowMergeValue();
                                    // console.log('editFlowMergeValue: ', editFlowMergeValue);

                                    return (
                                        <Fragment key={field?.id || fieldIndex}>
                                            {isLoading ? (
                                                <div className="loadingawesome">
                                                    <div className="clearfix"></div>
                                                    <p className="awesome"></p>
                                                    <div className="loadingLeftPanel"></div>
                                                </div>
                                            ) : (
                                                <li
                                                    className={`
                                                        ${activeListIndex === fieldIndex ? 'active' : ''}
                                                        ${isExclusion && isMerged ? 'merged' : ''} 
                                                        ${
                                                            attributesError[`${fieldName}ErrorIndex`] === fieldIndex
                                                                ? 'filterError'
                                                                : ''
                                                        }
                                                    `}
                                                    onClick={() => {
                                                        if (!isLocationData?.isAdhocList) {
                                                            if (
                                                                field?.sOLRFieldName === 'ZeroDayFiles' &&
                                                                listGroup?.attributeValue?.length
                                                            ) {
                                                                dispatchState({
                                                                    type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                                                                    field: 'zeroDay',
                                                                });
                                                            } else {
                                                                dispatchState({
                                                                    type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                                                                    field: 'default',
                                                                });
                                                            }
                                                            if (
                                                                getValues()[`${fieldName}`][`${0}`]?.sOLRFieldName ===
                                                                    'ZeroDayFiles' &&
                                                                fieldIndex >= 1
                                                            ) {
                                                                dispatchState({
                                                                    type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                                                                    field: 'zeroDay',
                                                                });
                                                            }
                                                        }
                                                        if (activeListIndex !== fieldIndex) {
                                                            dispatchState({
                                                                type: 'UPDATE',
                                                                payload: fieldIndex,
                                                                field: 'activeListIndex',
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {!isPersona && fieldIndex > 0 && (
                                                        <div className="targetSwitchIcon">
                                                            {fieldName === 'lookALikeAttrLists' ? (
                                                                <RSTooltip
                                                                    text="AND is unavailable because it requires all selected attributes to match, which reduces audience reach."
                                                                    position="top"
                                                                    innerContent={false}
                                                                >
                                                                    <RSSwitch
                                                                        control={control}
                                                                        name={`${fieldName}.${fieldIndex}.isSwitched`}
                                                                        onLabel={'And'}
                                                                        offLabel={
                                                                            isExclusion && mergeValue === 'Merge'
                                                                                ? 'With'
                                                                                : 'Or'
                                                                        }
                                                                        className={`switchwith 
                                                                        ${
                                                                            Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                                                            ispartnerDigipopstate?.listId === 2
                                                                                ? ' '
                                                                                : ''
                                                                        }
                                                                    `}
                                                                        disabled={
                                                                            (isZeroDayFiles && fieldName === 'zeroDayLists') ||
                                                                            fieldName === 'lookALikeAttrLists'
                                                                        }
                                                                        handleChange={(e) => {
                                                                            handleFieldSwitch(fieldIndex, e);
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                            ) : (
                                                                <RSSwitch
                                                                    control={control}
                                                                    name={`${fieldName}.${fieldIndex}.isSwitched`}
                                                                    onLabel={'And'}
                                                                    offLabel={
                                                                        isExclusion && mergeValue === 'Merge'
                                                                            ? 'With'
                                                                            : 'Or'
                                                                    }
                                                                    className={`switchwith 
                                                                    ${
                                                                        Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                                                        ispartnerDigipopstate?.listId === 2
                                                                            ? ' '
                                                                            : ''
                                                                    }
                                                                `}
                                                                    disabled={
                                                                        (isZeroDayFiles && fieldName === 'zeroDayLists') ||
                                                                        fieldName === 'lookALikeAttrLists'
                                                                    }
                                                                    handleChange={(e) => {
                                                                        handleFieldSwitch(fieldIndex, e);
                                                                    }}
                                                                />
                                                            )}

                                                            {isExclusion && (
                                                                <div className="rsSwitchDropdown">
                                                                    <BootstrapDropdown
                                                                        data={EXCLUSIONSWITCHOPTIONS}
                                                                        flatIcon
                                                                        defaultItem=""
                                                                        showUpdate={false}
                                                                        className=""
                                                                        disbleItems={getExclusionMergeDisabledItems(mergeValue)}
                                                                        onSelect={(value) => {
                                                                            onExclusionMerge(value, fieldIndex);
                                                                            setValue(
                                                                                `${fieldName}.${fieldIndex}.isLoading`,
                                                                                false,
                                                                            );
                                                                            setValue(
                                                                                `${fieldName}.${fieldIndex}.isStatus`,
                                                                                false,
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="justify-content-between d-flex">
                                                        {/* {field?.category?.toLocaleLowerCase() === 'versium' && (
                          <i className="d-block font-xs">Category : {field?.category}</i>
                          )} */}
                                                        <h5>
                                                            {field?.category?.toLocaleLowerCase() === 'versium' && (
                                                                <small className="mt-5 pb5">
                                                                    Category : {field?.category}
                                                                </small>
                                                            )}
                                                            {!updateVersium && !isBrandData
                                                                ? `${
                                                                      field?.partnerId ? 'Partner data' : 'Brand data'
                                                                  } : `
                                                                : ' '}
                                                            {field?.labelText}
                                                        </h5>
                                                        {/* {
                          // !!attributesCount?.[`${fieldIndex}`]?.length &&
                          listGroup['isStatus'] &&
                             !isPersona &&
                             (isExclusion && isUpdate
                                 ? editFlowMergeValue === 'Unmerge'
                                 : mergeValue === 'Unmerge') && (
                                 <RenderAudienceCount
                                     fieldName={fieldName}
                                     key={field.id}
                                     fieldIndex={fieldIndex}
                                 />
                             )
                          } */}

                                                        {getRenderCount(
                                                            listGroup,
                                                            isExclusion,
                                                            field,
                                                            editFlowMergeValue,
                                                            mergeValue,
                                                            fieldIndex,
                                                        )}
                                                        {isPersona && (
                                                            <div className="d-flex">
                                                                <RSTooltip text={REMOVE} position="top">
                                                                    <i
                                                                        className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                                        onClick={() =>
                                                                            removeField(field, fieldName, fieldIndex)
                                                                        }
                                                                    />
                                                                </RSTooltip>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Row>
                                                        <RenderInputs
                                                            field={field}
                                                            fieldName={fieldName}
                                                            // key={field.id}
                                                            index={fieldIndex}
                                                            targetListContext={targetListContext}
                                                            handleResetCount={handleResetCount}
                                                        />

                                                        {!isPersona && (
                                                            // <Col md={field?.isvirtualfield && attributeType === 'Between' ? 2 : 3} className="pl0 align-content-end position-relative">
                                                            <Col className="pl0 d-flex align-content-end align-items-end justify-content-end position-relative flex-col gap-2">
                                                                <span className="ml6">
                                                                    {handleVirtualFieldRender({
                                                                        field,
                                                                        fieldIndex,
                                                                        fieldName,
                                                                        listGroup,
                                                                    })}
                                                                </span>
                                                                {field.name === ZERO_DAY_FIELD_NAME ? (
                                                                    <span
                                                                        className={
                                                                            isRefreshClickOff
                                                                                ? 'pe-none click-off lh0 d-inline-block float-start mt6'
                                                                                : 'float-start mt6 lh0 d-inline-block'
                                                                        }
                                                                    >
                                                                        <i
                                                                            id="rs_data_refresh"
                                                                            className={`${restart_medium} icon-md color-primary-blue`}
                                                                            onClick={() => {
                                                                                setShowDeleteModal(true);
                                                                                dispatchState({
                                                                                    type: 'UPDATE_DELETEGROUP',
                                                                                    payload: {
                                                                                        isDeleteGroup: true,
                                                                                        deleteGroupName: fieldName,
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                    </span>
                                                                ) : (
                                                                    <Fragment>
                                                                        {!isZeroDayFiles &&
                                                                            fieldName !== 'zeroDayLists' &&
                                                                            !listGroup['isLoading'] &&
                                                                            !listGroup['isStatus'] && (
                                                                                <RSTooltip
                                                                                    text={VIEW_COUNT}
                                                                                    position="top"
                                                                                    className={`float-start mt6 lh0 align-items-end d-inline-flex ${
                                                                                        isViewCountClickOff
                                                                                            ? 'pe-none click-off'
                                                                                            : ''
                                                                                    }`}
                                                                                >
                                                                                    <i
                                                                                        className={`${
                                                                                            circle_arrow_right_medium
                                                                                        } icon-md ${
                                                                                            isRunnable
                                                                                                ? 'color-primary-blue'
                                                                                                : 'grey'
                                                                                        } ${
                                                                                            countDisable
                                                                                                ? ''
                                                                                                : 'click-off'
                                                                                        } ${
                                                                                            isDisable ? 'click-off' : ''
                                                                                        }`}
                                                                                        onClick={async () => {
                                                                                            const findIndex =
                                                                                                getallAttributes(
                                                                                                    getValues(),
                                                                                                );
                                                                                            const listNameError =
                                                                                                formState.errors
                                                                                                    ?.segmentation
                                                                                                    ?.listName;
                                                                                            if (
                                                                                                findIndex === -1 &&
                                                                                                formState.isValid &&
                                                                                                !listNameError
                                                                                            ) {
                                                                                                getBQAudienceCount(
                                                                                                    fieldIndex,
                                                                                                    AUDIENCE_COUNT_RESPONSE,
                                                                                                    undefined,
                                                                                                    false,
                                                                                                    false,
                                                                                                    {},
                                                                                                    fieldName,
                                                                                                );
                                                                                            } else {
                                                                                                // Preserve list name error before triggering validation
                                                                                                await trigger();
                                                                                                // Restore list name error if it existed (to prevent it from being cleared)
                                                                                                if (listNameError) {
                                                                                                    setError(
                                                                                                        'segmentation.listName',
                                                                                                        {
                                                                                                            type:
                                                                                                                listNameError.type ||
                                                                                                                'custom',
                                                                                                            message:
                                                                                                                listNameError.message,
                                                                                                        },
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </RSTooltip>
                                                                            )}
                                                                    </Fragment>
                                                                )}
                                                                {listGroup['isLoading'] && (
                                                                    <div className="segment_loader float-start mt6"></div>
                                                                )}
                                                                {listGroup['isStatus'] &&
                                                                    fieldName !== 'zeroDayLists' && (
                                                                        <i
                                                                            className={`${circle_tick_medium} icon-md color-primary-green float-start mt6`}
                                                                            id="rs_data_circle_tick_medium"
                                                                        />
                                                                    )}
                                                                <RSTooltip
                                                                    text={DUPLICATE}
                                                                    position="top"
                                                                    className={`float-end align-items-end lh0 d-inline-flex ${
                                                                        isDuplicateClickOff ? 'pe-none click-off' : ''
                                                                    }`}
                                                                >
                                                                    <i
                                                                        className={`${duplicate_medium} icon-md ${
                                                                            isRunnable &&
                                                                            field?.sOLRFieldName !== ZERO_DAY_FIELD_NAME
                                                                                ? 'color-primary-blue'
                                                                                : 'grey'
                                                                        }`}
                                                                        onClick={() => {
                                                                            const findIndex =
                                                                                getallAttributes(getValues());

                                                                            if (
                                                                                findIndex === -1 &&
                                                                                handleDuplicateAttributes(
                                                                                    filterGroups,
                                                                                    getValues,
                                                                                    attributesError,
                                                                                    dispatchState,
                                                                                    fieldName,
                                                                                    fieldIndex,
                                                                                )
                                                                            ) {
                                                                                getSelectedList(
                                                                                    fieldName,
                                                                                    getValues()[`${fieldName}`][
                                                                                        `${fieldIndex}`
                                                                                    ],
                                                                                );
                                                                            } else {
                                                                                trigger();
                                                                            }
                                                                        }}
                                                                        id="rs_SegmentationLists_duplicate"
                                                                    />
                                                                </RSTooltip>
                                                                <RSTooltip
                                                                    text={REMOVE}
                                                                    position="top"
                                                                    className="float-end lh0 align-items-end"
                                                                >
                                                                    <i
                                                                        className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                                        onClick={() => {
                                                                            setShowRemove({
                                                                                show: true,
                                                                                fieldName: fieldName,
                                                                                fieldIndex: fieldIndex,
                                                                                field: field,
                                                                            });
                                                                        }}
                                                                        id="rs_SegmentationLists_circle_minus"
                                                                    />
                                                                </RSTooltip>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </li>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </ul>
                            {!fields?.length && (
                                <div
                                    className="pb90 pt43 text-center"
                                    onClick={() => {
                                        dispatchState({
                                            type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
                                            field: 'default',
                                        });
                                    }}
                                >
                                    <p>{CHOOSE_ATTRIBUTES}</p>
                                </div>
                            )}
                        </div>
                        {children}
                    </Container>
                </>
            )}
            <Row>
                {attributesLoading ? (
                    <div className="d-flex gap-2 my7">
                        <CommonSkeleton box width={150} height={20} />
                        <CommonSkeleton box width={150} height={20} />
                    </div>
                ) : (
                    <Col>
                        <p className="pt5 small">
                            {fieldName === 'lookALikeAttrLists'
                                ? RECOMMENDED_8_10_ATTRIBUTES
                                : RECOMMENDED_8_25_ATTRIBUTES}
                        </p>
                        {attributesError[`${fieldName}`] && (
                            <p className="color-primary-red small ">{attributesError[`${fieldName}`]}</p>
                        )}
                        <>
                            {isDisable && isDisableFilterGroupNameList?.includes(fieldName) && (
                                <p className="color-primary-red small">
                                    {' '}
                                    {`${groupTitle(
                                        filterGroups.groups,
                                        fieldName,
                                    )} should not exceed ${currMaxAtts} attributes`}
                                </p>
                            )}
                        </>
                        {fieldName === 'lookALikeAttrLists' && (
                            <>
                                {isDisable && isDisableGroup === 'lookALikeAttrLists' && (
                                    <p className="color-primary-red small">
                                        Lookalike group should not exceed 10 attributes
                                    </p>
                                )}
                            </>
                        )}

                        {/* handle final count render  */}
                        {!isPersona && (handleFinalAudienceCountRender())}
                        {/* handle final count render  */}
                    </Col>
                )}
            </Row>
            {/* Modals */}
            <RSConfirmationModal
                show={showDeleteModal}
                text={ARE_YOU_SURE_DELETE}
                primaryButtonText={OK}
                isBorder
                header={DELETE_USER_ROLE}
                handleClose={() => {
                    setShowDeleteModal(false);
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isDeleteGroup',
                    });
                }}
                handleConfirm={(status) => {
                    setShowDeleteModal(false);
                    if (status) {
                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'isDeleteGroup',
                        });
                        removeFilterGroup(deleteGroupName);
                    }
                }}
            />

            {showRemove?.show && (
                <RSConfirmationModal
                    show={showRemove?.show}
                    text={ARE_YOU_SURE_REMOVE}
                    primaryButtonText={OK}
                    isBorder
                    handleClose={() => {
                        setShowRemove({
                            show: false,
                            fieldName: '',
                            fieldIndex: 0,
                            field: {},
                        });
                    }}
                    handleConfirm={(status) => {
                        if (status) {
                            removeField(showRemove?.field, showRemove?.fieldName, showRemove?.fieldIndex);
                            setShowRemove({
                                show: false,
                                fieldName: '',
                                fieldIndex: 0,
                                field: {},
                            });
                        }
                    }}
                />
            )}
        </Fragment>
    );
};
export default forwardRef(SegmentationLists);
