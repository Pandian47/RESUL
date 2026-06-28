import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const Video = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total subscribers</td>
                            <td className='text-end'>{numberWithCommas(data.subscribers)}</td>
                        </tr>
                        <tr>
                            <td>Likes</td>
                            <td className='text-end'>{numberWithCommas(data.likes)}</td>
                        </tr>
                        <tr>
                            <td>Shares</td>
                            <td className='text-end'>{numberWithCommas(data.shares)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Total views</td>
                            <td className="text-end">{numberWithCommas(data.views)}</td>
                        </tr>
                        <tr>
                            <td>Comments</td>
                            <td className="text-end">{numberWithCommas(data.comments)}</td>
                        </tr>
                        <tr>
                            <td>Dislikes</td>
                            <td className="text-end">{numberWithCommas(data.dislikes)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Video;