import { formatName } from 'Utils/modules/formatters';
import { SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import _find from 'lodash/find';

import { useFormContext } from 'react-hook-form';


import { BODYCONFIG, ASTERISK_ICON, SETTINGS_ICON, RATING_LIST, mapToItemRender, handleAttributeDuplicates } from '../../constant';
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
const Rating = ({ index, labelName, placeHolder, mandatory, preview, mapTo, disabled, ratingsValue, init }) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const isEdit = watch('isEdit');
    const [ratingSettings, setRatingSettings] = useState({ shape: 'Star', scale: 5, color: '#3de177' });
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [rating, setRating] = useState(isEdit ? ratingsValue?.scale : 0);
    const [hover, setHover] = useState(0);
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
        //  else {
        //     if (value?.attributeName === 'New attributes') {
        //         setNewAttributeFlag(true);
        //     }
        // }
    };

    useEffect(() => {
        // Load rating settings for both preview and edit mode
        const optionList = getValues(`formGenerator[${index}].ratings`);
        if (optionList) {
            setRatingSettings(optionList);
            // Set the initial rating based on the scale
            if (optionList.scale) {
                setRating(optionList.scale);
            }
        }
    }, []);

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].ratings`, ratingSettings);
        }
        setValue(`formGenerator[${index}].ratingsValue`, { shape: ratingSettings?.shape || 'Star', scale: rating });
    }, [ratingSettings, rating]);

    return (
        <div
            className={` ${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'rating-required' : 'rating-optional'
                }`}
        >
            <div className={`rs-form-element-wrapper rsfch-multi-top `}>
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label ${preview ? '' : ''}`}>
                        <RSEditorPopup
                            name={`formGenerator[${index}].tinyMceLableMain`}
                            control={control}
                            initialValue={labelName}
                            init={BODYCONFIG}
                            disabled={preview}
                            required={mandatoryValue}
                            minChars={tag === 'Survey' ? 3 : 3}
                            maxChars={120}
                            rules={{
                                required: THIS_FIELD_IS_REQUIRED,
                            }}
                            handleChange={(e) => {
                                                                clearErrors(`formGenerator[${index}].tinyMceLableMain`);
                            }}
                        />
                        {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                    </div>
                    {preview && (
                        <div className={`mb0 rsfch-content  ratingbottom ${preview && getValues()?.isProgressiveProfiling ? '' : preview ? '' : 'mt20'}`}>
                            <i className="icon-md">
                                {RATING_LIST[ratingSettings?.scale][ratingSettings?.shape]?.map((itemValue, index) => {
                                    index += 1;
                                    return (
                                        <button
                                            type="button"
                                            key={index}
                                            name={`formGenerator.${index}.rating`}
                                            className={`starButton mr15`}
                                            onClick={() => {
                                                setRating(index);
                                                                                                setValue(`formGenerator[${index}].ratingsValue`, { shape: ratingSettings?.shape || 'Star', scale: index });
                                            }}
                                            onMouseEnter={() => setHover(index)}
                                            onMouseLeave={() => setHover(rating)}
                                        >
                                            <RSTooltip position="top" text={itemValue?.tooltip}>
                                                <i
                                                    style={{
                                                        color: index <= (hover || rating) ? ratingSettings?.color : '#ccc',
                                                    }}
                                                    className={`${itemValue?.icon} position-relative icon-lg`}
                                                ></i>
                                            </RSTooltip>
                                        </button>
                                    );
                                })}
                            </i>
                        </div>
                    )}
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
                                            fieldSettings={ratingSettings}
                                            setFieldSettings={setRatingSettings}
                                            header="Rating settings"
                                            type={'rating'}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'rating'}
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

            {!preview && (
                <div className={`mb0 rsfch-content  ratingbottom ${preview && getValues()?.isProgressiveProfiling ? '' : preview ? '' : 'mt20'}`}>
                    <i className="icon-md">
                        {RATING_LIST[ratingSettings?.scale][ratingSettings?.shape]?.map((itemValue, index) => {
                            index += 1;
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    name={`formGenerator.${index}.rating`}
                                    className={`starButton mr15`}
                                    onClick={() => {
                                        setRating(index);
                                                                                setValue(`formGenerator[${index}].ratingsValue`, { shape: ratingSettings?.shape || 'Star', scale: index });
                                    }}
                                    onMouseEnter={() => setHover(index)}
                                    onMouseLeave={() => setHover(rating)}
                                >
                                    <RSTooltip position="top" text={itemValue?.tooltip}>
                                        <i
                                            style={{
                                                color: index <= (hover || rating) ? ratingSettings?.color : '#ccc',
                                            }}
                                            className={`${itemValue?.icon} position-relative icon-lg`}
                                        ></i>
                                    </RSTooltip>
                                </button>
                            );
                        })}
                    </i>
                </div>
            )}
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

export default memo(Rating);
