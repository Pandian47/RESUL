import { ENTER_EDITOR_TEXT, SELECT_AUDIENCE } from 'Constants/GlobalConstant/ValidationMessage';
import { EDIT_CURLY_BRACES, LIVE_PREVIEW, MORE_THAN_ADDITIONAL_CHARGES, PERSONALIZATION, SMART_LINK_POPUP, SMS_AUDIENCE_COUNT } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, editor_personalize_medium, editor_smart_link_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useRef, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import { get as _get, capitalize as _capitalize, upperCase as _upperCase } from 'Utils/modules/lodashReplacements';

import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import InsertOffer from '../../../../Component/InsertOffer';
import { Col, Row } from 'react-bootstrap';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { useSelector } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import RSPPophover from 'Components/RSPPophover';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import { handlePersonalization } from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import { SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID } from 'Constants/GlobalConstant/InputLimit';
import {
    usePersonalizationHighlight,
    getHighlightedHTML,
    useRestrictedPlaceholderEdit,
    canInsertPersonalizationIntoTextarea,
    canInsertSmartLinkIntoTextarea,
    canInsertEmojiIntoTextarea,
    isCaretAllowedPosition,
} from 'Utils/personalizationHighlight';

const SMSTextEditor = (props) => {
    const {
        handleChange,
        smartLinks,
        editorText,
        campaign,
        audienceName,
        setIsFailure,
        setPreview,
        context,
        previewImage,
        levelNumber,
        schedule,
        templateType,
        tooltip,
        fieldName,
        name,
        setTooltip,
        handleImageData,
    } = props;
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { userOTPInfo } = useSelector(({ globalstate }) => globalstate);
    const location = useQueryParams('/communication');

    const {
        control,
        getValues,
        watch,
        setError,
        formState: { errors },
    } = useFormContext();
    const inputRef = useRef();
    const { backdropRef, syncBackdropScroll } = usePersonalizationHighlight();
    const [isToolbarActive, setIsToolbarActive] = useState(false);
    const { editorRef, getEditorTextarea } = useRestrictedPlaceholderEdit(
        'double',
        (allowed) => setIsToolbarActive(allowed)
    );
    const noOfSms = Math.floor(editorText?.length / 161);
    const additionalNo = noOfSms === 3 ? 0 : 1;

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

    const handleToolbarChange = (...args) => {
        const ta = getEditorTextarea();
        const isEmoji = args[2] === 'emoji' || args[1] === 'emoji';
        const isSmartLink = args[1] === 'dynamic';
        const text = editorText || '';
        const saved = inputRef.current;
        const allowed = isEmoji
            ? canInsertEmojiIntoTextarea(ta) ||
              (saved && canInsertEmojiAt(text, saved.startPoistion, saved.endPosition))
            : isSmartLink
              ? canInsertSmartLinkIntoTextarea(ta) ||
                (saved && canInsertSmartLinkAt(text, saved.startPoistion, saved.endPosition))
              : canInsertPersonalizationIntoTextarea(ta) ||
                (saved && canInsertPersonalizationAt(text, saved.startPoistion, saved.endPosition));
        if (!allowed) {
            return;
        }
        handleChange(...args);
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
                                                        <i className={`${editor_personalize_medium} icon-md`} />
                                                    ),
                                                }}
                                                showUpdate={false}
                                                className="no_caret"
                                                onSelect={({ personalizationKey }) =>
                                                    handleToolbarChange(personalizationKey, 'static')
                                                }
                                                showSearch
                                            />
                                        </RSTooltip>
                                    </li>
                                    <li className={`${!smartLinks?.length ? 'click-off' : ''}`}>
                                        <RSTooltip text={SMART_LINK_POPUP} className="lh0">
                                            <RSBootstrapdown
                                                data={smartLinks}
                                                flatIcon
                                                isObject
                                                idKey="id"
                                                fieldKey="menuLabel"
                                                defaultItem={{
                                                    id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                                                    menuLabel: <i className={`${editor_smart_link_medium} icon-md`} />,
                                                }}
                                                showUpdate={false}
                                                name="smartlink"
                                                className="no_caret"
                                                onSelect={(e) => handleToolbarChange(e, 'dynamic')}
                                            />
                                        </RSTooltip>
                                    </li>
                                    <li>
                                        <InsertOffer insert={(e) => handleToolbarChange(e, 'static')} textArea={true} />
                                    </li>
                                </ul>
                                <ul
                                    className={`float-right ${
                                        !editorText?.length ? 'click-off' : ''
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
                                                        campaignType === 'S' &&
                                                        (audience === undefined || audience?.length === 0)
                                                    ) {
                                                        setError(audienceName, {
                                                            type: 'custom',
                                                            message: SELECT_AUDIENCE,
                                                        });
                                                    } else if (
                                                        userOTPInfo === undefined ||
                                                        Object.keys(userOTPInfo)?.length === 0
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
                            </div>
                            <div ref={editorRef} className={`rs-textarea-editor ${context.type}`}>
                                {_get(errors, `${name}.message`, '') && (
                                    <div className="validation-message color-primary-red">
                                        {_get(errors, `${name}.message`, '')}
                                    </div>
                                )}
                                <div
                                    ref={backdropRef}
                                    className="personalization-backdrop"
                                    aria-hidden="true"
                                    dangerouslySetInnerHTML={{ __html: getHighlightedHTML(editorText) }}
                                />
                                <RSTextarea
                                    control={control}
                                    name={name}
                                    maxLength={context.type === 'whatsapp' || 'sms' ? '1000' : '500'}
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
                                    rules={{
                                        required: ENTER_EDITOR_TEXT,
                                        validate: (value) => {
                                            const currentText = value;
                                            const regex = new RegExp(`{{` + '.*?' + `}}`, 'g');
                                            const newText = currentText.replace(regex, '');

                                            if (waSelectedTemplate?.waTemplateId > 0) {
                                                const regex = new RegExp(`{{` + '.*?' + `}}`, 'g');
                                                const waEditorDefaultText = waSelectedTemplate[
                                                    'templateContent'
                                                ].replace(regex, '');

                                                // Remove all `\r` characters if new lines are added to the template content.
                                                const updateWAEditorDefaultText = waEditorDefaultText.replace(
                                                    /\r/g,
                                                    '',
                                                );
                                                const updateNewText = newText.replace(/\r/g, '');
                                                let rslt =
                                                    updateNewText?.trim() === updateWAEditorDefaultText?.trim() ||
                                                    waEditorDefaultText === '' ||
                                                    newText === ''
                                                        ? true
                                                        : EDIT_CURLY_BRACES;

                                                return rslt;
                                            }
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        <div className={`rs-editor-bottom-message ${context.type == 'sms' ? 'rsebm-sms' : ''}`}>
                            <div
                                className={`${
                                    context.type == 'sms'
                                        ? 'emr-sms editor-message-right w-100'
                                        : 'editor-message-right'
                                }`}
                            >
                                <small>
                                    <span className={`${context.type == 'sms' ? 'emr-length sms' : 'emr-length'}`}>
                                        {editorText?.length}/ {context.type === 'whatsapp' || 'sms' ? '1000' : '500'} |
                                        <span className="emr-info ml3">
                                            ({noOfSms + additionalNo}{' '}
                                            <span
                                                className={`${context.type == 'sms' ? 'text-uppercase' : ''} ${
                                                    context.type == 'mms' ? 'text-uppercase' : ''
                                                }`}
                                            >
                                                {/* {_capitalize(context.type)} */}
                                                {context.type == 'whatsapp' ? 'WhatsApp' : context.type}
                                            </span>
                                            /audience)
                                        </span>
                                        {context.type !== 'whatsapp' && (
                                            <RSPPophover
                                                pophover={
                                                    <ul className="rs-tooltip-text-multi">
                                                        <li>
                                                            <span>
                                                                {MORE_THAN_ADDITIONAL_CHARGES}
                                                                {context.type === 'sms'
                                                                    ? _upperCase(context.type)
                                                                    : _capitalize(context.type)}{' '}
                                                                may be incurred.
                                                            </span>
                                                        </li>
                                                        {context.type !== 'whatsapp' && (
                                                            <li>
                                                                <span>{SMS_AUDIENCE_COUNT}</span>
                                                            </li>
                                                        )}
                                                    </ul>
                                                }
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue editor-help-icon ml5`}
                                                    id="circle_question_mark"
                                                />
                                            </RSPPophover>
                                        )}
                                    </span>
                                </small>
                            </div>
                        </div>
                    </Col>
                    {/* /Left column ends */}
                    {/* Right column starts */}
                    <Col sm={4} className="pr0">
                        <div
                            className={`${
                                !editorText?.length ? 'rs-mobile-preview-disable' : 'rs-mobile-preview-enable'
                            } `}
                        >
                            <RSMobilePreview
                                previewSource={PREVIEW_SOURCE.AUTHORING}
                                mobileType="ios"
                                bubbleType={context}
                                barHeight={'medium'}
                                bubbleContent={
                                    context.type === 'whatsapp' ? `<p>${editorText}</p>` : `<p>${editorText}</p>`
                                }
                                searchIcon
                                previewImage={previewImage}
                                schedule={levelNumber < 2 ? schedule : mdcSchedule}
                            />
                        </div>
                    </Col>
                    {/* /Right column ends */}
                </Row>
            </div>
        </div>
    );
};

export default SMSTextEditor;
