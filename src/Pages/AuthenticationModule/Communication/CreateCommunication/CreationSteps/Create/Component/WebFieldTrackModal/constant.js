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

export const checkCategoryType = (category) => {
    let categoryId = 1;
    if (
        category?.toLowerCase()?.includes('edit') ||
        category?.toLowerCase()?.includes('input') ||
        category?.toLowerCase()?.includes('edittext')
    ) {
        categoryId = 1;
    } else if (
        category?.toLowerCase()?.includes('a') ||
        category?.toLowerCase()?.includes('button') ||
        category?.toLowerCase()?.includes('check') ||
        category?.toLowerCase()?.includes('radio')
    ) {
        categoryId = 2;
    }
    return categoryId;
};
