import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const Webinar = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total no. of invites</td>
                            <td className='text-end'>{numberWithCommas(data.invites)}</td>
                        </tr>
                        <tr>
                            <td>User engagement </td>
                            <td className='text-end'>{numberWithCommas(data.engagement)} </td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total registered users</td>
                            <td className='text-end'>{numberWithCommas(data.registeredUsers)}</td>
                        </tr>
                        <tr>
                            <td>Meeting duration</td>
                            <td className='text-end'>{data.duration}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Webinar;