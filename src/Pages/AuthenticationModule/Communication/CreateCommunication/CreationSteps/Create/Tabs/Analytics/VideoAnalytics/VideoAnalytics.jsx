import { ENTER_YOUTUBE_URL, SELECT_ANALYTICS_PLATFORM, SELECT_CHANNEL_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, IGNORE_CHANNEL, NEXT, OK, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import useQueryParams from 'Hooks/useQueryParams';

import { getChannelId } from 'Utils/modules/communicationChannels';
import { encodeUrl } from 'Utils/modules/crypto';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSPPophover from 'Components/RSPPophover';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getAuthoringSaveButtonType, useAuthoringChannelSaveLoader } from 'Components/Skeleton/pages/communication/authoring';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import { resetCreateCommunication, updateTab } from 'Reducers/communication/createCommunication/create/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { availableTabs } from '../../../constant';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getAllVideoAnalyticsContent,
    getVideoAnalyticsDomainList,
    getVideoAnalyticsList,
    saveVideoCampaign,
    validateVideo,
} from 'Reducers/communication/createCommunication/Create/request';

const VideoAnalytics = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const [urlError, setUrlError] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [channelName, setChannelName] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [data, setData] = useState(null);
    const { runSave, isSaveLoading, isNextLoading, isSendLoading, isSubmitting } = useAuthoringChannelSaveLoader();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const methods = useForm({
        defaultValues: {
            platform: '',
            channel: '',
            url: '',
        },
    });
    const {
        control,
        watch,
        handleSubmit,
        formState: { errors, dirtyFields, isValid },
        setError,
        reset,
        setValue,
    } = methods;
    const {
        tabsState: { analytics: tabAnalyticsState },
        isDirty,
        VideoAnalytics,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    const platform = watch('platform');

    useEffect(() => {
        async function getYTDomainList() {
            const payload = { clientId, departmentId, userId, analyticsType: 'YA' };
            const res = await dispatch(getVideoAnalyticsList({ payload }));
        }
        getYTDomainList();
    }, [state]);

    useEffect(() => {
        getAllanalyticsContent();
    }, [state]);

    const getAllanalyticsContent = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            campaignId: state?.campaignId,
        };
        try {
            const { status, message, data } = await dispatch(getAllVideoAnalyticsContent({ payload }));
            setData(data);
            if (status) {
                const platformData = VideoAnalytics?.videoAnalyticsList?.find(
                    (item) => item.analyticsType === data[0].analyticsType,
                );
                const payload = { clientId, departmentId, userId, domainType: data[0].analyticsType };
                const { data: response, status: listStatus } = await dispatch(getVideoAnalyticsDomainList({ payload }));
                if (listStatus) {
                    const channelData = VideoAnalytics?.videoAnalyticsDomainList?.find(
                        (item) => item.socialMediaSetupId === response[0].socialMediaSetupId,
                    );
                    reset((formState) => ({
                        ...formState,
                        platform: platformData,
                        channel: channelData,
                        url: data[0].videoURL,
                    }));
                }
            }
        } catch (error) {}
    };
    const [navigate_confirm, setNavigate_confirm] = useState(false);
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
                    // data: {
                    //     tabName: tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                    //     currentTab: tempTabsIndex[tabIndex], // tabIndex,
                    // },
                    data: {
                        tabName: tempTabs[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], //tempTabs[tabIndex], //availableTabs['analytics'][tabIndex],
                        currentTab: tempTabsIndex[tempTabs.findIndex((id) => tabAnalyticsState.tabName == id) + 1], // tempTabsIndex[tabIndex], // tabIndex,
                    },
                }),
            );
        }
    };
    const formSubmitHandler = async (data, type) => {
        const { status } = await saveVideoDetails(type);
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

    const getDomainListData = (e) => {
        const payload = { clientId, departmentId, userId, domainType: e.value.domainType };
        dispatch(getVideoAnalyticsDomainList({ payload }));
    };

    const handleValidVideo = async (e) => {
        setVideoUrl(e.target.value);
        try {
            const payload = {
                youtubeurl: videoUrl,
            };
            const { message, status } = await dispatch(validateVideo({ payload }));
            setErrorMessage(message);
            setUrlError(status);
            if (!status) {
                setError('url', {
                    type: 'custom',
                    message: errorMessage,
                });
            }
        } catch (error) {}
    };

    
    const saveVideoDetails = async (submitType = 'form') => {
        const payload = {
            departmentId,
            clientId,
            userId,
            videoCampaignData: {
                campaignId: state?.campaignId,
                videoURL: videoUrl,
                analyticsType: 'YA',
                channelName: channelName,
            },
        };
        return runSave(getAuthoringSaveButtonType(submitType), () =>
            dispatch(saveVideoCampaign({ payload, loading: false })),
        );
    };

    return (
        <form onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form'))}>
            <Row>
                <Col sm={{ offset: 1, span: 2 }}>
                    <label>Analytics platform</label>
                </Col>
                <Col sm={6}>
                    <RSKendoDropdown
                        control={control}
                        name={'platform'}
                        data={VideoAnalytics?.videoAnalyticsList}
                        textField={'analyticsDomainName'}
                        dataItemKey={'analyticsDomainId'}
                        rules={{
                            required: SELECT_ANALYTICS_PLATFORM,
                        }}
                        handleChange={(e) => {
                            getDomainListData(e);
                        }}
                    />
                </Col>
            </Row>
            {!!platform && (
                <Row>
                    <Col md={{ offset: 4 }}>
                        <RSKendoDropdown
                            control={control}
                            name={'channel'}
                            data={VideoAnalytics?.videoAnalyticsDomainList}
                            rules={{
                                required: SELECT_CHANNEL_NAME,
                            }}
                            textField={'pageURL'}
                            dataItemKey={'socialMediaChannelId'}
                            handleChange={(e) => setChannelName(e.value.pageURL)}
                        />
                        <RSPPophover
                            text={
                                "You can register a new domain 'by choosing Manage->Settings from the menu' or clicking Add"
                            }
                        >
                            <i className={`${question_mark_mini} color-primary-blue`} />
                        </RSPPophover>
                        <RSTooltip position="top" text="Add">
                            <i className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`}  id='rs_data_circle_plus_fill_edge' />
                        </RSTooltip>
                    </Col>
                </Row>
            )}
            <Row>
                <Col sm={{ offset: 1, span: 2 }}>
                    <label>Youtube URL</label>
                </Col>
                <Col sm={6}>
                    <RSInput
                        control={control}
                        name={'url'}
                        rules={{
                            required: ENTER_YOUTUBE_URL,
                        }}
                        handleOnBlur={(e) => {
                            handleValidVideo(e);
                        }}
                    />
                </Col>
            </Row>
            <div className="button-wrapper">
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
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents
                    disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                >
                     {SAVE}
                </RSSecondaryButton>
                <RSPrimaryButton
                    isLoading={isNextLoading}
                    blockBodyPointerEvents
                    disabledClass={isSubmitting ? 'pe-none click-off' : ''}
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
        </form>
    );
};

export default VideoAnalytics;
