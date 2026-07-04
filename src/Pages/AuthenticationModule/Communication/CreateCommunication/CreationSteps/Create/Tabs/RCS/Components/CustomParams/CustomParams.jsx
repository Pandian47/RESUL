import { PERSONALIZATION } from 'Constants/GlobalConstant/Placeholders';
import { restart_medium, user_question_mark_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSInput from 'Components/FormFields/RSInput';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import RSTooltip from 'Components/RSTooltip';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import InsertOffer from '../../../../Component/InsertOffer';
import { isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import { Col, Row } from 'react-bootstrap';
import { senderNameValidator } from 'Utils/HookFormValidate';
import { handlePersonalization } from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';
const CustomParams = ({ isSplitAB, fieldName, defaultValue }) => {
    const location = useQueryParams('/communication');
    const {
        control,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useFormContext();
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    const customParamsName = isSplitAB ? `${fieldName}.customParams` : 'customParams';
    const { fields } = useFieldArray({
        name: customParamsName,
        control,
    });

    const editorText = isSplitAB ? `${fieldName}.editorText` : 'editorText';

    const [customParamsDetails, setCustomParamsDetails] = useState({});

    const handleChange = async (changeValue, field, isDynamic) => {
        if (!field?.placeholder) return;

        const key = field.slice(2, -2).trim();
        if (!key) return;

        setCustomParamsDetails((prevParams) => {
            const previousValue = prevParams[key] || '';
            const newValue = isDynamic ? `${previousValue}${changeValue.trim()}` : changeValue.trim();

            const updatedParams = { ...prevParams, [key]: newValue };
            let updatedText = defaultValue || '';

            Object.entries(updatedParams).forEach(([paramKey, paramValue]) => {
                updatedText = updatedText.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), `{{${paramValue}}}`);
            });

            setValue(editorText, updatedText);
            return updatedParams;
        });
    };

    const handleRefresh = (field, index) => {
        const currCustomParam = getValues(customParamsName);
        const currCustomParams = currCustomParam?.[index];

        const key = field?.slice(2, -2).trim();
        if (!key) return;

        setValue(
            `${customParamsName}.${index}`,
            {
                ...currCustomParams,
                value: '',
                isClickOff: {
                    personalize: false,
                    offerCode: false,
                },
            },
            { shouldDirty: true, shouldValidate: true },
        );

        setCustomParamsDetails((prevParams) => {
            const updatedParams = { ...prevParams };
            delete updatedParams[key];
            let updatedText = defaultValue || '';
            Object.entries(updatedParams).forEach(([paramKey, paramValue]) => {
                updatedText = updatedText.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), `{{${paramValue}}}`);
            });
            setValue(editorText, updatedText);
            return updatedParams;
        });
    };

    useEffect(() => {
        if(!_isEmpty(customParamsDetails)){
            const currCustomParam = getValues(customParamsName);
            const updatedParams = currCustomParam?.map((param) => ({
                ...param,
                value: customParamsDetails?.[param.placeholder] || param.value,
            }));
            setValue(customParamsName, updatedParams, { shouldDirty: true, shouldValidate: true });
        }
    }, [customParamsDetails]);

    return (
        <>
            {fields?.map((field, index) => {
                                return (
                    <Row key={index}>
                        <Col sm={6}>
                            <RSInput
                                control={control}
                                className='rcs-custom-params'
                                name={`${customParamsName}.${[index]}.value`}
                                placeholder={field?.placeholder}
                                handleOnchange={(e) => handleChange(e.target.value, field, false)}
                                disabled={
                                    !field?.isClickOff?.personalize && !field?.isClickOff?.offerCode
                                        ? true
                                        : field?.isClickOff?.personalize
                                        ? true
                                        : false
                                }
                                rules={{
                                    validate: (val) => {
                                        return val?.length ? senderNameValidator(val, field?.defaultValue) : true;
                                    },
                                }}
                            />
                        </Col>
                        <Col sm={6} className="d-flex align-items-center position-relative top1 pl0">
                            <div className={`${field?.isClickOff?.offerCode ? 'click-off' : ''}`}>
                                <InsertOffer
                                    textArea={true}
                                    insert={(value) => {
                                        const currCustomParam = getValues(customParamsName);
                                        const currCustomParams = currCustomParam?.[index];
                                        const updateValue = `${currCustomParams.value}${value}`;
                                        setValue(`${customParamsName}.${[index]}`, {
                                            ...currCustomParams,
                                            value: updateValue,
                                            isClickOff: {
                                                personalize: true,
                                                offerCode: false,
                                            },
                                            defaultValue: updateValue,
                                        });
                                        handleChange(updateValue, field, false);
                                    }}
                                    fromRCS
                                />
                            </div>
                            <div className="ml15 position-relative top2">
                                <RSTooltip
                                    text={PERSONALIZATION}
                                    className={`lho ${field?.isClickOff?.personalize ? 'click-off' : ''}`}
                                >
                                    <RSBootstrapdown
                                        title="Personalization"
                                        data={handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization)}
                                        isObject
                                        fieldKey="personalizationKey"
                                        flatIcon
                                        defaultItem={{
                                            attributeName: '',
                                            dataAttributeId: 0,
                                            fallbackAttributeName: null,
                                            personalizationKey: (
                                                <i
                                                    //title="Personalize"
                                                    className={`${user_question_mark_medium} icon-md`}
                                                />
                                            ),
                                        }}
                                        showUpdate={false}
                                        className="no_caret"
                                        onSelect={({ personalizationKey }) => {
                                            const currCustomParam = getValues(customParamsName);
                                            const currCustomParams = currCustomParam[index];
                                            const updateValue = `${currCustomParams.value}${personalizationKey}`;
                                            setValue(`${customParamsName}.${[index]}`, {
                                                ...currCustomParams,
                                                value: updateValue,
                                                isClickOff: {
                                                    personalize: false,
                                                    offerCode: true,
                                                },
                                                defaultValue: updateValue,
                                            });
                                            handleChange(updateValue, field, false);
                                        }}
                                        showSearch
                                    />
                                </RSTooltip>
                            </div>
                            <div className="ml15 position-relative top2">
                                <RSTooltip text="Reset" position="top" className="lh0">
                                    <i
                                        id="rs_data_refresh"
                                        className={`${restart_medium} icon-md color-primary-blue cp`}
                                        onClick={() => handleRefresh(field, index)}
                                    />
                                </RSTooltip>
                            </div>
                        </Col>
                    </Row>
                );
            })}
        </>
    );
};

export default CustomParams;