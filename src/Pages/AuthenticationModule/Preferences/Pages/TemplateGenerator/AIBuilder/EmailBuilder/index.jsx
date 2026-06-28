import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import RSLoader from 'Components/Loader';
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
    get_snippentNameExist_AIBuilder,
    delete_snippetById_AIBuilder,
    fetch_snippet_byID_AIBuilder,
    save_snippet_AIBuilder,
    get_snippentLists_AIBuilder,
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

import { whenHostStylesheetsApplied } from 'Utils/modules/cssDom';
import { URL_PREFIX_LINK } from 'Constants/EndPoints';

const RSPEmailBuilderLazy = lazy(() =>
    import('resul-template-builder').then((module) => ({ default: module.RSPEmailBuilder })),
);

const PORTAL_GUARD_STYLE_ID = 'rsp-builder-portal-guard';

const ensurePortalGuardStyle = () => {
    if (document.getElementById(PORTAL_GUARD_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = PORTAL_GUARD_STYLE_ID;
    style.textContent =
        'html.rsp-email-builder-theme:not(.rsp-builder-ui-ready) body > .rsp-canvas-hover-prop{display:none!important;visibility:hidden!important;pointer-events:none!important;}';
    document.head.appendChild(style);
};

const waitForBuilderCss = (timeoutMs = 5000) =>
    new Promise((resolve) => {
        const finish = () => whenHostStylesheetsApplied(resolve, timeoutMs);

        const link = document.getElementById('dynamic-css');
        if (link?.sheet) {
            finish();
            return;
        }
        if (link) {
            link.addEventListener('load', finish, { once: true });
            link.addEventListener('error', finish, { once: true });
            return;
        }

        const observer = new MutationObserver(() => {
            const dynamicLink = document.getElementById('dynamic-css');
            if (!dynamicLink) return;
            observer.disconnect();
            if (dynamicLink.sheet) {
                finish();
                return;
            }
            dynamicLink.addEventListener('load', finish, { once: true });
            dynamicLink.addEventListener('error', finish, { once: true });
        });
        observer.observe(document.head, { childList: true });
        setTimeout(() => {
            observer.disconnect();
            finish();
        }, timeoutMs);
    });

const parseJsonData = (data, key = 'data') => {
    try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        return key ? parsed?.[key] ?? null : parsed;
    } catch {
        return null;
    }
};

const getCommunicationReturnPath = (fromEnvi, templateId, templateDetails = {}) => {
    if (!fromEnvi?.includes?.('q=')) {
        return fromEnvi || '';
    }

    let returnState = {};
    let encryptedQ = fromEnvi.split('q=')[1];
    if (encryptedQ) {
        encryptedQ = encryptedQ.split('&')[0];
        returnState = decodeLargeState(encryptedQ) || {};
    }

    if (templateId) {
        returnState.templateId = templateId;
    }
    if (!returnState.channelId) {
        returnState.channelId = templateDetails?.channelId ?? 1;
    }

    if (templateDetails?.edmChannelId != null && !returnState.edmChannelId) {
        returnState.edmChannelId = templateDetails.edmChannelId;
    }

    return `?q=${encodeUrl(returnState)}`;
};

const getDefaultColors = () => [
    { hex: '#F15C6C', name: 'Primary Coral' },
    { hex: '#003C71', name: 'Primary Blue' },
    { hex: '#F8B4BC', name: 'Secondary Coral' },
    { hex: '#2CCCD3', name: 'Secondary Blue' },
    { hex: '#001231', name: 'Dark Blue' },
];

const AIEmailBuilderWrapper = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const state = useQueryParams('/communication');

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { validUserEmailId } = useSelector(({ globalstate }) => globalstate);
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedVersions } = useSelector(({ emailBuilderReducer }) => emailBuilderReducer);
    const {
        getOfferTypeData,
        getOfferNameListData = [],
        getOfferNameListCountData,
    } = useSelector((state) => state.offerMangementReducer);

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
    const [offerCode, setOfferCode] = useState('common');
    const [cssReady, setCssReady] = useState(false);
    const [builderReady, setBuilderReady] = useState(false);

    const latestTemplateId = useRef(0);
    const latestSavedVersions = useRef([]);

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
            checkSnippetNameExist: async () => { },
            saveSnippet: async () => { },
            getSnippetList: async () => { },
            getSnippetDataById: async () => { },
            deleteSnippet: async () => { },
        },
        offersnippetData: {
            listData: [],
            selectedData: {},
            snippetNameValidation: false,
            checkSnippetNameExist: async () => { },
            saveSnippet: async () => { },
            getSnippetList: async () => { },
            getSnippetDataById: async () => { },
            deleteSnippet: async () => { },
        },
        formAttributeData: '',
        offerCallback: async () => { },
        offerListCallback: async () => { },
        imageCallback: async () => { },
        contentTargetCallback: async () => { },
        offerTypeDataCallback: async () => { },
        templateCategoryCallback: async () => { },
        personalizationDataCallback: async () => { },
        getColorListCallback: async () => { },
        saveCallback: async () => { },
        saveVersionCallback: () => { },
        getVersionCallback: () => { },
        getLinkVerificationCallback: () => { },
        sendToMeCallback: () => { },
        spamScoreCallback: () => { },
        emailAttachCallback: () => { },
        cancelCallback: () => { },
        templateNameExistsCallback: async () => { },
        deleteTemplateCallback: async () => { },
        editTemplateData: {},
        emailFooter: false,
        offerBuilderEnabled: false,
    });

    const fetchListDetails = useCallback(
        async (params) => {
            const payload = {
                departmentId,
                clientId,
                userId,
                campaignId: 0,
                offerTypeId: params?.offerTypeId || 1,
                offerCodeType: localStorage.getItem('offerCodeType') === 'common' ? 0 : 1,
                offerId: params?.offerId || 0,
            };
            const listTypeRes = await dispatch(getOfferNameList(payload));
            if (listTypeRes?.status) {
                setUpdatedOfferList(listTypeRes?.data);
            } else {
                setUpdatedOfferList([]);
            }
        },
        [departmentId, clientId, userId, dispatch],
    );

    const fetchTemplateCategories = useCallback(async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        const { status, data } = await dispatch(templateCategoryListApi_AI(payload));
        if (status) {
            setTempCategories(data);
        } else {
            setTempCategories([]);
        }
    }, [departmentId, clientId, userId, dispatch]);

    const fetchImageData = useCallback(async () => {
        const { status, data, message } = await dispatch(
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
        if (status) {
            setImageData(data || []);
            return {
                status: true,
                data: data || [],
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
    }, [departmentId, clientId, userId, dispatch]);

    const offerCallbackFunc = useCallback(
        async (type, params, offerTempCode) => {
            const commonParams = {
                departmentId,
                clientId,
                userId,
                campaignId: params?.campaignId || 0,
            };

            switch (type) {
                case 1:
                    setOfferCode(params);
                    localStorage.setItem('offerCodeType', params);
                    setisUpdateOfferConfig(true);
                    break;

                case 2:
                    const offerCodeType2 = params?.codeType
                        ? params.codeType === 'common'
                            ? 0
                            : 1
                        : offerCode === 'common'
                            ? 0
                            : 1;

                    const payload2 = {
                        ...commonParams,
                        offerTypeId: params?.offerTypeId || 1,
                        offerCodeType: offerCodeType2,
                    };
                    const { status: status2, data: data2 } = await dispatch(getOfferNameList(payload2));
                    if (status2 === true) {
                        setUpdatedOfferList(data2);
                    } else if (status2 === false) {
                        setUpdatedOfferList([]);
                    }
                    dispatch(getOfferManagement({ field: 'getOfferNameListData', data: status2 ? data2 : [] }));
                    return { status: status2, data: data2 };

                case 3:
                    const offerCodeType3 = params?.codeType
                        ? params.codeType === 'common'
                            ? 0
                            : 1
                        : offerCode === 'common'
                            ? 0
                            : 1;

                    const payload3 = {
                        ...commonParams,
                        offerTypeId: params?.offerTypeId || 1,
                        offerCodeType: offerCodeType3,
                        offerId: params?.offerId || 0,
                    };
                    const { status: status3, data: data3 } = await dispatch(offerCodeCountApi(payload3));
                    dispatch(getOfferManagement({ field: 'getOfferNameListCountData', data: status3 ? data3 : 0 }));
                    return { status: status3, data: data3 };

                case 4:
                    const campaignIdForSave = pconfig?.templateDetails?.campaignId || 0;
                    const payload4 = {
                        ...commonParams,
                        campaignId: campaignIdForSave,
                        offerId: params?.selectedOffer.offerId || 0,
                        selectedoffers: [
                            {
                                offerCodeType: params?.codeType === 'common' ? 0 : 1,
                                offerTypeId: params?.selectedOfferType?.offerTypeId || 1,
                                offerName: params?.selectedOffer?.offerName || '',
                                SplitType: '',
                                channelId: 1,
                            },
                        ],
                    };
                    const saveDataStatus = await dispatch(saveBestOffer(payload4));
                    if (saveDataStatus?.status) {
                        setpconfig((prev) => ({
                            ...prev,
                            offerData: {
                                ...prev.offerData,
                                offerSaveData:
                                    'OFFERCODE_' +
                                    params?.selectedOffer.offerId +
                                    '_' +
                                    params?.selectedOffer?.offerName,
                            },
                        }));
                    }
                    return saveDataStatus;

                default:
                    break;
            }
        },
        [departmentId, clientId, userId, offerCode, dispatch],
    );

    const fetchContentTargetData = useCallback(async () => {
        const payload = {
            classificationId: 4,
            departmentId,
            clientId,
            userId,
        };
        const response = await dispatch(getProfileDataClassficationAttributeById(payload, true));
        if (response?.status) {
            const getJsonParseData = parseJsonData(response?.data);
            // const data = getJsonParseData?.data ?? [];
            const data = getJsonParseData ?? [];
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
    }, [departmentId, clientId, userId, dispatch]);

    const fetchAttributeJsonData = useCallback(async () => {
        const payload = {
            classificationId: 4,
            departmentId,
            clientId,
            userId,
        };
        const response = await dispatch(getAttributeJson(payload, true));
        if (response?.status) {
            const getJsonParseData = parseJsonData(response?.data, 'AttributeUniqueValuewithCountproperty');
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
    }, [departmentId, clientId, userId, dispatch]);

    const saveTemplate = useCallback(
        async (savedata) => {
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
                historyList: [
                    {
                        CreatedDate: '',
                        HTML: '',
                        createdDate: '',
                        htmlContent: '',
                        jsonContent: '',
                        templateAutoSaveId: '',
                    },
                ],
                activeSplit: savedata?.templateDetails?.activeSplitName ?? 'A',
            };

            if (savedata.saveType == 'saveAsTemplate') {
                payload.templateId = 0;
                payload.loading = false;
            }

            const { status, data, message, templateId } = await dispatch(saveTemplate_AIEmail(payload));
            if (status && templateId) {
                latestTemplateId.current = templateId;
                setSaveAsTemplate(templateId);

                if (savedata.saveType == 'saveAsTemplate' && templateId) {
                    const updatedTemplateDetails = {
                        ...savedata.templateDetails,
                        templateId: templateId,
                        templateName: savedata.templateDetails.templateName,
                        templateCategoryType: savedata?.templateDetails?.templateCategoryType || 1,
                    };

                    setpconfig((prev) => ({
                        ...prev,
                        templateDetails: updatedTemplateDetails,
                    }));

                    setTimeout(() => {
                        openTemplateInEditMode(templateId, savedata?.templateDetails?.templateCategoryType);
                    }, 100);
                }
            }

            if (status && savedata.saveType !== 'saveAsTemplate') {
                const resolvedTemplateId = templateId || latestTemplateId.current || 0;
                const returnPath = getCommunicationReturnPath(
                    savedata?.templateDetails?.fromEnvi,
                    resolvedTemplateId,
                    savedata?.templateDetails,
                );
                if (savedata?.templateDetails?.campaignType === 'M') {
                    dispatch(updateMDCEditMode('edit'));
                    navigate(`/communication/create-mdc-communication` + returnPath);
                } else if (savedata?.templateDetails?.from === 'Communication') {
                    navigate(`/communication/create-communication` + returnPath);
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

            return { status, templateId, message };
        },
        [departmentId, clientId, userId, dispatch, navigate],
    );

    const openTemplateInEditMode = useCallback(
        async (templateId, categoryDetails = {}, savedata = {}) => {
            const payload = {
                departmentId,
                clientId,
                userId,
                templateId: templateId,
                templateCategoryId: categoryDetails?.templateCategoryId || 1,
                channelId: 1,
                isAutoSave: false,
                loading: false,
            };

            const { status, data, message } = await dispatch(getTemplate_AIEmail_byId(payload));

            if (status && data) {
                const state = {
                    ...savedata?.templateDetails,
                    data: data?.JsonContent,
                    templateId: data?.TemplateID,
                    mode: 'edit',
                    templateName: data?.TemplateName || 'Ai_Template',
                    templateDate: data?.CreatedDate,
                    templateType: '',
                    templateCategoryType: categoryDetails || 1,
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
        },
        [departmentId, clientId, userId, dispatch, navigate],
    );

    const saveVersionData = useCallback(
        (savedata) => {
            const versionData = {
                CreatedDate: new Date().toISOString(),
                htmlContent: savedata.html,
                jsonContent: JSON.stringify(savedata.data),
                templateAutoSaveId: 0,
            };
            dispatch(addSavedVersion(versionData));
        },
        [dispatch],
    );
    /*
    COMMENTED OUT SINCE IT'S NOT USED.
    
    const saveVersion = useCallback(
        async (savedata) => {
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

            const { status, templateId } = await dispatch(saveTemplate_AIEmail(payload));

            if (status && templateId) {
                latestTemplateId.current = templateId;
                setEmailTemplateId(templateId);

                if (payload.templateId == 0) {
                    openTemplateInEditMode(templateId, savedata?.templateDetails?.templateCategoryType, savedata);
                }
            }
        },
        [departmentId, clientId, userId, dispatch, openTemplateInEditMode],
    );
    */

    const linkVerification = useCallback(
        async (linksdata) => {
            const { status, data } = await dispatch(linkVerification_AIBuilder(linksdata));
            if (status) {
                setLinkData(data);
            } else {
                setLinkData([]);
            }
        },
        [dispatch],
    );

    const emailAttachment = useCallback(
        async (formdata) => {
            try {
                const filedata = formdata.get('file');
                const newFormData = new FormData();
                newFormData.append('file', filedata, filedata.name);

                const { status, data } = await dispatch(emailAttach_AIBuilder(newFormData));

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
        },
        [dispatch],
    );

    const sendToMe = useCallback(
        async (savedata) => {
            const payload = {
                departmentId,
                clientId,
                userId,
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

            const { success, message } = await dispatch(sendToMe_AIBuilder(payload));

            if (success) {
                setSendToMeData({ success: true, message: message });
            } else {
                setSendToMeData({ success: false, message: message });
            }
        },
        [departmentId, clientId, userId, validUserEmailId, dispatch],
    );

    const spamScoreres = useCallback(
        async (spamData) => {
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
            const { status, data, message } = await dispatch(spamScore_AIBuilder(payload));
            if (status) {
                setSpamScore({ status, ...data });
                return { success: true, status: true, ...data };
            } else {
                setSpamScore([]);
                return { success: false, status: false, message };
            }
        },
        [departmentId, clientId, userId, dispatch],
    );

    const checkTemplateNameExists = useCallback(
        async (templateName) => {
            const payload = {
                channelId: 1,
                clientId,
                departmentId,
                templateName,
                userId,
            };

            const { status, data, message } = await dispatch(aiemailBuilder_nameExisit({ payload }));

            setTemplateValid(status);
            setpconfig((prev) => ({
                ...prev,
                templateValid: status,
            }));

            return { status, data, message };
        },
        [clientId, departmentId, userId, dispatch],
    );

    const deleteTemplateById = useCallback(
        async (templateId) => {
            const payload = {
                departmentId,
                clientId,
                userId,
                templateId: latestTemplateId.current || templateId,
            };
            const { status, data, message } = await dispatch(delete_Template_AIEmail_byId(payload));

            if (status) {
                setDeleteTemplate(true);
            }

            return { status, data, message };
        },
        [departmentId, clientId, userId, dispatch],
    );

    const getVersions = useCallback(
        async (savedata) => {
            const payload = {
                departmentId,
                clientId,
                userId,
                templateId: savedata?.templateDetails?.templateId || latestTemplateId.current,
                templateCategoryId: savedata?.templateDetails?.templateCategoryType?.templateCategoryId,
                channelId: 1,
                isAutoSave: true,
            };
            const { status, data } = await dispatch(getTemplate_AIEmail_byId(payload));
            if (status) {
                setVersionsList(data);
            } else {
                setVersionsList([]);
            }
        },
        [departmentId, clientId, userId, dispatch],
    );

    const imageCallbackFunc = useCallback(
        async (type, params) => {
            const payload = {
                ...params,
                departmentId,
                clientId,
                userId,
                builderName: 'ebuilder',
            };
            if (type === 2) {
                const { status, data, message } = await dispatch(uploadImages_AIBuilder(payload));
                if (status) {
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
                const { status, data, message } = await dispatch(deleteImages_AIBuilder(payload));
                if (status) {
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
        },
        [departmentId, clientId, userId, dispatch, fetchImageData],
    );

    const getColorList = useCallback(async () => {
        const defaultColors = getDefaultColors();
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        if (clientId === 2723 || clientId === '2723') {
            return { status: true, data: defaultColors, message: 'Using default colors' };
        }
    }, [departmentId, clientId, userId]);

    const contentTargetCallback = useCallback(async () => {
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
    }, [fetchContentTargetData, fetchAttributeJsonData]);

    useEffect(() => {
        setpconfig((prev) => ({
            ...prev,
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
                    return await dispatch(get_snippentNameExist_AIBuilder(payload));
                },
                saveSnippet: async (data) => {
                    const payload = {
                        clientId,
                        departmentId,
                        userId,
                        snippetId: data?.snippetId || '',
                        snippetName: data?.snippetName,
                        templateCategoryId: data?.templateCategoryId || 1,
                        jsonContent: data,
                    };

                    if (data.offerBuilderEnabled) {
                        const result = await dispatch(save_offer_snippet(payload));
                        if (result.status) {
                            navigate('/preferences/offer-management');
                        }
                        return result;
                    }

                    return await dispatch(save_snippet_AIBuilder(payload));
                },
                getSnippetList: async () => {
                    const payload = {
                        clientId,
                        departmentId,
                        userId: 0,
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

                    return await dispatch(get_snippentLists_AIBuilder({ ...payload, ...params }));
                },
                getSnippetDataById: async (id) => {
                    const payload = {
                        clientId,
                        departmentId,
                        userId,
                        snippetId: id,
                    };
                    return await dispatch(fetch_snippet_byID_AIBuilder(payload));
                },
                deleteSnippet: async (id) => {
                    const payload = {
                        clientId,
                        departmentId,
                        userId,
                        snippetId: id,
                    };
                    return await dispatch(delete_snippetById_AIBuilder(payload));
                },
            },
            offersnippetData: {
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
                    return await dispatch(get_offersnippentNameExist(payload));
                },
                saveSnippet: async (data) => {
                    const payload = {
                        clientId,
                        departmentId,
                        userId,
                        snippetId: data?.snippetId || '',
                        snippetName: data?.snippetName,
                        templateCategoryId: data?.templateCategoryId || 1,
                        jsonContent: data,
                    };

                    if (data.offerBuilderEnabled) {
                        const result = await dispatch(save_offer_snippet(payload));
                        if (result.status) {
                            navigate('/preferences/offer-management');
                        }
                        return result;
                    }

                    return await dispatch(save_snippet_AIBuilder(payload));
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

                    return await dispatch(get_offersnippentLists({ ...payload, ...params }));
                },
                getSnippetDataById: async (id) => {
                    const payload = {
                        clientId,
                        departmentId,
                        userId,
                        snippetId: id,
                    };
                    return await dispatch(fetch_offersnippetById(payload));
                },
                deleteSnippet: async (id) => {
                    const payload = {
                        clientId,
                        departmentId,
                        userId,
                        snippetId: id,
                    };
                    return await dispatch(delete_offersnippetById(payload));
                },
            },
            offerCallback: async (type, params) => {
                if (type === 1) {
                    localStorage.setItem('offerCodeType', params);
                    setOfferCode(params);
                }
                return await offerCallbackFunc(type, params, offerCode);
            },
            offerListCallback: async (params) => {
                return await fetchListDetails(params);
            },
            imageCallback: async (type, params) => {
                return await imageCallbackFunc(type, params);
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
                const offerTypeRes = await dispatch(getOfferType(payload, true));
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
                const { status, data, message } = await dispatch(templateCategoryListApi_AI(payload));
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
            personalizationDataCallback: async () => {
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                };
                const response = await dispatch(getPersonalizationFields({ payload }));

                let personalizationData = [];
                if (response?.status) {
                    if (Array.isArray(response?.data)) {
                        personalizationData = response?.data;
                    } else if (response?.data?.items && Array.isArray(response?.data?.items)) {
                        personalizationData = response?.data?.items;
                    } else if (response?.data && typeof response?.data === 'object') {
                        personalizationData = [response?.data];
                    }
                    return {
                        status: true,
                        data: personalizationData,
                        message: response?.message || 'Success',
                    };
                } else {
                    return {
                        status: false,
                        data: [],
                        message: response?.message || 'Failed to load personalization fields',
                    };
                }
            },
            getColorListCallback: async () => {
                return await getColorList();
            },
            saveCallback: async (data) => {
                if (data?.templateDetails?.from === 'Offer') {
                    const snippetPayload = {
                        clientId,
                        departmentId,
                        userId,
                        snippetId: data?.templateDetails?.templateId || '',
                        snippetName: data?.templateDetails?.templateName,
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
                    const updatedData = {
                        ...data,
                        isRename: true,
                        templateId: 0,
                    };
                    return await saveTemplate(updatedData);
                } else {
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
                const returnPath = getCommunicationReturnPath(
                    data?.templateDetails?.fromEnvi,
                    data?.templateDetails?.templateId || latestTemplateId.current,
                    data?.templateDetails,
                );
                if (data?.templateDetails?.campaignType === 'M') {
                    dispatch(updateMDCEditMode('edit'));
                    navigate(`/communication/create-mdc-communication` + returnPath);
                } else if (data?.templateDetails?.from === 'Communication') {
                    navigate(`/communication/create-communication` + returnPath);
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
            },
            templateNameExistsCallback: async (name) => {
                return await checkTemplateNameExists(name);
            },
            deleteTemplateCallback: async (id) => {
                return await deleteTemplateById(id);
            },
        }));
    }, [
        clientId,
        departmentId,
        userId,
        dispatch,
        navigate,
        offerCallbackFunc,
        offerCode,
        fetchListDetails,
        imageCallbackFunc,
        contentTargetCallback,
        getColorList,
        saveTemplate,
        saveVersionData,
        getVersions,
        linkVerification,
        sendToMe,
        spamScoreres,
        emailAttachment,
        checkTemplateNameExists,
        deleteTemplateById,
    ]);

    useEffect(() => {
        let cancelled = false;
        let unsubscribe = () => {};

        ensurePortalGuardStyle();
        setCssReady(false);
        setBuilderReady(false);
        document.documentElement.classList.remove('rsp-builder-ui-ready');

        const markUiReady = () => {
            if (cancelled) return;
            document.documentElement.classList.add('rsp-builder-ui-ready');
            setBuilderReady(true);
        };

        waitForBuilderCss().then(async () => {
            if (cancelled) return;

            const { useStore } = await import('resul-template-builder');
            useStore.getState().setBuilderReady(false);

            unsubscribe = useStore.subscribe((state, prevState) => {
                if (state.isBuilderReady && !prevState.isBuilderReady) {
                    markUiReady();
                }
            });

            if (useStore.getState().isBuilderReady) {
                markUiReady();
            }

            setCssReady(true);
        });

        return () => {
            cancelled = true;
            unsubscribe();
            document.documentElement.classList.remove('rsp-builder-ui-ready');
        };
    }, []);

    useEffect(() => {
        latestTemplateId.current = emailTemplateId;
    }, [emailTemplateId]);

    useEffect(() => {
        latestSavedVersions.current = savedVersions;
    }, [savedVersions]);

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
    }, [isUpdateOfferConfig, getOfferTypeData]);

    useEffect(() => {
        if (state !== null) {
            setpconfig((prev) => ({
                ...prev,
                templateDetails: state,
            }));
        }
    }, [state]);

    useEffect(() => {
        if (!state?.templateId) return;

        const setEditTemplateData = async () => {
            if (state?.data) {
                setpconfig((prev) => ({
                    ...prev,
                    editTemplateData: { data: state.data, templateId: state.templateId },
                }));
                return;
            }

            const payload = {
                templateId: state.templateId,
                channelId: 1,
                departmentId,
                clientId,
                userId,
            };
            const templateData = await dispatch(getTemplate_AIEmail_byId(payload));
            setpconfig((prev) => ({
                ...prev,
                editTemplateData: {
                    data: templateData?.data?.JsonEDMContent || templateData?.data?.JsonContent,
                    templateId: state.templateId,
                },
            }));
        };

        setEditTemplateData();
    }, [state, departmentId, clientId, userId, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(resetEmailBuilderReducer());
        };
    }, []);

    useEffect(() => {
        if (savedVersions.length > 0) {
            latestSavedVersions.current = savedVersions;
            const savedVersionsList = [...savedVersions].reverse();
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
            }));
        }
    }, [getOfferNameListData, getOfferTypeData]);

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
    }, [getOfferNameListCountData, getOfferTypeData, getOfferNameListData]);

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
    }, [saveAsTemplate]);

    useEffect(() => {
        if (SendToMeData) {
            setpconfig((prev) => ({
                ...prev,
                SendToMeData: SendToMeData,
            }));

            const timer = setTimeout(() => {
                setpconfig((prev) => ({
                    ...prev,
                    SendToMeData: null,
                }));
                setSendToMeData(null);
            }, 5000);

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
        <Suspense fallback={<RSLoader fallback />}>
            {!builderReady && <RSLoader fallback />}
            {cssReady && (
                <div style={{ display: builderReady ? 'block' : 'none' }}>
                    <RSPEmailBuilderLazy
                        pconfig={pconfig}
                        templateName={state?.templateName || ''}
                        templateCategory={getCategoryName()}
                        data={state}
                        date={
                            state?.from === 'Communication'
                                ? (() => {
                                    if (state?.CampaignDate) {
                                        const [startDate, endDate] = state.CampaignDate.split(' - ');
                                        const formattedStartDate =
                                            getUserCurrentFormat(startDate)?.dateFormat || startDate;
                                        const formattedEndDate = getUserCurrentFormat(endDate)?.dateFormat || endDate;
                                        return `${formattedStartDate} - ${formattedEndDate}`;
                                    }
                                    return 'NA';
                                })()
                                : getUserCurrentFormat(state?.templateDate)?.dateFormat || 'NA'
                        }
                    />
                </div>
            )}
        </Suspense>
    );
};

export default AIEmailBuilderWrapper;
