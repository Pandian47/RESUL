// import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import _get from 'lodash/get';
// import PropTypes from 'prop-types';
// import { Controller } from 'react-hook-form';
// import { filterBy } from '@progress/kendo-data-query';
// import { MultiSelect } from '@progress/kendo-react-dropdowns';

// 
// import { normalizeDisplayText } from 'Utils/modules/stringUtils';

// /** Kendo UI 13+ DOM hooks (SVG `k-svg-i-*`); legacy `k-i-*` kept for older markup */
// const KENDO_MS_DOM = {
//     inputInner: 'input.k-input-inner',
//     popupContainer: '.k-animation-container',
//     chip: '.k-chip',
//     chipLabel: '.k-chip-label',
//     chipContent: '.k-chip-content',
//     chipRemoveIcon:
//         '.k-chip-remove-action .k-svg-i-x-circle, .k-chip-remove-action .k-i-x-circle, .k-chip-remove-action .k-icon',
//     clearButton: '.k-clear-value',
// };

// const RSMultiSelect = ({
//     className = '',
//     name,
//     rules,
//     control,
//     defaultValue = [],
//     allowCustom = false,
//     label,
//     data = [],
//     textField,
//     dataItemKey,
//     handleChange = () => {},
//     handleOnBlur = () => {},
//     required,
//     disabled,
//     itemRender,
//     isCustomRender = false,
//     isCustomOnchange = false,
//     limitLength = 5,
//     setError = () => {},
//     clearErrors = () => {},
//     customErrorMessage = 'More than 5 lists are not allowed',
//     handleFilterChange = () => {},
//     //isCustomMultiSelect = false,
//     isTagRender = false,
//     showTitleOnTruncate = true,
//     footer,
//     loading = false,
//     isLoading = false,
//     ...rest
// }) => {
//     const normalizeItem = useCallback(
//         (item) => {
//             if (typeof item === 'string') return normalizeDisplayText(item);
//             if (!_isObject(item)) return item;

//             const nextItem = { ...item };
//             if (textField && typeof nextItem[textField] === 'string') {
//                 nextItem[textField] = normalizeDisplayText(nextItem[textField]);
//             }
//             if (typeof nextItem.data === 'string') {
//                 nextItem.data = normalizeDisplayText(nextItem.data);
//             }
//             return nextItem;
//         },
//         [textField],
//     );
//     const dataArray = useMemo(
//         () => (Array.isArray(data) ? data.map(normalizeItem) : []),
//         [data, normalizeItem],
//     );
//     const virtualDataSerializedRef = useRef('');
//     const virtualDataContentKey = useMemo(() => {
//         if (dataArray.length <= 5000) {
//             virtualDataSerializedRef.current = '';
//             return '';
//         }
//         const serialized = JSON.stringify(dataArray);
//         if (serialized === virtualDataSerializedRef.current) {
//             return virtualDataSerializedRef.current;
//         }
//         virtualDataSerializedRef.current = serialized;
//         return serialized;
//     }, [dataArray]);
//     const total = dataArray.length;
//     const pageSize = 50;
//     const [tempData, setData] = useState(dataArray.slice());
//     // const [opened, setOpened] = useState(false);
//     useEffect(() => {
//         setData(dataArray.length ? dataArray.slice() : []);
//     }, [dataArray]);
//     const wrapperRef = useRef();
//     const hadFocusRef = useRef(false);
//     const dataArrayRef = useRef(dataArray);
//     dataArrayRef.current = dataArray;
//     const activeVirtualFilterRef = useRef(null);

//     const [dropdownItems, setDropdownItems] = useState({
//         skip: 0,
//         options: dataArray.slice(0, pageSize),
//     });
//     const [virtualListTotal, setVirtualListTotal] = useState(() =>
//         dataArray.length > 5000 ? dataArray.length : 0,
//     );

//     useEffect(() => {
//         const wrapper = wrapperRef.current;
//         if (!wrapper) return;

