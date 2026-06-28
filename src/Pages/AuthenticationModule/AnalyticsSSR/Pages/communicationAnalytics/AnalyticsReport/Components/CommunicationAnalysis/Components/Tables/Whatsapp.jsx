import { numberWithCommas } from 'Utils/modules/formatters';
import { BLOCKED, DELIVERED, NOT_READ, REJECTED, REPORTED, RESPONDED, SEEN, UNDELIVERED, UNIQUE_CLICKS } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';

import RetargetList from '../RetargetList';
import { isMetricRetargetable } from '../../Constants';

const Whatsapp = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>Audience</td>
                            <td className="text-end">{numberWithCommas(data.totalNoOfRecipientsCount || 0)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{DELIVERED}</span>
                                    {data.deliveredCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, DELIVERED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
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
                                        (
                                        {(
                                            (data.deliveredCount / data.totalNoOfRecipientsCount) * 100 || 0 * 100
                                        ).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{SEEN}</span>
                                    {data.readCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, SEEN) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
                                                count={data.readCount}
                                                label={SEEN}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.readCount)}</td>
                        </tr>
                        <tr>
                            <td><div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{RESPONDED}</span>
                                    {data.respondedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, RESPONDED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
                                                count={data.respondedCount}
                                                label={RESPONDED}
                                            />
                                        )}
                                </div></td>
                            <td className="text-end">{numberWithCommas(data.respondedCount || 0)}</td>
                        </tr>
                        <tr>
                            <td><div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{NOT_READ}</span>
                                    {data.notRead > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, NOT_READ) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
                                                count={data.notRead}
                                                label={NOT_READ}
                                            />
                                        )}
                                </div> </td>
                            <td className="text-end">{numberWithCommas(data.notRead || 0)}</td>
                        </tr>
                          <tr>
                                <td>Awaiting vendor response </td>
                                <td className="text-end">{numberWithCommas(data.submittedToCarrier || 0)}</td>
                            </tr>
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <div className="d-flex align-items-center tabsMouseHover">
                                <td>{UNIQUE_CLICKS}</td>

                                {data.linkClickCount > 0 &&
                                    data?.retargetenabled &&
                                    isMetricRetargetable(21, UNIQUE_CLICKS) && (
                                        <RetargetList
                                            blastId={data?.blastId}
                                            channelId={21}
                                            count={data.linkClickCount}
                                            label={UNIQUE_CLICKS}
                                        />
                                    )}
                            </div>
                            <td className="text-end">{numberWithCommas(data.linkClickCount || 0)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{BLOCKED}</span>
                                    {data?.blockedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, BLOCKED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
                                                count={data.blockedCount}
                                                label={BLOCKED}
                                            />
                                        )}
                                </div>{' '}
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.blockedCount)}
                                {data.blockedCount > 0 && (
                                    <>
                                        {' '}
                                        ({((data.respondedCount / data.readCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>)
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td><div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{REPORTED}</span>
                                    {data?.reportedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, REPORTED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
                                                count={data?.reportedCount}
                                                label={REPORTED}
                                            />
                                        )}
                                </div></td>
                            <td className="text-end">{numberWithCommas(data.reportedCount)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{UNDELIVERED}</span>
                                    {data.unDeliveredCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, UNDELIVERED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
                                                count={data.unDeliveredCount}
                                                label={UNDELIVERED}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.unDeliveredCount)}
                                {data.unDeliveredCount > 0 && (
                                    <>
                                        {' '}
                                        (
                                        {(
                                            (data.unDeliveredCount / data.totalNoOfRecipientsCount) * 100 || 0 * 100
                                        ).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{REJECTED}</span>
                                    {data?.rejected > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(21, REJECTED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                channelId={21}
                                                count={data.rejected}
                                                label={REJECTED}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.rejected || 0)}
                                {data.rejected > 0 && (
                                    <>
                                        {' '}
                                        ({((data.rejected / data.totalNoOfRecipientsCount) * 100 || 0 * 100).toFixed()}
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

export default Whatsapp;
