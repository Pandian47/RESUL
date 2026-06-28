import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect } from 'react';
import RSModal from 'Components/RSModal';
import { useDispatch, useSelector } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { save_cssFormData, get_cssFormData } from 'Reducers/preferences/FormGenerator/request';
import { FormProvider, useForm } from 'react-hook-form';
import { getSessionId } from 'Reducers/globalState/selector';
import RSTextarea from 'Components/FormFields/RSTextarea';

const CSSModal = ({ show, handleActions, data, handleCloseData }) => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const methods = useForm();
    const disPatch = useDispatch();
    const { control, handleSubmit, setValue, resetField, watch } = methods;
    const handleClose = () => {
        resetField('css');
        handleActions(!show);
    };
    const css = watch('css');
    useEffect(() => {
        getCSSData();
    }, []);
    const getCSSData = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            recipientFormId: data?.recipientFormId,
        };
        let res = await disPatch(get_cssFormData(payload));
                if (res?.status) {
            setValue('css', res?.data[0].verificationMailhtml);
        } else {
        }
    };
    const handleSave = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
            recipientFormId: data?.recipientFormId,
            verificationMailhtml: css, //getValues('css'),
        };
        let { status } = await disPatch(save_cssFormData(payload));
        if (status) {
            handleCloseData(true);
            handleClose();
        } else {
            handleCloseData(false);
        }
    };

    return (
        <>
            <RSModal
                show={show}
                handleClose={() => handleClose()}
                header={'Form CSS'}
                body={
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit((data) => formSubmitHandler(data))}>
                            <RSTextarea
                                name="css"
                                control={control}
                                placeholder="Enter custom css"
                                className={'mt30'}
                            ></RSTextarea>
                        </form>{' '}
                    </FormProvider>
                }
                footer={
                    <>
                        <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                        <RSPrimaryButton onClick={handleSave} className={css?.length > 0 ? '' : 'click-off'}>
                            Save
                        </RSPrimaryButton>
                    </>
                }
            />
            {getWarningPopupMessage(failureApiErrors, disPatch)}
        </>
    );
};

export default CSSModal;
