import { CANCEL, OK } from 'Constants/GlobalConstant/Placeholders';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
const WarningModal = ({ show, handleClose }) => {
    return (
        <RSModal
            show={show}
            size={'md'}
            noBottomBorder
            isCloseButton={false}
            handleClose={() => handleClose(false)}
            // header={'Alert!'}
            body={<p className="text-center">Are you sure to delete?</p>}
            footer={
                <div className="buttons-holder mt0 mb0">
                    <RSSecondaryButton onClick={() => handleClose(false)}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            handleClose(true);
                        }}
                    >
                        {OK}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default WarningModal;
