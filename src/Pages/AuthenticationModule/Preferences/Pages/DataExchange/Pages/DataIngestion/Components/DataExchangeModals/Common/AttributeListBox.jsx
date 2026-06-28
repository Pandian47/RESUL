import { justify_dropdown_mini, key_fill_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ListBox, ListBoxToolbar, processListBoxData, processListBoxDragAndDrop } from '@progress/kendo-react-listbox';

import { SELECT_LEFT_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';

import RSSearchField from 'Components/RSSearchField';
import { KendoIconDropdown } from 'Components/RSDropDown';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const SELECTED_FIELD = 'selected';
const LEFT_KEY = 'leftAttributes';
const RIGHT_KEY = 'rightAttributes';
const TEXT_FIELD = 'name';
const DRAG_VALUE_FIELD = '_listboxKey';

const getItemKey = (item) =>
    `${item?.[TEXT_FIELD] ?? ''}::${item?.table ?? ''}::${item?.columnFieldName ?? ''}`;

const ensureListboxKeys = (items = []) =>
    items.map((item) => ({
        ...item,
        [DRAG_VALUE_FIELD]: item[DRAG_VALUE_FIELD] ?? getItemKey(item),
    }));

const stripDragMeta = (items = []) =>
    items.map(({ dataCollection, ...item }) => item);

const normalizeAttributes = ({ leftAttributes = [], rightAttributes = [] }) => ({
    leftAttributes: ensureListboxKeys(stripDragMeta(leftAttributes)),
    rightAttributes: ensureListboxKeys(stripDragMeta(rightAttributes)),
});

const itemsMatch = (a, b) => getItemKey(a) === getItemKey(b);

const AttributeListBox = ({ attributes, setAttributes, dropval }) => {
    const [search, setSearch] = useState({
        leftAttributes: '',
        rightAttributes: '',
    });
    const [ctrlKeyPressed, setCtrlKeyPressed] = useState(false);
    const [rightEmptyDropActive, setRightEmptyDropActive] = useState(false);
    const dragMetaRef = useRef(null);

    useEffect(() => {
        const isMac = navigator.platform.toLowerCase().includes('mac');

        const handleKeyDown = (event) => {
            if ((isMac && event.metaKey) || (!isMac && event.ctrlKey)) {
                setCtrlKeyPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (!((isMac && event.metaKey) || (!isMac && event.ctrlKey))) {
                setCtrlKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const clearRightDropHighlight = () => setRightEmptyDropActive(false);
        document.addEventListener('dragend', clearRightDropHighlight);
        return () => document.removeEventListener('dragend', clearRightDropHighlight);
    }, []);

    const commitAttributes = useCallback(
        (nextAttributes, clearSelection = false) => {
            const normalized = normalizeAttributes(nextAttributes);
            if (clearSelection) {
                setAttributes({
                    leftAttributes: normalized.leftAttributes.map((item) => ({
                        ...item,
                        [SELECTED_FIELD]: false,
                    })),
                    rightAttributes: normalized.rightAttributes.map((item) => ({
                        ...item,
                        [SELECTED_FIELD]: false,
                    })),
                });
                return;
            }
            setAttributes(normalized);
        },
        [setAttributes],
    );

    const handleItemClick = (event, data, connectedData) => {
        const clickedItem = event.dataItem;
        commitAttributes({
            [data]: attributes[data].map((item) => {
                const tItem = { ...item };
                if (itemsMatch(tItem, clickedItem)) {
                    tItem[SELECTED_FIELD] = !tItem[SELECTED_FIELD];
                } else if (!ctrlKeyPressed) {
                    tItem[SELECTED_FIELD] = false;
                }
                return tItem;
            }),
            [connectedData]: attributes[connectedData].map((item) => ({
                ...item,
                [SELECTED_FIELD]: false,
            })),
        });
    };

    const handleToolBarClick = (e) => {
        const toolName = e.toolName || '';
        const left = ensureListboxKeys(attributes.leftAttributes);
        const right = ensureListboxKeys(attributes.rightAttributes);
        const result = processListBoxData(left, right, toolName, SELECTED_FIELD);
        commitAttributes(
            {
                leftAttributes: result.listBoxOneData,
                rightAttributes: result.listBoxTwoData,
            },
            true,
        );
    };

    const handleDragStart = useCallback((e) => {
        const listKey = e?.target?.props?.name;
        if (!e?.dataItem || !listKey) return;
        dragMetaRef.current = {
            listKey,
            itemKey: e.dataItem[DRAG_VALUE_FIELD] ?? getItemKey(e.dataItem),
        };
    }, []);

    const resolveListKey = useCallback(
        (dataItem) => {
            const itemKey = dataItem?.[DRAG_VALUE_FIELD] ?? getItemKey(dataItem);
            if (attributes[RIGHT_KEY]?.some((item) => (item[DRAG_VALUE_FIELD] ?? getItemKey(item)) === itemKey)) {
                return RIGHT_KEY;
            }
            if (attributes[LEFT_KEY]?.some((item) => (item[DRAG_VALUE_FIELD] ?? getItemKey(item)) === itemKey)) {
                return LEFT_KEY;
            }
            return null;
        },
        [attributes],
    );

    const applyListBoxDrop = useCallback(
        (dropDataItem, dropListKey) => {
            const dragMeta = dragMetaRef.current;
            dragMetaRef.current = null;
            if (!dropListKey) return;

            const dragListKey = dragMeta?.listKey ?? null;
            const left = ensureListboxKeys(attributes[LEFT_KEY]);
            const right = ensureListboxKeys(attributes[RIGHT_KEY]);

            const findByDragKey = (list, itemKey) =>
                list?.find((item) => (item[DRAG_VALUE_FIELD] ?? getItemKey(item)) === itemKey);

            const draggedItem = dragMeta?.itemKey
                ? findByDragKey(attributes[dragListKey], dragMeta.itemKey) ??
                  findByDragKey(attributes[LEFT_KEY], dragMeta.itemKey) ??
                  findByDragKey(attributes[RIGHT_KEY], dragMeta.itemKey)
                : null;

            const resolvedDragListKey = dragListKey ?? (draggedItem ? resolveListKey(draggedItem) : null);
            if (!resolvedDragListKey || !draggedItem) return;

            const sourceList = resolvedDragListKey === LEFT_KEY ? left : right;
            const selectedInSource = sourceList.filter((item) => item[SELECTED_FIELD]);
            const draggedIsSelected = draggedItem[SELECTED_FIELD];
            const isMultiDrag =
                resolvedDragListKey !== dropListKey &&
                selectedInSource.length > 1 &&
                draggedIsSelected &&
                selectedInSource.some((item) => itemsMatch(item, draggedItem));

            const resolvedDropItem = dropDataItem
                ? (dropListKey === LEFT_KEY ? left : right).find((item) => itemsMatch(item, dropDataItem)) ??
                  dropDataItem
                : null;

            const result = isMultiDrag
                ? processListBoxData(
                      left,
                      right,
                      resolvedDragListKey === LEFT_KEY && dropListKey === RIGHT_KEY ? 'transferTo' : 'transferFrom',
                      SELECTED_FIELD,
                  )
                : processListBoxDragAndDrop(left, right, draggedItem, resolvedDropItem, DRAG_VALUE_FIELD);

            commitAttributes(
                {
                    leftAttributes: result.listBoxOneData,
                    rightAttributes: result.listBoxTwoData,
                },
                resolvedDragListKey !== dropListKey,
            );
            setRightEmptyDropActive(false);
        },
        [attributes, commitAttributes, resolveListKey],
    );

    const handleDrop = useCallback(
        (e) => {
            const dropListKey = e?.target?.props?.name;
            if (!dropListKey) return;
            applyListBoxDrop(e.dataItem ?? null, dropListKey);
        },
        [applyListBoxDrop],
    );

    const handleEmptyRightNativeDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleEmptyRightNativeDrop = useCallback(
        (e) => {
            e.preventDefault();
            applyListBoxDrop(null, RIGHT_KEY);
        },
        [applyListBoxDrop],
    );

    const searchedAttrs = (val = 'left') => {
        const finder = `${val}Attributes`;
        const list = ensureListboxKeys(attributes[`${val}Attributes`]);
        if (search[finder]) {
            return list.filter((attr) => attr.name?.toLowerCase()?.includes(search[finder].toLowerCase()));
        }
        return list;
    };

    return (
        <div className="new-popup-drag kendolist-wrapper">
            <div className="multiSelect">
                {attributes?.leftAttributes?.length || attributes?.rightAttributes?.length ? (
                    <>
                        <div className="multiClm multiLftClm">
                            <h4 className="m0 py10">Available columns/attributes</h4>
                            {attributes?.leftAttributes?.length > 6 && (
                                <RSSearchField
                                    searchedText={(text) => {
                                        setSearch((prev) => ({ ...prev, leftAttributes: text }));
                                    }}
                                    debounceOnChange={true}
                                />
                            )}
                            {searchedAttrs('left')?.length ? (
                                <ListBox
                                    data={searchedAttrs('left')}
                                    selectedField={SELECTED_FIELD}
                                    onItemClick={(e) => {
                                        handleItemClick(e, LEFT_KEY, RIGHT_KEY);
                                    }}
                                    onDragStart={handleDragStart}
                                    onDrop={handleDrop}
                                    textField={TEXT_FIELD}
                                    name={LEFT_KEY}
                                    toolbar={() => {
                                        return (
                                            <ListBoxToolbar
                                                tools={['transferTo', 'transferFrom']}
                                                data={searchedAttrs('left')}
                                                dataConnected={ensureListboxKeys(attributes.rightAttributes)}
                                                onToolClick={handleToolBarClick}
                                            />
                                        );
                                    }}
                                    item={(props) => Component(props)}
                                />
                            ) : (
                                <div className="multiClm k-listbox k-list border">
                                    <NoDataAvailableRender />
                                </div>
                            )}
                        </div>
                        <div className="multiClm multiRghtClm">
                            <h4 className="m0 py10">Selected columns/attributes</h4>
                            <KendoIconDropdown
                                icon={` ${justify_dropdown_mini} icon-xs cp color-primary-blue`}
                                data={dropval}
                                itemRender={({ item }) => <label>{item?.selectedKey} </label>}
                                popupSettings={{
                                    popupClass: 'cntLeftToRight',
                                }}
                                dir={'rtl'}
                            />
                            {attributes.rightAttributes?.length > 6 && (
                                <RSSearchField
                                    searchedText={(text) => {
                                        setSearch((prev) => ({ ...prev, rightAttributes: text }));
                                    }}
                                    debounceOnChange={true}
                                    searchClassName={'mr30 dataExchange_rs-search_attribute'}
                                />
                            )}
                            {searchedAttrs('right')?.length ? (
                                <ListBox
                                    textField={TEXT_FIELD}
                                    name={RIGHT_KEY}
                                    data={searchedAttrs('right')}
                                    selectedField={SELECTED_FIELD}
                                    onItemClick={(e) => {
                                        handleItemClick(e, RIGHT_KEY, LEFT_KEY);
                                    }}
                                    onDragStart={handleDragStart}
                                    onDrop={handleDrop}
                                    item={(props) => Component(props, 'table')}
                                />
                            ) : (
                                <div className="k-listbox attribute-right-empty-host">
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
                                        <NoDataAvailableRender message={SELECT_LEFT_ATTRIBUTES} isShowIcon={false} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <NoDataAvailableRender
                        className="d-flex position-relative text-align-center justify-content-center"
                        message="No attributes available for this table"
                    />
                )}
            </div>
        </div>
    );
};
const Component = ({ dataItem, ...others }, table) => {
    return (
        <li {...others} key={others.id} className={`${others.className} d-block`}>
            {table && <i className="small">{table && dataItem?.table}</i>}
            {dataItem?.name}
            {dataItem?.primaryKey && <i className={`${key_fill_mini} icon-xs ml10 color-primaryKey`}></i>}
        </li>
    );
};
export default memo(AttributeListBox);
