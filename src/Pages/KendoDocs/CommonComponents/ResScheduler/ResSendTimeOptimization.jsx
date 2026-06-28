import PropTypes from 'prop-types';
import {
    ICON_CIRCLE_ARROW_RIGHT,
    LABEL_CANCEL,
    LABEL_PROCEED,
    TEXT_SEND_TIME_OPTIMIZATION,
    TEXT_THIS_COMMUNICATION_WILL_BE_SENT,
    TEXT_THIS_FEATURE_IS_NOT_RECOMMENDED,
    TEXT_IF_QUIET_TIME,
} from './constant';

const OVERLAY_ROOT = 'res-kendo-scheduler';

const ResSendTimeOptimization = ({ onAgree = () => {}, oncancel = () => {} }) => (
    <div className={`${OVERLAY_ROOT}__overlay`}>
        <div className={`${OVERLAY_ROOT}__overlay-bg`} />
        <div className={`${OVERLAY_ROOT}__overlay-content`}>
            <div className={`${OVERLAY_ROOT}__overlay-body`}>
                <h1 className={`${OVERLAY_ROOT}__overlay-title`}>
                    {TEXT_SEND_TIME_OPTIMIZATION}:
                </h1>
                <ul className={`${OVERLAY_ROOT}__overlay-list`}>
                    <li>
                        <i className={`${ICON_CIRCLE_ARROW_RIGHT} icon-xs color-white`} />
                        <span>{TEXT_THIS_COMMUNICATION_WILL_BE_SENT}</span>
                    </li>
                    <li>
                        <i className={`${ICON_CIRCLE_ARROW_RIGHT} icon-xs color-white`} />
                        <span>{TEXT_THIS_FEATURE_IS_NOT_RECOMMENDED}</span>
                    </li>
                    <li>
                        <i className={`${ICON_CIRCLE_ARROW_RIGHT} icon-xs color-white`} />
                        <span>{TEXT_IF_QUIET_TIME}</span>
                    </li>
                </ul>
                <div className={`${OVERLAY_ROOT}__overlay-actions`}>
                    <button
                        type="button"
                        className={`${OVERLAY_ROOT}__btn ${OVERLAY_ROOT}__btn--secondary`}
                        id="rs_SendTimeoptimization_Cancel"
                        onClick={() => oncancel(false)}
                    >
                        {LABEL_CANCEL}
                    </button>
                    <button
                        type="button"
                        className={`${OVERLAY_ROOT}__btn ${OVERLAY_ROOT}__btn--primary`}
                        id="rs_SendTimeoptimization_agree_proceed"
                        onClick={() => onAgree(true)}
                    >
                        {LABEL_PROCEED}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

ResSendTimeOptimization.propTypes = {
    onAgree: PropTypes.func,
    oncancel: PropTypes.func,
};

export default ResSendTimeOptimization;
