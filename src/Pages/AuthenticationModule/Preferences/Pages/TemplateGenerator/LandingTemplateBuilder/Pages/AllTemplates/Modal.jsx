import { MAX_LENGTH } from 'Constants/GlobalConstant/Regex';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { CANCEL, NEW_TEMPLATE, SAVE, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector } from 'react-redux';
import { baseURL, LANDING_BUILDER_REDIRECT_URL } from 'Constants/EndPoints';
import ListNameExists from 'Components/ListNameExists';
import { email_nameExisit } from 'Reducers/preferences/EmailBuilder/request';
import { ENTER_TEMPLATE_NAME } from 'Constants/GlobalConstant/ValidationMessage';

const LandingPageModal = ({ show, handleClose }) => {
    const [isValidListname, setIsValidListname] = useState(false);
    const methods = useForm();
    const {
        control,
        reset,
        handleSubmit,
        watch,
        unregister,
        setValue,
        getValues,
        trigger,
        clearErrors,
        formState: { isDirty, isValid },
    } = methods;
    // const { handleSubmit, trigger, control, getValues } = useForm();
    const navigate = useNavigate();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [isShow, setIsShow] = useState(false);
    useEffect(() => {
        setIsShow(typeof show === 'object' ? show.show : show);
    }, [show]);
    useEffect(() => {
        setValue('templateName', '');
        clearErrors('templateName');
    }, []);

    const handleSave = (data) => {
        if (data.templateName !== '') {
            handleDirect();
            handleClose();
        } else {
            trigger();
        }
    };

    const handleDirect = () => {
        let value = getValues('templateName');
        const templateIndex = typeof show === 'object' ? show.templateIndex : null;
        const tenantId = localStorage.getItem('uuiD') || '';

        let params = {
            templateName: value || '',
            channelId: '32',
            catagoryId: '6',
            templateId: 0,
            departmentId,
            clientId,
            userId,
        };
        let domain = location.origin + '/';
        let channelDetails = JSON.stringify(params);
        const token = localStorage.getItem('accessToken');
        const jwtToken = localStorage.getItem('jwtToken');
        const apiBaseURL = baseURL;

        window.location.href = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
            token,
        )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(clientId)}&userId=${encodeURIComponent(
            userId,
        )}&departmentId=${encodeURIComponent(departmentId)}&tenantId=${encodeURIComponent(tenantId)}&templateId=${encodeURIComponent(
            0,
        )}&mode=add&jwtToken=${encodeURIComponent(jwtToken || '')}&baseURL=${encodeURIComponent(
            apiBaseURL,
        )}&from=${domain}${templateIndex && templateIndex !== 0 ? `&preTemplate=${templateIndex}` : ''}`;
    };
    const isLoading = watch('isLoadingListName');
    const pointerNone = isLoading ? 'pe-none' : '';
    return (
        <FormProvider {...methods}>
            <RSModal
                show={isShow}
                size="md"
                header={NEW_TEMPLATE}
                handleClose={handleClose}
                // isCloseButton={false}
                closeClassName={pointerNone}
                body={
                    <form onSubmit={handleSubmit(handleSave)}>
                        <div className="page-content-holder">
                            <div className="form-group mb0">
                                {/* <RSInput
                                type={'text'}
                                name={'templateName'}
                                placeholder={TEMPLATE_NAME}
                                control={control}
                                required
                                rules={{ required: TEMPLATE_NAME }}
                            /> */}

                                <ListNameExists
                                    name="templateName"
                                    field="templateName"
                                    maxLength={MAX_LENGTH}
                                    apiCallback={email_nameExisit}
                                    onValid={(valid) => setIsValidListname(valid)}
                                    condition={({ status }) => {
                                                                                return !status;
                                    }}
                                    extraPayload={{ channelId: 32 }}
                                    placeholder={TEMPLATE_NAME}
                                    rules={LIST_NAME_RULES(TEMPLATE_NAME)}
                                    customErrorMessage={ENTER_TEMPLATE_NAME}
                                />
                            </div>
                            {/* <div className={`buttons-holder ${pointerNone}`}>
                               
                                <RSPrimaryButton type="submit" className={isValidListname ? '' : 'click-off'}>
                                    {SAVE}
                                </RSPrimaryButton>
                            </div> */}
                        </div>
                    </form>
                }
                footer={
                    <>
                        <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                        <RSPrimaryButton
                            type="submit"
                            onClick={handleSubmit(handleSave)}
                            className={isValidListname ? '' : 'click-off'}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    </>
                }
            />
        </FormProvider>
    );
};

export default LandingPageModal;

