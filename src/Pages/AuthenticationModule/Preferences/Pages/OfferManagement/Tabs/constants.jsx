import OfferListing from './OfferListing';
import BrandsShops from './BrandsShops';

export const OFFER_TAB_CONFIG = [
    {
        id: 3001,
        text: 'Offer listing',
        disable: false,
        component: () => <OfferListing />,
    },
    {
        id: 3002,
        text: 'Brands & Shops',
        disable: false,
        component: () => <BrandsShops />,
    },
];