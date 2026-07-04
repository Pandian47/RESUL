import { MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { EVENT_TRIGGER, EVENT_TRIGGER_DESCRIPTION, MULTI_DIMENSION, MULTI_DIMENSION_DESCRIPTION, SINGLE_DIMENSION, SINGLE_DIMENSION_DESCRIPTION } from 'Constants/GlobalConstant/Placeholders';
import { communication_mdc_xlarge, communication_sdc_xlarge, communication_trigger_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import DeliveryMethod from './Tabs/DeliveryMethod';
import { getDynamicList } from 'Reducers/communication/createCommunication/plan/request';
import { debounce } from 'Utils/modules/lodashReplacements';

export const COMMUNICATION_NAME = 'Communication name';
export const PRODUCT_TYPE = 'Product & sub product types';
export const PRIMARY_GOAL = 'Primary goal';
export const SECONDARY_GOAL = 'Secondary goal';
export const ROI = 'ROI';
export const COMMUNICATION_PERIOD = 'Communication period';
export const CHANNEL_TYPE = 'Channel type';
export const ANALYTICS_TYPE = 'Analytics type';
export const DYNAMIC_LIST = 'Dynamic list';
export const FREQUENCY = 'Frequency';
export const TIMEZONE = 'Time zone';
export const CANCEL = 'Cancel';
export const SAVE = 'Save';
export const NEXT = 'Next';
export const OK = 'OK';
export const GOAL_INFO_TITLE = 'Communication goal info';
export const GOAL_INFO_DESCRIPTION = 'Secondary goal will not be considered as the communication target.';
export const TAGS_SMALL =
    'Enter a friendly name with comma separator.<br />Max. 5 friendly names allowed, with the limit of ' +
    MAX_LENGTH +
    ' characters.';

export const referenceRequired = 'Communication reference is required'

export const planningSteps = [
    {
        step: 1,
        status: 'inprogress',
        stepTitle: 'Plan',
    },
    {
        step: 2,
        status: '',
        stepTitle: 'Create',
    },
    {
        step: 3,
        status: '',
        stepTitle: 'Execute',
    },
];

export const planningStepsExecute = [
    {
        step: 1,
        status: 'completed',
        stepTitle: 'Plan',
    },
    {
        step: 2,
        status: 'completed',
        stepTitle: 'Create',
    },
    {
        step: 3,
        status: 'completed',
        stepTitle: 'Calculate ROI',
    },
    {
        step: 4,
        status: 'inprogress',
        stepTitle: 'Execute',
    },
];

export const DELIVERY_TYPE_TAB_CONFIG = [
    {
        id: 'Single dimension',
        text: SINGLE_DIMENSION,
        icon: `${communication_sdc_xlarge} icon-xl color-primary-blue`,
        component: () => <DeliveryMethod type="single" />,
        infocontent: SINGLE_DIMENSION_DESCRIPTION,
        // tooltiptext: 'Setup and execute communications across multi channels',
        disable: false,
    },
    {
        id: 'Multi dimension',
        text: MULTI_DIMENSION,
        icon: `${communication_mdc_xlarge} icon-xl color-primary-blue`,
        component: () => <DeliveryMethod type="multi" />,
        infocontent: MULTI_DIMENSION_DESCRIPTION,
        // tooltiptext: 'Setup and execute communications branching, multi-channel communications',
        disable: false,
    },
    {
        id: 'Event trigger',
        text: EVENT_TRIGGER,
        icon: `${communication_trigger_xlarge} icon-xl color-primary-blue`,
        component: () => <DeliveryMethod type="event" />,
        infocontent: EVENT_TRIGGER_DESCRIPTION,
        // tooltiptext: 'Setup and execute communications triggered by external events',
        disable: false,
    },
];
export function formatColumnName(name) {
    return name?.replace(/(\S+)\s(.*)/, (_, first, rest) => {
        const formattedRest = rest
            .split(' ')
            .map((word) => (word === word.toUpperCase() ? word : word.toLowerCase()))
            .join(' ');
        return `${first} ${formattedRest}`;
    });
}

export const debouncedHandleDynamicListFilterChange = debounce(async (dispatch, payload) => {
    if (payload?.filterText?.length > 3) {
        await dispatch(
            getDynamicList({
                payload,
                loading: false,
            }),
        );
    }
}, 1000);
