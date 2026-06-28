import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { useState, useEffect, useRef } from 'react';
import { RSPEmailBuilder } from 'resul-template-builder';
import { getSessionId } from 'Reducers/globalState/selector';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import {
    getOfferType,
    getOfferNameList,
    offerCodeCountApi,
    saveBestOffer,
} from 'Reducers/preferences/OfferManagements/request';
import { getOfferManagement } from 'Reducers/preferences/OfferManagements/reducer';
import { addSavedVersion, resetEmailBuilderReducer } from 'Reducers/preferences/EmailBuilder/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import {
    saveTemplate_AIEmail,
    getTemplate_AIEmail_byId,
    getImages_AIBuilder,
    uploadImages_AIBuilder,
    deleteImages_AIBuilder,
    save_snippet_AIBuilder,
    templateCategoryListApi_AI,
    linkVerification_AIBuilder,
    sendToMe_AIBuilder,
    spamScore_AIBuilder,
    aiemailBuilder_nameExisit,
    delete_Template_AIEmail_byId,
    emailAttach_AIBuilder,
    save_offer_snippet,
    get_offersnippentNameExist,
    delete_offersnippetById,
    fetch_offersnippetById,
    get_offersnippentLists,
} from 'Reducers/preferences/EmailBuilder/request';

import { getAttributeJson, getProfileDataClassficationAttributeById } from 'Reducers/preferences/audienceScore/request';
import { updateMDCEditMode } from 'Reducers/communication/createCommunication/Create/reducer';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';

