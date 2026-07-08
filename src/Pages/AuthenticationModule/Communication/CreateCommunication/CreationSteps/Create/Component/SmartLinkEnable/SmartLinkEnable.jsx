import { CREATE_SMART_LINK, IGNORE, MANDATORY_SMARTLINK, NO_THANKS, PAID_MEDIA_SMARTLINK_MANDATORY, PROCEED, YES } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { updateSmartLinkModalState } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { statusIdCheck } from 'Utils/modules/campaignUtils';
import {
    getResolvedMobileAppId,
    selectHasExistingSmartLinkData,
    selectHasMobileSmartLinkData,
    selectHasWebSmartLinkData,
    selectIsSmartLinkFetchResolved,
} from 'Reducers/communication/createCommunication/smartlink/selectors';

const MDC_MAX_SMARTLINK_LEVEL = 2;

export const useShouldShowSmartLinkEnable = ({
    isClickOff = false,
    isChannelLoading = false,
    levelNumber,
    requiresMobileApp = false,
    requiresWebSmartLink = false,
    enabled = true,
} = {}) => {
    const { tabSmartLink_Flag, isSmartLinkDetailLoading } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );
    const hasExistingSmartLinkData = useSelector(selectHasExistingSmartLinkData);
    const hasWebSmartLinkData = useSelector(selectHasWebSmartLinkData);
    const hasMobileSmartLinkData = useSelector(selectHasMobileSmartLinkData);
    const isSmartLinkFetchResolved = useSelector(selectIsSmartLinkFetchResolved);
    const resolvedMobileAppId = useSelector(getResolvedMobileAppId);

    return useMemo(() => {
        if (!enabled) return false;
        if (!statusIdCheck()) return false;
        if (isClickOff || isChannelLoading) return false;
        if (levelNumber !== undefined && Number(levelNumber) >= MDC_MAX_SMARTLINK_LEVEL) return false;
        if (!isSmartLinkFetchResolved || isSmartLinkDetailLoading) return false;

        if (requiresMobileApp) {
            return !(hasMobileSmartLinkData && resolvedMobileAppId);
        }

        if (requiresWebSmartLink) {
            return !hasWebSmartLinkData;
        }

        return !tabSmartLink_Flag && !hasExistingSmartLinkData;
    }, [
        enabled,
        isClickOff,
        isChannelLoading,
        levelNumber,
        requiresMobileApp,
        requiresWebSmartLink,
        isSmartLinkFetchResolved,
        isSmartLinkDetailLoading,
        hasExistingSmartLinkData,
        hasWebSmartLinkData,
        hasMobileSmartLinkData,
        resolvedMobileAppId,
        tabSmartLink_Flag,
    ]);
};

const SmartLinkEnable = ({
    message,
    onReject = () => {},
    onSave = () => {},
    isSmartLink,
    secondaryButton = true,
    isQrClassNameEnable = false,
    ignoreButton = false,
    onIgnore = () => {},
    isPaidMedia = false,
    isClickOff = false,
    isChannelLoading = false,
    levelNumber,
    requiresMobileApp = false,
    requiresWebSmartLink = false,
    enabled = true,
}) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const shouldShow = useShouldShowSmartLinkEnable({
        isClickOff,
        isChannelLoading,
        levelNumber,
        requiresMobileApp,
        requiresWebSmartLink,
        enabled,
    });

    if (!shouldShow) {
        return null;
    }

    const displayMessage =
        message ??
        (isPaidMedia
            ? PAID_MEDIA_SMARTLINK_MANDATORY
            : !secondaryButton && !ignoreButton
              ? MANDATORY_SMARTLINK
              : CREATE_SMART_LINK);

    return (
        <Fragment>
            <span className={`${location?.campaignType === 'M' ? 'mdcoverlay' : ''}`}>
                <div className="rs-smartlink-overlay communication-smartlink-popup"></div>
                <div
                    className={`rs-overlay-page-modal-wrapper text-center communication-popup-center ${
                        isQrClassNameEnable ? 'left20' : ''
                    }`}
                >
                    <p className="mb21">{displayMessage}</p>
                    {secondaryButton && (
                        <RSSecondaryButton
                            onClick={() => onReject()}
                            className={`mr15 ${ignoreButton ? 'left8 position-relative' : ''} `}
                            disabled={isSmartLink}
                            id="rs_SmartLinkEnable_Nothanks"
                        >
                            {NO_THANKS}
                        </RSSecondaryButton>
                    )}
                    {ignoreButton && (
                        <RSSecondaryButton
                            onClick={() => onIgnore()}
                            className="mr15 color-primary-blue"
                            id="rs_SmartLinkEnable_Ignore"
                        >
                            {IGNORE}
                        </RSSecondaryButton>
                    )}
                    <RSPrimaryButton
                        onClick={() => {
                            dispatch(updateSmartLinkModalState(true));
                            onSave();
                        }}
                        id="rs_SmartLinkEnable_Yes"
                    >
                        {!secondaryButton && !ignoreButton ? PROCEED : YES}
                    </RSPrimaryButton>
                </div>
            </span>
        </Fragment>
    );
};

SmartLinkEnable.propTypes = {
    message: PropTypes.string,
    secondaryButton: PropTypes.bool,
    onReject: PropTypes.func,
    onSave: PropTypes.func,
    isClickOff: PropTypes.bool,
    isChannelLoading: PropTypes.bool,
    levelNumber: PropTypes.number,
    requiresMobileApp: PropTypes.bool,
    requiresWebSmartLink: PropTypes.bool,
    enabled: PropTypes.bool,
};

export default SmartLinkEnable;
