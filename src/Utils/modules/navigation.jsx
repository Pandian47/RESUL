import { encodeUrl } from './crypto';
import { COMMUNICATION_AVAILABLE_TABS as availableTabs } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
import { setTabforEdit, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';

export const shouldRefetchAudienceListOnReturn = (locationState) =>
    Boolean(locationState?.refreshAudienceList);

/**
 * After saving audience from communication authoring, return to create-communication
 * and flag the destination page to refetch recipient/audience lists.
 */
export function navigateBackToCommunicationCreation({
    dispatch,
    navigate,
    navigationState = {},
    extraReturnState = {},
}) {
    if (navigationState?.backAction === undefined) {
        return false;
    }

    const { tabValue, tabValueName, backAction } = navigationState;
    const verticalValues = Object.keys(availableTabs);
    const verticalIndex = verticalValues.indexOf(tabValueName);
    const selectedArray = availableTabs[tabValueName];
    const tabIndex = selectedArray?.indexOf(tabValue);

    if (dispatch && tabValueName && tabValue && tabIndex >= 0 && verticalIndex >= 0) {
        dispatch(
            updateTab({
                field: tabValueName,
                data: {
                    tabName: availableTabs[tabValueName][tabIndex],
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
    }

    setTimeout(() => {
        navigate('/communication/create-communication' + backAction, {
            state: {
                refreshAudienceList: true,
                ...extraReturnState,
            },
        });
    }, 10);

    return true;
}
export function handleAdvanceSearchDataFormat(data) {
    let finalDataFormat = {};
    Object.entries(data)?.forEach(([key, value]) => {
        if (Array.isArray(value)) {
            finalDataFormat[key] = value?.join(',');
        } else {
            finalDataFormat[key] = value;
        }
    });
    return finalDataFormat;
}
export function validateIsCustomNavigate(location, defaultlocationState, navigate, nextLevelCallBack) {
    const navigateDetails = defaultlocationState?.backNavigationDetails || location?.backNavigationDetails;
    if (navigateDetails?.isCustomNavigate) {
        const backPath = navigateDetails?.backPathName;

        if (navigateDetails?.locationState) {
            const encryptState = encodeUrl(navigateDetails.locationState);

            return navigate(`${backPath}?q=${encryptState}`, {
                state: navigateDetails.locationState,
            });
        } else {
            return navigate(backPath, {
                state: {},
            });
        }
    } else {
        return nextLevelCallBack();
    }
}
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function handleCustomNavigationDetails(locationQueryState) {
    const hasValidState =
        isPlainObject(locationQueryState) && Object.keys(locationQueryState).length > 0;
    return {
        backNavigationDetails: {
            locationState: hasValidState ? locationQueryState : '',
            isCustomNavigate: true,
            backPathName: window.location?.pathname || '',
        },
    };
}

export const COMMUNICATION_SETTINGS_TAB = {
    CHANNEL_SETTINGS: 0,
    FREQUENCY_CAP: 1,
    GOALS_AND_BENCHMARK: 2,
};

export const COMMUNICATION_SETTINGS_VERTICAL_TAB = {
    MAIL: 0,
    MESSAGING: 1,
    NOTIFICATION: 2,
};

/** Stable ids aligned with VERTICAL_TAB_CONFIG in CommunicationSettings constants. */
export const VERTICAL_TAB_ID = {
    MAIL: 'Mail',
    MESSAGING: 'Messaging',
    NOTIFICATION: 'Notification',
};

/** Stable ids aligned with MAIL_TABBER_CONFIG in CommunicationSettings constants. */
export const MAIL_TAB_ID = {
    SMTP: 'SMTP',
    QUIET_HOURS: 'QuietHours',
    LIFETIME_CAP: 'LifetimeCap',
    SUBSCRIPTION_UNSUBSCRIPTION: 'SubscriptionUnsubscription',
    DOUBLE_OPT_IN: 'DoubleOptIn',
    EMAIL_FOOTER: 'EmailFooter',
};

/** Stable ids aligned with MESSAGING_TABBER_CONFIG in CommunicationSettings constants. */
export const MESSAGING_TAB_ID = {
    SMS: 'SMS',
    WHATSAPP: 'Whatsapp',
    VMS: 'VMS',
    LINE: 'LINE',
    RCS: 'RCS',
};

/** Stable ids aligned with NOTIFICATION_TABBER_CONFIG in CommunicationSettings constants. */
export const NOTIFICATION_TAB_ID = {
    WEB: 'Web',
    MOBILE: 'Mobile',
    WEB_MOBILE: 'WebMobile',
};

const CHANNEL_NAV_DEFAULTS = {
    mail: {
        tab: COMMUNICATION_SETTINGS_TAB.CHANNEL_SETTINGS,
        verticalTab: COMMUNICATION_SETTINGS_VERTICAL_TAB.MAIL,
        verticalTabId: VERTICAL_TAB_ID.MAIL,
    },
    messaging: {
        tab: COMMUNICATION_SETTINGS_TAB.CHANNEL_SETTINGS,
        verticalTab: COMMUNICATION_SETTINGS_VERTICAL_TAB.MESSAGING,
        verticalTabId: VERTICAL_TAB_ID.MESSAGING,
        from: 'messaging',
    },
    notification: {
        tab: COMMUNICATION_SETTINGS_TAB.CHANNEL_SETTINGS,
        verticalTab: COMMUNICATION_SETTINGS_VERTICAL_TAB.NOTIFICATION,
        verticalTabId: VERTICAL_TAB_ID.NOTIFICATION,
    },
};

/**
 * Single helper for communication-settings navigation state.
 *
 * Without back navigation:
 *   createCommunicationSettingsNavState('mail', { mailTabId: MAIL_TAB_ID.EMAIL_FOOTER })
 *
 * With back navigation (from communication creation):
 *   createCommunicationSettingsNavState('mail', { mailTabId: ... }, location, getValues)
 *
 * @param {'mail'|'messaging'|'notification'} channel
 * @param {Object} [baseState={}] - tab ids and extra navigation fields
 * @param {Object} [queryState] - current page query/location state (enables back navigation)
 * @param {Function} [getValuesFn] - react-hook-form getValues (enables back navigation)
 */
export function createCommunicationSettingsNavState(channel, baseState = {}, queryState, getValuesFn) {
    const channelDefaults = CHANNEL_NAV_DEFAULTS[channel] || CHANNEL_NAV_DEFAULTS.mail;
    const mergedBaseState = { ...channelDefaults, ...(isPlainObject(baseState) ? baseState : {}) };
    const shouldIncludeBackNavigation = !!(queryState || typeof getValuesFn === 'function');

    if (shouldIncludeBackNavigation) {
        return buildCommunicationSettingsNavState(mergedBaseState, queryState, getValuesFn);
    }

    return mergedBaseState;
}

/**
 * Builds navigate state for /preferences/communication-settings with back-navigation metadata.
 * Safely merges query/location state and react-hook-form values when present.
 */
export function buildCommunicationSettingsNavState(baseState = {}, queryState, getValuesFn) {
    const safeBase = isPlainObject(baseState) ? baseState : {};
    const safeQuery = isPlainObject(queryState) ? queryState : {};

    let safeForm = {};
    if (typeof getValuesFn === 'function') {
        try {
            const formValues = getValuesFn();
            if (isPlainObject(formValues)) {
                safeForm = formValues;
            }
        } catch {
            safeForm = {};
        }
    }

    const mergedLocationState = { ...safeQuery, ...safeForm };

    return {
         ...safeBase,
        ...handleCustomNavigationDetails(
            Object.keys(mergedLocationState).length > 0 ? mergedLocationState : undefined,
        ),
        //     ...handleCustomNavigationDetails(
        //     Object.keys(mergedLocationState).length > 0 ? mergedLocationState : undefined,
        // )?.backNavigationDetails?.locationState
    };
}
