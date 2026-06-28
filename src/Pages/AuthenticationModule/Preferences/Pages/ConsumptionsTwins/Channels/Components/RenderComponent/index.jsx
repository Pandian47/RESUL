import PropTypes from 'prop-types';

import ConsumptionEmail from '../Channels/Email/Email';
import ConsumptionSms from '../Channels/SMS/Sms';
import ConsumptionWebPush from '../Channels/Webpush/WebPush';
import ConsumptionMobilePush from '../Channels/MobilePush/MobilePush';
import ConsumptionWhatsApp from '../Channels/WhatsApp/WhatsApp';
import ConsumptionVMS from '../Channels/VMS/VMS';
import ConsumptionEvents from '../Channels/Events/Events';
import ConsumptionSocialMedia from '../Channels/Facebook/SocialMedia';
import ConsumptionQr from '../Channels/Qr/Qr';
import ConsumptionOffers from '../Channels/Offers/Offers';
import ConsumptionSmartLinks from '../Channels/SmartLinks/SmartLinks';
import ConsumptionVoice from '../Channels/Voice/Voice';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import ConsumptionRcs from '../Channels/Rcs/Rcs';
import ConsumptionCommunicationResponse from '../Channels/CommunicationResponse/CommunicationResponse';
import ConsumptionsPaidMedia from '../Channels/PaidMedia/PaidMedia';
import VersarConsumption from '../Channels/VersarConsumption/VersarConsumption';
import { useSelector } from 'react-redux';
import { globalStateSelector } from 'Utils/Selectors/app';

const RenderComponent = ({ currentPage }) => {
    const { consumptionChannel } = useSelector((state) => globalStateSelector(state));
    const isVersium = consumptionChannel?.lable === 'Versium' || consumptionChannel?.isVersium;
    //debugger
    //console.log(currentPage,"currentPage");
    switch (currentPage) {
        case 1:
            return <ConsumptionEmail />;
        case 2:
            return <ConsumptionSms />;
        case 8:
            return <ConsumptionWebPush />;
        case 9:
        case 14:
            return <ConsumptionMobilePush />;
        case 21:
            return <ConsumptionWhatsApp />;
        case 3:
            return <ConsumptionQr />;
        case 38:
            return <ConsumptionOffers />;
		case 120:
            return <ConsumptionSmartLinks />;
        case 10:
            return <ConsumptionsPaidMedia />;
        case 25:
            return <ConsumptionVMS />;
        case 39:
            return <ConsumptionEvents />;
        case 40:
            return <ConsumptionCommunicationResponse />;
        case 41:
            return <ConsumptionRcs />;
        case 42:
            return <VersarConsumption />;
        case 7:
            return <ConsumptionSocialMedia />;
        case 26:
            return <ConsumptionVoice />;
        default:
            return <RSSkeletonTable text={true} count={5} />;
    }
};
RenderComponent.propTypes = {
    currentPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
export default RenderComponent;
