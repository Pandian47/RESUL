import { selectIcon } from 'Utils/modules/display';
import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA, SHOULD_BE_LESS } from 'Constants/GlobalConstant/ValidationMessage';
import { social_communication_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { setFlag } from 'Reducers/preferences/audienceScore/reducer';
import { audienceScoreCompareCardTotalScoreValidation, audienceScoreCompareValidator } from 'Utils/HookFormValidate';

import { FREQUENCY_AMOUNT, FREQUENCY_TIME } from '../constants';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import RSTooltip from 'Components/RSTooltip';

const CompareCard = ({ name, head, title, lessLabel, moreLabel, constants, periodkeys, allChannel }) => {
    const { audienceCardCollapse } = useSelector((state) => state.audienceScoreReducer);
    const dispatch = useDispatch();

    const { control, setValue, getValues, trigger, reset, setError, watch } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: name,
    });

    const [flags, setFlags] = useState(audienceCardCollapse[name + 'Collapse']);
    const [isAddMoreEnable, setIsAddMoreEnable] = useState(0);
    const moreValue = watch(`${name}[0].more`);
    const lessValue = watch(`${name}[0].less`);

    const overAllScore = () => {
        let total = getValues(name).reduce((a, b) => Number(a) + Number(b.score), 0);
        const [less, more] = getValues([`${name}betweenData.lessScore`, `${name}betweenData.moreScore`]);
        return total + Number(less) + Number(more) || 0;
    };

    const addMore = (index) => {
        if (overAllScore() === 100) {
            // setError(`${name}[${index}].score`, {
            //     type: 'manual',
            //     message: 'Overall score fulfilled',
            // });
        } else {
            if (index === 0) {
                append({ less: '', more: '', score: '' });
            } else {
                remove(index);
            }
        }
    };

    useEffect(() => {
        reset();
        dispatch(setFlag({ name, value: flags }));
    }, [flags]);

    useEffect(() => {
        const campaignSegmentRule = constants?.campaignSegmentRule;
        setValue(`${name}betweenData.lessScore`, campaignSegmentRule?.['Once']);
        setValue(`${name}betweenData.moreScore`, campaignSegmentRule?.['More than,5']);
        setValue(`${name}[0].score`, campaignSegmentRule?.['2,5']);
        setValue(`${name}priority`, periodkeys?.length > 0 && periodkeys[0]);
        setValue(`${name}betweenData.lessValue`, 1);
        setValue(`${name}betweenData.moreValue`, 5);
        if (campaignSegmentRule) {
            const regex = /^\d+,\d+$/;
            const keyValues = Object?.keys(campaignSegmentRule)?.filter((item) => regex.test(item))[0];
            const splitValue = keyValues?.split(',');
            setValue(`${name}[0].less`, splitValue[0]);
            setValue(`${name}[0].more`, splitValue[1]);
        }
    }, [constants, allChannel, name, periodkeys, setValue]);

    // useEffect(() => {
    //     if (constants) {
    //         debugger;
    //         const campaignSegmentRule = campaignSegmentRule;
    //         setValue(`${name}priority`, periodkeys[0]);
    //         //         setValue(`${name}betweenData.lessValue`, 1);
    //         //         setValue(`${name}betweenData.moreValue`, 5);
    //         if (campaignSegmentRule) {
    //             setValue(`${name}betweenData.lessValue`, 1);
    //                     setValue(`${name}betweenData.moreValue`, 5);
    //             const onceValue = campaignSegmentRule['Once'];
    //             const moreThanFiveValue = campaignSegmentRule['More than,5'];
    //             const specificValue = campaignSegmentRule['2,5'];

    //             if (onceValue && moreThanFiveValue && specificValue) {
    //                 setValue(name + '[0].less', onceValue);
    //                 setValue(name + '[0].more', moreThanFiveValue);
    //                 setValue(name + '[0].score', specificValue);
    //             }
    //         }
    //     }
    // }, [constants, name]);

    useEffect(() => {
        if (allChannel?.length > 0 && head && name) {
            const filteredChannel = allChannel.find(
                (item) => item?.campaignSegment?.toLowerCase() === head?.replace(/\s+/g, '')?.toLowerCase(),
            );
            setValue(`${name}Total`, filteredChannel?.responseScore);
        }
    }, [allChannel, head, name]);

    useEffect(() => {
        setIsAddMoreEnable(Number(moreValue) + Number(lessValue));
    }, [moreValue, lessValue]);

    return (
        <Col sm={6}>
            <Row className="m0">
                {/* <div className="pacr-row pacrw-heading"> */}
                <Col sm={7} className="pl0 mb5">
                    {head || ''}
                </Col>
                {true && (
                    // <div className="pacr-column flex-right">
                    <>
                        <Col sm={4} className="pr0 mb10">
                            <RSInput control={control} name={`${name}Total`} />
                        </Col>
                        <Col sm={1} className="text-right mt7">
                            <RSTooltip position="top" className="d-inline-flex" text="Channel wise">
                                <i
                                    onClick={() => setFlags(!flags)}
                                    title={title || ''}
                                    className={`${social_communication_medium} icon-md color-primary-blue`}
                                ></i>
                            </RSTooltip>
                        </Col>
                    </>
                    // </div>
                )}
                {/* </div> */}
            </Row>
            <div className="box-design p10 mb30 no-box-shadow">
                <div className="pref-as-card-wrapper">
                    <Row className="m0 mb10">
                        <Col md={3} className="pl0">
                            Times
                        </Col>
                        <Col md={4} className="">
                            <RSKendoDropDownList
                                control={control}
                                name={`${name}priority`}
                                data={name === 'purchaseWorth' ? FREQUENCY_AMOUNT : periodkeys ?? FREQUENCY_TIME}
                                // label="Priority"
                                defaultValue={
                                    name === 'purchaseWorth'
                                        ? FREQUENCY_AMOUNT[0]
                                        : periodkeys
                                        ? periodkeys[0]
                                        : FREQUENCY_TIME[0]
                                }
                            />
                        </Col>
                        <Col md={3} className="pl10">
                            Score
                        </Col>
                    </Row>
                    {!flags ? (
                        <Fragment>
                            {constants ? (
                                <>
                                    <Row className="m0 py19 px10">
                                        <Col className="pl0" sm={3}>
                                            <div className="">{lessLabel}</div>
                                        </Col>
                                        <Col className="" sm={4}>
                                            <RSInput
                                                rules={{
                                                    required: ENTER_VALID_DATA,
                                                }}
                                                disabled={true}
                                                control={control}
                                                name={`${name}betweenData.lessValue`}
                                            />
                                        </Col>
                                        <Col className="" sm={4}>
                                            <RSInput
                                                rules={{
                                                    required: ENTER_VALID_DATA,
                                                }}
                                                control={control}
                                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                name={`${name}betweenData.lessScore`}
                                                handleOnBlur={() => {
                                                    const overAllValue = overAllScore();
                                                    if (overAllValue <= 100) setValue(`${name}Total`, overAllValue);
                                                }}
                                            />
                                        </Col>
                                    </Row>

                                    <div className="pacrw-content-list">
                                        {fields.map((_, index) => {
                                            return (
                                                <Row className="m0" key={`${name}[${index}]`}>
                                                    <Col sm={3} className="pl0">
                                                        <RSInput
                                                            control={control}
                                                            rules={{
                                                                required: ENTER_VALID_DATA,
                                                                validate: (value) => {
                                                                    return audienceScoreCompareValidator(
                                                                        value,
                                                                        index,
                                                                        name,
                                                                        getValues,
                                                                        'less',
                                                                    );
                                                                },
                                                            }}
                                                            name={`${name}[${index}].less`}
                                                            onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                        />
                                                    </Col>
                                                    <Col sm={4} className="">
                                                        <RSInput
                                                            control={control}
                                                            rules={{
                                                                required: ENTER_VALID_DATA,
                                                                validate: (value) => {
                                                                    return audienceScoreCompareValidator(
                                                                        value,
                                                                        index,
                                                                        name,
                                                                        getValues,
                                                                    );
                                                                },
                                                            }}
                                                            name={`${name}[${index}].more`}
                                                            onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                        />
                                                    </Col>
                                                    <Col sm={4} className="pr5">
                                                        <RSInput
                                                            control={control}
                                                            rules={{
                                                                required: ENTER_VALID_DATA,
                                                                validate: (value) =>
                                                                    audienceScoreCompareCardTotalScoreValidation(
                                                                        name,
                                                                        getValues,
                                                                        value,
                                                                    ),
                                                            }}
                                                            name={`${name}[${index}].score`}
                                                            onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                            handleOnBlur={() => {
                                                                const overAllValue = overAllScore();
                                                                if (overAllValue <= 100)
                                                                    setValue(`${name}Total`, overAllValue);
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={1}  className='pt7'>
                                                        <i
                                                            onClick={() => {
                                                                let scoreValid =
                                                                    audienceScoreCompareCardTotalScoreValidation(
                                                                        name,
                                                                        getValues,
                                                                    );
                                                                if (scoreValid === true) addMore(index);
                                                            }}
                                                            className={`${selectIcon(index)} icon-md cp  ${
                                                                (fields?.length > 4 && index == 0) || isAddMoreEnable > 5
                                                                    ? 'click-off'
                                                                    : ''
                                                            }`}
                                                        ></i>
                                                    </Col>
                                                </Row>
                                            );
                                        })}
                                    </div>
                                    <div className="">
                                        <Row className="m0 py19 px10">
                                            <Col sm={3} className="pl0">
                                                {moreLabel}
                                            </Col>
                                            <Col sm={4}>
                                                <RSInput
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                    }}
                                                    disabled={true}
                                                    control={control}
                                                    name={`${name}betweenData.moreValue`}
                                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                />
                                            </Col>
                                            <Col sm={4}>
                                                <RSInput
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                    }}
                                                    control={control}
                                                    name={`${name}betweenData.moreScore`}
                                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                                    handleOnBlur={() => {
                                                        const overAllValue = overAllScore();
                                                        if (overAllValue <= 100) setValue(`${name}Total`, overAllValue);
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </>
                            ) : (
                                <HorizontalSkeleton isError={true} />
                            )}
                        </Fragment>
                    ) : (
                        <RSInput
                            rules={{
                                required: ENTER_VALID_DATA,
                                validate: (value) => (Number(value) <= 100 ? true : SHOULD_BE_LESS),
                            }}
                            control={control}
                            name={`${name}overAll`}
                            onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                        />
                    )}
                </div>
            </div>
        </Col>
    );
};

export default CompareCard;
