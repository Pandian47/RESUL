import {
    SkeletonSnippets,
    ColorSnippets,
    IconCircle,
    SIcons,
    SIconsProps,
} from './Components/Snippets/Snippets';
import {
    commonColors,
    solidBlueColors,
    solidGreenColors,
    solidOrangeColors,
    solidYellowColors,
    solidRedColors,
    solidBlueGreenColors,
    solidGreyColors,
    solidPinkColors,
    solidPurpleColors,
    communicationStatusColors,
    AudienceListColors,
    ChannelColors,
    ChannelColors2,
    SourceColors,
    sentimentColors,
    weekColors,
    dayColors,
    deviceColors,
    knwonColors,
    othersColors,
    chartCommonColors,
} from './Components/Snippets/Colors/ColorsData';
import { FontFamilySnippets, FontSnippets, IconSnippets } from './Components/Snippets/Font/Font';
import { fontFamily, iconData, fontData } from './Components/Snippets/Font/FontData';
import GlypIcons from './Components/Snippets/Glyphicons/Glyphicons';
import {
    glyphIconMini,
    glyphIconMedium,
    glyphIconLarge,
    glyphIconXLarge,
} from './Components/Snippets/Glyphicons/GlyphiconsData-v5.0';

const sampleStructure = {
    key: [
        {
            type: 'title1',
            value: ``,
        },
        {
            type: 'title2',
            value: ``,
        },
        {
            type: 'title3',
            value: ``,
        },
        {
            type: 'table',
            value: {
                head: {
                    key: '',
                    value: '',
                },
                body: [
                    {
                        key: '',
                        value: '',
                    },
                    {
                        key: '',
                        value: '',
                    },
                ],
            },
        },
        {
            type: 'code',
            value: `android {
                compileSdkVersion 24
                buildToolsVersion '25.0.0'
                defaultConfig {
                  …
                  …
                  …
                 }
             }`,
        },
        {
            type: 'note',
            value: ``,
        },
    ],
};

export const brand = 'R'; // CAPS = 'R': resulticks or 'S': smartdx
export const projectTitle = 'RESUL'; // Header title

