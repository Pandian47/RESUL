const LIST = 'List';
const GALLERY = 'Gallery';
const PLANNER = 'Planner';
export const CHANNEL = 'Channel';
export const FRIENDLY_NAME = 'Friendly name';
export const SUBSEGMENT_NAME ='Sub-Segment name'
export const STATUS = 'Status';
export const POST_TYPE = 'Post type';
export const ACTION = 'Actions';

import CommunicationGallery from './Pages/Gallery';
import CommunicationListings from './Pages/Listings/CommunicationListings';
import CommunicationPlanner from './Pages/Planner';
import CommunicationGalleryTwins from './Pages/GalleryTwins';
import CommunicationPlannerTwins from './Pages/PlannerTwins';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

export const PlannerCampaignTruncateCell = ({ value, wrapperClassName = 'repo-label', truncateClassName = '' }) => (
    <TruncatedCell
        value={value}
        noTable
        wrapperClassName={wrapperClassName}
        truncateClassName={truncateClassName}
    />
);

export const tabData = [
    { id: 0, text: LIST, component: () => <CommunicationListings /> },
    { id: 1, text: GALLERY, component: () => <CommunicationGallery /> },
    { id: 2, text: PLANNER, component: () => <CommunicationPlanner /> },
];


export const tabDataTwins = [
    { id: 0, text: LIST, component: () => <CommunicationListings /> },
    { id: 1, text: GALLERY, component: () => <CommunicationGalleryTwins /> },
    { id: 2, text: PLANNER, component: () => <CommunicationPlannerTwins /> },
];