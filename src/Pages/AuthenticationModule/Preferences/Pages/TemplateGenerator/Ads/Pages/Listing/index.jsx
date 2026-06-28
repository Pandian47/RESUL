import { getUserDetails } from 'Utils/modules/crypto';
import { getDateWithDaynoFormat, getYYMMDD, convertToUserTimezone } from 'Utils/modules/dateTime';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, createContext, useEffect, useMemo, useState } from 'react';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { Container } from 'react-bootstrap';

import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';

import { useSelector } from 'react-redux';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSSearchField from 'Components/RSSearchField';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { getSessionId } from 'Reducers/globalState/selector';
import { digipopType } from '../../constant';
import AdsGridView from './GridView.jsx';
import { useNavigate } from 'react-router-dom';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';

export const AdsListingProvider = createContext({
    payload: {},
    setPayload: () => {},
    initialPagination: {},
    setInitialPagination: () => {},
});

const AdsListing = ({ currentUserId }) => {
    const { licenseTypeId } = getUserDetails();
    const { departmentId, clientId, departmentName } = useSelector((state) => getSessionId(state));
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};

    const navigate = useNavigate();

    const [initialPagination, setInitialPagination] = useState(false);
    
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
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const searchListItems = [
        {
            id: 0,
            type: 'all',
            name: 'All',
        },
        ...digipopType,
    ];
    const [payload, setPayload] = useState({
        clientId,
        type: '',
        departmentId,
        partnerId: 41,
        filteration: {
            creativeName: '',
            startDate: getYYMMDD(getTimezoneAdjustedStartDate()),
            endDate: getYYMMDD(getTimezoneAdjustedEndDate()),
        },
        pagination: {
            pageNo: 1,
            recordLimit: 5,
        },
        isFilter: true,
    });

    const handleFilterSearch = async (value) => {
        const searchPayload = {
            clientId,
            departmentId,
            userId,
            partnerId: 41,
            searchText: value,
        };
        const response = await dispatch(GetDigiPop_CreaiveNames(searchPayload));
        if (response?.status) {
            return response?.data;
        } else {
            return [];
        }
    };
    const handleListItemClick = (item) => {
        setInitialPagination(true);
        setPayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                creativeName: item,
                startDate: pre?.filteration?.startDate,
                endDate: pre?.filteration?.endDate,
            },
            pagination: {
                pageNo: 1,
                recordLimit: 5,
            },
        }));
    };
    const handleSearchDropdown = (item) => {
        setInitialPagination(true);
        setIsCloseSearch(true);
        setPayload((prev) => ({
            ...prev,
            type: item?.type === 'all' ? '' : item?.type,
            filteration: {
                ...prev.filteration,
                creativeName: '',
            },
            pagination: {
                pageNo: 1,
                recordLimit: 5,
            },
        }));
    };
    const handleDatePickerChange = ({ startDate, endDate }) => {
        setInitialPagination(true);
        setPayload((prev) => ({
            ...prev,
            filteration: {
                ...prev?.filteration,
                startDate: getYYMMDD(startDate),
                endDate: getYYMMDD(endDate),
            },
            pagination: {
                pageNo: 1,
                recordLimit: 5,
            },
        }));
    };
    const handleSearchClose = () => {
        setInitialPagination(true);
        setPayload((pre) => ({
            ...pre,
            isFilter: true,
            filteration: {
                ...pre.filteration,
                creativeName: '',
            },
            pagination: {
                pageNo: 1,
                recordLimit: 5,
            },
        }));
    };

    const defaultItemInSearchValue = useMemo(() => {
        return {
            id: 0,
            type: 'all',
            name: 'All',
        };
    }, []);
    const [selectedItem, setSelectedItem] = useState(defaultItemInSearchValue);
    useEffect(() => {
        setInitialPagination(true);
        setDates({
            startDate: new Date(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: new Date(),
            selectedDateText: 'Last 30 days'
        })
        setSelectedItem({ ...defaultItemInSearchValue });
        setPayload((pre) => ({
            ...pre,
            clientId: clientId,
            type: '',
            departmentId: departmentId,
            partnerId: 41,
            filteration: {
                creativeName: '',
                startDate: getYYMMDD(getDateWithDaynoFormat(-30)),
                endDate: getYYMMDD(new Date()),
            },
            pagination: {
                pageNo: 1,
                recordLimit: 5,
            },
            isFilter: true,
        }));
    }, [departmentId, clientId]);
    useEffect(() => {
        setPayload((pre) => ({
            ...pre,
            userId: currentUserId,
        }));
    }, [currentUserId]);

    const contextValue = { payload, setPayload, setInitialPagination, initialPagination };

    return (
        <AdsListingProvider.Provider value={contextValue}>
            <Fragment>
                {/* Main page content block starts */}
                <Container className="page-content px0 mt4">
                    {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                        <>
                            <div className="mt15">
                                <RSSkeletonTable text={true} />
                            </div>
                        </>
                    ) : (
                        <section>
                            <div className="rs-sub-heading mb0">
                                <div className="align-items-center d-flex justify-content-between mt21 top-sub-heading">
                                    <h4 className="mb0"></h4>
                                    <ul className="rs-list-group-horizontal">
                                        <li className="ml15">
                                            <RSDateRangePicker
                                                onDatePickerClosed={handleDatePickerChange}
                                                startDate={dates?.startDate}
                                                endDate={dates?.endDate}
                                                selectedDateText={dates?.selectedDateText}
                                                isTemplate
                                            />
                                        </li>
                                        <li className="ml15">
                                            <RSBootstrapdown
                                                data={searchListItems}
                                                isObject
                                                fieldKey="name"
                                                isActive
                                                alignRight
                                                defaultItem={selectedItem}
                                                onSelect={handleSearchDropdown}
                                            />
                                        </li>
                                        <li className="ml15">
                                            <RSSearchField
                                                isCloseSearch={isCloseSearch}
                                                setIsCloseSearch={setIsCloseSearch}
                                                handleFilterSearch={handleFilterSearch}
                                                handleListItemClick={handleListItemClick}
                                                debounceOnChange
                                                fieldKey="listName"
                                                handleSearchClose={handleSearchClose}
                                                isSearchFilter
                                            />
                                        </li>
                                        <li className={`ml15 ${addAccess ? '' : 'click-off'}`}>
                                            <div
                                                onClick={() => {
                                                    if(addAccess){
                                                        navigate('create_ads', {
                                                            state: {
                                                                currentEditId: null,
                                                            },
                                                        });
                                                    }
                                                }}
                                            >
                                                <RSTooltip text="Add" position="top" className="lh0">
                                                    <i
                                                        id="rs_data_circle_plus_fill_edge"
                                                        className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                                            circle_plus_fill_edge_large
                                                        } ${false ? 'click-off' : ''}`}
                                                    ></i>
                                                </RSTooltip>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <AdsGridView />
                            </div>
                        </section>
                    )}
                </Container>

                {/* Main page content block ends */}
            </Fragment>
        </AdsListingProvider.Provider>
    );
};

export default AdsListing;
