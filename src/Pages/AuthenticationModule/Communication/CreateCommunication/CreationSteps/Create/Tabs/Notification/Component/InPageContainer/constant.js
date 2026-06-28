const bannerListCache = new Map();
const bannerListInflight = new Map();

export const getSyncBannerCacheKey = ({ type = 'web', domainName = '', appId = '' } = {}) =>
    `${type}|${domainName}|${appId}`;

/** Web uses domain URL; mobile uses app GUID — both required before SyncBannerDetails. */
export const canFetchSyncBannerList = ({ type = 'web', domainName = '', appId = '' } = {}) => {
    if (type === 'mobile') {
        return !!(appId && String(appId).trim());
    }
    return !!(domainName && String(domainName).trim());
};

export const buildSyncBannerPayload = ({ type = 'web', domainName = '', appId = '' } = {}) => ({
    appId: type === 'mobile' ? appId : '',
    bannerName: '',
    bannerSize: '',
    domainName: type !== 'mobile' ? domainName : '',
});

export const formatSyncBannerList = (rawList = []) =>
    rawList.map((banner) => ({
        ...banner,
        bannerName: banner.bannerSize
            ? `${banner.bannerName} (${banner.bannerSize})`
            : banner.bannerName,
    }));

export const hasSyncBannerCache = (cacheKey) => bannerListCache.has(cacheKey);

export const getSyncBannerListFromCache = (cacheKey) => bannerListCache.get(cacheKey) ?? null;

export const invalidateSyncBannerCache = (cacheKey) => {
    if (!cacheKey) return;
    bannerListCache.delete(cacheKey);
    bannerListInflight.delete(cacheKey);
};

/** Load banner list once per domain; dedupes parallel requests (e.g. split A/B). */
export const loadSyncBannerList = async (cacheKey, fetcher, { forceRefresh = false } = {}) => {
    if (!cacheKey) return [];

    if (forceRefresh) {
        invalidateSyncBannerCache(cacheKey);
    }

    if (bannerListCache.has(cacheKey)) {
        return bannerListCache.get(cacheKey);
    }

    if (bannerListInflight.has(cacheKey)) {
        return bannerListInflight.get(cacheKey);
    }

    const request = Promise.resolve(fetcher())
        .then((list) => {
            const formatted = formatSyncBannerList(list);
            if (formatted.length > 0) {
                bannerListCache.set(cacheKey, formatted);
            } else {
                bannerListCache.delete(cacheKey);
            }
            bannerListInflight.delete(cacheKey);
            return formatted;
        })
        .catch((err) => {
            bannerListInflight.delete(cacheKey);
            throw err;
        });

    bannerListInflight.set(cacheKey, request);
    return request;
};

export const pickBannerFromList = (bannerList, raw) => {
    if (!raw?.bannerId || !Array.isArray(bannerList) || !bannerList.length) {
        return null;
    }
    return bannerList.find((b) => Number(b.bannerId) === Number(raw.bannerId)) || null;
};

export const getLatestBannerFromList = (bannerList) => {
    if (!Array.isArray(bannerList) || !bannerList.length) {
        return null;
    }
    return bannerList.reduce(
        (latest, banner) => (Number(banner?.bannerId) > Number(latest?.bannerId) ? banner : latest),
        bannerList[0],
    );
};

/** Sample API response (dev / reference only). */
export const GET_SYNC_BANNER_DETAILS_RESPONSE = {
  "status": true,
  "message": "success",
  "data": [
    {
      "bannerId": 53,
      "appId": "87b5584d-8aa6-4e6e-a06f-1839324d5781",
      "domainName": null,
      "bannerName": "Test_Banners_2",
      "bannerSize": "200x200",
      "channelId": 0,
      "campaignID": null,
      "priority": 0,
      "tenantId": null,
      "passportId": null,
      "deviceId": null,
      "deviceOs": null,
      "deviceType": null,
      "browerType": null,
      "profileId": null,
      "pushNotifyChannelDetailID": null,
      "webNotifyChannelID": null,
      "impressionCount": 0,
      "jobid": 0,
      "visitorCount": 0,
      "scheduleTime": null
    }
  ]
};
