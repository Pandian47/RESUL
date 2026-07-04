import { CANCEL, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { editor_link_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { EditorUtils } from '@progress/kendo-react-editor';

import RSModal from 'Components/RSModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const LINK_TYPES = [
    { id: 'FTF', name: 'Forward to Friend', value: '{{#FTF}}' },
    { id: 'UNSUB', name: 'Unsubscribe', value: '{{#UNSUB}}' },
    { id: 'EMAIL', name: 'Email', value: 'mailto:', prefix: 'mailto:', placeholder: 'Enter email' },
    { id: 'TELEPHONE', name: 'Telephone', value: 'tel:', prefix: 'tel:', placeholder: 'Enter phone number' },
    { id: 'SMS', name: 'SMS', value: 'sms:', prefix: 'sms:', placeholder: 'Enter phone number' },
    { id: 'URL', name: 'URL', value: '', prefix: '', placeholder: 'URL' },
    { id: 'CUSTOM_LINK', name: 'Custom link', value: '', prefix: '', placeholder: 'Enter custom link' },
];

const OPEN_IN_OPTIONS = [
    { id: 'new', name: 'New window' },
    { id: 'same', name: 'Same window' },
];

const InsertLinks = (props) => {
    const { view } = props;
    const [show, setShow] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [hasSelectedText, setHasSelectedText] = useState(false);

    const methods = useForm({
        mode: 'onTouched', // Only validate on submit, not on change/blur
        defaultValues: {
            linkType: null,
            url: '',
            title: '',
            openIn: OPEN_IN_OPTIONS[0],
            selectedText: '',
        },
    });

    const {
        control,
        setValue,
        getValues,
        watch,
        handleSubmit,
        reset,
        formState: { errors },
        trigger,
        setError,
        clearErrors
    } = methods;

    // Only watch linkType to conditionally render fields, avoid watching all fields
    const linkType = watch('linkType');

    // Helper function to detect if text contains a URL
    const detectUrl = (text) => {
        if (!text) return null;
        const urlPattern = /(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|sms:[^\s]+)/i;
        const match = text.match(urlPattern);
        return match ? match[0] : null;
    };

    // Helper function to extract link information from ProseMirror selection
    const extractLinkInfo = (state, selection, view) => {
        if (selection.empty) return null;
        
        const { from, to } = selection;
        const linkMark = state.schema.marks.link;
        const selectedText = state.doc.textBetween(from, to);
        
        // Check if selection has a link mark by checking the entire range
        let linkMarkFound = null;
        
        // Check marks at the start position
        const marksAtStart = state.doc.resolve(from).marks();
        linkMarkFound = marksAtStart.find(mark => mark.type === linkMark);

        // If not found at start, check if we're inside a link by checking parent nodes
        if (!linkMarkFound) {
            // Check if the entire selection is within a link mark
            state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.marks) {
                    const linkInNode = node.marks.find(mark => mark.type === linkMark);
                    if (linkInNode) {
                        linkMarkFound = linkInNode;
                        return false; // Stop iteration
                    }
                }
            });
        }
        
        // Also try to extract from DOM if available
        let domLinkInfo = null;
        if (view) {
            try {
                const startPos = view.domAtPos(from);
                const endPos = view.domAtPos(to);
                const range = document.createRange();
                range.setStart(startPos.node, startPos.offset);
                range.setEnd(endPos.node, endPos.offset);
                
                // Check if selection contains or is within an anchor tag
                const container = range.commonAncestorContainer;
                let anchorElement = null;
                
                if (container.nodeType === Node.ELEMENT_NODE) {
                    anchorElement = container.closest('a');
                } else {
                    anchorElement = container.parentElement?.closest('a');
                }
                
                // If no direct anchor found, search for anchor elements that contain the selected text
                // if (!anchorElement && selectedText) {
                //     // Find all anchor tags in the editor view
                //     const editorElement = view.dom;
                //     const allAnchors = editorElement.querySelectorAll('a');
                    
                //     for (let anchor of allAnchors) {
                //         const anchorText = anchor.textContent?.trim() || '';
                //         const selectedTextTrimmed = selectedText.trim();
                        
                //         // Check if selected text matches the anchor text exactly
                //         if (anchorText === selectedTextTrimmed) {
                //             anchorElement = anchor;
                //             break;
                //         }
                //     }
                // }
                
                if (anchorElement) {
                    // Check if this is a link inserted through this component and get the specific class
                    const linkClasses = ['rs-insert-link-ftf', 'rs-insert-link-unsub', 'rs-insert-link-url', 'rs-insert-link-email', 'rs-insert-link-telephone', 'rs-insert-link-sms', 'rs-insert-link-custom'];
                    const foundClass = linkClasses.find(cls => anchorElement.classList.contains(cls));
                    domLinkInfo = {
                        href: anchorElement.getAttribute('href') || '',
                        title: anchorElement.getAttribute('title') || '',
                        target: anchorElement.getAttribute('target') || '_self',
                        class: foundClass || undefined,
                    };
                }
            } catch (e) {
                // DOM extraction failed, continue with mark-based extraction
            }
        }
        if (linkMarkFound) {
            const target = linkMarkFound.attrs.target || domLinkInfo?.target || '_self';
            return {
                href: linkMarkFound.attrs.href || domLinkInfo?.href || '',
                title: linkMarkFound.attrs.title || domLinkInfo?.title || '',
                target: target === '_blank' ? OPEN_IN_OPTIONS.find(opt => opt.id === 'new') : OPEN_IN_OPTIONS.find(opt => opt.id === 'same'),
                class: linkMarkFound.attrs.class || domLinkInfo?.class,
            };
        }
        
        // If we found link info in DOM but not in marks, use DOM info
        if (domLinkInfo && domLinkInfo.href) {
            const target = domLinkInfo.target === '_blank' ? OPEN_IN_OPTIONS.find(opt => opt.id === 'new') : OPEN_IN_OPTIONS.find(opt => opt.id === 'same');
            return {
                href: domLinkInfo.href,
                title: domLinkInfo.title || '',
                target: target || OPEN_IN_OPTIONS[0],
                class: domLinkInfo.class,
            };
        }
        
        // Also check if the selected text itself contains a URL
        const detectedUrl = detectUrl(selectedText);
        
        if (detectedUrl) {
            return {
                href: detectedUrl,
                title: '',
                target: OPEN_IN_OPTIONS[0],
            };
        }
        
        return null;
    };

    // Get selected text from editor when modal opens
    useEffect(() => {
        if (show && view) {
            // Use setTimeout to ensure view state is current
            setTimeout(() => {
                const state = view.state;
                const { selection } = state;
                const selectedTextContent = state.doc.textBetween(selection.from, selection.to);
                const hasSelection = !selection.empty && selectedTextContent.trim().length > 0;
                
                setSelectedText(selectedTextContent || '');
                setHasSelectedText(hasSelection);
                
                // Extract link information from selection
                const linkInfo = extractLinkInfo(state, selection, view);
                
                if (linkInfo && linkInfo.href) {
                    // Determine link type based on href and class
                    let detectedLinkType = LINK_TYPES.find(item => item.id === 'URL');
                    let displayUrl = linkInfo.href;
                    
                    // Check for class first to identify link type
                    if (linkInfo.class === 'rs-insert-link-custom') {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'CUSTOM_LINK');
                    } else if (linkInfo.class === 'rs-insert-link-url') {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'URL');
                    } else if (linkInfo.class === 'rs-insert-link-email') {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'EMAIL');
                        displayUrl = linkInfo.href.replace(/^mailto:/i, '');
                    } else if (linkInfo.class === 'rs-insert-link-telephone') {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'TELEPHONE');
                        displayUrl = linkInfo.href.replace(/^tel:/i, '');
                    } else if (linkInfo.class === 'rs-insert-link-sms') {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'SMS');
                        displayUrl = linkInfo.href.replace(/^sms:/i, '');
                    }
                    // Check for FTF and UNSUB first
                    else if (linkInfo.href === '{{#FTF}}') {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'FTF');
                        displayUrl = '{{#FTF}}';
                    } else if (linkInfo.href === '{{#UNSUB}}') {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'UNSUB');
                        displayUrl = '{{#UNSUB}}';
                    } else if (linkInfo.href.startsWith('mailto:')) {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'EMAIL');
                        // Remove mailto: prefix for display
                        displayUrl = linkInfo.href.replace(/^mailto:/i, '');
                    } else if (linkInfo.href.startsWith('tel:')) {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'TELEPHONE');
                        // Remove tel: prefix for display
                        displayUrl = linkInfo.href.replace(/^tel:/i, '');
                    } else if (linkInfo.href.startsWith('sms:')) {
                        detectedLinkType = LINK_TYPES.find(item => item.id === 'SMS');
                        displayUrl = linkInfo.href.replace(/^sms:/i, '');
                    }
                    
                    reset({
                        linkType: detectedLinkType,
                        url: displayUrl,
                        title: linkInfo.title || '',
                        openIn: linkInfo.target || OPEN_IN_OPTIONS[0],
                        selectedText: selectedTextContent,
                    }, {
                        keepDefaultValues: false,
                        keepValues: false,
                        keepErrors: false,
                        keepDirty: false,
                        keepIsSubmitted: false,
                        keepTouched: false,
                        keepIsValid: false,
                        keepSubmitCount: false,
                    });
                } else {
                    // Reset form when modal opens
                    reset({
                        linkType: null,
                        url: '',
                        title: '',
                        openIn: OPEN_IN_OPTIONS[0],
                        selectedText: selectedTextContent || '',
                    }, {
                        keepDefaultValues: false,
                        keepValues: false,
                        keepErrors: false,
                        keepDirty: false,
                        keepIsSubmitted: false,
                        keepTouched: false,
                        keepIsValid: false,
                        keepSubmitCount: false,
                    });
                }
            }, 0);
        }
        // Only run when show changes, not when view/reset/setValue change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const handleClose = () => {
        setShow(false);
        reset(undefined, {
            keepDefaultValues: true,
            keepValues: false,
            keepErrors: false,
            keepDirty: false,
            keepIsSubmitted: false,
            keepTouched: false,
            keepIsValid: false,
            keepSubmitCount: false,
        });
    };

    const onSubmit = (data) => {
        const state = view.state;
        const { tr, schema, selection } = state;
        const markTypeLink = schema.marks.link;
        const linkTypeValue = data?.linkType ?? linkType;
        const urlValue = data?.url ?? '';
        const openInValue = data?.openIn ?? OPEN_IN_OPTIONS[0];
        const selectedTextValue = data?.selectedText || selectedText;

        if (linkTypeValue?.id === 'FTF' || linkTypeValue?.id === 'UNSUB') {
            // For FTF and UNSUB, insert the name instead of value
            const linkName = linkTypeValue.name; // "Forward to Friend" or "Unsubscribe"
            const linkValue = linkTypeValue.value; // "{{#FTF}}" or "{{#UNSUB}}"
            
            // Check if FTF or UNSUB link already exists in the editor
            let linkExists = false;
            
            // Check all nodes in the document for existing link marks with the same href
            state.doc.descendants((node, pos) => {
                if (node.marks) {
                    const existingLink = node.marks.find(mark => mark.type === markTypeLink && mark.attrs.href === linkValue);
                    if (existingLink) {
                        linkExists = true;
                        return false; // Stop iteration
                    }
                }
            });
            
            // Also check HTML content as fallback
            if (!linkExists) {
                const editorHtml = EditorUtils.getHtml(state);
                // Check for the link value in href attributes
                if (editorHtml.includes(`href="${linkValue}"`) || editorHtml.includes(`href='${linkValue}'`)) {
                    linkExists = true;
                }
            }
            
            if (linkExists) {
                const errorLinkName = linkTypeValue.id === 'FTF' ? 'FTF' : 'Unsubscribe';
                setError('linkType', {
                    type: 'custom',
                    message: `${errorLinkName} already inserted`,
                });
                return;
            }
            const content = schema.text(linkName);
            // Add unique class for each link type to identify them when editing
            const linkClass = linkTypeValue.id === 'FTF' ? 'rs-insert-link-ftf' : 'rs-insert-link-unsub';
            const marklink = markTypeLink.create({
                href: linkValue,
                target: openInValue?.id === 'new' ? '_blank' : '_self',
                class: linkClass,
            });
            tr.addStoredMark(marklink);
            tr.replaceSelectionWith(content, true);
            view.dispatch(tr);
            view.focus();
        } else if (linkTypeValue?.id === 'URL' || linkTypeValue?.id === 'EMAIL' || linkTypeValue?.id === 'TELEPHONE' || linkTypeValue?.id === 'SMS' || linkTypeValue?.id === 'CUSTOM_LINK') {
            // For URL, EMAIL, TELEPHONE, SMS, and CUSTOM_LINK, work same as built-in Link tool
            if (selection.empty) {
                setValue('selectedText', '', { shouldValidate: true });
                trigger('selectedText');
                return;
            }

            let linkUrl = urlValue.trim();
            const linkText = selectedTextValue.trim() || linkUrl;
            const titleValue = data?.title?.trim() || '';

            // Add prefix for EMAIL, TELEPHONE, and SMS only (not for URL or CUSTOM_LINK)
            if (linkTypeValue?.id === 'EMAIL') {
                linkUrl = linkUrl.startsWith('mailto:') ? linkUrl : `mailto:${linkUrl}`;
            } else if (linkTypeValue?.id === 'TELEPHONE') {
                linkUrl = linkUrl.startsWith('tel:') ? linkUrl : `tel:${linkUrl}`;
            } else if (linkTypeValue?.id === 'SMS') {
                linkUrl = linkUrl.startsWith('sms:') ? linkUrl : `sms:${linkUrl}`;
            }
            // For CUSTOM_LINK, ensure it has http:// or https:// prefix if it doesn't start with a protocol
            else if (linkTypeValue?.id === 'CUSTOM_LINK') {
                if (linkUrl && !linkUrl.match(/^(https?:\/\/|mailto:|tel:|#|\/)/i)) {
                    linkUrl = `https://${linkUrl}`;
                }
            }

            // Create link mark with title attribute (same as built-in Link tool)
            // Add unique class for each link type to identify them when editing
            const linkClass = 
                linkTypeValue?.id === 'URL' ? 'rs-insert-link-url' :
                linkTypeValue?.id === 'EMAIL' ? 'rs-insert-link-email' :
                linkTypeValue?.id === 'TELEPHONE' ? 'rs-insert-link-telephone' :
                linkTypeValue?.id === 'SMS' ? 'rs-insert-link-sms' :
                linkTypeValue?.id === 'CUSTOM_LINK' ? 'rs-insert-link-custom' : 'rs-insert-link';
            
            const linkAttrs = {
                href: linkUrl,
                target: openInValue?.id === 'new' ? '_blank' : '_self',
                class: linkClass,
            };
            
            // Add title if provided (only for URL and CUSTOM_LINK)
            if (titleValue && (linkTypeValue?.id === 'URL' || linkTypeValue?.id === 'CUSTOM_LINK')) {
                linkAttrs.title = titleValue;
            }

            const marklink = markTypeLink.create(linkAttrs);

            // Apply link mark to selection (same approach as built-in Link tool)
            // Remove any existing link marks first
            tr.removeMark(selection.from, selection.to, markTypeLink);
            
            // Add the new link mark to the selection
            tr.addMark(selection.from, selection.to, marklink);

            view.dispatch(tr);
            view.focus();
        }

        handleClose();
    };

    return (
        <div className="rs-editor-custom-icon editor-custom-insert-link rseci-icon">
            <div className="k-button" onClick={() => setShow(true)} role="button" tabIndex={0}>
                <i className={`${editor_link_medium} icon-md`} />
            </div>
             
            <RSModal
                show={show}
                handleClose={handleClose}
                header="Insert link"
                size="md"
                isHeaderTitle
                body={
                    <FormProvider {...methods}>
                        <Container>
                            <div className="form-group">
                                <Row>
                                    <Col md={12}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name="linkType"
                                            data={hasSelectedText 
                                                ? LINK_TYPES
                                                : LINK_TYPES.filter(item => item.id === 'FTF' || item.id === 'UNSUB')
                                            }
                                            label={'Link type'}
                                            textField="name"
                                            dataItemKey="id"
                                            rules={{
                                                validate: (value) => {
                                                    if (!value) {
                                                        return 'Link type is required';
                                                    }
                                                    return true;
                                                },
                                            }}
                                            handleChange={(e) => {
                                                // Update URL value when link type changes (runs after field value is updated)
                                                const selectedValue = e.value;
                                                if (selectedValue) {
                                                    const linkTypeId = selectedValue.id;
                                                    if (linkTypeId === 'FTF') {
                                                        setValue('url', '{{#FTF}}', { 
                                                            shouldValidate: false,
                                                            shouldDirty: false,
                                                            shouldTouch: false,
                                                        });
                                                    } else if (linkTypeId === 'UNSUB') {
                                                        setValue('url', '{{#UNSUB}}', { 
                                                            shouldValidate: false,
                                                            shouldDirty: false,
                                                            shouldTouch: false,
                                                        });
                                                    } else if (linkTypeId === 'EMAIL' || linkTypeId === 'TELEPHONE' || linkTypeId === 'SMS' || linkTypeId === 'URL' || linkTypeId === 'CUSTOM_LINK') {
                                                        // Reset URL to empty when changing from FTF/UNSUB to URL/EMAIL/TELEPHONE/SMS/CUSTOM_LINK
                                                        setValue('url', '', { 
                                                            shouldValidate: false,
                                                            shouldDirty: false,
                                                            shouldTouch: false,
                                                        });
                                                        setValue('title', '', { 
                                                            shouldValidate: false,
                                                            shouldDirty: false,
                                                            shouldTouch: false,
                                                        });
                                                        clearErrors('url')
                                                        clearErrors('title')
                                                    }
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            {linkType && (
                                <div className="form-group">
                                    <Row>
                                        {linkType?.prefix ? (
                                            <>
                                                {/* <Col md={2} style={{ display: 'flex', alignItems: 'center', paddingTop: '8px' }}>
                                                    <span style={{ color: '#666', fontSize: '14px' }}>
                                                        {linkType.prefix}
                                                    </span>
                                                </Col> */}
                                                <Col md={12}>
                                                    <RSInput
                                                        control={control}
                                                        name="url"
                                                        placeholder={linkType?.placeholder || (linkType?.id === 'URL' ? 'Enter URL' : '')}
                                                        disabled={linkType?.id === 'FTF' || linkType?.id === 'UNSUB'}
                                                        required
                                                        rules={{
                                                            validate: (value) => {
                                                                if (linkType?.id === 'EMAIL') {
                                                                    if (!value || value.trim() === '') {
                                                                        return 'Enter email';
                                                                    }
                                                                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                                    if (!emailPattern.test(value.trim())) {
                                                                        return 'Enter a valid email address';
                                                                    }
                                                                } else if (linkType?.id === 'TELEPHONE') {
                                                                    if (!value || value.trim() === '') {
                                                                        return 'Enter phone number';
                                                                    }
                                                                    const phonePattern = /^\+?[0-9]{7,15}$/;
                                                                    if (!phonePattern.test(value.trim())) {
                                                                        return 'Enter a valid phone number';
                                                                    }
                                                                } else if (linkType?.id === 'SMS') {
                                                                    if (!value || value.trim() === '') {
                                                                        return 'Enter phone number';
                                                                    }
                                                                    const phonePattern = /^\+?[0-9]{7,15}$/;
                                                                    if (!phonePattern.test(value.trim())) {
                                                                        return 'Enter a valid phone number';
                                                                    }
                                                                } else if (linkType?.id === 'URL') {
                                                                    if (!value || value.trim() === '') {
                                                                        return 'Enter URL';
                                                                    }
                                                                    if (
                                                                        !value.match(/^(https?:\/\/|mailto:|tel:)/i) &&
                                                                        !value.startsWith('{{#')
                                                                    ) {
                                                                        return 'Enter a valid URL';
                                                                    }
                                                                } else if (linkType?.id === 'CUSTOM_LINK') {
                                                                    if (!value || value.trim() === '') {
                                                                        return 'Enter Custom link';
                                                                    }
                                                                }
                                                                return true;
                                                            },
                                                        }}
                                                    />
                                                </Col>
                                            </>
                                        ) : (
                                            <Col md={12}>
                                                <RSInput
                                                    control={control}
                                                    name="url"
                                                    placeholder={linkType?.placeholder || (linkType?.id === 'URL' ? 'Enter URL' : '')}
                                                    disabled={linkType?.id === 'FTF' || linkType?.id === 'UNSUB'}
                                                    required
                                                    rules={{
                                                        validate: (value) => {
                                                            if (linkType?.id === 'URL') {
                                                                if (!value || value.trim() === '') {
                                                                    return 'Enter URL';
                                                                }
                                                                if (
                                                                    !value.match(/^(https?:\/\/|mailto:|tel:)/i) &&
                                                                    !value.startsWith('{{#')
                                                                ) {
                                                                    return 'Enter a valid URL';
                                                                }
                                                            } else if (linkType?.id === 'CUSTOM_LINK') {
                                                                if (!value || value.trim() === '') {
                                                                    return 'Enter custom link';
                                                                }
                                                            }
                                                            return true;
                                                        },
                                                    }}
                                                />
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            )}

                            {(linkType?.id === 'URL' || linkType?.id === 'EMAIL' || linkType?.id === 'TELEPHONE' || linkType?.id === 'SMS' || linkType?.id === 'CUSTOM_LINK') && (
                                <>
                                    {(linkType?.id === 'URL' || linkType?.id === 'CUSTOM_LINK') && (
                                        <div className="form-group">
                                            <Row>
                                                <Col md={12}>
                                                    <RSInput
                                                        control={control}
                                                        name="title"
                                                        label="Title"
                                                        placeholder="Enter title (optional)"
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <Row>
                                            <Col md={12}>
                                                <RSInput
                                                    control={control}
                                                    name="selectedText"
                                                    label="Selected text"
                                                    readOnly
                                                    rules={{
                                                        validate: (value) => {
                                                            if (linkType?.id === 'URL' || linkType?.id === 'EMAIL' || linkType?.id === 'TELEPHONE' || linkType?.id === 'SMS' || linkType?.id === 'CUSTOM_LINK') {
                                                                if (!value || value.trim() === '') {
                                                                    return 'Please select text in the editor to create a link';
                                                                }
                                                            }
                                                            return true;
                                                        },
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </>
                            )}

                            <div className="form-group mb0">
                                <Row>
                                    <Col md={12}>
                                        <RSKendoDropDownList
                                            control={control}
                                            name="openIn"
                                            label="Open in"
                                            data={OPEN_IN_OPTIONS}
                                            textField="name"
                                            dataItemKey="id"
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Container>
                    </FormProvider>
                }
                footer={
                    <Fragment>
                        <RSSecondaryButton onClick={handleClose}>{CANCEL || 'Cancel'}</RSSecondaryButton>
                        <RSPrimaryButton onClick={handleSubmit(onSubmit)}>{SAVE || 'Save'}</RSPrimaryButton>
                    </Fragment>
                }
            />
        </div>
    );
};

export default memo(InsertLinks);
