import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { CANCEL, SAVE, SAVE_FORM, SAVE_FORM_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import { checkSaveFormExist } from 'Reducers/preferences/FormGenerator/request';

const SaveFormModal = ({ show, handleClose, isEdit, editName, isSaveLoading = false }) => {
    const { control, watch, setValue } = useFormContext();
    const formName = watch('formName');
    const [isDisable, setDisable] = useState(false);
    const [isLength, setIsLength] = useState(false);
    useEffect(() => {
        if (formName?.length > 0 && formName?.length < 3) {
            setIsLength(true);
            setDisable(true);
        } else {
            setIsLength(false);
            if (!isEdit) {
                setDisable(false);
            }
        }
    }, [formName]);
    useEffect(() => {
        if (editName?.length > 0) {
            setDisable(true);
            setValue('formName', editName);
        } else {
            setDisable(false);
            setValue('formName', '');
        }
        // if (isEdit) {
        //     setValue('formName', editName);
        // }
    }, [editName]);
    const isLoading = watch('isLoadingListName');
    const pointerNone = isLoading || isSaveLoading ? 'pe-none' : '';
    return (
        <RSModal
            show={show}
            handleClose={() => handleClose(false, '')}
            header={SAVE_FORM}
            size="md"
            closeClassName={pointerNone}
            body={
                <>
                    <Container>
                        <ListNameExists
                            name={'formName'}
                            field="formName"
                            apiCallback={checkSaveFormExist}
                            condition={(status) => {
                                if (!status?.status) {
                                    setDisable(true);
                                } else {
                                    setDisable(false);
                                }
                                return !status?.status;
                            }}
                            disabled={isEdit}
                            maxLength={MAX_LENGTH50}
                            placeholder={SAVE_FORM_NAME}
                            extraPayload={{ departmentId: 0 }}
                            rules={LIST_NAME_RULES(FORM_NAME)}
                            customErrorMessage={FORM_NAME}
                        />
                    </Container>
                </>
            }
            footer={
                <div className={pointerNone}>
                    <RSSecondaryButton onClick={() => handleClose(false)}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        className={!isDisable || isLength || isLoading ? 'click-off' : ''}
                        isLoading={isSaveLoading}
                        blockBodyPointerEvents
                        onClick={() => handleClose(true, formName ?? editName)}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default SaveFormModal;
