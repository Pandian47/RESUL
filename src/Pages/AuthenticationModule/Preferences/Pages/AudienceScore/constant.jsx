import { brand_large, communication_response_sync_large, purchase_pattern_large, user_card_large, user_laddering_large, user_persona_large } from 'Constants/GlobalConstant/Glyphicons';
import Persona from './Pages/Persona';
import ProfileData from './Pages/ProfileData';
import PurchasePattern from './Pages/PurchasePattern';
import AudienceLaddering from './Pages/AudienceLaddering';
import CommunicationResponse from './Pages/CommunicationResponse';

export const VERTICAL_TAB_CONFIG = [
    { id: 'Persona', text: 'Persona', iconLeft: `${user_persona_large} icon-lg`, component: () => <Persona /> },

    {
        id: 'PurchasePattern',
        text: 'Purchase pattern',
        iconLeft: `${purchase_pattern_large} icon-lg`,
        component: () => <PurchasePattern />,
    },

    {
        id: 'ProfileData',
        text: 'Profile data',
        iconLeft: `${user_card_large} icon-lg`,
        component: () => <ProfileData />,
    },

    {
        id: 'CommunicationResponse',
        text: 'Communication response',
        iconLeft: `${communication_response_sync_large} icon-lg`,
        component: () => <CommunicationResponse />,
    },

    {
        id: 'AudienceLaddering',
        text: 'Audience laddering',
        iconLeft: `${user_laddering_large} icon-lg`,
        component: () => <AudienceLaddering />,
    },
];

export const PERSONA_CARD_CONFIG = [
    { id: 'Industry', text: 'Personas', iconLeft: `${user_persona_large} icon-lg`, component: () => <Persona /> },
    { id: 'Company', text: 'Company', iconLeft: `${brand_large} icon-lg`, component: () => <Persona /> },
    {
        id: 'ProfileData',
        text: 'Profile data',
        iconLeft: `${user_card_large} icon-lg`,
        component: () => <ProfileData />,
    },

    {
        id: 'CommunicationResponse',
        text: 'Communication response',
        iconLeft: `${communication_response_sync_large} icon-lg`,
        component: () => <CommunicationResponse />,
    },

    {
        id: 'AudienceLaddering',
        text: 'Audience laddering',
        iconLeft: `${user_laddering_large} icon-lg`,
        component: () => <AudienceLaddering />,
    },
];

export const PERSONA_HEADING_DATA = ['A', 'B', 'C', 'D'];
