import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { DUPLICATE, FORM_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';
import { useDispatch, useSelector } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ListNameExists from 'Components/ListNameExists';
import { duplicateFormbyID, checkSaveFormExist } from 'Reducers/preferences/FormGenerator/request';
import { FormProvider, useForm } from 'react-hook-form';
import { getSessionId } from 'Reducers/globalState/selector';

const DuplicateFormModal = ({ show, handleActions, data, handleCloseData }) => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const methods = useForm();
    const disPatch = useDispatch();
    const [isValidListname, setIsValidListname] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const { control, handleSubmit, getValues, resetField, watch, setFocus, setValue } = methods;
    const handleClose = () => {
        if (isDuplicating) return;
        resetField('formName');
        handleActions(!show);
    };
    const handleSave = async () => {
        setIsDuplicating(true);
        try {
            const payload = {
                departmentId,
                clientId,
                userId,
                recipientFormId: data?.recipientFormId,
                formName: getValues('formName'),
            };
            const { status } = await disPatch(duplicateFormbyID(payload, false));
            if (status) {
                handleCloseData(true);
                handleClose();
            } else {
                handleCloseData(false);
            }
        } finally {
            setIsDuplicating(false);
        }
    };
    const isLoading = watch('isLoadingListName');

useEffect(() => {
  if (show && data?.formName) {
    const baseName = data.formName.trim();
    let newName = '';

    if (baseName.endsWith('_copy')) {
      // Case: first duplicate -> add _1
      newName = `${baseName}_1`;
    } else if (baseName.includes('_copy_')) {
      // Case: already has a number -> increment it
      const [prefix, numPart] = baseName.split('_copy_');
      const num = parseInt(numPart, 10);
      newName = `${prefix}_copy_${isNaN(num) ? 1 : num + 1}`;
    } else {
      // Case: first copy
      newName = `${baseName}_copy`;
    }

    setValue('formName', newName);
    setTimeout(() => setFocus('formName'), 100);
  }
}, [show, data, setValue, setFocus]);

    
    return (
        <RSModal
            show={show}
            handleClose={() => handleClose()}
            lockBackground={isDuplicating}
            isCloseDisabled={isDuplicating || isLoading}
            header={'Duplicate form'}
            body={
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit((data) => formSubmitHandler(data))}>
                        <ListNameExists
                            name={'formName'}
                            field="formName"
                            onValid={(valid) => setIsValidListname(valid)}
                            apiCallback={checkSaveFormExist}
                            condition={(status) => {
                                return !status?.status;
                            }}
                            maxLength={MAX_LENGTH50}
                            placeholder={FORM_NAME}
                            rules={LIST_NAME_RULES(FORM_NAME)}
                            customErrorMessage={FORM_NAME}
                        />
                    </form>{' '}
                </FormProvider>
            }
            footer={
                <div>
                    <RSSecondaryButton onClick={() => handleClose(false)} blockInteraction={isDuplicating || isLoading}>
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={!isValidListname || isDuplicating || isLoading ? 'click-off' : ''}
                        onClick={handleSave}
                        isLoading={isDuplicating}
                        blockBodyPointerEvents
                    >
                        {DUPLICATE}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default DuplicateFormModal;
