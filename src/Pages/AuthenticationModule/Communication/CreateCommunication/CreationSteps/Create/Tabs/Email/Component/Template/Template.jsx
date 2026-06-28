import { UpdateState } from 'Utils/modules/misc';
import { removeQueryParams } from 'Utils/modules/urlQuery';
import { buildPayload as buildMobileNotificationPayload } from '../../../MobileNotification/constant';
import { buildPayload as buildWebNotificationPayload } from '../../../Notification/constant';

import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH150 } from 'Constants/GlobalConstant/Regex';
import { ADD_VIEW_IN_BROWSER, EMAIL_NOT_DISPLAYING, INBOX_FIRST_LINE_MESSAGE, INBOX_FIRST_LINE_PREVIEW, RES_75_CHARACTERS, VIEW_IN_BROWSER } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, email_preview_medium, form_edit_medium, pencil_edit_medium, restart_medium, spam_assassin_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import _get from 'lodash/get';
import RSTabbar from 'Components/RSTabber';
import { Row, Col } from 'react-bootstrap';
import { currentSplitName, tabData } from './constant';
import RSTooltip from 'Components/RSTooltip';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { baseURL, LANDING_BUILDER_REDIRECT_URL } from 'Constants/EndPoints/index';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    templateCategoryListApi_AI,
    templateGalleryListApi_AI,
} from 'Reducers/preferences/EmailBuilder/request';
import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import { useFormContext } from 'react-hook-form';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
const scriptTagStartText = '<!-- Start of Script Conditions -->';
const scripttagEndText = '<!-- End of Script Conditions -->';
const tagStartText = '<!-- TCTAG:- [START] -->';
const tagEndText = ' <!-- TCTAG:- [END] -->';

import SpamScoreModal from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/SpamScoreModal/SpamScoreModal';
import useQueryParams from 'Hooks/useQueryParams';
import { buildPayload, getSavedPushChannelFlagPayload } from '../../constant';
import {
    getCheckSpam,
    saveEmailCampaign,
    saveMobilePush,
    saveWebPush,
} from 'Reducers/communication/createCommunication/Create/request';
import { resolvePausedEtSaveEmailThunk } from '../../constant';
const scriptAmpStart = '<!-- Start of Script amp Conditions -->';
const scriptAmpEnd = '<!-- End of Script amp Conditions -->';
const scriptHtmlStart = '<!-- Start of Script html Conditions -->';
const scriptHtmlEnd = '<!-- End of Script html Conditions -->';

import { iframeStyles } from 'Pages/AuthenticationModule/Components/Import/constant';

import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import { getTemplate_AIEmail_byId } from 'Reducers/preferences/EmailBuilder/request';

import { templateLoading } from 'Reducers/communication/Template/reducer';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import { updateMDCEditMode } from 'Reducers/communication/createCommunication/Create/reducer';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

const lastSpamScoreTemplateBySplit = {};

