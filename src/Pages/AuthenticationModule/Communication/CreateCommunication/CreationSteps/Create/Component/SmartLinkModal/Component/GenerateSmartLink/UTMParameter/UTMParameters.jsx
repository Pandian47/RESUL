import { truncateTitle } from 'Utils/modules/displayCore';
import { selectIcon } from 'Utils/modules/display';
import { NAME_CREATION, PERSONALIZATION_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_TAG as ENTER_TAG_MSG, NO_SPECIAL_CHARS_ALLOWED, SELECT_TAG } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_TAG, ENTER_TAG, ENTER_VALUE, PERSONALIZATION, REMOVE_TAG } from 'Constants/GlobalConstant/Placeholders';
import { close_mini, editor_coupon_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import { get as _get ,findIndex as _findIndex} from 'Utils/modules/lodashReplacements';
import { useSelector } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';


import { removeUrlParameters } from './constant';
import { renderItem } from '../constant';
import { getCustomFields, getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import OfferModal from 'Pages/AuthenticationModule/Components/OfferModal/OfferModal';

const UTMParameters = ({
    className,
    fieldArrayName,
    fieldInsertName,
    modal,
    index: mainIndex,
    disbaleParams,
    callback,
    isEnabled,
    fieldName,
    customColClassName,
    customTooltipClassName,
    type = 'web',
}) => {
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const paramsList = useSelector((state) => getCustomFields(state));
    const { customFields } = useSelector(({ smartLinkReducer }) => smartLinkReducer);
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const [offerModal, setofferModal] = useState({
        show: false,
        data: {},
    });
    const {
        control,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors, isValid },
        getValues,
        trigger,
        resetField,
    } = useFormContext();

    const {
        fields: parameters,
        append: appendParams,
        remove,
        update,
    } = useFieldArray({
        control,
        name: `${fieldInsertName}.parameters`,
    });
    const paramsWatch = useWatch({
        control,
        name: `${fieldInsertName}.parameters`,
    });
    const [tempParamList, setTempParamList] = useState([]);
    useEffect(() => {
        setTempParamList(personalization);
    }, [personalization]);

    // useEffect(() => {
    //     if (isEnabled && !smartLink1) {
    //         if (parameters?.length > 0 && parameters[0]?.tags !== '') {
    //             setValue(`${fieldInsertName}.parameters`, [
    //                 {
    //                     tags: '',
    //                     tagValue: '',
    //                     isUTMParameterInput: false,
    //                     customValue: '',
    //                 },
    //             ]);
    //         }
    //     }
    //     // resetField(`${fieldInsertName}.parameters`);
    // }, [isEnabled]);
    const watchLink = watch(fieldInsertName);

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            let pathName = name?.split('.')[0];
            let selectedAttrList = [];

            let rsltPath = _get(value, pathName, []);
            if (rsltPath?.parameters?.length) {
                rsltPath['parameters'].forEach((item) => {
                    selectedAttrList = [...selectedAttrList, item?.tags?.attributeName];
                });
            }
            let pList = personalization?.filter((item) => !selectedAttrList.includes(item.attributeName));
            setTempParamList(pList);
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const getValueByPath = (obj, path) => {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    };

    const insertParameters = (index, appendValueOne, appendValueTwo = '') => {
        const currentLink = getValues(fieldInsertName);
        const domain = currentLink?.domain || '';
        const adaptiveUrl = currentLink?.adaptiveUrl || '';
        const isCustomInput = getValues(`${fieldInsertName}.parameters[${index}].isUTMParameterInput`);

        const paramKey = appendValueOne?.trim();
        const paramValue = appendValueTwo?.trim();

        let formattedParameter = '';
        if (paramKey) {
            if (isCustomInput) {
                formattedParameter = paramValue ? `${paramKey}=${paramValue}` : `${paramKey}`;
            } else {
                formattedParameter = paramValue
                    ? `${paramKey}=[[${paramKey}]] | [[${paramValue}]]`
                    : `${paramKey}=[[${paramKey}]]`;
            }
        }

        const applyParamToUrl = (url = '') => {
            //debugger
            const hasQuery = url.includes('?');
            const [base = '', query = ''] = hasQuery ? url.split('?') : [url, ''];
            const paramsSplit = query ? query.split('&') : [];
            while (paramsSplit.length <= index) {
                paramsSplit.push('');
            }
            paramsSplit[index] = formattedParameter;
            const filteredParams = paramsSplit.filter(Boolean);
            if (!filteredParams.length) {
                return base;
            }
            return `${base}?${filteredParams.join('&')}`;
        };

        const updatedDomain = applyParamToUrl(domain);
        setValue(`${fieldInsertName}.domain`, updatedDomain);

        if (adaptiveUrl?.length && !modal) {
            const updatedAdaptiveUrl = applyParamToUrl(adaptiveUrl);
            setValue(`${fieldInsertName}.adaptiveUrl`, updatedAdaptiveUrl);
        }
    };
    const updateUTM = (watchIndex) => {
        let watchLink = getValues(fieldName);
        const { isAndroid, isIOS } = watchLink?.[watchIndex];
        const temp = [...getValues(fieldName)];
        const getParams = temp?.[mainIndex]?.parameters;

        if (isAndroid) {
            const androidIndices = temp
                .map((platform, index) => ({ platform, index }))
                .filter(
                    ({ platform, index }) => index > 0 && platform.mobilePlatform?.toLowerCase().startsWith('android'),
                )
                .map(({ index }) => index);

            androidIndices.forEach((index) => {
                temp[index] = {
                    ...temp[index],
                    parameters: [...getParams],
                    isURIParameter: true,
                };
            });
        }

        if (isIOS) {
            const iosIndices = temp
                .map((platform, index) => ({ platform, index }))
                .filter(({ platform, index }) => index > 0 && platform.mobilePlatform?.toLowerCase().startsWith('ip'))
                .map(({ index }) => index);

            iosIndices.forEach((index) => {
                temp[index] = {
                    ...temp[index],
                    parameters: [...getParams],
                    isURIParameter: true,
                };
            });
        }

        setValue(fieldName, temp, { shouldDirty: true, shouldValidate: true });
    };
    const updateParams = () => {
        let watchLink = getValues(fieldName);
        if (mainIndex > 0) {
            updateUTM(1);
        } else {
            const { isAndroid, isIOS, all } = watchLink?.[0];
            const tempTabs = [...watchLink];
            const { parameters } = tempTabs.shift();
            if (all) {
                tempTabs.forEach((_, tabsIndex) => {
                    setValue(`${fieldName}[${tabsIndex + 1}].parameters`, parameters);
                    setValue(`${fieldName}[${tabsIndex + 1}].isURIParameter`, true);
                });
            } else {
                updateUTM(0);
            }
        }
    };
    const handleEnterCustomTag = (index) => {
        update(index, {
            tags: '',
            tagValue: '',
            isUTMParameterInput: true,
            customValue: '',
        });
    };

    return (
        <Fragment>
            {parameters?.map((params, index) => {
                const isCustomInput = _get(watchLink.parameters[index], 'isUTMParameterInput', false);
                const name = `${fieldInsertName}.parameters[${index}]`;
                return (
                    <div className={`form-group ${className} ${disbaleParams}`} key={params.id}>
                        <Row>
                            <Col>
                                {isCustomInput && (
                                    <div className="position-relative">
                                        <RSInput
                                            control={control}
                                            name={`${name}.customValue`}
                                            placeholder={ENTER_TAG}
                                            required
                                            rules={{
                                                required: ENTER_TAG_MSG,
                                                validate: (value) => {
                                                    if (!value) return true;

                                                    const isPersonalization =
                                                        value.includes('[[') || value.includes(']]');

                                                    if (isPersonalization) {
                                                        if (!PERSONALIZATION_REGEX.test(value)) {
                                                            return 'Enter valid personalization';
                                                        }
                                                        return true;
                                                    }

                                                    if (!NAME_CREATION.test(value)) {
                                                        return NO_SPECIAL_CHARS_ALLOWED;
                                                    }

                                                    return true;
                                                },
                                            }}
                                            // handleOnchange={(e)=>console.log(e.target.value, "valueeeee")}

                                            handleOnBlur={(e) => {
                                                const { value } = e.target;
                                                const inputValue = value.trim();
                                                if (inputValue !== '') {
                                                    const appendValueTwo = watchLink.parameters[index]?.tagValue ?? '';
                                                    insertParameters(index, inputValue, appendValueTwo);
                                                    callback(inputValue);
                                                }
                                                setValue(`${name}.customValue`, inputValue);
                                                updateParams();
                                            }}
                                        />
                                        <RSTooltip text="Remove" position="top" className="position-absolute top8 right0 zIndex2 lh0">
                                        <i
                                            className={`${close_mini} color-primary-red icon-xs`}
                                            id="rs_UTMParameters_close"
                                            onClick={() => {
                                                // setValue(`${name}.tags`, '');
                                                // resetField(`${name}.tagsValue`);
                                                // setValue(`${name}.isUTMParameterInput`, false);
                                                removeUrlParameters({
                                                    domain: watchLink.domain,
                                                    adaptiveUrl: watchLink.adaptiveUrl,
                                                    fieldInsertName,
                                                    index,
                                                    setValue,
                                                });

                                                update(index, {
                                                    tags: '',
                                                    tagValue: '',
                                                    isUTMParameterInput: false,
                                                    customValue: '',
                                                });
                                                clearErrors(`${name}.customValue`);
                                                clearErrors(`${name}.tagValue`);
                                                clearErrors(`${name}.tags`);
                                            }}
                                        ></i>
                                        </RSTooltip>
                                    </div>
                                )}
                                {!isCustomInput && (
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${name}.tags`}
                                        // data={PARAMETERS}
                                        // data={[
                                        //     {
                                        //         attributeName: 'Remotedatasource_1',
                                        //         fallbackAttributeName: 'remote data check',
                                        //     },
                                        //     {
                                        //         attributeName: 'Manualentry',
                                        //         fallbackAttributeName: 'manualentry fall check',
                                        //     },
                                        //     {
                                        //         attributeName: 'E_Commerce',
                                        //         fallbackAttributeName: 'ecommer fall check',
                                        //     },
                                        // ]}
                                        data={tempParamList}
                                        dataItemKey={'attributeName'}
                                        textField={'attributeName'}
                                        // label={PERSONALIZATION}
                                        label={'Key'}
                                        required
                                        rules={{
                                            required: SELECT_TAG,
                                            // validate: (value) => {
                                            //     return smartLinkDuplicateTagValidator(watchLink?.parameters, value, index);
                                            // },
                                        }}
                                        isCustomRender
                                        itemRender={(props) =>
                                            renderItem(props, () => {
                                                // setValue(`${name}.isUTMParameterInput`, true);
                                                // resetField(`${name}.tags`);
                                            })
                                        }
                                        footer={
                                            <RSDropdownFooterBtn
                                                title="Custom tag/parameter"
                                                handleClick={() => handleEnterCustomTag(index)}
                                            />
                                        }
                                        handleChange={(e) => {
                                            const { value } = e.target;
                                            callback(value);
                                            // let fallbackValue = tempParamList?.find((x)=>x?.attributeName===value?.attributeName);
                                            if (value?.fallbackAttributeName) {
                                                setValue(
                                                    `${name}.tagValue`,
                                                    `[[${value.attributeName}]] | [[${value.fallbackAttributeName}]]`,
                                                );
                                            } else {
                                                setValue(`${name}.tagValue`, `[[${value.attributeName}]]`);
                                            }
                                            insertParameters(index, value.attributeName, value.fallbackAttributeName);
                                            updateParams();
                                            //trigger();
                                        }}
                                    />
                                )}
                            </Col>
                            <Col className={customColClassName}>
                                {isCustomInput &&
                                    (() => {
                                        const isOfferInserted = paramsWatch?.[index]?.isOffer;
                                        const offerLabel = paramsWatch?.[index]?.tagValue;
                                        if (isOfferInserted) {
                                            return (
                                                <div className="position-relative d-flex align-items-center flex-wrap border-bottom-grey">
                                                    <RSTooltip
                                                        text={offerLabel}
                                                        position="top"
                                                        className="flex-grow-1 min-w-0"
                                                    >
                                                        {truncateTitle(offerLabel, type === 'web' ? 28 : 20)}
                                                    </RSTooltip>
                                                    {/* <RSTooltip
                                                        text={`Reset`}
                                                        position="top"
                                                        className={`position-absolute  bottom1 lh0 right-25`}
                                                    >
                                                        <i
                                                            onClick={() => {
                                                                setValue(`${name}.tagValue`, '');
                                                                setValue(`${name}.isOffer`, false);
                                                            }}
                                                            className={`${restart_medium} color-primary-blue icon-md`}
                                                        />
                                                    </RSTooltip> */}
                                                </div>
                                            );
                                        }
                                        return (
                                            <>
                                                <RSInput
                                                    control={control}
                                                    name={`${name}.tagValue`}
                                                    placeholder={ENTER_VALUE}
                                                    handleOnchange={(e) => {}}
                                                    handleOnBlur={(e) => {
                                                        const { value } = e.target;
                                                        const inputValue = value.trim();
                                                        if (watchLink.parameters[index].customValue !== '') {
                                                            const appendValueOne = `${watchLink.parameters[index].customValue}`;
                                                            insertParameters(index, appendValueOne, inputValue);
                                                            if (inputValue !== '') {
                                                                callback(inputValue);
                                                            }
                                                            updateParams();
                                                        }
                                                    }}
                                                    iconPlaceholder
                                                    isFormMandatoryTooltip
                                                    iconPlaceholderText={'Offer code'}
                                                    iconSize={'icon-md'}
                                                    iconColor={'color-primary-blue'}
                                                    iconName={editor_coupon_medium}
                                                    handlePlaceholderIconClick={() => {
                                                        setofferModal({
                                                            show: true,
                                                            data: {
                                                                fieldName: name,
                                                                index,
                                                                fieldInsertName,
                                                            },
                                                        });
                                                    }}
                                                />
                                                {/* <RSTooltip
                                                text={`Offer code`}
                                                position="top"
                                                className={`position-absolute  bottom1 lh0 right41`}
                                            >
                                                <i
                                                    onClick={() => {
                                                        setofferModal({
                                                            show: true,
                                                            data: {
                                                                fieldName: name,
                                                            },
                                                        });
                                                    }}
                                                    className={`${editor_coupon_medium}  icon-md`}
                                                />
                                            </RSTooltip> */}
                                            </>
                                        );
                                    })()}
                                {!isCustomInput && (
                                    <RSInput
                                        control={control}
                                        name={`${name}.tagValue`}
                                        disabled
                                        required
                                        isError={false}
                                        // placeholder="Tag"
                                        placeholder={'Value'}
                                    />
                                )}

                                <RSTooltip
                                    text={`${index !== 0 ? REMOVE_TAG : ADD_TAG}`}
                                    position="top"
                                    className={`position-absolute  bottom-2 lh0  ${
                                        customTooltipClassName ? customTooltipClassName : 'rsLeft100'
                                    } ${isCustomInput ? '' : ''}`}
                                >
                                    <div
                                        className={`${
                                            index === 0 && parameters?.length >= 10 ? 'pe-none click-off' : ''
                                        }`}
                                    >
                                        <i
                                            className={`${selectIcon(index)} icon-md`}
                                            onClick={() => {
                                                if (!index) {
                                                    const findInvalidIndex = _findIndex(
                                                        getValues(`${fieldInsertName}.parameters`),
                                                        ({ tags, tagValue, isUTMParameterInput, customValue }) => {
                                                            // (isUTMParameterInput && customValue === '') ||
                                                            // tags === '' ||
                                                            // tagValue === '',
                                                            if (isUTMParameterInput) {
                                                                return customValue === '';
                                                            }
                                                            return tags === '';
                                                        },
                                                    );

                                                    if (findInvalidIndex === -1) {
                                                        appendParams({
                                                            tags: '',
                                                            tagValue: '',
                                                            isUTMParameterInput: false,
                                                            customValue: '',
                                                        });
                                                    } else {
                                                        trigger(`${fieldInsertName}.parameters[${findInvalidIndex}]`);
                                                    }
                                                } else {
                                                    const removeUrlParams = {
                                                        domain: watchLink.domain,
                                                        adaptiveUrl: watchLink.adaptiveUrl,
                                                        fieldInsertName,
                                                        index,
                                                        setValue,
                                                    };
                                                    removeUrlParameters(removeUrlParams);
                                                    remove(index);
                                                    updateParams();
                                                }
                                            }}
                                        />
                                    </div>
                                </RSTooltip>
                            </Col>
                        </Row>
                    </div>
                );
            })}
            {offerModal?.show && (
                <OfferModal
                    show={offerModal?.show}
                    handleClose={() =>
                        setofferModal({
                            show: false,
                            data: {},
                        })
                    }
                    confirm={(data) => {
                        const { offerVal } = data;
                        const { fieldName: offerFieldName, index: offerIndex, fieldInsertName: offerFieldInsertName } = offerModal.data || {};
                        const formattedOfferVal = `[${offerVal}]`;
                        if (offerFieldName) {
                            setValue(`${offerFieldName}.tagValue`, formattedOfferVal);
                            setValue(`${offerFieldName}.isOffer`, true);
                        }
                        if (offerIndex !== undefined && offerFieldInsertName != null) {
                            const customValue = getValues(`${offerFieldInsertName}.parameters[${offerIndex}].customValue`) ?? '';
                            if (customValue !== '') {
                                insertParameters(offerIndex, customValue, formattedOfferVal);
                            }
                            if (offerVal !== '') {
                                callback(formattedOfferVal);
                            }
                            updateParams();
                        }
                        setofferModal({ show: false, data: {} });
                    }}
                    fromSmartLink
                />
            )}
        </Fragment>
    );
};

export default memo(UTMParameters);
