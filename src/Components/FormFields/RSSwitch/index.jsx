// import React, { memo } from 'react';
// import PropTypes from 'prop-types';

// import { Controller } from 'react-hook-form';
// import { get } from 'lodash';
// import { Switch } from '@progress/kendo-react-inputs';

// const RSSwitch = ({
//     mainClass = '',
//     className = '',
//     name,
//     rules,
//     control,
//     defaultValue = false,
//     onLabel = 'ON',
//     offLabel = 'OFF',
//     handleChange = () => {},
//     ...rest
// }) => {
//     return (
//         <Controller
//             rules={rules}
//             control={control}
//             name={name}
//             defaultValue={defaultValue}
//             render={({ field: { onChange, ...restField }, fieldState: { error } }) => {
//                 const _isEmpty = get(error, 'message', '')?.length > 0;
//                 return (
//                     <div className={`position-relative ${mainClass}`}>
//                         {_isEmpty && <div className="validation-message">{get(error, 'message', '')}</div>}
//                         <Switch
//                             onLabel={onLabel}
//                             offLabel={offLabel}
//                             checked={restField.value}
//                             className={className}
//                             name={name}
//                             onChange={(e) => {
//                                 handleChange(e.target.value);
//                                 onChange(e.target.value);
//                             }}
//                             {...restField}
//                             {...rest}
//                         />
//                     </div>
//                 );
//             }}
//         />
//     );
// };

// RSSwitch.propTypes = {
//     mainClass: PropTypes.string,
//     className: PropTypes.string,
//     defaultValue: PropTypes.bool,
//     rules: PropTypes.object,
//     control: PropTypes.object.isRequired,
//     name: PropTypes.string.isRequired,
//     onLabel: PropTypes.string,
//     offLabel: PropTypes.string,
//     handleChange: PropTypes.func,
// };

// export default memo(RSSwitch);
export { default } from 'Pages/KendoDocs/CommonComponents/ResSwitch'