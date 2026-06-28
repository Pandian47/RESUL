import { getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { downloadCSVcommasFile } from 'Utils/modules/download';
import { csv_download_large, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useMemo, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';

import { useDispatch, useSelector } from 'react-redux';
import { csvDownloadLInkPreview, getClickActivityDetails } from 'Reducers/analytics/details/request';
import { linkPreviewDetailsData } from 'Reducers/analytics/details/reducer';
import { Col } from 'react-bootstrap';
import { getSessionId } from 'Reducers/globalState/selector';

import useQueryParams from 'Hooks/useQueryParams';
import RSTooltip from 'Components/RSTooltip';
import { SEGMENT_ENABLED_CAMPAIGNS } from '../../constants';

import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

const TotalActivity = ({
    handlePreviewDetails,
    ColumnListData,
    campaignId,
    channelId,
    blastID,
    dateField,
    setState,
    campaignName,
    filterDetails = {},
    splitItem,
    isWinnerSplit
}) => {
    const dispatch = useDispatch();
    const linkCsvDownloadLoader = useApiLoader({ autoFetch: false, loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG });
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { linkPreviewData, overviewDetail, fromSplitHeader, segmentId, segmentDetail } = useSelector(
        ({ analyticsDetails }) => analyticsDetails,
    );
    const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);

    const effectiveSegmentId = useMemo(() => {
        if (segmentId !== null && segmentId !== undefined) {
            return segmentId;
        }
        if (segmentDetail?.segments && Array.isArray(segmentDetail.segments) && segmentDetail.segments.length > 0) {
            return segmentDetail.segments[0]?.segmentId;
        }
        return null;
    }, [segmentId, segmentDetail]);

    const locationData = useQueryParams('/analytics/detail-analytics');
    const isSplitABScheduler = locationData?.isSplitABScheduler
    const isWinnerSplitType = locationData?.iswinnerSplitType;
    const splitName = locationData?.splitName;
    const splitType = splitName?.split(' ')[1];
    const [topLinkActivity, setTopLinkActivity] = useState([]);
    const [csvData, setCsvData] = useState(null);
    const [shouldFetch, setShouldFetch] = useState(true);
    const audienceSegmentFilter = filterDetails?.filterSelectedData;
    const isAllAudienceSelected =
        audienceSegmentFilter === undefined ||
        audienceSegmentFilter === null ||
        audienceSegmentFilter === 0 ||
        audienceSegmentFilter === 1 ||
        audienceSegmentFilter === '0' ||
        audienceSegmentFilter === '1';
    const [isLinkActivityLoading, setIsLinkActivityLoading] = useState(false);
    const [isFailure, setIsFailure] = useState({
        status: false,
        message: '',
    });

    const [params, setParams] = useState({
        campaignId: locationData?.campaignId,
        channelId: channelId || locationData?.channelId,
        blastID:filterDetails?.blastShortCode ||  blastID || locationData?.blastId,
        departmentId,
        clientId,
        userId,
        // pagination: {
        //     pageNo: 1,
        //     pageSize: 5,
        // },
        isCG: filterDetails?.isCG,
        isTG: filterDetails?.isTG,
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
    const handleClickActivityDetails = async () => {
        // if (!isAllAudienceSelected) {
        //     dispatch(linkPreviewDetailsData({}));
        //     setTopLinkActivity([]);
        //     setShouldFetch(false);
        //     setIsLinkActivityLoading(false);
        //     return;
        // }
        const payload = {
            ...params,
            campaignId: locationData?.campaignId,
            channelId: analyticsDetatils?.channelId || locationData?.channelId,
            blastID: filterDetails?.blastShortCode || blastID || locationData?.blastId,
            segmentId: effectiveSegmentId !== null && effectiveSegmentId !== undefined ? effectiveSegmentId : params.segmentId,
        };
        if (locationData?.isSplitAB && !locationData?.iswinnerSplit && !payload.split) {
            payload.split = splitType || 'A';
        }
        if (overviewDetail?.isEmailCgTg || overviewDetail?.isSmsCgTg || (overviewDetail?.isWaCgTg || overviewDetail?.isRcsCgTg)) {
            payload.isTG = payload.isTG !== undefined ? payload.isTG : true;
            payload.isCG = payload.isCG !== undefined ? payload.isCG : false;
        }
        if (payload && locationData?.campaignId && shouldFetch) {
            setShouldFetch(false);
            setIsLinkActivityLoading(true);
            try {
                const { status, data } = await dispatch(getClickActivityDetails({ payload }));
                if (status) {
                    setTopLinkActivity(data || []);
                } else {
                    setTopLinkActivity([]);
                }
            } finally {
                setIsLinkActivityLoading(false);
            }
        }
    };
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            isCG: filterDetails?.isCG,
            isTG: filterDetails?.isTG,
        }));
    }, [filterDetails?.isCG, filterDetails?.isTG]);

    useEffect(() => {
        if (!isAllAudienceSelected) {
            dispatch(linkPreviewDetailsData({}));
            setTopLinkActivity([]);
            setShouldFetch(false);
            setIsLinkActivityLoading(false);
        } else {
            setShouldFetch(true);
        }
    }, [isAllAudienceSelected]);

    const handleCSVDownload = async () => {
        const payload = {
            campaignId: campaignId,
            channelId: channelId,
            departmentId,
            clientId,
            userId,
            blastID: blastID || locationData?.blastId,
            split: params?.split,
            segmentId: effectiveSegmentId !== null && effectiveSegmentId !== undefined ? effectiveSegmentId : params?.segmentId,
        };
        if (locationData?.isSplitAB && !locationData?.iswinnerSplit && !payload.split) {
            payload.split = splitType || 'A';
        }
        await linkCsvDownloadLoader.refetch({
            fetcher: async () => {
                const res = await dispatch(csvDownloadLInkPreview({ payload }));
                if (res?.status) {
                    downloadCSVcommasFile(
                        res?.data,
                        campaignName + '_' + new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString(),
                    );
                }
                return res;
            },
            mode: 'create',
            loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
        });
    };
    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            blastID: analyticsDetatils?.blastId || blastID || locationData?.blastId,
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
                splitData = filterDetails?.splitData?.replace('Split ', '')?.trim();
            } else {
                splitData = undefined;
            }
            setParams((prev) => ({
                ...prev,
                startDate: getYYMMDD(filterDetails?.selectedDate?.startDate),
                endDate: getYYMMDD(filterDetails?.selectedDate?.endDate),
                segmentId: filterDetails?.filterSelectedData !== undefined && filterDetails?.filterSelectedData !== null
                    ? filterDetails.filterSelectedData
                    : (effectiveSegmentId !== null && effectiveSegmentId !== undefined ? effectiveSegmentId : prev.segmentId),
                split: !!filterDetails?.splitData ? splitData : undefined,
                ...(filterDetails?.blastShortCode && {
                    blastID: filterDetails.blastShortCode
                })
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
        if (locationData !== null && params?.campaignId && params?.blastID && Object.keys(overviewDetail)?.length > 0 && shouldFetch && isSegmentDetailApiCompleted) {
            handleClickActivityDetails();
        }
    }, [overviewDetail, params, effectiveSegmentId, isSegmentDetailApiCompleted, shouldFetch, isAllAudienceSelected]);

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState;
        // setParams((prev) => ({
        //     ...prev,
        //     pagination: {
        //         pageNo: skip === 0 ? 1 : skip / take + 1,
        //         pageSize: take,
        //     },
        // }));
    };

    return (
        <>
            <Col>
                <div className="portlet-container rs-table-with-heading mb30">
                    <div className="portlet-header flex-row mb6">
                        <div className="fr d-flex align-items-center">
                            <h4 className="mb0">Total link click activity</h4>
                            {parseInt(channelId, 10) === 1 && (
                                <RSTooltip text="Click map" position="top" className="lh0" innerContent={false}>
                                    <div
                                        className={`${
                                            linkPreviewData?.linkClickList?.length > 0 ? '' : 'pe-none click-off'
                                        }`}
                                    >
                                        <i
                                            id="rs_data_eye"
                                            className={`${eye_medium} icon-md px-2 color-primary-blue`}
                                            onClick={() => handlePreviewDetails()}
                                        />
                                    </div>
                                </RSTooltip>
                            )}

                            <span className="font-xs ml10">
                                  (As on: {getUserCurrentFormat(dateField,{isOffset:true})?.dateTimeFormat})
                            </span>

                            {/* <span className="font-xs">{dateField}</span> */}
                        </div>
                        <div className="float-end">
                            <div className="d-flex align-items-center">
                                <RSTooltip
                                    text={linkCsvDownloadLoader.isLoading ? 'Loading...' : 'Download CSV'}
                                    position="top"
                                    className="lh0 ml10"
                                    innerContent={false}
                                >
                                    <div
                                        className={`eye-icon-wrapper d-flex align-items-center justify-content-center ${
                                            linkPreviewData?.linkClickList?.length > 0 && !linkCsvDownloadLoader.isLoading
                                                ? ''
                                                : 'pe-none click-off'
                                        } ${linkCsvDownloadLoader.isLoading ? 'eye-icon-wrapper--loading' : ''}`}
                                    >
                                        {linkCsvDownloadLoader.isLoading ? (
                                            <span
                                                className="segment_loader listing-preview-eye-loader"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <i
                                                className={`${csv_download_large} icon-lg  color-primary-blue`}
                                                onClick={() => handleCSVDownload()}
                                                id="rs_TotalActivity_CSV"
                                            />
                                        )}
                                    </div>
                                </RSTooltip>
                            </div>
                        </div>
                    </div>

                    <div className="portlet-body communication-status-portlet-body">
                        <div className={linkPreviewData?.linkClickList?.length > 4 ? 'pb15 detail-table' : ''}>
                            <KendoGrid
                                data={linkPreviewData?.linkClickList || []}
                                column={ColumnListData}
                                isDataStateRequired={false}
                                isLoading={isLinkActivityLoading}
                                pageable={true}
                                onDataStateChange={(data) => handlePagerChange(data)}
                                scrollable="scrollable"
                                settings={{ total: linkPreviewData?.linkClickList?.length || 0 }}
                                isScrollTop={false}
                            />
                        </div>
                    </div>
                </div>
            </Col>
            {/* <WarningPopup
                show={isFailure?.status}
                handleClose={() => {
                    setIsFailure({
                        status: false,
                        message: ''
                    });
                }}
                //removeRule={() => removeRule(index)}
                text={
                    <div>
                        {isFailure?.message}
                    </div>
                }
                showCancel={true}
                isPrimary={false}
            /> */}
        </>
    );
};

export default memo(TotalActivity);
