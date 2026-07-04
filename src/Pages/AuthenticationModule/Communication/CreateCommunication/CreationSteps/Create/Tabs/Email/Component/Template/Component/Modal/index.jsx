import { buildPayload as buildMobileNotificationPayload } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/MobileNotification/constant';
import { buildPayload as buildWebNotificationPayload } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Notification/constant';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { buildPayload, getSavedPushChannelFlagPayload } from '../../../../constant';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { SELECT_TEMPLATE_CATEGORY } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, SAVE, TEMPLATE_CATEGORY, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { baseURL, LANDING_BUILDER_REDIRECT_URL } from 'Constants/EndPoints/index';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector, useDispatch } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';
import {
    aiemailBuilder_nameExisit,
    templateGalleryListApi_AI,
    templateDuplicate_aiBuilder,
    templateCategoryListApi_AI,
} from 'Reducers/preferences/EmailBuilder/request';

import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import {
    saveEmailCampaign,
    saveMobilePush,
    saveWebPush,
} from 'Reducers/communication/createCommunication/Create/request';
import {
    getTemplateBuilderChannelId,
    resolveTemplateBuilderChannelType,
} from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/constants';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import ListNameExists from 'Components/ListNameExists';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { currentSplitName } from '../../constant';
const TemplateModal = ({
    show,
    handleClose,
    type,
    templateName,
    setIsDuplicate,
    onManageCategoriesClick,
    templateData,
    channelId,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { timeZoneId } = getUserDetails();
    const {
        handleSubmit,
        trigger,
        control,
        getValues,
        setError,
        clearErrors,
        setValue,
        watch,
        setFocus,
        formState: { errors },
    } = useFormContext();
    const [campaign, setCampaign] = useState({});
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const state = useQueryParams('/communication');
    const { campaignDetails } = useSelector((state) => emailList(state));
    const { notification, totalAudienceCount } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const [isShow, setIsShow] = useState(false);
    const duplicateTemplateApi = useApiLoader({ autoFetch: false });
    const isDuplicating = duplicateTemplateApi.isFetching;
    let mobileApp = watch('mobileApp');
    const templateNameWatch = watch('templateName');
    const templateCategoryWatch = watch('templateCategory');
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const templateCategories = useSelector((state) => state.emailBuilderReducer.templateCategories);
    const [categoriesData, setCategoriesData] = useState([]);
    useEffect(() => {
        setIsShow(show.show);
        if (show?.show) {
            setCategoriesData(templateCategories);
            if (!templateCategories || templateCategories?.length === 0) {
                handleCategories();
            }
        }
    }, [show, templateCategories]);

    const handleCategories = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        let { status, data } = await dispatch(templateCategoryListApi_AI(payload));
        if (status) {
            setCategoriesData(data);
        } else {
            setCategoriesData([]);
        }
    };
    useEffect(() => {
        if (state !== null) {
            const campaign = {
                campaignId: _get(state, 'campaignId', 0),
                campaignType: _get(state, 'campaignType', 'S'),
            };
            const mdcContentSetupDetails = _get(state, 'mdcContentSetupDetails', {});
            setCampaign(campaign);
            setMdcContentSetupDetails(mdcContentSetupDetails);
        }
    }, [state]);
    const handleSave = (data) => {
        if (templateName !== '' && templateCategory !== '') {
            handleDirect();
        } else if (templateCategory === '') {
            setError('templateCategory', {
                type: 'custom',
                message: 'Select category',
            });
        } else {
            trigger();
        }
    };

    const handleDirect = async () => {
        let formState = getValues();
        const splitTabListFromForm = getValues('splitTabList');
        const resolvedSplitTabList =
            Array.isArray(splitTabListFromForm) && splitTabListFromForm.length > 0
                ? splitTabListFromForm
                : ['splitA', 'splitB'];

        let templateNamevalue = getValues('templateName');
        let temp_templateCategory = getValues('templateCategory');
        let _type = resolveTemplateBuilderChannelType(channelId, formState?.channelType, type);
        if (show?.mode === 'duplicate') {
            if (temp_templateCategory === '') {
                setError('templateCategory', {
                    type: 'custom',
                    message: 'Select category',
                });
                return;
            }
            if (isDuplicating) return;
            const resolvedChannelId = getTemplateBuilderChannelId(_type);
            const payload = {
                departmentId,
                clientId,
                userId,
                templateId: templateName?.list?.templateID || 0,
                templateCategoryType: temp_templateCategory?.templateCategoryId || 0,
                templateName: getValues('templateName'),
                channelId: resolvedChannelId,
            };
            const res = await duplicateTemplateApi.refetch({
                fetcher: ({ payload: duplicatePayload } = {}) =>
                    dispatch(templateDuplicate_aiBuilder(duplicatePayload, { loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
                params: { payload },
            });
            if (res?.status) {
                const listPayload = {
                    departmentId,
                    clientId,
                    userId,
                    channelId: resolvedChannelId,
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
                    },
                };
                setIsDuplicate(true);
                handleClose();
                dispatch(templateGalleryListApi_AI({ ...listPayload }));
            }
        } else {
            formState = {
                ...campaignDetails,
                ...formState,
                ...campaign,
                splitABCount: 0,
                splitTabList: resolvedSplitTabList,
                isSendTestMail: 0,
                clientId,
                userId,
                departmentId,
                campaignId: state?.campaignId,
                campaignType: state?.campaignType,
                ...state,
                dynamiclistId: campaign['campaignType'] === 'T' ? _get(state, 'dynamicListId', 0) : 0,
                ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
            };
            let payload =
                _type === '' || _type === 'email'
                    ? buildPayload(formState, '', 'template', state)
                    : _type.toLowerCase() === 'web'
                        ? buildWebNotificationPayload(formState, 'web', timeZoneId, '')
                        : buildMobileNotificationPayload(formState, timeZoneId, mobileApp);

            const audienceFromForm = formState?.audience?.reduce(
                (prev, cur) =>
                    Number(prev) +
                    Number(
                        _type === 'Mobile' || _type === 'mobile'
                            ? cur.recipientCountMobilePush
                            : cur.recipientCountWebPush,
                    ),
                0,
            );
            const isMobile = _type?.toLowerCase() === 'mobile';
            const audienceCount =
                (isMobile && (audienceFromForm == null || audienceFromForm === 0 || Number.isNaN(audienceFromForm))
                    ? totalAudienceCount ?? 0
                    : audienceFromForm) ?? 0;

            const payloadSubmit = {
                ...payload,
                clientId,
                departmentId,
                userId,
                createdBy: userId,
                campaignId: state?.campaignId,
                campaignType: state?.campaignType,
                edmGuid: !!notification[type?.toLowerCase()]?.edmGuid ? notification[type?.toLowerCase()]?.edmGuid : '',
                campaignGuid: !!notification[type?.toLowerCase()]?.campaignGuId
                    ? notification[type?.toLowerCase()]?.campaignGuId
                    : '',
                audienceCount,
            };
            let dispatchName = saveEmailCampaign;
            if (_type.toLowerCase() === 'web') {
                dispatchName = saveWebPush;
            } else if (_type.toLowerCase() === 'mobile') {
                dispatchName = saveMobilePush;
            }

            const { status, data } = await dispatch(
                dispatchName(
                    _type.toLowerCase() === 'web' || _type.toLowerCase() === 'mobile'
                        ? { payload: payloadSubmit, savedChannelsId }
                        : { payload, savedChannelsId },
                ),
            );
            if (status) {
                let params = {
                    campaignId: state?.campaignId || 0,
                    channelId: _type.toLowerCase() === 'web' ? 8 : _type.toLowerCase() === 'mobile' ? 14 : 1,
                    templateId: 0,
                    segList:
                        _type.toLowerCase() === 'web' || _type.toLowerCase() === 'mobile'
                            ? payloadSubmit?.audienceCount
                            : 0,
                    name: templateNamevalue || '',
                    SplitType: '',
                    channelDetailId:
                        _type?.toLowerCase() === 'web'
                            ? WebPushNotifyChannelDetailID
                            : _type?.toLowerCase() === 'mobile'
                                ? MobilePushNotifyChannelDetailID
                                : 0,
                    departmentId,
                    clientId,
                    userId,
                    edmChannelId: edmChannelId || 0,
                };
                const token = localStorage.getItem('accessToken');
                // Update location state with channelDetailId for fromEnvi
                const channelIdToSave = _type.toLowerCase() === 'web' ? 8 : _type.toLowerCase() === 'mobile' ? 14 : 1;
                const updatedSavedChannelsId = { ...(state.savedChannelsId || savedChannelsId) };
                if (!updatedSavedChannelsId[channelIdToSave]?.includes(channelIdToSave)) {
                    updatedSavedChannelsId[channelIdToSave] = [...(updatedSavedChannelsId[channelIdToSave] || []), channelIdToSave];
                }

                const updatedLocationState = {
                    ...(state?.campaignType === 'M'
                        ? {
                            ...state,
                            savedChannelsId: updatedSavedChannelsId,
                            mdcContentSetupDetails: {
                                ...state.mdcContentSetupDetails,
                                channelDetailId: edmChannelId || 0,
                            },
                        }
                        : {
                            ...state,
                            savedChannelsId: updatedSavedChannelsId,
                            channelDetailId: edmChannelId || 0,
                        }),
                    currentIndex: channelId == 8 ? 0 : 1,
                    activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
                    ...getSavedPushChannelFlagPayload(_type)
                };
                const locationEnvi = `?q=${encodeUrl(updatedLocationState)}&channelId=1`;
                let channelDetails = JSON.stringify(params);
                const stateAIBuilder = {
                    mode: 'add',
                    templateName: templateNamevalue,
                    campaignName: state?.campaignName || campaignDetails?.campaignName,
                    startDate: state?.startDate || campaignDetails?.startDate,
                    endDate: state?.endDate || campaignDetails?.endDate,
                    CampaignDate:
                        (state?.startDate || campaignDetails?.startDate) +
                        ' - ' +
                        (state?.endDate || campaignDetails?.endDate),
                    templateType: state?.communicationType || campaignDetails?.communicationType || '',
                    templateCategoryType: temp_templateCategory || 0,
                    templateDate: new Date(),
                    from: 'Communication',
                    campaignId: state?.campaignId || 0,
                    channelId: _type.toLowerCase() === 'web' ? 8 : _type?.toLowerCase() === 'mobile' ? 14 : 1,
                    templateId: 0,
                    channelDetailId:
                        _type?.toLowerCase() === 'web'
                            ? WebPushNotifyChannelDetailID
                            : _type?.toLowerCase() === 'mobile'
                                ? MobilePushNotifyChannelDetailID
                                : 0,
                    departmentId,
                    clientId,
                    userId,
                    edmChannelId: edmChannelId || 0,
                    fromEnvi: locationEnvi,
                    campaignType: campaign['campaignType'],
                    ...(templateData && { data: templateData }),
                    activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
                    ...getSavedPushChannelFlagPayload(_type)
                };
                const encryptState = encodeUrl(stateAIBuilder);

                if (_type?.toLowerCase() === 'web' || _type?.toLowerCase() === 'mobile') {
                    // let channelId = type === 'Web' ? 8 : 14;
                    // let path = `communication/create-communication?q=${encryptState}`
                    // let hId = 2
                    // navigate(`/preferences/template-gallery/push-builder?q=${encryptState}&cId=${channelId}&path=${path}&hId=${hId}`, {
                    //     state: stateAIBuilder,
                    // });
                    navigatePage(state, payloadSubmit, templateNamevalue, data, temp_templateCategory);
                } else {
                    navigate(`/preferences/template-gallery/email-builder?q=${encryptState}`, {
                        state: stateAIBuilder,
                    });
                }
            }
        }
    };
    const navigatePage = (state, payloadSubmit, templateNamevalue, data, temp_templateCategory) => {
        let formState = getValues();
        let _type = Number(channelId) === 8 ? 'web' : Number(channelId) === 14 ? 'mobile' : 'email';

        let params = {
            campaignId: state?.campaignId || 0,
            channelId: _type?.toLowerCase() === 'web' ? 8 : _type?.toLowerCase() === 'mobile' ? 14 : 1,
            templateId: 0,
            segList:
                _type?.toLowerCase() === 'web' || _type?.toLowerCase() === 'mobile' ? payloadSubmit?.audienceCount : 0,
            name: templateNamevalue || '',
            SplitType: '',
            channelDetailId:
                _type?.toLowerCase() === 'web'
                    ? WebPushNotifyChannelDetailID
                    : _type?.toLowerCase() === 'mobile'
                        ? MobilePushNotifyChannelDetailID
                        : 0,
            departmentId,
            clientId,
            userId,
            edmChannelId: edmChannelId || 0,
            activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
            ...getSavedPushChannelFlagPayload(_type)
        };
        const token = localStorage.getItem('accessToken');
        const channelIdToSave = _type?.toLowerCase() === 'web' ? 8 : _type?.toLowerCase() === 'mobile' ? 14 : 1;
        const updatedSavedChannelsId = { ...(state.savedChannelsId || savedChannelsId) };
        if (!updatedSavedChannelsId[channelIdToSave]?.includes(channelIdToSave)) {
            updatedSavedChannelsId[channelIdToSave] = [...(updatedSavedChannelsId[channelIdToSave] || []), channelIdToSave];
        }

        const updatedLocationState = {
            ...(state?.campaignType === 'M'
                ? {
                    ...state,
                    savedChannelsId: updatedSavedChannelsId,
                    mdcContentSetupDetails: {
                        ...state.mdcContentSetupDetails,
                        channelDetailId: edmChannelId || 0,
                    },
                }
                : {
                    ...state,
                    savedChannelsId: updatedSavedChannelsId,
                    channelDetailId: edmChannelId || 0,
                }),
            currentIndex: channelId == 8 ? 0 : 1,
        };
        const locationEnvi = `?q=${encodeUrl(updatedLocationState)}`;
        let channelDetails = JSON.stringify(params);
        const stateAIBuilder = {
            mode: 'add',
            templateName: templateNamevalue,
            campaignName: state?.campaignName || campaignDetails?.campaignName,
            startDate: state?.startDate || campaignDetails?.startDate,
            endDate: state?.endDate || campaignDetails?.endDate,
            CampaignDate:
                (state?.startDate || campaignDetails?.startDate) + ' - ' + (state?.endDate || campaignDetails?.endDate),
            templateType: state?.communicationType || campaignDetails?.communicationType || '',
            templateCategoryType: temp_templateCategory || 0,
            templateDate: getUserCurrentFormat(new Date()).dateFormat,
            from: 'Communication',
            campaignId: state?.campaignId || 0,
            channelId: _type?.toLowerCase() === 'web' ? 8 : _type?.toLowerCase() === 'mobile' ? 14 : 1,
            templateId: 0,
            channelDetailId:
                _type?.toLowerCase() === 'web'
                    ? WebPushNotifyChannelDetailID
                    : _type?.toLowerCase() === 'mobile'
                        ? MobilePushNotifyChannelDetailID
                        : 0,
            departmentId,
            clientId,
            userId,
            edmChannelId: edmChannelId || 0,
            fromEnvi: locationEnvi,
            campaignType: campaign['campaignType'],
            ...(templateData && { data: templateData }),
            activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
            ...getSavedPushChannelFlagPayload(_type)
        };
        const encryptState = encodeUrl(stateAIBuilder);
        let qValue = encryptState;
        const qparams = new URLSearchParams(window.location.search);

        if (qparams.has('q') && qparams.get('q').length > 0) {
            qValue = qparams.get('q');
        }

        if (_type.toLowerCase() === 'web' || _type.toLowerCase() === 'mobile') {
            const jwtToken = localStorage.getItem('jwtToken');
            let buildertype = _type.toLowerCase() === 'web' ? 'webPush' : 'mobilePush';
            let channelId = _type.toLowerCase() === 'web' ? 8 : 14;
            const isMdcFlow =
                window.location.pathname.includes('/communication/create-mdc-communication') ||
                stateAIBuilder?.campaignType === 'M';
            let returnPath = isMdcFlow
                ? `communication/create-mdc-communication`
                : `communication/create-communication`;

            let fromUrl =
                window.location.origin + '/' + returnPath + `?q=${encodeUrl(updatedLocationState)}` + `&hId=2&channelId=${channelId}&typeId=2`;

            const channelDetails = JSON.stringify({
                campaignId: state?.campaignId || 0,
                templateId: 0,
                channelId: channelId,
                segList: payloadSubmit?.audienceCount || 0,
                name: templateNamevalue || '',
                templateName: templateNamevalue || '',
                SplitType: '',
                channelDetailId:
                    _type?.toLowerCase() === 'web'
                        ? WebPushNotifyChannelDetailID
                        : _type?.toLowerCase() === 'mobile'
                            ? MobilePushNotifyChannelDetailID
                            : 0,
                departmentId,
                clientId,
                userId,
                edmChannelId: edmChannelId || 0,
                templateDate: stateAIBuilder.templateDate,
                templateCategory: temp_templateCategory?.categoryName || '',
                ...(templateData && {
                    data: typeof templateData === 'string' ? JSON.parse(templateData) : templateData,
                }),
                activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
                ...getSavedPushChannelFlagPayload(_type)
            });

            window.location.href = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
                token,
            )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(
                clientId,
            )}&userId=${encodeURIComponent(userId)}&departmentId=${encodeURIComponent(
                departmentId,
            )}&templateId=0&mode=add&jwtToken=${encodeURIComponent(jwtToken || '')}&baseURL=${encodeURIComponent(
                baseURL,
            )}&from=${encodeURIComponent(fromUrl)}&builderType=${buildertype}&tname=${encodeURIComponent(
                templateNamevalue,
            )}&tdate=${encodeURIComponent(stateAIBuilder.templateDate)}&tcategory=${encodeURIComponent(
                temp_templateCategory?.categoryName || '',
            )}${show?.templateIndex !== null && show?.templateIndex !== undefined
                ? `&preTemplate=${show.templateIndex}`
                : ''
                }`;
        } else {
            navigate(`/preferences/template-gallery/email-builder?q=${encryptState}`, {
                state: stateAIBuilder,
            });
        }
    };

    const [nameState, setNameState] = useState({
        loading: false,
        isValid: false,
    });
    useEffect(() => {
        if (!!templateName?.name) {
            setValue('templateName', templateName?.name);
        }
    }, [templateName]);
    useEffect(() => {
        if (isShow) {
            setTimeout(() => {
                setFocus('templateName');
            }, 200);
        }
    }, [isShow]);

    return (
        <RSModal
            show={isShow}
            size="md"
            header={TEMPLATE_NAME}
            isCloseDisabled={isDuplicating}
            handleClose={() => {
                if (isDuplicating) return;
                setValue('templateName', '');
                setValue('templateCategory', '');
                clearErrors();
                handleClose();
            }}
            // isCloseButton={false}
            body={
                <form className="page-content-holder" onSubmit={handleSubmit(handleSave)}>
                    <div className="page-content-holder">
                        <div className="form-group mt20">
                            <ListNameExists
                                name="templateName"
                                field="templateName"
                                maxLength={MAX_LENGTH}
                                apiCallback={aiemailBuilder_nameExisit}
                                onValid={(valid) => {
                                    setNameState({
                                        loading: false,
                                        isValid: valid,
                                    });
                                }}
                                condition={({ status }) => {
                                    return !status;
                                }}
                                extraPayload={{ channelId: getTemplateBuilderChannelId(type === 'Web' ? 'web' : type === 'Mobile' ? 'mobile' : 'email') }}
                                placeholder={TEMPLATE_NAME}
                                rules={LIST_NAME_RULES(TEMPLATE_NAME)}
                                customErrorMessage={TEMPLATE_NAME}
                            />
                            {/* <RSInput
                                type={'text'}
                                name={'templateName'}
                                placeholder={TEMPLATE_NAME}
                                control={control}
                                required
                                isValidIcon={nameState?.isValid}
                                isLoading={nameState?.loading}
                                onKeyDown={type === 'Mobile'? charNum : charNumUnderScore}
                                rules={LIST_NAME_RULES(TEMPLATE_NAME)}
                                handleOnBlur={async ({ target: { value } }) => {
                                    if (value.trim()?.length > 2) {
                                        setNameState({
                                            loading: true,
                                            isValid: false,
                                        });
                                        const payload = {
                                            templateName: value,
                                            departmentId,
                                            clientId,
                                            userId,
                                            channelId: type === 'Web' ? 8 : type === 'Mobile' ? 14 : 1,
                                        };
                                        const res = await dispatch(aiemailBuilder_nameExisit({ payload }));
                                        // const res = await dispatch(email_nameExisit({ payload }));
                                        if (res?.status) {
                                            setNameState({
                                                loading: false,
                                                isValid: false,
                                            });
                                            setError('templateName', {
                                                type: 'custom',
                                                message: res?.message || 'Template name already exists',
                                            });
                                        } else {
                                            setNameState({
                                                loading: false,
                                                isValid: true,
                                            });
                                            clearErrors();
                                            // setIsValidFriendlyname(false);
                                        }
                                    }
                                }}
                                handleOnchange={() => {
                                    if (nameState.isValid)
                                        setNameState({
                                            loading: false,
                                            isValid: false,
                                        });
                                }}
                            /> */}
                        </div>
                        <div className="form-group mt20 mb20">
                            <RSKendoDropDown
                                control={control}
                                name="templateCategory"
                                data={categoriesData}
                                textField="categoryName"
                                dataItemKey="templateCategoryId"
                                required
                                label={TEMPLATE_CATEGORY}
                                rules={{
                                    required: SELECT_TEMPLATE_CATEGORY,
                                }}
                                popupSettings={{
                                    popupClass: `addImportAudienceDropdownListContainer`,
                                }}
                                footer={
                                    <RSDropdownFooterBtn
                                        title="Add new category"
                                        handleClick={() => {
                                            handleClose();
                                            onManageCategoriesClick();
                                        }}
                                    />
                                }
                            />
                        </div>
                        <div className="buttons-holder">
                            <RSSecondaryButton
                                blockInteraction={isDuplicating}
                                onClick={() => {
                                    if (isDuplicating) return;
                                    clearErrors();
                                    setValue('templateName', '');
                                    setValue('templateCategory', '');
                                    handleClose();
                                }}
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={() => handleDirect()}
                                isLoading={isDuplicating}
                                blockBodyPointerEvents
                                className={
                                    !nameState.isValid ||
                                    !templateNameWatch ||
                                    !templateCategoryWatch ||
                                    Object.keys(errors).length > 0 ||
                                    isDuplicating
                                        ? 'click-off'
                                        : ''
                                }
                            >
                                {SAVE}
                            </RSPrimaryButton>
                        </div>
                    </div>
                </form>
            }
        />
    );
};

export default TemplateModal;