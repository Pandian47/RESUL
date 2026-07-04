import { AUDIENCE_GLYPH as G } from '../../../../audienceGlyphs';
export const ATTRIBUTE_TYPES = ['Contains', 'Does not contain', 'Is equal to', 'Is not equal to'];

export const DATE_ATTRIBUTE_TYPES = ['Before', 'Between', 'After'];

export const AUDIENCE_BASE_TYPES = ['Before', 'Between', 'After'];
export const AUDIENCE_BASE_NUMBER_TYPES = ['Greater than', 'Lesser than', 'Between', 'Is equal to', 'Is not equal to'];

export const TRIGGER_ATTRIBUTE_VALUE_DROPDOWN_PROPS = {
    textField: 'value',
    dataItemKey: 'id',
};

export const COMPARISON_MAP = {
    // String comparisons (for T, D, SD, etc.)
    isequalto: 'Is equal to',
    isnotequalto: 'Is not equal to',
    in: 'Contains',
    'not in': 'Does not contain',
    Like: 'Like',
    Doesnotlike: 'Does not like',
    Startswith: 'Starts with',
    Endswith: 'Ends with',
    hasnovalue: 'Has no value',
    hasvalue: 'Has value',
    
    // Number/Decimal comparisons
    isgreaterthanorequalto: 'Is greater than or equal to',
    isgreaterthan: 'Is greater than',
    islessthanorequalto: 'Is less than or equal to',
    islessthan: 'Is less than',
    between: 'Between',
    
    // Special symbols for NR field type
    '=': 'Is equal to',
    '#': 'Is not equal to',
    '>': 'Greater than',
    '<': 'Lesser than',
    '[]': 'Between',
    
    // Special symbols for AN field type
    '+': 'add',
    '-': 'minus',
};

const SYMBOL_KEYS = ['=', '#', '>', '<', '[]', '+', '-'];
const API_VALUE_KEYS = Object.keys(COMPARISON_MAP).filter(
    key => !SYMBOL_KEYS.includes(key)
);

export const COMPARISON_REVERSE_MAP = Object.fromEntries(
    API_VALUE_KEYS.map(key => [COMPARISON_MAP[key], key])
);

export const SYMBOL_TO_DISPLAY_MAP = {
    '=': COMPARISON_MAP['='],
    '#': COMPARISON_MAP['#'],
    '>': COMPARISON_MAP['>'],
    '<': COMPARISON_MAP['<'],
    '[]': COMPARISON_MAP['[]'],
};

export const DISPLAY_TO_SYMBOL_MAP = Object.fromEntries(
    Object.entries(SYMBOL_TO_DISPLAY_MAP).map(([key, value]) => [value, key])
);

export const AN_SYMBOL_MAP = {
    '+': COMPARISON_MAP['+'],
    '-': COMPARISON_MAP['-'],
};
export const AN_DISPLAY_TO_SYMBOL_MAP = Object.fromEntries(
    Object.entries(AN_SYMBOL_MAP).map(([key, value]) => [value, key])
);

export const comparisonTypeConfig = {
    string: {
        isequalto: COMPARISON_MAP.isequalto,
        isnotequalto: COMPARISON_MAP.isnotequalto,
        in: COMPARISON_MAP.in,
        'not in': COMPARISON_MAP['not in'],
        Like: COMPARISON_MAP.Like,
        Doesnotlike: COMPARISON_MAP.Doesnotlike,
        Startswith: COMPARISON_MAP.Startswith,
        Endswith: COMPARISON_MAP.Endswith,
        hasnovalue: COMPARISON_MAP.hasnovalue,
        hasvalue: COMPARISON_MAP.hasvalue,
    },
    number_Decimal: {
        isequalto: COMPARISON_MAP.isequalto,
        isnotequalto: COMPARISON_MAP.isnotequalto,
        isgreaterthanorequalto: COMPARISON_MAP.isgreaterthanorequalto,
        isgreaterthan: COMPARISON_MAP.isgreaterthan,
        islessthanorequalto: COMPARISON_MAP.islessthanorequalto,
        islessthan: COMPARISON_MAP.islessthan,
        between: COMPARISON_MAP.between,
        hasnovalue: COMPARISON_MAP.hasnovalue,
        hasvalue: COMPARISON_MAP.hasvalue,
    },
    stringMain: {
        isequalto: COMPARISON_MAP.isequalto,
        isnotequalto: COMPARISON_MAP.isnotequalto,
        in: COMPARISON_MAP.in,
        'not in': COMPARISON_MAP['not in'], 
    },
};

export const allComparisonTypes = COMPARISON_REVERSE_MAP;


