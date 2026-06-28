import { formatName } from 'Utils/modules/formatters';
import { SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import _find from 'lodash/find';

import RSRadioButton from 'Components/FormFields/RSRadioButton';


import { SETTINGS_ICON, ASTERISK_ICON, BODYCONFIG, mapToItemRender, handleAttributeDuplicates } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import SettingsPopup from './SettingsPopup';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
const RadioButton = ({
    index,
    labelName,
    placeHolder,
    mandatory,
    preview,
    optionData,
    mapTo,
    disabled,
    isQrPreview = false,
}) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [radioButtonSettings, setRadioButtonSettings] = useState({
        optionData: optionData,
    });
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [formGenerator] = watch([`formGenerator`]);
    const { tag } = useContext(FormGeneratorContext);
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
    useEffect(() => {
        const optionList = getValues(`formGenerator[${index}].radioOptionsData`);
        if (optionList) {
            setRadioButtonSettings({
                optionData: optionList,
            });
        } else {
            isQrPreview &&
                setRadioButtonSettings({
                    optionData: ['Option 1', 'Option 2', 'Option 3'],
                });
        }
    }, []);

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].radioOptionsData`, radioButtonSettings?.optionData);
        }
    }, [radioButtonSettings?.optionData]);

    return (
        <div
            className={`${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'radio-required' : 'radio-optional'
                }`}
        >
            <div className="rs-form-element-wrapper radioButton">
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label `}>
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
                    <div className={`rsfch-content `}>
                        <ul className="rs-list-inline rli-space-5">
                            {radioButtonSettings?.optionData?.map((item, ind) => {
                                return (
                                    <li key={ind}>
                                        <RSRadioButton
                                            control={control}
                                            name={`formGenerator[${index}].radioButtonOption`}
                                            labelName={item}
                                            disabled={true}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
                {!preview && (
                    <div className="rs-form-properties-holder">
                        <div className="rsfph-icons">
                            <ul className="rs-list-inline rli-space-5 position-relative">
                                <li>
                                    <RSTooltip position="top" text="Set as mandatory">
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
                                            className={`${SETTINGS_ICON} icon-md color-primary-blue`}
                                            onClick={() => setSettingsPopup(true)}
                                        ></i></RSTooltip>
                                    {settingsPopup && (
                                        <SettingsPopup
                                            show={settingsPopup}
                                            onHide={() => setSettingsPopup(false)}
                                            type={'Tag'}
                                            header="Radio button settings"
                                            setFieldSettings={setRadioButtonSettings}
                                            fieldSettings={radioButtonSettings}
                                            inputList={radioButtonSettings?.optionData}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'radio'}
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
                                label={'Map to'}
                                // handleChange={handleChangeAtt}
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

export default memo(RadioButton);
