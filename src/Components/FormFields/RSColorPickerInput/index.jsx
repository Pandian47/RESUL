import { colorpicker_bg_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useState } from 'react';
import { Controller } from 'react-hook-form';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import RSColorPicker from 'Components/ColorPicker';
const RSColorPickerInput = ({
    className = '',
    name,
    isNewTheme = true,
    rules,
    control,
    required,
    defaultValue = '#ffffff',
    onBlur,
    placeholder = 'Color',
    onFocus,
    handleOnchange = () => {},
    handleOnBlur = () => {},
    handleOnFocus = () => {},
    isError = true,
    label = '',
    disabled,
    classWrapper,
    onSelect,
    colorPickerIcon = colorpicker_bg_medium,
    pickerIconColor = 'color-primary-blue',
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);

    // Helper function to validate and normalize hex color
    const validateAndNormalizeColor = (value) => {
        if (!value || value === '') return null;
        
        // Remove any whitespace
        value = value.trim();
        
        // If it starts with #, validate hex format
        if (value.startsWith('#')) {
            const hexPattern = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
            if (hexPattern.test(value)) {
                return value.toLowerCase();
            }
            // If incomplete but valid format, return as-is for typing
            const partialPattern = /^#[0-9A-Fa-f]{0,8}$/;
            if (partialPattern.test(value)) {
                return value;
            }
        } else {
            // If doesn't start with #, try to add it
            const hexPattern = /^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/;
            if (hexPattern.test(value)) {
                return '#' + value.toLowerCase();
            }
            // If incomplete but valid format, add # and return
            const partialPattern = /^[0-9A-Fa-f]{0,8}$/;
            if (partialPattern.test(value)) {
                return '#' + value;
            }
        }
        return null;
    };

    return (
        <Controller
            rules={rules}
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field, fieldState: { error } }) => {
                const _isEmpty = get(error, 'message', '')?.length > 0;
                const errMsg = get(error, 'message', '');
                // Get raw value for input display
                const rawColorValue = field.value || '';
                // Normalize the color value for the color picker (only if it's a complete valid color)
                const normalizedColorValue = validateAndNormalizeColor(rawColorValue);
                const colorValue = (normalizedColorValue && normalizedColorValue.length >= 7)
                    ? (normalizedColorValue.length === 7 ? normalizedColorValue : normalizedColorValue.substring(0, 7))
                    : (rawColorValue || defaultValue);

                const handleColorSelect = (color) => {
                    field.onChange(color);
                    if (onSelect) {
                        onSelect(color);
                    }
                };

                // Handle input change with validation
                const handleInputChange = (e) => {
                    let value = e.target.value;
                    
                    if (value === '') {
                        field.onChange('');
                        handleOnchange(e);
                        if (onSelect) {
                            onSelect('');
                        }
                        return;
                    }
                    
                    // Allow hex characters only
                    if (value.startsWith('#')) {
                        const hexPattern = /^#[0-9A-Fa-f]*$/;
                        if (hexPattern.test(value) && value.length <= 9) {
                            field.onChange(value);
                            handleOnchange(e);
                            
                            // If it's a complete valid hex color (#RRGGBB or #RRGGBBAA), trigger onSelect immediately
                            const normalized = validateAndNormalizeColor(value);
                            if (normalized && (normalized.length === 7 || normalized.length === 9)) {
                                const finalColor = normalized.length === 9 ? normalized.substring(0, 7) : normalized;
                                if (onSelect) {
                                    onSelect(finalColor);
                                }
                            }
                        }
                    } else {
                        // If doesn't start with #, allow typing hex chars and auto-add #
                        const hexPattern = /^[0-9A-Fa-f]*$/;
                        if (hexPattern.test(value) && value.length <= 8) {
                            const newValue = '#' + value;
                            field.onChange(newValue);
                            handleOnchange(e);
                            
                            // If it's a complete valid hex color, trigger onSelect immediately
                            if (value.length === 6 || value.length === 8) {
                                const finalColor = '#' + value.substring(0, 6).toLowerCase();
                                if (onSelect) {
                                    onSelect(finalColor);
                                }
                            }
                        } else if (value.length === 0) {
                            field.onChange('');
                            handleOnchange(e);
                            if (onSelect) {
                                onSelect('');
                            }
                        }
                    }
                };

                // Handle blur - validate and normalize the color
                const handleInputBlur = (e) => {
                    setIsFocused(false);
                    const value = e.target.value;
                    const normalized = validateAndNormalizeColor(value);
                    
                    if (normalized && normalized.length >= 7) {
                        // Normalize to #RRGGBB format
                        const finalColor = normalized.length === 7 ? normalized : normalized.substring(0, 7);
                        field.onChange(finalColor);
                        if (onSelect) {
                            onSelect(finalColor);
                        }
                    } else if (value && value.trim() !== '') {
                        // If invalid, revert to previous valid value or default
                        field.onChange(colorValue || defaultValue);
                    }
                    
                    handleOnBlur(e);
                    field.onBlur(e);
                };

                return (
                   <div className='d-flex gap-2'>
                    <div
                        className={`rs-input-wrapper rs-colorpicker-input-wrapper ${classWrapper ?? ''} ${_isEmpty ? 'errorContainer' : ''} ${
                            required ? 'rs-input-wrapper-required' : ''
                        } ${isNewTheme ? 'rs-input-placeholder-wrapper' : ''} input-colorpicker-icon`}
                    >
                        <input
                            {...rest}
                            {...field}
                            name={name}
                            value={rawColorValue || ''}
                            onBlur={handleInputBlur}
                            onFocus={(e) => {
                                setIsFocused(true);
                                handleOnFocus(e);
                            }}
                            type="text"
                            className={`${className} emojifont ${required ? 'required' : ''}`}
                            placeholder={isNewTheme ? ' ' : placeholder}
                            disabled={disabled}
                            onChange={handleInputChange}
                        />
                        {isNewTheme && (
                            <>
                                <label>
                                    {_isEmpty && isError ? errMsg : label !== '' ? label : placeholder}
                                    {required && <span className="required"> {' *'}</span>}
                                </label>
                                {required && <div className="border-bottom-required"></div>}
                            </>
                        )}
                       
                    </div>
                     <div className="rs-inputIcon-wrapper rs-builder-colorpicker-container rs-colorpicker-icon-wrapper">
                            <RSColorPicker
                                icon={colorPickerIcon}
                                tooltipText={placeholder || 'Select color'}
                                onSelect={handleColorSelect}
                                colorValue={colorValue}
                                initColor={colorValue}
                                pickerIconColor={pickerIconColor}
                                wrapperClass="rs-colorpicker-wrapper rs-colorpicker-input-picker mt5"
                            />
                        </div></div>
                );
            }}
        />
    );
};

RSColorPickerInput.propTypes = {
    name: PropTypes.string.isRequired,
    control: PropTypes.object.isRequired,
    className: PropTypes.string,
    type: PropTypes.string,
    defaultValue: PropTypes.string,
    rules: PropTypes.object,
    placeholder: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    isNewTheme: PropTypes.bool,
    isError: PropTypes.bool,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    classWrapper: PropTypes.string,
    onSelect: PropTypes.func,
    colorPickerIcon: PropTypes.string,
    pickerIconColor: PropTypes.string,
    handleOnchange: PropTypes.func,
    handleOnBlur: PropTypes.func,
    handleOnFocus: PropTypes.func,
    required: PropTypes.bool,
};

export default memo(RSColorPickerInput);

