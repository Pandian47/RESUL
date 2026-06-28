import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { truncateTitle } from 'Utils/modules/displayCore';
import { AUDIENCE_GRID_LABELS as L } from 'Pages/AuthenticationModule/Audience/audienceGridLabels';
import { AUDIENCE_FOOTER_LABELS } from 'Pages/AuthenticationModule/Audience/audienceFooterLabels';
import { AUDIENCE_GLYPH as G } from 'Pages/AuthenticationModule/Audience/audienceGlyphs';
import RSTooltip from 'Components/RSTooltip';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
const DDL_AUDIENCE_FOOTER_DATA = [
    AUDIENCE_FOOTER_LABELS.DUPLICATE,
    AUDIENCE_FOOTER_LABELS.DOWNLOAD,
    AUDIENCE_FOOTER_LABELS.ARCHIVE,
];

const GRID_COLUMN_CONFIG = (handleInfo, handleEdit, handleApproval, handleDuplicate, handleDownload, userId,handleArchive) => [
    {
        field: 'dynamicListName',
        title: L.TABLE_LIST_NAME,
        filter: 'text',
        width: 350,
        cell: ({ dataItem, field }) => {
            return (
                <td>
                    {dataItem?.[field]?.length > 40 ? (
                        <RSTooltip text={dataItem?.[field]} position="top">
                            <span>{truncateTitle(dataItem?.[field], 40)}</span>
                        </RSTooltip>
                    ) : (
                        <span>{dataItem?.[field]}</span>
                    )}
                </td>
            );
        },
    },
    {
        field: 'createdName',
        title: L.CREATED_BY,
        filter: 'text',
        width: 250,
        cell: ({ dataItem, field }) => (
            <td>
                {dataItem?.[field]?.length > 25 ? (
                    <RSTooltip text={dataItem?.[field]} position="top">
                        <span>{truncateTitle(dataItem?.[field], 25)}</span>
                    </RSTooltip>
                ) : (
                    <span>{dataItem?.[field]}</span>
                )}
            </td>
        ),
    },
    {
        field: 'createdDate',
        title: L.CREATED_ON,
        filter: 'date',
        width: 200,
        cell: ({ dataItem, field }) => {
            // return <td>{dateTimeFormat(dataItem?.[field] + ' UTC', 'formatDateTime')}</td>;
            return <td>{getUserCurrentFormat(dataItem?.[field], { isOffset: true })?.dateTimeFormat ?? ''}</td>;
        },
    },
    {
        //field: 'audienceCount',
        //title: 'Audience',
        field: 'blastedCount',
        title: L.COMMUNICATION_SEND,
        filter: 'numeric',
        width: 200,
        cell: ({ dataItem, field }) => {
            return <td className="text-right">{(dataItem?.[field] ?? 0) > 0 ? numberWithCommas(dataItem?.[field]) : '0'}</td>;
        },
    },
    {
        field: 'action',
        title: L.ACTION,
        width: 210,
        cell: ({ dataItem }) => {
            const dynamicListName = dataItem?.dynamicListName;
            const dynamicListId = dataItem?.dynamicListId;
            const status = dataItem?.status;
            const isRequestApproval = dataItem?.isRequestApproval;
            const approverStatus = dataItem?.approverStatus;
            const view_Edit =
                dataItem?.isAdhoclist || dataItem?.isRequestApproval === 0 || dataItem?.createdBy !== userId;

            return (
                <td style={{ overflow: 'inherit' }}>
                    <ul className="rs-list-inline rli-space-10 grid-view-icons">
                        {/* Edit/View Icon */}
                        <li>
                            <RSTooltip position="top"  text={`${view_Edit ? L.VIEW : L.EDIT}`}>
                                <div className={dynamicListName === 'All audience' ? 'pe-none click-off' : ''}>
                                    <i
                                        id="rs_data_circle_pencil"
                                        className={`${
                                            view_Edit ? G.eye_medium : G.circle_pencil_medium
                                        } color-primary-blue icon-md`}
                                        onClick={() => handleEdit(dataItem)}
                                    />
                                </div>
                            </RSTooltip>
                        </li>

                        {/* Request Approval Icon */}
                        <li>
                            <RSTooltip
                                position="top"
                                text={`${
                                    approverStatus === 0
                                        ? L.PENDING_FOR_APPROVAL
                                        : approverStatus === 1
                                        ? L.REQUEST_APPROVED
                                        : L.REQUEST_REJECTED
                                }`}
                            >
                                <div className={isRequestApproval === 0 ? 'pe-none click-off' : ''}>
                                    <i
                                        onClick={() => handleApproval(dataItem)}
                                        className={`${
                                            isRequestApproval === 0
                                                ? G.user_medium
                                                : approverStatus === 0
                                                ? G.user_pending_medium
                                                : approverStatus === 1
                                                ? G.user_tick_medium
                                                : G.user_reject_medium
                                        } color-primary-blue icon-md`}
                                    />
                                </div>
                            </RSTooltip>
                        </li>
                        {/* Info Icon */}
                        <li>
                            <RSTooltip position="top" text={L.INFO}>
                                <div className={`${dataItem?.blastedCount === 0 ? 'pe-none click-off' : ''}`}>
                                    <i
                                        className={`${G.circle_info_medium} color-primary-blue icon-md`}
                                        id="rs_data_circle_info"
                                        onClick={() => handleInfo(dataItem)}
                                    />
                                </div>
                            </RSTooltip>
                        </li>
                        {/* Dropdown Menu */}
                        <li>
                            <BootstrapDropdown
                                containerClass="grid-dropdown"
                                data={DDL_AUDIENCE_FOOTER_DATA}
                                flatIcon
                                alignRight
                                defaultItem={
                                    <i
                                        id="rs_PushWebGrid_arrowdown"
                                        className={`${G.circle_arrow_down_medium} icon-md color-primary-blue`}
                                    />
                                }
                                showUpdate={false}
                                onSelect={(e) => {
                                    if (e === AUDIENCE_FOOTER_LABELS.DUPLICATE) {
                                        handleDuplicate(dataItem);
                                    } else if (e === AUDIENCE_FOOTER_LABELS.DOWNLOAD) {
                                        handleDownload(dataItem);
                                    } else if (e === AUDIENCE_FOOTER_LABELS.ARCHIVE) {
                                        handleArchive(dataItem);
                                    }
                                }}
                                className="no_caret"
                            />
                        </li>
                    </ul>
                </td>
            );
        },
    },
];

export { GRID_COLUMN_CONFIG, DDL_AUDIENCE_FOOTER_DATA };
