import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { getmasterData } from 'Utils/modules/masterData';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PushBuilder } from 'resul-push-builder';
import _find from 'lodash/find';

import { formListApi, publishFormbyID } from 'Reducers/preferences/FormGenerator/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { handleFormType } from '../../../FormGenerator/constant';

import { saveTemplate_AIEmail, getTemplate_AIEmail_byId } from 'Reducers/preferences/EmailBuilder/request';
import { ResulticksLogoBlue } from 'Assets/Images';
import useQueryParams from 'Hooks/useQueryParams';
import { uploadMobilePush, uploadWebPush } from 'Reducers/communication/createCommunication/Create/request';


import { updateMDCEditMode } from 'Reducers/communication/createCommunication/Create/reducer';
import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';

const PBwebConfig = {
    layout: 'web',
    backgroundColor: '#ffffff',
    showGrid: true,
    gridSize: 15,
    snapToGrid: false,
    enableGuides: true,
    width: 1280,
    height: 720,
    channelId: 8,
    isWeb: true,
};

const PBmobileConfig = {
    layout: 'mobile',
    backgroundColor: '#ffffff',
    showGrid: true,
    gridSize: 15,
    snapToGrid: false,
    enableGuides: true,
    width: 414,
    height: 896,
    channelId: 9,
    isWeb: false,
};

// Helper function to ensure all required callbacks are present
const ensureCallbacks = (config, fallbackCallbacks) => {
    const requiredCallbacks = [
        'getFormListCallback',
        'getSelectedFormCallback',
        'saveTemplateCallback',
        'publishTemplateCallback',
        'updateTemplateCallback',
        'onTemplateChange',
        'onSave',
        'onPublish',
        'onUpdate',
        'saveButtonClick',
        'imageUpload',
        'formNavigation',
    ];

    const ensuredConfig = { ...config };

    requiredCallbacks.forEach((callbackName) => {
        if (typeof ensuredConfig[callbackName] !== 'function') {
            if (fallbackCallbacks[callbackName] && typeof fallbackCallbacks[callbackName] === 'function') {
                ensuredConfig[callbackName] = fallbackCallbacks[callbackName];
            } else {
                // Provide a default no-op function with warning
                ensuredConfig[callbackName] = (...args) => {
                };
            }
        }
    });

    return ensuredConfig;
};

