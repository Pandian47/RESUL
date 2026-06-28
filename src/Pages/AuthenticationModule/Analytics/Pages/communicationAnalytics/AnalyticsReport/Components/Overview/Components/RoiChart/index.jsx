import { numberWithCommas, numberWithCommasformatCurrency } from 'Utils/modules/formatters';
import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { arrow_left_mini, arrow_right_mini, minus_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import Icon, { Icons } from 'Components/Icon/Icon';
import { roiSingleTouch, getRoiSingleTouchConfig, mapApiResponseToRoiSingleTouch, mapFactModelToRoiSingleTouch, mergeFactModelIntoRoiDisplayList, mergeApiCountWithFactModelTotal, getTotalAudienceFromApiResponse, getTotalAudienceFromFactModel, buildSingleMultiTouchPayload, getChannelCountFromFactModel, TOUCH_DROPDOWN_DATA, mapAttributionTouchArrayToRoiList, getAttributionRoiRowArray } from './constant';
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getSummaryList,
    getAttributionRoi,
    getAttributionRoiLoading,
} from 'Reducers/analytics/analyticsSummary/selector';
import { getAttributionForRoi } from 'Reducers/analytics/analyticsSummary/request';

import { RoiChartSkeleton } from 'Components/Skeleton/Skeleton';

import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

