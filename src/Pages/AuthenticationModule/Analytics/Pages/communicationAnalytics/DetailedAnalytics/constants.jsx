import { encodeUrl } from 'Utils/modules/crypto';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas, formatPercentageDisplay } from 'Utils/modules/formatters';
import { placeholderImage as GoogleLogo } from 'Assets/Images';

const BingLogo = GoogleLogo;
const YahooLogo = GoogleLogo;
import { mFulltimeSubt_01, mFulltimeSubt_02, mFulltimeSubt_03, mFulltimeSubt_04 } from 'Constants/Utils/dates';
import { chartSizing, seriesNameField } from 'Constants/Charts/commonFunction';
import {
    ch_clockchart1,
    ch_clockchart2,
    ch_primary_green,
    ch_secondary_green,
} from 'Constants/GlobalConstant/Colors/colorsVariable';
import {
    arrow_up_mini,
    channel_action_mini,
    communication_target_mini,
    link_large,
    messaging_mini,
    social_post_large,
    thumbs_up_mini,
} from 'Constants/GlobalConstant/Glyphicons';
// @refresh reset
import { Suspense, lazy } from 'react';
import { getHeatMapContentDetails } from 'Reducers/analytics/details/request';
import { Get_Preview_By_Channel } from 'Reducers/communication/listing/request';

import { parseAnalyticsJson, parseAnalyticsJsonArray } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
import RSTooltip from 'Components/RSTooltip';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import { DetailAnalyticsTabContentLoadingBlock } from 'Components/Skeleton/pages/analytics';

const DetailAnalyticsEmail = lazy(() => import('./Pages/Email/Email'));
const DetailAnalyticsSms = lazy(() => import('./Pages/Sms/Sms'));
const DetailAnalyticsQr = lazy(() => import('./Pages/Qr/Qr'));
const DetailAnalyticsWhatsapp = lazy(() => import('./Pages/Whatsapp/Whatsapp'));
const DetailAnalyticsVMS = lazy(() => import('./Pages/Vms/Vms'));
const DetailAnalyticsSocialMedia = lazy(() => import('./Pages/SocialMedia/SocialMedia'));
const DetailAnalyticsWebAppAnalytics = lazy(() => import('./Pages/WebAppAnalytics/WebAppAnalytics'));
const DetailAnalyticsPaidMedia = lazy(() => import('./Pages/Paid-media/PaidMedia'));
const WebNotification = lazy(() => import('./Pages/WebNotification/WebNotification'));
const MobileNotification = lazy(() => import('./Pages/MobileNotification/MobileNotification'));
const DetailAnalyticsRcs = lazy(() => import('./Pages/Rcs/Rcs'));
const AppAnalytics = lazy(() => import('./Pages/AppAnalytics/AppAnalytics/AppAnalytics'));

const detailAnalyticsTabComponent = (LazyComponent, { key, ...props } = {}) => () => (
    <Suspense fallback={<DetailAnalyticsTabContentLoadingBlock />}>
        <LazyComponent key={key} {...props} />
    </Suspense>
);

const progressbarData = [
    { name: 'Organic', value: 25, cls: 'pending' },
    { name: 'Boost post', value: 10, cls: 'rejected' },
];

export const getItemSubchannelId = (item) => Number(item?.subchannelId ?? item?.subChannelId ?? 0);

export const resolveChannelInfoIndex = ({
    channelInfos = [],
    channelId,
    subChannelId,
    blastId,
    currIndex,
    isSubsegmentLevelChange,
    splitIndex,
}) => {
    if (splitIndex !== null && splitIndex !== undefined && splitIndex !== -1) {
        return splitIndex;
    }
    if (isSubsegmentLevelChange) {
        return 0;
    }
    const resolvedChannelId = Number(channelId ?? 0);
    const resolvedSubChannelId = Number(subChannelId ?? 0);
    if ((resolvedChannelId === 7 || resolvedChannelId === 10) && resolvedSubChannelId > 0) {
        const subMatchIndex = channelInfos.findIndex(
            (item) => item?.channelId === resolvedChannelId && getItemSubchannelId(item) === resolvedSubChannelId,
        );
        if (subMatchIndex !== -1) {
            return subMatchIndex;
        }
    }
    if (resolvedChannelId > 0) {
        if (blastId) {
            const blastMatchIndex = channelInfos.findIndex(
                (item) => Number(item?.channelId) === resolvedChannelId && item?.blastShortCode === blastId,
            );
            if (blastMatchIndex !== -1) {
                return blastMatchIndex;
            }
        }
        const channelMatchIndex = channelInfos.findIndex((item) => Number(item?.channelId) === resolvedChannelId);
        if (channelMatchIndex !== -1) {
            return channelMatchIndex;
        }
    }
    const preferredIndex = currIndex ?? 0;
    return preferredIndex >= 0 && preferredIndex < channelInfos.length ? preferredIndex : 0;
};

export const getTabIndexByChannelId = (tabs, channelId) => {
    if (!tabs?.length || !channelId) {
        return -1;
    }
    return tabs.findIndex((tab) => tab.channelId === channelId);
};

export const buildDetailAnalyticsNavState = ({
    channelId,
    subChannelId,
    socialPostChannelId,
    campaignId,
    blastId,
    channelName,
    startDate,
    endDate,
    campaignName,
    campaignTypeValue,
    currIndex,
    iswinnerSplit,
    iswinnerSplitType,
    iswinnerBlastId,
    isSplitAB,
    isSplitABScheduler,
    splitName,
    splitType,
    subSegmentLevel,
    subSegmentFriendlyName,
    fromPath,
    isFromListingPage = false,
} = {}) => ({
    ...(channelName != null && { channelName }),
    channelId: Number(channelId),
    subChannelId: Number(subChannelId ?? socialPostChannelId ?? 0),
    campaignId: Number(campaignId),
    ...(blastId != null && { blastId }),
    ...(startDate != null && { startDate }),
    ...(endDate != null && { endDate }),
    ...(campaignName != null && { campaignName }),
    ...(campaignTypeValue != null && { campaignTypeValue }),
    ...(currIndex != null && { currIndex }),
    ...(iswinnerSplit != null && { iswinnerSplit }),
    ...(iswinnerSplitType != null && { iswinnerSplitType }),
    iswinnerBlastId: iswinnerBlastId ?? '',
    ...(isSplitAB != null && { isSplitAB }),
    isFromListingPage,
    ...(fromPath != null && { fromPath }),
    isSplitABScheduler: isSplitABScheduler ?? !!isSplitAB,
    splitName: splitName ?? (splitType ? `Split ${splitType}` : ''),
    ...(subSegmentLevel != null && { subSegmentLevel }),
    ...(subSegmentFriendlyName != null && { subSegmentFriendlyName }),
});

