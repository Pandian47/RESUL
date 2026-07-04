import { checkRFAApproved, checkTrigger, statusIdCheck } from 'Utils/modules/campaignUtils';
import { MAX_LENGTH150 } from 'Constants/GlobalConstant/Regex';
import { ADD_VIEW_IN_BROWSER, EMAIL_NOT_DISPLAYING, INBOX_FIRST_LINE_MESSAGE, INBOX_FIRST_LINE_PREVIEW, RES_75_CHARACTERS, VIEW_IN_BROWSER } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useCallback, useRef, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useFormContext } from 'react-hook-form';
import { EditorTools } from '@progress/kendo-react-editor';
import { Row, Col } from 'react-bootstrap';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import ResTextEditor, { FormatBlockTool } from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import InsertOffer from '../../../../Component/InsertOffer';
import SmartLink from '../../../../Component/SmartLink/SmartLink';
import Personalize from '../../../../Component/Personalize';
import InsertLinks from '../../../../Component/InsertLinks';
import ImageUpload from '../ImageUpload/ImageUpload';

import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import { useSelector } from 'react-redux';
import useQueryParams from 'Hooks/useQueryParams';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import SmartLinkInsertingOverlay from 'Components/SmartLinkInsertingOverlay';

const EmailPersonalizeTool = (props) => <Personalize {...props} alignRight={true} />;

const {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    OrderedList,
    UnorderedList,
    Unlink,
    Subscript,
    Superscript,
    Strikethrough,
} = EditorTools;

const validateEditorContent = (html) => {
    const textContent = html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\u200B/g, '')
        .replace(/\s+/g, ' ');
    if (textContent === ' ') {
        return 'Email content cannot start with empty space. Remove any leading spaces before proceeding.';
    }
    return true;
};

