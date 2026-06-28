import { numberWithCommas } from 'Utils/modules/formatters';
import { DELIVERED_COUNT, FORWARDS, HARD_BOUNCED, MARKED_AS_SPAM, QUARANTINED, SENT_COUNT, SOFT_BOUNCED, UNATTENDED, UNIQUE_AUDIENCE, UNIQUE_CLICKS, UNIQUE_OPENS, UNSUBSCRIBED } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row, Table } from 'react-bootstrap';
import RetargetList from '../RetargetList';
import './Tabs.scss';

import { isMetricRetargetable } from '../../Constants';

const Email = (data) => {
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
                                    <span className="mr5">{SENT_COUNT}</span>
                                    {data.sentCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, SENT_COUNT) && (
                                            <RetargetList
                                                channelId={1}
                                                blastId={data?.blastId}
                                                count={data.sentCount}
                                                label={SENT_COUNT}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.sentCount)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{DELIVERED_COUNT}</span>
                                    {data.deliveredCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, DELIVERED_COUNT) && (
                                            <RetargetList
                                                count={data.deliveredCount}
                                                label={DELIVERED_COUNT}
                                                channelId={1}
                                                blastId={data?.blastId}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.deliveredCount)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{HARD_BOUNCED}</span>
                                    {data.hardBouncedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, HARD_BOUNCED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.hardBouncedCount}
                                                label={HARD_BOUNCED}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.hardBouncedCount)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{SOFT_BOUNCED}</span>
                                    {data.softBouncedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, SOFT_BOUNCED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.softBouncedCount}
                                                label={SOFT_BOUNCED}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.softBouncedCount)}</td>
                        </tr>
                        <tr>
                            <td><div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{QUARANTINED}</span>
                                    {data.quarantinedCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, QUARANTINED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.quarantinedCount}
                                                label={QUARANTINED}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.quarantinedCount)}</td>
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
                                    <span className="mr5">{UNIQUE_OPENS}</span>
                                    {data.uniqueOpens > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, UNIQUE_OPENS) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.uniqueOpens}
                                                label={UNIQUE_OPENS}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.uniqueOpens)}
                                {data.uniqueOpens > 0 && (
                                    <>
                                        {' '}
                                        ({((data.uniqueOpens / data.deliveredCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>){' '}
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">Unique clicks</span>
                                    {data.uniqueClicks > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, UNIQUE_CLICKS) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.uniqueClicks}
                                                label={UNIQUE_CLICKS}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.uniqueClicks)}
                                {data.uniqueClicks > 0 && (
                                    <>
                                        {' '}
                                        ({((data.uniqueClicks / data.uniqueOpens) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>)
                                    </>
                                )}
                            </td>
                        </tr>
                        {/* <tr>
                            <td>Conversion</td>
                            <td>{data.conversion}</td>
                        </tr> */}
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{FORWARDS}</span>
                                    {data.noOfForwadsCount > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, FORWARDS) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.noOfForwadsCount}
                                                label={FORWARDS}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{data.noOfForwadsCount}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{UNSUBSCRIBED}</span>
                                    {data.unscrible > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, UNSUBSCRIBED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.unscrible}
                                                label={UNSUBSCRIBED}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{data.unscrible}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{MARKED_AS_SPAM}</span>
                                    {data?.spam > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, MARKED_AS_SPAM) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.spam}
                                                label={MARKED_AS_SPAM}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">{numberWithCommas(data.spam)}</td>
                        </tr>
                        <tr>
                            <td>
                                <div className="d-flex align-items-center tabsMouseHover">
                                    <span className="mr5">{UNATTENDED}</span>
                                    {data.unattended > 0 &&
                                        data?.retargetenabled &&
                                        isMetricRetargetable(1, UNATTENDED) && (
                                            <RetargetList
                                                blastId={data?.blastId}
                                                count={data.unattended}
                                                label={UNATTENDED}
                                                channelId={1}
                                            />
                                        )}
                                </div>
                            </td>
                            <td className="text-end">
                                {numberWithCommas(data.unattended)}
                                {data.unattended > 0 && (
                                    <>
                                        {' '}
                                        ({((data.unattended / data.deliveredCount) * 100 || 0 * 100).toFixed()}
                                        <span className="font-xs percent-xs">%</span>)
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

export default Email;