const attribution = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const RoiChart = (props) => {
    const dispatch = useDispatch();
    const state = useQueryParams('/analytics/analytics-report');
    const { clientId, userId, departmentId } = useSelector(getSessionId);
    const summary = useSelector(getSummaryList);
    const attributionRoi = useSelector(getAttributionRoi);
    const attributionRoiLoading = useSelector(getAttributionRoiLoading);
    const summarySubSegmentDetail = useSelector((s) => s.analyticsReportReducer?.summarySubSegmentDetail);

    const [firstTouch, setFirstTouch] = useState(false);
    const [lastTouch, setLastTouch] = useState(false);
    const [selectedTouch, setSelectedTouch] = useState(TOUCH_DROPDOWN_DATA[0]);

    const domain = props?.domain ?? summary?.domain ?? undefined;
    const campaignType = (summary?.campaignType || '').toString().toUpperCase();
    const isSingleTouch = campaignType !== 'M';
    const touchType = isSingleTouch ? 'single' : 'multi';

    useEffect(() => {
        if (!state?.from) return;
        const payload =
            summary && Object.keys(summary).length > 0
                ? buildSingleMultiTouchPayload(summary, touchType, selectedTouch, state?.from)
                : { data: [], touchType };
        dispatch(getAttributionForRoi({ payload }));
    }, [
        touchType,
        state?.from,
        summary,
        state?.subSegmentLevel,
        summarySubSegmentDetail?.subSegmentLevel,
        clientId,
        userId,
        departmentId,
        dispatch,
        selectedTouch
    ]);

    const factModel = summary?.factModel;
    const hasFactModelData = factModel && typeof factModel === 'object' && Object.keys(factModel).length > 0;
    const hasApiData = attributionRoi && typeof attributionRoi === 'object';

    const touchDisplayList = hasApiData
        ? mapAttributionTouchArrayToRoiList(getAttributionRoiRowArray(attributionRoi), selectedTouch, summary)
        : [];
    const mappedFromApi = hasApiData ? mapApiResponseToRoiSingleTouch(attributionRoi, domain, selectedTouch) : [];
    const apiOrDefaultList =
        mappedFromApi?.length > 0 ? mappedFromApi : getRoiSingleTouchConfig(domain) || roiSingleTouch;

    const factModelList = isSingleTouch && hasFactModelData ? mapFactModelToRoiSingleTouch(factModel) : [];
    const hasSingleTouchData =
        isSingleTouch && (factModelList?.length > 0 || (hasFactModelData && apiOrDefaultList?.length > 0));
    const useFactModelForSingleTouch = hasSingleTouchData;
    const displayList =
        isSingleTouch && hasFactModelData
            ? mappedFromApi?.length > 0
                ? mergeApiCountWithFactModelTotal(mappedFromApi, factModel)
                : factModelList?.length > 0
                ? factModelList
                : mergeFactModelIntoRoiDisplayList(apiOrDefaultList, factModel)
            : apiOrDefaultList;
    // console.log('displayList: ', displayList);

    const totalAudienceCount = isSingleTouch && hasFactModelData
        ? (summary?.totalRecipientsCount != null && Number(summary?.totalRecipientsCount) > 0 ? summary?.totalRecipientsCount : getTotalAudienceFromFactModel(factModel))
        : hasApiData
            ? getTotalAudienceFromApiResponse(attributionRoi)
            : summary?.totalRecipientsCount;

    const displayTotalAudience = totalAudienceCount != null ? numberWithCommas(totalAudienceCount) : '';

    const showAttributionNoData =
    isSingleTouch &&
    !attributionRoiLoading &&
    attributionRoi === null ;
    
    const showMultiTouchNoData =
        !isSingleTouch &&
        !attributionRoiLoading &&
        state?.from &&
        (attributionRoi === null || (hasApiData && mappedFromApi?.length === 0));

    const hasMultiTouchData = !isSingleTouch && mappedFromApi?.length > 0;

    const SequenceContributionOverlay = ({ item, children }) => {
        const metrics = item?.sequenceContribution;
        const hasSectionTooltip = metrics?.layout === 'sections' && metrics?.sections?.length > 0;
        const hasLegacyTooltip = Array.isArray(metrics) && metrics.length > 0;
        if (!hasSectionTooltip && !hasLegacyTooltip) {
            return children;
        }
        return (
            <OverlayTrigger
                placement="auto"
                delay={{ show: 120, hide: 80 }}
                popperConfig={{
                    modifiers: [
                        {
                            name: 'flip',
                            options: {
                                allowedAutoPlacements: ['top', 'bottom'],
                                rootBoundary: 'viewport',
                                padding: 8,
                            },
                        },
                        {
                            name: 'preventOverflow',
                            options: {
                                padding: 8,
                                rootBoundary: 'viewport',
                            },
                        },
                    ],
                }}
                overlay={
                    <Tooltip className="sequence-contribution-tooltip ml2">
                        <SequenceContributionTooltipBody metrics={metrics} />
                    </Tooltip>
                }
            >
                {children}
            </OverlayTrigger>
        );
    };
    const SequenceContributionTooltipBody = ({ metrics }) => {
        const { currencyMasterList } = getmasterData();
        const { currencyId } = getUserDetails();
        let currsymbol = '₹';
        const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
        currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;

        if (metrics?.layout === 'sections' && metrics?.sections?.length > 0) {
            return (
                <div className="seq-contrib-inner seq-contrib-inner--sections">
                    <h4 className="mb10">Sequence Contribution</h4>
                    {metrics.sections.map((sec, si) => (
                        <div key={si} className="seq-contrib-section">
                            <div className="seq-contrib-section-title font-semi-bold mb8">{sec.title}</div>
                            <div className="seq-contrib-tiles">
                                {(sec.tiles || []).map((m, i) => (
                                    <div
                                        key={i}
                                        className={`seq-contrib-tile ${m.fullWidth ? 'seq-contrib-tile-full' : ''}`}
                                    >
                                        <span className="seq-contrib-label">{m.label}</span>
                                        <span className="seq-contrib-value font-bold">{m.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        const rowTiles = Array.isArray(metrics) ? metrics.filter((m) => !m.fullWidth) : [];
        return (
            <div className="seq-contrib-inner">
                <h4 className="mb10">Sequence Contribution</h4>
                {rowTiles.length > 0 && (
                    <div className="seq-contrib-tiles">
                        {rowTiles.map((m, i) => (
                            <div key={i} className="seq-contrib-tile">
                                <span className="seq-contrib-label">{m.label}</span>
                                <span className="seq-contrib-value font-bold">{`${currsymbol}${m.value}`}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };
    return (
        <Row className={`${props?.disable ? 'd-none' : ''}`}>
            <Col md={12}>
                <div className="portlet-container portlet-height-auto">
                    <div className="d-flex justify-content-between mb10">
                    <div className="portlet-header">
                        <h3>Channel attribution contribution</h3>
                    </div>
                    <div className="">
                        <RSBootstrapdown
                            data={TOUCH_DROPDOWN_DATA}
                            onSelect={(item) => setSelectedTouch(item)}
                            isActive
                            defaultItem={selectedTouch}
                        />
                    </div>
                    </div>

                    <div className="portlet-body">
                        {isSingleTouch ? (
                           attributionRoiLoading ? (
                                <RoiChartSkeleton />
                            ) : showAttributionNoData ? (
                                <RoiChartSkeleton isError />
                            ) : (
                                <>
                                    <ul className="attr-roi-wrapper"></ul>
                                    <div className="attri-roi-contianer attri-roi-sdc-event-single-touch">
                                        <div className="d-flex justify-content-center">
                                            <Icons groupCass="d-flex align-items-center mb23 position-relative left10">
                                                {attribution.map((item, index, arr) => (
                                                    <div key={index} className="d-flex align-items-center">
                                                        {index === 0 && (
                                                            <Icon
                                                                icon={`${arrow_left_mini}`}
                                                                size="sm"
                                                                mainClass="pointer-event-none"
                                                            />
                                                        )}
                                                        {index !== 0 && (
                                                            <Icon
                                                                icon={`${minus_mini}`}
                                                                size="sm"
                                                                mainClass="ml0 pointer-event-none"
                                                            />
                                                        )}
                                                        {index === Math.floor(arr?.length / 2) && (
                                                            <h4 className="text-center mx10 mb0">
                                                                <span>Total audience:</span>
                                                                <span className="font-bold">
                                                                    {' '}
                                                                    {displayTotalAudience}
                                                                </span>
                                                            </h4>
                                                        )}
                                                        {arr?.length === index + 1 && (
                                                            <Icon
                                                                icon={`${arrow_right_mini}`}
                                                                size="sm"
                                                                mainClass="pointer-event-none ml0"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </Icons>
                                        </div>
                                        <div className="attri-roi-contianer attri-roi-sdc-event-single-touch">
                                            <ul className="mb15">
                                                {(touchDisplayList).map((item, index) => {
                                                    const hoverCount =
                                                        item.count != null
                                                            ? item.count
                                                            : getChannelCountFromFactModel(
                                                                  summary?.factModel,
                                                                  item?.name,
                                                              );
                                                    const percent = item.data?.[0]?.firstTouch ?? 0;
                                                    const showTooltip =
                                                        summary?.factModel && Object.keys(summary?.factModel).length > 0;
                                                    const tooltipText = showTooltip
                                                        ? `${numberWithCommas(hoverCount)} (${percent}%)`
                                                        : null;
                                                    const roiAmountVal = item.roiAmount != null ? item.roiAmount : null;
                                                    const formatRoiAmount = (val) =>
                                                        typeof val === 'number' && Number.isFinite(val)
                                                            ? numberWithCommasformatCurrency(val)
                                                            : val != null
                                                            ? String(val)
                                                            : '';

                                                    return (
                                                        <li key={index}>
                                                            <div className="d-flex align-items-center w-100">
                                                                <div className="attri-icon-set ">
                                                                    <div className="attri-icon">
                                                                        <div className={`r-icon-w ${item.color}`}>
                                                                            <i
                                                                                className={`${item.icon} icon-md color-whites`}
                                                                            />
                                                                        </div>
                                                                        <p>{item.name}</p>
                                                                    </div>
                                                                </div>

                                                                {(item?.data ?? []).map((dt, indx) => (
                                                                    <div
                                                                        className="d-flex align-items-center flex-fill"
                                                                        key={indx}
                                                                    >
                                                                        <ul className="attri-progress-set bg-tertiary-blue flex-fill">
                                                                            <li
                                                                                className={`first-touch sdc-single-touch-bar ${
                                                                                    firstTouch
                                                                                        ? 'width-empty-forced'
                                                                                        : ''
                                                                                } ${item.color}`}
                                                                                style={{ width: `${dt.firstTouch}%` }}
                                                                            >

                                                                                <SequenceContributionOverlay item={item}>
                                                                                    <div
                                                                                        className="seq-contrib-percent-trigger w-100 h-100 d-flex align-items-center justify-content-center"
                                                                                        role="button"
                                                                                        tabIndex={0}
                                                                                    >
                                                                                        {dt.firstTouch}
                                                                                        <sub>%</sub>
                                                                                    </div>
                                                                                </SequenceContributionOverlay>
                                                                            </li>
                                                                        </ul>

                                                                    
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* <div className="benchmark-legend-con">
                                        <ul>
                                            <li
                                                className={`cp ${firstTouch ? 'disabled' : ''}`}
                                                onClick={() => setFirstTouch(!firstTouch)}
                                            >
                                                <span
                                                    className={`benchmark-legend ${
                                                        !firstTouch ? 'bg-blue-medium' : 'bg-others'
                                                    }`}
                                                ></span>
                                                <span>First touch</span>
                                            </li>
                                            <li
                                                className={`cp ${lastTouch ? 'disabled' : ''}`}
                                                onClick={() => setLastTouch(!lastTouch)}
                                            >
                                                <span
                                                    className={`benchmark-legend ${
                                                        !lastTouch ? 'bg-green-medium' : 'bg-others'
                                                    }`}
                                                ></span>
                                                <span>Last touch</span>
                                            </li>
                                        </ul>
                                    </div> */}
                                </>
                            )
                        ) : attributionRoiLoading ? (
                            <RoiChartSkeleton />
                        ) : showMultiTouchNoData ? (
                            <RoiChartSkeleton isError />
                        ) : hasMultiTouchData ? (
                            // Multi-touch: keep existing ROI component behavior (bars)
                            <>
                                <ul className="attr-roi-wrapper"></ul>
                                <div className="attri-roi-contianer">
                                    <div className="d-flex justify-content-center">
                                        <Icons groupCass="d-flex align-items-center mb23 position-relative left10">
                                            {attribution.map((item, index, arr) => (
                                                <div key={index} className="d-flex align-items-center">
                                                    {index === 0 && (
                                                        <Icon
                                                            icon={`${arrow_left_mini}`}
                                                            size="sm"
                                                            mainClass="pointer-event-none"
                                                        />
                                                    )}
                                                    {index !== 0 && (
                                                        <Icon
                                                            icon={`${minus_mini}`}
                                                            size="sm"
                                                            mainClass="ml0 pointer-event-none"
                                                        />
                                                    )}
                                                    {index === Math.floor(arr?.length / 2) && (
                                                        <h4 className="text-center mx10 mb0">
                                                            <span>Total audience:</span>
                                                            <span className="font-bold"> {displayTotalAudience}</span>
                                                        </h4>
                                                    )}
                                                    {arr?.length === index + 1 && (
                                                        <Icon
                                                            icon={`${arrow_right_mini}`}
                                                            size="sm"
                                                            mainClass="pointer-event-none ml0"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </Icons>
                                    </div>
                                    <ul className="mb25">
                                        {displayList.map((item, index) => (
                                            <li key={index}>
                                                <div className="attri-icon-set bg-tertiary-grey">
                                                    <div className="attri-icon">
                                                        <div className={`r-icon-w ${item.color}`}>
                                                            <i className={`${item.icon} icon-md color-whites`} />
                                                        </div>
                                                        <p>{item.name}</p>
                                                    </div>
                                                </div>
                                                {(item?.data ?? []).map((dt, indx) => (
                                                    <ul className="attri-progress-set bg-tertiary-blue" key={indx}>
                                                        <li
                                                            className={`first-touch ${
                                                                firstTouch ? 'width-empty-forced' : ''
                                                            } mt20`}
                                                            style={{
                                                                width:
                                                                    dt.firstTouch < 5 ? '13%' : dt.firstTouch + 5 + '%',
                                                            }}
                                                        >
                                                            {dt.firstTouch}
                                                            <sub>%</sub>
                                                        </li>
                                                        <li
                                                            className={`last-touch ${
                                                                lastTouch ? 'width-empty-forced' : ''
                                                            }`}
                                                            style={{ width: dt.lastTouch + '%' }}
                                                        >
                                                            {dt.lastTouch}
                                                            <sub>%</sub>
                                                        </li>
                                                    </ul>
                                                ))}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default RoiChart;

