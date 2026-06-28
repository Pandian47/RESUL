import { GET_WEBPUSH_TENANT_DATA } from 'Constants/EndPoints';
import { getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { IN_PAGE_SPLIT_CONTENT_DEFAULTS, isInPageBannerSelected, refreshFieldsOnSplitAB } from '../../constant';
import { ALERT_SOUND_NAME_ALREADY_EXISTS } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useMemo, useState } from 'react';
import _get from 'lodash/get';
import _cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';

import {
    getContentSetupStatus,
    COMMUNICATION_CHANNEL_ID,
} from '../../../../constant';
import RSTabber from 'Components/RSTabber';

import Scheduler from '../../../../Component/Scheduler';

import WebPreviewConfig from './Component/WebPreviewConfig/WebPreviewConfig';

import { SPLIAB_TABBER_CONFIG, TABBER_CONFIG } from './constant';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getAudioListByApp } from 'Reducers/communication/createCommunication/Create/request';
import { updateNotificationWeb } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';

import RSModal from 'Components/RSModal';

const SplitAB = ({ fieldName = '', isSplit = false, index, setDirtyReset }) => {
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    const [audioList, setAudioList] = useState([]);
    const [levelNumber, setLevelNumber] = useState('');
    const [campaignType, setCampaignType] = useState('');
    const [dataSource, setDataSource] = useState('');
    const [clickOff, setClickOff] = useState(true);
    const [showDynamiczoneModal, setShowDynamiczoneModal] = useState(false);
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
        
    const location = useQueryParams('/communication') || {};

    useEffect(() => {
        if (isSplit) {
            dispatch(
                updateNotificationWeb({
                    data: fieldName,
                    field: 'fieldNameIndex',
                }),
            );
        }
    }, []);

    useEffect(() => {
        if (location && Object.keys(location)?.length) {
            const campaignType = _get(location, 'campaignType', 'S');

            const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
            const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
            const dataSource = _get(mdcContentSetupDetails, 'dataSource', []);

            setCampaignType(campaignType);
            setLevelNumber(levelNumber);
            setDataSource(dataSource);
        }
    }, [location]);
    // console.log('type split: ', type);
    const {
        control,
        formState: { errors },
        watch,
        setValue,
        getValues,
        setError,
        clearErrors,
        reset,
        resetField,
    } = useFormContext();

    const importTabFormValues = useWatch({ control });
    const isContentSetupForSchedule = useMemo(
        () =>
            getContentSetupStatus(importTabFormValues, isSplit ? fieldName : '', {
                channelId: COMMUNICATION_CHANNEL_ID.WEB_NOTIFICATION,
                splitTabList: importTabFormValues?.splitTabList,
            }),
        [importTabFormValues, fieldName, isSplit],
    );

    const [layoutPosition] = watch(['layoutPosition']);

    const expiryName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiry` : 'expiry';
    const titleName = isSplit ? `${fieldName}.title.text` : 'title.text';
    const colorPickerName = isSplit ? `${fieldName}.title.fontColor` : 'title.fontColor';
    const shortDescName = isSplit ? `${fieldName}.shortDesc.text` : 'shortDesc.text';
    const shortDescColorPickerName = isSplit ? `${fieldName}.shortDesc.fontColor` : 'shortDesc.fontColor';
    const interactivityName = isSplit ? `${fieldName}.interactivity` : 'interactivity';
    const bgOverlayName = isSplit ? `${fieldName}.bgOverlay` : 'bgOverlay';
    const bgOverlayColorName = isSplit ? `${fieldName}.bgOverlayColor` : 'bgOverlayColor';
    const currentTabName = isSplit ? `${fieldName}.currentTabIndex` : 'currentTabIndex';
    const alertName = isSplit ? `${fieldName}.alert` : 'alert';
    const makeAlertName = isSplit ? `${fieldName}.makeAlert` : 'makeAlert';
    const thumbnailName = isSplit ? `${fieldName}.thumbnailUrl` : 'thumbnailUrl';
    const tabErrorText = isSplit ? `${fieldName}.tabErrorText` : 'tabErrorText';
    const buttonTextName = isSplit ? `${fieldName}.buttonText` : 'buttonText';
    const expiryTimeName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryTime` : 'expiryTime';
    const expiryValueName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryValue` : 'expiryValue';
    const hashTagName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.hashtag` : 'hashtag';
    const contentInputName = isSplit ? `${fieldName}.contentInput` : 'contentInput';
    const alertSoundName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.alertSound` : 'alertSound';
    const alertSoundValueName =
        isSplit && layoutPosition?.id !== 4 ? `${fieldName}.alertSoundValue` : 'alertSoundValue';
    const newAlertSound = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.newAlertSound` : 'newAlertSound';
    const newAlertSoundName =
        isSplit && layoutPosition?.id !== 4 ? `${fieldName}.newAlertSoundName` : 'newAlertSoundName';

    const impressionsName = isSplit ? `${fieldName}.impressions` : 'impressions';
    const priorityName = isSplit ? `${fieldName}.priority` : 'priority';
    const [
        deliveryType,
        interactivity,
        bgOverLay,
        bgOverlayColor,
        expiry,
        currentPage = null,
        hashTag,
        makeAlert,
        approvalList,
        alertSound,
        mobileApp,
        contentInput,
        titleColor,
        shortDescColor,
        scheduleAlert,
        // layoutPosition,
        newAlert,
        expiryTimeType,
        alertSoundValue,
        inPageBanner,
        impressions,
        priority,
        domain,
    ] = watch([
        'deliveryType',
        interactivityName,
        bgOverlayName,
        bgOverlayColorName,
        expiryName,
        currentTabName,
        hashTagName,
        makeAlertName,
        'approvalList',
        alertSoundName,
        'mobileApp',
        contentInputName,
        colorPickerName,
        shortDescColorPickerName,
        'scheduleAlert',
        // 'layoutPosition',
        newAlertSound,
        expiryTimeName,
        alertSoundValueName,
        'inPageBanner',
        impressionsName,
        priorityName,
        'domain',
    ]);
    useEffect(() => {
        if (deliveryType?.id !== 5) return;

        if (!isInPageBannerSelected(inPageBanner)) return;

        const splitFields = isSplit && fieldName ? getValues(fieldName) : getValues();
        const hasContentChoice =
            splitFields?.contentInput ||
            splitFields?.edmContent ||
            splitFields?.importUrl ||
            splitFields?.editorText ||
            splitFields?.templateContent;

        if (!hasContentChoice) {
            setValue(currentTabName, IN_PAGE_SPLIT_CONTENT_DEFAULTS.currentTabIndex);
            setValue(contentInputName, IN_PAGE_SPLIT_CONTENT_DEFAULTS.contentInput);
        }
    }, [deliveryType?.id, fieldName, isSplit, contentInputName, currentTabName, getValues, setValue, inPageBanner]);

    // const [contentInput, setContentInput] = useState('');
    // console.log(alertSoundValue, 'alertSoundValue');
    const isDeliverTypeOverlay = deliveryType?.value === 'Alert/rich push';
    const isInPageContent = deliveryType?.id === 5;
    const isInPageBannerReady = isInPageBannerSelected(inPageBanner);

    const tabErrorMessage = _get(errors, `${tabErrorText}.message`, null);
    const hastTagErrorMessage = _get(errors, `${hashTagName}.message`, null);

    const getAlertSoundValues = async (newName, edit) => {
        const payload = {
            departmentId,
            userId,
            clientId,
            appId: mobileApp?.appGuId,
            audioName: !!newName ? newName : '',
            isInsertaudioName: edit === 'save' ? true : false,
        };
        const res = await dispatch(getAudioListByApp({ payload, loading: false }));
        if (res?.status && !newName) {
            setAudioList(res?.data);
        } else if (!!newName && res?.message !== 'Alert sound name inserted successfully') {
            setError(newAlertSoundName, {
                type: 'custom',
                message: ALERT_SOUND_NAME_ALREADY_EXISTS,
            });
            setClickOff(true);
        } else {
            setClickOff(false);
        }
    };

    useEffect(() => {
        let qparam = new URLSearchParams(window.location.search);
        if (qparam.get("typeId")?.length > 0) {
            setValue(currentTabName, parseInt(qparam.get("typeId")));
        }

    }, [])

    // console.log('Errors :::: ', isSplit, layoutPosition?.value === 'Carousel', index);

    // Calculate minimum date for scheduler based on previous split tab's schedule
    const splitTabLetters = ['A', 'B', 'C', 'D', 'E'];
    const currentTabLetter = fieldName?.replace('split', '').toUpperCase() || '';
    const currentTabIndex = splitTabLetters.indexOf(currentTabLetter);

    // Get the previous tab's schedule field name to watch
    const previousTabScheduleFieldName = useMemo(() => {
        if (!isSplit || currentTabIndex <= 0) return null;
        const previousTabLetter = splitTabLetters[currentTabIndex - 1];
        return `split${previousTabLetter}.schedule`;
    }, [isSplit, fieldName, currentTabIndex]);

    // Watch the previous tab's schedule
    const previousTabSchedule = previousTabScheduleFieldName ? watch([previousTabScheduleFieldName])[0] : null;

    // Calculate minimum date: previous schedule + 5 minutes
    const getMinDateForScheduler = useMemo(() => {
        if (!isSplit || !fieldName || currentTabIndex <= 0) return null;

        // If previous tab has a schedule, add 5 minutes to it
        if (previousTabSchedule && previousTabSchedule instanceof Date && !isNaN(previousTabSchedule.getTime())) {
            return getDateWithAddMinutes(previousTabSchedule, 5);
        }

        return null;
    }, [isSplit, fieldName, currentTabIndex, previousTabSchedule]);

    return (
        <Fragment>
            <div className="form-group">
                <Row>
                   <Col sm={{ offset: 1, span: 10 }}>
                        {tabErrorMessage && (
                            <p className="color-primary-red position-relative">{tabErrorMessage}</p>
                        )}
                        <RSTabber
                            dynamicTab={`rs-content-tabs-flat col-sm-9 ${isDeliverTypeOverlay
                                ? 'notification-alertpush-tabs'
                                : 'notification-inpage-overlay-tabs'
                                }`}
                            activeClass={`active`}
                            //heading={deliveryType}
                            heading={deliveryType?.value}
                            flatTabs
                             ccTabs
                            refresh={currentPage !== null && deliveryType?.id !== 1 && deliveryType?.id !== 5}
                            isRefreshConfirmation={true}
                            defaultTab={currentPage}
                            // extraClassName={'col-md-10 offset-md-1'}
                            disableOtherTabs={currentPage !== null}
                            onRefresh={() => {
                                if (isSplit) {
                                    reset(
                                        (formState) => ({
                                            ...formState,
                                            [fieldName]: {
                                                ..._cloneDeep(refreshFieldsOnSplitAB),
                                                ...(deliveryType?.id === 5
                                                    ? IN_PAGE_SPLIT_CONTENT_DEFAULTS
                                                    : {}),
                                                pushNotifyChannelDetailId:
                                                    formState[fieldName]?.pushNotifyChannelDetailId,
                                            },
                                            splitscehdule: {
                                                autoSchedule: false,
                                                communicationPerformanceBy: 'SubjectLine',
                                                duration: '',
                                                time: 'Hour(s)',
                                            },
                                        }),
                                        {
                                            keepDirty: true,
                                        },
                                    );
                                } else {
                                    reset(
                                        (formState) => ({
                                            ...formState,
                                            ..._cloneDeep(refreshFieldsOnSplitAB),
                                        }),
                                        {
                                            keepDirty: true,
                                        },
                                    );
                                }
                                setDirtyReset(true);
                            }}
                            tabData={
                                isSplit
                                    ? SPLIAB_TABBER_CONFIG(fieldName, deliveryType?.id === 1, deliveryType?.id, index)
                                    : TABBER_CONFIG(deliveryType?.id === 1, deliveryType?.id)
                            }
                            callBack={(data, tabIndex) => {
                                // console.log('ASDADASDASDASDD_____ ', data);
                                setValue(currentTabName, tabIndex);
                                setValue('channelType', 'web');
                                // console.log('Rest :::: ', data);
                                setValue(contentInputName, data?.id);
                                // setContentInput(id);
                                if (tabErrorMessage) clearErrors(tabErrorText);
                            }}
                        />
                    </Col>
                </Row>
                <WebPreviewConfig fieldName={fieldName} isSplit={isSplit} variant="splitAB" />
            </div>
            {(location?.campaignType === 'S' ||
                (location?.campaignType === 'M' &&
                    location?.mdcContentSetupDetails?.levelNumber === 1 &&
                    location?.mdcContentSetupDetails?.dataSource === 'TL')) &&
                isContentSetupForSchedule &&
                (!levelNumber || levelNumber < 2) && (
                    <Scheduler
                        isSplitTabs={isSplit && layoutPosition?.id !== 4}
                        fieldName={fieldName}
                        isRequired={isSplit && scheduleAlert ? true : false || approvalList?.requestApproval ? true : false}
                        isClose={true}
                        isSendTimeRecommendation={false}
                        splitABminDate={getMinDateForScheduler}
                        isRfaEnabled={true}
                        disabled={isSplit && fieldName !== 'splitA'}
                    />
                )}

            {/* DynamiczoneModal */}
            {showDynamiczoneModal && (
                <DynamiczoneModal
                    show={showDynamiczoneModal}
                    inPageBanner={inPageBanner}
                    location={location}
                    clientId={clientId}
                    handleClose={() => setShowDynamiczoneModal(false)}
                />
            )}
        </Fragment>
    );
};

