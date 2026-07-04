import { truncateTitle } from 'Utils/modules/displayCore';
import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_minus_fill_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import RSTooltip from 'Components/RSTooltip';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { asAudienceScoreList } from '../constants';


const LadderingCardEmpty = () => (
    <Col sm={6}>
        <div className="box-design p10 mb30 no-box-shadow">
            <HorizontalSkeleton isError={true} />
        </div>
    </Col>
);

const LadderingCardForm = ({ constants, name, status, dropdownlist, ladderKeys }) => {
    const safeDropdownlist = asAudienceScoreList(dropdownlist);
    const safeLadderKeys = asAudienceScoreList(ladderKeys);
    const [ladderCardData, setLadderCardData] = useState([]);
    const [addCardData, setAddCardData] = useState(true);
    const {
        control,
        trigger,
        setError,
        clearErrors,
        reset,
        setValue,
        formState: { errors },
        getValues,
    } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${name}.arrayValues`,
    });
    const audienceLadderWatch = useWatch({
        control,
        name: name,
    });

    const addMoreLadder = (name) => {
        let checkDuplicate = Object.values(audienceLadderWatch).map((e) => e?.key?.LadderingKeyName);
        let validationState = -1;
        let checkEmptyValue;
        if (Object.keys(audienceLadderWatch)?.length > 0) {
            validationState = Object.values(audienceLadderWatch).findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });
            const emptyStatus = Object.values(audienceLadderWatch)
                ?.flat()
                ?.every((item) => item.value);
            if (emptyStatus) {
                checkEmptyValue = false;
            } else {
                checkEmptyValue = true;
            }
        } else {
            validationState = -1;
            checkEmptyValue = false;
        }

        const checkErrorStatus = errors[`${name}`];

        if (validationState === -1 && !checkEmptyValue && !checkErrorStatus) {
            append({ key: '', value: '' });
            // setValue(name, {
            //     ...audienceLadderWatch,
            //     ['']: {
            //         condition: 'above',
            //         value: '',
            //     },
            // });
        } else {
            trigger(`${name}`);
        }
    };
    const removeMore = (index) => {
        remove(index);
        setAddCardData(true);
    };
    const handleDuplicate = () => {
        const arrayValues = audienceLadderWatch?.arrayValues;
        if (!Array.isArray(arrayValues)) {
            return [];
        }

        const seenKeys = new Set();
        const duplicates = [];

        arrayValues.forEach((item) => {
            const key = item?.key?.LadderingKeyName;
            if (!key) return;
            if (seenKeys.has(key)) {
                duplicates.push(item);
            } else {
                seenKeys.add(key);
            }
        });

        return duplicates;
    };
    // useEffect(() => {
    //     let temp = audienceLadderWatch?.arrayValues;
    //     // let temp = map((e, indx) => {
    //     //     return {
    //     //         [e.key]: {
    //     //             sentiment: e.sentiment,
    //     //             condition: e.condition,
    //     //             value: e.value,
    //     //         },
    //     //     };
    //     // });
    //     // console.log(temp, 'temp');
    //     // setLadderCardData({ name: temp });
    //     if (temp !== undefined && Object.keys(temp)?.length > 0) {
    //         let tempObj = {
    //             ...audienceLadderWatch,
    //             [temp?.key]: temp?.value,
    //         };
    //         setValue(name, tempObj);
    //     }
    // }, [fields]);
    // console.log('ladderCardData::', audienceLadderWatch, fields);
    return (
        <Col sm={6}>
            <div className="box-design p10 mb30 no-box-shadow">
                <div className="pref-as-card-wrapper">
                    <Row className="m0">
                        <Col sm={11} className="pl0 mb5">
                            <div>{name}</div>
                        </Col>
                        <Col sm={1} className="pr0 mb10">
                            <RSTooltip position="top" text="Add" className={`${errors[`${name}`] ? 'click-off' : ''}`}>
                                <i
                                    onClick={() => {
                                        addMoreLadder(name);
                                    }}
                                    className={`${circle_plus_fill_medium} ${
                                        addCardData ? '' : 'click-off'
                                    } icon-md color-primary-blue`}
                                    id="rs_data_circle_plus_fill"
                                ></i>
                            </RSTooltip>
                        </Col>
                    </Row>
                    {fields?.length > 1 && (
                        <div className="pacrw-content-list">
                            {fields?.map((ele, ind) => {
                                return (
                                    <Row className="m0" key={ind}>
                                        <Col sm={4} className="pl0 pr0">
                                            {ele.key?.length < 20 ? (
                                                <span>{ele.key}</span>
                                            ) : (
                                                <RSTooltip text={ele.key} position="top">
                                                    <span>{truncateTitle(ele.key, 15)}</span>
                                                </RSTooltip>
                                            )}
                                        </Col>
                                        <Col sm={3} className="pr0 ">
                                            {ele.sentiment !== '' && (
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={`${name}[${ele.key}].sentiment`}
                                                    textField={'SentimentKeyName'}
                                                    dataItemKey={'SentimentKeyId'}
                                                    data={safeDropdownlist}
                                                    required
                                                    defaultValue={safeDropdownlist[0]}
                                                    // rules={{
                                                    //     required: ENTER_VALID_DATA,
                                                    // }}
                                                />
                                            )}
                                        </Col>
                                        {typeof ele?.value === 'string' ? (
                                            <>
                                                <Col sm={2} className="pr0">
                                                    <RSInput
                                                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                        control={control}
                                                        name={`${name}[${ele.key}].value`}
                                                        defaultValue={ele?.value.split(':')[0]}
                                                        required
                                                        // rules={{
                                                        //     required: ENTER_VALID_DATA,
                                                        // }}
                                                    />
                                                </Col>
                                                <Col sm={1}>to</Col>
                                                <Col sm={2} className="pr0">
                                                    <RSInput
                                                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                        control={control}
                                                        name={`${name}[${ele.key}].valueTwo`}
                                                        defaultValue={ele?.value.split(':')[1]}
                                                        required
                                                        // rules={{
                                                        //     required: ENTER_VALID_DATA,
                                                        // }}
                                                    />
                                                </Col>
                                            </>
                                        ) : (
                                            <>
                                                <Col sm={3} className="pr0">
                                                    {/* <label name={`${name}[${ele.key}].condition`}>{ele?.condition}</label> */}
                                                    {/* {!Array.isArray(status) ? status : status[ind]} */}
                                                    <RSInput
                                                        control={control}
                                                        defaultValue={ele?.condition}
                                                        disabled={true}
                                                        // required
                                                        name={`${name}[${ele.key}].condition`}
                                                    />
                                                </Col>
                                                <Col sm={2} className="pr0">
                                                    <RSInput
                                                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                        control={control}
                                                        name={`${name}[${ele.key}].value`}
                                                        defaultValue={ele?.value}
                                                        required
                                                        rules={{
                                                            required: ENTER_VALID_DATA,
                                                        }}
                                                    />
                                                </Col>
                                            </>
                                        )}
                                    </Row>
                                );
                            })}
                        </div>
                    )}
                    {name ? (
                        <>
                            <div className="pacrw-content-list odd">
                                {fields.map((field, index) => {
                                    return (
                                        <Row className="m0" key={index}>
                                            <Col sm={4} className="pl0">
                                                <div className="">
                                                    <RSKendoDropDownList
                                                        name={`${name}.arrayValues[${index}].key`}
                                                        control={control}
                                                        required
                                                        data={safeLadderKeys}
                                                        textField={'LadderingKeyName'}
                                                        // dataItemKey={'LadderingKeyId'}
                                                        label={'Select'}
                                                        defaultValue={safeLadderKeys[0]}
                                                        rules={{
                                                            required: 'Select',
                                                            validate: (value) => {
                                                                const duplicateValue = handleDuplicate();
                                                                if (
                                                                    duplicateValue?.length &&
                                                                    value?.LadderingKeyName ===
                                                                        duplicateValue[0]?.key?.LadderingKeyName
                                                                ) {
                                                                    return 'Duplicate';
                                                                } else {
                                                                    const duplicate = getValues(`${name}.arrayValues`);
                                                                    duplicate?.forEach((value, ind) => {
                                                                        clearErrors(`${name}.arrayValues[${ind}].key`);
                                                                    });
                                                                }
                                                            },
                                                        }}
                                                        handleChange={({ value }) => {
                                                            // let checkDuplicate = Object.keys(audienceLadderWatch);
                                                        }}
                                                    />
                                                </div>
                                            </Col>
                                            <Col sm={3} className="pr0">
                                                <RSInput
                                                    control={control}
                                                    defaultValue={'above'}
                                                    disabled={true}
                                                    // required
                                                    name={`${name}.arrayValues[${index}].condition`}
                                                />
                                            </Col>
                                            <Col sm={4} className="pr0">
                                                <RSInput
                                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                    control={control}
                                                    name={`${name}.arrayValues[${index}].value`}
                                                    placeholder={'Enter value'}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            if (Number(value) === 0) return ENTER_VALID_DATA;
                                                        },
                                                    }}
                                                    required
                                                    handleOnBlur={({ target: { value } }) => {
                                                        if (parseFloat(value) > 99 || parseFloat(value) === 0) {
                                                            setError(`${name}.arrayValues[${index}].value`, {
                                                                type: 'required',
                                                                message: 'Values shoule be 0.1-99',
                                                            });
                                                            setAddCardData(false);
                                                        }
                                                    }}
                                                    handleOnchange={(e) => {
                                                        setAddCardData(true);
                                                        clearErrors(`${name}.arrayValues[${index}].value`);
                                                    }}
                                                />
                                            </Col>
                                            <Col sm={1} className="pr0 mt7 text-right">
                                                <RSTooltip position="top" text="Remove" className="lh0 d-inline-block">
                                                    <i
                                                        onClick={() => {
                                                            removeMore(index);
                                                        }}
                                                        className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                        id="rs_data_circle_minus_fill_edge"
                                                    ></i>
                                                </RSTooltip>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <HorizontalSkeleton isError={true} />
                    )}
                </div>
            </div>
        </Col>
    );
};

const LadderingCard = (props) => {
    if (!props?.name) {
        return <LadderingCardEmpty />;
    }
    return <LadderingCardForm {...props} />;
};

export default LadderingCard;
