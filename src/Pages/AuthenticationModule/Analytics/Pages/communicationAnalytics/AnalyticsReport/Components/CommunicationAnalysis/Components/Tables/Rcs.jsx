import { numberWithCommas } from 'Utils/modules/formatters';
import { DELIVERED, LINK_CLICKED, READ, REJECTED, UNDELIVERED, UNIQUE_AUDIENCE } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row, Table } from 'react-bootstrap';
import './Tabs.scss';

import RetargetList from '../RetargetList';
const Rcs = (data) => {
    return (
        <Row>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <td>{UNIQUE_AUDIENCE}</td>
                            <td className="text-end">{numberWithCommas(data.totalNoOfRecipientsCount || 0)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">Delivered</span>
                                    {data.deliveredCount > 0 && data?.retargetenabled && (
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
                               {data.totalNoOfRecipientsCount > 0 && data.deliveredCount > 0 && (
                                <>
                                    (
                                    {(
                                        (data.deliveredCount / data.totalNoOfRecipientsCount) * 100
                                    ).toFixed(0)}
                                    <span className="font-xs percent-xs">%</span>
                                    )
                                </>
                            )}

                             {(data.totalNoOfRecipientsCount == 0 || data.deliveredCount == 0) && (
                                <>
                                    (
                                    0
                                    <span className="font-xs percent-xs">%</span>
                                    )
                                </>
                            )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">Seen</span>
                                    {data.readCount > 0 && data?.retargetenabled && (
                                        <RetargetList
                                            blastId={data?.blastId}
                                            channelId={21}
                                            count={data.readCount}
                                            label={READ}
                                        />
                                    )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.readCount)}</td>
                        </tr>
                        {/* <tr>
                            <td>Responded</td>
                            <td className="text-end">{numberWithCommas(data.respondedCount || 0)}</td>
                        </tr> */}
                        <tr>
                            <td>Not Read </td>
                            <td className="text-end">{numberWithCommas(data.notRead || 0)}</td>
                        </tr>
                      
                    </tbody>
                </Table>
            </Col>
            <Col md={6}>
                <Table striped className="theme-space-mt rs-table-plain">
                    <tbody>
                        <tr>
                            <div className="d-flex align-items-center tabsMouseHover">
                                <td>Unique clicks</td>

                                {data.linkClickCount > 0 && data?.retargetenabled && (
                                    <RetargetList
                                        blastId={data?.blastId}
                                        channelId={21}
                                        count={data.linkClickCount}
                                        label={LINK_CLICKED}
                                    />
                                )}
                            </div>
                            <td className="text-end">{numberWithCommas(data.linkClickCount || 0)}</td>
                        </tr>
                        {/* <tr>
                            <td>Blocked </td>
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
                        </tr> */}
                        {/* <tr>
                            <td>Reported</td>
                            <td className="text-end">{numberWithCommas(data.reportedCount)}</td>
                        </tr> */}
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">Undelivered</span>
                                    {data.unDeliveredCount > 0 && data?.retargetenabled && (
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
                                {data.unDeliveredCount > 0 && data.totalNoOfRecipientsCount > 0 && (
                                    <>
                                        {' '}
                                        (
                                        {(
                                            (data.unDeliveredCount / data.totalNoOfRecipientsCount) * 100 || 0 * 100
                                        ).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}

                                  {(data.unDeliveredCount == 0 || data.totalNoOfRecipientsCount == 0) && (
                                <>
                                    (
                                    0
                                    <span className="font-xs percent-xs">%</span>
                                    )
                                </>
                            )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">Rejected</span>
                                    {data?.rejected > 0 && data?.retargetenabled && (
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
                                {data.rejected > 0 && data.totalNoOfRecipientsCount > 0 && (
                                    <>
                                        {' '}
                                        (
                                        {(
                                            (data.rejected / data.totalNoOfRecipientsCount) * 100 || 0 * 100
                                        ).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}

                                  {(data.rejected == 0 || data.totalNoOfRecipientsCount == 0) && (
                                <>
                                    (
                                    0
                                    <span className="font-xs percent-xs">%</span>
                                    )
                                </>
                                   )}
                            </td>
                        </tr>
                           <tr>
                            <td>Awaiting vendor response </td>
                            <td className="text-end">{numberWithCommas(data.submittedToCarrier || 0)}</td>
                        </tr>
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
};

export default Rcs;
