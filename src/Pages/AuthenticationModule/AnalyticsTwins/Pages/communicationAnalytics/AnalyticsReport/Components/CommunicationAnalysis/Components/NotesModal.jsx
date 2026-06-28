import { getFullDateAndTime } from 'Constants/Utils/dates';
import { useForm } from 'react-hook-form';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { THIS_FIELD_IS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
const NotesModal = ({ note, handleClose }) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm();
    const onSave = (data) => {
        // console.log('data : ', data);
    };

    return (
        <RSModal
            show={note.show}
            handleClose={handleClose}
            header={'Channel : ' + note?.data?.name}
            size="md"
            body={
                <>
                    <form onSubmit={handleSubmit(onSave)}>
                        <p>Reach: 16,000 audience on {getFullDateAndTime(0)}</p>
                        <label>Note:</label>
                        <RSTextarea
                            name="notes"
                            control={control}
                            required
                            rules={{ required: THIS_FIELD_IS_REQUIRED }}
                        />
                        <RSPrimaryButton
                            type="submit"
                            className={`${isValid ? 'float-end mt10' : 'click-off float-end mt10'}`}
                            onClick={handleClose}
                        >
                            Save
                        </RSPrimaryButton>
                        <RSSecondaryButton
                            type="button"
                            className="float-end mt10"
                            onClick={() => {
                                handleClose();
                                reset();
                            }}
                        >
                            Cancel
                        </RSSecondaryButton>
                    </form>
                </>
            }
        />
    );
};

export default NotesModal;
