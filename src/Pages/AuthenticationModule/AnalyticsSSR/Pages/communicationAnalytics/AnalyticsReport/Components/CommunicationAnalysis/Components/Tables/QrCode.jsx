import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const QrCode = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Potential audience</td>
                            <td className="text-end">{numberWithCommas(data?.potentialAudienceCount)}</td>
                        </tr>
                        <tr>
                            <td>Link clicks</td>
                            <td className="text-end">{numberWithCommas(data.interactionCount) || 0}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Unique scans</td>
                            <td className="text-end">{numberWithCommas(data.uniqueScansPercentage)}</td>
                        </tr>
                        <tr>
                            <td>Avg scans per day</td>
                            <td className="text-end">{numberWithCommas(data.avgScansPerDay)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default QrCode;
