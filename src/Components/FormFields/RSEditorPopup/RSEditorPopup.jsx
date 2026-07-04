import { HTTPS_REGEX, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { cloneElement, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
// import { Editor } from '@tinymce/tinymce-react';
import { Editor, EditorTools, EditorUtils, ProseMirror } from '@progress/kendo-react-editor';
import { ButtonGroup } from '@progress/kendo-react-buttons';
import RSColorPicker from 'Components/ColorPicker';
import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';
import { TOOLBAR_ICON_CONFIG } from 'Pages/KendoDocs/CommonComponents/ResTextEditor/config';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
const {
    Bold,
    Italic,
    Underline,
    Unlink,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    InsertImage,
} = EditorTools;
const { EditorState, Plugin, PluginKey } = ProseMirror;
class EditorView extends ProseMirror.EditorView { }
import { get } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';

const EDITOR_FONT_FAMILY_ITEMS = [
    { text: 'Arial', value: 'Arial, sans-serif', fontFamily: 'Arial, sans-serif' },
    { text: 'Courier New', value: '"Courier New", Courier, monospace', fontFamily: '"Courier New", Courier, monospace' },
    { text: 'Georgia', value: 'Georgia, serif', fontFamily: 'Georgia, serif' },
    { text: 'Helvetica', value: 'Helvetica, Arial, sans-serif', fontFamily: 'Helvetica, Arial, sans-serif' },
    { text: 'Impact', value: 'Impact, Haettenschweiler, sans-serif', fontFamily: 'Impact, Haettenschweiler, sans-serif' },
    { text: 'Lucida Console', value: '"Lucida Console", Monaco, monospace', fontFamily: '"Lucida Console", Monaco, monospace' },
    { text: 'Tahoma', value: 'Tahoma, Geneva, sans-serif', fontFamily: 'Tahoma, Geneva, sans-serif' },
    { text: 'Times New Roman', value: '"Times New Roman", Times, serif', fontFamily: '"Times New Roman", Times, serif' },
    { text: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif', fontFamily: '"Trebuchet MS", Helvetica, sans-serif' },
    { text: 'Verdana', value: 'Verdana, Geneva, sans-serif', fontFamily: 'Verdana, Geneva, sans-serif' },
];

const EDITOR_FONT_SIZE_ITEMS = [
    '8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '22pt', '24pt', '26pt', '28pt', '36pt', '48pt', '72pt',
].map((size) => ({ text: size, value: size }));

const EDITOR_TOOLTIP_BY_ARIA_LABEL = {
    Bold: 'Bold',
    Italic: 'Italic',
    Underline: 'Underline',
    'Align text left': 'Align left',
    'Center text': 'Align center',
    'Align text right': 'Align right',
    Justify: 'Justify',
    'Insert image': 'Insert image',
    Link: 'Link',
    'Remove link': 'Remove Link',
};

const applyRsIconReplacement = (iconElement, iconClass) => {
    if (!iconElement || iconElement.hasAttribute('data-rs-icon-replaced')) return;

    const svg = iconElement.querySelector('svg');
    if (svg) svg.style.display = 'none';

    const isLegacyKendoIcon = [...iconElement.classList].some((cls) => cls.startsWith('k-i-'));
    if (isLegacyKendoIcon) {
        iconElement.style.fontSize = '0';
        iconElement.style.lineHeight = '0';
        iconElement.style.display = 'inline-flex';
        iconElement.style.alignItems = 'center';
        iconElement.style.justifyContent = 'center';
    }

    if (!iconElement.querySelector(`.${iconClass}`)) {
        const iconEl = document.createElement('i');
        iconEl.className = `${iconClass} icon-md`;
        iconElement.appendChild(iconEl);
    }

    iconElement.setAttribute('data-rs-icon-replaced', 'true');
};

const replaceToolbarButtonWithRsIcon = (button, iconClass) => {
    if (!button || button.hasAttribute('data-rs-button-icon-replaced')) return;

    const iconHost =
        button.querySelector('.k-button-icon, .k-icon, [class*="k-svg-i-"], [class*="k-i-"]') || null;

    if (iconHost) {
        applyRsIconReplacement(iconHost, iconClass);
    }

    button.setAttribute('data-rs-button-icon-replaced', 'true');
};

const applyPopupToolbarIconReplacements = (root, config) => {
    const toolbar = root?.querySelector?.('.k-button-group');
    if (!toolbar) return;

    config.forEach(({ className, legacyClassName, iconClass }) => {
        [className, legacyClassName].filter(Boolean).forEach((cls) => {
            toolbar.querySelectorAll(`.${cls}, [class~="${cls}"]`).forEach((iconElement) => {
                if (iconElement.closest('.rs-builder-colorpicker-container, .rs-colorpicker-wrapper')) return;
                applyRsIconReplacement(iconElement, iconClass);
            });
        });
    });

    toolbar.querySelectorAll('.k-button').forEach((button) => {
        if (button.closest('.rs-builder-colorpicker-container, .rs-colorpicker-wrapper')) return;

        const buttonLabel = (button.getAttribute('title') || button.getAttribute('aria-label') || '').trim();
        const matchedEntry =
            config.find(({ className, legacyClassName }) =>
                [className, legacyClassName].filter(Boolean).some((cls) =>
                    button.querySelector(`.${cls}, [class~="${cls}"]`),
                ),
            ) || config.find(({ buttonTitle }) => buttonTitle && buttonTitle === buttonLabel);

        if (matchedEntry) {
            replaceToolbarButtonWithRsIcon(button, matchedEntry.iconClass);
        }
    });
};

const fontFamilyItemRender = (li, itemProps) => {
    const { dataItem } = itemProps;
    return cloneElement(
        li,
        { ...li.props, title: dataItem?.text },
        <span className="list-item" style={{ fontFamily: dataItem?.fontFamily }}>
            {dataItem?.text}
        </span>,
    );
};

const fontNameValueRender = (element, value) =>
    cloneElement(
        element,
        { ...element.props, title: value?.text || 'Font name' },
        <span className="k-input-value-text">{value?.text || 'Font name'}</span>,
    );

const fontSizeValueRender = (element, value) =>
    cloneElement(
        element,
        { ...element.props, title: value?.text || 'Font size' },
        <span className="k-input-value-text">{value?.text || 'Font size'}</span>,
    );

const EditorFontNameTool = ({ view }) => {
    const viewRef = useRef(view);
    viewRef.current = view;

    const { control, setValue } = useForm({ defaultValues: { editorFontName: null } });

    const selectedItem = useMemo(() => {
        if (!view?.state) return null;

        const fontFamily = EditorUtils.getInlineStyles(view.state)?.['font-family'];
        if (!fontFamily) return null;

        return (
            EDITOR_FONT_FAMILY_ITEMS.find(
                (item) => item.value === fontFamily || item.text === fontFamily,
            ) ?? null
        );
    }, [view?.state]);

    useEffect(() => {
        setValue('editorFontName', selectedItem, { shouldDirty: false });
    }, [selectedItem, setValue]);

    return (
        <div className="rs-editor-font-name-tool" onMouseDown={(event) => event.preventDefault()}>
            <ResKendoDropdown
                control={control}
                name="editorFontName"
                data={EDITOR_FONT_FAMILY_ITEMS}
                textField="text"
                dataItemKey="value"
                label="Font name"
                placeholder="Font name"
                isError={false}
                useErrorContainer={false}
                filterable={false}
                isCustomRender
                itemRender={fontFamilyItemRender}
                valueRender={fontNameValueRender}
                handleChange={(event) => {
                    const editorView = viewRef.current;
                    const item = event?.value;
                    if (!editorView || !item?.value) return;

                    EditorUtils.applyInlineStyle(editorView, {
                        style: 'font-family',
                        value: item.value,
                    });
                    editorView.focus();
                }}
            />
        </div>
    );
};

const EditorFontSizeTool = ({ view }) => {
    const viewRef = useRef(view);
    viewRef.current = view;

    const { control, setValue } = useForm({ defaultValues: { editorFontSize: null } });

    const selectedItem = useMemo(() => {
        if (!view?.state) return null;

        const fontSize = EditorUtils.getInlineStyles(view.state)?.['font-size'];
        if (!fontSize) return null;

        return EDITOR_FONT_SIZE_ITEMS.find((item) => item.value === fontSize) ?? null;
    }, [view?.state]);

    useEffect(() => {
        setValue('editorFontSize', selectedItem, { shouldDirty: false });
    }, [selectedItem, setValue]);

    return (
        <div className="rs-editor-font-size-tool" onMouseDown={(event) => event.preventDefault()}>
            <ResKendoDropdown
                control={control}
                name="editorFontSize"
                data={EDITOR_FONT_SIZE_ITEMS}
                textField="text"
                dataItemKey="value"
                label="Font size"
                placeholder="Font size"
                isError={false}
                useErrorContainer={false}
                filterable={false}
                valueRender={fontSizeValueRender}
                handleChange={(event) => {
                    const editorView = viewRef.current;
                    const item = event?.value;
                    if (!editorView || !item?.value) return;

                    EditorUtils.applyInlineStyle(editorView, {
                        style: 'font-size',
                        value: item.value,
                    });
                    editorView.focus();
                }}
            />
        </div>
    );
};

EditorFontNameTool.propTypes = { view: PropTypes.object };
EditorFontSizeTool.propTypes = { view: PropTypes.object };

const MemoEditorFontNameTool = memo(EditorFontNameTool);
const MemoEditorFontSizeTool = memo(EditorFontSizeTool);

const HYPERLINK_FORM_DEFAULTS = {
    url: '',
    title: '',
    openInNewWindow: true,
};

const getLinkInfoFromSelection = (state, editorView) => {
    if (!state?.selection || state.selection.empty) return null;

    const { from, to } = state.selection;
    const linkMarkType = state.schema.marks.link;
    let linkMarkFound = state.doc.resolve(from).marks().find((mark) => mark.type === linkMarkType);

    if (!linkMarkFound) {
        state.doc.nodesBetween(from, to, (node) => {
            if (!node.marks) return;
            const found = node.marks.find((mark) => mark.type === linkMarkType);
            if (found) {
                linkMarkFound = found;
                return false;
            }
        });
    }

    if (linkMarkFound) {
        return {
            href: linkMarkFound.attrs.href || '',
            title: linkMarkFound.attrs.title || state.doc.textBetween(from, to) || '',
            openInNewWindow: linkMarkFound.attrs.target === '_blank',
        };
    }

    if (editorView) {
        try {
            const startPos = editorView.domAtPos(from);
            const endPos = editorView.domAtPos(to);
            const range = document.createRange();
            range.setStart(startPos.node, startPos.offset);
            range.setEnd(endPos.node, endPos.offset);
            const container = range.commonAncestorContainer;
            const anchor =
                container.nodeType === Node.ELEMENT_NODE
                    ? container.closest('a')
                    : container.parentElement?.closest('a');

            if (anchor) {
                return {
                    href: anchor.getAttribute('href') || '',
                    title: anchor.getAttribute('title') || anchor.textContent || '',
                    openInNewWindow: anchor.getAttribute('target') === '_blank',
                };
            }
        } catch (_error) {
            // Fall through to selected text defaults
        }
    }

    return {
        href: '',
        title: state.doc.textBetween(from, to) || '',
        openInNewWindow: true,
    };
};

const EditorLinkTool = ({ view }) => {
    const viewRef = useRef(view);
    viewRef.current = view;

    const [showHyperlinkModal, setShowHyperlinkModal] = useState(false);
    const hyperlinkMethods = useForm({ defaultValues: HYPERLINK_FORM_DEFAULTS });
    const watchedUrl = hyperlinkMethods.watch('url');
    const urlFieldError = hyperlinkMethods.formState.errors.url;

    const handleModalClose = () => {
        setShowHyperlinkModal(false);
        hyperlinkMethods.reset(HYPERLINK_FORM_DEFAULTS);
    };

    const handleOpenHyperlinkModal = () => {
        const editorView = viewRef.current;
        if (!editorView?.state) return;

        const linkInfo = getLinkInfoFromSelection(editorView.state, editorView);
        hyperlinkMethods.reset({
            url: linkInfo?.href || '',
            title: linkInfo?.title || '',
            openInNewWindow: linkInfo?.openInNewWindow ?? true,
        });
        setShowHyperlinkModal(true);
    };

    const handleInsertHyperlink = () => {
        const formData = hyperlinkMethods.getValues();
        const trimmedUrl = formData.url?.trim();

        if (!trimmedUrl) return;

        if (!HTTPS_REGEX.test(trimmedUrl)) {
            hyperlinkMethods.setError('url', {
                type: 'pattern',
                message: ENTER_VALID_URL,
            });
            return;
        }

        const editorView = viewRef.current;
        if (!editorView?.state) return;

        const { state, dispatch } = editorView;
        const { selection, schema } = state;

        if (selection.empty) {
            hyperlinkMethods.setError('url', {
                type: 'manual',
                message: 'Select text to create a link',
            });
            return;
        }

        const linkMark = schema.marks.link;
        const attrs = {
            href: trimmedUrl,
            target: formData.openInNewWindow ? '_blank' : '_self',
        };

        if (formData.title?.trim()) {
            attrs.title = formData.title.trim();
        }

        const transaction = state.tr;
        transaction.removeMark(selection.from, selection.to, linkMark);
        transaction.addMark(selection.from, selection.to, linkMark.create(attrs));
        dispatch(transaction);
        editorView.focus();
        handleModalClose();
    };

    return (
        <>
            <button
                type="button"
                className="k-button k-icon-button"
                aria-label="Link"
                style={{ width: 'auto', height: '30px' }}
                onMouseDown={(event) => {
                    event.preventDefault();
                    handleOpenHyperlinkModal();
                }}
            >
                <i className="icon-rs-editor-link-medium icon-md" />
            </button>

            <RSModal
                show={showHyperlinkModal}
                handleClose={handleModalClose}
                header="Insert hyperlink"
                size="md"
                className="formEditor-popup"
                footer={
                    <div className="buttons-holder mt0">
                        <RSSecondaryButton onClick={handleModalClose}>Cancel</RSSecondaryButton>
                        <RSPrimaryButton
                            className={!watchedUrl?.trim() ? 'click-off pe-none' : ''}
                            onClick={handleInsertHyperlink}
                            disabled={!watchedUrl?.trim() || !!urlFieldError}
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

                        <div>
                            <RSInput
                                name="title"
                                type="text"
                                placeholder="Link title"
                                control={hyperlinkMethods.control}
                                className="form-control"
                            />
                        </div>

                        <div>
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
        </>
    );
};

EditorLinkTool.propTypes = { view: PropTypes.object };

const MemoEditorLinkTool = memo(EditorLinkTool);

// import { APIKEY_TINYMCE } from './constant';

const RSEditorPopup = ({
    name,
    control,
    initialValue,
    onNodeChange,
    className = '',
    required = false,
    hideErrorMessage = false,
    rules,
    init,
    defaultValue = '',
    handleChange = () => { },
    handleNodeChange = () => { },
    isFooter = false,
    contentStyle: contentStyleProp,
    applyColorToLinksOnly = false,
    iscustomWidth = false,
    hideLinkTools = false,
    ...rest
}) => {
    const { getValues, setValue, watch, setError, clearErrors } = useFormContext();
    const resolvedInitialValue = (() => {
        if (typeof initialValue === 'string') return initialValue;
        if (initialValue?.buttonText) return `<p>${initialValue.buttonText}</p>`;
        return defaultValue || '';
    })();
    const [val] = watch([name]);
    const [view, setView] = useState(undefined);
    const [showTools, setShowTools] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [nodeChange, setNodeChange] = useState({});
    const onScroll = () => setShowTools(false);
    const divRef = useRef(null);
    const editorToolsRef = useRef(null);
    const [warningModal, setWarningModal] = useState({
        show: false,
    });
    const [position, setPosition] = useState({});
    const [foregroundColor, setForegroundColor] = useState('#333333');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [showHoverTools, setShowHoverTools] = useState(false);
    const [hoverPosition, setHoverPosition] = useState({});
    const hoverTimeoutRef = useRef(null);
    const toolSize = useRef({
        width: 36,
        height: 36,
    });
    const toolsCount = useRef(3);
    const offset = useRef({
        top: -5,
        left: 0,
    });
    const [editorSize, setEditorSize] = useState({ width: 'auto', height: 'auto' });
    const isResizing = useRef(false);
    const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });
    const errorTimeoutRef = useRef(null);

    // Convert opacity (0-1) to 2-digit hex
    const opacityToHex = (opacity) => {
        const alpha = Math.round(opacity * 255);
        return alpha.toString(16).padStart(2, '0').toUpperCase();
    };
    useEffect(() => {
        handleNodeChange(nodeChange);
    }, [nodeChange]);

    useEffect(() => {
        if (showTools && view) {
            // Update current color values based on selection
            const { from, to } = view.state.selection;
            const startPos = view.domAtPos(from);
            const endPos = view.domAtPos(to);
            const selectedRange = document?.createRange();
            selectedRange.setStart(startPos.node, startPos.offset);
            selectedRange.setEnd(endPos.node, endPos.offset);
            const selectedSpans = Array.from(selectedRange.cloneContents().querySelectorAll('span'));
            selectedSpans.forEach((span) => {
                const color = span.style.color;
                const bgColor = span.style.backgroundColor;
                if (color) setForegroundColor(color);
                if (bgColor) setBackgroundColor(bgColor);
            });
        }
    }, [showTools]);

    useEffect(() => {
        const observerCallback = (mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    replaceCloseIcons();
                }
            }
        };

        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        replaceCloseIcons();

        return () => {
            observer.disconnect();
        };
    }, []);

    const replaceCloseIcons = () => {
        const closeButtons = document.querySelectorAll('.k-icon.k-font-icon.k-i-x.k-button-icon');
        closeButtons.forEach((button) => {
            if (!button.getAttribute('data-icon-replaced')) {
                button.style.display = 'none';
                const newIcon = document.createElement('i');
                newIcon.className = 'icon-md color-primary-blue icon-rs-popup-close-circle-medium';
                const baseClasses = 'icon-md color-primary-blue';
                const outlineClass = 'icon-rs-popup-close-circle-medium';
                const filledClass = 'icon-rs-popup-close-circle-fill-medium';

                newIcon.addEventListener('mouseenter', () => {
                    newIcon.className = `${baseClasses} ${filledClass}`;
                });
                newIcon.addEventListener('mouseleave', () => {
                    newIcon.className = `${baseClasses} ${outlineClass}`;
                });
                newIcon.addEventListener('click', () => {
                    button.click();
                });
                button.parentNode.insertBefore(newIcon, button.nextSibling);
                button.setAttribute('data-icon-replaced', 'true');
            }
        });
    };

    const selectionToolsPlugin = () => {
        return new Plugin({
            key: new PluginKey('selection-tools'),
            view: () => ({
                update: (newView, _prevState) => {
                    setNodeChange(newView?.lastSelectedViewDesc?.node);
                    const state = newView.state;
                    const newState = {
                        view: newView,
                        position: {},
                    };
                    const selectionCollapsed = state.selection.empty;

                    // Only set showTools to true when there's a selection
                    // Don't set it to false - let handleClickOutside handle closing
                    if (!selectionCollapsed) {
                        const { from, to } = state.selection;
                        const start = newView.coordsAtPos(from),
                            end = newView.coordsAtPos(to);
                        const left = Math.max((start.left + end.left) / 2, start.left);
                        // Only open toolbar if not already open
                        setShowTools(true);
                        // newState.position = {
                        //     top: start.top - toolSize.current.height + offset.current.top,
                        //     left: left - (toolSize.current.width * toolsCount.current) / 2 + offset.current.left,
                        // };
                    }
                    // Don't automatically close toolbar when selection collapses
                    // Keep it open so users can apply multiple styles
                    setPosition(newState.position);
                    setView(newState.view);
                },
            }),
        });
    };
    const onMount = (event) => {
        const state = event.viewProps.state;
        // console.log('Event :: ', event);
        // const state = event?.target?.state?.view?.state;
        const plugins = [...state.plugins, selectionToolsPlugin()];
        setValue(name, resolvedInitialValue);
        const viewInstance = new EditorView(
            {
                mount: event.dom,
                // mount: event?.target?.state?.view?.dom
            },
            {
                ...event.viewProps,
                state: EditorState.create({
                    doc: state.doc,
                    plugins,
                }),
            },
        );
        try {
            if (contentStyleProp && event && event.dom) {
                Object.assign(event.dom.style, contentStyleProp);
            }
        } catch (_e) { }
        return viewInstance;
    };
    useEffect(() => {
        setValue(name, resolvedInitialValue);
    }, [resolvedInitialValue]);

    // Handle hover on editor elements
    useEffect(() => {
        const editorContent = divRef.current?.querySelector('.k-editor-content');

        if (!editorContent) return;

        const handleMouseEnter = (e) => {
            const target = e.target.closest('p, div, h1, h2, h3, h4, h5, h6, li, td, th');
            if (target && editorContent.contains(target)) {
                clearTimeout(hoverTimeoutRef.current);

                const rect = target.getBoundingClientRect();
                const editorRect = editorContent.getBoundingClientRect();

                setHoverPosition({
                    top: rect.top - editorRect.top - 40,
                    left: rect.left - editorRect.left,
                });
                setShowHoverTools(true);
            }
        };

        const handleMouseLeave = (e) => {
            const relatedTarget = e.relatedTarget;
            const hoverToolsElement = document.querySelector('.hover-alignment-tools');

            // Don't hide if moving to hover tools
            if (hoverToolsElement && hoverToolsElement.contains(relatedTarget)) {
                return;
            }

            hoverTimeoutRef.current = setTimeout(() => {
                setShowHoverTools(false);
            }, 300);
        };

        editorContent.addEventListener('mouseenter', handleMouseEnter, true);
        editorContent.addEventListener('mouseleave', handleMouseLeave, true);

        return () => {
            editorContent.removeEventListener('mouseenter', handleMouseEnter, true);
            editorContent.removeEventListener('mouseleave', handleMouseLeave, true);
            clearTimeout(hoverTimeoutRef.current);
        };
    }, [view]);

    const applyForegroundColor = (value) => {
        let color = value;
        // Support opacity payload from RSColorPicker when isOpacity is true
        if (typeof value === 'object' && value.color && value.opacity !== undefined) {
            const hexOpacity = opacityToHex(value.opacity);
            color = `${value.color}${hexOpacity}`;
        }

        if (view && view.state) {
            const { state, dispatch } = view;
            let { from, to, empty } = state.selection;

            // If no selection, apply to all text (select all concept)
            if (empty) {
                from = 0;
                to = state.doc.content.size;
            }

            const tr = state.tr;

            // Get existing style marks to preserve other styles
            let existingStyle = '';
            state.doc.nodesBetween(from, to, (node) => {
                if (node.marks) {
                    node.marks.forEach((mark) => {
                        if (mark.type.name === 'style' && mark.attrs.style) {
                            existingStyle = mark.attrs.style;
                        }
                    });
                }
            });

            // Parse existing styles and update/add color
            let styles = {};
            if (existingStyle) {
                existingStyle.split(';').forEach((style) => {
                    const [key, value] = style.split(':').map(s => s.trim());
                    if (key && value) {
                        styles[key] = value;
                    }
                });
            }

            // Update color while preserving other styles
            styles['color'] = color;

            // Rebuild style string
            const newStyleString = Object.entries(styles)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ') + ';';

            const mark = state.schema.mark('style', { style: newStyleString });
            tr.addMark(from, to, mark);
            dispatch(tr);
            setForegroundColor(color);
            view.focus();
        }
    };

    const applyBackgroundColor = (value) => {
        let color = value;
        // Support opacity payload from RSColorPicker when isOpacity is true
        if (typeof value === 'object' && value.color && value.opacity !== undefined) {
            const hexOpacity = opacityToHex(value.opacity);
            color = `${value.color}${hexOpacity}`;
        }

        if (view && view.state) {
            const { state, dispatch } = view;
            let { from, to, empty } = state.selection;

            // If no selection, apply to all text (select all concept)
            if (empty) {
                from = 0;
                to = state.doc.content.size;
            }

            const tr = state.tr;

            // Get existing style marks to preserve other styles
            let existingStyle = '';
            state.doc.nodesBetween(from, to, (node) => {
                if (node.marks) {
                    node.marks.forEach((mark) => {
                        if (mark.type.name === 'style' && mark.attrs.style) {
                            existingStyle = mark.attrs.style;
                        }
                    });
                }
            });

            // Parse existing styles and update/add background-color
            let styles = {};
            if (existingStyle) {
                existingStyle.split(';').forEach((style) => {
                    const [key, value] = style.split(':').map(s => s.trim());
                    if (key && value) {
                        styles[key] = value;
                    }
                });
            }

            // Update background-color while preserving other styles
            styles['background-color'] = color;

            // Rebuild style string
            const newStyleString = Object.entries(styles)
                .map(([key, value]) => `${key}: ${value}`)
                .join('; ') + ';';

            const mark = state.schema.mark('style', { style: newStyleString });
            tr.addMark(from, to, mark);
            dispatch(tr);
            setBackgroundColor(color);
            view.focus();
        }
    };

    // Generic function to apply mark to selection or entire document
    const applyMark = (markType) => {
        if (view && view.state) {
            const { state, dispatch } = view;
            let { from, to, empty } = state.selection;

            // If no selection, apply to all text
            if (empty) {
                from = 0;
                to = state.doc.content.size;
            }

            const tr = state.tr;
            const mark = state.schema.marks[markType];

            if (mark) {
                // Check if mark is already applied
                const hasMark = state.doc.rangeHasMark(from, to, mark);

                if (hasMark) {
                    // Remove the mark
                    tr.removeMark(from, to, mark);
                } else {
                    // Add the mark
                    tr.addMark(from, to, mark.create());
                }

                dispatch(tr);
                view.focus();
            }
        }
    };

    // Generic function to apply alignment
    const applyAlignment = (alignment) => {
        if (view && view.state) {
            const { state, dispatch } = view;
            let { from, to, empty } = state.selection;

            // If no selection, apply to entire document
            if (empty) {
                from = 0;
                to = state.doc.content.size;
            }

            const tr = state.tr;

            // Apply text-align style
            state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.isBlock) {
                    const attrs = { ...node.attrs };
                    let currentStyle = attrs.style || '';

                    // Parse existing styles
                    let styles = {};
                    if (currentStyle) {
                        currentStyle.split(';').forEach((style) => {
                            const [key, value] = style.split(':').map(s => s.trim());
                            if (key && value) {
                                styles[key] = value;
                            }
                        });
                    }

                    // Update text-align
                    styles['text-align'] = alignment;

                    // Rebuild style string
                    const newStyleString = Object.entries(styles)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('; ') + ';';

                    attrs.style = newStyleString;
                    tr.setNodeMarkup(pos, null, attrs);
                }
            });

            dispatch(tr);
        }
    };

    // Specific handlers for each tool with event handling
    const handleBlur = (event) => {
        const value = getValues(name);
        const textLength = getTextLength(value);

        if (rest.minChars && textLength < rest.minChars) {
            setError(name, {
                type: 'manual',
                message: `Minimum ${rest.minChars} characters required`,
            });
        } else if (rest.maxChars && textLength > rest.maxChars) {
            setError(name, {
                type: 'manual',
                message: `Maximum ${rest.maxChars} characters allowed`,
            });
        } else {
            clearErrors(name);
        }
        if (rest.onBlur) {
            rest.onBlur(event);
        }
    };
    const handleBold = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyMark('strong');
    };

    const handleItalic = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyMark('em');
    };

    const handleUnderline = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (view && view.state) {
            const { state, dispatch } = view;
            let { from, to, empty } = state.selection;

            // If no selection, apply to all text
            if (empty) {
                from = 0;
                to = state.doc.content.size;
            }

            const tr = state.tr;

            // Check if underline is already applied by examining styles
            let hasUnderline = false;
            state.doc.nodesBetween(from, to, (node) => {
                if (node.marks) {
                    node.marks.forEach((mark) => {
                        if (mark.type.name === 'style' && mark.attrs.style &&
                            mark.attrs.style.includes('text-decoration') &&
                            mark.attrs.style.includes('underline')) {
                            hasUnderline = true;
                        }
                    });
                }
            });

            // Get existing style marks
            let existingStyle = '';
            state.doc.nodesBetween(from, to, (node) => {
                if (node.marks) {
                    node.marks.forEach((mark) => {
                        if (mark.type.name === 'style' && mark.attrs.style) {
                            existingStyle = mark.attrs.style;
                        }
                    });
                }
            });

            // Parse existing styles
            let styles = {};
            if (existingStyle) {
                existingStyle.split(';').forEach((style) => {
                    const [key, value] = style.split(':').map(s => s.trim());
                    if (key && value) {
                        styles[key] = value;
                    }
                });
            }

            // Toggle underline
            if (hasUnderline) {
                // Remove underline
                delete styles['text-decoration'];
            } else {
                // Add underline
                styles['text-decoration'] = 'underline';
            }

            // Rebuild style string or remove mark if no styles left
            if (Object.keys(styles).length > 0) {
                const newStyleString = Object.entries(styles)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('; ') + ';';

                const mark = state.schema.mark('style', { style: newStyleString });
                tr.addMark(from, to, mark);
            } else {
                // Remove style mark if no styles left
                const styleMark = state.schema.marks.style;
                if (styleMark) {
                    tr.removeMark(from, to, styleMark);
                }
            }

            dispatch(tr);
            view.focus();
        }
    };

    const handleAlignLeft = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyAlignment('left');
    };

    const handleAlignCenter = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyAlignment('center');
    };

    const handleAlignRight = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyAlignment('right');
    };

    const handleAlignJustify = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        applyAlignment('justify');
    };

    const renderTools = () => {
        const toolProps = {
            view: view,
            style: {
                width: 'auto',
                height: '30px',
            },
        };

        useEffect(() => {
            if (!showTools) return undefined;

            const applyIcons = () => {
                const root = editorToolsRef.current;
                if (!root) return;
                applyPopupToolbarIconReplacements(root, TOOLBAR_ICON_CONFIG);
            };

            applyIcons();
            const root = editorToolsRef.current;
            if (!root) return undefined;

            const observer = new MutationObserver(applyIcons);
            observer.observe(root, { childList: true, subtree: true });
            return () => observer.disconnect();
        }, [showTools, view]);

        useEffect(() => {
            if (!showTools) return undefined;

            const addTooltip = (hostElement, tooltipText) => {
                if (!hostElement || hostElement.hasAttribute('data-tooltip-added')) return;

                hostElement.removeAttribute('title');

                const tooltip = document.createElement('div');
                tooltip.setAttribute('role', 'tooltip');
                tooltip.classList.add('tooltip', 'bs-tooltip-top');
                tooltip.innerHTML = `
                    <div class="tooltip-arrow" style="position: absolute; left: 0; transform: translate(17px, 0px);"></div>
                    <div class="tooltip-inner">${tooltipText}</div>`;

                const showTooltip = () => {
                    tooltip.classList.add('fade', 'show');
                    tooltip.style.cssText = 'position: absolute; inset: auto auto 0px 0px; transform: translate(-7px, -33px)';
                    hostElement.insertAdjacentElement('afterend', tooltip);
                };

                const hideTooltip = () => tooltip.remove();

                hostElement.addEventListener('mouseover', showTooltip);
                hostElement.addEventListener('mouseout', hideTooltip);
                hostElement.querySelectorAll('.icon-md, .k-button-icon').forEach((el) => {
                    el.addEventListener('mouseover', showTooltip);
                    el.addEventListener('mouseout', hideTooltip);
                });

                hostElement.setAttribute('data-tooltip-added', 'true');
            };

            const bindTooltips = () => {
                const toolbar = editorToolsRef.current?.querySelector('.k-button-group');
                if (!toolbar) return;

                toolbar.querySelectorAll('button[aria-label]').forEach((button) => {
                    const ariaLabel = button.getAttribute('aria-label')?.trim();
                    const tooltipText = EDITOR_TOOLTIP_BY_ARIA_LABEL[ariaLabel];
                    if (tooltipText) {
                        addTooltip(button, tooltipText);
                    }
                });
            };

            bindTooltips();
            const root = editorToolsRef.current;
            if (!root) return undefined;

            const observer = new MutationObserver(bindTooltips);
            observer.observe(root, { childList: true, subtree: true });
            return () => observer.disconnect();
        }, [showTools]);

        const [imageDialogOpen, setImageDialogOpen] = useState(false);

        useEffect(() => {
            const checkElements = () => {
                const closeIcon = document.querySelector('.k-button-flat-base');
                const hyperlinkInput = document.querySelector('.k-edit-field input');
                const button = document.querySelector('.k-button-solid-primary');
                const errorParagraph = document.querySelector('.custom-error');
                const errTxt = errorParagraph?.textContent || errorParagraph?.innerText;

                if (closeIcon) {
                    const tooltip = document.createElement('div');
                    tooltip.setAttribute('role', 'tooltip');
                    tooltip.classList.add('tooltip', 'bs-tooltip-top');
                    tooltip.innerHTML = `<div class="tooltip-arrow" style="position: absolute; left: 0; transform: translate(17px, 0px);"></div><div class="tooltip-inner">Close</div>`;

                    closeIcon.addEventListener('mouseover', () => {
                        tooltip.classList.add('fade', 'show');
                        tooltip.style.cssText =
                            'position: absolute; inset: auto auto 0px 0px; transform: translate(-12px, -30px)';
                        closeIcon.insertAdjacentElement('afterend', tooltip);
                    });
                    closeIcon.addEventListener('mouseout', () => tooltip.remove());
                }

                if (hyperlinkInput?.value === '') {
                    button?.classList.add('click-off');
                } else if (errTxt) {
                    button?.classList.add('click-off');
                } else {
                    button?.classList.remove('click-off');
                }
            };
            checkElements();
            const input = document.querySelector('.k-edit-field input');
            input?.addEventListener('input', checkElements);

            return () => {
                input?.removeEventListener('input', checkElements);
                setImageDialogOpen(false);
            };
        }, [imageDialogOpen]);

        const handleClickOutside = (event) => {
            if (
                divRef.current &&
                !divRef.current.contains(event.target) &&
                !event.target.closest('.k-widget.k-window.k-dialog') &&
                !event.target.closest('.rs-modal') &&
                !event.target.closest('.modal') &&
                !event.target.closest('.formEditor-popup') &&
                !event.target.closest('.color-picker-popup') &&
                !event.target.closest('.k-animation-container')
            ) {
                setShowTools(false);
            }
        };

        useEffect(() => {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }, []);

        document.addEventListener(
            'click',
            function (event) {
                const dialog = document.querySelector('.k-widget.k-window.k-dialog');
                const overlay = document.querySelector('.k-overlay');

                if (dialog && overlay) {
                    //debugger
                    if (!dialog.contains(event.target)) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            true,
        );

        const onlyNumbers = (value) => {
            const sanitizedValue = value.replace(/[^0-9]/g, '');
            return sanitizedValue === '' ? '' : Math.min(Number(sanitizedValue) || 0, 200);
        };
        const widthInputs = document.querySelectorAll('#k-editor-image-width');
        const heightInputs = document.querySelectorAll('#k-editor-image-height');
        widthInputs.forEach((item) => {
            item.addEventListener('input', (e) => {
                const sanitizedValue = onlyNumbers(e.target.value);
                e.target.value = sanitizedValue;
            });
        });
        heightInputs.forEach((item) => {
            item.addEventListener('input', (e) => {
                const sanitizedValue = onlyNumbers(e.target.value);
                e.target.value = sanitizedValue;
            });
        });
        const urlInputs1 = document.querySelectorAll('#k-editor-image-url');
        useEffect(() => {
            const urlInputs = document.querySelectorAll('#k-editor-image-url');
            urlInputs.forEach((item) => {
                item.addEventListener('blur', (e) => {
                    const url = e.target.value;
                    const editFieldDiv = e.target.closest('.k-edit-field');
                    const button = document.querySelector('.k-button-solid-primary');

                    let errorParagraph = editFieldDiv.querySelector('.custom-error');

                    if (!errorParagraph) {
                        errorParagraph = document.createElement('p');
                        errorParagraph.className = 'custom-error';
                        errorParagraph.style.color = 'red';
                        editFieldDiv.appendChild(errorParagraph);
                    }

                    if (url !== '' && !url.endsWith('.jpg') && !url.endsWith('.png') && !url.endsWith('.jpeg')) {
                        errorParagraph.textContent = 'Accepted file types: jpg, png, jpeg';
                        button?.classList.add('click-off');
                    } else {
                        errorParagraph.textContent = '';
                        button?.classList.remove('click-off');
                    }
                });
            });
        }, [imageDialogOpen, urlInputs1]);

        return (
            showTools && (
                <span
                    ref={editorToolsRef}
                    style={{
                        position: 'absolute',
                        backgroundColor: 'white',
                        zIndex: '5',
                        ...position,
                    }}
                    className="box-design text-editor"
                >
                    <ButtonGroup>
                        <MemoEditorFontNameTool view={view} />
                        <MemoEditorFontSizeTool view={view} />
                        <Bold {...toolProps} onClick={handleBold} />
                        <Italic {...toolProps} onClick={handleItalic} />
                        <Underline {...toolProps} onClick={handleUnderline} />
                        {/* </ButtonGroup>
                    <ButtonGroup> */}
                        {/* <span> */}
                        <AlignLeft {...toolProps} onClick={handleAlignLeft} />
                        <AlignCenter {...toolProps} onClick={handleAlignCenter} />
                        <AlignRight {...toolProps} onClick={handleAlignRight} />
                        <AlignJustify {...toolProps} onClick={handleAlignJustify} />
                        <span onClick={() => setImageDialogOpen(true)}>{isFooter && <InsertImage {...toolProps} />}</span>
                        {/* </span> */}
                        {!hideLinkTools && (
                            <>
                                <MemoEditorLinkTool view={view} />
                                <Unlink {...toolProps} />
                            </>
                        )}
                        {/* Custom RSColorPicker for Foreground Color */}
                        <RSColorPicker
                            name="colorPicker"
                            icon="icon-rs-editor-text-color-medium"
                            tooltipText="Font color"
                            colorValue={foregroundColor}
                            defaultIconColor={foregroundColor}
                            isOpacity={true}
                            onSelect={applyForegroundColor}
                            wrapperClass='formEditor-popup'
                            pickerIconColor={'color-secondary-black'}
                        />
                        {/* Custom RSColorPicker for Background Color */}
                        <RSColorPicker
                            name="colorPicker"
                            icon="icon-rs-colorpicker-bg-medium"
                            tooltipText="Background color"
                            colorValue={backgroundColor}
                            defaultIconColor={backgroundColor}
                            isOpacity={true}
                            onSelect={applyBackgroundColor}
                            wrapperClass='formEditor-popup'
                            pickerIconColor={'color-secondary-black'}
                        />
                    </ButtonGroup>
                    <span
                        className="k-callout k-callout-s"
                        style={{
                            color: '#ededed',
                        }}
                    />
                </span>
            )
        );
    };

    // Helper to get text content length (ignoring HTML tags)
    const getTextLength = (html) => {
        const doc = new DOMParser().parseFromString(html || '', 'text/html');
        return doc.body.textContent.length;
    };

    const mergedRules = {
        ...rules,
        validate: {
            ...rules?.validate,
            ...(rest.minChars ? {
                minLength: (value) => {
                    const len = getTextLength(value);
                    return len >= rest.minChars || `Minimum ${rest.minChars} characters required`;
                }
            } : {}),
            ...(rest.maxChars ? {
                maxLength: (value) => {
                    const len = getTextLength(value);
                    return len <= rest.maxChars || `Maximum ${rest.maxChars} characters allowed`;
                }
            } : {}),
            ...(rest.preventLineBreaks ? {
                noLineBreaks: (value) => {
                    return !value.includes('<br>') && !value.includes('<div>') && !value.includes('<p>') || 'Line breaks are not allowed';
                }
            } : {})
        }
    };

    const handleKeyDown = (e) => {
        if (rest.preventLineBreaks && (e.key === 'Enter' || e.keyCode === 13)) {
            e.preventDefault();
            return;
        }

        if (rest.maxChars) {
            const currentLen = getTextLength(getValues(name));
            // Allow backspace, delete, arrows, selection
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && currentLen >= rest.maxChars) {
                // Check if text is selected (replacing is allowed)
                const selection = window.getSelection();
                if (selection.toString().length === 0) {
                    e.preventDefault();
                    setError(name, {
                        type: 'manual',
                        message: `Maximum ${rest.maxChars} characters allowed`,
                    });
                    if (errorTimeoutRef.current) {
                        clearTimeout(errorTimeoutRef.current);
                    }
                    errorTimeoutRef.current = setTimeout(() => {
                        clearErrors(name);
                        errorTimeoutRef.current = null;
                    }, 3000);
                }
            }
        }
    };

    const handlePaste = (e) => {
        if (rest.maxChars) {
            const clipboardData = e.clipboardData || window.clipboardData;
            const pastedData = clipboardData.getData('Text');
            const currentLen = getTextLength(getValues(name));

            if (currentLen + pastedData.length > rest.maxChars) {
                e.preventDefault();
                setError(name, {
                    type: 'manual',
                    message: `Maximum ${rest.maxChars} characters allowed`,
                });
                if (errorTimeoutRef.current) {
                    clearTimeout(errorTimeoutRef.current);
                }
                errorTimeoutRef.current = setTimeout(() => {
                    clearErrors(name);
                    errorTimeoutRef.current = null;
                }, 3000);
            }
        }
    };

    return (
        <>
            <Controller
                rules={mergedRules}
                name={name}
                control={control}
                defaultValue={defaultValue}
                render={({ field: { onChange, onBlur, value, ...fields }, fieldState: { error } }) => {
                    const _isEmpty = get(error, 'message', '')?.length > 0;
                    const errMsg = get(error, 'message', '');
                    return (
                        <>
                            <div
                                className={`tiny ${iscustomWidth ? 'rs-editor-custom-position' : ''}`}
                                ref={divRef}
                                onClick={() => { setShowTools(true) }}
                                {...(!isFooter
                                    ? {
                                        onDragOver: (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.dataTransfer.dropEffect = 'none';
                                        },
                                    }
                                    : {})}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                            >
                                <div onScroll={onScroll}>
                                    <Editor
                                        contentStyle={{
                                            height: 'auto',
                                        }}
                                        defaultContent={resolvedInitialValue}
                                        defaultEditMode="div"
                                        onMount={onMount}
                                        onChange={(e) => {
                                            //debugger
                                            let objCheck = e.html;
                                            if (objCheck.includes('[object Object]')) {
                                                let check;
                                                if (e.transaction.meta.commandName === 'ForeColor') {
                                                    check = objCheck.replaceAll('[object Object]', 'color');
                                                } else {
                                                    check = objCheck.replaceAll('[object Object]', 'background-color');
                                                }
                                                check = check.replaceAll('rgba', 'rgb');
                                                // let check = objCheck.replaceAll('[object Object]', 'background-color');
                                                objCheck = check;
                                            }

                                            // Parse HTML to manipulate links
                                            const parser = new DOMParser();
                                            const doc = parser.parseFromString(objCheck, 'text/html');
                                            const allLinks = doc.querySelectorAll('a');
                                            // Add title attribute to all links
                                            // allLinks.forEach((link) => {
                                            //     const href = link.getAttribute('href');
                                            //     if (href && !link.getAttribute('title')) {
                                            //         // Remove protocol and www for cleaner display
                                            //         let displayUrl = href.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
                                            //         link.setAttribute('title', displayUrl);
                                            //     }
                                            // });

                                            if (applyColorToLinksOnly) {
                                                allLinks.forEach((link) => {
                                                    if (!link.style.color) {
                                                        const coloredParentSpan = link.closest('span[style*="color"]');
                                                        if (coloredParentSpan && coloredParentSpan.style.color) {
                                                            link.style.color = coloredParentSpan.style.color;
                                                        }
                                                    }
                                                });
                                                const coloredSpans = doc.querySelectorAll('span[style*="color"]');
                                                coloredSpans.forEach((span) => {
                                                    const colorMatch = span.style.color;
                                                    if (colorMatch) {
                                                        const linkWithinSpan = span.querySelector('a');
                                                        const linkParent = span.closest('a');

                                                        if (linkWithinSpan) {
                                                            linkWithinSpan.style.color = colorMatch;
                                                            span.style.color = '';
                                                            if (!span.getAttribute('style') || span.getAttribute('style').trim() === '') {
                                                                span.removeAttribute('style');
                                                            }
                                                        } else if (linkParent) {
                                                            linkParent.style.color = colorMatch;
                                                            span.style.color = '';
                                                            if (!span.getAttribute('style') || span.getAttribute('style').trim() === '') {
                                                                span.removeAttribute('style');
                                                            }
                                                        }
                                                    }
                                                });
                                            }

                                            objCheck = doc.body.innerHTML;

                                            // ---------------------------------------------------------
                                            // FIX: Prevent "phantom" onChange events (or those triggered 
                                            // even when keydown prevented) from clearing the manual error.
                                            // If content hasn't changed, don't re-run validation/clearing.
                                            // ---------------------------------------------------------
                                            const currentStoreValue = getValues(name);
                                            // Compare HTML content. getValues might return undefined initially.
                                            if ((currentStoreValue || '') === objCheck) {
                                                return;
                                            }

                                            const len = getTextLength(objCheck);

                                            // Strict Max Char Restriction
                                            if (rest.maxChars && len > rest.maxChars) {
                                                // Prevent update
                                                setError(name, {
                                                    type: 'manual',
                                                    message: `Maximum ${rest.maxChars} characters allowed`,
                                                });
                                                if (errorTimeoutRef.current) {
                                                    clearTimeout(errorTimeoutRef.current);
                                                }
                                                errorTimeoutRef.current = setTimeout(() => {
                                                    clearErrors(name);
                                                    errorTimeoutRef.current = null;
                                                }, 3000);
                                                return; // Do not update value
                                            }

                                            setValue(name, objCheck);
                                            handleChange(e);

                                            if (rest.minChars && len < rest.minChars && len > 0) {
                                                setError(name, {
                                                    type: 'manual',
                                                    message: `Minimum ${rest.minChars} characters required`,
                                                });
                                            } else {
                                                clearErrors(name);
                                            }
                                        }}
                                        // onFocus={(e) => {
                                        //     onMount(e);
                                        // }}
                                        value={val || ''}
                                        onBlur={(e) => {
                                            // debugger;
                                            // setIsUpdated(true);
                                            // setValue(name, e.target.htmlOnChange);
                                            // setShowTools(false);
                                            onBlur(e);
                                        }}
                                        // onFocus={(e) => {
                                        //     setShowTools(true);
                                        //     // onMount(e);
                                        // }}
                                        onEditorChange={(e) => {
                                            handleChange(e);
                                            onChange(e);
                                        }}
                                        // onNodeChange={onNodeChange}
                                        {...rest}
                                        {...fields}
                                    />
                                </div>
                                {renderTools()}
                                {!hideErrorMessage && <span className="text-danger fs-15">{errMsg}</span>}
                            </div>
                        </>
                    );
                }}
            />
        </>
    );
};

RSEditorPopup.propTypes = {
    name: PropTypes.string.isRequired,
    control: PropTypes.object.isRequired,
    required: PropTypes.bool,
    initialValue: PropTypes.string,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    onNodeChange: PropTypes.func,
    rules: PropTypes.object,
    init: PropTypes.object,
    handleNodeChange: PropTypes.func,
    isFooter: PropTypes.bool,
    hideErrorMessage: PropTypes.bool,
    applyColorToLinksOnly: PropTypes.bool,
    hideLinkTools: PropTypes.bool,
};

export default RSEditorPopup;
