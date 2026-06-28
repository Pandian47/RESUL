import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
const MobileNotification = (data) => {
    let isDynamicZone = data?.isDZCampaign || false;
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Target audience</td>
                            <td className="text-end">{numberWithCommas(data.targetAudience)}</td>
                        </tr>
                        <tr>
                            <td>Total message sent </td>
                            <td className="text-end">{numberWithCommas(data.totalMessageCount)}</td>
                        </tr>
                        <tr>
                            <td>Total message delivered </td>
                            <td className="text-end">
                                {numberWithCommas(data.totalDeliveredCount)}
                                {data.totalDeliveredCount > 0 && (
                                    <>
                                        {' '}
                                        (
                                        {(
                                            (data.totalDeliveredCount / data.totalMessageCount) * 100 || 0 * 100
                                        ).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                        {/* <tr>
                            <td>Duplicate Reg ID</td>
                            <td className="text-end">{numberWithCommas(data.duplicateRegID)}</td>
                        </tr> */}
                        <tr>
                            <td>Mismatch senderID</td>
                            <td className="text-end">{numberWithCommas(data.mismatchSenderId)}</td>
                        </tr>
                        <tr>
                            <td>Dismiss</td>
                            <td className="text-end">{numberWithCommas(data.dismiss)}</td>
                        </tr>
                        {isDynamicZone && <tr>
                            <td>Total impressions</td>
                            <td className="text-end">{numberWithCommas(data.totalImpressionCount)}</td>
                        </tr>}
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        {isDynamicZone ? <tr>
                            <td>Unique impressions</td>
                            <td className="text-end">{numberWithCommas(data.uniqueImpression)}</td>
                        </tr> : 
                        <tr>
                            <td>Unique audience</td>
                            <td className="text-end">{numberWithCommas(data.uniqueAudience)} </td>
                        </tr> }                     
                        <tr>
                            <td>Clicks</td>
                            <td className="text-end">{numberWithCommas(data.clicks)} </td>
                        </tr>
                        <tr>
                            <td>Undelivered</td>
                            <td className="text-end">{numberWithCommas(data.unDeliveredCount)}</td>
                        </tr>
                        <tr>
                            <td>Due to app uninstalls</td>
                            <td className="text-end">{numberWithCommas(data.appUninstallCount)}</td>
                        </tr>
                        <tr>
                            <td>Expired</td>
                            <td className="text-end">{numberWithCommas(data.expiredCount)}</td>
                        </tr>
                        <tr>
                            <td>Maybe later</td>
                            <td className="text-end">{numberWithCommas(data.maybeLaterCount)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default MobileNotification;
