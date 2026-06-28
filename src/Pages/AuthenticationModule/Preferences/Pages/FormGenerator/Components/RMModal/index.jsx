import { NEW_EMAIL_REGEX } from 'Constants/GlobalConstant/Regex';
import { CANCEL, ENTER_FORM_FIELDS, FORM_FIELDS, OK, THANK_YOU_YOUR_REQUEST } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSTagsComponent from 'Components/RSTagsComponent';
import { FORM_FIELDS_REQUIRED } from 'Constants/GlobalConstant/ValidationMessage';
import { getSessionId } from 'Reducers/globalState/selector';
import { getUserInfoDetailsForOTP } from 'Reducers/globalState/request';
import { get_formCSV_FormFields, formDownloadRM, getFormRM } from 'Reducers/preferences/FormGenerator/request';
import {
    getFormFieldsAndNotifyFF,
    updateFormNotifierFF,
} from 'Reducers/preferences/AdvancedForm/request';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSInput from 'Components/FormFields/RSInput';
import { FormGeneratorRmModalSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';

const RMModal = ({ show, handleActions, data, isAdvancedForm = false }) => {
    const [selectedFields, setSelectedFields] = useState([]);
    const [otpModal, setOtpModal] = useState(false);
    const [otpSuccessModal, setOtpSuccessModal] = useState(false);
    const methods = useForm({
        defaultValues: {
            notifyStatus: false,
            formFields: '',
            Notifiers: '',
        },
        mode: 'onTouched',
    });
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const rmModalLoader = useApiLoader({ autoFetch: false });
    const rmSaveLoader = useApiLoader({ autoFetch: false });
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = methods;
    const [formFieldState, setFormFieldState] = useState({
        formData: [],
        count: 0,
        removeData: [],
    });
    const [notifyStatus] = watch(['notifyStatus']);

    const validateNotifiers = (value) => {
        if (!value || value.trim() === '') {
            return 'Notifiers is required';
        }
        const emails = value
            .split(',')
            .map((email) => email.trim())
            .filter((email) => email !== '');
        if (emails.length === 0) {
            return 'Notifiers is required';
        }
        if (emails.length > 5) {
            return 'Maximum 5 email addresses allowed';
        }
        const emailSet = new Set();
        const duplicates = [];
        emails.forEach((email) => {
            const lowerEmail = email.toLowerCase();
            if (emailSet.has(lowerEmail)) {
                duplicates.push(email);
            } else {
                emailSet.add(lowerEmail);
            }
        });
        if (duplicates.length > 0) {
            return 'Duplicate email addresses are not allowed';
        }
        const invalidEmails = emails.filter((email) => !NEW_EMAIL_REGEX.test(email));
        if (invalidEmails.length > 0) {
            return 'Enter valid email addresses';
        }
        return true;
    };

    const loadRmModalData = useCallback(async () => {
        const fieldsPayload = {
            departmentId,
            clientId,
            userId,
            formId: data?.recipientFormId,
            isRmNotifier: true,
        };
        const res = await dispatch(get_formCSV_FormFields(fieldsPayload));

        if (res?.status) {
            const tempFieldData = res?.data?.FormFields.map((e) => e.ColumnName);
            return tempFieldData;
        }
        return [];
    }, [clientId, data?.recipientFormId, departmentId, dispatch, userId]);

    const applyFieldSelectionState = (allFormFields, selectedColumns, notifyEnabled, notifierEmails) => {
        const remainingFields = allFormFields.filter((field) => !selectedColumns.includes(field));
        setFormFieldState({
            formData: allFormFields,
            count: allFormFields?.length,
            removeData: remainingFields,
        });
        setSelectedFields(selectedColumns);
        reset({
            notifyStatus: notifyEnabled,
            formFields: '',
            Notifiers: notifierEmails,
        });
    };

    const getFormStatus = async () => {
        const formId = data?.recipientFormId;

        if (isAdvancedForm) {
            const res = await dispatch(getFormFieldsAndNotifyFF(formId));
            if (!res?.status) return;

            const allFormFields = res?.data?.fields || [];
            const notifyData = res?.data?.notify || {};
            const selectedColumns = notifyData?.required_column
                ? notifyData.required_column
                      .split(',')
                      .map((col) => col.trim())
                      .filter((col) => col !== '')
                : allFormFields;

            applyFieldSelectionState(
                allFormFields,
                selectedColumns,
                notifyData?.notify ?? false,
                notifyData?.notification_email || '',
            );
            return;
        }

        const payloadGet = {
            departmentId,
            clientId,
            userId,
            formId,
        };
        const res = await dispatch(getFormRM(payloadGet));
        const formRMData = res?.data?.[0] || {};
        const allFormFields = await loadRmModalData();

        const selectedColumns = formRMData?.recipientFormColumns
            ? formRMData.recipientFormColumns
                  .split(',')
                  .map((col) => col.trim())
                  .filter((col) => col !== '')
            : allFormFields;

        applyFieldSelectionState(
            allFormFields,
            selectedColumns,
            formRMData?.notifyStatus ?? true,
            formRMData?.regionalMail || '',
        );
    };

    useEffect(() => {
        if (!show || !data?.recipientFormId) {
            rmModalLoader.reset();
            rmSaveLoader.reset();
            return;
        }

        rmModalLoader.refetch({
            fetcher: () => getFormStatus(),
        });

        dispatch(
            getUserInfoDetailsForOTP(
                {
                    departmentId,
                    clientId,
                    userId,
                },
                false,
            ),
        );
    }, [show, data?.recipientFormId, isAdvancedForm, departmentId, clientId, userId]);

    const handleSaveSuccess = (isNotifyEnabled) => {
        setSelectedFields([]);
        if (isNotifyEnabled) {
            setOtpSuccessModal(true);
            setTimeout(() => {
                setOtpSuccessModal(false);
                handleActions(!show);
            }, 3000);
        } else {
            handleActions(!show);
        }
    };

    const saveFormData = (formState, otpValue = '', keyData = '') => {
        const isNotifyEnabled = formState?.notifyStatus ?? false;

        rmSaveLoader.refetch({
            fetcher: async () => {
                if (isAdvancedForm) {
                    const payload = {
                        formId: data?.recipientFormId,
                        clientId,
                        departmentId,
                        userId,
                        notify: isNotifyEnabled,
                        notification_email: isNotifyEnabled ? formState?.Notifiers || '' : '',
                        required_column: isNotifyEnabled ? selectedFields.join(',') : '',
                    };
                    return dispatch(updateFormNotifierFF(payload, false));
                }

                const payload = {
                    formId: data?.recipientFormId,
                    clientId,
                    departmentId,
                    userId,
                    formName: data?.formName || '',
                    regionalMail: isNotifyEnabled ? formState?.Notifiers || '' : '',
                    recipientFormColumns: isNotifyEnabled ? selectedFields.join(',') : '',
                    notifyStatus: isNotifyEnabled,
                    otp: otpValue || '',
                    to: keyData || '',
                };
                return dispatch(formDownloadRM(payload, false));
            },
            onSuccess: (res) => {
                if (res?.status) {
                    handleSaveSuccess(isNotifyEnabled);
                } else {
                    setOtpSuccessModal(false);
                }
            },
        });
    };

    const formSubmitHandler = (formState) => {
        if (!formState?.notifyStatus) {
            saveFormData(formState);
            return;
        }
        setOtpModal(true);
    };

    const handleDownloadCSV = (keyDataValue) => {
        const { otpValue, keyData } = keyDataValue;
        const formState = methods.getValues();
        saveFormData(formState, otpValue, keyData);
    };

    const handleClose = () => {
        if (rmSaveLoader.isLoading) return;
        handleActions(!show);
        setSelectedFields([]);
        rmModalLoader.reset();
        rmSaveLoader.reset();
        reset({
            notifyStatus: true,
            formFields: '',
            Notifiers: '',
        });
    };

    return (
        <>
            <RSModal
                size={'xlg'}
                show={show}
                handleClose={handleClose}
                header={'Add notifier Email IDs'}
                className={`${otpModal || otpSuccessModal ? 'opacity-0' : ''} ${otpSuccessModal ? 'click-off' : ''}`}
                body={
                    rmModalLoader.isLoading ? (
                        <FormGeneratorRmModalSkeleton />
                    ) : (
                        <FormProvider {...methods}>
                            <form onSubmit={handleSubmit((formData) => formSubmitHandler(formData))}>
                                <Row className="form-group">
                                    <Col sm={{ offset: 1, span: 3 }}>
                                        <label className="control-label-left">{'Status'}</label>
                                    </Col>
                                    <Col sm={7}>
                                        <RSSwitch name="notifyStatus" control={control} />{' '}
                                    </Col>
                                </Row>
                                {notifyStatus && (
                                    <>
                                        <Row className="form-group">
                                            <Col sm={{ offset: 1, span: 3 }}>
                                                <label className="control-label-left">{FORM_FIELDS}</label>
                                            </Col>
                                            <Col sm={7}>
                                                <RSKendoDropdown
                                                    name="formFields"
                                                    disabled={formFieldState.count === selectedFields?.length}
                                                    data={
                                                        formFieldState.count === selectedFields?.length
                                                            ? []
                                                            : formFieldState.removeData
                                                    }
                                                    control={control}
                                                    label={FORM_FIELDS}
                                                    handleChange={(e) => {
                                                        setSelectedFields((prev) => [...prev, e.value]);
                                                        const removeChangeData = formFieldState.removeData.filter(
                                                            (ele) => ele !== e.target.value,
                                                        );
                                                        setFormFieldState((pre) => ({
                                                            ...pre,
                                                            removeData: removeChangeData,
                                                        }));
                                                        setValue('formFields', '');
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="form-group">
                                            <Col sm={{ span: 7, offset: 4 }}>
                                                <RSTagsComponent
                                                    tags={selectedFields}
                                                    placeholder={ENTER_FORM_FIELDS}
                                                    isRefresh={false}
                                                    removedTags={(tags) => {
                                                        setFormFieldState((pre) => ({
                                                            ...pre,
                                                            removeData: [...pre.removeData, tags],
                                                        }));
                                                    }}
                                                    updatedTags={(tags) => {
                                                        setSelectedFields(tags);
                                                        setFormFieldState((pre) => ({
                                                            ...pre,
                                                            formData: tags,
                                                        }));
                                                    }}
                                                    name="tags"
                                                    control={control}
                                                    rules={{ required: FORM_FIELDS_REQUIRED }}
                                                    isAddTag={false}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="form-group">
                                            <Col sm={{ offset: 1, span: 3 }}>
                                                <label className="control-label-left">{'Notifiers'}</label>
                                            </Col>
                                            <Col sm={7}>
                                                <RSInput
                                                    name="Notifiers"
                                                    control={control}
                                                    placeholder="Enter up to 5 email addresses (comma-separated)"
                                                    className="ellispis"
                                                    required
                                                    rules={{
                                                        required: 'Notifiers is required',
                                                        validate: validateNotifiers,
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </form>
                        </FormProvider>
                    )
                }
                footer={
                    <Fragment>
                        <RSSecondaryButton onClick={handleClose} blockInteraction={rmSaveLoader.isLoading}>
                            {CANCEL}
                        </RSSecondaryButton>
                        {!rmModalLoader.isLoading && (
                            <RSPrimaryButton
                                type="submit"
                                isLoading={rmSaveLoader.isLoading}
                                blockBodyPointerEvents={rmSaveLoader.isLoading}
                                onClick={handleSubmit((formData) => formSubmitHandler(formData))}
                            >
                                {OK}
                            </RSPrimaryButton>
                        )}
                    </Fragment>
                }
            />
            <DownloadCSV
                show={otpModal}
                handleClose={() => setOtpModal(false)}
                onSuccess={(keyData) => {
                    handleDownloadCSV(keyData);
                }}
                isForm
                isRMForm
                title={'Add notifiers - OTP Verification'}
            />
            <RSConfirmationModal
                show={otpSuccessModal}
                htmlContent={
                    <p className="text-center">
                        {THANK_YOU_YOUR_REQUEST}
                        <br />
                        {'The mentioned Email Id’s added successfully.'}
                    </p>
                }
                secondaryButton={false}
                primaryButton={false}
                handleClose={() => {
                    setOtpSuccessModal(false);
                    handleActions(!show);
                }}
            />
        </>
    );
};

export default RMModal;
