export const SELECT_KYC = [
    'Promotional credit card offers Form',
    'International travel card Form',
    'Credit Card form',
    'Invest smartly, save money Form',
];

export const getBase_64 = (file, succes, failure) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (reader.result) {
            const result = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
            succes(result);
        } else {
            failure('Problem with converting file to base64');
        }
    };
    reader.onerror = (error) => {
    };
};
export function isBase64(str) {
    try {
        const decodedString = atob(str);
        const encodedString = btoa(decodedString);
        return encodedString === str;
    } catch (error) {
        return false;
    }
}
export const QR_INITIAL_DATA = {
    defaultValues: {
        audience_reach: '',
        // domain: '',
        redirection_url: '',
        logo: '',
        kyc: false,
        editorContent: '',
        qrShow: false,
        // select_kyc : '',
        statement: '',
        // email_check : true,
        // mobile_number_check: false,
        // utm_parameter : false,
        range: 200,
        // parameters : [{
        //         tags : '',
        //         tagValue : '',
        //         isUTMParameterInput : false
        // }  ],
        strHtmlData: '',
        paramsLink: '',
        imgPath: '',
        isEdit: false,
        short_url: false,
        download_pdf: '',
        download_img: '',
        communicationurl: '',
        qrchannelType: ''
    },
    mode: 'onTouched',
};

export const UTM_PARAMETER_DATA = [
    {
        id: 1,
        name: 'product_ownership',
        value: 'Product Ownership',
    },
    {
        id: 2,
        name: 'location',
        value: 'Location',
    },
    {
        id: 3,
        name: 'gender',
        value: 'Gender',
    },
    {
        id: 4,
        name: 'product_eligibility',
        value: 'Product Eligibility',
    },
    {
        id: 5,
        name: 'custom_tag',
        value: 'Custom Tag / Parameter',
    },
];

// export const getUpdateTab = (data, dispatch, updateTab, updateQREnableTab) => {
//     let isInitialState = true;

//     Object.entries(data)?.forEach(([key, value]) => {
//         if (key === 'CommunicationURL' && !!value) {
//             dispatch(
//                 updateTab({
//                     field: 'qr',
//                     data: {
//                         tabName: 'url',
//                         currentIndex: 0,
//                     },
//                 }),
//             );
//             dispatch(updateQREnableTab('url'));
//             return (isInitialState = false);
//         }
//         if (key === 'MobileNumber' && !!value) {
//             dispatch(
//                 updateTab({
//                     field: 'qr',
//                     data: {
//                         tabName: 'sms',
//                         currentIndex: 4,
//                     },
//                 }),
//             );
//             dispatch(updateQREnableTab('sms'));
//             return (isInitialState = false);
//         }
//     });
//     if (isInitialState) {
//         dispatch(
//             updateTab({
//                 field: 'qr',
//                 data: {
//                     tabName: 'url',
//                     currentIndex: 0,
//                 },
//             }),
//         );
//         dispatch(updateQREnableTab(''));
//         return;
//     }
// };

export const getUpdateTab = (data, dispatch, updateTab, updateQREnableTab) => {
    const tabConfig = [
        { key: 'CommunicationURL', tabName: 'url', currentIndex: 0 },
        { key: 'MobileNumber', tabName: 'sms', currentIndex: 4 },
    ];

    for (const { key, tabName, currentIndex } of tabConfig) {
        if (data[key]) {
            dispatch(updateTab({ field: 'qr', data: { tabName, currentIndex } }));
            dispatch(
                updateQREnableTab({
                    tabName: tabName,
                    refreshStatus: true,
                }),
            );
            return;
        }
    }

    //  dispatch(updateTab({ field: 'qr', data: { tabName: 'url', currentIndex: 0 } }));
    // dispatch(updateQREnableTab(''));
};

export const getStrContent = (tab, getValues, smartLink1, QwebURL) => {
    let {
        audience_reach,
        communicationurl,
        strHtmlData,
        redirection_url,
        short_url,
        range,
        kyc,
        statement,
        paramsLink,
        download_pdf,
        download_img,
        mobile_number,
        message,
        kycType
    } = getValues();
    if (download_img) {
        download_img = download_img?.split('?')[0]; 
    }
    if (download_pdf) {
        download_pdf = download_pdf?.split('?')[0]; 
    }
    switch (tab) {
        case 'url':
            let strContentUrl = {
                CommunicationURL: communicationurl,
                RedirectionURL: redirection_url,
                Size: range,
                IsKycChecked: kyc,
                IswebNameChecked: false,
                IswebEmailIdChecked: false,
                IswebMobileNoChecked: false,
                IswebPostalCodeChecked: false,
                DoubleOptIn: statement,
                // QRWebURL: paramsLink ?? '',
                QRWebURL: kyc ? QwebURL : smartLink1 ? communicationurl : paramsLink,
                IsShortCode: short_url,
                DownloadImage: download_img,
                DownloadPdf: download_pdf,
                ShowName:  kyc ? 'Y' : '' ,
                ShowEmailID:  kyc ? 'Y' : '',
                ShowMobileNo: '',
                ShowPostalCode:  kyc ? 'Y' : '',
                KYCText: kyc ? kycType?.formName : ''
            };

            return strContentUrl;
        //sms
        case 'sms':
            let strContentSMS = {
                CommunicationURL: paramsLink,
                RedirectionURL: redirection_url,
                Size: range,
                IsKycChecked: false,
                IswebNameChecked: false,
                IswebEmailIdChecked: false,
                IswebMobileNoChecked: false,
                IswebPostalCodeChecked: false,
                DoubleOptIn: '',
                // QRWebURL: paramsLink ?? '',
                QRWebURL: kyc ? QwebURL : smartLink1 ? communicationurl : paramsLink,
                IsShortCode: short_url,
                DownloadImage: download_img ?? '',
                DownloadPdf: download_pdf ?? '',
                MobileNumber: mobile_number,
                Message: message,
            };

            return strContentSMS;
    }
};
