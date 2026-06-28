import { NOT_VERIFIED, VERIFIED } from 'Constants/GlobalConstant/Placeholders';
import { bold_close_medium, checkbox_medium, sdk_smart_link_medium } from 'Constants/GlobalConstant/Glyphicons';
import { SDK_STATUS } from '../constant.jsx';
import RSTooltip from 'Components/RSTooltip/index.jsx';
const SDKStatus = ({ value, channelId, isInfo = false }) => {
    return (
        <div className='bg-tertiary-blue p10 border-r7'>
            <h4 className="mb10 text-left">{isInfo ? "SDK details" :SDK_STATUS.title}</h4>
            <div className="d-flex">
                <i className={`${sdk_smart_link_medium} icon-md color-primary-blue cursor-default mr5`} />
                <span className="cursor-default color-primary-blue">
                    {channelId === 14 ? 'App analytics' : SDK_STATUS.value}
                </span>
                <RSTooltip text={value?.sdkStatus ? VERIFIED : NOT_VERIFIED} position='top' className="bottom1 lh0 ml10 position-relative">
                <i
                    className={
                        value?.sdkStatus
                            ? `${checkbox_medium} icon-md color-primary-green cursor-default`
                            : `${bold_close_medium} icon-md color-primary-red cursor-default`
                    }
                />
                </RSTooltip>
            </div>
        </div>
    );
};

export default SDKStatus;
