import { NO_RESULTS_FOUND } from 'Constants/GlobalConstant/ValidationMessage';
import { CLEAR, SEARCH, SEARCH_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { clear_mini, zoom_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { debounce as _debounce } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';

import RSTooltip from 'Components/RSTooltip';
import { truncateTitle } from 'Utils/modules/displayCore';

// var searchLength = 0;

const RSSearchField = ({
    searchedText = () => {},
    placeholder = SEARCH,
    interval = 1000,
    debounceOnChange,
    maxSearchLength,
    isCloseSearch = false,
    setIsCloseSearch = () => {},
    handleFilterSearch = () => {},
    handleOnblur = () => { },
    handleListItemClick = () => {},
    fieldKey = '',
    handleSearchClose = () => {},
    isSearchFilter = false,
    setsearchDiv = () => {},
    isActiveClass = '',
    activeAlways = false,
    searchClassName = '',
    onActiveChange = () => {},
    disableSearchIcon = false,
    ...props
}) => {
    const searchRef = useRef();
    const [isActive, setIsActive] = useState(false);
    const [searchLength, setSearchLength] = useState(0);
    const [currentSearchInputValue, setCurrentSearchInputValue] = useState('');
    const [onEnterkey, setOnEnterKey] = useState(false);

    const [filterSearchList, setFilterSearchList] = useState([]);
    const [showFilterSearchList, setShowFilterSearchList] = useState(false);
    const isActiveState = isActive || activeAlways ? `active ${isActiveClass}` : '';
    
    useEffect(() => {
        if (activeAlways) {
            setIsActive(true);
        }
    }, [activeAlways]);

    useEffect(() => {
        if (isActive) searchRef?.current?.focus();
        setsearchDiv(isActive);
        onActiveChange(isActive);
    }, [isActive]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchRef?.current?.value?.length === 0) {
            onBlur(e);
            if (!activeAlways) {
                setIsActive(!isActive);
            }
        }
        if (!debounceOnChange && searchRef?.current?.value?.length > 0) {
            debouncedOnChange({ target: { value: searchRef?.current?.value } });
        }
    };

    const onChange = async ({ target: { value } }) => {
        searchedText(value?.trim());
        setSearchLength(value?.trim()?.length);
        if (value?.length > 3) {
            const filterData = await handleFilterSearch(value);
            setFilterSearchList(filterData);
            setShowFilterSearchList(true);
        }
    };

    const onBlur = async (e) => {
        const { value } = e.target;

        if (isActiveState && onEnterkey && value?.trim().length === 0) {
            if (typeof handleOnblur === "function") {
                setSearchLength(0);
                await handleOnblur(value);  // Call parent onBlur function
            }

            setOnEnterKey(false);
        }
    };
    // console.log("searchLength",searchLength)

    // const debouncedOnChange = _debounce(onChange, interval);
    const debouncedOnChange = _debounce(onChange, 0);

    useEffect(() => {
        if (isCloseSearch) {
            setIsActive(false);
            searchRef.current.value = '';
            setIsCloseSearch(false);
            setSearchLength(0);
            searchedText('');
        }
    }, [isCloseSearch]);

    const handleOnClickItem = (item) => {
        handleListItemClick(item[fieldKey]);
        setFilterSearchList([]);
        searchRef.current.value = item[fieldKey];
        setShowFilterSearchList(false);
    };

    return (
        <div className={`rs-search-filter ${isActiveState} ${searchClassName} group`}>
            {/* <form onSubmit={handleSearch}> */}
            <input
                type="text"
                className={`searchInput ${isActiveState}`}
                name="search"
                //  onChange={debouncedOnChange}

                onChange={(e) => {
                    let trim;
                    if (e.target.value?.trim()?.length === 0) trim = '';
                    else {
                        trim = e.target.value?.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/ +/g, ' ');
                        //trim = e.target.value.replace(/[^\w-_ ]|(?<=( ))( )/g, '');
                    }
                    e.target.value = trim;
                    // console.log("E",e)
                    setCurrentSearchInputValue(e.target.value);
                    debounceOnChange ? debouncedOnChange(e) : undefined;
                }}
                onBlur={(e) => {
                    onBlur(e)
                }}
                onKeyDown={(e) => {
                    setOnEnterKey(true)
                    e?.nativeEvent?.key === 'Enter' && handleSearch(e);
                }}
                placeholder={placeholder}
                ref={searchRef}
                autoComplete="off"
                maxLength={maxSearchLength}
                {...props}
            />
            {isSearchFilter && isActive && !!searchLength && showFilterSearchList && (
                <div className={`box-design form-builder-seach-dropdown`}>
                    <div
                        className={`css-scrollbar custome-dropdown-scroll ${filterSearchList?.length > 5 ? 'pr5' : ''}`}
                    >
                        <ul>
                            {filterSearchList?.length ? (
                                filterSearchList.map((item, idx) => {
                                    const value = item[fieldKey];
                                    return (
                                        <li
                                            key={idx}
                                            onClick={() => handleOnClickItem(item)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {value && value.length > 23 ? (
                                                <RSTooltip text={value} position="top" innerContent={false}>
                                                    <span className="m0">{truncateTitle(value, 23)}</span>
                                                </RSTooltip>
                                            ) : (
                                                <span className="m0">{value}</span>
                                            )}
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="no_data_found">{NO_RESULTS_FOUND}</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
            {(!!searchLength && isActive) || (!debounceOnChange && currentSearchInputValue?.length > 3) ? (
                <div
                    className="rs-search-close group-hidden group-hover-visible"
                    onClick={() => {
                        searchedText('');
                        searchRef.current.focus();
                        searchRef.current.value = '';
                        setSearchLength(0);
                        handleSearchClose();
                        setCurrentSearchInputValue('')
                    }}
                >
                    <RSTooltip
                        text={CLEAR}
                        position="top"
                        className="lh0 "
                        innerContent={false}
                        tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                    >
                        <i className={`icon-xs color-primary-red ${clear_mini}`} id="rs_RSSearchField_close" />
                    </RSTooltip>
                </div>
            ) : null}
            <div
                className={`rs-search-icon bg-primary-blue ${activeAlways ? 'pe-none' : ''} ${disableSearchIcon ? 'pe-none click-off' : ''}`}
                onClick={disableSearchIcon ? undefined : handleSearch}
            >
                <RSTooltip
                    text={SEARCH_TEXT}
                    position="top"
                    className="lh0 d-flex text-center"
                    innerContent={false}
                    tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                >
                    <i className={`icon-md color-whites ${zoom_medium}`} id="rs_data_zoom"></i>
                </RSTooltip>
            </div>
            {/* </form> */}
        </div>
    );
};

RSSearchField.propTypes = {
    searchedText: PropTypes.func,
    placeholder: PropTypes.string,
    setIsCloseSearch: PropTypes.func,
};

export default RSSearchField;
