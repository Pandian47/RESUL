import { TemplateBlank1, TemplateBlank2, TemplateBlank3, TemplateBlank4 } from 'Assets/Images';
import { alexa_large, arrow_right_large, arrow_up_medium, builder_attachment_large, builder_button_large, builder_checkbox_large, builder_date_time_large, builder_divider_large, builder_image_large, builder_text_large, builder_video_large, circle_minus_fill_medium, circle_pencil_medium, duplicate_medium, email_preview_large, fullscreen_collapse_large, html_editor_large, menu_dot_medium, mobile_notification_medium, refresh_large, settings_help_medium, settings_medium, user_arrow_down_large, user_call_center_large, web_browser_large, webinar_medium } from 'Constants/GlobalConstant/Glyphicons';
import Blocks from './Components/Blocks/Blocks';

import Buttons from './Components/Button/Buttons';
import Divider from './Components/Divider/Divider';
import Heading from './Components/Heading/Heading';
import IconsElement from './Components/Icon/IconsElement';
import ImageElement from './Components/ImageElement/ImageElement';
import LinkBlock from './Components/LinkBlock/LinkBlock';
import OpenBlocks from './Components/OpenBlocks/OpenBlocks';
import OpenLayerManager from './Components/OpenLayerManager/OpenLayerManager';
import OpenStyleManager from './Components/OpenStyleManager/OpenStyleManager';
import PageSettings from './Components/PageSettings/PageSettings';
import SectionElement from './Components/Section/SectionElement';
import TextElement from './Components/Text/TextElement';
import TimerElement from './Components/Timer/TimerElement';
import VideoElement from './Components/Video/VideoElement';
import LandingPageGallery from './Pages/AllTemplates';
import BlocksData from './Pages/LandingPageBuilder/Components/BlocksData';
import BlocksElement from './Components/Blocks/BlocksElement';
import ColumnData from './Components/Blocks/Components/ColumnData';

import { v4 as uuid } from 'uuid';
import Template1 from './Components/OpenBlocks/Components/Template1';

import CreateNewTemplate from '../PushBuilder/Pages/CreatNewTemplates/CreateNewTemplate';
import LandingPageModal from './Pages/AllTemplates/Modal';

const ALL_TEMPLATES = 'All templates';
const MY_TEMPLATES = 'My templates';
const CREATE_NEW_TEMPLATES = 'Create new templates';

const tabData = (setAddModalShow, payload, setPayload, isLoading) => [
    { id: 0, text: ALL_TEMPLATES, component: () => <LandingPageGallery id={1} text={ALL_TEMPLATES} setAddModalShow={setAddModalShow} payload={payload} setPayload={setPayload} isLoading={isLoading} /> },
    { id: 1, text: MY_TEMPLATES, component: () => <LandingPageGallery id={2} text={MY_TEMPLATES} setAddModalShow={setAddModalShow} payload={payload} setPayload={setPayload} isLoading={isLoading} /> },
    {
        id: 2, text: CREATE_NEW_TEMPLATES, component: () => (
            <CreateNewTemplate
                ModalComponent={LandingPageModal}
                ManageCategoriesModalComponent={() => null}
                data={[
                    { name: 'templateBlank1', src: TemplateBlank1, path: 'default1' },
                    { name: 'templateBlank2', src: TemplateBlank2, path: 'default2' },
                    { name: 'templateBlank3', src: TemplateBlank3, path: 'default3' },
                    { name: 'templateBlank4', src: TemplateBlank4, path: 'default4' },
                ]}
            />
        )
    },
];

export const LANDING_PAGE_INITIAL_DATA = {
    defaultValue: {
        landingPageName: '',
        pageBackgroundColor: '',
        footerCode: '',
        headerCode: '',
        pageDescription: '',
        pageKeywords: '',
        pageTitle: '',
        addedImages: [
            'https://www.connectingtraveller.com/travel-blog/wp-content/uploads/2022/05/TREKKING_destination_in_HIMACHAL_CONNECTINGTRAVELLER.jpg',
        ],
        entireItems: [<div>Hello</div>],
    },
};

export { tabData };

export const HEADER_ICONS = [
    {
        id: 1,
        icon: email_preview_large,
        tooltip: 'View Components',
        disable: false,
    },
    {
        id: 2,
        icon: refresh_large,
        tooltip: 'Undo',
        disable: false,
    },
    {
        id: 3,
        icon: arrow_right_large,
        tooltip: 'Redo',
        disable: false,
    },
    {
        id: 4,
        icon: html_editor_large,
        tooltip: 'Code editor',
        disable: false,
    },
    {
        id: 5,
        icon: web_browser_large,
        tooltip: 'Preview',
        disable: false,
    },
    {
        id: 6,
        icon: fullscreen_collapse_large,
        tooltip: 'Fullscreen',
        disable: false,
    },
];

