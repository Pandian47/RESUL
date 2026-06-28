import { numberWithCommas, parseFormattedNumber } from 'Utils/modules/formatters';
import { getUserCurrentFormat, standardizeDateFormat } from 'Utils/modules/dateTime';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { MAX_LENGTH8, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { COUNT_EXCEEDS_POTENTIAL_AUDIENCE, ENTER_BASE_VOLUME, ENTER_INCREMENTAL, ENTER_VALID_VOLUME_PER_DAY } from 'Constants/GlobalConstant/ValidationMessage';
import { AGREE_TARGET_AUDIENCE, AUDIENCE_COUNT, AUDIENCE_COUNT_LABLE, BASE_VOLUME, BY_DAY, CANCEL, CLICK_HERE, INCREMENT, LIMIT_AUDIENCE, LIST_CONTROL, ONE_TIME, POTENTIAL_AUDIENCE, RESET, SCHEDULE_EXCEEDS_END_DATE, SELECT, SELECT_THIS_OPTION, SELECT_THIS_OPTION_TO_SET, SUBMIT, VOLUME_PER_DAY } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_right_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSModal from 'Components/RSModal';

import { handleClickOff, VOLUME_TYPE_DATA } from '../../constant';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { saveLimitList } from 'Reducers/communication/createCommunication/execute/request';
import useQueryParams from 'Hooks/useQueryParams';
import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';

const LimitListModal = ({
    show,
    handleClose,
    setSplitDate,
    setShowLimitList,
    tab,
    countValue,
    setCountValue,
    isDelete,
}) => {
    //console.log("countval",countValue)
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const state = useQueryParams('/communication');
    const dispatch = useDispatch();
    const {
        control,
        watch,
        setValue,
        reset,
        resetField,
        clearErrors,
        setError,
        formState: { isValid, errors, isDirty },
    } = useFormContext();
    const [
        limitAudience,
        limitCount,
        volumePerDay,
        volumeType,
        baseVolume,
        volumePercentage,
        potentialAudience,
        limitListDate,
        limitCountAgree,
    ] = watch([
        `${tab}.limitAudience`,
        `${tab}.limitCount`,
        `${tab}.volumePerDay`,
        `${tab}.volumeType`,
        `${tab}.baseVolume`,
        `${tab}.volumePercentage`,
        `${tab}.potentialAudience`,
        `${tab}.limitListDate`,
        `${tab}.limitCountAgree`,
    ]);
    const [clickButton, setClickButton] = useState(false);
    const [agreeToggle, setAgreeToggle] = useState(false);
    const [isEnableSumbitBtn, setIsEnableSumbitBtn] = useState(true);
    const [isSavingLimitList, setIsSavingLimitList] = useState(false);
    const [endDate, setEndDate] = useState();
    const { channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const value = channelDetails?.[tab]?.contentDetail?.listquality;
    const potentialTotal =
        parseFormattedNumber(value?.potentialTarget) + parseFormattedNumber(value?.miniListCount);
    const channelId = channelDetails?.[tab]?.channelId;

    useEffect(() => {
        if (limitAudience === 'By day' && limitListDate === '' || !isValid) {
            setClickButton(false);
        }else{
            setClickButton(true);
        }
        setSplitDate(limitListDate);
    }, [limitListDate, isValid]);
    const getLastFormattedDate = (audienceTimeData = []) => {
        const lastDateStr = audienceTimeData?.[audienceTimeData.length - 1]?.date;
        const parsedInput = standardizeDateFormat(lastDateStr);
        const validDate = typeof parsedInput === 'string' ? new Date(parsedInput) : parsedInput;
        return !isNaN(validDate) ? getUserCurrentFormat(validDate)?.dateFormat : null;
    };
    const calculateEndDate = () => {
        var currentDate = new Date(channelDetails?.[tab]?.contentDetail?.content?.[0]?.scheduleDate);
        let result = '';
        if (volumeType === 'Equal') {
            //debugger
            const limit = potentialTotal;
            let audienceTimeData = [];
            let totalVolume = 0;
            const currVolumePerDay = parseFormattedNumber(volumePerDay);
            let currentDateCopy = new Date(currentDate);
            while (totalVolume < limit) {
                let nextVolume = currVolumePerDay;
                if (totalVolume + nextVolume > limit) {
                    nextVolume = limit - totalVolume;
                }
                audienceTimeData.push({
                    day: audienceTimeData?.length + 1,
                    // date: dateFormat(currentDateCopy),
                    date: getUserCurrentFormat(currentDateCopy)?.dateFormat,
                    audienceCount: nextVolume,
                });
                totalVolume += nextVolume;
                if (totalVolume >= limit) {
                    break;
                }
                currentDateCopy.setDate(currentDateCopy.getDate() + 1);
            }
            const daysRequired = Math.ceil(limit / currVolumePerDay);
            result = currentDate.setDate(currentDate.getDate() + daysRequired - 1);
            if (daysRequired >= 1) {
                if (
                    new Date(result).getDate() === new Date(state?.endDate).getDate() &&
                    new Date(result).getMonth() === new Date(state?.endDate).getMonth() &&
                    new Date(result).getFullYear() === new Date(state?.endDate).getFullYear()
                ) {
                    // setValue(`${tab}.limitListDate`, `${volumePerDay} per day, till ${dateFormat(new Date(result))}`);
                    setValue(`${tab}.limitListDate`, `${volumePerDay} per day, till ${getUserCurrentFormat(new Date(result))?.dateFormat}`);
                    setValue(`${tab}.audienceTimeData`, audienceTimeData);
                    // setEndDate(dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date)));
                    // return dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date));
                    const formattedDate = getLastFormattedDate(audienceTimeData);
                    setEndDate(formattedDate);
                    return formattedDate;
                                        // setEndDate(
                                        //     getUserCurrentFormat(
                                        //         new Date(audienceTimeData[audienceTimeData?.length - 1].date),
                                        //     )?.dateFormat,
                                        // );
                                        // return getUserCurrentFormat(
                                        //     new Date(audienceTimeData[audienceTimeData?.length - 1].date),
                                        // )?.dateFormat;
                } else if (new Date(result) <= new Date(state?.endDate)) {
                    // setValue(`${tab}.limitListDate`, `${volumePerDay} per day, till ${dateFormat(new Date(result))}`);
                    setValue(`${tab}.limitListDate`, `${volumePerDay} per day, till ${getUserCurrentFormat(new Date(result))?.dateFormat}`);
                    setValue(`${tab}.audienceTimeData`, audienceTimeData);
                    // setEndDate(dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date)));
                    // return dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date));
                    // console.log(
                    //     getUserCurrentFormat(formattedDate)?.dateFormat,
                    //     'DDD',
                    //     formattedDate,
                    //     'formattedDate',
                    //     parseDate(lastDateStr),
                    //     'lastDateStr',
                    //     lastDateStr,
                    // );
                   const formattedDate = getLastFormattedDate(audienceTimeData);
                   setEndDate(formattedDate);
                   return formattedDate;
                    //       setEndDate(getUserCurrentFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date))?.dateFormat);
                    // return getUserCurrentFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date))?.dateFormat;
                } else {
                    setValue(`${tab}.limitListDate`, '');
                    setError(`${tab}.volumePerDay`, {
                        type: 'custom',
                        message: SCHEDULE_EXCEEDS_END_DATE,
                    });
                }
            } else {
                setValue(`${tab}.limitListDate`, '');
                setError(`${tab}.volumePerDay`, {
                    type: 'custom',
                    message: SCHEDULE_EXCEEDS_END_DATE,
                });
            }
        } else {
            let audienceTimeData = [];
            const parsedBaseVolume = parseFormattedNumber(baseVolume);
            var addedValues = [parsedBaseVolume];
            let limit = potentialTotal;
            let audienceVolume = parsedBaseVolume;
            let incrementPercentage = parseFormattedNumber(volumePercentage);
            let endDate = new Date(state?.endDate);
            let currentDateCopy = new Date(currentDate);
            let totalVolume = 0;
            while (totalVolume < limit) {
                if (
                    currentDateCopy > endDate
                ) {
                    setError(`${tab}.baseVolume`, {
                        type: 'custom',
                        message: SCHEDULE_EXCEEDS_END_DATE,
                    });
                    setValue(`${tab}.limitListDate`, '');
                    break;
                }

                let nextVolume = audienceVolume;
                if (totalVolume + nextVolume > limit) {
                    nextVolume = limit - totalVolume;
                }

                audienceTimeData.push({
                    day: audienceTimeData?.length + 1,
                    // date: dateFormat(currentDateCopy),
                    date: getUserCurrentFormat(currentDateCopy)?.dateFormat,
                    audienceCount: nextVolume,
                });

                totalVolume += nextVolume;

                if (totalVolume >= limit) {
                    break;
                }

                let addedVolume = Math.round(audienceVolume * (incrementPercentage / 100));
                addedValues.push(audienceVolume + addedVolume);
                audienceVolume += addedVolume;

                currentDateCopy.setDate(currentDateCopy.getDate() + 1);
            }

            if (totalVolume > limit) {
                let lastEntry = audienceTimeData[audienceTimeData?.length - 1];
                lastEntry.audienceCount -= totalVolume - limit;
                addedValues[addedValues?.length - 1] -= totalVolume - limit;
                totalVolume = limit;
            }

            if (
                new Date(currentDateCopy).getDate() === new Date(endDate).getDate() &&
                new Date(currentDateCopy).getMonth() === new Date(endDate).getMonth() &&
                new Date(currentDateCopy).getFullYear() === new Date(endDate).getFullYear()
            ) {
                setValue(
                    `${tab}.limitListDate`,
                    `${volumePercentage}%, till ${audienceTimeData[audienceTimeData?.length - 1].date}`,
                );
                setValue(`${tab}.audienceTimeData`, audienceTimeData);
                // setEndDate(dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date)));
                // return dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date));
                const formattedDate = getLastFormattedDate(audienceTimeData);
                setEndDate(formattedDate);
                return formattedDate;
                //    setEndDate(
                //        getUserCurrentFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date))?.dateFormat,
                //    );
                //    return getUserCurrentFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date))
                //        ?.dateFormat;
            } else if (currentDateCopy <= endDate) {
                if (volumePercentage <= 100) {
                    setValue(
                        `${tab}.limitListDate`,
                        `${volumePercentage}%, till ${audienceTimeData[audienceTimeData?.length - 1].date}`,
                    );
                }
                setValue(`${tab}.audienceTimeData`, audienceTimeData);
                // setEndDate(dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date)));
                // return dateFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date));
                const formattedDate = getLastFormattedDate(audienceTimeData);
                setEndDate(formattedDate);
                return formattedDate;
                                // setEndDate(
                                //     getUserCurrentFormat(new Date(audienceTimeData[audienceTimeData?.length - 1].date))
                                //         ?.dateFormat,
                                // );
                                // return getUserCurrentFormat(
                                //     new Date(audienceTimeData[audienceTimeData?.length - 1].date),
                                // )?.dateFormat;
            }
        }
    };
    const submitHandler = async () => {
        setIsSavingLimitList(true);
        let splitValueType = volumeType === 'Equal' ? 'E' : 'I';
        let baseVolumeByDay =
            volumeType === 'Equal'
                ? parseFormattedNumber(volumePerDay)
                : parseFormattedNumber(baseVolume);
        let isLimitAudienceOneTime = limitAudience === 'One time';
        // const endDateStr = calculateEndDate(); // e.g., "16-07-2025"
        // const parsedEndDate = standardizeDateFormat(calculateEndDate()); // parseDate → returns valid Date
        // const scrubEndDate = !isNaN(parsedEndDate) ? parsedEndDate : null;

        const payload = {
            clientId,
            departmentId,
            userId,
            limitListDomain: {
                campaignId: state?.campaignId,
                channelId: channelId,
                miniListCount: isLimitAudienceOneTime ? parseFormattedNumber(limitCount) : 0,
                minilistAccept: isLimitAudienceOneTime ? limitCountAgree : false,
                limitAudienceType: isLimitAudienceOneTime ? 1 : 2,
                splitValueType: isLimitAudienceOneTime ? '' : splitValueType,
                baseVolume: isLimitAudienceOneTime ? 0 : baseVolumeByDay,
                incrementalPercentage: isLimitAudienceOneTime ? 0 : volumePercentage,
                // scrubEndDate: isLimitAudienceOneTime ? '' : getYYMMDD(calculateEndDate()),
                scrubEndDate: isLimitAudienceOneTime ? '' : standardizeDateFormat(calculateEndDate()),
            },
        };
        try {
            const res = await dispatch(saveLimitList(payload));
            if (res?.status) {
                if (limitAudience === 'One time') {
                    setValue(
                        `${tab}.potentialAudience`,
                        parseFormattedNumber(value?.potentialTarget) - parseFormattedNumber(limitCount),
                    );
                } else {
                    setCountValue({
                        volume: volumePerDay,
                        baseVolume: baseVolume,
                        incremental: volumePercentage,
                    });
                    setSplitDate(limitListDate);
                }
                setShowLimitList(true);

                handleClose();
            } else {
                handleClose();
                handleReset();
            }
        } finally {
            setIsSavingLimitList(false);
        }
    };

    const handleReset = () => {
        //debugger
        reset((prev) => ({
            ...prev,
            [tab]: {
                ...prev[tab], 
                limitAudience: '',
                limitCountAgree: false,
                audienceTimeData: [],
                potentialAudience,
                limitCount: '',
                volumeType: '',
                volumePerDay: '',
                baseVolume: '',
                volumePercentage: '',
                limitListDate: ''
            },
        }));
    };

    return (
        <div>
            <RSModal
                show={show}
                isLoading={isSavingLimitList}
                isCloseDisabled={isSavingLimitList}
                handleClose={() => {
                    handleReset();
                    handleClose();
                }}
                header={LIST_CONTROL}
                // headerText={<span>Potential Audience : {numberWithCommas(value?.potentialTarget)}</span>}
                body={
                    <>
                         <h4 className="text-right mb30">
                            {POTENTIAL_AUDIENCE}: <span className="font-bold font-md ml5">{potentialTotal}</span>
                        </h4>
                        <>
                            <Row>
                                <Col sm={3}>
                                    <label className='fs19'>{LIMIT_AUDIENCE}</label>
                                </Col>
                                <Col sm={9} className='popup-checkbox-label'>
                                    <Row>
                                        <Col sm={3} className={`d-flex align-items-center ${limitAudience ? 'click-off' : ''}`}>
                                            <RSRadioButton
                                                name={`${tab}.limitAudience`}
                                                control={control}
                                                labelName={ONE_TIME}
                                                required
                                            />
                                                <RSPPophover
                                                    position="top"
                                                    className="modalOverlayZindexCSS"
                                                    text={SELECT_THIS_OPTION}
                                                >
                                                    <i className="icon-rs-circle-question-mark-mini  icon-xs color-primary-blue "></i>
                                                </RSPPophover>
                                        </Col>
                                        <Col sm={2} className={`d-flex align-items-center ${limitAudience ? 'click-off' : ''}`}>
                                            <RSRadioButton
                                                name={`${tab}.limitAudience`}
                                                control={control}
                                                labelName={BY_DAY}
                                                required
                                            />
                                                <RSPPophover
                                                    // className="lh0 position-relative top-21 left75"
                                                    className="modalOverlayZindexCSS"
                                                    text={SELECT_THIS_OPTION_TO_SET}
                                                >
                                                    <i className="icon-rs-circle-question-mark-mini  icon-xs color-primary-blue "></i>
                                                </RSPPophover>
                                        </Col>
                                        {limitAudience && <Col sm={3} className='d-flex pl30'>
                                            <RSTooltip
                                                className="rs-tooltip-wrapper lh0"
                                                text={`${RESET}`}
                                                position="top"
                                                >
                                                    <i
                                                    className={`${restart_medium} icon-md color-primary-blue`}
                                                    onClick={handleReset}
                                                    ></i>
                                            </RSTooltip>
                                        </Col>}
                                    </Row>
                                    {limitAudience === 'One time' && (
                                        <Row>
                                            <Col sm={7} className="mt30">
                                                <RSInput
                                                    control={control}
                                                    name={`${tab}.limitCount`}
                                                    placeholder={AUDIENCE_COUNT_LABLE}
                                                    onKeyDown={onlyNumbers}
                                                    required
                                                    rules={{
                                                        required: AUDIENCE_COUNT,
                                                        validate: (e) => {
                                                            const count = parseFormattedNumber(e);
                                                            return count === 0
                                                                ? AUDIENCE_COUNT
                                                                : count > potentialTotal
                                                                  ? COUNT_EXCEEDS_POTENTIAL_AUDIENCE
                                                                  : true;
                                                        },
                                                    }}
                                                    handleOnBlur={(e) => {
                                                        if (parseFormattedNumber(e.target.value) > potentialTotal) {
                                                            setError(`${tab}.limitCount`, {
                                                                type: 'custom',
                                                                message: COUNT_EXCEEDS_POTENTIAL_AUDIENCE,
                                                            });
                                                        } else {
                                                            clearErrors(`${tab}.limitCount`);
                                                            setValue(`${tab}.limitCount`, numberWithCommas(e.target.value));
                                                        }
                                                    }}
                                                    maxLength={MAX_LENGTH8}
                                                />
                                            </Col>
                                        </Row>
                                    )}
                                    {limitAudience === 'By day' && (
                                        <Row>
                                            <Col sm={volumeType === 'Incremental'? 6 : 5} className={`${volumeType === 'Incremental' ? 'row pr0':''} mt30`}>
                                                <RSKendoDropdown
                                                    control={control}
                                                    name={`${tab}.volumeType`}
                                                    data={VOLUME_TYPE_DATA}
                                                    label={SELECT}
                                                    defaultValue={'Equal'}
                                                    required
                                                    handleChange={(e) => {
                                                        setAgreeToggle(false);
                                                        reset((prev) => ({
                                                            ...prev,
                                                            [tab]: {
                                                                ...prev[tab],
                                                                baseVolume: '',
                                                                limitCount: '',
                                                                volumePerDay: '',
                                                                volumePercentage: '',
                                                                limitListDate: '',
                                                                volumeType: e.value, 
                                                            },
                                                        }));

                                                    }}
                                                />
                                            </Col>
                                            {volumeType === 'Equal' && (
                                                <Col sm={6} className='d-flex mt30 pr0'>
                                                    <>
                                                        <RSInput
                                                            control={control}
                                                            name={`${tab}.volumePerDay`}
                                                            placeholder={VOLUME_PER_DAY}
                                                            onKeyDown={onlyNumbers}
                                                            required
                                                            rules={{
                                                                required: ENTER_VALID_VOLUME_PER_DAY,
                                                                validate: (e) => {
                                                                    const volume = parseFormattedNumber(e);
                                                                    return volume === 0
                                                                        ? ENTER_VALID_VOLUME_PER_DAY
                                                                        : volume > potentialTotal
                                                                          ? COUNT_EXCEEDS_POTENTIAL_AUDIENCE
                                                                          : true;
                                                                },
                                                            }}
                                                            handleOnBlur={(e) => {
                                                                if (parseFormattedNumber(e.target.value) > potentialTotal) {
                                                                    setError(`${tab}.volumePerDay`, {
                                                                        type: 'custom',
                                                                        message: COUNT_EXCEEDS_POTENTIAL_AUDIENCE,
                                                                    });
                                                                    return false;
                                                                } else {
                                                                    clearErrors( `${tab}.volumePerDay`);
                                                                    setValue(
                                                                        `${tab}.volumePerDay`,
                                                                        numberWithCommas(e.target.value),
                                                                    );
                                                                }
                                                            }}
                                                            handleOnchange={() => {
                                                                setValue(`${tab}.limitListDate` ,'')
                                                            }}
                                                            maxLength={MAX_LENGTH8}
                                                            smallText={limitListDate}
                                                        />
                                                        {/* <small>{limitListDate}</small> */}
                                                    </>
                                                    <Col sm={1} className="p0 mt6 ml10 d-flex">
                                                        {volumePerDay !== '' && isValid && !limitListDate ? (
                                                            <RSTooltip
                                                                text={CLICK_HERE}
                                                                position="top"
                                                                className="modalOverlayZindexCSS lh0"
                                                            >
                                                                <i
                                                                    className={`${circle_arrow_right_medium} icon-md color-primary-blue`}
                                                                    onClick={() => {
                                                                        if (parseFormattedNumber(volumePerDay) > 0) {
                                                                        calculateEndDate();
                                                                        setAgreeToggle(true);
                                                                        }
                                                                    }}
                                                                ></i>
                                                            </RSTooltip>
                                                        ) : (
                                                            <i
                                                                className={`${circle_arrow_right_medium} icon-md click-off`}
                                                                onClick={() => {
                                                                    // calculateEndDate();
                                                                    // setAgreeToggle(true);
                                                                }}
                                                            ></i>
                                                        )}
                                                    </Col>
                                                </Col>
                                            )}
                                            {volumeType === 'Incremental' && (
                                                <>
                                                <Row className="mt30">
                                                    <Col sm={6} className={'basevolume'}>
                                                        <RSInput
                                                            name={`${tab}.baseVolume`}
                                                            control={control}
                                                            placeholder={BASE_VOLUME}
                                                            onKeyDown={onlyNumbers}
                                                            required
                                                            rules={{
                                                                required: ENTER_BASE_VOLUME,
                                                                validate: (e) => {
                                                                    const volume = parseFormattedNumber(e);
                                                                    return volume === 0
                                                                        ? ENTER_VALID_VOLUME_PER_DAY
                                                                        : volume > potentialTotal
                                                                          ? COUNT_EXCEEDS_POTENTIAL_AUDIENCE
                                                                          : true;
                                                                },
                                                            }}
                                                            handleOnBlur={(e) => {
                                                                if (parseFormattedNumber(e.target.value) > potentialTotal) {
                                                                    setError(`${tab}.baseVolume`, {
                                                                        type: 'custom',
                                                                        message: COUNT_EXCEEDS_POTENTIAL_AUDIENCE,
                                                                    });
                                                                    return false;
                                                                } else {
                                                                    clearErrors(`${tab}.baseVolume`);
                                                                    setValue(
                                                                        `${tab}.baseVolume`,
                                                                        numberWithCommas(e.target.value),
                                                                    );
                                                                }
                                                            }}
                                                            handleOnchange={() => {
                                                                setValue(`${tab}.limitListDate` ,'')
                                                            }}
                                                            maxLength={MAX_LENGTH8}
                                                            smallText={limitListDate}
                                                        />
                                                    </Col>
                                                    <Col sm={6} className={'d-flex pr0'}>
                                                        <RSInput
                                                            name={`${tab}.volumePercentage`}
                                                            control={control}
                                                            placeholder={INCREMENT}
                                                            onKeyDown={onlyNumbers}
                                                            required
                                                            rules={{
                                                                required: ENTER_INCREMENTAL,
                                                                validate: (e) => {
                                                                    return  Number(e) === 0 ? 'Enter valid incremental %' : Number(e) > 100 
                                                                        ? 'Incremental % should not exceed 100'
                                                                        : true;
                                                                },
                                                            }}
                                                            handleOnBlur={(e) => {
                                                                setAgreeToggle(true);
                                                            }}
                                                            handleOnchange={() => {
                                                                setValue(`${tab}.limitListDate` ,'')
                                                            }}
                                                            maxLength={MIN_LENGTH}
                                                        />
                                                          <Col sm={1} className="p0 mt6 ml10 d-flex">
                                                        {baseVolume !== '' &&
                                                        volumePercentage !== '' &&
                                                        isValid && !limitListDate ? (
                                                            <RSTooltip
                                                                text={CLICK_HERE}
                                                                position="top"
                                                                className="modalOverlayZindexCSS lh0"
                                                            >
                                                                <i
                                                                    className={`${circle_arrow_right_medium} icon-md color-primary-blue`}
                                                                    onClick={() => {
                                                                        // setAgreeToggle(true);
                                                                        calculateEndDate();
                                                                    }}
                                                                ></i>
                                                            </RSTooltip>
                                                        ) : (
                                                            <i
                                                                className={`${circle_arrow_right_medium} icon-md click-off`}
                                                                onClick={() => {
                                                                    // setAgreeToggle(true);
                                                                    //calculateEndDate();
                                                                }}
                                                            ></i>
                                                        )}
                                                    </Col>
                                                    </Col>
                                                  
                                                    </Row>
                                                </>
                                            )}
                                        </Row>
                                    )}

                                    {limitAudience  && (
                                        <RSCheckbox
                                            name={`${tab}.limitCountAgree`}
                                            labelName={AGREE_TARGET_AUDIENCE}
                                            control={control}
                                            className={'mb30'}
                                            required
                                        />
                                    )}
                                </Col>
                            </Row>
                        </>
                    </>
                }
                footer={
                    <div className={`m0 ${handleClickOff(channelDetails?.[tab])}`}>
                        <RSSecondaryButton
                            onClick={() => {
                                handleReset();
                                handleClose();
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            className={
                                limitCountAgree &&
                                // Object.keys(errors)?.length === 0 &&
                                // isValid &&
                                // isEnableSumbitBtn &&
                                clickButton &&
                                (limitAudience === 'One time' || volumeType !== '')
                                    ? ''
                                    : 'click-off'
                            }
                            onClick={submitHandler}
                            isLoading={isSavingLimitList}
                        >
                            {SUBMIT}
                        </RSPrimaryButton>
                    </div>
                }
                bodyClassName={`${handleClickOff(channelDetails?.[tab])}`}
            />
        </div>
    );
};

export default LimitListModal;
