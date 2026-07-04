import { numberWithCommas } from 'Utils/modules/formatters';
import { Children, cloneElement, isValidElement, memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import './resMultiSelect.scss';
import { get as _get, get } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';
import { flushSync } from 'react-dom';
import ResNoDataAvailable from '../ResNoDataAvailable';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import ResTooltip from '../ResTooltip';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { MultiSelect } from '@progress/kendo-react-dropdowns';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    RES_KENDO_MS_CLASS as MS_CLASS,
    applyKendoPortaledPopupShellStyles,
    resolveKendoPopupAppendTo,
    shouldDisableKendoPopupAnimate,
} from '../../kendoDocsVariables';


import { normalizeDisplayText } from 'Utils/modules/stringUtils';
import { _isObject } from 'Utils/modules/misc';


export const RES_MULTISELECT_VARIANT = {
    DEFAULT: 'default',
    CHECKBOX: 'checkbox',
};

const DROPDOWN_POSITION = { ABOVE: 'above', BELOW: 'below' };
const ESTIMATED_POPUP_HEIGHT = 240;
const POSITION_CLASS = { above: 'showing-top', below: 'showing-below' };
const preventPopupClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

const formatChipCountHoverTitle = (label, count) => {
    const trimmedLabel = (label || '').trim();
    const formattedCount = String(numberWithCommas(count));
    if (trimmedLabel) {
        return `${trimmedLabel} - count (${formattedCount})`;
    }
    return `count (${formattedCount})`;
};

const renderCheckboxListItem = ({
    li,
    itemProps,
    isActive,
    disabled,
    checkboxControl,
    fieldName,
    displayValue,
    itemKey,
    onToggle,
    onInteract,
}) =>
    cloneElement(li, {
        ...li.props,
        key: `checkbox-${itemKey}-${isActive}`,
        className: [
            li.props.className,
            MS_CLASS.checkboxItem,
            isActive && !disabled ? 'active' : '',
            disabled ? 'click-off pe-none k-disabled' : '',
        ]
            .filter(Boolean)
            .join(' '),
        style: disabled
            ? { pointerEvents: 'none', ...li.props.style }
            : isActive
              ? { pointerEvents: 'auto', ...li.props.style }
              : li.props.style,
        onMouseDown: disabled
            ? undefined
            : (e) => {
                  onInteract?.();
                  preventPopupClose(e);
              },
        onClick: disabled
            ? undefined
            : (e) => {
                  preventPopupClose(e);
                  onToggle(itemProps.dataItem, !isActive);
              },
        children: (
            <div
                className={`${MS_CLASS.checkboxItemInner}${disabled ? ' pe-none' : ''}`}
                onMouseDown={
                    disabled
                        ? undefined
                        : (e) => {
                              onInteract?.();
                              preventPopupClose(e);
                          }
                }
                onClick={disabled ? undefined : (e) => e.stopPropagation()}
            >
                <RSCheckbox
                    control={checkboxControl}
                    name={fieldName}
                    labelName={displayValue}
                    disabledchk={disabled}
                    handleChange={(e) => onToggle(itemProps.dataItem, e.target.checked)}
                    containerClass="mb-0"
                    isError={false}
                />
            </div>
        ),
    });

const RES_MS_DOM = {
    inputInner: 'input.k-input-inner',
    popupContainer: '.k-animation-container',
    chip: '.k-chip',
    chipLabel: '.k-chip-label',
    chipContent: '.k-chip-content',
    chipRemoveIcon:
        '.k-chip-remove-action .k-svg-i-x-circle, .k-chip-remove-action .k-i-x-circle, .k-chip-remove-action .k-icon',
    clearButton: '.k-clear-value',
};

const CHIP_REMOVE_TOOLTIP_TEXT = 'Remove';
const CHIP_REMOVE_TOOLTIP_ATTR = 'data-tooltip-added';
const CHIP_REMOVE_ACTION_SELECTOR = '.k-chip-remove-action';
const CHIP_REMOVE_ICON_SELECTOR =
    '.k-svg-i-x-circle, .k-i-x-circle, .k-icon, .k-svg-icon, .icon-rs-circle-minus-fill-mini';
const CHIP_REMOVE_TOOLTIP_GAP = 4;
const CHIP_REMOVE_ICON_SIZE = 15;

const createChipRemoveTooltipState = () => ({
    tooltipEl: null,
    removeActionEl: null,
    repositionHandler: null,
});

const resolveChipRemoveHost = (icon) => icon?.closest(CHIP_REMOVE_ACTION_SELECTOR) || icon;

const getChipRemoveAnchorRect = (removeAction) => {
    if (!removeAction) return null;

    const icon = removeAction.querySelector(CHIP_REMOVE_ICON_SELECTOR);
    const iconRect = icon?.getBoundingClientRect();
    if (iconRect && (iconRect.width > 0 || iconRect.height > 0)) {
        return iconRect;
    }

    const actionRect = removeAction.getBoundingClientRect();
    const top = actionRect.top + (actionRect.height - CHIP_REMOVE_ICON_SIZE) / 2;
    const left = actionRect.right - CHIP_REMOVE_ICON_SIZE;

    return {
        top,
        left,
        width: CHIP_REMOVE_ICON_SIZE,
        height: CHIP_REMOVE_ICON_SIZE,
        right: left + CHIP_REMOVE_ICON_SIZE,
        bottom: top + CHIP_REMOVE_ICON_SIZE,
    };
};

const detachChipRemoveTooltipListeners = (state) => {
    if (!state.repositionHandler) return;

    window.removeEventListener('scroll', state.repositionHandler, true);
    window.removeEventListener('resize', state.repositionHandler);
    state.repositionHandler = null;
};

const positionChipRemoveTooltip = (tooltip, removeAction) => {
    if (!tooltip || !removeAction || !document.contains(removeAction)) return;

    const rect = getChipRemoveAnchorRect(removeAction);
    if (!rect?.width && !rect?.height) return;

    const anchorCenterX = rect.left + rect.width / 2;

    tooltip.style.position = 'fixed';
    tooltip.style.inset = 'auto';
    tooltip.style.bottom = 'auto';
    tooltip.style.right = 'auto';
    tooltip.style.margin = '0';
    tooltip.style.transform = 'none';
    tooltip.style.zIndex = '10003';
    tooltip.style.pointerEvents = 'none';

    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportPadding = 8;
    let left = anchorCenterX - tooltipRect.width / 2;
    const maxLeft = window.innerWidth - tooltipRect.width - viewportPadding;
    left = Math.min(Math.max(viewportPadding, left), maxLeft);
    const top = Math.max(viewportPadding, rect.top - tooltipRect.height - CHIP_REMOVE_TOOLTIP_GAP);

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    const arrow = tooltip.querySelector('.tooltip-arrow');
    if (arrow) {
        arrow.style.left = `${anchorCenterX - left}px`;
    }
};

