export const ACTION_DATA = [{ value: 'In' }, { value: 'Out' }];

// Static data for initial geo fencing list
export const STATIC_GEO_FENCING_DATA = [
    {
        "geoFenceId": 7,
        "identifier": "ChennaiNew",
        "statusID": 1,
        "isAllTime": false,
        "createdDate": "2025-10-06T06:37:17",
        "startDate": "2025-10-30T00:00:00",
        "endDate": "2025-11-02T00:00:00",
        "createdBy": 4591,
        "clusterCount": 7,
        "appCount": 1,
        "statusName": "Active",
        "apps": [
            {
                "appId": "87b5584d-8aa6-4e6e-a06f-1839324d5781",
                "appName": "Vision Bank App",
                "geoFenceId": 7
            }
        ]
    },
    {
        "geoFenceId": 6,
        "identifier": "AL test - 22Aug2025",
        "statusID": 1,
        "isAllTime": true,
        "createdDate": "2025-08-22T10:56:43",
        "startDate": "1970-01-01T00:00:00",
        "endDate": "1970-01-01T00:00:00",
        "createdBy": 4591,
        "clusterCount": 1,
        "appCount": 1,
        "statusName": "Active",
        "apps": [
            {
                "appId": "a280ab4d-0e62-4197-b22e-7e7428af212e",
                "appName": "RUN SMARTDX 2024",
                "geoFenceId": 6
            }
        ]
    },
    {
        "geoFenceId": 5,
        "identifier": "Geo Clust",
        "statusID": 1,
        "isAllTime": true,
        "createdDate": "2025-08-21T14:45:57",
        "startDate": "1970-01-01T00:00:00",
        "endDate": "1970-01-01T00:00:00",
        "createdBy": 5021,
        "clusterCount": 1,
        "appCount": 1,
        "statusName": "Active",
        "apps": [
            {
                "appId": "a280ab4d-0e62-4197-b22e-7e7428af212e",
                "appName": "RUN SMARTDX 2024",
                "geoFenceId": 5
            }
        ]
    },
    {
        "geoFenceId": 4,
        "identifier": "Round_of_testing",
        "statusID": 2,
        "isAllTime": false,
        "createdDate": "2025-06-19T10:57:30",
        "startDate": "2025-10-06T00:00:00",
        "endDate": "2025-10-25T00:00:00",
        "createdBy": 3239,
        "clusterCount": 1,
        "appCount": 1,
        "statusName": "Inactive",
        "apps": [
            {
                "appId": "a280ab4d-0e62-4197-b22e-7e7428af212e",
                "appName": "RUN SMARTDX 2024",
                "geoFenceId": 4
            }
        ]
    },
    {
        "geoFenceId": 3,
        "identifier": "Cluster001 RUN J19",
        "statusID": 2,
        "isAllTime": false,
        "createdDate": "2025-06-18T12:11:34",
        "startDate": "2025-06-19T00:00:00",
        "endDate": "2025-08-27T00:00:00",
        "createdBy": 3239,
        "clusterCount": 2,
        "appCount": 1,
        "statusName": "Inactive",
        "apps": [
            {
                "appId": "a280ab4d-0e62-4197-b22e-7e7428af212e",
                "appName": "RUN SMARTDX 2024",
                "geoFenceId": 3
            }
        ]
    },
    {
        "geoFenceId": 2,
        "identifier": "cluster check",
        "statusID": 1,
        "isAllTime": true,
        "createdDate": "2025-06-18T11:06:41",
        "startDate": "1970-01-01T00:00:00",
        "endDate": "1970-01-01T00:00:00",
        "createdBy": 3239,
        "clusterCount": 0,
        "appCount": 1,
        "statusName": "Active",
        "apps": [
            {
                "appId": "a280ab4d-0e62-4197-b22e-7e7428af212e",
                "appName": "RUN SMARTDX 2024",
                "geoFenceId": 2
            }
        ]
    },
    {
        "geoFenceId": 1,
        "identifier": "Chennai Edge-Spacing Cluster",
        "statusID": 1,
        "isAllTime": true,
        "createdDate": "2025-06-12T13:31:06",
        "startDate": "1970-01-01T00:00:00",
        "endDate": "1970-01-01T00:00:00",
        "createdBy": 4591,
        "clusterCount": 3,
        "appCount": 1,
        "statusName": "Active",
        "apps": [
            {
                "appId": "a280ab4d-0e62-4197-b22e-7e7428af212e",
                "appName": "RUN SMARTDX 2024",
                "geoFenceId": 1
            }
        ]
    }
];

export const STATIC_GEO_FENCE_DETAILS = {
    "status": true,
    "message": "Success",
    "data": {
      "geoFenceId": 7,
      "identifier": "ChennaiNew",
      "startDate": "2025-10-30T00:00:00",
      "endDate": "2025-11-02T00:00:00",
      "isAllTime": false,
      "appList": [
        {
          "appId": "87b5584d-8aa6-4e6e-a06f-1839324d5781",
          "appName": "Vision Bank App",
          "geoFenceId": 0
        }
      ],
      "cluster": [
        {
          "regionId": "20",
          "placeName": "New york",
          "latitude": "40.7306",
          "longitude": "-73.9352",
          "radius": "200",
          "jsonData": [
            {
              "eventName": "event_4",
              "eventValue": "value_4"
            }
          ],
          "isDelete": false
        },
        {
          "regionId": "21",
          "placeName": "Los angeles",
          "latitude": "34.0522",
          "longitude": "-118.2437",
          "radius": "250",
          "jsonData": [
            {
              "eventName": "event_5",
              "eventValue": "value_5"
            }
          ],
          "isDelete": false
        },
        {
          "regionId": "24",
          "placeName": "London",
          "latitude": "51.5074",
          "longitude": "-0.1278",
          "radius": "180",
          "jsonData": [
            {
              "eventName": "event_8",
              "eventValue": "value_8"
            }
          ],
          "isDelete": false
        },
        {
          "regionId": "25",
          "placeName": "Sydney",
          "latitude": "-33.8688",
          "longitude": "151.2093",
          "radius": "140",
          "jsonData": [
            {
              "eventName": "event_9",
              "eventValue": "value_9"
            }
          ],
          "isDelete": false
        },
        {
          "regionId": "26",
          "placeName": "Tokyo",
          "latitude": "35.6762",
          "longitude": "139.6503",
          "radius": "160",
          "jsonData": [
            {
              "eventName": "event_10",
              "eventValue": "value_10"
            }
          ],
          "isDelete": false
        },
        {
          "regionId": "27",
          "placeName": "Berlin",
          "latitude": "52.52",
          "longitude": "13.405",
          "radius": "170",
          "jsonData": [
            {
              "eventName": "event_11",
              "eventValue": "value_11"
            }
          ],
          "isDelete": false
        },
        {
          "regionId": "28",
          "placeName": "Tnagar",
          "latitude": "10.343",
          "longitude": "28.423423",
          "radius": "1000",
          "jsonData": [
            {
              "eventName": "DEVICE_OS",
              "eventValue": "[[DEVICE_OS]]"
            },
            {
              "eventName": "APP_VERSION",
              "eventValue": "[[APP_VERSION]]"
            },
            {
              "eventName": "sdfsdf",
              "eventValue": "sdfsdfdf"
            }
          ],
          "isDelete": false
        }
      ]
    }
  }

