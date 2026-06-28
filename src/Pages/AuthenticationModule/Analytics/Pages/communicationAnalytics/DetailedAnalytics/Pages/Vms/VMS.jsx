import { formatNumber } from 'Utils/modules/campaignUtils';
import { hasNonZeroEngagementData, hasValidPieChartData } from 'Utils/modules/charts';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { KeyMetricsNew, OverviewGrid, OverviewList } from '../../Components';
import { CAMPAIGN_GRID_COLUMN_DATA, COMMUNICATION_PERFORMANCE, TOP_LINK_ACTIVITY, USER_ENGAGEMENT, changeToBase64, defaultValues, getPreviewData, handleChannelInfo, handleSegmentData, handleSplit, pieChartOption } from '../../constants';
import { useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { keyMetrixData, overview_data } from './data';
import ClickMapModal from '../../Components/ClickMapModal';
import SplitHeader from '../../Components/SplitHeader';

import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import TabbarAreasPlineChart from '../../Components/Charts/TabbarAreasPlineChart';
import ColumnChart from '../../Components/Charts/ColumnChart';
import PieChart from '../../Components/Charts/PieChart';
import { getDetailReport } from 'Reducers/analytics/details/request';
import { useDispatch, useSelector } from 'react-redux';

import { EdmPreview } from 'Pages/AuthenticationModule/Communication/Component/EdmPreview';
import { getSessionId } from 'Reducers/globalState/selector';
import TotalActivity from '../../Components/DetailTable/TotalActivity';
import DetailListDataTable from '../../Components/DetailTable/DetailListDataTable';
import useQueryParams from 'Hooks/useQueryParams';
import AreasPlineChart from '../../Components/Charts/AreasPlineChart';

const DetailAnalyticsVMS = ({ type, isDownloadUI }) => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/analytics/detail-analytics');
    const isWinnerSplit = locationData?.iswinnerSplit;
    const isWinnerSplitType = locationData?.iswinnerSplitType;
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const channelId = getChannelId(type)?.id;
    const { overviewDetail, channelDetail, segmentDetail, detailsList, fromSplitHeader, segmentId } = useSelector(
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
    
    // Calculate splitAb (split type) from splitItem or locationData
    const splitAb = useMemo(() => {
        const isSplitABScheduler = locationData?.isSplitABScheduler;
        const splitName = locationData?.splitName;
        const splitType = splitName?.split(' ')[1];
        
        if (isSplitABScheduler) {
            return splitType;
        }
        if (splitItem === 'Actual communication' && isWinnerSplit) {
            return 'ACT';
        } else if (splitItem?.startsWith('Split ')) {
            return splitItem?.replace('Split ', '')?.trim();
        }
        return undefined;
    }, [locationData, splitItem, isWinnerSplit]);

    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [isDownloadUILocal, setIsDownloadLocal] = useState(false);
    const [splitItem, setSplitItem] = useState('Actual communication');
    const [filterDetails, setFilterDetails] = useState({});
    const [filterListValue, setFilterListValue] = useState({
        filterData: [],
        key: '',
    });

    const [states, setState] = useState({
        isLinkClickCSVModal: false,
        isCampaignCSVModal: false,
        isClickMapModal: false,
        previewData: '',
        com_status: '',
        isOverviewPreviewModal: false,
        isPreviewLoading: false,
    });

    const {
        reach,
        engagement,
        conversion,
        segmentLists,
        reachPerformanceJson,
        reachPerformanceHrsJson,
        topBrowserValue,
        topBrowser,
        keyMetrics,
        enagegementPerformanceJson,
        enagegementPerformanceHrsJson,
        conversionPerformanceJson,
        blastAudienceJson,
        campaignStatusInfoJson,
        callDurationSummaryJson,
        topOsValue,
        topOs,
        activityStatus,
        jobDateTime,
        isSplitEnabled,
    } = detailsList?.vmsCodeDetailModel || defaultValues;
    const { isHybrid } = getUserDetails();
    const {
        isCampaignCSVModal,
        isLinkClickCSVModal,
        isClickMapModal,
        previewData,
        com_status,
        isOverviewPreviewModal,
        isPreviewLoading,
    } = states;
    // const dateField = getUserDateTimeFormat(jobDateTime, 'formatDateTime');
    const dateField = jobDateTime;

    const handlePreviewDetails = async (data) => {
        const currentBlastId = analyticsDetatils?.blastId;
        const currentChannelInfo = channelDetail?.channelInfos?.find(
            (info) => info.blastShortCode === currentBlastId
        );
        const getWinnerChannel_Detaild = handleChannelInfo(channelDetail, locationData);
            const channelDetailId = currentChannelInfo?.channelDetailid || 0;
            let getWinnerChannelDetaild = getWinnerChannel_Detaild[0]?.channelDetailid ||channelDetailId;                                 
        
        let payload = {
            departmentId,
            clientId,
            userId,
            campaignId: channelDetail?.campaignID,
            blastId: currentBlastId,
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
            channelDetailId: getWinnerChannelDetaild,
            // blastguid: detailsList?.campaignGuid,
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
            split:
                filterData?.splitData === 'Actual communication'
                    ? 'ACT'
                    : filterData?.splitData === 'Split A'
                    ? 'A'
                    : 'B',
        };
        await dispatch(getDetailReport({ payload }));
    };

    return (
        <div className={`page-content ${isDownloadUILocal ? 'download-page-setup-detail' : ''}`}>
            <Container className='px0'>
            <div className="rs-csr-wrapper">
                <SplitHeader
                    splitView={isSplitEnabled}
                    filterDropdown={
                        segmentLists !== undefined ? (segmentLists !== null ? segmentLists?.length > 0 : false) : false
                    }
                    datePicker={true}
                    advanceSearch={false}
                    sankey={false}
                    callbackSplit={getData}
                    // splitData={
                    //     isSplitEnabled && detailsList?.splitChannelLevelInfo !== undefined
                    //         ? handleSplit(detailsList?.splitChannelLevelInfo)
                    //         : []
                    // }
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
                        segmentLists !== undefined
                            ? segmentLists !== null
                                ? handleSegmentData(segmentLists)
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

                <OverviewGrid
                    infoIcon={true}
                    channelId={locationData?.channelId}
                    campaignId={locationData?.campaignId}
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

                <OverviewList dataObj={overview_data(reach, engagement, conversion)} />

                <Row>
                    <div className="portlet-heading">
                        <h3>{COMMUNICATION_PERFORMANCE}</h3>
                    </div>
                    {channelDetail?.campaignType === 'T' && (
                        <Row className="x-axis-labels-performance">
                            <AreasPlineChart
                                areaPlineDataList={
                                    blastAudienceJson && hasNonZeroEngagementData(blastAudienceJson)
                                        ? changeToBase64(blastAudienceJson, 'area')
                                        : {}
                                }
                            />
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
                        />
                    </Col>
                    <Col md={4}>
                        <KeyMetricsNew
                            data={keyMetrics !== undefined && keyMetrics !== null ? keyMetrixData(keyMetrics, channelDetail?.campaignType === 'T') : []}
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
                                    ? changeToBase64(enagegementPerformanceJson, 'areaFooter')
                                    : {}
                            }
                            first24HoursData={
                                !!enagegementPerformanceHrsJson &&
                                enagegementPerformanceHrsJson?.length !== 0 &&
                                hasNonZeroEngagementData(enagegementPerformanceHrsJson)
                                    ? changeToBase64(enagegementPerformanceHrsJson, 'areaFooter')
                                    : {}
                            }
                            overAllPercent={engagement?.uniqueclicks}
                            overAllText={`engagement rate occurred during this period`}
                            first24HoursPercent={engagement?.uniqueclicks}
                            first24HoursText={`engagement rate occurred during this period`}
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
                                !!campaignStatusInfoJson && campaignStatusInfoJson?.length !== 0 && hasValidPieChartData(campaignStatusInfoJson)
                                    ? pieChartOption(campaignStatusInfoJson, 'pieFooter')
                                    : {}
                            }
                            footerPercent={formatNumber(topBrowserValue)}
                            footerText={`of email have been opened from ${topBrowser}`}
                        />
                    </Col>
                    <Col md={6}>
                        <PieChart
                            title={'Opens by device'}
                            chartData={
                                !!callDurationSummaryJson && callDurationSummaryJson?.length !== 0 && hasValidPieChartData(callDurationSummaryJson)
                                    ? pieChartOption(callDurationSummaryJson, 'pieFooter')
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
                        setState={setState}
                        channelId={channelId}
                        dateField={dateField}
                        blastID={analyticsDetatils?.blastId}
                        campaignName={channelDetail?.campaignName}
                        splitItem={splitItem}
                        isWinnerSplit={isWinnerSplit}
                    />
                </Row>
                {!(channelDetail?.campaignType === 'T' || isHybrid || channelDetail?.isMDCTrigger || (filterDetails?.audienceChanged && ['3', '5'].includes(String(filterDetails?.selectedListType)))) && (
                    <Row>
                        <DetailListDataTable
                            columnListData={CAMPAIGN_GRID_COLUMN_DATA()}
                            // campaignId={locationData?.campaignId}
                            campaignId={channelDetail?.campaignID}
                            // campaignId={analyticsDetatils?.campaignId}
                            channelId={channelId}
                            blastID={analyticsDetatils?.blastId}
                            setState={setState}
                            dateField={dateField}
                            keyDetailList={activityStatus?.channelKeyDetailList}
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
                    previewImage={''}
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
            </div>
            </Container>
        </div>
    );
};

export default DetailAnalyticsVMS;
