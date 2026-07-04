import { formatName } from 'Utils/modules/formatters';
import { SETTINGS } from 'Constants/GlobalConstant/Placeholders';
import { memo, useContext, useEffect, useState } from 'react';
import { find as _find } from 'Utils/modules/lodashReplacements';

import { useFormContext, useWatch } from 'react-hook-form';


import { BODYCONFIG, ASTERISK_ICON, SETTINGS_ICON, mapToItemRender, handleAttributeDuplicates } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import SettingsPopup from './SettingsPopup';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
const CommentBox = ({ index, labelName, placeHolder, mandatory, preview, mapTo, disabled }) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const [commentBoxSettings, setCommentBoxSettings] = useState({
        ddlValue: 'Multi line',
        placeholder: '',
    });
    const [settingsPopup, setSettingsPopup] = useState(false);
    const [mandatoryValue, setMandatoryValue] = useState(mandatory);
    const [newAttributeFlag, setNewAttributeFlag] = useState(false);
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [formGenerator] = watch([`formGenerator`]);
    const { tag } = useContext(FormGeneratorContext);
    const watcher = useWatch({ control, name: `formGenerator[${index}]` });
    const settings = watcher?.settings;
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
        if (preview) {
            const commentLine = getValues(`formGenerator[${index}].commentLine`);
            if (commentLine)
                setCommentBoxSettings({
                    ddlValue: commentLine,
                    placeholder: settings?.commentBoxPlaceholder || '',
                });
        } else {
            // Initialize settings from form values when not in preview mode
            setCommentBoxSettings(prevSettings => ({
                ...prevSettings,
                placeholder: settings?.commentBoxPlaceholder || '',
            }));
        }
    }, [settings?.commentBoxPlaceholder]);

    useEffect(() => {
        if (!preview) {
            setValue(`formGenerator[${index}].commentLine`, commentBoxSettings?.ddlValue);
        }
    }, [commentBoxSettings?.ddlValue]);

    return (
        <div
            className={` ${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'commentbox-required' : 'commentbox-optional'
                }`}
        >
            <div className={`rs-form-element-wrapper rsfch-multi-top `}>
                <div className="rs-form-content-holder">
                    <div className={`rsfch-label `}>
                        {/* <RSTinyMceInlineEditor
                            name={`formGenerator[${index}].tinyMceLableMain`}
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
                            name={`formGenerator[${index}].tinyMceLableMain`}
                            control={control}
                            initialValue={labelName}
                            init={BODYCONFIG}
                            disabled={preview}
                            required
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
                        <div className={` rsfch-content w-100 commentboxbottom form-group mb0 ${preview && getValues()?.isProgressiveProfiling ? '  mt10' : preview ? 'mt10' : 'mt20'}`}>
                            <RSTextarea
                                name={`formGenerator.${index}.message`}
                                control={control}
                                required={mandatoryValue}
                                disabled
                                placeholder={settings?.commentBoxPlaceholder || placeHolder}
                                rows={commentBoxSettings?.ddlValue === 'Single line' ? 1 : 3}
                            />
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
                                            minChars={tag === 'Survey' ? 3 : 3}
                                            maxChars={120}
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
                                            fieldSettings={commentBoxSettings}
                                            setFieldSettings={setCommentBoxSettings}
                                            header="Comment box settings"
                                            type={'CommentBox'}
                                            control={control}
                                            index={index}
                                            setSettingsPopup={setSettingsPopup}
                                            elementType={'commentbox'}
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
                                        title="New attribute"
                                        handleModalAttribute={() => setNewAttributeFlag(true)}
                                    />
                                }
                            />
                        </div>
                    </div>
                )}
            </div>
            {!preview && <div className={` rsfch-content w-100 commentboxbottom form-group mb0 ${preview && getValues()?.isProgressiveProfiling ? '  mt10' : preview ? 'mt10' : 'mt20'}`}>
                <RSTextarea
                    name={`formGenerator.${index}.message`}
                    control={control}
                    required={mandatoryValue}
                    disabled
                    placeholder={settings?.commentBoxPlaceholder || placeHolder}
                    rows={commentBoxSettings?.ddlValue === 'Single line' ? 1 : 3}
                />
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

export default memo(CommentBox);
