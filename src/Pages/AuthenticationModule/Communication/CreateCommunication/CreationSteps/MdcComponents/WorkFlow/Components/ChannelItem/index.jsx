import { getMdcGlyph } from '../../constant';
import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { getDateWithDayfullFormat } from 'Utils/modules/dateTime';
import { encodeUrl } from 'Utils/modules/crypto';
import { MAX_LENGTH200 } from 'Constants/GlobalConstant/Regex';
import { CANCEL, FRIENDLY_NAME_WARNING, MAX_CONNECTIONS_EXCEEDS, OK, PROCEED, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, memo, useContext, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useNavigate } from 'react-router-dom';
import { Handle, Position, Panel, useReactFlow } from 'reactflow';
import { useSelector, useDispatch } from 'react-redux';

import { Row, Col } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import { KendoIconDropdown } from 'Components/RSDropDown';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import ChannelFriendlyNameEdit from '../ChannelFriendlyNameEdit';
import DeleteChannel from './DeleteChannel';
import ChannelContentPopup from './ChannelContentPopup';

import { cloneDeep as _cloneDeep, get as _get, find as _find } from 'Utils/modules/lodashReplacements';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    getMdcChannelResponseData,
    saveMdcCanvasData,
    saveChannelFriendlyName,
    addOrRemoveAttr,
    deletMdcChannels,
    subsegmentDisableChannels,
    subsegmentEnableChannels,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { setMdcContentPopupStatus } from 'Reducers/communication/createCommunication/Mdc/Canvas/reducer';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';

import Icon from 'Components/Icon/Icon';
import splitAbIcon from 'Assets/Images/svg/rs-icon-ab-testing-large.svg';

import CreateWorkFlowContext from '../../context';
import { ItemTypes } from '../MdcSidebar/ItemTypes';
import { getModule, sourceAndChannelList } from '../../constant';

import {
    findChannelDepth,
    GetChannelChild,
    GetActionLists,
    UpdateScheduleDateForTemplateActiveChannel,
    ChannelRemove,
} from './ChannelConst';

import { GetChannelStyleAttributes, GenerateNodeIdForAddon, GenerateNodePositionForAddon, GetChannelContentSetupDetails, GetChannelContentSetupDetailsPlumbJsFlow, buildCanvasDataSavePayload } from '../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import ChannelAction from '../ChannelAction';
import { updateMDCEditMode } from 'Reducers/communication/createCommunication/Create/reducer';
import { getCustomizedReceipientList } from '../PotentialAudience/PotentialConst';
import { CanvasCollapseExpand } from '../Canvas/CanvasConst';
import RSInput from 'Components/FormFields/RSInput';
import { useForm } from 'react-hook-form';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

