
//  import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import _get from 'lodash/get';
// import _orderBy from 'lodash/orderBy';
// import PropTypes from 'prop-types';

// import { DropDownList } from '@progress/kendo-react-dropdowns';
// import { get } from 'lodash';
// import { Controller, useWatch } from 'react-hook-form';
// 
// import { normalizeDisplayText } from 'Utils/modules/stringUtils';
// import { filterBy } from '@progress/kendo-data-query';

// const RSKendoDropDownList = ({
//     control,
//     rules,
//     name,
//     defaultValue = '',
//     data = [],
//     textField,
//     dataItemKey,
//     value,
//     onChange,
//     className = '',
//     popupClass = '',
//     required,
//     isLoading = false,
//     handleChange = () => {},
//     label,
//     isError = true,
//     itemRender = () => {},
//     isCustomRender = false,
//     rightAlign = false,
//     noBottomBorder = false,
//     filterName,
//     placeholder = '',
//     order,
//     handleOnBlur = () => {},
//     isTagRender = false,
//     handleFilterChange = () => {},
//     isShowBordertip = false,
//     header,
//     footer,
//     subLabel,
//     valueRender,
//     itemDisabled,
//     ...rest
// }) => {
//     const resolvedHeader = typeof header === 'function' ? header() : header;
//     const resolvedFooter = typeof footer === 'function' ? footer() : footer;
//     const subLabelResolved =
//         subLabel != null
//             ? subLabel
//             : (item) => (item != null ? String(_get(item, 'subLabel', '') ?? '') : '');
//     const normalizeItem = useCallback(
//         (item) => {
//             if (typeof item === 'string') return normalizeDisplayText(item);
//             if (!_isObject(item)) return item;

//             const nextItem = { ...item };
//             if (textField && typeof nextItem[textField] === 'string') {
//                 nextItem[textField] = normalizeDisplayText(nextItem[textField]);
//             }
//             if (typeof nextItem.subLabel === 'string') {
//                 nextItem.subLabel = normalizeDisplayText(nextItem.subLabel);
//             }
//             return nextItem;
//         },
//         [textField],
//     );
//     const normalizedData = useMemo(
//         () => (Array.isArray(data) ? data.map(normalizeItem) : []),
//         [data, normalizeItem],
//     );
//     const getComparableItem = useCallback(
//         (item) => {
//             if (!_isObject(item)) return item;

//             if (dataItemKey && item?.[dataItemKey] !== undefined) return item[dataItemKey];
//             if (item?.id !== undefined) return item.id;
//             if (item?.value !== undefined) return item.value;
//             if (textField && item?.[textField] !== undefined) return item[textField];

//             return JSON.stringify(item);
//         },
//         [dataItemKey, textField],
//     );
//     const isSameDataList = useCallback(
//         (left = [], right = []) =>
//             Array.isArray(left) &&
//             Array.isArray(right) &&
//             left.length === right.length &&
//             left.every((item, idx) => getComparableItem(item) === getComparableItem(right[idx])),
//         [getComparableItem],
//     );
//     const useSubLabel =
//         subLabel != null ||
//         normalizedData.some((item) => String(_get(item, 'subLabel', '')).trim() !== '');

//     const [sortedData, setSortedData] = useState([]);
//     const total = normalizedData?.length;
//     const pageSize = 100;
//     const isVirtialization = total > 5000;
//     const containerWrapper = useRef();
//     const [state, setState] = useState({
//         skip: 0,
//         options: sortedData?.slice(0, pageSize),
//     });
//     const [isInsidePopup, setIsInsidePopup] = useState(false);
//     const [dropdownPosition, setDropdownPosition] = useState('below'); // 'above' or 'below'
//     const currentPopupRef = useRef(null);
//     const watchedValue = useWatch({
//         control,
//         name
//     });

