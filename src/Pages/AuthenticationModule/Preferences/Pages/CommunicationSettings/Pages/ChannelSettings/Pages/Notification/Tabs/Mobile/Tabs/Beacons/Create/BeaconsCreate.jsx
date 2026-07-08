import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import * as placeholder from 'Constants/GlobalConstant/Placeholders';
import * as error from 'Constants/GlobalConstant/ValidationMessage';
import * as regex from 'Constants/GlobalConstant/Regex';
import * as icons from 'Constants/GlobalConstant/Glyphicons';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import ListNameExists from 'Components/ListNameExists';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import RSTooltip from 'Components/RSTooltip';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import { formatNumber } from 'Utils/index';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import AddStoreModal from './AddStoreModal';
import AddBeaconOptionModal from './AddBeaconOptionModal';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    checkBeaconExists,
    getBeaconById,
    saveBeaconDetails,
    saveBeaconDetailsBulk,
} from 'Reducers/preferences/CommunicationSettings/Beacons/request';
import { fetchOfferBrand } from 'Reducers/preferences/OfferManagements/request';
import {
    getBeaconFormDefaults,
    DEFAULT_FLOOR_OPTIONS,
    DEFAULT_IDENTIFICATION_OPTIONS,
    IDENTIFICATION_ENTRANCE_EXIT,
    INSTORE_IDENTIFICATION,
    BEACON_ONBOARDING_TYPE_MANUAL,
    BEACON_ONBOARDING_TYPE_IMPORT_CSV,
    resolveDropdownValue,
    findDropdownOption,
    findStoreOption,
    resolveStoreValue,
    buildDropdownOptions,
    appendDropdownOption,
    parseIdentificationSelection,
    normalizeIdentificationSelection,
    serializeIdentificationValue,
    validateBeaconCsv,
    encodeBeaconCsvForUpload,
    downloadBeaconSampleCsv,
} from '../constant';

