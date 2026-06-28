import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { useFormContext } from 'react-hook-form';

const FullScreenModal = ({ show, handleClose }) => {
    const { getValues, setValue } = useFormContext();
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            //header={'Full screen mode'}
            header={false}
            size="md"
            body={<p className="text-center">Want to switch to full screen mode?</p>}
            footer={
                <div className="buttons-holder">
                    <RSSecondaryButton
                        onClick={() => {
                            setValue('fullscreen', false);
                            handleClose();
                        }}
                    >
                        No
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            document.body.requestFullscreen();
                            setValue('fullscreen', true);
                            handleClose();
                        }}
                    >
                        OK
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default FullScreenModal;
