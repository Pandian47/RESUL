import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const ORM = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total mentions</td>
                            <td className='text-end'>{numberWithCommas(data.mentions)}</td>
                        </tr>
                        <tr>
                            <td>Neutral</td>
                            <td className='text-end'>{numberWithCommas(data.neutral)} </td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Positive</td>
                            <td className='text-end'>{numberWithCommas(data.positive)}</td>
                        </tr>
                        <tr>
                            <td>Negative</td>
                            <td className='text-end'>{data.negative}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default ORM;