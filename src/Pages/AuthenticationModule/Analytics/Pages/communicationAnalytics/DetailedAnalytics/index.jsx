import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { getYYMMDD, getUserCurrentFormat, getFileDownloadDateTime } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { DATA_DISCALIMER, DATA_DISCLAIMER_FOOTER_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { createContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

import RSTabberSlide from 'Components/RSTabberSlide';

import {
    DETAIL_ANALYTICS_TAB_CONFIG,
    getTabIndexByChannelId,
    handleDefaultTab,
    resolveChannelInfoIndex,
    resolveDetailAnalyticsBackPath,
    SEGMENT_ENABLED_CAMPAIGNS,
} from './constants';
import RSPageHeader from 'Components/RSPageHeader';
import RSTooltip from 'Components/RSTooltip';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { get_Digipop_Reports, getDetailReport_ChannelDetails, getDetailReport_OverviewDetails, getDetailReport_SegmentDetails } from 'Reducers/analytics/details/request';
import { updateAnalyticsDetail } from 'Reducers/analytics/communicationAnalytics/reducer';
import { getSortedChannels } from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Plan/Tabs/DeliveryMethod/constant';

import { FormProvider } from 'react-hook-form';
import { PDFExport } from '@progress/kendo-react-pdf';

import useQueryParams from 'Hooks/useQueryParams';
import { RSPageHeaderSkeleton } from 'Components/Skeleton/Components/common';
import {
    DETAIL_ANALYTICS_LOADING_HOLDER_STYLE,
    DetailAnalyticsPdfExportSkeleton,
    DetailAnalyticsLoadingBlock,
    detailAnalyticsSkeletonCriticalCss,
} from 'Components/Skeleton/pages/analytics';
import { SkeletonTable } from 'Components/Skeleton/Skeleton';
import {
    linkPreviewDetailsData,
    resetAnalyticsDetailState,
    updateDetailsMainList,
} from 'Reducers/analytics/details/reducer';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { scrollAnalyticsPageToTop } from 'Pages/AuthenticationModule/Analytics/analyticsDefaults';
// let tempBackPath = '';

export const DetailAnalyticsProvider = createContext({});

const PDF_LAYOUT_SETTLE_MS = 2000;
const PDF_EXPORT_WINDOW_MS = 8000;

const DetailAnalytics = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const locationData = useQueryParams('/analytics/detail-analytics');
    const [tempBackPath, setTempBackPath] = useState('/analytics')

    useLayoutEffect(() => {
        scrollAnalyticsPageToTop();
    }, [location?.pathname, location?.search]);

    const getDropdownUrl = (item) => {
        const state = {
            campaignId: locationData?.campaignId,
            channelId: item?.channelID,
            blastId: locationData?.blastId,
            startDate: locationData?.startDate,
            endDate: locationData?.endDate,
            campaignTypeValue: locationData?.campaignTypeValue,
            campaignName: locationData?.campaignName,
            iswinnerSplit: locationData?.iswinnerSplit,
            iswinnerSplitType: locationData?.iswinnerSplitType,
            isSplitABScheduler: locationData?.isSplitABScheduler,
            splitName: locationData?.splitName,
            split: isSplitABScheduler ? splitType: isWinnerSplit ? 'ACT' : `Split ${isWinnerSplitType}`,
            isFromListingPage: locationData?.isFromListingPage,
            subSegmentLevel: item?.subSegmentLevel,
            subSegmentFriendlyName: item?.subSegmentFriendlyName,
        };
        const encryptState = encodeUrl(state);
        return `/analytics/detail-analytics?q=${encryptState}`;
    };

    const handleDropdownItemClick = (item, e) => {
        const state = {
            campaignId: locationData?.campaignId,
            channelId: item?.channelID,
            blastId: locationData?.blastId,
            startDate: locationData?.startDate,
            endDate: locationData?.endDate,
            campaignTypeValue: locationData?.campaignTypeValue,
            campaignName: locationData?.campaignName,
            iswinnerSplit: locationData?.iswinnerSplit,
            iswinnerSplitType: locationData?.iswinnerSplitType,
            isSplitABScheduler: locationData?.isSplitABScheduler,
            splitName: locationData?.splitName,
            split: isSplitABScheduler ? splitType: isWinnerSplit ? 'ACT' : `Split ${isWinnerSplitType}`,
            isFromListingPage: locationData?.isFromListingPage,
            subSegmentLevel: item?.subSegmentLevel,
            subSegmentFriendlyName: item?.subSegmentFriendlyName,
        };
        dispatch(updateAnalyticsDetail(state));
        const encryptState = encodeUrl(state);
        isAlreadyCalledAPi.current.status = false;
        navigate(`/analytics/detail-analytics?q=${encryptState}`, {
            state,
        });
    };

    const getTabUrl = (tabItem) => {
        const tabChannelId = tabItem?.channelId;
        const tabSubchannelId =
            tabChannelId === 7 || tabChannelId === 10
                ? tabItem?.subchannelId ?? tabItem?.subChannelId ?? locationData?.subChannelId ?? 0
                : 0;
        const state = {
            campaignId: locationData?.campaignId,
            channelId: tabChannelId,
            blastId: tabItem?.blastShortCode || locationData?.blastId,
            subChannelId: tabSubchannelId,
            startDate: locationData?.startDate,
            endDate: locationData?.endDate,
            campaignTypeValue: locationData?.campaignTypeValue,
            campaignName: locationData?.campaignName,
            iswinnerSplit: locationData?.iswinnerSplit,
            iswinnerSplitType: locationData?.iswinnerSplitType,
            isSplitABScheduler: locationData?.isSplitABScheduler,
            splitName: locationData?.splitName,
            split: isSplitABScheduler ? splitType: isWinnerSplit ? 'ACT' : `Split ${isWinnerSplitType}`,
            isFromListingPage: locationData?.isFromListingPage,
            subSegmentLevel: locationData?.subSegmentLevel,
            subSegmentFriendlyName: locationData?.subSegmentFriendlyName,
            currIndex: tabItem?.id, // Include the tab index/ID
        };
        const encryptState = encodeUrl(state);
        return `/analytics/detail-analytics?q=${encryptState}`;
    };

    const handleTabClick = (tabItem, e) => {
        e.preventDefault();
        const activeIndex = tabListRef.current?.defaultIndex ?? 0;
        if (tabItem?.id === activeIndex) {
            return;
        }
        handleSelectedTab(tabItem);
    };
    
    const refAPIStatus = useRef({
        totalActivityAPI: false,
        communicationStatusAPI: false,
    });
    
    //PDF
    const pdfContainer = useRef(null);
    const pdfExportComponent = useRef(null);
    const isAlreadyCalledAPi = useRef({
        status: false,
        isSubsegmentLevelChange: false,
    });
    const lastDetailFetchKeyRef = useRef(null);
    const [isPdfExporting, setIsPdfExporting] = useState(false);
    const exportPDFWithComponent = () => {
        // debugger;
        if (pdfExportComponent.current) {
            pdfExportComponent.current.save();
            setTimeout(() => {
                pdfExportComponent?.current?.rootElForPDF.querySelectorAll('*').forEach((element) => {
                    if (
                        element.getAttribute('style')?.trim() ===
                        'transform: none !important; transition: none !important;'
                    ) {
                        element.removeAttribute('style');
                    }
                });
            }, 5000);
        }
    };
    //PDF

  const { analyticsDetatils } = useSelector(({ analyticsListingReducer }) => analyticsListingReducer);
  // const { detailsList } = useSelector(({ analyticsDetails }) => analyticsDetails);
  const { channelDetail, isLoading, isFailure, isChannelLoading, ...otherAnalyticsDetails } = useSelector(({ analyticsDetails }) => analyticsDetails);
  const { isGoldCampaign: isGolden } = channelDetail;
  const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
  //console.log('channelDetail', channelDetail);
  // const channelId = getChannelId(analyticsDetatils?.channelName)?.id;
  const channelId = locationData?.channelId; //analyticsDetatils?.channelId;
  const isDigipopCamp = locationData?.channelId === 10 && locationData?.subChannelId === 9;
  const isWinnerSplit = locationData?.iswinnerSplit;
  const isWinnerSplitType = locationData?.iswinnerSplitType;
  const isSplitABScheduler = locationData?.isSplitABScheduler;
  const splitName = locationData?.splitName;
  const splitType = splitName?.split(' ')[1];
  const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
  const tabListRef = useRef({
    defaultIndex: 0,
    tabsListView: [],
    isDownload: false
  });
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const updateTabList = (updates) => {
    const previousState = tabListRef.current;
    tabListRef.current = { ...previousState, ...updates };
    forceUpdate();
  };
  const getCampDetails = async (segmentLevel, isSubsegmentLevelChange, channelId) => {
    if (!isDigipopCamp) {
      const payload = {
        channelId: channelId || analyticsDetatils?.channelId || locationData?.channelId, // analyticsDetatils?.channelId,
        clientId,
        userId,
        departmentId,
        campaignId: locationData?.campaignId, //analyticsDetatils?.campaignId,
        blastId:
        isSplitABScheduler && locationData?.blastId ?
        locationData?.blastId :
        analyticsDetatils?.blastId || locationData?.blastId,
        subchannelId:
        locationData?.channelId === 7 || locationData?.channelId === 10 ? locationData?.subChannelId : 0,
        subSegmentLevel:
        segmentLevel ||
        locationData?.subSegmentLevel ||
        otherAnalyticsDetails?.subSegmentDetailInDetailPage?.subSegmentLevel ||
        analyticsDetatils?.subSegmentLevel ||
        0
      };
      const channelDetailsPayload = { ...payload };
      delete channelDetailsPayload?.blastId;
      const { status, data } = await dispatch(getDetailReport_ChannelDetails({ payload: channelDetailsPayload }));
      if (status) {
        let sortedChannels = getSortedChannels(channelInfos, 'channelId', '');

        const channelInfos = isSplitEnabled && splitChannelLevelInfo?.length ? splitChannelLevelInfo : sortedChannels && sortedChannels ? sortedChannels : [];
        let splitIndex = null;
        if ((locationData?.isSplitAB || locationData?.isSplitABScheduler) && locationData?.splitName) {
          let splitInd = channelInfos?.findIndex((item) => item?.splitType == splitType);
          if (splitInd !== -1) {
            splitIndex = splitInd;
          }
        }
        const boundedIndex = resolveChannelInfoIndex({
          channelInfos,
          channelId: locationData?.channelId ?? analyticsDetatils?.channelId,
          subChannelId: locationData?.subChannelId ?? analyticsDetatils?.subChannelId,
          blastId: locationData?.blastId ?? analyticsDetatils?.blastId,
          currIndex: analyticsDetatils?.currIndex ?? locationData?.currIndex,
          isSubsegmentLevelChange,
          splitIndex
        });
        const selectedChannelInfo = channelInfos[boundedIndex] || channelInfos[0] || {};
        const resolvedChannelId =
        selectedChannelInfo?.channelId ||
        payload.channelId ||
        analyticsDetatils?.channelId ||
        locationData?.channelId;
        const resolvedBlastId =
        locationData?.iswinnerBlastId && isWinnerSplit && !isSplitABScheduler ?
        locationData?.iswinnerBlastId :
        isSplitABScheduler && locationData?.blastId ?
        locationData?.blastId :
        selectedChannelInfo?.blastShortCode ||
        payload.blastId ||
        analyticsDetatils?.blastId ||
        locationData?.blastId;

                const resolvedSubchannelId =
                    resolvedChannelId === 7 || resolvedChannelId === 10
                        ? selectedChannelInfo?.subchannelId ??
                          selectedChannelInfo?.subChannelId ??
                          locationData?.subChannelId ??
                          0
                        : 0;

                const detailListUpdate = {
                    ...analyticsDetatils,
                    blastId: resolvedBlastId,
                    channelId: resolvedChannelId,
                    currIndex: boundedIndex,
                    subChannelId: resolvedSubchannelId,
                };
                await dispatch(updateAnalyticsDetail(detailListUpdate));
                payload.channelId = resolvedChannelId;
                payload.blastId = resolvedBlastId;
                payload.subchannelId = resolvedSubchannelId;

                dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: false }));
                // Handle winner split functionality here to avoid duplicate API calls
                let overviewPayload = { ...payload };
                if (isWinnerSplit && startDate && endDate) {
                    overviewPayload = {
                        ...overviewPayload,
                        startDate: getYYMMDD(startDate),
                        endDate: getYYMMDD(endDate),
                        segment: 0,
                        split: isSplitABScheduler ? splitType: isWinnerSplit ? 'ACT' : `Split ${isWinnerSplitType}`,
                    };
                    dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
                } else if (
                    (locationData?.isSplitAB || locationData?.isSplitABScheduler) &&
                    !locationData?.iswinnerSplit
                ) {
                    overviewPayload = {
                        ...overviewPayload,
                        split: splitType || 'A',
                    };
                }

                const isTGCGEnabled = isTGCG ?? channelDetail?.isTGCG;
                if (isTGCGEnabled) {
                    overviewPayload = {
                        ...overviewPayload,
                        isTG: true,
                        isCG: false,
                    };
                }

                if (
                    resolvedChannelId === 10 &&
                    startDate &&
                    endDate &&
                    !overviewPayload.startDate
                ) {
                    overviewPayload = {
                        ...overviewPayload,
                        startDate: getYYMMDD(startDate),
                        endDate: getYYMMDD(endDate),
                    };
                    dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
                }

                const { status: overviewStatus } = await dispatch(
                    getDetailReport_OverviewDetails({ payload: overviewPayload }),
                );

                if (SEGMENT_ENABLED_CAMPAIGNS.includes(locationData?.channelId) && overviewStatus) {
                    dispatch(getDetailReport_SegmentDetails({ payload: overviewPayload }));
                }
            }
            // dispatch(getDetailReport({ payload }));
            // }, [departmentId, clientId, channelId, locationData]);
            const pathState = {
                from: +locationData?.campaignId,
                channelId: payload.channelId || locationData?.channelId,
                startDate: startDate || locationData?.startDate,
                endDate: endDate || locationData?.endDate,
                campaignTypeValue: locationData?.campaignTypeValue,
                campaignName: locationData?.campaignName,
                subSegmentLevel:
                    otherAnalyticsDetails?.subSegmentDetailInDetailPage?.subSegmentLevel ??
                    locationData?.subSegmentLevel,
                subSegmentFriendlyName:
                    otherAnalyticsDetails?.subSegmentDetailInDetailPage?.subSegmentFriendlyName ??
                    locationData?.subSegmentFriendlyName,
            };
            const encryptState = encodeUrl(pathState);
            if (locationData?.channelId === 7 || locationData?.isFromListingPage) {
                setTempBackPath(`/analytics`)
                //tempBackPath = `/analytics`;
            } else {
                setTempBackPath(`/analytics/analytics-report?q=${encryptState}`)
                //tempBackPath = `/analytics/analytics-report?q=${encryptState}`;
            }
        } else {
            let payload = {
                clientId,
                userId,
                departmentId,
                campaignId: locationData?.campaignId,
                fromDate: getYYMMDD(locationData?.startDate),
                toDate: getYYMMDD(locationData?.endDate),
            };
            const { status, data } = await dispatch(get_Digipop_Reports(payload, locationData));
            dispatch(
                updateDetailsMainList({
                    field: 'channelDetail',
                    data: status ? { ...locationData, isDigipopCamp: true } : {},
                }),
            );
            dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: false }));
           // tempBackPath = `/analytics`;
            setTempBackPath(`/analytics`)
        }
    };

    useEffect(() => {
        if (locationData === null) return;

        const fetchKey = `${location?.key ?? ''}-${locationData?.campaignId}-${locationData?.channelId}-${locationData?.blastId}-${locationData?.subChannelId}`;
        if (lastDetailFetchKeyRef.current === fetchKey) return;
        lastDetailFetchKeyRef.current = fetchKey;

        isAlreadyCalledAPi.current.status = false;
        isAlreadyCalledAPi.current.isSubsegmentLevelChange = false;
        dispatch(resetAnalyticsDetailState());
        getCampDetails();
        if (locationData?.subSegmentLevel && locationData?.subSegmentFriendlyName) {
            dispatch(
                updateDetailsMainList({
                    field: 'subSegmentDetailInDetailPage',
                    data: {
                        subSegmentLevel: locationData?.subSegmentLevel,
                        subSegmentFriendlyName: locationData?.subSegmentFriendlyName,
                    },
                }),
            );
        }
        isAlreadyCalledAPi.current.status = true;
    }, [
        location?.key,
        locationData?.campaignId,
        locationData?.channelId,
        locationData?.blastId,
        locationData?.subChannelId,
    ]);

    // useEffect(() => {
    //     debugger
    //     if (
    //         Object?.keys(otherAnalyticsDetails?.subSegmentDetailInDetailPage)?.length &&
    //         !isAlreadyCalledAPi?.current?.status &&
    //         locationData
    //     ) {
    //         const firstChannelBlastShortCode = channelDetail?.channelInfos?.length
    //             ? channelDetail?.channelInfos[0]?.blastShortCode
    //             : '';
    //         getCampDetails(
    //             otherAnalyticsDetails?.subSegmentDetailInDetailPage?.subSegmentLevel,
    //             firstChannelBlastShortCode,
    //         );
    //     }
    // }, [
    //     JSON.stringify(otherAnalyticsDetails?.subSegmentDetailInDetailPage?.subSegmentLevel) &&
    //         JSON.stringify(channelDetail?.channelInfos),isAlreadyCalledAPi
    // ]);

    const isDownloadUI = (flag) => {
        if (flag === false) return;

        const runPdfExport = async () => {
            setIsPdfExporting(true);
            updateTabList({ isDownload: true });
            await new Promise((resolve) => setTimeout(resolve, PDF_LAYOUT_SETTLE_MS));
            exportPDFWithComponent();
            await new Promise((resolve) => setTimeout(resolve, PDF_EXPORT_WINDOW_MS));
            updateTabList({ isDownload: false });
            setIsPdfExporting(false);
        };

        runPdfExport();
    };

    useEffect(() => {
        if ((channelDetail !== '' && Object.keys(channelDetail)?.length && locationData !== null) || isDigipopCamp) {
            let tabs = [];

            let sortedChannels = getSortedChannels(channelDetail?.channelInfos, 'channelId', '');

            const processChannelInfos = (channelInfos) => {
                const processed = [];
                const channelMap = new Map();

                channelInfos?.forEach((item) => {
                    const channelId = item?.channelId;

                    if (channelId === 7 || channelId === 10) {
                        if (!channelMap.has(channelId)) {
                            channelMap.set(channelId, item);
                            processed.push(item);
                        }
                    } else {
                        processed.push(item);
                    }
                });

                return processed;
            };

      tabs = processChannelInfos(sortedChannels)?.map((item, inde) => {
        const rowChannelId = item?.channelId ?? locationData?.channelId;
        const rowSubchannelId =
        rowChannelId === 7 || rowChannelId === 10 ?
        item?.subchannelId ?? item?.subChannelId ?? 0 :
        0;
        const tabItem = {
          id: inde,
          text:
          channelDetail?.campaignType === 'M' ?
          item?.channelId === 7 ?
          'Social post' :
          item?.channelId === 10 ?
          'Paid media' :
          item?.channelFriendlyName :
          item?.channelId === 7 ?
          'Social media' :
          item?.channelId === 10 ?
          'Paid media' :
          item?.channelId === 16 ?
          'App analytics' :
          item?.channelFriendlyName || getChannelId(item?.channelId)?.label,
          disable: false,
          blastShortCode: item?.blastShortCode,
          channelId: rowChannelId,
          subchannelId: rowSubchannelId,
          campaignId: locationData?.campaignId,
          href: getTabUrl({
            channelId: rowChannelId,
            blastShortCode: item?.blastShortCode,
            subchannelId: rowSubchannelId,
            id: inde
          }),
          component: DETAIL_ANALYTICS_TAB_CONFIG(isDownloadUI).filter((detail) => {
            const tempchannelId = item?.channelId;
            return detail.channelId === tempchannelId;
          })?.[0]?.component
        };
        return tabItem;
      });
      const currentBlastId = analyticsDetatils?.blastId || locationData?.blastId;
      let defaultTab = handleDefaultTab(tabs, locationData?.channelId, currentBlastId);
      // let defaultTab = handleDefaultTab(tabs, analyticsDetatils?.channelId);
      const getTabIndexForSubsegment = (subSegmentLevel) => {
        if (!channelDetail?.csrSubSegmentList || !subSegmentLevel) return 0;

                const matchingSubsegment = channelDetail?.csrSubSegmentList.find(
                    (item) => item.subSegmentLevel === subSegmentLevel,
                );

                if (!matchingSubsegment) return 0;

                const tabIndex = channelDetail?.channelInfos?.findIndex(
                    (channelInfo) => channelInfo.channelId === matchingSubsegment?.channelID,
                );

                return tabIndex >= 0 ? tabIndex : 0;
            };

            let defaultIndex = 0;
            const navigatedChannelId = analyticsDetatils?.channelId ?? locationData?.channelId;

      if (isAlreadyCalledAPi.current.isSubsegmentLevelChange) {
        defaultIndex = 0;
      } else if (navigatedChannelId === 7 || navigatedChannelId === 10) {
        const tabIndex = getTabIndexByChannelId(tabs, navigatedChannelId);
        defaultIndex = tabIndex !== -1 ? tabIndex : 0;
      } else if (defaultTab !== undefined && defaultTab >= 0) {
        defaultIndex = defaultTab;
      } else if (navigatedChannelId) {
        const tabIndex = getTabIndexByChannelId(tabs, navigatedChannelId);
        defaultIndex = tabIndex !== -1 ? tabIndex : 0;
      } else if (locationData?.currIndex !== undefined && locationData?.currIndex >= 0) {
        defaultIndex = locationData?.currIndex;
      } else if (channelDetail?.isSubsegment && locationData?.subSegmentLevel) {
        defaultIndex = getTabIndexForSubsegment(locationData?.subSegmentLevel);
      } else if (channelDetail?.isSubsegment && !locationData?.subSegmentLevel) {
        defaultIndex = 0;
      } else if (analyticsDetatils?.currIndex !== undefined && analyticsDetatils?.currIndex >= 0) {
        defaultIndex = analyticsDetatils?.currIndex;
      } else {
        defaultIndex = 0;
      }

            updateTabList({
                tabsListView: tabs,
                defaultIndex: defaultIndex,
            });
            // setTabList((pre) => ({
            //     ...pre,
            //     tabsListView: [
            //         {
            //             text: 'WebPushNotification',
            //             channelId: 8,
            //             component: () => <WebNotification type="webpush" key="webnotification" />,
            //         },
            //     ],
            //     defaultIndex: 0,
            // }));
        } else {
            updateTabList({ tabsListView: [] });
        }
    }, [channelDetail, locationData]);
    // useEffect(() => {
    //     if (channelDetail?.channelInfos?.length && !isAlreadyCalledAPi?.current?.status) {
    //         const payload = {
    //             channelId: analyticsDetatils?.channelId || locationData?.channelId, // analyticsDetatils?.channelId,
    //             clientId,
    //             userId,
    //             departmentId,
    //             campaignId: locationData?.campaignId, //analyticsDetatils?.campaignId,
    //             blastId: analyticsDetatils?.blastId || locationData?.blastId,
    //             subchannelId: channelDetail?.channelInfos[0]?.subchannelId,
    //         };
    //         if (locationData?.channelId === 7 && channelDetail !== '' && locationData !== null) {
    //             dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: false }));
    //             dispatch(getDetailReport_OverviewDetails({ payload }));
    //             //console.log("@@@@TEst");
    //         }
    //     }
    // }, [channelDetail?.channelInfos]);

    const handleSelectedTab = async (selectedItem) => {
        const blastId = selectedItem?.blastShortCode ;
        const channelId = selectedItem?.channelId;
        const currIndex = selectedItem?.id;
        const resolvedTabSubchannelId =
            channelId === 7 || channelId === 10
                ? selectedItem?.subchannelId ?? selectedItem?.subChannelId ?? locationData?.subChannelId ?? 0
                : 0;

        const payload = {
            channelId,
            clientId,
            userId,
            departmentId,
            campaignId: locationData?.campaignId,
            blastId,
            subchannelId: resolvedTabSubchannelId,
            subSegmentLevel:
                locationData?.subSegmentLevel ||
                otherAnalyticsDetails?.subSegmentDetailInDetailPage?.subSegmentLevel ||
                analyticsDetatils?.subSegmentLevel ||
                0,
        };

        let detailList = {
            ...analyticsDetatils,
            blastId,
            channelId,
            currIndex,
            subChannelId: resolvedTabSubchannelId,
        };
        await dispatch(updateAnalyticsDetail(detailList));
        dispatch(linkPreviewDetailsData({}));
        dispatch(updateDetailsMainList({ field: 'overviewDetail', data: {} }));
        dispatch(updateDetailsMainList({ field: 'segmentDetail', data: {} }));
        dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: false }));

        // Reset API status flags to allow new API calls
        if (refAPIStatus?.current) {
            refAPIStatus.current.totalActivityAPI = false;
            refAPIStatus.current.communicationStatusAPI = false;
        }

        if (isWinnerSplit && (channelDetail?.startDate || locationData?.startDate) && (channelDetail?.endDate || locationData?.endDate) && channelId !== 6) {
            payload.startDate = getYYMMDD(channelDetail?.startDate || locationData?.startDate);
            payload.endDate = getYYMMDD(channelDetail?.endDate || locationData?.endDate);
            payload.segment = 0;
            payload.split = isSplitABScheduler ? splitType : isWinnerSplit ? 'ACT' : `Split ${isWinnerSplitType}`;
            dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
        } else if (
            (locationData?.isSplitAB || locationData?.isSplitABScheduler) &&
            !locationData?.iswinnerSplit &&
            channelId !== 6
        ) {
            payload.split = splitType || 'A';
        } else if (
            channelId === 10 &&
            (channelDetail?.startDate || locationData?.startDate) &&
            (channelDetail?.endDate || locationData?.endDate) &&
            !payload.startDate
        ) {
            payload.startDate = getYYMMDD(channelDetail?.startDate || locationData?.startDate);
            payload.endDate = getYYMMDD(channelDetail?.endDate || locationData?.endDate);
            dispatch(updateDetailsMainList({ field: 'fromSplitHeader', data: true }));
        }

    if (channelDetail?.isTGCG) {
      payload.isTG = true;
      payload.isCG = false;
    }
    //await dispatch(getDetailReport_ChannelDetails({ payload }));
    const { status } = await dispatch(getDetailReport_OverviewDetails({ payload }));
    // await dispatch(
    //     getClickActivityDetails({
    //         ...payload,
    //         pagination: {
    //             pageNo: 1,
    //             pageSize: 5,
    //         },
    //     }),
    // );
    if (SEGMENT_ENABLED_CAMPAIGNS.includes(channelId) && status) {
      await dispatch(getDetailReport_SegmentDetails({ payload }));
    }
  };
  useEffect(() => {
    if (tabListRef.current?.tabsListView?.length) {
      const getTabIndexForSubsegment = (subSegmentLevel) => {
        if (!channelDetail?.csrSubSegmentList || !subSegmentLevel) return 0;
        const matchingSubsegment = channelDetail?.csrSubSegmentList.find(
          (item) => item.subSegmentLevel === subSegmentLevel
        );
        if (!matchingSubsegment) return 0;
        const tabIndex = channelDetail?.channelInfos?.findIndex(
          (channelInfo) => channelInfo.channelId === matchingSubsegment?.channelID
        );
        return tabIndex >= 0 ? tabIndex : 0;
      };
      let targetIndex = 0;
      const navigatedChannelId = analyticsDetatils?.channelId ?? locationData?.channelId;
      if (navigatedChannelId === 7 || navigatedChannelId === 10) {
        const tabIndex = getTabIndexByChannelId(tabListRef.current?.tabsListView, navigatedChannelId);
        targetIndex = tabIndex !== -1 ? tabIndex : 0;
      } else if (tabListRef.current?.defaultIndex !== undefined && tabListRef.current?.defaultIndex >= 0) {
        targetIndex = tabListRef.current.defaultIndex;
      } else if (navigatedChannelId) {
        const tabIndex = getTabIndexByChannelId(tabListRef.current?.tabsListView, navigatedChannelId);
        targetIndex = tabIndex !== -1 ? tabIndex : 0;
      } else if (locationData?.currIndex !== undefined && locationData?.currIndex >= 0) {
        targetIndex = locationData?.currIndex;
      } else if (channelDetail?.isSubsegment && locationData?.subSegmentLevel) {
        targetIndex = getTabIndexForSubsegment(locationData?.subSegmentLevel);
      } else {
        targetIndex = 0;
      }
      updateTabList({
        defaultIndex: targetIndex
      });
    }
  }, [tabListRef.current?.tabsListView?.length, locationData?.subSegmentLevel, analyticsDetatils?.currIndex, locationData?.currIndex, channelDetail?.csrSubSegmentList, channelDetail?.isSubsegment]);

    useEffect(() => {
        return () => {
            lastDetailFetchKeyRef.current = null;
            isAlreadyCalledAPi.current = {
                status: false,
                isSubsegmentLevelChange: false,
            };
            dispatch(resetAnalyticsDetailState());
            dispatch(updateAnalyticsDetail({}));
        };
    }, []);
    // const dateField =
    //     channelDetail?.endDate && channelDetail?.startDate
    //         ? `${dateFormat(channelDetail?.startDate, 'formatDate')} - ${dateFormat(
    //               channelDetail?.endDate,
    //               'formatDate',
    //           )}`
    //         : '';
    const dateField =
        channelDetail?.endDate && channelDetail?.startDate
            ? `${getUserCurrentFormat(channelDetail?.startDate)?.dateFormat} - ${
                  getUserCurrentFormat(channelDetail?.endDate)?.dateFormat
              }`
            : '';
    
    const contextValue = {
        refAPIStatus,
    };

    return (
        <DetailAnalyticsProvider.Provider value={contextValue}>
            <FormProvider>
            <PDFExport
                keepTogether="p"
                // paperSize="A4"
                margin="1cm"
                ref={pdfExportComponent}
                paperSize="auto"
                // margin={40}
                fileName={`${channelDetail?.campaignName} for ${getFileDownloadDateTime()}`}
                author="RESUL"
            >
                <div
                    className={`page-content-holder${isChannelLoading ? ' analytics-detail-skeleton-scope dask-scope' : ''}${
                        tabListRef.current?.isDownload || isPdfExporting
                            ? ' download-page-setup download-page-setup-detail'
                            : ''
                    }`}
                    style={isChannelLoading ? DETAIL_ANALYTICS_LOADING_HOLDER_STYLE : undefined}
                >
                    {isChannelLoading ? (
                        <>
                            <style>{detailAnalyticsSkeletonCriticalCss}</style>
                            <RSPageHeaderSkeleton variant="detail" />
                        </>
                    ) : (
                        <RSPageHeader
                            title={
                                <>
                                    {channelDetail?.campaignName?.length > 40 ? (
                                        <RSTooltip text={channelDetail?.campaignName} position="bottom">
                                            <span className="repo-label">
                                                {truncateTitle(channelDetail?.campaignName, 40)}
                                            </span>
                                        </RSTooltip>
                                    ) : (
                                        <span className="repo-label">{channelDetail?.campaignName}</span>
                                    )}
                                </>
                            }
                            pageClass="csr-page-header"
                            titleCls="repo-title"
                            isTabber
                            star={isGolden}
                            date={dateField}
                            isBuDisabled={true}
                            isAgencyDisabled={true}
                            isBack
                            backPath={resolveDetailAnalyticsBackPath({ locationData, tempBackPath })}
                            isBackAsLink
                            rightCommonMenus
                            downloadUI={tabListRef.current?.isDownload}
                        />
                    )}

                    {!isChannelLoading && tabListRef.current?.tabsListView?.length ? (
                        <>
                            <Container fluid>
                                <div className="page-content">
                                    <RSTabberSlide
                                        dynamicTab={`mb0 mini detail-analytics-tab`}
                                        activeClass={`active`}
                                        tabData={tabListRef.current?.tabsListView}
                                        className="rs-tabs row detail-tabs "
                                        defaultTab={tabListRef.current?.defaultIndex >= 0 &&
                                        tabListRef.current?.defaultIndex < tabListRef.current?.tabsListView?.length
                                            ? tabListRef.current.defaultIndex
                                            : 0}
                                        callBack={(_, ind) => {
                                            updateTabList({
                                                defaultIndex: ind,
                                            });
                                        }}
                                        onTabClick={handleTabClick}
                                        isDetailAnalytics
                                        tabMaxLength={5}
                                        customRender={channelDetail?.csrSubSegmentList?.length}
                                        renderItem={
                                            channelDetail?.csrSubSegmentList?.length ? (
                                                <RSBootstrapdown
                                                    alignRight
                                                    data={(channelDetail?.csrSubSegmentList || []).map(item => ({
                                                        ...item,
                                                        href: getDropdownUrl(item)
                                                    }))}
                                                    flatIcon
                                                    showUpdate
                                                    defaultItem={
                                                        otherAnalyticsDetails?.subSegmentDetailInDetailPage ||
                                                        channelDetail?.csrSubSegmentList[0]
                                                    }
                                                    className="float-end"
                                                    onSelect={async (item, index, event) => {
                                                          // // isAlreadyCalledAPi.current.status = false;
                                                        // isAlreadyCalledAPi.current.isSubsegmentLevelChange = true;
                                                        // dispatch(
                                                        //     updateDetailsMainList({
                                                        //         field: 'subSegmentDetailInDetailPage',
                                                        //         data: item,
                                                        //     }),
                                                        // );
                                                        // let isSubsegmentLevelChange = true;
                                                        // // updateTabList({
                                                        // //     defaultIndex: 0,
                                                        // // });
                                                        // getCampDetails(item.subSegmentLevel, isSubsegmentLevelChange, item?.channelID);
                                                        handleDropdownItemClick(item, event);
                                                    }}
                                                    isObject
                                                    fieldKey="subSegmentFriendlyName"
                                                    isActive
                                                />
                                            ) : null
                                        }
                                        campaignType={locationData?.campaignTypeValue}
                                    />
                                </div>
                            </Container>
                            {((channelId && channelId?.toString()?.includes('2')) || (channelId?.toString()?.startsWith('41'))) && !isLoading && (
                                <Container>
                                    <small className="mb26 color-secondary-black">
                                        <span className='font-bold'>{DATA_DISCALIMER}:</span>{' '}
                                        {DATA_DISCLAIMER_FOOTER_TEXT}
                                    </small>
                                </Container>
                            )}
                        </>
                    ) : (
                        isChannelLoading ? (
                            <Container fluid>
                                <div className="page-content pc-analytics">
                                    <Container className="px0">
                                        <DetailAnalyticsLoadingBlock />
                                    </Container>
                                </div>
                            </Container>
                        ) : (
                            <Container>
                                <div className="box-design">
                                    <SkeletonTable isError={true} />
                                </div>
                            </Container>
                        )
                    )}
                </div>
            </PDFExport>
            {isPdfExporting &&
                !isChannelLoading &&
                createPortal(
                    <div
                        className="analytics-report-pdf-skeleton-overlay analytics-detail-skeleton-scope dask-scope"
                        style={DETAIL_ANALYTICS_LOADING_HOLDER_STYLE}
                        aria-busy="true"
                        aria-label="Preparing PDF download"
                    >
                        <style>{detailAnalyticsSkeletonCriticalCss}</style>
                        <DetailAnalyticsPdfExportSkeleton />
                    </div>,
                    document.body,
                )}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </FormProvider>
        </DetailAnalyticsProvider.Provider>
    );
};

export default DetailAnalytics;
