import { formatNumber, formatTime } from 'Utils/modules/campaignUtils';
import { getUserDetails, getPermissions } from 'Utils/modules/crypto';
import { downloadCSV } from 'Utils/modules/download';

import { ActiveUsersSmallSkeleton, KeyMetricsSmallSkeleton, ListAqusitionSekelton, PieChartSkeleton, RetentionTableSkeleton } from 'Components/Skeleton/Skeleton';
import { FormatAudienceConversionChartData, FormatByInterestPieChartData, FormatKnownRetentionData, FormatPieChartData, Format_active_visitor_traffic_ChartData, FormatgetByHoursMobile, FormatgetUserBehaviorByDays, WEB_LIVE_DASHBOARD_DATA, dd_retention, dd_top_page_views, findByDaysMaxStateAndPercentage, findMaxEngagementTimeAndPercentage, getFullDayName, getProductAnalyticsFunc, hasProductInterestWebData, hasProgressiveProfileWebData, isAllValuesZero } from './constants';
import { areasplineChartOptions, barChartOptions, columnChartOptions, gaugeChartOptions, pieChartOptions, pyramidChartOptions, sankeyChartOptions, variablePieChartOptions } from 'Constants/Charts';
import { ACTIVE_USERS, AS_OF_TODAY, AUDIENCE_CONVERSION, AUDIENCE_TYPES, AVG_SCREEN_SESSION, AVG_TIME_SPENT, BY_BROWSER, BY_DAYS, BY_DEVICE, BY_HOURS, BY_INTERESTS, DAU, DAU_TEXT, KEY_METRICS, LAST_28_DAYS, LAST_5_DAYS, LAST_7_DAYS, LIVE_VISITORS, MAU, MAU_TEXT, PAGE_VIEWS, PATH_ANALYSER, PRODUCT_ANALYTICS, PROGRESSIVE_PROFILE, RETENTION, SELECT_BU, SESSIONS, TOP_EVENT_SUMMARY, TOP_PAGE_VIEWS, TRAFFIC_BREAKDOWN_WEB_VISITORS, UNIQUE_WEB_VISITORS, VISITORS_ENGAGE, VISITOR_STATUS, WAU, WAU_TEXT, WEBSITE_APP_ENGAGE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_question_mark_mini, collapse_medium, csv_download_medium, expand_medium, menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import Icon from 'Components/Icon/Icon';
import { find as _find, isEmpty } from 'Utils/modules/lodashReplacements';
import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import RetentionTable from './Components/RetentionTable';
import DashBoardCard from '../../Component/DashboardCard';

import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';

import activeImg from 'Assets/Images/active.svg';

import RSTooltip from 'Components/RSTooltip';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getAudienceCountMobile, getLiveCountDashboard, getWebAppDasdhboard, getPathAnalyser, getPathAnalyserDDL } from 'Reducers/dashboard/mobileLiveDashboard/request';
import { getWebDomains } from 'Reducers/audience/dynamicList/request';
import { update_isWebAppId, update_isWebAppData, update_isWebDomainListReady } from 'Reducers/globalState/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { ProductAnalytics } from './Components/ProductAnalytics';
import { WEBLIVESOCKETURL } from 'Constants/EndPoints';
import { DashboardContext } from '../../Dashboard';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import WebLiveTabSkeleton from 'Components/Skeleton/pages/dashboard/web/WebLiveTabSkeleton';
import DashboardSkeletonScope from 'Components/Skeleton/pages/dashboard/DashboardSkeletonScope';
import {
    DbSkColumnChartSkeleton,
    DbSkGaugeChartSkeleton,
    DbSkPathAnalyserActionsSkeleton,
    DbSkPathAnalyserChartSlot,
    DbSkPathAnalyserSkeleton,
    DbSkPieChartSkeleton,
    DbSkPortletInlineSkeleton,
    LIVE_PATH_ANALYSER_FILTER_COUNT_WEB,
} from 'Components/Skeleton/pages/dashboard';

