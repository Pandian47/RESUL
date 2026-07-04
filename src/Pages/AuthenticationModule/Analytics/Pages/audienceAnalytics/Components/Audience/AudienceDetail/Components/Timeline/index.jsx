import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { mCurrentMonthYear } from 'Constants/Utils/dates';
import { EARLIER_IN } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_medium, circle_time_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import './timeline.css';
import RSPPophover from 'Components/RSPPophover';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import { Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { getPreviousMonthAndYear, getTimeLineData, get_Month_Year, get_Month_Year_new } from './Constants';
import { getSessionId } from 'Reducers/globalState/selector';
import { aa_audience_timeLineview } from 'Reducers/analytics/aa360/request';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import RSTooltip from 'Components/RSTooltip';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { buildDetailAnalyticsNavState } from 'Pages/AuthenticationModule/Analytics/Pages/communicationAnalytics/DetailedAnalytics/constants';
import { NoData, TimelineSkeleton } from 'Components/Skeleton/Skeleton';
const Timeline = ({ selectedUser, isUserDetailInitializing = false }) => {
    const dispatch = useDispatch();
    const { audience_timeLine, audience_timeLine_loading, passportId } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const navigate = useNavigate();

    const { createdDate } = getUserDetails();
    // console.log('createdDate: ', createdDate);

    const [openAndClose, setOpenAndClose] = useState({ status: false, index: null });
    const [textShowStatus, settextShowStatus] = useState({ status: false, index: null });

    const currentMonthYear = get_Month_Year_new(
        new Date(createdDate).getFullYear(),
        new Date(createdDate).getMonth(),
        createdDate,
    );
    // const [monthYear, setMonthYear] = useState(get_Month_Year(new Date().getFullYear()) || []);
    const [monthYear, setMonthYear] = useState(currentMonthYear);
    const createYear = Number(createdDate.split('-')[0]);
    // console.log('monthYear: ', monthYear);
    const [selectedDate, setSelectedDate] = useState({
        month: moment().month(new Date().getMonth()).format('MMMM'),
        year: moment().year(new Date().getFullYear()).format('YYYY'),
        value: mCurrentMonthYear,
    });
    // console.log('selectedDate: ', selectedDate);

    const handleRedirectToDetail = (obj) => {
        if (obj?.action === 'Open') return;
        const url = '/analytics/detail-analytics';
        const state = buildDetailAnalyticsNavState({
            channelName: obj.campaignName,
            campaignId: obj?.campaignId,
            blastId: obj?.b2,
            channelId: obj?.channelId,
            subChannelId: obj?.subChannelId ?? obj?.subchannelId,
            iswinnerSplit: obj?.iswinnerSplit,
            iswinnerSplitType: obj?.iswinnerSplitType,
            iswinnerBlastId: obj?.iswinnerSplit && obj?.iswinnerB2 ? obj?.iswinnerB2 : '',
        });
        dispatch(
            updateAnalyticsDetail({
                channelName: obj.campaignName,
                campaignId: obj?.campaignId,
                from: 'timeline',
                blastId:  obj?.b2,
                channelId: obj?.channelId,
                subChannelId: obj?.subChannelId,
                //currIndex: idx,
            }),
        );
        const encryptState = encodeUrl(state);
        navigate(`${url}?q=${encryptState}`, {
            state,
        });
    };

    const handleTimeLine = (month = null, year = null, type) => {
      
        const createdDateMonth = Number(createdDate.split('-')[1]);
        const createdDateYear = Number(createdDate.split('-')[0]);

        const tempMonth = month ? month : moment().month(selectedDate?.month).format('M');
        const tempYear =
            type === 'earlier'
                ? createdDateYear
                : year
                ? Number(year)
                : Number(getPreviousMonthAndYear(monthYear[0]).split(' ')[1]);
        let payload = {
            departmentId,
            userId,
            clientId,
            passportId,
            year: tempYear,
        };
        let yearVal = [];

        if (type === 'later' && tempYear === new Date().getFullYear()) {
            yearVal = get_Month_Year(tempYear, 0, createdDate);
        } else {
            yearVal = get_Month_Year(payload?.year, 0, createdDate);
        }
        
        const currentMonth = new Date().getMonth() + 1;
        payload = {
            ...payload,
            month: month ? parseInt(month, 10) : currentMonth,
        };
        
        if (month === null) {
            setMonthYear(yearVal);
            if (yearVal.length > 0) {
                const defaultMonth = yearVal[0];
                setSelectedDate({
                    month: defaultMonth.split(' ')[0],
                    value: defaultMonth,
                    year: defaultMonth.split(' ')[1],
                });
                payload.month = Number(moment().month(defaultMonth.split(' ')[0]).format('M'));
            }
        }
        dispatch(aa_audience_timeLineview(payload));
    };

    const prevUserRef = useRef(null);

    useEffect(() => {
    if (!_isEmpty(selectedUser) && selectedUser?.passId) {
        
        if (prevUserRef.current && prevUserRef.current !== selectedUser.passId) {
        setMonthYear(currentMonthYear);
        setSelectedDate((pre) => ({
                month: currentMonthYear?.[0].split(' ')[0],
                value: currentMonthYear?.[0],
                year: currentMonthYear?.[0].split(' ')[1],
            }));
        }
        prevUserRef.current = selectedUser.passId;
    }

    }, [selectedUser?.passId]);
    
    const isTimelinePending =
        audience_timeLine_loading || isUserDetailInitializing || _isEmpty(selectedUser) || !selectedUser?.passId;

    return (
        <>
            {isTimelinePending ? (
                <TimelineSkeleton />
            ) : (
                <>
                    {Number(monthYear[0]?.split(' ')[1]) < new Date()?.getFullYear() && (
                        <div className="timeline-container">
                            <div
                                className={`timelineCustomBtn bg-secondary-blue white mx-auto bottom35 position-relative`}
                                onClick={() => {
                                    handleTimeLine(null, selectedDate?.year ? parseInt(selectedDate?.year) + 1 : new Date()?.getFullYear(), 'later');
                                }}
                            >
                                <span>Later on { selectedDate?.year ? parseInt(selectedDate?.year) +1 : new Date()?.getFullYear()} </span>
                            </div>
                        </div>
                    )}

                    <div className="timeline-container">
                        <div className="mx-auto bottom35 position-relative">
                            <BootstrapDropdown
                                data={monthYear}
                                flatIcon
                                isObject={false}
                                defaultItem={selectedDate.value}
                                className="border"
                                alignRight
                                isActive
                                onSelect={(date) => {
                                    setSelectedDate((pre) => ({
                                        month: date.split(' ')[0],
                                        value: date,
                                        year: date.split(' ')[1],
                                    }));
                                    let dateVal = date.split(' ');
                                    handleTimeLine(moment().month(dateVal[0]).format('M'), dateVal[1]);
                                }}
                            />
                        </div>
                        {audience_timeLine?.length ? (
                      audience_timeLine.map((obj, idx) => {
                        let timeline = getTimeLineData(obj);
                        return (
                            <div className="timeline-item" key={idx}>
                                <div className="timeline-item-content">
                                    <time>
                                        <i
                                            className={`${circle_time_medium} icon-md mr5`}
                                            id="rs_Timeline_time"
                                        />
                                        {/* {getDateWithDay(timeline.datetime)} */}
                                        {getUserCurrentFormat(timeline.datetime)?.dateTimeFormat}
                                        {/* {timeline.datetime} */}
                                    </time>
                                    <div className="contentArea">
                                        {timeline?.textView && <p dangerouslySetInnerHTML={{ __html: timeline?.messagge }} />}
                                        {timeline?.textView && (
                                            <>
                                                {(() => {
                                                const isClickable = obj?.action === 'Click';
                                                const clickableClass = isClickable
                                                    ? 'cp text-primary text-decoration-underline'
                                                    : '';

                                                const textContent =
                                                    timeline?.text?.length > 20 ? (
                                                    <RSTooltip text={timeline?.text}>
                                                        <span>{truncateTitle(timeline?.text, 20, isClickable ? 'cp' : '')}</span>
                                                    </RSTooltip>
                                                    ) : (
                                                    timeline?.text
                                                    );

                                                return (
                                                    <p
                                                    className={clickableClass}
                                                    onClick={isClickable ? () => handleRedirectToDetail(obj) : undefined}
                                                    >
                                                    {textContent}
                                                    </p>
                                                );
                                                })()}
                                            </>
                                        )}
                                        {timeline?.imageView && <img src={timeline.image} />}
                                    </div>
                                    {/* {openAndClose.status && openAndClose.index && timeline?.accordionImage && (
                                    <Row className="m0">
                                        <Col className="px10 mb10">
                                            <img src={timeline?.image} />
                                        </Col>
                                    </Row>
                                )}
                                {timeline?.infoTextView && textShowStatus.status && (
                                    <div className="d-flex flex-column justify-content-between width100p px10">
                                        {timeline.info.infoText?.map((item, ind) => {
                                            return (
                                                <div key={ind} className="infoExpandContent">
                                                    <div>{item.text}</div>
                                                    <div className="font-bold">{item.value}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )} */}
                                    <div className="align-items-center d-flex justify-content-end lh0 width100p">
                                        {timeline?.infoTextView && (
                                            <>
                                                {timeline?.info?.type === 'tooltip' ? (
                                                    <RSPPophover position="top" text={timeline?.info?.content}>
                                                        <>
                                                            <i
                                                                className={`${circle_info_medium} icon-md color-primary-blue cursor-default`}
                                                                id="rs_data_circle_info"
                                                            ></i>
                                                        </>
                                                    </RSPPophover>
                                                ) : (
                                                    <div className="analytics-timeline-accordion mr10">
                                                        <i
                                                            id="rs_data_circle_info"
                                                            className={`${circle_info_medium} icon-md ${
                                                                textShowStatus.status === false
                                                                    ? 'color-secondary-grey'
                                                                    : 'color-primary-blue'
                                                            }`}
                                                            onClick={() =>
                                                                settextShowStatus((pre) => ({
                                                                    ...pre,
                                                                    index: idx,
                                                                    status: !textShowStatus.status,
                                                                }))
                                                            }
                                                        ></i>
                                                        {textShowStatus.status &&
                                                            textShowStatus.index &&
                                                            timeline.info.infoText?.map((item, ind) => {
                                                                return (
                                                                    <Row key={ind}>
                                                                        <p>{item.text}</p>
                                                                        <p>{item.value}</p>
                                                                    </Row>
                                                                );
                                                            })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {timeline?.accordionImage && (
                                            <div className="analytics-timeline-accordion">
                                                <RSTooltip text={'Overview'} className="lh0 float-end">
                                                    <i
                                                        id="rs_data_eye"
                                                        className={`${eye_medium} icon-md color-primary-blue ml5`}
                                                        onClick={() =>
                                                            setOpenAndClose((prevState) => ({
                                                                index: idx,
                                                                status:
                                                                    prevState.index === idx ? !prevState.status : true,
                                                            }))
                                                        }
                                                    ></i>
                                                </RSTooltip>
                                                {openAndClose.status && openAndClose.index === idx && (
                                                    <p>
                                                        <img
                                                            src={`data:image/png;base64,${timeline?.content}`}
                                                            alt="Overview"
                                                        />
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`${timeline?.category.color} circle`}>
                                        <i className={`${timeline?.category.icon} icon-md white pl3`}></i>
                                        <span className="text-badge"> {timeline?.category.tag}</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="d-flex align-items-center justify-content-center min-height-timeline-nodata p15">
                        <NoData />
                    </div>
                )}
                {Number(createdDate.split('-')[0]) !== Number(monthYear[0]?.split(' ')[1]) && (
                    <>
                        <div
                            className={`timelineCustomBtn ${
                                Number(createYear) > Number(getPreviousMonthAndYear(monthYear[0]).split(' ')[1])
                                    ? 'click-off-analytics-360'
                                    : ''
                            }`}
                            onClick={() => {
                                handleTimeLine();
                            }}
                        >
                            <span>{getPreviousMonthAndYear(monthYear[0]).split(' ')[1]}</span>
                        </div>
                        <div
                            className={`timelineCustomBtn bg-secondary-blue white ${
                                Number(createYear) > Number(getPreviousMonthAndYear(monthYear[0]).split(' ')[1] - 1)
                                    ? 'click-off-analytics-360'
                                    : ''
                            }`}
                            onClick={() => {
                                handleTimeLine(null, null, 'earlier');
                            }}
                        >
                            <span>{EARLIER_IN} {Number(getPreviousMonthAndYear(monthYear[0]).split(' ')[1] - 1)}</span>
                        </div>
                    </>
                )}
                    </div>
                </>
            )}
        </>
    );
};

export default Timeline;
