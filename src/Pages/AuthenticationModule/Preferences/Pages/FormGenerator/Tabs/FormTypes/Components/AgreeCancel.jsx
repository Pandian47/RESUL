import { HTTPS_REGEX, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { AGREE_TERMSCONDITIONS } from 'Constants/GlobalConstant/Placeholders';
import { settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useState } from 'react';
import { useFormContext, useForm, FormProvider } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';

import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { BODYCONFIG, ASTERISK_ICON_DEFAULT } from '../../../constant';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
const AgreeCancel = ({ selectedColor, preview, index, labelName, formState, isQrPreview = false }) => {
    const { control, setValue, getValues, watch, clearErrors, formState: { errors } } = useFormContext();
    const allValues = getValues()
    const mandatory = getValues(`formGenerator[${index}].mandatoryAgree`);
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    
    // State for hyperlink popup
    const [showHyperlinkPopup, setShowHyperlinkPopup] = useState(false);
    
    let data = watch();
    const AgreeCheckbox = data?.AgreeCheckbox || false
    const stripText = (html) => {
        if (!html) return '';
        const noTags = html.replace(/<[^>]*>/g, ' ');
        return noTags.replace(/\u00A0/g, ' ').trim();
    };
    const decodeHtmlEntities = (text = '') => {
        if (!text) return '';
        if (typeof window !== 'undefined' && window.document) {
            const parser = window.document.createElement('textarea');
            parser.innerHTML = text;
            return parser.value;
        }
        return text.replace(/&amp;/gi, '&');
    };
    const trimBlankLines = (html) => {
        if (!html) return '';
        let s = html.trim();
        const proseMirrorLeadingRe = /^(?:\s|<p>\s*<br\s+class=["']ProseMirror-trailingBreak["']\s*\/?>\s*<\/p>)+/gi;
        while (proseMirrorLeadingRe.test(s)) {
            s = s.replace(proseMirrorLeadingRe, '');
        }
        s = s.replace(/^(<p>)+/gi, '<p>');
        s = s.replace(/&nbsp;/gi, ' ');
        const leadingRe = /^(?:\s|<br\s*\/?\s*>|<p>\s*(?:<br\s*\/?\s*>\s*)*\s*<\/p>)+/i;
        const trailingRe = /(?:\s|<br\s*\/?\s*>|<p>\s*(?:<br\s*\/?\s*>\s*)*\s*<\/p>)+$/i;
        while (leadingRe.test(s)) s = s.replace(leadingRe, '');
        while (trailingRe.test(s)) s = s.replace(trailingRe, '');
        return s;
    };
    const rawAgreeHtml = isQrPreview ? AGREE_TERMSCONDITIONS : data?.tinyMceLableAgree;
    const cleanedAgreeHtml = trimBlankLines(rawAgreeHtml);
    const displayAgreeHtml = preview ? cleanedAgreeHtml : rawAgreeHtml;
    const hasMeaningfulAgreeText = stripText(displayAgreeHtml).length > 0;
    
    // Function to clear error when terms and conditions text changes
    const handleTermsChange = () => {
        clearErrors('tinyMceLableAgree');
    };
    
    // Create a separate form context for the hyperlink modal
    const hyperlinkMethods = useForm({
        defaultValues: {
            url: '',
            title: 'terms and conditions',
            openInNewWindow: true
        }
    });

    // Watch for URL changes and clear errors
    const watchedUrl = hyperlinkMethods.watch('url');
    useEffect(() => {
        if (watchedUrl && hyperlinkMethods.formState.url) {
            hyperlinkMethods.clearErrors('url');
        }
    }, [watchedUrl, hyperlinkMethods]);

    // Function to handle hyperlink insertion
    const handleInsertHyperlink = () => {
    const formData = hyperlinkMethods.getValues();

        // Check if URL is valid before proceeding
        if (!formData.url.trim()) {
            return; // Don't proceed if URL is empty
        }
        
        // Validate URL format
    const urlPattern = HTTPS_REGEX;
    if (!urlPattern.test(formData.url)) {
        hyperlinkMethods.setError('url', {
            type: 'pattern',
            message: ENTER_VALID_URL,
        });
        return;
    }

    const target = formData.openInNewWindow ? ' target="_blank"' : '';
    const titleAttr = formData.title?.trim() ? ` title="${formData.title.trim()}"` : '';

    const currentText = getValues('tinyMceLableAgree') || '';

        // Extract text content from existing HTML (remove existing links but keep the text)
        const textContent = currentText.replace(/<[^>]*>/g, '').trim() || formData.title;
        
        // Create new hyperlink with the existing text content
    const hyperlinkHtml = `<a href="${formData.url}"${target}${titleAttr}>${textContent}</a>`;
        
        // Update the terms and conditions text with hyperlink
    setValue('tinyMceLableAgree', hyperlinkHtml);
        // Clear any existing errors when URL is updated
    clearErrors('tinyMceLableAgree');
    setShowHyperlinkPopup(false);

        // Reset hyperlink form
    hyperlinkMethods.reset({
        url: '',
        title: 'terms and conditions',
        openInNewWindow: true,
    });
};

    
    // Function to handle opening hyperlink modal
const handleOpenHyperlinkModal = () => {
    const currentText = getValues('tinyMceLableAgree') || '';

        // Check if current text contains a link
    const linkMatch = currentText.match(/<a\s+([^>]*?)>(.*?)<\/a>/i);

    if (linkMatch) {
        const linkAttributes = linkMatch[1];
        const linkText = decodeHtmlEntities(linkMatch[2]?.trim() || '');

        // Extract href
        const hrefMatch = linkAttributes.match(/href\s*=\s*["']([^"']*?)["']/i);
        const href = hrefMatch ? hrefMatch[1] : '';

        // Extract target
        const targetMatch = linkAttributes.match(/target\s*=\s*["']([^"']*?)["']/i);
        const openInNewWindow = targetMatch && targetMatch[1] === '_blank';

        // Extract title
        const titleMatch = linkAttributes.match(/title\s*=\s*["']([^"']*?)["']/i);
        const titleAttr = titleMatch ? decodeHtmlEntities(titleMatch[1]) : linkText || 'terms and conditions';

        // Pre-fill the form with existing link data
        hyperlinkMethods.reset({
            url: href,
            title: titleAttr,
            openInNewWindow,
        });
    } else {
            // No existing link, use default values
        const textContent = decodeHtmlEntities(currentText.replace(/<[^>]*>/g, '').trim());
        hyperlinkMethods.reset({
            url: '',
            title: textContent || 'terms and conditions',
            openInNewWindow: true,
        });
    }

    setShowHyperlinkPopup(true);
};

    // Function to handle modal close
    const handleModalClose = () => {
        setShowHyperlinkPopup(false);
        hyperlinkMethods.reset({
            url: '',
            title: 'terms and conditions',
            openInNewWindow: true
        });
    };
    return (
        <>
        {preview && <div className= {`agree-preview rsfch-label ${preview ? '' : 'mr-35'}`}></div>}
        <div className={`rsbecw-row ${preview? 'agree-row': ''}`} key={index}>
            <div className="rs-pop-view" style={{ background: selectedColor }}>
                <div
                    className={`${preview ? 'fbc-preview position-relative' : 'form-builder-component'} ${
                        mandatoryValue ? 'agree-terms-required AgreeForm' : 'agree-terms-optional AgreeForm'
                    }`}
                >
                    <div className={`rs-form-element-wrapper ${preview || allValues?.formStyles?.formLayout === 'noLabels' ? 'justify-content-start' : allValues?.isProgressiveProfiling && !preview ? 'justify-content-center offset-3 position-relative left-15': allValues?.formStyles?.formLayout === 'horizontal' ? 'justify-content-center offset-3 position-relative left12' : 'justify-content-center offset-3 position-relative right5'}`}>
                        <div className= {`${preview ? '' :'rs-form-content-holder gap2 justify-content-center w-100'} `}>
                            <div className={`rsfch-full w-100 ${!preview && errors?.tinyMceLableAgree ? 'position-relative top12' : ''}`}>
                                <ul className={`d-flex ${preview && !AgreeCheckbox ? 'd-none' : ''} ${preview ? '' :'gap-3 align-items-center'}`}>
                                    <li className="flex-shrink-0">
                                        {preview ? (
                                            <RSCheckbox
                                                className={`smaller  ${preview ? '' : 'ml65'}`}
                                                name="AgreeCheckbox"
                                                control={control}
                                                required={mandatoryValue}
                                                defaultValue={false}
                                            />
                                        ) : (
                                            <RSSwitch
                                                className="smaller ml5"
                                                name="AgreeCheckbox"
                                                control={control}
                                                defaultValue={AgreeCheckbox}
                                                // rules={mandatoryValue ? { required: true } : {}}
                                                onLabel="On"
                                                offLabel="Off"
                                            />
                                        )}
                                    </li>
                                    <li className={`${watch('AgreeCheckbox') ? '' : 'click-off'} flex-grow-1`}>
                                        {preview ? (
                                            <div
                                                className="rs-agree-preview-html w-100 text-break"
                                                dangerouslySetInnerHTML={{ __html: displayAgreeHtml }}
                                            />
                                        ) : (
                                            <div className="w-100 text-break">
                                                 <RSEditorPopup
                                                     name={`tinyMceLableAgree`}
                                                     control={control}
                                                     init={BODYCONFIG}
                                                     hideErrorMessage
                                                     handleChange={handleTermsChange}
                                                     initialValue={cleanedAgreeHtml}
                                                     required
                                                     hideLinkTools={true}
                                                 />
                                            </div>
                                        )}
                                    </li>
                                </ul>
                                 {/* Display error message for terms and conditions */}
                                    {!preview && errors?.tinyMceLableAgree && (
                                    // <li key="agree-error" className="w-100 d-block" >
                                        <small className="float-start error-message text-danger position-relative left77 ">
                                            {errors.tinyMceLableAgree.message}
                                        </small>
                                    // </li>
                                    )}
                            </div>
                        </div>
                        {mandatoryValue && preview && <span className="rs-form-mandatory position-absolute top-50 translate-middle-y" style={{ right: '-20px' }}>*</span>}
                        {!preview && (
                            // <div className="rs-form-properties-holder">
                            //     <div className="rsfph-icons position-relative top3">
                            //         <i
                            //             name={`formGenerator[${index}].mandatoryAgree`}
                            //             className={
                            //                 mandatoryValue
                            //                     ? `${ASTERISK_ICON} color-primary-red`
                            //                     : `${ASTERISK_ICON} color-secondary-grey`
                            //             }
                            //             onClick={() => {
                            //                 setMandatoryValue(!mandatoryValue);
                            //                 setValue(`formGenerator[${index}].mandatoryAgree`, !mandatoryValue);
                            //             }}
                            //         ></i>
                            //     </div>
                            <div className="rs-form-properties-holder">
                                <div className="rsfph-icons">
                                    <ul className="d-flex align-items-center rs-list-inline rli-space-5 position-relative">
                                        <li className=''>
                                            <RSTooltip position="top" text="Set as mandatory">
                                                <i
                                                    name={`formGenerator[${index}].mandatoryAgree`}
                                                    className={
                                                        `${mandatoryValue
                                                            ? `${ASTERISK_ICON_DEFAULT} color-primary-red`
                                                            : `${ASTERISK_ICON_DEFAULT} color-secondary-grey `} `
                                                    }
                                                    onClick={() => {
                                                        setMandatoryValue(!mandatoryValue);
                                                        setValue(
                                                            `formGenerator[${index}].mandatoryAgree`,
                                                            !mandatoryValue,
                                                        );
                                                    }}
                                                ></i>
                                            </RSTooltip>
                                        </li>
                                        {true && (
                                            <li className=''>
                                                <RSTooltip position="top" text="Hyperlink settings">
                                                    <i
                                                        className={`${settings_medium} icon-md color-primary-blue position-relative`}
                                                        onClick={() => handleOpenHyperlinkModal()}
                                                        style={{ cursor: 'pointer' }}
                                                    ></i>
                                                </RSTooltip>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* {
                DEFAULT_FIELDS.map((item, index) => {
                    const Component = item.component;
                    return (
                        <div className="rsbecw-row" key={index}>
                            <div className="rs-pop-view" style={{ background: selectedColor }}>
                                <Component index={index} {...item} preview={preview} />
                            </div>
                        </div>
                    );
                })
            } */}
            </div>
            
            {/* Hyperlink Settings Popup */}
            <RSModal
                show={showHyperlinkPopup}
                handleClose={handleModalClose}
                header="Insert hyperlink"
                size="md"
                footer={
                    <div className="buttons-holder mt0">
                        <RSSecondaryButton onClick={handleModalClose}>
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                        className = {watchedUrl === '' ?'click-off pe-none' :''}
                            onClick={handleInsertHyperlink}
                            disabled={!hyperlinkMethods.watch('url')?.trim() || !!hyperlinkMethods.formState.url}
                        >
                            Insert
                        </RSPrimaryButton>
                    </div>
                }
                body={
                    <FormProvider {...hyperlinkMethods}>
                        <div className="form-group">
                            <RSInput
                                name="url"
                                type="text"
                                placeholder="Web address"
                                maxLength={MAX_LENGTH75}
                                control={hyperlinkMethods.control}
                                className="form-control"
                                required
                               rules={{
                                   pattern: {
                                     value: HTTPS_REGEX,
                                     message: ENTER_VALID_URL,
                                    },
                                 }}
                            />
                        </div>
                        
                        <div className="">
                            <RSInput
                                name="title"
                                type="text"
                                placeholder="Link title"
                                control={hyperlinkMethods.control}
                                className="form-control"
                            />
                        </div>
                        
                        <div className="">
                            <RSCheckbox
                                name="openInNewWindow"
                                control={hyperlinkMethods.control}
                                labelName="Open link in new window"
                                defaultValue={true}
                            />
                        </div>
                    </FormProvider>
                }
            />
        </div>
        </>
    );
};

export default memo(AgreeCancel);