const WebLiveAudienceDashboard = () => {
    const navigate = useNavigate();

    const [sankeyDropdownData, setSankeyDropdownData] = useState([])

    const levelField = useMemo(() => {
        const dataLen = Array.isArray(sankeyDropdownData) ? sankeyDropdownData.length : 0;
        const maxLevel = Math.min(6, Math.max(3, dataLen || 3));
        const len = Math.max(0, maxLevel - 2);
        return Array.from({ length: len }, (_, i) => `${i + 3} Levels`);
    }, [sankeyDropdownData?.length]);

    const sankeyDropdownLabels = useMemo(
        () => (Array.isArray(sankeyDropdownData) ? sankeyDropdownData : []).map((d) => d?.uiPrintableName ?? ''),
        [sankeyDropdownData]
    );

    const initialMaxLevel = Math.min(6, Math.max(3, Array.isArray(sankeyDropdownData) ? sankeyDropdownData.length : 0));
    const initialSankeyLabels = (Array.isArray(sankeyDropdownData) ? sankeyDropdownData.slice(0, initialMaxLevel) : []).map(
        (d) => d?.uiPrintableName ?? ''
    );
    const initialIndustriesList = initialSankeyLabels.map((value, i) => ({ field: `industry${i}`, value }));
    const initialIndustryValues = initialSankeyLabels.reduce((acc, v, i) => ({ ...acc, [`industry${i}`]: v }), {});

    const [pathAnalyserDData, setPathAnalyserDData] = useState(`${initialMaxLevel} Levels`);
    const { control, setError, watch, setValue, clearErrors, handleSubmit, getValues } = useForm({
        defaultValues: {
            industriesList: initialIndustriesList,
            ...initialIndustryValues,
            levels: initialSankeyLabels,
            series: [],
        },
        mode: 'onBlur',
    });

    const { currentRenderDashBoardTitle } = useContext(DashboardContext);

    const [industriesList, levels] = watch(['industriesList', 'levels']);
    const [expandedState, setExpandedState] = useState(false);
    const [isChartRendering, setIsChartRendering] = useState(false);
    const [series, setSeries] = useState([]);
    const sankeyChartRef = useRef(null);

    const [snapIPreview, setSnapIPreview] = useState(false);
    const { isWebAppData, isWebAppId, isWebDomainListReady } = useSelector(({ globalstate }) => globalstate);
        
    const dispatch = useDispatch();
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { licenseTypeId } = getUserDetails();
    const currentSession = `${clientId}-${departmentId}`;
    const sessionRef = useRef(currentSession);
    const [confirmationModal, setConfimrationModal] = useState(false);

    const [webData, setWebData] = useState([]);
    const [retentionData, setRetentionData] = useState([]);
    const [pathAnalyser, setpathAnalyser] = useState([]);
    const [pathAnalyserfulldata, setPathAnalyserfulldata] = useState([]);
    const [isPathAnalyserLoading, setIsPathAnalyserLoading] = useState(false);
    const [productAnalytics, setproductAnalytics] = useState([]);
    const [audienceConversion, setaudienceConversion] = useState(0);
    const [audienceCountData, setaudienceCountData] = useState({
        totalCount: 0,
        liveCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const permissionList = getPermissions();
    const { addAccess:webAppAddAccess } = _find(permissionList, { featureId: 15 });
    const [maxHours, setMaxHours] = useState({
        maxHoursPercentage: 0,
        maxHoursTimeRange: 0,
    });
    const [byDaysMaxState, setByDaysMaxState] = useState({
        maxState: null,
        maxPercentage: 0,
    });
    const [currentPageView, setCurrentPageView] = useState('topPages');

    useEffect(() => {
        let hideSkeletonTimer;
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            if (sankeyChartRef.current && sankeyChartRef.current.chart) {
                sankeyChartRef.current.reflow();
            }
            hideSkeletonTimer = setTimeout(() => {
                setIsChartRendering(false);
            }, 500);
        }, 100);
        return () => {
            clearTimeout(timer);
            if (hideSkeletonTimer) clearTimeout(hideSkeletonTimer);
        };
    }, [expandedState]);

    useEffect(() => {
        setpathAnalyser(pathAnalyser);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            document.querySelectorAll('.sankey-last-col').forEach((el) => {
                el.classList.remove('sankey-last-col');
            });
            if (!pathAnalyser || pathAnalyser.length === 0) return;
            const fromNodes = new Set(pathAnalyser?.map(item => item?.from));
            const toNodes = new Set(pathAnalyser?.map(item => item?.to));
            const terminalNodes = [...toNodes]?.filter(node => !fromNodes.has(node));
            document.querySelectorAll('.sankey-last-col-finder text').forEach((textEl) => {
                const textContent = textEl.textContent?.trim();
                if (terminalNodes.includes(textContent)) {
                    let parentWithTransform = textEl.parentNode;
                    while (parentWithTransform && !parentWithTransform.getAttribute('transform')) {
                        parentWithTransform = parentWithTransform.parentNode;
                    }
                    if (parentWithTransform) {
                        parentWithTransform.classList.add('sankey-last-col');
                    }
                }
            });
        },10);
    }, [levels, industriesList, pathAnalyser]);

    useEffect(() => {
        if (!Array.isArray(levelField) || levelField.length === 0) return;
        const currentInLevelField = levelField.includes(pathAnalyserDData);
        if (!currentInLevelField) {
            const newDefault = levelField[levelField.length - 1];
            if (!newDefault) return;
            setPathAnalyserDData(newDefault);
            const levelCount = parseInt(String(newDefault).split(' ')[0], 10) || 3;
            const slice = Array.isArray(sankeyDropdownData) ? sankeyDropdownData.slice(0, levelCount) : [];
            const temp = slice.map((d) => d?.uiPrintableName ?? '');
            const tempList = slice.map((d, i) => ({ field: `industry${i}`, value: d?.uiPrintableName ?? '' }));
            setValue('levels', temp);
            setValue('industriesList', tempList);
            temp.forEach((v, i) => setValue(`industry${i}`, v));
        }
    }, [levelField]);

    // When sankeyDropdownData loads after mount (API returns), populate levels/industriesList initially
    useEffect(() => {
        const data = Array.isArray(sankeyDropdownData) ? sankeyDropdownData : [];
        if (data.length === 0) return;
        const levelCount = Math.min(6, Math.max(3, data.length));
        const temp = data.slice(0, levelCount).map((d) => d?.uiPrintableName ?? '');
        const tempList = temp.map((value, i) => ({ field: `industry${i}`, value }));
        const levelsEmpty = !Array.isArray(levels) || levels.length === 0;
        const industriesEmpty = !Array.isArray(industriesList) || industriesList.length === 0;
        if (levelsEmpty || industriesEmpty) {
            setPathAnalyserDData(`${levelCount} Levels`);
            setValue('levels', temp);
            setValue('industriesList', tempList);
            temp.forEach((v, i) => setValue(`industry${i}`, v));
        }
    }, [sankeyDropdownData]);

    const webLiveFetchKeyRef = useRef('');
    const webLiveFetchGenerationRef = useRef(0);

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setConfimrationModal(true);
            return;
        }

        setConfimrationModal(false);

        if (currentRenderDashBoardTitle !== 'Web live dashboard') {
            return;
        }

        if (!isWebAppId?.id) {
            return;
        }

        const fetchKey = `${clientId}|${departmentId}|${isWebAppId.id}`;
        if (webLiveFetchKeyRef.current === fetchKey) {
            setIsLoading(false);
            return;
        }
        webLiveFetchKeyRef.current = fetchKey;
        const generation = ++webLiveFetchGenerationRef.current;

        setIsLoading(true);
        setWebData({});
        setRetentionData([]);
        setpathAnalyser([]);
        setPathAnalyserfulldata([]);

        const loadWebDashboard = async () => {
            try {
                await Promise.all([
                    handleGetCount(),
                    handleGetWebAppData(),
                    handleGetLiveCountData(),
                ]);
                if (generation !== webLiveFetchGenerationRef.current) return;
                await getPathAnalyserDDLData();
                if (generation === webLiveFetchGenerationRef.current) {
                    setIsLoading(false);
                }
            } catch {
                if (generation === webLiveFetchGenerationRef.current) {
                    setIsLoading(false);
                }
            }
        };

        loadWebDashboard();

        return () => {
            webLiveFetchGenerationRef.current += 1;
        };
    }, [
        clientId,
        isWebAppId?.id,
        departmentId,
        currentRenderDashBoardTitle,
        departmentName,
        licenseTypeId,
    ]);

    // Removed problematic cleanup effect that was resetting isWebAppId
    // This was causing the "previous value updating after new value" issue
    // useEffect(() => {
    //     return () => {
    //         dispatch(update_isWebAppId(isWebAppData[0]));
    //     };
    // }, []);

    const getWebDomainsData = async () => {
        dispatch(update_isWebDomainListReady(false));
        const payload = {
            clientId,
            departmentId,
            userId,
            triggerSourceId: 1,
        };
        try {
            const res = await dispatch(getWebDomains({ payload, loading: false }));
            if (res?.status) {
                const tempData = res?.data ?? [];
                const result = tempData.map((c, i) => {
                    const replaceContent = (tempData?.[i]?.value ?? '')
                        ?.replace(/^https?:\/\//, '')
                        ?.replace(/\/$/, '');
                    return { ...tempData?.[i], website: replaceContent?.trim() ?? '' };
                });
                const sortedResult = result.sort((a, b) => (b?.isDefault ?? 0) - (a?.isDefault ?? 0));
                dispatch(update_isWebAppData(sortedResult));
                const defaultDomain = sortedResult?.[0];
                if (defaultDomain) {
                    dispatch(update_isWebAppId(defaultDomain));
                }
            } else {
                dispatch(update_isWebAppId({}));
                dispatch(update_isWebAppData([]));
            }
        } catch {
            dispatch(update_isWebAppId({}));
            dispatch(update_isWebAppData([]));
        } finally {
            dispatch(update_isWebDomainListReady(true));
        }
    };

    useEffect(() => {
        if (isWebAppData?.length) return;
        sessionRef.current = currentSession;
        setWebData([]);
        setRetentionData([]);
        void getWebDomainsData();
    }, [currentSession]);

    const getPathAnalyserDDLData = async () => {
        try {
            const payload = {
                pathtype: 'W',
                clientId,
                departmentId,
                userId,
                domainName: isWebAppId?.id,
            };
            const res = await dispatch(getPathAnalyserDDL(payload));
            if (res?.status && Array.isArray(res?.data) && res?.data?.length > 0) {
                let data = res?.data;
                const PRIORITY_ORDER = [
                    'Campaigntype',
                    'Productcategory',
                    'WebUJCity',
                    'WebDeviceOs',
                    'WebUJState',
                    'WebDeviceType'
                ];
                data = [...data].sort((a, b) => {
                    const aIndex = PRIORITY_ORDER.indexOf(a?.attributeName);
                    const bIndex = PRIORITY_ORDER.indexOf(b?.attributeName);

                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    return 0;
                });
                setSankeyDropdownData(data);
                const levelCount = Math.min(6, Math.max(3, data.length));
                const temp = data.slice(0, levelCount).map((d) => d?.uiPrintableName ?? '');
                const tempList = temp.map((value, i) => ({ field: `industry${i}`, value }));
                setPathAnalyserDData(`${levelCount} Levels`);
                setValue('levels', temp);
                setValue('industriesList', tempList);
                temp.forEach((v, i) => setValue(`industry${i}`, v));
                await handlegetPathAnalyser(tempList, data);
            }
            if (res?.status === false || (res && !res?.status)) {
                setSankeyDropdownData([]);
            }
        } catch (err) {
            setSankeyDropdownData([]);
        }
    };

    const handleGetCount = async () => {
        const payload = {
            domainName: isWebAppId?.id,
            clientId,
            departmentId,
            userId,
        };
        const res = await dispatch(getAudienceCountMobile(payload));
        if (res?.status) {
            // setaudienceCountData('256056');
            setaudienceCountData((prev) => ({ ...prev, totalCount: res?.webpushcount }));
        } else {
            setaudienceCountData((prev) => ({ ...prev, totalCount: 0 }));
        }
    };

    const handleGetWebAppData = async () => {
        try {
            const payload = {
                domainName: isWebAppId?.id,
                clientId,
                departmentId,
                userId,
            };
            const res = await dispatch(getWebAppDasdhboard(payload));
            if (res?.status) {
                setWebData(res?.data);
            } else {
                setWebData({});
            }
        } catch {
            setWebData({});
        }
    };

    const handleGetLiveCountData = async () => {
        const payload = {
            domainName: isWebAppId?.id,
            clientId,
            departmentId,
            userId,
        };
        const res = await dispatch(getLiveCountDashboard(payload));
        if (res?.status) {
            setaudienceCountData((prev) => ({ ...prev, liveCount: res?.weblivecount }));
        } else {
            setaudienceCountData((prev) => ({ ...prev, liveCount: 0 }));
        }
    };
    const generatePathAnalyzerString = (list, dataSource) => {
        if (!Array.isArray(list) || list.length === 0) return '';
        const data = Array.isArray(dataSource) ? dataSource : (Array.isArray(sankeyDropdownData) ? sankeyDropdownData : []);
        return list
            .map((item) => {
                const value = item?.value;
                if (value == null || value === '') return '';
                const found = data.find((d) => d?.uiPrintableName === value);
                return found ? found.attributeName : value;
            })
            .filter(Boolean)
            .join('-');
    };

    const handlegetPathAnalyser = async (industriesListOverride, sankeyDataOverride) => {
        const list = Array.isArray(industriesListOverride) && industriesListOverride.length > 0
            ? industriesListOverride
            : getValues('industriesList') ?? [];
        const pathanalyzerString = generatePathAnalyzerString(list, sankeyDataOverride);
        setIsPathAnalyserLoading(true);
        try {
            const payload = {
                domainName: isWebAppId?.id,
                clientId,
                departmentId,
                userId,
                pathanalyzer: pathanalyzerString,
            };
            const res = await dispatch(getPathAnalyser(payload));
            if (res?.status) {
                const { pathAnalyzerList, pathAnalyserfulldata } = res;
                setpathAnalyser(pathAnalyzerList);
                setPathAnalyserfulldata(pathAnalyserfulldata || []);
            } else {
                setpathAnalyser([]);
                setPathAnalyserfulldata([]);
            }
        } catch (err) {
            setpathAnalyser([]);
            setPathAnalyserfulldata([]);
        } finally {
            setIsPathAnalyserLoading(false);
        }
    };

    const formatProductAnalyticsData = (data) => {
        if (!data || data.length === 0) return [];
        const newArry = [];
        const dataObject = data[0];
        const keys = Object.keys(dataObject);
        
        keys.map(key => {
            let newDict = {};
            let item = dataObject[key];
            
            if (item["Interest_Audience"] !== undefined) {
                newDict.name = "Product interest";
                if (item["Interest_Audience"] !== undefined) {
                    newDict.y = (item["Interest_Audience"] / item["Total_Audience"]) * 100;
                }
                newDict.count = item["Interest_Audience"];
                newDict.originalValue = item["Interest_Audience"]; 
                newArry.push(newDict);
            } else if (item["Intent_Audience"] !== undefined) {
                newDict.name = "Purchase intent";
                newDict.y = (item?.Intent_Audience / item?.Total_Audience) * 100;
                newDict.count = item?.Intent_Audience;
                newDict.originalValue = item?.Intent_Audience; 
                newArry.push(newDict);
            } else {
                
            }
        });
        return newArry;
    };

    // console.log('webtempData:  ', webData);

    useEffect(() => {
        !isEmpty(webData) && setRetentionData(webData['retentionknownWeb']);
        const data =
            webData?.productAnalyticksWeb?.length > 0
                ? JSON.parse(Object.values(webData?.productAnalyticksWeb[0])[0])[0]?.Product_Analytics
                : [];
        setproductAnalytics(webData?.productAnalyticksWeb?.length > 0 ? getProductAnalyticsFunc(data) : []);

        const initialValue = 0;
        const audienceType = webData?.audienceConversionWeb;
        const audienceType2 = audienceType?.length && audienceType !== undefined ? Object.values(audienceType[0]) : [];
        const sumData = audienceType2?.length ? audienceType2.reduce((x, y) => Number(x) + initialValue) : [];
        setaudienceConversion(sumData);
    }, [webData]);
    const LiveVisitorCount = memo(({ isWebAppId }) => {
        const [newCount, setNewCount] = useState(0);
        const [lastKnownCount, setLastKnownCount] = useState(0);
        let webLiveUsers = new Map();
    
        useEffect(() => {
            setNewCount(0);
            setLastKnownCount(0);
            // let _url = isWebAppId?.id;
            let _domainName = isWebAppId?.id;
            if (_domainName?.includes('www.')) {
                _domainName = _domainName.replace('www.', '');
            }
            const socket = window.io.connect(WEBLIVESOCKETURL, {
                transports: ['websocket'],
                reconnection: true,
            });
    
            socket.on('connect', () => {
                            });
            socket.on(_domainName, (msg) => {
                // console.log('msg: ', msg);
                startListener(msg);
            });
            socket.emit('livedashboard', {
                domainName: '' + _domainName,
            });
            webLiveUsers.clear();
            socket.on('disconnect', () => {
                            });
            socket.on('UserDisconnected', (user) => {
                webLiveUsers.delete(user);
                GetWebUserCount(webLiveUsers);
            });
    
            const GetWebUserCount = (webLiveUsers) => {
                // console.log('webLiveUsers: ', webLiveUsers);
                var users = new Map();
    
                for (let [key, value] of webLiveUsers) {
                    if (value.domainName == _domainName) {
                        users.set(value.profileId, value);
                    }
                }
                const totalUsers = users.size;
                if (totalUsers > 0) {
                    setLastKnownCount(totalUsers);
                    setNewCount(totalUsers);
                } else {
                    setNewCount(0);
                }
            };
    
            const startListener = (user) => {
                // console.log('user: @@@@@start', user);
                webLiveUsers.set(user.socketId, user);
                GetWebUserCount(webLiveUsers);
            };
    
            return () => {
                socket.off('connect');
                socket.off(isWebAppId?.id);
                socket.off('disconnect');
                socket.off('UserDisconnected');
                socket.disconnect();
            };
        }, [isWebAppId]);
    
        const displayCount = newCount > 0 ? newCount : lastKnownCount;

        return (
            <div className="two-label">
                <p>{LIVE_VISITORS}</p>
                <h3 className="user-count">
                    {' '}
                    {formatNumber(displayCount)}
                </h3>
            </div>
        );
    });
    useEffect(() => {
        const { percentage, timeRange } = findMaxEngagementTimeAndPercentage(webData?.hourWiseCounts || []);
        setMaxHours({
            maxHoursPercentage: percentage,
            maxHoursTimeRange: timeRange,
        });
    }, [webData?.hourWiseCounts]);

    useEffect(() => {
        const { value, percentage } = findByDaysMaxStateAndPercentage(webData?.byDaysCountWeb);
        const formatDayName = getFullDayName(value);
        setByDaysMaxState({
            maxState: formatDayName,
            maxPercentage: percentage,
        });
    }, [webData?.byDaysCountWeb]);
    const checkAllChildrenZero = (children) => {
        return children?.every((child) => child?.size === 0 || (child?.children && checkAllChildrenZero(child?.children)));
    };

    const handleDownloadPathAnalyserCSV = () => {
        if (!pathAnalyser || pathAnalyser.length === 0) {
            return;
        }
        const formatDomainName = (domain) => {
            if (!domain) return 'path-analyser';
            
            let cleanDomain = domain.toLowerCase();
            cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
            cleanDomain = cleanDomain.replace(/^www\./, '');
            cleanDomain = cleanDomain.replace(/\/$/, '');
            
            return cleanDomain;
        };
        const now = new Date();
        const dateTimeString = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
        const domainName = formatDomainName(isWebAppId?.id);
        const filename = `${domainName} ${dateTimeString}.csv`;
        const csvData = pathAnalyser.map((item) => ({
            From: item?.from || '',
            To: item?.to || '',
            Visitors: item?.weight || item?.value || 0,
        }));

        downloadCSV(csvData, filename);
    };

    const hasPathAnalyserData = pathAnalyser?.length > 0 && !isPathAnalyserLoading && !isChartRendering;
    const canDownloadPathAnalyserCsv = hasPathAnalyserData;
    const canTogglePathAnalyserExpand = hasPathAnalyserData || expandedState;

    const emptyStateModal = (
        <RSConfirmationModal
            show={confirmationModal}
            text={SELECT_BU}
            handleClose={() => setConfimrationModal(false)}
            handleConfirm={() => setConfimrationModal(false)}
            secondaryButton={false}
        />
    );

    const hasWebDomains = Array.isArray(isWebAppData) && isWebAppData.length > 0;
    const isAppContextReady = Boolean(isWebAppId?.id);
    const liveContextKey = isWebAppId?.id ? `${clientId}|${departmentId}|${isWebAppId.id}` : '';
    const isLiveDataPending = Boolean(liveContextKey) && liveContextKey !== webLiveFetchKeyRef.current;
    const showTabSkeleton =
        !isWebDomainListReady || (hasWebDomains && (!isAppContextReady || isLoading || isLiveDataPending));

    if (!hasWebDomains) {
        if (!isWebDomainListReady) {
            return (
                <>
                    <WebLiveTabSkeleton injectCriticalCss />
                    <RSConfirmationModal
                        show={confirmationModal}
                        text={SELECT_BU}
                        handleClose={() => setConfimrationModal(false)}
                        handleConfirm={() => setConfimrationModal(false)}
                        secondaryButton={false}
                    />
                </>
            );
        }

        return (
            <>
                <div className="mt10">
                    <RSSkeletonTable
                        message={
                            <>
                                Please
                                <i
                                    onClick={() => {
                                        navigate('/preferences/communication-settings', {
                                            state: {
                                                subfrom: 'WLD',
                                                tab: 0,
                                                subTab: 0,
                                                verticalTab: 2,
                                            },
                                        });
                                    }}
                                    className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large} ${!webAppAddAccess ? 'click-off' : ''} mx5`}
                                    id="rs_web_domain_config"
                                />
                                install the SDK on your website.
                            </>
                        }
                        count={7}
                        text
                        isAlertIcon={false}
                    />
                </div>
                <RSConfirmationModal
                    show={confirmationModal}
                    text={SELECT_BU}
                    handleClose={() => setConfimrationModal(false)}
                    handleConfirm={() => setConfimrationModal(false)}
                    secondaryButton={false}
                />
            </>
        );
    }

    if (showTabSkeleton) {
        return (
            <>
                <WebLiveTabSkeleton injectCriticalCss />
                {emptyStateModal}
            </>
        );
    }

    return (
        <>
            <Row>
                <Col md={4}>
                    <div className="portlet-container portlet-sm">
                        <div className="portlet-header">
                            <h4>
                                {VISITOR_STATUS}{' '}
                                <small className="d-inline-block">({AS_OF_TODAY})</small>
                            </h4>
                        </div>
                        <div className="portlet-body">
                            <div className="user-product">
                                <div className="v-center-inner">
                                    <img src={activeImg} alt={activeImg} width="120" />
                                    <div className="two-label-container">
                                        <LiveVisitorCount isWebAppId={isWebAppId} />
                                        <div className="two-label">
                                            <p> {UNIQUE_WEB_VISITORS}</p>
                                            <h3 className="user-count">
                                                {isEmpty(webData?.webLiveVisitorsList)
                                                    ? 0
                                                    : formatNumber(
                                                          webData?.webLiveVisitorsList[0]?.TotalWebLiveVisitors,
                                                      )}
                                                {/* {formatNumber(audienceCountData?.liveCount)} */}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <RSHighchartsContainer
                                    options={barChartOptions(WEB_LIVE_DASHBOARD_DATA.visitorBarChartWebData)}
                                /> */}
                        </div>
                    </div>
                </Col>
                <Col md={8}>
                    <div className="portlet-container portlet-sm">
                        <div className="portlet-header">
                            <h4>{TRAFFIC_BREAKDOWN_WEB_VISITORS}</h4>
                        </div>
                        <div className="portlet-body">
                            {isEmpty(webData?.dayWiseCounts) ? (
                                <DbSkPortletInlineSkeleton>
                                    <ListAqusitionSekelton
                                        isChartSkeleton
                                        isCustom
                                        isError={!isLoading}
                                        disableLegendAnimation={!isLoading}
                                        isCommunicationSent
                                    />
                                </DbSkPortletInlineSkeleton>
                            ) : (
                                <RSHighchartsContainer
                                    type="listAcquisitionCompact"
                                    smallText="Last 7 days"
                                    pClassName="x-axis-labels-performance"
                                    options={areasplineChartOptions(
                                        Format_active_visitor_traffic_ChartData(webData?.dayWiseCounts),
                                    )}
                                    isDashboard
                                />
                            )}
                        </div>

                        {/* <div className="portlet-footer portlet-two-label">
                            <ul>
                                <li>
                                    <span>{channelData?.conversion?.goalConversion}</span>
                                    <small>%</small>
                                </li>
                                <li>conversions happened during this period with 10 users registered</li>
                            </ul>
                        </div> */}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <div className="portlet-container keymetrics-portlet keymetrics-sm live-dashboard">
                        <h4>
                            {KEY_METRICS}
                            {!isEmpty(webData?.screenWiseCountList) && (
                                <small className="d-inline-block pl5">({LAST_28_DAYS})</small>
                            )}
                        </h4>
                        {isEmpty(webData?.screenWiseCountList) ? (
                            <DbSkPortletInlineSkeleton>
                                <KeyMetricsSmallSkeleton isError={!isLoading} />
                            </DbSkPortletInlineSkeleton>
                        ) : (
                            <>
                                <ul className="keymetrics-list key-border">
                                    <li>
                                        <h1 className="font-bold">
                                            {formatNumber(webData?.screenWiseCountList[0]?.Sessions)}
                                        </h1>
                                        <small className="color-secondary-black">{SESSIONS}</small>
                                    </li>
                                    <li>
                                        <h1 className="font-bold">
                                            {formatNumber(webData?.screenWiseCountList[0]?.pageViews)}
                                        </h1>
                                        <small className="color-secondary-black">{PAGE_VIEWS}</small>
                                    </li>
                                </ul>
                                <ul className="keymetrics-list keymetrics-theme">
                                    <li className="bg-blue-light">
                                        <h3>{formatTime(webData?.screenWiseCountList[0]?.AvgTimeSpent) ?? '0'}</h3>
                                        <small>{AVG_TIME_SPENT}</small>
                                    </li>
                                    <li className="bg-blue-medium">
                                        <h3>{formatNumber(webData?.screenWiseCountList[0]?.AvgPageBySession)}</h3>
                                        <small>{AVG_SCREEN_SESSION}</small>
                                    </li>
                                </ul>
                            </>
                        )}
                    </div>
                </Col>
                <Col md={8}>
                    <div className="justify-content-inherit keymetrics-portlet keymetrics-sm live-dashboard portlet-container">
                        <h4>
                            {ACTIVE_USERS}
                            {!isEmpty(webData?.userDevices) && (
                                <small className="d-inline-block pl5">({LAST_28_DAYS})</small>
                            )}
                        </h4>
                        {isEmpty(webData?.userDevices) ? (
                            <DbSkPortletInlineSkeleton>
                                <ActiveUsersSmallSkeleton isError={!isLoading} />
                            </DbSkPortletInlineSkeleton>
                        ) : (
                            <>
                                <ul className="keymetrics-list key-border mt50">
                                    <li>
                                        <h1 className="font-bold">
                                            {' '}
                                            {formatNumber(webData?.userDevices[0]?.dau ?? 'NA')}
                                        </h1>
                                        <div className="d-fex flex-row gap-2">
                                            <small className="color-secondary-black">{DAU}</small>
                                            <RSTooltip text={DAU_TEXT} className="lh0">
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </li>
                                    <li>
                                        <h1 className="font-bold">
                                            {' '}
                                            {formatNumber(webData?.userDevices[0]?.wau ?? 'NA')}
                                        </h1>
                                        <div className="d-flex flex-row gap-2">
                                            <small className="color-secondary-black">{WAU}</small>
                                            <RSTooltip text={WAU_TEXT} className="lh0">
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </li>
                                    <li>
                                        <h1 className="font-bold">
                                            {' '}
                                            {formatNumber(webData?.userDevices[0]?.mau ?? 'NA')}
                                        </h1>
                                        <div className="d-flex flex-row gap-2">
                                            <small className="color-secondary-black">{MAU}</small>
                                            <RSTooltip text={MAU_TEXT} className="lh0">
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                    id="circle_question_mark"
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </li>
                                </ul>
                                {/* <ul className="keymetrics-list keymetrics-theme d-none">
                                    <li className="bg-red-light">
                                        <h3>0</h3>
                                        <small>In-app errors</small>
                                    </li>
                                    <li className="bg-red-medium">
                                        <h3>0</h3>
                                        <small>Crashes</small>
                                    </li>
                                    <li className="bg-red-dark">
                                        <h3>0</h3>
                                        <small>Uninstalls</small>
                                    </li>
                                </ul> */}
                            </>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <div className={`portlet-container portlet-lg ${expandedState ? 'portlet-expanded' : ''}`}>
                        <div className="portlet-header">
                            <h4>{PATH_ANALYSER}</h4>
                            {levels?.length > 0 ? (
                                <div className="float-end">
                                    <div className="d-flex align-items-center">
                                        <BootstrapDropdown
                                            data={levelField}
                                            defaultItem={pathAnalyserDData}
                                            customAlignRight={true}
                                            alignRight
                                            className=""
                                            isActive
                                            onSelect={(item) => {
                                                if (!item) return;
                                                const levelCount = Math.min(6, Math.max(3, parseInt(String(item).split(' ')[0], 10) || 3));
                                                const data = Array.isArray(sankeyDropdownData) ? sankeyDropdownData : [];
                                                const slice = data.slice(0, levelCount);
                                                const temp = slice.map((d) => d?.uiPrintableName ?? '');
                                                const tempList = slice.map((d, i) => ({
                                                    field: `industry${i}`,
                                                    value: d?.uiPrintableName ?? '',
                                                }));
                                                setIsPathAnalyserLoading(true);
                                                setValue('levels', temp);
                                                setValue('industriesList', tempList);
                                                temp.forEach((v, i) => setValue(`industry${i}`, v));
                                                setPathAnalyserDData(item);
                                                handlegetPathAnalyser(tempList);
                                            }}
                                        />
                                        <RSTooltip
                                            text={'Download CSV'}
                                            position="top"
                                            innerContent={false}
                                            className={`ml15${canDownloadPathAnalyserCsv ? '' : ' pe-none click-off'}`}
                                        >
                                            <Icon
                                                icon={csv_download_medium}
                                                color="color-primary-blue"
                                                size="md"
                                                nocp={!canDownloadPathAnalyserCsv}
                                                callBack={() => {
                                                    if (!canDownloadPathAnalyserCsv) return;
                                                    handleDownloadPathAnalyserCSV();
                                                }}
                                            />
                                        </RSTooltip>
                                        <RSTooltip
                                            text={expandedState ? 'Collapse' : 'Expand'}
                                            position={expandedState ? 'bottom' : 'top'}
                                            innerContent={ expandedState ? true : false}
                                            className={`ml15 toolTipOverlayZindexCSS${canTogglePathAnalyserExpand ? '' : ' pe-none click-off'}`}
                                        >
                                            <Icon
                                                icon={expandedState ? collapse_medium : expand_medium}
                                                color="color-primary-blue"
                                                size="md"
                                                nocp={!canTogglePathAnalyserExpand}
                                                callBack={() => {
                                                    if (!canTogglePathAnalyserExpand) return;
                                                    setIsChartRendering(true);
                                                    setExpandedState(!expandedState);
                                                }}
                                            />
                                        </RSTooltip>
                                    </div>
                                </div>
                            ) : !levels?.length && !isPathAnalyserLoading ? (
                                <div className="float-end">
                                    <DashboardSkeletonScope className="db-sk-portlet-inline" injectCriticalCss>
                                        <DbSkPathAnalyserActionsSkeleton />
                                    </DashboardSkeletonScope>
                                </div>
                            ) : null}
                        </div>
                        <div className={`portlet-body ${levels?.length ? 'mt25' : 'mt15'}`}>
                            {isPathAnalyserLoading && !levels?.length ? (
                                <DashboardSkeletonScope className="db-sk-portlet-inline" injectCriticalCss>
                                    <DbSkPathAnalyserSkeleton
                                        hideHeader
                                        withPortletShell={false}
                                        filterCount={levels?.length || LIVE_PATH_ANALYSER_FILTER_COUNT_WEB}
                                    />
                                </DashboardSkeletonScope>
                            ) : !levels?.length ? (
                                <div className="mt10">
                                    <RSSkeletonTable
                                        message={
                                            <>
                                                Please
                                                <i
                                                    onClick={() => {
                                                        navigate('/preferences/communication-settings', {
                                                            state: {
                                                                subfrom: 'WLD',
                                                                tab: 0,
                                                                subTab: 0,
                                                                verticalTab: 2,
                                                            },
                                                        });
                                                    }}
                                                    className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large} ${!webAppAddAccess ? 'click-off' : ''} mx5`}
                                                    id="rs_web_domain_config"
                                                />
                                                install the SDK on your website.
                                            </>
                                        }
                                        count={7}
                                        text={true}
                                        isAlertIcon={false}
                                        fillHeight
                                    />
                                </div>
                            ) : (
                            <form onSubmit={handleSubmit((data) => {})}>
                                {levels?.length > 0  ? (
                                    <>
                                        <div className="sankey-chart-switch-setting">
                                            <Row>
                                                {levels?.length !== 0 &&
                                                    levels?.map((item, idx) => {
                                                        return (
                                                            <Col className="sankey-filter" key={idx}>
                                                                <div
                                                                    className="form-group mb30"
                                                                    id="rs_WebLiveAudienceDashboard_industrytype"
                                                                >
                                                                    <RSKendoDropDownList
                                                                        name={'industry' + idx}
                                                                        data={sankeyDropdownLabels}
                                                                        control={control}
                                                                        defaultValue={item}
                                                                        label={'Select type'}
                                                                        popupClass={expandedState ? "sankeydropdown" : ""}
                                                                        handleChange={(e) => {
                                                                            const newValue = e?.value !== undefined ? e?.value : e?.target?.value;
                                                                            if (newValue == null) return;
                                                                            const list = Array.isArray(industriesList) ? industriesList : [];
                                                                            const prevValue = list[idx]?.value;
                                                                            const existingIndex = list.findIndex(
                                                                                (item, i) => i !== idx && item?.value === newValue
                                                                            );
                                                                            const temp = list.map((item, i) => ({
                                                                                field: `industry${i}`,
                                                                                value:
                                                                                    i === idx
                                                                                        ? newValue
                                                                                        : i === existingIndex && existingIndex !== -1
                                                                                        ? prevValue
                                                                                        : item?.value ?? '',
                                                                            }));
                                                                            setIsPathAnalyserLoading(true);
                                                                            setValue('levels', temp.map((item) => item?.value));
                                                                            setValue('industriesList', temp);
                                                                            temp.forEach((item, i) => setValue(`industry${i}`, item?.value));
                                                                            handlegetPathAnalyser(temp);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </Col>
                                                        );
                                                    })}
                                            </Row>
                                        </div>
                                        <DbSkPathAnalyserChartSlot
                                            isExpanded={expandedState}
                                            isLoading={isPathAnalyserLoading || isChartRendering}
                                            isError={!isPathAnalyserLoading && !isChartRendering && !pathAnalyser?.length}
                                        >
                                            <RSHighchartsContainer
                                                type="sankey"
                                                ref={sankeyChartRef}
                                                options={sankeyChartOptions(
                                                    {
                                                        series: (isPathAnalyserLoading || isChartRendering) ? [] : pathAnalyser,
                                                        height: expandedState ? 450 : 310,
                                                        expanded: expandedState,
                                                        expectedLevels: Array.isArray(levels)
                                                            ? levels.length
                                                            : undefined,
                                                    },
                                                )}
                                                smallText={LAST_28_DAYS}
                                            />
                                        </DbSkPathAnalyserChartSlot>
                                    </>
                                ) : null}
                            </form>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{AUDIENCE_TYPES}</h4>
                        </div>
                        <div className="portlet-body">
                            {isAllValuesZero(webData?.knownUserWeb) ? (
                                <DashboardSkeletonScope className="db-sk-portlet-inline" injectCriticalCss>
                                    <DbSkPieChartSkeleton isError />
                                </DashboardSkeletonScope>
                            ) : (
                                <RSHighchartsContainer
                                    type="pie"
                                    options={pieChartOptions(
                                        FormatAudienceConversionChartData(webData?.knownUserWeb),
                                    )}
                                    smallText={LAST_28_DAYS}
                                />
                            )}
                        </div>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{AUDIENCE_CONVERSION}</h4>
                        </div>
                        <div className="portlet-body">
                            {isAllValuesZero(webData?.audienceConversionWeb) ? (
                                <DashboardSkeletonScope className="db-sk-portlet-inline" injectCriticalCss>
                                    <DbSkColumnChartSkeleton isError />
                                </DashboardSkeletonScope>
                            ) : (
                                <RSHighchartsContainer
                                    type="columnChart"
                                    options={pyramidChartOptions(
                                        FormatAudienceConversionChartData(webData?.audienceConversionWeb),
                                    )}
                                    smallText={LAST_28_DAYS}
                                />
                            )}
                            {/* <small className="portlet-info-text">Last 28 days</small> */}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <span className="d-flex">
                                <h4 className="pr5">{RETENTION}</h4>
                                {retentionData?.length > 0 && <small>({LAST_5_DAYS})</small>}
                            </span>
                            <div className={`float-end ${retentionData?.length === 0 ? 'click-off' : ''}`}>
                                <BootstrapDropdown
                                    data={dd_retention}
                                    flatIcon
                                    defaultItem={
                                        <i
                                            className={`${menu_dot_medium} icon-md`}
                                            id="rs_WebLiveAudienceDashboard_menu_dot"
                                        />
                                    }
                                    showUpdate={true}
                                    className="no_caret"
                                    isCustomDefaultIcon
                                    alignRight
                                    onSelect={(data) => {
                                        if (data === 'Identified') setRetentionData(webData['retentionidentifieWeb']);
                                        if (data === 'Known') setRetentionData(webData['retentionknownWeb']);
                                        if (data === 'Unknown') setRetentionData(webData['retentionunknownWeb']);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="portlet-body retention-table">
                            {retentionData?.length > 0 ? (
                                <RetentionTable
                                    tableHeader={FormatKnownRetentionData(retentionData)?.header}
                                    tableBody={FormatKnownRetentionData(retentionData)?.body}
                                />
                            ) : (
                                <DbSkPortletInlineSkeleton>
                                    <RetentionTableSkeleton isError={!isLoading} />
                                </DbSkPortletInlineSkeleton>
                            )}
                        </div>
                    </div>
                </Col>

                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{PRODUCT_ANALYTICS}</h4>
                        </div>
                        <div className="portlet-body pt10">
                            {productAnalytics?.children && !checkAllChildrenZero(productAnalytics?.children) ? (
                                <ProductAnalytics data={productAnalytics} />
                            ) : (
                                <DbSkPortletInlineSkeleton>
                                    <DbSkPieChartSkeleton isError={!isLoading} />
                                </DbSkPortletInlineSkeleton>
                            )}
                            {/* <small className="portlet-info-text">Last 28 days</small> */}
                        </div>

                        {/* {isEmpty(webData?.productAnalyticksWeb) ? (
                            <PieChartSkeleton isError={true} />
                        ) : (
                            <div className="portlet-body pt10">
                                <ProductAnalytics
                                    data={ProductData}
                                />
                            </div>
                        )} */}

                        <div className="portlet-body d-none">
                            <RSHighchartsContainer
                                type="pie"
                                options={variablePieChartOptions(
                                    webData?.productAnalyticksWeb,
                                    // WEB_LIVE_DASHBOARD_DATA.progressiveProfilePyramidChartWebData,
                                )}
                                // options={{}}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <DashBoardCard
                        name={TOP_PAGE_VIEWS}
                        // details={WEB_LIVE_DASHBOARD_DATA.topScreenViews}
                        details={webData?.userScreens}
                        smallText={LAST_28_DAYS}
                        isTopPage
                        isWebAppId={isWebAppId}
                        dropOffData={webData?.dropOff}
                        onDropOffChange={(view) => {
                            setCurrentPageView(view);
                        }}
                        pageViewsDropdownData={dd_top_page_views}
                        isError={!isLoading}
                    />
                </Col>
                <Col md={6}>
                    <DashBoardCard
                        name={TOP_EVENT_SUMMARY}
                        // details={WEB_LIVE_DASHBOARD_DATA.topEventSummary}
                        details={webData?.eventCountWebList}
                        isWebAppId={isWebAppId}
                        smallText={LAST_28_DAYS}
                        type={'web'}
                        isError={!isLoading}
                    />
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{BY_INTERESTS}</h4>
                        </div>
                        <div className="portlet-body">
                            {hasProductInterestWebData(webData) ? (
                                <RSHighchartsContainer
                                    type="pie"
                                    options={pieChartOptions(
                                        FormatByInterestPieChartData(
                                            JSON.parse(webData.productInterestList[0].productInterestList),
                                        ),
                                    )}
                                    smallText={'Last 28 days'}
                                />
                            ) : (
                                <DbSkPortletInlineSkeleton>
                                    <DbSkPieChartSkeleton isError={!isLoading} />
                                </DbSkPortletInlineSkeleton>
                            )}
                            {/* FormatProgressivePymaridChartMobData */}
                        </div>
                    </div>
                </Col>
                <Col md={6}>
                    <div className="portlet-container portlet-md">
                        <div className="portlet-header">
                            <h4>{PROGRESSIVE_PROFILE}</h4>
                        </div>
                        <div className="portlet-body">
                            {hasProgressiveProfileWebData(webData) ? (
                                <RSHighchartsContainer
                                    type="columnChart"
                                    options={pyramidChartOptions({
                                        series: formatProductAnalyticsData(
                                            JSON.parse(webData?.progressiveProfileWeb?.[0]?.tokensArrayprofile),
                                        ),
                                        showOriginalValue: true,
                                        reversed: true,
                                    })}
                                    smallText={'Last 28 days'}
                                />
                            ) : (
                                <DbSkPortletInlineSkeleton>
                                    <DbSkColumnChartSkeleton isError={!isLoading} />
                                </DbSkPortletInlineSkeleton>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <RSChartTabbar
                        dynamicTab={`mb0 mini`}
                        defaultClass={`tabTransparent pt0`}
                        activeClass={`active`}
                        tabData={[
                            {
                                id: 'by_device',
                                text: BY_DEVICE,
                                textClass: 'font-sm',
                                component: () => (
                                    <>
                                        {isEmpty(webData?.webWiseCountCustList) ? (
                                            <DbSkPortletInlineSkeleton>
                                                <DbSkPieChartSkeleton isError={!isLoading} />
                                            </DbSkPortletInlineSkeleton>
                                        ) : (
                                            <RSHighchartsContainer
                                                type="pie"
                                                key={'by_device'}
                                                smallText={`Last 28 days`}
                                                options={pieChartOptions(
                                                    FormatPieChartData(webData?.webWiseCountCustList),
                                                )}
                                                // options={{}}
                                            />
                                        )}
                                    </>
                                ),
                            },
                            {
                                id: 'by_browser',
                                text: BY_BROWSER,
                                textClass: 'font-sm',
                                component: () => (
                                    <>
                                        {isEmpty(webData?.webVersionList) ? (
                                            <DbSkPortletInlineSkeleton>
                                                <DbSkPieChartSkeleton isError={!isLoading} />
                                            </DbSkPortletInlineSkeleton>
                                        ) : (
                                            <RSHighchartsContainer
                                                type="pie"
                                                key={'by_browser'}
                                                smallText={LAST_28_DAYS}
                                                options={pieChartOptions(
                                                    FormatPieChartData(webData?.webVersionList),
                                                )}
                                            />
                                        )}
                                    </>
                                ),
                            },
                        ]}
                        className="rs-tabs row"
                        componentClassName={'mt30'}
                    />
                </Col>
                <Col md={6} className="usage_behav">
                    <RSChartTabbar
                        chartHeading="Usage behaviour"
                        dynamicTab={`mb0 mini`}
                        defaultClass={`tabTransparent pt0`}
                        activeClass={`active`}
                        footer={!isEmpty(webData?.byDaysCountWeb) && !isEmpty(webData?.hourWiseCounts) ? true : false}
                        containerClass="pfooter"
                        tabData={[
                            {
                                id: 'by_days',
                                text: BY_DAYS,
                                textClass: 'font-sm',
                                component: () => (
                                    <>
                                        {isEmpty(webData?.byDaysCountWeb) ? (
                                            <DbSkPortletInlineSkeleton>
                                                <DbSkColumnChartSkeleton isError={!isLoading} withTopOffset />
                                            </DbSkPortletInlineSkeleton>
                                        ) : (
                                            <>
                                                <RSHighchartsContainer
                                                    type="columnChart"
                                                    key={'by_days'}
                                                    // smallText={`Last 28 days`}
                                                    options={columnChartOptions(
                                                        FormatgetUserBehaviorByDays(
                                                            webData?.byDaysCountWeb,
                                                            true,
                                                        ),
                                                    )}
                                                    smallText={LAST_28_DAYS}
                                                    footerPercent={byDaysMaxState?.maxPercentage}
                                                    footerText={
                                                        <>
                                                            {WEBSITE_APP_ENGAGE}&nbsp;
                                                            <span className="font-bold">{byDaysMaxState?.maxState}</span>
                                                        </>
                                                    }
                                                />
                                                {/* <small className="portlet-info-text">{LAST_7_DAYS}</small> */}
                                            </>
                                        )}
                                    </>
                                ),
                            },
                            {
                                id: 'by_hours',
                                text: BY_HOURS,
                                textClass: 'font-sm',
                                component: () => (
                                    <>
                                        {isEmpty(webData?.hourWiseCounts) ? (
                                            <DbSkPortletInlineSkeleton>
                                                <DbSkGaugeChartSkeleton isError={!isLoading} />
                                            </DbSkPortletInlineSkeleton>
                                        ) : (
                                            <RSHighchartsContainer
                                                type="pie"
                                                key={'by_hours'}
                                                // smallText={`Last 24 hours`}
                                                options={gaugeChartOptions(
                                                    FormatgetByHoursMobile(webData?.hourWiseCounts),
                                                )}
                                                smallText={LAST_28_DAYS}
                                                footerPercent={maxHours?.maxHoursPercentage}
                                                footerText={
                                                    <>
                                                        {VISITORS_ENGAGE}{' '}
                                                        <span className="font-bold">
                                                            &nbsp;{maxHours?.maxHoursTimeRange}
                                                        </span>
                                                    </>
                                                }
                                            />
                                        )}
                                        {/* <small className="portlet-info-text">Last 24 hours</small>
                                        <div className="portlet-footer portlet-two-label">
                                            <ul className="d-flex justify-content-start align-items-center">
                                                <li>
                                                    <span>{maxHours?.maxHoursPercentage}</span>
                                                    <small className="d-inline">%</small>
                                                </li>
                                                <li>
                                                    {' '}
                                                    of the visitors engage during{' '}
                                                    <span className="font-bold">
                                                        &nbsp;{maxHours?.maxHoursTimeRange}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div> */}
                                    </>
                                ),
                                // footer: (
                                //     <div className="portlet-footer portlet-two-label">
                                //         <ul>
                                //             <li>
                                //                 <span>{maxHours?.maxHoursPercentage}</span>
                                //                 <small>%</small>
                                //             </li>
                                //             <li>of the visitors engage during {maxHours?.maxHoursTimeRange}</li>
                                //         </ul>
                                //     </div>
                                // ),
                            },
                        ]}
                        className="rs-tabs row"
                        componentClassName={'mt30'}
                    />
                </Col>
            </Row>
            {emptyStateModal}
        </>
    );
};

export default WebLiveAudienceDashboard;
