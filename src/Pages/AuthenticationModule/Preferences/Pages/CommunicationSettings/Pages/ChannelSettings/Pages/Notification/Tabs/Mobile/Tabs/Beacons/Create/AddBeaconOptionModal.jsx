import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import * as placeholder from 'Constants/GlobalConstant/Placeholders';
import * as regex from 'Constants/GlobalConstant/Regex';

const AddBeaconOptionModal = ({ show, onClose, onSave, header, inputPlaceholder }) => {
    const methods = useForm({
        defaultValues: { name: '' },
        mode: 'onChange',
    });
    const { control, handleSubmit, reset } = methods;

    const handleClose = () => {
        reset({ name: '' });
        onClose();
    };

    const handleSave = ({ name }) => {
        const trimmed = name?.trim();
        if (!trimmed) return;
        onSave(trimmed);
        handleClose();
    };

    if (!show) {
        return null;
    }

    return (
        <FormProvider {...methods}>
            <RSModal
                show={show}
                size="md"
                header={header}
                handleClose={handleClose}
                body={
                    <form
                        noValidate
                        onSubmit={handleSubmit(handleSave)}
                        className="form-group mb0"
                    >
                        <RSInput
                            control={control}
                            name="name"
                            placeholder={inputPlaceholder}
                            maxLength={regex.MAX_LENGTH75}
                            required
                            rules={{ required: 'Enter a name' }}
                        />
                        <div className="buttons-holder mt20">
                            <RSSecondaryButton type="button" onClick={handleClose}>
                                {placeholder.CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton type="submit">{placeholder.SAVE}</RSPrimaryButton>
                        </div>
                    </form>
                }
            />
        </FormProvider>
    );
};

AddBeaconOptionModal.propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    header: PropTypes.string,
    inputPlaceholder: PropTypes.string,
};

AddBeaconOptionModal.defaultProps = {
    show: false,
    onClose: () => {},
    onSave: () => {},
    header: '',
    inputPlaceholder: '',
};

export default AddBeaconOptionModal;
