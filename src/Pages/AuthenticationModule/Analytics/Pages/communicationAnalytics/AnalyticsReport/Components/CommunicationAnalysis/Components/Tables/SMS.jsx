import { numberWithCommas } from 'Utils/modules/formatters';
import { DELIVERED, DND, EXPIRED, REJECTED, REPLIED_PARTICIPATED, UNDELIVERED, UNIQUE_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row, Table } from 'react-bootstrap';
import RetargetList from '../RetargetList';
import './Tabs.scss';

import { isMetricRetargetable } from '../../Constants';

const SMS = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>{UNIQUE_AUDIENCE}</td>
                            <td className="text-end">{numberWithCommas(data.noOfAudienceCount)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{DELIVERED}</span>
                                    {data.deliveredCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(2, DELIVERED) && (
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
                        {/* <tr>
                            <td>Message in queue</td>
                            <td>{numberWithCommas(data.messagequeue)}</td>
                        </tr> */}
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{EXPIRED}</span>
                                    {data.expiredCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(2, EXPIRED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={2}
                                                count={data.expiredCount}
                                                label={EXPIRED}
                                            />
                                        )}
                                </div>
                                </td>
                            <td className="text-end">{numberWithCommas(data.expiredCount)}</td>
                        </tr>
                        <tr>
                            <td> <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{REJECTED}</span>
                                    {data.rejectedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(2, REJECTED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={2}
                                                count={data.rejectedCount}
                                                label={REJECTED}
                                            />
                                        )}
                                </div></td>
                            <td className="text-end">{numberWithCommas(data.rejectedCount)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{DND}</span>
                                    {data.dndCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(2, DND) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={2}
                                                count={data.dndCount}
                                                label={DND}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.dndCount)}
                                {data.dndCount > 0 && (
                                    <>
                                        {' '}
                                        ({((data.dndCount / data.noOfAudienceCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{REPLIED_PARTICIPATED}</span>
                                    {data.repliedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(2, REPLIED_PARTICIPATED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={2}
                                                count={data.repliedCount}
                                                label={REPLIED_PARTICIPATED}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.repliedCount)}
                                {data.repliedCount > 0 && (
                                    <>
                                        {' '}
                                        ({((data.repliedCount / data.deliveredCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                         <tr>
                            <td>Awaiting vendor response</td>
                            <td className="text-end">{numberWithCommas(data.submittedToCarrier) || 0}</td>
                        </tr>  
                        <tr>
                            <td>
                                {' '}
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{UNDELIVERED}</span>
                                    {data.unDeliveredCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(2, UNDELIVERED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={2}
                                                count={data.unDeliveredCount}
                                                label={UNDELIVERED}
                                            />
                                        )}
                                    {/* {numberWithCommas(data.unDeliveredCount) || 0} */}
                                </div>
                            </td>

                            <td className="text-end">
                                {numberWithCommas(data.unDeliveredCount)}
                                {data.unDeliveredCount > 0 && (
                                    <>
                                        {' '}
                                        ({((data.unDeliveredCount / data.noOfAudienceCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default SMS;
