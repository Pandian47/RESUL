import { encodeUrl } from 'Utils/modules/crypto';
import { isURLValid } from 'Utils/modules/dateTime';
import { UpdateState } from 'Utils/modules/misc';
import { createCommunicationSettingsNavState, MAIL_TAB_ID } from 'Utils/modules/navigation';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_EDITOR_TEXT, ENTER_TITLE_TEXT, ENTER_VALID_WEBSITE, REDIRECTION_URL as REDIRECTION_URL_MSG, SELECT_CHANNEL_TYPE, SELECT_COMMUNICATION_TYPE, SELECT_PRODUCT_TYPE, UPLOAD_COMPANY_IMAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADVANCED_SETTINGS, ALLOWED_FORMATS, CANCEL, CHANNEL_TYPE as CHANNEL_TYPE_PH, COMMUNICATIONTYPE, FARWELL_MAIL, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, FILE_SIZE500KB, INTREST_TYPE, MESSAGE, PREVIEW, PRODUCTType, REASON_TYPE, REDIRECTION_URL, SAVE, TERMSCONDITIONS, TITLE, UPDATE, UPTO_500_CHARACTERS, WELCOME_MAIL, YOUR_COMMAND } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_pencil_medium, circle_plus_fill_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Row, Container, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import _find from 'lodash/find';
import _map from 'lodash/map';
import { useDispatch, useSelector, useStore } from 'react-redux';


import usePermission from 'Hooks/usePersmission';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSInput from 'Components/FormFields/RSInput';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSSwicth from 'Components/FormFields/RSSwitch';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSPageHeader from 'Components/RSPageHeader';
import ImageCropModal from 'Components/ImageCropModal';
import { Building } from 'Assets/Images';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    SUB_STATE,
    CHANNEL_TYPE,
    INITIAL_STATE,
    constructAPIPayload,
    Subscription_title,
    Unsubscription_title,
    EditorURL,
    getSubscriptionAdvanceDescription,
    Unsubscription_Advance_Description,
    Unsubscription_Description,
    Subscription_Description,
} from '../../../constants';
import MailContent from './Components/MailContent';
import SucessContent from './Components/SucessMessage/SucessContent';
import PreviewContent from './Components/PreviewContent';
import RSKendoTextEditor from 'Components/FormFields/RSKendoTextEditor';
import { validateWebsite } from 'Reducers/login/newUser/request.js';
import { ensureCommunicationPlanDropdowns } from 'Pages/AuthenticationModule/Communication/CommunicationLists/loadCommunicationListingFilterOptions';
import { getGlobalClientList, getSessionId } from 'Reducers/globalState/selector';
import SaveModal from './Components/SaveModal/SaveModal';
import {
    getSubscribeEditData,
    getUnSubscribeEditData,
    saveSubscription,
    saveUnSubscription,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getCSSubscribeEditData } from 'Reducers/preferences/CommunicationSettings/selector';
