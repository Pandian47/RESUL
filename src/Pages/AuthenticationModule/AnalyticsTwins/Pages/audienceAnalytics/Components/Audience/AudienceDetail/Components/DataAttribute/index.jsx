import { formatNumber } from 'Utils/modules/campaignUtils';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { square_minus_fill_medium, square_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { parseAnalyticsJsonArray } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
import { Accordion } from 'react-bootstrap';

import collapse from 'Assets/Images/collapse-all-mini.svg';
import expand from 'Assets/Images/expand-all-mini.svg';
import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import { dataAttributes } from '../../../../../constants';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { useSelector } from 'react-redux';


const LAKH_THRESHOLD = 100000;

const isSerialNumberField = (fieldKey, title = '') => {
    const normalized = `${fieldKey} ${title}`.toLowerCase().replace(/_/g, ' ');
    return /serial\s*no|serial\s*number|serialno|sl\.?\s*no|s\.?\s*no\b/.test(normalized);
};

const isNumericAttributeField = (fieldKey, value) => {
    if (fieldKey?.toLowerCase().endsWith('_i') || fieldKey?.toLowerCase().endsWith('_d')) return true;
    return typeof value === 'number' && !Number.isNaN(value);
};

const formatAttributeNumericValue = (value, fieldKey, title = '') => {
    if (!isNumericAttributeField(fieldKey, value) || isSerialNumberField(fieldKey, title)) {
        return value ?? '';
    }
    const numValue = Number(value);
    if (Number.isNaN(numValue)) return value ?? '';
    if (Math.abs(numValue) >= LAKH_THRESHOLD) {
        return (
            <RSTooltip text={numberWithCommas(numValue)} position="top">
                <span>{formatNumber(numValue)}</span>
            </RSTooltip>
        );
    }
    return numberWithCommas(numValue);
};

let accordtionData = [];
const DataAttribute = () => {
    const [activeKey, setActiveKey] = useState([]);
    // console.log('dataTimeLineList: ', JSON.parse(dataTimeLineList.data));
    const { data_Attributes, dataAttributes_loading } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    const result = data_Attributes; //JSON?.parse(dataTimeLineList.data).timeLineList //[];

    function checkIndex(result, val) {
        if (!result || result?.length === 0) return -1;
        return result.findIndex((item) => item.catTypeName?.toLowerCase() === val.toLowerCase());
    }

    function array_move(arr, old_index, new_index) {
        if (!arr || arr?.length === 0) return arr;
        if (old_index < 0 || old_index >= arr?.length || new_index < 0) {
            return arr;
        }
        let newArr = [...arr];
        const item = newArr.splice(old_index, 1)[0];
        newArr.splice(new_index, 0, item);

        return newArr;
    }
    const convertJsonToColumns = (data) => {
        return Object.keys(data[0]).map((key) => {
            const isDateField = key.toLowerCase().endsWith('_dt') || key.toLowerCase().includes('date');
            const title = key
                .replace(/_dt$/, '') // Remove trailing '_dt'
                .replace(/_s$/, '') // Remove trailing '_s'
                .replace(/_i$/, '') // Remove trailing '_i'
                .replace(/_d$/, '') // Remove trailing '_d'
                .replace(/_b$/, '') // Remove trailing '_b'
                .replace(/_/g, ' '); // Replace underscores with spaces
            const isNumericField = key.toLowerCase().endsWith('_i') || key.toLowerCase().endsWith('_d');
            const column = {
                field: key,
                filter: isDateField ? 'date' : 'text',
                width: 200,
                title,
            };

            if (isDateField) {
                column.cell = ({ dataItem }) => {
                    const dateValue = dataItem[key];
                    const formattedDate = dateValue
                        ? getUserCurrentFormat(dateValue)?.dateTimeFormat || dateValue
                        : '';
                    return <td>{formattedDate}</td>;
                };
            } else if (isNumericField && !isSerialNumberField(key, title)) {
                column.cell = ({ dataItem }) => (
                    <td className="text-end">{formatAttributeNumericValue(dataItem[key], key, title)}</td>
                );
            }

            return column;
        });
    };
    const accordtionFunc = (result) => {
        let columnDataAttributeNames = [];

        accordtionData = [];
        const column = [
            {
                field: 'name',
                filter: 'text',
                title: 'Attribute name',
            },
            {
                field: 'value',
                filter: 'text',
                title: 'Value',
                cell: ({ dataItem }) => (
                    <td>
                        {formatAttributeNumericValue(
                            dataItem.value,
                            dataItem.solrFieldName,
                            dataItem.name,
                        )}
                    </td>
                ),
            },
        ];
        if (result?.length > 0) {
            result.forEach((item, index) => {
                let catType = item?.catTypeName ?? '';
                if (!catType) return;
                if (catType.toLowerCase().trim() == 'parent') {
                    catType = 'Customer';
                }
                if (catType.toLowerCase().trim() != 'uiprintablename') {
                    let gridId = 'id_grid_' + catType;
                    let solrTempKeyValue = parseAnalyticsJsonArray(item?.solrKeyValue?.[item?.catTypeName], []);
                    if (catType.toLowerCase().trim() == 'customer') {
                        solrTempKeyValue = changeParentColumnHeaderName(solrTempKeyValue[0], columnDataAttributeNames);
                        accordtionData.push({
                            title: catType,
                            dataattr: solrTempKeyValue,
                            column: column,
                        });
                        // console.log('solrTempKeyValue: customer', solrTempKeyValue);
                    } else {
                        accordtionData.push({
                            title: catType,
                            dataattr: solrTempKeyValue,
                            column: convertJsonToColumns(solrTempKeyValue),
                        });
                        // console.log('solrTempKeyValue: else', solrTempKeyValue);
                    }
                } else {
                    columnDataAttributeNames = parseAnalyticsJsonArray(item?.solrKeyValue?.[item?.catTypeName], []);
                    // console.log('columnDataAttributeNames: ', columnDataAttributeNames);
                }
            });
        }
    };
    function changeParentColumnHeaderName(solrKeyValue, columnDataAttributeNames) {
        const regularData = [];

        Object.entries(solrKeyValue).forEach(([key, value]) => {
            columnDataAttributeNames.forEach((column) => {
                if (column?.solrFieldName !== undefined && key !== undefined) {
                    if (column?.solrFieldName?.toLowerCase().trim() === key?.toLowerCase()?.trim()) {
                        if (column.GridShowStatus === 1) {
                            // Check if the field is a date field and format it
                            const isDateField = key.toLowerCase().endsWith('_dt') || key.toLowerCase().includes('date');
                            const formattedValue = isDateField && value
                                ? getUserCurrentFormat(value)?.dateTimeFormat || value
                                : value;
                            const currentObj = {
                                name: column.UIPrintableName,
                                value: formattedValue,
                                solrFieldName: key,
                            };
                            regularData.push(currentObj);
                        }
                    }
                }
            });
        });

        // console.log('regularData: ', regularData);
        return regularData;
    }

    const handleAccord = (key) => {
        if (key) {
            if (activeKey.includes(key)) setActiveKey(activeKey.filter((accord) => accord !== key));
            else setActiveKey([...activeKey, key]);
        } else {
            if (activeKey?.length === dataAttributes?.length) setActiveKey([]);
            else setActiveKey(dataAttributes.map((_, ind) => ind.toString()));
        }
    };

    let parentIndex = checkIndex(result, 'parent');
    array_move(result, parentIndex, 1);
    accordtionFunc(result);
    return (
        <div className="p15">
            {dataAttributes_loading ? (
                <HorizontalSkeleton count={10} />
            ) : (
                <>
                    <div className="d-flex justify-content-end mb15">
                        <RSTooltip
                            text={`${activeKey?.length > 0 ? 'Collapse all' : 'Expand all'}`}
                            position="top"
                            className="cp"
                        >
                            <img
                                src={activeKey?.length > 0 ? collapse : expand}
                                alt="expandcollapse"
                                width="25"
                                height="25"
                                onClick={() => handleAccord()}
                            />
                        </RSTooltip>
                    </div>
                    {accordtionData?.length > 0 ? (
                <Accordion alwaysOpen activeKey={activeKey}>
                    {accordtionData?.map((attribute, index) => {
                        return (
                            <Accordion.Item eventKey={index.toString()} key={attribute.title}>
                                <Accordion.Header onClick={() => handleAccord(index.toString())}>
                                    <i
                                        className={`${
                                            activeKey.includes(index.toString())
                                                ? square_minus_fill_medium
                                                : square_plus_fill_medium
                                        } mr5`}
                                    />
                                    {attribute.title}
                                </Accordion.Header>
                                <Accordion.Body>
                                    {attribute?.dataattr?.length ? (
                                        <KendoGrid
                                            data={attribute?.dataattr}
                                            column={attribute?.column}
                                            noBoxShadow
                                            settings={{
                                                total: attribute?.dataattr?.length,
                                            }}
                                            isScrollTop={false}
                                            pageable
                                            scrollable={'scrollable'}
                                        />
                                    ) : (
                                        <HorizontalSkeleton isError />
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
                    ) : (
                        <>
                            <HorizontalSkeleton isError={true} count={20}/>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default DataAttribute;
