import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD, getDateWithDaynoFormat, convertToUserTimezone } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getEnvironment } from 'Utils/modules/environment';
import { handleCustomNavigationDetails } from 'Utils/modules/navigation';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ACTIONS, ANALYTICS, CREATE_NEW_FORM, CSV_DOWNLOAD, DUPLICATE, EDIT, FORM_BUILDER, SELECT_BU, VIEW } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, circle_arrow_down_medium, circle_plus_fill_edge_large, css_medium, csv_download_medium, delete_medium, duplicate_medium, eye_medium, pencil_edit_medium, settings_large, share_publish_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container } from 'react-bootstrap';

import CustomKendoGrid from 'Components/RSCustomKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import LinkedCommunicationsModal from './Components/LinkedCommunicationsModal';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

import CSVModal from './Components/CSVModal';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSSearchField from 'Components/RSSearchField';
import usePermission from 'Hooks/usePersmission';
import { useDispatch, useSelector } from 'react-redux';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';
import { getSessionId, getUtcTimeData } from 'Reducers/globalState/selector';
import {
    deleteFormbyID,
    formListApi,
    getFormData,
    getSearchNameByFormList,
    publishFormbyID,
} from 'Reducers/preferences/FormGenerator/request';
import { getFormGeneratorsDatas } from 'Reducers/preferences/FormGenerator/reducer';

import DuplicateFormModal from './Components/DuplicateModal';
import CSSModal from './Components/CSSModal';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { handleFormType, searchListItems } from './constant';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import GenerateAndEmbedAPI from './Tabs/FormTypes/Components/GenerateAndEmbedAPI';
import RMModal from './Components/RMModal';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import useApiLoader from 'Hooks/useApiLoader';