const hideChipRemoveTooltip = (state) => {
    detachChipRemoveTooltipListeners(state);
    state.tooltipEl?.classList.remove('show');
    state.tooltipEl?.remove();
    state.removeActionEl = null;
};

const showChipRemoveTooltip = (state, removeAction) => {
    if (!removeAction || !document.contains(removeAction)) return;

    if (!state.tooltipEl) {
        state.tooltipEl = document.createElement('div');
        state.tooltipEl.setAttribute('role', 'tooltip');
        state.tooltipEl.className =
            'tooltip bs-tooltip-top fade toolTipOverlayZindexCSS rs-tag-remove-tooltip rs-multiselect-remove-tooltip';
        state.tooltipEl.innerHTML =
            `<div class="tooltip-inner">${CHIP_REMOVE_TOOLTIP_TEXT}</div>` +
            '<div class="tooltip-arrow"></div>';
    }

    state.removeActionEl = removeAction;
    document.body.appendChild(state.tooltipEl);
    state.tooltipEl.classList.add('show');
    positionChipRemoveTooltip(state.tooltipEl, removeAction);

    if (!state.repositionHandler) {
        state.repositionHandler = () => {
            if (state.removeActionEl && state.tooltipEl?.isConnected) {
                positionChipRemoveTooltip(state.tooltipEl, state.removeActionEl);
            }
        };
        window.addEventListener('scroll', state.repositionHandler, true);
        window.addEventListener('resize', state.repositionHandler);
    }

    requestAnimationFrame(() => {
        if (state.removeActionEl === removeAction && state.tooltipEl?.isConnected) {
            positionChipRemoveTooltip(state.tooltipEl, removeAction);
        }
    });
};

const attachChipRemoveTooltip = (state, removeAction) => {
    if (!removeAction || removeAction.hasAttribute(CHIP_REMOVE_TOOLTIP_ATTR)) return;

    const showTooltip = () => showChipRemoveTooltip(state, removeAction);
    const hideTooltip = () => {
        if (state.removeActionEl === removeAction) {
            hideChipRemoveTooltip(state);
        }
    };

    removeAction.addEventListener('mouseenter', showTooltip);
    removeAction.addEventListener('mouseleave', hideTooltip);
    removeAction.addEventListener('focus', showTooltip);
    removeAction.addEventListener('blur', hideTooltip);
    removeAction.addEventListener('mousedown', hideTooltip);
    removeAction.addEventListener('click', hideTooltip);
    removeAction.setAttribute(CHIP_REMOVE_TOOLTIP_ATTR, 'true');
    removeAction.setAttribute('aria-label', CHIP_REMOVE_TOOLTIP_TEXT);
};

const cleanupStaleChipRemoveTooltips = (state, wrapper) => {
    if (state.removeActionEl && (!wrapper || !wrapper.contains(state.removeActionEl))) {
        hideChipRemoveTooltip(state);
    }
};

