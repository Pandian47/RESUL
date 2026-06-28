import { arrow_left_medium, arrow_right_medium, equal_to_attribute_medium, equal_to_medium, greater_than_attribute_medium, in_between_medium, lesser_than_attribute_medium, not_equal_to_attribute_medium, not_equal_to_medium } from 'Constants/GlobalConstant/Glyphicons';
import { GREATER_THAN, LESSER_THAN_C } from 'Constants/GlobalConstant/Placeholders';
export const ATTRIBUTE_TYPES = [
    'Contains',
    'Not Contains',
    'is Equal to',
    'Is not equal to',
    'Starts with',
    'Ends with',
];

export const filterValue = {
    // String: {
    //     // 1
    //     isequalto: 'Is equal to',
    //     isnotequalto: 'Is not equal to',
    //     in: 'Contains',
    //     'not in': 'Not contains',
    //     Like: 'Like',
    //     Doesnotlike: 'Does not like',
    //     Startswith: 'Starts with',
    //     Endswith: 'Ends with',
    //     hasnovalue: 'Has no value',
    //     hasvalue: 'Has value',
    // },
    String: {
        in: 'Contains',
        'not in': 'Not contains',
    },
    DateTime: {
        // 8
        isequalto: 'Is equal to',
        isnotequalto: 'Is not equal to',
        isafterorequalto: 'Is after or equal to',
        isafter: 'Is after',
        isbeforeorequalto: 'Is before or equal to',
        isbefore: 'Is before',
        between: 'Between',
        // notbetween: 'Not between',
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
    },
    Integer: {
        // 4 & 3
        isequalto: 'Is equal to',
        isnotequalto: 'Is not equal to',
        isgreaterthanorequalto: 'Is greater than or equal to',
        isgreaterthan: 'Is greater than',
        islessthanorequalto: 'Is less than or equal to',
        islessthan: 'Is less than',
        between: 'Between',
        hasnovalue: 'Has no value',
        hasvalue: 'Has value',
    },
};

export const DATE_ATTRIBUTE_TYPES = ['Before', 'Between', 'After'];

// export const MULTIPLE_DROPDOWN_TYPES = [
//     {
//         name: 'Is less than',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${arrow_left_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Lesser than</span>
//             </span>
//         ),
//     },
//     {
//         name: 'between',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${in_between_medium} icon-md`}></i>
//                 <span className="rsaiw-label">In between</span>
//             </span>
//         ),
//     },
//     {
//         name: 'Is greater than',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${arrow_right_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Greater than</span>
//             </span>
//         ),
//     },
//     {
//         name: 'Is equal to',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${equal_to_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Equal to</span>
//             </span>
//         ),
//     },
//     {
//         name: 'Is not equal to',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${not_equal_to_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Not equal to</span>
//             </span>
//         ),
//     },
//     {
//         name: 'attribute equal to',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${equal_to_attribute_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Attribute equal to</span>
//             </span>
//         ),
//     },
//     {
//         name: 'attribute not equal to',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${not_equal_to_attribute_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Attribute not equal to</span>
//             </span>
//         ),
//     },
//     {
//         name: 'attribute lesser than',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${lesser_than_attribute_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Attribute lesser than</span>
//             </span>
//         ),
//     },
//     {
//         name: 'attribute greater than',
//         icon: (
//             <span className="rs-attribute-icons-wrapper">
//                 <i className={`${greater_than_attribute_medium} icon-md`}></i>
//                 <span className="rsaiw-label">Attribute greater than</span>
//             </span>
//         ),
//     },
// ];

export const MULTIPLE_DROPDOWN_TYPES = [
    {
        name: 'before',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${arrow_left_medium} icon-md`}></i>
                <span className="rsaiw-label">Before</span>
            </span>
        ),
        value: '<',
    },
    {
        name: 'between',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${in_between_medium} icon-md`}></i>
                <span className="rsaiw-label">Between</span>
            </span>
        ),
        value: '[]',
    },
    {
        name: 'after',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${arrow_right_medium} icon-md`}></i>
                <span className="rsaiw-label">After</span>
            </span>
        ),
        value: '>',
    },
];

export const NUMERIC_FILTER_TYPE = [
    {
        name: 'before',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${arrow_left_medium} icon-md`}></i>
                <span className="rsaiw-label">{LESSER_THAN_C}</span>
            </span>
        ),
        value: '<',
    },
    {
        name: 'between',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${in_between_medium} icon-md`}></i>
                <span className="rsaiw-label">Between</span>
            </span>
        ),
        value: '[]',
    },
    {
        name: 'after',
        icon: (
            <span className="rs-attribute-icons-wrapper">
                <i className={`${arrow_right_medium} icon-md`}></i>
                <span className="rsaiw-label">{GREATER_THAN}</span>
            </span>
        ),
        value: '>',
    },
];
