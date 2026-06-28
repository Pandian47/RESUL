import { isURLValid } from 'Utils/modules/dateTime';
import { ACCEPTS_JPEG_PNG_FORMATS, CANCEL, COMMUNICATION_TEXT, COMMUNICATION_URL, DOUBLE_OPT_IN_STATEMENT, FACEBOOK_APP_URL, GENERATE, GENERATE_QR_THAN_SAVE, IGNORE_CHANNEL, KNOW_YOUR_CUSTOMER, MESSAGE, MOBILE_NUMBER, NEXT, OK, POTENTIAL_AUDIENCE_REACH, POTENTIAL_AUDIENCE_REACH_TOOLTIP, REDIRECTION_URL, SAVE, SELECT_KYC, SEND_MAIL_TO, SUBJECT_LINE, TWEET_TEXT, UPLOAD_LOGO, URL_COMMUNICATION_TEXT, URL_REDIRECTION_TEXT, USER_EMAIL_MOBILE } from 'Constants/GlobalConstant/Placeholders';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { getStrContent, getUpdateTab, isBase64, QR_INITIAL_DATA } from './constant';
import { EMAIL_REGEX, HTTPS_REGEX, WEBSITE_REGEX, WEBURL_REGEX } from 'Constants/GlobalConstant/Regex';
import { COMMUNICATION_DESCRIPTION, ENTER_AUDIENCE_REACH_NUMBER, ENTER_EDITOR_TEXT, ENTER_EMAIL_ID, ENTER_EMAIL_MESSAGE, ENTER_SUBJECT_LINE, ENTER_TWEET_TEXT, ENTER_URL, ENTER_VALID_EMAIL, ENTER_VALID_URL, REDIRECTION_URL as REDIRECTION_URL_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_question_mark_medium, circle_question_mark_mini, eye_large, restart_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import _isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSPPophover from 'Components/RSPPophover';
import TextEditor from 'Components/TextEditor';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import QRGenrated from './Components/QRGenerator/QRGenerated';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import AuthoringChannelEditSkeletonGate, {
    AUTHORING_EDIT_API_LOADER_CONFIG,
    AUTHORING_FIELD_LOADER_CONFIG,
    getAuthoringEditApiLoaderConfig,
    getAuthoringSaveButtonType,
    useAuthoringChannelEditLoader,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';
import RSTooltip from 'Components/RSTooltip';

import { availableTabs, communicationChannels, getPreCampaignStatus, handleAllChannelPayload, QR_TAB_CONFIG } from '../../constant';
import { encodeUrl } from 'Utils/modules/crypto';
import { onlyNumbers } from 'Utils/modules/inputValidators';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    updateQr,
    updateVerticalTab,
    updateTab,
    updateDirtyState,
    resetCreateCommunication,
    updateQREnableTab,
} from 'Reducers/communication/createCommunication/Create/reducer';
import {
    getQRCodeCampaign,
    getQRCodeDownloadURL,
    getRecipientFormByFormId,
    getRecipientFormsCampaign,
    updateQRCode,
    uploadImageQR,
} from 'Reducers/communication/createCommunication/Create/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { validateWebsite } from 'Reducers/login/newUser/request';
import { useNavigate } from 'react-router-dom';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import SmartLinkEnable from '../../Component/SmartLinkEnable/SmartLinkEnable';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { IsValidURL } from 'Utils/HookFormValidate';
import QRPreview from './Components/QRPreview';

import { updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';

const QRContent = ({ tab }) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    // console.log('location: ', location);
    const {
        qr,
        tabsState: { qr: qrTabState },
        activeTabs,
        verticalTab: { type: channelType, currentTab },
        isDirty,
        personalization,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    // const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const smartLink = useSelector((state) => getGeneratedLink(state));
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const methods = useForm(QR_INITIAL_DATA);
    const navigate = useNavigate('/communication');
    const {
        control,
        watch,
        handleSubmit,
        setValue,
        clearErrors,
        setError,
        reset,
        resetField,
        getValues,
        trigger,
        getFieldState,
        formState: { dirtyFields, errors, isValid },
    } = methods;

    const editCallRef = useRef({
        currentTab: tab,
        callStatus: false
    })
    const [fileName, setFileName] = useState('');
    const [preview, setPreview] = useState(false);
    const [URL, setURL] = useState('');
    const [URLQR, setURLQR] = useState('');
    const [cmnURLSML, setcmnURLSML] = useState('');
    const [isGenerate, setisGenerate] = useState(true);
    const [isTextInvalid, setTextInvalid] = useState(false);
    const [isSmartLink, setIsSmartLink] = useState(false);
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [qrGenerate, setqrGenerate] = useState('');
    const [campaignType, setCampaignType] = useState('');
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [alertGenerate, setalertGenerate] = useState(false);
    const websiteError = Object.hasOwn(errors, 'redirection_url');
    const [QwebURL, setQwebURL] = useState('');
    const [audienceReach, setAudienceReach] = useState('');
    const [isQRFail, setIsQRFail] = useState(false);
    const qrCampaignLoader = useApiLoader();
    const kycListLoader = useApiLoader();
    const kycPreviewLoader = useApiLoader();
    const smartUrlDetailLoader = useApiLoader();
    const [previewContent, setPreviewContent] = useState({
        backgroundColor: '#ffffff',
        dropAbleData: [],
        previewTempData: [],
        formState: {
            layout: 'form-theme-default',
            profilingToggle: false,
            Submit: { buttonText: 'Submit', buttonColor: '#28a745' },
            CancelView: { isCancel: false, buttonText: 'Cancel' },
            previewData: { enableCaptchaCheckbox: false },
        },
        isCaptchaEnabled: false,
    });
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const communicationurlError = Object.hasOwn(errors, 'communicationurl');
    // const [utmModal, setUtmModal] = useState(false);
    const dirty = { ...dirtyFields };
    const { showEditSkeleton, isSavedChannel, runEditFetch, resetEditLoading } = useAuthoringChannelEditLoader({
        channelId: 3,
        subChannelId: 3,
    });
    const savedChannel = isSavedChannel;
    const editFieldLoaderConfig = getAuthoringEditApiLoaderConfig(savedChannel);
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();

    const [
        range,
        logo,
        kyc,
        kycType,
        qrShow,
        editorContent,
        paramsLink,
        short_url,
        download_pdf,
        download_img,
        communicationurl,
        mobile_number,
        message,
        qrchannelType,
    ] = watch([
        'range',
        'logo',
        'kyc',
        'kycType',
        'qrShow',
        'editorContent',
        'paramsLink',
        'short_url',
        'download_pdf',
        'download_img',
        'communicationurl',
        'mobile_number',
        'message',
        'qrchannelType',
    ]);
    // console.log("logo",logo)
    // console.log("fileName",fileName)
    // console.log('paramsLink: ', paramsLink);
    const smartLinkData = useSelector((state) => getGeneratedLink(state));
    const { smartLink1, smartLink2 } = smartLinkData;
    const { tabSmartLink_Flag, customFields, mobileApps, screenList, subScreenList } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );

    const getCommunicationLink = async () => {
        if (!!location?.campaignId) {
            const channelPayload = {
                departmentId: departmentId,
                userId: userId,
                clientId: clientId,
                blastType: '',
                campaignId: _get(location, 'campaignId', 0),
                channelId: 3, // need to change dynamically from enum
                goalNo: 1,
                blastNo: 1,
                parentChannelDetailId: 0,
                actionId: 0,
                subSegmentId: 0,
            };
            const { status, data = {} } =
                (await smartUrlDetailLoader.refetch({
                    fetcher: ({ payload: smartPayload } = {}) =>
                        dispatch(
                            getSmartUrlDetailByChannel({
                                payload: smartPayload,
                                failCheck: false,
                                loading: false,
                            }),
                        ),
                    mode: savedChannel ? 'edit' : 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload: channelPayload },
                })) || {};
                        if (status) {
                let { smartCode, blastSC, urlName } = data;
                if (!!smartCode && !!blastSC) {
                    setURL(urlName + smartCode + blastSC);
                    setValue('communicationurl', urlName + smartCode + blastSC);
                    if(!kyc){
                        setValue('paramsLink', urlName + smartCode + blastSC)
                    }
                    clearErrors('communicationurl');
                    setcmnURLSML(urlName + smartCode + blastSC);
                } else {
                    setURL(paramsLink);
                    setcmnURLSML(paramsLink);
                }
            }
            return data;
        }
    };

    useEffect(() => {
        // smartCode + blastSC
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId: _get(location, 'campaignId', 0) };
            const res = await dispatch(
                getSmartUrl({
                    payload,
                    listData: { mobileApps, personalization },
                    screenListObj: { screenList, subScreenList },
                    reduceLoad: true,
                }),
            );
            if (!res?.status) {
                setIsSmartLink(true);
                getCommunicationLink();
                dispatch(updateSmartLinkShow(false));
            } else {
                setIsSmartLink(false);
                dispatch(updateSmartLinkShow(true));
            }
        }

        if (!smartLink1 && !tabSmartLink_Flag) {
            if (location && _get(location, 'campaignId', 0) > 0) {
                // getSmartLink();
            }
        }
    }, [location, smartLink1]);

    useEffect(() => {
        if (!!smartLink1 && tabSmartLink_Flag && tab === 'url' && !savedChannel) {
            getCommunicationLink();
        }
    }, [smartLink1, tabSmartLink_Flag]);
    useEffect(() => {
        if (!isDirty && Object.keys(dirtyFields)?.length > 0) {
            dispatch(updateDirtyState(true));
        } else if (isDirty && Object.keys(dirtyFields)?.length === 0) {
            dispatch(updateDirtyState(false));
        }
    }, [dirty]);
    useEffect(() => {
        if (!_isEmpty(qr[tab])) {
            reset(qr[tab]);
        }
        // else {
        //     reset({
        //         ...qr[tab],
        //         domain: tab === 'url' ? paramsLink : '',
        //     });
        // }
    }, [tab]);
    useEffect(() => {
        if (location && Object.keys(location)?.length) {
            const campaignType = _get(location, 'campaignType', '');
            const channelDetailId = _get(location, 'mdcContentSetupDetails.channelDetailId', 0);
            setCampaignType(campaignType);
            setMdcChannelDetailId(channelDetailId);
        }
    }, [location]);
    const [kyc_disable, setKyc_disable] = useState(false);
    async function fetchData() {
        const loadQrEdit = async () => {
        let payload = {
            campaignId: _get(location, 'campaignId', 0),
            userId,
            clientId,
            departmentId,
        };
        let payload_getRecipient = {
            userId,
            clientId,
            departmentId,
        };
        const isFailCheck = savedChannel ? true : false;
        let qrcontent_channelDetail =
            (await qrCampaignLoader.refetch({
                fetcher: ({ payload: qrPayload } = {}) =>
                    dispatch(
                        getQRCodeCampaign({
                            payload: qrPayload,
                            failCheck: isFailCheck,
                            loading: false,
                        }),
                    ),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: AUTHORING_EDIT_API_LOADER_CONFIG,
                params: { payload },
            })) || {};
        let kyc_details =
            (await kycListLoader.refetch({
                fetcher: ({ payload: recipientPayload } = {}) =>
                    dispatch(getRecipientFormsCampaign({ payload: recipientPayload, loading: false })),
                mode: savedChannel ? 'edit' : 'create',
                loaderConfig: editFieldLoaderConfig,
                params: { payload: payload_getRecipient },
            })) || {};
        if (kyc_details?.status) setKyc_disable(false);
        else setKyc_disable(true);
        if (qrcontent_channelDetail?.status && !!Object.keys(qrcontent_channelDetail?.data)?.length) {
            let { qrCodeContent, qrChannelDetail } = qrcontent_channelDetail?.data;
            let getParse = qrCodeContent?.length && JSON?.parse(qrCodeContent[0]?.qrcodeContent);
            // await getUpdateTab(getParse, dispatch, updateTab, updateQREnableTab);
            let get_formId = kyc_details?.status
                ? kyc_details?.data?.find((e) => qrChannelDetail?.qrformId === e.formId && e)
                : { formId: 0, formName: 'Select KYC' };
            let imagePath = qrCodeContent[0]?.imagePath;
            let imageBase64 = qrCodeContent[0]?.imagePathEncode;
            let getFileName = imagePath?.substring(imagePath.lastIndexOf('/') + 1);
            setFileName(getFileName);
            if (getParse?.CommunicationURL?.length > 0) {
                setisGenerate(false);
            }
            setAudienceReach(qrCodeContent[0]?.qrrecipentCount);

            const getResetSatus = (tab) => {
                let isReset = false;
                switch (tab) {
                    case 'url':
                        Object.entries(getParse)?.forEach(([key, value]) => {
                            if (key === 'CommunicationURL' && !value) {
                                if (getParse['QRWebURL']) {
                                    return (isReset = true);
                                }
                            } else if (key === 'CommunicationURL' && !!value) {
                                return (isReset = true);
                            }
                        });
                        break;
                    case 'sms':
                        Object.entries(getParse)?.forEach(([key, value]) => {
                            if (key === 'MobileNumber' && !!value) {
                                isReset = true;
                            }
                        });
                        break;
                }
                return isReset;
            };
            const resetStatus = getResetSatus(tab);
            if (resetStatus) {
                //updateSmartLink();
                reset({
                    communicationurl: getParse?.CommunicationURL,
                    redirection_url: getParse?.RedirectionURL,
                    range: getParse?.Size,
                    kyc: getParse?.IsKycChecked,
                    IswebNameChecked: false,
                    IswebEmailIdChecked: false,
                    IswebMobileNoChecked: false,
                    IswebPostalCodeChecked: false,
                    statement: getParse?.DoubleOptIn,
                    kycType: get_formId,
                    paramsLink: getParse?.QRWebURL,
                    audience_reach: qrCodeContent[0]?.qrrecipentCount,
                    isEdit: true,
                    logo: imageBase64 || imagePath,
                    download_pdf: getParse?.DownloadPdf,
                    download_img: getParse?.DownloadImage,
                    short_url: getParse?.IsShortCode,
                    mobile_number: getParse?.MobileNumber,
                    message: getParse?.Message,
                    qrchannelType: qrCodeContent[0]?.qrType || '',
                });
            } else {
                if (tab === 'sms') {
                    reset();
                    setValue(paramsLink, getParse?.QRWebURL);
                    setValue('short_url', true);
                } else {
                    reset();
                    //updateSmartLink();
                }
            }
            setQwebURL(getParse?.QRWebURL);
            setValue('paramsLink', getParse?.QRWebURL);
            let checkSmartLink = tab === 'url' ? await getCommunicationLink() : {};
            let { smartCode, blastSC, urlName } = checkSmartLink;
            if (!!smartCode && !!blastSC && !!urlName) {
                setURL(urlName + smartCode + blastSC);
                setValue('communicationurl', urlName + smartCode + blastSC);
                setcmnURLSML(urlName + smartCode + blastSC);
            } else {
                setURL(getParse?.QRWebURL);
                setURLQR(getParse?.QRWebURL);
                tab === 'sms' && setcmnURLSML(getParse?.QRWebURL);
                //setValue('communicationurl', CommunicationURL);
            }
            if (!!getParse?.DownloadPdf && !!getParse?.DownloadPdf) setValue('qrShow', true);
            dispatch(
                updateQr({
                    data: imagePath || '',
                    field: 'uploadImg',
                }),
            );
            editCallRef.current = {
                callStatus: true,
                currentTab: tab
            }
        } else {
            setIsQRFail(isFailCheck);
        }
        };

        if (savedChannel) {
            await runEditFetch(loadQrEdit);
        } else {
            await loadQrEdit();
        }
    }
    useEffect(() => {
        setValue('qrShow', false);
    }, [fileName]);

    useEffect(() => {
        if (!!location?.campaignId && (editCallRef?.current?.currentTab !== tab || !editCallRef?.current?.callStatus)) fetchData();
    }, [location, tab]);

    const handleGenerate = async (formState) => {
        let { audience_reach, short_url, kyc } = getValues();

        let {
            url: { uploadImg, qrcodeCampaign },
        } = qr;

        const handleStrHmlData = async () => {
            if (formState?.logo) {
                return await qrGenerate;
            } else {
                const canvas = await document.getElementById('myQR');
                const response = await canvas?.toDataURL();
                return response?.split('data:image/png;base64,')[1];
            }
        };

        let payload = {
            strHtmlData: (await handleStrHmlData()) || '',
            recipientCount: Number(audience_reach),
            strContent: JSON.stringify(getStrContent(tab, getValues, smartLink1, QwebURL)) || '',
            strQRCodeContentId: qrcodeCampaign?.qrCodeContent[0]?.qrcodecontentId || 0,
            qrFormId: kycType?.formId || 0,
            imageurl: uploadImg || '',
            isshortcode: short_url,
            campaignId: _get(location, 'campaignId', 0),
            channelType: tab === 'sms' ? 'S' : 'W',
            userId,
            clientId,
            departmentId,
        };
        let res = await dispatch(getQRCodeDownloadURL({ payload }));
        if (res?.status) {
            let pdf = res?.data[0]?.includes('.pdf') ? 0 : 1;
            setValue('download_img', pdf === 1 ? res?.data[0] : res?.data[1]);
            setValue('download_pdf', res?.data[pdf]);
            setValue('qrShow', true);
            if (kyc) {
                setValue('paramsLink', QwebURL);
            } else {
                setValue('paramsLink', URL);
            }

            setisGenerate(false);
            dispatch(
                updateQREnableTab({
                    tabName: tab,
                    refreshStatus: true,
                }),
            );
        }
    };

    const handleSave = async () => {
        let res = await saveApi_calls(1, 'save');
        if (res) {
            navigate('/communication', {
                index: 0,
            });
        }
    };
    let {
        url: { isClear },
    } = qr;

    useEffect(() => {
        if (isClear) {
            if (!audienceReach) {
                const resetValues = {
                    ...QR_INITIAL_DATA?.defaultValues,
                };
                if (campaignType === 'M') {
                    delete resetValues?.kyc;
                }
                reset((prev) => ({
                    ...prev,
                    ...resetValues,
                }));
                setFileName('');
                setValue('message', '');
                dispatch(
                    updateQr({
                        field: 'isClear',
                        data: false,
                    }),
                );
                if (!!smartLink1) {
                    setValue('communicationurl', URL);
                }
                if (tab === 'sms') {
                    setValue('short_url', true);
                }
                //updateSmartLink();
            } else {
                fetchData();
                dispatch(
                    updateQr({
                        field: 'isClear',
                        data: false,
                    }),
                );
            }
        }
    }, [isClear]);
    const handleSaveChannelIds = () => {
        const finalSavedChannelId = { ...savedChannelsId };
        if (savedChannelsId[3]?.includes(3)) {
            finalSavedChannelId[3] = [...savedChannelsId[3]];
        } else {
            finalSavedChannelId[3] = [...(savedChannelsId[3] || []), 3];
        }
        dispatch(updateSaveChannelsId(finalSavedChannelId));
    };
    const saveApi_calls = async (mode = 1, submitType = 'form') => {
        let {
            url: { uploadImg, qrcodeCampaign },
        } = qr;
        let { audience_reach } = getValues();

        // let strContent = {
        //     CommunicationURL: communicationurl,
        //     RedirectionURL: redirection_url,
        //     Size: range,
        //     IsKycChecked: kyc,
        //     IswebNameChecked: false,
        //     IswebEmailIdChecked: false,
        //     IswebMobileNoChecked: false,
        //     IswebPostalCodeChecked: false,
        //     DoubleOptinstatement: statement,
        //     QRWebURL: paramsLink,
        //     IsShortCode: short_url,
        //     DownloadImage: download_img,
        //     DownloadPdf: download_pdf,
        // };

        let qrcodeContent = qr?.url?.qrcodeCampaign?.qrChannelDetail?.qrcodechanneldetailId;
        let imgpath = qr?.url?.qrcodeCampaign?.qrCodeContent[0]?.imagePath;
        let formState = getValues();
        let payload = {
            qrCodeContent: JSON.stringify(getStrContent(tab, getValues, smartLink1, QwebURL)),
            recipientCount: Number(audience_reach),
            qrMode: mode,
            qrCodeChannelDetailId: qrcodeContent,
            qrFormId: kycType?.formId,
            campaignId: _get(location, 'campaignId', 0),
            imagepath: imgpath,
            channelType: tab === 'sms' ? 'S' : 'W',
            ...handleAllChannelPayload('qr', formState),
        };
        let res = await runSave(getAuthoringSaveButtonType(submitType), () =>
            dispatch(updateQRCode({ payload, loading: false })),
        );
        if (res?.status) {
            await handleSaveChannelIds();
        }
        if (campaignType === 'M') {
            res?.status && handleMdcNavigation(res);
            return false;
        } else {
            return res?.status;
        }
    };
    const handleOnSubmit = async (formState, event) => {
        if (event === 'generate') return handleGenerate(formState);
        if (event === 'save') {
            if (formState?.download_img !== '' && formState?.download_pdf !== '') {
                setalertGenerate(false);
                return handleSave();
            } else {
                setNavigate_confirm(true);
                setalertGenerate(true);
                return;
            }
        }
        if (event === 'form') {
            if (formState?.download_img !== '' && formState?.download_pdf !== '') {
                setalertGenerate(false);
                const res = await saveApi_calls(1, 'form');
                res && handleNavigation();
            } else {
                setNavigate_confirm(true);
                setalertGenerate(true);
                return;
            }
        }

        // reset();
    };

    const getNextTabIndex = (currIndex) => {
        let updateTab = {
            tabName: 'url',
            index: 0,
        };
        const tabName = availableTabs['qr'][currIndex + 1];
        QR_TAB_CONFIG?.forEach((tabConf, index) => {
            if (tabConf.id === tabName) {
                updateTab['tabName'] = tabName;
                updateTab['index'] = index;
            }
        });
        return updateTab;
    };

    const handleNavigation = () => {
        window.scrollTo(0, 0);
        const tabIndex = availableTabs['qr']?.length;
        const { tabName, index } = getNextTabIndex(tabIndex);

        if (availableTabs['qr']?.length === tabIndex) {
            const nextChannel = communicationChannels.find(
                (chan, index) => channelType !== chan && Object.hasOwn(activeTabs, chan) && index > currentTab,
            );
            if (!!nextChannel) {
                dispatch(
                    updateVerticalTab({
                        tabs: activeTabs?.[nextChannel] || {
                            type: 'analytics',
                            currentTab: 7,
                        },
                    }),
                );
            } else {
                const status = getPreCampaignStatus(savedChannelsId);
                if (status) {
                    navigate('/communication', {
                        index: 0,
                    });
                } else {
                    let url = '/communication/execute';
                    const encryptState = encodeUrl(location);
                    dispatch(resetCreateCommunication());
                    navigate(`${url}?q=${encryptState}`, {
                        state: location,
                    });
                }
            }
        } else {
            dispatch(
                updateTab({
                    field: 'qr',
                    data: {
                        tabName: tabName,
                        currentIndex: index,
                    },
                }),
            );
        }
    };
    // method for uploding logo
    const handleLogoUpload = ({ target }) => {
        let file = target.files[0];
        // setFileName(file?.name);
        let imageFormat = file.name.substr(file.name.lastIndexOf('.') + 1);
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            if (reader.result) {
                const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
                let payload = {
                    userId,
                    clientId,
                    departmentId,
                    imageFormat,
                    base64String,
                };
                const res = await dispatch(uploadImageQR({ payload }));
                if (res?.status) {
                    let imagePath = res?.data;
                    let getFileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
                    setFileName(getFileName);
                } else {
                    setValue('qrShow', false);
                    setFileName('Choose file');
                    setValue('logo', '');
                    setError('logo', { type: 'custom', message: res.message });
                }
            } else {
            }
        };
        reader.onerror = (error) => {
        };
    };
    const handleMdcCancel = () => {
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location };
        delete state.mdcContentSetupDetails;

        const encryptState = encodeUrl(state);
        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
            state,
        });
    };

    const handleMdcNavigation = (res) => {
        const { data: channelResponseDetailId } = res;
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location, channelResponseDetailId, mode: `update` };
        const encryptState = encodeUrl(state);
        channelResponseDetailId &&
            navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                state,
            });
    };

    useEffect(() => {
        if (Object.keys(qr[tab])?.includes('getKYClistID')) {
            const { getKYClistID } = qr[tab];
            if (!!getKYClistID[0]?.htmlcodeclient) {
                const getParseData = JSON.parse(getKYClistID[0]?.htmlcodeclient);
                const defaultFormState = {
                    layout: 'form-theme-default',
                    profilingToggle: false,
                    Submit: { buttonText: 'Submit', buttonColor: '#28a745' },
                    CancelView: { isCancel: false, buttonText: 'Cancel' },
                    previewData: { enableCaptchaCheckbox: false },
                };
                setPreviewContent({
                    backgroundColor: getParseData?.selectedColor || '#ffffff',
                    dropAbleData: getParseData?.dropValue || [],
                    previewTempData: getParseData?.previewData || [],
                    formState: {
                        ...defaultFormState,
                        ...getParseData?.formState,
                        layout: getParseData?.formState?.layout || defaultFormState.layout,
                    },
                    isCaptchaEnabled: getKYClistID[0]?.isCaptchaenabled || false,
                });
            }
        }
    }, [qr, tab]);

    // console.log(kycType, 'sdhsd');
    const handleErrClose = () => {
        if (isQRFail) {
            if (campaignType === 'M') {
                handleMdcCancel();
            } else {
                navigate('/communication', {
                    index: 0,
                });
            }
        }
    };

    return (
        <FormProvider {...methods}>
            <AuthoringChannelEditSkeletonGate channelId={3} isLoading={showEditSkeleton && isSavedChannel}>
            <form
                onSubmit={handleSubmit((data) => handleOnSubmit(data))}
                className="rsv-tabs-content tab-content position-relative"
            >
                <div className="box-design bd-top-border mx0">
                    {!tabSmartLink_Flag && tabSmartLink_Flag !== null && (
                        <SmartLinkEnable
                            onSave={() => setIsSmartLink(false)}
                            onReject={() => {
                                dispatch(showTabsSmartlink(true));
                                setIsSmartLink(false);
                            }}
                            isQrClassNameEnable
                        />
                    )}
                    <div className="form-group">
                        <Row>
                            <div className="col-sm-9">
                                <div className="form-group">
                                    <Row className="mt20">
                                        <Col sm={{ span: 4 }}>
                                            <label className="control-label-left">
                                                {POTENTIAL_AUDIENCE_REACH}
                                            </label>
                                        </Col>
                                        <Col sm={7} className="pl0">
                                            <RSInput
                                                name={'audience_reach'}
                                                type="text"
                                                control={control}
                                                id="rs_QRContent_audiencereach"
                                                required
                                                placeholder={POTENTIAL_AUDIENCE_REACH}
                                                rules={{
                                                    required: ENTER_AUDIENCE_REACH_NUMBER,
                                                    validate: (val) => {
                                                        return val <= 0 ? 'Enter  valid aduience' : true;
                                                    },
                                                }}
                                                // handleOnBlur={(e) => setValue('audience_reach',  (e.target.value))}
                                                onKeyDown={onlyNumbers}
                                                maxLength={8}
                                            />
                                            <RSPPophover pophover={POTENTIAL_AUDIENCE_REACH_TOOLTIP}>
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue float-end mt2`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSPPophover>
                                        </Col>
                                        {/* <Col sm={1} className="fg-icons-wrapper pl0">
                                            <div className="fg-icons">
                                                <RSPPophover
                                                    pophover={
                                                        'Excepted audience reach is the number of audience in the area where QR code will be placed.'
                                                    }
                                                >
                                                    <i
                                                        className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                    ></i>
                                                </RSPPophover>
                                            </div>
                                        </Col> */}
                                    </Row>
                                </div>

                                {tab === 'url' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">
                                                    {COMMUNICATION_URL}
                                                </label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <RSInput
                                                    name={'communicationurl'}
                                                    id="rs_QRContent_CommunicationURL"
                                                    control={control}
                                                    required
                                                    className={`${!isGenerate ? 'click-off' : ''}`}
                                                    disabled={cmnURLSML?.length > 0}
                                                    isLoading={smartUrlDetailLoader.isLoading}
                                                    //  disabled={!!URL}
                                                    placeholder={COMMUNICATION_URL}
                                                    handleOnBlur={async ({ target: { value } }) => {
                                                        // console.log(communicationurlError, 'communicationurlError');
                                                        if (!communicationurlError) {
                                                            if (value?.length > 7) {
                                                                const { status } = await dispatch(
                                                                    validateWebsite({
                                                                        payload: { Website: value },
                                                                        setError,
                                                                        name: `communicationurl`,
                                                                    }),
                                                                );
                                                                if (status) {
                                                                    clearErrors(`communicationurl`);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    rules={{
                                                        required: ENTER_URL,
                                                        pattern:
                                                            cmnURLSML?.length > 0
                                                                ? {}
                                                                : {
                                                                      value: HTTPS_REGEX,
                                                                      message: ENTER_VALID_URL,
                                                                  },
                                                    }}
                                                />
                                                <RSPPophover pophover={URL_COMMUNICATION_TEXT}>
                                                    <i
                                                        className={`${circle_question_mark_mini} icon-xs color-primary-blue float-end mt2`}
                                                        id="circle_question_mark"
                                                    ></i>
                                                </RSPPophover>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                {tab === 'facebook' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">
                                                    {COMMUNICATION_URL}
                                                </label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <RSInput
                                                    name={'facebook_app_url'}
                                                    id="rs_QRContent_FacebookAppURL"
                                                    control={control}
                                                    required
                                                    placeholder={FACEBOOK_APP_URL}
                                                    rules={{
                                                        required: ENTER_URL,
                                                        pattern: {
                                                            value: WEBURL_REGEX,
                                                            message: ENTER_URL,
                                                        },
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                                {tab === 'twitter' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">{TWEET_TEXT}</label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <RSTextarea
                                                    control={control}
                                                    name={'tweet_text'}
                                                    required
                                                    placeholder={TWEET_TEXT}
                                                    rules={{ required: ENTER_TWEET_TEXT }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                                {tab === 'text' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">
                                                    {COMMUNICATION_TEXT}
                                                </label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <Row>
                                                    <Row>
                                                        {isTextInvalid && (
                                                            <span className="color-primary-red">
                                                                {COMMUNICATION_DESCRIPTION}
                                                            </span>
                                                        )}
                                                    </Row>
                                                    <TextEditor
                                                        content={editorContent}
                                                        onFocus={() => {
                                                            if (isTextInvalid) setTextInvalid(false);
                                                        }}
                                                        onBlurHandler={(e) => {
                                                            setValue('editorContent', e);
                                                        }}
                                                    />
                                                </Row>
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                                {tab === 'sms' && (
                                    <>
                                        <div className="form-group">
                                            <Row>
                                                <Col sm={{ span: 4 }}>
                                                    <label className="control-label-left">
                                                        {MOBILE_NUMBER}
                                                    </label>
                                                </Col>
                                                <Col sm={7} className="pl0">
                                                    <RSPhoneInput
                                                        control={control}
                                                        name={'mobile_number'}
                                                        placeholder={MOBILE_NUMBER}
                                                        required
                                                        setError={setError}
                                                        clearErrors={clearErrors}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className="form-group mt60">
                                            <Row className="mb30">
                                                <Col sm={{ span: 4 }}>
                                                    <label className="control-label-left">{MESSAGE}</label>
                                                </Col>
                                                <Col sm={7} className="pl0 preference-modal">
                                                    <RSTextarea
                                                        control={control}
                                                        name={'message'}
                                                        required
                                                        placeholder={MESSAGE}
                                                        rules={{ required: ENTER_EDITOR_TEXT }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    </>
                                )}
                                {tab === 'email' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">
                                                    {SEND_MAIL_TO}
                                                </label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <RSInput
                                                    control={control}
                                                    required
                                                    name={'send_mail_to'}
                                                    placeholder={'Email ID'}
                                                    rules={{
                                                        required: ENTER_EMAIL_ID,
                                                        pattern: {
                                                            value: EMAIL_REGEX,
                                                            message: ENTER_VALID_EMAIL,
                                                        },
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb30">
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">
                                                    {SUBJECT_LINE}
                                                </label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <RSInput
                                                    control={control}
                                                    required
                                                    name={'subject_line'}
                                                    placeholder={SUBJECT_LINE}
                                                    rules={{
                                                        required: ENTER_SUBJECT_LINE,
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb30">
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">{MESSAGE}</label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <RSTextarea
                                                    control={control}
                                                    name={'message'}
                                                    required
                                                    placeholder={'Enter message'}
                                                    rules={{ required: ENTER_EMAIL_MESSAGE }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ span: 4 }}>
                                            <label className="control-label-left">{REDIRECTION_URL}</label>
                                        </Col>
                                        <Col sm={7} className="pl0">
                                            <RSInput
                                                name={'redirection_url'}
                                                control={control}
                                                id="rs_QRContent_RedirectionalURL"
                                                required
                                                placeholder={REDIRECTION_URL}
                                                handleOnBlur={async ({ target: { value } }) => {
                                                    const { invalid } = getFieldState('redirection_url');
                                                    if (!!value && !invalid) {
                                                        if (
                                                            !websiteError
                                                            //  || isURLValid(value)
                                                        ) {
                                                            const { status } = await dispatch(
                                                                validateWebsite({
                                                                    payload: { Website: value },
                                                                    setError,
                                                                    name: `redirection_url`,
                                                                }),
                                                            );
                                                            if (status) {
                                                                clearErrors(`redirection_url`);
                                                            }
                                                        } else {
                                                            setError(`redirection_url`, {
                                                                type: 'server',
                                                                message: REDIRECTION_URL_MSG,
                                                            });
                                                        }
                                                    }
                                                }}
                                                rules={{
                                                    required: REDIRECTION_URL_MSG,
                                                    validate: (value) => {
                                                        return IsValidURL(value);
                                                    },
                                                    // pattern: {
                                                    //     value: WEBSITE_REGEX,

                                                    //     // value: /(https:\/\/.|http:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
                                                    //     message: REDIRECTION_URL_MSG,
                                                    // },
                                                    // validate: () => (websiteError ? _get(errors, 'redirection_url.message') : true),
                                                }}
                                            />
                                            <RSPPophover pophover={URL_REDIRECTION_TEXT}>
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue float-end mt2`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSPPophover>
                                        </Col>
                                        {/* <Col sm={1} className="fg-icons-wrapper pl0">
                                            <div className="fg-icons">
                                                <RSPPophover
                                                    pophover={
                                                        'The user will be redirected to this URL if the QR code is scanned after the specified communication duration.'
                                                    }
                                                >
                                                    <i
                                                        className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                    ></i>
                                                </RSPPophover>
                                            </div>
                                        </Col> */}
                                    </Row>
                                </div>

                                {tab !== 'sms' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">{UPLOAD_LOGO}</label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <Row className={logo ? 'click-off' : ''}>
                                                    <RSFileUpload
                                                        name="logo"
                                                        accept={'.jpg,.png,.jpeg'}
                                                        control={control}
                                                        setError={setError}
                                                        clearErrors={clearErrors}
                                                        size={2097152}
                                                        handleChange={handleLogoUpload}
                                                        isbase64
                                                        placeholder={fileName}
                                                        id="rs_QRContent_logoUpload"
                                                        fileCol={9}
                                                        btnCol={3}
                                                        watch={watch}
                                                    />
                                                </Row>
                                                <Row>
                                                    <Col sm={12}>
                                                        <small className="small-text-space-top">
                                                            {ACCEPTS_JPEG_PNG_FORMATS}
                                                        </small>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            {logo && (
                                                <Col sm={1} className="pl0">
                                                    <div className="d-flex">
                                                        <RSTooltip text={'Reset image'}>
                                                            <i
                                                                id="rs_data_refresh"
                                                                className={`${restart_large} color-primary-blue icon-md`}
                                                                onClick={() => {
                                                                    setValue('qrShow', false);
                                                                    setFileName('');
                                                                    setValue('logo', '');
                                                                    //resetField('logo');
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                )}

                                {tab !== 'sms' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">
                                                    {KNOW_YOUR_CUSTOMER}
                                                </label>
                                            </Col>
                                            <Col
                                                sm={
                                                    tab === 'url'
                                                        ? kycType &&
                                                          kycType.formId !== 0 &&
                                                          kycType.formType !== 'Tell a friend'
                                                            ? 6
                                                            : 7
                                                        : 7
                                                }
                                                className={`pl0 ${kycType?.formName !== 'Default KYC' ? '' : ''} `}
                                            >
                                                <Row className={`${campaignType === 'M' ? 'pe-none click-off' : ''}`}>
                                                    <Col sm={3}>
                                                        <RSSwitch
                                                            control={control}
                                                            name="kyc"
                                                            handleChange={(e) => {
                                                                if (!e) {
                                                                    reset(
                                                                        (formState) => ({
                                                                            ...formState,
                                                                            kyc: false,
                                                                            // qrShow: false,
                                                                            email_check: false,
                                                                            mobile_number_check: false,
                                                                            kycType: '',
                                                                            statement: '',
                                                                            paramsLink: cmnURLSML || QwebURL,
                                                                        }),
                                                                        {
                                                                            keepDirty: true,
                                                                        },
                                                                    );
                                                                } else {
                                                                    setValue('paramsLink', QwebURL);
                                                                }
                                                            }}
                                                        />
                                                    </Col>
                                                    {kyc && (
                                                        <Col sm={9} className="pl0">
                                                            {tab !== 'url' && (
                                                                <div className="qr-kyc-sep">
                                                                    <Row>
                                                                        <Col sm={10} className="pr0">
                                                                            <span>
                                                                                {USER_EMAIL_MOBILE}
                                                                            </span>
                                                                        </Col>
                                                                        <Col className="pl0 position-relative top1">
                                                                            <RSTooltip
                                                                                text={'Preview'}
                                                                                className="d-inline-block "
                                                                            >
                                                                                <i
                                                                                    onClick={() => setPreview(!preview)}
                                                                                    className="icon-rs-eye-medium icon-md color-primary-blue"
                                                                                ></i>
                                                                            </RSTooltip>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        {tab !== 'email' && (
                                                                            <Col sm={4}>
                                                                                <RSCheckbox
                                                                                    control={control}
                                                                                    name="email_check"
                                                                                    labelName={'Email'}
                                                                                    defaultValue={true}
                                                                                />
                                                                            </Col>
                                                                        )}

                                                                        {tab !== 'sms' && (
                                                                            <Col sm={6}>
                                                                                <RSCheckbox
                                                                                    control={control}
                                                                                    name="mobile_number_check"
                                                                                    labelName={'Mobile Number'}
                                                                                />
                                                                            </Col>
                                                                        )}
                                                                    </Row>
                                                                </div>
                                                            )}
                                                        </Col>
                                                    )}
                                                </Row>
                                                {kyc && (
                                                    <>
                                                        {tab === 'url' && (
                                                            <Row>
                                                                <Col
                                                                    sm={12}
                                                                    className="mt41"
                                                                    // className={`${
                                                                    //     kycType?.formName !== 'Default KYC' ? '' : ''
                                                                    // } `}
                                                                >
                                                                    <div>
                                                                        <RSKendoDropDownList
                                                                            control={control}
                                                                            name={'kycType'}
                                                                            data={qr?.url?.getKYClist}
                                                                            textField={'formName'}
                                                                            dataItemKey={'formId'}
                                                                            label={SELECT_KYC}
                                                                            isLoading={kycListLoader.isLoading}
                                                                        />
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        )}
                                                    </>
                                                )}
                                            </Col>
                                            {kycType &&
                                                kycType?.formId !== 0 &&
                                                kycType?.formType !== 'Tell a friend' && (
                                                    <Col className="mt77 pr0" md={1}>
                                                        <RSTooltip text={'Preview'} className="lh0 text-center">
                                                            {kycPreviewLoader.isLoading ? (
                                                                <div className="segment_loader" />
                                                            ) : (
                                                                <i
                                                                    id="rs_data_eye"
                                                                    className={`${eye_large} color-primary-blue icon-md`}
                                                                    onClick={async () => {
                                                                        if (kycType?.formId) {
                                                                            let payload = {
                                                                                userId,
                                                                                clientId,
                                                                                departmentId,
                                                                                recipientFormId: kycType?.formId,
                                                                            };
                                                                            let tem =
                                                                                (await kycPreviewLoader.refetch({
                                                                                    fetcher: ({
                                                                                        payload: previewPayload,
                                                                                    } = {}) =>
                                                                                        dispatch(
                                                                                            getRecipientFormByFormId({
                                                                                                payload: previewPayload,
                                                                                                loading: false,
                                                                                            }),
                                                                                        ),
                                                                                    mode: savedChannel ? 'edit' : 'create',
                                                                                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                                                                                    params: { payload },
                                                                                })) || {};
                                                                            if (tem.status) {
                                                                                setPreview(!preview);
                                                                            }
                                                                        }
                                                                    }}
                                                                ></i>
                                                            )}
                                                        </RSTooltip>
                                                    </Col>
                                                )}
                                        </Row>
                                    </div>
                                )}

                                {kyc && tab !== 'sms' && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={{ span: 4 }}>
                                                <label className="control-label-left">
                                                    {DOUBLE_OPT_IN_STATEMENT}
                                                </label>
                                            </Col>
                                            <Col sm={7} className="pl0">
                                                <RSTextarea
                                                    control={control}
                                                    id="rs_QRContent_DoubleOptInStatement"
                                                    name="statement"
                                                    placeholder={DOUBLE_OPT_IN_STATEMENT}
                                                    multiLinePlaceholder
                                                />
                                            </Col>
                                            {/* <Col className="pl0 pt2">
                                                {' '}
                                                <RSPPophover
                                                    pophover={
                                                        'Check this box to receive product offers and updates from Company and to participate in this communication.'
                                                    }
                                                >
                                                    <i
                                                        className={`${circle_question_mark_medium} icon-md color-primary-blue lh0`}
                                                    ></i>
                                                </RSPPophover>
                                            </Col> */}
                                        </Row>
                                    </div>
                                )}
                                <div className="form-group">
                                    <Row>
                                        <Col sm={{ offset: 1, span: 10 }}>
                                            <div
                                                className={`buttons-holder mt0 ${
                                                    !!download_img && !!download_pdf ? 'click-offf' : ''
                                                }`}
                                            >
                                                <RSPrimaryButton
                                                    className="bg-secondary-blue rs-bg-secondary-blue"
                                                    type={'button'}
                                                    name="generate"
                                                    // className={(!isBase64(logo) || !logo || kyc_disable) && 'click-off'}
                                                    onClick={() => {
                                                        handleSubmit((data) =>
                                                            handleOnSubmit(data, 'generate', false),
                                                        )();
                                                    }}
                                                    id="rs_QRContent_Generate"
                                                >
                                                    {GENERATE}
                                                </RSPrimaryButton>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                {/* {preview && <PreviewModal preview={preview} setPreview={setPreview} />} */}

                                {/* QR specific preview component */}
                                <QRPreview
                                    show={preview}
                                    onHide={() => setPreview(false)}
                                    selectedColor={previewContent?.backgroundColor}
                                    dropAble={previewContent?.dropAbleData}
                                    previewTemp={previewContent?.previewTempData}
                                    previewFormstate={previewContent?.formState}
                                    isQrCaptcha={previewContent?.isCaptchaEnabled}
                                />
                            </div>
                            <div className="col-sm-3">
                                <QRGenrated
                                    range={range}
                                    show={qrShow}
                                    logo={logo || fileName}
                                    value={paramsLink}
                                    getBase_QR={async (e) => {
                                        const response = await e;
                                        await setqrGenerate(response?.split('data:image/png;base64,')[1] || '');
                                        await setValue('strHtmlData', response);
                                    }}
                                    short_url={short_url}
                                    download_pdf={download_pdf}
                                    download_img={download_img}
                                    cmnURL={URLQR}
                                    cmnsURLSML={cmnURLSML}
                                    tab={tab}
                                />
                            </div>
                        </Row>
                    </div>
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            if (campaignType === 'M') {
                                handleMdcCancel();
                            } else {
                                dispatch(resetCreateCommunication());
                                navigate('/communication', {
                                    replace: true,
                                    state: {
                                        index: 0,
                                    },
                                });
                            }
                        }}
                        id="rs_QRContent_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        className={'color-primary-blue'}
                        type="button"
                        onClick={() => {
                            handleSubmit((data) => handleOnSubmit(data, 'save', false))();
                        }}
                        id="rs_QRContent_Save"
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                    >
                        {SAVE}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        name="next"
                        isLoading={isNextLoading}
                        blockBodyPointerEvents
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                        onClick={() => {
                            if (!isDirty && !isValid && campaignType !== 'M') {
                                setNavigate_confirm(true);
                            } else {
                                handleSubmit((data) => handleOnSubmit(data, 'form', false))();
                            }
                        }}
                        id="rs_QRContent_Next"
                    >
                        {campaignType === 'M' && mdcChannelDetailId === 0
                            ? 'Create QR content'
                            : campaignType === 'M' && mdcChannelDetailId > 0
                            ? 'Update QR content'
                            : NEXT}
                    </RSPrimaryButton>
                </div>

                {/* <UTMModal show={utmModal} setUTMModal={setUtmModal} /> */}
            </form>
            <RSConfirmationModal
                show={navigate_confirm}
                text={alertGenerate ? GENERATE_QR_THAN_SAVE : IGNORE_CHANNEL}
                primaryButtonText={OK}
                handleClose={() => {
                    setNavigate_confirm(false);
                }}
                handleConfirm={() => {
                    {
                        !alertGenerate && handleNavigation();
                    }
                    setNavigate_confirm(false);
                }}
            />
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
            </AuthoringChannelEditSkeletonGate>
        </FormProvider>
    );
};

export default QRContent;
