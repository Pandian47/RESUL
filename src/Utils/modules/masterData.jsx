
export function getMobilePlatformId(device) {
    if (device == null || typeof device !== 'string') return 0;
    if (device.toLowerCase().includes('iphone')) {
        return 3;
    } else if (device.toLowerCase().includes('ipad')) {
        return 4;
    } else if (device.toLowerCase().includes('android phone')) {
        return 1;
    } else if (device.toLowerCase().includes('android tablet')) {
        return 2;
    } else {
        return 0;
    }
}
export function getDeviceName(platfomId) {
    switch (platfomId) {
        case 1:
            return 'Android phone';
        case 2:
            return 'Android tablet';
        case 3:
            return 'iPhone';
        case 4:
            return 'iPad';
        default:
            return '';
    }
}
export function getLanguageId(name) {
    if (name == null || typeof name !== 'string') return -1;
    switch (name.toLowerCase()) {
        case 'cordova':
            return 1;
        case 'react native':
            return 3;
        case 'ionic':
            return 2;
        case 'flutter':
            return 4;
        case 'xamarin':
            return 5;
        case 'native':
            return 0;
        default:
            return -1;
    }
}
export function getLanguageName(id) {
    if (id == null || id === '') return '';
    let _id = parseInt(id, 10);
    switch (_id) {
        case 0:
            return 'Native';
        case 1:
            return 'Cordova';
        case 3:
            return 'React Native';
        case 2:
            return 'Ionic';
        case 4:
            return 'Flutter';
        case 5:
            return 'Xamarin';
        case 6:
            return 'Nativescript';
        default:
            return '';
    }
}
export const MOBILE_DEVICES = ['Android phone', 'Android tablet', 'IPhone', 'IPad'];
export const HYBRID_LANGUAGES = ['Cordova', 'Ionic', 'React Native', 'Flutter', 'MAUI'];

export function getmasterData() {
    const data = localStorage.getItem('masterData');
    if (data === null) return {};
    return JSON.parse(data);
}
