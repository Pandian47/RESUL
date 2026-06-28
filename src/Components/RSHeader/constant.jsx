import { analytics_large, audience_dynamic_list_large, audience_target_list_large, calendar_large, communication_list_large, communication_plus_large, dashboard_communication_large, dashboard_mobile_live_large, dashboard_web_live_large, data_large, image_large, log_report_large, user_360_large } from 'Constants/GlobalConstant/Glyphicons';
import tagLicenseStartup from 'Assets/Images/svg/license_type/tag_license_startup.svg';
import tagLicensePro from 'Assets/Images/svg/license_type/tag_license_pro.svg';
import tagLicenseEnterprise from 'Assets/Images/svg/license_type/tag_license_enterprise.svg';
import tagLicenseEnterprisePlus from 'Assets/Images/svg/license_type/tag_license_enterprise_plus.svg';
import tagLicenseEnterpriseHybrid from 'Assets/Images/svg/license_type/tag_license_enterprise_hybrid.svg';
import tagLicenseEnterprisePlusHybrid from 'Assets/Images/svg/license_type/tag_license_enterprise_plus_hybrid.svg';
import startupWithVersion from 'Assets/Images/header-icon/versionWithLicense/start4.svg';
import proWithVersion from 'Assets/Images/header-icon/versionWithLicense/pro4.svg';
import entpriseWithVersion from 'Assets/Images/header-icon/versionWithLicense/ent4.svg';
const AUDIENCE_MENU = [
    { name: 'Master data management', path: '/audience', icon: data_large, index: 0, featureId: 47 },
    { name: 'Segments & lists', path: '/audience', icon: audience_target_list_large, index: 1, featureId: 49 },
    { name: 'Dynamic Lists', path: '/audience', icon: audience_dynamic_list_large, index: 2, featureId: 50 },
];
const COMMUNICATION_MENU = [
    {
        name: 'Create communication',
        path: '/communication',
        icon: communication_plus_large,
        page: '/communication-creation',
        featureId: 3,
        index: null
    },
    {
        name: 'Communication listing',
        path: '/communication',
        icon: communication_list_large,
        page: '',
        index: 0,
        featureId: 3,
    },
    { name: 'Gallery', path: '/communication', icon: image_large, page: '', index: 1, featureId: 3 },
    { name: 'Planner', path: '/communication', icon: calendar_large, page: '', index: 2, featureId: 3 },
];
const ANALYTICS_MENU = [
    { name: 'Communication analytics', path: '/analytics', icon: analytics_large, page: '', featureId: 4, index: 0 },
    {
        name: 'Audience analytics 360',
        path: '/analytics',
        icon: user_360_large,
        page: '/analytics',
        featureId: 29,
        index: 1,
    },
    { name: 'Audit log report', path: '/analytics', icon: log_report_large, page: '/analytics', featureId: 26, index: 2 },
];

const DASHBOARD_MENU = [
    {
        name: 'Communication dashboard',
        path: '/dashboard',
        icon: dashboard_communication_large,
        index :0,
        featureId: 1,
    },
    {
        name: 'Mobile live dashboard',
        path: '/dashboard',
        icon: dashboard_mobile_live_large,
        index :1,
        featureId: 1,
    },
    {
        name: 'Web live dashboard',
        path: '/dashboard',
        icon: dashboard_web_live_large,
        index :2,
        featureId: 1,
    },
];
export const HEADER_CONFIG = [
    { name: 'Audience', path: '/audience', subMenu: true, subMenuValue: AUDIENCE_MENU, type: 'audience' },
    {
        name: 'Communication',
        path: '/communication',
        subMenu: true,
        subMenuValue: COMMUNICATION_MENU,
        type: 'communication',
    },
    { name: 'Dashboard', path: '/dashboard', subMenu: true,subMenuValue: DASHBOARD_MENU, type: 'dashboard' },
    { name: 'Analytics', path: '/analytics', subMenu: true, subMenuValue: ANALYTICS_MENU, type: 'analytics' },
    { name: 'Preferences', path: '/preferences', subMenu: false, type: 'preferences' },
];

export const pages_tab_config = {
    communication: ['List', 'Gallery', 'Planner'],
    audience: ['Master data', 'Segments & lists', 'Dynamic list'],
    analytics: ['Communication analytics', 'Audience analytics 360', 'Audit log report'],
    dashboard: ['Communication dashboard', 'Mobile live dashboard', 'Web live dashboard']
};

export const getHeaderCompanyImage = (type, isEnterprisePlus, isHybrid) => {
    if (parseInt(type, 10) === 1) return tagLicenseStartup;
    else if (parseInt(type, 10) === 2) return tagLicensePro;
    else if (parseInt(type, 10) === 3 && isHybrid && !isEnterprisePlus) return tagLicenseEnterpriseHybrid;
    else if (parseInt(type, 10) === 3 && isHybrid && isEnterprisePlus) return tagLicenseEnterprisePlusHybrid;
    else if (parseInt(type, 10) === 3 && !isEnterprisePlus) return tagLicenseEnterprise;
    else if (parseInt(type, 10) === 3 && isEnterprisePlus) return tagLicenseEnterprisePlus;
    else {
    }
    return tagLicenseEnterprise;
};
export const getHeaderLicenseWithVersion = (type, isEnterprisePlus, isHybrid) => {
    if (parseInt(type, 10) === 1) return startupWithVersion;
    else if (parseInt(type, 10) === 2) return proWithVersion;
    else if (parseInt(type, 10) === 3 && isHybrid && !isEnterprisePlus) return entpriseWithVersion;
    else if (parseInt(type, 10) === 3 && isHybrid && isEnterprisePlus) return entpriseWithVersion;
    else if (parseInt(type, 10) === 3 && !isEnterprisePlus) return entpriseWithVersion;
    else if (parseInt(type, 10) === 3 && isEnterprisePlus) return entpriseWithVersion;
    else {
    }
    return entpriseWithVersion;
};

export const language = [
    {
        id: 'en',
        value: 'English | UK',
    },
    {
        id: 'en',
        value: 'English | US',
    },
    {
        id: 'ch',
        value: 'Chinese | 中國人',
    },
    {
        id: 'fr',
        value: 'French | Français',
    },
];
