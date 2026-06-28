import { ATLEAST_OE_LOWERCASE, ATLEAST_ONE_NUMBER, ATLEAST_ONE_SPECIAL_CHARACTERS, ATLEAST_ONE_UPPERCASE, CHARS_OR_MORE } from 'Constants/GlobalConstant/Regex';
import { checkbox_mini, circle_question_mark_mini, email_medium, eye_hide_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
// import get from 'lodash/get';
// import PropTypes from 'prop-types';

// // // import { stripEmojis } from 'Utils/modules/stringUtils';
// import RSTooltip from 'Components/RSTooltip';
// import RSConfirmationModal from 'Components/ConfirmationModal';

// const RSInput = ({
//     type = 'text',
//     className = '',
//     name,
//     isNewTheme = true,
//     rules,
//     control,
//     required,
//     defaultValue = '',
//     onBlur,
//     placeholder,
//     viewEye = false,
//     onFocus,
//     handleOnchange = () => { },
//     handleOnBlur = () => { },
//     handleOnFocus = () => { },
//     meter,
//     isError = true,
//     isValidIcon = false,
//     label = '',
//     labelClassName = '',
//     iconPlaceholder = false,
//     iconName = '',
//     disabled,
//     isNumber,
//     classWrapper,
//     isLoading = false,
//     formFieldContent = '',
//     formFieldIcon = false,
//     onKeyDown = () => { },
//     onKeyUp = () => { },
//     maxLength = undefined,
//     isKeyDownUpPrevent = true,
//     handleOnPaste = () => { },
//     handlePlaceholderIconClick = () => { },
//     iconColor = '',
//     iconSize = '',
//     loginEmailIcon = false,
//     isCustomIcon = false,
//     isCustomDoubleIcon = false,
//     existingUser = false,
//     isConfirmPassword = false,
//     customIconClassname = '',
//     customTooltipClassName = '',
//     maskValue,
//     smallText = '',
//     restrictSpecialChars = false,
//     isCustomLoader = false,
//     disableMaxLengthWarning = false,
//     isFormMandatoryTooltip = false,
//     iconPlaceholderText = '',
//     noEmoji = false,
//     preserveConsecutiveSpaces = false,
//     showTypeCount = false,
//     ...rest
// }) => {
//     const [typevalue, setTypevalue] = useState(type);
//     const [password, setPassword] = useState('');
//     const [showElement, setShowElement] = useState(false);
//     const [isFocused, setIsFocused] = useState(false);
//     const [showMaxLengthWarning, setShowMaxLengthWarning] = useState(false);
//     const [pasteErrorMessage, setPasteErrorMessage] = useState('');
//     const [isMaskEnabled, setIsMaskEnabled] = useState(true);

//     const inputRef = useRef(null);
//     const cursorRestoreRef = useRef(null);

//     // Regex to allow only alphanumeric, _, and -
//     const allowedCharsRegex = /^[a-zA-Z0-9_ -]*$/;

//     useEffect(() => {
//         if (isValidIcon && !isLoading) {
//             setShowElement(true);
//             const timer = setTimeout(function () {
//                 setShowElement(false);
//             }, 3000);
//             return () => clearTimeout(timer);
//         } else if (isLoading) {
//             setShowElement(false);
//         }
//     }, [isValidIcon, isLoading]);

//     const passwordTracker = useMemo(
//         () => ({
//             uppercase: password.match(ATLEAST_ONE_UPPERCASE),
//             lowercase: password.match(ATLEAST_OE_LOWERCASE),
//             number: password.match(ATLEAST_ONE_NUMBER),
//             specialChar: password.match(ATLEAST_ONE_SPECIAL_CHARACTERS),
//             CharsOrGreater: password.match(CHARS_OR_MORE),
//         }),
//         [password],
//     );
//     const passwordStrength = useMemo(
//         () => Object.values(passwordTracker).filter((value) => value)?.length,
//         [password],
//     );

//     const fieldIconValid =
//         formFieldIcon ||
//         iconPlaceholder ||
//         isLoading ||
//         (!isLoading && viewEye) ||
//         (!isLoading && !showElement && loginEmailIcon) ||
//         (isValidIcon && showElement);

//     useEffect(() => {
//         setTypevalue(type);
//     }, [type]);

//     return (
//         <>
//             <Controller
//                 rules={rules}
//                 control={control}
//                 name={name}
//                 defaultValue={defaultValue}
//                 render={({ field, fieldState: { error } }) => {
//                     const _isEmpty = pasteErrorMessage || get(error, 'message', '')?.length > 0;
//                     const errMsg = pasteErrorMessage || get(error, 'message', '');
//                     const shouldUsePasswordAutocomplete = typevalue === 'password' || type === 'password';
//                     const defaultAutoComplete = shouldUsePasswordAutocomplete
//                         ? (existingUser ? 'current-password' : 'new-password')
//                         : 'off';
//                     const resolvedAutoComplete = rest.autoComplete ?? defaultAutoComplete;
//                     const isMaskedDisplay = Boolean(maskValue && field.value && !isFocused && isMaskEnabled);
//                     // console.log(import.meta, 'import.meta.env.MODE');
//                     // viewEye && setPassword(field.value);
//                     return (
//                         <div
//                             className={`rs-input-wrapper-new ${classWrapper ?? ''} ${_isEmpty ? 'errorContainer' : ''} ${required ? 'rs-input-wrapper-required' : ''
//                                 } ${isNewTheme ? 'rs-input-placeholder-wrapper' : ''} ${fieldIconValid ? 'input-icon-placeholder' : ''
//                                 }
//                             ${isCustomIcon ? 'input-custom-icon' : ''}
//                             ${isCustomDoubleIcon ? 'input-custom-double-icon' : ''}
//                             `}
//                         >
//                             {/* {_isEmpty && <div className="validation-message">{get(error, 'message', '')}</div>} */}
//                             <input
//                                 {...rest}
//                                 {...field}
//                                 ref={(el) => {
//                                     field.ref(el);
//                                     inputRef.current = el;
//                                 }}
//                                 name={name}
//                                 value={isMaskedDisplay ? maskValue(field.value) : field.value || ''}
//                                 onBlur={(e) => {
//                                     //  e.target.value = e.target.value.trim();
//                                     setIsFocused(false);
//                                     handleOnBlur(e);
//                                     field.onBlur(e);
//                                 }}
//                                 onFocus={(e) => {
//                                     // e.target.value = e.target.value.trim();
//                                     setIsFocused(true);
//                                     handleOnFocus(e);
//                                 }}
//                                 type={typevalue}
//                                 className={`${className} emojifont ${required ? 'required' : ''}`}
//                                 placeholder={isNewTheme ? ' ' : placeholder}
//                                 autoComplete={resolvedAutoComplete}
//                                 disabled={disabled}
//                                 onPaste={(e) => {
//                                     handleOnPaste(e);
//                                     if (isConfirmPassword) {
//                                         e.preventDefault();
//                                     }
//                                     if (import.meta.env.MODE !== 'dev') {
//                                         // e.preventDefault(); - QA team request, so we disable the copy paste #2337 action, reverted by vennila
//                                     }

//                                     let pastedData = e.clipboardData.getData('text');
//                                     let emojiCleaned = false;

//                                     if (noEmoji) {
//                                         const cleanedText = stripEmojis(pastedData);
//                                         if (cleanedText !== pastedData) {
//                                             pastedData = cleanedText;
//                                             emojiCleaned = true;
//                                         }
//                                     }

//                                     // Check maxLength for pasted content
//                                     if (maxLength && maxLength > 0 && !disableMaxLengthWarning) {
//                                         const currentValue = field.value || '';

//                                         // Get selection range to determine if content is being replaced
//                                         const selectionStart = e.target.selectionStart || 0;
//                                         const selectionEnd = e.target.selectionEnd || 0;
//                                         const selectedText = currentValue.substring(selectionStart, selectionEnd);

//                                         // Calculate new length considering text replacement
//                                         const newLength = currentValue.length - selectedText.length + pastedData.length;

//                                         if (newLength > maxLength) {
//                                             e.preventDefault();
//                                             setPasteErrorMessage('Maximum limit exceeded');
//                                             return;
//                                         } else {
//                                             setPasteErrorMessage('');
//                                         }
//                                     }

//                                     if (emojiCleaned) {
//                                         e.preventDefault();
//                                         document.execCommand('insertText', false, pastedData);
//                                     }

//                                     if (typevalue === 'email') {
//                                         if (/\s/.test(pastedData) || /[\x00-\x1F\x7F]/.test(pastedData)) {
//                                             e.preventDefault();
//                                             const cleanedText = pastedData.replace(/\s+/g, '').replace(/[\x00-\x1F\x7F]/g, '');
//                                             document.execCommand('insertText', false, cleanedText);
//                                         }
//                                     }
//                                 }}
//                                 onChange={(e) => {
//                                     setPasteErrorMessage('');
//                                     let value = e.target.value;
//                                     const selectionStart = e.target.selectionStart ?? 0;
//                                     const selectionEnd = e.target.selectionEnd ?? 0;

//                                     if (noEmoji) {
//                                         value = stripEmojis(value);
//                                     }

//                                     if (restrictSpecialChars && typevalue !== 'number' && typevalue !== 'email') {
//                                         if (!allowedCharsRegex.test(value)) {
//                                             // Remove any characters that don't match the allowed pattern
//                                             value = value
//                                                 .split('')
//                                                 .filter((char) => allowedCharsRegex.test(char))
//                                                 .join('');
//                                         }
//                                     }

//                                     if (viewEye) setPassword(value);
//                                     handleOnchange(e);
//                                     if (type === 'number' && isNumber) {
//                                         const number = value;
//                                         field.onChange(
//                                             number.indexOf('.') >= 0 ? number.slice(0, number.indexOf('.') + 3) : number,
//                                         );
//                                     } else {
//                                         let trim;
//                                         if (value.trim()?.length === 0) trim = '';
//                                         else {
//                                             trim = preserveConsecutiveSpaces ? value : value.replace(/ +/g, ' ');
//                                         }
//                                         cursorRestoreRef.current = { start: selectionStart, end: selectionEnd, length: trim.length };
//                                         field.onChange(trim);
//                                         setTimeout(() => {
//                                             const input = inputRef.current;
//                                             const cursor = cursorRestoreRef.current;
//                                             if (input && cursor) {
//                                                 if (input.type === 'email' || input.type === 'number') {
//                                                     cursorRestoreRef.current = null;
//                                                     return;
//                                                 }
//                                                 const start = Math.min(cursor.start, cursor.length);
//                                                 const end = Math.min(cursor.end, cursor.length);
//                                                 input.setSelectionRange(start, end);
//                                                 cursorRestoreRef.current = null;
//                                             }
//                                         }, 0);
//                                     }
//                                 }}
//                                 {...(typevalue === 'number' && { min: 0 })}
//                                 onKeyDown={(event) => {
//                                     if (isKeyDownUpPrevent && event.key === 'Enter') {
//                                         event.preventDefault();
//                                         event.stopPropagation();
//                                         return;
//                                     }
//                                     if ((typevalue === 'email') && event.key === ' ') {
//                                         event.preventDefault();
//                                         return;
//                                     }
//                                     if (typevalue === 'number') {
//                                         // Allow: backspace, delete, tab, escape, enter
//                                         if (
//                                             event.keyCode == 46 ||
//                                             event.keyCode == 8 ||
//                                             event.keyCode == 9 ||
//                                             event.keyCode == 27 ||
//                                             event.keyCode == 13 ||
//                                             // Allow: Ctrl+A, Command+A
//                                             (event.keyCode == 65 && (event.ctrlKey === true || event.metaKey === true)) ||
//                                             // Allow: home, end, left, right, down, up
//                                             (event.keyCode >= 35 && event.keyCode <= 40)
//                                         ) {
//                                             // let it happen, don't do anything
//                                             return;
//                                         }
//                                         if (
//                                             event.shiftKey ||
//                                             ((event.keyCode < 48 || event.keyCode > 57) &&
//                                                 (event.keyCode < 96 || event.keyCode > 105))
//                                         ) {
//                                             event.preventDefault();
//                                         }
//                                     }
//                                     onKeyDown(event);
//                                 }}
//                                 onKeyUp={(event) => {
//                                     if (event.key === 'Enter' && isKeyDownUpPrevent) {
//                                         event.preventDefault();
//                                         event.stopPropagation();
//                                         return;
//                                     }
//                                     onKeyUp(event);
//                                 }}
//                                 maxLength={maxLength}
//                             />
//                             {isNewTheme && (
//                                 <>
//                                     <label className={labelClassName}>
//                                         {_isEmpty && isError ? errMsg : label !== '' ? label : placeholder}
//                                         {required && <span className="required"> {' *'}</span>}
//                                     </label>
//                                     {required && <div className="border-bottom-required"></div>}
//                                     {smallText && <small>{smallText}</small>}
//                                 </>
//                             )}
//                             {isLoading && (
//                                 <div className={`rs-inputIcon-wrapper ${isCustomLoader ? 'mr23' : ''}`}>
//                                     <div className="segment_loader"></div>
//                                 </div>
//                             )}
//                             {!isLoading && viewEye && (
//                                 <div className="rs-inputIcon-wrapper">
//                                     <i
//                                         className={`icon-md cursor-pointer color-primary-grey ${maskValue
//                                                 ? (isMaskedDisplay ? eye_hide_medium : eye_medium)
//                                                 : (typevalue === 'password' ? eye_hide_medium : eye_medium)
//                                             } `}
//                                         onClick={() => {
//                                             if (maskValue) {
//                                                 setIsMaskEnabled((prev) => !prev);
//                                             } else {
//                                                 setTypevalue(typevalue === 'text' ? 'password' : 'text');
//                                             }
//                                         }}
//                                     ></i>
//                                 </div>
//                             )}
//                             {!isLoading && !showElement && loginEmailIcon && (
//                                 <div className="rs-inputIcon-wrapper">
//                                     <i className={`icon-md cursor-normal color-primary-grey ${email_medium} `}></i>
//                                 </div>
//                             )}
//                             {!isLoading && iconPlaceholder && (
//                                 <>
//                                     {isFormMandatoryTooltip ? <RSTooltip text={iconPlaceholderText} className={`rs-inputIcon-wrapper d-inline-block lh0 ${customTooltipClassName}`}>
//                                         <div className={` ${customIconClassname}`}>
//                                             <i
//                                                 className={`${iconSize ? iconSize : 'icon-lg'} cursor-pointer ${iconColor ? iconColor : 'color-primary-grey'
//                                                     }  ${iconName}  position-relative`}
//                                                 onClick={() => {
//                                                     handlePlaceholderIconClick();
//                                                 }}
//                                             ></i>
//                                         </div>
//                                     </RSTooltip> :
//                                         <div className={`rs-inputIcon-wrapper ${customIconClassname}`}>
//                                             <i
//                                                 className={`${iconSize ? iconSize : 'icon-lg'} cursor-pointer ${iconColor ? iconColor : 'color-primary-grey'
//                                                     }  ${iconName} `}
//                                                 onClick={() => {
//                                                     handlePlaceholderIconClick();
//                                                 }}
//                                             ></i>
//                                         </div>}
//                                 </>
//                             )}

//                             {meter && <div className={`password-strength-meter bg${(passwordStrength / 5) * 100}`}></div>}
//                             {!isLoading && isValidIcon && showElement && (
//                                 <div className={`rs-validate-success-icon ${isCustomLoader ? 'mr23' : ''}`}>
//                                     <i className={`${checkbox_mini} icon-xs color-primary-green pe-none`} />
//                                 </div>
//                             )}

//                             {!isLoading && formFieldIcon && (
//                                 <RSTooltip text={formFieldContent}>
//                                     <div className="form-field-icon">
//                                         <i
//                                             className={`${circle_question_mark_mini} icon-xs`}
//                                             id="circle_question_mark"
//                                         ></i>
//                                     </div>
//                                 </RSTooltip>
//                             )}
//                             {maxLength && showTypeCount && <small className="position-absolute right0 text-muted">{`${field.value?.length} /${maxLength}`}</small>}
//                         </div>
//                     );
//                 }}
//             />
//             {showMaxLengthWarning && !disableMaxLengthWarning && (
//                 <RSConfirmationModal
//                     show={showMaxLengthWarning}
//                     header="Content Too Long"
//                     text={`The pasted content exceeds the maximum length of ${maxLength} characters. Please paste a shorter text or type manually.`}
//                     primaryButtonText="OK"
//                     handleClose={() => setShowMaxLengthWarning(false)}
//                     handleConfirm={() => setShowMaxLengthWarning(false)}
//                     secondaryButton={false}
//                 />
//             )}
//         </>
//     );
// };

// RSInput.propTypes = {
//     name: PropTypes.string.isRequired,
//     control: PropTypes.object.isRequired,
//     className: PropTypes.string,
//     clearErrors: PropTypes.func,
//     type: PropTypes.string,
//     defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
//     rules: PropTypes.object,
//     setError: PropTypes.func,
//     setValue: PropTypes.func,
//     placeholder: PropTypes.string,
//     onBlur: PropTypes.func,
//     onChange: PropTypes.func,
//     onFocus: PropTypes.func,
//     isNewTheme: PropTypes.bool,
//     viewEye: PropTypes.bool,
//     iconPlaceholder: PropTypes.bool,
//     meter: PropTypes.bool,
//     isError: PropTypes.bool,
//     isValidIcon: PropTypes.bool,
//     label: PropTypes.string,
//     labelClassName: PropTypes.string,
//     iconName: PropTypes.string,
//     formFieldContent: PropTypes.string,
//     formFieldIcon: PropTypes.bool,
//     isLoading: PropTypes.bool,
//     onKeyDown: PropTypes.func,
//     onKeyUp: PropTypes.func,
//     handleOnPaste: PropTypes.func,
//     maxLength: PropTypes.number,
//     isKeyDownUpPrevent: PropTypes.bool,
//     handlePlaceholderIconClick: PropTypes.func,
//     iconColor: PropTypes.string,
//     iconSize: PropTypes.string,
//     isCustomIcon: PropTypes.bool,
//     isCustomDoubleIcon: PropTypes.bool,
//     existingUser: PropTypes.bool,
//     isConfirmPassword: PropTypes.bool,
//     maskValue: PropTypes.func,
//     restrictSpecialChars: PropTypes.bool,
//     isCustomLoader: PropTypes.bool,
//     disableMaxLengthWarning: PropTypes.bool,
//     isFormMandatoryTooltip: PropTypes.bool,
//     iconPlaceholderText: PropTypes.string,
//     noEmoji: PropTypes.bool,
//     preserveConsecutiveSpaces: PropTypes.bool,
// };

// export default memo(RSInput);

export { default } from 'Pages/KendoDocs/CommonComponents/ResInput';
