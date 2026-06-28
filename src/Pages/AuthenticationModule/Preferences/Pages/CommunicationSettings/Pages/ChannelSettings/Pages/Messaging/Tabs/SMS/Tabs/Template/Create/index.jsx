import { formatNumber } from 'Utils/modules/campaignUtils';
import { numberWithCommas } from 'Utils/modules/formatters';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { ACCEPTS_ONLY_CSV, CANCEL, DELETE, SAVE, SENDER_ID, TEMPLATE_NAME, TEMPLATE_TYPE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { circle_exclamatory_medium, circle_info_medium, circle_tick_medium, delete_medium } from 'Constants/GlobalConstant/Glyphicons';
import { circle_question_mark_mini, csv_download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import ListNameExists from 'Components/ListNameExists';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSTagsComponent from 'Components/RSTagsComponent';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';


import {
    FORM_INITIAL_STATE,
    TEMPLATE_INPUT_MAX_LENGTH,
    TEMPLATE_ID_MAX_LENGTH,
    TEMPLATE_TYPE_OPTIONS,
    ONBOARDING_TYPE_MANUAL,
    ONBOARDING_TYPE_IMPORT_CSV,
    mapEditResponseToSmsTemplateForm,
    buildSmsTemplateSavePayload,
    buildBulkSmsTemplatePayloadFromRows,
    validateMandatoryColumns,
    getEligibleRows,
    parseFileToRows,
    getMainSenderIdRules,
    getMessageContentValidate,
    getBulkGridColumns,
    SMS_TEMPLATE_SAMPLE_CSV_CONTENT,
    SMS_VENDOR_FORM_ACTIONS_PORTAL_ID,
} from '../../../constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import usePermission from 'Hooks/usePersmission';
import { saveSmsTemplates, checkTemplateNameExists } from 'Reducers/preferences/CommunicationSettings/request';
import RSPPophover from 'Components/RSPPophover';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';


const SMS_TEMPLATE_CREATE_FORM_ID = 'rs_SMSTemplateCreate_Form';

const SMSTemplateCreate = ({ type, handleCancel, config }) => {
    const dispatch = useDispatch();

    const methods = useForm({
        ...FORM_INITIAL_STATE,
        defaultValues: {
            ...FORM_INITIAL_STATE.defaultValues,
            onboardingType: ONBOARDING_TYPE_MANUAL,
            templateName: '',
            templateType: null,
            templateId: '',
            senderId: '',
            messageContent: '',
            csvFile: null,
        },
    });

    const {
        control,
        handleSubmit,
        setValue,
        setError,
        clearErrors,
        reset,
        watch,
        formState: { isValid, errors },
    } = methods;

    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const isUpdate = type === true;
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: isUpdate ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;

    const [templateId, setTemplateId] = useState(null);
    const [csvImportError, setCsvImportError] = useState('');
    const [csvParsing, setCsvParsing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [sampleData, setSampleData] = useState([]);

    const onboardingType = watch('onboardingType');
    const isImportCsv = onboardingType === ONBOARDING_TYPE_IMPORT_CSV;

    const eligibleRows = useMemo(() => getEligibleRows(sampleData), [sampleData]);

    useEffect(() => {
        if (!isImportCsv) {
            setUploadedFile(null);
            setSampleData([]);
            setCsvImportError('');
        }
    }, [isImportCsv]);

    const editData = config?.data ?? config;

    useEffect(() => {
        if (!isUpdate || !editData) return;

        setTemplateId(editData.templateId || null);

        const defaults = mapEditResponseToSmsTemplateForm(editData, FORM_INITIAL_STATE.defaultValues);

        reset(defaults);
    }, [isUpdate, editData?.templateId]);

    const handleFormSubmit = async (formState) => {
        if (isSaveLoading) return;
        setCsvImportError('');
        let payload;
        if (isImportCsv && eligibleRows?.length) {
            payload = buildBulkSmsTemplatePayloadFromRows(eligibleRows, formState,uploadedFile);
        } else {
            payload = buildSmsTemplateSavePayload(formState || {}, { ...formState,isUpdate, templateId },uploadedFile);
        }
        const { status, message } = await saveApi.refetch({
            fetcher: () => dispatch(saveSmsTemplates(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: isUpdate ? 'edit' : 'create',
        });
        if (status) handleCancel(true);
        else setCsvImportError(message || 'Save failed.');
    };

    const handleCsvFileSelect = (file) => {
        setCsvImportError('');
        setCsvParsing(true);
        setUploadedFile(file);
        parseFileToRows(file)
            .then((rows) => {
                if (!rows?.length) {
                    setCsvImportError('File has no data rows.');
                    setSampleData([]);
                    return;
                }
                const validation = validateMandatoryColumns(rows);
                if (!validation.valid) {
                    setCsvImportError(validation.message);
                    setSampleData([]);
                    return;
                }
                setSampleData(rows);
            })
            .catch((err) => {
                setCsvImportError(err?.message || 'Failed to parse file.');
                setSampleData([]);
            })
            .finally(() => setCsvParsing(false));
    };

    const handleCsvClear = () => {
        setUploadedFile(null);
        setSampleData([]);
        setCsvImportError('');
    };

    const [actionsPortalTarget, setActionsPortalTarget] = useState(null);

    useEffect(() => {
        setActionsPortalTarget(document.getElementById(SMS_VENDOR_FORM_ACTIONS_PORTAL_ID));

        return () => {
            setActionsPortalTarget(null);
        };
    }, []);

    const handlePrimaryAction = () => {
        if (isSaveLoading) return;
        if (isImportCsv) {
            handleFormSubmit();
            return;
        }
        handleSubmit(handleFormSubmit)();
    };

    const renderFormActions = () => (
        <div className="buttons-holder pref-cs-buttons-outside mt20">
            <RSSecondaryButton
                type="button"
                blockInteraction={isSaveLoading}
                onClick={() => {
                    if (isSaveLoading) return;
                    handleCancel(true);
                }}
                id="rs_SMSTemplateCreate_Cancel"
            >
                {CANCEL}
            </RSSecondaryButton>
            {addAccess && (
                <RSPrimaryButton
                    type="button"
                    className={
                        isImportCsv
                            ? !eligibleRows?.length || isSaveLoading
                                ? 'click-off'
                                : ''
                            : Object.keys(errors)?.length
                              ? 'click-off'
                              : ''
                    }
                    disabled={isImportCsv ? !eligibleRows?.length || isSaveLoading : false}
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents={isSaveLoading}
                    onClick={handlePrimaryAction}
                    id="rs_SMSTemplateCreate_Save"
                >
                    {isImportCsv
                        ? isSaveLoading
                            ? 'Importing...'
                            : SAVE
                        : isUpdate
                          ? UPDATE
                          : SAVE}
                </RSPrimaryButton>
            )}
        </div>
    );

    const formActions = actionsPortalTarget ? createPortal(renderFormActions(), actionsPortalTarget) : null;

    return (
        <FormProvider {...methods}>
            <form id={SMS_TEMPLATE_CREATE_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
                <div className={isSaveLoading ? 'pe-none click-off' : ''}>
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>Add SMS Template </h4>
                        </div>
                        {!isUpdate && (
                            <div className="form-group mb25">
                                <Row>
                                    <Col sm={4} className="d-flex gap-4">
                                        <RSRadioButton
                                            name="onboardingType"
                                            id="sms_template_onboarding_manual"
                                            control={control}
                                            labelName={ONBOARDING_TYPE_MANUAL}
                                        />
                                        <RSRadioButton
                                            name="onboardingType"
                                            id="sms_template_onboarding_csv"
                                            control={control}
                                            labelName={ONBOARDING_TYPE_IMPORT_CSV}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>
                    <div>
                        {isImportCsv && !isUpdate ? (
                            <>
                                <div className='form-group mt40'>
                                    <Row>
                                        <Col sm={7}>
                                            <RSFileUpload
                                                key={uploadedFile ? 'has-file' : 'no-file'}
                                                control={control}
                                                name="csvFile"
                                                setError={setError}
                                                clearErrors={clearErrors}
                                                text="Browse"
                                                accept=".csv,.xlsx,.xls"
                                                placeholder={uploadedFile?.name || 'Choose file'}
                                                moreFiles={false}
                                                size={10 * 1024 * 1024}
                                                watch={watch}
                                                isRefresh={!!uploadedFile}
                                                required
                                                resetValue={() => {
                                                    handleCsvClear();
                                                    setValue('csvFile', null);
                                                }}
                                                handleChange={(e) => {
                                                    const file = e?.target?.files?.[0];
                                                    if (!file) return;
                                                    handleCsvFileSelect(file);
                                                }}
                                                isUploadResetIconOutside={true}
                                                customRenderText={<div className="align-items-center d-flex justify-content-between">
                                                    <div className='d-flex align-items-baseline'>
                                                        <small className='mr5'>
                                                            {ACCEPTS_ONLY_CSV(1, '.xls, .xlsx'
                                                            )}
                                                        </small>
                                                        <RSPPophover
                                                            position="top"
                                                            className="rs-tooltip-text-multi"
                                                            text={
                                                                <>
                                                                    <ul>
                                                                        <li>
                                                                            Acceptance rule: <br /> Only Approved and Active templates with all
                                                                            mandatory values are accepted.
                                                                        </li>
                                                                        <li>
                                                                            Rejection rule: <br />Records with any mandatory field missing,
                                                                            null, or empty will be skipped.
                                                                        </li>
                                                                    </ul>
                                                                </>
                                                            }
                                                        >
                                                            <i
                                                                className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                                id="circle_question_mark_csv"
                                                            />
                                                        </RSPPophover>

                                                    </div>

                                                    <RSTooltip
                                                        text="Download sample format"
                                                        position="top"
                                                        className="lh0 position-relative top3"
                                                    >
                                                        <i
                                                            className={`${csv_download_medium} color-primary-blue icon-md cp`}
                                                            role="button"
                                                            tabIndex={0}
                                                            aria-label="Download sample CSV"
                                                            onClick={() => {
                                                                const content = SMS_TEMPLATE_SAMPLE_CSV_CONTENT;
                                                                const file = new Blob([content.join('\n')], {
                                                                    type: 'text/csv;charset=utf-8;',
                                                                });
                                                                const link = document.createElement('a');
                                                                link.href = URL.createObjectURL(file);
                                                                link.download = 'sample_templates.csv';
                                                                link.click();
                                                                URL.revokeObjectURL(link.href);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    const content = SMS_TEMPLATE_SAMPLE_CSV_CONTENT;
                                                                    const file = new Blob([content.join('\n')], {
                                                                        type: 'text/csv;charset=utf-8;',
                                                                    });
                                                                    const link = document.createElement('a');
                                                                    link.href = URL.createObjectURL(file);
                                                                    link.download = 'sample_sms_templates.csv';
                                                                    link.click();
                                                                    URL.revokeObjectURL(link.href);
                                                                }
                                                            }}
                                                        />
                                                    </RSTooltip>

                                                </div>
                                                }
                                            />

                                        </Col>
                                    </Row>
                                </div>
                                <div className='form-group'>
                                    {uploadedFile && (
                                        <Row>
                                            <Col sm={4}>
                                                <div
                                                    className={`${csvParsing ||
                                                        (sampleData.length > 0 && !csvImportError)
                                                        ? 'rsfb-valid'
                                                        : 'rsfb-invalid'
                                                        } rs-file-box`}
                                                >
                                                    <div className="rsfb-file-info">
                                                        <div className='align-items-center d-flex justify-content-between '>
                                                            {/* {uploadedFile?.name?.length <= 25 ? (
                                                        <h4 className='mb0'>{uploadedFile.name}</h4>
                                                    ) : (
                                                        <RSTooltip text={uploadedFile.name} position="top">
                                                            <span>{truncateTitle(uploadedFile.name, 25)}</span>
                                                        </RSTooltip>
                                                    )} */}
                                                            <TruncateCell value={uploadedFile?.name} noTable={true} />
                                                            <div className="rsfb-status-icon position-static">
                                                                <div className="d-flex">
                                                                    {csvParsing ? (
                                                                        <RSTooltip text="Processing..." className="lh0">
                                                                            <i
                                                                                className={`${circle_tick_medium} icon-md`}
                                                                            />
                                                                        </RSTooltip>
                                                                    ) : sampleData.length > 0 && !csvImportError ? (
                                                                        <RSTooltip text="Success" className="lh0">
                                                                            <i
                                                                                className={`${circle_tick_medium} icon-md`}
                                                                            />
                                                                        </RSTooltip>
                                                                    ) : (
                                                                        <RSTooltip
                                                                            text={
                                                                                csvImportError ||
                                                                                'Invalid file. Check mandatory columns and format.'
                                                                            }
                                                                            className="lh0"
                                                                        >
                                                                            <i
                                                                                className={`${circle_exclamatory_medium} icon-md`}
                                                                            />
                                                                        </RSTooltip>
                                                                    )}
                                                                    <RSTooltip text={DELETE} className="lh0 ml10">
                                                                        <i
                                                                            className={`${delete_medium} icon-md color-primary-red`}
                                                                            onClick={() => {
                                                                                handleCsvClear();
                                                                                setValue('csvFile', null);
                                                                            }}
                                                                            role="button"
                                                                            tabIndex={0}
                                                                            onKeyDown={(e) =>
                                                                                e.key === 'Enter' &&
                                                                                (handleCsvClear(), setValue('csvFile', null))
                                                                            }
                                                                        />
                                                                    </RSTooltip>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='mb30 mt10'>
                                                <span className='align-items-center d-flex lh-sm'>
                                                    <small >Total row(s): </small>
                                                    {sampleData.length > 1000 ? (
                                                        <RSTooltip text={numberWithCommas(sampleData.length)} position="top">
                                                            <span className='font-bold ml5'>{formatNumber(sampleData.length)}</span>
                                                        </RSTooltip>
                                                    ) : (
                                                        <span className='font-bold ml5'>{formatNumber(sampleData.length)}</span>
                                                    )}
                                                </span>
                                                <span className='align-items-center d-flex lh-sm'>
                                                    <small >Excluded row(s): </small>
                                                    {sampleData.length - eligibleRows.length > 1000 ? (
                                                        <RSTooltip text={numberWithCommas(sampleData.length - eligibleRows.length)} position="top">
                                                            <span className='font-bold ml5'>{formatNumber(sampleData.length - eligibleRows.length)}</span>
                                                        </RSTooltip>
                                                    ) : (
                                                        <span className='font-bold ml5'>{formatNumber(sampleData.length - eligibleRows.length)}</span>
                                                    )}
                                                </span>
                                            </div>
                                                    </div>
                                                    <div className="rsfb-inprogress rsfb-file-status d-flex align-items-center justify-content-between py1">
                                                        {csvParsing || (sampleData.length > 0 && !csvImportError) ? (
                                                            <div className="text-white d-flex align-items-center ">
                                                                <span className='pr0'>{csvParsing ? 'In progress' : 'Valid row(s) : '}</span>
                                                                {!csvParsing && (
                                                                    eligibleRows.length > 1000 ? (
                                                                        <RSTooltip text={numberWithCommas(eligibleRows.length)} position="top">
                                                                            <span className='font-bold pl5'>{formatNumber(eligibleRows.length)}</span>
                                                                        </RSTooltip>
                                                                    ) : (
                                                                        <span className='font-bold pl5'>{formatNumber(eligibleRows.length)}</span>
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <TruncateCell
                                                                value={csvImportError || 'Invalid headers/column count'}
                                                            />
                                                        )}
                                                        <span>
                                                            <RSTooltip
                                                                text={
                                                                    csvParsing
                                                                        ? 'Processing file...'
                                                                        : sampleData.length > 0 && !csvImportError
                                                                            ? 'Valid template data. Only Approved and Active templates with all mandatory values are accepted; others are skipped.'
                                                                            : 'Only Approved and Active templates with all mandatory values are accepted; others are skipped. Ensure your CSV includes mandatory columns: Template Name, Type, Header, Status, Approval Status, Template Message.'
                                                                }
                                                                position="top"
                                                                className="lh0"
                                                            >
                                                                <i
                                                                    className={`${circle_info_medium} icon-md color-primary-white`}
                                                                />
                                                            </RSTooltip>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                                {/* {uploadedFile && sampleData.length > 0 && (
                                    <div className="form-group">
                                        <div className="rss-left d-flex justify-content-between align-items-center flex-wrap">
                                            <h5 className="p4">
                                                <small>
                                                    Only Approved and Active templates with all mandatory values are
                                                    accepted; others are skipped.
                                                </small>
                                            </h5>
                                            {eligibleRows.length < sampleData.length && (
                                                <p className="text-muted">
                                                    Showing {eligibleRows.length} of {sampleData.length} rows.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )} */}
                                {uploadedFile && sampleData.length > 0 && (
                                    <div className="rs-kendo-bulk-grid-wrapper">
                                        <KendoGrid
                                            data={eligibleRows}
                                            column={getBulkGridColumns()}
                                            settings={{ total: eligibleRows.length }}
                                            pageable={eligibleRows.length > 10}
                                            scrollable="scrollable"
                                            config={{ pageSize: 10 }}
                                            noBoxShadow
                                            isCustomBox
                                            noDataText={
                                                eligibleRows.length === 0 && sampleData.length > 0
                                                    ? 'No eligible rows. Ensure Status is Active , Approval Status is Approved .'
                                                    : 'No rows'
                                            }
                                            isLoading={csvParsing}
                                        />
                                    </div>
                                )}
                                {csvParsing && <HorizontalSkeleton size={160} className="mt30" />}
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={4}>
                                            <ListNameExists
                                                name="templateName"
                                                field="templateName"
                                                placeholder={TEMPLATE_NAME}
                                                apiCallback={checkTemplateNameExists}
                                                condition={(data) => !data?.exists}
                                                rules={{ required: 'Enter template name' }}
                                                customErrorMessage="Enter template name"
                                                maxLength={TEMPLATE_INPUT_MAX_LENGTH}
                                                currentValue={isUpdate ? editData?.templateName : ''}
                                                noEmoji={true}
                                            />
                                        </Col>
                                        <Col sm={4}>
                                            <RSKendoDropDownList
                                                name="templateType"
                                                data={TEMPLATE_TYPE_OPTIONS}
                                                control={control}
                                                defaultValue={TEMPLATE_TYPE_OPTIONS[0]}
                                                textField="templateTypeIdName"
                                                dataItemKey="templateTypeId"
                                                label={TEMPLATE_TYPE}
                                                required
                                                rules={{ required: 'Select template type' }}
                                            />
                                            {watch('templateType')?.templateTypeId === 'transactional' && (
                                                <small>Includes Service-Implicit, OTP</small>
                                            )}
                                            {watch('templateType')?.templateTypeId === 'promotional' && (
                                                <small>Includes Service-Explicit</small>
                                            )}
                                        </Col>
                                        <Col sm={4} className={isUpdate ? 'click-off pe-none' : ''}>
                                            <RSInput
                                                type="text"
                                                name="templateId"
                                                placeholder="DLT template Id"
                                                control={control}
                                                maxLength={TEMPLATE_ID_MAX_LENGTH}
                                                onKeyDown={onlyNumbers}
                                                disabled={isUpdate}
                                                noEmoji={true}
                                            />
                                            <small>Mandatory for India</small>
                                        </Col>
                                    </Row>
                                </div>

                                <div className="form-group">
                                    <Row>
                                        <Col sm={8}>
                                            <Controller
                                                control={control}
                                                name="senderId"
                                                rules={getMainSenderIdRules()}
                                                render={({ field }) => (
                                                    <input type="hidden" {...field} value={field.value || ''} />
                                                )}
                                            />
                                            <RSTagsComponent
                                                placeholder={SENDER_ID}
                                                tags={(watch('senderId') || '')
                                                    .split(',')
                                                    .map((s) => s.trim())
                                                    .filter(Boolean)}
                                                updatedTags={(tags) =>
                                                    setValue('senderId', tags.join(', '), { shouldValidate: true })
                                                }
                                                maxLength={75}
                                                isRefresh={false}
                                                isNoOfCharacters
                                                required
                                                errorMessage={errors?.senderId?.message}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <div className="rs-sub-heading">
                                    <div className="rss-left">
                                        <h4> Template message</h4>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={8}>
                                            <RSTextarea
                                                control={control}
                                                name="messageContent"
                                                placeholder="Hi {# name #}, your order {# order_id #} has been confirmed."
                                                required
                                                rules={{
                                                    required: 'Template message content is required',
                                                    ...getMessageContentValidate(),
                                                }}
                                                maxLength={1000}
                                                noEmoji={true}
                                            />
                                            <div className='d-flex justify-content-between'>
                                                <small>
                                                    Use variables like {'{# name #}'}, {'{# otp #}'}, {'{# order_id #}'}
                                                </small>
                                                <small className='text-end -mb10'>
                                                    {`${watch('messageContent')?.length} / 1000`}
                                                </small>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </form>
            {formActions}
        </FormProvider>
    );
};

export default SMSTemplateCreate;
