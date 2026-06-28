import { numberWithCommas } from 'Utils/modules/formatters';
import { addTabKey } from '../../../../constants';
import useQueryParams from 'Hooks/useQueryParams';
import _filter from 'lodash/filter';
import _get from 'lodash/get';
import _map from 'lodash/map';
import { getSummaryList } from 'Reducers/analyticsTwins/analyticsSummary/selector';
import { useSelector } from 'react-redux';
const InfoOverview = ({ audience, infoSelectedType }) => {
    // console.log(audience, 'audience');
    // console.log(infoSelectedType, 'infoselectedtype');
    const state = useQueryParams('/analyticsTwins/analytics-report');
    // console.log('state: ', state);
    const summary = useSelector((state) => getSummaryList(state));
    const filterModals = _filter(Object.entries(_get(summary, 'factModel', {})), ([_, value]) => value !== null);
    const filterModaldata = addTabKey(Object.fromEntries(filterModals));
    const getChannelKey = (type) => {
        switch (type) {
            case 'WhatsApp':
                return 'whatsapp';
            case 'SMS':
                return 'mobile';
            case 'Email':
                return 'email';
            case 'Web notification':
                return 'webPush';
            case 'Mobile notification':
                return 'mobilePush';
            case 'QR code':
                return 'qrCode';
            case 'VMS':
                return 'vms';
            case 'Voice':
            case 'Call center':
                return 'voice';
            case 'RCS':
                return 'rcs';
            case 'Line':
                return 'line';
            case 'Facebook':
                return 'facebook';
            case 'Twitter':
            case 'X':
                return 'twitter';
            case 'Instagram':
                return 'instagram';
            case 'LinkedIn':
                return 'linkedin';
            case 'Pinterest':
                return 'pinterest';
            case 'Webhook':
                return 'webhook';
            case 'ORM':
                return 'orm';
            case 'Social media':
                return 'socialMedia';
            case 'Paid media':
                return 'paidMedia';
            case 'Video':
                return 'video';
            case 'Webinar':
                return 'webinar';
            case 'Direct mail':
                return 'directMail';
            default:
                return null;
        }
    };
    const channelKey = getChannelKey(infoSelectedType);
    const filteredFactData = channelKey ? filterModaldata[channelKey] || [] : [];
    const factModals = _map(filteredFactData, (list) => ({
        id: list?.blastId,
        text: list?.blastName || list.blastId,
        data: list,
    }));
    // console.log(factModals, 'factmodals');
    return (
        <div className="detail-body detail-list">
            {infoSelectedType ? (
                infoSelectedType !== 'QR code' ? (
                    <ul>
                        <li>
                            <div>
                                <p className="font-smd">Unique audience size</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.uniqueAudience)})</p>
                            </div>
                        </li>
                    </ul>
                ) : (
                    <ul className="noborder">
                        <li>
                            <div>
                                <p className="font-xsm">Total Recipient count</p>
                            </div>
                            <div>
                                <p className="font-sm">- {numberWithCommas(audience.uniqueAudience)}</p>
                            </div>
                        </li>
                    </ul>
                )
            ) : null}
            {infoSelectedType && infoSelectedType !== 'QR code' && (
                <h5 className="font-smd">Pre-communication scrubbed before publish</h5>
            )}
            {infoSelectedType !== 'QR code' && (
                <ul>
                    {(infoSelectedType === 'WhatsApp' || infoSelectedType === 'RCS') && (
                        <>
                            <li>
                                <div>
                                    <p>Unsubscribed</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.unSubscribed)})</p>
                                </div>
                            </li>{' '}
                            <li>
                                <div>
                                    <p> Frequency cap</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.frequencyCap)})</p>
                                </div>
                            </li>{' '}
                            <li>
                                <div>
                                    <p> Sent count</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.sentCount)})</p>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <p>OptedOut</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.optedOut)})</p>
                                </div>
                            </li>
                        </>
                    )}
                    {infoSelectedType === 'SMS' && (
                        <li>
                            <div>
                                <p>DND</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.dndCount)})</p>
                            </div>
                        </li>
                    )}
                    {infoSelectedType === 'Email' && (
                        <li>
                            <div>
                                <p>Spam</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.spam)})</p>
                            </div>
                        </li>
                    )}
                    {infoSelectedType === 'Email' && (
                        <li>
                            <div>
                                <p>Bounced</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.bounced)})</p>
                            </div>
                        </li>
                    )}
                    {(infoSelectedType === 'Web notification' ||
                        infoSelectedType === 'Email' ||
                        infoSelectedType === 'SMS' ||
                        infoSelectedType === 'Mobile notification') && (
                        <li>
                            <div>
                                <p>Unsubscribed</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.unSubscribed)})</p>
                            </div>
                        </li>
                    )}
                    {(infoSelectedType === 'Email' || infoSelectedType === 'SMS') && (
                        <li>
                            <div>
                                <p>Frequency cap</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.frequencyCap)})</p>
                            </div>
                        </li>
                    )}
                    {(infoSelectedType === 'Email' || infoSelectedType === 'SMS') && (
                        <li>
                            <div>
                                <p>Control group</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.cgCount)})</p>
                            </div>
                        </li>
                    )}
                    {(infoSelectedType === 'Web notification' ||
                        infoSelectedType === 'SMS' ||
                        infoSelectedType === 'Mobile notification') && (
                        <li>
                            <div>
                                <p>Suppression list</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.supressionList)})</p>
                            </div>
                        </li>
                    )}

                    {(infoSelectedType === 'Web notification' ||
                        infoSelectedType === 'Email' ||
                        infoSelectedType === 'SMS' ||
                        infoSelectedType === 'Mobile notification') && (
                        <li>
                            <div>
                                <p>Sent count</p>
                            </div>
                            <div>
                                <p className="font-sm">- ({numberWithCommas(audience.sentCount)})</p>
                                {/* <p> - (0)</p> */}
                            </div>
                        </li>
                    )}
                </ul>
            )}

            {infoSelectedType !== 'QR code' && <p className="white font-smd">After communication blast count</p>}
            {summary?.campaignType === 'M' ? (
                <ul>
                    {factModals?.map((fact, idx) => {
                        const { data = {} } = fact;

                        const factAudience = {
                            afterBounced:
                                (data?.softBouncedCount || 0) +
                                (data?.quarantinedCount || 0) +
                                (data?.hardBouncedCount || 0),
                            deliveyCount: data?.deliveredCount || 0,
                            totalRecipientCount: data?.totalNoOfRecipientsCount || 0,
                            messageCount: data?.messageCount || 0,
                            noOfMessageCount: data?.noOfAudienceCount || 0,
                            mobilePushDeliveredCount: data?.totalDeliveredCount || 0,
                            mobilePushMessageCount: data?.totalMessageCount || 0,
                            mobilePushUndeliveredCount: data?.unDeliveredCount || 0,
                            appUninstallCount: data?.appUninstallCount || 0,
                            afterdndCount: data?.dndCount || 0,
                            totalAudienceCount: data?.totalAudienceCount || 0,
                        };
                        return (
                            <>
                                <li>
                                    <div>
                                        <p>Name</p>
                                    </div>
                                    <div>
                                        <p className="font-sm">{fact?.text}</p>
                                    </div>
                                </li>

                                {/* Email */}

                                {infoSelectedType === 'Email' && (
                                    <>
                                        <li>
                                            <div>
                                                <p>Bounced</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">- ({numberWithCommas(factAudience.afterBounced)})</p>
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <p> Delivered count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.deliveyCount)})
                                                </p>
                                            </div>
                                        </li>
                                    </>
                                )}

                                {/* WhatsApp */}

                                {(infoSelectedType === 'WhatsApp' || infoSelectedType === 'RCS') && (
                                    <>
                                        <li>
                                            <div>
                                                <p> Delivered count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.deliveyCount)})
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <p>Message count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.totalRecipientCount)})
                                                </p>
                                            </div>
                                        </li>
                                    </>
                                )}
                                {infoSelectedType === 'Web notification' && (
                                    <>
                                        <li>
                                            <div>
                                                <p>Delivered count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.deliveyCount || 0)})
                                                </p>
                                            </div>
                                        </li>
                                        {/* <li>
                                            <div>
                                                <p>Message count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.noOfMessageCount)})
                                                </p>
                                            </div>
                                        </li> */}
                                        <li>
                                            <div>
                                                <p>Undelivered</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - (
                                                    {numberWithCommas(
                                                        factAudience.totalAudienceCount - factAudience.messageCount,
                                                    )}
                                                    )
                                                </p>
                                            </div>
                                        </li>
                                    </>
                                )}

                                {infoSelectedType === 'Mobile notification' && (
                                    <>
                                        <li>
                                            <div>
                                                <p> Delivered count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.mobilePushDeliveredCount || 0)})
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <p>Message count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.mobilePushMessageCount)})
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <p>Undelivered</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.mobilePushUndeliveredCount || 0)}
                                                    )
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <p>App uninstalls count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - {numberWithCommas(factAudience.appUninstallCount)}
                                                </p>
                                            </div>
                                        </li>
                                    </>
                                )}

                                {/* SMS */}
                                {infoSelectedType === 'SMS' && (
                                    <>
                                        <li>
                                            <div>
                                                <p>DND</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.afterdndCount)})
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <p> Delivered count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.deliveyCount)})
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <div>
                                                <p>Message count</p>
                                            </div>
                                            <div>
                                                <p className="font-sm">
                                                    - ({numberWithCommas(factAudience.noOfMessageCount)})
                                                </p>
                                            </div>
                                        </li>
                                    </>
                                )}
                            </>
                        );
                    })}
                </ul>
            ) : (
                <>
                    <ul>
                        {/* {(infoSelectedType !== 'Mobile' || infoSelectedType !== 'QR code') && (
                            <li>
                                <div>
                                    <p>Name</p>
                                </div>
                                <div>
                                    <p className="font-sm">{infoSelectedType}</p>
                                </div>
                            </li>
                        )} */}
                        {(infoSelectedType === 'WhatsApp' || infoSelectedType === 'RCS') && (
                            <>
                                <li>
                                    <div>
                                        <p> Delivered count</p>
                                    </div>
                                    <div>
                                        <p className="font-sm">- ({numberWithCommas(audience.deliveyCount)})</p>
                                    </div>
                                </li>
                                <li>
                                    <div>
                                        <p>Message count</p>
                                    </div>
                                    <div>
                                        <p className="font-sm">- ({numberWithCommas(audience.totalRecipientCount)})</p>
                                    </div>
                                </li>
                            </>
                        )}
                        {infoSelectedType === 'SMS' && (
                            <li>
                                <div>
                                    <p>DND</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.afterdndCount)})</p>
                                </div>
                            </li>
                        )}
                        {infoSelectedType === 'Email' && (
                            <li>
                                <div>
                                    <p>Bounced</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.afterBounced)})</p>
                                </div>
                            </li>
                        )}
                        {infoSelectedType === 'Web notification' && (
                            <li>
                                <div>
                                    <p>Undelivered</p>
                                </div>
                                <div>
                                    <p className="font-sm">
                                        - ({numberWithCommas(audience.totalAudienceCount - audience.messageCount)})
                                    </p>
                                </div>
                            </li>
                        )}
                        {infoSelectedType === 'Mobile notification' && (
                            <li>
                                <div>
                                    <p>Undelivered</p>
                                </div>
                                <div>
                                    <p className="font-sm">
                                        - ({numberWithCommas(audience.deliveyCount - audience.mobilePushCount)})
                                    </p>
                                </div>
                            </li>
                        )}
                        {(infoSelectedType === 'Web notification' ||
                            infoSelectedType === 'Email' ||
                            infoSelectedType === 'SMS') && (
                            <li>
                                <div>
                                    <p>Delivered count</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.deliveyCount)})</p>
                                </div>
                            </li>
                        )}
                        {infoSelectedType === 'Mobile notification' && (
                            <li>
                                <div>
                                    <p>Delivered count</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.mobilePushDeliveredCount)})</p>
                                </div>
                            </li>
                        )}
                        {(infoSelectedType === 'SMS' || infoSelectedType === 'Mobile notification') && (
                            <li>
                                <div>
                                    <p>Message count</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.noOfMessageCount)})</p>
                                </div>
                            </li>
                        )}
                        {/* {infoSelectedType === 'Web notification' && (
                            <li>
                                <div>
                                    <p>Message count</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.messageCount)})</p>
                                </div>
                            </li>
                        )} */}
                        {infoSelectedType === 'Mobile notification' && (
                            <li>
                                <div>
                                    <p>App uninstalls count</p>
                                </div>
                                <div>
                                    <p className="font-sm">- ({numberWithCommas(audience.appUninstallCount)})</p>
                                </div>
                            </li>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
};

export default InfoOverview;
