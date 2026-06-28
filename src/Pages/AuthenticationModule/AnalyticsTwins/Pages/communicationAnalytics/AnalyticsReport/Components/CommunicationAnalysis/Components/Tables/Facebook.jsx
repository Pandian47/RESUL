import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const Facebook = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Page likes</td>
                            <td className="text-end">{numberWithCommas(data.pageLikes)}</td>
                        </tr>
                        <tr>
                            <td>Post engagement</td>
                            <td className="text-end">{numberWithCommas(data.pageEngagement)} </td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Reach</td>
                            <td className="text-end">{numberWithCommas(data.Reach)}</td>
                        </tr>
                        <tr>
                            <td>Link clicks</td>
                            <td className="text-end">{data.linkClick}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Facebook;
