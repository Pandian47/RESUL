import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_minus_fill_medium, circle_plus_fill_medium, data_transfer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';

import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import {
    purchaseRecencyDuration,
    purchaseRecencyLimitCount,
    recencyDurationData,
} from '../../PurchasePattern/constant';
import { handlePurchasePatternGradingTotal } from '../constants';

const PurchasePatternComponent = ({ name, purchasePatternData, head, title }) => {
    // console.log('purchasePatternData: ', purchasePatternData);
    const {
        control,
        trigger,
        getValues,
        setError,
        setValue,
        reset,
        formState: { errors, isValid },
        watch,
        clearErrors,
    } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${name}Values`,
    });

    const allValues = useWatch({
        control,
        name: `${name}Values`,
    });

    const getAllValues = getValues();

    const [showFullDetail, setShowFullDetail] = useState(true);

    const addMore = (type) => {
        let totalData = getValues(`${name}Values`);
        if (totalData?.length) {
            const fieldCheck = ['from', 'to', 'score', 'duration'];
            const fieldStatus = fieldCheck
                ?.map((field) => {
                    if (!totalData[totalData?.length - 1][field]) {
                        return true;
                    } else {
                        return false;
                    }
                })
                ?.every((status) => status === false);
            const erorrStatus = errors[`${name}Values`];
            if (fieldStatus && !erorrStatus) {
                append({
                    to: '',
                    score: '',
                    duration: '',
                    from: '',
                    isCreate: true,
                });
            } else {
                trigger(`${name}Values`);
            }
        } else {
            append({
                to: '',
                score: '',
                duration: '',
                from: '',
                isCreate: true,
            });
        }
    };

    const checkDuplicateFromToDuration = () => {
        let totalData = getValues(`${name}Values`);
        const seen = new Set();
        const duplicates = totalData?.filter((item, index) => {
            const key = `${item.from}-${item.to}-${item.duration}`;
            if (seen.has(key)) {
                return true;
            }
            seen.add(key);
            return false;
        });
        return duplicates;
    };

    const handleDropdownChange = (e, ind) => {
        const currentValues = allValues?.length && allValues?.map((item) => item?.title);

        const selectedTitle = e.target.value.title;
        const selectedValue = e.target.value.value;

        if (currentValues.includes(selectedTitle)) {
            setError(`${name}Values[${ind}]`, {
                type: 'custom',
                message: 'Duplicate',
            });
            // setError(`${name}Values[${ind}].value`, {
            //     type: 'custom',
            //     message: 'Duplicate',
            // });
            // console.log(errors, 'errors');
        } else {
            setError(`${name}Values[${ind}]`, {
                type: 'custom',
                message: '',
            });
            setValue(`${name}Values[${ind}].value`, null);
        }
    };

    const handleOnBlur = () => {
        const totalValues =
            allValues?.length &&
            allValues?.reduce((accumulator, currentValue) => {
                // console.log('currentValue: ', currentValue);
                return Number(accumulator) + Number(currentValue.score);
            }, 0);
        setValue(`${name}Values.total`, totalValues);
        handlePurchasePatternGradingTotal(getAllValues, setValue);
    };

    const handleToggle = () => {
        setShowFullDetail(!showFullDetail);
        handleOnBlur();
    };

    useEffect(() => {
        if (purchasePatternData?.patternSegmentRule?.length) {
            setShowFullDetail(true);
            const updateValue = purchasePatternData?.patternSegmentRule?.map((item) => {
                return {
                    to: item.OperatorToKey,
                    score: item.Score,
                    duration: item.Time,
                    from: item.OperatorFromKey,
                    isCreate: item.IsCreate,
                };
            });
            reset((formstate) => ({
                ...formstate,
                [`${name}Values`]: updateValue,
            }));
            handleOnBlur();
        } else {
            setShowFullDetail(false);
        }
    }, [purchasePatternData?.patternSegmentRule]);

    useEffect(() => {
        setValue(`${name}Values.total`, purchasePatternData?.patternSegmentScore);
        handlePurchasePatternGradingTotal(getAllValues, setValue);
    }, [purchasePatternData?.patternSegmentScore]);

    useEffect(() => {
        if (!showFullDetail && purchasePatternData?.patternSegmentRule?.length) {
            const updateValue = purchasePatternData?.patternSegmentRule?.map((item) => {
                return {
                    to: item.OperatorToKey,
                    score: item.Score,
                    duration: item.Time,
                    from: item.OperatorFromKey,
                    isCreate: item.IsCreate,
                };
            });
            if (updateValue) {
                reset((formstate) => ({
                    ...formstate,
                    [`${name}Values`]: updateValue,
                }));
            }
            handleOnBlur();
        }
        handlePurchasePatternGradingTotal(getAllValues, setValue);
        setValue(`${name}Values.total`, purchasePatternData?.patternSegmentScore);
        setValue(`${name}ToggleValue`, showFullDetail);
    }, [showFullDetail]);

    return (
        <Col sm={6}>
            <Row className='m0'>
                <Col sm={7} className='pl0'>
                    <div className='mb5'>{head}</div>
                </Col>
                <Col sm={4} className='pr0'>
                    <div className="click-off">
                        <RSInput
                            control={control}
                            name={`${name}Values.total`}
                            handleOnBlur={() => handlePurchasePatternGradingTotal(getAllValues, setValue)}
                            rules={{
                                validate: (value) => {
                                    const updateValue = Number(value);
                                    if (updateValue === 0) {
                                        return ' Enter  valid value';
                                    } else if (updateValue > 500) {
                                        return 'less than 500';
                                    }
                                },
                            }}
                        />
                    </div>
                </Col>
                <Col sm={1} className='text-right mt7'>
                    <div onClick={handleToggle}>
                        <RSTooltip text='Data wise'>
                        <i className={`${data_transfer_medium} icon-md color-primary-blue`}></i>
                        </RSTooltip>
                    </div>
                </Col>
            </Row>
            <div className="box-design p10 pt13 mb30 no-box-shadow">
                {showFullDetail ? (
                    <div className="pref-as-card-wrapper">
                        <Row className='m0 mb10'>
                            <Col md={9} className='pl0'>{title}</Col>
                            <Col md={2} className='pl10'>
                                <span>Score</span>
                            </Col>
                            <Col md={1} className='pl10 pr0'>
                                {
                                    <RSTooltip position="top" text="Add" className="lh0">
                                        <i
                                            onClick={() => {
                                                addMore();
                                            }}
                                            className={`${circle_plus_fill_medium}  icon-md color-primary-blue ${
                                                fields?.length >= 5 ? 'click-off' : ''
                                            } mr7`}
                                            id="rs_data_circle_plus_fill"
                                        ></i>
                                    </RSTooltip>
                                }
                            </Col>
                        </Row>
                        {fields?.length ? (
                            <div className='pacrw-content-list'>
                                {fields.map((ele, ind) => {
                                    return (
                                        <Row className='m0' key={ele?.id ?? `${name}-row-${ind}`}>
                                            <Col sm={3} className='pl0 mt-1'>
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={`${name}Values[${ind}].from`}
                                                    data={recencyDurationData}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            if (checkDuplicateFromToDuration()?.length) {
                                                                return 'Duplicate';
                                                            }
                                                            return true;
                                                        },
                                                    }}
                                                    handleChange={(e) => {
                                                        // setValue(`${name}Values[${ind}].value`, e.target.value.value);
                                                        // handleDropdownChange(e, ind);
                                                    }}
                                                    required
                                                />
                                            </Col>
                                            <Col sm={3} className='mt-1'>
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={`${name}Values[${ind}].to`}
                                                    data={purchaseRecencyLimitCount}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            if (checkDuplicateFromToDuration()?.length) {
                                                                return 'Duplicate';
                                                            }
                                                            return true;
                                                        },
                                                    }}
                                                    // defaultValue={ele}
                                                    handleChange={(e) => {
                                                        // setValue(`${name}Values[${ind}].value`, e.target.value.value);
                                                        // handleDropdownChange(e, ind);
                                                    }}
                                                    required
                                                    // defaultValue={communicationData[ind]}
                                                />
                                            </Col>
                                            <Col sm={3} className='mt-1'>
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={`${name}Values[${ind}].duration`}
                                                    data={purchaseRecencyDuration}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            if (checkDuplicateFromToDuration()?.length) {
                                                                return 'Duplicate';
                                                            }
                                                            return true;
                                                        },
                                                    }}
                                                    handleChange={(e) => {
                                                        // setValue(`${name}Values[${ind}].value`, e.target.value.value);
                                                        // handleDropdownChange(e, ind);
                                                    }}
                                                    required
                                                />
                                            </Col>
                                            <Col sm={2}>
                                                <RSInput
                                                    control={control}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            const updateValue = Number(value);
                                                            if (updateValue === 0) {
                                                                return 'Enter valid';
                                                            } else if (updateValue > 100) {
                                                                return 'Less than 100';
                                                            }
                                                        },
                                                    }}
                                                    required
                                                    name={`${name}Values[${ind}].score`}
                                                    handleOnBlur={handleOnBlur}
                                                    // defaultValue={setValue(`${name}[${ind}].value`, ele?.value)}
                                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                />
                                            </Col>
                                            <Col sm={1} className='pr0 mt7'>
                                                <RSTooltip
                                                    position="top"
                                                    text={ind >= 0 ? 'Remove' : 'Add'}
                                                    className={`lh0`}
                                                >
                                                    <i
                                                        onClick={() => {
                                                            remove(ind);
                                                        }}
                                                        className={`${circle_minus_fill_medium} icon-md color-primary-red `}
                                                    ></i>
                                                </RSTooltip>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </div>
                        ) : (
                            <HorizontalSkeleton isError={true} />
                        )}
                    </div>
                ) : (
                    <div className='mt10'>
                        <RSInput
                            control={control}
                            label="Full profile information"
                            name={`${name}Values.total`}
                            handleOnBlur={() => handlePurchasePatternGradingTotal(getAllValues, setValue)}
                        />
                    </div>
                )}
            </div>
        </Col>
    );
};

export default PurchasePatternComponent;
