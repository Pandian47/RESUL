import ConsumablesInvoice from './Pages/ConsumablesInvoice';
import SubscriptionInvoice from './Pages/SubscriptionInvoice';

export const INVOICE_TAB_CONFIG = [
    {
        id: 'SubscriptionInvoice',
        text: 'Subscription invoice',
        component: () => <SubscriptionInvoice />,
    },
    {
        id: 'ConsumablesInvoice',
        text: 'Consumables invoice',
        component: () => <ConsumablesInvoice />,
        disable: true,
    },
];
