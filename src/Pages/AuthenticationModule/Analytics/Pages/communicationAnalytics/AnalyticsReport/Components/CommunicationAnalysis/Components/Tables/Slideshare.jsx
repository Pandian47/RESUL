import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const Slideshare = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total views</td>
                            <td className="text-end">{numberWithCommas(data.views)}</td>
                        </tr>
                        <tr>
                            <td>Likes</td>
                            <td className="text-end">{numberWithCommas(data.likes)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Leads generated</td>
                            <td className="text-end">{numberWithCommas(data.generated)}</td>
                        </tr>
                        <tr>
                            <td>Comments</td>
                            <td>{data.comments}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Slideshare;