const Template = ({
    fieldName = '',
    isSplit = false,
    showBrowerText = false,
    isNotification = '',
    channelId = 0,
    isClickOff = false,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const spamScoreLoader = useApiLoader();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { campaignDetails } = useSelector((state) => emailList(state));
    const [campaign, setCampaign] = useState({});
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const locationState = useQueryParams('/communication');
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const [categoriesData, setCategoriesData] = useState([]);
    const categoriesLoader = useApiLoader();
    const {
        control,
        formState: { errors },
        register,
        setValue,
        setFocus,
        watch,
        resetField,
        setError,
        getValues,
        clearErrors,
    } = useFormContext();

    const rrState = useQueryParams('');
    const qparam = new URLSearchParams(window.location.search);
    const channelIdParam = parseInt(qparam.get('channelId')) || 0;
    const templateIdParam = parseInt(qparam.get('templateId')) || 0;
    const [templateId, setTemplateId] = useState(rrState?.templateId);
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState('amp');
    const isInitializedRef = useRef(false);
    if (Object.keys(campaignDetails)?.length) {
        const { content, isSplitAB } = campaignDetails;
        let temp = {};
    }
    const [state, setState] = useState({
        SpamScoreModal: false,
    });
    const template = useSelector(({ TemplateReducer }) => TemplateReducer);
    const emailBuilderReducer = useSelector(({ emailBuilderReducer }) => emailBuilderReducer);
    const [isTrigger, setIsTrigger] = useState(false);
    const [payload, setPayload] = useState({
        departmentId,
        clientId,
        userId: 0,
        channelId: isNotification === 'Web' ? 8 : isNotification === 'Mobile' ? 14 : 1,
        templatecategory: 'All template',
        pagination: {
            pageNo: 1,
            recordLimit: 4,
        },
        isFilter: false,
        filteration: {
            templateName: '',
            startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: getYYMMDD(new Date()),
            templateCategoryId: '',
        },
    });
    const handleTemplate = async (value) => {
        let updatedPayload = {
            ...payload,
            userId: value.text === 'My templates' ? userId : 0,
            templatecategory: value.text === 'My templates' ? 'My template' : 'All template',
            pagination: {
                pageNo: 1,
                recordLimit: 4,
            },
            filteration: {
                templateName: '',
                startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                endDate: getYYMMDD(new Date()),
                templateCategoryId: '',
            },
        };

        setPayload(updatedPayload);
    };

    const lastTemplateGalleryPayloadKeyRef = useRef(null);
    const lastTemplateCategoryKeyRef = useRef(null);

    useEffect(() => {
        const payloadKey = JSON.stringify(payload ?? {});
        if (lastTemplateGalleryPayloadKeyRef.current === payloadKey) {
            return;
        }
        lastTemplateGalleryPayloadKeyRef.current = payloadKey;

        const categoryKey = `${clientId}|${departmentId}|${userId}|${String(payload?.templatecategory ?? '')}`;
        const shouldFetchCategories =
            lastTemplateCategoryKeyRef.current !== categoryKey ||
            !(Array.isArray(categoriesData) && categoriesData.length);

        let cancelled = false;

        const run = async () => {
            const payloadForApi = {
                ...payload,
                filteration: {
                    ...payload?.filteration,
                    templateCategoryId: payload?.filteration?.templateCategoryId || '',
                },
            };
            setLoading(true);
            dispatch(templateLoading(true));
            await dispatch(templateGalleryListApi_AI(payloadForApi));
            if (cancelled) return;
            setLoading(false);
            dispatch(templateLoading(false));
            if (shouldFetchCategories) {
                await handleCategories(payload?.templatecategory);
                if (!cancelled) {
                    lastTemplateCategoryKeyRef.current = categoryKey;
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [payload, isNotification, dispatch, clientId, departmentId, userId, categoriesData]);

    // On mount: if query params contain channelId (1, 8, or 14) and a templateId, fetch template by ID
    useEffect(() => {
        const campaign = {
            campaignId: _get(locationState, 'campaignId', 0),
            campaignType: _get(locationState, 'campaignType', 'S'),
        };

        const isValidChannel = channelIdParam === 8 || channelIdParam === 14 || channelIdParam === 1;
        const hasTemplateId = templateIdParam > 0;
        const isReturningFromBuilder = new URLSearchParams(window.location.search).get('channelId') !== null;

        const run = async () => {
            if (isValidChannel && hasTemplateId) {
                fetchTemplateById(templateIdParam, channelIdParam);
            } else if (isValidChannel && !hasTemplateId && isReturningFromBuilder) {
                const latestPayload = {
                    departmentId,
                    clientId,
                    userId,
                    channelId: channelIdParam,
                    templatecategory: 'My template',
                    pagination: { pageNo: 1, recordLimit: 1 },
                    isFilter: false,
                    filteration: {
                        templateName: '',
                        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                        endDate: getYYMMDD(new Date()),
                        templateCategoryId: '',
                    },
                };
                const result = await dispatch(templateGalleryListApi_AI(latestPayload));
                const latestTemplateId = result?.data?.[0]?.templateID;
                if (latestTemplateId) {
                    fetchTemplateById(latestTemplateId, channelIdParam);
                }
            }
        };
        run();
        setCampaign(campaign);
    }, []);

    const viewInbrowserName = isSplit ? `${fieldName}.viewInBrowser` : 'viewInBrowser';
    const inboxLinePreviewName = isSplit ? `${fieldName}.inboxLinePreview` : 'inboxLinePreview';
    const edmContentName = isSplit ? `${fieldName}.edmContent` : 'edmContent';
    const templateContentName = isSplit ? `${fieldName}.templateContent` : 'templateContent';
    const sampleEmailFooterName = isSplit ? `${fieldName}.sampleEmailFooter` : 'sampleEmailFooter';
    const editorTextName = isSplit ? `${fieldName}.editorText` : 'editorText';
    const subjectLineName = isSplit ? `${fieldName}.subjectLine` : 'subjectLine';
    const spamScoreName = isSplit ? `${fieldName}.spamScore` : 'spamScore';
    const top3Name = isSplit ? `${fieldName}.top3` : 'top3';
    const edmContentDimensionName = isSplit ? `${fieldName}.edmDimension` : 'edmDimension';
    const templateIDName = isSplit ? `${fieldName}.templateId` : 'templateId';
    const contentTypeName = isSplit ? `${fieldName}.contentType` : 'contentType';
    const [edmContent = [], viewInBrowser, sampleEmailFooter, templateContent = ''] = watch([
        edmContentName,
        viewInbrowserName,
        sampleEmailFooterName,
        templateContentName,
    ]);
    useEffect(() => {
        const edmContentVal = templateContent;
        // console.log('edmContentVal: ', edmContentVal);
        if (edmContentVal?.length > 0) {
            // Sync edmContent with templateContent if it's not already set

            const currentEdmContent = getValues(edmContentName);
            if (!currentEdmContent || currentEdmContent.length === 0) {
                if (isNotification !== 'Web' && isNotification !== 'Mobile') {
                    setValue(edmContentName, edmContentVal);
                }
            }
            handleFileInputChange(edmContentVal);
        }
    }, [templateContent, previewMode]);

    useEffect(() => {
        if (isInitializedRef.current) {
            return;
        }

        const hasExistingCampaign =
            campaignDetails && Object.keys(campaignDetails).length && campaignDetails?.content?.length;

        if (hasExistingCampaign) {
            const content = campaignDetails?.content;
            if (content && content?.length) {
                if (isSplit && fieldName) {
                    const splitType = fieldName.replace('split', '');
                    const splitContent = content.find((item) => item.splitType === splitType);
                    if (splitContent && splitContent.hasOwnProperty('isViewinBrowser')) {
                        setValue(viewInbrowserName, splitContent.isViewinBrowser);
                    } else {
                        setValue(viewInbrowserName, true);
                    }
                    isInitializedRef.current = true;
                } else {
                    if (content[0] && content[0].hasOwnProperty('isViewinBrowser')) {
                        setValue(viewInbrowserName, content[0].isViewinBrowser);
                    } else {
                        setValue(viewInbrowserName, true);
                    }
                    isInitializedRef.current = true;
                }
            } else {
                setValue(viewInbrowserName, true);
                isInitializedRef.current = true;
            }
        } else {
            setValue(viewInbrowserName, true);
            isInitializedRef.current = true;
        }
    }, [campaignDetails, locationState]);

    useEffect(() => {
        const campaignId = locationState?.campaignId;
        return () => {
            isInitializedRef.current = false;
        };
    }, [locationState?.campaignId]);
    const spamCheckSplitKey = isSplit && fieldName ? fieldName : 'default';
    const spamCheckCampaignKey =
        locationState?.campaignId != null && locationState?.campaignId !== ''
            ? String(locationState.campaignId)
            : 'new';

    const getSpamTemplateBucket = () => {
        if (!lastSpamScoreTemplateBySplit[spamCheckCampaignKey]) {
            lastSpamScoreTemplateBySplit[spamCheckCampaignKey] = {};
        }
        return lastSpamScoreTemplateBySplit[spamCheckCampaignKey];
    };

    useEffect(() => {
        Object.keys(lastSpamScoreTemplateBySplit).forEach((k) => {
            if (k !== spamCheckCampaignKey) {
                delete lastSpamScoreTemplateBySplit[k];
            }
        });
    }, [spamCheckCampaignKey]);

    useEffect(() => {
        const bucket = getSpamTemplateBucket();
        if (!templateContent) {
            bucket[spamCheckSplitKey] = { templateContent: '' };
            return;
        }
        if (getValues(contentTypeName) !== 'T') {
            setValue(contentTypeName, 'T');
        }
        if (isNotification === 'Web' || isNotification === 'Mobile') {
            return;
        }

        handleFileInputChange(templateContent);

        const splitState = bucket[spamCheckSplitKey];
        if (splitState?.templateContent === templateContent) {
            return;
        }
        bucket[spamCheckSplitKey] = { templateContent };
        getSpamScore(templateContent);
    }, [templateContent, spamCheckSplitKey, spamCheckCampaignKey, previewMode]);
    const getSpamScore = (html) =>
        spamScoreLoader.refetch({
            fetcher: ({ payload } = {}) =>
                dispatch(
                    getCheckSpam({
                        loading: false,
                        payload,
                    }),
                ),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: {
                payload: {
                    userId,
                    clientId,
                    departmentId,
                    campaignId: locationState?.campaignId,
                    body: html,
                    body1: spamScoreModalProps?.content, //Text editor content
                    emailFooterRawcode: spamScoreModalProps?.emailFooter,
                    preHeaderMessage: getValues(inboxLinePreviewName),
                    subjectLine: getValues(subjectLineName),
                    spamScore: spamScoreName,
                    top3: top3Name,
                    setValue,
                },
            },
        });

    const hasAmp = useMemo(() => templateContent?.includes(scriptAmpStart), [templateContent]);

    const processEmailHTML = (rawHTML, mode) => {
        if (!rawHTML || !hasAmp) return rawHTML;

        let processedHTML = rawHTML;

        if (mode === 'amp') {
            while (processedHTML.includes(scriptAmpStart)) {
                const startIndex = processedHTML.indexOf(scriptAmpStart);
                const endIndex = processedHTML.indexOf(scriptAmpEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const ampContent = processedHTML.substring(startIndex + scriptAmpStart.length, endIndex);
                const after = processedHTML.substring(endIndex + scriptAmpEnd.length);
                processedHTML = before + ampContent + after;
            }
            while (processedHTML.includes(scriptHtmlStart)) {
                const startIndex = processedHTML.indexOf(scriptHtmlStart);
                const endIndex = processedHTML.indexOf(scriptHtmlEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const after = processedHTML.substring(endIndex + scriptHtmlEnd.length);
                processedHTML = before + after;
            }
        } else {
            while (processedHTML.includes(scriptAmpStart)) {
                const startIndex = processedHTML.indexOf(scriptAmpStart);
                const endIndex = processedHTML.indexOf(scriptAmpEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const after = processedHTML.substring(endIndex + scriptAmpEnd.length);
                processedHTML = before + after;
            }
            while (processedHTML.includes(scriptHtmlStart)) {
                const startIndex = processedHTML.indexOf(scriptHtmlStart);
                const endIndex = processedHTML.indexOf(scriptHtmlEnd, startIndex);
                if (endIndex === -1) break;
                const before = processedHTML.substring(0, startIndex);
                const htmlContent = processedHTML.substring(startIndex + scriptHtmlStart.length, endIndex);
                const after = processedHTML.substring(endIndex + scriptHtmlEnd.length);
                processedHTML = before + htmlContent + after;
            }
        }
        return processedHTML;
    };
    function handleFileInputChange(content = '', fieldName = '') {
        // Helper function to set iframe height after content is loaded
        const setIframeHeight = (iframeEl) => {
            if (!iframeEl) return;

            const edmelement =
                iframeEl.parentElement || document.getElementById('template') || document.querySelector('.edm-import-wrapper');

            const measureAndApply = () => {
                const doc = iframeEl.contentDocument;
                const bodyNode = doc?.body;
                const htmlNode = doc?.documentElement;
                if (!edmelement || !bodyNode) return;

                const clientheight = Math.max(
                    bodyNode.scrollHeight || 0,
                    bodyNode.offsetHeight || 0,
                    htmlNode?.scrollHeight || 0,
                    htmlNode?.offsetHeight || 0,
                );

                if (clientheight) {
                    const h = clientheight;
                    edmelement.style.height = `${h}px`;
                    edmelement.style.minHeight = `${h}px`;
                    iframeEl.style.height = `${h}px`;
                    iframeEl.style.minHeight = `${h}px`;
                }
            };

            measureAndApply();

            const imgs = iframeEl.contentDocument?.getElementsByTagName?.('img');
            if (imgs?.length) {
                for (let i = 0; i < imgs.length; i++) {
                    const img = imgs[i];
                    if (!img.complete) {
                        img.addEventListener('load', measureAndApply, { once: true });
                    }
                }
            }

            setTimeout(measureAndApply, 300);
            setTimeout(measureAndApply, 1000);
        };

        const safeGetIframeBody = (frameDocument) => {
            if (!frameDocument) return null;

            if (frameDocument.body) {
                return frameDocument.body;
            }

            const body = frameDocument.querySelector('body');
            if (body) {
                return body;
            }

            const html = frameDocument.documentElement || frameDocument.getElementsByTagName('html')[0];
            if (html) {
                const existingBody = html.querySelector('body');
                if (existingBody) {
                    return existingBody;
                }

                try {
                    const bodyElement = frameDocument.createElement('body');
                    html.appendChild(bodyElement);
                    return bodyElement;
                } catch (e) {
                    return null;
                }
            }

            return null;
        };

        try {
            if (content) {
                if (edmContent) {
                    const iframeEl = document.querySelector('#template iframe');
                    if (iframeEl) {
                        setIframeHeight(iframeEl);
                    }
                }
                const currentIframeElement = document.querySelector('iframe');
                // console.log('currentIframeElement: ', currentIframeElement);
                //Removing the old iframe template to exclude duplicate
                if (currentIframeElement !== null) {
                    document.getElementById('template').innerHTML = '';
                }
                if (hasAmp) {
                    // Amp Flow - Optimized with external React state
                    const processedHtml = processEmailHTML(content, previewMode);
                    const createFrame = document.createElement('iframe');
                    createFrame.id = 'iframe';
                    createFrame.width = '100%';
                    createFrame.height = '800px';
                    createFrame.setAttribute('allow', 'autoplay');

                    // document.getElementById('template').appendChild(createFrame);
                    // const frameDocument = createFrame.contentDocument;

                    // Add load event listener to set height after scripts are loaded
                    createFrame.onload = () => {
                        // AMP loads scripts async — wait for them to finish rendering
                        let attempts = 0;
                        const maxAttempts = 20;
                        const measureHeight = () => {
                            const liveDoc = createFrame.contentDocument;
                            const liveBody = safeGetIframeBody(liveDoc);
                            if (liveBody) {
                                liveBody.insertAdjacentHTML('beforeend', iframeStyles);
                            }
                            const checkReady = () => {
                                attempts++;
                                const body = createFrame.contentDocument?.body;
                                const scrollH = body?.scrollHeight || 0;
                                // Keep polling until AMP has rendered a real height
                                if (scrollH > 50 || attempts >= maxAttempts) {
                                    const edmHeight = scrollH;
                                    const edmWidth = body?.scrollWidth || 0;
                                    setValue(edmContentDimensionName, edmHeight * edmWidth);
                                    // Set iframe height to match content exactly
                                    createFrame.style.height = `${edmHeight + 20}px`;
                                    setIframeHeight(createFrame);
                                } else {
                                    setTimeout(checkReady, 200);
                                }
                            };
                            setTimeout(checkReady, 300);
                        };
                        measureHeight();
                    };
                    createFrame.srcdoc = processedHtml;
                    document.getElementById('template').appendChild(createFrame);
                }
                else if (content.includes(scriptTagStartText) && content.includes(scripttagEndText)) {
                    ///1/2/5/8 Bundling
                    //Getting the script tag content on the page
                    const startIndex = content.indexOf(scriptTagStartText) + scriptTagStartText?.length;
                    const endIndex = content.lastIndexOf(scripttagEndText);
                    const scriptTagContent = content.slice(startIndex, endIndex) || '';
                    const convertScriptTagToObject = JSON.parse(removeTags(scriptTagContent));
                    const labelSet = convertScriptTagToObject?.LabelSet;
                    //Creating the iframe and adding the content of the iframe
                    const createFrame = document.createElement('iframe');
                    createFrame.id = 'iframe';
                    createFrame.width = '100%';
                    createFrame.setAttribute('allow', 'autoplay');
                    document.getElementById('template').appendChild(createFrame);

                    // Add load event listener to set height and dimensions after scripts are loaded
                    createFrame.onload = () => {
                        let edmHeight = createFrame.contentWindow.document.body.scrollHeight;
                        let edmWidth = createFrame.contentWindow.document.body.scrollWidth;
                        let tempedmDimension = edmHeight * edmWidth;
                        setValue(edmContentDimensionName, tempedmDimension);
                        setIframeHeight(createFrame);
                    };

                    const frameDocument = createFrame.contentDocument;
                    //Reloading the iframe to update
                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    createFrame.contentWindow.document.close();
                    //Adding the style to the iframe
                    const scriptBody = safeGetIframeBody(frameDocument);
                    if (scriptBody) {
                        scriptBody.innerHTML = scriptBody.innerHTML + iframeStyles;
                    } else {
                        throw new Error('Unable to access iframe body for script-tagged content');
                    }
                    //Checking whether the labelset is available and throwing the error
                    const editorEle = [...createFrame.contentWindow.document.getElementsByClassName('edit-outline')];
                    // if (labelSet?.length === editorEle?.length) {
                    //Looping the seperated content and adding the the tab and tab content
                    editorEle.forEach((ele, eleIndex) => {
                        const elementInnerHTML = ele.innerHTML;
                        const scriptTag = elementInnerHTML.slice(
                            elementInnerHTML.indexOf(tagStartText) + tagStartText?.length,
                            elementInnerHTML.lastIndexOf(tagEndText),
                        );
                        const imageEditor = ele.parentNode.className.includes('img');
                        const buildId = `${imageEditor ? 'imgblk' : 'textblk'}${eleIndex}_target`;
                        const parentElement = document.createElement('div');
                        const parenetElementId = imageEditor ? 'imgblk' + eleIndex : 'textblk' + eleIndex;
                        parentElement.id = parenetElementId;
                        parentElement.className = 'editable';
                        const tabNames = document.createElement('ul');
                        tabNames.className = 'nav nav-tabs targetTab';
                        labelSet.forEach((label, labelIndex) => {
                            const tab = document.createElement('li');
                            const link = document.createElement('span');
                            link.innerHTML = label;
                            tab.setAttribute('data-id', labelSet[labelIndex]);
                            tab.className = `${labelIndex === 0 ? 'tab-active' : ''}`;
                            tab.appendChild(link);
                            tab.onclick = () => {
                                const tabElement = [...parentElement.querySelector('.tab-content').children];
                                const listElement = [...tabNames.children];
                                tabElement.forEach((ele, eleIndex) => {
                                    const dataIndex = Number(ele.getAttribute('data-index'));
                                    if (dataIndex === labelIndex) {
                                        ele.classList.add('active');
                                        listElement[eleIndex].classList.add('tab-active');
                                    } else {
                                        ele.classList.remove('active');
                                        listElement[eleIndex].classList.remove('tab-active');
                                    }
                                });
                            };
                            tabNames.appendChild(tab);
                        });
                        parentElement.appendChild(tabNames);
                        const tempEle = document.createElement('div');
                        tempEle.innerHTML = scriptTag;
                        let childNodes = [...tempEle.children];
                        if (childNodes?.length === labelSet?.length) {
                            const tabContentElement = document.createElement('div');
                            tabContentElement.className = 'tab-content';
                            tabContentElement.appendChild(
                                document.createComment(`<!--DIVSTART:${parenetElementId}-->`),
                            );
                            childNodes.forEach((childEle, index) => {
                                const tabPane = document.createElement('div');
                                tabPane.id = `${buildId}${index}`;
                                tabPane.setAttribute('data-name', labelSet[index]);
                                tabPane.setAttribute('data-index', index);
                                tabPane.className = `tab-pane${index === 0 ? ' active' : ''}`;
                                const tagType = imageEditor ? 'img' : 'txt';
                                tabPane.appendChild(
                                    document.createComment(`<!--[st:${tagType}:${eleIndex}:li:${index}]-->`),
                                );
                                tabPane.appendChild(childEle);
                                tabPane.appendChild(
                                    document.createComment(`<!--[end:${tagType}:${eleIndex}:li:${index}]-->`),
                                );
                                tabContentElement.appendChild(tabPane);
                            });
                            tabContentElement.appendChild(document.createComment(`<!--DIVEND:${parenetElementId}-->`));
                            parentElement.appendChild(tabContentElement);
                            ele.replaceChildren(parentElement);
                        } else {
                            throw new Error('Tabcontent did not match');
                        }
                    });
                    // } else {
                    //     throw new Error('Label and tags Set did not match');
                    // }
                } else {
                    //Creating the iframe and adding the content of the iframe
                    const createFrame = document.createElement('iframe');
                    createFrame.id = 'iframe';
                    createFrame.width = '100%';
                    createFrame.setAttribute('allow', 'autoplay');
                    document.getElementById('template').appendChild(createFrame);

                    // Add load event listener to set height and dimensions after scripts are loaded
                    createFrame.onload = () => {
                        let edmHeight = createFrame.contentWindow.document.body.scrollHeight;
                        let edmWidth = createFrame.contentWindow.document.body.scrollWidth;
                        let tempedmDimension = edmHeight * edmWidth;
                        setValue(edmContentDimensionName, tempedmDimension);
                        setIframeHeight(createFrame);
                    };

                    createFrame.contentWindow.document.open();
                    createFrame.contentWindow.document.write(content);
                    createFrame.contentWindow.document.close();
                    const frameDocument = createFrame.contentDocument;
                    const regularBody = safeGetIframeBody(frameDocument);
                    if (regularBody) {
                        regularBody.innerHTML = regularBody.innerHTML + iframeStyles;
                    } else {
                        throw new Error(
                            'Unable to access iframe body. Template content may be invalid or iframe not ready.',
                        );
                    }
                }
                return [true, 'Uploaded successfully'];
            } else {
                // throw new Error('Empty content');
                throw new Error('Not a valid EDM');
            }
        } catch (error) {
            document.getElementById('template').innerHTML = '';
            return [false, error.message];
        }
    }
    const sampleFooterText = _get(sampleEmailFooter, 'emailFooterRawcode', '');
    const spamScoreModalProps = {
        show: state.SpamScoreModal,
        content: getValues(editorTextName),
        edmContent,
        emailFooter: sampleFooterText,
        subjectLine: getValues(subjectLineName),
        inboxLinePreview: getValues(inboxLinePreviewName),
        isSplit,
        fieldName,
        handleClose: () => UpdateState(setState, 'SpamScoreModal', false),
        isSpam: true,
    };

    const handleDirect = async (categoriesData) => {
        const subjectLineField = isSplit && fieldName ? `${fieldName}.subjectLine` : 'subjectLine';
        // debugger
        let formState = getValues();
        // console.log('formState: ', formState);
        if ((!formState.audience || formState.audience?.length === 0) && locationState?.campaignType === 'S') {
            setError('audience', {
                type: 'custom',
                message: 'Selected audience bunch empty. Please add audience or select other bunch',
            });
            setFocus('audience');
            return;
        }
        // else if (
        //     (!getValues(subjectLineField)) &&
        //     isNotification !== 'Web' &&
        //     isNotification !== 'Mobile'
        // ) {
        //     //  else if (!subjectLine || subjectLine.trim() === '') {
        //     setError(subjectLineField, {
        //         type: 'custom',
        //         message: 'Enter subject line',
        //     });
        //     setFocus(subjectLineField);
        //     return;
        // } 
        else if ((!!formState?.domain || !formState.domain?.length === 0) && isNotification === 'Web') {
            setError('domain', {
                type: 'custom',
                message: 'Select domain',
            });
            setFocus('domain');
            return;
        } else if (
            (!!formState?.layoutPosition || !formState?.layoutPosition?.length === 0) &&
            (isNotification === 'Web' || isNotification === 'Mobile')
        ) {
            setError('layoutPosition', {
                type: 'custom',
                message: 'Select layout',
            });
            setFocus('layoutPosition');
            return;
        } else if ((locationState?.campaignType === 'S' ? !!formState?.audience : true)) {
            const splitTabListFromForm = getValues('splitTabList');
            const resolvedSplitTabList =
                Array.isArray(splitTabListFromForm) && splitTabListFromForm.length > 0
                    ? splitTabListFromForm
                    : ['splitA', 'splitB'];
            formState = {
                ...campaign,
                ...campaignDetails,
                ...formState,
                splitABCount: 0,
                splitTabList: resolvedSplitTabList,
                isSendTestMail: 0,
                clientId,
                userId,
                departmentId,
                campaignId: locationState?.campaignId,
                ...(locationState?.campaignType === 'M' && locationState?.mdcContentSetupDetails),
            };
            let payload = buildPayload(formState, '', 'template', locationState);

            const payloadSubmit = {
                clientId,
                departmentId,
                userId,
                createdBy: userId,
                campaignId: locationState?.campaignId,
                campaignType: locationState?.campaignType,
                edmGuid: '',
                campaignGuid: '',
                audienceCount: formState?.audience?.reduce(
                    (prev, cur) => Number(prev) + Number(cur.recipientCountWebPush),
                    0,
                ),
                ...payload,
            };
            // const payload = buildPayload(formState);

            // let baseURL = 'https://dwiz.resul.io/';

            const token = localStorage.getItem('accessToken');

            let fromEnvi = location.href;
            // const { status, data } = await dispatch(saveEmailCampaign({ payload }));
            const { status, data, message } = await dispatch(
                resolvePausedEtSaveEmailThunk({
                    payload,
                    savedChannelsId,
                    campaignDetails,
                    locationState,
                }),
            );
            if (status) {
                // console.log('data::', data);
                // let params = {
                //     campaignId: locationState?.campaignId || 0,
                //     templateId: getValues(templateIDName) || campaignDetails?.content[0].templateId || 0,
                //     channelId: 1,
                //     segList: 0,
                //     name: campaignDetails?.content[0].templateName || '',
                //     SplitType: '',
                //     channelDetailId: edmChannelId || 0,
                //     departmentId,
                //     clientId,
                //     userId,
                //     edmChannelId: edmChannelId || 0,
                // };
                // let channelDetails = JSON.stringify(params);
                // window.location.href = `${baseURL}${'CommunicationEDMTemplate/TemplateBuilder'}?accessToken=${encodeURIComponent(
                //     token,
                // )}&ChannelDetails=${encodeURIComponent(channelDetails)}&from=${fromEnvi}`;
                // window.location.href = `${baseURL}${'CommunicationEDMTemplate/TemplateBuilder'}?accessToken=${encodeURIComponent(
                //     token,
                // )}&ChannelDetails=${encodeURIComponent(channelDetails)}&from=${fromEnvi}`;

                const payload = {
                    templateId: getValues(templateIDName) || campaignDetails?.content[0]?.templateId || 0,
                    channelId: 1,
                    departmentId,
                    clientId,
                    userId,
                };
                let templateData = await dispatch(getTemplate_AIEmail_byId(payload));
                if (templateData?.status) {
                    const channelIdToSave = 1;
                    const updatedSavedChannelsId = { ...(locationState.savedChannelsId || savedChannelsId) };
                    if (!updatedSavedChannelsId[channelIdToSave]?.includes(channelIdToSave)) {
                        updatedSavedChannelsId[channelIdToSave] = [...(updatedSavedChannelsId[channelIdToSave] || []), channelIdToSave];
                    }

                    let locationEnvi =
                        locationState.campaignType === 'M'
                            ? {
                                ...locationState,
                                savedChannelsId: updatedSavedChannelsId,
                                mdcContentSetupDetails: {
                                    ...locationState.mdcContentSetupDetails,
                                    channelDetailId: edmChannelId || 0,
                                },
                            }
                            : {
                                ...locationState,
                                savedChannelsId: updatedSavedChannelsId,
                                channelDetailId: edmChannelId || 0,
                            };
                    const _handleDirectTemplateId = getValues(templateIDName) || campaignDetails?.content[0]?.templateId || 0;
                    locationEnvi = `?q=${encodeUrl(locationEnvi)}&channelId=1&templateId=${_handleDirectTemplateId}`;
                    const stateAIBuilder = {
                        data: templateData?.data?.JsonContent,
                        templateId: getValues(templateIDName) || campaignDetails?.content[0]?.templateId || 0,
                        mode: 'edit',
                        templateName: templateData?.data?.TemplateName,
                        campaignName: locationState?.campaignName,
                        CampaignDate: locationState?.startDate + ' - ' + locationState?.endDate,
                        templateType: locationState?.communicationType || 'Promotion',
                        from: 'Communication',
                        templateDate: templateData?.data?.CreatedDate,
                        campaignId: locationState?.campaignId || 0,
                        channelId: 1,
                        channelDetailId: edmChannelId || 0,
                        edmChannelId: edmChannelId || 0,
                        fromEnvi: locationEnvi,
                        templateCategoryType: categoriesData?.filter(
                            (e) => e.templateCategoryId === templateData?.TemplateCategoryID,
                        )[0] || {
                            categoryName: 'Business',
                            templateCategoryId: 2,
                        }, //temp_templateCategory || 0,
                        campaignType: locationState.campaignType,
                        activeSplitName: isSplit ? currentSplitName(getValues('currentSplitTab')) : '',
                        ...getSavedPushChannelFlagPayload(isNotification)
                    };
                    locationState.campaignType === 'M' && dispatch(updateMDCEditMode('edit'));
                    const encryptState = encodeUrl(stateAIBuilder);
                    navigate(
                        `/preferences/template-gallery/email-builder?q=${encryptState}&mode=${stateAIBuilder.mode}`,
                        {
                            state: stateAIBuilder,
                        },
                    );
                }
            } else {
                dispatch(
                    update_failures_API_Errors({
                        field: 'SaveEmailCampaign',
                        message: message || 'No data available',
                    }),
                );
            }
        }
    };
    const handleCategories = async (dataCatageory) => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        let myTemplateCategory = {
            categoryName: 'All',
            templateCategoryId: userId,
        };
        if (emailBuilderReducer?.templateCategories?.length) {
            setCategoriesData([myTemplateCategory, ...emailBuilderReducer?.templateCategories]);
            return;
        }
        const res = await categoriesLoader.refetch({
            fetcher: ({ payload: p } = {}) => dispatch(templateCategoryListApi_AI(p)),
            mode: 'create',
            loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
            params: { payload },
        });
        const { status, data } = res || {};
        if (status) {
            if (dataCatageory === 'My template' || dataCatageory === 'All template') {
                setCategoriesData([myTemplateCategory, ...data]);
            } else {
                setCategoriesData(data);
            }
        } else {
            setCategoriesData([]);
        }
    };
    const onSelect = (value) => {
        let channelId = isNotification === 'Web' ? 8 : isNotification === 'Mobile' ? 14 : 1;
        fetchTemplateById(value, channelId);
    };

    const handleTabData = () => {
        const currentTabData = tabData(
            isNotification,
            setPayload,
            payload,
            categoriesData,
            userId,
            handleCategories,
            onSelect,
            channelId,
            isSplit,
            fieldName,
            categoriesLoader.isLoading,
        );
        if (isNotification === 'Web' || isNotification === 'Mobile') {
            // Enable Template tab (id:2) only for In-page overlay delivery type (id === 4)
            const dt = getValues('deliveryType');
            const isOverlay = dt?.id === 4 || dt?.value === 'In-page overlay';
            return isOverlay ? currentTabData : currentTabData?.filter((tab) => tab?.id !== 2);
        }

        return currentTabData;
    };

    const fetchTemplateById = async (templateId, channelId) => {
        const payloadFetch = {
            templateId: templateId,
            channelId: channelId,
            departmentId,
            clientId,
            userId,
        };

        const res = await dispatch(getTemplate_AIEmail_byId(payloadFetch));
        const tabErrorField = isSplit ? `${fieldName}.tabErrorText` : 'tabErrorText';
        clearErrors(tabErrorField);
        if (res?.status && res?.data?.HTML) {
            // Check if is5.0 is false AND it's email builder (not Web or Mobile push)
            // Only apply this logic for email builder
            if (res?.data?.['is5.0'] === false && isNotification !== 'Web' && isNotification !== 'Mobile') {
                // Get form state for SaveEmailCommunication
                let formState = getValues();

                // Validate form fields (similar to edit flow)
                if ((!formState.audience || formState.audience?.length === 0) && locationState?.campaignType === 'S') {
                    setError('audience', {
                        type: 'custom',
                        message: 'Selected audience bunch empty. Please add audience or select other bunch',
                    });
                    setFocus('audience');
                    return;
                } else if (
                    (!formState.subjectLine || formState.subjectLine.trim() === '') &&
                    isNotification !== 'Web' &&
                    isNotification !== 'Mobile'
                ) {
                    setError('subjectLine', {
                        type: 'custom',
                        message: 'Enter subject line',
                    });
                    setFocus('subjectLine');
                    return;
                } else if ((!!formState?.domain || !formState.domain?.length === 0) && isNotification === 'Web') {
                    setError('domain', {
                        type: 'custom',
                        message: 'Select domain',
                    });
                    setFocus('domain');
                    return;
                } else if (
                    (!!formState?.layoutPosition || !formState?.layoutPosition?.length === 0) &&
                    (isNotification === 'Web' || isNotification === 'Mobile')
                ) {
                    setError('layoutPosition', {
                        type: 'custom',
                        message: 'Select layout',
                    });
                    setFocus('layoutPosition');
                    return;
                }

                // Build form state for SaveEmailCommunication
                const splitTabListFromFormSave = getValues('splitTabList');
                const resolvedSplitTabListSave =
                    Array.isArray(splitTabListFromFormSave) && splitTabListFromFormSave.length > 0
                        ? splitTabListFromFormSave
                        : ['splitA', 'splitB'];
                formState = {
                    ...campaignDetails,
                    ...formState,
                    ...campaign,
                    splitABCount: 0,
                    splitTabList: resolvedSplitTabListSave,
                    isSendTestMail: 0,
                    clientId,
                    userId,
                    departmentId,
                    campaignId: locationState?.campaignId,
                    ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
                };

                // Build payload
                let payload = buildPayload(formState, '', 'template', locationState);

                // Call SaveEmailCommunication
                const {
                    status,
                    data,
                    message = 'No data available',
                } = await dispatch(
                    resolvePausedEtSaveEmailThunk({
                        payload,
                        savedChannelsId,
                        campaignDetails,
                        locationState,
                    }),
                );

                if (status) {
                    // Update location state with channelDetailId for fromEnvi
                    const channelIdToSave = 1;
                    const updatedSavedChannelsId = { ...(locationState.savedChannelsId || savedChannelsId) };
                    if (!updatedSavedChannelsId[channelIdToSave]?.includes(channelIdToSave)) {
                        updatedSavedChannelsId[channelIdToSave] = [...(updatedSavedChannelsId[channelIdToSave] || []), channelIdToSave];
                    }

                    let locationEnvi =
                        locationState.campaignType === 'M'
                            ? {
                                ...locationState,
                                savedChannelsId: updatedSavedChannelsId,
                                mdcContentSetupDetails: {
                                    ...locationState.mdcContentSetupDetails,
                                    channelDetailId: edmChannelId || 0,
                                },
                            }
                            : {
                                ...locationState,
                                savedChannelsId: updatedSavedChannelsId,
                                channelDetailId: edmChannelId || 0,
                            };
                    locationEnvi = `?q=${encodeUrl(locationEnvi)}&channelId=1&templateId=${templateId}`;

                    // Fetch template data for navigation
                    const payloadTemplate = {
                        templateId: templateId,
                        channelId: 1,
                        departmentId,
                        clientId,
                        userId,
                    };
                    let templateData = await dispatch(getTemplate_AIEmail_byId(payloadTemplate));

                    if (templateData?.status) {
                        const stateAIBuilder = {
                            data: templateData?.data?.JsonContent,
                            templateId: templateId,
                            mode: 'edit',
                            templateName: templateData?.data?.TemplateName,
                            campaignName: locationState?.campaignName,
                            CampaignDate: locationState?.startDate + ' - ' + locationState?.endDate,
                            templateType: locationState?.communicationType || 'Promotion',
                            from: 'Communication',
                            templateDate: templateData?.data?.CreatedDate,
                            campaignId: locationState?.campaignId || 0,
                            channelId: 1,
                            channelDetailId: edmChannelId || 0,
                            edmChannelId: edmChannelId || 0,
                            fromEnvi: locationEnvi,
                            templateCategoryType: categoriesData?.filter(
                                (e) => e.templateCategoryId === templateData?.TemplateCategoryID,
                            )[0] || {
                                categoryName: 'Business',
                                templateCategoryId: 2,
                            },
                            campaignType: locationState.campaignType,
                            is5_0: res?.data?.['is5.0'], // Pass is5.0 flag
                            activeSplitName: isSplit ? currentSplitName(getValues('currentSplitTab')) : '',
                            ...getSavedPushChannelFlagPayload(isNotification)
                        };

                        const encryptState = encodeUrl(stateAIBuilder);
                        navigate(
                            `/preferences/template-gallery/email-builder?q=${encryptState}&mode=${stateAIBuilder.mode}`,
                            {
                                state: stateAIBuilder,
                            },
                        );
                    }
                } else {
                    dispatch(
                        update_failures_API_Errors({
                            field: 'SaveEmailCampaign',
                            message: message || 'No data available',
                        }),
                    );
                }
            } else {
                // For is5.0 === true OR Web/Mobile push, work like current code
                setTemplateId(templateId);
                setValue(contentTypeName, 'T');
                setValue(templateContentName, res?.data?.HTML);
                // setValue('edmContent', res?.data?.HTML);
                setValue(templateIDName, templateId);
                handleFileInputChange(res?.data?.HTML);
            }
        }
    };

    return (
        <div className="form-group mb0 mt30">
            <>
                {(isNotification === 'Web' || isNotification === 'Mobile') && templateContent?.length > 0 ? (
                    <div>
                        <span className="d-flex justify-content-end mr65 my15">
                            <RSTooltip text="Edit">
                                <i
                                    onClick={async () => {
                                        // Save the push notification before navigating to the builder
                                        const formState = getValues();
                                        const timeZoneId = locationState?.timeZoneId || 0;
                                        const mobileApp = watch('mobileApp') || {};

                                        let payload =
                                            isNotification === 'Web'
                                                ? buildWebNotificationPayload(formState, 'web', timeZoneId, '')
                                                : buildMobileNotificationPayload(formState, timeZoneId, mobileApp);

                                        const payloadSubmit = {
                                            clientId,
                                            departmentId,
                                            userId,
                                            createdBy: userId,
                                            campaignId: locationState?.campaignId,
                                            campaignType: locationState?.campaignType,
                                            edmGuid: !!notification[isNotification.toLowerCase()]?.edmGuid
                                                ? notification[isNotification.toLowerCase()]?.edmGuid
                                                : '',
                                            campaignGuid: !!notification[isNotification.toLowerCase()]?.campaignGuId
                                                ? notification[isNotification.toLowerCase()]?.campaignGuId
                                                : '',
                                            audienceCount:
                                                formState?.audience &&
                                                formState?.audience?.reduce(
                                                    (prev, cur) =>
                                                        Number(prev) +
                                                        Number(
                                                            isNotification === 'Mobile'
                                                                ? cur.recipientCountMobilePush
                                                                : cur.recipientCountWebPush,
                                                        ),
                                                    0,
                                                ),
                                            ...payload,
                                        };

                                        let dispatchName = isNotification === 'Web' ? saveWebPush : saveMobilePush;

                                        const { status, data } = await dispatch(
                                            dispatchName({ payload: payloadSubmit, savedChannelsId }),
                                        );

                                        if (status) {
                                            const token = localStorage.getItem('accessToken');
                                            const jwtToken = localStorage.getItem('jwtToken');
                                            const apiBaseURL = baseURL;

                                            let channelId = isNotification === 'Web' ? 8 : 14;
                                            let buildertype = isNotification === 'Web' ? 'webPush' : 'mobilePush';

                                            const isMdcFlow =
                                                window.location.pathname.includes(
                                                    '/communication/create-mdc-communication',
                                                ) || locationState?.campaignType === 'M';
                                            let returnPath = isMdcFlow
                                                ? `communication/create-mdc-communication`
                                                : `communication/create-communication`;
                                            let currentChannelDetailId =
                                                (isNotification === 'Web'
                                                    ? WebPushNotifyChannelDetailID
                                                    : isNotification === 'Mobile'
                                                        ? MobilePushNotifyChannelDetailID
                                                        : edmChannelId) || 0;

                                            let updatedLocationState = {
                                                ...(locationState?.campaignType === 'M'
                                                    ? {
                                                        ...locationState,
                                                        mdcContentSetupDetails: {
                                                            ...locationState.mdcContentSetupDetails,
                                                            channelDetailId: currentChannelDetailId,
                                                        },
                                                    }
                                                    : {
                                                        ...locationState,
                                                        channelDetailId: currentChannelDetailId,
                                                    }),
                                                currentIndex: channelId == 8 ? 0 : 1,
                                                activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
                                                templateId: templateId || getValues(templateIDName) || 0,
                                                templateChannelId: channelId,
                                                ...getSavedPushChannelFlagPayload(isNotification)
                                            };

                                            let fromUrl =
                                                window.location.origin +
                                                '/' +
                                                returnPath +
                                                `?q=${encodeUrl(updatedLocationState)}` +
                                                `&hId=2&channelId=${channelId}&typeId=2&templateId=${templateId || 0}`;

                                            const templateName = campaignDetails?.content?.[0]?.templateName || '';
                                            const templateDate = campaignDetails?.content?.[0]?.createdDate || '';
                                            const templateCategory =
                                                campaignDetails?.content?.[0]?.templateCategoryName || '';

                                            const channelDetails = JSON.stringify({
                                                campaignId: locationState?.campaignId || 0,
                                                templateId: templateId || 0,
                                                channelId: channelId,
                                                segList: payloadSubmit?.audienceCount || 0,
                                                name: templateName,
                                                templateName: templateName,
                                                SplitType: isSplit ? fieldName.replace('split', '') : '',
                                                channelDetailId: currentChannelDetailId,
                                                departmentId,
                                                clientId,
                                                userId,
                                                edmChannelId: edmChannelId || 0,
                                                templateDate: templateDate,
                                                templateCategory: templateCategory,
                                                activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
                                                ...getSavedPushChannelFlagPayload(isNotification)
                                            });

                                            window.location.href = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
                                                token,
                                            )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(
                                                clientId,
                                            )}&userId=${encodeURIComponent(userId)}&departmentId=${encodeURIComponent(
                                                departmentId,
                                            )}&templateId=${templateId}&mode=edit&jwtToken=${encodeURIComponent(
                                                jwtToken || '',
                                            )}&baseURL=${encodeURIComponent(apiBaseURL)}&from=${encodeURIComponent(
                                                fromUrl,
                                            )}&builderType=${buildertype}&tname=${encodeURIComponent(
                                                templateName,
                                            )}&tdate=${encodeURIComponent(templateDate)}&tcategory=${encodeURIComponent(
                                                templateCategory,
                                            )}`;
                                        }
                                    }}
                                    className={`${pencil_edit_medium} icon-md color-primary-blue mt-5`}
                                    id="rs_TableAttributes_penciledit"
                                ></i>
                            </RSTooltip>
                            {/* <label style={{ backgroundColor: 'orange', color: "white", margin: 10 }} >
                        E
                    </label> */}
                            <RSTooltip text="Reset" className="ml15">
                                <i
                                    onClick={() => {
                                        setValue(templateContentName, '');
                                        setValue(templateIDName, 0);
                                        setValue(edmContentName, '');
                                        removeQueryParams(['channelId', 'templateId']);
                                    }}
                                    className={`${restart_medium} icon-md color-primary-blue mt-5`}
                                    id="rs_TableAttributes_penciledit"
                                ></i>
                            </RSTooltip>
                            {/* <label style={{ backgroundColor: 'orange', color: "white", margin: 10 }} onClick={() => {
                        setValue('templateContent', '')
                    }}>
                        X
                    </label> */}
                        </span>
                        <div
                            id="template"
                            className={`${edmContent?.length > 0 ? 'edm-import-wrapper EDM-template-preview' : ''}`}
                        ></div>
                    </div>
                ) : (
                    <>
                        <span
                            className={`${(getValues(contentTypeName) === 'T' && edmContent?.length > 0) ||
                                templateContent?.length > 0
                                ? 'd-none'
                                : ''
                                }`}
                        >
                            <RSTabbar
                                dynamicTab={`res-tabs-2 row rs-tabs-auto-width email-rs-tab ai-email-tab-tab form-group`}
                                activeClass={'active'}
                                tabData={handleTabData()}
                                defaultClass={`col-sm-3`}
                                callBack={handleTemplate}
                            />
                        </span>
                        {showBrowerText && (edmContent?.length > 0 || templateContent?.length > 0) && (
                            <div className="form-group mt30">
                                <Row>
                                    <Col sm={3} className="ml15" style={{ width: '20%' }}>
                                        <label className="control-label-left">
                                            {INBOX_FIRST_LINE_PREVIEW}
                                        </label>
                                    </Col>
                                    <Col sm={6} style={{ width: '540px' }} className={`position-relative ${isClickOff ? 'pe-none click-off' : ''}`}>
                                        <RSEmojiPickerInput
                                            inputName={inboxLinePreviewName}
                                            placeholder={INBOX_FIRST_LINE_MESSAGE}
                                            maxLength={MAX_LENGTH150}
                                            required={false}
                                            iconTopspace={false}
                                            isEmoji={false}
                                        />
                                        <small className="bottom5 position-absolute right15">
                                            {RES_75_CHARACTERS}
                                        </small>
                                        {/* <RSTooltip
                                            position="top"
                                            text="Recommended: 75 characters"
                                            className="lh0 float-end mt2"
                                        >
                                            <i
                                                className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                id="circle_question_mark"
                                            ></i>
                                        </RSTooltip> */}
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {showBrowerText && (edmContent?.length > 0 || templateContent?.length > 0) && (
                            <div
                                className={`d-flex ${viewInBrowser ? 'justify-content-end align-items-center' : 'justify-content-end'
                                    } my15`}
                            >
                                {viewInBrowser && (
                                    <small className="text-left smaller mr90 pe-none">
                                        {EMAIL_NOT_DISPLAYING}{' '}
                                        <a href="{{#VIB}}" onClick={(e) => e.preventDefault()}>
                                            {VIEW_IN_BROWSER}
                                        </a>
                                    </small>
                                )}

                                <ul className="rs-list-inline rli-space-10">
                                    <li>
                                        <RSCheckbox
                                            control={control}
                                            name={viewInbrowserName}
                                            labelName={ADD_VIEW_IN_BROWSER}
                                            disabled={isClickOff}
                                        />
                                    </li>
                                    <li className="position-relative ml0 top3">
                                        <RSTooltip text={'Spam score'} className="lh0">
                                            {spamScoreLoader.isLoading ? (
                                                <span className="d-inline-flex align-items-center justify-content-center">
                                                    <span className="segment_loader"></span>
                                                </span>
                                            ) : (
                                                <i
                                                    className={`${spam_assassin_medium}   icon-md color-primary-blue cp`}
                                                    onClick={() => {
                                                        UpdateState(setState, 'SpamScoreModal', true);
                                                    }}
                                                ></i>
                                            )}
                                        </RSTooltip>
                                    </li>
                                    {/* <li className="position-relative top3">
                                    <RSTooltip text={'Litmus Preview template'} className="lh0">
                                        {' '}
                                        <i
                                            className={`${email_preview_medium} icon-md color-primary-blue cp click-off`}
                                        />
                                    </RSTooltip>
                                </li> */}
                                    <li className="position-relative top3">
                                        <RSTooltip
                                            text={'Edit template'}
                                            className={`lh0 ${isClickOff
                                                ? 'pe-none click-off'
                                                : ''
                                                }`}
                                        >
                                            <i
                                                className={`${form_edit_medium}   icon-md color-primary-blue cp`}
                                                onClick={() => {
                                                    handleDirect(categoriesData);
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {hasAmp && (
                            <div className="d-flex justify-content-center mb-3">
                                <div className="amp-preview-toggle-wrapper">
                                    <button
                                        type="button"
                                        className={`amp-toggle-btn ${previewMode === 'amp' ? 'active' : ''}`}
                                        onClick={() => setPreviewMode('amp')}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{ marginRight: '6px' }}
                                        >
                                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                        </svg>
                                        AMP HTML
                                    </button>
                                    <button
                                        type="button"
                                        className={`amp-toggle-btn ${previewMode === 'html' ? 'active' : ''}`}
                                        onClick={() => setPreviewMode('html')}
                                    >
                                        Fallback
                                    </button>
                                </div>
                                <style>
                                    {`
                                    .amp-preview-toggle-wrapper {
                                        display: inline-flex;
                                        background: #fff;
                                        border-radius: 8px;
                                        border: 1px solid #d1d5db;
                                        overflow: hidden;
                                        margin-bottom: 10px;
                                    }
                                    .amp-toggle-btn {
                                        border: none;
                                        background: transparent;
                                        padding: 8px 18px;
                                        font-size: 14px;
                                        font-weight: 500;
                                        color: #1f2937;
                                        cursor: pointer;
                                        transition: all 0.15s;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                    }
                                    .amp-toggle-btn.active {
                                        background: #0000FF;
                                        color: #fff;
                                    }
                                    .amp-toggle-btn:not(.active):hover {
                                        background: #f9fafb;
                                    }
                                    `}
                                </style>
                            </div>
                        )}

                        <div
                            id="template"
                            className={`${edmContent?.length > 0 || templateContent?.length > 0
                                ? 'edm-import-wrapper EDM-template-preview'
                                : ''
                                }`}
                        ></div>
                        {state?.SpamScoreModal && <SpamScoreModal {...spamScoreModalProps} />}
                    </>
                )}
            </>
        </div>
    );
};

export default Template;
