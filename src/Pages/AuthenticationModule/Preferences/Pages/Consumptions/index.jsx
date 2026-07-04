import { formatNumber } from 'Utils/modules/campaignUtils';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { MM_LIST, getYYMMDD, getDateWithDaynoFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { getBandwidthChart, getDataStorageChart } from './constant';
import { areasplineChartOptions, funnelChartOptions, recentCampaignsChart } from 'Constants/Charts';
import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Col, Container, Row } from 'react-bootstrap';
import { CHANNEL_IMAGE } from './constant';

import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RSHighchartsContainer from 'Components/Highcharts';
import RSTooltip from 'Components/RSTooltip';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getConsumptionDetails,
    getConsumptionStatus,
    getVersarConsumption,
    getSftpConsumption,
    getLineChart,
} from 'Reducers/preferences/consumptions/request';
import { globalStateSelector } from 'Utils/Selectors/app';
import {
    update_consumptionChannel,
    update_consumptionMonth,
    update_consumptionYear,
    update_filteredChannels,
} from 'Reducers/globalState/reducer';
import { MeterSkeletonColored, DataStorageSkeleton, ConsumptionsChannelSkeleton, ListAqusitionSekelton } from 'Components/Skeleton/Skeleton';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';

const Consumptions = () => {
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { consumptionMM, consumptionYY, u_consumptionMM, u_consumptionYY } = useSelector((state) =>
        globalStateSelector(state),
    );
    const dispatch = useDispatch();
    const { licenseTypeId } = getUserDetails();
    const { userId, clientId, departmentId, departmentName } = useSelector((state) => getSessionId(state));
    const navigate = useNavigate();

    const [consumptionList, setConsumptionList] = useState({ channelConsumptionList: [] });
    const [consumptionDataNew, setComsumptionDataNew] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [channelLoadingStates, setChannelLoadingStates] = useState({});
    const [allApisComplete, setAllApisComplete] = useState(false);
    const consumptionListRef = useRef({ channelConsumptionList: [] });
    const [versarConsumptionData, setVersarConsumptionData] = useState(null);
    const [sftpConsumptionData, setSftpConsumptionData] = useState({
        loading: false,
        loaded: false,
        isActive: false,
        count: 0,
        items: [],
    });
    const [lineChartData, setLineChartData] = useState(null);
    const [isCustom, setIsCustom] = useState(false);

    const processChannelsWithCount = useCallback((channelsData) => {
        if (!channelsData?.length) return null;

        const channelsWithCount = channelsData
            ?.filter((channel) => channel?.count > 0)
            ?.map((channel) => {
                const normalizedChannelId = channel?.channelId ?? channel?.channelID;
                const channelInfo = getChannelId(normalizedChannelId);
                const channelLabel = channel?.channelName || channelInfo?.label || `Channel ${normalizedChannelId}`;

                return {
                    ...channelInfo,
                    id: normalizedChannelId,
                    lable: channelLabel,
                };
            });

        return channelsWithCount?.length > 0 ? channelsWithCount : null;
    }, []);

    // Process line chart data: sum all channel counts by date
    const processLineChartData = useCallback((data) => {
        if (!data) return null;

        const dateMap = new Map();

        // Iterate through all channels (sms, email, whatsApp, etc.)
        Object.keys(data).forEach((channelKey) => {
            const channelData = data[channelKey];
            if (Array.isArray(channelData)) {
                channelData.forEach((item) => {
                    const date = item.date;
                    const count = parseInt(item.count) || 0;
                    
                    if (dateMap.has(date)) {
                        dateMap.set(date, dateMap.get(date) + count);
                    } else {
                        dateMap.set(date, count);
                    }
                });
            }
        });

        // Convert map to arrays for chart
        const categories = [];
        const seriesData = [];

        // Sort dates chronologically
        const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
            const dateA = moment(a, 'DD-MMM-YY');
            const dateB = moment(b, 'DD-MMM-YY');
            return dateA.valueOf() - dateB.valueOf();
        });

        sortedDates.forEach((date) => {
            categories.push(date);
            seriesData.push(dateMap.get(date));
        });

        return {
            categories,
            series: [{
                name: 'Total count',
                data: seriesData,
            }],
        };
    }, []);

    const getFilteredChannels = useCallback(() => {
        return processChannelsWithCount(consumptionList?.channelConsumptionList);
    }, [consumptionList, processChannelsWithCount]);

    const handleConsumptionDetails = async () => {
        setIsLoading(true);
        const emptyList = { channelConsumptionList: [] };
        consumptionListRef.current = emptyList;
        setConsumptionList(emptyList);
        setChannelLoadingStates({});
        setAllApisComplete(false);
        setVersarConsumptionData(null);
        setSftpConsumptionData({
            loading: false,
            loaded: false,
            isActive: false,
            count: 0,
            items: [],
        });
        setLineChartData(null);
        setIsCustom(false);

        const payloadStatus = {
            clientId,
            userId,
            departmentId,
            month: u_consumptionMM + 1,
            year: u_consumptionYY,
        };

        const { status: consumptionStatus, data: consumptiondata ,isCustom: isCustomResponse } = await dispatch(getConsumptionStatus(payloadStatus));
        
        setIsCustom(isCustomResponse || false);
        
        if (isCustomResponse) {
            const formatDateWithSlash = (date) => {
                if (!date) return '';
                return moment(date).format('DD/MM/YYYY');
            };
            
            // Check if selected month is current month
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth(); // 0-indexed (0-11)
            const currentYear = currentDate.getFullYear();
            const isCurrentMonth = u_consumptionMM === currentMonth && u_consumptionYY === currentYear;
            
            let startDate, endDate;
            
            if (isCurrentMonth) {
                // For current month: send relative dates (yesterday, day before yesterday, etc.)
                // Excluding today: yesterday, day before yesterday, day before that (3 days total)
                endDate = new Date();
                endDate.setDate(endDate.getDate() - 1); // Yesterday
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 3); // 3 days ago (yesterday, day before yesterday, day before that = 3 days)
            } else {
                // For other months: send last 3 days of the selected month
                const selectedMonth = u_consumptionMM; // 0-indexed (0-11)
                const selectedYear = u_consumptionYY;
                
                // Get the last day of the selected month
                const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                
                // Set endDate to the last day of the selected month
                endDate = new Date(selectedYear, selectedMonth, lastDayOfMonth);
                
                // Set startDate to 2 days before the last day (last 3 days of the month)
                startDate = new Date(selectedYear, selectedMonth, lastDayOfMonth - 2);
            }
            
            const lineChartPayload = {
                clientId,
                userId,
                departmentId,
                startDate: formatDateWithSlash(startDate),
                endDate: formatDateWithSlash(endDate),
                ChannelType: "ALL",
                pageNumber: 1,
                pageSize: 10,
                isKey: true,
                searchTerm: {},
                isConsumption: true
            };
            
            const lineChartResponse = await dispatch(getLineChart(lineChartPayload));
            if (lineChartResponse?.status && lineChartResponse?.data) {
                const processedData = processLineChartData(lineChartResponse.data);
                setLineChartData(processedData);
            } else {
                setLineChartData(null);
            }
        } else {
            setLineChartData(null);
        }
        
        if (consumptionStatus) {
            setComsumptionDataNew(consumptiondata);
            const channelIds = Array.isArray(consumptiondata?.channelId) ? consumptiondata.channelId : [];

            if (!channelIds.length) {
                setChannelLoadingStates({});
                setIsLoading(false);
                setAllApisComplete(true);
                return;
            }

            const initialLoadingStates = {};
            const initialChannels = channelIds.map((channelId) => {
                initialLoadingStates[channelId] = true;
                const channelInfo = getChannelId(channelId);

                return {
                    channelId,
                    channelName: channelInfo?.label || `Channel ${channelId}`,
                    count: 0,
                };
            });

            setChannelLoadingStates(initialLoadingStates);

            setConsumptionList((prev) => {
                const prevList = prev?.channelConsumptionList || [];
                // Preserve channels that are already fetched (e.g., SFTP) and not in initialChannels
                const preservedChannels = prevList.filter(prevItem => 
                    !initialChannels.some(newChannel => 
                        (newChannel.channelId ?? newChannel.channelID) === (prevItem.channelId ?? prevItem.channelID)
                    )
                );
                
                const combinedList = [...initialChannels, ...preservedChannels];
                const updatedList = { channelConsumptionList: combinedList };
                consumptionListRef.current = updatedList;
                return updatedList;
            });

            const endDate = new Date();
            const startDate = getDateWithDaynoFormat(LAST30DAYS_DATEFILTER);
            const versarPayload = {
                clientId,
                userId,
                departmentId,
                startDate: getYYMMDD(startDate),
                endDate: getYYMMDD(endDate),
            };
            const versarResult = await dispatch(getVersarConsumption(versarPayload));
            let versiumData = null;
            if (versarResult?.status && versarResult?.data) {
                versiumData = {
                    data: Array.isArray(versarResult.data) ? versarResult.data : [],
                    totalConsumptionAmount: versarResult.totalConsumptionAmount || 0,
                };
                setVersarConsumptionData(versiumData);
            } else {
                setVersarConsumptionData(null);
            }

            const fetchChannelData = async (channelId) => {
                const payload = {
                    clientId,
                    userId,
                    departmentId,
                    month: u_consumptionMM + 1,
                    year: u_consumptionYY,
                    channelId: [channelId],
                };

                try {
                    const result = await dispatch(getConsumptionDetails(payload));
                    const { status, data } = result || {};

                    const channelEntries =
                        status && data?.channelConsumptionList?.length > 0
                            ? data.channelConsumptionList
                            : [
                                  {
                                      channelId,
                                      channelName: (channelId === 42 && versiumData) 
                                          ? 'Versium' 
                                          : (getChannelId(channelId)?.label || `Channel ${channelId}`),
                                      count: 0,
                                  },
                              ];

                    const normalizedEntries = channelEntries.map((item) => {
                        const normalizedChannelId = item?.channelId ?? item.channelID ?? channelId;
                        const channelInfo = getChannelId(normalizedChannelId);
                        const parsedCount =
                            typeof item.count === 'number' ? item.count : Number(item.count ?? 0) || 0;
                        
                        const channelLabel = (normalizedChannelId === 42 && versiumData)
                            ? 'Versium'
                            : (item.channelName || channelInfo?.label || `Channel ${normalizedChannelId}`);

                        return {
                            channelId: normalizedChannelId,
                            channelName: channelLabel,
                            count: parsedCount,
                        };
                    });

                    // Check if this channel has active count before updating state
                    const hasActiveCount = normalizedEntries.some(entry => entry.count > 0);

                    setConsumptionList((prev) => {
                        const prevList = prev?.channelConsumptionList || [];
                        const updatedMap = new Map(
                            prevList.map((entry) => [entry.channelId ?? entry.channelID, entry]),
                        );

                        normalizedEntries.forEach((entry) => {
                            updatedMap.set(entry.channelId, {
                                ...(updatedMap.get(entry.channelId) || {}),
                                ...entry,
                            });
                        });

                        const updated = { channelConsumptionList: Array.from(updatedMap.values()) };
                        consumptionListRef.current = updated;
                        return updated;
                    });

                    // For active channels (count > 0), stop loading immediately
                    if (hasActiveCount) {
                        setChannelLoadingStates((prev) => ({
                            ...prev,
                            [channelId]: false,
                        }));
                    }
                    // For inactive channels, keep loading state - will be updated after all APIs complete
                } catch (error) {
                    const channelInfo = getChannelId(channelId);
                    // Use Versium label if channel 42 and versiumData exists
                    const channelLabel = (channelId === 42 && versiumData)
                        ? 'Versium'
                        : (channelInfo?.label || `Channel ${channelId}`);
                    
                    setConsumptionList((prev) => {
                        const prevList = prev?.channelConsumptionList || [];
                        const updatedMap = new Map(
                            prevList.map((entry) => [entry.channelId ?? entry.channelID, entry]),
                        );

                        updatedMap.set(channelId, {
                            channelId,
                            channelName: channelLabel,
                            count: 0,
                        });

                        const updated = { channelConsumptionList: Array.from(updatedMap.values()) };
                        consumptionListRef.current = updated;
                        return updated;
                    });
                    // Keep loading state for inactive channels (count is 0)
                }
            };

            await Promise.allSettled(channelIds.map((channelId) => fetchChannelData(channelId)));
            
            if (versiumData) {
                const versiumCount = versiumData.totalConsumptionAmount || 0;
                const versiumChannelInfo = getChannelId(42);
                setConsumptionList((prev) => {
                    const prevList = prev?.channelConsumptionList || [];
                    const filteredList = prevList.filter(item => item?.channelId !== 42); // Ensure no duplicate channel 42
                    const updatedList = [
                        ...filteredList,
                        {
                            id: 42,
                            lable: 'Versium',
                            channelId: 42,
                            channelName: 'Versium',
                            count: versiumCount,
                            ...versiumChannelInfo, // Include all channel info properties for dropdown
                        }
                    ];
                    const updated = { channelConsumptionList: updatedList };
                    consumptionListRef.current = updated;
                    return updated;
                });
            } else {
                setConsumptionList((prev) => {
                    const prevList = prev?.channelConsumptionList || [];
                    const filteredList = prevList.filter(item => item?.channelId !== 42);
                    const updated = { channelConsumptionList: filteredList };
                    consumptionListRef.current = updated;
                    return updated;
                });
            }
            
            // After all APIs complete, mark all inactive channels as not loading
            setChannelLoadingStates((prev) => {
                const updated = { ...prev };
                const currentList = consumptionListRef.current;
                channelIds.forEach((channelId) => {
                    const channelData = currentList?.channelConsumptionList?.find(
                        item => (item?.channelId ?? item.channelID) === channelId
                    );
                    // If channel has count 0 or doesn't exist, stop loading
                    if (!channelData || channelData.count === 0) {
                        updated[channelId] = false;
                    }
                });
                return updated;
            });
            setAllApisComplete(true);
        } else {
            setComsumptionDataNew([]);
            
            setConsumptionList((prev) => {
                const prevList = prev?.channelConsumptionList || [];
                // Preserve SFTP (99) if it was already fetched
                const preservedChannels = prevList.filter(prevItem => 
                    (prevItem.channelId ?? prevItem.channelID) === 99
                );
                
                const updatedList = { channelConsumptionList: preservedChannels };
                consumptionListRef.current = updatedList;
                return updatedList;
            });
            
            setAllApisComplete(true);
            setVersarConsumptionData(null);
        }

        setIsLoading(false);
    };
    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') setConfimrationModal(true);
        else {
            setConfimrationModal(false);
            handleConsumptionDetails();
        }
    }, [userId, clientId, departmentId, consumptionYY, consumptionMM, u_consumptionYY, u_consumptionMM]);

    // SFTP consumption: fetch separately (does not block getConsumptionDetails),
    // but the channel card is only shown once allApisComplete to avoid layout flicker.
    useEffect(() => {
        const run = async () => {
            if (!userId || !clientId || !departmentId) return;

            setSftpConsumptionData({
                loading: true,
                loaded: false,
                isActive: false,
                count: 0,
                items: [],
            });

            const payload = { departmentId, clientId, userId };
            const res = await dispatch(getSftpConsumption(payload));

            const items = Array.isArray(res?.data)
                ? res?.data
                : Array.isArray(res?.data?.data)
                    ? res?.data?.data
                    : [];

            const numericRecipientCounts = items
                .map((x) => Number(x?.TotalRecipientCount))
                .filter((n) => Number.isFinite(n) && n > 0);
            const count = numericRecipientCounts.length
                ? numericRecipientCounts.reduce((a, b) => a + b, 0)
                : items.length;

            const isActive = Boolean(res?.status) && items.length > 0;

            setSftpConsumptionData({
                loading: false,
                loaded: true,
                isActive,
                count: Number(count) || 0,
                items,
            });

            if (isActive) {
                const sftpCount = Number(count) || 0;
                const sftpChannelInfo = getChannelId(99);
                setConsumptionList((prev) => {
                    const prevList = prev?.channelConsumptionList || [];
                    const filteredList = prevList.filter(item => item?.channelId !== 99);
                    const updatedList = [
                        ...filteredList,
                        {
                            ...sftpChannelInfo,
                            id: 99,
                            lable: sftpChannelInfo?.label || 'SFTP',
                            channelId: 99,
                            channelName: sftpChannelInfo?.label || 'SFTP',
                            count: sftpCount,
                        }
                    ];
                    const updated = { channelConsumptionList: updatedList };
                    consumptionListRef.current = updated;
                    return updated;
                });
            } else {
                setConsumptionList((prev) => {
                    const prevList = prev?.channelConsumptionList || [];
                    const filteredList = prevList.filter(item => item?.channelId !== 99);
                    const updated = { channelConsumptionList: filteredList };
                    consumptionListRef.current = updated;
                    return updated;
                });
            }
        };

        run();
    }, [dispatch, userId, clientId, departmentId, consumptionYY, consumptionMM, u_consumptionYY, u_consumptionMM]);
    useEffect(() => {
        dispatch(update_consumptionYear(new Date().getFullYear()));
        dispatch(update_consumptionMonth(new Date().getMonth()));
    }, []);

    useEffect(() => {
        dispatch(update_filteredChannels(getFilteredChannels()));
    }, [dispatch, getFilteredChannels]);

    const bandwidthChartData = getBandwidthChart(consumptionDataNew?.bandwidth,isCustom);
    const bandwidthChartOptions = recentCampaignsChart(bandwidthChartData);
    if (bandwidthChartData.customTooltip) {
        bandwidthChartOptions.tooltip = bandwidthChartData.customTooltip;
    }
    const dataStorageChart = funnelChartOptions(getDataStorageChart(consumptionDataNew?.dbConsumption,isCustom));
    const lineChartOptions = useMemo(() => {
        if (!lineChartData) return null;
        
        const options = areasplineChartOptions({
            categories: lineChartData.categories,
            series: lineChartData.series,
            height: 220,
        });
        
        if (options.tooltip && options.tooltip.formatter) {
            const originalFormatter = options.tooltip.formatter;
            options.tooltip.formatter = function() {
                try {
                    let pointKey = '';
                    
                    if (this.points && this.points.length > 0) {
                        pointKey = this.x !== undefined 
                            ? (typeof this.x === 'string' ? this.x : String(this.x))
                            : (this.points[0].key !== undefined ? String(this.points[0].key) : '');
                    } else if (this.point) {
                        pointKey = this.point.category !== undefined 
                            ? String(this.point.category)
                            : (this.point.key !== undefined ? String(this.point.key) : '');
                    }
                    
                    let tooltipHtml = `<span class="font-xs">${pointKey}`;
                    if (this.points) {
                        this.points.forEach((point) => {
                            const formattedValue = numberWithCommas(point.y || 0);
                            tooltipHtml += `<br/><hr /><span class="font-monospace" style="color:${point.color};">\u25CF</span>&nbsp;<span class="font-xs">${point.series.name}: </span><span class="font-xs">${formattedValue}</span>`;
                        });
                    } else if (this.point) {
                        const formattedValue = numberWithCommas(this.point.y || 0);
                        tooltipHtml += `<br/><hr /><span class="font-monospace" style="color:${this.point.color};">\u25CF</span>&nbsp;<span class="font-xs">${this.series.name}: </span><span class="font-xs">${formattedValue}</span>`;
                    }
                    
                    tooltipHtml += '</span>';
                    return tooltipHtml;
                } catch (error) {
                    return `<span class="font-xs">${this.x || this.point?.key || ''}</span>`;
                }
            };
        }
        return options;
    }, [lineChartData]);

    const handleDataStorageClick = () => {
        navigate('/preferences/consumptions/database-consumption');
    };

    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader title="Consumptions" isConsumption filteredChannels={getFilteredChannels()} rightCommonMenus isBack backPath="/preferences" />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <Row>
                            <Col sm={isCustom ? 4 : 6}>
                                <div className={`portlet-container ${isCustom ? 'portlet-sm':'portlet-md'}`}>
                                    <div className="portlet-header">
                                        <h4>Bandwidth</h4>
                                    </div>
                                    <div className="portlet-body">
                                        <div className="portlet-chart">
                                            {consumptionDataNew?.bandwidth ? (
                                                <RSHighchartsContainer
                                                    options={bandwidthChartOptions}
                                                    smallText={
                                                        <>
                                                            {' '}
                                                            (for the month of{' '}
                                                            {MM_LIST[u_consumptionMM]} {u_consumptionYY})
                                                        </>
                                                    }
                                                />
                                            ) : (
                                                <MeterSkeletonColored isError={!isLoading} isCustom={isCustom}/>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={isCustom ? 4 : 6}>
                                <div className={`portlet-container ${isCustom ? 'portlet-sm':'portlet-md'}`}>
                                    <div className="portlet-header">
                                        <h4>Data storage</h4>
                                    </div>
                                    <div className="portlet-body">
                                        {consumptionDataNew?.dbConsumption?.length === 0 || !consumptionDataNew?.dbConsumption ? (
                                            <div className="portlet-chart">
                                                <DataStorageSkeleton isError={!isLoading} isCustom={isCustom}/>
                                            </div>
                                        ) : (
                                            <>
                                                {!isCustom && <div className="dataStorageChart-tooltip left0"></div>}
                                                <RSHighchartsContainer
                                                    options={dataStorageChart}
                                                    smallText={
                                                        <>
                                                            {' '}
                                                            (for the month of{' '}
                                                            {MM_LIST[u_consumptionMM]} {u_consumptionYY})
                                                        </>
                                                    }
                                                    isDataStorage = {true}
                                                    onDataStorageClick={handleDataStorageClick}
                                                    className={isCustom ? "mt-15 ml-30" :""}
                                                    isCustomStyle={isCustom}
                                                />
                                                {/* <div className="dataStorageChart-tooltip right0"></div> */}
                                                {/* <div className="dataStorageChart-tooltip-bottom"></div> */}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Col>
                            {isCustom && (
                                <Col sm={4}>
                                    <div className="portlet-container portlet-sm">
                                        <div className="portlet-header">
                                            <h4>Communication sent</h4>
                                        </div>
                                        <div className="portlet-body">
                                            <div className="portlet-chart">
                                                {lineChartOptions ? (
                                                    <RSHighchartsContainer
                                                        options={lineChartOptions}
                                                        smallText={
                                                            <>
                                                                {' '}
                                                                (Last 3 days)
                                                            </>
                                                        }
                                                        isDashboard
                                                        isCommunicationSent
                                                    />
                                                ) : (
                                                    <ListAqusitionSekelton isChartSkeleton={true} isError isCommunicationSent />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                        )}
                        </Row>
                    
                        <div className="top-sub-heading mb10">
                            <h3 className="d-flex align-items-center gap-2">
                                Consumption status
                                <small>
                                    (for the month of {MM_LIST[u_consumptionMM]} {u_consumptionYY})
                                </small>
                                {/* <small>(for the month of {getMonthName(consumptionMonth)})</small> */}
                            </h3>
                        </div>
                        {consumptionDataNew?.channelId?.length  ? (() => {
                            // Separate channels into active and inactive
                            const activeChannels = [];
                            const inactiveChannels = [];

                            consumptionDataNew?.channelId?.forEach((channelId) => {
                                if (channelId === 42 && versarConsumptionData) {
                                    return;
                                }
                                
                                const channelInfo = {
                                    ...getChannelId(channelId),
                                    ...(channelId === 39 && { label: 'Custom events' }),
                                    ...(channelId === 40 && { label: 'Communication response' }),
                                    ...(channelId === 120 && { label: 'Smart links' })
                                };
                                const relatedChannels = { 9: [9, 14], 14: [9, 14] };
                                const searchIds = relatedChannels[channelId] || [channelId];
                                
                                const channelData = (() => {
                                    const items = searchIds
                                        .map(id =>
                                            consumptionList?.channelConsumptionList?.find(
                                                item => item?.channelId === id
                                            )
                                        )
                                        .filter(Boolean); 

                                    // Prefer the item that has a count > 0
                                    const nonZeroItem = items.find(item => item.count > 0);
                                    if (nonZeroItem) return nonZeroItem;
                                    if (items.length) return items[0];
                                    return {
                                        channelId,
                                        channelName: channelInfo?.label || `Channel ${channelId}`,
                                        count: 0
                                    };
                                })();

                                if (channelData.count > 0) {
                                    activeChannels.push({ channelId, channelData, channelInfo, searchIds });
                                } else {
                                    inactiveChannels.push({ channelId, channelData, channelInfo, searchIds });
                                }
                            });

                            if (versarConsumptionData) {
                                const versiumCount = versarConsumptionData.totalConsumptionAmount || 0;
                                const versiumChannelData = {
                                    channelId: 42,
                                    channelName: 'Versium',
                                    count: versiumCount,
                                };
                                const versiumChannelInfo = {
                                    ...getChannelId(42),
                                    label: 'Versium',
                                };
                                if (versiumCount > 0) {
                                    activeChannels.push({ 
                                        channelId: 42, 
                                        channelData: versiumChannelData, 
                                        channelInfo: versiumChannelInfo, 
                                        searchIds: [42],
                                        isVersium: true,
                                    });
                                } else {
                                    inactiveChannels.push({ 
                                        channelId: 42, 
                                        channelData: versiumChannelData, 
                                        channelInfo: versiumChannelInfo, 
                                        searchIds: [42],
                                        isVersium: true,
                                    });
                                }
                            }

                            if (allApisComplete && sftpConsumptionData?.loaded) {
                                const sftpCount = sftpConsumptionData.count || 0;
                                const sftpChannelInfoRaw = getChannelId(99);
                                const sftpChannelInfo = {
                                    ...sftpChannelInfoRaw,
                                    label: sftpChannelInfoRaw?.label || 'SFTP',
                                };
                                const sftpChannelData = {
                                    channelId: 99,
                                    channelName: sftpChannelInfo.label,
                                    count: sftpCount,
                                };
                                if (sftpConsumptionData.isActive) {
                                    activeChannels.push({
                                        channelId: 99,
                                        channelData: sftpChannelData,
                                        channelInfo: sftpChannelInfo,
                                        searchIds: [99],
                                        isSftp: true,
                                    });
                                } else {
                                    inactiveChannels.push({
                                        channelId: 99,
                                        channelData: sftpChannelData,
                                        channelInfo: sftpChannelInfo,
                                        searchIds: [99],
                                        isSftp: true,
                                    });
                                }
                            }

                            const renderChannelCard = ({ channelId, channelData, channelInfo, searchIds, isVersium, isSftp }) => {
                                const isChannelLoading = channelLoadingStates[channelId];
                                // For inactive channels, show loading until all APIs complete
                                // Versium doesn't have loading state, so skip loading check for it
                                const shouldShowLoading = isVersium
                                    ? false
                                    : isSftp
                                        ? false
                                        : (isChannelLoading || (!allApisComplete && channelData.count === 0));

                                return (
                                    <Col sm={3} key={channelId}>
                                        <div className="position-relative top5 box-design text-center mb23">
                                            {shouldShowLoading ? (
                                                <div className="skeleton-channel-portlet consumption-skeleton-portlet">
                                                    <div className="d-flex align-items-center mb15">
                                                        <div className="skeleton-icon me-2"></div>
                                                        <div className="skeleton-text skeleton-title"></div>
                                                    </div>
                                                    <div className="align-content-center justify-content-center mx-auto skeleton-count"></div>
                                                    <div className="skeleton-info-icon"></div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span
                                                        className={`d-flex cp   ${
                                                            channelData.count > 0 ? '' : 'click-off'
                                                        } `}
                                        onClick={() => {
                                            if (channelData.count > 0) {
                                                let url = '/preferences/consumptions/consumption-channel';
                                                const state = {
                                                    channelId: channelData.channelId,
                                                    channelName: channelData.channelName,
                                                    ...(isVersium && { isVersium: true }),
                                                    filteredChannels: getFilteredChannels(),
                                                };
                                                const encryptState = encodeUrl(state);
                                                navigate(`${url}?q=${encryptState}`, {
                                                    state,
                                                });
                                                dispatch(
                                                    update_consumptionChannel({
                                                        id: channelData.channelId,
                                                        lable: channelData.channelName,
                                                    }),
                                                );
                                            }
                                        }}
                                    >
                                        <i
                                            className={`${
                                                CHANNEL_IMAGE[channelData.channelId]
                                            }  icon-lg color-primary-blue mr5`}
                                        ></i>
                                                        {channelData?.channelName?.length > 25 ? (
                                                            <RSTooltip
                                                                text={channelData?.channelName}
                                                                position="top"
                                                                className="d-inline-block"
                                                            >
                                                                <span className="font-sm">{truncateTitle(channelData?.channelName, 25)}</span>
                                                            </RSTooltip>
                                                        ) : (
                                                            <span className="font-sm">{channelData?.channelName}</span>
                                                        )}
                                                    </span> 
                                                    {channelData?.count > 1000 ? (
                                                        <RSTooltip
                                                            text={`${numberWithCommas(channelData?.count || 0)}`}
                                                            position="top"
                                                            className="lh0"
                                                        >
                                                            <h1 className="font-bold mt5">{formatNumber(channelData?.count || 0)}</h1>
                                                        </RSTooltip>
                                                    ) : (
                                                        <h1 className="font-bold mt5">{formatNumber(channelData?.count || 0)}</h1>
                                                    )}

                                                    <div className="bottom5 position-absolute right5">
                                                    <RSTooltip text='Detail view' position='top' className="lh0">
                                                    <i
                                            onClick={() => {
                                                if (channelData.count > 0) {
                                                    let url = '/preferences/consumptions/consumption-channel';
                                                    const state = {
                                                        channelId: channelData.channelId,
                                                        channelName: channelData.channelName,
                                                        ...(isVersium && { isVersium: true }),
                                                        filteredChannels: getFilteredChannels(),
                                                    };
                                                    const encryptState = encodeUrl(state);
                                                    navigate(`${url}?q=${encryptState}`, {
                                                        state,
                                                    });
                                                    dispatch(
                                                        update_consumptionChannel({
                                                            id: channelData.channelId,
                                                            lable: channelData.channelName,
                                                        }),
                                                    );
                                                }
                                            }}
                                            className={`${circle_info_medium} ${
                                                                channelData.count > 0 ? '' : 'click-off'
                                                            } icon-md color-primary-blue`}
                                                            id="rs_data_circle_info"
                                                        ></i>
                                                    </RSTooltip>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </Col>
                                );
                            };

                            return (
                                <>
                                    {activeChannels.length > 0 && (
                                        <>
                                            <div className="top-sub-heading mb10 mt20">
                                                <h4 className="d-flex align-items-center gap-2">
                                                    Active channels
                                                </h4>
                                            </div>
                                            <Row className="position-relative">
                                                {activeChannels.map((channel) => renderChannelCard(channel))}
                                            </Row>
                                        </>
                                    )}
                                    {inactiveChannels.length > 0 && (
                                        <>
                                            <div className="top-sub-heading mb10 mt20">
                                                <h4 className="d-flex align-items-center gap-2">
                                                    Inactive channels
                                                </h4>
                                            </div>
                                            <Row className="position-relative">
                                                {inactiveChannels.map((channel) => renderChannelCard(channel))}
                                            </Row>
                                        </>
                                    )}
                                </>
                            );
                        })() : (
                            <Row className="position-relative">
                                <Col>
                                    {/* <div className="portlet-container"> */}
                                        <ConsumptionsChannelSkeleton isError={!isLoading} count= {12}/>
                                    {/* </div> */}
                                </Col>
                            </Row>
                        )}
                    </Container>
                </div>
            </Container>
            {/* Main page content block ends */}
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />
        </div>
        // Content holder ends
    );
};

export default Consumptions;
