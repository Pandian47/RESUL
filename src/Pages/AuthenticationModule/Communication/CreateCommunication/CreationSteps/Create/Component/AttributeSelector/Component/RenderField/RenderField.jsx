import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ATTRIBUTE_TYPES, MULTIPLE_DROPDOWN_TYPES, NUMERIC_FILTER_TYPE, filterValue } from './constant';
import { ENTER_ATTRIBUTE, ENTER_GREATER_VALUE, ENTER_LESSER_VALUE, ENTER_TIME, ENTER_VALID_DATE, SELECT_ATTRIBUTE, SELECT_DATE } from 'Constants/GlobalConstant/ValidationMessage';
import { ATTRIBUTE_RULE, ATTRIBUTE_VALUE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import _get from 'lodash/get';
import { Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSTimePicker from 'Components/FormFields/RSTimePicker';
import { useDispatch, useSelector } from 'react-redux';

import { getSessionId } from 'Reducers/globalState/selector';
import { onlyNumbers } from 'Utils/modules/inputValidators';

import useQueryParams from 'Hooks/useQueryParams';

const RenderField = ({ attribute, index, isAttributeValuesLoading = false }) => {
    const { offlineConversionAttributes } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const locationState = useQueryParams('/communication');
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { control, setValue, watch, clearErrors } = useFormContext();
    const [attributeValue, attributeTo] = watch([
        `attributes.${index}.attributeValue`,
        `attributes.${index}.attributeTo`,
    ]);
    const startDate = new Date(locationState?.startDate);
    const endDate = new Date(locationState?.endDate);
    const fieldType = _get(attribute, 'attributeName.fieldTypeId', 0);
    const isBetween = _get(attribute, 'attributeComparison', '').toLowerCase() === '[]' || false;
    // const [dataValue, setDataValue] = useState([]);
    // const GetConversionAttributesValues = async () => {
    //     const payload = {
    //         attributeName: attribute?.attributeName?.solrFieldName,
    //         clientId,
    //         userId,
    //         departmentId,
    //     };
    //     const { status, data } = await dispatch(GetOfflineAttributeValues(payload));
    //     if (status) {
    //         const attrsValue = JSON.parse(data);
    //         setDataValue(Object.keys(JSON.parse(attrsValue)));
    //         const attrs = Object.keys(JSON.parse(attrsValue));
    //         console.log('attrs: ', attrs);
    //     } else {
    //         setDataValue([]);
    //     }
    // };
    // useEffect(() => {
    //     if (attribute?.attributeName.fieldTypeId === 1) {
    //         GetConversionAttributesValues();
    //     }
    // }, [attribute]);

    const getMultiDropDownDefaultItem = () => {
        if (attribute?.attributeComparison) {
            const isFind = MULTIPLE_DROPDOWN_TYPES?.find(
                (value) => value?.value?.toLowerCase() === attribute?.attributeComparison?.toLowerCase(),
            );
            if (isFind) {
                return isFind;
            } else {
                return MULTIPLE_DROPDOWN_TYPES[0];
            }
        } else {
            MULTIPLE_DROPDOWN_TYPES[0];
        }
    };

        const getDefaultNumberType = () => {
        if (attribute?.attributeComparison) {
            const isFind = NUMERIC_FILTER_TYPE?.find(
                (value) => value?.value?.toLowerCase() === attribute?.attributeComparison?.toLowerCase(),
            );
            if (isFind) {
                return isFind;
            } else {
                return NUMERIC_FILTER_TYPE[0];
            }
        } else {
            NUMERIC_FILTER_TYPE[0];
        }
    };

    switch (fieldType) {
        case 1: //String
            return (
                <Fragment>
                    <Col sm={3}>
                        <RSKendoDropDown
                            control={control}
                            name={`attributes.${index}.attributeComparison`}
                            label={ATTRIBUTE_RULE}
                            data={Object.values(filterValue.String)}
                            //data={ATTRIBUTE_TYPES}
                            defaultValue="Contains"
                            required
                            rules={{
                                required: SELECT_ATTRIBUTE,
                            }}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSMultiSelect
                            control={control}
                            name={`attributes.${index}.attributeMutipleValues`}
                            data={offlineConversionAttributes[attribute?.attributeName?.solrFieldName]}
                            allowCustom
                            label={ATTRIBUTE_VALUE}
                            loading={isAttributeValuesLoading}
                            required
                            rules={{
                                required: SELECT_ATTRIBUTE,
                            }}
                        />
                    </Col>
                </Fragment>
            );
        case 2:
            return (
                <Fragment>
                    <Col sm={3}>
                        <RSKendoDropDown
                            control={control}
                            name={`attributes.${index}.attributeComparison`}
                            label={ATTRIBUTE_RULE}
                            data={Object.values(filterValue.String)}
                            // data={ATTRIBUTE_TYPES}
                            defaultValue="Contains"
                            required
                            rules={{
                                required: SELECT_ATTRIBUTE,
                            }}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSInput
                            control={control}
                            name={`attributes.${index}.attributeValue`}
                            label={ATTRIBUTE_VALUE}
                            required
                            rules={{
                                required: ENTER_ATTRIBUTE,
                            }}
                        />
                    </Col>
                </Fragment>
            );
        case 13:
            return (
                <Col sm={7}>
                    <RSKendoDropDown
                        control={control}
                        name={`attributes.${index}.attributeValue`}
                        label={ATTRIBUTE_VALUE}
                        data={['Chrome', 'Firefox']}
                        required
                        rules={{
                            required: SELECT_ATTRIBUTE,
                        }}
                    />
                </Col>
            );
        case 9: //2d
            return (
                <Fragment>
                    <Col sm={3}>
                        <RSKendoDropDown
                            name={`attributes.${index}.attributeValue`}
                            control={control}
                            label={ATTRIBUTE_VALUE}
                            data={['Credit card']}
                            required
                            rules={{
                                required: SELECT_ATTRIBUTE,
                            }}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDown
                            name={`attributes.${index}.attributeTo`}
                            control={control}
                            required
                            label={ATTRIBUTE_VALUE}
                            data={['Loans']}
                            rules={{
                                required: SELECT_ATTRIBUTE,
                            }}
                        />
                    </Col>
                </Fragment>
            );

        case 5:
            return (
                <Col sm={7}>
                    <RSKendoDropDown
                        control={control}
                        name={`attributes.${index}.attributeValue`}
                        label={ATTRIBUTE_RULE}
                        data={['Yes', 'No']}
                        required
                        rules={{
                            required: SELECT_ATTRIBUTE,
                        }}
                    />
                </Col>
            );
        // case 7:
        //     return (
        //         <Col sm={7}>
        //             <RSMultiSelect
        //                 control={control}
        //                 name={`attributes.${index}.attributeValue`}
        //                 data={['Attribute']}
        //                 allowCustom
        //                 label={'Attribute value'}
        //                 required
        //                 rules={{
        //                     required: SELECT_ATTRIBUTE,
        //                 }}
        //             />
        //         </Col>
        //     );
        case 8:
            return (
                <Fragment>
                    <Col sm={1}>
                        <div className="rs-render-field-operator ruleGroup-action-dd">
                            <BootstrapDropdown
                                defaultItem={getMultiDropDownDefaultItem() || MULTIPLE_DROPDOWN_TYPES[0]}
                                data={MULTIPLE_DROPDOWN_TYPES}
                                isObject
                                fieldKey="icon"
                                onSelect={(e) => setValue(`attributes.${index}.attributeComparison`, e.value)}
                            />
                        </div>
                    </Col>
                    <Col sm={isBetween ? 3 : 4} className={isBetween ? 'attribute-value-datepicker-wrapper' : ''}>
                        <RSDatePicker
                            control={control}
                            required
                            min={startDate}
                            max={endDate}
                            name={`attributes.${index}.attributeValue`}
                            rules={{
                                required: SELECT_DATE,
                            }}
                        />
                    </Col>
                    {isBetween && (
                        <Col sm={3} className='attribute-value-datepicker-wrapper'>
                            <RSDatePicker
                                required
                                control={control}
                                name={`attributes.${index}.attributeTo`}
                                min={startDate}
                                max={endDate}
                                rules={{
                                    required: SELECT_DATE,
                                    validate: (data) => {
                                        if (isBetween)
                                            // return attributeValue - attributeTo < 0 ? ENTER_VALID_DATE : true;
                                            return attributeValue - attributeTo > 0 ? ENTER_GREATER_VALUE : true;
                                        else return;
                                    },
                                }}
                            />
                        </Col>
                    )}
                </Fragment>
            );
        case 4:
            return (
                <Fragment>
                    <Col sm={1}>
                        <div className="rs-render-field-operator">
                            <BootstrapDropdown
                                defaultItem={getDefaultNumberType() || NUMERIC_FILTER_TYPE[0]}
                                data={NUMERIC_FILTER_TYPE}
                                isObject
                                fieldKey="icon"
                                onSelect={(e) => setValue(`attributes.${index}.attributeComparison`, e.value)}
                            />
                        </div>
                    </Col>

                    <Col sm={isBetween ? 3 : 4}>
                        <RSInput
                            name={`attributes.${index}.attributeValue`}
                            control={control}
                            label={ATTRIBUTE_VALUE}
                            required
                            onKeyDown={onlyNumbers}
                            rules={{
                                required: ENTER_ATTRIBUTE,
                                validate: (data) => {
                                    clearErrors(`attributes.${index}.attributeTo`);
                                    if (isBetween)
                                        return parseInt(attributeValue, 10) > parseInt(attributeTo, 10)
                                            ? ENTER_LESSER_VALUE
                                            : true;
                                    else return;
                                },
                            }}
                        />
                    </Col>
                    {isBetween && (
                        <Col sm={3}>
                            <RSInput
                                name={`attributes.${index}.attributeTo`}
                                control={control}
                                label={ATTRIBUTE_VALUE}
                                required
                                rules={{
                                    required: ENTER_ATTRIBUTE,
                                    validate: (data) => {
                                        clearErrors(`attributes.${index}.attributeValue`);
                                        if (isBetween)
                                            return parseInt(attributeValue, 10) > parseInt(attributeTo, 10)
                                                ? ENTER_GREATER_VALUE
                                                : true;
                                        else return;
                                    },
                                }}
                                onKeyDown={onlyNumbers}
                            />
                        </Col>
                    )}
                </Fragment>
            );

        case 3:
            return (
                <Fragment>
                    <Col sm={1} className="pl0 pr0">
                        <div className="rs-render-field-operator">
                            <BootstrapDropdown
                                defaultItem={getDefaultNumberType() || NUMERIC_FILTER_TYPE[0]}
                                data={NUMERIC_FILTER_TYPE}
                                isObject
                                fieldKey="icon"
                                onSelect={(e) => setValue(`attributes.${index}.attributeComparison`, e.value)}
                            />
                        </div>
                    </Col>

                    <Col sm={isBetween ? 3 : 6}>
                        <RSInput
                            name={`attributes.${index}.attributeValue`}
                            control={control}
                            label={ATTRIBUTE_VALUE}
                            required
                            onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                            rules={{
                                required: ENTER_ATTRIBUTE,
                                validate: (data) => {
                                    clearErrors(`attributes.${index}.attributeTo`);
                                    if (isBetween)
                                        return parseInt(attributeValue, 10) > parseInt(attributeTo, 10)
                                            ? ENTER_LESSER_VALUE
                                            : true;
                                    else return;
                                },
                            }}
                        />
                    </Col>
                    {isBetween && (
                        <Col sm={3}>
                            <RSInput
                                name={`attributes.${index}.attributeTo`}
                                control={control}
                                label={ATTRIBUTE_VALUE}
                                required
                                rules={{
                                    required: ENTER_ATTRIBUTE,
                                    validate: (data) => {
                                        clearErrors(`attributes.${index}.attributeValue`);
                                        if (isBetween)
                                            return parseInt(attributeValue, 10) > parseInt(attributeTo, 10)
                                                ? ENTER_GREATER_VALUE
                                                : true;
                                        else return;
                                    },
                                }}
                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                            />
                        </Col>
                    )}
                </Fragment>
            );
        case 10:
            return (
                <Fragment>
                    <Col sm={3}>
                        <div className="rs-render-field-operator">
                            <BootstrapDropdown
                                defaultItem={getMultiDropDownDefaultItem() || MULTIPLE_DROPDOWN_TYPES[0]}
                                data={MULTIPLE_DROPDOWN_TYPES}
                                isObject
                                fieldKey="icon"
                                onSelect={(e) => setValue(`attributes.${index}.attributeComparison`, e.value)}
                            />
                        </div>
                    </Col>
                    <Col sm={isBetween ? 2 : 4}>
                        <RSTimePicker
                            required
                            control={control}
                            name={`attributes.${index}.attributeValue`}
                            rules={{
                                required: ENTER_ATTRIBUTE,
                            }}
                        />
                    </Col>
                    {isBetween && (
                        <Col sm={2}>
                            <RSTimePicker
                                required
                                control={control}
                                name={`attributes.${index}.attributeTo`}
                                rules={{
                                    required: ENTER_ATTRIBUTE,
                                    validate: (data) => (attributeValue - attributeTo < 0 ? ENTER_TIME : true),
                                }}
                            />
                        </Col>
                    )}
                </Fragment>
            );
        default:
            return null;
    }
};

export default RenderField;
