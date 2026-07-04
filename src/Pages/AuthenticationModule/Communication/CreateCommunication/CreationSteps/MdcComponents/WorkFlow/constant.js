import { getDDMMMYYYY } from 'Utils/modules/dateTime';
import {
    addHoursToDate,
    encodeUrl,
    getmasterData,
    getUserCurrentFormat,
    getUserDetails,
    handleCustomNavigationDetails,
} from 'Utils/index';
import { eachDeep, filterDeep, findDeep, mapDeep } from 'deepdash-es/standalone';
import { cloneDeep as _cloneDeep, mapKeys as _mapKeys, camelCase as _camelCase, filter as _filter, sum as _sum, reduce as _reduce, findIndex as _findIndex, find as _find, get as _get, unionBy as _unionBy, maxBy as _maxBy } from 'Utils/modules/lodashReplacements';
import { getEnvironment } from 'Utils/modules/environment';
import MdcTemplate from './MdcTemplate';
import { MDC_CHANNEL_AND_ACTION_TEMPLATE } from './mdcJsonConfigConstant';
import { getCountForRecursiveFlow } from './Components/PotentialAudience/PotentialConst';
import { getUtcTimeNow } from 'Reducers/globalState/request';
import { MDC_AUTHORING_CHANNEL_CONFIG } from '../Create/constant';

import {
    alert_medium,
    circle_arrow_right_medium,
    circle_paid_media_xlarge,
    email_xlarge,
    industry_retail_xlarge,
    landing_page_xlarge,
    messaging_rcs_large,
    messaging_rcs_xlarge,
    mobile_notification_xlarge,
    mobile_sms_xlarge,
    notification_xlarge,
    pencil_edit_medium,
    qrcode_xlarge,
    settings_medium,
    social_facebook_xlarge,
    social_linkedin_xlarge,
    social_twitter_xlarge,
    social_vms_xlarge,
    social_whatsapp_xlarge,
    user_call_center_xlarge,
    user_dynamic_list_xlarge,
    user_segments_xlarge,
    webhook_xlarge,
} from 'Constants/GlobalConstant/Glyphicons';

/** MDC workflow icon lookup — avoids per-component Glyphicons namespace imports. */
export const MDC_GLYPH = Object.freeze({
    alert_medium,
    circle_arrow_right_medium,
    circle_paid_media_xlarge,
    email_xlarge,
    industry_retail_xlarge,
    landing_page_xlarge,
    messaging_rcs_large,
    messaging_rcs_xlarge,
    mobile_notification_xlarge,
    mobile_sms_xlarge,
    notification_xlarge,
    pencil_edit_medium,
    qrcode_xlarge,
    settings_medium,
    social_facebook_xlarge,
    social_linkedin_xlarge,
    social_rcs_xlarge: messaging_rcs_xlarge,
    social_twitter_xlarge,
    social_vms_xlarge,
    social_whatsapp_xlarge,
    user_call_center_xlarge,
    user_dynamic_list_xlarge,
    user_segments_xlarge,
    webhook_xlarge,
});

export const getMdcGlyph = (iconKey) => (iconKey && MDC_GLYPH[iconKey]) || '';

export const sourceAndChannelList = {
    sourceList: [
        {
            id: 'SRC_TargetList',
            label: 'Segment(s)',
            icon: 'user_segments_xlarge',
            color: 'ch_list_audience',
            type: 'SrcElement',
            draggable: true,
        },
        {
            id: 'SRC_DynamicList',
            label: 'Individual(s)',
            icon: 'user_dynamic_list_xlarge',
            color: 'ch_dynamic_audience',
            type: 'dynamicAud',
            draggable: true,
        },
    ],
    channelList: [
        {
            id: 'ch001',
            label: 'Email',
            icon: 'email_xlarge',
            className: 'bg-email',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' Email ',
        },
        {
            id: 'ch002',
            label: 'SMS',
            icon: 'mobile_sms_xlarge',
            className: 'bg-sms',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: 'SMS ',
        },
        {
            id: 'ch008',
            label: 'Web push',
            icon: 'notification_xlarge',
            className: 'bg-web-push',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' Web push ',
        },
        {
            id: 'ch0014',
            label: 'Mobile push',
            icon: 'mobile_notification_xlarge',
            className: 'bg-mobile-push',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: 'Mobile push ',
        },
        {
            id: 'ch0025',
            label: 'VMS',
            icon: 'social_vms_xlarge',
            className: 'bg-vms',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' VMS ',
        },
        {
            id: 'ch0026',
            label: 'Call center',
            icon: 'user_call_center_xlarge',
            className: 'bg-call-center',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' Call center ',
        },
        {
            id: 'ch003',
            label: 'QR code',
            icon: 'qrcode_xlarge',
            className: 'bg-qr-code',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' QR code ',
        },
        {
            id: 'ch0021',
            label: 'WhatsApp',
            icon: 'social_whatsapp_xlarge',
            className: 'bg-whatsapp',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' WhatsApp ',
        },
        {
            id: 'ch0041',
            label: 'RCS',
            icon: 'messaging_rcs_large',
            className: 'bg-rcs-message',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' RCS ',
        },
        {
            id: 'ch0034',
            label: 'Webhook',
            icon: 'webhook_xlarge',
            className: 'bg-webhook',
            type: 'ChannelElement',
            draggable: true,
            friendlyName: ' Webhook ',
        },
        {
            id: 'ch00-1',
            label: 'Paid media',
            icon: 'circle_paid_media_xlarge',
            className: 'bg-paid-media',
            type: 'ChannelElement',
            draggable: false,
            friendlyName: ' Paid media ',
        },
        {
            id: 'ch00-2',
            label: 'X',
            icon: 'social_twitter_xlarge',
            className: 'bg-twitter',
            type: 'ChannelElement',
            draggable: false,
            friendlyName: ' X ',
        },
        {
            id: 'ch00-2',
            label: 'Facebook',
            icon: 'social_facebook_xlarge',
            className: 'bg-facebook',
            type: 'ChannelElement',
            draggable: false,
            friendlyName: ' Facebook ',
        },
        {
            id: 'ch00-2',
            label: 'Linkedin',
            icon: 'social_linkedin_xlarge',
            className: 'bg-linkedin',
            type: 'ChannelElement',
            draggable: false,
            friendlyName: ' Linkedin ',
        },
    ],
    goalList: [
        {
            id: 'eshop-2',
            label: 'eShop',
            icon: 'industry_retail_xlarge',
            className: 'bg-direct-mail',
            type: 'ConversionElement',
            draggable: false,
            friendlyName: ' eShop ',
        },
        {
            id: 'goal001',
            label: 'Landing page',
            icon: 'landing_page_xlarge',
            className: 'bg-landing-page',
            type: 'ConversionElement',
            draggable: true,
            friendlyName: ' Landing page ',
        },
    ],
};
export const canvasInitialState = {
    ..._cloneDeep(MdcTemplate),
    nodeState: [],
    edgeState: [],
    updatedCount: 0,
    defaultEle: {
        id: '',
        type: 'Placeholder',
        targetPosition: 'left',
        data: { label: 'Drop here' },
        position: { x: 0, y: 0 },
        className: 'res-mdc-placeholder',
        style: { visibilit: 'visible' },
    },
};

export const updateCanvasStateInSubSegmentList = (canvasState, payload) => {
    const cloneCanvasState = _cloneDeep(canvasState);

    if (!payload?.subSegmentData) {
        return cloneCanvasState;
    }

    if (!cloneCanvasState.subSegment) {
        cloneCanvasState.subSegment = { subSegmentList: [] };
    }
    if (!Array.isArray(cloneCanvasState.subSegment.subSegmentList)) {
        cloneCanvasState.subSegment.subSegmentList = [];
    }

    const subSegmentLevel = (cloneCanvasState.subSegment.subSegmentList.length || 0) + 1;
    let { subSegmentData } = payload;
    const existingIndex = cloneCanvasState.subSegment.subSegmentList.findIndex(
        (item) => item.id === subSegmentData.id,
    );

    if (existingIndex !== -1) {
        cloneCanvasState.subSegment.subSegmentList[existingIndex] = {
            ...cloneCanvasState.subSegment.subSegmentList[existingIndex],
            ...subSegmentData,
        };
    } else {
        subSegmentData = {
            ...subSegmentData,
            data: {
                ...(subSegmentData.data || {}),
                subSegmentLevel,
            },
        };
        cloneCanvasState.subSegment.subSegmentList.push(subSegmentData);
    }

    return cloneCanvasState;
};

const sortSubSegmentListByLevel = (subSegmentList = []) =>
    [...subSegmentList].sort((a, b) => {
        const levelDiff = (a.data?.subSegmentLevel ?? 0) - (b.data?.subSegmentLevel ?? 0);
        if (levelDiff !== 0) return levelDiff;
        return (a.data?.priority ?? 0) - (b.data?.priority ?? 0);
    });

export const normalizeSubSegmentCanvasState = (canvasState) => {
    if (!canvasState?.dataSource?.isSubsegmentJoureny) {
        return canvasState;
    }

    const clone = _cloneDeep(canvasState);
    const subSegmentList = clone.subSegment?.subSegmentList;
    if (!Array.isArray(subSegmentList) || !subSegmentList.length) {
        return clone;
    }

    const sortedSegments = sortSubSegmentListByLevel(subSegmentList);
    const remainingOldLevels = new Set(sortedSegments.map((segment) => segment.data?.subSegmentLevel));
    const levelMap = new Map();

    const renumberedSegments = sortedSegments.map((segment, index) => {
        const newLevel = index + 1;
        const oldLevel = segment.data?.subSegmentLevel;
        if (oldLevel != null) {
            levelMap.set(oldLevel, newLevel);
        }

        return {
            ...segment,
            data: {
                ...segment.data,
                subSegmentLevel: newLevel,
                ...(clone.dataSource?.isGroupCommunication ? {} : { priority: newLevel }),
            },
        };
    });

    clone.subSegment = {
        ...clone.subSegment,
        subSegmentList: renumberedSegments,
    };

    const applyLevelMap = (level) => {
        if (level == null) return level;
        return levelMap.has(level) ? levelMap.get(level) : level;
    };

    const updateChannels = (channels) => {
        if (!Array.isArray(channels)) return;
        channels.forEach((channel) => {
            if (channel.subSegmentLevel != null) {
                channel.subSegmentLevel = applyLevelMap(channel.subSegmentLevel);
            }
            if (channel.activeChannel?.length) {
                updateChannels(channel.activeChannel);
            }
        });
    };

    updateChannels(clone.Campaign?.CanvasChannel?.activeChannel);

    const placeholders = clone.Campaign?.CanvasChannel?.Placeholder;
    if (Array.isArray(placeholders)) {
        placeholders.forEach((placeholder) => {
            const oldLevel = placeholder?.data?.subSegmentLevel;
            if (oldLevel != null) {
                placeholder.data = {
                    ...placeholder.data,
                    subSegmentLevel: applyLevelMap(oldLevel),
                };
            }
        });
    }

    const validSubSegmentIds = new Set(renumberedSegments.map((segment) => segment.id));
    const deletedSubSegmentIds = subSegmentList
        .filter((segment) => !validSubSegmentIds.has(segment.id))
        .map((segment) => segment.id);

    if (Array.isArray(clone.nodeState)) {
        clone.nodeState = clone.nodeState
            .filter((node) => {
                if (node.type === 'SubSegmentItem') {
                    return validSubSegmentIds.has(node.id);
                }
                if (node.type === 'AddonItem' && node.data?.subSegmentLevel != null) {
                    return remainingOldLevels.has(node.data.subSegmentLevel);
                }
                return true;
            })
            .map((node) => {
                if (node.data?.subSegmentLevel == null) {
                    return node;
                }
                return {
                    ...node,
                    data: {
                        ...node.data,
                        subSegmentLevel: applyLevelMap(node.data.subSegmentLevel),
                    },
                };
            });
    }

    if (Array.isArray(clone.disableNodeList) && deletedSubSegmentIds.length) {
        clone.disableNodeList = clone.disableNodeList.filter(
            (nodeId) => !deletedSubSegmentIds.includes(nodeId),
        );
    }

    return clone;
};