export const buildAnalyticsReportReturnPath = ({
    from,
    campaignName,
    isGolden,
    startDate,
    endDate,
    campaignTypeValue,
    channelId,
    subSegmentFriendlyName,
    subSegmentLevel,
    fromPath,
    snapshotId,
    snapshotName,
    createdDate,
    basePath = '/analytics/analytics-report',
} = {}) => {
    if (!from) return basePath;
    const csrState = {
        from,
        ...(campaignName != null && { campaignName }),
        ...(isGolden != null && { isGolden }),
        ...(startDate != null && { startDate }),
        ...(endDate != null && { endDate }),
        ...(campaignTypeValue != null && { campaignTypeValue }),
        ...(channelId != null && { channelId }),
        ...(subSegmentFriendlyName != null && { subSegmentFriendlyName }),
        ...(subSegmentLevel != null && { subSegmentLevel }),
        ...(fromPath != null && { fromPath }),
        ...(snapshotId != null && { snapshotId }),
        ...(snapshotName != null && { snapshotName }),
        ...(createdDate != null && { createdDate }),
    };
    return `${basePath}?q=${encodeUrl(csrState)}`;
};

export const resolveDetailAnalyticsBackPath = ({
    locationData,
    tempBackPath,
    defaultCsrPath = '/analytics/analytics-report',
}) => {
    if (locationData?.isFromListingPage || locationData?.channelId === 7) {
        return tempBackPath || '/analytics';
    }
    const fromPath = locationData?.fromPath;
    if (fromPath?.includes('?q=')) {
        return fromPath;
    }
    return tempBackPath || fromPath || defaultCsrPath;
};

export const handleDefaultTab = (list, channelId, currentBlastId) => {
    // debugger;
    let findShortCode = list?.findIndex(
        (item) => item?.channelId === channelId && item?.blastShortCode === currentBlastId,
    );
    if (findShortCode !== -1) {
        return findShortCode;
    }
    if (channelId) {
        findShortCode = list?.findIndex((item) => item?.channelId === channelId);
        if (findShortCode !== -1) {
            return findShortCode;
        }
    }
};

export const getLocationDetails = (data) => {
    const updatedData = data?.map((item) => ({
        zoomLevel: 10,
        country: item.Country,
        state: item.State,
        lat: Number(item.Latitude),
        lon: Number(item.Longitude),
    }));

    return {
        series: updatedData,
    };
};

export const handleChannelInfo = (channelDetail, locationData) => {
    let getChannel_splitChannelLevelInfo = channelDetail?.splitChannelLevelInfo;
    if (locationData?.iswinnerSplit && locationData?.iswinnerSplitType) {
        getChannel_splitChannelLevelInfo = channelDetail?.splitChannelLevelInfo?.filter(
            (item) => item.splitType === locationData?.iswinnerSplitType,
        );
    }
    return getChannel_splitChannelLevelInfo;
};

export const DETAIL_ANALYTICS_TAB_CONFIG = (isDownloadUI) => [
    {
        text: 'Email',
        channelId: 1,
        component: detailAnalyticsTabComponent(DetailAnalyticsEmail, {
            key: 'email',
            type: 'Email',
            isDownloadUI,
        }),
    },
    {
        text: 'SMS',
        channelId: 2,
        component: detailAnalyticsTabComponent(DetailAnalyticsSms, {
            type: 'SMS',
            key: 'sms',
            isDownloadUI,
        }),
    },

    {
        text: 'Mobile push',
        channelId: 14,
        component: detailAnalyticsTabComponent(MobileNotification, {
            type: 'mobilepush',
            key: 'MobilePushNotification',
            isDownloadUI,
        }),
    },
    {
        text: 'Web push',
        channelId: 8,
        component: detailAnalyticsTabComponent(WebNotification, {
            type: 'webpush',
            key: 'webnotification',
            isDownloadUI,
        }),
    },
    {
        text: 'QR',
        channelId: 3,
        component: detailAnalyticsTabComponent(DetailAnalyticsQr, {
            type: 'Qr code',
            key: 'qr',
            isDownloadUI,
        }),
    },
    {
        text: 'WhatsApp',
        channelId: 21,
        component: detailAnalyticsTabComponent(DetailAnalyticsWhatsapp, {
            type: 'WhatsApp',
            key: 'whatsapp',
            isDownloadUI,
        }),
    },
    {
        text: 'RCS',
        channelId: 41,
        component: detailAnalyticsTabComponent(DetailAnalyticsRcs, {
            type: 'Rcs',
            key: 'rcs',
            isDownloadUI,
        }),
    },
    {
        text: 'VMS',
        channelId: 25,
        component: detailAnalyticsTabComponent(DetailAnalyticsVMS, {
            type: 'VMS',
            key: 'vms',
            isDownloadUI,
        }),
    },
    {
        text: 'Paid media',
        channelId: 10,
        component: detailAnalyticsTabComponent(DetailAnalyticsPaidMedia, {
            type: 'Paid media',
            key: 'paid media',
            isDownloadUI,
        }),
    },
    {
        text: 'Social media',
        channelId: 7,
        component: detailAnalyticsTabComponent(DetailAnalyticsSocialMedia, {
            type: 'Social media',
            key: 'Social media',
            isDownloadUI,
        }),
    },
    {
        text: 'Web / App analytics',
        channelId: 6,
        component: detailAnalyticsTabComponent(DetailAnalyticsWebAppAnalytics, {
            type: 'Web app analytics',
            key: 'Web app analytics',
            isDownloadUI,
        }),
    },
    {
        text: 'App analytics',
        channelId: 16,
        component: detailAnalyticsTabComponent(AppAnalytics, {
            type: 'Web app analytics',
            key: 'Web app analytics',
            isDownloadUI,
        }),
    },
];

export const defaultValues = () => {
    return {
        reach: {},
        engagement: {},
        conversion: {},
        segmentLists: [],
        reachPerformanceJson: '[]',
        reachPerformanceHrsJson: '[]',
        keyMetrics: {},
        enagegementPerformanceJson: ' []',
        enagegementPerformanceHrsJson: '[]',
        conversionPerformanceJson: '[]',
        clientInfoJson: '[]',
        deviceInfoJson: '[]',
        blastAudienceJson: '[]',
        topBrowserValue: '',
        topBrowser: '',
        topOsValue: '',
        topOs: '',
        activityStatus: {},
        jobDateTime: '',
        isSplitEnabled: false,
        // blastAudienceJson: null,
        campaignStatusInfoJson: '[]',
        conversionCostAmount: 0,
        dayJson: null,
        hourJson: null,
        locationInfoJson: '[]',
        mobileOsInfoJson: '[]',
        selectedSegmentId: 0,
        topDay: '',
        topDayValue: '',
        topHour: '',
        topHourValue: '',
        topInteraction: null,
        topInteractionValue: null,
        topLocation: '',
        topLocationValue: '',
        interactiveButtonInfoJson: '[]',
    };
};

export const ORM_TAB_CONFIG = [
    {
        id: 'overview',
        text: 'Overview',
        disable: false,
        component: () => <OverviewTab type="LIST_ACTIVITY" key={'overview'} />,
    },
    {
        id: 'Details',
        text: 'Details',
        disable: false,
        component: () => <DetailsTab type="LIST_ACQUISITION" key={'Details'} />,
    },
];