import { URL_PREFIX_LINK } from 'Constants/EndPoints';
// import '@resulticks/email-builder/dist/style.css';
const AIOfferBuilderWrapper = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const state = useQueryParams('/communication');
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const { validUserEmailId } = useSelector(({ globalstate }) => globalstate);

    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedVersions } = useSelector(({ emailBuilderReducer }) => emailBuilderReducer);
    const [imageData, setImageData] = useState([]);
    const [updatedOfferList, setUpdatedOfferList] = useState([]);
    const [versionsList, setVersionsList] = useState([]);
    const [LinkData, setLinkData] = useState([]);
    const [SendToMeData, setSendToMeData] = useState(null);
    const [classificationData, setClassificationData] = useState([]);
    const [attributeJsonData, setAttributeJsonData] = useState([]);
    const [tempCategories, setTempCategories] = useState([]);
    const [isUpdateOfferConfig, setisUpdateOfferConfig] = useState(false);
    const [emailTemplateId, setEmailTemplateId] = useState(0);
    const [saveAsTemplate, setSaveAsTemplate] = useState(0);
    const [templateValid, setTemplateValid] = useState(false);
    const [deleteTemplate, setDeleteTemplate] = useState(false);
    const [spamScore, setSpamScore] = useState([]);
    const [emailAttach, setEmailAttach] = useState({});
    const latestTemplateId = useRef(0);
    const latestSavedVersions = useRef([]);
    const {
        getOfferTypeData,
        getOfferNameListData = [],
        getOfferNameListCountData,
    } = useSelector((state) => state.offerMangementReducer);

    // console.log('getOfferTypeData: ', getOfferTypeData);
    // console.log('personalization: ', personalization);
    // console.log('getOfferNameListData: ', getOfferNameListData);
    async function fetchOfferDetails(payload) {
        let offerTypeRes = await dispatch(getOfferType(payload));
        if (offerTypeRes?.status) {
            dispatch(getOfferManagement({ field: 'getOfferTypeData', data: offerTypeRes?.data }));
        } else {
            dispatch(getOfferManagement({ field: 'getOfferTypeData', data: [] }));
        }
    }

    async function fetchListDetails(params) {
        var payload = {
            departmentId,
            clientId,
            userId,
            campaignId: 0,
            offerTypeId: params?.offerTypeId || 1,
            offerCodeType: localStorage.getItem('offerCodeType') === 'common' ? 0 : 1,
            offerId: params?.offerId || 0,
        };
        let listTypeRes = await dispatch(getOfferNameList(payload));
        if (listTypeRes?.status) {
            setUpdatedOfferList(listTypeRes?.data);
            // dispatch(getOfferManagement({ field: 'getOfferNameListCountData', data: listTypeRes?.data }));
        } else {
            setUpdatedOfferList([]);
            // dispatch(getOfferManagement({ field: 'getOfferNameListCountData', data: [] }));
        }
    }

    useEffect(() => {
        if (state?.from === 'Offer') return;
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        dispatch(getPersonalizationFields({ payload }));
        fetchOfferDetails(payload);
    }, [state?.from]);

    /*
    COMMENTED OUT SINCE IT IS UNUSED
    const fetchTemplateCategories = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        let { status, data } = await dispatch(templateCategoryListApi_AI(payload));
        if (status) {
            setTempCategories(data);
            return {
                status: true,
                data: data || [],
                message: 'Success',
            };
        } else {
            setTempCategories([]);
            return {
                status: false,
                data: [],
                message: 'Failed to load template categories',
            };
        }
    };
    */
    const fetchImageData = async () => {
        const apiResponse = await dispatch(
            getImages_AIBuilder({
                departmentId,
                clientId,
                userId,
                builderName: 'ebuilder',
                pagination: {
                    pageNo: 1,
                    recordLimit: 100000,
                },
                isFilter: false,
                filteration: {
                    imgName: '',
                    startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                    endDate: getYYMMDD(new Date()),
                },
            }),
        );

        let { status, data, message } = apiResponse;

        // Handle nested data structure if data is an object with nested data array
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (Array.isArray(data.data)) {
                data = data.data;
            } else if (Array.isArray(data.items)) {
                data = data.items;
            }
        }

        if (status) {
            const imageArray = Array.isArray(data) ? data : [];
            setImageData(imageArray);
            return {
                status: true,
                data: imageArray,
                message: message || 'Success',
            };
        } else {
            setImageData([]);
            return {
                status: false,
                data: [],
                message: message || 'Failed to load images',
            };
        }
    };
    const [offerCode, setOfferCode] = useState('common');

    const offerCallbackFunc = async (type, params, offerTempCode) => {
        const commonParams = {
            departmentId,
            clientId,
            userId,
            campaignId: params?.campaignId || 0,
        };

        switch (type) {
            case 1:
                // params is the string value: "common" or "unique"
                setOfferCode(params);
                localStorage.setItem('offerCodeType', params);
                setisUpdateOfferConfig(true);
                break;

            case 2:
                // params now includes both offer type data AND codeType
                const offerCodeType2 = params?.codeType
                    ? params.codeType === 'common'
                        ? 0
                        : 1
                    : offerCode === 'common'
                        ? 0
                        : 1;

                var payload = {
                    ...commonParams,
                    offerTypeId: params?.offerTypeId || 1,
                    offerCodeType: offerCodeType2,
                };
                var { status, data } = await dispatch(getOfferNameList(payload));
                if (status === true) {
                    setUpdatedOfferList(data);
                } else if (status === false) {
                    setUpdatedOfferList([]);
                }
                dispatch(getOfferManagement({ field: 'getOfferNameListData', data: status ? data : [] }));
                return { status, data };

            case 3:
                // params now includes both offer data AND codeType
                const offerCodeType3 = params?.codeType
                    ? params.codeType === 'common'
                        ? 0
                        : 1
                    : offerCode === 'common'
                        ? 0
                        : 1;

                var payload = {
                    ...commonParams,
                    offerTypeId: params?.offerTypeId || 1,
                    offerCodeType: offerCodeType3,
                    offerId: params?.offerId || 0,
                };
                var { status, data } = await dispatch(offerCodeCountApi(payload));

                // Make sure to update the Redux store as well
                dispatch(getOfferManagement({ field: 'getOfferNameListCountData', data: status ? data : 0 }));

                // Return the response so the modal can handle it
                return { status, data };

            case 4:
                // Save - params.codeType contains the string value
                var payload = {
                    ...commonParams,
                    offerId: params?.selectedOffer.offerId || 0,
                    selectedoffers: [
                        {
                            // Convert the string codeType to numeric offerCodeType
                            offerCodeType: params?.codeType === 'common' ? 0 : 1,
                            offerTypeId: params?.selectedOfferType?.offerTypeId || 1,
                            offerName: params?.selectedOffer?.offerName || '',
                            SplitType: '',
                            channelId: 1,
                        },
                    ],
                };
                let saveDataStatus = await dispatch(saveBestOffer(payload));
                if (saveDataStatus?.status) {
                    setpconfig((prev) => ({
                        ...prev,
                        offerData: {
                            ...prev.offerData,
                            offerSaveData:
                                'OFFERCODE_' + params?.selectedOffer.offerId + '_' + params?.selectedOffer?.offerName,
                        },
                    }));
                }
                return saveDataStatus;

            default:
                break;
        }
    };
    const fetchContentTargetData = async () => {
        const payload = {
            classificationId: 4,
            departmentId,
            clientId,
            userId,
        };
        const response = await dispatch(getProfileDataClassficationAttributeById(payload));
        if (response?.status) {
            const getJsonParseData = (() => {
                try {
                    return typeof response?.data === 'string' ? JSON.parse(response?.data) : response;
                } catch {
                    return null;
                }
            })();
            const data = getJsonParseData?.data ?? [];
            setClassificationData(data);
            return {
                status: true,
                data: data,
                message: response?.message || 'Success',
            };
        } else {
            setClassificationData([]);
            return {
                status: false,
                data: [],
                message: response?.message || 'Failed to load content target data',
            };
        }
    };

    const fetchAttributeJsonData = async () => {
        const payload = {
            classificationId: 4,
            departmentId,
            clientId,
            userId,
        };
        const response = await dispatch(getAttributeJson(payload));
        if (response?.status) {
            const getJsonParseData = (() => {
                try {
                    return typeof response?.data === 'string' ? JSON.parse(response?.data) : response;
                } catch {
                    return null;
                }
            })();
            const data = getJsonParseData ?? [];
            setAttributeJsonData(data);
            return {
                status: true,
                data: data,
                message: response?.message || 'Success',
            };
        } else {
            setAttributeJsonData([]);
            return {
                status: false,
                data: [],
                message: response?.message || 'Failed to load attribute JSON data',
            };
        }
    };

    /** Return to Create Offer after offer-snippet builder save/cancel; prefers full `fromEnvi` when set from SnippetTemplate. */
    const navigateToCreateOfferFromOfferBuilder = (templateDetails, options = {}) => {
        const td = templateDetails || {};
        const snippetIdOverride = options.snippetId;
        const fromEnvi = td.fromEnvi;

        if (typeof fromEnvi === 'string' && fromEnvi.startsWith('/')) {
            let finalPath = fromEnvi;
            if (snippetIdOverride) {
                const separator = finalPath.includes('?') ? '&' : '?';
                finalPath += `${separator}snippetId=${snippetIdOverride}`;
            }
            // Pass back offerdetails in state to ensure form is re-populated correctly
            navigate(finalPath, { state: { offerFormData: td.offerdetails } });
            return;
        }
        if (typeof fromEnvi === 'string' && fromEnvi.startsWith('?')) {
            let finalPath = `/preferences/create-offer${fromEnvi}`;
            if (snippetIdOverride) {
                finalPath += `&snippetId=${snippetIdOverride}`;
            }
            navigate(finalPath, { state: { offerFormData: td.offerdetails } });
            return;
        }

        if (td.offerId) {
            const stateObj = { offerId: td.offerId };
            const sid =
                snippetIdOverride !== undefined && snippetIdOverride !== null && snippetIdOverride !== ''
                    ? snippetIdOverride
                    : td.snippetId;
            if (sid != null && sid !== '' && !(typeof sid === 'number' && sid === 0)) {
                stateObj.snippetId = sid;
            }
            if (td.isEdit != null && td.isEdit !== false && td.isEdit !== '') {
                stateObj.isEdit = td.isEdit;
            }
            navigate(`/preferences/create-offer?q=${encodeUrl(stateObj)}`);
            return;
        }

        navigate('/preferences/offer-management');
    };

    const saveTemplate = async (savedata) => {
        const currentTemplateId = latestTemplateId.current;

        const payload = {
            departmentId,
            clientId,
            userId,
            templateCategoryId: savedata?.templateDetails?.templateCategoryType?.templateCategoryId || 1,
            htmlContent: savedata.html,
            jsonContent: JSON.stringify(savedata.data),
            templateName: savedata?.templateDetails?.templateName || 'Ai builder',
            thumbnailPath: savedata?.FilePath || '',
            statusId: 1,
            isPredefined: true,
            createdBy: userId,
            templateId: currentTemplateId || savedata?.templateDetails?.templateId,
            campaignId: savedata?.templateDetails?.campaignId,
            edmChannelId: savedata?.templateDetails?.edmChannelId,
            isRename: false,
            isAutoSave: false,
            loading: true,
            FilePath: savedata?.FilePath || '',
            historyList: latestSavedVersions.current,
        };

        if (savedata.saveType == 'saveAsTemplate') {
            (payload.templateId = 0), (payload.loading = false);
        }

        let { status, data, message, templateId } = await dispatch(saveTemplate_AIEmail(payload));
        if (status && templateId) {
            latestTemplateId.current = templateId;
            setSaveAsTemplate(templateId);

            // For Save As Template, pass the template name to openTemplateInEditMode
            if (savedata.saveType == 'saveAsTemplate' && templateId) {
                // Create the updated template details with the new information
                const updatedTemplateDetails = {
                    ...savedata.templateDetails,
                    templateId: templateId,
                    templateName: savedata.templateDetails.templateName, // Keep the name that was just saved
                    templateCategoryType: savedata?.templateDetails?.templateCategoryType || 1,
                };

                // Update pconfig with the new template details BEFORE opening in edit mode
                setpconfig((prev) => ({
                    ...prev,
                    templateDetails: updatedTemplateDetails,
                }));

                // Wait a bit for the state update to propagate
                setTimeout(() => {
                    // Then open in edit mode
                    openTemplateInEditMode(templateId, savedata?.templateDetails?.templateCategoryType);
                }, 100);
            }
        }

        // For Save As Template, don't navigate - let the EmailBuilder handle it
        if (status && savedata.saveType !== 'saveAsTemplate') {
            if (savedata?.templateDetails?.campaignType === 'M') {
                dispatch(updateMDCEditMode('edit'));
                navigate(`/communication/create-mdc-communication` + savedata?.templateDetails?.fromEnvi);
            } else if (savedata?.templateDetails?.from === 'Communication') {
                navigate(`/communication/create-communication` + savedata?.templateDetails?.fromEnvi);
            } else if (savedata?.templateDetails?.from === 'Offer') {
                navigateToCreateOfferFromOfferBuilder(savedata?.templateDetails);
            } else {
                const currentPath = location?.pathname || '';
                if (currentPath.includes('webpush-builder')) {
                    navigate('/preferences/template-gallery/webpush-builder-gallery');
                } else if (currentPath.includes('mobile-push-builder')) {
                    navigate('/preferences/template-gallery/mobile-builder-gallery');
                } else {
                    navigate('/preferences/template-gallery/email-builder-gallery');
                }
            }
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }

        // Return the response for Save As Template operations
        return { status, templateId, message };
    };

    // NEW: Function to handle opening a template in edit mode
    const openTemplateInEditMode = async (templateId, categoryDetails = {}, savedata = {}) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            templateId: templateId,
            templateCategoryId: categoryDetails?.templateCategoryId || 1, // Default category
            channelId: 1,
            isAutoSave: false,
            loading: false,
        };

        let { status, data, message } = await dispatch(getTemplate_AIEmail_byId(payload));

        if (status && data) {
            let resolutionSize = savedata?.templateDetails?.resolution || '';
            try {
                const parsedData = typeof data.JsonContent === 'string' ? JSON.parse(data.JsonContent) : data.JsonContent;
                const canvasStyle = parsedData?.settings?.style || parsedData?.display || {};
                if (canvasStyle?.emailWidth) {
                    resolutionSize = `${canvasStyle.emailWidth}x${canvasStyle.emailHeight || 600}`;
                } else if (parsedData?.resolution) {
                    resolutionSize = parsedData.resolution;
                } else if (data?.Resolution || data?.resolution) {
                    resolutionSize = data.Resolution || data.resolution;
                }
            } catch (e) { }

            const state = {
                ...savedata?.templateDetails,
                data: data?.JsonContent,
                templateId: data?.TemplateID,
                mode: 'edit',
                templateName: data?.TemplateName || 'Ai_Template',
                templateDate: data?.CreatedDate,
                templateType: '',
                templateCategoryType: categoryDetails || 1,
                resolution: resolutionSize,
            };

            setpconfig((prev) => ({
                ...prev,
                templateDetails: state,
                editTemplateData: {
                    data: data?.jsonContent || data?.JsonEDMContent,
                    templateId: data.templateId,
                    templateCategoryType: categoryDetails,
                },
            }));

            const encryptState = encodeUrl(state);
            navigate(`/preferences/template-gallery/email-builder?q=${encryptState}&mode=${state.mode}`, {
                state,
            });
        }

        return { status: false, message };
    };

    const saveVersionData = (savedata) => {
        const versionData = {
            CreatedDate: new Date().toISOString(),
            htmlContent: savedata.html,
            jsonContent: JSON.stringify(savedata.data),
            templateAutoSaveId: 0,
        };
        dispatch(addSavedVersion(versionData));
    };

    const saveVersion = async (savedata) => {
        // Use the ref value which will always be current
        const currentTemplateId = latestTemplateId.current;

        const payload = {
            departmentId,
            clientId,
            userId,
            templateCategoryId: savedata?.templateDetails?.templateCategoryType?.templateCategoryId,
            templateId: savedata?.templateDetails?.templateId || currentTemplateId,
            templateName: savedata?.templateDetails?.templateName || 'Ai builder',
            version: savedata?.templateDetails?.version,
            htmlContent: savedata.html,
            jsonContent: JSON.stringify(savedata.data),
            thumbnailPath: savedata?.FilePath || '',
            statusId: 1,
            isPredefined: true,
            createdBy: userId,
            isRename: false,
            isAutoSave: true,
            loading: false,
            FilePath: savedata?.FilePath || '',
        };

        if (payload.templateId == 0) {
            payload.isAutoSave = false;
            payload.loading = true;
        }

        let { status, templateId } = await dispatch(saveTemplate_AIEmail(payload));

        if (status && templateId) {
            latestTemplateId.current = templateId;
            setEmailTemplateId(templateId);
            // Update the pconfig to trigger edit mode

            if (payload.templateId == 0) {
                openTemplateInEditMode(templateId, savedata?.templateDetails?.templateCategoryType, savedata);
            }
            // navigate(`/preferences/template-gallery/email-builder?q=${encryptState}`, {
            //     state,
            // });
        }
    };

    const linkVerification = async (linksdata) => {
        let { status, data, message } = await dispatch(linkVerification_AIBuilder(linksdata));
        if (status) {
            setLinkData(data);
        } else {
            setLinkData([]);
        }
    };

    const emailAttachment = async (formdata) => {
        try {
            const filedata = formdata.get('file');
            // Verify file data
            let newFormData = new FormData();
            newFormData.append('file', filedata, filedata.name);

            // For debugging, inspect what's actually in the FormData
            for (let [key, value] of newFormData.entries()) {
            }

            let { status, data, message } = await dispatch(emailAttach_AIBuilder(newFormData));

            if (status) {
                setEmailAttach(data);
            } else {
                setEmailAttach({
                    data: {
                        value: {
                            extension: '.pdf',
                            icon: '/Images/pdf-icon.png',
                            link: '/Uploads/Template/dummy_20250807055257.pdf',
                            displayName: 'dummy.pdf',
                            fileSize: '13 KB',
                        },
                        formatters: [],
                        contentTypes: [],
                        declaredType: null,
                        statusCode: 200,
                    },
                });
            }
        } catch (error) { }
    };

    const sendToMe = async (savedata) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            // toEmail:  "d.vishva@resulticksmail.com",
            // TestCampaignEmailAddress:  "d.vishva@resulticksmail.com",
            toEmail: validUserEmailId,
            TestCampaignEmailAddress: validUserEmailId,
            Subject: 'Email Template Preview',
            IsFooterEnabled: false,
            FromEmailAddress: '',
            EmailfooterContent: '',
            CampaignId: '0',
            ContentSourceType: 'T',
            FormTemplateId: '0',
            FromName: '',
            // Content: savedata.html,
            Content: (() => {
                let contentHtml = savedata.html || '';
                contentHtml = contentHtml.replace(
                    /(src\s*=\s*["'])\[BAR_OFFER_CODE_[^\]]+\](["'])/g,
                    '$1https://wiz.resul.io//Uploads/aSW/1/ebuilder/291225073421202_0Bar_code.png$2'
                );
                contentHtml = contentHtml.replace(
                    /(src\s*=\s*["'])\[QR_OFFER_CODE_[^\]]+\](["'])/g,
                    '$1https://wiz.resul.io//Uploads/aSW/1/ebuilder/291225073421205_1Qr_code.png$2'
                );
                contentHtml = contentHtml.replace(/\[TEXT_OFFER_CODE_(\d+)_([^\]]+)\]/g, '$2');
                contentHtml = contentHtml.replace(/\[URL_OFFER_CODE_(\d+)_([^\]]+)\]/g, '#');
                return contentHtml;
            })(),
            FooterAddress: '',
            EmailFooterID: 0,
            CampaignType: 'S',
        };

        let { success, message } = await dispatch(sendToMe_AIBuilder(payload));

        // Store the response in the format expected by EmailBuilder
        if (success) {
            setSendToMeData({ success: true, message: message });
        } else {
            setSendToMeData({ success: false, message: message });
        }
    };

    const spamScoreres = async (spamData) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            campaignId: 0,
            body: spamData.html,
            body1: '',
            emailFooterRawcode: '',
            preHeaderMessage: '',
            subjectLine: 'check spam score',
            spamScore: 'spamScore',
            top3: 'top3',
        };
        let { status, data, message } = await dispatch(spamScore_AIBuilder(payload));
        if (status) {
            setSpamScore({ status, ...data });
            return { success: true, status: true, ...data };
        } else {
            setSpamScore([]);
            return { success: false, status: false, message };
        }
    };

    const checkTemplateNameExists = async (templateName) => {
        const payload = {
            channelId: 1,
            clientId,
            departmentId,
            templateName,
            userId,
        };

        let { status, data, message } = await dispatch(aiemailBuilder_nameExisit({ payload }));

        setTemplateValid(status);
        setpconfig((prev) => ({
            ...prev,
            templateValid: status,
        }));

        return { status, data, message };
    };

    // const userDetail = getUserDetails();
    // console.log('userDetail: ', userDetail);

    // Update ref whenever emailTemplateId changes
    useEffect(() => {
        latestTemplateId.current = emailTemplateId;
    }, [emailTemplateId]);

    // Update ref whenever savedVersions changes
    useEffect(() => {
        latestSavedVersions.current = savedVersions;
    }, [savedVersions]);

    const deleteTemplateById = async (templateId) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            templateId: latestTemplateId.current || templateId,
        };
        //    debugger
        let { status, data, message } = await dispatch(delete_Template_AIEmail_byId(payload));

        if (status) {
            setDeleteTemplate(true);
        }

        return { status, data, message };
    };

    const getVersions = async (savedata) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            templateId: savedata?.templateDetails?.templateId || latestTemplateId.current,
            templateCategoryId: savedata?.templateDetails?.templateCategoryType?.templateCategoryId,
            channelId: 1,
            isAutoSave: true,
        };
        let { status, data, message } = await dispatch(getTemplate_AIEmail_byId(payload));
        if (status) {
            setVersionsList(data);
        } else {
            setVersionsList([]);
        }
    };
    const imageCallbackFunc = async (type, params) => {
        const payload = {
            ...params,
            departmentId,
            clientId,
            userId,
            builderName: 'ebuilder',
        };
        if (type === 2) {
            // Upload image
            let { status, data, message } = await dispatch(uploadImages_AIBuilder(payload));
            if (status) {
                // Reload image data after upload (store will handle caching)
                const refreshedData = await fetchImageData();
                return {
                    status: true,
                    data: refreshedData?.data || [],
                    message: message || 'Image uploaded successfully',
                };
            } else {
                return {
                    status: false,
                    data: [],
                    message: message || 'Failed to upload image',
                };
            }
        } else if (type === 3) {
            // Delete image
            let { status, data, message } = await dispatch(deleteImages_AIBuilder(payload));
            if (status) {
                // Reload image data after delete (store will handle caching)
                const refreshedData = await fetchImageData();
                return {
                    status: true,
                    data: refreshedData?.data || [],
                    message: message || 'Image deleted successfully',
                };
            } else {
                return {
                    status: false,
                    data: [],
                    message: message || 'Failed to delete image',
                };
            }
        } else if (type === 1) {
            const result = await fetchImageData();
            return result;
        }
        return {
            status: false,
            data: [],
            message: 'Invalid operation type',
        };
    };

    const contentTargetCallback = async () => {
        const [contentTargetResponse, attributeResponse] = await Promise.all([
            fetchContentTargetData(),
            fetchAttributeJsonData(),
        ]);

        const overallStatus = contentTargetResponse?.status && attributeResponse?.status;

        return {
            status: overallStatus,
            contentTargetAttributeData: contentTargetResponse?.data || [],
            attributeJsonData: attributeResponse?.data || [],
            message: overallStatus
                ? contentTargetResponse?.message || 'Success'
                : contentTargetResponse?.message || attributeResponse?.message || 'Failed to load content target data',
        };
    };

    const [pconfig, setpconfig] = useState({
        personlisationData: personalization,
        offerData: {
            offerSaveData: '',
            offerTypeData: getOfferTypeData,
            offerListData: getOfferNameListData,
            offerListCountData: getOfferNameListCountData,
        },
        imageConfigURL: URL_PREFIX_LINK,
        isPersonalization: true,
        imageListData: [],
        templateDetails: {},
        contentTargetAttributeData: '',
        attributeJsonData: '',
        fullAttributeJson: '',
        templateCategory: tempCategories,
        versionsList: [],
        linkVerificationData: [],
        saveAsTemplate: '',
        deleteTemplate,
        templateValid,
        SendToMeData: null,
        emailAttach: {},
        snippetData: {
            listData: [],
            selectedData: {},
            snippetNameValidation: false,

            checkSnippetNameExist: async (name) => {
                const payload = {
                    clientId,
                    departmentId,
                    userId,
                    snippetName: name,
                };
                const result = await dispatch(get_offersnippentNameExist(payload));
                return result;
            },
            saveSnippet: async (data) => {
                // debugger
                const payload = {
                    clientId,
                    departmentId,
                    userId,
                    snippetId: data?.snippetId || state?.templateId || '',
                    snippetName: data?.snippetName,
                    templateCategoryId: data?.templateCategoryId || 1,
                    jsonContent: data,
                };

                if (data.offerBuilderEnabled) {
                    const result = await dispatch(save_offer_snippet(payload));
                    if (result.status) {
                        const templateDetails = state || {};
                        if (templateDetails?.from === 'Offer') {
                            navigateToCreateOfferFromOfferBuilder(templateDetails, {
                                snippetId: result.snippetId,
                            });
                        } else {
                            navigate('/preferences/offer-management');
                        }
                    }
                    return result;
                }

                const result = await dispatch(save_snippet_AIBuilder(payload));
                return result;
            },
            getSnippetList: async () => {
                const payload = {
                    clientId,
                    departmentId,
                    userId,
                };
                const params = {
                    channelId: 1,
                    templatecategory: 'All template',
                    pagination: {
                        pageNo: 1,
                        recordLimit: 1000000,
                    },
                    isFilter: false,
                    filteration: {
                        snippetName: '',
                        startDate: '2025-01-28',
                        endDate: '2025-02-26',
                    },
                };

                const result = await dispatch(get_offersnippentLists({ ...payload, ...params }));
                return result;
            },
            getSnippetDataById: async (id) => {
                const payload = {
                    clientId,
                    departmentId,
                    userId,
                    snippetId: id,
                };
                const result = await dispatch(fetch_offersnippetById(payload));
                return result;
            },
            deleteSnippet: async (id) => {
                const payload = {
                    clientId,
                    departmentId,
                    userId,
                    snippetId: id,
                };
                const result = await dispatch(delete_offersnippetById(payload));
                if (result.status) {
                    // fetchImageData();
                }

                return result;
            },
        },
        formAttributeData: '',
        offerCallback: async (type, params) => {
            if (type === 1) {
                localStorage.setItem('offerCodeType', params);
                setOfferCode(params);
            }
            // offerCallbackFunc(type, params, offerCode);
            return await offerCallbackFunc(type, params, offerCode);
        },
        offerListCallback: async (params) => {
            return await fetchListDetails(params);
        },
        // ✅ SIMPLIFIED: imageCallback - just handles API calls, caching handled in store
        imageCallback: async (type, params) => {
            //1- get, 2- upload/updated, 3- delete
            const result = await imageCallbackFunc(type, params);
            return result;
        },
        contentTargetCallback: async () => {
            return await contentTargetCallback();
        },
        offerTypeDataCallback: async () => {
            const payload = {
                departmentId,
                clientId,
                userId,
            };
            let offerTypeRes = await dispatch(getOfferType(payload));
            if (offerTypeRes?.status) {
                dispatch(getOfferManagement({ field: 'getOfferTypeData', data: offerTypeRes?.data }));
                return {
                    status: true,
                    data: offerTypeRes?.data || [],
                    message: offerTypeRes?.message || 'Success',
                };
            } else {
                dispatch(getOfferManagement({ field: 'getOfferTypeData', data: [] }));
                return {
                    status: false,
                    data: [],
                    message: offerTypeRes?.message || 'Failed to load offer types',
                };
            }
        },
        templateCategoryCallback: async () => {
            const payload = {
                departmentId,
                clientId,
                userId,
            };
            let { status, data, message } = await dispatch(templateCategoryListApi_AI(payload));
            if (status) {
                setTempCategories(data);
                return {
                    status: true,
                    data: data || [],
                    message: message || 'Success',
                };
            } else {
                setTempCategories([]);
                return {
                    status: false,
                    data: [],
                    message: message || 'Failed to load template categories',
                };
            }
        },
        saveCallback: async (data) => {
            if (data?.templateDetails?.from === 'Offer') {
                const snippetPayload = {
                    clientId,
                    departmentId,
                    userId,
                    snippetId: data.saveType === 'saveAsTemplate' ? '' : (data?.templateDetails?.templateId || state?.templateId || ''),
                    snippetName:
                        data.saveType === 'saveAsTemplate' ? data.templateName : (data?.templateDetails?.templateName || state?.templateName),
                    templateCategoryId: data?.templateDetails?.templateCategoryType?.templateCategoryId || 2,
                    jsonContent: JSON.stringify(data.data),
                };
                const result = await dispatch(save_offer_snippet(snippetPayload));
                if (result?.status) {
                    return { success: true };
                }
                return { success: false };
            }

            if (data.saveType === 'saveAsTemplate') {
                data = { ...data, isRename: true };
                data = {
                    ...data,
                    isRename: true,
                    templateId: 0,
                };

                const result = await saveTemplate(data);
                return result;
            } else {
                // Regular save operation
                await saveTemplate(data);
                return { success: true };
            }
        },
        saveVersionCallback: (data) => {
            saveVersionData(data);
        },
        getVersionCallback: (data) => {
            getVersions(data);
        },
        getLinkVerificationCallback: (data) => {
            linkVerification(data);
        },
        sendToMeCallback: (data) => {
            sendToMe(data);
        },
        spamScoreCallback: (data) => {
            spamScoreres(data);
        },
        emailAttachCallback: (data) => {
            emailAttachment(data);
        },
        cancelCallback: (data) => {
            if (data?.templateDetails?.campaignType === 'M') {
                dispatch(updateMDCEditMode('edit'));
                navigate(`/communication/create-mdc-communication` + data?.templateDetails?.fromEnvi);
            } else if (data?.templateDetails?.from === 'Communication') {
                navigate(`/communication/create-communication` + data?.templateDetails?.fromEnvi);
            } else if (data?.templateDetails?.from === 'Offer') {
                navigateToCreateOfferFromOfferBuilder(data?.templateDetails);
            } else {
                const currentPath = location?.pathname || '';
                if (currentPath.includes('webpush-builder')) {
                    navigate('/preferences/template-gallery/webpush-builder-gallery');
                } else if (currentPath.includes('mobile-push-builder')) {
                    navigate('/preferences/template-gallery/mobile-builder-gallery');
                } else {
                    navigate('/preferences/offer-management');
                }
            }
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        },
        templateNameExistsCallback: async (name) => {
            return await checkTemplateNameExists(name); // Now it returns the status
        },

        deleteTemplateCallback: async (id) => {
            return await deleteTemplateById(id);
        },
        // NEW: Added openTemplateInEditMode function
        // openTemplateInEditMode: openTemplateInEditMode,
        editTemplateData: {},
        emailFooter: false,
        offerBuilderEnabled: true,
    });

    useEffect(() => {
        if (isUpdateOfferConfig) {
            setpconfig((prev) => ({
                ...prev,
                offerData: {
                    offerSaveData: '',
                    offerTypeData: getOfferTypeData,
                    offerListData: [],
                    offerListCountData: 0,
                },
            }));
            setisUpdateOfferConfig(false);
        }
    }, [isUpdateOfferConfig]);
    useEffect(() => {
        if (state !== null) {
            setpconfig((prev) => ({
                ...prev,
                templateDetails: state,
            }));
        }
    }, [state]);
    useEffect(() => {
        let rawData = state?.data || null;

        if (savedVersions.length > 0) {
            const lastSavedVersion = savedVersions[savedVersions.length - 1];
            rawData = lastSavedVersion?.jsonContent || lastSavedVersion?.JsonEDMContent || rawData;
        }

        if (state?.from === 'Offer' && rawData) {
            try {
                const isRawDataString = typeof rawData === 'string';
                const parsed = isRawDataString ? JSON.parse(rawData) : rawData;

                const resolutionStr = state?.resolution || '';
                const resWidth = parseInt(resolutionStr.split('x')[0], 10);
                const widthFromState = !isNaN(resWidth) && resWidth > 0 ? resWidth : null;

                const existingWidth = parsed?.settings?.style?.emailWidth
                    ? parseInt(parsed.settings.style.emailWidth, 10)
                    : parsed?.display?.emailWidth
                        ? parseInt(parsed.display.emailWidth, 10)
                        : parsed?.style?.emailWidth
                            ? parseInt(parsed.style.emailWidth, 10)
                            : parsed?.style?.width
                                ? parseInt(parsed.style.width, 10)
                                : null;

                const widthToUse = widthFromState || existingWidth || 600;

                if (!parsed.settings) parsed.settings = {};
                if (!parsed.settings.style) parsed.settings.style = {};
                parsed.settings.style.emailWidth = widthToUse;

                // ALWAYS stringify it because the builder's App.tsx strictly uses JSON.parse(templateData)
                rawData = JSON.stringify(parsed);
            } catch (e) {
                console.error('Error patching width:', e);
            }
        }

        setpconfig((prev) => ({
            ...prev,
            editTemplateData: { data: rawData, templateId: state?.templateId },
        }));

        return () => {
            dispatch(resetEmailBuilderReducer());
        };
    }, [state, savedVersions]);

    useEffect(() => {
        const callImediate = async () => {
            const payload = {
                templateId: state?.templateId || 0,
                channelId: 1,
                departmentId,
                clientId,
                userId,
            };
            let templateData = await dispatch(getTemplate_AIEmail_byId(payload));
            setpconfig((prev) => ({
                ...prev,
                editTemplateData: {
                    data: templateData?.data?.JsonEDMContent || templateData?.data?.JsonContent,
                    templateId: state?.templateId,
                },
            }));
        };
        if (state?.templateId && state?.from !== 'Offer') {
            callImediate();
        }
    }, [state]);

    useEffect(() => {
        if (savedVersions.length > 0) {
            latestSavedVersions.current = savedVersions;
            // Create a copy of the array before reversing to avoid mutating the original
            let savedVersionsList = [...savedVersions];
            savedVersionsList.reverse();
            setpconfig((prev) => ({
                ...prev,
                versionsList: savedVersionsList,
            }));
        }
    }, [savedVersions]);
    useEffect(() => {
        setpconfig((prev) => ({
            ...prev,
            personlisationData: personalization,
            offerData: {
                offerSaveData: '',
                offerTypeData: getOfferTypeData,
                offerListData: [],
                offerListCountData: 0,
            },
            // offerTypeData: getOfferTypeData,
        }));
    }, [personalization, getOfferTypeData]);

    useEffect(() => {
        if (tempCategories?.length > 0) {
            setpconfig((prev) => ({
                ...prev,
                templateCategory: tempCategories,
            }));
        }
    }, [tempCategories]);
    useEffect(() => {
        if (getOfferNameListData?.length > 0) {
            setpconfig((prev) => ({
                ...prev,
                offerData: {
                    offerSaveData: '',
                    offerTypeData: getOfferTypeData,
                    offerListData: getOfferNameListData,
                    offerListCountData: 0,
                },
                //offerListData: getOfferNameListData,
            }));
        }
    }, [getOfferNameListData]);
    useEffect(() => {
        if (typeof getOfferNameListCountData === 'number' && !isNaN(getOfferNameListCountData)) {
            setpconfig((prev) => ({
                ...prev,
                offerData: {
                    offerSaveData: '',
                    offerTypeData: getOfferTypeData,
                    offerListData: getOfferNameListData,
                    offerListCountData: getOfferNameListCountData,
                },
            }));
        }
    }, [getOfferNameListCountData]);
    useEffect(() => {
        if (imageData?.length > 0) {
            setpconfig((prev) => ({
                ...prev,
                imageListData: imageData,
            }));
        }
    }, [imageData]);
    useEffect(() => {
        if (classificationData?.length > 0) {
            setpconfig((prev) => ({
                ...prev,
                contentTargetAttributeData: classificationData,
            }));
        }
    }, [classificationData]);
    useEffect(() => {
        if (attributeJsonData?.length > 0) {
            setpconfig((prev) => ({
                ...prev,
                attributeJsonData: attributeJsonData,
            }));
        }
    }, [attributeJsonData]);
    useEffect(() => {
        setpconfig((prev) => ({
            ...prev,
            offerData: {
                ...prev.offerData,
                offerListData: updatedOfferList,
            },
        }));
    }, [updatedOfferList]);

    useEffect(() => {
        if (versionsList?.length > 0) {
            setpconfig((prev) => ({
                ...prev,
                versionsList: versionsList,
            }));
        }
    }, [versionsList]);

    useEffect(() => {
        if (LinkData?.length > 0) {
            setpconfig((prev) => ({
                ...prev,
                linkVerificationData: LinkData,
            }));
        }
    }, [LinkData]);

    useEffect(() => {
        if (saveAsTemplate) {
            setpconfig((prev) => ({
                ...prev,
                saveAsTemplate: saveAsTemplate,
            }));
        }
    }, [LinkData]);

    // useEffect(() => {
    //     if (SendToMeData) {
    //         setpconfig((prev) => ({
    //             ...prev,
    //             SendToMeData: SendToMeData,
    //         }));
    //     }
    // }, [SendToMeData]);

    useEffect(() => {
        if (SendToMeData) {
            setpconfig((prev) => ({
                ...prev,
                SendToMeData: SendToMeData,
            }));

            // Set up the timeout
            const timer = setTimeout(() => {
                setpconfig((prev) => ({
                    ...prev,
                    SendToMeData: null,
                }));
                // Optionally reset the SendToMeData state as well
                setSendToMeData(null);
            }, 5000);

            // Cleanup function to clear the timeout
            return () => {
                clearTimeout(timer);
            };
        }
    }, [SendToMeData]);

    useEffect(() => {
        if (spamScore) {
            setpconfig((prev) => ({
                ...prev,
                spamScore: spamScore,
            }));
        }
    }, [spamScore]);

    useEffect(() => {
        if (templateValid) {
            setpconfig((prev) => ({
                ...prev,
                templateValid: templateValid,
            }));
        }
    }, [templateValid]);

    useEffect(() => {
        if (deleteTemplate) {
            setpconfig((prev) => ({
                ...prev,
                deleteTemplate: deleteTemplate,
            }));
        }
    }, [deleteTemplate]);
    useEffect(() => {
        if (emailAttach) {
            setpconfig((prev) => ({
                ...prev,
                emailAttach: emailAttach,
            }));
        }
    }, [emailAttach]);

    // Function to get category name
    const getCategoryName = () => {
        const categoryType = state?.templateCategoryType;

        // Handle case where templateCategoryType is the full category object (new template creation)
        if (categoryType && typeof categoryType === 'object' && categoryType.categoryName) {
            return categoryType.categoryName;
        }

        // Handle case where templateCategoryType is just an ID (existing template editing)
        if (categoryType && typeof categoryType === 'number' && templateCategories.length > 0) {
            const category = templateCategories.find((cat) => cat.templateCategoryId === categoryType);
            return category?.categoryName || 'Uncategorized';
        }

        // Handle case where templateCategoryType is an object with templateCategoryId
        if (categoryType && typeof categoryType === 'object' && categoryType.templateCategoryId) {
            const category = templateCategories.find(
                (cat) => cat.templateCategoryId === categoryType.templateCategoryId,
            );
            return category?.categoryName || 'Uncategorized';
        }

        return 'Uncategorized';
    };

    return (
        <>
            {/* <InfoCardBuilder data={state}></InfoCardBuilder> */}
            <RSPEmailBuilder
                pconfig={pconfig}
                data={state}
                templateName={state?.templateName || ''}
                templateCategory={getCategoryName()}
                emailFooter={true}
                date={
                    state?.from === 'Communication'
                        ? (() => {
                            if (state?.CampaignDate) {
                                // Split the date range and format each date
                                const [startDate, endDate] = state.CampaignDate.split(' - ');
                                const formattedStartDate = getUserCurrentFormat(startDate)?.dateFormat || startDate;
                                const formattedEndDate = getUserCurrentFormat(endDate)?.dateFormat || endDate;
                                return `${formattedStartDate} - ${formattedEndDate}`;
                            }
                            return 'NA';
                        })()
                        : getUserCurrentFormat(state?.templateDate)?.dateFormat || 'NA'
                }
            />
        </>
    );
};

export default AIOfferBuilderWrapper;
