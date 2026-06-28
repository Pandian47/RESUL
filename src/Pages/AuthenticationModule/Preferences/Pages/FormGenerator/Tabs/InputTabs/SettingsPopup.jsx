import { ALLOW_MORE, CANCEL, CLEAR_ALL_LABELS, CLEAR_ALL_TAGS, OK, TYPE } from 'Constants/GlobalConstant/Placeholders';
import { memo, useEffect, useMemo, useState } from 'react';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { COMMENT_LIST } from '../../constant';
import { Row, Col } from 'react-bootstrap';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import SliderFields from './PopupContent/SliderFields';
import RatingFields from './PopupContent/RatingFields';
import InputFields from './PopupContent/InputFields';
import TagFields from './PopupContent/TagFields';
import RSInput from 'Components/FormFields/RSInput';
import { COLOR_PICKER } from '../../constant';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSColorPickerInput from 'Components/FormFields/RSColorPickerInput';
import ImageUpload from './ImageUpload';



const SettingsPopup = ({
    show,
    onHide = () => { },
    type,
    fieldSettings,
    setFieldSettings,
    placeHolder,
    header,
    control,
    index,
    setSettingsPopup,
    inputList,
    elementType,
    isEmail
}) => {
    const { watch, getFieldState } = useFormContext();
    
    const [inputField, setInputField] = useState(placeHolder);
    const [tagValue, setTagValue] = useState(inputList);
    const { getValues, setValue, reset, setError, clearErrors } = useFormContext();
    const fieldName = `formGenerator[${index}].settings.`;
    const draftFieldName = `formGenerator[${index}].settingsDraft.`;
    const isRadioTag = tagValue?.length < 2 && elementType === 'radio';
    const isCheckTag = tagValue?.length < 1 && elementType === 'checkbox';
    const isRadioCheckbox = elementType === 'radio' || elementType === 'checkbox';
    const errorMessage = () => {
        if (isRadioTag) {
            return ('Enter minimum two labels');
        } else if (isCheckTag) {
            return ('Enter minimum one label');
        }
    }
    const [selectedValue, checkBoxStatus, placeholder, maxLength, validationType, customErrorMsg, requiredOTP, tagsLabelName, ratingShape, ratingScale, sliderShape, commentBoxPlaceholder, dtInputType, textColor, bgColor, useGradient, gradientStart, gradientEnd, bgImageUrl, headerImageUrl] = watch([
        'commentBox' + index,
        fieldName + 'isChecked',
        fieldName + 'placeholder',
        fieldName + 'maxLength',
        fieldName + 'validationType',
        fieldName + 'customErrorMessage',
        fieldName + 'requiredOTP',
        fieldName + 'tagsLabelName',
        'ratingShape' + index,
        'ratingScale' + index,
        'sliderShape' + index,
        fieldName + 'commentBoxPlaceholder',
        fieldName + 'dtInputType',
        fieldName + 'textColor',
        fieldName + 'bgColor',
        fieldName + 'useGradient',
        fieldName + 'gradientStart',
        fieldName + 'gradientEnd',
        fieldName + 'bgImageUrl',
        fieldName + 'headerImageUrl'

    ]);
    const [ratingCol, setRatingCol] = useState(fieldSettings?.color ? fieldSettings?.color : '#3de177');

    const [sliderColorPicker, setSliderColorPicker] = useState({
        firstCol: fieldSettings?.firstColor,
        secondCol: fieldSettings?.secondColor,
        thumbCol: fieldSettings?.thumbColor,
        // ratingCol: '#3de177',
    });


    // Initialize popup draft values when opened (do not mutate committed settings)
    useEffect(() => {
        if (show && type === 'slider') {
            setValue('sliderShape' + index, fieldSettings?.shape || 'Round');
        }
        if (show && type === 'datetime') {
            const committedType = getValues(fieldName + 'dtInputType');
            const effectiveType = committedType || fieldSettings?.dtInputType || 'D';
            setValue(draftFieldName + 'dtInputType', effectiveType);
            const committedPlaceholder = getValues(fieldName + 'placeholder');
            const defaultPlaceholder =
                effectiveType === 'DT'
                    ? 'Select the date & time'
                    : effectiveType === 'T'
                        ? 'Select the time'
                        : 'Select the date';
            setValue(
                draftFieldName + 'placeholder',
                committedPlaceholder || fieldSettings?.placeholder || defaultPlaceholder
            );
            // propagate custom error to draft as well
            const committedCustomErr = getValues(fieldName + 'customErrorMessage');
            setValue(draftFieldName + 'customErrorMessage', committedCustomErr || fieldSettings?.customErrorMsg || '');
            // sync draft dtSelection string for the dropdown
            const draftSelectionString = effectiveType === 'DT' ? 'Date and Time' : effectiveType === 'T' ? 'Time' : 'Date';
            setValue(draftFieldName + 'dtSelection', draftSelectionString, { shouldValidate: false, shouldDirty: false });
        }
        if (show && type === 'customHeader') {
            // Initialize headerImageUrl inputUrl if there's a saved URL string
            const savedHeaderImageUrl = getValues(fieldName + 'headerImageUrl');
            const currentInputUrl = getValues(fieldName + 'headerImageUrl.inputUrl');
            
            // Only initialize if inputUrl is not already set (to avoid overwriting user input)
            if (!currentInputUrl) {
                if (savedHeaderImageUrl && typeof savedHeaderImageUrl === 'string') {
                    // If it's a string URL (not an object from file upload), populate the inputUrl field
                    setValue(fieldName + 'headerImageUrl.inputUrl', savedHeaderImageUrl, { shouldValidate: false, shouldDirty: false });
                } else if (savedHeaderImageUrl && typeof savedHeaderImageUrl === 'object' && savedHeaderImageUrl?.inputUrl) {
                    // If it's an object with inputUrl property, restore that
                    setValue(fieldName + 'headerImageUrl.inputUrl', savedHeaderImageUrl.inputUrl, { shouldValidate: false, shouldDirty: false });
                }
            }
        }
    }, [show, type, fieldSettings, index, setValue, getValues, fieldName]);

    const onSave = (event) => {
        event.preventDefault();
        switch (type) {
            case 'input':
                setFieldSettings({
                    placeholder: placeholder,
                    maxLength: maxLength,
                    validationType: validationType,
                    customErrorMsg: customErrorMsg,
                    requiredOTP: requiredOTP
                })
                break;
            case 'Tag':
                setFieldSettings({
                    placeholder: tagsLabelName,
                    optionData: tagValue,
                })
                break;
            case 'CommentBox':
                setFieldSettings({
                    ddlValue: selectedValue,
                    placeholder: commentBoxPlaceholder
                })
                break;
            case 'multiChoice':
                setFieldSettings({
                    checked: checkBoxStatus
                })
                break;
            case 'rating':
                setFieldSettings({
                    color: ratingCol !== undefined ? ratingCol : '#3de177',
                    shape: getValues('ratingShape' + index) || 'Star',
                    scale: getValues('ratingScale' + index) || 5,
                });
                break;
            case 'slider':
                setFieldSettings({
                    shape: getValues('sliderShape' + index) || 'Round',
                    thumbColor: sliderColorPicker.thumbCol || '#3bbf10',
                    firstColor: sliderColorPicker.firstCol || '#5acb35',
                    secondColor: sliderColorPicker.secondCol || '#cd0c15',
                });
                break;
            case 'datetime': {
                const draftType = getValues(draftFieldName + 'dtInputType') || 'D';
                const draftPlaceholder = getValues(draftFieldName + 'placeholder') ||
                    (draftType === 'DT'
                        ? 'Select the date & time'
                        : draftType === 'T'
                            ? 'Select the time'
                            : 'Select the date');
                const draftCustomErr = getValues(draftFieldName + 'customErrorMessage') || '';

                // Commit to settings
                setValue(fieldName + 'dtInputType', draftType, { shouldValidate: true, shouldDirty: true });
                setValue(fieldName + 'placeholder', draftPlaceholder, { shouldValidate: true, shouldDirty: true });
                setValue(fieldName + 'customErrorMessage', draftCustomErr, { shouldValidate: true, shouldDirty: true });
                // Maintain dtSelection string for consumers relying on it
                const selectionString = draftType === 'DT' ? 'DateTime' : draftType === 'T' ? 'Time' : 'Date';
                setValue(fieldName + 'dtSelection', selectionString, { shouldValidate: false, shouldDirty: true });

                // Also update local fieldSettings for future openings
                setFieldSettings({
                    placeholder: draftPlaceholder,
                    customErrorMsg: draftCustomErr,
                    dtInputType: draftType,
                });
                break;
            }
            case 'customHeader': {
                // Values are bound directly to form via inputs/color pickers
                // Ensure defaults if unset
                setValue(fieldName + 'textColor', textColor || '#000000', { shouldValidate: true, shouldDirty: true });
                setValue(fieldName + 'bgColor', bgColor || 'transparent', { shouldValidate: true, shouldDirty: true });
                setValue(fieldName + 'useGradient', !!useGradient, { shouldValidate: false, shouldDirty: true });
                setValue(fieldName + 'gradientStart', gradientStart || (bgColor || 'transparent'), { shouldValidate: false, shouldDirty: true });
                setValue(fieldName + 'gradientEnd', gradientEnd || (bgColor || 'transparent'), { shouldValidate: false, shouldDirty: true });
                setValue(fieldName + 'bgImageUrl', bgImageUrl || '', { shouldValidate: false, shouldDirty: true });
                
                // Handle headerImageUrl: preserve uploaded object or save URL string from inputUrl
                const inputUrlValue = getValues(fieldName + 'headerImageUrl.inputUrl');
                if (inputUrlValue && typeof inputUrlValue === 'string' && inputUrlValue.trim()) {
                    // If there's a URL in the inputUrl field, save it
                    setValue(fieldName + 'headerImageUrl', inputUrlValue, { shouldValidate: true, shouldDirty: true });
                } else if (!headerImageUrl) {
                    // If no URL and no uploaded image, clear it
                    setValue(fieldName + 'headerImageUrl', '', { shouldValidate: false, shouldDirty: true });
                } else {
                    // Preserve existing headerImageUrl (could be object from upload or string)
                    setValue(fieldName + 'headerImageUrl', headerImageUrl, { shouldValidate: false, shouldDirty: true });
                }
                break;
            }
            default:
                break;
        }
        setSettingsPopup(false);
    };
    const handleClear = () => {
        switch (type) {
            case 'input':
                setValue(fieldName + 'placeholder', fieldSettings?.placeholder)
                setValue(fieldName + 'maxLength', fieldSettings?.maxLength)
                setValue(fieldName + 'validationType', fieldSettings?.validationType)
                setValue(fieldName + 'customErrorMessage', fieldSettings?.customErrorMsg)
                setValue(fieldName + 'requiredOTP', fieldSettings?.requiredOTP)

                break;
            case 'Tag':
                setValue(fieldName + 'tagsLabelName', fieldSettings?.placeholder)
                break;
            case 'multiChoice':
                setValue(fieldName + 'isChecked', fieldSettings?.checked)
                break;
            case 'CommentBox':
                setValue('commentBox' + index, fieldSettings?.selectedValue)
                setValue(fieldName + 'commentBoxPlaceholder', fieldSettings?.placeholder)
                break;
            case 'rating':
                setValue('ratingShape' + index, fieldSettings?.shape)
                setValue('ratingScale' + index, fieldSettings?.scale)
                setRatingCol(fieldSettings?.color)
                break;
            case 'slider':
                setValue('sliderShape' + index, fieldSettings?.shape)
                setSliderColorPicker({
                    firstCol: fieldSettings?.firstColor,
                    secondCol: fieldSettings?.secondColor,
                    thumbCol: fieldSettings?.thumbColor,
                })
                break;
            case 'datetime':
                {
                    const committedType = getValues(fieldName + 'dtInputType') || fieldSettings?.dtInputType || 'D';
                    setValue(draftFieldName + 'dtInputType', committedType, { shouldValidate: false, shouldDirty: false });
                    const committedPlaceholder = getValues(fieldName + 'placeholder') || fieldSettings?.placeholder || '';
                    setValue(draftFieldName + 'placeholder', committedPlaceholder, { shouldValidate: false, shouldDirty: false });
                    const committedCustomErr = getValues(fieldName + 'customErrorMessage') || fieldSettings?.customErrorMsg || '';
                    setValue(draftFieldName + 'customErrorMessage', committedCustomErr, { shouldValidate: false, shouldDirty: false });
                    const selectionString = committedType === 'DT' ? 'Date and Time' : committedType === 'T' ? 'Time' : 'Date';
                    setValue(draftFieldName + 'dtSelection', selectionString, { shouldValidate: false, shouldDirty: false });
                }
                break;
            case 'customHeader':
                // No local fieldSettings; leave current values untouched
                break;
        }
    }

    const platform = useMemo(() => {
        const p = navigator.platform.toLowerCase();
        if (p.includes('mac')) return 'platform-mac';
        if (p.includes('win')) return 'platform-win';
        if (p.includes('linux')) return 'platform-linux';
        return 'platform-other';
    }, []);

    return (
        <RSModal
            show={show}
            size={elementType !== 'slider' && elementType !== 'multichoice' && elementType !== 'matrix' ? 'None' : 'lg'}
            header={header}
            isCloseButton={true}
            handleClose={() => {
                onHide()
                handleClear()
            }}
            className='formBuilder'
            body={
                <div className={`rs-form-builder-settings-popup ${platform}`}>
                    {(() => {
                        switch (type) {
                            case 'input':
                                return (
                                    <InputFields
                                        elementType={elementType}
                                        control={control}
                                        setInputField={setInputField}
                                        inputField={inputField}
                                        fieldName={fieldName}
                                        isEmail={isEmail}
                                        fieldSettings={fieldSettings}
                                    />
                                );
                            case 'datetime':
                                return (
                                    <div className="form-group mb0 mt20">
                                        <InputFields
                                            elementType={elementType}
                                            control={control}
                                            setInputField={setInputField}
                                            inputField={inputField}
                                            fieldName={draftFieldName}
                                        />

                                    </div>
                                );
                            case 'Tag':
                                return (
                                    <TagFields
                                        elementType={elementType}
                                        fieldName={fieldName}
                                        tagValue={tagValue}
                                        control={control}
                                        setTagValue={setTagValue}
                                        errorMessage={errorMessage()}
                                        isRefreshTooltip={isRadioCheckbox ? CLEAR_ALL_LABELS : CLEAR_ALL_TAGS}
                                    />
                                );
                            case 'CommentBox':
                                return (
                                    <div className="form-group mb0 mt20">
                                        <Row>
                                            <Col sm={{ span: 10, offset: 1 }}>
                                                <RSKendoDropDownList
                                                    name={'commentBox' + index}
                                                    data={COMMENT_LIST}
                                                    control={control}
                                                    label={TYPE}
                                                    defaultValue={fieldSettings?.ddlValue}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mt30">
                                            <Col sm={{ span: 10, offset: 1 }}>
                                                <RSInput
                                                    control={control}
                                                    name={fieldName + 'commentBoxPlaceholder'}
                                                    placeholder={'Placeholder text'}
                                                    label={'Placeholder'}
                                                    maxLength={50}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                );
                            case 'multiChoice':
                                return (
                                    <Row>
                                        <RSCheckbox
                                            className="smaller"
                                            name={fieldName + 'isChecked'}
                                            control={control}
                                            defaultValue={fieldSettings?.checked}
                                            labelName={ALLOW_MORE}
                                        />
                                    </Row>
                                );
                            case 'rating':
                                return (
                                    <RatingFields
                                        index={index}
                                        control={control}
                                        setRatingCol={setRatingCol}
                                        ratingCol={ratingCol}
                                        fieldSettings={fieldSettings}
                                    />
                                );
                            case 'slider':
                                return (
                                    <SliderFields
                                        index={index}
                                        control={control}
                                        setSliderColorPicker={setSliderColorPicker}
                                        sliderColorPicker={sliderColorPicker}
                                        fieldSettings={fieldSettings}
                                    />
                                );
                            case 'customHeader':
                                return (
                                    <div className="form-group mb0 mt20">
                                        <div className='form-group'>
                                            <Row>
                                                <Col sm={5}>
                                                    <label className='control-label-left'>
                                                        Background color
                                                    </label>
                                                </Col>
                                                <Col sm={7}>
                                                    <RSColorPickerInput
                                                        name={fieldName + 'bgColor'}
                                                        control={control}
                                                        defaultValue={bgColor || 'transparent'}
                                                        placeholder="Background color"
                                                        onSelect={(color) => setValue(fieldName + 'bgColor', color)}
                                                        colorPickerIcon={COLOR_PICKER}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className='form-group'>
                                            <Row >
                                                <Col sm={{ span: 3, offset: 0 }}>
                                                    <label>Gradient</label>
                                                </Col>
                                                <Col sm={{ span: 2, offset: 0 }}>
                                                    <RSSwitch
                                                        className="smaller"
                                                        name={fieldName + 'useGradient'}
                                                        control={control}
                                                        defaultValue={useGradient || false}
                                                    />
                                                </Col>
                                                <Col sm={{ span: 7, offset: 0 }}>
                                                    {useGradient && (
                                                        <Row>
                                                            <Col sm={6}>
                                                                {/* <label className='control-label-left'>
                                                                    Start
                                                                </label> */}
                                                                <RSColorPickerInput
                                                                    name={fieldName + 'gradientStart'}
                                                                    control={control}
                                                                    defaultValue={gradientStart || bgColor || 'transparent'}
                                                                    placeholder="Start"
                                                                    onSelect={(color) => setValue(fieldName + 'gradientStart', color)}
                                                                    colorPickerIcon={COLOR_PICKER}
                                                                />
                                                            </Col>
                                                            <Col sm={6}>
                                                                {/* <label className='control-label-left'>
                                                                    End
                                                                </label> */}
                                                                <RSColorPickerInput
                                                                    name={fieldName + 'gradientEnd'}
                                                                    control={control}
                                                                    defaultValue={gradientEnd || bgColor || 'transparent'}
                                                                    placeholder="End"
                                                                    onSelect={(color) => setValue(fieldName + 'gradientEnd', color)}
                                                                    colorPickerIcon={COLOR_PICKER}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    )}</Col>
                                            </Row>
                                        </div>
                                        <div className='form-group mb0'>
                                            <ImageUpload
                                                fieldName={fieldName + 'headerImageUrl'}
                                                inputId="headerDragDropFileInput"
                                                control={control}
                                            />
                                        </div>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })()}
                </div>
            }
            footer={
                <div className="m0">
                    <RSSecondaryButton onClick={() => {
                        onHide()
                        handleClear()
                    }}> {CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton onClick={onSave} className={isRadioTag || isCheckTag ? 'click-off' : ''}>{OK}</RSPrimaryButton>
                </div>
            }
        />
    );
};

export default memo(SettingsPopup);
