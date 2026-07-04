import { lazy } from 'react';
import { renderEmbeddedLazyInner } from '../../../../constant';

const AppsList = lazy(() => import('./Tabs/AppsList'));
const Geofencing = lazy(() => import('./Tabs/Geofencing/Geofencing'));
const LifetimeCap = lazy(() => import('./Tabs/LifetimeCap'));
const UserDeviceSetup = lazy(() => import('./Tabs/UserDeviceSetup'));

export const MOBILE_FORM_ACTIONS_PORTAL_ID = 'pref-cs-mobile-form-actions';

export const MOBILE_TABBER_CONFIG = [
    { id: 1020, text: 'Apps list', disable: false, component: renderEmbeddedLazyInner(AppsList) },
    { id: 1021, text: 'User device setup', disable: false, component: renderEmbeddedLazyInner(UserDeviceSetup) },
    { id: 1023, text: 'Geofencing', disable: false, component: renderEmbeddedLazyInner(Geofencing) },
    { id: 1024, text: 'Lifetime cap', disable: true, component: renderEmbeddedLazyInner(LifetimeCap) },
];

export const USERLIST = {
    data: [
        {
            userId: 1878,
            roleId: 1,
            statusId: 1,
            clientId: 2736,
            firstName: 'Bharath',
            jobFunctionName: 'Data Scientist',
            jobFunctionID: 15,
            role: 'Admin',
            status: null,
            accessToken: null,
            isKeyPerson: false,
        },
        {
            userId: 1922,
            roleId: 2,
            statusId: 1,
            clientId: 2736,
            firstName: 'Dinesh',
            jobFunctionName: 'Brand Manager',
            jobFunctionID: 9,
            role: 'Superuser',
            status: null,
            accessToken: null,
            isKeyPerson: true,
        },
        {
            userId: 1923,
            roleId: 1,
            statusId: 1,
            clientId: 2736,
            firstName: 'Jasmine',
            jobFunctionName: 'Account manager',
            jobFunctionID: 21,
            role: 'Admin',
            status: null,
            accessToken: null,
            isKeyPerson: true,
        },
        {
            userId: 1926,
            roleId: 2,
            statusId: 1,
            clientId: 2736,
            firstName: 'Steve',
            jobFunctionName: 'Account Servicing',
            jobFunctionID: 8,
            role: 'Superuser',
            status: null,
            accessToken: null,
            isKeyPerson: false,
        },
        {
            userId: 1984,
            roleId: 2,
            statusId: 1,
            clientId: 2736,
            firstName: 'bharath',
            jobFunctionName: 'Account Servicing',
            jobFunctionID: 8,
            role: 'Superuser',
            status: null,
            accessToken: null,
            isKeyPerson: false,
        },
        {
            userId: 2078,
            roleId: 2,
            statusId: 2,
            clientId: 2736,
            firstName: 'swddqwdq',
            jobFunctionName: 'Account Servicing',
            jobFunctionID: 8,
            role: 'Superuser',
            status: null,
            accessToken: null,
            isKeyPerson: false,
        },
        {
            userId: 2167,
            roleId: 3,
            statusId: 1,
            clientId: 2736,
            firstName: 'More than 5 users',
            jobFunctionName: 'Account manager',
            jobFunctionID: 21,
            role: 'User',
            status: null,
            accessToken: null,
            isKeyPerson: false,
        },
        {
            userId: 2172,
            roleId: 0,
            statusId: 1,
            clientId: 2736,
            firstName: 'RR_Test_1',
            jobFunctionName: 'Brand Manager',
            jobFunctionID: 9,
            role: null,
            status: null,
            accessToken: null,
            isKeyPerson: false,
        },
    ],
};

export const MOBILE_USERDEVICE_ACTION_INITIAL_STATE = {
    showGrid: true,
    pushMobileUserDeviceSetUpAction: {
        edit: {
            editState: [],
            isEdit: false,
        },
        create: false,
    },
};

export const MOBILE_USERDEVICE_FORM_INITIAL_STATE = {
    defaultValues: {
        userName: '',
        appName: '',
        description: '',
    },
    mode: 'onTouched',
};