const FormGenerator = () => {
    const env = getEnvironment();
    const isRunEnv = env === 'RUN' || false;
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const disPatch = useDispatch();
    const { licenseTypeId } = getUserDetails();
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const utcTimeData = useSelector((state) => getUtcTimeData(state));
    const { height, pageSize } = useWindowSize();
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const formListLoader = useApiLoader({ autoFetch: false });
    const publishLoader = useApiLoader({ autoFetch: false });
    const [initialPagination, setInitialPagination] = useState(false);
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const isFirstRender = useRef(true);
    const isInitialEffectComplete = useRef(false);

    // Use UTC time from API if available, otherwise fallback to system time
    const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     disPatch(getUtcTimeNow());
    // }, [disPatch]);

    // Helper functions to get timezone-adjusted dates
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
    const [guiID, setGuiID] = useState('');

    const [isShow, setIsShow] = useState({
        isCSV: false,
        isPublish: false,
        isCSS: false,
        isDelete: false,
        isDuplicate: false,
        confirmationModal: false,
        tableConfig: {},
        isPreview: false,
        rmModal: false,
    });
    const [modalState, setModalState] = useState({
        isModal: false,
        linkedTableConfig: null,
    });
    const [options, setOptions] = useState([]);
    const [totalCampaigns, setTotalCampaigns] = useState(0);

    const [formListData, setFormListData] = useState([]);
    const [previewGenerate, setPreviewGenerate] = useState({
        show: false,
        name: '',
        formDataValues: {},
        savedata: {},
        publishData: {},
        isTellAFriend: false,
    });

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setIsShow((pre) => ({ ...pre, confirmationModal: true }));
        } else {
            setIsShow((pre) => ({ ...pre, confirmationModal: false }));
        }
    }, [departmentName]);

    // Update payload when pageSize is available
    useEffect(() => {
        if (pageSize > 0) {
            setpayload((prev) => ({
                ...prev,
                pagination: {
                    ...prev.pagination,
                    pageSize: pageSize,
                },
            }));
        }
    }, [pageSize]);

    const handleActions = async (action, data) => {
        if (action === 'duplicate') {
            setIsShow((pre) => ({ ...pre, isDuplicate: true, tableConfig: data }));
        } else if (action === 'csv') {
            setIsShow((pre) => ({ ...pre, isCSV: true, tableConfig: data }));
        } else if (action === 'CSS') {
            setIsShow((pre) => ({ ...pre, isCSS: true, tableConfig: data }));
            // } else if action === 'Publish' {
            //     setIsShow((pre) => ({ ...pre, isPublish: true, tableConfig: data }));
            // } else if action === 'Publish' {
            //     setIsShow((pre) => ({ ...pre, isPublish: true, tableConfig: data }));
        } else if (action === 'Delete') {
            setIsShow((pre) => ({ ...pre, isDelete: true, tableConfig: data }));
        } else if (action === 'Notifiers') {
            setIsShow((pre) => ({ ...pre, rmModal: true, tableConfig: data }));
        } else if (action === 'Publish') {
            if (publishingFormId != null) return;

            const isTellAFriend = data?.formType?.toLowerCase() === 'tell a friend';
            const payload = {
                departmentId,
                clientId,
                userId,
                recipientFormId: data?.recipientFormId,
            };

            setPublishingFormId(data?.recipientFormId);
            try {
                const result = await publishLoader.refetch({
                    fetcher: async () => {
                        const [publishRes, formRes] = await Promise.all([
                            disPatch(publishFormbyID(payload)),
                            disPatch(getFormData(payload)),
                        ]);
                        return { publishRes, formRes, row: data, isTellAFriend };
                    },
                });

                if (result?.formRes?.status) {
                    setPreviewGenerate({
                        show: true,
                        name: data.formName,
                        formDataValues: result.formRes?.data?.[0],
                        savedata: {
                            data: { formId: data?.recipientFormId, tenantId: guiID },
                        },
                        publishData: result.publishRes?.data || {},
                        isTellAFriend,
                    });
                    setIsShow((pre) => ({ ...pre, isPublish: true, tableConfig: data }));
                }
            } finally {
                setPublishingFormId(null);
            }
        }
    };

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
            pageSize: 5, // Will be updated by useEffect below
        },
    });

    const [isShowSkeleton, setIsShowSkeleton] = useState(false);
    const [editingFormId, setEditingFormId] = useState(null);
    const [publishingFormId, setPublishingFormId] = useState(null);

    // Track current grid state for pagination preservation (source of truth)
    const [currentGridState, setCurrentGridState] = useState({
        skip: 0,
        take: pageSize || 5,
    });

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
                pagination: {
                    pageNo: 1,
                    pageSize: pageSize,
                },
            }));
            setInitialPagination(true);
        } else {
            setpayload((pre) => ({
                ...pre,
                departmentId: departmentId,
                clientId: clientId,
                filteration: {
                    formType: handleFormType('all', userId),
                    formName: '',
                    startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                    endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
                },
                pagination: {
                    pageNo: 1,
                    pageSize: pageSize,
                },
            }));
            setInitialPagination(true);

            setDates({
                startDate: getTimezoneAdjustedStartDate(),
                endDate: getTimezoneAdjustedEndDate(),
                selectedDateText: 'Last 30 days',
            });
            setIsCloseSearch(true);
        }
    }, [departmentId, clientId]);
    useEffect(() => {
        if (!isInitialEffectComplete.current) {
            isInitialEffectComplete.current = true;
            return;
        }

        // if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
        // } else {
        fetchList();
        // }
    }, [payload]);

    useSkipFirstRender(() => {
        setpayload((pre) => ({
            ...pre,
            pagination: {
                pageNo: 1,
                pageSize: pageSize,
            },
        }));
        setInitialPagination(true);
        // Initialize currentGridState from payload pagination
        const initialSkip = 0;
        const initialTake = pageSize || 5;
        setCurrentGridState({ skip: initialSkip, take: initialTake });
    }, [pageSize]);

    async function fetchList() {
        const listResult = await formListLoader.refetch({
            fetcher: () => disPatch(formListApi({ ...payload, departmentId })),
        });
        const { data, status, totalForms, guid } = listResult || {};
        if (status) {
            const processed = (data || []).map((item) => {
                const campaigns = item?.formCampaignUsed || [];
                const names = campaigns.map((c) => c?.campaignName).filter(Boolean);
                return {
                    ...item,
                    linkedCommunicationsText: (names?.[0] || '').trim() || 'NA',
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
    const handleEdit = async ({ recipientFormId, formType, formName, formCampaignUsed }) => {
        if (editingFormId != null) return;

        let tabId = 0;
        if (formType.toLowerCase() === 'subscription') tabId = 0;
        else if (formType.toLowerCase() === 'survey') tabId = 2;
        else if (formType.toLowerCase() === 'tell a friend') tabId = 1;

        const payload = {
            recipientFormId,
            departmentId,
            clientId,
            userId,
        };

        setEditingFormId(recipientFormId);
        try {
            const response = await disPatch(getFormData(payload));

            if (response?.status) {
                disPatch(getFormGeneratorsDatas({ field: 'cachedEditFormData', data: response?.data }));

                const state = {
                    recipientFormId: recipientFormId || 0,
                    from: tabId,
                    formName: formName,
                    isEdit: true,
                    linkedCommunication: formCampaignUsed?.length || 0,
                };
                const getEncode = encodeUrl(state);
                if (formType.toLowerCase().includes('brand')) {
                    navigate(`/preferences/template-gallery/brand-owned-form-generator?q=${getEncode}`);
                } else {
                    navigate(`/preferences/form-generator/add-form-generator?q=${getEncode}`);
                }
            }
        } finally {
            setEditingFormId(null);
        }
    };
    const handleSearch = (filterValue) => {
        // Preserve current pagination from currentGridState (source of truth)
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                formName: filterValue,
                startDate: pre?.filteration?.startDate,
                endDate: pre?.filteration?.endDate,
            },
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
        setInitialPagination(false);
    };
    const handlePageChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        const size = skip === 0 ? 1 : Math.floor(skip / take) + 1;

        // Update current grid state
        setCurrentGridState({ skip, take });

        setpayload((prev) => ({
            ...prev,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
        }));
        setInitialPagination(false);
    };

    const handlePageSizeChange = (dataState) => {
        const { skip, take } = dataState;
        const size = skip === 0 ? 1 : Math.floor(skip / take) + 1;

        // Update current grid state
        setCurrentGridState({ skip, take });

        setpayload((prev) => ({
            ...prev,
            pagination: {
                pageNo: size,
                pageSize: take,
            },
        }));
    };
    const handleDatePickerChange = ({ startDate, endDate }) => {
        // Preserve current pagination from currentGridState (source of truth)
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                formName: pre?.filteration?.formName,
                startDate: getYYMMDD(startDate),
                endDate: getYYMMDD(endDate),
            },
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
        setInitialPagination(false);
    };
    const deleteFormDatabyID = async (id) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            recipientFormId: id,
        };
        let res = await disPatch(deleteFormbyID(payload));
        if (res?.status) {
            setIsShow((pre) => ({ ...pre, isDelete: false }));
            fetchList();
        }
    };

    const handleSearchDropdown = (item) => {
        // Preserve current pagination from currentGridState (source of truth)
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;

        setpayload((pre) => ({
            ...pre,
            filteration: {
                ...pre.filteration,
                formType: handleFormType(item.id, userId) || '',
            },
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
        setInitialPagination(false);
    };

    const defaultItemInSearchValue = useMemo(() => {
        return {
            id: 'All',
            type: 'All List',
        };
    }, []);

    const handleFilterSearch = async (value) => {
        const searchPayload = {
            clientId,
            departmentId,
            userId,
            formNameSearch: value || '',
            formType: payload?.filteration?.formType || '',
        };
        const response = await disPatch(getSearchNameByFormList(searchPayload));
        if (response?.status) {
            return response?.data;
        } else {
            return [];
        }
    };

    const handleOnblurData = async (value) => {
        // Preserve current pagination from currentGridState (source of truth)
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                formName: value || '',
            },
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
        setInitialPagination(false);
    };
    const handleListItemClick = async (value) => {
        // For new searches from list, reset to page 1 but preserve pageSize from currentGridState
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                formName: value || '',
            },
            pagination: {
                pageNo: 1,
                pageSize: currentPageSize,
            },
        }));
        setInitialPagination(true);
    };

    const handleClose = () => {
        setIsShow(false);
        navigate('/preferences/form-generator');
    };

    const handleSearchClose = () => {
        // Preserve current pagination from currentGridState (source of truth)
        const currentPageSize = currentGridState?.take || payload?.pagination?.pageSize || pageSize || 5;
        const currentSkip = currentGridState?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : Math.floor(currentSkip / currentPageSize) + 1;

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                formName: '',
            },
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
        setInitialPagination(false);
    };

    return (
        <Fragment>
            <div className="page-content-holder">
                {/* Main page heading block starts */}
                <RSPageHeader
                    title={FORM_BUILDER}
                    isBack
                    backPath="/preferences/template-gallery"
                    isHeaderLine
                    rightCommonMenus
                />
                {/* Main page heading block ends */}

                {/* Main page content block starts */}
                <Container fluid>
                    <div className="page-content">
                        <Container className="px0">
                            {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                                <>
                                    <div className="mt15">
                                        <RSSkeletonTable text={true} />
                                    </div>
                                </>
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
                                                    data={searchListItems}
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
                                                    // handleFilterSearch={handleFilterSearch}
                                                    handleOnblur={handleOnblurData}
                                                    // handleListItemClick={handleListItemClick}
                                                    // debounceOnChange
                                                    // fieldKey="formName"
                                                    // handleSearchClose={handleSearchClose}
                                                    // isSearchFilter
                                                    searchedText={handleListItemClick}
                                                />
                                            </li>
                                            {/* <li>
                                    <i className={`${settings_large} icon-lg color-primary-blue`}></i>
                                </li> */}
                                            <li>
                                                {/* <RSTooltip position="top" text="Add">
                                                    <i
                                                        className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                                        onClick={() => {
                                                            if (addAccess)
                                                                navigate('/preferences/template-gallery/add-form-generator');
                                                        }}
                                                        id="rs_data_circle_plus_fill_edge"
                                                    ></i>
                                                </RSTooltip> */}

                                                <RSBootstrapdown
                                                    data={['RESUL forms', 'Brand-owned form']}
                                                    flatIcon
                                                    defaultItem={
                                                        <>
                                                            <RSTooltip
                                                                text={CREATE_NEW_FORM}
                                                                className="position-relative top3"
                                                            >
                                                                <i
                                                                    className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                                                    id="rs_data_circle_plus_fill_edge"
                                                                />
                                                            </RSTooltip>
                                                        </>
                                                    }
                                                    showUpdate={false}
                                                    className="no_caret"
                                                    onSelect={(e) => {
                                                        if (addAccess && e === 'RESUL forms')
                                                            navigate(
                                                                '/preferences/template-gallery/add-form-generator',
                                                            );
                                                        if (addAccess && e === 'Brand-owned form')
                                                            navigate(
                                                                '/preferences/template-gallery/brand-owned-form-generator',
                                                            );
                                                    }}
                                                    disbleItems={addAccess ? [] : ['Brand-owned form', 'RESUL forms']}
                                                />
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        {/* filter value ["text","numeric","boolean","date"]. */}
                                        <CustomKendoGrid
                                            settings={{
                                                total: totalCampaigns,
                                            }}
                                            isDataStateRequired
                                            onDataStateChange={(data) => handlePageChange(data)}
                                            pagerChange={initialPagination}
                                            setInitialPagination={setInitialPagination}
                                            filterable={true}
                                            onPageSizeChange={handlePageSizeChange}
                                            isLoading={formListLoader.isLoading}
                                            data={formListData}
                                            column={[
                                                {
                                                    field: 'formName',
                                                    filter: 'text',
                                                    title: 'Form name',
                                                    width: 300,
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
                                                    width: 160,
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
                                                    width: 380,
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
                                                                    <TruncatedCell value={firstName} noTable={true} />
                                                                    {moreCount > 0 && (
                                                                        <span
                                                                            className="color-primary-blue cursor-pointer"
                                                                            style={{
                                                                                whiteSpace: 'nowrap',
                                                                                marginLeft: '4px',
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
                                                    width: 230,
                                                    cell: ({ dataItem }) => {
                                                        const options =
                                                            dataItem?.formType === 'Brand owned form'
                                                                ? ['Delete']
                                                                : ['Publish', 'Delete', 'Notifiers'];
                                                        const noLinkedCampaigns =
                                                            !dataItem?.formCampaignUsed ||
                                                            dataItem?.formCampaignUsed.length === 0;
                                                        const disableDelete = !deleteAccess || !noLinkedCampaigns;
                                                        const isRowEditLoading =
                                                            String(editingFormId) ===
                                                            String(dataItem?.recipientFormId);
                                                        const isRowPublishLoading =
                                                            String(publishingFormId) ===
                                                            String(dataItem?.recipientFormId);
                                                        const hasLinkedCampaigns =
                                                            dataItem?.formCampaignUsed?.length > 0;
                                                        const isEditDisabled =
                                                            !updateAccess ||
                                                            (dataItem?.formType === 'Brand owned form' &&
                                                                dataItem?.linkedCommunications > 0);
                                                        return (
                                                            <td style={{ overflow: 'inherit' }} className="px15">
                                                                <ul className="rs-list-inline rli-space-15">
                                                                    <li
                                                                        className={
                                                                            isEditDisabled || isRowEditLoading
                                                                                ? 'click-off pe-none'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        <RSTooltip
                                                                            text={
                                                                                isRowEditLoading
                                                                                    ? 'Loading...'
                                                                                    : hasLinkedCampaigns
                                                                                      ? VIEW
                                                                                      : EDIT
                                                                            }
                                                                            position="top"
                                                                            className="lh0"
                                                                        >
                                                                            <span
                                                                                className={`d-inline-flex align-items-center justify-content-center icon-md lh0 ${
                                                                                    isEditDisabled || isRowEditLoading
                                                                                        ? ''
                                                                                        : 'cp'
                                                                                }`}
                                                                                role="button"
                                                                                tabIndex={
                                                                                    isEditDisabled || isRowEditLoading
                                                                                        ? -1
                                                                                        : 0
                                                                                }
                                                                                onClick={() => {
                                                                                    if (
                                                                                        !isEditDisabled &&
                                                                                        !isRowEditLoading
                                                                                    ) {
                                                                                        handleEdit(dataItem);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {isRowEditLoading ? (
                                                                                    <span
                                                                                        className="segment_loader"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                ) : (
                                                                                    <i
                                                                                        id="rs_data_pencil_edit"
                                                                                        className={`${hasLinkedCampaigns ? eye_medium : pencil_edit_medium} icon-md color-primary-blue`}
                                                                                    />
                                                                                )}
                                                                            </span>
                                                                        </RSTooltip>
                                                                    </li>
                                                                    <li
                                                                        className={
                                                                            !addAccess ||
                                                                            dataItem?.formType === 'Brand owned form'
                                                                                ? 'click-off pe-none'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        <RSTooltip
                                                                            text={DUPLICATE}
                                                                            position="top"
                                                                            className="lh0"
                                                                        >
                                                                            <i
                                                                                id="rs_FormGenerator_Duplicate"
                                                                                className={`${duplicate_medium} icon-md color-primary-blue`}
                                                                                onClick={() => {
                                                                                    if (addAccess)
                                                                                        handleActions(
                                                                                            'duplicate',
                                                                                            dataItem,
                                                                                        );
                                                                                }}
                                                                            ></i>
                                                                        </RSTooltip>
                                                                    </li>
                                                                    <li>
                                                                        <RSTooltip
                                                                            text={ANALYTICS}
                                                                            position="top"
                                                                            className="lh0"
                                                                        >
                                                                            <i
                                                                                id="rs_FormGenerator_CSV"
                                                                                className={`${analytics_medium} icon-md color-primary-blue`}
                                                                                onClick={() => {
                                                                                    const queryState = {
                                                                                        fromPath: true,
                                                                                        formName: dataItem?.formName,
                                                                                        formId: dataItem?.recipientFormId,
                                                                                        formType:
                                                                                            dataItem?.formType || '',
                                                                                        ...handleCustomNavigationDetails(
                                                                                            {},
                                                                                        ),
                                                                                        data: dataItem,
                                                                                    };
                                                                                    const encryptState =
                                                                                        encodeUrl(queryState);
                                                                                    navigate(
                                                                                        `/preferences/template-gallery/form-analytics?q=${encryptState}`,
                                                                                    );
                                                                                }}
                                                                            ></i>
                                                                        </RSTooltip>
                                                                    </li>
                                                                    <li
                                                                        className={
                                                                            !updateAccess ? 'pe-none click-off' : ''
                                                                        }
                                                                    >
                                                                        <RSTooltip
                                                                            text={CSV_DOWNLOAD}
                                                                            position="top"
                                                                            className="lh0"
                                                                        >
                                                                            <i
                                                                                id="rs_FormGenerator_CSV"
                                                                                className={`${csv_download_medium} icon-md color-primary-blue`}
                                                                                onClick={() => {
                                                                                    if (updateAccess)
                                                                                        handleActions('csv', dataItem);
                                                                                }}
                                                                            ></i>
                                                                        </RSTooltip>
                                                                    </li>
                                                                    <li>
                                                                        {isRowPublishLoading ? (
                                                                            <RSTooltip
                                                                                text="Loading..."
                                                                                position="top"
                                                                                className="lh0"
                                                                            >
                                                                                <span className="d-inline-flex align-items-center justify-content-center icon-md lh0">
                                                                                    <span
                                                                                        className="segment_loader"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            </RSTooltip>
                                                                        ) : (
                                                                            <RSTooltip
                                                                                text={ACTIONS}
                                                                                position="top"
                                                                                innerContent={false}
                                                                                className="lh0"
                                                                            >
                                                                                <BootstrapDropdown
                                                                                    data={options}
                                                                                    flatIcon
                                                                                    disbleItems={
                                                                                        disableDelete ? ['Delete'] : []
                                                                                    }
                                                                                    defaultItem={
                                                                                        <i
                                                                                            id="rs_FormGenerator_arrowdown"
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
                                                                        )}
                                                                    </li>
                                                                    {/* <li className={!updateAccess ? 'click-off' : ''}>
                                                                            <RSTooltip text="Publish" position="bottom">
                                                                                <i
                                                                                    className={`${share_publish_medium} icon-md color-primary-blue`}
                                                                                    onClick={() => {
                                                                                        if (updateAccess)
                                                                                            handleActions('publish', dataItem);
                                                                                    }}
                                                                                ></i>
                                                                            </RSTooltip>
                                                                        </li>
                                                                        <li className={!updateAccess ? 'click-off' : ''}>
                                                                            <RSTooltip text="CSS" position="bottom">
                                                                                <i
                                                                                    className={`${css_medium} icon-md color-primary-blue`}
                                                                                    onClick={() => {
                                                                                        if (updateAccess)
                                                                                            handleActions('css', dataItem);
                                                                                    }}
                                                                                ></i>
                                                                            </RSTooltip>
                                                                        </li>{' '}
                                                                        <li className={!deleteAccess ? 'click-off' : ''}>
                                                                            <RSTooltip text="Delete" position="bottom">
                                                                                <i
                                                                                    className={`${delete_medium} icon-md color-primary-blue`}
                                                                                    onClick={() => {
                                                                                        handleActions('delete', dataItem);
                                                                                    }}
                                                                                ></i>
                                                                            </RSTooltip>
                                                                        </li> */}
                                                                </ul>
                                                            </td>
                                                        );
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                </>
                            )}
                        </Container>
                    </div>
                </Container>

                {/* Main page content block ends */}
            </div>
            {/* // Contend holder starts 
            // Content holder ends */}
            {/* Modals */}
            {modalState.isModal && (
                <LinkedCommunicationsModal
                    show={modalState.isModal}
                    data={modalState.linkedTableConfig}
                    handleClose={(status) => {
                        setModalState({
                            isModal: false,
                            linkedTableConfig: null,
                        });
                    }}
                    confirm={(status) => {
                        setModalState({
                            isModal: false,
                            linkedTableConfig: null,
                        });
                    }}
                />
            )}
            {isShow.isCSV && (
                <CSVModal
                    show={isShow.isCSV}
                    handleActions={(status) => {
                        setIsShow((pre) => ({ ...pre, isCSV: status }));
                    }}
                    data={isShow.tableConfig}
                />
            )}
            {/* {isShow.isPublish && (
                <PublishModal
                    show={isShow.isPublish}
                    handleActions={(status) => {
                        setIsShow((pre) => ({ ...pre, isPublish: status }));
                    }}
                    data={isShow.tableConfig}
                />
            )}{' '} */}
            {isShow.isPublish && (
                <GenerateAndEmbedAPI
                    show={isShow.isPublish}
                    fromTellAFriend={previewGenerate?.isTellAFriend}
                    formSubscription={false}
                    fromListing
                    formDataValues={previewGenerate.formDataValues}
                    editName={previewGenerate.name}
                    saveData={previewGenerate.savedata}
                    handleActions={() => {}}
                    publishData={previewGenerate?.publishData}
                    previewData={previewGenerate.formDataValues}
                    handleClose={() => {
                        publishLoader.reset();
                        setIsShow({
                            isPublish: false,
                            isPreview: false,
                        });
                        setPreviewGenerate({
                            show: false,
                            name: '',
                            formDataValues: {},
                            savedata: {},
                            publishData: {},
                            isTellAFriend: false,
                        });
                    }}
                />
            )}{' '}
            {isShow.isDuplicate && (
                <DuplicateFormModal
                    show={isShow.isDuplicate}
                    handleActions={(status) => {
                        setIsShow((pre) => ({ ...pre, isDuplicate: status }));
                    }}
                    handleCloseData={(status) => {
                        if (status) fetchList();
                    }}
                    data={isShow.tableConfig}
                />
            )}{' '}
            {isShow.isDelete && (
                <RSConfirmationModal
                    show={isShow.isDelete}
                    handleClose={(status) => {
                        setIsShow((pre) => ({ ...pre, isDelete: status }));
                    }}
                    data={isShow.tableConfig}
                    handleConfirm={(status) => {
                        if (status) {
                            deleteFormDatabyID(isShow.tableConfig?.recipientFormId);
                        }
                    }}
                />
            )}
            {isShow.confirmationModal && (
                <RSConfirmationModal
                    show={isShow?.confirmationModal}
                    text={SELECT_BU}
                    handleClose={() => {
                        setIsShow((pre) => ({ ...pre, confirmationModal: false }));
                    }}
                    handleConfirm={() => {
                        setIsShow((pre) => ({ ...pre, confirmationModal: false }));
                    }}
                    secondaryButton={false}
                />
            )}
            {isShow.isCSS && (
                <CSSModal
                    show={isShow?.isCSS}
                    handleActions={(status) => {
                        setIsShow((pre) => ({ ...pre, isCSS: status }));
                    }}
                    handleCloseData={(status) => {
                        if (status) setIsShow((pre) => ({ ...pre, isCSS: status }));
                    }}
                    data={isShow.tableConfig}
                />
            )}
            {isShow.rmModal && (
                <RMModal
                    show={isShow?.rmModal}
                    handleActions={(status) => {
                        setIsShow((pre) => ({ ...pre, rmModal: status }));
                    }}
                    handleCloseData={(status) => {
                        if (status) setIsShow((pre) => ({ ...pre, rmModal: status }));
                    }}
                    data={isShow.tableConfig}
                />
            )}
            {getWarningPopupMessage(failureApiErrors, disPatch)}
        </Fragment>
    );
};

export default FormGenerator;
