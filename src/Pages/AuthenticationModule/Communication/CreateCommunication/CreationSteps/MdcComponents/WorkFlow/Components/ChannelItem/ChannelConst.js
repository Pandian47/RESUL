import { addHoursToDate } from 'Utils/modules/dateTime';
import { addDaysToDate } from 'Utils/modules/dateTime';
import { cloneDeep as _cloneDeep, mapKeys as _mapKeys, camelCase as _camelCase } from 'Utils/modules/lodashReplacements';
import { mapDeep, eachDeep } from 'deepdash-es/standalone';

import MdcTemplate from '../../MdcTemplate';
import { getModule, hasValidChannelStatus} from '../../constant';

export const ChannelRemove = (param, preserveParent = false) => {
    const { nodeId: windowId, mdcCanvas } = param;
    let MDCTemplate = _cloneDeep(mdcCanvas);
    let channelList = MDCTemplate['Campaign']['CanvasChannel'];
    let placeholderObj = MDCTemplate['Campaign']['CanvasChannel']?.['Placeholder'] || [];
    let channelDeleteList = [];
    let channelDeleteDomIdList = [];
    let channelDeleteDomIdListForChild = [];
    let isQr = false;
    mapDeep(
        channelList,
        (child, i, parent, ctx) => {
            if (child['DomId'] == windowId && parent) {
                channelDeleteList = ChannelChildDelete(child);
                channelDeleteDomIdListForChild = ChannelChildDeleteDomId(child);
                channelDeleteDomIdList = [...channelDeleteDomIdList, child['DomId']];
                                //reDefineAddOnConnectionDelete(parent, ctx, windowId);
                if (child['ChannelId'] === 'ch003') {
                    isQr = true;
                }
                const {
                    Campaign: {
                        CanvasChannel: { IsChannelSwitched, switchCond, activeChannel },
                        PotentialRecipients: { Recipients },
                    },
                } = MDCTemplate;

                const handlePerserveCurrentChannel = () => {
                    // preserve the parent and remove child  active channel  * schedule remove flow *
                    const removedChannel = parent['activeChannel'][i];
                    if (removedChannel) {
                        removedChannel['activeChannel'] = [];
                    }
                    parent['activeChannel'] = parent['activeChannel'].filter((_, index) => index !== i);
                };

                if (ctx['_item']['depth'] == 1 && !IsChannelSwitched) {
                    if (preserveParent) {
                        handlePerserveCurrentChannel();
                    } else {
                        parent['activeChannel'].splice(i, 1);
                    }
                } else if (ctx['_item']['depth'] == 1 && IsChannelSwitched && parent['activeChannel']?.length === 2) {
                    if (preserveParent) {
                        handlePerserveCurrentChannel();
                    } else {
                        parent['activeChannel'].splice(i, 1);
                    }
                    MDCTemplate['Campaign']['CanvasChannel']['IsChannelSwitched'] = false;
                    MDCTemplate['Campaign']['CanvasChannel']['switchCond'] = {};
                } else if (ctx['_item']['depth'] == 1 && IsChannelSwitched && parent['activeChannel']?.length > 2) {
                    if (preserveParent) {
                        handlePerserveCurrentChannel();
                    } else {
                        parent['activeChannel'].splice(i, 1);
                    }
                } else if (ctx['_item']['depth'] > 1) {
                    if (parent['activeChannel'][i]?.['IsChannelSwitched']) {
                        const {
                            switchCond: { DomId: switchCondDomId },
                        } = parent['activeChannel'][i];
                        if (preserveParent) {
                            handlePerserveCurrentChannel();
                        } else {
                            parent['activeChannel'].splice(i, 1);
                        }

                        parent['activeChannel'].forEach((item, index) => {
                            if (item?.switchCond?.DomId === switchCondDomId) {
                                                                parent['activeChannel'][index]['addOnEnabled'] = false;
                                delete parent['activeChannel'][index]['IsChannelSwitched'];
                                delete parent['activeChannel'][index]['switchCond'];
                            }
                        });
                    } else {
                        if (preserveParent) {
                            handlePerserveCurrentChannel();
                        } else {
                            parent['activeChannel'].splice(i, 1);
                        }
                    }
                }
                // handleAudienceOvelay(0)
            }
        },
        { childrenPath: 'activeChannel' },
    );

    let domIdLIst = [...channelDeleteDomIdList, ...channelDeleteDomIdListForChild];

    // preserve the parent because schedule is remove in first level flow

    if (preserveParent && channelDeleteList?.length) {
        const removeCurrentChannel = channelDeleteList?.filter((deleteList) => deleteList?.levelId > 1);
        channelDeleteList = removeCurrentChannel;
    } else {
        channelDeleteList;
    }

    const deletePlaceholder = placeholderObj.filter((item) => !domIdLIst.includes(item?.data?.parentWindowId));
    MDCTemplate['Campaign']['CanvasChannel']['Placeholder'] = deletePlaceholder;
    if (isQr) {
        MDCTemplate['dataSource']['Type'] = '';
    }
    return { channelDeleteList, MDCTemplate };
};

