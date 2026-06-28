import { getUserDetails } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { NO_RESULTS_FOUND } from 'Constants/GlobalConstant/ValidationMessage';
import { useEffect, useRef, useState } from 'react';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { useFormContext } from 'react-hook-form';

const RenderInput = ({
    info,
    onDebounceChange,
    searchDropdown,
    searchTypeField,
    setSearchDropdown,
    searchType,
    showDropdown,
    setShowDropdown,
    onClick,
    setSetselectionField,
    searchTypeValue,
    dropdownLoadState = {},
}) => {
    const optionsRef = useRef();
    const { control, setValue, getValues, watch, setError } = useFormContext();
    const { type, config, label } = info;
    const userDetail = getUserDetails();
    const { name } = config;
    // const [showDropdown, setShowDropdown] = useState(true);
    const inputField = watch(name);

    // console.log('SSeaDD ::: ', searchDropdown);
    useEffect(() => {
        if (
            showDropdown &&
            !!inputField &&
            label === searchType &&
            (label === 'List type' ? inputField?.length >= 1 : inputField?.length >= 3) &&
            searchDropdown?.length === 0
        ) {
            setSetselectionField(true);
        } else if (!showDropdown && searchDropdown?.length === 0) {
            setSetselectionField(true);
        } else {
            //     setSetselectionField(false)
        }
    }, [inputField, searchDropdown]);

    useEffect(() => {
        window.addEventListener('mousedown', handlemouseDownEvent);
        return () => {
            window.removeEventListener('mousedown', handlemouseDownEvent);
        };
    }, []);

    function handlemouseDownEvent(e) {
        if (optionsRef?.current && !optionsRef.current?.contains(e.target)) {
            setShowDropdown(false);
        }
    }
    switch (type) {
        case 'input':
            return (
                <>
                    {/* <label htmlFor={config.name}>{label}</label> */}
                    <RSInput
                        {...config}
                        control={control}
                        placeholder={label}
                        handleOnchange={(e) => {
                            onDebounceChange(e);
                            setShowDropdown(true);
                            charNumUnderScore(e);
                        }}
                        onKeyDown={charNumUnderScore}
                        maxLength={config.maxLength ?? config.maxlength ?? MAX_LENGTH75}
                    />
                    {showDropdown &&
                        !!inputField &&
                        label === searchType &&
                        dropdownLoadState[formatName(searchTypeValue)] === 'loaded' &&
                        (label === 'List type' ? inputField?.length >= 1 : inputField?.length >= 3) && (
                            <div
                                ref={optionsRef}
                                className="box-design box-design css-scrollbar no-box-shadow p10"
                                style={{
                                    position: 'absolute',
                                    zIndex: 9,
                                    top: '26px',
                                    width: '100%',
                                    height: '160px',
                                    overflow: 'auto',
                                    borderRadius: '0 0 5px 5px',
                                    borderColor: '#999',
                                }}
                            >
                                <ul>
                                    {searchDropdown[formatName(searchTypeValue)]?.length ? (
                                        searchDropdown[formatName(searchTypeValue)].map((item, idx) => {
                                            return (
                                                <li
                                                    key={idx}
                                                    onClick={() => {
                                                        // setSearchDropdown([]);
                                                        setShowDropdown(false);
                                                        setSetselectionField(false);
                                                        setValue(
                                                            name,
                                                            searchTypeField ? item?.[searchTypeField] : item,
                                                        );
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {searchTypeField ? item?.[searchTypeField] : item}
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <span className="align-items-center d-flex justify-content-center py55">
                                            {NO_RESULTS_FOUND}
                                        </span>
                                    )}
                                </ul>
                            </div>
                        )}
                    {/* <span>{label}</span>
                        <RSComboBox data={searchDropdown} control={control} name={name} onChange={onDebounceChange} /> */}
                </>
            );
        case 'dropdown':
            return (
                <>
                    {/* <label htmlFor={config.name}>{label}</label> */}
                    {/* <div className={className && className}> </div> */}
                    <RSKendoDropdown {...config} control={control} label={label} />
                </>
            );
        case 'multiselect':
            return (
                <>
                    <RSMultiSelect {...config} control={control} label={label} />
                </>
            );
        case 'mutliselect_api':
            return (
                <>
                    <RSMultiSelect
                        {...config}
                        data={searchDropdown[formatName(searchTypeValue)]?.map((list) => list?.[info?.filterKey])}
                        onFilterChange={(event) => {
                            let e = {
                                target: {
                                    value: event.filter.value,
                                },
                            };
                            onDebounceChange(e);
                        }}
                        control={control}
                        label={label}
                    />
                </>
            );
        case 'datepicker': {
            return (
                <>
                    <label htmlFor={config.name}>{label}</label>
                    <RSDatePicker
                        {...config}
                        min={new Date(userDetail?.createdDate)}
                        name={config.name}
                        control={control}
                        max={new Date()}
                    />
                </>
            );
        }
        default:
            return (
                <>
                    <label htmlFor={config.name}>{label}</label>
                    <RSInput {...config} control={control} />
                </>
            );
    }
};

export default RenderInput;
