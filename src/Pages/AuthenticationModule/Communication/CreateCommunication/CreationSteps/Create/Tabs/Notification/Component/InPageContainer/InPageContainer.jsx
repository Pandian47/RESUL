import { CLICK_TO_CONFIGURE } from 'Constants/GlobalConstant/Placeholders';
import { event_tracking_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { getSessionId } from 'Reducers/globalState/selector';
import { getSyncBannerDetails } from 'Reducers/communication/createCommunication/Create/request';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getInPageBannerFieldName } from '../../constant';
import {
    buildSyncBannerPayload,
    getSyncBannerCacheKey,
    getSyncBannerListFromCache,
    getLatestBannerFromList,
    hasSyncBannerCache,
    invalidateSyncBannerCache,
    loadSyncBannerList,
    pickBannerFromList,
    canFetchSyncBannerList,
} from './constant';

const getInitialBannerList = (data, type) => {
    const domainName = data?.domainName || '';
    const appId = type === 'mobile' ? data?.appId || '' : '';
    const cacheKey = getSyncBannerCacheKey({ type, domainName, appId });
    if (canFetchSyncBannerList({ type, domainName, appId }) && hasSyncBannerCache(cacheKey)) {
        const cached = getSyncBannerListFromCache(cacheKey);
        if (cached?.length) {
            return cached;
        }
    }
    return [];
};