export const communicationCanvasReducer = (state, action) => {
        switch (action.type) {
        case 'DRAG_START':
            const { nodeState } = state;
            let getNode = nodeState.filter((item) => item.id === action.payload.id);
            if (nodeState?.length === 0 && getNode?.length === 0)
                return { ...state, nodeState: [...state.nodeState, action.payload] };
            else return state;
        case 'DRAG_ENTER':
            return Object.assign({}, state, { nodeState: [action.payload] });
        case 'DRAG_LEAVE':
            return { ...state, nodeState: [...state.nodeState, action.payload] };
        case 'DROP':
            return { ...state, nodeState: [{ ...state.nodeState[0], ...action.payload }] };
        case 'DRAG_END':
            let payload = Object.keys(action.payload)?.length ? [action.payload] : [];
            return { ...state, nodeState: payload };
        case 'SOURCE_ACTION_FORWARD': {
            let recursiveJson = UpdateRecursiveFlow(state, action.payload, 'ActionItem');
            const nodeResult = ReacctFlowNodeFormatter(recursiveJson, action.payload, 'ActionItem');

            return { ...state, nodeState: [...state.nodeState, ...nodeResult] };
        }
        case 'TRIGGER_ACTION_FORWARD': {
            let {
                Campaign: { CanvasChannel },
            } = state;
            let Placeholder = CanvasChannel?.Placeholder
                ? [...CanvasChannel?.Placeholder, ...action.payload.updatedStateVal]
                : [...action.payload.updatedStateVal];
            let updatePlaceholder = {
                ...CanvasChannel,
                Placeholder,
            };
            let newState = _cloneDeep(state);
            newState['Campaign']['CanvasChannel'] = updatePlaceholder;
            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload.updatedStateVal, 'emptyEle');
            let updatedNode = _unionBy(newState.nodeState, nodeResult, 'id');
            const goalNodes = updatedNode.filter((node) => node.type === 'GoalItem');
            const goalPlaceholderNodes = updatedNode.filter((node) => node.type === 'GoalPlaceholder');
            const otherNodes = updatedNode.filter(
                (node) => node.type !== 'GoalItem' && node.type !== 'GoalPlaceholder',
            );

            let newNodeState;
            newNodeState = [...otherNodes, ...goalPlaceholderNodes, ...goalNodes];

            return { ...newState, nodeState: newNodeState, updatedCount: state.updatedCount + 1 };
        }
        case 'CHANNEL_DRAG_END': {
            let {
                Campaign: {
                    CanvasChannel: { Placeholder },
                },
            } = state;
            let updatePlaceholder = Placeholder.filter((item) => !item.data?.elementAddOnType);

            state['Campaign']['CanvasChannel']['Placeholder'] = updatePlaceholder;
            let newState = { ...state };
            let newNodeState = newState.nodeState.filter((item) => !item.data?.elementAddOnType);
            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload);
            return { ...newState, nodeState: [...newNodeState] };
        }
        case 'CHANNEL_DROP':
            // debugger;
            let recursiveJson = UpdateRecursiveFlow(state, action.payload);
            const nodeResult = ReacctFlowNodeFormatter(recursiveJson, action.payload);
            const node = [...state.nodeState];
            const nodeIndex = _findIndex(node, ['id', action.payload.id]);
            let tempNode = node[nodeIndex];
            const {
                position: { x, y },
            } = tempNode;
            node[nodeIndex] = { ...tempNode, ...nodeResult[0] };
            node[nodeIndex] = { ...node[nodeIndex], position: { x, y } };

            const goalNodes = node.filter((node) => node.type === 'GoalItem');
            const otherNodes = node.filter((node) => node.type !== 'GoalItem');
            let finalNodeList;
            if (goalNodes?.length) {
                finalNodeList = [...otherNodes, ...goalNodes];
            } else {
                finalNodeList = [...otherNodes];
            }
            return { ...recursiveJson, nodeState: [...finalNodeList], updatedCount: state.updatedCount + 1 };
        case 'CREATE_ADDON_CHANNEL': {
            const { exChannel, addOnChannel, addOnEle } = action.payload;
            state.nodeState = state['nodeState'].map((item) => {
                item.position = item.id === exChannel.id ? exChannel.position : item.position;
                item.data.parentWindowId =
                    item.id === exChannel.id ? exChannel.data.parentWindowId : item.data.parentWindowId;
                return item;
            });

            state = { ...state, nodeState: [...state.nodeState, addOnEle, addOnChannel] };
            let recursiveJson = UpdateRecursiveFlow(state, action.payload, 'AddOnItem');
            return recursiveJson;
        }
        case 'CREATE_PARENT_ADDON_CHANNEL': {
            const { exChannel, addOnChannel, addOnEle } = action.payload;
            state.nodeState = state['nodeState'].map((item) => {
                item.position = item.id === exChannel.id ? exChannel.position : item.position;
                item.data.parentWindowId =
                    item.id === exChannel.id ? exChannel.data.parentWindowId : item.data.parentWindowId;
                return item;
            });
            let updatedNodeState = _unionBy(state.nodeState, addOnChannel, 'id');
            state = { ...state, nodeState: [...updatedNodeState, addOnEle], updatedCount: state.updatedCount + 1 };
            let recursiveJson = UpdateRecursiveFlow(state, action.payload, 'ParentAddOnItem');
            return recursiveJson;
        }
        case 'CREATE_PARENT_ADDON_CHANNEL_THREE': {
            const { addOnChannel } = action.payload;
            let updatedNodeState = _unionBy(state.nodeState, addOnChannel, 'id');
            state = { ...state, nodeState: [...updatedNodeState], updatedCount: state.updatedCount + 1 };
            let recursiveJson = UpdateRecursiveFlow(state, action.payload, 'ParentAddOnItemUpdate');
            return recursiveJson;
        }
        case 'CREATE_PARENT_ADDON_CHANNEL_FOUR': {
            const { addOnChannel } = action.payload;
            let updatedNodeState = _unionBy(state.nodeState, addOnChannel, 'id');
            state = { ...state, nodeState: [...updatedNodeState], updatedCount: state.updatedCount + 1 };
            let recursiveJson = UpdateRecursiveFlow(state, action.payload, 'ParentAddOnItemUpdate');
            return recursiveJson;
        }
        case 'CREATE_EDGE_OBJECT':
            return { ...state, edgeState: [...state.edgeState, action.payload] };
        case 'UPDATE_NODE_POSTION':
            let updatedNodeState = UpdateNodePosition([state, action.payload]);
            // let newState = state.nodeState.map(item => {
            //     item.position = (item.id===action.payload.id)? action.payload.position:item.position;
            //     return item;
            // })
            // console.log('UPDATED NODES',newState)
            // return {...state,nodeState:[...newState]};
            return updatedNodeState;
        case 'UPDATE_MULTI_NODE_POSTION': {
            let updatedNodeState = UpdateMultiNodePosition([state, action.payload]);
            return updatedNodeState;
        }
        case 'UPDATE_EDGES':
            return { ...state, edgeState: [...action.payload] };
        case 'UPDATE_NODE_FROM_API':
            return { ...state, nodeState: [...action.payload] };
        case 'CANVAS_RESET':
            return { ...state, nodeState: [] };
        case 'TARGET_LIST_DRAG_START': {
            const {
                nodeId,
                Position: { x, y },
            } = action['payload'];
            let { dataSource } = state;
            state['Campaign']['CanvasChannel']['activeChannel'] = [];
            state['Campaign']['PotentialRecipients']['Recipients'] = [];
            dataSource['DomId'] = nodeId;
            dataSource['Position']['left'] = x;
            dataSource['Position']['top'] = y;
            dataSource['ElementType'] = 'Placeholder';
            dataSource['sourcePosition'] = 'right';
            dataSource['CssClass'] = 'res-mdc-placeholder';
            let newState = { ...state, dataSource };

            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload);
            return { ...newState, nodeState: nodeResult };
        }
        case 'TARGET_LIST_DRAG_END': {
            let { dataSource } = state;
            dataSource['DomId'] = '';
            dataSource['Position']['left'] = '';
            dataSource['Position']['top'] = '';
            dataSource['ElementType'] = '';
            dataSource['sourcePosition'] = '';
            dataSource['CssClass'] = '';
            let newState = { ...state, dataSource };

            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload);
            return { ...newState, nodeState: nodeResult };
        }
        case 'TARGET_LIST_DROP': {
            const {
                id,
                position: { x, y },
                type,
                className,
                sourcePosition,
                data: { nodeId, parentWindowId },
            } = action['payload'];
            let { dataSource } = state;
            dataSource['DomId'] = id;
            dataSource['Position']['left'] = x;
            dataSource['Position']['top'] = y;
            dataSource['ElementType'] = type;
            dataSource['Type'] = 'Recipient';
            dataSource['sourcePosition'] = sourcePosition;
            dataSource['CssClass'] = className;
            let newState = { ...state, dataSource };

            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload);
            return { ...newState, nodeState: nodeResult };
        }
        case 'DYNAMIC_LIST_DROP': {
            const {
                id,
                position: { x, y },
                type,
                className,
                sourcePosition,
                data: { nodeId, parentWindowId },
            } = action['payload'];
            let { dataSource } = state;
            dataSource['DomId'] = id;
            dataSource['Position']['left'] = x;
            dataSource['Position']['top'] = y;
            dataSource['ElementType'] = type;
            dataSource['Type'] = 'DynamicList';
            dataSource['sourcePosition'] = sourcePosition;
            dataSource['CssClass'] = className;
            let newState = { ...state, dataSource };

            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload);
            return { ...newState, nodeState: nodeResult };
        }
        case 'AUDIENCE_LIST_SAVE': {
            let {
                Campaign: { CanvasChannel },
            } = state;
            let updatePlaceholder = { ...CanvasChannel, Placeholder: [action.payload] };
            const { isAutoRefresh, isGroupCommunication, GroupedCampaignId, isSubsegmentJoureny, isCGTGEnabled } =
                action.payload?.data;
            state['Campaign']['CanvasChannel'] = updatePlaceholder;
            let selectedAudienceList = action.payload?.data?.selectedAudienceList ?? [];
            let segmentationList = _filter(selectedAudienceList, 'segmentationListId').map((v) => v.segmentationListId);
            let listType = _filter(selectedAudienceList, 'listType').map((v) => v.listType);
            let recipientCount = _filter(selectedAudienceList, 'recipientCount').map((v) => v.recipientCount);
            let totalRecipientCount = _sum(recipientCount);
            state = {
                ...state,
                dataSource: {
                    ...state['dataSource'],
                    ListType: listType,
                    DataList: segmentationList,
                    isAutoRefresh,
                    isGroupCommunication,
                    GroupedCampaignId,
                    isSubsegmentJoureny,
                    isCGTGEnabled: isCGTGEnabled ?? false,
                },
                ReceipientCount: totalRecipientCount,
            };
            state['Campaign']['PotentialRecipients']['Recipients'] = selectedAudienceList;
            const nodeResult = ReacctFlowNodeFormatter(state, action.payload, 'emptyEle');
            return { ...state, nodeState: [...state.nodeState, ...nodeResult] };
        }
        case 'AUDIENCE_LIST_UPDATE': {
            let { selectedAudienceList, isAutoRefresh, isCGTGEnabled } = action.payload;
            let segmentationList = _filter(selectedAudienceList, 'segmentationListId').map((v) => v.segmentationListId);
            let listType = _filter(selectedAudienceList, 'listType').map((v) => v.listType);
            let recipientCount = _filter(selectedAudienceList, 'recipientCount').map((v) => v.recipientCount);
            let totalRecipientCount = _sum(recipientCount);
            let updateMdcType =
                state?.MdcType === 'RecursivelyTraverse_React_Template' || state?.MdcType === 'RecursivelyTraverse'
                    ? 'RecursivelyTraverse_React'
                    : state?.MdcType;
            state = {
                ...state,
                MdcType: updateMdcType,
                dataSource: {
                    ...state['dataSource'],
                    ListType: listType,
                    DataList: segmentationList,
                    isAutoRefresh: isAutoRefresh,
                    isCGTGEnabled: isCGTGEnabled ?? false,
                },
                ReceipientCount: totalRecipientCount,
            };
            state['Campaign']['PotentialRecipients']['Recipients'] = selectedAudienceList;
            let nodeRslt = NodeFormatter(_cloneDeep(state));
            return { ...state, nodeState: [...nodeRslt] };
        }
        case 'DYNAMIC_LIST_SAVE': {
            let {
                Campaign: { CanvasChannel },
            } = state;
            let updatePlaceholder = { ...CanvasChannel, Placeholder: [action.payload] };
            state['Campaign']['CanvasChannel'] = updatePlaceholder;
            state = {
                ...state,
                dataSource: { ...state['dataSource'], dynamicData: action.payload?.data?.dynamicData },
            };
            const nodeResult = ReacctFlowNodeFormatter(state, action.payload, 'emptyEle');
            return { ...state, nodeState: [...state.nodeState, ...nodeResult] };
        }
        case 'DYNAMIC_LIST_UPDATE': {
            let updateMdcType =
                state?.MdcType === 'RecursivelyTraverse_React_Template' || state?.MdcType === 'RecursivelyTraverse'
                    ? 'RecursivelyTraverse_React'
                    : state?.MdcType;
            state = {
                ...state,
                MdcType: updateMdcType,
                dataSource: { ...state['dataSource'], dynamicData: action.payload.dynamicData },
            };

            return { ...state };
        }
        case 'ASSIGN_CANVAS_DATA': {
            //return _assign({},action.payload);
            let newState = { ...state, ...action.payload };
            let nodeRslt = NodeFormatter(newState);
            return {
                ...newState,
                Campaign: {
                    ...newState.Campaign,
                    MdcFlowConfig: {
                        ...newState.Campaign.MdcFlowConfig,
                        isCurveLine:
                            typeof state?.Campaign?.MdcFlowConfig?.isCurveLine !== 'boolean'
                                ? true
                                : action.payload?.Campaign?.MdcFlowConfig?.isCurveLine ??
                                  state?.Campaign?.MdcFlowConfig?.isCurveLine ??
                                  true,
                        isShowScheduleTooltip:
                            typeof state?.Campaign?.MdcFlowConfig?.isShowScheduleTooltip !== 'boolean'
                                ? true
                                : action.payload?.Campaign?.MdcFlowConfig?.isShowScheduleTooltip ??
                                  state?.Campaign?.MdcFlowConfig?.isShowScheduleTooltip ??
                                  true,
                    },
                },
                nodeState: [...nodeRslt],
                updatedCount: state.updatedCount + 1,
            };
        }
        case 'ASSIGN_CANVAS_DATA_RECURSIVELY_TREE':
            //return _assign({},action.payload);
            return { ...action.payload };
        case 'UPDATE_CHANNEL_RESPONSE_DATA':
            let rslt = UpateChannelResponseDataToRecursiveFlow(
                action.payload.locationState,
                action.payload.channelResponseData,
                state,
            );
            return rslt;
        case 'UPDATE_RECURSIVE_FLOW_DATE_TIME':
            let tmprslt = UpdateRecursivelyFlowDateTime(action.payload, state, 'recursivelyUpdate');
            let nodeRslt = NodeFormatter(tmprslt);
            return { ...tmprslt, nodeState: [...nodeRslt], updatedCount: state.updatedCount + 1 };
        case 'CHANNEL_DELETE_UPDATE': {
            let canvasJson = action.payload?.canvasJson ?? action.payload;

            if (canvasJson?.dataSource?.isSubsegmentJoureny) {
                canvasJson = normalizeSubSegmentCanvasState(canvasJson);
            }

            let finalCanvasState;
            let nodeRslt = NodeFormatter(canvasJson);

            function updateChannelsWithSegmentLevel(channels, segmentList, isNested, parentLevel) {
                return channels.map((channel) => {
                    const matchedSegment = segmentList.find((seg) => seg.id === channel.parentWindowId);
                    const updatedChannel = {
                        ...channel,
                        subSegmentLevel:
                            (!isNested ? matchedSegment?.data?.subSegmentLevel : parentLevel) ??
                            channel.subSegmentLevel,
                    };

                    if (channel.activeChannel?.length) {
                        updatedChannel.activeChannel = updateChannelsWithSegmentLevel(
                            channel.activeChannel,
                            segmentList,
                            true,
                            matchedSegment?.data?.subSegmentLevel,
                        );
                    }

                    return updatedChannel;
                });
            }

            const matchSegmentList = nodeRslt.filter((node) => node.type === 'SubSegmentItem');

            if (canvasJson?.dataSource?.isSubsegmentJoureny) {
                const activeChannel = canvasJson?.Campaign?.CanvasChannel?.activeChannel;

                const updateActiveChannel = updateChannelsWithSegmentLevel(activeChannel, matchSegmentList, false);

                finalCanvasState = {
                    ...canvasJson,
                    Campaign: {
                        ...canvasJson.Campaign,
                        CanvasChannel: {
                            ...canvasJson.Campaign.CanvasChannel,
                            activeChannel: [...updateActiveChannel],
                        },
                    },
                    nodeState: [...nodeRslt],
                    subSegment: {
                        ...canvasJson.subSegment,
                        subSegmentList: [...matchSegmentList],
                    },
                    updatedCount: state.updatedCount + 1,
                };
            } else {
                finalCanvasState = { ...canvasJson, nodeState: [...nodeRslt], updatedCount: state.updatedCount + 1 };
            }

            const edgeList = GenerateEdgeObject(finalCanvasState);
            return { ...finalCanvasState, edgeState: [...edgeList] };
        }
        case 'UPDATE_ALL_OR_ANY': {
            let rsltState = updateAllOrAny(state, action.payload);
            return { ...rsltState };
        }
        case 'ROOT_CHANNEL_ADDON_START': {
            // debugger;

            let {
                Campaign: { CanvasChannel },
            } = state;
            let updatePlaceholder = {
                ...CanvasChannel,
                Placeholder: [
                    ...(CanvasChannel.Placeholder?.length ? CanvasChannel.Placeholder : []),
                    ...(Array.isArray(action.payload) && action.payload.length ? action.payload : [action.payload]),
                ],
            };
            state['Campaign']['CanvasChannel'] = updatePlaceholder;

            let nodeResult = Array.isArray(action.payload)
                ? action.payload?.length && ReacctFlowNodeFormatter(state, action.payload, 'rootAddon')
                : action.payload && ReacctFlowNodeFormatter(state, action.payload, 'rootAddon');
            let finalNode = nodeResult ? [...nodeResult] : [];
            return { ...state, nodeState: [...state.nodeState, ...finalNode] };
        }
        case 'CHANNEL_FRIENDLYNAME_UPDATE': {
            const baseState = action.payload?.subSegment ? action.payload : state;
            let nodeRslt = NodeFormatter(baseState);
            const matchSegmentList = nodeRslt.filter((node) => node.type === 'SubSegmentItem');
            const rebuiltState = {
                ...baseState,
                nodeState: [...nodeRslt],
                subSegment: {
                    ...baseState.subSegment,
                    subSegmentList: matchSegmentList.length ? [...matchSegmentList] : baseState.subSegment?.subSegmentList,
                },
            };
            const edgeList = GenerateEdgeObject(rebuiltState);
            return { ...rebuiltState, edgeState: [...edgeList] };
        }
        case 'UPDATE_ATTR_SETUP_DATA': {
            let updatedState = addAttributeData(state, action.payload);
            return { ...updatedState };
        }
        case 'REMOVE_ATTR_SETUP_DATA': {
            let updatedState = removeAttributeData(state, action.payload);
            return { ...updatedState };
        }
        case 'QR_CODE_DRAG_START': {
            const {
                id,
                position: { x, y },
            } = action['payload'];
            let { dataSource } = state;
            dataSource['DomId'] = id;
            dataSource['Position']['left'] = x;
            dataSource['Position']['top'] = y;
            dataSource['ElementType'] = 'Placeholder';
            dataSource['sourcePosition'] = 'right';
            dataSource['CssClass'] = 'res-mdc-placeholder';
            let newState = { ...state, dataSource };

            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload);
            return { ...newState, nodeState: nodeResult };
        }
        case 'QR_CODE_DRAG_END': {
            let { dataSource } = state;
            dataSource['DomId'] = '';
            dataSource['Position']['left'] = '';
            dataSource['Position']['top'] = '';
            dataSource['ElementType'] = '';
            dataSource['sourcePosition'] = '';
            dataSource['CssClass'] = '';
            let newState = { ...state, dataSource };

            const nodeResult = ReacctFlowNodeFormatter(newState, action.payload);
            return { ...newState, nodeState: nodeResult };
        }
        case 'QR_CODE_DROP': {
            let { dataSource } = state;
            dataSource['DomId'] = '';
            dataSource['Position']['left'] = '';
            dataSource['Position']['top'] = '';
            dataSource['ElementType'] = '';
            dataSource['sourcePosition'] = '';
            dataSource['CssClass'] = '';
            dataSource['Type'] = 'QR';

            let newState = { ...state, dataSource };

            let recursiveJson = UpdateRecursiveFlow(newState, action.payload);
            const nodeResult = ReacctFlowNodeFormatter(recursiveJson, action.payload);
            const node = [...state.nodeState];
            const nodeIndex = _findIndex(node, ['id', action.payload.id]);
            let tempNode = node[nodeIndex];
            const {
                position: { x, y },
            } = tempNode;
            node[nodeIndex] = { ...tempNode, ...nodeResult[0] };
            node[nodeIndex] = { ...node[nodeIndex], position: { x, y } };
            return { ...recursiveJson, nodeState: [...node] };
        }
        case 'UPDATE_GRID_ALIGNMENT_POSTION': {
            const updatedState = GridAlignment(state, action.payload);
            return { ...updatedState };
        }
        case 'AUDIENCE_LIST_SAVE_SUBSEGMENT_FLOW': {
            let {
                Campaign: { CanvasChannel },
            } = state;
            const { isAutoRefresh, isGroupCommunication, isGroupCommunicationId, isSubsegmentJoureny, isCGTGEnabled } =
                action.payload?.data;
            let updateSubSegmentList = { subSegmentList: [action.payload.subSegmentObj] };
            let selectedAudienceList = action.payload?.data?.selectedAudienceList ?? [];
            let segmentationList = _filter(selectedAudienceList, 'segmentationListId').map((v) => v.segmentationListId);
            let listType = _filter(selectedAudienceList, 'listType').map((v) => v.listType);
            let recipientCount = _filter(selectedAudienceList, 'recipientCount').map((v) => v.recipientCount);
            let totalRecipientCount = _sum(recipientCount);
            let updateState = {
                ...state,
                Campaign: {
                    ...state.Campaign,
                    PotentialRecipients: {
                        ...state.Campaign.PotentialRecipients,
                        Recipients: selectedAudienceList,
                    },
                },
                dataSource: {
                    ...state.dataSource,
                    ListType: listType,
                    DataList: segmentationList,
                    isAutoRefresh,
                    isSubsegmentJoureny,
                    isGroupCommunication,
                    isGroupCommunicationId,
                    isCGTGEnabled: isCGTGEnabled ?? false,
                },
                ReceipientCount: totalRecipientCount,
                subSegment: {
                    ...state.subSegment,
                    ...updateSubSegmentList,
                },
            };
            const nodeResult = ReacctFlowNodeFormatter(updateState, action.payload, 'subSegment');
            return { ...updateState, nodeState: [...state.nodeState, ...nodeResult] };
        }
        case 'UPDATE_SUBSEGMENT_NODE': {
            if (!action.payload?.subSegmentData) {
                return state;
            }
            let updateCanvasState = updateCanvasStateInSubSegmentList(state, action.payload);

            if (action.payload.isAddOn && action.payload.addOnEle?.id) {
                updateCanvasState = {
                    ...updateCanvasState,
                    subSegment: {
                        ...updateCanvasState.subSegment,
                        IsSubSegmentSwitched: true,
                        switchCond: {
                            DomId: action.payload.addOnEle.id,
                            SelectionMode: 'All',
                            Position: {
                                left: action.payload.addOnEle?.position?.x ?? '',
                                top: action.payload.addOnEle?.position?.y ?? '',
                            },
                        },
                    },
                };
            }

            const nodeRslt = NodeFormatter(updateCanvasState);
            const matchSegmentList = nodeRslt.filter((node) => node.type === 'SubSegmentItem');
            const rebuiltCanvasState = {
                ...updateCanvasState,
                nodeState: [...nodeRslt],
                subSegment: {
                    ...updateCanvasState.subSegment,
                    subSegmentList: [...matchSegmentList],
                },
            };
            const edgeList = GenerateEdgeObject(rebuiltCanvasState);

            return {
                ...rebuiltCanvasState,
                edgeState: [...edgeList],
                updatedCount: state.updatedCount + 1,
            };
        }
        case 'UPDATE_PLACEHOLDER_NODE': {
            return {
                ...state,
                Campaign: {
                    ...state.Campaign,
                    CanvasChannel: {
                        ...state.Campaign.CanvasChannel,
                        Placeholder: [
                            ...(Array.isArray(state.Campaign.CanvasChannel.Placeholder)
                                ? state.Campaign.CanvasChannel.Placeholder
                                : []),
                            action.payload,
                        ],
                    },
                },
                nodeState: [...state.nodeState, action.payload],
            };
        }

        case 'UPDATE_SUBSEGMENT': {
            let actionPayload = action.payload;
            const canvasState = _cloneDeep(state);
            canvasState.subSegment.subSegmentList = actionPayload;
            return canvasState;
        }
        case 'AUDIENCE_LIST_UPDATE_SUBSEGMENT_FLOW': {
            let {
                Campaign: { CanvasChannel },
            } = state;
            const { isAutoRefresh, isGroupCommunication, GroupedCampaignId, isSubsegmentJoureny, isCGTGEnabled } =
                action.payload?.data;
            let selectedAudienceList = action.payload?.data?.selectedAudienceList ?? [];
            let segmentationList = _filter(selectedAudienceList, 'segmentationListId').map((v) => v.segmentationListId);
            let listType = _filter(selectedAudienceList, 'listType').map((v) => v.listType);
            let recipientCount = _filter(selectedAudienceList, 'recipientCount').map((v) => v.recipientCount);
            let totalRecipientCount = _sum(recipientCount);

            //update audience count
            const otherNodes = state?.nodeState?.filter((node) => node.type !== 'SubSegmentItem');
            const subSegmentNodeList = state?.nodeState?.filter((node) => node.type === 'SubSegmentItem');

            const updateSegmentNodeList = subSegmentNodeList?.map((segment, index) => {
                return {
                    ...segment,
                    data: {
                        ...segment.data,
                        audienceCount: totalRecipientCount,
                        ...(isGroupCommunication && !state.dataSource[isGroupCommunication]
                            ? { priority: index + 1 }
                            : {}),
                    },
                };
            });

            let finalNodeList = [...otherNodes, ...updateSegmentNodeList];

            let updateState = {
                ...state,
                Campaign: {
                    ...state.Campaign,
                    PotentialRecipients: {
                        ...state.Campaign.PotentialRecipients,
                        Recipients: selectedAudienceList,
                    },
                },
                dataSource: {
                    ...state.dataSource,
                    ListType: listType,
                    DataList: segmentationList,
                    isAutoRefresh,
                    isGroupCommunication,
                    GroupedCampaignId,
                    isSubsegmentJoureny,
                    isCGTGEnabled: isCGTGEnabled ?? false,
                },
                ReceipientCount: totalRecipientCount,
                subSegment: {
                    ...state.subSegment,
                    subSegmentList: updateSegmentNodeList,
                },
            };
            return { ...updateState, nodeState: [...finalNodeList] };
        }

        case 'UPDATE_SUBSEGMENT_CHANGE': {
            const { isAutoRefresh, isGroupCommunication, GroupedCampaignId, isSubsegmentJoureny } =
                action?.payload?.data;
            let canvasJson = action.payload?.MDCTemplate?.canvasJson ?? action.payload?.MDCTemplate;
            let channelDeleteList = action.payload?.MDCTemplate?.channelDeleteList;
            let selectedAudienceList = action.payload?.data?.selectedAudienceList ?? [];
            let segmentationList = _filter(selectedAudienceList, 'segmentationListId').map((v) => v.segmentationListId);
            let listType = _filter(selectedAudienceList, 'listType').map((v) => v.listType);
            let recipientCount = _filter(selectedAudienceList, 'recipientCount').map((v) => v.recipientCount);
            let totalRecipientCount = _sum(recipientCount);

            const finalNodeList = canvasJson?.nodeState?.filter(
                (nodeState) => !channelDeleteList?.includes(nodeState.id),
            );

            let finalCanvasState;
            let nodeRslt = NodeFormatter(canvasJson);

            const matchSegmentList = nodeRslt.filter((node) => node.type === 'SubSegmentItem');

            finalCanvasState = {
                ...canvasJson,
                nodeState: [...nodeRslt],
                updatedCount: state.updatedCount,
                ReceipientCount: totalRecipientCount,
                subSegment: {
                    ...canvasJson.subSegment,
                    subSegmentList: [...matchSegmentList],
                },
                Campaign: {
                    ...state.Campaign,
                    PotentialRecipients: {
                        ...state.Campaign.PotentialRecipients,
                        Recipients: selectedAudienceList,
                    },
                    CanvasChannel: { ...state.Campaign.CanvasChannel, activeChannel: [], Placeholder: [] },
                },
            };
            if (action.payload?.dataSource) {
                finalCanvasState.dataSource = action.payload?.dataSource;
            }
            if (action.payload.SourceItem) {
                finalCanvasState.nodeState = [...finalCanvasState.nodeState, action.payload.SourceItem];
            }
            if (action.payload.subSegmentObj) {
                const subSegmentObj = {
                    ...action.payload.subSegmentObj,
                    data: {
                        ...action.payload.subSegmentObj.data,
                        audienceCount: totalRecipientCount,
                    },
                };
                finalCanvasState.nodeState = [...finalCanvasState.nodeState, subSegmentObj];
                finalCanvasState.subSegment = {
                    ...state.subSegment,
                    subSegmentList: [subSegmentObj],
                };
            }
            if (!action.payload.subSegmentObj) {
                if (action?.payload?.placeholderObj) {
                    finalCanvasState.Campaign.CanvasChannel.Placeholder = [action?.payload?.placeholderObj];
                    finalCanvasState.nodeState = [action.payload.SourceItem, action?.payload?.placeholderObj];
                }
                finalCanvasState.subSegment = {
                    ...canvasJson.subSegment,
                    subSegmentList: [],
                    IsSubSegmentSwitched: false,
                    switchCond: {
                        DomId: '',
                        SelectionMode: 'All',
                        Position: { left: '', top: '' },
                    },
                };
            }
            if (action?.payload?.data) {
                const { isCGTGEnabled } = action.payload?.data;
                finalCanvasState.dataSource = {
                    ...finalCanvasState.dataSource,
                    ListType: listType,
                    DataList: segmentationList,
                    isAutoRefresh,
                    isGroupCommunication,
                    GroupedCampaignId,
                    isSubsegmentJoureny,
                    isCGTGEnabled: isCGTGEnabled ?? false,
                };
            }

            if (!action.payload.subSegmentObj) {
                const edgeList = GenerateEdgeObject(finalCanvasState);
                return { ...finalCanvasState, edgeState: [...edgeList], updatedCount: state.updatedCount + 1 };
            }

            return finalCanvasState;
        }

        case 'UPDATE_NODESTATE': {
            let actionPayload = action.payload;
            const canvasState = _cloneDeep(state);
            canvasState.nodeState = actionPayload;
            return canvasState;
        }
        case 'UPDATE_CANVAS_ACTIVE_CHANNEL': {
            let actionPayload = action.payload;
            const canvasState = _cloneDeep(state);
            canvasState.Campaign.CanvasChannel.activeChannel = actionPayload;
            return canvasState;
        }

        case 'UPDATE_DISABLE_NODE_LIST': {
            let actionPayload = action.payload;
            const canvasState = _cloneDeep(state);
            canvasState.disableNodeList = actionPayload;
            return canvasState;
        }
        case 'UPDATE_CANVASE_STATE': {
            let actionPayloadCanvasState = action.payload;
            let cloneCanvasState = _cloneDeep(state);
            cloneCanvasState = {
                ...cloneCanvasState,
                ...actionPayloadCanvasState,
                updatedCount: state.updatedCount + 1,
            };
            return cloneCanvasState;
        }

        default:
            return state;
    }
};

