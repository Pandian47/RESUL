import { IMAGE_UPLOAD, PDF_UPLOAD, VIDEO_UPLOAD } from 'Constants/GlobalConstant/Placeholders';
export const tempCarouselTemplate = {
    actions: [],

    bodyMaxLength: 1040,

    bodyTags: ['1'],

    carousel: [
        {
            actions: [
                {
                    actionIndex: 0,

                    actionName: 'url',

                    actionNameTags: [],

                    actionType: 'url',

                    actionValueTags: [],

                    isNameEditable: false,

                    isValueEditable: false,

                    urlType: 'static',

                    value: 'www.google.com',
                },

                {
                    actionIndex: 1,

                    actionName: 'quick_reply',

                    actionNameTags: [],

                    actionType: 'quick reply',

                    actionValueTags: ['qr_payload_1'],

                    isNameEditable: false,

                    isValueEditable: true,

                    urlType: 'dynamic',

                    value: '{{qr_payload_1}}',
                },
            ],

            bodyTags: ['[[Name]]|[[rahul]]'],

            cardBody: 'Hi {{ [[Name]]|[[rahul]] }} a',

            cardIndex: 0,

            isCardBodyEditable: true,

            isMedia: true,

            isMediaTypeEditable: false,

            mediaType: 'image',

            mediaValue: 'https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg',
        },

        {
            actions: [
                {
                    actionIndex: 0,

                    actionName: 'url',

                    actionNameTags: [],

                    actionType: 'url',

                    actionValueTags: [],

                    isNameEditable: false,

                    isValueEditable: false,

                    urlType: 'static',

                    value: 'www.resulticks.com',
                },

                {
                    actionIndex: 1,

                    actionName: 'quick_reply',

                    actionNameTags: [],

                    actionType: 'quick reply',

                    actionValueTags: ['qr_payload_1'],

                    isNameEditable: false,

                    isValueEditable: true,

                    urlType: 'dynamic',

                    value: '{{qr_payload_1}}',
                },
            ],

            bodyTags: ['[[Name]]|[[rahul]]'],

            cardBody: 'Hi {{ [[Name]]|[[rahul]] }} b',

            cardIndex: 1,

            isCardBodyEditable: true,

            isMedia: true,

            isMediaTypeEditable: false,

            mediaType: 'image',

            mediaValue: 'https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg',
        },
    ],

    footer: '',

    footerMaxLength: 60,

    footerTags: [],

    header: '',

    headerMaxLength: 60,

    headerTags: [],

    isAction: true,

    isBodyEditable: false,

    isCarousel: true,

    isFooter: false,

    isFooterEditable: false,

    isHeader: false,

    isHeaderEditable: false,

    isMedia: true,

    isMediaTypeEditable: true,

    isUnicode: false,

    languageId: 'en',

    mediaSizeInMB: 10,

    mediaType: '',

    mediaURL: '',

    mediaURLTags: [],

    mediaUrlMaxLength: 1040,

    templateContent: 'Hi {{1}},\n  Testing the carousel template.\nThanks',

    templateName: 'after_24_hours_002',

    templateType: 11,

    waTemplateId: 264,
};

export const defaultNewtWithoutCarouselTemplate = {
    actions: [
        {
            actionIndex: 0,

            actionName: 'url',

            actionNameTags: [],

            actionType: 'url',

            actionValueTags: [],

            isNameEditable: false,

            isValueEditable: false,

            urlType: 'static',

            value: 'www.google.com',
        },

        {
            actionIndex: 1,

            actionName: 'quick_reply',

            actionNameTags: [],

            actionType: 'quick reply',

            actionValueTags: ['qr_payload_1'],

            isNameEditable: false,

            isValueEditable: true,

            urlType: 'dynamic',

            value: '{{qr_payload_1}}',
        },
    ],

    bodyMaxLength: 1040,

    bodyTags: [],

    carousel: [],

    footer: '',

    footerMaxLength: 60,

    footerTags: [],

    header: '',

    headerMaxLength: 60,

    headerTags: [],

    isAction: true,

    isBodyEditable: false,

    isCarousel: false,

    isFooter: false,

    isFooterEditable: false,

    isHeader: false,

    isHeaderEditable: false,

    isMedia: false,

    isMediaTypeEditable: true,

    isUnicode: false,

    languageId: 'en',

    mediaSizeInMB: 10,

    mediaType: '',

    mediaURL: '',

    mediaURLTags: [],

    mediaUrlMaxLength: 1040,

    templateContent:
        '{{1}}Supercharge your marketing with Resulticks! Deliver personalized, multi-channel campaigns that drive real results. Ready to make an impact?{{2}}',

    templateName: '763141',

    templateType: 4,

    waTemplateId: 255,
};

