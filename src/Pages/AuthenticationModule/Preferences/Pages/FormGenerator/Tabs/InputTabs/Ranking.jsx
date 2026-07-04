import { formatName } from 'Utils/modules/formatters';
import { circle_minus_fill_edge_medium, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useState } from 'react';
import { find as _find } from 'Utils/modules/lodashReplacements';

import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';


import {
    BODYCONFIG,
    ASTERISK_ICON,
    RANKING_LIST,
    RANKING_VAL,
    mapToItemRender,
    handleAttributeDuplicates,
} from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import RSInput from 'Components/FormFields/RSInput';

import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';

const Ranking = ({ index, labelName, mandatory, preview, mapTo, disabled }) => {
    const { control, setValue, clearErrors, setError, watch, getValues } = useFormContext();
    const allValues = getValues()
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
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

    const {
        fields: rankingFields,
        append,
        remove,
    } = useFieldArray({
        control,
        name: `formGenerator[${index}].rankingFields`,
    });

    const rankingFieldsWatch = useWatch({
        control,
        name: `formGenerator[${index}].rankingFields`,
    });
    // useEffect(() => {
    //     // if (!fields?.length) setValue(`formGenerator[${index}].ranking`, RANKING_VAL);
    if (!rankingFields?.length) append(RANKING_VAL);
    // }, []);

    const watcher = useWatch({ control, name: `formGenerator[${index}].rankingFields` });
    const watchers = useWatch({ control, name: `formGenerator[${index}]` });
    return (
        <div
            className={` ${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'ranking-required' : 'ranking-optional'
                }`}
        >
            <div className={`rs-form-element-wrapper rsfch-multi-top `}>
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label `}>
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
                        />
                        {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                    </div>
                    {preview && (
                        <div className='w-100'>
                            {rankingFields.map((item, ind) => {
                                return (
                                    <div className={`${allValues?.formStyles?.formLayout === 'horizontal' && preview ? 'd-flex' : 'form-group'} gap-4 rsfch-content rankingbottom  `} key={item?.id}>
                                        <div className={`input-field ${preview && allValues?.formStyles?.formLayout === 'horizontal' ? "" : "form-group"} w-100`}>
                                            <RSInput
                                                control={control}
                                                name={`formGenerator[${index}].rankingFields[${ind}].answer`}
                                                placeholder={'Answer choice'}
                                                required
                                                rules={{
                                                    required: 'Enter an answer',
                                                }}
                                                handleOnBlur={({ target: { value } }) => {
                                                    if (value === '') {
                                                        setError(`formGenerator[${index}].rankingFields[${ind}].answer`, {
                                                            type: 'custom',
                                                            message: `Enter answer`,
                                                        });
                                                    } else {
                                                        let findInd = rankingFieldsWatch.map((e) => e.answer);
                                                        const duplicates = findInd.filter(
                                                            (item, index) => findInd.indexOf(item) !== index,
                                                        );

                                                        if (duplicates?.length > 0) {
                                                            setError(`formGenerator[${index}].rankingFields[${ind}].answer`, {
                                                                type: 'custom',
                                                                message: `Enter new answer`,
                                                            });
                                                        } else {
                                                            clearErrors(`formGenerator[${index}].rankingFields[${ind}].answer`);
                                                        }
                                                    }
                                                                                                    }}
                                            />
                                        </div>
                                        <div className={`${preview && allValues?.formStyles?.formLayout === 'horizontal' ? "" : ""} w-100`}>
                                            <RSKendoDropDownList
                                                name={`formGenerator[${index}].rankingFields[${ind}].rank`}
                                                data={RANKING_LIST}
                                                control={control}
                                                label={'Ranking'}
                                            />
                                        </div>
                                        {!preview && (
                                            <div className="rs-form-properties-holder position-relative ">
                                                <div className="rsfph-icons">
                                                    <i
                                                        id="rs_data_circle_minus_fill_edge"
                                                        className={`${circle_minus_fill_edge_medium
                                                            } icon-md color-primary-red position-relative top5 ${rankingFields?.length === 1 ? 'click-off' : ''
                                                            }`}
                                                        onClick={() => remove(ind)}
                                                    ></i>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                        <div className="rsfch-label"><p>Answer choices</p></div>
                    </div>

                    <div className="rs-form-properties-holder">
                        <i
                            id="rs_data_circle_plus_fill_edge"
                            className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue ${rankingFields?.length >= 5 ? 'click-off' : ''
                                }`}
                            onClick={() => {
                                let validationState = rankingFieldsWatch.findIndex((list) => {
                                    let values = list?.answer;
                                    return values === '';
                                });
                                let findInd = rankingFieldsWatch.map((e) => e.answer);
                                const duplicates = findInd.filter((item, index) => findInd.indexOf(item) !== index);
                                if (validationState === -1 && duplicates?.length === 0) {
                                    append({ rank: '', answer: '' });
                                } else if (duplicates?.length > 0) {
                                    setError(`formGenerator[${index}].rankingFields[${findInd.indexOf('')}].answer`, {
                                        type: 'custom',
                                        message: `Enter answer`,
                                    });
                                } else {
                                    setError(`formGenerator[${index}].rankingFields[${findInd.indexOf('')}].answer`, {
                                        type: 'custom',
                                        message: `Enter answer`,
                                    });
                                }
                            }}
                        // onClick={() => append({ rank: '', answer: '' })}
                        />
                    </div>
                </div>
            )}

            {!preview && (
                <div className='w-100'>
                    {rankingFields.map((item, ind) => {
                        return (
                            <div className={`${allValues?.formStyles?.formLayout === 'horizontal' && preview ? '' : 'd-flex'} gap-4 rsfch-content rankingbottom form-group  `} key={item?.id}>
                                <div className={`input-field ${preview && allValues?.formStyles?.formLayout === 'horizontal' ? "" : "w-100"}`}>
                                    <RSInput
                                        control={control}
                                        name={`formGenerator[${index}].rankingFields[${ind}].answer`}
                                        placeholder={'Answer choice'}
                                        required
                                        rules={{
                                            required: 'Enter an answer',
                                        }}
                                        handleOnBlur={({ target: { value } }) => {
                                            if (value === '') {
                                                setError(`formGenerator[${index}].rankingFields[${ind}].answer`, {
                                                    type: 'custom',
                                                    message: `Enter answer`,
                                                });
                                            } else {
                                                let findInd = rankingFieldsWatch.map((e) => e.answer);
                                                const duplicates = findInd.filter(
                                                    (item, index) => findInd.indexOf(item) !== index,
                                                );

                                                if (duplicates?.length > 0) {
                                                    setError(`formGenerator[${index}].rankingFields[${ind}].answer`, {
                                                        type: 'custom',
                                                        message: `Enter new answer`,
                                                    });
                                                } else {
                                                    clearErrors(`formGenerator[${index}].rankingFields[${ind}].answer`);
                                                }
                                            }
                                                                                    }}
                                    />
                                </div>
                                <div className={`${preview && allValues?.formStyles?.formLayout === 'horizontal' ? "" : "w-100"}`}>
                                    <RSKendoDropDownList
                                        name={`formGenerator[${index}].rankingFields[${ind}].rank`}
                                        data={RANKING_LIST}
                                        control={control}
                                        label={'Ranking'}
                                    />
                                </div>
                                {!preview && (
                                    <div className="rs-form-properties-holder position-relative ">
                                        <div className="rsfph-icons">
                                            <i
                                                id="rs_data_circle_minus_fill_edge"
                                                className={`${circle_minus_fill_edge_medium
                                                    } icon-md color-primary-red position-relative top5 ${rankingFields?.length === 1 ? 'click-off' : ''
                                                    }`}
                                                onClick={() => remove(ind)}
                                            ></i>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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

export default memo(Ranking);