export const UpdateRecursiveFlow = (recursiveTemplate, payload, elementItem) => {
    // debugger;
    let tempRecursiveTemplate = _cloneDeep(recursiveTemplate);

    const isJourney = recursiveTemplate?.dataSource?.isSubsegmentJoureny;
    const isGroupCommunication = recursiveTemplate?.dataSource?.isGroupCommunication;

    if (elementItem === 'ActionItem') {
        let params = payload;
        const {
            id,
            type,
            targetPosition,
            sourcePosition,
            position: { x, y },
            parentWindowId,
        } = params;
        let module = tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'];
        let moduleRslt = getModule(module, parentWindowId);
        moduleRslt['value']['Action']['Template'] = true;
        moduleRslt['value']['Action']['Position'] = { left: x, top: y };
        moduleRslt['value']['Action']['DomId'] = id;
    } else {
        let params =
            elementItem === 'AddOnItem' || elementItem === 'ParentAddOnItem' || elementItem === 'ParentAddOnItemUpdate'
                ? payload['addOnChannel']
                : payload;

        const {
            Campaign: {
                CanvasChannel: { activeChannel, channelEnteries, Placeholder },
            },
        } = tempRecursiveTemplate;
        let {
            id,
            data: { channelId, channelFriendlyName, parentWindowId, actionOption },
            position: { x, y },
        } = params;

        parentWindowId =
            elementItem === 'AddOnItem' || elementItem === 'ParentAddOnItem'
                ? payload['addOnEle']['data']['parentWindowId']
                : parentWindowId;

        let activeChannelLenth = activeChannel?.length;
        let tempChannel = Object.assign({}, channelEnteries);
        let tempChannelKeys = Object.keys(tempChannel);
        let dummyChannel = {};

        const handleLandingPageAddDetail = (goalChannelObj) => {
            const maxLenLPValue = channelId.split('goal00')[1];
            Object.assign(dummyChannel, {
                ...goalChannelObj,
                ChannelId: channelId,
                ChannelFriendlyName: channelFriendlyName,
                ChannelDetailType: `LP${maxLenLPValue}`,
            });
        };

        if (tempChannelKeys && tempChannelKeys?.length) {
            for (let key in tempChannel) {
                let obj = tempChannel[key];
                if (obj.ChannelId == channelId && !channelId?.includes('goal')) {
                    Object.assign(dummyChannel, obj);
                } else if (channelId?.includes('goal')) {
                    const goalChannelObj = _find(tempChannel, (key) => {
                        return key.Name?.includes('Landing page');
                    });
                    handleLandingPageAddDetail(goalChannelObj);
                }
            }
        }
        dummyChannel = {
            ...dummyChannel,
            Position: { left: x, top: y },
            DomId: id,
            ChannelFriendlyName: channelFriendlyName,
            IsSplitAbEnabled: false,
            addOnEnabled: false,
            addOnLevel: 1,
            actionOption,
            activeChannel: [],
        };
        let clone = _cloneDeep(dummyChannel);
        let modules = tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'];
        let positionObj = getModule(modules, parentWindowId);
        if (elementItem === 'AddOnItem') {
            clone = {
                ...clone,
                IsChannelSwitched: true,
                addOnEnabled: true,
                addOnLevel: 2,
                switchCond: {
                    DomId: payload['addOnEle']['id'],
                    Position: { left: payload['addOnEle']['position']['x'], top: payload['addOnEle']['position']['y'] },
                    SelectionMode: 'All',
                },
            };

            positionObj['value']['activeChannel'].forEach((item, index) => {
                if (item.DomId === payload['exChannel']['id']) {
                    positionObj['value']['activeChannel'][index] = {
                        ...item,
                        IsChannelSwitched: true,
                        Position: {
                            left: payload['exChannel']['position']['x'],
                            top: payload['exChannel']['position']['y'],
                        },
                        addOnEnabled: true,
                        addOnLevel: 1,
                        switchCond: {
                            DomId: payload['addOnEle']['id'],
                            Position: {
                                left: payload['addOnEle']['position']['x'],
                                top: payload['addOnEle']['position']['y'],
                            },
                            SelectionMode: 'All',
                        },
                    };
                    clone = { ...clone, actionOption: item['actionOption'] };
                }
            });
        } else if (elementItem === 'ParentAddOnItem') {
            tempRecursiveTemplate['Campaign']['CanvasChannel'] = {
                ...tempRecursiveTemplate['Campaign']['CanvasChannel'],
                IsChannelSwitched: true,
                switchCond: {
                    DomId: payload['addOnEle']['id'],
                    SelectionMode: 'All',
                    Position: { left: payload['addOnEle']['position']['x'], top: payload['addOnEle']['position']['y'] },
                },
            };
            tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'].forEach((item, index) => {
                if (item.DomId === payload['exChannel']['id']) {
                    tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'][index] = {
                        ...item,
                        Position: {
                            left: payload['exChannel']['position']['x'],
                            top: payload['exChannel']['position']['y'],
                        },
                    };
                }
            });
        }
        if (channelId !== 'ch003') {
            let tempPlaceholder = Placeholder.filter((phItem) => phItem.id !== id);
            tempRecursiveTemplate['Campaign']['CanvasChannel']['Placeholder'] = tempPlaceholder;
        }
        if (activeChannelLenth === 0) {
            //sub segment flow
            if (isJourney) {
                clone = {
                    ...clone,
                    subSegmentLevel: payload?.data?.subSegmentLevel,
                    parentWindowId: payload?.data?.parentWindowId,
                    audienceCount: payload?.data?.audienceCount,
                };
                tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'].push(clone);
            } else {
                tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'].push(clone);
            }
        } else if (
            activeChannelLenth &&
            (elementItem === 'ParentAddOnItem' || elementItem === 'ParentAddOnItemUpdate')
        ) {
            if (isJourney) {
                clone = {
                    ...clone,
                    subSegmentLevel: params?.data?.subSegmentLevel,
                    audienceCount: params?.data?.audienceCount,
                };
                tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'].push(clone);
            } else {
                tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'].push(clone);
            }
        } else {
            // let modules = recursiveTemplate['Campaign']['CanvasChannel']['activeChannel'];
            // let positionObj = getModule(modules, parentWindowId);
            if (isJourney && !params?.data?.isNestedLevelActiveChannel) {
                clone = {
                    ...clone,
                    subSegmentLevel: params?.data?.subSegmentLevel,
                    parentWindowId: params?.data?.parentWindowId,
                    audienceCount: params?.data?.audienceCount,
                };
                tempRecursiveTemplate['Campaign']['CanvasChannel']['activeChannel'].push(clone);
            } else {
                clone = {
                    ...clone,
                    subSegmentLevel: params?.data?.subSegmentLevel,
                };
                positionObj['value']['activeChannel'].push(clone);
            }
        }
    }
    return tempRecursiveTemplate;
};
export const GenerateNodePositionForAddon = (currentChannel) => {
    const {
        id,
        position: { x, y },
    } = currentChannel;
    let xPos = parseInt(x, 10) + 200;
    let exYpos = parseInt(y, 10) - 150;
    let yPos = parseInt(y, 10) + 150;
    let addOnYPos = parseInt(y, 10) + 20;

    return {
        addonElePosition: { x, y: addOnYPos },
        existingChannelPosition: { x: xPos, y: exYpos },
        newChannelPosition: { x: xPos, y: yPos },
    };
};
export const GenerateNodeId = (canvasState, optionList = []) => {
    const {
        Campaign: {
            CanvasChannel: { activeChannel },
        },
    } = canvasState;
    let channelList = canvasState['Campaign']['CanvasChannel']['activeChannel'];
    let allConnectionIdList = [],
        lastElementId = 0,
        nodeId = [];
    if (
        canvasState['Campaign']['CanvasChannel'].hasOwnProperty('switchCond') &&
        canvasState['Campaign']['CanvasChannel']['IsChannelSwitched']
    ) {
        allConnectionIdList = [...allConnectionIdList, canvasState['Campaign']['CanvasChannel']['switchCond']['DomId']];
    }
    if (activeChannel?.length) {
        eachDeep(
            channelList,
            (child, i, parent, ctx) => {
                if (child.hasOwnProperty('DomId')) {
                    allConnectionIdList = [...allConnectionIdList, child['DomId']];
                }
                if (child['Action'].hasOwnProperty('DomId')) {
                    allConnectionIdList = [...allConnectionIdList, child['Action']['DomId']];
                }
            },
            { childrenPath: 'activeChannel' },
        );

        if (
            canvasState['Campaign']['CanvasChannel'].hasOwnProperty('Placeholder') &&
            canvasState['Campaign']['CanvasChannel']['Placeholder']?.length
        ) {
            canvasState['Campaign']['CanvasChannel']['Placeholder'].forEach((pHolderItem) => {
                allConnectionIdList = [...allConnectionIdList, pHolderItem['id']];
            });
        }
    }

    if (
        canvasState['Campaign']['CanvasChannel'].hasOwnProperty('Placeholder') &&
        canvasState['Campaign']['CanvasChannel']['Placeholder'].length
    ) {
        canvasState['Campaign']['CanvasChannel']['Placeholder'].forEach((pHolderItem) => {
            allConnectionIdList = [...allConnectionIdList, pHolderItem['id']];
        });
    }

    if (!canvasState['dataSource']['DomId'] && !activeChannel.length) {
        lastElementId = 0;
    }

    // //Only for Qr channel in first level
    // if (allConnection?.length == 0 && canvasState['dataSource']['DomId'] == '' && activeChannel?.length > 0) {
    //     let tempId = activeChannel[0]['DomId'].split("flowchartWindow")[1];
    //     lastElementId = parseInt(tempId);
    // }
    if (canvasState['dataSource']['DomId'] != '') {
        //let tempId = canvasState['dataSource']['DomId'].split("flowchartWindow")[1];
        allConnectionIdList = [...allConnectionIdList, canvasState['dataSource']['DomId']];
    }

    const subSegmentAvailableIds = mapDeep(
        canvasState?.subSegment?.subSegmentList,
        (value, key) => (key === 'id' ? value : undefined),
        { leavesOnly: true },
    ).filter(Boolean);
    allConnectionIdList = [...allConnectionIdList, ...subSegmentAvailableIds];

    if (allConnectionIdList?.length) {
        let idList = allConnectionIdList.map((item) => item && parseInt(item.split('flowchartWindow')[1], 10));
        lastElementId = Math.max(...idList);
    }

    if (optionList?.length === 0) {
        nodeId = [`flowchartWindow${lastElementId + 1}`.toString()];
    } else if (optionList?.length > 0) {
        optionList.forEach((optionItem, index) => {
            let tempId = parseInt(index, 10) + 1;
            nodeId = [...nodeId, `flowchartWindow${tempId + lastElementId}`.toString()];
        });
    }

    return nodeId;
};

export const GenerateNodeIdForAddon = (canvasState, type) => {
    let nodeId = [];
    if (type === 'sub') {
        let nodeIdString = GenerateNodeId(canvasState);
        let splitNodeIdString = nodeIdString[0].split('flowchartWindow');
        let id = parseInt(splitNodeIdString[1], 10);

        nodeId = [`flowchartWindow${id}`.toString(), `flowchartWindow${1 + id}`.toString()];
    }
    return nodeId;
};

export const chennalUiConfig = [
    {
        id: '1',
        channelId: 'ch001',
        channelName: 'Email',
        channelActionName: 'Email action',
        channelColorCode: '#fc6a00',
        channelColorClassName: '',
        channelBgClassName: 'bg-email',
        icon: 'email_xlarge',
    },
    {
        id: '2',
        channelId: 'ch002',
        channelName: 'SMS',
        channelActionName: 'SMS action',
        channelColorCode: '#dfb82b',
        channelColorClassName: '',
        channelBgClassName: 'bg-sms',
        icon: 'mobile_sms_xlarge',
    },
    {
        id: '3',
        channelId: 'ch008',
        channelName: 'Web push',
        channelActionName: 'Web push action',
        channelColorCode: '#5ba529',
        channelColorClassName: '',
        channelBgClassName: 'bg-web-push',
        icon: 'notification_xlarge',
    },
    {
        id: '4',
        channelId: 'ch0014',
        channelName: 'Mobile push',
        channelActionName: 'Mobile push action',
        channelColorCode: '#99cc03',
        channelColorClassName: '',
        channelBgClassName: 'bg-mobile-push',
        icon: 'mobile_notification_xlarge',
    },
    {
        id: '5',
        channelId: 'ch0025',
        channelName: 'VMS',
        channelActionName: 'VMS action',
        channelColorCode: '#008489',
        channelColorClassName: '',
        channelBgClassName: 'bg-vms',
        icon: 'social_vms_xlarge',
    },
    {
        id: '6',
        channelId: 'ch0026',
        channelName: 'Call center',
        channelActionName: 'Call center action',
        channelColorCode: '#33b5e6',
        channelColorClassName: '',
        channelBgClassName: 'bg-call-center',
        icon: 'user_call_center_xlarge',
    },
    {
        id: '7',
        channelId: 'ch003',
        channelName: 'QR code',
        channelActionName: 'QR code action',
        channelColorCode: '#666666',
        channelColorClassName: '',
        channelBgClassName: 'bg-qr-code',
        icon: 'qrcode_xlarge',
    },
    {
        id: '8',
        channelId: 'ch0021',
        channelName: 'WhatsApp',
        channelActionName: 'WhatsApp action',
        channelColorCode: '#009c00',
        channelColorClassName: '',
        channelBgClassName: 'bg-whatsapp',
        icon: 'social_whatsapp_xlarge',
    },
    {
        id: '8',
        channelId: 'ch0041',
        channelName: 'RCS',
        channelActionName: 'RCS action',
        channelColorCode: '#1d9bf0',
        channelColorClassName: '',
        channelBgClassName: 'bg-rcs-message',
        icon: 'messaging_rcs_large',
    },
    {
        id: '9',
        channelId: 'ch0034',
        channelName: 'Webhook',
        channelActionName: 'Webhook action',
        channelColorCode: '#1b2d66',
        channelColorClassName: '',
        channelBgClassName: 'bg-webhook',
        icon: 'webhook_xlarge',
    },
    {
        id: '10',
        channelId: 'Recipient',
        channelName: 'Recipient',
        channelActionName: 'Recipient',
        channelColorCode: '#2a79c2',
        channelColorClassName: '',
        channelBgClassName: '',
        icon: '',
    },
    {
        id: '11',
        channelId: 'DynamicList',
        channelName: 'DynamicList',
        channelActionName: 'DynamicList',
        channelColorCode: '#b26aae',
        channelColorClassName: '',
        channelBgClassName: '',
        icon: '',
    },

    {
        id: '12',
        channelId: 'goal001',
        channelName: 'Landing page',
        channelActionName: 'Landing page action',
        channelColorCode: '#804097',
        channelColorClassName: '',
        channelBgClassName: 'bg-landing-page',
        icon: 'landing_page_xlarge',
    },
    {
        id: '13',
        channelId: 'goal002',
        channelName: 'Landing page',
        channelActionName: 'Landing page action',
        channelColorCode: '#804097',
        channelColorClassName: '',
        channelBgClassName: 'bg-landing-page',
        icon: 'landing_page_xlarge',
    },
];

