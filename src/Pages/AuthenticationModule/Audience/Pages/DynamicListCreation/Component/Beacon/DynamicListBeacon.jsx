import { SELECT_PROPER_VALUES, SELECT_Type } from 'Constants/GlobalConstant/ValidationMessage';
import { memo, useContext, useEffect, useMemo, useRef } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';

import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import SpinnerLoader from 'Components/Skeleton/Components/common/SpinnerLoader';
import { formatName } from 'Utils/modules/formatters';
import { parseRuleJSON } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { buildFieldTriggerValuesKey } from '../../constant';
import { comparisonTypeConfig } from '../RenderField/constant';
import { DynamicListCreateContext } from '../..';
import {
    BEACON_ACTION_DATA,
    buildBeaconFromEditRule,
    matchesBeaconId,
    normalizeBeaconList,
    resolveInOutValue,
} from './constant';

const findBeaconAttrFromEditList = (editList, currentRuleIndex, index, attribute) => {
    if (!editList?.dynamiclist?.length) {
        return null;
    }
    const ruleGroupIndex = currentRuleIndex !== undefined ? currentRuleIndex : 0;
    const ruleGroupKey = `RuleGroup${ruleGroupIndex + 1}`;

    const currentItem = editList.dynamiclist.find((item) => item?.ruleJSON) ?? editList.dynamiclist[0];
    if (!currentItem?.ruleJSON) {
        return null;
    }
    const parsed = parseRuleJSON(currentItem.ruleJSON, {});
    const ruleAttributes = parsed?.[ruleGroupKey]?.RuleAttributes;
    if (!ruleAttributes?.length) {
        return null;
    }

    let currentAttr = null;
    if (index >= 0 && index < ruleAttributes.length) {
        currentAttr = ruleAttributes[index];
        if (
            currentAttr &&
            currentAttr?.Name !== 'Beacon' &&
            !currentAttr?.BeaconId &&
            attribute?.attributeName?.value
        ) {
            currentAttr = ruleAttributes.find((attr) => attr?.Name === attribute.attributeName.value);
        }
    } else if (attribute?.attributeName?.value) {
        currentAttr = ruleAttributes.find((attr) => attr?.Name === attribute.attributeName.value);
    }
    if (!currentAttr?.BeaconId) {
        currentAttr = ruleAttributes.find((attr) => attr?.BeaconId !== undefined && attr?.BeaconId > 0);
    }
    if (!currentAttr?.BeaconId && !currentAttr?.AttributeName) {
        currentAttr = ruleAttributes.find((attr) => formatName(attr?.Name) === 'beacon');
    }
    if (!currentAttr) {
        return null;
    }
    return currentAttr;
};