const ResMultiSelect = ({
    className = '',
    popupClass = '',
    name,
    rules,
    control,
    defaultValue = [],
    allowCustom = false,
    acceptNewValue = true,
    label,
    data = [],
    textField,
    dataItemKey,
    handleChange = () => {},
    handleOnBlur = () => {},
    required,
    disabled,
    itemRender,
    isCustomRender = false,
    isCustomOnchange = false,
    limitLength = 5,
    setError = () => {},
    clearErrors = () => {},
    customErrorMessage = 'More than 5 lists are not allowed',
    handleFilterChange = () => {},
    filterable = false,
    itemDisabled,
    isTagRender = false,
    showTitleOnTruncate = true,
    showChipTitle = false,
    hideSelectedChips = false,
    footer,
    loading = false,
    isLoading = false,
    smallText,
    rightTooltip,
    rightTooltipIcon = circle_question_mark_mini,
    variant = RES_MULTISELECT_VARIANT.DEFAULT,
    selectAllLabel = 'Select all',
    hideSelectAllRow = false,
    showCheckboxFooter = false,
    checkboxSaveLabel = 'Save',
    checkboxCancelLabel = 'Cancel',
    onCheckboxSave = () => {},
    onCheckboxCancel = () => {},
    ...rest
}) => {
    const {
        popupSettings: consumerPopupSettings,
        autoClose: autoCloseProp,
        opened: openedProp,
        ...multiSelectRest
    } = rest;
    const resolvedPopupClass = useMemo(
        () => [popupClass, consumerPopupSettings?.popupClass].filter(Boolean).join(' '),
        [popupClass, consumerPopupSettings?.popupClass],
    );
    const isCheckboxVariant = variant === RES_MULTISELECT_VARIANT.CHECKBOX;
    const usesManagedPopup = isCheckboxVariant;
    const showLoader = loading || isLoading;
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [tempSelection, setTempSelection] = useState([]);
    const popupInteractRef = useRef(false);
    const saveFooterClickedRef = useRef(false);
    const checkboxFieldIdRef = useRef(`res_ms_${useId().replace(/:/g, '')}`);
    const selectAllFieldName = `${checkboxFieldIdRef.current}_all`;
    const { control: checkboxControl, reset: resetCheckboxForm } = useForm({
        shouldUnregister: true,
        defaultValues: {},
    });
    const normalizeItem = useCallback(
        (item) => {
            if (item == null) return null;
            if (typeof item === 'string') return normalizeDisplayText(item);
            if (!_isObject(item)) return item;

            const nextItem = { ...item };
            if (textField) {
                if (nextItem[textField] == null) return null;
                if (typeof nextItem[textField] === 'string') {
                    nextItem[textField] = normalizeDisplayText(nextItem[textField]);
                }
            }
            if (dataItemKey && nextItem[dataItemKey] === undefined) {
                return null;
            }
            if (typeof nextItem.data === 'string') {
                nextItem.data = normalizeDisplayText(nextItem.data);
            }
            return nextItem;
        },
        [textField, dataItemKey],
    );

    const dataArray = useMemo(
        () => (Array.isArray(data) ? data.map(normalizeItem).filter(Boolean) : []),
        [data, normalizeItem],
    );

    const canAllowCustom = allowCustom || acceptNewValue;
    const isFilterable = filterable || dataArray.length > 5 || canAllowCustom;

    const watchedSelection = useWatch({ control, name, defaultValue });
    const selectedValues = useMemo(() => {
        if (!Array.isArray(watchedSelection)) {
            return watchedSelection ? [watchedSelection] : [];
        }
        return watchedSelection;
    }, [watchedSelection]);

    const getItemKey = useCallback(
        (item) => {
            if (!_isObject(item)) return String(item ?? '');
            if (dataItemKey) {
                const key = _get(item, dataItemKey, '');
                if (key !== '' && key != null) return String(key);
            }
            return String(_get(item, textField, '') ?? '');
        },
        [dataItemKey, textField],
    );

    const isItemDisabled = useCallback(
        (dataItem) => {
            if (!itemDisabled || !_isObject(dataItem)) return false;
            return Boolean(_get(dataItem, itemDisabled, false));
        },
        [itemDisabled],
    );

    const selectableItems = useMemo(
        () => dataArray.filter((item) => !isItemDisabled(item)),
        [dataArray, isItemDisabled],
    );

    const resolveListDataItem = useCallback(
        (dataItem) => {
            if (dataItem == null) return dataItem;
            if (!_isObject(dataItem)) {
                const key = String(dataItem);
                return dataArray.find((entry) => getItemKey(entry) === key) ?? dataItem;
            }
            const label = textField ? _get(dataItem, textField, '') : '';
            if (label !== '' && label != null) return dataItem;
            const key = getItemKey(dataItem);
            return dataArray.find((entry) => getItemKey(entry) === key) ?? dataItem;
        },
        [dataArray, getItemKey, textField],
    );

    const getItemDisplay = useCallback(
        (item) => {
            const resolved = resolveListDataItem(item);
            if (!_isObject(resolved)) return String(resolved ?? '');
            return String(_get(resolved, textField, '') ?? '');
        },
        [resolveListDataItem, textField],
    );

    const getListItemLabel = useCallback(
        (li, itemProps, item) => {
            const fromData = getItemDisplay(item);
            if (fromData) return fromData;
            if (typeof itemProps?.text === 'string' && itemProps.text.trim()) {
                return itemProps.text;
            }
            const child = li?.props?.children;
            if (typeof child === 'string' && child.trim()) return child;
            if (Array.isArray(child)) {
                const text = child
                    .map((node) => (typeof node === 'string' ? node : ''))
                    .join('')
                    .trim();
                if (text) return text;
            }
            return '';
        },
        [getItemDisplay],
    );

    const getCheckboxFieldName = useCallback(
        (item) => `${checkboxFieldIdRef.current}_${getItemKey(item).replace(/\W/g, '_')}`,
        [getItemKey],
    );

    const markPopupInteraction = useCallback(() => {
        popupInteractRef.current = true;
    }, []);

    const isTempItemSelected = useCallback(
        (item) => tempSelection.some((selected) => getItemKey(selected) === getItemKey(item)),
        [tempSelection, getItemKey],
    );

    const allTempItemsSelected =
        selectableItems.length > 0 &&
        selectableItems.every((item) => isTempItemSelected(item));

    useEffect(() => {
        if (!isCheckboxVariant) return;

        const values = {};
        if (!hideSelectAllRow) {
            values[selectAllFieldName] = allTempItemsSelected;
        }
        dataArray.forEach((item) => {
            values[getCheckboxFieldName(item)] = isTempItemSelected(item);
        });
        resetCheckboxForm(values);
    }, [
        isCheckboxVariant,
        allTempItemsSelected,
        dataArray,
        getCheckboxFieldName,
        hideSelectAllRow,
        isTempItemSelected,
        resetCheckboxForm,
        selectAllFieldName,
        selectableItems,
        tempSelection,
    ]);

    const [filterText, setFilterText] = useState('');
    const [hasFilterInput, setHasFilterInput] = useState(false);
    const displayData = useMemo(() => {
        const search = filterText.trim();
        if (!search) {
            return dataArray;
        }
        const needle = search.toLowerCase();
        return dataArray.filter((item) => {
            if (item == null) return false;
            const name = String(
                _isObject(item) ? _get(item, textField, '') : item,
            ).toLowerCase();
            return name.includes(needle);
        });
    }, [dataArray, filterText, textField]);

    const total = dataArray.length;
    const pageSize = 50;
    const isVirtialization = total > 5000;
    const wrapperRef = useRef(null);
    const fieldRef = useRef(null);
    const hadFocusRef = useRef(false);
    const currentPopupRef = useRef(null);
    const chipRemoveTooltipStateRef = useRef(createChipRemoveTooltipState());
    const [dropdownPosition, setDropdownPosition] = useState(DROPDOWN_POSITION.BELOW);

    const [dropdownItems, setDropdownItems] = useState({
        skip: 0,
        options: displayData.slice(0, pageSize),
    });
    const [virtualListTotal, setVirtualListTotal] = useState(() =>
        isVirtialization ? displayData.length : 0,
    );

    useEffect(() => {
        if (!isVirtialization) return;
        setVirtualListTotal(displayData.length);
        setDropdownItems({
            skip: 0,
            options: displayData.slice(0, pageSize),
        });
    }, [displayData, isVirtialization, pageSize]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const input = wrapper.querySelector(RES_MS_DOM.inputInner);
        if (!input) return;

        const syncFilterInput = () => {
            setHasFilterInput(Boolean(String(input.value ?? '').trim()));
        };

        const onFocus = () => {
            hadFocusRef.current = true;
        };
        const onBlur = () => {
            hadFocusRef.current = false;
        };

        syncFilterInput();
        input.addEventListener('input', syncFilterInput);
        input.addEventListener('focus', onFocus);
        input.addEventListener('blur', onBlur);

        let refocusRaf = 0;
        const observer = new MutationObserver(() => {
            syncFilterInput();
            if (!hadFocusRef.current || document.activeElement === input) return;
            const popupOpen = wrapper.querySelector(RES_MS_DOM.popupContainer);
            if (!popupOpen) return;

            cancelAnimationFrame(refocusRaf);
            refocusRaf = requestAnimationFrame(() => {
                if (!hadFocusRef.current || document.activeElement === input) return;
                if (!wrapper.querySelector(RES_MS_DOM.popupContainer)) return;
                input.focus({ preventScroll: true });
            });
        });

        observer.observe(wrapper, { childList: true, subtree: true });

        return () => {
            cancelAnimationFrame(refocusRaf);
            observer.disconnect();
            input.removeEventListener('input', syncFilterInput);
            input.removeEventListener('focus', onFocus);
            input.removeEventListener('blur', onBlur);
        };
    }, []);

    const decorateChipChrome = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        wrapper.querySelectorAll(RES_MS_DOM.clearButton).forEach((clearBtn) => {
            if (showLoader) {
                clearBtn.style.setProperty('display', 'none', 'important');
                clearBtn.style.setProperty('visibility', 'hidden', 'important');
                clearBtn.style.setProperty('pointer-events', 'none', 'important');
            } else {
                clearBtn.style.removeProperty('display');
                clearBtn.style.removeProperty('visibility');
                clearBtn.style.removeProperty('pointer-events');
            }
        });

        cleanupStaleChipRemoveTooltips(chipRemoveTooltipStateRef.current, wrapper);

        wrapper.querySelectorAll(RES_MS_DOM.chipRemoveIcon).forEach((icon) => {
            if (!icon.classList.contains('icon-rs-circle-minus-fill-mini')) {
                icon.classList.add('icon-rs-circle-minus-fill-mini');
            }
            icon.removeAttribute('title');
            icon.removeAttribute('rel');
            const removeAction = resolveChipRemoveHost(icon);
            removeAction?.removeAttribute('title');
            if (removeAction) {
                attachChipRemoveTooltip(chipRemoveTooltipStateRef.current, removeAction);
            }
        });

        wrapper.querySelectorAll(RES_MS_DOM.clearButton).forEach((clearBtn) => {
            if (!showLoader && clearBtn.getAttribute('title') !== 'Clear all') {
                clearBtn.setAttribute('title', 'Clear all');
                clearBtn.setAttribute('aria-label', 'Clear all');
            }
        });
    }, [showLoader]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return undefined;

        let rafId = 0;
        const scheduleDecorate = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(decorateChipChrome);
        };

        const observer = new MutationObserver(scheduleDecorate);
        observer.observe(wrapper, { childList: true, subtree: true });
        scheduleDecorate();

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
            hideChipRemoveTooltip(chipRemoveTooltipStateRef.current);
        };
    }, [decorateChipChrome]);

    const onPageChange = (event) => {
        if (!isVirtialization) return;
        const skip = event.page.skip;
        const end = Math.min(skip + pageSize, displayData.length);

        setDropdownItems({
            skip,
            options: displayData.slice(skip, end),
        });
    };

    const resetListFilter = useCallback(() => {
        setFilterText('');
        setHasFilterInput(false);
    }, []);

    const filterChange = (event) => {
        const nextFilter = String(event?.filter?.value ?? '');
        flushSync(() => {
            setFilterText(nextFilter);
            setHasFilterInput(Boolean(nextFilter.trim()));
        });
        handleFilterChange(event);
    };

    const getFocusedItemIndex = useCallback(
        (items, inputText) => {
            if (!Array.isArray(items) || items.length === 0) return -1;
            const search = String(inputText ?? filterText ?? '').trim();
            if (!search) return -1;
            const needle = search.toLowerCase();
            return items.findIndex((item) => {
                if (item == null) return false;
                const name = String(
                    _isObject(item) ? _get(item, textField, '') : item,
                ).toLowerCase();
                return name.includes(needle);
            });
        },
        [filterText, textField],
    );

    const findPopupContainer = useCallback(() => {
        try {
            const ownsEl = wrapperRef.current?.querySelector('[aria-owns]');
            const ownsId = ownsEl?.getAttribute('aria-owns');
            if (ownsId) {
                const listContainer = document.getElementById(ownsId);
                const popupContainer = listContainer?.closest('.k-animation-container');
                if (popupContainer) return popupContainer;
            }
        } catch {
            // fall through to wrapper-scoped lookup
        }
        return wrapperRef.current?.querySelector(RES_MS_DOM.popupContainer) || null;
    }, []);

    const normalizePopupPosition = useCallback(() => {
        const popupContainer = findPopupContainer();
        if (!popupContainer) return;

        const triggerEl = wrapperRef.current;
        if (triggerEl) {
            const triggerWidth = Math.ceil(triggerEl.getBoundingClientRect().width);
            if (triggerWidth > 0) {
                popupContainer.style.width = `${triggerWidth}px`;
                popupContainer.style.minWidth = `${triggerWidth}px`;
            }
        }

        if (fieldRef.current && popupContainer.parentElement === fieldRef.current) {
            popupContainer.style.left = '0px';
        }

        applyKendoPortaledPopupShellStyles(
            popupContainer,
            fieldRef.current || wrapperRef.current,
        );
    }, [findPopupContainer]);

    const applyPopupLayerStyles = useCallback(() => {
        const animationContainer = findPopupContainer();
        if (!animationContainer) return;

        applyKendoPortaledPopupShellStyles(
            animationContainer,
            fieldRef.current || wrapperRef.current,
        );

        const popupShellNodes = [
            animationContainer,
            ...animationContainer.querySelectorAll(
                '.k-child-animation-container, .k-popup, .k-list-container',
            ),
        ];

        popupShellNodes.forEach((node) => {
            node.classList.add(MS_CLASS.listPopup);
            if (isCheckboxVariant) {
                node.classList.add(MS_CLASS.checkboxVariant);
            }
            node.classList.toggle(MS_CLASS.hideSelectedChips, hideSelectedChips);
        });
    }, [findPopupContainer, hideSelectedChips, isCheckboxVariant]);

    const getDropdownPosition = useCallback(
        (popupContainer = null) => {
            const animationContainer =
                popupContainer || currentPopupRef.current || findPopupContainer();
            const triggerEl = wrapperRef.current;

            if (animationContainer && triggerEl) {
                const popupRect = animationContainer.getBoundingClientRect();
                const triggerRect = triggerEl.getBoundingClientRect();
                const popupCenterY = (popupRect.top + popupRect.bottom) / 2;
                const triggerCenterY = (triggerRect.top + triggerRect.bottom) / 2;
                return popupCenterY < triggerCenterY
                    ? DROPDOWN_POSITION.ABOVE
                    : DROPDOWN_POSITION.BELOW;
            }

            if (!triggerEl) return DROPDOWN_POSITION.BELOW;

            const { top, bottom } = triggerEl.getBoundingClientRect();
            const spaceBelow = window.innerHeight - bottom;
            const spaceAbove = top;
            return spaceBelow < ESTIMATED_POPUP_HEIGHT && spaceAbove > spaceBelow
                ? DROPDOWN_POSITION.ABOVE
                : DROPDOWN_POSITION.BELOW;
        },
        [findPopupContainer],
    );

    const applyPositionClass = useCallback(
        (position, popupContainer = null) => {
            const animationContainer =
                popupContainer || currentPopupRef.current || findPopupContainer();
            if (!animationContainer) return false;

            if (!animationContainer.classList.contains(MS_CLASS.popup)) {
                animationContainer.classList.add(MS_CLASS.popup);
            }
            if (resolvedPopupClass) {
                resolvedPopupClass
                    .split(/\s+/)
                    .filter(Boolean)
                    .forEach((cls) => animationContainer.classList.add(cls));
            }

            const posClass = POSITION_CLASS[position];
            const elements = [
                animationContainer,
                ...animationContainer.querySelectorAll('.k-popup, .k-list-container, .k-list'),
            ];
            elements.forEach((el) => {
                el.classList.remove(POSITION_CLASS.above, POSITION_CLASS.below);
                el.classList.add(posClass);
            });

            return true;
        },
        [findPopupContainer, resolvedPopupClass],
    );

    const addPositionClassToAnimationContainer = useCallback(
        (pos = null) => {
            const popupContainer = currentPopupRef.current || findPopupContainer();
            const position = pos || getDropdownPosition(popupContainer);

            setTimeout(() => {
                if (applyPositionClass(position, popupContainer)) return;

                const observer = new MutationObserver(() => {
                    const freshPopup = currentPopupRef.current || findPopupContainer();
                    if (applyPositionClass(position, freshPopup)) observer.disconnect();
                });
                observer.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => observer.disconnect(), 2000);
            }, 50);
        },
        [applyPositionClass, findPopupContainer, getDropdownPosition],
    );

    const checkDropdownPosition = useCallback(() => {
        const position = getDropdownPosition();
        setDropdownPosition(position);
        return position;
    }, [getDropdownPosition]);

    const keepPopupFocused = useCallback(() => {
        requestAnimationFrame(() => {
            fieldRef.current?.querySelector(RES_MS_DOM.inputInner)?.focus({ preventScroll: true });
        });
    }, []);

    const handleMultiSelectOpen = useCallback(() => {
        if (usesManagedPopup) {
            setIsPopupOpen(true);
            if (isCheckboxVariant) {
                saveFooterClickedRef.current = false;
                popupInteractRef.current = false;
                setTempSelection(selectedValues);
            }
        }
        resetListFilter();
        requestAnimationFrame(() => {
            normalizePopupPosition();
            applyPopupLayerStyles();
        });
        setTimeout(() => {
            normalizePopupPosition();
            applyPopupLayerStyles();
        }, 0);

        setTimeout(() => {
            currentPopupRef.current = findPopupContainer();
            const position = getDropdownPosition(currentPopupRef.current);
            setDropdownPosition(position);
            addPositionClassToAnimationContainer(position);

            if (resolvedPopupClass && currentPopupRef.current) {
                resolvedPopupClass
                    .split(/\s+/)
                    .filter(Boolean)
                    .forEach((cls) => currentPopupRef.current.classList.add(cls));
            }
        }, 0);

        if (!isVirtialization) return;
        setVirtualListTotal(displayData.length);
        setDropdownItems({
            skip: 0,
            options: displayData.slice(0, pageSize),
        });
    }, [
        addPositionClassToAnimationContainer,
        applyPopupLayerStyles,
        displayData,
        findPopupContainer,
        getDropdownPosition,
        isVirtialization,
        normalizePopupPosition,
        pageSize,
        resolvedPopupClass,
        resetListFilter,
        usesManagedPopup,
        isCheckboxVariant,
        selectedValues,
    ]);

    const handleMultiSelectClose = useCallback(() => {
        if (isCheckboxVariant) {
            if (saveFooterClickedRef.current) {
                saveFooterClickedRef.current = false;
                setIsPopupOpen(false);
                currentPopupRef.current = null;
                resetListFilter();
                return;
            }
            if (popupInteractRef.current) {
                popupInteractRef.current = false;
                setIsPopupOpen(true);
                keepPopupFocused();
                return;
            }
            setTempSelection(selectedValues);
            setIsPopupOpen(false);
            currentPopupRef.current = null;
            resetListFilter();
            return;
        }
        currentPopupRef.current = null;
        resetListFilter();
    }, [isCheckboxVariant, keepPopupFocused, resetListFilter, selectedValues]);

    useEffect(() => {
        const handleResize = () => checkDropdownPosition();
        window.addEventListener('resize', handleResize);
        checkDropdownPosition();
        return () => window.removeEventListener('resize', handleResize);
    }, [checkDropdownPosition]);

    useEffect(() => {
        const handleScrollPosition = () => checkDropdownPosition();
        window.addEventListener('scroll', handleScrollPosition, true);
        return () => window.removeEventListener('scroll', handleScrollPosition, true);
    }, [checkDropdownPosition]);

    useEffect(() => {
        if (dropdownPosition) {
            addPositionClassToAnimationContainer(dropdownPosition);
        }
    }, [dropdownPosition, addPositionClassToAnimationContainer]);

    const virtualization = isVirtialization
        ? {
              virtual: {
                  total: virtualListTotal,
                  pageSize,
                  skip: dropdownItems.skip,
              },
              onPageChange,
          }
        : {};

    const stripDisabledFromSelection = useCallback(
        (values) => {
            if (!itemDisabled || !Array.isArray(values)) return values;
            return values.filter((item) => !isItemDisabled(item));
        },
        [itemDisabled, isItemDisabled],
    );

    const customRender = (li, itemProps) => {
        const item = resolveListDataItem(itemProps.dataItem);
        const title = getListItemLabel(li, itemProps, item);
        const props = {
            ...li.props,
            title: title || undefined,
        };
        if (isItemDisabled(item)) {
            props.className = `${props.className || ''} click-off`.trim();
        }
        return cloneElement(li, props, <span>{title || li.props.children}</span>);
    };

    const tagRender = (tagData, li) => {
        const firstTag = tagData?.data?.[0];
        const resolvedTag = resolveListDataItem(firstTag);
        const tagCount = _isObject(firstTag)
            ? firstTag.count ?? (_isObject(resolvedTag) ? resolvedTag.count : undefined)
            : undefined;
        const tagLabel =
            getItemDisplay(firstTag) ||
            (typeof tagData?.text === 'string' ? tagData.text.trim() : '') ||
            firstTag?.text ||
            '';

        const normalizedTagLabel = normalizeDisplayText(tagLabel);
        const hasTagCount = tagCount != null && tagCount !== '';
        const shouldShowCountTitle = showChipTitle || isTagRender;
        const chipTitle =
            shouldShowCountTitle && hasTagCount
                ? formatChipCountHoverTitle(normalizedTagLabel, tagCount)
                : undefined;

        return cloneElement(li, {
            ...li.props,
            className: hasTagCount ? MS_CLASS.tagCount : MS_CLASS.tagNoCount,
            children: [
                <span
                    key="custom-tag"
                    className={MS_CLASS.customTag}
                    data-count={hasTagCount ? String(tagCount) : undefined}
                    data-label={normalizedTagLabel || undefined}
                    title={chipTitle}
                >
                    {normalizedTagLabel}
                </span>,
                ...Children.toArray(li.props.children),
            ],
        });
    };

    const renderNoData = () => <ResNoDataAvailable />;

    const applyTruncationTitle = useCallback((el, { setCursor = false } = {}) => {
        const fullText = (el.textContent || '').trim();
        const isTruncated = fullText && el.scrollWidth > el.clientWidth + 1;
        const nextTitle = isTruncated ? fullText : null;
        const currentTitle = el.getAttribute('title');

        if (nextTitle) {
            if (currentTitle !== nextTitle) el.setAttribute('title', nextTitle);
            if (setCursor && el.style.cursor !== 'default') el.style.cursor = 'default';
        } else {
            if (currentTitle != null) el.removeAttribute('title');
            if (setCursor && el.style.cursor) el.style.cursor = '';
        }
    }, []);

    const resolveChipHoverTitle = useCallback((el, { label, count, shouldShowCount = false } = {}) => {
        const trimmedLabel = (label || '').trim();
        const hasCount = shouldShowCount && count != null && count !== '';

        if (hasCount) {
            return formatChipCountHoverTitle(trimmedLabel, count) || null;
        }

        const isTruncated =
            Boolean(trimmedLabel && el) && el.scrollWidth > el.clientWidth + 1;
        return isTruncated ? trimmedLabel : null;
    }, []);

    const applyChipHoverTitle = useCallback(
        (el, options) => {
            const nextTitle = resolveChipHoverTitle(el, options);
            const currentTitle = el.getAttribute('title');

            if (nextTitle) {
                if (currentTitle !== nextTitle) el.setAttribute('title', nextTitle);
                if (el.style.cursor !== 'default') el.style.cursor = 'default';
            } else {
                if (currentTitle != null) el.removeAttribute('title');
                if (el.style.cursor) el.style.cursor = '';
            }
        },
        [resolveChipHoverTitle],
    );

    const resolveChipLabelText = useCallback((chip, customTag) => {
        const fromDataLabel = customTag?.getAttribute('data-label')?.trim();
        if (fromDataLabel) return fromDataLabel;

        const fromCustomTag = (customTag?.textContent || '').trim();
        if (fromCustomTag) return fromCustomTag;

        const chipLabelEl = chip?.querySelector(RES_MS_DOM.chipLabel);
        return (chipLabelEl?.textContent || '').trim();
    }, []);

    const getChipTitleTargets = useCallback((chip, customTag) => {
        const targets = new Set([chip]);
        if (customTag) targets.add(customTag);
        chip?.querySelectorAll(`${RES_MS_DOM.chipLabel}, ${RES_MS_DOM.chipContent}`).forEach((el) => {
            targets.add(el);
        });
        return [...targets];
    }, []);

    useEffect(() => {
        const wrapperElement = wrapperRef.current;
        if (!wrapperElement) return undefined;

        let rafId = 0;
        const addTitleToChips = () => {
            wrapperElement.querySelectorAll(RES_MS_DOM.chip).forEach((chip) => {
                const customTag = chip.querySelector(`.${MS_CLASS.customTag}`);
                if (customTag) {
                    const shouldShowCountTitle = showChipTitle || isTagRender;
                    const chipLabel = resolveChipLabelText(chip, customTag);
                    if (chipLabel && customTag.getAttribute('data-label') !== chipLabel) {
                        customTag.setAttribute('data-label', chipLabel);
                    }
                    const titleOptions = {
                        label: chipLabel,
                        count: customTag.getAttribute('data-count'),
                        shouldShowCount: shouldShowCountTitle,
                    };
                    getChipTitleTargets(chip, customTag).forEach((el) =>
                        applyChipHoverTitle(el, titleOptions),
                    );
                    return;
                }
                const chipLabel = chip.querySelector(RES_MS_DOM.chipLabel);
                if (chipLabel) applyTruncationTitle(chipLabel, { setCursor: true });
                const chipContent = chip.querySelector(RES_MS_DOM.chipContent);
                if (chipContent) applyTruncationTitle(chipContent);
            });
        };

        const scheduleChipTitles = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(addTitleToChips);
        };

        const observer = new MutationObserver(scheduleChipTitles);
        observer.observe(wrapperElement, { childList: true, subtree: true });
        scheduleChipTitles();

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [
        applyChipHoverTitle,
        applyTruncationTitle,
        getChipTitleTargets,
        resolveChipLabelText,
        showChipTitle,
        isTagRender,
    ]);

    useEffect(() => {
        if (!showTitleOnTruncate) return;

        const addTitleToInput = () => {
            const wrapperElement = wrapperRef.current;
            if (!wrapperElement) return;

            const inputElement = wrapperElement.querySelector(RES_MS_DOM.inputInner);

            if (inputElement) {
                void inputElement.offsetHeight;
                const fullValue = (inputElement.value || '').trim();
                const isTruncated = inputElement.scrollWidth > inputElement.clientWidth + 1;

                if (isTruncated && fullValue) {
                    inputElement.setAttribute('title', fullValue);
                    inputElement.style.cursor = 'default';
                } else {
                    inputElement.removeAttribute('title');
                    inputElement.style.cursor = '';
                }
            }
        };

        const handleInputChange = () => {
            requestAnimationFrame(addTitleToInput);
        };

        const inputElement = wrapperRef.current?.querySelector(RES_MS_DOM.inputInner);
        if (inputElement) {
            inputElement.addEventListener('input', handleInputChange);
            inputElement.addEventListener('change', handleInputChange);
            inputElement.addEventListener('keyup', handleInputChange);
            inputElement.addEventListener('focus', handleInputChange);
        }

        requestAnimationFrame(() => {
            addTitleToInput();
            setTimeout(() => addTitleToInput(), 100);
        });

        return () => {
            if (inputElement) {
                inputElement.removeEventListener('input', handleInputChange);
                inputElement.removeEventListener('change', handleInputChange);
                inputElement.removeEventListener('keyup', handleInputChange);
                inputElement.removeEventListener('focus', handleInputChange);
            }
        };
    }, [showTitleOnTruncate, dataArray, displayData]);

    useEffect(() => {
        const updateSearchIconAndPlaceholder = () => {
            const searchIcons = document.querySelectorAll(
                '.k-input-icon.k-svg-icon.k-svg-i-search',
            );

            searchIcons.forEach((icon) => {
                if (!icon.classList.contains('icon-rs-circle-zoom-fill-edge-medium')) {
                    icon.className =
                        'k-input-icon position-absolute top2 right0 icon-md color-secondary-grey icon-rs-circle-zoom-fill-edge-medium';
                }
            });

            const filterInputs = document.querySelectorAll('.k-list-filter .k-input-inner');

            filterInputs.forEach((input) => {
                if (input.tagName === 'INPUT') {
                    const parentInput = input.closest('.k-input');
                    const hasSearchIcon =
                        parentInput &&
                        parentInput.querySelector('.k-input-icon, .k-svg-i-search');

                    if (hasSearchIcon) {
                        input.placeholder = 'Search..';
                    }

                    if (!input.classList.contains('px0')) {
                        input.classList.add('px0');
                    }
                }
            });
        };

        updateSearchIconAndPlaceholder();

        const observer = new MutationObserver(updateSearchIconAndPlaceholder);

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current, {
                childList: true,
                subtree: true,
            });
        }

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <Controller
            rules={rules}
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field: { onChange, onBlur, ...restfield }, fieldState: { error } }) => {
                const _isEmpty = get(error, 'message', '')?.length > 0;
                const errMsg = get(error, 'message', '');

                const normalizedSelected = Array.isArray(restfield?.value)
                    ? restfield.value
                    : restfield?.value
                      ? [restfield.value]
                      : [];

                const commitSelection = (nextValues) => {
                    if (isCustomOnchange && nextValues.length > limitLength) {
                        setError(name, {
                            type: 'custom',
                            message: customErrorMessage,
                        });
                        return false;
                    }
                    clearErrors(name);
                    handleChange({ value: nextValues });
                    onChange(nextValues);
                    requestAnimationFrame(() => {
                        normalizePopupPosition();
                        applyPopupLayerStyles();
                        decorateChipChrome();
                    });
                    return true;
                };

                const applyTempSelection = (nextValues) => {
                    setTempSelection(nextValues);
                    markPopupInteraction();
                    if (!showCheckboxFooter) {
                        commitSelection(nextValues);
                    }
                    keepPopupFocused();
                };

                const handleCheckboxToggle = (item, checked) => {
                    if (isItemDisabled(item)) return;
                    const key = getItemKey(item);
                    const base = showCheckboxFooter ? tempSelection : normalizedSelected;
                    const next = checked
                        ? base.some((s) => getItemKey(s) === key)
                            ? base
                            : [...base, item]
                        : base.filter((s) => getItemKey(s) !== key);
                    applyTempSelection(stripDisabledFromSelection(next));
                };

                const handleSelectAllToggle = (checked) => {
                    applyTempSelection(checked ? selectableItems : []);
                };

                const handleCheckboxSave = (e) => {
                    preventPopupClose(e);
                    if (!commitSelection(tempSelection)) return;
                    saveFooterClickedRef.current = true;
                    onCheckboxSave(tempSelection);
                    setIsPopupOpen(false);
                    fieldRef.current?.querySelector(RES_MS_DOM.inputInner)?.blur();
                };

                const handleCheckboxCancel = (e) => {
                    preventPopupClose(e);
                    setTempSelection(normalizedSelected);
                    onCheckboxCancel(normalizedSelected);
                    saveFooterClickedRef.current = true;
                    setIsPopupOpen(false);
                    fieldRef.current?.querySelector(RES_MS_DOM.inputInner)?.blur();
                };

                const checkboxItemRender = (li, itemProps) => {
                    const item = resolveListDataItem(itemProps.dataItem);
                    return renderCheckboxListItem({
                        li,
                        itemProps,
                        isActive: isTempItemSelected(item),
                        disabled: disabled || showLoader || isItemDisabled(item),
                        checkboxControl,
                        fieldName: getCheckboxFieldName(item),
                        displayValue: getListItemLabel(li, itemProps, item),
                        itemKey: getItemKey(item),
                        onToggle: handleCheckboxToggle,
                        onInteract: markPopupInteraction,
                    });
                };

                const checkboxHeader =
                    isCheckboxVariant && !hideSelectAllRow ? (
                        <div
                            className={`${MS_CLASS.checkboxItem} ${MS_CLASS.selectAll} ${
                                allTempItemsSelected ? 'active' : ''
                            }`}
                            onMouseDown={(e) => {
                                markPopupInteraction();
                                preventPopupClose(e);
                            }}
                            onClick={(e) => {
                                preventPopupClose(e);
                                if (disabled || showLoader) return;
                                handleSelectAllToggle(!allTempItemsSelected);
                            }}
                        >
                            <div
                                className={MS_CLASS.checkboxItemInner}
                                onMouseDown={(e) => {
                                    markPopupInteraction();
                                    preventPopupClose(e);
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <RSCheckbox
                                    control={checkboxControl}
                                    name={selectAllFieldName}
                                    labelName={selectAllLabel}
                                    disabledchk={disabled || showLoader}
                                    handleChange={(e) => handleSelectAllToggle(e.target.checked)}
                                    containerClass="mb-0"
                                    isError={false}
                                />
                            </div>
                        </div>
                    ) : null;

                const checkboxFooterNode =
                    isCheckboxVariant && showCheckboxFooter ? (
                        <div
                            className={MS_CLASS.checkboxFooter}
                            onMouseDown={markPopupInteraction}
                        >
                            <RSSecondaryButton
                                type="button"
                                className="p0"
                                onMouseDown={preventPopupClose}
                                onClick={handleCheckboxCancel}
                            >
                                {checkboxCancelLabel}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                type="button"
                                onMouseDown={preventPopupClose}
                                onClick={handleCheckboxSave}
                            >
                                {checkboxSaveLabel}
                            </RSPrimaryButton>
                        </div>
                    ) : null;

                const wrapItemRenderWithDisabled = (renderFn) => (li, itemProps) => {
                    const rendered = renderFn(li, itemProps);
                    if (!itemDisabled || !isItemDisabled(resolveListDataItem(itemProps.dataItem))) {
                        return rendered;
                    }
                    return cloneElement(rendered, {
                        ...rendered.props,
                        className: `${rendered.props.className || ''} click-off`.trim(),
                    });
                };

                const resolvedItemRender = isCheckboxVariant
                    ? checkboxItemRender
                    : isCustomRender
                      ? wrapItemRenderWithDisabled(itemRender)
                      : customRender;

                const resolvedCheckboxFooter =
                    isCheckboxVariant && showCheckboxFooter
                        ? checkboxFooterNode
                        : typeof footer === 'function'
                          ? footer()
                          : footer;
                const multiSelectValue = isCheckboxVariant
                    ? showCheckboxFooter
                        ? normalizedSelected
                        : tempSelection
                    : normalizedSelected;
                const popupAppendTo = resolveKendoPopupAppendTo(
                    fieldRef.current || wrapperRef.current,
                    `.${MS_CLASS.field}`,
                );

                const isFiltering = Boolean(filterText.trim()) || hasFilterInput;

                return (
                    <div
                        className={`${MS_CLASS.wrapper} ${className} ${
                            isCheckboxVariant ? MS_CLASS.checkboxVariant : ''
                        } ${hideSelectedChips ? MS_CLASS.hideSelectedChips : ''} ${
                            showLoader ? `${MS_CLASS.wrapper}--loading` : ''
                        } ${isFiltering ? `${MS_CLASS.wrapper}--filtering` : ''} ${
                            _isEmpty ? 'errorContainer' : ''
                        }`}
                        ref={wrapperRef}
                    >
                        <div className={MS_CLASS.field} ref={fieldRef}>
                            <div className={MS_CLASS.arrow} />
                            {showLoader && (
                                <div className="res-inputIcon-wrapper">
                                    <div className="segment-loader" />
                                </div>
                            )}
                            <MultiSelect
                            className={`${MS_CLASS.base} ${required ? MS_CLASS.required : ''} ${
                                disabled ? `${MS_CLASS.disabledNoData} k-disabled` : ''
                            } ${showLoader ? MS_CLASS.loading : ''}`}
                            allowCustom={canAllowCustom}
                            maxLength={15}
                            label={_isEmpty ? errMsg : label}
                            data={isVirtialization ? dropdownItems.options : displayData}
                            filter={filterText}
                            filterable={isFilterable}
                            focusedItemIndex={
                                isCheckboxVariant
                                    ? -1
                                    : isFilterable
                                      ? getFocusedItemIndex
                                      : undefined
                            }
                            itemRender={resolvedItemRender}
                            itemDisabled={itemDisabled}
                            {...(textField ? { textField } : {})}
                            {...(dataItemKey ? { dataItemKey } : {})}
                            onFilterChange={filterChange}
                            listNoDataRender={renderNoData}
                            autoClose={usesManagedPopup ? false : autoCloseProp}
                            opened={usesManagedPopup ? isPopupOpen : openedProp}
                            onChange={(e) => {
                                const nextValues = stripDisabledFromSelection(
                                    e?.value ?? e?.target?.value ?? [],
                                );
                                if (isCheckboxVariant) {
                                    if (showCheckboxFooter) {
                                        const isRemoving =
                                            nextValues.length < normalizedSelected.length;
                                        if (isRemoving) {
                                            commitSelection(nextValues);
                                            setTempSelection(nextValues);
                                        }
                                        return;
                                    }
                                    setTempSelection(nextValues);
                                    commitSelection(nextValues);
                                    markPopupInteraction();
                                    setIsPopupOpen(true);
                                    keepPopupFocused();
                                    return;
                                }
                                if (isCustomOnchange) {
                                    if (nextValues?.length === limitLength + 1) {
                                        setError(name, {
                                            type: 'custom',
                                            message: customErrorMessage,
                                        });
                                        return;
                                    }
                                    clearErrors(name);
                                    handleChange(e);
                                    onChange(nextValues);
                                } else {
                                    handleChange(e);
                                    onChange(nextValues);
                                }
                                requestAnimationFrame(() => {
                                    normalizePopupPosition();
                                    applyPopupLayerStyles();
                                    decorateChipChrome();
                                });
                            }}
                            onBlur={(e) => {
                                handleOnBlur(e);
                                onBlur(e);
                            }}
                            onClose={handleMultiSelectClose}
                            popupSettings={{
                                animate:
                                    consumerPopupSettings?.animate ??
                                    !shouldDisableKendoPopupAnimate(
                                        popupAppendTo,
                                        fieldRef.current || wrapperRef.current,
                                    ),
                                ...consumerPopupSettings,
                                popupClass: [
                                    MS_CLASS.listPopup,
                                    isCheckboxVariant && MS_CLASS.checkboxVariant,
                                    resolvedPopupClass,
                                ]
                                    .filter(Boolean)
                                    .join(' '),
                                ...(popupAppendTo && { appendTo: popupAppendTo }),
                            }}
                            onOpen={handleMultiSelectOpen}
                            disabled={disabled || showLoader}
                            {...(isVirtialization && virtualization)}
                            {...(checkboxHeader && { header: checkboxHeader })}
                            {...(resolvedCheckboxFooter && { footer: resolvedCheckboxFooter })}
                            {...multiSelectRest}
                            {...restfield}
                            value={multiSelectValue}
                            tagRender={
                                hideSelectedChips
                                    ? () => null
                                    : isTagRender
                                      ? tagRender
                                      : undefined
                            }
                            />
                        </div>
                        {(smallText || rightTooltip) && (
                            <div className={`${MS_CLASS.meta} d-flex align-items-center justify-content-between`}>
                                {smallText ? (
                                    <small className="fs-15 mt5">{smallText}</small>
                                ) : (
                                    <span />
                                )}
                                {rightTooltip &&
                                    (isValidElement(rightTooltip) ? (
                                        rightTooltip
                                    ) : (
                                        <ResTooltip text={String(rightTooltip)} position="top">
                                            <i
                                                className={`${rightTooltipIcon} icon-xs color-primary-blue`}
                                            />
                                        </ResTooltip>
                                    ))}
                            </div>
                        )}
                    </div>
                );
            }}
        />
    );
};

