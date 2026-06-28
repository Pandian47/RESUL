// KendoDocs shared JS — re-exports prefix config + color tokens.
export {
    RES_PREFIX,
    buildResClass,
    buildResKendoClass,
    RES_KENDO_DD_CLASS,
    RES_KENDO_ICON_DD_CLASS,
    RES_KENDO_MS_CLASS,
    RES_KENDO_SWITCH_CLASS,
    RES_KENDO_DATEPICKER_WRAPPER_CLASS,
    RES_KENDO_TIMEPICKER_WRAPPER_CLASS,
    RES_KENDO_DATETIMEPICKER_WRAPPER_CLASS,
    RES_KENDO_DATETIMEPICKER_POPUP_CLASS,
    RES_KENDO_DATETIMEPICKER_FOOTER_CLASS,
    RES_KENDO_LABEL_CLASS,
    RES_DATE_RANGE_CLASS,
    RES_COMPONENT_CLASS,
    RES_DD_CUSTOM_UPLOAD_CLASS,
    RES_INPUT_CLASS,
} from './kendoDocsPrefix.config';

// Color tokens mirrored from _variables.scss (kept in sync with kendoDocsVariables.scss)
export const RES_COLORS = {
    primaryBlue: '#0000ff',
    secondaryBlue: '#0043ff',
    tertiaryBlue: '#f0f8ff',
    quaternaryBlue: '#c2cfe3',
    borderColor: '#aebed6',
    primaryBlack: '#111111',
    secondaryBlack: '#333333',
    primaryGrey: '#666666',
    secondaryGrey: '#999999',
    tertiaryGrey: '#e9e9e9',
    quaternaryGrey: '#f4f4f4',
    primaryOrange: '#fc6a00',
    primaryRed: '#ff3939',
    primaryGreen: '#5ba529',
    white: '#ffffff',
    black: '#000000',
};

/** Modal / dialog hosts — shared by ResKendoDropdown, ResMultiSelect, etc. */
export const KENDO_INSIDE_POPUP_SELECTOR =
    '.k-animation-container, .k-dialog, .k-window, [role="dialog"], .rs-modal, .modal.show, .modal-dialog';

export const detectKendoInsidePopup = (element) =>
    Boolean(element?.closest?.(KENDO_INSIDE_POPUP_SELECTOR));

export const isKendoModalPopupHost = (appendHost) =>
    Boolean(
        appendHost?.classList?.contains('rsmd-content') ||
            appendHost?.classList?.contains('modal-content'),
    );

export const isKendoPopupAppendedToFieldWrapper = (appendHost, wrapperEl) =>
    Boolean(appendHost && wrapperEl && appendHost === wrapperEl);

/** Disable Kendo slide animation — it flashes from the viewport top inside modals. */
export const shouldDisableKendoPopupAnimate = (appendHost, wrapperEl) =>
    isKendoPopupAppendedToFieldWrapper(appendHost, wrapperEl) ||
    isKendoModalPopupHost(appendHost);

const KENDO_POPUP_GAP_PX = 4;

const syncKendoPopupNodeWidth = (node, widthPx, { fillParent = false } = {}) => {
    if (!node || widthPx <= 0) return;

    if (fillParent) {
        node.style.width = '100%';
        node.style.minWidth = '0';
        node.style.maxWidth = '100%';
        node.style.boxSizing = 'border-box';
        return;
    }

    const width = `${widthPx}px`;
    node.style.width = width;
    node.style.minWidth = '0';
    node.style.maxWidth = width;
    node.style.boxSizing = 'border-box';
};

