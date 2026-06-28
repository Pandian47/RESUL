import Create from '../Create/Create';
import Import from 'Pages/AuthenticationModule/Components/Import';
import Template from '../../../Email/Component/Template/Template';
import ImportWeb from './Component/ImportWeb/ImportWeb'
export const TABBER_CONFIG = (isAlertPush, deliveryTypeId) => {
    const isInPageContent = deliveryTypeId === 5;
    return [
        {
            id: 'create',
            text: 'Rich text',
            component: () => <Create key={`create`} />,
            disable: isInPageContent,
        },
        {
            id: 'import',
            text: 'Import',
            component: () => <ImportWeb key={`import`} isNotification={true} channelId={8} type={'web'} />,
            disable: isInPageContent ? false : isAlertPush,
        },
        {
            id: 'template',
            text: 'Template',
            component: () => <Template key={`template`} isNotification={'Web'} channelId={8} />,
            disable: isInPageContent || isAlertPush,
        },
    ];
};
export const SPLIAB_TABBER_CONFIG = (fieldName, type, fromId, index) => {
    const isInPageContent = fromId === 5;
    const isAlertPush = fromId === 1;
    return [
        {
            id: 'create',
            text: 'Rich text',
            component: () => <Create key={`${fieldName}.create`} fieldName={fieldName} isSplit />,
            disable: isInPageContent || (isAlertPush ? false : type),
        },
        {
            id: 'import',
            text: 'Import',
            component: () => <ImportWeb key={`${fieldName}.import`} fieldName={fieldName} isSplit isNotification={true} channelId={8} index={index} />,
            disable: isInPageContent ? false : type,
        },
        {
            id: 'template',
            text: 'Template',
            component: () => <Template key={`template`} isNotification={'Web'} channelId={8} fieldName={fieldName} isSplit />,
            disable: isInPageContent || type,
        },
    ];
};
