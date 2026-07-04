import { memo } from 'react';
import PropTypes from 'prop-types';

import { ComboBox } from '@progress/kendo-react-dropdowns';
import { get } from 'Utils/modules/lodashReplacements';
import { Controller } from 'react-hook-form';

const RSKendoComboBox = ({
    control,
    rules,
    name,
    defaultValue = '',
    data,
    value,
    onChange,
    className = '',
    required,
    handleChange = () => {},
    label,
    groupField,
    textField,
    dataItemKey,
    ...rest
}) => {
    return (
        <Controller
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            name={name}
            render={({ field: { onChange, ...restField }, fieldState: { error } }) => {
                const _isEmpty = get(error, 'message', '')?.length > 0;
                const errMsg = get(error, 'message', '');
                return (
                    <div
                        className={`rs-kendo-dropdownmenu-wrapper ${className} ${
                            _isEmpty ? 'errorContainer' : ''
                        } position-relative`}
                    >
                        <ComboBox
                            className={`rs-kendo-dropdown ${required ? 'rs-kendo-dropdown-required' : ''} `}
                            data={data}
                            label={_isEmpty ? errMsg : label}
                            groupField={groupField}
                            textField={textField}
                            dataItemKey={dataItemKey}
                            onChange={(e) => {
                                handleChange(e);
                                onChange(e);
                            }}
                            {...restField}
                            {...rest}
                        />
                    </div>
                );
            }}
        />
    );
};

RSKendoComboBox.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    className: PropTypes.string,
    clearErrors: PropTypes.func,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    rules: PropTypes.object,
    setError: PropTypes.func,
    setValue: PropTypes.func,
    textField: PropTypes.string,
    dataItemKey: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    handleChange: PropTypes.func,
};

export default memo(RSKendoComboBox);
