import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { SELECT_ANALYTICS_PLATFORM } from 'Constants/GlobalConstant/ValidationMessage';
import { ANALYTIC_PLATFORM, CANCEL, IGNORE_CHANNEL, NEXT, OK, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { map as _map,get as _get  } from 'Utils/modules/lodashReplacements';
import useQueryParams from 'Hooks/useQueryParams';
import RSTabber from 'Components/RSTabber';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { formInitialState, secGoal, appGoalList } from './constant';
import {
    resetCreateCommunication,
    updateTab,
    updateAnalytics,
} from 'Reducers/communication/createCommunication/create/reducer';
import { useNavigate } from 'react-router-dom';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { availableTabs } from '../../../constant';

import { getSessionId } from 'Reducers/globalState/selector';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import {
    getGeneratedLink,
    smartlinkEdit,
    screenListSelector,
} from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import SmartLinkEnable from '../../../Component/SmartLinkEnable/SmartLinkEnable';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

import { getAppAnalyticsContent, getMobileAnalyticsList, saveMOBILEAnalyticsChannel } from 'Reducers/communication/createCommunication/Create/request';
import { showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
const AppAnalytics = () => {
    const {
        tabsState: { analytics: tabAnalyticsState },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const methods = useForm(formInitialState);
    const {
        control,
        handleSubmit,
        trigger,
        reset,
        formState: { errors, dirtyFields, isValid },
    } = methods;
    const [navigate_confirm, setNavigate_confirm] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const isEngagement = state?.primaryGoal === 'Engagement' || state?.secondaryGoal === 'Engagement';
    const isConverison = state?.primaryGoal === 'Conversion' || state?.secondaryGoal === 'Conversion';
    const screenListTemp = useSelector((state) => screenListSelector(state));
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const edit = useSelector((state) => smartlinkEdit(state));

    const [isSmartLink, setIsSmartLink] = useState(false);
    const [appAnalytics, setAppAnalytics] = useState({
        mobileAppDomains: [],
        appAnalyticsContent: [],
        appScreenList: [],
    });

    useEffect(() => {
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId: state?.campaignId };
            const res = await dispatch(getSmartUrl({ payload, reduceLoad: true }));
            if (!res?.status) {
                setIsSmartLink(true);
                dispatch(updateSmartLinkShow(false));
            } else {
                setIsSmartLink(false);
                dispatch(updateSmartLinkShow(true));
            }
        }
        if (!smartLink1 || !smartLink2) {
            if (state && _get(state, 'campaignId', 0) > 0) getSmartLink();
        }
    }, [state]);

    let appGoalListTemp =
        state?.secondaryGoal === 'Engagement' || state?.secondaryGoal === 'Conversion'
            ? appGoalList.concat(secGoal)
            : appGoalList;
    useEffect(() => {
        let tempObject = edit?.smartLink1?.slice(1);
        const temp = {};

                let tempObjectGoal = tempObject?.map((res) => ({
            mobilePlatform: res?.mobilePlatform,
            mobileApp: res?.mobileApp?.appName,
            isURIParameter: res?.isURIParameter,
            deferredDeepLink: res?.deferredDeepLink,
            appScreen: res?.appScreen,
            appSubScreen: res?.subappScreen,
            events: [],
            eventstemp: [],
            show: false,
            appGuid: res?.mobileApp?.appGuid,
        }));
        // let tempanalyticsPlatform = appAnalytics?.mobileAppDomains?.filter(
        //     (action) => appAnalytics?.appAnalyticsContent[0]?.analyticsType === action?.domainType,
        // );
        temp.primaryGoal = tempObjectGoal;

        reset((formState) => {
            // console.log('formState: ', formState);
            return {
                ...formState,

                primaryGoal: tempObjectGoal,
                // ...temp,
                // analyticsPlatform: appAnalytics?.appAnalyticsContent?.length > 0 ? tempanalyticsPlatform[0] : [],
            };
        });
    }, [screenListTemp?.length > 0, edit?.smartLink1?.length > 0]);

    useEffect(() => {
        async function getMADomainList() {
            const payload = { clientId, departmentId, userId, analyticsType: 'MA' };
            const { status, data } = await dispatch(getMobileAnalyticsList({ payload }));
            if (status) {
                setAppAnalytics((pre) => ({ ...pre, mobileAppDomains: data }));
            } else {
                setAppAnalytics((pre) => ({ ...pre, mobileAppDomains: [] }));
            }
        }
        getMADomainList();
    }, []);

    useEffect(() => {
        async function getAnalyticsContent() {
            const payload = { clientId, departmentId, userId, campaignId: _get(state, 'campaignId', 0) };
            const { status, data } = await dispatch(getAppAnalyticsContent({ payload }));

            if (status) {
                setAppAnalytics((pre) => ({ ...pre, appAnalyticsContent: data }));
                let tempanalyticsPlatform = appAnalytics?.mobileAppDomains?.filter(
                    (action) => analyticsType === action?.domainType,
                );
                let tempObjectGoalEdit = edit?.smartLink1?.slice(1)?.map((res) => ({
                    mobilePlatform: res?.mobilePlatform,
                    mobileApp: res?.mobileApp?.appName,
                    isURIParameter: res?.isURIParameter,
                    deferredDeepLink: res?.deferredDeepLink,
                    appScreen: res?.appScreen,
                    appSubScreen: res?.subappScreen,
                    events: eventGoalData?.fieldsInfo?.events,
                    eventstemp: [],
                    show: false,
                    appGuid: res?.mobileApp?.appGuid,
                }));

                let payload = { field: 'MobileAnalytics', data };
                dispatch(updateAnalytics(payload, 'MobileAnalytics'));
                                reset({ analyticsPlatform: tempanalyticsPlatform[0], primaryGoal: tempObjectGoalEdit });
            } else {
                setAppAnalytics((pre) => ({ ...pre, appAnalyticsContent: [] }));
            }
        }
        if (!!state?.campaignId) getAnalyticsContent();
    }, [state, appAnalytics?.appAnalyticsContent.appConvTrackId > 0]);

    const handleNavigation = () => {
        let { analyticsTypes = [] } = state;
        let tempTabsIndex = [];
        const tabIndex = tabAnalyticsState?.currentTab + 1;
        const tempTabs = _map(analyticsTypes, (id) => {
            const { label } = getChannelId(id);
            const normalizedLabel = label.toLowerCase();
            if (normalizedLabel === 'app analytics') return 'app';
            if (normalizedLabel === 'webinar') return 'events';
            return normalizedLabel;
        });
        const tempTabsName = _map(availableTabs['analytics'], (index, value) => {
            if (tempTabs.includes(index)) {
                tempTabsIndex.push(value);
            }
        });
        if (tempTabs?.length === tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1) {
            if (state?.channels?.length === 1 && state?.channels?.includes(3)) {
                navigate('/communication', {
                    replace: true,
                    state: {
                        index: 0,
                    },
                });
            } else {
                let url = '/communication/execute';
                const encryptState = encodeUrl(state);
                dispatch(resetCreateCommunication());
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
            }
        } else {
            dispatch(
                updateTab({
                    field: 'analytics',
                    data: {
                        tabName: tempTabs[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], //tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                        currentTab: tempTabsIndex[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], // tempTabsIndex[tabIndex], // tabIndex,
                    },
                }),
            );
        }
    };
    const formSubmitHandler = async (data, type) => {
                let tempGoalData = primaryGoal?.map((res) => ({
            MobileplatformType: res?.mobilePlatform,
            AndridSelectscreen: res?.mobilePlatform?.toLowerCase().includes('an')
                ? res?.appScreen?.activityName || ''
                : '',
            AndridSelectsSubcreen: res?.mobilePlatform?.toLowerCase().includes('an')
                ? res?.appSubScreen?.subScreenName || ''
                : '',
            IOSSelectscreen: res?.mobilePlatform?.toLowerCase().includes('an')
                ? ''
                : res?.appScreen?.activityName || '',
            IOSSelectsSubcreen: res?.mobilePlatform?.toLowerCase().includes('an')
                ? ''
                : res?.appSubScreen?.subScreenName || '',
        }));
        let tempEventGoal = [];
        tempEventGoal.push({
            campaignId: state?.campaignId,
            appId:
                primaryGoal[0].appGuid !== undefined
                    ? primaryGoal[0].appGuid
                    : edit?.smartLink1?.slice(1)[0].mobileApp.appGuid,
            //primaryGoal[0].appGuid !== undefined ? primaryGoal[0].appGuid :
            deviceType: primaryGoal[0].mobilePlatform,
            deviceOs: primaryGoal[0].mobilePlatform?.toLowerCase().includes('an') ? 'Android' : 'iOS',
            imageData: primaryGoal[0]?.eventstemp?.imageData,
            goalType: 'P',
            fieldsInfo: {
                campaignStartDate: state?.startDate,
                campaignEndDate: state?.endDate,
                fieldCaptureList: primaryGoal[0]?.eventstemp?.selectControls,
                minDuration: primaryGoal[0]?.eventstemp?.screenTracking?.minDuration,
                minLength: primaryGoal[0]?.eventstemp?.screenTracking?.minLength,
                screenfilter: primaryGoal[0]?.eventstemp?.screenTracking?.screenTrackCond,
                events: primaryGoal[0]?.events,
                pageContent: { controls: primaryGoal[0]?.eventstemp?.controlsArray },
            },
        });

        const payload = {
            clientId,
            departmentId,
            userId,
            copy: false,
            campaignId: state?.campaignId,
            analyticsType: analyticsPlatform?.domainType,
            mobileAppGuid:
                primaryGoal[0].appGuid !== undefined
                    ? primaryGoal[0].appGuid
                    : edit?.smartLink1?.slice(1)[0].mobileApp.appGuid,
            recipientFormId: 0,
            deviceType: primaryGoal[0].mobilePlatform,
            deviceOs: primaryGoal[0].mobilePlatform?.toLowerCase().includes('an') ? 'Android' : 'iOS',
            mobileDataJSON: tempGoalData,
            goalType: 'P',
            eventGoalData: primaryGoal[0]?.eventstemp?.currentActivity?.length > 0 ? tempEventGoal[0] : [],
        };
        // console.log('payload: ', payload);
        const { status } = await dispatch(saveMOBILEAnalyticsChannel({ payload }));
        if (status) {
            if (type === 'save') {
                dispatch(resetCreateCommunication());
                navigate('/communication', {
                    index: 0,
                });
            } else {
                handleNavigation();
            }
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit((formState) => formSubmitHandler(formState, 'form'))}
                className="rsv-tabs-content tab-content position-relative"
            >
                <div className="box-design bd-top-border">
                    {isSmartLink && (
                        <SmartLinkEnable
                            secondaryButton={false}
                            onSave={() => setIsSmartLink(false)}
                            onReject={() => {
                                dispatch(showTabsSmartlink(true));
                                setIsSmartLink(false);
                            }}
                        />
                    )}
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }} className="pr0">
                                <label className="control-label-left">{ANALYTIC_PLATFORM}</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={'analyticsPlatform'}
                                    label={ANALYTIC_PLATFORM}
                                    required
                                    data={appAnalytics?.mobileAppDomains}
                                    textField={'analyticsDomainName'}
                                    dataItemKey={'analyticsDomainId'}
                                    rules={{
                                        required: SELECT_ANALYTICS_PLATFORM,
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>

                    {(isEngagement || isConverison) && edit?.smartLink1?.length > 0 && (
                        <div>
                            <RSTabber
                                dynamicTab={`res-content-tabs-split`}
                                activeClass={`active`}
                                defaultTab={0}
                                tabData={appGoalListTemp}
                                componentClassName ={'w-100'}
                            />
                        </div>
                    )}
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            dispatch(resetCreateCommunication());
                            navigate('/communication', {
                                replace: true,
                                state: {
                                    index: 0,
                                },
                            });
                        }}
                    >
                         {CANCEL}
                    </RSSecondaryButton>
                    <RSSecondaryButton
                        onClick={() => {
                            handleSubmit((data) => formSubmitHandler(data, 'save'))();
                        }}
                        className="color-primary-blue"
                    >
                        {SAVE}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            if (!isDirty && !isValid) {
                                setNavigate_confirm(true);
                            } else {
                                handleSubmit((data) => formSubmitHandler(data, 'form', false))();
                            }
                        }}
                    >
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </form>

            <RSConfirmationModal
                show={navigate_confirm}
                text={IGNORE_CHANNEL}
                primaryButtonText={OK}
                handleClose={() => {
                    setNavigate_confirm(false);
                }}
                handleConfirm={() => {
                    handleNavigation();
                    setNavigate_confirm(false);
                }}
            />
        </FormProvider>
    );
};

export default AppAnalytics;
