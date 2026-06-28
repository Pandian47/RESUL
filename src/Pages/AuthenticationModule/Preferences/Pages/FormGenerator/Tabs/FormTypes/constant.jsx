import { formTheme1, formTheme2, formTheme3, formTheme4 } from 'Assets/Images';
export const availableLayouts = [
    {
        themeId: 'form-theme-default',
        themePreviewImage: formTheme1,
        themeLabel: 'Horizontal',
    },
    {
        themeId: 'form-theme-vertical',
        themePreviewImage: formTheme2,
        themeLabel: 'Vertical',
    },
    {
        themeId: 'form-theme-no-labels',
        themePreviewImage: formTheme3,
        themeLabel: 'No labels',
    },
    // {
    //     themeId: 'form-theme-fancy',
    //     themePreviewImage: formTheme4,
    //     themeLabel: 'Fancy',
    // },
];

const fieldChecked = (check = false) => {
    if (check) return '1';
    else return '0';
};

export const findLinkRegex = (htmlString) => {
    var regex = /<a\s+[^>]*href="([^"]*)"[^>]*>/i;
    var match = regex.exec(htmlString);
    if (match && match[1]) {
        return match[1];
    } else {
        return '';
    }
};

export const FORM_TYPE_ENUM = {
    survey: 'S',
    tellafriend: 'C',
    kyc: 'A',
};

