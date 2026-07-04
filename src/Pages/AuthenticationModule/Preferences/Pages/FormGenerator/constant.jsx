import { cloneElement } from 'react';
import { iconImage, iconTextField, iconUpload, placeholderImage } from 'Assets/Images';
import { getBrandName } from 'Utils/modules/brandStorage';
import { AGREE_TERMSCONDITIONS } from 'Constants/GlobalConstant/Placeholders';
import { bookmark_medium, builder_add_participants_large, builder_checkbox_large, builder_combobox_large, builder_comment_box_large, builder_date_time_large, builder_hidden_filed_large, builder_matrix_rating_scale_large, builder_multiple_choice_large, builder_radio_large, builder_ranking_large, builder_rating_large, builder_slider_large, builder_text_large, builder_textfield_large, circle_question_mark_mini, colorpicker_bg_medium, eye_hide_medium, heart_fill_large, like_1_fill_large, mandatory_mini, pencil_edit_mini, refresh_medium, settings_medium, smiliey_1_large, social_facebook_ads_medium, social_linkedin_ads_medium, social_twitter_ads_medium, star_fill_large, subscription_kyc_xlarge, survey_xlarge, user_tell_a_friend_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { v4 as uuid } from 'uuid';
import { uniqueId } from 'Utils/modules/lodashReplacements';



import TellAFriend from './Tabs/TellFriend/TellAFriend';
import Text from './Tabs/InputTabs/Text';
import TextBox from './Tabs/InputTabs/TextBox';
import ComboBox from './Tabs/InputTabs/ComboBox';
import RadioButton from './Tabs/InputTabs/RadioButton';
import CheckBox from './Tabs/InputTabs/CheckBox';
import DateAndTime from './Tabs/InputTabs/DateAndTime';
import Participants from './Tabs/InputTabs/Participants';
import CancelSubmit from './Tabs/InputTabs/FormButtons';
import PhoneInput from './Tabs/InputTabs/PhoneInput';
import faceBookIcon from 'Assets/Images/logos/logo-facebook-login.jpg';
import gmailIcon from 'Assets/Images/logos/logo-gmail.jpg';
import hotMailIcon from 'Assets/Images/logos/logo-hotmail.jpg';
import YahooMailIcon from 'Assets/Images/logos/logo-yahoomail.jpg';
import CommentBox from './Tabs/InputTabs/CommentBox';
import Ranking from './Tabs/InputTabs/Ranking';
import MultiChoice from './Tabs/InputTabs/MultiChoice';
import ConsentCheckbox from './Tabs/InputTabs/ConsentCheckbox';
import HiddenFields from './Tabs/InputTabs/HiddenFields';
import Rating from './Tabs/InputTabs/Rating';
import Slider from './Tabs/InputTabs/Slider';
import Matrix from './Tabs/InputTabs/Matrix';
import Subscription from './Tabs/SubscriptionKYC/Subscription';
import Survey from './Tabs/Survey/Survey';
export const SOCIAL_MEDIA = [
    {
        id: 1,
        name: 'facebookCheckBox',
        icon: `${social_facebook_ads_medium} icon-md`,
        bgColor: '#3a5897',
        content: 'Connected with facebook',
    },
    {
        id: 2,
        name: 'twitterCheckBox',
        icon: `${social_twitter_ads_medium} icon-md`,
        bgColor: '#5dc8ff',
        content: 'Connected with twitter',
    },
    {
        id: 3,
        name: 'linkedinCheckBox',
        icon: `${social_linkedin_ads_medium} icon-md`,
        bgColor: '#2967ad',
        content: 'Connected with linkedin',
    },
    // {
    //     id: 4,
    //     name: 'brandCheckBox',
    //     icon: '',
    //     bgColor: '',
    //     content: 'Brand Id',
    // },
];

export const TELL_AFRIEND_SMEDIA = [
    {
        id: 1,
        name: 'facebookCheckBox',
        icon: faceBookIcon,
        bgColor: '',
        content: '',
        tellFriend: true,
    },
    {
        id: 2,
        name: 'gmailCheckbox',
        icon: gmailIcon,
        bgColor: '',
        content: '',
        tellFriend: true,
    },
    {
        id: 3,
        name: 'hotMailCheckbox',
        icon: hotMailIcon,
        bgColor: '',
        content: '',
        tellFriend: true,
    },
    {
        id: 4,
        name: 'yahooMail',
        icon: YahooMailIcon,
        bgColor: '',
        content: '',
        tellFriend: true,
    },
];

export const ADD_FORM_TYPES = (setCurrentTab, isRunEnv) => [
    {
        id: 'subscription',
        text: 'Subscription/KYC',
        icon: `${subscription_kyc_xlarge} icon-xl color-primary-blue`,
        component: () => <Subscription setCurrentTab={setCurrentTab} />,
    },
    {
        id: 'tellFriend',
        text: 'Tell-a-Friend',
        icon: `${user_tell_a_friend_xlarge} icon-xl color-primary-blue`,
        component: () => <TellAFriend setCurrentTab={setCurrentTab} />,
    },
    {
        id: 'survey',
        text: 'Survey',
        icon: `${survey_xlarge} icon-xl color-primary-blue`,
        component: () => <Survey setCurrentTab={setCurrentTab} />,
    },
];

export const SUBCRIPTION_KYC = {
    defaultLayout: false,
};

export const INITIAL_WATCH_STATE = ['colorPicker', 'defaultTypes'];

export const DEFAULT_VALUE =
    '<p><span style="font-size: 21px;">{Your form heading goes here}</span></p><p>Lorem ipsum dolor sit amet, adipiscing elit, sed diam nonummy nibh euismod tincidunt.</p>';
export const TEXT_INPUT =
    'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.';

export const SETTINGS_ICON = `${settings_medium} icon-md`;
export const SETTINGS_ICON_MD = `${settings_medium} icon-md`;
export const COLOR_PICKER = `${colorpicker_bg_medium} icon-md`;
export const QUESTION_MARK = `${circle_question_mark_mini} icon-md`;
export const EDIT_ICON = `${pencil_edit_mini} icon-md`;
export const REFRESH_ICON = `${refresh_medium} icon-md`;
export const ASTERISK_ICON = `${mandatory_mini} icon-mini position-relative top-3`;
export const EYE_HIDDEND_ICON = `${eye_hide_medium} icon-md position-relative`;
export const ASTERISK_ICON_DEFAULT = `${mandatory_mini} icon-mini position-relative`;


export const Star = `${star_fill_large} icon-lg position-relative top-3`;
export const Smiley = `${smiliey_1_large} icon-lg position-relative top-3`;
export const Thumb = `${like_1_fill_large} icon-lg position-relative top-3`;
export const Heart = `${heart_fill_large} icon-lg position-relative top-3`;

// export const RATING_LIST = {
//     2: ['Terrible', 'Great'],
//     3: ['Terrible', 'Ok', 'Great'],
//     4: ['Bad', 'Ok', 'Good', 'Great'],
//     5: ['Terrible', 'Bad', 'Ok', 'Good', 'Great']
// };

export const RATING_LIST = {
    2: {
        Star: [
            {
                icon: Star,
                tooltip: 'Terrible',
            },
            {
                icon: Star,
                tooltip: 'Great',
            },
        ],
        Heart: [
            {
                icon: Heart,
                tooltip: 'Terrible',
            },
            {
                icon: Heart,
                tooltip: 'Great',
            },
        ],
        Thumb: [
            {
                icon: 'icon-rs-like-1-fill-large',
                tooltip: 'Terrible',
            },
            {
                icon: 'icon-rs-like-5-fill-large',
                tooltip: 'Great',
            },
        ],
        Smiley: [
            {
                icon: 'icon-rs-smiliey-1-large',
                tooltip: 'Terrible',
            },
            {
                icon: 'icon-rs-smiliey-5-large',
                tooltip: 'Great',
            },
        ],
    },
    3: {
        Star: [
            {
                icon: Star,
                tooltip: 'Terrible',
            },
            {
                icon: Star,
                tooltip: 'Ok',
            },
            {
                icon: Star,
                tooltip: 'Great',
            },
        ],
        Heart: [
            {
                icon: Heart,
                tooltip: 'Terrible',
            },
            {
                icon: Heart,
                tooltip: 'Ok',
            },
            {
                icon: Heart,
                tooltip: 'Great',
            },
        ],
        Thumb: [
            {
                icon: 'icon-rs-like-1-fill-large',
                tooltip: 'Terrible',
            },
            {
                icon: 'icon-rs-like-3-fill-large',
                tooltip: 'Ok',
            },
            {
                icon: 'icon-rs-like-5-fill-large',
                tooltip: 'Great',
            },
        ],
        Smiley: [
            {
                icon: 'icon-rs-smiliey-1-large',
                tooltip: 'Terrible',
            },
            {
                icon: 'icon-rs-smiliey-3-large',
                tooltip: 'Ok',
            },
            {
                icon: 'icon-rs-smiliey-5-large',
                tooltip: 'Great',
            },
        ],
    },
    4: {
        Star: [
            {
                icon: Star,
                tooltip: 'Bad',
            },
            {
                icon: Star,
                tooltip: 'Ok',
            },
            {
                icon: Star,
                tooltip: 'Good',
            },
            {
                icon: Star,
                tooltip: 'Great',
            },
        ],
        Heart: [
            {
                icon: Heart,
                tooltip: 'Bad',
            },
            {
                icon: Heart,
                tooltip: 'Ok',
            },
            {
                icon: Heart,
                tooltip: 'Good',
            },
            {
                icon: Heart,
                tooltip: 'Great',
            },
        ],
        Thumb: [
            {
                icon: 'icon-rs-like-2-fill-large',
                tooltip: 'Bad',
            },
            {
                icon: 'icon-rs-like-3-fill-large',
                tooltip: 'Ok',
            },
            {
                icon: 'icon-rs-like-4-fill-large',
                tooltip: 'Good',
            },
            {
                icon: 'icon-rs-like-5-fill-large',
                tooltip: 'Great',
            },
        ],
        Smiley: [
            {
                icon: 'icon-rs-smiliey-2-large',
                tooltip: 'Bad',
            },
            {
                icon: 'icon-rs-smiliey-3-large',
                tooltip: 'Ok',
            },
            {
                icon: 'icon-rs-smiliey-4-large',
                tooltip: 'Good',
            },
            {
                icon: 'icon-rs-smiliey-5-large',
                tooltip: 'Great',
            },
        ],
    },
    5: {
        Star: [
            {
                icon: Star,
                tooltip: 'Terrible',
            },
            {
                icon: Star,
                tooltip: 'Bad',
            },
            {
                icon: Star,
                tooltip: 'Ok',
            },
            {
                icon: Star,
                tooltip: 'Good',
            },
            {
                icon: Star,
                tooltip: 'Great',
            },
        ],
        Heart: [
            {
                icon: Heart,
                tooltip: 'Terrible',
            },
            {
                icon: Heart,
                tooltip: 'Bad',
            },
            {
                icon: Heart,
                tooltip: 'Ok',
            },
            {
                icon: Heart,
                tooltip: 'Good',
            },
            {
                icon: Heart,
                tooltip: 'Great',
            },
        ],
        Thumb: [
            {
                icon: 'icon-rs-like-1-fill-large',
                tooltip: 'Terrible',
            },
            {
                icon: 'icon-rs-like-2-fill-large',
                tooltip: 'Bad',
            },
            {
                icon: 'icon-rs-like-3-fill-large',
                tooltip: 'Ok',
            },
            {
                icon: 'icon-rs-like-4-fill-large',
                tooltip: 'Good',
            },
            {
                icon: 'icon-rs-like-5-fill-large',
                tooltip: 'Great',
            },
        ],
        Smiley: [
            {
                icon: 'icon-rs-smiliey-1-large',
                tooltip: 'Terrible',
            },
            {
                icon: 'icon-rs-smiliey-2-large',
                tooltip: 'Bad',
            },
            {
                icon: 'icon-rs-smiliey-3-large',
                tooltip: 'Ok',
            },
            {
                icon: 'icon-rs-smiliey-4-large',
                tooltip: 'Good',
            },
            {
                icon: 'icon-rs-smiliey-5-large',
                tooltip: 'Great',
            },
        ],
    },
};

export const MATRIX_COL = [
    {
        id: uuid(),
        title: 'Column value',
    },
    {
        id: uuid(),
        title: 'Column value',
    },
    {
        id: uuid(),
        title: 'Column value',
    },
    {
        id: uuid(),
        title: 'Column value',
    },
];

export const MATRIX_ROW = [
    {
        id: uuid(),
        title: 'Row value',
        checkBox: [{ id: uuid() }, { id: uuid() }, { id: uuid() }, { id: uuid() }],
    },
    {
        id: uuid(),
        title: 'Row value',
        checkBox: [{ id: uuid() }, { id: uuid() }, { id: uuid() }, { id: uuid() }],
    },
    {
        id: uuid(),
        title: 'Row value',
        checkBox: [{ id: uuid() }, { id: uuid() }, { id: uuid() }, { id: uuid() }],
    },
    {
        id: uuid(),
        title: 'Row value',
        checkBox: [{ id: uuid() }, { id: uuid() }, { id: uuid() }, { id: uuid() }],
    },
    {
        id: uuid(),
        title: 'Row value',
        checkBox: [{ id: uuid() }, { id: uuid() }, { id: uuid() }, { id: uuid() }],
    },
];

export const MULTI_CHOICE_VAL = [{ id: 1, checkBox: '', answer: '', radio: '', checked: false }];
export const RANKING_VAL = [{ rank: '', answer: '' }];

export const SHAPE = ['Star', 'Smiley', 'Thumb', 'Heart'];
export const SLIDER_SHAPE = ['Round', 'Square'];
export const SCALE = ['2', '3', '4', '5'];
export const PARTICIPANT_COUNT = ['1', '2', '3', '4', '5'];

export const DESIGNATION = [
    'Research analyst',
    'Associate vice principal',
    'Director - risk advisory',
    'Senior asosiate',
];
export const MAP_TO = [];

export const COMBO_DROPDOWN = ['Drop down item 1', 'Drop down item 2', 'Drop down item 3'];

export const SALUTATION = ['Mr', 'Mrs'];

export const COUNTRY_LIST = ['Option 1', 'Option 2', 'Option 3',];

export const OPTIONS_LIST = ['Option 1', 'Option 2', 'Option 3'];

export const INPUT_TYPES = [
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'TextBlock',
        columnType: 'TextBlock',
        labelName: DEFAULT_VALUE,
        tinyMceLableMain: DEFAULT_VALUE,
        placeHolder: '',
        mapToValue: '',
        mandatory: false,
        name: 'defalutText',
        text: 'Text',
        icon: `${builder_text_large}`,
        type: 'new',
        mainObject: false,
        isCustomWidthAdjust: true,
        component: (props) => <Text {...props} />,
    },
    // {
    //     id: '',
    //     mapTo: MAP_TO,
    //     componentName: 'CustomHeader',
    //     columnType: 'CustomHeader',
    //     labelName: 'Header title',
    //     placeHolder: 'Enter header title',
    //     mandatory: false,
    //     name: 'CustomHeader',
    //     text: 'Custom header',
    //     type: 'new',
    //     icon: `${builder_text_large}`,
    //     settings: {
    //         bgColor: '#ffffff',
    //         useGradient: false,
    //         gradientStart: '#ffffff',
    //         gradientEnd: '#ffffff',
    //         bgImageUrl: '',
    //         headerImageUrl: '',
    //         headerImageAlign: 'left',
    //         titleColor: '#000000',
    //         titleBgColor: '#ffffff'
    //     },
    //     mainObject: false,
    //     component: (props) => <CustomHeader {...props} />,
    // },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Text label',
        tinyMceLable: 'Text label',
        placeHolder: 'Field name',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'new',
        icon: `${builder_textfield_large}`,
        settings: {
            placeholder: 'Field name',
            maxLength: '50',
            validationType: '',
            customErrorMessage: '',
            requiredOTP: false,
        },
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'ComboBox',
        columnType: 'Combobox',
        labelName: 'Combo box',
        tinyMceLable: 'Combo box',
        placeHolder: 'Select',
        mandatory: false,
        optionData: COMBO_DROPDOWN,
        name: 'defalutDropdown',
        type: 'new',
        text: 'Combo box',
        mainObject: false,

        icon: `${builder_combobox_large}`,
        component: (props) => <ComboBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'RadioButton',
        columnType: 'Radio',
        labelName: 'Radio group',
        tinyMceLable: 'Radio group',
        placeHolder: 'Field name',
        mandatory: false,
        optionData: OPTIONS_LIST,
        name: 'RadioButton',
        text: 'Radio button',
        type: 'new',
        icon: `${builder_radio_large}`,

        component: (props) => <RadioButton {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'CheckBox',
        columnType: 'checkbox',
        labelName: 'Checkbox group',
        tinyMceLable: 'Checkbox group',
        placeHolder: 'Field name',
        mandatory: false,
        optionData: OPTIONS_LIST,
        name: 'CheckBox',
        text: 'Check box',
        type: 'new',
        icon: `${builder_checkbox_large}`,

        component: (props) => <CheckBox {...props} />,
    },
    // {
    //     id:'',
    //  mapTo:MAP_TO,
    //     componentName: 'Upload',
    //     labelName: 'Text label',
    //     placeHolder: 'Upload file',
    //     mandatory: false,
    //
    //     optionData: [],
    //     name: 'Upload',
    //     text: 'Upload',
    //     type: 'new',
    //     icon: `${iconUpload}`,
    //     component: function (index, labelName, placeHolder, mandatory, preview, data) {
    //         return <Upload
    //             labelName={labelName}
    //             index={index}
    //             placeHolder={placeHolder}
    //             mandatory={mandatory}
    //             preview={preview}
    //             data={data} />
    //     },
    // },
    // {
    //     id: '',
    //     mapTo: MAP_TO,
    //     componentName: 'Image',
    //     columnType: 'Image',
    //     labelName: `<td><img src={${placeholderImage}}/></td>`,
    //     placeHolder: '',
    //     mandatory: false,
    //     name: 'Image',
    //     text: 'Image',
    //     type: 'new',
    //     icon: `${iconImage}`,
    //     component: (props) => <Image {...props} />,
    // },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'DateAndTime',
        columnType: 'TimeDate',
        labelName: 'Date/Time',
        tinyMceLable: 'Date/Time',
        placeHolder: 'Select the date',
        mandatory: false,
        name: 'DateTime',
        text: 'Date/Time',
        type: 'new',
        settings: {
            placeholder: 'Select the date',
            customErrorMessage: '',
        },
        icon: `${builder_date_time_large}`,

        component: (props) => <DateAndTime {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Participants',
        columnType: 'Participants',
        labelName: 'Participants label',
        tinyMceLable: 'Participants label',
        placeHolder: 'Field name',
        mandatory: false,
        optionData: [],
        participant: [false, true, true, false],
        name: 'Participants',
        text: 'Add participants',
        type: 'new',
        icon: `${builder_add_participants_large}`,
        disable: false,

        component: (props) => <Participants {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'HiddenField',
        columnType: 'Hidden',
        labelName: 'Hidden field label',
        tinyMceLable: 'Hidden field label',
        placeHolder: 'Enter your name',
        mandatory: false,
        name: 'HiddenField',
        text: 'Hidden field',
        type: 'new',
        settings: {
            placeholder: 'Enter your name',
        },
        icon: `${builder_hidden_filed_large}`,
        mainObject: false,

        component: (props) => <HiddenFields {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'ConsentCheckbox',
        columnType: 'Consent Checkbox', //ConsentCheckbox',
        labelName: 'Subscribe to our newsletter',
        tinyMceLableMain: 'Subscribe to our newsletter',
        placeHolder: 'Field name',
        mandatory: false,
        optionData: [],
        name: 'ConsentCheckbox',
        text: 'Consent checkbox',
        type: 'new',
        icon: `${builder_checkbox_large}`,

        component: (props) => <ConsentCheckbox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Mobile',
        tinyMceLable: 'Mobile',
        placeHolder: 'Phone number',
        mandatory: false,
        name: 'defalutMobile',
        text: 'Mobile number',
        type: 'new',
        icon: `${builder_textfield_large}`,
        mainObject: false,

        isMobileNumber: true,
        settings: {
            placeholder: 'Phone number',
            requiredOTP: false,
        },

        component: (props) => <PhoneInput {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'MultiChoice',
        columnType: 'multichoice',
        labelName: 'Enter your multi choice question',
        tinyMceLableMain: 'Enter your multi choice question',
        placeHolder: 'Enter your multi choice comments',
        mandatory: false,
        name: 'MultiChoice',
        text: 'Multi choice',
        type: 'new',
        mainObject: false,
        icon: `${builder_multiple_choice_large}`,

        component: (props) => <MultiChoice {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'CommentBox',
        columnType: 'CommentRating',
        labelName: 'Enter your comments question',
        tinyMceLableMain: 'Enter your comments question',
        placeHolder: 'Enter your comments',
        mandatory: false,
        name: 'CommentBox',
        text: 'Comment box',
        type: 'new',
        icon: `${builder_comment_box_large}`,
        mainObject: false,

        settings: {
            commentBoxPlaceholder: 'Enter your comments'
        },
        component: (props) => <CommentBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Ranking',
        columnType: 'Rankrating',
        labelName: 'Enter your ranking question',
        tinyMceLableMain: 'Enter your ranking question',
        placeHolder: 'Enter your ranking comments',
        mandatory: false,
        name: 'Ranking',
        text: 'Ranking',
        type: 'new',
        icon: `${builder_ranking_large}`,
        mainObject: false,

        component: (props) => <Ranking {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Rating',
        columnType: 'starrating',
        labelName: 'Enter your rating question',
        tinyMceLableMain: 'Enter your rating question',
        placeHolder: 'Enter your rating comments',
        mandatory: false,
        name: 'Rating',
        text: 'Rating',
        type: 'new',
        icon: `${builder_rating_large}`,
        mainObject: false,

        component: (props) => <Rating {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Slider',
        columnType: 'RangeSlider',
        labelName: 'Enter your slider question',
        tinyMceLableMain: 'Enter your slider question',
        placeHolder: 'Enter your slider comments',
        badLabelName: 'Bad',
        goodLabelName: 'Good',
        verygoodLabelName: 'Very Good',
        mandatory: false,
        name: 'Slider',
        text: 'Slider',
        type: 'new',
        icon: `${builder_slider_large}`,
        mainObject: false,

        component: (props) => <Slider {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Matrix',
        columnType: 'Matrix',
        labelName: 'Enter your matrix rating scale question',
        tinyMceLableMain: 'Enter your matrix rating scale question',
        placeHolder: 'Enter your matrix rating scale question',
        mandatory: false,
        name: 'Matrix',
        text: 'Matrix / Rating scale',
        type: 'new',
        icon: `${builder_matrix_rating_scale_large}`,
        preview: false,
        rowDefaultValue: 'Row value',
        colDefaultValue: 'Column value',
        matrix: {
            rows: [],
            columns: [],
        },
        mainObject: false,

        component: (props) => <Matrix {...props} />,
    },
];

// Function to get mandatory settings based on brand name
const getMandatorySettings = (departmentId) => {
    // Handle case where departmentId is undefined or null
    if (!departmentId) {
        return { emailMandatory: true, mobileMandatory: false };
    }

    const brandName = getBrandName(departmentId);

    if (brandName === "EmailID") {
        return { emailMandatory: true, mobileMandatory: false };
    } else if (brandName === "MobileNo") {
        return { emailMandatory: false, mobileMandatory: true };
    } else {
        // Default case: set email as mandatory
        return { emailMandatory: true, mobileMandatory: false };
    }
};

// Function to get DEFAULT_INPUT_FIELDS with dynamic mandatory settings
export const getDefaultInputFields = (departmentId) => {
    const { emailMandatory, mobileMandatory } = getMandatorySettings(departmentId);

    return [
        // {
        //     id: '',
        //     mapTo: MAP_TO,
        //     componentName: 'TextBox',
        //     columnType: 'TextBox',
        //     labelName: 'Text label',
        //     placeHolder: 'Field name',
        //     mandatory: false,
        //     name: 'defalutTextBox',
        //     text: 'Text box',
        //     type: 'new',
        //     icon: `${iconTextField}`,
        //     mainObject: false,
        //     component: (props) => <TextBox {...props} />,
        // },
        {
            fieldId: '',
            mapTo: MAP_TO,
            componentName: 'Textbox',
            columnType: 'Textbox',
            labelName: 'Name',
            tinyMceLable: 'Name',
            placeHolder: 'Enter your name',
            mandatory: false,
            name: 'defalutTextBox',
            text: 'Text box',
            type: 'default',
            mainObject: false,

            settings: {
                placeholder: 'Enter your name',
                maxLength: '50',
                validationType: '',
                customErrorMessage: '',
            },
            component: (props) => <TextBox {...props} />,
        },
        {
            fieldId: '',
            mapTo: MAP_TO,
            componentName: 'Textbox',
            columnType: 'Textbox',
            labelName: 'Email',
            tinyMceLable: 'Email',
            placeHolder: 'Enter your email',
            mandatory: emailMandatory,
            name: 'defalutTextBox',
            text: 'Text box',
            type: 'default',
            mainObject: false,

            settings: {
                placeholder: 'Enter your email',
                maxLength: '50',
                validationType: '',
                customErrorMessage: '',
            },
            component: (props) => <TextBox {...props} />,
        },
        {
            fieldId: '',
            mapTo: MAP_TO,
            componentName: 'Textbox',
            columnType: 'Textbox',
            labelName: 'Mobile',
            tinyMceLable: 'Mobile',
            placeHolder: 'Phone number',
            mandatory: mobileMandatory,
            name: 'defalutMobile',
            type: 'default',
            text: 'Phone',
            mainObject: false,

            isMobileNumber: true,
            settings: {
                placeholder: 'Phone number',
            },
            component: (props) => <PhoneInput {...props} />,
        },
        {
            fieldId: '',
            mapTo: MAP_TO,
            componentName: 'RadioButton',
            columnType: 'Radio',
            labelName: 'Gender',
            tinyMceLable: 'Gender',
            placeHolder: '',
            mandatory: false,
            optionData: ['Male', 'Female', 'Others'],
            name: 'RadioButton',
            text: 'Radio button',
            type: 'new',
            icon: `${bookmark_medium} icon-md`,

            component: (props) => <RadioButton {...props} />,
        },
        {
            fieldId: '',
            mapTo: MAP_TO,
            componentName: 'ComboBox',
            columnType: 'Combobox',
            labelName: 'City',
            tinyMceLable: 'City',
            placeHolder: 'Select',
            mandatory: false,
            optionData: COUNTRY_LIST,
            name: 'defalutDropdown',
            type: 'default',
            text: 'Combo box',
            mainObject: false,

            settings: {
                tagsLabelName: 'Select',
            },
            component: (props) => <ComboBox {...props} />,
        },
        // {
        //     id: '',
        //     mapTo: MAP_TO,
        //     componentName: 'TextBox',
        //     columnType: 'TextBox',
        //     labelName: 'Company name',
        //     placeHolder: 'Enter company name',
        //     mandatory: false,
        //     name: 'defalutTextBox',
        //     text: 'Text box',
        //     type: 'default',
        //     mainObject: false,
        //     component: (props) => <TextBox {...props} />,
        // },
        // {
        //     id: '',
        //     mapTo: MAP_TO,
        //     componentName: 'ComboBox',
        //     columnType: 'ComboBox',
        //     labelName: 'Country',
        //     placeHolder: 'Select',
        //     mandatory: false,
        //     optionData: COUNTRY_LIST,
        //     name: 'defalutDropdown',
        //     type: 'default',
        //     text: 'Combo box',
        //     mainObject: false,
        //     component: (props) => <ComboBox {...props} />,
        //     },
    ];
};

// Keep the original DEFAULT_INPUT_FIELDS for backward compatibility
export const DEFAULT_INPUT_FIELDS = getDefaultInputFields();

export const getProgressiveProfilingFields = (fields) =>
    (fields || []).filter((field) => !field?.field && field?.columnType !== 'TextBlock');

export const getProgressiveProfilingStats = (fields) => {
    const profilingFields = getProgressiveProfilingFields(fields);
    const totalFields = profilingFields.length;
    const mandatoryFieldCount = profilingFields.filter((field) => field?.mandatory).length;
    const minAllowed = Math.max(mandatoryFieldCount, 1);
    const maxAllowed = totalFields - 1;
    const isAvailable = totalFields >= 2 && maxAllowed >= minAllowed;

    return { profilingFields, totalFields, mandatoryFieldCount, minAllowed, maxAllowed, isAvailable };
};

export const splitFieldsForProgressiveProfiling = (fields, limit) => {
    const mandatoryCount = fields.filter((field) => field?.mandatory).length;
    const availableNonMandatorySlots = limit - mandatoryCount;

    let nonMandatoryVisibleAdded = 0;
    const visibleFields = [];
    const queuedFields = [];

    fields.forEach((field) => {
        if (field?.mandatory) {
            visibleFields.push(field);
        } else if (nonMandatoryVisibleAdded < availableNonMandatorySlots) {
            visibleFields.push(field);
            nonMandatoryVisibleAdded++;
        } else {
            queuedFields.push(field);
        }
    });

    return { visibleFields, queuedFields };
};

export const QUEUED_AND_VISIBLE_FIELDS = [
    {
        field: 'Visible fields',
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Name',
        tinyMceLable: 'Name',
        placeHolder: 'Enter your name',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Mobile',
        tinyMceLable: 'Mobile',
        placeHolder: 'Phone number',
        mandatory: false,
        name: 'defalutMobile',
        type: 'default',
        text: 'Phone',
        mainObject: false,

        isMobileNumber: true,
        settings: {
            placeholder: 'Phone number',
        },
        component: (props) => <PhoneInput {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Email',
        tinyMceLable: 'Email',
        placeHolder: 'Enter your email',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,
        sCustomWidthAdjust: false,
        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'RadioButton',
        columnType: 'Radio',
        labelName: 'Gender',
        tinyMceLable: 'Gender',
        placeHolder: '',
        mandatory: false,
        optionData: OPTIONS_LIST,
        name: 'RadioButton',
        text: 'Radio button',
        type: 'new',
        icon: `${bookmark_medium} icon-md`,

        component: (props) => <RadioButton {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'ComboBox',
        columnType: 'Combobox',
        labelName: 'Country',
        tinyMceLable: 'Country',
        placeHolder: 'Select',
        mandatory: false,
        optionData: COUNTRY_LIST,
        name: 'defalutDropdown',
        type: 'default',
        text: 'Combo box',
        mainObject: false,
        isCustomWidthAdjust: false,
        component: (props) => <ComboBox {...props} />,
    },
    {
        field: 'Queued fields',
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Age',
        tinyMceLable: 'Age',
        placeHolder: 'Enter age',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Income',
        tinyMceLable: 'Income',
        placeHolder: 'Enter income',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Marital status',
        tinyMceLable: 'Marital status',
        placeHolder: 'Enter marital status',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Occupation',
        tinyMceLable: 'Occupation',
        placeHolder: 'Enter Occupation',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Address',
        tinyMceLable: 'Address',
        placeHolder: 'Enter Address',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Identification Number',
        tinyMceLable: 'Identification Number',
        placeHolder: 'Enter Identification Number',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'Textbox',
        columnType: 'Textbox',
        labelName: 'Residential Address',
        tinyMceLable: 'Residential Address',
        placeHolder: 'Enter Residential Status',
        mandatory: false,
        name: 'defalutTextBox',
        text: 'Text box',
        type: 'default',
        mainObject: false,

        component: (props) => <TextBox {...props} />,
    },
    // {
    //     id:'',
    // mapTo: MAP_TO,
    //     componentName: 'Upload',
    //     labelName: 'Upload proof of identity',
    //     placeHolder: 'Upload file',
    //     mandatory: false,
    //
    //     optionData: [],
    //     name: 'Upload',
    //     text: 'Upload',
    //     type: 'default',
    //     icon: `${bookmark_medium} icon-xxl`,
    //     component: function (index, labelName, placeHolder, mandatory, preview, data) {
    //         return <Upload
    //             labelName={labelName}
    //             index={index}
    //             placeHolder={placeHolder}
    //             mandatory={mandatory}
    //             preview={preview}
    //             data={data} />
    //     },
    // },
];

export const DEFAULT_FIELDS = [
    {
        fieldId: '',
        mapTo: MAP_TO,
        componentName: 'CancelSubmit',
        columnType: 'Submit',
        labelName: 'Text label',
        placeHolder: '',
        mandatory: false,
        name: 'defalutConfirmation',
        type: 'default',
        text: 'defalutConfirmation',
        mainObject: false,

        component: (props) => <CancelSubmit {...props} />,
    },
];

export const BODYCONFIG = {
    selector: '.tiny',
    menubar: false,
    inline: true,
    plugins: ['link', 'lists', 'autolink', 'image'],
    toolbar: [
        ' fontfamily fontsize | bold italic underline  | image link',
        'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent',
    ],
    valid_elements:
        'p[style],strong,em,span[style],a[href],ul,ol,li,font[face|size|color|style],span[style],p[style],-ol[type|start],-ul[type],-li',
    valid_styles: {
        '*': 'font-size,font-family,color,text-decoration,text-align',
    },
    extended_valid_elements:
        'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
    powerpaste_word_import: 'clean',
    powerpaste_html_import: 'clean',
    paste_data_images: false,
};

export const FORM_IMAGE_CONFIG = {
    selector: '.tiny',
    menubar: false,
    inline: true,
    plugins: ['image'],
    toolbar: ['image link alignleft aligncenter alignright alignfull', 'forecolor backcolor'],
    // valid_elements:
    //     'img,p[style],strong,em,span[style],a[href],ul,ol,li,font[face|size|color|style],span[style],p[style],-ol[type|start],-ul[type],-li',
    // valid_styles: {
    //     '*': 'font-size,font-family,color,text-decoration,text-align',
    // },
    // extended_valid_elements:
    //     'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
    powerpaste_word_import: 'clean',
    powerpaste_html_import: 'clean',
    paste_data_images: false,
};

export const PARTICIPANT_LIST = [
    {
        name: 'Salutation',
        id: '1',
    },
    {
        name: 'Fullname',
        id: '2',
    },
    {
        name: 'Email',
        id: '3',
    },
    {
        name: 'Mobile',
        id: '4',
    },
];

export const mapToItemRender = (li, itemProps, disabledItems, isRanking) => {
    let props = li.props;
    if (disabledItems?.includes(isRanking ? itemProps.dataItem : itemProps.dataItem?.title)) {
        props = {
            ...props,
            className: 'pe-none click-off',
        };
    }
    const itemChildren = <span>{li.props.children}</span>;

    return cloneElement(li, props, itemChildren);
};

// Tell A Friend
export const COMMENT_LIST = ['Single line', 'Multi line'];
export const RANKING_LIST = ['1', '2', '3', '4', '5'];

export const FORM_INITIAL_STATE = (departmentId) => ({
    fromIndex: null,
    dropAble: getDefaultInputFields(departmentId),
    visibleAndQueued: QUEUED_AND_VISIBLE_FIELDS,
    typeOfValue: '',
    settingsPopup: false,
    formSettingsPopup: false,
    profilingToggle: false,
    isDropped: false,
    dragIndex: null,
    fieldCount: '',
    previewFlag: false,
    previewData: {},
    refreshPopup: false,
    removeIndex: null,
    removeStatus: 'default',
    removePopup: false,
    webHookPopup: false,
    formStylesPopup: false,
    layoutName: 'Horizontal',
    layout: 'form-theme-default',
    formName: '',
    CancelView: '<p>Cancel</p>',
    Submit: '<p>Submit</p>',
    enableCaptcha: '<p>Enable CAPTCHA</p>',
    tinyMceLableAgree: AGREE_TERMSCONDITIONS,
    submitColor: {
        cancelColor: '#ffffff',
        submitColor: '#333333',
    },
});

export const STATE_REDUCER = (state, { type, field, payload }) => {
    switch (type) {
        case 'UPDATE':
            return state[field] === payload ? state : { ...state, [field]: payload };

        case 'UPDATE_PREVIEW':
            return (state.previewData === payload.previewData &&
                state.previewFlag === payload.previewFlag)
                ? state
                : { ...state, ...payload };

        case 'UPDATE_DRAG_START':
        case 'UPDATE_SAVE_END':
        case 'UPDATE_DRAG_OVER':
        case 'UPDATE_REMOVE_FIELD':
        case 'UPDATE_SAVE':
        case 'UPDATE_FORM_SETTINGS':
        case 'UPDATE_SETTINGS':
            return Object.entries(payload).some(([k, v]) => state[k] !== v)
                ? { ...state, ...payload }
                : state;

        default:
            return state;
    }
};

const findElement = (detail) => {
    let result = INPUT_TYPES?.filter((item) => item?.columnType === detail?.columnType)?.[0];
    return result;
};

export const buildFormEdit = (data, dispatchState) => {
    //debugger
    let formName = data?.[0]?.formName;
    let jsonData = JSON.parse(data[0].jsonData);

    if (!Array.isArray(jsonData)) {
        const formGenData = data[0].formGenerationColumn;

        jsonData = formGenData.map(item => {
            const fieldDetails = JSON.parse(item.fieldDetails);

            // Get common fields from fieldDetails
            const placeholderField = fieldDetails.find(f => f.startsWith('Placeholder:'));
            const labelContent = placeholderField ?
                placeholderField.split(':').slice(1).join(':') // Get everything after Placeholder:
                    .replace(/<br[^>]*>/g, '') // Remove br tags
                    .replace(/\s+/g, ' ') // Normalize spaces
                    .trim() : item.columnName;
            const txtPlaceholderField = fieldDetails.find(f => f.startsWith('txtplaceholder:'));
            const txtPlaceholder = txtPlaceholderField ? txtPlaceholderField.split(':')[1] : '';
            const validationField = fieldDetails.find(f => f.startsWith('validation:'));
            const isMandatory = validationField ? validationField.split(':')[1] === 'yes' : false;

            let convertedData = {
                fieldId: uniqueId(),
                componentName: item.columnType,
                columnType: item.columnType,
                labelName: labelContent,
                placeHolder: txtPlaceholder,
                mandatory: isMandatory,
                name: `default${item.columnType}`,
                text: item.columnType,
                type: "default",
                mainObject: false,
                mapToValue: {
                    dataAttributeId: item.dataAttributeId,
                    attributeName: item.uIPrintableName || item.dataAttributeName,
                    fieldTypeId: 1,
                    sOLRFieldName: `${item.dataAttributeName}_s`,
                    isBrandId: 0,
                    attrName: item.dataAttributeName,
                    filterGroupId: "",
                    cattypeName: null,
                    isImportAttributeMap: 1
                }
            };

            // Handle specific column types
            switch (item.columnType) {
                case 'TextBlock':
                    const rawContent = fieldDetails[0];

                    // Clean up basic formatting while preserving original HTML structure
                    let textContent = rawContent
                        .replace(/\\"/g, '"') // Fix escaped quotes
                        // .replace(/<br[^>]*>/g, '') // Remove br tags
                        .replace(/\s+/g, ' ') // Normalize spaces
                        .trim();

                    convertedData.tinyMceLableMain = textContent;
                    convertedData.labelName = textContent;
                    break;
                case 'CustomHeader':
                    convertedData.componentName = 'CustomHeader';
                    convertedData.columnType = 'CustomHeader';
                    if (Array.isArray(fieldDetails)) {
                        const [headerContent, bgColor, useGradient, gradientStart, gradientEnd, bgImageUrl, headerImageUrl, headerImageAlign] = fieldDetails;
                        convertedData.tinyMceLableMain = typeof headerContent === 'string' ? headerContent : '';
                        convertedData.labelName = convertedData.tinyMceLableMain || item.columnName;
                        convertedData.settings = {
                            bgColor: typeof bgColor === 'string' ? bgColor : '#ffffff',
                            useGradient: !!useGradient,
                            gradientStart: typeof gradientStart === 'string' ? gradientStart : '#ffffff',
                            gradientEnd: typeof gradientEnd === 'string' ? gradientEnd : '#ffffff',
                            bgImageUrl: typeof bgImageUrl === 'string' ? bgImageUrl : '',
                            headerImageUrl: typeof headerImageUrl === 'string' ? headerImageUrl : '',
                            headerImageAlign: typeof headerImageAlign === 'string' ? headerImageAlign : 'left'
                        };
                    } else if (fieldDetails && typeof fieldDetails === 'object') {
                        convertedData.tinyMceLableMain = typeof fieldDetails.title === 'string' ? fieldDetails.title : '';
                        convertedData.labelName = convertedData.tinyMceLableMain || item.columnName;
                        convertedData.settings = {
                            bgColor: fieldDetails.backGroundColor || '#ffffff',
                            useGradient: !!fieldDetails.isGradiant,
                            gradientStart: fieldDetails.gradiantStart || '#ffffff',
                            gradientEnd: fieldDetails.gradiantEnd || '#ffffff',
                            headerImageUrl: fieldDetails.headerLogo || '',
                            headerImageAlign: fieldDetails.logoAlignment || 'left',
                            titleColor: fieldDetails.titleColor || '#000000',
                            titleBgColor: fieldDetails.titleBgColor || '#ffffff'
                        };
                    }
                    break;

                case 'Textbox':
                    const maxLengthField = fieldDetails.find(f => f.startsWith('lengthoftxt:'));
                    const maxLength = maxLengthField ? maxLengthField.split(':')[1] : '50';

                    const errorMessageField = fieldDetails.find(f => f.startsWith('validationtext:'));
                    const customErrorMessage = errorMessageField ? errorMessageField.split(':')[1] : '';

                    const validationTypeField = fieldDetails.find(f => f.startsWith('validationtype:'));
                    const validationType = validationTypeField ? validationTypeField.split(':')[1] : '';

                    const validationField = fieldDetails.find(f => f.startsWith('validation:'));
                    const isMandatory = validationField ? validationField.split(':')[1] === 'yes' : false;

                    convertedData.settings = {
                        placeholder: txtPlaceholder,
                        maxLength: maxLength,
                        validationType: validationType,
                        customErrorMessage: customErrorMessage
                    };
                    convertedData.mandatory = isMandatory;
                    convertedData.tinyMceLable = labelContent;
                    convertedData.textBoxPlaceHolder = txtPlaceholder;

                    // Check if this is a mobile number field
                    const isMobileFieldCheck = fieldDetails.find(f => f.startsWith('IsMobileField:'));
                    const isMobileField = isMobileFieldCheck ? isMobileFieldCheck.split(':')[1] === '1' : false;

                    if (item.dataAttributeName === 'MobileNo' ||
                        labelContent?.toLowerCase().includes('mobile') ||
                        labelContent?.toLowerCase().includes('phone') ||
                        isMobileField) {
                        convertedData.isMobileNumber = true;
                        // Set the component name to PhoneInput for mobile fields
                        convertedData.componentName = 'PhoneInput';
                    }
                    break;

                case 'Hidden':
                    convertedData.settings = {
                        placeholder: txtPlaceholder
                    };
                    convertedData.tinyMceLable = labelContent;
                    break;

                case 'TimeDate':
                    convertedData.settings = {
                        placeholder: txtPlaceholder,
                        customErrorMessage: ""
                    };
                    const dtTypeField = fieldDetails?.find(f => f.startsWith('DTInputtype:'));
                    const dtType = dtTypeField ? dtTypeField.split(':')[1] : 'D';
                    convertedData.settings.dtInputType = dtType;
                    convertedData.tinyMceLable = labelContent;
                    break;

                case 'Radio':
                    const radioValues = fieldDetails.find(f => f.startsWith('radval:'));
                    const options = radioValues ? radioValues.split(':')[1].split('^') : [];
                    convertedData.optionData = ["Option 1", "Option 2", "Option 3"];
                    convertedData.radioOptionsData = options;
                    convertedData.tinyMceLable = labelContent;
                    break;

                case 'checkbox':
                    const checkboxValues = fieldDetails.find(f => f.startsWith('checkboxval:'));
                    const checkboxOptions = checkboxValues ? checkboxValues.split(':')[1].split('^') : [];
                    const isConsent = fieldDetails.find(f => f.startsWith('Consent:'))?.split(':')[1] === 'true';
                    const consentTextField = fieldDetails.find(f => f.startsWith('Consenttext:'));
                    const consentText = consentTextField ?
                        consentTextField.split(':').slice(1).join(':') // Get everything after Consenttext:
                            .replace(/<br[^>]*>/g, '') // Remove br tags
                            .replace(/\s+/g, ' ') // Normalize spaces
                            .trim() : '';

                    if (isConsent) {
                        convertedData.columnType = 'Consent Checkbox';
                        convertedData.componentName = 'ConsentCheckbox';
                        convertedData.tinyMceLableMain = consentText;
                    } else {
                        convertedData.optionData = ["Option 1", "Option 2", "Option 3"];
                        convertedData.checkboxOptionData = checkboxOptions;
                        convertedData.tinyMceLable = labelContent;
                    }
                    break;

                case 'Combobox':
                    const comboValues = fieldDetails.find(f => f.startsWith('comboval:'));
                    const comboOptions = comboValues ? comboValues.split(':')[1].split('^') : [];
                    convertedData.optionData = ["Option 1", "Option 2", "Option 3"];
                    convertedData.dropdowns = ["Select", ...comboOptions];
                    convertedData.placeHolder = txtPlaceholder || "Select";
                    convertedData.settings = {
                        tagsLabelName: "Select"
                    };
                    convertedData.tinyMceLable = item.columnName;
                    break;

                case 'multichoice':
                    // Get the question content from MCQuestion field
                    const mcQuestionField = fieldDetails.find(f => f.startsWith('MCQuestion:'));
                    const mcQuestion = mcQuestionField ? mcQuestionField.split(':').slice(1).join(':') : '';

                    // Get choice type (Radio 'R' or Checkbox 'C')
                    const mcChoiceTypeField = fieldDetails.find(f => f.startsWith('MCchoicetype:'));
                    const mcChoiceType = mcChoiceTypeField ? mcChoiceTypeField.split(':')[1] : 'C';

                    // Get answer list and convert to array
                    const mcAnswerListField = fieldDetails.find(f => f.startsWith('MCanswerlist:'));
                    const mcAnswers = mcAnswerListField ? mcAnswerListField.split(':')[1].split('^^') : [];

                    // Convert answers to required format
                    const multiChoiceAnswers = mcAnswers.map(answer => ({
                        checkBox: "",
                        answer: answer,
                        checked: false,
                        radio: ""
                    }));

                    // Update convertedData with MultiChoice specific fields
                    convertedData.componentName = 'MultiChoice';
                    convertedData.columnType = 'multichoice';
                    convertedData.labelName = `your multi choice comments`;
                    convertedData.placeHolder = "Enter your multi choice comments";
                    convertedData.name = "MultiChoice";
                    convertedData.text = "Multi choice";
                    convertedData.type = "new";
                    convertedData.mainObject = false;
                    convertedData.icon = `icon-rs-builder-multiple-choice-large`;
                    convertedData.tinyMceLableMain = mcQuestion;
                    convertedData.multiChoice = multiChoiceAnswers;
                    convertedData.radio = "";
                    convertedData.settings = {
                        isChecked: mcChoiceType === 'C'
                    };
                    break;

                case 'starrating':
                    // Get the rating question
                    const ratingQuestionField = fieldDetails.find(f => f.startsWith('SRQuestion:'));
                    const ratingQuestion = ratingQuestionField ?
                        ratingQuestionField.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : '';

                    // Get rating type and map to shape
                    const ratingTypeField = fieldDetails.find(f => f.startsWith('SRRatingType:'));
                    const ratingType = ratingTypeField ? parseInt(ratingTypeField.split(':')[1]) : 1;

                    // Map rating type number to shape name
                    let shape = 'Star';
                    switch (ratingType) {
                        case 1:
                            shape = 'Star';
                            break;
                        case 2:
                            shape = 'Smiley';
                            break;
                        case 3:
                            shape = 'Thumb';
                            break;
                        case 4:
                            shape = 'Heart';
                            break;
                        default:
                            shape = 'Star';
                    }

                    // Get rating range (scale)
                    const ratingRangeField = fieldDetails.find(f => f.startsWith('SRRatingRange:'));
                    const scale = ratingRangeField ? parseInt(ratingRangeField.split(':')[1]) : 5;

                    // Get rating color
                    const ratingColorField = fieldDetails.find(f => f.startsWith('SRRatingColor:'));
                    const color = ratingColorField ? ratingColorField.split(':')[1] : '#3de177';

                    // Update convertedData with Rating specific fields
                    convertedData.componentName = 'Rating';
                    convertedData.columnType = 'starrating';
                    convertedData.labelName = ratingQuestion;
                    convertedData.placeHolder = "Enter your rating comments";
                    convertedData.name = "Rating";
                    convertedData.text = "Rating";
                    convertedData.type = "new";
                    convertedData.icon = "icon-rs-builder-rating-large";
                    convertedData.mainObject = false;
                    convertedData.tinyMceLableMain = ratingQuestion;
                    convertedData.ratings = {
                        shape: shape,
                        scale: scale,
                        color: color
                    };
                    convertedData.ratingsValue = {
                        shape: shape
                    };
                    break;

                case 'RangeSlider':
                    // Get the slider question
                    const sliderQuestionField = fieldDetails.find(f => f.startsWith('RNG_QUESTION:'));
                    const sliderQuestion = sliderQuestionField ?
                        sliderQuestionField.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : '';

                    // Get slider type and map to shape
                    const sliderTypeField = fieldDetails.find(f => f.startsWith('RNG_SLIDERTYPE:'));
                    const sliderType = sliderTypeField ? parseInt(sliderTypeField.split(':')[1]) : 1;
                    const sliderShape = sliderType === 2 ? 'Square' : 'Round';

                    // Get colors
                    const thumbColorField = fieldDetails.find(f => f.startsWith('RNG_THUMPCOLOR:'));
                    const thumbColor = thumbColorField ? thumbColorField.split(':')[1] : '#bd10e0';

                    const firstColorField = fieldDetails.find(f => f.startsWith('RNG_FIRSTCOLOR:'));
                    const firstColor = firstColorField ? firstColorField.split(':')[1] : '#f1e71b';

                    const secondColorField = fieldDetails.find(f => f.startsWith('RNG_SECONDCOLOR:'));
                    const secondColor = secondColorField ? secondColorField.split(':')[1] : '#83e815';

                    // Get content labels
                    const content1Field = fieldDetails.find(f => f.startsWith('RNG_CONTENT1:'));
                    const badLabel = content1Field ?
                        content1Field.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : 'Bad';

                    const content2Field = fieldDetails.find(f => f.startsWith('RNG_CONTENT2:'));
                    const goodLabel = content2Field ?
                        content2Field.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : 'Good';

                    const content3Field = fieldDetails.find(f => f.startsWith('RNG_CONTENT3:'));
                    const veryGoodLabel = content3Field ?
                        content3Field.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : 'Very Good';

                    // Update convertedData with Slider specific fields
                    convertedData.componentName = 'Slider';
                    convertedData.columnType = 'RangeSlider';
                    convertedData.labelName = sliderQuestion;
                    convertedData.placeHolder = "Enter your slider comments";
                    convertedData.badLabelName = badLabel;
                    convertedData.goodLabelName = goodLabel;
                    convertedData.verygoodLabelName = veryGoodLabel;
                    convertedData.name = "Slider";
                    convertedData.text = "Slider";
                    convertedData.type = "new";
                    convertedData.icon = "icon-rs-builder-slider-large";
                    convertedData.mainObject = false;
                    convertedData.tinyMceLableMain = sliderQuestion;
                    convertedData.tinyMceLableMainSliderBad = badLabel;
                    convertedData.tinyMceLableMainSliderGood = goodLabel;
                    convertedData.tinyMceLableMainSliderVeryGood = veryGoodLabel;
                    convertedData.Slider = "";
                    convertedData.sliderList = {
                        shape: sliderShape,
                        thumbColor: thumbColor,
                        firstColor: firstColor,
                        secondColor: secondColor
                    };
                    break;

                case 'CommentRating':
                    // Get the comment question
                    const commentQuestionField = fieldDetails.find(f => f.startsWith('CMTBX_QUESTION:'));
                    const commentQuestion = commentQuestionField ?
                        commentQuestionField.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : '';

                    // Get comment type and map to commentLine
                    const commentTypeField = fieldDetails.find(f => f.startsWith('CMTBX_CMDTYPE:'));
                    const commentType = commentTypeField ? commentTypeField.split(':')[1] : 'M';
                    const commentLine = commentType === 'M' ? 'Multi line' : 'Single line';

                    // Get comment placeholder
                    const commentPlaceholderField = fieldDetails.find(f => f.startsWith('CMTBX_PLACEHOLDER:'));
                    const commentPlaceholder = commentPlaceholderField ?
                        commentPlaceholderField.split(':').slice(1).join(':').trim() : '';

                    // Update convertedData with CommentBox specific fields
                    convertedData.componentName = 'CommentBox';
                    convertedData.columnType = 'CommentRating';
                    convertedData.labelName = commentQuestion;
                    convertedData.placeHolder = "Enter your comments";
                    convertedData.name = "CommentBox";
                    convertedData.text = "Comment box";
                    convertedData.type = "new";
                    convertedData.icon = "icon-rs-builder-comment-box-large";
                    convertedData.mainObject = false;
                    convertedData.tinyMceLableMain = commentQuestion;
                    convertedData.message = "";
                    convertedData.commentLine = commentLine;
                    convertedData.settings = {
                        commentBoxPlaceholder: commentPlaceholder
                    };
                    break;

                case 'Matrix':
                    // Get the matrix question
                    const matrixQuestionField = fieldDetails.find(f => f.startsWith('MAT_QUEST:'));
                    const matrixQuestion = matrixQuestionField ?
                        matrixQuestionField.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : '';

                    // Get matrix type and map to isChecked
                    const matrixTypeField = fieldDetails.find(f => f.startsWith('MAT_Type:'));
                    const matrixType = matrixTypeField ? matrixTypeField.split(':')[1] : 'C';

                    // Get rows and columns
                    const matrixRowsField = fieldDetails.find(f => f.startsWith('MAT_ROWS:'));
                    let columnTitles = [];
                    if (matrixRowsField) {
                        // Split by ^^ but preserve HTML tags
                        columnTitles = matrixRowsField.split(':').slice(1).join(':').split('^^').map(title => {
                            return title.replace(/<br[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                        });
                    }

                    const matrixColumnsField = fieldDetails.find(f => f.startsWith('MAT_COLU:'));
                    let rowTitles = [];
                    if (matrixColumnsField) {
                        rowTitles = matrixColumnsField.split(':').slice(1).join(':').split('^^').map(title => {
                            return title.replace(/<br[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                        });
                    }

                    // Create matrix columns (using the column titles)
                    const columns = columnTitles.map(title => ({
                        id: uuid(),
                        title: title
                    }));

                    // Create matrix rows with checkboxes (using row titles)
                    const rows = rowTitles.slice(0, 5).map(title => ({
                        id: uuid(),
                        title: title,
                        checkBox: Array(columnTitles.length).fill(null).map(() => ({ id: uuid() }))
                    }));

                    // Create matrix titles for columns
                    const matrixTitle = columnTitles.map(title => ({
                        tinyMceLableHeading: title
                    }));

                    // Create matrix subtitles for rows (only first 5 rows)
                    const matrixSub = rowTitles.slice(0, 5).map(title => ({
                        tinyMceLableHeading: title
                    }));

                    // Update convertedData with Matrix specific fields
                    convertedData.componentName = 'Matrix';
                    convertedData.columnType = 'Matrix';
                    convertedData.labelName = matrixQuestion;
                    convertedData.placeHolder = "Enter your matrix rating scale question";
                    convertedData.name = "Matrix";
                    convertedData.text = "Matrix / Rating scale";
                    convertedData.type = "new";
                    convertedData.icon = "icon-rs-builder-matrix-rating-scale-large";
                    convertedData.preview = false;
                    convertedData.rowDefaultValue = "Row value";
                    convertedData.colDefaultValue = "Column value";
                    convertedData.matrix = {
                        rows: rows,
                        columns: columns
                    };
                    convertedData.mainObject = false;
                    convertedData.tinyMceLableMain = matrixQuestion;
                    convertedData.matrixTitle = matrixTitle;
                    convertedData.matrixSub = matrixSub;
                    convertedData.radio = "";
                    convertedData.settings = {
                        isChecked: matrixType === 'C'
                    };
                    break;

                case 'Rankrating':
                    // Get the ranking question
                    const rankingQuestionField = fieldDetails.find(f => f.startsWith('RANKSUR_QUESTION:'));
                    const rankingQuestion = rankingQuestionField ?
                        rankingQuestionField.split(':').slice(1).join(':')
                            .replace(/<br[^>]*>/g, '')
                            .replace(/\s+/g, ' ')
                            .trim() : '';

                    // Get ranking answers
                    const rankingAnswersField = fieldDetails.find(f => f.startsWith('RNK_QUEST:'));
                    const rankingAnswers = rankingAnswersField ? rankingAnswersField.split(':')[1].split('^^') : [];

                    // Convert answers to required format
                    const rankingFields = rankingAnswers.map(answer => ({
                        rank: '',
                        answer: answer
                    }));

                    // Update convertedData with Ranking specific fields
                    convertedData.componentName = 'Ranking';
                    convertedData.columnType = 'Rankrating';
                    convertedData.labelName = rankingQuestion;
                    convertedData.placeHolder = "Enter your ranking comments";
                    convertedData.name = "Ranking";
                    convertedData.text = "Ranking";
                    convertedData.type = "new";
                    convertedData.icon = "icon-rs-builder-ranking-large";
                    convertedData.mainObject = false;
                    convertedData.tinyMceLableMain = rankingQuestion;
                    convertedData.rankingFields = rankingFields.length > 0 ? rankingFields : [{ rank: '', answer: '' }];
                    break;

                case 'GroupControl':
                    // Get the placeholder and label from fieldDetails
                    const groupPlaceholderField = fieldDetails.find(f => f.startsWith('Placeholder:'));
                    const groupLabel = groupPlaceholderField ? groupPlaceholderField.split(':')[1] : item.columnName;

                    // Convert GroupControl to Participants format while keeping dynamic values
                    convertedData.componentName = 'Participants';
                    convertedData.columnType = 'Participants';
                    convertedData.labelName = groupLabel;
                    convertedData.placeHolder = txtPlaceholder;
                    convertedData.name = item.columnName;
                    convertedData.text = item.columnName;
                    convertedData.tinyMceLable = labelContent;

                    // Initialize empty values for form state
                    convertedData.FullName = '';
                    convertedData.email = '';
                    convertedData.FirstName = '';
                    convertedData.LastName = '';
                    convertedData.selectField = '';
                    convertedData.optionData = [];
                    convertedData.disable = false;

                    // Get participant count from groupiconrepeat
                    const repeatField = fieldDetails.find(f => f.startsWith('groupiconrepeat:'));
                    convertedData.participantTotal = repeatField ? repeatField.split(':')[1] : '1';

                    // Get participant settings from GroupiconSetting
                    const settingsField = fieldDetails.find(f => f.startsWith('GroupiconSetting:'));
                    if (settingsField) {
                        const settings = settingsField.split(':')[1].split(',');
                        // Initialize participant array with all fields as false
                        const participantArray = [false, false, false, false]; // [salutation, fullname, email, mobile]

                        // Set true for fields that are present
                        settings.forEach(setting => {
                            switch (setting.toLowerCase()) {
                                case 'salutation':
                                    participantArray[0] = true;
                                    break;
                                case 'fullname':
                                    participantArray[1] = true;
                                    break;
                                case 'email':
                                    participantArray[2] = true;
                                    break;
                                case 'mobile':
                                    participantArray[3] = true;
                                    break;
                            }
                        });
                        convertedData.participant = participantArray;
                    } else {
                        convertedData.participant = [false, false, false, false];
                    }

                    // Get validation field for mandatory
                    const groupValidationField = fieldDetails.find(f => f.startsWith('validation:'));
                    convertedData.mandatory = groupValidationField ? groupValidationField.split(':')[1] === 'yes' : false;
                    break;
            }

            return convertedData;
        });
    }

    let isCaptcha = data?.[0]?.isCaptchaOtpEnabled === '1' ? true : false;
    let a = jsonData?.map((e) => ({ ...e, mapTo: [] }));
    let selectedColor = JSON.parse(data?.[0]?.bgColor)?.bgColor;
    let formGenerator = a?.map((detail) => {
        let result = findElement(detail);
        // debugger;
        if (detail?.columnType === 'TimeDate') {
            return {
                ...detail,
                labelName: detail?.tinyMceLable,
                dateAndTime: new Date(detail?.dateAndTime),
                component: result?.component,
            };
        } else if (detail?.columnType === 'Textbox') {
            // For mobile number fields, ensure we use the PhoneInput component
            if (detail?.isMobileNumber || detail?.componentName === 'PhoneInput') {
                // Find the PhoneInput component from INPUT_TYPES
                const phoneInputComponent = INPUT_TYPES?.find(item =>
                    item?.componentName === 'Textbox' && item?.isMobileNumber === true
                )?.component;

                return {
                    ...detail,
                    labelName: detail?.tinyMceLable || detail?.labelName,
                    componentName: 'PhoneInput',
                    component: phoneInputComponent || result?.component,
                };
            }

            return {
                ...detail,
                labelName: detail?.tinyMceLable || detail?.labelName,
                component: result?.component,
            };
        } else if (detail?.columnType === 'Participants') {
            return {
                ...detail,
                labelName: detail?.tinyMceLable || detail?.labelName,
                component: result?.component,
            };
        } else if (detail?.columnType === 'Hidden') {
            return {
                ...detail,
                labelName: detail?.tinyMceLable || detail?.labelName,
                component: result?.component,
            };
        } else if (detail?.columnType === 'Combobox') {
            let tempDDL = detail?.dropdowns.shift();
            return {
                ...detail,
                labelName: detail?.tinyMceLable,
                optionData: detail?.dropdowns,
                component: result?.component,
            };
        } else if (detail?.columnType === 'Radio') {
            return {
                ...detail,
                labelName: detail?.tinyMceLable,
                optionData: detail?.dropdowns,
                component: result?.component,
            };
        } else if (detail?.columnType === 'checkbox') {
            return {
                ...detail,
                labelName: detail?.tinyMceLable,
                optionData: detail?.dropdowns,
                component: result?.component,
            };
        } else if (detail?.columnType === 'Consent Checkbox') {
            return {
                ...detail,
                labelName: detail?.tinyMceLableMain,
                component: result?.component,
            };
        }
        else if (detail?.columnType === 'RangeSlider') {
            return {
                ...detail,
                labelName: detail?.tinyMceLableMain || detail?.labelName,
                badLabelName: detail?.tinyMceLableMainSliderBad || detail?.badLabelName,
                goodLabelName: detail?.tinyMceLableMainSliderGood || detail?.goodLabelName,
                verygoodLabelName: detail?.tinyMceLableMainSliderVeryGood || detail?.verygoodLabelName,
                component: result?.component,
            };
        } else if (detail?.columnType === 'starrating') {
            return {
                ...detail,
                labelName: detail?.tinyMceLableMain || detail?.labelName,
                component: result?.component,
            };
        } else if (detail?.columnType === 'Rankrating' || detail?.columnType === 'multichoice') {
            return {
                ...detail,
                labelName: detail?.tinyMceLableMain || detail?.labelName,
                badLabelName: detail?.tinyMceLableMainSliderBad || detail?.badLabelName,
                goodLabelName: detail?.tinyMceLableMainSliderGood || detail?.goodLabelName,
                verygoodLabelName: detail?.tinyMceLableMainSliderVeryGood || detail?.verygoodLabelName,
                component: result?.component,
            };
        } else if (detail?.columnType === 'CommentRating') {
            return {
                ...detail,
                labelName: detail?.tinyMceLableMain || detail?.labelName,
                component: result?.component,
            };
        } else {
            return {
                ...detail,
                // preview: true,
                labelName:
                    detail?.columnType === 'TextBlock' || detail?.columnType === 'Matrix'
                        ? detail?.tinyMceLableMain
                        : detail?.tinyMceLable,
                component: result?.component,
            };
        }
    });
    let tinyMceLableAgree = data?.[0]?.tcTemplate;

    if (tinyMceLableAgree) {
        const cleanAgreeText = (text) =>
            text
                .replace(/&nbsp;/g, ' ')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\s+/g, ' ')
                .trim();

        tinyMceLableAgree = cleanAgreeText(tinyMceLableAgree);
        const hasParagraph = /^<p[\s>]/i.test(tinyMceLableAgree) && /<\/p>$/i.test(tinyMceLableAgree);
        if (!hasParagraph) {
            tinyMceLableAgree = `<p>${tinyMceLableAgree}</p>`;
        }
    } else {
        tinyMceLableAgree = `<p>${AGREE_TERMSCONDITIONS}</p>`;
    }

    let isAgreeCheckbox = data?.[0]?.tcTemplate === "" ? false : true;
    let Submit = data?.[0]?.submitSetting?.submitText;
    // console.log('Form ::: ', formName, a, selectedColor, formGenerator, tinyMceLableAgree, Submit);

    let isProgressiveProfiling = false;
    let progressiveForms = formGenerator;
    if (data?.[0]?.isProgressive === '1') {
        let progressiveCount = data?.[0]?.progressiveCount;
        // let visible = formGenerator?.slice(0, parseInt(tempCount, 10));
        // let queued = formGenerator?.slice(parseInt(tempCount, 10));
        // let combined = [...visible, ...queued];
        // progressiveForms = [...combined];
        // dispatchState({
        //     type: 'UPDATE_SETTINGS',
        //     payload: {
        //         profilingToggle: isProgressiveProfiling,
        //         settingsPopup: false,
        //         fieldCount: !isProgressiveProfiling ? 0 : tempCount,
        //     },
        // });
        isProgressiveProfiling = true;

        const textBlocks = formGenerator.filter((f) => f.columnType === 'TextBlock');
        const otherFields = formGenerator.filter((f) => f.columnType !== 'TextBlock');

        const visible = [{ field: 'Visible fields', fieldId: uniqueId() }, ...otherFields.slice(0, progressiveCount)];
        const queued = [{ field: 'Queued fields', fieldId: uniqueId() }, ...otherFields.slice(progressiveCount)];
        const combined = [...textBlocks, ...visible, ...queued].map((f) => ({
            ...f,
            labelName: f.tinyMceLableMain ?? f.tinyMceLable ?? f.labelName,
        }));

        progressiveForms = combined;

        // Update context state (for reducer)
        dispatchState({
            type: 'UPDATE_SETTINGS',
            payload: {
                profilingToggle: true,
                settingsPopup: false,
                fieldCount: progressiveCount,
            },
        });
    }
    dispatchState({
        type: 'UPDATE',
        field: 'dropAble',
        payload: progressiveForms,
    });
    // Unified default formStyles structure - matches FormGenerator.jsx defaultValues
    // Note: theme, pagination, itemsPerPage, and font can be objects in API response
    const defaultFormStyles = {
        style: 'default',
        theme: 'theme1', // Can be object: { name, background, text, accent, border, formBackground, textField01, textField02, value }
        themeEnabled: false,
        pagination: 'pageNumbers', // Can be object: { text, value }
        paginationEnabled: false,
        itemsPerPage: 5, // Can be object: { text, value }
        fontSize: 19,
        fontColor: '#000000',
        font: 'default', // Can be object: { text, value }
        fontEnabled: false,
        buttonAlignment: 'center',
        formLayout: 'horizontal',
        formBackgroundColor: '#ffffff',
        formBackgroundEnabled: false,
        formBackgroundImage: '',
        textFieldSize: 'normal',
        inputStyle: 'default',
        buttonRounding: 'default',
        layoutAlignment: 'left',
        logoEnabled: false,
        logoStyle: 'style3',
        buttonEnabled: false,
        customColors: {
            background: 'transparent',
            text: '#000000',
            accent: '#007bff',
            border: '#cccccc',
        },
    };
    // Unified default headerConfig structure - matches FormGenerator.jsx defaultValues
    const defaultHeaderConfig = {
        enabled: true,
        logo: '',
        name: '',
        backgroundColor: '#00006e',
        color: '#ffffff',
        backgroundImage: '',
        alignment: 'left',
        layoutPosition: 'top',
        logoAlignment: 'left',
        nameAlignment: 'left',
    };
    const extractColor = (str, key) => {
        if (!str || typeof str !== 'string') return undefined;
        const parts = str.split(':');
        if (parts.length > 1) return parts.slice(1).join(':').trim();
        return undefined;
    };
    const extractBorderColor = (str) => {
        if (!str || typeof str !== 'string') return undefined;
        const match = str.match(/rgba\([^\)]+\)|#([0-9a-fA-F]{3,8})/);
        if (match) return match[0];
        const parts = str.split(' ');
        return parts[parts.length - 1];
    };
    // Initialize with defaults - ensures consistent structure for both add and edit modes
    let apiFormStyles = { ...defaultFormStyles };
    let apiHeaderConfig = { ...defaultHeaderConfig };
    const allowedStyles = ['sleek', 'modern', 'default'];
    const allowedThemes = ['theme1', 'theme2', 'theme3', 'custom'];
    const allowedPaginations = ['pageNumbers', 'previousNext', 'both'];
    const legacyMap = {
        style: { classic: 'default' },
        theme: { colorful: 'theme3' },
        pagination: { default: 'pageNumbers' },
    };
    const toStringVal = (v) => (v && typeof v === 'object' && v.value !== undefined ? v.value : v);
    const normalizeStyles = (ts = {}) => {
        const s = toStringVal(ts.style);
        const t = toStringVal(ts.theme);
        const p = toStringVal(ts.pagination);
        const styleNorm = allowedStyles.includes(s) ? s : (legacyMap.style[s] || 'default');
        const themeNorm = allowedThemes.includes(t) ? t : (legacyMap.theme[t] || 'theme1');
        const pagNorm = allowedPaginations.includes(p) ? p : (legacyMap.pagination[p] || 'pageNumbers');
        return {
            style: styleNorm,
            theme: themeNorm,
            pagination: pagNorm,
            paginationEnabled: !!ts.paginationEnabled,
            itemsPerPage: ts.itemsPerPage || defaultFormStyles.itemsPerPage,
            customColors: {
                background: ts?.customColors?.background || defaultFormStyles.customColors.background,
                text: ts?.customColors?.text || defaultFormStyles.customColors.text,
                accent: ts?.customColors?.accent || defaultFormStyles.customColors.accent,
                border: ts?.customColors?.border || defaultFormStyles.customColors.border,
            },
        };
    };

    // Extract FormStyles from formGenerationColumn - preserve original JSON structure
    try {
        const formGenData = data?.[0]?.formGenerationColumn;
        if (Array.isArray(formGenData) && formGenData.length > 0) {
            const stylesCol = formGenData.find((c) => c?.columnType === 'FormStyles');
            if (stylesCol) {
                const details = stylesCol?.formDetails || stylesCol?.fieldDetails;
                let parsed = null;

                // Parse fieldDetails/formDetails - handle both string and object formats
                if (typeof details === 'string') {
                    try {
                        parsed = JSON.parse(details);
                    } catch (e) {
                        parsed = null;
                    }
                } else if (typeof details === 'object' && details !== null) {
                    parsed = details;
                }

                if (parsed) {
                    // Preserve the original structure - merge with defaults only for missing properties
                    // This ensures theme, pagination, itemsPerPage, and font objects are preserved as-is
                    apiFormStyles = {
                        style: parsed?.style || defaultFormStyles.style,
                        // Preserve theme as object if it exists, otherwise use default
                        theme: parsed?.theme && typeof parsed.theme === 'object'
                            ? parsed.theme
                            : (parsed?.theme || defaultFormStyles.theme),
                        themeEnabled: parsed?.themeEnabled !== undefined ? parsed.themeEnabled : false,
                        // Preserve pagination as object if it exists, otherwise use default
                        pagination: parsed?.pagination && typeof parsed.pagination === 'object'
                            ? parsed.pagination
                            : (parsed?.pagination || defaultFormStyles.pagination),
                        paginationEnabled: parsed?.paginationEnabled !== undefined
                            ? parsed.paginationEnabled
                            : defaultFormStyles.paginationEnabled,
                        // Preserve itemsPerPage as object if it exists, otherwise use default
                        itemsPerPage: parsed?.itemsPerPage && typeof parsed.itemsPerPage === 'object'
                            ? parsed.itemsPerPage
                            : (parsed?.itemsPerPage !== undefined ? parsed.itemsPerPage : defaultFormStyles.itemsPerPage),
                        fontSize: parsed?.fontSize !== undefined ? parsed.fontSize : defaultFormStyles.fontSize,
                        fontColor: parsed?.fontColor || defaultFormStyles.fontColor,
                        // Preserve font as object if it exists, otherwise use default
                        font: parsed?.font && typeof parsed.font === 'object'
                            ? parsed.font
                            : (parsed?.font || defaultFormStyles.font),
                        fontEnabled: parsed?.fontEnabled !== undefined ? parsed.fontEnabled : defaultFormStyles.fontEnabled,
                        buttonAlignment: parsed?.buttonAlignment || defaultFormStyles.buttonAlignment,
                        formLayout: parsed?.formLayout || defaultFormStyles.formLayout,
                        formBackgroundColor: parsed?.formBackgroundColor || defaultFormStyles.formBackgroundColor,
                        formBackgroundEnabled: parsed?.formBackgroundEnabled !== undefined
                            ? parsed.formBackgroundEnabled
                            : defaultFormStyles.formBackgroundEnabled,
                        formBackgroundImage: parsed?.formBackgroundImage || defaultFormStyles.formBackgroundImage,
                        textFieldSize: parsed?.textFieldSize || defaultFormStyles.textFieldSize,
                        inputStyle: parsed?.inputStyle || defaultFormStyles.inputStyle,
                        buttonRounding: parsed?.buttonRounding || defaultFormStyles.buttonRounding,
                        layoutAlignment: parsed?.layoutAlignment || defaultFormStyles.layoutAlignment,
                        logoEnabled: parsed?.logoEnabled !== undefined ? parsed.logoEnabled : defaultFormStyles.logoEnabled,
                        logoStyle: parsed?.logoStyle || defaultFormStyles.logoStyle,
                        buttonEnabled: parsed?.buttonEnabled !== undefined ? parsed.buttonEnabled : false,
                        // Preserve customColors object structure
                        customColors: parsed?.customColors && typeof parsed.customColors === 'object'
                            ? {
                                ...defaultFormStyles.customColors,
                                ...parsed.customColors
                            }
                            : defaultFormStyles.customColors,
                    };

                    // Extract header config
                    if (parsed?.headerConfig && typeof parsed.headerConfig === 'object') {
                        apiHeaderConfig = {
                            ...defaultHeaderConfig,
                            ...parsed.headerConfig,
                            // Ensure all properties are present - use ?? instead of || to preserve empty strings
                            enabled: true,
                            logo: parsed.headerConfig.logo ?? '',
                            name: parsed.headerConfig.name ?? defaultHeaderConfig.name,
                            backgroundColor: parsed.headerConfig.backgroundColor ?? defaultHeaderConfig.backgroundColor,
                            color: parsed.headerConfig.color ?? defaultHeaderConfig.color,
                            backgroundImage: parsed.headerConfig.backgroundImage ?? defaultHeaderConfig.backgroundImage,
                            alignment: parsed.headerConfig.alignment ?? defaultHeaderConfig.alignment,
                            layoutPosition: parsed.headerConfig.layoutPosition ?? defaultHeaderConfig.layoutPosition,
                            logoAlignment: parsed.headerConfig.logoAlignment ?? defaultHeaderConfig.logoAlignment,
                            nameAlignment: parsed.headerConfig.nameAlignment ?? defaultHeaderConfig.nameAlignment,
                        };
                    }
                }
            }
        }
    } catch (e) {
    }

    // Fallback to WelcomeNoteMailHTML if FormStyles not found in formGenerationColumn (only in edit mode)
    // Only run this if we haven't already extracted from formGenerationColumn
    if (data && data[0] && !apiFormStyles.formBackgroundColor) {
        try {
            const wn = data?.[0]?.WelcomeNoteMailHTML ? JSON.parse(data[0].WelcomeNoteMailHTML) : null;
            if (wn && wn.themeStyles && typeof wn.themeStyles === 'object') {
                const normalized = normalizeStyles(wn.themeStyles);
                apiFormStyles = { ...apiFormStyles, ...normalized };
            } else if (wn && (wn.bgColor || wn.textColor || wn.borderColor)) {
                apiFormStyles = {
                    ...apiFormStyles,
                    theme: 'custom',
                    customColors: {
                        background: extractColor(wn.bgColor) || apiFormStyles.customColors.background,
                        text: extractColor(wn.textColor) || apiFormStyles.customColors.text,
                        accent: apiFormStyles.customColors.accent,
                        border: extractBorderColor(wn.borderColor) || apiFormStyles.customColors.border,
                    },
                };
            }
            if (wn && wn.headerConfig && typeof wn.headerConfig === 'object') {
                apiHeaderConfig = { ...apiHeaderConfig, ...wn.headerConfig };
            }
        } catch (e) {
        }
    }
    // Return unified structure - ensures consistent formStyles and headerConfig for both add and edit modes
    const webhookSettings = data?.[0]?.submitSetting?.webhookSettings;
    const webhookSettingIdNumber = Number(webhookSettings?.webHookSettingId);
    return {
        isEdit: true,
        formName,
        selectedColor,
        colorPicker: selectedColor,
        formGenerator: progressiveForms,
        formGeneratorVisible: progressiveForms,
        tinyMceLableAgree,
        AgreeCheckbox: isAgreeCheckbox,
        Submit,
        isAutoSave: data?.[0]?.isAutoSave === 'Y',
        settingsInputField: !!data?.[0]?.progressiveCount ? Number(data?.[0]?.progressiveCount) : 0,
        isProgressiveProfiling,
        enableCaptchaCheckbox: isCaptcha,
        CancelView: '<p>Cancel</p>',
        enableCaptcha: '<p>Enable CAPTCHA</p>',
        webHookURL: !isNaN(webhookSettingIdNumber)
            ? {
                ...webhookSettings,
                webHookSettingId: webhookSettingIdNumber,
            }
            : '',
        // Return formStyles preserving original JSON structure (theme, pagination, itemsPerPage, font as objects)
        formStyles: {
            ...defaultFormStyles,
            ...apiFormStyles,
            // Preserve object structures for theme, pagination, itemsPerPage, and font
            theme: apiFormStyles.theme || defaultFormStyles.theme,
            themeEnabled: apiFormStyles.themeEnabled !== undefined
                ? apiFormStyles.themeEnabled
                : defaultFormStyles.themeEnabled,
            pagination: apiFormStyles.pagination || defaultFormStyles.pagination,
            itemsPerPage: apiFormStyles.itemsPerPage !== undefined
                ? apiFormStyles.itemsPerPage
                : defaultFormStyles.itemsPerPage,
            font: apiFormStyles.font || defaultFormStyles.font,
            // Ensure all other properties are present with defaults
            fontSize: apiFormStyles.fontSize ?? defaultFormStyles.fontSize,
            fontColor: apiFormStyles.fontColor || defaultFormStyles.fontColor,
            fontEnabled: apiFormStyles.fontEnabled !== undefined
                ? apiFormStyles.fontEnabled
                : defaultFormStyles.fontEnabled,
            buttonAlignment: apiFormStyles.buttonAlignment || defaultFormStyles.buttonAlignment,
            formLayout: apiFormStyles.formLayout || defaultFormStyles.formLayout,
            formBackgroundColor: apiFormStyles.formBackgroundColor || defaultFormStyles.formBackgroundColor,
            formBackgroundEnabled: apiFormStyles.formBackgroundEnabled !== undefined
                ? apiFormStyles.formBackgroundEnabled
                : defaultFormStyles.formBackgroundEnabled,
            formBackgroundImage: apiFormStyles.formBackgroundImage || defaultFormStyles.formBackgroundImage,
            textFieldSize: apiFormStyles.textFieldSize || defaultFormStyles.textFieldSize,
            inputStyle: apiFormStyles.inputStyle || defaultFormStyles.inputStyle,
            buttonRounding: apiFormStyles.buttonRounding || defaultFormStyles.buttonRounding,
            layoutAlignment: apiFormStyles.layoutAlignment || defaultFormStyles.layoutAlignment,
            logoEnabled: apiFormStyles.logoEnabled !== undefined
                ? apiFormStyles.logoEnabled
                : defaultFormStyles.logoEnabled,
            logoStyle: apiFormStyles.logoStyle || defaultFormStyles.logoStyle,
            buttonEnabled: apiFormStyles.buttonEnabled !== undefined ? apiFormStyles.buttonEnabled : false,
            customColors: apiFormStyles.customColors || defaultFormStyles.customColors,
        },
        // Return complete headerConfig with all properties - ensures consistency
        headerConfig: {
            ...defaultHeaderConfig,
            ...apiHeaderConfig,
            // Ensure all properties are present with defaults - use ?? to preserve empty strings
            enabled: true,
            logo: apiHeaderConfig.logo ?? defaultHeaderConfig.logo,
            name: apiHeaderConfig.name ?? defaultHeaderConfig.name,
            backgroundColor: apiHeaderConfig.backgroundColor ?? defaultHeaderConfig.backgroundColor,
            color: apiHeaderConfig.color ?? defaultHeaderConfig.color,
            backgroundImage: apiHeaderConfig.backgroundImage ?? defaultHeaderConfig.backgroundImage,
            alignment: apiHeaderConfig.alignment ?? defaultHeaderConfig.alignment,
            layoutPosition: apiHeaderConfig.layoutPosition ?? defaultHeaderConfig.layoutPosition,
            logoAlignment: apiHeaderConfig.logoAlignment ?? defaultHeaderConfig.logoAlignment,
            nameAlignment: apiHeaderConfig.nameAlignment ?? defaultHeaderConfig.nameAlignment,
        },
    };
};

export const searchListItems = [
    {
        id: 'all',
        type: 'All list',
    },
    {
        id: 'my',
        type: 'My list',
    },
    {
        id: 'A',
        type: 'Subscription',
    },
    // {
    //     id: 'C',
    //     type: 'Tell a friend',
    // },
    {
        id: 'S',
        type: 'Survey',
    },
    {
        id: 'Brand',
        type: 'Brand own form',
    },
];

export const handleFormType = (type, userId) => {
    switch (type) {
        case 'all':
            return '';
        case 'my':
            return userId.toString();
        case 'A':
        case 'C':
        case 'Brand':
        case 'S':
            return type;
    }
};

export const handleErrorMessage = (isDuplicate, value) => {
    // console.log('isDuplicate: ', isDuplicate);
    const isExist = isDuplicate?.find((duplicate) => duplicate?.mapToValue?.attributeName === value?.attributeName);
    return isExist ? 'Duplicate attribute' : true;
};

export const handleAttributeDuplicates = (formGenerator, value) => {
    // console.log('formGenerator: ', formGenerator);
    let tempSet = new Set();
    // console.log('tempSet: ', tempSet);
    const isDuplicate = formGenerator.filter((form) => {
        if (form?.mapToValue?.attributeName) {
            if (tempSet.has(form.mapToValue?.attributeName)) {
                return true;
            }
            tempSet.add(form?.mapToValue?.attributeName);
            return false;
        }
    });
    return handleErrorMessage(isDuplicate, value);
};
