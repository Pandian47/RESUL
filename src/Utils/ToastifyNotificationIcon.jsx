import { alert_medium, circle_close_medium, circle_info_medium, circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
/**
 * Toast icons aligned with RSHeader Notifications (campaignProgressStatus glyphs + rs-notification-icon-wrapper).
 */
export function ToastifyNotificationIcon({ type }) {
    const wrap = (rsClass, iconClass) => (
        <div className={`${rsClass} rs-notification-icon-wrapper`}>
            <i className={`${iconClass} icon-md`} aria-hidden />
        </div>
    );

    switch (type) {
        case 'success':
            return wrap('status-success', circle_tick_medium);
        case 'info':
            return wrap('status-info', circle_info_medium);
        case 'error':
            return wrap('status-error', circle_close_medium);
        case 'warning':
            return wrap('status-warning', alert_medium);
        default:
            return wrap('status-success', circle_tick_medium);
    }
}
