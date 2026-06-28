import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat, convertUTCtoUserTimezone } from 'Utils/modules/dateTime';
import { numberWithCommas, showPercentage } from 'Utils/modules/formatters';
import { ch_dark_green, ch_dark_yellow, ch_light_cyan, ch_light_pink, ch_light_purple, ch_light_red, splitA, splitB, splitC, splitD } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { SELECT_SCHEDULE_DATE_AND_TIME } from 'Constants/GlobalConstant/ValidationMessage';
import { LABLE_SPLIT_AB } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, winner_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useState } from 'react';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import { Row, Col, Carousel } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import RSModal from 'Components/RSModal';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import Scheduler from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Component/Scheduler';
import {
    allContentFormat,
    buildPayload,
    contentTypes,
    data,
    getColLengthValue,
    getTitleContent,
    profileChart,
    splitABAudienceCount,
    SplitTypes,
} from './constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';

import RSHighchartsContainer from 'Components/Highcharts/index';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import { get_splitAB_process_recipients } from 'Reducers/communication/listing/request';
import { updatePopupModal } from 'Reducers/communication/listing/reducer';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import RSTooltip from 'Components/RSTooltip';
import EmailListPreview from 'Pages/AuthenticationModule/Communication/Component/EmailListPreview/EmailListPreview';
import {
    SplitABSchedulerModalSkeleton,
    splitABSchedulerModalSkeletonCriticalCss,
} from 'Components/Skeleton/pages/communication';

