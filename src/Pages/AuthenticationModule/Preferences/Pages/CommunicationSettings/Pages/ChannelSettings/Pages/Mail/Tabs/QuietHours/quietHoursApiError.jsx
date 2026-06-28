import { API_WARNING_DESCRIPTION, CONTACT_SUPPORT, OK, SYSTEM_ALERT, UNABLE_TOLOAD_DATA, USER_DEACTIVATE_CONFIRMATION_DIALOG } from 'Constants/GlobalConstant/Placeholders';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import RSConfirmationModal from 'Components/ConfirmationModal';


import {
    reset_failures_API_Errors,
    update_failures_API_Errors,
    updateCAPortalModal,
} from 'Reducers/globalState/reducer';

import { isQuietHoursSystemErrorMessage, parseQuietHoursApiResponse, resolveQuietHoursFailureMessage } from './constant';

export const isQuietHoursSystemApiError = (response) => {
    if (response == null || response === false) return true;

    if (response instanceof Error) {
        return isQuietHoursSystemErrorMessage(response.message);
    }

    if (typeof response === 'string') {
        return isQuietHoursSystemErrorMessage(response);
    }

    const parsed = parseQuietHoursApiResponse(response);

    if (!parsed.message && !parsed.status) {
        return true;
    }

    return isQuietHoursSystemErrorMessage(parsed?.message);
};

export const registerQuietHoursApiFailure = (dispatch, apiField) => {
    if (!apiField) return;


    dispatch(
        update_failures_API_Errors({
            field: apiField,
            message: API_WARNING_DESCRIPTION,
        }),
    );
};

export const reportQuietHoursSystemFailure = (setFailedApi, dispatch, apiKey, response) => {
    if (!isQuietHoursSystemApiError(response)) return;

    setFailedApi(apiKey);
    registerQuietHoursApiFailure(dispatch, apiKey);
};

export const handleQuietHoursApiFailure = (
    response,
    { setFailedApi, showValidationModal, apiKey },
    placeholders,
    fallback = UNABLE_TOLOAD_DATA,
) => {
    if (isQuietHoursSystemApiError(response)) {
        setFailedApi(apiKey, response);
        return;
    }

    const message = resolveQuietHoursFailureMessage(response, placeholders, fallback);
    if (!String(message || '').trim()) return;

    showValidationModal(message);
};

export const hasQuietHoursSystemError = (_failureApiErrors, failedApi) => Boolean(failedApi);

export const QuietHoursValidationModal = ({ show, message, onClose }) => (
    <RSConfirmationModal
        show={show}
        header={USER_DEACTIVATE_CONFIRMATION_DIALOG}
        text={message}
        primaryButtonText={OK}
        secondaryButton={false}
        handleClose={onClose}
        handleConfirm={onClose}
    />
);

export const QuietHoursSystemErrorPopup = ({ failureApiErrors, failedApi, dispatch, onClose = () => {} }) => {
    if (!hasQuietHoursSystemError(failureApiErrors, failedApi)) {
        return null;
    }

    return (
        <WarningPopup
            show
            text={API_WARNING_DESCRIPTION}
            isPrimary
            handleClose={(status) => {
                if (status === 1) {
                    dispatch(
                        updateCAPortalModal({
                            show: true,
                            callbackFunc: onClose,
                        }),
                    );
                    dispatch(reset_failures_API_Errors());
                } else {
                    dispatch(reset_failures_API_Errors());
                    onClose();
                }
            }}
            customSize="md"
            isheader
            showCancel
            isPrimaryText={CONTACT_SUPPORT}
            customHeader={SYSTEM_ALERT}
        />
    );
};
