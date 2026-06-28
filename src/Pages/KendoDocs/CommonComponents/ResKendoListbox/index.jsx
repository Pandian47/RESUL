import { AVAILABLE_ATTRIBUTES, COUNT, LISTBOX_NOTES_TEXT, NO_DATA_AVAILABEL, SELECTED_ATTRIBUTES, SELECT_LEFT_ATTRIBUTES, SELECT_RIGHT_ATTRIBUTES, NO_ATTRIBUTES_FOUND } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import './resKendoListbox.scss';
import PropTypes from 'prop-types';
import { ListBox, ListBoxToolbar, processListBoxData, processListBoxDragAndDrop } from '@progress/kendo-react-listbox';
import {
    TOOLBAR_TOOLS,
    ListboxColumnSkeleton,
    addUniqueKey,
    removeUniqueKey,
    isSameAttributeItem,
    reorderRightAttributesByTable,
} from './constant.jsx';
import RSSearchField from 'Components/RSSearchField';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { numberWithCommas } from 'Utils/modules/formatters';
import ListBoxNodataAvailable from 'Components/FormFields/Component/NoDataAvailableRender/ListBoxNodataAvailable';
import KendoListboxSkeleton from 'Components/Skeleton/Components/KendoListboxSkeleton';

const SEARCH_THRESHOLD = 6;