//     const findPopupContainer = () => {
//         try {
//             const ownsEl = containerWrapper.current?.querySelector('[aria-owns]');
//             const ownsId = ownsEl?.getAttribute('aria-owns');
//             if (!ownsId) return null;
//             const listContainer = document.getElementById(ownsId);
//             const popupContainer = listContainer?.closest('.k-animation-container');
//             return popupContainer || null;
//         } catch (e) {
//             return null;
//         }
//     };

//     // Position calculation and application functions
//     const getDropdownPosition = (ref, popupContainerParam = null) => {
//         // Prefer measuring the most recent Kendo animation container, if available
//         try {
//             const animationContainer = popupContainerParam || currentPopupRef.current || findPopupContainer();
//             const triggerEl = ref?.current || null;

//             if (animationContainer && triggerEl) {
//                 const popupRect = animationContainer.getBoundingClientRect();
//                 const triggerRect = triggerEl.getBoundingClientRect();

//                 // Robust orientation: compare vertical centers (works even with overlap/arrow)
//                 const popupCenterY = (popupRect.top + popupRect.bottom) / 2;
//                 const triggerCenterY = (triggerRect.top + triggerRect.bottom) / 2;
//                 return popupCenterY < triggerCenterY ? 'above' : 'below';
//             }
//         } catch (e) {
//             // ignore and use fallback below
//         }

//         if (!ref?.current) return 'below';

//         // Fallback: decide based on available viewport space around the trigger
//         const { top, bottom } = ref.current.getBoundingClientRect();
//         const viewportHeight = window.innerHeight;
//         const estimatedDropdownHeight = 240; // reasonable default height
//         const spaceBelow = viewportHeight - bottom;
//         const spaceAbove = top;

//         return spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow ? 'above' : 'below';
//     };

//     const applyPositionClass = (position, popupContainerParam = null) => {
//         if (!isShowBordertip) return false;
//         // Use the popup that belongs to this dropdown if possible
//         const animationContainer = popupContainerParam || currentPopupRef.current || findPopupContainer();
//         if (!animationContainer) return false;

//         // Always add the custom class for dropdowns with more than 5 items
//         if (normalizedData?.length > 5) {
//             if (!animationContainer.classList.contains('rs-kendo-dd-popup')) {
//                 animationContainer.classList.add('rs-kendo-dd-popup');
//             }
//         }

//         // Add popupClass to animation container if provided
//         if (popupClass && !animationContainer.classList.contains(popupClass)) {
//             animationContainer.classList.add(popupClass);
//         }

//         // Get position class and apply to all relevant elements
//         const posClass = position === 'above' ? 'showing-top' : 'showing-below';
//         const elements = [animationContainer, ...animationContainer.querySelectorAll('.k-popup, .k-list-container, .k-list')];

//         elements.forEach((el) => {
//             el.classList.remove('showing-top', 'showing-below');
//             el.classList.add(posClass);
//         });

//         return true;
//     };

//     const checkDropdownPosition = () => {
//         const position = getDropdownPosition(containerWrapper);
//         setDropdownPosition(position);
//         return position;
//     };

//     const addPositionClassToAnimationContainer = (pos = null) => {
//         const popupContainer = currentPopupRef.current || findPopupContainer();
//         const position = pos || getDropdownPosition(containerWrapper, popupContainer);

//         setTimeout(() => {
//             if (applyPositionClass(position, popupContainer)) return;

//             // Fallback: watch for dynamic DOM render
//             const observer = new MutationObserver(() => {
//                 const freshPopup = currentPopupRef.current || findPopupContainer();
//                 if (applyPositionClass(position, freshPopup)) observer.disconnect();
//             });
//             observer.observe(document.body, { childList: true, subtree: true });
//             setTimeout(() => observer.disconnect(), 2000);
//         }, 50);
//     };

//     useEffect(() => {
//         if (isVirtialization) {
//             setState((prev) => ({
//                 options: sortedData.slice(0, pageSize),
//                 skip: prev.skip,
//             }));
//         }
//     }, [normalizedData, sortedData, isVirtialization]);