//Common details methods
export const areachangeToBase64 = (data, size) => {
    if (!data || data === '' || data === undefined || typeof data !== 'string') {
        return {};
    }
    try {
        const chartData = JSON.parse(data);
        if (!chartData || typeof chartData !== 'object') {
            return {};
        }
        const seriesData = {
            categories: chartData?.categories || [],
            dtCategories: chartData?.dtCategories || [],
            series: (chartData?.series || []).map((item, index) => {
                return {
                    chartType: item?.chartType || 'areaspline',
                    colorCode: item?.colorCode,
                    datas: item?.datas || [],
                    name: seriesNameField(item?.name) ?? '',
                };
            }),
        };
        let chart = {
            height: chartSizing[size] ?? 200,
            categories: chartData?.categories || [],
            legend: {
                // enabled: false,
            },
            series: seriesData?.series || [],
        };
        return chart;
    } catch (error) {
        return {};
    }
};

export const changeToBase64 = (data, size) => {
    if (!data || data === '' || data === undefined || typeof data !== 'string') {
        return {};
    }
    try {
        const chartData = JSON.parse(data);
        if (!chartData || typeof chartData !== 'object') {
            return {};
        }
        let chart = {
            height: chartSizing[size] ?? 200,
            categories: chartData?.categories || [],
            legend: {
                // enabled: false,
            },
            series: chartData?.series || [],
        };
        return chart;
    } catch (error) {
        return {};
    }
};

export const changeToBase641 = (data, size, customseries = false) => {
    if (!data) {
        return {};
    }

    const chartData = parseAnalyticsJson(data, {});

    const customSeriesData =
        chartData?.series?.map((ser) => ({
            data: ser.datas,
            name: ser.name,
        })) || [];


    const height = chartSizing?.[size] ?? 200;

    let chart = {
        height,
        categories: chartData?.categories || [],
        legend: {
            // enabled: false,
        },
        series: customSeriesData,
    };

    return chart;
};

export const pieChartOption = (appData, size, useDoubleValue = false) => {
    const appChartValue = parseAnalyticsJsonArray(appData, []);

    const transformedSeries = useDoubleValue
        ? appChartValue.map((item) => ({
              ...item,
              y: item.doubleValue || item.y || item.value || item.intValue,
              value: item.doubleValue || item.y || item.value || item.intValue,
          }))
        : appChartValue;

    return {
        height: chartSizing[size] ?? 200,
        series: transformedSeries,
        ...(useDoubleValue && {
            tooltip: {
                enabled: true,
                formatter: function () {
                    if (!this.point || typeof this.point.y === 'undefined') {
                        return '';
                    }
                    const formattedPercentage = formatPercentageDisplay(this.point.y);
                    return `<span class="font-xs">${
                        this.point.name || 'Unknown'
                    }</span><br/><hr /><span class="font-monospace" style="color:${
                        this.point.color || '#000'
                    }">\u25CF</span>&nbsp;<span class="font-xs">Value: </span><span class="font-xs" style="text-align: right;">${formattedPercentage}%</span>`;
                },
            },
        }),
    };
};

export const mapChartOption = (appData) => {
    const mapChartValue = parseAnalyticsJsonArray(appData, []);

    return {
        series: mapChartValue,
    };
};

export const handleSplit = (splitList, winnerSplitType) => {
    let mySplit = [...splitList];
    const updatedMySplit = mySplit.map((item) => ({
        ...item,
        splitType: 'Split ' + item.splitType,
    }));
    const winnerSplit = splitList?.find((item) => item?.splitType === winnerSplitType);
    let actualData = {
        splitType: 'Actual communication',
        ...(winnerSplit?.blastShortCode && { blastShortCode: winnerSplit.blastShortCode }),
    };
    updatedMySplit.unshift(actualData);
    return updatedMySplit;
};

export const handleSegmentData = (segmentList) => {
    let mySegment = [...segmentList];
    // let newSegment = { segmentName: 'Control/Target group' };
    // mySegment.push(newSegment);
    return mySegment;
};

export const TOP_LINK_ACTIVITY = [
    {
        field: 'rowNo',
        title: 'S.No',
        //className: 'text-end',
        width: 30,
    },
    {
        field: 'url',
        title: 'Link (URL)',
        width: 300,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.url?.length > 85 ? (
                    <RSTooltip
                        text={dataItem?.url}
                        position="top"
                        className="d-inline-block modalOverlayZindexCSS"
                        innerContent={false}
                    >
                        <span className="m0">{truncateTitle(dataItem?.url, 85)}</span>
                    </RSTooltip>
                ) : (
                    <span className="m0">{dataItem?.url}</span>
                )}
            </td>
        ),
    },
    {
        field: 'totalClicks',
        title: 'Total clicks',
        className: 'text-end',
        width: 80,
        cell: ({ dataItem, field }) => {
            return <td className="text-end">{dataItem[field] > 0 ? numberWithCommas(dataItem[field]) : '0'}</td>;
        },
    },
    {
        field: 'totalUniqueClicks',
        title: 'Unique clicks',
        className: 'text-end',
        width: 80,
        cell: ({ dataItem, field }) => {
            return <td className="text-end">{dataItem[field] > 0 ? numberWithCommas(dataItem[field]) : '0'}</td>;
        },
    },
];

export const COMMUNICATION_PERFORMANCE = 'Communication performance – daily unique counts';
export const COMMUNICATION_STATUS = 'Communication status';
export const USER_ENGAGEMENT = 'User engagement';
export const CONTENT_TARGET_PERFORMANCE = 'Content target performance';

/** @param {string} [_domain] Reserved for tenant-specific wording */

const normalizeContentTargetMetricKey = (key) =>
    String(key)
        .toLowerCase()
        .replace(/[\s_]+/g, '');

const getContentTargetMetricValue = (metrics, key) => {
    if (!metrics || typeof metrics !== 'object') {
        return 0;
    }
    const targetKey = normalizeContentTargetMetricKey(key);
    const matchedKey = Object.keys(metrics).find(
        (metricKey) => normalizeContentTargetMetricKey(metricKey) === targetKey,
    );
    if (matchedKey === undefined) {
        return 0;
    }
    const value = metrics[matchedKey];
    return value ?? 0;
};

