import { onlyNumbers, onlyNumbersDecimalWithoutSpecialCharacters, charNumDotWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { IPADDRESS_REGEX, MAX_LENGTH15, MAX_LENGTH250, PORTNUMBER_REGEX, PORT_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ACCOUNTS, ENTER_FOLDER_PATH, ENTER_PASSWORD, ENTER_USERNAME, ENTER_VALID_IP_ADDRESS, ENTER_VALID_PORT_NUMBER, IP_ADDRESS as IP_ADDRESS_MSG, PORT_NUMBER as PORT_NUMBER_MSG, SELECT_CHANNEL_NAME, SELECT_END_DATE, SELECT_SFTP, SELECT_START_DATE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_NEW_SFTP, AUDIENCE_FILE_STORED, CANCEL, CHANNEL_ACCOUNT_LIST, DATA_DESTINATION, DATA_DESTINATION_LIST, RESET, DAYS, DOWNLOAD, DOWNLOADSHARE, DOWNLOAD_CSV, DOWNLOAD_LINK_DATA_SHORTLY, END_DATE, EXECUTE_ONCE_IMMEDIATELY, FAILED, FOLDER_PATH, FREQUENCY, FRIENDLY_NAME, FULL_SEGMENT_LIST, IP_ADDRESS, MAX_1000_RECORDS, MAX_20_DATA_ATTRIBUTES, MAX_20_DATA_ATTRIBUTES_SELECT, MONTH, NO_DATA_AVAILABLE, ONLINE_AUDIENCE, PARENT_AND_CHILD_ATTRIBUTES, PASSWORD, PORT_NUMBER, REQUEST_PROCESSING, SAMPLE_LIST, SELECT_LEFT_ATTRIBUTES, SENSITIVE_DATA, SHARED_RECORDS, SHARE, SHARE_LIST, START_DATE, THANK_YOU_YOUR_REQUEST, TOKNOW_MORE, USER_NAME, YOU_CAN_DOWNLOAD } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_question_mark_mini, in_progress_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import _map from 'lodash/map';
import _find from 'lodash/find';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSModal from 'Components/RSModal';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import ResKendoListbox from 'Pages/KendoDocs/CommonComponents/ResKendoListbox';
import RSInput from 'Components/FormFields/RSInput';
import RSPPophover from 'Components/RSPPophover';
import RSTooltip from 'Components/RSTooltip';

import {
    downloadTargetListFiles,
    getDownloadAttributes,
    getOnlineAudience,
    getSftpList,
    getTLShareList,
    getTLShareUpload,
    saveFtf,
    getSegScheduleDetails,
    stopSegSchedule,
} from 'Reducers/audience/targetList/request';
import { getUserInfoDetailsForOTP } from 'Reducers/globalState/request';

import { parseAudienceJson } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import { getSessionId } from 'Reducers/globalState/selector';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { downloadDynamicListFiles_Save, getDynamicListScheduleDetails, stopDynamicListSchedule } from 'Reducers/audience/dynamicList/request';
import { getSocialMedia } from 'Reducers/communication/createCommunication/Create/request';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { target_list_view } from 'Reducers/audience/targetList/reducer';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import ListNameExists from 'Components/ListNameExists';
import { checkFriendlyNameExists } from 'Reducers/audience/addAudience/request';
import RSTabbar from 'Components/RSTabber';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx';
import useApiLoader, { LOADER_TYPE, resetAbortableRequests } from 'Hooks/useApiLoader';

import usePermission from 'Hooks/usePersmission';
import { OtpValidationResultAlert } from 'Components/RSOTPForm';
import { buildSftpScheduleApiPayload, SFTP_RESET_FREQUENCY, SFTP_SCHEDULE_FREQUENCY_TABS, SFTP_SHARE_ROW_DEFAULTS, WEEKDAY_SHORT_TO_LONG } from './constant';
import { ARE_YOU_SURE_WANT_TO_RESET } from '../../../../../../../Constants/GlobalConstant/Placeholders';
const DownloadRecords = ({ showPopup, audienceValue, handleClose, isDynamic = false }) => {
    const dispatch = useDispatch();
    const isActiveRef = useRef(true);
    const downloadAttributesAPI = useApiLoader({ actionCreator: getDownloadAttributes });
    const shareChannelAPI = useApiLoader({ actionCreator: getTLShareList });
    const shareChannelAccountAPI = useApiLoader({ actionCreator: getSocialMedia });
    const onlineAudienceAPI = useApiLoader({ autoFetch: false });
    const shareUploadAPI = useApiLoader({ autoFetch: false });
    const audienceDownloadAPI = useApiLoader({ autoFetch: false });
    const stopScheduleAPI = useApiLoader({ autoFetch: false });
    const apiRefs = useRef({
        downloadAttributesAPI,
        shareChannelAPI,
        shareChannelAccountAPI,
        onlineAudienceAPI,
        shareUploadAPI,
        audienceDownloadAPI,
        stopScheduleAPI,
    });
    apiRefs.current = {
        downloadAttributesAPI,
        shareChannelAPI,
        shareChannelAccountAPI,
        onlineAudienceAPI,
        shareUploadAPI,
        audienceDownloadAPI,
        stopScheduleAPI,
    };
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const { downloadAttributes, socialShareList } = useSelector(({ targetListViewReducer }) => targetListViewReducer);

    const shareChannelDropdownData = useMemo(() => {
        const list = Array.isArray(socialShareList) ? socialShareList : [];
        return [...list, { ...SFTP_SHARE_ROW_DEFAULTS }];
    }, [socialShareList]);
    const { permissionList, permissions } = usePermission();
    const { addAccess: addAccessRDSFTP } = _find(permissionList, { featureId: 48 }) || {} || {};
    const targetPerm = _find(permissionList, { featureId: isDynamic ? 50 : 49 }) || permissions || {};
    const { addAccess, viewAccess, updateAccess } = targetPerm;
    const methods = useForm({
        defaultValues: {
            download_options: '',
            share_channel: '',
            share_channel_account_list: [],
            onlineAudience: false,
            selectedSftp: '',
            scheduleShareEnabled: false,
            sftpShareFrequencyType: 1,
            startdate: null,
            enddate: null,
            shortly: { every_time: 0, period: '' },
            daily: { days: 0, hours: '' },
            weekly: {
                week: 0,
                hours: '',
                weekDays: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
            },
            monthly: {
                type: '',
                second_hours: '',
                second_months: 0,
                second_days: { id: 1, name: 'mon', labelName: 'Monday', value: 'Monday' },
                second_frequency: { id: 1, label: 'First' },
                first_hours: '',
                first_months: 0,
                first_day: 0,
            },
        },
        mode: 'onSubmit',
    });
    const {
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { isValid, errors },
        setError,
        clearErrors,
        getValues,
        trigger,
    } = methods;
    const SFTP_VALUE = watch('selectedSftp');
    const [otpSuccessModal, setOtpSuccessModal] = useState(false);
    const [downloadResultStatus, setDownloadResultStatus] = useState(null);
    const [downloadResultError, setDownloadResultError] = useState('');
    const [otpModal, setOtpModal] = useState(false);
    const [sftpModal, setSftpModal] = useState(false);
    const [downloadToggle, setDownloadToggle] = useState(true);
    const [downloadMax, setDownloadMax] = useState(false);
    const [dataAttribute, setDataAttribute] = useState({
        leftAttributes: [],
        rightAttributes: [],
    });
    const [selectedLength, setSelectedLength] = useState(0);
    const [selectedLength1, setSelectedLength1] = useState(0);
    const [channelAccountList, setChannelAccountList] = useState({});
    const [SFTP_List, setSFTP_List] = useState([]);
    const [sftpListLoading, setSftpListLoading] = useState(false);
    const [isSftpConnecting, setIsSftpConnecting] = useState(false);
    const [sftpScheduleFrequencyTab, setSftpScheduleFrequencyTab] = useState(0);
    const [hasExistingSftpSchedule, setHasExistingSftpSchedule] = useState(false);
    const [onlineAudienceCache, setOnlineAudienceCache] = useState({});
    const [showResetConfirmationModal, setShowResetConfirmationModal] = useState(false);

    const [download_options, share_channel, share_channel_account_list, scheduleShareEnabled, onlineAudience] = watch([
        'download_options',
        'share_channel',
        'share_channel_account_list',
        'scheduleShareEnabled',
        'onlineAudience',
    ]);

    const formatListType = download_options?.replaceAll(' ', '')?.toLowerCase();
    const isFullOrSampleList = formatListType === 'fullsegmentlist' || formatListType === 'samplelist';
    const isShare = formatListType === 'share';

    const stopExistingSftpSchedule = async () => {
        const payload = isDynamic
            ? {
                departmentId,
                clientId,
                userId,
                dynamicListID: audienceValue?.dynamicListId,
                dynamicListName: audienceValue?.dynamicListName,
            }
            : {
                departmentId,
                clientId,
                userId,
                segmentationListID: audienceValue?.segmentationListID,
                segmentationName: audienceValue?.recipientsBunchName,
            };
        const res = await stopScheduleAPI.refetch({
            fetcher: () =>
                dispatch(isDynamic ? stopDynamicListSchedule(payload, false) : stopSegSchedule(payload, false)),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
        });
        if (!isActiveRef.current) return res;
        if (res?.status) {
            setHasExistingSftpSchedule(false);
            handleClose(false);
        }
        return res;
    };

    const getSelectedLength = () => {
        return dataAttribute.rightAttributes?.length || 0;
    };

    const selectedLength2 = getSelectedLength(); // Invoked on each render

    useEffect(() => {
        if (selectedLength2 > 20) {
            setDownloadMax(true);
            setDownloadToggle(true);
        } else {
            setDownloadMax(false);
            if (dataAttribute.rightAttributes?.length === 0 && !isDynamic) {
                setDownloadToggle(true);
            } else if (isShare && !share_channel) {
                setDownloadToggle(true);
            } else {
                setDownloadToggle(false);
            }
        }
        setSelectedLength1(selectedLength2);
    }, [
        selectedLength,
        setDownloadMax,
        selectedLength1,
        selectedLength2,
        isShare,
        share_channel,
        dataAttribute.rightAttributes?.length,
        isDynamic,
    ]);

    const sftpShareEndDateMin = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);

    const sftpShareEndDateMax = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const max = new Date(d);
        max.setMonth(max.getMonth() + 6);
        return max;
    }, []);
    useEffect(() => {
        setDataAttribute((prev) => ({
            ...prev,
            leftAttributes: downloadAttributes?.map((attr) => ({ id: attr.dataAttributeId, ...attr })) || [],
        }));
    }, [downloadAttributes]);

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        shareChannelAPI.refetch({ payload, loading: false });
        downloadAttributesAPI.refetch({ payload, loading: false });
        //dispatch(getUserInfoDetailsForOTP(payload, false));
    }, [audienceValue, departmentId, clientId, userId, dispatch]);

    useEffect(() => {
        return () => {
            isActiveRef.current = false;
            const {
                downloadAttributesAPI: downloadAttributes,
                shareChannelAPI: shareChannel,
                shareChannelAccountAPI: shareChannelAccount,
                onlineAudienceAPI: onlineAudience,
                shareUploadAPI: shareUpload,
                audienceDownloadAPI: audienceDownload,
                stopScheduleAPI: stopSchedule,
            } = apiRefs.current;
            resetAbortableRequests(
                downloadAttributes,
                shareChannel,
                shareChannelAccount,
                onlineAudience,
                shareUpload,
                audienceDownload,
                stopSchedule,
            );
            dispatch(target_list_view({ field: 'downloadAttributes', data: [] }));
            dispatch(target_list_view({ field: 'socialShareList', data: [] }));
        };
    }, [dispatch]);

    const isDownloadOptionsLoading = downloadAttributesAPI?.isLoading;
    const isShareChannelLoading = shareChannelAPI?.isLoading;
    const isShareChannelAccountLoading = shareChannelAccountAPI?.isLoading;
    const isOnlineAudienceAttributesLoading = onlineAudienceAPI?.isFetching;
    const isSharingList = shareUploadAPI?.isFetching;
    const isStopScheduleLoading = stopScheduleAPI?.isFetching;

    const mapOnlineAudienceAttributes = (data) =>
        data?.map((attr) => ({
            ...attr,
            id: attr?.dataAttributeId,
            sOLRFieldName: attr?.solrFieldName || '',
            uIPrintableName: attr?.uiPrintableName || '',
        })) || [];

    const applyOnlineAudienceAttributes = (attributes) => {
        setDataAttribute({
            leftAttributes: attributes,
            rightAttributes: [],
        });
    };

    const restoreDefaultDownloadAttributes = () => {
        setDataAttribute((prev) => ({
            leftAttributes:
                downloadAttributes?.map((attr) => ({
                    id: attr.dataAttributeId,
                    ...attr,
                })) || [],
            rightAttributes: [],
        }));
    };

    const fetchOnlineAudienceAttributes = async (remoteDatasourceId) => {
        const cacheKey = String(remoteDatasourceId ?? '');
        if (!cacheKey) {
            applyOnlineAudienceAttributes([]);
            return;
        }

        if (onlineAudienceCache[cacheKey]) {
            applyOnlineAudienceAttributes(onlineAudienceCache[cacheKey]);
            return;
        }

        const payload = {
            remoteDatasourceId,
            departmentId,
        };

        const res = await onlineAudienceAPI.refetch({
            fetcher: () => dispatch(getOnlineAudience(payload, false)),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
        });

        if (!isActiveRef.current) return;

        if (res?.status) {
            const attributes = mapOnlineAudienceAttributes(res?.data);
            setOnlineAudienceCache((prev) => ({ ...prev, [cacheKey]: attributes }));
            applyOnlineAudienceAttributes(attributes);
        } else {
            applyOnlineAudienceAttributes([]);
        }
    };

    const handleOnlineAudienceChange = async (e) => {
        if (e?.target?.checked) {
            await fetchOnlineAudienceAttributes(share_channel?.remoteDatasourceId);
        } else {
            restoreDefaultDownloadAttributes();
        }
    };

    const handleResetShareChannel = () => {
        setValue('share_channel', '');
        setValue('selectedSftp', '');
        setValue('share_channel_account_list', []);
        setValue('onlineAudience', false);
        setSFTP_List([]);
        setDataAttribute((prev) => ({
            leftAttributes:
                downloadAttributes?.map((attr) => ({
                    id: attr.dataAttributeId,
                    ...attr,
                })) || [],
            rightAttributes: [],
        }));
        setSelectedLength(0);
        setDownloadToggle(true);
        clearErrors(['share_channel', 'selectedSftp', 'share_channel_account_list']);
        setShowResetConfirmationModal(false);
    };

    useEffect(() => {
        setDataAttribute((prev) => ({
            ...prev,
            leftAttributes: downloadAttributes?.map((attr) => ({ id: attr.dataAttributeId, ...attr })) || [],
            rightAttributes: []
        }));

        // if (!isDynamic) {
        //     setDownloadToggle(true);
        // }

        if (isFullOrSampleList) {
            setValue('share_channel', '');
            setValue('share_channel_account_list', '');
            setValue('onlineAudience', false);
            setDataAttribute({
                leftAttributes:
                    downloadAttributes?.map((attr) => ({
                        id: attr.dataAttributeId,
                        ...attr,
                    })) || [],
                rightAttributes: [],
            });
            if (!isDynamic) {
                setDownloadToggle(true);
            }
            return;
        }

        setDataAttribute((prev) => ({ ...prev, rightAttributes: [] }));

        if (isShare) {
            if (share_channel) {
                const isGoogleOrFacebook = share_channel.apiname === 'Google' || share_channel.apiname === 'Facebook';
                if (isGoogleOrFacebook) {
                    return setDownloadToggle(false);
                } else if (dataAttribute.rightAttributes?.length === 0) {
                    return setDownloadToggle(true);
                }
            } else {
                return setDownloadToggle(true);
            }
        }
        setDownloadToggle(false);
    }, [download_options, share_channel, isDynamic]);

    const onSubmit = async () => {
        if (!downloadToggle) {
            const isSftpChannel = share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname;
            if (isSftpChannel && hasExistingSftpSchedule) {
                await stopExistingSftpSchedule();
                return;
            }
            if (share_channel?.apiname?.length > 0 && share_channel?.apiname !== SFTP_SHARE_ROW_DEFAULTS?.apiname) {
                const payload = {
                    shareList: share_channel_account_list?.map((item) => ({
                        socialMediaChannelId: share_channel?.apiConsumptionsDetailsId,
                        segmentationListId: audienceValue?.segmentationListID,
                        segmentationListName: audienceValue?.recipientsBunchName,
                        attributesListID: dataAttribute?.rightAttributes
                            ?.map((attr) => {
                                if (getValues('onlineAudience') && attr?.catType) {
                                    return `${attr?.catType}:${attr?.sOLRFieldName}`;
                                }
                                return attr?.sOLRFieldName;
                            })
                            .join(','),
                        departmentId,
                        clientId,
                        userId,
                        createdBy: userId,
                        socialMediaSetupId: item?.socialMediaSetupId || 0,
                        isOnlineAudienceEnabled: getValues('onlineAudience'),
                    })),
                };
                const response = await shareUploadAPI.refetch({
                    fetcher: () => dispatch(getTLShareUpload(payload, false)),
                    mode: 'create',
                    loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
                });
                if (!isActiveRef.current) return;
                if (response?.status) {
                    handleClose(false);
                }
            } else {
                setOtpModal(true);
            }
        }
    };
    const handleDownloadCSV = async (keyData, token) => {
        const isSftpChannel = share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname;

        let extraPayload = {};
        const schedulePayload = buildSftpScheduleApiPayload(getValues);
        extraPayload = {
            SFTPCDId: SFTP_VALUE?.SFTPCDID || 0,
            ...schedulePayload,
        };
        let payload = {
            departmentId,
            clientId,
            userId,
            segmentationListID: audienceValue.segmentationListID,
            segmentationListName: audienceValue.recipientsBunchName,
            downloadType: `${download_options === 'Sample list' ? 'Sample' : 'Full'} audience records`, // "Sample audience records",
            attributesListID: _map(dataAttribute.rightAttributes, 'sOLRFieldName').join(','),
            sentMailList: keyData,
            createdBy: userId,
            otpToken: token,
            listType: Number(audienceValue?.listType) || 0,
            ...extraPayload,
        };

        if (isDynamic) {
            payload = {
                departmentId,
                clientId,
                userId,
                dynamicListID: audienceValue?.dynamicListId,
                dynamicListName: audienceValue?.dynamicListName,
                downloadType: download_options === 'Sample list' ? 'sample' : 'full',
                attributesListID: _map(dataAttribute.rightAttributes, 'sOLRFieldName').join(','),
                sentMailList: keyData,
                requestFrom: '',
                otpToken: token,
                createdBy: userId,
                ...extraPayload,
            };
        }

        setDownloadResultError('');
        setDownloadResultStatus('processing');
        setOtpModal(false);
        setOtpSuccessModal(true);

        const res = await audienceDownloadAPI.refetch({
            fetcher: () =>
                dispatch(
                    isDynamic
                        ? downloadDynamicListFiles_Save(payload, false)
                        : downloadTargetListFiles(payload, false),
                ),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
        });

        if (!isActiveRef.current) return;

        if (res?.status) {
            setDownloadResultStatus('success');
            setTimeout(() => {
                audienceDownloadAPI.reset();
                setDownloadResultStatus(null);
                setDownloadResultError('');
                setOtpSuccessModal(false);
                handleClose(false);
            }, 3000);
        } else {
            setDownloadResultStatus('error');
            setDownloadResultError(res?.message || res?.errorMsg || 'Export request failed.');
        }
    };

    const closeDownloadResultModal = () => {
        audienceDownloadAPI.reset();
        setDownloadResultStatus(null);
        setDownloadResultError('');
        setOtpSuccessModal(false);
    };

    const downloadResultModalHeader = useMemo(() => {
        if (audienceDownloadAPI.isLoading || downloadResultStatus === 'processing') {
            return 'Processing';
        }
        if (downloadResultStatus === 'error') {
            return FAILED;
        }
        return DOWNLOAD_CSV;
    }, [audienceDownloadAPI.isLoading, downloadResultStatus]);

    const getSFTPData = async (newSftpFriendlyName, responseData) => {
        const payload = {
            departmentId,
            userId,
            clientId,
        };
        setSftpListLoading(true);
        try {
            const response = await dispatch(getSftpList(payload, { loading: false }));
            let list = [];
            if (response?.status) {
                const raw = response?.data;
                list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
                setSFTP_List(list);
            } else {
                setSFTP_List([]);
            }

            let match = null;
            if (newSftpFriendlyName) {
                const newId = responseData?.SFTPCDID || responseData?.sftpcdid || responseData?.data?.SFTPCDID || responseData?.data?.sftpcdid || (typeof responseData === 'number' || typeof responseData === 'string' ? responseData : null);
                if (newId) {
                    match = list.find((x) => String(x?.SFTPCDID) === String(newId));
                }
                if (!match) {
                    match = list.find(
                        (x) => String(x?.FriendlyName || '').trim().toLowerCase() === String(newSftpFriendlyName).trim().toLowerCase()
                    );
                }
                if (match) {
                    setValue('selectedSftp', match);
                }
            }

            const schedulePayload = isDynamic
                ? { ...payload, dynamicListID: audienceValue?.dynamicListId }
                : { ...payload, segmentationListID: audienceValue?.segmentationListID };
            let daa = await dispatch(
                isDynamic
                    ? getDynamicListScheduleDetails(schedulePayload, false)
                    : getSegScheduleDetails(schedulePayload, false),
            );

            let parsedData = parseAudienceJson(daa?.data, daa?.data ?? {});
            const scheduleList = Array.isArray(parsedData)
                ? parsedData
                : Array.isArray(parsedData?.data)
                    ? parsedData.data
                    : [];
            let hasScheduled = Boolean(daa?.status) && scheduleList.length > 0;
            setHasExistingSftpSchedule(hasScheduled);
            if (hasScheduled) {
                const row = parsedData?.[0];
                if (row) {
                    // Bind selected SFTP (best-effort)
                    if (!match) {
                        const sftpId = row?.SFTPCredential;
                        const schedMatch = list?.find((x) => String(x?.SFTPCDID) === String(sftpId));
                        if (schedMatch) setValue('selectedSftp', schedMatch);
                    }

                    // Bind attributes to right list
                    const attrNames = String(row?.AttributesListID || '')
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                    if (attrNames.length) {
                        const all = (downloadAttributes || []).map((attr) => ({ id: attr.dataAttributeId, ...attr }));
                        const right = all.filter((a) => attrNames.includes(a?.sOLRFieldName));
                        const rightSet = new Set(right.map((a) => a?.sOLRFieldName));
                        const left = all.filter((a) => !rightSet.has(a?.sOLRFieldName));
                        setDataAttribute({ leftAttributes: left, rightAttributes: right });
                    }

                    // Bind frequency (sample: daily)
                    const freq = row?.Frequency || {};
                    setValue('scheduleShareEnabled', true);
                    if (freq?.frequency === 'daily') {
                        setSftpScheduleFrequencyTab(0);
                        setValue('sftpShareFrequencyType', 1);
                        setValue('daily', {
                            days: freq?.dateBased?.interval ?? 1,
                            hours: freq?.dateBased?.time ?? '',
                        });
                    } else if (freq?.frequency === 'weekly') {
                        setSftpScheduleFrequencyTab(1);
                        setValue('sftpShareFrequencyType', 2);

                        const pb = freq?.patternBased || {};
                        const interval = pb?.interval ?? 1;
                        const time = pb?.time ?? '';
                        const weekdaysLong = Array.isArray(pb?.weekdays) ? pb.weekdays : [];

                        const longToShort = Object.entries(WEEKDAY_SHORT_TO_LONG).reduce((acc, [k, v]) => {
                            acc[String(v || '').toLowerCase()] = k;
                            return acc;
                        }, {});

                        const weekDays = {
                            mon: false,
                            tue: false,
                            wed: false,
                            thu: false,
                            fri: false,
                            sat: false,
                            sun: false,
                        };
                        weekdaysLong.forEach((d) => {
                            const key = longToShort[String(d || '').toLowerCase()];
                            if (key && Object.prototype.hasOwnProperty.call(weekDays, key)) {
                                weekDays[key] = true;
                            }
                        });

                        setValue('weekly', {
                            ...SFTP_RESET_FREQUENCY.weekly,
                            week: interval,
                            hours: time,
                            weekDays,
                        });
                    } else if (freq?.frequency === 'monthly') {
                        setSftpScheduleFrequencyTab(2);
                        setValue('sftpShareFrequencyType', 3);

                        const pb = freq?.patternBased || {};
                        const db = freq?.dateBased || {};

                        const isPatternBased =
                            pb &&
                            (pb.weekOccurrence != null || pb.weekday != null || pb.time != null || pb.interval != null);

                        if (isPatternBased) {
                            const weekOccurrenceToId = {
                                first: 1,
                                second: 2,
                                third: 3,
                                fourth: 4,
                                last: 5,
                            };
                            const occKey = String(pb.weekOccurrence || 'first').toLowerCase();
                            const occId = weekOccurrenceToId[occKey] || 1;
                            const occLabel = occKey.charAt(0).toUpperCase() + occKey.slice(1);

                            const weekdayLong = String(pb.weekday || 'monday').toLowerCase();
                            const longToShort = Object.entries(WEEKDAY_SHORT_TO_LONG).reduce((acc, [k, v]) => {
                                acc[String(v || '').toLowerCase()] = k;
                                return acc;
                            }, {});
                            const dayShort = longToShort[weekdayLong] || 'mon';
                            const dayLong =
                                WEEKDAY_SHORT_TO_LONG[dayShort] ||
                                weekdayLong.charAt(0).toUpperCase() + weekdayLong.slice(1);

                            setValue('monthly', {
                                ...SFTP_RESET_FREQUENCY.monthly,
                                type: MONTH, // "Month(s)" option (pattern-based)
                                second_frequency: { id: occId, label: occLabel },
                                second_days: { id: occId, name: dayShort, labelName: dayLong, value: dayLong },
                                second_months: pb.interval ?? 1,
                                second_hours: pb.time ?? '',
                            });
                        } else {
                            // dateBased: { day, interval, time }
                            setValue('monthly', {
                                ...SFTP_RESET_FREQUENCY.monthly,
                                type: DAYS, // "Day(s)" option (date-based)
                                first_day: db.day ?? 0,
                                first_months: db.interval ?? 1,
                                first_hours: db.time ?? '',
                            });
                        }
                    }

                    const apiEndDate = row?.endDate || row?.EndDate;
                    if (apiEndDate) {
                        const parsedEnd = new Date(apiEndDate);
                        setValue('enddate', Number.isNaN(parsedEnd.getTime()) ? new Date() : parsedEnd);
                    } else {
                        setValue('enddate', new Date());
                    }
                    clearErrors(['daily', 'weekly', 'monthly', 'shortly', 'enddate']);
                }
            }
        } finally {
            setSftpListLoading(false);
        }
    };

    useEffect(() => {
        if (
            download_options === 'Share list' &&
            share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname &&
            dataAttribute.rightAttributes?.length === 0
        ) {
            setDownloadToggle(true);
        }
    }, [download_options, dataAttribute.rightAttributes?.length]);

    const resetSftpFields = () => {
        setValue('friendlyName', '');
        setValue('ipAddress', '');
        setValue('portNumber', '');
        setValue('userName', '');
        setValue('password', '');
        setValue('folderPath', '');
        clearErrors('friendlyName');
        clearErrors('ipAddress');
        clearErrors('portNumber');
        clearErrors('userName');
        clearErrors('password');
        clearErrors('folderPath');
    };

    const handleSftpSave = async () => {
        const isValid = await trigger([
            'friendlyName',
            'ipAddress',
            'portNumber',
            'userName',
            'password',
            'folderPath',
        ]);

        if (!isValid) return;

        setIsSftpConnecting(true);
        try {
            const values = getValues();
            const payload = {
                SFTPFriendlyname: values.friendlyName,
                SFTPpath: values.folderPath,
                SFTPpassword: values.password,
                SFTPusername: values.userName,
                SFTPPort: values.portNumber,
                SFTPhostname: values.ipAddress,
                departmentId,
                clientId,
                userId,
            };
            const response = await dispatch(saveFtf(payload));
            if (response?.status) {
                await getSFTPData(values.friendlyName, response?.data);
                setSftpModal(false);
                resetSftpFields();
            }
        } finally {
            setIsSftpConnecting(false);
        }
    };

    const handleSftpCancel = () => {
        if (isSftpConnecting) return;
        setSftpModal(false);
        resetSftpFields();
    };

    const handleChannelAccoutList = (item) => {
        const channelId = item?.value?.apiConsumptionsDetailsId;
        const payload = {
            departmentId,
            userId,
            clientId,
            socialMediaChannelId: channelId,
        };
        shareChannelAccountAPI.refetch({
            params: { payload, loading: false },
            onSuccess: (response) => {
                if (!isActiveRef.current) return;
                setChannelAccountList((pre) => ({
                    ...pre,
                    [channelId]: response?.data || [],
                }));
            },
            onError: () => {
                if (!isActiveRef.current) return;
                setChannelAccountList((pre) => ({
                    ...pre,
                    [channelId]: [],
                }));
            },
        });
    };

    return (
        <Fragment>
            <FormProvider {...methods}>
                <RSModal
                    show={showPopup}
                    header={DOWNLOADSHARE}
                    isFailuremodal
                    size={'xlg'}
                    className={`${otpModal ? 'opacity-0' : ''}`}
                    body={
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className={`${download_options?.length && !isDownloadOptionsLoading ? 'form-group' : ''}`}>
                                {isDownloadOptionsLoading ? (
                                    <>
                                        <Col sm={3} className="d-flex align-items-center">
                                            <CommonSkeleton width={120} height={24} box />
                                        </Col>
                                        <Col sm={3} className="d-flex align-items-center">
                                            <CommonSkeleton width={150} height={24} box />
                                        </Col>
                                        <Col sm={3} className="d-flex align-items-center">
                                            <CommonSkeleton width={100} height={24} box />
                                        </Col>
                                    </>
                                ) : (
                                    <>
                                        <Col sm={3}>
                                            <RSRadioButton
                                                name={'download_options'}
                                                labelName={SAMPLE_LIST}
                                                control={control}
                                                popover={true}
                                                popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                popover_content={MAX_1000_RECORDS}
                                                popover_overlayClass={'modalOverlayZindexCSS'}
                                            />
                                        </Col>
                                        <Col sm={3}>
                                            <RSRadioButton
                                                name={'download_options'}
                                                labelName={FULL_SEGMENT_LIST}
                                                control={control}
                                            />
                                        </Col>
                                        {addAccess && (
                                            <Col sm={3}>
                                                <RSRadioButton
                                                    name={'download_options'}
                                                    labelName={SHARE_LIST}
                                                    control={control}
                                                    popover={true}
                                                    popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                    popover_content={SHARED_RECORDS}
                                                    popover_overlayClass={'modalOverlayZindexCSS'}
                                                />
                                            </Col>
                                        )}
                                    </>
                                )}
                            </Row>

                            {!isDownloadOptionsLoading && download_options === 'Share list' && (
                                <>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={3}>
                                                <label className="control-label-left">{DATA_DESTINATION}</label>
                                            </Col>
                                            <Col sm={7}>
                                                <RSKendoDropdown
                                                    name={'share_channel'}
                                                    control={control}
                                                    label={DATA_DESTINATION_LIST}
                                                    required
                                                    disabled={!!share_channel}
                                                    data={shareChannelDropdownData}
                                                    textField="apiname"
                                                    dataItemKey={'apiConsumptionsDetailsId'}
                                                    isLoading={isShareChannelLoading}
                                                    handleChange={(e) => {
                                                        setValue('selectedSftp', '');
                                                        setValue('share_channel_account_list', []);
                                                        setSFTP_List([]);
                                                        if (e.value?.apiConsumptionsDetailsId === 10) {
                                                            setValue('onlineAudience', false);
                                                            handleChannelAccoutList(e);
                                                        }
                                                        if (e.value?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname) {
                                                            getSFTPData();
                                                            setDataAttribute((prev) => ({
                                                                leftAttributes:
                                                                    downloadAttributes?.map((attr) => ({
                                                                        id: attr.dataAttributeId,
                                                                        ...attr,
                                                                    })) || [],
                                                                rightAttributes: [],
                                                            }));
                                                        }
                                                    }}
                                                    rules={{
                                                        required: SELECT_CHANNEL_NAME,
                                                    }}
                                                />
                                            </Col>
                                            <Col sm={1} className="d-flex align-items-center pl0">
                                                {share_channel && (
                                                    <RSTooltip text={RESET}>
                                                        <i className={`icon-md color-primary-blue cursor-pointer ${restart_medium}`} onClick={() => setShowResetConfirmationModal(true)} />
                                                    </RSTooltip>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                    {share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname && (
                                        <div className="form-group">
                                            <Row>
                                                <Col sm={3}>
                                                    <label className="control-label-left">SFTP</label>
                                                </Col>
                                                <Col sm={9}>
                                                    <RSKendoDropdown
                                                        name={'selectedSftp'}
                                                        control={control}
                                                        label={'Select SFTP'}
                                                        data={SFTP_List}
                                                        isLoading={sftpListLoading}
                                                        required
                                                        textField={'FriendlyName'}
                                                        dataItemKey={'SFTPCDID'}
                                                        handleChange={() => { }}
                                                        rules={{
                                                            required: SELECT_SFTP,
                                                        }}
                                                        footer={addAccessRDSFTP ?
                                                            <RSDropdownFooterBtn
                                                                title={ADD_NEW_SFTP}
                                                                handleClick={() => {
                                                                    setSftpModal(true);
                                                                }}
                                                            /> : undefined
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    )}
                                </>
                            )}
                            {!isDownloadOptionsLoading && download_options === 'Share list' &&
                                share_channel &&
                                share_channel?.apiConsumptionsDetailsId === 10 && (
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={3}>
                                                <label className="control-label-left">
                                                    {CHANNEL_ACCOUNT_LIST}
                                                </label>
                                            </Col>
                                            <Col sm={7}>
                                                <RSMultiSelect
                                                    control={control}
                                                    name={'share_channel_account_list'}
                                                    textField="pageName"
                                                    dataItemKey={'socialMediaSetupId'}
                                                    rules={{
                                                        required: ACCOUNTS,
                                                    }}
                                                    data={
                                                        channelAccountList[share_channel?.apiConsumptionsDetailsId] ||
                                                        []
                                                    }
                                                    label={CHANNEL_ACCOUNT_LIST}
                                                    required
                                                    isLoading={isShareChannelAccountLoading}
                                                    setError={setError}
                                                    clearErrors={clearErrors}
                                                />
                                                {/* <RSKendoDropdown
                                                name={'share_channel_account_list'}
                                                control={control}
                                                label={CHANNEL_ACCOUNT_LIST}
                                                required
                                                data={channelAccountList[share_channel?.apiConsumptionsDetailsId] || []}
                                                textField="pageName"
                                                dataItemKey={'socialMediaSetupId'}
                                                rules={{
                                                    required: ACCOUNTS,
                                                }}
                                            /> */}
                                                {getValues('share_channel_account_list')?.length > 0 && (
                                                    <RSCheckbox
                                                        className="onlineudience mt5"
                                                        name={`onlineAudience`}
                                                        control={control}
                                                        labelName={ONLINE_AUDIENCE}
                                                        disabled={isOnlineAudienceAttributesLoading}
                                                        handleChange={handleOnlineAudienceChange}
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                            {!isDownloadOptionsLoading && download_options !== '' && (
                                <Row
                                    className={
                                        ((share_channel?.apiConsumptionsDetailsId === 10 ||
                                            share_channel?.apiConsumptionsDetailsId === 11 ||
                                            (!share_channel && download_options === 'Share list')) &&
                                            !onlineAudience &&
                                            !isOnlineAudienceAttributesLoading) ||
                                            (download_options === 'Share list' &&
                                                share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname &&
                                                hasExistingSftpSchedule)
                                            ? 'pe-none click-off'
                                            : ''
                                    }
                                >
                                    <OtpValidationResultAlert
                                        show={downloadMax && share_channel?.apiname !== SFTP_SHARE_ROW_DEFAULTS.apiname}
                                        isOtpValid={false}
                                        otpMessage={MAX_20_DATA_ATTRIBUTES_SELECT}
                                        className="mb30 border-r7"
                                        iconClass={' border-blr7 border-tlr7'}
                                        compact
                                    />
                                    <ResKendoListbox
                                        loading={isOnlineAudienceAttributesLoading}
                                        leftColumnValues={dataAttribute.leftAttributes?.sort((a, b) =>
                                            a?.uIPrintableName.toLowerCase() > b?.uIPrintableName.toLowerCase()
                                                ? 1
                                                : -1,
                                        )}
                                        rightColumnValues={dataAttribute.rightAttributes?.sort((a, b) =>
                                            a?.uIPrintableName.toLowerCase() > b?.uIPrintableName.toLowerCase()
                                                ? 1
                                                : -1,
                                        )}
                                        setSelectedLength={setSelectedLength}
                                        getSelectedData={(data) => {
                                            const currentTotalSelected = data.rightColumnValues?.length || 0;

                                            if (data.rightColumnValues?.length === 0) {
                                                setDownloadToggle(true);
                                                setDownloadMax(false);
                                            } else {
                                                if (currentTotalSelected > 20) {
                                                    setDownloadToggle(true);
                                                    setDownloadMax(true);
                                                } else {
                                                    if (isShare && !share_channel) {
                                                        setDownloadToggle(true);
                                                        setDownloadMax(false);
                                                    } else {
                                                        setDownloadToggle(false);
                                                        setDownloadMax(false);
                                                    }
                                                }
                                            }
                                            setDataAttribute({
                                                leftAttributes: data?.leftColumnValues,
                                                rightAttributes: data?.rightColumnValues,
                                            });
                                        }}
                                        textField={'uIPrintableName'}
                                        customText={SELECT_LEFT_ATTRIBUTES}
                                        nodataText={NO_DATA_AVAILABLE}
                                        // leftNotes={
                                        //     <span className='mt15'>
                                        //         <small className="pointer-event-none">{PARENT_AND_CHILD_ATTRIBUTES} </small>
                                        //         <small className="pointer-event-none">{SENSITIVE_DATA} </small>
                                        //         <small className="pointer-event-none">{TOKNOW_MORE} </small>

                                        //         {download_options === 'Download sample list' ||
                                        //             download_options === 'Download full segment list' ? (
                                        //             <i className="pointer-event-none">{YOU_CAN_DOWNLOAD}</i>
                                        //         ) : (
                                        //             <></>
                                        //         )}
                                        //     </span>
                                        // }
                                        rightNotes={
                                            download_options === 'Share list' &&
                                                share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname ? (
                                                <></>
                                            ) : (
                                                <small>{MAX_20_DATA_ATTRIBUTES}</small>
                                            )
                                        }
                                    />

                                </Row>
                            )}

                            {!isDownloadOptionsLoading && download_options === 'Share list' && (
                                <>
                                    <div className="mt10 pl25">
                                        <small className="pointer-event-none">
                                            {PARENT_AND_CHILD_ATTRIBUTES}{' '}
                                        </small>
                                    </div>
                                </>
                            )}
                            {!isDownloadOptionsLoading && download_options === 'Share list' &&
                                share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname && (
                                    <div className="form-group mt15">
                                        <Row className={`mb30${hasExistingSftpSchedule ? ' pe-none click-off' : ''}`}>
                                            <Col sm={3}>
                                                <label className="control-label-left">Schedule share</label>
                                            </Col>
                                            <Col sm={9} className="d-flex align-items-center gap-3 flex-wrap">
                                                <div className='position-relative'>
                                                    <RSSwitch
                                                        name="scheduleShareEnabled"
                                                        control={control}
                                                        handleChange={(value) => {
                                                            if (!value) {
                                                                setSftpScheduleFrequencyTab(0);
                                                                setValue('sftpShareFrequencyType', 1);
                                                                setValue('startdate', null);
                                                                setValue('enddate', null);
                                                                setValue('shortly', SFTP_RESET_FREQUENCY.shortly);
                                                                setValue('daily', SFTP_RESET_FREQUENCY.daily);
                                                                setValue('weekly', SFTP_RESET_FREQUENCY.weekly);
                                                                setValue('monthly', SFTP_RESET_FREQUENCY.monthly);
                                                                clearErrors([
                                                                    'shortly',
                                                                    'weekly',
                                                                    'monthly',
                                                                    'daily',
                                                                    'startdate',
                                                                    'enddate',
                                                                ]);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                {!scheduleShareEnabled && (
                                                    <RSTooltip text={EXECUTE_ONCE_IMMEDIATELY} className={'mb-5'}>
                                                        <i
                                                            className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                        />
                                                    </RSTooltip>
                                                )}
                                            </Col>
                                        </Row>
                                        {scheduleShareEnabled && (
                                            <>
                                                <Row
                                                    className={`mt30 ${hasExistingSftpSchedule ? 'pe-none click-off' : ''
                                                        }`}
                                                >
                                                    <Col sm={3}>
                                                        <label className="control-label-left">
                                                            {FREQUENCY}
                                                        </label>
                                                    </Col>
                                                    <Col sm={9}>
                                                        <RSTabbar
                                                            dynamicTab="rs-content-tabs-2 rct-ra"
                                                            activeClass="active"
                                                            tabData={SFTP_SCHEDULE_FREQUENCY_TABS}
                                                            defaultTab={sftpScheduleFrequencyTab}
                                                            callBack={(tab, index) => {
                                                                clearErrors(['shortly', 'weekly', 'monthly', 'daily']);
                                                                setSftpScheduleFrequencyTab(index);
                                                                setValue('sftpShareFrequencyType', tab.id);
                                                                setValue('shortly', SFTP_RESET_FREQUENCY.shortly);
                                                                setValue('daily', SFTP_RESET_FREQUENCY.daily);
                                                                setValue('weekly', SFTP_RESET_FREQUENCY.weekly);
                                                                setValue('monthly', SFTP_RESET_FREQUENCY.monthly);
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row
                                                    className={`mt30 ${hasExistingSftpSchedule ? 'pe-none click-off' : ''
                                                        }`}
                                                >
                                                    <Col sm={3}></Col>
                                                    <Col sm={9}>
                                                        <Row className="">
                                                            {/* <Col sm={6}>
                                                                <RSDatePicker
                                                                    control={control}
                                                                    name="startdate"
                                                                    placeholder={START_DATE}
                                                                    min={sftpShareStartDateMin}
                                                                    rules={{
                                                                        validate: (v) => {
                                                                            if (!scheduleShareEnabled) return true;
                                                                            if (v == null || v === '') {
                                                                                return SELECT_START_DATE;
                                                                            }
                                                                            const picked = new Date(v);
                                                                            picked.setHours(0, 0, 0, 0);
                                                                            const minD = new Date(
                                                                                sftpShareStartDateMin,
                                                                            );
                                                                            if (picked < minD) {
                                                                                return SELECT_START_DATE;
                                                                            }
                                                                            return true;
                                                                        },
                                                                    }}
                                                                    handleChange={() => {
                                                                        setValue('enddate', null);
                                                                    }}
                                                                    isShowPlaceholder
                                                                />
                                                            </Col> */}

                                                            <Col
                                                                sm={6}
                                                            >
                                                                <div className="flex-grow-1">
                                                                    <RSDatePicker
                                                                        control={control}
                                                                        name="enddate"
                                                                        placeholder={END_DATE}
                                                                        min={sftpShareEndDateMin}
                                                                        max={sftpShareEndDateMax}
                                                                        rules={{
                                                                            validate: (v) => {
                                                                                if (!scheduleShareEnabled) return true;
                                                                                if (v == null || v === '') {
                                                                                    return SELECT_END_DATE;
                                                                                }
                                                                                const end = new Date(v);
                                                                                end.setHours(0, 0, 0, 0);
                                                                                if (sftpShareEndDateMax) {
                                                                                    const maxD = new Date(
                                                                                        sftpShareEndDateMax,
                                                                                    );
                                                                                    maxD.setHours(0, 0, 0, 0);
                                                                                    if (end > maxD) {
                                                                                        return SELECT_END_DATE;
                                                                                    }
                                                                                }
                                                                                return true;
                                                                            },
                                                                        }}
                                                                        isShowPlaceholder
                                                                    />
                                                                </div>

                                                            </Col>
                                                            <Col
                                                                sm={1}
                                                                className='d-flex align-items-center ml-10'
                                                            >
                                                                <RSTooltip text="Date range is limited to a maximum of 6 months.">
                                                                    <i
                                                                        className={`${circle_question_mark_mini} icon-xs color-primary-blue `}
                                                                    />
                                                                </RSTooltip>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </>
                                        )}
                                    </div>
                                )}
                            {sftpModal && (
                                <RSModal
                                    show={sftpModal}
                                    header={'Add SFTP Path'}
                                    size={'lg'}
                                    body={
                                        <div>
                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={6}>
                                                        <ListNameExists
                                                            name={'friendlyName'}
                                                            // id="rs_FTP_friendlyname"
                                                            // control={control}
                                                            field={'friendlyname'}
                                                            apiCallback={checkFriendlyNameExists}
                                                            condition={(status) => {
                                                                return !status?.status;
                                                            }}
                                                            // rules={{
                                                            //     ...FRIENDLYNAME_RULES,
                                                            //     validate: friendlyNameError ? _get(errors, 'friendlyName') : true,
                                                            // }}
                                                            rules={{ required: 'Enter friendly name' }}
                                                            placeholder={FRIENDLY_NAME}
                                                            extraPayload={{ remoteDataSourceID: '' }}
                                                        // callback={() => {
                                                        //     setValue('FTP.friendlyNameLoading', true)
                                                        // }}
                                                        />
                                                    </Col>

                                                    <Col sm={6}>
                                                        <RSInput
                                                            control={control}
                                                            name="ipAddress"
                                                            id="rs_FTP_ipAddress"
                                                            required
                                                            handleOnchange={(e) => {
                                                                onlyNumbersDecimalWithoutSpecialCharacters(e);
                                                            }}
                                                            handleOnBlur={() => {
                                                                trigger('ipAddress');
                                                            }}
                                                            onKeyDown={charNumDotWithoutSpecialCharacters}
                                                            placeholder={IP_ADDRESS}
                                                            rules={{
                                                                required: IP_ADDRESS_MSG,
                                                                pattern: {
                                                                    value: IPADDRESS_REGEX,
                                                                    message: ENTER_VALID_IP_ADDRESS,
                                                                },
                                                            }}
                                                            maxLength={MAX_LENGTH15}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={6}>
                                                        <RSInput
                                                            control={control}
                                                            name="portNumber"
                                                            id="rs_FTP_portNumber"
                                                            placeholder={PORT_NUMBER}
                                                            required
                                                            maxLength={PORT_LENGTH}
                                                            handleOnchange={(e) => {
                                                                onlyNumbers(e);
                                                            }}
                                                            handleOnBlur={() => {
                                                                trigger('portNumber');
                                                            }}
                                                            rules={{
                                                                required: PORT_NUMBER_MSG,
                                                                pattern: {
                                                                    value: PORTNUMBER_REGEX,
                                                                    message: ENTER_VALID_PORT_NUMBER,
                                                                },
                                                            }}
                                                        />
                                                    </Col>
                                                    <Col sm={6}>
                                                        {/* <RSInput
                                                        name="userName"
                                                        label="Username"
                                                        control={control}
                                                        placeholder="Username"
                                                        required
                                                        rules={{ required: 'Enter user name' }}
                                                        handleOnchange={() => clearErrors('userName')}
                                                    /> */}

                                                        <RSInput
                                                            control={control}
                                                            name="userName"
                                                            id="rs_FTP_username"
                                                            required
                                                            placeholder={USER_NAME}
                                                            rules={{ required: ENTER_USERNAME }}
                                                            maxLength={MAX_LENGTH250}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={6}>
                                                        <RSInput
                                                            control={control}
                                                            id="rs_FTP_password"
                                                            name="password"
                                                            type="password"
                                                            required
                                                            viewEye
                                                            placeholder={PASSWORD}
                                                            rules={{ required: ENTER_PASSWORD }}
                                                            maxLength={MAX_LENGTH250}
                                                        />
                                                    </Col>
                                                    <Col sm={6}>
                                                        <RSInput
                                                            control={control}
                                                            name="folderPath"
                                                            id="rs_FTP_folderPath"
                                                            required
                                                            placeholder={FOLDER_PATH}
                                                            rules={{ required: ENTER_FOLDER_PATH }}
                                                            maxLength={MAX_LENGTH250}
                                                            isCustomIcon={true}
                                                        />
                                                        <div className="folderPathInputHelpIcon">
                                                            <RSPPophover text={AUDIENCE_FILE_STORED}>
                                                                <i
                                                                    className={`${circle_question_mark_mini} icon-sm color-primary-blue position-relative top4`}
                                                                />
                                                            </RSPPophover>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div className="buttons-holder">
                                                <RSSecondaryButton
                                                    onClick={handleSftpCancel}
                                                    blockInteraction={isSftpConnecting}
                                                >
                                                    {CANCEL}
                                                </RSSecondaryButton>
                                                <RSPrimaryButton
                                                    onClick={handleSftpSave}
                                                    isLoading={isSftpConnecting}
                                                    blockBodyPointerEvents={isSftpConnecting}
                                                >
                                                    Connect
                                                </RSPrimaryButton>
                                            </div>
                                        </div>
                                    }
                                    handleClose={handleSftpCancel}
                                />
                            )}

                            <div className="buttons-holder">
                                <RSSecondaryButton
                                    onClick={() => handleClose(false)}
                                    blockInteraction={isSharingList || isStopScheduleLoading}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    isLoading={
                                        (isSharingList &&
                                            download_options === 'Share list' &&
                                            share_channel?.apiname !== SFTP_SHARE_ROW_DEFAULTS.apiname) ||
                                        isStopScheduleLoading
                                    }
                                    blockBodyPointerEvents={
                                        (isSharingList &&
                                            download_options === 'Share list' &&
                                            share_channel?.apiname !== SFTP_SHARE_ROW_DEFAULTS.apiname) ||
                                        isStopScheduleLoading
                                    }
                                    disabledClass={
                                        downloadToggle ||
                                            isSharingList ||
                                            isStopScheduleLoading ||
                                            isDownloadOptionsLoading ||
                                            (download_options === 'Share list' &&
                                                (isShareChannelLoading || isShareChannelAccountLoading)) ||
                                            download_options?.length === 0 ||
                                            !isValid
                                            ? hasExistingSftpSchedule
                                                ? ''
                                                : 'pe-none click-off'
                                            : ''
                                    }
                                    type="submit"
                                >
                                    {download_options === 'Share list' ? (
                                        <span>
                                            {share_channel?.apiname === SFTP_SHARE_ROW_DEFAULTS.apiname &&
                                                hasExistingSftpSchedule
                                                ? 'Stop'
                                                : SHARE}
                                        </span>
                                    ) : (
                                        <span>{DOWNLOAD}</span>
                                    )}
                                </RSPrimaryButton>
                            </div>
                        </form>
                    }
                    handleClose={() => handleClose(false)}
                />

                {otpModal && (
                    <DownloadCSV
                        SFTP_VALUE={SFTP_VALUE}
                        show={otpModal}
                        isTargetlist={isDynamic ? false : true}
                        isDynamic
                        handleClose={() => {
                            setOtpModal(false);
                        }}
                        onSuccess={(keyData, token) => {
                            handleDownloadCSV(keyData, token);
                        }}
                    />
                )}
                {otpSuccessModal && (
                    <RSConfirmationModal
                        show={otpSuccessModal}
                        header={downloadResultModalHeader}
                        isCloseButton={!audienceDownloadAPI.isLoading && downloadResultStatus !== 'processing'}
                        htmlContent={
                            audienceDownloadAPI.isLoading || downloadResultStatus === 'processing' ? (
                                <p className="text-center d-flex align-items-center justify-content-center mb0">
                                    <i
                                        className={`${in_progress_medium} icon-md lh0 color-inprogress mr8`}
                                    />
                                    <span>{REQUEST_PROCESSING}</span>
                                </p>
                            ) : downloadResultStatus === 'error' ? (
                                <p className="text-center color-primary-red mb0">{downloadResultError}</p>
                            ) : (
                                <p className="text-center mb0">
                                    {THANK_YOU_YOUR_REQUEST}
                                    <br />
                                    {DOWNLOAD_LINK_DATA_SHORTLY}
                                </p>
                            )
                        }
                        secondaryButton={false}
                        primaryButton={false}
                        handleClose={closeDownloadResultModal}
                    />
                )}
                {showResetConfirmationModal && (
                    <RSConfirmationModal
                        show={showResetConfirmationModal}
                        text={ARE_YOU_SURE_WANT_TO_RESET}
                        handleConfirm={handleResetShareChannel}
                        handleClose={() => setShowResetConfirmationModal(false)}
                    />
                )}
            </FormProvider>
        </Fragment >
    );
};

export default DownloadRecords;