ResMultiSelect.propTypes = {
    className: PropTypes.string,
    popupClass: PropTypes.string,
    clearErrors: PropTypes.func,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    rules: PropTypes.object,
    setError: PropTypes.func,
    setValue: PropTypes.func,
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.array,
    required: PropTypes.bool,
    allowCustom: PropTypes.bool,
    acceptNewValue: PropTypes.bool,
    handleChange: PropTypes.func,
    handleOnBlur: PropTypes.func,
    handleFilterChange: PropTypes.func,
    filterable: PropTypes.bool,
    itemDisabled: PropTypes.string,
    textField: PropTypes.string,
    dataItemKey: PropTypes.string,
    isCustomRender: PropTypes.bool,
    itemRender: PropTypes.func,
    showTitleOnTruncate: PropTypes.bool,
    showChipTitle: PropTypes.bool,
    hideSelectedChips: PropTypes.bool,
    isTagRender: PropTypes.bool,
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    loading: PropTypes.bool,
    isLoading: PropTypes.bool,
    smallText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightTooltipIcon: PropTypes.string,
    variant: PropTypes.oneOf([RES_MULTISELECT_VARIANT.DEFAULT, RES_MULTISELECT_VARIANT.CHECKBOX]),
    selectAllLabel: PropTypes.string,
    hideSelectAllRow: PropTypes.bool,
    showCheckboxFooter: PropTypes.bool,
    checkboxSaveLabel: PropTypes.string,
    checkboxCancelLabel: PropTypes.string,
    onCheckboxSave: PropTypes.func,
    onCheckboxCancel: PropTypes.func,
};

export default memo(ResMultiSelect);
