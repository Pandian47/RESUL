import { circle_zoom_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';
import { Dropdown, Form } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import { SEARCH } from 'Constants/GlobalConstant/Placeholders';
import { truncateTitle } from 'Utils/modules/displayCore';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

/** Popper — escape RSModal overflow:hidden shell (z-index matches ResKendoDropdown) */
export const RS_BOOTSTRAP_DROPDOWN_POPPER_CONFIG = {
    strategy: 'fixed',
    modifiers: [
        {
            name: 'preventOverflow',
            options: {
                boundary: 'viewport',
                padding: 8,
                altBoundary: true,
            },
        },
        {
            name: 'flip',
            options: {
                boundary: 'viewport',
                padding: 8,
                fallbackPlacements: ['bottom-start', 'top-start', 'bottom-end', 'top-end'],
            },
        },
    ],
};

const OBJECT_ROW_ID_EXCLUDED_KEYS = new Set(['menuLabel']);

function isPrimitiveRowIdValue(v) {
    if (v === undefined || v === null || v === '') return false;
    if (isValidElement(v)) return false;
    return typeof v === 'string' || typeof v === 'number';
}

function findUniquePrimitiveKeyAcrossRows(rows, fieldKey) {
    if (!rows?.length || !fieldKey) return null;
    const objects = rows.filter((m) => m && typeof m === 'object');
    if (!objects.length) return null;

    const keySet = new Set();
    objects.forEach((obj) => {
        Object.keys(obj).forEach((k) => {
            if (k !== fieldKey && !OBJECT_ROW_ID_EXCLUDED_KEYS.has(k)) {
                keySet.add(k);
            }
        });
    });

    const sortedKeys = [...keySet].sort();
    for (const k of sortedKeys) {
        const vals = objects.map((o) => _get(o, k));
        if (!vals.every((v) => isPrimitiveRowIdValue(v))) continue;
        const normalized = vals.map((v) => String(v));
        if (new Set(normalized).size === normalized.length) {
            return k;
        }
    }
    return null;
}

function getObjectRowSelectionKey(item, fieldKey, resolvedRowIdKey) {
    if (!item || typeof item !== 'object') return null;
    if (resolvedRowIdKey) {
        const idVal = _get(item, resolvedRowIdKey);
        if (isPrimitiveRowIdValue(idVal)) {
            return { kind: 'id', value: idVal };
        }
    }
    const label = _get(item, fieldKey, '');
    return { kind: 'field', value: label };
}

function objectRowsAreSameSelection(a, b) {
    if (!a || !b || a.kind !== b.kind) return false;
    if (a.kind === 'id') {
        return Number(a.value) === Number(b.value) || String(a.value) === String(b.value);
    }
    return String(a.value ?? '') === String(b.value ?? '');
}

const getObjectToggleDisplay = (title, fieldKey) => {
    if (!title || typeof title !== 'object') return null;
    const menuLabel = _get(title, 'menuLabel', null);
    if (menuLabel) return menuLabel;
    return _get(title, fieldKey, '');
};

const RSBootstrapDropdown = ({
    data: menus = [],
    onSelect = () => {},
    defaultItem,
    className = '',
    fontSize = '',
    fieldKey,
    idKey,
    alignRight,
    disbleItems = [],
    errorMessage,
    showUpdate = true,
    flatIcon = false,
    containerClass = '',
    isObject,
    isActive = false,
    innerItems = '',
    isUserRole = false,
    isCustomDefaultIcon = false,
    isObjectDisableKey = 'text',
    showSearch = false,
    isHierarchical = false,
    ItemRender = () => {},
    isCustomRender = false,
    toggleItem = () => {},
    footer,
    headerRight,
    onToggle,
    popupSettings,
    toggleLabel,
    isFullHierarchyUI = false,
    isCheckbox = false,
    checkedItems = [],
    onCheckChange = null,
    disabledTypes = [],
    isCustomHover = false,
    filterable = false,
    isTruncateTitle = false,
    truncateTitleLength = 21,
    itemTruncateLength = 30,
    maxHeightnone = false,
    controlledShow = undefined,
    disabled = false,
    footerContent = null,
    isLoading = false,
    tooltipClassName = ''
}) => {
    const [title, setTitle] = useState(defaultItem);
    const titleRef = useRef(null);
    const activeIdRef = useRef(null);
    const userSelectionKeyRef = useRef(null);
    const [activeItem, setActiveItem] = useState(null);
    const [searchText, setSearchText] = useState('');   // for showSearch
    const [filterValue, setFilterValue] = useState(''); // for filterable
    const searchInputRef = useRef(null);
    const [internalOpen, setInternalOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const toggleId = useId();

    const isControlledShow = controlledShow !== undefined;
    const menuShow = isControlledShow ? controlledShow : internalOpen;

    const footerNode = footer ?? footerContent;

    useEffect(() => {
        if (isCustomDefaultIcon && activeItem === null && Array.isArray(menus) && menus.length > 0) {
            setActiveItem(menus[0]);
        }
    }, [isCustomDefaultIcon, menus, activeItem]);

    const handleMenuToggle = useCallback(
        (nextOpen, meta) => {
            if (!isControlledShow) {
                setInternalOpen(nextOpen);
            }
            onToggle?.(nextOpen, meta);
            if (!nextOpen && showSearch) setSearchText('');
            if (!nextOpen && filterable) setFilterValue('');
        },
        [isControlledShow, onToggle, showSearch, filterable],
    );

    // ── flat hierarchical data (non-fullUI) — builds ordered flat list ──────
    const processedData = useMemo(() => {
        if (!isHierarchical || !menus) return menus;
        if (!Array.isArray(menus)) return menus;

        const childrenMap = {};
        const roots = [];

        menus.forEach((item) => {
            if (item == null) return;
            const pid = item.parentId;
            if (!pid) {
                roots.push(item);
            } else {
                if (!childrenMap[pid]) childrenMap[pid] = [];
                childrenMap[pid].push(item);
            }
        });

        const flattened = [];
        const processNode = (nodes, level) => {
            if (!nodes) return;
            nodes.forEach((node) => {
                if (node == null) return;
                flattened.push({ ...node, level });
                processNode(childrenMap[node.id], level + 1);
            });
        };

        processNode(roots, 0);
        return flattened;
    }, [menus, isHierarchical]);

    // ── tree data for isFullHierarchyUI (nested node objects) ───────────────
    const treeData = useMemo(() => {
        if (!isFullHierarchyUI || !menus || !Array.isArray(menus)) return [];

        let targetMenus = menus;

        // Filter with ancestor preservation when search is active
        const activeQuery = (filterable && filterValue) || (showSearch && searchText);
        if (activeQuery) {
            const lower = activeQuery.toLowerCase();
            const matchingIds = new Set();
            menus.forEach((item) => {
                if (item == null) return;
                const label = isObject ? _get(item, fieldKey, '') : item;
                if (String(label ?? '').toLowerCase().includes(lower)) {
                    matchingIds.add(item.id);
                }
            });
            const finalSet = new Set();
            const addWithAncestors = (id) => {
                if (!id || finalSet.has(id)) return;
                const item = menus.find((m) => m?.id === id);
                if (item) {
                    finalSet.add(id);
                    if (item.parentId) addWithAncestors(item.parentId);
                }
            };
            matchingIds.forEach((id) => addWithAncestors(id));
            targetMenus = menus.filter((m) => finalSet.has(m?.id));
        }

        const map = {};
        const roots = [];

        targetMenus.forEach((item) => {
            if (item?.id == null) return;
            map[item.id] = { ...item, children: [] };
        });
        targetMenus.forEach((item) => {
            if (item?.id == null || !map[item.id]) return;
            if (item.parentId == null) roots.push(map[item.id]);
            else if (map[item.parentId]) map[item.parentId].children.push(map[item.id]);
        });

        // Auto-expand all nodes that have children
        setExpandedIds((prev) => {
            const next = new Set(prev);
            targetMenus.forEach((m) => {
                if (m?.id == null) return;
                if (targetMenus.some((child) => child?.parentId === m.id)) {
                    next.add(m.id);
                }
            });
            return next;
        });

        return roots;
    }, [menus, isFullHierarchyUI, filterable, filterValue, showSearch, searchText, isObject, fieldKey]);

    // ── filtered list for legacy flat rendering ──────────────────────────────
    const filteredMenus = useMemo(() => {
        const source = isHierarchical && processedData ? processedData : menus || [];
        const query = showSearch ? searchText : filterable ? filterValue : '';
        if (!query) return source;
        return source.filter((item) => {
            if (!isObject) return item?.toString().toLowerCase().includes(query.toLowerCase());
            const rawField = _get(item, fieldKey, '');
            const fieldSearch =
                isValidElement(rawField) || (typeof rawField === 'object' && rawField !== null)
                    ? ''
                    : String(rawField ?? '');
            const haystack =
                _get(item, 'searchText', '') ||
                `${fieldSearch} ${_get(item, 'friendlyName', '')} ${_get(item, 'smartLinkTitle', '')} ${_get(
                    item,
                    'value',
                    '',
                )}`.trim();
            return haystack.toLowerCase().includes(query.toLowerCase());
        });
    }, [menus, searchText, filterValue, showSearch, filterable, isObject, fieldKey, processedData, isHierarchical]);

    const resolvedRowIdKey = useMemo(() => {
        if (idKey != null && String(idKey).trim() !== '') return String(idKey).trim();
        if (!isObject || !filteredMenus?.length) return null;
        return findUniquePrimitiveKeyAcrossRows(filteredMenus, fieldKey);
    }, [idKey, isObject, filteredMenus, fieldKey]);

    const isSearchEnabled = useMemo(
        () =>
            showSearch
            || (filterable && (menus?.length > 5 || isHierarchical || isFullHierarchyUI)),
        [showSearch, filterable, menus?.length, isHierarchical, isFullHierarchyUI],
    );

    const dropdownScrollMaxHeight = maxHeightnone ? '' : isSearchEnabled ? '215px' : '210px';

    useLayoutEffect(() => {
        if (!defaultItem) return;

        if (isObject) {
            const defaultKey = getObjectRowSelectionKey(defaultItem, fieldKey, resolvedRowIdKey);
            if (userSelectionKeyRef.current && defaultKey) {
                if (!objectRowsAreSameSelection(userSelectionKeyRef.current, defaultKey)) {
                    return;
                }
                userSelectionKeyRef.current = null;
            }
        }

        if (typeof defaultItem !== 'object') {
            titleRef.current = defaultItem;
            activeIdRef.current = defaultItem;
            setTitle(defaultItem);
            return;
        }

        setTitle(defaultItem);
        titleRef.current = _get(defaultItem, fieldKey, '');
        activeIdRef.current =
            resolvedRowIdKey != null
                ? _get(defaultItem, resolvedRowIdKey, null)
                : _get(defaultItem, fieldKey, '');
    }, [defaultItem, fieldKey, resolvedRowIdKey, isObject]);

    // ── expand / collapse a tree node ────────────────────────────────────────
    const toggleExpand = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ── recursive tree renderer (isFullHierarchyUI) ──────────────────────────
    const renderTreeNodes = (nodes) => {
        return nodes?.map((item, index) => {
            if (item == null) return null;
            const isChecked = isCheckbox && checkedItems?.some((id) => String(id) === String(item?.id));
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedIds.has(item.id);
            const isLast = index === nodes?.length - 1;

            const isDisabledType = isCheckbox && disabledTypes?.includes(item?.type);
            const isDisabledItem = disbleItems.includes(item) || item?.disabled || isDisabledType;
            // Items not in disabledTypes get a checkbox; others are header-only rows
            const showCheckbox = isCheckbox && !isDisabledType;

            const label = fieldKey ? _get(item, fieldKey, '') || item?.name : item?.name;

            return (
                <div key={item.id} className={`rs-tree-node ${isLast ? 'rs-last-node' : ''}`}>
                    <Dropdown.Item
                        as="div"
                        className={`rs-tree-row ${showCheckbox ? 'rs-bu-item' : 'rs-parent-item'} ${isChecked ? 'rs-item-checked' : ''} ${isDisabledItem ? 'click-off' : ''}`}
                        onClick={(e) => {
                            if (isDisabledItem) {
                                e.stopPropagation();
                                return;
                            }
                            if (isCheckbox) {
                                e.preventDefault();
                                e.stopPropagation();
                                onCheckChange?.(item, !isChecked);
                                return;
                            }
                            // Single-select mode
                            userSelectionKeyRef.current = getObjectRowSelectionKey(
                                item,
                                fieldKey,
                                resolvedRowIdKey,
                            );
                            if (showUpdate) setTitle(item);
                            titleRef.current = isObject ? _get(item, fieldKey, '') : item;
                            onSelect?.(item, index);
                            handleMenuToggle(false);
                            e.stopPropagation();
                        }}
                    >
                        {hasChildren ? (
                            <span
                                className={`rs-tree-arrow ${isExpanded ? 'open' : ''}`}
                                onClick={(e) => toggleExpand(item.id, e)}
                            />
                        ) : (
                           <></>
                        )}
                        {showCheckbox ? (
                            <div className="checkbox-wrapper pe-none">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        readOnly
                                        className="checkbox"
                                        tabIndex={-1}
                                    />
                                    <span className="lbl">
                                        <span className="rs-tree-name">{label}</span>
                                    </span>
                                </label>
                            </div>
                        ) : (
                            <span className="rs-tree-name">{label}</span>
                        )}
                    </Dropdown.Item>
                    {hasChildren && isExpanded && (
                        <div className="rs-tree-children">{renderTreeNodes(item.children)}</div>
                    )}
                </div>
            );
        });
    };

    // ── toggle button label ──────────────────────────────────────────────────
    const renderToggleContent = () => {
        if (toggleLabel != null && String(toggleLabel).trim() !== '') {
            return toggleLabel?.length > 25 ? (
                <RSTooltip text={toggleLabel} position="bottom" innerContent={false} className = {tooltipClassName}>
                    {toggleLabel?.slice(0, 25) + '...'}
                </RSTooltip>
            ) : (
                toggleLabel
            );
        }
        if (isTruncateTitle) {
            const displayText = isObject ? _get(title, fieldKey, '') : title;
            return (
                <RSTooltip text={displayText} position="top">
                    <span>{truncateTitle(displayText, truncateTitleLength)}</span>
                </RSTooltip>
            );
        }
        if (isObject) {
            const display = getObjectToggleDisplay(title, fieldKey);
            const displayString = isValidElement(display)
                ? `${_get(title, 'friendlyName', '')} ${_get(title, 'smartLinkTitle', '')}`.trim()
                : String(display ?? '');
            return displayString?.length > 25 ? (
                <RSTooltip text={displayString} position="bottom" innerContent={false} className = {tooltipClassName}>
                    {displayString?.slice(0, 25) + '...'}
                </RSTooltip>
            ) : (
                display
            );
        }
        if (title?.length > 25) {
            return <RSTooltip text={title} className = {tooltipClassName}>{title?.slice(0, 25) + '...'}</RSTooltip>;
        }
        return title;
    };

    // ── legacy flat item select (non-object) ─────────────────────────────────
    const handleItemSelect = (item, index) => {
        const isDisabled = disbleItems.includes(item);
        if (showUpdate && !isDisabled) {
            setTitle(isCustomDefaultIcon ? defaultItem : item);
            setActiveItem(item);
        }
        titleRef.current = item;
        activeIdRef.current = item;
        if (!isDisabled) {
            if (showSearch) setSearchText('');
            onSelect(item, index);
        }
    };

    return (
        <div
            className={`rs-bootstrap-dropdown ${showSearch ? 'v1-search-dropdown-container' : ''} ${flatIcon ? 'rs-bootstrap-dropdown-with-icon' : ''} ${footerNode ? 'rs-bootstrap-dropdown-footer' : ''} ${containerClass}`}
        >
            {errorMessage && <div className="validation-message">{errorMessage}</div>}
            {isLoading && (
                <div className="rs-inputIcon-wrapper right25">
                    <div className="segment_loader"></div>
                </div>
            )}
            <Dropdown
                align={alignRight ? 'end' : 'start'}
                className={`rs-dropdown ${className} ${fontSize} ${flatIcon ? '1' : '2'} ${isCustomHover ? 'rs-dropdown-custom-hover' : ''}`}
                show={menuShow}
                onToggle={handleMenuToggle}
            >
                <Dropdown.Toggle variant="" id={toggleId} disabled={disabled || isLoading}>
                    {renderToggleContent()}
                </Dropdown.Toggle>

                <Dropdown.Menu
                    renderOnMount
                    popperConfig={RS_BOOTSTRAP_DROPDOWN_POPPER_CONFIG}
                    className={`rs-bootstrap-dropdown-menu ${popupSettings?.popupClass ?? ''}`.trim()}
                    style={{ '--rs-dropdown-item-count': filteredMenus?.length || 0, zIndex: 1101 }}
                >
                    {/* Legacy search (showSearch) */}
                    {showSearch && (
                        <div className="sticky-top bg-white border-bottom position-relative v1-search-dropdown-icon d-flex align-items-center gap-1">
                            <Form.Control
                                ref={searchInputRef}
                                type="text"
                                placeholder={SEARCH}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="form-control-sm"
                                autoFocus
                            />
                            <i
                                className={`${circle_zoom_fill_edge_medium} icon-md color-secondary-grey`}
                            />
                            {headerRight && (
                                <div className="position-absolute top2 right0 pr5">{headerRight}</div>
                            )}
                        </div>
                    )}

                    {/* Kendo-style search (filterable) */}
                    {filterable && !showSearch && (menus?.length > 5 || isHierarchical || isFullHierarchyUI) && (
                        <div className="k-list-filter">
                            <span className="k-searchbox k-input k-input-md k-rounded-md k-input-solid border-bottom pb5">
                                <span className="k-input-icon position-absolute top2 right0 icon-md color-secondary-grey icon-rs-circle-zoom-fill-edge-medium" />
                                <input
                                    type="text"
                                    className="k-input-inner"
                                    placeholder="Search.."
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </span>
                        </div>
                    )}

                    <div
                        className={`css-scrollbar custome-dropdown-scroll position-relative ${isFullHierarchyUI ? 'rs-full-hierarchy-wrapper' : ''} ${filteredMenus?.length ? 'v1-dropdown-data': 'v1-dropdown-nodata'}`}
                        style={{ maxHeight: dropdownScrollMaxHeight, height: maxHeightnone ? 'auto' : '' }}
                    >
                        {isFullHierarchyUI ? (
                            treeData?.length ? (
                                renderTreeNodes(treeData)
                            ) : (
                                <div className="d-flex align-items-center justify-content-center text-center pe-none" style={{ minHeight: '120px' }}>
                                    <NoDataAvailableRender />
                                </div>
                            )
                        ) : filteredMenus?.length ? (
                            filteredMenus.map((item, index) => {
                                const level = Number(item?.hierarchyLevel ?? item?.level ?? 0);
                                const paddingLeft = level * 15 + 10;

                                const isDisabled = isObject
                                    ? disbleItems?.length > 0 &&
                                      disbleItems?.some(
                                          (d) =>
                                              d === item?.[isObjectDisableKey] || d === item?.segmentName,
                                      )
                                    : disbleItems?.length > 0 && disbleItems?.some((d) => d === item);

                                const isCheckboxItem = item?.showCheckBox || false;
                                const itemId =
                                    resolvedRowIdKey != null
                                        ? _get(item, resolvedRowIdKey, '')
                                        : _get(item, fieldKey, '');

                                const selectedKey = isObject
                                    ? getObjectRowSelectionKey(title, fieldKey, resolvedRowIdKey)
                                    : null;
                                const rowKey = isObject
                                    ? getObjectRowSelectionKey(item, fieldKey, resolvedRowIdKey)
                                    : null;
                                const isSelected = isObject
                                    ? objectRowsAreSameSelection(selectedKey, rowKey)
                                    : isActive && titleRef.current === itemId;

                                const itemStyle = isHierarchical ? { paddingLeft: `${paddingLeft}px` } : {};

                                return (
                                    <div
                                        key={index}
                                        className={`${isDisabled ? 'pe-none click-off' : ''}`}
                                        style={{ '--rs-dropdown-item-index': index }}
                                    >
                                        {isObject ? (
                                            <Dropdown.Item
                                                active={isSelected}
                                                className={`bs-dd-item ${isSelected ? 'active' : ''}`}
                                                key={
                                                    resolvedRowIdKey != null
                                                        ? `${String(_get(item, resolvedRowIdKey, ''))}-${index}`
                                                        : `${String(_get(item, fieldKey, ''))}-${index}`
                                                }
                                                style={itemStyle}
                                                disabled={isDisabled}
                                                onClick={(e) => {
                                                    if (isDisabled) return;
                                                    if (isCheckboxItem) {
                                                        e.stopPropagation();
                                                        toggleItem(item);
                                                        return;
                                                    }
                                                    userSelectionKeyRef.current = getObjectRowSelectionKey(
                                                        item,
                                                        fieldKey,
                                                        resolvedRowIdKey,
                                                    );
                                                    if (showUpdate) setTitle(item);
                                                    titleRef.current = _get(item, fieldKey, '');
                                                    activeIdRef.current = itemId;
                                                    if (showSearch) setSearchText('');
                                                    onSelect?.(item, index);
                                                    handleMenuToggle(false);
                                                }}
                                            >
                                                {isCheckboxItem ? (
                                                    ItemRender(item)
                                                ) : (
                                                    <>
                                                        {isHierarchical && level > 0 && (
                                                            <span style={{ marginRight: 5 }}>•</span>
                                                        )}
                                                        {_get(item, 'menuLabel', null) ??
                                                            _get(item, fieldKey, '')}
                                                    </>
                                                )}
                                            </Dropdown.Item>
                                        ) : (
                                            <Dropdown.Item
                                                key={item + index}
                                                className={`${
                                                    isCustomDefaultIcon
                                                        ? activeItem === item
                                                            ? 'active'
                                                            : ''
                                                        : titleRef.current === item && isActive
                                                        ? 'active'
                                                        : ''
                                                }`}
                                                onClick={() => handleItemSelect(item, index)}
                                                disabled={isDisabled}
                                            >
                                                {item}
                                            </Dropdown.Item>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="position-absolute top0 left0 right0 bottom0 d-flex align-items-center justify-content-center text-center pe-none">
                                <NoDataAvailableRender />
                            </div>
                        )}
                    </div>

                    {footerNode && (
                        <div
                            className="dropdown-footer rs-dropdown-footer"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {footerNode}
                        </div>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
};

RSBootstrapDropdown.propTypes = {
    data: PropTypes.array.isRequired,
    onSelect: PropTypes.func,
    defaultItem: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array, PropTypes.number]),
    className: PropTypes.string,
    fontSize: PropTypes.string,
    fieldKey: PropTypes.string,
    idKey: PropTypes.string,
    alignRight: PropTypes.bool,
    disbleItems: PropTypes.array,
    errorMessage: PropTypes.string,
    flatIcon: PropTypes.bool,
    containerClass: PropTypes.string,
    isActive: PropTypes.bool,
    isUserRole: PropTypes.bool,
    innerItems: PropTypes.string,
    showSearch: PropTypes.bool,
    footer: PropTypes.node,
    footerContent: PropTypes.node,
    headerRight: PropTypes.node,
    onToggle: PropTypes.func,
    popupSettings: PropTypes.shape({ popupClass: PropTypes.string }),
    toggleLabel: PropTypes.string,
    isFullHierarchyUI: PropTypes.bool,
    isCheckbox: PropTypes.bool,
    checkedItems: PropTypes.array,
    onCheckChange: PropTypes.func,
    disabledTypes: PropTypes.array,
    isCustomHover: PropTypes.bool,
    filterable: PropTypes.bool,
    isTruncateTitle: PropTypes.bool,
    truncateTitleLength: PropTypes.number,
    itemTruncateLength: PropTypes.number,
    maxHeightnone: PropTypes.bool,
    controlledShow: PropTypes.bool,
    disabled: PropTypes.bool,
    tooltipClassName: PropTypes.string,
};

export default memo(RSBootstrapDropdown);
