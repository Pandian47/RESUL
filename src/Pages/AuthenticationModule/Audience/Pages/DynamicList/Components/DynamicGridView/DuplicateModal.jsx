import { formatName } from 'Utils/modules/formatters';
import { LIST_NAME_CREATION, MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ENTER_LIST_NAME as ENTER_LIST_NAME_MSG, LIST_NAME_MUST_DIFFER, MINLENGTH, SPECIAL_CHATACTERS_NOT_ALlOWED } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, DUPLICATE, DUPLICATE_LIST, ENTER_LIST_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { isListNameExist } from 'Reducers/audience/dynamicList/request';
import { getSessionId } from 'Reducers/globalState/selector';


const DuplicateModal = ({ show, onHide, selectedList, onDuplicate, isDuplicating = false }) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setError,
        clearErrors,
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            newListName: selectedList?.dynamicListName || '',
        },
    });

    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isNameValid, setIsNameValid] = useState(false);
    const originalListName = selectedList?.dynamicListName || '';

    useEffect(() => {
        if (selectedList?.dynamicListName) {
            reset({ newListName: selectedList.dynamicListName });
            setIsNameValid(false);
            setIsCheckingName(false);
        }
    }, [selectedList, reset]);

    const checkListNameExists = async (listName) => {
        if (!listName || listName.length < 3) {
            setIsNameValid(false);
            return false;
        }

        if (formatName(listName) === formatName(originalListName)) {
            setIsNameValid(false);
            setError('newListName', {
                type: 'manual',
                message: LIST_NAME_MUST_DIFFER,
            });
            return false;
        }

        setIsCheckingName(true);
        setIsNameValid(false);
        const payload = {
            listName: listName,
            listId: 0,
            departmentId,
            clientId,
            userId,
        };

        try {
            const { status, message = 'Name already exists' } = await dispatch(
                isListNameExist({ payload, loading: false }),
            );
            if (status) {
                setIsNameValid(false);
                setError('newListName', {
                    type: 'server',
                    message: message,
                });
                return false;
            }
            clearErrors('newListName');
            setIsNameValid(true);
            return true;
        } catch {
            setIsNameValid(false);
            return false;
        } finally {
            setIsCheckingName(false);
        }
    };

    const onSubmit = async (data) => {
        const listName = data.newListName?.trim();
        if (!listName || isDuplicating || isCheckingName) return;

        const isAvailable = isNameValid || (await checkListNameExists(listName));
        if (isAvailable) {
            onDuplicate(listName);
        }
    };

    const handleClose = () => {
        if (isDuplicating) return;
        reset();
        setIsCheckingName(false);
        setIsNameValid(false);
        onHide();
    };

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            lockBackground={isDuplicating}
            isCloseDisabled={isDuplicating}
            isBorder
            size="md"
            header={DUPLICATE_LIST}
            footer={
                <>
                    <RSSecondaryButton
                        onClick={handleClose}
                        blockInteraction={isDuplicating}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                        isLoading={isDuplicating}
                        blockBodyPointerEvents={isDuplicating}
                        disabledClass={
                            isDuplicating || !isValid || isCheckingName ? 'pe-none click-off' : ''
                        }
                    >
                        {DUPLICATE}
                    </RSPrimaryButton>
                </>
            }
            body={
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="position-relative">
                        <RSInput
                            name="newListName"
                            control={control}
                            placeholder={ENTER_LIST_NAME}
                            required={true}
                            disabled={isDuplicating}
                            className="pr25"
                            isLoading={isCheckingName}
                            isValidIcon={isNameValid && !isCheckingName}
                            rules={{
                                required: ENTER_LIST_NAME_MSG,
                                minLength: {
                                    value: 3,
                                    message: MINLENGTH,
                                },
                                pattern: {
                                    value: LIST_NAME_CREATION,
                                    message: SPECIAL_CHATACTERS_NOT_ALlOWED,
                                },
                                validate: {
                                    isDifferentName: (value) =>
                                        formatName(value) !== formatName(originalListName) ||
                                        LIST_NAME_MUST_DIFFER,
                                },
                            }}
                            maxLength={MAX_LENGTH50}
                            handleOnBlur={(e) => {
                                const value = e.target.value;
                                if (value && value.length >= 3 && !errors?.newListName) {
                                    checkListNameExists(value);
                                }
                            }}
                            handleOnChange={() => {
                                clearErrors('newListName');
                                setIsNameValid(false);
                            }}
                        />
                    </div>
                </form>
            }
        />
    );
};

export default DuplicateModal;
