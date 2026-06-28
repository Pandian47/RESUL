import { channelIds, analyticsIds, getChannelId } from 'Utils/modules/communicationChannels';
import { getIndexBasedOnCampaign, getStatus } from 'Utils/modules/communicationStatus';
import { encodeUrl, encryptWithAES } from 'Utils/modules/crypto';
/**
 * Mirrors `CommunicationCards.jsx` campaign + channel edit navigation so Plan/Create screens
 * fire the same bootstrap APIs (GetCampaignPlanByID, GetCommunicationreference, GetEmailCommunication, etc.).
 */
import _get from 'lodash/get';
import _forEach from 'lodash/forEach';
import _ from 'lodash';

import { updateCommunicationData, updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import {
    setTabforEdit,
    updateTab,
    updateMDCEditMode,
} from 'Reducers/communication/createCommunication/Create/reducer';
import { availableTabs } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/constant';
import { handleQrTypeTab } from 'Pages/AuthenticationModule/Communication/CommunicationLists/Pages/Listings/constant';
import {
    CHANNEL_TYPES,
    getGoalType,
    getEligibleChannelIds,
} from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';
import { MDC_AUTHORING_CHANNEL_CONFIG } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/MdcComponents/Create/constant';
import { getTriggerDynamicListChanneltype } from 'Reducers/communication/createCommunication/plan/request';


import {
    getApiResponseRow,
    normalizeCommunicationCardRow,
    normalizeLevelsCreatedContent,
    resolveEmailChannelDetailId,
    firstResolvedCampaignId,
    getNameType,
    handleCommunicationStatus,
    openResulGeniePathInNewTab as openAppPathInNewTab,
} from 'resul-genie-ui';

export { normalizeCommunicationCardRow, openResulGeniePathInNewTab as openAppPathInNewTab } from 'resul-genie-ui';

/** Numeric ids mirrored from `getStatus` in `communicationStatus.jsx`. */
const GENIE_STATUS_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 20, 26, 27, 45, 51, 52, 70];

function resolveGenieStatusIdFromLabel(communicationStatus = '') {
    const label = String(communicationStatus ?? '').trim();
    if (!label) return 0;

    const asNum = Number(label);
    if (!Number.isNaN(asNum) && label === String(asNum)) {
        return asNum;
    }

    const normalized = label.toLowerCase();
    for (const id of GENIE_STATUS_IDS) {
        if (getStatus(id).status.toLowerCase() === normalized) {
            return id;
        }
    }

    const fromLabel = getStatus(label);
    for (const id of GENIE_STATUS_IDS) {
        if (id > 0 && getStatus(id).status === fromLabel.status && getStatus(id).className === fromLabel.className) {
            return id;
        }
    }

    return 0;
}

