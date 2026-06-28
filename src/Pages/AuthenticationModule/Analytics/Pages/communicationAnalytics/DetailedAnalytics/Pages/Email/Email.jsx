import { formatNumber } from 'Utils/modules/campaignUtils';
import { hasNonZeroEngagementData, hasValidPieChartData } from 'Utils/modules/charts';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../Components';
import { CAMPAIGN_GRID_COLUMN_DATA, COMMUNICATION_PERFORMANCE, CONTENT_TARGET_GRID_COLUMN_DATA, CONTENT_TARGET_PERFORMANCE, TOP_LINK_ACTIVITY, USER_ENGAGEMENT, areachangeToBase64, changeToBase64, defaultValues, getContentTargetGridData, getPreviewData, handleChannelInfo, handleSegmentData, handleSplit, pieChartOption } from '../../constants';
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

import { parseAnalyticsJson } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
import { EdmPreview } from 'Pages/AuthenticationModule/Communication/Component/EdmPreview';
import { getSessionId } from 'Reducers/globalState/selector';
import TotalActivity from '../../Components/DetailTable/TotalActivity';
import DetailListDataTable from '../../Components/DetailTable/DetailListDataTable';
import AreasPlineChart from '../../Components/Charts/AreasPlineChart';
import RSModal from 'Components/RSModal';
import KendoGrid from 'Components/RSKendoGrid';
import KendoGridNew from 'Components/RSKendoGridNew';
import { getshowLink } from 'Reducers/analytics/analyticsSummary/request';
import useQueryParams from 'Hooks/useQueryParams';
import { DetailAnalyticsChannelPortletLoader } from 'Components/Skeleton/Skeleton';
import { updateDetailsMainList } from 'Reducers/analytics/details/reducer';

