import { encodeUrl } from 'Utils/modules/crypto';
import { Fragment, createElement, memo, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { Row, Col, Card } from 'react-bootstrap';
import CampaignInfoCardMdcCanvas from '../../Component/CampaignInfoCard/CampaignInfoCardMdcCanvas';
import ClearCanvasModal from './Components/Modal';
import _get from 'lodash/get';

import MdcSidebar from './Components/MdcSidebar/MdcSidebar';
import Canvas from './Components/Canvas/Canvas';
import TemplateList from './Components/Templates/TemplateList';
import PotentialAudienceList from './Components/PotentialAudience/PotentialAudienceList';
import CanvasFooterButton from './Components/CanvasFooterButtons/CanvasFooterButton';
import { resetCreateCommunication } from 'Reducers/communication/createCommunication/create/reducer';

import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from './context';
import {
    communicationCanvasReducer,
    canvasInitialState,
    buildCanvasDataSavePayload,
    GenerateNodeId,
    getChannelWiseCountInSubSegment,
    consumeMdcCanvasSnapshot,
    clearMdcCanvasSnapshot,
} from './constant';
import { SourceRemove } from './Components/ChannelItem/ChannelConst';
import {
    getMdcCanvasData,
    getMdcFlowConfig,
    saveMdcCanvasData,
    deletMdcChannels,
    SavePrioritySegments,
    subsegmentAgainstChannelCountAdhocList,
    subsegmentAgainstChannelCountTargetList,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { getCampaignById } from 'Reducers/communication/createCommunication/plan/request';
import { getSessionId } from 'Reducers/globalState/selector';

import Icon from 'Components/Icon/Icon';
import { arrow_right_medium, arrow_left_medium, circle_time_large } from 'Constants/GlobalConstant/Glyphicons';
import useQueryParams from 'Hooks/useQueryParams';
import { resetMDC, updateSelectedRecipientList } from 'Reducers/communication/createCommunication/Mdc/Canvas/reducer';
import _cloneDeep from 'lodash/cloneDeep';
import _find from 'lodash/find';
import CanvasWarning from './Components/Modal/CanvasWarning';
import RSConfirmationModal from 'Components/ConfirmationModal';
import MdcWorkflowSkeleton from 'Components/Loader/MdcWorkflowSkeleton';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';


const MDC_SUB_SEGMENT_SAVE_HANDLED_KEY = 'mdcSubSegmentSaveHandled';
const SUB_SEGMENT_SAVE_QUERY_KEYS = [
    'isSubSegementSave',
    'subsegmentFinalCount',
    'saveTargetListId',
    'currentTargetNodeId',
    'subSegmentGUID',
];

const WorkFlow = () => {
    const queryParams = useQueryParams('/communication') || {};
    const routerLocation = useLocation();
    const locationState = useMemo(() => {
        const navigationState = routerLocation.state || {};
        if (!queryParams || !Object.keys(queryParams).length) {
            return navigationState;
        }
        if (queryParams.__v === 2 && queryParams.__sid) {
            return Object.keys(navigationState).length ? navigationState : queryParams;
        }
        return { ...queryParams, ...navigationState };
    }, [queryParams, routerLocation.state]);
    const locationCampaignId = _get(locationState, 'campaignId', 0);
    const locationChannelResponseDetailId = _get(locationState, 'channelResponseDetailId', 0);
    const locationPrimaryGoal = _get(locationState, 'primaryGoal', '');
    const locationIsSubSegementSave = !!_get(locationState, 'isSubSegementSave', false);
    const locationCurrentTargetNodeId = _get(locationState, 'currentTargetNodeId', null);
    const locationSaveTargetListId = _get(locationState, 'saveTargetListId', null);
    const locationSubsegmentFinalCount = _get(locationState, 'subsegmentFinalCount', null);
    const locationSubSegmentGUID = _get(locationState, 'subSegmentGUID', '');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const canvasRef = useRef(null);
    const countdownRef = useRef(180);
    const placeholderAddRefStatus = useRef(false);
    const lastUpdatedCanvasState = useRef(null);
    const subSegmentSaveInFlightRef = useRef(false);
    const canvasInitCampaignRef = useRef(null);
    const [channelResponseDetailId, setChannelResponseDetailId] = useState(0);
    const [campaignId, setCampaignId] = useState(0);
    const [isAlign, setAlign] = useState(false);
    const [isNewTemplateSaved, setIsNewTemplateSaved] = useState(false);
    const [segmentStatusPopup, setSegmentStatusPopup] = useState(false);
    const [calculateStatusPopup, setCalculateStatusPopup] = useState(false);
    const [offlineConversionChannelWarningPopup, setOfflineConversionChannelWarningPopup] = useState({
        show: false,
        incompatibleChannelLabels: [],
    });
    const [countdown, setCountdown] = useState(30);

    // const { state: locationState } = useLocation();

    //const { channelResponseDetailId = 0, campaignId } = locationState || {};
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    //const {canvasTemplateList} = useSelector(({mdcCanvasFlowReducer})=> mdcCanvasFlowReducer)
    const { isSubSegmentContentCompleted } = useSelector(({ mdcCanvasFlowReducer }) => mdcCanvasFlowReducer);
    const [canvasState, dispatchState] = useReducer(
        communicationCanvasReducer,
        JSON.parse(JSON.stringify(canvasInitialState)),
    );
    const canvasVal = useMemo(() => ({ canvasState, dispatchState }), [canvasState]);
    const [showCanvasResetModal, setShowCanvasResetModal] = useState(false);
    const [isWorkflowLoading, setIsWorkflowLoading] = useState(Boolean(locationCampaignId));
    const [isTemplateCanvasLoading, setIsTemplateCanvasLoading] = useState(false);
    const [isWorkflowNavigating, setIsWorkflowNavigating] = useState(false);

    const [collapse, setCollapse] = useState(true);
    //const contentMode = _get(locationState, 'mode', 'create');
    const receipientList = _get(canvasState, 'Campaign.PotentialRecipients.Recipients', []);

    useEffect(() => {
        if (locationState && Object.keys(locationState)?.length) {
            const { channelResponseDetailId, campaignId } = locationState;
            setChannelResponseDetailId(channelResponseDetailId);
            setCampaignId(campaignId);
            canvasState['CampaignGoal'] = _get(locationState, 'primaryGoal', '');
        }
    }, [locationState]);
    useEffect(() => {
        document.body.classList.add('mdc-body');
        return () => {
            document.body.classList.remove('mdc-body');
        };
    }, []);

    const handleUpdateFormatCountResponse = (countData, payload) => {
        const isAdhocList = handleCheckAdhocOrTarget();

        if (isAdhocList) {
            const {
                MobileNoCount = 0,
                EmailIDCount = 0,
                FinalAudienceCount = 0,
                recipientCountMobilePush = 0,
                recipientCountVMS = 0,
                recipientCountWebPush = 0,
                recipientCountWhatsApp = 0,
            } = countData || {};
            const finalResponse = {
                recipientCount: parseInt(FinalAudienceCount, 10),
                recipientCountEmail: parseInt(EmailIDCount, 10),
                recipientCountMobile: parseInt(MobileNoCount, 10),
                recipientCountMobilePush,
                recipientCountVMS: parseInt(MobileNoCount, 10),
                recipientCountWebPush,
                recipientCountWhatsApp: parseInt(MobileNoCount, 10),
                recipientsBunchName: '',
                segmentationListId: parseInt(canvasState?.dataSource?.DataList?.join(), 10),
                subSegmentId: payload.SubSegmentID,
            };
            return finalResponse;
        } else {
            const {
                FinalAudienceCount = 0,
                FinalEmailCount = 0,
                FinalMobileCount = 0,
                FinalMobilepushCount = 0,
                FinalWebpushCount = 0,
                FinalWhatsAppCount = 0,
            } = countData || {};
            const finalResponse = {
                recipientCount: parseInt(FinalAudienceCount, 10),
                recipientCountEmail: parseInt(FinalEmailCount, 10),
                recipientCountMobile: parseInt(FinalMobileCount, 10),
                recipientCountMobilePush: parseInt(FinalMobilepushCount, 10),
                recipientCountVMS: parseInt(FinalMobileCount, 10),
                recipientCountWebPush: parseInt(FinalWebpushCount, 10),
                recipientCountWhatsApp: parseInt(FinalWhatsAppCount, 10),
                recipientsBunchName: '',
                segmentationListId: parseInt(canvasState?.dataSource?.DataList?.join(), 10),
                subSegmentId: payload.SubSegmentID,
            };
            return finalResponse;
        }
    };

    const handleCheckAdhocOrTarget = () => {
        let listType = canvasState?.dataSource?.ListType?.join();
        const isAvailableAdhocListType = [1, 11, 17];
        const isAdhocList = isAvailableAdhocListType?.includes(parseInt(listType, 10));
        return isAdhocList;
    };

    const getSubSegmentSaveHandleKey = () =>
        `${locationCampaignId}:${locationSaveTargetListId}:${locationCurrentTargetNodeId}`;

    const clearSubSegmentSaveQueryParams = () => {
        if (!locationState?.isSubSegementSave) return;
        const cleanedState = { ...locationState };
        SUB_SEGMENT_SAVE_QUERY_KEYS.forEach((key) => {
            delete cleanedState[key];
        });
        navigate(`/communication/mdc-workflow?q=${encodeUrl(cleanedState)}`, { replace: true, state: cleanedState });
    };

    const hasAlreadyHandledSubSegmentSave = () => {
        const handleKey = getSubSegmentSaveHandleKey();
        if (!handleKey || handleKey.includes('null') || handleKey.includes('undefined')) {
            return false;
        }
        return sessionStorage.getItem(MDC_SUB_SEGMENT_SAVE_HANDLED_KEY) === handleKey;
    };

    const markSubSegmentSaveHandled = () => {
        const handleKey = getSubSegmentSaveHandleKey();
        if (handleKey && !handleKey.includes('null') && !handleKey.includes('undefined')) {
            sessionStorage.setItem(MDC_SUB_SEGMENT_SAVE_HANDLED_KEY, handleKey);
        }
        clearSubSegmentSaveQueryParams();
    };

    const handleChannelWiseApiFetch = async (payload) => {
        let channelCountResponse;
        const isAdhocList = handleCheckAdhocOrTarget();
        if (isAdhocList) {
            channelCountResponse = await dispatch(subsegmentAgainstChannelCountAdhocList({ payload }));
            return channelCountResponse;
        } else {
            channelCountResponse = await dispatch(subsegmentAgainstChannelCountTargetList({ payload }));
            return channelCountResponse;
        }
    };

    const handlePlaceholderStateUpdate = async (currentSubSegementList, parentWindowId, countApiResponse, nodeId) => {
        let placeholderObj = _cloneDeep(canvasState?.defaultEle);

        placeholderObj = {
            ...placeholderObj,
            id: nodeId,
            type: 'Placeholder',
            targetPosition: 'left',
            sourcePosition: 'right',
        };
        placeholderObj = {
            ...placeholderObj,
            position: {
                x: currentSubSegementList?.position?.x + 180 || 0,
                y: currentSubSegementList?.position?.y || 0,
            },
            data: {
                ...placeholderObj['data'],
                parentWindowId: parentWindowId,
                currentWindowId: nodeId,
                subSegmentLevel: currentSubSegementList?.data?.subSegmentLevel,
            },
        };

        const activeChannel = canvasState['Campaign']['CanvasChannel']['activeChannel'];
        const placeholder = canvasState['Campaign']['CanvasChannel']?.Placeholder;
        const isAlreadyExistPlaceholder = placeholder?.find(
            (pholder) => pholder?.data?.subSegmentLevel === currentSubSegementList?.data?.subSegmentLevel,
        );

        let extraParams = {
            SubSegmentID: currentSubSegementList?.data?.subSegmentId,
        };
        const countwiseData = handleUpdateFormatCountResponse(countApiResponse, extraParams);
        if (currentSubSegementList) {
            let finalUpdateSegmentList = {
                ...currentSubSegementList,
                channelWiseCount: countwiseData,
                data: {
                    ...currentSubSegementList.data,
                    subSegmentSaveCount: countwiseData?.recipientCount,
                    isExtractionStatus: false,
                },
            };

            dispatchState({
                type: 'UPDATE_SUBSEGMENT_NODE',
                payload: {
                    subSegmentData: finalUpdateSegmentList,
                    addOnEle: {},
                    isAddOn: false,
                    positionList: {},
                },
            });
        }

        if (activeChannel?.length) {
            const currentSubSegmentLevel = currentSubSegementList?.data?.subSegmentLevel;

            const findSubSegmentLevelExistActiveChannel = activeChannel?.find(
                (channel) => channel.subSegmentLevel === currentSubSegmentLevel,
            );

            if (findSubSegmentLevelExistActiveChannel) {
                const updateChannelNodeState = canvasState?.nodeState?.map((nodeState) => {
                    if (
                        nodeState?.data?.subSegmentLevel === currentSubSegmentLevel &&
                        nodeState?.type === 'ChannelItem'
                    ) {
                        return {
                            ...nodeState,
                            data: {
                                ...nodeState.data,
                                audienceCount: getChannelWiseCountInSubSegment(
                                    countwiseData,
                                    nodeState?.data?.channelId,
                                ),
                            },
                        };
                    } else {
                        return nodeState;
                    }
                });

                const updatedActiveChannel = canvasState?.Campaign?.CanvasChannel?.activeChannel?.map((activeChann) => {
                    if (activeChann.subSegmentLevel === currentSubSegmentLevel) {
                        return {
                            ...activeChann,
                            audienceCount: getChannelWiseCountInSubSegment(countwiseData, activeChann?.ChannelId),
                        };
                    } else {
                        return activeChann;
                    }
                });

                dispatchState({
                    type: 'UPDATE_NODESTATE',
                    payload: updateChannelNodeState,
                });
                dispatchState({
                    type: 'UPDATE_CANVAS_ACTIVE_CHANNEL',
                    payload: updatedActiveChannel,
                });
            }

            if (!findSubSegmentLevelExistActiveChannel && !isAlreadyExistPlaceholder && currentSubSegementList) {
                dispatchState({
                    type: 'UPDATE_PLACEHOLDER_NODE',
                    payload: placeholderObj,
                });
            }
        } else {
            if (!isAlreadyExistPlaceholder && currentSubSegementList) {
                dispatchState({
                    type: 'UPDATE_PLACEHOLDER_NODE',
                    payload: placeholderObj,
                });
            }
        }
        placeholderAddRefStatus.current = true;
    };

    const handleSubSegmentPlaceholderUpdate = async () => {
        if (!canvasState || isWorkflowLoading || !locationState?.isSubSegementSave) {
            return;
        }

        if (hasAlreadyHandledSubSegmentSave()) {
            clearSubSegmentSaveQueryParams();
            return;
        }

        if (subSegmentSaveInFlightRef.current) {
            return;
        }

        let cloneCanvasState = _cloneDeep(canvasState);

        let currentSubSegementList = _find(cloneCanvasState?.nodeState, {
            id: locationState?.currentTargetNodeId,
        });

        if (!currentSubSegementList) {
            return;
        }

        subSegmentSaveInFlightRef.current = true;

        try {
            if (locationState?.subsegmentFinalCount) {
                let recipientsName =
                    canvasState?.Campaign?.PotentialRecipients?.Recipients[0]?.recipientsBunchName?.split('(')[0];
                let listId = canvasState?.dataSource?.DataList?.join();
                let listType = canvasState?.dataSource?.ListType?.join();
                let payload = {
                    departmentId,
                    clientId,
                    userId,
                };

                let channelCountResponse;
                const isAdhocList = handleCheckAdhocOrTarget();
                if (!isAdhocList) {
                    payload = {
                        ...payload,
                        SubSegmentID: locationState?.saveTargetListId,
                    };
                    channelCountResponse = await handleChannelWiseApiFetch(payload);
                } else {
                    payload = {
                        ...payload,
                        subSegmentGUID: '',
                        listId: parseInt(listId, 10),
                        listType: parseInt(listType, 10),
                        listName: recipientsName?.trim(),
                        subSegmentId: locationState?.saveTargetListId,
                    };
                    channelCountResponse = await handleChannelWiseApiFetch(payload);
                }

                let channelWiseAudienceCount = {};
                const isCountPending = !channelCountResponse?.status;
                if (channelCountResponse?.status) {
                    const countData = channelCountResponse?.data;
                    channelWiseAudienceCount = handleUpdateFormatCountResponse(countData, payload);
                } else {
                    setCalculateStatusPopup(true);
                }

                currentSubSegementList = {
                    ...currentSubSegementList,
                    data: {
                        ...currentSubSegementList.data,
                        isSubSegmentSave: true,
                        subSegmentSaveCount: parseInt(channelCountResponse?.data?.FinalAudienceCount) || 30,
                        subSegmentId: locationState?.saveTargetListId,
                        isExtractionStatus: isCountPending,
                        subSegmentGUID: locationState?.subSegmentGUID ?? '',
                    },
                    channelWiseCount: channelWiseAudienceCount,
                };

                dispatchState({
                    type: 'UPDATE_SUBSEGMENT_NODE',
                    payload: {
                        subSegmentData: currentSubSegementList,
                        addOnEle: {},
                        isAddOn: false,
                        positionList: {},
                    },
                });

                if (locationState.isSubSegementSave && channelCountResponse?.status) {
                    const [nodeId] = GenerateNodeId(canvasState);
                    if (!placeholderAddRefStatus?.current) {
                        handlePlaceholderStateUpdate(
                            currentSubSegementList,
                            locationState?.currentTargetNodeId,
                            channelCountResponse?.data,
                            nodeId,
                        );
                    }
                }

                markSubSegmentSaveHandled();
            } else {
                setSegmentStatusPopup(true);
                markSubSegmentSaveHandled();
            }
        } finally {
            subSegmentSaveInFlightRef.current = false;
        }
    };

    useEffect(() => {
        if (locationChannelResponseDetailId || locationCampaignId || locationPrimaryGoal) {
            setChannelResponseDetailId((prev) =>
                prev === locationChannelResponseDetailId ? prev : locationChannelResponseDetailId,
            );
            setCampaignId((prev) => (prev === locationCampaignId ? prev : locationCampaignId));
            if (locationPrimaryGoal && canvasState?.CampaignGoal !== locationPrimaryGoal) {
                dispatchState({
                    type: 'UPDATE_CANVASE_STATE',
                    payload: { CampaignGoal: locationPrimaryGoal },
                });
            }
        }
    }, [locationChannelResponseDetailId, locationCampaignId, locationPrimaryGoal]);

    useEffect(() => {
        if (!campaignId) {
            if (!locationCampaignId) {
                setIsWorkflowLoading(false);
            }
            return;
        }

        const isReturningFromSubSegmentTl =
            Boolean(locationState?.isMDCSubSegment) || Boolean(locationState?.currentTargetNodeId);

        if (!locationIsSubSegementSave && isReturningFromSubSegmentTl) {
            const cachedCanvas = consumeMdcCanvasSnapshot(campaignId);
            if (cachedCanvas?.nodeState?.length) {
                if (canvasInitCampaignRef.current !== campaignId) {
                    canvasInitCampaignRef.current = campaignId;
                    const hydratedCanvas = {
                        ...cachedCanvas,
                        CampaignGoal: _get(locationState, 'primaryGoal', cachedCanvas?.CampaignGoal ?? ''),
                        primaryGoalType: locationState?.primaryGoalType ?? cachedCanvas?.primaryGoalType,
                        secondaryGoalType: locationState?.secondaryGoalType ?? cachedCanvas?.secondaryGoalType,
                    };
                    dispatchState({
                        type: 'ASSIGN_CANVAS_DATA',
                        payload: hydratedCanvas,
                    });
                    clearMdcCanvasSnapshot(campaignId);
                }
                setIsWorkflowLoading(false);
                return;
            }
        }

        if (canvasInitCampaignRef.current === campaignId) {
            return;
        }
        canvasInitCampaignRef.current = campaignId;

        let payload = { campaignId, departmentId, clientId, userId };

        setIsWorkflowLoading(true);

        const apiCalls = [dispatch(getMdcCanvasData({ payload }))];

        if (!locationState?.primaryGoalType && !locationState?.secondaryGoalType) {
            apiCalls.push(dispatch(getCampaignById({ payload, loading: false })));
        }

        Promise.all(apiCalls)
            .then((results) => {
                const canvasDataResult = results[0];
                const campaignDataResult = results.length > 1 ? results[1] : null;

                if (canvasDataResult?.status) {
                    const { campaignData } = canvasDataResult.data[0];
                    const canvasJson = JSON.parse(campaignData);

                    let pGoalType = locationState?.primaryGoalType;
                    let sGoalType = locationState?.secondaryGoalType;

                    if (campaignDataResult && campaignDataResult?.status) {
                        pGoalType = campaignDataResult.data?.primaryGoalType || pGoalType;
                        sGoalType = campaignDataResult.data?.secondaryGoalType || sGoalType;
                    }

                    canvasJson['CampaignGoal'] = _get(locationState, 'primaryGoal', '');
                    canvasJson['primaryGoalType'] = pGoalType;
                    canvasJson['secondaryGoalType'] = sGoalType;

                    dispatchState({
                        type: 'ASSIGN_CANVAS_DATA',
                        payload: canvasJson,
                    });
                    clearMdcCanvasSnapshot(campaignId);
                }
            })
            .catch(() => {})
            .finally(() => {
                setIsWorkflowLoading(false);
            });
    }, [campaignId, locationCampaignId, locationIsSubSegementSave, departmentId, clientId, userId]);

    useEffect(() => {
        if (isWorkflowLoading) return;
        handleSubSegmentPlaceholderUpdate();
    }, [
        isWorkflowLoading,
        locationIsSubSegementSave,
        locationCurrentTargetNodeId,
        locationSaveTargetListId,
        locationSubsegmentFinalCount,
        locationSubSegmentGUID,
        canvasState?.nodeState?.length,
    ]);

    useEffect(() => {
        if (campaignId > 0 && clientId && userId) {
            const payload = { campaignId, departmentId, clientId, userId };
            dispatch(getMdcFlowConfig({ payload }));
        }
    }, [departmentId, campaignId, clientId, userId]);

    const showCanvasResetConfirmModal = (isReset) => {
        setShowCanvasResetModal(isReset);
        //dispatchState({type:"CANVAS_RESET",payload:[]})
    };
    const handleCanvasReset = async () => {
        setShowCanvasResetModal(false);
        setIsTemplateCanvasLoading(true);

        try {
            const { channelDeleteList, MDCTemplate } = SourceRemove({ mdcCanvas: canvasState });
            const basePayload = { campaignId, departmentId, clientId, userId };

            if (channelDeleteList?.length) {
                const payload = { ...basePayload, channels: [...channelDeleteList] };
                await dispatch(deletMdcChannels({ payload, loading: false }));
            }

            dispatchState({
                type: 'CHANNEL_DELETE_UPDATE',
                payload: MDCTemplate,
            });

            dispatch(updateSelectedRecipientList([]));

            const saveCanvasPayload = buildCanvasDataSavePayload({ ...basePayload, canvasState: MDCTemplate });
            await dispatch(saveMdcCanvasData({ saveCanvasPayload }));
        } finally {
            setIsTemplateCanvasLoading(false);
        }
    };
    const handleCanvasResetCancel = () => {
        setShowCanvasResetModal(!showCanvasResetModal);
    };
    const handleCanvasFooterCancel = () => {
        dispatch(resetCreateCommunication());
        dispatch(resetMDC());
        navigate('/communication', {
            index: 0,
        });
    };
    const handleCanvasFooterSave = async () => {
        const priorityApiStatus = await handlePriorityApi();
        if (priorityApiStatus?.status) {
            dispatch(resetCreateCommunication());
            dispatch(resetMDC());
            navigate('/communication', {
                index: 0,
            });
        }
    };

    const handlePriorityApi = async () => {
        if (canvasState?.dataSource?.isSubsegmentJoureny) {
            let finalSubSegmentPriority = canvasState?.subSegment?.subSegmentList?.map((segment) => {
                return {
                    subsegmentId: segment.data.subSegmentId,
                    priority: segment.data.priority,
                };
            });

            const payload = {
                userId,
                clientId,
                departmentId,
                campaignId,
                subsegementLists: finalSubSegmentPriority,
            };

            const response = await dispatch(SavePrioritySegments({ payload }));

            return response;
        } else {
            return {
                status: true,
            };
        }
    };

    const handleAfterExactionFlowUpdatePlaceholder = async (callbackCanvasState) => {
        if (callbackCanvasState?.subSegment?.subSegmentList?.length) {
            const availablePlaceholder = callbackCanvasState?.Campaign?.CanvasChannel?.Placeholder;
            const availableFirstLevelActiveChannel = callbackCanvasState?.Campaign?.CanvasChannel?.activeChannel;
            const savedSubSegmentAvaliableList = callbackCanvasState?.subSegment?.subSegmentList?.filter(
                (subsegment) => subsegment?.data?.isSubSegmentSave,
            );

            if (savedSubSegmentAvaliableList?.length) {
                let availableNodeId = [];

                for (const segment of savedSubSegmentAvaliableList) {
                    const segmentLevel = segment?.data?.subSegmentLevel;
                    const isExistPlaceholder = availablePlaceholder?.find(
                        (placeholder) => placeholder?.data?.subSegmentLevel === segmentLevel,
                    );
                    const isActiveChannel = availableFirstLevelActiveChannel?.find(
                        (channel) => channel?.subSegmentLevel === segmentLevel,
                    );

                    if (!isExistPlaceholder && !isActiveChannel) {
                        let recipientsName =
                            callbackCanvasState?.Campaign?.PotentialRecipients?.Recipients[0]?.recipientsBunchName?.split(
                                '(',
                            )[0];
                        let listId = callbackCanvasState?.dataSource?.DataList?.join();
                        let listType = callbackCanvasState?.dataSource?.ListType?.join();

                        let payload = {
                            departmentId,
                            clientId,
                            userId,
                        };

                        let response;

                        const isAdhocList = handleCheckAdhocOrTarget();

                        if (!isAdhocList) {
                            payload = {
                                ...payload,
                                SubSegmentID: segment?.data?.subSegmentId,
                            };
                            response = await handleChannelWiseApiFetch(payload);
                        } else {
                            payload = {
                                ...payload,
                                listId: parseInt(listId, 10),
                                listName: recipientsName?.trim(),
                                listType: parseInt(listType, 10),
                                subSegmentId: segment?.data?.subSegmentId,
                            };
                            response = await handleChannelWiseApiFetch(payload);
                        }

                        if (response?.status) {
                            const [nodeId] = GenerateNodeId(callbackCanvasState);
                            let finalNodeId;

                            if (!availableNodeId.length) {
                                finalNodeId = nodeId;
                                availableNodeId.push(nodeId);
                            } else {
                                const lastNodeId = availableNodeId[availableNodeId.length - 1];
                                const splitLastNodeId = lastNodeId.split('flowchartWindow')[1];
                                const lastId = +splitLastNodeId + 1;
                                finalNodeId = `flowchartWindow${lastId}`;
                                availableNodeId.push(finalNodeId);
                            }

                            await handlePlaceholderStateUpdate(
                                segment,
                                segment?.data?.currentWindowId,
                                response?.data,
                                finalNodeId,
                            );
                        }
                    }
                }
            }
        }
    };

    const otherContextValue = {
        canvasRef,
        lastUpdatedCanvasState,
        isAlign,
        setAlign,
        handlePriorityApi,
        isNewTemplateSaved,
        setIsNewTemplateSaved,
        setOfflineConversionChannelWarningPopup,
        setIsWorkflowNavigating,
        isTemplateCanvasLoading,
        setIsTemplateCanvasLoading,
    };

    const prevCanvasStateData = lastUpdatedCanvasState.current;
    useEffect(() => {
        if (prevCanvasStateData) {
            const prevNodeState = prevCanvasStateData.nodeState ?? [];
            const newNodeState = canvasState.nodeState ?? [];
            const isNodeRemoval = newNodeState.length < prevNodeState.length;
            const isSubSegmentJourney = canvasState?.dataSource?.isSubsegmentJoureny;
            const prevSubSegmentCount = prevCanvasStateData?.subSegment?.subSegmentList?.length ?? 0;
            const newSubSegmentCount = canvasState?.subSegment?.subSegmentList?.length ?? 0;
            const isSubSegmentRemoval =
                isSubSegmentJourney && newSubSegmentCount < prevSubSegmentCount;

            if (JSON.stringify(prevNodeState) !== JSON.stringify(newNodeState)) {
                // Re-align sub-segment journey after delete; preserve layout for other removals.
                if (!isNodeRemoval || isSubSegmentRemoval) {
                    setAlign(true);
                }
                lastUpdatedCanvasState.current = canvasState;
            } else {
                setAlign(false);
            }
        } else if (
            canvasState?.MdcType === 'RecursivelyTraverse' &&
            canvasState?.nodeState?.length > 0 &&
            canvasState.updatedCount > 0
        ) {
            setAlign(true);
            lastUpdatedCanvasState.current = canvasState;
        }
    }, [canvasState.updatedCount]);

    useEffect(() => {
        const timer = setInterval(() => {
            countdownRef.current -= 1;

            if (countdownRef.current <= 0) {
                handleAfterExactionFlowUpdatePlaceholder(canvasState);
                countdownRef.current = 120;
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [canvasState]);

    useEffect(() => {
        if (isWorkflowLoading || !canvasState?.subSegment?.subSegmentList?.length) return;
        handleAfterExactionFlowUpdatePlaceholder(canvasState);
    }, [isWorkflowLoading, canvasState?.nodeState?.length]);

    return (
        <CreateWorkFlowContext.Provider value={canvasVal}>
            <CreateWorkFlowOtherContext.Provider value={otherContextValue}>
                {isWorkflowLoading || isTemplateCanvasLoading ? (
                    createElement(MdcWorkflowSkeleton, { collapse })
                ) : (
                    <div className={'container-fluid mdc-wrapper'}>
                        <CampaignInfoCardMdcCanvas
                            TemplateList={<TemplateList />}
                            PotentialAudienceList={<PotentialAudienceList receipientList={receipientList} />}
                            canvasReset={(val) => showCanvasResetConfirmModal(val)}
                        />
                        <DndProvider debugMode={true} backend={HTML5Backend}>
                            <Row
                                xs={12}
                                className={`mdc-slider-wrapper ${collapse ? 'mdc-pannel-show' : 'mdc-pannel-hide'}`}
                            >
                                <div className={`mdc-left-wrapper w-auto-del position-relative `}>
                                    <div className="box-design css-scrollbar mdc-aside-left p0">
                                        <MdcSidebar collapse={collapse} />
                                    </div>
                                    <div className="expand-icon primary-box-shadow">
                                        <Icon
                                            icon={!collapse ? arrow_right_medium : arrow_left_medium}
                                            tooltip={collapse ? 'Collapse' : 'Expand'}
                                            size="xs"
                                            color="white"
                                            callBack={() => {
                                                setCollapse(!collapse);
                                            }}
                                        />
                                    </div>
                                </div>
                                <Col className="mdc-right-wrapper" id="main-canvas">
                                    <Card className="box-design position-relative p0" style={{ height: '100%' }}>
                                        <Card.Body className="p0" ref={canvasRef}>
                                            <Canvas canvasReference={canvasRef}></Canvas>
                                        </Card.Body>
                                        <div className="rs-mdc-bottom-buttons">
                                            <CanvasFooterButton
                                                canvasReset={(val) => showCanvasResetConfirmModal(val)}
                                                onSave={handleCanvasFooterSave}
                                                onCancel={handleCanvasFooterCancel}
                                            />
                                        </div>
                                        {/* <div className="buttons-holder mb10 mr16 mt0">
                                    <CanvasFooterButton
                                        onCancel={handleCanvasFooterCancel}
                                        onSave={handleCanvasFooterSave}
                                    />
                                </div> */}
                                    </Card>
                                </Col>
                            </Row>
                        </DndProvider>
                    </div>
                )}
                {/* <RSConfirmationModal
                show={showCanvasResetModal}
                text="Canvas will be cleared. Click OK to continue."
                handleConfirm={handleCanvasReset}
                handleClose={handleCanvasResetCancel}
            /> */}
                {showCanvasResetModal && (
                    <ClearCanvasModal
                        show={showCanvasResetModal}
                        handleCanvasResetCancel={handleCanvasResetCancel}
                        handleConfirm={handleCanvasReset}
                    />
                )}
                {segmentStatusPopup && (
                    <CanvasWarning
                        show={segmentStatusPopup}
                        warnText={'To proceed to the next level, the audience count must be greater than zero'}
                        handleClose={() => setSegmentStatusPopup(false)}
                        secondaryButton={false}
                        handleConfirm={() => setSegmentStatusPopup(false)}
                    />
                )}
                {
                    <RSConfirmationModal
                        show={calculateStatusPopup}
                        htmlContent={
                            <div>
                                <Row className="text-center">
                                    <i className={`${circle_time_large} icon-xxl`}></i>
                                    <p className="font-smd mt15">
                                        This may take a few minutes.
                                        <br />
                                        calculating...
                                    </p>
                                </Row>
                            </div>
                        }
                        handleClose={() => {
                            setCalculateStatusPopup(false);
                        }}
                        handleConfirm={() => {
                            setCalculateStatusPopup(false);
                        }}
                    />
                }
                {offlineConversionChannelWarningPopup.show && (
                    <WarningPopup
                        show={offlineConversionChannelWarningPopup.show}
                        text={
                            <Fragment>
                                Offline Conversion is not supported for the selected channel(s). Please change the goal or select a supported channel.
                                {Array.isArray(offlineConversionChannelWarningPopup.incompatibleChannelLabels) && offlineConversionChannelWarningPopup.incompatibleChannelLabels.length > 0 && (
                                    <>
                                        <br />
                                        <br />
                                        <span className="text-bold">Not applicable with Offline Conversion: </span>
                                        <span className="text-bold color-primary-red">
                                            {offlineConversionChannelWarningPopup.incompatibleChannelLabels.join(', ')}
                                        </span>
                                    </>
                                )}
                            </Fragment>
                        }
                        handleClose={() =>
                            setOfflineConversionChannelWarningPopup({ show: false, incompatibleChannelLabels: [] })
                        }
                    />
                )}
            </CreateWorkFlowOtherContext.Provider>
        </CreateWorkFlowContext.Provider>
    );
};
export default memo(WorkFlow);
