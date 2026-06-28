import { ch_dark_green, ch_dark_red, ch_facebook, ch_google_plus, ch_head_band_color, ch_heavy_dark_blue, ch_light_blue, ch_medium_red, ch_secondary_blue, ch_secondary_orange, ch_youtube } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { CLOSE, SANKEY_GRID } from 'Constants/GlobalConstant/Placeholders';
import RSIcon from 'Components/RSIcon';
import RSTooltip from 'Components/RSTooltip';
export const SPLIT_DATA = [
    { id: 'splitA', name: 'Split A' },
    { id: 'splitB', name: 'Split B' },
    { id: 'actualCommunication', name: 'Actual communication' },
];

export const sankeyGrid = (state) => {
    return (
        <>
            <div>{SANKEY_GRID}</div>
            <div
                onClick={() =>
                    state({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isShowSankey',
                    })
                }
            >
                <RSTooltip text={CLOSE} position="top">
                    <RSIcon className="icon-md color-primary-blue" />
                </RSTooltip>
            </div>
        </>
    );
};

export const stateReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE':
        case 'MULTIPLE':
            return {
                ...state,
                [action.field]: action.payload,
            };
        default:
            return state;
    }
};

export const getBackgroundColor = {
    facebook: ch_facebook,
    facebookApp: ch_facebook,
    twitter: ch_light_blue,
    pinterest: ch_medium_red,
    linkedIn: ch_heavy_dark_blue,
    googleanalytics: ch_google_plus,
    resulticksanalytics: ch_head_band_color,
    webtrends: ch_heavy_dark_blue,
    omniture: ch_dark_green,
    appanalytics: ch_secondary_blue,
    amazonEcho: ch_secondary_blue,
    googleHome: ch_secondary_blue,
    youtube: ch_youtube,
    vimeo: ch_secondary_blue,

    //Webinar
    webex: ch_dark_green,
    gotoMeeting: ch_secondary_orange,
    eventbrite: ch_dark_red,
};
