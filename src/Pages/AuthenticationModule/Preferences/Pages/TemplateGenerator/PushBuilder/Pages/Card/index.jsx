import { encodeUrl } from 'Utils/modules/crypto';
import { convertToUserTimezone, getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { DDL_COMMUNICATION_DATA } from './constant';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { ARE_YOU_SURE_DELETE, CANCEL, CONFIRMATION, CREATED_ON, OK, RENAME_TEMPLATE, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini, menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { useNavigate } from 'react-router-dom';

import {
    aiemailBuilder_nameExisit,
    delete_Template_AIEmail_byId,
    getTemplate_AIEmail_byId,
    saveTemplate_AIEmail,
} from 'Reducers/preferences/EmailBuilder/request';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import { FormProvider, useForm } from 'react-hook-form';
import PreviewModal from '../Components/Modal/PreviewModal/PreviewModal';
import usePermission from 'Hooks/usePersmission';
import { setSavedVersions } from 'Reducers/preferences/EmailBuilder/reducer';
import { usePushBuilderStateContext } from '../Contex';
import { baseURL, LANDING_BUILDER_REDIRECT_URL } from 'Constants/EndPoints';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const Card = ({
    list,
    setTemplateFlag,
    setTemplateName,
    categoryData,
    setPayload,
    setPagerPageConfig,
    setIsCloseSearch,
    channelId,
}) => {
    const { payload: payloadData } = usePushBuilderStateContext();
    const dispatch = useDispatch();
    const {
        templateName,
        emailhtml,
        edmTemplateId,
        thumbnailPath,
        templateID,
        html,
        createdDate,
        templateCategoryID,
        contentThumbnail,
        isTemplateUsedCount,
    } = list;
    const resolvedTemplateId = templateID || 0;
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const methods = useForm({
        mode: 'onTouched',
    });
    const { watch } = methods;
    const renameSaveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const isSavingRename = renameSaveApi.isFetching;
    const isLoadingListName = watch('isLoadingListName');
    const isRenameSubmitting = isSavingRename || isLoadingListName;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [modalState, setModalState] = useState({
        showDelete: false,
        showRename: false,
        showPreview: false,
    });
    const tempClassname = isTemplateUsedCount === 0 ? 'notused' : 'used';
    const navigate = useNavigate();

    // Helper functions to get timezone-adjusted dates
    const getTimezoneAdjustedStartDate = () => {
        const systemStartDate = new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER));
        return convertToUserTimezone(systemStartDate, { formatAsString: false });
    };

    const getTimezoneAdjustedEndDate = () => {
        const systemEndDate = new Date();
        return convertToUserTimezone(systemEndDate, { formatAsString: false });
    };
    const handleDropDown = async (value, templateName) => {
        if (value === 'Create communication') {
            const state = {
                selectEmail: true,
                edmTemplateId: templateID,
                templateChannelId: payloadData?.channelId || '',
            };
            const encryptState = encodeUrl(state);
            navigate(`/communication/communication-creation?q=${encryptState}`, { state });
        } else if (value === 'Duplicate') {
            setTemplateFlag({ show: true, mode: 'duplicate' });
            setTemplateName({ name: `${templateName}_copy`, list });
        } else if (value === 'Delete') {
            setModalState((prev) => ({ ...prev, showDelete: true }));
        } else if (value === 'Rename') {
            setModalState((prev) => ({ ...prev, showRename: true }));
        } else if (value === 'Preview') {
            setModalState((prev) => ({ ...prev, showPreview: true }));
        } else {
            handleNavigation();
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
            channelId: payloadData?.channelId,
        };
        const res = await renameSaveApi.refetch({
            fetcher: () => dispatch(saveTemplate_AIEmail(payload, { loading: false })),
            loaderConfig: fieldLoaderConfig,
            mode: 'edit',
        });
        if (res?.status) {
            setModalState((prev) => ({ ...prev, showRename: false }));
            setPayload((pre) => ({
                ...pre,
                pagination: {
                    pageNo: 1,
                    recordLimit: 4,
                },
                isFilter: true,
                filteration: {
                    templateName: '',
                    startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                    endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
                    // templateCategoryId: ''
                    templateCategoryId: pre?.filteration?.templateCategoryId ?? '',
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
        setModalState((prev) => ({ ...prev, showDelete: false }));
        const payload = {
            templateId: templateID,
            clientId,
            userId,
            departmentId,
            channelId: payloadData?.channelId,
        };
        const res = await dispatch(delete_Template_AIEmail_byId(payload));
        if (res?.status) {
            setPayload((pre) => ({
                ...pre,
                pagination: {
                    pageNo: 1,
                    recordLimit: 4,
                },
                isFilter: true,
                filteration: {
                    templateName: '',
                    startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                    endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
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

    const handleNavigation = async () => {
        let params = {
            campaignId: 0,
            channelId: payloadData?.channelId,
            templateId: edmTemplateId || 0,
            segList: 0,
            name: templateName || '',
            SplitType: '',
            channelDetailId: 0,
            departmentId,
            clientId,
            userId,
            edmChannelId: 0,
        };

        const payload = {
            templateId: templateID || 0,
            channelId: payloadData?.channelId,
            departmentId,
            clientId,
            userId,
        };
        let { status, data } = await dispatch(getTemplate_AIEmail_byId(payload));

        let channelDetails = JSON.stringify(params);

        // let baseURL = 'https://dwiz.resul.io/';
        const token = localStorage.getItem('accessToken');
        let fromEnvi = location.href;
        // window.location.href = `${baseURL}${'CommunicationEDMTemplate/TemplateBuilder'}?accessToken=${encodeURIComponent(
        //     token,
        // )}&ChannelDetails=${encodeURIComponent(channelDetails)}&from=${fromEnvi}`;
        if (status) {
            // Add historyList to savedVersions using the new reducer
            if (data?.historyList?.length > 0) {
                const historyList = [];
                data.historyList.forEach((item) => {
                    historyList.push({
                        ...item,
                        htmlContent: item.HTML,
                        CreatedDate: item.createdDate,
                        // Remove the old keys to avoid duplication
                        // HTML: undefined,
                        // createdDate: undefined,
                    });
                });
                dispatch(setSavedVersions(historyList));
            }

            const state = {
                data: data?.JsonContent,
                templateId: templateID,
                mode: 'edit',
                templateName: templateName,
                templateDate: createdDate,
                templateType: '',
                templateCategoryType: categoryData?.filter((e) => e.templateCategoryId === templateCategoryID)[0],
                is5_0: data?.['is5.0'],
                channelDetails,
                // Include full API response for builder to hydrate pconfig on edit
                builderApiResponse: data,
            };

            // const encryptState = encodeLargeState(state);
            const encryptState = encodeUrl(state);
            const compressedState = CompressionManager.compress(state, 'zlib');
            let _tempPath = '';
            let qparams = new URLSearchParams(window.location.search);
            if (qparams?.has('path') && qparams?.get('path')?.length > 0) {
                _tempPath = qparams.get('path');
                qparams.delete('path');
            }
            // const builderPath =
            //     // payloadData?.channelId === 14
            //     //     ? '/preferences/template-gallery/mobile-push-builder'
            //     //     :
            //     '/preferences/template-gallery/push-builder';
            // navigate(`${builderPath}?q=${encryptState}&mode=${state.mode}&path=${_tempPath}`, {
            //     state,
            // });
            let domain = location.origin + '/';
            const jwtToken = localStorage.getItem('jwtToken');
            let channelDetailsParsed = typeof params === 'string' ? JSON.parse(params) : params;
            const apiBaseURL = baseURL;
            const buildertype =
                channelDetailsParsed?.channelId === 8
                    ? 'webPush'
                    : channelDetailsParsed?.channelId === 14
                        ? 'mobilePush'
                        : 'webPush';

            window.location.href = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
                token,
            )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(
                clientId,
            )}&userId=${encodeURIComponent(userId)}&departmentId=${encodeURIComponent(
                departmentId,
            )}&templateId=${resolvedTemplateId}&mode=edit&jwtToken=${encodeURIComponent(
                jwtToken || '',
            )}&baseURL=${encodeURIComponent(apiBaseURL)}&from=${domain}&builderType=${buildertype}`;
        }
    };
    const [isValidListname, setIsValidListname] = useState(false);
    const disabledItems = (() => {
        let disableList = [];
        if (!updateAccess) {
            disableList = ['Edit', 'Duplicate', 'Rename', 'Create communication'];
        }
        if (!deleteAccess) {
            disableList = [...disableList, 'Delete'];
        }
        return disableList;
    })();

    const imgRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    const socialFixCss = `
        <style>
            ::-webkit-scrollbar {
                display: none !important;
            }
            body {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
            }
            a, button, input, textarea, select, img {
                pointer-events: none !important;
                cursor: default !important;
            }
        </style>
    `;

    const injectCss = (html) => {
        if (!html) return '';
        if (html.includes('</head>')) return html.replace('</head>', `${socialFixCss}</head>`);
        return `${socialFixCss}${html}`;
    };

    useEffect(() => {
        const checkImageHeight = () => {
            if (imgRef.current) {
                const imgHeight = imgRef.current.height || imgRef.current.naturalHeight || imgRef.current.offsetHeight;
                setShouldScroll(imgHeight >= 240);
            }
        };

        const img = imgRef.current;
        if (img) {
            img.addEventListener('load', checkImageHeight);
            if (img.complete) {
                checkImageHeight();
            }
        }

        return () => {
            if (img) {
                img.removeEventListener('load', checkImageHeight);
            }
        };
    }, [contentThumbnail]);

    return (
        <>
            <FormProvider {...methods}>
                <Col sm={3}>
                    <div className={`gallery-list ${tempClassname}`}>
                        <div className="gl-top">
                            <div className="flex-row">
                                <div className="fr flex-left mt-11 d-inline">
                                    <span className="rctcb-by-text">{CREATED_ON} : </span>
                                    {/* <span className="rct-date">{getDateWithDay(list?.createdDate)}</span> */}
                                    <span className="rct-date">
                                        {getUserCurrentFormat(list?.createdDate)?.dateFormat}
                                    </span>
                                </div>
                                <BootstrapDropdown
                                    data={DDL_COMMUNICATION_DATA}
                                    flatIcon
                                    alignRight
                                    defaultItem={
                                        <i
                                            id="rs_Card_menudot"
                                            className={`${menu_dot_medium} color-primary-blue icon-md`}
                                        />
                                    }
                                    showUpdate={false}
                                    className="no_caret"
                                    onSelect={(value) => {
                                        handleDropDown(value, templateName);
                                    }}
                                    isScroll={false}
                                // disbleItems={disabledItems}
                                />
                            </div>
                            <div className="rsg-campaign-name">
                                {templateName?.length > 25 ? (
                                    <RSTooltip position="top" text={templateName}>
                                        <p>{truncateTitle(templateName, 25)}</p>
                                    </RSTooltip>
                                ) : (
                                    <p>{templateName}</p>
                                )}
                            </div>
                        </div>
                        <div className="gl-body">
                            {/* {templateName} */}
                            <div className="gl-img-scroll-container">
                                <div className={` ${shouldScroll ? 'scrollable' : html && html.trim() ? 'iframe-container' : 'non-scrollable'} ${html && html.trim() ? 'gl-img' : 'gl-img'}`}>
                                    {html && html.trim() ? (
                                        <iframe
                                            title="pushPreview"
                                            srcDoc={injectCss(html)}
                                            className="email-preview-iframe"
                                        />
                                    ) : (
                                        <img
                                            ref={imgRef}
                                            alt={templateName}
                                            // src={`data:image/png;base64,${contentThumbnail}`}
                                            src={
                                                thumbnailPath ? thumbnailPath : `data:image/png;base64,${contentThumbnail}`
                                            }
                                            onLoad={() => {
                                                // Fallback check
                                                if (imgRef.current) {
                                                    const imgHeight =
                                                        imgRef.current.naturalHeight || imgRef.current.offsetHeight;
                                                    setShouldScroll(imgHeight >= 240);
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* <div className="gl-bottom">
                        <RSTooltip position="top" text="Info">
                            <i className={`${circle_info_mini} icon-sm primary-color`} id="rs_data_circle_info"/>
                        </RSTooltip>
                    </div> */}
                    </div>
                </Col>
                {modalState.showDelete && (
                    <RSModal
                        show={modalState.showDelete}
                        size="md"
                        header={CONFIRMATION}
                        handleClose={() => setModalState((prev) => ({ ...prev, showDelete: false }))}
                        body={
                            <span className="align-items-center d-flex justify-content-center">
                                {ARE_YOU_SURE_DELETE}
                            </span>
                        }
                        footer={
                            <>
                                <RSSecondaryButton
                                    onClick={() => setModalState((prev) => ({ ...prev, showDelete: false }))}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton onClick={confirmDelete}>{OK}</RSPrimaryButton>
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
                            if (isRenameSubmitting) return;
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
                                    currentValue={templateName}
                                />
                            </>
                        }
                        footer={
                            <>
                                <RSSecondaryButton
                                    blockInteraction={isRenameSubmitting}
                                    onClick={() => {
                                        if (isRenameSubmitting) return;
                                        setModalState((prev) => ({ ...prev, showRename: false }));
                                        methods.clearErrors('templateName');
                                    }}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    onClick={confirmRename}
                                    isLoading={isSavingRename}
                                    blockBodyPointerEvents={isSavingRename}
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
                {modalState?.showPreview && (
                    <PreviewModal
                        show={modalState?.showPreview}
                        handleClose={() => {
                            setModalState((prev) => ({ ...prev, showPreview: false }));
                        }}
                        data={list?.html}
                    />
                )}
            </FormProvider>
        </>
    );
};

export default Card;

