import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { BODYCONFIG, SETTINGS_ICON } from '../../constant';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import RSTooltip from 'Components/RSTooltip';
import { Col, Row } from 'react-bootstrap';

const FormButtons = ({
    selectedColor,
    preview,
    isTellAFriend,
    formState,
    isQrPreview = false,
    tag,
    themeColors,
    formStylesButtonRounding,
    formStylesButtonAlignment,
}) => {
    const { control, setValue, getValues, watch } = useFormContext();
    const allValues = getValues();
    
    // Extract button rounding value
    const buttonRounding = useMemo(() => {
        if (
            typeof formStylesButtonRounding === 'object' &&
            formStylesButtonRounding !== null &&
            formStylesButtonRounding.value !== undefined
        ) {
            return formStylesButtonRounding.value;
        }
        return formStylesButtonRounding || 'default';
    }, [formStylesButtonRounding]);

    // Extract button alignment value
    const buttonAlignment = useMemo(() => {
        if (
            typeof formStylesButtonAlignment === 'object' &&
            formStylesButtonAlignment !== null &&
            formStylesButtonAlignment.value !== undefined
        ) {
            return formStylesButtonAlignment.value;
        }
        return formStylesButtonAlignment || '';
    }, [formStylesButtonAlignment]);

    // Calculate justifyContent value based on alignment
    const justifyContentValue = useMemo(() => {
        // debugger
        // Respect explicit alignment first
        if (buttonAlignment === 'left') {
            return 'flex-start';
        } else if (buttonAlignment === 'right') {
            return 'flex-end';
        } else if (buttonAlignment === 'center') {
            return 'center';
        }

        // Default behaviors for layouts if alignment is not set or defaults apply
        if (
            allValues?.isProgressiveProfiling &&
            (allValues?.formStyles?.formLayout === 'noLabels' || allValues?.formStyles?.formLayout === 'horizontal') &&
            !preview
        ) {
            return '';
        } else if (allValues?.formStyles?.formLayout === 'vertical' || allValues?.formStyles?.formLayout === 'noLabels') {
            return 'flex-start';
        } else if (allValues?.formStyles?.formLayout === 'horizontal') {
            return 'center';
        } else {
            // Default behavior
            return '';
        }
    }, [buttonAlignment, allValues?.formStyles?.formLayout, allValues?.isProgressiveProfiling, preview]);

    let { dispatchState } = isQrPreview ? '' : useContext(FormGeneratorContext);
    const [selectedButtonColor, setSelectedButtonColor] = useState({
        cancelColor: '#ffffff',
        submitColor: '#333333',
    });
    const isEdit = watch('isEdit');

    const color = getValues('formGenerator.submitColor');

    const handleColorButton = (target, type) => {
        const color = target?.contentAreaContainer?.children[0]?.children[0]?.getAttribute('style');
        const mySelectedColor = color?.split(':');
        if (type === 'cancel') {
            setSelectedButtonColor((pre) => ({ ...pre, cancelColor: mySelectedColor?.[1]?.slice(0, -1) || '#ffffff' }));
        } else {
            setSelectedButtonColor((pre) => ({ ...pre, submitColor: mySelectedColor?.[1]?.slice(0, -1) || '#333333' }));
        }
        setValue(`formGenerator.submitColor`, selectedButtonColor);
    };
    let data = watch();
    const [submitCheck, setSubmitCheck] = useState(false);

    const getPreviewButtonHtml = (fieldValue, formStateValue, fallback) => {
        if (typeof fieldValue === 'string' && fieldValue.trim()) return fieldValue;
        if (typeof formStateValue === 'string' && formStateValue.trim()) return formStateValue;
        if (formStateValue?.buttonText) return `<p>${formStateValue.buttonText}</p>`;
        return `<p>${fallback}</p>`;
    };

    useEffect(() => {
        const submitVal = data?.Submit;
        const hasColor = typeof submitVal === 'string' ? submitVal.includes('background-color') : false;
        setSubmitCheck(!hasColor);
    }, [data]);

    // Get the current form layout
    const formLayout = allValues?.formStyles?.formLayout || 'horizontal';

    return (
        <div className={`${preview ? 'fbc-preview' : 'form-builder-component'}`} style={{ background: selectedColor }}>
            <div>
                <div className={`editor-text formButton `}>
                    <Row>
                        {' '}
                        <Col
                            md={
                                (allValues?.formStyles?.formLayout === 'horizontal' ||
                                    allValues?.formStyles?.formLayout === 'noLabels') &&
                                allValues?.formStyles?.buttonAlignment === 'center' &&
                                !preview
                                ? 10
                                : 12
                        }
                    >
                        <ul
                            className={`rs-list-inline rli-space-5 form-button position-relative form-button w-100 ${(tag === "KYC") ? '' : ''} d-flex align-items-center ${allValues?.formStyles?.formLayout === 'horizontal' && buttonAlignment === 'center' && preview ? 'position-relative' : ''} ${(buttonAlignment === 'left' && !preview) ? 'ml10' : (buttonAlignment === 'right' && !preview && allValues?.formStyles?.formLayout === 'horizontal') ? 'pr13' : (buttonAlignment === 'right' && !preview && allValues?.formStyles?.formLayout !== 'horizontal') ? 'pr22' : !preview ? 'pr29' : (buttonAlignment === 'center' && preview && allValues?.formStyles?.formLayout === 'horizontal') ? 'left-60' : ''} ${allValues?.formStyles?.formLayout !== 'horizontal' && !preview ? 'ml10' : ''}
                            ${allValues?.formStyles?.formLayout === 'horizontal' && buttonAlignment === 'left' && preview ? 'ml10' : ''}`}
                            style={{
                                justifyContent: justifyContentValue
                            }}>
                            {/* Spacer element to align Cancel button with Enable CAPTCHA text - uses CSS variable for dynamic sizing */}
                            {/* {!preview && (
                                <li 
                                    className="form-button-spacer"
                                ></li>
                            )} */}
                            <li>
                                <button
                                    type="button"
                                    className="rs-form-button rsfb-cancel pe-none"
                                    style={{
                                        backgroundColor: `${color?.cancelColor}`,
                                        color: '#000000',
                                        borderRadius: buttonRounding === 'full' ? '50px' :
                                            buttonRounding === 'none' ? '0px' :
                                                '4px'
                                    }}
                                >
                                    {preview ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: getPreviewButtonHtml(
                                                    data?.CancelView,
                                                    formState?.CancelView,
                                                    'Cancel',
                                                ),
                                            }}
                                        />
                                    ) : (
                                        <RSEditorPopup
                                            name={`CancelView`}
                                            control={control}
                                            // initialValue={!!formState?.CancelView ? formState?.CancelView : 'Cancel'}
                                            initialValue={!!formState?.CancelView ? data?.CancelView : 'Cancel'}
                                            init={BODYCONFIG}
                                            disabled={preview}
                                            applyColorToLinksOnly
                                            onNodeChange={({ target }) => {
                                                handleColorButton(target, 'cancel');
                                            }}
                                            handleChange={(e) => {
                                                                                            dispatchState({
                                                    type: 'UPDATE',
                                                    field: 'CancelView',
                                                    payload: e?.html,
                                                });
                                            }}
                                        />
                                    )}
                                </button>
                            </li>
                            <li>
                                {' '}
                                <button
                                    type="button"
                                    className={`rs-form-button rsfb-submit ${submitCheck ? 'submitini' : ''}`}
                                    style={{
                                        backgroundColor: themeColors?.accent || `${color?.submitColor || '#005534'}`,
                                        color: preview ? '#ffffff' : undefined,
                                        padding: preview ? '10px 24px' : undefined,
                                        borderRadius: buttonRounding === 'full' ? '50px' :
                                            buttonRounding === 'none' ? '0px' :
                                                '4px'
                                    }}
                                >
                                    {preview ? (
                                        <span
                                            className="rs-form-button-preview-label"
                                            dangerouslySetInnerHTML={{
                                                __html: getPreviewButtonHtml(
                                                    data?.Submit,
                                                    formState?.Submit,
                                                    'Submit',
                                                ),
                                            }}
                                        />
                                    ) : (
                                        <RSEditorPopup
                                            name={`Submit`}
                                            control={control}
                                            // initialValue={!!formState?.Submit ? formState?.Submit : 'Submit'}
                                            initialValue={!!formState?.Submit ? data?.Submit : 'Submit'}
                                            init={BODYCONFIG}
                                            disabled={preview}
                                            applyColorToLinksOnly
                                            minChars={2}
                                            maxChars={30}
                                            preventLineBreaks={true}
                                            onNodeChange={({ target }) => {
                                                handleColorButton(target, 'submit');
                                            }}
                                            handleChange={(e) => {
                                                dispatchState({
                                                    type: 'UPDATE',
                                                    field: 'Submit',
                                                    payload: e?.html,
                                                });
                                            }}
                                            hideLinkTools={tag === 'KYC' || tag === 'Survey' ? true : false}
                                        />
                                    )}
                                </button>
                            </li>
                            {(tag === 'KYC' || tag === 'Survey') && (
                                <li
                                    onClick={() => {
                                        dispatchState({
                                            type: 'UPDATE',
                                            field: 'webHookPopup',
                                            payload: true,
                                        });
                                    }}
                                    className='ml15'
                                >
                                    <RSTooltip position="top" text="Webhook settings" className="lh0">
                                        <i className={`${SETTINGS_ICON} icon-md color-primary-blue`}></i>
                                    </RSTooltip>
                                </li>
                            )}
                        </ul></Col></Row>
                </div>
            </div>
        </div>
    );
};

export default memo(FormButtons);
