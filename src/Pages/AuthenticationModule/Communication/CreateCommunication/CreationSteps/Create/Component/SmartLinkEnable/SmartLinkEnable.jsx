import { CREATE_SMART_LINK, IGNORE, MANDATORY_SMARTLINK, NO_THANKS, PAID_MEDIA_SMARTLINK_MANDATORY, PROCEED, YES } from 'Constants/GlobalConstant/Placeholders';
import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { updateSmartLinkModalState } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';

const SmartLinkEnable = ({ message, onReject = () => {}, onSave = () => {}, isSmartLink, secondaryButton = true , isQrClassNameEnable = false, ignoreButton = false, onIgnore = () => {}, isPaidMedia = false} ) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');

    if (Number(location?.statusId) === 9) {
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
                <div className={`rs-overlay-page-modal-wrapper text-center communication-popup-center ${isQrClassNameEnable ? 'left20':''}`}>
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
};
export default SmartLinkEnable;
