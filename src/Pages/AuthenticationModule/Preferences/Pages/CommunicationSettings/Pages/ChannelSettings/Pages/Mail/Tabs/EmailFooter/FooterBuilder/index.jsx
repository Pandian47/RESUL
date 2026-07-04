import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { createCommunicationSettingsNavState, MAIL_TAB_ID } from 'Utils/modules/navigation';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import RSLoader from 'Components/Loader';

const RSPEmailBuilderLazy = lazy(() =>
    import('resul-template-builder').then((module) => ({ default: module.RSPEmailBuilder })),
);
import { getSessionId } from 'Reducers/globalState/selector';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import { getEmailFooterById, saveEmailFooterData } from 'Reducers/preferences/CommunicationSettings/request';
import { getOfferType } from 'Reducers/preferences/OfferManagements/request';
import { getOfferManagement } from 'Reducers/preferences/OfferManagements/reducer';
import { addSavedVersion, setSavedVersions, resetEmailBuilderReducer } from 'Reducers/preferences/EmailBuilder/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { getImages_AIBuilder, uploadImages_AIBuilder, deleteImages_AIBuilder, templateCategoryListApi_AI, linkVerification_AIBuilder, sendToMe_AIBuilder, spamScore_AIBuilder, aiemailFooter_nameExisit, getTemplate_AIEmail_byId } from 'Reducers/preferences/EmailBuilder/request';

import { getAttributeJson, getProfileDataClassficationAttributeById } from 'Reducers/preferences/audienceScore/request';
import { updateMDCEditMode } from 'Reducers/communication/createCommunication/Create/reducer';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';

const FOOTER_BUILDER_PREFERENCES_STATE = createCommunicationSettingsNavState('mail', {
    subfrom: 'footer-builder',
    mailTabId: MAIL_TAB_ID.EMAIL_FOOTER,
});

const exitFullscreenIfActive = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
};

