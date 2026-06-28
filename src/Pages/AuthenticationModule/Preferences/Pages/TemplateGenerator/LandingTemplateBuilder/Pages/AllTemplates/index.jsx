import { convertToUserTimezone, getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { alert_medium, circle_plus_fill_edge_large, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';
import { ResTemplateCard } from '../Card';
import RSPager from 'Components/RSPager';
import RSSearchField from 'Components/RSSearchField';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import { templateGalleryListApi } from 'Reducers/preferences/EmailBuilder/request';
import { updateTemplate } from 'Reducers/communication/Template/reducer';
import LandingPageModal from './Modal';
import { INITIAL_GALLERY_CONFIG } from 'Components/RSPager/constant';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import usePermission from 'Hooks/usePersmission';
import SkeletonGalleryCard from 'Components/Skeleton/Components/SkeletonGalleryCard.jsx';

const LandingPageGallery = (type) => {
    const navigate = useNavigate();
    const disPatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [templateFlag, setTemplateFlag] = useState(false);
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const isFirstRender = useRef(true);
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const template = useSelector(({ TemplateReducer }) => TemplateReducer?.templateCard);
    // Initialize loading state - if filtering for landing page (channelId 32), always start with loading
    const initialChannelId = type?.payload?.channelId || 32;
    const isInitialFiltering = type?.payload?.isFilter && initialChannelId === 32;
    const [isLoading, setIsLoading] = useState(type?.isLoading ?? (isInitialFiltering ? true : false));
    const lastChannelIdRef = useRef(null);
    const dataLoadedForChannelRef = useRef(!isInitialFiltering);
    const [pagerPageConfig, setPagerPageConfig] = useState({
        ...INITIAL_GALLERY_CONFIG,
        currentPage: 1,
        pageSize: 4,
    });
    const [isChange, setIsChange] = useState(false);

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
    useEffect(() => {
        disPatch(updateTemplate({ items: [], totalRecords: 0 }));
        setIsLoading(true);
        setIsChange(false);
        dataLoadedForChannelRef.current = false;
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: 4,
            currentPage: 1,
            pageSize: 4,
        }));
        setDates({
            startDate: getTimezoneAdjustedStartDate(),
            endDate: getTimezoneAdjustedEndDate(),
            selectedDateText: 'Last 30 days',
        });
        setIsCloseSearch(true);
    }, [type?.text]);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: 4,
            currentPage: 1,
            pageSize: 4,
        }));
        setDates({
            startDate: getTimezoneAdjustedStartDate(),
            endDate: getTimezoneAdjustedEndDate(),
            selectedDateText: 'Last 30 days',
        });
        setIsCloseSearch(true);
        type?.setPayload((pre) => ({
            ...pre,
            isFilter: true,
            departmentId: departmentId,
            clientId: clientId,
            filteration: {
                templateName: '',
                startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
            },
            pagination: {
                pageNo: 1,
                recordLimit: 4,
            },
        }));
    }, [departmentId, clientId]);
    // const [template, setTemplate] = useState({
    //     data: [],
    //     count: 0,
    // });
    // const [pageState, setPageState] = useState(template.data.slice(0, 4));

    // const [pageInitialValue, setPageInitialValue] = useState({
    //     take: 5,
    //     skip: 0,
    // });
    // const [payload, setpayload] = useState({
    //     clientId,
    //     departmentId,
    //     userId,
    //     isFilter: true,
    //     channelId: 32,
    //     templatecategory: 'All template',
    //     filteration: {
    //         templateName: '',
    //         startDate: getYYMMDD(new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER))),
    //         endDate: getYYMMDD(new Date()),
    //     },
    //     pagination: {
    //         pageNo: 1,
    //         recordLimit: 4,
    //     },
    // });

    // const handlePageChange = (data) => {
    //     let { take, skip } = data;
    //     const size = skip === 0 ? 1 : skip / take + 1;
    //     setPageInitialValue((pre) => ({ ...pre, skip: skip, take: take }));
    //     type?.setPayload((pre) => ({
    //         ...pre,
    //         pagination: {
    //             pageNo: size,
    //             recordLimit: take,
    //         },
    //     }));
    // };
    // useEffect(() => {
    //     setpayload((pre) => ({ ...pre, departmentId, clientId, userId }));
    // }, [departmentId, clientId]);

    // useEffect(() => {
    //     fetchList(payload);
    // }, [payload, departmentId]);

    const [totalCount, setTotalcount] = useState(0);
    async function fetchList() {
        let payload = {
            ...type?.payload,
            pagination: {
                pageNo: 1,
                recordLimit: 4,
            },
            filteration: {
                templateName: '',
                startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
                endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
            },
        };

        let {
            status,
            data: { templatelist, totalrows },
        } = await disPatch(templateGalleryListApi({ ...payload }, false));
        const searchInput = document.getElementsByClassName('searchInput');
        searchInput[0].value = '';
        setDates({
            startDate: getTimezoneAdjustedStartDate(),
            endDate: getTimezoneAdjustedEndDate(),
            selectedDateText: 'Last 30 days',
        });
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: 4,
            currentPage: 1,
            pageSize: 4,
        }));
        // if (status) {
        //     setTemplate({ data: templatelist, count: totalrows });
        // } else {
        //     setTemplate({ data: [], count: 0 });
        // }
    }

    const handleSearch = (filterValue) => {
        setIsChange(true);
        setIsLoading(true);
        // For new searches, reset to page 1 but preserve pageSize from pagerPageConfig (source of truth)
        const currentPageSize = pagerPageConfig?.pageSize || 4;

        // Update pager config first
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: currentPageSize,
            currentPage: 1,
            pageSize: currentPageSize,
        }));

        type?.setPayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                templateName: filterValue,
                startDate: pre?.filteration?.startDate,
                endDate: pre?.filteration?.endDate,
            },
            pagination: {
                pageNo: 1,
                recordLimit: currentPageSize,
            },
        }));
    };
    const handleDatePickerChange = ({ startDate, endDate, selectedType }) => {
        setIsChange(true);
        setIsLoading(true);
        // Update dates state with the selectedType from the callback
        setDates({
            startDate: startDate,
            endDate: endDate,
            selectedDateText: selectedType || dates?.selectedDateText || 'Last 30 days',
        });

        // Preserve current pagination from pagerPageConfig using functional update (source of truth)
        setPagerPageConfig((pre) => {
            const currentPageNo = pre?.currentPage || 1;
            const currentPageSize = pre?.pageSize || 4;
            const currentSkip = pre?.skip || 0;

            // Update payload with preserved pagination
            type?.setPayload((prev) => ({
                ...prev,
                isFilter: true,
                filteration: {
                    templateName: prev?.filteration?.templateName,
                    startDate: getYYMMDD(startDate),
                    endDate: getYYMMDD(endDate),
                },
                pagination: {
                    pageNo: currentPageNo,
                    recordLimit: currentPageSize,
                },
            }));

            // Return preserved config
            return {
                ...pre,
                skip: currentSkip,
                take: currentPageSize,
                currentPage: currentPageNo,
                pageSize: currentPageSize,
            };
        });
    };

    const handleTemplateClose = (status) => {
        // if (status) {
        //     navigate('/preferences/template-gallery/email-builder-page');
        // }
        setTemplateFlag(false);
    };

    const handlePageNumber = (data, skip, take) => {
        window.scrollTo(0, 0);
        setIsChange(true);
        setIsLoading(true);
        const size = skip === 0 ? 1 : skip / take + 1;

        if (take !== pagerPageConfig.pageSize) {
            const currentPage = size;
            const newSkip = (currentPage - 1) * take;

            setPagerPageConfig((pre) => ({
                ...pre,
                skip: newSkip,
                take,
                currentPage,
                pageSize: take,
            }));

            type?.setPayload((pre) => ({
                ...pre,
                pagination: {
                    pageNo: size,
                    recordLimit: take,
                },
            }));
        } else {
            setPagerPageConfig((pre) => ({
                ...pre,
                skip,
                take,
                currentPage: size,
                pageSize: take,
            }));

            type?.setPayload((pre) => ({
                ...pre,
                pagination: {
                    pageNo: size,
                    recordLimit: take,
                },
            }));
        }
    };

    const handleOnblurData = async () => {
        setIsChange(false);
        setIsLoading(true);
        // Preserve current pagination from pagerPageConfig using functional update (source of truth)
        setPagerPageConfig((pre) => {
            const currentPageNo = pre?.currentPage || 1;
            const currentPageSize = pre?.pageSize || 4;
            const currentSkip = pre?.skip || 0;

            // Update payload with preserved pagination
            type?.setPayload((prev) => ({
                ...prev,
                filteration: {
                    templateName: '',
                    startDate: prev?.filteration?.startDate,
                    endDate: prev?.filteration?.endDate,
                },
                pagination: {
                    pageNo: currentPageNo,
                    recordLimit: currentPageSize,
                },
            }));

            // Return preserved config
            return {
                ...pre,
                skip: currentSkip,
                take: currentPageSize,
                currentPage: currentPageNo,
                pageSize: currentPageSize,
            };
        });
    };

    // Set loading to true when payload changes (new filter/search/pagination) or channelId changes
    useEffect(() => {
        const currentChannelId = type?.payload?.channelId || 32;

        // If channelId changed, we need to load new data - show skeleton and reset data loaded flag
        if (lastChannelIdRef.current !== null && lastChannelIdRef.current !== currentChannelId) {
            setIsLoading(true);
            dataLoadedForChannelRef.current = false;
        }
        lastChannelIdRef.current = currentChannelId;

        // When filtering starts, show skeleton and reset data loaded flag
        if (type?.payload && type?.payload?.isFilter) {
            setIsLoading(true);
            dataLoadedForChannelRef.current = false;
        }
    }, [type?.payload?.isFilter, type?.payload?.filteration, type?.payload?.pagination, type?.payload?.channelId]);

    useEffect(() => {
        const currentChannelId = type?.payload?.channelId || 32;
        if (template && type?.payload?.isFilter && currentChannelId === 32) {
            setIsLoading(false);
            dataLoadedForChannelRef.current = true;
        }
    }, [template, type?.payload?.isFilter, type?.payload?.channelId]);

    // Handle isLoading prop from parent
    useEffect(() => {
        if (type?.isLoading !== undefined) {
            setIsLoading(type.isLoading);
        }
    }, [type?.isLoading]);

    useEffect(() => {
        const currentChannelId = type?.payload?.channelId || 32;
        if (type?.payload?.isFilter && currentChannelId === 32) {
            setIsLoading(true);
            dataLoadedForChannelRef.current = false;
        }
    }, []);

    return (
        <>
            <div className="flex-row justify-content-end top-sub-heading">
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
                            placeholder={'By template name'}
                            isCloseSearch={isCloseSearch}
                            setIsCloseSearch={setIsCloseSearch}
                        />
                    </li>

                    <li>
                        <RSTooltip position="top" text="Create new template" className="lh0">
                            <i
                                onClick={() => {
                                    if (addAccess) setTemplateFlag(true);
                                }}
                                className={`${
                                    circle_plus_fill_edge_large
                                } icon-lg color-primary-blue icon-hover-shadow-primary ${addAccess ? '' : 'click-off'}`}
                                id="rs_data_circle_plus_fill_edge"
                            ></i>
                        </RSTooltip>
                    </li>
                </ul>
            </div>
            {isLoading ? (
                <Row className="mt15 mb15">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <SkeletonGalleryCard key={`loading-skeleton-${idx}`} isLoading={isLoading} />
                    ))}
                </Row>
            ) : template?.items?.length > 0 ? (
                <Row>
                    {template.items.map((list, index) => (
                        <ResTemplateCard
                            list={list}
                            key={index}
                            fetchList={fetchList}
                            setPayload={type?.setPayload}
                            setPagerPageConfig={setPagerPageConfig}
                            setIsCloseSearch={setIsCloseSearch}
                        />
                    ))}
                </Row>
            ) : (
                <Row className="position-relative mt15 mb15">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <SkeletonGalleryCard
                            key={`no-data-skeleton-${idx}`}
                            isNoDataAvailable={true}
                            isLoading={false}
                        />
                    ))}
                    <div className="gallery-no-data-message">
                        {isChange ? (
                            <span className="nodata-bar">
                                <i
                                    className={`${alert_medium} icon-md color-primary-orange mr5 cursor-default`}
                                />
                                No data found
                            </span>
                        ) : (
                            <span className="nodata-bar">
                                Click
                                <i
                                    onClick={() => {
                                        if (addAccess) setTemplateFlag(true);
                                    }}
                                    className={`${circle_plus_fill_medium} icon-md px5 color-primary-blue icon-hover-shadow-primary ${
                                        addAccess ? '' : 'click-off'
                                    }`}
                                    id="rs_data_circle_plus_fill_edge"
                                    style={{ cursor: addAccess ? 'pointer' : 'default' }}
                                />
                                to create your first Landing page template.
                            </span>
                        )}
                    </div>
                </Row>
            )}
            {template?.totalRecords > 4 && !isLoading && (
                <Row>
                    <RSPager
                        isGallery={true}
                        data={template?.items}
                        totalRow={template?.totalRecords}
                        change={(data, skip, take) => handlePageNumber(data, skip, take)}
                        config={pagerPageConfig}
                        className="mt0"
                    />
                </Row>
            )}
            {templateFlag && (
                <LandingPageModal show={templateFlag} handleClose={(status) => handleTemplateClose(status)} />
            )}
        </>
    );
};

export default LandingPageGallery;