export const GetChannelStyleAttributes = (channelId) => {
    let finalChannel = channelId?.includes('goal') ? 'goal001' : channelId;
    let channelAction = chennalUiConfig.filter((item) => item.channelId === finalChannel)[0];
    return channelAction;
};

export const GenerateNodePosition = (params) => {
    const isJourney = params?.nodes?.dataSource?.isSubsegmentJoureny;
    const { nodes, currentNodeId, type, optionList, diff, isLPClickActionContains } = params;
    let position = [];
    if (type === 'src' || type === 'qr') {
        // let yPos = parseInt(window.screen.height / 2) - 100 || 400;
        let yPos = parseInt(document.querySelectorAll('.mdc-right-wrapper ')[0].offsetHeight / 2, 10) - 33 || 300;
        position = [{ x: 66, y: yPos }];
    } else if (nodes && Object.keys(nodes)?.length && type === 'srcItem' && currentNodeId && !optionList) {
        const {
            dataSource: {
                DomId,
                Position: { left, top },
            },
        } = nodes;
        let xPos = parseInt(left, 10) + 170;
        let yPos = parseInt(top, 10) - 0.5;
        position = [{ x: xPos, y: yPos }];
    } else if (nodes && Object.keys(nodes)?.length && type === 'sub' && currentNodeId && !optionList) {
        let module = nodes['Campaign']['CanvasChannel']['activeChannel'];
        let moduleRslt = getModule(module, currentNodeId);
        let parentNode = moduleRslt['value'];
        const {
            Position: { left, top },
        } = parentNode;
        let xPos = parseInt(left, 10) + 150;
        let yPos = parseInt(top, 10) + 40;
        position = [{ x: xPos, y: yPos }];
    } else if (nodes && Object.keys(nodes)?.length && type === 'sub' && optionList && optionList?.length) {
        let module = nodes['Campaign']['CanvasChannel']['activeChannel'];
        let moduleRslt = getModule(module, currentNodeId);
        // let parentNode = moduleRslt['value']['Action'];
        let parentNode = moduleRslt['value'];
        const {
            Position: { left, top },
        } = parentNode;
        let xPos = parseInt(left, 10) + 200;
        optionList.forEach((optionItem, index) => {
            let yPos =
                (optionList?.length > 1 || isLPClickActionContains) && index == 0
                    ? parseInt(top, 10) - 150
                    : optionList?.length > 1 && index == 1
                    ? parseInt(top, 10) + 150
                    : parseInt(top, 10);
            yPos = (diff && parseInt(yPos, 10) + 150) || yPos;
            position = [...position, { x: xPos, y: yPos }];
        });
    } else if (nodes && Object.keys(nodes)?.length && type === 'rootChannelAddon') {
        const {
            Campaign: {
                CanvasChannel: { activeChannel },
            },
        } = nodes;

        if (isJourney) {
            if (activeChannel.length > 0 && activeChannel.length <= 20) {
                const {
                    Position: { left, top },
                } = activeChannel[activeChannel.length - 1];
                position = [{ x: left, y: parseInt(top, 10) + 100 }];
            }
        } else {
            if (activeChannel.length > 0) {
                const lastChannel = activeChannel[activeChannel.length - 1];
                const {
                    Position: { left, top },
                } = lastChannel;
                position = [{ x: left, y: parseInt(top, 10) + 100 }];
            }
        }
    } else if (nodes && Object.keys(nodes).length && type === 'rootSubSegmentAddon') {
        const {
            subSegment: { subSegmentList },
        } = nodes;

        const subSegmentNode = nodes?.nodeState?.filter((node) => node.type === 'SubSegmentItem');

        if (subSegmentNode.length > 0 && subSegmentNode.length <= 10) {
            const {
                position: { x, y },
            } = subSegmentNode[subSegmentNode.length - 1];
            const parsedY = parseInt(y, 10);
            position = [{ x: x ?? 0, y: (Number.isFinite(parsedY) ? parsedY : 0) + 100 }];
        } else {
            const { left, top } = nodes?.dataSource?.Position ?? {};
            const xPos = parseInt(left, 10);
            const yPos = parseInt(top, 10);
            if (Number.isFinite(xPos) && Number.isFinite(yPos)) {
                position = [{ x: xPos + 170, y: yPos }];
            }
        }
    }
    return position;
};

const isRun = getEnvironment() === 'RUN';

const TriggerActionListConfig = [
    {
        id: 5,
        name: 'Delivered',
        label: 'Delivered',
        value: 5,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch001', 'ch002', 'ch008', 'ch0021', 'ch0041'],
    },
     {
        id: 55,
        name: 'Rejected',  
        label: 'Rejected',
        value: 55,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: isRun ? ['ch0041'] : ['ch0021', 'ch0041'],
    },
    {
        id: 6,
        name: 'Undelivered',
        label: 'Undelivered',
        value: 6,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch001', 'ch002', 'ch0021', 'ch0041'],
    },
    {
        id: 1,
        name: 'Opened',
        label: 'Opened',
        value: 1,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch001'],
    },
    {
        id: 2,
        name: 'Didnotopen',
        label: 'Did not open',
        value: 2,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch001'],
    },
    {
        id: 3,
        name: 'Clicked',
        label: 'Clicked',
        value: 3,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch001', 'ch002', 'ch008', 'ch0014', 'ch0021', 'ch0041'],
    },
    {
        id: 4,
        name: 'Didnotclick',
        label: 'Did not click',
        value: 4,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch001', 'ch002', 'ch008', 'ch0014', 'ch0021', 'ch0041'],
    },
    {
        id: 99,
        name: 'Sent',
        label: 'Sent',
        value: 99,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: [],
    },
    {
        id: 21,
        name: 'Registered',
        label: 'Registered',
        value: 21,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['goal001', 'goal002'],
    },
    {
        id: 22,
        name: 'Notregistered',
        label: 'Not registered',
        value: 22,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch008', 'goal001', 'goal002'],
    },
    {
        id: 37,
        name: 'Success',
        label: 'Success',
        value: 37,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0025'],
    },
    {
        id: 38,
        name: 'Userbusy',
        label: 'User busy',
        value: 38,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0025'],
    },
    {
        id: 39,
        name: 'Disconnected',
        label: 'Disconnected',
        value: 39,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0025'],
    },
    {
        id: 40,
        name: 'Ringtimeout',
        label: 'Ring timeout',
        value: 40,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0025'],
    },
    {
        id: 41,
        name: 'Notreachable',
        label: 'Not reachable',
        value: 41,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0025'],
    },
    {
        id: 42,
        name: 'Expired',
        label: 'Expired',
        value: 42,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: [], // Feedback by Bhuvanesh, Balaji
    },
    {
        id: 45,
        name: 'Received',
        label: 'Received',
        value: 45,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0014'],
    },
    {
        id: 43,
        name: 'Dismissed',
        label: 'Dismissed',
        value: 43,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0014'],
    },
    {
        id: 44,
        name: 'Maybelater',
        label: 'Maybe later',
        value: 44,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0014'],
    },
    {
        id: 47,
        name: 'DidNotReceived',
        label: 'Did not receive',
        value: 47,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0014'],
    },
    {
        id: 48,
        name: 'Scanned',
        label: 'Scanned',
        value: 48,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch003'],
    },
    {
        id: 49,
        name: 'Read',
        label: 'Seen',
        value: 49,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0021', 'ch0041'],
    },
    {
        id: 50,
        name: 'Responded',
        label: 'Responded',
        value: 50,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: [],
    },
    {
        id: 51,
        name: 'Blocked',
        label: 'Blocked',
        value: 51,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0021', 'ch0041'],
    },
    {
        id: 52,
        name: 'Reported',
        label: 'Reported',
        value: 52,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0021', 'ch0041'],
    },
    {
        id: 53,
        name: 'NotRead',
        label: 'Not read',
        value: 53,
        durType: '',
        durVal: '',
        durDate: '',
        checked: false,
        attributeSelect: false,
        channelIdList: ['ch0021', 'ch0041'],
    },
];

export const GetTriggerActionList = (channelId) => {
    let finalChannelId = channelId?.includes('goal') ? 'goal001' : channelId;
    const triggerActionList = TriggerActionListConfig.filter((item) => item['channelIdList'].includes(finalChannelId));
    return triggerActionList;
};

export const getParentNodes = (nodeId, nodes, edges) => {
    const parentNodes = [];

    edges.forEach((edge) => {
        if (edge.target === nodeId) {
            const parentNode = nodes.find((node) => node.id === edge.source);
            if (parentNode) {
                parentNodes.push(parentNode);
            }
        }
    });

    return parentNodes;
};

export const ReacctFlowNodeFormatter = (currentState, payload, formatType = '') => {
    const {
        Campaign: {
            CanvasChannel: { activeChannel },
            PotentialRecipients: { Recipients },
        },
        dataSource,
        subSegment,
    } = currentState;
    const {
        DataList,
        DomId,
        ListType,
        Position: { top, left },
        Type,
        ElementType,
        CssClass,
        sourcePosition,
        isSubsegmentJoureny,
    } = dataSource;
    let formattedNode = [],
        srcItemDomId = DomId;
    if (DomId && ElementType === 'Placeholder' && !formatType && activeChannel?.length === 0) {
        formattedNode = [
            {
                id: DomId,
                type: ElementType,
                position: { x: left, y: top },
                data: { nodeId: DomId, parentWindowId: 0, label: 'Drop here' },
                className: CssClass,
            },
        ];
    }
    if (
        DomId &&
        (ElementType === 'SourceItem' || ElementType === 'DynamicItem') &&
        !formatType &&
        activeChannel?.length === 0
    ) {
        formattedNode = [
            {
                id: DomId,
                type: ElementType,
                position: { x: left, y: top },
                sourcePosition: sourcePosition,
                data: { nodeId: DomId, parentWindowId: 0 },
                className: CssClass,
            },
        ];
    }

    if (activeChannel.length >= 0 && formatType === 'subSegment') {
        formattedNode = [
            {
                ...payload.subSegmentObj,
            },
        ];
    }

    if (activeChannel.length >= 0 && formatType === 'emptyEle') {
        const {
            Campaign: { CanvasChannel },
        } = currentState;
        formattedNode = [...CanvasChannel['Placeholder']];
    } else if (activeChannel?.length >= 0 && formatType === 'rootAddon') {
        const {
            Campaign: { CanvasChannel },
        } = currentState;
        let placeholder = CanvasChannel.Placeholder.filter((item) => item.data.elementAddOnType === 'rootAddon');
        formattedNode = [...placeholder];
    } else if (activeChannel?.length > 0) {
        let moduleRslt = getModule(activeChannel, payload.id);
        if (moduleRslt && Object.keys(moduleRslt)?.length && formatType === 'ActionItem') {
            if (moduleRslt['value']['Action']['Template']) {
                const {
                    DomId,
                    Name,
                    Position: { left, top },
                } = moduleRslt['value']['Action'];
                let channelAction = {
                    id: DomId,
                    type: 'ActionItem',
                    sourcePosition: 'right',
                    targetPosition: 'left',
                    position: { x: left, y: top },
                    data: {
                        actionName: Name,
                        currentWindowId: DomId,
                        nodeId: DomId,
                        channelId: moduleRslt['value']['ChannelId'],
                        parentWindowId: payload.parentWindowId,
                    },
                    className: 'res-mdc-actionItem',
                };
                formattedNode = [channelAction];
            }
        } else if (moduleRslt && Object.keys(moduleRslt)?.length) {
            let value = moduleRslt['value'];
            let levelNumber = moduleRslt['context']['_item']['depth'];
            let parentValue = levelNumber === 1 ? moduleRslt['parent'][0] : moduleRslt['parent'];
            const {
                DomId,
                Position: { left, top },
                ChannelId,
                addOnEnabled,
                actionOption,
                ChannelFriendlyName,
                IsSplitAbEnabled,
                addOnLevel = 0,
                subSegmentLevel,
                audienceCount,
                parentWindowId,
            } = value;

            //sub segment flow
            // let findSegmentNodeItem = _find(currentState?.nodeState, { type: 'subSegmentItem' });

            let updateParentWindowId;

            if (isSubsegmentJoureny) {
                if (parentWindowId) {
                    updateParentWindowId = parentWindowId;
                } else if (value['DomId'] === parentValue['DomId']) {
                    updateParentWindowId = srcItemDomId;
                } else {
                    updateParentWindowId = parentValue['DomId'];
                }
            } else {
                updateParentWindowId = value['DomId'] === parentValue['DomId'] ? srcItemDomId : parentValue['DomId'];
            }
            let ElementType = ChannelId.includes('goal00') ? 'GoalItem' : 'ChannelItem';

            let sourcePosition = 'right';
            let targetPosition = 'left';
            let action = actionOption ? true : false;
            let edgeEndLabel = actionOption ? actionOption : '';
            let sourceHandle = addOnEnabled ? `A${addOnLevel}` : '';
            const UpdateAudienceCount =
                levelNumber === 1
                    ? isSubsegmentJoureny
                        ? audienceCount
                        : GetAudienceBasedOnChannel(ChannelId, Recipients)
                    : {};

            let isSplitAb = IsSplitAbEnabled && levelNumber === 1 ? IsSplitAbEnabled : false;
            let { channelBgClassName, icon, channelColorCode } = GetChannelStyleAttributes(ChannelId);
            formattedNode = [
                {
                    id: DomId,
                    type: ElementType,
                    position: { x: left, y: top },
                    sourcePosition,
                    targetPosition,
                    levelNumber,
                    data: {
                        action,
                        parentWindowId: updateParentWindowId,
                        currentWindowId: DomId,
                        nodeId: DomId,
                        channelId: ChannelId,
                        channelIcon: icon,
                        channelBgClassName,
                        channelFriendlyName: ChannelFriendlyName,
                        sourceHandle,
                        channelColorCode,
                        audienceCount: UpdateAudienceCount,
                        edgeEndLabel,
                        isSplitAb,
                        subSegmentLevel,
                    },
                    className: ChannelId.includes('goal00') ? 'goal-item-dropped' : 'channel-item-dropped',
                },
            ];
        }
    }
    return formattedNode;
};

export const GetAudienceBasedOnChannel = (channelId, recipients) => {
    let count = 0;
    const excludeChannelList = ['ch008', 'ch0014']; //All and known audience exclude channel list
    const excludeSegmentList = [-1, -2]; //All and known audience exclude segment list
    if (
        excludeChannelList.includes(channelId) &&
        recipients?.[0]?.['listType'] === 1 &&
        excludeSegmentList.includes(recipients?.[0]?.['segmentationListId'])
    ) {
        return true;
    }
    switch (channelId) {
        case 'ch001':
            count = _reduce(recipients, (prev, cur) => prev + cur.recipientCountEmail, 0);
            break;
        case 'ch002':
            count = _reduce(recipients, (prev, cur) => prev + cur.recipientCountMobile, 0);
            break;
        case 'ch008':
            count = _reduce(recipients, (prev, cur) => prev + cur.recipientCountWebPush, 0);
            break;
        case 'ch0014':
            count = _reduce(recipients, (prev, cur) => prev + cur.recipientCountMobilePush, 0);
            break;
        case 'ch0021':
            count = _reduce(recipients, (prev, cur) => prev + cur.recipientCountWhatsApp, 0);
            break;
        case 'ch0025':
            count = _reduce(recipients, (prev, cur) => prev + cur.recipientCountVMS, 0);
            break;
        case 'ch0041':
            count = _reduce(recipients, (prev, cur) => prev + cur.recipientCountRCS, 0); //Whatsapp count for RCS on feedback - Rayan
    }
    return count;
};

