/**
 * Full application Redux root — lazy-loaded after login (see Store/index.js).
 */
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';

import dashboardReducer from './Dashboard/dashboardReducer';
import dashboardTwinsReducer from './dashboardTwins/dashboardReducer';
import globalstate from './globalState/reducer';
import myProfileReducer from './Preferences/MyProfile/reducer';
import audienceScoreReducer from './Preferences/AudienceScore/reducer';
import loginReducer from './login/existingUser/reducer';
import newUserReducer from './login/newUser/reducer';
import companyCreation from './companySetup/reducer';
import communicationPlanReducer from './communication/createCommunication/plan/reducer';
import communicationExecuteReducer from './communication/createCommunication/execute/reducer';
import createCommunicationReducer from './communication/createCommunication/Create/reducer';
import dynamicListReducer from './audience/dynamicList/reducer';
import notificationsReducer from './Notifications/reducer';
import addAudienceReducer from './audience/addAudience/reducer';
import masterDataReducer from './audience/masterdata/reducer';
import accountSettingsReducer from './Preferences/accountSettings/reducer';
import companiesReducer from './preferences/Companies/reducer';
import rolesAndPermissionsReducer from './Preferences/rolesAndPermissions/reducer';
import dataCatalogueReducer from './Preferences/datacatalogue/reducer';
import dataTargetListReducer from './audience/targetListCreation/reducer';
import targetListViewReducer from './audience/targetList/reducer';
import aa360ViewReducer from './analytics/aa360/reducer';
import userReducer from './Preferences/users/reducer';
import benchmarkOverview from './preferences/GoalsAndBenchmark/reducer';
import analyticsListingReducer from './analytics/communicationAnalytics/reducer';
import auditLogReducer from './analytics/auditLog/reducer';

import communicationListingReducer from './communication/listing/reducer';
import analyticsReportReducer from './analytics/analyticsSummary/reducer';
import analyticsDetails from './analytics/details/reducer';
import syncHistoryReducer from './audience/syncHistory/reducer';
import remoteDataSourceReducer from './RemoteDataSource/reducer';
import plannerReducer from './communication/planner/reducer';
import galleryReducer from './communication/gallery/reducer';
import TemplateReducer from './communication/Template/reducer';
import smartLinkReducer from './communication/createCommunication/smartlink/reducer';
import mdcCanvasFlowReducer from './communication/createCommunication/Mdc/Canvas/reducer';
import communicationSettingsReducer from './preferences/CommunicationSettings/reducer';
import dataExchangeReducer from './preferences/DataExchange/reducer';
import consumptionReducer from './preferences/consumptions/reducer';
import offerMangementReducer from './preferences/OfferManagements/reducer';
import formGeneratorReducers from './preferences/FormGenerator/reducer';
import emailBuilderReducer from './preferences/EmailBuilder/reducer';
import geofenceReducer from './preferences/CommunicationSettings/Geofencing/reducer';
import beaconReducer from './preferences/CommunicationSettings/Beacons/reducer';
import genieReducer from './genie';
import analyticsListingTwinsReducer from './analyticsTwins/communicationAnalytics/reducer';
import analyticsReportTwinsReducer from './analyticsTwins/analyticsSummary/reducer';
import analyticsDetailsTwins from './analyticsTwins/details/reducer';
import consumptionTwinsReducer from './preferences/consumptionsTwins/reducer';

const globalStatePersistorConfig = {
    key: 'global',
    storage,
    stateReconciler: autoMergeLevel2,
    blacklist: ['loading', 'approvalList'],
};

const createCommunicationPersistorConfig = {
    key: 'createCommunicationReducer',
    storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['isMDCEditMode'],
};
const communciationPlanReducerPersistorConfig = {
    key: 'communicationPlanReducer',
    storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['savedChannelsId', 'savedChannelStatusId'],
};

export default function createAppReducer() {
    return combineReducers({
        globalstate: persistReducer(globalStatePersistorConfig, globalstate),
        aa360ViewReducer,
        accountSettingsReducer,
        addAudienceReducer,
        analyticsDetails,
        analyticsListingReducer,
        analyticsReportReducer,
        analyticsListingTwinsReducer,
        analyticsReportTwinsReducer,
        analyticsDetailsTwins, 
        consumptionTwinsReducer,
        audienceScoreReducer,
        auditLogReducer,
        benchmarkOverview,
        communicationExecuteReducer,
        communicationListingReducer,
        communicationPlanReducer: persistReducer(communciationPlanReducerPersistorConfig, communicationPlanReducer),
        communicationSettingsReducer,
        companiesReducer,
        companyCreation,
        consumptionReducer,
        createCommunicationReducer: persistReducer(createCommunicationPersistorConfig, createCommunicationReducer),
        dashboardReducer,
        dashboardTwinsReducer,
        dataCatalogueReducer,
        dataExchangeReducer,
        dataTargetListReducer,
        dynamicListReducer,
        galleryReducer,
        loginReducer,
        masterDataReducer,
        mdcCanvasFlowReducer,
        myProfileReducer,
        newUserReducer,
        notificationsReducer,
        plannerReducer,
        remoteDataSourceReducer,
        rolesAndPermissionsReducer,
        smartLinkReducer,
        syncHistoryReducer,
        targetListViewReducer,
        userReducer,
        offerMangementReducer,
        formGeneratorReducers,
        emailBuilderReducer,
        TemplateReducer,
        geofenceReducer,
        beaconReducer,
        genieReducer,
    });
}
