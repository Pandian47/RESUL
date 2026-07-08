import { circle_zoom_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useId, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useForm } from 'react-hook-form';
import { Dropdown } from 'react-bootstrap';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { RS_ADVANCE_SEARCH_DROPDOWN_POPPER_CONFIG } from 'Components/FormFields/RSBootstrapdown';
import './RSMultiSelect_Advance_Search.scss';

const TOGGLE_TITLE_MAX_LEN = 56;
const ADVANCE_SEARCH_FILTER_EMPTY_MIN_HEIGHT_PX = 247;

const MultiSelectOptionRow = memo(function MultiSelectOptionRow({
    item,
    fieldName,
    control,
    displayValue,
    isActive,
    disabled,
    onToggle,
}) {
    return (
        <Dropdown.Item
            as="div"
            className={`bs-dd-item rs-ms-dd-item ${disabled ? 'rs-ms-dd-item--disabled' : ''} ${isActive ? '' : ''}`}
            // Global .dropdown-item.active uses pointer-events: none; re-enable so checkboxes work when selected.
            style={isActive ? { pointerEvents: 'auto' } : undefined}
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (disabled) return;
                onToggle(item, !isActive);
            }}
        >
            <div
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <RSCheckbox
                    control={control}
                    name={fieldName}
                    labelName={displayValue}
                    disabledchk={disabled}
                    handleChange={(e) => onToggle(item, e.target.checked)}
                    containerClass="mb-0"
                />
            </div>
        </Dropdown.Item>
    );
});