export const NodeFormatter = (tmpJson) => {
    // debugger;
    const mdcTemplate = _cloneDeep(tmpJson);
    // console.log('mdcTemplate', mdcTemplate);
    const isGroupCommunication = tmpJson?.dataSource?.isGroupCommunication;
    const {
        Campaign: {
            CanvasChannel: { activeChannel, Placeholder, IsChannelSwitched, switchCond },
            PotentialRecipients: { Recipients },
        },
        dataSource,
        nodeState,
        subSegment,
        MdcType,
    } = mdcTemplate;
    const {
        DataList,
        DomId,
        ListType,
        Position: { top, left },
        Type,
    } = dataSource;
    let elementType = Type === 'Recipient' ? 'SourceItem' : Type === 'DynamicList' ? 'DynamicItem' : null;
    let nodeFormat = [];
    if (elementType) {
        nodeFormat = [
            {
                id: DomId,
                type: elementType,
                sourcePosition: 'right',
                position: { x: left, y: top },
                data: { nodeId: DomId, parentWindowId: 0 },
                className: elementType ? 'source-item-dropped' : 'dynamic-item-dropped',
            },
        ];
    }

    const handleParentWindowIdInSubSegementFlow = (currentActiveChannel) => {
        const matchSubSegmentList = subSegment?.subSegmentList?.find(
            (subSegmentList) => subSegmentList.data.subSegmentLevel === currentActiveChannel.subSegmentLevel,
        );
        return matchSubSegmentList?.id;
    };

    const updateFriendlyName = (friendlyName, currentSegmentLevel) => {
        const subSegmentPattern = /\{SubSegment/;
        if (!subSegmentPattern.test(friendlyName)) {
            return friendlyName;
        }
        const numberPattern = /\{SubSegment(\d*)\}/;
        const match = friendlyName.match(numberPattern);

        if (match) {
            const numberPart = match[1];
            if (numberPart) {
                const number = parseInt(numberPart, 10);
                if (number === currentSegmentLevel) {
                    return friendlyName;
                } else {
                    return `{SubSegment${currentSegmentLevel}}`;
                }
            } else {
                return friendlyName;
            }
        } else {
            return friendlyName;
        }
    };

    let rootWindowId = DomId,
        loopCount = 0;
    const handleList = ['A1', 'A2', 'A3', 'A4'];
    if (IsChannelSwitched && !dataSource?.isSubsegmentJoureny) {
        const {
            DomId,
            Position: { left, top },
            SelectionMode,
        } = switchCond;
        let addonElementItem = {
            id: DomId,
            type: 'AddonItem',
            sourcePosition: ['top', 'bottom'],
            targetPosition: 'left',
            position: { x: left, y: top },
            data: {
                action: false,
                parentWindowId: rootWindowId,
                currentWindowId: DomId,
                nodeId: DomId,
                //edgeEndLabel: actionOption,
                SelectionMode,
            },
        };
        nodeFormat = [...nodeFormat, addonElementItem];
        rootWindowId = DomId;
    }
    // if (dataSource?.isSubsegmentJoureny && subSegment?.IsSubSegmentSwitched) {
    //     const {
    //         DomId,
    //         Position: { left, top },
    //         SelectionMode,
    //     } = subSegment?.switchCond;
    //     let addonElementItem = {
    //         id: DomId,
    //         type: 'AddonItem',
    //         sourcePosition: ['top', 'bottom'],
    //         targetPosition: 'left',
    //         position: { x: left, y: top },
    //         data: {
    //             action: false,
    //             parentWindowId: rootWindowId,
    //             currentWindowId: DomId,
    //             nodeId: DomId,
    //             //edgeEndLabel: actionOption,
    //             SelectionMode,
    //         },
    //     };
    //     nodeFormat = [...nodeFormat, addonElementItem];
    // }

    let finalSubSegmentNodeList;

    const sortSubSegmentList = sortSubSegmentListByLevel(subSegment?.subSegmentList ?? []);

    if (subSegment?.subSegmentList?.length > 1) {
        finalSubSegmentNodeList = sortSubSegmentList?.map((subSegmentItem, index) => {
            const currentSegmentLevel = index + 1;

            const maxFindPriority = _maxBy(sortSubSegmentList, 'data.priority');
            const maxPriority = maxFindPriority.data.priority;

            const currentPriority =
                maxPriority === subSegment?.subSegmentList?.length
                    ? subSegmentItem?.data?.priority
                    : currentSegmentLevel;

            return {
                ...subSegmentItem,
                data: {
                    ...subSegmentItem.data,
                    parentWindowId: dataSource?.DomId,
                    sourceHandle: handleList[Math.min(currentSegmentLevel - 1, handleList.length - 1)] ?? 'A4',
                    subSegmentLevel: currentSegmentLevel,
                    priority: currentPriority,
                    friendlyName: updateFriendlyName(subSegmentItem.data.friendlyName, currentSegmentLevel),
                },
            };
        });
    } else {
        finalSubSegmentNodeList = sortSubSegmentList?.map((subSegment, index) => {
            const currentSegmentLevel = index + 1;

            return {
                ...subSegment,
                data: {
                    ...subSegment.data,
                    parentWindowId: dataSource?.DomId,
                    sourceHandle: 'A1',
                    subSegmentLevel: currentSegmentLevel,
                    priority: currentSegmentLevel,
                    // friendlyName: `{Subsegment${currentSegmentLevel}}`,
                },
            };
        });
    }

    nodeFormat = [...nodeFormat, ...finalSubSegmentNodeList];

    const segmentLevelCounts = tmpJson?.Campaign?.CanvasChannel?.activeChannel?.reduce((levelCounts, currentValue) => {
        if (levelCounts.hasOwnProperty(currentValue.subSegmentLevel)) {
            levelCounts[currentValue.subSegmentLevel] += 1;
        } else {
            levelCounts[currentValue.subSegmentLevel] = 1;
        }
        return levelCounts;
    }, {});

    // exist activechannel in firstlevel addItem in nodelist flow

    const filterAddonItem = tmpJson?.nodeState?.filter(
        (node) => node.type === 'AddonItem' && node.data.subSegmentLevel,
    );

    const finalAddonItem = filterAddonItem?.filter((item) => {
        if (segmentLevelCounts[item.data.subSegmentLevel] > 1) {
            return {
                ...item,
            };
        }
    });

    nodeFormat = [...nodeFormat, ...finalAddonItem];

    const handleFindSegmentList = (currentActiveChannel) => {
        if (segmentLevelCounts[currentActiveChannel.subSegmentLevel] <= 1) {
            const matchSubSegmentList = subSegment?.subSegmentList?.find(
                (subSegmentList) => subSegmentList.data.subSegmentLevel === currentActiveChannel.subSegmentLevel,
            );
            const updateFinalSegment = finalSubSegmentNodeList?.find(
                (sortSubSegment) => sortSubSegment?.id === matchSubSegmentList?.id,
            );

            if (updateFinalSegment) {
                return updateFinalSegment;
            } else {
                return matchSubSegmentList || {};
            }
        } else {
            const matchAddonItem = finalAddonItem?.find(
                (addOnItem) => addOnItem.data.subSegmentLevel === currentActiveChannel.subSegmentLevel,
            );
            if (matchAddonItem) {
                return matchAddonItem;
            }
        }
    };

    let channelWiseActiveChannelCount = {};

    const handleParentWindowId = (depth, child, parent) => {
        if (dataSource?.isSubsegmentJoureny) {
            if (depth === 1) {
                return handleFindSegmentList(child)?.id ?? parent?.['DomId'];
            } else {
                return parent?.['DomId'];
            }
        } else {
            if (depth === 1) {
                return rootWindowId;
            } else {
                return parent?.['DomId'];
            }
        }
    };

    eachDeep(
        activeChannel,
        (child, i, parent, ctx) => {
            let parentWindowId = handleParentWindowId(ctx['_item']['depth'], child, parent);
            let {
                DomId,
                Name,
                ChannelFriendlyName,
                ChannelDetailID,
                ChannelDetailType,
                ChannelId,
                ContentThumbnailPath,
                ScheduleDate,
                T1,
                B1,
                C1,
                B2,
                AttributeSelect,
                TotalCount,
                addOnEnabled,
                Position: { left, top },
                Action,
                addOnLevel,
                LevelNumber,
                actionOption,
                IsSplitAbEnabled,
                isSubSegmentSave,
                audienceCount,
                subSegmentLevel,
            } = child;
            if (addOnEnabled) {
                let action = ctx['_item']['depth'] > 1 ? true : false;
                let {
                    switchCond: {
                        DomId,
                        Position: { left, top },
                        SelectionMode,
                    },
                    addOnLevel,
                } = child;
                let addonElementItem = {
                    id: DomId,
                    type: 'AddonItem',
                    sourcePosition: 'right',
                    targetPosition: 'left',
                    position: { x: left, y: top },
                    levelNumber: LevelNumber,
                    data: {
                        action,
                        parentWindowId: handleParentWindowId(ctx['_item']['depth'], child, parent),
                        currentWindowId: DomId,
                        nodeId: DomId,
                        edgeEndLabel: actionOption,
                        SelectionMode,
                        levelNumber: LevelNumber,
                        disabled: nodeState?.find((node) => node?.id === DomId)?.data?.disabled ?? false,
                        isSubSegmentSave: isSubSegmentSave ?? false,
                    },
                };
                nodeFormat = [...nodeFormat, addonElementItem];
            }
            let action = ctx['_item']['depth'] > 1 && !addOnEnabled ? true : false;
            let updateAudienceCount =
                ctx['_item']['depth'] === 1 ? audienceCount ?? GetAudienceBasedOnChannel(ChannelId, Recipients) : {};
            parentWindowId = addOnEnabled ? child['switchCond']['DomId'] : parentWindowId;
            let sourceHandle = addOnEnabled ? `A${addOnLevel}` : '';
            let { channelBgClassName, icon, channelColorCode } = GetChannelStyleAttributes(ChannelId);
            let isSplitAb = IsSplitAbEnabled && ctx['_item']['depth'] === 1 ? IsSplitAbEnabled : false;
            /*handle parent addon */
            if (IsChannelSwitched && ctx['_item']['depth'] === 1) {
                if (channelWiseActiveChannelCount.hasOwnProperty(subSegmentLevel)) {
                    channelWiseActiveChannelCount[subSegmentLevel] += 1;
                } else {
                    channelWiseActiveChannelCount[subSegmentLevel] = 1;
                }
                sourceHandle = handleList[channelWiseActiveChannelCount[subSegmentLevel] - 1] ?? 'A4';
            }
            /*handle parent addon */
            let childChannel = {
                id: DomId,
                type: ChannelId?.includes('goal') ? 'GoalItem' : 'ChannelItem',
                sourcePosition: 'right',
                targetPosition: 'left',
                position: { x: left, y: top },
                levelNumber: ctx['_item']['depth'],
                data: {
                    action,
                    parentWindowId,
                    currentWindowId: DomId,
                    nodeId: DomId,
                    channelId: ChannelId,
                    channelIcon: icon,
                    channelBgClassName,
                    channelFriendlyName: ChannelFriendlyName,
                    sourceHandle,
                    channelColorCode,
                    audienceCount: updateAudienceCount,
                    edgeEndLabel: actionOption,
                    isSplitAb,
                    TotalCount,
                    levelNumber: ctx['_item']['depth'],
                    disabled: nodeState?.find((node) => node?.id === DomId)?.data?.disabled ?? false,
                    isSubSegmentSave: isSubSegmentSave ?? false,
                    subSegmentLevel: handleFindSegmentList(child)?.data?.subSegmentLevel,
                },
                className: 'channel-item-dropped',
            };
            nodeFormat = [...nodeFormat, childChannel];
            if (Action['Template']) {
                let {
                    Name,
                    Template,
                    TemplateId,
                    ActionID,
                    ActionTime,
                    ActionTimeDuration,
                    Position: { left, top },
                    DomId,
                    chType,
                } = Action;
                let channelAction = {
                    id: DomId,
                    type: 'ActionItem',
                    sourcePosition: 'right',
                    targetPosition: 'left',
                    position: { x: left, y: top },
                    data: {
                        actionName: Name,
                        currentWindowId: DomId,
                        nodeId: DomId,
                        channelId: ChannelId,
                        parentWindowId: child['DomId'],
                        disabled: nodeState?.find((node) => node?.id === DomId)?.data?.disabled ?? false,
                        isSubSegmentSave: isSubSegmentSave ?? false,
                        subSegmentLevel: handleFindSegmentList(child)?.data?.segmentLevel,
                    },
                    className: 'res-mdc-actionItem',
                };
                nodeFormat = [...nodeFormat, channelAction];
            }
            loopCount++;
        },
        { childrenPath: 'activeChannel' },
    );

    if (Placeholder && Placeholder.length) {
        if (MdcType === 'RecursivelyTraverse') {
            let updatePlaceholder = Placeholder.map((pl) => {
                return {
                    id: pl.DomId,
                    type: 'Placeholder',
                    targetPosition: 'left',
                    sourcePosition: 'right',
                    style: {
                        visibilit: 'visible',
                    },
                    className: 'res-mdc-placeholder',
                    data: {
                        label: 'Drop here',
                        parentWindowId: pl.ActionId,
                        currentWindowId: pl.DomId,
                        action: pl?.actionOption?.length ? true : false,
                        actionOption: convertActionOption(pl),
                    },
                    position: { ...pl.Position },
                };
            });
            nodeFormat = [...nodeFormat, ...updatePlaceholder];
        } else {
            nodeFormat = [...nodeFormat, ...Placeholder];
        }
    }

    if (MdcType === 'RecursivelyTraverse') {
        nodeFormat = nodeFormat?.filter((node) => node.type !== 'ActionItem');
    }

    const goalNodes = nodeFormat.filter((node) => node.type === 'GoalItem');
    const otherNodes = nodeFormat.filter((node) => node.type !== 'GoalItem' && node.type !== 'GoalPlaceholder');
    const goalPlaceholderNodes = nodeFormat.filter((node) => node.type === 'GoalPlaceholder');
    nodeFormat = [...otherNodes, ...goalPlaceholderNodes, ...goalNodes];

    return nodeFormat;
};
export const convertActionOption = (plItem) => {
    return {
        name: '',
        label: '',
        value: '',
        durType: {},
        durVal: '',
        durDate: '',
        checked: '',
        attributeSelect: '',
        channelIdList: [],
        disabled: false,
    };
};
export const GetHandleType = (nodes, node) => {
    {
        let totalItem = nodes.filter((item) => {
            if (item?.data?.parentWindowId === node?.data?.parentWindowId) {
                return item;
            }
        });
        let isSourceItemExist = _filter(nodes, { id: node?.data?.parentWindowId, type: 'SourceItem' });
        let isDynamicItemExist = _filter(nodes, { id: node?.data?.parentWindowId, type: 'DynamicItem' });
        if (!totalItem || totalItem?.length === 0 || isSourceItemExist?.length || isDynamicItemExist?.length) {
            return 'single';
        } else if (totalItem?.length == 1) {
            return 'shandle';
        } else {
            return '';
        }
    }
};

export const GenerateEdgeObject = (canvasStateVal) => {
    const {
        nodeState,
        edgeState,
        Campaign: {
            CanvasChannel: { activeChannel },
        },
        disableNodeList,
        dataSource: { isSubsegmentJoureny },
    } = canvasStateVal;
    let tempIndex = 0;
    let edgeList = [];
    let tempLpEdge = [];
    let firstGoalCoversionDomId = '';
    nodeState.forEach((item, index) => {
        if (index > 0 && !item['data']['elementAddOnType']) {
            //console.log(disableNodeList, 'edgeitem_', item);
            // let edgeType = item.data.action || item?.levelNumber === 1 ? 'CustomEdge' : 'step';
            let edgeType = 'CustomEdge';
            let sourceHandle = item.data.sourceHandle ? item.data.sourceHandle : GetHandleType(nodeState, item);
            let color = getColorCode(item['data']['parentWindowId'], canvasStateVal);
            color = !color ? 'red' : color;
            let markerEnd = { type: 'arrowclosed', width: '180px', height: '40px', color };
            let strokeDasharray = item.type === 'GoalPlaceholder' || item.type === 'GoalItem' ? '5 5' : '0,0';
            let label = '';
            let endLabel = {};
            if (item.data.action && item.type !== 'GoalPlaceholder' && item.type !== 'GoalItem') {
                let edgeEndLabel = item['data']['edgeEndLabel']
                    ? item['data']['edgeEndLabel']
                    : item['data']['actionOption']
                    ? item['data']['actionOption']
                    : '';
                if (edgeEndLabel && edgeEndLabel?.durVal && edgeEndLabel?.durDate) {
                    const { label, durType, durVal, durDate } = edgeEndLabel;
                    endLabel = {
                        actionName: label,
                        //dayOrHourText: `Wait for ${durVal} ${durType.dayOrHour}`,
                        dayOrHourText: `${durVal} ${durType?.dayOrHour}`,
                        //date: `(${getMMMDD(durDate)})`,
                        date: `${getDDMMMYYYY(durDate)}`,
                    };
                }
            }
            label =
                (item['levelNumber'] === 1 || item['data']['audienceCount']) &&
                typeof item['data']['audienceCount'] !== 'object'
                    ? item['data']['audienceCount']
                    : 0;
            let totalCount =
                item?.['levelNumber'] > 1 && item?.['data']?.['TotalCount'] ? item?.['data']?.['TotalCount'] : null;

            //console.log('EDGE TYPE',edgeType)
            let hidden = item.hasOwnProperty('hidden') && item.hidden === true ? true : false;
            let edg = {
                id: `edges-${index}`,
                source: `${item['data']['parentWindowId']}`,
                target: `${item['id']}`,
                sourceHandle,
                label,
                hidden,
                type: edgeType,
                markerEnd,
                style: {
                    stroke: color,
                    strokeWidth: 0.8,
                    strokeDasharray,
                    orient: '',
                    opacity: isSubsegmentJoureny
                        ? disableNodeList.includes(item['data']['parentWindowId'])
                            ? '0.2'
                            : 1
                        : 1,
                },
                animated: false,
                data: {
                    startLabel: totalCount,
                    endLabel,
                    levelNumber: item['levelNumber'],
                    label,
                },
                disabled: isSubsegmentJoureny ? disableNodeList.includes(item['data']['parentWindowId']) : false,
            };
            edgeList = [...edgeList, edg];

            // handle edge generate in LP flow

            const isValidLP = (currentModuleDetails) => {
                const {
                    LevelNumber: levelNumber,
                    ParentChannelDetailType: parentType,
                    actionOption,
                } = currentModuleDetails?.value || {};
                return (
                    (levelNumber > 1 && levelNumber < 7 && currentModuleDetails?.value?.activeChannel?.length > 0) ||
                    (levelNumber === 101 && parentType === 'LP1' && actionOption?.value === 22) ||
                    (levelNumber === 201 && parentType === 'LP2' && actionOption?.value === 22) ||
                    (levelNumber > 101 && levelNumber < 107) ||
                    (levelNumber === 1 && levelNumber === 6)
                );
            };
            const isValidGoalTypeLp = (currentModuleDetails) => {
                const {
                    LevelNumber: levelNumber,
                    ParentChannelDetailType: parentType,
                    actionOption,
                } = currentModuleDetails?.value || {};
                return (
                    (levelNumber >= 1 && levelNumber < 7) ||
                    (levelNumber === 101 && parentType === 'LP1' && actionOption?.value === 22)
                );
            };
            const isValidSourceTargetHandleType = (currentModuleDetails) => {
                const {
                    LevelNumber: levelNumber,
                    ParentChannelDetailType: parentType,
                    actionOption,
                } = currentModuleDetails?.value || {};
                return (
                    (levelNumber === 101 && parentType === 'LP1' && actionOption?.value === 22) ||
                    (levelNumber === 201 && parentType === 'LP2' && actionOption?.value === 22)
                );
            };

            const determineSourceHandle = (currentModuleDetails) =>
                isValidSourceTargetHandleType(currentModuleDetails) ? 'B1' : '';

            const determineTargetHandle = (currentModuleDetails) =>
                isValidSourceTargetHandleType(currentModuleDetails) ? 'B1' : 'T1';

            const createEdge = (sourceId, targetId, color, edgeList, currentModuleDetails) => ({
                id: `edges-${tempLpEdge?.length + 1}`,
                source: sourceId,
                target: targetId,
                sourceHandle: determineSourceHandle(currentModuleDetails),
                targetHandle: determineTargetHandle(currentModuleDetails),
                label: 0,
                hidden: false,
                type: 'CustomEdge',
                markerEnd: {
                    type: 'arrowclosed',
                    width: '180px',
                    height: '40px',
                    color: '#dfb82b',
                },
                style: {
                    stroke: color,
                    strokeWidth: 0.8,
                    strokeDasharray: '5 5',
                    orient: '',
                },
                animated: false,
                data: {
                    startLabel: null,
                    endLabel: {},
                    levelNumber: 0,
                    label: 0,
                },
            });

            const checkActiveChannelChildOrPlaceholder = (currentModuleDetails) => {
                if (currentModuleDetails?.value && currentModuleDetails?.value?.activeChannel?.length) {
                    return true;
                } else if (nodeState?.find((node) => node.data.parentWindowId === currentModuleDetails?.value?.DomId)) {
                    return true;
                } else {
                    return false;
                }
            };

            if (item.data && !['GoalPlaceholder', 'GoalItem'].includes(item.type)) {
                const currentModuleDetails = getModule(activeChannel, item.data.nodeId);
                const goalType = isValidGoalTypeLp(currentModuleDetails) ? 'goal001' : 'goal002';
                const isLPExist = checkLandingPageExist(activeChannel, goalType);
                firstGoalCoversionDomId =
                    isLPExist && goalType === 'goal001'
                        ? isLPExist?.value?.DomId
                        : firstGoalCoversionDomId || nodeState?.find((node) => node.type === 'GoalItem')?.id;
                const checkConditionOne =
                    !!isLPExist ||
                    (currentModuleDetails?.value?.LevelNumber &&
                        item.type === 'ChannelItem' &&
                        !currentModuleDetails?.value?.activeChannel?.some(
                            (active) => active?.ChannelDetailType === 'LP1',
                        ) &&
                        currentModuleDetails?.parent?.ChannelDetailType !== 'LP1');
                const isParentChannelOfLP =
                    !currentModuleDetails?.value?.activeChannel?.some(
                        (active) => active?.ChannelDetailType === 'LP1',
                    ) ||
                    (!currentModuleDetails?.value?.activeChannel?.some(
                        (active) => active?.ChannelDetailType === 'LP2',
                    ) &&
                        currentModuleDetails?.parent?.ChannelDetailType !== 'LP2');
                if (
                    checkConditionOne &&
                    (isValidLP(currentModuleDetails) ||
                        (currentModuleDetails?.value?.LevelNumber && item.type === 'ChannelItem')) &&
                    canvasStateVal?.CampaignGoal?.toLowerCase() === 'conversion' &&
                    isParentChannelOfLP &&
                    checkActiveChannelChildOrPlaceholder(currentModuleDetails)
                ) {
                    tempLpEdge.push(
                        createEdge(
                            currentModuleDetails?.value?.DomId,
                            isLPExist?.value?.DomId || firstGoalCoversionDomId || '',
                            '#804097',
                            edgeList,
                            currentModuleDetails,
                        ),
                    );
                }
            }
        }
    });
    const finalLPEdges = tempLpEdge?.map((edge, index) => {
        return {
            ...edge,
            id: `edges-${edgeList?.length + index + 1}`,
        };
    });
    function removeDuplicateEdges(edges) {
        const seen = new Set();

        return edges.filter((edge) => {
            const key = `${edge.source}-${edge.sourceHandle || ''}-${edge.target}`;

            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    // console.log('edgeList', edgeList);
    // console.log('###finalLPEdges', finalLPEdges);
    edgeList = finalLPEdges?.length && tempLpEdge?.length ? [...edgeList, ...finalLPEdges] : [...edgeList];
    edgeList = removeDuplicateEdges(edgeList);
    return edgeList;
};

// export const GenerateEdgeObject = (canvasStateVal) => {
//     const {
//         nodeState,
//         edgeState,
//         Campaign: {
//             CanvasChannel: { activeChannel },
//         },
//     } = canvasStateVal;

//     let edgeList = [];
//     let tempLpEdge = [];
//     let processedParents = new Set(); // Track nodes that already displayed count

//     // Group child nodes by their parentWindowId
//     const childNodesByParent = {};
//     nodeState.forEach((node) => {
//         const parentId = node?.data?.parentWindowId;
//         if (parentId) {
//             if (!childNodesByParent[parentId]) {
//                 childNodesByParent[parentId] = [];
//             }
//             childNodesByParent[parentId].push(node);
//         }
//     });

//     nodeState.forEach((item, index) => {
//         if (index > 0 && !item['data']['elementAddOnType']) {
//             let edgeType = 'CustomEdge';
//             let sourceHandle = item.data.sourceHandle ? item.data.sourceHandle : GetHandleType(nodeState, item);
//             let color = getColorCode(item['data']['parentWindowId'], canvasStateVal) || 'red';
//             let markerEnd = { type: 'arrowclosed', width: '180px', height: '40px', color };
//             let strokeDasharray = item.type === 'GoalPlaceholder' || item.type === 'GoalItem' ? '5 5' : '0,0';
//             let endLabel = {};
//             const parentId = item?.data?.parentWindowId;

//             if (item.data.action && item.type !== 'GoalPlaceholder' && item.type !== 'GoalItem') {
//                 let edgeEndLabel = item['data']['edgeEndLabel'] || item['data']['actionOption'] || '';
//                 if (edgeEndLabel) {
//                     const { label, durType, durVal, durDate } = edgeEndLabel;
//                     endLabel = {
//                         actionName: label,
//                         dayOrHourText: `${durVal} ${durType?.dayOrHour}`,
//                         date: `${getDDMMMYYYY(durDate)}`,
//                     };
//                 }
//             }

//             // Show audience count only on the first edge from the same parent
//             let label = 0;
//             if (parentId && childNodesByParent[parentId]?.[0]?.id === item.id) {
//                 label = item['data']['audienceCount'] || 0;
//             }

//             let totalCount =
//                 item?.['levelNumber'] > 1 && item?.['data']?.['TotalCount'] ? item?.['data']?.['TotalCount'] : null;
//             let hidden = item.hasOwnProperty('hidden') && item.hidden === true;

//             let edg = {
//                 id: `edges-${index}`,
//                 source: `${parentId}`,
//                 target: `${item['id']}`,
//                 sourceHandle,
//                 label,
//                 hidden,
//                 type: edgeType,
//                 markerEnd,
//                 style: {
//                     stroke: color,
//                     strokeWidth: 0.8,
//                     strokeDasharray,
//                     orient: '',
//                 },
//                 animated: false,
//                 data: {
//                     startLabel: totalCount,
//                     endLabel,
//                     levelNumber: item['levelNumber'],
//                     label,
//                 },
//             };
//             edgeList.push(edg);
//         }
//     });

//     return edgeList;
// };

export const UpdateEdgeObject = (edgeList, currentChannelDetails) => {
    let hidden = currentChannelDetails?.value?.hidden === true ? true : false;
    let edgeType = 'CustomEdge';
    let styleRslt = GetChannelStyleAttributes(currentChannelDetails?.value?.ChannelId);
    let color = styleRslt['channelColorCode'];
    let markerEnd = { type: 'arrowclosed', width: '180px', height: '40px', color };
    let strokeDasharray = '5 5';
    let edg = {
        id: `edges-${edgeList?.length + 1}`,
        source: `${currentChannelDetails?.value['DomId']}`,
        target: `${currentChannelDetails?.['parent']['DomId']}`,
        sourceHandle: 'B1',
        targetHandle: 'B1',
        hidden,
        type: edgeType,
        markerEnd,
        style: {
            stroke: color,
            strokeWidth: 0.8,
            strokeDasharray,
            orient: '',
        },
        animated: false,
        data: {
            startLabel: 'start edge label',
            endLabel: {},
            levelNumber: currentChannelDetails['value']['levelNumber'],
            label: {},
        },
    };
    edgeList = [...edgeList, edg];
    return edgeList;
};
export const getModule = (modules, id) =>
    findDeep(
        modules,
        (module) =>
            module.DomId === id ||
            module.Action.DomId === id ||
            (module.hasOwnProperty('IsChannelSwitched') &&
                module.hasOwnProperty('switchCond') &&
                module.switchCond.DomId === id),
        {
            checkCircular: false,
            childrenPath: 'activeChannel',
        },
    );
export const checkLandingPageExist = (modules, id) =>
    findDeep(modules, (module) => module.ChannelId === id, {
        checkCircular: false,
        childrenPath: 'activeChannel',
    });

export const findChannelExistForLp = (modules, id) =>
    findDeep(modules, (module) => module.ChannelId === id, {
        checkCircular: false,
        childrenPath: 'activeChannel',
    });
export const getAllModule = (modules, id) =>
    filterDeep(
        modules,
        (module) =>
            module.DomId === id ||
            module.Action.DomId === id ||
            (module.hasOwnProperty('IsChannelSwitched') &&
                module.hasOwnProperty('switchCond') &&
                module.switchCond.DomId === id),
        {
            checkCircular: false,
            childrenPath: 'activeChannel',
        },
    );
export const getColorCode = (domIdArg, MdcTemplate) => {
    const {
        dataSource: { DomId, Type },
        Campaign: { CanvasChannel },
    } = MdcTemplate;
    let module = MdcTemplate['Campaign']['CanvasChannel']['activeChannel'];
    let result = getModule(module, domIdArg);
    let channelId =
        DomId === domIdArg || CanvasChannel?.switchCond?.DomId == domIdArg ? Type : result?.['value']?.['ChannelId'];

    if (
        MdcTemplate['Campaign']['CanvasChannel'].hasOwnProperty('IsChannelSwitched') &&
        MdcTemplate['Campaign']['CanvasChannel'].hasOwnProperty('switchCond') &&
        MdcTemplate['Campaign']['CanvasChannel'].switchCond.DomId === domIdArg
    ) {
        channelId = Type;
    }
    let styleRslt = GetChannelStyleAttributes(channelId);
    return styleRslt?.['channelColorCode'];
};

export const GetLevelNumberForLp = (modules, type, domId) => {
    let levelNumber;
    eachDeep(
        modules,
        (child, i, parent, ctx) => {
            if (child.ChannelDetailType == type) {
                levelNumber = getModule(child, domId);
            }
        },
        { childrenPath: 'activeChannel' },
    );

    if (levelNumber) return parseInt(levelNumber['context']['_item']['depth'], 10) + 100;
    else return null;
};

export const GetChannelContentSetupDetails = (curChannelId, domId, canvasJson, subSegmentLevel) => {
    const {
        Campaign: {
            CanvasChannel: { activeChannel },
        },
        dataSource: { Type },
    } = canvasJson;
    let getChannelDepth = getModule(activeChannel, domId);
    let rootParentDetail = getAllModule(activeChannel, domId);
    const isJourney = canvasJson?.dataSource?.isSubsegmentJoureny;
    let paramDetails = {};

    // Get the timezone ID based on the level of the channel.
    const handleTimeZoneId = () => {
        if (Type === 'DynamicList') {
            const {
                dataSource: {
                    dynamicData: { timezone, timeZoneId },
                },
            } = canvasJson;
            return (timezone?.timeZoneID || timeZoneId) ?? 0;
        } else {
            const currentChannelParent = getChannelDepth['parent'];
            const currentChannelValue = getChannelDepth['value'];
            // 1. If the level is greater than 2, pass the parent timezone ID.
            // 2. If channelDetailID is 0, it is satisfied.
            if (getChannelDepth['value']?.LevelNumber > 1 || getChannelDepth['value']?.ChannelDetailID === 0) {
                const parentTimeZoneId = rootParentDetail[0]['timezoneId'];
                return parentTimeZoneId ?? 0;
            } else {
                return currentChannelValue['timezoneId'] ?? 0;
            }
        }
    };

    const handleAudienceNormalAndSegmentFlow = () => {
        const isJourney = canvasJson?.dataSource?.isSubsegmentJoureny;
        const subSegmentList = canvasJson['subSegment']['subSegmentList'];
        const matchedSubsegmentAudience = subSegmentList?.find(
            (segment) => segment?.data?.subSegmentLevel === subSegmentLevel,
        );
        let audience =
            isJourney && matchedSubsegmentAudience && matchedSubsegmentAudience.channelWiseCount
                ? matchedSubsegmentAudience.channelWiseCount
                : 0;
        return audience;
    };

    const handleIsExistChildActiveChannel = () => {
        const currentValue = getChannelDepth['value'];
        const isExistActive = currentValue?.activeChannel?.length ? true : false;
        return isExistActive;
    };

    if (getChannelDepth['context']['_item']['depth'] == 1) {
        let updateCurChannelId = curChannelId?.includes('goal') ? 'goal002' : curChannelId;
        let FlowChannel = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCChannel'].filter(
            (item) => item.htmlId == updateCurChannelId,
        );
        FlowChannel = FlowChannel[0]['value'];
        let LevelNumber = getChannelDepth['context']['_item']['depth'];
        let ActionID = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCAction']['Unknown'];
        let DynamiclistID = getChannelDepth['value'].hasOwnProperty('DynamicListId')
            ? getChannelDepth['value']['DynamicListId']
            : 0;
        if (Type === 'DynamicList') {
            const {
                dataSource: {
                    dynamicData: {
                        dynamicList: { dynamicListId },
                    },
                },
            } = canvasJson;
            DynamiclistID = dynamicListId;
        }
        let IsALLorAny = canvasJson['Campaign']['CanvasChannel']['IsChannelSwitched']
            ? canvasJson['Campaign']['CanvasChannel']['switchCond']['SelectionMode']
            : 'ALL';
        let audience = canvasJson['Campaign']['PotentialRecipients']['Recipients'];
        const {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            ScheduleDate,
            IsSplitAbEnabled,
            addOnLevel,
        } = getChannelDepth['value'];

        paramDetails = {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            ContentThumbnailPath: '',
            FlowChannel,
            ParentChannelDetailID: 0,
            ParentChannelDetailType: ChannelDetailType,
            LevelNumber,
            ActionID,
            ActionTime: '-1',
            ActiveChannel: FlowChannel,
            ActionTimeDuration: 'D',
            ScheduleDate,
            IsSplitAbEnabled,
            DynamiclistID,
            addOnLevel,
            IsALLorAny,
            audience,
            timezoneId: handleTimeZoneId(),
            isExistChildActiveChannel: handleIsExistChildActiveChannel(),
            finalSubSegmentAudience: handleAudienceNormalAndSegmentFlow(),
        };
    } else {
        let channelStartpath = getChannelDepth['context']['_item']['path'][0];
        let flowChannelHtmlId = canvasJson['Campaign']['CanvasChannel']['activeChannel'][channelStartpath]['ChannelId'];
        let updateFlowChannelHtmlId = flowChannelHtmlId?.includes('goal') ? 'goal002' : flowChannelHtmlId;
        let flowChannel = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCChannel'].filter(
            (item) => item.htmlId == updateFlowChannelHtmlId,
        );
        flowChannel = flowChannel[0]['value'];
        let updateCurChannelId = curChannelId?.includes('goal') ? 'goal002' : curChannelId;
        let curActiveChannelId = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCChannel'].filter(
            (item) => item.htmlId == updateCurChannelId,
        );
        curActiveChannelId = curActiveChannelId[0]['value'];
        let ParentChannelDetailId = parseInt(getChannelDepth['parent']['ChannelDetailID'], 10);
        let ParentChannelDetailType = getChannelDepth['parent']['ChannelDetailType'];

        let LevelNumber = getChannelDepth['context']['_item']['depth'];
        let ActionId = getChannelDepth['value']['actionOption']['value'];
        let ActionTime = getChannelDepth['value']['actionOption']['durVal']
            ? getChannelDepth['value']['actionOption']['durVal']
            : 0;
        ActionTime = parseInt(ActionTime, 10);
        let ActionTimeDuration = 'D'; //default value
        if (getChannelDepth?.['value']?.['actionOption']?.['durType']?.['value'] == 'days') {
            ActionTimeDuration = 'D';
        }
        if (getChannelDepth?.['value']?.['actionOption']?.['durType']?.['value'] == 'hours') {
            ActionTimeDuration = 'H';
        }

        if (canvasJson['CampaignGoal'].toLowerCase() == 'conversion') {
            if (ParentChannelDetailType == 'LP1') {
                flowChannel = 11;
            }
            if (ParentChannelDetailType == 'LP2') {
                flowChannel = 21;
            }
        } else {
            if (ParentChannelDetailType?.includes('LP')) {
                flowChannel = LevelNumber === 2 ? 11 : 21;
            }
        }

        let allOrAny = 'All';
        let ScheduleDate = getChannelDepth['value']['actionOption']['durDate'];
        ScheduleDate = new Date(ScheduleDate);
        getChannelDepth['value']['ScheduleDate'] = ScheduleDate;
        let DynamiclistID = getChannelDepth['value'].hasOwnProperty('DynamicListId')
            ? getChannelDepth['value']['DynamicListId']
            : 0;
        if (Type === 'DynamicList') {
            const {
                dataSource: {
                    dynamicData: {
                        dynamicList: { dynamicListId },
                    },
                },
            } = canvasJson;
            DynamiclistID = dynamicListId;
        }
        let audience = canvasJson['Campaign']['PotentialRecipients']['Recipients'];
        const {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            IsSplitAbEnabled,
            addOnLevel,
        } = getChannelDepth['value'];
        paramDetails = {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            ContentThumbnailPath: '', //getChannelDepth['value']['ContentThumbnailPath'],
            FlowChannel: flowChannel,
            ParentChannelDetailId,
            ParentChannelDetailType,
            LevelNumber,
            ActionId,
            ActionTime,
            ActiveChannel: curActiveChannelId,
            ActionTimeDuration,
            ScheduleDate,
            IsSplitAbEnabled,
            DynamiclistID: DynamiclistID,
            addOnLevel,
            audience,
            timezoneId: handleTimeZoneId(),
            isExistChildActiveChannel: false,
            finalSubSegmentAudience: handleAudienceNormalAndSegmentFlow(),
        };
        // if (getChannelDepth['value']['ChannelDetailType'] == "WP" || getChannelDepth['value']['ChannelDetailType'] == "W") {
        //     paramDetails['NotificationType'] = 'Web'
        // }
        // if (getChannelDepth['value']['ChannelDetailType'] == "MP" || getChannelDepth['value']['ChannelDetailType'] == "M") {
        //     paramDetails['NotificationType'] = 'Push'
        // }

        if (canvasJson['CampaignGoal'].toLowerCase() == 'conversion') {
            if (getChannelDepth['parent']['ChannelDetailType'] != 'LP2') {
                let levelNo = GetLevelNumberForLp(activeChannel, 'LP1', domId);
                if (levelNo) {
                    paramDetails['LevelNumber'] = levelNo;
                    paramDetails['FlowChannel'] = 11;
                    paramDetails['ScheduleDate'] = !isNaN(new Date(getChannelDepth?.value?.ScheduleDate).getTime())
                                            ? getChannelDepth?.value?.ScheduleDate
                                            : getChannelDepth?.parent?.ScheduleDate || new Date();
                }
            }

            if (getChannelDepth['parent']['ChannelDetailType'] == 'LP2') {
                paramDetails['LevelNumber'] = 201;
                paramDetails['FlowChannel'] = 21;
                paramDetails['ScheduleDate'] = !isNaN(new Date(getChannelDepth?.value?.ScheduleDate).getTime())
                                            ? getChannelDepth?.value?.ScheduleDate
                                            : getChannelDepth?.parent?.ScheduleDate || new Date();
            }
        } else {
             if (getChannelDepth['parent']['ChannelDetailType']?.includes('LP') || getChannelDepth['parent']['LevelNumber'] >= 301) {
                let levelNo =  GetLevelNumberForLp(activeChannel, getChannelDepth['parent']['ChannelDetailType'], domId);
                // (parent level * 100) + current level
                const addlevelNo =  parseInt(getChannelDepth['parent']['LevelNumber'],10);
                paramDetails['LevelNumber'] = addlevelNo >= 301 ? addlevelNo + 1 : ((addlevelNo * 100) + levelNo);
                paramDetails['ScheduleDate'] = !isNaN(new Date(getChannelDepth?.value?.ScheduleDate).getTime())
                                            ? getChannelDepth?.value?.ScheduleDate
                                            : getChannelDepth?.parent?.ScheduleDate || new Date();
            }
        }

        if (
            getChannelDepth['value'].hasOwnProperty('IsChannelSwitched') &&
            getChannelDepth['value']['IsChannelSwitched']
        ) {
            allOrAny = getChannelDepth['value']['switchCond']['SelectionMode'];
        } else {
            allOrAny = 'ALL';
        }
        paramDetails['IsALLorAny'] = allOrAny;
    }
    paramDetails['dataSource'] = Type === 'DynamicList' ? 'DL' : Type === 'QR' ? 'QR' : 'TL';
    paramDetails['isAutoRefereshenabled'] = canvasJson['dataSource']['isAutoRefresh'];
    paramDetails = _mapKeys(paramDetails, (v, k) => _camelCase(k));
    Object.assign(paramDetails, { isALLorAny: paramDetails['isAlLorAny'] });
    delete paramDetails['isAlLorAny'];
    paramDetails['isCGTGEnabled'] = canvasJson?.dataSource?.isCGTGEnabled;
    return paramDetails;
};

export const GetChannelContentSetupDetailsPlumbJsFlow = (curChannelId, domId, canvasJson) => {
    const {
        Campaign: {
            CanvasChannel: { activeChannel },
        },
        dataSource: { Type },
    } = canvasJson;
    let getChannelDepth = getModule(activeChannel, domId);
    let paramDetails = {};
    let rootParentDetail = getAllModule(activeChannel, domId);

    // Get the timezone ID based on the level of the channel.
    const handleTimeZoneId = () => {
        if (Type === 'DynamicList') {
            return canvasJson?.dataSource?.timeZone ?? 0;
        } else {
            const currentChannelValue = getChannelDepth['value'];
            // 1. If the level is greater than 2, pass the parent timezone ID.
            // 2. If channelDetailID is 0, it is satisfied.
            if (getChannelDepth['value']?.LevelNumber > 1 || getChannelDepth['value']?.ChannelDetailID === 0) {
                const parentTimeZoneId = rootParentDetail[0]['timezoneId'];
                return parentTimeZoneId ?? 0;
            } else {
                return currentChannelValue['timezoneId'] ?? 0;
            }
        }
    };

    const handleIsExistChildActiveChannel = () => {
        const currentValue = getChannelDepth['value'];
        const isExistActive = currentValue?.activeChannel?.length ? true : false;
        return isExistActive;
    };

    const handleAudienceNormalAndSegmentFlow = () => {
        const isJourney = canvasJson?.dataSource?.isSubsegmentJoureny;
        const subSegmentList = canvasJson['subSegment']['subSegmentList'];
        const matchedSubsegmentAudience = subSegmentList?.find(
            (segment) => segment?.data?.subSegmentLevel === subSegmentLevel,
        );
        let audience =
            isJourney && matchedSubsegmentAudience && matchedSubsegmentAudience.channelWiseCount
                ? [matchedSubsegmentAudience.channelWiseCount]
                : 0;
        return audience;
    };

    if (getChannelDepth['context']['_item']['depth'] == 1) {
        let updateCurChannelId = curChannelId?.includes('goal') ? 'goal002' : curChannelId;
        let FlowChannel = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCChannel'].filter(
            (item) => item.htmlId == updateCurChannelId,
        );
        FlowChannel = FlowChannel[0]['value'];
        let LevelNumber = getChannelDepth['context']['_item']['depth'];
        let ActionID = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCAction']['Unknown'];
        let DynamiclistID = getChannelDepth['value'].hasOwnProperty('DynamicListId')
            ? getChannelDepth['value']['DynamicListId']
            : 0;
        if (Type === 'DynamicList') {
            const {
                dataSource: { DataList },
            } = canvasJson;
            DynamiclistID = DataList;
        }
        let IsALLorAny = canvasJson['Campaign']['CanvasChannel']['IsChannelSwitched']
            ? canvasJson['Campaign']['CanvasChannel']['switchCond']['SelectionMode']
            : 'ALL';
        let audience = canvasJson['Campaign']['PotentialRecipients']['Recipients'];
        const {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            ScheduleDate,
            IsSplitAbEnabled,
            addOnLevel,
        } = getChannelDepth['value'];

        paramDetails = {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            ContentThumbnailPath: '',
            FlowChannel,
            ParentChannelDetailID: 0,
            ParentChannelDetailType: ChannelDetailType,
            LevelNumber,
            ActionID,
            ActionTime: '-1',
            ActiveChannel: FlowChannel,
            ActionTimeDuration: 'D',
            ScheduleDate,
            IsSplitAbEnabled,
            DynamiclistID,
            addOnLevel,
            IsALLorAny,
            audience,
            timezoneId: handleTimeZoneId(),
            isExistChildActiveChannel: handleIsExistChildActiveChannel(),
            finalSubSegmentAudience: handleAudienceNormalAndSegmentFlow(),
        };
    } else {
        let channelStartpath = getChannelDepth['context']['_item']['path'][0];
        let flowChannelHtmlId = canvasJson['Campaign']['CanvasChannel']['activeChannel'][channelStartpath]['ChannelId'];
        let updateFlowChannelHtmlId = flowChannelHtmlId?.includes('goal') ? 'goal002' : flowChannelHtmlId;
        let flowChannel = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCChannel'].filter(
            (item) => item.htmlId == updateFlowChannelHtmlId,
        );
        flowChannel = flowChannel[0]['value'];
        let updateCurChannelId = curChannelId?.includes('goal') ? 'goal002' : curChannelId;
        let curActiveChannelId = MDC_CHANNEL_AND_ACTION_TEMPLATE['MDCChannel'].filter(
            (item) => item.htmlId == updateCurChannelId,
        );
        curActiveChannelId = curActiveChannelId[0]['value'];
        let ParentChannelDetailId = parseInt(getChannelDepth['parent']['ChannelDetailID'], 10);
        let ParentChannelDetailType = getChannelDepth['parent']['ChannelDetailType'];

        let LevelNumber = getChannelDepth['context']['_item']['depth'];
        let ActionId = getChannelDepth?.value?.Action?.ActionID;
        let ActionTime = getChannelDepth?.value?.Action?.ActionTime;
        ActionTime = parseInt(ActionTime, 10);
        let ActionTimeDuration = getChannelDepth?.value?.Action?.ActionTimeDuration || 'D'; //default value
        // if (getChannelDepth?.['value']?.['actionOption']?.['durType']?.['value'] == 'days') {
        //     ActionTimeDuration = 'D';
        // }
        // if (getChannelDepth?.['value']?.['actionOption']?.['durType']?.['value'] == 'hours') {
        //     ActionTimeDuration = 'H';
        // }
        if (ParentChannelDetailType == 'LP1') {
            flowChannel = 11;
        }
        if (ParentChannelDetailType == 'LP2') {
            flowChannel = 21;
        }
        let allOrAny = 'All';
        let ScheduleDate = getChannelDepth['value']['actionOption']['durDate'];
        ScheduleDate = new Date(ScheduleDate);
        getChannelDepth['value']['ScheduleDate'] = ScheduleDate;
        let DynamiclistID = getChannelDepth['value'].hasOwnProperty('DynamicListId')
            ? getChannelDepth['value']['DynamicListId']
            : 0;
        let audience = canvasJson['Campaign']['PotentialRecipients']['Recipients'];
        const {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            IsSplitAbEnabled,
            addOnLevel,
        } = getChannelDepth['value'];
        paramDetails = {
            Name,
            ChannelFriendlyName,
            ChannelDetailID,
            ChannelDetailType,
            ChannelId,
            DomId,
            ContentThumbnailPath: '', //getChannelDepth['value']['ContentThumbnailPath'],
            FlowChannel: flowChannel,
            ParentChannelDetailId,
            ParentChannelDetailType,
            LevelNumber,
            ActionId,
            ActionTime,
            ActiveChannel: curActiveChannelId,
            ActionTimeDuration,
            ScheduleDate,
            IsSplitAbEnabled,
            DynamiclistID: DynamiclistID,
            addOnLevel,
            audience,
            timezoneId: handleTimeZoneId(),
            isExistChildActiveChannel: false,
            finalSubSegmentAudience: handleAudienceNormalAndSegmentFlow(),
        };
        // if (getChannelDepth['value']['ChannelDetailType'] == "WP" || getChannelDepth['value']['ChannelDetailType'] == "W") {
        //     paramDetails['NotificationType'] = 'Web'
        // }
        // if (getChannelDepth['value']['ChannelDetailType'] == "MP" || getChannelDepth['value']['ChannelDetailType'] == "M") {
        //     paramDetails['NotificationType'] = 'Push'
        // }

        if (
            canvasJson['CampaignGoal'].toLowerCase() == 'conversion' &&
            getChannelDepth['parent']['ChannelDetailType'] != 'LP2'
        ) {
            let levelNo = GetLevelNumberForLp(activeChannel, 'LP1', domId);
            if (levelNo) {
                paramDetails['LevelNumber'] = levelNo;
                paramDetails['FlowChannel'] = 11;
                paramDetails['ScheduleDate'] = !isNaN(new Date(getChannelDepth?.value?.ScheduleDate).getTime())
                                            ? getChannelDepth?.value?.ScheduleDate
                                            : getChannelDepth?.parent?.ScheduleDate || new Date();
            }
        }

        if (
            canvasJson['CampaignGoal'].toLowerCase() == 'conversion' &&
            getChannelDepth['parent']['ChannelDetailType'] == 'LP2'
        ) {
            paramDetails['LevelNumber'] = 201;
            paramDetails['FlowChannel'] = 21;
            paramDetails['ScheduleDate'] = !isNaN(new Date(getChannelDepth?.value?.ScheduleDate).getTime())
                                            ? getChannelDepth?.value?.ScheduleDate
                                            : getChannelDepth?.parent?.ScheduleDate || new Date();
        }
        if (
            getChannelDepth['value'].hasOwnProperty('IsChannelSwitched') &&
            getChannelDepth['value']['IsChannelSwitched']
        ) {
            allOrAny = getChannelDepth['value']['switchCond']['SelectionMode'];
        } else {
            allOrAny = 'ALL';
        }
        paramDetails['IsALLorAny'] = allOrAny;
    }
    paramDetails['dataSource'] = Type === 'DynamicList' ? 'DL' : 'TL';
    paramDetails = _mapKeys(paramDetails, (v, k) => _camelCase(k));
    Object.assign(paramDetails, { isALLorAny: paramDetails['isAlLorAny'] });
    delete paramDetails['isAlLorAny'];
    paramDetails['isCGTGEnabled'] = canvasJson?.dataSource?.isCGTGEnabled;
    return paramDetails;
};

