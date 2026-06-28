import DynamicList from './Pages/DynamicList';
import TargetList from './Pages/TargetList';
import MasterData from './Pages/MasterData';
import i18n from '../../../i18n';

const translation = i18n.t.bind(i18n);

export const AUDIENCE_TAB_CONFIG = [
    {
        id: 1001,
        text: translation('Master data management'),
        disable: false,
        component: () => <MasterData />,
    },
    {
        id: 1002,
        text: 'Segments & lists',
        disable: false,
        component: () => <TargetList />,
    },
    {
        id: 1003,
        text:'Dynamic lists',
        disable: false,
        component: () => <DynamicList />,
    },
];
