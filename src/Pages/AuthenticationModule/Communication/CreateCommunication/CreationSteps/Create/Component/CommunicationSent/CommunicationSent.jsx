import { COMMUNICATION_SUCCESSFULLY_SENT, LIVE_PREVIEW_SENT, PREVIEW, REQUEST_APPROVAL_REQUEST, TEST_PREVIEW_SENT } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_thumbs_up_fill_large, in_progress_medium } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';

import RSModal from 'Components/RSModal';
const CommunicationSent = ({ show, handleClose = () => {}, status = '', rfaMsg , requestFalse, smsPreview, isCloseButton = true, isAPIError = false }) => {
    // console.log('requestFalse: ', requestFalse);
    // console.log('rfaMsg: ', rfaMsg);
    return (
        <RSModal
            show={show}
            size="md"
            header={ rfaMsg ? REQUEST_APPROVAL_REQUEST : requestFalse ? 'Error' : PREVIEW}
            handleClose={handleClose}
            isCloseButton={true}
            isBorder
            body={
                <div className="d-flex flex-column align-items-center">
                    {requestFalse ? (
                        <>
                            <i className={`${alert_medium}  color-primary-red fs75 cursor-normal`} />
                            <div className="mt10">{requestFalse}</div>
                        </>
                    ) : status && status !== '' && !rfaMsg ? (
                        <>
                            <i className={`${in_progress_medium}  color-primary-orange fs75 cursor-normal`} />
                            {/* <div className="mt10">Test communication will be send shortly.</div> */}
                            <div className="mt10">{status}</div>
                        </>
                    ) : rfaMsg ? (
                        <>
                            <i
                                className={`${circle_thumbs_up_fill_large}  color-primary-green fs75 cursor-normal`}
                            />
                            <div className="mt10">{COMMUNICATION_SUCCESSFULLY_SENT}</div>
                        </>
                    ) : smsPreview ? (
                        <>
                            <i
                                className={`${circle_thumbs_up_fill_large}  color-primary-green fs75 cursor-normal`}
                            />
                            <div className="mt10">{LIVE_PREVIEW_SENT}</div>
                        </>
                    ) : (
                        <>
                            <i
                                className={`${circle_thumbs_up_fill_large}  color-primary-green fs75 cursor-normal`}
                            />
                            <div className="mt10">{TEST_PREVIEW_SENT}</div>
                        </>
                    )}
                </div>
            }
        ></RSModal>
    );
};
CommunicationSent.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func,
    rfaMsg: PropTypes.bool,
};

export default CommunicationSent;
