import { createElement } from 'react';
import { createSelector } from 'reselect';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

export const getCustomFields = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.customFields,
);

export const getMobileList = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.mobileApps,
);

export const getMobileAppId = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.mobileAppId,
);

const FIRST_SMART_LINK_KEY = 'smartLink1';

export const getMobileAppIdFromEditFlow = (editFlow = {}) => {
    const linkArray = editFlow?.[FIRST_SMART_LINK_KEY];
    if (!Array.isArray(linkArray)) return '';

    for (const entry of linkArray.slice(1)) {
        const appGuid = entry?.mobileApp?.appGuid || entry?.mobileAppName?.appGuid;
        if (appGuid) return appGuid;
    }
    return '';
};

export const getMobileAppIdFromFormState = (formState = {}) => {
    const sections = formState?.[FIRST_SMART_LINK_KEY];
    if (!Array.isArray(sections)) return '';

    for (const entry of sections.slice(1)) {
        const appGuid = entry?.mobileApp?.appGuid || entry?.mobileAppName?.appGuid;
        if (appGuid) return appGuid;
    }
    return '';
};

export const getResolvedMobileAppId = createSelector(
    (state) => state.smartLinkReducer.editFlow,
    (editFlow) => getMobileAppIdFromEditFlow(editFlow),
);

export const screenListSelector = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.screenList,
);

export const subScreenlistSelector = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.subScreenList,
);

export const getGeneratedLink = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.generatedLink,
);

export const getSmartLinkFriendlyName = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.SmartLinks,
);

export const getSmartLinksList = createSelector(
    getGeneratedLink,
    (generatedLink = {}) =>
        Object.entries(generatedLink)
            .filter(([_, value]) => value !== '')
            .map(([key, value]) => ({ id: key, value })),
);

export const getSmartLinksListWithLabels = createSelector(
    getSmartLinkFriendlyName,
    (smartLinkFriendlyName = {}) =>
        Object.entries(smartLinkFriendlyName)
            .filter(([_, val]) => val !== '')
            .map(([mapKey, val]) => {
                const url = typeof val === 'object' ? val.url : val;
                const goalNo = typeof val === 'object' ? val.goalNo : null;
                const rawKey = String(mapKey ?? '').trim();

                const labelFromStoreRaw =
                    typeof val === 'object' && val != null && 'label' in val
                        ? String(val.label ?? '').trim()
                        : '';
                const isAutoDefaultLabel = /^smart\s*link\s*\d+$/i.test(labelFromStoreRaw);
                const labelFromStore = isAutoDefaultLabel ? '' : labelFromStoreRaw;

                let friendlyName = labelFromStore;
                if (!friendlyName && rawKey && !/^smartlink\d+$/i.test(rawKey)) {
                    friendlyName = rawKey;
                }
                if (/^smartlink\d+$/i.test(friendlyName)) {
                    friendlyName = '';
                }

                const keyIndexMatch = rawKey.match(/^smartlink(\d+)$/i);
                const smartLinkTitleFromKey = keyIndexMatch ? `Smart Link ${keyIndexMatch[1]}` : '';
                const smartLinkTitleFromGoal = goalNo ? `Smart Link ${goalNo}` : '';
                const smartLinkTitle =
                    smartLinkTitleFromGoal || smartLinkTitleFromKey || (keyIndexMatch ? `Smart Link ${keyIndexMatch[1]}` : '');
                const technicalSlug = keyIndexMatch ? `smartLink${keyIndexMatch[1]}` : rawKey;

                const smartLinkId =
                    goalNo != null && String(goalNo).trim() !== ''
                        ? `smartLink${goalNo}`
                        : keyIndexMatch
                          ? `smartLink${keyIndexMatch[1]}`
                          : rawKey;

                const hasDistinctFriendlyName =
                    Boolean(friendlyName) &&
                    Boolean(smartLinkTitle) &&
                    friendlyName.toLowerCase() !== String(smartLinkTitle).trim().toLowerCase() &&
                    friendlyName.toLowerCase() !== String(technicalSlug).trim().toLowerCase();

                const menuLabel = hasDistinctFriendlyName
                    ? createElement(
                          'span',
                          { className: 'rs-dd-value-rows smartlink-dd-rows' },
                          [
                              createElement(
                                  'span',
                                  { key: 'sub', className: 'rs-dd-sub-label fs14', title: smartLinkTitle },
                                  smartLinkTitle,
                              ),
                              createElement(TruncatedCell, {
                                  key: 'main',
                                  value: friendlyName,
                                  noTable: true,
                                  wrapperClassName: 'smartlink-dd-primary-line',
                              }),
                          ],
                      )
                    : createElement(
                          'span',
                          { className: 'rs-dd-value-rows smartlink-dd-rows smartlink-dd-rows--single' },
                          createElement(TruncatedCell, {
                              key: 'main',
                              value: friendlyName || smartLinkTitle || technicalSlug,
                              noTable: true,
                              wrapperClassName: 'smartlink-dd-primary-line',
                          }),
                      );

                const searchText = [friendlyName, smartLinkTitle, url, smartLinkId, technicalSlug]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return {
                    id: smartLinkId || mapKey,
                    value: url,
                    goalNo,
                    friendlyName,
                    smartLinkTitle,
                    menuLabel,
                    searchText,
                };
            }),
);

export const smartlinkEdit = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.editFlow,
);

export const getGeneratedFlag = createSelector(
    (state) => state.smartLinkReducer,
    (state) => state.generateFlag,
);

export const isSmartLinkCacheValid = createSelector(
    (state) => state.smartLinkReducer,
    ({ isSmartLinkDetailFetched, fetchedCampaignId }) => ({
        isSmartLinkDetailFetched,
        fetchedCampaignId,
    }),
);

export const selectIsSmartLinkFetchResolved = createSelector(
    (state) => state.smartLinkReducer.tabSmartLink_Flag,
    (tabSmartLink_Flag) => tabSmartLink_Flag !== null,
);

export const selectHasExistingSmartLinkData = createSelector(
    getGeneratedLink,
    (generatedLink = {}) =>
        Object.values(generatedLink).some((link) => String(link || '').trim() !== ''),
);

export const selectHasWebSmartLinkData = createSelector(
    getGeneratedLink,
    (generatedLink = {}) => Boolean(String(generatedLink?.smartLink1 || '').trim()),
);

export const selectHasMobileSmartLinkData = createSelector(
    getGeneratedLink,
    (generatedLink = {}) => Boolean(String(generatedLink?.smartLink2 || '').trim()),
);

export const getMobileSmartLinkOverlayMessage = ({
    smartLink1,
    smartLink = {},
    editFlow = {},
    noSmartLinkMessage,
    mobileNotSetupMessage,
}) => {
    const hasMobileSmartLink = Boolean(String(smartLink?.smartLink2 || '').trim());
    const resolvedMobileAppId = getMobileAppIdFromEditFlow(editFlow);

    if (!hasMobileSmartLink) return noSmartLinkMessage;
    if (!resolvedMobileAppId) return mobileNotSetupMessage;
    return noSmartLinkMessage;
};