const DynamicListBeacon = ({
    attribute,
    className,
    index,
    name,
    setDuplicateRule,
    handleDuplicateCheck,
    checkValidCondition,
    currentRuleIndex,
}) => {
    const { control, setValue, getValues } = useFormContext();
    const { ListState } = useContext(DynamicListCreateContext);
    const beaconListFromStore = useSelector((state) => state.beaconReducer?.list);
    const editList = useSelector(({ dynamicListReducer }) => dynamicListReducer?.editList);
    const editHydratedRef = useRef(false);

    const attributeLabel = attribute?.attributeName?.value ?? 'Beacon';
    const beaconFieldKey = buildFieldTriggerValuesKey(name, '4D', 1);
    const fieldTriggerState = ListState?.fieldTriggerValues?.[beaconFieldKey];
    const isBeaconListLoading = fieldTriggerState?.isLoading ?? false;
    const beaconListFromField = fieldTriggerState?.triggerValues;

    const beaconList = useMemo(() => {
        const fullList = Array.isArray(beaconListFromField)
            ? beaconListFromField
            : beaconListFromField?.[attributeLabel] ??
              beaconListFromField?.Beacon ??
              (Array.isArray(beaconListFromStore) ? beaconListFromStore : null);
        return normalizeBeaconList(Array.isArray(fullList) ? fullList : []);
    }, [attributeLabel, beaconListFromField, beaconListFromStore]);

    useEffect(() => {
        editHydratedRef.current = false;
    }, [beaconList, index, currentRuleIndex, attribute?.attributeName?.value]);

    useEffect(() => {
        if (editHydratedRef.current || !beaconList.length || !editList?.dynamiclist?.length) {
            return;
        }

        const currentAttr = findBeaconAttrFromEditList(editList, currentRuleIndex, index, attribute);
        if (!currentAttr) {
            return;
        }

        const selectedItem = buildBeaconFromEditRule(currentAttr, beaconList);
        if (!selectedItem) {
            return;
        }

        const currentFrom = getValues(`${name}.attributeFrom`);
        const isSameFrom =
            currentFrom &&
            typeof currentFrom === 'object' &&
            matchesBeaconId(currentFrom?.id, selectedItem.id);

        if (!isSameFrom) {
            setValue(`${name}.attributeFrom`, selectedItem, { shouldDirty: false });
        }

        const savedAction = resolveInOutValue(currentAttr?.Value);
        if (savedAction) {
            const currentAction = getValues(`${name}.attributeValue`);
            const isSameAction =
                currentAction &&
                typeof currentAction === 'object' &&
                currentAction?.value === savedAction;
            if (!isSameAction) {
                setValue(`${name}.attributeValue`, { value: savedAction }, { shouldDirty: false });
            }
        }

        editHydratedRef.current = true;
    }, [
        attribute,
        beaconList,
        currentRuleIndex,
        editList,
        getValues,
        index,
        name,
        setValue,
    ]);

    const handleBeaconChange = (e) => {
        const selectedValue = e?.value ?? e?.target?.value;
        if (selectedValue) {
            setValue(`${name}.attributeFrom`, selectedValue);
        }
        setDuplicateRule({
            show: false,
            index: 0,
        });
    };

    const handleTypeChange = () => {
        setDuplicateRule({
            show: false,
            index: 0,
        });
    };

    const handleActionChange = () => {
        setDuplicateRule({
            show: false,
            index: 0,
        });
    };

    if (isBeaconListLoading && !beaconList.length) {
        return (
            <Row className={className}>
                <Col sm={12}>
                    <SpinnerLoader />
                </Col>
            </Row>
        );
    }

    return (
        <Row className={className}>
            <Col sm={4}>
                <RSKendoDropDown
                    control={control}
                    name={`${name}.attributeComparison`}
                    label="Type"
                    data={Object.values(comparisonTypeConfig?.string ?? {})}
                    required={checkValidCondition()}
                    rules={
                        checkValidCondition()
                            ? {
                                  required: SELECT_Type,
                              }
                            : {}
                    }
                    handleChange={handleTypeChange}
                    handleOnBlur={() => {
                        handleDuplicateCheck?.();
                    }}
                />
            </Col>
            <Col sm={4}>
                <RSKendoDropDown
                    control={control}
                    name={`${name}.attributeFrom`}
                    handleChange={handleBeaconChange}
                    label="Attribute value"
                    data={beaconList}
                    textField="name"
                    dataItemKey="id"
                    isLoading={isBeaconListLoading}
                    required={checkValidCondition()}
                    rules={
                        checkValidCondition()
                            ? {
                                  required: SELECT_PROPER_VALUES,
                              }
                            : {}
                    }
                    handleOnBlur={() => {
                        handleDuplicateCheck?.();
                    }}
                />
            </Col>
            <Col sm={4}>
                <RSKendoDropDown
                    control={control}
                    name={`${name}.attributeValue`}
                    label="Value"
                    data={BEACON_ACTION_DATA}
                    textField="value"
                    dataItemKey="value"
                    required={checkValidCondition()}
                    rules={
                        checkValidCondition()
                            ? {
                                  required: SELECT_PROPER_VALUES,
                              }
                            : {}
                    }
                    handleChange={handleActionChange}
                    handleOnBlur={() => {
                        handleDuplicateCheck?.();
                    }}
                />
            </Col>
        </Row>
    );
};

export default memo(DynamicListBeacon);
