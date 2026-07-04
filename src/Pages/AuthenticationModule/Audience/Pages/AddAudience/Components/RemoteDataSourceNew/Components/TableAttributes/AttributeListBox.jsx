import { SELECT_LEFT_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { justify_dropdown_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { size as _size } from 'Utils/modules/lodashReplacements';

import { KendoIconDropdown } from 'Components/RSDropDown';
import ResKendoListbox from 'Pages/KendoDocs/CommonComponents/ResKendoListbox';
import { Component, getSelectedTables } from './constant';
import { RDSContext } from '../constants';

const DRAG_VALUE_FIELD = 'uniqueKey';
const TABLE_MISMATCH_ERROR_FIELD = 'tableMismatchError';

const AttributeListBox = ({ attributes, setAttributes, dispatchState, loading = false, loadingMode = 'left' }) => {
    const { reducerState } = useContext(RDSContext);
    const { finalConfig } = reducerState;
    const { watch } = useFormContext();
    const tableValue = watch('table');

    const [closeSearch, setCloseSearch] = useState(false);
    const [selectedTableFromDropdown, setSelectedTableFromDropdown] = useState(null);

    const showTableMismatchError = useCallback(() => {
        dispatchState({ type: 'UPDATE', field: TABLE_MISMATCH_ERROR_FIELD, payload: true });
        setTimeout(() => {
            dispatchState({ type: 'UPDATE', field: TABLE_MISMATCH_ERROR_FIELD, payload: false });
        }, 3000);
    }, [dispatchState]);

    const validateRightToLeftTransfer = useCallback(
        (items = []) => {
            if (!tableValue?.type) return true;
            const tables = [...new Set(items.map((item) => item?.table))];
            const isValid = tables.every((table) => table === tableValue.type);
            if (!isValid) {
                showTableMismatchError();
            }
            return isValid;
        },
        [tableValue?.type, showTableMismatchError],
    );

    const validateTransfer = useCallback(
        ({ action, items, draggedItem }) => {
            if (action === 'toolbarTransferFrom') {
                return validateRightToLeftTransfer(items);
            }
            if (action === 'dragToLeft' || action === 'doubleClickFromRight') {
                return validateRightToLeftTransfer(draggedItem ? [draggedItem] : items);
            }
            return true;
        },
        [validateRightToLeftTransfer],
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
        setSelectedTableFromDropdown(null);
    }, [tableValue?.type]);

    return (
        <ResKendoListbox
            attributeMode
            dynamicLayoutClass
            loading={loading}
            loadingMode={loading ? loadingMode : undefined}
            leftColumnValues={attributes.leftAttributes}
            rightColumnValues={attributes.rightAttributes}
            leftColumnName="leftAttributes"
            rightColumnName="rightAttributes"
            getSelectedData={(data) => {
                dispatchState({ type: 'UPDATE', field: TABLE_MISMATCH_ERROR_FIELD, payload: false });
                setAttributes({
                    leftAttributes: data.leftAttributes,
                    rightAttributes: data.rightAttributes,
                });
            }}
            textField="name"
            valueField={DRAG_VALUE_FIELD}
            validateTransfer={validateTransfer}
            shiftToolbarOnLeftEmpty
            emptyListMessage="No attributes available for this table"
            isCloseSearch={closeSearch}
            setIsCloseSearch={setCloseSearch}
            rightTableFilter={selectedTableFromDropdown}
            rightSearchClassName="mr30 dataExchange_rs-search_attribute"
            leftHeaderTitle="Available columns/attributes"
            rightHeaderTitle={`Selected columns/attributes (${attributes.rightAttributes?.length})`}
            customText={SELECT_LEFT_ATTRIBUTES}
            leftColumnProps={{
                item: (props) => Component(props),
            }}
            rightColumnProps={{
                item: (props) => Component(props, 'table'),
            }}
            rightHeaderExtra={
                <div className="attributeDropdown">
                    <KendoIconDropdown
                        icon={` ${justify_dropdown_mini} icon-xs cp color-primary-blue`}
                        data={getSelectedTables(finalConfig)}
                        itemRender={({ item }) => (
                            <label>
                                {item?.table}
                                {item?.count > 0 && ` (${item.count})`}
                                {item?.selectedKey && ` - ${item.selectedKey}`}
                                {item?.dateType && ` - ${item.dateType}`}
                            </label>
                        )}
                        className={`${_size(finalConfig) ? '' : 'click-off'} `}
                        popupSettings={{
                            popupClass: 'cntLeftToRight',
                        }}
                        dir="rtl"
                        onItemClick={handleDropdownItemClick}
                    />
                </div>
            }
        />
    );
};

export default memo(AttributeListBox);
