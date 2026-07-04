
import { getYYMMDD, getDateWithDaynoFormat } from 'Utils/modules/dateTime';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ENTER_DAYS, ENTER_MONTHS, SELECT, SELECT_DAYS, SELECT_END_DATE, SELECT_HOURS, SELECT_WEEK } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_STOP_SCHEDULE, CANCEL, COMMUNICATION_NAME, CONDITION_ATTRIBUTE_VALUE_DATE, DOWNLOAD_LINK_DATA_SHORTLY, END_DATE, ENTER_FORM_FIELDS, EXECUTE_ONCE_IMMEDIATELY, FORM_FIELDS, FREQUENCY, NEWCONTACT_DOWNLOAD, OK, SCHEDULE_DOWNLOAD, SELECT_FORM_FIELDS_TO_DOWNLOAD, STOP, THANK_YOU_YOUR_REQUEST, UPCOMING_SCHEDULE_CANCELLED } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useState, useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import RSTabbar from 'Components/RSTabber';
import { FORM_INITIAL_STATE, FREQUENCY_TAB_CONFIG } from './Constants';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSTagsComponent from 'Components/RSTagsComponent';
import { FORM_FIELDS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { getSessionId } from 'Reducers/globalState/selector';
import { getUserInfoDetailsForOTP } from 'Reducers/globalState/request';
import {
    get_formCSV_FormFields,
    get_formCSV_download,
    get_csVFormData,
    disable_formCsvSchedule,
} from 'Reducers/preferences/FormGenerator/request';
import { updateNotificationCountStatus } from 'Reducers/notifications/request';

import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import RSInput from 'Components/FormFields/RSInput';
import { FormGeneratorCsvModalSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';


let formPayload = {};
const CSVModal = ({ show, handleActions, data, communicationName, campaignId, fromAnalyticsReport, from = '' }) => {
    const [getCommunicationName, setGetCommunicationName] = useState(communicationName);
    const [selectedFields, setSelectedFields] = useState([]);
    const [otpModal, setOtpModal] = useState(false);
    const [otpSuccessModal, setOtpSuccessModal] = useState(false);
    const [stopConfirmModal, setStopConfirmModal] = useState(false);
    const [freTab, setfreTab] = useState(0);
    const [isCsvScheduled, setIsCsvScheduled] = useState(false);
    const methods = useForm(FORM_INITIAL_STATE);
    const disPatch = useDispatch();
    const navigate = useNavigate();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const {
        control,
        handleSubmit,
        watch,
        resetField,
        reset,
        setValue,
        getValues,
        setError,
        clearErrors,
        formState: { errors, isValid, isDirty },
    } = methods;
    const [formFieldState, setFormFieldState] = useState({
        formData: [],
        count: 0,
        removeData: [],
        CampaignNames: [],
        startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: getYYMMDD(new Date()),
        frequencyType: 'D',
        otpData: '',
    });
    const csvModalLoader = useApiLoader({ autoFetch: false });
    const csvDownloadLoader = useApiLoader({ autoFetch: false });
    const stopScheduleLoader = useApiLoader({ autoFetch: false });
    const [scheduleStatus, scheduleEndDate] = watch(['schedule', 'scheduleEndDate']);

    const manualEndDateRef = useRef(formFieldState.endDate);

    useEffect(() => {
        if (!scheduleStatus) {
            manualEndDateRef.current = formFieldState.endDate;
        }
    }, [formFieldState.endDate, scheduleStatus]);

    useEffect(() => {
        if (scheduleStatus) {
            if (scheduleEndDate) {
                setFormFieldState((pre) => ({
                    ...pre,
                    endDate: getYYMMDD(scheduleEndDate),
                }));
            }
        } else {
            setFormFieldState((pre) => ({
                ...pre,
                endDate: manualEndDateRef.current,
            }));
        }
    }, [scheduleEndDate, scheduleStatus]);

    const csvScheduleEndDateMin = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);

    const csvScheduleEndDateMax = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const max = new Date(d);
        max.setMonth(max.getMonth() + 6);
        return max;
    }, []);
    const applyCsvSavedData = (tempFieldData, csvData) => {
        if (!csvData) return;

        const columnsStr = csvData?.recipientFormColumns ?? '';
        const recipientColumns = columnsStr ? columnsStr.split(',').map((s) => s?.trim()).filter(Boolean) : [];
        const includedElements = Array.isArray(tempFieldData)
            ? tempFieldData.filter((val) => recipientColumns.indexOf(val) === -1)
            : [];

        const filterDateFromApi = csvData?.filterDate;
        let startDate = getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER));
        let endDate = getYYMMDD(new Date());
        if (filterDateFromApi && typeof filterDateFromApi === 'string') {
            const dateParts = filterDateFromApi.split(' - ').map((s) => s?.trim()).filter(Boolean);
            if (dateParts[0]) startDate = getYYMMDD(dateParts[0]);
            if (dateParts[1]) endDate = getYYMMDD(dateParts[1]);
        }

        const freqType = csvData?.frequencytype || 'D';
        setIsCsvScheduled(!!csvData?.isScheduled);
        setFormFieldState((pre) => ({
            ...pre,
            removeData: includedElements,
            startDate,
            endDate,
            frequencyType: freqType,
        }));
        setSelectedFields(recipientColumns);

        const weekDaysStr = csvData?.weekDays ?? '';
        const weekDaysList = weekDaysStr
            ? weekDaysStr.split(',').map((a) => String(a).trim().toLowerCase()).filter(Boolean)
            : [];
        const tempWeekdays = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false };
        const tempw = Object.keys(tempWeekdays);
        const tempWd = tempw.filter((val) => !weekDaysList.includes(val));
        const obj = {};
        weekDaysList.forEach((e) => (obj[e] = true));
        tempWd.forEach((e) => (obj[e] = false));

        const nextFreqTab = freqType === 'D' ? 0 : freqType === 'W' ? 1 : freqType === 'M' ? 2 : 0;
        setfreTab(nextFreqTab);

        const scheduledPeriod = csvData?.scheduledPeriod ?? '';
        const periodParts = scheduledPeriod ? scheduledPeriod.split('-').map((s) => s?.trim()) : [];

        let dailyValues = {};
        let weeklyValues = {};
        let monthlyValues = {};

        if (freqType === 'D') {
            dailyValues = {
                days: periodParts[0] ?? '',
                hours: periodParts[1] ?? '',
            };
        } else if (freqType === 'W') {
            weeklyValues = {
                weekDays: obj,
                hours: periodParts[1] ?? '',
                week: periodParts[0] ?? '',
            };
        } else if (freqType === 'M') {
            const monthlyPrefix = (periodParts[0] || '').toUpperCase();
            const monthlyPayload =
                monthlyPrefix === 'D' || monthlyPrefix === 'ND' ? periodParts.slice(1) : periodParts;
            const isMonthlyDayType = monthlyPrefix !== 'ND';
            monthlyValues = {
                type: isMonthlyDayType ? 'Day(s)' : 'Month(s)',
                first_day: isMonthlyDayType ? monthlyPayload[0] ?? '' : '',
                first_months: isMonthlyDayType ? monthlyPayload[1] ?? '' : '',
                first_hours: isMonthlyDayType ? monthlyPayload[2] ?? '' : '',
                second_frequency: isMonthlyDayType ? '' : monthlyPayload[0] ?? '',
                second_days: isMonthlyDayType ? '' : monthlyPayload[1] ?? '',
                second_months: isMonthlyDayType ? '' : monthlyPayload[2] ?? '',
                second_hours: isMonthlyDayType ? '' : monthlyPayload[3] ?? '',
            };
        }

        let scheduleEndDate = null;
        const scheduleEndRaw = csvData?.scheduleEndDate;
        if (scheduleEndRaw) {
            const parsed = new Date(scheduleEndRaw);
            if (!Number.isNaN(parsed.getTime())) scheduleEndDate = parsed;
        }

        reset({
            schedule: !!csvData?.isScheduled,
            scheduleEndDate,
            daily: dailyValues,
            weekly: weeklyValues,
            monthly: monthlyValues,
        });
    };

    useEffect(() => {
        if (!show) {
            csvModalLoader.reset();
            csvDownloadLoader.reset();
            stopScheduleLoader.reset();
            return;
        }

        csvModalLoader.refetch({
            fetcher: async () => {
                const fieldsPayload = {
                    departmentId,
                    clientId,
                    userId,
                    formId: data?.recipientFormId,
                    isRmNotifier: false,
                };
                const fieldsRes = await disPatch(get_formCSV_FormFields(fieldsPayload));

                let tempFieldData = [];
                if (fieldsRes?.status) {
                    tempFieldData = fieldsRes?.data?.FormFields.map((e) => e.ColumnName) || [];
                    setFormFieldState((pre) => ({
                        ...pre,
                        formData: tempFieldData,
                        count: tempFieldData?.length,
                        CampaignNames: fieldsRes?.data?.CampaignNames,
                    }));
                    setSelectedFields(tempFieldData);
                } else {
                    setFormFieldState((pre) => ({
                        ...pre,
                        formData: [],
                        count: 0,
                        CampaignNames: [],
                    }));
                    setSelectedFields([]);
                }

                const csvRes = await disPatch(
                    get_csVFormData({
                        departmentId,
                        clientId,
                        userId,
                        recipientFormId: data?.recipientFormId,
                    }),
                );

                if (csvRes?.status) {
                    const csvData = Array.isArray(csvRes?.data) ? csvRes?.data?.[0] : csvRes?.data;
                    applyCsvSavedData(tempFieldData, csvData);
                }

                return { fieldsRes, csvRes };
            },
        });

        disPatch(
            getUserInfoDetailsForOTP({
                departmentId,
                clientId,
                userId,
            }, false),
        );
    }, [show, data?.recipientFormId, departmentId, clientId, userId]);

    const formSubmitHandler = (formState) => {
        if (formState?.schedule && (formState?.scheduleEndDate == null || formState?.scheduleEndDate === '')) {
            setError('scheduleEndDate', {
                type: 'custom',
                message: SELECT_END_DATE,
            });
            return;
        }

        if (formState?.monthly?.type === 'Day(s)') {
            if (getValues('monthly.first_day') === '' || getValues('monthly.first_day') === '0') {
                setError('monthly.first_day', {
                    type: 'custom',
                    message: ENTER_DAYS,
                });
                return;
            }
            if (getValues('monthly.first_day') === '' || getValues('monthly.first_day') === '0') {
                setError('monthly.first_day', {
                    type: 'custom',
                    message: ENTER_DAYS,
                });
                return;
            }

            if (getValues('monthly.first_months') === '') {
                setError('monthly.first_months', {
                    type: 'custom',
                    message: SELECT,
                });
                return;
            }
            if (getValues('monthly.first_hours') === '') {
                setError('monthly.first_hours', {
                    type: 'custom',
                    message: SELECT_HOURS,
                });
                return;
            }
        } else if (formState?.monthly?.type === 'Month(s)') {
            if (getValues('monthly.second_frequency') === '') {
                setError('monthly.second_frequency', {
                    type: 'custom',
                    message: SELECT_WEEK,
                });
                return;
            }
            if (getValues('monthly.second_days') === '') {
                setError('monthly.second_days', {
                    type: 'custom',
                    message: SELECT_DAYS,
                });
                return;
            }
            if (getValues('monthly.second_months') === '' || getValues('monthly.second_months') === '0') {
                setError('monthly.second_months', {
                    type: 'custom',
                    message: ENTER_MONTHS,
                });
                return;
            }
            if (getValues('monthly.second_hours') === '') {
                setError('monthly.second_hours', {
                    type: 'custom',
                    message: SELECT_HOURS,
                });
                return;
            }
        }
        const toStr = (v) => (v != null && typeof v === 'object' ? (v.label ?? v.labelName ?? v.value ?? v) : v);
        const str = (v) => (v != null && v !== '' ? String(toStr(v)) : '');

        const effectiveFreq = formFieldState?.frequencyType || (freTab === 0 ? 'D' : freTab === 1 ? 'W' : 'M');
        let scheduledPeriod = '';
        let weekDays = '';
        if (effectiveFreq === 'D') {
            scheduledPeriod = [str(formState?.daily?.days), str(formState?.daily?.hours)].filter(Boolean).join('-') || '';
        } else if (effectiveFreq === 'W') {
            const week = str(formState?.weekly?.week);
            const hours = str(formState?.weekly?.hours);
            scheduledPeriod = [week, hours].filter(Boolean).join('-') || '';
            const weekDaysObj = formState?.weekly?.weekDays;
            if (weekDaysObj && typeof weekDaysObj === 'object') {
                const days = Object.keys(weekDaysObj).filter((key) => weekDaysObj[key]);
                weekDays = days.map((a) => String(a).toUpperCase()).join(',');
            }
        } else if (effectiveFreq === 'M') {
            if (formState?.monthly?.type === 'Day(s)') {
                const d = str(formState?.monthly?.first_day);
                const m = str(formState?.monthly?.first_months);
                const h = str(formState?.monthly?.first_hours);
                scheduledPeriod = [d, m, h].filter(Boolean).join('-') || '';
                scheduledPeriod = scheduledPeriod ? `D-${scheduledPeriod}` : ''
            } else {
                const f = str(formState?.monthly?.second_frequency);
                const wd = str(formState?.monthly?.second_days);
                const m = str(formState?.monthly?.second_months);
                const h = str(formState?.monthly?.second_hours);
                scheduledPeriod = [f, wd, m, h].filter(Boolean).join('-') || '';
                scheduledPeriod = scheduledPeriod ? `ND-${scheduledPeriod}` : ''
            }
        }
        const filterDateStart = formFieldState?.startDate;
        const filterDateEnd = formFieldState?.endDate;
        const normalizedStart = filterDateStart != null && filterDateStart !== '' ? getYYMMDD(filterDateStart) : '';
        const normalizedEnd = filterDateEnd != null && filterDateEnd !== '' ? getYYMMDD(filterDateEnd) : '';
        const filterDateStr = [normalizedStart, normalizedEnd].filter(Boolean).join(' - ') || '';

        formPayload = {
            recipientFormColumns: Array.isArray(selectedFields) ? selectedFields.toString() : '',
            filterDate: filterDateStr,
            isScheduled: formState?.schedule,
            scheduleEndDate:
                formState?.schedule && formState?.scheduleEndDate
                    ? getYYMMDD(formState.scheduleEndDate)
                    : '',
            frequencytype: effectiveFreq,
            scheduledPeriod: scheduledPeriod ? scheduledPeriod : '',
            weekDays: weekDays != null && weekDays !== '' ? String(weekDays) : '',
            campaignId: (() => {
                const baseCampaignId = campaignId != null ? campaignId : formState?.campaigns?.CampaignID != null ? formState?.campaigns?.CampaignID : 0;
                return baseCampaignId !== 0 ? `${baseCampaignId}_${fromAnalyticsReport ? 'A' : 'F'}` : 0;
            })(),
            // otp: formFieldState?.otpData,
            recipientFormId: data?.recipientFormId,
        };
        setOtpModal(true);
        // handleActions(!show);
        // reset(FORM_INITIAL_STATE.defaultValues);
        // setSelectedFields([]);
    };

    const handleDownloadCSV = (keyDataValue) => {
        const { otpValue, keyData } = keyDataValue;
        const otpData = { otp: otpValue || '', to: keyData || '' };
        const payload = Object.assign({}, formPayload, otpData);

        csvDownloadLoader.refetch({
            fetcher: () => disPatch(get_formCSV_download(payload, false)),
            onSuccess: (res) => {
                if (res?.status) {
                    setOtpSuccessModal(true);
                    reset(FORM_INITIAL_STATE.defaultValues);
                    setSelectedFields([]);
                    setTimeout(() => {
                        setOtpSuccessModal(false);
                        handleActions(!show);
                    }, [3000]);
                } else {
                    setOtpSuccessModal(false);
                }
            },
        });
    };
    const handleClose = () => {
        handleActions(!show);
        reset(FORM_INITIAL_STATE.defaultValues);
        setSelectedFields([]);
        setIsCsvScheduled(false);
    };

    const handleStopSchedule = () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            recipientFormId: data?.recipientFormId,
            isScheduled: false,
        };
        stopScheduleLoader.refetch({
            fetcher: () => disPatch(disable_formCsvSchedule(payload, false)),
            onSuccess: (res) => {
                if (res?.status) {
                    setIsCsvScheduled(false);
                    disPatch(updateNotificationCountStatus({ payload: { departmentId, clientId, userId } }));
                    setStopConfirmModal(false);
                    handleClose();
                    navigate('/preferences/form-generator');
                }
            },
        });
    };

    return (
        <>
            <RSModal
                size={'xlg'}
                show={show}
                handleClose={handleClose}
                header={getCommunicationName != null ? NEWCONTACT_DOWNLOAD : SELECT_FORM_FIELDS_TO_DOWNLOAD}
                className={`${otpModal || otpSuccessModal ? 'opacity-0' : ''} ${otpSuccessModal ? 'click-off' : ''} ${stopConfirmModal ? 'visually-hidden' : ''}`}
                body={
                    csvModalLoader.isLoading ? (
                        <div aria-busy="true" aria-label="Loading CSV download form">
                            <FormGeneratorCsvModalSkeleton />
                        </div>
                    ) : (
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit((data) => formSubmitHandler(data))}>
                            <Row className="form-group">
                                <Col sm={{ offset: 1, span: 3 }}>
                                    <label className='control-label-left'>{FORM_FIELDS}</label>
                                </Col>
                                <Col sm={7}>
                                    <RSKendoDropdown
                                        name={`formFields`}
                                        //disabled={formFieldState.count === selectedFields?.length ? true : false}
                                        data={formFieldState.removeData || []
                                        }
                                        control={control}
                                        label={FORM_FIELDS}
                                        handleChange={(e) => {
                                            setSelectedFields((prev) => [...prev, e.value]);
                                            let removeChangeData = formFieldState.removeData.filter(
                                                (ele) => ele != e.target.value,
                                            );

                                            setFormFieldState((pre) => ({
                                                ...pre,
                                                removeData: removeChangeData,
                                            }));
                                            setValue('formFields', '');
                                        }}
                                    />
                                    {/* <DropDownList
                                    data={csvFields}
                                    value="Select"
                                    onChange={(e) => setSelectedFields((prev) => [...prev, e.target.value])}
                                /> */}
                                </Col>
                            </Row>
                            <Row className="form-group">
                                <Col sm={{ span: 7, offset: 4 }}>
                                    <RSTagsComponent
                                        tags={selectedFields}
                                        // disabled
                                        placeholder={ENTER_FORM_FIELDS}
                                        isRefresh={false}
                                        removedTags={(tags) => {
                                            setFormFieldState((pre) => ({
                                                ...pre,
                                                // removeData: [...formFieldState.removeData, removeEle],
                                                removeData: [...pre.removeData, tags],
                                            }));
                                        }}

                                        updatedTags={(tags) => {
                                            // let removeEle = formFieldState.removeData.filter((e, ind) => ind === tags);
                                            let removeEle = formFieldState.formData.filter(function (val) {
                                                return tags.indexOf(val) == -1;
                                            });
                                            setSelectedFields(tags);
                                            setFormFieldState((pre) => ({
                                                ...pre,
                                                // removeData: [...formFieldState.removeData, removeEle],
                                                //removeData: [...pre.removeData, ...removeEle],
                                                formData: tags,
                                            }));
                                        }}
                                        name="tags"
                                        control={control}
                                        rules={{ required: FORM_FIELDS_REQUIRED }}
                                        isAddTag={false}
                                    />
                                </Col>
                            </Row>
                            <Row className={`form-group ${fromAnalyticsReport ? 'd-none' : getCommunicationName != null ? 'd-none' : ''}`}>
                                <Col sm={{ offset: 1, span: 3 }}>
                                    <label className='control-label-left'>{COMMUNICATION_NAME}</label>
                                </Col>
                                {
                                    communicationName != null ?
                                        <Col sm={7}>
                                            <RSInput
                                                name={'communicationName'}
                                                defaultValue={getCommunicationName}
                                                control={control}
                                                disabled={true}
                                                placeholder={'Communication name'}
                                                className="ellispis"
                                            />
                                        </Col>
                                        :
                                        <Col sm={7}>
                                            <RSKendoDropdown
                                                name="campaigns"
                                                control={control}
                                                label={COMMUNICATION_NAME}
                                                data={formFieldState?.CampaignNames}
                                                textField="CampaignName"
                                                dataItemKey={'CampaignID'}
                                            />
                                        </Col>
                                }
                            </Row>
                            <Row className={`form-group ${fromAnalyticsReport ? 'd-none' : getCommunicationName != null ? 'd-none' : ''}`}>
                                <Col sm={{ offset: 1, span: 3 }}>
                                    <label className='control-label-left'>{CONDITION_ATTRIBUTE_VALUE_DATE}</label>
                                </Col>
                                <Col sm={7} className="float-left">
                                    <RSDateRangePicker
                                        key={`${formFieldState.startDate}_${formFieldState.endDate}`}
                                        selectedDateText={
                                            (new Date(formFieldState.endDate).toDateString() !== new Date().toDateString())
                                                ? "Custom range"
                                                : "Last 30 days"
                                        }
                                        name="dateRange"
                                        mainClass="float-start"
                                        startDate={new Date(formFieldState.startDate)}
                                        endDate={new Date(formFieldState.endDate)}
                                        onDatePickerClosed={(dates) => {
                                            setFormFieldState((pre) => ({
                                                ...pre,
                                                startDate: getYYMMDD(dates.startDate),
                                                endDate: getYYMMDD(dates.endDate),
                                            }));
                                        }}
                                    />
                                </Col>
                            </Row>
                            <div
                                className={`form-group mt15 ${fromAnalyticsReport ? 'd-none' : getCommunicationName != null ? 'd-none' : ''
                                    }`}
                            >
                                <Row className={`mb30 ${isCsvScheduled ? 'pe-none click-off' : ''}`}>
                                    <Col sm={{ offset: 1, span: 3 }}>
                                        <label className="control-label-left">{SCHEDULE_DOWNLOAD}</label>
                                    </Col>
                                    <Col sm={8} className="d-flex align-items-center gap-3 flex-wrap">
                                        <div className="position-relative">
                                            <RSSwitch
                                                name="schedule"
                                                control={control}
                                                disabled={isCsvScheduled}
                                                handleChange={(value) => {
                                                    if (!value) {
                                                        setValue('scheduleEndDate', null);
                                                        clearErrors('scheduleEndDate');
                                                    }
                                                }}
                                            />
                                        </div>
                                        {!scheduleStatus && (
                                            <RSTooltip
                                                text={EXECUTE_ONCE_IMMEDIATELY}
                                                className="mb-5"
                                            >
                                                <i
                                                    className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                />
                                            </RSTooltip>
                                        )}
                                    </Col>
                                </Row>
                                {scheduleStatus && (
                                    <>
                                        <Row
                                            className={`mt30 ${isCsvScheduled ? 'pe-none click-off' : ''}`}
                                        >
                                            <Col sm={{ offset: 1, span: 3 }}>
                                                <label className="control-label-left">{FREQUENCY}</label>
                                            </Col>
                                            <Col sm={8}>
                                                <RSTabbar
                                                    dynamicTab="rs-content-tabs-2 rct-ra"
                                                    activeClass="active"
                                                    tabData={FREQUENCY_TAB_CONFIG(control)}
                                                    defaultTab={freTab}
                                                    callBack={(tab) => {
                                                        setFormFieldState((pre) => ({
                                                            ...pre,
                                                            frequencyType: tab.text.charAt(0),
                                                        }));

                                                        resetField('daily');
                                                        resetField('weekly');
                                                        resetField('monthly');
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row
                                            className={`mt30 ${isCsvScheduled ? 'pe-none click-off' : ''}`}
                                        >
                                            <Col sm={{ offset: 1, span: 3 }} />
                                            <Col sm={8}>
                                                <Row>
                                                    <Col sm={7}>
                                                        <div className="flex-grow-1">
                                                            <RSDatePicker
                                                                control={control}
                                                                name="scheduleEndDate"
                                                                placeholder={END_DATE}
                                                                min={csvScheduleEndDateMin}
                                                                max={csvScheduleEndDateMax}
                                                                rules={{
                                                                    validate: (v) => {
                                                                        if (!scheduleStatus) return true;
                                                                        if (v == null || v === '') {
                                                                            return SELECT_END_DATE;
                                                                        }
                                                                        const end = new Date(v);
                                                                        end.setHours(0, 0, 0, 0);
                                                                        if (csvScheduleEndDateMax) {
                                                                            const maxD = new Date(
                                                                                csvScheduleEndDateMax,
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
                                                    <Col sm={1} className="d-flex align-items-center ml-10">
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
                            {from === 'formAnalytics' && <Row className="mt10">
                                <Col sm={{ offset: 1, span: 12 }}>
                                    <small className="pointer-event-none">
                                        Note: This download is not impacted by analytics filters and reflects the available submission records.
                                    </small>
                                </Col>
                            </Row>}

                        </form>
                    </FormProvider>
                    )
                }
                footer={
                    <Fragment>
                        <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                        {!csvModalLoader.isLoading && (
                            <RSPrimaryButton
                                type="submit"
                                isLoading={csvDownloadLoader.isLoading}
                                blockBodyPointerEvents={csvDownloadLoader.isLoading}
                                onClick={
                                    isCsvScheduled
                                        ? () => setStopConfirmModal(true)
                                        : handleSubmit((data) => formSubmitHandler(data))
                                }
                            >
                                {isCsvScheduled ? STOP : OK}
                            </RSPrimaryButton>
                        )}
                    </Fragment>
                }
            />
            <DownloadCSV
                show={otpModal}
                handleClose={() => setOtpModal(false)}
                onSuccess={(keyData) => {
                    handleDownloadCSV(keyData);
                }}
                isForm
            />
            <RSConfirmationModal
                show={otpSuccessModal}
                htmlContent={
                    <p className="text-center">
                        {THANK_YOU_YOUR_REQUEST}
                        <br />
                        {DOWNLOAD_LINK_DATA_SHORTLY}
                    </p>
                }
                // text={'We will be sending you the download link shortly.'}
                secondaryButton={false}
                primaryButton={false}
                handleClose={() => {
                    setOtpSuccessModal(false);
                    handleActions(!show);
                }}
            />
            <RSConfirmationModal
                show={stopConfirmModal}
                header="Confirmation"
                className="custom-stop-confirm-modal"
                htmlContent={
                    <p className="text-center">
                        {ARE_YOU_SURE_STOP_SCHEDULE}
                        <br />
                        {UPCOMING_SCHEDULE_CANCELLED}
                    </p>
                }
                primaryButtonText="Confirm"
                secondaryButtonText="Cancel"
                isLoading={stopScheduleLoader.isLoading}
                blockBodyPointerEvents={stopScheduleLoader.isLoading}
                handleClose={() => {
                    if (stopScheduleLoader.isLoading) return;
                    stopScheduleLoader.reset();
                    setStopConfirmModal(false);
                }}
                handleConfirm={handleStopSchedule}
            />
            {getWarningPopupMessage(failureApiErrors, disPatch)}
        </>
    );
};

export default CSVModal;
