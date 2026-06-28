import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas, numberWithCommasformatCurrency } from 'Utils/modules/formatters';
import { AS_ON } from 'Constants/GlobalConstant/Placeholders';
import { arrow_left_mini, arrow_right_mini, minus_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import Icon, { Icons } from 'Components/Icon/Icon';
import {
    roiSingleTouch,
    getRoiSingleTouchConfig,
    mapApiResponseToRoiSingleTouch,
    mapFactModelToRoiSingleTouch,
    mergeFactModelIntoRoiDisplayList,
    mergeApiCountWithFactModelTotal,
    getTotalAudienceFromApiResponse,
    getTotalAudienceFromFactModel,
    buildSingleMultiTouchPayload,
    getChannelCountFromFactModel,
} from './constant';
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getSummaryList,
    getAttributionRoi,
    getAttributionRoiLoading,
} from 'Reducers/analyticsSSR/analyticsSummary/selector';
import { getAttributionForRoi } from 'Reducers/analyticsSSR/analyticsSummary/request';

import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import RSTooltip from 'Components/RSTooltip';

const attribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const RoiChart = (props) => {
    const dispatch = useDispatch();
    const state = useQueryParams('/AnalyticsSSE/analytics-report');
    const { clientId, userId, departmentId } = useSelector(getSessionId);
    const summary = useSelector(getSummaryList);
    const attributionRoi = useSelector(getAttributionRoi);
    const attributionRoiLoading = useSelector(getAttributionRoiLoading);
    const summarySubSegmentDetail = useSelector((s) => s.analyticsReportSSRReducer?.summarySubSegmentDetail);

    const [firstTouch, setFirstTouch] = useState(false);
    const [lastTouch, setLastTouch] = useState(false);

    const domain = props?.domain ?? summary?.domain ?? undefined;
    const campaignType = (summary?.campaignType || '').toString().toUpperCase();
    const isSingleTouch = campaignType !== 'M';
    const touchType = isSingleTouch ? 'single' : 'multi';

    useEffect(() => {
        if (!state?.from) return;
        const payload = summary && Object.keys(summary).length > 0
            ? buildSingleMultiTouchPayload(summary, touchType, state?.from)
            : { data: [], touchType };
        dispatch(getAttributionForRoi({ payload }));
    }, [touchType, state?.from, summary, state?.subSegmentLevel, summarySubSegmentDetail?.subSegmentLevel, clientId, userId, departmentId, dispatch]);

    const factModel = summary?.factModel;
    const hasFactModelData = factModel && typeof factModel === 'object' && Object.keys(factModel).length > 0;
    const hasApiData = attributionRoi && typeof attributionRoi === 'object';
    const mappedFromApi = hasApiData ? mapApiResponseToRoiSingleTouch(attributionRoi, domain) : [];
    const apiOrDefaultList = mappedFromApi?.length > 0 ? mappedFromApi : getRoiSingleTouchConfig(domain) || roiSingleTouch;
    const factModelList = isSingleTouch && hasFactModelData ? mapFactModelToRoiSingleTouch(factModel) : [];
    const hasSingleTouchData = isSingleTouch && (factModelList?.length > 0 || (hasFactModelData && apiOrDefaultList?.length > 0));
    const useFactModelForSingleTouch = hasSingleTouchData;
    const displayList = isSingleTouch && hasFactModelData
        ? (mappedFromApi?.length > 0
            ? mergeApiCountWithFactModelTotal(mappedFromApi, factModel)
            : factModelList?.length > 0
                ? factModelList
                : mergeFactModelIntoRoiDisplayList(apiOrDefaultList, factModel))
        : apiOrDefaultList;
    const totalAudienceCount = isSingleTouch && hasFactModelData
        ? (summary?.totalRecipientsCount != null && Number(summary?.totalRecipientsCount) > 0 ? summary?.totalRecipientsCount : getTotalAudienceFromFactModel(factModel))
        : hasApiData
            ? getTotalAudienceFromApiResponse(attributionRoi)
            : summary?.totalRecipientsCount;
    const displayTotalAudience =
        totalAudienceCount != null ? numberWithCommas(totalAudienceCount) : '';

    const showAttributionNoData =
        isSingleTouch &&
        !useFactModelForSingleTouch &&
        !attributionRoiLoading &&
        state?.from &&
        (attributionRoi === null || (hasApiData && mappedFromApi?.length === 0));

    const showMultiTouchNoData =
        !isSingleTouch &&
        !attributionRoiLoading &&
        state?.from &&
        (attributionRoi === null || (hasApiData && mappedFromApi?.length === 0));
    const hasMultiTouchData = !isSingleTouch && mappedFromApi?.length > 0;

    return (
        <Row className={`${props?.disable ? 'd-none' : ''}`}>
            <Col md={12}>
                <div className="portlet-container portlet-height-auto">
                    <div className="portlet-header">
                        <h3>Attribution for ROI</h3>
                    </div>

                    <div className="portlet-body">
                        {isSingleTouch ? (
                            !useFactModelForSingleTouch && attributionRoiLoading ? (
                                <div className="skeleton-span-con p0 width100p">
                                    <div className="width100p">
                                        <div className="skeleton-span fill width100p">
                                            <HorizontalSkeleton count={5} height={44} />
                                        </div>
                                    </div>
                                </div>
                            ) : showAttributionNoData ? (
                                <div className="skeleton-span-con p0 width100p">
                                    <div className="width100p">
                                        <div className="skeleton-span fill width100p d-flex align-items-center justify-content-center" style={{ minHeight: 220 }}>
                                            <HorizontalSkeleton count={5} height={44} isError />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <ul className="attr-roi-wrapper"></ul>
                                    <div className="attri-roi-contianer">
                                        <div className="d-flex justify-content-center">
                                            <Icons groupCass="d-flex align-items-center mb23 position-relative left10">
                                                {attribution.map((item, index, arr) => (
                                                    <div key={index} className="d-flex align-items-center">
                                                        {index === 0 && (
                                                            <Icon icon={`${arrow_left_mini}`} size="sm" mainClass="pointer-event-none" />
                                                        )}
                                                        {index !== 0 && (
                                                            <Icon icon={`${minus_mini}`} size="sm" mainClass="ml0 pointer-event-none" />
                                                        )}
                                                        {index === Math.floor(arr?.length / 2) && (
                                                            <h4 className="text-center mx10 mb0"> <span>Total audience:</span><span className='font-bold'> {displayTotalAudience}</span></h4>
                                                        )}
                                                        {arr?.length === index + 1 && (
                                                            <Icon icon={`${arrow_right_mini}`} size="sm" mainClass="pointer-event-none ml0" />
                                                        )}
                                                    </div>
                                                ))}
                                            </Icons>
                                        </div>
                                        <ul className="mb25">
                                            {displayList.map((item, index) => {
                                                const hoverCount = item.count != null ? item.count : getChannelCountFromFactModel(summary?.factModel, item.name);
                                                const percent = item.data?.[0]?.firstTouch ?? 0;
                                                const showTooltip = summary?.factModel && Object.keys(summary?.factModel).length > 0;
                                                const tooltipText = showTooltip ? `${numberWithCommas(hoverCount)} (${percent}%)` : null;
                                                const roiCountVal = item.roiCount != null ? item.roiCount : null;
                                                const roiAmountVal = item.roiAmount != null ? item.roiAmount : null;
                                                const formatRoiAmount = (val) => (typeof val === 'number' && Number.isFinite(val) ? numberWithCommasformatCurrency(val) : (val != null ? String(val) : ''));
                                                return (
                                                    <li key={index}>
                                                        <div className="attri-icon-set bg-tertiary-grey">
                                                            <div className="attri-icon">
                                                                <div className={`r-icon-w ${item.color}`}>
                                                                    <i className={`${item.icon} icon-md color-whites`}></i>
                                                                </div>
                                                                <p>{item.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className='d-flex align-items-center flex-fill'>
                                                            {(item?.data ?? []).map((dt, indx) => (
                                                                <ul className="attri-progress-set bg-tertiary-blue" key={indx}>
                                                                    <li
                                                                        className={`first-touch ${firstTouch ? 'width-empty-forced' : ''} mt20`}
                                                                        style={{ width: dt.firstTouch < 5 ? '13%' : dt.firstTouch + 5 + '%' }}
                                                                    >
                                                                        {tooltipText ? (
                                                                            <RSTooltip text={tooltipText} innerContent={false} className='px5'>
                                                                                <span>
                                                                                    {dt.firstTouch}
                                                                                    <sub>%</sub>
                                                                                </span>
                                                                            </RSTooltip>
                                                                        ) : (
                                                                            <>
                                                                                {dt.firstTouch}
                                                                                <sub>%</sub>
                                                                            </>
                                                                        )}
                                                                    </li>
                                                                    <li
                                                                        className={`last-touch ${lastTouch ? 'width-empty-forced' : ''}`}
                                                                        style={{ width: dt.lastTouch + '%' }}
                                                                    >
                                                                        {dt.lastTouch}
                                                                        <sub>%</sub>
                                                                    </li>

                                                                </ul>
                                                            ))}
                                                            {(roiCountVal != null || roiAmountVal != null) && (
                                                                <div className="roi-value-box ml20 w-29">
                                                                    {roiAmountVal != null && (
                                                                        <span className="badge bg-primary-blue color-whites font-sm ms-auto">
                                                                            {formatRoiAmount(roiAmountVal)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    {/* <div className="benchmark-legend-con">
                                        <ul>
                                            <li className={`cp ${firstTouch ? 'disabled' : ''}`} onClick={() => setFirstTouch(!firstTouch)}>
                                                <span className={`benchmark-legend ${!firstTouch ? 'bg-blue-medium' : 'bg-others'}`}></span>
                                                <span>First touch</span>
                                            </li>
                                            <li className={`cp ${lastTouch ? 'disabled' : ''}`} onClick={() => setLastTouch(!lastTouch)}>
                                                <span className={`benchmark-legend ${!lastTouch ? 'bg-green-medium' : 'bg-others'}`}></span>
                                                <span>Last touch</span>
                                            </li>
                                        </ul>
                                    </div> */}
                                    {/* {summary?.jobDateTime && (
                                        <small className="color-primary-grey position-relative top1">
                                            ({AS_ON}: {getUserCurrentFormat(summary.jobDateTime, { isOffset: true })?.utcformat})
                                        </small>
                                    )} */}
                                </>
                            )
                        ) : attributionRoiLoading ? (
                            <div className="skeleton-span-con p0 width100p">
                                <div className="width100p">
                                    <div className="skeleton-span fill width100p">
                                        <HorizontalSkeleton count={5} height={44} />
                                    </div>
                                </div>
                            </div>
                        ) : showMultiTouchNoData ? (
                            <div className="skeleton-span-con p0 width100p d-flex align-items-center justify-content-center" style={{ minHeight: 220 }}>
                                <HorizontalSkeleton count={5} height={44} isError />
                            </div>
                        ) : hasMultiTouchData ? (
                            <>
                                <ul className="attr-roi-wrapper"></ul>
                                <div className="attri-roi-contianer">
                                    <div className="d-flex justify-content-center">
                                        <Icons groupCass="d-flex align-items-center mb23 position-relative left10">
                                            {attribution.map((item, index, arr) => (
                                                <div key={index} className="d-flex align-items-center">
                                                    {index === 0 && (
                                                        <Icon icon={`${arrow_left_mini}`} size="sm" mainClass="pointer-event-none" />
                                                    )}
                                                    {index !== 0 && (
                                                        <Icon icon={`${minus_mini}`} size="sm" mainClass="ml0 pointer-event-none" />
                                                    )}
                                                    {index === Math.floor(arr?.length / 2) && (
                                                        <h4 className="text-center mx10 mb0"> <span>Total audience:</span><span className='font-bold'> {displayTotalAudience}</span></h4>
                                                    )}
                                                    {arr?.length === index + 1 && (
                                                        <Icon icon={`${arrow_right_mini}`} size="sm" mainClass="pointer-event-none ml0" />
                                                    )}
                                                </div>
                                            ))}
                                        </Icons>
                                    </div>
                                    <ul className="mb25">
                                        {displayList.map((item, index) => {
                                            const hoverCount = item.count != null ? item.count : getChannelCountFromFactModel(summary?.factModel, item.name);
                                            const percent = item.data?.[0]?.firstTouch ?? 0;
                                            const showTooltip = summary?.factModel && Object.keys(summary?.factModel).length > 0;
                                            const tooltipText = showTooltip ? `${numberWithCommas(hoverCount)} (${percent}%)` : null;
                                            const roiCountVal = item.roiCount != null ? item.roiCount : null;
                                            const roiAmountVal = item.roiAmount != null && Number(item.roiAmount) !== 0 ? item.roiAmount : null;
                                            const formatRoiAmount = (val) => (typeof val === 'number' && Number.isFinite(val) ? numberWithCommasformatCurrency(val) : val);
                                            return (
                                                <li key={index}>
                                                    <div className="attri-icon-set bg-tertiary-grey">
                                                        <div className="attri-icon">
                                                            <div className={`r-icon-w ${item.color}`}>
                                                                <i className={`${item.icon} icon-md color-whites`}></i>
                                                            </div>
                                                            <p>{item.name}</p>
                                                        </div>
                                                    </div>
                                                    {(item?.data ?? []).map((dt, indx) => (
                                                        <ul className="attri-progress-set bg-tertiary-blue" key={indx}>
                                                            <li
                                                                className={`first-touch ${firstTouch ? 'width-empty-forced' : ''} mt20`}
                                                                style={{ width: dt.firstTouch < 5 ? '13%' : dt.firstTouch + 5 + '%' }}
                                                            >
                                                                {tooltipText ? (
                                                                    <RSTooltip text={tooltipText} innerContent={false}>
                                                                        <span>
                                                                            {dt.firstTouch}
                                                                            <sub>%</sub>
                                                                        </span>
                                                                    </RSTooltip>
                                                                ) : (
                                                                    <>
                                                                        {dt.firstTouch}
                                                                        <sub>%</sub>
                                                                    </>
                                                                )}
                                                            </li>
                                                            <li
                                                                className={`last-touch ${lastTouch ? 'width-empty-forced' : ''}`}
                                                                style={{ width: dt.lastTouch + '%' }}
                                                            >
                                                                {dt.lastTouch}
                                                                <sub>%</sub>
                                                            </li>
                                                        </ul>
                                                    ))}
                                                    {(roiCountVal != null || roiAmountVal != null) && (
                                                        <li className="d-flex align-items-center gap-2 flex-wrap mt1">
                                                            {roiCountVal != null && (
                                                                <div className="roi-value-box ml20 w-29">
                                                                    {numberWithCommas(roiCountVal)} count
                                                                </div>
                                                            )}
                                                            {roiAmountVal != null && (
                                                                <div className="roi-value-box ml20 w-29">
                                                                    {formatRoiAmount(roiAmountVal)}
                                                                </div>
                                                            )}
                                                        </li>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <div className="benchmark-legend-con">
                                    <ul>
                                        <li className={`cp ${firstTouch ? 'disabled' : ''}`} onClick={() => setFirstTouch(!firstTouch)}>
                                            <span className={`benchmark-legend ${!firstTouch ? 'bg-blue-medium' : 'bg-others'}`}></span>
                                            <span>First touch</span>
                                        </li>
                                        <li className={`cp ${lastTouch ? 'disabled' : ''}`} onClick={() => setLastTouch(!lastTouch)}>
                                            <span className={`benchmark-legend ${!lastTouch ? 'bg-green-medium' : 'bg-others'}`}></span>
                                            <span>Last touch</span>
                                        </li>
                                    </ul>
                                </div>
                                {/* {summary?.jobDateTime && (
                                    <small className="color-primary-grey position-relative top1">
                                        ({AS_ON}: {getUserCurrentFormat(summary.jobDateTime, { isOffset: true })?.utcformat})
                                    </small>
                                )} */}
                            </>
                        ) : null}
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default RoiChart;