export const ACTIONS_ICONS = [
    {
        id: 1,
        icon: arrow_up_medium,
        tooltip: 'Move',
        disable: false,
    },
    {
        id: 2,
        icon: settings_help_medium,
        tooltip: 'Drag',
        disable: false,
    },
    {
        id: 3,
        icon: duplicate_medium,
        tooltip: 'Duplicate',
        disable: false,
    },
    {
        id: 4,
        icon: circle_minus_fill_medium,
        tooltip: 'Remove',
        disable: false,
    },
];

export const BLOCKS_VALUES = ['12', '2', '3', '4', 'center', '2/10', '10/2', '3/9', '9/3', '8/4', '4/8', '5/7', '7/5'];

export const BLOCKS_DROPDOWN_DATA = BLOCKS_VALUES.map((item, idx) => {
    return <BlocksData value={item} key={item.id + idx} />;
});

export const LANDING_PAGE_BLOCK_ELEMENTS = [
    {
        id: 12,
        uid: uuid(),
        label: '1 Column',
        clicked: false,
        popoverLabel: '1 Column',
        component: (index, remove, styles) => [<ColumnData index={index} remove={remove} styles={styles} size={12} />],
    },
    {
        id: 13,
        uid: uuid(),
        label: '2 Column',
        clicked: false,
        popoverLabel: '2 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={6} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={6} />,
            ];
        },
    },
    {
        id: 14,
        uid: uuid(),
        label: '3 Column',
        clicked: false,
        popoverLabel: '3 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={4} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={4} />,
                <ColumnData index={index + 3} remove={remove} styles={styles} size={4} />,
            ];
        },
    },
    {
        id: 15,
        uid: uuid(),
        label: '4 Column',
        clicked: false,
        popoverLabel: '4 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={3} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={3} />,
                <ColumnData index={index + 3} remove={remove} styles={styles} size={3} />,
                <ColumnData index={index + 4} remove={remove} styles={styles} size={3} />,
            ];
        },
    },
    {
        id: 16,
        uid: uuid(),
        label: 'Center Column',
        clicked: false,
        popoverLabel: 'Center Column',
        component: (index, remove, styles) => {
            return [<ColumnData index={index} remove={remove} styles={styles} size={6} />];
        },
    },
    {
        id: 17,
        uid: uuid(),
        label: '2/10 Column',
        clicked: false,
        popoverLabel: '2/10 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={2} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={10} />,
            ];
        },
    },
    {
        id: 18,
        uid: uuid(),
        label: '10/2 Column',
        clicked: false,
        popoverLabel: '10/2 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={10} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={2} />,
            ];
        },
    },
    {
        id: 19,
        uid: uuid(),
        label: '3/9 Column',
        clicked: false,
        popoverLabel: '3/9 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={3} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={9} />,
            ];
        },
    },
    {
        id: 20,
        uid: uuid(),
        label: '9/3 Column',
        clicked: false,
        popoverLabel: '9/3 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={9} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={3} />,
            ];
        },
    },
    {
        id: 21,
        uid: uuid(),
        label: '4/8 Column',
        clicked: false,
        popoverLabel: '4/8 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={4} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={8} />,
            ];
        },
    },
    {
        id: 22,
        uid: uuid(),
        label: '8/4 Column',
        clicked: false,
        popoverLabel: '8/4 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={8} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={4} />,
            ];
        },
    },
    {
        id: 23,
        uid: uuid(),
        label: '5/7 Column',
        clicked: false,
        popoverLabel: '5/7 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={5} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={7} />,
            ];
        },
    },
    {
        id: 24,
        uid: uuid(),
        label: '7/5 Column',
        clicked: false,
        popoverLabel: '7/5 Column',
        component: (index, remove, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} size={7} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} size={5} />,
            ];
        },
    },
];