export default memo(({ data, isConnectable }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dropDownRef = useRef(null);
    const justOpenedRef = useRef(false);
    const locationState = useQueryParams('/communication');
    const [show, setShow] = useState(false);
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [isCollapse, setCollapse] = useState(false);
    const { setNodes } = useReactFlow();
    const { control, handleSubmit, clearErrors, reset, setError, formState,watch } = useForm({
        mode: 'onTouched',
    });
    const friendlyNameLength = watch('friendlyName')?.length || 0;
    const friendlyNameSaveLoader = useApiLoader({ autoFetch: false });
    const channelPreviewLoader = useApiLoader({ autoFetch: false });
    const channelResponseRequestKeyRef = useRef(null);
    const [isFriendlyNameSavePending, setIsFriendlyNameSavePending] = useState(false);
    const isFriendlyNameSaving = isFriendlyNameSavePending || friendlyNameSaveLoader.isFetching;
    const [isBottomOneHandel, setBottomOneHandle] = useState(false);
    const [contentSettingJson, setContentSettingJson] = useState({});
    const [isFollowupChannelEnable, setFollowupChannelEnablement] = useState(false);
    const [isRemove, setChannelRemove] = useState(false);
    const [isRootExceed, setRootExceed] = useState(false);
    const [splitAb, setSplitAb] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [isPreviewClick, setIsPreviewClick] = useState(false);
    const [isChildChannelExist, setChildChannelExist] = useState(false);
    const [isContentSetupComplet, setContentSetupComplete] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [actionList, setActionList] = useState([
        { id: 'create', value: data?.channelId === 'ch0034' ? 'Configure' : 'Create content' },
        { id: 'preview', value: 'Preview' },
        { id: 'action', value: 'Actions' },
        { id: 'delete', value: 'Delete' },
    ]);
    const [friendlyNamePopupShow, setFriendlyNamePopupShow] = useState({
        show: false,
        selectItem: {},
    });

    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { defaultEle, nodeState, edgeState, defaultActionEle, disableNodeList = [] } = canvasState;
    const { savedChannelStatusId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);

    const activeChannel = _get(canvasState, 'Campaign.CanvasChannel.activeChannel', []);
    const isActiveParentChannel = activeChannel?.find((active) => active.DomId === data.currentWindowId);
    let isDisabled = disableNodeList?.includes(data.currentWindowId);
    const currentChannelValue = getModule(activeChannel, data.currentWindowId);
    const isPanelToolbar =
        canvasState?.dataSource?.isSubsegmentJoureny && isDisabled && currentChannelValue
            ? handleParent(currentChannelValue?.context)
            : disableNodeList?.includes(currentChannelValue?.parent?.DomId) && !isActiveParentChannel
            ? false
            : true;

    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    let { isContentPopupActive, mdcFlowConfig, selectedRecipientList } = useSelector(
        ({ mdcCanvasFlowReducer }) => mdcCanvasFlowReducer ?? {},
    );
    const { smartLink1 } = useSelector((state) => getGeneratedLink(state));
        const withoutGoal = 10;
    const contentMode = _get(locationState, 'mode', 'create');
    const campaignId = _get(locationState, 'campaignId');
    const channelDetailId = _get(locationState, 'channelResponseDetailId', 0);
    const channelType = _get(locationState, 'mdcContentSetupDetails.channelDetailType', '');
    const contentSetupDomId = _get(locationState, 'mdcContentSetupDetails.domId', '');
    const currenLevelNumber = _get(locationState, 'mdcContentSetupDetails.levelNumber', '');
    const authoringUrl = `/communication/create-mdc-communication`;

    let depth = findChannelDepth(canvasState, data.currentWindowId);
    const adjustActionsForChannel = (list) => {
        if (data?.channelId === 'ch0034') {
            return list?.map((action) => (action?.id === 'create' ? { ...action, value: 'Configure' } : action));
        }
        return list;
    };

    useEffect(() => {
        let arg = { tempState: canvasState, data, mdcFlowConfig };
        const { actionList } = GetActionLists(arg);
        setActionList(adjustActionsForChannel(actionList));
    }, []);
    useEffect(() => {
        setSplitAb(data?.isSplitAb);
    }, [data?.isSplitAb]);
    const applyChannelResponseResult = (result) => {
        const { status, data: channelResponseData } = result || {};
        if (!status) return false;

        const ContentThumbnailPath = _get(channelResponseData[0], 'contentThumbnail', '');
        const ScheduleDate = _get(channelResponseData[0], 'localBlastDateTime', '');
        const ChannelId = _get(channelResponseData[0], 'channelId', 0);
        const DomId = _get(channelResponseData[0], 'domId', 0);
        const ClientName = _get(channelResponseData[0], 'clientName', '');
        const AccountLogo = _get(channelResponseData[0], 'logoPath', '');
        const WaMediaContent = _get(channelResponseData[0], 'waMediaContent', {});
        const senderName = _get(channelResponseData[0], 'senderName', '');
        const subjectLine = _get(channelResponseData[0], 'subjectLine', '');
        const isCarousel = _get(channelResponseData[0], 'isCarousel', 0);
        const carouselJSON = _get(channelResponseData[0], 'carouselJSON', '');
        const footer = _get(channelResponseData[0], 'footer', '');
        const header = _get(channelResponseData[0], 'header', '');
        const contentJsonRaw =
            _get(channelResponseData[0], 'contentjson', '') || _get(channelResponseData[0], 'contentjSON', '');
        const contentJson =
            typeof contentJsonRaw === 'string' ? contentJsonRaw : contentJsonRaw != null ? JSON.stringify(contentJsonRaw) : '';

        let module = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        const { ChannelDetailID, ChannelDetailType } = module['value'];

        let tmpContentJson = {
            ChannelId,
            ContentThumbnailPath,
            DomId,
            ScheduleDate,
            ChannelDetailID: isPreviewClick ? ChannelDetailID : parseInt(channelDetailId, 10),
            senderName,
            subjectLine,
            content: channelResponseData?.[0]?.content ?? [],
        };
        if (ChannelId == 'ch0021') {
            tmpContentJson = {
                ...tmpContentJson,
                ClientName,
                AccountLogo,
                WaMediaContent,
                isCarousel,
                carouselJSON,
                footer,
                header,
                contentJson,
            };
        }
        if (ChannelId == 'ch0041') {
            let rcsContentJson = _get(channelResponseData[0], 'contentJson', '') || _get(channelResponseData[0], 'contentJSON', '');
            let rcsCarouselJSON = _get(channelResponseData[0], 'carouselJSON', '');
            if (typeof rcsContentJson !== 'string' && rcsContentJson != null) rcsContentJson = JSON.stringify(rcsContentJson);
            if (typeof rcsCarouselJSON !== 'string' && rcsCarouselJSON != null) rcsCarouselJSON = JSON.stringify(rcsCarouselJSON);
            tmpContentJson = {
                ...tmpContentJson,
                ClientName,
                AccountLogo,
                WaMediaContent,
                contentJson: rcsContentJson || '',
                carouselJSON: rcsCarouselJSON || '',
                isCarousel: !!rcsCarouselJSON,
            };
        }
        if (ChannelId == 'ch003') {
            tmpContentJson = {
                ...tmpContentJson,
                DomId: locationState['mdcContentSetupDetails']['domId'],
                levelNumber: locationState['mdcContentSetupDetails']['levelNumber'],
                parentChannelDetailId: locationState['mdcContentSetupDetails']['parentChannelDetailId'],
                parentChannelDetailType: locationState['mdcContentSetupDetails']['parentChannelDetailType'],
            };
            channelResponseData[0]['domId'] = locationState['mdcContentSetupDetails']['domId'];
            channelResponseData[0]['levelNumber'] = locationState['mdcContentSetupDetails']['levelNumber'];
            channelResponseData[0]['parentChannelDetailId'] = locationState['mdcContentSetupDetails']['parentChannelDetailId'];
            channelResponseData[0]['parentChannelDetailType'] = locationState['mdcContentSetupDetails']['parentChannelDetailType'];
        }
        if (ChannelId == 'ch0021') {
            channelResponseData[0]['displayPreviewContent'] = tmpContentJson;
        }
        setContentSettingJson(tmpContentJson);
        setPopupMode('edit');
        const rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        const currentChannel = rslt?.value;
        if (
            DomId === currentChannel?.DomId &&
            currentChannel?.activeChannel?.length &&
            currentChannel?.LevelNumber === 1 &&
            !ScheduleDate
        ) {
            handleRemoveChannel(DomId);
        }
        const isActionExist = _get(rslt, 'value.Action.Template', false);
        setFollowupChannelEnablement(!isActionExist);

        dispatchState({
            type: 'UPDATE_CHANNEL_RESPONSE_DATA',
            payload: { channelResponseData, locationState },
        });
        dispatch(setMdcContentPopupStatus(true));
        return true;
    };

    useEffect(() => {
        const shouldFetchFromAuthoring =
            !isContentPopupActive && channelDetailId && data.currentWindowId === contentSetupDomId;
        const shouldFetchDynamic = show && canvasState.dataSource.ElementType === 'DynamicItem';

        if (shouldFetchFromAuthoring || shouldFetchDynamic) {
            const requestKey = shouldFetchFromAuthoring
                ? `authoring:${channelDetailId}:${contentSetupDomId}:${data.nodeId}`
                : `dynamic:${data.nodeId}:${show}`;

            if (channelResponseRequestKeyRef.current !== requestKey && !channelPreviewLoader.isFetching) {
                channelResponseRequestKeyRef.current = requestKey;

                const module = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
                const { ChannelDetailID, ChannelDetailType, levelNumber } = module['value'];
                const payload = {
                    campaignId,
                    departmentId,
                    clientId,
                    userId,
                    channelDetailId: isPreviewClick ? ChannelDetailID : parseInt(channelDetailId, 10),
                    channelType: isPreviewClick ? ChannelDetailType : channelType,
                    levelNumber: (currenLevelNumber || levelNumber) ?? 1,
                };

                dispatch(setMdcContentPopupStatus(true));
                setShow(true);

                channelPreviewLoader.refetch({
                    fetcher: async () => {
                        const result = await dispatch(getMdcChannelResponseData({ payload }));
                        applyChannelResponseResult(result);
                        return result;
                    },
                });
            }
        }

        /* Attribute setup dynamiclist update start */
        if (
            _get(locationState, 'dynamicListDetails', null) &&
            _get(locationState, 'dynamicListDetails.dynamicListId', 0) &&
            sessionStorage.getItem('attributeSetupDetails')
        ) {
            const { nodeId, channelId, dynamicListId, actionId } = _get(locationState, 'dynamicListDetails', {});
            let attributeSetupDetails = JSON.parse(sessionStorage.getItem('attributeSetupDetails'));

            if (
                nodeId == data.nodeId &&
                channelId === data.channelId &&
                attributeSetupDetails?.channelId === channelId &&
                attributeSetupDetails?.nodeId === nodeId
            ) {
                let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], nodeId);
                let activeChannel = _get(rslt, 'value.activeChannel', []);
                let findOption = _find(activeChannel, ['actionOption.value', actionId]);
                const {
                    ChannelDetailID: channelDetailId,
                    ChannelDetailType: channelDetailType,
                    ScheduleDate,
                } = findOption;
                                if (channelDetailId && channelDetailType && ScheduleDate) {
                    let payload = {
                        campaignId,
                        channels: [
                            {
                                channelDetailId,
                                channelDetailType,
                                dynamicListId,
                                dlattraction: 'add',
                            },
                        ],
                    };
                    dispatch(addOrRemoveAttr({ payload }));
                }
                dispatchState({
                    type: 'UPDATE_ATTR_SETUP_DATA',
                    payload: { nodeId, channelId, dynamicListId, actionId },
                });
                setContentSetupComplete(true);
                sessionStorage.removeItem('attributeSetupDetails');
            }
        }
        /* Attribute setup dynamiclist update end */
    }, [locationState, show]);

    useEffect(() => {
        let primaryGoal = _get(locationState, 'primaryGoal', '');
        setPrimaryGoal(primaryGoal);
    }, [locationState]);

    useEffect(() => {
        let rslt = GetChannelChild(data.nodeId, canvasState);
        setChildChannelExist(rslt);

        /* template flow action list update */
        let arg = { tempState: canvasState, data, mdcFlowConfig };
        const { actionList } = GetActionLists(arg);
        setActionList(adjustActionsForChannel(actionList));
        /* template flow action list update */
    }, [canvasState]);

    useEffect(() => {
        const isSubSegmentJourney = canvasState?.dataSource?.isSubsegmentJoureny;
        if (!isSubSegmentJourney) return;

        if (isSubSegmentJourney) {
            const baseActions = [...actionList];
            const actionDisable = { id: 'disable', value: 'Disable', disabled: false };
            const actionEnable = { id: 'enable', value: 'Enable', disabled: false };
            const actionDelete = { id: 'delete', value: 'Delete', disabled: false };
            let updatedActions = [...baseActions];

            // Handle delete button
            updatedActions = updatedActions.filter((action) => action.id !== 'delete');
            updatedActions.push({ ...actionDelete, disabled: !!isDisabled });

            const arg = { tempState: canvasState, data, mdcFlowConfig };
            const actionListAfterUpdate = GetActionLists(arg);

            let mergedActions = updatedActions.map((action) => {
                const match = actionListAfterUpdate?.actionList?.find((a) => a.id === action.id);
                return match ? { ...action, ...match } : action;
            });

            const hasEditInUpdate = actionListAfterUpdate?.actionList?.some((a) => a.id === 'edit');
            const hasEditContent = actionListAfterUpdate?.actionList?.some((a) => a.value === 'Edit content');

            // If "edit" is present in updated list
            if (hasEditInUpdate) {
                // Remove "create" action
                mergedActions = mergedActions.filter((action) => action.id !== 'create');

                // Add "edit" only if "Edit content" is present in the new list
                if (hasEditContent && !mergedActions.some((action) => action.id === 'edit')) {
                    const editAction = actionListAfterUpdate.actionList.find((a) => a.id === 'edit');
                    mergedActions.push(editAction);
                }

                // Replace disable/enable
                mergedActions = mergedActions.filter((action) => action.id !== 'disable' && action.id !== 'enable');
                mergedActions.push({
                    id: isDisabled ? 'enable' : 'disable',
                    value: isDisabled ? 'Enable' : 'Disable',
                    disabled: false,
                });

                // Disable all actions if currently disabled
                if (isDisabled) {
                    mergedActions = mergedActions.map((action) =>
                        action.id === 'enable' ? action : { ...action, disabled: true },
                    );
                } else {
                    mergedActions = mergedActions.map((action) => ({ ...action, disabled: false }));
                }
                // Add Disable based on edit campaign  and schedule status only
                const isChannelScheduleStatus = currentChannelValue?.value?.ChannelDetailID
                    ? savedChannelStatusId?.find(
                          (savedChannel) =>
                              parseInt(savedChannel?.channelDetailId, 10) ===
                                  parseInt(currentChannelValue?.value?.ChannelDetailID, 10) &&
                              parseInt(savedChannel?.statusId, 10) === 7,
                      )
                    : false;
                const hasDisable = mergedActions.some((action) => action.id === 'disable');
                if (
                    currentChannelValue?.value?.ScheduleDate &&
                   new Date(currentChannelValue?.value?.ScheduleDate) >= new Date()
                ) {
                    !hasDisable && mergedActions.push(actionDisable);
                } else {
                    mergedActions = mergedActions.filter((action) => action.id !== 'disable');
                }
            }

            setActionList(adjustActionsForChannel(mergedActions));
        }
    }, [canvasState, isDisabled, JSON.stringify(actionList)]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
                setIsOpen(false);
                justOpenedRef.current = false;
            }
        };

        const handleDropdownOpen = (event) => {
            const { nodeId } = event.detail || {};
            if (nodeId !== data.nodeId && isOpen && !justOpenedRef.current) {
                setIsOpen(false);
            }
            if (nodeId === data.nodeId) {
                justOpenedRef.current = false;
            }
        };

        if (isOpen) {
            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside, true);
            }, 0);
            
            const frameId = requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const event = new CustomEvent('mdc-dropdown-open', {
                        detail: { nodeId: data.nodeId, type: 'ChannelItem' }
                    });
                    document.dispatchEvent(event);
                });
            });
            
            return () => {
                clearTimeout(timeoutId);
                cancelAnimationFrame(frameId);
                document.removeEventListener('click', handleClickOutside, true);
            };
        }
        
        document.addEventListener('mdc-dropdown-open', handleDropdownOpen);
        
        return () => {
            document.removeEventListener('mdc-dropdown-open', handleDropdownOpen);
        };
    }, [isOpen, data.nodeId]);
    const handleActionForwardOnclick = (event) => {
        //console.log("parentNodeList",getParentNodes(data.nodeId,nodeState,edgeState))
        let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        const { ContentThumbnailPath, ScheduleDate } = rslt['value'];
        const scheduleDate = getDateWithDayfullFormat(ScheduleDate);
        // setContentThumbnail(ContentThumbnailPath);
        // setContentScheduleDate(scheduleDate);
        // Preserve existing contentSettingJson data and merge with new data
        setContentSettingJson((prevContentJson) => ({
            ...prevContentJson,
            ...rslt['value'],
            JsonType: canvasState?.MdcType,
            ...rslt['value'].displayPreviewContent
        }));
        
        setPopupMode('edit');
                const isActionExist = _get(rslt, 'value.Action.Template', false);
                setFollowupChannelEnablement(!isActionExist);
        setIsPreviewClick(true);
        setShow(true);
    };
    const handleClose = () => {
        setShow(false);
    };

    const handleCurrentChannelAudienceCount = () => {
        const currentChannelName = sourceAndChannelList?.channelList?.find(
            (channel) => channel.id === data?.channelId,
        )?.label;
        return (
            getCustomizedReceipientList({ receipientList: selectedRecipientList })?.customizedList?.find(
                (list) => list.channelName === currentChannelName,
            )?.count ?? 0
        );
    };

    const handleSegmentId = () => {
        const findSubSegmentList = canvasState?.subSegment?.subSegmentList?.find(
            (segment) => segment.data.subSegmentLevel === data.subSegmentLevel,
        );

        return {
            subSegmentId: findSubSegmentList?.data?.subSegmentId ?? 0,
            priority: findSubSegmentList?.data?.priority ?? 0,
        };
    };

    const handleCreateChannelContent = () => {
        if (!smartLink1) dispatch(showTabsSmartlink(false)); // smartlink purpose authoring page
        document.body.classList.remove('mdc-body');

        channelResponseRequestKeyRef.current = null;
        dispatch(setMdcContentPopupStatus(false));
        setShow(false);
        let contentSetupDetails = GetChannelContentSetupDetails(
            data.channelId,
            data.nodeId,
            canvasState,
            data.subSegmentLevel,
        );
        const updateLocationState = {
            ...locationState,
            timeZoneId: contentSetupDetails?.timezoneId ?? 0,
            isExistChildActiveChannel: false,
            potentialAudience: handleCurrentChannelAudienceCount() || 0,
            selectedSegementIds: contentSetupDetails?.audience?.map((x) => x?.segmentationListId),
            audience: contentSetupDetails?.audience || [] 
        };
        
        // Get isCGTGEnabled from canvas state dataSource
        const isCGTGEnabledValue = canvasState?.dataSource?.isCGTGEnabled ?? false;
        contentSetupDetails = {
            ...contentSetupDetails,
            ...(canvasState?.dataSource?.isSubsegmentJoureny && {
                subSegmentLevel: data.subSegmentLevel,
            }),
            ...handleSegmentId(),
            isGroupCommunication: canvasState?.dataSource?.isGroupCommunication ?? false,
            isSubsegmentJoureny: canvasState?.dataSource?.isSubsegmentJoureny ?? false,
            isCGTGEnabled: isCGTGEnabledValue
        };
        const state = { ...updateLocationState, mdcContentSetupDetails: contentSetupDetails, mode: 'create'};
        const encryptState = encodeUrl(state);
        dispatch(updateMDCEditMode('create'));
        navigate(`${authoringUrl}?q=${encryptState}`, {
            state,
        });
    };

    const handleChannelEditRedirect = () => {
        if (!smartLink1) dispatch(showTabsSmartlink(false)); // smartlink purpose authoring page
        document.body.classList.remove('mdc-body');
        channelResponseRequestKeyRef.current = null;
        dispatch(updateMDCEditMode('edit'));
        dispatch(setMdcContentPopupStatus(false));
        setShow(false);
        let contentSetupDetails =
            canvasState?.MdcType === 'RecursivelyTraverse_React'
                ? GetChannelContentSetupDetails(data.channelId, data.nodeId, canvasState, data.subSegmentLevel)
                : GetChannelContentSetupDetailsPlumbJsFlow(
                      data.channelId,
                      data.nodeId,
                      canvasState,
                      data.subSegmentLevel,
                  );
        const updateLocationState = {
            ...locationState,
            timeZoneId: contentSetupDetails?.timezoneId ?? 0,
            isExistChildActiveChannel: contentSetupDetails?.isExistChildActiveChannel ?? false,
            potentialAudience: handleCurrentChannelAudienceCount() || 0,
            selectedSegementIds: contentSetupDetails?.audience?.map((x) => x?.segmentationListId),
            audience: contentSetupDetails?.audience || [] 
        };

        // Get isCGTGEnabled from canvas state dataSource
        const isCGTGEnabledValue = canvasState?.dataSource?.isCGTGEnabled ?? false;
        
        contentSetupDetails = {
            ...contentSetupDetails,
            ...(canvasState?.dataSource?.isSubsegmentJoureny && {
                subSegmentLevel: data.subSegmentLevel,
            }),
            ...handleSegmentId(),
            isGroupCommunication: canvasState?.dataSource?.isGroupCommunication ?? false,
            isSubsegmentJoureny: canvasState?.dataSource?.isSubsegmentJoureny ?? false,
            isCGTGEnabled: isCGTGEnabledValue
        };

        const state = { ...updateLocationState, mdcContentSetupDetails: contentSetupDetails, mode: 'edit' };
        const encryptState = encodeUrl(state);
        navigate(`${authoringUrl}?q=${encryptState}`, {
            state,
        });
    };
    const handleSaveChannelContent = () => {
        locationState.mode = 'create';
        let arg = { tempState: canvasState, data, mdcFlowConfig };
        const { actionList, rootExceed } = GetActionLists(arg);
        setShow(false);
        setActionList(adjustActionsForChannel(actionList));
        let getLevelDetails = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        
        if (channelDetailId > 1) {
            if (
                primaryGoal.toLowerCase() === 'conversion' &&
                (getLevelDetails?.['parent']['ChannelDetailType'] === 'LP1' ||
                    getLevelDetails?.['parent']['ChannelDetailType'] === 'LP2') &&
                getLevelDetails?.value?.actionOption?.value === 22
            ) {
                setBottomOneHandle(true);
                data.updateEdge(getLevelDetails);
            }

            //Template canvas update schedule date for child channels/activeChannel
            if (canvasState['MdcType'] === 'RecursivelyTraverse_React_Template') {
                let resultState = UpdateScheduleDateForTemplateActiveChannel(canvasState, data.nodeId);
                dispatchState({
                    type: 'ASSIGN_CANVAS_DATA',
                    payload: { ...resultState },
                });
            }
            setRootExceed(rootExceed);
        }
    };

    const handleUpdateFriendlyName = async (name) => {
                let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
        const { ChannelDetailID, ChannelDetailType } = rslt['value'];
        if (name) {
            let payload = {
                userId,
                departmentId,
                clientId,
                campaignId,
                channelDetailId: ChannelDetailID,
                friendlyName: name,
                channelType: ChannelDetailType,
            };
            await dispatch(saveChannelFriendlyName({ payload, loading: false }));
        }
        rslt['value']['ChannelFriendlyName'] = name;
        rslt['value']['isFriendlyNameUpdate'] = true;
                let saveCanvasPayload = buildCanvasDataSavePayload({
            userId,
            departmentId,
            clientId,
            campaignId,
            canvasState,
        });
        await dispatch(saveMdcCanvasData({ saveCanvasPayload }));
        dispatchState({ type: 'CHANNEL_FRIENDLYNAME_UPDATE', payload: [] });
    };
    /*Channel addon drop start*/

    const toggleRemoveIcon = (event) => {
                setChannelRemove(!isRemove);
    };

    const handleCanvasRootExceedWarning = () => {
        setRootExceed(false);
    };
    const handleChannelDeleteUpdate = (canvasJson) => {
        dispatchState({
            type: 'CHANNEL_DELETE_UPDATE',
            payload: canvasJson,
        });
    };
    const resetDelete = () => {
        setChannelRemove(false);
    };
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.Source,
        drop: (item, monitor) => {
                        
            if (
                (monitor.getItem() && monitor.getItem()?.listType === data.channelId) ||
                (monitor.getItem() && monitor.getItem()?.listType !== data.channelId && data?.isAllOrAny) ||
                depth < 2
            ) {
                return undefined;
            }

            const nodeId = GenerateNodeIdForAddon(canvasState, 'sub');
            let existingChannelNodeId = data.nodeId;
            let currentChannel = nodeState.filter((nodeItem) => nodeItem.id === existingChannelNodeId)[0];
                        let positionList = GenerateNodePositionForAddon(currentChannel);
            const { addonElePosition, existingChannelPosition, newChannelPosition } = positionList;

            /* Addon element object start */

            let addOnEle = _cloneDeep(defaultEle);
            addOnEle.id = nodeId[0];
            addOnEle.type = 'AddonItem';
            addOnEle.className = 'addon-item-dropped';
            addOnEle.position = addonElePosition;
            addOnEle.sourcePosition = ['top', 'bottom'];
            //addOnEle.sourcePosition = 'right';
            // addOnEle.targetPosition = 'left';
            let addOnEletempData = {
                action: true,
                channelBgClassName: item.bgClassName,
                parentWindowId: currentChannel.data.parentWindowId,
                currentWindowId: nodeId[0],
                nodeId: nodeId[0],
                SelectionMode: 'All',
                edgeEndLabel: currentChannel.data.edgeEndLabel,
            };
            addOnEle.data = { ...addOnEletempData };
            /* Addon element object end */

            /* Addon channel object start */
            let addOnChannel = _cloneDeep(defaultEle);
            addOnChannel.id = nodeId[1];
            addOnChannel.type = 'ChannelItem';
            addOnChannel.className = 'channel-item-dropped';
            addOnChannel.position = newChannelPosition;
            addOnChannel.sourcePosition = 'right';
            addOnChannel.targetPosition = 'left';
            let tempData = {
                channelId: item.listType,
                channelIcon: item.icon,
                channelBgClassName: item.bgClassName,
                channelFriendlyName: item.friendlyName,
                sourceHandle: 'A2',
                parentWindowId: nodeId[0],
                currentWindowId: nodeId[1],
                isAllOrAny: true,
                nodeId: nodeId[1],
                ...(canvasState?.dataSource?.isSubsegmentJoureny && {
                    isNestedLevelActiveChannel: true,
                    subSegmentLevel: currentChannel?.data?.subSegmentLevel,
                }),
            };
            addOnChannel.data = { ...tempData };
            /* Addon channel end */

            /* Current channel object update start */
            currentChannel.position = existingChannelPosition;
            currentChannel.data.parentWindowId = nodeId[0];
            currentChannel.data.sourceHandle = 'A1';
            currentChannel.data.isAllOrAny = true;
            delete currentChannel.data.action;
            /* Current channel object update end */
            dispatchState({
                type: 'CREATE_ADDON_CHANNEL',
                payload: { exChannel: currentChannel, addOnChannel, addOnEle },
            });
        },
        collect: (monitor) => ({
            isOver: (() => {
                                return monitor.isOver();
            })(),
            canDrop: (() => {
                let isAllow = false;
                                                if (
                    monitor.getItem() &&
                    monitor.getItem()?.listType !== data.channelId &&
                    !data?.isAllOrAny &&
                    depth > 1
                ) {
                    isAllow = true;
                }
                return isAllow;
            })(),
        }),
    }));
    const isActive = canDrop && isOver;
    const border = selectBorderStyle(isActive, canDrop);
    /*Channel addon drop end */

    const RenderChannelAction = (element) => {
        const { item } = element;
        return <div>{item.value}</div>;
    };

    const RenderSplitAb = ({ list: { item } }) => {
        return (
            <div className={`abSplitContent`}>
                {item.splitA}/{item.splitB}
            </div>
        );
    };

    const handleRemoveChannel = async (nodeId) => {
        const basePayload = { userId, clientId, departmentId, campaignId };
        let preserveParent = true;
        const { channelDeleteList, MDCTemplate } = ChannelRemove({ nodeId, mdcCanvas: canvasState }, preserveParent);

        if (channelDeleteList?.length) {
            const payload = { ...basePayload, channels: [...channelDeleteList] };
            const response = await dispatch(deletMdcChannels({ payload }));
            handleChannelDeleteUpdate(MDCTemplate);
        } else {
            handleChannelDeleteUpdate(MDCTemplate);
        }

        let saveCanvasPayload = buildCanvasDataSavePayload({ ...basePayload, canvasState: MDCTemplate });
        await dispatch(saveMdcCanvasData({ saveCanvasPayload }));
        // handleReducerUpdateCanvasState(saveCanvasPayload?.campaignData, dispatch);
    };

    function handleParent(context) {
        const { parent } = context;
        if (!parent) {
            return;
        }
        const depth = parent.depth;
        if (Array.isArray(currentChannelValue.parent)) {
            const currentSegmentLevel = currentChannelValue.value?.subSegmentLevel;
            const sugSegList = canvasState?.subSegment?.subSegmentList ?? [];
            const foundParent = sugSegList?.find((x) => x?.data?.subSegmentLevel === currentSegmentLevel);
            if (foundParent) {
                if (disableNodeList.includes(foundParent?.id)) {
                    return false;
                } else {
                    return true;
                }
            }
        } else if (typeof currentChannelValue?.parent === 'object' && currentChannelValue?.parent !== null) {
            if (disableNodeList.includes(currentChannelValue?.parent?.DomId)) {
                return false;
            } else {
                return true;
            }
        } else {
                    }
    }

    const handleDisableChannel = async (isDisable, nodeId, canvasState) => {
        let { nodeState } = canvasState;
        let affectedNodes = CanvasCollapseExpand(nodeId, canvasState).filter(Boolean);

        let currentDisableNodeList;

        if (!isDisable) {
            currentDisableNodeList = disableNodeList.filter((id) => ![nodeId, ...affectedNodes].includes(id));
        } else {
            affectedNodes = [...disableNodeList, nodeId, ...affectedNodes];
            currentDisableNodeList = affectedNodes;
        }

        const updatedNodes = nodeState.map((node) => ({
            ...node,
            data: {
                ...node.data,
                disabled: currentDisableNodeList.includes(node.id),
            },
        }));

        const { MDCTemplate, channelDeleteList } = ChannelRemove({
            mdcCanvas: canvasState,
            nodeId: data.currentWindowId,
        });

        const finalDeleteChannelList = Array.from(new Set(channelDeleteList.map(JSON.stringify))).map(JSON.parse);

        const handleDisableOrEnableApi = async (payload, isDisable) => {
            let response;
            if (isDisable) {
                response = await dispatch(subsegmentDisableChannels({ payload }));
            } else {
                response = await dispatch(subsegmentEnableChannels({ payload }));
            }
            return response;
        };

        const payload = {
            userId,
            clientId,
            departmentId,
            campaignId: locationState?.campaignId,
            subsegmentId: 0,
            channels: finalDeleteChannelList,
        };

        const disableOrEnableApiStatus = await handleDisableOrEnableApi(payload, isDisable);

        if (disableOrEnableApiStatus?.status) {
            setNodes(updatedNodes);
            dispatchState({
                type: 'UPDATE_DISABLE_NODE_LIST',
                payload: currentDisableNodeList,
            });
            dispatchState({
                type: 'UPDATE_NODESTATE',
                payload: updatedNodes,
            });
        }
    };

    let currentActiveChannel = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
    const getFriendlyName = () => {
                if (currentActiveChannel?.value?.LevelNumber || currentActiveChannel?.value?.isFriendlyNameUpdate) {
            return data['channelFriendlyName'] || '';
        } else {
            return 'Enter friendly name';
        }
    };

    const currentChannelStatusEntry = savedChannelStatusId?.find(
        (s) => parseInt(s?.channelDetailId, 10) === parseInt(currentActiveChannel?.value?.ChannelDetailID, 10),
    );
    const currentChannelStatusId = currentChannelStatusEntry?.statusId;
    const isFriendlyNameEditableInPopup =
        currentChannelStatusId == null ||
        currentChannelStatusId === '' ||
        statusIdCheck(currentChannelStatusId);

    useEffect(() => {
        if (!friendlyNamePopupShow?.show) return;
        const v = currentActiveChannel?.value;
        const prefill =
            v?.LevelNumber || v?.isFriendlyNameUpdate ? (data?.channelFriendlyName || '').trim() : '';
        reset({ friendlyName: prefill });
        clearErrors();
    }, [friendlyNamePopupShow?.show]);

    const handleSelect = (item) => {
        if (item.id === 'create') {
            handleCreateChannelContent();
        } else if (item.id === 'edit') {
            handleChannelEditRedirect();
        } else if (item.id === 'preview') {
            handleActionForwardOnclick();
        } else if (item.id === 'delete') {
            setChannelRemove(true);
        } else if (item.id === 'action') {
            setContentSetupComplete(true);
        } else if (item.id === 'enable') {
            handleDisableChannel(false, data.currentWindowId, canvasState);
        } else if (item.id === 'disable') {
            handleDisableChannel(true, data.currentWindowId, canvasState);
        }
    };

    const formSubmit = async (formData) => {
        if (isFriendlyNameSaving) return;

        const selectItem = friendlyNamePopupShow?.selectItem;
        const shouldSaveFriendlyName = isFriendlyNameEditableInPopup && formData?.friendlyName;

        setIsFriendlyNameSavePending(true);
        try {
            if (shouldSaveFriendlyName) {
                await friendlyNameSaveLoader.refetch({
                    fetcher: async () => {
                        await handleUpdateFriendlyName(
                            formData?.friendlyName || data?.channelFriendlyName || '',
                        );
                    },
                    mode: 'create',
                    loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
                });
            }

            setFriendlyNamePopupShow({
                show: false,
                selectItem: {},
            });

            if (selectItem?.id && (!isFriendlyNameEditableInPopup || formData?.friendlyName)) {
                handleSelect(selectItem);
            }
        } finally {
            setIsFriendlyNameSavePending(false);
        }
    };

    const handleCloseFriendlyNamePopup = () => {
        if (isFriendlyNameSaving) return;
        setFriendlyNamePopupShow(() => ({
            show: false,
            selectItem: {},
        }));
        clearErrors();
        reset();
    };

    // React.useEffect(() => {
    //     setCollapse(disableNodeList?.includes(data.currentWindowId));
    // }, []);

    return (
        <>
            <Handle
                type="target"
                position={Position.Left}
                style={{ bottom: 'auto', top: 33, left: -3, right: 'auto', visibility: 'hidden' }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="single"
            />
            <div className={`elementCircleCSS ${data.disableRest ? 'nodeShadow' : ''}`} ref={drop} id="button-anchor">
                {splitAb && (
                    <KendoIconDropdown
                        className={'elementSplitAbIcon width24'}
                        imageUrl={splitAbIcon}
                        data={[{ splitA: '10', splitB: '10' }]}
                        isCustomRender
                        itemRender={(props) => <RenderSplitAb list={props} />}
                        popupClass={'mdc-channel-splitAB-tools'}
                        onItemClick={({ item }) => {
                                                    }}
                        popupSettings={{
                            popupAlign: { vertical: 'bottom', horizontal: 'center' },
                            anchorAlign: { vertical: 'top', horizontal: 'center' },
                        }}
                    />
                )}
                {isRemove && (
                    <DeleteChannel
                        isRemove={isRemove}
                        resetDelete={resetDelete}
                        nodeId={data.nodeId}
                        mdcCanvas={canvasState}
                        dispatch={dispatch}
                        basePayload={{ userId, clientId, departmentId, campaignId }}
                        channelDeleteUpdate={(canvasJson) => handleChannelDeleteUpdate(canvasJson)}
                    />
                )}

                {/* <KendoIconDropdown
                    className={'elementBottomIcon '}
                    icon={` icon-rs-circle-menu-dot-medium icon-md color-primary-grey channelActionMeduDot`}
                    data={actionList}
                    isCustomRender
                    itemRender={RenderChannelAction}
                    popupClass={'mdc-channel-action-tools'}
                    onItemClick={({ item }) => {
                        if (item.id === 'create') {
                            handleCreateChannelContent();
                        } else if (item.id === 'edit') {
                            handleChannelEditRedirect();
                        } else if (item.id === 'preview') {
                            handleActionForwardOnclick();
                        } else if (item.id === 'delete') {
                            setChannelRemove(true);
                        } else if (item.id === 'action') {
                            setContentSetupComplete(true);
                        }
                    }}

                    //  opened={isOpenDropDown}

                    // onBlur={handleDropDownClose}
                    // onFocus={handleDropDownClose}
                    // opened={true}
                    // popupSettings={{
                    //     popupAlign: { vertical: 'top', horizontal: 'left' },
                    //     anchorAlign: { vertical: 'bottom', horizontal: 'left' },
                    // }}
                /> */}
                {isPanelToolbar && (
                    <Panel className="ToolBar">
                        <div ref={dropDownRef} style={{ zIndex: '1' }}>
                            <BootstrapDropdown
                                data={actionList}
                                flatIcon
                                defaultItem={
                                    <i
                                        className={` icon-rs-circle-menu-dot-medium icon-md color-primary-grey channelActionMeduDot`}
                                    />
                                }
                                showUpdate={false}
                                className="no_caret elementBottomIcon"
                                alignLeft
                                isObject={true}
                                fieldKey={`value`}
                                onSelect={(item) => {
                                    const notEligible = ['delete', 'preview'];
                                    const isFriendlyUpdate = currentActiveChannel?.value.isFriendlyNameUpdate;
                                    const isNotEligible = notEligible.includes(item?.id);

                                    if (isFriendlyUpdate || isNotEligible || currentActiveChannel?.value.LevelNumber) {
                                        handleSelect(item);
                                    } else {
                                        setFriendlyNamePopupShow({
                                            show: true,
                                            selectItem: item,
                                        });
                                    }
                                }}
                                isCustomToggle={true}
                                show={isOpen}
                                handleClick={(e) => {
                                    e?.stopPropagation?.();
                                    const newIsOpen = !isOpen;
                                    setIsOpen(newIsOpen);
                                    if (newIsOpen) {
                                        justOpenedRef.current = true;
                                    } else {
                                        justOpenedRef.current = false;
                                    }
                                }}
                            />
                        </div>
                    </Panel>
                )}
                {isContentSetupComplet ? (
                    <ChannelAction
                        isContentSetupComplet={isContentSetupComplet}
                        data={data}
                        cancelAction={() => {
                            setContentSetupComplete(false);
                        }}
                        goalType={_get(locationState, 'primaryGoal', '')}
                    />
                ) : null}
                {isChildChannelExist && (
                    <Icon
                        mainClass={'elementMiddleIcon'}
                        icon={!isCollapse ? 'icon-rs-square-minus-medium' : 'icon-rs-square-plus-medium'}
                        color={'color-secondary-grey'}
                        size="md"
                        callBack={(event) => {
                            setCollapse((prev) => {
                                const next = !prev;
                                data.ToggleCollapse(next, data.nodeId);
                                return next;
                            });
                        }}
                    />
                )}

                <div
                    className={`elementCircleIconCSS ${data['channelBgClassName']} ${isDisabled ? 'click-off' : ''}`}
                    style={{ border }}
                >
                    <i className={`${getMdcGlyph(data['channelIcon'])} icon-xl`}></i>
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    bottom: 'auto',
                    top: 34,
                    left: 'auto',
                    right: -21,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
            ></Handle>
            <Handle
                type="source"
                position={Position.Right}
                style={{
                    bottom: 'auto',
                    top: 34,
                    left: 'auto',
                    right: -21,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="shandle"
            ></Handle>

            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    bottom: -5,
                    top: 'auto',
                    left: 'auto',
                    right: 25,
                    visibility: 'hidden',
                }}
                onConnect={(params) => {}}
                isConnectable={isConnectable}
                id="B1"
            ></Handle>

            {/* {data['channelFriendlyName'] && ( */}
            <ChannelFriendlyNameEdit
                friendlyName={getFriendlyName()}
                updateFriendlyName={handleUpdateFriendlyName}
                data={data}
                onOpenFriendlyNamePopup={() =>
                    setFriendlyNamePopupShow({ show: true, selectItem: {} })
                }
            />
            {/* )} */}

            {show ? (
                <ChannelContentPopup
                    show={show}
                    popupMode={popupMode}
                    contentSettingJson={contentSettingJson}
                    isPreviewLoading={channelPreviewLoader.isLoading}
                    handleCreateChannelContent={handleCreateChannelContent}
                    handleSaveChannelContent={handleSaveChannelContent}
                    handleChannelEditRedirect={handleChannelEditRedirect}
                    onClose={handleClose}
                    currentActiveChannel={currentActiveChannel?.value}
                    channelId={data.channelId}
                />
            ) : null}
            {isRootExceed   && (
                <RSModal
                    size={'md'}
                    show={isRootExceed}
                    handleClose={handleCanvasRootExceedWarning}
                     isBorder
                    header={WARNING}
                    body={
                        <Row className="text-center">
                            <Col sm="12">
                               <p>{MAX_CONNECTIONS_EXCEEDS}</p>
                            </Col>
                        </Row>
                    }
                    footer={
                        <Fragment>
                            <RSPrimaryButton onClick={handleCanvasRootExceedWarning}>{OK}</RSPrimaryButton>
                        </Fragment>
                    }
                ></RSModal>
            )}
            {friendlyNamePopupShow?.show && (
                <RSModal
                    size={'md'}
                    show={friendlyNamePopupShow?.show}
                    handleClose={handleCloseFriendlyNamePopup}
                    isBorder
                    lockBackground={isFriendlyNameSaving}
                    isCloseDisabled={isFriendlyNameSaving}
                    header={FRIENDLY_NAME_WARNING}
                    body={
                        <form onSubmit={handleSubmit(formSubmit)}>
                            <Row
                                className={`form-group ${
                                    isFriendlyNameSaving ? 'pe-none click-off' : ''
                                }`}
                            >
                                <Col sm="12">
                                    <RSInput
                                        control={control}
                                        name={'friendlyName'}
                                        placeholder={'Friendly name'}
                                        required={isFriendlyNameEditableInPopup}
                                        disabled={!isFriendlyNameEditableInPopup}
                                        rules={
                                            isFriendlyNameEditableInPopup
                                                ? {
                                                      required: 'Enter friendly name',
                                                      validate: (value) => {
                                                          let names = [];
                                                          let rslt = getModule(
                                                              canvasState['Campaign']['CanvasChannel']['activeChannel'],
                                                              data.nodeId,
                                                          );
                                                          if (rslt) {
                                                              const { ChannelDetailID, DomId } = rslt['value'];
                                                              function extractChannelNames(channels) {
                                                                  for (let i = 0; i < channels?.length; i++) {
                                                                      let channelName = channels[i]?.ChannelFriendlyName;
                                                                      let channelDomId = channels[i]?.DomId;
                                                                      if (channelName && channelDomId !== DomId) {
                                                                          const isDefaultName =
                                                                              channelName === 'Enter friendly name';
                                                                          if (!isDefaultName) {
                                                                              names.push(channelName?.trim());
                                                                          }
                                                                      }
                                                                      if (channels[i]?.activeChannel?.length) {
                                                                          extractChannelNames(channels[i].activeChannel);
                                                                      }
                                                                  }
                                                              }
                                                              extractChannelNames(
                                                                  canvasState['Campaign']['CanvasChannel']['activeChannel'],
                                                              );
                                                              return names?.includes(value?.trim())
                                                                  ? 'Duplicate friendly name'
                                                                  : value === 'Enter friendly name'
                                                                  ? 'Default name not allowed. Use another.'
                                                                  : true;
                                                          }
                                                      },
                                                  }
                                                : {}
                                        }
                                        maxLength={MAX_LENGTH200}
                                    />
                                    <small className='text-end'>{`${friendlyNameLength}/${MAX_LENGTH200}`}</small>
                                </Col>
                            </Row>
                            <div className="buttons-holder">
                                <RSSecondaryButton
                                    onClick={handleCloseFriendlyNamePopup}
                                    blockInteraction={isFriendlyNameSaving}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    type="submit"
                                    isLoading={isFriendlyNameSaving}
                                    blockBodyPointerEvents
                                    disabledClass={isFriendlyNameSaving ? 'pe-none click-off' : ''}
                                >
                                    {PROCEED}
                                </RSPrimaryButton>
                            </div>
                        </form>
                    }
                ></RSModal>
            )}
        </>
    );
});
const selectBorderStyle = (isActive, canDrop) => {
    if (isActive) {
        return '1px solid #ff3939';
    } else if (canDrop) {
        return '1px solid $004fdf';
    } else {
        return 'none';
    }
};