//     useEffect(() => {
//         if (filterName) {
//             const orderByData = _orderBy(normalizedData, [filterName], [order ? order : 'asc']);
//             if (!isSameDataList(orderByData, sortedData)) setSortedData(orderByData);
//         } else {
//             if (!Array.isArray(normalizedData)) return;
//             if (!isSameDataList(normalizedData, sortedData)) setSortedData(normalizedData);
//         }
//     }, [normalizedData, filterName, order, sortedData, isSameDataList]);

//     // Check if dropdown is inside a popup/modal
//     useEffect(() => {
//         if (containerWrapper.current) {
//             const isInPopup = containerWrapper.current.closest('.k-animation-container, .k-dialog, .k-window, [role="dialog"]');
//             setIsInsidePopup(!!isInPopup);
//         }
//     }, [containerWrapper]);

//     // Check dropdown position on mount and window resize
//     useEffect(() => {
//         const handleResize = () => {
//             checkDropdownPosition();
//         };

//         window.addEventListener('resize', handleResize);
//         checkDropdownPosition(); // Check on mount

//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, []);

//     // Handle scroll to update dropdown position
//     useEffect(() => {
//         const handleScrollPosition = () => {
//             const position = checkDropdownPosition();
//             setDropdownPosition(position);
//         };

//         window.addEventListener('scroll', handleScrollPosition, true);
//         return () => window.removeEventListener('scroll', handleScrollPosition, true);
//     }, []);

//     // Apply position class when dropdown position changes
//     useEffect(() => {
//         if (dropdownPosition) {
//             addPositionClassToAnimationContainer(dropdownPosition);
//         }
//     }, [dropdownPosition]);

//     const customRender = (li, itemProps) => {
//         const title = _isObject(itemProps.dataItem) ? _get(itemProps, `dataItem?.${textField}`) : itemProps.dataItem;
//         const props = {
//             ...li.props,
//             title,
//         };
//         const isDisabled =
//             !!itemDisabled &&
//             (_isObject(itemProps.dataItem)
//                 ? _get(itemProps.dataItem, itemDisabled, false)
//                 : itemProps.dataItem?.[itemDisabled]);
//         if (isDisabled) {
//             props.className = `${props.className || ''} click-off`.trim();
//         }
//         const subLabelText =
//             typeof subLabelResolved === 'function'
//                 ? subLabelResolved(itemProps?.dataItem)
//                 : subLabelResolved;
//         const showSubLabel =
//             subLabelText != null && String(subLabelText).trim() !== '';
//         const itemChildren = showSubLabel ? (
//             <span className="rs-dd-value-rows">
//                 <span className="rs-dd-sub-label fs14" title={subLabelText}>{subLabelText}</span>
//                 <span>{li.props.children}</span>
//             </span>
//         ) : (
//             <span>{li.props.children}</span>
//         );
//         return React.cloneElement(li, props, itemChildren);
//     };

//     const subLabelValueRender =
//         useSubLabel && !valueRender
//             ? (element, value) => {
//                   const dataItem = _isObject(value)
//                       ? value
//                       : (normalizedData || []).find((item) => _get(item, dataItemKey) === value);
//                   const keyVal = _isObject(dataItem) ? _get(dataItem, dataItemKey) : value;
//                   const resolvedItem =
//                       keyVal != null && (normalizedData || []).length
//                           ? (normalizedData || []).find((item) => _get(item, dataItemKey) === keyVal) || dataItem
//                           : dataItem;
//                   const name = _isObject(resolvedItem) ? _get(resolvedItem, textField, '') : value;
//                   if (!name) return element;
//                   const subLabelText =
//                       typeof subLabelResolved === 'function'
//                           ? subLabelResolved(resolvedItem || value)
//                           : (resolvedItem?.subLabel ?? subLabelResolved ?? '');
//                   const showSubLabel = subLabelText != null && String(subLabelText).trim() !== '';
//                   return React.cloneElement(
//                       element,
//                       { ...element.props, title: showSubLabel ? `${name} - ${subLabelText}` : name },
//                       showSubLabel ? (
//                           <span className="rs-dd-value-rows">
//                               <span className="rs-dd-sub-label fs14" title={subLabelText}>{subLabelText}</span>
//                               <span>{name}</span>
//                           </span>
//                       ) : (
//                           <span>{name}</span>
//                       )
//                   );
//               }
//             : undefined;

