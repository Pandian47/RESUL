import { MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_PERSONA_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { PERSONA_DESC, PERSONA_NAME } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useContext, useEffect, useRef } from 'react';
import _get from 'lodash/get';
import RSModal from 'Components/RSModal';
import { useFormContext } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import { GetPersonaName } from 'Reducers/preferences/audienceScore/request';
import ListNameExists from 'Components/ListNameExists';

const PersonaSaveModal = ({ show, handleClose, handleSave, isEdit, isEditData, isSaveLoading = false }) => {
    const navigate = useNavigate();
    //const { _, dispatchState } = useContext(TargetListContext);
    const {
        control,
        getValues,
        resetField,
        setValue,
        watch,
        formState: { isValid },
    } = useFormContext();
    const _isEmpty = _get(getValues(), 'personaName', '') === '';
    const exists = useRef();
    const savePersonaLists = () => {
        handleSave(_get(getValues(), 'personaName', ''));
        // SAVE PERSONA API CALL
        // dispatchState({
        //     type: 'UPDATE',
        //     payload: false,
        //     field: 'isSavePersona',
        // });
        // navigate(`.`, { state: { index: 0 } });
    };
    const isLoadingListName = watch('isLoadingListName');
    const isSubmitting = isSaveLoading || isLoadingListName;
    const pointerNone = isSubmitting ? 'pe-none' : '';
    useEffect(() => {
        exists.current = isEditData;
        setValue('personaName', isEditData);
    }, [isEdit]);
    return (
        <Fragment>
            <RSModal
                size="md"
                show={show}
                header={'Persona'}
                closeClassName={pointerNone}
                body={
                    <div>
                        <div className="mb30">
                            <span>{PERSONA_DESC}</span>
                        </div>
                        <ListNameExists
                            name="personaName"
                            field="listName"
                            maxLength={MAX_LENGTH}
                            onValid={(status) => {
                                if (status) {
                                                                    }
                            }}
                            currentValue={exists.current}
                            apiCallback={GetPersonaName}
                            condition={({ status }) => {
                                return !status;
                            }}
                            placeholder={PERSONA_NAME}
                            rules={LIST_NAME_RULES(ENTER_PERSONA_NAME)}
                            customErrorMessage={ENTER_PERSONA_NAME}
                        />
                    </div>
                }
                footer={
                    <div className={`buttons-holder ${pointerNone}`}>
                        <RSSecondaryButton
                            blockInteraction={isSubmitting}
                            onClick={() => {
                                if (isSubmitting) return;
                                handleClose(false);
                                //   resetField('filterLists');
                            }}
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            className={isValid && !_isEmpty ? '' : 'click-off'}
                            isLoading={isSaveLoading}
                            blockBodyPointerEvents={isSaveLoading}
                            onClick={() => {
                                if (isSubmitting) return;
                                savePersonaLists();
                            }}
                        >
                            Save
                        </RSPrimaryButton>
                    </div>
                }
                handleClose={() => {
                    if (isSubmitting) return;
                    handleClose(false);
                }}
            />
        </Fragment>
    );
};

export default PersonaSaveModal;
