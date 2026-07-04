import { eachDeep } from 'deepdash-es/standalone';
import { GetAudienceBasedOnChannel, GetChannelStyleAttributes } from '../../constant';
export const targetCode = { Reach: 'R', Engagement: 'E', Conversion: 'C' };
export const convertTemplate = (TempMdcTemplate) => {
        const mdcTemplate = structuredClone(TempMdcTemplate);

    mdcTemplate['MdcType'] = 'RecursivelyTraverse_React_Template';
    mdcTemplate['ReceipientCount'] = '';
    mdcTemplate['dataSource']['DataList'] = [];
    mdcTemplate['dataSource']['ListType'] = [];
    mdcTemplate['Campaign']['PotentialRecipients']['Recipients'] = [];
    // mdcTemplate['edgeState'] = [];
    // mdcTemplate['nodeState'] = [];
    let activeChannel = mdcTemplate['Campaign']['CanvasChannel']['activeChannel'];
    const isSubsegmentJourney = mdcTemplate['dataSource']['isSubsegmentJoureny'];
    clearParentJson(activeChannel);
    mdcTemplate['nodeState'].forEach((item) => {
        if (item?.data?.audienceCount) {
            item.data.audienceCount = 0;
        }
        if (isSubsegmentJourney && item.type === 'SubSegmentItem') {
            Object.assign(item.data, {
                audienceCount: 0,
                isExtractionStatus: false,
                isSubSegmentSave: false,
                subSegmentSaveCount: 0,
                subSegmentId: 0,
                subSegmentGUID: '',
            });
            item.channelWiseCount = {};
        }
    });
    mdcTemplate['edgeState'].forEach((item) => {
        if (item?.label) {
            item.label = 0;
        }
        if (item?.data?.label) {
            item.data.label = 0;
        }
    });
    if (isSubsegmentJourney && Array.isArray(mdcTemplate.subSegment?.subSegmentList)) {
        mdcTemplate.subSegment.subSegmentList.forEach((subSeg) => {
            Object.assign(subSeg.data, {
                audienceCount: 0,
                isExtractionStatus: false,
                isSubSegmentSave: false,
                isubSegmentSaveCount: 0,
                subSegmentId: 0,
                subSegmentGUID: '',
            });
            subSeg.channelWiseCount = {};
        });
        mdcTemplate.updatedCount = 0
        mdcTemplate.disableNodeList = []
    }
        return { mdcTemplate };
};

export const clearParentJson = (activeChannel) => {
    const emptyObjList = {
        activeChannel: {
            ChannelDetailID: 0,
            ContentThumbnailPath: '',
            ScheduleDate: '',
            T1: '',
            B1: '',
            C1: '',
            B2: '',
            TotalCount: 0,
            AttributeSelect: false,
            IsSplitAbEnabled: false,
            ParentChannelDetailID: 0,
            ChannelDetailID: 0,
            AccountLogo: '',
            AccountName: '',
            DynamicListID: '',
            audienceCount: 0
        },
        action: { ActionTime: '', ActionTimeDuration: '' },
        actionOption: { durDate: '' },
    };

    if (activeChannel?.length) {
        activeChannel.forEach((item, index) => {
            let channelKeys = Object.keys(item);
            let configChannelKeys = Object.keys(emptyObjList['activeChannel']);
            let actionKeys = item.hasOwnProperty('Action') ? Object.keys(item['Action']) : [];
            let configActionKeys = Object.keys(emptyObjList['action']);
            let actionOptionKeys =
                item.hasOwnProperty('actionOption') && item['actionOption'] ? Object.keys(item['actionOption']) : [];
            let configActionOptionKeys = Object.keys(emptyObjList['actionOption']);

            if (channelKeys?.length) {
                configChannelKeys.forEach((configChannelItem) => {
                    if (channelKeys.includes(configChannelItem)) {
                        activeChannel[index][configChannelItem] = emptyObjList['activeChannel'][configChannelItem];
                    }
                });
            }
            if (actionKeys?.length) {
                configActionKeys.forEach((configActionItem) => {
                    if (actionKeys.includes(configActionItem)) {
                        activeChannel[index]['Action'][configActionItem] = emptyObjList['action'][configActionItem];
                    }
                });
            }
            if (actionOptionKeys?.length) {
                configActionOptionKeys.forEach((configActionOptionItem) => {
                    if (actionOptionKeys.indexOf(configActionOptionItem)) {
                        activeChannel[index]['actionOption'][configActionOptionItem] =
                            emptyObjList['actionOption'][configActionOptionItem];
                    }
                });
            }
            if (activeChannel[index].hasOwnProperty('activeChannel') && activeChannel[index]['activeChannel']?.length) {
                clearParentJson(activeChannel[index]['activeChannel']);
            }
        });
    }
};

export const ConvertRecursivelyTraverseToReact = (tempJson) => {
    let mdcTemplate = structuredClone(tempJson);
    const {
        Campaign: {
            CanvasChannel: { activeChannel, Placeholder, IsChannelSwitched, switchCond },
            PotentialRecipients: { Recipients },
        },
        dataSource,
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
    let rootWindowId = DomId,
        loopCount = 0;
    const handleList = ['A1', 'A2', 'A3', 'A4'];
    if (IsChannelSwitched) {
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
    eachDeep(
        activeChannel,
        (child, i, parent, ctx) => {
            let parentWindowId = ctx['_item']['depth'] === 1 ? rootWindowId : parent?.['DomId'];
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
                    data: {
                        action,
                        parentWindowId: parent['DomId'],
                        currentWindowId: DomId,
                        nodeId: DomId,
                        edgeEndLabel: actionOption,
                        SelectionMode,
                    },
                };
                nodeFormat = [...nodeFormat, addonElementItem];
            }
                        let action = ctx['_item']['depth'] > 1 && !addOnEnabled ? true : false;
            let audienceCount = ctx['_item']['depth'] === 1 ? GetAudienceBasedOnChannel(ChannelId, Recipients) : {};
            parentWindowId = addOnEnabled ? child['switchCond']['DomId'] : parentWindowId;
            let sourceHandle = addOnEnabled ? `A${addOnLevel}` : '';
            let { channelBgClassName, icon, channelColorCode } = GetChannelStyleAttributes(ChannelId);
            let isSplitAb = IsSplitAbEnabled && ctx['_item']['depth'] === 1 ? IsSplitAbEnabled : false;
            /*handle parent addon */
            if (IsChannelSwitched && ctx['_item']['depth'] === 1) {
                sourceHandle = handleList[i];
            }

            /*handle parent addon */
            let childChannel = {
                id: DomId,
                type: 'ChannelItem',
                sourcePosition: 'right',
                targetPosition: 'left',
                position: { x: left, y: top },
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
                    audienceCount,
                    edgeEndLabel: actionOption,
                    isSplitAb,
                },
                className: 'channel-item-dropped',
            };
            nodeFormat = [...nodeFormat, childChannel];
            loopCount++;
        },
        { childrenPath: 'activeChannel' },
    );

    if (Placeholder && Placeholder?.length) {
        nodeFormat = [...nodeFormat, ...Placeholder];
    }
    return { ...tempJson, nodeState: nodeFormat };
};
