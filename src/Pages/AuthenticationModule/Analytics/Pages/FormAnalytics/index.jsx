import { getChannelId } from 'Utils/modules/communicationChannels';
import { getFileDownloadDateTime, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { PDFExport } from '@progress/kendo-react-pdf';
import { FormProvider, useForm } from 'react-hook-form';

import RSPageHeader from 'Components/RSPageHeader';
import { getFormAnalytics } from 'Reducers/analytics/details/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { resetAnalyticsDetailState } from 'Reducers/analytics/details/reducer';
import useQueryParams from 'Hooks/useQueryParams';


import FormAnalyticsContent from './Components/FormAnalyticsContent';
import { getFormProgressiveProfile } from 'Reducers/analytics/details/request';
import RSTooltip from 'Components/RSTooltip';

import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

import { eye_large } from 'Constants/GlobalConstant/Glyphicons';
import { getRecipientFormByFormId } from 'Reducers/communication/createCommunication/Create/request';
import QRPreview from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/QR/Components/QRPreview';

/** Paid media / social channel IDs returned by form analytics API — labels for dropdown when `getChannelId` has no entry */
const FORM_ANALYTICS_CHANNEL_LABEL_BY_ID = {
    101: 'Paid media google ads',
    102: 'Paid media facebook',
    103: 'Paid media x',
    104: 'Paid media linkedin',
    105: 'Paid media vu',
    106: 'Paid media digipop',
    71: 'Social media facebook',
    72: 'Social media x',
    73: 'Social media linkedin',
    74: 'Social media instagram',
    75: 'Social media pinterest',
};

const FormAnalytics = () => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/preferences/template-gallery/form-analytics');

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { formAnalytics, isLoading } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const pdfExportComponent = useRef(null);
    const isAlreadyCalledAPi = useRef({
        status: false,
    });

    const [selectedDates, setSelectedDates] = useState({
        startDate: null,
        endDate: null,
        selectedType: 'All time',
    });

    const [selectedChannel, setSelectedChannel] = useState({
        id: 0,
        text: 'All channel',
    });
    const [previewModal, setPreviewModal] = useState(false);
    const [previewContent, setPreviewContent] = useState({
        backgroundColor: '#ffffff',
        dropAbleData: [],
        previewTempData: [],
        formState: {
            layout: 'form-theme-default',
            profilingToggle: false,
            Submit: { buttonText: 'Submit', buttonColor: '#28a745' },
            CancelView: { isCancel: false, buttonText: 'Cancel' },
            previewData: { enableCaptchaCheckbox: false },
        },
        isCaptchaEnabled: false,
    });

    const [availableChannelIds, setAvailableChannelIds] = useState([]);
    const [initialDates, setInitialDates] = useState({
        startDate: null,
        endDate: null,
    });
    useEffect(() => {
        if (initialDates?.startDate || initialDates?.endDate) return;
        if (formAnalytics?.startDate && formAnalytics?.endDate) {
            setInitialDates({
                startDate: formAnalytics?.startDate,
                endDate: formAnalytics?.endDate,
            });
            setSelectedDates((pre) => ({
                ...pre,
                startDate: formAnalytics?.startDate,
                endDate: formAnalytics?.endDate,
            }));
        }
    }, [formAnalytics?.startDate, formAnalytics?.endDate]);

    useEffect(() => {
        if (availableChannelIds?.length) return;
        const ids = Array.isArray(formAnalytics?.channelId) ? formAnalytics.channelId : [];
        if (ids.length) setAvailableChannelIds(ids);
    }, [formAnalytics?.channelId, availableChannelIds?.length]);

    const exportPDFWithComponent = () => {
        if (pdfExportComponent.current) {
            pdfExportComponent.current.save();
            setTimeout(() => {
                pdfExportComponent?.current?.rootElForPDF.querySelectorAll('*').forEach((element) => {
                    if (
                        element.getAttribute('style')?.trim() ===
                        'transform: none !important; transition: none !important;'
                    ) {
                        element.removeAttribute('style');
                    }
                });
            }, 5000);
        }
    };

    const getFormAnalyticsData = async ({
        channelId = selectedChannel?.id ?? 0,
        startDate = selectedDates?.startDate,
        endDate = selectedDates?.endDate,
        selectedType = selectedDates?.selectedType,
    } = {}) => {
        if (!locationData?.formId) {
            return;
        }

        const payload = {
            clientId,
            userId,
            departmentId,
            formId: locationData?.formId,
            channelId: channelId ?? 0, // All channel
            startDate: !startDate ? '' : getYYMMDD(startDate),
            endDate: !endDate ? '' : getYYMMDD(endDate),
        };

        const { status, data } = await dispatch(getFormAnalytics({ payload }));
    };
    const getProgressiveProfile = async () => {
        if (!locationData?.formId) {
            return;
        }
        const payload = {
            clientId,
            userId,
            departmentId,
            formId: locationData?.formId,
        };
        const { status, data } = await dispatch(getFormProgressiveProfile({ payload }));
    };

    useEffect(() => {
        if (locationData !== null && !isAlreadyCalledAPi?.current?.status && locationData?.formId) {
            dispatch(resetAnalyticsDetailState());
            getFormAnalyticsData({
                channelId: 0,
                startDate: null,
                endDate: null,
                selectedType: 'All time',
            });
            getProgressiveProfile();
            isAlreadyCalledAPi.current.status = true;
        }
    }, [locationData]);

    useEffect(() => {
        return () => {
            dispatch(resetAnalyticsDetailState());
        };
    }, []);

    const dateField =
        formAnalytics?.startDate && formAnalytics?.endDate
            ? `${getUserCurrentFormat(formAnalytics?.startDate)?.dateFormat} - ${getUserCurrentFormat(formAnalytics?.endDate)?.dateFormat
            }`
            : '';

    const channelDropdownData = useMemo(() => {
        const ids = Array.isArray(availableChannelIds) ? availableChannelIds : [];
        const uniqueIds = Array.from(new Set(ids.filter((x) => x != null && x !== 0)));
        const options = uniqueIds.map((id) => {
            const idNum = Number(id);
            const text =
                idNum === 100
                    ? 'Direct'
                    : FORM_ANALYTICS_CHANNEL_LABEL_BY_ID[idNum] ??
                    getChannelId(idNum)?.label ??
                    getChannelId(id)?.label ??
                    `Channel ${id}`;
            return { id: idNum, text };
        });
        return [{ id: 0, text: 'All channel' }, ...options];
    }, [availableChannelIds]);

    const formName = locationData?.formName || formAnalytics?.formName || 'Form Analytics';
    const methods = useForm({ mode: 'onChange' });
    const handlePreview = async () => {
        if (!locationData?.formId) return;
        const payload = {
            userId,
            clientId,
            departmentId,
            recipientFormId: locationData?.formId,
        };
        const res = await dispatch(getRecipientFormByFormId({ payload, fromAnalytics: true }));
        if (res?.status) {
            const response = res?.data ?? {};
            const html = response?.[0]?.htmlcodeclient ?? '';
            const isCaptchaEnabled = response?.[0]?.isCaptchaenabled ?? false;

            const parsed = html ? safeParseJSON(html, null) : null;
            const defaultFormState = {
                layout: 'form-theme-default',
                profilingToggle: false,
                Submit: { buttonText: 'Submit', buttonColor: '#28a745' },
                CancelView: { isCancel: false, buttonText: 'Cancel' },
                previewData: { enableCaptchaCheckbox: false },
            };
            setPreviewContent({
                backgroundColor: parsed?.selectedColor || '#ffffff',
                dropAbleData: parsed?.dropValue ?? [],
                previewTempData: parsed?.previewData ?? [],
                formState: {
                    ...defaultFormState,
                    ...parsed?.formState,
                    layout: parsed?.formState?.layout || defaultFormState.layout,
                },
                isCaptchaEnabled: isCaptchaEnabled || false,
            });
            setPreviewModal(true);
        }
    };
    return (
        <FormProvider {...methods}>
            <PDFExport
                keepTogether="p"
                margin="1cm"
                ref={pdfExportComponent}
                paperSize="auto"
                fileName={`${formName} Analytics for ${getFileDownloadDateTime()}`}
                author="RESUL"
            >
                <div className="page-content-holder">
                    <RSPageHeader
                        title={
                            <>
                                {formName?.length > 40 ? (
                                    <RSTooltip text={formName} position="bottom">
                                        <span className="repo-label">{truncateTitle(formName, 40)}</span>
                                    </RSTooltip>
                                ) : (
                                    <span className="repo-label">{formName}</span>
                                )}
                            </>
                        }
                        pageClass="mb0"
                        titleCls="repo-title"
                        date={dateField}
                        isBuDisabled={true}
                        isAgencyDisabled={true}
                        isBack
                        backPath={
                            locationData?.fromPath ? '/preferences/template-gallery/form-generator' : '/analytics'
                        }
                        rightCommonMenus
                    />

                    <Container fluid>
                        <div className="page-content">
                            <Container className="px0">
                                <div className="d-flex justify-content-between align-items-center mb10">
                                    <div className="d-flex">
                                        <h3>Overview {locationData?.formType ? `- ${locationData.formType}` : ''}</h3>
                                        <RSTooltip
                                            text={'Preview'}
                                            className={`lh0 text-center  ${isLoading ? 'click-off' : ''} `}
                                        >
                                            <i
                                                id="rs_data_eye"
                                                className={`${eye_large} color-primary-blue icon-md ml10`}
                                                onClick={handlePreview}
                                            />
                                        </RSTooltip>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <ul className={`rs-list-group-horizontal ${isLoading ? 'click-off' : ''}`}>
                                            {initialDates?.startDate && initialDates?.endDate && (
                                                <li className="mr10">
                                                    <RSDateRangePicker
                                                        onDatePickerClosed={({ startDate, endDate, selectedType }) => {
                                                            setSelectedDates({ startDate, endDate, selectedType });
                                                            getFormAnalyticsData({ startDate, endDate, selectedType });
                                                        }}
                                                        isTemplate
                                                        selectedDateText={'All time'}
                                                        isAnalytics
                                                        startDate={
                                                            initialDates?.startDate !== null &&
                                                            new Date(initialDates?.startDate)
                                                        }
                                                        endDate={
                                                            initialDates?.endDate !== null &&
                                                                new Date(initialDates?.endDate) >= new Date()
                                                                ? new Date()
                                                                : new Date(initialDates?.endDate)
                                                        }
                                                        selectedFullDate={{
                                                            start: new Date(initialDates?.startDate),
                                                            end:
                                                                initialDates?.endDate !== null &&
                                                                    new Date(initialDates?.endDate) >= new Date()
                                                                    ? new Date()
                                                                    : new Date(initialDates?.endDate),
                                                        }}
                                                    />
                                                </li>
                                            )}
                                            <li>
                                                <RSBootstrapdown
                                                    data={channelDropdownData}
                                                    isObject
                                                    fieldKey="text"
                                                    idKey="id"
                                                    isActive
                                                    alignRight
                                                    defaultItem={selectedChannel ?? channelDropdownData?.[0]}
                                                    onSelect={(item) => {
                                                        setSelectedChannel(item);
                                                        getFormAnalyticsData({ channelId: item?.id ?? 0 });
                                                    }}
                                                />
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <FormAnalyticsContent />
                            </Container>
                        </div>
                    </Container>
                </div>
            </PDFExport>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
            <QRPreview
                show={previewModal}
                onHide={() => setPreviewModal(false)}
                selectedColor={previewContent?.backgroundColor}
                dropAble={previewContent?.dropAbleData}
                previewTemp={previewContent?.previewTempData}
                previewFormstate={previewContent?.formState}
                isQrCaptcha={previewContent?.isCaptchaEnabled}
                fromFormAnalytics
            />
        </FormProvider>
    );
};

export default FormAnalytics;
