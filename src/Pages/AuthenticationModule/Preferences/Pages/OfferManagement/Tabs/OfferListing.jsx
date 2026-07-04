import { getDateWithDaynoFormat, getUserCurrentFormat, convertToUserTimezone } from 'Utils/modules/dateTime';
import { getEnvironment } from 'Utils/modules/environment';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { ADD, DELETE, DELETE_USER_ROLE, DUPLICATE, EDIT, OFFERS, SETTINGS, VIEW_ANALYTICS } from 'Constants/GlobalConstant/Placeholders';
import { analytics_medium, circle_plus_fill_edge_large, delete_medium, duplicate_medium, pencil_edit_medium, settings_medium, tag_offer_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import { useNavigate } from 'react-router-dom';
import RSTooltip from 'Components/RSTooltip';
import RSSearchField from 'Components/RSSearchField/index.jsx';
import RSDateRangePicker from 'Components/RSDateRangePicker/index.jsx';
import { getSessionId } from 'Reducers/globalState/selector.js';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteOfferNew,
    duplicateOfferNew,
    offerListApiNew,
    offerListPublishApi,
} from 'Reducers/preferences/OfferManagements/request.js';
import { encodeUrl } from 'Utils/modules/crypto';
import { getYYMMDD } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSModal from 'Components/RSModal';

