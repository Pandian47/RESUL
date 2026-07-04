import { formatName } from 'Utils/modules/formatters';
import { FORMS_COMBO_BOX, MAP_TO, SETTINGS, SET_MANDATORY } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { find as _find } from 'Utils/modules/lodashReplacements';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';


import { ASTERISK_ICON, BODYCONFIG, mapToItemRender, SETTINGS_ICON_MD, handleAttributeDuplicates } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import SettingsPopup from './SettingsPopup';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';

const ComboBox = ({ index, labelName, placeHolder, mandatory, preview, optionData, mapTo, disabled }) => {
    console.log('mapTomapTomapTo: ', mapTo);
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [comboBoxSettings, setComboBoxSettings] = useState({
        optionData: getValues(`formGenerator[${index}].dropdowns`) ? getValues(`formGenerator[${index}].dropdowns`) : optionData,
        placeholder: getValues(`formGenerator[${index}].placeHolder`) ? getValues(`formGenerator[${index}].placeHolder`) : placeHolder,
    });
    const [mandatoryValue, setMandatoryValue] = useState(getValues(`formGenerator[${index}].mandatory`) ? getValues(`formGenerator[${index}].mandatory`) : mandatory);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const { tag } = useContext(FormGeneratorContext);
    const settings = useWatch({ control, name: `formGenerator[${index}].settings` });

    useEffect(() => {
        if (preview) {
            const optionList = getValues(`formGenerator[${index}].dropdowns`);
            if (optionList)
                setComboBoxSettings((prev) => ({
                    ...prev,
                    optionData: optionList,
                }));
        }
    }, [preview, index, getValues]); // Added missing dependencies

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].dropdowns`, comboBoxSettings?.optionData);
            setValue(`formGenerator[${index}].placeHolder`, comboBoxSettings?.placeholder);
        }
    }, [comboBoxSettings, index, preview, setValue]); // Added missing dependencies and placeholder sync
    // const handleChangeAtt = (e) => {
    //     let {
    //         target: { value },
    //     } = e;

    //     if (value?.attributeName === 'New attributes') {
    //         setNewAttributeFlag(true);
    //     }
    // };
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

    return (
        <div
            className={`${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'combobox-required' : 'combobox-optional'
                }`}
        >
            <div className="rs-form-element-wrapper">
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label `}>
                        {/* <RSTinyMceInlineEditor
                            name={`formGenerator[${index}].tinyMceLable`}
                            control={control}
                            initialValue={labelName}
                            init={BODYCONFIG}
                            disabled={preview}
                            required
                            rules={{
                                required: THIS_FIELD_IS_REQUIRED,
                            }}
                        /> */}
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
                    <div className={`rsfch-content click-off `}>
                        <RSKendoDropDownList
                            name={`formGenerator[${index}].dropdown`}
                            data={comboBoxSettings?.optionData}
                            control={control}
                            label={comboBoxSettings?.placeholder || placeHolder}
                            required={mandatoryValue}
                        />
                    </div>
                </div>
                {!preview && (
                    <div className="rs-form-properties-holder">
                        <div className="rsfph-icons">
                            <ul className="rs-list-inline rli-space-5 position-relative ">
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
                                            type={'Tag'}
                                            header={FORMS_COMBO_BOX}
                                            setFieldSettings={setComboBoxSettings}
                                            fieldSettings={comboBoxSettings}
                                            inputList={comboBoxSettings?.optionData}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'combobox'}
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
                                        title="New attribute"
                                        handleModalAttribute={() => setNewAttributeFlag(true)}
                                    />
                                }
                            />
                        </div>
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

export default memo(ComboBox);
