import { formatName } from 'Utils/modules/formatters';
import { memo, useContext, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import _find from 'lodash/find';

import RSCheckbox from 'Components/FormFields/RSCheckbox';


import { ASTERISK_ICON_DEFAULT, BODYCONFIG, handleAttributeDuplicates, mapToItemRender } from '../../constant';
import { FormGeneratorContext } from '../FormTypes/FormGenerator';
import RSTooltip from 'Components/RSTooltip';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import NewAttributeFormBtn from '../../Components/NewAttributeFormBtn/NewAttributeFormBtn';

const ConsentCheckbox = ({ index, labelName, preview, mandatory, mapTo, disabled }) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
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
        //  else {
        //     if (value?.attributeName === 'New attributes') {
        //         setNewAttributeFlag(true);
        //     }
        // }
    };
    return (
        <div
            className={`consentForm ${preview ? 'fbc-preview' : 'form-builder-component'} ${mandatoryValue ? 'consentcheckbox-required' : 'consentcheckbox-optional'
                }`}
        >
            <div className="rs-form-element-wrapper">
                <div className="rs-form-content-holder">
                    <Col md={4} className='rsfch-label'></Col>
                    <Col md={8} className='rsfch-content'> <div className="rsfch-full agreeCancel">
                        <ul className="rs-list-inline rsfch-consent-block">
                            <li>
                                <RSCheckbox
                                    className="smaller"
                                    name={`formGenerator[${index}].subscribe`}
                                    control={control}
                                    required
                                    labelName={''}
                                />
                            </li>
                            <li>
                                <RSEditorPopup
                                    name={`formGenerator[${index}].tinyMceLableMain`}
                                    control={control}
                                    initialValue={labelName}
                                    init={BODYCONFIG}
                                    disabled={preview}
                                    required
                                    minChars={tag === 'Survey' ? 10 : 15}
                                    maxChars={120}
                                    rules={{
                                        required: THIS_FIELD_IS_REQUIRED,
                                    }}
                                    handleChange={(e) => {
                                                                                clearErrors(`formGenerator[${index}].tinyMceLable`);
                                    }}
                                />
                            </li>
                        </ul>
                        {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                    </div></Col>
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
                                                    ? `${ASTERISK_ICON_DEFAULT} color-primary-red`
                                                    : `${ASTERISK_ICON_DEFAULT} color-secondary-grey`
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

export default memo(ConsentCheckbox);
