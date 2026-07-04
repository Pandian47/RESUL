import { formatName } from 'Utils/modules/formatters';
import { MAKE_DEFAULT, MAP_TO, NEW_ATTRIBUTE, PLACEHOLDER_SETTINGS, SETTINGS, SET_MANDATORY } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { find as _find } from 'Utils/modules/lodashReplacements';



import { ASTERISK_ICON, BODYCONFIG, mapToItemRender, SETTINGS_ICON_MD, handleAttributeDuplicates } from '../../constant';
import SettingsPopup from './SettingsPopup';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';

const PhoneInput = ({
    index,
    labelName,
    placeHolder,
    mandatory,
    preview,
    mapTo,
    disabled,
    type,
    validateDefault,
    isQrPreview = false,
    previewGridLayout = false,
}) => {
    let { formState, tag } = isQrPreview ? '' : useContext(FormGeneratorContext);
    // const [defaultModal, setDefaultModal] = useState(false);

    const {
        control,
        setValue,
        setError,
        clearErrors,
        getValues,
        watch,
        formState: { errors },
    } = useFormContext();
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [settingsPopup, setSettingsPopup] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const dispatch = useDispatch();
    const [placeholderSettings, setPlaceholderSettings] = useState({
        placeholder: placeHolder,
        requiredOTP: false,
    });
    useEffect(() => {
        if (preview) {
            const placeHolder = getValues(`formGenerator[${index}].phonePlaceholder`);
            if (placeHolder)
                setPlaceholderSettings({
                    placeHolder: placeHolder,
                });
        }
    }, []);

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].phonePlaceholder`, placeholderSettings?.placeholder);
        }
    }, [placeholderSettings?.placeholder]);
    const [formGenerator] = watch([`formGenerator`]);
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
        // else {
        //     if (value?.attributeName === 'New attributes') {
        //         setNewAttributeFlag(true);
        //     }
        // }
    };
    // const validateDefault = (status) => {
    //     let result = [];
    //     for (var i = 0; i < formGenerator?.length; i++) {
    //         debugger;
    //         if (formGenerator[i]?.mapToValue?.attributeName === 'EmailID') {
    //             result.push(formGenerator[i]?.makeDefault);
    //         }
    //         if (formGenerator[i]?.mapToValue?.attributeName === 'MobileNo') {
    //             result.push(formGenerator[i]?.makeDefault);
    //         }
    //     }
    //     console.log('result :::::::::::::::::: ', result, formGenerator);
    //     if (!result?.[0] && !result?.[1]) {
    //         setDefaultModal(true);
    //     }
    // };
    return (
        <div
            className={`${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'phoneinput-required' : 'phoneinput-optional'
                }`}
        >
            <div className="rs-form-element-wrapper">
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label`}>
                        <RSEditorPopup
                            name={`formGenerator[${index}].tinyMceLable`}
                            control={control}
                            initialValue={labelName}
                            init={BODYCONFIG}
                            disabled={preview}
                            required
                            minChars={tag === 'Survey' ? 3 : 3}
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
                    <div className={` ${!isQrPreview && formState?.profilingToggle && type === 'default' && preview ? ' rsfch-content d-flex justify-content-between gap-5' : preview ? ' rsfch-content' : 'rsfch-content'}`}>
                        <RSPhoneInput
                            control={control}
                            name={`formGenerator[${index}].mobile_number`}
                            label={placeholderSettings?.placeholder}
                            // enableSearch={true}
                            required={mandatoryValue}
                            setError={setError}
                            clearErrors={clearErrors}
                            disabled={true}
                        />
                        {formState?.profilingToggle && type === 'default' && preview && (
                            <div className={` ${preview ? 'd-flex' : ''}`}>
                                <RSCheckbox
                                    control={control}
                                    name={`formGenerator[${index}].makeDefault`}
                                    labelName={MAKE_DEFAULT}
                                    defaultValue={true}
                                    handleChange={(e) => {
                                        setValue('defaultTypes.MobileNO', e?.target?.checked);

                                        validateDefault(e?.target?.checked, 'MobileNO');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {!preview && (
                    <div className="rs-form-properties-holder">
                        <div className="rsfph-icons">
                            <ul className="rs-list-inline rli-space-5 position-relative">
                                <li>
                                    <RSTooltip position="top" text={SET_MANDATORY}>
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
                                        ></i></RSTooltip>
                                    {settingsPopup && (
                                        <SettingsPopup
                                            show={settingsPopup}
                                            onHide={() => setSettingsPopup(false)}
                                            type={'input'}
                                            header={PLACEHOLDER_SETTINGS}
                                            setFieldSettings={setPlaceholderSettings}
                                            fieldSettings={placeholderSettings}
                                            placeHolder={placeHolder}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'phone'}
                                        />
                                    )}
                                </li>
                            </ul>
                        </div>
                        <div className="rsfph-map">
                            <RSKendoDropDown
                                name={`formGenerator[${index}].mapToValue`}
                                data={mapTo}
                                isCustomRender
                                itemRender={(ele, props) => mapToItemRender(ele, props, disabled)}
                                control={control}
                                required
                                textField={'attributeName'}
                                dataItemKey={'dataAttributeId'}
                                // handleChange={handleChangeAtt}
                                label={MAP_TO}
                                popupSettings={{
                                    popupClass: `addImportAudienceDropdownListContainer`,
                                }}
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                    validate: (value) => {
                                        return handleAttributeDuplicates(formGenerator, value);
                                    },
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
                {formState?.profilingToggle && type === 'default' && !preview && (
                    <div className={` ${preview ? '' : ''}`}>
                        <RSCheckbox
                            control={control}
                            name={`formGenerator[${index}].makeDefault`}
                            labelName={MAKE_DEFAULT}
                            defaultValue={true}
                            handleChange={(e) => {
                                setValue('defaultTypes.MobileNO', e?.target?.checked);

                                validateDefault(e?.target?.checked, 'MobileNO');
                            }}
                        />
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
                                setValue(`formGenerator[${index}].mapToValue`, currAttr);
                                clearErrors(`formGenerator[${index}].mapToValue`);
                            }
                        }
                    }}
                />
            )}
        </div>
    );
};

export default memo(PhoneInput);
