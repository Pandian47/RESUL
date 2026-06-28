import CommunicationDashboard from '../../Pages/CommunicationDashboard/CommunicationDashboard';
import MobileLiveAudienceDashboard from '../../Pages/MobileLiveAudienceDashboard/MobileLiveAudienceDashboard';
import WebLiveAudienceDashboard from '../../Pages/WebLiveAudienceDashboard/WebLiveAudienceDashboard';

const RenderDashboard = ({ page }) => {
    switch (page) {
        case 'Communication dashboard':
            return <CommunicationDashboard />;
        case 'Mobile live audience dashboard':
            return <MobileLiveAudienceDashboard />;
        case 'Web live audience dashboard':
            return <WebLiveAudienceDashboard />;
        default:
            return <CommunicationDashboard />;
    }
};

export default RenderDashboard;
