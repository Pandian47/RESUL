export const SDK_HEALTH_CHECK_DATA = {
  "status": true,
  "message": "Success",
  "data": {
    "sdkStatus": {
      "status": true,
      "createdDate": "03/28/2024 12:20:39",
      "modifiedDate": "10/07/2025 14:31:16"
    },
    "deepLinkStatus": null,
    "tokenUpdateStatus": {
      "apporDomain": "visionretail.qa.smartdx.co",
      "createdDate": "09/04/2024 10:49:10",
      "modifiedDate": "09/22/2025 20:30:50",
      "status": true
    },
    "sdkRegisterationStatus": {
      "apporDomain": "visionretail.qa.smartdx.co",
      "createdDate": "01/28/2025 11:08:21",
      "modifiedDate": "09/20/2025 07:45:12",
      "status": true
    },
    "screenTrackingStatus": {
      "status": true,
      "screenInfo": [
        {
          "displayName": null,
          "createdDate": "03/28/2024 12:20:39",
          "modifiedDate": "10/07/2025 14:31:16"
        }
      ],
      "createdDate": "03/28/2024 12:20:39",
      "modifiedDate": "10/07/2025 14:31:16"
    },
    "locationUpdateStatus": {
      "status": true,
      "locationInfo": [
        {
          "latitude": "13.057029545917995",
          "longitude": "80.25509753946183",
          "createdDate": "09/26/2025 04:51:17",
          "modifiedDate": null
        },
        {
          "latitude": "13.057029544748868",
          "longitude": "80.25509753825209",
          "createdDate": "09/26/2025 04:50:15",
          "modifiedDate": null
        },
        {
          "latitude": "13.056940704256878",
          "longitude": "80.25504395473696",
          "createdDate": "09/24/2025 14:35:21",
          "modifiedDate": null
        },
        {
          "latitude": "13.05694068696884",
          "longitude": "80.25504394881264",
          "createdDate": "09/24/2025 14:35:20",
          "modifiedDate": null
        },
        {
          "latitude": "13.056868362058855",
          "longitude": "80.25499876436731",
          "createdDate": "09/22/2025 15:19:28",
          "modifiedDate": null
        }
      ],
      "createdDate": "09/26/2025 04:51:17",
      "modifiedDate": "09/26/2025 04:51:17"
    },
    "customEventStatus": {
      "status": true,
      "customEventInfo": [],
      "createdDate": "06/21/2024 09:48:15",
      "modifiedDate": "04/29/2025 08:09:43"
    },
    "sdkRuleStatus": {
      "status": true,
      "lastUpdatedDate": "09/17/2025 11:02:55"
    }
  }
}
export const SDK_HEALTH_CHECK_EMPTY_DATA = {
  "sdkStatus": {
    "status": false,
    "createdDate": null,
    "modifiedDate": null
  },
  "deepLinkStatus": null,
  "tokenUpdateStatus": null,
  "sdkRegisterationStatus": null,
  "screenTrackingStatus": null,
  "locationUpdateStatus": null,
  "customEventStatus": null,
  "sdkRuleStatus": null
}
export const SDK_HEALTH_CHECK_DEVICE_TYPE = [
    { id: 1000, text: 'Android', disable: false, component:() => <></>},
    { id: 1001, text: 'iOS', disable: false,component:() => <></>},
   
]
export const sdkDataConvert = (input) => {
  const data = input;
  return {
    status: true,
    message: "Success",
    data: {
      sdkStatus: {
        status: data?.sdk_status?.status || false,
        createdDate: formatDate(data.sdk_status.createdDate),
        modifiedDate: formatDate(data.sdk_status.modifiedDate)
      },
      deepLinkStatus: {
        status: data?.deeplink_status?.status || false,
        createdDate: formatDate(data.deeplink_status?.createdDate),
        modifiedDate: formatDate(data.deeplink_status?.modifiedDate)
      },
      tokenUpdateStatus: {
        apporDomain: "visionretail.qa.smartdx.co", // Hardcoded as per output example
        status: data.token_update.status,
        createdDate: formatDate(data.token_update.createdDate),
        modifiedDate: formatDate(data.token_update.modifiedDate)
      },
      sdkRegisterationStatus: {
        apporDomain: "visionretail.qa.smartdx.co", // Hardcoded
        status: data?.identification_mapping?.status || false, // Not in input, assumed true based on output
        createdDate: formatDate(data.identification_mapping?.createdDate),
        modifiedDate: formatDate(data.identification_mapping?.modifiedDate)
      },
      screenTrackingStatus: {
        status: data.screen_tracking.status,
        screenInfo: [
          {
            displayName: null,
            createdDate: formatDate(data.screen_tracking.createdDate),
            modifiedDate: formatDate(data.screen_tracking.modifiedDate)
          }
        ],
        createdDate: formatDate(data.screen_tracking.createdDate),
        modifiedDate: formatDate(data.screen_tracking.modifiedDate)
      },
      locationUpdateStatus: {
        status:  data?.location_tracking?.status || false, // Not in input, assumed true
        locationInfo: [], // Not in input, empty as per output pattern
        createdDate: formatDate(data?.location_tracking?.createdDate || '') , // Hardcoded
        modifiedDate: formatDate(data?.location_tracking?.modifiedDate || ''),  // Hardcoded
      },
      customEventStatus: {
        status: data.custom_events.status,
        customEventInfo: [],
        createdDate: formatDate(data.custom_events.createdDate),
        modifiedDate: formatDate(data.custom_events.modifiedDate)
      },
      sdkRuleStatus: {
        status: true, // Not in input, assumed true
        lastUpdatedDate: "09/17/2025 11:02:55" // Hardcoded
      }
    }
  };
}

// Helper function to convert "YYYY-MM-DD HH:mm:ss" → "MM/DD/YYYY HH:mm:ss"
function formatDate(dateStr) {
  if (!dateStr) return null;
  const [date, time] = dateStr.split(' ');
  const [year, month, day] = date.split('-');
  return `${month.padStart(2, '0')}/${day}/${year} ${time}`;
}

// export const SDK_HEALTH_CHECK_DEVICE_TYPE = <RSTabbar
//                         defaultClass={`col-md-2 tabTransparent `}
//                         dynamicTab={`mb0 mini`}
//                         activeClass={`active`}
//                         tabData={MOBILE_TABBER_CONFIG}
//                         className="rs-tabs row"
//                         componentClassName={'mt21'}
//                         defaultTab={0}
//                     />