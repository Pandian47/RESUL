import { LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { numberWithCommas, formatName } from 'Utils/modules/formatters';
import { charNumUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { validateRFAMandatory } from 'Utils/modules/campaignUtils';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { safeObjectKeys } from 'Utils/modules/misc';
import { FILTER_GROUPS, FILTER_GROUPS_PARTNER, FORM_INITIAL_STATE, INITIAL_STATE, LOOK_A_LIKE_GROUPS, STATE_REDUCER, ZERO_DAY_FIELD_NAME, ZERO_DAY_FILES, _isAttributesErrors, applyLookAlikeAttributes, availableInclsuionExclusionList, checkCountTakenStatus, filterGroupLimitInMultiFilterConfig, filterGroupLimitInNormalFilterConfig, filterValue, finalAPIData, finalOrderWiseGroupLists, getFieldObject, getFieldType, getFinalAudienceCount, getListMaxValue, getListTypeDetail, getPotentialCountPayload, getallAttributes, handlePartnerAttributeData, makeExpressionVersium, safeParse, shortKeyNormalFlowConfig, solrFieldNameSplit } from './constant';
import { MAX_LENGTH200, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_LIST_NAME, MINLENGTH, SPECIAL_CHATACTERS_NOT_ALlOWED } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_GROUP, APPLY, APPROVE, APPROVER_EMAIL, APPROVER_NAME, AUDIENCE_SELECTION, CANCEL, COMMENTS, EDIT_SUB_SEGMENT_LIST, ENTER_COMMENTS, EXTRACTION_LIMIT, LOOK_ALIKE, MAX_500_CHARACTERS, NEW_SUB_SEGMENT_LIST, OK, REJECT, RENAME, SAVE, TARGETLIST_NAME, TOT_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { checkbox_mini, circle_plus_fill_edge_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, createContext, createRef, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { get as _get,isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
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
import {
    getAttributesErrorMessageValues,
    handleDuplicateAttributes,
    transformData_subsegment,
} from 'Pages/AuthenticationModule/Components/SegmentationLists/constant';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
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
import { resetTLLeftJSON, update_target_list } from 'Reducers/audience/targetListCreation/reducer';
import { saveFilterJSON_Versium } from 'Reducers/remoteDataSource/request';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { getAttributeValues_zeroDay } from 'Reducers/audience/targetListCreation/request';
export const TargetListContext = createContext({
    targetListState: {},
    dispatchState: () => { },
    handleZeroDayAttributes: () => { },
    isUpdate: false,
    updateId: 0,
    apicallStatusDetail: {},
});

var isUniqueID = uuid();

const TargetListCreation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationVersium = useQueryParams('/audience');
    const navigateToAudienceTargetList = useCallback(() => {
        const url = '/audience';
        const index = 1;
        const state1 = { index };
        const encryptState = encodeUrl(state1);
        navigate(`${url}?q=${encryptState}`, {
            state: { index },
        });
    }, [navigate]);
    const listNameRef = useRef('');

    const { ispartnerDigipop } = getUserDetails();
    // console.log('locationVersium: ', locationVersium);
    // const isUpdate = location?.state?.mode === 'edit';
    let updateId =
        locationVersium?.isMDCSubSegment && locationVersium?.mdcSegmentMode === 'edit'
            ? locationVersium?.subSegmentId
            : location.state?.segmentationListID;
    let islistType = new URLSearchParams(window.location.search).get('listType') || '0';
    let updateVersium = locationVersium?.from?.type === 'versium';
    const disablePartnerData = updateVersium ? true : false;
    const dispatch = useDispatch();
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
    } = useSelector(({ dataTargetListReducer }) => dataTargetListReducer);
    const basePayload = { departmentId, clientId, userId };

    const rfaapprovalList = useSelector((state) => getRequestApprovalList(state));
    const { failureApiErrors, isCurrentBURFAStatus } = useSelector(({ globalstate }) => globalstate);
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
    const [isApplyingVersium, setIsApplyingVersium] = useState(false);
    const [isRFAAlert, setRFAAlert] = useState({
        show: false,
        content: '',
        reject: false,
        isApproved: false,
    });
    const [showActiveCommunicationListWarning, setShowActiveCommunicationListWarning] = useState(false);
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

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            dispatch(resetTLLeftJSON());
            window.removeEventListener('scroll', handleScroll);
            listNameRef.current = '';
        };
    }, []);
    useEffect(() => {
        const isApprovalLink = new URLSearchParams(window.location.search).get('rfa') || 'false';
        const isApprovalStatus = new URLSearchParams(window.location.search).get('approval') || '0';
        if (isApprovalLink === 'true' && isApprovalStatus === '2') {
            setRFA(true);
            setRFARejectComments(true);
        } else if (isApprovalLink === 'true' && isApprovalStatus === '0') {
            setRFA(true);
        } else {
            setRFA(false);
        }
        if (!rfaapprovalList?.length) {
            const payload = {
                clientId,
                departmentId,
                userId,
            };
            // dispatch(getRequestApprovalUserDetails({ payload }));
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
        dispatch(
            getEditAttributeValue1AJSONTargetList(
                {
                    departmentId,
                    listId: parseInt(updateId, 10),
                    partnerID:
                        location.state?.from?.type === 'versium'
                            ? 40
                            : parseInt(islistType, 10) === 16 ||
                                (Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2)
                                ? 41
                                : 0,
                    clientId,
                    userId,
                    isSubSegment: locationVersium?.isMDCSubSegment ? true : false,
                },
                apicallStatusDetail,
            ),
        );
    };

    const handleLeftPanelAttributeApi = () => {
        handleAttributeLoadingDispatch(true);
        dispatch(getTargetListPanel({ payload: { ...basePayload, partnerID: getPartnerID() }, dispatchState }));
        handleAttributeLoadingDispatch(false);
    };

    const handleCurrentEditListApi = () => {
        dispatch(
            getIndividualTargetList({
                payload: { departmentId, listId: parseInt(updateId, 10), clientId, userId },
                loading: false,
                dispatchState,
            }),
        );
    };

    const getPartnerID = () => {
        const isFromVersium = location.state?.from?.type === 'versium' || locationVersium?.from?.type === 'versium';

        if (isFromVersium) return 40;

        const isType16 = parseInt(islistType, 10) === 16;
        const isDigiPop = Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2;

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
                    handleAttributeLoadingDispatch(true);
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
                    if (!safeObjectKeys(leftPanelAtt).length) {
                        handleLeftPanelAttributeApi();
                    }
                }
            }
        }
    };

    const getExpressionByIDS = async () => {
        const payload = {
            listId: locationVersium?.listId.toString(),
            departmentId,
            clientId,
            userId,
        };
        await dispatch(getExpression_byIDS(payload));
    };
    const getCountByExpression = async () => {
        const userInfoIds = { departmentId, clientId, userId };
        let transformedData_SubSegmentExp = transformData_subsegment(SubSegmentExp_List);
        const finalData = getPotentialCountPayload(
            userInfoIds,
            transformedData_SubSegmentExp,
            locationVersium,
        );

        const response = await dispatch(allGroupAudienceGroup(finalData, false));

        const countRes = safeParse(response?.data, {});
        if (SubSegmentExp_List[0]?.listType !== 1) {
            setValue('totalAudiences', countRes?.FinalAudienceCount);
        }
    };
    const handleSubSegmentEditListApi = async (locationVersium) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            listId: locationVersium?.subSegmentId.toString() ?? 0,
        };

        const response = await dispatch(targetListSubSegmentById({ payload }));
    };

    const handleFullJSONAPI = async () => {
        if (!fullAttributeJSONValues?.length) {
            let payload = {
                clientId,
                departmentId,
                userId,
            };

            const response = await dispatch(getFullAttributeJSONValues({ payload, dispatchState, from: 'targetList' }));

            apicallStatusDetail.current = {
                ...apicallStatusDetail.current,
                fullAttributeJSONAPICall: true,
            };
            const params = new URLSearchParams(location.search);
            const targetListId = params.get('targetListId');
            handleOneAJSONAPIFunc(response?.data ?? '', true, targetListId ?? false);
        }
    };

    useEffect(() => {
        if (parseInt(updateId, 10) > 0) {
            if (location && !locationVersium?.isMDCSubSegment) {
                handleCurrentEditListApi();
            }
        }
        if (!safeObjectKeys(leftPanelAtt).length) {
            handleLeftPanelAttributeApi();
        }
        if (location && !locationVersium?.isAdhocList) {
            handleFullJSONAPI();
        }
    }, [location, departmentId, clientId, userId]);

    useEffect(() => {
        if (Object.keys(ispartnerDigipopstate)?.length) {
            handleLeftPanelAttributeApi();
        }
    }, [ispartnerDigipopstate]);

    const handleOneAJSONAPIFunc = async (callBackFullAttributeJSONValues, isStatus, isEditFlow) => {
        if (isUpdate || isEditFlow) {
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
            }

            if (shouldCallOneAJSON) {
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
            }
        }
    };

    useEffect(() => {
        handleOneAJSONAPIFunc();
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
        if (leftPanelAtt?.brand_category?.length > 0) getDataAttributes(leftPanelAtt, 'default');
    }, [leftPanelAtt]);

    useEffect(() => {
        if (isPartnerSavedRef.current) return;
        if (isUpdate && !_isEmpty(editList) && searchAttributes?.length > 0) {
            isPartnerSavedRef.current = true;
            if (editList?.isLookAlike === 1) {
                const recAttrs = safeParse(editList.lookAlikeRecommendedAttributes, []);
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
            if (isPartnerAttSaved) {
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
        if (leftPanelAtt_Adhoc?.brand_category?.length > 0) getDataAttributes(leftPanelAtt_Adhoc, 'adhoc');
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
        if ((isUpdate && !_isEmpty(editList)) || updateVersium) {
            getSegmentationResult(
                attributesData,
                leftPanelAttributes,
                updateVersium,
                locationVersium,
                ispartnerDigipopstate,
            );
        }
    }, [editList, updateVersium, isUpdate]);

    useEffect(() => {
        if (isUpdate && !_isEmpty(rfaList)) {
            if (isRFA) {
                let tempData = rfaList?.filter((e) => e.approvalStatus === 1);
                const myArrayFiltered = rfaapprovalList.filter((el) => {
                    return tempData?.some((f) => {
                        return f.approverEmail === el.email;
                    });
                });
                const isUserid = myArrayFiltered?.filter((e) => e.userId === userId);
                if (isUserid?.length === 1) {
                    setRFAAlert({
                        content: 'Target list has been already approved.',
                        show: true,
                        reject: false,
                        isApproved: true,
                    });
                    setIsViewOnly(true);
                } else {
                    if (!rfaapprovalList.some((e) => e?.userId === userId)) {
                        setRFAAlert((prev) => ({
                            ...prev,
                            content: 'You are not an approver for this target list.',
                            show: true,
                            isApproved: true,
                        }));
                        setIsViewOnly(true);
                    } else {
                        if (rfaList[0]?.createdBy === userId) {
                            setRFAAlert((prev) => ({
                                ...prev,
                                content: 'You are not an approver for this target list.',
                                show: true,
                                isApproved: true,
                            }));
                            setIsViewOnly(true);
                        } else {
                            setRFAAlert((prev) => ({
                                show: false,
                                content: '',
                                reject: false,
                                isApproved: false,
                            }));
                            setIsViewOnly(false);
                        }
                    }
                }
            }
        }
    }, [rfaList, isUpdate]);
    const handleApproveDynamicList = async () => {
        const payload = {
            segmentationId: editListID,
            departmentId,
            clientId,
            userId,
        };
        if (tempUserId?.length > 0) {
            const res = await dispatch(approveTargetList({ payload }));
            if (res?.status) {
                setRFAAlert((prev) => ({
                    ...prev,
                    content: 'Target list approved successfully',
                    show: true,
                }));

                setTimeout(() => {
                    navigateToAudienceTargetList();
                    // navigate('/audience', {
                    //     state: {
                    //         index: 1,
                    //     },
                    // });
                }, 5000);
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

        const res = await dispatch(rejectTargetList({ payload }));
        // console.log('payload: ', payload);
        if (res?.status) {
            setisRFAAlertReject(true);
            setTimeout(() => {
                navigateToAudienceTargetList();
                // navigate('/audience', {
                //     state: {
                //         index: 1,
                //     },
                // });
            }, 1000);
        }
    };
    const getDataAttributes = (data, field) => {
        if (field !== 'zeroDay') {
            const res = data;
            let category = res?.brand_category;
            const brandAttributes = res?.attributesList?.filter((attributeList) => !attributeList?.partnerId);
            const partnerAttributes = res?.attributesList?.filter((attributeList) => attributeList?.partnerId);
            const attributesData = res?.brand_category?.map((category, _) => {
                const attributesLists = brandAttributes?.filter((attribute, _) => attribute.category === category);
                return { [category]: attributesLists };
            });

            const leftpanelAttributes = attributesData?.map((attribute, _, category) => {
                const [entries] = Object.entries(attribute);
                const [key, value] = entries;
                let sortedValues = value?.sort((a, b) => b.sOLRCountValue - a.sOLRCountValue);
                // Reorder the array
                const reorderedData = sortedValues.sort((a, b) => {
                    if (a.name === ZERO_DAY_FIELD_NAME) return -1;
                    if (b.name === ZERO_DAY_FIELD_NAME) return 1;
                    return 0;
                });
                let sliceValue =
                    Object.keys(ispartnerDigipopstate)?.length > 0 && ispartnerDigipopstate?.listId === 2
                        ? 20
                        : category?.length > 2
                            ? 5
                            : 20;
                // let sortedAscAttribute = sortedValues?.sort((a, b) => a.labelText.localeCompare(b.labelText));

                return { [key]: sortedValues?.slice(0, sliceValue), ['isExpanded']: 0 };
            });

            const expandedKeys = leftpanelAttributes?.map((attribute, _, category) =>
                Object.keys(attribute)[0]?.toLowerCase(),
            );
            const attributes = [];
            attributesData
                ?.filter((attribute, _) => {
                    const [entries] = Object.entries(attribute);
                    const [key, value] = entries;
                    if (expandedKeys?.includes(key?.toLowerCase())) {
                        return value;
                    }
                })
                ?.forEach((attribute) => attributes.push(...Object.values(attribute)?.flat()));
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

            setValue('totalAudiences', res?.totalPotentialCount);
            if (SubSegmentExp_List?.length > 0 && SubSegmentExp_List[0]?.listType !== 1) {
                setValue('totalAudiences', locationVersium?.isReceipientCount);
            } else if (SubSegmentExp_List?.length > 0 && SubSegmentExp_List[0]?.listType === 1) {
                setValue('totalAudiences', SubSegmentExp_List[0]?.listCount);
            } else {
                setValue('totalAudiences', res?.totalPotentialCount);
            }
        } else {
            const res = data;
            const headerName = res.slice(-1).pop();
            let uniqueKey = headerName.headerName + ' (' + headerName.CreatedDate + ')';
            let category = uniqueKey?.split("'");
            const attributes = res.slice(0, res?.length - 1)?.map(({ FieldName, FieldType, dataTypeId }) => ({
                FieldName,
                FieldType,
                isvirtualfield: false,
                category: uniqueKey,
                cattype: null,
                dataTypeId: dataTypeId,
                isMultiValue: true,
                labelText: FieldName,
                name: FieldName,
                dataAttributeId: 0,
                departmentId: 1,
                fieldType: dataTypeId.toString(),
                parentChildIdentify: null,
                sOLRCountValue: 5,
                restype: null,
                sOLRFieldName: `${FieldName}_${FieldType}`,
                valueCollection: null,
                indexedDate: headerName.CreatedDate,
                audienceCount: headerName.AudienceCount,
            }));

            const attributesData = category?.map((category, _) => {
                const attributesLists = attributes?.filter((attribute, _) => attribute.category === category);
                return { [category]: attributesLists };
            });
            const leftpanelAttributes = attributesData?.map((attribute, _) => {
                const [entries] = Object.entries(attribute);
                const [key, value] = entries;

                return { [key]: value, ['isExpanded']: 0 };
            });

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
        // setValue('totalAudiences', res?.totalPotentialCount);
        if (isUpdate) {
            // console.log(editList?.recipientsBunchName, 'recipientsBunchName');
            // setValue('segmentation.listName', location?.state?.recipientsBunchName);
            if (!locationVersium?.isMDCSubSegment) {
                setValue('segmentation.listName', editList?.recipientsBunchName);
                setEditListName(editList?.recipientsBunchName);
            } else {
                handleBindListName();
            }
            if (editList?.extractionLimit !== undefined && editList?.extractionLimit !== 0) {
                setValue('extractionCheck', true);
                setValue('extractionLimit', String(editList?.extractionLimit));
            }
            dispatchState({
                type: 'UPDATE',
                payload: true,
                field: 'isListField',
            });
        }
    };

    const handleVirtualFieldData = async (field) => {
        let virtualFieldsKeys = [];

        if (!field?.IsVirtualField) return [];

        const key = field.SOLRFieldName;

        const customAttributeName = (attName, field) => {
            switch (field?.SOLRFieldName) {
                case 'Campaign_summary_s':
                    return field?.Field?.split(' ')?.join('_');
                default:
                    return attName;
            }
        };

        if (!virtualFieldsKeys?.includes(key)) {
            virtualFieldsKeys.push(key);
            const payload = {
                attributeName: customAttributeName(solrFieldNameSplit(field.SOLRFieldName)?.before, field),
                departmentId,
                clientId,
                userId,
            };
            try {
                const res = await dispatch(getVirtualFieldData(payload, dispatchState, key));
            } catch (err) { }
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
            (!locationVersium?.isMDCSubSegment && !!versiumData && safeObjectKeys(versiumData?.ruleJSON).length === 0)
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
                    const fieldObject = getFieldObject(field, fieldType, field.Category, typeData);
                    tempAttributesCount[typeData]?.push([field.LiwaterfallCount, field.LiremainingCount]);
                    return fieldObject;
                });
            };

            const filterFields = handleFIEFields(filterData, 'filterLists');
            tempAttributes?.forEach((attribute) => {
                let labelText = attribute?.split('_')[0];
                filterGroupRef.current.getAttributes(labelText);
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
            } catch (_) { }

            const isMultiInclusionFlow = multiFilterAllGroupList?.length > 0;

            let filterExpressions, inclusionExpressions, exclusionExpressions, lookAlikeExpressions, zeroDayExpressions;

            const parseVersiumExpressions = () => {
                const parsed = safeParse(versiumData.ruleJSON, {});
                filterExpressions = parsed.OriginalBaseExprVal;
                inclusionExpressions = parsed.FilterGroup2ExprVal;
                exclusionExpressions = parsed.Exclusion1ExprVal;
            };

            const parseMDCSubsegmentExpressions = () => {
                const parsed = safeParse(resData.RuleJSON, []);
                const expressionMap = parsed.reduce((acc, curr) => {
                    if (curr?.FilterGroup?.includes('IG1_Subsegment')) acc.filterExpressions = curr;
                    if (curr?.FilterGroup?.includes('IG2_Subsegment')) acc.inclusionExpressions = curr;
                    if (curr?.FilterGroup?.includes('Ex1_Subsegment')) acc.exclusionExpressions = curr;
                    return acc;
                }, {});
                filterExpressions = expressionMap.filterExpressions;
                inclusionExpressions = expressionMap.inclusionExpressions;
                exclusionExpressions = expressionMap.exclusionExpressions;
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
                    if (updateVersium && versiumData?.ruleJSON !== null && filterData?.length === 1) {
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
                    if (matchListInclusionCountResponse && type?.includes('inclusionLists')) {
                        finalFormStateField['inclusionAudience'] =
                            matchListInclusionCountResponse?.expression?.TotalInclusionCount ?? 0;
                    }
                    if (
                        matchListExclusionCountResponse &&
                        matchListExclusionCountResponse?.data?.length &&
                        type?.includes('exclusionLists')
                    ) {
                        const lastAttributeValue = data[data?.length - 1];
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
                    filterGroupRef.current.getAttributes(label);
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
                    const approverList = rfaList?.map((rfa) => ({
                        approverName: {
                            email: rfa?.approverEmail,
                            firstName: rfa?.approverName,
                            name: `${rfa?.approverName} (${rfa?.approverEmail})`,
                        },
                    }));

                    return {
                        ...formState,
                        segmentation: {
                            listName: formState?.segmentation?.listName ?? locationVersium?.listName,
                            isinclusionSwitched: inclusionExpressions?.GroupingOperator === 'AND',
                        },
                        FinalAudienceCount: 0,
                        attributeslistCount: tempAttributesCount,
                        approvalList: {
                            name: approverList,
                            requestApproval: resData?.isRequestApproval === 1,
                            approvalFrom: 'All',
                            approvalCount: '2',
                            followHierarchy: false,
                        },
                        ...finalFormStateField,
                    };
                });
            };

            initializeExpressions();
            let filterData = filterExpressions?.Expressions;

            if (zeroDayExpressions?.FileName) {
                dispatchState({
                    type: 'UPDATE_ZERO_DAY_FILES',
                });
                handleZeroDayAttributes(zeroDayExpressions.FileName).catch((err) => { });
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

            const newFilterList = getValues('filterLists');
            const filterGroupLength = newFilterList?.length || 0;
            if (filterGroupLength > 0 && !!newFilterList?.[0]?.partnerId) {
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
            if (editList?.pythonAPIOutput) {
                const countResAPI = safeParse(editList?.pythonAPIOutput)
                const countRes = { ...countResAPI, isLookAlike: editList?.isLookAlike === 1 }
                setTimeout(() => {
                    filterGroupRef.current.handleAudienceCount(false, false, {}, true, countRes);
                }, 200)
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
        // API Call
        dispatchState({
            type: 'UPDATE',
            payload: true,
            field: 'isLoadingListname',
        });
        const payloadData = {
            departmentId,
            clientId,
            userId,
            listName: name,
            listId: updateId || 0,
            IsMDClist: locationVersium?.isMDCSubSegment ? true : false,
        };
        listNameRef.current = name;
        const res = await dispatch(checkTargetListName(payloadData));
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
                dispatchState({
                    type: 'UPDATE',
                    payload: false,
                    field: 'isValidListname',
                });
            }, 3000);
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
        if (handleDuplicateAttributes(filterGroups, getValues, attributesError, dispatchState)) {
            if (!isValid && !isDirty && updateId) {
                return navigateToAudienceTargetList();
                // navigate(`/audience`, { state: { index: 1 } });
            }
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
                    // Call with loading: true to show loading state
                    const res = await dispatch(checkTargetListName(payloadData, true));
                    if (res?.status) {
                        // List name already exists, set error and stop submission
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
        if (locationVersium) {
            await setValue('segmentation.listName', locationVersium?.listName, {
                shouldValidate: true,
            });
            if (!segmentation?.listName && locationVersium?.mdcSegmentMode === 'create') {
                await handleListNameOnBlur(locationVersium?.listName);
            } else {
                setValue('segmentation.listName', editList?.SubSegmentName ?? locationVersium?.listName);
                setEditListName(editList?.SubSegmentName ?? locationVersium?.listName);
            }
        } else {
            setValue(
                'segmentation.listName',
                editList?.recipientsBunchName ?? editList?.SubSegmentName ?? locationVersium?.listName,
            );
            setEditListName(editList?.recipientsBunchName ?? editList?.SubSegmentName ?? locationVersium?.listName);
        }
    };

    useEffect(() => {
        if (locationVersium && Object.keys(editList)?.length && updateId) {
            handleBindListName();
        } else {
            handleBindListName();
        }
    }, [locationVersium, editList, updateId]);

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

    const backState = {
        index: 1,
    };
    const encryptBackState = encodeUrl(backState);
    return (
        // Contend holder starts
        <FormProvider {...methods}>
            <TargetListContext.Provider value={contextValue}>
                <div className="page-content-holder targetListPage" ref={wrapperRef}>
                    <RSPageHeader
                        title={handleHeaderTitle()}
                        rightCommonMenus
                        isBuDisabled
                        isAgencyDisabled
                        isBack
                        backPath={`/audience?q=${encryptBackState}`}
                        state={{ index: 1 }}
                    />
                    {/* Main page content block starts */}
                    <Container fluid>
                        <div className="page-content">
                            <Container className="px0">
                                <Row>
                                    <div
                                        className={`${isAPIRequest ? 'pointer-event-none sticky' : 'sticky'} ${locationVersium?.isViewOnly || isViewOnly ? 'click-off' : ''
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
                                                        className={`position-relative mt4 ${updateVersium || locationVersium?.isViewOnly || isViewOnly
                                                            ? 'click-off'
                                                            : ''
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
                                                                    rules={rules.LIST_NAME_RULES(
                                                                        error.ENTER_LIST_NAME,
                                                                        false,
                                                                        regex.MAX_LENGTH200,
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
                                                                    maxLength={regex.MAX_LENGTH200}
                                                                    minLength={regex.MIN_LENGTH}
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
                                            <div
                                                className={`${locationVersium?.isViewOnly || isViewOnly ? 'click-off' : ''
                                                    }`}
                                            >
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
                                                        className={`${isCreateStatus() || attributesLoading
                                                            ? ''
                                                            : 'pe-none click-off'
                                                            } ${Object.keys(ispartnerDigipopstate)?.length > 0 &&
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
                                                                    <div className="form-group">
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
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                        {getValues('extractionCheck') && (
                                                            <RSInput
                                                                control={control}
                                                                name={'extractionLimit'}
                                                                placeholder={EXTRACTION_LIMIT}
                                                                onKeyDown={onlyNumbers}
                                                                required={isCreateStatus()}
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
                                                        )}
                                                    </div>
                                                </Col>
                                            </Row>

                                            {isRFARejectComments && (
                                                <div>
                                                    <h4>{COMMENTS}</h4>
                                                    <Row>
                                                        {rfaList?.map((e) => {
                                                            return (
                                                                <Col>
                                                                    <div>
                                                                        <label>
                                                                            {APPROVER_NAME} :{' '}
                                                                            {e?.approverName}
                                                                        </label>
                                                                    </div>
                                                                    <div>
                                                                        <label>
                                                                            {APPROVER_EMAIL} :{' '}
                                                                            {e?.approverEmail}
                                                                        </label>
                                                                    </div>{' '}
                                                                    <div>
                                                                        <label>
                                                                            {COMMENTS} :{' '}
                                                                            {e?.makeChangesComments}
                                                                        </label>
                                                                    </div>
                                                                </Col>
                                                            );
                                                        })}
                                                    </Row>
                                                </div>
                                            )}
                                            <div className="buttons-holder">
                                                {isRFA ? (
                                                    <>
                                                        <RSSecondaryButton
                                                            type="button"
                                                            onClick={() => {
                                                                // navigateTab({
                                                                //     field: 'audienceTab',
                                                                //     data: 1,
                                                                //     route: `/audience`,
                                                                //     state: { index: 1 },
                                                                // });
                                                                let url = '/audience';
                                                                const state = { index: 1 };
                                                                const encryptState = encodeUrl(state);
                                                                navigate(`${url}?q=${encryptState}`, {
                                                                    state: {
                                                                        index: 1,
                                                                    },
                                                                });
                                                            }}
                                                            id="rs_TargetListCreation_Cancel"
                                                        >
                                                            {CANCEL}
                                                        </RSSecondaryButton>
                                                        {!isRFAAlert?.isApproved && (
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
                                                                if (isApplyingVersium) return;
                                                                setIsApplyingVersium(true);
                                                                try {
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
                                                                const res = await dispatch(
                                                                    saveFilterJSON_Versium({
                                                                        payload: finalData,
                                                                    }),
                                                                );
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
                                                                    };
                                                                    const encryptstateversim = encodeUrl(stateversim);
                                                                    navigate(
                                                                        `/audience/add-audience?q=${encryptstateversim}`,
                                                                        {
                                                                            state: stateversim,
                                                                        },
                                                                    );
                                                                }
                                                            } finally {
                                                                setIsApplyingVersium(false);
                                                            }
                                                            }}
                                                            disabledClass={!isCreateStatus() ? 'pe-none click-off' : ''}
                                                        isLoading={isApplyingVersium}
                                                        blockBodyPointerEvents={isApplyingVersium}
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
                                                            onClick={() => {
                                                                if (location.state?.backAction !== undefined) {
                                                                    let tabValue = location?.state?.tabValue;
                                                                    let tabValueName = location?.state?.tabValueName;
                                                                    let verticalValues = Object.keys(availableTabs);
                                                                    const verticalIndex =
                                                                        verticalValues?.indexOf(tabValueName);
                                                                    let selectedArray =
                                                                        availableTabs[`${tabValueName}`];
                                                                    let tabIndex = selectedArray?.indexOf(tabValue);

                                                                    dispatch(
                                                                        updateTab({
                                                                            field: tabValueName,
                                                                            data: {
                                                                                tabName:
                                                                                    availableTabs[tabValueName][
                                                                                    tabIndex
                                                                                    ],
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
                                                                        navigate(
                                                                            '/communication/create-communication' +
                                                                            location.state?.backAction,
                                                                        );
                                                                    }, 10);
                                                                } else if (locationVersium?.isMDCSubSegment) {
                                                                    const queryParamData = {
                                                                        ...locationVersium,
                                                                        isSubSegementSave: false,
                                                                    };
                                                                    const pageFrom = encodeUrl(queryParamData);
                                                                    navigate(
                                                                        `/communication/mdc-workflow?q=${pageFrom}`,
                                                                    );
                                                                } else {
                                                                    // navigateTab({
                                                                    //     field: 'audienceTab',
                                                                    //     data: 1,
                                                                    //     route: `/audience`,
                                                                    //     state: { index: 1 },
                                                                    // });
                                                                    let url = '/audience';
                                                                    const state = { index: 1 };
                                                                    const encryptState = encodeUrl(state);
                                                                    navigate(`${url}?q=${encryptState}`, {
                                                                        state: {
                                                                            index: 1,
                                                                        },
                                                                    });
                                                                }
                                                            }}
                                                            id="rs_TargetListCreation_Cancelbutton"
                                                        >
                                                            {CANCEL}
                                                        </RSSecondaryButton>

                                                        {(Object.keys(ispartnerDigipopstate)?.length === 0 ||
                                                            ispartnerDigipopstate?.listId !== 2) && (
                                                                <>
                                                                    <RSTooltip
                                                                        text={placeholder?.MIN_POTENTIAL_AUD_LOOKALIKE}
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
                                                                            disabledClass={`${filterLists?.length < 1 ||
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
                                                        {!locationVersium?.isViewOnly && !isViewOnly ? (
                                                            <RSPrimaryButton
                                                                type="submit"
                                                                disabledClass={` ${!isCreateStatus() ||
                                                                    isDisableFilterGroup ||
                                                                    handleErrorClickOff()
                                                                    ? 'pe-none click-off'
                                                                    : ''
                                                                    } ${Object.keys(ispartnerDigipopstate)?.length > 0 &&
                                                                        ispartnerDigipopstate?.listId === 2 &&
                                                                        isUpdate
                                                                        ? 'd-none'
                                                                        : ''
                                                                    } ${!isFinalCount &&
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
                            isheader={false}
                            isPrimary={true}
                            isPrimaryText={OK}
                        // showCancel={true}
                        />
                        {showActiveCommunicationListWarning && <RSConfirmationModal
                            show={showActiveCommunicationListWarning}
                            header="Info"
                            text="This list is currently used in an active communication. Changes may affect audience count and reports."
                            handleClose={() => setShowActiveCommunicationListWarning(false)}
                            handleConfirm={() => setShowActiveCommunicationListWarning(false)}
                            secondaryButton={false}
                            primaryButtonText={OK}
                        />}
                        <WarningPopup
                            show={isRFAAlertReject.show}
                            handleClose={(type) => {
                                setisRFAAlertReject(false);
                            }}
                            text={'sample text'}
                            isheader={false}
                            isPrimary={false}
                            showCancel={false}
                        />
                        <RSModal
                            show={isRFAAlert.reject}
                            handleClose={handleCloseReject}
                            header={'Comments'}
                            footer={
                                <div className="buttons-holder">
                                    <RSSecondaryButton
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
                </div>
                {getWarningPopupMessage(failureApiErrors, dispatch)}
            </TargetListContext.Provider>
        </FormProvider>
        //Content holder ends
    );
};

export default TargetListCreation;
