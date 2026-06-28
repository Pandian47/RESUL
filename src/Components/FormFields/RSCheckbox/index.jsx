// import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
// import { memo } from 'react';
// import _get from 'lodash/get';
// import PropTypes from 'prop-types';

// import { Controller } from 'react-hook-form';

// import RSPPophover from 'Components/RSPPophover';
// import RSTooltip from 'Components/RSTooltip';
// import { truncateTitle } from 'Utils/modules/displayCore';

// const RSCheckbox = ({
//     className = '',
//     name,
//     isNewTheme,
//     rules,
//     control,
//     defaultValue = false,
//     labelName,
//     children,
//     handleChange = () => {},
//     isName = false,
//     popover = false,
//     inlineFlex = false,
//     required,
//     popover_position = 'top',
//     popover_icon = `${circle_question_mark_mini}  icon-xs color-primary-blue`,
//     popover_content,
//     popover_class = '',
//     popover_overlayClass = '',
//     containerClass = '',
//     labelClass = '',
//     isError = true,
//     disabledchk = false,
//     disabled = false,
//     spanlabelClassName = '',
//     isDynamic = false,
//     truncateName = false,
//     optiontexttruncateCount = 15,
//     hideTooltipOnScroll = false,
//     ...rest
// }) => {
//     return (
//         <Controller
//             rules={rules}
//             control={control}
//             name={name}
//             defaultValue={defaultValue ?? false}
//             render={({ field: { onChange, ...restField }, fieldState: { error } }) => {
//                 const _isEmpty = _get(error, 'message', '')?.length > 0;
//                 return (
//                     <div
//                         className={`${_isEmpty ? 'errorContainerCheckbox' : ''} position-relative ${
//                             popover ? 'rs-popover-enabled' : ''
//                         } ${containerClass}`}
//                     >
//                         {_isEmpty && isError && <div className="validation-message">{_get(error, 'message', '')}</div>}
//                         <div className={`checkbox-wrapper`}>
//                             <label
//                                 htmlFor={name}
//                                 className={`${labelClass} ${
//                                     inlineFlex ? 'd-inline-flex' : 'd-flex'
//                                 } align-items-center`}
//                             >
//                                 <input
//                                     {...restField}
//                                     onChange={(e) => {
//                                         handleChange(e);
//                                         onChange(e.target.checked);
//                                     }}
//                                     type={'checkbox'}
//                                     name={name}
//                                     id={name}
//                                     // checked={defaultValue}
//                                     checked={!!restField.value}
//                                     disabled={disabledchk || disabled}
//                                     className={`checkbox ${className}`}
//                                     {...rest}
//                                 />
//                                 <span
//                                     className={`${className} lbl d-flex align-items-center ${
//                                         disabledchk || disabled ? 'disable-cls' : ''
//                                     }`}
//                                 >
//                                     {/* <i
//                                         className={`${
//                                             restField.value ? 'icon-rs-checkbox-new-medium color-primary-green icon-md' : ''
//                                         }`}
//                                     ></i> */}
//                                     {truncateName ? (
//                                         <RSTooltip
//                                             position="top"
//                                             text={labelName}
//                                             innerContent={false}
//                                             className={`${spanlabelClassName}`}
//                                             show={hideTooltipOnScroll ? false : undefined}
//                                         >
//                                             <h4 className="truncate224 mb0">
//                                                 {labelName?.length > optiontexttruncateCount
//                                                     ? truncateTitle(labelName, optiontexttruncateCount)
//                                                     : labelName}
//                                             </h4>
//                                         </RSTooltip>
//                                     ) : (
//                                         <span className={`${spanlabelClassName}`}>{labelName}</span>
//                                     )}
//                                 </span>

//                                 {/* <span className={`${className} lbl ${disabledchk}`}>{labelName}</span> */}
//                                 {children}
//                             </label>
//                             {isDynamic ? <span className="color-primary-red ml-5 mr5">*</span> : <></>}
//                             {popover && (
//                                 <RSPPophover
//                                     popover_overlay_class={popover_overlayClass}
//                                     position={popover_position}
//                                     pophover={popover_content}
//                                 >
//                                     <i className={popover_icon + ' ' + popover_class}></i>
//                                 </RSPPophover>
//                             )}
//                         </div>
//                     </div>
//                 );
//             }}
//         />
//     );
// };

// RSCheckbox.propTypes = {
//     name: PropTypes.string.isRequired,
//     control: PropTypes.object.isRequired,
//     className: PropTypes.string,
//     clearErrors: PropTypes.func,
//     defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
//     rules: PropTypes.object,
//     setError: PropTypes.func,
//     setValue: PropTypes.func,
//     required: PropTypes.bool,
//     isDynamic: PropTypes.bool,
//     labelName: PropTypes.string,
//     handleChange: PropTypes.func,
//     isName: PropTypes.bool,
//     popover: PropTypes.bool,
//     popover_class: PropTypes.string,
//     popover_overlayClass: PropTypes.string,
//     popover_icon: PropTypes.string,
//     popover_content: PropTypes.string,
//     popover_position: PropTypes.string,
//     containerClass: PropTypes.string,
//     labelClass: PropTypes.string,
//     isError: PropTypes.bool,
//     disabledchk: PropTypes.bool,
//     disabled: PropTypes.bool,
//     truncateName: PropTypes.bool,
//     optiontexttruncateCount: PropTypes.number,
//     hideTooltipOnScroll: PropTypes.bool,
//     inlineFlex: PropTypes.bool,
// };

// export default memo(RSCheckbox);

export { default } from 'Pages/KendoDocs/CommonComponents/ResCheckbox';