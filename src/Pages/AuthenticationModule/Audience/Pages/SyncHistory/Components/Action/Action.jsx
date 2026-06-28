import { alert_medium, checkbox_medium, in_progress_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTooltip from 'Components/RSTooltip';

const getStatusConfig = (importStatus, isInvalid) => {
    const configs = {
        inprogress: {
            icon: in_progress_medium,
            color: 'color-inprogress pointer-event-none',
            tooltip: 'Inprogress',
        },
        error: {
            icon: alert_medium,
            color: 'color-notification pointer-event-none',
            tooltip: 'Error',
        },
        invalid: {
            icon: alert_medium,
            color: 'color-notification',
            tooltip: 'Alert',
        },
        success: {
            icon: checkbox_medium,
            color: 'color-primary-green pointer-event-none',
            tooltip: 'Imported successfully',
        },
    };

    if (importStatus === 'In progress') return configs.inprogress;
    if (importStatus === 'Error') return configs.error;
    if (isInvalid) return configs.invalid;
    return configs.success;
};

const Action = ({ importStatus, isInvalid = false}) => {
    const { icon, color, tooltip } = getStatusConfig(importStatus, isInvalid);

    return (
        <div className="d-flex gap-2">
            <RSTooltip text={tooltip} position="top" className="lh0 mr10" innerContent={false}>
                <i className={`${icon} icon-md ${color}`} />
            </RSTooltip>
        </div>
    );
};

export default Action;
