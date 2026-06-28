import { formatName } from 'Utils/modules/formatters';
import { SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import _find from 'lodash/find';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

import { SETTINGS_ICON, ASTERISK_ICON, BODYCONFIG, mapToItemRender, handleAttributeDuplicates } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import SettingsPopup from './SettingsPopup';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';



const CheckBox = ({
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
    const [checkBoxSettings, setCheckBoxSettings] = useState({
        optionData: optionData,
    });
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
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
        const optionList = getValues(`formGenerator[${index}].checkboxOptionData`);
        if (optionList) {
            setCheckBoxSettings({
                optionData: optionList,
            });
        } else {
            isQrPreview &&
                setCheckBoxSettings({
                    optionData: ['Option 1', 'Option 2', 'Option 3'],
                });
        }
    }, []);

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].checkboxOptionData`, checkBoxSettings?.optionData);
        }
    }, [checkBoxSettings?.optionData]);

    return (
        <div
            className={`${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'checkbox-required' : 'checkbox-optional'
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
                        <ul className="rs-list-inline click-off">
                            {checkBoxSettings?.optionData?.map((item, ind) => {
                                return (
                                    <li key={ind}>
                                        <RSCheckbox
                                            name={`formGenerator[${index}].checkBoxOptionOne[${ind}]`}
                                            className="smaller"
                                            control={control}
                                            labelName={item}
                                            // disabledchk={true}
                                            required={mandatoryValue}
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
                            <ul className="rs-list-inline rli-space-5 position-relative d-flex">
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
                                            header="Check box settings"
                                            setFieldSettings={setCheckBoxSettings}
                                            fieldSettings={checkBoxSettings}
                                            inputList={checkBoxSettings?.optionData}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'checkbox'}
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
                                popupSettings={{
                                    popupClass: `addImportAudienceDropdownListContainer`,
                                }}
                                // handleChange={handleChangeAtt}
                                footer={
                                    <NewAttributeFormBtn
                                        title="New attribute"
                                        handleModalAttribute={() => setNewAttributeFlag(true)}
                                    />
                                }
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                    validate: (value) => {
                                        return handleAttributeDuplicates(formGenerator, value);
                                    },
                                }}
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
                                setValue(`formGenerator[${index}].mapToValue`, currAttr)
                                clearErrors(`formGenerator[${index}].mapToValue`)
                            }
                        }
                    }}
                />
            )}
        </div>
    );
};

export default memo(CheckBox);
