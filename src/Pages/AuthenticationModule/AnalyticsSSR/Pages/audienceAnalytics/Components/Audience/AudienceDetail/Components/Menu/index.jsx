import { download_large } from 'Constants/GlobalConstant/Glyphicons';
import { downloadIcons } from 'Pages/AuthenticationModule/AnalyticsSSR/Pages/audienceAnalytics/constants';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSTooltip from 'Components/RSTooltip';

const MenuAudienceDetails = () => {
    return (
        <div>
            <BootstrapDropdown
                data={downloadIcons}
                flatIcon
                defaultItem={
                    <RSTooltip position="top" text="Downloads">
                        <i id='rs_data_download' className={`${download_large} icon-lg color-primary-blue`} />
                    </RSTooltip>
                }
                showUpdate={false}
                className="no_caret"
                alignRight
            />
        </div>
    );
};

export default MenuAudienceDetails;
