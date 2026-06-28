/**
 * InsertLinkTool — Kendo Editor toolbar tool for inserting / editing hyperlinks.
 * Duplicated from the email CreateCommunication InsertLinks component;
 * kept generic so it works in any ResTextEditor instance.
 *
 * Supports: Forward-to-Friend, Unsubscribe, Email, Telephone, SMS, URL, Custom link.
 * Pre-populates the form when the cursor sits on an existing link.
 */
import { useState, useEffect, memo, useRef } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { EditorUtils } from '@progress/kendo-react-editor';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { editor_add_link_medium } from 'Constants/GlobalConstant/Glyphicons';

import RSModal from 'Components/RSModal';
import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

// ─── constants ───────────────────────────────────────────────────────────────

const LINK_TYPES = [
    { id: 'FTF',         name: 'Forward to Friend', value: '{{#FTF}}' },
    { id: 'UNSUB',       name: 'Unsubscribe',        value: '{{#UNSUB}}' },
    { id: 'EMAIL',       name: 'Email',              value: 'mailto:', prefix: 'mailto:', placeholder: 'Enter email' },
    { id: 'TELEPHONE',   name: 'Telephone',          value: 'tel:',    prefix: 'tel:',    placeholder: 'Enter phone number' },
    { id: 'SMS',         name: 'SMS',                value: 'sms:',    prefix: 'sms:',    placeholder: 'Enter phone number' },
    { id: 'URL',         name: 'URL',                value: '',        prefix: '',        placeholder: 'URL' },
    { id: 'CUSTOM_LINK', name: 'Custom link',        value: '',        prefix: '',        placeholder: 'Enter custom link' },
];

const OPEN_IN_OPTIONS = [
    { id: 'new',  name: 'New window' },
    { id: 'same', name: 'Same window' },
];

const LINK_CLASS_MAP = {
    FTF:         'rs-insert-link-ftf',
    UNSUB:       'rs-insert-link-unsub',
    URL:         'rs-insert-link-url',
    EMAIL:       'rs-insert-link-email',
    TELEPHONE:   'rs-insert-link-telephone',
    SMS:         'rs-insert-link-sms',
    CUSTOM_LINK: 'rs-insert-link-custom',
};

// ─── helpers ─────────────────────────────────────────────────────────────────

const detectUrl = (text) => {
    if (!text) return null;
    const match = text.match(/(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|sms:[^\s]+)/i);
    return match ? match[0] : null;
};

const extractLinkInfo = (state, selection, view) => {
    if (selection.empty) return null;

    const { from, to } = selection;
    const linkMark = state.schema.marks.link;
    let linkMarkFound = null;

    const marksAtStart = state.doc.resolve(from).marks();
    linkMarkFound = marksAtStart.find((m) => m.type === linkMark);

    if (!linkMarkFound) {
        state.doc.nodesBetween(from, to, (node) => {
            if (node.marks) {
                const found = node.marks.find((m) => m.type === linkMark);
                if (found) { linkMarkFound = found; return false; }
            }
        });
    }

    let domLinkInfo = null;
    if (view) {
        try {
            const startPos = view.domAtPos(from);
            const endPos   = view.domAtPos(to);
            const range    = document.createRange();
            range.setStart(startPos.node, startPos.offset);
            range.setEnd(endPos.node, endPos.offset);
            const container = range.commonAncestorContainer;
            const anchor =
                container.nodeType === Node.ELEMENT_NODE
                    ? container.closest('a')
                    : container.parentElement?.closest('a');
            if (anchor) {
                const foundClass = Object.values(LINK_CLASS_MAP).find((cls) =>
                    anchor.classList.contains(cls),
                );
                domLinkInfo = {
                    href:   anchor.getAttribute('href')   || '',
                    title:  anchor.getAttribute('title')  || '',
                    target: anchor.getAttribute('target') || '_self',
                    class:  foundClass,
                };
            }
        } catch (_) {
            // DOM extraction failed — fall through to mark-based info
        }
    }

    const toOpenIn = (target) =>
        target === '_blank' ? OPEN_IN_OPTIONS[0] : OPEN_IN_OPTIONS[1];

    if (linkMarkFound) {
        return {
            href:   linkMarkFound.attrs.href  || domLinkInfo?.href  || '',
            title:  linkMarkFound.attrs.title || domLinkInfo?.title || '',
            target: toOpenIn(linkMarkFound.attrs.target || domLinkInfo?.target || '_self'),
            class:  linkMarkFound.attrs.class || domLinkInfo?.class,
        };
    }
    if (domLinkInfo?.href) {
        return {
            href:   domLinkInfo.href,
            title:  domLinkInfo.title || '',
            target: toOpenIn(domLinkInfo.target),
            class:  domLinkInfo.class,
        };
    }

    const detectedUrl = detectUrl(state.doc.textBetween(from, to));
    if (detectedUrl) {
        return { href: detectedUrl, title: '', target: OPEN_IN_OPTIONS[0] };
    }
    return null;
};

