import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { download_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import { CONSUMABLE_INVOICE_GRID_DATA } from './constants';
import { numberWithCommas } from 'Utils/modules/formatters';


const ConsumablesInvoice = () => {
    const navigate = useNavigate();
    const [isShowSkeleton, setIsShowSkeleton] = useState(false);
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page content block starts */}
            <Container className="page-content px0 mt-50">
                {isShowSkeleton ? (
                    <RSSkeletonTable count={5} />
                ) : (
                    <div>
                        {/* filter value ["text","numeric","boolean","date"]. */}
                        <KendoGrid
                            data={CONSUMABLE_INVOICE_GRID_DATA}
                            column={[
                                {
                                    field: 'campaignName',
                                    filter: 'text',
                                    title: 'Communication name',
                                    width: 220,
                                    cell: ({ dataItem }) => (
                                        <td>
                                            {dataItem?.campaignName?.length > 20 ? (
                                                <RSTooltip
                                                    text={dataItem?.campaignName}
                                                    position="top"
                                                    className="d-inline-block"
                                                    innerContent={false}
                                                >
                                                    <span className="m0">
                                                        {truncateTitle(dataItem?.campaignName, 20)}
                                                    </span>
                                                </RSTooltip>
                                            ) : (
                                                <span className="m0">{dataItem?.campaignName}</span>
                                            )}
                                        </td>
                                    ),
                                },
                                {
                                    field: 'invoiceNo',
                                    filter: 'text',
                                    title: 'Invoice number',
                                    cell: ({ dataItem }) => (
                                        <td>
                                            {dataItem?.invoiceNo?.length > 15 ? (
                                                <RSTooltip
                                                    text={dataItem?.invoiceNo}
                                                    position="top"
                                                    className="d-inline-block"
                                                    innerContent={false}
                                                >
                                                    <span className="m0">{truncateTitle(dataItem?.invoiceNo, 15)}</span>
                                                </RSTooltip>
                                            ) : (
                                                <span className="m0">{dataItem?.invoiceNo}</span>
                                            )}
                                        </td>
                                    ),
                                },
                                {
                                    field: 'invoiceDateTime',
                                    filter: 'text',
                                    title: 'Invoice date',
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field])}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                {
                                    field: 'totalAmount',
                                    filter: 'text',
                                    title: 'Amount (USD)',
                                    cell: ({ dataItem, field }) => {
                                        return <td className="text-end"> {'$' + numberWithCommas(dataItem?.[field])}</td>;
                                    },
                                },
                                {
                                    field: 'paymentMode',
                                    filter: 'text',
                                    title: 'Payment mode',
                                },
                                {
                                    field: 'status',
                                    filter: 'text',
                                    title: 'Status',
                                    width: 120,
                                    cell: ({ dataItem }) => {
                                        return (
                                            <td>
                                                <span
                                                    className={`${
                                                        dataItem?.status.toLowerCase() === 'paid'
                                                            ? 'rs-badge-success'
                                                            : 'rs-badge-danger'
                                                    }`}
                                                >
                                                    {dataItem?.status}
                                                </span>
                                            </td>
                                        );
                                    },
                                },
                                {
                                    field: 'dueDate',
                                    filter: 'text',
                                    title: 'Due date',
                                    cell: ({ dataItem, field }) => {
                                        // return <td>{dateFormat(dataItem?.[field])}</td>;
                                        return <td>{getUserCurrentFormat(dataItem?.[field])?.dateFormat}</td>;
                                    },
                                },
                                {
                                    field: 'action',
                                    title: 'Action',
                                    width: 120,
                                    cell: () => {
                                        return (
                                            <td>
                                                <ul className="rs-list-inline rli-space-15">
                                                    <li>
                                                        <RSTooltip text="View" position="top" className="lh0">
                                                            <i
                                                                className={`${eye_medium} icon-md color-primary-blue`}
                                                                id="rs_data_eye"
                                                            ></i>
                                                        </RSTooltip>
                                                    </li>
                                                    <li>
                                                        <RSTooltip text="Download invoice" position="top" className="lh0">
                                                            <i
                                                                id="rs_data_download"
                                                                className={`${download_medium}  icon-md color-primary-blue`}
                                                            ></i>
                                                        </RSTooltip>
                                                    </li>
                                                </ul>
                                            </td>
                                        );
                                    },
                                },
                            ]}
                        />
                    </div>
                )}
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default ConsumablesInvoice;
