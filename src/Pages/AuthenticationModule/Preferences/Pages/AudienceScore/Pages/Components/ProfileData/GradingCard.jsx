import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { SCORE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect } from 'react';
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
    handleProfileDataGradingTotal,
    handleSegmentRule,
} from '../constants';
const GradingCard = ({ name, gradingData, head, title, DurationData, isGrading = false, isWorth = false }) => {
    
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
        name: `${name}Profile`,
    });

    const allValues = useWatch({
        control,
        name: `${name}Profile`,
    });

    const getAllValues = getValues();

    const totalValues = getValues(`${name}Profile`);

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
            const erorrStatus = errors[`${name}Profile`];
            if (fieldStatus && !erorrStatus) {
                insert(fields?.length - 1, {
                    from: '',
                    score: '',
                    to: '',
                    isCreate: true,
                });
            } else {
                trigger(`${name}Profile`);
            }
        } else {
            const initialReplaceValues = getInitialValue(isWorth, isGrading);
            reset((formstate) => ({
                ...formstate,
                [`${name}Profile`]: initialReplaceValues,
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
                                    setError(`${name}Profile[${ind + 1}].to`, {
                                        type: 'custom',
                                        message: `Enter  greater value`,
                                    });
                                    return false;
                                } else {
                                    clearErrors(`${name}Profile[${ind + 1}].to`);
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
                        const checkValueStatus = isGrading
                            ? currentToValue > currentFromValue
                            : currentToValue > currentFromValue;
                        const checkMoreTovalue = isGrading
                            ? currentToValue > nextToValue
                            : currentToValue < nextToValue;
                        if (!checkValueStatus) {
                            return true;
                        } else {
                            if (!isGrading) {
                                // worth , frequency flow to campare "current to" value "next to" value
                                if (!checkMoreTovalue) {
                                    setError(`${name}Profile[${ind + 1}].to`, {
                                        type: 'custom',
                                        message: `Enter  ${isGrading ? 'lesser' : 'greater'} value`,
                                    });
                                    return false;
                                } else {
                                    clearErrors(`${name}Profile[${ind + 1}].to`);
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
                                setError(`${name}Profile[${ind - 1}].to`, {
                                    type: 'custom',
                                    message: `Enter  ${'greater'} value`,
                                });
                                return false;
                            } else {
                                clearErrors(`${name}Profile[${ind - 1}].to`);
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
            setValue(`${name}Profile.total`, updateTotalValues);
        } else {
            handleProfileDataGradingTotal(getAllValues, setValue);
        }
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
        if (gradingData?.dataSegmentRule?.length) {
            const updateValue = handleSegmentRule(gradingData?.dataSegmentRule);
            if (updateValue?.length) {
                const finalValue = sortDataByFromTo(updateValue, isGrading);
                reset((formstate) => ({
                    ...formstate,
                    [`${name}Profile`]: finalValue,
                }));
                setValue(`${name}Profile.duration`, gradingData?.periodRange);
                handleOnBlur();
            }
        }
        handleProfileDataGradingTotal(getAllValues, setValue);
    }, [gradingData?.dataSegmentRule]);

    useEffect(() => {
        setValue(`${name}ToggleValue`, true);
        setValue(`${name}Profile.total`, gradingData?.dataSegmentScore);
        handleProfileDataGradingTotal(getAllValues, setValue);
    }, [gradingData?.dataSegmentScore]);

    return (
        <Col sm={6}>
            <Row className="m0">
                <Col sm={7} className="pl0 mb5">
                    <div>{head}</div>
                </Col>
                <Col sm={5} className="pr0 mb10">
                    <div className="click-off">
                        <RSInput
                            control={control}
                            name={`${name}Profile.total`}
                            handleOnBlur={() => handleProfileDataGradingTotal(getAllValues, setValue)}
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
            </Row>
            <div className="box-design p10 mb30 no-box-shadow">
                <div className="pref-as-card-wrapper">
                    <div className="">
                        <Row className="m0">
                            <Col sm={8} className='pl0'>
                                <div className="pacr-column">{title}</div>

                                {!isGrading && (
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`${name}Profile.duration`}
                                        data={DurationData}
                                        required
                                        rules={{
                                            required: 'Select',
                                        }}
                                        // defaultValue={communicationData[ind]}
                                    />
                                )}
                            </Col>
                            <Col sm={3} className='pl10'>
                                <div className="pacr-column">
                                    <span>{SCORE}</span>
                                </div>
                               
                            </Col>
                            <Col sm={1} className='pl10'>
                            <div>
                                    {isGrading ? (
                                        !gradingData?.dataSegmentRule?.length ? (
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
                                            sm={5}
                                            className={`${
                                                ind === 0 || fields?.length - 1 === ind ? 'click-off' : ''
                                            } pl0`}
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
                                                            return `Enter ${isGrading ? 'lesser' : 'greater'}  value`;
                                                        }
                                                    },
                                                }}
                                                placeholder={'Data'}
                                                required
                                                name={`${name}Profile[${ind}].from`}
                                                // handleOnBlur={() => handleOnBlur('from', ind)}
                                                // defaultValue={setValue(`${name}[${ind}].value`, ele?.value)}
                                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                            />
                                        </Col>
                                        <Col sm={3}>
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
                                                placeholder={'Data'}
                                                name={`${name}Profile[${ind}].to`}
                                                // handleOnBlur={() => handleOnBlur('to', ind)}
                                                // defaultValue={setValue(`${name}[${ind}].value`, ele?.value)}
                                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                            />
                                        </Col>
                                        <Col sm={3} className="pr0">
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
                                                    placeholder={'Data'}
                                                    required
                                                    name={`${name}Profile[${ind}].score`}
                                                    handleOnBlur={handleOnBlur}
                                                    // defaultValue={setValue(`${name}[${ind}].value`, ele?.value)}
                                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                />
                                            ) : (
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={`${name}Profile[${ind}].score`}
                                                    data={GRADE}
                                                    // defaultValue={ele}
                                                    handleChange={(e) => {
                                                        // setValue(`${name}Profile[${ind}].value`, e.target.value.value);
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
                                                                clearErrors(`${name}Profile[${ind}].score`);
                                                            }
                                                        },
                                                    }}
                                                    label={'Select'}
                                                    // defaultValue={communicationData[ind]}
                                                />
                                            )}
                                        </Col>
                                        <Col sm={1} className='pr0'>
                                            {!isGrading
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
                                                : !gradingData?.dataSegmentRule?.length &&
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
            </div>
        </Col>
    );
};

export default GradingCard;
