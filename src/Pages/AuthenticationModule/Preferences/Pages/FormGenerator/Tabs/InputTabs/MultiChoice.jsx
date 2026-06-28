import { formatName } from 'Utils/modules/formatters';
import { SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_medium, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import _find from 'lodash/find';



import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSRadioButton from 'Components/FormFields/RSRadioButton';

import {
    BODYCONFIG,
    ASTERISK_ICON,
    SETTINGS_ICON,
    MULTI_CHOICE_VAL,
    handleAttributeDuplicates,
    mapToItemRender
} from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import SettingsPopup from './SettingsPopup';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
const MultiChoice = ({ index, labelName, mandatory, preview, mapTo, disabled, isQrPreview }) => {
    const { control, setValue, clearErrors, setError, watch, reset, getValues } = useFormContext();
    const allValues = getValues()

    const [label, setlabel] = useState(labelName);
    const [multiChoiceSettings, setMultiChoiceSettings] = useState({
        checked: true,
    });
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const [inputcheck, setInputcheck] = useState(false);
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
    const {
        fields: multiChoice,
        append,
        remove,
    } = useFieldArray({
        control,
        name: `formGenerator[${index}].multiChoice`,
    });

    const multiChoiceWatch = useWatch({
        control,
        name: `formGenerator[${index}].multiChoice`,
    });

    useEffect(() => {
        if (!multiChoice?.length) {
            setValue(`formGenerator[${index}].multiChoice`, MULTI_CHOICE_VAL);
        }
        if (!preview) {
            setValue(`formGenerator[${index}].radio`, '');
            const currentIsChecked = getValues(`formGenerator[${index}].settings.isChecked`);
            if (currentIsChecked === undefined) {
                setValue(`formGenerator[${index}].settings.isChecked`, true);
            }
        }
        setMultiChoiceSettings({
            checked: getValues(`formGenerator[${index}].settings.isChecked`) ?? true,
        });
    }, []);

    const watcher = useWatch({ control, name: `formGenerator[${index}]` });
    const settings = isQrPreview ? false : watcher.settings;
    const isChecked = settings?.isChecked ?? multiChoiceSettings?.checked ?? true;

    useEffect(() => {
        const input = document.getElementsByClassName('multichoiceoption')[0];
        if (input && input.value === '') {
            setInputcheck(true);
        } else {
            setInputcheck(false);
        }
    }, [multiChoice]);

    return (
        <div
            className={`${preview && inputcheck ? 'd-none' : ''}  ${preview ? 'fbc-preview' : 'form-builder-component'
                } ${mandatoryValue ? 'multichoice-required' : 'multichoice-optional'}`}
        >
            <div className={`rs-form-element-wrapper rsfch-multi-top ${preview ? 'rsfch-multi-top-preview' : ''}`}>
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label ${preview ? '' : ''}`}>
                        <RSEditorPopup
                            name={`formGenerator[${index}].tinyMceLableMain`}
                            control={control}
                            initialValue={label}
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
                    {preview && (
                        <div className='w-100  '>
                            <ul className={` ${allValues?.formStyles?.formLayout === 'horizontal' || allValues?.formStyles?.formLayout === 'noLabels' ? 'rs-list-inline rli-space-5' : ''}`}>
                                {multiChoice.map((item, ind) => {
                                    return (
                                        <li className={`${allValues?.formStyles?.formLayout === 'horizontal'? '' : 'mb10'}`} key={item?.id}>
                                            <div className={`d-flex`}>
                                                {isChecked ? (
                                                    <RSCheckbox
                                                        className="smaller"
                                                        name={`formGenerator[${index}].multiChoice[${ind}].checked`}
                                                        control={control}
                                                        labelClass="mr0"
                                                        disabled={true}
                                                    />
                                                ) : (
                                                    <RSRadioButton
                                                        control={control}
                                                        name={`formGenerator[${index}].multiChoice[${ind}].radio`}
                                                        isLabel={false}
                                                        disabled={true}
                                                    />
                                                )}
                                                {preview ? (
                                                    <div
                                                        className={'multichoiceoption'}
                                                        title={multiChoiceWatch?.[ind]?.answer || ''}
                                                        style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                                                    >
                                                        {multiChoiceWatch?.[ind]?.answer || ''}
                                                    </div>
                                                ) : (
                                                    <RSInput
                                                        control={control}
                                                        name={`formGenerator[${index}].multiChoice[${ind}].answer`}
                                                        placeholder={'Answer choice'}
                                                        className={'multichoiceoption'}
                                                        handleOnBlur={({ target: { value } }) => {
                                                            if (value === '') {
                                                                setError(`formGenerator[${index}].multiChoice[${ind}].answer`, {
                                                                    type: 'custom',
                                                                    message: `Enter answer`,
                                                                });
                                                            } else {
                                                                let findInd = multiChoiceWatch.map((e) => e.answer);
                                                                const duplicates = findInd.filter(
                                                                    (item, index) => findInd.indexOf(item) !== index,
                                                                );
                                                                // const duplicates = watcher.answer.filter(
                                                                //     (item, index) => watcher.answer.indexOf(item) !== index,
                                                                // );

                                                                if (duplicates?.length > 0) {
                                                                    setError(`formGenerator[${index}].multiChoice[${ind}].answer`, {
                                                                        type: 'custom',
                                                                        message: `Enter new answer`,
                                                                    });
                                                                } else
                                                                    clearErrors(`formGenerator[${index}].multiChoice[${ind}].answer`);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}</ul>
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
                                            onClick={() => {
                                                setMultiChoiceSettings({
                                                    checked: getValues(`formGenerator[${index}].settings.isChecked`) ?? true,
                                                });
                                                setSettingsPopup(true);
                                            }}
                                        ></i></RSTooltip>
                                    {settingsPopup && (
                                        <SettingsPopup
                                            show={settingsPopup}
                                            onHide={() => setSettingsPopup(false)}
                                            header="Multiple choice settings"
                                            type={'multiChoice'}
                                            fieldSettings={multiChoiceSettings}
                                            setFieldSettings={setMultiChoiceSettings}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'multichoice'}
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
                <div className="rs-form-element-wrapper rsfch-multi-middle my20">
                    <div className="rs-form-content-holder">
                        <div className="rsfch-label">
                            <p>Answer choices</p>
                        </div>
                    </div>

                    <div className="rs-form-properties-holder">
                        <RSTooltip text='Add choice' className={`position-relative top4 ${getValues()?.isProgressiveProfiling ? 'left-11' : ''}`}>
                            <i
                                id="rs_data_circle_plus_fill_edge"
                                className={`${circle_plus_fill_edge_medium
                                    } icon-md color-primary-blue  ${multiChoice?.length >= 5 ? 'click-off' : ''
                                    }`}
                                onClick={() => {
                                    // let validationState = watcher.answer.includes('');
                                    // const duplicates = watcher.answer.filter(
                                    //     (item, index) => watcher.answer.indexOf(item) !== index,
                                    // );
                                    // if (!validationState && duplicates?.length === 0) {
                                    //     append({ checkBox: '', answer: '' });
                                    // } else if (duplicates?.length > 0) {
                                    //     setError(`formGenerator[${index}].answer[${watcher.answer.indexOf('')}]`, {
                                    //         type: 'custom',
                                    //         message: `Enter answer`,
                                    //     });
                                    // } else {
                                    //     setError(`formGenerator[${index}].answer[${watcher.answer.indexOf('')}]`, {
                                    //         type: 'custom',
                                    //         message: `Enter answer`,
                                    //     });
                                    // }
                                    let validationState = multiChoiceWatch.findIndex((list) => {
                                        let values = list?.answer;
                                        return values === '';
                                    });
                                    let findInd = multiChoiceWatch.map((e) => e.answer);
                                    const duplicates = findInd.filter((item, index) => findInd.indexOf(item) !== index);
                                    if (validationState === -1 && duplicates?.length === 0) {
                                        append({ id: Date.now(), checkBox: '', answer: '', checked: false, radio: '' });
                                    } else if (duplicates?.length > 0) {
                                        setError(
                                            `formGenerator[${index}].multiChoice[${multiChoiceWatch?.length - 1}].answer`,
                                            {
                                                type: 'custom',
                                                message: `Enter new answer`,
                                            },
                                        );
                                    } else {
                                        setError(`formGenerator[${index}].multiChoice[${findInd.indexOf('')}].answer`, {
                                            type: 'custom',
                                            message: `Enter answer`,
                                        });
                                    }
                                }}
                            />
                        </RSTooltip>
                    </div>
                </div>
            )}

            {!preview &&
                <div className={` ${allValues?.formStyles?.formLayout === 'horizontal' && preview ? '' : 'd-flcex'} form-group mb0 multioption ${preview ? 'multioption-preview gap-4 w-100' : ''} `}>
                    {multiChoice.map((item, ind) => {
                        return (
                            <div className="rs-form-element-wrapper rsfch-multi-bottom mt31 d-flex gap-3" key={item?.id}>
                                <div className={`${preview ? 'rs-form-content-holder d-flex align-items-start' : 'rs-form-content-holder'}`}>
                                    {/* <div className={`${preview ? 'rsfch-label mr10' : 'rsfch-label'}`}>
                                   
                                </div> */}
                                    <div className={`w-100 d-flex justify-content-start  ${preview ? 'pt2' : ''}`}>
                                        {isChecked ? (
                                            <RSCheckbox
                                                className="smaller"
                                                name={`formGenerator[${index}].multiChoice[${ind}].checked`}
                                                control={control}
                                                labelClass="mr0"
                                                disabled={true}
                                            />
                                        ) : (
                                            <RSRadioButton
                                                control={control}
                                                name={`formGenerator[${index}].multiChoice[${ind}].radio`}
                                                isLabel={false}
                                                disabled={true}
                                            />
                                        )}
                                        {preview ? (
                                            <div
                                                className={'multichoiceoption'}
                                                title={multiChoiceWatch?.[ind]?.answer || ''}
                                                style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                                            >
                                                {multiChoiceWatch?.[ind]?.answer || ''}
                                            </div>
                                        ) : (
                                            <RSInput
                                                control={control}
                                                name={`formGenerator[${index}].multiChoice[${ind}].answer`}
                                                placeholder={'Answer choice'}
                                                className={'multichoiceoption'}
                                                handleOnBlur={({ target: { value } }) => {
                                                    if (value === '') {
                                                        setError(`formGenerator[${index}].multiChoice[${ind}].answer`, {
                                                            type: 'custom',
                                                            message: `Enter answer`,
                                                        });
                                                    } else {
                                                        let findInd = multiChoiceWatch.map((e) => e.answer);
                                                        const duplicates = findInd.filter(
                                                            (item, index) => findInd.indexOf(item) !== index,
                                                        );
                                                        // const duplicates = watcher.answer.filter(
                                                        //     (item, index) => watcher.answer.indexOf(item) !== index,
                                                        // );

                                                        if (duplicates?.length > 0) {
                                                            setError(`formGenerator[${index}].multiChoice[${ind}].answer`, {
                                                                type: 'custom',
                                                                message: `Enter new answer`,
                                                            });
                                                        } else
                                                            clearErrors(`formGenerator[${index}].multiChoice[${ind}].answer`);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                                {!preview && (
                                    <div className="rs-form-properties-holder">
                                        <div className="rsfph-icons">
                                            <RSTooltip position="top" text='Remove choice' className='position-relative'>
                                                <i
                                                    id="rs_data_circle_minus_fill_edge"
                                                    className={`${circle_minus_fill_edge_medium} ${multiChoice?.length === 1 ? 'click-off' : ''
                                                        } icon-md color-primary-red position-relative ${getValues()?.isProgressiveProfiling ? "left-27" : ""}`}
                                                    onClick={() => remove(ind)}
                                                />
                                            </RSTooltip>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>}
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

export default memo(MultiChoice);
