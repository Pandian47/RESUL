import { formatNumber } from 'Utils/modules/campaignUtils';
import { hasValidPieChartData, hasNonZeroEngagementData } from 'Utils/modules/charts';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { seriesNameField } from '../../../../../../../../Constants/Charts/commonFunction';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../Components';
import { CAMPAIGN_GRID_MP_COLUMN_DATA, COMMUNICATION_PERFORMANCE, TOP_LINK_ACTIVITY, USER_ENGAGEMENT, changeToBase64, defaultValues, getDaywiseChartData, getHoursWiseChartData, getPreviewData, handleChannelInfo, handleSegmentData, handleSplit, mapChartOption, pieChartOption } from '../../constants';
import { useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { keyMetrixData, overview_data } from './data';
import ClickMapModal from '../../Components/ClickMapModal';
import SplitHeader from '../../Components/SplitHeader';

import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import TabbarAreasPlineChart from '../../Components/Charts/TabbarAreasPlineChart';
import ColumnChart from '../../Components/Charts/ColumnChart';
import PieChart from '../../Components/Charts/PieChart';
import MapChart from '../../Components/Charts/MapChart';
import { getDetailReport_OverviewDetails } from 'Reducers/analytics/details/request';
import { useDispatch, useSelector } from 'react-redux';

import { EdmPreview } from 'Pages/AuthenticationModule/Communication/Component/EdmPreview';
import { getSessionId } from 'Reducers/globalState/selector';
import DaysAndHoursChart from '../../Components/Charts/DaysAndHoursChart';
import TotalActivity from '../../Components/DetailTable/TotalActivity';
import DetailListDataTable from '../../Components/DetailTable/DetailListDataTable';
import useQueryParams from 'Hooks/useQueryParams';
import AreasPlineChart from '../../Components/Charts/AreasPlineChart';
import { updateDetailsMainList } from 'Reducers/analytics/details/reducer';
import { DetailAnalyticsChannelPortletLoader } from 'Components/Skeleton/Skeleton';
const MobileNotification = ({ type, isDownloadUI }) => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/analytics/detail-analytics');
    const isWinnerSplit = locationData?.iswinnerSplit;
    const isWinnerSplitType = locationData?.iswinnerSplitType;
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

    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        previewData: '',
        com_status: '',
        isOverviewPreviewModal: false,
                                                    isPreviewLoading: false,
        date: '',
    });
    const { detailsList, overviewDetail, channelDetail, segmentDetail, fromSplitHeader, isLoading, segmentId } =
        useSelector(({ analyticsDetails }) => analyticsDetails);

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

    const [filterDetails, setFilterDetails] = useState({});

    // Calculate splitAb (split type) from splitItem or locationData
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

    const {
        activityStatus,
        blastAudienceJson,
        isSplitEnabled,
        campaignStatusInfoJson,
        clientInfoJson,
        conversion,
        conversionCostAmount,
        conversionPerformanceJson,
        dayJson,
        enagegementPerformanceHrsJson,
        enagegementPerformanceJson,
        engagement,
        hourJson,
        jobDateTime,
        keyMetrics,
        locationInfoJson,
        mobileOsInfoJson,
        reach,
        reachPerformanceJson,
        reachPerformanceHrsJson,
        segmentLists,
        selectedSegmentId,
        topBrowser,
        topBrowserValue,
        topDay,
        topDayValue,
        topHour,
        topHourValue,
        topInteraction,
        topInteractionValue,
        topLocation,
        topLocationValue,
        topOs,
        topOsValue,
        interactiveButtonInfoJson,
        deviceInfoJson,
        totalImpressionCount = 0,
        isDynamicZone = false,
    } = overviewDetail || defaultValues;
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
        slides,
    } = states;
    const { isHybrid } = getUserDetails();

    // const dateField = getUserDateTimeFormat(jobDateTime, 'formatDateTime');
    const dateField = jobDateTime;

    const handlePreviewDetails = async (data) => {
        const currentBlastId = filterDetails?.blastShortCode || analyticsDetatils?.blastId;
        const channelInfo = channelDetail?.isSplitEnabled
            ? channelDetail?.splitChannelLevelInfo
            : channelDetail?.channelInfos;
        const currentChannelInfo = channelInfo?.find((info) => info.blastShortCode === currentBlastId);
        const getWinnerChannel_Detaild = handleChannelInfo(channelDetail, locationData);
        const channelDetailId = currentChannelInfo?.channelDetailid || 0;
        let getWinnerChannelDetaild = getWinnerChannel_Detaild[0]?.channelDetailid || channelDetailId;

        let payload = {
            departmentId,
            clientId,
            userId,
            campaignId: channelDetail?.campaignID,
            blastId: currentBlastId,
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
            channelDetailId: getWinnerChannelDetaild,
            // blastguid: channelDetail?.campaignGuid,
        };

        // const response = await dispatch(getDetailReport_ContentDetails(payload));
        // if (response?.status) {
        //     setState((pre) => ({ ...pre, isClickMapModal: true, previewData: response?.data?.content ?? '' }));
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
        const payload = {
            channelId,
            clientId,
            departmentId,
            userId,
            campaignId: locationData?.campaignId, //analyticsDetatils?.campaignId,
            blastID: analyticsDetatils?.blastId,
            startDate: getYYMMDD(filterData?.selectedDate?.startDate),
            endDate: getYYMMDD(filterData?.selectedDate?.endDate),
            segment: filterData?.filterSelectedData,
            split: filterData?.splitData === 'Actual communication' ? 'ACT' : filterData?.splitData,
        };

        // await dispatch(getDetailReport({ payload }));
        dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
        dispatch(updateDetailsMainList({ field: 'overviewDetail', data: {} }));
        dispatch(updateDetailsMainList({ field: 'segmentId', data: filterData?.filterSelectedData || null }));
        await dispatch(getDetailReport_OverviewDetails({ payload }));
        //await dispatch(getDetailReport_ChannelDetails({ payload }));
        //await dispatch(getDetailReport_SegmentDetails({ payload }));
    };
    // useEffect(() => {
    //     if (isWinnerSplit) {
    //         const selectedDate = {
    //             startDate: channelDetail?.startDate,
    //             endDate: channelDetail?.endDate,
    //         };
    //         const filterData = {
    //             splitData: isWinnerSplit ? 'Actual communication' :`Split ${isWinnerSplitType}`,
    //             selectedDate: selectedDate,
    //             filterSelectedData: 0,
    //             blastShortCode: locationData?.blastShortCode,
    //         };
    //         getData(filterData);
    //     }
    // }, [isWinnerSplitType, channelDetail?.startDate, channelDetail?.endDate]);
    useEffect(() => {
        if (!fromSplitHeader) setFilterDetails({});
    }, [fromSplitHeader]);
    return (
        <div className={`page-content ${isDownloadUILocal ? 'download-page-setup-detail' : ''}`}>
            <Container className="px0">
                {fromSplitHeader || Object.keys(overviewDetail)?.length > 0 ? (
                    <div className="rs-csr-wrapper">
                        <SplitHeader
                            splitView={channelDetail?.isSplitEnabled}
                            filterDropdown={
                                segmentDetail?.segments !== undefined
                                    ? segmentDetail?.segments !== null
                                        ? segmentDetail?.segments?.length > 0
                                        : false
                                    : false
                            }
                            datePicker={true}
                            advanceSearch={false}
                            sankey={false}
                            callbackSplit={getData}
                            splitData={
                                channelDetail?.isSplitEnabled && channelDetail?.splitChannelLevelInfo !== undefined
                                    ? isWinnerSplit
                                        ? handleSplit(channelDetail?.splitChannelLevelInfo, isWinnerSplitType)
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
                            detailAnalytics
                            startDate={channelDetail?.startDate}
                            endDate={channelDetail?.endDate}
                            isDownloadUI={(flag) => {
                                setIsDownloadLocal(flag);
                                setTimeout(() => {
                                    setIsDownloadLocal(false);
                                }, 10000);
                                isDownloadUI(flag);
                            }}
                            channelId={locationData?.channelId}
                        />
                        {Object.keys(overviewDetail)?.length > 0 ? (
                            <>
                                <OverviewGrid
                                    infoIcon={true}
                                    campaignId={locationData?.campaignId}
                                    channelId={locationData?.channelId}
                                    channelType={type}
                                    isTime={true}
                                    date={dateField}
                                    handlePreviewDetails={() => {
                                        handlePreviewDetails('overview');
                                    }}
                                    previewImage={''}
                                />
                                <div className="filter-preview-bar d-none">
                                    <span>
                                        {filterListValue.key} : {filterListValue?.filterData?.toString()}
                                    </span>
                                </div>

                                <OverviewList
                                    dataObj={overview_data(reach, engagement, conversion, isDynamicZone)}
                                />

                                <Row>
                                    <div className="portlet-heading">
                                        <h3>{COMMUNICATION_PERFORMANCE}</h3>
                                    </div>
                                    {channelDetail?.campaignType === 'T' && (
                                        <Row className="m0">
                                            <Col md={12} className="portlet-container">
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
                                                    ? keyMetrixData(
                                                          { ...keyMetrics, totalImpressionCount: totalImpressionCount },
                                                          channelDetail?.campaignType === 'T',
                                                          isDynamicZone,
                                                      )
                                                    : []
                                            }
                                            pdfDownload={isDownloadUILocal}
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
                                                    ? changeToBase64(enagegementPerformanceJson, 'areaFooter')
                                                    : {}
                                            }
                                            first24HoursData={
                                                !!enagegementPerformanceHrsJson &&
                                                enagegementPerformanceHrsJson?.length !== 0 &&
                                                hasNonZeroEngagementData(enagegementPerformanceHrsJson)
                                                    ? changeToBase64(
                                                          enagegementPerformanceHrsJson,
                                                          'areaFooter',
                                                      )
                                                    : {}
                                            }
                                            overAllPercent={engagement?.clicks}
                                            overAllText={`of the engagement rate occurred during this period`}
                                            first24HoursPercent={engagement?.clicks}
                                            first24HoursText={`of the engagement rate occurred during this period`}
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
                                            footerText={'of conversion happened during this period'}
                                            content={true}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <PieChart
                                            title={'Communication status'}
                                            chartData={
                                                !!campaignStatusInfoJson &&
                                                campaignStatusInfoJson?.length !== 0 &&
                                                hasValidPieChartData(campaignStatusInfoJson)
                                                    ? pieChartOption(campaignStatusInfoJson, 'pieFooter', true)
                                                    : {}
                                            }
                                            footerPercent={formatNumber(reach?.delivered)}
                                            footerText={'of the notifications have been delivered to the app users'}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <PieChart
                                            title={'Interactivity'}
                                            chartData={
                                                !!interactiveButtonInfoJson && interactiveButtonInfoJson?.length !== 0 && hasValidPieChartData(interactiveButtonInfoJson)
                                                    ? pieChartOption(
                                                          interactiveButtonInfoJson,
                                                          'pieFooter',
                                                          true,
                                                      )
                                                    : {}
                                            }
                                            footerPercent={formatNumber(topInteractionValue)}
                                            footerText={`of the users clicked on ${topInteraction} interactive button`}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <div className="portlet-heading">
                                        <h3 className="mt0">{USER_ENGAGEMENT}</h3>
                                    </div>
                                    <Col md={6}>
                                        <MapChart
                                            title={'By location'}
                                            chartData={
                                                !!locationInfoJson ? mapChartOption(locationInfoJson) : []
                                            }
                                            footerPercent={formatNumber(topLocationValue)}
                                            footerText={`The highest engagement rate is from ${topLocation}`}
                                            isCustomFooter={true}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <DaysAndHoursChart
                                            heading={''}
                                            splitItemText={''}
                                            expandChartAction={() => setIsChartExpanded(!isChartExpanded)}
                                            // isChartExpanded={isChartExpanded}
                                            splitItem={splitItem}
                                            expandViewStatus={false}
                                            footerStatus={true}
                                            dayData={
                                                dayJson !== undefined
                                                    ? getDaywiseChartData(dayJson, 'bubble')
                                                    : {}
                                            }
                                            hoursData={
                                                hourJson !== undefined
                                                    ? getHoursWiseChartData(hourJson, 'clockFooter')
                                                    : {}
                                            }
                                            dayPercent={formatNumber(topDayValue)}
                                            dayText={`of the users engaged on ${topDay}`}
                                            hoursPercent={formatNumber(topHourValue)}
                                            hoursText={`of the users engage during ${topHour}`}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    {/* <Col md={6}>
                        <PieChart
                            title={'Browser'}
                            chartData={clientInfoJson !== undefined && hasValidPieChartData(clientInfoJson) ? pieChartOption(clientInfoJson, 286) : {}}
                            footerPercent={topBrowserValue}
                            footerText={` of the notification were received through ${topBrowser} browser`}
                        />
                    </Col> */}
                                    <Col md={6}>
                                        <PieChart
                                            title={'Operating system'}
                                            chartData={
                                                !!mobileOsInfoJson && mobileOsInfoJson?.length !== 0
                                                    ? pieChartOption(mobileOsInfoJson, 'pieFooter', true)
                                                    : {}
                                            }
                                            footerPercent={formatNumber(topOsValue)}
                                            footerText={` of user engagement is from ${seriesNameField(topOs)} OS`}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <PieChart
                                            title={'Device'}
                                            chartData={
                                                !!deviceInfoJson && deviceInfoJson?.length !== 0
                                                    ? pieChartOption(deviceInfoJson, 'pieFooter', true)
                                                    : {}
                                            }
                                            footerPercent={formatNumber(topBrowserValue)}
                                            footerText={` of the notification were received through ${seriesNameField(
                                                topBrowser,
                                            )} device`}
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
                                        blastID={
                                            filterDetails?.blastShortCode ||
                                            analyticsDetatils?.blastId ||
                                            locationData?.blastId
                                        }
                                        campaignName={channelDetail?.campaignName}
                                        filterDetails={filterDetails}
                                        splitItem={splitItem}
                                        isWinnerSplit={isWinnerSplit}
                                    />
                                </Row>
                                {!(
                                    channelDetail?.campaignType === 'T' ||
                                    isHybrid ||
                                    channelDetail?.isMDCTrigger ||
                                    (filterDetails?.audienceChanged &&
                                        ['3', '5'].includes(String(filterDetails?.selectedListType)))
                                ) && (
                                    <Row>
                                        <DetailListDataTable
                                            columnListData={CAMPAIGN_GRID_MP_COLUMN_DATA()}
                                            // campaignId={locationData?.campaignId}
                                            campaignId={channelDetail?.campaignID}
                                            // campaignId={analyticsDetatils?.campaignId}
                                            channelId={channelId}
                                            blastID={
                                                filterDetails?.blastShortCode ||
                                                analyticsDetatils?.blastId ||
                                                locationData?.blastId
                                            }
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
                                isAnalytics
                                isAnalyticsData={{
                                    campaignId: channelDetail?.campaignID,
                                    channelId: channelId,
                                    status: com_status,
                                    blastID: analyticsDetatils?.blastId,
                                    ...(effectiveSegmentId != null && { segmentId: effectiveSegmentId }),
                                    splitAb: splitAb,
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
                            <ClickMapModal
                                show={isOverviewPreviewModal}
                                            isPreviewLoading={isPreviewLoading}
                                handleClose={() =>
                                    setState((prev) => ({
                                        ...prev,
                                        isOverviewPreviewModal: false,
                                                    isPreviewLoading: false,
                                    }))
                                }
                                previewImage={previewData}
                                channelId={analyticsDetatils?.channelId || locationData?.channelId}
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
                                isAnalytics={true}
                            />

                                {isClickMapModal && (
                                    <EdmPreview
                                        show={isClickMapModal}
                                    isPreviewLoading={isPreviewLoading}
                                        onHide={() =>
                                            setState((prev) => ({
                                                ...prev,
                                                isClickMapModal: false,
                                            isPreviewLoading: false,
                                            }))
                                        }
                                        selectedItem={previewData}
                                    />
                                )}
                            </>
                        ) : (
                            <DetailAnalyticsChannelPortletLoader
                                isError={!isLoading}
                                hideTabbarSkeleton={fromSplitHeader}
                            />
                        )}
                    </div>
                ) : (
                    <DetailAnalyticsChannelPortletLoader isError={!isLoading} hideTabbarSkeleton={fromSplitHeader} />
                )}
            </Container>
        </div>
    );
};

export default MobileNotification;