export const buildPayload = (data, fromId, tag, previewContentData, getFormName) => {
    // console.log('Check form data ::: ', data);
    let {
        formGenerator,
        formGenerationColumn,
        enableCaptchaCheckbox,
        submitColor,
        Submit,
        CancelView,
        AgreeCheckbox,
        tinyMceLableAgree,
        isProgressiveProfiling = false,
        settingsInputField,
        isAutoSave,
        isPopulateFields,
        selectedColor,
        colorPicker,
        formName,
        htmlCodeClient,
        formType,
        webHookURL,
        redirectOpenInNewTab
    } = data;
    let iscaptcha = fieldChecked(!!enableCaptchaCheckbox);
    let isAgreeTerms = fieldChecked(!!AgreeCheckbox);
    let json = formGenerator?.map((ele, ind) => {
        delete ele?.mapTo;
        return {
            ...ele,
        };
    });
    let progressiveJSON = isProgressiveProfiling ? json?.filter((item) => !item?.field) : json;
    const toStringVal = (v) => (v && typeof v === 'object' && v.value !== undefined ? v.value : v);
    const styles = data?.formStyles || {};
    const stylesForHTML = {
        themeStyles: {
            style: toStringVal(styles?.style) || 'default',
            theme: toStringVal(styles?.theme) || 'theme1',
            pagination: toStringVal(styles?.pagination) || 'pageNumbers',
            paginationEnabled: !!styles?.paginationEnabled,
            itemsPerPage: styles?.itemsPerPage || 5,
            customColors: {
                background: styles?.customColors?.background || '#ffffff',
                text: styles?.customColors?.text || '#000000',
                accent: styles?.customColors?.accent || '#007bff',
                border: styles?.customColors?.border || '#cccccc',
            },
        },
        headerConfig: data?.headerConfig || {
            enabled: true,
            logo: '',
            name: '',
            backgroundColor: '#ffffff',
            color: '#000000',
        },
    };

    const getJsonPreviewContent = JSON.stringify(previewContentData);

    return {
        recipientFormId: fromId ? fromId : '0',
        formType: FORM_TYPE_ENUM[tag?.toLowerCase()] || 'A',
        formName: formName || getFormName,
        isCaptchaOtpEnabled: iscaptcha,
        isAgreeTerms: isAgreeTerms,
        isProgressive: fieldChecked(isProgressiveProfiling),
        progressiveCount: settingsInputField,
        isAutosave: fieldChecked(isAutoSave),
        isPrePopulate: fieldChecked(isPopulateFields),
        bgColor: JSON.stringify({
            bgColor: selectedColor || '',
            textColor: 'color:rgba(0,0,0,1)',
            borderColor: colorPicker || '',
        }),
        submitSetting: {
            submitText: Submit,
            isNewTabOpen: redirectOpenInNewTab ? 'Y' : 'N',
            redirectionUrl: findLinkRegex(Submit),
            // postBackUrl: webHookURL || '',
            ...(typeof webHookURL === 'object' && webHookURL?.webHookSettingId && { webhookSettings: webHookURL }),
        },
        htmlCodeClient: tag === 'KYC' || tag === 'Survey' ? getJsonPreviewContent : htmlCodeClient,
        formGenerationColumn:
            tag === 'KYC' || tag === 'Survey'
                ? (() => {
                    const cols = progressiveJSON?.map((ele, ind) => {
                        //   debugger;
                        let temp = fieldDetails(ele);
                        if (ele?.makeDefault !== undefined) {
                            temp = { ...temp, makeDefault: ele?.makeDefault };
                        }
                        let details = Object.keys(temp).map((key) => `${encodeURIComponent(key)}:${temp[key]}`);
                        //   let details = fieldDetails(ele);
                        if (ele?.columnType === 'TextBlock') {
                            return {
                                columnName: ele?.columnType,
                                columnType: ele?.columnType,
                                orderNo: ind + 1,
                                fieldDetails: JSON.stringify(Object.values(temp)),
                                dataAttributeId: 0,
                                dataAttributeName: null,
                            };
                        } else if (ele?.columnType === 'CustomHeader') {
                            return {
                                columnName: ele?.columnType,
                                columnType: ele?.columnType,
                                orderNo: ind + 1,
                                fieldDetails: JSON.stringify(temp),
                                dataAttributeId: 0,
                                dataAttributeName: null,
                            };
                        } else if (ele?.columnType === 'Participants') {
                            return {
                                columnName: ele?.columnType,
                                columnType: 'GroupControl',
                                orderNo: ind + 1,
                                fieldDetails: JSON.stringify(details),
                                dataAttributeId: 0,
                                dataAttributeName: null,
                            };
                        } else {
                            return {
                                columnName: ele?.labelName,
                                columnType: ele?.columnType,
                                orderNo: ind + 1,
                                fieldDetails: JSON.stringify(details),
                                dataAttributeId: ele?.mapToValue.dataAttributeId,
                                dataAttributeName: ele?.mapToValue.attributeName,
                            };
                        }
                    });
                    // Build complete formStyles object including headerConfig
                    // Merge headerConfig into formStyles to ensure all header values are saved
                    const headerConfigData = data?.headerConfig || {};
                    const formStylesToSave = {
                        ...(data?.formStyles || {}),
                        // Include complete headerConfig in formStyles object with all properties
                        headerConfig: {
                            enabled: true,
                            logo: headerConfigData.logo || '',
                            name: headerConfigData.name || '',
                            backgroundColor: headerConfigData.backgroundColor || 'transparent',
                            color: headerConfigData.color || '#000000',
                            backgroundImage: headerConfigData.backgroundImage || '',
                            alignment: headerConfigData.alignment || 'center',
                            layoutPosition: headerConfigData.layoutPosition || 'top',
                            logoAlignment: headerConfigData.logoAlignment || 'center',
                            nameAlignment: headerConfigData.nameAlignment || 'center',
                            headerFontSize: headerConfigData.headerFontSize || 17,
                            headerFontFamily: headerConfigData.headerFontFamily || { text: 'Mukta Regular', value: 'muktaregular', fontFamily: 'MuktaRegular,sans-serif' },
                        },
                    };

                    const stylesCol = {
                        columnName: 'FormStyles',
                        columnType: 'FormStyles',
                        orderNo: (cols?.length || 0) + 1,
                        fieldDetails: JSON.stringify(formStylesToSave),
                        formDetails: JSON.stringify(formStylesToSave), // Also include formDetails for consistency
                        dataAttributeId: 0,
                        dataAttributeName: null,
                    };
                    return [...(cols || []), stylesCol];
                })()
                : [],
        tcTemplate: isAgreeTerms === '0' ? '' : tinyMceLableAgree,
        jsonData: isProgressiveProfiling ? JSON.stringify(progressiveJSON) : JSON.stringify(json),
        WelcomeNoteMailHTML: JSON.stringify(stylesForHTML),
    };
};

