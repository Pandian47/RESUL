import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_minus_fill_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';

import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { updateName } from '../../ProfileData/constant';
import { handleProfileDataGradingTotal } from '../constants';

const ProfileDataCard = ({ name, head, profileData, dropDownData, title, cardicons, isWorth, keyMapping }) => {
    // console.log('dropDownData: ', dropDownData);
    // console.log('profileData: ', profileData);
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
        name: `${name}Profile`,
    });

    const totalData = useWatch({
        control,
        name: `${name}Profile`,
    });
    // console.log('totalData: ', totalData);

    const getAllValues = getValues();

    const [showFullDetail, setShowFullDetail] = useState(true);

    const addMore = () => {
        // debugger;
        if (totalData?.length) {
            const fieldCheck = isWorth ? ['type', 'score', 'aboveValue'] : ['type', 'score'];
            const fieldStatus = fieldCheck
                ?.map((field) => {
                    if (!totalData[totalData?.length - 1][field]) {
                        return true;
                    } else {
                        return false;
                    }
                })
                ?.every((status) => status === false);
            const erorrStatus = errors[`${name}Profile`];
            // console.log('erorrStatus: ', erorrStatus);
            // console.log('fieldStatus: ', fieldStatus);

            if (fieldStatus && !erorrStatus) {
                append({
                    type: '',
                    score: '',
                    isCreate: true,
                });
            } else {
                trigger(`${name}Profile`);
            }
        } else {
            append({
                type: '',
                score: '',
                isCreate: true,
            });
        }
    };

    const handleOnBlur = () => {
        const totalValues = getValues(`${name}Profile`)?.reduce((accumulator, currentValue) => {
            return Number(accumulator) + Number(currentValue.score);
        }, 0);
        setValue(`${name}Profile[Total]`, totalValues);
        handleProfileDataGradingTotal(getAllValues, setValue);
    };

    const handleDuplicateValue = (name, ind) => {
        let totalData = getValues(`${name}Profile`);

        const seen = new Set();
        const duplicates = totalData?.filter((item) => {
            const key = `${item.type?.[keyMapping?.textField]}`;
            if (seen.has(key)) {
                return true;
            }
            seen.add(key);
            return false;
        });

        return duplicates;
    };

    const handleToggle = () => {
        setShowFullDetail(!showFullDetail);
    };

    const handleBindData = (data) => {
        const modifiedData = data?.dataSegmentRule?.map((item, index) => {
            const filterDropData = dropDownData?.find(
                (drop) => updateName(drop[keyMapping?.textField]) === updateName(item[keyMapping?.campareId]),
            );
            if (!isWorth) {
                return {
                    type: !filterDropData ? '' : filterDropData,
                    score: item?.Score,
                    isCreate: item?.IsCreate ?? false,
                };
            } else {
                return {
                    type: !filterDropData ? '' : filterDropData,
                    score: item?.Score,
                    aboveValue: item?.network ?? 0,
                    isCreate: item?.IsCreate ?? false,
                };
            }
        });

        if (modifiedData?.length) {
            reset((formState) => ({
                ...formState,
                [`${name}Profile`]: modifiedData,
            }));
        }
    };

    useEffect(() => {
        if (profileData?.dataSegmentRule?.length) {
            handleBindData(profileData);
            setShowFullDetail(true);
        } else {
            setShowFullDetail(false);
        }
    }, [profileData?.dataSegmentRule]);

    useEffect(() => {
        setValue(`${name}Profile[Total]`, profileData?.dataSegmentScore ?? 0);
    }, [profileData?.dataSegmentScore]);

    useEffect(() => {
        if (!showFullDetail) {
            handleBindData(profileData);
        }
        setValue(`${name}Profile[Total]`, profileData?.dataSegmentScore ?? 0);
        setValue(`${name}ToggleValue`, showFullDetail);
    }, [showFullDetail]);

    return (
        <Col sm={6}>
            <Row className="m0">
                <Col sm={7} className="pl0 mb5">
                    <div>{head}</div>
                </Col>
                <Col sm={4} className="pr0 mb10">
                    <RSInput control={control} name={`${name}Profile[Total]`} className="click-off" />
                </Col>
                <Col sm={1} className="text-right mt7">
                    <RSTooltip position="top" text="Add" className="lh0">
                        <i
                            className={`${cardicons} icon-md color-primary-blue `}
                            onClick={handleToggle}
                            id="rs_data_circle_plus_fill"
                        ></i>
                    </RSTooltip>
                </Col>
            </Row>

            <div className="box-design p10 mb30 no-box-shadow">
                {showFullDetail ? (
                    <div className="pref-as-card-wrapper">
                        <Row className="m0 mb10">
                            <Col md={isWorth ? 5 : 8} className="pl0">
                                {title}
                            </Col>
                            {isWorth && <Col md={4}>{'Network'}</Col>}
                            <Col md={isWorth ? 2 : 3} className="pl10">
                                {'score'}
                            </Col>
                            <Col md={1} className="pl10 pr0">
                                {
                                    <RSTooltip position="top" text="Add" className="lh0">
                                        <i
                                            onClick={() => {
                                                addMore();
                                            }}
                                            className={`${circle_plus_fill_medium}  icon-md color-primary-blue  ${
                                                errors?.[`${name}Profile`] && errors?.[`${name}Profile`]?.length
                                                    ? 'click-off'
                                                    : ''
                                            }`}
                                            id="rs_data_circle_plus_fill"
                                        ></i>
                                    </RSTooltip>
                                }
                            </Col>
                        </Row>
                        {fields?.length ? (
                            <div className="pacrw-content-list">
                                {fields.map((ele, ind) => {
                                    return (
                                        <Row className="m0" key={ele?.id}>
                                            <Col sm={isWorth ? 5 : 8} className="pl0">
                                                <div className="">
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        name={`${name}Profile[${ind}].type`}
                                                        data={dropDownData}
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
                                                        textField={keyMapping?.textField}
                                                        dataItemKey={keyMapping?.dataItemKey}
                                                        required
                                                        // defaultValue={communicationData[ind]}
                                                    />
                                                </div>
                                            </Col>
                                            {isWorth && (
                                                <Col sm={4}>
                                                    <div className="d-flex">
                                                        <span className="mr15">above</span>
                                                        <RSInput
                                                            control={control}
                                                            name={`${name}Profile[${ind}].aboveValue`}
                                                            rules={{
                                                                required: ENTER_VALID_DATA,
                                                                validate: (value) => {
                                                                    if (Number(value) === 0) {
                                                                        return ENTER_VALID_DATA;
                                                                    }
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                </Col>
                                            )}
                                            <Col sm={isWorth ? 2 : 3} className="pr0 ">
                                                <RSInput
                                                    control={control}
                                                    rules={{
                                                        required: ENTER_VALID_DATA,
                                                    }}
                                                    required
                                                    name={`${name}Profile[${ind}].score`}
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
                            <HorizontalSkeleton isError={true} />
                        )}
                    </div>
                ) : (
                    <div className="mt15">
                        <RSInput
                            control={control}
                            name={`${name}Profile[Total]`}
                            placeholder={'Full profile information'}
                        />
                    </div>
                )}
            </div>
        </Col>
    );
};

export default ProfileDataCard;
