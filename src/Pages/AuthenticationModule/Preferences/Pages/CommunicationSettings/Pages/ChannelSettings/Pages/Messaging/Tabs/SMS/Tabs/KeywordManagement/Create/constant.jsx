import ComplianceKeywords from './Components/ComplianceKeywords';
import CustomKeywords from './Components/CustomKeywords';

export const getTABCONFIG = (clientSmsSenderID, isCreate = false) => [
    {
        id: 1,
        text: 'Compliance keywords',
        component: () => <ComplianceKeywords clientSmsSenderID={clientSmsSenderID} isCreate={isCreate} />,
    },
    {
        id: 2,
        text: 'Custom keywords',
        component: () => <CustomKeywords clientSmsSenderID={clientSmsSenderID} isCreate={isCreate}/>,
    },
];

export const FORM_INITIAL_STATE = {
    defaultValues: {
        senderID: '',
        friendlyBrandName: '',
        inboundNumber: '',
        a2pType: '',
    },
    mode: 'onTouched',
};