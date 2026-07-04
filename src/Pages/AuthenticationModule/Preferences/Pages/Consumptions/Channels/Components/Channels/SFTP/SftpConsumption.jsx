import { getUserCurrentFormat, getYYMM } from 'Utils/modules/dateTime';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import ConsumptionChannelHeader from '../../ConsumptionChannelHeader/ConsumptionChannelHeader';


import { getSessionId } from 'Reducers/globalState/selector';
import { getSftpConsumption } from 'Reducers/preferences/consumptions/request';

const SftpConsumption = () => {
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));

    const [isLoading, setIsLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [paginationParams, setPaginationParams] = useState({
        skip: 0,
        take: 5,
        initialPagination: false,
    });
    const [dateFilter, setDateFilter] = useState(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { startDate: start, endDate: end };
    });
    const [searchText, setSearchText] = useState('');

    const fetchSftpConsumption = async () => {
        setIsLoading(true);
        const payload = { departmentId, clientId, userId };
        const result = await dispatch(getSftpConsumption(payload));
        const list = Array.isArray(result?.data)
            ? result?.data
            : Array.isArray(result?.data?.data)
                ? result?.data.data
                : [];
        setRows(list);
        setIsLoading(false);
    };

    useEffect(() => {
        if (departmentId && clientId && userId) {
            fetchSftpConsumption();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId, clientId, userId]);

    const filteredRows = useMemo(() => {
        const q = String(searchText || '').trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const hay = [
                r?.DownloadStatus,
                r?.SegmentDownloadID,
                r?.SegmentID,
                r?.TotalRecipientCount,
                r?.DownloadDateTime,
            ]
                .filter((x) => x != null)
                .join(' ')
                .toLowerCase();
            return hay.includes(q);
        });
    }, [rows, searchText]);

    const handleDateFilter = (date) => {
        // API doesn't currently support date filters; keep UI consistent with other channels
        setDateFilter({
            startDate: date.startDate,
            endDate: date.endDate,
        });
    };

    const handleSearchFilter = (searchName) => {
        setSearchText(searchName);
    };

    const handleDownloadCSV = () => {
        if (!filteredRows?.length) return;
        const csvData = filteredRows.map((item) => ({
            'Segment Download ID': item?.SegmentDownloadID ?? '',
            'Segment ID': item?.SegmentID ?? '',
            'Download Status': item?.DownloadStatus ?? '',
            'Total Recipient Count': item?.TotalRecipientCount ?? '',
            'Download Date Time': item?.DownloadDateTime
                ? getUserCurrentFormat(new Date(item.DownloadDateTime))?.dateFormat || ''
                : '',
        }));
        const filename = `SFTP Consumption_${getYYMM(dateFilter.startDate)}_${getYYMM(dateFilter.endDate)}`;
        downloadCSVcommasFileLangSupport(csvData, filename);
    };

    const gridColumns = [
        {
            field: 'SegmentDownloadID',
            title: 'Segment Download ID',
            width: 170,
            filter: 'numeric',
            cell: ({ dataItem }) => <TruncatedCell value={dataItem?.SegmentDownloadID ?? ''} alignRight={true} />,
        },
        {
            field: 'SegmentID',
            title: 'Segment ID',
            width: 140,
            filter: 'numeric',
            cell: ({ dataItem }) => <TruncatedCell value={dataItem?.SegmentID ?? ''} alignRight={true} />,
        },
        {
            field: 'DownloadStatus',
            title: 'Download Status',
            width: 140,
            filter: 'text',
            cell: ({ dataItem }) => <TruncatedCell value={dataItem?.DownloadStatus ?? ''} />,
        },
        {
            field: 'TotalRecipientCount',
            title: 'Total Recipient Count',
            width: 190,
            filter: 'numeric',
            cell: ({ dataItem }) => <TruncatedCell value={dataItem?.TotalRecipientCount ?? ''} alignRight={true} />,
        },
        {
            field: 'DownloadDateTime',
            title: 'Download Date Time',
            width: 220,
            filter: 'date',
            cell: ({ dataItem }) => (
                <TruncatedCell
                    value={
                        dataItem?.DownloadDateTime
                            ? getUserCurrentFormat(new Date(dataItem?.DownloadDateTime))?.dateFormat || ''
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
                    data={filteredRows || []}
                    isLoading={isLoading}
                    isConsumption
                    scrollable={'scrollable'}
                    column={gridColumns}
                    autoResizeSize
                    settings={{ total: filteredRows?.length || 0 }}
                />
            </div>
        </Fragment>
    );
};

export default SftpConsumption;