function fieldDetails(ele) {
    let getObj = { Placeholder: ele?.tinyMceLable, validation: ele?.mandatory ? 'yes' : 'no' };
    switch (ele?.componentName) {
        case 'TextBlock':
            // getObj = { ...getObj, content: ele?.tinyMceLableMain || '' };
            getObj = { content: ele?.tinyMceLableMain || '' };
            break;
        case 'CustomHeader':
            getObj = {
                title: ele?.tinyMceLableMain || '',
                titleColor: ele?.settings?.titleColor || '#000000',
                titleBgColor: ele?.settings?.titleBgColor || '#ffffff',
                headerLogo: ele?.settings?.headerImageUrl || '',
                logoAlignment: ele?.settings?.headerImageAlign || 'left',
                backGroundColor: ele?.settings?.bgColor || '#ffffff',
                isGradiant: !!ele?.settings?.useGradient,
                gradiantStart: ele?.settings?.gradientStart || '#ffffff',
                gradiantEnd: ele?.settings?.gradientEnd || '#ffffff',
            };
            break;
        case 'Textbox':
        case 'PhoneInput':
            // Get expiryTime value - handle both object and number formats
            const expiryTimeValue = ele?.settings?.expiryTime?.value || 0;


            getObj = {
                ...getObj,
                txtplaceholder: ele?.settings?.placeholder || 'Field name',
                lengthoftxt: ele?.settings?.maxLength || '50',
                validationtype: validationType(ele?.settings?.validationType) || '',
                validationtext: ele?.settings?.customErrorMessage || '',
                validation: ele?.mandatory ? 'yes' : 'no',
                requiredFieldOTP: ele?.settings?.requiredOTP ? '1' : '0',
                expiryTime: expiryTimeValue,
            };
            if (ele?.isMobileNumber || ele?.componentName === 'PhoneInput') {
                getObj.IsMobileField = '1';
            }
            break;
        case 'ComboBox':
            !!ele?.settings && ele?.dropdowns?.unshift(ele?.settings?.tagsLabelName);
            getObj = {
                ...getObj,
                txtplaceholder: ele?.placeHolder || 'Select',
                comboval: ele?.dropdowns?.join('^') || '',
            };
            break;
        case 'RadioButton':
            getObj = {
                ...getObj,
                radval: ele?.radioOptionsData?.join('^') || '',
            };
            break;
        case 'CheckBox':
            getObj = {
                ...getObj,
                checkboxval: ele?.checkboxOptionData?.join('^') || '',
                Consent: false,
                Consenttext: '',
            };
            break;
        case 'ConsentCheckbox':
            getObj = {
                ...getObj,
                checkboxval: '',
                Consent: true,
                Consenttext: ele?.tinyMceLableMain,
            };
            break;
        case 'DateAndTime':
            getObj = {
                ...getObj,
                txtplaceholder: ele?.settings?.placeholder || 'Select the date',
                DTInputtype: ele?.settings?.dtInputType || 'D',
            };
            break;
        case 'HiddenField':
            getObj = {
                ...getObj,
                txtplaceholder: ele?.settings?.placeholder || 'Enter your name',
            };
            break;
        case 'Participants':
            let _Participants = ['salutation', 'fullname', 'email', 'mobile'];
            getObj = {
                ...getObj,
                GroupiconSetting: _Participants.map((elem, ind) => ele?.participant[ind] && elem).filter(Boolean) || '',
                groupiconrepeat: ele?.participantTotal || '1',
            };
            break;
        case 'MultiChoice':
            getObj = {
                // ...getObj,
                validation: ele?.mandatory ? 'yes' : 'no',
                MCQuestion: ele?.tinyMceLableMain || '',
                MCchoicetype: ele?.settings?.isChecked ? 'C' : 'R', // need to discuss
                MCanswerlist: ele?.multiChoice?.map((e) => e?.answer).join('^^') || '',
            };
            break;
        case 'CommentBox':
            getObj = {
                // ...getObj,
                validation: ele?.mandatory ? 'yes' : 'no',
                CMTBX_QUESTION: ele?.tinyMceLableMain || '',
                CMTBX_CMDTYPE: ele?.commentLine === 'Multi line' ? 'M' : 'S', // need to discuss
                CMTBX_PLACEHOLDER: ele?.settings?.commentBoxPlaceholder || '',
            };
            break;
        case 'Ranking':
            getObj = {
                // ...getObj,
                validation: ele?.mandatory ? 'yes' : 'no',
                RANKSUR_QUESTION: ele?.tinyMceLableMain || '',
                RNK_QUEST: ele?.rankingFields && ele?.rankingFields?.map((e) => e?.answer).join('^^'), // need to discuss
            };
            break;
        case 'Rating':
            getObj = {
                // ...getObj,
                validation: ele?.mandatory ? 'yes' : 'no',
                SRQuestion: ele?.tinyMceLableMain || '',
                SRRatingType: ele?.ratings?.shape,
                SRRatingRange: ele?.ratings?.scale,
                SRRatingColor: ele?.ratings?.color || '',
            };
            break;
        case 'Slider':
            getObj = {
                // ...getObj,
                validation: ele?.mandatory ? 'yes' : 'no',
                RNG_QUESTION: ele?.tinyMceLableMain || '',
                RNG_SLIDERTYPE: ele?.sliderList?.shape === 'Round' ? 1 : 2,
                RNG_THUMPCOLOR: ele?.sliderList?.thumbColor || '',
                RNG_FIRSTCOLOR: ele?.sliderList?.firstColor || '',
                RNG_SECONDCOLOR: ele?.sliderList?.secondColor || '',
                RNG_CONTENT1: ele?.tinyMceLableMainSliderBad || '',
                RNG_CONTENT2: ele?.tinyMceLableMainSliderGood || '',
                RNG_CONTENT3: ele?.tinyMceLableMainSliderVeryGood || '',
            };
            break;
        case 'Matrix':
            getObj = {
                // ...getObj,
                validation: ele?.mandatory ? 'yes' : 'no',
                // MAT_ROWS: ele?.tinyMceLableMain || '',
                // MAT_COLU: ele?.sliderList?.shape || '',
                MAT_ROWS: ele?.matrixTitle?.map((e) => e?.tinyMceLableHeading).join('^^'),
                MAT_COLU: ele?.matrixSub?.map((e) => e?.tinyMceLableHeading).join('^^'),
                MAT_Type: ele?.settings.isChecked ? 'C' : 'R',
                MAT_QUEST: ele?.tinyMceLableMain || '',
            };
            break;
        default:
            getObj;
            break;
    }
    let arr = [];
    // for (let [key, val] of Object.entries(getObj)) {
    //     if (ele?.columnType === 'TextBlock') {
    //         arr.push(arr.push(ele?.tinyMceLableMain));
    //     } else arr.push(`${key}:${val}`);
    // }
    // return arr;
    if (ele?.makeDefault !== undefined) {
        getObj = { ...getObj, makeDefault: ele?.makeDefault };
    }
    return getObj;
}

function validationType(val) {
    if (val === 'Text only') return 1;
    if (val === 'Number only') return 2;
    if (val === 'Alphanumeric') return 3;
}

export const Environment = {
    wiz: 'P', //team
    dwiz: 'R', //dev
    // wiz: 'S', //run23
    // wiz: 'B', //run19
    runwiz: 'R', //run
    runwizv5: 'R',
};

export const InputTypesContent = {
    Textbox: 'text',
    Radio: 'radio',
    TimeDate: 'Datepicker',
    Consent: 'checkbox',
};
