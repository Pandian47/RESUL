import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { campaignProgressStatus } from 'Utils/modules/communicationStatus';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';


export const notificationConfig = [
        {
        field: 'createdDate',
        filter: 'date',
        title: 'Date/Time',
        cell: ({ dataItem }) => {
            // return <td>{getUserDateTimeFormat(dataItem?.createdDate, 'formatDateTime')}</td>;
            return <td>{getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormat}</td>;
        },
        width: 200,
    },
    {
        field: 'taskID',
         filter: 'text',
        title: 'Task ID',
        width: 220,
      
    },
     {
        field: 'module',
         filter: 'text',
        title: 'Module',
        width: 200,
    },
    {
        field: 'description',
         filter: 'text',
        title: 'Description',
        width: 200,
        cell: ({ dataItem }) => {
            let notificationType = campaignProgressStatus[dataItem?.notificationTypeID];
            return (
                <td className="d-flex align-items-center">
                    <div className={`${notificationType?.rsClass} mr10`}>
                        <i className={`${notificationType?.rsIcon} icon-md ${notificationType?.color}`} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <TruncateCell value={dataItem?.description || ''} noTable={true} />
                    </div>
                </td>
            );
        },
    },
    {
        field: 'status',
         filter: 'text',
        title: 'Status',
        width: 100,
    },
];
