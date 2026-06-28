import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const VMS = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Audience</td>
                            <td className="text-end">{numberWithCommas(data.totalNoOfRecipientsCount)}</td>
                        </tr>
                        <tr>
                            <td>Delivered </td>
                            <td className="text-end">
                                {numberWithCommas(data.deliveredCount)}
                                {data.deliveredCount > 0 && (
                                    <>
                                        {' '}
                                        (
                                        {(
                                            (data.deliveredCount / data.totalNoOfRecipientsCount) * 100 || 0 * 100
                                        ).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>Disconnected</td>
                            <td className="text-end">{numberWithCommas(data.disConnected)}</td>
                        </tr>
                        <tr>
                            <td>Ring timeout</td>
                            <td className="text-end">{numberWithCommas(data.ringTimeout)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Answered</td>
                            <td className="text-end">{numberWithCommas(data.repliedCount || 0)}</td>
                        </tr>
                        <tr>
                            <td>DND</td>
                            <td className="text-end">
                                {data.dndCount || 0}
                                {data.dndCount > 0 && (
                                    <>
                                        {' '}
                                        ({(data.repliedCount / data.deliveredCount || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>)
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>Not reachable</td>
                            <td className="text-end">{numberWithCommas(data.notRechable)}</td>
                        </tr>
                        <tr>
                            <td>User busy</td>
                            <td className="text-end">{numberWithCommas(data.userbusy)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default VMS;
