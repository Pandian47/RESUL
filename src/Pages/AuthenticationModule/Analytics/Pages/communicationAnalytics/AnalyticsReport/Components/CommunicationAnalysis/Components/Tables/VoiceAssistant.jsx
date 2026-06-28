import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const VoiceAssistant = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total users</td>
                            <td className='text-end'>{numberWithCommas(data.totalUsers)}</td>
                        </tr>
                        <tr>
                            <td>Postive</td>
                            <td className='text-end'>{numberWithCommas(data.postive)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Active users</td>
                            <td className='text-end'>{numberWithCommas(data.activeUsers)}</td>
                        </tr>
                        <tr>
                            <td>Neutral</td>
                            <td className='text-end'>{data.neutral}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default VoiceAssistant;