export const CHANNEL_METRICS_CONFIG = {
    // Email (channelId: 1)
    1: {
        reach: 'uniqueOpens',
        engagement: 'uniqueClicks',
        conversion: 'conversion',
    },
    // SMS (channelId: 2)
    2: {
        reach: 'deliveredCount',
        engagement: 'repliedCount',
        conversion: 'conversion',
    },
    // QR Code (channelId: 3)
    3: {
        reach: 'avgScansPerDay',
        engagement: 'interactionCount',
        conversion: 'conversion',
    },
    // Social Media (channelId: 5)
    5: {
        reach: null, // Social media doesn't have reach
        engagement: 'interactionCount',
        conversion: 'conversionCount',
    },
    // Web Push (channelId: 8)
    8: {
        reach: 'deliveredCount',
        engagement: 'clicksCount',
        conversion: 'conversion',
    },
    // Mobile Push (channelId: 9)
    9: {
        reach: 'totalDeliveredCount',
        engagement: 'clicks',
        conversion: 'conversion',
    },
    // Paid Media (channelId: 10)
    10: {
        reach: null, // Paid media doesn't have reach
        engagement: 'interactionCount',
        conversion: 'conversionCount',
    },
    // Mobile Push (channelId: 14)
    14: {
        reach: 'totalDeliveredCount',
        engagement: 'clicks',
        conversion: 'conversion',
    },
    // WhatsApp (channelId: 21)
    21: {
        reach: 'deliveredCount',
        engagement: 'linkClickCount',
        conversion: 'conversion',
    },
    // RCS (channelId: 41)
    41: {
        reach: 'deliveredCount',
        engagement: 'linkClickCount',
        conversion: 'conversionCount',
    },
};

export const getChannelMetric = (channelId, metricType) => {
    const channelConfig = CHANNEL_METRICS_CONFIG[channelId];
    if (!channelConfig) {
        return null;
    }
    return channelConfig[metricType] || null;
};