export const getContentTargetGridData = (contentTarget) => {
    if (contentTarget === undefined || contentTarget === null || contentTarget === '') {
        return [];
    }
    let parsed;
    try {
        parsed = typeof contentTarget === 'string' ? JSON.parse(contentTarget) : contentTarget;
    } catch {
        return [];
    }
    if (!parsed || typeof parsed !== 'object') {
        return [];
    }

    const rows = [];
    Object.keys(parsed).forEach((targetGroup) => {
        const list = parsed[targetGroup];
        if (!Array.isArray(list)) {
            return;
        }
        list.forEach((entry) => {
            if (!entry || typeof entry !== 'object') {
                return;
            }
            Object.keys(entry).forEach((targetName) => {
                const metrics = entry[targetName];
                if (!metrics || typeof metrics !== 'object') {
                    return;
                }
                const reach = getContentTargetMetricValue(metrics, 'is_Open');
                const engagement = getContentTargetMetricValue(metrics, 'is_Click');
                rows.push({
                    targetGroup,
                    targetAttributeName,
                    targetName: targetAttributeName,
                    audience: getContentTargetMetricValue(metrics, 'is_Blast'),
                    is_Open: reach,
                    is_Click: engagement,
                    is_TotalConv: getContentTargetMetricValue(metrics, 'is_TotalConv'),
                    contentTargetCtr: getContentTargetCtrValue(metrics),
                });
            });
        });
    });

    return rows.map((row, index) => ({ ...row, rowNo: index + 1 }));
};

const formatContentTargetMetric = (value) => {
    const n = Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    return safe > 0 ? numberWithCommas(safe) : '0';
};

const getContentTargetCtrValue = (metrics) => {
    const reach = Number(getContentTargetMetricValue(metrics, 'is_Open'));
    const engagement = Number(getContentTargetMetricValue(metrics, 'is_Click'));
    if (!Number.isFinite(reach) || reach <= 0) {
        return 0;
    }
    if (!Number.isFinite(engagement) || engagement < 0) {
        return 0;
    }
    const pct = (engagement / reach) * 100;
    return Math.round(pct * 100) / 100;
};

/** CTR numeric part only; `%` is rendered with `fs11` in the column cell. Engagement/Reach = is_Click/is_Open. */
const getContentTargetCtrNumberStr = (dataItem) => {
    const ctrValue = Number(dataItem?.contentTargetCtr);
    if (Number.isFinite(ctrValue)) {
        return String(numberWithCommas(ctrValue));
    }
    const reach = Number(dataItem?.is_Open);
    const engagement = Number(dataItem?.is_Click);
    if (!Number.isFinite(reach) || reach <= 0) {
        return '0';
    }
    if (!Number.isFinite(engagementNum) || engagementNum < 0) {
        return 0;
    }
    return Math.round((engagementNum / reachNum) * 100 * 100) / 100;
};

export const CONTENT_TARGET_GRID_COLUMN_DATA = [
    {
        field: 'rowNo',
        title: 'S.No',
        width: 70,
        cell: ({ dataItem }) => (
            <td className="text-center" style={{ minWidth: 0 }}>
                <TruncatedCell noTable value={String(dataItem?.rowNo)} />
            </td>
        ),
    },
    {
        field: 'targetGroup',
        title: 'Target group',
        width: 200,
        cell: ({ dataItem }) => (
            <td style={{ minWidth: 0 }}>
                <TruncatedCell noTable value={String(dataItem?.targetGroup ?? '')} />
            </td>
        ),
    },
    {
        field: 'targetName',
        title: 'Target name',
        width: 200,
        cell: ({ dataItem }) => (
            <td style={{ minWidth: 0 }}>
                <TruncatedCell noTable value={String(dataItem?.targetName ?? '')} />
            </td>
        ),
    },
    {
        field: 'audience',
        title: 'Audience',
        width: 130,
        cell: ({ dataItem }) => <TruncatedCell alignRight value={formatContentTargetMetric(dataItem?.audience)} />,
    },
    {
        field: 'is_Open',
        title: 'Reach',
        width: 100,
        cell: ({ dataItem }) => <TruncatedCell alignRight value={formatContentTargetMetric(dataItem?.is_Open)} />,
    },
    {
        field: 'is_Click',
        title: 'Engagement',
        width: 110,
        cell: ({ dataItem }) => <TruncatedCell alignRight value={formatContentTargetMetric(dataItem?.is_Click)} />,
    },
    {
        field: 'contentTargetCtr',
        title: 'CTR',
        width: 100,
        cell: ({ dataItem }) => (
            <td className="text-right">
                <span className="k-text-truncate d-inline-block">
                    {numberWithCommas(dataItem?.contentTargetCtr ?? 0)}
                    <span className="fs11">%</span>
                </span>
            </td>
        ),
    },
    {
        field: 'is_TotalConv',
        title: 'Conversion',
        width: 120,
        cell: ({ dataItem }) => <TruncatedCell alignRight value={formatContentTargetMetric(dataItem?.is_TotalConv)} />,
    },
];

export const TAB_CONFIG = [{ text: 'Overall' }, { text: 'First 24 hr' }];
export const EMAIL_TAB_CONFIG = [{ text: 'Client' }, { text: 'Device' }];

// Email
export const GRID_COLUMN_DATA = [
    {
        field: 'userId',
        title: 'S.No',
        className: 'text-center',
        width: 70,
    },
    {
        field: 'accountType',
        filtervalue: 'string',
        title: 'Account type',
        width: 205,
    },
    {
        field: 'membership',
        filtervalue: 'string',
        title: 'Membership',
        width: 205,
    },
    {
        field: 'city',
        filtervalue: '',
        title: 'City',
        width: 205,
    },
    {
        field: 'offers',
        filtervalue: '',
        title: 'Offers',
        width: 205,
    },
    {
        field: 'url',
        filtervalue: 'string',
        title: 'Link (URL)',
        width: 300,
    },
    {
        field: 'totalClicks',
        filtervalue: 'string',
        title: 'Total clicks',
        className: 'text-end',
        width: 150,
    },
    {
        field: 'uniqueClicks',
        filtervalue: 'string',
        title: 'Unique clicks',
        className: 'text-end',
        width: 150,
    },
];
export const CAMPAIGN_GRID_COLUMN_DATA = (callBack, selectedOption) => {
    const baseColumns = [
        {
            field: 'rowNo',
            title: 'S.No',
            className: 'text-end',
            width: 40,
        },
        {
            field: 'name',
            title: 'Name',
            width: 205,
        },
        // {
        //     field: 'mobileNo',
        //     title: 'Mobile number',
        //     width: 205,
        // },
        // {
        //     field: 'status',
        //     title: 'Status',
        //     width: 205,
        // },
        {
            field: 'emailId',
            title: 'Email',
            width: 205,
        },
    ];

    if (selectedOption) {
        return [
            ...baseColumns,
            {
                field: 'totalOpen',
                title: 'Opens',
                className: 'text-end',
                width: 100,
            },
            {
                field: 'totalClicks',
                title: 'Clicks',
                width: 110,
                cell: ({ dataItem }) => {
                    return (
                        <td className="text-end">
                            {dataItem?.totalClicks}
                            {dataItem?.totalClicks !== 0 && (
                                <span
                                    onClick={() => {
                                        callBack(dataItem);
                                    }}
                                    className={`text-primary cp ${dataItem?.totalClicks !== 0 ? '' : 'click-off'}`}
                                >
                                    {' '}
                                    Show link
                                </span>
                            )}
                        </td>
                    );
                },
            },
            {
                field: 'totalConversions',
                title: 'Conversion',
                className: 'text-end',
                width: 100,
            },
        ];
    }

    return baseColumns;
};

