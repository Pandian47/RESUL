import { ResulticksLogoBlue } from 'Assets/Images';
import { ACCOUNT_CLIENT, ACCOUNT_NO, AMOUNT, AMOUNT_PAYABLE, BILLING_RESUL, DATE_TIME, DISCOUNT, DUE_DATE, ENTERED_BY, INVOICE_NUMBER, IN_CASE_OF_CLARIFICATION, PAYABLE_AMOUNT, PAYMENT_AUTH_CODE, PAYMENT_DETAILS_1, PAYMENT_DETAILS_2, PAYMENT_FREQUENCY, PRICE_MO, PRICING_MENTIONED_ABOVE, QUERIES, RESUL_SINGAPORE_ADDRESS, SUB_TYPE, THANK_YOU, TYPE, USD } from 'Constants/GlobalConstant/Placeholders';
import { download_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas, numberWithCommasformatCurrency } from 'Utils/modules/formatters';
import { get_invoiceList, get_invoiceListbyID } from 'Reducers/preferences/invoices/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { PDFExport } from '@progress/kendo-react-pdf';
const SubscriptionInvoice = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [invoiceData, setinvoiceData] = useState([]);
    const [isInvoiceListLoading, setIsInvoiceListLoading] = useState(true);
    const [isInitalPagination, setIsInitalPagination] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const pdfExportComponent = useRef(null);
    const [invoiceDetails, setInvoiceDetails] = useState({});
    const [isPdfExportPending, setIsPdfExportPending] = useState(false);

    const exportPDFWithComponent = useCallback(() => {
        if (pdfExportComponent.current) {
            pdfExportComponent.current.save();
        }
    }, []);

    useEffect(() => {
        if (!isPdfExportPending || !invoiceDetails?.InvoiceNo) {
            return undefined;
        }

        let cancelled = false;

        const runExport = async () => {
            const logoEl = document.getElementById('subscription-invoice-pdf-logo');
            if (logoEl && !logoEl.complete) {
                await new Promise((resolve) => {
                    logoEl.onload = resolve;
                    logoEl.onerror = resolve;
                });
            }

            await new Promise((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            });

            if (cancelled) {
                return;
            }

            exportPDFWithComponent();
            setIsPdfExportPending(false);
        };

        runExport();

        return () => {
            cancelled = true;
        };
    }, [isPdfExportPending, invoiceDetails, exportPDFWithComponent]);

    const getInvoiceIDData = async (invoiceId) => {
        const payload = { departmentId, clientId, userId, invoiceId };
        let { status, data } = await dispatch(get_invoiceListbyID({ payload }));
        if (status) {
            setInvoiceDetails(data);
            setIsPdfExportPending(true);
        } else {
            setInvoiceDetails({});
            setIsPdfExportPending(false);
        }
    };

    const handleDownloadInvoice = (dataItem) => {
        // Using clientId to match the View action behavior
        // If your API uses a different field (like invoiceId or id), update this accordingly
        const invoiceId = dataItem?.invoiceId || dataItem?.id || dataItem?.clientId;
        if (invoiceId) {
            getInvoiceIDData(invoiceId);
        }
    };
    const getInvoiceListData = async () => {
        setIsInvoiceListLoading(true);
        try {
            const payload = { departmentId, clientId, userId };
            const { status, data } = await dispatch(get_invoiceList(payload));
            if (status && Array.isArray(data)) {
                setinvoiceData(data);
            } else {
                setinvoiceData([]);
            }
        } finally {
            setIsInvoiceListLoading(false);
        }
    };
    useEffect(() => {
        setIsInitalPagination(true);
    }, [departmentId]);

    useEffect(() => {
        getInvoiceListData();
    }, [departmentId]);
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page content block starts */}
            <Container className="page-content px0 mt-50">
                <div>
                    <KendoGrid
                        data={invoiceData}
                        isLoading={isInvoiceListLoading}
                        settings={{
                            total: invoiceData?.length,
                        }}
                        pageable={true}
                        setInitialPagination={setIsInitalPagination}
                        pagerChange={isInitalPagination}
                        column={[
                            {
                                field: 'invoiceNumber',
                                filter: 'text',
                                title: 'Invoice number',
                                cell: ({ dataItem }) => (
                                    <td>
                                        {dataItem?.invoiceNumber?.length > 20 ? (
                                            <RSTooltip
                                                text={dataItem?.invoiceNumber}
                                                position="top"
                                                className="d-inline-block"
                                                innerContent={false}
                                            >
                                                <span className="m0">
                                                    {dataItem?.invoiceNumber?.substring(0, 17) + '...'}
                                                </span>
                                            </RSTooltip>
                                        ) : (
                                            <span className="m0">{dataItem?.invoiceNumber}</span>
                                        )}
                                    </td>
                                ),
                            },
                            {
                                field: 'invoiceDate',
                                filter: 'date',
                                title: 'Invoice date',
                                cell: (props) => {
                                    // return <td>{dateFormat(props.dataItem[props.field])}</td>;
                                    return <td>{getUserCurrentFormat(props.dataItem[props.field])?.dateFormat}</td>;
                                },
                            },
                            {
                                field: 'amount(USD)',
                                filter: 'text',
                                title: 'Amount (USD)',
                                cell: (props) => {
                                    return <td className=""> {'$' + numberWithCommas(props.dataItem[props.field])}</td>;
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
                                cell: (props) => {
                                    const getData = props?.dataItem?.Status == 0 ? 'Paid' : 'Not paid';
                                    return (
                                        <td className="">
                                            {getData}
                                            {/* <span
                                                    className={`${
                                                        props.dataItem?.status.toLowerCase() === 'paid'
                                                            ? 'rs-badge-success'
                                                            : 'rs-badge-danger'
                                                    }`}
                                                >
                                                    {props.dataItem?.status}
                                                </span> */}
                                        </td>
                                    );
                                },
                            },
                            {
                                field: 'dueDate',
                                filter: 'date',
                                title: 'Due date',
                                cell: (props) => {
                                    // return <td>{dateFormat(props.dataItem[props.field])}</td>;
                                    return <td>{getUserCurrentFormat(props.dataItem[props.field])?.dateFormat}</td>;
                                },
                            },
                            {
                                field: 'action',
                                title: 'Action',
                                width: 120,
                                cell: (props) => {
                                    return (
                                        <td>
                                            <ul className="rs-list-inline rli-space-15">
                                                <li
                                                    onClick={() => {
                                                        const state = {
                                                            index: 1,
                                                            data: props.dataItem?.clientId,
                                                        };
                                                        let url = '/preferences/invoice-list/invoice';
                                                        const encryptState = encodeUrl(state);
                                                        navigate(`${url}?q=${encryptState}`, {
                                                            state,
                                                        });
                                                    }}
                                                >
                                                    <RSTooltip text="View" position="top" className="lh0">
                                                        <i
                                                            className={`${eye_medium} icon-md color-primary-blue`}
                                                            id="rs_data_eye"
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                                <li
                                                    onClick={() => handleDownloadInvoice(props.dataItem)}
                                                    style={{ cursor: 'pointer' }}
                                                >
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

                {/* Off-screen PDF export — must stay mounted so Kendo can capture layout (prod was blank with mount + 50ms save) */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        left: '-10000px',
                        top: 0,
                        width: '210mm',
                        zIndex: -1,
                        pointerEvents: 'none',
                    }}
                >
                    <PDFExport
                        keepTogether="p"
                        margin="1cm"
                        ref={pdfExportComponent}
                        paperSize="auto"
                        fileName={`${invoiceDetails?.ClientName || 'Invoice'}_${new Date()}`}
                        author="RESUL"
                    >
                        <div className="bd-top-border box-design invoice-new ">
                            <div className="logo-holder mb50" style={{ minHeight: '60px' }}>
                                <img
                                    id="subscription-invoice-pdf-logo"
                                    src={ResulticksLogoBlue}
                                    width="180"
                                    alt="RESUL"
                                    className="brand-logo"
                                />
                                <h1 className="float-end">Invoice</h1>
                            </div>
                            <div className="d-flex justify-content-between">
                                <div className="invoice-address ">
                                    <h4 className="mb5">To,</h4>
                                    <ul className="px15">
                                        <li>
                                            {invoiceDetails?.userName?.length > 0 ? invoiceDetails?.userName + ',' : ''}
                                        </li>
                                        <li>
                                            {invoiceDetails?.ClientName?.length > 0 ? invoiceDetails?.ClientName + ',' : ''}
                                        </li>
                                        <li>{invoiceDetails?.Address?.length > 0 ? invoiceDetails?.Address + '.' : ''}</li>
                                    </ul>
                                </div>
                                <div className="d-flex mt25">
                                    <ul className="pr10">
                                        <li>{DATE_TIME}:</li>
                                        <li>{INVOICE_NUMBER}:</li>
                                        <li>{PAYABLE_AMOUNT}:</li>
                                        <li>{DUE_DATE}:</li>
                                    </ul>
                                    <ul className="pl10">
                                        <li>{getUserCurrentFormat(invoiceDetails?.InvoiceDateTime)?.dateTimeFormat}</li>
                                        <li>{invoiceDetails?.InvoiceNo}</li>
                                        <li>
                                            ${''}
                                            {numberWithCommas(invoiceDetails?.amountPaid)}
                                        </li>
                                        <li>{getUserCurrentFormat(invoiceDetails?.DueDate)?.dateFormat}</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="bg-tertiary-grey my15 p15 theme-radius">
                                <ul className="align-content-center d-flex justify-content-between ">
                                    <li>
                                        <small>{ACCOUNT_CLIENT}:</small>
                                        <h4 className="mb0">{invoiceDetails?.ClientName}</h4>
                                    </li>
                                    <li className="position-relative">
                                        <small className="list-account">{ACCOUNT_NO}:</small>
                                        <h4 className="mb0">{invoiceDetails?.AccountNo}</h4>
                                    </li>
                                    <li className="position-relative">
                                        <small className="list-account">{TYPE}:</small>
                                        <h4 className="mb0">{invoiceDetails?.Description}</h4>
                                    </li>
                                </ul>
                            </div>
                            <div className="my15 p15 bg-secondary-green theme-radius">
                                <p className="color-whites">
                                    {' '}
                                    {PAYMENT_AUTH_CODE}
                                    <span className="bg-primary-green px5 mx5">{invoiceDetails?.AuthorizationCode}</span>
                                    {ENTERED_BY}
                                    <span>
                                        {' '}
                                        {invoiceDetails?.ClientName}
                                    </span>
                                </p>
                            </div>
                            <div className="p5 portlet-box-theme mb10">
                                <table className="rs-table table ">
                                    <thead>
                                        <tr>
                                            <th width="35%" className="bg-primary-blue color-whites ">
                                                {SUB_TYPE}
                                            </th>
                                            <th width="25%" className="bg-primary-blue color-whites ">
                                                {PRICE_MO} {USD}
                                            </th>
                                            <th width="25%" className="bg-primary-blue color-whites ">
                                                {PAYMENT_FREQUENCY}
                                            </th>
                                            <th className="bg-primary-blue color-whites ">{AMOUNT} {USD}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="">
                                            <td>{invoiceDetails?.Description}</td>
                                            <td className="text-end">
                                                {numberWithCommasformatCurrency(invoiceDetails?.MonthlyCharge)}
                                            </td>
                                            <td className="text-start">{invoiceDetails?.Frequency}</td>
                                            <td className="text-end invoice-border">
                                                {numberWithCommasformatCurrency(invoiceDetails?.SalePrice)}
                                            </td>
                                        </tr>
                                        <tr className="">
                                            <td className=" border-0 " colSpan="2" rowSpan="5"></td>
                                            <td className="">{DISCOUNT}</td>
                                            <td className="text-end">
                                                {numberWithCommasformatCurrency(invoiceDetails?.Discountamt)}
                                            </td>
                                        </tr>
                                        <tr className="even ">
                                            <td className="">Total</td>
                                            <td className="text-end">
                                                {numberWithCommasformatCurrency(invoiceDetails?.TotalAmount)}
                                            </td>
                                        </tr>
                                        <tr className="bgWhite even ">
                                            <td className="">
                                                {' '}
                                                Tax (0%){' '}
                                            </td>
                                            <td className="text-end">{numberWithCommasformatCurrency(invoiceDetails?.TaxAmount)}</td>
                                        </tr>
                                        <tr className="even ">
                                            <td className="bg-tertiary-blue">{AMOUNT_PAYABLE}</td>
                                            <td className="text-end color-primary-blue bg-tertiary-blue">
                                                {numberWithCommasformatCurrency(invoiceDetails?.amountPaid)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="clearfix small media-heading px10">
                                <p>Note:</p>
                                <>
                                    <p>
                                        1&#41;{PAYMENT_DETAILS_2}
                                    </p>
                                    <p>2&#41; {PRICING_MENTIONED_ABOVE}</p>
                                    <p>
                                        3&#41; {PAYMENT_DETAILS_1}
                                    </p>
                                    <p>
                                        4&#41; {IN_CASE_OF_CLARIFICATION}
                                    </p>
                                </>
                            </div>

                            <div className="clearfix small text-center mt35">
                                <p className="">
                                    {QUERIES}{' '}
                                    <span
                                        className="rs-link-secondary"
                                        onClick={() => {
                                            window.location.href = 'mailto:billing@resul.us';
                                        }}
                                    >
                                        {BILLING_RESUL}
                                    </span>
                                </p>
                                <p className="mb15">
                                  "{RESUL_SINGAPORE_ADDRESS}"
                                </p>

                                <h4>{THANK_YOU}</h4>
                            </div>
                        </div>
                    </PDFExport>
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default SubscriptionInvoice;
