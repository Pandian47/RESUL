import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';


const IntegrationDocumentInfo = ({
    isDownloading = false,
    onDownloadClick,
    type = 'web',
    settingsId = null,
    domainName = '',
    framework = '',
    name = '',
    appId = '',
    deviceList = [],
    disableAutoDownload = false,
}) => {
    const dispatch = useDispatch();
    const { departmentId } = useSelector(getSessionId);

    return (
        <>
            <div className="mb23">
                <p className="mb10">Thank you for downloading the SDK Integration guidelines ZIP package.</p>
            </div>
            <div className="mb20">
                <p className="mb15">Inside the ZIP file, you will find:</p>
                <div className="pl15">
                    <p className="mb5">
                        <strong>1. SDK Integration Guidelines (PDF)</strong>
                    </p>
                    <p className="mb23">
                        This document contains the technical steps required to integrate the SDK into your
                        application. Please update the placeholder{' '}
                        {type === 'web' ? (
                            <code className="color-red-medium">&lt;SDK_Id&gt;</code>
                        ) : (
                            <>
                                <code className="color-red-medium">&lt;SDK_Id&gt;</code> and{' '}
                                <code className="color-red-medium">&lt;App_Id&gt;</code>
                            </>
                        )}{' '}
                        with your actual values before using the configuration.
                    </p>
                    <p className="mb5">
                        <strong>2. README File</strong>
                    </p>
                    <p>
                        A quick reference guide explaining how to use the provided PDF, update the required parameter,
                        and complete the integration successfully.
                    </p>
                </div>
            </div>

            <div className="buttons-holder">
                {/* <RSSecondaryButton 
                    className={`color-primary-blue`}
                    onClick={handleDownloadIntegration} 
                    disabled={isDownloading}>
                    {isDownloading ? 'Downloading...' : 'Download'}
                </RSSecondaryButton> */}
                {/* <RSPrimaryButton onClick={onDownloadClick}>Okay</RSPrimaryButton> */}
            </div>
        </>
    );
};

IntegrationDocumentInfo.propTypes = {
    isDownloading: PropTypes.bool,
    onDownloadClick: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['web', 'mobile']),
    settingsId: PropTypes.number,
    domainName: PropTypes.string,
    framework: PropTypes.string,
    name: PropTypes.string,
    appId: PropTypes.string,
    deviceList: PropTypes.arrayOf(PropTypes.string),
    disableAutoDownload: PropTypes.bool,
};

export default IntegrationDocumentInfo;
