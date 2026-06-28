import { onKeyChar, onlyNumbers } from 'Utils/modules/inputValidators';
import { formatName } from 'Utils/modules/formatters';
import { MAKE_DEFAULT, MAP_TO, NEW_ATTRIBUTE, SET_MANDATORY, SETTINGS, TEXT_FIELD_SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';

import _find from 'lodash/find';

import { ASTERISK_ICON, BODYCONFIG, mapToItemRender, SETTINGS_ICON_MD, handleAttributeDuplicates } from '../../constant';
import SettingsPopup from './SettingsPopup';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getAttribute } from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/constant';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { saveDataAttribute, getDataAttributes } from 'Reducers/preferences/datacatalogue/request';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
const TextBox = ({
    index,
    labelName,
    placeHolder,
    preview,
    mandatory,
    mapTo,
    disabled,
    type,
    validateDefault,
    init,
    isQrPreview = false,
    isMobileNumber = false
}) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    // const { formState } = useContext(FormGeneratorContext);
    let { formState } = isQrPreview ? '' : useContext(FormGeneratorContext);
    const allValues = getValues()
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [settingsPopup, setSettingsPopup] = useState(false);
    // const [defaultModal, setDefaultModal] = useState(false);
    const [textFieldSettings, setTextFieldSettings] = useState({
        placeholder: placeHolder,
        maxLength: 50,
        validationType: '',
        customErrorMsg: '',
        requiredOTP: false,
    });
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const watcher = useWatch({ control, name: `formGenerator[${index}]` });

    const [formGenerator] = watch([`formGenerator`]);
    // console.log('watcher: ', formGenerator);
    const settings = watcher?.settings;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const handlePlaceholderType = (e) => {
        if (textFieldSettings?.validationType === 'Text only') return onKeyChar(e);
        if (textFieldSettings?.validationType === 'Number only') return onlyNumbers(e);
    };

    useEffect(() => {
        const placeHolder = getValues(`formGenerator[${index}].textBoxPlaceHolder`);
        if (placeHolder) {
            setTextFieldSettings((prev) => ({
                ...prev,
                placeholder: placeHolder,
                customErrorMsg: `${watcher?.tinyMceLable} is required`
            }));
        }
    }, []);

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].textBoxPlaceHolder`, textFieldSettings?.placeholder);
        }
    }, [textFieldSettings?.placeholder]);

    const handleChangeAtt = ({ target: { value } }) => {
        let tempMapValue = formGenerator?.map((e) => {
            return e.mapToValue?.attributeName || '';
        });

        if (tempMapValue?.includes(value.attributeName)) {
            setTimeout(() => {
                setError(`formGenerator[${index}].mapToValue`, {
                    type: 'custom',
                    message: `Duplicate attribute`,
                });
            }, 100);
        }
        //  else {
        //     if (value?.attributeName === 'New attributes') {
        //         setNewAttributeFlag(true);
        //     }
        // }
    };

    // const validateDefault = (status) => {
    //     let result = [];
    //     for (var i = 0; i < formGenerator?.length; i++) {
    //         if (formGenerator[i]?.mapToValue?.attributeName === 'EmailID') {
    //             result.push(formGenerator[i]?.makeDefault);
    //         }
    //         if (formGenerator[i]?.mapToValue?.attributeName === 'MobileNo') {
    //             result.push(formGenerator[i]?.makeDefault);
    //         }
    //     }
    //     if (!result?.[0] && !result?.[1]) {
    //         setDefaultModal(true);
    //     }
    // };
    return (
        <div
            className={`${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'textbox-required' : 'textbox-optional'
                }`}
        >
            <div className="rs-form-element-wrapper">
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label `}>
                        <RSEditorPopup
                            name={`formGenerator[${index}].tinyMceLable`}
                            control={control}
                            initialValue={labelName}
                            init={BODYCONFIG}
                            disabled={preview}
                            required
                            minChars={formState?.tag === 'Survey' ? 3 : 3}
                            maxChars={120}
                            rules={{
                                required: THIS_FIELD_IS_REQUIRED,
                            }}
                            handleChange={(e) => {
                                clearErrors(`formGenerator[${index}].tinyMceLable`);
                            }}
                        />
                        {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                    </div>
                    <div className={`${!isQrPreview && formState?.profilingToggle && type === 'default' && preview ? 'rsfch-content d-flex justify-content-between gap-5' : preview ? ' rsfch-content' : 'rsfch-content'}`}>
                        <RSInput
                            control={control}
                            name={`formGenerator[${index}].inputPlaceHolder`}
                            placeholder={textFieldSettings?.placeholder}
                            required={mandatoryValue}
                            rules={
                                {
                                    // required: mandatoryValue
                                    //     ? settings?.customErrorMessage || THIS_FIELD_IS_REQUIRED
                                    //     : false,
                                }
                            }
                            className={'form-control'}
                            maxLength={textFieldSettings?.maxLength || 50}
                            onKeyPress={(e) => {
                                preview && e.preventDefault();
                            }}
                            onKeyDown={(e) => handlePlaceholderType(e)}
                            handleChange={(e) => {
                                clearErrors(`formGenerator[${index}].tinyMceLable`);
                            }}
                            disabled={true}
                        />
                        {!isQrPreview && formState?.profilingToggle && type === 'default' && preview && (
                            <div className={` ${preview ? 'd-flex' : allValues?.formStyles?.formLayout === 'vertical' ? 'mb59' : 'mt10'}`}>
                                <RSCheckbox
                                    control={control}
                                    name={`formGenerator[${index}].makeDefault`}
                                    labelName={MAKE_DEFAULT}
                                    defaultValue={true}
                                    handleChange={(e) => {
                                        // console.log('ASD', e, formGenerator[index]?.mapToValue?.attributeName);
                                        if (formGenerator[index]?.mapToValue?.attributeName === 'EmailID') {
                                            setValue('defaultTypes.EmailID', e?.target?.checked);
                                            let res = validateDefault(e?.target?.checked, 'EmailID');
                                            setValue(`formGenerator[${index}].makeDefault`, res);
                                        }
                                    }}
                                />
                                {/* <MakeDefaultModal
                            show={defaultModal}
                            handleClose={() => {
                                if (formGenerator[index]?.mapToValue?.atrributeName === 'EmailID') {
                                    setValue(`formGenerator[${index}].makeDefault`, true);
                                }
                                setDefaultModal(false);
                            }}
                        /> */}
                            </div>
                        )}
                    </div>
                </div>
                {!preview && (
                    <div className="rs-form-properties-holder">
                        <div className="rsfph-icons">
                            <ul className="rs-list-inline rli-space-5 position-relative">
                                <li>
                                    <RSTooltip position="top" text={SET_MANDATORY} className="lh0">
                                        <i
                                            name={`formGenerator[${index}].mandatory`}
                                            className={
                                                mandatoryValue
                                                    ? `${ASTERISK_ICON} color-primary-red`
                                                    : `${ASTERISK_ICON} color-secondary-grey`
                                            }
                                            onClick={() => {
                                                setMandatoryValue(!mandatoryValue);
                                                setValue(`formGenerator[${index}].mandatory`, !mandatoryValue);
                                            }}
                                        ></i>
                                    </RSTooltip>
                                </li>
                                <li>
                                    <RSTooltip position="top" text={SETTINGS} className="lh0">
                                        <i
                                            className={`${SETTINGS_ICON_MD} icon-md color-primary-blue`}
                                            onClick={() => setSettingsPopup(true)}
                                        ></i>
                                    </RSTooltip>
                                    {settingsPopup && (
                                        <SettingsPopup
                                            show={settingsPopup}
                                            onHide={() => setSettingsPopup(false)}
                                            type={'input'}
                                            header={TEXT_FIELD_SETTINGS}
                                            setFieldSettings={setTextFieldSettings}
                                            fieldSettings={textFieldSettings}
                                            placeHolder={placeHolder}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={isMobileNumber ? 'mobileNumber' : 'textbox'}
                                            isEmail={formGenerator?.[index]?.mapToValue?.attributeName === 'EmailID'}
                                        />
                                    )}
                                </li>
                            </ul>
                        </div>
                        <div className="rsfph-map rs-kendo-dropdownmenu-wrapper">
                            {/* <RSKendoDropDownList
                                name={`formGenerator[${index}].mapToValue`}
                                data={mapTo}
                                isCustomRender
                                itemRender={(ele, props) => mapToItemRender(ele, props, disabled)}
                                control={control}
                                required
                                textField={'attributeName'}
                                dataItemKey={'dataAttributeId'}
                                label={'Map to'}
                                handleChange={handleChangeAtt}
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                }}
                            /> */}

                            <RSKendoDropDown
                                name={`formGenerator[${index}].mapToValue`}
                                data={mapTo}
                                isCustomRender
                                itemRender={(ele, props) => mapToItemRender(ele, props, disabled)}
                                control={control}
                                required
                                textField={'attributeName'}
                                dataItemKey={'dataAttributeId'}
                                label={MAP_TO}
                                // handleChange={handleChangeAtt}
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                    validate: (value) => {
                                        return handleAttributeDuplicates(formGenerator, value);
                                    },
                                }}
                                popupSettings={{
                                    popupClass: `addImportAudienceDropdownListContainer`,
                                }}
                                footer={
                                    <NewAttributeFormBtn
                                        title={NEW_ATTRIBUTE}
                                        handleModalAttribute={() => setNewAttributeFlag(true)}
                                    />
                                }
                            />
                        </div>
                    </div>
                )}
                {!isQrPreview && formState?.profilingToggle && type === 'default' && !preview && (
                    <div className={` ${preview ? 'd-flex' : allValues?.formStyles?.formLayout === 'vertical' ? 'mb59' : 'mt10'}`}>
                        <RSCheckbox
                            control={control}
                            name={`formGenerator[${index}].makeDefault`}
                            labelName={MAKE_DEFAULT}
                            defaultValue={true}
                            handleChange={(e) => {
                                // console.log('ASD', e, formGenerator[index]?.mapToValue?.attributeName);
                                if (formGenerator[index]?.mapToValue?.attributeName === 'EmailID') {
                                    setValue('defaultTypes.EmailID', e?.target?.checked);
                                    let res = validateDefault(e?.target?.checked, 'EmailID');
                                    setValue(`formGenerator[${index}].makeDefault`, res);
                                }
                            }}
                        />
                        {/* <MakeDefaultModal
                            show={defaultModal}
                            handleClose={() => {
                                if (formGenerator[index]?.mapToValue?.atrributeName === 'EmailID') {
                                    setValue(`formGenerator[${index}].makeDefault`, true);
                                }
                                setDefaultModal(false);
                            }}
                        /> */}
                    </div>
                )}
            </div>

            {newAttributeFlag && (
                <NewAttributeModal
                    show={newAttributeFlag}
                    handleClose={() => {
                        setNewAttributeFlag(false);
                    }}
                    catType={''}
                    addAudience={false}
                    handleSaveAttribute={async (data) => {
                        let res = await dispatch(saveDataAttribute(data, false));
                        if (res?.status) {
                            setNewAttributeFlag(false);
                            const payload = {
                                departmentId,
                                clientId,
                                userId,
                            };
                            let attrs = await dispatch(getDataAttributes(payload, true));
                            if (attrs?.status) {
                                const currAttr = _find(attrs?.data, (item) => formatName(item?.uIPrintableName) === formatName(data?.name));
                                setValue(`formGenerator[${index}].mapToValue`, getAttribute(currAttr))
                                clearErrors(`formGenerator[${index}].mapToValue`)
                            }
                        }
                    }}
                />
            )}
        </div>
    );
};

export default memo(TextBox);
