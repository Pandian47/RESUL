import { formatNumber } from 'Utils/modules/campaignUtils';
import { numberWithCommas } from 'Utils/modules/formatters';
import { AUDIENCE_CARD_CHANNEL_LABELS as C } from 'Pages/AuthenticationModule/Audience/audienceCardChannelLabels';
import { AUDIENCE_FOOTER_LABELS, getTargetListFooterData } from 'Pages/AuthenticationModule/Audience/audienceFooterLabels';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';


export const DDL_COMMUNICATION_DATA = ['Reach', 'Engagement', 'Conversion'];

export const getMetricLabel = (metric) => {
    const labelMap = {
        reach: 'reach rate',
        engagement: 'engagement rate',
        conversion: 'conversion rate',
    };
    return labelMap[metric?.toLowerCase()] || 'reach rate';
};

export const getAudienceFooterData = getTargetListFooterData;
export const DDL_AUDIENCE_FOOTER_DATA = getTargetListFooterData(false);
export const ALL_AUDIENCE_FOOTER_DATA = [
    AUDIENCE_FOOTER_LABELS.MATCH_INPUT_LIST_TARGET,
    AUDIENCE_FOOTER_LABELS.SUPPRESSION_INPUT_LIST_TARGET,
    // DATA_AUGMENTATION
];
export const AD_HOC_FOOTER_DATA = ['Data augumentation'];

export const STATE_REDUCER = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case 'UPDATE': {
            return {
                ...state,
                [action.field]: payload,
            };
        }
        default:
            return state;
    }
};

export const INITIAL_STATE = {
    segmentInfoModal: false,
    downloadRecordsModal: false,
    splitTabList: ['CG', 'TG'],
};

export const colors = ['#004fdf', '#fc6a00', '#333333', '#999999'];
export const boxText = ['CG', 'TG'];

export const splitBoxClassName = (width) => {
    if (width < 30) return 'rsswb-small';
    else if (width < 60) return 'rsswb-medium';
    else return 'rsswb-large';
};

export const labelStyle = (color) => ({
    background: color,
});

export const getTargetInfoList = (items, selectedAttributes = []) => {
    const keys =
        items?.length > 0
            ? Object.keys(items[0])
            : selectedAttributes?.length > 0
              ? [
                    ...selectedAttributes.map((attr) => attr.attributeName),
                    ...(selectedAttributes.some((attr) => attr.attributeName === 'Count') ? [] : ['Count']),
                ]
              : [];

    if (!keys.length) return [];

    return keys.map((key) => ({
        field: key,
        title: key,
        width: key === 'Count' ? 120 : 200,
        cell: ({ dataItem }) => {
            return (
                <td style={{ textAlign: typeof dataItem?.[key] === 'number' ? 'right' : 'left' }}>
                    {typeof dataItem?.[key] === 'number' ? numberWithCommas(dataItem?.[key]) : dataItem?.[key]}
                </td>
            );
        },
    }));
};
export const recipientConfig = [
    {
        label: C.EMAIL_NAME,
        valueKey: 'RecipientCountEmail',
    },
    {
        label: C.MOBILE,
        valueKey: 'RecipientCountMobile',
    },
    {
        label: C.WHATS_APP,
        valueKey: 'RecipientCountWhatsApp',
    },
    {
        label: C.WEB_PUSH,
        valueKey: 'RecipientCountWebPush',
    },
    {
        label: C.MOBILE_PUSH,
        valueKey: 'RecipientCountMobilePush',
    },
    {
        label: C.RCS,
        valueKey: 'RecipientCountRCS',
    },
];

export const targetGroupConfig = [
    {
        label: C.CONTROL_GROUP,
        valueKey: 'CG',
        suffixClass: 'font-xxs',
    },
    {
        label: C.TARGET_GROUP,
        valueKey: 'TG',
        suffixClass: 'font-xxs fw-normal',
    },
];

export const getAttributeSummaryColumns = () => {
    return [
        {
            field: 'AttributesName',
            title: 'Enriched attributes',
            width: 300,
            cell: ({ dataItem }) => <TruncateCell value={dataItem?.AttributesName || ''} noTable={false} />,
        },
        {
            field: 'volume',
            title: 'Volume',
            cell: ({ dataItem }) => (
                <td style={{ textAlign: 'right' }}>{numberWithCommas(parseInt(dataItem?.volume || 0))}</td>
            ),
        },
        {
            field: 'percentage',
            title: 'Percentage',
            cell: ({ dataItem }) => {
                const percentage = dataItem?.percentage || '';
                const numericPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
                const formattedPercentage = !isNaN(numericPercentage) ? formatNumber(numericPercentage) : '';
                return (
                    <td style={{ textAlign: 'right' }}>
                        {formattedPercentage ? (
                            <>
                                {formattedPercentage}
                                <span className="font-xxs fw-normal">%</span>
                            </>
                        ) : (
                            ''
                        )}
                    </td>
                );
            },
        },
    ];
};

