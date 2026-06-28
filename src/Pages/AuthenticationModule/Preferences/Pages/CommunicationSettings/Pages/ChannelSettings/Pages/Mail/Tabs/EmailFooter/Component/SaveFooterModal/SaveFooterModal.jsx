import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_FOOTER as ENTER_FOOTER_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { CANCEL, ENTER_FOOTER, SAVE, SAVE_FOOTER } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getEmailFooterNameExist } from 'Reducers/preferences/CommunicationSettings/request';
import ListNameExists from 'Components/ListNameExists';
const SaveFooterModal = ({ show, handleClose, isEdit, editName }) => {
    const { control, watch, setValue, formState:{errors},clearErrors } = useFormContext();
    const footerName = watch('footerName');
    const [nameStatus, setNameStatus] = useState(false)
    const [nameExists, setNameExists] = useState(true)
    useEffect(() => {
        if (isEdit) {
            setValue('footerName', editName);
            setNameStatus(true)
        }else {
            setValue('footerName', '');
        }
    }, [show,editName, isEdit]);    

    return (
        <RSModal
            show={show}
            size='md'
            handleClose={() => {
                handleClose(false, '')
                clearErrors()
            }}
            header={SAVE_FOOTER}
            body={
                <Container className="my15">
                    {/* <span className="mb30">Enter your footer name</span> */}
                    <ListNameExists
                        name={'footerName'}
                        field="footerName"
                        apiCallback={getEmailFooterNameExist}
                        condition={(status) => {
                            setNameStatus(!status?.status)
                            return !status?.status;
                        }}
                        maxLength={MAX_LENGTH50}
                        placeholder={ENTER_FOOTER}
                        extraPayload={{ departmentId: 0 }}
                        onChange={(e) => {
                               
                            if(e.target.value?.toLowerCase().trim() === editName?.toLowerCase().trim()){
                                setNameExists(true)
                                setNameStatus(true) 
                            }
                            else{
                                setNameExists(false)
                                setNameStatus(false) 
                            }
                        }}
                        onBlur={(e)=>{
                            if(e.target.value?.toLowerCase().trim() === editName?.toLowerCase().trim()){
                                setNameExists(true)
                            }
                            else{
                                setNameExists(false)
                            }
                        }}
                        nameExists={nameExists}
                        rules={LIST_NAME_RULES(ENTER_FOOTER_MSG)}
                        customErrorMessage={ENTER_FOOTER_MSG}
                    />
                </Container>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={() => {handleClose(false)
                    clearErrors()
                    }}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton className={`${ nameStatus ? '' : 'click-off'}
                    ${Object.keys(errors).includes('footerName') ? 'click-off' : ''}`} 
                    onClick={() =>{   
                        handleClose(true, footerName || editName)
                        }}>{SAVE}</RSPrimaryButton>
                </>
            }
        />
    );
};

export default SaveFooterModal;
