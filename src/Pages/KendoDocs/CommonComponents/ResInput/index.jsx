import { ATLEAST_OE_LOWERCASE, ATLEAST_ONE_NUMBER, ATLEAST_ONE_SPECIAL_CHARACTERS, ATLEAST_ONE_UPPERCASE, CHARS_OR_MORE } from 'Constants/GlobalConstant/Regex';
import { checkbox_mini, circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { isValidElement, memo, useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import { get } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';

import { stripEmojis } from 'Utils/modules/stringUtils';
import RSConfirmationModal from 'Components/ConfirmationModal';

import ResTooltip from '../ResTooltip';
import TruncatedCell from '../ResKendoGrid/TruncateCell';
import { RES_INPUT_CLASS as INPUT_CLASS } from '../../kendoDocsVariables';

import './resInput.scss';

const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

const renderSmallTextContent = (content) => {
    if (content == null || content === '') return null;

    if (isValidElement(content)) {
        return <div className={INPUT_CLASS.metaContent}>{content}</div>;
    }

    if (typeof content === 'string') {
        const trimmed = content.trim();
        if (HTML_TAG_PATTERN.test(trimmed)) {
            return <div className={INPUT_CLASS.metaContent} dangerouslySetInnerHTML={{ __html: trimmed }} />;
        }
        return (
            <small className={INPUT_CLASS.metaText}>
                <TruncatedCell value={content} noTable />
            </small>
        );
    }

    return (
        <small className={INPUT_CLASS.metaText}>
            <TruncatedCell value={content} noTable />
        </small>
    );
};

const LoginEmailStatusIcon = ({ state, className = '' }) => (
    <div className={`res-login-email-status-icon res-login-email-status-icon--${state} ${className}`}>
        <svg
            className="res-login-email-status-icon__svg"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
        >
            <g className="res-login-email-status-icon__email">
                <path
                    className="res-login-email-status-icon__email-line res-login-email-status-icon__email-box"
                    d="M3.25 6.35H20.75V17.65H3.25Z"
                />
                <path
                    className="res-login-email-status-icon__email-line res-login-email-status-icon__email-flap"
                    d="M3.65 6.75L12 13.15L20.35 6.75"
                />
                <path
                    className="res-login-email-status-icon__email-line res-login-email-status-icon__email-fold"
                    d="M3.85 17.25L9.35 11.1M20.15 17.25L14.65 11.1"
                />
            </g>
            <circle className="res-login-email-status-icon__loader" cx="12" cy="12" r="7.75" />
            <path
                className="res-login-email-status-icon__tick"
                d="M9.55,16.07c1.35-2.77,2.73-5.57,4.71-7.95,1.85-2.23,4.25-4.08,7.05-4.82.22-.06.52-.09.64.11.13.22-.06.48-.25.66-3.12,3.03-5.7,6.6-7.59,10.51-.77,1.6-1.43,3.25-2.28,4.8-.34.63-.82,1.31-1.53,1.37-.66.06-1.22-.45-1.7-.91-2-1.95-4.09-3.8-6.27-5.54-.17-.14-.36-.31-.34-.53,0-.1.06-.19.12-.28.44-.61,1.18-.98,1.94-1.02,1.5-.1,2.72.98,3.75,1.93"
            />
            <path className="res-login-email-status-icon__x res-login-email-status-icon__x-first" d="M6.6 6.6L17.4 17.4" />
            <path className="res-login-email-status-icon__x res-login-email-status-icon__x-second" d="M17.4 6.6L6.6 17.4" />
        </svg>
    </div>
);

LoginEmailStatusIcon.propTypes = {
    state: PropTypes.oneOf(['email', 'loading', 'valid', 'invalid']).isRequired,
    className: PropTypes.string,
};

const PasswordVisibilityIcon = ({ hidden, className = '' }) => (
    <span className={`res-password-visibility-icon ${hidden ? 'res-password-visibility-icon--hidden' : 'res-password-visibility-icon--visible'} ${className}`}>
        <svg
            className="res-password-visibility-icon__svg"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
        >
            <g className="res-password-visibility-icon__eye">
                <path d="M21.73,11.39s0,0,0,0c-6-8.43-12.77-8.5-19.42-.11-.3.4-.3.95,0,1.35,3.32,4.23,6.67,6.38,9.95,6.38s6.47-2.14,9.46-6.35c.26-.38.26-.89,0-1.26ZM3.36,11.95c6.06-7.58,11.79-7.57,17.28.08-5.48,7.65-11.23,7.6-17.28-.08Z" />
                <path d="M12,8.02c-2.2,0-3.98,1.79-3.98,3.98s1.79,3.98,3.98,3.98,3.98-1.79,3.98-3.98-1.79-3.98-3.98-3.98ZM12,14.73c-1.51,0-2.73-1.22-2.73-2.73s1.22-2.73,2.73-2.73,2.73,1.22,2.73,2.73-1.22,2.73-2.73,2.73Z" />
            </g>
            <path
                className="res-password-visibility-icon__slash"
                d="M4.57 19.42L19.37 4.62"
            />
        </svg>
    </span>
);

PasswordVisibilityIcon.propTypes = {
    hidden: PropTypes.bool.isRequired,
    className: PropTypes.string,
};

const ResInput = ({
    type = 'text',
    className = '',
    name,
    isNewTheme = true,
    rules,
    control,
    required,
    defaultValue = '',
    onBlur,
    placeholder,
    viewEye = false,
    onFocus,
    handleOnchange = () => {},
    handleOnBlur = () => {},
    handleOnFocus = () => {},
    meter,
    isError = true,
    isValidIcon = false,
    isInvalidIcon = false,
    label = '',
    labelClassName = '',
    iconPlaceholder = false,
    iconName = '',
    disabled,
    isNumber,
    classWrapper,
    isLoading = false,
    formFieldContent = '',
    formFieldIcon = false,
    onKeyDown = () => {},
    onKeyUp = () => {},
    maxLength = undefined,
    isKeyDownUpPrevent = true,
    handleOnPaste = () => {},
    handlePlaceholderIconClick = () => {},
    iconColor = '',
    iconSize = '',
    loginEmailIcon = false,
    isCustomIcon = false,
    isCustomDoubleIcon = false,
    existingUser = false,
    isConfirmPassword = false,
    customIconClassname = '',
    customTooltipClassName = '',
    maskValue,
    smallText = '',
    rightTooltip,
    rightTooltipIcon = circle_question_mark_mini,
    restrictSpecialChars = false,
    isCustomLoader = false,
    disableMaxLengthWarning = false,
    isFormMandatoryTooltip = false,
    iconPlaceholderText = '',
    noEmoji = false,
    preserveConsecutiveSpaces = false,
    showTypeCount = false,
    isHighlight,
    ...rest
}) => {
    const [typevalue, setTypevalue] = useState(type);
    const [password, setPassword] = useState('');
    const [showElement, setShowElement] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showMaxLengthWarning, setShowMaxLengthWarning] = useState(false);
    const [pasteErrorMessage, setPasteErrorMessage] = useState('');
    const [isMaskEnabled, setIsMaskEnabled] = useState(true);

    const inputRef = useRef(null);
    const cursorRestoreRef = useRef(null);
    const wasLoadingRef = useRef(false);

    const allowedCharsRegex = /^[a-zA-Z0-9_ -]*$/;

    useEffect(() => {
        if (isLoading) {
            wasLoadingRef.current = true;
            setShowElement(false);
            return;
        }

        if (loginEmailIcon && (isValidIcon || isInvalidIcon)) {
            wasLoadingRef.current = false;
            setShowElement(true);
            const timer = setTimeout(() => {
                setShowElement(false);
            }, 5000);
            return () => clearTimeout(timer);
        }

        if (wasLoadingRef.current) {
            wasLoadingRef.current = false;
            if (isValidIcon) {
                setShowElement(true);
                const timer = setTimeout(() => {
                    setShowElement(false);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isInvalidIcon, isLoading, isValidIcon, loginEmailIcon]);

    const passwordTracker = useMemo(
        () => ({
            uppercase: password.match(ATLEAST_ONE_UPPERCASE),
            lowercase: password.match(ATLEAST_OE_LOWERCASE),
            number: password.match(ATLEAST_ONE_NUMBER),
            specialChar: password.match(ATLEAST_ONE_SPECIAL_CHARACTERS),
            CharsOrGreater: password.match(CHARS_OR_MORE),
        }),
        [password],
    );
    const passwordStrength = useMemo(
        () => Object.values(passwordTracker).filter((value) => value)?.length,
        [passwordTracker],
    );

    const fieldIconValid =
        formFieldIcon ||
        iconPlaceholder ||
        isLoading ||
        loginEmailIcon ||
        (!isLoading && viewEye) ||
        (isValidIcon && showElement);

    useEffect(() => {
        setTypevalue(type);
    }, [type]);

    return (
        <>
            <Controller
                rules={rules}
                control={control}
                name={name}
                defaultValue={defaultValue}
                render={({ field, fieldState: { error } }) => {
                    const _isEmpty = pasteErrorMessage || get(error, 'message', '')?.length > 0;
                    const errMsg = pasteErrorMessage || get(error, 'message', '');
                    const shouldUsePasswordAutocomplete = typevalue === 'password' || type === 'password';
                    const defaultAutoComplete = shouldUsePasswordAutocomplete
                        ? (existingUser ? 'current-password' : 'new-password')
                        : 'off';
                    const resolvedAutoComplete = rest.autoComplete ?? defaultAutoComplete;
                    const isMaskedDisplay = Boolean(maskValue && field.value && !isFocused && isMaskEnabled);
                    const labelText = _isEmpty && isError ? errMsg : label !== '' ? label : placeholder;
                    const inputTitle = field.value != null && String(field.value).trim() !== ''
                        ? String(field.value)
                        : undefined;
                    const isPasswordHidden = maskValue ? isMaskedDisplay : typevalue === 'password';
                    const loginEmailIconState = isLoading
                        ? 'loading'
                        : showElement && isValidIcon
                            ? 'valid'
                            : showElement && isInvalidIcon
                                ? 'invalid'
                                : 'email';

                    return (
                        <div
                            className={`${INPUT_CLASS.wrapper} ${classWrapper ?? ''} ${_isEmpty ? 'errorContainer' : ''} ${isNewTheme ? INPUT_CLASS.placeholder : ''} ${fieldIconValid ? INPUT_CLASS.iconPlaceholder : ''} ${isCustomIcon ? INPUT_CLASS.customIcon : ''} ${isCustomDoubleIcon ? INPUT_CLASS.customDoubleIcon : ''}`}
                        >
                            <div className={`${INPUT_CLASS.field} position-relative ${required ? INPUT_CLASS.required : ''}`}>
                            <input
                                {...rest}
                                {...field}
                                ref={(el) => {
                                    field.ref(el);
                                    inputRef.current = el;
                                }}
                                name={name}
                                value={isMaskedDisplay ? maskValue(field.value) : field.value ?? ''}
                                onBlur={(e) => {
                                    setIsFocused(false);
                                    handleOnBlur(e);
                                    field.onBlur(e);
                                    onBlur?.(e);
                                }}
                                onFocus={(e) => {
                                    setIsFocused(true);
                                    handleOnFocus(e);
                                    onFocus?.(e);
                                }}
                                type={typevalue}
                                className={`${className} emojifont ${required ? INPUT_CLASS.fieldRequired : ''}`}
                                placeholder={isNewTheme ? ' ' : placeholder}
                                autoComplete={resolvedAutoComplete}
                                disabled={disabled}
                                onPaste={(e) => {
                                    handleOnPaste(e);
                                    if (isConfirmPassword) {
                                        e.preventDefault();
                                    }

                                    let pastedData = e.clipboardData.getData('text');
                                    let emojiCleaned = false;

                                    if (noEmoji) {
                                        const cleanedText = stripEmojis(pastedData);
                                        if (cleanedText !== pastedData) {
                                            pastedData = cleanedText;
                                            emojiCleaned = true;
                                        }
                                    }

                                    if (maxLength && maxLength > 0 && !disableMaxLengthWarning) {
                                        const currentValue = field.value ?? '';
                                        const selectionStart = e.target.selectionStart || 0;
                                        const selectionEnd = e.target.selectionEnd || 0;
                                        const selectedText = currentValue.substring(selectionStart, selectionEnd);
                                        const newLength = currentValue.length - selectedText.length + pastedData.length;

                                        if (newLength > maxLength) {
                                            e.preventDefault();
                                            setPasteErrorMessage('Maximum limit exceeded');
                                            return;
                                        }
                                        setPasteErrorMessage('');
                                    }

                                    if (emojiCleaned) {
                                        e.preventDefault();
                                        document.execCommand('insertText', false, pastedData);
                                    }

                                    if (typevalue === 'email') {
                                        if (/\s/.test(pastedData) || /[\x00-\x1F\x7F]/.test(pastedData)) {
                                            e.preventDefault();
                                            const cleanedText = pastedData.replace(/\s+/g, '').replace(/[\x00-\x1F\x7F]/g, '');
                                            document.execCommand('insertText', false, cleanedText);
                                        }
                                    }
                                }}
                                onChange={(e) => {
                                    setPasteErrorMessage('');
                                    let value = e.target.value;
                                    const selectionStart = e.target.selectionStart ?? 0;
                                    const selectionEnd = e.target.selectionEnd ?? 0;

                                    if (noEmoji) {
                                        value = stripEmojis(value);
                                    }

                                    if (restrictSpecialChars && typevalue !== 'number' && typevalue !== 'email') {
                                        if (!allowedCharsRegex.test(value)) {
                                            value = value
                                                .split('')
                                                .filter((char) => allowedCharsRegex.test(char))
                                                .join('');
                                        }
                                    }

                                    if (viewEye) setPassword(value);
                                    handleOnchange(e);
                                    if (type === 'number' && isNumber) {
                                        const number = value;
                                        field.onChange(
                                            number.indexOf('.') >= 0 ? number.slice(0, number.indexOf('.') + 3) : number,
                                        );
                                    } else {
                                        let trim;
                                        if (value.trim()?.length === 0) trim = '';
                                        else {
                                            trim = preserveConsecutiveSpaces ? value : value.replace(/ +/g, ' ');
                                        }
                                        cursorRestoreRef.current = { start: selectionStart, end: selectionEnd, length: trim.length };
                                        field.onChange(trim);
                                        setTimeout(() => {
                                            const input = inputRef.current;
                                            const cursor = cursorRestoreRef.current;
                                            if (input && cursor) {
                                                if (input.type === 'email' || input.type === 'number') {
                                                    cursorRestoreRef.current = null;
                                                    return;
                                                }
                                                const start = Math.min(cursor.start, cursor.length);
                                                const end = Math.min(cursor.end, cursor.length);
                                                input.setSelectionRange(start, end);
                                                cursorRestoreRef.current = null;
                                            }
                                        }, 0);
                                    }
                                }}
                                {...(typevalue === 'number' && { min: 0 })}
                                onKeyDown={(event) => {
                                    if (isKeyDownUpPrevent && event.key === 'Enter') {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        return;
                                    }
                                    if (typevalue === 'email' && event.key === ' ') {
                                        event.preventDefault();
                                        return;
                                    }
                                    if (typevalue === 'number') {
                                        if (
                                            event.keyCode === 46 ||
                                            event.keyCode === 8 ||
                                            event.keyCode === 9 ||
                                            event.keyCode === 27 ||
                                            event.keyCode === 13 ||
                                            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
                                            (event.keyCode >= 35 && event.keyCode <= 40)
                                        ) {
                                            return;
                                        }
                                        if (
                                            event.shiftKey ||
                                            ((event.keyCode < 48 || event.keyCode > 57) &&
                                                (event.keyCode < 96 || event.keyCode > 105))
                                        ) {
                                            event.preventDefault();
                                        }
                                    }
                                    onKeyDown(event);
                                }}
                                onKeyUp={(event) => {
                                    if (event.key === 'Enter' && isKeyDownUpPrevent) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        return;
                                    }
                                    onKeyUp(event);
                                }}
                                maxLength={maxLength}
                                title={inputTitle}
                            />
                            {isNewTheme && (
                                <>
                                    <label className={labelClassName}>
                                        {labelText ? (
                                            <span className={INPUT_CLASS.labelText} title={String(labelText)}>
                                                {labelText}
                                            </span>
                                        ) : null}
                                        {required && <span className={INPUT_CLASS.labelRequired}> {' *'}</span>}
                                    </label>
                                    {required && <div className={INPUT_CLASS.borderBottomRequired} />}
                                </>
                            )}
                            {loginEmailIcon && (
                                <div className={`${INPUT_CLASS.iconWrapper} ${isCustomLoader ? 'mr23' : ''}`}>
                                    <LoginEmailStatusIcon state={loginEmailIconState} />
                                </div>
                            )}
                            {isLoading && !loginEmailIcon && (
                                <div className={`${INPUT_CLASS.iconWrapper} ${isCustomLoader ? 'mr23' : ''}`}>
                                    <div className={INPUT_CLASS.segmentLoader} />
                                </div>
                            )}
                            {!isLoading && viewEye && (
                                <div className={INPUT_CLASS.iconWrapper}>
                                    <button
                                        type="button"
                                        className="res-password-visibility-trigger cursor-pointer"
                                        aria-label={isPasswordHidden ? 'Show password' : 'Hide password'}
                                        onClick={() => {
                                            if (maskValue) {
                                                setIsMaskEnabled((prev) => !prev);
                                            } else {
                                                setTypevalue(typevalue === 'text' ? 'password' : 'text');
                                            }
                                        }}
                                    >
                                        <PasswordVisibilityIcon hidden={isPasswordHidden} />
                                    </button>
                                </div>
                            )}
                            {!isLoading && iconPlaceholder && (
                                <>
                                    {isFormMandatoryTooltip ? (
                                        <ResTooltip
                                            text={iconPlaceholderText}
                                            className={`${INPUT_CLASS.iconWrapper} d-inline-block lh0 ${customTooltipClassName}`}
                                        >
                                            <div className={customIconClassname}>
                                                <i
                                                    className={`${iconSize || 'icon-lg'} cursor-pointer ${iconColor || 'color-primary-grey'} ${iconName} position-relative`}
                                                    onClick={handlePlaceholderIconClick}
                                                />
                                            </div>
                                        </ResTooltip>
                                    ) : (
                                        <div className={`${INPUT_CLASS.iconWrapper} ${customIconClassname}`}>
                                            <i
                                                className={`${iconSize || 'icon-lg'} cursor-pointer ${iconColor || 'color-primary-grey'} ${iconName}`}
                                                onClick={handlePlaceholderIconClick}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {meter && (
                                <div className={`${INPUT_CLASS.passwordMeter} bg${(passwordStrength / 5) * 100}`} />
                            )}
                            {!isLoading && !loginEmailIcon && isValidIcon && showElement && (
                                <div className={`${INPUT_CLASS.validateSuccess} ${isCustomLoader ? 'mr23' : ''}`}>
                                    <i className={`${checkbox_mini} icon-xs color-primary-green pe-none`} />
                                </div>
                            )}

                            {!isLoading && formFieldIcon && (
                                <ResTooltip text={formFieldContent}>
                                    <div className={INPUT_CLASS.formFieldIcon}>
                                        <i
                                            className={`${circle_question_mark_mini} icon-xs`}
                                            id="circle_question_mark"
                                        />
                                    </div>
                                </ResTooltip>
                            )}
                            {maxLength && showTypeCount && (
                                <small className="position-absolute right0 text-muted">{`${field.value?.length} /${maxLength}`}</small>
                            )}
                            </div>
                            {(smallText || rightTooltip) && (
                                <div
                                    className={`${INPUT_CLASS.meta} d-flex align-items-center gap-2 mt5 lh-sm ${smallText ? 'justify-content-between' : INPUT_CLASS.metaTooltipOnly}`}
                                >
                                    {smallText ? renderSmallTextContent(smallText) : null}
                                    {rightTooltip && (
                                        isValidElement(rightTooltip) ? (
                                            rightTooltip
                                        ) : (
                                            <ResTooltip text={String(rightTooltip)} position="top" className="lh0">
                                                <i className={`${rightTooltipIcon} icon-xs color-primary-blue`} id='circle_question_mark' />
                                            </ResTooltip>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    );
                }}
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

ResInput.propTypes = {
    name: PropTypes.string.isRequired,
    control: PropTypes.object.isRequired,
    className: PropTypes.string,
    clearErrors: PropTypes.func,
    type: PropTypes.string,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
    rules: PropTypes.object,
    setError: PropTypes.func,
    setValue: PropTypes.func,
    placeholder: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    isNewTheme: PropTypes.bool,
    viewEye: PropTypes.bool,
    iconPlaceholder: PropTypes.bool,
    meter: PropTypes.bool,
    isError: PropTypes.bool,
    isValidIcon: PropTypes.bool,
    isInvalidIcon: PropTypes.bool,
    label: PropTypes.string,
    labelClassName: PropTypes.string,
    iconName: PropTypes.string,
    formFieldContent: PropTypes.string,
    formFieldIcon: PropTypes.bool,
    isLoading: PropTypes.bool,
    onKeyDown: PropTypes.func,
    onKeyUp: PropTypes.func,
    handleOnPaste: PropTypes.func,
    maxLength: PropTypes.number,
    isKeyDownUpPrevent: PropTypes.bool,
    handlePlaceholderIconClick: PropTypes.func,
    iconColor: PropTypes.string,
    iconSize: PropTypes.string,
    isCustomIcon: PropTypes.bool,
    isCustomDoubleIcon: PropTypes.bool,
    existingUser: PropTypes.bool,
    isConfirmPassword: PropTypes.bool,
    maskValue: PropTypes.func,
    smallText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightTooltipIcon: PropTypes.string,
    restrictSpecialChars: PropTypes.bool,
    isCustomLoader: PropTypes.bool,
    disableMaxLengthWarning: PropTypes.bool,
    isFormMandatoryTooltip: PropTypes.bool,
    iconPlaceholderText: PropTypes.string,
    noEmoji: PropTypes.bool,
    preserveConsecutiveSpaces: PropTypes.bool,
    showTypeCount: PropTypes.bool,
};

export default memo(ResInput);
