import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { csv_download_large } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import { useDispatch, useSelector } from 'react-redux';
import { getCommunicationStatus } from 'Reducers/analytics/details/request';
import { Col } from 'react-bootstrap';
import { getSessionId } from 'Reducers/globalState/selector';

import useQueryParams from 'Hooks/useQueryParams';
import RSTooltip from 'Components/RSTooltip';
import { getUserInfoDetailsForOTP } from 'Reducers/globalState/request';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { DetailAnalyticsProvider } from '../..';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { SEGMENT_ENABLED_CAMPAIGNS } from '../../constants';

const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const DetailListDataTable = ({
    columnListData,
    campaignId,
    channelId,
    blastID,
    dateField,
    keyDetailList,
    setState,
    downloadUI,
    filterDetails = {},
    splitItem,
    isWinnerSplit
}) => {
    const { refAPIStatus } = useContext(DetailAnalyticsProvider);
    const locationData = useQueryParams('/analytics/detail-analytics');
    const isSplitABScheduler = locationData?.isSplitABScheduler
    const isWinnerSplitType = locationData?.iswinnerSplitType;
    const splitName = locationData?.splitName;
    const splitType = splitName?.split(' ')[1];
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
    const dispatch = useDispatch();
    const csvOtpPrefetchLoader = useApiLoader({ autoFetch: false, loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG });
    const { overviewDetail, fromSplitHeader, channelDetail, isCommStatusLoading, isLoading: isDetailsLoading, segmentId, segmentDetail } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const effectiveSegmentId = useMemo(() => {
        if (segmentId !== null && segmentId !== undefined) {
            return segmentId;
        }
        if (segmentDetail?.segments && Array.isArray(segmentDetail.segments) && segmentDetail.segments.length > 0) {
            return segmentDetail.segments[0]?.segmentId;
        }
        return null;
    }, [segmentId, segmentDetail]);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [initialPagination, setInitialPagination] = useState(false);
    const [params, setParams] = useState({
        campaignId: locationData?.campaignId,
        channelId: channelId || locationData?.channelId,
        blastID: filterDetails?.blastShortCode || blastID || locationData?.blastId,
        status:
            filterDetails?.isCG
                ? 'Controlgroup'
                : (overviewDetail?.isDynamicZone && [9, 8, 14].includes(Number(channelId)))
                    ? 'Unique Impression'
                    : channelDetail?.campaignType === 'T'
                        ? 'form'
                        : channelId === 2 ||
                            channelId === 21 ||
                            channelId === 8 ||
                            channelId === 9 ||
                            channelId === 14 ||
                            channelId === 41
                            ? 'Delivered'
                            : 'OpenClicks',
        departmentId,
        clientId,
        userId,
        pagination: {
            pageNo: 1,
            pageSize: 5,
        },
        isCG:filterDetails?.isCG,
        isTG:filterDetails?.isTG,
        split:
            (isSplitABScheduler && !(Object.keys(filterDetails)?.length > 0 && fromSplitHeader)) ? splitType : (() => {
                if (splitItem === 'Actual communication' && isWinnerSplit) {
                    return 'ACT';
                } else if (splitItem?.startsWith('Split ')) {
                    return splitItem?.replace('Split ', '')?.trim();
                }
                return undefined;
            })(),
    });

    const val = overviewDetail?.keyMetrics;
    const [shouldFetch, setShouldFetch] = useState(true);
    const audienceSegmentFilter = filterDetails?.filterSelectedData;
    const isAllAudienceSelected =
        audienceSegmentFilter === undefined ||
        audienceSegmentFilter === null ||
        audienceSegmentFilter === 0 ||
        audienceSegmentFilter === 1 ||
        audienceSegmentFilter === '0' ||
        audienceSegmentFilter === '1';
    const hasAdvancedSearchFilter =
        Array.isArray(filterDetails?.filterValue) && filterDetails.filterValue.length > 0;
    // const initialState = channelId === 2 || channelId === 21 ? (val?.delivered ?? 0) : ((Number(val?.totalOpened) + Number(val?.totalclick)) ?? 0);
    const [value, setValue] = useState(0);
    const [detailListData, setDetailListData] = useState({
        totalCount: 0,
        items: [],
    });
    const updateDefaultItem = useMemo(() => {
        if (filterDetails?.isCG) {
            return keyDetailList?.find((item) => item?.name === 'Control group');
        }
        if (overviewDetail?.isDynamicZone && [9, 8, 14]?.includes(Number(channelId))) {
            return keyDetailList?.find((item) => item?.name?.toLowerCase() === 'unique impression');
        }
        if (
            channelId === 2 ||
            channelId === 21 ||
            channelId === 8 ||
            channelId === 9 ||
            channelId === 14 ||
            channelId === 41
        ) {
            return keyDetailList?.find((item) => item?.name === 'Delivered');
        }
        return keyDetailList?.find((item) => item?.name === 'Open and clicks');
    }, [channelId, keyDetailList, filterDetails?.isCG, overviewDetail?.isDynamicZone]);

    useEffect(() => {
        if (updateDefaultItem) {
            setState(prev => ({ ...prev, selectedOption: updateDefaultItem?.name === 'Open and clicks' }));
        }
    }, [updateDefaultItem]);
    // const updateDefaultItem = memo(() => ({
    //     channelId === 2 || channelId === 21 || channelId === 8 || channelId === 9 || channelId === 14
    //         ? keyDetailList?.find((item) => item?.name === 'Delivered')
    //         : keyDetailList?.find((item) => item?.name === 'Open and clicks'),
    //     }),
    //     []);

    useEffect(() => {
        if (filterDetails?.isCG) {
            setValue(val?.controlgroup ?? 0);
        } else if (overviewDetail?.isDynamicZone && [9, 8, 14]?.includes(Number(channelId))) {
            setValue(overviewDetail?.reach?.count ?? 0);
        } else if (val?.totalOpened || val?.totalclick || channelId || val?.delivered) {
            setValue(
                channelId === 2 ||
                    channelId === 21 ||
                    channelId === 8 ||
                    channelId === 9 ||
                    channelId === 14 ||
                    channelId === 41
                    ? (val?.delivered || 0)
                    : Number(val?.totalOpened || 0),
            );
        }
    }, [overviewDetail, channelId, filterDetails?.isCG, val?.controlgroup]);
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            blastID: filterDetails?.blastShortCode || blastID || locationData?.blastId,
            campaignId: locationData?.campaignId,
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
        }));
    }, [locationData, analyticsDetatils]);
    useEffect(() => {
        if (Object.keys(filterDetails)?.length > 0 && fromSplitHeader) {
            let splitData;
            if (filterDetails?.splitData === 'Actual communication') {
                splitData = 'ACT';
            } else if (filterDetails?.splitData?.startsWith('Split ')) {
                splitData = filterDetails?.splitData.replace('Split ', '')?.trim();
            } else {
                splitData = undefined;
            }

            setParams((prev) => ({
                ...prev,
                startDate: getYYMMDD(filterDetails?.selectedDate?.startDate),
                endDate: getYYMMDD(filterDetails?.selectedDate?.endDate),
                split: !!filterDetails?.splitData ? splitData : undefined,
                ...(filterDetails?.blastShortCode && {
                    blastID: filterDetails.blastShortCode
                }),
                segmentId: filterDetails?.filterSelectedData !== undefined && filterDetails?.filterSelectedData !== null
                    ? filterDetails.filterSelectedData
                    : (effectiveSegmentId !== null && effectiveSegmentId !== undefined ? effectiveSegmentId : prev.segmentId)
            }));
            setShouldFetch(true);
        }
    }, [filterDetails, effectiveSegmentId]);

    useEffect(() => {
        if (effectiveSegmentId !== null && effectiveSegmentId !== undefined) {
            setParams((prev) => ({
                ...prev,
                segmentId: effectiveSegmentId,
            }));
        }
    }, [effectiveSegmentId]);
    const resolvedChannelId = Number(channelId || locationData?.channelId || analyticsDetatils?.channelId);
    const isSegmentDetailRequired = SEGMENT_ENABLED_CAMPAIGNS.includes(resolvedChannelId);
    const isSegmentDetailApiCompleted = useMemo(() => {
        if (!isSegmentDetailRequired) {
            return true;
        }
        return segmentDetail !== undefined && segmentDetail !== null;
    }, [segmentDetail, isSegmentDetailRequired]);

    useEffect(() => {
        if (
            shouldFetch &&
            !hasAdvancedSearchFilter &&
            params &&
            params?.campaignId &&
            params?.blastID &&
            Object.keys(overviewDetail)?.length > 0 &&
            isSegmentDetailApiCompleted
        ) {
            // if (!isAllAudienceSelected) {
            //     setDetailListData({ totalCount: 0, items: [] });
            //     setShouldFetch(false);
            //     return;
            // }
            handleCommuncationDetails();
            setShouldFetch(false);
        }
    }, [overviewDetail, params, effectiveSegmentId, isSegmentDetailApiCompleted, shouldFetch, isAllAudienceSelected, hasAdvancedSearchFilter]);

    useEffect(() => {
        if (!isAllAudienceSelected) {
            setDetailListData({ totalCount: 0, items: [] });
            setShouldFetch(false);
        } else {
            setShouldFetch(true);
        }
    }, [isAllAudienceSelected]);

    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            isCG: filterDetails?.isCG,
            isTG: filterDetails?.isTG,
            ...(filterDetails?.isCG && {
                status: 'Controlgroup',
                pagination: { pageNo: 1, pageSize: 5 },
            }),
        }));
        if (filterDetails?.isCG) {
            setState((prev) => ({ ...prev, selectedOption: false }));
            setShouldFetch(true);
        }
    }, [filterDetails?.isCG, filterDetails?.isTG]);

    const handleCommuncationDetails = async () => {
        const payload = {
            ...params
        };
        if (effectiveSegmentId !== null && effectiveSegmentId !== undefined) {
            payload.segmentId = effectiveSegmentId;
        }
        if (locationData?.isSplitAB && !locationData?.iswinnerSplit && !payload.split) {
            payload.split = splitType || 'A';
        }

        if (overviewDetail?.isEmailCgTg || overviewDetail?.isSmsCgTg ||(overviewDetail?.isWaCgTg || overviewDetail?.isRcsCgTg)) {
            payload.isTG = payload.isTG !== undefined ? payload.isTG : true;
            payload.isCG = payload.isCG !== undefined ? payload.isCG : false;
        }

        const activityList = await dispatch(getCommunicationStatus({ payload }));
        if (activityList.status) {
            let tempData = activityList?.data?.activityList.map((obj) => ({ ...obj, status: params?.status === 'TotalClicks' ? "Total clicks" : params?.status }));
            setDetailListData({
                totalCount: activityList?.data?.totalRows,
                items: tempData || [],
            });
        } else {
            setDetailListData({
                totalCount: 0,
                items: [],
            });
        }
    };
    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        const size = skip === 0 ? 1 : skip / take + 1;
        setParams((prev) => ({
            ...prev,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
            segmentId: effectiveSegmentId !== null && effectiveSegmentId !== undefined ? effectiveSegmentId : prev.segmentId,
        }));
        setInitialPagination(false);
        setShouldFetch(true);
    };

    // // // const [value, setValue] = useState(
    // //     channelId === 2 || channelId === 21 ? val?.delivered ?? 0 : Number(val?.totalOpened) + Number(val?.totalclick),
    // // );
    const handleSelect = (name) => {
        const valueMap = {
            'Open and clicks': Number(val?.totalOpened || 0) + Number(val?.totalclick || 0),
            'Hard bounced': val?.negativefeedbackhardbounced ?? 0,
            'Marked as spam': val?.spam ?? 0,
            'Pre bounced': val?.bounced ?? 0,
            'Pre unsubscribed': val?.unsubscribed ?? 0,
            Quarantined: val?.quarantined ?? 0,
            'Soft bounced': val?.softbounced ?? 0,
            Unsubscribed: val?.negativefeedbackunsubscribed ?? val?.unsubscribed ?? 0,
            Delivered: val?.delivered ?? 0,
            Expired: val?.expired ?? 0,
            'Opted out': 0,
            'Message In Queue': val?.messageinqueue ?? 0,
            'Pre Un-subscribed': val?.unsubscribed ?? 0,
            Rejected: val?.rejected ?? 0,
            'Total Clicks': val?.totalclick ?? val?.totalclicks ?? 0,
            'TwoWay SMS Response': 0,
            Undelivered: val?.undelivered ?? 0,
            Seen: val?.seen ?? 0,
            'Pre DND': val?.dnd ?? 0,
            'Control group': val?.controlgroup ?? 0,
            'Target group': val?.targetgroup ?? 0,
            'Unique Clicks': val?.uniqueclick ?? 0,
            'DND': val?.dnd ?? 0,
            Conversion: val?.conversion ?? 0,
            'Mismatch Sender ID': val?.mismatchsenderid ?? 0,
            'DueToAppUninstall': val?.unsubscribed ?? 0
        };
        if (name?.toLowerCase() === 'unique impression') {
            setValue(overviewDetail?.reach?.count ?? 0);
        } else {
            setValue(valueMap[name]);
        }
    };

    if (hasAdvancedSearchFilter) {
        return null;
    }

    return (
        <Col>
            <div className="portlet-container rs-table-with-heading mb30 overflow-visible">
                <div className="portlet-header flex-row mb6 ">
                    <div className="fr d-flex align-items-center">
                        <h4 className="mb0">Communication unique response:</h4>
                        <span className="font-bold font-md ml5">{!isAllAudienceSelected ? 0 : numberWithCommas(value)}</span>
                        <span className="font-xs ml10">
                            (As on: {getUserCurrentFormat(dateField, { isOffset: true })?.dateTimeFormat})
                        </span>
                    </div>

                    <div className="float-end">
                        <div className="d-flex align-items-center">
                            {!filterDetails?.isCG && (
                                <RSBootstrapdown
                                    data={
                                        (keyDetailList !== undefined && keyDetailList !== null ? keyDetailList : []).filter(
                                            (item) => !filterDetails?.isTG || item?.name !== 'Control group'
                                        )
                                    }
                                    customAlignRight
                                    defaultItem={updateDefaultItem}
                                    containerClass={!isAllAudienceSelected ? 'pe-none click-off' : ''}
                                    onSelect={(item) => {
                                        // const payload = {
                                        //     campaignId: campaignId,
                                        //     channelId: channelId,
                                        //     blastID: blastID,
                                        //     status: item.value,
                                        //     departmentId,
                                        //     userId,
                                        //     clientId,
                                        //     pagination: {
                                        //         pageNo: 1,
                                        //         pageSize: 5,
                                        //     },
                                        // };
                                        // const activityList = dispatch(getCommunicationStatus({ payload }));
                                        // if (activityList.status) {
                                        //     setDetailListData(activityList?.activityList || []);
                                        // }
                                        //setUpdateDefaultItem(item.name);
                                        handleSelect(item.name);
                                        setParams((prev) => ({
                                            ...prev,
                                            pagination: {
                                                pageNo: 1,
                                                pageSize: 5,
                                            },
                                            status: (item?.value === 'Control group' || item?.value === 'Target group')
                                                ? item.value.replace(/\s/g, '')
                                                : item?.value,
                                            segmentId: effectiveSegmentId !== null && effectiveSegmentId !== undefined ? effectiveSegmentId : prev.segmentId,
                                        }));
                                        setState((prevState) => ({
                                            ...prevState,
                                            selectedOption: item?.name === 'Open and clicks',
                                        }));
                                        setInitialPagination(true);
                                        setShouldFetch(true);
                                    }}
                                    isObject={true}
                                    fieldKey={'name'}
                                    alignRight
                                    isActive
                                    className={`${downloadUI ? 'analytics-dropdown' : ''}${
                                        !isAllAudienceSelected ? ' opacity-50' : ''
                                    }`}
                                />
                            )}
                            <RSTooltip
                                text={csvOtpPrefetchLoader.isLoading ? 'Loading...' : 'Download CSV'}
                                position="top"
                                className="lh0 ml15"
                                innerContent={false}
                            >
                                <div
                                    className={`eye-icon-wrapper d-flex align-items-center justify-content-center ${
                                        detailListData?.items?.length > 0 && !csvOtpPrefetchLoader.isLoading
                                            ? ''
                                            : 'pe-none click-off'
                                    } ${csvOtpPrefetchLoader.isLoading ? 'eye-icon-wrapper--loading' : ''}`}
                                >
                                    {csvOtpPrefetchLoader.isLoading ? (
                                        <span
                                            className="segment_loader listing-preview-eye-loader"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <i
                                            className={`${csv_download_large} icon-lg  color-primary-blue`}
                                            onClick={async () => {
                                                const payload = {
                                                    departmentId,
                                                    clientId,
                                                    userId,
                                                };
                                                await csvOtpPrefetchLoader.refetch({
                                                    fetcher: () =>
                                                        dispatch(getUserInfoDetailsForOTP(payload, false)),
                                                    mode: 'create',
                                                    loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
                                                });
                                                setState((prev) => ({
                                                    ...prev,
                                                    isCampaignCSVModal: true,
                                                    com_status: params?.status,
                                                }));
                                            }}
                                            id="rs_DetailListDataTable_CSV"
                                        />
                                    )}
                                </div>
                            </RSTooltip>
                        </div>
                    </div>
                </div>
                <div className="portlet-body">
                    <KendoGrid
                        data={detailListData?.items}
                        column={columnListData}
                        scrollable="scrollable"
                        settings={{ total: detailListData?.totalCount }}
                        isDataStateRequired
                        pageable={true}
                        isScrollTop={false}
                        onDataStateChange={(data) => handlePagerChange(data)}
                        pagerChange={initialPagination}
                        setInitialPagination={setInitialPagination}
                        isCustomClass={detailListData?.items?.length > 4 ? ' detail-table' : ''}
                        isLoading={isDetailsLoading || isCommStatusLoading}
                    />
                </div>
            </div>
        </Col>
    );
};

export default memo(DetailListDataTable);
