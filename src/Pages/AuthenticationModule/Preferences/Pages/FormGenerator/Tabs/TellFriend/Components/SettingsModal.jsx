import { onlyNumbers } from 'Utils/modules/inputValidators';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';


const SettingsModal = ({ show, handleClose, isEdit, editName = false, type='' }) => {
    const { control ,formState: { errors },} = useFormContext();

    return (
        <RSModal
            show={show}
            handleClose={() => handleClose(false)}
            header={'Settings'}
            size='md'
            body={
                <Row className='form-group  mb0'>
                    <Col sm={type=== 'tellAFriend' ? 9 :8} className=''>
                        <label className="control-label-left">Maximum number of referrals allowed</label>
                    </Col>
                    <Col sm={3} className='pl0'>
                        <RSInput
                            control={control}
                            name={'numberOfPeopleAdded'}
                            onKeyDown={onlyNumbers}
                            required
                            placeholder={'Count'}
                            maxLength={1}
                            rules={{
                                required: 'Enter the count',
                                validate: (data) => {
                                    if (data <= 5) return true;
                                    else return 'Max count 5';
                                },
                            }}
                        />
                    </Col>
                </Row>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton className={`${!!numberOfPeopleAdded ? 'click-off' : ''}`} onClick={() => handleClose(true)}>Save</RSPrimaryButton>
                </>
            }
        />
    );
};

export default SettingsModal;
