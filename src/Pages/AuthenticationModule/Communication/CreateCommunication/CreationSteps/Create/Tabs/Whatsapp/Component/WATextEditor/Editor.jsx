import { CONTENT_SUBSTITUTION_LIMIT_EXCEEDED, SELECT_AUDIENCE } from 'Constants/GlobalConstant/ValidationMessage';
import { EDIT_CURLY_BRACES, LIVE_PREVIEW, PERSONALIZATION, SMART_LINK_POPUP } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium, circle_question_mark_mini, editor_personalize_medium, editor_smart_link_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { MAX_SMART_LINKS, SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID } from 'Constants/GlobalConstant/InputLimit';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import InsertOffer from '../../../../Component/InsertOffer';
import { Col, Row } from 'react-bootstrap';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { useDispatch, useSelector } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import EmojiPicker from 'Components/EmojiPicker';
import ImageUpload from '../../../../Component/ImageUpload/ImageUpload';
import { capitalize as _capitalize, get as _get } from 'Utils/modules/lodashReplacements';
import RSPPophover from 'Components/RSPPophover';
import { getWhatsappUploadConfig } from './contanst';
import MessagingContext from '../../context';
import { getRequestApprovalList, getSessionId } from 'Reducers/globalState/selector';
import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';
import { uploadMessagingImage } from 'Reducers/communication/createCommunication/Create/request';
import { isCustomParmIncluded, validateCurlyBraces, handlePersonalization } from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import SmartLinkInsertingOverlay from 'Components/SmartLinkInsertingOverlay';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import {
    usePersonalizationHighlight,
    getHighlightedHTML,
    useRestrictedPlaceholderEdit,
    buildProgrammaticInsert,
    canInsertPersonalizationIntoTextarea,
    canInsertPersonalizationAt,
    canInsertSmartLinkIntoTextarea,
    canInsertSmartLinkAt,
    canInsertEmojiIntoTextarea,
    canInsertEmojiAt,
    isCaretAllowedPosition,
} from 'Utils/personalizationHighlight';

