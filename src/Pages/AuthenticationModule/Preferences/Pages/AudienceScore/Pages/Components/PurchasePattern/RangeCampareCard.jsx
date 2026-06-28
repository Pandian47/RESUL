import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_minus_fill_medium, circle_plus_fill_medium, social_communication_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';

import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { sortDataByFromTo } from '../../PurchasePattern/constant';
import {
    getErrorMessage,
    getInitialValue,
    GRADE,
    handlePurchasePatternGradingTotal,
    handleSegmentRule,
} from '../constants';

const RangeCampareCard = ({
    name,
    purchasePatternData,
    head,
    title,
    DurationData,
    isGrading = false,
    isWorth = false,
}) => {
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
    const { fields, append, remove, insert } = useFieldArray({
        control,
        name: `${name}Values`,
    });

    const allValues = useWatch({
        control,
        name: `${name}Values`,
    });

    const getAllValues = getValues();

    const totalValues = getValues(`${name}Values`);

    const [showFullDetail, setShowFullDetail] = useState(true);

    const addMore = (type) => {
        let totalData = totalValues;
        if (totalData?.length) {
            const fieldCheck = ['from', 'to', 'score'];
            const fieldStatus = fieldCheck
                ?.map((field) => {
                    if (!totalData[totalData?.length === 2 ? totalData?.length - 1 : totalData?.length - 2][field]) {
                        return true;
                    } else {
                        return false;
                    }
                })
                ?.every((status) => status === false);
            const erorrStatus = errors[`${name}Values`];
            if (fieldStatus && !erorrStatus) {
                insert(fields?.length - 1, {
                    from: '',
                    score: '',
                    to: '',
                    isCreate: true,
                });
            } else {
                trigger(`${name}Values`);
            }
        } else {
            const initialReplaceValues = getInitialValue(isWorth, isGrading);
            reset((formstate) => ({
                ...formstate,
                [`${name}Values`]: initialReplaceValues,
            }));
        }
    };

    const handleCampareValue = (type, ind) => {
        // only  validate inner fields flow exist in  [ 0 index , last index]
        if (ind !== 0 && fields?.length - 1 !== ind) {
            if (totalValues?.length) {
                const value = totalValues.filter((value) => typeof value === 'object');
                if (type === 'from') {
                    if (value[ind - 1] && value[ind]) {
                        const previousInputToValue = Number(value[ind - 1]['to']);
                        const currentInputFromValue = Number(value[ind][type]);
                        const nextInputToValue = Number(value[ind + 1]['to']);
                        if (!isGrading) {
                            // frequency , worth  "current from value" campare to  "before  input value"
                            const previousToValue = Number(value[ind - 1]?.to);
                            const currentFromValue = Number(value[ind]?.from);
                            if (currentFromValue < previousToValue) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            const checkCurrInputBelowValue = currentInputFromValue > nextInputToValue;
                            //grading last index "before from value" to campare to "next to value"
                            if (ind === value?.length - 2) {
                                if (!checkCurrInputBelowValue) {
                                    setError(`${name}Values[${ind + 1}].to`, {
                                        type: 'custom',
                                        message: `Enter  greater value`,
                                    });
                                    return false;
                                } else {
                                    clearErrors(`${name}Values[${ind + 1}].to`);
                                    return false;
                                }
                            } else {
                                //grading last index "before from value" to campare to "prevoius to value"
                                if (currentInputFromValue > previousInputToValue) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                } else {
                    // check 'more than' value to compare  previous 'to' value [worth , frequency]
                    if (ind === value?.length - 2 && !isGrading) {
                        const currentFromValue = Number(value[ind]?.from);
                        const currentToValue = Number(value[ind]?.to);
                        const nextToValue = Number(value[value?.length - 1]?.to);
                        // const checkValueStatus = isGrading
                        //     ? currentToValue > currentFromValue
                        //     : currentToValue > currentFromValue;

                        const checkValueStatus = currentToValue > currentFromValue;
                        const checkMoreTovalue = isGrading
                            ? currentToValue > nextToValue
                            : currentToValue < nextToValue;
                        if (!checkValueStatus) {
                            return true;
                        } else {
                            if (!isGrading) {
                                // worth , frequency flow to campare "current to" value "next to" value
                                if (!checkMoreTovalue) {
                                    setError(`${name}Values[${ind + 1}].to`, {
                                        type: 'custom',
                                        message: `Enter  ${isGrading ? 'lesser' : 'greater'} value`,
                                    });
                                    return false;
                                } else {
                                    clearErrors(`${name}Values[${ind + 1}].to`);
                                    return false;
                                }
                            }
                        }
                    } else {
                        if (isGrading && ind === 1 && type === 'to') {
                            const currentToValue = Number(value[ind]?.to);
                            const previousToValue = Number(value[ind - 1]?.to);
                            const currentFromValue = Number(value[ind]?.from);

                            if (currentToValue < currentFromValue) {
                                return true;
                            } else if (currentToValue > previousToValue) {
                                setError(`${name}Values[${ind - 1}].to`, {
                                    type: 'custom',
                                    message: `Enter  ${'greater'} value`,
                                });
                                return false;
                            } else {
                                clearErrors(`${name}Values[${ind - 1}].to`);
                                return false;
                            }
                        } else {
                            if (isGrading) {
                                // grading flow to campare "current to" value "previuos from" value
                                const prevoiusFromValue = Number(value[ind - 1]?.from);
                                const currentToValue = Number(value[ind]?.to);
                                if (currentToValue > prevoiusFromValue) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                // worth , frequency flow to campare "current to" value "current from" value
                                const currentFromValue = Number(value[ind]?.from);
                                const currentToValue = Number(value[ind]?.to);
                                // const checkValueStatus = isGrading
                                //     ? currentToValue < currentFromValue
                                //     : currentToValue < currentFromValue;
                                const checkValueStatus = currentToValue < currentFromValue;
                                if (checkValueStatus) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            // Only check first index and the last index
            const value = totalValues.filter((value) => typeof value === 'object');
            if (ind === 0 && type === 'to') {
                const nextInputFrom = value[ind + 1]?.from;
                const nextInputFromValue = Number(value[ind + 1]?.from);
                const nextInputToValue = Number(value[ind + 1]?.to);
                const currentInputValue = Number(value[ind]?.to);
                //only Above and below '2 row' contains flow  check value
                if (nextInputFrom === 'More than' || nextInputFrom === 'Below' || nextInputFrom === 'Above') {
                    if (nextInputToValue) {
                        const checkValueStatus = isGrading
                            ? currentInputValue < nextInputToValue
                            : currentInputValue > nextInputToValue;
                        if (checkValueStatus) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else {
                    const checkValueStatus = isGrading
                        ? currentInputValue < nextInputFromValue
                        : currentInputValue > nextInputFromValue;
                    if (checkValueStatus) {
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                // last index to value check flow
                if (type === 'to') {
                    const previousInputToValue = Number(value[totalValues?.length - 2]?.to);
                    const previousInputFromValue = Number(value[totalValues?.length - 2]?.from);
                    const previousInputFrom = value[totalValues?.length - 2]?.from;
                    const currentInputValue = Number(value[ind]?.to);
                    if (isGrading) {
                        //only Above and below row contains flow  check value
                        if (previousInputFrom === 'Above') {
                            const checkValueStatus = currentInputValue > previousInputToValue;
                            if (checkValueStatus) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            const checkValueStatus = currentInputValue > previousInputFromValue;
                            if (checkValueStatus) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    } else {
                        const checkValueStatus = currentInputValue < previousInputToValue;
                        if (checkValueStatus) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }
        }
    };

    const handleOnBlur = () => {
        if (!isGrading) {
            const updateTotalValues =
                totalValues?.length &&
                totalValues?.reduce((accumulator, currentValue) => {
                    return Number(accumulator) + Number(currentValue.score);
                }, 0);
            setValue(`${name}Values.total`, updateTotalValues);
        } else {
            handlePurchasePatternGradingTotal(getAllValues, setValue);
        }
    };

    const handleToggle = () => {
        setShowFullDetail(!showFullDetail);
    };

    const handleDuplicateValue = () => {
        const seenScores = new Set();
        const duplicates = totalValues?.filter((item) => {
            if (seenScores.has(item.score)) {
                return true;
            }
            seenScores.add(item.score);
            return false;
        });
        return duplicates;
    };

    useEffect(() => {
        if (purchasePatternData?.patternSegmentRule?.length) {
            const updateValue = handleSegmentRule(purchasePatternData?.patternSegmentRule);
            if (updateValue?.length) {
                const finalValue = sortDataByFromTo(updateValue, isGrading);
                reset((formstate) => ({
                    ...formstate,
                    [`${name}Values`]: finalValue,
                }));
                setValue(`${name}Values.duration`, purchasePatternData?.periodRange);
                handleOnBlur();
                setShowFullDetail(true);
            }
        } else {
            !isGrading ? setShowFullDetail(false) : setShowFullDetail(true);
        }
    }, [purchasePatternData?.patternSegmentRule]);

    useEffect(() => {
        setValue(`${name}Values.total`, purchasePatternData?.patternSegmentScore);
        handlePurchasePatternGradingTotal(getAllValues, setValue);
    }, [purchasePatternData?.patternSegmentScore]);

    useEffect(() => {
        // toggle icon reset initial Value
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
            <Row className= {`m0 ${isGrading ? 'pb6' : ''}`}>
                <Col sm={7} className="pl0">
                    <div className="mb5">{head}</div>
                </Col>
                <Col sm={!isGrading ? 4 : 5} className="pr0">
                    <div className="click-off">
                        <RSInput
                            control={control}
                            name={`${name}Values.total`}
                            handleOnBlur={() => handlePurchasePatternGradingTotal(getAllValues, setValue)}
                            rules={{
                                validate: (value) => {
                                    if (!isGrading) {
                                        const updateValue = Number(value);
                                        if (updateValue === 0) {
                                            return ' Enter  valid value';
                                        } else if (updateValue > 500) {
                                            return 'less than 500';
                                        }
                                    }
                                },
                            }}
                        />
                    </div>
                </Col>
                {!isGrading && (
                    <Col sm={1} className="text-right mt7">
                        <div onClick={handleToggle}>
                            <RSTooltip text="Channel wise">
                                <i className={`${social_communication_medium} icon-md color-primary-blue`}></i>
                            </RSTooltip>
                        </div>
                    </Col>
                )}
            </Row>
            <div className="box-design p10 pt13 mb30 no-box-shadow">
                {showFullDetail ? (
                    <div className="pref-as-card-wrapper">
                        <div className="pacrw-content-head">
                            <Row className="m0 mb10">
                                <Col sm={3} className="pl0">
                                    <div className="">{title}</div>
                                </Col>
                                <Col sm={4} className="mt-5">
                                    <div className={`${fields?.length === 0 ? 'click-off' : ''}`}>
                                        {!isGrading && (
                                            <RSKendoDropDownList
                                                control={control}
                                                name={`${name}Values.duration`}
                                                data={DurationData}
                                                required
                                                rules={{
                                                    required: 'Select',
                                                }}
                                                // defaultValue={communicationData[ind]}
                                            />
                                        )}
                                    </div>
                                </Col>
                                <Col sm={4}>
                                    <div className="">
                                        <span>Score</span>
                                    </div>
                                </Col>
                                <Col className="pl10 pr0" sm={1}>
                                    <div>
                                        {isGrading ? (
                                            !purchasePatternData?.patternSegmentRule?.length ? (
                                                <RSTooltip position="top" text="Add" className="lh0">
                                                    <i
                                                        onClick={() => {
                                                            addMore();
                                                        }}
                                                        className={`${
                                                            circle_plus_fill_medium
                                                        }  icon-md color-primary-blue ${
                                                            fields?.length >= 5 ? 'click-off' : ''
                                                        } `}
                                                        id="rs_data_circle_plus_fill"
                                                    ></i>
                                                </RSTooltip>
                                            ) : null
                                        ) : (
                                            <RSTooltip position="top" text="Add" className="lh0">
                                                <i
                                                    onClick={() => {
                                                        addMore();
                                                    }}
                                                    className={`${
                                                        circle_plus_fill_medium
                                                    }  icon-md color-primary-blue ${
                                                        fields?.length >= 5 ? 'click-off' : ''
                                                    } `}
                                                    id="rs_data_circle_plus_fill"
                                                ></i>
                                            </RSTooltip>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        {fields?.length ? (
                            <div className="pacrw-content-list">
                                {fields.map((ele, ind) => {
                                    return (
                                        <Row key={ele?.id} className="m0">
                                            <Col
                                                sm={3}
                                                className={`${
                                                    ind === 0 || fields?.length - 1 === ind ? 'click-off' : ''
                                                } pl0 mt-1`}
                                            >
                                                <RSInput
                                                    control={control}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            if (Number(value) === 0) {
                                                                return ENTER_VALID_DATA;
                                                            }
                                                            if (handleCampareValue('from', ind)) {
                                                                return `Enter ${
                                                                    isGrading ? 'lesser' : 'greater'
                                                                }  value`;
                                                            }
                                                        },
                                                    }}
                                                    required
                                                    name={`${name}Values[${ind}].from`}
                                                    // handleOnBlur={() => handleOnBlur('from', ind)}
                                                    // defaultValue={setValue(`${name}[${ind}].value`, ele?.value)}
                                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                />
                                            </Col>
                                            <Col sm={4} className='mt-1'>
                                                <RSInput
                                                    control={control}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            if (Number(value) === 0) {
                                                                return ENTER_VALID_DATA;
                                                            }
                                                            if (handleCampareValue('to', ind)) {
                                                                return getErrorMessage(isGrading, totalValues, ind);
                                                            }
                                                        },
                                                    }}
                                                    required
                                                    name={`${name}Values[${ind}].to`}
                                                    // handleOnBlur={() => handleOnBlur('to', ind)}
                                                    // defaultValue={setValue(`${name}[${ind}].value`, ele?.value)}
                                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                />
                                            </Col>
                                            <Col sm={4} className={`${isGrading ? 'mt-2' : 'mt-1'}`}>
                                                {!isGrading ? (
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
                                                ) : (
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        name={`${name}Values[${ind}].score`}
                                                        data={GRADE}
                                                        // defaultValue={ele}
                                                        handleChange={(e) => {
                                                            // setValue(`${name}Values[${ind}].value`, e.target.value.value);
                                                            // handleDropdownChange(e, ind);
                                                        }}
                                                        required
                                                        rules={{
                                                            required: 'select',
                                                            validate: (value) => {
                                                                const checkDuplicateValue = handleDuplicateValue()[0];
                                                                if (
                                                                    handleDuplicateValue()?.length &&
                                                                    value === checkDuplicateValue?.score
                                                                ) {
                                                                    return 'Duplicate';
                                                                } else {
                                                                    clearErrors(`${name}Values[${ind}].score`);
                                                                }
                                                            },
                                                        }}
                                                        // label={'Select'}
                                                        // defaultValue={communicationData[ind]}
                                                    />
                                                )}
                                            </Col>
                                       <Col sm={1} className={`pr0 mt7 ${(!isGrading && (ind === 0 || fields?.length - 1 === ind)) || (isGrading && (purchasePatternData?.patternSegmentRule?.length || ind === 0 || fields?.length - 1 === ind)) ? 'pt24' : ''}`}>                                                {!isGrading
                                                    ? ind !== 0 &&
                                                      fields?.length - 1 !== ind && (
                                                          <RSTooltip
                                                              position="top"
                                                              text={ind >= 0 ? 'Remove' : 'Add'}
                                                              className={`lh0`}
                                                          >
                                                              <i
                                                                  onClick={() => {
                                                                      // clearError
                                                                      remove(ind);
                                                                  }}
                                                                  className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                              ></i>
                                                          </RSTooltip>
                                                      )
                                                    : !purchasePatternData?.patternSegmentRule?.length &&
                                                      ind !== 0 &&
                                                      fields?.length - 1 !== ind && (
                                                          <RSTooltip
                                                              position="top"
                                                              text={ind >= 0 ? 'Remove' : 'Add'}
                                                              className={`lh0`}
                                                          >
                                                              <i
                                                                  onClick={() => {
                                                                      // clearError
                                                                      remove(ind);
                                                                  }}
                                                                  className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                              ></i>
                                                          </RSTooltip>
                                                      )}
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
                    <div className="mt10">
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

export default RangeCampareCard;
