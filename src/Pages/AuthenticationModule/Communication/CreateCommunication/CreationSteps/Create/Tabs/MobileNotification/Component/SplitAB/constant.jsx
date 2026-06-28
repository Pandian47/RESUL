import Create from '../Create/Create';
import Import from 'Pages/AuthenticationModule/Components/Import';
import Template from '../../../Email/Component/Template/Template';
import ImportMobile from './Component/ImportMobile/ImportMobile';

export const TABBER_CONFIG = (type, audioList = []) => [
    {
        id: 'create',
        text: 'Rich text',
        component: () => <Create key={`create`} />,
    },
    {
        id: 'import',
        text: 'Import',
        component: () => (
            <ImportMobile
                key={`import`}
                isNotification={true}
                channelId={14}
                type="mobile"
                audioList={audioList}
            />
        ),
        disable: type,
    },
    {
        id: 'template',
        text: 'Template',
        component: () => <Template key={`template`} isNotification={'Mobile'} channelId={14} />,
        disable: type,
    },
];
export const SPLIAB_TABBER_CONFIG = (fieldName, type, fromId, audioList = [], index) => {
    return [
        {
            id: 'create',
            text: 'Rich text',
            component: () => <Create key={`${fieldName}.create`} fieldName={fieldName} isSplit />,
            disable: fromId === 1 ? false : type,
        },
        {
            id: 'import',
            text: 'Import',
            component: () => (
                <ImportMobile
                    key={`${fieldName}.import`}
                    fieldName={fieldName}
                    isSplit
                    isNotification={true}
                    channelId={14}
                    type="mobile"
                    audioList={audioList}
                    index={index}
                />
            ),
            disable: type,
        },
        {
            id: 'template',
            text: 'Template',
            component: () => <Template key={`template`} isNotification={'Mobile'} channelId={14} fieldName={fieldName} isSplit />,
            disable: type,
        },
    ];
};
