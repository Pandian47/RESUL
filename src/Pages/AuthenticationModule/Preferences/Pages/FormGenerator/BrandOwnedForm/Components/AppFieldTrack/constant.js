export const TRACKING_TYPE = ['Value', 'Length', 'Click'];
export const INPUT_TYPE = ['Text & Number', 'Number only', 'Date & Time', 'Yes / No'];
export const FORM_INITIAL_STATE = {
    defaultValues: {
        eventname: '',
        trackingType: '',
        inputType: '',
        description: '',
        currentActivity: '',
        currentImg: null,
        imageData: null,
    },
    mode: 'onTouched',
};

export const screenTrackingMinutesOptions = ['5 secs', '10 secs', '15 secs', '20 sec', '25 sec', 'More than 30 secs'];
export const screenTrackingLengthOptions = ['25%', '50%', '75%', '100%'];

export const calculateCharLimit = (cellWidth, hasIcon = false, avgCharWidth = 8) => {
    const iconSpace = hasIcon ? 10 : 0;
    const availableWidth = cellWidth - iconSpace;
    return Math.floor(availableWidth / avgCharWidth);
};

export const appDeviceList = [
    { id: 'Androidphone', value: 'Android Phone' },
    { id: 'androidTablet', value: 'Android Tablet' },
    { id: 'iPhone', value: 'iPhone' },
    { id: 'iPad', value: 'iPad' },
];

export const MOBILE_BRAND_OWN_FORM_INITIAL_STATE = {
    mobileForm: [{ deviceType: '', appName: '', data: {}, events: {}, modalShow: false }],
};