export const normalizeKendoModalPopupPosition = (animationContainer, anchorEl) => {
    if (!animationContainer || !anchorEl) return;

    const appendHost = animationContainer.parentElement;
    if (!isKendoModalPopupHost(appendHost)) return;

    const trigger =
        anchorEl.querySelector(
            '.k-dropdownlist, .k-picker, .k-multiselect, .k-datepicker, .k-timepicker, .k-datetimepicker',
        ) || anchorEl;
    const triggerRect = trigger.getBoundingClientRect();
    const hostRect = appendHost.getBoundingClientRect();

    const triggerWidth = Math.round(triggerRect.width);
    if (!triggerWidth) return;

    const hasCalendar = Boolean(
        animationContainer.querySelector('.k-calendar, .k-datetime-container'),
    );
    const popupHeight =
        animationContainer.offsetHeight || (hasCalendar ? 320 : 240);

    const spaceBelow = window.innerHeight - triggerRect.bottom - KENDO_POPUP_GAP_PX;
    const spaceAbove = triggerRect.top - KENDO_POPUP_GAP_PX;
    const placement =
        spaceBelow >= 100 || spaceBelow >= spaceAbove ? 'bottom' : 'top';

    const top =
        placement === 'bottom'
            ? triggerRect.bottom - hostRect.top + appendHost.scrollTop + KENDO_POPUP_GAP_PX
            : triggerRect.top -
              hostRect.top +
              appendHost.scrollTop -
              popupHeight -
              KENDO_POPUP_GAP_PX;

    const left = triggerRect.left - hostRect.left + appendHost.scrollLeft;

    Object.assign(animationContainer.style, {
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        bottom: 'auto',
        right: 'auto',
        transform: 'none',
        marginTop: '0',
        zIndex: '1101',
    });

    animationContainer.classList.toggle('showing-below', placement === 'bottom');
    animationContainer.classList.toggle('showing-top', placement === 'top');

    syncKendoPopupNodeWidth(animationContainer, triggerWidth);
    syncKendoPopupNodeWidth(
        animationContainer.querySelector('.k-child-animation-container'),
        triggerWidth,
    );

    animationContainer.querySelectorAll('.k-popup, .k-list-container').forEach((node) => {
        syncKendoPopupNodeWidth(node, triggerWidth, { fillParent: hasCalendar });
    });

    if (hasCalendar) {
        animationContainer.querySelectorAll('.k-calendar, .k-datetime-container').forEach((node) => {
            syncKendoPopupNodeWidth(node, triggerWidth, { fillParent: true });
        });
    }
};

/**
 * @param {Element | null | undefined} triggerEl
 * @param {string} [wrapperSelector] e.g. `.${DD_CLASS.wrapper}` — fallback append host
 */
export const resolveKendoPopupAppendTo = (triggerEl, wrapperSelector) => {
    if (!triggerEl || !detectKendoInsidePopup(triggerEl)) return undefined;

    const modalContent =
        triggerEl.closest('.rsmd-content') ||
        triggerEl.closest('.modal-content');

    // Modal: host on content shell — sibling of RSModal's overflow:hidden height wrapper
    if (modalContent) return modalContent;

    const wrapperHost = wrapperSelector ? triggerEl.closest(wrapperSelector) : null;

    // Grid / nested hosts — field wrapper keeps list width aligned to trigger
    if (wrapperHost) return wrapperHost;

    return (
        triggerEl.closest('.modal-body') ||
        triggerEl.closest('[role="dialog"]') ||
        undefined
    );
};

export const applyKendoPortaledPopupShellStyles = (animationContainer, anchorEl) => {
    if (!animationContainer) return;

    animationContainer.style.zIndex = '1101';
    animationContainer.style.overflow = 'visible';

    const childContainer = animationContainer.querySelector('.k-child-animation-container');
    if (childContainer) {
        childContainer.style.overflow = 'visible';
        childContainer.style.zIndex = '1101';
    }

    const appendHost = animationContainer.parentElement;
    if (isKendoModalPopupHost(appendHost)) {
        normalizeKendoModalPopupPosition(animationContainer, anchorEl);
        return;
    }

    const widthSource =
        anchorEl?.querySelector?.('.k-dropdownlist, .k-picker, .k-multiselect') || anchorEl;
    const isAppendedToAnchor = Boolean(
        anchorEl && animationContainer.parentElement === anchorEl,
    );

    if (!widthSource) return;

    const triggerWidth = Math.round(widthSource.getBoundingClientRect().width);
    if (triggerWidth <= 0) return;

    const syncPopupWidth = (node, width) => {
        if (!node) return;
        node.style.width = width;
        node.style.minWidth = '0';
        node.style.maxWidth = width;
        node.style.boxSizing = 'border-box';
    };

    const popupWidth = isAppendedToAnchor ? '100%' : `${triggerWidth}px`;
    syncPopupWidth(animationContainer, popupWidth);
    syncPopupWidth(childContainer, '100%');

    animationContainer.querySelectorAll('.k-popup, .k-list-container').forEach((node) => {
        syncPopupWidth(node, '100%');
    });
};

export const addKendoPopupClassTokens = (element, classNames = '') => {
    if (!element || !classNames) return;

    classNames
        .split(/\s+/)
        .filter(Boolean)
        .forEach((cls) => element.classList.add(cls));
};
