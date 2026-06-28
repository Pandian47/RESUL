import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { DDL_RECENT_DATA, dd_advocates, dd_audience_behaviour, dd_channelPerformance, dd_segments, dd_top_earning_communication, dd_top_performing_communication } from './Pages/CommunicationDashboard/constants';
import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { createContext, useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import RSPageHeader from 'Components/RSPageHeader';
import RSTabbarFluid from 'Components/RSTabberFluid';
import RenderDashboard from './Component/RenderDashboard';
import { getAllDashboardData, getSegmentIndustry } from 'Reducers/dashboardTwins/request';
import { get_dashboard_data } from 'Reducers/dashboardTwins/dashboardReducer';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { globalStateSelector } from 'Utils/Selectors/app';

import RSConfirmationModal from 'Components/ConfirmationModal';
import { updateClientBranch, update_Dashboard, updateisClient, updateisClientID } from 'Reducers/globalState/reducer';
import useQueryParams from 'Hooks/useQueryParams';

//require('highcharts/highcharts-more.js')(Highcharts);

export const DASHBOARD_TAB_CONFIG = [
    {
        id: 2001,
        text: 'Communication dashboard',
        disable: false,
        component: () => <RenderDashboard page="Communication dashboard" />,
    },
    {
        id: 2002,
        text: 'Mobile live dashboard',
        disable: false,
        component: () => <RenderDashboard page="Mobile live audience dashboard" />,
    },
    {
        id: 2003,
        text: 'Web live dashboard',
        disable: false,
        component: () => <RenderDashboard page="Web live audience dashboard" />,
    },
];

export const DashboardContext = createContext({
    duration: 30,
    dropData: {},
    setDropData: () => {},
    handleRecentChange: () => {},
    handlesegmentschange: () => {},
    handleAudienceBehaviourChange: () => {},
    handleTopPerformancesChange: () => {},
    handleTopEarningChange: () => {},
    handlePerformanceChange: () => {},
    getall: () => {},
    dashboardSessionResetSeq: 0,
    communicationChartsRemountSeq: 0,
});

const getVersionStateFromStorage = () => {
    try {
        const safeParse = (value) => {
            if (!value) return null;
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        };

        return {
            previousVersionModal: safeParse(localStorage.getItem('previousVersionModal')),
            newVersionConfirm: safeParse(localStorage.getItem('newVersionConfirm')),
        };
    } catch (err) {
        return { previousVersionModal: null, newVersionConfirm: null };
    }
};

const Dashboard = ({ permissions }) => {
    const navigate = useNavigate();
    const location = useQueryParams('/dashboard');
    const indexValue = location?.index ?? 0;
    const [dashboardList] = useState(DASHBOARD_TAB_CONFIG);
    const [currentRenderDashBoardTitle, setCurrentRenderDashBoardTitle] = useState('Communication dashboard');
    const [config_TabURL, setConfig_tabURL] = useState(location ? location.index : 0);
    // console.log('state: ', state);
    const { licenseTypeId, isAgency,businessTypeId } = getUserDetails();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { clientBranch, isClient, isClientID, showSessionModal } = useSelector((state) => globalStateSelector(state));
    const { departmentId, clientId, userId, departmentName, isWebAppData } = useSelector((state) =>
        getSessionId(state),
    );
    const { accountAdmin, company_clientId, isDashboardData } = useSelector(({ globalstate }) => globalstate);
    const {
        customersPropensity,
        allPerformanceCampaigns,
        allEarningCampaigns,
        allChannelPerformance,
        allRecentCampaigns,
    } = useSelector(({ dashboardTwinsReducer }) => dashboardTwinsReducer);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const [duration, setDuration] = useState(30);
    const [BUtooltip, setBUtooltip] = useState(false);
    const [versionState, setVersionState] = useState(getVersionStateFromStorage());
    // const [avgData, setAvgData] = useState([]);
    const [dropData, setDropData] = useState({
        performancesTitle: dd_top_performing_communication[0],
        earningsTitle: dd_top_earning_communication[0],
    });
    const [dashboardSessionResetSeq, setDashboardSessionResetSeq] = useState(0);
    const [communicationChartsRemountSeq, setCommunicationChartsRemountSeq] = useState(0);
    const clientDeptSessionRef = useRef(null);
    const { avgTimeData } = useSelector(({ dashboardTwinsReducer }) => dashboardTwinsReducer);
    const dispatch = useDispatch();
    const pageName = {
        'Communication dashboard': 'Communication',
        // 'Operations dashboard': 'Operations',
        'Mobile live audience dashboard': 'Mobile live audience',
        'Web live audience dashboard': 'Web live audience',
    };
    const handlePerformanceChange = (durationData, item) => {
        const group = dd_channelPerformance.indexOf(item) + 1;
        let channelPerfKey = group === 1 ? 'reach' : group === 2 ? 'engagement' : 'conversion';
        
        if (allChannelPerformance[channelPerfKey]) {
            const channelPerfData = JSON.parse(allChannelPerformance[channelPerfKey]);
            let channelData = {
                categories: channelPerfData.Categories,
                xAxis: {
                    title: '',
                },
                yAxis: {
                    title: '',
                },
                tooltip: {
                    shared: true,
                },
                pointWidth: 20,
                series: [],
            };
            let temp = [];
            for (var i = 0; i < channelPerfData.Series.length; i++) {
                temp.push({
                    name: channelPerfData.Series[i].Name,
                    data: channelPerfData.Series[i].Datas,
                });
            }
            channelData = {
                ...channelData,
                series: temp,
            };
            dispatch(get_dashboard_data({
                field: 'channelPerformance',
                data: { data: channelData, isLoading: false, isFailure: false },
            }));
        }
    };

    const handleAudienceBehaviourChange = (durationData, item) => {
        const part = dd_audience_behaviour.indexOf(item) + 1;
        
        if (part === 1 && customersPropensity?.week) {
            let series = [
                { name: 'Wednesday', value: customersPropensity.week.wednesdayRange },
                { name: 'Tuesday', value: customersPropensity.week.tuesdayRange },
                { name: 'Monday', value: customersPropensity.week.mondayRange },
                { name: 'Saturday', value: customersPropensity.week.saturdayRange },
                { name: 'Thursday', value: customersPropensity.week.thursdayRange },
                { name: 'Sunday', value: customersPropensity.week.sundayRange },
                { name: 'Friday', value: customersPropensity.week.fridayRange },
            ];
            dispatch(get_dashboard_data({
                field: 'audienceBehaviour',
                data: { data: { series }, isLoading: false, isFailure: false },
            }));
        } else if (part === 2 && customersPropensity?.day) {
            let series = [
                { name: 'Afternoon', value: customersPropensity.day.afternoon },
                { name: 'Early morning', value: customersPropensity.day.earlyMorning },
                { name: 'Evening', value: customersPropensity.day.evening },
                { name: 'Morning', value: customersPropensity.day.morning },
                { name: 'Night', value: customersPropensity.day.night },
            ];
            dispatch(get_dashboard_data({
                field: 'audienceBehaviour',
                data: { data: { series }, isLoading: false, isFailure: false },
            }));
        }
    };

    const handleTopPerformancesChange = (durationData, item) => {
        const mode = dd_top_performing_communication.indexOf(item) + 1;
        
        const data = mode === 1 
            ? allPerformanceCampaigns?.topPerformanceCampaigns 
            : allPerformanceCampaigns?.lowPerformanceCampaigns;
        
        const hasValidData = data && data.length > 0;
        
        const performanceCampaigns = (data || []).map((item) => ({ 
            ...item, 
            range: mode === 1 ? 'high' : 'low' 
        }));
        
        dispatch(get_dashboard_data({
            field: 'topPerformances',
            data: { data: performanceCampaigns, isLoading: false, isFailure: !hasValidData },
        }));
    };

    const handleTopEarningChange = (durationData, item) => {
        const mode = dd_top_earning_communication.indexOf(item) + 1;
        const data = mode === 1 ? allEarningCampaigns?.top : allEarningCampaigns?.low;
        
        const hasValidData = data && data.length > 0;
        
        dispatch(get_dashboard_data({
            field: 'topEarnings',
            data: { data: data || [], isLoading: false, isFailure: !hasValidData },
        }));
    };

    const handlesegmentschange = (durationData, item) => {
        const index = dd_segments.indexOf(item);
        const payload = {
            clientId: clientId,
            userId,
            departmentId: departmentId,
            partnerID: 0,
            Isdashboardflage: true,
            attributeName: index === 0 ? 'Segment_s' : 'Industry_s',
        };
        if(businessTypeId !==2){
            dispatch(getSegmentIndustry({ payload }));
        }
    };

    const resetCommunicationDashboardSelections = (durationData) => {
        handlePerformanceChange(durationData, dd_channelPerformance[0]);
        handleAudienceBehaviourChange(durationData, dd_audience_behaviour[0]);
        handleTopPerformancesChange(durationData, dd_top_performing_communication[0]);
        handleTopEarningChange(durationData, dd_top_earning_communication[0]);
        const segmentDefault = businessTypeId === 2 ? dd_advocates[0] : dd_segments[0];
        handlesegmentschange(durationData, segmentDefault);
        setDropData({
            performancesTitle: dd_top_performing_communication[0],
            earningsTitle: dd_top_earning_communication[0],
        });
        setCommunicationChartsRemountSeq((n) => n + 1);
    };

    const handleRecentChange = (durationData, item) => {
        const mode = DDL_RECENT_DATA.indexOf(item) + 1;
        const campaignData = mode === 1 ? allRecentCampaigns?.recentCampaigns : allRecentCampaigns?.recentCompletedCampaigns;
        const hasValidData = campaignData && campaignData.length > 0;
        const recentCampaign = (campaignData || []).reduce((res, el, i) => {
            if (i % 3 === 0) {
                res[res.length] = [el];
            } else {
                res[res.length - 1] = [...res[res.length - 1], el];
            }
            return res;
        }, []);

        dispatch(get_dashboard_data({
            field: 'recentCampaigns',
            data: { groupedCampaigns: recentCampaign, isLoading: false, isFailure: !hasValidData },
        }));
        resetCommunicationDashboardSelections(durationData);
    };

    const getall = (durationData) => {
        const payload = {
            duration: durationData,
            clientID: clientId,
            userId,
            departmentID: departmentId,
        };
        dispatch(getAllDashboardData({ payload }));
        handlesegmentschange(durationData, dd_segments[0]);
    };

    useEffect(() => {
        const prev = clientDeptSessionRef.current;
        if (prev?.clientId === clientId && prev?.departmentId === departmentId) return;
        clientDeptSessionRef.current = { clientId, departmentId };
        setDuration(30);
        setDropData({
            performancesTitle: dd_top_performing_communication[0],
            earningsTitle: dd_top_earning_communication[0],
        });
        setDashboardSessionResetSeq((n) => n + 1);
        setCommunicationChartsRemountSeq((n) => n + 1);

    }, [clientId, departmentId, isAgencyAccountAdmin]);

    const values = {
        duration,
        dropData,
        setDropData,
        handleRecentChange,
        handlePerformanceChange,
        handlesegmentschange,
        handleAudienceBehaviourChange,
        handleTopPerformancesChange,
        handleTopEarningChange,
        getall,
        currentRenderDashBoardTitle,
        dashboardSessionResetSeq,
        communicationChartsRemountSeq,
    };

    // useEffect(() => {
    //     var checkTime = sessionStorage.getItem('dashboard');
    //     if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
    //         setConfimrationModal(true);
    //     } else {
    //         // console.log('Time checking :::: ', new Date() - new Date(checkTime) > 900000);
    //         if (checkTime === null || new Date() - new Date(checkTime) > 900000) {
    //             sessionStorage.setItem('dashboard', new Date());
    //             getall(30);
    //             // parent(getall);
    //         } else {
    //             // console.log('ASDASDASD :::: ', avgTimeData);
    //             // setAvgData([...avgTimeData]);
    //         }
    //     }
    // }, []);

    // useEffect(() => {
    //     if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
    //         setConfimrationModal(true);
    //     } else {
    //         setConfimrationModal(false);
    //         if (!isAgencyAccountAdmin && location?.index === 0) getall(duration);
    //     }
    // }, [clientId, departmentId,location?.index]);
    // useEffect(() => {
    //     if (state?.from === 'login') {
    //         // dispatch(decrement_global_loading());
    //     }
    // }, [state]);
    useEffect(() => {
        return () => {
            dispatch(updateClientBranch(false));
            dispatch(updateisClient(true));
            dispatch(updateisClientID(false));
            dispatch(update_Dashboard('Communication dashboard'));
        };
    }, []);

    useEffect(() => {
        const currentDashboard = dashboardList[indexValue]?.text || 'Communication dashboard';
        setCurrentRenderDashBoardTitle(currentDashboard);
        dispatch(update_Dashboard(currentDashboard));
    }, [indexValue]);

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'newVersionConfirm' || e.key === 'previousVersionModal') {
                setVersionState(getVersionStateFromStorage());
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useEffect(() => {
        setVersionState(getVersionStateFromStorage());
    }, []);

    useEffect(() => {
        let isCancelled = false;
        const prefetchLikelyNextRoutes = async () => {
            if (isCancelled) return;
            await Promise.allSettled([
                import('Pages/AuthenticationModule/Analytics/Pages/CommunicationAnalytics/DetailedAnalytics'),
                import('Pages/AuthenticationModule/Analytics/Pages/CommunicationAnalytics/AnalyticsReport'),
            ]);
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(() => {
                prefetchLikelyNextRoutes();
            });
            return () => {
                isCancelled = true;
                window.cancelIdleCallback?.(idleId);
            };
        }

        const timer = setTimeout(() => {
            prefetchLikelyNextRoutes();
        }, 1200);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, []);

    return (
        // Contend holder starts
        <DashboardContext.Provider value={values}>
            <div className="page-content-holder">
                {/* Main page heading block starts */}
                <RSPageHeader
                    title={dashboardList[indexValue]?.text || 'Communication dashboard'}
                    isDashboard
                    isHeaderLine
                    rightCommonMenus={true}
                    dashboardDateFilterResetSeq={dashboardSessionResetSeq}
                    onDurationChange={(e) => {
                        const nextDuration =
                            e === 'Last 30 days' ? 30 : e === 'Last 90 days' ? 90 : e === 'Last 180 days' ? 180 : 30;
                        setDuration(nextDuration);
                        getall(nextDuration);
                        setDropData({
                            performancesTitle: dd_top_performing_communication[0],
                            earningsTitle: dd_top_earning_communication[0],
                        });
                        setCommunicationChartsRemountSeq((n) => n + 1);
                    }}
                    BUtooltip={BUtooltip}
                    isLiveDashboard
                />
                {/* Main page heading block ends */}

                {/* Main page content block starts */}
                <Container fluid>
                    <div className="page-content container-del">
                        <RSTabbarFluid
                            defaultClass="col-md-4"
                            dynamicTab="sp-mb-space-sm mini"
                            activeClass="active"
                            tabData={dashboardList}
                            className="rs-tabs row rst-left-space"
                            defaultTab={location ? location.index : 0}
                            callBack={(item, index) => {
                                setCurrentRenderDashBoardTitle(item?.text);
                                dispatch(update_Dashboard(item?.text));
                                let url = '/dashboard'
                                    const state1 = { index: Number(index) };
                                    const encryptState = encodeUrl(state1);
                                    navigate(`${url}?q=${encryptState}`, {
                                        state: {
                                            index,
                                        },
                                    });
                            }}
                        />
                    </div>
                </Container>
                <RSConfirmationModal
                    show={confirmationModal}
                    text={SELECT_BU}
                    handleClose={() => {
                        setConfimrationModal(false);
                        setBUtooltip(true);
                    }}
                    handleConfirm={() => {
                        setConfimrationModal(false);
                        setBUtooltip(true);
                    }}
                    secondaryButton={false}
                />
                {/* {!versionState?.newVersionConfirm && versionState?.previousVersionModal && (
                    <VersionReminder onConfirmNewVersion={() => setVersionState(getVersionStateFromStorage())} />
                )} */}
                {/* Main page content block ends */}
            </div>
        </DashboardContext.Provider>
    );
};

export default Dashboard;
