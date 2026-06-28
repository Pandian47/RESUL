import { encodeUrl } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { DDL_COMMUNICATION_DATA } from './constant';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { ARE_YOU_SURE_DELETE, CANCEL, CONFIRMATION, CREATED_ON, OK, RENAME_TEMPLATE, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import ResTemplateCard from 'CommonComponents/ResTemplateCard';
import {
    injectPreviewCss,
    resolveTemplateThumbnailSrc,
    TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD,
} from 'CommonComponents/ResTemplateCard/resTemplateCardUtils';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { useNavigate } from 'react-router-dom';

import { aiemailBuilder_nameExisit, delete_Template_AIEmail_byId, getTemplate_AIEmail_byId, saveTemplate_AIEmail } from 'Reducers/preferences/EmailBuilder/request';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import { FormProvider, useForm } from 'react-hook-form';
import PreviewModal from '../Components/Modal/PreviewModal/PreviewModal';
import usePermission from 'Hooks/usePersmission';
import { setSavedVersions } from 'Reducers/preferences/EmailBuilder/reducer';
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
}) => {
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
        isTemplateUsedCount
    } = list;
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
        showPreview: false
    });
    const tempClassname = isTemplateUsedCount === 0 ? 'notused' : 'used'
    const navigate = useNavigate();

    //  const utcTimeData = useSelector((state) => getUtcTimeData(state));
    // Use UTC time from API if available, otherwise fallback to system time
    // const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);

    const handleDropDown = async (value, templateName) => {
        if (value === 'Create communication') {
            const state = { selectEmail: true, edmTemplateId: templateID, templateChannelId: 1, };
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
                    startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                    endDate: getYYMMDD(new Date()),
                    // templateCategoryId: ''
                    templateCategoryId: pre?.filteration?.templateCategoryId ?? ''
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
                    startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                    endDate: getYYMMDD(new Date()),
                    templateCategoryId: ''
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
            channelId: 1,
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
            channelId: 1,
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
                data.historyList.forEach(item => {
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
                is5_0: data?.['is5.0']
            };

            const encryptState = encodeUrl(state);
            navigate(`/preferences/template-gallery/email-builder?q=${encryptState}&mode=${state.mode}`, {
                state,
            });
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
    const hasHtmlPreview = Boolean(html?.trim());

    const thumbnailSrc = useMemo(
        () =>
            resolveTemplateThumbnailSrc({
                thumbnailPath,
                contentThumbnail,
                preferRemotePath: true,
            }),
        [thumbnailPath, contentThumbnail],
    );

    useEffect(() => {
        if (hasHtmlPreview) return undefined;

        const checkImageHeight = () => {
            if (!imgRef.current) return;
            const imgHeight =
                imgRef.current.naturalHeight || imgRef.current.offsetHeight;
            setShouldScroll(imgHeight >= TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD);
        };

        const img = imgRef.current;
        if (!img) return undefined;

        img.addEventListener('load', checkImageHeight);
        if (img.complete) checkImageHeight();

        return () => img.removeEventListener('load', checkImageHeight);
    }, [hasHtmlPreview, thumbnailSrc]);

    const bodyContent = (
        <div className="gl-img-scroll-container">
            <div
                className={[
                    'gl-img',
                    shouldScroll ? 'scrollable' : hasHtmlPreview ? 'iframe-container' : 'non-scrollable',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {hasHtmlPreview ? (
                    <iframe
                        title="emailPreview"
                        srcDoc={injectPreviewCss(html, 'email')}
                        className="email-preview-iframe"
                        tabIndex={-1}
                    />
                ) : (
                    <img
                        ref={imgRef}
                        alt={templateName}
                        src={thumbnailSrc || undefined}
                        onLoad={() => {
                            if (!imgRef.current) return;
                            const imgHeight =
                                imgRef.current.naturalHeight || imgRef.current.offsetHeight;
                            setShouldScroll(imgHeight >= TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD);
                        }}
                    />
                )}
            </div>
        </div>
    );

    return (
        <>
            <FormProvider {...methods}>
                <Col sm={3}>
                    <ResTemplateCard
                        wrapCol={false}
                        col={3}
                        variant="gallery"
                        statusClass={tempClassname}
                        headerMeta={
                            <>
                                <span className="rctcb-by-text">{CREATED_ON} : </span>
                                <span className="rct-date">
                                    {getUserCurrentFormat(list?.createdDate)?.dateFormat}
                                </span>
                            </>
                        }
                        moreIcon={
                            <BootstrapDropdown
                                data={DDL_COMMUNICATION_DATA}
                                flatIcon
                                alignRight
                                isScroll={false}
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
                                disbleItems={disabledItems}
                            />
                        }
                        title={templateName}
                        bodyContent={bodyContent}
                    />
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
                        handleClose={() => { setModalState((prev) => ({ ...prev, showPreview: false })); }}
                        data={list?.html}
                    />
                )}
            </FormProvider>
        </>
    );
};

export default Card;

