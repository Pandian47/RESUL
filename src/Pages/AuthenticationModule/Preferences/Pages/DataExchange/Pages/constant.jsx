import { app_store_large, audience_dynamic_list_xlarge, audience_target_list_xlarge, cart_large, chatbot_large, circle_grid_large, communication_response_xlarge, data_large, dmp_large, email_list_xlarge, map_large, messaging_large, propensity_xlarge, smart_duo_xlarge, social_post_large, social_share_large, tag_offer_xlarge, user_360_analytics_xlarge, user_segments_large, web_analytics_large, webinar_large } from 'Constants/GlobalConstant/Glyphicons';
import { lazy, Suspense } from 'react';
// import { connectorList } from './DataIngestion/constant';

import { DataExchangeIntegratedSystemsGridSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

const LazyDataSubComponent = lazy(() => import('./DataIngestion/Components/pages/DataSubComponent'));

const DataSubComponent = (props) => (
    <Suspense fallback={<DataExchangeIntegratedSystemsGridSkeleton />}>
        <LazyDataSubComponent {...props} />
    </Suspense>
);

const addTabType = (arr, type) => {
    let _arr = arr?.map((e) => ({ ...e, type }));
    return _arr;
};

const webAnalytics = [
];

const mobileAnalytics = [
];

const tagManagement = [
];

const groupConnectorData = (connectors) => {
    const groupedData = {};
    connectors?.forEach((connector) => {
        const group = connector?.sourceGroupName;
        if (!groupedData[group]) {
            groupedData[group] = [];
        }
        groupedData[group].push(connector);
    });
    return groupedData;
};

export const getDatas = (connectorList, currentTab) => {
    const finalGroupData = connectorList?.length ? groupConnectorData(connectorList) : {};
    
    let updateData = {};
    const isCurrentTabAll = currentTab === 'ALL' ? true : false;

    if (!isCurrentTabAll) {
        const checkData = Object.entries(finalGroupData)?.find(([key, value]) => {
            if (currentTab === key) {
                return {
                    [key]: value,
                };
            }
        });

        updateData = {
            [checkData[0]]: checkData[1],
        };
    }

    let check =  {
        'ALL' : [],
        ...finalGroupData
    }

    const allData = Object.entries(check)?.map(([key, value], ind) => ({
        id: key.toLowerCase(),
        text: key,
        iconLeft: '',
        component: () => {
            return <DataSubComponent type={key} id={ind + 1} subTab={isCurrentTabAll ? finalGroupData : updateData} />;
        },
    }));

    return [...allData];
};

const types = {
    'All' :{
        'Analytics': ['Web analytics','Mobile analytics','Tag management','Pixel retargeting','Video analytics'],
        'CRM': ['CRM'],
        'E-Commerce': ['E-Commerce'],
        'Social media': ['Social media'],
        'Data service': ['Paid media','Data management platform(DMP)','Data service'],
        'Messengers': ['Messengers'],
        'Webinar': ['Webinar'],
        'Digital assistance': ['Voice assistant','Chat bot'],
        'Digital asset': ['Product information management(PIM)','Digital asset management(DAM)','Template builder'],
        'CMS': ['CMS'],
        'Sensors': ['Sensors'],
        'Data base': ['SQL','Cloud sources','No SQL'],
        'Mobile app': ['Mobile app'],
        'Extended system': ['Extended channel']
    },
    'Analytics':{
        'Analytics': ['Web analytics','Mobile analytics','Tag management','Pixel retargeting','Video analytics'],
    },
    'CRM':{
        'CRM': ['CRM'],
    },
    'E-Commerce':{
        'E-Commerce': ['E-Commerce'],
    },
    'Social media': {
        'Social media': ['Social media']
    },
    'Data service': {
        'Data service': ['Paid media','Data management platform(DMP)','Data service'],
    },
    'Messengers': {
        'Messengers': ['Messengers']
    },
    'Webinar': {
        'Webinar': ['Webinar'],
    },
    'Digital assistance': {
        'Digital assistance': ['Voice assistant','Chat bot'],
    },
    'Digital asset': {
        'Digital asset': ['Product information management(PIM)','Digital asset management(DAM)','Template builder'],
    },
    'CMS': {
        'CMS': ['CMS'],
    },
    'Sensors': {
        'Sensors': ['Sensors'],
    },
    'Data base': {
        'Data base': ['SQL','Cloud sources','No SQL'],
    },
    'Mobile app': {
        'Mobile app': ['Mobile app'],
    },
    'Extended system': {
        'Extended system': ['Extended channel']
    }
}
const DataExchangeIcons = {
   'All' :{
    id: 0,
    icon : circle_grid_large
    },
    'Analytics':{
        id: 1,
        icon : web_analytics_large
    },
    'CRM':{
        id: 2,
        icon : user_segments_large
    },
    'E-Commerce':{
        id: 3,
        icon : cart_large
    },
    'Social media': {
        id: 4,
        icon : social_post_large
    },
    'Data service': {
        id: 5,
        icon : dmp_large
    },
    'Messengers': {
        id: 6,
        icon : messaging_large
    },
    'Webinar': {
        id: 7,
        icon : webinar_large
    },
    'Digital assistance': {
        id: 8,
        icon : chatbot_large
    },
    'Digital asset': {
        id: 9,
        icon : web_analytics_large
    },
    'CMS': {
        id: 10,
        icon : web_analytics_large
    },
    'Sensors': {
        id: 11,
        icon : map_large
    },
    'Data base': {
        id: 12,
        icon : data_large
    },
    'Mobile app': {
        id: 13,
        icon : app_store_large
    },
    'Extended system': {
        id: 14,
        icon : social_share_large
    }
};
export const AUDIENCE_RDSTAB_CONFIG = ['Extended channel', 'Social media', 'Web analytics', 'Mobile analytics', 'Tag management', 'Video analytics', 'Paid media', ,'Webinar', 'Template builder', 'CMS'];
export const getTabData = (connectorLists) => {
    const tabConfig = [];
    let connectorList = connectorLists;

    for (const type in types) {
        let subTabss = {};

        if (!types.hasOwnProperty(type)) continue;

        for (const key in types[type]) {
            if (!types[type].hasOwnProperty(key)) continue;

            let groupNames = types[type][key];
           if (Array.isArray(groupNames)) {
                groupNames.forEach((groupName) => {
                    const filteredData = connectorList?.filter(
                        (e) => e?.sourceGroupName === groupName
                    );
                    if (filteredData?.length) {
                        subTabss[groupName] = addTabType(filteredData, key);
                    }
                });
           }
        }
        if (Object.keys(subTabss)?.length > 0) {            
            tabConfig.push({
                id: type.toLowerCase(),
                text: type,
                iconLeft: `${DataExchangeIcons[type]?.icon} icon-lg`,
                component: () => (
                    <DataSubComponent type={type} id={DataExchangeIcons[type]?.id} subTab={subTabss} />
                ),
            });
        }
    }

    return tabConfig;

}

const publishersList = [
];

export const VERTICAL_TAB_CONFIG_PUBLISH = [
    {
        id: 'ALL',
        text: 'All',
        iconLeft: `${circle_grid_large} icon-lg`,
        component: () => (
            <DataSubComponent
                type={'ALL'}
                id={0}
                subTab={{
                    'Available systems': addTabType(publishersList, 'Availablesystems'),
                }}
            />
        ),
    },
    {
        id: 'analytics',
        text: 'Analytics',
        iconLeft: `${web_analytics_large} icon-lg`,
        component: () => (
            <DataSubComponent
                id={1}
                type={'Analytics'}
                subTab={{
                    'Web analytics': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Web analytics';
                        }),
                        'Analytics',
                    ),
                    'Mobile analytics': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Mobile analytics';
                        }),
                        'Analytics',
                    ),
                    'Tag management': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Tag management';
                        }),
                        'Analytics',
                    ),
                    'Pixel retargeting': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Pixel retargeting';
                        }),
                        'Analytics',
                    ),
                    'Video analytics': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Video analytics';
                        }),
                        'Analytics',
                    ),
                }}
            />
        ),
    },
    {
        id: 'crm',
        text: 'CRM',
        iconLeft: `${user_segments_large} icon-lg`,
        component: () => (
            <DataSubComponent
                id={2}
                type={'CRM'}
                subTab={{
                    CRM: addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'CRM';
                        }),
                        'CRM',
                    ),
                }}
            />
        ),
    },
    {
        id: 'eCommerce',
        text: 'E-Commerces',
        iconLeft: `${cart_large} icon-lg`,
        type: 'e-Commerce',
        component: () => (
            <DataSubComponent
                id={3}
                type={'E-Commerce'}
                subTab={{
                    'E-Commerce': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'E-Commerce';
                        }),
                        'E-Commerce',
                    ),
                }}
            />
        ),
    },
    {
        id: 'sociaMedia',
        text: 'Social media',
        iconLeft: `${social_post_large} icon-lg`,
        component: () => (
            <DataSubComponent
                id={4}
                type={'Social media'}
                subTab={{
                    'Social media': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Social media';
                        }),
                        'Social media',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Data service',
        text: 'Data service',
        iconLeft: `${dmp_large} icon-lg`,
        component: () => (
            <DataSubComponent
                id={5}
                type={'Data service'}
                subTab={{
                    'Paid media': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Paid media';
                        }),
                        'Data service',
                    ),
                    'Data management platform(DMP)': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Data management platform(DMP)';
                        }),
                        'Data service',
                    ),
                    'Data service': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Data service';
                        }),
                        'Data service',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Messengers',
        text: 'Messengers',
        iconLeft: `${messaging_large} icon-lg`,
        component: () => (
            <DataSubComponent
                id={6}
                type={'Messengers'}
                subTab={{
                    Messengers: addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Messengers';
                        }),
                        'Messengers',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Webinar',
        text: 'Webinar',
        iconLeft: `${webinar_large} icon-lg`,
        component: () => (
            <DataSubComponent
                id={7}
                type={'Webinar'}
                subTab={{
                    Webinar: addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Webinar';
                        }),
                        'Webinar',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Digital assistance',
        text: 'Digital assistance',
        iconLeft: `${chatbot_large} icon-lg`,
        type: 'Digital assistance',
        idNo: 8,
        component: () => (
            <DataSubComponent
                id={8}
                type={'Digital assistance'}
                subTab={{
                    'Voice assistant': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Voice assistant';
                        }),
                        'Digital assistance',
                    ),
                    'Chat bot': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Chat bot';
                        }),
                        'Digital assistance',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Digital asset',
        text: 'Digital asset',
        iconLeft: `${web_analytics_large} icon-lg`,
        type: 'Digital asset',
        idNo: 9,
        component: () => (
            <DataSubComponent
                id={9}
                type={'Digital asset'}
                subTab={{
                    'Product information management(PIM)': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Product information management(PIM)';
                        }),
                        'Digital asset',
                    ),
                    'Digital asset management(DAM)': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Digital asset management(DAM)';
                        }),
                        'Digital asset',
                    ),
                    'Template builder': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Template builder';
                        }),
                        'Digital asset',
                    ),
                    //  [
                    //     {
                    //         name: 'canva',
                    //         imagePath: Canva,
                    //     },
                    // ],
                }}
            />
        ),
    },
    {
        id: 'CMS',
        text: 'CMS',
        iconLeft: `${web_analytics_large} icon-lg`,
        type: 'CMS',
        idNo: 10,
        component: () => (
            <DataSubComponent
                id={10}
                type={'CMS'}
                subTab={{
                    CMS: addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'CMS';
                        }),
                        'CMS',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Sensors',
        text: 'Sensors',
        iconLeft: `${map_large} icon-lg`,
        type: 'Sensors',
        idNo: 11,
        component: () => (
            <DataSubComponent
                id={11}
                type={'Sensors'}
                subTab={{
                    Sensors: addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Sensors';
                        }),
                        'Sensors',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Data base',
        text: 'Data base',
        iconLeft: `${data_large} icon-lg`,
        type: 'Data base',
        idNo: 12,
        component: () => (
            <DataSubComponent
                id={12}
                type={'Data base'}
                subTab={{
                    SQL: addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'SQL';
                        }),
                        'Data base',
                    ),
                    'Cloud sources': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Cloud sources';
                        }),
                        'Data base',
                    ),
                    'No SQL': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'No SQL';
                        }),
                        'Data base',
                    ),
                }}
            />
        ),
    },
    {
        id: 'Mobile app',
        text: 'Mobile app',
        iconLeft: `${app_store_large} icon-lg`,
        type: 'Mobile app',
        idNo: 13,
        component: () => (
            <DataSubComponent
                id={13}
                type={'Mobile app'}
                subTab={{
                    'Mobile app': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Mobile app';
                        }),
                        'Extended system',
                    ),
                    // [
                    //     {
                    //         name: 'mobile app',
                    //         img: MobileApp,
                    //     },
                    // ],
                }}
            />
        ),
    },
    {
        id: 'Extended system',
        text: 'Extended system',
        iconLeft: `${social_share_large} icon-lg`,
        type: 'Extended system',
        idNo: 14,
        component: () => (
            <DataSubComponent
                id={14}
                type={'Extended system'}
                subTab={{
                    'Extended channel': addTabType(
                        connectorList?.filter((e) => {
                            return e?.sourceGroupName === 'Extended channel';
                        }),
                        'Extended system',
                    ),
                }}
            />
        ),
    },
];

