/**
 * ResTextEditor - Hooks
 *
 * Consolidated DOM enhancement hooks for Kendo Editor toolbars and dialogs.
 */
import { useEffect } from 'react';
import {
    editor_super_script_medium,
    editor_sup_script_medium,
} from 'Constants/GlobalConstant/Glyphicons';
import { TOOLBAR_ICON_CONFIG, EDITOR_CONFIG } from './config';

const IFRAME_CONTENT_STYLES = `
    .k-content > p { margin: 0; }
    @-moz-document url-prefix() {
        scrollbar-color: #999999 #e9e9e9;
        scrollbar-width: thin;
    }
    ::-webkit-scrollbar-track {
        display: none;
        background: transparent;
    }
    ::-webkit-scrollbar {
        width: 5px;
        height: 5px;
        background-color: transparent;
        border-radius: 3px;
        transition: 0.3s ease all;
    }
    ::-webkit-scrollbar-thumb {
        background-color: transparent;
        border-radius: 100px;
        cursor: pointer;
    }
    :hover::-webkit-scrollbar-thumb {
        background-color: #999999;
        border-radius: 3px;
    }
`;

const EDITOR_TOOLTIP_CLASS = 'rs-editor-tooltip';

const escapeTooltipText = (text) => {
    const el = document.createElement('span');
    el.textContent = text;
    return el.innerHTML;
};

const removeEditorTooltip = (tooltipTarget) => {
    const tipId = tooltipTarget?.getAttribute?.('data-rs-tooltip-id');
    if (!tipId) return;
    document.getElementById(tipId)?.remove();
    tooltipTarget.removeAttribute('data-rs-tooltip-id');
};

