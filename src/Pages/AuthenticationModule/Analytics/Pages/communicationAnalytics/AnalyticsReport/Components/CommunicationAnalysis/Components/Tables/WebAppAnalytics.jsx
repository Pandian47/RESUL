import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const WebAppAnalytics = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Sessions</td>
                            <td className='text-end'>{numberWithCommas(data.sessions)}</td>
                        </tr>
                        <tr>
                            <td>Direct</td>
                            <td className='text-end'>{data.direct}</td>
                        </tr>
                        <tr>
                            <td>Referrer</td>
                            <td className='text-end'>{numberWithCommas(data.referrer)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Page views</td>
                            <td className='text-end'>{numberWithCommas(data.views)}</td>
                        </tr>
                        <tr>
                            <td>Search engine</td>
                            <td className='text-end'>{data.engine}</td>
                        </tr>
                        <tr>
                            <td>Bounce rate</td>
                            <td className='text-end'>{data.rate}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default WebAppAnalytics;