//     // Function to get the selected value text for title attribute
//     const getSelectedValueText = (selectedValue ='') => {
//         if (!selectedValue) return '';
        
//         if (_isObject(selectedValue)) {
//             return _get(selectedValue, textField, '');
//         }
//         return selectedValue;
//     };

//     // useEffect(() => {
//     //     if (filterName) {
//     //         const orderByData = _orderBy(data, [filterName], [order || 'asc']);
//     //         setSortedData(orderByData);
//     //     } else {
//     //         data?.length && setSortedData(data);
//     //     }
//     // }, [data, filterName, order]);

//     useEffect(() => {
//         if (isVirtialization) {
//             setState({
//                 options: sortedData.slice(0, pageSize),
//                 skip: 0,
//             });
//         }
//     }, [sortedData, isVirtialization]);

//     const onPageChange = (event) => {
//         const skip = event.page.skip;
//         const take = Math.min(skip + pageSize, total);

//         setState({
//             options: sortedData.slice(skip, take),
//             skip,
//         });
//     };

//     const virtualization = isVirtialization
//         ? {
//               virtual: {
//                   total,
//                   pageSize,
//                   skip: state.skip,
//               },
//               onPageChange,
//           }
//         : {};
//      useEffect(() => {
//     const handleScroll = (event) => {
//         const popup = document.querySelector('.k-child-animation-container');
//         const dropdownElement = containerWrapper.current;
//         const target = event?.target;
//         const isElementTarget = target instanceof Element;

//         // Check if the scroll event is coming from within the dropdown or its popup
//         if (popup && dropdownElement) {
//             const isWithinDropdown =
//                 (isElementTarget && dropdownElement.contains(target)) ||
//                 (isElementTarget && popup.contains(target)) ||
//                 (isElementTarget &&
//                     (
//                         target.closest('.k-child-animation-container') ||
//                         target.closest('.k-popup') ||
//                         target.closest('.k-list-container') ||
//                         target.closest('.k-list') ||
//                         target.closest('.k-list-content') ||
//                         target.closest('.k-list-filter')
//                     ));

//             // Only blur if scrolling outside the dropdown and its popup
//             if (!isWithinDropdown) {
//                 if (
//                     document.activeElement &&
//                     typeof document.activeElement.blur === 'function'
//                 ) {
//                     document.activeElement.blur();
//                 }
//             }
//         }
//     };

//     window.addEventListener('scroll', handleScroll, true);

//     return () => {
//         window.removeEventListener('scroll', handleScroll, true);
//     };
// }, []);

// useEffect(() => {
//     const updateSearchIconAndPlaceholder = () => {
//         // Updated selector based on latest Kendo HTML
//         const searchIcons = document.querySelectorAll(
//             '.k-input-icon.k-svg-icon.k-svg-i-search'
//         );

//         searchIcons.forEach((icon) => {
//             if (!icon.classList.contains('icon-rs-circle-zoom-fill-edge-medium')) {
//                 icon.className =
//                     'k-input-icon position-absolute top2 right0 icon-md color-secondary-grey icon-rs-circle-zoom-fill-edge-medium';
//             }
//         });

//         // Updated selector for filter input
//         const filterInputs = document.querySelectorAll(
//             '.k-list-filter .k-input-inner'
//         );

