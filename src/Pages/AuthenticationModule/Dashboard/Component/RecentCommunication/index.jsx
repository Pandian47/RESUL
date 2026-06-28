import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { gaugeChartOptionsNormal } from 'Constants/Charts';
import { seriesNameField } from 'Constants/Charts/commonFunction';

import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSHighchartsContainer from 'Components/Highcharts';
import RSPPophover from 'Components/RSPPophover';
import RSTooltip from 'Components/RSTooltip';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import DashboardSkeletonScope from 'Components/Skeleton/pages/dashboard/DashboardSkeletonScope';
import RecentCommunicationGaugesSkeleton from 'Components/Skeleton/pages/dashboard/comm/RecentCommunicationGaugesSkeleton';
import RecentGaugeCardSkeleton from 'Components/Skeleton/pages/dashboard/comm/RecentGaugeCardSkeleton';

import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';

import { useContext, useEffect, useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { buildDetailAnalyticsNavState } from 'Pages/AuthenticationModule/Analytics/Pages/communicationAnalytics/DetailedAnalytics/constants';

import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { showPercentage, numberWithCommas } from 'Utils/modules/formatters';
import { toTitleCase } from 'Utils/modules/stringUtils';

import { DashboardContext } from '../../Dashboard';
import { DDL_RECENT_DATA } from './constant';

const isDirectDetailAnalytics = (item) =>
    Number(item?.channelId) === 7 ||
    (Number(item?.channelId) === 10 && Number(item?.subChannelId) === 9);

const buildDirectDetailState = (dataItem) =>
    buildDetailAnalyticsNavState({
        campaignName: dataItem?.campaignName,
        campaignId: +dataItem?.campaignId,
        channelId: +dataItem?.channelId,
        subChannelId: dataItem?.subChannelId,
        startDate: new Date(dataItem?.startDate),
        endDate: new Date(dataItem?.endDate),
        campaignTypeValue: dataItem?.campaignTypeValue,
        isFromListingPage: true,
    });

const checkCampaignArray = (data) => {
    if (data?.length > 3) {
        return data;
    }
    return data?.concat(new Array(3 - data?.length).fill({}));
};

const getCampaignUrl = (dataItem) => {
    try {
        const state = {
            from: +dataItem?.campaignId,
            campaignName: dataItem?.campaignName,
            isGolden: dataItem?.isGoldCampaign,
            startDate: new Date(dataItem?.startDate),
            endDate: new Date(dataItem?.endDate),
            campaignTypeValue: dataItem?.campaignTypeValue,
            channelId: +dataItem?.channelId,
            campaignType: dataItem?.campaignType,
        };
        if (isDirectDetailAnalytics(dataItem)) {
            return `/analytics/detail-analytics?q=${encodeUrl(buildDirectDetailState(dataItem))}`;
        }
        return `/analytics/analytics-report?q=${encodeUrl(state)}`;
    } catch {
        return '#';
    }
};

const getRecentCampaignChannelName = (item) => {
    const channelMeta = getChannelId(item?.channelId);
    if (channelMeta?.label) return channelMeta.label;

    const fallbackChannel = String(item?.channelInfo ?? '').trim();
    return fallbackChannel || '-';
};

const RecentCommunication = () => {
    // Selectors
    const navigate = useNavigate();
    const { duration, handleRecentChange, dashboardSessionResetSeq } = useContext(DashboardContext) || {};
    const { recentCampaigns } = useSelector(({ dashboardReducer }) => dashboardReducer || {}) || {};

    const recentCampaignsLoading = recentCampaigns?.isLoading;
    const hasRecentCampaigns = (recentCampaigns?.groupedCampaigns?.length ?? 0) > 0;

    // Refs
    const { isMounted } = useComponentWillUnmount();

    // State
    const [selectedddlRecenteData, setSelectedddlRecenteData] = useState(DDL_RECENT_DATA?.[0]);

    // Effects
    useEffect(() => {
        if (!isMounted.current) return;
        setSelectedddlRecenteData(DDL_RECENT_DATA?.[0]);
    }, [duration, dashboardSessionResetSeq]);

    // Handlers
    const handleNavigateCSR = (e, dataItem) => {
        e?.preventDefault();
        try {
            const state = {
                from: +dataItem?.campaignId,
                campaignName: dataItem?.campaignName,
                isGolden: dataItem?.isGoldCampaign,
                startDate: new Date(dataItem?.startDate),
                endDate: new Date(dataItem?.endDate),
                campaignTypeValue: dataItem?.campaignTypeValue,
                channelId: +dataItem?.channelId,
                campaignType: dataItem?.campaignType,
            };
            if (isDirectDetailAnalytics(dataItem)) {
                const detailState = buildDirectDetailState(dataItem);
                const encryptState = encodeUrl(detailState);
                navigate(`/analytics/detail-analytics?q=${encryptState}`, {
                    state: detailState,
                });
            } else {
                const url = '/analytics/analytics-report';
                const encryptState = encodeUrl(state);
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        } catch {
            // Navigation encoding failed
        }
    };

    const handleDropdownSelect = (item) => {
        setSelectedddlRecenteData(item);
        handleRecentChange?.(duration, item);
    };

    // JSX
    return (
        <div className="recentCommunication">
            {!recentCampaignsLoading ? (
                <div className="float-end" id="rs_RecentCommunication_ddldata">
                    <BootstrapDropdown
                        data={DDL_RECENT_DATA}
                        defaultItem={selectedddlRecenteData}
                        alignRight
                        className="recent-dropdown"
                        onSelect={handleDropdownSelect}
                        showUpdate={true}
                        isActive
                    />
                </div>
            ) : null}
            <div className="clearfix"></div>
            {recentCampaignsLoading ? (
                <DashboardSkeletonScope className="db-sk-recent-comm" injectCriticalCss>
                    <RecentCommunicationGaugesSkeleton />
                </DashboardSkeletonScope>
            ) : !hasRecentCampaigns ? (
                <div className="sp-mt-space-sm sp-mb-space-md gaugeslider-wrapper noprevnext">
                    <Row>
                        {[0, 1, 2].map((index) => (
                            <Col
                                md={4}
                                key={index}
                                className="box-design gauge-slider-box d-flex flex-column justify-content-between"
                            >
                                <DashboardSkeletonScope className="db-sk-gauge-inline" injectCriticalCss>
                                    <RecentGaugeCardSkeleton isError />
                                </DashboardSkeletonScope>
                            </Col>
                        ))}
                    </Row>
                </div>
            ) : (
                <Carousel
                    className={`sp-mt-space-sm sp-mb-space-md gaugeslider-wrapper ${
                        recentCampaigns?.groupedCampaigns?.[0]?.length < 3 ? 'noprevnext' : ''
                    }`}
                    indicators={true}
                    indicatorLabels={true}
                    interval={null}
                    controls={true}
                >
                    {recentCampaigns?.groupedCampaigns?.map((items, carouselIndex) => {
                        const updateCampaignArray = checkCampaignArray(items);

                        return (
                            <Carousel.Item key={carouselIndex}>
                                <Row>
                                    {updateCampaignArray.map((item, index) => (
                                        <Col
                                            md={4}
                                            key={index}
                                            className="box-design gauge-slider-box d-flex flex-column justify-content-between"
                                        >
                                            {Object.keys(item || {})?.length ? (
                                                <>
                                                    <a
                                                        href={getCampaignUrl(item)}
                                                        className="col-sm-12 cp text-decoration-none text-dark"
                                                        onClick={(e) => handleNavigateCSR(e, item)}
                                                    >
                                                        {item?.campaignName ? (
                                                            item?.campaignName?.length > 30 ? (
                                                                <RSTooltip
                                                                    placement="top"
                                                                    text={item?.campaignName}
                                                                    innerContent={false}
                                                                >
                                                                    <h4 className="mb20 gauge-slider-title">
                                                                        <TruncateCell value={item?.campaignName} noTable={true} />
                                                                    </h4>
                                                                </RSTooltip>
                                                            ) : (
                                                                <h4 className="mb20 gauge-slider-title">
                                                                    {item?.campaignName}
                                                                </h4>
                                                            )
                                                        ) : null}
                                                    </a>
                                                    <Row className="align-items-center">
                                                        <Col md={5} className="left-msg position-relative top12">
                                                            <span className="float-start position-relative top4">
                                                                {toTitleCase(item?.status)}
                                                            </span>
                                                            <h2 className="font-bold float-start pt5 mb0 hide">
                                                                {numberWithCommas(Math.floor(item?.count))}
                                                            </h2>
                                                        </Col>
                                                        <Col md={7} className="gauge-chart float-end p-0">
                                                            <div className="position-relative custom-gauge mt-15">
                                                                <RSHighchartsContainer
                                                                    options={gaugeChartOptionsNormal({
                                                                        height: 230,
                                                                        width: 230,
                                                                        series: [{ y: Math.min(item?.performanceScore || 0, 100) }],
                                                                        name: seriesNameField(item?.status),
                                                                        valueDecimals: 2,
                                                                        valueSuffix: item?.valueSuffix ?? '',
                                                                        tooltipPointFormat:
                                                                            '<span style="color:{point.color}">\u25CF</span>&nbsp;<span class="font-xs">{series.name}: </span>' +
                                                                            '<span class="font-xs">' +
                                                                            Math.min(Math.round(item?.performanceScore || 0), 100) +
                                                                            '<span class="fs11">%</span></span>',
                                                                        dataLabelFormat:
                                                                            '<span class="rpGaugeLabel" style="text-align:center;display:block;"><span style="font-family:MuktaRegular;font-size:14px;text-align:center;display:block;">' +
                                                                            (item?.performanceScore ?? 0) +
                                                                            ' ' +
                                                                            (item?.valueSuffix ?? '') +
                                                                            '</span></span>',
                                                                    })}
                                                                />
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <div className="d-flex align-items-center justify-content-end">
                                                        <span className="lh17 font-xs mr5">
                                                            {` ${getUserCurrentFormat(item?.startDate || '')?.dateFormat} - ${getUserCurrentFormat(item?.endDate || '')?.dateFormat}  `}
                                                        </span>
                                                        <RSPPophover
                                                            pophover={
                                                                <>
                                                                    <small>
                                                                        Channel: {getRecentCampaignChannelName(item)}
                                                                    </small>
                                                                    <small className="align-items-baseline d-flex">
                                                                        Target:{' '}
                                                                        {item?.targetInfo?.toLowerCase()?.startsWith('r')
                                                                            ? 'Reach'
                                                                            : item?.targetInfo?.toLowerCase()?.startsWith('e')
                                                                            ? 'Engagement'
                                                                            : 'Conversion'}{' '}
                                                                        ({showPercentage(item?.primaryTarget, 2)}
                                                                        <span className="fs9">%</span>)
                                                                    </small>
                                                                    <small className="align-items-baseline d-flex">
                                                                        Current:{' '}
                                                                        {item?.targetInfo?.toLowerCase()?.startsWith('r')
                                                                            ? 'Reach'
                                                                            : item?.targetInfo?.toLowerCase()?.startsWith('e')
                                                                            ? 'Engagement'
                                                                            : 'Conversion'}{' '}
                                                                        ({showPercentage(item?.completion, 2)}
                                                                        <span className="fs9">%</span>)
                                                                    </small>
                                                                </>
                                                            }
                                                            position="top-end"
                                                            className="gaugechart-pophover"
                                                        >
                                                            <i
                                                                className={`${circle_info_medium} icon-md color-primary-blue cursor-pointer`}
                                                                id="rs_data_circle_info"
                                                            ></i>
                                                        </RSPPophover>
                                                    </div>{' '}
                                                </>
                                            ) : (
                                                <DashboardSkeletonScope className="db-sk-gauge-inline" injectCriticalCss>
                                                    <RecentGaugeCardSkeleton isError />
                                                </DashboardSkeletonScope>
                                            )}
                                        </Col>
                                    ))}
                                </Row>
                            </Carousel.Item>
                        );
                    })}
                </Carousel>
            )}
        </div>
    );
};

export default RecentCommunication;