// DynamiczoneModal Component
const DynamiczoneModal = ({ show, inPageBanner, location, clientId, handleClose }) => {
    const dispatch = useDispatch();
    const { userId, departmentId } = useSelector((state) => getSessionId(state));
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show || !inPageBanner?.bannerId) {
            setData(null);
            setError(null);
            return;
        }

        const fetchDynamicZones = async () => {
            setLoading(true);
            setError(null);

            try {
                // First, get tenantId from GetTenantId API
                let tenantId = '';
                const settingId = 8;

                if (settingId) {
                    const tenantPayload = { clientId, userId, departmentId, webnotifySettingId: settingId };

                    const tenantResponse = await dispatch(
                        post({
                            url: GET_WEBPUSH_TENANT_DATA,
                            payload: tenantPayload,
                            loading: false,
                            ok: ({ data }) => {
                                return data;
                            },
                            fail: (err) => {
                                return { status: false };
                            },
                        }),
                    );

                    // Extract tenantId from response
                    // Response structure from API: { status: true, data: "tenantId_string" } or { status: true, tenantId: "..." }
                    if (tenantResponse?.data?.status) {
                        // Check if data is a string (tenantId) or an object
                        if (typeof tenantResponse.data.data === 'string') {
                            tenantId = tenantResponse.data.data;
                        } else if (tenantResponse.data.data?.tenantId) {
                            tenantId = tenantResponse.data.data.tenantId;
                        } else if (tenantResponse.data.tenantId) {
                            tenantId = tenantResponse.data.tenantId;
                        }
                    } else if (tenantResponse?.status) {
                        if (typeof tenantResponse.data === 'string') {
                            tenantId = tenantResponse.data;
                        } else if (tenantResponse.data?.tenantId) {
                            tenantId = tenantResponse.data.tenantId;
                        } else if (tenantResponse.tenantId) {
                            tenantId = tenantResponse.tenantId;
                        }
                    }
                }

                // If tenantId is still empty, use fallback
                if (!tenantId) {
                    tenantId = inPageBanner?.tenantId || clientId || '';
                }

                // Now fetch dynamic zones with the correct tenantId
                const domainName = inPageBanner?.domainName || location?.domainName || '';
                const payload = {
                    tenantId: tenantId,
                    domainName: domainName,
                    bannerId: inPageBanner.bannerId,
                };

                const response = await dispatch(
                    post({
                        url: 'https://sdk.resul.team/Campaign/GetDynamicZones',
                        payload,
                        loading: true,
                        ok: ({ data }) => {
                            setData(data);
                            setLoading(false);
                            return data;
                        },
                        fail: (err) => {
                            setError('Failed to fetch dynamic zones');
                            setLoading(false);
                            return { status: false, message: 'Failed to fetch dynamic zones' };
                        },
                    }),
                );
            } catch (error) {
                setError('An error occurred while fetching dynamic zones');
                setLoading(false);
            }
        };

        fetchDynamicZones();
    }, [show, inPageBanner?.bannerId, inPageBanner?.pushNotifyChannelDetailID, inPageBanner?.webNotifyChannelID, location?.domainName, clientId, userId, departmentId, dispatch]);

    return (
        <RSModal
            show={show}
            header="Dynamic Zones"
            handleClose={handleClose}
            size="lg"
            body={
                <div className="p20">
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : error ? (
                        <div className="text-center color-primary-red">{error}</div>
                    ) : data ? (
                        <div>
                            {/* Display dynamic zones data here */}
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="text-center">No dynamic zones data available</div>
                    )}
                </div>
            }
        />
    );
};

SplitAB.propTypes = {
    isSplit: PropTypes.bool,
    fieldName: PropTypes.string,
};

export default SplitAB;
