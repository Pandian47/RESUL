import { formatNumber, formatTime } from 'Utils/modules/campaignUtils';
import { getUserDetails, encodeUrl, getPermissions } from 'Utils/modules/crypto';
import { downloadCSV } from 'Utils/modules/download';
import { handleCustomNavigationDetails, createCommunicationSettingsNavState, NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { ActiveUsersSmallSkeleton, KeyMetricsSmallSkeleton, ListAqusitionSekelton, RetentionTableSkeleton } from 'Components/Skeleton/Skeleton';
import { FormatKnownRetentionData, FormatPieChartData, FormatPieChartDataVersion, Format_active_visitor_traffic_ChartMobData, FormatactiveTypesBarChartMobData, FormatactiveTypesPymaridChartMobData, FormatgetByHoursMobile, FormatgetUserBehaviorByDays, dd_retention, dd_top_screen_views, findByDaysMaxStateAndPercentage, findLocationMaxStateAndPercentage, findMaxDeviceLanguage, findMaxEngagementTimeAndPercentage, getFullDayName, getLanguageTooltipFormatter, getLocationDetails } from './constants';
import { sankeyChartOptions } from 'Constants/Charts';
import { areasplineChartOptions, barChartOptions, columnChartOptions, gaugeChartOptions, mapTopoChartOptions, pieChartOptions, pyramidChartOptions } from 'Constants/Charts';
import { ACTIVE_USERS, ACTIVE_VISITORS_TRAFFIC, APP_LANGUAGE, APP_VERSIONS, AS_OF_TODAY, AUDIENCE_TYPES, AVG_SCREEN_SESSION, AVG_TIME_SPENT, BY_DAYS, BY_HOURS, CRASHES, DAU, DAU_TEXT, DEVICE, GEOGRAPHIC, IN_APP_ERRORS, KEY_METRICS, KNOWN_AUDIENCE_TO_CONVERSION, LAST_24_HOURS, LAST_28_DAYS, LAST_5_DAYS, LAST_7_DAYS, LIVE_VISITORS, LOCATION, MAU, MAU_TEXT, MOBILE_APP_ENGAGE, OPERATING_SYSTEM, OS_VERSIONS, PATH_ANALYSER, RETENTION, SCREEN_VIEWS, SELECT_BU, SESSIONS, TOP_EVENT_SUMMARY, TOP_SCREEN_VIEWS, TOTAL_INSTALLATIONS, UNINSTALLS, USAGE_BEHAVIOUR, VISITORS_ENGAGE, VISITOR_STATUS, WAU, WAU_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_question_mark_mini, collapse_medium, csv_download_medium, expand_medium, menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import _find from 'lodash/find';
import { isEmpty } from 'lodash';

// Local imports
// Components
import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RetentionTable from './Components/RetentionTable';
import DashBoardCard from '../../Component/DashboardCard';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSTooltip from 'Components/RSTooltip';
import Icon from 'Components/Icon/Icon';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import MobileLiveTabSkeleton from 'Components/Skeleton/pages/dashboard/mobile/MobileLiveTabSkeleton';
import DashboardSkeletonScope from 'Components/Skeleton/pages/dashboard/DashboardSkeletonScope';
import {
    DbSkColumnChartSkeleton,
    DbSkGaugeChartSkeleton,
    DbSkPathAnalyserActionsSkeleton,
    DbSkPathAnalyserChartSlot,
    DbSkPathAnalyserSkeleton,
    DbSkPieChartSkeleton,
    DbSkPortletInlineSkeleton,
    LIVE_PATH_ANALYSER_FILTER_COUNT_MOBILE,
} from 'Components/Skeleton/pages/dashboard';

// Selectors
import { getSessionId } from 'Reducers/globalState/selector';

// Actions
import {
  getAudienceCountMobile,
  getLiveCountDashboard,
  getMobileAppDasdhboard,
  getMobilePathAnalyser,
  getPathAnalyserDDL,
} from 'Reducers/dashboard/mobileLiveDashboard/request';

// Utilities

import RSPLogger from 'Utils/RSPLogger/RSPLogger';

// Assets
import activeImg from 'Assets/Images/active.svg';

// Context
import { DashboardContext } from '../../Dashboard';

// Socket URL
import { MOBILELIVESOCKETURL } from 'Constants/EndPoints';
import useQueryParams from 'Hooks/useQueryParams';

// Global socket management to prevent multiple connections - defined outside component
const globalSocketManager = {
  socket: null,
  isConnecting: false,
  reconnectTimeout: null,
  appGuid: null,
  reconnectAttempts: 0,
  usersMap: new Map(),
  onCountUpdate: null,
};

const notifyLiveVisitorCount = () => {
  globalSocketManager.onCountUpdate?.(globalSocketManager.usersMap.size);
};

const registerSocketListeners = (appGuid) => {
  const socket = globalSocketManager.socket;
  if (!socket) return;

  socket.off(appGuid);
  socket.off('UserDisconnected');

  socket.on(appGuid, (msg) => {
    if (!msg?.socketId) return;
    globalSocketManager.usersMap.set(msg.socketId, msg);
    notifyLiveVisitorCount();
  });

  socket.on('UserDisconnected', (user) => {
    globalSocketManager.usersMap.delete(user);
    notifyLiveVisitorCount();
  });
};

const joinLiveDashboard = (appGuid) => {
  globalSocketManager.socket?.emit('livedashboard', { appId: appGuid });
};

// MobileVisitorCount component - defined outside to prevent recreation on every render
const MobileVisitorCount = memo(({ isMobileAppId, onCountChange }) => {
  const [localNewCount, setLocalNewCount] = useState(0);
  const mountedRef = useRef(true);
  const initializeSocketRef = useRef(null);

  const cleanupSocket = useCallback(() => {
    if (globalSocketManager.socket) {
      globalSocketManager.socket.removeAllListeners();
      globalSocketManager.socket.disconnect();
      globalSocketManager.socket = null;
    }
    globalSocketManager.isConnecting = false;
    globalSocketManager.reconnectAttempts = 0;
    globalSocketManager.usersMap.clear();
    if (globalSocketManager.reconnectTimeout) {
      clearTimeout(globalSocketManager.reconnectTimeout);
      globalSocketManager.reconnectTimeout = null;
    }
  }, []);

  const scheduleReconnect = useCallback((appGuid) => {
    if (globalSocketManager.reconnectTimeout) {
      clearTimeout(globalSocketManager.reconnectTimeout);
      globalSocketManager.reconnectTimeout = null;
    }

    if (globalSocketManager.reconnectAttempts >= 5) {
      RSPLogger.debug('Max reconnection attempts reached, stopping reconnection');
      return;
    }

    const reconnectDelay = Math.min(2000 * Math.pow(2, globalSocketManager.reconnectAttempts), 32000);
    globalSocketManager.reconnectAttempts++;

    RSPLogger.debug(`Scheduling reconnection attempt ${globalSocketManager.reconnectAttempts} in ${reconnectDelay}ms for app:`, appGuid);

    globalSocketManager.reconnectTimeout = setTimeout(() => {
      if (mountedRef.current && !globalSocketManager.socket && !globalSocketManager.isConnecting) {
        initializeSocketRef.current?.(appGuid);
      }
    }, reconnectDelay);
  }, []);

  const initializeSocketConnection = useCallback((appGuid) => {
    if (globalSocketManager.isConnecting) {
      RSPLogger.debug('Socket connection already in progress');
      return;
    }

    if (globalSocketManager.socket?.connected && globalSocketManager.appGuid === appGuid) {
      registerSocketListeners(appGuid);
      joinLiveDashboard(appGuid);
      notifyLiveVisitorCount();
      return;
    }

    if (globalSocketManager.socket && globalSocketManager.appGuid !== appGuid) {
      cleanupSocket();
    }

    globalSocketManager.isConnecting = true;
    globalSocketManager.appGuid = appGuid;

    try {
      RSPLogger.debug('Initializing new socket connection for app:', appGuid);

      globalSocketManager.socket = window.io.connect(MOBILELIVESOCKETURL, {
        transports: ['websocket'],
        reconnection: false,
        timeout: 20000,
        forceNew: false,
      });

      registerSocketListeners(appGuid);

      const handleConnect = () => {
        RSPLogger.debug('Socket connected for Mobile Live Audience Dashboard');
        globalSocketManager.isConnecting = false;
        globalSocketManager.reconnectAttempts = 0;
        joinLiveDashboard(appGuid);
      };

      globalSocketManager.socket.on('connect', handleConnect);

      if (globalSocketManager.socket.connected) {
        handleConnect();
      }

      globalSocketManager.socket.on('disconnect', (reason) => {
        RSPLogger.debug('Socket disconnected for Mobile Live Audience Dashboard:', reason);
        globalSocketManager.socket = null;
        globalSocketManager.isConnecting = false;

        if (reason !== 'io client disconnect' && mountedRef.current) {
          scheduleReconnect(appGuid);
        }
      });

      globalSocketManager.socket.on('connect_error', (error) => {
        RSPLogger.debug('Socket connection error:', error);
        globalSocketManager.socket = null;
        globalSocketManager.isConnecting = false;

        if (mountedRef.current) {
          scheduleReconnect(appGuid);
        }
      });
    } catch (error) {
      RSPLogger.error('Socket initialization error:', error);
      globalSocketManager.isConnecting = false;
      if (mountedRef.current) {
        scheduleReconnect(appGuid);
      }
    }
  }, [cleanupSocket, scheduleReconnect]);

  initializeSocketRef.current = initializeSocketConnection;

  useEffect(() => {
    mountedRef.current = true;
    const appGuid = isMobileAppId?.appGuid;

    globalSocketManager.onCountUpdate = (count) => {
      if (!mountedRef.current) return;
      setLocalNewCount(count);
      onCountChange?.(count);
    };

    if (!appGuid) {
      cleanupSocket();
      setLocalNewCount(0);
      return () => {
        mountedRef.current = false;
        globalSocketManager.onCountUpdate = null;
      };
    }

    if (appGuid !== globalSocketManager.appGuid) {
      globalSocketManager.usersMap.clear();
      globalSocketManager.reconnectAttempts = 0;
    }

    initializeSocketConnection(appGuid);

    const currentCount = globalSocketManager.usersMap.size;
    setLocalNewCount(currentCount);
    onCountChange?.(currentCount);

    return () => {
      mountedRef.current = false;
      globalSocketManager.onCountUpdate = null;
    };
  }, [isMobileAppId?.appGuid, cleanupSocket, initializeSocketConnection, onCountChange]);

  return (
    <h3 className="user-count">{formatNumber(localNewCount)}</h3>
  );
});

// Add display name for debugging
MobileVisitorCount.displayName = 'MobileVisitorCount';

const MobileLiveAudienceDashboard = () => {
  // Selectors
  const locationState = useQueryParams()
  const { isMobileAppId, isMobileAppData, isMobileAppListReady } = useSelector(({ globalstate }) => globalstate);
  const { departmentId, clientId, userId, departmentName } = useSelector(getSessionId);
  const { licenseTypeId } = getUserDetails();

  // State
  const [confirmationModal, setConfimrationModal] = useState(false);
  const [snapIPreview, setSnapIPreview] = useState(false);
  const [audienceCountData, setAudienceCountData] = useState({
    totalCount: 0,
    liveCount: 0,
  });
  const [mobileAppData, setMobileAppData] = useState({});
  const isAllValuesZero = (data) => {
    if (isEmpty(data)) return true;
    if (Array.isArray(data) && data.length > 0) {
      return data?.every(item => {
        return Object.values(item || {}).every(value => {
          return typeof value === 'number' ? value === 0 : true;
        });
      });
    }
    return true;
  };

  const [retentionData, setRetentionData] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [locationMaxState, setLocationMaxState] = useState({
    maxCountry: null,
    maxPercentage: 0,
  });
  const [byDaysMaxState, setByDaysMaxState] = useState({
    maxState: null,
    maxPercentage: 0,
  });
  const [languageMaxState, setLanguageMaxState] = useState({
    maxState: null,
    maxPercentage: 0,
  });
  const [maxHours, setMaxHours] = useState({
    maxHoursPercentage: 0,
    maxHoursTimeRange: 0,
  });
  const [expandedState, setExpandedState] = useState(false);
  const [isChartRendering, setIsChartRendering] = useState(false);
  const [pathAnalyserDData, setPathAnalyserDData] = useState('5 Levels');
  const [pathAnalyser, setPathAnalyser] = useState([]);
  const [pathAnalyserfulldata, setPathAnalyserfulldata] = useState([]);
  const [isPathAnalyserLoading, setIsPathAnalyserLoading] = useState(false);
  const sankeyChartRef = useRef(null);

  const [sankeyDropdownData, setSankeyDropdownData] = useState([]);

  const levelField = useMemo(() => {
    const dataLen = Array.isArray(sankeyDropdownData) ? sankeyDropdownData.length : 0;
    const maxLevel = Math.min(5, Math.max(3, dataLen || 3));
    const len = Math.max(0, maxLevel - 2);
    return Array.from({ length: len }, (_, i) => `${i + 3} Levels`);
  }, [sankeyDropdownData?.length]);

  const sankeyDropdownLabels = useMemo(
    () => (Array.isArray(sankeyDropdownData) ? sankeyDropdownData : []).map((d) => (typeof d === 'object' && d?.uiPrintableName != null ? d.uiPrintableName : String(d))),
    [sankeyDropdownData]
  );

  const initialMaxLevel = Math.min(5, Math.max(3, Array.isArray(sankeyDropdownData) ? sankeyDropdownData.length : 0));
  const initialSankeyLabels = (Array.isArray(sankeyDropdownData) ? sankeyDropdownData.slice(0, initialMaxLevel) : []).map((d) =>
    typeof d === 'object' && d?.uiPrintableName != null ? d.uiPrintableName : String(d)
  );
  const initialIndustriesList = initialSankeyLabels.map((value, i) => ({ field: `industry${i}`, value }));
  const initialIndustryValues = initialSankeyLabels.reduce((acc, v, i) => ({ ...acc, [`industry${i}`]: v }), {});

  // Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { control, watch, setValue, getValues } = useForm({
    defaultValues: {
      industriesList: initialIndustriesList,
      ...initialIndustryValues,
      levels: initialSankeyLabels,
    },
    mode: 'onBlur',
  });
  const [industriesList, levels] = watch(['industriesList', 'levels']);
  const { currentRenderDashBoardTitle } = useContext(DashboardContext);

  // Permissions
  const permissionList = getPermissions();
  const { addAccess: mobileAppAddAccess } = _find(permissionList, { featureId: 15 }) || {};

  // Memoized data
  const dayWiseCounts = useMemo(() => mobileAppData?.dayWiseCounts || [], [mobileAppData]);
  const isAllZeroDaywiseAudience = useMemo(() =>
    dayWiseCounts?.every(item => Number(item.dayWiseCount) === 0),
    [dayWiseCounts]
  );

  // Callback for count changes from MobileVisitorCount
  const handleCountChange = useCallback((count) => {
    setNewCount(count);
  }, []);

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (globalSocketManager.reconnectTimeout) {
        clearTimeout(globalSocketManager.reconnectTimeout);
        globalSocketManager.reconnectTimeout = null;
      }
      if (globalSocketManager.socket) {
        globalSocketManager.socket.removeAllListeners();
        globalSocketManager.socket.disconnect();
        globalSocketManager.socket = null;
      }
      globalSocketManager.isConnecting = false;
      globalSocketManager.reconnectAttempts = 0;
      globalSocketManager.usersMap.clear();
      globalSocketManager.onCountUpdate = null;
    };
  }, []);

  // Data fetching functions
  const handleGetCount = useCallback(async () => {
    if (!isMobileAppId?.appGuid) return;

    const payload = {
      appId: isMobileAppId.appGuid,
      clientId,
      departmentId,
      userId,
    };

    try {
      const res = await dispatch(getAudienceCountMobile(payload));
      setAudienceCountData(prev => ({
        ...prev,
        totalCount: res?.status ? res.mobilepushcount : 0
      }));
    } catch (error) {
      setAudienceCountData(prev => ({ ...prev, totalCount: 0 }));
    }
  }, [isMobileAppId, clientId, departmentId, userId, dispatch]);

  const handleGetMobileAppData = useCallback(async () => {
    if (!isMobileAppId?.appGuid) return;

    const payload = {
      appId: isMobileAppId.appGuid,
      clientId,
      departmentId,
      userId,
    };

    try {
      const res = await dispatch(getMobileAppDasdhboard(payload));
      if (res?.status) {
        setMobileAppData(res?.data);
        setRetentionData(res?.data?.retentionknownMobile || []);
      } else {
        setMobileAppData({});
        setRetentionData([]);
      }
    } catch (error) {
      setMobileAppData({});
      setRetentionData([]);
    }
  }, [isMobileAppId, clientId, departmentId, userId, dispatch]);

  const handleGetLiveCountData = useCallback(async () => {
    if (!isMobileAppId?.appGuid) return;

    const payload = {
      appId: isMobileAppId.appGuid,
      clientId,
      departmentId,
      userId,
    };

    try {
      const res = await dispatch(getLiveCountDashboard(payload));
      setAudienceCountData(prev => ({
        ...prev,
        liveCount: res?.status ? res.applivecount : 0
      }));
    } catch (error) {
      setAudienceCountData(prev => ({ ...prev, liveCount: 0 }));
    }
  }, [isMobileAppId, clientId, departmentId, userId, dispatch]);

  const generatePathAnalyzerString = useCallback((list, dataSource) => {
    if (!Array.isArray(list) || list.length === 0) return '';
    const data = Array.isArray(dataSource) ? dataSource : (Array.isArray(sankeyDropdownData) ? sankeyDropdownData : []);
    return list
      .map((item) => {
        const value = item?.value;
        if (value == null || value === '') return '';
        const found = data.find((d) => (typeof d === 'object' && d?.uiPrintableName === value) || d === value);
        return typeof found === 'object' && found?.attributeName != null ? found.attributeName : value;
      })
      .filter(Boolean)
      .join('-');
  }, [sankeyDropdownData]);

  const handleGetPathAnalyser = useCallback(async (industriesListOverride, sankeyDataOverride) => {
    const list = Array.isArray(industriesListOverride) && industriesListOverride.length > 0
      ? industriesListOverride
      : getValues('industriesList') ?? [];
    const pathanalyzerString = generatePathAnalyzerString(list, sankeyDataOverride);
    const payload = {
      appid: isMobileAppId.appGuid,
      clientId,
      departmentId,
      userId,
      pathanalyzer: pathanalyzerString,
    };
    setIsPathAnalyserLoading(true);
    try {
      const res = await dispatch(getMobilePathAnalyser(payload));
      const { pathAnalyzerList, pathAnalyserfulldata } = res || {};
      setPathAnalyser(pathAnalyzerList || []);
      setPathAnalyserfulldata([]);
    } catch (error) {
      setPathAnalyser([]);
      setPathAnalyserfulldata([]);
    } finally {
      setIsPathAnalyserLoading(false);
    }
  }, [isMobileAppId, clientId, departmentId, userId, dispatch, getValues, generatePathAnalyzerString]);

  const getPathAnalyserDDLData = useCallback(async () => {
    try {
      const payload = {
        pathtype: 'M',
        clientId,
        departmentId,
        userId,
        appid: isMobileAppId.appGuid,
      };
      const res = await dispatch(getPathAnalyserDDL(payload));
      if (res?.status && Array.isArray(res?.data) && res?.data?.length > 0) {
        const data = res?.data;
        setSankeyDropdownData(data);
        const levelCount = Math.min(5, Math.max(3, data.length));
        const temp = data.slice(0, levelCount).map((d) => (typeof d === 'object' && d?.uiPrintableName != null ? d.uiPrintableName : String(d)));
        const tempList = temp.map((value, i) => ({ field: `industry${i}`, value }));
        setPathAnalyserDData(`${levelCount} Levels`);
        setValue('levels', temp);
        setValue('industriesList', tempList);
        temp.forEach((v, i) => setValue(`industry${i}`, v));
        await handleGetPathAnalyser(tempList, data);
      }
      if (res?.status === false || (res && !res?.status)) {
        setSankeyDropdownData([]);
      }
    } catch (err) {
      setSankeyDropdownData([]);
    }
  }, [clientId, departmentId, userId, dispatch, setValue, handleGetPathAnalyser]);

  // useEffect(() => {
  //   getPathAnalyserDDLData();
  // }, [clientId, departmentId]);

  useEffect(() => {
    const data = Array.isArray(sankeyDropdownData) ? sankeyDropdownData : [];
    if (data.length === 0) return;
    const levelCount = Math.min(5, Math.max(3, data.length));
    const temp = data.slice(0, levelCount).map((d) => (typeof d === 'object' && d?.uiPrintableName != null ? d.uiPrintableName : String(d)));
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

  // CSV Download handler for path analyser
  const handleDownloadPathAnalyserCSV = useCallback(() => {
    if (!pathAnalyser || pathAnalyser.length === 0) {
      return;
    }
    const formatAppName = (appName) => {
      if (!appName) return 'path-analyser';
      let cleanName = appName.toLowerCase();
      cleanName = cleanName.replace(/[^a-z0-9]/g, '-');
      return cleanName;
    };
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
    const appName = formatAppName(isMobileAppId?.appName);
    const filename = `${appName} ${dateTimeString}.csv`;
    const csvData = pathAnalyser.map((item) => ({
      From: item?.from || '',
      To: item?.to || '',
      Visitors: item?.weight || item?.value || 0,
    }));

    downloadCSV(csvData, filename);
  }, [pathAnalyser, isMobileAppId]);

  const hasPathAnalyserData = pathAnalyser?.length > 0 && !isPathAnalyserLoading && !isChartRendering;
  const canDownloadPathAnalyserCsv = hasPathAnalyserData;
  const canTogglePathAnalyserExpand = hasPathAnalyserData || expandedState;

  // Navigation handler
  const handleDlNavigation = useCallback(() => {
    const state = {
      dynamicListName: `uninstall_${new Date().toDateString()}_${new Date().getHours()}_${new Date().getMinutes()}_${new Date().getSeconds()}`,
      dashboard: 'mobile',
      isWeb: {},
      isMobile: isMobileAppId,
      eventName: 'Yes',
      MatchType: 'All',
      from: 'dashboard',
      screenName: 'Yes',
      ruleType: 'Uninstalls',
      ...handleCustomNavigationDetails(locationState)
    };

    const url = '/audience/create-dynamic-list';
    const encryptState = encodeUrl(state);
    navigate(`${url}?q=${encryptState}`, { state });
  }, [isMobileAppId, navigate]);

  // Max state calculations
  useEffect(() => {
    if (mobileAppData?.byDaysCountMobile) {
      const { value, percentage } = findByDaysMaxStateAndPercentage(mobileAppData.byDaysCountMobile);
      const formatDayName = getFullDayName(value);
      setByDaysMaxState({
        maxState: formatDayName,
        maxPercentage: percentage,
      });
    }

    if (mobileAppData?.deviceLocationsList) {
      const { value, percentage } = findLocationMaxStateAndPercentage(mobileAppData.deviceLocationsList);
      setLocationMaxState({
        maxCountry: value,
        maxPercentage: percentage,
      });
    }

    if (mobileAppData?.deviceLanguageList) {
      const { deviceLanguage, percentage } = findMaxDeviceLanguage(mobileAppData.deviceLanguageList);
      setLanguageMaxState({
        maxState: deviceLanguage,
        maxPercentage: percentage,
      });
    }

    const { percentage, timeRange } = findMaxEngagementTimeAndPercentage(mobileAppData?.hourWiseCounts || []);
    setMaxHours({
      maxHoursPercentage: percentage,
      maxHoursTimeRange: timeRange,
    });
  }, [mobileAppData]);

  const mobileLiveFetchKeyRef = useRef('');
  const mobileLiveFetchGenerationRef = useRef(0);

  useEffect(() => {
    if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
      setConfimrationModal(true);
      return;
    }

    setConfimrationModal(false);

    if (currentRenderDashBoardTitle !== 'Mobile live dashboard') {
      return;
    }

    if (!isMobileAppId?.appGuid) {
      return;
    }

    const fetchKey = `${clientId}|${departmentId}|${isMobileAppId.appGuid}`;
    if (mobileLiveFetchKeyRef.current === fetchKey) {
      setIsLoading(false);
      return;
    }
    mobileLiveFetchKeyRef.current = fetchKey;
    const generation = ++mobileLiveFetchGenerationRef.current;

    setIsLoading(true);
    setMobileAppData({});
    setRetentionData([]);
    setPathAnalyser([]);
    setPathAnalyserfulldata([]);

    const loadMobileDashboard = async () => {
      try {
        await Promise.all([
          handleGetCount(),
          handleGetMobileAppData(),
          handleGetLiveCountData(),
        ]);
        if (generation !== mobileLiveFetchGenerationRef.current) return;
        await getPathAnalyserDDLData();
        if (generation === mobileLiveFetchGenerationRef.current) {
          setIsLoading(false);
        }
      } catch {
        if (generation === mobileLiveFetchGenerationRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadMobileDashboard();

    return () => {
      mobileLiveFetchGenerationRef.current += 1;
    };
  }, [
    isMobileAppId?.appGuid,
    clientId,
    departmentId,
    currentRenderDashBoardTitle,
    departmentName,
    licenseTypeId,
  ]);

  // Window resize effect
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

  // Chart data formatting
  const formatActiveVisitorTrafficData = useMemo(() =>
    Format_active_visitor_traffic_ChartMobData(dayWiseCounts),
    [dayWiseCounts]
  );

  // Render helpers
  const renderVisitorStatus = () => (
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
            <div className="v-center-inner mt20">
              <img src={activeImg} alt={activeImg} width="120" />
              <div className="two-label-container">
                <div className="two-label">
                  <p>{LIVE_VISITORS}</p>
                  <MobileVisitorCount isMobileAppId={isMobileAppId} onCountChange={handleCountChange} />
                </div>
                <div className="two-label">
                  <p>{TOTAL_INSTALLATIONS}</p>
                  <h3 className="user-count">
                    {formatNumber(audienceCountData?.totalCount)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Col>
  );

  const renderActiveVisitorsTraffic = () => (
    <Col md={8}>
      <div className="portlet-container portlet-sm">
        <div className="portlet-header">
          <h4>
            {ACTIVE_VISITORS_TRAFFIC}{' '}
            {!isEmpty(dayWiseCounts) && (
              <small className="d-inline-block">({LAST_7_DAYS})</small>
            )}
          </h4>
        </div>
        <div className="portlet-body">
          {isLoading || isEmpty(dayWiseCounts) || isAllZeroDaywiseAudience ? (
            <DbSkPortletInlineSkeleton>
              <ListAqusitionSekelton
                isChartSkeleton
                isCustom
                isError={!isLoading && (isEmpty(dayWiseCounts) || isAllZeroDaywiseAudience)}
                disableLegendAnimation={!isLoading}
                isCommunicationSent
              />
            </DbSkPortletInlineSkeleton>
          ) : (
            <RSHighchartsContainer
              type={'listAcquisitionCompact'}
              pClassName="x-axis-labels-performance"
              options={areasplineChartOptions(formatActiveVisitorTrafficData)}
              isDashboard
            />
          )}
        </div>
      </div>
    </Col>
  );

  const renderKeyMetrics = () => (
    <Col md={4}>
      <div className="portlet-container keymetrics-portlet keymetrics-sm live-dashboard">
        <h4>
          {KEY_METRICS}{' '}
          {!isEmpty(mobileAppData?.screenWiseCountList) && (
            <small className="d-inline-block">({LAST_28_DAYS})</small>
          )}
        </h4>
        {isEmpty(mobileAppData?.screenWiseCountList) ? (
          <DbSkPortletInlineSkeleton>
            <KeyMetricsSmallSkeleton isError={!isLoading} />
          </DbSkPortletInlineSkeleton>
        ) : (
          <>
            <ul className="keymetrics-list key-border">
              <li>
                <h1 className="font-bold">
                  {formatNumber(mobileAppData.screenWiseCountList[0]?.Sessions ?? 'NA')}
                </h1>
                <small className="color-secondary-black">{SESSIONS}</small>
              </li>
              <li>
                <h1 className="font-bold">
                  {formatNumber(mobileAppData.screenWiseCountList[0]?.ScreenViews ?? 'NA')}
                </h1>
                <small className="color-secondary-black">{SCREEN_VIEWS}</small>
              </li>
            </ul>
            <ul className="keymetrics-list keymetrics-theme">
              <li className="bg-blue-light">
                <h3>{formatTime(mobileAppData.screenWiseCountList[0]?.AvgTimeSpent ?? 'NA')}</h3>
                <small>{AVG_TIME_SPENT}</small>
              </li>
              <li className="bg-blue-medium">
                <h3>{mobileAppData.screenSessionCountList[0]?.AvgScreenBySession ?? 'NA'}</h3>
                <small>{AVG_SCREEN_SESSION}</small>
              </li>
            </ul>
          </>
        )}
      </div>
    </Col>
  );

  const renderActiveUsers = () => (
    <Col md={8}>
      <div className="portlet-container keymetrics-portlet keymetrics-sm live-dashboard">
        <h4>
          {ACTIVE_USERS}{' '}
          {!isEmpty(mobileAppData?.userDevices) && (
            <small className="d-inline-block">({LAST_28_DAYS})</small>
          )}
        </h4>
        {isEmpty(mobileAppData?.userDevices) ? (
          <DbSkPortletInlineSkeleton>
            <ActiveUsersSmallSkeleton isError={!isLoading} />
          </DbSkPortletInlineSkeleton>
        ) : (
          <>
            <ul className="keymetrics-list key-border">
              <li>
                <h1 className="font-bold">
                  {formatNumber(mobileAppData.userDevices[0]?.dau ?? 'NA')}
                </h1>
                <div className="d-flex flex-row">
                  <small className="color-secondary-black pr5">{DAU}</small>
                  <RSTooltip text={DAU_TEXT} className="lh0">
                    <i className={`${circle_question_mark_mini} icon-xs`} />
                  </RSTooltip>
                </div>
              </li>
              <li>
                <h1 className="font-bold">
                  {formatNumber(mobileAppData.userDevices[0]?.wau ?? 'NA')}
                </h1>
                <div className="d-flex flex-row">
                  <small className="color-secondary-black pr5">{WAU}</small>
                  <RSTooltip text={WAU_TEXT} className="lh0">
                    <i className={`${circle_question_mark_mini} icon-xs`} />
                  </RSTooltip>
                </div>
              </li>
              <li>
                <h1 className="font-bold">
                  {formatNumber(mobileAppData.userDevices[0]?.mau ?? 'NA')}
                </h1>
                <div className="d-flex flex-row">
                  <small className="color-secondary-black pr5">{MAU}</small>
                  <RSTooltip text={MAU_TEXT} className="lh0">
                    <i className={`${circle_question_mark_mini} icon-xs`} />
                  </RSTooltip>
                </div>
              </li>
            </ul>
            <ul className="keymetrics-list keymetrics-theme">
              <li className="bg-red-light">
                <h3>{formatNumber(mobileAppData.userDevices[0]?.inAppErrors ?? 'NA')}</h3>
                <small>{IN_APP_ERRORS}</small>
              </li>
              <li className="bg-red-medium">
                <h3>{formatNumber(mobileAppData.userDevices[0]?.crashes ?? 'NA')}</h3>
                <small>{CRASHES}</small>
              </li>
              <li className="bg-red-dark">
                <h3>
                  {formatNumber(
                    mobileAppData.deviceUninstallCountList[0]?.Uninstallcount ?? 'NA'
                  )}
                </h3>
                <small
                  onClick={handleDlNavigation}
                  className="key-metric-footer_label cp"
                >
                  {UNINSTALLS}
                </small>
              </li>
            </ul>
          </>
        )}
      </div>
    </Col>
  );

  const renderRetentionTable = () => (
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
                <i className={`${menu_dot_medium} icon-md`} />
              }
              showUpdate={true}
              className="no_caret"
              alignRight
              onSelect={(data) => {
                if (data === 'Identified')
                  setRetentionData(mobileAppData['retentionidentifieMobile'] || []);
                if (data === 'Known')
                  setRetentionData(mobileAppData['retentionknownMobile'] || []);
              }}
              isCustomDefaultIcon
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
  );

  const hasMobileApps = Array.isArray(isMobileAppData) && isMobileAppData.length > 0;
  const isAppContextReady = Boolean(isMobileAppId?.appGuid);
  const liveContextKey = isMobileAppId?.appGuid
    ? `${clientId}|${departmentId}|${isMobileAppId.appGuid}`
    : '';
  const isLiveDataPending = Boolean(liveContextKey) && liveContextKey !== mobileLiveFetchKeyRef.current;
  const showTabSkeleton =
    !isMobileAppListReady || (hasMobileApps && (!isAppContextReady || isLoading || isLiveDataPending));

  if (!hasMobileApps) {
    if (!isMobileAppListReady) {
      return <MobileLiveTabSkeleton injectCriticalCss />;
    }

    return (
      <div className='mt10'>
        <div className='mt10'>
          <RSSkeletonTable
            message={
              <>
                Please
                <i
                  onClick={() => {
                    navigate('/preferences/communication-settings', {
                      state: createCommunicationSettingsNavState('notification', {
                        subfrom: 'MLD',
                        notificationTabId: NOTIFICATION_TAB_ID.MOBILE,
                      }, locationState),
                    });
                  }}
                  className={`icon-md color-primary-blue icon-hover-shadow-primary mx5 ${circle_plus_fill_edge_large} ${mobileAppAddAccess ? '' : 'click-off'}`}
                />
                install the SDK on your mobile app.
              </>
            }
            count={7}
            text={true}
            isAlertIcon={false}
          />
        </div>
      </div>
    );
  }

  if (showTabSkeleton) {
    return <MobileLiveTabSkeleton injectCriticalCss />;
  }

  return (
    <>
      <Row>
        {renderVisitorStatus()}
        {renderActiveVisitorsTraffic()}
      </Row>

      <Row>
        {renderKeyMetrics()}
        {renderActiveUsers()}
      </Row>

      {/* Path Analyser Section */}
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
                        const levelCount = Math.min(5, Math.max(3, parseInt(String(item).split(' ')[0], 10) || 3));
                        const data = Array.isArray(sankeyDropdownData) ? sankeyDropdownData : [];
                        const slice = data.slice(0, levelCount);
                        const temp = slice.map((d) => (typeof d === 'object' && d?.uiPrintableName != null ? d.uiPrintableName : String(d)));
                        const tempList = slice.map((d, i) => ({
                          field: `industry${i}`,
                          value: typeof d === 'object' && d?.uiPrintableName != null ? d.uiPrintableName : String(d),
                        }));
                        setIsPathAnalyserLoading(true);
                        setValue('levels', temp);
                        setValue('industriesList', tempList);
                        temp.forEach((v, i) => setValue(`industry${i}`, v));
                        setPathAnalyserDData(item);
                        handleGetPathAnalyser(tempList);
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
                      innerContent={expandedState ? true : false}
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
                    filterCount={levels?.length || LIVE_PATH_ANALYSER_FILTER_COUNT_MOBILE}
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
                              state: createCommunicationSettingsNavState('notification', {
                                subfrom: 'MLD',
                                notificationTabId: NOTIFICATION_TAB_ID.MOBILE,
                              }, locationState),
                            });
                          }}
                          className={`icon-md color-primary-blue icon-hover-shadow-primary mx5 ${circle_plus_fill_edge_large} ${mobileAppAddAccess ? '' : 'click-off'}`}
                        />
                        install the SDK on your mobile app.
                      </>
                    }
                    count={7}
                    text={true}
                    isAlertIcon={false}
                    fillHeight
                  />
                </div>
              ) : levels?.length > 0 ? (
                <>
                  <div className="sankey-chart-switch-setting">
                    <Row>
                      {levels?.length !== 0 &&
                        levels?.map((item, idx) => {
                          return (
                            <Col className="sankey-filter" key={idx}>
                              <div
                                className="form-group mb30"
                                id="rs_MobileLiveAudienceDashboard_industrytype"
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
                                      (it, i) => i !== idx && it?.value === newValue
                                    );
                                    const temp = list.map((it, i) => ({
                                      field: `industry${i}`,
                                      value:
                                        i === idx
                                          ? newValue
                                          : i === existingIndex && existingIndex !== -1
                                            ? prevValue
                                            : it?.value ?? '',
                                    }));
                                    setIsPathAnalyserLoading(true);
                                    setValue('levels', temp.map((it) => it.value));
                                    setValue('industriesList', temp);
                                    temp.forEach((it, i) => setValue(`industry${i}`, it.value));
                                    handleGetPathAnalyser(temp);
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
                      options={sankeyChartOptions({
                        series: (isPathAnalyserLoading || isChartRendering) ? [] : pathAnalyser,
                        height: expandedState ? 450 : 310,
                        expanded: expandedState,
                        expectedLevels: Array.isArray(levels) ? levels.length : undefined,
                      })}
                      smallText={LAST_28_DAYS}
                    />
                  </DbSkPathAnalyserChartSlot>
                </>
              ) : null}
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
              {isAllValuesZero(mobileAppData?.audienceConversionMobile) ? (
                <DashboardSkeletonScope className="db-sk-portlet-inline" injectCriticalCss>
                  <DbSkPieChartSkeleton isError />
                </DashboardSkeletonScope>
              ) : (
                <RSHighchartsContainer
                  type="columnChart"
                  options={barChartOptions(
                    FormatactiveTypesBarChartMobData(
                      mobileAppData.audienceConversionMobile
                    )
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
              <h4>{KNOWN_AUDIENCE_TO_CONVERSION}</h4>
            </div>
            <div className="portlet-body">
              {isAllValuesZero(mobileAppData?.audienceConversionMobile) ? (
                <DashboardSkeletonScope className="db-sk-portlet-inline" injectCriticalCss>
                  <DbSkColumnChartSkeleton isError />
                </DashboardSkeletonScope>
              ) : (
                <RSHighchartsContainer
                  type="columnChart"
                  options={pyramidChartOptions(
                    FormatactiveTypesPymaridChartMobData(
                      mobileAppData.audienceConversionMobile
                    )
                  )}
                  smallText={LAST_28_DAYS}
                />
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {renderRetentionTable()}
        <Col md={6}>
          <DashBoardCard
            name={TOP_SCREEN_VIEWS}
            details={mobileAppData?.userScreens}
            isError={!isLoading}
            smallText={LAST_28_DAYS}
            dropOffData={mobileAppData?.dropOffApp}
            isTopPage
            pageViewsDropdownData={dd_top_screen_views}
          />
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <DashBoardCard
            Text={LAST_28_DAYS}
            name={TOP_EVENT_SUMMARY}
            details={mobileAppData?.eventCounts}
            type={'mobile'}
            isMobileAppId={isMobileAppId}
            isError={!isLoading}
          />
        </Col>
        <Col md={6}>
          <RSChartTabbar
            dynamicTab={`mb0 mini`}
            defaultClass={`tabTransparent pt0`}
            activeClass={`active`}
            tabData={[
              {
                id: 'operating_sytem',
                text: OPERATING_SYSTEM,
                textClass: 'font-sm',
                component: () => (
                  <>
                    {isEmpty(mobileAppData?.deviceOSList) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkPieChartSkeleton isError={!isLoading} />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="pie"
                        key={'operating_sytem'}
                        smallText={`Last 28 days`}
                        options={pieChartOptions({
                          ...FormatPieChartData(mobileAppData.deviceOSList),
                          height: 310,
                          angle: 0
                        })}
                      />
                    )}
                  </>
                ),
              },
              {
                id: 'device',
                text: DEVICE,
                textClass: 'font-sm',
                component: () => (
                  <>
                    {isEmpty(mobileAppData?.deviceWiseCountCustList) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkPieChartSkeleton isError={!isLoading} />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="pie"
                        key={'device'}
                        smallText={`Last 28 days`}
                        options={pieChartOptions({
                          ...FormatPieChartData(
                            mobileAppData.deviceWiseCountCustList
                          ),
                          height: 310,
                          angle: 20
                        })}
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
      </Row>

      <Row>
        <Col md={6}>
          <RSChartTabbar
            dynamicTab={`mb0 mini`}
            defaultClass={`tabTransparent pt0`}
            activeClass={`active`}
            tabData={[
              {
                id: 'app_versions',
                text: APP_VERSIONS,
                textClass: 'font-sm',
                component: () => (
                  <>
                    {isEmpty(mobileAppData?.appVersionList) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkPieChartSkeleton isError={!isLoading} />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="pie"
                        key={'app_versions'}
                        smallText={`Last 28 days`}
                        options={pieChartOptions({
                          ...FormatPieChartDataVersion(
                            mobileAppData.appVersionList
                          ),
                          height: 310,
                          angle: 0,
                        })}
                      />
                    )}
                  </>
                ),
              },
              {
                id: 'os_versions',
                text: OS_VERSIONS,
                textClass: 'font-sm',
                component: () => (
                  <>
                    {isEmpty(mobileAppData?.deviceOSVersionList) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkPieChartSkeleton isError={!isLoading} />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="pie"
                        key={'os_versions'}
                        smallText={`Last 28 days`}
                        options={pieChartOptions({
                          ...FormatPieChartData(
                            mobileAppData.deviceOSVersionList
                          ),
                          height: 310,
                          angle: 0
                        })}
                        className="mt-10"
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
            chartHeading={USAGE_BEHAVIOUR}
            dynamicTab={`mb0 mini`}
            defaultClass={`tabTransparent pt0`}
            activeClass={`active`}
            footer={
              !isEmpty(mobileAppData?.byDaysCountMobile) &&
              !isEmpty(mobileAppData?.hourWiseCounts)
            }
            containerClass={
              !isEmpty(mobileAppData?.byDaysCountMobile) &&
              !isEmpty(mobileAppData?.hourWiseCounts)
                ? 'pfooter'
                : ''
            }
            tabData={[
              {
                id: 'by_days',
                text: BY_DAYS,
                textClass: 'font-sm',
                component: () => (
                  <>
                    {isEmpty(mobileAppData?.byDaysCountMobile) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkColumnChartSkeleton isError={!isLoading} withTopOffset />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="columnChart"
                        key={'by_days'}
                        options={columnChartOptions(
                          FormatgetUserBehaviorByDays(
                            mobileAppData.byDaysCountMobile,
                            true
                          )
                        )}
                        smallText={LAST_7_DAYS}
                        footerPercent={byDaysMaxState?.maxPercentage}
                        footerText={
                          <>
                            {MOBILE_APP_ENGAGE}
                            <span className="font-bold">
                              &nbsp;{byDaysMaxState?.maxState}
                            </span>{' '}
                          </>
                        }
                      />
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
                    {isEmpty(mobileAppData?.hourWiseCounts) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkGaugeChartSkeleton isError={!isLoading} />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="pie"
                        key={'by_hours'}
                        smallText={LAST_24_HOURS}
                        options={gaugeChartOptions(
                          FormatgetByHoursMobile(
                            mobileAppData.hourWiseCounts
                          )
                        )}
                        footerPercent={maxHours?.maxHoursPercentage}
                        footerText={
                          <>
                            {VISITORS_ENGAGE}
                            <span className="font-bold">&nbsp;{maxHours?.maxHoursTimeRange}</span>
                          </>
                        }
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
      </Row>

      <Row>
        <Col md={12} className="geo_loc">
          <RSChartTabbar
            chartHeading={GEOGRAPHIC}
            dynamicTab={`mb0 mini`}
            defaultClass={`tabTransparent pt0`}
            activeClass={`active`}
            containerClass="pfooter"
            tabData={[
              {
                id: 'location',
                text: LOCATION,
                textClass: 'font-sm',
                component: () => (
                  <>
                    {isEmpty(mobileAppData?.deviceLocationsList) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkPieChartSkeleton isError={!isLoading} offsetTop />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="pie"
                        key={'location'}
                        constructorType="mapChart"
                        options={mapTopoChartOptions(
                          getLocationDetails(
                            mobileAppData.deviceLocationsList
                          )
                        )}
                        smallText={LAST_28_DAYS}
                        footerPercent={locationMaxState?.maxPercentage}
                        footerText={
                          <>
                            of users from {locationMaxState?.maxCountry} have
                            highest engagement rate
                          </>
                        }
                      />
                    )}
                  </>
                ),
              },
              {
                id: 'app-language',
                text: APP_LANGUAGE,
                textClass: 'font-sm',
                component: () => (
                  <>
                    {isEmpty(mobileAppData?.deviceLanguageList) ? (
                      <DbSkPortletInlineSkeleton>
                        <DbSkPieChartSkeleton isError={!isLoading} offsetTop />
                      </DbSkPortletInlineSkeleton>
                    ) : (
                      <RSHighchartsContainer
                        type="pie"
                        key={'app-language'}
                        options={pieChartOptions({
                          ...FormatPieChartData(
                            mobileAppData.deviceLanguageList
                          ),
                          height: 310,
                          angle: 70,
                          tooltip: {
                            formatter: getLanguageTooltipFormatter()
                          }
                        })}
                        smallText={LAST_28_DAYS}
                        footerPercent={languageMaxState?.maxPercentage}
                        footerText={
                          <>
                            of the users install the app in{' '}
                            <span className="font-bold">
                              &nbsp;{languageMaxState?.maxState}&nbsp;
                            </span>{' '}
                            language
                          </>
                        }
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
      </Row>

      <RSConfirmationModal
        show={confirmationModal}
        text={SELECT_BU}
        handleClose={() => setConfimrationModal(false)}
        handleConfirm={() => setConfimrationModal(false)}
        secondaryButton={false}
      />
    </>
  );
};

export default memo(MobileLiveAudienceDashboard);