export const MULTIPLE_DROPDOWN_TYPES = [
    {
        name: 'lesser than',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.arrow_left_medium} icon-md`}></i>
                <span className="rsaiw-label">Lesser than</span>
            </span>
        ),
    },
    {
        name: 'between',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.in_between_medium} icon-md`}></i>
                <span className="rsaiw-label">In between</span>
            </span>
        ),
    },
    {
        name: 'greater than',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.arrow_right_medium} icon-md`}></i>
                <span className="rsaiw-label">Greater than</span>
            </span>
        ),
    },
    {
        name: 'equal to',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.equal_to_medium} icon-md`}></i>
                <span className="rsaiw-label">Equal to</span>
            </span>
        ),
    },
    {
        name: 'not equal to',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.not_equal_to_medium} icon-md`}></i>
                <span className="rsaiw-label">Not equal to</span>
            </span>
        ),
    },
    {
        name: 'attribute equal to',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.equal_to_attribute_medium} icon-md`}></i>
                <span className="rsaiw-label">Attribute equal to</span>
            </span>
        ),
    },
    {
        name: 'attribute not equal to',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.not_equal_to_attribute_medium} icon-md`}></i>
                <span className="rsaiw-label">Attribute not equal to</span>
            </span>
        ),
    },
    {
        name: 'attribute lesser than',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.lesser_than_attribute_medium} icon-md`}></i>
                <span className="rsaiw-label">Attribute lesser than</span>
            </span>
        ),
    },
    {
        name: 'attribute greater than',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${G.greater_than_attribute_medium} icon-md`}></i>
                <span className="rsaiw-label">Attribute greater than</span>
            </span>
        ),
    },
];


export const MULTIPLE_DROPDOWN_PLUSMINUS = [
    {
        name: 'add',
        icon: (
            <span className="rs-attribute-icons-wrapper lh0">
                <i className={`${G.plus_medium} icon-md`}></i>
            </span>
        ),
        value: 'add',
    },
    {
        name: 'minus',
        icon: (
            <span className="rs-attribute-icons-wrapper lh0">
                <i className={`${G.minus_medium} icon-md `}></i>
            </span>
        ),
        value: 'minus',
    },
];
export const locationRuleType = [
    {
        fieldType: '4D',
        id: 496,
        placeholder: '-- Select --',
        value: 'Beacon',
    },
    {
        fieldType: '3D',
        id: 422,
        placeholder: '-- Select --',
        value: 'City/Area',
    },
    {
        fieldType: '3D',
        id: 387,
        placeholder: '-- Select --',
        value: 'Latitude & Longitude - Radius',
    },
    {
        fieldType: 'T',
        id: 375,
        placeholder: '-- Select --',
        value: 'Location URL',
    },
];

export const CUSTOM_VALUE = [
    {
        id: 1,
        name: 'Filter',
        fieldType: 'D',
        value: [
            {
                id: 1,
                name: 'Filter Query',
                fieldType: 'T',
                value: '',
            },
            {
                id: 2,
                name: 'Sort Query',
                fieldType: 'D',
                value: [
                    { id: 1, name: 'Popularity' },
                    { id: 2, name: 'High' },
                    { id: 3, name: 'Low' },
                ],
            },
            {
                id: 3,
                name: 'Screen name',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 2,
        name: 'Rating',
        fieldType: 'D',
        value: [
            {
                id: 4,
                name: 'Skul id',
                fieldType: 'T',
                value: null,
            },
            {
                id: 5,
                name: 'Title',
                fieldType: 'T',
                value: null,
            },
            {
                id: 6,
                name: 'Rating',
                fieldType: 'D',
                value: [
                    { id: 1, name: '5' },
                    { id: 2, name: '4' },
                    { id: 3, name: '3' },
                    { id: 4, name: '2' },
                    { id: 5, name: '1' },
                ],
            },
            {
                id: 7,
                name: 'Description',
                fieldType: 'T',
                value: null,
            },
            {
                id: 8,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 3,
        name: 'Purchase order details',
        fieldType: 'AN',
        value: [
            {
                id: 9,
                name: 'Skul id',
                fieldType: 'T',
                value: null,
            },
            {
                id: 10,
                name: 'Order id',
                fieldType: 'T',
                value: null,
            },
            {
                id: 11,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 4,
        name: 'Login',
        fieldType: 'T',
        value: [
            {
                id: 12,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 5,
        name: 'Payment success',
        fieldType: 'NR',
        value: [
            {
                id: 8,
                name: 'Amount',
                fieldType: 'NR',
                value: null,
            },
            {
                id: 10,
                name: 'Order id',
                fieldType: 'T',
                value: null,
            },
            {
                id: 15,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 6,
        name: 'Offer Page Click',
        fieldType: 'TR',
        value: [
            {
                id: 16,
                name: 'Timestamp',
                fieldType: 'TR',
                value: null,
            },
            {
                id: 17,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 7,
        name: 'Feedback click',
        fieldType: 'T',
        value: [
            {
                id: 18,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 8,
        name: 'View mode',
        fieldType: 'T',
        value: [
            {
                id: 19,
                name: 'View type',
                fieldType: 'T',
                value: null,
            },
            {
                id: 20,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 9,
        name: 'Save Address',
        fieldType: 'T',
        value: [
            {
                id: 21,
                name: 'Area',
                fieldType: 'T',
                value: null,
            },
            {
                id: 22,
                name: 'Pincode',
                fieldType: 'T',
                value: null,
            },
            {
                id: 23,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 10,
        name: 'Registration',
        fieldType: 'T',
        value: [
            {
                id: 24,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
            {
                id: 25,
                name: 'Content type',
                fieldType: 'D',
                value: [
                    { id: 1, name: 'Expert' },
                    { id: 2, name: 'Beginner' },
                ],
            },
        ],
    },
    {
        id: 11,
        name: 'Select Promo',
        fieldType: 'D',
        value: [
            {
                id: 26,
                name: 'Coupon code',
                fieldType: 'T',
                value: null,
            },
            {
                id: 27,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 12,
        name: 'Share',
        fieldType: 'D',
        value: [
            {
                id: 28,
                name: 'Content',
                fieldType: 'T',
                value: null,
            },
            {
                id: 29,
                name: 'Content type',
                fieldType: 'D',
                value: [
                    { id: 1, name: 'Expert' },
                    { id: 2, name: 'Beginner' },
                ],
            },
            {
                id: 30,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
    {
        id: 13,
        name: 'Promo click',
        fieldType: 'T',
        value: [
            {
                id: 31,
                name: 'appVersionCode',
                fieldType: 'T',
                value: null,
            },
        ],
    },
];
