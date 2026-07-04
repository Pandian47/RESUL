import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { useState, useEffect, useMemo } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import { buildPayload as emailBuildPayload, getSavedPushChannelFlagPayload } from '../../../../constant';
import {
    saveEmailCampaign,
    saveMobilePush,
    saveWebPush,
} from 'Reducers/communication/createCommunication/Create/request';
import { resolvePausedEtSaveEmailThunk } from '../../../../constant';
import { useNavigate } from 'react-router-dom';
import { baseURL, LANDING_BUILDER_REDIRECT_URL } from 'Constants/EndPoints/index';
import { buildPayload as webBuildPayload } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Notification/constant';
import { buildPayload as mobileBuildPayload } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/MobileNotification/constant';

import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import {
    aiemailBuilder_nameExisit,
    delete_Template_AIEmail_byId,
    getTemplate_AIEmail_byId,
    saveTemplate_AIEmail,
} from 'Reducers/preferences/EmailBuilder/request';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import ListNameExists from 'Components/ListNameExists';
import {
    CREATED_ON,
    SELECT,
    CONFIRMATION,
    ARE_YOU_SURE_DELETE,
    CANCEL,
    OK,
    RENAME_TEMPLATE,
    TEMPLATE_NAME,
} from 'Constants/GlobalConstant/Placeholders';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { currentSplitName } from '../../constant';
import usePermission from 'Hooks/usePersmission';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import ResTemplateCard from 'CommonComponents/ResTemplateCard';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import {
    injectPreviewCss,
    isHtmlContent,
    parseStringifiedContent,
    resolveTemplateThumbnailSrc,
} from 'CommonComponents/ResTemplateCard/resTemplateCardUtils';
const DDL_COMMUNICATION_DATA = ['Edit', 'Duplicate', 'Delete', 'Rename'];

