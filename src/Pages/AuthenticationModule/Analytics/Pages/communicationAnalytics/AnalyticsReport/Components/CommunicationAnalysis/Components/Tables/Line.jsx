import { numberWithCommas } from 'Utils/modules/formatters';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';


const Line = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Audience</td>
                            <td className="text-end">{numberWithCommas(data.noOfAudienceCount)}</td>
                        </tr>
                        <tr>
                            <td>Delivered</td>
                            <td className="text-end">
                                {numberWithCommas(data.deliveredCount)}
                                {data.deliveredCount > 0 && (
                                    <>
                                        {' '}
                                        ({((data.deliveredCount / data.noOfAudienceCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>Undelivered</td>
                            <td className="text-end">{numberWithCommas(data.deliveredCount)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Link clicked</td>
                            <td className="text-end">{numberWithCommas(data.linkClicked)}</td>
                        </tr>
                        <tr>
                            <td>Blocked</td>
                            <td className="text-end">{data.blocked}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Line;
