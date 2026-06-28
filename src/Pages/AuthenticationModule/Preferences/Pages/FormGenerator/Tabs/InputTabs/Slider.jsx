import { formatName } from 'Utils/modules/formatters';
import { SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import _find from 'lodash/find';

import { useFormContext } from 'react-hook-form';


import { BODYCONFIG, ASTERISK_ICON, SETTINGS_ICON, mapToItemRender, handleAttributeDuplicates } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import SettingsPopup from './SettingsPopup';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
const Slider = ({
    index,
    labelName,
    placeHolder,
    mandatory,
    preview,
    mapTo,
    disabled,
    init,
    sliderProps,
    badLabelName,
    goodLabelName,
    verygoodLabelName,
}) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [sliderSettings, setSliderSettings] = useState({
        firstColor: '#cd0c15',
        secondColor: '#3bbf10',
        thumbColor: '#5acb35',
        shape: 'Round',
    });
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [formGenerator] = watch([`formGenerator`]);
    const { tag } = useContext(FormGeneratorContext);

    const cleanHTML = (html) => {
        if (!html) return html;
        // Remove <p> tags that contain only whitespace or a ProseMirror trailing-break <br>
        let cleaned = html
            .replace(/<p[^>]*>\s*<br\s[^>]*class=["'][^"']*ProseMirror-trailingBreak[^"']*["'][^>]*>\s*<\/p>/gi, '')
            .replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, '')
            .replace(/<p[^>]*>\s*(?:&nbsp;|&#160;|\u00A0)+\s*<\/p>/gi, '')
            .replace(/<p[^>]*>\s*<\/p>/gi, '')
            .trim();

        // Second pass in case of remaining contiguous empty tags
        return cleaned
            .replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, '')
            .replace(/<p[^>]*>\s*<\/p>/gi, '')
            .trim();
    };
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
        // Load slider settings for both preview and edit mode
        const optionList = getValues(`formGenerator[${index}].sliderList`);
        if (optionList) {
            setSliderSettings(optionList);
        }
    }, []);

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].sliderList`, sliderSettings);
        }
    }, [sliderSettings]);

    useEffect(() => {
        if (preview) {
            setValue(`formGenerator[${index}].tinyMceLableMain`, sliderProps?.value);
            setValue(`formGenerator[${index}].tinyMceLableMainSliderBad`, sliderProps?.badLabelName);
            setValue(`formGenerator[${index}].tinyMceLableMainSliderGood`, sliderProps?.goodLabelName);
            setValue(`formGenerator[${index}].tinyMceLableMainSliderVeryGood`, sliderProps?.verygoodLabelName);
        }
    }, [preview]);

    useEffect(() => {
        if (!preview) {
            const badValue = getValues(`formGenerator[${index}].tinyMceLableMainSliderBad`);
            const goodValue = getValues(`formGenerator[${index}].tinyMceLableMainSliderGood`);
            const verygoodValue = getValues(`formGenerator[${index}].tinyMceLableMainSliderVeryGood`);

            if (badValue) {
                setValue(`formGenerator[${index}].tinyMceLableMainSliderBad`, cleanHTML(badValue));
            }
            if (goodValue) {
                setValue(`formGenerator[${index}].tinyMceLableMainSliderGood`, cleanHTML(goodValue));
            }
            if (verygoodValue) {
                setValue(`formGenerator[${index}].tinyMceLableMainSliderVeryGood`, cleanHTML(verygoodValue));
            }
        }
    }, []);

    return (
        <div
            className={` ${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'slider-required' : 'slider-optional'
                }`}
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: [
                        `.slider::-webkit-slider-thumb {`,
                        ` background-color: ${sliderSettings?.thumbColor} !important;`,
                        '}',
                        `.slider::-moz-range-thumb {`,
                        ` background-color: ${sliderSettings?.thumbColor} !important;`,
                        '}',
                    ].join('\n'),
                }}
            ></style>
            <div className={`rs-form-element-wrapper rsfch-multi-top  `}>
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
                            handleChange={(e) => {
                                clearErrors(`formGenerator[${index}].tinyMceLable`);
                            }}
                        />
                        {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                    </div>
                    {preview && (
                        <span className={`sliderpreview w-100 ${preview && getValues()?.isProgressiveProfiling ? '' : preview ? '' : ''}`}>
                            <div className="form-group mt20 mb20 sliderbottom">
                                <Row>
                                    <Col sm={4}>
                                        <RSEditorPopup
                                            name={`formGenerator[${index}].tinyMceLableMainSliderBad`}
                                            control={control}
                                            init={BODYCONFIG}
                                            disabled={preview}
                                            required
                                            rules={{
                                                required: THIS_FIELD_IS_REQUIRED,
                                            }}
                                            {...(preview && {
                                                initialValue: badLabelName?.includes('<p') ? cleanHTML(verygoodLabelName) : cleanHTML(`<p style="text-align:right">${verygoodLabelName || ''}</p>`),
                                            })}
                                            handleChange={(e) => {
                                                const cleanedHTML = cleanHTML(e.html);
                                                if (cleanedHTML !== e.html) {
                                                    setValue(`formGenerator[${index}].tinyMceLableMainSliderBad`, cleanedHTML);
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col sm={4}>
                                        <RSEditorPopup
                                            name={`formGenerator[${index}].tinyMceLableMainSliderGood`}
                                            control={control}
                                            init={BODYCONFIG}
                                            disabled={preview}
                                            required
                                            {...(preview && {
                                                initialValue: goodLabelName?.includes('<p') ? cleanHTML(verygoodLabelName) : cleanHTML(`<p style="text-align:right">${verygoodLabelName || ''}</p>`),
                                            })}
                                            rules={{
                                                required: THIS_FIELD_IS_REQUIRED,
                                            }}
                                            handleChange={(e) => {
                                                const cleanedHTML = cleanHTML(e.html);
                                                if (cleanedHTML !== e.html) {
                                                    setValue(`formGenerator[${index}].tinyMceLableMainSliderGood`, cleanedHTML);
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col sm={4}>
                                        <RSEditorPopup
                                            name={`formGenerator[${index}].tinyMceLableMainSliderVeryGood`}
                                            control={control}
                                            init={BODYCONFIG}
                                            disabled={preview}
                                            {...(preview && {
                                                initialValue: verygoodLabelName?.includes('<p') ? cleanHTML(verygoodLabelName) : cleanHTML(`<p style="text-align:right">${verygoodLabelName || ''}</p>`),
                                            })}
                                            required
                                            rules={{
                                                required: THIS_FIELD_IS_REQUIRED,
                                            }}
                                            iscustomWidth={true}
                                            handleChange={(e) => {
                                                const cleanedHTML = cleanHTML(e.html);
                                                if (cleanedHTML !== e.html) {
                                                    setValue(`formGenerator[${index}].tinyMceLableMainSliderVeryGood`, cleanedHTML);
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="form-group mb0">
                                <div className={`${sliderSettings?.shape == 'Round' ? 'rsfbsw-round' : 'rsfbsw-square'} ${preview ? 'ml2' : ''}`}>
                                    <RSInput
                                        type="range"
                                        //className="form-range"
                                        className="slider"
                                        control={control}
                                        name={`formGenerator[${index}].Slider`}
                                        value={'Very good'}
                                        style={{
                                            background: `linear-gradient(
                            to right,
                            ${sliderSettings?.firstColor} 0%,
                            ${sliderSettings?.secondColor}80 50%,
                            ${sliderSettings?.secondColor} 100%
                        )`,
                                        }}
                                        id="customRange"
                                    />
                                </div>
                            </div>
                        </span>
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
                                        ></i>
                                    </RSTooltip>
                                    {settingsPopup && (
                                        <SettingsPopup
                                            show={settingsPopup}
                                            onHide={() => setSettingsPopup(false)}
                                            header="Slider settings"
                                            type={'slider'}
                                            control={control}
                                            fieldSettings={sliderSettings}
                                            setFieldSettings={setSliderSettings}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'slider'}
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
                <span className={`sliderpreview w-100 ${preview && getValues()?.isProgressiveProfiling ? '' : preview ? '' : ''}`}>
                    <div className="form-group mt20 mb20 sliderbottom">
                        <Row>
                            <Col sm={4}>
                                <RSEditorPopup
                                    name={`formGenerator[${index}].tinyMceLableMainSliderBad`}
                                    control={control}
                                    init={BODYCONFIG}
                                    disabled={preview}
                                    required
                                    rules={{
                                        required: THIS_FIELD_IS_REQUIRED,
                                    }}
                                    {...(!preview && {
                                        initialValue: badLabelName?.includes('<p') ? cleanHTML(badLabelName) : cleanHTML(`<p style="text-align:left">${badLabelName || ''}</p>`),
                                    })}
                                    handleChange={(e) => {
                                        const cleanedHTML = cleanHTML(e.html);
                                        if (cleanedHTML !== e.html) {
                                            setValue(`formGenerator[${index}].tinyMceLableMainSliderBad`, cleanedHTML);
                                        }
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSEditorPopup
                                    name={`formGenerator[${index}].tinyMceLableMainSliderGood`}
                                    control={control}
                                    init={BODYCONFIG}
                                    disabled={preview}
                                    required
                                    {...(!preview && {
                                        initialValue: goodLabelName?.includes('<p') ? cleanHTML(goodLabelName) : cleanHTML(`<p style="text-align:center">${goodLabelName || ''}</p>`),
                                    })}
                                    rules={{
                                        required: THIS_FIELD_IS_REQUIRED,
                                    }}
                                    handleChange={(e) => {
                                        const cleanedHTML = cleanHTML(e.html);
                                        if (cleanedHTML !== e.html) {
                                            setValue(`formGenerator[${index}].tinyMceLableMainSliderGood`, cleanedHTML);
                                        }
                                    }}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSEditorPopup
                                    name={`formGenerator[${index}].tinyMceLableMainSliderVeryGood`}
                                    control={control}
                                    init={BODYCONFIG}
                                    disabled={preview}
                                    {...(!preview && {
                                        initialValue: verygoodLabelName?.includes('<p') ? cleanHTML(verygoodLabelName) : cleanHTML(`<p style="text-align:right">${verygoodLabelName || ''}</p>`),
                                    })}
                                    required
                                    rules={{
                                        required: THIS_FIELD_IS_REQUIRED,
                                    }}
                                    iscustomWidth={true}
                                    handleChange={(e) => {
                                        const cleanedHTML = cleanHTML(e.html);
                                        if (cleanedHTML !== e.html) {
                                            setValue(`formGenerator[${index}].tinyMceLableMainSliderVeryGood`, cleanedHTML);
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="form-group mb0">
                        <div className={`${sliderSettings?.shape == 'Round' ? 'rsfbsw-round' : 'rsfbsw-square'} ${preview ? 'ml2' : ''}`}>
                            <RSInput
                                type="range"
                                //className="form-range"
                                className="slider"
                                control={control}
                                name={`formGenerator[${index}].Slider`}
                                value={'Very good'}
                                style={{
                                    background: `linear-gradient(
                            to right,
                            ${sliderSettings?.firstColor} 0%,
                            ${sliderSettings?.secondColor}80 50%,
                            ${sliderSettings?.secondColor} 100%
                        )`,
                                }}
                                id="customRange"
                            />
                        </div>
                    </div>
                </span>
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

export default memo(Slider);
