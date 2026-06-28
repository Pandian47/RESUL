import { getUserDetails } from 'Utils/modules/crypto';
import CommunicationAnalytics from './Pages/communicationAnalytics';
import AudienceAnalytics from './Pages/audienceAnalytics';
import AuditLog from './Pages/auditLog';


const { licenseTypeId } = getUserDetails();
const disableAA360 = parseInt(licenseTypeId, 10) !== 3;

export const ANALYTICS_TAB_CONFIG = [
    {
        id: 2001,
        text: 'Communication analytics',
        disable: false,
        component: () => <CommunicationAnalytics />,
    },
    {
        id: 2002,
        text: 'Audience analytics 360',
        disable: disableAA360,
        component: () => <AudienceAnalytics />,
    },
    {
        id: 2003,
        text: 'Audit log report',
        disable: false,
        component: () => <AuditLog />,
    },
]; 