import { NO_RESULTS_FOUND } from 'Constants/GlobalConstant/ValidationMessage';
import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import { DropdownButton, Dropdown } from 'react-bootstrap';
const RSMultiSelectNew = ({
    data = [],
    fieldKey = 'name',
    isObject = false,
    value = [],
    onSelect = () => {},
    label = 'Select',
    alignRight = false,
    disabled = false,
}) => {
    const [selectedItems, setSelectedItems] = useState(value);

    // Sync when external value is reset (e.g. tag removed or clear all)
    const valueKey = JSON.stringify(value);
    useEffect(() => {
        setSelectedItems(value);
    }, [valueKey]);

    const getDisplayValue = (item) =>
        isObject ? _get(item, fieldKey, '') : String(item ?? '');

    const getItemKey = (item) =>
        isObject ? _get(item, fieldKey, '') : String(item ?? '');

    const isItemSelected = (item) =>
        selectedItems.some((s) => getItemKey(s) === getItemKey(item));

    const handleItemClick = (item) => {
        const updated = isItemSelected(item)
            ? selectedItems.filter((s) => getItemKey(s) !== getItemKey(item))
            : [...selectedItems, item];
        setSelectedItems(updated);
        onSelect(updated);
    };

    return (
        <div
            className="rs-bootstrap-dropdown"
            style={{ '--rs-dropdown-item-count': data.length }}
        >
            <DropdownButton
                title={label}
                className="rs-dropdown"
                align={alignRight ? 'end' : 'start'}
                disabled={disabled}
                renderMenuOnMount
            >
                <div className="css-scrollbar custome-dropdown-scroll">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <Dropdown.Item
                                key={index}
                                className={`bs-dd-item ${isItemSelected(item) ? 'active' : ''}`}
                                style={{
                                    pointerEvents: 'auto',
                                    '--rs-dropdown-item-index': index,
                                }}
                                onClick={() => handleItemClick(item)}
                            >
                                {getDisplayValue(item)}
                            </Dropdown.Item>
                        ))
                    ) : (
                        <div className="text-center pe-none py-2 text-muted">
                            {NO_RESULTS_FOUND}
                        </div>
                    )}
                </div>
            </DropdownButton>
        </div>
    );
};

RSMultiSelectNew.propTypes = {
    data: PropTypes.array.isRequired,
    fieldKey: PropTypes.string,
    isObject: PropTypes.bool,
    value: PropTypes.array,
    onSelect: PropTypes.func,
    label: PropTypes.string,
    alignRight: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default memo(RSMultiSelectNew);
