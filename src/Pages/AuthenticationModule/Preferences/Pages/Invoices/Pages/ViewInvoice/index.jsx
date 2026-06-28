import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { numberWithCommas, numberWithCommasformatCurrency } from 'Utils/modules/formatters';
import { ResulticksLogoBlue } from 'Assets/Images';
import { ACCOUNT_CLIENT, ACCOUNT_NO, ADJUSTMENTS, AMOUNT, AMOUNT_PAYABLE, BILLING_RESUL, COMMUNICATION_NAME, COMMUNICATION_TYPE, DATE_TIME, DISCOUNT, DUE_DATE, ENTERED_BY, INVOICE_NUMBER, IN_CASE_OF_CLARIFICATION, PAYABLE_AMOUNT, PAYMENT_AUTH_CODE, PAYMENT_DETAILS_1, PAYMENT_DETAILS_2, PAYMENT_FREQUENCY, PRICE_MO, PRICING_MENTIONED_ABOVE, QUERIES, RESUL_SINGAPORE_ADDRESS, SUB_TOTAL, SUB_TYPE, THANK_YOU, TYPE, USD } from 'Constants/GlobalConstant/Placeholders';
import { download_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container } from 'react-bootstrap';

import RSTooltip from 'Components/RSTooltip';
import useQueryParams from 'Hooks/useQueryParams';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { get_invoiceListbyID } from 'Reducers/preferences/invoices/request';
import { PDFExport } from '@progress/kendo-react-pdf';
const InvoiceView = () => {
    const dispatch = useDispatch();
    const location = useQueryParams('/preferences/invoice-list/invoice');
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const pdfContainer = useRef(null);
    const pdfExportComponent = useRef(null);
    const exportPDFWithComponent = () => {
        if (pdfExportComponent.current) {
            pdfExportComponent.current.save();
        }
        setTimeout(() => {
            setPDFData(false);
        }, 100);
    };
    const [pdfData, setPDFData] = useState(false);
    useEffect(() => {
        if (location?.data > 0) {
            getInvoiceIDData();
        }
    }, [location]);
    // const [invoiceDetails, setInvoiceDetails] = useState(
    //     state?.index === 2 ? viewConsumableData : viewInvoiceData[state?.data],
    // );
    const [invoiceDetails, setInvoiceDetails] = useState({
        AccountNo: 'INBE-vijvij-84801',
        Address: 'Poonamallee, Avadi Road Veeraraghavapuram, Thiruverkadu, Tamil Nadu 600077',
        AuthorizationCode: 'vi3188300',
        ClientName: 'vijaychildcompany',
        Description: 'Enterprise (Annual commitment)',
        Discountamt: 0.0,
        DueDate: '2024-03-28 10:27:03',
        Email: 'vignesh@resul.com',
        FirstName: 'vignesh',
        Frequency: 'Monthly',
        InvoiceDateTime: '2024-03-18 10:27:03',
        InvoiceNo: '001113-2370/23-24',
        LastName: 'kumar',
        LicenseTypeID: 'Enterprise',
        MonthlyCharge: 1999.0,
        Paymentterms: '15 days',
        SalePrice: 1999.0,
        TaxAmount: 0.0,
        TotalAmount: 23988.0,
        amountPaid: 23988.0,
        licenseType: 'Enterprise',
        userName: 'vignesh kumar',
    });
    const getInvoiceIDData = async () => {
        const payload = { departmentId, clientId, userId, invoiceId: location?.data };
        // debugger;
        let { status, data } = await dispatch(get_invoiceListbyID({ payload }));
                if (status) {
            setInvoiceDetails(data);
        } else {
            setInvoiceDetails({});
        }
    };
    return (
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader title="Invoice" backPath={'/preferences/invoice-list'} isBack />
            {/* Main page heading block ends */}
            <Container className="page-content px0">
                <div className="d-flex justify-content-end mb21">
                    <RSTooltip text={'Download'} position="top" className="lh0">
                        <i
                            id="rs_InvoiceView_download"
                            onClick={() => {
                                setPDFData(true);
                                setTimeout(() => {
                                    exportPDFWithComponent();
                                }, 50);
                            }}
                            className={`${download_large} icon-lg color-primary-blue`}
                            style={{ cursor: 'pointer' }}
                        />
                    </RSTooltip>
                </div>
                <PDFExport
                    keepTogether="p"
                    // paperSize="A4"
                    margin="1cm"
                    ref={pdfExportComponent}
                    paperSize="auto"
                    // margin={40}
                    fileName={`${invoiceDetails?.ClientName}_${new Date()}`}
                    author="RESUL"
                >
                    <div className="bd-top-border box-design invoice-new ">
                        <div 
                            className="logo-holder mb50" 
                            style={{ 
                                visibility: pdfData ? 'visible' : 'hidden',
                                minHeight: '60px'
                            }}
                        >
                            <img
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
                                    {/* <li>{getUserDateTimeFormat(invoiceDetails?.InvoiceDateTime)}</li> */}
                                    <li>{getUserCurrentFormat(invoiceDetails?.InvoiceDateTime).dateTimeFormat}</li>
                                    <li>{invoiceDetails?.InvoiceNo}</li>
                                    <li>
                                        ${''}
                                        {location?.index === 1
                                            ? numberWithCommas(invoiceDetails?.amountPaid)
                                            : invoiceDetails?.consumableSummary?.totalAmount}
                                    </li>
                                    {/* <li>{dateFormat(invoiceDetails?.DueDate)}</li> */}
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
                                    {/* ({invoiceDetails?.maskedEmailId}) */}
                                </span>
                            </p>
                        </div>
                        {location?.index === 2 && (
                            <div className="px15 mb15">
                                <p>
                                    {' '}
                                    {COMMUNICATION_NAME} :{' '}
                                    <span className="rs-link-secondary">{invoiceDetails?.campaignName}</span>
                                    <small className="d-inline">
                                        {' '}
                                        {/* (Created on {dateFormat(invoiceDetails?.createdDate)}) */}
                                        (Created on {getUserCurrentFormat(invoiceDetails?.createdDate)?.dateFormat})
                                    </small>
                                </p>
                                <p>
                                    {' '}
                                    {COMMUNICATION_TYPE} : <span>{invoiceDetails?.campaignType}</span>{' '}
                                </p>
                            </div>
                        )}
                        <div className="p5 portlet-box-theme mb10">
                            {location?.index === 1 ? (
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
                                                Tax ({location?.index === 2 ? invoiceDetails.taxPercentage : 0}
                                                %){' '}
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
                            ) : (
                                invoiceDetails?.consumableSummary && (
                                    <table
                                        width="100%"
                                        border="0"
                                        cellPadding="0"
                                        cellSpacing="0"
                                        className="table rs-table"
                                        style={{ paddingTop: '20px' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th width="35%" className="bg-primary-blue color-whites ">
                                                    Channel
                                                </th>
                                                <th width="25%" className="bg-primary-blue color-whites ">
                                                    Units used
                                                </th>
                                                <th width="25%" className="bg-primary-blue color-whites ">
                                                    Unit charge (USD)
                                                </th>
                                                <th className="bg-primary-blue color-whites ">{AMOUNT} {USD}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceDetails?.consumableSummary?.consumableMapping &&
                                                invoiceDetails?.consumableSummary?.consumableMapping
                                                    ?.sort((a, b) => {
                                                        let firstOne = a.channelName.toLowerCase();
                                                        let secondOne = b.channelName.toLowerCase();
                                                        if (firstOne < secondOne) {
                                                            return -1;
                                                        }
                                                        if (firstOne > secondOne) {
                                                            return 1;
                                                        }
                                                        return 0;
                                                    })
                                                    .map((item, index) => {
                                                        return (
                                                            <tr key={index} className={index % 2 === 0 ? '' : 'even '}>
                                                                <td className="camp-icon">
                                                                    <div className="d-flex align-items-center">
                                                                        <i
                                                                            // className={`${getIconForChannels(
                                                                            //     item?.channelId,
                                                                            // )} icons-md blue mr8`}
                                                                            style={{
                                                                                verticalAlign: 'middle',
                                                                                paddingBottom: '9px',
                                                                            }}
                                                                        />
                                                                        <span
                                                                            style={{
                                                                                verticalAlign: 'middle',
                                                                                paddingBottom: '2px',
                                                                            }}
                                                                        >
                                                                            {item?.channelName}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-end">{item?.numberOfRecipients}</td>
                                                                <td className="text-end">${item?.price}</td>
                                                                <td className="text-end invoice-border">
                                                                    ${item?.totalChannelCost}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            <tr className="">
                                                <td
                                                    className="border-left-0 border-0 border-bottom-0 bgGrey-lighter1"
                                                    colSpan="2"
                                                    rowSpan="5"
                                                ></td>
                                                <td className="text-end">{SUB_TOTAL} :</td>
                                                <td className="text-end">
                                                    ${invoiceDetails?.consumableSummary?.subTotal}
                                                </td>
                                            </tr>
                                            <tr className="even ">
                                                <td className="text-end">{ADJUSTMENTS} :</td>
                                                <td className="text-end">${0}</td>
                                            </tr>
                                            <tr className="bgWhite even ">
                                                <td className="text-end"> Total : </td>
                                                <td className="text-end">
                                                    {' '}
                                                    (+) ${invoiceDetails?.consumableSummary?.subTotal}
                                                </td>
                                            </tr>
                                            <tr className="even ">
                                                <td className="text-end">
                                                    {' '}
                                                    Tax (
                                                    {location?.index === 2
                                                        ? invoiceDetails?.consumableSummary?.taxPercentage
                                                        : 0}
                                                    %) :{' '}
                                                </td>
                                                <td className="text-end">
                                                    {' '}
                                                    (+) ${invoiceDetails?.consumableSummary?.tax}
                                                </td>
                                            </tr>
                                            <tr className="even ">
                                                <td className="text-end bg-tertiary-blue">{AMOUNT_PAYABLE}</td>
                                                <td className="text-end color-primary-blue bg-tertiary-blue">
                                                    ${invoiceDetails?.consumableSummary?.totalAmount}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )
                            )}
                        </div>

                        <div className="clearfix small media-heading px10">
                            <p>Note:</p>
                            {location?.index === 2 ? (
                                <>
                                    <p>1&#41; {PRICING_MENTIONED_ABOVE}</p>
                                    <p>
                                        2&#41; {PAYMENT_DETAILS_1}
                                    </p>
                                    <p>
                                        3&#41; {IN_CASE_OF_CLARIFICATION}
                                    </p>
                                </>
                            ) : (
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
                            )}
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
                            {/* <p className="mb15">
                                "Resul Singapore Pte Ltd, #05-21, 305 Alexandra Road, Singapore 159942, Tel: +65 6238
                                8995 / Fax: +65 6238 8943, Biz. Reg. no: 201429642C"
                            </p>  */}
                            <p className="mb15">
                              "{RESUL_SINGAPORE_ADDRESS}"
                            </p>

                            <h4>{THANK_YOU}</h4>
                        </div>
                    </div>
                </PDFExport>
            </Container>
        </div>
    );
};

export default InvoiceView;