//         const input = wrapper.querySelector(KENDO_MS_DOM.inputInner);
//         if (!input) return;

//         const onFocus = () => {
//             hadFocusRef.current = true;
//         };
//         const onBlur = () => {
//             hadFocusRef.current = false;
//         };

//         input.addEventListener('focus', onFocus);
//         input.addEventListener('blur', onBlur);

//         let refocusRaf = 0;
//         const observer = new MutationObserver(() => {
//             if (!hadFocusRef.current || document.activeElement === input) return;
//             const popupOpen = wrapper.querySelector(KENDO_MS_DOM.popupContainer);
//             if (!popupOpen) return;

//             cancelAnimationFrame(refocusRaf);
//             refocusRaf = requestAnimationFrame(() => {
//                 if (!hadFocusRef.current || document.activeElement === input) return;
//                 if (!wrapper.querySelector(KENDO_MS_DOM.popupContainer)) return;
//                 input.focus({ preventScroll: true });
//             });
//         });

//         observer.observe(wrapper, { childList: true, subtree: true });

//         return () => {
//             cancelAnimationFrame(refocusRaf);
//             observer.disconnect();
//             input.removeEventListener('focus', onFocus);
//             input.removeEventListener('blur', onBlur);
//         };
//     }, []);


//     const isVirtialization = dataArray.length > 5000;

//     const decorateChipChrome = useCallback(() => {
//         const wrapper = wrapperRef.current;
//         if (!wrapper) return;

//         wrapper.querySelectorAll(KENDO_MS_DOM.chipRemoveIcon).forEach((icon) => {
//             if (!icon.classList.contains('icon-rs-circle-minus-fill-mini')) {
//                 icon.classList.add('icon-rs-circle-minus-fill-mini');
//             }
//             if (icon.getAttribute('title') !== 'Remove') {
//                 icon.setAttribute('title', 'Remove');
//                 icon.setAttribute('rel', 'tooltip');
//             }
//         });

//         wrapper.querySelectorAll(KENDO_MS_DOM.clearButton).forEach((clearBtn) => {
//             if (clearBtn.getAttribute('title') !== 'Clear all') {
//                 clearBtn.setAttribute('title', 'Clear all');
//                 clearBtn.setAttribute('aria-label', 'Clear all');
//             }
//         });
//     }, []);

//     useEffect(() => {
//         const wrapper = wrapperRef.current;
//         if (!wrapper) return undefined;

//         let rafId = 0;
//         const scheduleDecorate = () => {
//             cancelAnimationFrame(rafId);
//             rafId = requestAnimationFrame(decorateChipChrome);
//         };

//         const observer = new MutationObserver(scheduleDecorate);
//         observer.observe(wrapper, { childList: true, subtree: true });
//         scheduleDecorate();

//         return () => {
//             cancelAnimationFrame(rafId);
//             observer.disconnect();
//         };
//     }, [decorateChipChrome]);

//     useEffect(() => {
//         if (!isVirtialization) return;
//         const filter = activeVirtualFilterRef.current;
//         if (filter != null) {
//             const filtered = filterBy(dataArray, filter);
//             setVirtualListTotal(filtered.length);
//             setDropdownItems({
//                 skip: 0,
//                 options: filtered.slice(0, pageSize),
//             });
//         } else {
//             setVirtualListTotal(dataArray.length);
//             setDropdownItems({
//                 skip: 0,
//                 options: dataArray.slice(0, pageSize),
//             });
//         }
//     }, [virtualDataContentKey, isVirtialization]);

//         // useEffect(() => {
//         //     const handleClickOutside = (event) => {
//         //         if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
//         //             setOpened(false);
//         //         }
//         //     };
//         //     document.addEventListener('mousedown', handleClickOutside);
//         //     return () => {
//         //         document.removeEventListener('mousedown', handleClickOutside);
//         //     };
//         // }, []);