const getPreviewInput = (type, moduleRslt, currentResponse) => {
    switch (type) {
        case 'E':
            moduleRslt.value['subjectLine'] = currentResponse?.subjectLine;
            break;

        case 'S':
            moduleRslt.value['senderName'] = currentResponse?.senderName;
            break;
        // case 'WP':
        //     moduleRslt.value['SenderId'] = currentResponse?.SenderId;
        //     break;
        // case 'MP':
        //     moduleRslt.value['SenderId'] = currentResponse?.SenderId;
        //     break;
        // case 'V':
        //     moduleRslt.value['SenderId'] = currentResponse?.SenderId;
        //     break;
        // case 'C':
        //     moduleRslt.value['SenderId'] = currentResponse?.SenderId;
        //     break;
        // case 'WA':
        //     moduleRslt.value['SenderId'] = currentResponse?.SenderId;
        //     break;
        // case 'WH':
        //     moduleRslt.value['SenderId'] = currentResponse?.SenderId;
        //     break;
        // case 'PM':
        //     moduleRslt.value[type] = currentResponse?.SenderId;
        //     break;

        default:
    }

    return moduleRslt;
};

const normalizeParentChannelDetailId = (id) => {
    const parsed = parseInt(id, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};

export const UpateChannelResponseDataToRecursiveFlow = (
    cuurentLocationState,
    currentChannelResponseData,
    currentStateJson,
) => {
    let currentState = _cloneDeep(currentStateJson);
    const {
        actionId,
        actionTime,
        actionTimeDuration,
        activeChannel: currentActiveChannel,
        b2,
        blastScheduleGuid,
        c1,
        campaignGUId,
        channelDetailType,
        channelFriendlyName,
        contentThumbnail,
        levelNumber,
        localBlastDateTime,
        name,
        parentChannelDetailId,
        parentChannelDetailType,
        channelId,
        domId,
        isSplitAB,
        logoPath,
        waMediaContent,
        clientName,
        timezoneId = 0,
        content,
        statusId = 0,
        contentJson
    } = currentChannelResponseData[0];
    const { mdcContentSetupDetails } = cuurentLocationState;
    // debugger;
    //let {Campaign:{CanvasChannel:{activeChannel}}} = state;
    // let referenceJson = JSON.parse(JSON.stringify());
    if (
        channelId === mdcContentSetupDetails?.channelId &&
        domId === mdcContentSetupDetails?.domId &&
        normalizeParentChannelDetailId(parentChannelDetailId) ===
            normalizeParentChannelDetailId(mdcContentSetupDetails?.parentChannelDetailId) &&
        parentChannelDetailType === mdcContentSetupDetails?.parentChannelDetailType &&
        cuurentLocationState?.channelResponseDetailId
    ) {
        let module = currentState['Campaign']['CanvasChannel']['activeChannel'];
        let moduleRslt = getModule(module, mdcContentSetupDetails['domId']);
        // const updatedJson = {   B2:b2,
        //                         C1:c1,
        //                         ChannelDetailID:cuurentLocationState['channelResponseDetailId'],
        //                         ChannelDetailType:channelDetailType,
        //                         ContentThumbnailPath:contentThumbnail,
        //                         ScheduleDate:localBlastDateTime
        //                     }
        // moduleRslt['value'] = {...moduleRslt['value'],...updatedJson};
        moduleRslt['value']['B2'] = b2;
        moduleRslt['value']['C1'] = c1;
        moduleRslt['value']['ChannelDetailID'] = cuurentLocationState['channelResponseDetailId'];
        moduleRslt['value']['ChannelDetailType'] = channelDetailType;
        moduleRslt['value']['ParentChannelDetailID'] = parentChannelDetailId;
        moduleRslt['value']['ParentChannelDetailType'] = parentChannelDetailType;
        moduleRslt['value']['ContentThumbnailPath'] = contentThumbnail;
        moduleRslt['value']['ScheduleDate'] = localBlastDateTime;
        moduleRslt['value']['LevelNumber'] = levelNumber;
        moduleRslt['value']['timezoneId'] = timezoneId;
        moduleRslt['value']['content'] = content ?? [];
        moduleRslt['value']['displayPreviewContent'] = currentChannelResponseData[0]?.displayPreviewContent ?? {};
        moduleRslt['value']['statusId'] = statusId ?? 0;
        getPreviewInput(channelDetailType, moduleRslt, currentChannelResponseData[0]);

        moduleRslt['value']['IsSplitAbEnabled'] = isSplitAB ? isSplitAB : false;

        if (channelId === 'ch0021') {
            moduleRslt['value']['ClientName'] = clientName;
            moduleRslt['value']['AccountLogo'] = logoPath;
            moduleRslt['value']['WaMediaContent'] = waMediaContent;
        }
        const node = [...currentState.nodeState];
        const nodeIndex = _findIndex(node, ['id', mdcContentSetupDetails['domId']]);
        node[nodeIndex]['data']['isSplitAb'] = isSplitAB && levelNumber === 1 ? isSplitAB : false;
        return { ...currentState, nodeState: node };
    } else {
        return {
            ...currentStateJson,
        };
    }
};

/** Recursively removes layout-only keys (node drag updates these across activeChannel, placeholders, etc.). */
const stripCanvasPositionsDeep = (value) => {
    if (value == null || typeof value !== 'object') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(stripCanvasPositionsDeep);
    }

    return Object.entries(value).reduce((acc, [key, nestedValue]) => {
        if (key === 'position' || key === 'Position') {
            return acc;
        }
        acc[key] = stripCanvasPositionsDeep(nestedValue);
        return acc;
    }, {});
};

