import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const Twitter = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total followers</td>
                            <td className='text-end'>{numberWithCommas(data.totalFollowers)}</td>
                        </tr>
                        <tr>
                            <td>Link clicks</td>
                            <td className='text-end'>{numberWithCommas(data.clicks)} </td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Impressions</td>
                            <td className='text-end'>{numberWithCommas(data.impressions)}</td>
                        </tr>
                        <tr>
                            <td>Tweet engagement</td>
                            <td className='text-end'>{data.tweetEnagement} </td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Twitter;