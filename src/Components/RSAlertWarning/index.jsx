import { alert_medium, circle_close_fill_mini, circle_close_mini } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import RSIcon from 'Components/RSIcon';

const RSAlertWarning = ({
    show = false,
    message = '',
    showClose = false,
    handleClose = () => {},
    containerClass = 'page-content',
    alertClass = '',
    iconClass = '',
    messageClass = '',
}) => {
    if (!show || !message) {
        return null;
    }

    const defaultAlertClass = 'alert alert-warning mb15 mt30 align-items-stretch border-r7';
    const defaultIconClass = 'icon-md  white ';
    const defaultMessageClass = '';

    return (
        <Container className={containerClass}>
            <div className={alertClass || defaultAlertClass}>   
                <div className='bg-orange-medium position-relative p8 d-flex align-items-center border-blr7 border-tlr7'>
                <i className={`${alert_medium} ${iconClass || defaultIconClass}`}></i>
                </div>
                <span className={`${messageClass || defaultMessageClass} align-items-center d-flex lh-sm py10 pr35 pl10`}>{message}</span>
                {showClose && (
                    <div>
                        <RSIcon
                            handleClose={handleClose}
                            className="icon-xs"
                            color="color-orange-dark cp"
                            innerCloseContent={false}
                            customCloseClass={'right4 top4 w-auto bg-transparent'}
                            defaultItem={circle_close_mini}
                            hoverItem={circle_close_fill_mini}
                        />
                    </div>
                )}
            </div>
        </Container>
    );
};

RSAlertWarning.propTypes = {
    show: PropTypes.bool,
    message: PropTypes.string,
    showClose: PropTypes.bool,
    handleClose: PropTypes.func,
    containerClass: PropTypes.string,
    alertClass: PropTypes.string,
    iconClass: PropTypes.string,
    messageClass: PropTypes.string,
};

export default RSAlertWarning;
