import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Controller } from 'react-hook-form';
import { get as _get,debounce } from 'Utils/modules/lodashReplacements';
import { stripEmojis } from 'Utils/modules/stringUtils';
import RSConfirmationModal from 'Components/ConfirmationModal';

const TextareaController = ({
    field,
    error,
    name,
    className,
    multiLinePlaceholder,
    customWebpushClassname,
    placeholder,
    required,
    rows,
    onBlur,
    onKeyDown,
    noEmoji,
    handleOnchange,
    propHandleChange,
    onPasteError,
    maxLength,
    disableMaxLengthWarning,
    customErrorClassName,
    isError,
    isCustomBorder,
    ...rest
}) => {
    const [localValue, setLocalValue] = useState(field.value || '');
    const [pasteErrorMessage, setPasteErrorMessage] = useState('');
    const lastPropagatedValueRef = useRef(field.value || '');
    const debouncedUpdate = useRef(debounce((val) => {
        lastPropagatedValueRef.current = val;
        field.onChange(val);
    }, 100)).current;

    useEffect(() => {
        if (field?.value !== localValue) {
            if (field?.value !== lastPropagatedValueRef.current) {
                setLocalValue(field?.value || '');
                lastPropagatedValueRef.current = field?.value || '';
            }
        }
    }, [field?.value]);

    useEffect(() => {
        return () => debouncedUpdate.cancel();
    }, [debouncedUpdate]);

    const handleLocalChange = (e) => {
        let newValue = e.target.value;
        if (noEmoji) {
            newValue = stripEmojis(newValue);
        }
        setLocalValue(newValue);
        debouncedUpdate(newValue);

        if (onPasteError) {
            onPasteError('');
        } else {
            setPasteErrorMessage('');
        }

        const changeHandler = handleOnchange || propHandleChange;
        if (changeHandler) {
            changeHandler(e);
        }
    };

    const _isEmpty = (!onPasteError && pasteErrorMessage ? true : false) || _get(error, 'message', '')?.length > 0;
    const errMsg = (!onPasteError && pasteErrorMessage) || _get(error, 'message', '');

    return (
        <div
            className={`rs-textarea-wrapper form-floating webpush_textarea ${
                multiLinePlaceholder ? 'rstw-multiline-placeholder' : ''
            } ${customWebpushClassname ?? customWebpushClassname}`}
        >
            {_isEmpty && isError && (
                <div className={`validation-message top-5 color-primary-red ${customErrorClassName}`}>
                    {errMsg}
                </div>
            )}
            <textarea
                {...rest}
                {...field}
                value={localValue}
                name={name}
                className={`${className} form-control emojifont`}
                autoComplete={'off'}
                id={name}
                rows={rows}
                placeholder=" "
                onChange={handleLocalChange}
                onKeyDown={onKeyDown}
                onPaste={(e) => {
                    let pastedData = e.clipboardData.getData('text');
                    let emojiCleaned = false;

                    if (noEmoji) {
                        const cleanedText = stripEmojis(pastedData);
                        if (cleanedText !== pastedData) {
                            pastedData = cleanedText;
                            emojiCleaned = true;
                        }
                    }

                    const currentValue = localValue || '';
                    const selectionStart = e.target.selectionStart || 0;
                    const selectionEnd = e.target.selectionEnd || 0;
                    const selectedText = currentValue.substring(selectionStart, selectionEnd);
                    const shouldEnforceMaxLength = maxLength && maxLength > 0 && !disableMaxLengthWarning;

                    const applyPastedValue = (text) => {
                        const newValue =
                            currentValue.substring(0, selectionStart) +
                            text +
                            currentValue.substring(selectionEnd);
                        setLocalValue(newValue);
                        lastPropagatedValueRef.current = newValue;
                        field.onChange(newValue);
                        debouncedUpdate.cancel();
                        debouncedUpdate(newValue);

                        if (onPasteError) {
                            onPasteError('');
                        } else {
                            setPasteErrorMessage('');
                        }
                    };

                    if (shouldEnforceMaxLength) {
                        const availableSpace = maxLength - (currentValue.length - selectedText.length);

                        if (availableSpace <= 0) {
                            e.preventDefault();
                            if (onPasteError) {
                                onPasteError('Maximum limit exceeded');
                            } else {
                                setPasteErrorMessage('Maximum limit exceeded');
                            }
                            return;
                        }

                        if (pastedData.length > availableSpace) {
                            e.preventDefault();
                            applyPastedValue(pastedData.substring(0, availableSpace));
                            return;
                        }

                        if (onPasteError) {
                            onPasteError('');
                        } else {
                            setPasteErrorMessage('');
                        }
                    }

                    if (emojiCleaned) {
                        e.preventDefault();
                        applyPastedValue(pastedData);
                    }
                }}
                onBlur={(e) => {
                    field.onBlur();
                    if (onBlur) onBlur(e);
                    lastPropagatedValueRef.current = localValue;
                    field.onChange(localValue);

                    if (onPasteError) {
                        onPasteError('');
                    } else {
                        setPasteErrorMessage('');
                    }
                }}
                maxLength={maxLength}
            />
            <label htmlFor={name}>{_isEmpty || placeholder}</label>
            {isCustomBorder && <div className="border-bottom-required"></div>}
        </div>
    );
};

