import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import DigiPopGrid from './Component/DigiPopGrid';
import DigiPopCreate from './Component/DigiPopCreate';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';

import { useDispatch, useSelector } from 'react-redux';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSSearchField from 'Components/RSSearchField';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { getSessionId } from 'Reducers/globalState/selector';
import { GetDigiPop_CreaiveNames } from 'Reducers/preferences/CommunicationSettings/request';
import { digipopType } from './constant';

export const DigipopProvider = createContext({
    payload: {},
    setPayload: () => {},
    setInitialPagination: () => {},
    initialPagination: {},
});

const Digipop = () => {
    const [gridCreate, setGridCreate] = useState({
        showGrid: true,
        digipopAction: {
            edit: {
                editState: [],
                isEdit: false,
            },
            create: false,
        },
    });
    const dispatch = useDispatch();
    const isFirstRender = useRef(true);

    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const [failedApi, setFailedApi] = useState('');
    const [initialPagination, setInitialPagination] = useState(false);
    const [dates, setDates] = useState({
        startDate: new Date(getDateWithDaynoFormat(-30)),
        endDate: new Date(),
        selectedDateText: 'Last 30 days',
    });
    const [isCloseSearch, setIsCloseSearch] = useState(false);
    const [payload, setPayload] = useState({
        userId,
        clientId,
        type: '',
        departmentId,
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
    });
    const value = { gridCreate, setGridCreate, payload, setPayload, setInitialPagination, initialPagination };

    const handleErrClose = () => {};
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setDates({
            startDate: new Date(getDateWithDaynoFormat(-30)),
            endDate: new Date(),
            selectedDateText: 'Last 30 days',
        });
        setIsCloseSearch(true);
        setPayload((pre) => ({
            userId,
            clientId,
            type: '',
            departmentId,
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
    }, [departmentId]);
    const searchListItems = [
        {
            id: 0,
            type: 'all',
            name: 'All',
        },
        ...digipopType,
    ];
    const defaultItemInSearchValue = useMemo(() => {
        return {
            id: 0,
            type: 'all',
            name: 'All',
        };
    }, []);

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
    return (
        <DigipopProvider.Provider value={value}>
            <div className="rsv-tabs-content">
                {gridCreate.showGrid ? (
                    <div className="box-design bd-top-border">
                        {/* Content starts */}
                        <div className="rs-sub-heading">
                            <div className="align-items-center d-flex justify-content-between">
                                <h4 className="mb0">Digipop</h4>
                                <ul className="rs-list-group-horizontal">
                                    <li className='ml15'>
                                        <RSDateRangePicker
                                            onDatePickerClosed={handleDatePickerChange}
                                            startDate={dates?.startDate}
                                            endDate={dates?.endDate}
                                            selectedDateText={dates?.selectedDateText}
                                            isTemplate
                                        />
                                    </li>
                                    <li className='ml15'>
                                        <RSBootstrapdown
                                            data={searchListItems}
                                            isObject
                                            fieldKey="name"
                                            isActive
                                            alignRight
                                            defaultItem={defaultItemInSearchValue}
                                            onSelect={handleSearchDropdown}
                                        />
                                    </li>
                                    <li className='ml15'>
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
                                    <li className='ml15'>
                                        {' '}
                                        <div
                                            onClick={() => {
                                                if (addAccess) {
                                                    setGridCreate((prev) => ({
                                                        ...prev,
                                                        showGrid: false,
                                                        digipopAction: {
                                                            edit: {
                                                                editState: [],
                                                                isEdit: false,
                                                            },
                                                            create: true,
                                                        },
                                                    }));
                                                }
                                            }}
                                        >
                                            <RSTooltip text="Add" position="top" className="lh0">
                                                <i
                                                    id="rs_data_circle_plus_fill_edge"
                                                    className={`icon-lg color-primary-blue icon-hover-shadow-primary ${
                                                        circle_plus_fill_edge_large
                                                    } ${!addAccess ? 'click-off' : ''}`}
                                                ></i>
                                            </RSTooltip>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <DigiPopGrid />
                    </div>
                ) : (
                    <DigiPopCreate
                        config={gridCreate.digipopAction.edit.editState}
                        type={gridCreate.digipopAction.edit.isEdit ? 'edit' : 'create'}
                        handleCancel={(status) => {
                            if (status) {
                                setGridCreate((prev) => ({
                                    ...prev,
                                    showGrid: status,
                                    digipopAction: {
                                        edit: {
                                            editState: [],
                                            isEdit: false,
                                        },
                                        create: false,
                                    },
                                }));
                            }
                        }}
                        setFailedApi={setFailedApi}
                    />
                )}
                {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
            </div>
        </DigipopProvider.Provider>
    );
};

export default Digipop;