const DetailAnalyticsEmail = ({ type, isDownloadUI }) => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/analytics/detail-analytics');
    const isWinnerSplit = locationData?.iswinnerSplit;
    const isWinnerSplitType = locationData?.iswinnerSplitType;
    const groupWinnerSplitType = locationData?.groupWinnerSplitType || '';
    const effectiveWinnerSplitType = isWinnerSplitType || groupWinnerSplitType;
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const channelId = getChannelId(type)?.id;
    const { overviewDetail, channelDetail, segmentDetail, fromSplitHeader, isLoading, segmentId } = useSelector(
        ({ analyticsDetails }) => analyticsDetails,
    );

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

    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [isDownloadUILocal, setIsDownloadLocal] = useState(false);
    const [splitItem, setSplitItem] = useState('Actual communication');
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
    const [filterListValue, setFilterListValue] = useState({
        filterData: [],
        key: '',
    });
    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        isCommStatusModal: false,
        previewData: '',
        showLinkData: [],
        isShowLinkLoading: false,
        isOverviewPreviewModal: false,
        isPreviewLoading: false,
        com_status: '',
        date: '',
        selectedOption: false,
    });

    const {
        reach,
        engagement,
        conversion,
        reachPerformanceJson,
        reachPerformanceHrsJson,
        topBrowserValue,
        topBrowser,
        keyMetrics,
        enagegementPerformanceJson,
        enagegementPerformanceHrsJson,
        conversionPerformanceJson,
        blastAudienceJson,
        clientInfoJson,
        deviceInfoJson,
        topOsValue,
        topOs,
        activityStatus,
        jobDateTime,
        isSplitEnabled,
        advanceAnalyticsList = [],
        contentTarget,
    } = overviewDetail || defaultValues;
    // console.log('overviewDetail: ', JSON.parse(contentTarget));

    const {
        isCampaignCSVModal,
        isLinkClickCSVModal,
        isClickMapModal,
        previewData,
        isCommStatusModal,
        showLinkData,
        isShowLinkLoading,
        isOverviewPreviewModal,
        isPreviewLoading,
        com_status,
        date,
        subject,
        imagePath,
        carouselJSON,
        isCarousel,
        header,
        footer,
        footerContent,
        senderName,
    } = states;
    const { isHybrid } = getUserDetails();
    // const dateField = getUserDateTimeFormat(jobDateTime, 'formatDateTime');
    const dateField = jobDateTime;

    const handlePreviewDetails = async (data) => {
        const currentBlastId = filterDetails?.blastShortCode || analyticsDetatils?.blastId || locationData?.blastId;
        const channelInfo = channelDetail?.isSplitEnabled
            ? channelDetail?.splitChannelLevelInfo
            : channelDetail?.channelInfos;
        const currentChannelInfo = channelInfo?.find((info) => info.blastShortCode === currentBlastId);
        const getWinnerChannel_Detaild = handleChannelInfo(channelDetail, locationData);
        const channelDetailId = currentChannelInfo?.channelDetailid || 0;
        let getWinnerChannelDetaild = getWinnerChannel_Detaild[0]?.channelDetailid || channelDetailId;
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
        //     if (data !== 'overview') {
        //         setState((pre) => ({ ...pre, isClickMapModal: true, previewData: response?.data }));
        //     } else {
        //         setState((pre) => ({ ...pre, isOverviewPreviewModal: true, previewData: response?.data }));
        //     }
        // } else {
        //     console.log(response.error);
        //     if (data !== 'overview') {
        //         setState((pre) => ({ ...pre, isClickMapModal: true, previewData: '' }));
        //     } else {
        //         setState((pre) => ({ ...pre, previewData: '', isOverviewPreviewModal: true }));
        //     }
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
            departmentId,
            userId,
            campaignId: locationData?.campaignId, // analyticsDetatils?.campaignId,
            blastID: filterData?.blastShortCode || analyticsDetatils?.blastId,
            startDate: getYYMMDD(filterData?.selectedDate?.startDate),
            endDate: getYYMMDD(filterData?.selectedDate?.endDate),
            segment: filterData?.filterSelectedData,
            split: !!filterData?.splitData ? splitData : undefined,
            filterValue: filterData?.filterValue,
            isCG: filterData?.isCG,
            isTG: filterData?.isTG,
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
    // useEffect(() => {
    //     if (isCommStatusModal) {
    //         getShowLinkData();
    //     }
    // }, [isCommStatusModal]);
    useEffect(() => {
        if (!fromSplitHeader) setFilterDetails({});
    }, [fromSplitHeader]);
    const getShowLinkData = async (guid) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            recipientGuid: guid?.recipientGuid,
            campaignId: locationData?.campaignId,
            blastId: analyticsDetatils?.blastId || locationData?.blastId,
        };

        setState((prev) => ({
            ...prev,
            isCommStatusModal: true,
            showLinkData: [],
            isShowLinkLoading: true,
        }));

        const { status, data } = await dispatch(getshowLink({ payload, loading: false }));
        setState((prev) => ({
            ...prev,
            showLinkData: status ? data : [],
            isShowLinkLoading: false,
        }));
    };

    // console.log('analyticsDetatils: ', analyticsDetatils);
    const parsedData = reachPerformanceJson ? parseAnalyticsJson(reachPerformanceJson, null) : null;
    const series = Array.isArray(parsedData?.series) ? parsedData.series : [];
    const isAllZero = series.every((item) => (Array.isArray(item?.datas) ? item.datas : []).every((val) => val === 0));
    const contentTargetGridRows = contentTarget ? getContentTargetGridData(contentTarget) : null;

    return (
        <>
            <div className={`page-content ${isDownloadUILocal ? 'download-page-setup-detail' : ''}`}>
                <Container className="px0">
                    {fromSplitHeader || Object.keys(overviewDetail)?.length > 0 ? (
                        <div className="rs-csr-wrapper">
                            <SplitHeader
                                splitView={channelDetail?.isSplitEnabled}
                                splitViewCGTG={overviewDetail?.isEmailCgTg}
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
                                splitData={
                                    channelDetail?.isSplitEnabled && channelDetail?.splitChannelLevelInfo !== undefined
                                        ? effectiveWinnerSplitType
                                            ? handleSplit(
                                                  channelDetail?.splitChannelLevelInfo,
                                                  effectiveWinnerSplitType,
                                              )
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
                                campaignID={locationData?.campaignId}
                                blastID={locationData?.blastId}
                                departmentId={departmentId}
                            />

                            {Object.keys(overviewDetail)?.length > 0 ? (
                                <>
                                    <OverviewGrid
                                        infoIcon={true}
                                        campaignId={locationData?.campaignId}
                                        channelType={type}
                                        channelId={locationData?.channelId}
                                        isTime={true}
                                        date={dateField}
                                        handlePreviewDetails={(data) => {
                                            if (data) handlePreviewDetails('overview');
                                        }}
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
                                                content={isAllZero ? false : true}
                                            />
                                        </Col>
                                        <Col md={4}>
                                            <KeyMetricsNew
                                                data={
                                                    keyMetrics !== undefined && keyMetrics !== null
                                                        ? keyMetrixData(
                                                              keyMetrics,
                                                              filterDetails?.isCG,
                                                              channelDetail?.campaignType === 'T',
                                                          )
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
                                                    hasNonZeroEngagementData(enagegementPerformanceJson)
                                                        ? areachangeToBase64(
                                                              enagegementPerformanceJson,
                                                              'areaFooter',
                                                          )
                                                        : {}
                                                }
                                                first24HoursData={
                                                    hasNonZeroEngagementData(enagegementPerformanceHrsJson)
                                                        ? areachangeToBase64(
                                                              enagegementPerformanceHrsJson,
                                                              'areaFooter',
                                                          )
                                                        : {}
                                                }
                                                overAllPercent={
                                                    reach?.open != null && reach?.open !== ''
                                                        ? Number(reach.open)?.toFixed(1)
                                                        : 0
                                                }
                                                overAllText={
                                                    <>
                                                        total reach with{' '}
                                                        <strong className="font-bold fs19 pl5">
                                                            {engagement?.uniqueclicks
                                                                ? Number.isInteger(parseFloat(engagement?.uniqueclicks))
                                                                    ? parseFloat(engagement?.uniqueclicks)
                                                                    : parseFloat(engagement?.uniqueclicks)?.toFixed(1)
                                                                : 0}
                                                        </strong>
                                                        <small className="font-bold pr5 color-primary-black">%</small>{' '}
                                                        engagement rate occurred during this period
                                                    </>
                                                }
                                                first24HoursPercent={reach?.open}
                                                first24HoursText={
                                                    <>
                                                        total reach with{' '}
                                                        <strong className="font-bold fs19 pl5">
                                                            {engagement?.uniqueclicks
                                                                ? Number.isInteger(parseFloat(engagement?.uniqueclicks))
                                                                    ? parseFloat(engagement?.uniqueclicks)
                                                                    : parseFloat(engagement?.uniqueclicks)?.toFixed(1)
                                                                : 0}
                                                        </strong>
                                                        <small className="font-bold pr5 color-primary-black">%</small>{' '}
                                                        engagement rate occurred during this period
                                                    </>
                                                }
                                                content={true}
                                            />
                                        </Col>

                                        <Col md={6}>
                                            <ColumnChart
                                                title={'Conversion'}
                                                chartData={
                                                    conversionPerformanceJson && hasNonZeroEngagementData(conversionPerformanceJson)
                                                        ? changeToBase64(
                                                              conversionPerformanceJson,
                                                              'columnFooter',
                                                          )
                                                        : {}
                                                }
                                                footerPercent={formatNumber(conversion?.registration)}
                                                footerText={'of conversion happened during this period'}
                                                content={true}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <div className="portlet-heading">
                                            <h3 className="mt0">{USER_ENGAGEMENT}</h3>
                                        </div>
                                        <Col md={6}>
                                            <PieChart
                                                title={'Opens by browser'}
                                                chartData={
                                                    clientInfoJson !== undefined &&
                                                    clientInfoJson !== null &&
                                                    hasValidPieChartData(clientInfoJson)
                                                        ? pieChartOption(clientInfoJson, 'pieFooter', true)
                                                        : {}
                                                }
                                                footerPercent={formatNumber(topBrowserValue)}
                                                footerText={`of email have been opened from ${
                                                    !!topBrowser ? topBrowser : `Others`
                                                }`}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <PieChart
                                                title={'Opens by device'}
                                                chartData={
                                                    deviceInfoJson !== undefined &&
                                                    deviceInfoJson !== null &&
                                                    hasValidPieChartData(deviceInfoJson)
                                                        ? pieChartOption(deviceInfoJson, 'pieFooter', true)
                                                        : {}
                                                }
                                                footerPercent={formatNumber(topOsValue)}
                                                footerText={`of email have been opened from ${topOs}`}
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
                                            blastID={analyticsDetatils?.blastId || locationData?.blastId}
                                            campaignName={channelDetail?.campaignName}
                                            filterDetails={filterDetails}
                                            splitItem={splitItem}
                                            isWinnerSplit={isWinnerSplit}
                                        />
                                    </Row>
                                    {contentTargetGridRows?.length > 0 && (
                                        <Row>
                                            <Col>
                                                <div className="portlet-container rs-table-with-heading mb30">
                                                    <div className="portlet-heading">
                                                        <div className="d-flex align-items-center">
                                                            <h4>{CONTENT_TARGET_PERFORMANCE}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="portlet-body">
                                                        <KendoGridNew
                                                            data={contentTargetGridRows}
                                                            staticColumns={CONTENT_TARGET_GRID_COLUMN_DATA}
                                                            scrollable="scrollable"
                                                            pageable={true}
                                                            groupable={true}
                                                            searchable={false}
                                                            initialDataState={{ group: [{ field: 'targetGroup' }] }}
                                                        />
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                    {!(
                                        channelDetail?.campaignType === 'T' ||
                                        isHybrid ||
                                        channelDetail?.isMDCTrigger ||
                                        (filterDetails?.audienceChanged &&
                                            ['3', '5'].includes(String(filterDetails?.selectedListType)))
                                    ) && (
                                        <Row>
                                            <DetailListDataTable
                                                columnListData={CAMPAIGN_GRID_COLUMN_DATA((data) => {
                                                    getShowLinkData(data);
                                                }, states?.selectedOption)}
                                                campaignId={channelDetail?.campaignID}
                                                channelId={channelId}
                                                blastID={analyticsDetatils?.blastId || locationData?.blastId}
                                                dateField={dateField}
                                                setState={setState}
                                                keyDetailList={activityStatus?.channelKeyDetailList}
                                                filterDetails={filterDetails}
                                                downloadUI={isDownloadUILocal}
                                                splitItem={splitItem}
                                                isWinnerSplit={isWinnerSplit}
                                            />
                                        </Row>
                                    )}

                                    {isCommStatusModal && (
                                        <RSModal
                                            show={isCommStatusModal}
                                            handleClose={() =>
                                                setState((prev) => ({
                                                    ...prev,
                                                    isCommStatusModal: false,
                                                    isShowLinkLoading: false,
                                                }))
                                            }
                                            header="Communication status"
                                            body={
                                                <>
                                                    <KendoGrid
                                                        size="xl"
                                                        data={showLinkData}
                                                        column={CAMPAIGN_GRID_COLUMN_DATA}
                                                        scrollable="scrollable"
                                                        settings={{ total: showLinkData?.length }}
                                                        pageable={true}
                                                        isLoading={isShowLinkLoading}
                                                    />
                                                </>
                                            }
                                        />
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
                                            blastID: analyticsDetatils?.blastId || locationData?.blastId,
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
                                    {isOverviewPreviewModal && (
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
                                            scheduleDate={date}
                                            channelId={analyticsDetatils?.channelId || locationData?.channelId}
                                            subject={subject}
                                            imagePath={imagePath}
                                            carouselJSON={carouselJSON}
                                            isCarousel={isCarousel}
                                            header={header}
                                            footer={footer}
                                            footerContent={footerContent}
                                            senderName={senderName}
                                        />
                                    )}
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
                        <DetailAnalyticsChannelPortletLoader
                            isError={!isLoading}
                            hideTabbarSkeleton={fromSplitHeader}
                        />
                    )}
                </Container>
            </div>
        </>
    );
};

export default DetailAnalyticsEmail;
