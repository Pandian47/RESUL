import { OK } from 'Constants/GlobalConstant/Placeholders';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import RSModal from 'Components/RSModal';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { Row, Col } from 'react-bootstrap';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
const DeleteChannelFromAction = ({ show, deleteConfirm }) => {
    const [isShow, setShow] = useState(show);
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm();

    const handleClose = () => {
        const confirMation = { isConfirm: false };
        reset();
        setShow(false);
        deleteConfirm(confirMation);
    };
    return (
        <RSModal
            size={'md'}
            show={isShow}
            handleClose={handleClose}
            header={'Edit action'}
            body={
                <>
                    <Row>
                        <Col sm="12">
                            <span>Editing this action will reset all cascading communication levels. Click OK to proceed.</span>
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
                        className={!isValid ? 'click-off' : ''}
                        onClick={handleSubmit((data) => {
                            reset();
                            setShow(false);
                            deleteConfirm({ isConfirm: true });
                        })}
                    >
                        {OK}
                    </RSPrimaryButton>
                </>
            }
        ></RSModal>
    );
};

export default DeleteChannelFromAction;
