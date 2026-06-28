import { DESTINATION, LINKS_ACTIVE, NO_OF_CHANNELS, SMART_LINKS_USED, SMART_LINK_NAME_COLUMN, SMART_LINK_SUMMARY, SMART_LINK_SUMMARY_EMPTY, STATUS, TOTAL_EMBEDDINGS } from 'Constants/GlobalConstant/Placeholders';
import { close_medium, tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import RSModal from 'Components/RSModal';
import KendoGrid from 'Components/RSKendoGrid';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import { buildSmartLinkSummaryRows, buildSmartLinkSummaryStats } from './buildSmartLinkSummaryData';

const channelTickColumn = (field, title) => ({
    field,
    title,
    width: 72,
    truncate: false,
    isTooltip: true,
    cell: ({ dataItem }) => {
        const v = dataItem?.[field];
        return (
            <td className="text-center">
                {v === true ? <i className={`${tick_medium} icon-md color-primary-green`} /> : null}
                {v === 'x' ? <i className={`${close_medium} icon-md color-primary-red`} /> : null}
            </td>
        );
    },
});

const SMART_LINK_SUMMARY_COLUMNS = [
    {
        field: 'smartLinkName',
        title: SMART_LINK_NAME_COLUMN,
        truncate: false,
        width: 150,
        cell: ({ dataItem }) => (
            <td>
                <div className="font-semi-bold"> <TruncatedCell noTable value={dataItem?.smartLinkName}/>
                    </div>
                <small className="color-secondary-grey d-block"><TruncatedCell noTable value={dataItem?.smartLinkUrl} /></small>
            </td>
        ),
    },
    {
        field: 'destination',
        title: DESTINATION,
        truncate: false,
        width: 150,
        cell: ({ dataItem }) => (
            <td className="color-primary-blue" style={{ minWidth: 0 }}>
                <TruncatedCell noTable value={dataItem?.destination} />
            </td>
        ),
    },
    channelTickColumn('email', 'Email'),
    channelTickColumn('sms', 'SMS'),
    channelTickColumn('whatsapp', 'WhatsApp'),
    channelTickColumn('rcs', 'RCS'),
    channelTickColumn('notification', 'Web notification'),
    channelTickColumn('mobileNotification', 'Mobile notification'),
    channelTickColumn('qr', 'QR'),
    channelTickColumn('facebook', 'Facebook'),
    channelTickColumn('instagram', 'Instagram'),
    channelTickColumn('linkedin', 'LinkedIn'),
    channelTickColumn('paidMedia', 'Paid Media'),
    channelTickColumn('webAnalytics', 'Web Analytics'),
    // channelTickColumn('orm', 'ORM'),
    // channelTickColumn('vms', 'VMS'),
    // channelTickColumn('voice', 'Voice'),
    // channelTickColumn('line', 'Line'),
    {
        field: 'status',
        title: STATUS,
        width: 80,
        truncate: false,
        cell: ({ dataItem }) => (
            <td>
                {dataItem?.status === 'Active' ? (
                    <span className="badge bg-success text-white">{dataItem?.status}</span>
                ) : (
                    <span className="badge bg-secondary text-white">{dataItem?.status}</span>
                )}
            </td>
        ),
    },
];

const STAT_LABELS = {
    channels: NO_OF_CHANNELS,
    embeddings: TOTAL_EMBEDDINGS,
    used: SMART_LINKS_USED,
    active: LINKS_ACTIVE,
};

const SmartLinkSummaryModal = ({ show, handleClose, channelDetailsList }) => {
    const gridData = useMemo(() => buildSmartLinkSummaryRows(channelDetailsList), [channelDetailsList]);
    const stats = useMemo(() => buildSmartLinkSummaryStats(channelDetailsList, gridData), [channelDetailsList, gridData]);

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={SMART_LINK_SUMMARY}
            size="xlg"
            body={
                <>
                    <Row className="mb15">
                        {stats.map((row) => (
                            <Col md={6} key={row.key} className="mb15">
                                <div className="d-flex justify-content-between px5">
                                    <span className="color-secondary-black">{STAT_LABELS[row.key]}</span>
                                    <span className="font-semi-bold">{row.value}</span>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    {gridData.length ? (
                        <KendoGrid
                            data={gridData}
                            column={SMART_LINK_SUMMARY_COLUMNS}
                            pageable={false}
                            sortable={false}
                            noBoxShadow
                            settings={{ total: gridData.length }}
                            config={{
                                take: 20,
                                skip: 0,
                            }}
                            scrollable={'scrollable'}
                        />
                    ) : (
                        <p className="color-secondary-grey mb0">{SMART_LINK_SUMMARY_EMPTY}</p>
                    )}
                </>
            }
        />
    );
};

export default SmartLinkSummaryModal;
