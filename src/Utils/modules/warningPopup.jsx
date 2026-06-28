import { CONTACT_SUPPORT, RETRY, SYSTEM_ALERT, UNEXPECTED_ERROR_HAPPENED } from 'Constants/GlobalConstant/Placeholders';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import { API_WARNING_DESCRIPTION } from 'Constants/GlobalConstant/Placeholders';
import { reset_failures_API_Errors, updateCAPortalModal } from 'Reducers/globalState/reducer';
import { getEnvironment } from './environment';

export function getStatusFailureApiModal(errors) {
    const updateApiErrors = errors
        ?.map((error) => Object.values(error))
        ?.flat()
        .filter((value) => value !== null && value !== undefined && value !== '');
    return updateApiErrors;
}
export function getSseDisconnectPopup({ show, onRetry, onClose = () => {} }) {
    return (
        <WarningPopup
            show={Boolean(show)}
            text={UNEXPECTED_ERROR_HAPPENED}
            isPrimary={true}
            isPrimaryText={RETRY}
            showCancel={false}
            isheader={true}
            isCloseButton={true}
            customHeader={SYSTEM_ALERT}
            customSize="md"
            handleClose={(status) => {
                if (status === 1) {
                    onRetry();
                } else {
                    onClose();
                }
            }}
        />
    );
}

export function getWarningPopupMessage(errors, dispatch, handleClose = () => { }) {
    return getStatusFailureApiModal(errors)?.length ? (
        <WarningPopup
            show={getEnvironment() === 'RUN' ? false : Boolean(getStatusFailureApiModal(errors)?.length)}
            text={API_WARNING_DESCRIPTION}
            isPrimary={true}
            handleClose={(status) => {
                if (status === 1) {
                    dispatch(
                        updateCAPortalModal({
                            show: true,
                            callbackFunc: handleClose,
                        }),
                    );
                    dispatch(reset_failures_API_Errors());
                } else {
                    dispatch(reset_failures_API_Errors());
                    handleClose();
                }
            }}
            customSize={'md'}
            isheader={true}
            showCancel={true}
            isPrimaryText={CONTACT_SUPPORT}
            customHeader={SYSTEM_ALERT}
        />
    ) : null;
}