const showEditorTooltip = (tooltipTarget, tooltipText) => {
    if (!tooltipTarget || !tooltipText) return;
    removeEditorTooltip(tooltipTarget);

    const rect = tooltipTarget.getBoundingClientRect();
    if (!rect.width && !rect.height) return;

    const tipId = `rs-editor-tip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const tip = document.createElement('div');
    tip.id = tipId;
    tip.className = EDITOR_TOOLTIP_CLASS;
    tip.setAttribute('role', 'tooltip');
    tip.innerHTML =
        `<span class="rs-editor-tooltip__text">${escapeTooltipText(tooltipText)}</span>` +
        `<span class="rs-editor-tooltip__arrow"></span>`;

    // Step 1: append hidden so we can measure its height
    tip.style.cssText = 'position:fixed;visibility:hidden;z-index:-1;top:0;left:0;pointer-events:none;';
    document.body.appendChild(tip);

    // Step 2: measure and position directly above the target button (arrow touching)
    const tipHeight = tip.offsetHeight || 24;
    const centerX = rect.left + rect.width / 2;
    const topPos = Math.max(4, rect.top - tipHeight);

    // Use inset shorthand directly so the browser doesn't collapse separate properties
    tip.style.cssText = [
        'position: fixed !important',
        `inset: ${topPos}px auto auto ${centerX}px !important`,
        'z-index: 10003 !important',
        'transform: translateX(-50%) !important',
        'pointer-events: none !important',
        'visibility: visible !important',
        'opacity: 1 !important',
    ].join('; ') + ';';

    tooltipTarget.setAttribute('data-rs-tooltip-id', tipId);
};

const isCustomToolbarControl = (host) =>
    Boolean(
        host?.closest?.('.rs-bootstrap-dropdown, .rs-editor-custom-icon, .k-colorpicker, .k-dropdown-button, .k-dropdownlist'),
    );

const bindToolbarTooltipHost = (host, tooltipText, { allowCustomControls = false } = {}) => {
    if (!host || !tooltipText) return;
    if (!host.closest('.k-toolbar')) return;
    if (!allowCustomControls && isCustomToolbarControl(host)) return;
    if (host.hasAttribute('data-rs-tooltip-bound')) return;
    // Host already uses RSTooltip — avoid duplicate hover labels.
    if (host.querySelector('.rs-tooltip-wrapper')) return;

    const rect = host.getBoundingClientRect();
    if (!rect.width && !rect.height) return;

    host.setAttribute('data-rs-tooltip-bound', 'true');

    const showTip = () => showEditorTooltip(host, tooltipText);
    const hideTip = () => removeEditorTooltip(host);

    host.addEventListener('mouseenter', showTip);
    host.addEventListener('mouseleave', hideTip);

    // RS icon child may be the only visible hit target after icon replacement.
    host.querySelectorAll('.icon-md, .k-button-icon').forEach((el) => {
        el.addEventListener('mouseenter', showTip);
        el.addEventListener('mouseleave', hideTip);
    });
};

const applyIconReplacement = (iconElement, iconClass) => {
    if (iconElement.hasAttribute('data-rs-icon-replaced')) return;

    const svg = iconElement.querySelector('svg');
    if (svg) svg.style.display = 'none';

    const isLegacyKendoIcon = [...iconElement.classList].some((cls) => cls.startsWith('k-i-'));

    if (isLegacyKendoIcon) {
        // Hide Kendo icon-font glyphs on the host node; render RS icon as a child <i>
        iconElement.style.fontSize = '0';
        iconElement.style.lineHeight = '0';
        iconElement.style.display = 'inline-flex';
        iconElement.style.alignItems = 'center';
        iconElement.style.justifyContent = 'center';
        if (!iconElement.querySelector(`.${iconClass}`)) {
            const iEl = document.createElement('i');
            iEl.className = `${iconClass} icon-md`;
            iconElement.appendChild(iEl);
        }
    } else if (!iconElement.querySelector(`.${iconClass}`)) {
        const iEl = document.createElement('i');
        iEl.className = `${iconClass} icon-md`;
        iconElement.appendChild(iEl);
    }

    iconElement.setAttribute('data-rs-icon-replaced', 'true');
};

const getToolbarButtonLabel = (button) =>
    (button?.getAttribute('title') || button?.getAttribute('aria-label') || '').trim();

const replaceToolbarButtonWithRsIcon = (button, iconClass) => {
    if (!button || button.hasAttribute('data-rs-button-icon-replaced')) return;

    const iconHost =
        button.querySelector('.k-button-icon, .k-icon, [class*="k-svg-i-"], [class*="k-i-"]') || null;

    if (iconHost) {
        applyIconReplacement(iconHost, iconClass);
    } else {
        const textEl = button.querySelector('.k-button-text');
        if (textEl) {
            textEl.textContent = '';
            textEl.style.display = 'inline-flex';
            textEl.style.alignItems = 'center';
            textEl.style.justifyContent = 'center';
            textEl.style.width = '100%';
            textEl.style.height = '100%';
            textEl.style.color = 'transparent';
        }

        const host = textEl || button;
        if (!host.querySelector(`.${iconClass}`)) {
            const iEl = document.createElement('i');
            iEl.className = `${iconClass} icon-md`;
            host.appendChild(iEl);
        }
    }

    button.setAttribute('data-rs-button-icon-replaced', 'true');
};

const applyLegacySubSupIconClasses = (toolbar) => {
  const legacyMappings = [
      { hostClass: 'k-i-subscript', iconClass: editor_sup_script_medium },
      { hostClass: 'k-i-superscript', iconClass: editor_super_script_medium },
  ];

  legacyMappings.forEach(({ hostClass, iconClass }) => {
      toolbar.querySelectorAll(`.${hostClass}`).forEach((iconElement) => {
          if (iconElement.closest('.rs-bootstrap-dropdown, .rs-editor-custom-icon, .k-colorpicker')) return;

          const svg = iconElement.querySelector('svg');
          if (svg) svg.style.display = 'none';

          iconElement.classList.remove('k-subscript', 'k-superscript');
          iconElement.classList.add(iconClass, 'icon-md');
          iconElement.style.fontSize = '';
          iconElement.style.lineHeight = '';
          iconElement.setAttribute('data-rs-icon-replaced', 'true');
      });
  });
};

const getEditorToolbar = (root) =>
    root?.querySelector?.(`.${EDITOR_CONFIG.className} .k-toolbar`) || root?.querySelector?.('.k-toolbar');

const buttonMatchesIconConfig = (button, className, legacyClassName) => {
    const classes = [className, legacyClassName].filter(Boolean);
    return classes.some((cls) => {
        if (button.classList.contains(cls)) return true;
        if (button.querySelector(`.${cls}`)) return true;
        return [...button.querySelectorAll('[class*="k-i-"], [class*="k-svg-i-"]')].some((el) =>
            [...el.classList].includes(cls),
        );
    });
};

const collectToolbarIconElements = (root, className, legacyClassName) => {
    const toolbar = getEditorToolbar(root);
    if (!toolbar) return [];

    const nodes = new Set();
    const classNames = [className, legacyClassName].filter(Boolean);

    classNames.forEach((cls) => {
        toolbar.querySelectorAll(`.${cls}, [class~="${cls}"]`).forEach((node) => {
            if (node.closest('.rs-bootstrap-dropdown, .rs-editor-custom-icon, .k-colorpicker')) return;
            nodes.add(node);
        });
    });

    return [...nodes];
};

const bindDisabledToolbarButtonTooltips = (root, config) => {
    const toolbar = getEditorToolbar(root);
    if (!toolbar) return;

    toolbar
        .querySelectorAll(
            '.k-button.k-disabled, .k-button:disabled, .k-button[aria-disabled="true"], ' +
                '.k-dropdown-button.k-disabled, .k-dropdown-button[aria-disabled="true"]',
        )
        .forEach((button) => {
            if (button.hasAttribute('data-rs-tooltip-bound')) return;

            const buttonLabel = getToolbarButtonLabel(button);
            const matchedEntry =
                config.find(({ className, legacyClassName }) =>
                    buttonMatchesIconConfig(button, className, legacyClassName),
                ) ||
                config.find(({ buttonTitle }) => buttonTitle && buttonTitle === buttonLabel);

            const tooltipText = matchedEntry?.tooltipText || buttonLabel;
            if (!tooltipText) return;

            bindToolbarTooltipHost(button, tooltipText, {
                allowCustomControls: Boolean(button.closest('.rs-editor-custom-icon')),
            });
        });
};

const bindDisabledToolbarButtonGuard = (root) => {
    const toolbar = getEditorToolbar(root);
    if (!toolbar) return;

    toolbar
        .querySelectorAll('.k-button.k-disabled, .k-button:disabled, .k-button[aria-disabled="true"]')
        .forEach((button) => {
            if (button.hasAttribute('data-rs-disabled-guard')) return;
            button.setAttribute('data-rs-disabled-guard', 'true');

            const blockAction = (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
            };

            button.addEventListener('click', blockAction, true);
            button.addEventListener('mousedown', blockAction, true);
        });
};

const bindStandardToolbarButtonTooltips = (root, config) => {
    const toolbar = getEditorToolbar(root);
    if (!toolbar) return;

    toolbar.querySelectorAll('.k-button-group > .k-button').forEach((button) => {
        if (isCustomToolbarControl(button)) return;

        const buttonLabel = getToolbarButtonLabel(button);
        const matchedEntry =
            config.find(({ className, legacyClassName }) =>
                buttonMatchesIconConfig(button, className, legacyClassName),
            ) ||
            config.find(({ buttonTitle }) => buttonTitle && buttonTitle === buttonLabel);

        if (matchedEntry) {
            if (!button.hasAttribute('data-rs-button-icon-replaced')) {
                replaceToolbarButtonWithRsIcon(button, matchedEntry.iconClass);
            }
            bindToolbarTooltipHost(button, matchedEntry.tooltipText);
        }
    });
};

// Custom tools that ship their own RSTooltip are excluded via .rs-tooltip-wrapper guard above.
const CUSTOM_TOOLBAR_TOOLTIPS = [
    { selector: '.editor-custom-insert-link .k-button', label: 'Insert links' },
    { selector: '.editor-custom-offer .k-button', label: 'Offer code' },
    { selector: '.editor-custom-image .dropdown-toggle', label: 'Insert image' },
    { selector: '.editor-custom-personalize .dropdown-toggle', label: 'Personalization' },
    { selector: '.editor-custom-smartlink .dropdown-toggle', label: 'Smart link' },
];

// ---------------------------------------------------------------------------
// useEditorIconReplacements — inject RS icon <i> elements into Kendo toolbar
// ---------------------------------------------------------------------------

export const useEditorIconReplacements = (containerRef, iconConfig) => {
    useEffect(() => {
        const root = containerRef?.current || document.body;
        const config = iconConfig?.length ? iconConfig : TOOLBAR_ICON_CONFIG;

        const applyIcons = () => {
            const toolbar = getEditorToolbar(root);
            config.forEach(({ className, legacyClassName, iconClass, buttonTitle }) => {
                collectToolbarIconElements(root, className, legacyClassName).forEach((iconElement) => {
                    applyIconReplacement(iconElement, iconClass);
                });

                if (buttonTitle && toolbar) {
                    toolbar.querySelectorAll('.k-button-group > .k-button').forEach((button) => {
                        if (isCustomToolbarControl(button)) return;
                        if (getToolbarButtonLabel(button) !== buttonTitle) return;
                        replaceToolbarButtonWithRsIcon(button, iconClass);
                    });
                }
            });

            if (toolbar) {
                applyLegacySubSupIconClasses(toolbar);
            }
            bindStandardToolbarButtonTooltips(root, config);
            bindDisabledToolbarButtonTooltips(root, config);
            bindDisabledToolbarButtonGuard(root);
        };

        applyIcons();
        const observer = new MutationObserver(applyIcons);
        observer.observe(root, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            document.querySelectorAll(`.${EDITOR_TOOLTIP_CLASS}`).forEach((el) => el.remove());
        };
    }, [containerRef, iconConfig]);
};

// ---------------------------------------------------------------------------
// useCustomToolbarTooltips — tooltips for InsertLinks, Image, Offer, etc.
// ---------------------------------------------------------------------------

export const useCustomToolbarTooltips = (containerRef) => {
    useEffect(() => {
        const root = containerRef?.current;
        if (!root) return;

        const bindCustomTips = () => {
            CUSTOM_TOOLBAR_TOOLTIPS.forEach(({ selector, label }) => {
                root.querySelectorAll(`.k-toolbar ${selector}`).forEach((host) => {
                    bindToolbarTooltipHost(host, label, { allowCustomControls: true });
                });
            });
            bindDisabledToolbarButtonGuard(root);
        };

        bindCustomTips();
        const observer = new MutationObserver(bindCustomTips);
        observer.observe(root, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            document.querySelectorAll(`.${EDITOR_TOOLTIP_CLASS}`).forEach((el) => el.remove());
        };
    }, [containerRef]);
};

// ---------------------------------------------------------------------------
// useHyperlinkDialogEnhancements — disable insert until URL filled
// ---------------------------------------------------------------------------

export const useHyperlinkDialogEnhancements = () => {
    useEffect(() => {
        const checkHyperlinkDialog = () => {
            const dialog = document.querySelector('.k-edit-field input');
            const button = document.querySelector('.k-button-solid-primary');
            if (!dialog || !button) return;

            const handleInputChange = () => {
                if (dialog.value.trim() === '') {
                    button.classList.add('click-off');
                } else {
                    button.classList.remove('click-off');
                }
            };

            dialog.removeEventListener('input', handleInputChange);
            dialog.addEventListener('input', handleInputChange);
            handleInputChange();
        };

        const replaceCloseIcons = () => {
            const closeButtons = document.querySelectorAll('.k-icon.k-font-icon.k-i-x.k-button-icon');
            closeButtons.forEach((button) => {
                if (button.getAttribute('data-rs-icon-replaced')) return;

                button.style.display = 'none';
                const newIcon = document.createElement('i');
                const baseClasses = 'icon-md color-primary-blue';
                const outlineClass = 'icon-rs-popup-close-circle-medium';
                const filledClass = 'icon-rs-popup-close-circle-fill-medium';
                newIcon.className = `${baseClasses} ${outlineClass}`;

                const tooltip = document.createElement('div');
                tooltip.setAttribute('role', 'tooltip');
                tooltip.classList.add('tooltip', 'bs-tooltip-top');
                tooltip.innerHTML =
                    '<div class="tooltip-arrow" style="position: absolute; left: 0; transform: translate(17px, 0px);"></div>' +
                    '<div class="tooltip-inner">Close</div>';

                newIcon.addEventListener('mouseenter', () => {
                    newIcon.className = `${baseClasses} ${filledClass}`;
                    tooltip.classList.add('fade', 'show');
                    tooltip.style.cssText =
                        'position: absolute; inset: auto auto 0px 0px; transform: translate(-12px, -30px)';
                    newIcon.insertAdjacentElement('afterend', tooltip);
                });

                newIcon.addEventListener('mouseleave', () => {
                    newIcon.className = `${baseClasses} ${outlineClass}`;
                    tooltip.remove();
                });

                newIcon.addEventListener('click', () => {
                    button.click();
                });
                button.parentNode.insertBefore(newIcon, button.nextSibling);
                button.setAttribute('data-rs-icon-replaced', 'true');
            });
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

            if (wrapper.querySelector('.floating-label')) return;

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

        const addPlaceholders = () => {
            const urlInput = document.getElementById('k-editor-link-url');
            if (urlInput && !urlInput.getAttribute('data-placeholder-added')) {
                createFloatingLabel(urlInput, 'Web address');
                urlInput.setAttribute('data-placeholder-added', 'true');
            }
            const textInput = document.getElementById('k-editor-link-text');
            if (textInput && !textInput.getAttribute('data-placeholder-added')) {
                createFloatingLabel(textInput, 'Title');
                textInput.setAttribute('data-placeholder-added', 'true');
            }
        };

        const enhanceDialogs = () => {
            checkHyperlinkDialog();
            replaceCloseIcons();
            addPlaceholders();
        };

        const observer = new MutationObserver(enhanceDialogs);
        observer.observe(document.body, { childList: true, subtree: true });
        enhanceDialogs();
        return () => observer.disconnect();
    }, []);
};

// ---------------------------------------------------------------------------
// useRemoveKendoButtonTitles — remove native title attributes from toolbar
// ---------------------------------------------------------------------------

export const useRemoveKendoButtonTitles = (containerRef) => {
    useEffect(() => {
        const scope = containerRef?.current || document;
        const removeTitles = () => {
            scope.querySelectorAll('.k-toolbar .k-button[title], .k-toolbar .k-icon-button[title]').forEach((btn) => {
                const title = btn.getAttribute('title')?.trim();
                if (title && !btn.hasAttribute('data-rs-tooltip-bound') && !isCustomToolbarControl(btn)) {
                    bindToolbarTooltipHost(btn, title);
                }
                btn.removeAttribute('title');
            });
        };
        removeTitles();
        const observer = new MutationObserver(removeTitles);
        observer.observe(scope === document ? document.body : scope, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [containerRef]);
};

// ---------------------------------------------------------------------------
// useIframeContentStyles — inject base styles into editor iframe
// ---------------------------------------------------------------------------

export const useIframeContentStyles = () => {
    const onMount = (event) => {
        const iframeDocument = event.dom.ownerDocument;
        const style = iframeDocument.createElement('style');
        style.appendChild(iframeDocument.createTextNode(IFRAME_CONTENT_STYLES));
        iframeDocument.head.appendChild(style);

        const fontStyle = iframeDocument.createElement('style');
        fontStyle.innerHTML = `body { font-family: 'MuktaRegular', 'Mukta', sans-serif; }`;
        iframeDocument.head.appendChild(fontStyle);
    };

    return onMount;
};

// ---------------------------------------------------------------------------
// useResponsiveToolbar — allow toolbar wrap on smaller viewports
// ---------------------------------------------------------------------------

export const useResponsiveToolbar = (enabled, className) => {
    useEffect(() => {
        if (!enabled) return;
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-rs-editor-toolbar-wrap', className);
        styleEl.innerHTML = `
            .${className} .k-editor .k-toolbar {
                flex-wrap: wrap;
                height: auto;
                align-content: flex-start;
            }
        `;
        document.head.appendChild(styleEl);
        return () => {
            if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
        };
    }, [enabled, className]);
};
