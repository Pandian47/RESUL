import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import { save_mini, close_mini } from 'Constants/GlobalConstant/Glyphicons';
import { CANCEL, ENTER_VALUE, SAVE } from 'Constants/GlobalConstant/Placeholders';

const FIELD_NAME = 'tabLabel';

const TabLabelEditor = ({
    value,
    onCommit,
    onCancel,
    maxLength = 0,
    textClass = '',
    validator = null,
    emptyErrorMessage,
    placeholderText = '',
    onValueChange,
}) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: { [FIELD_NAME]: value ?? '' },
    });

    useEffect(() => {
        reset({ [FIELD_NAME]: value ?? '' });
    }, [value, reset]);

    const rules = useMemo(
        () => ({
            validate: (val) => {
                const t = String(val ?? '').trim();
                if (!t) {
                    return emptyErrorMessage ?? ENTER_VALUE;
                }
                if (typeof validator === 'function') {
                    const msg = validator(t);
                    if (msg) {
                        return msg;
                    }
                }
                return true;
            },
        }),
        [validator, emptyErrorMessage],
    );

    const handleValidSubmit = useCallback(
        (data) => {
            const trimmed = String(data[FIELD_NAME] ?? '').trim();
            onCommit(trimmed);
        },
        [onCommit],
    );

    const submitForm = useCallback(() => {
        handleSubmit(handleValidSubmit)();
    }, [handleSubmit, handleValidSubmit]);

    const hasFieldError = Boolean(errors[FIELD_NAME]);

    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitForm();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            }
        },
        [submitForm, onCancel],
    );

    const handleCancel = useCallback(
        (e) => {
            e?.stopPropagation?.();
            onCancel();
        },
        [onCancel],
    );

    return (
        <div className="tab-label-editor-root" onClick={(e) => e.stopPropagation()}>
            <div className="input-wrapper tab-label-editor-input-inner">
            {errors[FIELD_NAME]?.message && (
                <div className="validation-message top-10 pb0">{errors[FIELD_NAME].message}</div>
            )}
                <RSInput
                    name={FIELD_NAME}
                    control={control}
                    rules={rules}
                    isNewTheme={false}
                    placeholder={placeholderText}
                    className={`form-control form-control-sm pb0 ${textClass || ''}`.trim()}
                    classWrapper="tab-label-editor-rsinput w-auto m-0"
                    restrictSpecialChars
                    isKeyDownUpPrevent={false}
                    onKeyDown={handleKeyDown}
                    maxLength={maxLength > 0 ? maxLength : undefined}
                    autoFocus
                    handleOnchange={(e) => {
                        if (typeof onValueChange === 'function') {
                            onValueChange(e?.target?.value ?? '');
                        }
                    }}
                />
                <div className="tab-label-editor-actions align-items-center d-flex">
                    <RSTooltip
                        text={SAVE}
                        position="top"
                        className="lh0"
                        tooltipOverlayClass="rs-tag-remove-tooltip"
                        innerContent={false}
                    >
                        <i
                            role="button"
                            className={`${save_mini} icon-xs color-primary-blue ${
                                hasFieldError ? 'click-off' : 'cp'
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasFieldError) {
                                    return;
                                }
                                submitForm();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (hasFieldError) {
                                        return;
                                    }
                                    submitForm();
                                }
                            }}
                        />
                    </RSTooltip>
                    <RSTooltip
                        text={CANCEL}
                        position="top"
                        className="lh0"
                        tooltipOverlayClass="rs-tag-remove-tooltip"
                        innerContent={false}
                    >
                        <i
                            role="button"
                            tabIndex={0}
                            className={`${close_mini} icon-xs color-primary-red cp`}
                            onClick={handleCancel}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCancel(e);
                                }
                            }}
                        />
                    </RSTooltip>
                </div>
            </div>
            
        </div>
    );
};

export default TabLabelEditor;
