import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { APPLYRULEON, AUDIENCEGROUP as AUDIENCEGROUP_MSG, AUDIENCEGROUP_LIST, LIMIT as LIMIT_MSG, RULENAME as RULENAME_MSG, SELECT, SELECT_COMMUNICATION_TYPE, SELECT_PRIORITY, TIMEINTERVAL as TIMEINTERVAL_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { AUDIENCEGROUP, AUDINEC_GRP_LIST, CANCEL, COMMUNICATION_TYPE, LIMIT, PRIORITY as PRIORITY_PH, PROMOTIONAL_COMMUNICATION, RULENAME, SAVE, TIMEINTERVAL, TRANSACTIONAL_COMMUNICATION, TYPE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { useContext, useEffect, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { PRIORITY, INTERVAL, FORM_INITIAL_STATE } from '../../constants';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import usePermission from 'Hooks/usePersmission';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getCommunicationTypeLists, getFrequencyById, getFrequencyRuleExisit, getAudienceGroupList, saveFrequencyCapData, getRuleTypeList, getSelectAudienceGroup } from 'Reducers/preferences/CommunicationSettings/request';
import { FrequencyProvider } from '../..';

import ListNameExists from 'Components/ListNameExists';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { createIncrementArray } from 'Utils/modules/display';



const FrequencyCreate = ({ type, handleCancel, setFailedApi }) => {
    const methods = useForm(FORM_INITIAL_STATE);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const {
        control,
        handleSubmit,
        watch,
        reset,
        clearErrors,
        setValue,
        formState: { isValid },
    } = methods;
    const [audienceGroup, ruleType] = watch(['audienceGroup', 'ruleType']);
    const { permissions } = usePermission();
    const context = useContext(FrequencyProvider);

    const exists = useRef();
    const hasLoadedDropdownsRef = useRef(false);
    const lastEditFrequencyCapIdRef = useRef(null);
    const { addAccess, updateAccess } = permissions || {};
    const { segmentList, personaList, communicationTypes, audienceGroupList, selectAudienceGroup, ruleTypeList } =
        useSelector(({ communicationSettingsReducer }) => communicationSettingsReducer);
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const submitFrequencyCap = async (data) => {
        if (saveApi.isFetching) return;
        // console.log('Data ::::: ', data);
        const editData = context?.gridCreate?.frequencyAction?.edit?.editState;
        const payload = {
            userId,
            clientId,
            departmentId,
            frequencyCapId: type === 'edit' ? editData?.frequencyCapId : 0,
            audienceGroup: data?.audienceGroup.AudienceGroupName,
            audienceGroupList: data?.audienceGroupSelect?.targetList ?? '',
            ruleType: data?.ruleType.ruleTypeName,
            ruleName: data?.ruleName,
            audienceGroupId: Number(data?.audienceGroup?.AudienceGroupID ?? 0),
            audiencegroupchildId:
                Number(data?.audienceGroup?.AudienceGroupID) === 1
                    ? Number(data?.audienceGroupSelect?.personaId)
                    : Number(data?.audienceGroupSelect?.targetListId ?? 0),
            priority: Number(data?.priority?.value ?? 0),
            channelType: data?.audienceTypeSelect?.attributeName ?? null,
            campaignAttributeId: data?.audienceTypeSelect?.campaignAttributeId ?? 0,
            frequency: Number(data?.limit?.value ?? 0),
            timeInterval: Number(data?.timeInterval?.value ?? 0),
            isTranscommunication: data?.isTransaction,
        };
        const res = await saveApi.refetch({
            fetcher: () => dispatch(saveFrequencyCapData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        const { status } = res || {};
        if (status) {
            handleCancel(true);
        }
    };

    const getSegmentList = async (value) => {
        clearErrors('audienceGroupSelect');
        const payload = {
            clientId,
            userId,
            departmentId,
            audiencegrpDDLId: value,
        };
        // const { status, data } = await dispatch(getSegmentationList(payload));
        const { status, data } = await dispatch(getAudienceGroupList(payload));
        return data;
    };

    const getCommunicationTypes = async () => {
        const payload = {
            clientId,
            userId,
        };
        await dispatch(getCommunicationTypeLists(payload));
    };

    const getSegmentationList = async (res) => {
        let segementList;
        let segments = await getSegmentList(res?.audienceGroupId);
        if (Object.keys(segments)?.length > 0 || segments?.length > 0) {
            if (res?.audienceGroupId === 1) {
                segementList = segments?.filter((item) => item?.personaId === Number(res?.audienceGroupChildId));
            } else {
                segementList = segments?.filter((item) => item?.targetListId === Number(res?.audienceGroupChildId));
            }
        }
        return segementList;
    };

    const getEditData = async (id) => {
        const payload = {
            userId,
            clientId,
            departmentId,
            frequencyCapId: id,
        };
        const { status, data } = await dispatch(getFrequencyById(payload));

        const res = data?.[0];
        if (status) {
            let tempGroupId = selectAudienceGroup?.filter((item) => item?.AudienceGroupID === res?.audienceGroupId);
            let tempChannelType = communicationTypes?.filter(
                (item) => item?.campaignAttributeId === Number(res?.channelType),
            );
            let tempPriority = PRIORITY?.filter((item) => Number(item?.value) === res?.priority);
            let tempLimit = createIncrementArray(20)?.filter((item) => Number(item?.value) === res?.frequency);
            let tempInterval = INTERVAL?.filter((item) => Number(item?.value) === Number(res?.timeInterval));

            const tempGroupSelect = await getSegmentationList(res);
            exists.current = res?.ruleName;
            reset((prev) => ({
                ...prev,
                ruleName: res?.ruleName,
                audienceGroup: tempGroupId?.[0],
                audienceGroupSelect: tempGroupSelect?.[0],
                audienceTypeSelect: tempChannelType?.[0],
                priority: tempPriority?.[0],
                limit: tempLimit?.[0],
                timeInterval: tempInterval?.[0],
                isTransaction: res?.istransCommunication,
                ruleType: ruleTypeList?.filter(
                    (item) =>
                        item.ruleTypeName?.replaceAll(' ', '')?.toLowerCase() ===
                        res?.ruleType?.replaceAll(' ', '')?.toLowerCase(),
                )?.[0],
            }));
        } else {
            setFailedApi('GetFrequencyCapByID');
        }
    };

    const handleRuleType = () => {
        setValue('audienceTypeSelect', '');
        setValue('priority', '');
        setValue('limit', '');
        setValue('timeInterval', '');
    };

    const getDropdownValues = async () => {
        const payload = {
            clientId,
            userId,
            departmentId,
        };
        const promises = [];
        if (!communicationTypes?.length) {
            let temPayload = {
                clientId,
                userId,
                departmentId: 0,
            };
            promises.push(dispatch(getCommunicationTypeLists(temPayload)));
        }
        if (!ruleTypeList?.length) {
            promises.push(dispatch(getRuleTypeList(payload)));
        }
        if (!selectAudienceGroup?.length) {
            promises.push(dispatch(getSelectAudienceGroup(payload)));
        }
        if (promises?.length > 0) {
            const [communicationTypes, ruleTypeList, selectAudienceGroup] = await Promise.all(promises);
            if (!selectAudienceGroup?.status && type === 'edit') {
                dispatch(
                    update_failures_API_Errors({
                        field: 'GetAudienceGroupList',
                        message: selectAudienceGroup?.message,
                    }),
                );
                setFailedApi('GetAudienceGroupList');
            }
        }
    };

    useEffect(() => {
        if (!clientId || !userId || !departmentId) return;
        if (hasLoadedDropdownsRef.current) return;
        hasLoadedDropdownsRef.current = true;
        getDropdownValues();
    }, [clientId, userId, departmentId]);

    const editFrequencyCapId = context?.gridCreate?.frequencyAction?.edit?.editState?.frequencyCapId;

    useEffect(() => {
        if (!editFrequencyCapId || !selectAudienceGroup?.length) return;
        if (lastEditFrequencyCapIdRef.current === editFrequencyCapId) return;
        lastEditFrequencyCapIdRef.current = editFrequencyCapId;
        getEditData(editFrequencyCapId);
    }, [editFrequencyCapId, selectAudienceGroup?.length]);

    useEffect(
        () => () => {
            hasLoadedDropdownsRef.current = false;
            lastEditFrequencyCapIdRef.current = null;
        },
        [],
    );
    const isLoading = watch('isLoadingListName');
    const pointerNone = isLoading ? 'pe-none' : '';
    const isEditMode = type === 'edit';
    const clickOffClass = isEditMode ? 'pe-none click-off opacity-100' : '';
    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(submitFrequencyCap)} className="mt21">
                <div className={`box-design bd-top-border ${clickOffClass}`}>
                    <div className="form-group mt20">
                        <Row>
                            <Col sm={6}>
                                {/* <RSInput
                                    control={control}
                                    name="ruleName"
                                    required
                                    maxLength={MAX_LENGTH50}
                                    placeholder={RULENAME}
                                    onKeyDown={charNumUnderScore}
                                    //  rules={{ required: RULENAME_MSG }}
                                    rules={LIST_NAME_RULES(RULENAME_MSG)}
                                /> */}
                                <ListNameExists
                                    name="ruleName"
                                    field="ruleName"
                                    id="rs_FrequencyCreate_ruleName"
                                    condition={({ status }) => {
                                        return !status;
                                    }}
                                    currentValue={exists.current}
                                    // onValid={(valid) => setIsValidListname(valid)}
                                    apiCallback={getFrequencyRuleExisit}
                                    onKeyDown={charNumUnderScore}
                                    rules={LIST_NAME_RULES(RULENAME_MSG)}
                                    customErrorMessage={RULENAME_MSG}
                                    maxLength={MAX_LENGTH50}
                                    placeholder={RULENAME}
                                    isNoSpeicalChars = {true}
                                    disabled={isEditMode}
                                />
                            </Col>
                            <Col sm={6} id="rs_FrequencyCreate_audiencegroup">
                                <RSKendoDropDownList
                                    control={control}
                                    name="audienceGroup"
                                    label={AUDIENCEGROUP}
                                    data={selectAudienceGroup}
                                    textField={'AudienceGroupName'}
                                    dataItemKey={'AudienceGroupID'}
                                    required
                                    disabled={isEditMode}
                                    rules={{ required: AUDIENCEGROUP_MSG }}
                                    handleChange={(e) => {
                                        getSegmentList(e.value.AudienceGroupID);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="form-group">
                        <Row>
                            {audienceGroup?.AudienceGroupName !== 'All' &&
                                (audienceGroup?.AudienceGroupName === 'Target lists' ? (
                                    <Col sm={6} id="rs_FrequencyCreate_targetlist">
                                        <RSKendoDropDownList
                                            control={control}
                                            name="audienceGroupSelect"
                                            label={AUDINEC_GRP_LIST}
                                            // data={segmentList}
                                            data={audienceGroupList}
                                            textField={'targetList'}
                                            dataItemKey={'targetListId'}
                                            required
                                            disabled={isEditMode}
                                            // rules={{ required: SELECT }}
                                            rules={{ required: AUDIENCEGROUP_LIST }}
                                        />
                                    </Col>
                                ) : (
                                    <Col
                                        sm={6}
                                        id="rs_FrequencyCreate_personaName"
                                        className={`${audienceGroup?.AudienceGroupName === 'All' ? 'click-off' : ''}`}
                                    >
                                        <RSKendoDropDownList
                                            control={control}
                                            name="audienceGroupSelect"
                                            label={AUDINEC_GRP_LIST}
                                            data={audienceGroupList}
                                            textField={'personaName'}
                                            dataItemKey={'personaId'}
                                            required
                                            disabled={isEditMode}
                                            // rules={{ required: SELECT }}
                                            rules={{ required: AUDIENCEGROUP_LIST }}
                                        />
                                    </Col>
                                ))}

                            <Col sm={6} id="rs_FrequencyCreate_ruletype">
                                <RSKendoDropDownList
                                    control={control}
                                    name="ruleType"
                                    label={TYPE}
                                    data={ruleTypeList}
                                    textField={'ruleTypeName'}
                                    dataItemKey={'ruleTypeId'}
                                    required
                                    disabled={isEditMode}
                                    rules={{ required: APPLYRULEON }}
                                    handleChange={handleRuleType}
                                />
                            </Col>
                        </Row>
                    </div>

                    {!!ruleType && (
                        <>
                            {ruleType?.ruleTypeName !== 'All' && (
                                <div className="form-group">
                                    <Row>
                                        <Col sm={6} id="rs_FrequencyCreate_communicationtype">
                                            <RSKendoDropDownList
                                                control={control}
                                                name="audienceTypeSelect"
                                                label={COMMUNICATION_TYPE}
                                                data={communicationTypes}
                                                textField={'attributeName'}
                                                dataItemKey={'campaignAttributeId'}
                                                required
                                                disabled={isEditMode}
                                                rules={{ required: SELECT_COMMUNICATION_TYPE }}
                                            />
                                        </Col>
                                        <Col sm={6} id="rs_FrequencyCreate_priority">
                                            <RSKendoDropDownList
                                                control={control}
                                                name="priority"
                                                label={PRIORITY_PH}
                                                data={PRIORITY}
                                                textField={'text'}
                                                dataItemKey={'value'}
                                                required
                                                disabled={isEditMode}
                                                rules={{ required: SELECT_PRIORITY }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            )}
                            <div className="form-group mb0">
                                <Row>
                                    <Col md={6} id="rs_FrequencyCreate_limit">
                                        <RSKendoDropDownList
                                            control={control}
                                            name="limit"
                                            label={LIMIT}
                                            data={createIncrementArray(20)}
                                            textField={'text'}
                                            dataItemKey={'value'}
                                            required
                                            disabled={isEditMode}
                                            rules={{ required: LIMIT_MSG }}
                                        />
                                    </Col>
                                    <Col md={6} id="rs_FrequencyCreate_timeintreval">
                                        <RSKendoDropDownList
                                            control={control}
                                            name="timeInterval"
                                            label={TIMEINTERVAL}
                                            data={INTERVAL}
                                            textField={'text'}
                                            dataItemKey={'value'}
                                            required
                                            disabled={isEditMode}
                                            rules={{ required: TIMEINTERVAL_MSG }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}
                    <Row className="mt10">
                        <Col>
                            <small>{PROMOTIONAL_COMMUNICATION}</small>
                        </Col>
                    </Row>
                    <Row className="mt10">
                        <Col>
                            <RSCheckbox
                                control={control}
                                name="isTransaction"
                                labelName={TRANSACTIONAL_COMMUNICATION}
                                disabled={isEditMode}
                            />
                        </Col>
                    </Row>
                </div>
                <div className={`buttons-holder ${pointerNone}`}>
                    <RSSecondaryButton
                        type="button"
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (isSaveLoading) return;
                            handleCancel(true);
                        }}
                        id="rs_FrequencyCreate_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    {/* {((type === 'edit' && updateAccess) || addAccess) && ( */}
                    {type !== 'edit' && addAccess && (
                        <RSPrimaryButton
                            type="submit"
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents={isSaveLoading}
                            id="rs_FrequencyCreate_Submit"
                            // className={`${isValid ? 'click-off' : ''}`}
                        >
                            {type === 'edit' ? UPDATE : SAVE}
                        </RSPrimaryButton>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};

export default FrequencyCreate;
