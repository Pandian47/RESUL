import { getDateWithDaynoFormat, getYYMMDD, convertToUserTimezone } from 'Utils/modules/dateTime';
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
    const isFirstRender = useRef(true);
    const { templateCard: template, templateLoading: reduxLoading } = useSelector(({ TemplateReducer }) => TemplateReducer);
    const [isLoading, setIsLoading] = useState(type?.isLoading ?? false);
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
                startDate: getTimezoneAdjustedStartDate(),
                endDate: getTimezoneAdjustedEndDate(),
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
        // For new searches, reset to page 1 but preserve pageSize from pagerPageConfig (source of truth)
        const currentPageSize = pagerPageConfig?.pageSize || 4;
        
        // Update pager config first
        setPagerPageConfig((pre) => ({
            ...pre,
            skip: 0,
            take: currentPageSize,
            currentPage: 1,
            pageSize: currentPageSize
        }));

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
    };
    const handleDatePickerChange = ({ startDate, endDate, selectedType }) => {
        setIsChange(true);
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
                    templateCategoryId: prev?.filteration?.templateCategoryId,
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
                pageSize: currentPageSize
            };
        });
    };

    const handleTemplateClose = (status) => {
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

    return (
        <div className="position-relative">
            <div className="flex-row justify-content-end my23 py10 top-sub-heading">
                <ul className="rs-list-group-horizontal align-items-center">
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
                            pagerPageConfig={pagerPageConfig}
                            setPagerPageConfig={setPagerPageConfig}
                            onFilterChange={() => setIsChange(true)}
                        />
                    </li>
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
                                    // if(addAccess){
                                    setTemplateFlag({
                                        show: true,
                                        mode: 'create',
                                    });
                                    setTemplateName({ name: '', list: {} });
                                    // }
                                }}
                                // className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary ${addAccess ? '' : 'click-off'}`}
                                className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                id="rs_data_circle_plus_fill_edge"
                            ></i>
                        </RSTooltip>
                    </li>
                </ul>
            </div>
            <>
                {isLoading ? (
                    <Row className="mt15 mb15">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <SkeletonGalleryCard key={`loading-skeleton-${idx}`} isLoading={isLoading} />
                        ))}
                    </Row>
                ) : template && template?.items?.length > 0 ? (
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
                    <div className="box-design rs-clearfix">
                        <RSSkeletonTable
                            text={!isLoading}
                            message={
                                <>
                                    {isChange === true ? (
                                        <label>No data found</label>
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
                                                className={`${
                                                    circle_plus_fill_edge_medium
                                                } icon-md color-primary-blue mx5 icon-hover-shadow-primary ${
                                                    addAccess ? '' : 'click-off'
                                                }`}
                                                id="rs_data_circle_plus_fill_edge"
                                            ></i>
                                            to create your first web push template.
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
                // payloadData={type?.payload}
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
