import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import RSTabbar from 'Components/RSTabber';
import {
    ExecutePageLoadingSkeletonBlock,
    ExecuteROIPageLoadingBlock,
} from 'Components/Skeleton/pages/communication/execute';
import RSPageHeader from 'Components/RSPageHeader';
import RSProgressSteps from 'Components/ProgressSteps';
import AnalysisProgress from './Components/AnalysisProgress/AnalysisProgress';
import ExecuteContent from './Pages/ExecuteContent/ExecuteContent';
import CampaignInfoCard from '../Component/CampaignInfoCard/CampaignInfoCard';

import { TAB_HEADER_CONFIG } from './constant';
import { planningStepsExecute } from '../Plan/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getCampaignAnalyzeList } from 'Reducers/communication/createCommunication/execute/request';
import ROIContent from './Pages/ROIContent/ROIContent';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { isCommunicationExecuteRoiActive } from 'Components/Skeleton/Components/getRouteTabIndex';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import {
    resetExecute,
    update_campaign_details,
    update_channel_details,
    updateScrubRulesData,
    updateCampaignAnalyzeListLoading,
} from 'Reducers/communication/createCommunication/execute/reducer';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSConfirmationModal from 'Components/ConfirmationModal';
const Execute = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const state1 = useQueryParams('/communication');
    // const isROI = location?.state?.mode === 'ROI';
    // const campaignId = _get(location, 'state.campaignId', 0);
    const { channelDetails, campaignDetails, isCampaignAnalyzeListLoading } = useSelector(
        ({ communicationExecuteReducer }) => communicationExecuteReducer,
    );
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [tabConfig, setTabConfig] = useState([]);
    const [tabData, setTabData] = useState('');
    const [defaultTab, setDefaultTab] = useState(0);
    const [subSegLevel, setSubSegLevel] = useState(1);
    const [roiContent, setRoiContent] = useState(() => isCommunicationExecuteRoiActive(state1));
    const isExecuteContentLoading = !roiContent && (isCampaignAnalyzeListLoading || tabConfig.length === 0);
    const [subSegList, setSubSegList] = useState([]);
    const [cgtgValidatedChannels, setCgtgValidatedChannels] = useState({});
    const [showCGTGWarning, setShowCGTGWarning] = useState(false);
    const [pendingCGTGChannel, setPendingCGTGChannel] = useState(null);
    const { showSmartLink, smartLinkShow } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const campaignId = state1?.campaignId ?? 0;
    const isRoiFlow = useMemo(
        () => isCommunicationExecuteRoiActive(state1),
        [state1?.campaignId, state1?.roi],
    );
    const analyzeListFetchKeyRef = useRef(null);
    // console.log('Campaign  :::: ', state1);

    useEffect(() => {
        return () => {
            dispatch(resetExecute());
        };
    }, []);

    const getCampaignAnalyzeListData = async () => {
        const payload = {
            clientId,
            departmentId,
            userId,
            campaignId: state1?.campaignId,
        };

        const res = await dispatch(getCampaignAnalyzeList({ payload }));

        if (res?.status) {
            // debugger
            const { channelDetails, isSubSegmentEnabled = false } = res?.data;

            if (isSubSegmentEnabled) {
                handleSubsegmentData(res?.data);
            } else {
                let tempArr = [];

                for (var i = 0; i < channelDetails?.length; i++) {
                    let tabName = TAB_HEADER_CONFIG[channelDetails[i]?.channelId];
                    tempArr.push({
                        index: i,
                        id: channelDetails[i]?.channelId,
                        text: tabName,
                        disable: false,
                        component: () => {},
                    });
                }
                // Keep the original order from channelDetails array instead of sorting by id

                setTabConfig([...tempArr]);
                let tabName = TAB_HEADER_CONFIG[tempArr[0]?.id];
                setTabData(tabName);
                let tempData = {
                    ...res?.data,
                    //campaignType: types[campaignType],
                };
                dispatch(update_campaign_details({ field: 'campaignDetails', data: tempData }));
                let channelContentDetails = [...channelDetails];
                for (var i = 0; i < channelContentDetails?.length; i++) {
                    let name = TAB_HEADER_CONFIG[channelContentDetails[i]?.channelId];
                    dispatch(update_channel_details({ field: name, data: channelContentDetails[i] }));
                    dispatch(updateScrubRulesData({ field: name, data: channelContentDetails[i]?.scrubRules }));
                }
            }
        } else {
            setTabConfig([]);
            setTabData('');
            dispatch(
                update_failures_API_Errors({
                    field: 'GetCampaignAnalyzeList',
                    message: res?.message || 'No data available',
                }),
            );
            dispatch(update_campaign_details({ field: 'campaignDetails', data: {} }));
        }
    };
    const getSubSegments = (campDetails) => {
        return (
            campDetails?.channelDetails
                ?.reduce((acc, channel) => {
                    channel?.contentDetail?.content?.forEach((content) => {
                        if (content?.subSegmentFriendlyName && content?.subSegmentLevel) {
                            const existing = acc.find((item) => item?.id === content?.subSegmentLevel);
                            if (!existing) {
                                acc.push({
                                    name: content.subSegmentFriendlyName,
                                    id: content.subSegmentLevel,
                                });
                            }
                        }
                    });
                    return acc;
                }, [])
                ?.sort((a, b) => a?.id - b?.id) || []
        );
    };
    function handleSubsegmentData(campDetails) {
        dispatch(update_campaign_details({ field: 'campaignDetails', data: campDetails }));
        setSubSegList(getSubSegments(campDetails));
        getSubSegmentData(campDetails, 1);
    }
    function getSubSegmentData(campDetails, id) {
        let tempArr = [];
        let channelContentDetails = [...campDetails?.channelDetails];
        for (var i = 0; i < channelContentDetails?.length; i++) {
            let name = TAB_HEADER_CONFIG[channelContentDetails[i]?.channelId];
            const filteredContent = {
                ...channelContentDetails[i],
                contentDetail: {
                    ...channelContentDetails[i]?.contentDetail,
                    content:
                        channelContentDetails[i]?.contentDetail?.content?.filter(
                            (item) => item?.subSegmentLevel === id,
                        ) || [],
                },
            };
            dispatch(update_channel_details({ field: name, data: filteredContent }));
            dispatch(updateScrubRulesData({ field: name, data: channelContentDetails[i]?.scrubRules }));

            let isTab = channelContentDetails[i]?.contentDetail?.content?.some((item) => item.subSegmentLevel === id);
            if (isTab) {
                tempArr.push({
                    index: i,
                    id: channelContentDetails[i]?.channelId,
                    text: name,
                    disable: false,
                    component: () => {},
                });
            }
        }
        setSubSegLevel(id)
        // Keep the original order from channelDetails array instead of sorting by id
        setDefaultTab(0);
        setTabConfig([...tempArr]);
        let tabName = TAB_HEADER_CONFIG[tempArr[0]?.id];
        setTabData(tabName);
    }
    useEffect(() => {
        if (!state1) return;
        setRoiContent(isRoiFlow);
    }, [isRoiFlow, state1]);

    useEffect(() => {
        if (!campaignId || campaignId <= 0 || !userId || !clientId || !departmentId) {
            return;
        }

        const fetchKey = `${campaignId}:${userId}:${clientId}:${departmentId}`;
        if (analyzeListFetchKeyRef.current === fetchKey) {
            return;
        }
        analyzeListFetchKeyRef.current = fetchKey;

        dispatch(updateCampaignAnalyzeListLoading(true));
        getCampaignAnalyzeListData();
    }, [campaignId, userId, clientId, departmentId]);

    const validateCGTGForAllChannels = () => {
        if (!campaignDetails?.channelDetails) return { isValid: true };
        
        const channelsNeedingAction = [];
        
        for (const channel of campaignDetails.channelDetails) {
            const channelName = TAB_HEADER_CONFIG[channel.channelId];
            const isCGTGEnabled = channel?.TGCG?.isTGCGEnabled;
            const cgValue = Number(channel?.TGCG?.cG || 0);
            const tgValue = Number(channel?.TGCG?.tG || 0);
            const isValidated = cgtgValidatedChannels[channelName];
            
            if (isCGTGEnabled && cgValue === 0 && tgValue === 0 && !isValidated) {
                channelsNeedingAction.push({ channelId: channel.channelId, channelName });
            }
        }
        
        if (channelsNeedingAction.length > 0) {
            return {
                isValid: false,
                firstChannelNeedingAction: channelsNeedingAction[0],
            };
        }
        
        return { isValid: true };
    };

    const handleCGTGValidated = (channelName) => {
        setCgtgValidatedChannels((prev) => ({
            ...prev,
            [channelName]: true,
        }));
    };

    return (
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader title="Communication creation" rightCommonMenus isBuDisabled={true} isAgencyDisabled={true} />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <div className="pc-tabs-wrapper">
                <div className="page-content pc-communication-plan">
                    <Container fluid>
                        <div className="page-content">
                           <Container className='px0'>
                            {roiContent ? (
                                <>
                                    <RSProgressSteps stepsData={planningStepsExecute} isRoiCompleted={roiContent} />
                                    {isCampaignAnalyzeListLoading ? <ExecuteROIPageLoadingBlock /> : null}
                                    <div className={isCampaignAnalyzeListLoading ? 'd-none' : undefined}>
                                        <CampaignInfoCard type="execute" />
                                        <ROIContent setRoiContent={setRoiContent} />
                                    </div>
                                </>
                            ) : isExecuteContentLoading ? (
                                <ExecutePageLoadingSkeletonBlock />
                            ) : (
                                <>
                                    <RSProgressSteps stepsData={planningStepsExecute} isRoiCompleted={roiContent} />
                                    <CampaignInfoCard type="execute" />
                                <div className="rsv-tabs-content">
                                    <div className="box-design">
                                        {campaignDetails?.isSubSegmentEnabled && <div className="d-flex justify-content-end">
                                            <RSBootstrapdown
                                                defaultItem={subSegList?.[0]}
                                                isActive
                                                data={subSegList}
                                                isObject
                                                fieldKey="name"
                                                onSelect={(e) => getSubSegmentData(campaignDetails, e?.id)}
                                            />
                                        </div>}
                                        <div className="tabs-right-align mt30 pageSub_tab ">
                                            <RSTabbar
                                                defaultClass={`col-md-2 tabTransparent `}
                                                dynamicTab={`mb0 mini`}
                                                activeClass={`active`}
                                                tabData={tabConfig}
                                                className="rs-tabs row justify-content-center"
                                                componentClassName={'mt20'}
                                                defaultTab={defaultTab}
                                                callBack={(data, ind) => {
                                                    let tabName = TAB_HEADER_CONFIG[data?.id];
                                                    setTabData(tabName);
                                                    setDefaultTab(ind);
                                                }}
                                            />
                                        </div>
                                        <AnalysisProgress data={tabData} />
                                    </div>
                                    <ExecuteContent 
                                        tab={tabData} 
                                        setRoiContent={setRoiContent} 
                                        tabConfig={tabConfig} 
                                        subSegLevel={subSegLevel}
                                        validateCGTGForAllChannels={validateCGTGForAllChannels}
                                        setShowCGTGWarning={setShowCGTGWarning}
                                        setPendingCGTGChannel={setPendingCGTGChannel}
                                        setDefaultTab={setDefaultTab}
                                        setTabData={setTabData}
                                        handleCGTGValidated={handleCGTGValidated}
                                    />
                                </div>
                                </>
                            )}
                           </Container>
                        </div>
                    </Container>
                </div>
            </div>
            {/* Main page content block ends */}
            <RSConfirmationModal
                show={showCGTGWarning}
                text="Set the CG/TG split size or turn off CG/TG to proceed."
                primaryButtonText="OK"
                secondaryButton={false}
                header="warning"
                handleClose={() => {
                    setShowCGTGWarning(false);
                    if (pendingCGTGChannel) {
                        const tabIndex = tabConfig.findIndex((tab) => tab.id === pendingCGTGChannel.channelId);
                        if (tabIndex !== -1) {
                            setDefaultTab(tabIndex);
                            setTabData(pendingCGTGChannel.channelName);
                        }
                        setPendingCGTGChannel(null);
                    }
                }}
                handleConfirm={() => {
                    setShowCGTGWarning(false);
                    // Navigate to the channel tab that needs action
                    if (pendingCGTGChannel) {
                        const tabIndex = tabConfig.findIndex((tab) => tab.id === pendingCGTGChannel.channelId);
                        if (tabIndex !== -1) {
                            setDefaultTab(tabIndex);
                            setTabData(pendingCGTGChannel.channelName);
                        }
                        setPendingCGTGChannel(null);
                    }
                }}
            />
        </div>
        // Content holder ends
    );
};

export default Execute;