export const ChannelChildDelete = (childItem) => {
    let channelDeleteList = [];
    eachDeep(
        childItem,
        (child, i, parent, ctx) => {
            if (child.hasOwnProperty('DomId')) {
                // const { ChannelDetailID, ChannelDetailType, LevelNumber, ParentChannelDetailID, Action: { ActionID } } = child;
                const { ChannelDetailID, ChannelDetailType, LevelNumber, ParentChannelDetailID } = child;
                if (ChannelDetailID > 0) {
                    channelDeleteList = [
                        ...channelDeleteList,
                        { ChannelDetailID, ChannelDetailType, LevelID: LevelNumber, ParentChannelDetailID },
                    ];
                }
            }
        },
        { childrenPath: 'activeChannel' },
    );
    channelDeleteList = channelDeleteList?.length
        ? channelDeleteList.map((item) => _mapKeys(item, (v, k) => _camelCase(k)))
        : [];
    return channelDeleteList;
};
export const ChannelChildDeleteDomId = (childItem) => {
    let domIdList = [];
    eachDeep(
        childItem,
        (child, i, parent, ctx) => {
            if (child.hasOwnProperty('DomId')) {
                domIdList = [...domIdList, child['DomId']];
            }
        },
        { childrenPath: 'activeChannel' },
    );

    return domIdList;
};
export const SourceRemove = ({ mdcCanvas }) => {
    let MDCTemplate = _cloneDeep(mdcCanvas);
    let channelList = MDCTemplate['Campaign']['CanvasChannel']['activeChannel'];
    let channelDeleteList = [];
    mapDeep(
        channelList,
        (child, i, parent, ctx) => {
            if (child.hasOwnProperty('DomId')) {
                const { ChannelDetailID, ChannelDetailType, LevelNumber } = child;
                if (ChannelDetailID > 0) {
                    channelDeleteList = [
                        ...channelDeleteList,
                        { ChannelDetailID, ChannelDetailType, LevelID: LevelNumber },
                    ];
                }
            }
        },
        { childrenPath: 'activeChannel' },
    );
    MDCTemplate = {
        ..._cloneDeep(MdcTemplate),
        nodeState: [],
        edgeState: [],
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
    channelDeleteList = channelDeleteList?.length
        ? channelDeleteList.map((item) => _mapKeys(item, (v, k) => _camelCase(k)))
        : [];
    return { channelDeleteList, MDCTemplate };
};

export const popupTemplateList = [
    { name: 'Email', channelId: 'ch001', updateTitle: 'Email preview', placeholderIcon: 'email_xlarge' },
    { name: 'SMS', channelId: 'ch002', updateTitle: 'SMS preview', placeholderIcon: 'mobile_sms_xlarge' },
    {
        name: 'WhatsApp',
        channelId: 'ch0021',
        updateTitle: 'WhatsApp preview',
        placeholderIcon: 'social_whatsapp_xlarge',
    },
    {
        name: 'RCS',
        channelId: 'ch0041',
        updateTitle: 'RCS preview',
        placeholderIcon: 'social_rcs_xlarge',
    },
    { name: 'Web push', channelId: 'ch008', updateTitle: 'Web push preview', placeholderIcon: 'notification_xlarge' },
    {
        name: 'Mobile push',
        channelId: 'ch0014',
        updateTitle: 'Mobile push - Preview',
        placeholderIcon: 'mobile_notification_xlarge',
    },
    {
        name: 'Call center',
        channelId: 'ch0026',
        updateTitle: 'Call center preview',
        placeholderIcon: 'user_call_center_xlarge',
    },
    { name: 'VMS', channelId: 'ch0025', updateTitle: 'VMS preview', placeholderIcon: 'social_vms_xlarge' },
    { name: 'QR code', channelId: 'ch003', updateTitle: 'QR code preview', placeholderIcon: 'qrcode_xlarge' },
    { name: 'Webhook', channelId: 'ch0034', updateTitle: 'Webhook preview', placeholderIcon: 'webhook_xlarge' },
    {
        name: 'Landing page',
        channelId: 'goal001',
        updateTitle: 'Landing page preview',
        placeholderIcon: 'landing_page_xlarge',
    },
    {
        name: 'Landing page',
        channelId: 'goal002',
        updateTitle: 'Landing page preview',
        placeholderIcon: 'landing_page_xlarge',
    },
];

export const findChannelDepth = (canvasState, currentNodeId) => {
    let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], currentNodeId);
    let depth = rslt && rslt['context'] ? rslt['context']['_item']['depth'] : 0;
    return depth;
};

