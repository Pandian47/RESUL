import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const Pinterest = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total followers</td>
                            <td className='text-end'>{numberWithCommas(data.followers)}</td>
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
                            <td>Reach	</td>
                            <td className='text-end'>{numberWithCommas(data.reach)}</td>
                        </tr>
                        <tr>
                            <td>Post engagement</td>
                            <td className='text-end'>{data.engagement}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Pinterest;