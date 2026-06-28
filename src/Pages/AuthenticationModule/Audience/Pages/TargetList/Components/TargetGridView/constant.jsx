import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { AUDIENCE_GRID_LABELS as L } from 'Pages/AuthenticationModule/Audience/audienceGridLabels';
import { AUDIENCE_GLYPH as G } from 'Pages/AuthenticationModule/Audience/audienceGlyphs';

import { numberWithCommas } from 'Utils/modules/formatters';
import RSTooltip from 'Components/RSTooltip';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { AUDIENCE_FOOTER_LABELS } from '../../../../audienceFooterLabels';
import { getAudienceFooterData } from '../Card/constant';

const DDL_AUDIENCE_FOOTER_DATA = getAudienceFooterData(false);

export const ALL_AUDIENCE_FOOTER_DATA = [
    AUDIENCE_FOOTER_LABELS.MATCH_INPUT_LIST_TARGET,
    AUDIENCE_FOOTER_LABELS.SUPPRESSION_INPUT_LIST_TARGET,
    // L.DATA_AUGMENTATION
];

const GRID_COLUMN_CONFIG = (
    handleAction,
    handleInfo,
    handleDuplicate,
    handleDownload,
    handleCGTG,
    handleMatchList,
    handleSuppressionList,
    handleEdit,
    handleApproval,
    handleView,
    handleDataAugmentation,
    handleDataArchive
) => [
    {
        field: 'recipientsBunchName',
        filter: 'text',
        width: 180,
        title: L.TABLE_LIST_NAME,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.recipientsBunchName}
            </td>
        ),
    },
    {
        field: 'createdName',
        filter: 'text',
        width: 200,
        title: L.CREATED_BY,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.createdName}
            </td>
        ),
    },
    {
        field: 'createdDate',
        filter: 'date',
        title: L.CREATED_ON,
        width: 200,
        cell: ({ dataItem, field }) => {
            // return <td>{getUserDateTimeFormat(dataItem?.[field] + ' UTC', 'formatDateTime')}</td>;
            return <td>{getUserCurrentFormat(dataItem?.[field], { isOffset: true })?.dateTimeFormat ?? ''}</td>;
        },
    },

    {
        field: 'recipientCount',
        filter: 'numeric',
        width: 150,
        title: L.SEG_AUDIENCE,
        cell: ({ dataItem, field }) => {
            const listType = dataItem?.listType;
            const recipientsBunchName = dataItem?.recipientsBunchName;
            const listMappingStatus = dataItem?.listMappingStatus;
            const recipientCount = dataItem?.[field];

            return (
                <td className="text-right position-relative">
                    <span>{(recipientCount ?? 0) > 0 ? numberWithCommas(recipientCount) : '0'}</span>
                </td>
            );
        },
    },
    {
        field: 'communicationsentCount',
        filter: 'numeric',
        width: 150,
        title: L.COMMUNICATION_SEND,
        cell: ({ dataItem, field }) => {
            return <td className="text-right">{(dataItem?.[field] ?? 0) > 0 ? numberWithCommas(dataItem?.[field]) : '0'}</td>;
            // return <td className="text-right">{numberWithCommas(dataItem?.[field])}</td>;
        },
    },
    {
        field: 'projectedReachRate',
        filter: 'text',
        title: L.AVERAGE_PROJECTED_REACH_RATE,
        width: 180,
        isTooltip: true,
        titleLength: 15,
        cell: ({ dataItem, field }) => {
            let rate =
                dataItem?.listType !== 5
                    ? 'NA'
                    : dataItem?.[field] === '' || dataItem?.[field] === undefined
                    ? 'NA'
                    : dataItem?.[field];

            return (
                <td className="text-right">{rate === 'NA' ? 'NA' : rate > 0 ? numberWithCommas(rate) + '%' : '0'}</td>
            );
        },
    },
    {
        field: 'action',
        title: L.ACTIONS,
        width: 210,
        sortable: false,
        cell: ({ dataItem }) => {
            const listType = dataItem?.listType;
            const recipientsBunchName = dataItem?.recipientsBunchName;
            const recipientCount = dataItem?.recipientCount;
            const listMappingStatus = dataItem?.listMappingStatus;
            const isRequestApproval = dataItem?.isRequestApproval;
            const approverStatus = dataItem?.approverStatus;

            return (
                <td style={{ overflow: 'inherit' }}>
                    <ul className="rs-list-inline rli-space-10 grid-L.VIEW-icons">
                        {/* L.VIEW Icon for specific conditions (like in card L.VIEW) */}
                        {recipientsBunchName !== 'All audience' && (listType === 5 || listType === 3) && (
                            <li>
                                <RSTooltip text={L.VIEW} position="top"  innerContent={false}>
                                    <div
                                        className={`${
                                            listMappingStatus === 9 || recipientCount === 0 ? 'pe-none click-off' : ''
                                        }`}
                                    >
                                        <i
                                            id="rs_data_eye"
                                            className={`${G.eye_medium} icon-md color-primary-blue`}
                                            onClick={() => handleView(dataItem)}
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                        )}

                        {/* L.EDIT/L.VIEW Icon */}
                        {recipientsBunchName !== 'All audience' ? (
                            <li>
                                <RSTooltip
                                    position="top"
                                    text={`${listType === 16 ? L.VIEW : L.EDIT}`}
                                >
                                    <div
                                        className={`${
                                            listType === 1 ||
                                            listType === 2 ||
                                            listType === 3 ||
                                            listType === 4 ||
                                            listType === 10 ||
                                            listMappingStatus === 0 ||
                                            listMappingStatus === 1
                                                ? 'pe-none click-off'
                                                : ''
                                        }`}
                                    >
                                        <i
                                            id="rs_data_circle_pencil"
                                            className={`${
                                                listType === 16 ? G.eye_medium : G.circle_pencil_medium
                                            } color-primary-blue icon-md`}
                                            onClick={() =>
                                                listType === 16 ? handleView(dataItem) : handleEdit(dataItem)
                                            }
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                        ) : null}

                        {/* Request Approval Icon */}
                        {isRequestApproval !== false && (
                            <li className={`${listType === 16 ? 'd-none' : ''}`}>
                                <RSTooltip
                                    position="top"
                                    text={
                                        approverStatus === 2
                                            ? L.LIST_REJECTED
                                            : approverStatus === 0
                                            ? L.LIST_APPROVAL_PENDING
                                            : L.LIST_APPROVED
                                    }
                                >
                                    <div
                                        className={`${
                                            listType !== 5 ||
                                            recipientsBunchName === 'All audience' ||
                                            isRequestApproval === false
                                                ? 'pe-none click-off'
                                                : ''
                                        }`}
                                    >
                                        <i
                                            onClick={() => handleApproval(dataItem)}
                                            id="rs_data_user_tick"
                                            className={`${
                                                approverStatus === 2
                                                    ? G.user_reject_medium
                                                    : approverStatus === 0
                                                    ? G.user_pending_medium
                                                    : G.user_tick_medium
                                            }  icon-md color-primary-blue`}
                                        />
                                    </div>
                                </RSTooltip>
                            </li>
                        )}

                        {/* Remove List Icon (for listType === 3) */}
                        {listType === 3 && (
                            <li onClick={() => handleAction(dataItem)}>
                                <RSTooltip position="top"  text={L.REMOVE_LIST}>
                                    <i
                                        id="rs_data_delete"
                                        className={`${G.delete_medium} icon-md color-primary-blue`}
                                    />
                                </RSTooltip>
                            </li>
                        )}
                        {/* L.INFO Icon */}
                        <li>
                            <RSTooltip position="top" text={L.INFO}>
                                <div
                                    className={`${
                                        (listType === 2 || listType === 4) && dataItem?.parentListId === 0 ||
                                        listType === 3 ||
                                        // listType === 1 ||
                                        listMappingStatus === 1 ||
                                        listMappingStatus === 0 ||
                                        recipientCount === 0
                                            ? 'pe-none click-off'
                                            : ''
                                    }`}
                                >
                                    <i
                                        className={`${G.circle_info_medium} color-primary-blue icon-md`}
                                        id="rs_data_circle_info"
                                        onClick={() => handleInfo(dataItem)}
                                    />
                                </div>
                            </RSTooltip>
                        </li>
                        {/* Dropdown Menu */}
                        <li className={listType === 16 ? 'd-none' : ''}>
                            <RSTooltip text={L.MORE}>
                                <div
                                    className={`${
                                        listType === 3 ||
                                        (((listType === 2 || listType === 4) && dataItem?.parentListId === 0)) ||
                                        listMappingStatus === 1
                                            ? 'pe-none click-off'
                                            : ''
                                    }`}
                                >
                                    {listType !== 1 && (
                                        <BootstrapDropdown
                                            containerClass={`${
                                                listMappingStatus === 0 ? 'pe-none click-off' : ''
                                            } grid-dropdown`}
                                            data={
                                                recipientsBunchName !== 'All audience'
                                                    ? (listType === 2 || listType === 4) && dataItem?.parentListId > 0
                                                        ? [L.DOWNLOADSHARE]
                                                        : getAudienceFooterData(dataItem?.isArchived)
                                                    : ALL_AUDIENCE_FOOTER_DATA
                                            }
                                            flatIcon
                                            alignRight
                                            defaultItem={
                                                <i
                                                    id="rs_PushWebGrid_arrowdown"
                                                    className={`${G.circle_arrow_down_medium} icon-md color-primary-blue`}
                                                />
                                            }
                                            showUpdate={false}
                                            disbleItems={[
                                                ...(listType === 10 ? [L.DOWNLOADSHARE] : []),
                                                ...(recipientCount < 5 ? [DDL_AUDIENCE_FOOTER_DATA[1]] : []),
                                            ]}
                                            onSelect={(e) => {
                                                if (e === L.DOWNLOADSHARE) {
                                                    handleDownload(dataItem);
                                                } else if (e === 'Duplicate') {
                                                    handleDuplicate(dataItem);
                                                } else if (e === 'Control group/target group') {
                                                    handleCGTG(dataItem);
                                                } else if (e === AUDIENCE_FOOTER_LABELS.MATCH_INPUT_LIST_TARGET) {
                                                    handleMatchList(dataItem);
                                                } else if (e === AUDIENCE_FOOTER_LABELS.SUPPRESSION_INPUT_LIST_TARGET) {
                                                    handleSuppressionList(dataItem);
                                                } else if (e === AUDIENCE_FOOTER_LABELS.DATA_AUGMENTATION_ENRICH) {
                                                    handleDataAugmentation(dataItem);
                                                } else if (e === AUDIENCE_FOOTER_LABELS.ARCHIVE || e === AUDIENCE_FOOTER_LABELS.UNARCHIVE) {
                                                    handleDataArchive(dataItem);
                                                }
                                            }}
                                            className="no_caret"
                                        />
                                    )}
                                </div>
                            </RSTooltip>
                        </li>
                    </ul>
                </td>
            );
        },
    },
];

export { GRID_COLUMN_CONFIG, DDL_AUDIENCE_FOOTER_DATA };
