import { NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { checkSubscriptionExists } from 'Reducers/preferences/CommunicationSettings/request';

const SaveModal = ({ show, handleClose, onSave, isEdit, isSubscription, subscribeName, isSaveLoading = false }) => {
    const header = isSubscription ? 'Subscription' : 'Unsubscription';
    const [isShow, setIsShow] = useState(false);
    const [valid, setValid] = useState(false);
    const [nameStatus, setNameStatus] = useState(false)
    const [nameExists, setNameExists] = useState(true)
    const {
        formState: { isValid,errors },
        setValue,watch
    } = useFormContext();
    useEffect(() => {
        setIsShow(!!show);
        if (isEdit) {
            setValue('subscribeName', subscribeName);
            setNameStatus(true)
        }else {
            setValue('subscribeName', '');
        }
    }, [show,isEdit]);


    return (
        <RSModal
            show={isShow}
            size="md"
            header={header}
            handleClose={handleClose}
            body={
                <>
                    <Row className="mb30">
                        <label>Give your list a name</label>
                        <Col xs={12} className="mb30 mt30">
                            <ListNameExists
                                name="subscribeName"
                                field={isSubscription ? 'subscribeName' : 'unsubscribeName'}
                                onValid={() => {
                                    setValid(true);
                                }}
                                apiCallback={checkSubscriptionExists}
                                condition={({ status }) => {
                                    setNameStatus(!status?.status)
                                    return !status
                                }}
                                rules={LIST_NAME_RULES(NAME)}
                                customErrorMessage={NAME}
                                placeholder={NAME}
                                // onChange={() => setValid(false)}
                                onChange={(e) => {
                                    setValid(false)
                                    if(e.target.value?.toLowerCase().trim() === subscribeName?.toLowerCase().trim()){
                                        setNameExists(true)
                                        setNameStatus(true) 
                                    }
                                    else{
                                        setNameExists(false)
                                        setNameStatus(false) 
                                    }
                                }}
                                onBlur={(e)=>{
                                    if(e.target.value?.toLowerCase().trim() === subscribeName?.toLowerCase().trim()){
                                        setNameExists(true)
                                    }
                                    else{
                                        setNameExists(false)
                                    }
                                }}
                                nameExists={nameExists}
                            />
                        </Col>
                    </Row>
                    <div className="buttons-holder">
                        <RSSecondaryButton blockInteraction={isSaveLoading} onClick={() => handleClose()}>
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            className={`${ nameStatus ? '' : 'click-off'} ${Object.keys(errors).includes('subscribeName') ? 'click-off' : ''}`}
                            isLoading={isSaveLoading}
                            onClick={() => onSave()}
                        >
                            Save
                        </RSPrimaryButton>
                    </div>
                </>
            }
        />
    );
};

export default SaveModal;
