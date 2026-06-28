import { baseURL, BASEURLRUN, BASEURLRUN19, BASEURLTEAM } from 'Constants/EndPoints';
const PUSH_CHANNELS_DISABLED_ENVS = ['TEAM', 'RUN', 'RUN19'];

export function getEnvironment() {
    switch (baseURL) {
        case BASEURLTEAM:
            return 'TEAM';
        case BASEURLRUN19:
            return 'RUN19';
        case BASEURLRUN:
            return 'RUN';
        default:
            return 'RUN';
    }
}

export function isPushChannelsDisabled(env = getEnvironment()) {
    return PUSH_CHANNELS_DISABLED_ENVS.includes(env);
}
