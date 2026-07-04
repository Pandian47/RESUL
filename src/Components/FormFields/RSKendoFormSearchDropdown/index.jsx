
import { cloneElement, memo, useEffect, useRef, useState } from 'react';
import { get as _get, get } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';
import { _isObject } from 'Utils/modules/misc';

import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Controller } from 'react-hook-form';
import NoDataAvailableRender from '../Component/NoDataAvailableRender';

import { filterBy } from '@progress/kendo-data-query';

const RSKendoFormSearchDropdown = ({
    control,
    rules,
    name,
    defaultValue = '',
    data = [],
    textField,
    dataItemKey,
    value,
    onChange,
    className = '',
    popupClass = '',
    required,
    handleChange = () => {},
    label,
    isError = true,
    itemRender = () => {},
    isCustomRender = false,
    rightAlign = false,
    noBottomBorder = false,
    footer = null,
    handleFilterChange = () => {},
    isLoading = false,
    ...rest
}) => {
    const containerWrapperSearch = useRef(null);
    const [dataActual, setDataActual] = useState(data.slice());
    const [dropdownPosition, setDropdownPosition] = useState('below'); // 'above' or 'below'
    const pageSize = 100;
    const total = dataActual?.length;
    const [state, setState] = useState({
        skip: 0,
        options: dataActual?.slice(0, pageSize),
    });
    const filterData = (filter) => {
        const sliceData = data.slice();
        return filterBy(sliceData, filter);
    };
    const filterChange = (event) => {
        const searchValue = event?.filter?.value || '';
        if (!searchValue.trim()) {
            setDataActual(data.slice());
            return;
        }
        const filteredOptions = filterBy(data.slice(), event.filter);
        
        // Sort filtered results to show exact matches first
        const sortedOptions = filteredOptions.sort((a, b) => {
            const aText = _isObject(a) ? _get(a, textField, '') : a;
            const bText = _isObject(b) ? _get(b, textField, '') : b;
            const aLower = String(aText).toLowerCase();
            const bLower = String(bText).toLowerCase();
            const searchLower = searchValue.toLowerCase();
            
            // Exact match (case-insensitive)
            const aExact = aLower === searchLower;
            const bExact = bLower === searchLower;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            
            // Starts with search term
            const aStarts = aLower.startsWith(searchLower);
            const bStarts = bLower.startsWith(searchLower);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // Alphabetical order for remaining items
            return aLower.localeCompare(bLower);
        });
        
        setDataActual(sortedOptions);
        if (sortedOptions?.length === 0) {
            handleFilterChange(event);
        }
    };
    useEffect(() => {
       if(data?.length) {
         setDataActual(data.slice());
       } else{
            setDataActual([]);
       }
    }, [JSON.stringify(data)]);
    
    // Check dropdown position on mount and window resize
    useEffect(() => {
        const handleResize = () => {
            checkDropdownPosition();
        };

        window.addEventListener('resize', handleResize);
        checkDropdownPosition(); // Check on mount

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    useEffect(() => {
    const handleScroll = () => {
        const position = checkDropdownPosition();
        setDropdownPosition(position);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
}, []);

useEffect(() => {
    if (dropdownPosition) {
        addPositionClassToAnimationContainer(dropdownPosition);
    }
}, [dropdownPosition]);


    const onPageChange = (event) => {
        const skip = event.page.skip;
        const take = skip + event.page.take;
        const options = data.slice(skip, take);
        setState({
            options,
            skip,
        });
    };

    const customRender = (li, itemProps) => {
        const title = _isObject(itemProps.dataItem) ? _get(itemProps, `dataItem?.${textField}`) : itemProps.dataItem;
        const props = {
            ...li.props,
            title,
        };
        const itemChildren = <span>{li.props.children}</span>;
        return cloneElement(li, props, itemChildren);
    };
    const getDropdownPosition = (ref) => {
    if (!ref?.current) return 'below';

    const { top, bottom } = ref.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 200;
    const spaceBelow = viewportHeight - bottom;
    const spaceAbove = top;

    return spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'above' : 'below';
};

const applyPositionClass = (position) => {
    // Find all animation containers and get the last one (most recently opened)
    const animationContainers = document.querySelectorAll('.k-animation-container');
    if (animationContainers.length === 0) return false;
    
    // Get the last animation container (most recently opened dropdown)
    const animationContainer = animationContainers[animationContainers.length - 1];
    
    // Add the custom class
    if (!animationContainer.classList.contains('rs-kendoSearch-dd-popup')) {
        animationContainer.classList.add('rs-kendoSearch-dd-popup');
    }
    
    const posClass = position === 'above' ? 'showing-top' : 'showing-below';
    const elements = [animationContainer, ...animationContainer.querySelectorAll('.k-popup, .k-list-container, .k-list')];
    elements.forEach(el => {
        el.classList.remove('showing-top', 'showing-below');
        el.classList.add(posClass);
    });

    // console.log('Applied class:', posClass);
    return true;
};

const checkDropdownPosition = () => {
    const position = getDropdownPosition(containerWrapperSearch);
    setDropdownPosition(position);
    // console.log('Calculated position:', position);
    return position;
};

const addPositionClassToAnimationContainer = (pos = null) => {
    const position = pos || getDropdownPosition(containerWrapperSearch);

    setTimeout(() => {
        if (applyPositionClass(position)) return;

        // Fallback: watch for dynamic DOM render
        const observer = new MutationObserver(() => {
            if (applyPositionClass(position)) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 2000);
    }, 50);
};


    const onOpen = (e) => {
        e.target.state.text = '';
        filterChange('');
        setDataActual(data.slice());
        const position = checkDropdownPosition(); // Check position when opening and get the result
        setTimeout(() => {
            filterSearchText();
            addPositionClassToAnimationContainer(position); // Add position class to animation container with the calculated position
        }, 100);
    };
    const virtualization = {
        virtual: {
            total,
            pageSize,
            skip: state.skip,
        },
        onPageChange,
    };

    const filterSearchText = () => {
        const filterInputs = document.querySelectorAll('.k-list-filter .k-searchbox .k-input-inner');
        filterInputs.forEach((el) => {
            el.setAttribute('placeholder', 'Search..');
        });
        let searchIcons = document.querySelectorAll('.k-list-filter .k-searchbox .k-input-icon.k-i-search');
        searchIcons.forEach((el) => {
            const parent = el.parentNode;
            const newIcon = document.createElement('i');
            newIcon.className = 'k-input-icon position-absolute top2 right0 icon-md color-secondary-grey icon-rs-circle-zoom-fill-edge-medium';
            parent.replaceChild(newIcon, el);
        });
    };

    const resolveDropdownValue = (value) => {
        if (_isObject(value) && value.value !== undefined) {
            return value.value;
        }
        return value;
    };

    const resolveDataItem = (value, sourceData = dataActual) => {
        const normalizedValue = resolveDropdownValue(value);
        if (!normalizedValue) return normalizedValue;

        const keyVal = _isObject(normalizedValue)
            ? _get(normalizedValue, dataItemKey)
            : normalizedValue;

        if (keyVal == null || !sourceData?.length) {
            return normalizedValue;
        }

        return sourceData.find((item) => _get(item, dataItemKey) === keyVal) || normalizedValue;
    };

    const defaultValueRender = (element, value) => {
        const resolvedItem = resolveDataItem(value);
        const name = _isObject(resolvedItem) ? _get(resolvedItem, textField, '') : resolvedItem;
        if (!name) return element;

        return cloneElement(
            element,
            { ...element.props, title: name },
            <span className="k-input-value-text">{name}</span>,
        );
    };

    return (
        <Controller
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            name={name}
            render={({ field: { onChange, ...restField }, fieldState: { error } }) => {
                const _isEmpty = get(error, 'message', '')?.length > 0;
                const errMsg = get(error, 'message', '');
                const selectedValue = resolveDataItem(restField?.value, data);
                return (
                    <div
                        ref={containerWrapperSearch}
                        className={`rs-kendo-dropdownmenu-wrapper searchDropdown ${className} ${
                            _isEmpty ? 'errorContainer' : ''
                        } ${rightAlign ? 'kendo-dd-right-align' : ''} ${
                            noBottomBorder ? 'kendo-dd-no-bottom-border' : ''
                        } position-relative`}
                    >
                        {isLoading && (
                            <div className="rs-inputIcon-wrapper right25">
                                <div className="segment_loader"></div>
                            </div>
                        )}
                        {/* {_isEmpty && <div className="validation-message">{get(error, 'message', '')}</div>} */}
                        <DropDownList
                            disabled={isLoading}
                            className={`rs-kendo-dropdown ${required ? 'rs-kendo-dropdown-required' : ''}`}
                            //    data={isVirtialization ? state.options : data?.length > 10 ? dataFilter : data}
                            data={dataActual}
                            // data={isVirtialization ? state.options : data}
                            label={_isEmpty && isError ? errMsg : label}
                            textField={textField}
                            dataItemKey={dataItemKey}
                            onChange={(e) => {
                                const selectedValue = e.value !== undefined ? e.value : e.target?.value;
                                handleChange(e);
                                onChange(selectedValue);
                                if (e.target) {
                                    e.target.filterValue = '';
                                    e.target.state.text = '';
                                }
                                setDataActual(data.slice());
                            }}
                            onOpen={onOpen}
                            onClose={(e) => {
                                if (e.target) {
                                    e.target.filterValue = '';
                                    e.target.state.text = '';
                                }
                                setDataActual(data.slice());
                            }}
                            filterable={true}
                            filterBarPlaceholder="Search.."
                            onFilterChange={filterChange}
                            popupSettings={{
                                animate: true,
                                popupClass: `${popupClass}`,
                                appendTo: containerWrapperSearch?.current,
                                // appendTo: document.getElementsByClassName('searchDropdown'),
                            }}
                            itemRender={isCustomRender ? itemRender : customRender}
                            valueRender={rest?.valueRender || defaultValueRender}
                            listNoDataRender={() => <div className="noDataWrapper"><NoDataAvailableRender /></div>}
                            // virtual={{ pageSize: 10, skip: 0, total: dataActual?.length }}
                            {...(dataActual?.length > 5000 && virtualization)}
                            {...restField}
                            value={selectedValue}
                            footer={footer}
                            {...rest}
                        />
                    </div>
                );
            }}
        />
    );
};

RSKendoFormSearchDropdown.propTypes = {
    control: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    className: PropTypes.string,
    popupClass: PropTypes.string,
    clearErrors: PropTypes.func,
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.object,
        PropTypes.oneOf([null, undefined]),
    ]),
    rules: PropTypes.object,
    setError: PropTypes.func,
    setValue: PropTypes.func,
    textField: PropTypes.string,
    dataItemKey: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    handleChange: PropTypes.func,
    isError: PropTypes.bool,
    isCustomRender: PropTypes.bool,
    itemRender: PropTypes.func,
    rightAlign: PropTypes.bool,
    noBottomBorder: PropTypes.bool,
    isLoading: PropTypes.bool,
};

export default memo(RSKendoFormSearchDropdown);