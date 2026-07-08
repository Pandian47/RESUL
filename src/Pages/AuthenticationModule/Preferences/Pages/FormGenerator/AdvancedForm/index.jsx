import { getUserDetails } from 'Utils/modules/crypto';
import { convertToUserTimezone, getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ACTIONS, ADVANCED_FORM_BUILDER, ANALYTICS, CREATE_NEW_FORM, EDIT, SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, circle_arrow_down_medium, circle_plus_fill_edge_large, eye_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import CustomKendoGrid from 'Components/RSCustomKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import GenerateAndEmbedAPI from '../Tabs/FormTypes/Components/GenerateAndEmbedAPI';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSSearchField from 'Components/RSSearchField';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import LinkedCommunicationsModal from '../Components/LinkedCommunicationsModal';
import RMModal from '../Components/RMModal';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

import usePermission from 'Hooks/usePersmission';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    advancedFormListApi,
    getFormAnalyticsUrl,
    getFormEditUrl,
    getNewFormRedirectUrl,
    getFormPublishDetailsFF,
} from 'Reducers/preferences/AdvancedForm/request';
import { handleFormType } from '../constant';
import { ADVANCED_FORM_CREATE_OPTIONS, advancedFormSearchListItems } from './constants';
import {
    extractFormRedirectUrlFromResponse,
    extractNewFormRedirectUrl,
    getAdvancedFormId,
} from './formRedirectUtils';
import {
    appendEmbedParamToFormForgeUrl,
    openFormForgeWithReturn,
    setResulReturnCookieForFormForge,
} from '../formForgeOpen';

import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';

const AdvancedForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    const resulListReturnUrl = `${window.location.origin}${pathname}${search}`;
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const { licenseTypeId } = getUserDetails();
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { advanced_form_loading } = useSelector(({ formGeneratorReducers }) => formGeneratorReducers);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { pageSize } = useWindowSize();

    const [initialPagination, setInitialPagination] = useState(false);
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const isFirstRender = useRef(true);
    const isInitialEffectComplete = useRef(false);

    const getTimezoneAdjustedStartDate = () => {
        const systemStartDate = new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER));
        return convertToUserTimezone(systemStartDate, { formatAsString: false });
    };

    const getTimezoneAdjustedEndDate = () => {
        const systemEndDate = new Date();
        return convertToUserTimezone(systemEndDate, { formatAsString: false });
    };

    const [dates, setDates] = useState({
        startDate: getTimezoneAdjustedStartDate(),
        endDate: getTimezoneAdjustedEndDate(),
        selectedDateText: 'Last 30 days',
    });

    const [isShow, setIsShow] = useState({
        confirmationModal: false,
        isPublish: false,
        rmModal: false,
        tableConfig: null,
    });
    const [modalState, setModalState] = useState({ isModal: false, linkedTableConfig: null });
    const [guiID, setGuiID] = useState('');
    const [totalCampaigns, setTotalCampaigns] = useState(0);
    const [formListData, setFormListData] = useState([]);
    const [previewGenerate, setPreviewGenerate] = useState({
        show: false,
        name: '',
        formDataValues: {},
        savedata: {},
        publishData: {},
        isTellAFriend: false,
        publishTabOnly: false,
        isAdvancedForm: false,
    });
    const [currentGridState, setCurrentGridState] = useState({ skip: 0, take: pageSize || 5 });

    const [payload, setpayload] = useState({
        clientId,
        departmentId,
        userId,
        isFilter: true,
        filteration: {
            formName: '',
            formType: handleFormType('all', userId),
            startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
            endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
        },
        pagination: {
            pageNo: 1,
            pageSize: 5,
        },
    });

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setIsShow((pre) => ({ ...pre, confirmationModal: true }));
        } else {
            setIsShow((pre) => ({ ...pre, confirmationModal: false }));
        }
    }, [departmentName, licenseTypeId]);

    useEffect(() => {
        if (pageSize > 0) {
            setpayload((prev) => ({
                ...prev,
                pagination: { ...prev.pagination, pageSize },
            }));
        }
    }, [pageSize]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setpayload((pre) => ({
                ...pre,
                filteration: {
                    formType: handleFormType('all', userId),
                    formName: '',
                    startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                    endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
                },
                pagination: { pageNo: 1, pageSize },
            }));
            setInitialPagination(true);
        } else {
            setpayload((pre) => ({
                ...pre,
                departmentId,
                clientId,
                filteration: {
                    formType: handleFormType('all', userId),
                    formName: '',
                    startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                    endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
                },
                pagination: { pageNo: 1, pageSize },
            }));
            setInitialPagination(true);
            setDates({
                startDate: getTimezoneAdjustedStartDate(),
                endDate: getTimezoneAdjustedEndDate(),
                selectedDateText: 'Last 30 days',
            });
            setIsCloseSearch(true);
        }
    }, [departmentId, clientId, userId, pageSize, licenseTypeId]);

    useEffect(() => {
        if (!isInitialEffectComplete.current) {
            isInitialEffectComplete.current = true;
            return;
        }
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') return;
        fetchList();
    }, [payload]);

    useSkipFirstRender(() => {
        setpayload((pre) => ({
            ...pre,
            pagination: { pageNo: 1, pageSize },
        }));
        setInitialPagination(true);
        setCurrentGridState({ skip: 0, take: pageSize || 5 });
    }, [pageSize]);

    async function fetchList() {
        const { data, status, totalForms, guid } = await dispatch(
            advancedFormListApi({ ...payload, departmentId }),
        );
        if (status) {
            const processed = (data || []).map((item) => {
                const campaigns = item?.formCampaignUsed || [];
                const names = campaigns.map((c) => c?.campaignName).filter(Boolean);
                return {
                    ...item,
                    linkedCommunicationsText: (names?.[0] || '').trim() || 'NA',
                    redirectUrl:
                        item.redirectUrl ?? item.redirect_url ?? item.RedirectUrl ?? item.redirectURL,
                    publishedURL:
                        item.publishedURL ??
                        item.publishedUrl ??
                        item.publishUrl ??
                        item.publishURL ??
                        null,
                    htmlContent: item?.htmlContent ?? item?.html_content ?? '',
                    fieldDetails: item?.fieldDetails ?? item?.field_details ?? [],
                    tenantSlug: item?.tenantSlug ?? item?.tenant_slug ?? 'default',
                    apiBaseUrl: item?.apiBaseUrl ?? item?.api_base_url ?? '',
                };
            });
            setFormListData(processed);
            setTotalCampaigns(totalForms);
            setGuiID(guid);
        } else {
            setFormListData([]);
            setTotalCampaigns(0);
            setGuiID('');
        }
    }

    const handleActions = (action, dataItem) => {
        if (action === 'Publish') {
            handlePublish(dataItem);
        } else if (action === 'Notifiers') {
            setIsShow((pre) => ({ ...pre, rmModal: true, tableConfig: dataItem }));
        }
    };

    const handlePublish = async (dataItem) => {
        const pubUrl =
            dataItem?.publishedURL ??
            dataItem?.publishedUrl ??
            dataItem?.publishUrl ??
            dataItem?.publishURL;
        if (pubUrl == null || String(pubUrl).trim() === '') {
            return;
        }
        const formId = getAdvancedFormId(dataItem);
        try {
            const res = await dispatch(getFormPublishDetailsFF(formId));
            if (res && res.status) {
                const details = res.data;
                setIsShow((pre) => ({ ...pre, isPublish: true, tableConfig: dataItem }));
                setPreviewGenerate({
                    show: true,
                    name: dataItem.formName,
                    formDataValues: {
                        htmlContent: details?.htmlContent ?? '',
                        fieldDetails: details?.fieldDetails ?? [],
                        tenantSlug: details?.tenantSlug ?? 'default',
                        apiBaseUrl: details?.apiBaseUrl ?? '',
                    },
                    savedata: {
                        data: { formId, tenantId: guiID },
                    },
                    publishData: {
                        publishUrl: String(pubUrl).trim(),
                        fieldDetails: details?.fieldDetails ?? [],
                        tenantSlug: details?.tenantSlug ?? 'default',
                        apiBaseUrl: details?.apiBaseUrl ?? '',
                    },
                    isTellAFriend: false,
                    publishTabOnly: false,
                    isAdvancedForm: true,
                });
            } else {
                toast.error(res?.message || 'Failed to fetch publish details');
            }
        } catch (error) {
            toast.error('An error occurred while fetching publish details');
        }
    };

    const handleCreateResulForm = async () => {
        if (!addAccess) return;
        try {
            const res = await dispatch(getNewFormRedirectUrl({ clientId, departmentId }));
            const redirectUrl = extractNewFormRedirectUrl(res);
            if (redirectUrl) {
                openFormForgeWithReturn(redirectUrl, resulListReturnUrl);
                return;
            }
        } catch {
            /* fall through */
        }
        toast.error('Unable to open form builder');
    };

    const handleCreateBrandOwnedForm = () => {
        if (!addAccess) return;
        navigate('/preferences/template-gallery/brand-owned-form-generator');
    };

    const handleEdit = async (dataItem) => {
        if (!updateAccess) return;
        const formId = getAdvancedFormId(dataItem);
        if (!formId) {
            toast.error('Form id is missing');
            return;
        }
        try {
            const res = await dispatch(getFormEditUrl({ formId: String(formId), clientId, departmentId }));
            const url = extractFormRedirectUrlFromResponse(res);
            if (url) {
                openFormForgeWithReturn(url, resulListReturnUrl);
                return;
            }
        } catch {
            /* fall through */
        }
        const listRedirect =
            dataItem?.redirectUrl ?? dataItem?.redirect_url ?? dataItem?.RedirectUrl;
        if (listRedirect) {
            openFormForgeWithReturn(listRedirect, resulListReturnUrl);
            return;
        }
        toast.error('Unable to open form editor');
    };

    const handleAnalytics = async (dataItem) => {
        const formId = getAdvancedFormId(dataItem);
        if (!formId) {
            toast.error('Form id is missing');
            return;
        }
        try {
            const res = await dispatch(getFormAnalyticsUrl({ formId: String(formId), clientId, departmentId }));
            const url = extractFormRedirectUrlFromResponse(res);
            if (url) {
                const targetUrl = appendEmbedParamToFormForgeUrl(url, resulListReturnUrl);
                setResulReturnCookieForFormForge(resulListReturnUrl);
                window.location.assign(targetUrl);
                return;
            }
        } catch {
            /* fall through */
        }
        toast.error('Unable to open analytics');
    };

    const handlePageChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        const size = skip === 0 ? 1 : Math.floor(skip / take) + 1;
        setCurrentGridState({ skip, take });
        setpayload((prev) => ({
            ...prev,
            pagination: { pageNo: size, pageSize: take },
        }));
        setInitialPagination(false);
    };

    const handlePageSizeChange = (dataState) => {
        const { skip, take } = dataState;
        const size = skip === 0 ? 1 : Math.floor(skip / take) + 1;
        setCurrentGridState({ skip, take });
        setpayload((prev) => ({
            ...prev,
            pagination: { pageNo: size, pageSize: take },
        }));
    };

    const handleDatePickerChange = ({ startDate, endDate }) => {
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;
        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                startDate: getYYMMDD(startDate),
                endDate: getYYMMDD(endDate),
            },
            pagination: { pageNo: currentPageNo, pageSize: currentPageSize },
        }));
        setInitialPagination(false);
    };

    const handleSearchDropdown = (item) => {
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;
        setpayload((pre) => ({
            ...pre,
            filteration: {
                ...pre.filteration,
                formType: handleFormType(item.id, userId) || '',
            },
            pagination: { pageNo: currentPageNo, pageSize: currentPageSize },
        }));
        setInitialPagination(false);
    };

    const handleOnblurData = (value) => {
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;
        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: { ...pre.filteration, formName: value || '' },
            pagination: { pageNo: currentPageNo, pageSize: currentPageSize },
        }));
        setInitialPagination(false);
    };

    const handleListItemClick = (value) => {
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: { ...pre.filteration, formName: value || '' },
            pagination: { pageNo: 1, pageSize: currentPageSize },
        }));
        setInitialPagination(true);
    };

    const defaultItemInSearchValue = useMemo(
        () => ({ id: 'All', type: 'All List' }),
        [],
    );

    return (
        <Fragment>
            <div className="page-content-holder">
                <RSPageHeader
                    title={ADVANCED_FORM_BUILDER}
                    isBack
                    backPath="/preferences/template-gallery"
                    isHeaderLine
                    rightCommonMenus
                />
                <Container fluid>
                    <div className="page-content">
                        <Container className="px0">
                            {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                                <div className="mt15">
                                    <RSSkeletonTable text />
                                </div>
                            ) : (
                                <>
                                    <div className="flex-row justify-content-end mt0 top-sub-heading">
                                        <ul className="rs-list-group-horizontal">
                                            <li>
                                                <RSDateRangePicker
                                                    onDatePickerClosed={handleDatePickerChange}
                                                    startDate={dates?.startDate}
                                                    endDate={dates?.endDate}
                                                    selectedDateText={dates?.selectedDateText}
                                                    isTemplate
                                                />
                                            </li>
                                            <li>
                                                <RSBootstrapdown
                                                    data={advancedFormSearchListItems}
                                                    isObject
                                                    fieldKey="type"
                                                    isActive
                                                    alignRight
                                                    defaultItem={defaultItemInSearchValue}
                                                    onSelect={handleSearchDropdown}
                                                />
                                            </li>
                                            <li>
                                                <RSSearchField
                                                    isCloseSearch={isCloseSearch}
                                                    setIsCloseSearch={setIsCloseSearch}
                                                    handleOnblur={handleOnblurData}
                                                    searchedText={handleListItemClick}
                                                />
                                            </li>
                                            <li>
                                                <RSBootstrapdown
                                                    data={ADVANCED_FORM_CREATE_OPTIONS}
                                                    flatIcon
                                                    defaultItem={
                                                        <RSTooltip
                                                            text={CREATE_NEW_FORM}
                                                            className="position-relative top3"
                                                        >
                                                            <i
                                                                className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                                                id="rs_advanced_form_create"
                                                            />
                                                        </RSTooltip>
                                                    }
                                                    showUpdate={false}
                                                    className="no_caret"
                                                    onSelect={(e) => {
                                                        if (addAccess && e === 'RESUL forms') {
                                                            handleCreateResulForm();
                                                        }
                                                        if (addAccess && e === 'Brand-owned form') {
                                                            handleCreateBrandOwnedForm();
                                                        }
                                                    }}
                                                    disbleItems={
                                                        addAccess ? [] : ['Brand-owned form', 'RESUL forms']
                                                    }
                                                />
                                            </li>
                                        </ul>
                                    </div>
                                    {formListData?.length || advanced_form_loading ? (
                                        <div>
                                            <CustomKendoGrid
                                                settings={{ total: totalCampaigns }}
                                                isDataStateRequired
                                                onDataStateChange={handlePageChange}
                                                pagerChange={initialPagination}
                                                setInitialPagination={setInitialPagination}
                                                filterable
                                                onPageSizeChange={handlePageSizeChange}
                                                isLoading={advanced_form_loading}
                                                data={formListData}
                                                column={[
                                                    {
                                                        field: 'formName',
                                                        filter: 'text',
                                                        title: 'Form name',
                                                        cell: ({ dataItem }) => (
                                                            <td>
                                                                {dataItem?.formName?.length > 37 ? (
                                                                    <RSTooltip
                                                                        text={dataItem?.formName}
                                                                        position="top"
                                                                        className="d-inline-block"
                                                                    >
                                                                        <span className="m0">
                                                                            {truncateTitle(dataItem?.formName, 37)}
                                                                        </span>
                                                                    </RSTooltip>
                                                                ) : (
                                                                    <span className="m0">{dataItem?.formName}</span>
                                                                )}
                                                            </td>
                                                        ),
                                                    },
                                                    {
                                                        field: 'formType',
                                                        filter: 'text',
                                                        title: 'Form type',
                                                        cell: ({ dataItem }) => (
                                                            <td>
                                                                <span className="m0">{dataItem?.formType}</span>
                                                            </td>
                                                        ),
                                                    },
                                                    {
                                                        field: 'linkedCommunicationsText',
                                                        title: 'Linked communications',
                                                        filter: 'text',
                                                        cell: ({ dataItem }) => {
                                                            const campaigns = dataItem?.formCampaignUsed || [];
                                                            if (campaigns.length === 0) {
                                                                return (
                                                                    <td>
                                                                        <span className="m0">NA</span>
                                                                    </td>
                                                                );
                                                            }
                                                            const firstName = campaigns[0]?.campaignName || '';
                                                            const moreCount = campaigns.length - 1;
                                                            return (
                                                                <td>
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            minWidth: 0,
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                flex: '0 1 auto',
                                                                                minWidth: 0,
                                                                                overflow: 'hidden',
                                                                            }}
                                                                        >
                                                                            <TruncatedCell value={firstName} noTable />
                                                                        </span>
                                                                        {moreCount > 0 && (
                                                                            <span
                                                                                className="color-primary-blue cursor-pointer"
                                                                                style={{
                                                                                    flexShrink: 0,
                                                                                    whiteSpace: 'nowrap',
                                                                                    marginLeft: '5px',
                                                                                }}
                                                                                onClick={() => {
                                                                                    setModalState({
                                                                                        isModal: true,
                                                                                        linkedTableConfig: dataItem,
                                                                                    });
                                                                                }}
                                                                            >
                                                                                & {moreCount} more
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        },
                                                    },
                                                    {
                                                        field: 'action',
                                                        title: 'Actions',
                                                        width: '230px',
                                                        cell: ({ dataItem }) => {
                                                            const actionOptions = ['Publish', 'Delete', 'Notifiers'];
                                                            const advPubUrl =
                                                                dataItem?.publishedURL ??
                                                                dataItem?.publishedUrl ??
                                                                dataItem?.publishUrl;
                                                            const disablePublishAdvanced =
                                                                advPubUrl == null || String(advPubUrl).trim() === '';
                                                            return (
                                                                <td style={{ overflow: 'inherit' }} className="px15">
                                                                    <ul className="rs-list-inline rli-space-15">
                                                                        <li
                                                                            className={
                                                                                !updateAccess ? 'click-off pe-none' : ''
                                                                            }
                                                                        >
                                                                            <RSTooltip
                                                                                text={EDIT}
                                                                                position="top"
                                                                                className="lh0"
                                                                            >
                                                                                <i
                                                                                    id="rs_advanced_form_edit"
                                                                                    className={`${
                                                                                        dataItem?.formCampaignUsed?.length > 0
                                                                                            ? eye_medium
                                                                                            : pencil_edit_medium
                                                                                    } icon-md color-primary-blue`}
                                                                                    onClick={() => {
                                                                                        void handleEdit(dataItem);
                                                                                    }}
                                                                                />
                                                                            </RSTooltip>
                                                                        </li>
                                                                        <li>
                                                                            <RSTooltip
                                                                                text={ANALYTICS}
                                                                                position="top"
                                                                                className="lh0"
                                                                            >
                                                                                <i
                                                                                    id="rs_advanced_form_analytics"
                                                                                    className={`${analytics_medium} icon-md color-primary-blue`}
                                                                                    onClick={() => {
                                                                                        void handleAnalytics(dataItem);
                                                                                    }}
                                                                                />
                                                                            </RSTooltip>
                                                                        </li>
                                                                        <li>
                                                                            <RSTooltip
                                                                                text={ACTIONS}
                                                                                position="top"
                                                                                innerContent={false}
                                                                                className="lh0"
                                                                            >
                                                                                <RSBootstrapdown
                                                                                    data={actionOptions}
                                                                                    flatIcon
                                                                                    disbleItems={[
                                                                                        'Delete',
                                                                                        ...(disablePublishAdvanced
                                                                                            ? ['Publish']
                                                                                            : []),
                                                                                    ]}
                                                                                    defaultItem={
                                                                                        <i
                                                                                            id="rs_advanced_form_actions"
                                                                                            className={`${circle_arrow_down_medium} icon-md color-primary-blue`}
                                                                                        />
                                                                                    }
                                                                                    className="no_caret"
                                                                                    alignRight
                                                                                    onSelect={(item) => {
                                                                                        handleActions(item, dataItem);
                                                                                    }}
                                                                                />
                                                                            </RSTooltip>
                                                                        </li>
                                                                    </ul>
                                                                </td>
                                                            );
                                                        },
                                                    },
                                                ]}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <RSSkeletonTable
                                                count={5}
                                                text
                                                isHTML
                                                noDataCustomClass="form-generator-no-data"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </Container>
                    </div>
                </Container>
            </div>
            {modalState.isModal && (
                <LinkedCommunicationsModal
                    show={modalState.isModal}
                    data={modalState.linkedTableConfig}
                    handleClose={() =>
                        setModalState({ isModal: false, linkedTableConfig: null })
                    }
                    confirm={() =>
                        setModalState({ isModal: false, linkedTableConfig: null })
                    }
                />
            )}
            {isShow.confirmationModal && (
                <RSConfirmationModal
                    show={isShow?.confirmationModal}
                    text={SELECT_BU}
                    handleClose={() => setIsShow((pre) => ({ ...pre, confirmationModal: false }))}
                    handleConfirm={() => setIsShow((pre) => ({ ...pre, confirmationModal: false }))}
                    secondaryButton={false}
                />
            )}
            {isShow.isPublish && (
                <GenerateAndEmbedAPI
                    show={isShow.isPublish}
                    fromTellAFriend={previewGenerate?.isTellAFriend}
                    isAdvancedForm={!!previewGenerate?.isAdvancedForm}
                    publishTabOnly={!!previewGenerate?.publishTabOnly}
                    formSubscription={false}
                    fromListing
                    formDataValues={previewGenerate.formDataValues}
                    editName={previewGenerate.name}
                    saveData={previewGenerate.savedata}
                    handleActions={() => {}}
                    publishData={previewGenerate?.publishData}
                    previewData={previewGenerate.formDataValues}
                    handleClose={() => {
                        setIsShow((pre) => ({ ...pre, isPublish: false }));
                        setPreviewGenerate({
                            show: false,
                            name: '',
                            formDataValues: {},
                            savedata: {},
                            publishData: {},
                            publishTabOnly: false,
                            isAdvancedForm: false,
                        });
                    }}
                />
            )}
            {isShow.rmModal && (
                <RMModal
                    show={isShow.rmModal}
                    isAdvancedForm
                    handleActions={(status) => {
                        setIsShow((pre) => ({ ...pre, rmModal: status, tableConfig: null }));
                    }}
                    data={isShow.tableConfig}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </Fragment>
    );
};

export default AdvancedForm;
