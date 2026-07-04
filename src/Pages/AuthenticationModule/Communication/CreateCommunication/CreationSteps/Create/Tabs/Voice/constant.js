import { isValidDate } from 'Utils/modules/uiToast';
import { getUserDetails } from 'Utils/modules/crypto';
import { map as _map, get as _get, reduce as _reduce } from 'Utils/modules/lodashReplacements';

import { formatDateScheculer, handleAllChannelPayload, handleAllChannelTimeZonePayload, handleMDCExtraPayload } from '../../constant';

export const formInitailState = {
    defaultValues: {
        vendorName: '',
        audience: [],
        isCGTGEnabled: false,
        isCGTGConfirm: false,
        template: [],
        description: '',
        schedule: null,
    },
    mode: 'onTouched',
};

export const buildPayload = (formState, location) => {
        let {
        audience,
        description,
        schedule,
        timezone,
        userId,
        clientId,
        departmentId,
        campaignId,
        campaignType,
        content,
        dataSource = 'TL',
        levelNumber = 1,
        dynamiclistId = 0,
        domId = '',
        addOnLevel = 1,
        isALLorAny = 'ALL',
        parentChannelDetailId = 0,
        parentChannelDetailType = '',
        actionId = 1,
        actionTime = 1,
        activeChannel = 26,
        actionTimeDuration = 'D',
        channelFriendlyName = '',
        channelDetailType = 'C',
        channelId = 'ch0026',
        flowChannel = '',
        daylightSavings,
        transferAgree,
        vendorName,
        rightAttributes
    } = formState;
    const totalAudience = _reduce(audience, (prev, cur) => prev + cur.recipientCountEmail, 0);
    const { timeZoneId = 0 } = getUserDetails();
    if (levelNumber > 1) {
        schedule = new Date();
    }
    return {
        userId,
        departmentId,
        clientId,
        copy: false,
        createdBy: userId,
        segmentationListId: _map(audience, 'segmentationListId'),
        dataSource: campaignType === 'T' ? 'DL' : dataSource, //--s
        vccCampaign: {
            campaignId,
            campaignType,
            totalAudience,
            levelNumber, //--s
            dynamiclistId, ///--s
            domId, //--s
            addOnLevel, //--s
            isALLorAny, //--s
            parentChannelDetailId, //--s
            parentChannelDetailType, //--s
            actionId, //--s
            actionTime, //--s
            activeChannel, //--s
            actionTimeDuration, //--s
            channelFriendlyName, //--s
            channelDetailType, //--s
            channelId, //--s
            flowChannel, //--s
            isOptInEnabled: transferAgree,
            dataAttributeIds: _map(rightAttributes, 'dataAttributeId'),
            voiceSettingId: vendorName?.webHookSettingId,
            content: [
                {
                    ccChannelDetailId: _get(content?.[0], 'ccChannelDetailId', 0),
                    content: description,
                    timeZoneId: handleAllChannelTimeZonePayload(
                        campaignType,
                        location?.timeZoneId,
                        timezone,
                        timeZoneId,
                        location
                    ),
                    localBlastDateTime: isValidDate(schedule) ? formatDateScheculer(schedule) : '',
                    daylightSavings: daylightSavings || false,
                },
            ],
            ...handleMDCExtraPayload(location),
            ...handleAllChannelPayload('callCenter', formState),
        },
    };
};

export const voiceTypes = {
    'callCenter' : 'C',
    'webhook': 'W'
}