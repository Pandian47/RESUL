import { NO_DATA_AVAILABEL, SELECT_LEFT_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
// const NoDataAvailableRender = ({ className, message = 'No data available' }) =>
const NoDataAvailableRender = ({ className, message = NO_DATA_AVAILABEL, isShowIcon = true, showMessage = true }) => {
    // const showicon = message !== SELECT_LEFT_ATTRIBUTES;
    return (
        <div className={`nodata-bar ${className ?? ''}`}>
            {showMessage && (
                <>
                    {isShowIcon && (
                        <i
                            className={`${alert_medium} icon-md color-primary-orange mr5 cursor-default`}
                        ></i>
                    )}
                    <p>{message}</p>
                </>
            )}
        </div>
    );
};

export default NoDataAvailableRender;
