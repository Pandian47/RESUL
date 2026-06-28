import { getChannelId } from 'Utils/modules/communicationChannels';
import { truncateTitle } from 'Utils/modules/displayCore';
import RSTooltip from 'Components/RSTooltip';

const CampaignDetails = ({ campaign: { item } }) => {
    return (
        <div className="aa360-communication-dropdown-item pt5">
            {item?.title?.length > 30 ? (
                <RSTooltip position="top" text={item?.title} innerContent={false} className="modalOverlayZindexCSS">
                    <h6 className="truncate224 mb0 cursor-default color-primary-blue">
                        {truncateTitle(item?.title, 30)}
                    </h6>
                </RSTooltip>
            ) : (
                <h6 className="truncate224 mb0 cursor-default color-primary-blue">{item?.title}</h6>
            )}

            <ul className="d-flex align-items-center cursor-default mt5 mb0 pl0">
                {item?.channelId?.map((channelId, index) => {
                    const iconValue = getChannelId(String(channelId).trim());
                    if (!iconValue?.icon) return null;

                    return (
                        <li
                            key={`${channelId}-${index}`}
                            className="social-icon white mr10 lh0"
                            style={{ backgroundColor: iconValue.color }}
                        >
                            <RSTooltip text={iconValue.label} innerContent={false}>
                                <i className={`${iconValue.icon} icon-md cursor-default`} />
                            </RSTooltip>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default CampaignDetails;