/** Canvas snapshot for auto-save — ignores all position fields so drag/align alone never triggers SaveCanvasData. */
export const serializeCanvasStateForAutoSave = (canvasState) => {
    if (!canvasState) return '';

    const comparableState = stripCanvasPositionsDeep({
        nodeState: canvasState.nodeState,
        edgeState: canvasState.edgeState,
        dataSource: canvasState.dataSource,
        subSegment: canvasState.subSegment,
        disableNodeList: canvasState.disableNodeList,
        activeChannel: canvasState?.Campaign?.CanvasChannel?.activeChannel,
        switchCond: canvasState?.Campaign?.CanvasChannel?.switchCond,
        placeholder: canvasState?.Campaign?.CanvasChannel?.Placeholder,
        recipients: canvasState?.Campaign?.PotentialRecipients?.Recipients,
        mdcFlowConfig: canvasState?.Campaign?.MdcFlowConfig,
        mdcType: canvasState?.MdcType,
        updatedCount: canvasState.updatedCount,
    });

    return JSON.stringify(comparableState);
};

export const buildCanvasDataSavePayload = (campaignDetails) => {
    const { userId, departmentId, clientId, campaignId, canvasState } = campaignDetails;
    return { userId, departmentId, clientId, campaignId, campaignData: JSON.stringify(canvasState) };
};

export const isSameCanvasSaveData = (lastSavedSnapshot, canvasState) =>
    Boolean(lastSavedSnapshot) &&
    serializeCanvasStateForAutoSave(canvasState) === lastSavedSnapshot;