const RSTextarea = ({
    name,
    value = '',
    className = '',
    multiLinePlaceholder,
    rules,
    control,
    onBlur,
    rows = 3,
    placeholder,
    required,
    isNewTheme,
    defaultValue,
    handleOnchange,
    handleChange: propHandleChange,
    isError = true,
    isCustomBorder =  false,
    customWebpushClassname = '',
    maxLength,
    disableMaxLengthWarning = false,
    onPasteError,
    customErrorClassName='',
    onKeyDown,
    noEmoji = false,
    ...rest
}) => {
    const [showMaxLengthWarning, setShowMaxLengthWarning] = useState(false);
    const [pasteErrorMessage, setPasteErrorMessage] = useState('');
    
    return (
        <>
            <Controller
                rules={rules}
                control={control}
                name={name}
                defaultValue={defaultValue}
                render={({ field, fieldState: { error } }) => (
                    <TextareaController
                        field={field}
                        error={error}
                        name={name}
                        className={className}
                        multiLinePlaceholder={multiLinePlaceholder}
                        customWebpushClassname={customWebpushClassname}
                        placeholder={placeholder}
                        required={required}
                        rows={rows}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        noEmoji={noEmoji}
                        handleOnchange={handleOnchange}
                        propHandleChange={propHandleChange}
                        onPasteError={onPasteError}
                        maxLength={maxLength}
                        disableMaxLengthWarning={disableMaxLengthWarning}
                        customErrorClassName={customErrorClassName}
                        isError={isError}
                        isCustomBorder={isCustomBorder}
                        {...rest}
                    />
                )}
            />
            {showMaxLengthWarning && !disableMaxLengthWarning && (
                <RSConfirmationModal
                    show={showMaxLengthWarning}
                    header="Content Too Long"
                    text={`The pasted content exceeds the maximum length of ${maxLength} characters. Please paste a shorter text or type manually.`}
                    primaryButtonText="OK"
                    handleClose={() => setShowMaxLengthWarning(false)}
                    handleConfirm={() => setShowMaxLengthWarning(false)}
                    secondaryButton={false}
                />
            )}
        </>
    );
};

RSTextarea.propTypes = {
    name: PropTypes.string.isRequired,
    control: PropTypes.object.isRequired,
    className: PropTypes.string,
    clearErrors: PropTypes.func,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    rules: PropTypes.object,
    setError: PropTypes.func,
    setValue: PropTypes.func,
    required: PropTypes.bool,
    type: PropTypes.string,
    labelName: PropTypes.string,
    handleOnchange: PropTypes.func,
    handleChange: PropTypes.func,
    isName: PropTypes.bool,
    rows: PropTypes.number,
    isError: PropTypes.bool,
    isCustomBorder: PropTypes.bool,
    maxLength: PropTypes.number,
    disableMaxLengthWarning: PropTypes.bool,
    onPasteError: PropTypes.func,
    customErrorClassName: PropTypes.string,
    noEmoji: PropTypes.bool,
};

export default memo(RSTextarea);