import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import ManageCategories from '../ManageCategories';
import LinkedCommunicationsModal from '../../FormGenerator/Components/LinkedCommunicationsModal';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import { OfferListingTabSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const OfferListing = (permissions) => {
    const { updateAccess } = permissions;

    const navigate = useNavigate();
    const disPatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const env = getEnvironment();
    const isRunEnv = env === 'RUN' || false;
    const [pageInitialValue, setPageInitialValue] = useState({
        take: 5,
        skip: 0,
        initialPagination: false,
    });
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setDates({
            startDate: getTimezoneAdjustedStartDate(),
            endDate: getTimezoneAdjustedEndDate(),
            selectedDateText: 'Last 30 days',
        });
        setIsCloseSearch(true);
        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            clientId: clientId,
            departmentId: departmentId,
            filteration: {
                offerName: '',
                startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
            },
            pagination: {
                pageNo: 1,
                pageSize: 5,
            },
        }));
        setPageInitialValue({ take: 5, skip: 0, initialPagination: true });
    }, [departmentId, clientId]);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const deleteApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isDeleteLoading = deleteApi.isFetching;
    const [payload, setpayload] = useState({
        clientId,
        userId,
        isFilter: true,
        filteration: {
            offerName: '',
            startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
            endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
        },
        pagination: {
            pageNo: 1,
            pageSize: 5,
        },
    });
    const [isDelete, setIsDelete] = useState({ show: false, data: {} });
    const [isShowSkeleton, setIsShowSkeleton] = useState(false);
    const [offerList, setOfferList] = useState([]);
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [offModalVisiple, setOffModalVisiple] = useState(false);
    const [categoriesData, setCategoriesData] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [linkedCampaignsModal, setLinkedCampaignsModal] = useState({ show: false, campaigns: [] });
    const [duplicatingOfferId, setDuplicatingOfferId] = useState(null);
    const isAnyDuplicating = Boolean(duplicatingOfferId);
    const [totalOffersInSystem, setTotalOffersInSystem] = useState(null);
    const [isSystemLoading, setIsSystemLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setTotalOffersInSystem(null);
        setIsSystemLoading(true);
        async function fetchTotalSystemOffers() {
            try {
                let res = await disPatch(
                    offerListApiNew({
                        clientId,
                        userId,
                        departmentId,
                        isFilter: false,
                        filteration: {
                            offerName: '',
                            startDate: '',
                            endDate: '',
                        },
                        pagination: {
                            pageNo: 1,
                            pageSize: 1,
                        },
                    })
                );
                if (isMounted) {
                    if (res?.status && res?.data?.totalrecords !== undefined) {
                        setTotalOffersInSystem(res.data.totalrecords);
                    } else {
                        setTotalOffersInSystem(0);
                    }
                }
            } catch (e) {
                if (isMounted) setTotalOffersInSystem(0);
            } finally {
                if (isMounted) setIsSystemLoading(false);
            }
        }
        fetchTotalSystemOffers();
        return () => {
            isMounted = false;
        };
    }, [clientId, departmentId]);
    const handlePageChange = (data) => {
        const nextState = data?.dataState ? data.dataState : data;
        const nextTake = nextState?.take ?? pageInitialValue?.take ?? 5;
        const nextSkip = nextState?.skip ?? 0;
        const size = nextSkip === 0 ? 1 : nextSkip / nextTake + 1;

        // Update page config for grid display
        setPageInitialValue({ skip: nextSkip, take: nextTake, initialPagination: false });

        // Create new pagination object to ensure React detects the change
        setpayload((pre) => {
            return {
                ...pre,
                pagination: {
                    pageNo: size,
                    pageSize: nextTake,
                },
            };
        });
    };
    useEffect(() => {
        fetchList();
    }, [payload]);

    const [totalCount, setTotalcount] = useState(0);
    async function fetchList() {
        setIsLoading(true);
        try {
            const {
                data: { offergrid, totalrecords },
                status,
            } = await disPatch(offerListApiNew({ ...payload, departmentId: departmentId }));

            if (status) {
                const updatedData = offergrid.map((item) => {
                    const campaigns = Array.isArray(item.LinkedCampaigns)
                        ? item.LinkedCampaigns.map((name) => String(name ?? '').trim()).filter(Boolean)
                        : [];
                    return {
                        ...item,
                        offerCodeType: item.offerCodeType === 0 ? 'Common' : item.offerCodeType === 1 ? 'Unique' : 'NA',
                        LinkedCampaigns: campaigns,
                        linkedCommunicationsText: campaigns[0] || 'NA',
                    };
                });

                setOfferList(updatedData);
                setTotalcount(totalrecords);
                if (totalrecords > 0) {
                setTotalOffersInSystem((prev) => (prev === null || prev === 0 ? totalrecords : prev));
            }
        } else {
                setOfferList([]);
                setTotalcount(0);
            }
        } catch {
            setOfferList([]);
            setTotalcount(0);
        } finally {
            setIsLoading(false);
        }
    }
    const handleEdit = async (dataItem) => {
        let state = { offerId: dataItem?.offerId || 0, isEdit: true };
        let getEncode = encodeUrl(state);
        navigate(`/preferences/create-offer?q=${getEncode}&isEdit=true`);
    };
    const handleSearch = (filterValue) => {
        // For new searches, reset to page 1 but preserve pageSize from pageInitialValue (source of truth)
        const currentPageSize = pageInitialValue?.take || 5;

        // Update page config first
        setPageInitialValue({ take: currentPageSize, skip: 0, initialPagination: true });

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                offerName: filterValue,
                startDate: pre?.filteration?.startDate,
                endDate: pre?.filteration?.endDate,
            },
            pagination: {
                pageNo: 1,
                pageSize: currentPageSize,
            },
        }));
    };
    const handleDatePickerChange = ({ startDate, endDate }) => {
        // Preserve current pagination from pageInitialValue (source of truth)
        const currentPageSize = pageInitialValue?.take || 5;
        const currentSkip = pageInitialValue?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : currentSkip / currentPageSize + 1;

        // Update page config with preserved pagination
        setPageInitialValue({ take: currentPageSize, skip: currentSkip, initialPagination: false });

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                offerName: pre?.filteration?.offerName,
                startDate: getYYMMDD(startDate),
                endDate: getYYMMDD(endDate),
            },
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
    };

    const handleDuplicate = async (dataItem) => {
        if (duplicatingOfferId) return;

        const offerId = dataItem?.offerId;
        const payload = { userId, clientId, departmentId, offerId };
        setDuplicatingOfferId(offerId);

        try {
            const { status, message = 'No data available' } = await disPatch(duplicateOfferNew(payload, false));
            if (status) {
                const nextTake = pageInitialValue?.take || 5;
                setPageInitialValue({
                    take: nextTake,
                    skip: 0,
                    initialPagination: true,
                });
                setpayload((pre) => ({
                    ...pre,
                    pagination: {
                        pageNo: 1,
                        pageSize: nextTake,
                    },
                }));
            } else {
                disPatch(
                    update_failures_API_Errors({
                        field: 'DuplicateOfferNew',
                        message: message || 'No data available',
                    }),
                );
            }
        } finally {
            setDuplicatingOfferId(null);
        }
    };

    const handleDelete = async (dataItem) => {
        let payload = { userId, clientId, departmentId, offerId: dataItem?.offerId };
        const res = await deleteApi.refetch({
            fetcher: () => disPatch(deleteOfferNew(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (res?.status) {
            fetchList();
            setIsDelete({ show: false, data: {} });
            setTotalOffersInSystem((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        } else {
            disPatch(
                update_failures_API_Errors({
                    field: 'DeleteOfferNew',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    const fetchCategoriesData = async () => {
        setIsLoadingCategories(true);
        try {
            // let payload = { departmentId, clientId, userId };
            // let categoryRes = await disPatch(getCommunicationProductsList(payload));
            // let categories = categoryRes?.status ? categoryRes?.data : [];

            // setCategoriesData(categories);
            setShowCategoriesModal(true);
        } catch (error) {
            setCategoriesData([]);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const handleEditCategory = (dataItem) => {
        // TODO: Implement edit category functionality
    };

    const handleToggleChange = async (value, dataItem) => {
        try {
            let payload = { departmentId, clientId, userId, offerId: dataItem?.offerId, isActive: value };
            let { data, status } = await disPatch(offerListPublishApi(payload));
            if (status) {
                fetchList();
            }
        } catch (error) {}
    };

    const handleOnblurData = async (value) => {
        // Preserve current pagination from pageInitialValue (source of truth)
        const currentPageSize = pageInitialValue?.take || 5;
        const currentSkip = pageInitialValue?.skip || 0;
        const currentPageNo = currentSkip === 0 ? 1 : currentSkip / currentPageSize + 1;

        setpayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                formName: '',
                offerName: '',
            },
            pagination: {
                pageNo: currentPageNo,
                pageSize: currentPageSize,
            },
        }));
    };

    const isEmptyOfferList =
        totalOffersInSystem === 0 ||
        (totalOffersInSystem === null && !offerList?.length && !payload?.filteration?.offerName);

    return (
        <>
            {isLoading ? (
                <OfferListingTabSkeleton flushToolbar />
            ) : (
            <div className="page-content">
            {isEmptyOfferList ? (
                <div className="mt10">
                    <div className="mt10">
                        <RSSkeletonTable
                            message={
                                <>
                                Click
                                    <i
                                        onClick={() => {
                                            navigate('/preferences/create-offer');
                                        }}
                                        className={`icon-md color-primary-blue icon-hover-shadow-primary mx5 ${circle_plus_fill_edge_large}`}
                                        id="rs_data_circle_plus_fill_edge"
                                    />
                                    to create an offer.
                                </>
                            }
                            count={7}
                            text={!isLoading && !isSystemLoading}
                            isAlertIcon={false}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-row justify-content-end top-sub-heading mt0">
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
                                <RSSearchField
                                    handleOnblur={handleOnblurData}
                                    searchedText={handleSearch}
                                    isCloseSearch={isCloseSearch}
                                    setIsCloseSearch={setIsCloseSearch}
                                />
                            </li>
                            {!isRunEnv && (
                                <li>
                                    <RSTooltip position="top" text={OFFERS} className="lh0">
                                        <i
                                            className={`${tag_offer_large} icon-lg color-primary-blue`}
                                            onClick={async () => {
                                                navigate('/preferences/offers');
                                            }}
                                        ></i>
                                    </RSTooltip>
                                </li>
                            )}
                            {/* <li>
                        <RSTooltip position="top" text={SETTINGS} className="lh0">
                            <i
                                className={`${settings_medium} icon-lg color-primary-blue`}
                                onClick={async () => {
                                    await fetchCategoriesData();
                                }}
                            ></i>
                        </RSTooltip>
                    </li> */}
                            <li>
                                <RSTooltip position="top" text={ADD} className="lh0">
                                    <i
                                        className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                        onClick={() => {
                                            navigate('/preferences/create-offer');
                                        }}
                                        id="rs_data_circle_plus_fill_edge"
                                    ></i>
                                </RSTooltip>
                            </li>
                        </ul>
                    </div>
                    <div className="offer-management">
                        <KendoGrid
                            key={`grid-${totalCount}-${pageInitialValue.skip}-${pageInitialValue.take}`}
                            settings={{ total: totalCount }}
                            noBoxShadow={true}
                            pageable={true}
                            change={handlePageChange}
                            data={offerList}
                            pagerChange={pageInitialValue?.initialPagination}
                            isDataStateRequired
                            isLoading={false}
                            isFailure={!offerList?.length}
                            config={pageInitialValue}
                            flag={true}
                            // customSettingsClassName="mb70"
                            scrollable={'scrollable'}
                            column={[
                                {
                                    field: 'offerName',
                                    title: 'Offer name',
                                    width: '300px',
                                    filter: 'text',
                                    cell: ({ dataItem }) => (
                                        <td>
                                            {dataItem?.offerName?.length > 30 ? (
                                                <RSTooltip
                                                    text={dataItem?.offerName}
                                                    position="top"
                                                    innerContent={false}
                                                >
                                                    <span className="m0">{truncateTitle(dataItem?.offerName, 30)}</span>
                                                </RSTooltip>
                                            ) : (
                                                <span className="m0">{dataItem?.offerName}</span>
                                            )}
                                        </td>
                                    ),
                                },
                                {
                                    field: 'offerTypeName',
                                    title: 'Offer type',
                                    width: '150px',
                                    filter: 'text',
                                    cell: ({ dataItem }) => (
                                        <td>
                                            {dataItem?.offerTypeName?.length > 14 ? (
                                                <RSTooltip text={dataItem?.offerTypeName} position="top">
                                                    <span className="m0">
                                                        {truncateTitle(dataItem?.offerTypeName, 14)}
                                                    </span>
                                                </RSTooltip>
                                            ) : (
                                                <span className="m0">{dataItem?.offerTypeName}</span>
                                            )}
                                        </td>
                                    ),
                                },
                                {
                                    field: 'offerCodeType',
                                    title: 'Code type',
                                    width: '120px',
                                    filter: 'text',
                                    cell: ({ dataItem }) => (
                                        <td>
                                            <span>{dataItem?.offerCodeType}</span>
                                        </td>
                                    ),
                                },
                                {
                                    field: 'offerAvailable',
                                    title: 'Offer Code Availability',
                                    width: '150px',
                                    // filter: 'text',
                                    cell: ({ dataItem }) => {
                                        return (
                                            <td>
                                                <div>Available {dataItem?.offerAvailable}</div>
                                                <small>Total {dataItem?.offerVolume}</small>
                                            </td>
                                        );
                                    },
                                },
                                {
                                    field: 'linkedCommunicationsText',
                                    title: 'Linked communication',
                                    width: '220px',
                                    filter: 'text',
                                    cell: ({ dataItem }) => {
                                        const campaigns = dataItem?.LinkedCampaigns || [];

                                        if (campaigns.length === 0) {
                                            return (
                                                <td>
                                                    <span className="m0">NA</span>
                                                </td>
                                            );
                                        }

                                        const firstName = campaigns[0];
                                        const moreCount = campaigns.length - 1;

                                        return (
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                                    <TruncatedCell value={firstName} noTable={true} />
                                                    {moreCount > 0 && (
                                                        <span
                                                            className="color-primary-blue cursor-pointer"
                                                            style={{ whiteSpace: 'nowrap', marginLeft: '4px' }}
                                                            onClick={() =>
                                                                setLinkedCampaignsModal({
                                                                    show: true,
                                                                    campaigns: campaigns,
                                                                })
                                                            }
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
                                    field: 'offerStartDate',
                                    title: 'Start date',
                                    width: '150px',
                                    filter: 'date',
                                    cell: ({ dataItem }) => (
                                        <td>
                                            <span className="m0">
                                                {getUserCurrentFormat(dataItem?.offerStartDate)?.dateFormat}
                                            </span>
                                        </td>
                                    ),
                                },
                                {
                                    field: 'offerEndDate',
                                    title: 'End date',
                                    width: '150px',
                                    filter: 'date',
                                    cell: ({ dataItem }) => (
                                        <td>
                                            <span className="m0">
                                                {getUserCurrentFormat(dataItem?.offerEndDate)?.dateFormat}
                                            </span>
                                        </td>
                                    ),
                                },
                                {
                                    field: 'offerStatus',
                                    title: 'Status',
                                    width: '140px',
                                    filter: 'date',
                                    cell: ({ dataItem }) => {
                                        const offerCode =
                                            dataItem?.offerStatus?.length > 0 ? dataItem?.offerStatus : 'NA';
                                        return (
                                            <td>
                                                {offerCode?.length > 10 ? (
                                                    <RSTooltip text={offerCode} position="top" innerContent={false}>
                                                        <span className="m0">{truncateTitle(offerCode, 10)}</span>
                                                    </RSTooltip>
                                                ) : (
                                                    <span className="m0">{offerCode}</span>
                                                )}
                                            </td>
                                        );
                                    },
                                },
                                {
                                    field: 'action',
                                    title: 'Actions',
                                    width: '190px',
                                    sortable: false,
                                    cell: ({ dataItem }) => {
                                        const isRowDuplicating = duplicatingOfferId === dataItem?.offerId;
                                        const isDuplicateBlocked = isAnyDuplicating || isDeleteLoading;

                                        return (
                                        <td>
                                            <ul className="rs-list-inline rli-space-15">
                                                <li>
                                                    <RSTooltip
                                                        text={EDIT}
                                                        position="top"
                                                        innerContent={false}
                                                        className="lh0"
                                                    >
                                                        <i
                                                            id="rs_data_pencil_edit"
                                                            className={`${pencil_edit_medium}  icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                handleEdit(dataItem);
                                                            }}
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip
                                                        text={VIEW_ANALYTICS}
                                                        position="top"
                                                        innerContent={false}
                                                        className="lh0"
                                                    >
                                                        <i
                                                            id="rs_AnalyticsList_Viewanalytics"
                                                            className={`${analytics_medium} icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                const state = {
                                                                    offerId: dataItem?.offerId,
                                                                    offerName: dataItem?.offerName,
                                                                };
                                                                const encryptState = encodeUrl(dataItem);
                                                                navigate(
                                                                    `/preferences/offer-analytics?q=${encryptState}`,
                                                                    {
                                                                        state,
                                                                    },
                                                                );
                                                            }}
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip
                                                        text={
                                                            isRowDuplicating ? 'Loading...' : DUPLICATE
                                                        }
                                                        position="top"
                                                        innerContent={false}
                                                        className="lh0"
                                                    >
                                                        <span
                                                            className={`d-inline-flex align-items-center justify-content-center ${
                                                                isDuplicateBlocked && !isRowDuplicating
                                                                    ? 'pe-none click-off'
                                                                    : 'cp'
                                                            }`}
                                                            role="button"
                                                            tabIndex={
                                                                isDuplicateBlocked && !isRowDuplicating ? -1 : 0
                                                            }
                                                            onClick={() => {
                                                                if (!isDuplicateBlocked) {
                                                                    handleDuplicate(dataItem);
                                                                }
                                                            }}
                                                        >
                                                            {isRowDuplicating ? (
                                                                <span
                                                                    className="segment_loader"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : (
                                                                <i
                                                                    id="rs_OfferManagement_duplicate"
                                                                    className={`${duplicate_medium} icon-md color-primary-blue`}
                                                                />
                                                            )}
                                                        </span>
                                                    </RSTooltip>
                                                </li>
                                                <li>
                                                    <RSTooltip
                                                        text={DELETE}
                                                        position="top"
                                                        innerContent={false}
                                                        className="lh0"
                                                    >
                                                        <i
                                                            id="rs_data_delete"
                                                            className={`${delete_medium}  icon-md color-primary-red`}
                                                            onClick={() => {
                                                                setIsDelete({ show: true, data: dataItem });
                                                            }}
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                                {/* <li className="">
                                            <Switch
                                                onChange={(e) =>
                                                    handleToggleChange(e.target.value, dataItem)
                                                }
                                                checked={dataItem?.IsPublished == 1 ? true : false}
                                                disabled={updateAccess}
                                            />
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

            <RSConfirmationModal
                        show={isDelete?.show}
                        header={DELETE_USER_ROLE}
                        isBorder
                        handleConfirm={(status) => {
                            if (isDeleteLoading) return;
                            if (status) {
                                handleDelete(isDelete?.data);
                            }
                        }}
                        handleClose={() => {
                            if (isDeleteLoading) return;
                            setIsDelete({ show: false, data: {} });
                        }}
                        isLoading={isDeleteLoading}
                        blockBodyPointerEvents
                    />
                    <RSModal
                        show={showCategoriesModal}
                        size="lg"
                        header="Categories"
                        className={`${offModalVisiple ? 'opacity-0' : ''}`}
                        handleClose={() => setShowCategoriesModal(false)}
                        body={
                            <div className="rs-kendo-table-hide-header">
                                <ManageCategories
                                    OffModalVisiple={(val) => {
                                        setOffModalVisiple(val);
                                    }}
                                    back={(val) => {
                                        if (val) {
                                            setShowCategoriesModal(false);
                                        }
                                    }}
                                    isAgencyValue={false}
                                    companies={null}
                                />
                            </div>
                        }
                    />
                    <LinkedCommunicationsModal
                        show={linkedCampaignsModal.show}
                        handleClose={() => setLinkedCampaignsModal({ show: false, campaigns: [] })}
                        data={{
                            formCampaignUsed: linkedCampaignsModal.campaigns.map((name) => ({ campaignName: name })),
                        }}
                    />
                    {getWarningPopupMessage(failureApiErrors, disPatch)}
            </div>
            )}
        </>
    );
};

export default OfferListing;
