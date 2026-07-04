import { ENTER_EDITOR_TEXT, SELECT_AUDIENCE } from 'Constants/GlobalConstant/ValidationMessage';
import { LIVE_PREVIEW, PERSONALIZATION } from 'Constants/GlobalConstant/Placeholders';
import { editor_personalize_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTooltip from 'Components/RSTooltip';
import { Fragment, useContext, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import ImageUpload from '../../../../Component/ImageUpload/ImageUpload';
import InsertOffer from '../../../../Component/InsertOffer';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { getRcsList } from 'Reducers/communication/createCommunication/Create/selectors';
import { uploadMessagingImage } from 'Reducers/communication/createCommunication/Create/request';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import Carousel from 'react-bootstrap/Carousel';
import { RCSProvider } from '../../RCS';
import { isCustomParmIncluded, validateCurlyBraces, handlePersonalization } from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';
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
import LivePreview from '../LivePreview/LivePreview';

const RCSTextEditor = ({ fieldName, isSplitTab, isEnableImgUpload = true, index = null, isCarousel = false, splitName = '' }) => {
    const rcsEditorMaxLength = 2000;
    const inputRef = useRef();
    const { backdropRef, syncBackdropScroll } = usePersonalizationHighlight();
    const [isToolbarActive, setIsToolbarActive] = useState(false);
    const { editorRef, getEditorTextarea, restoreTextareaSelection } = useRestrictedPlaceholderEdit(
        'double',
        (allowed) => setIsToolbarActive(allowed)
    );
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { templateContentDetail, editorContent } = useSelector((state) => getRcsList(state));
    const textContentDetail = templateContentDetail[0]?.RCSTemplateJsonDetailModels;
    const context = useContext(RCSProvider);
    const { cTabState, isClickOff, carouselTabs } = context;
    const [selectedCarousel, setSelectedCarousel] = useState(index ?? 0);

    const { setError, formState, control, setValue, trigger, watch, getValues, handleSubmit, setFocus } = useFormContext();
    const { errors } = formState;
    const uploadImageName = isCarousel || isSplitTab ? `${fieldName}.uploadImageName` : 'uploadImageName';
    const previewImageName = isCarousel || isSplitTab ? `${fieldName}.previewImage` : 'previewImage';
    const editorText = isCarousel || isSplitTab ? `${fieldName}.editorText` : 'editorText';
    const titleTextName = isCarousel || isSplitTab ? `${fieldName}.titleText` : 'titleText';
    const actionsName = isSplitTab || isCarousel ? `${fieldName}.actions` : 'actions';

    const TemplateName = isSplitTab ? `${fieldName}.templateName` : 'templateName';
    const [watchEditorText, actions, senderName, titleText, previewImage, templateName] =
        watch([
            editorText,
            actionsName,
            'senderName',
            titleTextName,
            previewImageName,
            TemplateName,
        ]);
    const editorTextContent = isSplitTab ? editorContent?.[fieldName]?.cardDesctiption : editorContent?.cardDesctiption;
    const [tooltip, setTooltip] = useState({
        video: false,
        image: false,
        pdf: false,
    });

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

    const handleImageData = async (base64Image, fileName, contentLength) => {
        if (fileName !== '' && base64Image !== '') {
            let payloadData = {
                base64Image,
                imageFormat: fileName.split('.')?.pop(),
                contentLength,
                //...payload,
            };

            let { data, status, message } = await dispatch(uploadMessagingImage({ payload: payloadData }));
            if (status) {
                setValue(uploadImageName, '');
                setValue(previewImageName, data);
                setTooltip((prev) => ({ ...prev, image: false }));
                return { status: true, message: message };
            } else {
                setValue(uploadImageName, '');
                setValue(previewImageName, '');
                setTooltip((prev) => ({ ...prev, image: false }));
                return { status: false, message: message };
            }
        }
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
            const text = watchEditorText || '';
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

        const text = watchEditorText || '';
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

        if (insertResult.value.length <= rcsEditorMaxLength) {
            setValue(editorText, insertResult.value);
            trigger(editorText);
            inputRef.current = {
                startPoistion: insertResult.newCursorPosition,
                endPosition: insertResult.newCursorPosition,
            };
            restoreTextareaSelection(ta, insertResult.newCursorPosition);
        } else {
            setError(`editorText`, {
                type: 'custom',
                message: `Max. ${rcsEditorMaxLength}`,
            });
        }
    };

    const handleChange = async (smartLinkData, type, isEmoji) => {
        if (type === 'dynamic') {
            insertContentAtCursor(smartLinkData, { isSmartLink: true });
        } else {
            insertContentAtCursor(smartLinkData, { isEmoji: !!isEmoji });
        }
    };

    const getActionBtnContent = (isCarousel, action) => {
        let actionsData = isCarousel ? action : actions
        if (!actionsData?.length) return null;
        return (
            <>
                <div className="d-flex justify-content-center flex-column mt10">
                    {actionsData?.map((item, index) => (
                        <div key={index} className='RCS-cta'>
                            <button className='bg-tertiary-grey p8 w-100 border-r10'>
                                {item?.actionName}
                            </button>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    const getCarouselRenderContent = () => {
        const mapKey = isSplitTab ? carouselTabs?.[splitName] : carouselTabs?.['carousel'];
        if (!mapKey?.length) return null;
        return (
            <Carousel
                interval={isClickOff ? 4000 : null}
                activeIndex={selectedCarousel}
                onSelect={(selectedIndex) => {
                    setSelectedCarousel(selectedIndex)
                }}
                controls={true}
            >
                {mapKey?.map((key, index) => {
                    const item = isSplitTab
                        ? getValues(`${key?.splitName}.${key?.carouselName}`)
                        : getValues(`${key?.carouselName}`);

                    return (
                        <Carousel.Item key={index} className='css-scrollbar'>
                            {!!item?.previewImage && (
                                <>
                                    {item?.bannerType === 'Video' ? (
                                        <video className="d-block w-100" controls>
                                            <source src={item?.previewImage} />
                                        </video>
                                    ) : (
                                        <img className="d-block w-100" src={item?.previewImage} alt={`carousel-img-${index}`} />
                                    )}
                                </>
                            )}
                            <Carousel.Caption className='p12'>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: `<b><p class="mt5 mb2">${item?.titleText}</p></b><p>${item?.editorText}</p>`,
                                    }}

                                />
                                {getActionBtnContent(true, item?.actions)}
                            </Carousel.Caption>

                        </Carousel.Item>
                    );
                })}
            </Carousel>
        );
    };

    return (
        <div>
            <div className="form-group ">
                <Row>
                    {/* Left column starts */}
                    <Col sm={{ offset: 1, span: 6 }}>
                        <div className="rs-textarea-component-wrapper preview-mobile-editor position-relative ">
                            <div className="rstcw-top-icons">
                                <ul className={`float-left ${isToolbarActive ? '' : 'click-off pe-none'}`}>
                                    <li className={`${!isCustomParmIncluded(watchEditorText) ? 'click-off' : ''}`}>
                                        <RSTooltip text={PERSONALIZATION} className="lh0">
                                            <RSBootstrapdown
                                                title="Personalization"
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

                                    <Fragment>
                                        <li
                                            className={`${isEnableImgUpload ? 'click-off' : ''}`}
                                            onMouseEnter={() => {
                                                setTooltip((prev) => ({ ...prev, image: true }));
                                            }}
                                            onMouseLeave={() => {
                                                setTooltip((prev) => ({ ...prev, image: false }));
                                            }}
                                            onClick={() => {
                                                setTooltip((prev) => ({ ...prev, image: false }));
                                            }}
                                            onFocus={() => {
                                                setTooltip((prev) => ({ ...prev, image: false }));
                                            }}
                                        >
                                            <RSTooltip text="Image upload" className="lh0" show={tooltip.image}>
                                                <ImageUpload
                                                    isPrefix={false}
                                                    contentType={'img'}
                                                    isSplit={isSplitTab}
                                                    fieldName={fieldName}
                                                    isbase64={true}
                                                    isWhatsApp
                                                    isRCS
                                                    handleImageData={async (data, fileName, contentLength) => {
                                                        const res = await handleImageData(
                                                            data,
                                                            fileName,
                                                            contentLength,
                                                        );
                                                        return res;
                                                    }}
                                                />
                                            </RSTooltip>
                                        </li>
                                    </Fragment>

                                    <li className={`${!isCustomParmIncluded(watchEditorText) ? 'click-off' : ''}`}>
                                        <InsertOffer insert={(e) => handleChange(e, 'static')} textArea={true} />
                                    </li>
                                </ul>
                                <ul
                                    className={`float-right ${!watchEditorText?.length ? 'click-off' : ''
                                        } position-relative right-10 preview-right`}
                                >
                                    <li className="border-0">
                                        <RSTooltip text={LIVE_PREVIEW} className="lh0">
                                            <i
                                                className={`${eye_medium} icon-md cp`}
                                                id="rs_data_eye"
                                                onClick={() => {
                                                    const audience = getValues('audience');
                                                    if (
                                                        (context?.campaignTypeAndId?.campaignType === 'S' &&
                                                            (audience === undefined || audience?.length === 0))
                                                    ) {
                                                        setError('audience', {
                                                            type: 'custom',
                                                            message: SELECT_AUDIENCE,
                                                        });
                                                        setFocus('audience')
                                                    } else {
                                                        context?.setPreview(true);
                                                    }
                                                }}
                                            />
                                        </RSTooltip>
                                    </li>
                                </ul>
                            </div>
                            <div ref={editorRef} className={`rs-textarea-editor sms ${!isCustomParmIncluded(watchEditorText) ? 'click-off' : ''}`}>
                                {_get(errors, `${editorText}.message`, '') && (
                                    <div className="validation-message color-primary-red">
                                        {_get(errors, `${editorText}.message`, '')}
                                    </div>
                                )}
                                <div
                                    ref={backdropRef}
                                    className="personalization-backdrop"
                                    aria-hidden="true"
                                    dangerouslySetInnerHTML={{ __html: getHighlightedHTML(watchEditorText) }}
                                />
                                <RSTextarea
                                    control={control}
                                    name={editorText}
                                    maxLength={rcsEditorMaxLength}
                                    onKeyUp={(e) => handleSelectionChange(e)}
                                    onClick={(e) => handleSelectionChange(e)}
                                    onBlur={handleEditorBlur}
                                    handleChange={(e) => {
                                        handleSelectionChange(e);
                                        if (backdropRef.current) {
                                            backdropRef.current.innerHTML = getHighlightedHTML(e.target.value);
                                        }
                                    }}
                                    onScroll={syncBackdropScroll}
                                    required={true}
                                    isError={false}
                                    customWebpushClassname="h-100"
                                    rules={{
                                        required: ENTER_EDITOR_TEXT,
                                        validate: (inputValue) => {
                                            let defaultContent = isSplitTab ? editorContent?.[fieldName]?.cardDesctiption : editorContent?.cardDesctiption;
                                            return !!inputValue && !!defaultContent
                                                ? validateCurlyBraces(
                                                    inputValue,
                                                    defaultContent
                                                )
                                                : true;
                                        },
                                    }}
                                />
                            </div>
                        </div>
                        <div className={`rs-editor-bottom-message rsebm-sms`}>
                            <div className={`emr-sms editor-message-right w-100`}>
                                <small>
                                    <span className={`emr-length sms`}>
                                        {watchEditorText?.length}/ {rcsEditorMaxLength}
                                        <span className="emr-info ml3">
                                            (
                                            <span className="text-uppercase">
                                                {Math.max(1, Math.floor((watchEditorText?.length || 0) / 1000))} RCS
                                            </span>
                                            /audience)
                                        </span>
                                    </span>
                                </small>
                            </div>
                        </div>
                        {/* <CustomParams fieldName={fieldName} isSplitAB={isSplitTab} defaultValue={
                                templateContentDetail?.[carouselIndex ?? 0]?.RCSTemplateJsonDetailModels
                                    ?.CardDesctiption
                            }/> */}
                    </Col>
                    <div className="pr0 col-sm-4">
                        <div
                            className={`${!watchEditorText?.length ? 'rs-mobile-preview-disable' : 'rs-mobile-preview-enable'
                                }  RCS-preview `}
                        >
                            <RSMobilePreview
                                previewSource={PREVIEW_SOURCE.AUTHORING}
                                mobileType="ios"
                                bubbleType={{
                                    type: 'rcs',
                                }}
                                barHeight={'medium'}
                                bubbleContent={
                                    watchEditorText?.length &&
                                    !isCarousel &&
                                    `<b>${titleText}</b><p>${watchEditorText}</p>`
                                }
                                searchIcon
                                previewImage={previewImage || ''}
                                customRenderContent={!isCarousel && getActionBtnContent()}
                                caruoselContent={isCarousel && getCarouselRenderContent()}
                                senderName={senderName?.senderName}
                                schedule={getValues(`${fieldName}.schedule`)}
                            />
                        </div>
                    </div>
                </Row>
            </div>
            {context?.preview && (
                <LivePreview
                    show={context?.preview}
                    type="rcs"
                    audience={getValues('audience')}
                    previewImage={previewImage}
                    handleClose={() => context?.setPreview(false)}
                    sendPreview={async (e) => {
                        await handleSubmit(async (data) => {
                            await context.formSubmitHandler(data, 'live', false, true, e);
                        })();
                        context?.setPreview(false);
                    }}
                    dataSource={context?.dataSource}
                    headerContent={isCarousel ? (isSplitTab ? getValues(`${splitName}.editorText`) : getValues(`editorText`)) : ''}
                    carouselContent={(() => {
                        const mapKey = isSplitTab ? context?.carouselTabs?.[splitName] : context?.carouselTabs?.['carousel'];
                        return Array.isArray(mapKey)
                            ? mapKey.map((key, ind) =>
                                isSplitTab
                                    ? getValues(`${key?.splitName}.${key?.carouselName}`)
                                    : getValues(`${key?.carouselName}`)
                            )
                            : [];
                    })()}
                    currData={textContentDetail}
                    actions={actions}
                    isCarousel={isCarousel}
                    editorText={watchEditorText}
                    titleText={titleText}
                />
            )}
        </div>
    );
};

export default RCSTextEditor;