function resolveGenieCommunicationStatusId({ apiRow, row, detail, communicationStatus }) {
    const candidates = [
        apiRow?.statusId,
        apiRow?.statusID,
        row?.statusId,
        row?.statusID,
        detail?.statusId,
        detail?.statusID,
    ];
    for (const candidate of candidates) {
        if (candidate == null || candidate === '') continue;
        const parsed = Number(candidate);
        if (!Number.isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return resolveGenieStatusIdFromLabel(communicationStatus);
}

function isGenieCampaignEditableByStatusId(statusId = 0) {
    return (
        statusId !== 9 &&
        statusId !== 5 &&
        statusId !== 20 &&
        statusId !== 27 &&
        statusId !== 26 &&
        statusId !== 51 &&
        statusId !== 52
    );
}

/**
 * Same as `CommunicationCards` `handleEdit` — Plan tab + `communication-creation` + encrypted editState.
 */
export function runGenieCampaignEdit({ dispatch, detail, cardIndex, genieSpaceId }) {
    const row = normalizeCommunicationCardRow(detail);
    const apiRow = getApiResponseRow(detail);
    const communicationDeliveryType = row?.communicationDeliveryType ?? '';
    const communicationStatus = row?.communicationStatus ?? '';
    const campaignId = firstResolvedCampaignId(
        apiRow?.campaignid,
        apiRow?.campaignId,
        apiRow?.campaignID,
        row?.campaignId,
        row?.campaignid,
        row?.campaignID,
        detail?.campaignId,
        detail?.campaignid,
        detail?.campaignID,
    );

    const campaignType =
        communicationDeliveryType === 'MDC' ? 'M' : communicationDeliveryType === 'SDC' ? 'S' : 'E';
    const statusId = resolveGenieCommunicationStatusId({ apiRow, row, detail, communicationStatus });
    const isEditable = isGenieCampaignEditableByStatusId(statusId);

    const state = {
        mode: 'edit',
        campaignId,
        currentTab: getIndexBasedOnCampaign(campaignType),
        isEditable,
        statusId,
        campaignType,
    };

    dispatch(updateCommunicationData({ field: 'editState', data: state }));
    const encryptState = encodeURIComponent(encryptWithAES(JSON.stringify(state).replace(/\+/g, '%2B')));
    openAppPathInNewTab(
        `/communication/communication-creation?q=${encryptState}&isGen=true&cardIndex=${cardIndex}`,
        genieSpaceId,
    );
}

/**
 * Same as `CommunicationCards` `handleChannelEdit` — full create-state + `create-communication` (or MDC URLs).
 */
export async function runGenieChannelEdit({
    dispatch,
    detail,
    cardIndex,
    departmentId,
    genieSpaceId,
}) {
    const row = normalizeCommunicationCardRow(detail);
    const apiRow = getApiResponseRow(detail);
    const {
        communicationName = '',
        communicationStatus = '',
        communicationID = '',
        communicationDeliveryType = '',
        communicationAttribute = '',
        communicationStartDate = '',
        communicationEndDate = '',
        channelMode = '',
        campaignId = '',
    } = row;
    const resolvedCampaignId = firstResolvedCampaignId(
        apiRow?.campaignid,
        apiRow?.campaignId,
        apiRow?.campaignID,
        campaignId,
        row?.campaignid,
        row?.campaignID,
        detail?.campaignId,
        detail?.campaignid,
        detail?.campaignID,
    );

    const channelModeMap = {
        EMAIL: 1,
        SMS: 2,
        PUSH: 3,
        WHATSAPP: 21,
        RCS: 41,
    };
    const channelIdFromDetail = detail?.channelId != null ? Number(detail?.channelId) : null;
    const channelId =
        channelIdFromDetail && !Number.isNaN(channelIdFromDetail)
            ? channelIdFromDetail
            : channelModeMap[String(channelMode || '').toUpperCase()] || 1;

    const channelData = getChannelId(channelId) ?? {};
    const { name, label } = channelData;

    const levelsCreated = row?.levelsCreated || [];
    const content = normalizeLevelsCreatedContent(levelsCreated, channelId, row);

    const tempSavedChannelsId = (levelsCreated ?? []).reduce((acc, item) => {
        const id = item?.channelId ?? item?.channel_id;
        if (id == null) return acc;
        if (!acc[id]) {
            acc[id] = [];
        }
        if (id === 7 || id === 10) {
            acc[id].push(item?.socialPostChannelId ?? item?.social_post_channel_id ?? 0);
        } else {
            acc[id].push(id);
        }
        return acc;
    }, {});
    if (!tempSavedChannelsId[channelId]) {
        tempSavedChannelsId[channelId] = [channelId];
    }
    dispatch(updateSaveChannelsId(tempSavedChannelsId));

    const dataItem = {
        campaignId: resolvedCampaignId,
        channels: String(channelId),
        startDate: communicationStartDate,
        endDate: communicationEndDate,
        campaignName: communicationName,
        communicationType: communicationAttribute || 'Promotional',
        primaryTargetCode: 0,
        productCategoryName: '',
        statusId: resolveGenieCommunicationStatusId({ apiRow, row, detail, communicationStatus }),
    };

    const campaignTypeValue =
        communicationDeliveryType === 'MDC' ? 'M' : communicationDeliveryType === 'SDC' ? 'S' : 'E';
    const communicationStatusId = dataItem?.statusId;
    const statusId = content?.statusId ?? communicationStatusId ?? 0;
    const isExistOfflineConversionChannel = false;

    const communicationStatusResult = handleCommunicationStatus(communicationStatusId);
    const tabValue = name ? _.lowerCase(name) : _.lowerCase(label);
    const tabValueName = getNameType(tabValue);
    const verticalValues = Object.keys(availableTabs);
    const verticalIndex = verticalValues.indexOf(tabValueName);
    const selectedArray = availableTabs?.[tabValueName] ?? [];
    let tabIndex = selectedArray.indexOf(tabValue);
    if (tabIndex < 0) tabIndex = 0;
    const resolvedTabName = selectedArray[tabIndex] || selectedArray[0] || 'email';

    dispatch(
        setTabforEdit({
            type: tabValueName,
            currentTab: verticalIndex < 0 ? 0 : verticalIndex,
        }),
    );
    dispatch(
        updateTab({
            field: tabValueName,
            data: {
                tabName: resolvedTabName,
                currentIndex: tabIndex,
            },
        }),
    );

    const isQr = content?.channelId === 3;
    if (isQr && content) {
        handleQrTypeTab(content, dispatch);
    }

    let channels = (_get(dataItem, 'channels', '') ?? '').split(',');
    if (isExistOfflineConversionChannel) channels.push(1001);
    const channelList = [];
    const analyticsList = [];
    _forEach(channels, (idRaw) => {
        let id = Number(idRaw);
        if (channelIds.includes(id)) channelList.push(id);
        if (analyticsIds.includes(id)) analyticsList.push(id);
    });
    const isEditable = statusId !== 9 && statusId !== 5;

    let eligibleChannelType = {};

    if (
        (campaignTypeValue === 'E' || campaignTypeValue === 'T') &&
        (content?.dynamiclistId || content?.dynamicListId)
    ) {
        const payload = {
            dynamicList: content?.dynamiclistId || content?.dynamicListId,
            campaignType: 'T',
            campaignId: dataItem?.campaignId,
            departmentId,
        };
        try {
            const response = await dispatch(getTriggerDynamicListChanneltype({ payload }));
            if (response?.status && response?.data?.length) {
                channelList?.forEach((channel) => {
                    const matchChannelType = CHANNEL_TYPES?.find(
                        (channelType) => channelType.id?.includes(channel) && channelType?.checkAllChannelsExist,
                    );
                    if (matchChannelType) {
                        eligibleChannelType[channel] = getEligibleChannelIds(
                            response?.data,
                            channel,
                            _get(dataItem, 'campaignId', 0),
                        );
                    }
                });
            }
        } catch (error) {
            console.error('Failed to fetch eligible channel type', error);
        }
    }

    const edmChannelDetailId = resolveEmailChannelDetailId(content, apiRow);
    const state = {
        campaignId: dataItem?.campaignId,
        campaignType: campaignTypeValue === 'E' ? 'T' : campaignTypeValue,
        channels: channelList,
        startDate: _get(dataItem, 'startDate', ''),
        endDate: _get(dataItem, 'endDate', ''),
        campaignName: _get(dataItem, 'campaignName', ''),
        communicationType: _get(dataItem, 'communicationType', ''),
        primaryGoal: getGoalType(_get(dataItem, 'primaryTargetCode', 0)),
        productType: _get(dataItem, 'productCategoryName', ''),
        analyticsTypes: analyticsList,
        currentIndex: tabIndex,
        analyticsTabIndex: tabValueName === 'analytics' ? tabIndex : 0,
        statusId: communicationStatusId,
        isEditable,
        /** Must be `tempSavedChannelsId` — opener Redux `savedChannelsId` is wrong/stale for `q` (new tab has empty Redux). */
        savedChannelsId: tempSavedChannelsId,
        /**
         * Recreate `setTabforEdit` + `updateTab` in the new tab (those dispatches only ran in the Genie window).
         */
        genieCreateTabBootstrap: {
            tabValueName,
            verticalTabIndex: verticalIndex < 0 ? 0 : verticalIndex,
            resolvedTabName,
            tabIndex,
        },
        offlineConversion: isExistOfflineConversionChannel,
        communicationExcuteStatus: communicationStatusResult,
        dynamicListId: content?.dynamicListId || content?.dynamiclistId,
        eligibleChannelType,
        campaignStatusId: communicationStatusId,
        ...(edmChannelDetailId > 0
            ? {
                  /**
                   * Email tab reads `mdcContentSetupDetails.channelDetailId` as `edmChannelId` for
                   * GetEmailCommunicationById. New tabs have empty `savedChannelsId` Redux, so this must live in `q`.
                   */
                  mdcContentSetupDetails: {
                      channelDetailId: edmChannelDetailId,
                      levelNumber: content?.levelNumber ?? content?.level ?? 1,
                      actionId: content?.actionId ?? 0,
                  },
              }
            : {}),
    };

    if (campaignTypeValue === 'M') {
        try {
            const getChannelIdById = (id) => {
                const channel = MDC_AUTHORING_CHANNEL_CONFIG?.find((item) => item?.id === id);
                if (!channel) {
                    throw new Error(`Channel with id ${id} not found`);
                }
                return channel?.channelId;
            };
            dispatch(updateMDCEditMode('edit'));
            const authoringUrl = `/communication/create-mdc-communication`;
            const updateLocationState = {
                ...state,
                mode: 'edit',
                mdcContentSetupDetails: {
                    channelId: getChannelIdById(content?.channelId) || 'ch001',
                    channelDetailId: edmChannelDetailId || content?.channeldetailId || 0,
                    levelNumber: content?.levelNumber ?? content?.level ?? 1,
                    actionId: content?.actionId ?? 0,
                    scheduleDate: content?.scheduleDateTime,
                    channelFriendlyName: content?.channelFriendlyName || '',
                },
            };
            const enc = encodeUrl(updateLocationState);
            openAppPathInNewTab(`${authoringUrl}?q=${enc}&isGen=true&cardIndex=${cardIndex}`, genieSpaceId);
        } catch (error) {
            console.error('Genie MDC channel edit navigation failed:', error);
            const url = '/communication/mdc-workflow';
            const enc = encodeUrl(state);
            openAppPathInNewTab(`${url}?q=${enc}&isGen=true&cardIndex=${cardIndex}`, genieSpaceId);
        }
        return;
    }

    const encryptState = encodeURIComponent(encryptWithAES(JSON.stringify(state).replace(/\+/g, '%2B')));
    openAppPathInNewTab(
        `/communication/create-communication?q=${encryptState}&isGen=true&cardIndex=${cardIndex}`,
        genieSpaceId,
    );
}