const FooterBuilder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const state = useQueryParams('/communication');
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const resolveCommunicationState = (builderData) => {
        const templateDetails = builderData?.templateDetails;

        if (templateDetails?.communicationState?.from === 'communication') {
            return templateDetails.communicationState;
        }
        if (templateDetails?.from === 'communication') {
            return templateDetails;
        }
        if (state?.communicationState?.from === 'communication') {
            return state.communicationState;
        }
        if (state?.from === 'communication') {
            return state;
        }
        return null;
    };

    const navigateFromFooterBuilder = (builderData, { savedFooterId } = {}) => {
        const communicationState = resolveCommunicationState(builderData);

        if (communicationState?.from !== 'communication') {
            navigate('/preferences/communication-settings', { state: FOOTER_BUILDER_PREFERENCES_STATE });
            exitFullscreenIfActive();
            return;
        }

        const encryptState = encodeUrl({
            ...communicationState,
            savedFooterId: savedFooterId ?? 0,
        });

        if (communicationState.campaignType === 'M') {
            dispatch(updateMDCEditMode('edit'));
            navigate(`/communication/create-mdc-communication?q=${encryptState}`);
        } else {
            navigate(`/communication/create-communication?q=${encryptState}`);
        }

        exitFullscreenIfActive();
    };
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedVersions } = useSelector(({ emailBuilderReducer }) => emailBuilderReducer);
    const [imageData, setImageData] = useState([]);
    const [classificationData, setClassificationData] = useState([]);
    const [tempCategories, setTempCategories] = useState([]);
    const [isUpdateOfferConfig, setisUpdateOfferConfig] = useState(false);
    const {
        getOfferTypeData,
        getOfferNameListData = [],
        getOfferNameListCountData,
    } = useSelector((state) => state.offerMangementReducer);
    const [versionsList, setVersionsList] = useState([]);
    const [LinkData, setLinkData] = useState([]);
    const [SendToMeData, setSendToMeData] = useState(null);
    const [emailTemplateId, setEmailTemplateId] = useState(0);
    const [saveAsTemplate, setSaveAsTemplate] = useState(0);
    const [templateValid, setTemplateValid] = useState(false);
    const [deleteTemplate, setDeleteTemplate] = useState(false);
    const [spamScore, setSpamScore] = useState([]);
    const latestTemplateId = useRef(0);
    const latestSavedVersions = useRef([]);

    async function fetchOfferDetails(payload) {
        let offerTypeRes = await dispatch(getOfferType(payload));
        if (offerTypeRes?.status) {
            dispatch(getOfferManagement({ field: 'getOfferTypeData', data: offerTypeRes?.data }));
        } else {
            dispatch(getOfferManagement({ field: 'getOfferTypeData', data: [] }));
        }
    }
    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        dispatch(getPersonalizationFields({ payload }));
        fetchOfferDetails(payload);
    }, []);

    const fetchTemplateCategories = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        let { status, data } = await dispatch(templateCategoryListApi_AI(payload));
        if (status) {
            setTempCategories(data);
        } else {
            setTempCategories([]);
        }
    };
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

    // const saveTemplate = async (savedata) => {
    //     console.log('savedata: ', savedata);
    //     const emailFooterId = savedata?.templateDetails?.templateId;
    //     const payload = {
    //         departmentId,
    //         clientId,
    //         userId,
    //         emailfooterId: emailFooterId ? emailFooterId : 0,
    //         footerName: savedata?.templateDetails?.templateName || 'Footer Builder',
    //         emailFooterHTML: savedata.html || '{}',
    //         emailFooterJSON: JSON.stringify(savedata.data),
    //         createdBy: userId,
    //     };

    //     let { status, data, message, emailFooterId: savedFooterId = 0 } = await dispatch(saveEmailFooterData(payload));
    //     if (status) {
    //         if (savedata?.templateDetails?.communicationState?.from === 'communication') {
    //             let updateLocationState = {
    //                 ...savedata?.templateDetails?.communicationState,
    //                 savedFooterId: savedFooterId || 0,
    //             };
    //             const encryptState = encodeUrl(updateLocationState);
    //             if (savedata?.templateDetails?.communicationState?.campaignType === 'M') {
    //                 dispatch(updateMDCEditMode('edit'));
    //                 navigate(`/communication/create-mdc-communication?q=${encryptState}`);
    //             } else {
    //                 navigate(`/communication/create-communication?q=${encryptState}`);
    //             }
    //         } else {
    //             navigate('/preferences/communication-settings', {
    //                 state: {
    //                     subfrom: 'footer-builder',
    //                     tab: 0,
    //                     subTab: 1,
    //                     verticalTab: 0,
    //                 },
    //             });
    //         }
    //     }
    // };

    const saveVersionData = (savedata) => {
        const versionData = {
            CreatedDate: new Date().toISOString(),
            htmlContent: savedata.html,
            jsonContent: JSON.stringify(savedata.data),
            templateAutoSaveId: 0,
        };
        dispatch(addSavedVersion(versionData));

        // Update the ref immediately with the new version
        const updatedVersions = [...latestSavedVersions.current, versionData];
        latestSavedVersions.current = updatedVersions;

                        return versionData;
    };

    const saveTemplate = async (savedata) => {
        const currentTemplateId = latestTemplateId.current;
                
        // Get the latest savedVersions from ref which is always current
        const currentSavedVersions = latestSavedVersions.current;
        
        // Transform the keys for footer-specific format
        const transformedVersions = currentSavedVersions.map((version) => ({
            ...version,
            emailFooterHTML: version.htmlContent,
            emailFooterJSON: version.jsonContent,
            footerAutoSaveId: version.templateAutoSaveId,
            createdDate: version.CreatedDate,
            // Remove the old keys to avoid duplication
            htmlContent: undefined,
            jsonContent: undefined,
            templateAutoSaveId: undefined,
            CreatedDate: undefined,
        }));
                //  debugger
        const payload = {
            clientId,
            createdBy: userId,
            departmentId,
            emailFooterHTML: savedata.html || '{}',
            emailFooterJSON: JSON.stringify(savedata.data),
            emailfooterId: savedata?.templateDetails?.templateId ?? 0,
            footerName: savedata?.templateDetails?.templateName || 'Footer Builder',
            userId,
            historyList: transformedVersions,
        };

        if (savedata.saveType == 'saveAsTemplate') {
            payload.emailfooterId = 0;
        }

        let { status, message, emailfooterId } = await dispatch(saveEmailFooterData(payload));
        if (status && emailfooterId) {
            latestTemplateId.current = emailfooterId;
            setSaveAsTemplate(emailfooterId);

            // For Save As Template, pass the template name to openTemplateInEditMode
            if (savedata.saveType == 'saveAsTemplate' && emailfooterId) {
                                // Create the updated template details with the new information
                const updatedTemplateDetails = {
                    ...savedata.templateDetails,
                    templateId: emailfooterId,
                    templateName: savedata.templateDetails.templateName, // Keep the name that was just saved
                };

                
                // Update pconfig with the new template details BEFORE opening in edit mode
                setpconfig((prev) => ({
                    ...prev,
                    templateDetails: updatedTemplateDetails,
                }));

                // Wait a bit for the state update to propagate
                setTimeout(() => {
                    // Then open in edit mode
                    openTemplateInEditMode(emailfooterId, savedata?.templateDetails?.templateCategoryType);
                }, 100);
            }
        }

        if (status && savedata.saveType !== 'saveAsTemplate') {
            navigateFromFooterBuilder(savedata, {
                savedFooterId: emailfooterId || 0,
            });
        }
    };

    // NEW: Function to handle opening a template in edit mode
    const openTemplateInEditMode = async (templateId) => {
        const payload = {
            clientId,
            departmentId,
            emailfooterId: templateId,
            userId,
        };
        // debugger
        let { status, data, message } = await dispatch(getEmailFooterById(payload));

        if (status && data) {
            // Load historyList to savedVersions if available
            if (data?.historyList?.length > 0) {
                const historyList = [];
                data.historyList.forEach((item) => {
                    historyList.push({
                        ...item,
                        htmlContent: item.emailFooterHTML,
                        jsonContent: item.emailFooterJSON,
                        CreatedDate: item.createdDate,
                        // Remove the old keys to avoid duplication
                        // HTML: undefined,
                        // createdDate: undefined,
                    });
                });
                                dispatch(setSavedVersions(historyList));
            }

            const state = {
                data: data?.emailFooterJSON,
                templateId: data?.emailfooterId,
                mode: 'edit',
                templateName: data?.footerName || 'Ai_Template',
            };

            setpconfig((prev) => ({
                ...prev,
                templateDetails: state,
                editTemplateData: { data: data.jsonContent, templateId: data.templateId },
                emailFooter: true,
            }));

            // console.log(state, 'state');
            const encryptState = encodeUrl(state);
            navigate(`/preferences/communication-settings/footer-builder?q=${encryptState}`, {
                state,
            });
        }
    };

    const checkTemplateNameExists = async (footerName) => {
        const payload = {
            channelId: 1,
            clientId,
            departmentId,
            footerName,
            userId,
        };

        let { status, data, message } = await dispatch(aiemailFooter_nameExisit({ payload }));
        
        setTemplateValid(status);
        setpconfig((prev) => ({
            ...prev,
            templateValid: status,
        }));

        return { status, data, message };
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

    const linkVerification = async (linksdata) => {
        
        let { status, data, message } = await dispatch(linkVerification_AIBuilder(linksdata));
        if (status) {
            setLinkData(data);
        } else {
            setLinkData([]);
        }
            };
    const sendToMe = async (savedata) => {
                const payload = {
            departmentId,
            clientId,
            userId,
            toEmail: 'd.vishva@resulticksmail.com',
            TestCampaignEmailAddress: 'd.vishva@resulticksmail.com',
            // toEmail: validUserEmailId,
            // TestCampaignEmailAddress: validUserEmailId,
            Subject: 'Smart Template',
            IsFooterEnabled: false,
            FromEmailAddress: '',
            EmailfooterContent: '',
            CampaignId: '0',
            ContentSourceType: 'T',
            FormTemplateId: '0',
            FromName: '',
            Content: savedata.html,
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

    const [pconfig, setpconfig] = useState({
        personlisationData: personalization,
        offerData: {
            offerSaveData: '',
            offerTypeData: getOfferTypeData,
            offerListData: getOfferNameListData,
            offerListCountData: getOfferNameListCountData,
        },
        imageListData: [],
        templateDetails: {},
        contentTargetAttributeData: '',
        templateCategory: tempCategories,
        linkVerificationData: [],
        saveAsTemplate: '',
        deleteTemplate,
        templateValid,
        SendToMeData: null,
        snippetData: {
            listData: [],
            selectedData: {},
            snippetNameValidation: false,

            checkSnippetNameExist: async () => ({ status: false }),
            saveSnippet: async () => ({ status: false }),
            getSnippetList: async () => [],
            getSnippetDataById: async () => ({}),
            deleteSnippet: async () => ({ status: false }),
        },
        // snippetData: {
        //     listData: [],
        //     selectedData: {},
        //     snippetNameValidation: false,

        //     checkSnippetNameExist: async (name) => {
        //         const payload = {
        //             clientId,
        //             departmentId,
        //             userId,
        //             snippetName: name,
        //         };
        //         console.log('snippet request data: checkSnippetNameExist', payload);
        //         const result = await dispatch(get_snippentNameExist_AIBuilder(payload));
        //         console.log('snippet response data: checkSnippetNameExist', result);
        //         return result;
        //     },
        //     saveSnippet: async (data) => {
        //         const payload = {
        //             clientId,
        //             departmentId,
        //             userId,
        //             snippetId: data?.snippetId || '',
        //             snippetName: data?.snippetName,
        //             templateCategoryId: data?.templateCategoryId || 1,
        //             jsonContent: data,
        //         };
        //         console.log('snippet request data: saveSnippet', payload);
        //         const result = await dispatch(save_snippet_AIBuilder(payload));
        //         console.log('snippet response data: saveSnippet', result);
        //         return result;
        //     },
        //     getSnippetList: async () => {
        //         const payload = {
        //             clientId,
        //             departmentId,
        //             userId,
        //         };
        //         const params = {
        //             channelId: 1,
        //             templatecategory: 'All template',
        //             pagination: {
        //                 pageNo: 1,
        //                 recordLimit: 1000000,
        //             },
        //             isFilter: false,
        //             filteration: {
        //                 snippetName: '',
        //                 startDate: '2025-01-28',
        //                 endDate: '2025-02-26',
        //             },
        //         };

        //         console.log('snippet request data: getSnippetList', { ...payload, ...params });
        //         const result = await dispatch(get_snippentLists_AIBuilder({ ...payload, ...params }));
        //         console.log('snippet response data: getSnippetList', result);
        //         return result;
        //     },
        //     getSnippetDataById: async (id) => {
        //         const payload = {
        //             clientId,
        //             departmentId,
        //             userId,
        //             snippetId: id,
        //         };
        //         console.log('snippet request data: getSnippetDataById', payload);
        //         const result = await dispatch(fetch_snippet_byID_AIBuilder(payload));
        //         console.log('snippet response data: getSnippetDataById', result);
        //         return result;
        //     },
        //     deleteSnippet: async (id) => {
        //         const payload = {
        //             clientId,
        //             departmentId,
        //             userId,
        //             snippetId: id,
        //         };
        //         console.log('snippet request data: deleteSnippet', payload);
        //         const result = await dispatch(delete_snippetById_AIBuilder(payload));
        //         console.log('snippet response data: deleteSnippet', result);
        //         if (result.status) {
        //             // fetchImageData();
        //         }

        //         return result;
        //     },
        // },
        formAttributeData: '',
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
        saveVersionCallback: (data) => {
                        saveVersionData(data);
        },
        templateNameExistsCallback: async (name) => {
                        return await checkTemplateNameExists(name);
        },
        sendToMeCallback: (data) => {
                        sendToMe(data);
        },
        spamScoreCallback: (data) => {
                        spamScoreres(data);
        },
        getLinkVerificationCallback: (data) => {
                        linkVerification(data);
        },
        editTemplateData: {},
        emailFooter: true,
        offerBuilderEnabled: false,
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
        setpconfig((prev) => ({
            ...prev,
            editTemplateData: { data: state?.data, templateId: state?.templateId },
        }));

        // if (savedVersions.length > 0) {
        //     debugger
        //     const lastSavedVersion = savedVersions[savedVersions.length - 1];
        //     const lastVersionJsonData = lastSavedVersion?.jsonContent;
        //     setpconfig((prev) => ({
        //         ...prev,
        //         editTemplateData: { data: lastVersionJsonData, templateId: state?.templateId },
        //     }));
        // } else {
        //     setpconfig((prev) => ({
        //         ...prev,
        //         editTemplateData: { data: state?.data, templateId: state?.templateId },
        //     }));
        // }
        return () => {
            dispatch(resetEmailBuilderReducer());
        };
        // }
    }, [state]);

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
                editTemplateData: { data: templateData?.data?.emailFooterJSON, templateId: state?.templateId },
            }));
        };
        if (state?.templateId) {
            callImediate();
        }
    }, [state]);

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

    // Update ref and pconfig whenever savedVersions changes
    useEffect(() => {
        latestSavedVersions.current = savedVersions;
        
        if (savedVersions.length > 0) {
            // Create a copy of the array before reversing to avoid mutating the original
            let savedVersionsList = [...savedVersions];
            savedVersionsList.reverse();
            setpconfig((prev) => ({
                ...prev,
                versionsList: savedVersionsList,
            }));
        }
    }, [savedVersions]);

    return (
        <Suspense fallback={<RSLoader fallback />}>
            <RSPEmailBuilderLazy
                pconfig={{
                    ...pconfig,
                    saveCallback: (data) => saveTemplate(data),
                    cancelCallback: (cancelData) =>
                        navigateFromFooterBuilder(cancelData, { savedFooterId: 0 }),
                }}
                data={state}
                templateName={state?.templateName || ''}
                emailFooter={true}
            />
        </Suspense>
    );
};

export default FooterBuilder;
