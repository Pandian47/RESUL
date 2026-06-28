import { numberWithCommas } from 'Utils/modules/formatters';
import { CODING_LAYOUT, CONTENT_LENGTH, DELIVERABILITY, EMAIL_FOOTER, FILE_TYPE, FILE_WEIGHT, IMAGE_ATTACHED, IMAGE_TO_TEXT_RATIO, LANGUAGE, LINK_VERIFICATION, NUMBER_OF_SMS, PERSONALIZATION_ENABLED, PROJECTED_OPEN_RATE, RETRY_COUNT, SDK_STATUS as SDK_STATUS_PH, SUBJECT_LINE_SPAM_SCORE, TRIGGER_TYPE, UNICODE, UNIQUE_CODE } from 'Constants/GlobalConstant/Placeholders';
import { arrow_down_medium, arrow_up_medium, bold_close_medium, checkbox_medium, circle_tick_medium, link_medium, thumbs_down_fill_medium, thumbs_up_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
export const SDK_STATUS = {
    title: SDK_STATUS_PH,
    value: 'Web analytics',
};

export const LINK_VERIFICATION_DATA = [
    {
        title: LINK_VERIFICATION,
        value: 'www.visionbank.com/products/',
    },
];

export const CONTENT_ANALYSIS_DATA_MAP = (value, allValues) => {
    let scoreIcon;
    if (value?.spamScore !== '') {
        if (value?.spamScore < 50) scoreIcon = `${thumbs_down_fill_medium} icon-md color-primary-red`;
        else scoreIcon = `${thumbs_up_fill_medium} icon-md color-primary-green`;
    } else scoreIcon = '';
    let tempData = [
        {
            tab: 'Email',
            data1: [
                {
                    title: SUBJECT_LINE_SPAM_SCORE,
                    value: value?.spamScore !== '' ? value?.spamScore : '--',
                    percent: value?.spamScore !== '',
                    icon: scoreIcon,
                },
                {
                    title: IMAGE_TO_TEXT_RATIO,
                    value: value?.ratio,
                    icon:
                        (value?.ratio?.split(':')[0] === 0 && value?.ratio?.split(':')[1] === 0) ||
                        value?.ratio?.split(':')[0] > 40
                            ? `${bold_close_medium} icon-md color-primary-red pl5`
                            : `${checkbox_medium} icon-md color-primary-green pl5`,
                },
                {
                    title: FILE_WEIGHT,
                    value: value?.fileWeight,
                    icon:
                        Number(value?.fileWeight) === 0 || Number(value?.fileWeight) > 800
                            ? `${bold_close_medium} icon-md color-primary-red pl5`
                            : `${checkbox_medium} icon-md color-primary-green pl5`,
                    customSymbol: 'kb',
                },
            ],
            data2: [
                {
                    title: DELIVERABILITY,
                    value:
                        value?.sfdeliverability === '' || value?.sfdeliverability === undefined
                            ? '--'
                            : value?.sfdeliverability,
                    percent: value?.sfdeliverability !== '' && value?.sfdeliverability !== undefined,
                },
                {
                    title: PROJECTED_OPEN_RATE,
                    value: value?.projectedOpenRate === '' ? '--' : value?.projectedOpenRate,
                    percent: value?.projectedOpenRate !== '' && value?.projectedOpenRate !== undefined,
                },
                {
                    title: CODING_LAYOUT,
                    value:
                        value?.sfcodingLayout === '' || value?.sfcodingLayout === undefined
                            ? '--'
                            : value?.sfcodingLayout,
                    percent: value?.sfcodingLayout !== '' && value?.sfcodingLayout !== undefined,
                    icon:
                        value?.sfcodingLayout !== '' && value?.sfcodingLayout !== undefined
                            ? `${arrow_down_medium} color-primary-red`
                            : '',
                },
            ],
            data3: [
                {
                    title: EMAIL_FOOTER,
                    value: value?.IsFooterEnabled == 1 ? 'Enabled' : 'Not enabled',
                    icon:
                        value?.IsFooterEnabled == 1
                            ? `${checkbox_medium} icon-md color-primary-green bottom3 position-relative`
                            : `${bold_close_medium} icon-md color-primary-red bottom3 position-relative`,
                },
            ],
        },
        {
            tab: 'SMS',
            data1: [
                {
                    title: NUMBER_OF_SMS,
                    value: numberWithCommas(value?.noofSMS),
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: PERSONALIZATION_ENABLED,
                    value:
                        value?.personalization === '' || value?.personalization === undefined
                            ? '--'
                            : value?.personalization,
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: UNICODE,
                    value: value?.unicode,
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
            ],
        },
        {
            tab: 'WhatsApp',
            data1: [
                {
                    title: CONTENT_LENGTH,
                    value: value?.isCarousel
                        ? numberWithCommas((value?.carouselContent?.length || 0) + (allValues?.waContent?.length || 0))
                        : value?.waContent?.length
                        ? numberWithCommas(value?.waContent?.length || 0)
                        : '--',
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: PERSONALIZATION_ENABLED,
                    value: value?.isCarousel
                        ? value?.carouselpersonalization
                        : !!value?.personalization
                        ? value?.personalization
                        : '--',
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: LANGUAGE,
                    value: value?.languagecode === '' || value?.languagecode === undefined ? '--' : value?.languagecode,
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
            ],
        },
        {
            tab: 'VMS',
            data1: [
                {
                    title: FILE_WEIGHT,
                    value: !!value?.fileWeight ? value?.fileWeight : 'NA',
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: FILE_TYPE,
                    value: !!value?.fileType ? value?.fileType?.split('.').pop() : 'NA',
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: RETRY_COUNT,
                    value: !!value?.retryCount ? value?.retryCount : '--',
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
            ],
        },
        {
            tab: 'Line',
            data1: [
                {
                    title: CONTENT_LENGTH,
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: PERSONALIZATION_ENABLED,
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: LANGUAGE,
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
            ],
        },
        {
            tab: 'Mobile Push',
            data1: [
                {
                    title: CONTENT_LENGTH,
                    value: !!value?.contentlength ? value?.contentlength : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: PERSONALIZATION_ENABLED,
                    value: !!value?.personalization ? value?.personalization : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: IMAGE_ATTACHED,
                    value: !!value?.imageattached ? value?.imageattached : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
            ],
        },
        {
            tab: 'Web Push',
            data1: [
                {
                    title: CONTENT_LENGTH,
                    value: !!value?.contentlength ? numberWithCommas(value?.contentlength) : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: PERSONALIZATION_ENABLED,
                    value: !!value?.personalization ? value?.personalization : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: TRIGGER_TYPE,
                    value: !!value?.triggerType ? value?.triggerType : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
            ],
        },
        {
            tab: 'RCS',
            data1: [
                {
                    title: CONTENT_LENGTH,
                    value:
                        (value?.cards?.[0]?.cardTitle?.length || 0) +
                            (value?.cards?.[0]?.cardDesctiption?.length || 0) >
                        0
                            ? numberWithCommas(
                                  (value?.cards?.[0]?.cardTitle?.length || 0) +
                                      (value?.cards?.[0]?.cardDesctiption?.length || 0),
                              )
                            : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: PERSONALIZATION_ENABLED,
                    value: value?.isCarousel
                        ? value?.cards?.[0]?.personalization
                        : !!value?.personalization
                        ? value?.personalization
                        : '--',
                    percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
                {
                    title: LANGUAGE,
                    value: value?.languagecode === '' || value?.languagecode === undefined ? '--' : value?.languagecode,
                    // percent: false,
                    // icon: `${arrow_up_medium} icon-md color-primary-green`,
                },
            ],
        },
    ];
    return tempData;
};

export const CONTENT_ANALYSIS_DATA = [
    {
        tab: 'Email',
        data1: [
            {
                title: SUBJECT_LINE_SPAM_SCORE,
                value: '80',
                percent: true,
                icon: `${thumbs_up_fill_medium} icon-md color-primary-green`,
            },
            {
                title: IMAGE_TO_TEXT_RATIO,
                value: '40:60',
                icon: `${checkbox_medium} icon-md color-primary-green pl5`,
            },
            {
                title: FILE_WEIGHT,
                value: '40Kb',
                icon: `${checkbox_medium} icon-md color-primary-green pl5`,
            },
        ],
        data2: [
            {
                title: DELIVERABILITY,
                value: '74.90',
                percent: true,
            },
            {
                title: PROJECTED_OPEN_RATE,
                value: '15',
                percent: true,
            },
            {
                title: CODING_LAYOUT,
                value: '5.32',
                percent: true,
                icon: `${arrow_down_medium} color-primary-red`,
            },
        ],
    },
    {
        tab: 'SMS',
        data1: [
            {
                title: NUMBER_OF_SMS,
                value: '1500',
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: PERSONALIZATION_ENABLED,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: UNIQUE_CODE,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
        ],
    },
    {
        tab: 'WhatsApp',
        data1: [
            {
                title: CONTENT_LENGTH,
                value: '2300',
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: PERSONALIZATION_ENABLED,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: LANGUAGE,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
        ],
    },
    {
        tab: 'VMS',
        data1: [
            {
                title: FILE_WEIGHT,
                value: '1500',
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: FILE_TYPE,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: RETRY_COUNT,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
        ],
    },
    {
        tab: 'Line',
        data1: [
            {
                title: CONTENT_LENGTH,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: PERSONALIZATION_ENABLED,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: LANGUAGE,
                percent: false,
                icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
        ],
    },
    {
        tab: 'Mobile Push',
        data1: [
            {
                title: CONTENT_LENGTH,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: PERSONALIZATION_ENABLED,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: IMAGE_ATTACHED,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
        ],
    },
    {
        tab: 'Web Push',
        data1: [
            {
                title: CONTENT_LENGTH,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: PERSONALIZATION_ENABLED,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: TRIGGER_TYPE,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
        ],
    },
    {
        tab: 'RCS',
        data1: [
            {
                title: CONTENT_LENGTH,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: PERSONALIZATION_ENABLED,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
            {
                title: LANGUAGE,
                percent: false,
                // icon: `${arrow_up_medium} icon-md color-primary-green`,
            },
        ],
    },
];

export const CONTENT_LINK_STATUS = [
    {
        linkIcon: link_medium,
        url: 'www.visionbank.com/[[ProductInformation]]',
        statusIcon: circle_tick_medium,
    },
    {
        linkIcon: link_medium,
        url: 'www.vb.com/[[Offer$$Group2]]',
        statusIcon: circle_tick_medium,
    },
    {
        linkIcon: link_medium,
        url: 'www.visionbank.com/gold-bonds/',
        statusIcon: circle_tick_medium,
    },
    {
        linkIcon: link_medium,
        url: 'www.vb.com/[[Prod_Name]]',
        statusIcon: circle_tick_medium,
    },
    {
        linkIcon: link_medium,
        url: 'www.visionbank.com/atm-services/',
        statusIcon: circle_tick_medium,
    },
];