const SplitABScheduler = ({
    handleClose = () => { },
    show,
    tertiaryText = '',
    isCommunication = false,
    onSave = () => { },
}) => {
    const methods = useForm();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const splitColors = [
        splitA,
        splitB,
        splitC,
        splitD,
        ch_light_red,
        ch_light_purple,
        ch_light_pink,
        ch_light_cyan,
    ];
    const [type, setType] = useState({
        text: 'Subject line',
        filter: 'subject',
        id: 1,
    });
    const {
        control,
        unregister,
        watch,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = methods;
    // console.log('errors: ', errors);
    const { popupContent  = [], campaignDetail } = useSelector((state) => state.communicationListingReducer ?? {});
    const splitABPopupLoading = Boolean(campaignDetail?.splitABPopupLoading);
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const [contentType, setContentType] = useState([]);
    const [formatListData, setFormatListData] = useState([]);
    const [disableItem, setDisableItem] = useState([]);
    const [audienceCount, setAudienceCount] = useState({});
    const [isSaveEnable, setIsSaveEnable] = useState(false);
    const [failApiError, setFailApiError] = useState('');
    const [currentUserTime, setCurrentUserTime] = useState(null);
    const [subjectButton, scheduleButton, contentPathButton, timeZoneName, scheduleTime, isSchedule] = watch([
        'subject',
        'Schedule',
        'ContentPath',
        'timezone',
        'schedule',
        'isSchedule',
    ]);
    // console.log('scheduleTime: ', scheduleTime);
    // console.log('timeZoneName: ', timeZoneName);
    const items = formatListData && formatListData[type?.text]
        ? formatListData[type?.text].flatMap((item) => item[type?.filter] || [])
        : [];

    const sessionId = useSelector((state) => getSessionId(state));
    // console.log('campaignDetail: ', campaignDetail);
    const labelList = _get(data, type, 'Subject line');
    const { timeZoneId } = getUserDetails();
    const allCampaignDetail = { sessionId, campaignDetail, timeZoneId, timeZoneName, scheduleTime };

    const handleScheduler = () => {
        if (!popupContent[0]?.autoSchedule) {
            if (!scheduleTime) {
                setValue('isSchedule', true);
                setError('schedule', { type: 'custom', message: SELECT_SCHEDULE_DATE_AND_TIME });
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    };

    const formSubmitHandler = async (formState) => {
        // debugger
        if (isCommunication) {
            const status = await handleScheduler();
            if (status) {
                const payload = buildPayload(formState, allCampaignDetail, popupContent[0], type);
                const response = await dispatch(get_splitAB_process_recipients(payload));
                if (response?.status) {
                    dispatch(
                        updatePopupModal({
                            popupModal: false,
                            channelId: 0,
                            campaignId: 0,
                        }),
                    );
                } else {
                    setFailApiError(response?.message ?? 'Something went wrong. Try again later');
                }
            }
        }
    };

    const handleDisableItem = () => {
        if (popupContent?.[0]?.autoSchedule) {
            switch (popupContent?.[0]?.performedBy) {
                case 1:
                    return ['Email content', 'Schedule'];
                case 2:
                    return ['Subject line', 'Schedule'];
                case 3:
                    return ['Email content', 'Subject line'];

                default:
                    break;
            }
        } else {
            return [];
        }
    };

    const defaultValue = useMemo(() => {
        return contentType?.length ? contentType[0] : {};
    }, [contentType]);

    // useEffect(() => {
    // setValue('subject', '');
    // setValue('Schedule', '');
    // setValue('ContentPath', '');
    // }, [type?.id]);
    useEffect(() => {
        const allData = popupContent?.length > 0 && allContentFormat(popupContent);
        setFormatListData(allData);
        // if (popupContent[0]?.autoSchedule) setDisableItem([{ text: 'Schedule', filter: 'Schedule' }]);
        const countValue = splitABAudienceCount(popupContent[0]);
        setAudienceCount(countValue);
        if (popupContent?.length && popupContent[0]?.autoSchedule) {
            const filterContentType = contentTypes?.filter((type) => type.id === popupContent?.[0]?.performedBy);
            setContentType(filterContentType ?? contentTypes[0]);
            setType(filterContentType[0]);
        } else {
            setType(contentTypes[0]);
            setContentType(contentTypes);
        }
        const handleEditSubjectLineContent = () => {
            if (!popupContent?.length) return {};

            const { channelID, iswinnerSplitType, autoSchedule, localBlastDateTime, manualSchedule } = popupContent[0];
            let performedBy = 1;
            const FormKey = performedBy === 1 ? 'subject' : performedBy === 2 ? 'ContentPath' : 'Schedule';
            const editKey = performedBy === 1 ? 'subject' : performedBy === 2 ? 'edmContentPath' : 'blastDateTime';
            let content = '';
            if (channelID === 1) {
                content = iswinnerSplitType + popupContent[0][`${editKey}${iswinnerSplitType}`];
            } else {
                content = `${iswinnerSplitType}${popupContent[0][`subject${iswinnerSplitType}`]}`;
            }

            if (!autoSchedule) {
                if (manualSchedule) {
                    return {
                        [FormKey]: content,
                        isSchedule: manualSchedule,
                        schedule: localBlastDateTime,
                    };
                } else {
                    return {
                        [FormKey]: '',
                        isSchedule: false,
                        schedule: '',
                    };
                }
            } else {
                return {
                    [FormKey]: content,
                    isSchedule: false,
                    schedule: '',
                };
            }
        };

        reset((formState) => ({
            ...formState,
            ...handleEditSubjectLineContent(),
        }));
    }, [popupContent]);

    // UTC is fetched when Schedule is enabled (Scheduler mounts) — not on modal open
    useEffect(() => {
        if (utcTimeData?.utcTime) {
            const currentUTCdateTime = new Date(utcTimeData.utcTime.replace('Z', ''));
            const userTimezoneDate = convertUTCtoUserTimezone(currentUTCdateTime);
            setCurrentUserTime(userTimezoneDate);
        }
    }, [utcTimeData]);

    useEffect(() => {
        if (campaignDetail?.channelId !== 1) {
            setIsSaveEnable(subjectButton ? false : true);
        } else {
            setIsSaveEnable(subjectButton || scheduleButton || contentPathButton ? false : true);
        }
    }, [subjectButton, scheduleButton, contentPathButton, campaignDetail]);

    // Clear radio button selection when isSchedule is turned off
    useEffect(() => {
        if (!isSchedule) {
            setValue(type.filter, '');
        }
    }, [isSchedule, type.filter, setValue]);

    // console.log(formatListData, 'fff]');
    // console.log(disableItem, 'disableItem');
    const getWaData = (content) => {
        try {
            return JSON.parse(content);
        } catch (error) {
            return content;
        }
    };
    return (
        <RSModal
            show={show}
            size={items?.length > 2 ? 'xxlg' : 'lg'}
            header={LABLE_SPLIT_AB}
            isCloseButton
            handleClose={() => {
                setType({
                    text: 'Subject line',
                    filter: 'subject',
                });
                reset();
                handleClose();
            }}
            headerRightContent={
                popupContent?.length > 0 &&
                popupContent[0]?.channelID === 1 && (
                    <RSBootstrapdown
                        data={contentType ?? []}
                        isObject
                        disbleItems={handleDisableItem()}
                        fieldKey="text"
                        defaultItem={defaultValue}
                        isActive
                        alignRight
                        onSelect={({ text, filter, id }) => {
                            // unregister('split');
                            // reset();
                            // setValue('subject', '');
                            // setValue('Schedule', '');
                            // setValue('ContentPath', '');
                            setType({
                                text,
                                filter,
                                id,
                            });
                        }}
                        className={`mt5 pl5 left7 position-relative`}
                    />
                )
            }
            body={
                splitABPopupLoading ? (
                    <>
                        <style>{splitABSchedulerModalSkeletonCriticalCss}</style>
                        <SplitABSchedulerModalSkeleton
                            splitCount={2}
                            showHeaderStats={campaignDetail?.channelId !== 1}
                            showScheduleRow={isCommunication && campaignDetail?.channelId === 1}
                            showScheduleDateInput={false}
                        />
                    </>
                ) : (
                <FormProvider {...methods}>
                    {/* <ul className="d-flex">
                        {labelList.map(({ text, label, percentage, text1, size, labelImg, ...rest }, index) => (
                            <li
                                className="text-center "
                                style={{
                                    flex: 1,
                                }}
                            >
                                <small className="my10 font-xs">{text}</small>
                                <img
                                    src={index === 0 ? SplitA : SplitB}
                                    alt={`Split ${index === 0 ? 'A' : 'B'}`}
                                />
                                <div className="mt-60 position-relative">
                                    <RSHighchartsContainer
                                        options={profileChart(
                                            Number(percentage) || 0,
                                            index === 0 ? ch_dark_green : ch_dark_yellow,
                                            'font-md font-bold',
                                        )}
                                    />
                                    <div className="charttext mt-15">
                                        <small className="font-xxs mb-5">{text1}</small>
                                        <small className="fs-5">{size}</small>
                                    </div>
                                </div>
                                <div className="text-center mt-25 mb5 splitAB-emailcontent">
                                    <RSRadioButton
                                        control={control}
                                        name="split"
                                        labelName={label}
                                        {...(type === 'Email content' && {
                                            labelImg: labelImg,
                                        })}
                                    />
                                </div>
                                {type === 'Email content' ? (
                                    <div className="text-center">
                                        <RSRadioButton
                                            control={control}
                                            name={type}
                                            // labelName={label}
                                            {...(type === 'Email content' && {
                                                labelImg: labelImg,
                                            })}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center mt-55 mb5">
                                        <RSRadioButton control={control} name={type} labelName={label} {...rest} />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul> */}
                    {/* {type === 'Subject line' && (
                        <Container>
                            <Row className="my15">
                                <Col md={{ span: 2, offset: 1 }}>
                                    <span>Schedule</span>
                                </Col>
                                <Col>
                                    <RSSwitch control={control} name={'isSchedule'} />
                                </Col>
                            </Row>
                            {isSchedule && isCommunication && (
                                <Scheduler
                                    isSendTimeRecommendation={false}
                                    label={'Enter the date and time'}
                                    isListing
                                />
                            )}
                        </Container>
                    )} */}

                    {popupContent[0]?.channelID !== 1 && (
                        <>
                            <ul className="split-header-box mb30 d-flex align-items-center justify-content-between py10 mx-9">
                                <li className="left">
                                    {popupContent[0]?.autoSchedule ? (
                                        <div>
                                            <p className="font-semi-bold">
                                                Auto schedule enabled:
                                            </p>
                                            <span className='lh-sm d-block'>Best-performing variant is automatically sent to the remaining audience.</span>
                                        </div>
                                    ) : (
                                        <p className="lh-sm">
                                            Select the best performing message variant for delivery to the remaining{" "}
                                            <span className="cursor-pointer font-bold">
                                                {Math.round(
                                                    showPercentage(audienceCount?.remainingCountPercentage)
                                                )}
                                                <span className="fs12 font-bold">%</span>
                                            </span>{" "}
                                            of the audience.
                                        </p>
                                    )}
                                </li>
                                <li className={`middle align-items-start lh-sm ${items?.length > 2 ? 'gap-5' : 'flex-column'}`}>
                                    <span className="stat-audience">
                                        Audience/split: <span className="font-bold font-md">{numberWithCommas(audienceCount?.groupCount)}</span>
                                    </span>
                                    <span className="stat-remaining">
                                        Remaining audiences: <span className="font-bold font-md">{numberWithCommas(audienceCount?.remainingCount)}</span>
                                    </span>
                                </li>

                            </ul>
                        </>
                    )}
                    <div className={`form-group ${type?.text === 'Subject line' && isCommunication ? '' : 'mb0'}`}>
                        <div className='container'>
                            <Row className={`splitAB-wrapper ${items?.length > 3 ? 'SplitAB-grid' : ''}`}>
                                {(() => {
                                    const selectedSplitValue = watch(type.filter);
                                    const hasSplitSelection = selectedSplitValue != null && selectedSplitValue !== '';
                                    if (items.length <= 5) {
                                        return items.map((contentEle, idx) => {
                                            const radioValue = type.text === 'Email content'
                                                ? `${type.filter}${idx}`
                                                : type.text === 'Schedule'
                                                    ? `${SplitTypes(idx)}${getUserCurrentFormat(contentEle?.content)?.dateTimeFormat}`
                                                    : `${SplitTypes(idx)}${contentEle?.content}`;
                                            const isActive = selectedSplitValue === radioValue;
                                            const isDisabled = !isCommunication || !isSchedule || (popupContent[0]?.manualSchedule && currentUserTime > new Date(popupContent[0]?.localBlastDateTime));
                                            const isBodyDimmed = !isActive && (isDisabled || hasSplitSelection);
                                            const isSplitNonInteractive = !isActive && isDisabled;

                                            return (
                                                <Col key={idx} className="d-flex">
                                                    <span
                                                        className={`split-card-box ${isBodyDimmed ? 'split-card-inactive-body' : ''} ${isSplitNonInteractive ? 'split-card-noninteractive' : ''} ${isActive ? 'active shadow-sm' : ''} ${idx % 2 === 0 ? '' : 'mb25'} h-100 w-100 d-flex flex-column ${isDisabled ? '' : 'cursor-pointer'}`}
                                                        style={{ transition: 'all 0.2s ease-in-out' }}
                                                        onClick={() => !isDisabled && setValue(type.filter, radioValue)}
                                                    >

                                                        <div className="split-card-radio">
                                                            <RSRadioButton
                                                                sliceStartNo={1}
                                                                control={control}
                                                                name={type.filter}
                                                                isSplitABScheduler
                                                                disabled={isDisabled}
                                                                truncateName={false}
                                                                customLabelclassName={(campaignDetail?.channelId === 21 || campaignDetail?.channelId === 41) ? 'align-items-stretch d-flex gap-3' : ''}
                                                                {...(type.text === 'Email content' && {
                                                                    labelImg: "",
                                                                    labelImgName: radioValue,
                                                                })}
                                                                {...(type.text !== 'Email content' && {
                                                                    labelName: radioValue,
                                                                })}
                                                                customLabel={true}
                                                                isLabel={false}
                                                                showLabelName={false}
                                                            />
                                                        </div>

                                                        <div className="split-card-inner flex-grow-1 d-flex flex-column w-100">
                                                        <div className="scb-header bg-tertiary-blue border-tlr10 border-trr10 p19">
                                                            <div className="font-bold scb-title fs19 d-flex align-items-center justify-content-between w-100 gap10">
                                                                <span className="d-flex align-items-center min-w-0">
                                                                    {popupContent[0]?.iswinnerSplitType === SplitTypes(idx) && (
                                                                        <i className={`${winner_mini} mr5`} style={{ color: '#FFB800', fontSize: '20px' }}></i>
                                                                    )}
                                                                    {`Split: ${SplitTypes(idx)} ${popupContent[0]?.iswinnerSplitType === SplitTypes(idx) ? '(Winner)' : ''}`}
                                                                </span>
                                                                <RSTooltip text="View analytics">
                                                                    <span className="split-card-analytics-trigger d-inline-flex">
                                                                        <i
                                                                            id={`rs_DetailedStatus_analyticsreport_split_${SplitTypes(idx)}`}
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            className={`${analytics_medium} icon-md color-primary-blue cursor-pointer flex-shrink-0`}
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                const splitLetter = SplitTypes(idx);
                                                                                const state = {
                                                                                    channelName: getChannelId(campaignDetail?.channelId)?.name,
                                                                                    campaignId: campaignDetail?.campaignId,
                                                                                    channelId: campaignDetail?.channelId,
                                                                                    splitName: `Split ${splitLetter}`,
                                                                                    blastId: popupContent[0]?.[`blastId${splitLetter}`],
                                                                                    iswinnerSplit: popupContent[0]?.iswinnerSplit,
                                                                                    iswinnerSplitType: popupContent[0]?.iswinnerSplitType,
                                                                                    isSplitABScheduler: true,
                                                                                };
                                                                                const encryptState = encodeUrl(state);
                                                                                navigate(`/analytics/detail-analytics?q=${encryptState}`, { state });
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                                    e.preventDefault();
                                                                                    e.stopPropagation();
                                                                                    e.currentTarget.click();
                                                                                }
                                                                            }}
                                                                        />
                                                                    </span>
                                                                </RSTooltip>
                                                            </div>
                    
                                                        </div>
                                                        <div className="split-card-dimmed-body flex-grow-1 d-flex flex-column">

                                                            <div className="scb-size">
                                                                <span className="size-label"> {getTitleContent(campaignDetail.channelId, type)}:</span>
                                                                <span className="size-percent align-items-baseline d-flex">{Number(contentEle?.splitPercentage) || 0}<span className='fs17 font-bold'>%</span></span>
                                                                <span className="size-count">({contentEle?.count ?? 0})</span>
                                                            </div>

                                                            <div className={`scb-preview flex-grow-1 d-flex flex-column justify-content-center align-items-center ${campaignDetail?.channelId == 1 ? 'bg-light' : ''}`}>
                                                                {campaignDetail?.channelId === 21 ? (
                                                                    <div>
                                                                        <RSMobilePreview
                                                                            channel="whatsapp"
                                                                            previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                                            content={getWaData(contentEle?.content)?.templateContent}
                                                                            imagePath={getWaData(contentEle?.content)?.mediaURL}
                                                                            // className="gl-body font-xxs border-0 p0"
                                                                            carouselJSON={JSON.stringify(getWaData(contentEle?.content)?.carousel)}
                                                                            isCarousel={getWaData(contentEle?.content)?.isCarousel}
                                                                            header={getWaData(contentEle?.content)?.header}
                                                                            footer={getWaData(contentEle?.content)?.footer}
                                                                        />
                                                                    </div>
                                                                ) : campaignDetail?.channelId === 2 ? (
                                                                    <div className='splitAB-rcs-preview'>
                                                                        <RSMobilePreview
                                                                            channel="sms"
                                                                            previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                                            content={contentEle?.content}
                                                                            className="gl-body font-xxs border-0 p0"
                                                                        />
                                                                    </div>
                                                                ) : campaignDetail?.channelId === 41 ? (
                                                                    <div className='splitAB-rcs-preview'>
                                                                        <RSMobilePreview
                                                                            channel="rcs"
                                                                            previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                                            content={contentEle?.content}
                                                                            className="gl-body font-xxs border-0 p0"
                                                                        />
                                                                    </div>
                                                                ) : type.text === 'Email content' ? (
                                                                    <div className="split-ab-email-list-preview w-100 h-100 min-h-0 d-flex flex-column align-items-stretch justify-content-center bg-light p10">
                                                                        <EmailListPreview
                                                                            data={{
                                                                                content: contentEle?.content || '',
                                                                                footerContent: '',
                                                                                previewImage: '',
                                                                                showAsHtml: contentEle?.contentType === 'html',
                                                                                isModalPreview: false,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : type.text === 'Subject line' || type.text === 'Schedule' ? (
                                                                    <div className="email-preview  w-100 h-100 d-flex flex-column justify-content-center  bg-light p10 px19">
                                                                        {type.text === 'Subject line' && (
                                                                            <small className="size-label d-block w-100">Subject line</small>
                                                                        )}
                                                                        {type.text === 'Schedule' && (
                                                                            <small className="size-label d-block w-100">Scheduled time</small>
                                                                        )}
                                                                        <p>{type.text === 'Schedule' ? getUserCurrentFormat(contentEle?.content)?.dateTimeFormat : contentEle?.content}</p>
                                                                    </div>
                                                                ) : <></>}
                                                            </div>
                                                        </div>
                                                        </div>

                                                    </span>
                                                </Col>
                                            );
                                        });
                                    }

                                    const slides = [];
                                    if (items.length === 3) {
                                        slides.push([items[0], items[1]]);
                                        slides.push([items[1], items[2]]);
                                    } else {
                                        for (let i = 0; i < items.length; i += 2) {
                                            slides.push(items.slice(i, i + 2));
                                        }
                                    }

                                    return (
                                        <Carousel
                                            interval={null}
                                            indicators={false}
                                            className="splitAB-carousel w-100"
                                            onSlid={() => {
                                                window.dispatchEvent(new Event('resize'));
                                            }}
                                        >
                                            {slides.map((slideItems, slideIdx) => (
                                                <Carousel.Item key={slideIdx} className='pt10'>
                                                    <Row className="mx-0">
                                                        {slideItems.map((contentEle, itemIdx) => {
                                                            const originalIdx = items.indexOf(contentEle);
                                                            const radioValue = type.text === 'Email content'
                                                                ? `${type.filter}${originalIdx}`
                                                                : type.text === 'Schedule'
                                                                    ? `${SplitTypes(originalIdx)}${getUserCurrentFormat(contentEle?.content)?.dateTimeFormat}`
                                                                    : `${SplitTypes(originalIdx)}${contentEle?.content}`;
                                                            const isActive = selectedSplitValue === radioValue;
                                                            const isDisabled = !isCommunication || !isSchedule || (popupContent[0]?.manualSchedule && currentUserTime > new Date(popupContent[0]?.localBlastDateTime));
                                                            const isBodyDimmed = !isActive && (isDisabled || hasSplitSelection);
                                                            const isSplitNonInteractive = !isActive && isDisabled;

                                                            return (
                                                                <Col key={originalIdx} sm={6} className="d-flex">
                                                                    <span
                                                                        className={`split-card-box ${isBodyDimmed ? 'split-card-inactive-body' : ''} ${isSplitNonInteractive ? 'split-card-noninteractive' : ''} ${isActive ? 'active shadow-sm' : ''} mb25 h-100 w-100 d-flex flex-column ${isDisabled ? '' : 'cursor-pointer'}`}
                                                                        style={{ transition: 'all 0.2s ease-in-out' }}
                                                                        onClick={() => !isDisabled && setValue(type.filter, radioValue)}
                                                                    >

                                                                        <div className="split-card-radio">
                                                                            <RSRadioButton
                                                                                sliceStartNo={1}
                                                                                control={control}
                                                                                name={type.filter}
                                                                                isSplitABScheduler
                                                                                disabled={isDisabled}
                                                                                truncateName={false}
                                                                                customLabelclassName={(campaignDetail?.channelId === 21 || campaignDetail?.channelId === 41) ? 'align-items-stretch d-flex gap-3' : ''}
                                                                                {...(type.text === 'Email content' && {
                                                                                    labelImg: "",
                                                                                    labelImgName: radioValue,
                                                                                })}
                                                                                {...(type.text !== 'Email content' && {
                                                                                    labelName: radioValue,
                                                                                })}
                                                                                customLabel={true}
                                                                                isLabel={false}
                                                                                showLabelName={false}
                                                                            />
                                                                        </div>

                                                                    <div className="split-card-inner flex-grow-1 d-flex flex-column w-100">
                                                                    <div className="scb-header bg-tertiary-blue border-tlr10 border-trr10 p19">
                                                                        <div className="scb-title font-bold fs19 d-flex align-items-center justify-content-between w-100 gap10">
                                                                                <span className="d-flex align-items-center min-w-0">
                                                                                    {popupContent[0]?.iswinnerSplitType === SplitTypes(originalIdx) && (
                                                                                        <i className={`${winner_mini} mr5`} style={{ color: '#FFB800', fontSize: '20px' }}></i>
                                                                                    )}
                                                                                    {`Split: ${SplitTypes(originalIdx)} ${popupContent[0]?.iswinnerSplitType === SplitTypes(originalIdx) ? '(Winner)' : ''}`}
                                                                                </span>
                                                                                <RSTooltip text="View analytics">
                                                                                    <span className="split-card-analytics-trigger d-inline-flex">
                                                                                        <i
                                                                                            id={`rs_DetailedStatus_analyticsreport_split_${SplitTypes(originalIdx)}`}
                                                                                            role="button"
                                                                                            tabIndex={0}
                                                                                            className={`${analytics_medium} icon-md color-primary-blue cursor-pointer flex-shrink-0`}
                                                                                            onClick={(e) => {
                                                                                                e.preventDefault();
                                                                                                e.stopPropagation();
                                                                                                const splitLetter = SplitTypes(originalIdx);
                                                                                                const state = {
                                                                                                    channelName: getChannelId(campaignDetail?.channelId)?.name,
                                                                                                    campaignId: campaignDetail?.campaignId,
                                                                                                    channelId: campaignDetail?.channelId,
                                                                                                    splitName: `Split ${splitLetter}`,
                                                                                                    blastId: popupContent[0]?.[`blastId${splitLetter}`],
                                                                                                    iswinnerSplit: popupContent[0]?.iswinnerSplit,
                                                                                                    iswinnerSplitType: popupContent[0]?.iswinnerSplitType,
                                                                                                    isSplitABScheduler: true,
                                                                                                };
                                                                                                const encryptState = encodeUrl(state);
                                                                                                navigate(`/analytics/detail-analytics?q=${encryptState}`, { state });
                                                                                            }}
                                                                                            onKeyDown={(e) => {
                                                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                                                    e.preventDefault();
                                                                                                    e.stopPropagation();
                                                                                                    e.currentTarget.click();
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </span>
                                                                                </RSTooltip>
                                                                            </div>
                                                                            <div className="scb-desc mt5 d-flex align-items-center">
                                                                                <span
                                                                                    className="font-xxs border d-inline-flex align-items-center justify-content-center mr10"
                                                                                    style={{
                                                                                        padding: '3px 8px',
                                                                                        fontSize: '11px',
                                                                                        borderRadius: '12px',
                                                                                        fontWeight: '600',
                                                                                        backgroundColor: campaignDetail.channelId === 21 ? '#dcf8c6' : campaignDetail.channelId === 1 ? '#e1f5fe' : '#f3e5f5',
                                                                                        color: campaignDetail.channelId === 21 ? '#075E54' : campaignDetail.channelId === 1 ? '#01579B' : '#4A148C',
                                                                                        borderColor: campaignDetail.channelId === 21 ? '#b9f09d' : campaignDetail.channelId === 1 ? '#81d4fa' : '#ce93d8'
                                                                                    }}
                                                                                >
                                                                                    {getChannelId(campaignDetail.channelId)?.label}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="split-card-dimmed-body flex-grow-1 d-flex flex-column">
                                                                            <div className="scb-size">
                                                                                <span className="size-label">{getTitleContent(campaignDetail.channelId, type)}:</span>
                                                                                <span className="size-percent align-items-baseline d-flex">{Number(contentEle?.splitPercentage) || 0}%</span>
                                                                                <span className="size-count">({contentEle?.count ?? 0})</span>
                                                                            </div>

                                                                        <div className="scb-preview flex-grow-1 d-flex flex-column justify-content-center align-items-center bg-light">
                                                                            {campaignDetail?.channelId === 21 ? (
                                                                                <div className="wa-preview-wrapper mx-auto">
                                                                                    <WhatsAppPreviewNew
                                                                                        {...{
                                                                                            content: getWaData(contentEle?.content)?.templateContent,
                                                                                            imagePath: getWaData(contentEle?.content)?.mediaURL,
                                                                                            className: 'gl-body font-xxs border-0 p0',
                                                                                            carouselJSON: JSON.stringify(getWaData(contentEle?.content)?.carousel),
                                                                                            isCarousel: getWaData(contentEle?.content)?.isCarousel,
                                                                                            header: getWaData(contentEle?.content)?.header,
                                                                                            footer: getWaData(contentEle?.content)?.footer
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ) : campaignDetail?.channelId === 2 ? (
                                                                                <div className='splitAB-rcs-preview mx-auto'>
                                                                                    <RSMobilePreview
                                                                                        channel="sms"
                                                                                        previewSource={PREVIEW_SOURCE.COMM_LISTING}
                                                                                        content={contentEle?.content}
                                                                                        className="gl-body font-xxs border-0 p0"
                                                                                    />
                                                                                </div>
                                                                            ) : campaignDetail?.channelId === 41 ? (
                                                                                <div className='splitAB-rcs-preview mx-auto'>
                                                                                    <RcsPreview {...RCSProps} content={contentEle?.content} />
                                                                                </div>
                                                                            ) : type.text === 'Email content' ? (
                                                                                <div className="split-ab-email-list-preview w-100 h-100 min-h-0 d-flex flex-column align-items-stretch justify-content-center bg-light p10">
                                                                                    <EmailListPreview
                                                                                        data={{
                                                                                            content: contentEle?.content || '',
                                                                                            footerContent: '',
                                                                                            previewImage: '',
                                                                                            showAsHtml: contentEle?.contentType === 'html',
                                                                                            isModalPreview: false,
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ) : type.text === 'Subject line' || type.text === 'Schedule' ? (
                                                                                <div className="email-preview text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-light p10">
                                                                                    {type.text === 'Subject line' && (
                                                                                        <span className="size-label mb5 d-block w-100">Subject line:</span>
                                                                                    )}
                                                                                    {type.text === 'Schedule' && (
                                                                                        <span className="size-label mb5 d-block w-100">Scheduled time:</span>
                                                                                    )}
                                                                                    <p className="mb0 px10 font-medium">{type.text === 'Schedule' ? getUserCurrentFormat(contentEle?.content)?.dateTimeFormat : contentEle?.content}</p>
                                                                                </div>
                                                                            ) : <></>}
                                                                        </div>
                                                                        </div>
                                                                    </div>

                                                                    </span>
                                                                </Col>
                                                            );
                                                        })}
                                                    </Row>
                                                </Carousel.Item>
                                            ))}
                                        </Carousel>
                                    );
                                })()}
                            </Row>
                        </div>
                    </div>
                    {type?.text === 'Subject line' && isCommunication && (
                        <div className='form-group px13 mb0'>
                            {(() => {
                                const { manualSchedule, localBlastDateTime } = popupContent?.[0] || {};
                                const isTimePassed = currentUserTime && localBlastDateTime
                                    ? currentUserTime > new Date(localBlastDateTime)
                                    : false;
                                const scheduleDisabled = (popupContent?.length > 0 && popupContent[0]?.autoSchedule || popupContent?.length > 0 && popupContent[0]?.manualSchedule && (currentUserTime > new Date(popupContent[0]?.localBlastDateTime))) || !isCommunication;
                                const schedulerDisabled = !isCommunication || (manualSchedule && isTimePassed);
                                return (
                                    <Row className="align-items-start gy-2 gx-2">
                                        <Col xs="auto" className="flex-shrink-0">
                                            <label className="control-label-left mb0">Schedule</label>
                                        </Col>
                                        <Col xs="auto" className={`flex-shrink-0  ${scheduleDisabled ? 'pe-none click-off' : ''}`}>
                                            <RSSwitch
                                                control={control}
                                                name={'isSchedule'}
                                                handleChange={(e) => {
                                                    if (!e) {
                                                        setValue('schedule', '');
                                                        setValue(type.filter, '');
                                                    }
                                                }}
                                            />
                                        </Col>
                                        {isSchedule && (
                                            <Col sm={getColLengthValue(campaignDetail?.channelId, items?.length)} className={`min-w-0 split-ab-modal-schedule-col ${schedulerDisabled ? 'pe-none click-off' : ''}`}>
                                                <Scheduler
                                                    isSendTimeRecommendation={false}
                                                    label={'Enter the date and time'}
                                                    isListing
                                                    maxDate={
                                                        campaignDetail?.endDate
                                                            ? new Date(campaignDetail.endDate)
                                                            : undefined
                                                    }
                                                    utcTime_Data={utcTimeData?.utcTime ? utcTimeData : null}
                                                    disableAutoScroll
                                                    isSplitABScheduler
                                                    compactToolbarLayout
                                                />
                                            </Col>
                                        )}
                                    </Row>
                                );
                            })()}

                            {failApiError && <span className="color-primary-red"> {failApiError}</span>}
                        </div>
                    )}
                </FormProvider>
                )
            }
            footer={
                <Fragment>
                    <RSSecondaryButton
                        onClick={() => {
                            setType({
                                text: 'Subject line',
                                filter: 'subject',
                            });
                            reset();
                            handleClose();
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    {/* {tertiaryText && (
                        <RSSecondaryButton
                            color="blue"
                            onClick={() => {
                                const state = {
                                    channelName: getChannelId(campaignDetail?.channelId)?.name,
                                    campaignId: campaignDetail?.campaignId,
                                    channelId: campaignDetail?.channelId,
                                };
                                const encryptState = encodeUrl(state);
                                navigate(`/analytics/detail-analytics?q=${encryptState}`, {
                                    state,
                                });
                                // navigate(`/analytics/detail-analytics`, {
                                //     state: {
                                //         channelName: 'Email',
                                //         campaignId: 123,
                                //     },
                                // })
                            }}
                        >
                            {tertiaryText}
                        </RSSecondaryButton>
                    )} */}
                    {isCommunication && <RSPrimaryButton
                        disabledClass={`${splitABPopupLoading ? 'pe-none click-off' : ''} ${(popupContent?.length > 0 && popupContent[0]?.autoSchedule ||
                            popupContent?.length > 0 && popupContent[0]?.manualSchedule && currentUserTime > new Date(popupContent[0]?.localBlastDateTime)
                        ) ||
                            isSaveEnable ||
                            Object.keys(errors)?.length > 0
                            ? 'pe-none click-off'
                            : ''
                            }`}
                        onClick={handleSubmit(formSubmitHandler)}
                    >
                        Save
                    </RSPrimaryButton>
                    }
                </Fragment>
            }
            footerClassName={campaignDetail?.channelId === 1  ? 'pr43' : ''}
        />
    );
};

SplitABScheduler.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func,
    handleTertiaryButton: PropTypes.func,
    onSave: PropTypes.func,
    tertiaryText: PropTypes.string,
};

export default SplitABScheduler;
