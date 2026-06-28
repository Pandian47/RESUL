export const MOBILEAPP_ONBOARDING_INITIALSTATE = {
    defaultValues: {
        appName: '',
        imageName: '',
        appLogo: '',
        devices: [
            {
                mobplatformName: '',
                appStoreUrl: '',
                notificationProvider: '',
                fcmSenderId: '',
                fcmServerkey: '',
                apnsFileName: '',
                apnsFileContent: '',
                bundleId: '',
                apnsTeamId: '',
                apnsKeyId: '',
                apnsEnvironment: '',
                apnsFilePath: '',
                filepath: '',
                jsonPath: '',
                HTTPFilePath: '',
                languageId: '',
                languageType: '', //'N'
                isAppAnalytics: false,
                isActive: true,
                pushNotifyAppStoreID: 0,
                appanalyticsetting: [{ analyticsID: '', accountMail: '', appKey: '', appSecretID: '', isActive: true }],
                // appanalyticsetting: [],
                isNative: false,
            },
        ],
    },
    mode: 'onTouched',
};

export const INITIAL_DEVICE_STATE = {
    mobplatformName: '',
    appStoreUrl: '',
    notificationProvider: '',
    fcmSenderId: '',
    fcmServerkey: '',
    apnsFileName: '',
    apnsFileContent: '',
    bundleId: '',
    apnsTeamId: '',
    apnsKeyId: '',
    apnsEnvironment: '',
    apnsFilePath: '',
    filepath: '',
    jsonPath: '',
    HTTPFilePath: '',
    languageId: '',
    languageType: '', //'N'
    isAppAnalytics: false,
    isActive: true,
    pushNotifyAppStoreID: 0,
    appanalyticsetting: [{ analyticsID: '', accountMail: '', appKey: '', appSecretID: '', isActive: true }],
    isNative: false,
};

export const IsValidURL = (url) => {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/.*)?$/i;

    try {
        let newUrl = new URL(url);
        let origin = newUrl.origin;
        let rslt = regex.test(origin);

        if (!rslt) {
            return 'Enter a valid  URL';
        }
    } catch (e) {
        return 'Enter a valid  URL';
    }
    try {
        const parsedUrl = new URL(url);
        const validProtocols = ['https:'];
        if (!validProtocols.includes(parsedUrl.protocol)) {
            return 'Enter a valid  URL';
        } else {
            return true;
        }
    } catch (e) {
        return 'Enter a valid  URL';
    }
};
