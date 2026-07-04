import { useEffect, useMemo, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { get as _get } from 'Utils/modules/lodashReplacements';

import RSTabbar from 'Components/RSTabber';
import { AuthoringCreateChannelSkeletonBlock } from 'Components/Skeleton/pages/communication/authoring';
import { getAuthoringChannelIndex } from 'Components/Skeleton/pages/communication/authoring/authoringSkeletonUtils';
import useQueryParams from 'Hooks/useQueryParams';
import CreateCommunicationContext from './context';
import RSPageHeader from 'Components/RSPageHeader';
import RSProgressSteps from 'Components/ProgressSteps';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import CampaignInfoCard from '../Component/CampaignInfoCard/CampaignInfoCard';

import { VERTICAL_TAB_CONFIG, getChanelName } from './constant';
import { planningSteps } from '../Plan/constants';
import { getSessionId } from 'Reducers/globalState/selector';
import { selectCreateCommunicationState } from 'Reducers/communication/createCommunication/Create/selectors';
import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import { updateExistingLinks, updateSavedStatusId, updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import { setTabforEdit, updateTab, updateAnalytics, updateVerticalTab } from 'Reducers/communication/createCommunication/Create/reducer';
import { resetSmartLink, showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import { getUserListCampaign } from 'Reducers/globalState/request';
const Create = () => {
    const state = useQueryParams('/communication');
    const dispatch = useDispatch();
    const [activeTabs, setActiveTabs] = useState({});
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { personalization } = useSelector(selectCreateCommunicationState);
    const [tabs, setTabs] = useState([]);
    const params = new URLSearchParams(window.location.search);
    const hIdValue = params.get('hId');
    const authoringSkeletonChannelIndex = getAuthoringChannelIndex(window.location.search);
    const {
        verticalTab = { currentTab: hIdValue?.length > 0 ? parseInt(hIdValue, 10) : 0 },
        isDirty,
        selectedTabforEdit,
    } = useSelector(selectCreateCommunicationState);
    const { currentTab } = verticalTab;

    useComponentWillUnmount(() => {
        // dispatch(resetCreateCommunication());
    });

    useEffect(() => {
        dispatch(resetSmartLink());
    }, []);

    useEffect(() => {

        async function getSmartLinks() {
            const payload = { clientId, departmentId, userId, campaignId: _get(state, 'campaignId', 0) };
            const res = await dispatch(getSmartUrl({ payload, loading: false, iconFieldLoader: true }));
            if (!res?.status) {
                dispatch(showTabsSmartlink(false));
            }
        }

        if (state) {
            let { channels = [], analyticsTypes = [] } = state;
            let channelsList = channels
                // .filter((name) => name !== undefined)
                .map((id) => {
                    const name = getChanelName(id);
                    return name;
                });
            let defaultTab;
            const active = {};
            const tempTabs = [...VERTICAL_TAB_CONFIG].map((tab, index) => {
                if (
                    (tab.id === 'analytics' && !analyticsTypes?.length) ||
                    (tab.id !== 'analytics' && !channelsList.includes(tab.id.toLowerCase()))
                ) {
                    tab.disable = true;
                } else {
                    if (defaultTab === undefined) {
                        defaultTab = {
                            type: tab.id,
                            currentTab: index,
                        };
                    }
                    active[tab.id] = {
                        type: tab.id,
                        currentTab: index,
                    };
                    tab.disable = false;
                }
                return tab;
            });
            setActiveTabs(active);
            setTabs(tempTabs);

            let verticalTabToSet = selectedTabforEdit || defaultTab;
            if (state.genieCreateTabBootstrap) {
                const { tabValueName, verticalTabIndex } = state.genieCreateTabBootstrap;
                verticalTabToSet = { type: tabValueName, currentTab: verticalTabIndex };
            }
            if (!verticalTabToSet) {
                verticalTabToSet = { type: 'email', currentTab: 0 };
            }

            dispatch(updateVerticalTab({ tabs: verticalTabToSet, activeTabs: active }));

            const searchParams = new URLSearchParams(location.search);
            const param = searchParams.get('webft');
            if (param) {
                let payload = { field: 'webft', data: true };

                dispatch(
                    updateVerticalTab({
                        tabs: {
                            type: 'analytics',
                            currentTab: 7,
                        },
                    }),
                );
                dispatch(updateAnalytics(payload, 'webft'));
            }
            if (hIdValue?.length > 0) {
                let ctab = tempTabs[hIdValue] || null;
                dispatch(
                    updateVerticalTab({
                        tabs: {
                            type: ctab?.id || 'create',
                            currentTab: parseInt(hIdValue),
                        },
                    }),
                );
            }

            if (state.genieCreateTabBootstrap) {
                const { tabValueName, verticalTabIndex, resolvedTabName, tabIndex } = state.genieCreateTabBootstrap;
                dispatch(setTabforEdit({ type: tabValueName, currentTab: verticalTabIndex }));
                dispatch(updateTab({ field: tabValueName, data: { tabName: resolvedTabName, currentIndex: tabIndex } }));
            }
            if (
                state.savedChannelsId &&
                typeof state.savedChannelsId === 'object' &&
                !Array.isArray(state.savedChannelsId)
            ) {
                dispatch(updateSaveChannelsId(state.savedChannelsId));
            }
            if (state.savedChannelStatusId) {
                dispatch(updateSavedStatusId(state.savedChannelStatusId));
            }

            getSmartLinks();
        }
        return () => {
            //dispatch(resetCreateCommunication());
        };
    }, [state]);

    useEffect(() => {
        return () => {
            if (!window.location.pathname.split('/').includes('create-communication')) {
                dispatch(updateExistingLinks({}))
            }
        }
    }, []);

    const payload = {
        departmentId,
        clientId,
        userId,
    };

    useEffect(() => {
        if (!personalization.length) {
            dispatch(getPersonalizationFields({ payload, loading: false }));
        }
        dispatch(getUserListCampaign({ payload: { ...payload, loggedinusertype: 0 }, loading: false }));
    }, []);


    const value = useMemo(
        () => ({
            activeTabs,
        }),
        [activeTabs],
    );

    return (
        <CreateCommunicationContext.Provider value={value}>
            <div className="page-content-holder">
                {/* Main page heading block starts */}
                <RSPageHeader
                    title="Communication creation"
                    rightCommonMenus
                    isBuDisabled
                    isAgencyDisabled
                    showAgency={false}
                />
                {/* Main page heading block ends */}
                {/* Main page content block starts */}
                <div className="pc-tabs-wrapper">
                    <div className="page-content pc-communication-plan pcc-tabs-2">
                        <Container fluid>
                            <div className="page-content">
                                <Container className="px0 d-grid">
                                    <RSProgressSteps stepsData={planningSteps} />
                                    <CampaignInfoCard type="create" />
                                    {tabs.length === 0 ? (
                                        <AuthoringCreateChannelSkeletonBlock channelIndex={authoringSkeletonChannelIndex} />
                                    ) : (
                                        <div className="rs-vertical-tabs-wrapper communication-authoring-tabs">
                                            <RSTabbar
                                                dynamicTab="vertical-tabs rsv-tabs-list mt87"
                                                activeClass="active"
                                                tabData={tabs}
                                                defaultTab={currentTab}
                                                isTabChangeConfirmation={isDirty}
                                                callBack={(_, index) => {
                                                    window.scrollTo(0, 0);
                                                    if (currentTab !== index) {
                                                        dispatch(
                                                            updateVerticalTab({
                                                                tabs: {
                                                                    type: _.id,
                                                                    currentTab: index,
                                                                },
                                                            }),
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </Container>
                            </div>
                        </Container>
                    </div>
                </div>
                {/* Main page content block ends */}
            </div>
        </CreateCommunicationContext.Provider>

        // Content holder ends
    );
};

export default Create;
