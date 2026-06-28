import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { downloadIntegrationFiles } from 'Reducers/preferences/CommunicationSettings/request';

const IntegrationSuccessModal = ({
    show,
    onClose,
    type = 'web',
    settingsId = null,
    isDownloading = false,
    domainName = '',
    framework = '',
    name = '',
    appId = '',
    deviceList = [],
}) => {
    const dispatch = useDispatch();
    const { validUserEmailId } = useSelector(({ globalstate }) => globalstate);
    const { departmentId } = useSelector(getSessionId);

    function maskEmailCustom(email, options = {}) {
        const defaults = {
            showFirst: 1,
            showLastLocal: 1,
            showDomainChars: 3,
            maskChar: '*',
            showFullDomain: false,
        };

        const config = { ...defaults, ...options };

        const [localPart, domain] = email.split('@');
        const domainParts = domain.split('.');

        // Mask local part
        let maskedLocal = localPart.substring(0, config.showFirst);

        const middleLength = localPart.length - config.showFirst - config.showLastLocal;
        if (middleLength > 0) {
            maskedLocal += config.maskChar.repeat(middleLength);
        }

        maskedLocal += localPart.substring(localPart.length - config.showLastLocal);

        // Mask domain
        let maskedDomain;
        if (config.showFullDomain) {
            maskedDomain = domain;
        } else {
            const mainDomain = domainParts[0];
            const tld = domainParts.slice(1).join('.');

            const visibleChars = Math.min(config.showDomainChars, mainDomain.length);
            maskedDomain =
                mainDomain.substring(0, visibleChars) +
                config.maskChar.repeat(mainDomain.length - visibleChars) +
                '.' +
                tld;
        }

        return maskedLocal + '@' + maskedDomain;
    }

    const handleDownload = async () => {
        if (!settingsId) return;
        const basePayload = { departmentId };
        let requestPayload = basePayload;
        if (type === 'mobile') {
            let languageArray = [];
            if (Array.isArray(deviceList)) {
                deviceList.forEach((device) => {
                    if(device?.languageType?.languageName?.length > 0){
                        languageArray.push(device?.languageType?.languageName);
                    }else{
                        languageArray.push('Native');
                    }
                });
            }
            if (languageArray?.length === 0) {
                languageArray.push('Native');
            }
            requestPayload = {
                ...basePayload,
                pushNotifySettingId: settingsId,
                name,
                appId,
                deviceList: languageArray,
            };
        } else {
            requestPayload = {
                ...basePayload,
                webnotifySettingId: settingsId,
                domainName,
                name: domainName,
                framework,
            };
        }
        const response = await dispatch(downloadIntegrationFiles(requestPayload));
        onClose();
        
    };

    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (show && countdown === 0) {
            onClose();
        }
    }, [show, countdown, onClose]);

    let maskedEmail = maskEmailCustom(validUserEmailId, { showFirst: 2, showLastLocal: 2 });
    return (
        <RSModal
            show={show}
            size="lg"
            header="Confirmation"
            handleClose={onClose}
            isCloseButton={true}
            body={
                <>
                    <div className="mb23">
                        <p className="mb10">Thank you for completing the onboarding process. The SDK Integration Guidelines ZIP package has been sent to your ({maskedEmail}) registered email.</p>
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
                        <div className="mb20 mt20">
                            <small className="mb0 color-primary-grey">
                                If you prefer, you can also click the download option below to get the integration package directly.
                            </small>
                        </div>
                    </div>
                    <div className="buttons-holder">
                       
                        <RSPrimaryButton onClick={handleDownload}>Download</RSPrimaryButton>
                    </div>








                    

                    
                </>
            }
        />
    );
};

IntegrationSuccessModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['web', 'mobile']),
    settingsId: PropTypes.number,
    isDownloading: PropTypes.bool,
    domainName: PropTypes.string,
    framework: PropTypes.string,
    name: PropTypes.string,
    appId: PropTypes.string,
    deviceList: PropTypes.arrayOf(PropTypes.object),
};

export default IntegrationSuccessModal;