//         filterInputs.forEach((input) => {
//             if (input.tagName === 'INPUT') {
//                 const parentInput = input.closest('.k-input');
//                 const hasSearchIcon =
//                     parentInput &&
//                     parentInput.querySelector(
//                         '.k-input-icon, .k-svg-i-search'
//                     );

//                 if (hasSearchIcon) {
//                     input.placeholder = 'Search..';
//                 }

//                 if (!input.classList.contains('pr28')) {
//                     input.classList.add('pr28');
//                 }
//             }
//         });
//     };

//     updateSearchIconAndPlaceholder();

//     const observer = new MutationObserver(() => {
//         updateSearchIconAndPlaceholder();
//     });

//     if (containerWrapper.current) {
//         observer.observe(containerWrapper.current, {
//             childList: true,
//             subtree: true
//         });
//     }

//     // Observe popup rendered outside component tree
//     observer.observe(document.body, {
//         childList: true,
//         subtree: true,
//         attributes: true,
//         attributeFilter: ['class']
//     });

//     return () => observer.disconnect();
// }, []);
//      const filterChange = (event) => {
//             const searchValue = event?.filter?.value || '';
//             if (!searchValue.trim()) {
//                 setSortedData(normalizedData.slice());
//                 return;
//             }
//             const filteredOptions = filterBy(normalizedData.slice(), event.filter);
//             setSortedData(filteredOptions);
//             if (filteredOptions?.length === 0) {
//                 handleFilterChange(event);
//             }
//         };
//          const handleSubClass = () => {
//             if (watchedValue?.subLabel && useSubLabel) {
//                 return 'dropdown-sublabel';
//             }
//             return '';
//          };
//     return (
//         <Controller
//             control={control}
//             rules={rules}
//             defaultValue={defaultValue}
//             name={name}
//             label = {placeholder}
//             render={({ field: { onChange, onBlur, ...restField }, fieldState: { error } }) => {
//                 const _isEmpty = get(error, 'message', '')?.length > 0;
//                 const errMsg = get(error, 'message', '');
//                 const selectedValueText = getSelectedValueText(restField?.value);
                
//                 return (
//                     <div
//                         className={`rs-kendo-dropdownmenu-wrapper ${handleSubClass()} ${className} ${_isEmpty ? 'errorContainer' : ''} ${rightAlign ? 'kendo-dd-right-align' : ''
//                             } ${noBottomBorder ? 'kendo-dd-no-bottom-border' : ''} position-relative`}
//                         ref={containerWrapper}
//                     >
//                         {isLoading && (
//                             <div className="rs-inputIcon-wrapper right25">
//                                 <div className="segment_loader"></div>
//                             </div>
//                         )}
//                         {/* {_isEmpty && <div className="validation-message">{get(error, 'message', '')}</div>} */}
//                         <DropDownList
//                             disabled={isLoading}
//                             className={`rs-kendo-dropdown ${required ? 'rs-kendo-dropdown-required' : ''}`}
//                             data={isVirtialization ? state.options : sortedData}
//                             label={_isEmpty && isError ? errMsg : label}
//                             textField={textField}
//                             dataItemKey={dataItemKey}
//                             onChange={(e) => {
//                                 const selectedValue = e.value !== undefined ? e.value : e.target?.value;
//                                 onChange(selectedValue);
//                                 handleChange(e);
//                                 if (e.target) {
//                                     e.target.filterValue = '';
//                                     e.target.state.text = '';
//                                 }
//                                 if (filterName) {
//                                     const orderByData = _orderBy(normalizedData, [filterName], [order ? order : 'asc']);
//                                     setSortedData(orderByData);
//                                 } else {
//                                     setSortedData(normalizedData.slice());
//                                 }
//                             }}
//                             onBlur={(e)=>{
//                                 handleOnBlur(e)
//                                 onBlur(e)
//                             }}
//                             onOpen={() => {
//                                 // Wait a tick for Kendo to render popup, then bind it
//                                 setTimeout(() => {
//                                     currentPopupRef.current = findPopupContainer();
//                                     const pos = getDropdownPosition(containerWrapper, currentPopupRef.current);
//                                     setDropdownPosition(pos);
//                                     addPositionClassToAnimationContainer(pos);
                                    