export const LANDING_PAGE_ELEMENTS = [
    {
        id: 1,
        uid: uuid(),
        icon: user_arrow_down_large,
        // elementImage: `${builderBlocks}`,
        label: 'Blocks',
        clicked: false,
        popoverLabel: '',
        name: 'blocks',
        dropdown: true,
        component: (index, append, remove, styles) => (
            <Blocks index={index} remove={remove} styles={styles} append={append} />
        ),
    },
    {
        id: 2,
        uid: uuid(),
        icon: user_call_center_large,
        // elementImage: `${builderSection}`,
        label: 'Section',
        clicked: false,
        popoverLabel: 'Section',
        name: 'section',
        dropdown: false,
        component: (index, append) => <SectionElement index={index} append={append} />,
    },
    {
        id: 3,
        uid: uuid(),
        icon: alexa_large,
        // elementImage: `${builderHeading}`,
        label: 'Heading',
        clicked: false,
        popoverLabel: 'Header',
        name: 'heading',
        dropdown: false,
        component: (index, append, remove, styles) => (
            <Heading index={index} remove={remove} styles={styles} append={append} />
        ),
    },
    {
        id: 4,
        uid: uuid(),
        icon: builder_text_large,
        // elementImage: `${builderText}`,
        label: 'Text',
        clicked: false,
        popoverLabel: 'Text',
        name: 'textField',
        dropdown: false,
        component: (index, append, remove, styles) => (
            <TextElement index={index} remove={remove} styles={styles} append={append} />
        ),
    },
    {
        id: 5,
        uid: uuid(),
        icon: builder_image_large,
        // elementImage: `${builderImage}`,
        label: 'Image',
        clicked: false,
        popoverLabel: 'Image',
        name: 'image',
        dropdown: false,
        component: (index, append) => <ImageElement index={index} append={append} />,
    },
    {
        id: 6,
        uid: uuid(),
        icon: builder_video_large,
        // elementImage: `${builderVideo}`,
        label: 'Video',
        clicked: false,
        popoverLabel: 'Video',
        name: 'video',
        dropdown: false,
        component: (index, append) => <VideoElement index={index} append={append} />,
    },
    {
        id: 7,
        uid: uuid(),
        icon: builder_button_large,
        // elementImage: `${builderButton}`,
        label: 'Buttons',
        clicked: false,
        popoverLabel: 'Link',
        name: 'buttons',
        dropdown: false,
        component: (index, append) => <Buttons index={index} append={append} />,
    },
    {
        id: 8,
        uid: uuid(),
        icon: builder_attachment_large,
        // elementImage: `${builderLinkBox}`,
        label: 'Link block',
        clicked: false,
        popoverLabel: 'Link-Box',
        name: 'linkBlock',
        dropdown: false,
        component: (index, append) => <LinkBlock index={index} append={append} />,
    },
    {
        id: 9,
        uid: uuid(),
        icon: builder_divider_large,
        // elementImage: `${builderDivider}`,
        label: 'Divider',
        clicked: false,
        popoverLabel: 'Divider',
        name: 'divider',
        dropdown: false,
        component: (index, append) => <Divider index={index} append={append} />,
    },
    {
        id: 10,
        uid: uuid(),
        icon: builder_checkbox_large,
        // elementImage: `${builderElements}`,
        label: 'Icon',
        clicked: false,
        popoverLabel: 'Icon-component',
        name: 'icon',
        dropdown: false,
        component: (index, append) => <IconsElement index={index} append={append} />,
    },
    {
        id: 11,
        uid: uuid(),
        icon: builder_date_time_large,
        // elementImage: `${builderTimer}`,
        label: 'Timer',
        clicked: false,
        popoverLabel: 'Countdown',
        name: 'timer',
        dropdown: false,
        component: (index, append) => <TimerElement index={index} append={append} />,
    },
];

