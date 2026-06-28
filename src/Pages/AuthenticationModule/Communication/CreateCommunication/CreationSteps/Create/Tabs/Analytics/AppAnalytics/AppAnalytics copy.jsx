import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import { SELECT_ANALYTICS_PLATFORM, SELECT_SUB_APP_SCREEN } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, IGNORE_CHANNEL, NEXT, OK, SAVE, SUB_APP_SCREEN } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import _map from 'lodash/map';
import _get from 'lodash/get';
import useQueryParams from 'Hooks/useQueryParams';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { formInitialState } from './constant';
import { resetCreateCommunication, updateTab } from 'Reducers/communication/createCommunication/create/reducer';

import { useNavigate } from 'react-router-dom';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { availableTabs } from '../../../constant';

import { getSessionId } from 'Reducers/globalState/selector';
import { updateSmartLinkShow } from 'Reducers/communication/createCommunication/execute/reducer';
import { getGeneratedLink, smartlinkEdit } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import SmartLinkEnable from '../../../Component/SmartLinkEnable/SmartLinkEnable';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { RSInput } from 'Components/RSInput';

import {
    getAppAnalyticsContent,
    getAppScreenList,
    getMobileAnalyticsList,
} from 'Reducers/communication/createCommunication/Create/request';
const AppAnalytics = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    // console.log('smartLink1: ', smartLink1);
    const edit = useSelector((state) => smartlinkEdit(state));
    const smartValue = edit?.smartLink1;
    const [isSmartLink, setIsSmartLink] = useState(false);
    const [appAnalytics, setAppAnalytics] = useState({
        mobileAppDomains: [],
        appAnalyticsContent: [],
        appScreenList: [],
    });
    useEffect(() => {
        async function getSmartLink() {
            const payload = { clientId, departmentId, userId, campaignId: state?.campaignId };
            const res = await dispatch(getSmartUrl({ payload }));
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

    useEffect(() => {
        if (edit?.smartLink1?.length > 0) {
            getMobilePlatform();
        }
    }, [edit]);

    const getMobilePlatform = () => {
        const payload = {
            clientId,
            userId,
            departmentId,
            mobileAppId: smartValue?.[1]?.appGuid,
            mobileplatformId: smartValue?.[1]?.mobilePlatform,
            mobileType: smartValue?.[1]?.mobileApp?.appName,
            isdeferdeeplinkchecked: smartValue?.[1]?.deferredDeepLink ? 'Y' : 'N', //-- S
        };
        const { status, data } = dispatch(getAppScreenList({ payload }));
        if (status) {
            setAppAnalytics((pre) => ({ ...pre, appScreenList: screenList }));
        } else {
            setAppAnalytics((pre) => ({ ...pre, appScreenList: [] }));
        }
    };

    const {
        tabsState: { analytics: tabAnalyticsState },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const methods = useForm(formInitialState);
    const {
        control,
        handleSubmit,
        formState: { errors, dirtyFields, isValid },
    } = methods;
    const [navigate_confirm, setNavigate_confirm] = useState(false);

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
    }, [state]);

    useEffect(() => {
        async function getAnalyticsContent() {
            const payload = { clientId, departmentId, userId, campaignId: _get(state, 'campaignId', 0) };
            const { status, data } = await dispatch(getAppAnalyticsContent({ payload }));
            if (status) {
                setAppAnalytics((pre) => ({ ...pre, appAnalyticsContent: data }));
            } else {
                setAppAnalytics((pre) => ({ ...pre, appAnalyticsContent: [] }));
            }
        }
        getAnalyticsContent();
    }, [state]);

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
            let url = '/communication/execute';
            const encryptState = encodeUrl(state);
            dispatch(resetCreateCommunication());
            navigate(`${url}?q=${encryptState}`, {
                state,
            });
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
    const formSubmitHandler = (data, type) => {
        if (type === 'save') {
            dispatch(resetCreateCommunication());
            navigate('/communication', {
                index: 0,
            });
        } else {
            handleNavigation();
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form'))}
                className="rsv-tabs-content tab-content position-relative"
            >
                <div className="box-design bd-top-border">
                    {isSmartLink && (
                        <SmartLinkEnable
                            secondaryButton={false}
                            onSave={() => setIsSmartLink(false)}
                            onReject={() => setIsSmartLink(false)}
                        />
                    )}
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }} className="pr0">
                                <label className="control-label-left">Analytics platform</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropdown
                                    control={control}
                                    name={'analyticsPlatform'}
                                    label={'Analytics platform'}
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
                    <span>Primary goal</span>

                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Mobile platform</label>
                            </Col>
                            <Col sm={6}>
                                <RSInput
                                    type={'text'}
                                    name={'mobilePlatform'}
                                    disabled
                                    value={smartValue?.[1]?.mobilePlatform}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Mobile app</label>
                            </Col>
                            <Col sm={6}>
                                <RSInput
                                    type={'text'}
                                    name={'mobileAppView'}
                                    disabled
                                    value={smartValue?.[1]?.mobileApp?.appName}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Mobile app</label>
                            </Col>
                            <Col sm={6}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={'appScreen'}
                                    data={appAnalytics?.appScreenList}
                                    dataItemKey={'activityName'}
                                    textField={'screenName'}
                                    handleChange={({ value }) => {
                                        // const payload = {
                                        //     mobileAppId: mobileApp,
                                        //     deviceType:
                                        //         getDeviceType(platform),
                                        //     screenName: value.screenName,
                                        //     mobileType: platform,
                                        // };
                                        // dispatch(
                                        //     getAppSubScreenList(payload),
                                        // );
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {/*  <div className="form-group">
                        <Row>
                            <Col sm={4} className="text-right">
                                <label className="control-label-left">Mobile App</label>
                            </Col>
                            <Col sm={7}>
                                <RSKendoDropDownList
                                    control={control}
                                    name={`${currentName}.subappScreen`}
                                    label={SUB_APP_SCREEN}
                                    data={_get(
                                        subScreenList,
                                        appScreen,
                                        [],
                                    )}
                                    textField={'subScreenName'}
                                    rules={{
                                        required:
                                            SELECT_SUB_APP_SCREEN,
                                    }}
                                /> 
                            </Col>
                        </Row>
                    </div>*/}
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