//                                     // Add popupClass to animation container if provided
//                                     if (popupClass && currentPopupRef.current) {
//                                         if (!currentPopupRef.current.classList.contains(popupClass)) {
//                                             currentPopupRef.current.classList.add(popupClass);
//                                         }
//                                     }
//                                 }, 0);
//                             }}
//                             onClose={(e) => {
//                                 if (e.target) {
//                                     e.target.filterValue = '';
//                                     e.target.state.text = '';
//                                 }
//                                 currentPopupRef.current = null;
//                                 if (filterName) {
//                                     const orderByData = _orderBy(normalizedData, [filterName], [order ? order : 'asc']);
//                                     setSortedData(orderByData);
//                                 } else {
//                                     setSortedData(normalizedData.slice());
//                                 }
//                             }}
//                             filterable={normalizedData?.length > 5}
//                             onFilterChange={filterChange}
//                             popupSettings={{
//                                 animate: true,
//                                 popupClass: `${popupClass}`,
//                                 ...(isInsidePopup && { appendTo: containerWrapper.current || undefined })
//                             }}
//                             itemRender={isCustomRender ? itemRender : customRender}
//                             itemDisabled={itemDisabled}
//                             {...((valueRender || subLabelValueRender) && {
//                                 valueRender: valueRender || subLabelValueRender,
//                             })}
//                             listNoDataRender={resolvedFooter ? () => null : undefined}
//                             {...(normalizedData?.length > 5000 && virtualization)}
//                             {...restField}
//                             {...(resolvedHeader && { header: resolvedHeader })}
//                             {...(resolvedFooter && { footer: resolvedFooter })}
//                             {...rest}
//                             {...(isTagRender && selectedValueText && { title: selectedValueText })}
//                         />
//                     </div>
//                 );
//             }}
//         />
//     );
// };

// RSKendoDropDownList.propTypes = {
//     control: PropTypes.object.isRequired,
//     name: PropTypes.string.isRequired,
//     data: PropTypes.array,
//     className: PropTypes.string,
//     popupClass: PropTypes.string,
//     placeholder: PropTypes.string,
//     clearErrors: PropTypes.func,
//     defaultValue: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number,
//         PropTypes.array,
//         PropTypes.object,
//         PropTypes.oneOf([null, undefined]),
//     ]),
//     rules: PropTypes.object,
//     setError: PropTypes.func,
//     setValue: PropTypes.func,
//     textField: PropTypes.string,
//     dataItemKey: PropTypes.string,
//     onChange: PropTypes.func,
//     required: PropTypes.bool,
//     handleChange: PropTypes.func,
//     isError: PropTypes.bool,
//     isCustomRender: PropTypes.bool,
//     itemRender: PropTypes.func,
//     rightAlign: PropTypes.bool,
//     noBottomBorder: PropTypes.bool,
//     isTagRender: PropTypes.bool,
//     isShowBordertip: PropTypes.bool,
//     header: PropTypes.node,
//     footer: PropTypes.node,
//     subLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
//     valueRender: PropTypes.func,
//     itemDisabled: PropTypes.string,
// };

// export default memo(RSKendoDropDownList);

// // For Icon update
// // useEffect(() => {
// //     const arrowIcon = document.getElementsByClassName('k-i-caret-alt-down');
// //     [...arrowIcon].forEach((x) => {
// //         const element = [...x.classList];
// //         // if (!element.includes('icon-rs-caret-mini')) {
// //         //     x.className += ' icon-rs-caret-mini';
// //         // }
// //     });
// // }, []);
export { default } from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';