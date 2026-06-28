import { getUserCurrentFormat, getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { LAST30DAYS_DATEFILTER, MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { ARE_YOU_SURE_DELETE, CANCEL, CONFIRMATION, OK, RENAME_TEMPLATE, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import ResTemplateCard from 'CommonComponents/ResTemplateCard';
import {
    injectPreviewCss,
    isHtmlContent,
    parseStringifiedContent,
    TEMPLATE_CARD_IMAGE_SCROLL_THRESHOLD,
} from 'CommonComponents/ResTemplateCard/resTemplateCardUtils';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { baseURL, LANDING_BUILDER_REDIRECT_URL } from 'Constants/EndPoints';
import LandingPageModalDupliacte from '../AllTemplates/ModalDuplicate';

import SettingModal from '../AllTemplates/SettingsModal';
import PublishModal from '../AllTemplates/PublishModal';
import PreviewModal from '../AllTemplates/PreviewModal';
import usePermission from 'Hooks/usePersmission';
import moment from 'moment';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import { FormProvider, useForm } from 'react-hook-form';
import {
    aiemailBuilder_nameExisit,
    delete_Template_AIEmail_byId,
    saveTemplate_AIEmail,
} from 'Reducers/preferences/EmailBuilder/request';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const DDL_COMMUNICATION_DATA = ['Edit', 'Duplicate', 'Preview', 'Publish', 'Settings', 'Delete', 'Rename'];

const Card = ({ list, fetchList, setPayload, setPagerPageConfig, setIsCloseSearch }) => {
    // Guard: list prop may be null/undefined on first render or API edge cases
    const safeList = list || {};
    const { templateName, html, thumbnailPath, templateID, CreatedBy, UpdatedBy, UpdatedDate, createdDate } = safeList;

    // Get templateId from templateID property (confirmed from API response)
    const resolvedTemplateId = templateID || 0;
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const disPatch = useDispatch();
    const [templateFlag, setTemplateFlag] = useState({ show: false, mode: null });
    const [templateNameObj, setTemplateNameObj] = useState({ name: '', list: {} });
    const [templateSettings, setTemplateSettings] = useState(false);
    const [templatePublish, setTemplatePublish] = useState(false);
    const [templatePreview, setTemplatePreview] = useState(false);
    const [modalState, setModalState] = useState({
        showDelete: false,
        showRename: false,
    });
    const [isValidListname, setIsValidListname] = useState(false);
    const methods = useForm({
        mode: 'onTouched',
    });
    const { watch } = methods;
    const renameSaveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const isSavingRename = renameSaveApi.isFetching;
    const isLoadingListName = watch('isLoadingListName');
    const isRenameSubmitting = isSavingRename || isLoadingListName;

    const handleDropDown = (val) => {
        if (val === 'Duplicate') {
            setTemplateFlag({ show: true, mode: 'duplicate' });
            setTemplateNameObj({ name: `${templateName || ''}_copy`, list: safeList });
        }
        if (val === 'Edit') {
            handleEdit();
        }
        if (val === 'Preview') {
            setTemplatePreview(true);
        }
        if (val === 'Publish') {
            setTemplatePublish(true);
        }
        if (val === 'Settings') {
            setTemplateSettings(true);
        }
        if (val === 'Delete') {
            setModalState((prev) => ({ ...prev, showDelete: true }));
        }
        if (val === 'Rename') {
            setModalState((prev) => ({ ...prev, showRename: true }));
        }
    };

    const handleEdit = () => {
        const token = localStorage.getItem('accessToken') || '';
        const jwtToken = localStorage.getItem('jwtToken') || '';
        const tenantId = localStorage.getItem('uuiD') || '';

        let params = {
            templateName: templateName || '',
            channelId: '32',
            catagoryId: '6',
            templateId: resolvedTemplateId,
            departmentId,
            clientId,
            userId,
        };

        // Guard: window.location.origin may not be available in all environments
        const domain =
            typeof window !== 'undefined' && window.location && window.location.origin
                ? window.location.origin + '/'
                : '/';
        let channelDetails = JSON.stringify(params);
        const apiBaseURL = baseURL;

        window.location.href = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
            token,
        )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(clientId)}&userId=${encodeURIComponent(
            userId,
        )}&departmentId=${encodeURIComponent(
            departmentId,
        )}&tenantId=${encodeURIComponent(tenantId)}&templateId=${resolvedTemplateId}&mode=edit&jwtToken=${encodeURIComponent(
            jwtToken,
        )}&baseURL=${encodeURIComponent(apiBaseURL)}&from=${domain}`;
    };

    const confirmRename = async () => {
        const updatedName = methods.getValues('templateName');
        if (!updatedName?.trim() || !isValidListname || isSavingRename) {
            return;
        }

        const payload = {
            templateId: resolvedTemplateId,
            clientId,
            userId,
            departmentId,
            templateName: updatedName,
            isRename: true,
            channelId: 32,
        };

        const res = await renameSaveApi.refetch({
            fetcher: () => disPatch(saveTemplate_AIEmail(payload, { loading: false })),
            loaderConfig: fieldLoaderConfig,
            mode: 'edit',
        });
        if (res?.status) {
            setModalState((prev) => ({ ...prev, showRename: false }));
            if (setPayload && setPagerPageConfig && setIsCloseSearch) {
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
                    },
                }));
                setPagerPageConfig((pre) => ({
                    ...pre,
                    skip: 0,
                    take: 4,
                }));
                setIsCloseSearch(true);
            }
            if (typeof fetchList === 'function') {
                fetchList();
            }
        }
    };

    const confirmDelete = async () => {
        setModalState((prev) => ({ ...prev, showDelete: false }));

        const payload = {
            templateId: resolvedTemplateId,
            clientId,
            userId,
            departmentId,
            channelId: 32,
        };

        const res = await disPatch(delete_Template_AIEmail_byId(payload));
        if (res?.status) {
            if (setPayload && setPagerPageConfig && setIsCloseSearch) {
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
                    },
                }));
                setPagerPageConfig((pre) => ({
                    ...pre,
                    skip: 0,
                    take: 4,
                }));
                setIsCloseSearch(true);
            }
            if (typeof fetchList === 'function') {
                fetchList();
            }
        }
    };

    const disabledItems = (() => {
        let disableList = [];
        if (!updateAccess) {
            disableList = ['Edit', 'Duplicate', 'Rename', 'Publish', 'Settings'];
        }
        if (!deleteAccess) {
            disableList = [...disableList, 'Delete'];
        }

        return disableList;
    })();

    const displayDate = useMemo(() => {
        const hasValidUpdatedDate =
            UpdatedDate && UpdatedDate !== null && UpdatedDate !== '' && moment(UpdatedDate).isValid();

        return hasValidUpdatedDate ? UpdatedDate : createdDate;
    }, [UpdatedDate, createdDate]);

    /**
     * Replace any YouTube <iframe> embed inside the template HTML with a static
     * thumbnail image + YouTube SVG play button overlay.
     */
    const stripYouTubeUI = (rawHtml) => {
        // Guard: must be a non-empty string to run regex on
        if (typeof rawHtml !== 'string' || !rawHtml) return rawHtml || '';

        try {
            return rawHtml.replace(/<iframe\b[^>]*?>([\s\S]*?)<\/iframe>|<iframe\b[^>]*?\/>/gi, (match) => {
                try {
                    // Extract the src attribute value from the matched iframe tag
                    const srcMatch = match.match(/\bsrc=["']([^"']+)["']/i);
                    if (!srcMatch || !srcMatch[1]) return match;
                    const src = srcMatch[1];

                    // Check if it's a YouTube embed URL and extract the 11-char video ID
                    const youtubeMatch = src.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
                    if (!youtubeMatch || !youtubeMatch[1]) return match;

                    const videoId = youtubeMatch[1];
                    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                    // Preserve width/height from the original iframe for correct sizing
                    const widthMatch = match.match(/\bwidth=["']?([^"'\s>]+)["']?/i);
                    const heightMatch = match.match(/\bheight=["']?([^"'\s>]+)["']?/i);
                    const w = widthMatch && widthMatch[1] ? widthMatch[1] : '100%';
                    const h = heightMatch && heightMatch[1] ? heightMatch[1] : '100%';

                    return `<div style="position:relative;width:${w};height:${h};background:#000;overflow:hidden;pointer-events:none;">
                        <img src="${thumbnailUrl}" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;" />
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:68px;height:48px;pointer-events:none;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67 60" style="pointer-events:none;width:100%;height:100%;">
                                <path fill="#FF0000" d="M63 14.87a7.885 7.885 0 00-5.56-5.56C52.54 8 32.88 8 32.88 8S13.23 8 8.32 9.31c-2.7.72-4.83 2.85-5.56 5.56C1.45 19.77 1.45 30 1.45 30s0 10.23 1.31 15.13c.72 2.7 2.85 4.83 5.56 5.56C13.23 52 32.88 52 32.88 52s19.66 0 24.56-1.31c2.7-.72 4.83-2.85 5.56-5.56C64.31 40.23 64.31 30 64.31 30s0-10.23-1.31-15.13z"/>
                                <path fill="#FFF" d="M26.6 39.43L42.93 30 26.6 20.57z"/>
                            </svg>
                        </div>
                    </div>`;
                } catch (_innerErr) {
                    // If anything goes wrong for this single iframe match, leave it as-is
                    return match;
                }
            });
        } catch (_err) {
            // If the outer replace itself throws, return original html untouched
            return rawHtml;
        }
    };

    const imgRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    const previewContent = useMemo(
        () => parseStringifiedContent(html || thumbnailPath || ''),
        [html, thumbnailPath],
    );
    const hasHtmlPreview = isHtmlContent(previewContent);

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
    }, [hasHtmlPreview, thumbnailPath]);

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
                        title="landingPagePreview"
                        srcDoc={injectPreviewCss(stripYouTubeUI(previewContent), 'push')}
                        className="email-preview-iframe"
                        tabIndex={-1}
                    />
                ) : (
                    <img
                        ref={imgRef}
                        alt={templateName || ''}
                        src={thumbnailPath || undefined}
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
        <FormProvider {...methods}>
            <>
                <Col sm={3}>
                    <ResTemplateCard
                        wrapCol={false}
                        col={3}
                        variant="gallery"
                        showStatusAccent={false}
                        headerMeta={
                            <>
                                <span className="rctcb-by-text">Created on : </span>
                                <span className="rct-date">
                                    {getUserCurrentFormat(displayDate)?.dateFormat}
                                </span>
                            </>
                        }
                        moreIcon={
                            <BootstrapDropdown
                                data={DDL_COMMUNICATION_DATA}
                                flatIcon
                                alignRight
                                defaultItem={
                                    <i
                                        className={`${menu_dot_medium} color-primary-blue icon-md`}
                                    />
                                }
                                showUpdate={false}
                                className="no_caret"
                                onSelect={(value) => {
                                    handleDropDown(value);
                                }}
                                disbleItems={disabledItems}
                                isScroll={false}
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
                                    extraPayload={{ channelId: 32 }}
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
                <LandingPageModalDupliacte
                    templateName={templateNameObj}
                    show={templateFlag}
                    fetchList={() => {
                        setTemplateFlag({ show: false, mode: null });
                        // Guard: fetchList is an optional prop, must be a function before calling
                        if (typeof fetchList === 'function') {
                            fetchList();
                        }
                    }}
                    handleClose={() => setTemplateFlag({ show: false, mode: null })}
                    setPayload={setPayload}
                    setPagerPageConfig={setPagerPageConfig}
                    setIsCloseSearch={setIsCloseSearch}
                />
                <SettingModal
                    templateName={templateName}
                    landingPageTemplateId={resolvedTemplateId}
                    list={safeList}
                    show={templateSettings}
                    handleClose={(status) => setTemplateSettings(false)}
                />
                {templatePublish && (
                    <PublishModal
                        templateName={templateName}
                        landingPageTemplateId={resolvedTemplateId}
                        show={templatePublish}
                        handleClose={(status) => setTemplatePublish(false)}
                    />
                )}
                {templatePreview && (
                    <PreviewModal
                        templateName={templateName}
                        landingPageTemplateId={resolvedTemplateId}
                        show={templatePreview}
                        handleClose={(status) => setTemplatePreview(false)}
                    />
                )}
            </>
        </FormProvider>
    );
};

export default Card;
export { Card as ResTemplateCard };
