import { HTTPS_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
// import { Editor } from '@tinymce/tinymce-react';
import { Editor, EditorTools, ProseMirror } from '@progress/kendo-react-editor';
import { ButtonGroup } from '@progress/kendo-react-buttons';
import RSColorPicker from 'Components/ColorPicker';
const {
    Bold,
    Italic,
    Underline,
    FontName,
    FontSize,
    Link,
    Unlink,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    InsertImage,
} = EditorTools;
const { EditorState, Plugin, PluginKey } = ProseMirror;
class EditorView extends ProseMirror.EditorView { }
import { get } from 'lodash';
import PropTypes from 'prop-types';

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
    const [val] = watch([name]);
    const [view, setView] = useState(undefined);
    const [showTools, setShowTools] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [nodeChange, setNodeChange] = useState({});
    const onScroll = () => setShowTools(false);
    const divRef = useRef(null);
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
                    const checkbox = document.getElementById('k-editor-link-target');
                    if (checkbox && !checkbox.checked) {
                        checkbox.checked = true;
                    }
                    replaceCloseIcons();
                    addPlaceholders();
                }
            }
        };

        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        replaceCloseIcons();
        addPlaceholders();

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

    const addPlaceholders = () => {
        const urlInput = document.getElementById('k-editor-link-url');
        if (urlInput && !urlInput.getAttribute('data-placeholder-added')) {
            createFloatingLabel(urlInput, 'Web address');
            urlInput.setAttribute('data-placeholder-added', 'true');
            // Add webaddress class for specific styling
            urlInput.classList.add('webaddress');
            if (urlInput.parentElement) {
                urlInput.parentElement.classList.add('webaddress-wrapper', 'position-relative');
            }
        }
        const textInput = document.getElementById('k-editor-link-text');
        if (textInput && !textInput.getAttribute('data-placeholder-added')) {
            createFloatingLabel(textInput, 'Title');
            textInput.setAttribute('data-placeholder-added', 'true');
        }

        const linkDialog = document.querySelector('.k-widget.k-window.k-dialog');
        if (linkDialog) {
            const labels = linkDialog.querySelectorAll('.k-edit-label');
            labels.forEach((label) => {
                label.style.display = 'none';
            });

        }
    };

    const createFloatingLabel = (input, labelText) => {
        input.placeholder = '';

        let wrapper = input.parentElement;
        if (!wrapper.hasAttribute('data-has-floating-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.setAttribute('data-has-floating-wrapper', 'true');

            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
        }
        const label = document.createElement('label');
        label.textContent = labelText;
        label.className = 'floating-label';
        wrapper.appendChild(label);

        const updateLabel = () => {
            if (input.value || input === document.activeElement) {
                wrapper.classList.add('floating-label-wrapper');
            } else {
                wrapper.classList.remove('floating-label-wrapper');
            }
        };
        input.addEventListener('focus', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('input', updateLabel);
        updateLabel();
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
        setValue(name, initialValue);
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
        setValue(name, initialValue);
    }, [initialValue]);

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
            const iconMappings = {
                'k-i-bold': ['k-bold', 'icon-rs-editor-bold-medium', 'icon-md'],
                'k-i-italic': ['k-italic', 'icon-rs-editor-italic-medium', 'icon-md'],
                'k-i-strikethrough': ['k-strikethrough', 'icon-rs-editor-strikethrough-medium', 'icon-md'],
                'k-i-subscript': ['k-subscript', 'icon-rs-editor-sup-script-medium', 'icon-md'],
                'k-i-superscript': ['k-superscript', 'icon-rs-editor-super-script-medium', 'icon-md'],
                'k-i-underline': ['k-underline', 'icon-rs-editor-underline-medium', 'icon-md'],
                'k-i-link-horizontal': ['k-link-horizontal', 'icon-rs-editor-link-blink-medium', 'icon-md'],
                'k-i-unlink-horizontal': ['k-unlink-horizontal', 'icon-rs-editor-remove-link-medium', 'icon-md'],
                'k-i-list-ordered': ['k-list-ordered', 'icon-rs-editor-unoredred-numbers-list-medium', 'icon-md'],
                'k-i-list-unordered': ['k-list-unordered', 'icon-rs-editor-unoredred-list-medium', 'icon-md'],
                'k-i-align-left': ['k-align-left', 'icon-rs-editor-align-left-medium', 'icon-md'],
                'k-i-align-center': ['k-align-center', 'icon-rs-editor-align-center-medium', 'icon-md'],
                'k-i-align-right': ['k-align-right', 'icon-rs-editor-align-right-medium', 'icon-md'],
                'k-i-align-justify': ['k-align-justify', 'icon-rs-editor-align-justify-medium', 'icon-md'],
                'k-i-background': ['k-background', 'icon-rs-colorpicker-bg-medium', 'icon-md'],
                'k-i-foreground-color': ['k-foreground-color', 'icon-rs-editor-text-color-medium', 'icon-md'],
            };

            Object.entries(iconMappings).forEach(([iconClass, replacementClasses]) => {
                const elements = document.getElementsByClassName(iconClass);
                Array.from(elements).forEach((element) => {
                    replacementClasses.forEach((className) => {
                        element.classList.remove(className);
                    });
                    element.classList.add(...replacementClasses.filter((cls) => cls !== iconClass));
                });
            });
        }, [renderTools]);

        // Add tooltips similar to RSKendoTextEditor
        useEffect(() => {
            const tooltips = {
                'k-i-bold': 'Bold',
                'k-i-italic': 'Italic',
                'k-i-underline': 'Underline',
                'k-i-link-horizontal': 'Link',
                'k-i-unlink-horizontal': 'Remove Link',
                'k-i-align-left': 'Align left',
                'k-i-align-center': 'Align center',
                'k-i-align-right': 'Align right',
                'k-i-align-justify': 'Justify',
                'k-i-image': 'Insert image',
            };

            const addTooltip = (iconElement, tooltipText) => {
                // Check if tooltip already exists on this specific element
                if (iconElement.hasAttribute('data-tooltip-added')) return;

                // Remove native title attribute from the icon and its parent button
                iconElement.removeAttribute('title');
                const parentButton = iconElement.closest('button');
                if (parentButton) {
                    parentButton.removeAttribute('title');
                }

                const tooltip = document.createElement('div');
                tooltip.setAttribute('role', 'tooltip');
                tooltip.classList.add('tooltip', 'bs-tooltip-top');
                tooltip.innerHTML = `
                    <div class="tooltip-arrow" style="position: absolute; left: 0; transform: translate(17px, 0px);"></div>
                    <div class="tooltip-inner">${tooltipText}</div>`;

                iconElement.addEventListener('mouseover', () => {
                    tooltip.classList.add('fade', 'show');
                    tooltip.style.cssText = 'position: absolute; inset: auto auto 0px 0px; transform: translate(-7px, -33px)';
                    iconElement.insertAdjacentElement('afterend', tooltip);
                });

                iconElement.addEventListener('mouseout', () => {
                    tooltip.remove();
                });

                // Mark this element as having a tooltip
                iconElement.setAttribute('data-tooltip-added', 'true');
            };

            Object.keys(tooltips).forEach((iconClass) => {
                const icons = document.getElementsByClassName(iconClass);
                Array.from(icons).forEach((icon) => {
                    addTooltip(icon, tooltips[iconClass]);
                });
            });

            // Also remove title attributes from all toolbar buttons and dropdowns
            const allToolbarButtons = document.querySelectorAll('.text-editor button, .text-editor .k-dropdown');
            allToolbarButtons.forEach((button) => {
                button.removeAttribute('title');
            });

            // Remove title from dropdown spans and inputs
            const dropdownElements = document.querySelectorAll('.text-editor .k-dropdown-wrap, .text-editor .k-input');
            dropdownElements.forEach((element) => {
                element.removeAttribute('title');
            });
        }, [showTools]);

        const [hyperlink, setHyperlink] = useState(false);

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
                setHyperlink(false);
            };
        }, [hyperlink]);

        const handleHyperlinkChange = () => {
            setHyperlink(true);
        };

        const handleClickOutside = (event) => {
            if (
                divRef.current &&
                !divRef.current.contains(event.target) &&
                !event.target.closest('.k-widget.k-window.k-dialog') &&
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
        }, [hyperlink, urlInputs1]);

        // Hyperlink URL validation
        const linkUrlInputs = document.querySelectorAll('#k-editor-link-url');
        useEffect(() => {
            const hyperlinkInputs = document.querySelectorAll('#k-editor-link-url');
            hyperlinkInputs.forEach((item) => {
                item.addEventListener('blur', (e) => {
                    const url = e.target.value;
                    const editFieldDiv = e.target.closest('.k-edit-field');
                    const button = document.querySelector('.k-button-solid-primary');
                    const floatingLabel = editFieldDiv.querySelector('.floating-label');

                    let errorParagraph = editFieldDiv.querySelector('.custom-error');

                    if (!errorParagraph) {
                        errorParagraph = document.createElement('p');
                        errorParagraph.className = 'custom-error';
                        errorParagraph.style.color = 'red';
                        errorParagraph.style.fontSize = '12px';
                        errorParagraph.style.position = 'absolute';
                        errorParagraph.style.top = '-13px';
                        editFieldDiv.appendChild(errorParagraph);
                    }

                    // Validate URL against HTTPS_REGEX
                    if (url !== '' && !HTTPS_REGEX.test(url)) {
                        errorParagraph.textContent = ENTER_VALID_URL;
                        button?.classList.add('click-off');
                        // Hide floating label when showing error
                        if (floatingLabel) {
                            floatingLabel.classList.add('d-none');
                        }
                    } else {
                        errorParagraph.textContent = '';
                        button?.classList.remove('click-off');
                        // Show floating label when no error
                        if (floatingLabel) {
                            floatingLabel.classList.remove('d-none');
                        }
                    }
                });
            });
        }, [hyperlink, linkUrlInputs]);

        return (
            showTools && (
                <span
                    style={{
                        position: 'absolute',
                        backgroundColor: 'white',
                        zIndex: '5',
                        ...position,
                    }}
                    className="box-design text-editor"
                >
                    <ButtonGroup>
                        <FontName {...toolProps} />
                        <FontSize {...toolProps} />
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
                        <span onClick={handleHyperlinkChange}>{isFooter && <InsertImage {...toolProps} />}</span>
                        {/* </span> */}
                        {!hideLinkTools && (
                            <>
                                <span onClick={handleHyperlinkChange}>
                                    <Link {...toolProps} />
                                </span>
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
                                        defaultContent={initialValue}
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
