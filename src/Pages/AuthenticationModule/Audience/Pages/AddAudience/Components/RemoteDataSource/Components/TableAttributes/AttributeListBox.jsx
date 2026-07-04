import { NO_DATA_AVAILABEL, SELECT_LEFT_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { justify_dropdown_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ListBox, ListBoxToolbar, processListBoxData, processListBoxDragAndDrop } from '@progress/kendo-react-listbox';
import { size as _size } from 'Utils/modules/lodashReplacements';

import RSSearchField from 'Components/RSSearchField';
import { KendoIconDropdown } from 'Components/RSDropDown';
import { Component, getSelectedTables, addUniqueKey, removeUniqueKey } from './constant';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { useSelector } from 'react-redux';
import ListBoxNodataAvailable from 'Components/FormFields/Component/NoDataAvailableRender/ListBoxNodataAvailable';

const SELECTED_FIELD = 'selected';
const DRAG_VALUE_FIELD = 'uniqueKey';

const AttributeListBox = ({
    attributes,
    setAttributes,
    mySql,
    dispatchState,
    setValue,
    tableValue,
    setErr,
    isEdit = false,
}) => {
    const [search, setSearch] = useState({
        leftAttributes: '',
        rightAttributes: '',
    });
    const [closeSearch, setCloseSearch] = useState(false);
    const [selectedTableFromDropdown, setSelectedTableFromDropdown] = useState(null);

    const [ctrlKeyPressed, setCtrlKeyPressed] = useState(false);
    const [shiftKeyPressed, setShiftKeyPressed] = useState(false);

    const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
    const draggedItemRef = useRef(null);
    const { loading } = useSelector(({ globalstate }) => globalstate);

    const handleDragStart = useCallback((e) => {
        draggedItemRef.current = e.dataItem;
    }, []);

    const [rightEmptyDropActive, setRightEmptyDropActive] = useState(false);

    useEffect(() => {
        const platformIsMac = navigator.platform.toLowerCase().includes('mac');

        const handleKeyDown = (event) => {
            if ((platformIsMac && event.metaKey) || (!platformIsMac && event.ctrlKey)) {
                setCtrlKeyPressed(true);
            }
            if (event.shiftKey) {
                setShiftKeyPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (!((platformIsMac && event.metaKey) || (!platformIsMac && event.ctrlKey))) {
                setCtrlKeyPressed(false);
            }
            if (!event.shiftKey) {
                setShiftKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleItemClick = (event, data, connectedData) => {
        const currentItems = attributes[data];
        const clickedIndex = currentItems.findIndex(
            (item) => item.name === event.dataItem?.name && item?.table === event.dataItem?.table,
        );

        setAttributes({
            [data]: currentItems.map((item, index) => {
                let tItem = { ...item };
                const isClicked =
                    tItem.name === event.dataItem?.name &&
                    tItem?.table === event.dataItem?.table &&
                    (tItem?.columnFieldName && event?.dataItem?.columnFieldName
                        ? tItem?.columnFieldName === event?.dataItem?.columnFieldName
                        : true);

                if (shiftKeyPressed && lastSelectedIndex !== null) {
                    const start = Math.min(lastSelectedIndex, clickedIndex);
                    const end = Math.max(lastSelectedIndex, clickedIndex);
                    tItem[SELECTED_FIELD] =
                        (index >= start && index <= end) || (ctrlKeyPressed && tItem[SELECTED_FIELD]);
                } else if (isClicked) {
                    tItem[SELECTED_FIELD] = !tItem[SELECTED_FIELD];
                } else if (!ctrlKeyPressed) {
                    tItem[SELECTED_FIELD] = false;
                }

                return tItem;
            }),
            [connectedData]: attributes[connectedData].map((item) => {
                let tItem = { ...item };
                tItem[SELECTED_FIELD] = false;
                return tItem;
            }),
        });

        if (!ctrlKeyPressed && clickedIndex !== -1) {
            setLastSelectedIndex(clickedIndex);
        }
    };

    const handleItemDoubleMove = useCallback(
        (event, sourceKey) => {
            const isLeftSource = sourceKey === 'leftAttributes';
            const sourceList = attributes[sourceKey] || [];
            const targetItem = event?.dataItem;
            if (!targetItem) return;

            const clickedIndex = sourceList.findIndex(
                (item) =>
                    item.name === targetItem.name &&
                    item?.table === targetItem?.table &&
                    (item?.columnFieldName && targetItem?.columnFieldName
                        ? item?.columnFieldName === targetItem?.columnFieldName
                        : true),
            );
            if (clickedIndex === -1) return;

            if (!isLeftSource && sourceList[clickedIndex]?.table !== tableValue?.type) {
                setErr(true);
                setTimeout(() => {
                    setErr(false);
                }, 3000);
                return;
            }

            setErr(false);
            const markedSource = sourceList.map((item, index) => ({
                ...item,
                [SELECTED_FIELD]: index === clickedIndex,
            }));
            const result = processListBoxData(
                isLeftSource ? markedSource : attributes.leftAttributes,
                isLeftSource ? attributes.rightAttributes : markedSource,
                isLeftSource ? 'transferTo' : 'transferFrom',
                SELECTED_FIELD,
            );
            setAttributes({
                leftAttributes: result.listBoxOneData,
                rightAttributes: result.listBoxTwoData,
            });
        },
        [attributes, setAttributes, setErr, tableValue?.type],
    );

    const handleToolBarClick = (e) => {
        if (e.toolName === 'transferFrom') {
            const selectedAttributes = attributes?.rightAttributes?.filter((e) => e?.selected === true);
            const selectedTables = selectedAttributes?.map((ele) => ele?.table);
            const uniqueSelectedTables = [...new Set(selectedTables)];
            const status = uniqueSelectedTables.every((item) => item === tableValue?.type);
            if (!status) {
                setErr(true);
                setTimeout(() => {
                    setErr(false);
                }, 3000);
                return;
            }
        }
        setErr(false);
        let toolName = e.toolName || '';
        let result = processListBoxData(
            attributes.leftAttributes,
            attributes.rightAttributes,
            toolName,
            SELECTED_FIELD,
        );
        setAttributes({
            leftAttributes: result.listBoxOneData,
            rightAttributes: result.listBoxTwoData,
        });
    };

    const reorderRightAttributesByTable = (attrs, selectedTable) => {
        if (!selectedTable || !attrs?.length) return attrs;
        const selectedTableAttrs = attrs.filter((attr) => attr.table === selectedTable);
        const otherAttrs = attrs.filter((attr) => attr.table !== selectedTable);
        return [...selectedTableAttrs, ...otherAttrs];
    };
    const searchedAttrs = (val = 'left') => {
        const finder = `${val}Attributes`;
        let filteredAttrs = attributes[finder];
        if (search[finder]) {
            filteredAttrs = filteredAttrs?.filter((attr) =>
                attr.name?.toLowerCase()?.includes(search[finder].toLowerCase()),
            );
        }
        if (val === 'right' && selectedTableFromDropdown) {
            filteredAttrs = reorderRightAttributesByTable(filteredAttrs, selectedTableFromDropdown);
        }
        return filteredAttrs;
    };

    const leftShown = searchedAttrs('left');
    const rightShown = searchedAttrs('right');
    const leftAttributesWithKey = addUniqueKey(leftShown, DRAG_VALUE_FIELD);
    const rightAttributesWithKey = addUniqueKey(rightShown, DRAG_VALUE_FIELD);
    const rightStateWithKey = addUniqueKey(attributes.rightAttributes, DRAG_VALUE_FIELD);

    const applyAttributeListDrop = useCallback(
        (dropDataItem) => {
            const dragItem = draggedItemRef.current;
            draggedItemRef.current = null;
            if (!dragItem) return;

            const dragIdxR = rightAttributesWithKey.findIndex(
                (x) => x[DRAG_VALUE_FIELD] === dragItem[DRAG_VALUE_FIELD],
            );
            const inRight = dragIdxR >= 0;
            const dropIdxL = dropDataItem
                ? leftAttributesWithKey.findIndex((x) => x[DRAG_VALUE_FIELD] === dropDataItem[DRAG_VALUE_FIELD])
                : -1;
            const dropInLeft = dropIdxL >= 0;
            const movingRightToLeft = inRight && (dropDataItem === null || dropInLeft);

            if (movingRightToLeft && dragItem?.table !== tableValue?.type) {
                setErr(true);
                setTimeout(() => {
                    setErr(false);
                }, 3000);
                return;
            }

            setErr(false);

            const result = processListBoxDragAndDrop(
                leftAttributesWithKey,
                rightAttributesWithKey,
                dragItem,
                dropDataItem,
                DRAG_VALUE_FIELD,
            );
            setAttributes({
                leftAttributes: removeUniqueKey(result.listBoxOneData, DRAG_VALUE_FIELD),
                rightAttributes: removeUniqueKey(result.listBoxTwoData, DRAG_VALUE_FIELD),
            });
        },
        [
            attributes,
            setAttributes,
            setErr,
            tableValue?.type,
            leftAttributesWithKey,
            rightAttributesWithKey,
        ],
    );

    const handleDrop = useCallback(
        (e) => {
            applyAttributeListDrop(e.dataItem);
        },
        [applyAttributeListDrop],
    );

    const handleEmptyRightNativeDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleEmptyRightNativeDrop = useCallback(
        (e) => {
            e.preventDefault();
            setRightEmptyDropActive(false);
            applyAttributeListDrop(null);
        },
        [applyAttributeListDrop],
    );

    const handleDropdownItemClick = (e) => {
        const selectedTable = e.item?.table;
        if (selectedTable) {
            setSelectedTableFromDropdown(selectedTable);
        }
    };

    useEffect(() => {
        if (!tableValue?.type) return;
        setCloseSearch(true);
        setSearch((prev) => ({
            ...prev,
            leftAttributes: '',
            rightAttributes: '',
        }));
        setSelectedTableFromDropdown(null);
    }, [tableValue?.type]);

    useEffect(() => {
        const clearRightDropHighlight = () => setRightEmptyDropActive(false);
        document.addEventListener('dragend', clearRightDropHighlight);
        return () => document.removeEventListener('dragend', clearRightDropHighlight);
    }, []);

    useEffect(() => {
        if (attributes?.rightAttributes?.length <= 6 && search?.rightAttributes) {
            setSearch((prev) => ({
                ...prev,
                rightAttributes: '',
            }));
        }
        if (attributes?.leftAttributes?.length <= 6 && search?.leftAttributes) {
            setSearch((prev) => ({
                ...prev,
                leftAttributes: '',
            }));
        }
    }, [attributes?.rightAttributes?.length, attributes?.leftAttributes?.length]);

    return (
        <div className={`kendolist-wrapper ${attributes?.leftAttributes.length === 0 ? 'show_left' : 'show_right'}`}>
            <div className="multiSelect">
                {attributes?.leftAttributes?.length || attributes?.rightAttributes?.length ? (
                    <>
                        <div className="multiClm multiLftClm">
                            <h4 className="m0 py10">Available columns/attributes</h4>
                            {attributes.leftAttributes?.length > 6 && (
                                <RSSearchField
                                    searchedText={(text) => {
                                        setSearch((prev) => ({ ...prev, leftAttributes: text }));
                                    }}
                                    debounceOnChange={true}
                                    isCloseSearch={closeSearch}
                                    setIsCloseSearch={setCloseSearch}
                                />
                            )}
                            {leftShown.length > 0 ? (
                                <ListBox
                                    data={leftAttributesWithKey}
                                    selectedField={SELECTED_FIELD}
                                    draggable
                                    onDragStart={handleDragStart}
                                    onDrop={handleDrop}
                                    onItemClick={(e) => {
                                        if (e?.syntheticEvent?.detail === 2) {
                                            dispatchState({ type: 'UPDATE', field: 'firstCheck', payload: false });
                                            setValue('isTouched', true);
                                            handleItemDoubleMove(e, 'leftAttributes');
                                            return;
                                        }
                                        dispatchState({ type: 'UPDATE', field: 'firstCheck', payload: false });
                                        setValue('isTouched', true);
                                        handleItemClick(e, 'leftAttributes', 'rightAttributes');
                                    }}
                                    textField="name"
                                    valueField={DRAG_VALUE_FIELD}
                                    name="leftAttributes"
                                    toolbar={() => {
                                        return (
                                            <ListBoxToolbar
                                                tools={['transferTo', 'transferFrom']}
                                                data={leftAttributesWithKey}
                                                dataConnected={rightStateWithKey}
                                                 onToolClick={handleToolBarClick}
                                            />
                                        );
                                    }}
                                    item={(props) => Component(props)}
                                />
                            ) : (
                                <div className="multiClm k-listbox k-list border">
                                    <NoDataAvailableRender
                                        className={''}
                                        message={
                                            search.leftAttributes && attributes?.leftAttributes?.length
                                                ? NO_DATA_AVAILABEL
                                                : undefined
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <div className="multiClm multiRghtClm">
                            <h4 className="m0 py10">
                                Selected columns/attributes ({attributes.rightAttributes?.length})
                            </h4>
                            <div className="attributeDropdown">
                                <KendoIconDropdown
                                    icon={` ${justify_dropdown_mini} icon-xs cp color-primary-blue`}
                                    data={getSelectedTables(mySql, tableValue)}
                                    itemRender={({ item }) => (
                                        <label>
                                            {item?.table} - {item?.selectedKey}{' '}
                                            {item?.dateType && `- ${item?.dateType}`}{' '}
                                        </label>
                                    )}
                                    className={`${!_size(mySql) ? 'click-off' : ''} `}
                                    popupSettings={{
                                        popupClass: 'cntLeftToRight',
                                    }}
                                    dir={'rtl'}
                                    onItemClick={handleDropdownItemClick}
                                />
                            </div>
                            {attributes.rightAttributes?.length > 6 && (
                                <RSSearchField
                                    searchedText={(text) => {
                                        setSearch((prev) => ({ ...prev, rightAttributes: text }));
                                    }}
                                    debounceOnChange={true}
                                    searchClassName={'mr30 dataExchange_rs-search_attribute'}
                                />
                            )}
                            {rightShown.length > 0 ? (
                                <ListBox
                                    textField="name"
                                    valueField={DRAG_VALUE_FIELD}
                                    name="rightAttributes"
                                    data={rightAttributesWithKey}
                                    selectedField={SELECTED_FIELD}
                                    draggable
                                    onDragStart={handleDragStart}
                                    onDrop={handleDrop}
                                    onItemClick={(e) => {
                                        if (e?.syntheticEvent?.detail === 2) {
                                            handleItemDoubleMove(e, 'rightAttributes');
                                            return;
                                        }
                                        handleItemClick(e, 'rightAttributes', 'leftAttributes');
                                    }}
                                    item={(props) => Component(props, 'table')}
                                    toolbar={
                                        attributes?.leftAttributes?.length === 0
                                            ? () => (
                                                  <ListBoxToolbar
                                                      tools={['transferTo', 'transferFrom']}
                                                      data={leftAttributesWithKey}
                                                      dataConnected={rightStateWithKey}
                                                      onToolClick={handleToolBarClick}
                                                  />
                                              )
                                            : undefined
                                    }
                                />
                            ) : (
                                <div className="k-listbox attribute-right-empty-host">
                                    {attributes?.leftAttributes?.length === 0 && (
                                        <ListBoxToolbar
                                            tools={['transferTo', 'transferFrom']}
                                            data={leftAttributesWithKey}
                                            dataConnected={rightStateWithKey}
                                            onToolClick={handleToolBarClick}
                                        />
                                    )}
                                    <div
                                        role="region"
                                        aria-label={SELECT_LEFT_ATTRIBUTES}
                                        className={`attribute-right-empty-dropzone k-list border${
                                            rightEmptyDropActive ? ' is-drag-over' : ''
                                        }`}
                                        onDragEnter={(e) => {
                                            e.preventDefault();
                                            setRightEmptyDropActive(true);
                                        }}
                                        onDragOver={handleEmptyRightNativeDragOver}
                                        onDragLeave={(e) => {
                                            const { currentTarget, relatedTarget } = e;
                                            if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
                                                setRightEmptyDropActive(false);
                                            }
                                        }}
                                        onDrop={handleEmptyRightNativeDrop}
                                    >
                                        <NoDataAvailableRender message={SELECT_LEFT_ATTRIBUTES} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (attributes?.leftAttributes?.length === 0 || attributes?.rightAttributes?.length === 0) &&
                  !loading ? (
                    <ListBoxNodataAvailable message="No attributes available for this table" />
                ) : null}
            </div>
        </div>
    );
};

export default memo(AttributeListBox);