export const ENTIRE_ELEMENETS_DATA = [
    {
        id: 1,
        icon: user_arrow_down_large,
        label: 'Blocks',
        clicked: false,
        colSize: 12,
        type: '',
        popoverLabel: '',
        name: 'blocks',
        component: (index, append, remove, styles) => (
            <BlocksElement index={index} remove={remove} styles={styles} append={append} />
        ),
    },
    {
        id: 2,
        icon: user_call_center_large,
        label: 'Section',
        clicked: false,
        colSize: 12,
        type: '',
        popoverLabel: 'Section',
        name: 'section',
        component: (index, insert, remove, uid, styles, ele) => (
            <SectionElement index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 3,
        icon: alexa_large,
        label: 'Heading',
        clicked: false,
        colSize: 12,
        type: '',
        popoverLabel: 'Header',
        name: 'heading',
        component: (index, insert, remove, uid, styles, ele) => (
            <Heading index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 4,
        icon: builder_text_large,
        label: 'Text',
        clicked: false,
        colSize: 12,
        type: '',
        popoverLabel: 'Text',
        name: 'textField',
        component: (index, insert, remove, uid, styles, ele) => (
            <TextElement index={index} uid={uid} remove={remove} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 5,
        icon: builder_image_large,
        label: 'Image',
        clicked: false,
        colSize: 1,
        type: '',
        popoverLabel: 'Image',
        name: 'image',
        component: (index, insert, remove, uid, styles, ele) => (
            <ImageElement index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 6,
        icon: builder_video_large,
        label: 'Video',
        clicked: false,
        colSize: 12,
        type: '',
        popoverLabel: 'Video',
        name: 'video',
        component: (index, insert, remove, uid, styles, ele) => (
            <VideoElement index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 7,
        icon: builder_button_large,
        label: 'Buttons',
        clicked: false,
        colSize: 2,
        type: '',
        popoverLabel: 'Link',
        name: 'buttons',
        component: (index, insert, remove, uid, styles, ele) => (
            <Buttons index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 8,
        icon: builder_attachment_large,
        label: 'Link Block',
        clicked: false,
        colSize: 2,
        type: '',
        popoverLabel: 'Link-Box',
        name: 'linkBlock',
        component: (index, insert, remove, uid, styles, ele) => (
            <LinkBlock index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 9,
        icon: builder_divider_large,
        label: 'Divider',
        clicked: false,
        colSize: 12,
        type: '',
        popoverLabel: 'Divider',
        name: 'divider',
        component: (index, insert, remove, uid, styles, ele) => (
            <Divider index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 10,
        icon: builder_checkbox_large,
        label: 'Icon',
        clicked: false,
        colSize: 2,
        type: '',
        popoverLabel: 'Icon-component',
        name: 'icon',
        component: (index, insert, remove, uid, styles, ele) => (
            <IconsElement index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 11,
        icon: builder_date_time_large,
        label: 'Timer',
        clicked: false,
        colSize: 12,
        type: '',
        popoverLabel: 'Countdown',
        name: 'timer',
        component: (index, insert, remove, uid, styles, ele) => (
            <TimerElement index={index} remove={remove} uid={uid} styles={styles} insert={insert} ele={ele} />
        ),
    },
    {
        id: 12,
        label: '1 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column1',
        popoverLabel: '1 Column',
        name: 'column1',
        component: (index, insert, remove, uid, styles) => [
            <ColumnData index={index} uid={uid} remove={remove} styles={styles} size={12} insert={insert} />,
        ],
    },
    {
        id: 13,
        label: '2 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column2',
        popoverLabel: '2 Column',
        name: 'column2',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid + 1} size={6} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid + 2} size={6} />,
            ];
        },
    },
    {
        id: 14,
        label: '3 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column3',
        popoverLabel: '3 Column',
        name: 'column3',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={4} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={4} />,
                <ColumnData index={index + 3} remove={remove} styles={styles} uid={uid} size={4} />,
            ];
        },
    },
    {
        id: 15,
        label: '4 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column4',
        popoverLabel: '4 Column',
        name: 'column4',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={3} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={3} />,
                <ColumnData index={index + 3} remove={remove} styles={styles} uid={uid} size={3} />,
                <ColumnData index={index + 4} remove={remove} styles={styles} uid={uid} size={3} />,
            ];
        },
    },
    {
        id: 16,
        label: 'Center Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'columnCenter',
        popoverLabel: 'Center Column',
        name: 'columnCenter',
        component: (index, append, remove, uid, styles) => {
            return [<ColumnData index={index} remove={remove} styles={styles} uid={uid} size={6} />];
        },
    },
    {
        id: 17,
        label: '2/10 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column2_10',
        popoverLabel: '2/10 Column',
        name: 'column2_10',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={2} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={10} />,
            ];
        },
    },
    {
        id: 18,
        label: '10/2 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column10_2',
        popoverLabel: '10/2 Column',
        name: 'column10_2',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={10} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={2} />,
            ];
        },
    },
    {
        id: 19,
        label: '3/9 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column3_9',
        popoverLabel: '3/9 Column',
        name: 'column3_9',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={3} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={9} />,
            ];
        },
    },
    {
        id: 20,
        label: '9/3 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column9_3',
        popoverLabel: '9/3 Column',
        name: 'column9_3',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={9} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={3} />,
            ];
        },
    },
    {
        id: 21,
        label: '4/8 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column4_8',
        popoverLabel: '4/8 Column',
        name: 'column4_8',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={4} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={8} />,
            ];
        },
    },
    {
        id: 22,
        label: '8/4 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column8_4',
        popoverLabel: '8/4 Column',
        name: 'column8_4',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={8} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={4} />,
            ];
        },
    },
    {
        id: 23,
        label: '5/7 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column5_7',
        popoverLabel: '5/7 Column',
        name: 'column5_7',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={5} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={7} />,
            ];
        },
    },
    {
        id: 24,
        label: '7/5 Column',
        clicked: false,
        colSize: 12,
        type: 'Blocks',
        colName: 'column7_5',
        popoverLabel: '7/5 Column',
        name: 'column7_5',
        component: (index, append, remove, uid, styles) => {
            return [
                <ColumnData index={index + 1} remove={remove} styles={styles} uid={uid} size={7} />,
                <ColumnData index={index + 2} remove={remove} styles={styles} uid={uid} size={5} />,
            ];
        },
    },
    {
        id: 25,
        label: 'Call to action 1',
        clicked: false,
        colSize: 12,
        type: 'OpenBlocks',
        colName: 'callToAction1',
        popoverLabel: 'Call to action 1',
        name: 'template1',
        component: (index, append, remove, uid, styles) => {
            return <Template1 index={index} remove={remove} uid={uid} styles={styles} append={append} />;
        },
    },
];

