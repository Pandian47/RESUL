import { selectIconTooltip } from 'Utils/modules/display';
import { ENTER_ATTRIBUTE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { ATTRIBUTE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useMemo, useState } from 'react';
import { findIndex as _findIndex,get as _get  } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

import RenderField from './Component/RenderField/RenderField';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';


import { selectIcon } from 'Utils/modules/display';
import { useDispatch, useSelector } from 'react-redux';
import { GetOfflineAttributeValues } from 'Reducers/communication/createCommunication/Create/request';
import useApiLoader from 'Hooks/useApiLoader';

import { getSessionId } from 'Reducers/globalState/selector';
import RSTooltip from 'Components/RSTooltip';
const AttributeSelector = ({ data }) => {
    // console.log('data: ', data);
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [loadingAttributeIndex, setLoadingAttributeIndex] = useState(null);
    const attributeValuesLoader = useApiLoader({ autoFetch: false });

    const fetchConversionAttributeValues = async (attributeName, idx) => {
        if (!attributeName) return;

        setLoadingAttributeIndex(idx);
        try {
            await attributeValuesLoader.refetch({
                fetcher: () =>
                    dispatch(
                        GetOfflineAttributeValues(
                            {
                                attributeName,
                                clientId,
                                userId,
                                departmentId,
                            },
                            false,
                        ),
                    ),
                mode: 'create',
            });
        } finally {
            setLoadingAttributeIndex(null);
        }
    };

    const {
        control,
        trigger,
        resetField,
        setValue,
        formState: { isValid, errors },
    } = useFormContext();

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
                const getAttributeField = _get(attr, 'attributeName.fieldTypeId', '');
                const isValidAttr = !attr?.attributeName || !attr?.attributeValue;
                if (getAttributeField === 1) {
                    return !attr.attributeMutipleValues?.length || !attr?.attributeName;
                } else if (getAttributeField === 9 || getAttributeField === 4 || getAttributeField === 3) {
                    return isValidAttr || 'attributes' in errors;
                }
                return isValidAttr;
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

    
    // const dataList = useMemo(() => {
    //     const selectedList = attributes?.map(({ attributeName }) => attributeName?.uiPrintableName);
    //     const filterData = filter((name) => {
    //         return !!(!selectedList?.includes(name?.uiPrintableName) || name?.uiPrintableName === '');
    //     });
    //     const sortData = filterData?.sort((a, b) => a?.uiPrintableName.localeCompare(b?.uiPrintableName));
    //     return sortData;
    // }, [data, attributes]);

     const getFilteredData = (currentIdx) => {
        const currentSelected = attributes?.[currentIdx]?.attributeName?.uiPrintableName;
        const selectedInOtherFields = attributes
            ?.filter((_, idx) => idx !== currentIdx)
            ?.map(attr => attr?.attributeName?.uiPrintableName)
            ?.filter(Boolean);

        return data
            ?.filter(item => {
                return item?.uiPrintableName === currentSelected ||
                       !selectedInOtherFields?.includes(item?.uiPrintableName) ||
                       item?.uiPrintableName === '';
            })
            ?.sort((a, b) => a?.uiPrintableName?.localeCompare(b?.uiPrintableName));
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
                                    required
                                    // textField="fieldName"
                                    // dataItemKey="fieldType"
                                    textField="uiPrintableName"
                                    dataItemKey="dataAttributeId"
                                    label={ATTRIBUTE}
                                    data={getFilteredData(idx)}
                                    rules={{
                                        required: ENTER_ATTRIBUTE_NAME,
                                    }}
                                    handleChange={(e) => {
                                        const fieldType = _get(e, 'value.fieldTypeId', null);
                                        if (fieldType === 1) {
                                            fetchConversionAttributeValues(
                                                _get(e, 'value.solrFieldName', ''),
                                                idx,
                                            );
                                        }
                                        let comparisonValue;
                                        // 4-number , 3- decimal  , 8-date
                                        if (fieldType === 4 || fieldType ===3 || fieldType === 8 || fieldType === 10 ) comparisonValue = '<';
                                        else comparisonValue = 'Contains';
                                        setValue(`attributes.${idx}.attributeComparison`, comparisonValue);
                                        resetField(`attributes.${idx}.attributeValue`);
                                        resetField(`attributes.${idx}.attributeMutipleValues`);
                                        resetField(`attributes.${idx}.attributeTo`);
                                    }}
                                />
                            </Col>
                            {!!attr?.attributeName && (
                                <>
                                    <RenderField
                                        attribute={attr}
                                        key={field.id}
                                        index={idx}
                                        isAttributeValuesLoading={
                                            attributeValuesLoader.isLoading && loadingAttributeIndex === idx
                                        }
                                    />
                                    <Col sm={1} className="fg-icons-wrapper pl0">
                                        <div className="fg-icons">
                                        <RSTooltip
                                            text={`${selectIconTooltip(idx)}`}
                                            position="top"
                                            className="lh0"
                                        >
                                            <i
                                                className={`${selectIcon(idx)} ${
                                                    attributes?.length > 4 && !idx ? 'click-off' : ''
                                                } icon-md`}
                                                onClick={() => addAttribute(idx)}
                                            />
                                        </RSTooltip>
                                        </div>
                                    </Col>
                                </>
                            )}
                        </Row>
                    </div>
                );
            })}
        </Fragment>
    );
};

export default AttributeSelector;
