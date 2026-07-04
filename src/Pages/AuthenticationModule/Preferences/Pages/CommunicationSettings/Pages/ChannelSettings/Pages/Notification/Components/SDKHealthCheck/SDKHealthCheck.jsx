import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { CONFIGURE_EVENT } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import './SDKHealthCheck.css';
import RSModal from 'Components/RSModal';
import { SDK_HEALTH_CHECK_DATA, SDK_HEALTH_CHECK_DEVICE_TYPE, SDK_HEALTH_CHECK_EMPTY_DATA, sdkDataConvert } from './constant';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getSdkHealthCheck } from 'Reducers/preferences/CommunicationSettings/request';
import RSTooltip from 'Components/RSTooltip';
import RSTabbar from 'Components/RSTabber';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import KendoGrid from 'Components/RSKendoGrid';


const statusMap = {
  true: 'Enabled',
  false: 'Not enabled',
  sdk: {
    true: 'Active',
    false: 'Inactive',
  },
  null: 'No data',
};

const keyMappings = {
  sdkStatus: 'SDK status',
  deepLinkStatus: 'Deep link',
  tokenUpdateStatus: 'Token update',
  sdkRegisterationStatus: 'Identification mapping',
  screenTrackingStatus: 'Screen tracking',
  locationUpdateStatus: 'Location update',
  customEventStatus: 'Custom events',
  sdkRuleStatus: 'Immediate trigger',
  notificationClickStatus: 'Notification click',
  conversionStatus: 'Conversion',
  fieldTrackStatus: 'Field track / Codeless tracking',
  formStatus: 'Form',
  brandFormStatus: 'Brand form',
};

const getStatusText = (key, value) => {
  if (value === null) return 'No data';
  if (key === 'sdkStatus') return statusMap.sdk[value] || 'No data';
  return statusMap[value] ?? 'No data';
};

const getDate = (entry) => {
  if (entry?.modifiedDate) {
    return getUserCurrentFormat(entry?.modifiedDate !== '' && entry?.modifiedDate)?.dateFormat

  } else if (entry?.lastUpdatedDate) {
    return getUserCurrentFormat(entry?.lastUpdatedDate !== '' && entry?.lastUpdatedDate)?.dateFormat
  }
  return 'NA';
};

const keyToClassNames = {
  sdkStatus: { android: 'android-init', ios: 'ios-init' },
  deepLinkStatus: { android: 'android-deeplink', ios: 'ios-deeplink' },
  tokenUpdateStatus: { android: 'android-user-registration', ios: 'ios-prelogin' },
  sdkRegisterationStatus: { android: 'android-user-registration', ios: 'ios-registration' },
  screenTrackingStatus: { android: 'android-event', ios: 'ios-event' },
  locationUpdateStatus: { android: 'android-location', ios: 'ios-location' },
  customEventStatus: { android: 'android-event', ios: 'ios-event' },
  sdkRuleStatus: { android: 'android-notification', ios: 'ios-notification' },
  notificationClickStatus: { android: 'android-notification', ios: 'ios-notification' },
  conversionStatus: { android: 'android-conv', ios: 'ios-conv' },
  fieldTrackStatus: { android: 'android-event', ios: 'ios-event' },
  formStatus: { android: 'android-app-config', ios: 'ios-nce' },
  brandFormStatus: { android: 'android-app-config', ios: 'ios-nce' },
};

