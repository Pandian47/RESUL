import { ENTER_ATTRIBUTE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { ATTRIBUTE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment } from 'react';
import { findIndex as _findIndex,get as _get } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

import RenderField from './Component/RenderField/RenderField';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';

import { selectIcon } from 'Utils/modules/display';

const AttributeSelector = ({ data }) => {
    // console.log('data: ', data);
    const { control, trigger, resetField, setValue } = useFormContext();

    const { fields, remove, append } = useFieldArray({
        control,
        name: 'attributes',
    });

    const attributes = useWatch({
        control,
        name: 'attributes',
    });

    const addAttribute = (idx) => {
        if (!idx) {
            const findIndex = _findIndex(attributes, (attr) => {
                const getAttributeField = _get(attr, 'attributeName.fieldType', '');
                const isValid = !attr?.attributeName || !attr?.attributeValue;
                if (getAttributeField === 1) {
                    return !attr.attributeMutipleValues?.length || !attr?.attributeName;
                } else if (getAttributeField === 9 || getAttributeField === 4) {
                    return isValid || !attr.attributeTo;
                }
                return isValid;
            });
            if (findIndex === -1) {
                append({
                    attributeName: '',
                    attributeValue: '',
                    attributeMutipleValues: [],
                    attributeComparison: 'Contains',
                    attributeTo: '',
                });
            } else {
                trigger('attributes');
            }
        } else {
            remove(idx);
        }
    };

    return (
        <Fragment>
            {fields.map((field, idx) => {
                const attr = attributes[idx];
                return (
                    <div className="form-group" key={field.id}>
                        <Row>
                            <Col sm={4}>
                                <RSKendoDropdown
                                    control={control}
                                    name={`attributes.${idx}.attributeName`}
                                    textField="fieldName"
                                    dataItemKey="fieldType"
                                    label={ATTRIBUTE}
                                    data={[
                                        { fieldType: 1, fieldName: 'ContainsMulti' },
                                        { fieldType: 2, fieldName: 'ContainsInput' },
                                        { fieldType: 3, fieldName: 'dropdown' },
                                        { fieldType: 4, fieldName: '2D' },
                                        { fieldType: 5, fieldName: 'boolean' },
                                        { fieldType: 8, fieldName: 'Date' },
                                        { fieldType: 9, fieldName: 'Number' },
                                        { fieldType: 10, fieldName: 'Time' },
                                    ]}
                                    rules={{
                                        required: ENTER_ATTRIBUTE_NAME,
                                    }}
                                    handleChange={(e) => {
                                        const fieldType = _get(e, 'value.fieldType', null);
                                        let comparisonValue;
                                        if (fieldType === 4) comparisonValue = 'Equals';
                                        else if (fieldType === 8 || fieldType === 10) comparisonValue = 'Before';
                                        else comparisonValue = 'Contains';
                                        setValue(`attributes.${idx}.attributeComparison`, comparisonValue);
                                        resetField(`attributes.${idx}.attributeValue`);
                                        resetField(`attributes.${idx}.attributeMutipleValues`);
                                        resetField(`attributes.${idx}.attributeTo`);
                                    }}
                                />
                            </Col>
                            <RenderField attribute={attr} key={field.id} index={idx} />
                            {!!attr?.attributeName && (
                                <Col sm={1} className="fg-icons-wrapper">
                                    <div className="fg-icons">
                                        <i
                                            className={`${selectIcon(idx)} ${
                                                attributes?.length > 4 && !idx ? 'click-off' : ''
                                            } icon-md`}
                                            onClick={() => addAttribute(idx)}
                                        />
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>
                );
            })}
        </Fragment>
    );
};

export default AttributeSelector;
