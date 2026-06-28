import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const FBApp = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Unique visitors</td>
                            <td className='text-end'>{numberWithCommas(data.noOfAudienceCount)}</td>
                        </tr>
                        <tr>
                            <td>App shares</td>
                            <td className='text-end'>{numberWithCommas(data.share)} </td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Story engagement</td>
                            <td className='text-end'>{numberWithCommas(data.storyEngagment)}</td>
                        </tr>
                        <tr>
                            <td>New logins</td>
                            <td className='text-end'>{data.newLogin}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default FBApp;