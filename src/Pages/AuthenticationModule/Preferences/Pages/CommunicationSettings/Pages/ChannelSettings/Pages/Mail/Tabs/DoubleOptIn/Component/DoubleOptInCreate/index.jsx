import { getUserDetails } from 'Utils/modules/crypto';
import { CANCEL, DOUBLE_OPT, DOUBLE_OPT_IN_SETTINGS, EDIT_VERIFICATION_EMAIL, EDIT_WELCOME_NOTE, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { form_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import RSTextarea from 'Components/FormFields/RSTextarea';
import ModalsDoubleOptIn from '../ModalsDoubleOptIn';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import usePermission from 'Hooks/usePersmission';
import { getDoubleOptInById, saveDoubleOptIn } from 'Reducers/preferences/CommunicationSettings/request';
import { useDispatch, useSelector } from 'react-redux';
import { DoubleOptInProvider } from '../..';
import { getGlobalClientList, getSessionId } from 'Reducers/globalState/selector';

import { getCompanyClientDetails } from 'Reducers/preferences/Companies/request';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const DoubleOptInCreate = ({ type, handleCancel, setFailedApi }) => {
    const dispatch = useDispatch();
    const { clientId, userId } = useSelector(getSessionId);
    const methods = useForm({
        defaultValues: {
            verificationMail: '<h2>Sample Text</h2><p>Welcome Message</p>',
            welcomeNote: '<h2>Sample Text</h2><p>Welcome Message</p>',
        },
    });
     const clientList = useSelector((state) => getGlobalClientList(state));
    const currClient = clientList?.find((item) => item?.clientId === clientId);

    const { permissions } = usePermission();
    const { addAccess } = permissions || {};

    const context = useContext(DoubleOptInProvider);
    const isUpdate = context?.gridCreate?.doubleOptAction?.edit?.isEdit;
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isUpdate ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        watch,
        formState: { errors },
    } = methods;

    const [isEditVerificationMailModal, setEditVerificationMailModal] = useState(false);
    const [isEditWelcomeNoteModal, setEditWelcomeNoteModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [verificationContent, setVerificationContent] = useState('');
    const [welcomeContent, setWelcomeContent] = useState('');
    const [clientDetailsRes, setClientDetailsRes] = useState(null);
    const verificationMail = `<p><img src='data:image/png;base64,${currClient?.logoPath}' alt="Image" title="" width="100" height="100"></p><p></p><p><strong>Hello,</strong></p><p></p><p>Thank you for subscribing with ${currClient?.clientName}</p><p></p><p>This email is to acknowledge your subscription. You are now a part of ${clientDetailsRes} and you will start receiving emails of our special offers, seasonal wishes and other news and updates.</p><p></p><p>Thank you,</p><p></p><p>Regards,</p><p>Team ${currClient?.clientName}</p>`;
    const {  isAgency, clientId: agencyClientId } = getUserDetails();
    useEffect(() => {
    const fetchClientDetails = async () => {
        const payload = {
            clientId: isAgency ? agencyClientId : clientId,
            userId,
            departmentId: 0,
        };
        const {data} = await dispatch(getCompanyClientDetails({ payload, isAgency }));
        setClientDetailsRes(data?.website)
    };

    if (clientId && userId) {
        fetchClientDetails();
    }
}, [clientId, userId, agencyClientId, isAgency, dispatch]);

    
    const welcomeMail = `<p><img src='data:image/png;base64,${currClient?.logoPath}' alt="Image" title="" width="100" height="100"></p><p></p><p>Hello,</p><p></p><p>Thank you for choosing to subscribe with https://www.resulticks.com</p><p></p><p>We value your interest. Soon, you will receive information about special offers, news and updates pertaining to our products and services. We hope that you will enjoy our offers and continue to help us serve you better.</p><p></p><p>Regards,</p><p>Team ${currClient?.clientName}</p>`;
    useEffect(() => {
    if (!isUpdate && currClient && clientDetailsRes) {
        setEditData((prev) => ({
            ...prev,
            verificationMail,
            welcomeNote: welcomeMail,
        }));

        reset({
            verificationMail,
            welcomeNote: welcomeMail,
        });
    }
}, [isUpdate, currClient, clientDetailsRes, reset, verificationMail]);

    const getDoubleOptInDataById = async (id) => {
        const payload = {
            doubleOptInId: id,
            clientId,
            userId,
            //  departmentId,
        };
        const { status, data } = await dispatch(getDoubleOptInById(payload));
        if (status) {
            setEditData(data);
            reset({
                doubleOptInText: data?.doubleOptintext,
                verificationMail: data.verificationMail,
                welcomeNote: data.welcomeNote,
            });
        }else{
            setFailedApi('GetDoubleOptInById')
        }
    };

    useEffect(() => {
        if (isUpdate) {
            getDoubleOptInDataById(context?.gridCreate?.doubleOptAction?.edit?.editState?.doubleOptInId);
        }
    }, []);

    const handleSave = async (data) => {
        if (isSaveLoading) return;
        if (Object.keys(errors)?.length > 0) {
            return;
        }
        if (!data.doubleOptInText) {
            if (!data.doubleOptInText)
                setError('doubleOptInText', { type: 'manual', message: 'Enter verification message' });
            return;
        }
        const payload = {
            userId,
            clientId,
            doubleOptInId: isUpdate ? context?.gridCreate?.doubleOptAction?.edit?.editState?.doubleOptInId : 0,
            ...data,
        };
        const { status } = await saveApi.refetch({
            fetcher: () => dispatch(saveDoubleOptIn(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: isUpdate ? 'edit' : 'create',
        });
        if (status) handleCancel(true);
    };

    const handleSaveContent = (type, value) => {
        setValue(type, value);
        if (type === 'verificationMail') {
            setVerificationContent(value);
        } else {
            setWelcomeContent(value);
        }
    };
   
    const handleChange = (content) => {
        const updatedContent = content?.toString() || '';
        setCurrentValue(updatedContent);

        if (updatedContent.trim()?.length > 0) {
            clearErrors('content');
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleSave)}>
                <div className="box-design bd-top-border">
                    <div className="rs-sub-heading mt5">
                        <div className="rss-left">
                            <h4>{DOUBLE_OPT_IN_SETTINGS}</h4>
                        </div>
                    </div>

                    <div>
                        <Row>
                            {/* <Col sm={4} className="text-right">
                                    <label className="control-label-left">Double opt-in</label>
                                </Col> */}
                            <Col sm={7}>
                                <RSTextarea
                                    control={control}
                                    // defaultValue={isUpdate ? editData?.doubleOptintext : ''}
                                    // disabled={type === 'edit'}
                                    id="rs_DoubleOptInCreate_doubleOptInText"
                                    className={'text'}
                                    name={'doubleOptInText'}
                                    placeholder={DOUBLE_OPT}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        {content && (
                            <small className={'color-primary-red position-absolute top-0'}>
                                {content.message}
                            </small>
                        )}
                        <Row>
                            <Col>
                                <ul className="rs-list-inline rli-space-10 mt19">
                                    <li>
                                        <span>{EDIT_VERIFICATION_EMAIL}</span>
                                        <i
                                            id="rs_DoubleOptInCreate_verificationmail"
                                            className={`${form_edit_medium} icon-md color-primary-blue ml5 position-relative top5`}
                                            onClick={() => setEditVerificationMailModal(true)}
                                        />
                                    </li>
                                    <li>
                                        <span>{EDIT_WELCOME_NOTE}</span>
                                        <i
                                            id="rs_DoubleOptInCreate_welcomemail"
                                            className={`${form_edit_medium} icon-md color-primary-blue ml5 position-relative top5`}
                                            onClick={() => setEditWelcomeNoteModal(true)}
                                        />
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton
                        type="button"
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (isSaveLoading) return;
                            handleCancel(true);
                        }}
                        id="rs_DoubleOptInCreate_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    {addAccess && (
                        <RSPrimaryButton
                            type="submit"
                            isLoading={isSaveLoading}
                            className={`${type === 'edit' ? '1' : '2'} ${
                                Object.keys(errors)?.length > 0 ? 'click-off' : ''
                            }`}
                            id="rs_DoubleOptInCreate_Save"
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    )}
                </div>
            </form>
             {/* Modals */}
            <ModalsDoubleOptIn
                show={isEditVerificationMailModal}
                type="VERIFICATION_MAIL"
                data={editData?.verificationMail}
                initialValue={editData.verificationMail || verificationContent}
                handleClose={(status) => {
                    if (!status) {
                        setVerificationContent(editData.verificationMail || '');
                    }
                    setEditVerificationMailModal(false);
                }}
                handleSaveContent={(value) => handleSaveContent('verificationMail', value)}
            />
            <ModalsDoubleOptIn
                show={isEditWelcomeNoteModal}
                type="WELCOME_NOTE"
                data={editData?.welcomeNote}
                initialValue={editData.welcomeNote || welcomeContent}
                handleClose={(status) => {
                    if (!status) {
                        setWelcomeContent(editData.welcomeNote || '');
                    }
                    setEditWelcomeNoteModal(false);
                }}
                handleSaveContent={(value) => handleSaveContent('welcomeNote', value)}
            />
        </FormProvider>
    );
};

export default DoubleOptInCreate;
