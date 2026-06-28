import { CANCEL, EITHER_EMAIL, OK, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
const MakeDefaultModal = ({ show, handleClose }) => {
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={WARNING}
            body={<p className='text-center'>{EITHER_EMAIL}</p>}
            size={"md"}
            footer={
                <>
                    <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton onClick={handleClose}>{OK}</RSPrimaryButton>
                </>
            }
        />
    );
};

export default MakeDefaultModal;
