import { numberWithCommas } from 'Utils/modules/formatters';
import { DELIVERED } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row, Table } from 'react-bootstrap';
import RetargetList from '../RetargetList';
import './Tabs.scss';

const TwoWaySMS = (data) => {
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
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">Delivered</span>
                                    {data.deliveredCount > 0 && data?.retargetenabled && (
                                        <RetargetList
                                            blastId={data?.blastId}
                                            channelId={2}
                                            count={data.deliveredCount}
                                            label={DELIVERED}
                                        />
                                    )}
                                </div>
                            </td>
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
                            <td>Message in queue</td>
                            <td className="text-end">{numberWithCommas(data.messageQueue)}</td>
                        </tr>
                        <tr>
                            <td>Link clicks</td>
                            <td className="text-end">{numberWithCommas(data.linkClick)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>DND</td>
                            <td className="text-end">{numberWithCommas(data.dndCount)}</td>
                        </tr>
                        <tr>
                            <td>Expired</td>
                            <td className="text-end">{numberWithCommas(data.expiredCount)}</td>
                        </tr>
                        <tr>
                            <td>Awaiting vendor response</td>
                             <td className="text-end">{numberWithCommas(data.submittedToCarrier) || 0}</td>
                        </tr>
                        <tr>
                            <td>Unattended</td>
                            <td className="text-end">{numberWithCommas(data.unattended)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default TwoWaySMS;
