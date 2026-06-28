import { formatName } from 'Utils/modules/formatters';
import { MAX_LENGTH200 } from 'Constants/GlobalConstant/Regex';
import { COMMUNICATION_NAME_MUST_DIFFER, ENTER_COMUNICATION_NAME as ENTER_COMUNICATION_NAME_MSG, MAX200LENGTH, MINLENGTH } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, DUPLICATE, DUPLICATE_COMMUNICATION_LIST, ENTER_COMMUNICATION_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import _get from 'lodash/get';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { checkCommunicationNameExists } from 'Reducers/communication/createCommunication/plan/request';
import { getSessionId } from 'Reducers/globalState/selector';

import { communicationNamevalidtor } from 'Utils/HookFormValidate';

const DuplicateModal = ({ show, onHide, selectedCommunication, onDuplicate, isDuplicating = false }) => {
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
            newCampaignName: selectedCommunication?.campaignName || '',
        },
    });

    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isNameValid, setIsNameValid] = useState(false);
    const originalCampaignName = selectedCommunication?.campaignName || '';

    useEffect(() => {
        if (selectedCommunication?.campaignName) {
            reset({ newCampaignName: selectedCommunication.campaignName });
            setIsNameValid(false);
            setIsCheckingName(false);
        }
    }, [selectedCommunication, reset]);

    const checkCampaignNameExists = async (campaignName) => {
        if (!campaignName || campaignName.length < 3) {
            setIsNameValid(false);
            return;
        }
        if (formatName(campaignName) === formatName(originalCampaignName)) {
            setIsNameValid(false);
            setError('newCampaignName', {
                type: 'manual',
                message: COMMUNICATION_NAME_MUST_DIFFER,
            });
            return;
        }

        setIsCheckingName(true);
        setIsNameValid(false);
        const payload = {
            campaignName: campaignName.trim(),
            campaignId: 0,
            userId,
            clientId,
            departmentId,
        };

        try {
            const { status } = await dispatch(checkCommunicationNameExists({ payload, setError }));
            if (status) {
                setIsNameValid(false);
                setError('newCampaignName', {
                    type: 'server',
                    message: 'Communication name already exists',
                });
            } else {
                clearErrors('newCampaignName');
                setIsNameValid(true);
            }
        } catch {
            setIsNameValid(false);
        } finally {
            setIsCheckingName(false);
        }
    };

    const onSubmit = async (data) => {
        if (!newCampaignName.trim() || isDuplicating) return;
        await onDuplicate(newCampaignName);
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
            header={DUPLICATE_COMMUNICATION_LIST}
            bodyClassName={isDuplicating ? 'pe-none' : ''}
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
                        disabledClass={
                            isDuplicating || !isValid || !isNameValid || isCheckingName
                                ? 'pe-none click-off'
                                : ''
                        }
                        blockBodyPointerEvents
                    >
                        {DUPLICATE}
                    </RSPrimaryButton>
                </>
            }
            body={
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="position-relative">
                        <RSInput
                            name="newCampaignName"
                            control={control}
                            placeholder={ENTER_COMMUNICATION_NAME}
                            required={true}
                            disabled={isDuplicating}
                            className="pr25"
                            isLoading={isCheckingName}
                            isValidIcon={isNameValid && !isCheckingName}
                            rules={{
                                required: ENTER_COMUNICATION_NAME_MSG,
                                minLength: {
                                    value: 3,
                                    message: MINLENGTH,
                                },
                                maxLength: {
                                    value: MAX_LENGTH200,
                                    message: MAX200LENGTH,
                                },
                                validate: {
                                    communicationNamevalidtor,
                                    isDifferentName: (value) =>
                                        formatName(value) !== formatName(originalCampaignName) ||
                                        COMMUNICATION_NAME_MUST_DIFFER,
                                    nameExists: () =>
                                        newCampaignName?.type === 'server'
                                            ? _get(errors, 'newCampaignName.message')
                                            : true,
                                },
                            }}
                            maxLength={MAX_LENGTH200}
                            handleOnBlur={(e) => {
                                const value = e.target.value;
                                if (value && value.length >= 3 && !newCampaignName) {
                                    checkCampaignNameExists(value);
                                }
                            }}
                            handleOnChange={() => {
                                clearErrors('newCampaignName');
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
