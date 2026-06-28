import { removeDuplicates } from 'Utils/modules/dateTime';
import { AUDIENCE_LIST_NAME_MAX_LENGTH200, LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { safeObjectKeys } from 'Utils/modules/misc';
import { formatName } from 'Utils/modules/formatters';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { checkRequestApproval, FORM_INITIAL_STATE, INITIAL_STATE, MatchTypeCheck, repeatedGroupValuesCheck, repeatedValuesCheck, STATE_REDUCER } from './constant';
import { MAX_LENGTH200 } from 'Constants/GlobalConstant/Regex';
import { ENTER_COMMENTS, ENTER_LIST_NAME as ENTER_LIST_NAME_MSG, NAME_CANNOT_BE_EMPTY } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_RULE_GROUP, APPROVE, CANCEL, COMMENTS, CREATE_RULE, DYNAMIC_CROSS_DEVICE, DYNAMICLIST_NAME, EDIT_DYNAMIC_LIST, ENTER_LIST_NAME, MAXIMUM_LIMIT_REACHED, NEW_DYNAMIC_LIST, OK, REJECT, RENAME, SAVE, SELECT_TRIGGERS_AS_SPECIFIED, TRIGGERS, UP_TO_5_MATCH, UPDATE_RULE, USED_LIST_TEXT, YOU_ARE_NOT_APPROVER } from 'Constants/GlobalConstant/Placeholders';
import { alert_xlarge, circle_plus_fill_edge_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, Suspense, createContext, lazy, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSPageHeader from 'Components/RSPageHeader';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSTooltip from 'Components/RSTooltip';
import ListNameExists from 'Components/ListNameExists';
import {
    approveDynamicList,
    rejectDynamicList,
    createDynamicList,
    getCustomEventsValueData,
    getDynamicListById,
    getTriggerAttributes,
    getTriggerBaseDDLData,
    getTriggerSource,
    getCachedTriggerAttributes,
    getCachedTriggerBaseDDL,
    clearDynamicListApiCaches,
    isListNameExist,
    dynamicList_Comm_count,
    getTriggerAttributeValuesData,
    getTimezoneDetails,
    resolveTriggerAttributeValues,
} from 'Reducers/audience/dynamicList/request';
import { getSessionId, getRequestApprovalList } from 'Reducers/globalState/selector';

import useQueryParams from 'Hooks/useQueryParams';

import { parseRuleJSON, parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { getRequestApprovalUserDetails } from 'Reducers/globalState/request';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { update_Dashboard, update_isMobileAppId, update_isWebAppId } from 'Reducers/globalState/reducer';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { get_trigger_source_data, resetDynamicListState } from 'Reducers/audience/dynamicList/reducer';
import dynamicListInitialState from 'Reducers/audience/dynamicList/initialState';
import { getFullAttributeJSONValues } from 'Reducers/audience/targetListCreation/request';
import DynamicListCreationSkeleton from 'Components/Skeleton/Components/DynamicListCreationSkeleton';

import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';

import { FIELD_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';

const RuleGrouping = lazy(() => import('./Component/ruleGrouping'));
const RequestApproval = lazy(() => import('Pages/AuthenticationModule/Components/RequestApproval/RequestApproval'));
export const DynamicListCreateContext = createContext({
    ListState: {},
    dispatchState: () => {},
    ruleIndex: 0,
    setRuleIndex: () => {},
    duplicateRule: {},
    setDuplicateRule: () => {},
    triggerValues: [],
    setTriggerValues: () => {},
    isUpdate: false,
    controllEditModeApiCall: false,
    setControllEditModeApiCall: () => {},
    errorCustomGroup: null,
    setErrorCustomGroup: () => {},
    ensureTimeZoneDetail: async () => {},
});
const DynamicListCreation = () => {
    const navigate = useNavigate();
    const navigateToAudienceDynamicList = useCallback(() => {
        const url = '/audience';
        const index = 2;
        const state1 = { index };
        const encryptState = encodeUrl(state1);
        navigate(`${url}?q=${encryptState}`, {
            state: { index },
        });
    }, [navigate]);
    const queryParamDetails = useQueryParams('/audience');
    const DynamicListId = window.location.search;
    const urlIsUpdate = DynamicListId !== '';
    const urlEditListID = urlIsUpdate ? DynamicListId.split('=')?.[1] : 0;
    const location = useLocation();

    const [isUpdate, setUpdate] = useState(false);
    const [isUpdateRFA, setUpdateRFA] = useState([]);
    const [isRFA, setRFA] = useState(false);
    const [isRFAAlert, setRFAAlert] = useState({
        show: false,
        content: '',
        reject: false,
        isApproved: false,
    });

    const [editListID, setEditListId] = useState(0);
    const [editListName, setEditListName] = useState('');
    const [campaignType, setCampaignType] = useState('');
    const [mdcChannelDetails, setMdcChannelDetails] = useState({});
    const [isActionLoading, setIsActionLoading] = useState(false);
    const methods = useForm(FORM_INITIAL_STATE);
    const [ruleIndex, setRuleIndex] = useState(0);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state)) ?? {};
    const rfaapprovalList = useSelector((state) => getRequestApprovalList(state)) ?? [];
    const { failureApiErrors } = useSelector((state) => state?.globalstate ?? {});
    // console.log('failureApiErrors: ', failureApiErrors);
    let tempUserId = (rfaapprovalList ?? []).filter((e) => e?.userId === userId);

    const [ListState, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    const {
        control,
        handleSubmit,
        trigger,
        setError,
        setValue,
        reset,
        watch,
        getValues,
        formState: { isValid, isDirty },
    } = methods;

    const dispatch = useDispatch();
    const store = useStore();
    const { isValidListname, isUpdateList, isRequestApproved, fullAttributeJSONValues } = ListState ?? {};
    const rule = useWatch({ control, name: `rule` });
    const dynamicListName = useWatch({ control, name: `dynamicListName` });
    const approvalList = watch('approvalList');
    const approvalcomments = watch('comments');
    const { timeZoneId } = getUserDetails() ?? {};

    const { fields: ruleFields, append: ruleAppend, remove: ruleRemove } = useFieldArray({ control, name: 'rule' });

    const [title, setTitle] = useState(['Rule']);
    const [errorGroup, setErrorGroup] = useState(null);
    const [errorCustomGroup, setErrorCustomGroup] = useState(null);
    const [group, setGroup] = useState([]);
    const [warningCount, setWarningCount] = useState(false);
    const [warningListCount, setWarningListCount] = useState({ show: false, disable: false });
    const [duplicateRule, setDuplicateRule] = useState({
        show: false,
        index: 0,
    });
    const [nameExists, setNameExists] = useState(true)
    const [offClick, setOffClick] = useState(true);

    const editListControllRef = useRef(true);
    const dynamicListSessionRef = useRef(`${clientId}_${departmentId}`);
    const timeZoneFetchRef = useRef(null);
    const [showCrossDevice, setShowCrossDevice] = useState(false);

    const [controllEditModeApiCall, setControllEditModeApiCall] = useState(false);
    const [triggerValues, setTriggerValues] = useState([]);
    const [getDlFail, setGetDlFail] = useState(false);
    const [isEditDataLoading, setEditDataLoading] = useState(() =>
        Boolean(new URLSearchParams(window.location.search).get('DynamicListId')),
    );
    const triggerSourceAPI = useApiLoader();
    const triggerBaseDDLAPI = useApiLoader();
    const triggerAttributesAPI = useApiLoader();
    const editListAPI = useApiLoader({ actionCreator: getDynamicListById, autoFetch: false });
    const apiRefs = useRef({ triggerSourceAPI, triggerBaseDDLAPI, triggerAttributesAPI, editListAPI });
    apiRefs.current = { triggerSourceAPI, triggerBaseDDLAPI, triggerAttributesAPI, editListAPI };
    const { triggerSourceData = [] } = useSelector(
        (state) => state?.dynamicListReducer ?? dynamicListInitialState,
    );

    const { isMounted } = useComponentWillUnmount(() => {
        dispatch(get_trigger_source_data([]));
        const {
            triggerSourceAPI: source,
            triggerBaseDDLAPI: baseDDL,
            triggerAttributesAPI: attributes,
            editListAPI: editList,
        } = apiRefs.current;
        resetAbortableRequests(source, baseDDL, attributes, editList);
    });

    useEffect(() => {
        if (queryParamDetails && Object.keys(queryParamDetails)?.length) {
            if (queryParamDetails?.from !== 'dashboard') {
                /* MDC variables start*/
                const {
                    fromCampaign,
                    campaignId,
                    campaignName,
                    levelNumber,
                    parentChannelDetailId,
                    parentChannelDetailType,
                    actionId,
                    dynamicListId,
                } = queryParamDetails;
                const dlName = `${campaignName}_${campaignId}_${levelNumber}_${parentChannelDetailId}_${actionId}_${parentChannelDetailType}`;
                setValue('dynamicListName', dlName);
                setEditListName(dlName)
                setValue('isMDC', true);
                setCampaignType(fromCampaign);
                setMdcChannelDetails(queryParamDetails);
                if (dynamicListId) {
                    setEditListId(dynamicListId);
                    setUpdate(true);
                }
                /* MDC variables end*/
            } else {
                if (queryParamDetails?.from === 'dashboard') {
                    const { dynamicListName } = queryParamDetails;
                    setUpdate(true);
                }
            }
        }
    }, [queryParamDetails]);

    useEffect(() => {
        const DynamicListId = new URLSearchParams(window.location.search).get('DynamicListId') || 0;
        // console.log('dyncamiclistid', DynamicListId);
        if (DynamicListId) {
            setEditListId(DynamicListId);
            setUpdate(true);
        }

        let stateData = location.state;    
        if (stateData?.dynamicListID) {
                    setEditListId(stateData?.dynamicListID);
                    setUpdate(true);
                }

        if (stateData?.rule) {
            setOffClick(false);
            editListControllRef.current = false;
            reset({ ...getValues(), ...stateData });
            setControllEditModeApiCall(true);
            // setUpdate(true);
            if (!triggerSourceData?.length) {
                getTriggerSourceData();
            }
        }
    }, [location.state]);
    let isApprovalLinkApproved = new URLSearchParams(window.location.search).get('approverStatus') === '1';
    let isRejectedLink = new URLSearchParams(window.location.search).get('approverStatus') === '2';
    useEffect(() => {
        const isApprovalLink = new URLSearchParams(window.location.search).get('rfa') || 'false';
        isApprovalLinkApproved = new URLSearchParams(window.location.search).get('approverStatus') === '1';

        if (isApprovalLink === 'true') {
            setRFA(true);
        } else {
            setRFA(false);
        }
    }, []);

    useEffect(() => {
        if (!isRFA || rfaapprovalList?.length) return;

        dispatch(
            getRequestApprovalUserDetails({
                payload: {
                    clientId,
                    departmentId,
                    userId,
                },
            }),
        );
    }, [isRFA, rfaapprovalList?.length, clientId, departmentId, userId, dispatch]);

    const getTriggerSourceData = () => {
        if (triggerSourceData?.length) return;
        const payload = { clientId, departmentId, userId };
        triggerSourceAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(getTriggerSource({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
    };

    const fetchTriggerAttributes = (payload) => {
        const cached = getCachedTriggerAttributes(store.getState(), payload);
        if (cached !== undefined) {
            return Promise.resolve({ status: true, data: cached });
        }
        return triggerAttributesAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(getTriggerAttributes({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
    };

    const getTriggerAttributesData = (value, pages) => {
        const payload = {
            clientId,
            userId,
            departmentId,
            triggerSourceId: value?.triggerId,
            triggerddlValue: pages?.id || '',
        };
        if ((value?.triggerId === 1 || value?.triggerId === 5) && pages?.id) {
            fetchTriggerAttributes(payload);
        } else if (value?.triggerId >= 0 && value?.triggerId !== 1 && value?.triggerId !== 5) {
            fetchTriggerAttributes(payload);
            if (value?.triggerId === 14 && !fullAttributeJSONValues?.length) {
                const attrPayload = {
                    clientId,
                    userId,
                    departmentId,
                };
                void import('../../../../../Reducers/audience/targetListCreation/request').then(
                    ({ getFullAttributeJSONValues: fetchFullAttributeJSON }) => {
                        if (!isMounted.current) return;
                        dispatch(fetchFullAttributeJSON({ payload: attrPayload, dispatchState, from: 'dynamicList' }));
                    },
                ).catch(() => {});
            }
        }
    };

    const getTriggerBaseDDL = (value) => {
        const payload = {
            clientId,
            userId,
            departmentId,
            triggerSourceId: value?.triggerId,
        };
        const cached = getCachedTriggerBaseDDL(store.getState(), payload);
        if (cached !== undefined) {
            return Promise.resolve({ status: true, data: cached });
        }
        return triggerBaseDDLAPI.refetch({
            fetcher: ({ payload: requestPayload }) =>
                dispatch(getTriggerBaseDDLData({ payload: requestPayload, loading: false })),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { payload },
        });
    };

    const handleFromAttributesApiData = async (values) => {
        try {
            const { triggerddlValue, attributeName, triggerSourceId, fieldType, value, formId, dataAttributeId, id } =
                values ?? {};
            const payloadLevel1 = {
                triggerddlValue: triggerddlValue,
                attributeName: attributeName,
                triggerSourceId: triggerSourceId,
                fieldType: fieldType,
                departmentId,
                clientId,
                userId,
                levelNo: 1,
                formId: formatName(attributeName) === 'forms' ? id : formId,
                columnName: value,
                dataAttributeId: dataAttributeId,
            };
            const payloadLevel2 = {
                ...payloadLevel1,
                formId: formId,
                levelNo: 2,
            };
            const responseLevel1 = await resolveTriggerAttributeValues({
                dispatch,
                getState: store.getState,
                payload: payloadLevel1,
                loading: false,
            });
            if (!isMounted.current) {
                return { level1: [], level2: [] };
            }
            const responseLevel2 = await resolveTriggerAttributeValues({
                dispatch,
                getState: store.getState,
                payload: payloadLevel2,
                loading: false,
            });
            if (!isMounted.current) {
                return { level1: [], level2: [] };
            }
            const responseLevel1Data = responseLevel1?.status ? responseLevel1?.data ?? [] : [];
            const responseLevel2Data = responseLevel2?.status ? responseLevel2?.data ?? [] : [];
            setValue(`triggerValues.${payloadLevel1?.attributeName}`, responseLevel1Data);
            setValue(`triggerValues.${payloadLevel1?.attributeName + 2}`, responseLevel2Data);
            return {
                level1: responseLevel1Data,
                level2: responseLevel2Data,
            };
        } catch {
            return { level1: [], level2: [] };
        }
    };

    const getEditListData = async (data) => {
        setEditDataLoading(true);
        try {
        const {
            convertComparisonValue,
            extractAttributeValuesInEditFlow,
            handleAttributeComparison,
            handleAttributeName: resolveAttributeName,
        } = await import('./constant');
        editListControllRef.current = false;
        const fromDashboard = data?.from === 'dashboard';
        const payload = {
            dynamicListId: editListID,
            clientId,
            userId,
            departmentId,
        };
        const result = !fromDashboard
            ? await editListAPI.refetch({ payload, loading: false })
            : { status: false };
        const editListItem = result?.status ? result?.data?.dynamiclist?.[0] : null;
        if (!fromDashboard && (!result?.status || !editListItem)) {
            if (isMounted.current) setGetDlFail(true);
            return;
        }
        const resultCount = !fromDashboard ? await dispatch(dynamicList_Comm_count({ payload, loading: false })) : { status: false };
        if (resultCount?.status) {
            setWarningListCount({
                show: resultCount?.data?.DynamicListCount > 0,
                disable: resultCount?.data?.DynamicListCount > 0,
            });
        }
        // getTriggerSourceData();
        const list = editListItem || {};
        const requestApprovalList = result?.status ? result?.data?.dynamiclistapproval ?? [] : [];
        if (isMounted.current) setUpdateRFA(requestApprovalList);
        if (isRFA) {
            if (!isApprovalLinkApproved) {
                let tempData = requestApprovalList?.filter((e) => e.approvalStatus === 1);
                let RejectedData = requestApprovalList?.filter((e) => e.approvalStatus === 2);
                let myArrayFiltered = [];
                if (tempData?.length > 0) {
                    myArrayFiltered = rfaapprovalList.filter((el) => {
                        return tempData?.some((f) => {
                            return f?.approverEmail === el?.email;
                        });
                    });
                }
                if (RejectedData?.length > 0) {
                    myArrayFiltered = rfaapprovalList.filter((el) => {
                        return RejectedData?.some((f) => {
                            return f?.approverEmail === el?.email;
                        });
                    });
                }
                const isUserid = myArrayFiltered?.filter((e) => e.userId === userId);
                if (isUserid?.length === 1) {
                    if (RejectedData?.length) {
                        setRFAAlert({
                            content: 'Dynamic list has been already rejected.',
                            show: true,
                            reject: false,
                            isApproved: false,
                        });
                    } else {
                        setRFAAlert({
                            content: 'Dynamic list has been already approved.',
                            show: true,
                            reject: false,
                            isApproved: true,
                        });
                    }
                } else {
                    const currentUser = rfaapprovalList?.find((list) => list?.userId === userId);
                    if (currentUser && requestApprovalList[0]?.approverEmail !== currentUser?.email) {
                        setRFAAlert((prev) => ({
                            ...prev,
                            content: YOU_ARE_NOT_APPROVER,
                            show: true,
                            isApproved: true,
                        }));
                    } else {
                        if (!rfaapprovalList.some((e) => e?.userId === userId)) {
                            setRFAAlert((prev) => ({
                                ...prev,
                                content: YOU_ARE_NOT_APPROVER,
                                show: true,
                                isApproved: true,
                            }));
                        } else {
                            setRFAAlert((prev) => ({
                                show: false,
                                content: '',
                                reject: false,
                                isApproved: false,
                            }));
                        }
                    }
                }
            }
        }
        const ruleData = fromDashboard
            ? data
            : parseRuleJSON(list?.ruleJSON, null);

        if (!fromDashboard && !ruleData) {
            if (isMounted.current) setGetDlFail(true);
            return;
        }

        if (!isMounted.current) return;

        setControllEditModeApiCall(true);
        const triggerArr = await dispatch(
            getTriggerSource({ payload: { clientId, departmentId, userId }, loading: false }),
        );
        let temp;
        // debugger
        if (fromDashboard) {
            temp = {
                dynamicListName: data?.dynamicListName,
                departmentID: departmentId,
                RuleCondition: true,
                exclusionCondition: false,
                approvalList: approvalList,
                addRule: '',
                rule: [],
            };
        } else {
            temp = {
                dynamicListName: list?.dynamicListName,
                dynamicListID: list?.dynamicListId,
                departmentID: list?.departmentId,
                RuleCondition: ruleData.RuleCondition === 'AND',
                exclusionCondition: false,
                approvalList: {
                    name: [],
                    // requestApproval: list?.isRequestApproval === 1,
                    requestApproval: true,
                    approvalFrom: 'All',
                    approvalCount: '2',
                    followHierarchy: false,
                },
                addRule: '',
                rule: [],
                crossDevice: ruleData?.isCrossDevice || false,
            };
        }
        if (requestApprovalList?.length > 0) {
            for (var i = 0; i < requestApprovalList?.length; i++) {
                temp.approvalList?.name.push({
                    approverName: {
                        email: requestApprovalList[i]?.approverEmail,
                        firstName: requestApprovalList[i]?.approverName,
                        // roleId: 5,
                        // userId: 26,
                        name: requestApprovalList[i]?.approverName + ' (' + requestApprovalList[i]?.approverEmail + ')',
                    },
                });
            }
        } else {
                temp.approvalList?.name.push({ approverName: '', mandatory: false });
        }
        var tempArrRule = [];

        let formAgainstAttributeData = {
            level1: {},
            level2: {},
        };

        const getAttributeValue = (formId, value, ruletype, level) => {
            if (
                formatName(ruletype) === 'attributes' ||
                formatName(ruletype) === 'eventbrite' ||
                formatName(ruletype) === 'forms'
            ) {
                const currentAttributeData = level === 1
                    ? formAgainstAttributeData.level1[formId]
                    : formAgainstAttributeData.level2[formId + '_' + value];
                const currDropDownValue = currentAttributeData?.filter(
                    (item) => formatName(item?.value) === formatName(value),
                );
                return currDropDownValue ? currDropDownValue[0] : {};
            } else {
                return {
                    id: j + 1,
                    value: value,
                };
            }
        };

        if (ruleData.RuleGroup1 !== undefined) {
            tempArrRule.push(ruleData.RuleGroup1);
        }
        if (ruleData.RuleGroup2 !== undefined) {
            tempArrRule.push(ruleData.RuleGroup2);
        }
        if (ruleData.RuleGroup3 !== undefined) {
            tempArrRule.push(ruleData.RuleGroup3);
        }
        let triggerAttrArr = {};
        if(tempArrRule?.some((item) => Number(item.TriggerName) === 14)){
            await dispatch(getFullAttributeJSONValues({ payload, dispatchState, from: 'dynamicList', loading: false }));
        }
        for (var i = 0; i < (Number(ruleData?.RuleGroups) || 0); i++) {
            if (!isMounted.current) return;
            // console.log('ruleData: ', ruleData);
            let { RuleAttributes = [] } = tempArrRule[i] ?? {};

            const findTriggerSource = triggerArr?.data?.filter(
                (item) => parseInt(item?.triggerId, 10) == parseInt(tempArrRule[i]?.TriggerName, 10),
            ) ?? [];
            const triggerId = findTriggerSource?.[0]?.triggerId;
            const isCommunicationNameTrigger = triggerId === 10;
            var checkTriggerType = (triggerId === 9 || triggerId === 11) && !isCommunicationNameTrigger;

            var findTriggerBaseDDL;

            if (findTriggerSource?.[0]?.isDDLExist) {
                const payload = {
                    clientId,
                    userId,
                    departmentId,
                    triggerSourceId: findTriggerSource?.[0]?.triggerId,
                    triggerddlValue: '',
                };
                const res = await dispatch(getTriggerBaseDDLData({ payload, loading: false }));

                findTriggerBaseDDL = res?.data?.filter((item) => {
                    return item.id == tempArrRule[i]?.RuleAttributes[0].RudimentaryTableName;
                });

                if (!findTriggerBaseDDL?.length) {
                    // Handle special case migrated accounts: check by `value` if `id` did not match
                    findTriggerBaseDDL = res?.data?.filter((item) => {
                        return item.value === tempArrRule[i]?.RuleAttributes[0].RudimentaryTableName;
                    });
                }

                // findTriggerBaseDDL = [
                //     {
                //         id: 'conversion09.resulticks.net',
                //         value: 'conversion09.resulticks.net',
                //     },
                // ].filter((item) => {
                //     return item.id == tempArrRule[i]?.RuleAttributes[0].RudimentaryTableName;
                // });
            }

            const triggerAttrRes = await dispatch(
                getTriggerAttributes({
                    payload: {
                        clientId,
                        userId,
                        departmentId,
                        triggerSourceId: findTriggerSource?.[0]?.triggerId,
                        triggerddlValue: findTriggerBaseDDL?.[0]?.id || '',
                    },
                }),
            );
            if (triggerAttrRes?.status) {
                triggerAttrArr = {
                    ...triggerAttrArr,
                    [findTriggerSource?.[0]?.triggerId]: [...(triggerAttrRes?.data ?? [])],
                };
            }

            let tempRule = {
                MatchType: tempArrRule[i]?.MatchType,
                MatchCount: tempArrRule[i]?.MatchCount,
                RuleType: tempArrRule[i]?.RuleType,
                TriggerName: findTriggerSource?.[0],
                pages: findTriggerSource?.[0]?.isDDLExist ? findTriggerBaseDDL?.[0] : '',
                RuleAttributes: [],
            };
            title[i] = tempArrRule[i]?.RuleType;
            let groupTemp = [...(group ?? [])];
            groupTemp.push(tempArrRule[i]?.RuleType?.includes('Inclusion') ? 'Inclusion' : tempArrRule[i]?.RuleType);
            if (isMounted.current) setGroup([...groupTemp]);
            // group[i] = tempArrRule[i]?.RuleType?.includes('Inclusion') ? 'Inclusion' : tempArrRule[i]?.RuleType;
            for (var j = 0; j < (RuleAttributes?.length ?? 0); j++) {
                let findTriggerAttributes =
                    findTriggerSource?.[0]?.triggerId === 14
                        ? triggerAttrArr[findTriggerSource?.[0]?.triggerId]?.filter(
                              (item) => item.value == RuleAttributes[j]?.SourceName,
                          )
                        : triggerAttrArr[findTriggerSource?.[0]?.triggerId]?.filter(
                              (item) => item.value == RuleAttributes[j]?.Name,
                          );
                if (!findTriggerAttributes?.length) {
                    findTriggerAttributes = triggerAttrArr[findTriggerSource[0]?.triggerId]?.filter(
                        (item) => String(item?.id) === String(RuleAttributes[j]?.Id),
                    );
                }
                if (!findTriggerAttributes?.length) {
                    findTriggerAttributes = triggerAttrArr[findTriggerSource?.[0]?.triggerId]?.filter(
                        (item) => String(item?.id) === String(RuleAttributes[j]?.Id),
                    );
                }
                if (findTriggerSource?.[0]?.triggerId === 14) {
                    findTriggerAttributes = triggerAttrArr[findTriggerSource?.[0]?.triggerId]?.filter(
                        (item) => item.id == RuleAttributes[j]?.Id,
                    );
                }
                if (
                    formatName(RuleAttributes[j]?.SourceName) === 'attributes' ||
                    formatName(RuleAttributes[j]?.SourceName) === 'eventbrite' ||
                    formatName(RuleAttributes[j]?.SourceName) === 'forms' ||
                    (findTriggerSource?.[0]?.triggerId === 18 &&
                        (formatName(RuleAttributes[j]?.Name) === 'beacon' ||
                            formatName(RuleAttributes[j]?.Name) === 'city/area'))
                ) {
                    const handleAttributeName = () => {
                        if (
                            formatName(RuleAttributes[j]?.SourceName) === 'attributes' ||
                            formatName(RuleAttributes[j]?.SourceName) === 'eventbrite' ||
                            formatName(RuleAttributes[j]?.SourceName) === 'forms'
                        ) {
                            return RuleAttributes[j]?.SourceName;
                        } else if (
                            findTriggerSource?.[0]?.triggerId === 18 &&
                            (formatName(RuleAttributes[j]?.Name) === 'beacon' ||
                                formatName(RuleAttributes[j]?.Name) === 'city/area')
                        ) {
                            return RuleAttributes[j]?.Name;
                        }
                    };
                    const values = {
                        triggerddlValue: '',
                        attributeName: handleAttributeName(),
                        triggerSourceId: findTriggerSource?.[0]?.triggerId,
                        fieldType: RuleAttributes[j].FieldType,
                        value: RuleAttributes[j].Name,
                        formId: RuleAttributes[j].formId,
                        dataAttributeId: RuleAttributes[j].dataAttributeId,
                        id: RuleAttributes[j].Id,
                    };
                    const attributeData = await handleFromAttributesApiData(values);
                    formAgainstAttributeData.level1[RuleAttributes[j].formId] = attributeData.level1;
                    formAgainstAttributeData.level2[RuleAttributes[j].formId + '_' + RuleAttributes[j].Name] = attributeData.level2;
                }

                let customData = [];
                for (var k = 0; k < (RuleAttributes[j]?.Customevent_attributes?.length ?? 0); k++) {
                    setRuleIndex(j);
                    const payload = {
                        triggerddlValue: findTriggerSource?.[0]?.isDDLExist ? findTriggerBaseDDL?.[0]?.id : '',
                        attributeName: 'Custom events',
                        triggerSourceId: findTriggerSource?.[0]?.triggerId,
                        fieldType: 'D',
                        departmentId: departmentId,
                        clientId: 1,
                        levelNo: '',
                        formId: '',
                        columnName: RuleAttributes[j]?.Value,
                        attributevalue: '',
                    };
                    let res = {};
                    if (RuleAttributes[j]?.Value === '') {
                        res = await dispatch(getTriggerAttributeValuesData({ payload }));
                    } else {
                        res = await dispatch(getCustomEventsValueData({ payload }));
                    }
                    if (res?.status) {
                        let findCustomAttributes = res?.data?.filter(
                            (item) => item.value === RuleAttributes[j]?.Customevent_attributes[k].cName,
                        );
                        let tempCustom = {
                            attributeName: findCustomAttributes?.[0],
                            // attributeValue: RuleAttributes[j]?.Customevent_attributes[k].cValue,
                            attributeValue: RuleAttributes[j]?.Customevent_attributes[k].cValue?.split(','),
                            attributeType: '',
                            // attributeMultipleValues: [RuleAttributes[j]?.Customevent_attributes[k].cValue],
                            attributeMultipleValues: RuleAttributes[j]?.Customevent_attributes[k].cValue?.split(','),
                            // attributeComparison: RuleAttributes[j]?.Customevent_attributes[k].cFilterText,
                            attributeComparison: convertComparisonValue(
                                RuleAttributes[j]?.Customevent_attributes[k].cFilterText,
                                RuleAttributes[j]?.Customevent_attributes[k].cFieldType,
                                'edit'
                            ),
                        };
                        customData.push(tempCustom);
                    }
                }
                const { attributeFrom, attributeTo, attributeValue, range } = extractAttributeValuesInEditFlow(
                    RuleAttributes[j],
                    findTriggerSource,
                    checkTriggerType,
                );

                // Get the attributeComparison first to check if it's "Has value" or "Has no value"
                const attributeComparison = checkTriggerType
                    ? ''
                    : handleAttributeComparison(RuleAttributes[j], findTriggerSource, getAttributeValue);
                
                // For "Has value" and "Has no value", always set attributeValue to empty string
                const isHasValueOperator = attributeComparison === 'Has no value' || attributeComparison === 'Has value';
                const finalAttributeValue = isHasValueOperator ? '' : (attributeValue || '');

                let ruleAttrTemp = {
                    attributeName:
                        resolveAttributeName(
                            findTriggerSource,
                            RuleAttributes[j],
                            findTriggerAttributes,
                        ) || {
                            fieldType: RuleAttributes[j]?.FieldType || 'D',
                            id: parseInt(RuleAttributes[j]?.Id, 10) || RuleAttributes[j]?.Id,
                            value: RuleAttributes[j]?.Name || '',
                            placeholder: 'Select',
                        },
                    attributeValue: finalAttributeValue,
                    attributeFrom: attributeFrom || '',
                    attributeTo: attributeTo || '',
                    range: range || '',
                    attributeType: '',
                    attributeMultipleValues: checkTriggerType
                        ? ''
                        : RuleAttributes[j].FieldType === 'AN'
                        ? new Date(RuleAttributes[j]?.Value.split(','))
                        : RuleAttributes[j]?.Value?.split(',').map((part) => part?.split(':@@;')[0]), //
                    //RuleAttributes[j]?.Value.split(','),
                    attributeComparison: attributeComparison,
                    attributeCustom: [...customData],
                    mandatory: RuleAttributes[j]?.Mandatory === '1',
                    formId: RuleAttributes[j]?.formId || '',
                    isPeroidValue:
                        RuleAttributes[j]?.Frequency && safeObjectKeys(RuleAttributes[j]?.Frequency).length
                            ? RuleAttributes[j]?.Frequency
                            : '',
                    TimerFrom: new Date(RuleAttributes[j]?.RecencyFrequency?.DateRange_From) || '',
                    TimerTo: new Date(RuleAttributes[j]?.RecencyFrequency?.DateRange_To) || '',
                    frequency: RuleAttributes[j]?.RecencyFrequency?.Times || '',
                    recency: RuleAttributes[j]?.RecencyFrequency?.durationType,
                    ...(findTriggerSource?.[0]?.triggerId === 18 &&
                        formatName(RuleAttributes[j]?.Name) === 'locationurl' && {
                            map: RuleAttributes[j]?.Value?.split('^')[1]
                                ? parseAudienceJsonArray(RuleAttributes[j]?.Value?.split('^')[1], [])
                                : [],
                        }),
                };
                if (isCommunicationNameTrigger) {
                    ruleAttrTemp.attributeChannelValues = RuleAttributes[j]?.attributeChannelValues || '';
                    ruleAttrTemp.attributeActionValues = RuleAttributes[j]?.attributeActionValues || '';
                }
                // Geofence Action is multi-select: bind saved Value (e.g. "In" or "In,Out") as array of objects
                if (ruleAttrTemp.attributeName?.value === 'Geofence' && RuleAttributes[j].Value != null) {
                    const actionStr = String(RuleAttributes[j].Value).trim();
                    ruleAttrTemp.attributeValue = actionStr
                        ? actionStr.split(',').map((s) => s.trim()).filter(Boolean).map((v) => ({ value: v }))
                        : [];
                }
                tempRule.RuleAttributes.push(ruleAttrTemp);
            }


            temp.rule.push(tempRule);
        }
        //debugger
        if (!isMounted.current) return;
        setEditListName(temp?.dynamicListName ?? '');
        reset((formState) => {
            return {
                ...formState,
                ...temp,
            };
        });
        } catch {
            if (isMounted.current) setGetDlFail(true);
        } finally {
            if (isMounted.current) setEditDataLoading(false);
        }
    };

    useEffect(() => {
        const nextSession = `${clientId}_${departmentId}`;
        if (dynamicListSessionRef.current === nextSession) return;
        dynamicListSessionRef.current = nextSession;

        if (!isUpdate) {
            dispatch(resetDynamicListState());
            clearDynamicListApiCaches();
            reset(FORM_INITIAL_STATE.defaultValues);
            setTitle(['Rule']);
            setGroup([]);
            setOffClick(true);
            setNameExists(true);
            setControllEditModeApiCall(false);
            setTriggerValues([]);
        }
    }, [clientId, departmentId, isUpdate, dispatch, reset]);

    useEffect(() => {
        if (!isUpdate || !editListControllRef?.current || !rfaapprovalList?.length) return;

        let cancelled = false;
        void (async () => {
            try {
                let res = {};
                if (queryParamDetails?.from === 'dashboard') {
                    const { createRuleData } = await import('./constant');
                    res = createRuleData(queryParamDetails) ?? {};
                }
                if (!cancelled && isMounted.current) {
                    await getEditListData(res);
                }
            } catch {
                if (isMounted.current) setGetDlFail(true);
            }
        })();

        return () => {
            cancelled = true;
            editListAPI.reset();
        };
    }, [departmentId, isUpdate, editListControllRef, rfaapprovalList]);

    useEffect(() => {
        checkRequestApproval(approvalList?.name, approvalList?.requestApproval, dispatchState);
    }, [rule, approvalList?.name]);

    const addRule = async (idx, text) => {
        try {
        setErrorGroup(title?.[title?.length - 1]);
        const duplicateStatus = repeatedGroupValuesCheck(rule ?? []);
        if (duplicateStatus?.duplicateIndex >= 0) {
            setDuplicateRule({
                show: true,
                index: duplicateStatus?.duplicateIndex,
            });
        } else {
            setDuplicateRule({
                show: false,
                index: null,
            });
        }
        var checkRepeated = repeatedValuesCheck(
            rule?.[idx]?.RuleAttributes,
            idx,
            rule?.[idx]?.TriggerName?.triggerId,
        );
        const isRuleValid = await trigger(`rule.${idx}`);
        var validCheck =
            rule?.[idx]?.TriggerName?.triggerId >= 9 && rule?.[idx]?.TriggerName?.triggerId <= 11 ? true : isRuleValid;
        var matchTypeCheck = MatchTypeCheck(
            rule?.[idx]?.RuleAttributes,
            rule?.[idx]?.MatchType,
            rule?.[idx]?.MatchCount,
        );

        if (duplicateStatus?.duplicateIndex < 0) {
            if (rule?.[idx]?.TriggerName !== '' && validCheck && matchTypeCheck && checkRepeated?.[0]) {
                if (!(idx === 1 && text === 'Inclusion')) {
                    let temp = [...title];
                    temp.push(text);
                    setTitle([...temp]);
                }
                let groupTempValue = removeDuplicates(group);
                // let groupTemp = [...group];
                let groupTemp = [...groupTempValue];
                groupTemp.push(text);
                setGroup([...groupTemp]);
                if (idx === 0 && text === 'Inclusion') {
                    let temp = [...title];
                    temp.splice(0, 1, 'Inclusion Group 1');
                    temp.splice(1, 1, 'Inclusion Group 2');
                    setTitle([...temp]);
                } else if (text === 'Exclusion') {
                    // setSourceData([...TRIGGER_SOURCE.data]);
                }
                ruleAppend({
                    MatchType: 'All',
                    MatchCount: '',
                    RuleType: '',
                    TriggerName: '',
                    pages: '',
                    RuleAttributes: [
                        {
                            attributeName: '',
                            attributeValue: '',
                            attributeType: '',
                            attributeMultipleValues: [],
                            attributeComparison: '',
                            attributeTo: '',
                            attributeCustom: [],
                            mandatory: false,
                        },
                    ],
                });
                dispatchState({
                    type: 'UPDATE',
                    payload: rule?.[idx],
                    field: rule?.[idx]?.TriggerName?.name,
                });
                setDuplicateRule({
                    show: false,
                    index: 0,
                });
            } else if (checkRepeated?.length > 1) {
                //setValue(checkRepeated[1], checkRepeated[2]);
                //trigger(checkRepeated[1]);
                setDuplicateRule({
                    show: true,
                    index: checkRepeated[3],
                });
            } else if (!matchTypeCheck) {
                setWarningCount(true);
                setError(`rule[${idx}].MatchCount`, {
                    type: 'custom',
                    message: 'Enter the no. of condition(s)',
                });
            } else {
                trigger(`rule.${idx}`);
            }
        }
        } catch {
            // no-op — rule append validation should not crash the page
        }
    };

    useEffect(() => {
        if (!isMounted.current) return;
        const statusCrossDevice = checkCrossDevice({ rule });
        if (!statusCrossDevice && getValues('crossDevice')) {
            setValue('crossDevice', false);
        }
        setShowCrossDevice(statusCrossDevice);
    }, [rule]);

    const removeRule = (idx, status) => {
        if (status) {
            ruleRemove(idx);
        }
        title.splice(idx, 1);
        if (title?.length === 1 || title[1] === 'Exclusion') {
            let temp = [...title];

            temp.splice(0, 1, 'Rule');
            setTitle([...temp]);
        }
        let tempGrp = group.slice(idx, 1);
        setGroup(tempGrp);
    };
    const handleApproveDynamicList = async () => {
        const payload = {
            dynamicListId: editListID,
            departmentId,
            clientId,
            userId,
        };
        if (tempUserId?.length > 0) {
            if (!isMounted.current) return;
            setIsActionLoading(true);
            try {
            const res = await dispatch(approveDynamicList({ payload }));
            if (!isMounted.current) return;
            if (res?.status) {
                setRFAAlert((prev) => ({
                    ...prev,
                    content: 'Dynamic list approved successfully',
                    show: true,
                }));

                setTimeout(() => {
                    if (!isMounted.current) return;
                    navigateToAudienceDynamicList();
                }, 5000);
            }
            } catch {
                // approval failure handled by global error state
            } finally {
                if (isMounted.current) setIsActionLoading(false);
            }
        } else {
            setRFAAlert((prev) => ({
                ...prev,
                content: YOU_ARE_NOT_APPROVER,
                show: true,
            }));
        }
    };
    const handleCloseReject = async () => {
        setRFAAlert((prev) => ({
            ...prev,
            reject: false,
        }));
    };
    const handleRejectDynamicList = async () => {
        const payload = {
            dynamicListId: editListID,
            departmentId,
            clientId,
            userId,
            comments: approvalcomments,
        };

        if (!isMounted.current) return;
        setIsActionLoading(true);
        try {
        const res = await dispatch(rejectDynamicList({ payload }));
        if (!isMounted.current) return;
        if (res?.status) {
            navigateToAudienceDynamicList();
        }
        } catch {
            // rejection failure handled by global error state
        } finally {
            if (isMounted.current) setIsActionLoading(false);
        }
    };
    const handleTimeZoneDetail = useCallback(async () => {
        const payload = {
            departmentId,
            clientID: clientId,
            userId,
        };
        try {
            const response = await dispatch(getTimezoneDetails(payload));
            if (!isMounted.current) return {};
            const detail = response?.status ? response?.data ?? {} : {};
            setValue('timeZoneDetail', detail);
            return detail;
        } catch {
            if (isMounted.current) setValue('timeZoneDetail', {});
            return {};
        }
    }, [clientId, departmentId, dispatch, setValue, userId]);

    const ensureTimeZoneDetail = useCallback(async () => {
        const existing = getValues('timeZoneDetail');
        if (existing?.timezoneId && existing?.timezoneName) {
            return existing;
        }
        if (timeZoneFetchRef.current) {
            return timeZoneFetchRef.current;
        }
        const fetchPromise = handleTimeZoneDetail().finally(() => {
            timeZoneFetchRef.current = null;
        });
        timeZoneFetchRef.current = fetchPromise;
        return fetchPromise;
    }, [getValues, handleTimeZoneDetail]);
    const createRuleSubmit = async (data) => {
        try {
        // Validate list name before submission
        const nameValidationPayload = {
            listName: dynamicListName?.trim(),
            clientId,
            departmentId,
            userId,
        };
        
        if(editListName?.toLowerCase() !== dynamicListName?.trim().toLowerCase()) {
            try {
                const nameValidationResult = await dispatch(isListNameExist({ 
                    payload: nameValidationPayload,
                    loading: true
                }));
                
                // If name exists (status is false), show error
                if (nameValidationResult?.status === true) {
                    setError('dynamicListName', {
                        type: 'custom',
                        message: 'List name already exists',
                    });
                    return;
                }
            } catch (error) {
                // Handle API error
                setError('dynamicListName', {
                    type: 'custom',
                    message: 'Error validating list name',
                });
                return;
            }
        }
        
        if (isDirty && approvalList?.name?.length === 0) {
            setError('approvalList.requestApproval', {
                type: 'custom',
                message: 'Please add at least one approval rule',
            });
            return;
        }

        setErrorGroup(title?.[title?.length - 1]);
        const duplicateStatus = repeatedGroupValuesCheck(rule ?? []);
        if (duplicateStatus?.duplicateIndex >= 0) {
            setDuplicateRule({
                show: true,
                index: duplicateStatus?.duplicateIndex,
            });
        } else {
            setDuplicateRule({
                show: false,
                index: null,
            });
        }
        if (duplicateStatus?.duplicateIndex < 0) {
            var checkEntireValues;
            for (var i = 0; i < (rule?.length ?? 0); i++) {
                checkEntireValues = repeatedValuesCheck(
                    rule?.[i]?.RuleAttributes,
                    `rule[${i}].RuleAttributes`,
                    rule?.[i]?.TriggerName?.triggerId,
                );
                // console.log('Create ::: ', checkEntireValues);
                var matchTypeCheck = MatchTypeCheck(
                    rule?.[i]?.RuleAttributes,
                    rule?.[i]?.MatchType,
                    rule?.[i]?.MatchCount,
                );
                if (!checkEntireValues?.[0]) {
                    setValue(checkEntireValues?.[1], checkEntireValues?.[2]);
                    setDuplicateRule({
                        show: true,
                        index: checkEntireValues?.[3],
                    });
                    // trigger(checkEntireValues[1]);
                    break;
                } else if (!matchTypeCheck) {
                    setWarningCount(true);
                    setError(`rule[${i}].MatchCount`, {
                        type: 'custom',
                        message: 'Enter valid trigger condition',
                    });
                    break;
                }
            }
            if (i === (rule?.length ?? 0)) {
                const {
                    fromCampaign,
                    campaignId,
                    levelNumber,
                    parentChannelDetailId,
                    parentChannelDetailType,
                    actionId,
                } = mdcChannelDetails ?? {};

                let temp = {
                    rule: {
                        RuleSummary: '',
                        RulesGroup1: [],
                        RulesGroup2: [],
                    },
                    _ruleJSON: {
                        noOfRules: 0,
                        Version: 0,
                    },

                    noOfRules: rule?.length ?? 0,
                    dynamicListName: data?.dynamicListName ?? '',
                    dynamicListId: isUpdate ? parseInt(editListID, 10) : 0,
                    IsRequestApproval: true,
                    RequestApproval: [],
                    fromCampaign: fromCampaign || '',
                    CampaignId: campaignId || 0,
                    levelNumber: levelNumber || 0,
                    parentChannelDetailId: parentChannelDetailId || 0,
                    actionId: actionId || 0,
                    parentChannelDetailType: parentChannelDetailType || 0,
                    departmentId: departmentId,
                    clientId,
                    isMDC: queryParamDetails?.fromCampaign === 'M' ? true : false,
                };
                const crossDeviceStatus = checkCrossDevice(data ?? {});
                await ensureTimeZoneDetail();
                if (!isMounted.current) return;
                const submitData = getValues();
                const { BuildCreatePayload } = await import('./constant');
                const payload = BuildCreatePayload(submitData, temp, rule ?? [], window.location, crossDeviceStatus);

                if (!isMounted.current) return;
                setIsActionLoading(true);
                try {
                const res = await dispatch(createDynamicList({ payload , loading: false}));
                if (!isMounted.current) return;
                if (res?.status) {
                    if (campaignType === 'M') {
                        handleMdcNavigation(res);
                    } else {
                        navigateToAudienceDynamicList();
                    }
                } else if (res?.message === "'approverName'") {
                    // setError(`approvalList?.name[${isRequestApproved?.index}]?.approverName`);
                    trigger(`approvalList?.name[${isRequestApproved?.index}]?.approverName`);
                } else {
                    return;
                }
                } catch {
                    // create failure handled by global error state
                } finally {
                    if (isMounted.current) setIsActionLoading(false);
                }
            } else {
                // console.log('check values...');
            }
        }
        } catch {
            if (isMounted.current) setIsActionLoading(false);
        }
    };
    // const value = { ListState, dispatchState, ruleIndex, setRuleIndex };

    const value = useMemo(
        () => ({
            ListState,
            dispatchState,
            ruleIndex,
            setRuleIndex,
            duplicateRule,
            setDuplicateRule,
            triggerValues,
            setTriggerValues,
            isUpdate,
            controllEditModeApiCall,
            setControllEditModeApiCall,
            setErrorCustomGroup,
            errorCustomGroup,
            ensureTimeZoneDetail,
        }),
        [ListState, ruleIndex, duplicateRule, triggerValues, isUpdate, controllEditModeApiCall, ensureTimeZoneDetail],
    );
    const handleMdcNavigation = (res) => {
        const { data: dynamicListId } = res ?? {};
        const {
            fromCampaign,
            campaignId,
            campaignName,
            levelNumber,
            parentChannelDetailId,
            parentChannelDetailType,
            actionId,
            nodeId,
            channelId,
            campaignDetails,
        } = mdcChannelDetails ?? {};
        const paramData = {
            ...(campaignDetails ?? {}),
            dynamicListDetails: {
                fromCampaign,
                campaignId,
                campaignName,
                levelNumber,
                parentChannelDetailId,
                parentChannelDetailType,
                actionId,
                nodeId,
                channelId,
                dynamicListId,
            },
        };
        const encryptState = encodeUrl(paramData);
        const mdcUrl = `/communication/mdc-workflow`;
        navigate(`${mdcUrl}?q=${encryptState}`);
    };
    const handleMdcCancelNavigation = () => {
        const { campaignDetails } = mdcChannelDetails ?? {};
        const paramData = {
            ...(campaignDetails ?? {}),
        };
        const encryptState = encodeUrl(paramData);
        const mdcUrl = `/communication/mdc-workflow`;
        navigate(`${mdcUrl}?q=${encryptState}`);
    };
    useEffect(() => {
        if (getValues('dynamicListName') !== '' && isUpdate) {
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'isValidListname',
            });
        }
    }, [getValues('dynamicListName')]);

    useEffect(() => {
        const tempApprovalList = {
            name: [{ approverName: '', mandatory: false }],
            requestApproval: false,
            approvalFrom: 'All',
            approvalCount: '2',
            followHierarchy: false,
        };
        if (isDirty && approvalList?.name?.length === 0) {
            reset((formstate) => ({
                ...formstate,
                approvalList: tempApprovalList,
            }));
        }
    }, [isDirty]);
    const handleEditLoadBack = () => {
        setGetDlFail(false);
        navigateToAudienceDynamicList();
    };
    const handleErrClose = () => {
        if (getDlFail) {
            handleEditLoadBack();
        }
    };
    const backState = {
        index: 2,
    };
    const encryptBackState = encodeUrl(backState);

    const checkCrossDevice = (formState) => {
        const allRules = formState?.rule || [];

        const inclusionRules = allRules.filter(
            ({ RuleType }) => RuleType === 'Inclusion Group 1' || RuleType === 'Inclusion Group 2',
        );

        const hasTrigger1 = inclusionRules.some(({ TriggerName }) => Number(TriggerName?.triggerId) === 1);
        const hasTrigger5 = inclusionRules.some(({ TriggerName }) => Number(TriggerName?.triggerId) === 5);

        if (!hasTrigger1 || !hasTrigger5) return false;

        // if (formState?.RuleCondition) {
        //     return false;
        // }

        return true;
    };
    return (
        // Contend holder starts
        <FormProvider {...methods}>
            <DynamicListCreateContext.Provider value={value}>
                <div className="page-content-holder">
                    {/* Main page heading block starts */}
                    {/* <div className={'click-off'}> */}
                    <RSPageHeader
                        title={isUpdate ? EDIT_DYNAMIC_LIST : NEW_DYNAMIC_LIST}
                        rightCommonMenus
                        isBuDisabled
                        isAgencyDisabled
                        isBack
                        backPath={`/audience?q=${encryptBackState}`}
                        state={{ index: 2 }}
                    />
                    {/* </div> */}

                    {/* Main page heading block ends */}
                    {/* Main page content block starts */}
                    <Container fluid>
                        <div className='page-content'>
                            <Container className='px0'>
                                <div className={` page-content CreateDynamicListCSS d-grid`}>
                            <form onSubmit={handleSubmit((data) => createRuleSubmit(data))}>
                                {isEditDataLoading ? (
                                    <DynamicListCreationSkeleton showApproval={!isRFA} />
                                ) : getDlFail ? (
                                    <>
                                        <DynamicListCreationSkeleton showApproval={false} isError />
                                        <div className="buttons-holder">
                                            <RSSecondaryButton
                                                type="button"
                                                onClick={handleEditLoadBack}
                                                id="rs_DynamicListCreation_secondarycancel"
                                            >
                                                {CANCEL}
                                            </RSSecondaryButton>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                <Row className={`mt30 mb15`}>
                                    <Col sm={2}>
                                        <label className="control-label-left">{ENTER_LIST_NAME}</label>
                                    </Col>
                                    <Col
                                        sm={7}
                                        className={`pl30 pr0 ${isRFA ? 'click-off' : ''} ${
                                            new URLSearchParams(window.location.search).get('view') === 'true' ||
                                            warningListCount?.disable
                                                ? 'click-off '
                                                : ''
                                        }   `}
                                    >
                                        <ListNameExists
                                            name="dynamicListName"
                                            field="listName"
                                            maxLength={campaignType === 'M' ? MAX_LENGTH200 : MAX_LENGTH200}
                                            settings={{
                                                disabled: campaignType === 'M',
                                            }}
                                            nameExists={nameExists}
                                            onValid={(status) => {
                                                // console.log('status: ', status);
                                                if (status) {
                                                    dispatchState({
                                                        type: 'UPDATE',
                                                        payload: true,
                                                        field: 'isValidListname',
                                                    });

                                                    getTriggerSourceData();
                                                } else {
                                                    dispatchState({
                                                        type: 'UPDATE',
                                                        payload: false,
                                                        field: 'isValidListname',
                                                    });
                                                }
                                            }}
                                            onChange={(e) => {
                                                formatName(e.target.value) === formatName(editListName) ? setNameExists(true) : setNameExists(false)         
                                            }}
                                            onBlur={(e)=>{
                                                formatName(e.target.value) === formatName(editListName) ? setNameExists(true) : setNameExists(false)
                                            }}
                                            apiCallback={isListNameExist}
                                            condition={({ status }) => {
                                                // console.log('status:1 ', status);
                                                return !status;
                                            }}
                                            placeholder={DYNAMICLIST_NAME}
                                            rules={LIST_NAME_RULES(ENTER_LIST_NAME_MSG, campaignType === 'M', AUDIENCE_LIST_NAME_MAX_LENGTH200)}
                                            customErrorMessage={ENTER_LIST_NAME_MSG}
                                            campaignType={campaignType}
                                        />
                                        {/* <RSInput
                                            control={control}
                                            name="dynamicListName"
                                            placeholder={DYNAMICLIST_NAME}
                                            rules={LIST_NAME_RULES(NAME_CANNOT_BE_EMPTY)}
                                            required
                                            handleOnBlur={(e) => {
                                                const { value } = e.target;
                                                isListnameExistsCheck(value);
                                            }}
                                            disabled={isUpdate && !isUpdateList}
                                        /> */}
                                    </Col>
                                    {/* {dynamicListName !== '' && (
                                        <Col sm={2}>
                                            <div className="fg-icons ml-35 mt-2 dynamiclist-input-icon">
                                                {isUpdate && !isUpdateList && (
                                                    <>
                                                        <RSTooltip text={RENAME} position="top">
                                                            <i
                                                                id="rs_data_pencil_edit"
                                                                className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                    dispatchState({
                                                                        type: 'UPDATE',
                                                                        payload: true,
                                                                        field: 'isUpdateList',
                                                                    });
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    </>
                                                )}
                                            </div>
                                        </Col>
                                    )} */}
                                </Row>
                                <div
                                    className={
                                        new URLSearchParams(window.location.search).get('view') === 'true' ||
                                        warningListCount?.disable
                                            ? 'createDynamicListBox'
                                            : isUpdate || isValidListname || campaignType === 'M'
                                            ? 'createDynamicListBox'
                                            : 'createDynamicListBox'
                                    }
                                >
                                    {ruleFields?.map((field, fieldIndex) => {
                                         let isClickOff =
                                                    isRFA ||
                                                    new URLSearchParams(window.location.search).get('view') === 'true' ||
                                                    warningListCount?.disable ||
                                                    !(isUpdate || isValidListname || (campaignType && campaignType === 'M'));

                                                    if (!offClick) {
                                                        isClickOff = false;
                                                    }
                                        return (
                                            <div key={field.id}>
                                                <Suspense fallback={<></>}>
                                                    <RuleGrouping
                                                        key={field.id}
                                                        index={fieldIndex}
                                                        title={title?.[fieldIndex]}
                                                        sourceData={triggerSourceData ?? []}
                                                        exclusionData={triggerSourceData ?? []}
                                                        removeRule={removeRule}
                                                        ruleIndex={ruleIndex}
                                                        setRuleIndex={setRuleIndex}
                                                        getTriggerAttributesData={getTriggerAttributesData}
                                                        getTriggerBaseDDL={getTriggerBaseDDL}
                                                        ListState={ListState}
                                                        dispatchState={dispatchState}
                                                        duplicateRule={duplicateRule}
                                                        setDuplicateRule={setDuplicateRule}
                                                        setErrorGroup={setErrorGroup}
                                                        errorGroup={errorGroup}
                                                        setControllEditModeApiCall={setControllEditModeApiCall}
                                                        controllEditModeApiCall={controllEditModeApiCall}
                                                        errorCustomGroup={errorCustomGroup}
                                                        setErrorCustomGroup={setErrorCustomGroup}
                                                        isTriggerSourceLoading={triggerSourceAPI?.isLoading}
                                                        isPagesLoading={triggerBaseDDLAPI?.isLoading}
                                                        isRuleTypeListLoading={triggerAttributesAPI?.isLoading}
                                                        isClickOff={isClickOff}
                                                    />
                                                </Suspense>
                                                <div
                                                    className={`rightOutSidePlusIcon position-absolute ${isClickOff ? 'pe-none click-off' : ''}`}
                                                >
                                                    <div className="fg-icons">
                                                        {rule?.length === fieldIndex + 1 && (
                                                            <>
                                                                <div
                                                                    className={
                                                                        title[fieldIndex] === 'Exclusion'
                                                                            ? 'pe-none click-off'
                                                                            : ''
                                                                    }
                                                                >
                                                                    <BootstrapDropdown
                                                                        data={['Inclusion', 'Exclusion']}
                                                                        flatIcon
                                                                        defaultItem={
                                                                            <RSTooltip
                                                                                text={ADD_RULE_GROUP}
                                                                                position="top"
                                                                            >
                                                                                <i
                                                                                    id="rs_data_circle_plus_fill_edge"
                                                                                    className={`${circle_plus_fill_edge_medium} icon-md`}
                                                                                />
                                                                            </RSTooltip>
                                                                        }
                                                                        showUpdate={false}
                                                                        className={'no_caret'}
                                                                        disbleItems={group}
                                                                        onSelect={(item) => {
                                                                            addRule(fieldIndex, item);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {warningCount && (
                                                    <RSModal
                                                        header={TRIGGERS}
                                                        show={warningCount}
                                                        isCloseButton={true}
                                                        size="md"
                                                        body={
                                                            <>
                                                                <i
                                                                    className={`${alert_xlarge} icon-xl color-primary-orange justify-content-center mb20 d-flex`}
                                                                ></i>
                                                                <p className="text-center">
                                                                    {rule[fieldIndex]?.MatchCount <= 5
                                                                        ? SELECT_TRIGGERS_AS_SPECIFIED
                                                                        : UP_TO_5_MATCH}
                                                                </p>
                                                            </>
                                                        }
                                                        footer={
                                                            <>
                                                                <RSPrimaryButton
                                                                    onClick={() => {
                                                                        setWarningCount(false);
                                                                    }}
                                                                >
                                                                    {OK}
                                                                </RSPrimaryButton>
                                                            </>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {new URLSearchParams(window.location.search).get('view') !== 'false' && isRFA && (
                                        <div className={isRFA ? 'box-design rfa-approver-wrapper' : ''}>
                                            {isUpdateRFA?.map((item, index) => (
                                                <>
                                              <Row className="form-group mb0">
                                                <Col sm={6}>
                                                <h4 className={`mb15 ${index === 0 ? '': 'd-none'}`}>Approver(s)</h4>
                                                    <Row className="align-items-center align-items-stretch">
                                                    {/* <Col sm={4}>
                                                        <label className={`control-label-left ${index === 0 ? '': 'd-none'}`}>Approver(s)</label>
                                                    </Col> */}
                                                    <Col className={`${isRFA ? 'pe-none click-off' : ''} pr80`}>
                                                        <p className={`rfa-approver-email ${index === 0 && isUpdateRFA?.length === 1 ? '': 'mb23'}`}>
                                                        <strong>{item?.approverEmail}</strong>
                                                        </p>
                                                    </Col>
                                                    </Row>
                                                </Col>

                                                     <Col sm={6}>
                                                     {item?.makeChangesComments?.length &&
                                                      <h4 className={`mb15 ${index === 0 ? '': 'd-none'}`}>Comments</h4>
                                                     }
                                                    <Row className="align-items-center align-items-stretch">
                                                    {/* <Col sm={3}>
                                                        <label className={`control-label-left ${index === 0 ? '': 'd-none'}`}>Comments</label>
                                                    </Col> */}

                                                    <Col className={isRFA ? 'pe-none click-off' : ''}>
                                                        <p>{item?.makeChangesComments}</p>
                                                         {/* {index < isUpdateRFA?.length - 1 && (
                                                        <p style={{ margin: "10px 0" }}></p>
                                                        )} */}
                                                    </Col>
                                                    </Row>
                                                </Col>
                                                </Row>
                                                </>
                                            ))}
                                        </div>
                                    )}
                                <div className="position-relative">
                                    {(isUpdate || isValidListname || isDirty) && approvalList?.requestApproval && (
                                        <Suspense fallback={null}>
                                            <RequestApproval
                                            name="approvalList.name"
                                            parent="approvalList"
                                            isCustomapproval={true}
                                            isDynamic={true}
                                            isOffset={false}
                                            isOffSet={true}
                                            isCustomEnterMail={false}
                                            isAudience
                                            isDynamicList={true}
                                            isEnable={
                                                 !offClick ? '' :
                                                new URLSearchParams(window.location.search).get('view') === 'true' ||
                                                warningListCount?.disable
                                                    ? ' click-off pe-none '
                                                    : isValidListname
                                                    ? ''
                                                    : isUpdate && isUpdateRFA?.length > 0
                                                    ? 'click-off pe-none'
                                                    : isUpdate
                                                    ? ''
                                                    : 'click-off pe-none'
                                            }
                                        />
                                        </Suspense>
                                    )}
                                    {showCrossDevice && (
                                        <div
                                            className={`${
                                                !isValidListname ? 'pe-none click-off' : ''
                                            } position-absolute crossdevice top0`}
                                        >
                                            <RSCheckbox
                                                control={control}
                                                name="crossDevice"
                                                labelName={DYNAMIC_CROSS_DEVICE}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="buttons-holder">
                                    {isRFA ? (
                                        <>
                                            <RSSecondaryButton
                                                type="button"
                                                blockInteraction={isActionLoading}
                                                onClick={() => {
                                                    // navigateTab({
                                                    //     field: 'audienceTab',
                                                    //     data: 2,
                                                    //     route: `/audience`,
                                                    //     state: { index: 2 },
                                                    // });
                                                    let url = '/audience';
                                                    const state = { index: 2 };
                                                    const encryptState = encodeUrl(state);
                                                    navigate(`${url}?q=${encryptState}`, {
                                                        state,
                                                    });
                                                }}
                                            >
                                                {CANCEL}
                                            </RSSecondaryButton>
                                            {!isApprovalLinkApproved && (
                                                <>
                                                    {isRejectedLink
                                                        ? null
                                                        : !isRFAAlert?.isApproved && (
                                                              <>
                                                                  <RSSecondaryButton
                                                                      type="button"
                                                                      className="color-primary-blue"
                                                                      blockInteraction={isActionLoading}
                                                                      onClick={() => {
                                                                          if (tempUserId?.length > 0) {
                                                                              setRFAAlert((prev) => ({
                                                                                  ...prev,
                                                                                  reject: true,
                                                                              }));
                                                                          } else {
                                                                              setRFAAlert((prev) => ({
                                                                                  ...prev,
                                                                                  content:
                                                                                      YOU_ARE_NOT_APPROVER,
                                                                                  show: true,
                                                                              }));
                                                                          }
                                                                      }}
                                                                  >
                                                                      {REJECT}
                                                                  </RSSecondaryButton>
                                                                  <RSPrimaryButton
                                                                      type="button"
                                                                      isLoading={isActionLoading}
                                                                      blockBodyPointerEvents={isActionLoading}
                                                                      onClick={() => {
                                                                          handleApproveDynamicList();
                                                                      }}
                                                                  >
                                                                      {APPROVE}
                                                                  </RSPrimaryButton>
                                                              </>
                                                          )}
                                                    {/* {!isRFAAlert?.isApproved && (
                                                        <>
                                                            <RSSecondaryButton
                                                                type="button"
                                                                className="color-primary-blue"
                                                                onClick={() => {
                                                                    if (tempUserId?.length > 0) {
                                                                        setRFAAlert((prev) => ({
                                                                            ...prev,
                                                                            reject: true,
                                                                        }));
                                                                    } else {
                                                                        setRFAAlert((prev) => ({
                                                                            ...prev,
                                                                            content:
                                                                                YOU_ARE_NOT_APPROVER,
                                                                            show: true,
                                                                        }));
                                                                    }
                                                                }}
                                                            >
                                                                {REJECT}
                                                            </RSSecondaryButton>
                                                            <RSPrimaryButton
                                                                type="button"
                                                                onClick={() => {
                                                                    handleApproveDynamicList();
                                                                }}
                                                            >
                                                                {APPROVE}
                                                            </RSPrimaryButton>
                                                        </>
                                                    )} */}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <RSSecondaryButton
                                                type="button"
                                                blockInteraction={isActionLoading}
                                                onClick={() => {
                                                    if (campaignType === 'M') {
                                                        handleMdcCancelNavigation();
                                                    } else if (queryParamDetails?.from === 'dashboard') {
                                                        if (queryParamDetails?.dashboard === 'mobile') {
                                                            dispatch(update_Dashboard('Mobile live dashboard'));
                                                            if (queryParamDetails?.isMobile !== undefined) {
                                                                dispatch(
                                                                    update_isMobileAppId(queryParamDetails?.isMobile),
                                                                );
                                                                let url = '/dashboard';
                                                                const state1 = { index: 1 };
                                                                const encryptState = encodeUrl(state1);
                                                                navigate(`${url}?q=${encryptState}`, {
                                                                    state: {
                                                                        index: 1,
                                                                    },
                                                                });
                                                            }
                                                        } else {
                                                            dispatch(update_Dashboard('Web live dashboard'));
                                                            if (queryParamDetails?.isWeb !== undefined) {
                                                                dispatch(update_isWebAppId(queryParamDetails?.isWeb));
                                                                let url = '/dashboard';
                                                                const state1 = { index: 2 };
                                                                const encryptState = encodeUrl(state1);
                                                                navigate(`${url}?q=${encryptState}`, {
                                                                    state: {
                                                                        index: 2,
                                                                    },
                                                                });
                                                            }
                                                        }
                                                        // navigate('/dashboard');
                                                    } else {
                                                        // navigateTab({
                                                        //     field: 'audienceTab',
                                                        //     data: 2,
                                                        //     route: `/audience`,
                                                        //     state: { index: 2 },
                                                        // });
                                                        let url = '/audience';
                                                        const state = { index: 2 };
                                                        const encryptState = encodeUrl(state);
                                                        navigate(`${url}?q=${encryptState}`, {
                                                            state,
                                                        });
                                                    }
                                                }}
                                                id="rs_DynamicListCreation_secondarycancel"
                                            >
                                                {CANCEL}
                                            </RSSecondaryButton>
                                            {warningListCount?.disable ? null : (
                                                <RSPrimaryButton
                                                    type="submit"
                                                    isLoading={isActionLoading}
                                                    blockBodyPointerEvents={isActionLoading}
                                                    disabledClass={
                                                        new URLSearchParams(window.location.search).get('view') === 'true'? 'pe-none click-off '
                                                        : !offClick ? '' :
                                                        isUpdate? '' :
                                                        queryParamDetails?.fromCampaign === 'M' && isValid
                                                            ? ''
                                                            : isValid && approvalList?.name?.length === 0
                                                            ? ''
                                                            : isValid &&
                                                            approvalList?.requestApproval &&
                                                            !warningListCount.disable
                                                            ? duplicateRule?.show ? 'pe-none click-off' : ''
                                                        : 'pe-none click-off'
                                                    }
                                                    id="rs_DynamicListCreation_primarysubmit"
                                                >
                                                    {isUpdate ? UPDATE_RULE : CREATE_RULE}
                                                </RSPrimaryButton>
                                            )}
                                        </>
                                    )}
                                </div>
                                    </>
                                )}
                            </form>
                        </div>
                            </Container>
                        </div>
                        <WarningPopup
                            show={isRFAAlert.show}
                            handleClose={(type) => {
                                setRFAAlert((prev) => ({
                                    ...prev,
                                    content: '',
                                    show: false,
                                }));
                            }}
                            text={isRFAAlert.content}
                            isheader={true}
                            isPrimary={true}
                            isPrimaryText={OK}
                            // showCancel={true}
                        />
                        <RSModal
                            show={isRFAAlert.reject}
                            handleClose={() => {
                                if (isActionLoading) return;
                                handleCloseReject();
                            }}
                            isCloseDisabled={isActionLoading}
                            lockBackground={isActionLoading}
                            header={COMMENTS}
                            footer={
                                <>
                                    <RSSecondaryButton
                                        blockInteraction={isActionLoading}
                                        onClick={() => {
                                            setRFAAlert((prev) => ({
                                                ...prev,
                                                reject: false,
                                            }));
                                        }}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        isLoading={isActionLoading}
                                        blockBodyPointerEvents={isActionLoading}
                                        onClick={() => {
                                            if (!getValues('comments')?.length) {
                                                setError(`comments`, {
                                                    type: 'custom',
                                                    message: ENTER_COMMENTS,
                                                });
                                            } else {
                                                handleRejectDynamicList();
                                            }
                                        }}
                                    >
                                        {SAVE}
                                    </RSPrimaryButton>
                                </>
                            }
                            body={
                                <Fragment>
                                    <RSTextarea
                                        name="comments"
                                        control={control}
                                        required
                                        placeholder={COMMENTS}
                                        rules={{
                                            required: 'Required',
                                        }}
                                        maxLength={500}
                                        className="mt20"
                                        rows={5}
                                    />
                                    <div className="d-flex justify-content-end gap-2">
                                        {approvalcomments?.length >= 500 && (
                                            <small className="color-primary-red">
                                                {MAXIMUM_LIMIT_REACHED}
                                            </small>
                                        )}
                                        <small className="text-end">{approvalcomments?.length || 0}/500</small>
                                    </div>
                                </Fragment>
                            }
                        />

                        <WarningPopup
                            show={warningListCount.show}
                            handleClose={(type) => {
                                setWarningListCount((prev) => ({
                                    ...prev,
                                    show: false,
                                }));
                            }}
                            text={USED_LIST_TEXT}
                            customHeader={EDIT_DYNAMIC_LIST}
                            isPrimary={true}
                            isPrimaryText={OK}
                            isBorder
                            // showCancel={true}
                        />
                    </Container>
                    {/* Main page content block ends */}
                </div>
                {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
            </DynamicListCreateContext.Provider>
        </FormProvider>
        //Content holder ends
    );
};

export default DynamicListCreation;
