import { formatNumber } from 'Utils/modules/campaignUtils';
import { hasNonZeroEngagementData, hasValidPieChartData } from 'Utils/modules/charts';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../Components';
import { CAMPAIGN_SMS_GRID_COLUMN_DATA, COMMUNICATION_PERFORMANCE, TOP_LINK_ACTIVITY, areachangeToBase64, changeToBase64, defaultValues, getPreviewData, handleChannelInfo, handleSegmentData, handleSplit, pieChartOption } from '../../constants';
import { useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { keyMetrixData, overview_data } from './data';
import ClickMapModal from '../../Components/ClickMapModal';
import SplitHeader from '../../Components/SplitHeader';

import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import TabbarAreasPlineChart from '../../Components/Charts/TabbarAreasPlineChart';
import ColumnChart from '../../Components/Charts/ColumnChart';
import PieChart from '../../Components/Charts/PieChart';
import { getDetailReport_OverviewDetails } from 'Reducers/analytics/details/request';
import { useDispatch, useSelector } from 'react-redux';

import { getSessionId } from 'Reducers/globalState/selector';
import TotalActivity from '../../Components/DetailTable/TotalActivity';
import DetailListDataTable from '../../Components/DetailTable/DetailListDataTable';
import useQueryParams from 'Hooks/useQueryParams';
import AreasPlineChart from '../../Components/Charts/AreasPlineChart';
import { updateDetailsMainList } from 'Reducers/analytics/details/reducer';
import { DetailAnalyticsChannelPortletLoader } from 'Components/Skeleton/Skeleton';

const DetailAnalyticsSms = ({ type, isDownloadUI }) => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/analytics/detail-analytics');
    const isWinnerSplit = locationData?.iswinnerSplit;
    const isWinnerSplitType = locationData?.iswinnerSplitType;
    const groupWinnerSplitType = locationData?.groupWinnerSplitType || '';
    const effectiveWinnerSplitType = isWinnerSplitType || groupWinnerSplitType;
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const channelId = getChannelId(type)?.id;

    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [isDownloadUILocal, setIsDownloadLocal] = useState(false);
    const [splitItem, setSplitItem] = useState('Actual communication');
    const [filterListValue, setFilterListValue] = useState({
        filterData: [],
        key: '',
    });
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [filterDetails, setFilterDetails] = useState({});
    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        previewData: '',
        com_status: '',
        isOverviewPreviewModal: false,
                                                    isPreviewLoading: false,
        date:''
    });
    const { overviewDetail, channelDetail, segmentDetail, fromSplitHeader, isLoading, segmentId } = useSelector(
        ({ analyticsDetails }) => analyticsDetails,
    );
       const splitAb = useMemo(() => {
            const isSplitABScheduler = locationData?.isSplitABScheduler;
            const splitName = locationData?.splitName;
            const splitType = splitName?.split(' ')[1];
            
            if (isSplitABScheduler && !(Object.keys(filterDetails)?.length > 0 && fromSplitHeader)) {
                return splitType;
            }
            if (splitItem === 'Actual communication' && isWinnerSplit) {
                return 'ACT';
            } else if (splitItem?.startsWith('Split ')) {
                return splitItem?.replace('Split ', '')?.trim();
            }
            return undefined;
        }, [locationData, filterDetails, fromSplitHeader, splitItem, isWinnerSplit]);
    // Calculate effectiveSegmentId using the same logic as DetailListDataTable
    const effectiveSegmentId = useMemo(() => {
        if (segmentId !== null && segmentId !== undefined) {
            return segmentId;
        }
        if (segmentDetail?.segments && Array.isArray(segmentDetail.segments) && segmentDetail.segments.length > 1) {
            return segmentDetail.segments[1]?.segmentId;
        }
        if (segmentDetail?.segments && Array.isArray(segmentDetail.segments) && segmentDetail.segments.length > 0) {
            return segmentDetail.segments[0]?.segmentId;
        }
        return null;
    }, [segmentId, segmentDetail]);
    

    const {
        reach,
        engagement,
        conversion,
        segmentLists,
        reachPerformanceJson,
        reachPerformanceHrsJson,
        keyMetrics,
        enagegementPerformanceJson,
        enagegementPerformanceHrsJson,
        conversionPerformanceJson,
        blastAudienceJson,
        campaignStatusInfoJson,
        mobileOsInfoJson,
        deviceInfoJson,
        topOsValue,
        topOs,
        activityStatus,
        jobDateTime,
        isSplitEnabled,
        advanceAnalyticsList = [],
    } = overviewDetail || defaultValues;
    // console.log('jobDateTime: ', jobDateTime);
    const {
        isCampaignCSVModal,
        isLinkClickCSVModal,
        isClickMapModal,
        previewData,
        com_status,
        isOverviewPreviewModal,
        isPreviewLoading,
        date,
        imagePath,
        subject,
        carouselJSON,
        isCarousel,
        header,
        footer,
        footerContent,
        senderName,
        notifications,
        notification,
        slides
    } = states;
    const { isHybrid } = getUserDetails();
    // const dateField = getUserDateTimeFormat(jobDateTime, 'formatDateTime');
    const dateField = jobDateTime;
    const handlePreviewDetails = async (data) => {
        const currentBlastId = filterDetails?.blastShortCode || analyticsDetatils?.blastId;
        const channelInfo = channelDetail?.isSplitEnabled ? channelDetail?.splitChannelLevelInfo : channelDetail?.channelInfos;
        const currentChannelInfo = channelInfo?.find(
            (info) => info.blastShortCode === currentBlastId
        );
            const getWinnerChannel_Detaild = handleChannelInfo(channelDetail, locationData);
            const channelDetailId = currentChannelInfo?.channelDetailid || 0;
            let getWinnerChannelDetaild = getWinnerChannel_Detaild[0]?.channelDetailid ||channelDetailId;                         
        
            const finalChannelDetailId = splitItem === 'Actual communication' ? getWinnerChannelDetaild : channelDetailId;

        let payload = {
            departmentId,
            clientId,
            userId,
            campaignId: channelDetail?.campaignID,
            blastId: currentBlastId,
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
            channelDetailId: finalChannelDetailId,
            // blastguid: channelDetail?.campaignGuid,
        };
        // const response = await dispatch(getDetailReport_ContentDetails(payload));
        // if (response?.status) {
        //     setState((pre) => ({ ...pre, isClickMapModal: true, previewData: response?.data }));
        // } else {
        //     console.log(response.error);
        //     setState((pre) => ({ ...pre, isClickMapModal: true, previewData: '' }));
        // }

        // different api in overview and clickmap changes

        getPreviewData(dispatch, setState, payload, data, channelDetail);
    };

    const getData = async (filterData) => {
        setSplitItem(filterData?.splitData);
        setFilterDetails(filterData);
        let splitData;
        if (filterData?.splitData === 'Actual communication') {
            splitData = 'ACT';
        } else if (filterData?.splitData?.startsWith('Split ')) {
            splitData = filterData.splitData.replace('Split ', '').trim();
        } else {
            splitData = undefined;
        }
        const payload = {
            channelId,
            clientId,
            userId,
            departmentId,
            campaignId: locationData?.campaignId, // analyticsDetatils?.campaignId,
            blastID: filterData?.blastShortCode || analyticsDetatils?.blastId,
            startDate: getYYMMDD(filterData?.selectedDate?.startDate),
            endDate: getYYMMDD(filterData?.selectedDate?.endDate),
            segment: filterData?.filterSelectedData,
            split: !!filterData?.splitData ? splitData : undefined,
            filterValue: filterData?.filterValue,
            isCG: filterData?.isCG,
            isTG: filterData?.isTG
        };
        if (overviewDetail?.isEmailCgTg) {
            payload.isTG = payload.isTG !== undefined ? payload.isTG : true;
            payload.isCG = payload.isCG !== undefined ? payload.isCG : false;
        }
        //await dispatch(getDetailReport_ChannelDetails({ payload }));
        dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
        dispatch(updateDetailsMainList({ field: 'overviewDetail', data: {} }));
        dispatch(updateDetailsMainList({ field: 'segmentId', data: filterData?.filterSelectedData || null }));
        await dispatch(getDetailReport_OverviewDetails({ payload }));
       
    };

    useEffect(() => {
        if (!fromSplitHeader) setFilterDetails({});
    }, [fromSplitHeader]);
    // console.log('Segements ::: ', segmentDetail);

    return (
        <div className={`page-content ${isDownloadUILocal ? 'download-page-setup-detail' : ''}`}>
            <Container className='px0'>
            {fromSplitHeader || Object.keys(overviewDetail)?.length > 0 ? (
                <div className="rs-csr-wrapper">
                    <SplitHeader
                        splitView={channelDetail?.isSplitEnabled}
                        splitViewCGTG={overviewDetail?.isSmsCgTg}
                        filterDropdown={
                            segmentDetail?.segments !== undefined
                                ? segmentDetail?.segments !== null
                                    ? segmentDetail?.segments?.length > 0
                                    : false
                                : false
                        }
                        datePicker={true}
                        advanceSearch={true}
                        sankey={false}
                        callbackSplit={getData}
                        // splitData={
                        //     channelDetail?.isSplitEnabled && channelDetail?.splitChannelLevelInfo !== undefined
                        //         ? handleSplit(channelDetail?.splitChannelLevelInfo)
                        //         : []
                        // }
                        splitData={
                            channelDetail?.isSplitEnabled && channelDetail?.splitChannelLevelInfo !== undefined
                                ? effectiveWinnerSplitType
                                    ? handleSplit(channelDetail?.splitChannelLevelInfo, effectiveWinnerSplitType)
                                    : (channelDetail?.splitChannelLevelInfo ?? []).map((item) => ({
                                          ...item,
                                          splitType: 'Split ' + item.splitType,
                                      }))
                                : []
                        }
                        filterData={
                            segmentDetail?.segments !== undefined
                                ? segmentDetail?.segments !== null
                                    ? handleSegmentData(segmentDetail?.segments)
                                    : []
                                : []
                        }
                        setFilterListValue={setFilterListValue}
                        advanceAnalyticsList={advanceAnalyticsList}
                        startDate={channelDetail?.startDate}
                        endDate={channelDetail?.endDate}
                        detailAnalytics
                        isDownloadUI={(flag) => {
                            setIsDownloadLocal(flag);
                            setTimeout(() => {
                                setIsDownloadLocal(false);
                            }, 10000);
                            isDownloadUI(flag);
                        }}
                        channelId={locationData?.channelId}
                        departmentId={departmentId}
                        campaignID={locationData?.campaignId}
                        blastID={locationData?.blastId}
                        downloadUI={isDownloadUILocal}
                    />
                    {Object.keys(overviewDetail)?.length > 0 ? (
                        <>
                            <OverviewGrid
                                infoIcon={true}
                                channelId={locationData?.channelId}
                                channelType={type}
                                isTime={true}
                                date={dateField}
                                handlePreviewDetails={() => {
                                    handlePreviewDetails('overview');
                                }}
                                campaignId={locationData?.campaignId}
                                downloadUI={isDownloadUILocal}
                                // previewImage={''}
                            />
                            <div className="filter-preview-bar d-none">
                                <span>
                                    {filterListValue.key} : {filterListValue?.filterData?.toString()}
                                </span>
                            </div>

                            <OverviewList dataObj={overview_data(reach, engagement, conversion)} />

                            <Row>
                                <div className="portlet-heading">
                                    <h3>{COMMUNICATION_PERFORMANCE}</h3>
                                </div>
                                {channelDetail?.campaignType === 'T' && (
                                    <Row className="x-axis-labels-performance pr0 m0">
                                        <Col md={12} className="pr0 portlet-container">
                                                <h4>Target audience</h4>
                                                <AreasPlineChart
                                                    areaPlineDataList={
                                                        blastAudienceJson && hasNonZeroEngagementData(blastAudienceJson)
                                                            ? changeToBase64(blastAudienceJson, 'area')
                                                            : {}
                                                    }
                                                />
                                        </Col>
                                    </Row>
                                )}
                                <Col md={8} className="position-relative">
                                    <TabbarAreasPlineChart
                                        heading={'Reach'}
                                        splitItemText={splitItem === 'A' ? `Day-wise unique audience` : ''}
                                        expandChartAction={() => setIsChartExpanded(!isChartExpanded)}
                                        isChartExpanded={isChartExpanded}
                                        splitItem={splitItem}
                                        expandViewStatus={true}
                                        footerStatus={false}
                                        overAllTextData={
                                            reachPerformanceJson && hasNonZeroEngagementData(reachPerformanceJson)
                                                ? changeToBase64(reachPerformanceJson, 'area')
                                                : {}
                                        }
                                        first24HoursData={
                                            reachPerformanceHrsJson && hasNonZeroEngagementData(reachPerformanceHrsJson)
                                                ? changeToBase64(reachPerformanceHrsJson, 'area')
                                                : {}
                                        }
                                        content={true}
                                    />
                                </Col>
                                <Col md={4}>
                                    <KeyMetricsNew
                                        data={
                                            keyMetrics !== undefined && keyMetrics !== null
                                                ? keyMetrixData(keyMetrics,filterDetails?.isCG, channelDetail?.campaignType === 'T')
                                                : []
                                        }
                                        pdfDownload={isDownloadUILocal}
                                        isChartExpanded={isChartExpanded}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="x-axis-labels-performance">
                                    <TabbarAreasPlineChart
                                        heading={'Engagement'}
                                        splitItemText={splitItem === 'A' ? `Day-wise unique audience` : ''}
                                        expandChartAction={() => setIsChartExpanded(!isChartExpanded)}
                                        // isChartExpanded={isChartExpanded}
                                        splitItem={splitItem}
                                        expandViewStatus={false}
                                        footerStatus={hasNonZeroEngagementData(enagegementPerformanceJson)}
                                        overAllTextData={
                                            !!enagegementPerformanceJson &&
                                            enagegementPerformanceJson?.length !== 0 &&
                                            hasNonZeroEngagementData(enagegementPerformanceJson)
                                                ? areachangeToBase64(enagegementPerformanceJson, 'areaFooter')
                                                : {}
                                        }
                                        first24HoursData={
                                            !!enagegementPerformanceHrsJson &&
                                            enagegementPerformanceHrsJson?.length !== 0 &&
                                            hasNonZeroEngagementData(enagegementPerformanceHrsJson)
                                                ? areachangeToBase64(
                                                      enagegementPerformanceHrsJson,
                                                      'areaFooter',
                                                  )
                                                : {}
                                        }
                                        overAllPercent={reach?.delivered}
                                        overAllText = {
                                             <>
                                                        total reach with <strong className='font-bold fs19 pl5'>
                                                        {engagement?.lnkclicks ? 
                                                            Number.isInteger(parseFloat(engagement?.lnkclicks)) ? 
                                                            parseFloat(engagement?.lnkclicks) : 
                                                            parseFloat(engagement?.lnkclicks).toFixed(1)
                                                        : 0}
                                                        </strong>
                                                        <small className='font-bold pr5 color-primary-black'>%</small> engagement rate occurred during this period
                                                    </>
                                         }
                                        first24HoursPercent={reach?.delivered}
                                        first24HoursText={  <>
                                                        total reach with <strong className='font-bold fs19 pl5'>
                                                        {engagement?.lnkclicks ? 
                                                            Number.isInteger(parseFloat(engagement?.lnkclicks)) ? 
                                                            parseFloat(engagement?.lnkclicks) : 
                                                            parseFloat(engagement?.lnkclicks).toFixed(1)
                                                        : 0}
                                                        </strong>
                                                        <small className='font-bold pr5 color-primary-black'>%</small> engagement rate occurred during this period
                                                    </>}
                                        content={true}
                                    />
                                </Col>

                                <Col md={6}>
                                    <ColumnChart
                                        title={'Conversion'}
                                        chartData={
                                            conversionPerformanceJson && hasNonZeroEngagementData(conversionPerformanceJson)
                                                ? changeToBase64(conversionPerformanceJson, 'columnFooter')
                                                : {}
                                        }
                                        footerPercent={formatNumber(conversion?.registration)}
                                        footerText={
                                            'of conversion happened during this period with ' +
                                            conversion?.count +
                                            ' users registered'
                                        }
                                        content={true}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <PieChart
                                        keyIndex={1}
                                        title={'Communication status'}
                                        chartData={
                                            !!campaignStatusInfoJson && hasValidPieChartData(campaignStatusInfoJson)
                                                ? pieChartOption(campaignStatusInfoJson, 'pieFooter', true)
                                                : {}
                                        }
                                        footerPercent={formatNumber(reach?.delivered)}
                                        footerText={'SMS have been delivered'}
                                    />
                                </Col>
                                <Col md={6}>
                                    <PieChart
                                        keyIndex={2}
                                        title={'Mobile OS info'}
                                        chartData={
                                            !!mobileOsInfoJson && hasValidPieChartData(mobileOsInfoJson)
                                                ? pieChartOption(mobileOsInfoJson, 'pieFooter',true)
                                                : {}
                                        }
                                        footerPercent={formatNumber(topOsValue)}
                                        footerText={`of user engagement is from ${!!topOs ? topOs : ''} OS`}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <TotalActivity
                                    handlePreviewDetails={handlePreviewDetails}
                                    ColumnListData={TOP_LINK_ACTIVITY}
                                    campaignId={locationData?.campaignId}
                                    // campaignId={analyticsDetatils?.campaignId}
                                    channelId={channelId}
                                    setState={setState}
                                    dateField={dateField}
                                    blastID={analyticsDetatils?.blastId}
                                    campaignName={channelDetail?.campaignName}
                                    filterDetails={filterDetails}
                                    splitItem={splitItem}
                                    isWinnerSplit={isWinnerSplit}
                                />
                            </Row>
                             {!(channelDetail?.campaignType === 'T' || isHybrid || channelDetail?.isMDCTrigger || (filterDetails?.audienceChanged && ['3', '5'].includes(String(filterDetails?.selectedListType)))) && (
                                <Row>
                                    <DetailListDataTable
                                        columnListData={CAMPAIGN_SMS_GRID_COLUMN_DATA}
                                        // campaignId={locationData?.campaignId}
                                        campaignId={channelDetail?.campaignID}
                                        // campaignId={analyticsDetatils?.campaignId}
                                        channelId={channelId}
                                        blastID={analyticsDetatils?.blastId}
                                        setState={setState}
                                        dateField={dateField}
                                        keyDetailList={activityStatus?.channelKeyDetailList}
                                        filterDetails={filterDetails}
                                        downloadUI={isDownloadUILocal}
                                        splitItem={splitItem}
                                        isWinnerSplit={isWinnerSplit}
                                    />
                                </Row>
                            )}

                            {/* Modals */}
                            <DownloadCSV
                                show={isCampaignCSVModal || isLinkClickCSVModal}
                                isAnalytics
                                isAnalyticsData={{
                                    campaignId: channelDetail?.campaignID,
                                    channelId: channelId,
                                    status: com_status,
                                    blastID: analyticsDetatils?.blastId,
                                    ...(effectiveSegmentId != null && { segmentId: effectiveSegmentId }),
                                    splitAb: splitAb,
                                }}
                                handleClose={() => {
                                    if (isCampaignCSVModal) {
                                        setState((prev) => ({
                                            ...prev,
                                            isCampaignCSVModal: false,
                                        }));
                                    } else {
                                        setState((prev) => ({
                                            ...prev,
                                            isLinkClickCSVModal: false,
                                        }));
                                    }
                                }}
                                confirm={() => {
                                    if (isCampaignCSVModal) {
                                        setState((prev) => ({
                                            ...prev,
                                            isCampaignCSVModal: false,
                                        }));
                                    } else {
                                        setState((prev) => ({
                                            ...prev,
                                            isLinkClickCSVModal: false,
                                        }));
                                    }
                                }}
                            />

                            {isOverviewPreviewModal && (
                                <ClickMapModal
                                    show={isOverviewPreviewModal}
                                            isPreviewLoading={isPreviewLoading}
                                    channelId={analyticsDetatils?.channelId || locationData?.channelId}
                                    handleClose={() =>
                                        setState((prev) => ({
                                            ...prev,
                                            isOverviewPreviewModal: false,
                                                    isPreviewLoading: false,
                                        }))
                                    }
                                    previewImage={previewData}
                                    scheduleDate={date}
                                    imagePath={imagePath}
                                    subject={subject}
                                    carouselJSON={carouselJSON}
                                    isCarousel={isCarousel}
                                    header={header}
                                    footer={footer}
                                    footerContent={footerContent}
                                    senderName={senderName}
                                    notifications={notifications}
                                    notification={notification}
                                    slides={slides}
                                />
                            )}
                        </>
                    ) : (
                        <DetailAnalyticsChannelPortletLoader isError={!isLoading} hideTabbarSkeleton={fromSplitHeader} />
                    )}
                </div>
            ) : (
                <DetailAnalyticsChannelPortletLoader isError={!isLoading} hideTabbarSkeleton={fromSplitHeader} />
            )}
            </Container>
        </div>
    );
};

export default DetailAnalyticsSms;
