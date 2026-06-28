import { AGREE_TERMSCONDITIONS, KYC_PREVIEW, PREVIEW } from 'Constants/GlobalConstant/Placeholders';
import { memo, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { INPUT_TYPES } from 'Pages/AuthenticationModule/Preferences/Pages/FormGenerator/constant';
import AgreeCancel from 'Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Tabs/FormTypes/Components/AgreeCancel';
import FormButtons from 'Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Tabs/InputTabs/FormButtons';

const QRPreviewContent = ({ dropAble, selectedColor, previewTemp, updateFormStates, isQrCaptcha }) => {
    const renderField = (item, index, dropItems) => {
        try {
            if (!item) return null;

            let Component;
            const filterData = INPUT_TYPES?.filter(
                (defaultInput) => defaultInput?.componentName === item?.componentName,
            );

            const matrixComponentData = previewTemp?.find((previewItem) => previewItem?.type === 'Matrix');

            Component = filterData[0]?.component;
            let hint = dropItems['tinyMceLable' + index];
            let placeholder =
                dropItems[index]?.settings?.placeholder ||
                dropItems[index]?.settings?.tagsLabelName ||
                item.placeHolder;
            let mandatory = item?.mandatory;
            let isComponent = Component ? true : false;

            if (!item?.field && item?.columnType !== 'Hidden' && isComponent && Component) {
                const getLabelName = () => {
                    if (previewTemp?.[index]?.value) {
                        return previewTemp[index].value;
                    }
                    if (item?.tinyMceLable) {
                        return item.tinyMceLable;
                    }
                    if (item?.labelName) {
                        return item.labelName;
                    }
                    return 'Field Label';
                };

                const displayLabel = getLabelName();

                return (
                    <section
                        key={index}
                        className={`form-builder-component rs-form-component component-${item?.componentName} ${
                            mandatory ? 'form-section-required' : 'form-section-optional'
                        } ${item?.componentName === 'Matrix' ? '' : 'pe-none'} `}
                    >
                        <Component
                            index={index}
                            labelName={displayLabel}
                            placeHolder={placeholder}
                            mandatory={mandatory}
                            preview={true}
                            previewGridLayout={true}
                            mapTo={item?.mapTo}
                            optionData={item?.optionData}
                            matrixSub={previewTemp?.[index]?.matrixSub}
                            matrixTitle={previewTemp?.[index]?.matrixTitle}
                            rowDefaultValue={previewTemp?.[index]?.rowDefaultValue}
                            colDefaultValue={previewTemp?.[index]?.colDefaultValue}
                            type={item?.type}
                            sliderProps={previewTemp?.[index]}
                            isQrPreview={true}
                            matrixColumnValueType={matrixComponentData?.settingColumnType}
                            participant={previewTemp?.[index]?.participant}
                            participantTotal={previewTemp?.[index]?.participantTotal}
                        />
                    </section>
                );
            }
            return null;
        } catch (error) {
            return (
                <div key={index} className="form-builder-component" style={{ padding: '10px', color: '#999' }}>
                    <small>Field preview unavailable</small>
                </div>
            );
        }
    };

    return (
        <Row>
            <Col md={11} className="mx-auto p0">
                <div className={`rs-form-builder-preview-wrapper ${updateFormStates?.profilingToggle ? 'ToggleOn' : ''}`}>
                    <div
                        className={`rsfbpw-content offset-md-1 p21 ${updateFormStates?.layout}`}
                        style={{ backgroundColor: selectedColor }}
                    >
                        {dropAble?.map((item, index, dropItems) => renderField(item, index, dropItems))}

                        {(() => {
                            try {
                                return (
                                    <Row>
                                        <Col md={updateFormStates?.profilingToggle ? 11 : 11}>
                                            <Row>
                                                <Col md={{ offset: 4, span: 9 }} className="my11">
                                                    <section
                                                        className={`rs-form-component ${
                                                            updateFormStates?.profilingToggle ? 'ml7' : 'ml7'
                                                        } ${
                                                            dropAble?.['mandatoryAgree']
                                                                ? 'form-section-required'
                                                                : 'form-section-optional'
                                                        } pe-none`}
                                                    >
                                                        <AgreeCancel selectedColor={selectedColor} preview />
                                                    </section>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                );
                            } catch (error) {
                                return null;
                            }
                        })()}
                        
                        {(() => {
                            try {
                                return (
                                    <Row>
                                        <Col md={11}>
                                            <Row>
                                                <Col md={{ offset: updateFormStates?.profilingToggle ? 3 : 4, span: 8 }}>
                                                    <section
                                                        className={`rs-form-component mt0 ${
                                                            updateFormStates?.profilingToggle ? 'ml52' : ''
                                                        } ${
                                                            dropAble?.['mandatoryAgree']
                                                                ? 'form-section-required'
                                                                : 'form-section-optional'
                                                        } pe-none`}
                                                    >
                                                        <FormButtons
                                                            preview
                                                            isCaptcha={updateFormStates?.previewData?.enableCaptchaCheckbox || false}
                                                            formState={updateFormStates}
                                                            isQrPreview={true}
                                                        />
                                                    </section>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                );
                            } catch (error) {
                                return null;
                            }
                        })()}
                    </div>
                </div>
            </Col>
            <Col md={1}></Col>
        </Row>
    );
};

const QRPreview = ({ show, onHide, dropAble, selectedColor, previewTemp, previewFormstate, isQrCaptcha = false , fromFormAnalytics = false}) => {
    const defaults = {
        layout: 'form-theme-default',
        profilingToggle: false,
        Submit: '<p>Submit</p>',
        CancelView: '<p>Cancel</p>',
        previewData: { enableCaptchaCheckbox: false },
        AgreeCheckbox: false,
    };

    const submitButton = previewFormstate?.Submit || defaults.Submit;
    const cancelButton = previewFormstate?.CancelView || defaults.CancelView;

    const updateFormStates = {
        ...defaults,
        ...previewFormstate,
        layout: previewFormstate?.layout || defaults.layout,
        Submit: submitButton,
        CancelView: cancelButton,
        previewData: {
            enableCaptchaCheckbox: previewFormstate?.previewData?.enableCaptchaCheckbox || false,
        },
    };

    const defaultFormData = useMemo(() => {
        const agreeCheckboxState = previewFormstate?.AgreeCheckbox ?? false;
        
        if (!dropAble || !Array.isArray(dropAble)) {
            return { 
                formGenerator: [],
                AgreeCheckbox: agreeCheckboxState,
                tinyMceLableAgree: previewFormstate?.tinyMceLableAgree || AGREE_TERMSCONDITIONS,
                Submit: submitButton,
                CancelView: cancelButton,
                enableCaptchaCheckbox: previewFormstate?.previewData?.enableCaptchaCheckbox || false,
            };
        }

        const formGenerator = dropAble.map((item, index) => {
            const labelValue =
                previewTemp?.[index]?.value || item?.tinyMceLable || item?.labelName || `Field ${index + 1}`;

            // Special handling for Matrix component
            if (item?.columnType === 'Matrix' && previewTemp?.[index]) {
                return {
                    ...item,
                    tinyMceLable: labelValue,
                    tinyMceLableMain: labelValue,
                    inputPlaceHolder: item?.placeHolder || '',
                    matrixSub: previewTemp[index]?.matrixSub || [],
                    matrixTitle: previewTemp[index]?.matrixTitle || [],
                    matrix: {
                        rows: previewTemp[index]?.matrixSub || [],
                        columns: previewTemp[index]?.matrixTitle || [],
                    },
                };
            }

            return {
                ...item,
                tinyMceLable: labelValue,
                tinyMceLableMain: labelValue,
                inputPlaceHolder: item?.placeHolder || '',
            };
        });

        return { 
            formGenerator,
            AgreeCheckbox: agreeCheckboxState,
            tinyMceLableAgree: previewFormstate?.tinyMceLableAgree || AGREE_TERMSCONDITIONS,
            Submit: submitButton,
            CancelView: cancelButton,
            enableCaptchaCheckbox: previewFormstate?.previewData?.enableCaptchaCheckbox || false,
        };
    }, [dropAble, previewTemp, submitButton, cancelButton, previewFormstate]);


    const qrPreviewMethods = useForm({
        defaultValues: defaultFormData,
        mode: 'onChange',
    });

    useEffect(() => {
        if (defaultFormData?.formGenerator && defaultFormData.formGenerator.length > 0) {
            qrPreviewMethods.reset(defaultFormData);
        }
    }, [defaultFormData]);

    const renderPreviewBody = () => {
        try {
            return (
                <FormProvider {...qrPreviewMethods}>
                    <QRPreviewContent
                        dropAble={dropAble}
                        selectedColor={selectedColor}
                        previewTemp={previewTemp}
                        updateFormStates={updateFormStates}
                        isQrCaptcha={isQrCaptcha}
                    />
                </FormProvider>
            );
        } catch (error) {
            return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', marginBottom: '10px' }}>Preview is temporarily unavailable</p>
                </div>
            );
        }
    };

    return (
        <RSModal
            show={show}
            size={updateFormStates?.layout === 'form-theme-default' ? 'xlg' : 'lg'}
            header={fromFormAnalytics ? PREVIEW : KYC_PREVIEW}
            handleClose={onHide}
            bodyClassName="px5"
            body={renderPreviewBody()}
        />
    );
};

export default memo(QRPreview);

