import { chartSizing } from 'Constants/Charts/commonFunction';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { getUserDetails } from 'Utils/modules/crypto';
import { formatName, formatPercentageDisplay } from 'Utils/modules/formatters';
import { advocates, dd_advocates, dd_audience_behaviour, dd_channelPerformance, dd_segments, dd_top_earning_communication, dd_top_performing_communication, lastWeek } from './constants';
import { HorizontalSkeleton, PieChartSkeleton } from 'Components/Skeleton/Skeleton';
import { areasplineChartOptions, avgConversionTimeOptions, bubbleChartOptions, columnChartOptions, pieChartOptions, variablePieChartOptions } from 'Constants/Charts';
import { ch_color5, ch_color6, ch_color7, ch_color8, ch_color9, ch_direct_mail, ch_email, ch_facebook, ch_facebook_ads, ch_google_ads, ch_insta, ch_linkedIn, ch_mobile_push, ch_pinterest, ch_qR_code, ch_sms, ch_twitter, ch_web_push, ch_whatsapp, ch_x_ads, ch_youtube } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { ADVOCATES, AUDIENCE_BEHAVIOR, AVERAGE_CONVERSION_TIME, CHANNEL_PERFORMANCE, LEADS_GENERATED, ROI_TREND, SEGMENTS, TOP_EARNING_COMMUNICATIONS, TOP_PERFORMING_COMMUNICATIONS } from 'Constants/GlobalConstant/Placeholders';
import { email_direct_mini, email_medium, email_mini, menu_dot_medium, mobile_notification_mini, mobile_sms_mini, notification_medium, qrcode_medium, qrcode_mini, social_facebook_medium, social_facebook_mini, social_google_ad_mini, social_instagram_mini, social_linkedin_mini, social_pinterest_medium, social_pinterest_mini, social_twitter_medium, social_twitter_mini, social_whatsapp_mini, social_youtube_mini, web_notification_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { CommunicationTabSkeleton } from 'Components/Skeleton/pages/dashboard/comm';
import { DbSkColumnChartSkeleton, DbSkLineChartSkeleton, DbSkBubbleChartSkeleton } from 'Components/Skeleton/pages/dashboard';
import useDashboardCommunicationLoading from 'Components/Skeleton/hooks/useDashboardCommunicationLoading';
import RSHighchartsContainer from 'Components/Highcharts';
import RecentCommunication from '../../Component/RecentCommunication';
import DashBoardCard from '../../Component/DashboardCard';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';



import { DashboardContext } from '../../Dashboard';
import { useDispatch, useSelector } from 'react-redux';

import { getSessionId } from 'Reducers/globalState/selector';
import { globalStateSelector } from 'Utils/Selectors/app';
//require('highcharts/highcharts-more.js')(Highcharts);

const getLeadSourceValue = (item) =>
    Number(item?.value ?? item?.PercentageScore ?? item?.percentageScore ?? item?.y) || 0;

const normalizeLeadSourceItems = (data) => {
    if (!data) return [];

    if (!Array.isArray(data) && Array.isArray(data?.series)) {
        return data.series;
    }

    if (!Array.isArray(data) || data.length === 0) return [];

    const firstItem = data[0];
    const channelArray = firstItem?.ChanelImage ?? firstItem?.chanelImage;
    const scoreArray = firstItem?.PercentageScore ?? firstItem?.percentageScore;

    if (Array.isArray(channelArray) && Array.isArray(scoreArray)) {
        return channelArray.map((channel, index) => ({
            channel,
            chanelImage: channel,
            value: scoreArray[index],
            PercentageScore: scoreArray[index],
            percentageScore: scoreArray[index],
        }));
    }

    return data;
};

const CommunicationDashboard = () => {
    const {
        duration,
        dropData,
        handlePerformanceChange,
        handleAudienceBehaviourChange,
        handleTopPerformancesChange,
        handleTopEarningChange,
        handlesegmentschange,
        currentRenderDashBoardTitle,
        getall,
        communicationChartsRemountSeq,
    } = useContext(DashboardContext);
    const {
        roiData,
        channelPerformance,
        audienceBehaviour,
        topPerformances,
        topEarnings,
        leadsData,
        avgTimeData,
        segmentindustry,
    } = useSelector(({ dashboardTwinsReducer }) => dashboardTwinsReducer);
    const { clientId, userId, departmentId, departmentName } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const { licenseTypeId, businessTypeId, isAgency } = getUserDetails();
    const { showSessionModal } = useSelector((state) => globalStateSelector(state));
    const { accountAdmin, company_clientId } = useSelector(({ globalstate }) => globalstate);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const [state, setState] = useState({
        behaviourType: 'By week',
        selectedlastWeek: lastWeek[0],
    });
    const [segmentTitle, setSegmentTitle] = useState(
        businessTypeId === 2 ? ADVOCATES : SEGMENTS,
    );
    const country = 'India';
    const segmentIndustrySeries = segmentindustry?.data?.series;
    const hasSegmentIndustryData = Array.isArray(segmentIndustrySeries) && segmentIndustrySeries.length > 0;
    const shouldShowSegmentSkeleton =
        segmentindustry?.isLoading || !hasSegmentIndustryData || segmentindustry?.isFailure;
    const showSegmentNoData = !segmentindustry?.isLoading && !hasSegmentIndustryData;
    const normalizeChannelName = (name) =>
        String(name ?? '')
            .toLowerCase()
            .replace(/\s+/g, '');
    const unsupportedChannelPerformanceNames = new Set(['paidmedia', 'socialmedia']);
    const channelPerformanceSeries = Array.isArray(channelPerformance?.data?.series)
        ? channelPerformance?.data?.series
        : [];
    const hasOnlyUnsupportedChannels =
        channelPerformanceSeries.length > 0 &&
        channelPerformanceSeries.every((seriesItem) =>
            unsupportedChannelPerformanceNames.has(normalizeChannelName(seriesItem?.name)),
        );
    const hasChannelPerformanceData =
        (channelPerformance?.data?.series?.length ?? 0) > 0 && (channelPerformance?.data?.categories?.length ?? 0) > 0;
    const hasAudienceBehaviourData = (audienceBehaviour?.data?.series?.length ?? 0) > 0;
    const hasRoiData = (roiData?.data?.series?.length ?? 0) > 0;
    const leadSourceItems = useMemo(
        () => normalizeLeadSourceItems(leadsData?.data).filter((item) => getLeadSourceValue(item) > 0),
        [leadsData?.data],
    );
    const avgTimeItems = Array.isArray(avgTimeData?.data) ? avgTimeData.data : [];
    const hasAvgTimeData = avgTimeItems.length > 0;

    const { isDashboardPageLoading, beginDashboardLoad, skipDashboardLoad } =
        useDashboardCommunicationLoading('dashboardTwinsReducer');

    const resolveAvgConversionChannelMeta = (item) => {
        const cid = item?.channelId;
        const hasChannelId = cid != null && cid !== '' && Number(cid) !== 0;
        if (hasChannelId) {
            const byId = getChannelId(Number(cid));
            if (byId?.label) return byId;
        }
        const raw = String(item?.name ?? '')
            .toLowerCase()
            .trim();
        if (raw === 'qr') {
            const qr = getChannelId(3) || getChannelId('qrcode');
            if (qr?.label) return qr;
        }
        const byName = getChannelId(raw);
        if (byName?.label) return byName;
        return {
            label: item?.name ? formatName(item?.name) : 'Unknown',
            icon_xs: email_mini,
            color: undefined,
        };
    };

    const avgConversionTimeChartData = useMemo(() => {
        if (!avgTimeItems.length) return [];
        return avgTimeItems.map((item) => {
            const meta = resolveAvgConversionChannelMeta(item);
            const minutes = Number(item?.dataValue);
            const yMs = Number.isFinite(minutes) ? minutes * 60 * 1000 : 0;
            return {
                name: meta.label,
                y: yMs,
                color: meta.color,
                icon: meta.icon_xs ?? meta.icon,
            };
        });
    }, [avgTimeItems]);
    const chartData = {
        channelPerformanceLoading:
            channelPerformance?.isLoading ||
            channelPerformance?.isFailure ||
            channelPerformance?.data?.categories?.length == 0 ||
            channelPerformance?.data?.series?.length == 0,
        audienceBehaviourLoading:
            audienceBehaviour?.isLoading ||
            audienceBehaviour?.isFailure ||
            JSON.stringify(audienceBehaviour?.data) == {},
        topPerformancesLoading:
            topPerformances?.isLoading || topPerformances?.isFailure || JSON.stringify(topPerformances?.data) == {},
        topEarningsLoading: topEarnings?.isLoading || topEarnings?.isFailure || JSON.stringify(topEarnings?.data) == {},
        avgTimeLoading: avgTimeData?.isLoading || avgTimeData?.isFailure || avgTimeData?.data?.length == 0,
        leadsLoading: leadsData?.isLoading || leadsData?.isFailure || JSON.stringify(leadsData?.data) == {},
        roiLoading: roiData?.isLoading || roiData?.isFailure || JSON.stringify(roiData?.data) == {},
    };
 
    useLayoutEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            skipDashboardLoad();
        } else {
            beginDashboardLoad();
            if (!isAgencyAccountAdmin) getall(duration);
        }
    }, [clientId, departmentId, showSessionModal]);

    const prevChartsRemountSeqRef = useRef(null);
    useEffect(() => {
        if (prevChartsRemountSeqRef.current === null) {
            prevChartsRemountSeqRef.current = communicationChartsRemountSeq;
            return;
        }
        if (prevChartsRemountSeqRef.current === communicationChartsRemountSeq) return;
        prevChartsRemountSeqRef.current = communicationChartsRemountSeq;
        setState((prev) => ({
            ...prev,
            behaviourType: dd_audience_behaviour[0],
        }));
        setSegmentTitle(businessTypeId === 2 ? ADVOCATES : SEGMENTS);
    }, [communicationChartsRemountSeq, businessTypeId]);
    // console.log('Cpasasdasd::: ', avgTimeData, avgData);
    // const avgValue = useMemo(() => avgTimeData?.data, [avgTimeData?.data]);

    let channelPerform =
        Array.isArray(channelPerformance?.data?.series) && channelPerformance?.data?.series?.length ? false : true;

    const lead_generated_chartData = {
        name: 'Leads generated',
        // height: chartSizing['varPie'] ,
        dataLabels: {
            enabled: true,
            useHTML: true,
            connectorWidth: 1,
        },
        series: [
            { name: 'Notifications', y: 6, z: 6, icon: notification_medium },
            { name: 'Email', y: 7, z: 7, icon: email_medium },
            { name: 'QR code', y: 12, z: 12, icon: qrcode_medium },
            // { name: 'Pinterest', y: 15, z: 15, icon: social_pinterest_medium },
            { name: 'Facebook', y: 20, z: 20, icon: social_facebook_medium },
            { name: 'X', y: 40, z: 40, icon: social_twitter_medium },
        ],
    };

    const leadsSourceChartData = useMemo(() => {
        if (!leadSourceItems.length) return null;

        const CHANNEL_CODE_META = {
            DIR: { name: 'Direct', color: ch_direct_mail },
            E: { name: 'Email', icon: email_mini, color: ch_email },
            M: { name: 'SMS', icon: mobile_sms_mini, color: ch_sms },
            Q: { name: 'QR', icon: qrcode_mini, color: ch_qR_code },
            WP: { name: 'Web notification', icon: web_notification_mini, color: ch_web_push },
            MP: { name: 'Mobile notification', icon: mobile_notification_mini, color: ch_mobile_push },
            WA: { name: 'Whatsapp', icon: social_whatsapp_mini, color: ch_whatsapp },
            'PAID MEDIA X': {
                name: 'Paid media x',
                icon: social_twitter_mini,
                color: ch_twitter,
            },
            'PAID MEDIA FACEBOOK': {
                name: 'Paid media facebook',
                icon: social_facebook_mini,
                color: ch_facebook,
            },
            'PAID MEDIA INSTAGRAM': {
                name: 'Paid media instagram',
                icon: social_instagram_mini,
                color: ch_insta,
            },
            'PAID MEDIA PINTEREST': {
                name: 'Paid media pinterest',
                icon: social_pinterest_mini,
                color: ch_pinterest,
            },
            'PAID MEDIA LINKEDIN': {
                name: 'Paid media linkedIn',
                icon: social_linkedin_mini,
                color: ch_linkedIn,
            },
            'PAID MEDIA YOUTUBE': {
                name: 'Paid media youtube',
                icon: social_youtube_mini,
                color: ch_youtube,
            },
            DIRECT: { name: 'Direct', icon: email_direct_mini, color: ch_direct_mail },
            'DIRECT MAIL': { name: 'Direct mail', icon: email_direct_mini, color: ch_direct_mail },
            'SOCIAL POST FACEBOOK': {
                name: 'Social post facebook',
                icon: social_facebook_mini,
                color: ch_facebook_ads,
            },
            'SOCIAL POST INSTAGRAM': {
                name: 'Social post instagram',
                icon: social_instagram_mini,
                color: ch_facebook_ads,
            },
            'SOCIAL POST LINKEDIN': {
                name: 'Social post linkedIn',
                icon: social_linkedin_mini,
                color: ch_linkedIn,
            },
            'SOCIAL POST PINTEREST': {
                name: 'Social post pinterest',
                icon: social_pinterest_mini,
                color: ch_pinterest,
            },
            'SOCIAL POST TWITTER': {
                name: 'Social post twitter',
                icon: social_twitter_mini,
                color: ch_x_ads,
            },
            'SOCIAL POST YOUTUBE': {
                name: 'Social post youtube',
                icon: social_youtube_mini,
                color: ch_google_ads,
            },
            'SOCIAL POST FACEBOOK ADS': {
                name: 'Social post facebook ads',
                icon: social_facebook_mini,
                color: ch_facebook_ads,
            },
            'SOCIAL POST GOOGLE ADS': {
                name: 'Social post google ads',
                icon: social_google_ad_mini,
                color: ch_google_ads,
            },
            'SOCIAL POST X': {
                name: 'Social post x',
                icon: social_twitter_mini,
                color: ch_twitter,
            },
        };

        const fallbackColors = [
            ch_color5,
            ch_color6,
            ch_color7,
            ch_color8,
            ch_color9,
            ch_facebook_ads,
            ch_google_ads,
            ch_twitter,
            ch_facebook,
            ch_insta,
            ch_pinterest,
            ch_linkedIn,
            ch_youtube,
            ch_whatsapp,
        ];

        const usedColors = new Set();
        let fallbackIndex = 0;
        const getUniqueFallbackColor = () => {
            while (fallbackIndex < fallbackColors.length) {
                const nextColor = fallbackColors[fallbackIndex++];
                if (!usedColors.has(nextColor?.toLowerCase())) {
                    return nextColor;
                }
            }
            return fallbackColors[(fallbackIndex++ - 1) % fallbackColors.length];
        };

        const series = leadSourceItems
            .map((item) => {
                const rawChannel = item?.channel ?? item?.ChanelImage ?? item?.chanelImage ?? item?.name ?? '';
                const code = rawChannel.toString().toUpperCase();
                const meta = CHANNEL_CODE_META[code] ?? { name: rawChannel ? formatName(rawChannel) : 'Unknown' };
                const value = getLeadSourceValue(item);
                const color = meta.color ?? getUniqueFallbackColor();
                if (color) {
                    usedColors.add(color.toLowerCase());
                }
                return {
                    name: meta.name,
                    y: value,
                    z: value,
                    icon: meta.icon,
                    color,
                };
            })
            .filter((item) => item.y > 0);

        if (!series.length) return null;

        return {
            seriesName: '',
            dataLabels: { enabled: true, useHTML: true, connectorWidth: 1 },
            series,
            tooltip: {
                formatter: function () {
                    return `<span class="font-xs">${this.point.name
                        }</span><br/><hr /><span class="font-monospace" style="color:${this.point.color
                        }">\u25CF</span>&nbsp;<span class="font-xs" style="text-align: right;">${formatPercentageDisplay(
                            this.percentage,
                        )}%</span>`;
                },
            },
        };
    }, [leadSourceItems]);
    return (
        <>
            {isDashboardPageLoading ? (
                <CommunicationTabSkeleton injectCriticalCss includeGauges />
            ) : (
            <Row>
                {/* Recent campaigns */}
                <Col md={12}>
                    <RecentCommunication />
                </Col>

                {/* Channel performance */}
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{CHANNEL_PERFORMANCE}</h4>
                            <div className="float-end portlet-dropdown">
                                <BootstrapDropdown
                                    key={`dd-channel-performance-${communicationChartsRemountSeq}`}
                                    data={dd_channelPerformance}
                                    flatIcon
                                    defaultItem={
                                        <i
                                            className={`${menu_dot_medium} icon-md`}
                                            id="rs_CommunicationDashboard_dot_channelperformance"
                                        />
                                    }
                                    showUpdate={true}
                                    className="no_caret"
                                    alignRight
                                    onSelect={(e) => handlePerformanceChange(duration, e)}
                                    isCustomDefaultIcon
                                />
                            </div>
                        </div>
                        <div className="portlet-body">
                            {hasOnlyUnsupportedChannels ? (
                                <DbSkColumnChartSkeleton isError message="Not applicable" />
                            ) : channelPerformance?.isLoading ? (
                                <DbSkColumnChartSkeleton />
                            ) : channelPerformance?.isFailure ? (
                                <DbSkColumnChartSkeleton isError />
                            ) : !hasChannelPerformanceData ? (
                                <DbSkColumnChartSkeleton isError />
                            ) : (
                                <RSHighchartsContainer
                                    type="columnChart"
                                    options={columnChartOptions(channelPerformance?.data)}
                                    smallText={`Last 28 days`}
                                />
                            )}
                        </div>
                    </div>
                </Col>

                {/* Top performing communications */}
                <Col md={6}>
                    <DashBoardCard
                        name={TOP_PERFORMING_COMMUNICATIONS}
                        details={topPerformances?.data}
                        loading={topPerformances?.isLoading}
                        isError={topPerformances?.isFailure}
                        dropdownData={dd_top_performing_communication}
                        handleChange={handleTopPerformancesChange}
                        communicationChartsRemountSeq={communicationChartsRemountSeq}
                    />
                </Col>

                {/* Audience behavior */}
                <Col md={6}>
                    <div className={`portlet-container portlet-md`}>
                        <div className="portlet-header position-relative">
                            <h4>{AUDIENCE_BEHAVIOR}</h4>
                            <div className="float-end portlet-dropdown">
                                <BootstrapDropdown
                                    key={`dd-audience-behaviour-${communicationChartsRemountSeq}`}
                                    data={dd_audience_behaviour}
                                    flatIcon
                                    defaultItem={
                                        <i
                                            className={`${menu_dot_medium} icon-md`}
                                            id="rs_CommunicationDashboard_dot_audiencebehaviour"
                                        />
                                    }
                                    showUpdate={true}
                                    alignRight
                                    className="no_caret"
                                    onSelect={(e) => {
                                        setState((prev) => {
                                            return {
                                                ...prev,
                                                behaviourType: e,
                                            };
                                        });
                                        handleAudienceBehaviourChange(duration, e);
                                    }}
                                    isCustomDefaultIcon
                                />
                            </div>
                        </div>

                        {state.behaviourType === 'By day' ? (
                            <div className="portlet-body">
                                {audienceBehaviour?.isLoading ? (
                                    <DbSkBubbleChartSkeleton />
                                ) : audienceBehaviour?.isFailure ? (
                                    <DbSkBubbleChartSkeleton isError />
                                ) : !hasAudienceBehaviourData ? (
                                    <DbSkBubbleChartSkeleton isError />
                                ) : (
                                    <>
                                        <RSHighchartsContainer
                                            type="bubble"
                                            options={bubbleChartOptions(audienceBehaviour?.data)}
                                            smallText={'Last 28 days'}
                                        />
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="portlet-body mt-20">
                                    {audienceBehaviour?.isLoading ? (
                                        <DbSkBubbleChartSkeleton />
                                    ) : audienceBehaviour?.isFailure ? (
                                        <DbSkBubbleChartSkeleton isError />
                                    ) : !hasAudienceBehaviourData ? (
                                        <DbSkBubbleChartSkeleton isError />
                                    ) : (
                                        <>
                                            <RSHighchartsContainer
                                                type="bubble"
                                                options={bubbleChartOptions({
                                                    ...audienceBehaviour?.data,
                                                    height: 380,
                                                })}
                                                smallText={'Last 28 days'}
                                            />
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </Col>

                {/* Top earning communications */}
                <Col md={6}>
                    <DashBoardCard
                        name={TOP_EARNING_COMMUNICATIONS}
                        details={topEarnings?.data}
                        loading={topEarnings?.isLoading}
                        isError={topEarnings?.isFailure}
                        dropdownData={dd_top_earning_communication}
                        handleChange={handleTopEarningChange}
                        isTopEarning={true}
                        communicationChartsRemountSeq={communicationChartsRemountSeq}
                    />
                </Col>
                {/* <Col md={6}>
                    <DashBoardCard
                        name="Top earning communications"
                        isImage
                        details={advocates}
                        dropdownData={dd_advocates}
                    />
                </Col> */}

                {/* Segments */}
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header portlet-dropdown">
                            <h4>{segmentTitle}</h4>
                            <div className="float-end">
                                <BootstrapDropdown
                                    key={`dd-segments-${communicationChartsRemountSeq}`}
                                    data={businessTypeId === 2 ? dd_advocates : dd_segments}
                                    flatIcon
                                    defaultItem={
                                        <i
                                            className={`${menu_dot_medium} icon-md`}
                                            id="rs_CommunicationDashboard_dot_segments"
                                        />
                                    }
                                    showUpdate={true}
                                    className="no_caret"
                                    alignRight
                                    isCustomDefaultIcon
                                    onSelect={(e) => {
                                        handlesegmentschange(duration, e);
                                        setSegmentTitle(e);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="portlet-body">
                            {segmentindustry?.isLoading ? (
                                <PieChartSkeleton />
                            ) : segmentindustry?.isFailure ? (
                                <PieChartSkeleton isError />
                            ) : !hasSegmentIndustryData ? (
                                <PieChartSkeleton isError nodata={showSegmentNoData} />
                            ) : (
                                <RSHighchartsContainer
                                    type="pie"
                                    options={variablePieChartOptions({
                                        ...segmentindustry?.data,
                                        name: segmentTitle,
                                    })}
                                    className="mt-20"
                                />
                            )}
                        </div>
                    </div>
                </Col>

                {/* ROI trend */}
                <Col md={6}>
                    <div className="portlet-container portlet-md areaspline-x-axis-labels">
                        <div className="portlet-header">
                            <h4>{ROI_TREND}</h4>
                        </div>
                        <div className="portlet-body">
                            {roiData?.isLoading ? (
                                <DbSkLineChartSkeleton />
                            ) : roiData?.isFailure ? (
                                <DbSkLineChartSkeleton isError />
                            ) : !hasRoiData ? (
                                <DbSkLineChartSkeleton isError />
                            ) : (
                                <RSHighchartsContainer
                                    type="area"
                                    options={areasplineChartOptions(
                                        roiData?.data,
                                        'Incremental conversion',
                                    )}
                                />
                            )}
                        </div>
                    </div>
                </Col>

                {/* Leads generated */}
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{LEADS_GENERATED}</h4>
                            <div className="float-end">{/* <BootstrapDropdown ... /> */}</div>
                        </div>
                        <div className="portlet-body">
                            {leadsData?.isLoading ? (
                                <PieChartSkeleton />
                            ) : leadsData?.isFailure ? (
                                <PieChartSkeleton isError />
                            ) : !leadsSourceChartData ? (
                                <PieChartSkeleton isError />
                            ) : (
                                <div className="portlet-chart mt-15 1">
                                    <RSHighchartsContainer
                                        type="pie"
                                        options={pieChartOptions(leadsSourceChartData)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Col>

                {/* Average conversion time */}
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{AVERAGE_CONVERSION_TIME}</h4>
                        </div>
                        <div className="portlet-body">
                            {avgTimeData?.isLoading ? (
                                <PieChartSkeleton />
                            ) : avgTimeData?.isFailure ? (
                                <PieChartSkeleton isError />
                            ) : !hasAvgTimeData ? (
                                <PieChartSkeleton isError />
                            ) : (
                                <div className="mt-10">
                                    <RSHighchartsContainer
                                        type="pie"
                                        options={avgConversionTimeOptions(
                                            JSON.parse(JSON.stringify(avgConversionTimeChartData)),
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Col>

                {/* <Row>
                    <Col md={12}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h4>Communications performance</h4>
                                <div className="float-end d-flex">
                                    <BootstrapDropdown
                                        data={socialMarketing}
                                        alignRight
                                        defaultItem={state.selectedsocialMarketing}
                                        customAlignRight={true}
                                        className=""
                                        onSelect={(item, index) => {
                                            UpdateState(setState, 'selectedsocialMarketing', item);
                                        }}
                                    />
                                    <BootstrapDropdown
                                        data={lastWeek}
                                        alignRight
                                        defaultItem={state.selectedlastWeek}
                                        customAlignRight={true}
                                        className="ml15"
                                        onSelect={(item, index) => {
                                            UpdateState(setState, 'selectedlastWeek', item);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="portlet-body x-axis-labels-performance">
                                {!!communcationChartData?.series && communcationChartData?.series?.length ? (
                                    <RSHighchartsContainer
                                        type="area"
                                        options={areasplineChartOptions(communcationChartData)}
                                    />
                                ) : (
                                    <HorizontalSkeleton />
                                )}
                            </div>
                        </div>
                    </Col>
                </Row> */}
            </Row>
            )}
        </>
    );
};

export default CommunicationDashboard;

const ChartComponent = ({
    chartData,
    title,
    percentage,
    description,
    smallText,
    dropDown,
    areaspline,
    dropDownOnSelect,
}) => {
    return (
        <div
            className={`portlet-container portlet-md ${percentage ? 'pfooter' : ''}  ${areaspline ? 'areaspline-x-axis-labels' : ''
                }`}
        >
            <div className="portlet-header">
                <h4>{title}</h4>
                {dropDown && (
                    <div className="float-end portlet-dropdown">
                        <BootstrapDropdown
                            data={dropDown}
                            flatIcon
                            defaultItem={<i className={`${menu_dot_medium} icon-md`} />}
                            showUpdate={false}
                            className="no_caret"
                            alignRight
                            onSelect={() => {
                                dropDownOnSelect();
                            }}
                        />
                    </div>
                )}
            </div>
            <div className="portlet-body">
                <div className="portlet-chart">{/* <NewCharts options={chartData} /> */}</div>
                {smallText && <span className="portlet-info-text">{smallText}</span>}
            </div>
            {percentage && (
                <div className="portlet-footer portlet-two-label">
                    <ul>
                        <li>
                            <span>{percentage}</span>
                            <small>%</small>
                        </li>
                        <li>{description}</li>
                    </ul>
                </div>
            )}
        </div>
    );
};
