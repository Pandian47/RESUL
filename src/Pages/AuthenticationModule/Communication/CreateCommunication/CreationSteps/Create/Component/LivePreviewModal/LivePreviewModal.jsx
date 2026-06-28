import { BACK, CANCEL, CONTACT, LIVE_PREVIEW, SEND_TO_ME } from 'Constants/GlobalConstant/Placeholders';
import { Fragment } from 'react';
import parse from 'html-react-parser';

import RSModal from 'Components/RSModal';
import AdvanceSearch from 'Components/AdvanceSearch';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const LivePreviewModal = ({ show, content = '', handleClose, sendPreview = () => {} }) => (
    <RSModal
        size={'lg'}
        className="rs-modal-preview-mobile"
        show={show}
        handleClose={handleClose}
        headerRightContent={
            <AdvanceSearch hideDropdown={true} searchText={() => {}} advanceSearchOptions={['Email', 'Brand Id']} />
        }
        header={LIVE_PREVIEW}
        body={
            <div className="sms-prev-box">
                <div className="contact-info">
                    <span className="sci-left">&lt; {BACK}</span>
                    <div className="sci-center">+919176666358</div>
                    <span className="sci-right">{CONTACT}</span>
                </div>
                <div className="message-box">{parse(content)}</div>
            </div>
        }
        footer={
            <Fragment>
                <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                <RSPrimaryButton onClick={sendPreview}>{SEND_TO_ME}</RSPrimaryButton>
            </Fragment>
        }
    />
);
export default LivePreviewModal;