const PushAIBuilder = () => {
    const sdxChannel = new BroadcastChannel('sdx-channel');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const parsed = useQueryParams('');
    const { campaignDetails } = useSelector((state) => emailList(state));
    // State declarations with optimized initial values
    const [templateData, setTemplateData] = useState(null);
    const [config, setConfig] = useState(null);
    const [formList, setFormList] = useState([]);
        const [templateName, setTemplateName] = useState(parsed?.templateName || '');
    const [templateDescription, setTemplateDescription] = useState(parsed?.templateCategoryType?.categoryName || '');
    const [channelId, setChannelId] = useState(null);
    const [loadCss, setLoadCss] = useState(true);
    const latestTemplateId = useRef(0);
    const latestSavedVersions = useRef([]);
    const cssLoadedRef = useRef(false);

    // Selectors
    const { departmentId, clientId, userId, departmentName, isAgency } = useSelector(getSessionId);
    const templateCategories = useSelector((state) => state.emailBuilderReducer?.templateCategories || []);
    const { timeZoneId } = getUserDetails();
    const { timeZoneList } = getmasterData();

    // Memoized values
    const selectedTimeZoneList = useMemo(
        () => _find(timeZoneList, ['timeZoneID', timeZoneId || 1]),
        [timeZoneList, timeZoneId],
    );

    const transformedTimeZoneList = useMemo(
        () =>
            timeZoneList.map(({ timeZoneName, ...rest }) => ({
                ...rest,
                timezoneName: timeZoneName,
            })),
        [timeZoneList],
    );

    // Optimized callback functions
    const fetchList = useCallback(async () => {
        try {
            const payload = {
                clientId,
                departmentId,
                userId,
                isFilter: true,
                filteration: {
                    formName: '',
                    formType: handleFormType('all', userId),
                    startDate: '',
                    endDate: '',
                },
                pagination: { pageNo: 1, pageSize: 300 },
            };

            const { data, status } = await dispatch(formListApi({ ...payload, departmentId }));

            if (status) {
                const updatedFormList = Array.isArray(data)
                    ? data
                          .map((item) =>
                              item && 'recipientFormId' in item
                                  ? { ...item, recipientFormID: item.recipientFormId, recipientFormId: undefined }
                                  : item,
                          )
                          .map(({ recipientFormId, ...rest }) => rest)
                    : [];

                setFormList(
                    updatedFormList.length > 0
                        ? [
                              ...updatedFormList,
                              {
                                  createdDate: getYYMMDD(new Date()),
                                  formCampaignUsed: [],
                                  formName: 'Add New Form',
                                  formType: 'Add Form',
                                  recipientFormID: 0,
                              },
                          ]
                        : [],
                );
            } else {
                setFormList([]);
            }
        } catch (error) {
            setFormList([]);
        }
    }, [clientId, departmentId, userId, dispatch]);

    const getFormData = useCallback(
        async (recpId) => {
            try {
                const payload = { departmentId, clientId, userId, recipientFormId: recpId || 0 };
                const res = await dispatch(publishFormbyID(payload));

                if (res?.status) {
                    const result = {
                        formData: res?.data?.publishUrl || [],
                        formId: recpId,
                    };
                    sdxChannel.postMessage({ type: 'selectForm', result });

                    setConfig((prev) => ({
                        ...prev,
                        selectedForm: res?.data?.publishUrl,
                        currentComponentId: parsed?.currentComponentId,
                    }));

                    return result;
                }
                return {};
            } catch (error) {
                return {};
            }
        },
        [clientId, departmentId, userId, dispatch, parsed?.currentComponentId],
    );

    const saveBtnClick = useCallback(
        async (value) => {
            const params = new URLSearchParams(window.location.search);
            let tId = params.get('templateId');
            let cId = params.get('channelId');
            try {
                const channeldetails = parsed?.channelDetails ? JSON.parse(parsed?.channelDetails) : {};
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                    templateCategoryId: parsed?.templateCategoryType?.templateCategoryId || 1,
                    htmlContent: value?.data?.Body,
                    jsonContent: value?.data?.JsonContent || '',
                    templateName: parsed?.templateName || 'Ai builder',
                    thumbnailPath: value?.FilePath || '',
                    statusId: 1,
                    isPredefined: true,
                    createdBy: userId,
                    templateId: tId?.length > 0
                        ? parseInt(tId)
                        : (latestTemplateId.current || value?.templateDetails?.templateId || parsed?.templateId) ?? 0,
                    isRename: false,
                    isAutoSave: false,
                    loading: true,
                    FilePath: value?.FilePath || '',
                    historyList: latestSavedVersions.current,
                    channelId: cId?.length > 0 ? parseInt(cId) : channeldetails?.channelId,
                };
                const { status, templateId } = await dispatch(saveTemplate_AIEmail(payload));
                if (status && templateId) {
                    const params = new URLSearchParams(window.location.search);
                    if (params.has('path') && params.get('path').length > 0) {
                        const pathValue = params.get('path');
                        params.delete('path');
                        const remainingQuery = params.toString();
                        let newUrl = remainingQuery ? `/${pathValue}?${remainingQuery}` : `/${pathValue}`;
                        const sep = newUrl.includes('?') ? '&' : '?';
                        newUrl = `${newUrl}${sep}templateId=${templateId}`;
                        window.history.replaceState({}, '', newUrl);

                        // Navigate (React Router)
                        navigate(newUrl);
                        return;
                    }

                    if (parsed?.from === 'Communication' && parsed?.fromEnvi != undefined) {
                      let returnState = {};
                      if (parsed.fromEnvi) {
                          let encryptedQ = parsed.fromEnvi.split('q=')[1];
                          if (encryptedQ) returnState = decodeLargeState(encryptedQ) || {};
                      }
                      
                      if(!returnState?.startDate && campaignDetails?.startDate) {
                           returnState.startDate = campaignDetails.startDate;
                      }
                      if(!returnState?.endDate && campaignDetails?.endDate) {
                           returnState.endDate = campaignDetails.endDate;
                      }

                      const locationEnvi = `?q=${encodeUrl(returnState)}`;
                      navigate('/communication/create-communication' + locationEnvi);

                    } else if (parsed?.campaignType === 'M') {
                        dispatch(updateMDCEditMode('edit'));
                        navigate(`/communication/create-mdc-communication` + parsed?.fromEnvi);
                    } else {
                        latestTemplateId.current = templateId;
                        const navigatePath =
                            channeldetails?.channelId === 8
                                ? '/preferences/template-gallery/webpush-builder-gallery'
                                : channeldetails?.channelId === 14
                                ? '/preferences/template-gallery/mobile-builder-gallery'
                                : '/preferences/template-gallery';
                        navigate(navigatePath);
                    }
                }
            } catch (error) {
            }
        },
        [clientId, departmentId, userId, parsed, dispatch, navigate],
    );

    const addNewForm = useCallback(
        async (value, type) => {
            try {
                const updatedParsed = {
                    ...parsed,
                    data: value?.jsonData,
                    jsonData: value?.jsonData,
                    currentComponentId: value?.currentComponentId,
                };

                const encryptBackState = encodeUrl(updatedParsed);
                let qparam = new URLSearchParams(window.location.search) || '';
                let path = qparam?.get('path') || '';
                // Example input: ?name=rajaram&age=34&city=chennai
                const params = new URLSearchParams(window.location.search);

                // 1️⃣ Convert to Object
                const paramsObj = Object.fromEntries(params.entries());

                // 2️⃣ Delete a particular key
                delete paramsObj.q; // example: remove 'age'

                // 3️⃣ Convert back to URLSearchParams
                const newParams = new URLSearchParams(paramsObj);

                // Optional: convert to a string with `?`
                const newQueryString = `${newParams.toString()}`;

                                let state = {
                    isPushBuilder: true,
                    backPath: `/preferences/template-gallery/push-builder?q=${encryptBackState}&${newQueryString}`,
                    backState: { state: updatedParsed },
                };
                if (type && type === 'Edit') {
                    const selectedForm = formList.find((x) => x?.recipientFormID === value?.formId);
                    state.recipientFormId = value?.formId;
                    if (selectedForm) {
                        state.from =
                            selectedForm?.formType === 'Survey'
                                ? 2
                                : selectedForm?.formType === 'Tell a friend'
                                ? 1
                                : 0;
                    }
                    navigate(`/preferences/form-generator/add-form-generator?q=${encodeUrl(state)}&${newQueryString}`);
                } else {
                    navigate(
                        `/preferences/template-gallery/add-form-generator?q=${encodeUrl(state)}&${newQueryString}`,
                    );
                }
            } catch (error) {
            }
        },
        [parsed, navigate, formList],
    );

    const handleImageUpload = useCallback(
        async (file) => {
            try {
                // 🔹 Handle event (from input[type=file]) or direct File/Blob
                let imageFile = file?.target?.files?.[0] || file;

                if (!imageFile) {
                    return { status: false, data: null };
                }

                // 🔹 Handle wrapped object like { file: File }
                if (imageFile?.file instanceof File) {
                    imageFile = imageFile.file;
                }

                // ✅ Convert to Base64
                const base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);

                    if (imageFile instanceof Blob) {
                        reader.readAsDataURL(imageFile);
                    } else {
                        reject(new Error('Provided object is not a valid Blob or File'));
                    }
                });

                
                // 🔹 Extract image metadata
                const fileName = imageFile.name || 'resul.png';
                const imageFormat = fileName.split('.').pop() || 'png';
                const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
                                // 🔹 Build payload
                let payloadData = {
                    imageFormat,
                    contentLength: imageFile.size,
                    clientId,
                    departmentId,
                    userId,
                    departmentName,
                    isAgency,
                };
                payloadData.base64Image = cleanBase64;

                // 🔹 Choose upload function
                const uploadFunction = channelId === 14 ? uploadMobilePush : uploadWebPush;

                const { data, status } = await dispatch(uploadFunction({ payload: payloadData }));

                if (status) {
                                        let imageUrl = data;
                    sdxChannel.postMessage({ type: 'imageUpload', result: imageUrl || '' });
                    return { status: true, data };
                } else {
                    return { status: false, data: null };
                }
            } catch (error) {
                return { status: false, data: null };
            }
        },
        [channelId, clientId, departmentId, userId, departmentName, isAgency, dispatch],
    );

    // Consolidated configuration setup
    const configInitializedRef = useRef(false);
    const previousSelectDataRef = useRef(null);
    const previousTemplateIdRef = useRef(null);
    
    useEffect(() => {
        if (!parsed) return;

        const channeldetails = parsed?.channelDetails ? JSON.parse(parsed?.channelDetails) : {};
        setChannelId(channeldetails?.channelId);
        setTemplateName(parsed?.templateName || '');
        setTemplateDescription(parsed?.templateCategoryType?.categoryName || '');

        const setupConfig = async () => {
            // Get templateCategories from emailBuilderReducer
            const templateCategoriesData = templateCategories;
            
            let mconfig = channeldetails?.channelId === 14 ? PBmobileConfig : PBwebConfig;
            let qparam = new URLSearchParams(window.location.search);
            let _channelId = qparam?.get('channelId')?.length > 0 ? qparam?.get('channelId') : 0;
            if (_channelId > 0) {
                mconfig = _channelId == 14 ? PBmobileConfig : PBwebConfig;
            }

            let selectData = null;
            if (parsed?.mode === 'edit' && parsed?.builderApiResponse) {
                const apiResponse = parsed.builderApiResponse;
                                const jsonContent = parsed?.data || apiResponse.JsonContent;
                selectData = {
                    templateID: apiResponse.TemplateID,
                    templateCategoryID: apiResponse.TemplateCategoryID,
                    templateTypeID: null,
                    header: null,
                    body: apiResponse.HTML,
                    channelID: apiResponse.ChannelID || channeldetails?.channelId,
                    footer: null,
                    htmlContent: jsonContent ? JSON.parse(jsonContent).HtmlContent : null,
                    jsonContent,
                    text: apiResponse.TemplateName,
                    createdDate: apiResponse.CreatedDate,
                    createdBy: apiResponse.CreatedBy,
                    updatedDate: apiResponse.UpdatedDate,
                    updatedBy: apiResponse.UpdatedBy,
                    templateName: apiResponse.TemplateName,
                    thumbnailPath: apiResponse.ThumbnailPath,
                    statusID: apiResponse.StatusID,
                    isPredefined: apiResponse.IsPredefined,
                    industryId: 0,
                    businessTypeId: 0,
                    templateType: null,
                    campaignAttributeId: 0,
                    departmentID: apiResponse.DepartmentID,
                    filePath: null,
                    isEmbed: false,
                    campaignID: null,
                    splitType: null,
                    isEditButton: false,
                    pushTemplateCategory: templateCategoriesData?.filter((e) => e.templateCategoryId === apiResponse.TemplateCategoryID)[0],
                };
            }

            let apiResponse = null;
            if (parsed?.formDetails?.AddedFormData?.data?.formId) {
                apiResponse = await getFormData(parsed.formDetails.AddedFormData.data.formId);
            }

            // If templateId & channelId exist in query params, fetch template by ID and populate selectData
            try {
                const qparam = new URLSearchParams(window.location.search);
                const qpTemplateId = parseInt(qparam.get('templateId')) || 0;
                const qpChannelId = parseInt(qparam.get('channelId')) || channeldetails?.channelId || null;
                const isValidChannel = qpChannelId === 8 || qpChannelId === 14;
                if (qpTemplateId > 0 && isValidChannel) {
                    const payloadFetch = {
                        templateId: qpTemplateId,
                        channelId: qpChannelId,
                        departmentId,
                        clientId,
                        userId,
                    };
                    const fetchRes = await dispatch(getTemplate_AIEmail_byId(payloadFetch));
                    if (fetchRes?.status && fetchRes?.data) {
                        const apiResp = fetchRes.data;
                        const jsonContentStr = apiResp?.JsonContent || null;
                        const parsedJson = jsonContentStr ? JSON.parse(jsonContentStr) : null;
                        selectData = {
                            templateID: apiResp?.TemplateID,
                            templateCategoryID: apiResp?.TemplateCategoryID,
                            templateTypeID: null,
                            header: null,
                            body: apiResp?.HTML,
                            channelID: apiResp?.ChannelID || qpChannelId || channeldetails?.channelId,
                            footer: null,
                            htmlContent: parsedJson ? parsedJson.HtmlContent : null,
                            jsonContent: jsonContentStr,
                            text: apiResp?.TemplateName,
                            createdDate: apiResp?.CreatedDate,
                            createdBy: apiResp?.CreatedBy,
                            updatedDate: apiResp?.UpdatedDate,
                            updatedBy: apiResp?.UpdatedBy,
                            templateName: apiResp?.TemplateName,
                            thumbnailPath: apiResp?.ThumbnailPath,
                            statusID: apiResp?.StatusID,
                            isPredefined: apiResp?.IsPredefined,
                            industryId: 0,
                            businessTypeId: 0,
                            templateType: null,
                            campaignAttributeId: 0,
                            departmentID: apiResp?.DepartmentID,
                            filePath: null,
                            isEmbed: false,
                            campaignID: null,
                            splitType: null,
                            isEditButton: false,
                        };
                    }
                }
            } catch (e) {
            }

            const finalConfig = {
                ...mconfig,
                isRouter: true,
                personalisationData: [],
                formList,
                getFormListCallback: () => { },
                selectedForm: apiResponse?.formData,
                getSelectedFormCallback: () => { },
                selectData,
                templateName: parsed?.templateName || templateName,
                templateDescription: parsed?.templateCategoryType?.categoryName || templateDescription,
                saveButtonClick: saveBtnClick,
                saveTemplateCallback: (templateData) => {
                    saveBtnClick(templateData);
                },
                publishTemplateCallback: (templateData) => {
                    saveBtnClick(templateData);
                },
                updateTemplateCallback: (templateData) => {
                    saveBtnClick(templateData);
                },
                onTemplateChange: (templateData) => { },
                onSave: (templateData) => {
                    saveBtnClick(templateData);
                },
                onPublish: (templateData) => {
                    saveBtnClick(templateData);
                },
                onUpdate: (templateData) => {
                    saveBtnClick(templateData);
                },
                imageUpload: (file) => {
                                        return handleImageUpload(file);
                },
                canAdd: true,
                formNavigation: (value) => {},
                currentComponentId: parsed?.currentComponentId,
                templateData: parsed?.mode === 'edit' && parsed?.data ? parsed.data : null,
            };

            if (sessionStorage.getItem('pbstore')) {
                try {
                    const pbstoreValue = sessionStorage.getItem('pbstore');
                    const decode = CompressionManager.decompress(pbstoreValue, 'zlib');

                    decode.formResult = apiResponse;

                    // CRITICAL: Re-attach all callback functions that were lost during JSON serialization
                    const callbacksFromFinalConfig = {
                        getFormListCallback: finalConfig.getFormListCallback,
                        getSelectedFormCallback: finalConfig.getSelectedFormCallback,
                        saveTemplateCallback: finalConfig.saveTemplateCallback,
                        publishTemplateCallback: finalConfig.publishTemplateCallback,
                        updateTemplateCallback: finalConfig.updateTemplateCallback,
                        onTemplateChange: finalConfig.onTemplateChange,
                        onSave: finalConfig.onSave,
                        onPublish: finalConfig.onPublish,
                        onUpdate: finalConfig.onUpdate,
                        saveButtonClick: finalConfig.saveButtonClick,
                        imageUpload: (file) => {
                                                        return handleImageUpload(file);
                        },
                        formNavigation: finalConfig.formNavigation,
                    };

                    // Merge finalConfig (with callbacks) with preserved data from stored config
                    const mergedConfig = {
                        ...finalConfig, // Start with finalConfig (has all callbacks)
                        // Preserve specific data properties from stored config if current ones are empty/missing
                        formList:
                            formList.length > 0 ? formList : decode.pconfig?.formList || finalConfig.formList || [],
                        selectedForm: finalConfig.selectedForm || decode.pconfig?.selectedForm || null,
                        currentComponentId:
                            finalConfig.currentComponentId || decode.pconfig?.currentComponentId || null,
                        // Preserve other important properties from stored config
                        selectData: decode.pconfig?.selectData || finalConfig.selectData,
                        templateName: finalConfig.templateName || decode.pconfig?.templateName,
                        templateDescription: finalConfig.templateDescription || decode.pconfig?.templateDescription,
                        // Explicitly ensure all callbacks are present
                        ...callbacksFromFinalConfig,
                    };

                    // Use helper function to ensure all callbacks are present and valid
                    // decode.pconfig = ensureCallbacks(mergedConfig, callbacksFromFinalConfig);
                    decode.pconfig = mergedConfig;

                    // Update the config state with the restored config
                    setConfig(decode.pconfig);

                    sdxChannel.postMessage({ type: 'selectForm', apiResponse });

                    sessionStorage.setItem('pbstore', CompressionManager.compress(decode, 'zlib'));

                    // Early return to avoid setting config again below
                    return;
                } catch (error) {
                    // If there's an error, continue with normal flow
                }
            }

            // Check if critical data actually changed
            const currentSelectData = finalConfig?.selectData?.jsonContent;
            const selectDataChanged = previousSelectDataRef.current !== currentSelectData;
            const qparamForTemplate = new URLSearchParams(window.location.search);
            const currentTemplateId = parseInt(qparamForTemplate.get('templateId')) || 0;
            const templateIdChanged = previousTemplateIdRef.current !== currentTemplateId;
            
            // Only update config if it hasn't been initialized yet, or if critical data changed
            // This prevents resetting canvas settings when formList or other non-critical deps change
            if (!configInitializedRef.current || selectDataChanged || templateIdChanged) {
                setConfig(finalConfig);
                configInitializedRef.current = true;
                previousSelectDataRef.current = currentSelectData;
                previousTemplateIdRef.current = currentTemplateId;
            } else if (config) {
                // Preserve existing config to prevent unnecessary re-renders
                // Only update formList if it's actually different
                if (JSON.stringify(config.formList) !== JSON.stringify(finalConfig.formList)) {
                    setConfig(prev => ({ ...prev, formList: finalConfig.formList }));
                }
            }
        };

        setupConfig();
    }, [parsed, formList, fetchList, getFormData, saveBtnClick]);

    // Initial form list fetch
    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // Cleanup
    useEffect(() => {
        return () => {
            sdxChannel.close();
        };
    }, []);

    // Dynamically load and unload PushBuilder CSS
    useEffect(() => {
        const cssId = 'push-builder-dynamic-css';
        let linkElement = null;
        const loadCSS = async () => {
            try {
                // Check if link already exists
                const existingLink = document.getElementById(cssId);
                if (existingLink) {
                                        cssLoadedRef.current = true;
                    linkElement = existingLink;
                    setLoadCss(false);
                    return;
                }

                
                // Create link element manually
                linkElement = document.createElement('link');
                linkElement.id = cssId;
                linkElement.rel = 'stylesheet';
                linkElement.type = 'text/css';
                // Try to resolve the CSS path
                try {
                    // First try dynamic import to get the resolved URL
                    const module = await import('resul-push-builder/dist/style.css?url');
                    linkElement.href = module.default;
                                    } catch (e) {
                    // Fallback to node_modules path
                    linkElement.href = '/node_modules/resul-push-builder/dist/style.css';
                                        setLoadCss(false)
                }
                // Add load event listener
                linkElement.onload = () => {
                    cssLoadedRef.current = true;
                                        setLoadCss(false);
                };
                linkElement.onerror = () => {
                    cssLoadedRef.current = false;
                    setLoadCss(false)
                };

                // Append to head
                document.head.appendChild(linkElement);
            } catch (error) {
                cssLoadedRef.current = false;
            }
        };
        setLoadCss(true);
        loadCSS();

        // Cleanup function to remove CSS when component unmounts
        return () => {
                        // Remove the link element
            const link = document.getElementById(cssId);
            if (link) {
                link.remove();
                            }
            cssLoadedRef.current = false;
                    };
    }, []);

    return (
        <>
            {loadCss && <div className="push-builder-loader" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}></div>}
            {config !== null && loadCss === false && (
                <PushBuilder
                    builderId={1}
                    pconfig={config}
                    timeZoneData={transformedTimeZoneList}
                    selectTimeZone={selectedTimeZoneList}
                    formList={formList}
                    selectForm={getFormData}
                    imageUpload={(e) => {
                                                return handleImageUpload(e);
                    }}
                    callback={() => {
                        const params = new URLSearchParams(window.location.search);
                        if (params.has('path') && params.get('path').length > 0) {
                            const pathValue = params.get('path');

                            // Remove the 'path' parameter
                            params.delete('path');

                            // Get remaining query params as a string
                            const remainingQuery = params.toString();

                            // Construct new URL (with remaining query params)
                            const newUrl = remainingQuery ? `/${pathValue}?${remainingQuery}` : `/${pathValue}`;

                            // Optional: update URL in browser (without reload)
                            window.history.replaceState({}, '', newUrl);

                            removeQueryParams(['channelId', 'templateId']);

                            // Navigate (React Router)
                            navigate(newUrl);
                            return;
                        }

                        const channeldetails = parsed?.channelDetails ? JSON.parse(parsed?.channelDetails) : {};
                        navigate(
                            channeldetails?.channelId === 8
                                ? '/preferences/template-gallery/webpush-builder-gallery'
                                : channeldetails?.channelId === 14
                                ? '/preferences/template-gallery/mobile-builder-gallery'
                                : '/preferences/template-gallery',
                        );
                    }}
                    addForm={(value) => {
                        try {
                            // Ensure the value has all necessary callbacks before compressing
                            sessionStorage.setItem('pbstore', CompressionManager.compress(value, 'zlib'));
                            addNewForm(value);
                        } catch (error) {
                        }
                    }}
                    editForm={(value) => {
                        try {
                            sessionStorage.setItem('pbstore', CompressionManager.compress(value, 'zlib'));
                            addNewForm(value, 'Edit');
                        } catch (error) {
                        }
                    }}
                    saveButtonClick={saveBtnClick}
                    platformLogo={ResulticksLogoBlue}
                />
            )}
        </>
    );
};

export default PushAIBuilder;
