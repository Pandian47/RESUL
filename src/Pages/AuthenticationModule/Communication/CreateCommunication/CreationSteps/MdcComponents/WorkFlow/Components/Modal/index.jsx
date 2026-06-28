import { OK } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
const ClearCanvasModal = ({ show, handleCanvasResetCancel, handleConfirm }) => {
    const [isConfirm, setConfirm] = useState(false);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm();

    const handleClose = () => {
        //setConfirm(false);
        handleCanvasResetCancel();
        reset();
    };
    const handleFormSubmit = (data) => {
        if (agree) {
            handleConfirm();
        }
    };
    useEffect(() => {
        setConfirm(show);
    }, [show]);
    return (
        <>
            {isConfirm && (
                <RSModal
                    size={'md'}
                    show={isConfirm}
                    handleClose={handleClose}
                    header={'Clear canvas'}
                    body={
                        <>
                            <Row>
                                <Col sm="12">
                                    <span>Canvas will be cleared. Click OK to continue.</span>
                                </Col>
                                <Col sm="12" className="mt20">
                                    <RSCheckbox
                                        name={`agree`}
                                        labelName={`I agree`}
                                        control={control}
                                        required
                                        rules={{
                                            required: 'please enter valid',
                                        }}
                                        handleChange={(event) => {
                                                                                    }}
                                    />
                                </Col>
                            </Row>
                        </>
                    }
                    footer={
                        <>
                            <RSSecondaryButton onClick={handleClose}>Cancel</RSSecondaryButton>
                            <RSPrimaryButton
                                onClick={handleSubmit((data) => handleFormSubmit(data))}
                                className={!isValid ? 'click-off' : ''}
                            >
                                {OK}
                            </RSPrimaryButton>
                        </>
                    }
                ></RSModal>
            )}
        </>
    );
};
export default ClearCanvasModal;
