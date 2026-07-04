import { close_mini } from 'Constants/GlobalConstant/Glyphicons';
import { SELECT_PROPER_VALUES } from 'Constants/GlobalConstant/ValidationMessage';
import { useContext, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { getSessionId } from 'Reducers/globalState/selector';
import RenderField from '../RenderField/RenderField';
import { DynamicListCreateContext } from '../..';
import { resolveTriggerDropdownPrimitiveValue } from '../../constant';

const CustomEventRow = ({
    field,
    idn,
    fieldName,
    ruleAttributeIndex,
    customState,
    customEventFieldCommonProps,
    currentAttr,
    title,
    duplicateRule,
    errorGroup,
    errorCustomGroup,
    onRemove,
    pages,
    TriggerName,
}) => {
    const { control, resetField, setValue, clearErrors } = useFormContext();
    const { ListState, dispatchTriggerAttributeValues } = useContext(DynamicListCreateContext);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { formAttributeId = {} } = ListState ?? {};
    const rowPath = `${fieldName}.RuleAttributes[${ruleAttributeIndex}].attributeCustom[${idn}]`;
    const rowAttribute = useWatch({ control, name: rowPath, defaultValue: field });
    const parentColumnName = useMemo(
        () => resolveTriggerDropdownPrimitiveValue(currentAttr?.attributeValue) || customState?.field || '',
        [currentAttr?.attributeValue, customState?.field],
    );

    const handleCustomRuleTypeChange = (e) => {
        const selectedRuleType = e?.value ?? e?.target?.value;

        resetField(`${rowPath}.attributeComparison`);
        resetField(`${rowPath}.attributeValue`);
        resetField(`${rowPath}.attributeTo`);
        resetField(`${rowPath}.attributeMultipleValues`);
        setValue(`${rowPath}.attributeMultipleValues`, []);

        if (!selectedRuleType?.value || !dispatchTriggerAttributeValues || !parentColumnName) {
            return;
        }

        dispatchTriggerAttributeValues(
            {
                triggerddlValue: pages?.id,
                attributeName: 'Custom events',
                triggerSourceId: TriggerName?.triggerId,
                fieldType: selectedRuleType?.fieldType ?? selectedRuleType?.fieldtype ?? 'D',
                departmentId,
                clientId,
                userId,
                levelNo: 1,
                formId: formAttributeId?.[TriggerName?.triggerId] ?? '',
                columnName: parentColumnName,
                attributevalue: selectedRuleType?.value ?? '',
            },
            rowPath,
            selectedRuleType,
        );
    };

    return (
        <Row className="customEventRow align-items-start">
            {duplicateRule?.show &&
                duplicateRule?.index === idn &&
                duplicateRule?.isCustomDuplicateError &&
                title === errorGroup &&
                errorCustomGroup === currentAttr?.attributeValue && (
                    <span className="mb20 color-primary-red">Duplicate values</span>
                )}
            <Col sm={4} className="customEventColoum4 pl0">
                <RSKendoDropDownList
                    name={`${rowPath}.attributeName`}
                    control={control}
                    data={customState?.data || []}
                    label="Custom rule type"
                    textField="value"
                    dataItemKey="id"
                    required
                    rules={{
                        required: SELECT_PROPER_VALUES,
                    }}
                    handleChange={handleCustomRuleTypeChange}
                />
            </Col>
            <Col sm={8} className="customEventColoum8 custom-event-field-with-remove d-flex align-items-end">
                <div className="custom-event-field flex-grow-1">
                    <RenderField
                        {...customEventFieldCommonProps}
                        attribute={rowAttribute}
                        name={rowPath}
                        isCustom
                        customEventColumnName={parentColumnName}
                    />
                </div>
                <div className="removeCustomEventRow removeCustomEventRow--inline lh0">
                    <RSTooltip text="Remove" className="lh0">
                        <i
                            id="rs_RuleGrouping_closeremove"
                            className={`${close_mini} icon-xs color-primary-red`}
                            onClick={() => {
                                onRemove(idn);
                                clearErrors(`${fieldName}.RuleAttributes[${ruleAttributeIndex}].attributeCustom`);
                            }}
                        />
                    </RSTooltip>
                </div>
            </Col>
        </Row>
    );
};

const CustomEvents = ({
    fieldName,
    ruleAttributeIndex,
    currentAttr,
    commonProps,
    customState,
    title,
    duplicateRule,
    errorGroup,
    errorCustomGroup,
    attributeCustomFieldActionsRef,
}) => {
    const { control, clearErrors } = useFormContext();
    const { dispatchState } = useContext(DynamicListCreateContext);
    const ruleIndex = Number(fieldName.split('.')[1]);

    const attributeCustomPath = `${fieldName}.RuleAttributes.${ruleAttributeIndex}.attributeCustom`;
    const { fields: customFields, remove: customRemove, replace: replaceCustomFields } = useFieldArray({
        control,
        name: attributeCustomPath,
    });

    if (attributeCustomFieldActionsRef) {
        attributeCustomFieldActionsRef.current[ruleAttributeIndex] = {
            replace: replaceCustomFields,
            clearErrors: () => clearErrors(attributeCustomPath),
        };
    }

    const isCustomEventsContains =
        currentAttr?.attributeName?.value === 'Custom events' &&
        currentAttr?.attributeComparison === 'Contains';

    const { getTriggerAttributeValuesForRuleType, pages, TriggerName, ...customEventFieldCommonProps } =
        commonProps ?? {};

    if (!isCustomEventsContains || customFields.length === 0) {
        return null;
    }

    return (
        <>
            {customFields.map((field, idn) => (
                <CustomEventRow
                    key={field.id}
                    field={field}
                    idn={idn}
                    fieldName={fieldName}
                    ruleAttributeIndex={ruleAttributeIndex}
                    customState={customState}
                    customEventFieldCommonProps={customEventFieldCommonProps}
                    currentAttr={currentAttr}
                    title={title}
                    duplicateRule={duplicateRule}
                    errorGroup={errorGroup}
                    errorCustomGroup={errorCustomGroup}
                    onRemove={(customIndex) => {
                        dispatchState({
                            type: 'REMOVE_CUSTOM_EVENT_FIELD_TRIGGER_VALUES',
                            payload: {
                                ruleIndex,
                                attributeIndex: ruleAttributeIndex,
                                customIndex,
                            },
                        });
                        customRemove(customIndex);
                    }}
                    pages={pages}
                    TriggerName={TriggerName}
                />
            ))}
        </>
    );
};

export default CustomEvents;