export const SampleInsightSummary = {
	"Demographic": [
		{
			"charttype": "Bubble Chart",
			"column": "Marital_Status",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 2,
			"values": [
				{
					"count": 11,
					"label": "Married",
					"percentage": 55.0
				},
				{
					"count": 9,
					"label": "Single",
					"percentage": 45.0
				}
			]
		},
		{
			"avg": 3.7,
			"charttype": "Sankey Diagram",
			"column": "Household_Size",
			"max": 6.0,
			"min": 2.0,
			"missing_count": 0,
			"total": 20,
			"type": "range",
			"unique_count": 5,
			"values": [
				{
					"count": 5,
					"label": "2-3",
					"percentage": 25.0
				},
				{
					"count": 5,
					"label": "4-5",
					"percentage": 25.0
				},
				{
					"count": 4,
					"label": "3-4",
					"percentage": 20.0
				},
				{
					"count": 4,
					"label": "5-6",
					"percentage": 20.0
				},
				{
					"count": 2,
					"label": "6-7",
					"percentage": 10.0
				}
			]
		}
	],
	"Demographic data": [
		{
			"avg": 38.75,
			"charttype": "Line Chart",
			"column": "Age",
			"max": 60.0,
			"min": 22.0,
			"missing_count": 0,
			"total": 20,
			"type": "range",
			"unique_count": 20,
			"values": [
				{
					"count": 6,
					"label": "29-37",
					"percentage": 30.0
				},
				{
					"count": 4,
					"label": "22-29",
					"percentage": 20.0
				},
				{
					"count": 4,
					"label": "37-45",
					"percentage": 20.0
				},
				{
					"count": 3,
					"label": "45-53",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "53-61",
					"percentage": 15.0
				}
			]
		}
	],
	"Financial": [
		{
			"avg": 675000.0,
			"charttype": "Funnel Chart",
			"column": "Annual_Income",
			"max": 1200000.0,
			"min": 250000.0,
			"missing_count": 0,
			"total": 20,
			"type": "range",
			"unique_count": 20,
			"values": [
				{
					"count": 6,
					"label": "630000-820000",
					"percentage": 30.0
				},
				{
					"count": 5,
					"label": "250000-440000",
					"percentage": 25.0
				},
				{
					"count": 4,
					"label": "820000-1010000",
					"percentage": 20.0
				},
				{
					"count": 3,
					"label": "440000-630000",
					"percentage": 15.0
				},
				{
					"count": 2,
					"label": "1010000-1200001",
					"percentage": 10.0
				}
			]
		},
		{
			"charttype": "Bar Chart",
			"column": "Income_Range",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 3,
			"values": [
				{
					"count": 10,
					"label": "5-10 Lakh",
					"percentage": 50.0
				},
				{
					"count": 7,
					"label": "2-5 Lakh",
					"percentage": 35.0
				},
				{
					"count": 3,
					"label": "10-15 Lakh",
					"percentage": 15.0
				}
			]
		},
		{
			"avg": 723.25,
			"charttype": "Pie Chart",
			"column": "Credit_Score",
			"max": 800.0,
			"min": 650.0,
			"missing_count": 0,
			"total": 20,
			"type": "range",
			"unique_count": 17,
			"values": [
				{
					"count": 6,
					"label": "710-740",
					"percentage": 30.0
				},
				{
					"count": 5,
					"label": "680-710",
					"percentage": 25.0
				},
				{
					"count": 4,
					"label": "740-770",
					"percentage": 20.0
				},
				{
					"count": 3,
					"label": "770-801",
					"percentage": 15.0
				},
				{
					"count": 2,
					"label": "650-680",
					"percentage": 10.0
				}
			]
		}
	],
	"Geographic": [
		{
			"charttype": "Treemap",
			"column": "City",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 7,
			"values": [
				{
					"count": 3,
					"label": "Chennai",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Bangalore",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Mumbai",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Hyderabad",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Delhi",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Pune",
					"percentage": 15.0
				},
				{
					"count": 2,
					"label": "Coimbatore",
					"percentage": 10.0
				}
			]
		},
		{
			"charttype": "Scatter Plot",
			"column": "State",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 5,
			"values": [
				{
					"count": 6,
					"label": "Maharashtra",
					"percentage": 30.0
				},
				{
					"count": 5,
					"label": "Tamil Nadu",
					"percentage": 25.0
				},
				{
					"count": 3,
					"label": "Karnataka",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Telangana",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Delhi",
					"percentage": 15.0
				}
			]
		},
		{
			"charttype": "Gauge Chart",
			"column": "Region",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 3,
			"values": [
				{
					"count": 11,
					"label": "South",
					"percentage": 55.0
				},
				{
					"count": 6,
					"label": "West",
					"percentage": 30.0
				},
				{
					"count": 3,
					"label": "North",
					"percentage": 15.0
				}
			]
		}
	],
	"Others": [
		{
			"charttype": "Stacked Bar Chart",
			"column": "Education_Level",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 2,
			"values": [
				{
					"count": 14,
					"label": "Graduate",
					"percentage": 70.0
				},
				{
					"count": 6,
					"label": "Postgraduate",
					"percentage": 30.0
				}
			]
		},
		{
			"charttype": "Box Plot",
			"column": "Employment_Type",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 4,
			"values": [
				{
					"count": 12,
					"label": "Private",
					"percentage": 60.0
				},
				{
					"count": 4,
					"label": "Government",
					"percentage": 20.0
				},
				{
					"count": 2,
					"label": "Self-Employed",
					"percentage": 10.0
				},
				{
					"count": 2,
					"label": "Retired",
					"percentage": 10.0
				}
			]
		},
		{
			"charttype": "Waterfall Chart",
			"column": "Country",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 1,
			"values": [
				{
					"count": 20,
					"label": "India",
					"percentage": 100.0
				}
			]
		},
		{
			"charttype": "Sunburst Chart",
			"column": "Home_Ownership",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 2,
			"values": [
				{
					"count": 11,
					"label": "Owned",
					"percentage": 55.0
				},
				{
					"count": 9,
					"label": "Rented",
					"percentage": 45.0
				},
				{
					"count": 11,
					"label": "Owned",
					"percentage": 55.0
				},
				{
					"count": 9,
					"label": "Rented",
					"percentage": 45.0
				},
				{
					"count": 11,
					"label": "Owned",
					"percentage": 55.0
				},
				{
					"count": 9,
					"label": "Rented",
					"percentage": 45.0
				}
			]
		},
		{
			"charttype": "Donut Chart",
			"column": "Vehicle_Ownership",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 2,
			"values": [
				{
					"count": 15,
					"label": "Yes",
					"percentage": 75.0
				},
				{
					"count": 5,
					"label": "No",
					"percentage": 25.0
				}
			]
		},
		{
			"charttype": "Histogram",
			"column": "Internet_Access",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 1,
			"values": [
				{
					"count": 20,
					"label": "Yes",
					"percentage": 100.0
				}
			]
		},
		{
			"charttype": "Gantt Chart",
			"column": "Smartphone_User",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 2,
			"values": [
				{
					"count": 18,
					"label": "Yes",
					"percentage": 90.0
				},
				{
					"count": 2,
					"label": "No",
					"percentage": 10.0
				}
			]
		},
		{
			"charttype": "Heatmap",
			"column": "Occupation_Category",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 5,
			"values": [
				{
					"count": 7,
					"label": "IT",
					"percentage": 35.0
				},
				{
					"count": 4,
					"label": "Finance",
					"percentage": 20.0
				},
				{
					"count": 4,
					"label": "Student",
					"percentage": 20.0
				},
				{
					"count": 3,
					"label": "Business",
					"percentage": 15.0
				},
				{
					"count": 2,
					"label": "Retired",
					"percentage": 10.0
				}
			]
		},
		{
			"charttype": "Radar Chart",
			"column": "Urban_Rural",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 1,
			"values": [
				{
					"count": 20,
					"label": "Urban",
					"percentage": 100.0
				}
			]
		}
	],
	"Profile data": [
		{
			"charttype": "Column Chart",
			"column": "Gender",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 2,
			"values": [
				{
					"count": 11,
					"label": "Male",
					"percentage": 55.0
				},
				{
					"count": 9,
					"label": "Female",
					"percentage": 45.0
				}
			]
		},
		{
			"charttype": "Area Chart",
			"column": "Language",
			"missing_count": 0,
			"total": 20,
			"type": "categorical",
			"unique_count": 5,
			"values": [
				{
					"count": 6,
					"label": "Marathi",
					"percentage": 30.0
				},
				{
					"count": 5,
					"label": "Tamil",
					"percentage": 25.0
				},
				{
					"count": 3,
					"label": "Kannada",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Telugu",
					"percentage": 15.0
				},
				{
					"count": 3,
					"label": "Hindi",
					"percentage": 15.0
				}
			]
		}
	]
}