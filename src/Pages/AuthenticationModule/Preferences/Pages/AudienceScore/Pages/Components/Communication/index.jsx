import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_minus_fill_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { slice } from 'Utils/modules/lodashReplacements';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';

import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { asAudienceScoreList } from '../constants';

const CommunicaitionCard = ({ constants, name, head, allChannel, dropDownData, isLoading = false }) => {
    const safeConstants = asAudienceScoreList(constants);
    const safeAllChannel = asAudienceScoreList(allChannel);
    const safeDropDownData = asAudienceScoreList(dropDownData);
    const {
        control,
        trigger,
        getValues,
        setError,
        setValue,
        reset,
        formState: { errors },
    } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${name}Values`,
    });

    useEffect(() => {
        let temp;
        temp = slice(safeConstants, 0, 3);
        if (name === 'CampaingDetails') {
            const filteredChannel = safeAllChannel.find((item) => item?.campaignSegment === name);
            if (filteredChannel?.campaignSegmentRule) {
                const campaignSegmentRuleData = Object.keys(filteredChannel.campaignSegmentRule);
                temp = slice(safeConstants, 0, campaignSegmentRuleData?.length);
            }
        }
        reset((prev) => ({
            ...prev,
            [`${name}Values`]: temp,
        }));
    }, [safeConstants, safeAllChannel, name, reset]);

    useEffect(() => {
        if (safeAllChannel.length > 0) {
            const filteredChannel = safeAllChannel.find((item) => item?.campaignSegment === head);
            setValue(`${name}Values[Total]`, filteredChannel?.responseScore);
        }
        if (name === 'CampaingDetails') {
            const filteredChannel = safeAllChannel.find((item) => item?.campaignSegment === name);
            if (filteredChannel?.campaignSegmentRule) {
                setValue(`${name}Values[0].value`, filteredChannel?.campaignSegmentRule['1']);
                setValue(`${name}Values[1].value`, filteredChannel?.campaignSegmentRule['2']);
                setValue(`${name}Values[Total]`, filteredChannel?.responseScore);
            }
        }
    }, [safeAllChannel, name, head, setValue]);

    const addMore = () => {
        let val = getValues(`${name}Values`);
        if (val?.length !== 0 && val?.[val?.length - 1][`${name}Values`] == '') trigger(name);
        else append({ title: '', value: '' });
    };

    const handleDropdownChange = (e, ind) => {
        const currentValues = getValues(`${name}Values`)?.map((item) => item?.title);

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
                    } else {
            setError(`${name}Values[${ind}]`, {
                type: 'custom',
                message: '',
            });
            setValue(`${name}Values[${ind}].value`, null);
        }
    };

    const handleOnBlur = () => {
        const totalValues = getValues(`${name}Values`)?.reduce((accumulator, currentValue) => {
            return Number(accumulator) + Number(currentValue?.value ?? 0);
        }, 0);
        setValue(`${name}Values[Total]`, totalValues);
    };

    const handleDuplicateValue = (name, ind) => {
        let totalData = getValues(`${name}Values`);
        const seen = new Set();
        const duplicates = totalData?.filter((item, index) => {
            const key = `${item.title}`;
            if (seen.has(key)) {
                return true;
            }
            seen.add(key);
            return false;
        });
        return duplicates;
    };

    const isHydratingRows = safeAllChannel.length > 0 && safeConstants.length > 0 && !fields?.length;
    const isPendingContent = isLoading || isHydratingRows;

    return (
        <Col sm={6}>
            <div className="box-design  p10 mb30 no-box-shadow">
                <div className="pref-as-card-wrapper">
                    <Row className="m0">
                        <Col sm={7} className="pl0 mb5">
                            <div className="pacr-column">{head}</div>
                        </Col>
                        <Col sm={4} className="pr0 mb10">
                            <div className="pacr-column flex-right">
                                <RSInput control={control} name={`${name}Values[Total]`} />
                            </div>
                        </Col>
                        <Col sm={1} className="text-right mt7 pl10">
                            <div>
                                {
                                    <RSTooltip position="top" text="Add" className="lh0">
                                        <i
                                            onClick={() => {
                                                addMore();
                                            }}
                                            className={`${circle_plus_fill_medium} ${
                                                safeAllChannel.length > 0 && fields?.length > 0 ? '' : 'click-off'
                                            } icon-md color-primary-blue  ${
                                                errors?.[`${name}Values`] && errors?.[`${name}Values`]?.length
                                                    ? 'click-off'
                                                    : ''
                                            }`}
                                            id="rs_data_circle_plus_fill"
                                        ></i>
                                    </RSTooltip>
                                }
                            </div>
                        </Col>
                    </Row>
                    {safeAllChannel.length > 0 && fields?.length > 0 ? (
                        <div className="pacrw-content-list">
                            {fields.map((ele, ind) => {
                                return (
                                    <Row className="m0" key={ele?.id}>
                                        <Col sm={7} className="pl0">
                                            <div className="">
                                                <RSKendoDropDownList
                                                    control={control}
                                                    name={`${name}Values[${ind}]`}
                                                    data={safeDropDownData}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                        validate: (value) => {
                                                            if (handleDuplicateValue(name, ind)?.length) {
                                                                return 'Duplicate';
                                                            } else {
                                                                return true;
                                                            }
                                                        },
                                                    }}
                                                    defaultValue={ele}
                                                    label={'Select'}
                                                    textField={'title'}
                                                    dataItemKey={'id'}
                                                    handleChange={(e) => {
                                                        // setValue(`${name}Values[${ind}].value`, e.target.value.value);
                                                        handleDropdownChange(e, ind);
                                                    }}
                                                    required
                                                    // defaultValue={communicationData[ind]}
                                                />
                                            </div>
                                        </Col>
                                        <Col sm={4} className="pr0 ">
                                            <RSInput
                                                control={control}
                                                rules={{
                                                    required: ENTER_VALID_DATA,
                                                }}
                                                required
                                                name={`${name}Values[${ind}].value`}
                                                handleOnBlur={handleOnBlur}
                                                // defaultValue={setValue(`${name}[${ind}].value`, ele?.value)}
                                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                            />
                                        </Col>
                                        <Col sm={1} className="pr0 mt7">
                                            <RSTooltip
                                                position="top"
                                                text={ind >= 0 ? 'Remove' : 'Add'}
                                                className={`lh0`}
                                            >
                                                <i
                                                    onClick={() => {
                                                        remove(ind);
                                                    }}
                                                    className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                ></i>
                                            </RSTooltip>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </div>
                    ) : (
                        <HorizontalSkeleton isError={!isPendingContent} />
                    )}
                </div>
            </div>
        </Col>
    );
};

export default CommunicaitionCard;