export const GetChannelChild = (nodeId, canvasState) => {
    const rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], nodeId);
        let valid = false;
    if (canvasState['Campaign']?.['CanvasChannel']?.['Placeholder']?.length) {
        canvasState['Campaign']['CanvasChannel']['Placeholder'].forEach((item) => {
            if (item?.data?.parentWindowId === nodeId) {
                valid = true;
            }
        });
    }
    if (rslt?.['value']?.['activeChannel']?.length || valid) {
        return true;
    } else return false;
};

export const GetActionLists = (arg = {}) => {
    const { tempState, data, mdcFlowConfig } = arg;
    let actionList = [
        { id: 'create', value: 'Create content' },
        { id: 'preview', value: 'Preview' },
        { id: 'action', value: 'Actions' },
        { id: 'delete', value: 'Delete' },
    ];
    let rootExceed = false;

    let state = _cloneDeep(tempState);
    let { maxChannelConnection, withGoalOne, withGoalTwo, withoutGoal } = mdcFlowConfig;
    let rslt = getModule(state['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
    if (rslt?.value?.ChannelDetailID > 0) {
        const {
            value: { LevelNumber, ChannelDetailID },
        } = rslt;

        if (tempState?.CampaignGoal?.toLowerCase() === 'conversion') {
            if (LevelNumber > 100 && LevelNumber < 200) {
                withoutGoal = withoutGoal + 100;
            }
            if (LevelNumber > 200) {
                withoutGoal = withoutGoal + 200;
            }
        } else {
            if (rslt?.value?.['ParentChannelDetailType']?.includes('LP')) {
                if (LevelNumber > 300 && LevelNumber < 400) {
                    withoutGoal = withoutGoal + 300;
                }
                if (LevelNumber > 400) {
                    withoutGoal = withoutGoal + 400;
                }
            } else {
                if (LevelNumber > 100 && LevelNumber < 200) {
                    withoutGoal = withoutGoal + 100;
                }
                if (LevelNumber > 200) {
                    withoutGoal = withoutGoal + 200;
                }
            }
        }

        if (LevelNumber >= withoutGoal) {
            let editActionList = actionList.map((item) =>
                item.id === 'create' ? { id: 'edit', value: 'Edit content', disabled: false } : item,
            );

            actionList = editActionList.map((item) =>
                item.id === 'action' ? { ...item, disabled: true } : { ...item, disabled: false },
            );
            rootExceed = true;
        } else {
            let editActionList = actionList.map((item) =>
                item.id === 'create'
                    ? { id: 'edit', value: 'Edit content', disabled: false }
                    : item.id === 'action' && !rslt?.value?.ScheduleDate
                    ? { ...item, disabled: true }
                    : { ...item, disabled: false },
            );
            actionList = editActionList;
            if (tempState?.CampaignGoal?.toLowerCase() === 'conversion') {
                if (
                    data.channelId === 'ch0034' ||
                    data.channelId === 'ch0026' ||
                    (rslt?.value?.['ParentChannelDetailType'] === 'LP1' &&
                        rslt?.value?.['actionOption']['value'] === 22) ||
                    rslt?.value?.['ParentChannelDetailType'] === 'LP2'
                ) {
                    editActionList = editActionList.map((item) =>
                        item.id === 'action' ? { ...item, disabled: true } : { ...item, disabled: false },
                    );
                    actionList = editActionList;
                    rootExceed = true;
                }
            } else {
                    const isNotRegisterAction =
                        rslt?.value?.['ParentChannelDetailType']?.includes('LP') &&
                        rslt?.value?.['actionOption']['value'] === 22;

                    const isMaxLimitExceed = LevelNumber >= 400 && rslt?.value?.['actionOption']['value'] === 21;

                    if (isNotRegisterAction || isMaxLimitExceed) {
                        editActionList = editActionList.map((item) =>
                            item.id === 'action' ? { ...item, disabled: true } : { ...item, disabled: false },
                        );
                        actionList = editActionList;
                        rootExceed = true;
                    }
            }
        }
        [actionList[0], actionList[1]] = [actionList[1], actionList[0]];
    } else {
        let disableAction = actionList.map((item) =>
            item.id === 'action' || item.id === 'preview' ? { ...item, disabled: true } : { ...item, disabled: false },
        );
        actionList = disableAction;
    }
    // Action list modification canvas draw from template flow
    if (rslt?.context?._item?.depth === 1 && state['MdcType'] === 'RecursivelyTraverse_React_Template') {
        if (state?.dataSource?.isSubsegmentJoureny) {
            const isExistSubSegmentSave = state.subSegment.subSegmentList?.find(
                (segment) =>
                    segment.data.subSegmentLevel === rslt?.value?.subSegmentLevel && segment.data.isSubSegmentSave,
            );
            if (!isExistSubSegmentSave) {
                actionList = [
                    { id: 'create', value: 'Create content', disabled: true },
                    { id: 'preview', value: 'Preview', disabled: true },
                    { id: 'action', value: 'Actions', disabled: true },
                    { id: 'delete', value: 'Delete' },
                ];
            }
        }
        if (!state['dataSource']['DataList']?.length) {
            actionList = [
                { id: 'create', value: 'Create content', disabled: true },
                { id: 'preview', value: 'Preview', disabled: true },
                { id: 'action', value: 'Actions', disabled: true },
                { id: 'delete', value: 'Delete' },
            ];
        }
    } else if (rslt?.context?._item?.depth > 1 && state['MdcType'] === 'RecursivelyTraverse_React_Template') {
        if (!rslt?.parent?.ChannelDetailID) {
            actionList = [
                { id: 'create', value: 'Create content', disabled: true },
                { id: 'preview', value: 'Preview', disabled: true },
                { id: 'action', value: 'Actions', disabled: true },
                { id: 'delete', value: 'Delete' },
            ];
        }
    }
    if (hasValidChannelStatus(rslt?.value?.statusId)) {
        actionList = actionList.map((item) => {
            if (item?.id === 'create' || item?.id === 'edit') {
                return { ...item, value: 'View content' };
            } else {
                return item;
            }
        });
    }
    if (rslt?.value?.ScheduleDate && new Date() >= new Date(rslt?.value?.ScheduleDate)) {
        actionList = actionList.map((item) => {
            if (item?.id === 'delete') {
                return { ...item, disabled: true };
            } else if (item?.id === 'create' || item?.id === 'edit') {
                return { ...item, value: 'View content' };
            } else {
                return item;
            }
        });
    }
        return { actionList, rootExceed };
};

export const UpdateScheduleDateForTemplateActiveChannel = (canvasState, nodeId) => {
    let tempState = _cloneDeep(canvasState);

    let resultState = getModule(tempState['Campaign']['CanvasChannel']['activeChannel'], nodeId);
        if (resultState?.value?.activeChannel?.length) {
        let parentDate = resultState.value.ScheduleDate;
        let addedDate;
        resultState.value.activeChannel.forEach((item) => {
            if (item?.actionOption?.durVal) {
                let durVal = item?.actionOption?.durVal;
                let durType = item?.actionOption?.durType;
                let dateFormat = new Date(parentDate);
                if (durType['value'] === 'days') addedDate = addDaysToDate(dateFormat, durVal);
                if (durType['value'] === 'hours') addedDate = addHoursToDate(dateFormat, durVal);

                item['actionOption']['durDate'] = addedDate;
                item['ScheduleDate'] = addedDate;
            }
        });
    }
        return tempState;
};