const TextEditor = ({ isSplit = false, fieldName = '', className }) => {
    const {
        control,
        setValue,
        formState: { errors },
        clearErrors,
        watch,
        setError,
        getValues,
    } = useFormContext();
    const [isClickOff, setIsClickOff] = useState(false);
    const [isSmartLinkInserting, setIsSmartLinkInserting] = useState(false);
    const { campaignDetails } = useSelector((state) => emailList(state));
    const isInitializedRef = useRef(false);

    const viewInbrowserName = isSplit ? `${fieldName}.viewInBrowser` : 'viewInBrowser';
    const editorName = isSplit ? `${fieldName}.editorText` : 'editorText';
    const editorErrorMessage = _get(errors, `${editorName}.message`, '');
    const inboxLinePreviewName = isSplit ? `${fieldName}.inboxLinePreview` : 'inboxLinePreview';
    const [viewInBrowser] = watch([viewInbrowserName]);
    const location = useQueryParams('/communication');

    useEffect(() => {
        if (
            checkTrigger(location?.campaignType, location?.endDate) ||
            !statusIdCheck(
                Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null,
                location?.campaignType,
                campaignDetails,
            ) ||
            checkRFAApproved(
                Object.keys(campaignDetails)?.length > 1 ? campaignDetails?.content[0]?.statusId : null,
                campaignDetails?.requestForApproval?.approvarList,
            )
        ) {
            setIsClickOff(true);
        } else {
            setIsClickOff(false);
        }
    }, [location, location?.endDate, campaignDetails]);

    useEffect(() => {
        if (isInitializedRef.current) {
            return;
        }

        const hasExistingCampaign =
            campaignDetails && Object.keys(campaignDetails).length && campaignDetails?.content?.length;

        if (hasExistingCampaign) {
            const content = campaignDetails?.content;
            if (content && content?.length) {
                if (isSplit && fieldName) {
                    const splitType = fieldName.replace('split', '');
                    const splitContent = content.find((item) => item.splitType === splitType);
                    if (splitContent && splitContent.hasOwnProperty('isViewinBrowser')) {
                        setValue(viewInbrowserName, splitContent.isViewinBrowser);
                    } else {
                        setValue(viewInbrowserName, true);
                    }
                    isInitializedRef.current = true;
                } else {
                    if (content[0] && content[0].hasOwnProperty('isViewinBrowser')) {
                        setValue(viewInbrowserName, content[0].isViewinBrowser);
                    } else {
                        setValue(viewInbrowserName, true);
                    }
                    isInitializedRef.current = true;
                }
            } else {
                setValue(viewInbrowserName, true);
                isInitializedRef.current = true;
            }
        } else {
            setValue(viewInbrowserName, true);
            isInitializedRef.current = true;
        }
    }, [campaignDetails, location, isSplit, fieldName, setValue, viewInbrowserName]);

    useEffect(() => {
        const campaignId = location?.campaignId;
        return () => {
            isInitializedRef.current = false;
        };
    }, [location?.campaignId]);

    const SmartLinkWithClass = (props) => (
        <SmartLink
            {...props}
            alignRight={true}
            customClass="email-editor-smartlink"
            onLoadingChange={setIsSmartLinkInserting}
        />
    );

    const SmartLinkTool = (props) => (
        <div className="rs-editor-custom-icon editor-custom-smartlink rseci-icon">
            <SmartLinkWithClass {...props} />
        </div>
    );

    const ImageUploadTool = (props) => (
        <div className="rs-editor-custom-icon editor-custom-image rseci-icon">
            <ImageUpload {...props} />
        </div>
    );

    const applyEditorValidation = useCallback(
        (html) => {
            const error = validateEditorContent(html);
            setValue(editorName, html, { shouldValidate: false });

            if (error && typeof error === 'string') {
                setError(editorName, { type: 'manual', message: error });
            } else {
                clearErrors(editorName);
            }
        },
        [clearErrors, editorName, setError, setValue],
    );

    const handleChange = useCallback(
        (html) => {
            applyEditorValidation(html);
        },
        [applyEditorValidation],
    );

    const handleBlur = useCallback(
        (html) => {
            applyEditorValidation(html);
        },
        [applyEditorValidation],
    );

    const handleFocus = useCallback(() => {
        if (editorErrorMessage) clearErrors(editorName);
    }, [clearErrors, editorErrorMessage, editorName]);

    const emailEditorTools = [
        FormatBlockTool,
        [Bold, Italic, Underline, Strikethrough, Subscript, Superscript],
        [InsertLinks, Unlink, ImageUploadTool],
        [OrderedList, UnorderedList],
        [AlignLeft, AlignCenter, AlignRight, AlignJustify],
        [InsertOffer, EmailPersonalizeTool, SmartLinkTool],
    ];

    const editorClassName = `rs-kendo-editor rsk-dd-start${
        location?.campaignType === 'M' ? ' mdc-email-text-editor' : ''
    }`;

    return (
        <div className={`${className ? className : ''}`}>
            <div className="form-group mt30">
                <Row>
                    <Col sm={3} className="ml17" style={{ width: '20%' }}>
                        <label className="control-label-left">{INBOX_FIRST_LINE_PREVIEW}</label>
                    </Col>
                    <Col
                        sm={6}
                        style={{ width: '544px' }}
                        className={`${isClickOff ? 'pe-none click-off' : ''}position-relative`}
                    >
                        <RSEmojiPickerInput
                            inputName={inboxLinePreviewName}
                            placeholder={INBOX_FIRST_LINE_MESSAGE}
                            maxLength={MAX_LENGTH150}
                            required={false}
                            iconTopspace={false}
                            isEmoji={false}
                        />
                        <small className="bottom5 position-absolute right15">{RES_75_CHARACTERS}</small>
                    </Col>
                </Row>
            </div>
            <div
                className={`d-flex ${
                    viewInBrowser ? 'justify-content-end align-items-center' : 'justify-content-end'
                } my15`}
            >
                {viewInBrowser && (
                    <small className="text-left smaller mr150 pe-none">
                        {EMAIL_NOT_DISPLAYING}{' '}
                        <a href="{{#VIB}}" onClick={(e) => e.preventDefault()} className="click-off pe-none">
                            {VIEW_IN_BROWSER}
                        </a>
                    </small>
                )}
                <span className={`${isClickOff ? 'click-off' : ''}`}>
                    <RSCheckbox
                        control={control}
                        name={viewInbrowserName}
                        labelName={ADD_VIEW_IN_BROWSER}
                        labelClass="mr0 ml5"
                    />
                </span>
            </div>

            {!!editorErrorMessage && <p className="color-primary-red fs15">{editorErrorMessage}</p>}
            <div className={`position-relative ${isClickOff || isSmartLinkInserting ? 'click-off' : ''}`}>
                <SmartLinkInsertingOverlay isLoading={isSmartLinkInserting} />
                <ResTextEditor
                    tools={emailEditorTools}
                    defaultContent={getValues(editorName)}
                    height={200}
                    className="rs-kendo-editor kendo-text-format"
                    editorClassName={editorClassName}
                    responsiveToolbar={false}
                    onFocus={handleFocus}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </div>
        </div>
    );
};

export default TextEditor;
