import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useSelector } from 'react-redux';
const OverviewInfo = ({
    label,
    count,
    title,
    icon,
    iconColor,
    bgImage,
    infobtnClicked,
    isNotificationInfo = false,
}) => {
    const { audienceOverviewLoading } = useSelector(({ masterDataReducer }) => masterDataReducer);

    const handleClick = () => {
        infobtnClicked(true);
    };

    return (
        <div className={`box-design position-relative ${bgImage} mb25`}>
            {audienceOverviewLoading ? (
                <div className="segment_loader float-start mt6"></div>
            ) : (
                <>
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <i className={`font-xl ${iconColor} ${icon}`}></i>
                            {/*  <i className={`font-xxl color-head-band-color ${icon}`}></i>*/}
                            <div className="ml15">
                                <small className="font-semi-bold">{label}</small>
                                <h1 className="font-bold">{count}</h1>
                            </div>
                        </div>
                        <small className="position-absolute bottom10 color-secondary-black">{title}</small>
                    </div>
                    <div className={`position-absolute bottom10 right10 lh0 ${
                            parseInt(count, 10) > 0 || isNotificationInfo ? '' : 'pe-none click-off'
                        }`}>
 <i
                        id="rs_data_circle_info"
                        className={`color-secondary-black icon-md ${circle_info_medium}`}
                        onClick={handleClick}
                    ></i>
                    </div>
                   
                </>
            )}
        </div>
    );
};

export default OverviewInfo;