const InPageContainer = ({ data, type, onBannerSelect, fieldName = '' }) => {
    const dispatch = useDispatch();
    const { departmentId } = useSelector((state) => getSessionId(state));
    const { control, setValue, getValues } = useFormContext();

    const inPageBannerName = getInPageBannerFieldName();

    const [bannerList, setBannerList] = useState(() => getInitialBannerList(data, type));
    const [loading, setLoading] = useState(false);
    const [showTrackingAgreement, setShowTrackingAgreement] = useState(false);

    const openedTabRef = useRef(null);
    const tabClosePollRef = useRef(null);
    const onBannerSelectRef = useRef(onBannerSelect);
    const bindLatestAfterWebsiteRef = useRef(false);
    const prevFetchIdentityRef = useRef(null);
    const prevCacheKeyRef = useRef(null);
    const hasAppliedEditBannerRef = useRef(false);
    onBannerSelectRef.current = onBannerSelect;

    useEffect(() => {
        hasAppliedEditBannerRef.current = false;
    }, [inPageBannerName]);

    const getRequestMeta = () => {
        const domainName = data?.domainName || '';
        const appId = type === 'mobile' ? data?.appId || '' : '';
        const cacheKey = getSyncBannerCacheKey({ type, domainName, appId });
        return { domainName, appId, cacheKey };
    };

    const fetchBannerListFromApi = async () => {
        const { domainName, appId } = getRequestMeta();
        const response = await dispatch(
            getSyncBannerDetails({
                payload: buildSyncBannerPayload({ type, domainName, appId }),
            }),
        );
        return response?.status && response.data ? response.data : [];
    };

    const bindBannerToListItem = (list, raw) => {
        if (!raw || !list?.length) {
            return false;
        }
        const matched = pickBannerFromList(list, raw);
        if (matched) {
            setValue(inPageBannerName, matched);
            onBannerSelectRef.current?.(matched);
            return true;
        }
        if (raw.bannerId || raw.bannerName) {
            setValue(inPageBannerName, raw);
            onBannerSelectRef.current?.(raw);
            return true;
        }
        return false;
    };

    const applyEditBannerIfNeeded = (list) => {
        if (!list?.length) {
            return;
        }
        const current = getValues(inPageBannerName);
        if (current?.bannerId || current?.bannerName) {
            bindBannerToListItem(list, current);
            hasAppliedEditBannerRef.current = true;
            return;
        }
        if (hasAppliedEditBannerRef.current) {
            return;
        }
        const editId = data?.editDetails?.bannerId;
        if (!editId || editId <= 0) {
            return;
        }
        if (bindBannerToListItem(list, data.editDetails)) {
            hasAppliedEditBannerRef.current = true;
        }
    };

    const applyLatestBannerAfterWebsite = (list) => {
        if (!bindLatestAfterWebsiteRef.current || !list?.length) {
            return;
        }
        const latest = getLatestBannerFromList(list);
        if (latest) {
            setValue(inPageBannerName, latest);
            onBannerSelectRef.current?.(latest);
        }
        bindLatestAfterWebsiteRef.current = false;
    };

    const applyBannerList = async ({ forceRefresh = false } = {}) => {
        const { domainName, appId, cacheKey } = getRequestMeta();

        if (!canFetchSyncBannerList({ type, domainName, appId })) {
            setBannerList([]);
            return;
        }

        if (!forceRefresh && hasSyncBannerCache(cacheKey)) {
            const cached = getSyncBannerListFromCache(cacheKey);
            if (cached?.length) {
                setBannerList(cached);
                applyEditBannerIfNeeded(cached);
                applyLatestBannerAfterWebsite(cached);
                return;
            }
        }

        setLoading(true);
        try {
            const list = await loadSyncBannerList(cacheKey, fetchBannerListFromApi, { forceRefresh });
            setBannerList(list);
            applyEditBannerIfNeeded(list);
            applyLatestBannerAfterWebsite(list);
        } catch {
            setBannerList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const { domainName, appId, cacheKey } = getRequestMeta();
        const fetchIdentity = type === 'mobile' ? String(appId || '').trim() : String(domainName || '').trim();

        if (!canFetchSyncBannerList({ type, domainName, appId })) {
            setBannerList([]);
            prevFetchIdentityRef.current = null;
            prevCacheKeyRef.current = null;
            return;
        }

        const isIdentityChange =
            prevFetchIdentityRef.current !== null && prevFetchIdentityRef.current !== fetchIdentity;

        if (isIdentityChange && prevCacheKeyRef.current) {
            invalidateSyncBannerCache(prevCacheKeyRef.current);
            setValue(inPageBannerName, null);
            onBannerSelectRef.current?.({ bannerId: '', bannerName: '' });
            hasAppliedEditBannerRef.current = false;
        }

        prevFetchIdentityRef.current = fetchIdentity;
        prevCacheKeyRef.current = cacheKey;

        if (!isIdentityChange && hasSyncBannerCache(cacheKey)) {
            const cached = getSyncBannerListFromCache(cacheKey);
            if (cached?.length) {
                setBannerList(cached);
                applyEditBannerIfNeeded(cached);
                return;
            }
        }

        let cancelled = false;

        const run = async () => {
            setLoading(true);
            try {
                const list = await loadSyncBannerList(cacheKey, fetchBannerListFromApi, {
                    forceRefresh: isIdentityChange,
                });
                if (!cancelled) {
                    setBannerList(list);
                    applyEditBannerIfNeeded(list);
                }
            } catch {
                if (!cancelled) {
                    setBannerList([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.domainName, data?.appId, type]);

    useEffect(() => {
        return () => {
            if (tabClosePollRef.current) {
                window.clearInterval(tabClosePollRef.current);
                tabClosePollRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const pickFromList = (raw) => {
            if (!raw?.bannerId || !Array.isArray(bannerList) || !bannerList.length) {
                return null;
            }
            return bannerList.find((b) => Number(b.bannerId) === Number(raw.bannerId)) || null;
        };

        const latestBanner = Array.isArray(bannerList) && bannerList.length
            ? bannerList.reduce((latest, banner) => (
                Number(banner?.bannerId) > Number(latest?.bannerId) ? banner : latest
            ), bannerList[0])
            : null;

        const rawBannerFromData = data?.bannerDetails?.bannerId
            ? data.bannerDetails
            : (data?.editDetails?.bannerId > 0 ? data.editDetails : null);
        const currentFormBanner = getValues('inPageBanner');
        const rawBanner = rawBannerFromData?.bannerId ? rawBannerFromData : currentFormBanner;

        const shouldBindLatest = bindLatestAfterWebsiteRef.current;
        const resolvedFromRaw = pickFromList(rawBanner);
        const resolvedBanner = resolvedFromRaw || (shouldBindLatest ? latestBanner : null);
        setValue('inPageBanner', resolvedBanner);

        if (shouldBindLatest && resolvedBanner?.bannerId) {
            bindLatestAfterWebsiteRef.current = false;
        }

        if (
            resolvedBanner?.bannerId &&
            Number(rawBanner?.bannerId) !== Number(resolvedBanner?.bannerId)
        ) {
            onBannerSelectRef.current?.(resolvedBanner);
        }

        if (
            resolvedBanner?.bannerId &&
            Number(rawBanner?.bannerId) === Number(resolvedBanner?.bannerId) &&
            String(rawBanner?.bannerName || '') !== String(resolvedBanner?.bannerName || '')
        ) {
            onBannerSelectRef.current?.(resolvedBanner);
        }
    }, [
        bannerList,
        data?.bannerDetails,
        data?.bannerDetails?.bannerId,
        data?.bannerDetails?.bannerName,
        data?.editDetails?.bannerId,
        data?.editDetails?.bannerName,
        getValues,
        setValue,
    ]);

    const fetchBannerDetails = async () => {
        setLoading(true);

        const payload = {
            appId: type === 'mobile' ? (data?.appId || '') : '',
            bannerName: '',
            bannerSize: '',
            domainName: type !== 'mobile' ? (data?.domainName || '') : '',
        };

        try {
            const response = await dispatch(getSyncBannerDetails({ payload }));

            // Check if response has data
            if (response && response?.status && response?.data) {
                // Append bannerSize to bannerName for each banner
                const bannersWithSize = response?.data?.map((banner) => ({
                    ...banner,
                    bannerName: banner.bannerSize 
                        ? `${banner.bannerName} (${banner.bannerSize})` 
                        : banner.bannerName
                }));
                setBannerList(bannersWithSize);
            } else {
                setBannerList([]);
            }
        } catch (error) {
            setBannerList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBannerChange = (e) => {
        const selectedBanner = e.value ?? null;
        setValue(inPageBannerName, selectedBanner);
        onBannerSelectRef.current?.(selectedBanner);
    };

    const handleTrackingAgreement = (isAgree) => {
        setShowTrackingAgreement(false);
        if (!isAgree) return;

        const selectedBanner = getValues(inPageBannerName);
        const selectedDomain = selectedBanner?.domainName || data?.domainName || '';
        if (!selectedDomain) return;

        const reqs = localStorage.getItem('accessToken') || '';
        const bannerId = selectedBanner?.bannerId || 0;
        const bannerName = selectedBanner?.bannerName || '';
        const currentHost = window.location.host;
        const redurl = `${currentHost}/communication/create`;
        const path = '/communication/create';
        const paramsToEncrypt = `dzone|${reqs}|${bannerId}|${departmentId}|${bannerName}|${redurl}`;
        const encryptedParams = `rfg${btoa(paramsToEncrypt)}rd`;
        const campaignId = Math.floor(Math.random() * 1000 + 1);
        const baseUrl = /^https?:\/\//i.test(selectedDomain) ? selectedDomain : `https://${selectedDomain}`;
        const cleanUrl = baseUrl.replace(/\/$/, '');
        const urlStr = `${cleanUrl}?_sdxFormId=${btoa(campaignId.toString())}&sdk_mode=${encryptedParams}&path=${encodeURIComponent(path)}&webft=true&dzoneadd=true`;
        localStorage.setItem('fdomain', urlStr);

        const opened = window.open(urlStr, '_blank');
        opened?.focus();
        openedTabRef.current = opened || null;

        if (tabClosePollRef.current) {
            window.clearInterval(tabClosePollRef.current);
            tabClosePollRef.current = null;
        }

        if (openedTabRef.current) {
            tabClosePollRef.current = window.setInterval(() => {
                if (!openedTabRef.current || openedTabRef.current.closed) {
                    if (tabClosePollRef.current) {
                        window.clearInterval(tabClosePollRef.current);
                        tabClosePollRef.current = null;
                    }
                    openedTabRef.current = null;
                    bindLatestAfterWebsiteRef.current = true;
                    applyBannerList({ forceRefresh: true });
                }
            }, 1000);
        }
    };

    return (
        <div className="form-group">
            <Row>
                <Col sm={{ offset: 1, span: 2 }}>
                    <label className="control-label-left">In-page banner</label>
                </Col>
                <Col sm={6} id={fieldName ? `rs_inpage_banner_${fieldName}` : 'rs_inpage_banner'}>
                    <RSKendoDropDownList
                        control={control}
                        name={inPageBannerName}
                        data={bannerList}
                        textField="bannerName"
                        dataItemKey="bannerId"
                        label="Select banner"
                        required
                        isLoading={loading}
                        rules={{
                            required: 'Please select a banner',
                        }}
                        handleChange={handleBannerChange}
                    />
                </Col>
                <Col sm={1} className="pl0 align-items-end d-flex">
                    <RSTooltip text={CLICK_TO_CONFIGURE} className="d-inline-flex lh0">
                        <i
                            className={`${event_tracking_medium} icon-md color-primary-blue cursor-pointer`}
                            onClick={() => setShowTrackingAgreement(true)}
                        />
                    </RSTooltip>
                </Col>
            </Row>
            <RSModal
                show={showTrackingAgreement}
                handleClose={() => setShowTrackingAgreement(false)}
                header={'Dynamic zone'}
                size="lg"
                body={
                    <p>
                        By proceeding, you acknowledge that Dynamic Zone tracking is supported only with static IDs.
                        Dynamic IDs are not supported and may result in unreliable event tracking.
                        You are solely responsible for the accuracy and integrity of all captured data and events.
                    </p>
                }
                footer={
                    <>
                        <RSSecondaryButton
                            type="button"
                            onClick={() => handleTrackingAgreement(false)}
                        >
                            Disagree
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="button"
                            onClick={() => handleTrackingAgreement(true)}
                        >
                            I Agree
                        </RSPrimaryButton>
                    </>
                }
            />
        </div>
    );
};

export default InPageContainer;
