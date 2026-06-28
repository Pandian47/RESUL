import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const WebNotification = (data) => {
    let isDynamicZone = data?.isDZCampaign || false;
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Target audience</td>
                            <td className="text-end">{numberWithCommas(data.totalAudienceCount)}</td>
                        </tr>
                        <tr>
                            <td>Total message count</td>
                            <td className="text-end">{numberWithCommas(data.messageCount)} </td>
                        </tr>
                        <tr>
                            <td>Dismiss</td>
                            <td className="text-end">{numberWithCommas(data.dismissCount)}</td>
                        </tr>
                        {isDynamicZone && <tr>
                            <td>Total impressions</td>
                            <td className="text-end">{numberWithCommas(data.totalImpressionCount || 0)}</td>
                        </tr>}
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        {isDynamicZone ? 
                            <tr>
                                <td>Unique impressions</td>
                                <td className="text-end">{numberWithCommas(data?.uniqueImpression || 0)}</td>
                            </tr> : 
                            <tr>
                            <td>Delivered</td>
                            <td className="text-end">
                                {numberWithCommas(data.deliveredCount)}
                                {data.deliveredCount > 0 && (
                                    <>
                                        {' '}
                                        ({((data.deliveredCount / data.messageCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>}       
                        <tr>
                            <td>
                                <td>Clicks</td>
                            </td>
                            <td className="text-end">{data.clicksCount}</td>
                        </tr>
                        <tr>
                            <td>Mismatch senderID</td>
                            <td className="text-end">{numberWithCommas(data.mismatchSenderIDCount)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default WebNotification;