export const defaultWithoutCarouselTemplate = {
    actions: [],

    bodyMaxLength: 1040,

    bodyTags: [],

    carousel: [],

    footer: '',

    footerMaxLength: 60,

    footerTags: [],

    header: '',

    headerMaxLength: 60,

    headerTags: [],

    isAction: false,

    isBodyEditable: false,

    isCarousel: false,

    isFooter: true,

    isFooterEditable: false,

    isHeader: true,

    isHeaderEditable: false,

    isMedia: false,

    isMediaTypeEditable: true,

    isUnicode: false,

    languageId: 'en',

    mediaSizeInMB: 10,

    mediaType: '',

    mediaURL: '',

    mediaURLTags: [],

    mediaUrlMaxLength: 1040,

    templateContent:
        '{{1}}Supercharge your marketing with Resulticks! Deliver personalized, multi-channel campaigns that drive real results. Ready to make an impact?{{2}}',

    templateName: '763141',

    templateType: 4,

    waTemplateId: 256,
};

export const tempGetHSMTemplate = {
    data: [
        {
            "actions": [
                {
                    "actionIndex": 0,
                    "actionName": "Call",
                    "actionNameParam": [],
                    "actionType": "call phone number",
                    "actionValueParam": [],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "value": "917895172025"
                },
                {
                    "actionIndex": 1,
                    "actionName": "Shop Now",
                    "actionNameParam": [],
                    "actionType": "url",
                    "actionValueParam": [
                        "1"
                    ],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "urlType": "dynamic",
                    "value": "https://www.examplesite.com/shop?promo={{1}}"
                }
            ],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1",
                "2",
                "3"
            ],
            "carousel": [],
            "footer": "Offer valid until May 31, 2023",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": true,
            "isBodyEditable": false,
            "isCarousel": false,
            "isFooter": true,
            "isFooterEditable": false,
            "isHeader": true,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": true,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "document",
            "mediaURL": "https://sample-files.com/downloads/documents/pdf/image-doc.pdf",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
            "templateName": "wa_template_june10_9",
            "templateType": 11,
            "waTemplateId": 276
        },
        {
            "actions": [
                {
                    "actionIndex": 0,
                    "actionName": "Call",
                    "actionNameParam": [],
                    "actionType": "call phone number",
                    "actionValueParam": [],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "value": "917895172025"
                },
                {
                    "actionIndex": 1,
                    "actionName": "Shop Now",
                    "actionNameParam": [],
                    "actionType": "url",
                    "actionValueParam": [
                        "1"
                    ],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "urlType": "dynamic",
                    "value": "https://www.examplesite.com/shop?promo={{1}}"
                },
                {
                    "actionIndex": 2,
                    "actionName": "Shop Now",
                    "actionNameParam": [],
                    "actionType": "url",
                    "actionValueParam": [],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "urlType": "static",
                    "value": "https://www.examplesite.com/shop"
                }
            ],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1",
                "2",
                "3"
            ],
            "carousel": [],
            "footer": "Offer valid until May 31, 2023",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": true,
            "isBodyEditable": false,
            "isCarousel": false,
            "isFooter": true,
            "isFooterEditable": false,
            "isHeader": true,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": true,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "video",
            "mediaURL": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
            "templateName": "wa_template_june10_8",
            "templateType": 11,
            "waTemplateId": 275
        },
        {
            "actions": [
                {
                    "actionIndex": 0,
                    "actionName": "Call",
                    "actionNameParam": [],
                    "actionType": "call phone number",
                    "actionValueParam": [],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "value": "917895172025"
                },
                {
                    "actionIndex": 1,
                    "actionName": "Shop Now",
                    "actionNameParam": [],
                    "actionType": "url",
                    "actionValueParam": [
                        "1"
                    ],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "urlType": "dynamic",
                    "value": "https://www.examplesite.com/shop?promo={{1}}"
                }
            ],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1",
                "2",
                "3"
            ],
            "carousel": [],
            "footer": "Offer valid until May 31, 2023",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": true,
            "isBodyEditable": false,
            "isCarousel": false,
            "isFooter": true,
            "isFooterEditable": false,
            "isHeader": true,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": true,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "image",
            "mediaURL": "https://lazesoftware.com/img/en/tool/og/dummyimg.png?1720316717",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
            "templateName": "wa_template_june10_7",
            "templateType": 11,
            "waTemplateId": 274
        },
        {
            "actions": [
                {
                    "actionIndex": 0,
                    "actionName": "Unsubcribe from Promos",
                    "actionNameParam": [],
                    "actionType": "quick reply",
                    "actionValueParam": [],
                    "isNameEditable": false,
                    "isValueEditable": true,
                    "value": "Unsubcribe from Promos"
                },
                {
                    "actionIndex": 1,
                    "actionName": "Unsubcribe from All",
                    "actionNameParam": [],
                    "actionType": "quick reply",
                    "actionValueParam": [],
                    "isNameEditable": false,
                    "isValueEditable": true,
                    "value": "Unsubcribe from All"
                }
            ],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1",
                "2",
                "3"
            ],
            "carousel": [],
            "footer": "Use the buttons below to manage your marketing subscriptions",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "Our {{1}} is on!",
            "headerMaxLength": 60,
            "headerTags": [
                "1"
            ],
            "isAction": true,
            "isBodyEditable": false,
            "isCarousel": false,
            "isFooter": true,
            "isFooterEditable": false,
            "isHeader": true,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": true,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Shop now through {{1}} and use code {{2}} to get {{3}} off of all merchandise.",
            "templateName": "wa_template_june10_6",
            "templateType": 11,
            "waTemplateId": 273
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [],
            "carousel": [],
            "footer": "Thank You",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "Hello",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": false,
            "isFooter": true,
            "isFooterEditable": false,
            "isHeader": true,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": true,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "The awesome products😍 from us are waiting to be yours!\nGet your products here👇",
            "templateName": "wa_template_june10_5",
            "templateType": 11,
            "waTemplateId": 272
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1",
                "2",
                "3"
            ],
            "carousel": [
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Call",
                            "actionNameParam": [],
                            "actionType": "call phone number",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "value": "917895172025"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Shop Now",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "https://www.examplesite.com/shop?promo={{1}}"
                        }
                    ],
                    "bodyTags": [
                        "1",
                        "2",
                        "3"
                    ],
                    "cardBody": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
                    "cardIndex": 0,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "video",
                    "mediaValue": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Call",
                            "actionNameParam": [],
                            "actionType": "call phone number",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "value": "917895172025"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Shop Now",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "https://www.examplesite.com/shop?promo={{1}}"
                        }
                    ],
                    "bodyTags": [
                        "1",
                        "2",
                        "3"
                    ],
                    "cardBody": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
                    "cardIndex": 1,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "video",
                    "mediaValue": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                }
            ],
            "footer": "",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": true,
            "isFooter": false,
            "isFooterEditable": false,
            "isHeader": false,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": false,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
            "templateName": "wa_template_june10_4",
            "templateType": 11,
            "waTemplateId": 271
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1"
            ],
            "carousel": [
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "click",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "www.google.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Know More",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Know More"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "Hi {{1}}, Limited Offers 1",
                    "cardIndex": 0,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "video",
                    "mediaValue": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "click",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "www.resulticks.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Yes",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Yes"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "Hi {{1}}, Limited Offers 2",
                    "cardIndex": 1,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "video",
                    "mediaValue": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "click",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "www.facebook.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Accept",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Accept"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "Hi {{1}}, Limited Offers 3",
                    "cardIndex": 2,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                }
            ],
            "footer": "",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": true,
            "isFooter": false,
            "isFooterEditable": false,
            "isHeader": false,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": false,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}, Limited Offers!",
            "templateName": "wa_template_june10_3",
            "templateType": 11,
            "waTemplateId": 270
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1"
            ],
            "carousel": [
                {
                    "actions": [
                        {
                            "actionIndex": 1,
                            "actionName": "Yes",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Yes"
                        }
                    ],
                    "bodyTags": [
                        "1",
                        "2"
                    ],
                    "cardBody": "Rare apples for unique cocktails. Use code {{1}} to get {{2}} off all reduce .",
                    "cardIndex": 0,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://24toolbox.com/assets/image/og/dummy-%C4%ABmage-generator-tool.jpg?ver=220114.01"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 1,
                            "actionName": "Yes",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Yes"
                        }
                    ],
                    "bodyTags": [
                        "1",
                        "2"
                    ],
                    "cardBody": "Exotic drinks for common cocktails! Use code {{1}} to get {{2}} off all exotic produce.",
                    "cardIndex": 1,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://lazesoftware.com/img/en/tool/og/dummyimg.png?1720316717"
                }
            ],
            "footer": "",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": true,
            "isFooter": false,
            "isFooterEditable": false,
            "isHeader": false,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": false,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Spring is here{{1}} to get off your previous order.",
            "templateName": "wa_template_june10_2",
            "templateType": 11,
            "waTemplateId": 269
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1"
            ],
            "carousel": [
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Click",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "www.google.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Know More",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Know More"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "Hi {{1}}, Limited Offer 1",
                    "cardIndex": 0,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Check",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "www.resulticks.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Know More",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Know More"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "Hi {{1}}, Limited Offer 2",
                    "cardIndex": 1,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Check",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "www.facebook.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Know More",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Know More"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "Hi {{1}}, Limited Offer 3",
                    "cardIndex": 2,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Check",
                            "actionNameParam": [],
                            "actionType": "url",
                            "actionValueParam": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "www.linkenin.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Know More",
                            "actionNameParam": [],
                            "actionType": "quick reply",
                            "actionValueParam": [],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "value": "Know More"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "Hi {{1}}, Limited Offer 4",
                    "cardIndex": 3,
                    "isCardBodyEditable": false,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                }
            ],
            "footer": "",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": true,
            "isFooter": false,
            "isFooterEditable": false,
            "isHeader": false,
            "isHeaderEditable": false,
            "isMediaEditable": true,
            "isUnicode": false,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}, check it out!",
            "templateName": "wa_template_june10_1",
            "templateType": 11,
            "waTemplateId": 268
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1"
            ],
            "carousel": [
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "url",
                            "actionNameTags": [],
                            "actionType": "url",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "static",
                            "value": "www.google.com"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "quick_reply",
                            "actionNameTags": [],
                            "actionType": "quick reply",
                            "actionValueTags": [
                                "qr_payload_1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "urlType": "dynamic",
                            "value": "{{qr_payload_1}}"
                        }
                    ],
                    "bodyTags": [
                        "[[Name]]|[[rahul]]"
                    ],
                    "cardBody": "Hi {{ [[Name]]|[[rahul]] }}",
                    "cardIndex": 0,
                    "isCardBodyEditable": true,
                    "isMedia": true,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "url",
                            "actionNameTags": [],
                            "actionType": "url",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "static",
                            "value": "www.resulticks.com"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "quick_reply",
                            "actionNameTags": [],
                            "actionType": "quick reply",
                            "actionValueTags": [
                                "qr_payload_1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": true,
                            "urlType": "dynamic",
                            "value": "{{qr_payload_1}}"
                        }
                    ],
                    "bodyTags": [
                        "[[Name]]|[[rahul]]"
                    ],
                    "cardBody": "Hi {{ [[Name]]|[[rahul]] }}",
                    "cardIndex": 1,
                    "isCardBodyEditable": true,
                    "isMedia": true,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                }
            ],
            "footer": "",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": true,
            "isFooter": false,
            "isFooterEditable": false,
            "isHeader": false,
            "isHeaderEditable": false,
            "isMedia": true,
            "isMediaTypeEditable": true,
            "isUnicode": false,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}},\n  Testing the carousel template.\nThanks",
            "templateName": "after_24_hours_002",
            "templateType": 11,
            "waTemplateId": 264
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [],
            "carousel": [
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Shop Now!",
                            "actionNameTags": [],
                            "actionType": "url",
                            "actionValueTags": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "static",
                            "value": "https://www.google.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Yes",
                            "actionNameTags": [],
                            "actionType": "quick reply",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "value": "Yes"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "carousel 1 , hello {{67}} find the gift",
                    "cardIndex": 0,
                    "isCardBodyEditable": false,
                    "isMedia": true,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Shop Now!",
                            "actionNameTags": [],
                            "actionType": "url",
                            "actionValueTags": [
                                "1"
                            ],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "dynamic",
                            "value": "https://www.resulticks.com/{1}"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Yes",
                            "actionNameTags": [],
                            "actionType": "quick reply",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "value": "Yes"
                        }
                    ],
                    "bodyTags": [
                        "1"
                    ],
                    "cardBody": "carousel 2 {{75}} check the great to share this with you",
                    "cardIndex": 1,
                    "isCardBodyEditable": false,
                    "isMedia": true,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                }
            ],
            "footer": "",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": true,
            "isFooter": false,
            "isFooterEditable": false,
            "isHeader": false,
            "isHeaderEditable": false,
            "isMedia": true,
            "isMediaTypeEditable": true,
            "isUnicode": true,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}, Have a nice day 😃\nour product will be launch on Monday\nthanks",
            "templateName": "WA_template_003",
            "templateType": 11,
            "waTemplateId": 267
        },
        {
            "actions": [],
            "bodyMaxLength": 1040,
            "bodyTags": [],
            "carousel": [
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Click Now",
                            "actionNameTags": [],
                            "actionType": "url",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "static",
                            "value": "https://resul.io//https://www.google.com"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "Yes",
                            "actionNameTags": [],
                            "actionType": "quick reply",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "value": "Yes"
                        }
                    ],
                    "bodyTags": [],
                    "cardBody": "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Than",
                    "cardIndex": 0,
                    "isCardBodyEditable": false,
                    "isMedia": true,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                },
                {
                    "actions": [
                        {
                            "actionIndex": 0,
                            "actionName": "Visit US",
                            "actionNameTags": [],
                            "actionType": "url",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "urlType": "static",
                            "value": "https://resul.io/%7B/https://www.resulticks.com"
                        },
                        {
                            "actionIndex": 1,
                            "actionName": "know More",
                            "actionNameTags": [],
                            "actionType": "quick reply",
                            "actionValueTags": [],
                            "isNameEditable": false,
                            "isValueEditable": false,
                            "value": "know More"
                        }
                    ],
                    "bodyTags": [],
                    "cardBody": "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Than",
                    "cardIndex": 1,
                    "isCardBodyEditable": false,
                    "isMedia": true,
                    "isMediaTypeEditable": false,
                    "mediaType": "image",
                    "mediaValue": "https://assets.vogue.in/photos/5d809b567339c2000891e85f/master/pass/books.jpg"
                }
            ],
            "footer": "",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "",
            "headerMaxLength": 60,
            "headerTags": [],
            "isAction": false,
            "isBodyEditable": false,
            "isCarousel": true,
            "isFooter": false,
            "isFooterEditable": false,
            "isHeader": false,
            "isHeaderEditable": false,
            "isMedia": true,
            "isMediaTypeEditable": true,
            "isUnicode": false,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "*check Out!!*",
            "templateName": "WA_template_002",
            "templateType": 11,
            "waTemplateId": 266
        },
        {
            "actions": [
                {
                    "actionIndex": 0,
                    "actionName": "Yes",
                    "actionNameTags": [],
                    "actionType": "quick reply",
                    "actionValueTags": [],
                    "isNameEditable": false,
                    "isValueEditable": false,
                    "value": "Yes"
                }
            ],
            "bodyMaxLength": 1040,
            "bodyTags": [
                "1",
                "2"
            ],
            "carousel": [],
            "footer": "plz check it",
            "footerMaxLength": 60,
            "footerTags": [],
            "header": "Offer Alert {{7}}",
            "headerMaxLength": 60,
            "headerTags": [
                "1"
            ],
            "isAction": true,
            "isBodyEditable": false,
            "isCarousel": false,
            "isFooter": true,
            "isFooterEditable": false,
            "isHeader": true,
            "isHeaderEditable": false,
            "isMedia": false,
            "isMediaTypeEditable": true,
            "isUnicode": false,
            "languageId": "en",
            "mediaSizeInMB": 10,
            "mediaType": "text",
            "mediaURL": "",
            "mediaURLTags": [],
            "mediaUrlMaxLength": 1040,
            "templateContent": "Hi {{1}}, Have a nice day\nour product will be launch on {{2}}",
            "templateName": "WA_template_001",
            "templateType": 11,
            "waTemplateId": 265
        }
    ]
};

export const getWhatsappUploadConfig = (handleImageData, mediaType, currCarousel) => [
    {
        key: 'image',
        isEligible: mediaType === 'image',
        tooltipKey: 'image',
        tooltipText: IMAGE_UPLOAD,
        contentType: 'img',
        editable: currCarousel?.isMediaTypeEditable,
        extraProps: {
            isPrefix: false,
            isWhatsApp: true,
            handleImageData: async (data, fileName, contentLength) => {
                const res = await handleImageData(data, fileName, contentLength);
                return res;
            },
        },
    },
    {
        key: 'pdf',
        isEligible: mediaType === 'pdf',
        tooltipKey: 'pdf',
        tooltipText: PDF_UPLOAD,
        editable: currCarousel?.isMediaTypeEditable,
        contentType: 'pdf',
        extraProps: {},
    },
    {
        key: 'video',
        isEligible: mediaType === 'video',
        tooltipKey: 'video',
        tooltipText: VIDEO_UPLOAD,
        editable: currCarousel?.isMediaTypeEditable,

        contentType: 'video',
        extraProps: {
            isWhatsApp: true,
            isNotificationUpload: true,
        },
    },
];

