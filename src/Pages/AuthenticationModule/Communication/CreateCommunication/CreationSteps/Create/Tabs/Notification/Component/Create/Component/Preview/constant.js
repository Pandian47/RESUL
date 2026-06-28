import { FirefoxLogo, GoogleChromeLogo, androidLogo, iosLogo } from 'Assets/Images';
export const selectTitleText = (type) => { 
    // console.log('type', type);
    switch (type) {
        case 'chrome':
            return {
                name: 'Google chrome',
                logo: GoogleChromeLogo,
            };
        case 'firefox':
            return {
                name: 'Firefox',
                logo: FirefoxLogo,
            };
        case 'andriod':
            return {
                name: 'Android',
                logo: androidLogo,
            };
        case 'ios':
            return {
                name: 'iOS',
                logo: iosLogo,
            };
        default:
            return {
                name: 'Google chrome',
                logo: FirefoxLogo,
            };
    }
};