//     const handleClose = (event) => {};

//     const onPageChange = (event) => {
//         if (!isVirtialization) return;
//         const skip = event.page.skip;
//         const filter = activeVirtualFilterRef.current;
//         const source = filter != null ? filterBy(dataArray, filter) : dataArray;
//         const end = Math.min(skip + pageSize, source.length);

//         setDropdownItems({
//             skip,
//             options: source.slice(skip, end),
//         });
//     };

//     const filterChange = (event) => {
//         if (isVirtialization) {
//             activeVirtualFilterRef.current = event.filter ?? null;
//             const filteredOptions = filterBy(dataArray, event.filter);
//             setVirtualListTotal(filteredOptions.length);
//             setDropdownItems({
//                 skip: 0,
//                 options: filteredOptions.slice(0, pageSize),
//             });
//         } else {
//             setData(filterBy(dataArray, event.filter));
//         }
//         handleFilterChange(event);
//     };

//     const normalizePopupPosition = () => {
//         const wrapper = wrapperRef.current;
//         if (!wrapper) return;
//         const popupContainer = wrapper.querySelector(KENDO_MS_DOM.popupContainer);
//         if (!popupContainer) return;
//         // Keep popup anchored to its wrapper to avoid negative/incorrect left offsets.
//         popupContainer.style.left = '0px';
//     };

//     const handleMultiSelectOpen = useCallback(() => {
//         requestAnimationFrame(normalizePopupPosition);
//         setTimeout(normalizePopupPosition, 0);
//         if (!isVirtialization) return;
//         const filter = activeVirtualFilterRef.current;
//         if (filter == null) return;
//         const filtered = filterBy(dataArrayRef.current, filter);
//         setVirtualListTotal(filtered.length);
//         setDropdownItems({
//             skip: 0,
//             options: filtered.slice(0, pageSize),
//         });
//     }, [isVirtialization]);

//     const virtualization = isVirtialization
//         ? {
//               virtual: {
//                   total: virtualListTotal,
//                   pageSize,
//                   skip: dropdownItems.skip,
//               },
//               onPageChange,
//           }
//         : {};

//     const customRender = (li, itemProps) => {
//         const title = _isObject(itemProps.dataItem) ? _get(itemProps, `dataItem?.${textField}`) : itemProps.dataItem;
//         const props = {
//             ...li.props,
//             title,
//         };
//         const itemChildren = <span>{li.props.children}</span>;
//         return React.cloneElement(li, props, itemChildren);
//     };
//     const tagRender = (tagData, li) => {
//         const firstTag = tagData?.data?.[0];
//         const tagCount = firstTag?.count;
//         const tagLabel = firstTag?.data ?? firstTag?.text ?? '';
//         return React.cloneElement(li, {
//             ...li.props,
//             className: tagCount ? 'multiSelect_Count' : 'multiSelect_NoCount',
//             children: [
//                 <span key="custom-tag" className="custom-tag" data-count={tagCount}>
//                     {normalizeDisplayText(tagLabel)}
//                 </span>,
//                 ...React.Children.toArray(li.props.children),
//             ],
//         });
//     };

//     const resolvedFooter = typeof footer === 'function' ? footer() : footer;
//     const showLoader = loading || isLoading;

//     const applyTruncationTitle = useCallback((el, { setCursor = false } = {}) => {
//         const fullText = (el.textContent || '').trim();
//         const isTruncated = fullText && el.scrollWidth > el.clientWidth + 1;
//         const nextTitle = isTruncated ? fullText : null;
//         const currentTitle = el.getAttribute('title');

//         if (nextTitle) {
//             if (currentTitle !== nextTitle) el.setAttribute('title', nextTitle);
//             if (setCursor && el.style.cursor !== 'default') el.style.cursor = 'default';
//         } else {
//             if (currentTitle != null) el.removeAttribute('title');
//             if (setCursor && el.style.cursor) el.style.cursor = '';
//         }
//     }, []);

