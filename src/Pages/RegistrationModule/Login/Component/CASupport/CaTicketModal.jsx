import { MAXL_LENGTH2000 } from 'Constants/GlobalConstant/Regex';
import { ENTER_EDITOR_TEXT, SELECT_CAT_TYPE, SEVERITY as SEVERITY_MSG, SUBJECT as SUBJECT_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { ATTRIBUTE_DESCRIPTION, CANCEL, CAPORTAL_UPLOAD_FILE_DETAIL, CATEGORY_TYPE, SEVERITY, SUBJECT, SUBMIT } from 'Constants/GlobalConstant/Placeholders';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import RSModal from 'Components/RSModal';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSPrimaryButton from 'Components/Buttons/RSPrimaryButton';
import RSSecondaryButton from 'Components/Buttons/RSSecondaryButton';

import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import { severity, category } from './constant';
import { KyakoFormsSubmission } from 'Reducers/login/existingUser/request';
import { globalStateSelector } from 'Utils/Selectors/app';

export default function CaTicketModal({
    show,
    handleClose,
    isUpdate = false,
    isCapType = false,
    addAudience = false,
    sortedData = [],
}) {
    const methods = useForm();
    const { isShowCAPortal } = useSelector((state) => globalStateSelector(state));
    const dispatch = useDispatch();
    const {
        control,
        reset,
        handleSubmit,
        watch,
        unregister,
        setValue,
        getValues,
        clearErrors,
        setError,
        formState: { isDirty, isValid },
    } = methods;

    const onSubmit = async (formData) => {
        try {
            const filename = getValues('filename');
            const payload = {
                filename,
                priority: formData.Severity?.key,
                category: formData.Category?.key,
                subject: formData.Subject,
                content: formData.Message,
                image: formData.src,
                name: '',
                email: '',
            };

            const response = await dispatch(KyakoFormsSubmission({ payload }));
            if (response?.status) {
                if (isShowCAPortal?.show) {
                    isShowCAPortal?.callbackFunc();
                }
                handleClose(false);
                reset({
                    Severity: null,
                    Category: null,
                    Subject: '',
                    Message: '',
                    src: '',
                    filename: '',
                });
            } else {
            }
        } catch (error) {
        }
    };

    const handleCloseAndResetState = () => {
        if (isShowCAPortal?.show) {
            isShowCAPortal?.callbackFunc();
        }
        clearErrors();
        reset({
            Severity: null,
            Category: null,
            Subject: '',
            Message: '',
            src: '',
            filename: '',
        });
        handleClose(false);
    };

    return (
        <FormProvider {...methods}>
            <RSModal
                show={show}
                size="lg"
                header="Submit a Ticket"
                handleClose={() => {
                    handleCloseAndResetState();
                    handleClose();
                }}
                body={
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name="Severity"
                                        control={control}
                                        data={severity}
                                        textField="label"
                                        dataItemKey="key"
                                        required
                                        label={SEVERITY}
                                        rules={{
                                            required: SEVERITY_MSG,
                                        }}
                                    />
                                </div>
                            </Col>

                            <Col sm={12}>
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name="Category"
                                        control={control}
                                        data={category}
                                        required
                                        disabled={isUpdate || addAudience}
                                        textField="label"
                                        dataItemKey="key"
                                        label={CATEGORY_TYPE}
                                        rules={{
                                            required: SELECT_CAT_TYPE,
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col sm={12}>
                                <div className="form-group">
                                    <RSInput
                                        name={'Subject'}
                                        placeholder={SUBJECT}
                                        control={control}
                                        required
                                        autoComplete={'off'}
                                        maxLength={200}
                                        rules={{
                                            required: SUBJECT_MSG,
                                        }}
                                    />
                                </div>
                            </Col>

                            <Col sm={12}>
                                <div className="form-group">
                                    <RSTextarea
                                        name="Message"
                                        control={control}
                                        placeholder={ATTRIBUTE_DESCRIPTION}
                                        maxLength={MAXL_LENGTH2000}
                                        required
                                        isCustomBorder
                                        rules={{
                                            required: ENTER_EDITOR_TEXT,
                                        }}
                                    />
                                </div>
                            </Col>

                            <Col sm={12}>
                                <div className="form-group mt13">
                                    <RSFileUpload
                                        isbase64
                                        control={control}
                                        name={'src'}
                                        accept=".jpg,.jpeg,.png,.doc,.xls,.pdf,.csv,.zip,.xlsx,.docx"
                                        isPrefix
                                        clearErrors={clearErrors}
                                        setError={setError}
                                        size={2000000}
                                        customInputClass={'ml0'}
                                        // required
                                        watch={watch}
                                        // rules={{
                                        //     required: error.UPLOAD_FILE,
                                        // }}
                                        // isUpload={true}
                                        setValue={setValue}
                                        handleChange={(e) => {
                                            const file = e.target.files[0];
                                            setValue('filename', file.name);
                                        }}
                                        // rules={{
                                        //     required: error.APNS_FILENAME
                                        // }}
                                    />
                                    <small className="small-text-space-top">
                                        {CAPORTAL_UPLOAD_FILE_DETAIL}
                                    </small>
                                </div>
                            </Col>
                        </Row>

                        <div className="buttons-holder m0 mt-3">
                            <Row>
                                <Col>
                                    <RSSecondaryButton
                                        onClick={() => {
                                            handleCloseAndResetState();
                                        }}
                                    >
                                        {CANCEL}
                                    </RSSecondaryButton>
                                    <RSPrimaryButton type="submit">{SUBMIT}</RSPrimaryButton>
                                </Col>
                            </Row>
                        </div>
                    </form>
                }
            />
        </FormProvider>
    );
}