const Editor = ({ templateResponse, isCarousel, fieldName, isCarouselBody = false, isSplitTabs = false }) => {
    const { type, smartLinks, setPreview, campaign, setIsFailure, buildChannelPayload } = useContext(MessagingContext);
    const inputRef = useRef();
    const dispatch = useDispatch();
    const handleOpenWithAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (smartLinks.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };
    const location = useQueryParams('/communication');
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const approvalList = useSelector((state) => getRequestApprovalList(state));

    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));

    const {
        control,
        getValues,
        watch,
        setError,
        setValue,
        trigger,
        setFocus,
        formState: { errors, dirtyFields, isSubmitted },
    } = useFormContext();

    const [tooltip, setTooltip] = useState({
        video: false,
        image: false,
        pdf: false,
    });
    const waEditorText = isCarousel || isSplitTabs ? `${fieldName}.editorText` : 'editorText';
    // eslint-disable-next-line no-use-before-define -- editorText is watched below; hook only reads it for scroll sync
    const { backdropRef, syncBackdropScroll } = usePersonalizationHighlight();
    const [isToolbarActive, setIsToolbarActive] = useState(false);
    const { editorRef, getEditorTextarea, restoreTextareaSelection } = useRestrictedPlaceholderEdit(
        'double',
        (allowed) => setIsToolbarActive(allowed)
    );
    const interactivityName = isCarousel || isSplitTabs ? `${fieldName}.interactivity` : 'interactivity';
    const actionsName = isCarousel || isSplitTabs ? `${fieldName}.actions` : 'actions';
    const previewImageName = isCarousel || isSplitTabs ? `${fieldName}.previewImage` : 'previewImage';
    const templateNameField = isSplitTabs ? `${fieldName}.templateName` : 'templateName';
    const [editorText, previewImage, actions, senderName, audience, templateName] = watch([
        waEditorText,
        previewImageName,
        actionsName,
        'senderName',
        'audience',
        templateNameField
    ]);

    useEffect(() => {
        const isDirty = _get(dirtyFields, waEditorText);
        if (isDirty || isSubmitted) {
            trigger(waEditorText);
        }
    }, [editorText, trigger, waEditorText, dirtyFields, isSubmitted]);

    const noOfSms = Math.floor(editorText?.length / 161);
    const additionalNo = noOfSms === 3 ? 0 : 1;
    const { currData } = templateResponse;
    const smartLinkInsertLoader = useApiLoader();

    const handleImageData = async (base64Image, fileName, contentLength) => {
        if (fileName !== '' && base64Image !== '') {
            let payloadData = {
                base64Image,
                imageFormat: fileName.split('.')?.pop(),
                contentLength,
                ...payload,
            };

            let { data, status, message } = await dispatch(uploadMessagingImage({ payload: payloadData }));

            if (status) {
                if (isCarousel) {
                    setValue(`${fieldName}.browserImage`, data);
                    setValue(`${fieldName}.previewImage`, data);
                    setValue(`${fieldName}.uploadImage`, data);
                    setFocus('editorText');
                    return { status: true, message: message };
                } else {
                    setValue(`browserImage`, data);
                    setValue(`previewImage`, data);
                    setValue(`uploadImage`, data);
                    // setValue(previewImageName, data);
                    // setValue(previewImageName, data);
                    // setValue(previewImageName, data);
                    //setFocus('editorText');
                    return { status: true, message: message };
                }
            } else {
                return { status: false, message: message };
            }
        }
    };
    const whatsappUploadConfig = useMemo(
        () => getWhatsappUploadConfig(handleImageData, currData?.mediaType, currData),
        [handleImageData, currData?.mediaType],
    );
    const handleChange = async (content, type, isEmoji) => {
        const mdcContentSetupDetails = location?.mdcContentSetupDetails ?? {};

        if (type === 'dynamic') {
            await handleDynamicContent(content, mdcContentSetupDetails);
        } else {
            handleStaticContent(content, isEmoji);
        }
    };

    // Handle dynamic content (smart links)
    const handleDynamicContent = async (content, mdcDetails) => {
        const channelPayload = buildChannelPayload(content, mdcDetails);
        const { status, data } =
            (await smartLinkInsertLoader.refetch({
                fetcher: ({ payload: smartPayload } = {}) =>
                    dispatch(getSmartUrlDetailByChannel({ payload: smartPayload, loading: false })),
                mode: 'create',
                loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                params: { payload: channelPayload },
            })) || {};

        if (status) {
            const { urlName, smartCode, blastSC } = data || {};
            insertContentAtCursor(urlName + smartCode + blastSC, { isSmartLink: true });
        }
    };

    // Handle static content (regular text/emoji)
    const handleStaticContent = (content, isEmoji) => {
        insertContentAtCursor(content, { isEmoji: !!isEmoji });
    };

    const getInsertSelection = (ta, { isEmoji = false, isSmartLink = false } = {}) => {
        if (ta && document.activeElement === ta) {
            const allowed = isEmoji
                ? canInsertEmojiIntoTextarea(ta)
                : isSmartLink
                    ? canInsertSmartLinkIntoTextarea(ta)
                    : canInsertPersonalizationIntoTextarea(ta);
            if (!allowed) return null;
            return { start: ta.selectionStart, end: ta.selectionEnd };
        }
        if (inputRef.current) {
            const text = getValues(waEditorText) || '';
            const start = inputRef.current.startPoistion;
            const end = inputRef.current.endPosition;
            const allowedAt = isEmoji
                ? canInsertEmojiAt(text, start, end)
                : isSmartLink
                    ? canInsertSmartLinkAt(text, start, end)
                    : canInsertPersonalizationAt(text, start, end);
            if (!allowedAt) {
                return null;
            }
            return { start, end };
        }
        return null;
    };

    const insertContentAtCursor = (content, { isEmoji = false, isSmartLink = false } = {}) => {
        const ta = getEditorTextarea();
        const selection = getInsertSelection(ta, { isEmoji, isSmartLink });
        if (!selection) {
            return;
        }

        const text = getValues(waEditorText) || '';
        const insertResult = buildProgrammaticInsert(
            text,
            content,
            selection.start,
            selection.end,
            'double',
            { isEmoji, isSmartLink },
        );
        if (!insertResult) {
            return;
        }

        const substitutedText = (insertResult.value || '').replace(/{{|}}/g, '');
        const limit = currData?.bodyMaxLength || 1024;
        if (substitutedText.length <= limit) {
            setValue(waEditorText, insertResult.value);
            trigger(waEditorText);
            inputRef.current = {
                startPoistion: insertResult.newCursorPosition,
                endPosition: insertResult.newCursorPosition,
            };
            restoreTextareaSelection(ta, insertResult.newCursorPosition);
        } else {
            setError(waEditorText, {
                type: 'custom',
                message: CONTENT_SUBSTITUTION_LIMIT_EXCEEDED,
            });
        }
    };
    // Build channel payload for dynamic content
    // const buildChannelPayload = (content, mdcDetails) => {
    //     const match = content?.id?.match(/\d+/);
    //     const smartLinkNumber = match ? parseInt(match[0], 10) : 0;

    //     const isMDCCampaign = campaign?.campaignType === 'M';
    //     const channelName = isMDCCampaign ? '' : _get(mdcDetails, 'name', '').toLowerCase();

    //     return {
    //         ...payload,
    //         campaignId: campaign?.campaignId,
    //         blastType: '',
    //         channelId: 21,
    //         goalNo: smartLinkNumber,
    //         blastNo: isMDCCampaign ? _get(mdcDetails, 'levelNumber', '') : 1,
    //         parentChannelDetailId: isMDCCampaign ? _get(mdcDetails, 'parentChannelDetailId', 0) : 0,
    //         actionId: isMDCCampaign ? _get(mdcDetails, 'actionId', 0) : 1,
    //         senderId: senderName?.senderName,
    //         subSegmentId: _get(mdcDetails, 'subSegmentId', 0),
    //     };
    // };

    const handleSelectionChange = (e) => {
        const { selectionStart, selectionEnd, value } = e.target;
        if (!isCaretAllowedPosition(value, selectionStart, selectionEnd)) {
            if (document.activeElement !== e.target) {
                return;
            }
            inputRef.current = undefined;
            return;
        }
        inputRef.current = {
            startPoistion: selectionStart,
            endPosition: selectionEnd,
        };
    };

    const handleEditorBlur = (e) => {
        const wrapper = editorRef.current?.closest('.rs-textarea-component-wrapper');
        if (wrapper && e?.relatedTarget && wrapper.contains(e.relatedTarget)) {
            return;
        }
        inputRef.current = undefined;
    };

    return (
        <div>
            <div className={`form-group`}>
                <Row>
                    {/* Left column starts */}
                    <Col className={isCarouselBody ? '' : ''}>
                        
                            {_get(errors, `${waEditorText}.message`, '') && (
                                <div className="wa-editor-error-container">
                                <div className="wa-editor-error-message color-primary-red">
                                    {_get(errors, `${waEditorText}.message`, '')}
                                </div>
                                </div>
                            )}
                        
                        <div className="rs-textarea-component-wrapper preview-mobile-editor position-relative ">
                            <SmartLinkInsertingOverlay isLoading={smartLinkInsertLoader.isLoading} />
                            <div className="rstcw-top-icons">
                                <ul
                                    className={`float-left ${isCustomParmIncluded(
                                        isCarousel ? currData?.cardBody : currData?.templateContent,
                                    ) && isToolbarActive
                                            ? ''
                                            : 'click-off pe-none'
                                        }`}
                                >
                                    <li>
                                        <RSTooltip text={PERSONALIZATION} className="lh0">
                                            <RSBootstrapdown
                                                title={PERSONALIZATION}
                                                data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
                                                isObject
                                                fieldKey="personalizationKey"
                                                flatIcon
                                                defaultItem={{
                                                    attributeName: '',
                                                    dataAttributeId: 0,
                                                    fallbackAttributeName: null,
                                                    personalizationKey: (
                                                        <i
                                                            //title="Personalize"
                                                            className={`${editor_personalize_medium} icon-md`}
                                                        />
                                                    ),
                                                }}
                                                showUpdate={false}
                                                className="no_caret"
                                                onSelect={({ personalizationKey }) =>
                                                    handleChange(personalizationKey, 'static')
                                                }
                                                showSearch
                                            />
                                        </RSTooltip>
                                    </li>
                                    <li className={`emoji-top ${currData?.isUnicode ? '' : 'click-off'}`}>
                                        <EmojiPicker
                                            onEmojiSelect={(e) => handleChange(e.native, 'static', 'emoji')}
                                            isTextEditor
                                        />
                                    </li>
                                    <li>
                                        <RSTooltip text={SMART_LINK_POPUP} className="lh0">
                                            <RSBootstrapdown
                                                data={smartLinks}
                                                flatIcon
                                                isObject
                                                idKey="id"
                                                fieldKey="menuLabel"
                                                defaultItem={{
                                                    id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                                                    menuLabel: (
                                                        <i
                                                            //title="Smart link"
                                                            className={`${editor_smart_link_medium} icon-md`}
                                                        />
                                                    ),
                                                }}
                                                showUpdate={false}
                                                name="smartlink"
                                                className="no_caret"
                                                popupSettings={{
                                                    popupClass: `addImportSmartLinkDropdownListContainer`,
                                                }}
                                                footer={
                                                    smartLinks.length < MAX_SMART_LINKS ? (
                                                        <div
                                                            className="dropdown-footer-item"
                                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                            onClick={handleOpenWithAdd}
                                                        >
                                                            <span>Add Smart Link</span>
                                                            <i className={`${circle_plus_fill_medium} icon-md color-primary-blue`} />
                                                        </div>
                                                    ) : null
                                                }
                                                onSelect={(e) => handleChange(e, 'dynamic')}
                                            />
                                        </RSTooltip>
                                    </li>
                                    <Fragment>
                                        {whatsappUploadConfig.map((config) => {
                                            const {
                                                key,
                                                validTypes,
                                                tooltipKey,
                                                tooltipText,
                                                contentType,
                                                extraProps,
                                                isEligible,
                                                editable,
                                            } = config;

                                            if (!isEligible) return null;
                                            return (
                                                <li
                                                    key={key}
                                                    className={editable ? '' : 'click-off'}
                                                    onMouseEnter={() =>
                                                        setTooltip((prev) => ({ ...prev, [tooltipKey]: true }))
                                                    }
                                                    onMouseLeave={() =>
                                                        setTooltip((prev) => ({ ...prev, [tooltipKey]: false }))
                                                    }
                                                    onClick={() =>
                                                        setTooltip((prev) => ({ ...prev, [tooltipKey]: false }))
                                                    }
                                                >
                                                    <RSTooltip
                                                        text={tooltipText}
                                                        className="lh0"
                                                        show={tooltip[tooltipKey]}
                                                    >
                                                        <ImageUpload
                                                            contentType={contentType}
                                                            isSplit={isCarousel}
                                                            fieldName={fieldName}
                                                            isbase64={true}
                                                            {...extraProps}
                                                        />
                                                    </RSTooltip>
                                                </li>
                                            );
                                        })}
                                    </Fragment>

                                    <li>
                                        <InsertOffer insert={(e) => handleChange(e, 'static')} textArea={true} />
                                    </li>
                                </ul>
                                {!isCarouselBody && (
                                    <ul
                                        className={`float-right ${!editorText?.length ? 'click-off' : ''
                                            } position-relative right-10 preview-right`}
                                    >
                                        <li className="border-0">
                                            <RSTooltip text={LIVE_PREVIEW} className="lh0">
                                                <i
                                                    //title="Preview"
                                                    className={`${eye_medium} icon-md cp`}
                                                    id="rs_data_eye"
                                                    onClick={() => {
                                                        if (
                                                            campaign?.campaignType === 'S' &&
                                                            (audience === undefined || audience?.length === 0)
                                                        ) {
                                                            setError('audience', {
                                                                type: 'custom',
                                                                message: SELECT_AUDIENCE,
                                                            });
                                                            setFocus('audience');
                                                        } else if (
                                                            approvalList === undefined ||
                                                            approvalList?.length === 0
                                                        ) {
                                                            setIsFailure({
                                                                status: true,
                                                                message: 'Key person info not found.',
                                                            });
                                                        } else {
                                                            setPreview(true);
                                                        }
                                                    }}
                                                />
                                            </RSTooltip>
                                        </li>
                                    </ul>
                                )}
                            </div>

                            <div
                                ref={editorRef}
                                className={`rs-textarea-editor ${type} ${isCustomParmIncluded(isCarousel ? currData?.cardBody : currData?.templateContent)
                                        ? ''
                                        : 'click-off'
                                    } ${isCarouselBody ? 'carousel-whatsapp-editor' : ''} ${
                                    smartLinkInsertLoader.isLoading ? 'click-off' : ''
                                }`}
                            >
                                <div
                                    ref={backdropRef}
                                    className="personalization-backdrop"
                                    aria-hidden="true"
                                    dangerouslySetInnerHTML={{ __html: getHighlightedHTML(editorText) }}
                                />

                                <RSTextarea
                                    control={control}
                                    name={waEditorText}
                                    maxLength={currData?.bodyMaxLength}
                                    onKeyUp={(e) => handleSelectionChange(e)}
                                    onClick={(e) => handleSelectionChange(e)}
                                    onBlur={handleEditorBlur}
                                    handleChange={(e) => {
                                        handleSelectionChange(e);
                                        // Sync backdrop immediately — bypasses the 100 ms debounce on field.onChange
                                        if (backdropRef.current) {
                                            backdropRef.current.innerHTML = getHighlightedHTML(e.target.value);
                                        }
                                    }}
                                    onScroll={syncBackdropScroll}
                                    required={true}
                                    isError={false}
                                    customWebpushClassname={'h-100'}
                                    rules={{
                                        validate: (inputValue) => {
                                            if (!(currData?.cardBody || currData?.templateContent)) {
                                                return true;
                                            }
                                            const curlyValidation = validateCurlyBraces(
                                                inputValue,
                                                isCarousel ? currData?.cardBody : currData?.templateContent,
                                            );
                                            if (curlyValidation !== true) {
                                                return curlyValidation;
                                            }

                                            const substitutedText = (inputValue || '').replace(/{{|}}/g, '');
                                            const limit = currData?.bodyMaxLength || 1024;
                                            if (substitutedText.length >= limit || (inputValue || '').length >= limit) {
                                                return CONTENT_SUBSTITUTION_LIMIT_EXCEEDED;
                                            }
                                            return true;
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </Col>

                    {(!!templateName || isSplitTabs || isCarousel) && <div className={`rs-editor-bottom-message`}>
                        <div className={`${'editor-message-right'}`}>
                            <small>
                                <span className={`${'emr-length'}`}>
                                    {editorText?.length}/ {currData?.bodyMaxLength}
                                    {/* <span className="emr-info ml3">
                                        ({noOfSms + additionalNo}{' '}
                                        <span>
                                            {_capitalize(context.type)}
                                            {'message'}
                                        </span>
                                        /contact)
                                    </span> */}
                                    <RSPPophover
                                        pophover={
                                            <ul className="rs-tooltip-text-multi">
                                                <li>{EDIT_CURLY_BRACES}</li>
                                            </ul>
                                        }
                                    >
                                        <i
                                            className={`${circle_question_mark_mini} icon-xs color-primary-blue editor-help-icon ml5 top2`}
                                            id="circle_question_mark"
                                        />
                                    </RSPPophover>
                                </span>
                            </small>
                        </div>
                    </div>
                    }

                    {/* <CustomParams fieldName={fieldName} isCarousel={isCarousel} /> */}
                </Row>
            </div>
        </div>
    );
};

export default Editor;
