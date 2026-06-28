import { useEffect, useState } from 'react';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { filterBy } from '@progress/kendo-data-query';
import Proptypes from 'prop-types';
export { default as KendoIconDropdown } from 'Pages/KendoDocs/CommonComponents/ResKendoIconDropdown';

export const KendoDropDownList = ({
    data = [],
    textField = '',
    dataItemKey = '',
    value,
    onChange,
    className = '',
    errorMessage = '',
    required = false,
    icon = '',
    footer = null,
    isShowVal = true,
    itemRender,
    filterable = false,
    label = true,
    ...rest
}) => {
    const [dataActual, setDataActual] = useState(data.slice());
    const filterData = (filter) => {
        const sliceData = data.slice();
        return filterBy(sliceData, filter);
    };
    const filterChange = (event) => {
        setDataActual(filterData(event.filter));
    };
    useEffect(() => {
        setDataActual(data.slice());
    }, [data]);
    const filterSearchText = () => {
        const filterInput = document.querySelector('.k-list-filter .k-searchbox .k-input-inner');
        filterInput?.setAttribute('placeholder', 'Search..');
    };
    let labelProp;
    if (label) {
        labelProp = value?.attributeName ? '' : 'Select';
    } else {
        labelProp = '';
    }
    rest = { ...rest, label: labelProp };
    return (
        <div className="position-relative">
            {errorMessage && <div className="validation-message">{errorMessage}</div>}
            <DropDownList
                className={`rs-kendo-dropdown ${className} ${required ? 'rs-kendo-dropdown-required' : ''} `}
                data={dataActual}
                textField={textField}
                dataItemKey={dataItemKey}
                value={isShowVal ? value : null}
                filterable={filterable}
                onFilterChange={filterChange}
                onChange={(e) => {
                    onChange(e);
                }}
                onOpen={() => {
                    setTimeout(() => {
                        filterSearchText();
                    }, 100);
                }}
                defaultItem="Select ..."
                iconClassName={icon}
                // label={value?.attributeName ? '' : 'Select'}
                // virtual={{ pageSize: 10, skip: 0, total: dataActual?.length }}
                footer={footer}
                {...rest}
            />
        </div>
    );
};

KendoDropDownList.propTypes = {
    data: Proptypes.array.isRequired,
    textField: Proptypes.string,
    dataItemKey: Proptypes.string,
    className: Proptypes.string,
    errorMessage: Proptypes.string,
    required: Proptypes.bool,
    value: Proptypes.oneOfType([Proptypes.string, Proptypes.object]),
    icon: Proptypes.string,
    footer: Proptypes.node,
    isShowVal: Proptypes.bool,
    filterable: Proptypes.bool,
    label: Proptypes.bool,
};