// ─── component ───────────────────────────────────────────────────────────────

const InsertLinkTool = ({ view }) => {
    const viewRef = useRef(view);
    viewRef.current = view;

    const [show, setShow] = useState(false);
    const [hasSelectedText, setHasSelectedText] = useState(false);

    const methods = useForm({
        mode: 'onTouched',
        defaultValues: {
            linkType:     null,
            url:          '',
            title:        '',
            openIn:       OPEN_IN_OPTIONS[0],
            selectedText: '',
        },
    });

    const { control, setValue, watch, handleSubmit, reset, setError, clearErrors } = methods;
    const linkType = watch('linkType');

    // ── populate form when modal opens ──────────────────────────────────────
    useEffect(() => {
        if (!show || !viewRef.current) return;

        setTimeout(() => {
            const state     = viewRef.current.state;
            const selection = state.selection;
            const selText   = state.doc.textBetween(selection.from, selection.to);
            const hasSel    = !selection.empty && selText.trim().length > 0;

            setHasSelectedText(hasSel);

            const linkInfo = extractLinkInfo(state, selection, viewRef.current);

            if (linkInfo?.href) {
                let detected = LINK_TYPES.find((t) => t.id === 'URL');
                let displayUrl = linkInfo.href;

                // Identify from class first, then from href prefix
                const classToId = Object.fromEntries(
                    Object.entries(LINK_CLASS_MAP).map(([id, cls]) => [cls, id]),
                );
                const idFromClass = linkInfo.class && classToId[linkInfo.class];
                if (idFromClass) {
                    detected = LINK_TYPES.find((t) => t.id === idFromClass) || detected;
                    const prefixRe = { EMAIL: /^mailto:/i, TELEPHONE: /^tel:/i, SMS: /^sms:/i };
                    if (prefixRe[idFromClass]) displayUrl = linkInfo.href.replace(prefixRe[idFromClass], '');
                } else if (linkInfo.href === '{{#FTF}}') {
                    detected = LINK_TYPES.find((t) => t.id === 'FTF');
                } else if (linkInfo.href === '{{#UNSUB}}') {
                    detected = LINK_TYPES.find((t) => t.id === 'UNSUB');
                } else if (linkInfo.href.startsWith('mailto:')) {
                    detected = LINK_TYPES.find((t) => t.id === 'EMAIL');
                    displayUrl = linkInfo.href.replace(/^mailto:/i, '');
                } else if (linkInfo.href.startsWith('tel:')) {
                    detected = LINK_TYPES.find((t) => t.id === 'TELEPHONE');
                    displayUrl = linkInfo.href.replace(/^tel:/i, '');
                } else if (linkInfo.href.startsWith('sms:')) {
                    detected = LINK_TYPES.find((t) => t.id === 'SMS');
                    displayUrl = linkInfo.href.replace(/^sms:/i, '');
                }

                reset({ linkType: detected, url: displayUrl, title: linkInfo.title || '', openIn: linkInfo.target || OPEN_IN_OPTIONS[0], selectedText: selText });
            } else {
                reset({ linkType: null, url: '', title: '', openIn: OPEN_IN_OPTIONS[0], selectedText: selText || '' });
            }
        }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    // ── close ────────────────────────────────────────────────────────────────
    const handleClose = () => {
        setShow(false);
        reset(undefined, { keepDefaultValues: true, keepValues: false, keepErrors: false });
    };

    // ── submit ───────────────────────────────────────────────────────────────
    const onSubmit = (data) => {
        const v        = viewRef.current;
        if (!v) return;
        const state    = v.state;
        const { tr, schema, selection } = state;
        const markTypeLink = schema.marks.link;
        const { linkType: lt, url, title, openIn, selectedText: selText } = data;
        const target = openIn?.id === 'new' ? '_blank' : '_self';

        if (lt?.id === 'FTF' || lt?.id === 'UNSUB') {
            let alreadyExists = false;
            state.doc.descendants((node) => {
                if (node.marks?.find((m) => m.type === markTypeLink && m.attrs.href === lt.value)) {
                    alreadyExists = true;
                    return false;
                }
            });
            if (!alreadyExists) {
                const html = EditorUtils.getHtml(state);
                if (html.includes(`href="${lt.value}"`) || html.includes(`href='${lt.value}'`)) alreadyExists = true;
            }
            if (alreadyExists) {
                setError('linkType', { type: 'custom', message: `${lt.id === 'FTF' ? 'FTF' : 'Unsubscribe'} already inserted` });
                return;
            }
            const mark = markTypeLink.create({ href: lt.value, target, class: LINK_CLASS_MAP[lt.id] });
            tr.addStoredMark(mark);
            tr.replaceSelectionWith(schema.text(lt.name), true);
            v.dispatch(tr);
        } else if (lt?.id && LINK_CLASS_MAP[lt.id]) {
            if (selection.empty) {
                setValue('selectedText', '', { shouldValidate: true });
                return;
            }
            let href = url.trim();
            if (lt.id === 'EMAIL'     && !href.startsWith('mailto:')) href = `mailto:${href}`;
            else if (lt.id === 'TELEPHONE' && !href.startsWith('tel:'))    href = `tel:${href}`;
            else if (lt.id === 'SMS'       && !href.startsWith('sms:'))    href = `sms:${href}`;
            else if (lt.id === 'CUSTOM_LINK' && !href.match(/^(https?:\/\/|mailto:|tel:|#|\/)/i)) href = `https://${href}`;

            const attrs = { href, target, class: LINK_CLASS_MAP[lt.id] };
            if (title?.trim() && (lt.id === 'URL' || lt.id === 'CUSTOM_LINK')) attrs.title = title.trim();

            tr.removeMark(selection.from, selection.to, markTypeLink);
            tr.addMark(selection.from, selection.to, markTypeLink.create(attrs));
            v.dispatch(tr);
        }

        v.focus();
        handleClose();
    };

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <div className="rs-editor-custom-icon editor-custom-insert-link rseci-icon">
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip className="toolTipOverlayZindexCSS">Insert link</Tooltip>}
            >
                <button
                    type="button"
                    className="k-button k-button-md k-rounded-md k-button-flat k-icon-button"
                    aria-label="Insert link"
                    onMouseDown={(e) => { e.preventDefault(); setShow(true); }}
                >
                    <i className={`${editor_add_link_medium} icon-md`} />
                </button>
            </OverlayTrigger>

            <RSModal
                show={show}
                handleClose={handleClose}
                header="Insert link"
                size="md"
                isHeaderTitle
                body={
                    <FormProvider {...methods}>
                        <Container className='px0'>
                            {/* Link type */}
                            <div className="form-group">
                                <Row>
                                    <Col md={12}>
                                        <ResKendoDropdown
                                            control={control}
                                            name="linkType"
                                            label="Link type"
                                            data={hasSelectedText ? LINK_TYPES : LINK_TYPES.filter((t) => t.id === 'FTF' || t.id === 'UNSUB')}
                                            textField="name"
                                            dataItemKey="id"
                                            rules={{ validate: (v) => !!v || 'Link type is required' }}
                                            handleChange={(e) => {
                                                const id = e.value?.id;
                                                if (id === 'FTF')         setValue('url', '{{#FTF}}');
                                                else if (id === 'UNSUB')  setValue('url', '{{#UNSUB}}');
                                                else {
                                                    setValue('url',   '', { shouldValidate: false });
                                                    setValue('title', '', { shouldValidate: false });
                                                    clearErrors('url');
                                                    clearErrors('title');
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            {/* URL / value field */}
                            {linkType && (
                                <div className="form-group">
                                    <Row>
                                        <Col md={12}>
                                            <RSInput
                                                control={control}
                                                name="url"
                                                placeholder={linkType?.placeholder || (linkType?.id === 'URL' ? 'Enter URL' : '')}
                                                disabled={linkType?.id === 'FTF' || linkType?.id === 'UNSUB'}
                                                required
                                                rules={{
                                                    validate: (val) => {
                                                        const id = linkType?.id;
                                                        if (!val?.trim()) return `Enter ${linkType?.placeholder || 'value'}`;
                                                        if (id === 'EMAIL')     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) || 'Enter a valid email';
                                                        if (id === 'TELEPHONE' || id === 'SMS') return /^\+?[0-9]{7,15}$/.test(val.trim()) || 'Enter a valid phone number';
                                                        if (id === 'URL')       return (val.match(/^(https?:\/\/|mailto:|tel:)/i) || val.startsWith('{{#')) || 'Enter a valid URL';
                                                        return true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* Title + Selected text (URL / CUSTOM_LINK / EMAIL / TELEPHONE / SMS) */}
                            {(linkType?.id === 'URL' || linkType?.id === 'EMAIL' || linkType?.id === 'TELEPHONE' || linkType?.id === 'SMS' || linkType?.id === 'CUSTOM_LINK') && (
                                <>
                                    {(linkType?.id === 'URL' || linkType?.id === 'CUSTOM_LINK') && (
                                        <div className="form-group">
                                            <Row>
                                                <Col md={12}>
                                                    <RSInput control={control} name="title" label="Title" placeholder="Enter title (optional)" />
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
                                                        validate: (val) => (!val?.trim() ? 'Please select text in the editor to create a link' : true),
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </>
                            )}

                            {/* Open in */}
                            <div className="form-group mb0">
                                <Row>
                                    <Col md={12}>
                                        <ResKendoDropdown
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
                    <>
                        <RSSecondaryButton onClick={handleClose}>Cancel</RSSecondaryButton>
                        <RSPrimaryButton onClick={handleSubmit(onSubmit)}>Save</RSPrimaryButton>
                    </>
                }
            />
        </div>
    );
};

InsertLinkTool.displayName = 'ResTextEditorInsertLinkTool';
InsertLinkTool.propTypes = { view: PropTypes.object };

export default memo(InsertLinkTool);