const ResKendoListbox = ({
    leftColumnValues: leftProp = [],
    rightColumnValues: rightProp = [],
    getSelectedData,
    textField = 'name',
    rightColumnName = 'rightColumnValues',
    leftColumnName = 'leftColumnValues',
    leftNotes = '',
    rightNotes = '',
    selectedField = 'selected',
    loading = false,
    leftColumnProps = {},
    rightColumnProps = {},
    wrapperClassName = '',
    leftHeaderTitle = '',
    rightHeaderTitle = '',
    rightHeaderExtra = null,
    shiftToolbarOnLeftEmpty = false,
    nodataText,
    searchClassName,
    customText,
    setSelectedLength,
    showCount = false,
    attributeMode = false,
    valueField,
    validateTransfer,
    onItemActivate,
    dynamicLayoutClass = false,
    emptyListMessage,
    isCloseSearch = false,
    setIsCloseSearch,
    rightTableFilter,
    rightSearchClassName,
    loadingMode = 'full',
}) => {
    const dragValueField = valueField || textField;

    const [listState, setListState] = useState({
        [leftColumnName]: leftProp,
        [rightColumnName]: rightProp,
    });
    const [search, setSearch] = useState({ leftAttributes: '', rightAttributes: '' });
    const [clickedItems, setClickedItems] = useState([]);
    const [ctrlKeyPressed, setCtrlKeyPressed] = useState(false);
    const [shiftKeyPressed, setShiftKeyPressed] = useState(false);
    const [isMac, setIsMac] = useState(false);
    const [rightEmptyDropActive, setRightEmptyDropActive] = useState(false);

    const draggedItemRef = useRef(null);
    const dragSourceRef = useRef(null);
    const wrapperRef = useRef(null);
    const activeListRef = useRef(null);
    const anchorIndexRef = useRef(null);
    const focusIndexRef = useRef(null);
    const modifierKeysRef = useRef({ ctrl: false, shift: false });

    const leftList = listState[leftColumnName] || [];
    const rightList = listState[rightColumnName] || [];

    useEffect(() => {
        setListState((prev) => ({
            ...prev,
            [leftColumnName]: leftProp,
            [rightColumnName]: rightProp,
        }));
    }, [leftProp, rightProp, leftColumnName, rightColumnName]);

    useEffect(() => {
        setIsMac(navigator.platform.toLowerCase().includes('mac'));
    }, []);

    useEffect(() => {
        const syncModifierKeys = (event) => {
            const ctrl = (isMac && event.metaKey) || (!isMac && event.ctrlKey);
            modifierKeysRef.current = { ctrl, shift: event.shiftKey };
            setCtrlKeyPressed(ctrl);
            setShiftKeyPressed(event.shiftKey);
        };

        const handleKeyDown = (event) => {
            syncModifierKeys(event);
        };

        const handleKeyUp = (event) => {
            syncModifierKeys(event);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isMac]);

    useEffect(() => {
        const clearRightDropHighlight = () => {
            draggedItemRef.current = null;
            dragSourceRef.current = null;
        };
        document.addEventListener('dragend', clearRightDropHighlight);
        return () => document.removeEventListener('dragend', clearRightDropHighlight);
    }, []);

    useEffect(() => {
        if (!attributeMode) return;
        if (rightList.length <= SEARCH_THRESHOLD && search.rightAttributes) {
            setSearch((prev) => ({ ...prev, rightAttributes: '' }));
        }
        if (leftList.length <= SEARCH_THRESHOLD && search.leftAttributes) {
            setSearch((prev) => ({ ...prev, leftAttributes: '' }));
        }
    }, [rightList.length, leftList.length, attributeMode, search.leftAttributes, search.rightAttributes]);

    const emitSelectedData = useCallback(
        (nextLeft, nextRight) => {
            getSelectedData({
                [leftColumnName]: nextLeft,
                [rightColumnName]: nextRight,
            });
        },
        [getSelectedData, leftColumnName, rightColumnName],
    );

    const updateLists = useCallback(
        (nextLeft, nextRight) => {
            setListState({
                [leftColumnName]: nextLeft,
                [rightColumnName]: nextRight,
            });
            emitSelectedData(nextLeft, nextRight);
        },
        [leftColumnName, rightColumnName, emitSelectedData],
    );

    const canTransfer = useCallback(
        (action, items, draggedItem) => {
            if (!validateTransfer) return true;
            return validateTransfer({ action, items, draggedItem });
        },
        [validateTransfer],
    );

    const searchedAttrs = useCallback(
        (side = 'left') => {
            const finder = `${side}Attributes`;
            const sourceList = side === 'left' ? leftList : rightList;
            let filtered = sourceList;

            if (search[finder]) {
                filtered = filtered?.filter((attr) =>
                    attr[textField]?.toLowerCase()?.includes(search[finder].toLowerCase()),
                );
            }

            if (attributeMode && side === 'right' && rightTableFilter) {
                filtered = reorderRightAttributesByTable(filtered, rightTableFilter);
            }

            return filtered;
        },
        [leftList, rightList, search, textField, attributeMode, rightTableFilter],
    );

    const withDragKeys = useCallback(
        (list) => (valueField ? addUniqueKey(list, valueField) : list),
        [valueField],
    );

    const stripDragKeys = useCallback(
        (list) => (valueField ? removeUniqueKey(list, valueField) : list),
        [valueField],
    );

    const matchItem = useCallback(
        (a, b) => (attributeMode ? isSameAttributeItem(a, b) : a?.[textField] === b?.[textField]),
        [attributeMode, textField],
    );

    const getDisplayedList = useCallback(
        (listKey) => searchedAttrs(listKey === leftColumnName ? 'left' : 'right'),
        [searchedAttrs, leftColumnName],
    );

    const getEventModifiers = useCallback(
        (event) => {
            const nativeEvent = event?.syntheticEvent || event?.nativeEvent || event;
            const ctrlFromEvent =
                nativeEvent &&
                ((isMac && nativeEvent.metaKey) || (!isMac && nativeEvent.ctrlKey));
            const shiftFromEvent = nativeEvent?.shiftKey;
            return {
                ctrl: ctrlFromEvent ?? modifierKeysRef.current.ctrl ?? ctrlKeyPressed,
                shift: shiftFromEvent ?? modifierKeysRef.current.shift ?? shiftKeyPressed,
            };
        },
        [isMac, ctrlKeyPressed, shiftKeyPressed],
    );

    const commitListSelection = useCallback(
        (listKey, connectedKey, nextData, nextConnected) => {
            activeListRef.current = listKey;
            if (attributeMode) {
                setListState((prev) => ({
                    ...prev,
                    [listKey]: nextData,
                    [connectedKey]: nextConnected,
                }));
                emitSelectedData(
                    listKey === leftColumnName ? nextData : nextConnected,
                    listKey === leftColumnName ? nextConnected : nextData,
                );
            } else {
                setListState((prev) => ({
                    ...prev,
                    [listKey]: nextData,
                    [connectedKey]: nextConnected,
                }));
            }
        },
        [attributeMode, emitSelectedData, leftColumnName],
    );

    const applyListSelection = useCallback(
        (listKey, connectedKey, targetDisplayIndex, { shift, ctrl, action = 'click', clickedItem = null }) => {
            const displayed = getDisplayedList(listKey);
            const fullList = listState[listKey] || [];

            if (!displayed.length || targetDisplayIndex < 0 || targetDisplayIndex >= displayed.length) {
                return;
            }

            const resolvedAnchor =
                shift && anchorIndexRef.current === null && focusIndexRef.current !== null
                    ? focusIndexRef.current
                    : anchorIndexRef.current;

            const anchorIndex =
                shift && resolvedAnchor !== null && resolvedAnchor !== undefined
                    ? resolvedAnchor
                    : shift
                      ? targetDisplayIndex
                      : null;

            const rangeStart =
                shift && anchorIndex !== null ? Math.min(anchorIndex, targetDisplayIndex) : targetDisplayIndex;
            const rangeEnd =
                shift && anchorIndex !== null ? Math.max(anchorIndex, targetDisplayIndex) : targetDisplayIndex;

            const nextData = fullList.map((item) => {
                const tItem = { ...item };
                const displayIdx = displayed.findIndex((entry) => matchItem(entry, item));

                if (displayIdx === -1) {
                    tItem[selectedField] = ctrl ? tItem[selectedField] : false;
                    return tItem;
                }

                if (shift && anchorIndex !== null) {
                    tItem[selectedField] =
                        (displayIdx >= rangeStart && displayIdx <= rangeEnd) ||
                        (ctrl && tItem[selectedField]);
                } else if (action === 'click' && clickedItem && matchItem(tItem, clickedItem)) {
                    tItem[selectedField] = !tItem[selectedField];
                } else if (action === 'keyboard') {
                    tItem[selectedField] = displayIdx === targetDisplayIndex;
                } else if (!ctrl) {
                    tItem[selectedField] = false;
                }

                return tItem;
            });

            const nextConnected = (listState[connectedKey] || []).map((item) => ({
                ...item,
                [selectedField]: false,
            }));

            focusIndexRef.current = targetDisplayIndex;

            if (!ctrl && !shift) {
                anchorIndexRef.current = targetDisplayIndex;
            } else if (shift && anchorIndexRef.current === null) {
                anchorIndexRef.current = anchorIndex ?? targetDisplayIndex;
            } else if (ctrl && !shift) {
                anchorIndexRef.current = targetDisplayIndex;
            }

            const selectedCount = nextData.filter((item) => item[selectedField]).length;
            setSelectedLength?.(selectedCount);
            setClickedItems(nextData.filter((item) => item[selectedField]));

            commitListSelection(listKey, connectedKey, nextData, nextConnected);
            if (action === 'keyboard' || action === 'keyboard-range') {
                wrapperRef.current?.focus({ preventScroll: true });
            }
        },
        [
            getDisplayedList,
            listState,
            matchItem,
            selectedField,
            setSelectedLength,
            commitListSelection,
        ],
    );

    const handleItemClick = useCallback(
        (event, data, connectedData) => {
            const clickedItem = event.dataItem;
            const displayed = getDisplayedList(data);
            const clickedDisplayIndex = displayed.findIndex((item) => matchItem(item, clickedItem));
            if (clickedDisplayIndex === -1) return;

            const { shift, ctrl } = getEventModifiers(event);
            applyListSelection(data, connectedData, clickedDisplayIndex, {
                shift,
                ctrl,
                action: 'click',
                clickedItem,
            });
        },
        [getDisplayedList, matchItem, getEventModifiers, applyListSelection],
    );

    const handleListboxKeyDown = useCallback(
        (event) => {
            if (event.target?.closest?.('.rs-search-filter input, .rs-search-filter textarea')) {
                return;
            }

            const navigationKeys = ['ArrowUp', 'ArrowDown', 'Home', 'End'];
            if (!navigationKeys.includes(event.key)) return;

            const listKey = activeListRef.current;
            const isListboxFocused =
                wrapperRef.current &&
                (wrapperRef.current.contains(event.target) ||
                    wrapperRef.current.contains(document.activeElement));
            if (!listKey || !isListboxFocused) {
                return;
            }

            const connectedKey = listKey === leftColumnName ? rightColumnName : leftColumnName;
            const displayed = getDisplayedList(listKey);
            if (!displayed.length) return;

            event.preventDefault();

            let currentIndex = focusIndexRef.current;
            if (currentIndex === null || currentIndex < 0 || currentIndex >= displayed.length) {
                currentIndex = displayed.findIndex((item) => item[selectedField]);
                if (currentIndex === -1) currentIndex = 0;
            }

            let nextIndex = currentIndex;
            if (event.key === 'ArrowUp') {
                nextIndex = Math.max(0, currentIndex - 1);
            } else if (event.key === 'ArrowDown') {
                nextIndex = Math.min(displayed.length - 1, currentIndex + 1);
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = displayed.length - 1;
            }

            if (nextIndex === currentIndex && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                return;
            }

            const shift = event.shiftKey;
            const ctrl = (isMac && event.metaKey) || (!isMac && event.ctrlKey);

            if (!shift) {
                anchorIndexRef.current = nextIndex;
            } else if (anchorIndexRef.current === null) {
                anchorIndexRef.current = currentIndex;
            }

            applyListSelection(listKey, connectedKey, nextIndex, {
                shift,
                ctrl,
                action: shift ? 'keyboard-range' : 'keyboard',
            });
        },
        [leftColumnName, rightColumnName, getDisplayedList, isMac, applyListSelection],
    );

    const handleToolBarClick = useCallback(
        (e, data, connectedData) => {
            if (e.toolName === 'transferFrom') {
                const selectedAttributes = (listState[rightColumnName] || []).filter(
                    (item) => item?.[selectedField] === true,
                );
                if (!canTransfer('toolbarTransferFrom', selectedAttributes)) {
                    return;
                }
            }

            const result = processListBoxData(
                listState[data],
                listState[connectedData],
                e.toolName,
                selectedField,
            );
            const nextLeft = result.listBoxOneData.map((item) => ({ ...item, [selectedField]: false }));
            const nextRight = result.listBoxTwoData.map((item) => ({ ...item, [selectedField]: false }));
            updateLists(nextLeft, nextRight);
        },
        [listState, rightColumnName, canTransfer, selectedField, updateLists],
    );

    const handleDragStart = useCallback(
        (e, listKey) => {
            if (!e?.dataItem || !listKey) return;
            if (!valueField) {
                try {
                    e.dataItem.dataCollection = listKey;
                } catch (err) {
                    // dataItem might be frozen
                }
            }
            draggedItemRef.current = e.dataItem;
            dragSourceRef.current = listKey;
        },
        [valueField],
    );

    const applyListBoxDrop = useCallback(
        (dropDataItem, dropListKey) => {
            const draggedItem = draggedItemRef.current;
            const dragListKey = valueField ? null : draggedItem?.dataCollection || dragSourceRef.current;
            if (!dropListKey) return;

            const leftShown = withDragKeys(searchedAttrs('left'));
            const rightShown = withDragKeys(searchedAttrs('right'));
            const leftFull = withDragKeys(leftList);
            const rightFull = withDragKeys(rightList);

            if (valueField) {
                if (!draggedItem) return;

                const dragIdxR = rightShown.findIndex((x) => x[valueField] === draggedItem[valueField]);
                const inRight = dragIdxR >= 0;
                const dropIdxL = dropDataItem
                    ? leftShown.findIndex((x) => x[valueField] === dropDataItem[valueField])
                    : -1;
                const dropInLeft = dropIdxL >= 0;
                const movingRightToLeft = inRight && (dropDataItem === null || dropInLeft);

                if (movingRightToLeft && !canTransfer('dragToLeft', null, draggedItem)) {
                    draggedItemRef.current = null;
                    dragSourceRef.current = null;
                    return;
                }

                const result = processListBoxDragAndDrop(
                    leftShown,
                    rightShown,
                    draggedItem,
                    dropDataItem,
                    dragValueField,
                );

                const mergedLeft = stripDragKeys(result.listBoxOneData);
                const mergedRight = stripDragKeys(result.listBoxTwoData);

                draggedItemRef.current = null;
                dragSourceRef.current = null;
                setRightEmptyDropActive(false);
                updateLists(mergedLeft, mergedRight);
                return;
            }

            if (!dragListKey) return;

            const sourceList = listState[dragListKey] || [];
            const selectedInSource = sourceList.filter((item) => item[selectedField]);
            const draggedIsSelected = draggedItem?.[selectedField];
            const isMultiDrag =
                dragListKey !== dropListKey &&
                selectedInSource.length > 1 &&
                draggedIsSelected &&
                selectedInSource.some(
                    (item) => item === draggedItem || item[textField] === draggedItem[textField],
                );

            const result = isMultiDrag
                ? processListBoxData(
                      listState[leftColumnName],
                      listState[rightColumnName],
                      dragListKey === leftColumnName && dropListKey === rightColumnName
                          ? 'transferTo'
                          : 'transferFrom',
                      selectedField,
                  )
                : processListBoxDragAndDrop(leftFull, rightFull, draggedItem, dropDataItem, dragValueField);

            draggedItemRef.current = null;
            dragSourceRef.current = null;

            const clearSel = dragListKey !== dropListKey;
            const nextLeft = clearSel
                ? result.listBoxOneData.map((item) => ({ ...item, [selectedField]: false }))
                : result.listBoxOneData;
            const nextRight = clearSel
                ? result.listBoxTwoData.map((item) => ({ ...item, [selectedField]: false }))
                : result.listBoxTwoData;

            setRightEmptyDropActive(false);
            updateLists(stripDragKeys(nextLeft), stripDragKeys(nextRight));
        },
        [
            searchedAttrs,
            withDragKeys,
            stripDragKeys,
            valueField,
            canTransfer,
            dragValueField,
            listState,
            selectedField,
            textField,
            leftColumnName,
            rightColumnName,
            leftList,
            rightList,
            updateLists,
        ],
    );

    const handleDrop = useCallback(
        (e, dropListKey) => {
            if (!dropListKey) return;
            applyListBoxDrop(e?.dataItem || null, dropListKey);
        },
        [applyListBoxDrop],
    );



    const handleItemDoubleClick = useCallback(
        (event, data, connectedData) => {
            const list = listState[data] || [];
            const clicked = event?.dataItem;
            if (!clicked) return;

            const clickedIndex = list.findIndex((item) => matchItem(item, clicked));
            if (clickedIndex === -1) return;

            if (
                attributeMode &&
                data === rightColumnName &&
                !canTransfer('doubleClickFromRight', null, list[clickedIndex])
            ) {
                return;
            }

            const markedList = list.map((item, index) => ({
                ...item,
                [selectedField]: index === clickedIndex,
            }));

            const result = processListBoxData(
                data === leftColumnName ? markedList : listState[connectedData],
                data === leftColumnName ? listState[connectedData] : markedList,
                data === leftColumnName ? 'transferTo' : 'transferFrom',
                selectedField,
            );

            const nextLeft = result.listBoxOneData.map((item) => ({ ...item, [selectedField]: false }));
            const nextRight = result.listBoxTwoData.map((item) => ({ ...item, [selectedField]: false }));
            updateLists(nextLeft, nextRight);
        },
        [
            listState,
            attributeMode,
            rightColumnName,
            canTransfer,
            matchItem,
            leftColumnName,
            selectedField,
            updateLists,
        ],
    );

    const handleLeftItemClick = useCallback(
        (e) => {
            if (e?.syntheticEvent?.detail === 2) {
                onItemActivate?.();
                handleItemDoubleClick(e, leftColumnName, rightColumnName);
                return;
            }
            onItemActivate?.();
            handleItemClick(e, leftColumnName, rightColumnName);
        },
        [onItemActivate, handleItemDoubleClick, handleItemClick, leftColumnName, rightColumnName],
    );

    const isFullLoading = loading && loadingMode === 'full';
    const isLeftLoading = loading && (loadingMode === 'left' || attributeMode);

    if (isFullLoading) {
        return <ListBoxNodataAvailable isNoData={false} />;
    }

    const leftShown = searchedAttrs('left');
    const rightShown = searchedAttrs('right');
    const leftShownWithKey = withDragKeys(leftShown);
    const rightShownWithKey = withDragKeys(rightShown);
    const rightStateWithKey = withDragKeys(rightList);

    const hasAnyData = leftList.length > 0 || rightList.length > 0 || isLeftLoading;

    if (!hasAnyData) {
        return (
            <ListBoxNodataAvailable
                message={emptyListMessage || nodataText}
            />
        );
    }

    const isLeftSearchEmpty = leftShown?.length > 0;
    const showToolbarOnLeft = !shiftToolbarOnLeftEmpty || leftList.length > 0;
    const showToolbarOnRight = shiftToolbarOnLeftEmpty && leftList.length === 0;

    const layoutClass =
        dynamicLayoutClass && attributeMode
            ? leftList.length === 0
                ? 'show_left'
                : 'show_right'
            : '';

    const renderLeftColumn = () => {
        if (isLeftLoading) {
            return <ListboxColumnSkeleton />;
        }

        const messageToShow = NO_ATTRIBUTES_FOUND;
        return (
            <div className="position-relative">
                <div>
                    <ListBox
                        data={leftShownWithKey}
                        textField={textField}
                        selectedField={selectedField}
                        valueField={valueField}
                        draggable={leftColumnProps.draggable ?? true}
                        onItemClick={handleLeftItemClick}
                        onDragStart={(e) => handleDragStart(e, leftColumnName)}
                        onDrop={(e) => handleDrop(e, leftColumnName)}
                        name={leftColumnName}
                        toolbar={
                            showToolbarOnLeft
                                ? () => (
                                      <ListBoxToolbar
                                          tools={TOOLBAR_TOOLS}
                                          data={leftShownWithKey}
                                          dataConnected={rightStateWithKey}
                                          onToolClick={(e) =>
                                              handleToolBarClick(e, leftColumnName, rightColumnName)
                                          }
                                      />
                                  )
                                : undefined
                        }
                        {...leftColumnProps}
                    />
                    {!attributeMode && (
                        <div className="d-grid">
                            <small className="text-right">
                                {COUNT}: {numberWithCommas(leftShown?.length || 0)}{' '}
                            </small>
                            <div className="align-items-center d-flex mt10">
                                <i
                                    className={`${circle_info_mini} icon-xs color-primary-blue mr5 cursor-default`}
                                ></i>
                                <small>{LISTBOX_NOTES_TEXT}</small>
                            </div>
                        </div>
                    )}
                </div>
                {leftShown.length === 0 && (
                    <div className="res-kendo-left-empty-overlay">
                        <NoDataAvailableRender message={messageToShow} />
                    </div>
                )}
            </div>
        );
    };

    const renderRightColumn = () => {
        const messageToShow = rightList.length === 0
            ? (customText || SELECT_LEFT_ATTRIBUTES)
            : NO_ATTRIBUTES_FOUND;

        return (
            <div className="position-relative">
                <ListBox
                    data={rightShownWithKey}
                    textField={textField}
                    selectedField={selectedField}
                    valueField={valueField}
                    draggable={rightColumnProps.draggable ?? true}
                    onItemClick={(e) => {
                        if (e?.syntheticEvent?.detail === 2) {
                            handleItemDoubleClick(e, rightColumnName, leftColumnName);
                            return;
                        }
                        handleItemClick(e, rightColumnName, leftColumnName);
                    }}
                    onDragStart={(e) => handleDragStart(e, rightColumnName)}
                    onDrop={(e) => handleDrop(e, rightColumnName)}
                    name={rightColumnName}
                    toolbar={
                        showToolbarOnRight
                            ? () => (
                                  <ListBoxToolbar
                                      tools={TOOLBAR_TOOLS}
                                      data={leftShownWithKey}
                                      dataConnected={rightStateWithKey}
                                      onToolClick={(e) =>
                                          handleToolBarClick(e, rightColumnName, leftColumnName)
                                      }
                                  />
                              )
                            : undefined
                    }
                    {...rightColumnProps}
                />
                {rightShown.length === 0 && (
                    <div className="res-kendo-right-empty-overlay">
                        <NoDataAvailableRender message={messageToShow} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            ref={wrapperRef}
            tabIndex={-1}
            onKeyDownCapture={handleListboxKeyDown}
            className={`reskendolist-wrapper ${wrapperClassName} ${layoutClass}`.trim()}
        >
            <div className="multiSelect">
                <div className="multiClm multiLftClm">
                    <h4 className="m0 py10">{leftHeaderTitle || AVAILABLE_ATTRIBUTES}</h4>
                    {leftList.length > SEARCH_THRESHOLD && (
                        <RSSearchField
                            searchedText={(text) => {
                                setSearch((prev) => ({ ...prev, leftAttributes: text }));
                            }}
                            debounceOnChange={true}
                            searchClassName={searchClassName}
                            isCloseSearch={isCloseSearch}
                            setIsCloseSearch={setIsCloseSearch}
                            disableSearchIcon={isLeftLoading}
                        />
                    )}
                    {renderLeftColumn()}
                    {leftNotes}
                </div>
                <div className="multiClm multiRghtClm">
                    <h4 className="m0 py10">{rightHeaderTitle || SELECTED_ATTRIBUTES}</h4>
                    {rightHeaderExtra}
                    {rightList.length > SEARCH_THRESHOLD && (
                        <RSSearchField
                            searchedText={(text) => {
                                setSearch((prev) => ({ ...prev, rightAttributes: text }));
                            }}
                            debounceOnChange={true}
                            searchClassName={rightSearchClassName || searchClassName}
                        />
                    )}
                    <div className="position-relative">
                        {renderRightColumn()}
                    </div>
                    {!attributeMode && rightShown.length > 0 && (
                        <small className="float-end">
                            {COUNT}: {numberWithCommas(rightShown.length || 0)}{' '}
                        </small>
                    )}
                    {showCount && attributeMode && rightShown.length > 0 && (
                        <small className="float-end">
                            {COUNT}: {numberWithCommas(rightShown.length || 0)}{' '}
                        </small>
                    )}
                    {rightNotes}
                </div>
            </div>
        </div>
    );
};

ResKendoListbox.propTypes = {
    rightColumnValues: PropTypes.array.isRequired,
    getSelectedData: PropTypes.func.isRequired,
    leftColumnValues: PropTypes.array,
    textField: PropTypes.string,
    rightColumnName: PropTypes.string,
    leftColumnName: PropTypes.string,
    leftNotes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    rightNotes: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    selectedField: PropTypes.string,
    loading: PropTypes.bool,
    leftColumnProps: PropTypes.object,
    rightColumnProps: PropTypes.object,
    wrapperClassName: PropTypes.string,
    leftHeaderTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightHeaderTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightHeaderExtra: PropTypes.node,
    shiftToolbarOnLeftEmpty: PropTypes.bool,
    attributeMode: PropTypes.bool,
    valueField: PropTypes.string,
    validateTransfer: PropTypes.func,
    onItemActivate: PropTypes.func,
    dynamicLayoutClass: PropTypes.bool,
    emptyListMessage: PropTypes.string,
    isCloseSearch: PropTypes.bool,
    setIsCloseSearch: PropTypes.func,
    rightTableFilter: PropTypes.string,
    rightSearchClassName: PropTypes.string,
    loadingMode: PropTypes.oneOf(['full', 'left']),
};

export default memo(ResKendoListbox);
