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
        category?.toLowerCase()?.includes('edittext') ||
        category?.toLowerCase()?.includes('textarea')
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

export const calculateCharLimit = (cellWidth, hasIcon = false, avgCharWidth = 8) => {
    const iconSpace = hasIcon ? 10 : 0;
    const availableWidth = cellWidth - iconSpace;
    return Math.floor(availableWidth / avgCharWidth);
};

export const buildPayload = (fieldEventData, formData, formId) => {
        let fieldAry = [];
    let screenName = '';
    fieldEventData?.elementArray?.forEach((item) => {
        if (!screenName && item?.field?.tagurl) {
            screenName = item?.field?.tagurl;
        }
        fieldAry = [
            ...fieldAry,
            {
                identifier: item?.field?.viewid ?? '',
                eventName: item?.eventTracking?.eventname,
                captureType: item?.eventTracking?.elementtype ?? item?.eventTracking?.trackingType,
                fieldType: item?.eventTracking?.attributeType?.attrName,
                fieldName: item?.eventTracking?.attributeType?.attributeName,
                requiredfield: item?.eventTrackingTemp?.mandatory,
                markAsSubmit: item?.eventTrackingTemp?.markAsGoal ?? false,
                formId: formId,
                fieldAttName: item?.eventTracking?.attributeType?.attrName,
                apiKey: item?.eventTracking?.id,
                screenName: item?.field?.tagurl || '',
                dataAttributeId: item?.eventTracking?.attributeType?.dataAttributeId,
            },
        ];
    });

    let viewJson = { ...fieldEventData, formData };

    let baseDomain = '';
    if (formData?.eventTrackingUrl) {
        try {
            const url = new URL(formData.eventTrackingUrl);
            baseDomain = url.origin;
        } catch (e) {
            baseDomain = formData.eventTrackingUrl;
        }
    }

    let data = {
        formType: 'Brand',
        formName: formData?.formName,
        viewJson: JSON.stringify(viewJson),
        appId: '',
        domainName: baseDomain,
        deviceType: 'web',
        recipientFormID: formId,
        fields: fieldAry || [],
    };
    return data;
};
// export const buildAppFieldTrackPayload = (fieldEventData, formData, formId) => {
//     console.log(formData, fieldEventData, 'appFormdata');
//     const { eventsSocketData } = fieldEventData;
//     let fieldAry = [];
//     eventsSocketData?.elementArray?.forEach((item) => {
//         fieldAry = [
//             ...fieldAry,
//             {
//                 identifier: 0,
//                 eventName: item?.eventTracking?.eventname,
//                 captureType: item?.eventTracking?.trackingType,
//                 fieldType: item?.eventTracking?.attribute?.attributeName,
//                 fieldName: item?.eventTracking?.eventname,
//                 requiredfield: false,
//                 markAsSubmit: item?.eventTracking?.markAsGoals,
//                 formId: formId,
//                 fieldAttName: item?.eventTracking?.attribute?.attributeName,
//                 apiKey: item?.eventTracking?.id,
//             },
//         ];
//     });

//     // let viewJson = {
//     //     ...eventsSocketData?.elementArray,
//     //     ...eventsSocketData?.controlsArray,
//     //     ...eventsSocketData?.imageData,
//     // };

//     let data = {
//         formType: 'Brand',
//         formName: formData?.formName,
//         viewJson: JSON.stringify(fieldEventData),
//         appId: formData?.appName?.appId,
//         domainName: '',
//         deviceType: formData?.deviceType?.id,
//         recipientFormID: formId,
//         fields: fieldAry || [],
//     };
//     return data;
// };

export const FriendlyNameDuplicateValidate = (value, events, currentFormState, isEditEvent) => {
    let eventNameList = events?.map((event) => {
        let name = event?.eventname?.replace(/\s/g, '');
        return (isEditEvent && currentFormState?.id !== event?.id) || !isEditEvent ? name?.toLowerCase() : '';
    });
    let curValue = value?.replace(/\s/g, '');
    curValue = curValue?.toLowerCase();
        return eventNameList?.includes(curValue) ? 'Friendly name already exists' : true;
};

export const buildAppFieldTrackPayload = (fieldEventData, formData, formId) => {
    const { formName, mobileForm } = formData;
    let formAndTrackedData = [];
    let appId 
    let screenName = '';
    mobileForm?.forEach((list) => {
         appId = list?.appName?.appId;
        let deviceType = list?.deviceType?.value?.toLowerCase();
        let fieldAry = [];
        const currentEvents = {};
        list?.data?.elementArray?.forEach((item, index) => {
            currentEvents[index] = {
                id: item?.eventTracking?.id,
                eventname: item?.eventTracking?.eventname,
                trackingType: item?.eventTracking?.trackingType,
                inputType: item?.eventTracking?.inputType,
                description: item?.eventTracking?.description,
                markAsGoal: item?.eventTrackingTemp?.markAsGoal,
                screenTrackMinutes: item?.screenTracking?.minDuration,
                screenFilter: item?.screenTracking?.screenTrackCond,
                screenTrackLength: item?.screenTracking?.minLength,
                attribute: item?.eventTracking?.attribute,
                mandatory: item?.eventTrackingTemp?.mandatory,
                viewId: item?.eventTracking?.viewId
            };
        });
        
        const nonEventData = {};
        if (list?.data) {
            Object.keys(list?.data).forEach((key) => {
                if (isNaN(key)) {
                    nonEventData[key] = list?.data[key];
                }
            });
        }
        
        let viewJson = JSON.stringify({ 
            ...nonEventData,
            ...currentEvents
        });
        
        list?.data?.elementArray?.forEach((item) => {
            if (!screenName && item?.field?.screenName) {
                screenName = item?.field?.screenName;
            }
            fieldAry = [
                ...fieldAry,
                {
                    identifier: item?.eventTracking?.viewId ?? '',
                    eventName: item?.eventTracking?.eventname,
                    captureType: item?.eventTracking?.trackingType ?? 'Value', // logesh feedback
                    fieldType: item?.eventTracking?.attribute?.attrName,
                    fieldName: item?.eventTracking?.attribute?.attributeName,
                    requiredfield: item?.eventTrackingTemp?.mandatory,
                    markAsSubmit: item?.eventTrackingTemp?.markAsGoal ?? false,
                    formId: formId,
                    fieldAttName: item?.eventTracking?.attribute?.attrName,
                    apiKey: item?.eventTracking?.id,
                    screenName: item?.field?.screenName || '',
                    dataAttributeId: item?.eventTracking?.attribute?.dataAttributeId,
                },
            ];
        });
        formAndTrackedData = [...formAndTrackedData, { viewJson, fieldAry, appId, deviceType, screenName }];
    });

    let data = {
        formType: 'Brand',
        formName: formData?.formName,
        domainName: '',
        recipientFormID: formId,
        formAndTrackedData,
        appId: appId,
        fields: formAndTrackedData?.[0]?.['fieldAry'],
        viewJson: formAndTrackedData?.[0]?.['viewJson'],
        deviceType: formAndTrackedData?.[0]?.['deviceType'],
        // screenName: formAndTrackedData?.[0]?.['screenName']
    };
    return data;
};
