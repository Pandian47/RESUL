import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';

const Twitterads = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total clicks</td>
                            <td className="text-end">{data.totalClicks}</td>
                        </tr>
                        {/* <tr>
                            <td>Post engagement</td>
                            <td className="text-end">{numberWithCommas(data.interactionCount)} </td>
                        </tr> */}
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        {/* <tr>
                            <td>Reach</td>
                            <td className="text-end">{numberWithCommas(data.reachCount)}</td>
                        </tr> */}
                        <tr>
                            <td>Unique clicks</td>
                            <td className="text-end">{data.uniqueClicks}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Twitterads;