export const API_CONSUMPTIONS = [
    {
        id: 1,
        icon: user_360_analytics_xlarge,
        text: 'Audience analytics 360',
        viewDetails: {
            icon: user_360_analytics_xlarge,
            title: 'Audience analytics 360',
            domain: 'www.mydomain.com/accessories/',
        },
    },
    {
        id: 2,
        icon: smart_duo_xlarge,
        text: 'Smart Duo',
        viewDetails: {
            icon: smart_duo_xlarge,
            title: 'Smart duo',
            domain: 'www.mydomain.com/accessories/',
        },
    },
    {
        id: 3,
        icon: email_list_xlarge,
        text: 'Print mailing list',
        viewDetails: {
            icon: email_list_xlarge,
            title: 'Print mailing list',
            domain: 'www.mydomain.com/accessories/',
        },
    },
    {
        id: 4,
        icon: communication_response_xlarge,
        text: 'Campaign response',
        viewDetails: {
            icon: communication_response_xlarge,
            title: 'Campaign response',
            domain: 'www.mydomain.com/accessories/',
        },
    },
    {
        id: 5,
        icon: propensity_xlarge,
        text: 'Propensity score',
        viewDetails: {
            icon: propensity_xlarge,
            title: 'Propensity score',
            domain: 'www.mydomain.com/accessories/',
        },
    },
    {
        id: 6,
        icon: audience_target_list_xlarge,
        text: 'Target List',
        viewDetails: {
            icon: audience_target_list_xlarge,
            title: 'Target list',
            domain: 'www.mydomain.com/accessories/',
        },
    },
    {
        id: 7,
        icon: tag_offer_xlarge,
        text: 'Offer',
        viewDetails: {
            icon: tag_offer_xlarge,
            title: 'Offer',
            domain: 'www.mydomain.com/accessories/',
        },
    },
    {
        id: 8,
        icon: audience_dynamic_list_xlarge,
        text: 'Dynamic List',
        viewDetails: {
            icon: audience_dynamic_list_xlarge,
            title: 'Dynamic list',
            domain: 'www.mydomain.com/accessories/',
        },
    },
];

export const dataExchangeSector = {
    adobeAnalitycs: {
        name: 'Adobe analytics',
        data: [
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
        ],
    },
    webTrends: {
        name: 'Webtrends',
        data: [
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
        ],
    },
    importData_bigcommerce: {
        name: 'Import data',
        data: [
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
        ],
    },
    importData_prestashop: {
        name: 'Import data',
        data: [
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
            { check: false, val: 'Test' },
        ],
    },
};
export const sdkData = {
    'Web analytics': addTabType(webAnalytics, 'Analytics'),
    'Mobile analytics': addTabType(mobileAnalytics, 'Analytics'),
    'Tag management': addTabType(tagManagement, 'Analytics'),
};
