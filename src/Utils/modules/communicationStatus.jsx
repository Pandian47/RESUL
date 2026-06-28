import { alert_medium, circle_close_medium, circle_key_fill_medium, circle_tick_medium, circle_time_medium, communication_draft_medium, in_progress_medium, pause_medium, play_fill_medium, play_medium, stop_fill_medium, time_medium, user_reject_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTooltip from 'Components/RSTooltip';

export const campaignProgressStatus = {
    1: {
        color: 'color-primary-green',
        rsClass: 'status-success',
        icon: 'icon-rs-tick-small icons-md',
        rsIcon: circle_tick_medium,
    },
    2: {
        color: 'color-primary-green',
        rsClass: 'status-success',
        icon: 'icon-rs-tick-small icons-md',
        rsIcon: circle_tick_medium,
    },
    3: {
        color: 'color-primary-green',
        rsClass: 'status-success',
        icon: 'icon-rs-tick-small icons-md',
        rsIcon: circle_tick_medium,
    },
    4: {
        color: 'color-primary-green',
        rsClass: 'status-success',
        icon: 'icon-rs-tick-small icons-md',
        rsIcon: circle_tick_medium,
    },
    5: {
        color: 'color-primary-green',
        rsClass: 'status-completed',
        icon: 'icon-rs-time-small icons-md',
        rsIcon: circle_time_medium,
    },
    6: {
        color: 'color-primary-green',
        rsClass: 'status-completed',
        icon: 'icon-rs-time-small icons-md',
        rsIcon: circle_time_medium,
    },
    7: {
        color: 'color-primary-orange',
        rsClass: 'status-warning',
        icon: 'icon-rs-alert-fill-small icons-md',
        rsIcon: alert_medium,
    },
    8: {
        color: 'color-primary-orange',
        rsClass: 'status-warning',
        icon: 'icon-rs-alert-fill-small icons-md',
        rsIcon: alert_medium,
    },
    9: {
        color: 'color-primary-red',
        rsClass: 'status-warning',
        icon: 'icon-rs-alert-fill-small icons-md',
        rsIcon: alert_medium,
    },
    10: {
        color: 'color-primary-orange',
        rsClass: 'status-warning',
        icon: 'icon-rs-alert-fill-small icons-md',
        rsIcon: alert_medium,
    },
    11: {
        color: 'color-primary-orange',
        rsClass: 'status-warning',
        icon: 'icon-rs-alert-fill-small icons-md',
        rsIcon: alert_medium,
    },
    12: {
        color: 'color-primary-orange',
        rsClass: 'status-warning',
        icon: 'icon-rs-alert-fill-small icons-md',
        rsIcon: alert_medium,
    },
    13: {
        color: 'color-primary-orange',
        rsClass: 'status-warning',
        icon: 'icon-rs-alert-fill-small icons-md',
        rsIcon: alert_medium,
    },
    14: {
        color: 'color-primary-red',
        rsClass: 'status-error',
        icon: 'icon-rs-close-small icons-md',
        rsIcon: circle_close_medium,
    },
    15: {
        color: 'color-primary-red',
        rsClass: 'status-error',
        icon: 'icon-rs-close-small icons-md',
        rsIcon: circle_close_medium,
    },
    16: {
        color: 'color-primary-orange',
        rsClass: 'status-error',
        icon: 'icon-rs-close-small icons-md',
        rsIcon: circle_close_medium,
    },
    17: {
        color: 'color-primary-orange',
        rsClass: 'status-error',
        icon: 'icon-rs-close-small icons-md',
        rsIcon: circle_close_medium,
    },
    18: {
        color: 'color-primary-orange',
        rsClass: 'status-error',
        icon: 'icon-rs-time-small icons-md',
        rsIcon: circle_time_medium,
    },
    19: {
        color: 'color-primary-orange',
        rsClass: 'status-error',
        icon: 'icon-rs-fire-small icons-md',
        rsIcon: circle_key_fill_medium,
    },
    20: {
        color: 'color-primary-orange',
        rsClass: 'status-error',
        icon: 'icon-rs-fire-small icons-md',
        rsIcon: circle_key_fill_medium,
    },
};

export function getIconByStatus(statusId) {
    switch (statusId) {
        case 2:
            return {
                icon: `${alert_medium} icon-md  color-alert `,
                title: 'Communication inactive',
            };
        case 6:
        case 1003:
            return {
                icon: `${communication_draft_medium} icon-md color-draft`,
                title: 'Draft',
            };
        case 5:
            return {
                icon: `${in_progress_medium} icon-md color-inprogress `,
                title: 'In progress',
            };
        case 7:
            return {
                icon: `${time_medium} icon-md color-scheduled `,
                title: 'Scheduled',
            };
        case 9:
            return {
                icon: `${circle_tick_medium} icon-md color-completed `,
                title: 'Completed',
            };
        case 12:
            return {
                icon: `${alert_medium} icon-md color-alert `,
                title: 'Pending for approval',
            };
        case 26:
            return {
                icon: `${stop_fill_medium} icon-md color-stop `,
                title: 'Stop',
            };
        case 27:
            return {
                icon: `${pause_medium} icon-md color-pause `,
                title: 'Pause',
            };
        case 28:
            return {
                icon: `${play_medium} icon-md color-play `,
                title: 'Start',
            };
        case 51:
            return {
                icon: `${user_reject_medium} icon-md  color-reject `,
                title: 'Rejected',
            };
        case 1006:
            return {
                icon: `${alert_medium} icon-md  color-secondary-green `,
                title: 'Approved',
            };
        case 52:
            return {
                icon: `${alert_medium} icon-md  color-alert `,
                title: 'Alert',
            };
        case 54:
            return {
                icon: `${alert_medium} icon-md  color-stop `,
                title: 'On Hold',
            };
        default:
            return {
                icon: `${communication_draft_medium} icon-md color-draft `,
                title: 'Draft',
            };
    }
}
export function getIndexBasedOnCampaign(type) {
    if (type === 'S') return 0;
    else if (type === 'M') return 1;
    return 2;
}

export function getStatus(id = 0) {
    switch (id) {
        case 0:
        case 'Unknown':
            return {
                status: 'Unknown',
                className: 'status-draft',
            };
        case 1:
        case 'Active':
            return {
                status: 'Active',
                className: 'status-draft',
            };
        case 2:
        case 'Inactive':
            return {
                status: 'Inactive',
                className: 'status-draft',
            };
        case 3:
        case 'Delete':
            return {
                status: 'Delete',
                className: 'status-alert',
            };
        case 4:
        case 'InComplete':
            return {
                status: 'InComplete',
                className: 'status-alert',
            };
        case 5:
        case 'In progress':
            return {
                status: 'In progress',
                className: 'status-inprogress',
            };
        case 6:
        case 'Draft':
            return {
                status: 'Draft',
                className: 'status-draft',
            };
        case 7:
        case 'Scheduled':
            return {
                status: 'Scheduled',
                className: 'status-scheduled',
            };
        case 8:
        case 'Sent':
            return {
                status: 'Sent',
                className: 'status-scheduled',
            };
        case 9:
        case 'Completed':
            return {
                status: 'Completed',
                className: 'status-completed',
            };
        case 12:
        case 'PendingForApproval':
            return {
                status: 'Request for approval',
                className: 'status-alert',
            };
        case 20:
        case 'Multi status':
            return {
                status: 'Multi status',
                className: 'status-multistatus',
            };
        case 26:
        case 'Stop':
            return {
                status: 'Stopped',
                className: 'status-stop',
            };
        case 27:
        case 'pause':
            return {
                status: 'Paused',
                className: 'status-pause',
            };
        case 52:
        case 'Alert':
            return {
                status: 'Alert',
                className: 'status-alert',
            };
        case 45:
        case 'Extraction':
            return {
                status: 'Extraction',
                className: 'status-extraction',
            };
        case 51:
        case 'Reject ':
            return {
                status: 'Rejected',
                className: 'status-reject',
            };
        case 70:
        case 'Archive':
            return {
                status: 'Archived',
                className: 'status-archive',
            };
        default:
            return {
                status: 'Draft',
                className: 'status-draft',
            };
    }
}


function getTriggerIcons(id) {
    if (id === 28)
        return {
            id: 28,
            icon: (
                <RSTooltip text={'Play'} innerContent={false} wrapperTag="span">
                    <i className={`${play_fill_medium} icon-md cp`} />
                </RSTooltip>
            ),

            type: 'start',
        };
    else if (id === 27)
        return {
            id: 27,
            icon: (
                <RSTooltip text={'Pause'} innerContent={false} wrapperTag="span">
                    <i className={`${pause_medium} icon-md cp`} />
                </RSTooltip>
            ),

            type: 'pause',
        };
    return {
        id: 26,
        icon: (
            <RSTooltip text={'Stop'} innerContent={false} wrapperTag="span">
                <i className={`${stop_fill_medium} icon-md cp`} />
            </RSTooltip>
        ),

        type: 'stop',
    };
}
export function getPausePlayTrigger(id, { isScheduled = false } = {}) {
    if (isScheduled) {
        const effectiveId = id === 27 ? 28 : id;
        switch (effectiveId) {
            case 28:
                return {
                    options: [getTriggerIcons(26)],
                    defaultItem: getTriggerIcons(28),
                };
            case 26:
                return {
                    options: [getTriggerIcons(28)],
                    defaultItem: getTriggerIcons(26),
                };
            default:
                return {
                    options: [getTriggerIcons(26)],
                    defaultItem: getTriggerIcons(28),
                };
        }
    }
    switch (id) {
        case 28:
            return {
                options: [getTriggerIcons(27), getTriggerIcons(26)],
                defaultItem: getTriggerIcons(28),
            };
        case 27:
            return {
                options: [getTriggerIcons(28), getTriggerIcons(26)],
                defaultItem: getTriggerIcons(27),
            };
        case 26:
            return {
                options: [getTriggerIcons(28), getTriggerIcons(27)],
                defaultItem: getTriggerIcons(26),
            };
        default:
            return {
                options: [getTriggerIcons(27), getTriggerIcons(26)],
                defaultItem: getTriggerIcons(28),
            };
    }
}
export function getCommunicationType(text = '', communicationConfigDetail) {
    const communicationAttributes = communicationConfigDetail?.communicationType;

    if (communicationAttributes?.length) {
        const findAttribute = communicationAttributes?.find(
            (attribute) => attribute?.attributename?.toLowerCase() === text?.toLowerCase(),
        );
        if (findAttribute) {
            return findAttribute?.campaignAttributeId;
        }
    }

    text = text?.toLowerCase();
    if (text?.startsWith('awa')) return 1;
    else if (text?.startsWith('new')) return 2;
    else if (text?.startsWith('pro')) return 3;
    else if (text?.startsWith('lead')) return 4;
    else if (text?.startsWith('gre')) return 5;
    else if (text?.startsWith('web')) return 6;
    else if (text?.startsWith('act')) return 7;
    else if (text?.startsWith('acq')) return 8;
    else if (text?.startsWith('cro')) return 9;
    else if (text?.startsWith('usa')) return 10;
    else if (text?.startsWith('ret')) return 11;
    else if (text?.startsWith('ser')) return 12;
    return 0;
}
