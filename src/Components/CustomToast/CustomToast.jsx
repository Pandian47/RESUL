import { alert_large, popup_close_circle_fill_medium, popup_close_circle_medium, thumbs_up_large } from 'Constants/GlobalConstant/Glyphicons';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import RSIcon from 'Components/RSIcon';
import { RSPrimaryButton } from 'Components/Buttons';
import './CustomToast.scss';

const TOAST_DURATION_MS = 2000;

const CustomToast = ({ t, message, buttonText, navigateTo, onButtonClick, showButton = true, isErrorToastMsg = false }) => {
    const navigate = useNavigate();
    const durationMs = t?.duration ?? TOAST_DURATION_MS;

    const handleClick = () => {
        if (onButtonClick && typeof onButtonClick === 'function') {
            onButtonClick();
        } else if (navigateTo) {
            navigate(navigateTo);
        }
        toast.dismiss(t.id);
    };

    const handleClose = () => {
        toast.dismiss(t.id);
    };

    return (
        <div className="custom-toast">
            {isErrorToastMsg ? <div className="custom-error-toast-icon">
                <i className={`${alert_large} icon-lg`}></i>
            </div> :
                <div className="custom-toast-icon">
                    <i className={`${thumbs_up_large} icon-lg`}></i>
                </div>}

            <div className="custom-toast-content">
                <p className="custom-toast-message">{message}</p>
                {showButton && buttonText && (
                    <RSPrimaryButton onClick={handleClick} className="custom-toast-button">
                        {buttonText}
                    </RSPrimaryButton>
                )}
            </div>
            <div onClick={handleClose} className="custom-toast-close">
                <RSIcon
                    className="icon-md color-primary-blue"
                    closeTooltipPosition="left"
                    defaultItem={popup_close_circle_medium}
                    hoverItem={popup_close_circle_fill_medium}
                />
            </div>
            <div
                className="custom-toast-progress"
                aria-hidden="true"
                style={{ '--toast-duration': `${durationMs + 1000}ms` }}
            >
                <span className={`custom-toast-progress-bar ${isErrorToastMsg ? 'error-bar': ""}`} />
            </div>
        </div>
    );
};

// Toaster Container Component
export const ToasterContainer = () => {
    return (
        <Toaster
            position="top-right"
            containerStyle={{
                top: '100px',
                zIndex: 9999,
            }}
            toastOptions={{
                duration: TOAST_DURATION_MS,
                style: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0,
                },
            }}
        />
    );
};

// Helper function to show toast
// message (string), buttonText (string), navigateTo (string path), showButton (bool), onButtonClick (function), isErrorToastMsg (bool), duration (number)
export const showToast = (message, buttonText = null, navigateTo = null, showButton = true, onButtonClick = null, isErrorToastMsg = false, duration = TOAST_DURATION_MS) => {
    toast.custom((t) => (
        <CustomToast
            t={t}
            message={message}
            buttonText={buttonText}
            navigateTo={navigateTo}
            onButtonClick={onButtonClick}
            showButton={showButton}
            isErrorToastMsg={isErrorToastMsg}
        />
    ), {
        duration: duration
    });
};

export default CustomToast;
