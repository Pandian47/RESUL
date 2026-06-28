import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { RULENAME as RULENAME_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { AUDIENCEGROUP, CANCEL, RULE_TYPE, RULENAME, SAVE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_mini, circle_plus_fill_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import ListNameExists from 'Components/ListNameExists';

import { FORM_INITIAL_STATE } from '../../constants';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    getCommunicationTypeLists,
    getFrequencyById,
    getFrequencyRuleExisit,
    getAudienceGroupList,
    saveFrequencyCapData,
    getRuleTypeList,
    getSelectAudienceGroup,
} from 'Reducers/preferences/CommunicationSettings/request';
import { FrequencyProvider } from '../..';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer';
import { CHANNELS_LIST } from 'Utils/modules/communicationChannels';
import RuleFields from './RuleFields';
import { getCommunicationProducts } from 'Reducers/communication/createCommunication/plan/request';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsFrequencyCapEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';



const FrequencyCapCreate = ({ type, handleCancel, setFailedApi }) => {
    const methods = useForm({
        //...FORM_INITIAL_STATE,
        defaultValues: {
            ...FORM_INITIAL_STATE.defaultValues
        },
    });

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const {
        control,
        handleSubmit,
        watch,
        reset,
        clearErrors,
        setValue,
        getValues,
        unregister,
        formState: { isValid },
    } = methods;


    const [audienceGroup] = watch(['audienceGroup']);

    // Watch all ruleTypes to filter out selected ones
    const allRuleTypes = watch('rulesTypes');
    const context = useContext(FrequencyProvider);
    const exists = useRef();

    const { communicationTypes, audienceGroupList, selectAudienceGroup, ruleTypeList, productTypes } = useSelector(
        ({ communicationSettingsReducer }) => communicationSettingsReducer,
    );
    const channelTypes = CHANNELS_LIST;

    const [segmentListData, setSegmentListData] = useState([]);

    const {
        fields: ruleTypeFields,
        append: appendRuleTypeField,
        remove: removeRuleTypeField,
    } = useFieldArray({
        control,
        name: 'rulesTypes',
    });
    const selectIcon = (isRemove) =>
        isRemove
            ? `${circle_minus_fill_mini} color-primary-red`
            : `${circle_plus_fill_mini} color-primary-blue`;

    const editFrequencyCapId =
        type === 'edit' ? context?.gridCreate?.frequencyAction?.edit?.editState?.frequencyCapId : null;
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const segmentApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const lastBootstrapKeyRef = useRef(null);
    const lastSegmentAudienceIdRef = useRef(null);
    const ruleTypeListRef = useRef(ruleTypeList);
    const selectAudienceGroupRef = useRef(selectAudienceGroup);
    const communicationTypesRef = useRef(communicationTypes);
    const productTypesRef = useRef(productTypes);

    useEffect(() => {
        ruleTypeListRef.current = ruleTypeList;
        selectAudienceGroupRef.current = selectAudienceGroup;
        communicationTypesRef.current = communicationTypes;
        productTypesRef.current = productTypes;
    }, [ruleTypeList, selectAudienceGroup, communicationTypes, productTypes]);

    useEffect(() => {
        // Cleanup: clear communication and product types when this screen unmounts
        return () => {
            dispatch(updateCommunicationSettings({ field: 'communicationTypes', payload: [] }));
            dispatch(updateCommunicationSettings({ field: 'productTypes', payload: [] }));
        };
    }, [dispatch]);

    // Helper function to get rule type list data
    const getRuleTypeListData = async () => {
        const payload = { clientId, userId, departmentId };
        const res = await dispatch(getRuleTypeList(payload));
        // Response structure: { status, data: [...], message }
        if (res?.status && res?.data) {
            return res?.data;
        }
        return ruleTypeList || [];
    };

    // Helper function to get select audience group data
    const getSelectAudienceGroupData = async () => {
        const payload = { clientId, userId, departmentId };
        const res = await dispatch(getSelectAudienceGroup(payload));
        // Response structure: { status, data: [...], message }
        if (res?.status && res?.data) {
            return res?.data;
        }
        return selectAudienceGroup || [];
    };

    const fetchSegmentListForAudience = useCallback(
        (audGroup, opts = {}) => {
            const { preserveAudienceSelection = false } = opts;
            clearErrors('audienceGroupSelect');
            if (!preserveAudienceSelection) {
                setValue('audienceGroupSelect', []);
            }
            if (!audGroup || audGroup.AudienceGroupName === 'All') {
                lastSegmentAudienceIdRef.current = null;
                segmentApi.reset();
                setSegmentListData([]);
                return;
            }

            const audienceId = audGroup.AudienceGroupID;
            if (lastSegmentAudienceIdRef.current === audienceId) {
                return;
            }
            lastSegmentAudienceIdRef.current = audienceId;

            segmentApi.refetch({
                fetcher: () =>
                    dispatch(
                        getAudienceGroupList({
                            clientId,
                            userId,
                            departmentId,
                            audiencegrpDDLId: audienceId,
                        }),
                    ),
                onSuccess: (res) => {
                    const status = res?.status;
                    const data = res?.data;
                    setSegmentListData(status ? data || [] : []);
                },
                onError: () => setSegmentListData([]),
            });
        },
        [clientId, userId, departmentId, dispatch, clearErrors, setValue],
    );

    const loadEditData = useCallback(async (id) => {
        const payload = { userId, clientId, departmentId, frequencyCapId: id };
        const { status, data } = await dispatch(getFrequencyById(payload));

        const res = status && data ? data : {};
        if (!res) {
            setFailedApi && setFailedApi('GetFrequencyById');
            return;
        }

        exists.current = res?.ruleName;

        const currentRuleTypeList = ruleTypeListRef.current;
        const currentSelectAudienceGroup = selectAudienceGroupRef.current;
        const currentCommunicationTypes = communicationTypesRef.current;
        const currentProductTypes = productTypesRef.current;

        const tempRuleTypeList = currentRuleTypeList?.length
            ? currentRuleTypeList
            : await getRuleTypeListData();
        const tempSelectAudienceGroup = currentSelectAudienceGroup?.length
            ? currentSelectAudienceGroup
            : await getSelectAudienceGroupData();

        const needsCommunicationTypes = Array.isArray(res.rulesTypes)
            ? res.rulesTypes.some(
                (rt) => rt?.ruleType?.ruleTypeName?.toLowerCase() === 'communication type',
            )
            : false;
        const needsProductTypes = Array.isArray(res.rulesTypes)
            ? res.rulesTypes.some((rt) => rt?.ruleType?.ruleTypeName?.toLowerCase() === 'product type')
            : false;

        if (needsCommunicationTypes && !currentCommunicationTypes?.length) {
            await dispatch(getCommunicationTypeLists({ clientId, userId, departmentId: 0 }));
        }
        if (needsProductTypes && !currentProductTypes?.length) {
            const prodPayload = { clientId, userId, departmentId };
            await dispatch(
                getCommunicationProducts({
                    payload: prodPayload,
                    isLoading: false,
                    from: 'communicationSetting',
                }),
            );
        }

        const mappedAudienceGroup =
            tempSelectAudienceGroup?.find(
                (ag) => ag?.AudienceGroupID === res?.audienceGroup?.AudienceGroupID,
            ) || res?.audienceGroup || null;

        const mappedAudienceGroupSelect = Array.isArray(res.audienceGroupSelect)
            ? res.audienceGroupSelect
            : [];

        const defaultRules = FORM_INITIAL_STATE.defaultValues.rulesTypes?.[0]?.rules || [
            { type: '', priority: '', limit: '', interval: '' },
        ];
        const mappedRulesTypes =
            Array.isArray(res.rulesTypes) && res.rulesTypes.length > 0
                ? res.rulesTypes.map((rt, index) => {
                    const ruleTypeId = rt?.ruleType?.ruleTypeId;
                    const mappedRuleType =
                        tempRuleTypeList?.find((r) => r?.ruleTypeId === ruleTypeId) || rt?.ruleType || null;

                    const ruleTypeName = mappedRuleType?.ruleTypeName?.toLowerCase();
                    const mappedRules = Array.isArray(rt.rules) && rt.rules.length > 0
                        ? rt.rules.map((rule) => {
                            let mappedType = rule?.type || '';
                            if (rule?.type) {
                                if (ruleTypeName === 'channel type') {
                                    mappedType =
                                        channelTypes.find((ch) => ch.id === rule.type.id) || rule.type;
                                } else if (ruleTypeName === 'communication type') {
                                    mappedType =
                                        communicationTypesRef.current?.find(
                                            (ct) => ct.campaignAttributeId === rule.type.campaignAttributeId,
                                        ) || rule.type;
                                } else if (ruleTypeName === 'product type') {
                                    mappedType =
                                        productTypesRef.current?.find((pt) => pt.categoryId === rule.type.categoryId) ||
                                        rule.type;
                                }
                            }
                            return {
                                type: mappedType,
                                priority: rule?.priority || '',
                                limit: rule?.limit || '',
                                interval: rule?.interval || '',
                            };
                        })
                        : defaultRules;

                    return {
                        ruleType: mappedRuleType,
                        rules: mappedRules,
                    };
                })
                : FORM_INITIAL_STATE.defaultValues.rulesTypes;
        reset({
            ...FORM_INITIAL_STATE.defaultValues,
            ruleName: res.ruleName,
            isTransaction: res.isTransaction,
            audienceGroup: mappedAudienceGroup,
            audienceGroupSelect: mappedAudienceGroupSelect,
            rulesTypes: mappedRulesTypes,
        });

        if (mappedAudienceGroup && mappedAudienceGroup.AudienceGroupName !== 'All') {
            lastSegmentAudienceIdRef.current = null;
            fetchSegmentListForAudience(mappedAudienceGroup, { preserveAudienceSelection: true });
        }
    }, [clientId, userId, departmentId, dispatch, reset, setFailedApi, fetchSegmentListForAudience]);

    const mapAudienceGroupSelectForPayload = (items, audienceGroup) => {
        if (!Array.isArray(items) || items.length === 0) return [];
        const groupName = audienceGroup?.AudienceGroupName;
        if (groupName === 'Target lists') {
            return items.map((item) => ({
                targetListId: item?.targetListId,
                targetList: item?.targetList,
            }));
        }
        return items.map((item) => ({
            personaId: item?.personaId,
            personaName: item?.personaName,
        }));
    };

    const submitFrequencyCap = async (data) => {
        if (saveApi.isFetching) return;
        const editData = context?.gridCreate?.frequencyAction?.edit?.editState;

        const payload = {
            userId,
            clientId,
            departmentId,
            frequencyCapId: type === 'edit' ? editData?.frequencyCapId : 0,
            ruleName: data.ruleName,
            audienceGroup: data.audienceGroup || [],
            audienceGroupSelect: mapAudienceGroupSelectForPayload(
                data.audienceGroupSelect,
                data.audienceGroup,
            ),
            isTransaction: data.isTransaction || false,
            rulesTypes:
                data.rulesTypes?.map((ruleTypeItem) => ({
                    ruleType: ruleTypeItem?.ruleType || {},
                    rules:
                        ruleTypeItem?.map((rule) => ({
                            type: rule?.type || '',
                            priority: rule?.priority || '',
                            limit: rule?.limit || '',
                            interval: rule?.interval || '',
                        })) || [],
                })) || [],
        };

        const res = await saveApi.refetch({
            fetcher: () => dispatch(saveFrequencyCapData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        const { status } = res || {};
        if (status) handleCancel(true);
    };

    // Get filtered rule type list excluding already selected ones (except current index)
    const getFilteredRuleTypeList = (currentIndex) => {
        if (!allRuleTypes || !Array.isArray(allRuleTypes)) return ruleTypeList;

        const selectedRuleTypeIds = allRuleTypes
            .map((item, idx) => (idx !== currentIndex && item?.ruleType?.ruleTypeId ? item.ruleType.ruleTypeId : null))
            .filter(Boolean);

        return ruleTypeList.filter((ruleType) => !selectedRuleTypeIds.includes(ruleType.ruleTypeId));
    };

    useEffect(() => {
        if (!sessionReady) return;

        const bootstrapKey = type === 'edit' ? `edit:${editFrequencyCapId}` : 'create';
        if (lastBootstrapKeyRef.current === bootstrapKey) return;
        lastBootstrapKeyRef.current = bootstrapKey;
        lastSegmentAudienceIdRef.current = null;

        const payload = { clientId, userId, departmentId };
        pageLoadApi.refetch({
            fetcher: async () => {
                await Promise.all([
                    dispatch(getRuleTypeList(payload)),
                    dispatch(getSelectAudienceGroup(payload)),
                ]);
                if (type === 'edit' && editFrequencyCapId) {
                    await loadEditData(editFrequencyCapId);
                }
            },
            loaderConfig: fieldLoaderConfig,
            mode: type === 'edit' ? 'edit' : 'create',
        });
    }, [sessionReady, type, editFrequencyCapId, clientId, userId, departmentId, dispatch]);

    useEffect(
        () => () => {
            lastBootstrapKeyRef.current = null;
            lastSegmentAudienceIdRef.current = null;
        },
        [],
    );

    const bootstrapFieldLoading = pageLoadApi.isLoading;
    const commonClass = type === 'edit' ? 'pe-none click-off' : '';
    return (
        <CommunicationSettingsFrequencyCapEditSkeletonGate
            isLoading={pageLoadApi.isFetching}
            isEditMode={type === 'edit'}
        >
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(submitFrequencyCap)} className="mt40 overflow-hidden">
                <div className="box-design bd-top-border">
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">{RULENAME}</label>
                            </Col>
                            <Col sm={6} className={commonClass}>
                                <ListNameExists
                                    name="ruleName"
                                    field="ruleName"
                                    apiCallback={getFrequencyRuleExisit}
                                    onKeyDown={charNumUnderScore}
                                    condition={(status) => {
                                        return !status?.status;
                                    }}
                                    rules={LIST_NAME_RULES(RULENAME_MSG)}
                                    maxLength={MAX_LENGTH50}
                                    placeholder={RULENAME}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">{AUDIENCEGROUP}</label>
                            </Col>
                            <Col sm={6} className={commonClass}>
                                <RSKendoDropDownList
                                    control={control}
                                    name="audienceGroup"
                                    label={AUDIENCEGROUP}
                                    data={selectAudienceGroup}
                                    textField={'AudienceGroupName'}
                                    dataItemKey={'AudienceGroupID'}
                                    isLoading={bootstrapFieldLoading}
                                    handleChange={(e) => {
                                        lastSegmentAudienceIdRef.current = null;
                                        fetchSegmentListForAudience(e.value);
                                    }}
                                    required
                                    rules={{
                                        required: `Select audience group`,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>

                    {audienceGroup && audienceGroup.AudienceGroupName !== 'All' && (
                        <div className="form-group">
                            <Row>
                                <Col sm={4} className="text-right" />
                                <Col sm={6} className={commonClass}>
                                    <RSMultiSelect
                                        control={control}
                                        name="audienceGroupSelect"
                                        label={
                                            audienceGroup.AudienceGroupName === 'Target lists'
                                                ? 'Target lists'
                                                : 'Persona'
                                        }
                                        isLoading={segmentApi.isLoading}
                                        data={segmentListData}
                                        textField={
                                            audienceGroup.AudienceGroupName === 'Target lists'
                                                ? 'targetList'
                                                : 'personaName'
                                        }
                                        dataItemKey={
                                            audienceGroup.AudienceGroupName === 'Target lists'
                                                ? 'targetListId'
                                                : 'personaId'
                                        }
                                        required
                                        rules={{
                                            required: `Select ${audienceGroup.AudienceGroupName === 'Target lists'
                                                ? 'target List'
                                                : 'persona'}`,
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    )}

                    {ruleTypeFields?.length === 1 && (
                        <div className='form-group'>
                            <Row>
                                <Col sm={4} className="text-right ">
                                    <label className="control-label-left">{'Apply rule on'}</label>
                                </Col>
                                <Col sm={6} className={`mx0`}>
                                    <Row className={`flex-column`}>
                                        <Col className={commonClass}>
                                            <RSKendoDropDownList
                                                control={control}
                                                name={`rulesTypes[${0}].ruleType`}
                                                label={RULE_TYPE}
                                                data={getFilteredRuleTypeList(0)}
                                                textField="ruleTypeName"
                                                dataItemKey="ruleTypeId"
                                                isLoading={bootstrapFieldLoading}
                                                required
                                                rules={{
                                                    required: `Select rule type`,
                                                }}
                                                handleChange={async () => {
                                                    clearErrors(`rulesTypes[0].rules`);
                                                    // Clear type field in all rules
                                                    const currentRules = getValues(`rulesTypes[0].rules`) || [];
                                                    currentRules.forEach((rule, ruleIdx) => {
                                                        setValue(`rulesTypes[0].rules[${ruleIdx}].type`, '');
                                                    });

                                                    // Lazy-load type data based on selected rule type
                                                    const selectedRuleType = getValues(`rulesTypes[0].ruleType`);
                                                    const typeName = selectedRuleType?.ruleTypeName?.toLowerCase();
                                                    if (typeName === 'communication type' && !communicationTypes?.length) {
                                                        await dispatch(
                                                            getCommunicationTypeLists({ clientId, userId, departmentId: 0 }),
                                                        );
                                                    }
                                                    if (typeName === 'product type' && !productTypes?.length) {
                                                        const prodPayload = { clientId, userId, departmentId };
                                                        await dispatch(
                                                            getCommunicationProducts({
                                                                payload: prodPayload,
                                                                isLoading: false,
                                                                from: 'communicationSetting',
                                                            }),
                                                        );
                                                    }
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    )}
                    {!!allRuleTypes?.[0]?.ruleType &&
                        ruleTypeFields.map((item, index) => (
                            <div className='form-group'>
                                <Row key={item.id} className={commonClass}>
                                    {ruleTypeFields?.length > 1 ? (
                                        <Col sm={4} className={index === 0 ? 'text-right' : ''}>
                                            {index === 0 && <label className="control-label-left">Apply rule on</label>}
                                        </Col>
                                    ) : (
                                        <Col sm={4} className="mb20"></Col>
                                    )}
                                    <Col sm={6} className="mx0">
                                            <Row>
                                                {ruleTypeFields?.length > 1 && (
                                                    <Col className="form-group">
                                                        <RSKendoDropDownList
                                                            control={control}
                                                            name={`rulesTypes[${index}].ruleType`}
                                                            label={RULE_TYPE}
                                                            data={getFilteredRuleTypeList(index)}
                                                            textField="ruleTypeName"
                                                            dataItemKey="ruleTypeId"
                                                            required
                                                            handleChange={async () => {
                                                                clearErrors(`rulesTypes[${index}].rules`);
                                                                // Clear type field in all rules
                                                                const currentRules =
                                                                    getValues(`rulesTypes[${index}].rules`) || [];
                                                                currentRules.forEach((rule, ruleIdx) => {
                                                                    setValue(`rulesTypes[${index}].rules[${ruleIdx}].type`, '');
                                                                });

                                                                // Lazy-load type data based on selected rule type
                                                                const selectedRuleType = getValues(
                                                                    `rulesTypes[${index}].ruleType`,
                                                                );
                                                                const typeName = selectedRuleType?.ruleTypeName?.toLowerCase();
                                                                if (
                                                                    typeName === 'communication type' &&
                                                                    !communicationTypes?.length
                                                                ) {
                                                                    await dispatch(
                                                                        getCommunicationTypeLists({
                                                                            clientId,
                                                                            userId,
                                                                            departmentId: 0,
                                                                        }),
                                                                    );
                                                                }
                                                                if (typeName === 'product type' && !productTypes?.length) {
                                                                    const prodPayload = { clientId, userId, departmentId };
                                                                    await dispatch(
                                                                        getCommunicationProducts({
                                                                            payload: prodPayload,
                                                                            isLoading: false,
                                                                            from: 'communicationSetting',
                                                                        }),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                )}
                                            </Row>

                                            <RuleFields
                                                index={index}
                                                productTypes={productTypes}
                                                ruleTypeList={ruleTypeList}
                                                channelTypes={channelTypes}
                                            />

                                    </Col>
                                    {/* {index > 0 && (
                                    <Col md={1} className="px0 mt-3">
                                        <div className="fg-icons rs-was-icon">
                                            <RSTooltip text="Remove" position="top">
                                                <i
                                                    className={`${selectIcon(true)} icon-md`}
                                                    onClick={() => removeRuleTypeField(index)}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </Col>
                                )}
                                {index === 0 && (
                                    <Col md={1} className="p0 mt7">
                                        <div className="fg-icons rs-was-icon">
                                            <RSTooltip text="Add" position="top">
                                                <i
                                                    className={`${selectIcon(false)} icon-md ${
                                                        ruleTypeFields.length === ruleTypeList?.length
                                                            ? 'click-off'
                                                            : ''
                                                    }`}
                                                    onClick={() => {
                                                        appendRuleTypeField({
                                                            ruleType: '',
                                                            rules: [
                                                                { type: '', priority: '', limit: '', interval: '' },
                                                            ],
                                                        });
                                                    }}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </Col>
                                )} */}
                                </Row>
                            </div>
                        ))}
                    <div className='form-group mb10'>
                        <Row>
                            <Col sm={{ offset: 4, span: 6 }}>
                                <small>The rule will be applicable only for bulk and promotional communication.</small>
                            </Col>
                        </Row>
                    </div>
                    <div className='form-group mb30'>
                        <Row>
                            <Col sm={{ offset: 4, span: 6 }}>
                                <RSCheckbox
                                    control={control}
                                    name="isTransaction"
                                    labelName="Apply for transactional communication."
                                    disabled={type === 'edit'}
                                />
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="buttons-holder mb10">
                    <RSSecondaryButton
                        type="button"
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (isSaveLoading) return;
                            handleCancel(true);
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents={isSaveLoading}
                        disabledClass={commonClass}
                    >
                        {type === 'edit' ? UPDATE : SAVE}
                    </RSPrimaryButton>
                </div>
            </form>
        </FormProvider>
        </CommunicationSettingsFrequencyCapEditSkeletonGate>
    );
};

export default FrequencyCapCreate;
