import { getDateWithDaynoFormat, getUserCurrentFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';

import { globalStateSelector } from 'Utils/Selectors/app';
import { getSessionId } from 'Reducers/globalState/selector';
import { getVersarConsumption } from 'Reducers/preferences/consumptions/request';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

const VersarConsumption = () => {
    const { u_consumptionMM, u_consumptionYY } = useSelector((state) => globalStateSelector(state));
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [versarConsumptionData, setVersarConsumptionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });
    const [dateFilter, setDateFilter] = useState(() => {
        const end = new Date();
        const start = getDateWithDaynoFormat(LAST30DAYS_DATEFILTER);
        return { startDate: start, endDate: end };
    });
    const [searchText, setSearchText] = useState('');

    const fetchVersarConsumption = async (startDate, endDate, search = '') => {
        setIsLoading(true);
        const payload = {
            clientId,
            userId,
            departmentId,
            startDate: getYYMMDD(startDate),
            endDate: getYYMMDD(endDate),
            ...(search && search.trim() && { searchtext: search }),
        };
        const result = await dispatch(getVersarConsumption(payload));
        if (result?.status && result?.data) {
            setVersarConsumptionData({
                data: Array.isArray(result?.data) ? result?.data : [],
                totalConsumptionAmount: result.totalConsumptionAmount || 0,
            });
        } else {
            setVersarConsumptionData(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (departmentId && clientId && userId) {
            fetchVersarConsumption(dateFilter.startDate, dateFilter.endDate, searchText);
        }
    }, [departmentId, clientId, userId]);

    const handleDateFilter = (date) => {
        setDateFilter({
            startDate: date.startDate,
            endDate: date.endDate,
        });
        fetchVersarConsumption(date.startDate, date.endDate, searchText);
    };

    const handleSearchFilter = (searchName) => {
        setSearchText(searchName);
        fetchVersarConsumption(dateFilter.startDate, dateFilter.endDate, searchName);
    };

    const handleDownloadCSV = () => {
        if (!versarConsumptionData?.data || versarConsumptionData.data.length === 0) {
            return;
        }

        const csvData = versarConsumptionData.data.map((item) => ({
            'Category Name': item.CategoryName || '',
            'Cost': item.Cost || 0,
            'Valid Audience Count': item.ValidAudienceCount || 0,
            'Consumption Amount': item.ConsumptionAmount || 0,
            'Created Date': item.CreatedDate
                ? getUserCurrentFormat(new Date(item.CreatedDate))?.dateFormat || ''
                : '',
        }));

        const filename = `Versar Consumption Report_${getYYMM(dateFilter.startDate)}_${getYYMM(dateFilter.endDate)}`;
        downloadCSVcommasFileLangSupport(csvData, filename);
    };

    const gridColumns = [
        {
            field: 'CategoryName',
            title: 'Category Name',
            width: 250,
            filter: 'text',
            cell: ({ dataItem }) => (
                <TruncatedCell value={dataItem?.CategoryName || ''} />
            ),
        },
        {
            field: 'Cost',
            title: 'Cost',
            width: 120,
            filter: 'numeric',
            cell: ({ dataItem }) => (
                <TruncatedCell value={numberWithCommas(dataItem?.Cost || 0)} alignRight={true} />
            ),
        },
        {
            field: 'ValidAudienceCount',
            title: 'Valid Audience Count',
            width: 180,
            filter: 'numeric',
            cell: ({ dataItem }) => (
                <TruncatedCell value={numberWithCommas(dataItem?.ValidAudienceCount || 0)} alignRight={true} />
            ),
        },
        {
            field: 'ConsumptionAmount',
            title: 'Consumption Amount',
            width: 180,
            filter: 'numeric',
            cell: ({ dataItem }) => (
                <TruncatedCell value={numberWithCommas(dataItem?.ConsumptionAmount || 0)} alignRight={true} />
            ),
        },
        {
            field: 'CreatedDate',
            title: 'Created Date',
            width: 200,
            filter: 'date',
            cell: ({ dataItem }) => (
                <TruncatedCell
                    value={
                        dataItem?.CreatedDate
                            ? getUserCurrentFormat(new Date(dataItem?.CreatedDate))?.dateFormat || ''
                            : ''
                    }
                />
            ),
        },
    ];

        
    return (
        <Fragment>
            <ConsumptionChannelHeader
                setConsumptionChannelList={() => {}}
                setCustColumns={() => {}}
                paginationParams={paginationParams}
                setPaginationParams={setPaginationParams}
                onDateChange={handleDateFilter}
                onSearchChange={handleSearchFilter}
                onDownloadCSV={handleDownloadCSV}
            />
            <div className="mb70">
                <KendoGrid
                    data={versarConsumptionData?.data || []}
                    isLoading={isLoading}
                    isConsumption
                    scrollable={'scrollable'}
                    column={gridColumns}
                    autoResizeSize
                    settings={{ total: versarConsumptionData?.data?.length || 0 }}
                />
            </div>
        </Fragment>
    );
};

export default VersarConsumption;