const RSMultiSelectNew = ({
    data = [],
    fieldKey = 'name',
    itemKey,
    isObject = false,
    value = [],
    onSelect = () => { },
    label = 'Select',
    selectAllLabel = 'All',
    alignRight = false,
    disabled = false,
    insertAfterSelectAll = null,
    /** When true, omit the synthetic “select all” row and `insertAfterSelectAll` (e.g. Created by). */
    hideSelectAllRow = false,
    /** When true, do not repeat `label` on the toggle; use selection summary or blank (field label is shown above). */
    omitStaticLabelInToggle = false,
    /** When true, show list search when `data.length` exceeds `minOptionsForFilter`. */
    filterable = true,
    minOptionsForFilter = 5,
}) => {
    const [selectedItems, setSelectedItems] = useState(value);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');

    const idPrefix = useId().replace(/:/g, '');
    const selectAllName = `ms_${idPrefix}_all`;

    const { control, reset } = useForm({ shouldUnregister: true, defaultValues: {} });

    const valueKey = JSON.stringify(value);
    useEffect(() => {
        setSelectedItems(value);
    }, [valueKey]);

    const getDisplayValue = useCallback(
        (item) => (isObject ? _get(item, fieldKey, '') : String(item ?? '')),
        [isObject, fieldKey],
    );

    const getItemKey = useCallback(
        (item) => {
            if (!isObject) return String(item ?? '');
            if (itemKey) {
                const k = _get(item, itemKey, '');
                return k !== '' && k != null ? String(k) : _get(item, fieldKey, '');
            }
            return _get(item, fieldKey, '');
        },
        [isObject, fieldKey, itemKey],
    );

    /** Drop duplicate object rows that share the same `itemKey` (e.g. same `userId` twice from API). */
    const rowSource = useMemo(() => {
        if (!Array.isArray(data) || !data.length) return data || [];
        if (!isObject || !itemKey) return data;
        const seen = new Set();
        return data.filter((item) => {
            const k = String(getItemKey(item) ?? '').trim();
            if (!k) return true;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });
    }, [data, isObject, itemKey, getItemKey]);

    const getItemFieldName = useCallback(
        (item) => `ms_${idPrefix}_${String(getItemKey(item)).replace(/\W/g, '_')}`,
        [idPrefix, getItemKey],
    );

    const isItemSelected = useCallback(
        (item) => selectedItems.some((s) => getItemKey(s) === getItemKey(item)),
        [selectedItems, getItemKey],
    );

    /** Row that already means “everything” (so we do not also render the synthetic “All” row). */
    const isNativeAllRow = useCallback(
        (item) => {
            const text = String(getDisplayValue(item) || '').trim().toLowerCase();
            const normalizedSelectAll = String(selectAllLabel || 'All').trim().toLowerCase();
            return (
                text === 'all' ||
                text === normalizedSelectAll ||
                text === 'all list'
            );
        },
        [getDisplayValue, selectAllLabel],
    );

    const hasNativeAllOption = useMemo(() => rowSource.some(isNativeAllRow), [rowSource, isNativeAllRow]);

    const showSyntheticSelectAll = !hideSelectAllRow && !hasNativeAllOption;

    const nativeAllKey = useMemo(() => {
        const allItem = rowSource.find(isNativeAllRow);
        return allItem ? getItemKey(allItem) : null;
    }, [rowSource, isNativeAllRow, getItemKey]);

    const selectableItems = useMemo(
        () => (hasNativeAllOption ? rowSource.filter((item) => getItemKey(item) !== nativeAllKey) : rowSource),
        [rowSource, hasNativeAllOption, nativeAllKey, getItemKey],
    );

    const selectedSelectableCount = useMemo(
        () =>
            selectedItems.filter((item) =>
                selectableItems.some((candidate) => getItemKey(candidate) === getItemKey(item)),
            ).length,
        [selectedItems, selectableItems, getItemKey],
    );

    const allItemsSelected = selectableItems.length > 0 && selectedSelectableCount === selectableItems.length;

    useEffect(() => {
        const values = { [selectAllName]: allItemsSelected };
        rowSource.forEach((item) => {
            const isNativeAll = hasNativeAllOption && getItemKey(item) === nativeAllKey;
            values[getItemFieldName(item)] = isNativeAll
                ? allItemsSelected
                : selectedItems.some((s) => getItemKey(s) === getItemKey(item));
        });
        reset(values);
    }, [
        rowSource,
        selectedItems,
        allItemsSelected,
        selectAllName,
        getItemFieldName,
        reset,
        hasNativeAllOption,
        nativeAllKey,
        getItemKey,
    ]);

    const toggleSelectAll = useCallback(
        (checked) => {
            const next = checked ? [...selectableItems] : [];
            setSelectedItems(next);
            onSelect(next);
            setMenuOpen(true);
        },
        [selectableItems, onSelect],
    );

    const handleSelectAllChange = useCallback((e) => toggleSelectAll(e.target.checked), [toggleSelectAll]);

    const handleItemToggle = useCallback(
        (item, checked) => {
            if (hasNativeAllOption && getItemKey(item) === nativeAllKey) {
                const next = checked ? [...selectableItems] : [];
                setSelectedItems(next);
                onSelect(next);
                setMenuOpen(true);
                return;
            }
            const key = getItemKey(item);
            let next;
            if (checked) {
                next = selectedItems.some((s) => getItemKey(s) === key)
                    ? selectedItems
                    : [...selectedItems, item];
            } else {
                next = selectedItems.filter((s) => getItemKey(s) !== key);
            }
            setSelectedItems(next);
            onSelect(next);
            setMenuOpen(true);
        },
        [selectedItems, getItemKey, onSelect, hasNativeAllOption, nativeAllKey, selectableItems],
    );

    const filteredRowSource = useMemo(() => {
        const q = String(searchDraft ?? '').trim().toLowerCase();
        if (!q) return rowSource;
        return rowSource.filter((item) => {
            const text = String(getDisplayValue(item) ?? '').toLowerCase();
            return text.includes(q);
        });
    }, [rowSource, searchDraft, getDisplayValue]);

    const handleMenuToggle = useCallback(
        (next) => {
            setMenuOpen(next);
            if (!next) {
                setSearchDraft('');
            }
        },
        [],
    );

    const toggleTitle = useMemo(() => {
        if (omitStaticLabelInToggle) return label;
        if (!selectedItems.length) return label;
        const joined = selectedItems.map((item) => getDisplayValue(item)).filter(Boolean).join(', ');
        if (!joined) return label;
        if (joined.length <= TOGGLE_TITLE_MAX_LEN) return joined;
        return `${joined.slice(0, TOGGLE_TITLE_MAX_LEN - 1)}\u2026`;
    }, [omitStaticLabelInToggle, label, selectedItems, getDisplayValue]);

    const showListFilter = filterable && Array.isArray(data) && data.length > minOptionsForFilter;
    const isListSearchActive = showListFilter && String(searchDraft ?? '').trim().length > 0;
    const showSelectAllRow = showSyntheticSelectAll && !isListSearchActive;

    const renderEmptyListState = (withSearchMinHeight = false) => (
        <div
            className="rs-ms-list-empty"
            style={
                withSearchMinHeight
                    ? { minHeight: `${ADVANCE_SEARCH_FILTER_EMPTY_MIN_HEIGHT_PX}px` }
                    : undefined
            }
        >
            <NoDataAvailableRender />
        </div>
    );

    return (
        <div className="rs-bootstrap-dropdown rs-multi-select-new">
            <Dropdown
                className="rs-dropdown"
                align={alignRight ? 'end' : 'start'}
                show={menuOpen}
                onToggle={handleMenuToggle}
                autoClose="outside"
            >
                <Dropdown.Toggle
                    disabled={disabled}
                    {...(omitStaticLabelInToggle ? { 'aria-label': label } : {})}
                >
                    {label}
                </Dropdown.Toggle>
                <Dropdown.Menu renderOnMount popperConfig={RS_ADVANCE_SEARCH_DROPDOWN_POPPER_CONFIG}>
                {showListFilter && (
                    <div className="k-list-filter">
                        <span className="k-searchbox rs-ms-searchbox position-relative d-block">
                            <span
                                className={`k-input-icon position-absolute top2 right0 icon-md color-secondary-grey ${circle_zoom_fill_edge_medium}`}
                                aria-hidden
                            />
                            <input
                                type="text"
                                className="k-input-inner"
                                placeholder="Search.."
                                value={searchDraft}
                                disabled={disabled}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSearchDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }
                                }}
                            />
                        </span>
                    </div>
                )}
                <div className="css-scrollbar custome-dropdown-scroll">
                    {rowSource.length > 0 ? (
                        <>
                            {showSelectAllRow && (
                                <Dropdown.Item
                                    as="div"
                                    className={`bs-dd-item rs-ms-dd-item rs-multi-select-all ${disabled ? 'rs-ms-dd-item--disabled' : ''} ${allItemsSelected ? '' : ''}`}
                                    style={allItemsSelected ? { pointerEvents: 'auto' } : undefined}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (disabled) return;
                                        toggleSelectAll(!allItemsSelected);
                                    }}
                                >
                                    <div
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <RSCheckbox
                                            control={control}
                                            name={selectAllName}
                                            labelName={selectAllLabel}
                                            disabledchk={disabled}
                                            handleChange={handleSelectAllChange}
                                            containerClass="mb-0"
                                        />
                                    </div>
                                </Dropdown.Item>
                            )}
                            {!hideSelectAllRow && !isListSearchActive && insertAfterSelectAll}
                            {filteredRowSource.length ? (
                                filteredRowSource.map((item) => (
                                    <MultiSelectOptionRow
                                        key={getItemFieldName(item)}
                                        item={item}
                                        fieldName={getItemFieldName(item)}
                                        control={control}
                                        displayValue={getDisplayValue(item)}
                                        isActive={
                                            hasNativeAllOption && getItemKey(item) === nativeAllKey
                                                ? allItemsSelected
                                                : isItemSelected(item)
                                        }
                                        disabled={disabled}
                                        onToggle={handleItemToggle}
                                    />
                                ))
                            ) : (
                                renderEmptyListState(isListSearchActive)
                            )}
                        </>
                    ) : (
                        renderEmptyListState(false)
                    )}
                </div>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

RSMultiSelectNew.propTypes = {
    data: PropTypes.array.isRequired,
    fieldKey: PropTypes.string,
    itemKey: PropTypes.string,
    isObject: PropTypes.bool,
    value: PropTypes.array,
    onSelect: PropTypes.func,
    label: PropTypes.string,
    selectAllLabel: PropTypes.string,
    alignRight: PropTypes.bool,
    disabled: PropTypes.bool,
    insertAfterSelectAll: PropTypes.node,
    hideSelectAllRow: PropTypes.bool,
    omitStaticLabelInToggle: PropTypes.bool,
    filterable: PropTypes.bool,
    minOptionsForFilter: PropTypes.number,
};

export default memo(RSMultiSelectNew);