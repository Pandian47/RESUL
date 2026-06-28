import { bgColors } from './constant';
import { OK } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
const RSAlert = ({
    show,
    header,
    body,
    footer,
    primaryButtonText = OK,
    secondaryButtonText,
    handleClose = () => {},
    handleConfirm,
    containerClass = 'py30',
    contentClass = '',
    isMobileFieldTrackClass = false,
    customClassName='',
    footerClass = '',
}) => {
    const [showModal, setShowModal] = useState(false);
    const getRandomColor = bgColors[Math.floor(Math.random() * bgColors?.length)];

    useEffect(() => {
        setShowModal(show);
    }, [show]);

    return (
        <Fragment>
            {showModal && (
                <div className="rs-overlay-modal">
                    <div className="rs-overlay-bg"></div>
                    <div className={`rs-overlay-content ${contentClass}`}>
                        <Container className={`${containerClass}`}>
                            {header && <h2>{header}</h2>}
                            <div
                                className={`${
                                    isMobileFieldTrackClass ? 'align-items-center d-flex justify-content-center' : ''
                                } ${customClassName}`}
                            >
                                {body && body}
                                {footer && (
                                    <div className={`buttons-holder mt5 mb0 ${footerClass}`}>
                                        {secondaryButtonText && (
                                            <RSSecondaryButton
                                                onClick={() => handleClose()}
                                                className="white"
                                                id="rs_RSAlert_secondarybutton"
                                            >
                                                {secondaryButtonText}
                                            </RSSecondaryButton>
                                        )}
                                        {primaryButtonText && (
                                            <RSPrimaryButton
                                                onClick={() => handleConfirm()}
                                                id="rs_RSAlert_primarybutton"
                                            >
                                                {primaryButtonText}
                                            </RSPrimaryButton>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Container>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

RSAlert.propTypes = {
    handleClose: PropTypes.func,
    handleConfirm: PropTypes.func,
    secondaryButtonText: PropTypes.string,
    primaryButtonText: PropTypes.string,
    footerClass: PropTypes.string,
};

export default RSAlert;