//     useEffect(() => {
//         const wrapperElement = wrapperRef.current;
//         if (!wrapperElement) return undefined;

//         let rafId = 0;
//         const addTitleToChips = () => {
//             wrapperElement.querySelectorAll(KENDO_MS_DOM.chip).forEach((chip) => {
//                 const customTag = chip.querySelector('.custom-tag');
//                 if (customTag) {
//                     applyTruncationTitle(customTag, { setCursor: true });
//                     return;
//                 }
//                 const chipLabel = chip.querySelector(KENDO_MS_DOM.chipLabel);
//                 if (chipLabel) applyTruncationTitle(chipLabel, { setCursor: true });
//                 const chipContent = chip.querySelector(KENDO_MS_DOM.chipContent);
//                 if (chipContent) applyTruncationTitle(chipContent);
//             });
//         };

//         const scheduleChipTitles = () => {
//             cancelAnimationFrame(rafId);
//             rafId = requestAnimationFrame(addTitleToChips);
//         };

//         const observer = new MutationObserver(scheduleChipTitles);
//         observer.observe(wrapperElement, { childList: true, subtree: true });
//         scheduleChipTitles();

//         return () => {
//             cancelAnimationFrame(rafId);
//             observer.disconnect();
//         };
//     }, [applyTruncationTitle]);

//     useEffect(() => {
//         if (!showTitleOnTruncate) return;

//         const addTitleToInput = () => {
//             const wrapperElement = wrapperRef.current;
//             if (!wrapperElement) return;
            
//             const inputElement = wrapperElement.querySelector(KENDO_MS_DOM.inputInner);
            
//             if (inputElement) {
//                 void inputElement.offsetHeight;
//                 const fullValue = (inputElement.value || '').trim();
//                 const isTruncated = inputElement.scrollWidth > inputElement.clientWidth + 1;
                
//                 if (isTruncated && fullValue) {
//                     inputElement.setAttribute('title', fullValue);
//                     inputElement.style.cursor = 'default';
//                 } else {
//                     inputElement.removeAttribute('title');
//                     inputElement.style.cursor = '';
//                 }
//             }
//         };

//         const handleInputChange = () => {
//             requestAnimationFrame(() => {
//                 addTitleToInput();
//             });
//         };

//         const inputElement = wrapperRef.current?.querySelector(KENDO_MS_DOM.inputInner);
//         if (inputElement) {
//             inputElement.addEventListener('input', handleInputChange);
//             inputElement.addEventListener('change', handleInputChange);
//             inputElement.addEventListener('keyup', handleInputChange);
//             inputElement.addEventListener('focus', handleInputChange);
//         }

//         requestAnimationFrame(() => {
//             addTitleToInput();
//             setTimeout(() => addTitleToInput(), 100);
//         });

//         return () => {
//             if (inputElement) {
//                 inputElement.removeEventListener('input', handleInputChange);
//                 inputElement.removeEventListener('change', handleInputChange);
//                 inputElement.removeEventListener('keyup', handleInputChange);
//                 inputElement.removeEventListener('focus', handleInputChange);
//             }
//         };
//     }, [showTitleOnTruncate, dataArray, tempData]);

