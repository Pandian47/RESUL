import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { NOT_USED, USED } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Row } from 'react-bootstrap';

import RSPager from 'Components/RSPager';
import RSSearchField from 'Components/RSSearchField';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import TemplateModal from '../CreatNewTemplates/Components/Modals/Templates';
import { INITIAL_GALLERY_CONFIG } from 'Components/RSPager/constant';
import TemplateCategoryList from './templateCategories';
import TemplateGridViewCategories from './TemplateGridViewCategories';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import ManageCategoriesModal from '../Components/Modal';
import usePermission from 'Hooks/usePersmission';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import SkeletonGalleryCard from 'Components/Skeleton/Components/SkeletonGalleryCard.jsx';

const CommunicationGallery = (type) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const [templateFlag, setTemplateFlag] = useState({
        mode: null,
        show: false,
    });
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const [manageCategoriesFlag, setManageCategoriesFlag] = useState(false);
    const [manageCategoriesSource, setManageCategoriesSource] = useState(null);
    const [templateName, setTemplateName] = useState({ name: '', list: {} });
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const [pageState, setPageState] = useState([]);
    const [isLoading, setIsLoading] = useState(type?.isLoading ?? false);
    const isFirstRender = useRef(true);
    const template = useSelector(({ TemplateReducer }) => TemplateReducer?.templateCard);
    const [pagerPageConfig, setPagerPageConfig] = useState({
        ...INITIAL_GALLERY_CONFIG,
        currentPage: 1,
        pageSize: 4,
    });
    // const utcTimeData = useSelector((state) => getUtcTimeData(state));

    // Use UTC time from API if available, otherwise fallback to system time
    // const currentUTCdateTime = utcTimeData.utcTime ? new Date(utcTimeData.utcTime.replace('Z', '')) : new Date();
    const [isChange, setIsChange] = useState(false);

    // Call UTC time API when component mounts
    // useEffect(() => {
    //     dispatch(getUtcTimeNow());
    // }, [dispatch]);

    const [dates, setDates] = useState({
        startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
        endDate: new Date(),
        selectedDateText: 'Last 30 days',
    });
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [currentTemplateType, setCurrentTemplateType] = useState('');
    useEffect(() => {
        if (isDuplicate) {
            setPagerPageConfig((pre) => ({
                ...pre,
                skip: 0,
                take: 4,
            }));
            setDates({
                startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                endDate: new Date(),
                selectedDateText: 'Last 30 days',
            });
            setIsCloseSearch(true);
            setIsDuplicate(false);
        }
    }, [isDuplicate]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        handlePageInitialState();
        setDates({
            startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: new Date(),
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
                startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                endDate: getYYMMDD(new Date()),
                templateCategoryId: '',
            },
            pagination: {
                pageNo: 1,
                recordLimit: 4,
            },
        }));
    }, [departmentId, clientId]);
    const [totalCount, setTotalcount] = useState(0);

    const handleSearch = (filterValue) => {
        setIsChange(true);
        setIsLoading(true);
        // For new searches, reset to page 1 but preserve pageSize
        const currentPageSize = type?.payload?.pagination?.recordLimit || 4;
        type?.setPayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                templateName: filterValue,
                startDate: pre?.filteration?.startDate,
                endDate: pre?.filteration?.endDate,
                templateCategoryId: pre?.filteration?.templateCategoryId,
            },
            pagination: {
                pageNo: 1,
                recordLimit: currentPageSize,
            },
        }));

        // Update pager config to match
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: currentPageSize,
            currentPage: 1,
            pageSize: currentPageSize,
        }));
    };
    const handleDatePickerChange = ({ startDate, endDate }) => {
        setIsLoading(true);
        setIsChange(true);
        // Preserve current pagination when changing date filter
        const currentPageNo = type?.payload?.pagination?.pageNo || 1;
        const currentPageSize = type?.payload?.pagination?.recordLimit || 4;
        const currentSkip = (currentPageNo - 1) * currentPageSize;

        type?.setPayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                templateName: pre?.filteration?.templateName,
                startDate: getYYMMDD(startDate),
                endDate: getYYMMDD(endDate),
                templateCategoryId: pre?.filteration?.templateCategoryId,
            },
            pagination: {
                pageNo: currentPageNo,
                recordLimit: currentPageSize,
            },
        }));

        // Update pager config to preserve pagination
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: currentSkip,
            take: currentPageSize,
            currentPage: currentPageNo,
            pageSize: currentPageSize,
        }));
    };

    const handleTemplateClose = (status) => {
        // setTemplateFlag(false);
        setIsChange(true);
        setTemplateFlag({
            show: false,
            mode: 'close',
        });
    };

    const handlePageInitialState = () => {
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: 4,
            currentPage: 1,
            pageSize: 4,
        }));
    };

    useEffect(() => {
        setCurrentTemplateType((previuosType) => (previuosType !== type?.text ? type?.text : previuosType));
        if (currentTemplateType !== type?.text) {
            handlePageInitialState();
        }
    }, [JSON.stringify(type), JSON.stringify(currentTemplateType)]);

    // const [payload, setPayload] = useState({
    //     departmentId,
    //     clientId,
    //     userId: 0,
    //     channelId: 1,
    //     templatecategory: 'All template',
    //     pagination: {
    //         pageNo: 1,
    //         recordLimit: 4,
    //     },
    //     isFilter: true,
    //     filteration: {
    //         templateName: '',
    //         startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
    //         endDate: getYYMMDD(new Date()),
    //     },
    // });
    // const galleryList = template?.templatelist || [];

    const handleManageCategoriesClose = () => {
        setManageCategoriesFlag(false);
        if (manageCategoriesSource === 'template') {
            setTemplateFlag({
                show: true,
                mode: 'create',
            });
        }
        setManageCategoriesSource(null);
    };

    const categoriesFromTemplate = () => {
        setManageCategoriesFlag(true);
        setManageCategoriesSource('template');
    };

    const categoriesFromList = () => {
        setManageCategoriesFlag(true);
        setManageCategoriesSource('list');
    };

    const galleryList = template?.items || [];

    useEffect(() => {
        setPageState(galleryList);
    }, [template]);

    useEffect(() => {
        if (type?.payload && type?.payload?.isFilter) {
            setIsLoading(true);
        }
    }, [type?.payload?.isFilter, type?.payload?.filteration, type?.payload?.pagination]);

    useEffect(() => {
        if (template) {
            setIsLoading(false);
        }
    }, [template]);
    useEffect(() => {
        if (type?.isLoading !== undefined) {
            setIsLoading(type.isLoading);
        }
    }, [type?.isLoading]);
    const [renderData, setRenderData] = useState({ data: pageState });

    const handlePageNumber = (data, skip, take) => {
        window.scrollTo(0, 0);
        const size = skip === 0 ? 1 : skip / take + 1;
        setPageState(data);
        setIsLoading(true);
        setIsChange(true);

        if (take !== pagerPageConfig.pageSize) {
            const currentPage = size; //pagerPageConfig.currentPage;
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

    const handleOnblurData = async (value) => {
        // Preserve current pagination when clearing search text
        const currentPageNo = type?.payload?.pagination?.pageNo || 1;
        const currentPageSize = type?.payload?.pagination?.recordLimit || 4;
        const currentSkip = (currentPageNo - 1) * currentPageSize;

        type?.setPayload((pre) => ({
            ...pre,
            filteration: {
                templateName: '',
                startDate: pre?.filteration?.startDate,
                endDate: pre?.filteration?.endDate,
                templateCategoryId: pre?.filteration?.templateCategoryId,
            },
            pagination: {
                pageNo: currentPageNo,
                recordLimit: currentPageSize,
            },
        }));

        // Update pager config to preserve pagination
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: currentSkip,
            take: currentPageSize,
            currentPage: currentPageNo,
            pageSize: currentPageSize,
        }));
    };

    return (
        <div className="position-relative">
            <div className="float-end d-inline-block w-100 my33 prefernces-mytemplates-mulitselect">
                <div className="flex-row justify-content-end m0 top-sub-heading">
                    <ul className="rs-list-group-horizontal align-items-end">
                        <li className="template-category-multidropdown">
                            <TemplateCategoryList
                                list={pageState}
                                setTemplateFlag={setTemplateFlag}
                                setTemplateName={setTemplateName}
                                categoryData={type?.categories}
                                userId={type?.userId}
                                from="preference"
                                type={type}
                                setRenderData={setRenderData}
                                onManageCategoriesClick={categoriesFromList}
                            />
                        </li>
                        <li className="template-catgory-datepicker">
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
                                        if (addAccess) {
                                            setTemplateFlag({
                                                show: true,
                                                mode: 'create',
                                            });
                                            setTemplateName({ name: '', list: {} });
                                        }
                                    }}
                                    className={`${circle_plus_fill_edge_large
                                        } icon-lg color-primary-blue icon-hover-shadow-primary ${addAccess ? '' : 'click-off'
                                        }`}
                                    id="rs_data_circle_plus_fill_edge"
                                ></i>
                            </RSTooltip>
                        </li>
                    </ul>
                </div>
            </div>
            <>
                {isLoading ? (
                    <Row className="mt15 mb15">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <SkeletonGalleryCard
                                key={`loading-skeleton-${idx}`}
                                isLoading
                                col={3}
                                hideBottomAccent
                                cardPadding={10}
                            />
                        ))}
                    </Row>
                ) : template && template?.items?.length > 0 ? (
                    // pageState.map((list, index) => (
                    // <TemplateCategoryList
                    //     list={pageState}
                    //     setTemplateFlag={setTemplateFlag}
                    //     setTemplateName={setTemplateName}
                    //     categoryData={type?.categories}
                    //     userId={type?.userId}
                    //     from="preference"
                    // />
                    // ))
                    <TemplateGridViewCategories
                        data={{ data: template?.items }}
                        setTemplateFlag={setTemplateFlag}
                        setTemplateName={setTemplateName}
                        categoryData={type?.categories}
                        from="preference"
                        setPayload={type?.setPayload}
                        setPagerPageConfig={setPagerPageConfig}
                        setIsCloseSearch={setIsCloseSearch}
                    />
                ) : (
                    // <Card
                    //     list={list}
                    //     key={index}
                    //     setTemplateFlag={setTemplateFlag}
                    //     templateFlag={templateFlag}
                    //     setTemplateName={setTemplateName}
                    //     categoryData={type?.categories}
                    // />
                    // ))

                    <div className={`box-design rs-clearfix`}>
                        <RSSkeletonTable
                            text
                            message={
                                <>
                                    {isChange === true ? (
                                        <>
                                            <label>No data found</label>
                                        </>
                                    ) : (
                                        <>
                                            Click
                                            <i
                                                onClick={() => {
                                                    if (addAccess) {
                                                        setTemplateFlag({
                                                            show: true,
                                                            mode: 'create',
                                                        });
                                                    }
                                                }}
                                                className={`${circle_plus_fill_edge_medium
                                                    } icon-md color-primary-blue mx5 icon-hover-shadow-primary ${addAccess ? '' : 'click-off'
                                                    }`}
                                                id="rs_data_circle_plus_fill_edge"
                                            ></i>
                                            to create your first email template.
                                        </>
                                    )}
                                </>
                            }
                            isCustombox
                            isAlertIcon={false}
                        />
                    </div>
                )}
            </>
            {template?.totalRecords > 4 && (
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
            <TemplateModal
                show={templateFlag}
                handleClose={(status) => handleTemplateClose(status)}
                templateName={templateName}
                setIsDuplicate={setIsDuplicate}
                onManageCategoriesClick={categoriesFromTemplate}
            />
            <ManageCategoriesModal
                show={manageCategoriesFlag}
                handleClose={handleManageCategoriesClose}
                setCategoriesData={(data) => {
                    if (type?.handleCategories) {
                        type.handleCategories('All template');
                    }
                }}
            />
            <ul className="rs-legend mt20">
                <li>
                    <span className="rsl-status legend-scheduled"></span>
                    {NOT_USED}
                </li>
                <li>
                    <span className="rsl-status legend-completed"></span>
                    {USED}
                </li>
            </ul>
        </div>
    );
};

export default CommunicationGallery;