export const COLUMN_DATA_VALUES = {
    column1: [
        {
            id: 25,
            popoverLabel: 'Col-12',
            colSize: 12,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={12}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column2: [
        {
            id: 26,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={6}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 27,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={6}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column3: [
        {
            id: 28,
            popoverLabel: 'Col-4',
            colSize: 4,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={4}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 29,
            popoverLabel: 'Col-4',
            colSize: 4,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={4}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 30,
            popoverLabel: 'Col-4',
            colSize: 4,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={4}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column4: [
        {
            id: 31,
            popoverLabel: 'Col-3',
            colSize: 3,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={3}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 32,
            popoverLabel: 'Col-3',
            colSize: 3,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={3}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 33,
            popoverLabel: 'Col-3',
            colSize: 3,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={3}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 34,
            popoverLabel: 'Col-3',
            colSize: 3,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={3}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    columnCenter: [
        {
            id: 35,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={6}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column2_10: [
        {
            id: 36,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={2}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 37,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={10}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column10_2: [
        {
            id: 38,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={10}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 39,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={2}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column3_9: [
        {
            id: 40,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={3}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 41,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={9}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column9_3: [
        {
            id: 42,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={9}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 43,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={3}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column4_8: [
        {
            id: 44,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={4}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 45,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={8}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column8_4: [
        {
            id: 46,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={8}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 47,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={4}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column5_7: [
        {
            id: 48,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={5}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 49,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={7}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
    column7_5: [
        {
            id: 50,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={7}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
        {
            id: 51,
            popoverLabel: 'Col-6',
            colSize: 6,
            type: 'Blocks',
            component: (index, insert, remove, uid, styles, ele) => (
                <ColumnData
                    index={index}
                    remove={remove}
                    styles={styles}
                    uid={uid}
                    size={5}
                    insert={insert}
                    ele={ele}
                />
            ),
        },
    ],
};

export const LANDING_PAGE_OPEN_TABS = [
    {
        id: "rs_data_circle_pencil",
        // text: 'Open style manager',
        icon: `${circle_pencil_medium} icon-md`,
        component: () => <OpenStyleManager />,
    },
    {
        id: '2',
        // text: 'Open layer manager',
        icon: `${menu_dot_medium} icon-md`,
        component: () => <OpenLayerManager />,
    },
    {
        id: '3',
        // text: 'Open blocks',
        icon: `${webinar_medium} icon-md`,
        component: () => <OpenBlocks />,
    },
    {
        id: '4',
        // text: 'Open blocks',
        icon: `${settings_medium} icon-md`,
        component: () => <PageSettings />,
    },
];

export const LANDING_PAGE_RESPONSIVE_TABS = [
    {
        id: '1',
        //text: 'Desktop',
        tooltiptext: 'Desktop',
        tooltipPosition: 'bottom',
        icon: `${mobile_notification_medium} icon-md`,
        component: () => { },
        width: '100%',
        deviceType: 'desktop',
    },
    {
        id: '2',
        //text: 'Ipad',
        tooltiptext: 'iPad',
        tooltipPosition: 'bottom',
        icon: `${mobile_notification_medium} icon-md`,
        component: () => { },
        width: '75%',
        deviceType: 'ipad',
    },
    {
        id: '3',
        //text: 'Mobile',
        tooltiptext: 'Mobile',
        tooltipPosition: 'bottom',
        icon: `${mobile_notification_medium} icon-md`,
        component: () => { },
        width: '50%',
        deviceType: 'mobile',
    },
];
