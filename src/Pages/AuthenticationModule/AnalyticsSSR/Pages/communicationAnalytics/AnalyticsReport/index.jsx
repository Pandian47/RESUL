import { getChannelId, PAID_CHANNEL_LIST, CHANNELS_LIST } from 'Utils/modules/communicationChannels';
import { getCreatedDate, getUserCurrentFormat, getFileDownloadDateTime } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { addTabKey, getChannelTitle, handleSnapshot } from './constants';
import { ANALYTICS_CUSTOMER_CLICK, ANALYTICS_CUSTOMER_QR_SCAN, ANALYTICS_PROGRESS_TEXT, AS_ON, DATA_DISCALIMER, DATA_DISCLAIMER_FOOTER_TEXT, ENTER_NAME_HERE, INFO, NAME_YOUR_SNAPSHOT, OK, OVERVIEW, SELECT } from 'Constants/GlobalConstant/Placeholders';
import { circle_close_edge_medium, circle_close_fill_mini, circle_close_mini, circle_tick_medium, in_progress_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import { Col, Container, Row } from 'react-bootstrap';

import { useNavigate, useLocation } from 'react-router-dom';
import RSIcon from 'Components/RSIcon';
import RSPageHeader from 'Components/RSPageHeader';
import CommunicationAnalysisTable from './Components/CommunicationAnalysis/Components/CommunicationAnalysisTable';

import { getChannelMetric } from 'Utils/channelMetricsConfig';
import BenchMark from './Components/BenchMark';
import CommunicationAnalysis from './Components/CommunicationAnalysis';
import CommunicationImpact from './Components/CommunicationImpact';
import PerformanceAndInsights from './Components/PerformanceAndInsights';
import Overview from './Components/Overview';
import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import RSLoader from 'Components/Loader';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import { FormProvider, useForm } from 'react-hook-form';
import { getSummaryList, getRetargetListStatus } from 'Reducers/analyticsSSR/analyticsSummary/selector';

import { useDispatch, useSelector } from 'react-redux';
import { getCommunicationSummary, getGoldenCampaign, getGeography, GetRetargetListStatus, getSnapNameList, getSnapDetails } from 'Reducers/analyticsSSR/analyticsSummary/request';
import HeaderIcons from './Components/HeaderIcons';
import RoiChart from './Components/Overview/Components/RoiChart';
import { getSessionId } from 'Reducers/globalState/selector';
import { resetCSRState, updateSummarySubSegmentDetail } from 'Reducers/analyticsSSR/analyticsSummary/reducer';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import { skeletonShellSharedCriticalCss } from 'Components/Skeleton/Components/common';
import {
    AnalyticsReportPageContentSkeleton,
    analyticsReportSkeletonCriticalCss,
    analyticsReportLiveSkeletonCriticalCss,
    ANALYTICS_REPORT_LOADING_HOLDER_STYLE,
} from 'Components/Skeleton/pages/analytics';

//PDF
import { PDFExport, savePDF } from '@progress/kendo-react-pdf';
import useQueryParams from 'Hooks/useQueryParams';
import { reset_failures_API_Errors } from 'Reducers/globalState/reducer';
import { SkeletonTable } from 'Components/Skeleton/Skeleton';
import { getSortedChannels } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';
import { preparePdfExport } from 'Pages/AuthenticationModule/Analytics/Pages/communicationAnalytics/AnalyticsReport/utils/pdfIframeSnapshot';
import { scrollAnalyticsPageToTop } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
//PDF

export const AnalyticsReportProvider = createContext({});

const AnalyticsReport = () => {
    const refAPIStatus = useRef({
        preventOtherApiCall: false,
        firstTimeAPICalled: false,
    });
    const lastCSRLoadKeyRef = useRef(null);
    const lastUpdateMetaDataSnapshotRef = useRef({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    // const { state } = useLocation();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { summaryLoading } = useSelector((state) => state.analyticsReportSSRReducer);

    useLayoutEffect(() => {
        scrollAnalyticsPageToTop();
    }, [location?.pathname, location?.search]);

    //PDF
    const pdfContainer = useRef(null);
    const pdfExportComponent = useRef(null);
    const state = useQueryParams('/analytics/analytics-report');
    const exportPDFWithMethod = () => {
        if (pdfExportComponent.current) {
            let element = pdfContainer.current || document.body.childNodes[1].childNodes[1].childNodes[0].childNodes[1];
            savePDF(element, {
                paperSize: 'A4',
                margin: 40,
                fileName: `${state?.campaignName} for ${new Date().getFullYear()}`,
            });
        }
    };
    const exportPDFWithComponent = () => {
        if (!pdfExportComponent.current) return;

        const errorKeywords = ['font', 'pdf', 'cannot load', 'err_invalid_url', 'data:application/font'];
        let errorCaught = false;
        let cleanupTimeout = null;

        const isPDFError = (...texts) => {
            const combined = texts.filter(Boolean).join(' ').toLowerCase();
            return errorKeywords.some((keyword) => combined.includes(keyword));
        };

        const cleanupStyles = () => {
            pdfExportComponent?.current?.rootElForPDF?.querySelectorAll('*').forEach((element) => {
                if (element.getAttribute('style')?.trim() === 'transform: none !important; transition: none !important;') {
                    element.removeAttribute('style');
                }
            });
        };

        const cleanupFns = [];
        const registerCleanup = (fn) => cleanupFns.push(() => {
            try {
                fn();
            } catch (error) {
            }
        });

        const runCleanup = () => {
            cleanupFns.forEach((fn) => fn());
            cleanupStyles();
        };

        const handlePDFError = (errorDetails) => {
            if (errorCaught) return;
            errorCaught = true;
            setIsDownload(false);
            clearTimeout(cleanupTimeout);
            runCleanup();
        };

        const detachFontDataRules = () => {
            const removedFontRules = [];
            const modifiedStyles = [];

            try {
                Array.from(document.styleSheets).forEach((sheet, sheetIndex) => {
                    try {
                        const rules = Array.from(sheet.cssRules || sheet.rules || []);
                        for (let i = rules.length - 1; i >= 0; i -= 1) {
                            const rule = rules[i];
                            const isFontFaceRule =
                                (typeof CSSRule !== 'undefined' && rule?.type === CSSRule.FONT_FACE_RULE) ||
                                (typeof CSSFontFaceRule !== 'undefined' && rule instanceof CSSFontFaceRule);
                            if (!isFontFaceRule) continue;

                            const src = rule.style?.getPropertyValue('src') || rule.style?.src || '';
                            if (src.includes('data:application/font')) {
                                removedFontRules.push({ sheetIndex, cssText: rule.cssText, index: i });
                                sheet.deleteRule(i);
                            }
                        }
                    } catch {
                        // Ignore cross-origin stylesheets
                    }
                });

                document.querySelectorAll('style').forEach((styleEl) => {
                    const content = styleEl.textContent || styleEl.innerHTML;
                    if (!content?.includes('data:application/font')) return;

                    const modifiedContent = content.replace(
                        /@font-face\s*\{[^}]*src\s*:\s*url\(['"]?data:application\/font[^)]*\)[^}]*\}/gi,
                        '',
                    );
                    if (modifiedContent !== content) {
                        modifiedStyles.push({ element: styleEl, content });
                        styleEl.textContent = modifiedContent;
                    }
                });
            } catch (error) {
            }

            return () => {
                removedFontRules.forEach(({ sheetIndex, cssText, index }) => {
                    try {
                        const sheet = document.styleSheets[sheetIndex];
                        if (sheet) {
                            sheet.insertRule(cssText, Math.min(index, sheet.cssRules.length));
                        }
                    } catch {
                        // Restore best-effort only
                    }
                });

                modifiedStyles.forEach(({ element, content }) => {
                    if (element && content !== undefined) {
                        element.textContent = content;
                    }
                });
            };
        };

        try {
            const originalErrorHandler = window.onerror;
            registerCleanup(() => (window.onerror = originalErrorHandler));

            const restoreFonts = detachFontDataRules();
            registerCleanup(restoreFonts);

            const errorHandler = (message, source, lineno, colno, error) => {
                if (isPDFError(message, toString())) {
                    handlePDFError({ type: 'window.onerror', message, source, lineno, colno, error });
                    return true;
                }
                return originalErrorHandler?.(message, source, lineno, colno, error) || false;
            };
            window.onerror = errorHandler;

            const unhandledRejectionHandler = (event) => {
                const { reason } = event;
                if (isPDFError(reason?.message, reason?.toString())) {
                    handlePDFError({ type: 'unhandledrejection', reason });
                    event.preventDefault();
                }
            };
            window.addEventListener('unhandledrejection', unhandledRejectionHandler);
            registerCleanup(() => window.removeEventListener('unhandledrejection', unhandledRejectionHandler));

            const networkErrorHandler = (event) => {
                const resourceUrl = event.target?.src || event.target?.href || '';
                if (isPDFError(event.message, event.toString(), resourceUrl)) {
                    handlePDFError({ type: 'network error', message: event.message, resourceUrl });
                }
            };
            window.addEventListener('error', networkErrorHandler, true);
            registerCleanup(() => window.removeEventListener('error', networkErrorHandler, true));

            const triggerPDFSave = () => {
                const rootEl = pdfExportComponent.current?.rootElForPDF;

                preparePdfExport(rootEl)
                    .then((restoreLayout) => {
                        if (typeof restoreLayout === 'function') {
                            registerCleanup(restoreLayout);
                        }

                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                try {
                                    pdfExportComponent.current?.save();
                                    cleanupTimeout = setTimeout(() => !errorCaught && runCleanup(), 10000);
                                } catch (saveError) {
                                    handlePDFError({ type: 'save error', error: saveError });
                                }
                            });
                        });
                    })
                    .catch((saveError) => {
                        handlePDFError({ type: 'save error', error: saveError });
                    });
            };

            // Run after font cleanup takes effect
            setTimeout(triggerPDFSave, 0);
            } catch (error) {
                setIsDownload(false);
        }
    };
    //PDF
    // const state = { from: 65889 };

    const summary = useSelector((state) => getSummaryList(state));
    const retargetListStatus = useSelector((state) => getRetargetListStatus(state));
    const { summarySubSegmentDetail, retargetListLoading, snapshotList } = useSelector(({ analyticsReportSSRReducer }) => analyticsReportSSRReducer);
    const { subSegmentDetailInDetailPage } = useSelector(({ analyticsDetailsSSR }) => analyticsDetailsSSR);

    // const summary = CampaignSummaryList.campaignSummaryList;
    const [overviewConfig, setOverviewConfig] = useState({
        total: 0,
        detailViewChannel: [],
        data: [],
    });

    const goalPerformance = _get(summary, 'goalPerformance', {});
    const shouldShowRoiChart =
        (_get(goalPerformance, 'goalStatus', '') || '').toString().toUpperCase() === 'C';
    const roiCampaignType = summary?.campaignType?.toUpperCase();
    const showRoiAttribution = roiCampaignType === 'S' || roiCampaignType === 'M'; // T and others: ROI Attribution hidden

    const methods = useForm();
    const { control, getValues } = methods;
    const [analyticsTab, setAnalyticsTab] = useState([]);
    const [analyticsTabAlert, setAnalyticsTabAlert] = useState(false);
    const [snapshotStatus, setSnapshotStatus] = useState({
        dropdownList: handleSnapshot,
        TASstatus: false,
    });
    const [isDownloadUI, setIsDownload] = useState(false);
    const [isPdfExporting, setIsPdfExporting] = useState(false);

    const [golden, setGolden] = useState({ modal: false, status: summary?.isGoldenCampaign || false });

    const benchRef = useRef();
    // const dateField = `${dateFormat(summary?.startDate, 'formatDate')} - ${dateFormat(summary?.endDate, 'formatDate')}`;
    const snapStart = summary?.isFromSnapshot && summary?.snapMetaData?.startDate != null
        ? summary?.snapMetaData.startDate
        : summary?.startDate;
    const snapEnd = summary?.isFromSnapshot && summary?.snapMetaData?.endDate != null
        ? summary?.snapMetaData.endDate
        : summary?.endDate;
    const dateField = `${getUserCurrentFormat(snapStart)?.dateFormat} - ${getUserCurrentFormat(snapEnd)?.dateFormat}`;

    const getRetargetStatusForChannel = (channelId) => {
        if (!retargetListStatus || !Array.isArray(retargetListStatus) || retargetListStatus.length === 0) {
            return false;
        }
        const channelStatus = retargetListStatus.find(item => item.channelId === parseInt(channelId));
        return channelStatus ? channelStatus.status : false;
    };

    const handleSnapshotBack = () => {
        handleSummaryPageAPI();
    };

    const handleSummaryPageAPI = async (subSegmentLevel, isSubSegment) => {
        let payload = {
            campaignId: state?.from,
            analyticsType: 1,
            userId,
            clientId,
            // channelId: [1, 2, 3, 8, 9, 21, 25],
            departmentId,
        };

        if (payload && state?.from) {
            payload = {
                ...payload,
                subSegmentLevel:
                    subSegmentLevel ??
                    state?.subSegmentLevel ??
                    summarySubSegmentDetail?.subSegmentLevel ??
                    subSegmentDetailInDetailPage?.subSegmentLevel ??
                    0,
            };
            const {status} = await dispatch(getCommunicationSummary({ payload }));
            if (!status) {
                setAnalyticsTabAlert(true);
                return; 
            }
        }
        const pdf_payload = {
            campaignId: state?.from,
            userId,
            clientId,
            departmentId,
            analyticsType: 1,
            startDate: state?.startDate,
            endDate: state?.endDate,
            metricType: 'Reach',
            chartType: 'line',
            channelName: 'All channels',
        };
    };

    useEffect(() => {
        if (!state) return;

        const loadKey = `${location.key}-${state?.from}-${state?.snapshotId ?? ''}`;
        if (lastCSRLoadKeyRef.current === loadKey) return;
        lastCSRLoadKeyRef.current = loadKey;

        refAPIStatus.current.preventOtherApiCall = false;
        refAPIStatus.current.firstTimeAPICalled = false;

        if (state?.snapshotId && state?.snapshotName) {
            const snapPayload = {
                campaignId: state?.from,
                userId,
                clientId,
                departmentId,
                snapshotId: state.snapshotId,
                snapshotName: state.snapshotName,
                createdDate: state.createdDate,
            };
            dispatch(getSnapDetails({ payload: snapPayload }));
        } else {
            handleSummaryPageAPI();
        }

        if (state?.subSegmentLevel && state?.subSegmentFriendlyName) {
            dispatch(
                updateSummarySubSegmentDetail({
                    subSegmentFriendlyName: state?.subSegmentFriendlyName,
                    subSegmentLevel: state?.subSegmentLevel,
                }),
            );
            refAPIStatus.current.firstTimeAPICalled = true;
        }
        if (state?.from) {
            const snapPayload = {
                campaignId: state?.from,
                clientId,
                departmentId,
                userId,
            };
            dispatch(getSnapNameList({ payload: snapPayload, loading: false }));
        }
    }, [location.key, state?.from, state?.snapshotId, state?.snapshotName]);

    useEffect(() => {
        if (Object?.keys(summarySubSegmentDetail)?.length && !refAPIStatus.current.firstTimeAPICalled)
            handleSummaryPageAPI(summarySubSegmentDetail?.subSegmentLevel, true);
    }, [JSON.stringify(summarySubSegmentDetail)]);

    useEffect(() => {
        if (Object?.keys(summary)?.length > 0) {
            setGolden((prev) => ({ ...prev, status: summary?.isGoldenCampaign || false }));

            // Skip API calls if data is from snapshot
            if (summary?.isFromSnapshot) {
                return;
            }

            let payload = {
                userId,
                clientId,
                departmentId,
                campaignId: state?.from,
            };
             let Targetliststatuspayload = {
                userId,
                clientId,
                departmentId,
                campaignId: state?.from,
                channelId:summary?.channelList
            };
                dispatch(GetRetargetListStatus({ payload:Targetliststatuspayload }));
            
            if (payload && state?.from && !refAPIStatus.current.preventOtherApiCall) {
                // dispatch(getCommunicationInsights({ payload }));
                payload = {
                    ...payload,
                    analyticsType: 1,
                };
                dispatch(getGeography({ payload }));
                // dispatch(getKnownToUnknownConversion({ payload }));
            }
        }
    }, [summary]);

    useMemo(() => {
        if (Object.keys(summary)?.length) {
            if (summary?.channelList?.some((res) => res === 10) && summary?.channelList?.length === 1) {
                setAnalyticsTabAlert(summary.channelEngagementInfo?.totalEngagementCount > 0 ? false : true);
            } else {
                setAnalyticsTabAlert(_get(summary, 'totalRecipientsCount', 0) > 0 ? false : true);
            }
            const tempOverview = {};
            let filterModals = _filter(Object.entries(_get(summary, 'factModel', {})), ([_, value]) => value !== null);
            filterModals = addTabKey(Object.fromEntries(filterModals));
            let channels = Object.values(filterModals)?.flat();
            let sortedChannels = getSortedChannels(channels, 'channelId', 'subChannelId');
            const factModals = _map(sortedChannels, (list, index) => ({
                id: list?.blastId,
                text: list?.blastName ?? getChannelId(list?.channelId || 0)?.label, //list.blastName || list.blastId,
                component: () => {
                    return retargetListLoading ? (
                        <>
                        <span className='position-relative top10'>
                            <SkeletonTable count={5}/>
                        </span>
                        </>
                    ) : (
                        <CommunicationAnalysisTable
                            list={list}
                            index={index}
                            stateVal={state}
                            retarget={getRetargetStatusForChannel(list?.channelId)}
                        />
                    );
                },
            }));
            const isCampaignTypeM = summary?.campaignType === 'M';
            const factModel = _get(summary, 'factModel', {});
            // if (isCampaignTypeM) {
            //     let totalFromFactModel = 0;
            //     for (const key in factModel) {
            //         if (Array.isArray(factModel[key]) && factModel[key]?.length > 0) {
            //             factModel[key].forEach((item) => {
            //                 const channelId = parseInt(item.channelId) || item.channelId;
            //                 const reachMetric = getChannelMetric(channelId, 'reach');
            //                 if (reachMetric) {
            //                     totalFromFactModel += parseFloat(_get(item, reachMetric, 0)) || 0;
            //                 }
            //             });
            //         }
            //     }
            //     tempOverview.total = totalFromFactModel || _get(summary, 'totalRecipientsCount', 0);
            // } else {
                tempOverview.total =
                    _get(summary, 'channelList[0]') === 10
                        ? _get(summary, 'channelEngagementInfo.totalEngagementCount', 0)
                        : _get(summary, 'totalRecipientsCount', 0);
            //}
            tempOverview.detailViewChannel = [];
            tempOverview.data = ['channelReachInfo', 'channelEngagementInfo', 'channelConversionInfo'].map((list) => {
                const currentList = _get(summary, list, {});
                const channelInfo = _get(currentList, 'channelInfos', {});
                let metricType = '';
                if (isCampaignTypeM) {
                    if (list === 'channelReachInfo') {
                        metricType = 'reach';
                    } else if (list === 'channelEngagementInfo') {
                        metricType = 'engagement';
                    } else if (list === 'channelConversionInfo') {
                        metricType = 'conversion';
                    }
                }
                let socialMedia = [];
                if (isCampaignTypeM && metricType) {
                    const validChannelIds = new Set();
                    if (Array.isArray(channelInfo) && channelInfo.length > 0) {
                        channelInfo.forEach((info) => {
                            if (info?.channelId) {
                                validChannelIds.add(parseInt(info.channelId) || info.channelId);
                            }
                        });
                    }
                    if (validChannelIds?.has(9) && !validChannelIds?.has(14)) {
                        validChannelIds.add(14);
                    } else if (validChannelIds?.has(14) && !validChannelIds?.has(9)) {
                        validChannelIds.add(9);
                    }
                    if (validChannelIds?.has(8) && !validChannelIds?.has(16)) {
                        validChannelIds.add(16);
                    } else if (validChannelIds?.has(16) && !validChannelIds?.has(8)) {
                        validChannelIds.add(8);
                    }
                    const channelDataMap = {};
                    for (const key in factModel) {
                        if (Array.isArray(factModel[key]) && factModel[key]?.length > 0) {
                            factModel[key].forEach((item) => {
                                const channelId = parseInt(item.channelId) || item.channelId;
                                if (!validChannelIds.has(channelId)) {
                                    return;
                                }
                                const metric = getChannelMetric(channelId, metricType);
                                if (!metric) {
                                    return;
                                }
                                if (!channelDataMap[channelId]) {
                                    channelDataMap[channelId] = {
                                        channelId,
                                        items: [],
                                        totalCount: 0,
                                        totalBase: 0,
                                        pophoverItems: [],
                                    };
                                }
                                const metricValue = parseFloat(_get(item, metric, 0)) || 0;
                                const baseCount = _get(item, 'noOfAudienceCount', 0) || 
                                                _get(item, 'deliveredCount', 0) || 
                                                _get(item, 'totalDeliveredCount', 0) || 0;
                                channelDataMap[channelId].items.push(item);
                                channelDataMap[channelId].totalCount += metricValue;
                                channelDataMap[channelId].totalBase += parseFloat(baseCount) || 0;
                                channelDataMap[channelId].pophoverItems.push({
                                    blastName: item.blastName || 'N/A',
                                    value: metricValue,
                                });
                            });
                        }
                    }
                    let sortedSocialMedia = getSortedChannels(CHANNELS_LIST, 'id', '');
                    socialMedia = sortedSocialMedia.map((channelItem) => {
                        const channelId = channelItem.id;
                        const channelData = channelDataMap[channelId];
                        const isMobilePushChannel = channelId === 9 || channelId === 14;
                        const isWebNotificationChannel = channelId === 8 || channelId === 16;
                        if (validChannelIds.has(channelId) && channelData && channelData.items.length > 0) {
                            const foundItem = Array.isArray(channelInfo) ? channelInfo.find((info) => {
                                const infoChannelId = parseInt(info?.channelId);
                                if (isMobilePushChannel) {
                                    return infoChannelId === 9 || infoChannelId === 14;
                                } else if (isWebNotificationChannel) {
                                    return infoChannelId === 8 || infoChannelId === 16;
                                } else {
                                    return infoChannelId === channelId;
                                }
                            }) : null;
                            
                            const ratio = foundItem?.ratio || (channelData.totalBase > 0 
                                ? `${Math.round((channelData.totalCount / channelData.totalBase) * 100)}:100`
                                : 'NA');
                            const pophoverText = channelData.pophoverItems.length > 0
                                ? `<div class='d-flex flex-column gap-2'>
                                    ${channelData.pophoverItems.map(item => 
                                        `<div class='d-flex'><div class='mr5'>${item.blastName}:</div><div>${item?.value}</div></div>`
                                    ).join('')}
                                   </div>`
                                : 'NA';
                            
                            return {
                                ...channelItem,
                                disabled: false,
                                count: channelData.totalCount,
                                ratio: ratio,
                                hasFactModelData: true,
                                pophoverText: pophoverText,
                                ratioPophoverText: foundItem?.ratio 
                                    ? `<div class='d-flex'><div class='mr5'>${foundItem?.channelName || getChannelId(channelId)?.label || channelItem.lable || channelItem.Channel}:</div><div>${foundItem?.ratio}</div></div>`
                                    : `<div class='d-flex'><div class='mr5'>${getChannelId(channelId)?.label || channelItem.lable || channelItem.Channel}:</div><div>${ratio}</div></div>`,
                            };
                        } else {
                            return {
                                ...channelItem,
                                disabled: true,
                                count: 'NA',
                                ratio: 'NA',
                                hasFactModelData: false,
                                pophoverText: 'NA',
                                ratioPophoverText: 'NA',
                            };
                        }
                    });
                    if (summary?.channelList?.includes(10) && validChannelIds.has(10)) {
                        let sortedPaidMediaList = getSortedChannels(PAID_CHANNEL_LIST, 'id', 'id');
                        const paidItems = sortedPaidMediaList.map((paidItem) => {
                            const paidChannelData = [];
                            for (const key in factModel) {
                                if (Array.isArray(factModel[key]) && factModel[key]?.length > 0) {
                                    factModel[key].forEach((item) => {
                                        if (item.channelId?.toString() === '10' &&
                                            (item.subChannelId?.toString() === paidItem.id?.toString() ||
                                             item.subchannelId?.toString() === paidItem.id?.toString())) {
                                            const metric = getChannelMetric(10, metricType);
                                            if (metric) {
                                                paidChannelData.push({
                                                    item,
                                                    metricValue: parseFloat(_get(item, metric, 0)) || 0,
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                            
                            if (paidChannelData.length > 0) {
                                const totalCount = paidChannelData.reduce((sum, d) => sum + d.metricValue, 0);
                                const pophoverItems = paidChannelData.map(d => ({
                                    blastName: d.item.blastName || 'N/A',
                                    value: d.metricValue,
                                }));
                                
                                const pophoverText = `<div class='d-flex flex-column gap-2'>
                                    ${pophoverItems.map(item => 
                                        `<div class='d-flex'><div class='mr5'>${item.blastName}:</div><div>${item?.value}</div></div>`
                                    ).join('')}
                                   </div>`;
                                
                                return {
                                    ...paidItem,
                                    disabled: false,
                                    count: totalCount,
                                    ratio: 'NA',
                                    hasFactModelData: true,
                                    pophoverText: pophoverText,
                                    ratioPophoverText: 'NA',
                                };
                            } else {
                                return {
                                    ...paidItem,
                                    disabled: true,
                                    count: 'NA',
                                    ratio: 'NA',
                                    hasFactModelData: false,
                                    pophoverText: 'NA',
                                    ratioPophoverText: 'NA',
                                };
                            }
                        });
                        socialMedia = [...socialMedia, ...paidItems];
                    }
                } else if (summary?.channelList?.includes(10)) {
                    let sortedPaidMediaList = getSortedChannels(PAID_CHANNEL_LIST, 'id', 'id');
                    const paidItems = sortedPaidMediaList.map((item) => {
                        const foundItem = channelInfo.find(
                            (getCurrentList) =>
                                getCurrentList?.channelId === 10 &&
                                (
                                    getCurrentList?.subChannelId === item?.id ||
                                    getCurrentList?.subchannelId === item?.id
                                )
                        );
                        const hasFactModelData = Object.keys(factModel).some((key) =>
                            Array.isArray(factModel[key]) &&
                            factModel[key]?.length > 0 &&
                            factModel[key].some(
                                (blast) =>
                                    blast?.channelId?.toString?.() === '10' &&
                                    (
                                        blast?.subChannelId?.toString?.() === item?.id?.toString() ||
                                        blast?.subchannelId?.toString?.() === item?.id?.toString()
                                    )
                            )
                        );
                        if (foundItem) {
                            return {
                                ...item,
                                disabled: false,
                                ratio: foundItem?.ratio || 'NA',
                                hasFactModelData,
                                ratioPophoverText: foundItem
                                    ? `<div class='row'>
                                 <div class='col'>${foundItem?.channelName}:</div>
                                 <div class='col ml-15'>${foundItem?.ratio}</div>
                               </div>`
                                    : 'NA',
                                count: foundItem.count || 'NA',
                                pophoverText: foundItem
                                    ? `<div class='row'>
                                     <div class='col'>${foundItem?.channelName}:</div> 
                                     <div class='col ml-15'>${foundItem?.count}</div>
                                   </div>`
                                    : 'NA',
                            };
                        } else {
                            return {
                                ...item,
                                disabled: true,
                                ratio: 'NA',
                                count: 'NA',
                                hasFactModelData: false,
                                pophoverText: 'NA',
                            };
                        }
                    });
                    const otherItems = CHANNELS_LIST.filter((ch) => ch.id !== 10).map((item) => {
                        const foundItem = channelInfo.find((getCurrentList) => getCurrentList?.channelId === item?.id);
                        
                        const isMobilePushChannel = item?.id === 9 || item?.id === 14;
                        const hasFactModelData = Object.keys(factModel).some((key) =>
                            Array.isArray(factModel[key]) &&
                            factModel[key]?.length > 0 &&
                            factModel[key]?.some((blast) => {
                                if (isMobilePushChannel) {
                                    return blast?.channelId?.toString?.() === '9' || blast?.channelId?.toString?.() === '14';
                                } else {
                                    return blast?.channelId?.toString?.() === item?.id?.toString();
                                }
                            })
                        );
                        
                        return foundItem
                            ? {
                                  ...item,
                                  disabled: false,
                                  ratio: foundItem?.ratio || 'NA',
                                  count: foundItem.count || 'NA',
                                  hasFactModelData,
                                  pophoverText: foundItem
                                      ? `<div class='d-flex'>
                                   <div class='mr5' >${foundItem?.channelName}:</div>
                                   <div class=''>${foundItem?.count}</div>
                                 </div>`
                                      : 'NA',
                                  ratioPophoverText: foundItem
                                      ? `<div class='d-flex'>
                                   <div class='mr5' >${foundItem?.channelName}:</div>
                                   <div class=''>${foundItem?.ratio}</div>
                                 </div>`
                                      : 'NA',
                              }
                            : {
                                  ...item,
                                  disabled: true,
                                  ratio: 'NA',
                                  count: 'NA',
                                  hasFactModelData: false,
                                  pophoverText: 'NA',
                              };
                    });
                    socialMedia = [...otherItems, ...paidItems];
                } else {
                    let sortedSocialMedia = getSortedChannels(CHANNELS_LIST, 'id', '');
                    socialMedia = sortedSocialMedia.map((item) => {
                        const foundItem = channelInfo.find((getCurrentList) => getCurrentList?.channelId === item?.id);
                        const isMobilePushChannel = item?.id === 9 || item?.id === 14;
                        const hasFactModelData = Object.keys(factModel).some(key => 
                            Array.isArray(factModel[key]) && 
                            factModel[key]?.length > 0 && 
                            factModel[key]?.some(blast => {
                                if (isMobilePushChannel) {
                                    return blast?.channelId?.toString?.() === '9' || blast?.channelId?.toString?.() === '14';
                                } else {
                                    return blast?.channelId?.toString?.() === item?.id?.toString();
                                }
                            })
                        );
                        
                        return foundItem
                            ? {
                                  ...item,
                                  disabled: false,
                                  ratio: foundItem?.ratio || 'NA',
                                  count: foundItem.count || 'NA',
                                  hasFactModelData,
                                  pophoverText: foundItem
                                      ? `<div class='d-flex'>
                                   <div class='mr5' >${foundItem?.channelName}:</div>
                                   <div class=''>${foundItem?.count}</div>
                                 </div>`
                                      : 'NA',
                                  ratioPophoverText: foundItem
                                      ? `<div class='row'>
                               <div class='col'>${foundItem?.channelName}:</div>
                               <div class='col ml-15'>${foundItem?.ratio}</div>
                             </div>`
                                      : 'NA',
                              }
                            : {
                                  ...item,
                                  disabled: true,
                                  ratio: 'NA',
                                  count: 'NA',
                                  hasFactModelData: false,
                                  pophoverText: 'NA',
                              };
                    });
                }
                socialMedia.sort((a, b) => (a.disabled === b.disabled ? 0 : a.disabled ? 1 : -1));
                let pophoverMDC = '';
                let totalCount = 0;
                let totalRecipients = 0;
                if (isCampaignTypeM && metricType) {
                    let factModelValue = [];
                    for (const key in factModel) {
                        if (Array.isArray(factModel[key]) && factModel[key]?.length > 0) {
                            factModelValue.push(factModel[key]);
                        }
                    }
                    
                    let isFirstItem = true;
                    for (let arrayIndex = 0; arrayIndex < factModelValue.length; arrayIndex++) {
                        const currentArray = factModelValue[arrayIndex];
                        
                        for (let i = 0; i < currentArray?.length; i++) {
                            const currentItem = currentArray[i];
                            const channelId = parseInt(currentItem.channelId) || currentItem.channelId;
                            const metric = getChannelMetric(channelId, metricType);
                            if (!metric) {
                                continue;
                            }
                            
                            const metricValue = _get(currentItem, metric, 0) || 0;
                            totalCount += parseFloat(metricValue) || 0;
                            const baseCount = _get(currentItem, 'noOfAudienceCount', 0) || 
                                            _get(currentItem, 'deliveredCount', 0) || 
                                            _get(currentItem, 'totalDeliveredCount', 0) || 0;
                            totalRecipients += parseFloat(baseCount) || 0;
                            
                            pophoverMDC += `<li class='${isFirstItem ? 'border-bottom mb10' : ''} d-flex gap-4'><span>${currentItem.blastName || 'N/A'}</span><span>${metricValue}</span></li>`;
                            isFirstItem = false;
                        }
                    }
                    pophoverMDC = `<ul class='rs-tooltip-text-multi css-scrollbar'>${pophoverMDC}</ul>`;
                } else {
                    let factModelValue = [];
                    for (const key in factModel) {
                        if (Array.isArray(factModel[key]) && factModel[key]?.length > 0) {
                            factModelValue.push(factModel[key]);
                        }
                    }
                    
                    let isFirstItem = true;
                    for (let arrayIndex = 0; arrayIndex < factModelValue.length; arrayIndex++) {
                        const currentArray = factModelValue[arrayIndex];
                        
                        for (let i = 0; i < currentArray?.length; i++) {
                            const currentItem = currentArray[i];
                            let metric = '';
                            metric =
                                list === 'channelReachInfo' &&
                                (currentItem.channelId === '2' ||
                                    currentItem.channelId === '21' ||
                                    currentItem.channelId === '8' ||
                                    currentItem.channelId === '10')
                                    ? 'deliveredCount'
                                    : list === 'channelEngagementInfo' && currentItem.channelId === '2'
                                    ? 'repliedCount'
                                    : list === 'channelEngagementInfo' && currentItem.channelId === '21'
                                    ? 'readCount'
                                    : list === 'channelEngagementInfo' && currentItem.channelId === '8'
                                    ? 'clicksCount'
                                    : list === 'channelReachInfo' && currentItem.channelId === '3'
                                    ? 'uniqueScansPercentage'
                                    : list === 'channelEngagementInfo' && currentItem.channelId === '3'
                                    ? 'interactionCount'
                                    : list === 'channelReachInfo' && currentItem.channelId === '14'
                                    ? 'totalDeliveredCount'
                                    : list === 'channelEngagementInfo' && currentItem.channelId === '14'
                                    ? 'clicks'
                                    : list === 'channelReachInfo' && currentItem.channelId === '10'
                                    ? 'totalClicks'
                                    : list === 'channelEngagementInfo' && currentItem.channelId === '10'
                                    ? 'uniqueClicks'
                                    : list === 'channelReachInfo'
                                    ? 'uniqueOpens'
                                    : list === 'channelEngagementInfo'
                                    ? 'uniqueClicks'
                                    : 'conversion';

                            pophoverMDC += `<li class='${isFirstItem ? 'border-bottom mb10' : ''} d-flex gap-4'><span>${currentItem.blastName}</span><span>${_get(currentItem, metric, 0)}</span></li>`;
                            isFirstItem = false;
                        }
                    }
                    pophoverMDC = `<ul class='rs-tooltip-text-multi css-scrollbar'>${pophoverMDC}</ul>`;
                }
                let finalCount = 0;
                let finalPercentage = '0';
                if (isCampaignTypeM) {
                    finalCount = totalCount;
                    if (totalRecipients > 0) {
                        finalPercentage = ((totalCount / totalRecipients) * 100).toFixed(2);
                    }
                } else {
                    finalCount = _get(
                        currentList,
                        `${
                            list === 'channelReachInfo'
                                ? 'totalReachCount'
                                : list === 'channelEngagementInfo'
                                ? 'totalEngagementCount'
                                : 'totalConversionCount'
                        }`,
                        0,
                    );
                    const pctRaw =
                        list === 'channelEngagementInfo' && summary?.channelList?.includes(10)
                            ? 100
                            : _get(
                                  currentList,
                                  `${
                                      list === 'channelReachInfo'
                                          ? 'reachPercentage'
                                          : list === 'channelEngagementInfo'
                                          ? 'engagementPercentage'
                                          : 'conversionPercentage'
                                  }`,
                                  0,
                              );
                    finalPercentage =
                        pctRaw === false || pctRaw == null || !Number.isFinite(Number(pctRaw)) ? '0' : String(pctRaw);
                }
                
                return {
                    id: list,
                    disabled: '',
                    pophoverText: pophoverMDC,
                    title: getChannelTitle(list),
                    count: finalCount,
                    percentage: finalPercentage,
                    socialMedia,
                };
            });
            setOverviewConfig(tempOverview);
            setAnalyticsTab(factModals);
        }
        //  else {
        //     setAnalyticsTabAlert(true);
        // }
    }, [summary, retargetListLoading]);

    const handleGoldenCampaign = () => {
        setGolden((prev) => ({ ...prev, modal: false }));
    };

    useEffect(() => {
        if (!isDownloadUI && pdfExportComponent.current) {
            pdfExportComponent.current?.rootElForPDF?.querySelectorAll('*').forEach((element) => {
                if (
                    element.getAttribute('style')?.trim() ===
                    'transform: none !important; transition: none !important;'
                ) {
                    element.removeAttribute('style');
                }
            });
        }
    }, [isDownloadUI]);

    useEffect(() => {
        return () => {
            lastCSRLoadKeyRef.current = null;
            refAPIStatus.current.preventOtherApiCall = false;
            refAPIStatus.current.firstTimeAPICalled = false;
            dispatch(resetCSRState());
            dispatch(reset_failures_API_Errors());
        };
    }, []);

    useEffect(() => {
        if (golden?.modal && golden?.status) {
            const timer = setTimeout(() => {
                setGolden((prev) => ({ ...prev, modal: false }));
            }, 10000); // 10 seconds

            return () => {
                clearTimeout(timer);
            };
        }
    }, [golden?.modal, golden?.status]);

    const contextValue = {
        refAPIStatus,
        lastUpdateMetaDataSnapshotRef,
    };

    return (
        <AnalyticsReportProvider.Provider value={contextValue}>
            <RSLoader />
            <FormProvider {...methods}>
                <PDFExport
                    keepTogether="p"
                    // paperSize="A4"
                    margin="1cm"
                    ref={pdfExportComponent}
                    paperSize="auto"
                    // margin={40}
                    fileName={`${state?.campaignName} for ${getFileDownloadDateTime()}`}
                    author="RESUL"
                >
                    <div
                        className={`page-content-holder ${isDownloadUI ? 'download-page-setup download-page-setup-detail' : ''}`}
                    >
                        {/* Title */}
                        {summaryLoading ?
                            <div className='container-fluid csr-page-header main-heading-wrapper d-flex'>
                                <div className='mhw-container   container'>
                                    <div className='mhwc-left'>
                                        <CommonSkeleton width={80} height={20} box />
                                        <div className='d-flex justify-content-between gap-2'>
                                            <CommonSkeleton width={400} height={30} box />
                                            <CommonSkeleton width={150} height={30} box />
                                            {/* <CommonSkeleton width = {100} height = {30} box/> */}
                                        </div>
                                    </div>
                                    <div className='mhwc-right position-relative d-flex justify-content-between gap-2'>
                                        <CommonSkeleton width={100} height={30} box />
                                        <CommonSkeleton width={100} height={30} box />
                                        <CommonSkeleton width={100} height={30} box />
                                    </div>
                                </div>
                            </div>

                            :
                            <RSPageHeader
                                title={
                                    <>
                                        <small className="badge">{summary?.encodeCampaignID}</small>
                                        {summary?.campaignName?.length > 40 ? (
                                            <RSTooltip text={summary?.campaignName} position="bottom">
                                                <span className="repo-label">
                                                    {truncateTitle(summary?.campaignName, 40)}
                                                </span>
                                            </RSTooltip>
                                        ) : (
                                            <span className="repo-label">{summary?.campaignName}</span>
                                        )}
                                    </>
                                }
                                pageClass="csr-page-header"
                                // starClass="top0"
                                titleCls="repo-title"
                                star={golden.status}
                                date={`${dateField}`}
                                isBack
                                isBuDisabled={true}
                                isAgencyDisabled={true}
                                backPath={state?.fromPath || `/analytics`}
                                isHeaderLine
                                rightCommonMenus
                                downloadUI={isDownloadUI}
                                // isLoading={summaryLoading}
                                onBack={summary?.isFromSnapshot ? handleSnapshotBack : undefined}
                            />}

                        <Container fluid >
                            <div className='page-content'>
                                 <Container className={`px0`}>
                            {/* Title Icons */}
                            <Row className="top-sub-heading mt0 mb15 align-items-end">
                                <Col md={6} className="d-flex align-items-center pl0">
                                {summaryLoading ? (
                                    <div className='d-flex gap-3'>
                                        <CommonSkeleton box width={100} height={20} />
                                        <CommonSkeleton box width={160} height={20} />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="d-flex align-items-center">
                                            {OVERVIEW}{' '}
                                            <small className="color-primary-grey ml10 position-relative top1">
                                                ({AS_ON}:{' '}
                                                {/* {getUserDateTimeFormat(summary?.jobDateTime, 'formatDateTime')}) */}
                                                {/* {getUserCurrentFormat(summary?.jobDateTime)?.dateTimeFormat}) */}
                                                {getUserCurrentFormat(summary?.jobDateTime,{isOffset:true})?.utcformat})
                                            </small>
                                        </h3>{' '}
                                    </>
                                )}
                                </Col>
                                <Col md={6} className="pr0">
                                    {summaryLoading ? (
                                       <div className='d-flex gap-3 justify-content-end'>
                                         <CommonSkeleton  width={24} height={24} circle/>
                                            <CommonSkeleton  width={24} height={24} circle/>
                                                <CommonSkeleton  width={24} height={24} circle/>
                                                    <CommonSkeleton  width={24} height={24} circle/>
                                       </div>
                                        
                                    ) : (
                                        <HeaderIcons
                                            summary={summary}
                                            golden={golden}
                                            getGoldenCampaign={getGoldenCampaign}
                                            setGolden={setGolden}
                                            benchRef={benchRef}
                                            snapshotList={snapshotList}
                                            isPDF={exportPDFWithComponent}
                                            isDownloadUI={(downloadMode) => {
                                                setIsDownload(downloadMode);
                                            }}
                                            onPdfExportStart={() => setIsPdfExporting(true)}
                                            onPdfExportEnd={() => setIsPdfExporting(false)}
                                        />
                                    )}
                                </Col>
                            </Row>

                            {/* Golden communication */}
                            {golden?.modal && golden.status && (
                                <div
                                    className={`alert alert-success mb23 border-r7 align-items-stretch`}>
                                    <i
                                        className={`position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${circle_tick_medium} icon-md bg-primary-green `}
                                    ></i>
                                    <span className={`${isDownloadUI ? '' : ''} align-items-center d-flex lh-sm py10`}>
                                        {summary?.campaignName} is marked as&nbsp;<b> Golden communication!</b>
                                    </span>
                                    {/* <i
                                    className={`position-relative p5 ${circle_close_edge_medium} icon-md white bg-primary-red`}
                                    onClick={() => handleGoldenCampaign}
                                ></i> */}
                                    <div
                                        className={`${isDownloadUI ? 'd-none' : ''}`}
                                        onClick={() => setGolden((prev) => ({ ...prev, modal: false }))}
                                    >
                                        <RSIcon
                                            className="icon-xs"
                                            color="color-primary-green cp"
                                            innerCloseContent={false}
                                            customCloseClass={'right4 top4 w-auto bg-transparent'}
                                             defaultItem={circle_close_mini}
                                            hoverItem = {circle_close_fill_mini}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Overview */}
                            <Overview
                                downloadUI={isDownloadUI}
                                overviewConfig={overviewConfig}
                                date={getCreatedDate(summary?.jobDateTime)}
                            />

                            {/* Performance and Insights */}
                            <PerformanceAndInsights
                                date={getCreatedDate(summary?.jobDateTime)}
                                isDownloadUI={isDownloadUI}
                            />

                            {/* Communication analysis  */}
                            <CommunicationAnalysis
                                analyticsTab={analyticsTab}
                                date={getCreatedDate(summary?.jobDateTime)}
                                isDownloadUI={isDownloadUI}
                            />

                            {/* Roi: S/M only; T (trigger/event) = ROI Attribution hidden */}
                            {showRoiAttribution && <RoiChart isDownloadUI={isDownloadUI} />}

                            {/* Performance vs benchmark: Credit card promo  */}
                            <BenchMark
                                benchRef={benchRef}
                                campaignName={summary?.campaignName}
                                date={getCreatedDate(summary?.jobDateTime)}
                                isDownloadUI={isDownloadUI}
                            />

                            {/* Communication impact */}
                            <CommunicationImpact disable isDownloadUI={isDownloadUI} />
                           {summary?.channelList?.some(
                            (res) => res?.toString()?.includes('2') || res?.toString()?.startsWith('41')
                            ) && (
                            <small className="mb26 color-secondary-black">
                                <span className='font-bold'>{DATA_DISCALIMER}:</span>{' '}
                                {DATA_DISCLAIMER_FOOTER_TEXT}
                            </small>
                            )}

                            {/* Modals */}
                            {snapshotStatus.TASstatus && (
                                <RSModal
                                    show={snapshotStatus.TASstatus}
                                    isBorder
                                    handleClose={() => {
                                        setSnapshotStatus((pre) => ({ ...pre, TASstatus: false }));
                                    }}
                                    size="md"
                                    header="Snapshot"
                                    footer={
                                        <span>
                                            <RSSecondaryButton
                                                onClick={() => {
                                                    setSnapshotStatus((pre) => ({ ...pre, TASstatus: false }));
                                                }}
                                            >
                                                Cancel
                                            </RSSecondaryButton>
                                            <RSPrimaryButton
                                                type="submit"
                                                onClick={() => {
                                                    setSnapshotStatus((pre) => ({
                                                        ...pre,
                                                        TASstatus: false,
                                                        dropdownList: [
                                                            ...snapshotStatus.dropdownList,
                                                            getValues('snapshotName'),
                                                        ],
                                                    }));
                                                }}
                                            >
                                                {SELECT}
                                            </RSPrimaryButton>
                                        </span>
                                    }
                                    body={
                                        <Row>
                                            <Col>
                                                <span>{NAME_YOUR_SNAPSHOT}</span>
                                            </Col>
                                            <Col>
                                                <RSInput
                                                    name="snapshotName"
                                                    defaultValue={'2nd week of the communication'}
                                                    control={control}
                                                    placeholder={ENTER_NAME_HERE}
                                                />
                                            </Col>
                                        </Row>
                                    }
                                />
                            )}
                            {analyticsTabAlert && (
                                <RSModal
                                    header={INFO}
                                    show={analyticsTabAlert}
                                    isCloseButton={false}
                                    size="md"
                                    body={
                                        <>
                                            <i
                                                className={`${in_progress_large} icon-xl color-primary-orange justify-content-center mb20 d-flex`}
                                            ></i>
                                            <p className="text-center">
                                                {summary?.channelList?.some((res) => res === 3) ? (
                                                    <>{ANALYTICS_CUSTOMER_QR_SCAN}</>
                                                ) : (summary?.channelList?.some((res) => res === 10) && (summary?.channelList?.length === 1)) ? (
                                                    <>{ANALYTICS_CUSTOMER_CLICK}</>
                                                ) : (
                                                    <>{ANALYTICS_PROGRESS_TEXT}</>
                                                )}
                                            </p>
                                        </>
                                    }
                                    footer={
                                        <RSPrimaryButton
                                            onClick={() => {
                                                navigate(state?.fromPath || `/AnalyticsSSE`);
                                            }}
                                        >
                                            {OK}
                                        </RSPrimaryButton>
                                    }
                                />
                            )}
                        </Container>
                            </div>
                        </Container>

                        {/* <PDFContent ref={pdfContainer} analyticsTab={analyticsTab} /> */}
                    </div>{' '}
                </PDFExport>
                {isPdfExporting &&
                    !summaryLoading &&
                    createPortal(
                        <div
                            className="analytics-report-pdf-skeleton-overlay analytics-report-skeleton-scope analytics-report-page-loading"
                            style={ANALYTICS_REPORT_LOADING_HOLDER_STYLE}
                            aria-busy="true"
                            aria-label="Preparing PDF download"
                        >
                            <style>{skeletonShellSharedCriticalCss}</style>
                            <style>{analyticsReportLiveSkeletonCriticalCss}</style>
                            <style>{analyticsReportSkeletonCriticalCss}</style>
                            <AnalyticsReportPageContentSkeleton wrapScope={false} />
                        </div>,
                        document.body,
                    )}
            </FormProvider>
        </AnalyticsReportProvider.Provider>
    );
};

export default AnalyticsReport;