const SDKHealthCheck = ({ show, close, data, isModal = true, domainUrl = '', appId, type = 'mobile' }) => {
  const dispatch = useDispatch();
  const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
  const [sdkHealthData, setSdkHealthData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [deviceData, setDeviceData] = useState([]);
  const [isGridView, setIsGridView] = useState(true)
  const [initialPagination, setInitialPagination] = useState(false);


  // ⛔️ Avoid calling prop functions during render
  const handleClose = useCallback(() => {
    close?.();
  }, [close]);

  useEffect(() => {
    if (data?.deviceInfo) {
      setDeviceData(data.deviceInfo);
    }
  }, [data]);

  useEffect(() => {
    fetchSdkHealthCheck(tabIndex);
  }, []);

  const fetchSdkHealthCheck = useCallback(async (currentTabIndex) => {
    setIsLoading(true);

    // Prepare request params based on type
    let requestPayload = {
      clientId,
      userId,
      departmentId,
    };

    if (type === 'web') {
      // Check the type is web means prepare the request param like below
      requestPayload.domainName = domainUrl;
    } else if (type === 'mobile') {
      // If the type is mobile means prepare the request param like below
      requestPayload.appGuid = appId || data?.appId;
      requestPayload.deviceTypeId = currentTabIndex === 0 ? 1 : 3;
    }

    try {
      const { status, data: responseData } = await dispatch(getSdkHealthCheck(requestPayload));
      if (status && responseData && Object.keys(responseData).length > 0) {
        let convertResponse = sdkDataConvert(responseData);
                setSdkHealthData(convertResponse.data);
      } else {
        // If no data, use default
        setSdkHealthData(SDK_HEALTH_CHECK_EMPTY_DATA);
      }
    } catch (error) {
      setSdkHealthData(SDK_HEALTH_CHECK_DATA.data);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, userId, departmentId, type, domainUrl, appId, data, dispatch, tabIndex]);


  // useEffect(() => {
  //   //Mount the SDKHealthCheck that time connect the API Call
  //   if (show) {
  //     fetchSdkHealthCheck(tabIndex);
  //   }
  // }, [show, fetchSdkHealthCheck, tabIndex]);
  // ...
  // ...


  const showInfoButton = useCallback((key) => {
    const excludedKeys = new Set([
      'sdkRuleStatus',
      'notificationClickStatus',
      'fieldTrackStatus',
      'formStatus',
      'brandFormStatus',
    ]);
    return !excludedKeys.has(key);
  }, []);

  const getClassName = useCallback((key, tabIndex) => {
    const platform = tabIndex === 0 ? 'android' : 'ios';
    return keyToClassNames[key]?.[platform] || '';
  }, []);

  const filteredHealthData = useMemo(() => {
    if (!sdkHealthData) return {};
    return Object.entries(sdkHealthData).filter(([key]) => {
      if (type === 'web' && key === 'deepLinkStatus') return false;
      return !['sdkRuleStatus', 'notificationClickStatus', 'fieldTrackStatus', 'formStatus', 'brandFormStatus', 'conversionStatus'].includes(key);
    });
  }, [sdkHealthData, type, tabIndex]);

  const columns = useMemo(() => [
    {
      title: "Feature name",
      cell: ({ dataItem }) => {
        let key = dataItem[0]
        let status = dataItem[1]
        return <td>
          {keyMappings[key]}
        </td>
      }
    },
    {
      title: "Status",
      cell: ({ dataItem }) => {
        let key = dataItem[0]
        let statusObj = dataItem[1]
        let statusText = getStatusText(key, statusObj?.status || false);

        const sdkStatusObj = filteredHealthData.find(item => item[0] === "sdkStatus")?.[1];
        if (key !== "sdkStatus" && sdkStatusObj?.status === false) {
          statusText = "No data"
        }
        

        return <td>
          {statusText}
        </td>
      }
    },

    {
      title: "Last update date",
      width: 240,
      cell: ({ dataItem }) => {
        let status = dataItem[1]
        const date = getDate(status)
        return <td>
          {date}
        </td>
      }
    }
  ], [filteredHealthData]);

  const HealthCheckData = useMemo(() => {

    // if (isLoading && isGridView === false)
    //   return <></>;
    // if (isLoading && isGridView === true)
    //   return <RSSkeletonTable
    //     text
    //     count={5}
    //     isCustombox
    //     isAlertIcon={false}
    //     message={
    //       <></>
    //     }
    //   />

    return (
      <div>

        {type === 'mobile' && <RSTabbar
          defaultClass={`col-md-2 tabTransparent `}
          dynamicTab={`mb0 mini`}
          activeClass={`active`}
          tabData={SDK_HEALTH_CHECK_DEVICE_TYPE}
          className="rs-tabs row"
          componentClassName={'mt21'}
          defaultTab={tabIndex}
          callBack={(tab, index) => {
            setTabIndex(index);
            fetchSdkHealthCheck(index);
          }}
        />}
        <div className={`${isGridView === true ? 'sdk-listview' : 'sdk-grid'}`}>
          {isGridView === true ? <>
            {/* {filteredHealthData?.length > 0 ? ( */}
              <>
                <div className="align-items-start d-flex mb10">
                  <i
                    className={`${circle_info_mini} icon-xs color-primary-blue mr10 cursor-default position-relative top5`}
                  ></i>
                  <small>{`To enable the feature, please refer to the SDK Integration Guide for detailed setup instructions specific to your ${type === 'web' ? 'website' : 'app'}.`}</small>
                </div>

                <KendoGrid
                  data={filteredHealthData}
                  settings={{ total: filteredHealthData.length }}
                  isFailure={!filteredHealthData.length}
                  noBoxShadow
                  isCustomBox
                  column={columns}
                  pagerChange={initialPagination}
                  setInitialPagination={setInitialPagination}
                  isLoading= {isLoading}
                />
              </>

            {/* ) : (
              <RSSkeletonTable
                text
                count={5}
                isCustombox
               
              />
            )} */}
          </> : <>
            {filteredHealthData.map(([key, entry]) => {
              const statusValue = typeof entry === 'object' ? entry?.status : null;
              const statusText = getStatusText(key, statusValue);
              return (
                <div className="sdk-card" key={key}>
                  <div className="sdk-card-header">
                    <div className="sdk-title">
                      <h4>{keyMappings[key]}</h4>
                    </div>
                    <span className={`sdk-status ${statusText.toLowerCase().replace(' ', '')}`}>
                      {statusText}
                    </span>
                  </div>
                  <div className="sdk-meta">
                    <div className="sdk-meta-date">Last updated: {getDate(entry)}</div>
                    {statusText !== 'Active' &&
                      statusText !== 'Enabled' &&
                      showInfoButton(key) && (
                        <RSTooltip text={CONFIGURE_EVENT} position="bottom" innerContent={false}>
                          <i className="icon-rs-circle-question-mark-medium color-secondary-blue cursor-pointer"></i>
                        </RSTooltip>

                      )}
                  </div>
                </div>
              );
            })}
          </>}


        </div>
      </div>
    );
  }, [filteredHealthData, isLoading, tabIndex, domainUrl, getClassName, showInfoButton]);

  // ✅ Only render once and controlled by `show`
  
  return (
    <RSModal
      size="xlg"
      show={show}
      handleClose={handleClose}
      header={type === 'web' ? data?.domainName || 'Web SDK Health Check' : data?.appName || 'Mobile SDK Health Check'}
      body={HealthCheckData}
    />
  );
};

export default memo(SDKHealthCheck);