export const CAMPAIGN_GRID_MP_COLUMN_DATA = (callBack) => {
    return [
        {
            field: 'rowNo',
            title: 'S.No',
            className: 'text-center',
            width: 70,
        },
        {
            field: 'name',
            title: 'Name',
            width: 205,
        },
        // {
        //     field: 'emailId',
        //     title: 'Email',
        //     width: 205,
        // },
        {
            field: 'mobileNo',
            title: 'Mobile number',
            width: 205,
        },
    ];
};

export const CAMPAIGN_GRID_COLUMN_DATA_WHATSAPP = (callBack) => {
    return [
        {
            field: 'rowNo',
            title: 'S.No',
            className: 'text-center',
            width: 70,
        },
        {
            field: 'name',
            title: 'Name',
            width: 205,
        },
        {
            field: 'mobileNo',
            title: 'Mobile number',
            width: 205,
        },
        {
            field: 'status',
            title: 'Status',
            width: 205,
        },
        // {
        //     field: 'emailId',
        //     title: 'Email',
        //     width: 205,
        // },
        // {
        //     field: 'totalOpen',
        //     title: 'Opens',
        //     className: 'text-end',
        //     width: 100,
        // },
        // {
        //     field: 'totalClicks',
        //     title: 'Clicks',
        //     width: 110,
        //     cell: ({ dataItem }) => {
        //         return (
        //             <td className="text-end">
        //                 {dataItem?.totalClicks}
        //                 {dataItem?.totalClicks !== 0 && (
        //                     <span
        //                         onClick={() => {
        //                             callBack(dataItem);
        //                         }}
        //                         className={`text-primary cp ${dataItem?.totalClicks !== 0 ? '' : 'click-off'}`}
        //                     >
        //                         {' '}
        //                         Show link
        //                     </span>
        //                 )}
        //             </td>
        //         );
        //     },
        // },
        // {
        //     field: 'totalConversions',
        //     title: 'Conversion',
        //     className: 'text-end',
        //     width: 100,
        // },
    ];
};

export const CAMPAIGN_GRID_COLUMN_DATA_RCS = (callBack) => {
    return [
        {
            field: 'rowNo',
            title: 'S.No',
            className: 'text-center',
            width: 70,
        },
        {
            field: 'name',
            title: 'Name',
            width: 205,
        },
        {
            field: 'mobileNo',
            title: 'Mobile number',
            width: 205,
        },
        {
            field: 'status',
            title: 'Status',
            width: 205,
        },
        // {
        //     field: 'messageType',
        //     title: 'Message Type',
        //     width: 205,
        // },
        // {
        //     field: 'deliveryStatus',
        //     title: 'Delivery Status',
        //     width: 205,
        // },
        // {
        //     field: 'emailId',
        //     title: 'Email',
        //     width: 205,
        // },
        // {
        //     field: 'totalOpen',
        //     title: 'Opens',
        //     className: 'text-end',
        //     width: 100,
        // },
        // {
        //     field: 'totalClicks',
        //     title: 'Clicks',
        //     width: 110,
        //     cell: ({ dataItem }) => {
        //         return (
        //             <td className="text-end">
        //                 {dataItem?.totalClicks}
        //                 {dataItem?.totalClicks !== 0 && (
        //                     <span
        //                         onClick={() => {
        //                             callBack(dataItem);
        //                         }}
        //                         className={`text-primary cp ${dataItem?.totalClicks !== 0 ? '' : 'click-off'}`}
        //                     >
        //                         {' '}
        //                         Show link
        //                     </span>
        //                 )}
        //             </td>
        //         );
        //     },
        // },
        // {
        //     field: 'totalConversions',
        //     title: 'Conversion',
        //     className: 'text-end',
        //     width: 100,
        // },
    ];
};

export const CAMPAIGN_GRID_COLUMN_DATA_WEBPUSH = (callBack) => {
    return [
        {
            field: 'rowNo',
            title: 'S.No',
            className: 'text-center',
            width: 70,
        },
        {
            field: 'name',
            title: 'Name',
            width: 205,
        },
        {
            field: 'status',
            title: 'Status',
            width: 205,
        },
    ];
};
export const TRIGGER_GRID_COLUMN_DATA_WEBPUSH = (callBack) => {
    return [
        {
            field: 'rowNo',
            title: 'S.No',
            className: 'text-center',
            width: 70,
        },
        {
            field: 'name',
            title: 'Name',
            width: 205,
        },
        {
            field: 'emailId',
            title: 'Email ID',
            width: 205,
        },
        {
            field: 'mobileNo',
            title: 'Mobile number',
            width: 205,
        },
    ];
};

export const CAMPAIGN_SMS_GRID_COLUMN_DATA = [
    {
        field: 'rowNo',
        title: 'S.No',
        className: 'text-center',
        width: 70,
    },
    {
        field: 'name',
        title: 'Name',
    },
    {
        field: 'mobileNo',
        title: 'Mobile number',
    },
];

// SMS

