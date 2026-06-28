import { memo, useContext, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import { Handle, Position } from 'reactflow';
import { useDispatch, useSelector } from 'react-redux';

import _cloneDeep from 'lodash/cloneDeep';

import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import { findChannelExistForLp, GenerateNodeIdForAddon, GenerateNodePositionForAddon, GetAudienceBasedOnChannel } from '../../constant';
import { ItemTypes } from '../MdcSidebar/ItemTypes';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { DROP_WARN_GOAL } from 'Constants/GlobalConstant/Placeholders';
import { isOfflineConversionGoalSelection, OFFLINE_CONVERSION_CODES } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';

export default memo(({ data, allowedDropEffect }) => {
    const dispatch = useDispatch();
    const [campaignId, setCampaignId] = useState(0);
    const location = useQueryParams('/communication') || {};

    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { lastUpdatedCanvasState, setOfflineConversionChannelWarningPopup } = useContext(CreateWorkFlowOtherContext);

    const { defaultEle, nodeState } = canvasState;
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [canvasNode, setCanvasNode] = useState([...nodeState]);

    useEffect(() => {
        setCanvasNode(nodeState);
    }, [nodeState]);

    useEffect(() => {
        const { campaignId } = location;
        setCampaignId(campaignId);
    }, [location]);

    const handleSubSegmentActiveChannel = () => {
        const currentSubSegment = data.subSegmentLevel;
        const subSegmentLevelMatchActiveChannelList = canvasState['Campaign']['CanvasChannel']['activeChannel']?.filter(
            (channel) => channel.subSegmentLevel === currentSubSegment,
        );

        return subSegmentLevelMatchActiveChannelList;
    };

    const handleAddOnCondition = () => {
        if (canvasState?.dataSource?.isSubsegmentJoureny) {
            const subSegmentLevelMatchActiveChannelList = handleSubSegmentActiveChannel();
            if (subSegmentLevelMatchActiveChannelList?.length <= 1) {
                return true;
            } else {
                return false;
            }
        } else {
            return canvasState['Campaign']['CanvasChannel']['activeChannel'].length == 1;
        }
    };

    const handleAddOnNextLevelCondition = () => {
        const isJourney = canvasState?.dataSource?.isSubsegmentJoureny;
        if (isJourney) {
            const subSegmentLevelMatchActiveChannelList = handleSubSegmentActiveChannel();
            if (
                subSegmentLevelMatchActiveChannelList?.length >= 2 &&
                subSegmentLevelMatchActiveChannelList?.length < 5
            ) {
                return true;
            } else {
                return false;
            }
        } else {
            return canvasState['Campaign']['CanvasChannel']['activeChannel'].length >= 2 &&
                canvasState['Campaign']['CanvasChannel']['activeChannel'].length < !isJourney
                ? 4
                : 20;
        }
    };

    const handleChannelWiseCountCheck = (item, isAddOn) => {
        let audienceCount;
        const activeChannel = canvasState['Campaign']['CanvasChannel']['activeChannel'];
        const RecipientsList = canvasState['Campaign']['PotentialRecipients']['Recipients'];

        let findSegmentItem = canvasState?.subSegment?.subSegmentList?.find(
            (segment) => segment.data.subSegmentLevel === data.subSegmentLevel,
        );

        const segmentLevelWiseActiveChannel = activeChannel?.filter(
            (active) => active.subSegmentLevel === data.subSegmentLevel,
        );

        const finalActiveChannel = !canvasState?.dataSource?.isSubsegmentJoureny
            ? activeChannel
            : segmentLevelWiseActiveChannel;

        let finalAudienceList = !canvasState?.dataSource?.isSubsegmentJoureny
            ? RecipientsList
            : findSegmentItem?.channelWiseCount
            ? [findSegmentItem?.channelWiseCount]
            : RecipientsList;
        audienceCount = GetAudienceBasedOnChannel(item.listType, finalAudienceList);

        if (!isAddOn && !finalActiveChannel?.length) {
            audienceCount = GetAudienceBasedOnChannel(item.listType, finalAudienceList);
        } else if (isAddOn) {
            audienceCount = GetAudienceBasedOnChannel(item.listType, finalAudienceList);
        } else {
            return true;
        }

        return audienceCount;
    };

    const handleWarningCountMessage = (audienceCount) => {
        if (!audienceCount) {
            if (canvasState?.['dataSource']?.['Type'] === 'Recipient' && !audienceCount) {
                return {
                    dropError: {
                        type: 'recipients',
                        count: audienceCount,
                        ...(canvasState?.dataSource?.isSubsegmentJoureny && {
                            isSubSegment: {
                                subSegmentLevel: data?.subSegmentLevel,
                                status: true,
                            },
                        }),
                    },
                };
            }
        } else {
            return false;
        }
    };

    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: [ItemTypes.Source, 'LP'],
            drop: (item, monitor) => {
                // debugger;
                if (item?.listType && item.listType.includes('ch00')) {
                    const checkOffline = (goalData) => {
                        if (!goalData) return false;
                        if (typeof goalData === 'string') {
                            return goalData.split(',').some((c) => OFFLINE_CONVERSION_CODES.includes(c.trim()));
                        }
                        return isOfflineConversionGoalSelection(goalData);
                    };

                    const isOfflineActive =
                        checkOffline(location?.primaryGoalType || canvasState?.primaryGoalType) ||
                        checkOffline(location?.secondaryGoalType || canvasState?.secondaryGoalType);

                    const supportedOfflineChannels = ['ch001', 'ch002', 'ch0021', 'ch0041'];

                    if (isOfflineActive && !supportedOfflineChannels.includes(item.listType)) {
                        setOfflineConversionChannelWarningPopup({
                            show: true,
                            incompatibleChannelLabels: [item.friendlyName || 'Unknown Channel'],
                        });
                        return;
                    }
                }

                if (item.listType === `SRC_TargetList`) {
                    let stateVal = canvasNode.filter((canvasItem) => canvasItem.id === item.nodeId)[0];
                    stateVal.type = 'SourceItem';
                    stateVal.className = 'source-item-dropped';
                    stateVal.sourcePosition = 'right';
                    stateVal.data = { nodeId: item.nodeId, parentWindowId: 0 };

                    dispatchState({
                        type: 'TARGET_LIST_DROP',
                        payload: stateVal,
                    });
                } else if (item.listType === `SRC_DynamicList`) {
                    let stateVal = canvasNode.filter((canvasItem) => canvasItem.id === item.nodeId)[0];
                    stateVal.type = 'DynamicItem';
                    stateVal.className = 'dynamic-item-dropped';
                    stateVal.sourcePosition = 'right';
                    stateVal.data = { nodeId: item.nodeId, parentWindowId: 0 };

                    dispatchState({
                        type: 'DYNAMIC_LIST_DROP',
                        payload: stateVal,
                    });
                } else if (item.listType === `ch003`) {
                    let stateVal = canvasNode.filter((canvasItem) => canvasItem.id === data.nodeId)[0];
                    let friendlyNameWindowId = data.nodeId.split('flowchartWindow')[1];
                    stateVal.type = 'ChannelItem';
                    stateVal.className = 'channel-item-dropped';
                    stateVal.sourcePosition = 'right';
                    stateVal.targetPosition = 'left';
                    let tempData = {
                        channelId: item.listType,
                        channelIcon: item.icon,
                        channelBgClassName: item.bgClassName,
                        channelFriendlyName: `{ ${item.friendlyName}${friendlyNameWindowId} }`,
                        nodeId: stateVal.id,
                        selectedAudienceList: data.selectedAudienceList,
                    };
                    stateVal.data = { ...stateVal['data'], ...tempData };

                    dispatchState({
                        type: 'QR_CODE_DROP',
                        payload: stateVal,
                    });
                } else if (
                    item.listType.includes('ch00') &&
                    item['listType'] !== 'ch003' &&
                    !data['elementAddOnType']
                ) {
                    let findSegmentItem = canvasState?.subSegment?.subSegmentList?.find(
                        (segment) => segment.data?.subSegmentLevel === data?.subSegmentLevel,
                    );

                    const audienceCount = handleChannelWiseCountCheck(item, data['elementAddOnType']);
                    const warningStatus = handleWarningCountMessage(audienceCount);
                    if (warningStatus) return warningStatus;

                    let stateVal = canvasNode.find((canvasItem) => canvasItem.id === data.currentWindowId);
                    if (!stateVal) return;

                    let friendlyNameWindowId = data.currentWindowId.split('flowchartWindow')[1];

                    let updatedStateVal = {
                        ...stateVal,
                        type: 'ChannelItem',
                        className: 'channel-item-dropped',
                        sourcePosition: 'right',
                        targetPosition: 'left',
                        data: {
                            ...stateVal.data,
                            channelId: item.listType,
                            channelIcon: item.icon,
                            channelBgClassName: item.bgClassName,
                            channelFriendlyName: `{${item.friendlyName}${friendlyNameWindowId}}`,
                            nodeId: stateVal.id,
                            selectedAudienceList: data.selectedAudienceList,
                            ...(canvasState?.dataSource?.isSubsegmentJoureny && {
                                subSegmentLevel: findSegmentItem?.data?.subSegmentLevel,
                                isNestedLevelActiveChannel: data.isNestedLevelActiveChannel,
                            }),
                            ...(!data.isNestedLevelActiveChannel && {
                                audienceCount: parseInt(audienceCount, 10),
                            }),
                        },
                    };

                    lastUpdatedCanvasState.current = canvasState;

                    dispatchState({
                        type: 'CHANNEL_DROP',
                        payload: updatedStateVal,
                    });
                } else if (
                    item.listType.includes('ch00') &&
                    item['listType'] !== 'ch003' &&
                    data['elementAddOnType'] &&
                    handleAddOnCondition()
                    // canvasState['Campaign']['CanvasChannel']['activeChannel'].length == 1
                ) {
                    const isJourney = canvasState['dataSource']['isSubsegmentJoureny'];

                    let findSegmentItem = canvasState?.subSegment?.subSegmentList?.find(
                        (segment) => segment.data?.subSegmentLevel === data?.subSegmentLevel,
                    );

                    const audienceCount = handleChannelWiseCountCheck(item, data['elementAddOnType']);
                    const warningStatus = handleWarningCountMessage(audienceCount);
                    if (warningStatus) return warningStatus;

                    const subSegmentLevel = canvasState['Campaign']['CanvasChannel']['activeChannel']?.filter(
                        (active) => active?.subSegmentLevel === data?.subSegmentLevel,
                    );

                    let existingChannelNodeId = isJourney
                        ? subSegmentLevel[subSegmentLevel?.length - 1]['DomId']
                        : canvasState['Campaign']['CanvasChannel']['activeChannel'][0]['DomId'];
                    const nodeId = GenerateNodeIdForAddon(canvasState, 'sub');
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
                    let addOnEletempData = {
                        action: true,
                        channelBgClassName: item.bgClassName,
                        parentWindowId: isJourney
                            ? currentChannel?.data?.parentWindowId
                            : canvasState['dataSource']['DomId'],
                        currentWindowId: nodeId[0],
                        nodeId: nodeId[0],
                        SelectionMode: 'All',
                        ...(isJourney && {
                            subSegmentLevel: findSegmentItem?.data?.subSegmentLevel,
                        }),
                    };
                    addOnEle.data = { ...addOnEletempData };
                    /* Addon element object end */

                    /* Addon channel object start */
                    //let addOnChannel = _cloneDeep(defaultEle);
                    let addOnChannel = canvasNode.filter((canvasItem) => canvasItem.id === data.currentWindowId)[0];
                    let friendlyNameWindowId = data.currentWindowId.split('flowchartWindow')[1];
                    // addOnChannel.id = nodeId[1];
                    addOnChannel.type = 'ChannelItem';
                    addOnChannel.className = 'channel-item-dropped';
                    addOnChannel.position = newChannelPosition;
                    addOnChannel.sourcePosition = 'right';
                    addOnChannel.targetPosition = 'left';
                    addOnChannel.levelNumber = 1;
                    let tempData = {
                        channelId: item.listType,
                        channelIcon: item.icon,
                        channelBgClassName: item.bgClassName,
                        channelFriendlyName: `{${item.friendlyName}${friendlyNameWindowId}}`,
                        sourceHandle: 'A2',
                        parentWindowId: nodeId[0],
                        currentWindowId: addOnChannel.id,
                        isAllOrAny: true,
                        nodeId: addOnChannel.id,
                        audienceCount: audienceCount,
                        ...(isJourney && {
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
                    lastUpdatedCanvasState.current = canvasState;
                    dispatchState({
                        type: 'CREATE_PARENT_ADDON_CHANNEL',
                        payload: { exChannel: currentChannel, addOnChannel, addOnEle },
                    });
                } else if (
                    item.listType.includes('ch00') &&
                    item['listType'] !== 'ch003' &&
                    data['elementAddOnType'] &&
                    handleAddOnNextLevelCondition()
                ) {
                    let findSegmentItem = canvasState?.subSegment?.subSegmentList?.find(
                        (segment) => segment.data?.subSegmentLevel === data?.subSegmentLevel,
                    );

                    const audienceCount = handleChannelWiseCountCheck(item, data['elementAddOnType']);
                    const warningStatus = handleWarningCountMessage(audienceCount);
                    if (warningStatus) return warningStatus;

                    const isJourney = canvasState['dataSource']['isSubsegmentJoureny'];

                    const subSegmentLevel = canvasState['Campaign']['CanvasChannel']['activeChannel']?.filter(
                        (segment) => segment?.subSegmentLevel === data?.subSegmentLevel,
                    );

                    let existingChannelNodeId = isJourney
                        ? subSegmentLevel[subSegmentLevel?.length - 1]['DomId']
                        : canvasState['Campaign']['CanvasChannel']['activeChannel'][1]['DomId'];
                    let currentChannel = nodeState.filter((nodeItem) => nodeItem.id === existingChannelNodeId)[0];

                    let addOnChannel = canvasNode.filter((canvasItem) => canvasItem.id === data.currentWindowId)[0];
                    let friendlyNameWindowId = data.currentWindowId.split('flowchartWindow')[1];
                    // addOnChannel.id = nodeId[1];
                    addOnChannel.type = 'ChannelItem';
                    addOnChannel.className = 'channel-item-dropped';
                    addOnChannel.sourcePosition = 'right';
                    addOnChannel.targetPosition = 'left';
                    addOnChannel.levelNumber = 1;
                    let tempData = {
                        channelId: item.listType,
                        channelIcon: item.icon,
                        channelBgClassName: item.bgClassName,
                        channelFriendlyName: `{${item.friendlyName}${friendlyNameWindowId}}`,
                        sourceHandle: 'A3',
                        parentWindowId: isJourney
                            ? currentChannel?.data?.parentWindowId
                            : canvasState['Campaign']['CanvasChannel']['switchCond']['DomId'],
                        currentWindowId: addOnChannel.id,
                        isAllOrAny: true,
                        nodeId: addOnChannel.id,
                        audienceCount: audienceCount,
                        ...(isJourney && {
                            subSegmentLevel: currentChannel?.data?.subSegmentLevel,
                        }),
                    };
                    addOnChannel.data = { ...tempData };

                    // console.log('channel droped itemw', stateVal, canvasNode);
                    lastUpdatedCanvasState.current = canvasState;
                    if (isJourney) {
                        const currSegemntLvlActiveChannel = handleSubSegmentActiveChannel();
                        if (currSegemntLvlActiveChannel?.length >= 2 && currSegemntLvlActiveChannel?.length <= 4) {
                            dispatchState({
                                type: 'CREATE_PARENT_ADDON_CHANNEL_THREE',
                                payload: { addOnChannel },
                            });
                        }
                    } else {
                        if (canvasState['Campaign']['CanvasChannel']['activeChannel']?.length === 2) {
                            dispatchState({
                                type: 'CREATE_PARENT_ADDON_CHANNEL_THREE',
                                payload: { addOnChannel },
                            });
                        }
                        if (canvasState['Campaign']['CanvasChannel']['activeChannel']?.length === 3) {
                            lastUpdatedCanvasState.current = canvasState;
                            dispatchState({
                                type: 'CREATE_PARENT_ADDON_CHANNEL_FOUR',
                                payload: { addOnChannel },
                            });
                        }
                    }
                } else if (item.listType.includes('goal00')) {
                    let currentNodeValue = canvasNode.find((canvasItem) => canvasItem.id === data.currentWindowId);
                    let isEligibleLP =
                        location?.primaryGoal &&
                        location?.primaryGoal !== 'Conversion' &&
                        currentNodeValue?.data?.actionOption?.name === 'Clicked' &&
                        currentNodeValue?.data?.actionOption?.value === 3;
                    if (isEligibleLP) {
                        let stateVal = canvasNode.filter((canvasItem) => canvasItem.id === data.currentWindowId)[0];
                                                let friendlyNameWindowId = data.currentWindowId.split('flowchartWindow')[1];
                        let rslt = findChannelExistForLp(
                            canvasState['Campaign']['CanvasChannel']['activeChannel'],
                            item.listType,
                        );
                        let custChannelId = `goal001`;
                        const filterGoalList = canvasNode
                            ?.filter((node) => node.type === 'GoalItem')
                            ?.map((goal) => goal.data.channelId);
                        const goalList = filterGoalList?.length ? filterGoalList : [];
                        const goalIdList = goalList?.map((goalId) => parseInt(goalId?.replace('goal00', ''), 10));
                        const maxLength = goalIdList?.length ? Math.max(...goalIdList) : 0;
                        custChannelId = `goal00${maxLength + 1}`;
                                                stateVal.type = 'GoalItem';
                        stateVal.className = 'goal-item-dropped';
                        stateVal.sourcePosition = 'right';
                        stateVal.targetPosition = 'left';
                        let tempData = {
                            channelId: !custChannelId ? item.listType : custChannelId,
                            channelIcon: item.icon,
                            channelBgClassName: item.bgClassName,
                            channelFriendlyName: `{ ${item.friendlyName}${friendlyNameWindowId} }`,
                            nodeId: stateVal.id,
                            selectedAudienceList: data.selectedAudienceList,
                        };
                        stateVal.data = { ...stateVal['data'], ...tempData };
                                                dispatchState({
                            type: 'CHANNEL_DROP',
                            payload: stateVal,
                        });
                    } else {
                        return {
                            dropError: {
                                type: 'goalSource',
                                message: DROP_WARN_GOAL,
                                isChannelPlaceholder: true,
                            },
                        };
                    }
                }
            },
            collect: (monitor, connect) => ({
                isOver: (() => {
                                        return monitor.isOver();
                })(),
                canDrop: (() => {
                                        return monitor.canDrop();
                })(),
            }),
        }),
        [allowedDropEffect, canvasState, data],
    );

    const isActive = canDrop && isOver;
    const borderColor = selectBackgroundColor(isActive, canDrop);
    return (
        <div className="placeholder-text res-mdc-placeholder" ref={drop} style={{ borderColor }}>
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#555', visibility: 'hidden', right: 0, left: -2 }}
                onConnect={(params) => {}}
                isConnectable={`true`}
            />
            <div> {isActive ? 'Release to drop' : 'Drop here'} </div>
        </div>
    );
});

const selectBackgroundColor = (isActive, canDrop) => {
    if (isActive) {
        return '#2914d3';
    } else if (canDrop) {
        return 'red';
    } else {
        return '#a99c9c';
    }
};
