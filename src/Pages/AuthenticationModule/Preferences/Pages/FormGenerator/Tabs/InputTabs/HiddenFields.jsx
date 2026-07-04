import { formatName } from 'Utils/modules/formatters';
import { MAP_TO, NEW_ATTRIBUTE, PLACEHOLDER_SETTINGS, SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { find as _find } from 'Utils/modules/lodashReplacements';

import RSInput from 'Components/FormFields/RSInput';


import { SETTINGS_ICON, BODYCONFIG, EYE_HIDDEND_ICON, mapToItemRender, handleAttributeDuplicates } from '../../constant';
import SettingsPopup from './SettingsPopup';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
import RSTooltip from 'Components/RSTooltip';

const HiddenFields = ({ index, labelName, placeHolder, mandatory, preview, mapTo, disabled }) => {
    const { control, setValue, watch, getValues, setError,clearErrors } = useFormContext();
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [hiddenFieldSettings, setHiddenFieldSettings] = useState({
        placeholder: placeHolder,
    });

    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);

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
        //  else {
        //     if (value?.attributeName === 'New attributes') {
        //         setNewAttributeFlag(true);
        //     }
        // }
    };
    return (
        <div className={`Hiddenfields ${preview ? 'fbc-preview' : 'form-builder-component'}`}>
            <div className="rs-form-element-wrapper">
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label `}>
                        <RSEditorPopup
                            name={`formGenerator[${index}].tinyMceLable`}
                            control={control}
                            initialValue={labelName}
                            init={BODYCONFIG}
                            disabled={preview}
                            handleChange={(e) => {
                                                                clearErrors(`formGenerator[${index}].tinyMceLable`);
                            }}
                        />
                    </div>
                    <div className={`rsfch-content `}>
                        <RSInput
                            control={control}
                            name={`formGenerator[${index}].inputPlaceHolder`}
                            placeholder={hiddenFieldSettings?.placeholder}
                            disabled={true}
                            onKeyPress={(e) => {
                                preview && e.preventDefault();
                            }}
                        />
                    </div>
                </div>
                {!preview && (
                    <div className="rs-form-properties-holder">
                        <div className="rsfph-icons">
                            <ul className="rs-list-inline rli-space-5 position-relative">
                                <li>
                                    <i
                                        name={`formGenerator[${index}].mandatory`}
                                        className={`${EYE_HIDDEND_ICON} color-secondary-grey top4`}
                                    ></i>{' '}
                                </li>
                                <li>
                                    <RSTooltip position="top" text={SETTINGS} className="lh0">
                                    <i
                                        className={`${SETTINGS_ICON} icon-md color-primary-blue position-relative bottom3`}
                                        onClick={() => setSettingsPopup(true)}
                                    ></i></RSTooltip>
                                    {settingsPopup && (
                                        <SettingsPopup
                                            show={settingsPopup}
                                            onHide={() => setSettingsPopup(false)}
                                            type={'input'}
                                            header={PLACEHOLDER_SETTINGS}
                                            setFieldSettings={setHiddenFieldSettings}
                                            fieldSettings={hiddenFieldSettings}
                                            placeHolder={placeHolder}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'hiddenfield'}
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
                                 label={MAP_TO}
                                rules={{
                                    required: THIS_FIELD_IS_REQUIRED,
                                    validate: (value) => {
                                        return handleAttributeDuplicates(formGenerator, value);
                                    },
                                }}
                                popupSettings={{
                                    popupClass: `addImportAudienceDropdownListContainer`,
                                }}
                                // handleChange={handleChangeAtt}
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
                            if(attrs?.status) {
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

export default memo(HiddenFields);
