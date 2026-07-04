import { barChartOptions } from 'Constants/Charts';
import { formatNumber } from 'Utils/modules/campaignUtils';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { DetailOverviewHeadSkeleton, DetailOverviewSkeleton, HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { OFFLINE, ONLINE, TOTAL, TOTAL_COMMUNICATION_SENT } from 'Constants/GlobalConstant/Placeholders';
import { bar_chart_medium, bar_filter_medium, circle_arrow_left_medium, circle_arrow_right_medium, circle_close_fill_medium, circle_info_medium, circle_info_mini, vertical_view_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useRef, useState } from 'react';

import RSIcon from 'Components/RSIcon';
import Icon, { Icons } from 'Components/Icon/Icon';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSTooltip from 'Components/RSTooltip';

import { chartValue, checkForNonZeroElements, getPercentages, handleInfoCount, summaryImages,handlePercentage } from './constant';
import InfoOverview from './InfoOverview';

import { getSessionId } from 'Reducers/globalState/selector';

import { useDispatch, useSelector } from 'react-redux';
import { getPreBlast, getSummaryList } from 'Reducers/analyticsTwins/analyticsSummary/selector';
import { getCommunicationPreblast } from 'Reducers/analyticsTwins/analyticsSummary/request';
import useQueryParams from 'Hooks/useQueryParams';
import RSPPophover from 'Components/RSPPophover';
import { CommonSkeleton, ReportOverviewColumnChartSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
const ChartCountLabel = ({ total, percent }) => (
    <span className='d-flex align-items-baseline'>
        {total} ({percent} <div className='ml-3 fs8'>%</div>)
    </span>
);
const OverviewCard = ({ cardData, downloadUI }) => {
    const dispatch = useDispatch();
    // const { state } = useLocation();
    const state = useQueryParams('/analyticsTwins/analytics-report');
    const { total, data } = cardData;
    // console.log('data: ', data);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const preBlast = useSelector((state) => getPreBlast(state));
    const summary = useSelector((state) => getSummaryList(state));
    const getTotalValue = summary?.factModel || 0;

    function getConversionStats(summary) {
        const toSafeNumber = (value) => (Number.isFinite(value) ? value : 0);

        const totalOnlineConversions =
            Number(summary?.channelConversionInfo?.totalOnlineConversionCount ?? 0) || 0;
        const totalOfflineConversions =
            Number(summary?.channelConversionInfo?.totalOfflineConversionCount ?? 0) || 0;
        const totalEngagements = Number(summary?.channelEngagementInfo?.totalEngagementCount ?? 0) || 0;
        const totalReach = Number(summary?.channelReachInfo?.totalReachCount ?? 0) || 0;

        const offlineRaw = totalReach > 0 ? (totalOfflineConversions / totalReach) * 100 : 0;
        const onlineRaw = totalEngagements > 0 ? (totalOnlineConversions / totalEngagements) * 100 : 0;

        const offlinePercentage = toSafeNumber(Math.round(offlineRaw * 100) / 100);
        const onlinePercentage = toSafeNumber(Math.round(onlineRaw * 100) / 100);
          
        const finalRaw = offlinePercentage > 0 && onlinePercentage > 0 ?  (offlinePercentage + onlinePercentage) / 2 : offlinePercentage +onlinePercentage;
        const finalConversionPercentage = toSafeNumber(Math.round(finalRaw * 100) / 100);

        return {
            totalOnlineConversions,
            totalOfflineConversions,
            totalEngagements,
            totalReach,
            offlinePercentage,
            onlinePercentage,
            finalConversionPercentage,
        };
    }

    const handleKeyInChannelName = (channelName) => {
        switch (channelName) {
            case 'mobile':
                return 'sms'
            default:
                return channelName;
        }
    }

    const getChannelNameById = (channelId) => {
        switch (channelId) {
            case 1:
                return 'email';
            case 2:
                return 'mobile';
            case 3:
                return 'qrCode';
            case 4:
                return 'orm';
            case 5:
                return 'socialMedia';
            case 7:
                return 'facebookApp';
            case 8:
                return 'webPush';
            case 9:
            case 14:
                return 'mobilePush';
            case 10:
                return 'paidMedia';
            case 13:
                return 'webinar';
            case 15:
                return 'video';
            case 16:
                return 'app';
            case 21:
                return 'whatsapp';
            case 25:
                return 'vms';
            case 26:
                return 'voice';
            case 30:
                return 'line';
            case 33:
                return 'directMail';
            case 34:
                return 'webhook';
            case 41:
                return 'rcs';
            default:
                return null;
        }
    }

    const finalCountChannelList = Object.entries(getTotalValue)?.reduce((acc, [key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            const totalCount = value.reduce((sum, item) => sum + (item?.channelSentCount || 0), 0);
            acc.push({ channelName: handleKeyInChannelName(key), count: totalCount });
        } else {
            acc.push({ channelName: key, count: 0 });
        }
        return acc;
    }, []);
    const { summaryLoading } = useSelector((state) => state.analyticsReportReducer);
    const { factModel, channelList, campaignType } = summary;
    // const filteredArray =
    // channelList?.length === 1 && channelList[0] === 10 ? data.filter((item) => item.title !== 'Reach') : data;
    const [isSelectIndex, setSelectIndex] = useState(-1);
    const [isIconToggle, setIconToggle] = useState(true);
    const [isZindex, setZindex] = useState(-1);
    const [isDetailShow, setDetailShow] = useState(false);
    const [currentChannel, setCurrentChannel] = useState({
        channel: {},
        currentName: null,
        channelsList: [],
    });
    const { channel, currentName, channelsList } = currentChannel;

    const [counts, setCounts] = useState([]);
    const [barchart, setBarchart] = useState(false);
    const [filterType, setFilterType] = useState('reach');
    const [columnChartData, setcolumnChartData] = useState([]);

    const channelName = currentName?.name ?? null;
    const audience = {
        totalAudienceCnt: channel?.totalAudienceCnt ?? 0,
        totalAudience: channel?.totalSentValue || 0,
        uniqueAudience: channel?.uniqueAudienceCnt ?? 0,
        spam: channel?.beforeSpamCnt ?? 0,
        bounced: channel?.beforeBouncedCnt ?? 0,
        unSubscribed: (channel?.beforeUnsubscribeCnt != null ? channel.beforeUnsubscribeCnt : channel?.unsubscribeCnt) ?? 0,
        supressionList: channel?.suppressionListCnt ?? 0,
        frequencyCap: channel?.beforeFrequencyCapCnt ?? 0,
        sentCount: channel?.totalSentValue ?? 0,
        cgCount: channel?.controlGroupCnt ?? 0,
        dndCount: channel?.beforeDNDCnt ?? 0,
        optedOut: channel?.optedOut ?? 0,
        afterdndCount: handleInfoCount(factModel, currentName?.name, 'dndCount', campaignType) || 0,
        deliveyCount: handleInfoCount(factModel, currentName?.name, 'deliveredCount', campaignType) || 0,
        messageCount: handleInfoCount(factModel, currentName?.name, 'messageCount', campaignType) || 0,
        totalAudienceCount: handleInfoCount(factModel, currentName?.name, 'totalAudienceCount', campaignType) || 0,
        totalRecipientCount: handleInfoCount(factModel, currentName?.name, 'totalNoOfRecipientsCount', campaignType) || 0,
        noOfMessageCount: handleInfoCount(factModel, currentName?.name, 'noOfAudienceCount', campaignType) || 0,
        mobilePushCount: handleInfoCount(factModel, currentName?.name, 'messageCount', campaignType) || 0,
        appUninstallCount: handleInfoCount(factModel, currentName?.name, 'appUninstallCount', campaignType) || 0,
        afterBounced:
            factModel?.[currentName?.name?.toLowerCase()]?.reduce(
                (acc, item) =>
                acc +
                (item?.softBouncedCount || 0) +
                (item?.quarantinedCount || 0) +
                (item?.hardBouncedCount || 0),
                0
            ) || 0,
        mobilePushUndeliveredCount:
            handleInfoCount(factModel, currentName?.name, 'unDeliveredCount', campaignType) || 0,
        mobilePushDeliveredCount:
            handleInfoCount(factModel, currentName?.name, 'totalDeliveredCount', campaignType) || 0,
        mobilePushMessageCount: handleInfoCount(factModel, currentName?.name, 'totalMessageCount', campaignType) || 0,
    };

    useEffect(() => {
        const channelList = preBlast?.map((item) => {
            return {
                id: item?.channelId,
                name: item?.channelId === 2 ? 'SMS' : getChannelId(item?.channelId)?.label,
            };
        })?.sort((a, b) => a.id - b.id); 
        
        const uniqueChannelList = channelList?.filter((channel, index, self) => 
            index === self.findIndex((c) => c?.id === channel?.id)
        );
        
        const firstChannelId = uniqueChannelList[0]?.id;
        const firstChannelData = preBlast?.filter((res) => res.channelId === firstChannelId);
        const aggregatedFirstChannel = firstChannelData?.length > 0
            ? firstChannelData.reduce((acc, item) => ({
                ...acc,
                totalSentValue: (acc.totalSentValue || 0) + (item?.totalSentValue || 0),
                totalAudienceCnt: (acc.totalAudienceCnt || 0) + (item?.totalAudienceCnt || 0),
                uniqueAudienceCnt: (acc.uniqueAudienceCnt || 0) + (item?.uniqueAudienceCnt || 0),
                beforeSpamCnt: (acc.beforeSpamCnt || 0) + (item?.beforeSpamCnt || 0),
                beforeBouncedCnt: (acc.beforeBouncedCnt || 0) + (item?.beforeBouncedCnt || 0),
                beforeUnsubscribeCnt: (acc.beforeUnsubscribeCnt ?? 0) + (item?.beforeUnsubscribeCnt ?? 0),
                unsubscribeCnt: (acc.unsubscribeCnt || 0) + (item?.unsubscribeCnt || 0),
                suppressionListCnt: (acc.suppressionListCnt || 0) + (item?.suppressionListCnt || 0),
                beforeFrequencyCapCnt: (acc.beforeFrequencyCapCnt || 0) + (item?.beforeFrequencyCapCnt || 0),
                controlGroupCnt: (acc.controlGroupCnt || 0) + (item?.controlGroupCnt || 0),
                beforeDNDCnt: (acc.beforeDNDCnt || 0) + (item?.beforeDNDCnt || 0),
                channelId: firstChannelId,
                optedOut: (acc.optedOut || 0) + (item?.optedOut || 0),
            }), {})
            : {};
        
        setCurrentChannel((prev) => ({
            ...prev,
            channelsList: uniqueChannelList,
            channel: aggregatedFirstChannel,
            currentName: uniqueChannelList[0],
        }));
    }, [preBlast]);

    useEffect(() => {
        if (Object?.keys(summary)?.length) {
            // const countList = [
            //     handlePercentage(summary?.channelReachInfo?.totalReachCount, summary?.totalRecipientsCount),
            //     handlePercentage(
            //         summary.channelEngagementInfo?.totalEngagementCount,
            //         summary?.channelReachInfo?.totalReachCount,
            //     ),
            //     handlePercentage(
            //         summary.channelConversionInfo?.totalConversionCount,
            //         summary.channelReachInfo?.totalReachCount,
            //     ),
            // ];
            const toPct = (val) => {
                if (val === false || val == null) return 0;
                const n = Number(val);
                return Number.isFinite(n) ? n : 0;
            };
            const countList = [
                toPct(summary?.channelReachInfo?.reachPercentage ?? 0),
                toPct(summary?.channelEngagementInfo?.engagementPercentage ?? 0),
                toPct(summary?.channelConversionInfo?.conversionPercentage ?? 0),
            ];
            setCounts(countList);
        } else {
            setCounts([0,0,0]);
        }
    }, [summary]);
    const getPreBlastChannelList = async () => {
        if (!preBlast?.length) {
            const payload = {
                campaignId: state?.from,
                clientId,
                userId,
                departmentId,
            };
            await dispatch(getCommunicationPreblast({ payload }));
        }
        setDetailShow(!isDetailShow);
    };
    useEffect(() => {
            if (Number(summary?.channelConversionInfo?.totalOfflineConversionCount ?? 0) > 0) {
                setFilterType('reach')
            }
        }, [summary]);

    const chartValues = useMemo(() => {
        return (counts || []).map((count) => {
            const val = +String(count).replace('%', '');
            if (typeof val === 'number' && !isNaN(val)) return val;
            return 0;
        });
    }, [counts]);

    let displayText = '';

    for (const key in factModel) {
        if (Array.isArray(factModel[key]) && factModel[key]?.length > 0 && factModel[key][0]?.blastName) {
            displayText += `${factModel[key][0].blastName}`;
        }
    }

    const displayData = displayText.trim();

    useEffect(() => {
        if (Object?.keys(summary)?.length > 0) {
            const columChartValue = chartValue(filterType, summary);
            setcolumnChartData(columChartValue);
            const data =
                summary?.channelList?.includes(10) && summary?.channelList?.length === 1
                    ? columChartValue
                          ?.map((item) =>
                              item?.name === 'Engagement'
                                  ? {
                                        ...item,
                                        data: (item?.data ?? []).map((dataItem) => ({
                                            ...dataItem,
                                            value: '100%',
                                        })),
                                    }
                                  : item,
                          )
                          .filter((item) => item?.name !== 'Reach')
                    : columChartValue;

            setcolumnChartData(data);
        }
    }, [summary, filterType]);
    const [isScrolling, setIsScrolling] = useState(false);
    let scrollTimeout = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setIsScrolling(false);
            }, 300);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout.current);
        };
    }, []);

    const conversionValues = getConversionStats(summary);
    const isPaidMediaOnly = channelList?.includes(10) && channelList?.length === 1;
    const columnChartRowCount = isPaidMediaOnly ? 2 : 3;

    return (
        <div className={`analytic-summary-card mb30 ${downloadUI ? 'active' : ''}`}>
            {
                // numberWithCommas(total) > 0 ?
                <div className="a-card-header">
                    <div className="a-card-label">
                        {!barchart ? (
                            <>
                            {summaryLoading ? 
                            <div className='d-flex gap-2'>
                                <CommonSkeleton width = {70} height = {20} box/>
                                <CommonSkeleton width = {22} height = {22} circle/>
                            </div>
                        :
                        <>
                          <h4 className="m0">{TOTAL_COMMUNICATION_SENT}: <span className='fs-bold'>{formatNumber(total)}</span></h4>
                                <span className={`${downloadUI ? 'd-none' : campaignType === 'T'? 'pe-none click-off' : ''}`}>
                                    {!(channelList?.includes(10) && channelList?.length === 1) && (
                                        <Icon
                                            mainClass="top-1"
                                            icon={circle_info_medium}
                                            id="rs_data_circle_info"
                                            size="md"
                                            color="color-primary-blue"
                                            callBack={getPreBlastChannelList}
                                            tooltip="Info"
                                        />
                                    )}
                                </span>
                        </>}
                              
                            </>
                        ) : null}

                        {/* <i className={`${circle_info_mini} icon-sm color-primary-blue`}></i> */}
                    </div>
                  {summaryLoading ? 
                     <div className="a-card-dropdown-icon">
                  <div className='float-end analytics-icon-group d-flex gap-2 right21'>
                      <CommonSkeleton width = {22} height = {22} circle/>
                         <CommonSkeleton width = {22} height = {22} circle/>
                    </div>
                     </div>
                : 
                  <div className="a-card-dropdown-icon">
                    <Icons groupCass={`float-end analytics-icon-group d-flex ${barchart ? 'mt24' : ''} ${isDetailShow ? 'click-off pe-none' : ''}`}>
                            <BootstrapDropdown
                                data={
                                    (channelList?.includes(10) && channelList?.length === 1)
                                        ? [
                                              { id: 'target', name: '% By target' },
                                              { id: 'engagement', name: '% By engagement' },
                                          ]
                                        : [
                                              // { id: 'goal', name: '% By goal' },
                                              // { id: 'reach', name: '% By reach' },
                                              { id: 'target', name: '% By target' },
                                              { id: 'reach', name: '% By reach' },
                                              { id: 'engagement', name: '% By engagement' },
                                          ]
                                }
                                defaultItem={{
                                    id: 'default',
                                    name: (
                                        <Icon
                                            icon={bar_filter_medium}
                                            size="md"
                                            tooltip="Filter"
                                            callBack={() => {}}
                                        />
                                    ),
                                }}
                                isActive
                                alignRight={true}
                                showUpdate={false}
                                className={`${barchart ? 'pe-none click-off' : ''}  mr10 no_caret`}
                                isObject
                                fieldKey="name"
                                onSelect={(goal) => {
                                    const { id } = goal;
                                    setFilterType(id);
                                    setCounts(getPercentages(id, summary, data));
                                }}
                            />
                            {/*  */}
                            <Icon
                                icon={!barchart ? bar_chart_medium : vertical_view_medium}
                                size="md"
                                tooltip={!barchart ? 'Column chart' : 'Overview'}
                                callBack={() => {
                                    setBarchart(!barchart);
                                }}
                            />
                        </Icons>
                    </div>}
                </div>
                // : <div className='px20 pt20 pb0'>
                //     <DetailOverviewHeadSkeleton />
                // </div>
            }
            {barchart && !isDetailShow &&  (
                  <div className='chart-header'>
                  <div className='chart-title dark pull-right'>
                    <h4>{TOTAL}: <span>{formatNumber(total)}</span></h4>
                          </div>
                  </div>
            )}
            {barchart ? (
                <div className="">
                    {summaryLoading ? (
                        <ReportOverviewColumnChartSkeleton rowCount={columnChartRowCount} />
                    ) : checkForNonZeroElements(chartValues) ? (
                        <>
                            <div className="attri-roi-contianer report-overview-port">
                                <ul>
                                    {columnChartData?.map((item, index) => {
                                        return (
                                            <li key={index}>
                                                <div className="attri-icon-set">
                                                    <div className="attri-icon">
                                                        <h5>{item.name}</h5>
                                                    </div>
                                                </div>
                                                <ul className="attri-progress-set">
                                                    {(item?.data ?? []).map((dt, indx) => {
                                                        return (
                                                            <li
                                                                className={dt?.color}
                                                                style={{ width: dt?.value || '0%' }}
                                                                key={indx}
                                                            >
                                                                <RSTooltip
                                                                    text={`List segmentation ${indx + 1} (${dt.value})`}
                                                                    innerContent={false}
                                                                >
                                                                    <div className="attri-pro-set-block">
                                                                        {dt.count ? (
                                                                            <ChartCountLabel
                                                                                total={dt.count.total}
                                                                                percent={dt.count.percent}
                                                                            />
                                                                        ) : null}
                                                                    </div>
                                                                </RSTooltip>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            {/* <RSHighchartsContainer
                                options={barChartOptions(reportCardChart)}
                            /> */}
                        </>
                    ) : (
                        <ReportOverviewColumnChartSkeleton
                            isError
                            rowCount={columnChartRowCount}
                        />
                    )}
                </div>
            ) : (
                <div className={`a-card-list-wrapper ${(channelList?.includes(10) && channelList?.length === 1) ? 'card-list-reach' : ''}`}>
                    {data?.length ? (
                        data.map((item, index) => {
                            const infoValue = truncateTitle(item?.percentage, item?.percentage?.length - 1);
                            if (channelList?.includes(10) && channelList?.length === 1 && item?.title === 'Reach') {
                                return null;
                            }
                            return (
                                <div
                                    className={`a-card-list ${isSelectIndex === index ? 'active' : ''}
                                    ${(channelList?.includes(10) && channelList?.length === 1) && item?.title === 'Reach' ? 'click-off' : ''} 
                                    ${downloadUI ? 'active' : ''} 
                                    ${isZindex === index ? 'z-2' : ''}`}
                                    key={item.title + index}
                                >
                                    {isSelectIndex === index && (
                                        <div
                                            className="position-relative top-28 z-1"
                                            onClick={() => {
                                                setSelectIndex(-1);
                                                setIconToggle(true);
                                                setTimeout(() => {
                                                    setZindex(-1);
                                                }, 500);
                                            }}
                                        >
                                            <RSIcon
                                                className="icon-md"
                                                color="color-primary-blue"
                                                innerCloseContent={false}
                                            />
                                        </div>
                                        // <i
                                        //     className={`${circle_close_fill_medium} icon-md close-sum-report`}
                                        //     onClick={() => {
                                        //         setSelectIndex(-1);
                                        //         setIconToggle(true);
                                        //         setTimeout(() => {
                                        //             setZindex(-1);
                                        //         }, 500);
                                        //     }}
                                        // ></i>
                                    )}
                                    <div className={`card-center align-items-lg-baseline ${downloadUI ? "flex-wrap": ''}`}>
                                        <img src={summaryImages[item?.title]} className="a-card-bg-img" />
                                        <p className={`position-relative lh-sm font-smd ${downloadUI ? "mt10": ''}`}>{item.title}</p> 
                                        <h1 className={`font-bold ${downloadUI ? 'position-relative top1' : ''}`}> 
                                            {formatNumber(item.count)}
                                        </h1>
                                        <div className="d-flex position-relative top-3 font-sm">
                                            <div className="percent-arro">
                                                <span>
                                                    {`(${counts[index] !== null ? counts[index] : 0}`}
                                                    <sub>%</sub>)
                                                </span>
                                                {isIconToggle ? (
                                                    <i
                                                        className={`downloadHide ${
                                                            circle_arrow_right_medium
                                                        } icon-md color-primary-white ${
                                                            item?.disabled ? 'click-off' : ''
                                                        }`}
                                                        onClick={() => {
                                                            setSelectIndex(index);
                                                            setIconToggle(false);
                                                            setZindex(index);
                                                        }}
                                                        id="rs_OverviewCard_arrow_right"
                                                    ></i>
                                                ) : (
                                                    <i
                                                        className={`downloadHide ${circle_arrow_left_medium} icon-md color-primary-white`}
                                                        onClick={() => {
                                                            setSelectIndex(-1);
                                                            setIconToggle(true);
                                                        }}
                                                        id="rs_OverviewCard_arrow_left"
                                                    ></i>
                                                )}
                                                {(item.title === 'Conversion' && !downloadUI) && (
                                                    <Icon
                                                        icon={circle_info_medium}
                                                        id="rs_data_circle_info"
                                                        size="md"
                                                        color="color-whites"
                                                        pophover={
                                                            <>
                                                                <span>
                                                                    {ONLINE}:{' '}{numberWithCommas(conversionValues?.totalOnlineConversions)} (
                                                                    {conversionValues?.onlinePercentage}
                                                                    <sub>%</sub>)
                                                                </span>
                                                                <br />
                                                                <span>
                                                                    {OFFLINE}:{' '}{numberWithCommas(conversionValues?.totalOfflineConversions)}{' '}
                                                                    ({conversionValues?.offlinePercentage}
                                                                    <sub>%</sub>)
                                                                </span>
                                                                {/* <span>
                                                                    Total {item.title}: {numberWithCommas(item.count)}
                                                                </span> */}
                                                            </>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer css-scrollbar">
                                        <ul className={
                                                isIconToggle 
                                                    ? 'd-flex justify-content-end flex-column'
                                                    : ''
                                            }>
                                            {item?.socialMedia?.filter((data) => {
                                                // Filter out channels with no data
                                                return data?.count > 0 && data?.count !== 'NA';
                                            })?.map((data, index) => {
                                                // console.log('datasocials: ', data);
                                                if (index < 4 || !isIconToggle) {
                                                    return (
                                                        <li key={'aa260-overviewcard-social' + index}>
                                                            <div className="aicon">
                                                                <Icon
                                                                    mainClass="position-static"
                                                                    icon={`${data?.icon} ${data?.disabled ? 'click-off' : ''
                                                                        }`}
                                                                    size="md card-round-icon mr5"
                                                                    tooltip={
                                                                        data?.channel === 'messaging'
                                                                            ? 'SMS'
                                                                            : data?.Channel || data?.channel
                                                                    }
                                                                    innerContent={true}
                                                                />
                                                            </div>
                                                            <div className="acount d-flex align-items-center">
                                                                <p
                                                                    className={`position-relative ${downloadUI ? 'top4' : 'top3'
                                                                        } ${data?.disabled ? 'click-off' : ''} font-sm`}
                                                                >
                                                                    {numberWithCommas(data?.count)}
                                                                </p>
                                                                {!data?.disabled && (
                                                                    <>
                                                                        {!isScrolling && (
                                                                            <RSPPophover
                                                                                position="top"
                                                                                customText={numberWithCommas(data?.pophoverText)}
                                                                                className={`overview-card`}
                                                                            >
                                                                                <i
                                                                                    className={`${circle_info_mini
                                                                                        } icon-xs ml5 position-relative top3 ${downloadUI ? 'd-none' : ''
                                                                                        }  ${data?.hasFactModelData ? '' : 'click-off'}`}
                                                                                    id="rs_data_circle_info"
                                                                                />
                                                                            </RSPPophover>
                                                                        )}
                                                                        {(!isScrolling && !data?.hasFactModelData) || isScrolling && (
                                                                            <i
                                                                                className={`${circle_info_mini
                                                                                    } icon-xs ml5 position-relative top3 ${downloadUI ? 'd-none' : ''
                                                                                    } ${!data?.hasFactModelData ? 'click-off' : ''}`}
                                                                                id="rs_data_circle_info"
                                                                            />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                }
                                            })}
                                        </ul>

                                        <div className="ratio-container mt15">
                                            <h5 className="ml0 font-smd mb19">{item.title} ratio</h5>
                                            <ul>
                                                {item?.socialMedia?.filter((data) => {
                                                    // Filter out channels with no data
                                                    return data?.count > 0 && data?.count !== 'NA';
                                                })?.map((data, index) => (
                                                    <li key={'aa260-overviewcard-social-ratio' + index}>
                                                        <div className="aicon">
                                                            <Icon
                                                                icon={`${data?.icon} ${data?.disabled ? 'click-off' : ''
                                                                    }`}
                                                                size="md card-round-icon mr5"
                                                                // color="color-whites"
                                                                tooltip={data?.Channel || data?.channel}
                                                            // innerContent={true}
                                                            />
                                                        </div>
                                                        <div className="aratio d-flex align-items-center w-100">
                                                            <p
                                                                className={`position-relative ${downloadUI ? 'top4' : 'top3'
                                                                    } ${data?.disabled ? 'click-off' : ''} pr7`}
                                                            >
                                                                {data?.ratio}
                                                            </p>
                                                            {!data?.disabled && (
                                                                <RSTooltip
                                                                    position="top"
                                                                    //text={`${displayData}(${data?.count})`}
                                                                    customText={data?.ratioPophoverText}
                                                                    innerContent={false}
                                                                >
                                                                    <i
                                                                        className={`${circle_info_mini
                                                                            } icon-xs position-relative top3 ${downloadUI ? 'd-none' : ''
                                                                            }`}
                                                                        id="rs_data_circle_info"
                                                                    />
                                                                </RSTooltip>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={`width100p p20 mt10 `}>
                            <DetailOverviewSkeleton isError={!summaryLoading} />
                            {/* {/ <HorizontalSkeleton isError={true} /> /} */}
                        </div>
                    )}
                </div>
            )}

            {/* DETAIL INFO */}
            <div className={`detail-info-preview ${isDetailShow ? 'show' : ''}`}>
                <div className="detail-header">
                    <div className="d-header-left">
                        <Icon
                            icon={getChannelId(currentName?.id)?.icon}
                            size="md"
                            iconClass="mr10"
                            color="color-whites"
                            callBack={() => { }}
                        />
                        <h4 className='font-smd'>
                            {/* {channelName} */}
                            {channel?.channelId !== 3 && <span> Total audience: {numberWithCommas(channel?.totalAudienceCnt ?? 0)}</span>}
                        </h4>
                    </div>

                    <div className="d-header-right">
                        <BootstrapDropdown
                            data={channelsList}
                            defaultItem={currentName}
                            alignRight={true}
                            isObject
                            fieldKey="name"
                            containerClass="theme-white"
                            className="arrowdropdown"
                            onSelect={(channel) => {
                                const { id } = channel;
                                const currentChannel = preBlast?.filter((res) => res.channelId === id);
                                const aggregatedChannel = currentChannel?.length > 0
                                    ? currentChannel.reduce((acc, item) => ({
                                        ...acc,
                                        totalSentValue: (acc.totalSentValue || 0) + (item?.totalSentValue || 0),
                                        totalAudienceCnt: (acc.totalAudienceCnt || 0) + (item?.totalAudienceCnt || 0),
                                        uniqueAudienceCnt: (acc.uniqueAudienceCnt || 0) + (item?.uniqueAudienceCnt || 0),
                                        beforeSpamCnt: (acc.beforeSpamCnt || 0) + (item?.beforeSpamCnt || 0),
                                        beforeBouncedCnt: (acc.beforeBouncedCnt || 0) + (item?.beforeBouncedCnt || 0),
                                        beforeUnsubscribeCnt: (acc.beforeUnsubscribeCnt ?? 0) + (item?.beforeUnsubscribeCnt ?? 0),
                                        unsubscribeCnt: (acc.unsubscribeCnt || 0) + (item?.unsubscribeCnt || 0),
                                        suppressionListCnt: (acc.suppressionListCnt || 0) + (item?.suppressionListCnt || 0),
                                        beforeFrequencyCapCnt: (acc.beforeFrequencyCapCnt || 0) + (item?.beforeFrequencyCapCnt || 0),
                                        controlGroupCnt: (acc.controlGroupCnt || 0) + (item?.controlGroupCnt || 0),
                                        beforeDNDCnt: (acc.beforeDNDCnt || 0) + (item?.beforeDNDCnt || 0),
                                        optedOut: (acc.optedOut || 0) + (item?.optedOut || 0),
                                        channelId: id,
                                    }), {})
                                    : {};
                                setCurrentChannel((pre) => ({
                                    ...pre,
                                    channel: aggregatedChannel,
                                    currentName: channel,
                                }));
                            }}
                        />
                        <RSIcon
                            className="icon-md"
                            color="color-primary-blue"
                            innerCloseContent={false}
                            closeTooltipPosition = 'left'
                            handleClose={() => {
                                setDetailShow(false);
                            }}
                        />
                    </div>
                </div>
                <InfoOverview audience={audience} infoSelectedType={currentName?.name} />
            </div>
        </div>
    );
};

export default OverviewCard;
