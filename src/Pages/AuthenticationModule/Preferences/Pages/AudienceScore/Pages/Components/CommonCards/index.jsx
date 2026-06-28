import { circle_minus_fill_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { DUPLICATE_VALUE, ENTER_VALID_DATA, SELECT_ACTION, SHOULD_BE_LESS } from 'Constants/GlobalConstant/ValidationMessage';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';

import { setFlag } from 'Reducers/preferences/audienceScore/reducer';
import { audienceScoreCommonCardTotalScoreValidation } from 'Utils/HookFormValidate';
import RSTooltip from 'Components/RSTooltip';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';

const CommonCard = ({ constants, headName, head, title, tooltip, cardicons, filpData, extraClass, allChannel }) => {
    const { audienceCardCollapse } = useSelector((state) => state.audienceScoreReducer);
    const dispatch = useDispatch();
    const {
        control,
        reset,
        getValues,
        setValue,
        watch,
        trigger,
        formState: { isValid },
    } = useFormContext();
    const [flgas, setFlags] = useState(audienceCardCollapse[headName + 'Collapse']);

    useEffect(() => {
        reset();
        dispatch(setFlag({ headName, value: flgas }));
    }, [flgas]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: headName,
    });
    const cardWatch = useWatch({
        control,
        name: headName,
    });

    const removeMore = (index) => {
        remove(index);
    };
    const addCards = (index) => {
        let validationState = -1;
        if (Object.keys(cardWatch)?.length > 0) {
            validationState = Object.values(cardWatch).findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });
        } else {
            validationState = -1;
        }
        if (validationState === -1) {
            append({ key: '', value: '' });
        } else {
            trigger(`${headName}[${validationState}]`);
        }
    };

    useEffect(() => {
        if (allChannel?.length > 0) {
            const filteredChannel = allChannel.find(
                (item) => item?.campaignSegment?.toLowerCase() === headName?.toLowerCase(),
            );
            const segmentRuleData = filteredChannel?.campaignSegmentRule;

            setValue(`${headName}.Total`, filteredChannel?.responseScore);

            Object.entries(segmentRuleData)?.forEach(([key, value]) => {
                switch (true) {
                    case key.toLowerCase().startsWith('p'):
                        setValue(`${headName}[0].value`, value);
                        break;
                    case key.toLowerCase().startsWith('neg'):
                        setValue(`${headName}[1].value`, value);
                        break;
                    case key.toLowerCase().startsWith('neu'):
                        setValue(`${headName}[2].value`, value);
                        break;
                    default:
                        break;
                }
            });
        }
    }, [allChannel]);

    // console.log(fields, 'fields');
    return (
        <>
            <Col sm={6}>
                {fields?.length > 0 ? (
                    <>
                        <Row className="m0">
                            <Col className="pl0">{head || ''}</Col>
                            {true && (
                                <Col className="">
                                    <RSInput control={control} name={`${headName}.Total`} />
                                    <div className="mb10 position-relative">
                                        <RSTooltip text={tooltip}>
                                            <i
                                                onClick={() => {
                                                    setFlags(!flgas);
                                                }}
                                                title={title || ''}
                                                className={`${cardicons} icon-md color-primary-blue`}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                </Col>
                            )}
                        </Row>
                        <div className="box-design p10 no-box-shadow">
                            <div className="pref-as-card-wrapper">
                                {!flgas ? (
                                    <>
                                        <Row className="m0 mb14">
                                            <Col className="pl0">
                                                {headName === 'dataArguments' ? 'By data' : 'By channel'}
                                            </Col>
                                            {headName === 'networkWorth' && <div className="pacr-column">Network</div>}
                                            <div className="">
                                                {/* <div>Score</div> */}
                                                {/* <RSTooltip position="top" text="Add" className="lh0">
                                            <i
                                                onClick={() => {
                                                    addCards(headName);
                                                }}
                                                className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                                            ></i>
                                        </RSTooltip> */}
                                            </div>
                                        </Row>
                                        {/* {map((ele, index) => { */}
                                        {allChannel?.length > 0 && fields?.length > 0 ? (
                                            <div className="pacrw-content-list">
                                                {fields?.map((field, index) => {
                                                    return (
                                                        <Row
                                                            className={`m0 ${extraClass ?? ''}`}
                                                            key={field?.id ?? field?.SentimentKeyId ?? `${headName}-${index}`}
                                                        >
                                                            <Col
                                                                className="pl0"
                                                                sm={headName === 'networkWorth' ? 3 : 6}
                                                            >
                                                                {/* <RSKendoDropDownList
                                                        name={`${headName}[${index}].key`}
                                                        control={control}
                                                        required
                                                        data={constants}
                                                        textField={'lable'}
                                                        label={'Select'}
                                                        handleChange={(e) => {
                                                        }}
                                                        rules={{
                                                            required: SELECT_ACTION,
                                                            validate: () => {
                                                                const [status, _] = findDuplicates(cardWatch, 'key');
                                                                return status ? DUPLICATE_VALUE : true;
                                                            },
                                                        }}
                                                    /> */}

                                                                <p key={field?.SentimentKeyId}>
                                                                    {field?.SentimentKeyName}
                                                                </p>
                                                            </Col>
                                                            {headName === 'networkWorth' && (
                                                                <>
                                                                    <Col sm={2}>above</Col>
                                                                    <Col sm={3} className="pl0">
                                                                        <RSInput
                                                                            control={control}
                                                                            required
                                                                            name={`${headName}[${index}]Above`}
                                                                            rules={{
                                                                                required: ENTER_VALID_DATA,
                                                                            }}
                                                                        />
                                                                    </Col>
                                                                </>
                                                            )}
                                                            <Col
                                                                sm={headName === 'networkWorth' ? 4 : 6}
                                                                className="pl10 pr0"
                                                            >
                                                                <RSInput
                                                                    control={control}
                                                                    required
                                                                    rules={{
                                                                        required: ENTER_VALID_DATA,
                                                                        validate: (value) => {
                                                                            return audienceScoreCommonCardTotalScoreValidation(
                                                                                headName,
                                                                                getValues,
                                                                                value,
                                                                            );
                                                                        },
                                                                    }}
                                                                    defaultValue={0}
                                                                    onKeyDown={
                                                                        onlyNumbersDecimalWithoutSpecialCharacters
                                                                    }
                                                                    // name={`${name}[${ele.name}]`}
                                                                    name={`${headName}[${index}].value`}
                                                                    handleOnBlur={() => {
                                                                        let totalValue = [];
                                                                        for (var i = 0; i < 3; i++) {
                                                                            const headNamesValue = getValues(headName);
                                                                            totalValue.push(headNamesValue[i]);
                                                                        }
                                                                        let total = totalValue?.reduce(
                                                                            (accumulator, currentValue) => {
                                                                                return (
                                                                                    Number(accumulator) +
                                                                                    Number(currentValue.value)
                                                                                );
                                                                            },
                                                                            0,
                                                                        );
                                                                        setValue(`${headName}.Total`, total);
                                                                    }}
                                                                />
                                                            </Col>
                                                            {/* <div className="mt3">
                                                <RSTooltip position="top" text="Remove" className="lh0">
                                                    <i
                                                        onClick={() => {
                                                            removeMore(index);
                                                        }}
                                                        className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                    ></i>
                                                </RSTooltip>
                                            </div> */}
                                                        </Row>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <HorizontalSkeleton isError={true} />
                                        )}
                                    </>
                                ) : (
                                    <RSInput
                                        control={control}
                                        name={`${headName}overAll`}
                                        required
                                        placeholder={filpData}
                                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                        rules={{
                                            required: ENTER_VALID_DATA,
                                            validate: (value) => (Number(value) <= 100 ? true : SHOULD_BE_LESS),
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <HorizontalSkeleton isError={true} />
                )}
            </Col>
        </>
    );
};

export default CommonCard;