export const SMS_COMMOUNICATION_GRID_COLUMN_DATA = [
    {
        field: 'userId',
        filtervalue: 'string',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'name',
        filtervalue: 'string',
        title: 'Name',
        width: 300,
        filter: 'text',
    },
    {
        field: 'email',
        filtervalue: 'string',
        title: 'Email',
        width: 300,
        filter: 'text',
    },
    {
        field: 'mobile',
        filtervalue: 'string',
        title: 'Mobile',
        width: 300,
        filter: 'text',
    },
];
export const SMS_COMMOUNICATION_GRID_DATA = [
    {
        userId: 1,
        name: 'username1',
        email: 'emailid1',
        mobile: 'phone1',
    },
    {
        userId: 2,
        name: 'username2',
        email: 'emailid2',
        mobile: 'phone2',
    },
    {
        userId: 3,
        name: 'username3',
        email: 'emailid3',
        mobile: 'phone3',
    },
    {
        userId: 4,
        name: 'username4',
        email: 'emailid4',
        mobile: 'phone4',
    },
    {
        userId: 5,
        name: 'username5',
        email: 'emailid5',
        mobile: 'phone5',
    },
];
// Two_waysms
export const TWO_WAYSMS_GRID_COLUMN_DATA = [
    {
        field: 'userId',
        filtervalue: 'string',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'keywords',
        filtervalue: 'string',
        title: 'Keywords',
        width: 300,
        filter: 'text',
    },
    {
        field: 'totalResponse',
        filtervalue: 'string',
        title: 'Total response',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
    {
        field: 'uniqueResponse',
        filtervalue: 'string',
        title: 'Unique response',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
];
export const TWO_WAYSMS_LINK_GRID_DATA = [
    {
        userId: 1,
        keywords: 'Help',
        totalResponse: '12,109',
        uniqueResponse: '10,528',
    },
    {
        userId: 2,
        keywords: 'Stop',
        totalResponse: '6,475',
        uniqueResponse: '5,221',
    },
];

// Line
export const LINE_TOTAL_LINK_GRID_COLUMN_DATA = [
    {
        field: 'userId',
        filtervalue: 'string',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'url',
        filtervalue: 'string',
        title: 'Link (URL)',
        width: 500,
        filter: 'text',
    },
    {
        field: 'totalClicks',
        filtervalue: 'string',
        title: 'Total clicks',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
    {
        field: 'totalUniqueClicks',
        filtervalue: 'string',
        title: 'Total unique clicks',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
];
export const LINE_TOTAL_LINK_GRID_DATA = [
    {
        userId: 1,
        url: 'clientEmail',
        totalClicks: '500',
        totalUniqueClicks: '400',
    },
];
export const LINE_COMMOUNICATION_GRID_COLUMN_DATA = [
    {
        field: 'userId',
        filtervalue: 'string',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'name',
        filtervalue: 'string',
        title: 'Name',
        width: 300,
        filter: 'text',
    },
    {
        field: 'mobile',
        filtervalue: 'string',
        title: 'Mobile',
        width: 300,
        filter: 'text',
    },
    {
        field: 'status',
        filtervalue: 'string',
        title: 'Status',
        width: 300,
    },
];
export const LINE_COMMOUNICATION_GRID_DATA = [
    {
        userId: 1,
        name: 'username1',
        mobile: 'phone1',
        status: 'Delivered',
    },
    {
        userId: 2,
        name: 'username2',
        mobile: 'phone2',
        status: 'Inprogress',
    },
    {
        userId: 3,
        name: 'username3',
        mobile: 'phone3',
        status: 'Delivered',
    },
    {
        userId: 4,
        name: 'username4',
        mobile: 'phone4',
        status: 'Undelivered',
    },
    {
        userId: 5,
        name: 'username5',
        mobile: 'phone5',
        status: 'Delivered',
    },
];

// Paid Media
export const PAIDMEDIA_TOTAL_LINK_GRID_COLUMN_DATA = [
    {
        field: 'rowNo',
        filtervalue: 'string',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'url',
        filtervalue: 'string',
        title: 'Link (URL)',
        width: 400,
        filter: 'text',
    },
    {
        field: 'totalClicks',
        filtervalue: 'string',
        title: 'Total clicks',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
    {
        field: 'totalUniqueClicks',
        filtervalue: 'string',
        title: 'Unique clicks',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
];

// Voice Assistant
export const VoiceAssistant_TOTAL_LINK_GRID_COLUMN_DATA = [
    {
        field: 'userId',
        filtervalue: 'string',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'channel',
        filtervalue: 'string',
        title: 'Channel',
        width: 100,
        filter: 'text',
    },
    {
        field: 'url',
        filtervalue: 'string',
        title: 'Link (URL)',
        width: 400,
        filter: 'text',
    },
    {
        field: 'totalClicks',
        filtervalue: 'string',
        title: 'Total clicks',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
];
export const VoiceAssistant_TOTAL_LINK_GRID_DATA = [
    {
        userId: 1,
        channel: 'Email',
        url: 'clientEmail',
        totalClicks: '10982',
    },
    {
        userId: 2,
        channel: 'SMS',
        url: 'clientEmail',
        totalClicks: '3003',
    },
];
export const VoiceAssistant_COMMOUNICATION_GRID_COLUMN_DATA = [
    {
        field: 'userId',
        filtervalue: 'string',
        title: 'S.No',
        className: 'text-center',
        width: 70,
        filter: 'text',
    },
    {
        field: 'name',
        filtervalue: 'string',
        title: 'Name',
        width: 200,
        filter: 'text',
    },
    {
        field: 'email',
        filtervalue: 'string',
        title: 'Email',
        width: 300,
        filter: 'text',
    },
    {
        field: 'regID',
        filtervalue: 'string',
        title: 'Mobile',
        width: 200,
        filter: 'text',
    },
    {
        field: 'received',
        filtervalue: 'string',
        title: 'Mobile OS',
        className: 'text-right',
        width: 200,
        filter: 'text',
    },
    {
        field: 'conversions',
        filtervalue: 'string',
        title: 'Country',
        className: 'text-right',
        width: 200,
        filter: 'text',
    },
];

// Post summary
export const POST_SUMMARY_RESULTICKS_GRID_COLUMN_DATA = [
    {
        field: 'postsTitle',
        filtervalue: 'string',
        title: 'Channel title',
        width: 400,
        // filter:'text',
        cell: ({ dataItem }) => (
            <td>
                <div>
                    <p>{dataItem?.postsTitle}</p>
                    {/* <small>Published on: {dataItem?.small}</small> */}
                </div>
            </td>
        ),
    },
    {
        field: 'contentType',
        filtervalue: 'string',
        title: 'Content type',
        width: 150,
        // filter:'text',
        cell: ({ dataItem }) => (
            <td className="text-center">
                <i className={`${dataItem?.contentType} icon-lg ml10 color-primary-blue cursor-default`}></i>
            </td>
        ),
    },
    // {
    //     field: 'reach',
    //     filtervalue: 'string',
    //     title: 'Reach',
    //     width: 180,
    //     filter:'text',
    //     cell: ({ dataItem }) => (
    //         <td className="text-center">
    //             <i className={`${communication_target_mini} icon-lg ml10 color-primary-blue cursor-default`}></i>{' '}
    //             <small>{dataItem?.reach}</small>
    //             {/*    <div className="progressbar mt15 mb15">
    //               <ul className="d-flex text-end">
    //                     {progressbarData.map((item, index) => {
    //                         return (
    //                             <li
    //                                 key={index}
    //                                 className={`${item.cls}-status text-end pr5`}
    //                                 style={{ width: `${item.value}%` }}
    //                             >
    //                                 {item.value}
    //                             </li>
    //                         );
    //                     })}
    //                 </ul>
    //             </div>*/}
    //         </td>
    //     ),
    // },
    {
        field: 'engagement',
        filtervalue: 'string',
        title: 'Engagement',
        width: 150,
        // filter:'text',
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.engagement?.length > 0 &&
                    dataItem?.engagement?.map((item, index) => {
                        return (
                            <div key={index} className="d-flex align-items-center mb10 justify-content-center">
                                <i
                                    className={`${item.icon} color-primary-blue d-flex align-items-center justify-content-center cursor-default`}
                                ></i>
                                <small className="ml5">{item.value}</small>
                            </div>
                        );
                    })}
            </td>
        ),
    },
    {
        field: 'conversion',
        // filtervalue: 'string',
        title: 'Conversion',
        className: 'text-end',
        width: 120,
    },
    {
        field: 'ratings',
        // filtervalue: 'string',
        title: 'Ratings',
        className: 'text-end',
        width: 100,
    },
];
export const POST_SUMMARY_RESULTICKS_GRID_DATA = [
    {
        postsTitle: 'Weekend surprise! Flat 20% off on accessories',
        small: mFulltimeSubt_01,
        contentType: social_post_large,
        reach: '',
        engagement: '',
        conversion: '300',
        ratings: '3.0',
    },
];
// Traffic breakdown Web App analytics
export const TRAFFIC_BREAKDOWN_GRID_COLUMN_DATA = [
    {
        field: 'sourceMedium',
        filtervalue: 'string',
        title: 'Source/medium',
        width: 200,
    },
    {
        field: 'sessions',
        filtervalue: 'string',
        title: 'Sessions',
        width: 150,
        className: 'text-end',
    },
    {
        field: 'newSessions',
        filtervalue: 'string',
        title: '%New sessions',
        width: 180,
        className: 'text-end',
    },
    {
        field: 'newUser',
        filtervalue: 'string',
        title: 'New user',
        width: 150,
        className: 'text-end',
    },
    {
        field: 'bounceRate',
        filtervalue: 'string',
        title: 'Bounce rate',
        className: 'text-end',
        width: 120,
    },
    {
        field: 'pagesSession',
        filtervalue: 'string',
        title: 'Pages/ session',
        className: 'text-end',
        width: 150,
    },
    {
        field: 'avgSessionDuration',
        filtervalue: 'string',
        title: 'Avg. session duration',
        className: 'text-end',
        width: 200,
    },
];
export const TRAFFIC_BREAKDOWN_GRID_DATA = [
    {
        sourceMedium: '/Brand',
        sessions: '690',
        newSessions: '77.25%',
        newUser: '533',
        bounceRate: '48.1%',
        pagesSession: '2.95',
        avgSessionDuration: '00:02:38',
    },
    {
        sourceMedium: '/Management',
        sessions: '87',
        newSessions: '82.5%',
        newUser: '64',
        bounceRate: '85.90%',
        pagesSession: '1.62',
        avgSessionDuration: '00:01:23',
    },
    {
        sourceMedium: '/Services',
        sessions: '67',
        newSessions: '82.5%',
        newUser: '64',
        bounceRate: '85.90%',
        pagesSession: '1.62',
        avgSessionDuration: '00:01:23',
    },
    {
        sourceMedium: '/Dashboard',
        sessions: '690',
        newSessions: '82.5%',
        newUser: '64',
        bounceRate: '85.90%',
        pagesSession: '1.62',
        avgSessionDuration: '00:01:24',
    },
    {
        sourceMedium: '/Product',
        sessions: '87',
        newSessions: '82.5%',
        newUser: '64',
        bounceRate: '85.90%',
        pagesSession: '1.62',
        avgSessionDuration: '00:01:24',
    },
];

export const KEYWORD_RANKING_GRID_COLUMN_DATA = [
    {
        field: 'searchEngine',
        filtervalue: 'string',
        title: 'Search engine',
        width: 200,
        filter: 'text',
        cell: ({ dataItem }) => {
            return (
                <td>
                    <img src={dataItem?.searchEngine} />
                </td>
            );
        },
    },
    {
        field: 'myEngine',
        filtervalue: 'string',
        title: 'My engine',
        width: 150,
        className: 'text-end',
        filter: 'text',
    },
    {
        field: 'positionOne',
        filtervalue: 'string',
        title: 'Position 1',
        width: 180,
        className: 'text-end',
        filter: 'text',
    },
    {
        field: 'positionTwo',
        filtervalue: 'string',
        title: 'Position 2',
        width: 150,
        className: 'text-end',
        filter: 'text',
    },
    {
        field: 'positionThree',
        filtervalue: 'string',
        title: 'Position 3',
        className: 'text-end',
        width: 120,
        filter: 'text',
    },
    {
        field: 'positionFour',
        filtervalue: 'string',
        title: 'Position 4',
        className: 'text-end',
        width: 150,
        filter: 'text',
    },
    {
        field: 'positionFive',
        filtervalue: 'string',
        title: 'Position 5',
        className: 'text-end',
        width: 200,
        filter: 'text',
    },
];
// GoogleLogo,BingLogo,YahooLogo
export const KEYWORD_RANKING_GRID_DATA = [
    {
        searchEngine: GoogleLogo,
        myEngine: 'clientEmail',
        positionOne: 'clientName',
        positionTwo: 'jpmorgan.com',
        positionThree: 'capitalone.com',
        positionFour: 'barclays.com',
        positionFive: 'citigroup.com',
    },
    {
        searchEngine: BingLogo,
        myEngine: 'clientEmail',
        positionOne: 'jpmorgan.com',
        positionTwo: 'clientName',
        positionThree: 'barclays.com',
        positionFour: 'citigroup.com',
        positionFive: 'wellsfargo.com',
    },
    {
        searchEngine: YahooLogo,
        myEngine: 'clientEmail',
        positionOne: 'clientName',
        positionTwo: 'morganstanley.com',
        positionThree: 'wellsfargo.com',
        positionFour: 'jpmorgan.com',
        positionFive: 'capitalone.com',
    },
];
const engagementStatus = [
    {
        icon: arrow_up_mini,
        value: 232,
    },
    {
        icon: thumbs_up_mini,
        value: 1254,
    },
    {
        icon: messaging_mini,
        value: 821,
    },
    {
        icon: channel_action_mini,
        value: 578,
    },
];
export const POST_SUMMARY_OTHERS_GRID_COLUMN_DATA = [
    {
        field: 'postsTitle',
        filtervalue: 'string',
        title: 'Posts title',
        width: 400,
        filter: 'text',
        cell: ({ dataItem }) => (
            <td>
                <div>
                    <p>{dataItem?.postsTitle}</p>
                    <small>Published on: {dataItem?.small}</small>
                </div>
            </td>
        ),
    },
    {
        field: 'contentType',
        filtervalue: 'string',
        title: 'Content type',
        width: 150,
        filter: 'text',
        cell: ({ dataItem }) => (
            <td className="text-center">
                <i className={`${dataItem?.contentType} icon-lg ml10 color-primary-blue`}></i>
            </td>
        ),
    },
    {
        field: 'reach',
        filtervalue: 'string',
        title: 'Reach',
        width: 180,
        filter: 'text',
        cell: ({ data }) => (
            <td>
                <div className="progressbar mt15 mb15">
                    <ul className="d-flex text-center justify-content-center">
                        {progressbarData.map((item, index) => {
                            return (
                                <li
                                    key={index}
                                    className={`${item.cls}-status text-end pr5`}
                                    style={{ width: `${item.value}%` }}
                                >
                                    {item.value}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </td>
        ),
    },
    {
        field: 'engagement',
        filtervalue: 'string',
        title: 'Engagement',
        width: 150,
        filter: 'text',
        cell: ({ dataItem }) => (
            <td>
                {engagementStatus.map((item, index) => {
                    return (
                        <div className="d-flex align-items-center mb10 justify-content-center">
                            <i
                                className={`${item.icon} color-primary-blue d-flex align-items-center justify-content-center`}
                            ></i>
                            <small className="ml5">{item.value}</small>
                        </div>
                    );
                })}
            </td>
        ),
    },
    {
        field: 'conversion',
        filtervalue: 'string',
        title: 'Conversion',
        className: 'text-end',
        width: 120,
        filter: 'text',
    },
    {
        field: 'ratings',
        filtervalue: 'string',
        title: 'Ratings',
        className: 'text-end',
        width: 100,
        filter: 'text',
    },
];
export const POST_SUMMARY_OTHERS_GRID_DATA = [
    {
        postsTitle: 'Weekend surprise! Flat 20% off on accessories',
        small: mFulltimeSubt_02,
        contentType: social_post_large,
        reach: '',
        engagement: '',
        conversion: '821',
        ratings: '3.0',
    },
    {
        postsTitle: 'Happy holidays!',
        small: mFulltimeSubt_03,
        contentType: link_large,
        reach: '',
        engagement: '',
        conversion: '121',
        ratings: '4.0',
    },
    {
        postsTitle: 'Happy new year!',
        small: mFulltimeSubt_04,
        contentType: link_large,
        reach: '',
        engagement: '',
        conversion: '72',
        ratings: '6.2',
    },
];

export const stateReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE':
            return {
                ...state,
                [action.field]: action.payload,
            };
        default:
            return state;
    }
};

export const getPreviewData = async (dispatch, setState, payload, data, channelDetail) => {
    if (data !== 'overview') {
        setState((pre) => ({ ...pre, isClickMapModal: true, isPreviewLoading: true, previewData: '' }));
        const response = await dispatch(getHeatMapContentDetails(payload));
        if (response?.status) {
            setState((pre) => ({
                ...pre,
                isClickMapModal: true,
                isPreviewLoading: false,
                previewData: response?.data,
            }));
        } else {
            setState((pre) => ({ ...pre, isClickMapModal: true, isPreviewLoading: false, previewData: '' }));
        }
    } else {
        const resolvedChannelInfo =
            channelDetail?.splitChannelLevelInfo?.find((info) => info?.blastShortCode === payload?.blastId) ||
            channelDetail?.channelInfos?.find((info) => info?.blastShortCode === payload?.blastId);
        const resolvedChannelDetailId = resolvedChannelInfo?.channelDetailid || payload?.channelDetailId || 0;
        const previewPayload = {
            userId: payload.userId,
            departmentId: payload.departmentId,
            clientId: payload.clientId,
            campaignId: payload.campaignId,
            channelId: payload.channelId || 0,
            levelNumber: payload.levelNumber || 1,
            ChannelDetailID: resolvedChannelDetailId,
        };

        setState((pre) => ({
            ...pre,
            isOverviewPreviewModal: true,
            isPreviewLoading: true,
            previewData: '',
            imagePath: '',
        }));

        const response = await dispatch(Get_Preview_By_Channel(previewPayload, false));
        if (response?.status && response?.data) {
            const previewDataFromApi = response?.data?.[0] || {};
            const currentBlastId = payload.blastId;
            const currentChannelInfo = channelDetail?.channelInfos?.find(
                (info) => info.blastShortCode === currentBlastId,
            );
            const scheduleDate =
                currentChannelInfo?.scheduleDate ||
                previewDataFromApi?.scheduleDate ||
                previewDataFromApi?.scheduleDateTime;

            setState((pre) => ({
                ...pre,
                isOverviewPreviewModal: true,
                isPreviewLoading: false,
                previewData: previewDataFromApi?.content,
                imagePath: previewDataFromApi?.imagePath || previewDataFromApi?.mediaurl,
                date: scheduleDate,
                subject: previewDataFromApi?.subject,
                carouselJSON: previewDataFromApi?.carouselJSON,
                isCarousel: previewDataFromApi?.isCarousel || false,
                header: previewDataFromApi?.header,
                footer: previewDataFromApi?.footer,
                footerContent: previewDataFromApi?.footerContent,
                senderName: previewDataFromApi?.senderName,
                notifications: response?.data || undefined,
                notification: previewDataFromApi || undefined,
                slides: response?.data || undefined,
                contentJson: previewDataFromApi?.contentjson || '',
            }));
        } else {
            setState((pre) => ({
                ...pre,
                previewData: '',
                isOverviewPreviewModal: true,
                isPreviewLoading: false,
                imagePath: '',
            }));
        }
    }
};

export const getDaywiseChartData = (data, size = 'bubble') => {
    const chartData = parseAnalyticsJson(data, {});
    const seriesData =
        !!chartData &&
        Object?.entries(chartData)?.map(([key, value]) => {
            return {
                name: key.charAt(0).toUpperCase() + key.slice(1, 9),
                value: Number(value),
            };
        });

    let chart = {
        height: chartSizing[size] ?? 200,
        series: seriesData,
    };

    return data !== undefined ? chart : {};
};

export const getHoursWiseChartData = (chartData, size = 'footer') => {
    const data = Array.isArray(chartData) ? chartData : parseAnalyticsJsonArray(chartData, []);
    const hourRows = Array.isArray(data) ? data : [];
    if (hourRows.length) {
        let result = [];
        for (let i = 0; i < hourRows.length; i++) {
            let nextIndex = (i + 1) % hourRows.length;
            let sum = Number(hourRows[i]?.hourWiseCount) + Number(hourRows[nextIndex]?.hourWiseCount);
            result.push(sum);
        }
        const sortedResult = result?.slice()?.sort((a, b) => b - a);

        let max = sortedResult[0];
        let secondMax = sortedResult[1];
        let thirdMax = sortedResult[2];
        let fourthMax = sortedResult[3];
        const updatedData =
            hourRows.length &&
            hourRows.map((item, id) => ({
                hour: item?.hour,
                hourWiseCount: item?.hourWiseCount,
                count: result[id],
            }));

        let Series = [
            {
                from: 0,
                to: 24,
                color: '#e8e8ea',
                outerRadius: '105%',
                thickness: '5%',
            },
            ...updatedData?.map((item) => ({
                from: Number(item?.hour),
                to: Number(item?.hour) + 1,
                color:
                    item.count == max
                        ? ch_primary_green
                        : item.count == secondMax
                          ? ch_secondary_green
                          : item.count == thirdMax
                            ? ch_clockchart1
                            : item.count == fourthMax
                              ? ch_clockchart2
                              : '#e8e8ea',
                outerRadius: '105%',
                thickness: '5%',
            })),
        ];

        let dataVal = updatedData.filter((item) => item.count == max);

        let byHours = {
            height: chartSizing[size] ?? 290,
            series: Series,
            data: [Number(dataVal[0]?.hour), Number(dataVal[0]?.hour) + 1],
        };

        return byHours;
    } else {
        return {};
    }
};

export const SEGMENT_ENABLED_CAMPAIGNS = [1, 2, 8, 14, 21, 25, 26, 41];
