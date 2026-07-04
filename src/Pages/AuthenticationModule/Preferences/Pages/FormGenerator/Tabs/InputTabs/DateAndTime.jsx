import { formatName } from 'Utils/modules/formatters';
import { MAP_TO, NEW_ATTRIBUTE, PLACEHOLDER_SETTINGS, SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { find as _find } from 'Utils/modules/lodashReplacements';



import { SETTINGS_ICON, ASTERISK_ICON, BODYCONFIG, mapToItemRender, handleAttributeDuplicates } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSTimePicker from 'Components/FormFields/RSTimePicker';
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

const DateAndTime = ({ index, labelName, placeHolder, mandatory, preview, mapTo, disabled, isQrPreview }) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [settingsPopup, setSettingsPopup] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const isEdit = watch('isEdit');
    const { tag } = useContext(FormGeneratorContext);
    const [placeholderSettings, setPlaceholderSettings] = useState({
        placeholder: placeHolder,
        customErrorMsg: '',
    });
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

    const watcher = useWatch({ control, name: `formGenerator[${index}]` });
    const settings = isQrPreview ? false : watcher.settings;

    return (
        <div
            className={`${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'datetime-required' : 'datetime-optional'
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
                        {(() => {
                            const dtType = settings?.dtSelection || 'Date';
                            const pickerPlaceholder =
                                settings?.placeholder ||
                                (dtType === 'DateTime'
                                    ? 'Select the date & time'
                                    : dtType === 'Time'
                                        ? 'Select the time'
                                        : 'Select the date');
                            if (dtType === 'DateTime') {
                                return (
                                    <RSDatetimePicker
                                        control={control}
                                        name={`formGenerator[${index}].dateAndTime`}
                                        placeholder={pickerPlaceholder}
                                        value={null}
                                        required={mandatoryValue}
                                        // rules={{
                                        //     required: mandatoryValue
                                        //         ? settings?.customErrorMessage || THIS_FIELD_IS_REQUIRED
                                        //         : false,
                                        // }}
                                        steps={{
                                            minute: 5,
                                            second: 10,
                                        }}
                                        disabled={true}
                                    />
                                );
                            }
                            if (dtType === 'Time') {
                                return (
                                    <RSTimePicker
                                        control={control}
                                        name={`formGenerator[${index}].dateAndTime`}
                                        placeholder={pickerPlaceholder}
                                        value={null}
                                        required={mandatoryValue}
                                        // rules={{
                                        //     required: mandatoryValue
                                        //         ? settings?.customErrorMessage || THIS_FIELD_IS_REQUIRED
                                        //         : false,
                                        // }}

                                        disabled={true}
                                    />
                                );
                            }
                            return (
                                <RSDatePicker
                                    control={control}
                                    name={`formGenerator[${index}].dateAndTime`}
                                    placeholder={pickerPlaceholder}
                                    value={null}
                                    required={mandatoryValue}
                                    // rules={{
                                    //     required: mandatoryValue
                                    //         ? settings?.customErrorMessage || THIS_FIELD_IS_REQUIRED
                                    //         : false,
                                    // }}
                                    disabled={true}
                                />
                            );
                        })()}
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
                                            type={'datetime'}
                                            header={PLACEHOLDER_SETTINGS}
                                            setFieldSettings={setPlaceholderSettings}
                                            fieldSettings={placeholderSettings}
                                            placeHolder={placeHolder}
                                            control={control}
                                            index={index}
                                            elementType={'datetime'}
                                            setSettingsPopup={setSettingsPopup}
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

export default memo(DateAndTime);
