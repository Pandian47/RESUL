import { circle_minus_fill_medium, circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { uniqBy } from 'Utils/modules/lodashReplacements';

import { PRIORITY, INTERVAL } from '../../constants';

import { CHANNELS_LIST } from 'Utils/modules/communicationChannels';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { getSortedChannels } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';
import { createIncrementArray } from 'Utils/modules/display';

const MAX_RULES = 3;

const RuleFields = ({ index, productTypes, ruleTypeList, channelTypes }) => {
    const { control, getValues, trigger, clearErrors } = useFormContext();
    const fieldName = `rulesTypes[${index}].rules`;
    const currentRuleType = useWatch({ control, name: `rulesTypes[${index}].ruleType` });

    const { communicationTypes } = useSelector(({ communicationSettingsReducer }) => communicationSettingsReducer);

    // Get raw data based on rule type
    const getRawData = (ruleType) => {
        if (!ruleType) return [];
        const ruleTypeName = ruleType.ruleTypeName?.toLowerCase() || '';
        switch (ruleTypeName) {
            case 'communication type':
                return communicationTypes || [];
            case 'product type':
                return productTypes || [];
            case 'channel type':
                return getSortedChannels(advanceSearchAvailableChannels(uniqBy(CHANNELS_LIST, 'lable')),'id') || [];
            default:
                return [];
        }
    };
    const advanceSearchAvailableChannels = (channels) => {
        let notAvailableChannels = [3, 4,5,6,7,10,13,15,16,25,26,30,33,34];
        return channels.filter(channel => !notAvailableChannels.includes(channel.id));
    };

    // Dynamically determine textField and dataItemKey based on data structure
    const getFieldConfig = (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { textField: 'attributeName', dataItemKey: 'campaignAttributeId' };
        }

        const firstItem = data[0];

        // Check for Communication Type structure
        if (firstItem.attributeName && firstItem.campaignAttributeId) {
            return { textField: 'attributeName', dataItemKey: 'campaignAttributeId' };
        }

        // Check for Product Type structure
        if (firstItem.categoryname && firstItem.categoryId) {
            return { textField: 'categoryname', dataItemKey: 'categoryId' };
        }

        // Check for Channel Type structure
        if (firstItem.lable) {
            return { textField: 'lable', dataItemKey: 'id' };
        }

        // Default fallback
        return { textField: 'attributeName', dataItemKey: 'campaignAttributeId' };
    };

    // Get raw data without transformation
    const ruleTypeData = useMemo(() => {
        return getRawData(currentRuleType);
    }, [currentRuleType, communicationTypes, productTypes, channelTypes]);

    // Get field config dynamically based on data structure
    const fieldConfig = useMemo(() => {
        return getFieldConfig(ruleTypeData);
    }, [ruleTypeData]);

    // Get field name based on rule type
    const getTypeFieldName = (ruleType) => {
        if (!ruleType) return 'type';
        return 'type'; // All rule types use 'type' field
    };

    const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({ control, name: fieldName });

    const typeFieldName = getTypeFieldName(currentRuleType);
    const PRIORITY_LEVEL = PRIORITY;
    const CAMPAIGN_LIMIT = createIncrementArray(5);
    const TIME_DURATION = INTERVAL;
    const plusIcon = `${circle_plus_medium} color-primary-blue icon-md`;
    const minusIcon = `${circle_minus_fill_medium} color-primary-red icon-md`

    // Get filtered data excluding already selected values
    const getFilteredTypeData = (currentIdx) => {
        if (!ruleTypeData || ruleTypeData.length === 0) return [];

        // Get all selected type values from other rules (excluding current index)
        const selectedIds = [];
        ruleFields.forEach((field, ruleIdx) => {
            if (ruleIdx !== currentIdx) {
                const selectedValue = getValues(`${fieldName}[${ruleIdx}].${typeFieldName}`);
                if (selectedValue) {
                    const idValue = selectedValue[fieldConfig.dataItemKey] || selectedValue?.id || selectedValue?.categoryId || selectedValue?.campaignAttributeId;
                    if (idValue) {
                        selectedIds.push(idValue);
                    }
                }
            }
        });

        // Filter out already selected values
        return ruleTypeData.filter((item) => {
            const itemId = item[fieldConfig.dataItemKey] || item?.id || item?.categoryId || item?.campaignAttributeId;
            return !selectedIds.includes(itemId);
        });
    };

    return (
        <>
            {ruleFields.map((field, idx) => {
                const filteredTypeData = getFilteredTypeData(idx);
                const currentSelectedValue = getValues(`${fieldName}[${idx}].${typeFieldName}`);

                // Include current selected value in the data if it exists
                const dropdownData = currentSelectedValue
                    ? [...filteredTypeData, currentSelectedValue]
                    : filteredTypeData;

                return (
                    <div className="bg-tertiary-blue p19 position-relative rulefields-conatiner" key={field.id}>

                        <div className='form-group mt10'>
                            <Row>
                                <Col md={6}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${fieldName}[${idx}].${typeFieldName}`}
                                        label={currentRuleType?.ruleTypeName || 'Type'}
                                        data={dropdownData}
                                        textField={fieldConfig.textField}
                                        dataItemKey={fieldConfig.dataItemKey}
                                        required
                                        rules={{
                                            required: `${currentRuleType?.ruleTypeName || 'Type'} is required`,
                                        }}
                                        handleChange={() => {
                                            clearErrors(`${fieldName}[${idx}].${typeFieldName}`);
                                        }}
                                    />
                                </Col>
                                <Col sm={{ offset: 0, span: 6 }}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${fieldName}[${idx}].priority`}
                                        label="Priority"
                                        data={PRIORITY_LEVEL}
                                        textField={'text'}
                                        dataItemKey={'value'}
                                        required
                                        rules={{
                                            required: 'Priority is required',
                                        }}
                                        handleChange={() => {
                                            clearErrors(`${fieldName}[${idx}].priority`);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        <div className='form-group mb0'>
                            <Row>
                                <Col md={5}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${fieldName}[${idx}].limit`}
                                        label="Limit"
                                        data={CAMPAIGN_LIMIT}
                                        textField={'text'}
                                        dataItemKey={'value'}
                                        required
                                        rules={{
                                            required: 'Limit is required',
                                        }}
                                        handleChange={() => {
                                            clearErrors(`${fieldName}[${idx}].limit`);
                                        }}
                                    />
                                </Col>
                                <Col md={1} className='mt2 pl0 text-right'>
                                    per
                                </Col>
                                <Col md={6}>
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${fieldName}[${idx}].interval`}
                                        label="Interval"
                                        data={TIME_DURATION}
                                        textField={'text'}
                                        dataItemKey={'value'}
                                        required
                                        rules={{
                                            required: 'Interval is required',
                                        }}
                                        handleChange={() => {
                                            clearErrors(`${fieldName}[${idx}].interval`);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <div className='Left100 d-inline-block position-absolute ml15 bottom0'>

                            <RSTooltip className="lh0" text={idx === 0 ? 'Add' : 'Delete'} position="top">
                                <div className={`${ruleFields.length === ruleTypeData?.length && idx === 0
                                    ? 'pe-none click-off'
                                    : ''
                                    }`}>
                                    <i
                                        className={`${idx === 0 ? plusIcon : minusIcon}`}
                                        onClick={async () => {
                                            if (idx === 0) {
                                                // Collect all fields to validate
                                                const fieldsToValidate = [];

                                                // Collect fields from all rules
                                                ruleFields.forEach((field, ruleIdx) => {
                                                    fieldsToValidate.push(
                                                        `${fieldName}[${ruleIdx}].type`,
                                                        `${fieldName}[${ruleIdx}].priority`,
                                                        `${fieldName}[${ruleIdx}].limit`,
                                                        `${fieldName}[${ruleIdx}].interval`
                                                    );
                                                });

                                                // Also validate rule type
                                                fieldsToValidate.push(`rulesTypes[${index}].ruleType`);

                                                // Trigger validation for all fields
                                                const isValid = await trigger(fieldsToValidate);

                                                // If any field is invalid, stop here
                                                if (!isValid) return;

                                                appendRule({ type: '', priority: '', limit: '', interval: '' });
                                            } else {
                                                removeRule(idx);
                                            }
                                        }}
                                    ></i>
                                </div>
                            </RSTooltip>
                        </div>


                        {/* <div className="bg-tertiary-blue p30">
                            
                        </div> */}
                    </div>
                );
            })}
        </>
    );
};

export default RuleFields;
