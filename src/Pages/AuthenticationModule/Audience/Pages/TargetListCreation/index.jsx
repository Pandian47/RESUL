import { validateRFAMandatory } from 'Utils/modules/campaignUtils';
import { AUDIENCE_LIST_NAME_MAX_LENGTH200, LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { formatName, numberWithCommas } from 'Utils/modules/formatters';
import { charNumUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { validateIsCustomNavigate } from 'Utils/modules/navigation';
import { safeObjectKeys } from 'Utils/modules/misc';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { _isAttributesErrors, applyLookAlikeAttributes, availableInclsuionExclusionList, checkCountTakenStatus, FILTER_GROUPS, FILTER_GROUPS_PARTNER, filterGroupLimitInMultiFilterConfig, filterGroupLimitInNormalFilterConfig, filterValue, finalAPIData, finalOrderWiseGroupLists, FORM_INITIAL_STATE, getallAttributes, getFieldObject, getFieldType, getFinalAudienceCount, getListMaxValue, getListTypeDetail, getPotentialCountPayload, handlePartnerAttributeData, INITIAL_STATE, LOOK_A_LIKE_GROUPS, makeExpressionVersium, safeParse, shortKeyNormalFlowConfig, solrFieldNameSplit, STATE_REDUCER, ZERO_DAY_FIELD_NAME, ZERO_DAY_FILES } from './constant';
import { MAX_LENGTH200, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_LIST_NAME, MINLENGTH, SPECIAL_CHATACTERS_NOT_ALlOWED ,ENTER_EXTRACTION_LIMIT} from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_GROUP, APPLY, APPROVE, APPROVER_EMAIL, APPROVER_NAME, AUDIENCE_SELECTION, CANCEL, COMMENTS, EDIT_SEGMENT, EDIT_SUB_SEGMENT_LIST, ENTER_COMMENTS, EXTRACTION_LIMIT, LOOK_ALIKE, MAX_500_CHARACTERS, MIN_POTENTIAL_AUD_LOOKALIKE, NEW_SEGMENT, NEW_SUB_SEGMENT_LIST, OK, REJECT, RENAME, SAVE, TARGETLIST_NAME, TOT_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { checkbox_mini, circle_plus_fill_edge_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, createContext, createRef, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { get as _get,isEmpty as _isEmpty} from 'Utils/modules/lodashReplacements';
import { Col, Container, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import RSPageHeader from 'Components/RSPageHeader';
import RSTooltip from 'Components/RSTooltip';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSInput from 'Components/FormFields/RSInput';
import RequestApproval from 'Pages/AuthenticationModule/Components/RequestApproval/RequestApproval';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import SegmentationRecalculate from './Components/Modals/SegmentationRecalculate/SegmentationRecalculate';
import SegmentationSave from './Components/Modals/SegmentationSave/SegmentationSave';
import Attributes from 'Pages/AuthenticationModule/Components/Attributes/Attributes';
import SegmentationLists from 'Pages/AuthenticationModule/Components/SegmentationLists/SegmentationLists';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { COMMUNICATION_AVAILABLE_TABS as availableTabs } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { segmentSkeletonCriticalCss } from 'Components/Skeleton/Components/segmentSkeletonCriticalCss';
import {
    AudienceTargetListCreationLoadingBlock,
    AudienceTargetListCreationSkeleton,
    TargetListCreationBodySkeleton,
    audienceTargetListCreationCriticalCss,
    consumeAudienceRouteSkeleton,
} from 'Components/Skeleton/pages/audience';
import {
    getAttributesErrorMessageValues,
    handleDuplicateAttributes,
    transformData_subsegment,
} from 'Pages/AuthenticationModule/Components/SegmentationLists/constant';
import { getRequestApprovalUserDetails } from 'Reducers/globalState/request';

import { hasTargetListEditData, parseAudienceJsonArray, resolveSegmentListName } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import {
    approveTargetList,
    checkTargetListName,
    get_Zeroday_Header_Attribute,
    getIndividualTargetList,
    getTargetListPanel,
    rejectTargetList,
    updateTargetListName,
    getEditAttributeValue1AJSONTargetList,
    getExpression_byIDS,
    allGroupAudienceGroup,
    targetListSubSegmentById,
    getTargetListPanelByAdhocList,
    getVirtualFieldData,
    getFullAttributeJSONValues,
    get_Zeroday_AttributeValues,
} from 'Reducers/audience/targetListCreation/request';
import { getSessionId, getRequestApprovalList } from 'Reducers/globalState/selector';

import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSModal from 'Components/RSModal';
import { communicationNamevalidtor } from 'Utils/HookFormValidate';
import { setTabforEdit, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';
import { resetTLLeftJSON, update_target_list } from 'Reducers/audience/targetListCreation/reducer';
import { saveFilterJSON_Versium } from 'Reducers/remoteDataSource/request';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { getAttributeValues_zeroDay } from 'Reducers/audience/targetListCreation/request';
export const TargetListContext = createContext({
    targetListState: {},
    dispatchState: () => {},
    handleZeroDayAttributes: () => {},
    isUpdate: false,
    updateId: 0,
    apicallStatusDetail: {},
});

var isUniqueID = uuid();

const TargetListCreation = () => {
    const navigate = useNavigate();
    const navigateToAudienceTargetList = useCallback(() => {
        const url = '/audience';
        const index = 1;
        const state1 = { index };
        const encryptState = encodeUrl(state1);
        navigate(`${url}?q=${encryptState}`, {
            state: { index },
        });
    }, [navigate]);
    const location = useLocation();
    const queryParams = useQueryParams('/audience');
    const locationVersium = useMemo(() => {
        const navigationState = location.state || {};
        if (!queryParams) {
            return Object.keys(navigationState).length ? navigationState : null;
        }
        if (queryParams.__v === 2 && queryParams.__sid) {
            return Object.keys(navigationState).length ? navigationState : null;
        }
        return { ...queryParams, ...navigationState };
    }, [queryParams, location.state]);
    const listNameRef = useRef('');

    const { ispartnerDigipop } = getUserDetails();
    // console.log('locationVersium: ', locationVersium);
    // const isUpdate = location?.state?.mode === 'edit';
    let updateId =
        locationVersium?.isMDCSubSegment && locationVersium?.mdcSegmentMode === 'edit'
            ? locationVersium?.subSegmentId
            : location?.state?.segmentationListID;
    let islistType = new URLSearchParams(window.location.search).get('listType') || '0';
    let updateVersium = locationVersium?.from?.type === 'versium';
    const disablePartnerData = updateVersium ? true : false;
    const dispatch = useDispatch();
    const saveFilterVersiumApi = useApiLoader({ autoFetch: false, abortable: false });
    const leftPannelJSONAPI = useApiLoader({ actionCreator: getTargetListPanel, autoFetch: false });
    const editListAPI = useApiLoader({ actionCreator: getIndividualTargetList, autoFetch: false });
    const fullAttributeJSONAPI = useApiLoader({ actionCreator: getFullAttributeJSONValues, autoFetch: false });
    const apiRefs = useRef({
        leftPannelJSONAPI,
        editListAPI,
        fullAttributeJSONAPI,
    });
    apiRefs.current = { leftPannelJSONAPI, editListAPI, fullAttributeJSONAPI };

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const {
        leftPanelAtt,
        leftPanelAtt_Adhoc,
        leftPanelAtt_Zero,
        editList,
        rfaList,
        SubSegmentExp_List,
        oneAJSON,
        fullAttributeJSONValues,
    } = useSelector((state) => state?.dataTargetListReducer ?? {});
    const basePayload = { departmentId, clientId, userId };
    
    const rfaapprovalList = useSelector((state) => getRequestApprovalList(state)) ?? [];
    const { failureApiErrors, isCurrentBURFAStatus } = useSelector((state) => state?.globalstate ?? {});
    let tempUserId = rfaapprovalList.filter((e) => e.userId === userId);
    const [targetListState, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    const zeroDayGroupRef = useRef();
    const filterGroupRef = useRef();
    const allInOneRef = useRef({});
    const inclusionGroupRef = useRef();
    const exclusionGroupRef = useRef();
    const lookALikeAudGroupRef = useRef();
    const isPartnerSavedRef = useRef(false);
    const lookALikeAttrGroupRef = useRef();
    const [editListID, setEditListId] = useState(0);
    const [isUpdate, setUpdate] = useState(false);
    const [isRFA, setRFA] = useState(false);
    const [isRFARejectComments, setRFARejectComments] = useState(false);
    const [isRFAAlertReject, setisRFAAlertReject] = useState(false);
    const [ispartnerDigipopstate, setIspartnerDigipopstate] = useState({});
    const [isFinalCount, setIsFinalCount] = useState(true);
    const [editListName, setEditListName] = useState('');
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [isRFAAlert, setRFAAlert] = useState({
        show: false,
        content: '',
        reject: false,
        isApproved: false,
    });
    const [showActiveCommunicationListWarning, setShowActiveCommunicationListWarning] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const apicallStatusDetail = useRef({
        fullAttributeJSONAPICall: false,
        oneAJSONAPICallStatus: false,
    });

    const {
        leftPanelAttributes,
        filterGroups,
        isValidListname,
        isOpenSegmentModal,
        isBQAudienceCount,
        isAPIRequest,
        isListField,
        attributesError,
        isZeroDayFiles,
        zeroDayConstructed,
        attributesData,
        attributeTypes,
        isLoadingListname,
        attributesLoading,
        adhocLeftPanelLoading,
        editListLoading,
        editLoadFailed,
        calculateLater,
        searchAttributes,
        isPartnerAttSaved,
        partnerData
    } = targetListState;
    const methods = useForm(FORM_INITIAL_STATE);
    const {
        control,
        handleSubmit,
        watch,
        trigger,
        setValue,
        setError,
        setFocus,
        formState: { isValid, isDirty, errors },
        getValues,
        reset,
        clearErrors,
    } = methods;
    const approvalList = watch('approvalList');
    const approvalcomments = watch('comments');
    const extractionCheck = watch('extractionCheck');
    const attributes = watch();
    // console.log('@@@attributes: ', attributes);
    const {
        zeroDayLists,
        filterLists,
        inclusionLists,
        exclusionLists,
        attributeslistCount,
        segmentation,
        lookALikeAudLists,
        lookALikeAttrLists,
        FinalAudienceCount,
    } = attributes;
    const groupsSet = new Set(filterGroups?.groups);

    const LOOKALIKE_MIN_POTENTIAL_AUDIENCE = 1000;

    let isDisableFilterGroup = false,
        isDisableFilterGroupName = '';
    let isDisableFilterGroupNameList = [];

    if (!getAttributesErrorMessageValues(attributesError)?.every((item) => !item)) {
        if (!getAttributesErrorMessageValues(attributesError)?.includes('Select alteast one attribute')) {
            isDisableFilterGroup = true;
        }
    } else {
        isDisableFilterGroup = false;
    }

    filterGroups?.groups?.forEach((group) => {
        if (attributes[group]?.length > 25) {
            isDisableFilterGroupName = group;
            isDisableFilterGroupNameList.push(group);
            isDisableFilterGroup = true;
        }
    });

    const scrollRef = useRef();
    const wrapperRef = useRef();
    const isActiveRef = useRef(true);

    useEffect(() => {
        document.body.classList.remove('mdc-body');
        window.addEventListener('scroll', handleScroll);
        return () => {
            isActiveRef.current = false;
            const {
                leftPannelJSONAPI: leftPanel,
                editListAPI: editList,
                fullAttributeJSONAPI: fullAttributeJSON,
            } = apiRefs.current;
            resetAbortableRequests(leftPanel, editList, fullAttributeJSON);
            dispatch(resetTLLeftJSON());
            window.removeEventListener('scroll', handleScroll);
            listNameRef.current = '';
        };
    }, [dispatch]);
    useEffect(() => {
        const isApprovalLink = new URLSearchParams(window.location.search).get('rfa') || 'false';
        const isApprovalStatus = new URLSearchParams(window.location.search).get('approval') || '0';

        if (isApprovalLink === 'true' && isApprovalStatus === '2') {
            setRFA(true);
            setRFARejectComments(true);
        } else if (isApprovalLink === 'true') {
            setRFA(true);
        } else {
            setRFA(false);
            setRFARejectComments(false);
        }

        if (!rfaapprovalList?.length) {
            dispatch(
                getRequestApprovalUserDetails({
                    payload: {
                        clientId,
                        departmentId,
                        userId,
                    },
                }),
            );
        }
    }, []);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const targetListId = params.get('targetListId');
        const listType = parseInt(params.get('listType') || '0', 10);

        if (targetListId) {
            setEditListId(targetListId);
            setUpdate(true);
            updateId = targetListId;
        }

        if (listType === 16) {
            setIspartnerDigipopstate({
                listName: 'Partner data',
                listId: 2,
            });
        }
    }, [location]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const raw = params.get('communicationsentCount');
        if (raw == null || raw === '') {
            return;
        }
        const sentCount = Number(raw);
        if (!Number.isFinite(sentCount) || sentCount <= 0) {
            return;
        }
        setShowActiveCommunicationListWarning(true);
    }, [location.search]);

    useEffect(() => {
        if (!isUpdate) {
            const tempFilterGroups = {
                groups: ['filterLists'],
                activeGroup: 'filterLists',
                disableGroups: [],
                exclusionListGroup: false,
            };
            dispatchState({
                type: 'UPDATE',
                payload: tempFilterGroups,
                field: 'filterGroups',
            });
        }
    }, []);

    const handleScroll = () => {
        let scrollYAxis = window.scrollY;
        let bottomHeight = window.innerHeight + scrollYAxis;
        let scrollData = scrollRef.current?.classList;
        if (scrollYAxis > 40) {
            scrollData?.add('stickyScrollTop');
        } else {
            scrollData?.remove('stickyScrollTop');
        }
        if (bottomHeight > wrapperRef.current?.clientHeight - 30) {
            scrollData?.add('stickyScrollBottom');
        } else {
            scrollData?.remove('stickyScrollBottom');
        }
    };

    // useEffect(() => {
    //     dispatchState({
    //         type: 'UPDATE',
    //         field: 'attributesLoading',
    //         payload: true,
    //     });
    //     dispatch(
    //         getTargetListPanel(
    //             {
    //                 departmentId,
    //                 clientId,
    //                 userId,
    //                 // partnerID: locationVersium?.from?.type === 'versium' ? locationVersium?.data?.remoteSettingId : 0,
    //                 partnerID: location.state?.from?.type === 'versium' ? 40 : 0,
    //             },
    //             dispatchState,
    //         ),
    //     );
    //     if (parseInt(updateId, 10) > 0) {
    //         dispatch(getIndividualTargetList({ departmentId, listId: parseInt(updateId, 10), clientId, userId }));
    //     }
    //     if (updateVersium) {
    //         dispatchState({
    //             type: 'UPDATE',
    //             payload: true,
    //             field: 'isValidListname',
    //         });
    //     }
    // }, [isUpdate, locationVersium, updateVersium]);

    const handleEditAttribute1AJSONValueApi = async () => {
        if (!isActiveRef.current) return;

        try {
            await dispatch(
                getEditAttributeValue1AJSONTargetList(
                    {
                        departmentId,
                        listId: parseInt(updateId, 10) || 0,
                        partnerID:
                            location?.state?.from?.type === 'versium'
                                ? 40
                                : parseInt(islistType, 10) === 16 ||
                                  (safeObjectKeys(ispartnerDigipopstate).length > 0 &&
                                      ispartnerDigipopstate?.listId === 2)
                                ? 41
                                : 0,
                        clientId,
                        userId,
                        isSubSegment: Boolean(locationVersium?.isMDCSubSegment),
                    },
                    apicallStatusDetail,
                ),
            );
        } catch {
            // Request aborted or failed — skip post-unmount updates
        }
    };

    const handleLeftPanelAttributeApi = () => {
        leftPannelJSONAPI.refetch({
            payload: { ...basePayload, partnerID: getPartnerID() },
            dispatchState,
        });
    };

    const handleCurrentEditListApi = () => {
        editListAPI.refetch({
            payload: { departmentId, listId: parseInt(updateId, 10), clientId, userId },
            loading: false,
            dispatchState,
        });
    };
    const getPartnerID = () => {
        const isFromVersium = location?.state?.from?.type === 'versium' || locationVersium?.from?.type === 'versium';

        if (isFromVersium) return 40;

        const isType16 = parseInt(islistType, 10) === 16;
        const isDigiPop = safeObjectKeys(ispartnerDigipopstate).length > 0 && ispartnerDigipopstate?.listId === 2;

        return isType16 || isDigiPop ? 41 : 0;
    };

    const handleAttributeLoadingDispatch = (loadingStatus) => {
        dispatchState({
            type: 'UPDATE',
            field: 'attributesLoading',
            payload: loadingStatus,
        });
    };

    const handleTargetLeftSidePanelAttributeData = () => {
        if (locationVersium) {
            if (SubSegmentExp_List?.length) {
                const SubSegmentListResponse = SubSegmentExp_List[0];
                const listType = parseInt(SubSegmentListResponse?.listType, 10);

                if (listType === 1) {
                    dispatch(
                        getTargetListPanelByAdhocList(
                            {
                                ...basePayload,
                                listId: parseInt(SubSegmentListResponse?.segmentationListID, 10),
                                listName: SubSegmentListResponse?.segmentationName,
                                listCount: SubSegmentListResponse?.listCount,
                            },
                            dispatchState,
                        ),
                    );
                    return;
                } else {
                    dispatchState({
                        type: 'UPDATE',
                        field: 'adhocLeftPanelLoading',
                        payload: false,
                    });
                    if (!safeObjectKeys(leftPanelAtt).length) {
                        handleLeftPanelAttributeApi();
                    }
                }
            }
        }
    };

    const getExpressionByIDS = async () => {
        try {
            const payload = {
                listId: locationVersium?.listId?.toString() ?? '',
                departmentId,
                clientId,
                userId,
            };
            await dispatch(getExpression_byIDS(payload));
        } catch {
            // Request aborted or failed
        }
    };
    const getCountByExpression = async () => {
        try {
            const userInfoIds = { departmentId, clientId, userId };
            const transformedData_SubSegmentExp = transformData_subsegment(SubSegmentExp_List ?? []);
            const finalData = getPotentialCountPayload(userInfoIds, transformedData_SubSegmentExp, locationVersium);

            const response = await dispatch(allGroupAudienceGroup(finalData, false));

            if (!isActiveRef.current) return;

            const countRes = safeParse(response?.data, {});
            if (SubSegmentExp_List?.[0]?.listType !== 1) {
                setValue('totalAudiences', countRes?.FinalAudienceCount ?? 0);
            }
        } catch {
            // Request aborted or failed
        }
    };
    const handleSubSegmentEditListApi = async (locationVersiumParam) => {
        try {
            const payload = {
                departmentId,
                clientId,
                userId,
                listId: locationVersiumParam?.subSegmentId?.toString() ?? '0',
            };

            await dispatch(targetListSubSegmentById({ payload }));
        } catch {
            // Request aborted or failed
        }
    };

    const handleFullJSONAPI = async () => {
        if (fullAttributeJSONValues?.length || !isActiveRef.current) return;

        try {
            const response = await fullAttributeJSONAPI.refetch({
                payload: { clientId, departmentId, userId },
                dispatchState,
                from: 'targetList',
            });

            if (!isActiveRef.current || response == null) return;

            apicallStatusDetail.current = {
                ...apicallStatusDetail.current,
                fullAttributeJSONAPICall: true,
            };
            const params = new URLSearchParams(location?.search ?? '');
            const targetListId = params.get('targetListId');
            await handleOneAJSONAPIFunc(response?.data ?? '', true, targetListId ?? false);
        } catch {
            // Request aborted or failed
        }
    };

    useEffect(() => {
        if (parseInt(updateId, 10) > 0) {
            if (location && !locationVersium?.isMDCSubSegment) {
                dispatchState({
                    type: 'UPDATE',
                    field: 'editListLoading',
                    payload: true,
                });
                handleCurrentEditListApi();
            }
        }
        if (!safeObjectKeys(leftPanelAtt).length && !locationVersium?.isAdhocList) {
            handleLeftPanelAttributeApi();
        }
        if (location && !locationVersium?.isAdhocList) {
            handleFullJSONAPI();
        }
    }, [location, departmentId, clientId, userId]);

    useEffect(() => {
        if (!locationVersium?.isAdhocList) return;
        handleAttributeLoadingDispatch(false);
        dispatchState({
            type: 'UPDATE',
            field: 'adhocLeftPanelLoading',
            payload: true,
        });
    }, [locationVersium?.isAdhocList]);

    useEffect(() => {
        if (safeObjectKeys(ispartnerDigipopstate).length) {
            handleLeftPanelAttributeApi();
        }
    }, [ispartnerDigipopstate]);

    const handleOneAJSONAPIFunc = async (callBackFullAttributeJSONValues, isStatus, isEditFlow) => {
        if (!isActiveRef.current) return;

        try {
            if (!(isUpdate || isEditFlow)) return;

            const callStatusApi = apicallStatusDetail?.current?.fullAttributeJSONAPICall || isStatus;
            const fullJSONValue = fullAttributeJSONValues || callBackFullAttributeJSONValues;
            const hasOneAJSONData = safeObjectKeys(oneAJSON).length > 0;
            const isValidAPicall = !hasOneAJSONData && !fullJSONValue;
            const shouldCallOneAJSON = isValidAPicall && callStatusApi;

            if (!shouldCallOneAJSON) {
                if (fullJSONValue && isStatus) {
                    apicallStatusDetail.current = {
                        ...apicallStatusDetail.current,
                        oneAJSONAPICallStatus: true,
                    };
                }
                return;
            }

            if (location) {
                await handleEditAttribute1AJSONValueApi();
            } else if (locationVersium) {
                if (locationVersium?.isMDCSubSegment) {
                    if (!locationVersium?.isAdhocList) {
                        await handleEditAttribute1AJSONValueApi();
                    }
                } else {
                    await handleEditAttribute1AJSONValueApi();
                }
            }

            if (!isActiveRef.current) return;
        } catch {
            // Request aborted or failed
        }
    };

    useEffect(() => {
        void handleOneAJSONAPIFunc();
    }, [location, departmentId, clientId, userId, locationVersium, isUpdate, JSON.stringify(fullAttributeJSONValues)]);

    useEffect(() => {
        if (SubSegmentExp_List?.length > 0) {
            if (SubSegmentExp_List?.length > 0 && SubSegmentExp_List[0]?.listType !== 1) {
                setValue('totalAudiences', locationVersium?.isReceipientCount);
                getCountByExpression();
            } else {
                setValue('totalAudiences', SubSegmentExp_List[0]?.listCount);
            }
        }
    }, [SubSegmentExp_List]);
    useEffect(() => {
        if (updateVersium) {
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'isValidListname',
            });
        }
        if (locationVersium?.isMDCSubSegment) {
            getExpressionByIDS();
        }

        if (locationVersium?.isMDCSubSegment && locationVersium?.mdcSegmentMode === 'edit') {
            setUpdate(true);
            updateId = locationVersium?.subSegmentId.toString() ?? 0;
            handleSubSegmentEditListApi(locationVersium);
        }
    }, [locationVersium]);

    useEffect(() => {
        if (Object.keys(ispartnerDigipopstate)?.length > 0) {
            const tempFilterGroups = {
                groups: ['filterLists'],
                activeGroup: 'filterLists',
                disableGroups: [],
                exclusionListGroup: false,
            };
            dispatchState({
                type: 'UPDATE',
                payload: tempFilterGroups,
                field: 'filterGroups',
            });
            reset((formState) => {
                let temp = {
                    ...formState,
                    zeroDayLists: [],
                    filterLists: [],
                    inclusionLists: [],
                    exclusionLists: [],
                    lookALikeAudLists: [],
                    lookALikeAttrLists: [],
                    finalAudienceCount: 0,
                    inclusionAudience: 0,

                    approvalList: {
                        name: [{ approverName: '', mandatory: false }],
                        requestApproval: false,
                        approvalFrom: 'All',
                        approvalCount: '2',
                        followHierarchy: false,
                    },
                    attributeslistCount: {
                        zeroDayLists: [],
                        filterLists: [],
                        inclusionLists: [],
                        exclusionLists: [],
                        lookALikeAudLists: [],
                        lookALikeAttrLists: [],
                    },
                };
                return temp;
            });
        }
    }, [location, ispartnerDigipopstate]);

    useEffect(() => {
        if (locationVersium) {
            handleTargetLeftSidePanelAttributeData();
        }
    }, [SubSegmentExp_List, updateId, locationVersium]);

    useEffect(() => {
        if (leftPanelAtt?.brand_category?.length > 0) {
            if (locationVersium?.isAdhocList) return;
            getDataAttributes(leftPanelAtt, 'default');
        }
    }, [leftPanelAtt, locationVersium?.isAdhocList]);

    useEffect(() => {
        if (isPartnerSavedRef.current) return;
        if (editListLoading || editLoadFailed) return;
        if (isUpdate && hasTargetListEditData({ targetlist: [editList] }) && searchAttributes?.length > 0) {
            isPartnerSavedRef.current = true;
            if (editList?.isLookAlike === 1) {
                const recAttrs = safeParse(editList?.lookAlikeRecommendedAttributes, []);
                applyLookAlikeAttributes({
                    isLookAlike: true,
                    recommendedAttributes: recAttrs,
                    attributesData,
                    leftPanelAttributes,
                    searchAttributes,
                    dispatchState,
                });
                dispatchState({
                    type: 'UPDATE',
                    payload: recAttrs,
                    field: 'lookAlikeRecAtts',
                });
            }
            if(isPartnerAttSaved){
                dispatchState({
                    type: 'UPDATE_ATTRIBUTES',
                    field: 'default',
                    payload: {
                        attributesData: partnerData?.attributesData,
                        leftPanelAttributes: partnerData?.leftPanelAttributes,
                        searchAttributes: partnerData?.searchAttributes,
                    },
                });
            }
        }
    }, [isUpdate, editList, searchAttributes?.length, isPartnerAttSaved]);

    useEffect(() => {
        if (leftPanelAtt_Adhoc?.brand_category?.length > 0) {
            getDataAttributes(leftPanelAtt_Adhoc, 'adhoc');
        }
    }, [leftPanelAtt_Adhoc]);

    useEffect(() => {
        // dispatchState({
        //     type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
        //     field: isZeroDayFiles && filterGroups.activeGroup === 'zeroDayLists' ? 'zeroDay' : 'default',
        // });
        if (!filterGroups?.groups?.length) {
            const tempFilterGroups = { ...filterGroups };
            tempFilterGroups?.groups?.push('filterLists');
            dispatchState({
                type: 'UPDATE',
                payload: tempFilterGroups,
                field: 'filterGroups',
            });
        }
    }, [filterGroups.activeGroup]);

    useEffect(() => {
        if (editListLoading || editLoadFailed) return;
        const hasEditData = hasTargetListEditData({ targetlist: [editList] });
        if ((isUpdate && hasEditData) || updateVersium) {
            getSegmentationResult(
                attributesData,
                leftPanelAttributes,
                updateVersium,
                locationVersium,
                ispartnerDigipopstate,
            );
        }
    }, [editList, updateVersium, isUpdate, editListLoading, editLoadFailed]);

    useEffect(() => {
        if (!isUpdate || _isEmpty(rfaList) || !rfaapprovalList?.length || !isRFA) return;

        const approvalStatusParam = new URLSearchParams(window.location.search).get('approval') || '0';
        if (approvalStatusParam === '1') return;

        const approvedApprovers = rfaList.filter((approver) => approver.approvalStatus === 1);
        const rejectedApprovers = rfaList.filter((approver) => approver.approvalStatus === 2);

        const matchApproversByStatus = (statusList) =>
            rfaapprovalList.filter((approver) =>
                statusList.some((item) => item.approverEmail === approver.email),
            );

        let matchedApprovers = [];
        if (approvedApprovers.length) {
            matchedApprovers = matchApproversByStatus(approvedApprovers);
        } else if (rejectedApprovers.length) {
            matchedApprovers = matchApproversByStatus(rejectedApprovers);
        }

        const isCurrentUserMatched = matchedApprovers.filter((approver) => approver.userId === userId);

        if (isCurrentUserMatched.length === 1) {
            setRFAAlert({
                content: rejectedApprovers.length
                    ? 'Target list has been already rejected.'
                    : 'Target list has been already approved.',
                show: true,
                reject: false,
                isApproved: !rejectedApprovers.length,
            });
            setIsViewOnly(true);
            return;
        }

        if (!rfaapprovalList.some((approver) => approver?.userId === userId)) {
            setRFAAlert({
                content: 'You are not an approver for this target list.',
                show: true,
                isApproved: true,
            });
            setIsViewOnly(true);
            return;
        }

        if (rfaList[0]?.createdBy === userId) {
            setRFAAlert({
                content: 'You are not an approver for this target list.',
                show: true,
                isApproved: true,
            });
            setIsViewOnly(true);
            return;
        }

        setRFAAlert({
            show: false,
            content: '',
            reject: false,
            isApproved: false,
        });
        setIsViewOnly(false);
    }, [rfaList, isUpdate, rfaapprovalList, isRFA, userId]);
    const handleApproveDynamicList = async () => {
        const payload = {
            segmentationId: editListID,
            departmentId,
            clientId,
            userId,
        };
        if (tempUserId?.length > 0) {
            if (!isActiveRef.current) return;
            setIsActionLoading(true);
            try {
                const res = await dispatch(approveTargetList({ payload }));
                if (!isActiveRef.current) return;
                if (res?.status) {
                    setRFAAlert((prev) => ({
                        ...prev,
                        content: 'Target list approved successfully',
                        show: true,
                    }));

                    setTimeout(() => {
                        navigateToAudienceTargetList();
                    }, 5000);
                }
            } catch {
                // Request aborted or failed
            } finally {
                if (isActiveRef.current) setIsActionLoading(false);
            }
        } else {
            setRFAAlert((prev) => ({
                ...prev,
                content: 'You are not an approver for this target list.',
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
            segmentationId: editListID,
            departmentId,
            clientId,
            userId,
            comments: approvalcomments,
        };

        if (!isActiveRef.current) return;
        setIsActionLoading(true);
        try {
            const res = await dispatch(rejectTargetList({ payload }));
            if (!isActiveRef.current) return;
            if (res?.status) {
                setisRFAAlertReject(true);
                setTimeout(() => {
                    navigateToAudienceTargetList();
                }, 1000);
            }
        } catch {
            // Request aborted or failed
        } finally {
            if (isActiveRef.current) setIsActionLoading(false);
        }
    };
    const getDataAttributes = (data, field) => {
        try {
        if (field !== 'zeroDay') {
            const res = data ?? {};
            const brandAttributes = res?.attributesList?.filter((attributeList) => !attributeList?.partnerId) ?? [];
            const partnerAttributes = res?.attributesList?.filter((attributeList) => attributeList?.partnerId) ?? [];
            const attributesData = res?.brand_category?.map((category) => {
                const attributesLists = brandAttributes?.filter((attribute) => attribute?.category === category) ?? [];
                return { [category]: attributesLists };
            }) ?? [];

            const leftpanelAttributes = attributesData?.map((attribute) => {
                const entries = Object.entries(attribute ?? {})[0];
                if (!entries) return {};
                const [key, value] = entries;
                const sortedValues = [...(value ?? [])].sort(
                    (a, b) => (b?.sOLRCountValue ?? 0) - (a?.sOLRCountValue ?? 0),
                );
                const reorderedData = sortedValues.sort((a, b) => {
                    if (a?.name === ZERO_DAY_FIELD_NAME) return -1;
                    if (b?.name === ZERO_DAY_FIELD_NAME) return 1;
                    return 0;
                });
                const sliceValue =
                    safeObjectKeys(ispartnerDigipopstate).length > 0 && ispartnerDigipopstate?.listId === 2
                        ? 20
                        : (attributesData?.length ?? 0) > 2
                        ? 5
                        : 20;

                return { [key]: reorderedData?.slice(0, sliceValue), isExpanded: 0 };
            }) ?? [];

            const expandedKeys = leftpanelAttributes?.map((attribute) =>
                safeObjectKeys(attribute)[0]?.toLowerCase(),
            ) ?? [];
            const attributes = [];
            attributesData
                ?.filter((attribute) => {
                    const entries = Object.entries(attribute ?? {})[0];
                    if (!entries) return false;
                    const [key, value] = entries;
                    if (expandedKeys?.includes(key?.toLowerCase())) {
                        return value;
                    }
                    return false;
                })
                ?.forEach((attribute) => attributes.push(...(Object.values(attribute ?? {})?.flat() ?? [])));
            // console.log('attributesData: ', attributesData);

            if (!locationVersium?.isAdhocList && field !== 'adhoc') {
                dispatchState({
                    type: 'UPDATE_ATTRIBUTES',
                    field: field,
                    payload: {
                        attributesData: attributesData,
                        leftPanelAttributes: leftpanelAttributes,
                        searchAttributes: attributes,
                    },
                });
            } else if (locationVersium?.isAdhocList && field === 'adhoc') {
                dispatchState({
                    type: 'UPDATE_ATTRIBUTES',
                    field: field,
                    payload: {
                        attributesData: attributesData,
                        leftPanelAttributes: leftpanelAttributes,
                        searchAttributes: attributes,
                    },
                });
            }
            dispatchState({
                type: 'UPDATE',
                field: 'brandData',
                payload: {
                    attributesData: attributesData,
                    leftPanelAttributes: leftpanelAttributes,
                    searchAttributes: attributes,
                },
            });

            const normalizedAttributes = handlePartnerAttributeData(partnerAttributes);

            const categories = normalizedAttributes?.map((attr) => attr.category);

            const uniqueCategories = [...new Set(categories)];

            const groupedAttributesByCategory = uniqueCategories.map((category) => {
                const attributes = normalizedAttributes.filter((attr) => attr.category === category);

                return { [category]: attributes, ['isExpanded']: 0 };
            });

            if (partnerAttributes?.length) {
                dispatchState({
                    type: 'UPDATE',
                    field: 'partnerData',
                    payload: {
                        attributesData: groupedAttributesByCategory,
                        leftPanelAttributes: groupedAttributesByCategory,
                        searchAttributes: normalizedAttributes,
                    },
                });
            }

            setValue('totalAudiences', res?.totalPotentialCount ?? 0);
            if (SubSegmentExp_List?.length > 0 && SubSegmentExp_List?.[0]?.listType !== 1) {
                setValue('totalAudiences', locationVersium?.isReceipientCount ?? 0);
            } else if (SubSegmentExp_List?.length > 0 && SubSegmentExp_List?.[0]?.listType === 1) {
                setValue('totalAudiences', SubSegmentExp_List?.[0]?.listCount ?? 0);
            } else {
                setValue('totalAudiences', res?.totalPotentialCount ?? 0);
            }
        } else {
            const res = Array.isArray(data) ? data : [];
            const headerName = res.slice(-1).pop() ?? {};
            const uniqueKey = `${headerName?.headerName ?? ''} (${headerName?.CreatedDate ?? ''})`;
            const category = uniqueKey?.split("'");
            const attributes = res.slice(0, res?.length - 1)?.map(({ FieldName, FieldType, dataTypeId }) => ({
                FieldName,
                FieldType,
                isvirtualfield: false,
                category: uniqueKey,
                cattype: null,
                dataTypeId,
                isMultiValue: true,
                labelText: FieldName,
                name: FieldName,
                dataAttributeId: 0,
                departmentId: 1,
                fieldType: dataTypeId?.toString() ?? '',
                parentChildIdentify: null,
                sOLRCountValue: 5,
                restype: null,
                sOLRFieldName: `${FieldName ?? ''}_${FieldType ?? ''}`,
                valueCollection: null,
                indexedDate: headerName?.CreatedDate,
                audienceCount: headerName?.AudienceCount,
            })) ?? [];

            const attributesData = category?.map((categoryItem) => {
                const attributesLists = attributes?.filter((attribute) => attribute?.category === categoryItem) ?? [];
                return { [categoryItem]: attributesLists };
            }) ?? [];
            const leftpanelAttributes = attributesData?.map((attribute) => {
                const entries = Object.entries(attribute ?? {})[0];
                if (!entries) return {};
                const [key, value] = entries;

                return { [key]: value, isExpanded: 0 };
            }) ?? [];

            dispatchState({
                type: 'UPDATE_ATTRIBUTES',
                field: field,
                payload: {
                    attributesData: attributesData,
                    leftPanelAttributes: leftpanelAttributes,
                    searchAttributes: attributes,
                },
            });
        }
        dispatchState({
            type: 'UPDATE',
            field: 'attributeTypes',
            payload: filterValue,
        });
        if (isUpdate) {
            const segmentListName = resolveSegmentListName(editList, locationVersium);
            if (segmentListName) {
                setValue('segmentation.listName', segmentListName);
                setEditListName(segmentListName);
                listNameRef.current = segmentListName;
                clearErrors('segmentation.listName');
            }
            if (editList?.extractionLimit !== undefined && editList?.extractionLimit !== 0) {
                setValue('extractionCheck', true);
                setValue('extractionLimit', String(editList?.extractionLimit ?? ''));
            }
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'isListField',
            });
        }
        } catch {
            // Malformed attribute payload or runtime error during attribute mapping
        }
    };

    const handleVirtualFieldData = async (field) => {
        let virtualFieldsKeys = [];

        if (!field?.IsVirtualField) return [];

        const key = field?.SOLRFieldName;
        if (!key) return [];

        const customAttributeName = (attName, fieldItem) => {
            switch (fieldItem?.SOLRFieldName) {
                case 'Campaign_summary_s':
                    return fieldItem?.Field?.split(' ')?.join('_');
                default:
                    return attName;
            }
        };

        if (!virtualFieldsKeys?.includes(key)) {
            virtualFieldsKeys.push(key);
            const payload = {
                attributeName: customAttributeName(solrFieldNameSplit(field?.SOLRFieldName)?.before, field),
                departmentId,
                clientId,
                userId,
            };
            try {
                const res = await dispatch(getVirtualFieldData(payload, dispatchState, key));
            } catch (err) {}
        }
    };

    const getSegmentationResult = (
        attributesData,
        leftpanelAttributes,
        updateVersium,
        versiumData,
        ispartnerDigipopstate,
    ) => {
        // if (updateVersium && JSON.parse(versiumData.ruleJSON).OriginalBaseExprVal?.Expressions?.length === 0) {
        // if (updateVersium && versiumData?.ruleJSON === null && !Object.keys(versiumData.ruleJSON)?.length > 0) {
        if (
            (!locationVersium?.isMDCSubSegment && updateVersium && versiumData?.ruleJSON === null) ||
            (!locationVersium?.isMDCSubSegment && !!versiumData && versiumData?.ruleJSON && !Object?.keys(versiumData?.ruleJSON)?.length > 0)
        ) {
            // if (updateVersium) {
            const resData = makeExpressionVersium(versiumData);
            const filterExpressions = resData;

            let tempAttributesCount = { ...attributeslistCount };
            tempAttributesCount['filterLists'] = [];
            let tempFilterGroups = { ...filterGroups };
            let allAtttributes = [];
            attributesData?.forEach((attribute) => {
                let values = Object.values(attribute)[0];
                allAtttributes.push(...values);
            });
            let tempAttributes = [];
            let filterData = filterExpressions?.Expressions;
            const handleFIEFields = (groupData, typeData) => {
                if (!groupData?.length) return [];
                return groupData?.map((field) => {
                    if (!tempAttributes?.includes(field?.SOLRFieldName)) {
                        tempAttributes?.push(field?.SOLRFieldName);
                    }
                    const fieldType = getFieldType(
                        field.SOLRFieldName?.split('_')[field.SOLRFieldName?.split('_')?.length - 1],
                    );
                    const fieldObject = getFieldObject(field, fieldType, field.Category, typeData, typeData);
                    tempAttributesCount[typeData]?.push([field.LiwaterfallCount, field.LiremainingCount]);
                    return fieldObject;
                });
            };

            const filterFields = handleFIEFields(filterData, 'filterLists');
            tempAttributes?.forEach((attribute) => {
                let labelText = attribute?.split('_')[0];
                filterGroupRef.current?.getAttributes(labelText);
            });
            let filterValues = allAtttributes?.filter((attribute) => {
                return tempAttributes?.includes(attribute?.solrFieldName);
            });

            let newLeftPanelAttributes = leftpanelAttributes?.map((attribute) => {
                let keys = Object?.keys(attribute)[0];
                const getNameForAllAttributes = attribute[keys]?.map((item) => item.name);
                const filteredCategory = filterValues?.filter((fitem) => {
                    return (
                        keys?.toLowerCase() === fitem.category?.toLowerCase() &&
                        !getNameForAllAttributes?.includes(fitem?.name)
                    );
                });
                if (filteredCategory?.length) {
                    attribute[keys]?.push(...filteredCategory);
                }
                return attribute;
            });
            let newAttributes = attributesData?.map((attribute) => {
                let keys = Object?.keys(attribute)[0];
                attribute[keys]?.map((item) => {
                    if (tempAttributes?.includes(item?.solrFieldName)) {
                        item.isChecked = true;
                    }
                    return item;
                });
                return attribute;
            });
            reset((formState) => {
                let temp = [];
                return {
                    ...formState,
                    filterLists: filterFields,
                    attributeslistCount: tempAttributesCount,
                };
            });
            tempFilterGroups['groups'] = [...new Set(tempFilterGroups['groups'])];
            dispatchState({
                type: 'UPDATE_EDIT_DATA',
                payload: { tempFilterGroups, newAttributes, newLeftPanelAttributes },
            });
            let finalCount = Number(getFinalAudienceCount(getValues)) || 0;
            setValue('finalAudienceCount', finalCount);
        } else {
            const partnerData = Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2;
            let resData = { ...editList };
            let allAttributes = [],
                tempAttributes = [];
            let tempAttributesCount = {
                zeroDayLists: [],
                filterLists: [],
                inclusionLists: [],
                exclusionLists: [],
                lookALikeAudiLists: [],
                lookALikeAttrLists: [],
            };
            let finalFormStateField = {};
            let tempFilterGroups = { ...filterGroups };

            let multiFilterAllGroupList = [];
            try {
                multiFilterAllGroupList = resData?.allGroups
                    ? parseAudienceJsonArray(resData.allGroups, [])
                    : [];
            } catch (_) {}

            const isMultiInclusionFlow = multiFilterAllGroupList?.length > 0;

            let filterExpressions, inclusionExpressions, exclusionExpressions, lookAlikeExpressions, zeroDayExpressions;

            const parseVersiumExpressions = () => {
                const parsed = safeParse(versiumData.ruleJSON, {});
                filterExpressions = parsed.OriginalBaseExprVal;
                inclusionExpressions = parsed.FilterGroup2ExprVal;
                exclusionExpressions = parsed.Exclusion1ExprVal;
            };

            const parseMDCSubsegmentExpressions = () => {
                const parsed = safeParse(resData?.RuleJSON, []);
                if (!Array.isArray(parsed)) return;
                const expressionMap = parsed.reduce((acc, curr) => {
                    if (curr?.FilterGroup?.includes('IG1_Subsegment')) acc.filterExpressions = curr;
                    if (curr?.FilterGroup?.includes('IG2_Subsegment')) acc.inclusionExpressions = curr;
                    if (curr?.FilterGroup?.includes('Ex1_Subsegment')) acc.exclusionExpressions = curr;
                    return acc;
                }, {});
                filterExpressions = expressionMap?.filterExpressions;
                inclusionExpressions = expressionMap?.inclusionExpressions;
                exclusionExpressions = expressionMap?.exclusionExpressions;
            };

            const parseNormalExpressions = () => {
                filterExpressions = safeParse(resData?.expressionJSON, {});
                inclusionExpressions = safeParse(resData?.fG2ExpressionJSON, {});
                exclusionExpressions = safeParse(resData?.exclusion1ExpressionJSON, {});
                lookAlikeExpressions = safeParse(resData?.lookAlikeExpressionJSON, {});
                zeroDayExpressions = safeParse(resData?.zeroDayListExpression, {});
            };

            const initializeExpressions = () => {
                if (updateVersium && versiumData?.ruleJSON !== null) {
                    parseVersiumExpressions();
                } else if (!isMultiInclusionFlow) {
                    locationVersium?.isMDCSubSegment ? parseMDCSubsegmentExpressions() : parseNormalExpressions();
                }
            };

            const updateTempAttributesCount = (tempAttributesCount, typeData, field) => {
                const waterfall = field.LiwaterfallCount?.toString().replace(/,/g, '') || '0';
                const remaining = field.LiremainingCount?.toString().replace(/,/g, '') || '0';
                if (!Array.isArray(tempAttributesCount[typeData])) {
                    tempAttributesCount[typeData] = [];
                }
                tempAttributesCount[typeData].push([waterfall, remaining]);
                return tempAttributesCount;
            };

            const handleFIEFields = (groupData, typeData, expression) => {
                if (!groupData?.length) return [];
                const calledFields = new Set();
                return groupData.map((field, index) => {
                    if (typeData === 'zeroDayLists') {
                        if (!field.SOLRFieldName && field.Field) {
                            field.SOLRFieldName = field.Field || field.SOLRFieldName;
                        }
                        const fieldKey = field.SOLRFieldName || field.Field;
                        const existingData = targetListState?.filterLabels?.[fieldKey];
                        const hasData = existingData && Array.isArray(existingData) && existingData.length > 0;
                        const alreadyCalled = calledFields.has(fieldKey);
                        if (index !== 0 && !hasData && !alreadyCalled) {
                            calledFields.add(fieldKey);
                            const payload = {
                                fileName: expression?.FileName || '',
                                fileHeader: field?.Field || field?.LiUIPrintableName || '',
                                attributeName: ZERO_DAY_FIELD_NAME,
                                clientId,
                                userId,
                                departmentId,
                                partnerID: 0,
                            };
                            dispatch(getAttributeValues_zeroDay(payload, dispatchState, fieldKey, 0, []));
                        }
                    }
                    const fieldType = partnerData ? '1' : getFieldType(field.SOLRFieldName?.split('_').pop());
                    handleVirtualFieldData(field);
                    const fieldObject = getFieldObject(field, fieldType, field.Category, typeData);
                    if (updateVersium && versiumData?.ruleJSON !== null && groupData?.length === 1) {
                        setValue('finalAudienceCount', field.LiwaterfallCount);
                    }
                    if (field.SOLRFieldName && !tempAttributes.includes(field.SOLRFieldName))
                        tempAttributes.push(field.SOLRFieldName);
                    updateTempAttributesCount(tempAttributesCount, typeData, field);
                    return fieldObject;
                });
            };

            const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
            const safeObject = (obj) => (obj && typeof obj === 'object' ? obj : {});

            const buildFormStateFields = () => {
                const config = isMultiInclusionFlow
                    ? multiFilterAllGroupList.map((list) => ({
                          type: shortKeyNormalFlowConfig[list?.FilterGroup],
                          data: list?.Expressions,
                          groupOperator: list?.GroupingOperator,
                          expression: list,
                      }))
                    : [
                          zeroDayExpressions && Object.keys(zeroDayExpressions)?.length
                              ? {
                                    type: 'zeroDayLists',
                                    data: zeroDayExpressions
                                        ? [
                                              {
                                                  ...safeObject(zeroDayExpressions.Expressions?.[0]),
                                                  SequenceId: 0,
                                                  Field: 'ZeroDayFiles',
                                                  Value: zeroDayExpressions.FileName ?? '',
                                                  ExpressionOperator: 'And',
                                                  LiId: 'filterBuildComp0',
                                                  ParentdivId: 'crbZeroContainer',
                                                  SOLRFieldName: 'ZeroDayFiles',
                                                  LiUIPrintableName: 'Zero Day Files',
                                              },
                                              ...safeArray(zeroDayExpressions.Expressions).map((expr, index) => ({
                                                  ...expr,
                                                  SequenceId: index + 1,
                                                  LiId: `filterBuildComp${index + 1}`,
                                                  ParentdivId: 'crbZeroContainer',
                                              })),
                                          ]
                                        : [],
                                    groupOperator: zeroDayExpressions?.GroupingOperator ?? 'And',
                                    expression: zeroDayExpressions ?? null,
                                }
                              : {
                                    type: 'zeroDayLists',
                                    data: [],
                                    groupOperator: 'And',
                                    expression: null,
                                },
                          {
                              type: 'filterLists',
                              data: filterExpressions?.Expressions,
                              groupOperator: filterExpressions?.GroupingOperator,
                              expression: filterExpressions,
                          },
                          {
                              type: 'inclusionLists',
                              data: inclusionExpressions?.Expressions,
                              groupOperator: inclusionExpressions?.GroupingOperator,
                              expression: inclusionExpressions,
                          },
                          {
                              type: 'exclusionLists',
                              data: exclusionExpressions?.Expressions,
                              groupOperator: exclusionExpressions?.GroupingOperator,
                              expression: exclusionExpressions,
                          },
                          {
                              type: 'lookALikeAttrLists',
                              data: lookAlikeExpressions?.Expressions,
                              groupOperator: lookAlikeExpressions?.GroupingOperator,
                              expression: lookAlikeExpressions,
                          },
                      ];

                config.forEach(({ type, data, groupOperator, expression }) => {
                    if (data?.length) {
                        finalFormStateField[type] = handleFIEFields(data, type, expression);
                        finalFormStateField['segmentation'] = {
                            ...finalFormStateField['segmentation'],
                            [type]: { groupOperator: type === 'lookALikeAttrLists' ? false : groupOperator === 'AND' },
                        };
                    }
                    const availableGroupList = config?.map((con) => con?.type);

                    const onlyInclusionList = availableGroupList?.filter((list) => list?.includes('inclusionLists'));
                    const onlyExclusionList = availableGroupList?.filter((list) => list?.includes('exclusionLists'));
                    const findMaxInclusionList = getListMaxValue(onlyInclusionList, 'inclusionLists');
                    const findMaxExclusionList = getListMaxValue(onlyExclusionList, 'exclusionLists');
                    const matchListInclusionCountResponse = config?.find(
                        (conf) => conf?.type === findMaxInclusionList?.key,
                    );
                    const matchListExclusionCountResponse = config?.find(
                        (conf) => conf?.type === findMaxExclusionList?.key,
                    );
                    if (matchListInclusionCountResponse?.expression && type?.includes('inclusionLists')) {
                        finalFormStateField['inclusionAudience'] =
                            matchListInclusionCountResponse?.expression?.TotalInclusionCount ?? 0;
                    }
                    if (
                        matchListExclusionCountResponse?.data?.length &&
                        type?.includes('exclusionLists')
                    ) {
                        const lastAttributeValue = data?.[data?.length - 1];
                        finalFormStateField['finalAudienceCount'] = lastAttributeValue?.LiwaterfallCount ?? 0;
                    }
                });
            };

            const updateTempFilterGroups = () => {
                const config = isMultiInclusionFlow
                    ? multiFilterAllGroupList.map((list) => {
                          return {
                              type: shortKeyNormalFlowConfig[list?.FilterGroup],
                              data: list?.Expressions,
                          };
                      })
                    : [
                          { type: 'zeroDayLists', data: zeroDayExpressions?.Expressions },
                          { type: 'filterLists', data: filterExpressions?.Expressions },
                          { type: 'inclusionLists', data: inclusionExpressions?.Expressions },
                          { type: 'exclusionLists', data: exclusionExpressions?.Expressions },
                          { type: 'lookALikeAttrLists', data: lookAlikeExpressions?.Expressions },
                      ];
                config.forEach(({ type, data }, index) => {
                    if (
                        type === 'zeroDayLists' &&
                        index === 0 &&
                        zeroDayExpressions &&
                        Object.keys(zeroDayExpressions)?.length
                    ) {
                        tempFilterGroups.groups = [];
                        tempFilterGroups.groups.push(type);
                    } else {
                        if (!data?.length || tempFilterGroups.groups?.includes(type)) return;
                        tempFilterGroups.groups.push(type);
                    }
                    const inclusionLimit = 10;
                    const exclusionLimit = 5;
                    if (type?.includes('inclusionLists')) {
                        if (partnerData) tempFilterGroups.exclusionListGroup = true;
                        if (getListTypeDetail(type)?.value >= inclusionLimit)
                            tempFilterGroups.disableGroups.push('Inclusion');
                    }

                    if (type.includes('exclusionLists')) {
                        tempFilterGroups.exclusionListGroup = true;
                        if (getListTypeDetail(type)?.value >= exclusionLimit)
                            tempFilterGroups.disableGroups.push('Exclusion');
                    }

                    if (type.includes('lookALikeAttrLists')) tempFilterGroups.disableGroups.push('Attributes');
                });
            };

            const processAttributes = () => {
                attributesData?.forEach((attribute) => {
                    allAttributes.push(...Object.values(attribute)[0]);
                });

                tempAttributes.forEach((attr) => {
                    const label = attr.split('_')[0];
                    filterGroupRef.current?.getAttributes(label);
                });

                const filterValues = allAttributes.filter((attr) => tempAttributes.includes(attr?.sOLRFieldName));

                const newLeftPanelAttributes = leftpanelAttributes?.map((category) => {
                    const key = Object.keys(category)[0];
                    const existingNames = category[key]?.map((i) => i.name);
                    const newItems = filterValues.filter(
                        (f) => f.category?.toLowerCase() === key?.toLowerCase() && !existingNames.includes(f.name),
                    );
                    if (newItems?.length) category[key]?.push(...newItems);
                    return category;
                });

                return newLeftPanelAttributes;
            };

            const getUpdatedAttributes = () => {
                if (versiumData?.ruleJSON !== null) return [];

                return attributesData.map((category) => {
                    const key = Object.keys(category)[0];
                    category[key] = category[key]?.map((item) => {
                        if (tempAttributes.includes(item?.sOLRFieldName)) item.isChecked = true;
                        return item;
                    });
                    return category;
                });
            };

            const resetFormState = () => {
                reset((formState) => {
                    const approverList = rfaList?.map((rfa) => {
                        const matchedApprover = rfaapprovalList?.find(
                            (approver) => approver?.email === rfa?.approverEmail,
                        );

                        return {
                            approverName: {
                                email: rfa?.approverEmail,
                                firstName: rfa?.approverName,
                                name: `${rfa?.approverName} (${rfa?.approverEmail})`,
                                userId: matchedApprover?.userId ?? '',
                                roleId: matchedApprover?.roleId ?? '',
                            },
                        };
                    });

                    return {
                        ...formState,
                        segmentation: {
                            listName:
                                formState?.segmentation?.listName ||
                                resolveSegmentListName(editList, locationVersium) ||
                                '',
                            isinclusionSwitched: inclusionExpressions?.GroupingOperator === 'AND',
                        },
                        FinalAudienceCount: 0,
                        attributeslistCount: tempAttributesCount,
                        approvalList: {
                            name: approverList,
                            requestApproval: resData?.isRequestApproval === 1,
                            approvalFrom: 'All',
                            approvalCount: '',
                            followHierarchy: false,
                        },
                        ...finalFormStateField,
                    };
                });
            };

            initializeExpressions();

            if (zeroDayExpressions?.FileName) {
                dispatchState({
                    type: 'UPDATE_ZERO_DAY_FILES',
                });
                handleZeroDayAttributes(zeroDayExpressions.FileName).catch((err) => {});
                let payload = {
                    attributeName: 'ZeroDayFiles',
                    ...basePayload,
                    partnerID: getPartnerID(),
                };
                dispatch(get_Zeroday_AttributeValues(payload, dispatchState, 'ZeroDayFiles', 0));
            }

            buildFormStateFields();
            updateTempFilterGroups();
            const newLeftPanelAttributes = processAttributes();
            const newAttributes = getUpdatedAttributes();
            resetFormState();

            tempFilterGroups.groups = [...new Set(tempFilterGroups.groups)];
            tempFilterGroups.groups = finalOrderWiseGroupLists(tempFilterGroups.groups);
            dispatchState({
                type: 'UPDATE_EDIT_DATA',
                payload: { tempFilterGroups, newAttributes, newLeftPanelAttributes },
            });
           
            const newFilterList  = getValues('filterLists');
            const filterGroupLength = newFilterList?.length || 0;
            if(filterGroupLength > 0 && !!newFilterList?.[0]?.partnerId){
                dispatchState({
                    type: 'UPDATE',
                    payload: true,
                    field: 'isPartnerAttSaved',
                });
            }
            dispatchState({
                type: 'UPDATE',
                payload: filterGroupLength - 1,
                field: 'activeListIndex',
            });
            if(editList?.pythonAPIOutput){
                const countResAPI = safeParse(editList?.pythonAPIOutput)
                const countRes = {...countResAPI, isLookAlike: editList?.isLookAlike === 1}
                setTimeout(() => {
                    filterGroupRef.current?.handleAudienceCount(false, false, {}, true, countRes);
                },200)
            }
        }
        handleBindListName();
    };

    const handleDisableGroup = (filterGroup, tempFilterGroups, maxValue) => {
        if (filterGroup === 'Inclusion') {
            if (locationVersium?.isMDCSubSegment) {
                maxValue === filterGroupLimitInNormalFilterConfig?.inclusionList &&
                    tempFilterGroups.disableGroups?.push('Inclusion');
            } else {
                maxValue === filterGroupLimitInMultiFilterConfig?.inclusionList &&
                    tempFilterGroups.disableGroups?.push('Inclusion');
            }
        } else {
            if (locationVersium?.isMDCSubSegment) {
                maxValue === filterGroupLimitInNormalFilterConfig?.exclusionList &&
                    tempFilterGroups.disableGroups?.push('Exclusion');
            } else {
                maxValue === filterGroupLimitInMultiFilterConfig?.exclusionList &&
                    tempFilterGroups.disableGroups?.push('Exclusion');
            }
        }
    };

    const addFilterGroup = (filterGroup) => {
        if (handleDuplicateAttributes(filterGroups, getValues, attributesError, dispatchState)) {
            let tempFilterGroups = { ...filterGroups };
            if (isValid && _isAttributesErrors(attributesError)) {
                const groupsSet = new Set(tempFilterGroups.groups);
                let groupsLength = tempFilterGroups.groups?.length;
                if (filterGroup === 'Inclusion' && isZeroDayFiles && groupsLength === 1) {
                    tempFilterGroups.activeGroup = 'filterLists';
                    tempFilterGroups.groups.push('filterLists');
                } else if (filterGroup === 'Inclusion') {
                    const hasInclusionGroup = groupsSet.has('inclusionLists');
                    const maxValue = getListMaxValue(tempFilterGroups.groups, 'inclusionLists')?.maxValue;
                    const appendList = hasInclusionGroup ? `inclusionLists${maxValue + 1}` : 'inclusionLists';
                    handleDisableGroup(filterGroup, tempFilterGroups, maxValue);
                    tempFilterGroups.exclusionListGroup = groupsSet.has('exclusionLists') ? true : false;
                    tempFilterGroups.groups.push(appendList);
                    tempFilterGroups.activeGroup = appendList;
                    setValue(`segmentation.${appendList}.groupOperator`, true);
                    if (Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2) {
                        tempFilterGroups.exclusionListGroup = true;
                    }
                } else if (filterGroup === 'Exclusion') {
                    const hasExclusionGroup = tempFilterGroups?.groups.some((group) => group.includes('exclusionList'));
                    const maxValue = getListMaxValue(tempFilterGroups.groups, 'exclusionLists').maxValue;
                    handleDisableGroup(filterGroup, tempFilterGroups, maxValue);
                    tempFilterGroups.exclusionListGroup = groupsSet.has('inclusionLists') ? true : false;
                    const appendList = hasExclusionGroup ? `exclusionLists${maxValue + 1}` : 'exclusionLists';
                    tempFilterGroups.groups.push(appendList);
                    tempFilterGroups.activeGroup = appendList;
                } else if (filterGroup === 'Audience') {
                    tempFilterGroups.disableGroups?.push('Audience');
                    tempFilterGroups.groups.push('lookALikeAudLists');
                    tempFilterGroups.activeGroup = 'lookALikeAudLists';
                } else if (filterGroup === 'Attributes') {
                    tempFilterGroups.disableGroups?.push('Attributes');
                    tempFilterGroups.groups.push('lookALikeAttrLists');
                    tempFilterGroups.activeGroup = 'lookALikeAttrLists';
                }

                if (filterGroup?.includes('Inclusion')) {
                }

                tempFilterGroups.groups = finalOrderWiseGroupLists(tempFilterGroups.groups);
                dispatchState({
                    type: 'UPDATE',
                    payload: tempFilterGroups,
                    field: 'filterGroups',
                });
            } else trigger();
        }
        dispatchState({
            type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
            field: 'default',
        });
    };

    const isListnameExists = async (name) => {
        dispatchState({
            type: 'UPDATE',
            payload: true,
            field: 'isLoadingListname',
        });
        const payloadData = {
            departmentId,
            clientId,
            userId,
            listName: name ?? '',
            listId: updateId || 0,
            IsMDClist: Boolean(locationVersium?.isMDCSubSegment),
        };
        listNameRef.current = name ?? '';
        try {
            const res = await dispatch(checkTargetListName(payloadData));
            if (!isActiveRef.current) return;
            if (res?.status) {
                setError('segmentation.listName', {
                    type: 'custom',
                    message: 'List name already exists',
                });
                dispatchState({
                    type: 'UPDATE',
                    payload: false,
                    field: 'isLoadingListname',
                });
            } else {
                dispatchState({
                    type: 'UPDATE',
                    payload: true,
                    field: 'isValidListname',
                });
                dispatchState({
                    type: 'UPDATE',
                    payload: false,
                    field: 'isLoadingListname',
                });
                setTimeout(() => {
                    if (!isActiveRef.current) return;
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isValidListname',
                    });
                }, 3000);
            }
        } catch {
            if (!isActiveRef.current) return;
            dispatchState({
                type: 'UPDATE',
                payload: false,
                field: 'isLoadingListname',
            });
        }
    };

    const getOrCreateGroupRef = (type) => {
        if (!allInOneRef.current[type]) {
            allInOneRef.current[type] = createRef();
        }
        return allInOneRef.current[type];
    };

    const findRef = (type) => {
        const typeRef = {
            zeroDayLists: zeroDayGroupRef,
            filterLists: filterGroupRef,
            inclusionLists: inclusionGroupRef,
            exclusionLists: exclusionGroupRef,
            lookALikeAudLists: lookALikeAudGroupRef,
            lookALikeAttrLists: lookALikeAttrGroupRef,
        };
        if (typeRef[type]) {
            return typeRef[type];
        } else {
            return getOrCreateGroupRef(type);
        }
    };
    useEffect(() => {
        if (leftPanelAtt_Zero?.length > 0) {
            getDataAttributes(leftPanelAtt_Zero, 'zeroDay');
        }
    }, [leftPanelAtt_Zero]);
    const handleZeroDayAttributes = async (value) => {
        const payload = {
            attributeName: 'ZeroDayFiles', //Object.keys(contextValue.targetListState.filterLabels)[0]
            FileName: value,
            clientId,
            userId,
            departmentId,
            partnerID: 0,
        };
        await dispatch(get_Zeroday_Header_Attribute(payload, dispatchState, value));
        setValue('isResetSearchInput', false);
        // const res = ZERO_DAY_FILES;
        // if (zeroDayConstructed.available) {
        //     dispatchState({
        //         type: 'UPDATE_CONSTRUCTED_ATTRIBUTES',
        //         field: 'zeroDay',
        //     });
        // } else getDataAttributes(res, 'zeroDay');
    };
    const appendSelectedList = (type, payload) => {
        const availableList = availableInclsuionExclusionList;

        if (type === 'zeroDayLists' || payload.name === ZERO_DAY_FIELD_NAME) {
            zeroDayGroupRef.current.appendPayload(payload);
        } else if (type === 'filterLists') {
            filterGroupRef.current.appendPayload(payload);
        } else if (type === 'inclusionLists') {
            inclusionGroupRef.current.appendPayload(payload);
        } else if (type === 'exclusionLists') {
            exclusionGroupRef.current.appendPayload(payload);
        } else if (type === 'lookALikeAudLists') {
            lookALikeAudGroupRef.current.appendPayload(payload);
        } else if (type === 'lookALikeAttrLists') {
            lookALikeAttrGroupRef.current.appendPayload(payload);
        } else if (availableList?.includes(type)) {
            const dynamicRef = getOrCreateGroupRef(type);
            dynamicRef?.current?.appendPayload(payload, type);
        }
    };

    const isDisablePlusBtn = () => {
        const handleMatchFinalList = (listType) => {
            const groupLists = filterGroups?.groups ?? [];
            const matchList = groupLists?.filter((group) => group?.includes(listType));
            return matchList;
        };
        const availableFilterList = handleMatchFinalList('filterLists');
        const availableInclusionList = handleMatchFinalList('inclusionLists');
        const availableExclusionList = handleMatchFinalList('exclusionLists');
        const availableFilterListLength = availableFilterList?.length;
        const availableInclusionListLength = availableInclusionList?.length;
        const availableExclusionListLength = availableExclusionList?.length;

        if (locationVersium?.isMDCSubSegment) {
            if (availableFilterListLength === 1 && availableInclusionListLength === 1) {
                return true;
            }
        } else {
            if (
                availableFilterListLength === 1 &&
                availableInclusionListLength === 9 &&
                availableExclusionListLength === 5
            ) {
                return true;
            }
        }
    };

    const isCreateStatus = () => {
        const checkGroup = (group) => (groupsSet.has(group) ? attributes[group]?.length : true);
        return ['filterLists', 'inclusionLists', ...availableInclsuionExclusionList].every(checkGroup);
    };

    const isAddLookAlike = () => {
        let tempFilterGroups = { ...filterGroups };
        const groupsSet = new Set(tempFilterGroups.groups);
        if (groupsSet.has('inclusionLists')) return true;
        return false;
    };

    const handleGroupSet = (type, typeOfList) =>
        groupsSet.has(type) ? typeOfList?.every((list) => list.isStatus === true) : true;

    const audienceCountStatus = () => {
        const isFilterLists = filterLists?.every((list) => list.isStatus === true);
        dispatchState({
            type: 'UPDATE',
            payload: isZeroDayFiles
                ? true
                : isFilterLists &&
                  // handleGroupSet('zeroDayLists', zeroDayLists) &&
                  handleGroupSet('inclusionLists', inclusionLists) &&
                  handleGroupSet('exclusionLists', exclusionLists) &&
                  handleGroupSet('lookALikeAudLists', lookALikeAudLists) &&
                  handleGroupSet('lookALikeAttrLists', lookALikeAttrLists),
            field: 'isBQAudienceCount',
        });
    };

    const onHandleSubmit = async () => {
        if (!handleDuplicateAttributes(filterGroups, getValues, attributesError, dispatchState)) {
            return;
        }

        setIsCreating(true);
        try {
            if (!isUpdate && !updateVersium && !locationVersium?.isMDCSubSegment) {
                const isRFAValid = validateRFAMandatory({
                    isCurrentBURFAStatus,
                    getValues,
                    setValue,
                    setError,
                    trigger,
                });

                if (!isRFAValid) {
                    return;
                }
            }

            const [extractionLimit, extractionCheck] = getValues(['extractionLimit', 'extractionCheck']);

            if (extractionCheck && Number(extractionLimit) > 0) {
                const finalCount = getFinalAudienceCount(getValues);
                if (Number(extractionLimit) > Number(finalCount)) {
                    setError('extractionLimit', {
                        type: 'custom',
                        message: 'Extraction limit exceeds potential audience',
                    });
                    setFocus('extractionLimit');
                    return;
                }
            }
            // Check list name existence first before proceeding
            if (isValid && _isAttributesErrors(attributesError)) {
                // If there's already a list name error, don't proceed
                if (errors?.segmentation?.listName) {
                    return;
                }

                const listName = getValues('segmentation.listName');
                // In update mode, only check if the name is different from the original
                const shouldCheckName = !isUpdate || (isUpdate && formatName(listName) !== formatName(editListName));

                if (listName && listName.length >= 3 && shouldCheckName) {
                    const payloadData = {
                        departmentId,
                        clientId,
                        userId,
                        listName: listName,
                        listId: isUpdate ? updateId : 0,
                        IsMDClist: locationVersium?.isMDCSubSegment ? true : false,
                    };
                    const res = await dispatch(checkTargetListName(payloadData, false));
                    if (res?.status) {
                        setError('segmentation.listName', {
                            type: 'custom',
                            message: 'List name already exists',
                        });
                        return;
                    }
                }
            }

            if (isValid && _isAttributesErrors(attributesError)) {
                audienceCountStatus();
                dispatchState({
                    type: 'UPDATE',
                    payload: true,
                    field: 'isOpenSegmentModal',
                });
            }
        } finally {
            setIsCreating(false);
        }
    };



    const contextValue = useMemo(
        () => ({
            targetListState,
            dispatchState,
            handleZeroDayAttributes,
            isUpdate,
            updateId,
            apicallStatusDetail,
        }),
        [targetListState, dispatchState, handleZeroDayAttributes, isUpdate, updateId, apicallStatusDetail],
    );

    const handleCheckValue = (value) => value?.some((item) => item.isStatus === false);

    const handleListNameOnBlur = (value) => {
        // if (location?.state?.recipientsBunchName !== value) {
        if (value.length < 1) {
            setError(`segmentation.listName`, {
                type: 'custom',
                message: ENTER_LIST_NAME,
            });
            listNameRef.current = value;
            return;
        } else if (value.length < 3) {
            setError(`segmentation.listName`, {
                type: 'custom',
                message: MINLENGTH,
            });
            listNameRef.current = value;
            return;
        }
        if (formatName(value) === formatName(editListName)) {
            return;
        }
        if (communicationNamevalidtor(value) === undefined) {
            if (listNameRef.current !== value && value?.length >= 3) {
                if (false) {
                    const payload = {
                        departmentId,
                        clientId,
                        userId,
                        ListId: updateId,
                        ListName: value,
                        IsMDClist: locationVersium?.isMDCSubSegment ? true : false,
                    };
                    if (listNameRef.current !== value) {
                        listNameRef.current = value;
                        dispatch(updateTargetListName(payload, dispatchState, setError, setValue));
                    }
                } else {
                    if (isValid || locationVersium?.isMDCSubSegment) {
                        isListnameExists(value);
                    } else {
                        dispatchState({
                            type: 'UPDATE',
                            payload: false,
                            field: 'isValidListname',
                        });
                    }
                }
            }
            //}
            else {
                if (listNameRef.current === value) {
                    return;
                } else {
                    setError(`segmentation.listName`, {
                        type: 'custom',
                        message: MINLENGTH,
                    });
                    return;
                }
            }
        } else {
            setError(`segmentation.listName`, {
                type: 'custom',
                message: SPECIAL_CHATACTERS_NOT_ALlOWED,
            });
            return;
        }
    };

    const handleBindListName = async () => {
        const segmentListName = resolveSegmentListName(editList, locationVersium);

        if (
            locationVersium?.mdcSegmentMode === 'create' &&
            locationVersium?.listName &&
            !isUpdate
        ) {
            await setValue('segmentation.listName', locationVersium.listName, {
                shouldValidate: true,
            });
            if (!errors?.segmentation?.listName) {
                await handleListNameOnBlur(locationVersium.listName);
            }
            return;
        }

        if (!segmentListName) return;

        setValue('segmentation.listName', segmentListName, { shouldValidate: false });
        setEditListName(segmentListName);
        listNameRef.current = segmentListName;
        clearErrors('segmentation.listName');
    };

    useEffect(() => {
        if (updateVersium) return;

        const segmentListName = resolveSegmentListName(editList, locationVersium);
        const hasEditData = hasTargetListEditData({ targetlist: [editList] });

        if (isUpdate && !segmentListName && !hasEditData) return;
        if (!segmentListName && !locationVersium?.listName) return;

        handleBindListName();
    }, [editList, locationVersium, isUpdate, updateVersium]);

    const handleHeaderTitle = () => {
        if (isUpdate) {
            if (locationVersium?.isMDCSubSegment) {
                return EDIT_SUB_SEGMENT_LIST;
            } else {
                return EDIT_SEGMENT;
            }
        } else if (updateVersium) {
            return AUDIENCE_SELECTION;
        } else {
            if (locationVersium?.isMDCSubSegment) {
                return NEW_SUB_SEGMENT_LIST;
            } else {
                return NEW_SEGMENT;
            }
        }
    };

    const handleFilterGroupList = () => {
        const isOnlyInclusion =
            (Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2) ||
            locationVersium?.isMDCSubSegment;
        if (isOnlyInclusion) {
            return FILTER_GROUPS_PARTNER;
        } else {
            return FILTER_GROUPS;
        }
    };

    const handleErrorClickOff = () => {
        const isErrorStatus =
            getAttributesErrorMessageValues(attributesError)?.some((err) => err) ||
            _get(errors, 'segmentation.listName', '');
        return isErrorStatus;
    };

    const handleHiddenPlus = () => {
        if (!filterGroups?.groups?.length) return true;

        const isRun = getEnvironment() === 'RUN';
        const inclusionList = 'inclusionLists9';
        const exclusionList = 'exclusionLists5';
        return !(filterGroups.groups.includes(inclusionList) && filterGroups.groups.includes(exclusionList));
    };

    const handleEditLoadBack = () => {
        dispatchState({
            type: 'UPDATE',
            field: 'editLoadFailed',
            payload: false,
        });
        navigateToAudienceTargetList();
    };

    const handleCancelNavigate = () => {
        const resolvedNavigationState = {
            ...(locationVersium || {}),
            ...(location.state || {}),
        };

        const defaultCancelNavigate = () => {
            if (resolvedNavigationState?.backAction !== undefined) {
                const tabValue = resolvedNavigationState?.tabValue;
                const tabValueName = resolvedNavigationState?.tabValueName;
                const verticalValues = Object.keys(availableTabs);
                const verticalIndex = verticalValues?.indexOf(tabValueName);
                const selectedArray = availableTabs[`${tabValueName}`];
                const tabIndex = selectedArray?.indexOf(tabValue);

                dispatch(
                    updateTab({
                        field: tabValueName,
                        data: {
                            tabName: availableTabs[tabValueName][tabIndex],
                            currentIndex: tabIndex,
                        },
                    }),
                );
                dispatch(
                    setTabforEdit({
                        type: tabValueName,
                        currentTab: verticalIndex,
                    }),
                );
                setTimeout(() => {
                    navigate('/communication/create-communication' + resolvedNavigationState?.backAction);
                }, 10);
            } else if (resolvedNavigationState?.isMDCSubSegment) {
                const queryParamData = {
                    ...resolvedNavigationState,
                    isSubSegementSave: false,
                };
                const pageFrom = encodeUrl(queryParamData);
                navigate(`/communication/mdc-workflow?q=${pageFrom}`, { state: queryParamData });
            } else {
                const url = '/audience';
                const state = { index: 1 };
                const encryptState = encodeUrl(state);
                navigate(`${url}?q=${encryptState}`, {
                    state: {
                        index: 1,
                    },
                });
            }
        };

        validateIsCustomNavigate(queryParams, resolvedNavigationState, navigate, defaultCancelNavigate);
    };

    const isEditListFetch =
        (isUpdate || parseInt(editListID, 10) > 0 || parseInt(updateId, 10) > 0) &&
        !locationVersium?.isMDCSubSegment;
    const showEditListSkeleton = isEditListFetch && editListLoading;
    const showEditListError = isEditListFetch && editLoadFailed;
    const isMdcSubSegmentFlow = Boolean(
        locationVersium?.isMDCSubSegment ?? location.state?.isMDCSubSegment,
    );
    const [mdcRouteSkeletonPhase, setMdcRouteSkeletonPhase] = useState(() =>
        consumeAudienceRouteSkeleton(),
    );
    useEffect(() => {
        if (!attributesLoading && mdcRouteSkeletonPhase) {
            setMdcRouteSkeletonPhase(false);
        }
    }, [attributesLoading, mdcRouteSkeletonPhase]);
    const showMdcSubSegmentBootSkeleton =
        isMdcSubSegmentFlow &&
        (attributesLoading || mdcRouteSkeletonPhase) &&
        !adhocLeftPanelLoading &&
        !showEditListSkeleton &&
        !showEditListError;
    const backState = {
        index: 1,
    };
    const encryptBackState = encodeUrl(backState);

    const rfaUrlState = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const approvalStatus = params.get('approval') || '0';
        return {
            isApprovalLinkApproved: approvalStatus === '1',
            isRejectedRfaLink: approvalStatus === '2',
        };
    }, [location.search]);

    const isPageClickOff = useMemo(
        () => isRFA || Boolean(locationVersium?.isViewOnly) || isViewOnly,
        [isRFA, locationVersium?.isViewOnly, isViewOnly],
    );

    const hasRfaMakeChangesComments = useMemo(
        () => rfaList?.some((approver) => approver?.makeChangesComments?.length),
        [rfaList],
    );

    const shouldShowRfaApproverSection = isRFA && (hasRfaMakeChangesComments || isRFARejectComments);

    const renderRfaApproverComments = () => {
        if (!shouldShowRfaApproverSection) return null;

        return (
            <div className="box-design rfa-approver-wrapper">
                {rfaList?.map((item, index) => (
                    <Fragment key={`${item?.approverEmail ?? 'approver'}-${index}`}>
                        <Row className="form-group mb0">
                            <Col sm={6}>
                                <h4 className={`mb15 ${index === 0 ? '' : 'd-none'}`}>Approver(s)</h4>
                                <Row className="align-items-center align-items-stretch">
                                    <Col className={`${isPageClickOff ? 'pe-none click-off' : ''} pr80`}>
                                        <p
                                            className={`rfa-approver-email ${
                                                index === 0 && rfaList?.length === 1 ? '' : 'mb23'
                                            }`}
                                        >
                                            <strong>{item?.approverEmail}</strong>
                                        </p>
                                    </Col>
                                </Row>
                            </Col>
                            {hasRfaMakeChangesComments && (
                                <Col sm={6}>
                                    <h4 className={`mb15 ${index === 0 ? '' : 'd-none'}`}>{COMMENTS}</h4>
                                    <Row className="align-items-center align-items-stretch">
                                        <Col className={isPageClickOff ? 'pe-none click-off' : ''}>
                                            {item?.makeChangesComments?.length ? (
                                                <p>{item.makeChangesComments}</p>
                                            ) : null}
                                        </Col>
                                    </Row>
                                </Col>
                            )}
                        </Row>
                    </Fragment>
                ))}
            </div>
        );
    };

    return (
        // Contend holder starts
        <FormProvider {...methods}>
            <TargetListContext.Provider value={contextValue}>
                <div
                    ref={wrapperRef}
                    className={showMdcSubSegmentBootSkeleton ? '' : 'page-content-holder targetListPage'}
                >
                    {showMdcSubSegmentBootSkeleton ? (
                        <AudienceTargetListCreationSkeleton />
                    ) : (
                    <>
                    <RSPageHeader
                        title={handleHeaderTitle()}
                        rightCommonMenus
                        isBuDisabled
                        isAgencyDisabled
                        isBack
                        onBack={handleCancelNavigate}
                        backPath={`/audience?q=${encryptBackState}`}
                        state={{ index: 1 }}
                    />
                    {/* Main page content block starts */}
                    <Container fluid>
                        <div className="page-content">
                            <Container className="px0">
                                {showEditListSkeleton || showEditListError ? (
                                    <>
                                        <style>{audienceTargetListCreationCriticalCss}</style>
                                        <style>{segmentSkeletonCriticalCss}</style>
                                        <div className="targetListPage audience-target-list-creation-inline-skeleton">
                                            <TargetListCreationBodySkeleton
                                                isError={showEditListError}
                                                showFooter={false}
                                            />
                                        </div>
                                        {showEditListError && (
                                            <div className="buttons-holder d-flex justify-content-end gap-3">
                                                <RSSecondaryButton
                                                    type="button"
                                                    onClick={handleEditLoadBack}
                                                    id="rs_TargetListCreation_Cancelbutton"
                                                >
                                                    {CANCEL}
                                                </RSSecondaryButton>
                                            </div>
                                        )}
                                    </>
                                ) : attributesLoading && !adhocLeftPanelLoading ? (
                                    <AudienceTargetListCreationLoadingBlock showPageShell={isMdcSubSegmentFlow} />
                                ) : (
                                <Row>
                                    <div
                                        className={`${isAPIRequest ? 'pointer-event-none sticky' : 'sticky'} ${
                                            isPageClickOff ? 'click-off' : ''
                                        }`}
                                        ref={scrollRef}
                                        onClick={() => {
                                            const _isEmpty = _get(segmentation, 'listName', '') === '';
                                            if (_isEmpty) {
                                                trigger('segmentation.listName');
                                            }
                                        }}
                                    >
                                        <Attributes
                                            data={leftPanelAttributes}
                                            getSelectedList={(activegroup, payload) =>
                                                appendSelectedList(activegroup, payload)
                                            }
                                            updateVersium={updateVersium}
                                            targetListContext={TargetListContext}
                                            isDisable={isDisableFilterGroup}
                                            isDisableGroup={isDisableFilterGroupName}
                                            ispartnerDigipop={ispartnerDigipop}
                                            setIspartnerDigipopstate={setIspartnerDigipopstate}
                                            ispartnerDigipopstate={ispartnerDigipopstate}
                                            isUpdate={isUpdate}
                                            disablePartnerData={disablePartnerData}
                                        />
                                    </div>
                                    <div
                                        className={
                                            isAPIRequest
                                                ? 'pointer-event-none rs-targetList-rightSide'
                                                : 'rs-targetList-rightSide'
                                        }
                                    >
                                        <form onSubmit={handleSubmit((data) => onHandleSubmit(data))}>
                                            <Row>
                                                {!updateVersium && (
                                                    <Col
                                                        md={7}
                                                        className={`position-relative mt4 ${
                                                            isPageClickOff ? 'click-off' : ''
                                                        }`}
                                                    >
                                                        {attributesLoading ? (
                                                            <CommonSkeleton box width={540} height={30} />
                                                        ) : (
                                                            <>
                                                                <RSInput
                                                                    control={control}
                                                                    name="segmentation.listName"
                                                                    id="rs_TargetListCreation_listname"
                                                                    placeholder={TARGETLIST_NAME}
                                                                    rules={LIST_NAME_RULES(
                                                                        ENTER_LIST_NAME,
                                                                        false,
                                                                        AUDIENCE_LIST_NAME_MAX_LENGTH200,
                                                                    )}
                                                                    required
                                                                    handleOnchange={() => {
                                                                        dispatchState({
                                                                            type: 'UPDATE',
                                                                            payload: false,
                                                                            field: 'isValidListname',
                                                                        });
                                                                        listNameRef.current = '';
                                                                    }}
                                                                    maxLength={MAX_LENGTH200}
                                                                    minLength={MIN_LENGTH}
                                                                    handleOnBlur={(e) => {
                                                                        handleListNameOnBlur(e.target.value);
                                                                    }}
                                                                    onKeyDown={charNumUnderScore}
                                                                    // disabled={isListField}
                                                                />
                                                                {isLoadingListname && (
                                                                    <div className="nameSucessIcon">
                                                                        <div className="rs-inputIcon-wrapper bottom-0 right2 bg-transparent">
                                                                            <div className="segment_loader"></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {isValidListname && (
                                                                    <div className="nameSucessIcon">
                                                                        <i
                                                                            className={`${checkbox_mini} icon-xs color-primary-green cursor-default position-relative bottom6`}
                                                                            id="rs_data_circle_tick_medium"
                                                                        />
                                                                    </div>
                                                                )}
                                                                {/* {isListField && (
                                                                <div className="nameEditIcon">
                                                                    <RSTooltip text={RENAME} position="top">
                                                                        <i
                                                                            id="rs_data_pencil_edit"
                                                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                            onClick={() => {
                                                                                dispatchState({
                                                                                    type: 'UPDATE',
                                                                                    payload: false,
                                                                                    field: 'isListField',
                                                                                });
                                                                            }}
                                                                        />{' '}
                                                                    </RSTooltip>
                                                                </div>
                                                            )} */}
                                                            </>
                                                        )}
                                                    </Col>
                                                )}

                                                <Col
                                                    md={updateVersium ? 12 : 5}
                                                    className="d-flex align-items-end justify-content-end"
                                                >
                                                    {attributesLoading ? (
                                                        <div className="d-flex gap-2">
                                                            <CommonSkeleton box width={130} height={30} />
                                                            <CommonSkeleton box width={130} height={30} />
                                                        </div>
                                                    ) : (
                                                        <h4 className="mb0 d-flex align-items-center">
                                                            {TOT_AUDIENCE}
                                                            <span className="font-bold font-md ml5">
                                                                {numberWithCommas(attributes?.totalAudiences) || 0}
                                                            </span>
                                                        </h4>
                                                    )}
                                                </Col>
                                            </Row>
                                            <div className={`${isPageClickOff ? 'click-off' : ''}`}>
                                                {filterGroups.groups?.map((group, groupIndex, total) => {
                                                    const index = total?.length === 1 ? 0 : 1;
                                                    return (
                                                        <SegmentationLists
                                                            isUpdate={isUpdate}
                                                            key={group + groupIndex}
                                                            fieldName={group}
                                                            index={groupIndex}
                                                            activeGroup={filterGroups.activeGroup}
                                                            targetListContext={TargetListContext}
                                                            ref={findRef(group)}
                                                            getSelectedList={(activegroup, payload) =>
                                                                appendSelectedList(activegroup, payload)
                                                            }
                                                            updateVersium={updateVersium}
                                                            versiumDataSegment={updateVersium ? locationVersium : ''}
                                                            isDisable={isDisableFilterGroup}
                                                            isDisableGroup={isDisableFilterGroupName}
                                                            countDisable={isCreateStatus()}
                                                            ispartnerDigipop={ispartnerDigipop}
                                                            ispartnerDigipopstate={ispartnerDigipopstate}
                                                            setIsFinalCount={setIsFinalCount}
                                                            isLocationData={locationVersium}
                                                            isUniqueID={isUniqueID}
                                                            isDisableFilterGroupNameList={isDisableFilterGroupNameList}
                                                        >
                                                            {total?.length - 1 === groupIndex &&
                                                                !locationVersium?.isMDCSubSegment &&
                                                                handleHiddenPlus() && (
                                                                    <div className="groupAddPlusIcon">
                                                                        <RSTooltip text={ADD_GROUP} position="top" className="lh0">
                                                                            <div>
                                                                                <BootstrapDropdown
                                                                                    data={handleFilterGroupList()}
                                                                                    flatIcon
                                                                                    alignRight
                                                                                    defaultItem={
                                                                                        <i
                                                                                            id="rs_data_circle_plus_fill_edge"
                                                                                            className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`}
                                                                                        />
                                                                                    }
                                                                                    showUpdate={false}
                                                                                    className="mr15 no_caret"
                                                                                    disbleItems={filterGroups.disableGroups}
                                                                                    onSelect={(filterGroup) => {
                                                                                        let allAttributeFormState = [];
                                                                                        filterGroups?.groups?.forEach(
                                                                                            (group) => {
                                                                                                allAttributeFormState.push(
                                                                                                    ...getValues(group),
                                                                                                );
                                                                                            },
                                                                                        );
                                                                                        const findIndex =
                                                                                            getallAttributes(
                                                                                                attributes,
                                                                                                allAttributeFormState,
                                                                                            );
                                                                                        if (findIndex === -1) {
                                                                                            addFilterGroup(filterGroup);
                                                                                        } else {
                                                                                            trigger();
                                                                                        }
                                                                                    }}
                                                                                    containerClass={
                                                                                        !isCreateStatus() ||
                                                                                        isDisableFilterGroup ||
                                                                                        isDisablePlusBtn()
                                                                                            ? 'pe-none click-off'
                                                                                            : ''
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </RSTooltip>
                                                                    </div>
                                                                )}
                                                        </SegmentationLists>
                                                    );
                                                })}
                                            </div>
                                            {/* {groupEmptyArray && filterGroups.groups?.lenght > 1 && (
                                            <p className="color-primary-red"> Segment group should not empty</p>
                                        )} */}
                                            {/* {FinalAudienceCount !== null && (
                                            <p className={'float-right'}>
                                                {'Final audience count : ' + FinalAudienceCount}
                                            </p>
                                        )} */}
                                            <Row>
                                                <Col md={8}>
                                                    {(Object.keys(ispartnerDigipopstate)?.length === 0 ||
                                                        ispartnerDigipopstate?.listId !== 2) &&
                                                        !locationVersium?.isMDCSubSegment && (
                                                            <div>
                                                                {!isRFA &&
                                                                    !updateVersium &&
                                                                    (attributesLoading ? (
                                                                        <div className="d-flex gap-1">
                                                                            <CommonSkeleton
                                                                                box
                                                                                width={25}
                                                                                height={25}
                                                                            />
                                                                            <CommonSkeleton
                                                                                box
                                                                                width={160}
                                                                                height={25}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <RequestApproval
                                                                            name="approvalList.name"
                                                                            parent="approvalList"
                                                                            isCustomapproval={true}
                                                                            isOffset={false}
                                                                            isCustomEnterMail={false}
                                                                            isAudience
                                                                            isOffSet
                                                                            isTarget
                                                                            isApprovalSettings
                                                                        />
                                                                    ))}
                                                            </div>
                                                        )}
                                                </Col>
                                                <Col md={4}>
                                                    <div
                                                        className={`${
                                                            (isCreateStatus() || attributesLoading) && !isPageClickOff
                                                                ? ''
                                                                : 'pe-none click-off'
                                                        } ${
                                                            Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                                            ispartnerDigipopstate?.listId === 2
                                                                ? 'd-none'
                                                                : ''
                                                        }`}
                                                    >
                                                        {!locationVersium?.isMDCSubSegment && !updateVersium && (
                                                            <>
                                                                {attributesLoading ? (
                                                                    <div className="d-flex gap-1 mt10">
                                                                        <CommonSkeleton box width={25} height={25} />
                                                                        <CommonSkeleton box width={160} height={25} />
                                                                    </div>
                                                                ) : (
                                                                    <div className={extractionCheck ? 'form-group' : ''}>
                                                                        <RSCheckbox
                                                                            control={control}
                                                                            name={`extractionCheck`}
                                                                            labelName={EXTRACTION_LIMIT}
                                                                            handleChange={(e) => {
                                                                                if (!e.target.checked) {
                                                                                    setValue('extractionLimit', '');
                                                                                    clearErrors('extractionLimit');
                                                                                }
                                                                            }}
                                                                            disabledchk={
                                                                                !checkCountTakenStatus(
                                                                                    filterGroups,
                                                                                    getValues,
                                                                                ) || isPageClickOff
                                                                            }
                                                                            containerClass='float-end'
                                                                            labelClass='mr0'
                                                                        />
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        {extractionCheck && (
                                                            <div className='form-group'>
                                                            <RSInput
                                                                control={control}
                                                                name={'extractionLimit'}
                                                                placeholder={EXTRACTION_LIMIT}
                                                                onKeyDown={onlyNumbers}
                                                                disabled={isPageClickOff}
                                                                required={isCreateStatus()}
                                                                rules={ extractionCheck && isCreateStatus() ?  {
                                                                    required: ENTER_EXTRACTION_LIMIT,
                                                                } : {}}
                                                                handleOnBlur={(e) => {
                                                                    const val = e.target.value;
                                                                    const [extractionLimit, extractionCheck] =
                                                                        getValues([
                                                                            'extractionLimit',
                                                                            'extractionCheck',
                                                                        ]);

                                                                    if (extractionCheck && Number(val) > 0) {
                                                                        const finalCount =
                                                                            getFinalAudienceCount(getValues);
                                                                        if (Number(val) > Number(finalCount)) {
                                                                            setError('extractionLimit', {
                                                                                type: 'custom',
                                                                                message:
                                                                                    'Extraction limit exceeds potential audience',
                                                                            });
                                                                            return;
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            </div>
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>

                                            {renderRfaApproverComments()}
                                            <div className="buttons-holder">
                                                {isRFA ? (
                                                    <>
                                                        <RSSecondaryButton
                                                            type="button"
                                                            onClick={handleCancelNavigate}
                                                            blockInteraction={isActionLoading}
                                                            id="rs_TargetListCreation_Cancel"
                                                        >
                                                            {CANCEL}
                                                        </RSSecondaryButton>
                                                        {!rfaUrlState.isApprovalLinkApproved &&
                                                            !rfaUrlState.isRejectedRfaLink &&
                                                            !isRFAAlert?.isApproved && (
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
                                                                                        'You are not an approver for this target list.',
                                                                                    show: true,
                                                                                }));
                                                                            }
                                                                        }}
                                                                        id="rs_TargetListCreation_Reject"
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
                                                                        id="rs_TargetListCreation_Approve"
                                                                    >
                                                                        {APPROVE}
                                                                    </RSPrimaryButton>
                                                                </>
                                                            )}
                                                    </>
                                                ) : updateVersium ? (
                                                    <>
                                                        <RSSecondaryButton
                                                            type="button"
                                                            blockInteraction={saveFilterVersiumApi.isLoading}
                                                            onClick={() => {
                                                                const stateversim = {
                                                                    from: 'targetlist',
                                                                    mode: 'filter',
                                                                    type: 'versium',
                                                                    // data: locationVersium?.from,
                                                                    data: locationVersium?.from?.data,
                                                                    id: locationVersium?.data,
                                                                };
                                                                const encryptstateversim = encodeUrl(stateversim);
                                                                navigate(
                                                                    `/audience/add-audience?q=${encryptstateversim}`,
                                                                    {
                                                                        state: stateversim,
                                                                    },
                                                                );
                                                            }}
                                                            id="rs_TargetListCreation_Cancel"
                                                        >
                                                            {CANCEL}
                                                        </RSSecondaryButton>
                                                        <RSPrimaryButton
                                                            onClick={async () => {
                                                                if (saveFilterVersiumApi.isLoading) return;
                                                                const attributesData = getValues();
                                                                const userInfoIds = {
                                                                    departmentId,
                                                                    clientId,
                                                                    userId,
                                                                    locationVersium,
                                                                };
                                                                const {
                                                                    segmentation: { listName },
                                                                    attributeslistCount,
                                                                    inclusionAudience,
                                                                    zeroDayLists,
                                                                    filterLists,
                                                                    inclusionLists,
                                                                    exclusionLists,
                                                                    lookALikeAudLists,
                                                                    lookALikeAttrLists,
                                                                    finalAudienceCount,
                                                                } = attributes;
                                                                let finalData = finalAPIData(
                                                                    attributesData,
                                                                    attributeslistCount,
                                                                    attributeTypes,
                                                                    '',
                                                                    '',
                                                                    userInfoIds,
                                                                    finalAudienceCount,
                                                                );
                                                                // console.log('locationVersium: ', locationVersium);
                                                                let filterListData = JSON.stringify(
                                                                    attributesData?.filterLists?.map((e, ind) => {
                                                                        return {
                                                                            id: ind,
                                                                            name:
                                                                                e?.labelText || e.name || e.nAME || '',
                                                                            // value: e?.attributeValue.toString(),
                                                                            value: e.attributeValue
                                                                                ? e.attributeValue
                                                                                      .map((v) => v.data)
                                                                                      .join(',')
                                                                                : '',
                                                                        };
                                                                    }),
                                                                );
                                                                let InclusionListData = JSON.stringify(
                                                                    attributesData?.inclusionLists?.map((e, ind) => {
                                                                        return {
                                                                            id: ind,
                                                                            name:
                                                                                e?.labelText || e.name || e.nAME || '',
                                                                            // value: e?.attributeValue.toString(),
                                                                            value: e.attributeValue
                                                                                ? e.attributeValue
                                                                                      .map((v) => v.data)
                                                                                      .join(',')
                                                                                : '',
                                                                        };
                                                                    }),
                                                                );
                                                                let ExclusionListData = JSON.stringify(
                                                                    attributesData?.exclusionLists?.map((e, ind) => {
                                                                        return {
                                                                            id: ind,
                                                                            name:
                                                                                e?.labelText || e.name || e.nAME || '',
                                                                            // value: e?.attributeValue.toString(),
                                                                            value: e.attributeValue
                                                                                ? e.attributeValue
                                                                                      .map((v) => v.data)
                                                                                      .join(',')
                                                                                : '',
                                                                        };
                                                                    }),
                                                                );
                                                                finalData = {
                                                                    filterRuleJson: finalData,
                                                                    // finalAudienceCount: finalAudienceCount,
                                                                    finalAudienceCount: (finalData.finalAudienceCount =
                                                                        finalAudienceCount +
                                                                        '||' +
                                                                        filterListData +
                                                                        '||' +
                                                                        InclusionListData +
                                                                        '||' +
                                                                        ExclusionListData),
                                                                    connectorId: 40,
                                                                    connectorName: 'Versium',
                                                                    remotesettingID:
                                                                        locationVersium?.data?.remoteSettingId,
                                                                    // premotesettingId:
                                                                    //     locationVersium?.data?.temppremoteSettingId,
                                                                    premotesettingId:
                                                                        locationVersium?.data?.premoteSettingId,
                                                                    clientId,
                                                                    userId,
                                                                    departmentId,
                                                                };
                                                                const res = await saveFilterVersiumApi.refetch({
                                                                    mode: 'create',
                                                                    fetcher: (params) =>
                                                                        dispatch(
                                                                            saveFilterJSON_Versium({
                                                                                payload: params,
                                                                                loading: false,
                                                                            }),
                                                                        ),
                                                                    params: finalData,
                                                                });
                                                                if (res?.status) {
                                                                    dispatchState({
                                                                        type: 'RESET',
                                                                    });
                                                                    dispatch(
                                                                        update_target_list({
                                                                            field: 'leftPanelAtt',
                                                                            data: {},
                                                                        }),
                                                                    );
                                                                    dispatch(
                                                                        update_target_list({
                                                                            field: 'editList',
                                                                            data: {},
                                                                        }),
                                                                    );

                                                                    dispatch(
                                                                        update_target_list({
                                                                            field: 'SubSegmentExp_List',
                                                                            data: [],
                                                                        }),
                                                                    );
                                                                    const stateversim = {
                                                                        from: 'targetlist',
                                                                        mode: 'filter',
                                                                        type: 'versium',
                                                                        // data: locationVersium?.from,
                                                                        data: locationVersium?.from?.data,
                                                                        id: locationVersium?.data,
                                                                        extConfig: locationVersium?.extConfig
                                                                    };
                                                                    const encryptstateversim = encodeUrl(stateversim);
                                                                    navigate(
                                                                        `/audience/add-audience?q=${encryptstateversim}`,
                                                                        {
                                                                            state: stateversim,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                            disabledClass={!isCreateStatus() ? 'pe-none click-off' : ''}
                                                            isLoading={saveFilterVersiumApi.isLoading}
                                                            blockBodyPointerEvents={saveFilterVersiumApi.isLoading}
                                                            id="rs_TargetListCreation_submit"
                                                        >
                                                            {APPLY}
                                                        </RSPrimaryButton>
                                                    </>
                                                ) : attributesLoading ? (
                                                    <div className="d-flex gap-2 mt41">
                                                        <CommonSkeleton box width={100} height={40} />
                                                        <CommonSkeleton box width={100} height={40} />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <RSSecondaryButton
                                                            type="button"
                                                            onClick={handleCancelNavigate}
                                                            blockInteraction={isCreating}
                                                            id="rs_TargetListCreation_Cancelbutton"
                                                        >
                                                            {CANCEL}
                                                        </RSSecondaryButton>

                                                        {(Object.keys(ispartnerDigipopstate)?.length === 0 ||
                                                            ispartnerDigipopstate?.listId !== 2) && (
                                                            <>
                                                                <RSTooltip
                                                                    text={MIN_POTENTIAL_AUD_LOOKALIKE}
                                                                    position="top"
                                                                    show={
                                                                        !filterLists?.length ||
                                                                        filterGroups?.groups?.includes(
                                                                            'lookALikeAttrLists',
                                                                        ) ||
                                                                        (!!filterLists?.length &&
                                                                            getFinalAudienceCount(getValues) >=
                                                                                LOOKALIKE_MIN_POTENTIAL_AUDIENCE)
                                                                            ? false
                                                                            : undefined
                                                                    }
                                                                    className="ml13"
                                                                >
                                                                    <RSSecondaryButton
                                                                        className={`color-primary-blue`}
                                                                        disabledClass={`${
                                                                            filterLists?.length < 1 ||
                                                                            filterGroups?.groups?.includes(
                                                                                'lookALikeAttrLists',
                                                                            ) ||
                                                                            attributes?.totalAudiences <
                                                                                LOOKALIKE_MIN_POTENTIAL_AUDIENCE ||
                                                                            getFinalAudienceCount(getValues) <
                                                                                LOOKALIKE_MIN_POTENTIAL_AUDIENCE
                                                                                ? 'pe-none click-off'
                                                                                : ''
                                                                        }`}
                                                                        onClick={async () => {
                                                                            let isLookAlike = true;

                                                                            await filterGroupRef.current.handleAudienceCount(
                                                                                isLookAlike,
                                                                            );

                                                                            addFilterGroup(
                                                                                LOOK_A_LIKE_GROUPS[0],
                                                                            );
                                                                        }}
                                                                    >
                                                                        {LOOK_ALIKE}
                                                                    </RSSecondaryButton>
                                                                </RSTooltip>

                                                                {/* <BootstrapDropdown
                                                                    data={LOOK_A_LIKE_GROUPS}
                                                                    flatIcon
                                                                    defaultItem={
                                                                        <RSSecondaryButton
                                                                            type="button"
                                                                            className="color-secondary-blue"
                                                                            id="rs_TargetListCreation_Look-alike"
                                                                        >
                                                                            {LOOK_ALIKE}
                                                                        </RSSecondaryButton>
                                                                    }
                                                                    showUpdate={false}
                                                                    className="ml15 lookalikeBtn"
                                                                    // disbleItems={[
                                                                    //     'Attributes',
                                                                    //     ...filterGroups?.disableGroups,
                                                                    // ]}
                                                                    onSelect={async (filterGroup) => {
                                                                        let isLookAlike = filterGroup === 'Attributes';
                                                                        if (isLookAlike) {
                                                                            await filterGroupRef.current.handleAudienceCount(
                                                                                isLookAlike,
                                                                            );
                                                                            addFilterGroup(filterGroup);
                                                                        } else {
                                                                            addFilterGroup(filterGroup);
                                                                        }
                                                                    }}
                                                                    // containerClass={`${
                                                                    //     filterLists?.length < 1 ||
                                                                    //     filterGroups?.groups?.includes('lookALikeAttrLists')
                                                                    //         ? 'pe-none click-off'
                                                                    //         : ''
                                                                    //     }`}
                                                                /> */}
                                                            </>
                                                        )}
                                                        {!isPageClickOff ? (
                                                            <RSPrimaryButton
                                                                type="submit"
                                                                isLoading={isCreating}
                                                                blockBodyPointerEvents={isCreating}
                                                                disabledClass={` ${
                                                                    !isCreateStatus() ||
                                                                    isDisableFilterGroup ||
                                                                    handleErrorClickOff() ||
                                                                    isCreating
                                                                        ? 'pe-none click-off'
                                                                        : ''
                                                                } ${
                                                                    Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                                                    ispartnerDigipopstate?.listId === 2 &&
                                                                    isUpdate
                                                                        ? 'd-none'
                                                                        : ''
                                                                } ${
                                                                    !isFinalCount &&
                                                                    Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                                                    ispartnerDigipopstate?.listId === 2
                                                                        ? 'pe-none click-off'
                                                                        : ''
                                                                }`}
                                                                id="rs_TargetListCreation_submit"
                                                                className="mt-3"
                                                            >
                                                                {isUpdate ? 'Update' : 'Create'}
                                                            </RSPrimaryButton>
                                                        ) : null}
                                                    </>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </Row>
                                )}
                            </Container>
                        </div>

                        {!showEditListSkeleton && !showEditListError && isRFAAlert.show && (
                            <WarningPopup
                                show={isRFAAlert.show}
                                handleClose={() => {
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
                            />
                        )}
                        {!showEditListSkeleton && !showEditListError && showActiveCommunicationListWarning && <RSConfirmationModal
                                show={showActiveCommunicationListWarning}
                                header="Info"
                                text="This list is currently used in an active communication. Changes may affect audience count and Reports."
                                handleClose={() => setShowActiveCommunicationListWarning(false)}
                                handleConfirm={() => setShowActiveCommunicationListWarning(false)}
                                secondaryButton={false}
                                primaryButtonText={OK}
                        />}
                        {isRFAAlertReject && (
                            <WarningPopup
                                show={isRFAAlertReject}
                                handleClose={() => {
                                    setisRFAAlertReject(false);
                                }}
                                text="Target list rejected successfully"
                                isheader={true}
                                isPrimary={true}
                                isPrimaryText={OK}
                            />
                        )}
                        {isRFAAlert.reject && (
                        <RSModal
                            show={isRFAAlert.reject}
                            handleClose={() => {
                                if (isActionLoading) return;
                                handleCloseReject();
                            }}
                            isCloseDisabled={isActionLoading}
                            lockBackground={isActionLoading}
                            header={'Comments'}
                            footer={
                                <div className="buttons-holder">
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
                                </div>
                            }
                            body={
                                <Fragment>
                                    <RSTextarea
                                        name="comments"
                                        control={control}
                                        required
                                        placeholder={ENTER_COMMENTS}
                                        rules={{
                                            required: 'Required',
                                        }}
                                        maxLength={500}
                                    />
                                    <small>{MAX_500_CHARACTERS}</small>
                                    <small>{approvalcomments?.length || 0}/500</small>

                                    {/* <h3>History</h3> */}
                                </Fragment>
                            }
                        />
                        )}
                        {/* Modals */}
                        {isOpenSegmentModal && !isBQAudienceCount && (
                            <SegmentationRecalculate
                                show={isOpenSegmentModal}
                                handleClose={(status) => {
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: status,
                                        field: 'isOpenSegmentModal',
                                    });
                                }}
                                getBQAudienceCount={(status) => {
                                    if (status) {
                                        filterGroupRef.current.handleAudienceCount();
                                    }
                                }}
                                partnerData={
                                    (Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                        ispartnerDigipopstate?.listId === 2) ||
                                    locationVersium?.isMDCSubSegment
                                }
                                recalculateLater={(status) => {
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: status,
                                        field: 'isOpenSegmentModal',
                                    });
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: status,
                                        field: 'calculateLater',
                                    });
                                    if (!isBQAudienceCount) {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: status,
                                            field: 'isBQAudienceCount',
                                        });
                                    }
                                }}
                            />
                        )}
                        {isOpenSegmentModal && isBQAudienceCount && (
                            <SegmentationSave
                                show={isOpenSegmentModal}
                                isUpdate={isUpdate}
                                filterGroupRef={filterGroupRef}
                                partnerData={
                                    Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                    ispartnerDigipopstate?.listId === 2
                                }
                                isUniqueID={isUniqueID}
                                handleClose={(status) => {
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: status,
                                        field: 'isOpenSegmentModal',
                                    });
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: false,
                                        field: 'calculateLater',
                                    });
                                    const {
                                        zeroDayLists,
                                        filterLists,
                                        inclusionLists,
                                        exclusionLists,
                                        lookALikeAudLists,
                                        lookALikeAttrLists,
                                    } = attributes;
                                    if (
                                        handleCheckValue(zeroDayLists) ||
                                        handleCheckValue(filterLists) ||
                                        handleCheckValue(inclusionLists) ||
                                        handleCheckValue(exclusionLists) ||
                                        handleCheckValue(lookALikeAudLists) ||
                                        handleCheckValue(lookALikeAttrLists)
                                    ) {
                                        dispatchState({
                                            type: 'UPDATE',
                                            payload: false,
                                            field: 'isBQAudienceCount',
                                        });
                                    }
                                }}
                            />
                        )}
                    </Container>
                    {/* Main page content block ends */}
                    </>
                    )}
                </div>
                {getWarningPopupMessage(failureApiErrors, dispatch)}
            </TargetListContext.Provider>
        </FormProvider>
        //Content holder ends
    );
};

export default TargetListCreation;
