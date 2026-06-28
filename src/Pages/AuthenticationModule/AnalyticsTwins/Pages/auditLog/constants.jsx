import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { process } from '@progress/kendo-data-query';

export const AUDIT_COLUMN_CONFIG = [
    {
        field: 'createdDate',
        filter: 'date',
        title: 'Date & time',
        width: 150,
        cell: ({ dataItem }) => {
            // const formattedDate = getUserDateTimeFormat(dataItem?.createdDate, 'formatDateTime');
            const formattedDate = getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormat ?? '';
            return (
                <td>
                 {formattedDate}
                </td>
            );
        },
    },
    {
        field: 'userName',
        filter: 'text',
        title: 'User name',
        width: 250,
        cell: ({ dataItem }) => {
            return (
                <td>
                   {dataItem?.userName}
                    <br />
                  {dataItem?.emailId}
                </td>
            );
        },
    },
    {
        field: 'module',
        filter: 'text',
        title: 'Module',
        width: 250,
        cell: ({ dataItem }) => (
            <td>
             {dataItem?.module}
            </td>
        ),
    },
    {
        field: 'description',
        filter: 'text',
        title: 'Description',
        width: 300,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.description}
            </td>
        ),
    },
];

export const PAGER_SETTINGS = {
    info: false,
    pageSizes: false,
    previousNext: true,
    buttonCount: 4,
    className: 'rs-kendo-pager',
};

export const GridNameHeader = (props) => {
    return <span>{props.title}</span>;
};

export const userDataState = (dataState) => {
    return {
        result: process(AUDIT_LOG_GRID.slice(0), dataState),
        dataState: dataState,
    };
};
