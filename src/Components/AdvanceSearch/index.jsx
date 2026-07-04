import { formatName } from 'Utils/modules/formatters';
import { _isObject } from 'Utils/modules/misc';
import { charNumatdotUnderScore } from 'Utils/modules/inputValidators';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_GREATER_VALUE, NO_RESULTS_FOUND } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, CLEAR, CLOSE, FILTER, MORE_OPTIONS, REMOVE, SEARCH_TEXT, TEXT, BRAND_ID } from 'Constants/GlobalConstant/Placeholders';
import { advance_search_arrow_double_down_mini, advance_search_arrow_double_up_mini, advance_search_close_mini, advance_search_justify_dropdown_mini, circle_minus_fill_mini, circle_zoom_fill_edge_large, clear_mini, filter_circle_edge_large, filter_circle_fill_edge_large, zoom_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce as _debounce } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';

import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RenderInput from './Component/RenderInput';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';

import { Col } from 'react-bootstrap';
let searchTypeValue = '';
const RSAdvanceSearch = ({
    searchText = () => {},
    seachTextOnChange = () => {},
    advanceSearchOptions = [
        'Communication name',
        'Communication type',
        'Channel type',
        'Delivery type',
        'Product type',
        'Status',
    ],
    formInitialState = {},
    advanceSearchText = () => {},
    config = [],
    inputConfig = {},
    plusNavigate,
    interval = 1000,
    isAdvanceOptions = false,
    onSearchTypeChange = () => {},
    searchTypeField = '',
    allClearField = () => {},
    searchClearField = () => {},
    advSearchSmall = '',
    hideDropdown = false,
    onKeydown = () => {},
    tooltipOverlayClassZindex = false,
    isClearSearchText = false,
    setIsClearSearchText = () => {},
    isNoFillIcon = false,
    disabledAdvanceOptions = [],
    onAdvanceToggle = () => {},
    resetFormState = {},
}) => {
    const { permissions } = usePermission();
    const inputRef = useRef();
    const [showSearch, setShowSearch] = useState(false);
    const [showAdavanceSearch, setShowAdvanceSearch] = useState(false);
    const [searchType, setSearchType] = useState(advanceSearchOptions?.[0] || '');
    const [searchDropdown, setSearchDropdown] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(true);
    const [setselectionField, setSetselectionField] = useState(false);
    const [className, setClassName] = useState('');
    const [error, setError] = useState(null);
    const [extraClass, setExtraClass] = useState(false);
    const [isEnableSearch, setIsEnableSearch] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [dropdownLoadState, setDropdownLoadState] = useState({});
    // console.log('setselectionField: ', searchDropdown, showSearch, !!inputRef.current.value, showDropdown);
    const methods = useForm({
        defaultValues: {
            ...formInitialState,
            ...resetFormState,
        },
        mode: 'onTouched',
    });
    const { reset, watch, resetField, setValue, handleSubmit, setError: hookSetError } = methods;
    const searchOptions = watch();
    const [startDate, endDate] = watch(['start_date', 'end_date']);
    const handleSearchOptions = () => {
        const modifiedOptions = { ...searchOptions };
        if (setselectionField) {
            // delete modifiedOptions.communication_name;
            // delete modifiedOptions.list_name;
            //delete modifiedOptions.created_by;
        }
        return modifiedOptions;
    };
    const filterAdvanceSearch = useMemo(
        () =>
            Object.entries(handleSearchOptions())
                .map(([_, value]) => {
                    if (value instanceof Date) return [_, new Date(value).toDateString()];
                    return [_, value];
                })
                .filter(([_, value]) => value !== ''),
        [searchOptions],
    );
    const updateSearch = (flag) => {
        setShowDropdown(false);
        setShowSearch(false);
        setClassName('');
        if (!flag) {
            setHasSearched(true);
        } else {
            setHasSearched(false);
        }
        searchText({
            type: searchType,
            text: flag ? '' : inputRef.current.value?.trim(),
            searchValue: searchValue ? searchValue : inputRef.current.value?.trim(),
            setError,
        });
        inputRef.current.value = inputRef.current.value?.trim();
    };

    const onChange = async ({ target: { value } }) => {
        if (error) setError(null);
        const tempValue = value?.trim();
        const fieldKey = formatName(searchTypeValue);
        const belowMin = !tempValue || tempValue.length < 3;

        if (belowMin) {
            setSearchDropdown((pre) => ({ ...pre, [fieldKey]: [] }));
            setDropdownLoadState((prev) => ({ ...prev, [fieldKey]: undefined }));
            setShowDropdown(false);
            return;
        }

        setDropdownLoadState((prev) => ({ ...prev, [fieldKey]: 'loading' }));
        setShowDropdown(false);
        try {
            var dropdownData = await seachTextOnChange({
                type: searchTypeValue, //searchType,
                text: tempValue,
            },watch());
            setSearchDropdown((pre) => ({
                ...pre,
                [fieldKey]: Array.isArray(dropdownData) ? [...dropdownData] : [],
            }));
        } finally {
            setDropdownLoadState((prev) => ({ ...prev, [fieldKey]: 'loaded' }));
        }
        setShowDropdown(true);
    };

    // const onDebounceChange = _debounce(onChange, interval);
    const onDebounceChange = useCallback(_debounce(onChange, interval), []);

    const handleCloseState = (status) => {
        const val = status ? true : false;
        if (showAdavanceSearch) setShowAdvanceSearch(false);
        setShowSearch(false);
        onAdvanceToggle(false);
        allClearField(val);
        setClassName('');
        reset();
        //updateSearch(true);
        setSearchDropdown({});
        setDropdownLoadState({});
        inputRef.current.value = '';
        setInputValue('');
        setHasSearched(false);
    };

    useMemo(() => {
        if (Object.keys(resetFormState).length) {
            reset((formState) => ({
                ...formState,
                ...resetFormState,
            }));
        } else {
            reset({
                ...formInitialState,
            });
        }
    }, [JSON.stringify(resetFormState)]);

    useEffect(() => {
        onAdvanceToggle(!!(showSearch || showAdavanceSearch));
    }, [showSearch, showAdavanceSearch, onAdvanceToggle]);

    const handleError = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start || end) {
            if (start > end) {
                hookSetError('end_date', {
                    type: 'custom',
                    message: ENTER_GREATER_VALUE,
                });
                return false;
            }
            // else if (start ==='' || end === ''){
            //     return false;
            // }
        }

        return true;
    };

    useEffect(() => {
        if (!searchType || !advanceSearchOptions?.includes(searchType)) {
            const defaultType = advanceSearchOptions?.[0] || '';
            searchTypeValue = defaultType;
            setSearchType((prev) => prev || defaultType);
        } else {
            searchTypeValue = searchType;
        }
    }, [advanceSearchOptions, searchType]);
    
    useEffect(() => {
        setSearchDropdown({});
        setDropdownLoadState({});
    }, [searchType]);

    useEffect(() => {
        if (isClearSearchText) {
            handleCloseState(true);
            setIsClearSearchText(false);
        }
    }, [isClearSearchText]);

    // const debounce = (fn = () => {}, interval) => {
    //     let timeout;
    //     return (...args) => {
    //         clearInterval(timeout);
    //         timeout = setTimeout(() => {
    //             fn.apply(this, args);
    //         }, interval);
    //     };
    // };
    // console.log('Adv search ::: ', searchDropdown, searchTypeField);

    useEffect(() => {
        if (showSearch) {
            setTimeout(() => {
                setExtraClass(true);
            }, 1000);
        } else {
            setExtraClass(false);
        }
    }, [showSearch]);

    useEffect(() => {
        const status = Object.values(searchOptions)?.every((item) => item === '');
        setIsEnableSearch(status);
    }, [searchOptions]);
    // console.log('searchType', searchType);

    useEffect(() => {
        if (showAdavanceSearch) {
            // Clear the input field value if any text is present
            if (inputRef.current.value) {
                inputRef.current.value = '';
                setInputValue('');
            }
        }
    }, [showAdavanceSearch]);

    const currentSearchFieldKey = formatName(searchTypeValue);
    const isSearchDropdownLoading = dropdownLoadState[currentSearchFieldKey] === 'loading';

    const clearAdvancedFilters = () => {
        reset();
        setSetselectionField(false);
        setShowDropdown(false);
        setHasSearched(false);
        setDropdownLoadState({});
    };

    return (
        <FormProvider {...methods}>
            <div className={`advance-search-wrapper ${showAdavanceSearch ? 'active' : ''} group`}>
                {/* {!showSearch && <div className="search-icon"><i className={`${zoom_medium} white`} onClick={(e) => setShowSearch(true)} /></div>} */}
                {/* {showSearch && ( */}
                <Fragment>
                    <div
                        className={`search-container${showSearch ? ' search-open' : ''} ${
                            showSearch && extraClass ? 'overflow-visible' : ''
                        } ${className} ${advSearchSmall ? 'rs-adv-search-small' : ''}`}
                    >
                        <div className="search-icon">
                            <RSTooltip
                                text={`${!hasSearched ? SEARCH_TEXT : FILTER}`}
                                position="top"
                                className="lh0 d-flex align-items-center h32"
                                innerContent={false}
                                tooltipOverlayClass={tooltipOverlayClassZindex ? `toolTipOverlayZindexCSS` : ''}
                            >
                                <i
                                    id="rs_RSAdvanceSearch_zoom"
                                    className={`${
                                        !hasSearched && isNoFillIcon
                                            ? circle_zoom_fill_edge_large
                                            : hasSearched && isNoFillIcon
                                            ? filter_circle_edge_large
                                            : !hasSearched
                                            ? circle_zoom_fill_edge_large
                                            : filter_circle_fill_edge_large
                                    } icon-lg color-primary-blue`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        setShowSearch(true);
                                        // setTimeout(() => {
                                        //     setClassName('overflowInherit');
                                        // }, 1500);
                                    }}
                                />{' '}
                            </RSTooltip>
                        </div>

                        <RSBootstrapdown
                            containerClass={showAdavanceSearch ? 'pe-none d-none' : ''}
                            data={advanceSearchOptions}
                            className="icon-rs-advance-search-justify-dropdown-mini icon-xs pr10 no_caret"
                            showUpdate={false}
                            disbleItems={disabledAdvanceOptions}
                            onSelect={(e) => {
                                inputRef.current.value = '';
                                setSearchType(e);
                                searchTypeValue = e;
                                onSearchTypeChange(e);
                            }}
                            defaultItem={
                                <RSTooltip position="bottom" text={MORE_OPTIONS} className="lh0">
                                    <i
                                        className={`${advance_search_justify_dropdown_mini} icon-xs position-relative left4`}
                                    />
                                </RSTooltip>
                            }
                        />

                        <div className={`search-field mr0 ${showAdavanceSearch ? 'ml5' : ''}`}>
                            {/* {error && <div className={'color-primary-red'}>{error}</div>} */}
                            <input
                                type={TEXT}
                                name={'search'}
                                id="search"
                                ref={inputRef}
                                placeholder={
                                    !!error
                                        ? error
                                        : !showAdavanceSearch
                                        ? 'By ' + (searchType || '')
                                        : 'Search..'
                                }
                                className={showAdavanceSearch ? 'pe-none' : ''}
                                // onChange={onDebounceChange}
                                onChange={(e) => {
                                    let trim;
                                    if (e.target.value.trim()?.length === 0) trim = '';
                                    else {
                                        trim = e.target.value.replace(/ +/g, ' ');
                                    }
                                    e.target.value = trim;
                                    setInputValue(trim);
                                    setError(null);
                                    onDebounceChange(e);
                                }}
                                onKeyDown={(e) => {
                                    const { key } = e;
                                    if (key === 'Enter') {
                                        updateSearch();
                                        // searchText({
                                        //     type: searchType,
                                        //     text: inputRef.current.value,
                                        //     searchValue: !!searchValue ? inputRef.current.value : searchValue,
                                        //     key: key,
                                        // });
                                    }
                                    onKeydown(e);
                                    if (searchType === 'Email') {
                                        charNumatdotUnderScore(e);
                                    }
                                }}
                                maxLength={MAX_LENGTH50}
                                {...inputConfig}
                            />
                            {isSearchDropdownLoading && (
                                <span className="search-field-loader" aria-hidden="true">
                                    <span className="segment_loader" />
                                </span>
                            )}
                            {inputValue?.trim()?.length > 0 && (
                                <span className="search-clear-icon group-hidden group-hover-visible">
                                    <RSTooltip
                                        text={CLEAR}
                                        position="top"
                                        className="lh0 d-flex align-items-center position-relative h32 px10"
                                        innerContent={false}
                                        tooltipOverlayClass={tooltipOverlayClassZindex ? `toolTipOverlayZindexCSS` : ''}
                                    >
                                        <i
                                            id="rs_data_delete"
                                            className={`icon-xs color-primary-red ${clear_mini}`}
                                            onClick={() => {
                                                setShowDropdown(false);
                                                searchClearField(false);
                                                inputRef.current.value = '';
                                                setInputValue('');
                                                setHasSearched(false);
                                            }}
                                        />
                                    </RSTooltip>
                                </span>
                            )}
                            <ul className="tag-box">
                                {filterAdvanceSearch.map(([key, value], index) => {
                                    const updateValue = Array?.isArray(value) ? value?.length : !!value;
                                    // console.log('ASDASDA :::: ', key, !!value, value);
                                    const matchedConfig = config.find((item) => item?.config?.name === key);
                                    const fieldKey = matchedConfig?.fieldKey ?? '';
                                    const isMandatory = matchedConfig?.isMandatory ?? false;
                                    //Updating the Key firstKey to uppercase and capitalize other keys
                                    const customizeKey =
                                        key.charAt(0).toUpperCase() + key.slice(1).split('_').join(' ');
                                    const finalValueList = _isObject(value) ? value[fieldKey] : value;
                                    return (
                                        <Fragment key={`${key}-${index}`}>
                                            {/* {!key.includes('date') && !!value && ( */}
                                            {!!updateValue && (
                                                <li>
                                                    <span className="tag-label">{customizeKey}</span>
                                                    <span className={`tag-value d-flex ${isMandatory ? 'pe-none click-off' : ''}`}>
                                                        {Array.isArray(finalValueList) ? (
                                                            finalValueList?.map((value, valueIndex) => {
                                                                return (
                                                                    <Fragment key={`${key}-${value}-${valueIndex}`}>
                                                                        {value}
                                                                        <span
                                                                            className={`tag-close`}
                                                                            onClick={() => {
                                                                                const finalValue =
                                                                                    finalValueList?.filter(
                                                                                        (val) => val !== value,
                                                                                    );
                                                                                setValue(key, finalValue);
                                                                            }}
                                                                        >
                                                                            <RSTooltip
                                                                                text={REMOVE}
                                                                                position="top"
                                                                                className="lh0 "
                                                                                tooltipOverlayClass={
                                                                                    tooltipOverlayClassZindex
                                                                                        ? `toolTipOverlayZindexCSS`
                                                                                        : ''
                                                                                }
                                                                                innerContent={false}
                                                                            >
                                                                                {' '}
                                                                                <i
                                                                                    className={`icon-xs color-primary-red ${circle_minus_fill_mini}`}
                                                                                    id="rs_data_circle_minus_fill"
                                                                                ></i>{' '}
                                                                            </RSTooltip>
                                                                                </span>
                                                                    </Fragment>
                                                                );
                                                            })
                                                        ) : (
                                                            <>
                                                                {finalValueList}
                                                                <span
                                                                    className={`tag-close`}
                                                                    onClick={() => {
                                                                        resetField(key);
                                                                        setValue(key, '');
                                                                    }}
                                                                >
                                                                    <RSTooltip
                                                                        text={REMOVE}
                                                                        position="top"
                                                                        className="lh0 "
                                                                        tooltipOverlayClass={
                                                                            tooltipOverlayClassZindex
                                                                                ? `toolTipOverlayZindexCSS`
                                                                                : ''
                                                                        }
                                                                        innerContent={false}
                                                                    >
                                                                        {' '}
                                                                        <i
                                                                            className={`icon-xs color-primary-red ${circle_minus_fill_mini}`}
                                                                            id="rs_data_circle_minus_fill"
                                                                        ></i>{' '}
                                                                    </RSTooltip>
                                                                </span>
                                                            </>
                                                        )}
                                                    </span>
                                                </li>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className="align-items-center ">
                            {showAdavanceSearch && filterAdvanceSearch?.length > 3 && (
                                <RSTooltip
                                    text={CLEAR}
                                    position="top"
                                    className="lh0 d-flex align-items-center h32 px10 expand-remove-icon group-hidden group-hover-visible"
                                    innerContent={false}
                                    tooltipOverlayClass={tooltipOverlayClassZindex ? `toolTipOverlayZindexCSS` : ''}
                                >
                                    <i
                                        id="rs_RSAdvanceSearch_clear_filters"
                                        className={`icon-xs color-primary-red ${clear_mini}`}
                                        onClick={clearAdvancedFilters}
                                    />
                                </RSTooltip>
                            )}
                            {isAdvanceOptions && (
                                <RSTooltip
                                    text={`${showAdavanceSearch ? 'Collapse' : 'Expand'}`}
                                    position="top"
                                    className="lh0 d-flex align-items-center h32 position-relative expand-icon px10"
                                    tooltipOverlayClass={tooltipOverlayClassZindex ? `toolTipOverlayZindexCSS` : ''}
                                >
                                    <i
                                        className={`${
                                            showAdavanceSearch
                                                ? advance_search_arrow_double_up_mini
                                                : advance_search_arrow_double_down_mini
                                        } icon-xs color-primary-blue`}
                                        onClick={() => {
                                            const next = !showAdavanceSearch;
                                            setShowAdvanceSearch(next);
                                            onAdvanceToggle(next);
                                            // reset();
                                            setShowDropdown(false);
                                            // inputRef.current.value = '';
                                        }}
                                    />
                                </RSTooltip>
                            )}
                            <RSTooltip
                                text={CLOSE}
                                position="top"
                                className="lh0 d-flex align-items-center h32 pl10 pr3 borderL"
                                innerContent={false}
                                tooltipOverlayClass={tooltipOverlayClassZindex ? `toolTipOverlayZindexCSS` : ''}
                            >
                                {' '}
                                <i
                                    className={`${advance_search_close_mini} icon-xs color-primary-blue`}
                                    onClick={() => handleCloseState()}
                                    id="rs_RSAdvanceSearch_close"
                                />
                            </RSTooltip>
                        </div>

                        <div className={'search-field-icon'}>
                            <RSTooltip
                                text={SEARCH_TEXT}
                                position="top"
                                className={` ${
                                    !inputValue ? 'pe-none click-off opacity-100' : ''
                                } lh0 position-relative left6`}
                                innerContent={false}
                                tooltipOverlayClass={tooltipOverlayClassZindex ? `toolTipOverlayZindexCSS` : ''}
                            >
                                {' '}
                                <i
                                    id="rs_data_zoom"
                                    className={`${circle_zoom_fill_edge_large} icon-lg color-primary-blue`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                        const { value } = inputRef.current;
                                        if (!value) setError('Enter a text');
                                        if (value?.trim()?.length > 0) {
                                            updateSearch();
                                        }
                                    }}
                                />
                            </RSTooltip>
                        </div>
                    </div>
                    {showSearch &&
                        !!inputRef.current.value &&
                        showDropdown &&
                        !hideDropdown &&
                        dropdownLoadState[formatName(searchTypeValue)] === 'loaded' && (
                            <div
                                className="box-design"
                                style={{
                                    position: 'absolute',
                                    zIndex: 5,
                                    top: '40px',
                                    backgroundColor: 'white',
                                    width: '100%',
                                    height: '160px',
                                    overflow: 'auto',
                                }}
                            >
                                <ul>
                                    {searchDropdown[formatName(searchTypeValue)]?.length ? (
                                        searchDropdown[formatName(searchTypeValue)]?.map((item, idx) => {
                                            return (
                                                <li
                                                    key={idx}
                                                    onClick={() => {
                                                        const selectedValue = searchTypeField
                                                            ? item?.[searchTypeField]
                                                            : item;
                                                        inputRef.current.value = selectedValue;
                                                        setSearchValue(item);
                                                        setSearchDropdown({});
                                                        setShowDropdown(false);
                                                        
                                                        setShowSearch(false);
                                                        setClassName('');
                                                        setHasSearched(true);
                                                        
                                                        searchText({
                                                            type: searchType,
                                                            text: selectedValue?.trim(),
                                                            searchValue: item,
                                                            setError,
                                                        });
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {searchTypeField ? item?.[searchTypeField] : item}
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="no_data_found">{NO_RESULTS_FOUND}</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    {showAdavanceSearch && (
                        <div className="dropdown-search-menu">
                            <form
                                onSubmit={handleSubmit((params) => {
                                    const status = handleError();
                                    // console.log('params: ', params);
                                    if (status) {
                                        advanceSearchText(params);
                                        setShowSearch(false);
                                        setClassName('');
                                        setShowAdvanceSearch(false);
                                        // reset();
                                        setShowDropdown(false);
                                        searchTypeValue = advanceSearchOptions[0];
                                        setSearchType(advanceSearchOptions[0]);
                                        setHasSearched(true);
                                    }
                                })}
                                className="row mx0 mt20"
                            >
                                {config.map((info, index) => {
                                    let processedInfo = { ...info };
                                    if (
                                        info.label === 'Product type' &&
                                        info.config?.data &&
                                        Array.isArray(info.config.data)
                                    ) {
                                        const fieldKey = info.fieldKey || 'categoryname';
                                        processedInfo = {
                                            ...info,
                                            config: {
                                                ...info.config,
                                                data: [...info.config.data].sort((a, b) => {
                                                    const aValue = a?.[fieldKey] || '';
                                                    const bValue = b?.[fieldKey] || '';
                                                    return aValue
                                                        .toString()
                                                        .localeCompare(bValue.toString(), undefined, {
                                                            sensitivity: 'base',
                                                        });
                                                }),
                                            },
                                        };
                                    }
                                    return (
                                        <Col sm={6} className="px30 borderR" key={info?.config?.name ?? index}>
                                            <div className="form-group">
                                                <RenderInput
                                                    info={processedInfo}
                                                    key={info?.config?.name ?? index}
                                                    setSearchDropdown={setSearchDropdown}
                                                    searchDropdown={searchDropdown}
                                                    searchTypeField={searchTypeField}
                                                    searchType={searchType}
                                                    setSearchValue={setSearchValue}
                                                    showDropdown={showDropdown}
                                                    setShowDropdown={setShowDropdown}
                                                    onDebounceChange={(data) => {
                                                        searchTypeValue = info.label;
                                                        setSearchType(info.label);
                                                        onSearchTypeChange(info.label);
                                                        onDebounceChange(data);
                                                    }}
                                                    onClick={() => {
                                                        searchTypeValue = info.label;
                                                        setSearchType(info.label);
                                                        onSearchTypeChange(info.label);
                                                    }}
                                                    setSetselectionField={setSetselectionField}
                                                    searchTypeValue={searchTypeValue}
                                                    dropdownLoadState={dropdownLoadState}
                                                />
                                            </div>
                                        </Col>
                                    );
                                })}
                                <Col sm={12} className="px30 text-right">
                                    <RSSecondaryButton
                                        className={'mr20'}
                                        onClick={() => {
                                            reset();
                                            setShowAdvanceSearch(false);
                                            allClearField(false);
                                        }}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton
                                        type="submit"
                                        disabledClass={isEnableSearch ? 'pe-none click-off' : ''}
                                    >
                                        {SEARCH_TEXT}
                                    </RSPrimaryButton>
                                </Col>
                            </form>
                        </div>
                    )}
                </Fragment>
                {/* )} */}
            </div>
        </FormProvider>
    );
};

RSAdvanceSearch.propTypes = {
    searchText: PropTypes.func,
    seachTextOnChange: PropTypes.func,
    advanceSearchText: PropTypes.func,
    config: PropTypes.array,
    advanceSearchOptions: PropTypes.array,
    inputConfig: PropTypes.object,
    formInitialState: PropTypes.object,
    isAdvanceOptions: PropTypes.bool,
    hideDropdown: PropTypes.bool,
    interval: PropTypes.number,
    onSearchTypeChange: PropTypes.func,
    searchTypeField: PropTypes.string,
    searchClearField: PropTypes.func,
    onKeydown: PropTypes.func,
    tooltipOverlayClassZindex: PropTypes.bool,
    isClearSearchText: PropTypes.bool,
    setIsClearSearchText: PropTypes.func,
    isNoFillIcon: PropTypes.bool,
    disabledAdvanceOptions: PropTypes.array,
    onAdvanceToggle: PropTypes.func,
};
export default memo(RSAdvanceSearch);