const Card = ({
    list,
    type,
    setTemplateFlag,
    setTemplateName,
    categoryData,
    from,
    setPayload,
    setPagerPageConfig,
    setIsCloseSearch,
    onSelect,
    onOptionSelect,
    showOptions = true,
    col = 3,
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState({});
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const {
        getValues,
        setError,
        watch,
        formState: { errors },
        setFocus,
    } = useFormContext();
    const audience = getValues('audience');
    const subjectLine = getValues('subjectLine');
    const layoutPosition = getValues('layoutPosition');
    const deliveryType = getValues('deliveryType');
    const domain = getValues('domain');
    const {
        smtpSettings,
        campaignDetails,
        emailFooter,
        unSubscriptionList,
        senderid_email = [],
    } = useSelector((state) => emailList(state));
    const methods = useForm({
        mode: 'onTouched',
    });
    const [isValidListname, setIsValidListname] = useState(false);
    const renameSaveApi = useApiLoader({ autoFetch: false });
    const deleteTemplateApi = useApiLoader({ autoFetch: false });
    const isSavingRename = renameSaveApi.isFetching;
    const isDeletingTemplate = deleteTemplateApi.isFetching;
    const [modalState, setModalState] = useState({
        showDelete: false,
        showRename: false,
    });
    const { savedChannelsId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);

    const {
        templateName,
        emailhtml,
        edmTemplateId,
        thumbnailPath,
        createdDate,
        templateID,
        html,
        templateCategoryID,
        contentThumbnail,
    } = list;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { permissions } = usePermission();
    const state = useQueryParams('/communication');
    const { timeZoneId } = getUserDetails();
    let mobileApp = watch('mobileApp');
    const [dropdownList, setDropdownList] = useState([]);

    useEffect(() => {
        if (from === 'offer') {
            setDropdownList(['Edit', 'Delete']);
        } else {
            setDropdownList(DDL_COMMUNICATION_DATA);
        }
        if (state && Object.keys(state)?.length) {
            const campaign = {
                campaignId: _get(state, 'campaignId', 0),
                campaignType: _get(state, 'campaignType', 'S'),
            };
            setCampaign(campaign);
            /* MDC variables start*/
            const mdcContentSetupDetails = _get(state, 'mdcContentSetupDetails', {});
            setMdcContentSetupDetails(mdcContentSetupDetails);

            /* MDC variables end*/
        }
    }, [state]);

    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const templateCardDropdownDisabledItems = useMemo(() => {
        const disableList = [];
        if (from === 'offer') return disableList;

        if (!permissions?.updateAccess) {
            disableList.push('Edit', 'Duplicate', 'Rename');
        }
        if (!permissions?.deleteAccess) {
            disableList.push('Delete');
        }
        return disableList;
    }, [permissions?.updateAccess, permissions?.deleteAccess, from]);

    useEffect(() => {
        if (!modalState.showRename) {
            renameSaveApi.reset();
        }
    }, [modalState.showRename]);

    useEffect(() => {
        if (!modalState.showDelete) {
            deleteTemplateApi.reset();
        }
    }, [modalState.showDelete]);

    const handleDropDown = async (value) => {
        if (templateCardDropdownDisabledItems.includes(value)) return;

        if (onOptionSelect) {
            onOptionSelect(value, list);
            return;
        }

        let formState = getValues();
        // console.log('formData template', formState);
        if (value === 'Edit') {
            if ((!audience || audience?.length === 0) && state?.campaignType === 'S') {
                setError('audience', {
                    type: 'custom',
                    message: 'Selected audience bunch empty. Please add audience or select other bunch',
                });
                setFocus('audience');
                return;
            } else if ((!subjectLine || subjectLine.trim() === '') && type?.type !== 'Web' && type?.type !== 'Mobile') {
                //  else if (!subjectLine || subjectLine.trim() === '') {
                setError('subjectLine', {
                    type: 'custom',
                    message: 'Enter subject line',
                });
                setFocus('subjectLine');
                return;
            } else if ((!domain || domain?.length === 0) && type?.type === 'Web') {
                setError('domain', {
                    type: 'custom',
                    message: 'Select domain',
                });
                return;
            } else if (
                (!layoutPosition || layoutPosition?.length === 0) &&
                (type?.type === 'Web' || type?.type === 'Mobile') &&
                deliveryType?.id !== 4
            ) {
                setError('layoutPosition', {
                    type: 'custom',
                    message: 'Select layout',
                });
                return;
            } else if (!errors?.subjectLine && !errors?.audience) {
                formState = {
                    ...campaignDetails,
                    ...formState,
                    ...campaign,
                    splitABCount: 0,
                    splitTabList: [],
                    isSendTestMail: 0,
                    clientId,
                    userId,
                    departmentId,
                    campaignId: state?.campaignId,
                    ...(campaign['campaignType'] === 'M' && mdcContentSetupDetails),
                };
                let payload =
                    type?.type === ''
                        ? emailBuildPayload(formState, '', 'template')
                        : type?.type === 'Web'
                        ? webBuildPayload(formState, 'web', timeZoneId, '')
                        : mobileBuildPayload(formState, timeZoneId, mobileApp);

                const payloadSubmit = {
                    clientId,
                    departmentId,
                    userId,
                    createdBy: userId,
                    campaignId: state?.campaignId,
                    campaignType: state?.campaignType,
                    edmGuid: !!notification[type?.type.toLowerCase()]?.edmGuid
                        ? notification[type?.type.toLowerCase()]?.edmGuid
                        : '',
                    campaignGuid: !!notification[type?.type.toLowerCase()]?.campaignGuId
                        ? notification[type?.type.toLowerCase()]?.campaignGuId
                        : '',
                    audienceCount:
                        formState?.audience &&
                        formState?.audience?.reduce(
                            (prev, cur) =>
                                Number(prev) +
                                Number(
                                    type?.type === 'Mobile' ? cur.recipientCountMobilePush : cur.recipientCountWebPush,
                                ),
                            0,
                        ),
                    ...payload,
                };
                // const payload = buildPayload(formState);
                let dispatchName = saveEmailCampaign;
                let fieldName = 'saveEmailCampaign';
                if (type?.type === 'Web') {
                    dispatchName = saveWebPush;
                    fieldName = 'saveWebPush';
                } else if (type?.type === 'Mobile') {
                    dispatchName = saveMobilePush;
                    fieldName = 'saveMobilePush';
                }

                // let baseURL = 'https://dwiz.resul.io/';

                const token = localStorage.getItem('accessToken');

                let fromEnvi = location.href;

                // const { status, data } = await dispatch(saveEmailCampaign({ payload }));
                const thunkToDispatch =
                    dispatchName === saveEmailCampaign
                        ? resolvePausedEtSaveEmailThunk({
                              payload,
                              savedChannelsId,
                              campaignDetails,
                              locationState: state,
                          })
                        : dispatchName(
                              type?.type === 'Web' || type?.type === 'Mobile'
                                  ? { payload: payloadSubmit, savedChannelsId }
                                  : { payload, savedChannelsId },
                          );

                const { status, data, message = 'No data available' } = await dispatch(thunkToDispatch);
                if (status) {
                    let params = {
                        campaignId: state?.campaignId || 0,
                        templateId: edmTemplateId || 0,
                        channelId: type?.type === 'Web' ? 8 : type?.type === 'Mobile' ? 14 : 1,
                        segList: type?.type === 'Web' || type?.type === 'Mobile' ? payloadSubmit?.audienceCount : 0,

                        name: templateName || '',
                        SplitType: '',
                        // channelDetailId: edmChannelId || 0,
                        channelDetailId:
                            type?.type === 'Web'
                                ? data?.WebPushNotifyChannelDetailID
                                : type?.type === 'Mobile'
                                ? data?.MobilePushNotifyChannelDetailID
                                : data?.edmChannelId || 0,
                        departmentId,
                        clientId,
                        userId,
                        edmChannelId: data?.edmChannelId || 0,
                    };
                    let channelDetails = JSON.stringify(params);

                    const payload = {
                        templateId: templateID || 0,
                        channelId: 1,
                        departmentId,
                        clientId,
                        userId,
                    };

                    const currentChannelDetailId =
                        type?.type === 'Web'
                            ? data?.WebPushNotifyChannelDetailID
                            : type?.type === 'Mobile'
                            ? data?.MobilePushNotifyChannelDetailID
                            : data?.edmChannelId || 0;

                    const isWebOrMobileNotification = type?.type === 'Web' || type?.type === 'Mobile';

                    const channelId = type?.type === 'Web' ? 8 : type?.type === 'Mobile' ? 14 : 1;
                    const channelIdToSave = type?.type === 'Web' ? 8 : type?.type === 'Mobile' ? 14 : 1;
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
                                      channelDetailId: currentChannelDetailId,
                                  },
                              }
                            : {
                                  ...state,
                                  savedChannelsId: updatedSavedChannelsId,
                                  channelDetailId: currentChannelDetailId,
                              }),
                        currentIndex: channelId == 8 ? 0 : 1,
                        templateId: templateID || 0,
                        templateChannelId: channelId,
                    };
                    const locationEnvi = `?q=${encodeUrl(updatedLocationState)}`;
                    let stateAIBuilder = {
                        // data: templateData?.JsonContent,
                        templateId: templateID,
                        mode: 'edit',
                        templateName: templateName,
                        campaignName: state?.campaignName,
                        CampaignDate: state?.startDate + ' - ' + state?.endDate,
                        templateType: state?.communicationType || 'Promotion',
                        from: 'Communication',

                        campaignId: state?.campaignId || 0,
                        channelId: type?.type === 'Web' ? 8 : type?.type === 'Mobile' ? 14 : 1,
                        // channelDetailId:
                        //     type === 'Web'
                        //         ? WebPushNotifyChannelDetailID
                        //         : type === 'Mobile'
                        //         ? MobilePushNotifyChannelDetailID
                        //         : 0,
                        channelDetailId: currentChannelDetailId,
                        edmChannelId: data?.edmChannelId || 0,
                        fromEnvi: locationEnvi,
                        templateCategoryType: categoryData?.filter(
                            (e) => e.templateCategoryId === templateCategoryID,
                        )[0] || {
                            categoryName: 'Business',
                            templateCategoryId: 2,
                        }, //temp_templateCategory || 0,
                        campaignType: campaign['campaignType'],
                        activeSplitName: getValues('splitTest') ? currentSplitName(getValues('currentSplitTab')) : '',
                        ...getSavedPushChannelFlagPayload(type?.type),
                    };

                    if (!isWebOrMobileNotification) {
                        let templateData = await dispatch(getTemplate_AIEmail_byId(payload));

                        if (templateData?.status) {
                            stateAIBuilder.templateDate = templateData?.data?.CreatedDate;
                            const encryptState = encodeUrl(stateAIBuilder);
                            navigate(
                                `/preferences/template-gallery/email-builder?q=${encryptState}&mode=${stateAIBuilder?.mode}`,
                                {
                                    state: stateAIBuilder,
                                },
                            );
                        }
                    } else {
                        navigatePage(
                            state,
                            payloadSubmit,
                            templateName,
                            data,
                            stateAIBuilder.templateCategoryType,
                            stateAIBuilder,
                        );
                        // window.location.href = `${baseURL}${type?.type === 'Web'
                        //         ? 'CommunicationEDMTemplate/WebPushBuilder'
                        //         : type?.type === 'Mobile'
                        //             ? 'CommunicationEDMTemplate/MobilePushBuilder'
                        //             : 'CommunicationEDMTemplate/TemplateBuilder'
                        //     }?accessToken=${encodeURIComponent(token)}&ChannelDetails=${encodeURIComponent(
                        //         channelDetails,
                        //     )}&from=${fromEnvi}`;

                        // window.location.href = `${baseURL}${'CommunicationEDMTemplate/TemplateBuilder'}?accessToken=${encodeURIComponent(
                        //     token,
                        // )}&ChannelDetails=${encodeURIComponent(channelDetails)}&from=${fromEnvi}`;
                    }
                } else {
                    dispatch(
                        update_failures_API_Errors({
                            field: fieldName,
                            message: message || 'No data available',
                        }),
                    );
                }
            }
        } else if (value === 'Duplicate') {
            setTemplateFlag({
                show: true,
                mode: 'duplicate',
            });
            setTemplateName({ name: `${templateName}_copy`, list });
        } else if (value === 'Delete') {
            setModalState((prev) => ({ ...prev, showDelete: true }));
        } else if (value === 'Rename') {
            setModalState((prev) => ({ ...prev, showRename: true }));
        }
    };
    const navigatePage = (state, payloadSubmit, templateNamevalue, data, temp_templateCategory, stateAIBuilder) => {
        const token = localStorage.getItem('accessToken');
        const jwtToken = localStorage.getItem('jwtToken');
        const apiBaseURL = baseURL;

        if (type.type === 'Web' || type.type === 'Mobile') {
            let channelId = type.type === 'Web' ? 8 : 14;
            let buildertype = type.type === 'Web' ? 'webPush' : 'mobilePush';

            // Keep return URL aligned with current flow (SDC vs MDC).
            const isMdcFlow =
                window.location.pathname.includes('/communication/create-mdc-communication') ||
                stateAIBuilder?.campaignType === 'M';
            let returnPath = isMdcFlow
                ? `communication/create-mdc-communication`
                : `communication/create-communication`;
            let fromUrl =
                window.location.origin +
                '/' +
                returnPath +
                stateAIBuilder.fromEnvi +
                `&hId=2&channelId=${channelId}&typeId=2&templateId=${stateAIBuilder?.templateId || 0}`;

            const channelDetails = JSON.stringify({
                campaignId: stateAIBuilder.campaignId,
                templateId: stateAIBuilder.templateId,
                channelId: channelId,
                segList: payloadSubmit?.audienceCount || 0,
                name: templateNamevalue || '',
                templateName: templateNamevalue || '',
                SplitType: '',
                channelDetailId: stateAIBuilder.channelDetailId,
                departmentId,
                clientId,
                userId,
                edmChannelId: stateAIBuilder.edmChannelId || 0,
                templateDate: stateAIBuilder.templateDate,
                templateCategory: temp_templateCategory?.categoryName || '',
            });

            window.location.href = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
                token,
            )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(
                clientId,
            )}&userId=${encodeURIComponent(userId)}&departmentId=${encodeURIComponent(departmentId)}&templateId=${
                stateAIBuilder.templateId
            }&mode=edit&jwtToken=${encodeURIComponent(jwtToken || '')}&baseURL=${encodeURIComponent(
                apiBaseURL,
            )}&from=${encodeURIComponent(fromUrl)}&builderType=${buildertype}&tname=${encodeURIComponent(
                templateNamevalue,
            )}&tdate=${encodeURIComponent(stateAIBuilder.templateDate)}&tcategory=${encodeURIComponent(
                temp_templateCategory?.categoryName || '',
            )}`;
        }
    };

    const confirmRename = async () => {
        const updatedName = methods.getValues('templateName');
        if (!updatedName?.trim() || !isValidListname || isSavingRename) {
            return;
        }
        const payload = {
            templateId: templateID,
            clientId,
            userId,
            departmentId,
            templateName: updatedName,
            isRename: true,
        };
        const res = await renameSaveApi.refetch({
            fetcher: ({ payload: savePayload } = {}) =>
                dispatch(saveTemplate_AIEmail(savePayload, { loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            params: { payload },
        });
        if (res?.status) {
            setModalState((prev) => ({ ...prev, showRename: false }));
            setPayload((pre) => ({
                ...pre,
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
            }));
            setPagerPageConfig((pre) => ({
                ...pre,
                skip: 0,
                take: 4,
            }));
            setIsCloseSearch(true);
        }
    };

    const confirmDelete = async () => {
        if (isDeletingTemplate) return;
        const payload = {
            templateId: templateID,
            clientId,
            userId,
            departmentId,
        };
        let channelId = 1;

        if (type && type.type === 'Web') {
            channelId = 8;
        } else if (type && type.type === 'Mobile') {
            channelId = 14;
        }
        payload.channelId = channelId;
        const res = await deleteTemplateApi.refetch({
            fetcher: ({ payload: deletePayload } = {}) =>
                dispatch(delete_Template_AIEmail_byId(deletePayload, { loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            params: { payload },
        });
        if (res?.status) {
            setModalState((prev) => ({ ...prev, showDelete: false }));
            setPayload((pre) => ({
                ...pre,
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
            }));
            setPagerPageConfig((pre) => ({
                ...pre,
                skip: 0,
                take: 4,
            }));
            setIsCloseSearch(true);
        }
    };

    const resolvedPreviewSource = useMemo(() => {
        const raw = html || thumbnailPath || contentThumbnail || '';
        return parseStringifiedContent(raw);
    }, [html, thumbnailPath, contentThumbnail]);

    const isHtmlPreview = isHtmlContent(resolvedPreviewSource);

    const previewImageSrc = useMemo(() => {
        if (isHtmlPreview) return '';
        return resolveTemplateThumbnailSrc({ thumbnailPath, contentThumbnail });
    }, [isHtmlPreview, thumbnailPath, contentThumbnail]);

    const templatePreviewBody = isHtmlPreview ? (
        <div className="res-template-card__preview res-template-card__preview--scaled">
            <iframe
                title={`preview-${templateName}`}
                srcDoc={injectPreviewCss(resolvedPreviewSource, 'communication')}
                className="res-template-card__preview-iframe res-template-card__preview-iframe--communication"
                tabIndex={-1}
            />
            <div className="res-template-card__preview-blocker" aria-hidden="true" />
        </div>
    ) : !previewImageSrc ? (
        <div className="res-template-card__preview-empty" />
    ) : (
        <div className="res-template-card__preview-image res-template-card__preview-image--communication">
            <img
                alt={templateName}
                src={previewImageSrc}
                onError={(event) => {
                    event.currentTarget.style.display = 'none';
                }}
            />
        </div>
    );

    const createdDateLabel = getUserCurrentFormat(createdDate)?.dateFormat;
    const createdOnLabel = `${CREATED_ON}: ${createdDateLabel}`;

    return (
        <>
            <FormProvider {...methods}>
                <ResTemplateCard
                    col={col}
                    variant="communication"
                    from={from}
                    headerMeta={
                        <TruncatedCell
                            noTable
                            value={createdOnLabel}
                            tooltipText={createdOnLabel}
                            truncateClassName="res-template-card__header-meta-text"
                        />
                    }
                    moreIcon={
                        showOptions ? (
                                    <BootstrapDropdown
                                        data={dropdownList}
                                        disbleItems={templateCardDropdownDisabledItems}
                                        flatIcon
                                        alignRight
                                        isScroll={false}
                                defaultItem={
                                    <i className={`${menu_dot_medium} color-primary-blue icon-md`} />
                                }
                                        showUpdate={false}
                                className="no_caret"
                                        onSelect={(value) => {
                                            handleDropDown(value);
                                        }}
                                    />
                        ) : null
                    }
                    titleNode={
                        <TruncatedCell
                            noTable
                            value={templateName}
                            tooltipText={templateName}
                            truncateClassName="res-template-card__title-text"
                        />
                    }
                    bodyContent={templatePreviewBody}
                    showOverlay
                    actionButtons={
                        <div className="button" onClick={() => onSelect(templateID)}>
                                {SELECT}
                            </div>
                    }
                />
                {modalState.showDelete && (
                    <RSModal
                        show={modalState.showDelete}
                        size="md"
                        isCloseDisabled={isDeletingTemplate}
                        handleClose={() => {
                            if (isDeletingTemplate) return;
                            setModalState((prev) => ({ ...prev, showDelete: false }));
                        }}
                        header={CONFIRMATION}
                        body={
                            <span className="align-items-center d-flex justify-content-center">
                                {ARE_YOU_SURE_DELETE}
                            </span>
                        }
                        footer={
                            <>
                                <RSSecondaryButton
                                    blockInteraction={isDeletingTemplate}
                                    onClick={() => {
                                        if (isDeletingTemplate) return;
                                        setModalState((prev) => ({ ...prev, showDelete: false }));
                                    }}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    onClick={confirmDelete}
                                    isLoading={isDeletingTemplate}
                                    blockBodyPointerEvents
                                >
                                    {OK}
                                </RSPrimaryButton>
                            </>
                        }
                    />
                )}
                {modalState.showRename && (
                    <RSModal
                        show={modalState.showRename}
                        size="md"
                        isCloseDisabled={isSavingRename}
                        handleClose={() => {
                            if (isSavingRename) return;
                            setModalState((prev) => ({ ...prev, showRename: false }));
                            methods.clearErrors('templateName');
                        }}
                        header={RENAME_TEMPLATE}
                        body={
                            <>
                                <ListNameExists
                                    name="templateName"
                                    field="templateName"
                                    maxLength={MAX_LENGTH}
                                    apiCallback={aiemailBuilder_nameExisit}
                                    onValid={(valid) => setIsValidListname(valid)}
                                    condition={({ status }) => {
                                        return !status;
                                    }}
                                    defaultValue={templateName}
                                    extraPayload={{ channelId: 1 }}
                                    placeholder={TEMPLATE_NAME}
                                    rules={LIST_NAME_RULES(TEMPLATE_NAME)}
                                    customErrorMessage={TEMPLATE_NAME}
                                />
                            </>
                        }
                        footer={
                            <>
                                <RSSecondaryButton
                                    blockInteraction={isSavingRename}
                                    onClick={() => {
                                        if (isSavingRename) return;
                                        setModalState((prev) => ({ ...prev, showRename: false }));
                                        methods.clearErrors('templateName');
                                    }}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    onClick={confirmRename}
                                    isLoading={isSavingRename}
                                    blockBodyPointerEvents
                                    className={
                                        !isValidListname || !methods.getValues('templateName')?.trim() || isSavingRename
                                            ? 'click-off'
                                            : ''
                                    }
                                >
                                    {OK}
                                </RSPrimaryButton>
                            </>
                        }
                    />
                )}
            </FormProvider>
        </>
    );
};

export default Card;