//     return (
//         <Controller
//             rules={rules}
//             control={control}
//             name={name}
//             defaultValue={defaultValue}
//             render={({ field: { onChange, onBlur, ...restfield }, fieldState: { error } }) => {
//                 const _isEmpty = _get(error, 'message', '')?.length > 0;
//                 let errMsg = _get(error, 'message', '');
//                 return (
//                     <div
//                         className={`${_isEmpty ? 'errorContainer' : ''} rs-kendo-multi-dropdownmenu-wrapper`}
//                         ref={wrapperRef}
//                     >
//                         <div className="rskmd-arrow"></div>
//                         {showLoader && (
//                             <div className="rs-inputIcon-wrapper right25">
//                                 <div className="segment_loader"></div>
//                             </div>
//                         )}
//                         <MultiSelect
//                             className={`rs-kendo-multi-dropdown ${className} ${
//                                 required ? 'rs-kendo-multi-dropdown-required' : ''
//                             } ${disabled ? 'k-disabled-nodata k-disabled' : ''}`}
//                             allowCustom={allowCustom}
//                             maxLength={15}
//                             label={_isEmpty ? errMsg : label}
//                             data={isVirtialization ? dropdownItems.options : tempData}
//                             // data={dropdownItems.options}
//                             filterable={true}
//                             itemRender={isCustomRender ? itemRender : customRender}
//                             textField={textField}
//                             dataItemKey={dataItemKey}
//                             onFilterChange={filterChange}
//                             // listNoDataRender={() => NoDataAvailableRender('')}
//                             listNoDataRender={resolvedFooter ? () => null : undefined}
//                             onChange={(e) => {
//                                 // var regex = /^[a-zA-Z]+$/;
//                                 // if (test(e.target.state.text) && e.target.state.text?.length < 15) {
//                                 // }
//                                 if (isCustomOnchange) {
//                                     if (e.target?.value?.length === limitLength + 1) {
//                                         setError(name, { type: 'custom', message: customErrorMessage });
//                                         return;
//                                     } else {
//                                         clearErrors(name);
//                                         handleChange(e);
//                                         onChange(e);
//                                     }
//                                 } else {
//                                     handleChange(e);
//                                     onChange(e);
//                                 }
//                                 requestAnimationFrame(() => {
//                                     normalizePopupPosition();
//                                     decorateChipChrome();
//                                 });
//                                 // setOpened(true);
//                             }}
//                             onBlur={(e) => {
//                                 handleOnBlur(e);
//                                 onBlur(e);
//                                 // setOpened(true);
//                             }}
//                             popupSettings={{
//                                 animate: true,
//                                 appendTo: wrapperRef.current,
//                             }}
//                             onOpen={handleMultiSelectOpen}
//                             disabled={disabled}
//                             {...(dataArray.length > 5000 && virtualization)}
//                             {...(resolvedFooter && { footer: resolvedFooter })}
//                             {...rest}
//                             {...restfield}
//                             value={
//                                 Array.isArray(restfield?.value)
//                                     ? restfield.value
//                                     : restfield?.value
//                                       ? [restfield.value]
//                                       : []
//                             }
//                             // {...(isCustomMultiSelect
//                             //     ? {
//                             //           opened: opened,
//                             //           onOpen: () => setOpened(true),
//                             //           onClose: () => setOpened(true),
//                             //       }
//                             //     : {})}
//                             tagRender={isTagRender ? tagRender : undefined}
//                         />
//                     </div>
//                 );
//             }}
//         />
//     );
// };

// RSMultiSelect.propTypes = {
//     className: PropTypes.string,
//     clearErrors: PropTypes.func,
//     defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
//     rules: PropTypes.object,
//     setError: PropTypes.func,
//     setValue: PropTypes.func,
//     control: PropTypes.object.isRequired,
//     name: PropTypes.string.isRequired,
//     data: PropTypes.array,
//     required: PropTypes.bool,
//     allowCustom: PropTypes.bool,
//     handleChange: PropTypes.func,
//     handleOnBlur: PropTypes.func,
//     textField: PropTypes.string,
//     dataItemKey: PropTypes.string,
//     isCustomRender: PropTypes.bool,
//     itemRender: PropTypes.func,
//     handleClose: PropTypes.func,
//     showTitleOnTruncate: PropTypes.bool,
//     isTagRender: PropTypes.bool,
//     footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
//     loading: PropTypes.bool,
//     isLoading: PropTypes.bool,
//     //isCustomMultiSelect: PropTypes.bool,
// };

// export default memo(RSMultiSelect);

export { default } from 'Pages/KendoDocs/CommonComponents/ResMultiSelect';