import RSModal from 'Components/RSModal';
import { BODYCONFIG } from 'Pages/AuthenticationModule/Preferences/Pages/FormGenerator/constant';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import useQueryParams from 'Hooks/useQueryParams';
import RSTooltip from 'Components/RSTooltip';
import RSTabber from 'Components/RSTabber';
import { maskEmailTwoCharsBeforeAndAfterDomain } from 'Utils/modules/masking';
import { CommunicationSubscriptionEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const PARENT_TAB = [
    { id: 1, text: 'Welcome mail', disable: false, component: () => { } },
    { id: 2, text: 'Success message', disable: false, component: () => { } },
];

const LogoImageUploadButton = ({ value, onClick, onRemove, onEdit, error }) => {
    const [tooltip, setTooltip] = useState(false);
    const [removeTooltip, setRemoveTooltip] = useState(false);

    const isBase64Includes = value?.includes('base64') || false;
    let imageSrc;
    if (isBase64Includes) {
        imageSrc = value;
    } else if (value) {
        imageSrc = `data:image/png;base64,${value}`;
    } else {
        imageSrc = Building;
    }

    return (
        <>
            <div className={`picture rs-picture m-auto mt20 ${error ? 'errorContainer' : ''} required`}>
                <figure>
                    <img src={imageSrc} alt="company logo" />
                </figure>
                <div className={`picture-choose-file ${value ? 'valid-image' : ''}`}>
                    <span className="info">
                        <RSTooltip
                            text={value ? 'Update company logo' : 'Upload company logo'}
                            position="top"
                            show={tooltip}
                        >
                            <span
                                onMouseEnter={() => setTooltip(true)}
                                onMouseLeave={() => setTooltip(false)}
                                onClick={onClick}
                                style={{ cursor: 'pointer' }}
                            >
                                {value ? (
                                    <>
                                        <span className="pcf-remove-icon">
                                            <RSTooltip
                                                text="Remove company logo"
                                                position="top"
                                                show={removeTooltip}
                                            >
                                                <i
                                                    className={`${circle_minus_fill_medium} color-primary-red icon-md`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemove();
                                                    }}
                                                    onMouseEnter={() => {
                                                        setRemoveTooltip(true);
                                                        setTooltip(false);
                                                    }}
                                                    onMouseLeave={() => setRemoveTooltip(false)}
                                                ></i>
                                            </RSTooltip>
                                        </span>
                                        <i
                                            className={`${circle_pencil_medium} color-primary-blue icon-md`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit && onEdit();
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </>
                                ) : (
                                    <i className={`${circle_plus_fill_medium} color-primary-blue icon-md`} />
                                )}
                            </span>
                        </RSTooltip>
                        <span className="pcf-label">Edit company logo</span>
                    </span>
                </div>
                {error && <div className="validation-message">{error}</div>}
            </div>
            <div className="alert alert-warning d-block mt30 py10 border-r5">
                <small className="text-center d-flex flex-column">
                    <span>{ALLOWED_FORMATS}</span>
                    <span>{FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1}</span>
                    <span>{FILE_SIZE500KB}</span>
                </small>
            </div>
        </>
    );
};

const SubscriptionCreate = () => {
    const state = useQueryParams('/preferences');
    //console.log('state: ', state);
    // const {
    //     state: { tabname, mode, id ,from},
    // } = useLocation();
    const { tabname, mode, id, from } = state;
        // console.log(useLocation(),"_state_")
    const clientList = useSelector((state) => getGlobalClientList(state));
    const isEdit = mode === 'edit';
    const subscribeSettingId = isEdit ? id : 0;
    const isSubscription = tabname.toLowerCase() === 'subscription';
    const existingWebsite = useRef();
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    // console.log('addAccess: ', addAccess);
    const { failureApiErrors, validUserEmailId } = useSelector(({ globalstate }) => globalstate);
    const [failedApi, setFailedApi] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const store = useStore();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const subscribeUpdateData = useSelector((state) => getCSSubscribeEditData(state));
    const { communicationTypes, communicationOptions } = useSelector(
        ({ communicationPlanReducer }) => communicationPlanReducer,
    );
    const productTypes = communicationOptions?.product || [];
    const communicationAttributes = communicationOptions?.attributes || [];
    const currClient = clientList?.find((item) => item?.clientId === clientId);
    const methods = useForm(SUB_STATE);
    const {
        control,
        watch,
        handleSubmit,
        setValue,
        clearErrors,
        setError,
        getValues,
        trigger,
        reset,
        formState: { errors, isDirty },
    } = methods;

        const allValues = getValues()
    const [unsubscribeModal, setUnbscribeModal] = useState(false);
    const [unsubscribeURLState, setUnbscribeURlState] = useState('');
    const [dState, setDState] = useState(INITIAL_STATE);
    const [reasonData, setReasonData] = useState([]);
    const [imageModalState, setImageModalState] = useState({
        show: false,
        tempImageData: null,
        showFileUpload: true,
    });
    const sessionReady = Boolean(departmentId && clientId && userId);
    const pageLoadApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isEdit ? 'edit' : 'create',
    });
    const modalSaveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isEdit ? 'edit' : 'create',
    });
    const isModalSaveLoading = modalSaveApi.isFetching;

    const [Others, interest, isotherInterest, subject, reason, unsubscribeURL, enableOthers, termsCondition] = watch([
        'Others',
        'interest',
        'isotherInterest',
        'subject',
        'reason',
        'unsubscribeURL',
        'enableOthers',
        'termsCondition',
    ]);
    const UnSubText = `<p><img src='data:image/png;base64,${currClient?.logoPath}' alt="test" title="" width="135px" height="135px"></p><p></p><p><strong>Hello,</strong></p><p></p><p>We are sorry to know that you have decided to unsubscribe from our list. It was great having you with us. Do visit us online to check out on special offers and news. If you require any assistance, you may contact our customer service any time.</p><p></p><p>Regards,</p><p>Team ${currClient?.clientName}</p>`;
    const SubText = `<p><img src='data:image/png;base64,${currClient?.logoPath}' alt="test" title="" width="135px" height="135px"></p><p></p><p><strong>Welcome onboard! </strong></p><p></p><p>We are pleased to have you join our mailing list. You may look forward to receiving personalized content and updates. You can expect only responsibly-made emails from us, not spams.</p><p></p><p>Regards,</p><p>Team ${currClient?.clientName}</p>`;

    useEffect(() => {
        if (!isEdit && tabname === 'Unsubscription') {
            currClient;
            reset((prev) => ({
                ...prev,
                logoPath: currClient?.logoPath,
                emailId: maskEmailTwoCharsBeforeAndAfterDomain(validUserEmailId),
            }));
            setValue('welcomeMail.verificationText', UnSubText);
        } else if (!isEdit && tabname === 'Subscription') {
            setValue('welcomeMail.verificationText', SubText);
            reset((prev) => ({
                ...prev,
                logoPath: currClient?.logoPath,
                emailId: maskEmailTwoCharsBeforeAndAfterDomain(validUserEmailId),
            }));
        }
    }, [isEdit, tabname, currClient]);
    useEffect(() => {
        if (Object.keys(state || {}).length) {
            if (state?.tabname.toLowerCase() === 'subscription') {
                setValue('type', 'subscription');
            } else {
                setValue('type', 'unsubscription');
            }
        }
    }, [state]);
    const applyCreateDefaults = useCallback(() => {
        if (isSubscription) {
            reset((prev) => ({
                ...prev,
                title: Subscription_title,
                message: Subscription_Description,
                success: {
                    successMessageText: getSubscriptionAdvanceDescription(currClient?.clientName),
                    contentType: 'R',
                },
                welcomeMail: {
                    ...prev.welcomeMail,
                    contentType: 'R',
                },
                termsCondtionUrl: EditorURL,
                emailMessageType: 'welcome',
            }));
        } else {
            reset((prev) => ({
                ...prev,
                title: Unsubscription_title,
                message: Unsubscription_Description,
                success: {
                    successMessageText: Unsubscription_Advance_Description,
                    contentType: 'R',
                },
                welcomeMail: {
                    ...prev.welcomeMail,
                    contentType: 'R',
                },
                termsCondtionUrl: EditorURL,
                emailMessageType: 'welcome',
            }));
        }
    }, [isSubscription, reset, currClient?.clientName]);

    const applySubscribeUpdateDataToForm = useCallback(
        (subscribeUpdateData) => {
        if (!subscribeUpdateData || !Object.keys(subscribeUpdateData).length) {
            return;
        }
        let comType;
        let prodType;
        let channType;
        if (isSubscription) {
            comType = _map(subscribeUpdateData?.communicationType?.split(','), (res) =>
                _find(communicationAttributes, ['attributename', res]),
            )?.filter(Boolean);
           prodType = _map(subscribeUpdateData?.productType?.split(',')?.filter(item => item?.trim() !== ''), // remove empty string
        (res) => {
        return _find(productTypes, ['categoryname', res]);
        }
        )?.filter(Boolean);

            channType = _map(subscribeUpdateData?.channelType?.split(','), (res) => {
                const updatedRes = res?.toLowerCase() === 'mobile' ? 'SMS' : res;
                return _find(CHANNEL_TYPE, ['name', updatedRes]);
            })?.filter(Boolean);
        } else {
            comType = _map(subscribeUpdateData?.unsubscribeCategory?.split(','), (res) =>
                _find(communicationAttributes, ['attributename', res]),
            )?.filter(Boolean);
               prodType = _map(subscribeUpdateData?.productType?.split(',')?.filter(item => item?.trim() !== ''), // remove empty string
        (res) => {
        return _find(productTypes, ['categoryname', res]);
        }
        )?.filter(Boolean);
            channType = _map(subscribeUpdateData?.channelList?.split(','), (res) => {
                const updatedRes = res?.toLowerCase() === 'mobile' ? 'SMS' : res;
                return _find(CHANNEL_TYPE, ['name', updatedRes]);
            })?.filter(Boolean);
        }
        let tempSubMessage = !!subscribeUpdateData?.subscribeText ? subscribeUpdateData?.subscribeText : '';
        let tempUnsubMessage = !!subscribeUpdateData?.unsubscribeText ? subscribeUpdateData?.unsubscribeText : '';
        let unsubUrl = !!subscribeUpdateData?.unsubscribeUrl ? subscribeUpdateData?.unsubscribeUrl : '';
        reset((prev) => ({
            ...prev,
            title: !!subscribeUpdateData?.title ? subscribeUpdateData?.title : '',
            successMessage: !!subscribeUpdateData?.successMessage ? subscribeUpdateData?.successMessage : '',
            logoPath: !!subscribeUpdateData?.logoPath ? subscribeUpdateData?.logoPath : '',
            interest: isSubscription
                ? typeof subscribeUpdateData?.interest === 'string'
                    ? subscribeUpdateData.interest
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                    : Array.isArray(subscribeUpdateData?.interest)
                    ? subscribeUpdateData.interest
                    : []
                : typeof subscribeUpdateData?.reason === 'string'
                ? subscribeUpdateData.reason
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                : Array.isArray(subscribeUpdateData?.reason)
                ? subscribeUpdateData.reason
                : [],

            // subscribeUpdateData?.reason? subscribeUpdateData?.reason?.split(','): [],
            //subscribeName: !!subscribeUpdateData?.name ? subscribeUpdateData?.name : '',

            redirectionURL: isSubscription
                ? !!subscribeUpdateData?.redirectionURL
                    ? subscribeUpdateData?.redirectionURL
                    : ''
                : !!subscribeUpdateData?.redirectionUrl
                ? subscribeUpdateData?.redirectionUrl
                : '', // Raghav feedback - redirectionURL key changed
            message: isSubscription ? tempSubMessage : tempUnsubMessage,
            communicationType: comType[0] !== undefined ? comType : [],
            productType: prodType[0] !== undefined ? prodType : [],
            channelType: channType[0] !== undefined ? channType : [],
            othersText: isSubscription
                ? subscribeUpdateData?.otherInterestComments
                : subscribeUpdateData?.otherReasonComments,
            termsCondition: !!subscribeUpdateData?.termsCondition,
            isotherInterest: isSubscription
                ? !!subscribeUpdateData?.isotherInterest
                : !!subscribeUpdateData?.isotherReason,
            welcomeMail: {
                subjectLine: subscribeUpdateData?.subjectLine || '',
                verificationText: !isSubscription
                    ? subscribeUpdateData?.missyoumailText
                    : subscribeUpdateData?.verificationText,
                contentType: !isSubscription ? subscribeUpdateData?.fairWellMailContentType : subscribeUpdateData?.welcomeMailContentType || 'R',
                importValues: {
                    edmContent: !isSubscription ? subscribeUpdateData?.fairWellEdmContent : subscribeUpdateData?.welcomeEdmContent || '',
                    importType: (!isSubscription ? subscribeUpdateData?.fairWellEdmContent : subscribeUpdateData?.welcomeEdmContent) ? 'import' : 'url',
                },
            },
            success: {
                successMessageText:
                    subscribeUpdateData?.sucessMessageContentType === 'R' ? subscribeUpdateData?.successMessage : '',
                contentType: subscribeUpdateData?.sucessMessageContentType || 'R',
                importValues: {
                    edmContent:
                        subscribeUpdateData?.sucessMessageContentType === 'E'
                            ? subscribeUpdateData?.sucessMessageEdmContent || ''
                            : '',
                    importType:
                        subscribeUpdateData?.sucessMessageEdmContent &&
                        subscribeUpdateData?.sucessMessageContentType === 'E'
                            ? 'import'
                            : 'url',
                },
            },
            unsubscribeURL: unsubUrl,
            enableOthers: isSubscription
                ? subscribeUpdateData?.interestList?.split(',')?.includes('Others')
                : subscribeUpdateData?.reasonList?.split(',')?.includes('Others'),
            termsCondtionUrl: isSubscription
                ? !!subscribeUpdateData?.subscribeUrl
                    ? subscribeUpdateData?.subscribeUrl
                    : EditorURL
                : !!subscribeUpdateData?.unsubscribeUrl
                ? subscribeUpdateData?.unsubscribeUrl
                : EditorURL,
        }));
        setUnbscribeURlState(unsubUrl);
        setDState((prev) => {
            if (isSubscription) {
                return {
                    ...prev,
                    interestData: _map(subscribeUpdateData?.interestList?.split(',')),
                    logoPath: !!subscribeUpdateData?.logoPath ? subscribeUpdateData?.logoPath : '',
                };
            } else {
                return {
                    ...prev,
                    interestData: _map(subscribeUpdateData?.reasonList?.split(',')),
                    logoPath: !!subscribeUpdateData?.logoPath ? subscribeUpdateData?.logoPath : '',
                };
            }
        });
        setReasonData((prev) => {
            const data = isSubscription
                ? subscribeUpdateData?.interestList
                    ? subscribeUpdateData?.interestList?.split(',')
                    : []
                : subscribeUpdateData?.reasonList
                ? subscribeUpdateData?.reasonList?.split(',')
                : [];

            return [...prev, ...data];
        });
        },
        [
            isSubscription,
            communicationAttributes,
            productTypes,
            reset,
            setUnbscribeURlState,
            setDState,
            setReasonData,
        ],
    );

    const resolveEditRowFromResponse = (res) => {
        if (Array.isArray(res?.data)) {
            return res.data[0] ?? {};
        }
        if (Array.isArray(res?.data?.data)) {
            return res.data.data[0] ?? {};
        }
        return res?.data ?? {};
    };

    useEffect(() => {
        if (!sessionReady) {
            return;
        }
        const payload = { departmentId, clientId, userId };

        pageLoadApi.refetch({
            fetcher: async () => {
                await ensureCommunicationPlanDropdowns(dispatch, store.getState, payload);

                if (isEdit) {
                    const res = isSubscription
                        ? await dispatch(getSubscribeEditData({ ...payload, subscribeSettingId }))
                        : await dispatch(
                              getUnSubscribeEditData({ ...payload, UnsubscribeSettingID: subscribeSettingId }),
                          );
                    if (!res?.status) {
                        setFailedApi(isSubscription ? 'GetSubscribeSettingByID' : 'GetUnSubscribeSettingByID');
                    } else {
                        applySubscribeUpdateDataToForm(resolveEditRowFromResponse(res));
                    }
                    return res;
                }

                applyCreateDefaults();
                return null;
            },
            loaderConfig: fieldLoaderConfig,
            mode: isEdit ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        departmentId,
        clientId,
        userId,
        dispatch,
        store,
        isEdit,
        isSubscription,
        subscribeSettingId,
        applySubscribeUpdateDataToForm,
        applyCreateDefaults,
    ]);

    const showFieldLoader = pageLoadApi.isLoading && !isEdit;

    const handleSave = () => {
        const values = getValues();
        if (!values.logoPath) {
            setError('logoPath', {
                type: 'manual',
                message: UPLOAD_COMPANY_IMAGE,
            });
            UpdateState(setDState, 'saveModal', false);
            return;
        }
        UpdateState(setDState, 'saveModal', true);
    };
    const onSave = async () => {
        if (isModalSaveLoading) return;
        const values = getValues();
        if (!isEdit && !values.subscribeName) {
            trigger();
        } else {
            let payload = constructAPIPayload(
                values,
                dState,
                isSubscription,
                subscribeSettingId,
                subscribeUpdateData.name,
                reasonData,
                departmentId,
            );
            payload = { ...payload, clientId, userId };
            const res = await modalSaveApi.refetch({
                fetcher: () =>
                    dispatch(
                        isSubscription ? saveSubscription(payload, false) : saveUnSubscription(payload, false),
                    ),
                loaderConfig: fieldLoaderConfig,
                mode: isEdit ? 'edit' : 'create',
            });
            if (res?.status) {
                if (state && state?.from === 'communication') {
                    let updateLocationState = {
                        ...state,
                        savedUnsubscribeId: res?.data || 0,
                    };
                    const encryptState = encodeUrl(updateLocationState);
                    if (state?.campaignType === 'M') {
                        dispatch(updateMDCEditMode('edit'));
                        navigate(`/communication/create-mdc-communication?q=${encryptState}`);
                    } else {
                        navigate(`/communication/create-communication?q=${encryptState}`);
                    }
                } else {
                    navigate('/preferences/communication-settings', {
                        state: createCommunicationSettingsNavState('mail', {
                            from: 'sub',
                            mailTabId: MAIL_TAB_ID.SUBSCRIPTION_UNSUBSCRIPTION,
                            subTab: isSubscription,
                        }),
                    });
                }
            } else {
                UpdateState(setDState, 'saveModal', false);
            }
        }
    };
    const [websiteLoading, setWebsiteLoading] = useState({ loading: false, valid: false });
    const handleErrClose = () => {
        if (failedApi === 'GetSubscribeSettingByID' || failedApi === 'GetUnSubscribeSettingByID') {
            navigate('/preferences/communication-settings', {
                state: createCommunicationSettingsNavState('mail', {
                    from: 'sub',
                    mailTabId: MAIL_TAB_ID.SUBSCRIPTION_UNSUBSCRIPTION,
                    subTab: isSubscription,
                }),
            });
        }
        setFailedApi('');
    };

    const handleImageUpload = (base64Image, fileName) => {
        const fileExtension = fileName?.split('.').pop()?.toLowerCase() || 'jpeg';
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        const dataUri = base64Image?.includes('data:image') ? base64Image : `data:${mimeType};base64,${base64Image}`;
        setImageModalState((prev) => ({ ...prev, tempImageData: dataUri, showFileUpload: false }));
    };

    const handleCropComplete = (croppedImage) => {
        setValue('logoPath', croppedImage);
        clearErrors('logoPath');
        setImageModalState({ show: false, tempImageData: null, showFileUpload: true });
    };

    const handleModalClose = () => {
        setImageModalState({ show: false, tempImageData: null, showFileUpload: true });
        clearErrors('logoPath');
    };

    const handleOpenImageModal = (isEdit = false) => {
        if (isEdit) {
            const currentImage = watch('logoPath');
            if (currentImage) {
                let imageForCrop = currentImage;
                if (!currentImage.includes('data:image')) {
                    const isBase64Includes = currentImage?.includes('base64') || false;
                    if (isBase64Includes) {
                        imageForCrop = currentImage;
                    } else {
                        imageForCrop = `data:image/png;base64,${currentImage}`;
                    }
                }
                setImageModalState({ show: true, tempImageData: imageForCrop, showFileUpload: false });
            }
        } else {
            setImageModalState({ show: true, tempImageData: null, showFileUpload: true });
        }
    };

    // LogoImageUploadButton component moved outside
    return (
        <FormProvider {...methods}>
            <div className="page-content-holder">
                {/* Main page heading block starts */}
                <RSPageHeader
                    title={tabname}
                    rightCommonMenus
                    isBuDisabled
                    isAgencyDisabled
                    isBack
                    backPath={'/preferences/communication-settings'}
                    state={createCommunicationSettingsNavState('mail', {
                        from: 'sub',
                        mailTabId: MAIL_TAB_ID.SUBSCRIPTION_UNSUBSCRIPTION,
                        subTab: isSubscription,
                    })}
                />
                {/* Main page heading block ends */}

                {/* Main page content block starts */}
                <Container className="page-content px0 mt21">
                    <CommunicationSubscriptionEditSkeletonGate
                        isLoading={pageLoadApi.isFetching}
                        isEditMode={isEdit}
                        isSubscription={isSubscription}
                    >
                    <form onSubmit={handleSubmit(handleSave)}>
                        <div className="box-design rs-box py40">
                            <Row>
                                <Col md={3} sm={4} xs={12} className="accountsetup-image-upload">
                                    <LogoImageUploadButton
                                        value={watch('logoPath')}
                                        onClick={() => handleOpenImageModal(false)}
                                        onEdit={() => handleOpenImageModal(true)}
                                        onRemove={() => {
                                            setValue('logoPath', null);
                                            setError('logoPath', {
                                                type: 'manual',
                                                message: UPLOAD_COMPANY_IMAGE,
                                            });
                                        }}
                                        error={errors?.logoPath?.message}
                                    />
                                </Col>
                                {/* second column */}
                                <Col md={9} sm={8} xs={12} className="box-left-border pb10 accountsetup-contact-info">
                                    <Row>
                                        <Col sm={12}>
                                            <div className="form-group">
                                                <RSInput
                                                    type={'text'}
                                                    name={'title'}
                                                    id="rs_SubscriptionCreate_title"
                                                    control={control}
                                                    placeholder={TITLE}
                                                    required
                                                    maxLength={100}
                                                    rules={{ required: ENTER_TITLE_TEXT }}
                                                    isLoading={showFieldLoader}
                                                />
                                            </div>
                                        </Col>
                                        <Col
                                            sm={12}
                                            id="rs_SubscriptionCreate_message"
                                            className="mdc_mobilepush_editors"
                                        >
                                            <div className="form-group">
                                                <RSKendoTextEditor
                                                    control={control}
                                                    name={'message'}
                                                    required
                                                    rules={{ required: ENTER_EDITOR_TEXT }}
                                                    errMsg={ENTER_EDITOR_TEXT}
                                                    placeholder={MESSAGE}
                                                    resTextEditorClassName = {'subscription-textEditor'}
                                                />
                                            </div>
                                        </Col>
                                        <Col sm={12}>
                                            <Row>
                                                <Col sm={6} id="rs_SubscriptionCreate_communicationType">
                                                    <div className="form-group">
                                                        <RSMultiSelect
                                                            control={control}
                                                            name={'communicationType'}
                                                            data={communicationAttributes}
                                                            //required
                                                            textField="attributename"
                                                            dataItemKey="campaignAttributeId"
                                                            // rules={{
                                                            //     required: SELECT_COMMUNICATION_TYPE,
                                                            // }}
                                                            label={COMMUNICATIONTYPE}
                                                            isLoading={showFieldLoader}
                                                            //isCustomMultiSelect ={true}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col sm={6} id="rs_SubscriptionCreate_communicationType">
                                                    <div className="form-group">
                                                        <RSMultiSelect
                                                            control={control}
                                                            name={'productType'}
                                                            data={productTypes}
                                                            //required
                                                            textField="categoryname"
                                                            dataItemKey="categoryId"
                                                            // rules={{
                                                            //     required: SELECT_PRODUCT_TYPE,
                                                            // }}
                                                            label={PRODUCTType}
                                                            isLoading={showFieldLoader}
                                                            //isCustomMultiSelect  ={true}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col sm={6} id="rs_SubscriptionCreate_channelType">
                                                    <div className="form-group">
                                                        <RSMultiSelect
                                                            control={control}
                                                            name={'channelType'}
                                                            data={CHANNEL_TYPE}
                                                            required
                                                            textField="name"
                                                            dataItemKey="id"
                                                            rules={{
                                                                required: SELECT_CHANNEL_TYPE,
                                                            }}
                                                            label={CHANNEL_TYPE_PH}
                                                            isLoading={showFieldLoader}
                                                            //isCustomMultiSelect  ={true}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col sm={6}>
                                                    <Row>
                                                        <div
                                                            className={`form-group ${
                                                                interest?.includes('Others') ? '' : 'mb0'
                                                            }`}
                                                        >
                                                            <>
                                                                <RSMultiSelect
                                                                    control={control}
                                                                    placeholder={
                                                                        isSubscription
                                                                            ? INTREST_TYPE
                                                                            : REASON_TYPE
                                                                    }
                                                                    allowCustom
                                                                    name={'interest'}
                                                                    data={reasonData}
                                                                    // rules={{
                                                                    //     required:
                                                                    //         isSubscription
                                                                    //             ? 'Select interest type'
                                                                    //             : 'Select reason type',
                                                                    // }}
                                                                    handleChange={(e) => {
                                                                        // debugger
                                                                        // if(e.target.value?.includes('Others')){
                                                                        //     setValue('enableOthers', true);
                                                                        // }else{
                                                                        //     setValue('enableOthers', fasle);
                                                                        // }
                                                                    }}
                                                                //isCustomMultiSelect  ={true}
                                                                />
                                                                <RSCheckbox
                                                                    className="smaller"
                                                                    name={'enableOthers'}
                                                                    control={control}
                                                                    // defaultValue={defaultRegions}
                                                                    labelName={'Enable others'}
                                                                    handleChange={({ target: { checked } }) => {
                                                                        if (checked) {
                                                                            setReasonData((pre) => [...pre, 'Others']);
                                                                            //setValue('interest', [...interest, 'Others'])
                                                                            //UpdateState(setDState, ['interestData'], [['Others']]);
                                                                        } else {
                                                                            // UpdateState(setDState, ['interestData'], [[]]);
                                                                            //    debugger
                                                                            setReasonData((prev) =>
                                                                                prev.filter(
                                                                                    (item) => item !== 'Others',
                                                                                ),
                                                                            );
                                                                            setValue(
                                                                                'interest',
                                                                                interest?.filter(
                                                                                    (item) => item !== 'Others',
                                                                                ),
                                                                            );
                                                                            setValue('othersText', '');
                                                                        }
                                                                    }}
                                                                />
                                                            </>
                                                            {/* <Col sm={11} id="rs_SubscriptionCreate_interest">
                                                                <RSKendoDropDownList
                                                                    control={control}
                                                                    // name={
                                                                    //     isSubscription
                                                                    //         ? 'interest'
                                                                    //         : 'reason'
                                                                    // }
                                                                    name="interest"
                                                                    data={
                                                                        dState?.interestData?.length === 1 &&
                                                                        dState?.interestData[0] === ''
                                                                            ? []
                                                                            : dState?.interestData
                                                                    }
                                                                    //required
                                                                    // rules={{
                                                                    //     required:
                                                                    //         isSubscription
                                                                    //             ? 'Select interest type'
                                                                    //             : 'Select reason type',
                                                                    // }}
                                                                    label={
                                                                        isSubscription
                                                                            ? INTREST_TYPE
                                                                            : REASON_TYPE
                                                                    }
                                                                />
                                                            </Col>
                                                            <Col sm={1} className="fg-icons-wrapper pl0">
                                                                <div className="fg-icons">
                                                                    <i
                                                                        id="rs_SubscriptionCreate_settings"
                                                                        className={`icon-md color-primary-blue ${settings_medium}`}
                                                                        onClick={() => {
                                                                            UpdateState(
                                                                                setDState,
                                                                                'interestModal',
                                                                                true,
                                                                            );
                                                                        }}
                                                                    ></i>
                                                                </div>
                                                            </Col> */}
                                                        </div>
                                                    </Row>
                                                </Col>
                                                {interest?.includes('Others') && (
                                                    <Col sm={12}>
                                                        <div className="form-group mb30">
                                                            <RSTextarea
                                                                required
                                                                control={control}
                                                                name={'othersText'}
                                                                 maxLength={500}
                                                                placeholder={YOUR_COMMAND}
                                                            />
                                                            <small>{UPTO_500_CHARACTERS}</small>
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>

                                            <Col sm={12} className="px2 py19" style={{ position: 'relative' }}>
                                                <ul className="align-items-center d-flex rs-list-inline form-builder-component">
                                                    <li className={watch('termsCondition') ? '' : 'click-off'}>
                                                        <RSEditorPopup
                                                            name={`termsCondtionUrl`}
                                                            control={control}
                                                            init={BODYCONFIG}
                                                            // initialValue={TERMSCONDITIONS}
                                                            // initialValue={'<p>I agree to the terms and conditions</p>'}
                                                            disabled={!watch('termsCondition')}
                                                            required
                                                        />
                                                    </li>
                                                    <li className="ml20">
                                                        <RSSwicth
                                                            control={control}
                                                            name="termsCondition"
                                                            defaultValue={false}
                                                        />
                                                    </li>
                                                </ul>
                                            </Col>

                                            <Col sm={12} className="box-bg-even p19">
                                                <ul className="rs-list-inline">
                                                    <Row>
                                                        <Col sm={4}>
                                                            <li>
                                                                <label className="fs19">
                                                                    {ADVANCED_SETTINGS}
                                                                </label>
                                                            </li>
                                                        </Col>
                                                        <Col sm={2}>
                                                            <li>
                                                                <RSSwicth
                                                                    control={control}
                                                                    name="isotherInterest"
                                                                    defaultValue={false}
                                                                />
                                                            </li>
                                                        </Col>
                                                    </Row>
                                                </ul>
                                            </Col>
                                        </Col>
                                        {isotherInterest && (
                                            <div className="mt40">
                                                <RSTabber
                                                    className="rs-tabs row"
                                                    defaultClass={`col-md-2 tabTransparent`}
                                                    componentClassName={'mt30'}
                                                    tabData={[
                                                        {
                                                            id: 'welcomeMail',
                                                            text: isSubscription
                                                                ? WELCOME_MAIL
                                                                : FARWELL_MAIL,
                                                            component: () => <MailContent isEditContent={isEdit} />,
                                                        },
                                                        {
                                                            id: 'sucessMessage',
                                                            text: 'Success Message',
                                                            component: () => <SucessContent isEditContent={isEdit} />,
                                                        },
                                                    ]}
                                                    callBack={(tab, index) => {
                                                        if (index !== 0) {
                                                            setValue('emailMessageType', 'success');
                                                        } else {
                                                            setValue('emailMessageType', 'welcome');
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                     {isotherInterest &&  watch('emailMessageType') === 'success' && (
                                           <div className="form-group mb0 mt40">
                                            <Row>
                                                {/* <Col sm={{ offset: 0, span: 3 }} className="pr0">
                                                                <label className="control-label-left">
                                                                    {REDIRECTION_URL}
                                                                </label>
                                                            </Col> */}
                                                <Col sm={{ offset: 0, span: 12 }}>
                                                    <RSInput
                                                        name="redirectionURL"
                                                        id="rs_SubscriptionCreate_redirectionURL"
                                                        control={control}
                                                        required
                                                        placeholder={REDIRECTION_URL}
                                                        isLoading={websiteLoading.loading}
                                                        isValidIcon={websiteLoading.valid}
                                                        clearErrors={websiteLoading.valid}
                                                        rules={{
                                                            required: REDIRECTION_URL_MSG,
                                                            pattern: {
                                                                value: WEBSITE_REGEX,
                                                                message: ENTER_VALID_WEBSITE,
                                                            },
                                                        }}
                                                        handleOnchange={() => {
                                                            if (websiteLoading.valid)
                                                                setWebsiteLoading({
                                                                    loading: false,
                                                                    valid: false,
                                                                });
                                                        }}
                                                        handleOnBlur={async ({ target: { value } }) => {
                                                            if (
                                                                isURLValid(value) &&
                                                                value?.length > 0 &&
                                                                value !== existingWebsite.current &&
                                                                value?.startsWith('https://www.')
                                                            ) {
                                                                setWebsiteLoading((prev) => ({
                                                                    ...prev,
                                                                    loading: true,
                                                                }));
                                                                existingWebsite.current = value;
                                                                const { status } = await dispatch(
                                                                    validateWebsite({
                                                                        payload: { Website: value },
                                                                        setError,
                                                                        name: 'redirectionURL',
                                                                    }),
                                                                );
                                                                if (status) {
                                                                    clearErrors('redirectionURL');
                                                                    setWebsiteLoading({
                                                                        loading: false,
                                                                        valid: true,
                                                                    });
                                                                } else
                                                                    setWebsiteLoading({
                                                                        loading: false,
                                                                        valid: false,
                                                                    });
                                                            } else {
                                                                setError('redirectionURL', {
                                                                    type: 'custom',
                                                                    message: ENTER_VALID_WEBSITE,
                                                                });
                                                                existingWebsite.current = null;
                                                            }
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                     )}
                                    </Row>
                                </Col>
                            </Row>
                        </div>

                        <div className="buttons-holder">
                            <RSSecondaryButton
                                blockInteraction={isModalSaveLoading}
                                onClick={() => {
                                    if (isModalSaveLoading) return;
                                    if (state && state?.from === 'communication') {
                                        const encryptState = encodeUrl(state);
                                        if (state?.campaignType === 'M') {
                                            navigate(`/communication/create-mdc-communication?q=${encryptState}`);
                                        } else {
                                            navigate(`/communication/create-communication?q=${encryptState}`);
                                        }
                                    } else {
                                        navigate('/preferences/communication-settings', {
                                            state: createCommunicationSettingsNavState('mail', {
                                                from: 'sub',
                                                mailTabId: MAIL_TAB_ID.SUBSCRIPTION_UNSUBSCRIPTION,
                                                subTab: isSubscription,
                                            }),
                                        });
                                    }
                                }}
                                id="rs_SubscriptionCreate_Cancel"
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSSecondaryButton
                                className="color-secondary-blue"
                                onClick={() => UpdateState(setDState, 'previewModal', true)}
                                id="rs_SubscriptionCreate_Preview"
                            >
                                {PREVIEW}
                            </RSSecondaryButton>
                            {/* {addAccess && <RSPrimaryButton type="submit">Save</RSPrimaryButton>} */}
                            <RSPrimaryButton
                                type="submit"
                                blockInteraction={isModalSaveLoading}
                                id="rs_SubscriptionCreate_Submit"
                            >
                                {isEdit ? UPDATE : SAVE}
                            </RSPrimaryButton>
                        </div>
                    </form>
                    </CommunicationSubscriptionEditSkeletonGate>
                </Container>
            </div>

            {/* <OthersModal
                show={false}
                tags={dState?.interestData}
                isEditContent={isEdit}
                modalName={tabname}
                handleClose={(status) => {
                    if (!status) {
                        UpdateState(setDState, 'interestModal', false);
                    }
                }}
                onSubmit={(tags) => {
                    if (Others) {
                        // debugger;
                        if (!dState.interestData?.includes('Others') || !dState.interestData?.includes('others')) {
                            let arr = tags;
                            arr.push('Others');
                            UpdateState(setDState, ['interestModal', 'interestData'], [false, arr]);
                        }
                    } else {
                        tags = tags.filter((tag) => tag !== 'Others' || tag !== 'others');
                        UpdateState(setDState, ['interestModal', 'interestData'], [false, tags]);
                    }
                    setValue('interest', '');
                }}
            /> */}

            <PreviewContent
                show={dState.previewModal}
                modalName={tabname}
                handleClose={(status) => {
                    if (!status) {
                        UpdateState(setDState, 'previewModal', false);
                    }
                }}
            />

            <SaveModal
                show={dState.saveModal}
                handleClose={(status) => {
                    if (!status) {
                        UpdateState(setDState, 'saveModal', false);
                        //if (!isEdit) setValue('subscribeName', '');
                        //else setValue('subscribeName', subscribeUpdateData?.name);
                    }
                }}
                onSave={onSave}
                isEdit={isEdit}
                isSubscription={isSubscription}
                subscribeName={subscribeUpdateData?.name}
                isSaveLoading={isModalSaveLoading}
            />
            <RSModal
                show={unsubscribeModal}
                size="md"
                header={tabname}
                handleClose={() => {
                    setUnbscribeModal(false);
                    setValue('unsubscribeURL', unsubscribeURLState);
                }}
                body={
                    <>
                        <Row className="mb30">
                            <Col xs={12} className="mb30 mt30">
                                <RSInput
                                    name={'unsubscribeURL'}
                                    control={control}
                                    placeholder={`${tabname} URL`}
                                    required
                                    rules={{
                                        required: `Enter ${tabname} URL`,
                                        pattern: {
                                            value: WEBSITE_REGEX,
                                            message: 'Enter valid URL',
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                        <div className="buttons-holder">
                            <RSPrimaryButton
                                onClick={() => {
                                    setUnbscribeModal(false);
                                    setUnbscribeURlState(unsubscribeURL);
                                }}
                                className={Object.hasOwn(errors, 'unsubscribeURL') ? 'click-off' : ''}
                            >
                                {SAVE}
                            </RSPrimaryButton>
                        </div>
                    </>
                }
            />
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
            {imageModalState.show && (
                <RSModal
                    show={imageModalState.show}
                    header="Edit company logo"
                    size="md"
                    handleClose={handleModalClose}
                    body={
                        <div className="image-upload-crop-container">
                            {imageModalState.showFileUpload && (
                                <Row className="mt11">
                                    <Col>
                                        <RSFileUpload
                                            isbase64={true}
                                            control={control}
                                            name={'uploadImageName'}
                                            text="Browse"
                                            accept=".png,.jpg,.jpeg"
                                            customInputClass={'upload-button-top-align ml20'}
                                            size={512000}
                                            isBase64Status={true}
                                            base64Data={async (base64, fileName, contentLength) => {
                                                handleImageUpload(base64, fileName);
                                            }}
                                            handleChange={(e) => {}}
                                            required
                                            watch={watch}
                                            setError={setError}
                                            clearErrors={clearErrors}
                                        />
                                        <small className="text-muted d-block mt5">
                                            Allowed formats: .jpg, .jpeg, .png | maximum size: 500kb
                                        </small>
                                    </Col>
                                </Row>
                            )}

                            {imageModalState.tempImageData && (
                                <>
                                    <ImageCropModal
                                        imageSrc={imageModalState.tempImageData}
                                        onCropComplete={handleCropComplete}
                                        onCancel={handleModalClose}
                                        aspectRatio={1}
                                        cropShape="round"
                                        showGrid={true}
                                        height="250px"
                                        setTempImageData={(data) =>
                                            setImageModalState((prev) => ({ ...prev, tempImageData: data }))
                                        }
                                        setShowFileUpload={(show) =>
                                            setImageModalState((prev) => ({ ...prev, showFileUpload: show }))
                                        }
                                        setValue={setValue}
                                    />
                                </>
                            )}
                        </div>
                    }
                />
            )}
        </FormProvider>
    );
};

export default SubscriptionCreate;
