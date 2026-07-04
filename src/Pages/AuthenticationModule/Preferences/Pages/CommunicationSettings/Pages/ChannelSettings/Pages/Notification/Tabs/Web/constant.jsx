import { lazy } from 'react';
import { renderEmbeddedLazyInner } from '../../../../constant';

const WebTab = lazy(() => import('./Tabs/Web'));
const LifetimeCap = lazy(() => import('./Tabs/LifetimeCap'));
const CustomEvent = lazy(() => import('./Tabs/CustomEvent'));

export const WEB_FORM_ACTIONS_PORTAL_ID = 'pref-cs-web-form-actions';

export const TABBER_CONFIG = [
    { id: 1010, text: 'Web', disable: false, component: renderEmbeddedLazyInner(WebTab) },
    { id: 1012, text: 'Lifetime cap', disable: true, component: renderEmbeddedLazyInner(LifetimeCap) },
    { id: 1013, text: 'Custom events', disable: false, component: renderEmbeddedLazyInner(CustomEvent) },
];

export const ACTION_INITIAL_STATE = {
    showGrid: true,
    pushWebAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
        show: false,
    },
    pushWebGoalAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
        showGrid: false,
        show: false,
    },
    domainUrl: '',
};
export const FORM_INITIAL_STATE = {
    defaultValues: {
        domainName: '',
        domainUrl: 'https://',
        domainFlavour: '',
        domainLogo: '',
        imageName: '',
        notificationProvider: '',
        fcmSenderId: '',
        fcmServerKey: '',
        apiKey: '',
        authDomain: '',
        databaseUrl: '',
        projectId: '',
        appId: '',
        userIdentifier: '',
        fcmJSONFile: '',
        jsonName: '',
        storageBucket: '',
        measurementId: '',
        vapid: '',
        webanalyticsetting: [{ analyticsplatformId: '', serviceAccountEmail: '', appKey: '', appSecretId: '' }],
        webanalyticssetting: false,
    },
    mode: 'onTouched',
};

export const PROVIDER = [{ keyId: 'G', keyName: 'Google' }];

export const DOMAIN_FLAVOUR = [
    { id: 1, name: 'JavaScript', description: 'JavaScript - JavaScript library for building user interface' },
    { id: 2, name: 'WordPress', description: 'WordPress - TypeScript-based web application framework' },
    { id: 3, name: 'Wix', description: 'Wix - Progressive JavaScript framework' },
    { id: 4, name: 'Weebly', description: 'Next.js - React framework with server-side rendering' },
    { id: 5, name: 'Webflow', description: 'Nuxt.js - Vue framework with server-side rendering' },
    { id: 6, name: 'Squarespace', description: 'Svelte - Compile-time JavaScript framework' },
    { id: 7, name: 'Shopify', description: 'Shopify - E-commerce platform' },
    { id: 8, name: 'Other', description: 'Other technology stack' },
];

export const ANALYTICS_WEB = [
    {
        titleId: 1,
        title: 'Google Analytics',
    },
    {
        titleId: 2,
        title: 'RESUL analytics',
    },
    {
        titleId: 3,
        title: 'Omniture',
    },
    {
        titleId: 4,
        title: 'Web Trends',
    },
    {
        titleId: 5,
        title: 'YouTube',
    },
    {
        titleId: 6,
        title: 'Vimeo',
    },
    {
        titleId: 7,
        title: 'Flurry Analytics',
    },
];
