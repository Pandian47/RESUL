import { formatNumber } from 'Utils/modules/campaignUtils';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas, formatPercentageDisplay } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { areasplineChartOptions, barChartOptions, columnChartOptions, gaugeChartOptions, pieChartOptions, pyramidChartOptions } from 'Constants/Charts';
import { ch_clockchart1, ch_clockchart2, ch_primary_green, ch_secondary_blue, ch_secondary_green } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { DOWNLOAD_CSV, LAST_24_HOURS } from 'Constants/GlobalConstant/Placeholders';
import { csv_download_large, star_fill_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useMemo, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import _map from 'lodash/map';
import useQueryParams from 'Hooks/useQueryParams';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getOfferAnalytics } from 'Reducers/preferences/OfferManagements/request';
import RSTooltip from 'Components/RSTooltip';
import RSChartTabbar from 'Components/RSChartTabber';

import RSHighchartsContainer from 'Components/Highcharts';
import KendoGrid from 'Components/RSKendoGrid';
import RSPageHeader from 'Components/RSPageHeader';

import { PieChartSkeleton, HorizontalSkeleton, ColumnChartSkeleton } from 'Components/Skeleton/Skeleton';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell'; 

const OfferAnalytics = () => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const queryState = useQueryParams('/preferences/offer-analytics');
    const offerId = queryState?.offerId;

    const [isLoading, setIsLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);

    const currency = useMemo(() => {
        const { currencyMasterList } = getmasterData();
        const currencyId = analyticsData?.currency ? Number(analyticsData.currency) : null;
        let currsymbol = '$';
        if (currencyId && currencyMasterList) {
            const matchingCurrency = currencyMasterList?.find((curr) => curr.currencyID === currencyId);
            currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;
        }
        return currsymbol;
    }, [analyticsData?.currency]);

    const buildDateRangeLabel = () =>
        queryState?.offerStartDate && queryState?.offerEndDate
            ? `${getUserCurrentFormat(queryState?.offerStartDate)?.dateFormat || queryState?.offerStartDate} - ${
                  getUserCurrentFormat(queryState?.offerEndDate)?.dateFormat || queryState?.offerEndDate
              }`
            : queryState?.offerStartDate
              ? `${getUserCurrentFormat(queryState?.offerStartDate)?.dateFormat || queryState?.offerStartDate} - N/A`
              : queryState?.offerEndDate
                ? `N/A - ${getUserCurrentFormat(queryState?.offerEndDate)?.dateFormat || queryState?.offerEndDate}`
                : 'N/A - N/A';

    const [selectedOffer, setSelectedOffer] = useState({
        id: queryState?.offerId || 0,
        name: queryState?.offerName || '',
        code: '',
        status: queryState?.offerStatus,
        dateRange: buildDateRangeLabel(),
        discount: '',
    });

    useEffect(() => {
        setSelectedOffer((prev) => ({
            ...prev,
            id: queryState?.offerId || 0,
            name: queryState?.offerName || '',
            status: queryState?.offerStatus,
            dateRange: buildDateRangeLabel(),
        }));
    }, [
        queryState?.offerId,
        queryState?.offerName,
        queryState?.offerStatus,
        queryState?.offerStartDate,
        queryState?.offerEndDate,
    ]);

    useEffect(() => {
        if (offerId) {
            fetchOfferAnalytics();
        }
    }, [offerId]);

    const fetchOfferAnalytics = async () => {
        setIsLoading(true);
        try {
            const payload = {
                departmentId,
                clientId,
                userId,
                offerId: Number(offerId),
            };
            const { data, status } = await dispatch(getOfferAnalytics(payload));
            if (status && data) {
                setAnalyticsData(data);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    // Map API data to component data (matches GET_OFFER_ANALYTICS payload)
    const kpiData = useMemo(() => {
        if (!analyticsData?.kpis) return [];
        const kpis = analyticsData.kpis;
        return [
              {
                title: 'Active claims',
                display: `${numberWithCommas(Number(kpis.active_claims) || 0)}`,
            },
             {
                title: 'Redemptions',
                display: `${numberWithCommas(Number(kpis.redemptions) || 0)}`,
            },
               {
                title: 'Conversion rate',
                display: `${formatNumber(Number(kpis.conversion_rate) || 0)}%`,
            },
            {
                title: 'Total discount',
                display: `${currency}${numberWithCommas(Number(kpis.total_discount) || 0)}`,
            },
            {
                title: 'Total revenue',
                display: `${currency}${numberWithCommas(Number(kpis.total_revenue) || 0)}`,
            },
         
        ];
    }, [analyticsData, currency]);

    const campaignLeaderboardData = useMemo(() => {
        if (!analyticsData?.leaderboard) return [];
        return analyticsData.leaderboard.map((item, index) => ({
            rank: index + 1,
            campaignName: item.CampaignID != null ? String(item.CampaignID) : `—`,
            redemptions: item.redemptions ?? 0,
            revenue: item.revenue ?? 0,
        }));
    }, [analyticsData]);

    const channelBreakdownData = useMemo(() => {
        if (!analyticsData?.channels) return { series: [] };
        return {
            height: 320,
            legend: { enabled: true },
            series: analyticsData.channels.map((ch) => ({
                name: ch.channel || 'Unknown',
                y: Math.max(0, Number(ch.count) || 0),
            })),
        };
    }, [analyticsData]);

    const conversionPyramidData = useMemo(() => {
        if (!analyticsData?.funnel) return null;
        const f = analyticsData.funnel;
        const impressions = Number(f.impressions) || 0;
        const claims = Number(f.claims) || 0;
        const redeemed = Number(f.redeemed) || 0;
        if (!impressions && !claims && !redeemed) return null;
        return {
            height: 395,
            reversed: true,
            series: [
                { name: 'Impressions', y: impressions },
                { name: 'Claims', y: claims },
                { name: 'Redeemed', y: redeemed },
            ],
        };
    }, [analyticsData]);

    const performanceAnalysisData = useMemo(() => {
        if (!analyticsData?.trend?.length) return { categories: [], series: [] };
        const trend = [...analyticsData.trend].sort((a, b) => new Date(a.date) - new Date(b.date));
        const categories = trend.map((t) => getUserCurrentFormat(t.date)?.dateFormat || t.date || '');
        return {
            height: 320,
            categories,
            series: [
                {
                    name: 'Revenue',
                    data: trend.map((t) => Number(t.revenue) || 0),
                    color: ch_secondary_blue,
                },
                {
                    name: 'Redemptions',
                    data: trend.map((t) => Number(t.redemptions) || 0),
                    color: ch_secondary_green,
                },
            ],
        };
    }, [analyticsData]);

    const offerStatusData = useMemo(() => {
        if (!analyticsData?.offer_status) return [];
        return analyticsData.offer_status.map((item, index) => {
            const contact = item.EmailID || item.MobileNo || '—';
            const timeFormatted = item.Time
                ? getUserCurrentFormat(item.Time, { noConversion: true })?.dateTimeFormat || item.Time
                : '—';
            return {
                id: index + 1,
                contact,
                channel: item.Channel || '—',
                purchaseValue: item.PurchaseValue ?? 0,
                finalPrice: item.FinalPrice ?? 0,
                time: timeFormatted,
            };
        });
    }, [analyticsData]);

    const usageBehaviour7Days = useMemo(() => {
        if (!analyticsData?.day_usage?.length) return { categories: [], series: [] };
        return {
            height: 320,
            categories: analyticsData.day_usage.map((d) => (d.day ? String(d.day).slice(0, 3) : '')),
            series: [{ name: 'Redemptions', data: analyticsData.day_usage.map((d) => Number(d.count) || 0) }],
        };
    }, [analyticsData]);

    const usageBehaviour24Hours = useMemo(() => {
        if (!analyticsData?.hour_usage?.length) return null;

        const normalizedData = analyticsData.hour_usage
            .map((item) => ({
                hour: Number(item?.hour),
                count: Number(item?.count) || 0,
            }))
            .filter((item) => item.hour >= 0 && item.hour < 24);

        if (!normalizedData.length) return null;

        const totalCount = normalizedData.reduce((acc, item) => acc + item.count, 0);
        const maxCount = Math.max(...normalizedData.map((item) => item.count));
        const maxHourData = normalizedData.find((item) => item.count === maxCount);
        const maxHour = maxHourData?.hour ?? 0;
        const nextHour = (maxHour + 1) % 24;
        const maxHourPercentage = totalCount > 0 ? formatPercentageDisplay((maxCount / totalCount) * 100) : '0';

        const sortedCounts = [...new Set(normalizedData.map((item) => item.count))].sort((a, b) => b - a);
        const rankColors = [
            ch_primary_green,
            ch_secondary_green,
            ch_clockchart1,
            ch_clockchart2,
            '#e8e8ea',
        ];

        const series = [
            {
                from: 0,
                to: 24,
                color: '#e8e8ea',
                outerRadius: '105%',
                thickness: '5%',
            },
            ...normalizedData.map((item) => {
                const rank = sortedCounts.indexOf(item.count);
                const color = rank < rankColors.length - 1 ? rankColors[rank] : rankColors[rankColors.length - 1];
                return {
                    from: item.hour,
                    to: item.hour + 1,
                    color,
                    outerRadius: '105%',
                    thickness: '5%',
                };
            }),
        ];

        const convertTo12HourFormat = (hour) => {
            if (hour === 0) return '12 AM';
            if (hour === 12) return '12 PM';
            if (hour < 12) return `${hour} AM`;
            return `${hour - 12} PM`;
        };

        return {
            height: 310,
            series,
            data: [maxHour, maxHour + 1],
            maxHoursPercentage: maxHourPercentage,
            maxHoursTimeRange: `${convertTo12HourFormat(maxHour)} to ${convertTo12HourFormat(nextHour)}`,
        };
    }, [analyticsData]);

    const conversionStagesBar = useMemo(() => {
        if (!analyticsData?.funnel) return { categories: [], series: [] };
        const f = analyticsData.funnel;
        return {
            height: 325,
            categories: ['Impressions', 'Claims', 'Redeemed'],
            series: [
                {
                    name: 'Count',
                    data: [Number(f.impressions) || 0, Number(f.claims) || 0, Number(f.redeemed) || 0],
                },
            ],
        };
    }, [analyticsData]);

    const conversionChannelsBar = useMemo(() => {
        if (!analyticsData?.channels?.length) return { categories: [], series: [] };
        return {
            height: 325,
            categories: analyticsData.channels.map((c) => c.channel || 'Unknown'),
            series: [
                {
                    name: 'Redemptions by channel',
                    data: analyticsData.channels.map((c) => Number(c.count) || 0),
                },
            ],
        };
    }, [analyticsData]);

    const channelBreakdownChartOptions = useMemo(() => {
        return pieChartOptions(channelBreakdownData);
    }, [channelBreakdownData]);

    const usageBehaviour7DaysOptions = useMemo(() => {
        return columnChartOptions({
            ...usageBehaviour7Days,
            xAxis: { title: 'Day' },
            yAxis: { title: 'Count' },
        });
    }, [usageBehaviour7Days]);

    const usageBehaviour24HoursOptions = useMemo(() => {
        if (!usageBehaviour24Hours) return null;
        return gaugeChartOptions(usageBehaviour24Hours);
    }, [usageBehaviour24Hours]);

    const conversionStagesBarOptions = useMemo(() => {
        return barChartOptions({
            height: conversionStagesBar.height,
            xAxis: {
                categories: conversionStagesBar.categories,
                title: { text: '' },
            },
            yAxis: { title: { text: 'Count' } },
            series: conversionStagesBar.series,
        });
    }, [conversionStagesBar]);

    const conversionChannelsBarOptions = useMemo(() => {
        return barChartOptions({
            height: conversionChannelsBar.height,
            xAxis: {
                categories: conversionChannelsBar.categories,
                title: { text: '' },
            },
            yAxis: { title: { text: 'Count' } },
            series: conversionChannelsBar.series,
        });
    }, [conversionChannelsBar]);

    const performanceAnalysisChartOptions = useMemo(() => {
        return areasplineChartOptions({
            ...performanceAnalysisData,
            formatdatelable: true,
        });
    }, [performanceAnalysisData]);

    const conversionPyramidOptions = useMemo(() => {
        if (!conversionPyramidData) return null;
        return pyramidChartOptions({ ...conversionPyramidData, showValueInLabel: true });
    }, [conversionPyramidData]);

    const getRankDisplay = (rank) => {
        if (rank === 1) return { icon: star_fill_mini, color: '#ffd700' };
        if (rank === 2) return { icon: star_fill_mini, color: '#c0c0c0' };
        if (rank === 3) return { icon: star_fill_mini, color: '#cd7f32' };
        return null;
    };

    const leaderboardColumns = [
        {
            field: 'rank',
            title: 'Rank',
            width: 100,
            cell: ({ dataItem }) => {
                const rankMeta = getRankDisplay(dataItem?.rank);
                return (
                    <div className="d-flex align-items-center">
                        {rankMeta ? (
                            <i className={`${rankMeta.icon} icon-sm mr5`} style={{ color: rankMeta.color }} />
                        ) : null}
                        <TruncatedCell value={String(dataItem?.rank ?? '')} />
                    </div>
                );
            },
        },
        {
            field: 'campaignName',
            title: 'Communication name',
            cell: ({ dataItem }) => <TruncatedCell value={dataItem?.campaignName || ''} />,
        },
        {
            field: 'redemptions',
            title: 'Redemptions',
            cell: ({ dataItem }) => (
                <TruncatedCell value={`${numberWithCommas(dataItem?.redemptions ?? 0)}`} alignRight />
            ),
        },
        {
            field: 'revenue',
            title: 'Revenue',
            cell: ({ dataItem }) => (
                <TruncatedCell value={`${currency}${numberWithCommas(dataItem?.revenue)}`} alignRight />
            ),
        },
    ];

    const offerStatusColumns = [
        {
            field: 'contact',
            title: 'Contact',
            cell: ({ dataItem }) => <TruncatedCell value={dataItem?.contact || ''} />,
        },
        {
            field: 'channel',
            title: 'Channel',
            width: 120,
            cell: ({ dataItem }) => <TruncatedCell value={dataItem?.channel || ''} />,
        },
        {
            field: 'purchaseValue',
            title: 'Purchase value',
            cell: ({ dataItem }) => (
                <TruncatedCell value={`${currency}${numberWithCommas(dataItem?.purchaseValue)}`} alignRight />
            ),
        },
        {
            field: 'finalPrice',
            title: 'Final price',
            cell: ({ dataItem }) => (
                <TruncatedCell value={`${currency}${numberWithCommas(dataItem?.finalPrice)}`} alignRight />
            ),
        },
        {
            field: 'time',
            title: 'Time',
            cell: ({ dataItem }) => <TruncatedCell value={ getUserCurrentFormat(dataItem?.time ,{isOffset:true})?.utcformat || ''} />,
        },
    ];

    const handleCSVDownload = () => {
        if (!offerStatusData || offerStatusData.length === 0) {
            return;
        }

        // Create CSV headers
        const headers = ['Contact', 'Channel', 'Purchase value', 'Final price', 'Time'];

        const csvRows = [
            headers.join(','),
            ...offerStatusData.map((item) => {
                return [
                    `"${item.contact || 'N/A'}"`,
                    `"${item.channel || 'N/A'}"`,
                    `"${currency}${numberWithCommas(item.purchaseValue || 0)}"`,
                    `"${currency}${numberWithCommas(item.finalPrice || 0)}"`,
                    `"${item.time || 'N/A'}"`,
                ].join(',');
            }),
        ];

        const csvContent = csvRows.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedOffer.name || 'OfferStatus'}_${new Date()
            .toLocaleTimeString()
            .replace(/:/g, '-')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };
    // const offerStatusColumns = [
    //     { field: 'id', title: 'ID', width: 100, cell: ({ dataItem }) => `#${dataItem?.id}` },
    //     { field: 'user', title: 'USER' },
    //     { field: 'shopLocation', title: 'SHOP LOCATION' },
    //     {
    //         field: 'amount',
    //         title: 'AMOUNT',
    //         cell: ({ dataItem }) => `$${dataItem?.amount.toFixed(2)}`,
    //     },
    //     {
    //         field: 'status',
    //         title: 'STATUS',
    //         cell: ({ dataItem }) => (
    //             <span className={`badge ${dataItem?.status === 'Redeemed' ? 'bg-success' : 'bg-warning'} text-white`}>
    //                 {dataItem?.status}
    //             </span>
    //         ),
    //     },
    //     { field: 'time', title: 'TIME' },
    // ];

    if (false) {
        return (
            <div className="page-content-holder">
                <RSPageHeader
                    title={selectedOffer?.name || ''}
                    isBack
                    backPath="/preferences/offer-management"
                    isHeaderLine
                    rightCommonMenus
                />
                <div className="page-content">
                    <div className="text-center p-5">
                        <p>No data available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content-holder">
                <RSPageHeader
                    title={selectedOffer?.name || ''}
                    isBack
                    backPath="/preferences/offer-management"
                    isHeaderLine
                    rightCommonMenus
                    date={selectedOffer?.dateRange || ''}
                />
                <Container fluid>
                    <div className="page-content">
                        <Container className=' px0'>
                            <div className="d-flex justify-content-between mb10 mt10 clear-both position-relative z-1">
                                <div className="d-flex align-items-center">
                                    <h3 className="pr10 mb-0">{'Overview'}</h3></div></div>
                            {/* Offer Details Section */}
                            {/* <div className="box-design mt20">
                        <Row className="align-items-center">
                            <Col md={8}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center">
                                        <h3 className="mb0 mr20">{selectedOffer.name}</h3>
                                        <span className="badge bg-success text-white">{selectedOffer.status}</span>
                                    </div>
                                    <div className="">
                                        {/* <small className="color-gray mr20">Code: {selectedOffer.code}</small> */}
                            {/* <small className="color-gray mr20">{selectedOffer.dateRange}</small> */}
                            {/* <small className="color-gray">Discount: {selectedOffer.discount}</small> */}
                            {/* </div>
                                </div>
                            </Col>
                        </Row>
                    </div> */}

                            {/* KPI cards (reference layout) */}
                            <Row className="mb30">
                                {isLoading
                                    ? _map(Array.from({ length: 5 }), (_, index) => (
                                          <Col md={12} lg key={`kpi-skel-${index}`}>
                                              <div className="portlet-container mb15">
                                                  <div className="portlet-body">
                                                      <HorizontalSkeleton count={2} height={36} />
                                                  </div>
                                              </div>
                                          </Col>
                                      ))
                                    : _map(kpiData, (kpi, index) => (
                                          <Col md={12} lg key={kpi.title || index}>
                                              <div className="portlet-container mb15">
                                                  <div className="portlet-body">
                                                      <div className="d-flex justify-content-between align-items-start">
                                                          <div>
                                                              <div className="color-primary-black font-semi-bold">
                                                                  {kpi.title}
                                                              </div>
                                                              <div className="d-flex align-items-baseline mt5">
                                                                  <h1 className="font-bold mb0 fs-4">{kpi.display}</h1>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </Col>
                                      ))}
                            </Row>

                            {/* Communication performance dashboard */}
                            <Row>
                                <Col md={12}>
                                    <div className="portlet-container rs-table-with-heading mb30">
                                        <div className="portlet-header flex-row mb0">
                                            <div className="fr d-flex align-items-center">
                                                <h4 className="mb0">Communication performance dashboard</h4>
                                            </div>
                                        </div>
                                        <div className="portlet-body">
                                            {isLoading ? (
                                                <RSSkeletonTable count={6} isCustombox containerClassName="shadow-none" />
                                            ) : (
                                                <KendoGrid
                                                    data={campaignLeaderboardData}
                                                    column={leaderboardColumns}
                                                    pageable={true}
                                                    isScrollTop={false}
                                                    settings={{ total: campaignLeaderboardData?.length }}
                                                    noBoxShadow
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <div className="portlet-container portlet-md">
                                        <div className="portlet-header">
                                            <h4>Channel breakdown</h4>
                                        </div>
                                        <div className="portlet-body d-flex justify-content-center position-relative">
                                            {isLoading ? (
                                                <div className="w-100">
                                                    <ColumnChartSkeleton />
                                                </div>
                                            ) : channelBreakdownData?.series?.length &&
                                              channelBreakdownData.series.some((s) => Number(s.y) > 0) ? (
                                                <RSHighchartsContainer
                                                    options={channelBreakdownChartOptions}
                                                    className="mt-30"
                                                />
                                            ) : (
                                                <PieChartSkeleton nodata />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    {isLoading ? (
                                        <div className="portlet-container portlet-md">
                                            <div className="portlet-header">
                                                <h4>Usage behaviour</h4>
                                            </div>
                                            <div className="portlet-body">
                                                <ColumnChartSkeleton />
                                            </div>
                                        </div>
                                    ) : (
                                        <RSChartTabbar
                                            dynamicTab="mb0 mini"
                                            defaultClass="tabTransparent pt0"
                                            activeClass="active"
                                            chartHeading="Usage behaviour"
                                            containerClass="portlet-container portlet-md pfooter"
                                            tabData={[
                                                {
                                                    id: 'by_days',
                                                    text: 'By days',
                                                    textClass: 'font-sm',
                                                    component: () =>
                                                        usageBehaviour7Days?.categories?.length ? (
                                                            <RSHighchartsContainer
                                                                type="columnChart"
                                                                key="offer-usage-7d"
                                                                options={usageBehaviour7DaysOptions}
                                                            />
                                                        ) : (
                                                            <PieChartSkeleton nodata />
                                                        ),
                                                },
                                                {
                                                    id: 'by_hours',
                                                    text: 'By hours',
                                                    textClass: 'font-sm',
                                                    component: () =>
                                                        usageBehaviour24HoursOptions ? (
                                                            <RSHighchartsContainer
                                                                type="pie"
                                                                key="offer-usage-24h"
                                                                smallText={LAST_24_HOURS}
                                                                options={usageBehaviour24HoursOptions}
                                                                footerPercent={usageBehaviour24Hours?.maxHoursPercentage}
                                                                footerText={
                                                                    <>
                                                                        {'Redemptions engage '}
                                                                        <span className="font-bold">
                                                                            {usageBehaviour24Hours?.maxHoursTimeRange}
                                                                        </span>
                                                                    </>
                                                                }
                                                            />
                                                        ) : (
                                                            <PieChartSkeleton nodata />
                                                        ),
                                                },
                                            ]}
                                            className="rs-tabs row"
                                            componentClassName="mt20"
                                        />
                                    )}
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={6}>
                                    <div className="portlet-container portlet-md position-relative">
                                        <div className="portlet-header">
                                            <h4>Conversion funnel</h4>
                                        </div>
                                        <div className="portlet-body">
                                            {isLoading ? (
                                                <ColumnChartSkeleton />
                                            ) : conversionPyramidOptions ? (
                                                <>
                                                    <RSHighchartsContainer
                                                        type="columnChart"
                                                        options={conversionPyramidOptions}
                                                        className="mt-35"
                                                    />
                                                </>
                                            ) : (
                                                <PieChartSkeleton nodata />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    {isLoading ? (
                                        <div className="portlet-container portlet-md">
                                            <div className="portlet-header">
                                                <h4>Conversion breakdown</h4>
                                            </div>
                                            <div className="portlet-body">
                                                <ColumnChartSkeleton />
                                            </div>
                                        </div>
                                    ) : (
                                        <RSChartTabbar
                                            dynamicTab="mb0 mini"
                                            defaultClass="tabTransparent pt0"
                                            activeClass="active"
                                            chartHeading="Conversion breakdown"
                                            containerClass="portlet-container portlet-md"
                                            tabData={[
                                                {
                                                    id: 'stages',
                                                    text: 'Funnel stages',
                                                    textClass: 'font-sm',
                                                    component: () =>
                                                        conversionStagesBar?.series?.[0]?.data?.some(
                                                            (v) => Number(v) > 0,
                                                        ) ? (
                                                            <RSHighchartsContainer options={conversionStagesBarOptions} />
                                                        ) : (
                                                            <PieChartSkeleton nodata />
                                                        ),
                                                },
                                                {
                                                    id: 'channels',
                                                    text: 'By channel',
                                                    textClass: 'font-sm',
                                                    component: () =>
                                                        conversionChannelsBar?.series?.[0]?.data?.some(
                                                            (v) => Number(v) > 0,
                                                        ) ? (
                                                            <RSHighchartsContainer
                                                                options={conversionChannelsBarOptions}
                                                            />
                                                        ) : (
                                                            <PieChartSkeleton nodata />
                                                        ),
                                                },
                                            ]}
                                            className="rs-tabs row"
                                            componentClassName="mt20"
                                        />
                                    )}
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={12}>
                                    <div className="portlet-container portlet-md areaspline-x-axis-labels mb30">
                                        <div className="portlet-header flex-row mb0">
                                            <div className="fr d-flex align-items-center">
                                                <h4 className="mb0">Performance analytics</h4>
                                            </div>
                                        </div>
                                        <div className="portlet-body">
                                            {isLoading ? (
                                                <ColumnChartSkeleton />
                                            ) : performanceAnalysisData?.categories?.length ? (
                                                <RSHighchartsContainer
                                                    pClassName="x-axis-labels-performance"
                                                    options={performanceAnalysisChartOptions}
                                                    className="mt30"
                                                />
                                            ) : (
                                                <PieChartSkeleton nodata />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={12}>
                                    <div className="portlet-container rs-table-with-heading mb30">
                                        <div className="portlet-header flex-row mb0">
                                            <div className="fr d-flex align-items-center">
                                                <h4 className="mb0">Offer activity</h4>
                                            </div>
                                            <div className="float-end d-flex align-items-center">
                                                <RSTooltip
                                                    text={DOWNLOAD_CSV}
                                                    position="top"
                                                    innerContent={false}
                                                    className={`bottom5 lh0 position-relative ${
                                                        offerStatusData?.length && !isLoading ? '' : 'pe-none click-off '
                                                    }`}
                                                >
                                                    <i
                                                        className={`${csv_download_large} color-primary-blue icon-lg cp`}
                                                        onClick={handleCSVDownload}
                                                    />
                                                </RSTooltip>
                                            </div>
                                        </div>
                                        <div className="portlet-body">
                                            {isLoading ? (
                                                <RSSkeletonTable count={6} isCustombox containerClassName="shadow-none" />
                                            ) : (
                                                <KendoGrid
                                                    data={offerStatusData}
                                                    column={offerStatusColumns}
                                                    pageable={true}
                                                    isScrollTop={false}
                                                    settings={{ total: offerStatusData?.length }}
                                                    noBoxShadow
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Container>
        </div>
    );
};

export default OfferAnalytics;