const BeaconsCreate = ({ onCancel, onSave }) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector(getSessionId);
    const methods = useForm({ defaultValues: getBeaconFormDefaults(), mode: 'onChange' });
    const { control, handleSubmit, reset, setValue, watch, clearErrors, setError } = methods;
    const [originalName, setOriginalName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [storeOptions, setStoreOptions] = useState([]);
    const [isStoreLoading, setIsStoreLoading] = useState(false);
    const [floorOptions, setFloorOptions] = useState(DEFAULT_FLOOR_OPTIONS);
    const [showAddStoreModal, setShowAddStoreModal] = useState(false);
    const [showAddFloorModal, setShowAddFloorModal] = useState(false);
    const [csvImportError, setCsvImportError] = useState('');
    const [csvImportErrorDetail, setCsvImportErrorDetail] = useState('');
    const [csvParsing, setCsvParsing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [csvText, setCsvText] = useState('');
    const [parsedCsvRowCount, setParsedCsvRowCount] = useState(0);
    const [validCsvRowCount, setValidCsvRowCount] = useState(0);
    const identificationSelection = watch('identification');
    const onboardingType = watch('onboardingType');
    const [beaconId] = useState(() => {
        const state = window.history?.state;
        return state?.beaconId || 0;
    });

    const isImportCsv = !beaconId && onboardingType === BEACON_ONBOARDING_TYPE_IMPORT_CSV;
    const canSubmitCsv = Boolean(uploadedFile && csvText && validCsvRowCount > 0 && !csvImportError && !csvParsing);

    const loadStoreOptions = useCallback(async () => {
        if (!departmentId || !clientId || !userId) return [];
        setIsStoreLoading(true);
        const response = await dispatch(
            fetchOfferBrand({ departmentId, clientId, userId, mode: 0 }),
        );
        const options = response?.status && Array.isArray(response.data) ? response.data : [];
        setStoreOptions(options);
        setIsStoreLoading(false);
        return options;
    }, [departmentId, clientId, userId, dispatch]);

    useEffect(() => {
        loadStoreOptions();
    }, [loadStoreOptions]);

    useEffect(() => {
        if (!isImportCsv) {
            setUploadedFile(null);
            setCsvText('');
            setParsedCsvRowCount(0);
            setValidCsvRowCount(0);
            setCsvImportError('');
            setCsvImportErrorDetail('');
            setValue('csvFile', null);
        }
    }, [isImportCsv, setValue]);

    const handleCsvClear = () => {
        setUploadedFile(null);
        setCsvText('');
        setParsedCsvRowCount(0);
        setValidCsvRowCount(0);
        setCsvImportError('');
        setCsvImportErrorDetail('');
        clearErrors('csvFile');
    };

    const handleCsvFileSelect = async (file) => {
        setCsvImportError('');
        setCsvImportErrorDetail('');
        clearErrors('csvFile');
        setCsvParsing(true);
        setUploadedFile(file);

        const currentStoreOptions = storeOptions.length ? storeOptions : await loadStoreOptions();

        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result || '');
            const validation = validateBeaconCsv(text, currentStoreOptions);
            const detail = validation.errors?.length ? validation.errors.join(' ') : validation.message;

            if (!validation.valid) {
                setCsvImportError(validation.message || 'Invalid headers/column count');
                setCsvImportErrorDetail(detail);
                setCsvText('');
                setParsedCsvRowCount(validation.rows?.length || 0);
                setValidCsvRowCount(0);
                setValue('csvFile', null);
            } else {
                setCsvText(text);
                setParsedCsvRowCount(validation.rows.length);
                setValidCsvRowCount(validation.rows.length);
                setValue('csvFile', file.name, { shouldValidate: false });
            }
            setCsvParsing(false);
        };
        reader.onerror = () => {
            const message = 'Failed to read the file. Please try again.';
            setCsvImportError(message);
            setCsvImportErrorDetail(message);
            setCsvText('');
            setParsedCsvRowCount(0);
            setValidCsvRowCount(0);
            setValue('csvFile', null);
            setCsvParsing(false);
        };
        reader.readAsText(file);
    };

    const handleAddStoreSuccess = async ({ legalName }) => {
        const options = await loadStoreOptions();
        const newStore = findStoreOption(legalName, options);
        if (newStore) {
            setValue('store', newStore, { shouldValidate: true });
        }
    };

    const handleAddFloorSuccess = (floorName) => {
        const updated = appendDropdownOption(floorOptions, floorName);
        setFloorOptions(updated);
        const newFloor = findDropdownOption(floorName, updated);
        if (newFloor) {
            setValue('floor', newFloor, { shouldValidate: true });
        }
    };

    const handleIdentificationChange = (event) => {
        const normalized = normalizeIdentificationSelection(
            event.value,
            identificationSelection,
        );
        event.value = normalized;
        setValue('identification', normalized, { shouldValidate: true, shouldDirty: true });
    };

    useEffect(() => {
        if (!beaconId) return;

        const fetchDetails = async () => {
            setIsLoading(true);
            const response = await dispatch(getBeaconById({ id: beaconId }));
            setIsLoading(false);

            if (response?.status && response?.data) {
                const data = response.data;
                const nextFloorOptions = buildDropdownOptions(
                    data?.floorList,
                    DEFAULT_FLOOR_OPTIONS,
                );

                setFloorOptions(nextFloorOptions);
                setOriginalName(data?.name || '');
                reset({
                    name: data?.name || '',
                    uuid: data?.uuid || '',
                    major: data?.major ?? '',
                    minor: data?.minor ?? '',
                    store: findStoreOption(data?.store, storeOptions),
                    floor: findDropdownOption(data?.floor, nextFloorOptions),
                    zoneName: data?.zoneName || '',
                    identification: parseIdentificationSelection(data?.identification),
                    onboardingType: BEACON_ONBOARDING_TYPE_MANUAL,
                    csvFile: null,
                });
            }
        };

        fetchDetails();
    }, [beaconId, dispatch, reset, storeOptions]);

    const handleFormSubmit = async (formState) => {
        if (isImportCsv) {
            if (!canSubmitCsv) {
                setCsvImportError(csvImportError || 'Upload a valid CSV file.');
                setCsvImportErrorDetail(csvImportErrorDetail || csvImportError || 'Upload a valid CSV file.');
                return;
            }

            setIsLoading(true);
            const response = await dispatch(
                saveBeaconDetailsBulk({
                    departmentId,
                    encodedData: encodeBeaconCsvForUpload(csvText),
                }),
            );
            setIsLoading(false);

            if (response?.status !== false) {
                onSave(response);
            } else {
                const message = response?.message || 'Failed to upload beacons. Please check your file data.';
                setCsvImportError(message);
                setCsvImportErrorDetail(message);
            }
            return;
        }

        const selectedFloor = resolveDropdownValue(formState.floor, floorOptions);
        const selectedIdentification = serializeIdentificationValue(formState.identification);

        const payload = {
            id: beaconId || 0,
            name: formState.name?.trim(),
            major: Number(formState.major),
            minor: Number(formState.minor),
            uuid: formState.uuid?.trim(),
            departmentId,
            store: resolveStoreValue(formState.store),
            floor: selectedFloor,
            zoneName: formState.zoneName?.trim(),
            identification: selectedIdentification,
        };

        const response = await dispatch(saveBeaconDetails(payload));
        if (response?.status !== false) {
            onSave(response);
        }
    };

    const renderManualForm = () => (
        <>
            <div className="form-group">
                <Row>
                    <Col sm={4}>
                        <ListNameExists
                            name="name"
                            field="name"
                            apiCallback={checkBeaconExists}
                            condition={(res) => !res?.status}
                            currentValue={originalName}
                            placeholder={placeholder.BEACON_NAME}
                            maxLength={regex.MAX_LENGTH50}
                            customError="Beacon name already exists"
                            customErrorMessage={error.ENTER_NAME || 'Enter beacon name'}
                            rules={{
                                required: error.ENTER_NAME || 'Enter beacon name',
                            }}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSInput
                            control={control}
                            name="uuid"
                            placeholder={placeholder.BEACON_UUID}
                            required
                            maxLength={regex.MAX_LENGTH50}
                            rules={{
                                required: 'Enter beacon UUID',
                            }}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSInput
                            control={control}
                            name="major"
                            placeholder={placeholder.BEACON_MAJOR_ID}
                            type="number"
                            required
                            rules={{
                                required: 'Enter major ID',
                                min: { value: 0, message: 'Enter a valid major ID' },
                            }}
                        />
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={4}>
                        <RSInput
                            control={control}
                            name="minor"
                            placeholder={placeholder.BEACON_MINOR_ID}
                            type="number"
                            required
                            rules={{
                                required: 'Enter minor ID',
                                min: { value: 0, message: 'Enter a valid minor ID' },
                            }}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDownList
                            control={control}
                            name="store"
                            label={placeholder.BEACON_STORE}
                            data={storeOptions}
                            textField="legalName"
                            dataItemKey="brandID"
                            isLoading={isStoreLoading}
                            footer={
                                <span id="rs_BeaconsCreate_addStore">
                                    <RSDropdownFooterBtn
                                        title={placeholder.ADD_STORE}
                                        handleClick={() => setShowAddStoreModal(true)}
                                    />
                                </span>
                            }
                        />
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDownList
                            control={control}
                            name="floor"
                            label={placeholder.BEACON_FLOOR}
                            data={floorOptions}
                            textField="value"
                            dataItemKey="id"
                            footer={
                                <span id="rs_BeaconsCreate_addFloor">
                                    <RSDropdownFooterBtn
                                        title={placeholder.ENTER_FLOOR}
                                        handleClick={() => setShowAddFloorModal(true)}
                                    />
                                </span>
                            }
                        />
                    </Col>
                </Row>
            </div>

            <div className="form-group">
                <Row>
                    <Col sm={4}>
                        <RSInput
                            control={control}
                            name="zoneName"
                            placeholder={placeholder.BEACON_ZONE_NAME}
                            maxLength={regex.MAX_LENGTH50}
                        />
                    </Col>
                    <Col sm={4} className="beacon-identification-field">
                        <div className="beacon-identification-input-row">
                            <div className="beacon-identification-input">
                                <RSMultiSelect
                                    control={control}
                                    name="identification"
                                    label={placeholder.BEACON_IDENTIFICATION}
                                    data={DEFAULT_IDENTIFICATION_OPTIONS}
                                    textField="value"
                                    dataItemKey="id"
                                    isCustomOnchange
                                    setError={setError}
                                    clearErrors={clearErrors}
                                    customErrorMessage="You can select up to two options"
                                    rules={{
                                        validate: (value) => {
                                            const items = parseIdentificationSelection(value);
                                            const values = items.map((item) => item.value);
                                            if (!values.length) return 'Select beacon identification';
                                            if (
                                                values.includes(INSTORE_IDENTIFICATION) &&
                                                values.some((entry) =>
                                                    IDENTIFICATION_ENTRANCE_EXIT.includes(entry),
                                                )
                                            ) {
                                                return 'Instore cannot be combined with Store Entrance or Store Exit';
                                            }
                                            return true;
                                        },
                                    }}
                                    handleChange={handleIdentificationChange}
                                />
                            </div>
                            <RSTooltip text={placeholder.BEACON_IDENTIFICATION_INFO} position="top">
                                <i
                                    className={`${icons.circle_question_mark_mini} icon-xs color-primary-blue beacon-identification-info-icon`}
                                    id="rs_BeaconsCreate_identificationInfo"
                                />
                            </RSTooltip>
                        </div>
                    </Col>
                </Row>
            </div>

            <div className="beacon-info-note mt20" role="alert">
                {placeholder.BEACON_INFO_BANNER}
            </div>
        </>
    );

    const renderCsvImport = () => (
        <>
            <div className="form-group mt40">
                <Row>
                    <Col sm={7}>
                        <RSFileUpload
                            key={uploadedFile ? 'beacon-csv-has-file' : 'beacon-csv-no-file'}
                            control={control}
                            name="csvFile"
                            setError={setError}
                            clearErrors={clearErrors}
                            text="Browse"
                            accept=".csv"
                            placeholder={uploadedFile?.name || 'Choose file'}
                            moreFiles={false}
                            size={5 * 1024 * 1024}
                            watch={watch}
                            isRefresh={!!uploadedFile}
                            resetValue={() => {
                                handleCsvClear();
                                setValue('csvFile', null);
                            }}
                            handleChange={(e) => {
                                const file = e?.target?.files?.[0];
                                if (!file) return;
                                handleCsvFileSelect(file);
                            }}
                            isUploadResetIconOutside
                            customRenderText={
                                <div className="align-items-center d-flex justify-content-between">
                                    <small className="mr5">{placeholder.ACCEPTS_ONLY_CSV(1)}</small>
                                    <RSTooltip
                                        text={placeholder.DOWNLOAD_SAMPLE}
                                        position="top"
                                        className="lh0 position-relative top3"
                                    >
                                        <i
                                            className={`${icons.csv_download_medium} color-primary-blue icon-md cp`}
                                            role="button"
                                            tabIndex={0}
                                            aria-label="Download sample CSV"
                                            id="rs_BeaconsCreate_downloadSample"
                                            onClick={downloadBeaconSampleCsv}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    downloadBeaconSampleCsv();
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

            {uploadedFile && (
                <div className="form-group">
                    <Row>
                        <Col sm={4}>
                            <div
                                className={`${
                                    csvParsing || (validCsvRowCount > 0 && !csvImportError)
                                        ? 'rsfb-valid'
                                        : 'rsfb-invalid'
                                } rs-file-box`}
                            >
                                <div className="rsfb-file-info">
                                    <div className="align-items-center d-flex justify-content-between">
                                        <TruncateCell value={uploadedFile?.name} noTable />
                                        <div className="rsfb-status-icon position-static">
                                            <div className="d-flex">
                                                {csvParsing ? (
                                                    <RSTooltip text="Processing..." className="lh0">
                                                        <i className={`${icons.circle_tick_medium} icon-md`} />
                                                    </RSTooltip>
                                                ) : validCsvRowCount > 0 && !csvImportError ? (
                                                    <RSTooltip text="Success" className="lh0">
                                                        <i className={`${icons.circle_tick_medium} icon-md`} />
                                                    </RSTooltip>
                                                ) : (
                                                    <RSTooltip
                                                        text={
                                                            csvImportErrorDetail ||
                                                            csvImportError ||
                                                            'Invalid file. Check mandatory columns and format.'
                                                        }
                                                        className="lh0"
                                                    >
                                                        <i className={`${icons.circle_exclamatory_medium} icon-md`} />
                                                    </RSTooltip>
                                                )}
                                                <RSTooltip text={placeholder.DELETE} className="lh0 ml10">
                                                    <i
                                                        className={`${icons.delete_medium} icon-md color-primary-red`}
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={() => {
                                                            handleCsvClear();
                                                            setValue('csvFile', null);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                handleCsvClear();
                                                                setValue('csvFile', null);
                                                            }
                                                        }}
                                                    />
                                                </RSTooltip>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb30 mt10">
                                        <span className="align-items-center d-flex lh-sm">
                                            <small>Total row(s): </small>
                                            <span className="font-bold ml5">{formatNumber(parsedCsvRowCount)}</span>
                                        </span>
                                        {parsedCsvRowCount > validCsvRowCount && (
                                            <span className="align-items-center d-flex lh-sm">
                                                <small>Excluded row(s): </small>
                                                <span className="font-bold ml5">
                                                    {formatNumber(parsedCsvRowCount - validCsvRowCount)}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="rsfb-inprogress rsfb-file-status d-flex align-items-center justify-content-between py1">
                                    {csvParsing || (validCsvRowCount > 0 && !csvImportError) ? (
                                        <div className="text-white d-flex align-items-center">
                                            <span className="pr0">
                                                {csvParsing ? 'In progress' : 'Valid row(s) : '}
                                            </span>
                                            {!csvParsing && (
                                                <span className="font-bold pl5">{formatNumber(validCsvRowCount)}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <TruncateCell
                                            value={csvImportError || 'Invalid headers/column count'}
                                            noTable
                                            tooltipText={csvImportErrorDetail || csvImportError}
                                        />
                                    )}
                                    <span>
                                        <RSTooltip
                                            text={
                                                csvParsing
                                                    ? 'Processing file...'
                                                    : validCsvRowCount > 0 && !csvImportError
                                                      ? placeholder.BEACON_BULK_UPLOAD_HINT
                                                      : csvImportErrorDetail ||
                                                        csvImportError ||
                                                        placeholder.BEACON_BULK_UPLOAD_HINT
                                            }
                                            position="top"
                                            className="lh0"
                                        >
                                            <i
                                                className={`${icons.circle_info_medium} icon-md color-primary-white`}
                                            />
                                        </RSTooltip>
                                    </span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            )}
        </>
    );

    return (
        <>
            <FormProvider {...methods}>
                <form noValidate className="beacons-create-form" onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="rs-sub-heading">
                        <div className="rss-left">
                            <h4>{placeholder.BEACON_INFORMATION}</h4>
                        </div>
                        {!beaconId && (
                            <div className="form-group mb25">
                                <Row>
                                    <Col sm={6} className="d-flex gap-4">
                                        <RSRadioButton
                                            name="onboardingType"
                                            id="rs_BeaconsCreate_onboarding_manual"
                                            control={control}
                                            labelName={BEACON_ONBOARDING_TYPE_MANUAL}
                                        />
                                        <RSRadioButton
                                            name="onboardingType"
                                            id="rs_BeaconsCreate_onboarding_csv"
                                            control={control}
                                            labelName={BEACON_ONBOARDING_TYPE_IMPORT_CSV}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>

                    {isImportCsv ? renderCsvImport() : renderManualForm()}

                    <div className="buttons-holder pref-cs-buttons-outside">
                        <RSSecondaryButton type="button" onClick={onCancel} id="rs_BeaconsCreate_Cancel">
                            {placeholder.CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type={isImportCsv ? 'button' : 'submit'}
                            id="rs_BeaconsCreate_Save"
                            disabled={isLoading || (isImportCsv ? !canSubmitCsv || csvParsing : false)}
                            onClick={
                                isImportCsv
                                    ? () => handleFormSubmit(methods.getValues())
                                    : undefined
                            }
                        >
                            {isImportCsv
                                ? placeholder.UPLOAD_BEACONS
                                : beaconId > 0
                                  ? placeholder.UPDATE
                                  : placeholder.SAVE}
                        </RSPrimaryButton>
                    </div>
                </form>
            </FormProvider>

            <AddStoreModal
                show={showAddStoreModal}
                onClose={() => setShowAddStoreModal(false)}
                onSuccess={handleAddStoreSuccess}
            />

            <AddBeaconOptionModal
                show={showAddFloorModal}
                onClose={() => setShowAddFloorModal(false)}
                onSave={handleAddFloorSuccess}
                header={placeholder.ENTER_FLOOR}
                inputPlaceholder={placeholder.BEACON_FLOOR}
            />
        </>
    );
};

BeaconsCreate.propTypes = {
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
};

BeaconsCreate.defaultProps = {
    onCancel: () => {},
    onSave: () => {},
};

export default BeaconsCreate;
