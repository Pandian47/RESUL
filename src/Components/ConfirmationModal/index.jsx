import { ARE_YOU_SURE_DELETE, CANCEL, DELETE_USER_ROLE, OK } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import RSModal from 'Components/RSModal';
import { globalStateSelector } from 'Utils/Selectors/app';
import { useSelector } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const RSConfirmationModal = ({
    show: showModal,
    text = ARE_YOU_SURE_DELETE,
    handleConfirm,
    handleClose,
    secondaryButtonText = CANCEL,
    primaryButtonText = OK,
    secondaryButton = true,
    header = DELETE_USER_ROLE,
    isBorder = true,
    htmlContent,
    primaryButton = true,
    isCloseButton = true,
    size = 'md',
    className = '',
    isLoading = false,
    blockBodyPointerEvents = false
}) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(showModal);
    }, [showModal]);

    const { showSessionModal } = useSelector((state) => globalStateSelector(state));

    const handleModalClose = (...args) => {
        handleClose(...args);
    };

    const handleModalConfirm = () => {
        handleConfirm(true);
    };

    return (
        <RSModal
            show={!showSessionModal && show}
            header={header}
            isBorder={isBorder}
            size={size}
            className={className}
            handleClose={handleModalClose}
            isCloseDisabled={isLoading}
            body={htmlContent ? htmlContent : <p className="text-center">{text}</p>}
            isCloseButton={isCloseButton}
            isHeaderTitle={true}
            footer={
                <Fragment>
                    {secondaryButton && (
                        <RSSecondaryButton
                            onClick={() => handleModalClose(false)}
                            blockInteraction={isLoading}
                        >
                            {secondaryButtonText}
                        </RSSecondaryButton>
                    )}
                    {primaryButton && (
                        <RSPrimaryButton
                            blockBodyPointerEvents={blockBodyPointerEvents || isLoading}
                            isLoading={isLoading}
                            onClick={handleModalConfirm}
                        >
                            {primaryButtonText}
                        </RSPrimaryButton>
                    )}{' '}
                </Fragment>
            }
        />
    );
};

RSConfirmationModal.propTypes = {
    text: PropTypes.string,
    handleClose: PropTypes.func,
    handleConfirm: PropTypes.func,
    secondaryButtonText: PropTypes.string,
    primaryButtonText: PropTypes.string,
    secondaryButton: PropTypes.bool,
    primaryButton: PropTypes.bool,
    header: PropTypes.string,
    isBorder: PropTypes.bool,
    size: PropTypes.string,
    className: PropTypes.string,
    isLoading: PropTypes.bool,
};

export default RSConfirmationModal;
