import { CANCEL, OK } from 'Constants/GlobalConstant/Placeholders';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
const WarningModal = ({ show, handleClose }) => {
    return (
        <RSModal
            show={show}
            size={'md'}
            handleClose={() => handleClose(false)}
            body={<p className="text-center">{'Are you sure that you want to delete super admin'}</p>}
            header={'Warning'}
            footer={
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            handleClose(false);
                        }}
                    >
                       {CANCEL}
                    </RSSecondaryButton>
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
