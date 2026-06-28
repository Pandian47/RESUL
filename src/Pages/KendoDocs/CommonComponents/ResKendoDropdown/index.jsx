import { cloneElement, isValidElement, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './resKendoDropdown.scss';
import _get from 'lodash/get';
import _orderBy from 'lodash/orderBy';
import PropTypes from 'prop-types';

import { DropDownList } from '@progress/kendo-react-dropdowns';
import { get } from 'lodash';
import { Controller } from 'react-hook-form';

import { normalizeDisplayText } from 'Utils/modules/stringUtils';
import { _isObject } from 'Utils/modules/misc';
import { flushSync } from 'react-dom';
import ResNoDataAvailable from '../ResNoDataAvailable';
import ResTooltip from '../ResTooltip';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import {
    RES_KENDO_DD_CLASS as DD_CLASS,
    addKendoPopupClassTokens,
    applyKendoPortaledPopupShellStyles,
    resolveKendoPopupAppendTo,
    shouldDisableKendoPopupAnimate,
} from '../../kendoDocsVariables';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

const ResKendoDropdown = ({
    control,
    rules,
    name,
    defaultValue = '',
    data = [],
    textField,
    dataItemKey,
    value,
    onChange,
    className = '',
    popupClass = '',
    required,
    isLoading = false,
    handleChange = () => { },
    label,
    isError = true,
    itemRender = () => { },
    isCustomRender = false,
    rightAlign = false,
    noBottomBorder = false,
    filterName,
    placeholder = '',
    order,
    handleOnBlur = () => { },
    isTagRender = false,
    handleFilterChange = () => { },
    isShowBordertip = false,
    header,
    footer,
    subLabel,
    valueRender,
    itemDisabled,
    smallText,
    rightTooltip,
    rightTooltipIcon = circle_question_mark_mini,
    errorClassName = '',
    errorMessageClassName = '',
    useErrorContainer = true,
    ...rest
}) => {
    const { popupSettings: consumerPopupSettings, ...dropDownRest } = rest;
    const resolvedPopupClass = useMemo(
        () => [popupClass, consumerPopupSettings?.popupClass].filter(Boolean).join(' '),
        [popupClass, consumerPopupSettings?.popupClass],
    );
    const resolvedHeader = typeof header === 'function' ? header() : header;
    const resolvedFooter = typeof footer === 'function' ? footer() : footer;
    const subLabelResolved =
        subLabel != null
            ? subLabel
            : (item) => (item != null ? String(_get(item, 'subLabel', '') ?? '') : '');
    const normalizeItem = useCallback(
        (item) => {
            if (typeof item === 'string') return normalizeDisplayText(item);
            if (!_isObject(item)) return item;

            const nextItem = { ...item };
            if (textField && typeof nextItem[textField] === 'string') {
                nextItem[textField] = normalizeDisplayText(nextItem[textField]);
            }
            if (typeof nextItem.subLabel === 'string') {
                nextItem.subLabel = normalizeDisplayText(nextItem.subLabel);
            }
            return nextItem;
        },
        [textField],
    );
    const normalizedData = useMemo(
        () => (Array.isArray(data) ? data.map(normalizeItem) : []),
        [data, normalizeItem],
    );
    const getComparableItem = useCallback(
        (item) => {
            if (!_isObject(item)) return item;

            if (dataItemKey && item?.[dataItemKey] !== undefined) return item[dataItemKey];
            if (item?.id !== undefined) return item.id;
            if (item?.value !== undefined) return item.value;
            if (textField && item?.[textField] !== undefined) return item[textField];

            return JSON.stringify(item);
        },
        [dataItemKey, textField],
    );
    const isValidDropdownValue = useCallback(
        (item) => {
            if (item == null || item === '') return false;
            if (!_isObject(item)) return true;
            if (dataItemKey && _get(item, dataItemKey) === undefined) return false;
            return true;
        },
        [dataItemKey],
    );
    const resolveDropdownValue = useCallback(
        (item) => (isValidDropdownValue(item) ? item : null),
        [isValidDropdownValue],
    );
    const useSubLabel =
        subLabel != null ||
        normalizedData.some((item) => String(_get(item, 'subLabel', '')).trim() !== '');

    const [filterText, setFilterText] = useState('');
    const total = normalizedData?.length;
    const pageSize = 100;
    const isVirtialization = total > 5000;
    const containerWrapper = useRef();
    const orderedData = useMemo(() => {
        if (filterName) {
            return _orderBy(normalizedData, [filterName], [order ? order : 'asc']);
        }
        return normalizedData;
    }, [normalizedData, filterName, order]);

    const displayData = useMemo(() => {
        const search = filterText.trim();
        if (!search) {
            return orderedData;
        }
        const needle = search.toLowerCase();
        return orderedData.filter((item) => {
            const name = String(
                _isObject(item) ? _get(item, textField, '') : item,
            ).toLowerCase();
            if (name.includes(needle)) {
                return true;
            }
            if (useSubLabel) {
                const sub = String(_get(item, 'subLabel', '')).toLowerCase();
                return sub.includes(needle);
            }
            return false;
        });
    }, [orderedData, filterText, textField, useSubLabel]);

    const [state, setState] = useState({
        skip: 0,
        options: displayData.slice(0, pageSize),
    });
    const [dropdownPosition, setDropdownPosition] = useState('below'); // 'above' or 'below'
    const [popupAppendHost, setPopupAppendHost] = useState(null);
    const currentPopupRef = useRef(null);

    useEffect(() => {
        if (!containerWrapper.current) return;
        setPopupAppendHost(
            resolveKendoPopupAppendTo(
                containerWrapper.current,
                `.${DD_CLASS.wrapper}`,
            ),
        );
    }, []);

    const findPopupContainer = () => {
        try {
            const ownsEl = containerWrapper.current?.querySelector('[aria-owns]');
            const ownsId = ownsEl?.getAttribute('aria-owns');
            if (!ownsId) return null;
            const listContainer = document.getElementById(ownsId);
            const popupContainer = listContainer?.closest('.k-animation-container');
            return popupContainer || null;
        } catch (e) {
            return null;
        }
    };

    // Position calculation and application functions
    const getDropdownPosition = (ref, popupContainerParam = null) => {
        // Prefer measuring the most recent Kendo animation container, if available
        try {
            const animationContainer = popupContainerParam || currentPopupRef.current || findPopupContainer();
            const triggerEl = ref?.current || null;

            if (animationContainer && triggerEl) {
                const popupRect = animationContainer.getBoundingClientRect();
                const triggerRect = triggerEl.getBoundingClientRect();

                // Robust orientation: compare vertical centers (works even with overlap/arrow)
                const popupCenterY = (popupRect.top + popupRect.bottom) / 2;
                const triggerCenterY = (triggerRect.top + triggerRect.bottom) / 2;
                return popupCenterY < triggerCenterY ? 'above' : 'below';
            }
        } catch (e) {
            // ignore and use fallback below
        }

        if (!ref?.current) return 'below';

        // Fallback: decide based on available viewport space around the trigger
        const { top, bottom } = ref.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const estimatedDropdownHeight = 240; // reasonable default height
        const spaceBelow = viewportHeight - bottom;
        const spaceAbove = top;

        return spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow ? 'above' : 'below';
    };

    const normalizePopupPosition = useCallback(() => {
        const popupContainer = findPopupContainer();
        if (!popupContainer || !containerWrapper.current) return;
        if (popupContainer.parentElement === containerWrapper.current) {
            popupContainer.style.left = '0px';
        }
        applyKendoPortaledPopupShellStyles(popupContainer, containerWrapper.current);
    }, []);

    const applyPositionClass = (position, popupContainerParam = null) => {
        const animationContainer = popupContainerParam || currentPopupRef.current || findPopupContainer();
        if (!animationContainer) return false;

        addKendoPopupClassTokens(animationContainer, resolvedPopupClass);

        const posClass = position === 'above' ? 'showing-top' : 'showing-below';
        const elements = [
            animationContainer,
            ...animationContainer.querySelectorAll('.k-popup, .k-list-container, .k-list'),
        ];

        elements.forEach((el) => {
            el.classList.remove('showing-top', 'showing-below');
            el.classList.add(posClass);
        });

        if (isShowBordertip) {
            animationContainer.classList.add(DD_CLASS.bordertip);
            animationContainer
                .querySelectorAll('.k-popup, .k-list-container')
                .forEach((node) => node.classList.add(DD_CLASS.bordertip));
        }

        return true;
    };

    const checkDropdownPosition = () => {
        const position = getDropdownPosition(containerWrapper);
        setDropdownPosition(position);
        return position;
    };

    const syncPopupOnOpen = () => {
        const popupContainer = findPopupContainer();
        if (!popupContainer) return false;

        currentPopupRef.current = popupContainer;
        normalizePopupPosition();
        applyPortaledPopupStyles();

        const position = getDropdownPosition(containerWrapper, popupContainer);
        applyPositionClass(position, popupContainer);
        setDropdownPosition(position);
        return true;
    };

    useEffect(() => {
        if (isVirtialization) {
            setState((prev) => ({
                options: displayData.slice(0, pageSize),
                skip: prev.skip,
            }));
        }
    }, [displayData, isVirtialization, pageSize]);

    const resetListFilter = useCallback(() => {
        setFilterText('');
    }, []);

    const applyPopupClassesToContainer = useCallback(
        (animationContainer) => {
            if (!animationContainer) return;

            addKendoPopupClassTokens(animationContainer, resolvedPopupClass);
            animationContainer
                .querySelectorAll('.k-popup, .k-list-container')
                .forEach((node) => addKendoPopupClassTokens(node, resolvedPopupClass));
        },
        [resolvedPopupClass],
    );

    const applyPortaledPopupStyles = useCallback(() => {
        const animationContainer = findPopupContainer();
        if (!animationContainer) return;

        applyKendoPortaledPopupShellStyles(animationContainer, containerWrapper.current);

        animationContainer.classList.add(DD_CLASS.listPopup);
        animationContainer
            .querySelector('.k-popup, .k-list-container')
            ?.classList.add(DD_CLASS.listPopup);
        applyPopupClassesToContainer(animationContainer);
    }, [applyPopupClassesToContainer]);

    // Check dropdown position on mount and window resize
    useEffect(() => {
        const handleResize = () => {
            checkDropdownPosition();
        };

        window.addEventListener('resize', handleResize);
        checkDropdownPosition(); // Check on mount

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Handle scroll to update dropdown position
    useEffect(() => {
        const handleScrollPosition = () => {
            const position = checkDropdownPosition();
            setDropdownPosition(position);
        };

        window.addEventListener('scroll', handleScrollPosition, true);
        return () => window.removeEventListener('scroll', handleScrollPosition, true);
    }, []);

    // Re-apply position while popup is open (resize / scroll)
    useEffect(() => {
        if (!currentPopupRef.current || !dropdownPosition) return;
        applyPositionClass(dropdownPosition, currentPopupRef.current);
    }, [dropdownPosition]);

    const customRender = (li, itemProps) => {
        const title = _isObject(itemProps.dataItem) ? _get(itemProps.dataItem, textField) : itemProps.dataItem;
        const props = {
            ...li.props,
            title,
        };
        const isDisabled =
            !!itemDisabled &&
            (_isObject(itemProps.dataItem)
                ? _get(itemProps.dataItem, itemDisabled, false)
                : itemProps.dataItem?.[itemDisabled]);
        if (isDisabled) {
            props.className = `${props.className || ''} click-off`.trim();
        }
        const subLabelText =
            typeof subLabelResolved === 'function'
                ? subLabelResolved(itemProps?.dataItem)
                : subLabelResolved;
        const showSubLabel =
            subLabelText != null && String(subLabelText).trim() !== '';
        const itemChildren = showSubLabel ? (
            <span className={DD_CLASS.valueRows}>
                <span className={`${DD_CLASS.subLabel} fs11`} title={subLabelText}>{subLabelText}</span>
                <span className='list-item'>{li.props.children}</span>
            </span>
        ) : (
            <span className='list-item'>{li.props.children}</span>
        );
        return cloneElement(li, props, itemChildren);
    };

    // Function to get the selected value text for title attribute
    const getSelectedValueText = (selectedValue = '') => {
        if (selectedValue == null || selectedValue === '') return '';

        if (Array.isArray(selectedValue)) {
            if (!selectedValue.length) return '';
            const firstItem = selectedValue[0];
            if (_isObject(firstItem)) return String(_get(firstItem, textField, '') ?? '');
            return String(firstItem ?? '');
        }

        if (_isObject(selectedValue)) {
            const resolved = _get(selectedValue, textField, '');
            return resolved == null ? '' : String(resolved);
        }

        return String(selectedValue);
    };

    // Resolve the subLabel of the currently selected value so it can be
    // merged into the floating label (e.g. "Channel · Outbound calls").
    const getSelectedSubLabel = (selectedValue = '') => {
        if (!useSubLabel || !selectedValue) return '';
        const resolvedItem = _isObject(selectedValue)
            ? selectedValue
            : (normalizedData || []).find((item) => _get(item, dataItemKey) === selectedValue);
        const subLabelText =
            typeof subLabelResolved === 'function'
                ? subLabelResolved(resolvedItem || selectedValue)
                : subLabelResolved;
        return subLabelText != null && String(subLabelText).trim() !== ''
            ? String(subLabelText)
            : '';
    };

    // useEffect(() => {
    //     if (filterName) {
    //         const orderByData = _orderBy(data, [filterName], [order || 'asc']);
    //         setSortedData(orderByData);
    //     } else {
    //         data?.length && setSortedData(data);
    //     }
    // }, [data, filterName, order]);

    useEffect(() => {
        if (isVirtialization) {
            setState({
                options: displayData.slice(0, pageSize),
                skip: 0,
            });
        }
    }, [displayData, isVirtialization, pageSize]);

    const onPageChange = (event) => {
        const skip = event.page.skip;
        const take = Math.min(skip + pageSize, total);

        setState({
            options: displayData.slice(skip, take),
            skip,
        });
    };

    const virtualization = isVirtialization
        ? {
            virtual: {
                total,
                pageSize,
                skip: state.skip,
            },
            onPageChange,
        }
        : {};

    useEffect(() => {
        const handleScroll = (event) => {
            const animationContainer = currentPopupRef.current || findPopupContainer();
            const popup = animationContainer?.querySelector('.k-child-animation-container');
            const dropdownElement = containerWrapper.current;
            const target = event?.target;
            const isElementTarget = target instanceof Element;

            if (popup && dropdownElement) {
                const isWithinDropdown =
                    (isElementTarget && dropdownElement.contains(target)) ||
                    (isElementTarget && popup.contains(target)) ||
                    (isElementTarget &&
                        (target.closest('.k-child-animation-container') ||
                            target.closest('.k-popup') ||
                            target.closest('.k-list-container') ||
                            target.closest('.k-list') ||
                            target.closest('.k-list-content') ||
                            target.closest('.k-list-filter')));

                if (!isWithinDropdown) {
                    if (
                        document.activeElement &&
                        typeof document.activeElement.blur === 'function'
                    ) {
                        document.activeElement.blur();
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    useEffect(() => {
        const updateSearchIconAndPlaceholder = () => {
            const searchIcons = document.querySelectorAll(
                '.k-input-icon.k-svg-icon.k-svg-i-search',
            );

            searchIcons.forEach((icon) => {
                if (!icon.classList.contains('icon-rs-circle-zoom-fill-edge-medium')) {
                    icon.className =
                        'k-input-icon position-absolute  right0 icon-md color-secondary-grey icon-rs-circle-zoom-fill-edge-medium';
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

        const observer = new MutationObserver(() => {
            updateSearchIconAndPlaceholder();
        });

        if (containerWrapper.current) {
            observer.observe(containerWrapper.current, {
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

    const filterChange = (event) => {
        const nextFilter = String(event?.filter?.value ?? '');
        flushSync(() => {
            setFilterText(nextFilter);
        });
        handleFilterChange(event);
    };

    const getFocusedItemIndex = useCallback(
        (items, inputText) => {
            const search = String(inputText ?? filterText ?? '').trim();
            if (!search) return -1;
            const needle = search.toLowerCase();
            return items.findIndex((item) => {
                const name = String(
                    _isObject(item) ? _get(item, textField, '') : item,
                ).toLowerCase();
                if (name.includes(needle)) return true;
                if (useSubLabel) {
                    return String(_get(item, 'subLabel', '')).toLowerCase().includes(needle);
                }
                return false;
            });
        },
        [filterText, textField, useSubLabel],
    );

    const renderNoData = () => <ResNoDataAvailable />;

    const resolveErrorProp = useCallback((prop, message, hasError) => {
        if (!hasError || !prop) return '';
        if (typeof prop === 'function') return prop(message) || '';
        return prop;
    }, []);

    return (
        <Controller
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            name={name}
            label={placeholder}
            render={({ field: { onChange, onBlur, value: fieldValue, ...restField }, fieldState: { error } }) => {
                const _isEmpty = get(error, 'message', '')?.length > 0;
                const errMsg = get(error, 'message', '');
                const resolvedErrorClassName = resolveErrorProp(errorClassName, errMsg, _isEmpty);
                const resolvedErrorMessageClassName = resolveErrorProp(
                    errorMessageClassName,
                    errMsg,
                    _isEmpty && isError,
                );
                const shouldUseErrorContainer =
                    _isEmpty &&
                    (typeof useErrorContainer === 'function'
                        ? useErrorContainer(errMsg)
                        : useErrorContainer);
                const resolvedValue = resolveDropdownValue(fieldValue);
                const selectedValueText = getSelectedValueText(resolvedValue);
                const selectedSubLabel = getSelectedSubLabel(resolvedValue);
                const popupAppendTo =
                    popupAppendHost ||
                    resolveKendoPopupAppendTo(
                        containerWrapper.current,
                        `.${DD_CLASS.wrapper}`,
                    );
                const isAppendedToWrapper =
                    popupAppendTo && popupAppendTo === containerWrapper.current;
                const baseLabel = _isEmpty && isError ? errMsg : label;
                const floatingLabelTitle = [baseLabel, selectedSubLabel]
                    .filter((text) => text != null && String(text).trim() !== '')
                    .join(' ')
                    .trim();
                // Render the selected value's subLabel as a nested span inside the
                // floating label so it can be styled separately from the main label.
                const floatingLabelContent =
                    !(_isEmpty && isError) && selectedSubLabel && baseLabel ? (
                        <>
                            {baseLabel}{' '}
                            <span className={DD_CLASS.subFloatingLabel}>{selectedSubLabel}</span>
                        </>
                    ) : (
                        baseLabel
                    );
                const floatingLabel = floatingLabelTitle ? (
                    <span
                        className={[DD_CLASS.floatingLabelText, resolvedErrorMessageClassName]
                            .filter(Boolean)
                            .join(' ')}
                        title={floatingLabelTitle}
                    >
                        {floatingLabelContent}
                    </span>
                ) : (
                    floatingLabelContent
                );

                    const selectedItem = resolvedValue != null
                    ? (
                        _isObject(resolvedValue)
                            ? resolvedValue
                            : (normalizedData || []).find((item) => {
                                const keyVal = dataItemKey ? _get(item, dataItemKey) : item;
                                return keyVal === resolvedValue;
                            }) || null
                    )
                    : null;

                    const rawData = isVirtialization ? state.options : displayData;
                    let finalData = rawData;
                    if (selectedItem) {
                        const isAlreadyPresent = rawData.some((item) => {
                            if (_isObject(item) && _isObject(selectedItem)) {
                                if (dataItemKey) {
                                    return _get(item, dataItemKey) === _get(selectedItem, dataItemKey);
                                }
                                return JSON.stringify(item) === JSON.stringify(selectedItem);
                            }
                            return item === selectedItem;
                        });
                        if (!isAlreadyPresent) {
                            finalData = [selectedItem, ...rawData];
                        }
                    }

                return (
                    <div
                        className={`${DD_CLASS.wrapper} ${className} ${shouldUseErrorContainer ? 'errorContainer' : ''} ${resolvedErrorClassName} ${rightAlign ? DD_CLASS.rightAlign : ''
                            } ${noBottomBorder ? DD_CLASS.noBottomBorder : ''} ${isAppendedToWrapper ? DD_CLASS.staticPopup : ''} ${isShowBordertip ? DD_CLASS.bordertip : ''} position-relative`}
                        ref={containerWrapper}
                    >
                        <div className="position-relative">
                        {isLoading && (
                            <div className="res-inputIcon-wrapper">
                                <div className="segment-loader"></div>
                            </div>
                        )}
                        {/* {_isEmpty && <div className="validation-message">{get(error, 'message', '')}</div>} */}
                        <DropDownList
                            disabled={isLoading}
                            className={`${DD_CLASS.base} ${required ? DD_CLASS.required : ''}`}
                            data={finalData}
                            filter={filterText}
                            label={floatingLabel}
                            textField={textField}
                            dataItemKey={dataItemKey}
                            onChange={(e) => {
                                const selectedValue = e.value !== undefined ? e.value : e.target?.value;
                                onChange(selectedValue);
                                handleChange(e);
                                if (e.target) {
                                    e.target.filterValue = '';
                                    e.target.state.text = '';
                                }
                                resetListFilter();
                            }}
                            onBlur={(e) => {
                                handleOnBlur(e)
                                onBlur(e)
                            }}
                            onOpen={() => {
                                resetListFilter();
                                if (!syncPopupOnOpen()) {
                                    requestAnimationFrame(() => {
                                        if (!syncPopupOnOpen()) {
                                            requestAnimationFrame(syncPopupOnOpen);
                                        }
                                    });
                                }
                            }}
                            onClose={(e) => {
                                if (e.target) {
                                    e.target.filterValue = '';
                                    e.target.state.text = '';
                                }
                                currentPopupRef.current = null;
                                resetListFilter();
                            }}
                            filterable={normalizedData?.length > 5}
                            focusedItemIndex={getFocusedItemIndex}
                            onFilterChange={filterChange}
                            popupSettings={{
                                animate:
                                    consumerPopupSettings?.animate ??
                                    !shouldDisableKendoPopupAnimate(
                                        popupAppendTo,
                                        containerWrapper.current,
                                    ),
                                ...consumerPopupSettings,
                                popupClass: [DD_CLASS.listPopup, resolvedPopupClass]
                                    .filter(Boolean)
                                    .join(' '),
                                ...(popupAppendTo && { appendTo: popupAppendTo }),
                            }}
                            itemRender={isCustomRender ? itemRender : customRender}
                            itemDisabled={itemDisabled}
                            {...(valueRender && { valueRender })}
                            listNoDataRender={renderNoData}
                            {...(normalizedData?.length > 5000 && virtualization)}
                            {...restField}
                            value={resolvedValue}
                            {...(resolvedHeader && { header: resolvedHeader })}
                            {...(resolvedFooter && { footer: resolvedFooter })}
                            {...dropDownRest}
                            {...(selectedValueText && { title: selectedValueText })}
                        />
                        </div>
                        {(smallText || rightTooltip) && (
                            <div className={`${DD_CLASS.meta} d-flex align-items-center justify-content-between gap-2 mt5 lh-sm`}>
                                {smallText  ? (
                                    <TruncatedCell value={smallText} noTable />
                                ) : <span />}
                                {rightTooltip && (
                                    isValidElement(rightTooltip) ? (
                                        rightTooltip
                                    ) : (
                                        <ResTooltip text={String(rightTooltip)} position="top" className='lh0'>
                                            <i className={`${rightTooltipIcon} icon-xs color-primary-blue`} />
                                        </ResTooltip>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                );
            }}
        />
    );
};

ResKendoDropdown.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.array,
    className: PropTypes.string,
    popupClass: PropTypes.string,
    placeholder: PropTypes.string,
    clearErrors: PropTypes.func,
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.array,
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    rules: PropTypes.object,
    setError: PropTypes.func,
    setValue: PropTypes.func,
    textField: PropTypes.string,
    dataItemKey: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    handleChange: PropTypes.func,
    isError: PropTypes.bool,
    isCustomRender: PropTypes.bool,
    itemRender: PropTypes.func,
    rightAlign: PropTypes.bool,
    noBottomBorder: PropTypes.bool,
    isTagRender: PropTypes.bool,
    isShowBordertip: PropTypes.bool,
    header: PropTypes.node,
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    subLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    valueRender: PropTypes.func,
    itemDisabled: PropTypes.string,
    smallText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightTooltipIcon: PropTypes.string,
    errorClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    errorMessageClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    useErrorContainer: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
};

export default memo(ResKendoDropdown);

// For Icon update
// useEffect(() => {
//     const arrowIcon = document.getElementsByClassName('k-i-caret-alt-down');
//     [...arrowIcon].forEach((x) => {
//         const element = [...x.classList];
//         // if (!element.includes('icon-rs-caret-mini')) {
//         //     x.className += ' icon-rs-caret-mini';
//         // }
//     });
// }, []);
