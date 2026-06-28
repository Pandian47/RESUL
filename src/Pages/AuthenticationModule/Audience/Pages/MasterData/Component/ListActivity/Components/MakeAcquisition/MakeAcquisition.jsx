import { standardizeDateFormat } from 'Utils/modules/dateTime';
import { Fragment, memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import RSTextarea from 'Components/FormFields/RSTextarea';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { makeAcquisitionNote } from 'Reducers/audience/masterdata/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';

const MakeAcquisition = ({ show, handleClose, data, activityType = 'activity', fromDate, toDate }) => {
    const { control, handleSubmit, reset, watch } = useForm();
    const descriptionValue = watch('description') ?? '';
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const saveLoader = useApiLoader({ autoFetch: false });
    const [isSavePending, setIsSavePending] = useState(false);
    const isSubmitting = saveLoader.isFetching || isSavePending;

    const isUpdate = data?.eventChannelDescription;

    const headerTextMap = {
        activity: 'Activity notes',
        acquisition: 'Acquisition notes',
        attrition: 'Attrition notes',
    };
    const headerText = headerTextMap[activityType] || 'Activity notes';

    useEffect(() => {
        if (!show) {
            saveLoader.reset();
            setIsSavePending(false);
            return;
        }

        if (isUpdate) {
            reset((formState) => ({ ...formState, description: isUpdate }));
        } else {
            reset((formState) => ({ ...formState, description: '' }));
        }
    }, [show, isUpdate, reset]);

    const handleModalClose = () => {
        if (isSubmitting) return;
        handleClose();
    };

    const handleSaveClick = handleSubmit((formState) => {
        if (isUpdate || isSubmitting) return;

        const payload = {
            departmentId,
            clientId,
            userId,
            createdDate: '4/20/2023',
            createdBy: userId,
            eventChannelName: data?.seriesName,
            eventDate: standardizeDateFormat(data?.date),
            eventChannelDescription: formState?.description,
            recipientAcquisitionDetails: 'test',
            activityType,
        };

        const refreshPayload = {
            departmentId,
            clientId,
            userId,
            activityType,
            fromDate,
            toDate,
        };

        setIsSavePending(true);
        saveLoader.refetch({
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            fetcher: () => dispatch(makeAcquisitionNote(payload, refreshPayload)),
            onSuccess: (res) => {
                if (res?.status) {
                    reset();
                    handleClose();
                }
            },
            onSettled: () => setIsSavePending(false),
        });
    });

    return (
        <RSModal
            show={show}
            isCloseDisabled={isSubmitting}
            handleClose={handleModalClose}
            header={headerText}
            body={
                <Fragment>
                    <RSTextarea
                        name="description"
                        control={control}
                        rules={{ required: 'Description required' }}
                        maxLength={MAX_LENGTH50}
                        placeholder={'Description'}
                        disabled={isUpdate || isSubmitting}
                    />
                    <small className="text-right mt5">
                        {descriptionValue.length}/{MAX_LENGTH50}
                    </small>
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton blockInteraction={isSubmitting} onClick={handleModalClose}>
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        className={`${isUpdate ? 'click-off' : ''}`}
                        type="button"
                        onClick={handleSaveClick}
                        disabledClass={isUpdate ? 'pe-none click-off' : ''}
                        isLoading={saveLoader.isFetching}
                        blockBodyPointerEvents
                    >
                        Save
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default memo(MakeAcquisition);