export const UpdateRecursivelyFlowDateTime = (payload, canvasJson, type = 'recursivelyUpdate') => {
    // 4.8 version Fn name is updateOverlayDateTime()
    const { optionDiff: optionList, currentWindowId: currentActionElementId } = payload;
    const MDCTemplate = _cloneDeep(canvasJson);
    let modules = MDCTemplate['Campaign']['CanvasChannel']['activeChannel'];
    let rslt = getModule(modules, currentActionElementId);
    let channelList = [],
        initialDomId,
        initialTargetWindowId,
        initialActionOption,
        switchId;
    let updateDayTimeList = [];

    if (rslt && rslt.hasOwnProperty('value')) {
        channelList = rslt['value'];
    }
    optionList.forEach((optionListItem) => {
        rslt['value']['activeChannel'].forEach((item, index) => {
            if (
                optionListItem.durDate != '' &&
                item.hasOwnProperty('actionOption') &&
                optionListItem.name == item['actionOption']['name']
            ) {
                const { durDate, durType, durVal } = optionListItem;

                initialDomId = item['DomId'];
                item['actionOption']['durDate'] = durDate;
                item['actionOption']['durType'] = durType;
                item['actionOption']['durVal'] = durVal;
                item['ScheduleDate'] = durDate;
                //initialTargetWindowId = item['actionOption'][0]['optionDomId'];
                // initialActionOption = item['actionOption'][0];
                let prevDurDate = optionListItem.durDate;
                const {
                    ChannelDetailID,
                    ChannelDetailType,
                    LevelNumber,
                    ParentChannelDetailID,
                    ParentChannelDetailType,
                    actionOption,
                } = item;
                let DynamiclistID = item.hasOwnProperty('DynamicListID') ? item['DynamicListID'] : 0;
                if (LevelNumber && ParentChannelDetailID && ParentChannelDetailType) {
                    updateDayTimeList = [
                        ...updateDayTimeList,
                        {
                            ChannelDetailID,
                            ChannelDetailType,
                            LevelID: LevelNumber,
                            ParentChannelDetailID,
                            ParentChannelDetailType,
                            ActionTime: actionOption['durVal'],
                            ActionTimeDuration: actionOption['durType']['value'],
                            DynamiclistID,
                        },
                    ];
                }
                eachDeep(
                    item,
                    (child, i, parent, ctx) => {
                        // if (child.hasOwnProperty('actionOption') && child['actionOption'][0].hasOwnProperty('optionDomId')) {
                        if (child.hasOwnProperty('actionOption')) {
                            let { durDate, durType, durVal, optionDomId } = child['actionOption'];
                            // optionDomId = (child.hasOwnProperty('IsChannelSwitched') && child['IsChannelSwitched']) ? child['switchCond']['DomId'] : optionDomId;

                            // removeOveralyForActionDateTimeUpdate(optionDomId);
                            let addedDate;
                            if (i && parent) {
                                prevDurDate = parent['actionOption']['durDate'];
                                let dateFormat = new Date(prevDurDate);
                                // if (durType['value'] === 'days') addedDate = addDaysToDate(dateFormat, durVal);
                                // if (durType['value'] === 'hours') addedDate = addHoursToDate(dateFormat, durVal);
                                if (durType['value'] === 'days')
                                    addedDate = getUserCurrentFormat(null, {
                                        addDaysFromDate: dateFormat,
                                        days: durVal,
                                    });
                                if (durType['value'] === 'hours')
                                    addedDate = getUserCurrentFormat(addHoursToDate(dateFormat, durVal));

                                child['actionOption']['durDate'] = addedDate?.dateToString;
                                child['ScheduleDate'] = addedDate?.dateToString;
                                const {
                                    ChannelDetailID,
                                    ChannelDetailType,
                                    LevelNumber,
                                    ParentChannelDetailID,
                                    ParentChannelDetailType,
                                    actionOption,
                                } = child;
                                let DynamiclistID = child.hasOwnProperty('DynamicListID') ? child['DynamicListID'] : 0;
                                if (LevelNumber && ParentChannelDetailID && ParentChannelDetailType) {
                                    updateDayTimeList = [
                                        ...updateDayTimeList,
                                        {
                                            ChannelDetailID,
                                            ChannelDetailType,
                                            LevelID: LevelNumber,
                                            ParentChannelDetailID,
                                            ParentChannelDetailType,
                                            ActionTime: actionOption['durVal'],
                                            ActionTimeDuration: actionOption['durType']['value'],
                                            DynamiclistID,
                                        },
                                    ];
                                }
                            }
                            //handleUpdateTimeActionOverlay(optionDomId, child['actionOption'][0]);
                        }
                        if (child.hasOwnProperty('IsChannelSwitched') && child['IsChannelSwitched'] == true) {
                            switchId = child['switchCond']['DomId'];
                        }
                    },
                    { childrenPath: 'activeChannel' },
                );
            }
        });
        MDCTemplate['Campaign']['CanvasChannel']['Placeholder'] =
            MDCTemplate?.Campaign?.CanvasChannel?.Placeholder?.map((placeholderItem) => {
                if (!placeholderItem?.data?.actionOption?.durDate) {
                    return placeholderItem;
                }

                const parentActiveChannel = getModule(modules, placeholderItem?.data?.parentWindowId);

                const prevDurDate = parentActiveChannel?.value?.actionOption?.durDate;

                if (!prevDurDate) {
                    return placeholderItem;
                }

                const dateFormat = new Date(prevDurDate);
                const placeholderDurType = placeholderItem?.data?.actionOption?.durType?.value;
                const placeholderDurVal = placeholderItem?.data?.actionOption?.durVal;

                const addedDate = placeholderDurType === 'hours'
                    ? getUserCurrentFormat(addHoursToDate(dateFormat, placeholderDurVal))
                    : getUserCurrentFormat(null, {
                        addDaysFromDate: dateFormat,
                        days: placeholderDurVal,
                    });

                return {
                    ...placeholderItem,
                    data: {
                        ...placeholderItem.data,
                        actionOption: {
                            ...placeholderItem.data.actionOption,
                            durDate: addedDate?.dateToString,
                        },
                    },
                };
            });
    });

    let finalJson = type === 'recursivelyUpdate' ? MDCTemplate : updateDayTimeList;
    return finalJson;
};

export const UpdateNodePosition = (paramDetails) => {
    const [tempState, nodeData] = paramDetails;
    let cloneState = _cloneDeep(tempState);
    const {
        currentWindowId,
        position: { x, y },
        nodeType,
    } = nodeData;

    if (nodeType === 'Placeholder' && cloneState['dataSource']['DomId'] === currentWindowId) {
        cloneState['dataSource']['Position'] = { left: x, top: y };
    } else if (nodeType === 'Placeholder') {
        let {
            Campaign: {
                CanvasChannel: { Placeholder },
            },
        } = cloneState;
        const nodeIndex = _findIndex(Placeholder, ['id', currentWindowId]);
        let tempNode = Placeholder[nodeIndex];
        Placeholder[nodeIndex] = { ...tempNode, position: { x, y } };
        cloneState['Campaign']['CanvasChannel']['Placeholder'] = [...Placeholder];
    } else {
        let moduleRslt = getModule(cloneState['Campaign']['CanvasChannel']['activeChannel'], currentWindowId);

        if (moduleRslt && Object.keys(moduleRslt)?.length) {
            if (nodeType === 'ActionItem') {
                moduleRslt['value']['Action']['Position'] = { left: x, top: y };
            } else if (nodeType === 'AddonItem') {
                moduleRslt = getAllModule(cloneState['Campaign']['CanvasChannel']['activeChannel'], currentWindowId);
                if (moduleRslt?.length) {
                    moduleRslt[0]['activeChannel'].forEach((item) => {
                        if (item?.['switchCond']?.['DomId'] === currentWindowId) {
                            item['switchCond']['Position'] = { left: x, top: y };
                        }
                    });
                }
                // moduleRslt['value']['switchCond']['Position'] = { left: x, top: y };
            } else {
                moduleRslt['value']['Position'] = { left: x, top: y };
            }
        } else if (cloneState['dataSource']['DomId'] === currentWindowId) {
            cloneState = { ...cloneState, dataSource: { ...cloneState.dataSource, Position: { left: x, top: y } } };
        }
    }
    const node = [...cloneState.nodeState];
    const nodeIndex = _findIndex(node, ['id', currentWindowId]);
    let tempNode = node[nodeIndex];
    node[nodeIndex] = { ...tempNode, position: { x, y } };

    cloneState = { ...cloneState, nodeState: node };
    return cloneState;
};

export const UpdateMultiNodePosition = (paramDetails) => {
    const [tempState, nodeData] = paramDetails;
    let rslt = {};
    if (nodeData?.length) {
        nodeData.forEach((data, index) => {
            if (index === 0) {
                rslt = UpdateNodePosition([tempState, data]);
            } else {
                rslt = UpdateNodePosition([rslt, data]);
            }
        });
        return rslt;
    }
};
export const updateAllOrAny = (state, payload) => {
    const { currentWindowId: currentSwitchId, isALLorAny } = payload;
    const cloneState = _cloneDeep(state);
    if (
        cloneState['Campaign']['CanvasChannel'].hasOwnProperty('IsChannelSwitched') &&
        cloneState['Campaign']['CanvasChannel']['IsChannelSwitched']
    ) {
        const {
            Campaign: {
                CanvasChannel: {
                    switchCond: { DomId },
                },
            },
        } = cloneState;

        if (DomId == currentSwitchId) {
            cloneState['Campaign']['CanvasChannel']['switchCond']['SelectionMode'] = isALLorAny;
        } else {
            filterDeep(
                cloneState['Campaign']['CanvasChannel']['activeChannel'],
                (value, key, parent) => {
                    if (
                        value.hasOwnProperty('IsChannelSwitched') &&
                        value.hasOwnProperty('switchCond') &&
                        value['switchCond'].hasOwnProperty('DomId') &&
                        value['switchCond']['DomId'] == currentSwitchId
                    ) {
                        value['switchCond']['SelectionMode'] = isALLorAny;
                    }
                },
                { childrenPath: 'activeChannel' },
            );
        }
    } else {
        filterDeep(
            cloneState['Campaign']['CanvasChannel']['activeChannel'],
            (value, key, parent) => {
                if (
                    value.hasOwnProperty('IsChannelSwitched') &&
                    value.hasOwnProperty('switchCond') &&
                    value['switchCond'].hasOwnProperty('DomId') &&
                    value['switchCond']['DomId'] == currentSwitchId
                ) {
                    value['switchCond']['SelectionMode'] = isALLorAny;
                }
            },
            { childrenPath: 'activeChannel' },
        );
    }

    let nodeState = _find(cloneState['nodeState'], ['id', currentSwitchId]);
    nodeState['data']['SelectionMode'] = isALLorAny;
    return cloneState;
};

export const rootNodeLength = (canvasState) => {
    const length = canvasState?.Campaign?.CanvasChannel?.activeChannel?.length || 0;
    return length;
};

export const checkChannelExistInRoot = (canvasState, id) => {
    const activeChannel = _get(canvasState, 'Campaign.CanvasChannel.activeChannel', []);
    let channel;
    let qrChannel;
    if (activeChannel?.length) {
        channel = _find(activeChannel, { ChannelId: id });
        qrChannel = _find(activeChannel, { ChannelId: 'ch003' });
    }

    return channel || qrChannel ? true : false;
};

export const addAttributeData = (state, payload) => {
    const { nodeId, channelId, dynamicListId, actionId } = payload;
    const cloneCanvasData = _cloneDeep(state);
    const moduleRslt = getModule(cloneCanvasData['Campaign']['CanvasChannel']['activeChannel'], nodeId);

    let activeChannel = _get(moduleRslt, 'value.activeChannel', []);
    let findOption = _find(activeChannel, ['actionOption.value', actionId]);
    if (moduleRslt?.value?.ChannelId === channelId) {
        findOption['AttributeSelect'] = true;
        findOption['DynamicListId'] = dynamicListId;
        findOption['actionOption']['attributeSelect'] = true;
        findOption['actionOption']['attributeSwitch'] = true;
        findOption['actionOption']['attribute'] = true;
    }
    return { ...cloneCanvasData };
};
export const removeAttributeData = (state, payload) => {
    const { DomId, channelId, dynamicListId, actionId } = payload;
    const cloneCanvasData = _cloneDeep(state);
    const moduleRslt = getModule(cloneCanvasData['Campaign']['CanvasChannel']['activeChannel'], DomId);

    let activeChannel = _get(moduleRslt, 'value.activeChannel', []);
    let findOption = _find(activeChannel, ['actionOption.value', actionId]);
    if (
        moduleRslt?.value?.ChannelId === channelId &&
        moduleRslt?.value?.DynamicListId === dynamicListId &&
        moduleRslt['value']['actionOption']['value'] === actionId
    ) {
        moduleRslt['value']['AttributeSelect'] = false;
        moduleRslt['value']['DynamicListId'] = 0;
        moduleRslt['value']['actionOption']['attributeSelect'] = false;
    }
    return { ...cloneCanvasData };
};

export const GridAlignment = (state, payload) => {
    const canvasState = _cloneDeep(state);
    const { layoutedNodes, layoutedEdges } = payload;
    layoutedNodes.forEach((item) => {
        const {
            id: currentWindowId,
            position: { x, y },
        } = item;

        let module = canvasState['Campaign']['CanvasChannel']['activeChannel'];
        let moduleRslt = getModule(module, currentWindowId);
        if (item.type === 'SourceItem') {
            canvasState['dataSource']['Position'] = { left: x, top: y };
        } else if (item.type === 'SubSegmentItem') {
            const segmentIndex = canvasState.subSegment?.subSegmentList?.findIndex(
                (segment) => segment.id === currentWindowId,
            );
            if (segmentIndex >= 0) {
                canvasState.subSegment.subSegmentList[segmentIndex] = {
                    ...canvasState.subSegment.subSegmentList[segmentIndex],
                    position: { x, y },
                };
            }
        } else if (item.type === 'Placeholder') {
            const placeholders = canvasState.Campaign?.CanvasChannel?.Placeholder;
            if (Array.isArray(placeholders)) {
                placeholders.forEach((placeholder, index) => {
                    const placeholderId = placeholder?.DomId ?? placeholder?.id ?? placeholder?.data?.currentWindowId;
                    if (placeholderId === currentWindowId) {
                        if (placeholder.Position) {
                            placeholders[index] = {
                                ...placeholder,
                                Position: { left: x, top: y },
                            };
                        } else if (placeholder.position) {
                            placeholders[index] = {
                                ...placeholder,
                                position: { x, y },
                            };
                        }
                    }
                });
            }
        } else if (item.type === 'AddonItem') {
            if (moduleRslt) {
                moduleRslt?.parent?.activeChannel?.forEach((childItem) => {
                    if (childItem?.switchCond?.DomId === currentWindowId) {
                        childItem['switchCond']['Position'] = { left: x, top: y };
                    }
                });
            } else if (
                !moduleRslt &&
                canvasState?.Campaign?.CanvasChannel?.IsChannelSwitched &&
                canvasState?.Campaign?.CanvasChannel?.switchCond?.DomId === currentWindowId
            ) {
                canvasState['Campaign']['CanvasChannel']['switchCond']['Position'] = { left: x, top: y };
            }
        } else if (item.type === 'ChannelItem') {
            if (moduleRslt) {
                moduleRslt['value']['Position'] = { left: x, top: y };
            }
        }
    });

    return { ...canvasState, nodeState: [...layoutedNodes], edgeState: [...layoutedEdges] };
};

export const CanvasSubSegmentCollapseExpand = (nodeId, canvasState, subSegmentLevel) => {
    let collapseOrExpandNodeIdList = [];
    const rslt = getSubSegmentModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], subSegmentLevel);

    if (canvasState['Campaign']['CanvasChannel']['IsChannelSwitched']) {
        let swithId = canvasState['Campaign']['CanvasChannel']['switchCond']['DomId'];
        collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, swithId];
    }
    if (Array.isArray(rslt)) {
        // collapseOrExpandNodeIdList = rslt.map((item) => item?.DomId);
        collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, ...rslt.map((item) => item?.DomId)];
    }
    return collapseOrExpandNodeIdList;
};

export const getSubSegmentModule = (modules, subSegmentLevel) => {
    let result = [];

    filterDeep(
        modules,
        (module) => {
            if (module?.subSegmentLevel === subSegmentLevel) {
                result.push(module);
            }
            return false;
        },
        {
            checkCircular: true,
            childrenPath: 'activeChannel',
        },
    );

    return result;
};

export const getChannelWiseCountInSubSegment = (countData, channelId) => {
    switch (channelId) {
        case 'ch001': // Email
            return countData?.recipientCountEmail;

        case 'ch002': // SMS
            return countData?.recipientCountMobile;

        case 'ch008': // Web push
            return countData?.recipientCountWebPush;

        case 'ch0014': // Mobile push
            return countData?.recipientCountMobilePush;

        case 'ch0026': // Call center
            return countData?.recipientCountMobile;

        case 'ch0025': // VMS
            return countData?.recipientCountVMS;

        case 'ch003': // QR code
            return 0;

        case 'ch0021': // WhatsApp
            return countData?.recipientCountWhatsApp;

        case 'ch0041': // RCS
            return countData?.recipientCountRCS;

        case 'ch0034': // Webhook
            return 0;

        case 'goal001': // Landing page
        case 'goal002':
            return 0;

        default:
            return 0;
    }
};

export async function getCurrentDateTimeByTimezone({ nodeId, canvasState, dispatch }) {
    try {
        const response = await dispatch(getUtcTimeNow());
        if (!response?.utcTime) return '';

        const utcTime = new Date(response.utcTime.split('z')[0]);
        const rootParentActiveChannel = getAllModule(canvasState?.Campaign?.CanvasChannel?.activeChannel, nodeId);

        const { timeZoneId } = getUserDetails();
        const { timeZoneList } = getmasterData();
        const finalTimeZoneId = rootParentActiveChannel[0]?.timezoneId || timeZoneId;
        const profileTimezone = timeZoneList.find((tz) => tz.timeZoneID === finalTimeZoneId);

        if (!profileTimezone?.gmtOffset) return '';

        const cleanOffset = profileTimezone.gmtOffset.replace(/\(GMT|\)/g, '').trim();
        const [_, offsetPart] = cleanOffset.split('+');
        const [hours, minutes] = offsetPart.split(':').map(Number);
        const offsetMs = (hours * 60 + minutes) * 60 * 1000;

        const finalTime = new Date(utcTime.getTime() + offsetMs);
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
            month: 'long',
            day: '2-digit',
            year: 'numeric',
        };

        return await finalTime.toLocaleString('en-US', options);
    } catch (error) {
        return '';
    }
}

export const hasValidChannelStatus = (channelStatusId) => {
    //5 - in progress, 9 - completed, 12 - alert for pending approval
    const validStatusIds = [5, 9, 12];
    return validStatusIds.includes(Number(channelStatusId));
};

export const createNavigateToAnalyticsHandler = ({ source, canvasState, locationState, navigate }) => {
    const allActiveChannel = canvasState['Campaign']['CanvasChannel']['activeChannel'] || [];
    const currentActiveChannel = getModule(allActiveChannel, source);

    return () => {
        const getChannelId =
            MDC_AUTHORING_CHANNEL_CONFIG?.find(
                (channel) => channel?.channelId === currentActiveChannel?.value?.ChannelId,
            )?.id || 0;

        const mdcBackState = { ...locationState };
        const mdcBackEncryptState = encodeUrl(mdcBackState);
        const fromPath = `/communication/mdc-workflow?q=${mdcBackEncryptState}`;

        const state = {
            from: parseInt(locationState.campaignId),
            campaignName: locationState.campaignName,
            isGolden: false,
            startDate: new Date(locationState.startDate),
            endDate: new Date(locationState.endDate),
            campaignTypeValue: locationState.campaignTypeValue,
            campaignId: locationState.campaignId,
            channelId: getChannelId,
            fromPath: fromPath,
            ...handleCustomNavigationDetails(locationState),
        };
        const encryptState = encodeUrl(state);
        navigate(`/analytics/detail-analytics?q=${encryptState}`, {
            state,
        });
    };
};

const MDC_CANVAS_SNAPSHOT_PREFIX = 'mdc-canvas-snapshot:';

const getMdcCanvasSnapshotKey = (campaignId) => `${MDC_CANVAS_SNAPSHOT_PREFIX}${campaignId}`;

export const stashMdcCanvasSnapshot = (campaignId, canvasState) => {
    if (!campaignId || !canvasState?.nodeState?.length) return;
    try {
        sessionStorage.setItem(getMdcCanvasSnapshotKey(campaignId), JSON.stringify(canvasState));
    } catch {
        // sessionStorage quota or serialization failure — skip snapshot
    }
};

export const consumeMdcCanvasSnapshot = (campaignId) => {
    if (!campaignId) return null;
    try {
        const raw = sessionStorage.getItem(getMdcCanvasSnapshotKey(campaignId));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const clearMdcCanvasSnapshot = (campaignId) => {
    if (!campaignId) return;
    try {
        sessionStorage.removeItem(getMdcCanvasSnapshotKey(campaignId));
    } catch {
        // ignore
    }
};
