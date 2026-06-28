import { onlyNumbers } from 'Utils/modules/inputValidators';
import { CANCEL, PROGRESSIVE_AUTO_SAVE, PROGRESSIVE_NUMBER, PROGRESSIVE_PRE_POPULATE, PROGRESSIVE_PROFILE, PROGRESSIVE_PROFILE_SETTINGS, PROGRESSIVE_TOTAL, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext } from 'react';
import { useFormContext } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import { Col, Row } from 'react-bootstrap';

import { FormGeneratorContext } from './FormGenerator';
import { INPUT_TYPES, getProgressiveProfilingStats, splitFieldsForProgressiveProfiling } from '../../constant';

const SettingsComponent = ({ show, onHide, fieldCount, formDefaultFields, profilingToggle }) => {
    const {
        control,
        watch,
        reset,
        setValue,
        getValues,
        formState: { isValid },
    } = useFormContext();
    const [isProgressiveProfiling, inputField] = watch(['isProgressiveProfiling', 'settingsInputField']);
    const { formState, dispatchState } = useContext(FormGeneratorContext);
    const { minAllowed, maxAllowed, isAvailable } = getProgressiveProfilingStats(formDefaultFields);
    
    const onSave = () => {
    const currentFormData = getValues('formGenerator') || [];
    const form = currentFormData.map(field => {
        if (field.field) return field; // Keep separator fields as-is
        const inputType = INPUT_TYPES.find(type => 
            type.componentName === field?.componentName || 
            type.columnType === field?.columnType ||
            type.name === field?.name
        );
        
        // Use field values if they exist, otherwise fallback to defaults - never use empty strings
        return {
            ...field,
            component: inputType?.component,
            labelName: field?.labelName || field?.tinyMceLabelMain || field?.tinyMceLable || inputType?.labelName || 'Field',
            placeHolder: field?.placeHolder || inputType?.placeHolder || '',
            icon: field?.icon || inputType?.icon || '',
            text: field?.text || inputType?.text || '',
            name: field?.name || inputType?.name || '',
        };
    });

    if (isProgressiveProfiling) {
        const textBlocks = form.filter(({ columnType }) => columnType === 'TextBlock');
        const changed = form.filter(({ field, columnType }) => !field && columnType !== 'TextBlock');
        const limit = parseInt(inputField, 10);
        const { visibleFields, queuedFields } = splitFieldsForProgressiveProfiling(changed, limit);

        const visible = [{ field: 'Visible fields' }, ...visibleFields];
        const queued = [{ field: 'Queued fields' }, ...queuedFields];

        const combined = [...textBlocks, ...visible, ...queued].map(e => {
            if (e.field) {
                return e;
            }
            return {
                ...e,
                labelName:
                    e.tinyMceLableMain ??
                    e.tinyMceLable ??
                    e.labelName ??
                    e.text ??
                    'Field',
            };
        });

        setValue('formGeneratorVisible', combined);
        setValue('formGenerator', combined);

        dispatchState({
            type: 'UPDATE',
            field: 'visibleAndQueued',
            payload: combined,
        });
    } else {
        setValue('isAutoSave', false);
        setValue('isPopulateFields', false);
        setValue('settingsInputField', '');

        const changed = form.filter(({ field }) => !field);
        setValue('formGenerator', changed);
    }

    // Use one dispatch for all settings updates
    dispatchState({
        type: 'UPDATE_SETTINGS',
        payload: {
            settingsPopup: false,
            profilingToggle: isProgressiveProfiling,
            fieldCount: isProgressiveProfiling ? Number(inputField) : 0,
        },
    });
};


    return (
        <RSModal
            show={show}
            size="xl"
            header={PROGRESSIVE_PROFILE_SETTINGS}
            handleClose={() => {
                onHide();
                setValue('settingsInputField', fieldCount);
                setValue('isProgressiveProfiling', profilingToggle);
            }}
            body={
                <div>
                    <div className={`form-group ${!isAvailable || !isProgressiveProfiling ? 'mb0': ''}`}>
                        <Row>
                            <Col sm={5} className="text-right">
                                <label className="control-label-left">{PROGRESSIVE_PROFILE}</label>
                            </Col>
                            <Col sm={6} className={!isAvailable ? 'pe-none click-off' : ''}>
                                <RSSwitch
                                    control={control}
                                    name="isProgressiveProfiling"
                                />
                            </Col>
                        </Row>
                    </div>
                    {isProgressiveProfiling && (
                        <>
                            {/* <div className="form-group pe-none click-off">
                                <Row>
                                    <Col sm={5} className="text-right">
                                        <label className="control-label-left">{PROGRESSIVE_PRE_POPULATE}</label>
                                    </Col>
                                    <Col sm={6}>
                                        <RSSwitch control={control} name="isPopulateFields" />
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group pe-none click-off">
                                <Row>
                                    <Col sm={5} className="text-right">
                                        <label className="control-label-left">{PROGRESSIVE_AUTO_SAVE}</label>
                                    </Col>
                                    <Col sm={6}>
                                        <RSSwitch control={control} name="isAutoSave" />
                                    </Col>
                                </Row>
                            </div> */}
                            <div className="form-group mb0">
                                <Row>
                                    <Col sm={5} className="text-right">
                                        <label className="control-label-left">{PROGRESSIVE_TOTAL}</label>
                                    </Col>
                                    <Col sm={4}>
                                        <RSInput
                                            control={control}
                                            name={`settingsInputField`}
                                            placeholder={'Value'}
                                            rules={{
                                                required: 'Enter a number',
                                                validate: (data) => {
                                                    const value = parseInt(data, 10);
                                                    if (
                                                        !isNaN(value) &&
                                                        value >= minAllowed &&
                                                        value <= maxAllowed
                                                    ) {
                                                        return true;
                                                    }
                                                    return `Enter value between ${minAllowed} and ${maxAllowed}.`;
                                                },
                                            }}
                                            maxLength={String(maxAllowed).length || 1}
                                            required={isProgressiveProfiling}
                                            onKeyDown={onlyNumbers}
                                        />
                                        <RSTooltip className={'float-end'} text={PROGRESSIVE_NUMBER}>
                                                {/* <i className={`${questionIcon} icon-md`} /> */}
                                                <i
                                                    className={`${circle_question_mark_mini} icon-mini color-primary-blue`}
                                                    id="circle_question_mark"
                                                />
                                            </RSTooltip>
                                    </Col>
                                    <Col sm={1} className="fg-icons-wrapper pl0 d-none">
                                        <div className="fg-icons position-relative top12">
                                            {/* <RSTooltip text={'Number of fields to be filled by the audience.'}> */}
                                            <RSTooltip text={PROGRESSIVE_NUMBER}>
                                                {/* <i className={`${questionIcon} icon-md`} /> */}
                                                <i
                                                    className={`${circle_question_mark_mini} icon-mini color-primary-blue`}
                                                    id="circle_question_mark"
                                                />
                                            </RSTooltip>
                                        </div>
                                    </Col>
                                </Row>
                            </div>{' '}
                        </>
                    )}
                </div>
            }
            footer={
                <>
                    <RSSecondaryButton
                        onClick={() => {
                            onHide();
                            setValue('settingsInputField', fieldCount);
                            setValue('isProgressiveProfiling', profilingToggle);
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={`${
                            isProgressiveProfiling
                                ? inputField !== '' &&
                                  !isNaN(parseInt(inputField, 10)) &&
                                  parseInt(inputField, 10) >= minAllowed &&
                                  parseInt(inputField, 10) <= maxAllowed
                                    ? ''
                                    : 'click-off'
                                : ''
                        }`}
                        onClick={() => onSave()}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export const Settings = memo(SettingsComponent);