export const overallData = {
    Introduction: [
        {
            type: 'title1',
            value: `Introduction`,
        },
        {
            type: 'body',
            value: `The RESUL analytics module is a value-added analytics service to track and report website as well as Native app traffic, besides app behavior. Integration to the Analytics module enables a broad range of benefits such as user journey reporting, augmentation of customer data, and creating trigger campaigns. The foundation of Analytic services rests on the capture of data using the RESUL software development kit (SDK). It involves generating the SDK code snippet from the application and embedding it onto a destination point(s) in a website and mobile app.`,
        },
    ],
    Skeleton: [
        {
            type: 'title1',
            value: 'Colors',
        },
        {
            type: 'component',
            value: <SkeletonSnippets />,
        },
    ],
    Colors: [
        {
            type: 'title1',
            value: 'Colors',
        },
        {
            type: 'title2',
            value: 'Common',
        },
        {
            type: 'component',
            value: <ColorSnippets data={commonColors} />,
        },
        {
            type: 'title2',
            value: 'Solid colors',
        },
        {
            type: 'title3',
            value: 'Blue',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidBlueColors} />,
        },
        {
            type: 'title3',
            value: 'Green',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidGreenColors} />,
        },
        {
            type: 'title3',
            value: 'Orange',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidOrangeColors} />,
        },
        {
            type: 'title3',
            value: 'Yellow',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidYellowColors} />,
        },
        {
            type: 'title3',
            value: 'Red',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidRedColors} />,
        },
        {
            type: 'title3',
            value: 'Blue green',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidBlueGreenColors} />,
        },
        {
            type: 'title3',
            value: 'Grey',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidGreyColors} />,
        },
        {
            type: 'title3',
            value: 'Pink',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidPinkColors} />,
        },
        {
            type: 'title3',
            value: 'Purple',
        },
        {
            type: 'component',
            value: <ColorSnippets data={solidPurpleColors} />,
        },
        {
            type: 'title2',
            value: 'Communication Status',
        },
        {
            type: 'component',
            value: <ColorSnippets data={communicationStatusColors} />,
        },
        {
            type: 'title2',
            value: 'Audience List',
        },
        {
            type: 'component',
            value: <ColorSnippets data={AudienceListColors} />,
        },
        {
            type: 'title2',
            value: 'Channel',
        },
        {
            type: 'component',
            value: <ColorSnippets data={ChannelColors} />,
        },
        {
            type: 'title2',
            value: 'Channel 2',
        },
        {
            type: 'component',
            value: <ColorSnippets data={ChannelColors2} />,
        },
        {
            type: 'title2',
            value: 'Source',
        },
        {
            type: 'component',
            value: <ColorSnippets data={SourceColors} />,
        },
        {
            type: 'title2',
            value: 'Sentiment',
        },
        {
            type: 'component',
            value: <ColorSnippets data={sentimentColors} />,
        },
        {
            type: 'title2',
            value: 'Weeks',
        },
        {
            type: 'component',
            value: <ColorSnippets data={weekColors} />,
        },
        {
            type: 'title2',
            value: 'Day',
        },
        {
            type: 'component',
            value: <ColorSnippets data={dayColors} />,
        },
        {
            type: 'title2',
            value: 'Device',
        },
        {
            type: 'component',
            value: <ColorSnippets data={deviceColors} />,
        },
        {
            type: 'title2',
            value: 'Knwon',
        },
        {
            type: 'component',
            value: <ColorSnippets data={knwonColors} />,
        },
        {
            type: 'title2',
            value: 'Others',
        },
        {
            type: 'component',
            value: <ColorSnippets data={othersColors} />,
        },
        {
            type: 'title2',
            value: 'Chart Common',
        },
        {
            type: 'component',
            value: <ColorSnippets data={chartCommonColors} />,
        },
    ],
    Fonts: [
        {
            type: 'title1',
            value: 'Font family',
        },
        {
            type: 'component',
            value: <FontFamilySnippets data={fontFamily} />,
        },
        {
            type: 'title1',
            value: 'Icon',
        },
        {
            type: 'component',
            value: <IconSnippets data={iconData} />,
        },
        {
            type: 'title1',
            value: 'Font',
        },
        {
            type: 'component',
            value: <FontSnippets data={fontData} />,
        },
    ],
    Glyphicons: [
        {
            type: 'title1',
            value: 'Icons only',
        },
        {
            type: 'title2',
            value: 'Mini',
        },
        {
            type: 'component',
            value: <IconCircle data={glyphIconMini} size="sm" />,
        },
        {
            type: 'title2',
            value: 'Medium',
        },
        {
            type: 'component',
            value: <IconCircle data={glyphIconMedium} size="md" />,
        },
        {
            type: 'title2',
            value: 'Large',
        },
        {
            type: 'component',
            value: <IconCircle data={glyphIconLarge} size="lg" />,
        },
        {
            type: 'title2',
            value: 'XLarge',
        },
        {
            type: 'component',
            value: <IconCircle data={glyphIconXLarge} size="xl" />,
        },
        {
            type: 'title1',
            value: 'Icons variable',
        },
        {
            type: 'title2',
            value: 'Mini variable',
        },
        {
            type: 'component',
            value: <GlypIcons data={glyphIconMini} size="sm" />,
        },
        {
            type: 'title2',
            value: 'Medium variable',
        },
        {
            type: 'component',
            value: <GlypIcons data={glyphIconMedium} size="md" />,
        },
        {
            type: 'title2',
            value: 'Large variable',
        },
        {
            type: 'component',
            value: <GlypIcons data={glyphIconLarge} size="lg" />,
        },
        {
            type: 'title2',
            value: 'XLarge variable',
        },
        {
            type: 'component',
            value: <GlypIcons data={glyphIconXLarge} size="xl" />,
        },
    ],
    'Icon component': [
        {
            type: 'title1',
            value: 'Icon',
        },
        {
            type: 'component',
            value: <SIcons />,
        },
        {
            type: 'title2',
            value: 'Icon props',
        },
        {
            type: 'component',
            value: <SIconsProps />,
        },
    ],
    'Preffered sizes': [
        {
            type: 'table',
            value: {
                head: {
                    key: 'S.no',
                    value: 'Size',
                },
                body: [
                    { key: '1', value: '1' },
                    { key: '2', value: '2' },
                    { key: '3', value: '3' },
                    { key: '4', value: '5' },
                    { key: '5', value: '11' },
                    { key: '6', value: '14' },
                    { key: '7', value: '15' },
                    { key: '8', value: '17' },
                    { key: '9', value: '19' },
                    { key: '10', value: '21' },
                    { key: '11', value: '23' },
                    { key: '12', value: '24' },
                    { key: '13', value: '25' },
                    { key: '14', value: '27' },
                    { key: '15', value: '32' },
                    { key: '16', value: '33' },
                    { key: '17', value: '37' },
                    { key: '18', value: '41' },
                    { key: '19', value: '45' },
                    { key: '20', value: '50' },
                    { key: '21', value: '66' },
                    { key: '22', value: '99' },
                ],
            },
        },
    ],
};
