import { alert_medium, circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
const OTPalertPopup = ({ show, isSuccess, children, className = '' }) => {
    if (!show) return null;

    return (
        <div
            className={`alert align-items-stretch border-r7 ${isSuccess ? 'alert-success' : 'alert-warning'} ${className}`}
        >
            <i
                className={`position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${
                    isSuccess ? circle_tick_medium : alert_medium
                } ${isSuccess ? 'bg-green-medium' : 'bg-orange-medium'} icon-md`}
            />
            <span className="align-items-center d-flex">{children}</span>
        </div>
    );
};

export default OTPalertPopup;
