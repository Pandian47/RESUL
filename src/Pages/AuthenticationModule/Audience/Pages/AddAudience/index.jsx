import { FORM_INITIAL_STATE, MANDATORY_FIELDS as MANDATORY_FIELD_KEYS, generateFrontendBindJson, resetColumnFields } from './constants';
import { ATLEAST_ONE_ROW, COLUMN_COUNT_MISMATCH, FILENAME_EXIST, HEADERS_MAXLENGTH, HEADERS_MINLENGTH, MANDATORY_FIELDS, SELECT_IMPORT_PREFERENCE, SELECT_SOURCE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_AUDIENCE_BY, ARE_YOU_SURE_WANT_TO_RESET, CANCEL, CONNECT, DOWNLOAD_SAMPLE, ENSURE_THE_FIRST_ROW_OF_YOUR_FILE, ENSURE_THE_FIRST_ROW_OF_YOUR_FILE_CSV, IMPORT_PREFERENCES, IMPORT_PREFERENCE_LABEL, IMPORT_PRESERVE_PREFERENCE_LABEL, NOTE, RESET, SOURCE, UPLOAD } from 'Constants/GlobalConstant/Placeholders';
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import _get from 'lodash/get';
import _find from 'lodash/find';
import { Container, Col, Row } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { sampleDownloadContent } from './constants';
import {
    restart_medium,
    circle_question_mark_medium,
    download_medium,
    circle_info_mini,
} from 'Constants/GlobalConstant/Glyphicons';
import { NO_SPECIAL_CHARS } from 'Constants/GlobalConstant/Regex';
import { RSPageHeaderSkeleton } from 'Components/Skeleton/Components/common';
import SkeletonShimmer from 'Components/Skeleton/Components/common/SkeletonShimmer';

const RSPageHeader = lazy(() => import('Components/RSPageHeader'));
const ResKendoDropdown = lazy(() => import('Pages/KendoDocs/CommonComponents/ResKendoDropdown'));
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import {
    audienceUploadForFiles,
    connectFTP,
    connectTLFTP,
    getAudienceImportSource,
    getAudienceInsightList,
} from 'Reducers/audience/addAudience/request';
import usePermission from 'Hooks/usePersmission';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import { resetCsvFiles } from 'Reducers/audience/addAudience/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';
import { every } from 'lodash';
import { encodeUrl, encodeUrlLegacy } from 'Utils/modules/crypto';
import { getEnvironment } from 'Utils/modules/environment';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { formatName } from 'Utils/modules/formatters';
import { checkIsBrandExists, getBrandNameUIPrintable } from 'Utils/modules/brandStorage';
import { getCsvListType } from 'Utils/modules/browserUtils';
import RemoteDataSource from './Components/RemoteDataSource/RemoteDataSource';
import useQueryParams from 'Hooks/useQueryParams';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';
import RSConfirmationModal from 'Components/ConfirmationModal';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { FIELD_LOADER_CONFIG } from 'Hooks/loaderTypes';
import AddAudienceSkeleton, { AudienceInsightsSkeleton } from 'Components/Skeleton/Components/AddAudienceSkeleton';
import addAudienceInitialState from 'Reducers/audience/addAudience/initialState';

const RSTabber = lazy(() => import('Components/RSTabber'));
const RSTabberSlide = lazy(() => import('Components/RSTabberSlide'));
const ConfigureDedupeSettings = lazy(
    () => import('./Components/ConfigureDedupeSettings/ConfigureDedupeSettings'),
);
const ConfirmationPopup = lazy(
    () => import('./Components/CSV/Components/ConfirmationPopup/ConfirmationPopup'),
);
const InsightChartPortlet = lazy(
    () => import('Pages/AuthenticationModule/Audience/Component/AudienceInsight/InsightChartPortlet'),
);
import { RenderComponent, RenderDataExchage } from './Components';

const shouldTriggerEditFlow = (editState) => {
    const editJobId = _get(editState, 'data.jobId') || _get(editState, 'jobId') || 0;
    const from = _get(editState, 'from', '');
    if (editJobId > 0) {
        return from === 'column-mapping' || from === 'targetList';
    }
    return false;
};

const AddAudienceDropdownSkeleton = () => (
    <SkeletonShimmer className="add-audience-skeleton-form__field" style={{ height: 24, borderRadius: 5, width: '100%' }} />
);

const AddAudience = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const navigateToAudienceMdm = useCallback(() => {
        const url = '/audience';
        const index = 0;
        const state1 = { index };
        const encryptState = encodeUrl(state1);
        navigate(`${url}?q=${encryptState}`, {
            state: { index },
        });
    }, [navigate]);
    const location = useLocation();
    const importSourceAPI = useApiLoader({ autoFetch: false });
    const audienceSubmitAPI = useApiLoader({ autoFetch: false });
    const audienceInsightAPI = useApiLoader({ autoFetch: false });
    const [ editLoading, setEditLoading ] = useState(false);

    const pathName = location?.pathname?.split('/')?.pop();
    // const { state } = useLocation();
    const state = useQueryParams('/audience');
    // console.log('state: ', state);
    const { permissionList, permissions } = usePermission();
    const { addAccess: addAccessRDSFTP } = _find(permissionList, { featureId: 48 });
    const { addAccess } = permissions || {};
    const { path, csvFiles, fileWiseListAnalysisData, responseHeaders, excelFilesData, insightData } = useSelector(
        (state) => state?.addAudienceReducer ?? addAudienceInitialState,
    );

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const [audRefData, setAudRefData] = useState([]);
    const [currentComponent, setCurrentComponent] = useState('');
    const [modal, setModal] = useState({
        show: false,
        type: null,
    });
    // console.log('currentComponent: ', currentComponent);
    const [addAudienceBy, setAddAudienceBy] = useState([]);
    const [isImportSourceLoading, setIsImportSourceLoading] = useState(false);
    const [isFormValid, setFormValid] = useState(false);

    const methods = useForm(FORM_INITIAL_STATE);
    const {
        handleSubmit,
        control,
        formState: { isValid, dirtyFields, isDirty, errors },
        setValue,
        setError,
        reset,
        watch,
        getValues,
        trigger,
    } = methods;
    const [isReset, setIsReset] = useState({
        show: false,
    });
    useEffect(() => {
        if (isFormValid && Object.keys(dirtyFields)?.length > 0) {
            setFormValid(false);
        }
    }, [dirtyFields]);

    const [audienceBy, listType, manualEntryImportDescription, manualEntryAudienceData] = watch([
        'audienceBy',
        'listType',
        'manualEntry.importDescription',
        'manualEntry.audienceData',
    ]);
    // console.log('audienceBy: ', audienceBy);
    const isAdHocList = listType === 'Ad-hoc list';
    const fromTLSLML =
        state?.from === 'targetList' && (state?.type === 'suppression-list' || state?.type === 'match-list');
    const isManualEntryConfigured =
        audienceBy?.typeId === 32 &&
        manualEntryImportDescription &&
        manualEntryAudienceData &&
        String(manualEntryImportDescription).trim() !== '' &&
        String(manualEntryAudienceData).trim() !== '';
    const jobId = _get(state, 'data.jobId') || _get(state, 'jobId') || 0;
    useEffect(() => {
        if (state) {
            state?.type && setCurrentComponent(state?.type?.toLowerCase());
            if (state?.from === 'master-data' && state?.type === 'SFTP') {
                setValue('audienceBy', { type: 'SFTP', typeId: 8 });
            }
            if (state?.from === 'master-data' || state?.from === 'targetList' || state?.from === 'column-mapping')
                getImportSource();

            if (shouldTriggerEditFlow(state)) {
                void import('./editFlowHandler').then(({ getFlowTypeFromState, handleEditFlow }) => {
                    const flowType = getFlowTypeFromState(state);
                    handleEditFlow({
                        jobId,
                        flowType,
                        departmentId,
                        clientId,
                        userId,
                        dispatch,
                        methods,
                        setCurrentComponent,
                        state,
                        setEditLoading,
                    });
                });
            }
        }
    }, [state, departmentId, clientId, userId]);

    useEffect(() => {
        if (state && audRefData?.length && state.from === 'targetList') {
            const findCSVType = audRefData?.find((item) => item.type === 'CSV');
            if (findCSVType) {
                reset((formState) => ({
                    ...formState,
                    audienceBy: {
                        ...findCSVType,
                    },
                }));
            }
            setCurrentComponent('csv');
        }
    }, [state, audRefData]);

    const getImportSource = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        setIsImportSourceLoading(true);
        try {
            if (addAccess) {
                const { status, data } = await importSourceAPI.refetch({
                    fetcher: ({ payload: requestPayload } = {}) =>
                        dispatch(getAudienceImportSource({ payload: requestPayload, loading: false })),
                    mode: 'create',
                    loaderConfig: FIELD_LOADER_CONFIG,
                    params: { payload },
                });
            // const { status, data } = await dispatch(getAudienceImportSource({ payload }));
                if (status) {
                    setAudRefData(data);
                } else {
                    setAudRefData([]);
                }
            } else {
                setAudRefData([]);
            }
        } finally {
            setIsImportSourceLoading(false);
        }
    };

    const needsImportSource =
        state?.from === 'master-data' || state?.from === 'targetList' || state?.from === 'column-mapping';
    const showAddAudienceSkeleton = needsImportSource && isImportSourceLoading;

    useOnlyDepChangeEffect(() => {
        if (!audRefData?.length) {
            setAddAudienceBy([]);
            return;
        }
        const attrs = audRefData
            .map((data) => {
                switch (data?.type) {
                    case 'Manual':
                        return { type: 'Manual entry', typeId: 32 };
                    case 'CSV':
                        return { type: 'CSV', typeId: 7 };
                    case 'Excel':
                        return addAccessRDSFTP ? { type: 'Excel', typeId: 169 } : null;
                    case 'SFTP':
                        return addAccessRDSFTP ? { type: 'SFTP', typeId: 8 } : null;
                    case 'Remote Data Source':
                        return addAccessRDSFTP ? { type: 'Remote data source', typeId: 3 } : null;
                    default:
                        return null;
                }
            })
            .filter(Boolean);
        setAddAudienceBy(attrs);
        // if (permissionList[47]?.addAccess) attrs.push({ type: 'Manual entry', typeId: 32 }, { type: 'CSV', typeId: 7 });
        // if (permissionList[48]?.addAccess)
        //     attrs.push({ type: 'SFTP', typeId: 8 }, { type: 'Remote data source', typeId: 3 });
        //setAddAudienceBy(attrs);
    }, [audRefData]);
    const audienceUpload = (data) => {
        // console.log('tes');
        const { audienceBy, manualEntry, CSV, FTP } = data;
        const type = audienceBy.type.toLowerCase();
        if (type.includes('manual entry')) {
            validateAudienceManual(manualEntry, data);
        } else if (type.includes('csv')) {
            validateAudienceCSV(data);
        } else if (type.includes('sftp')) {
            validateAudienceFTP(data);
        } else if (type.includes('excel')) {
            validateAudienceCSV(data);
        }
    };

    const handleCSVSavedDataPayload = (payload) => {
        const { sourceType } = payload;
        const jobId = _get(state, 'jobId') || 0;
        const isEditFlow = jobId > 0;
        let finalFrontendbindjson = '';
        const excelFileData = sourceType === 169 ? excelFilesData : null;
        try {
            const frontendbindjson = generateFrontendBindJson(
                csvFiles,
                path,
                fileWiseListAnalysisData,
                responseHeaders,
                excelFileData,
            );
            const updateFrontendbindjson = {
                frontendbindjson,
                savedDataDetails: {
                    ...payload,
                },
            };
            finalFrontendbindjson = encodeUrlLegacy(updateFrontendbindjson);
        } catch (error) {
            finalFrontendbindjson = '';
        }
        return {
            ...(isEditFlow
                ? {
                      jobid: jobId,
                      isbackenable: true,
                      identity: 'ColumnMapping',
                  }
                : {
                      identity: 'AddAudience',
                      jobid: 0,
                      isbackenable: false,
                  }),
            frontendbindjson: finalFrontendbindjson,
        };
    };

    const handleManualSaveDataPayload = (payload) => {
        const jobId = _get(state, 'jobId') || 0;
        const isEditFlow = jobId > 0;
        let finalFrontendbindjson = '';
        try {
            const updateFrontendbindjson = {
                savedDataDetails: {
                    ...payload,
                },
            };
            finalFrontendbindjson = encodeUrlLegacy(updateFrontendbindjson);
        } catch (error) {
            finalFrontendbindjson = '';
        }
        return {
            ...(isEditFlow
                ? {
                      jobid: jobId,
                      isbackenable: true,
                      identity: 'ColumnMapping',
                  }
                : {
                      identity: 'AddAudience',
                      jobid: 0,
                      isbackenable: false,
                  }),
            frontendbindjson: finalFrontendbindjson,
        };
    };

    const handleSFTPSaveDataPayload = (payload) => {
        const jobId = _get(state, 'jobId') || 0;
        const isEditFlow = jobId > 0;
        let finalFrontendbindjson = '';
        try {
            const updateFrontendbindjson = {
                savedDataDetails: {
                    ...payload,
                },
            };
            finalFrontendbindjson = encodeUrlLegacy(updateFrontendbindjson);
        } catch (error) {
            finalFrontendbindjson = '';
        }
        return {
            ...(isEditFlow
                ? {
                      referenceRid: jobId,
                      isbackEnable: true,
                      identity: 'ColumnMapping',
                  }
                : {
                      identity: 'AddAudience',
                      referenceRid: 0,
                      isbackEnable: false,
                  }),
            temp: [
                {
                    key: finalFrontendbindjson,
                },
            ],
        };
    };

    const validateAudienceCSV = (data) => {
        const { listType, listName, audienceBy } = data;
        const type = audienceBy.type.toLowerCase();
        let tempcatTypeName = !!data?.categoryType ? data?.categoryType : '';
        // console.log('catTypeName: ', !!data?.categoryType);
        let payload = {
            catType: !!data?.categoryType ? 'child' : 'parent',
            catTypeName: !!data?.categoryType ? data?.categoryType.catTypeName : tempcatTypeName,
            encodedData: path.join(','),
            sourceGroupType: 1,
            listName: '',
            sourceType: type === 'excel' ? 169 : 7,
            listType: getCsvListType(listType),
            importDescription: listName?.trim(),
            firstRowHeader: true,
            departmentId,
            clientId,
            userId,
            ...(state?.from === 'targetList' &&
                state?.mode === 'inputList' && {
                    segmentationListID: state?.segmentationListID,
                    targetListName: state?.recipientsBunchName,
                }),
            ...handleCommonPayload(data),
        };
        const savedDataPayload = handleCSVSavedDataPayload(payload);
        payload = {
            ...payload,
            ...savedDataPayload,
        };
         audienceSubmitAPI.refetch({
            fetcher: () =>
                dispatch(
                    audienceUploadForFiles({
                        payload,
                        navigate,
                        isAdHocList,
                        listType,
                        from: state?.from,
                        mode: state?.mode,
                        segmentationListID: state?.segmentationListID,
                        targetListName: state?.recipientsBunchName,
                        type: state?.type,
                        loading: false,
                    }),
                ),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
        });
    };

    const handleCommonPayload = (formState) => {
        return {
            importPreferences: handleImportPreferencePayload(formState?.isImportPreference),
            dedupeSettingId:
                parseInt(formState?.dedupeSettingSaveStatus?.dedupeSettingId, 10) ||
                state?.data?.audienceData?.dedupeSettingId ||
                0,
            isDedupeEnabled: formState?.dedupeSettingSaveStatus?.dedupeSettingStatus ?? false,
        };
    };

    const handleImportPreferencePayload = (value) => {
        const updateSpaceRemoveName = formatName(value || '');
        const updateSpacePreferenceNew = formatName(IMPORT_PREFERENCE_LABEL);
        const updateSpacePreferenceOld = formatName(IMPORT_PRESERVE_PREFERENCE_LABEL);
        const payloadConfig = {
            [updateSpacePreferenceNew]: 'update_new_data',
            [updateSpacePreferenceOld]: 'preserve_older_data',
        };
        return payloadConfig[updateSpaceRemoveName] ?? 'update_new_data';
    };
    const validateAudienceManual = (manualEntry, formState) => {
        let listType = 5;
        const audienceData = manualEntry.audienceData?.split('\n')?.filter((item) => item !== '');
        const firstRow = audienceData[0];
        const firstRowLength = firstRow?.split(',').filter((item) => item !== '')?.length;
        const isMandatoryFields = firstRow
            ?.split(',')
            .some((item) => MANDATORY_FIELD_KEYS.includes(item?.toLowerCase()));
        const mismatchedRow = audienceData.find((row) => {
            return row.split(',').length !== firstRowLength;
        });

        if (mismatchedRow) {
            setError('manualEntry.audienceData', {
                type: 'custom',
                message: COLUMN_COUNT_MISMATCH,
            });
            return;
        }
        if (firstRowLength < 5) {
            setError('manualEntry.audienceData', {
                type: 'custom',
                message: HEADERS_MINLENGTH,
            });
            return;
        } else if (firstRowLength > 25) {
            setError('manualEntry.audienceData', {
                type: 'custom',
                message: HEADERS_MAXLENGTH,
            });
            return;
        } else if (audienceData?.length < 2) {
            setError('manualEntry.audienceData', {
                type: 'custom',
                message: ATLEAST_ONE_ROW,
            });
            return;
        } else if (NO_SPECIAL_CHARS.test(firstRow)) {
            setError('manualEntry.audienceData', {
                type: 'custom',
                message: NO_SPECIAL_CHARS_MESSAGE,
            });
            return;
        } else if (!isMandatoryFields) {
            setError('manualEntry.audienceData', {
                type: 'custom',
                message: MANDATORY_FIELDS,
            });
            return;
        } else if (!firstRow.includes(getBrandNameUIPrintable(departmentId))) {
            setError('manualEntry.audienceData', {
                type: 'custom',
                message: `Invalid upload: Brand Id [${getBrandNameUIPrintable(departmentId)}] missing`,
            });
            return;
        }
        let payload = {
            catType: 'parent',
            catTypeName: '',
            encodedData: btoa(manualEntry.audienceData),
            sourceGroupType: 1,
            sourceType: audienceBy.typeId,
            listType: 5,
            importDescription: manualEntry?.importDescription?.trim(),
            firstRowHeader: true,
            departmentId,
            clientId,
            userId,
            ...handleCommonPayload(formState),
        };
        const savedDataPayload = handleManualSaveDataPayload(payload);
        payload = {
            ...payload,
            ...savedDataPayload,
        };
         audienceSubmitAPI.refetch({
            fetcher: () =>
                dispatch(
                    audienceUploadForFiles({
                        payload,
                        navigate,
                        isAdHocList,
                        listType,
                        setError,
                        name: 'manualEntry.audienceData',
                        loading: false,
                    }),
                ),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
        });
        // navigate(`/audience/add-import-audience`, {
        //     state: { from: 'manual entry', data: { audienceCount: audienceData?.length, audienceData: audienceData } },
        // });
        // audienceManualUpload();
    };

    const validateAudienceFTP = async (FTP) => {
        // console.log('FTP: ', FTP);
        const {
            ipAddress,
            userName,
            friendlyName,
            password,
            folderPath,
            portNumber,
            catType,
            categoryType,
            updatedCycle,
        } = FTP;
        let payload = {
            iPAddress: ipAddress,
            userName: userName?.trim(),
            password: password,
            path: folderPath,
            friendlyName: friendlyName?.trim(),
            departmentId: departmentId,
            port: portNumber,
            listType: getCsvListType(listType),
            sourceType: 8,
            ...(getCsvListType(listType) === 5
                ? {
                      scheduleFrequency: updatedCycle?.typeId,
                      catType: catType.toLowerCase(),
                      catTypeName: categoryType?.catTypeName,
                      port: parseInt(portNumber, 10),
                  }
                : { port: portNumber }),
            ...handleCommonPayload(FTP),
        };
        let savedDataDetails = handleSFTPSaveDataPayload(payload);
        payload = {
            ...payload,
            ...savedDataDetails,
        };
        const customListConnection = getCsvListType(listType) === 5 ? connectTLFTP : connectFTP;
        const { data, status } =
            (await audienceSubmitAPI.refetch({
                fetcher: () => dispatch(customListConnection({ payload, loading: false })),
                mode: 'create',
                loaderConfig: FIELD_LOADER_CONFIG,
            })) ?? {};
        if (status) {
            if (getCsvListType(listType) === 5) {
                const dedupePayload = {
                    dedupeSettingId: payload?.dedupeSettingId || 0,
                    departmentId,
                    clientId,
                    userId,
                    remotesettingid:
                        (typeof data === 'object' && data !== null ? data?.remoteSettingId : data) ||
                        state?.audienceData?.remoteSettingId ||
                        0,
                };
                const { updateDedupeRDS } = await import('Reducers/remoteDataSource/request');
                dispatch(updateDedupeRDS({ payload: dedupePayload, loading: false }));
                let url = '/audience/add-import-audience';
                const stateSftp = {
                    from: 'sftpTL',
                    data: {
                        audienceData: { ...data, dedupeSettingId: payload?.dedupeSettingId || 0 },
                        listType,
                        catType,
                        catTypeName: categoryType?.catTypeName,
                    },
                    isAudience: state?.isDataExchange ? false : pathName === 'add-audience',
                };
                const encryptState = encodeUrl(stateSftp);
                navigate(`${url}?q=${encryptState}`, {
                    stateSftp,
                });
                // navigate(`/audience/add-import-audience`, {
                //     state: {
                //         from: 'sftpTL',
                //         data: { audienceData: data, listType, catType, catTypeName: categoryType },
                //     },
                // });
            } else {
                setValue(`isConnected`, 'Connected Sucessfully');
                navigateToAudienceMdm();
                // navigate(`/audience`, {
                //     state: { index: 0 },
                // });
            }
        } else {
            setValue(`connectMessage`, data);
        }
        setFormValid(status);
        reset((formState) => formState, { keepDirty: false });
        // setTimeout(() => {
        //     setValue(`connectMessage`, '');
        // }, 3000);
    };

    const errorMsg = () => {
        const isEdit = jobId > 0 || state?.isSFTP;
        const friendlyNameLoading = watch('FTP.friendlyNameLoading');
        if (!isValid) return 'pe-none click-off';
        // else if (!isDirty && !isEdit) return 'pe-none click-off';
        else if (friendlyNameLoading) return 'pe-none click-off';
        else return '';
    };

    const csvError = () => {
        const listnameError = Object.hasOwn(errors, 'listName');
        const listTypeError = Object.hasOwn(errors, 'listType');
        const isColumnHeader = watch('isColumnHeader');

        const iscategoryType = watch('categoryType');
        const isattributeMapping = watch('attributeMapping');

        const hasAttributeError =
            isattributeMapping === 'Child' &&
            (iscategoryType?.catTypeID === 0 || iscategoryType?.catTypeID === undefined);

        const hasUploadError = every(csvFiles, ['isValid', true]);
        if (!listType) return 'pe-none click-off';
        else if (listTypeError) return 'pe-none click-off';
        else if ((isattributeMapping === '' || isattributeMapping === undefined) && listType === 5)
            return 'pe-none click-off';
        else if (hasAttributeError) return 'pe-none click-off';
        else if (listnameError) return 'pe-none click-off';
        else if (!isColumnHeader) return 'pe-none click-off';
        else if (!csvFiles?.length) return 'pe-none click-off';
        else if (!hasUploadError) return 'pe-none click-off';
        else return '';
    };

    const handleConfirmButtonClass = () => {
        if (audienceBy.typeId === 8) return errorMsg();
        else if (audienceBy.typeId === 7 || audienceBy.typeId === 169) return csvError();
    };

    const hasErrorExceptFilenameExist =
        Object.keys(errors)?.length !== 0 && !csvFiles?.message === FILENAME_EXIST;

    const handleBlackbaudTokenValidation = async (params) => {
        if (!!params.get('code')) {
            const payload = {
                clientId,
                departmentId,
                userId,
                connectorId: '55',
                connectorName: 'Blackbaud',
                redirectUrl: window.location.href,
            };
            const { dataExchange_connection_blackbaud_Token } = await import('Reducers/remoteDataSource/request');
            const response = await dispatch(dataExchange_connection_blackbaud_Token({ payload }));
            if (response.status) {
                let ele = {
                    sourceGroupName: 'CRM',
                    remoteDataSourceID: 55,
                    sourceName: 'Blackbaud',
                    imagePath: 'logo-blackbaud.jpg',
                    connectionType: 0,
                    type: 'CRM',
                    emailId: response?.data?.emailId || '',
                    remoteSettingId: response?.data?.remoteSettingId || 0,
                };
                const stateBlackbaud = { from: 'data_exchange', type: 'blackbaud', data: ele };
                const encryptStateBlackbaud = encodeUrl(stateBlackbaud);
                navigate(`/audience/add-audience?q=${encryptStateBlackbaud}`, {
                    state: stateBlackbaud,
                });
            }
        } else {
            const stateRedirect = { from: 'master-data' };
            const stateredirectEncode = encodeUrl(stateRedirect);
            navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
                state: stateRedirect,
            });
        }
    };
    useEffect(() => {
        if (
            new URLSearchParams(window.location.search).get('crm') === 'blackbaud' &&
            new URLSearchParams(window.location.search).get('code') !== ''
        ) {
            handleBlackbaudTokenValidation(new URLSearchParams(window.location.search));
        }
    }, []);

    const audienceByData = audienceBy?.type?.length > 0 && audienceBy?.type !== 'Remote data source';
    const eligiblePathFlow = ['master-data', 'targetList', 'column-mapping'];

    const insightTabKeys = useMemo(() => {
        if (!insightData || typeof insightData !== 'object' || insightData?.error) return [];
        const keys = Object.keys(insightData).filter((key) => Array.isArray(insightData[key]));
        return keys.sort((a, b) => {
            const aIsOthers = (a || '').toLowerCase() === 'others';
            const bIsOthers = (b || '').toLowerCase() === 'others';
            if (aIsOthers) return 1;
            if (bIsOthers) return -1;
            return 0;
        });
    }, [insightData]);

    const formatInsightTabLabel = (key) =>
        `${key?.slice(0, 1)?.toUpperCase() || ''}${key?.slice(1)?.toLowerCase() || ''}`;

    const fetchAudienceInsight = useCallback(
        async (encodedData) => {
            const env = getEnvironment();
            if (env !== 'TEAM' || !encodedData) return undefined;

            const currentListType = getValues('listType');
            const attributeMapping = getValues('attributeMapping');
            const canFetchInsights =
                currentListType !== 'Target list' || attributeMapping?.toLowerCase() === 'parent';

            if (!canFetchInsights) return undefined;

            return audienceInsightAPI.refetch({
                fetcher: ({ payload }) =>
                    dispatch(getAudienceInsightList({ payload, loading: false })),
                params: {
                    payload: { clientId, departmentId, userId, encodedData },
                },
                loaderConfig: { create: LOADER_TYPE.NONE, edit: LOADER_TYPE.NONE },
            });
        },
        [audienceInsightAPI, clientId, departmentId, dispatch, getValues, userId],
    );

    useEffect(() => {
        if (!csvFiles?.length) {
            audienceInsightAPI.reset();
        }
    }, [audienceInsightAPI, csvFiles?.length]);

    const insightTabData = useMemo(() => {
        if (!insightTabKeys.length || !insightData) return [];
        return insightTabKeys.map((tabKey) => {
            const items = Array.isArray(insightData[tabKey]) ? insightData[tabKey] : [];
            return {
                id: tabKey,
                text: formatInsightTabLabel(tabKey),
                component: () => (
                    <div className="">
                        {items.length > 0 ? (
                            <div className="sampleListDemographicsCharts d-flex flex-wrap mt30 w-100">
                                {items.map((item, index) => (
                                    <Suspense key={`${tabKey}-chart-${index}`} fallback={<AudienceInsightsSkeleton />}>
                                        <InsightChartPortlet
                                            insightData={item}
                                            chartKey={`${tabKey}-chart-${index}`}
                                        />
                                    </Suspense>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No data available</div>
                        )}
                    </div>
                ),
            };
        });
    }, [insightTabKeys, insightData]);

    const renderInsights = () => {
        if (audienceInsightAPI.isFetching) {
            return <AudienceInsightsSkeleton />;
        }

        if (
            !insightData ||
            typeof insightData !== 'object' ||
            !Object.keys(insightData).length ||
            insightData?.error ||
            !insightTabData.length
        ) {
            return null;
        }

        return (
            <div className="box-design my25">
                <Suspense fallback={<AudienceInsightsSkeleton />}>
                {insightTabData.length > 5 ? (
                    <>
                        <h4 className="mb15">Insights</h4>
                        <RSTabberSlide
                            tabData={insightTabData}
                            dynamicTab={`mb0 mini detail-analytics-tab`}
                            defaultTab={0}
                            activeClass={`active`}
                            className="rs-tabs row detail-tabs"
                            tabMaxLength={6}
                        />
                    </>
                ) : (
                    <div className="tabs-right-align  pageSub_tab ">
                        <h4 className="mb15">Insights</h4>
                        <RSTabber
                            tabData={insightTabData}
                            defaultTab={0}
                            componentClassName="position-relative"
                            className="rs-tabs row position-relative top-41 float-right"
                            defaultClass={`col-md-2 tabTransparent`}
                            dynamicTab={`mb-10 mini`}
                        />
                    </div>
                )}
                </Suspense>
            </div>
        );
    };

    return (
        <div className="page-content-holder">
            {state === null || (eligiblePathFlow?.includes(_get(state, 'from', '')) && !state?.data?.type?.type) ? (
                <FormProvider {...methods}>
                    {/* Main page heading block starts */}
                    <Suspense
                        fallback={
                            <RSPageHeaderSkeleton variant="addAudience" className="add-audience-page-header-skeleton" />
                        }
                    >
                        <RSPageHeader
                        title="Add audience"
                        isTabber
                        rightCommonMenus
                        isBack
                        isBuDisabled
                        isAgencyDisabled
                        backPath={state?.isDataExchange ? '/preferences/data-exchange' : '/audience'}
                        backAction={() => {
                            if (state?.from === 'targetList') {
                                let url = '/audience';
                                const state = { index: 1 };
                                const encryptState = encodeUrl(state);
                                navigate(`${url}?q=${encryptState}`, {
                                    state: {
                                        index: 1,
                                    },
                                });
                                return;
                            }
                            navigateToAudienceMdm();
                        }}
                        />
                    </Suspense>
                    {/* Main page heading block ends */}
                    {/* Main page content block starts */}
                    <Container fluid>
                        <div className="page-content">
                            <Container className="px0">
                                <form onSubmit={handleSubmit(audienceUpload)}>
                                    {editLoading ? (
                                        <AddAudienceSkeleton />
                                    ) : (
                                        <>
                                    <div className="box-design p21">
                                        <div className={`${audienceByData ? 'form-group' : 'm0'} pt10`}>
                                            <Row>
                                                <Col sm={{ span: 3, offset: 1 }} className="text-right">
                                                    <label className="control-label-left">
                                                        {ADD_AUDIENCE_BY}
                                                    </label>
                                                </Col>
                                                <Col sm={4}>
                                                    <Suspense fallback={<AddAudienceDropdownSkeleton />}>
                                                    <ResKendoDropdown
                                                        control={control}
                                                        name="audienceBy"
                                                        data={
                                                            state?.from === 'targetList' && state?.mode === 'inputList'
                                                                ? addAudienceBy.filter(
                                                                      (item) =>
                                                                          item.type === 'CSV' || item.type === 'Excel',
                                                                  )
                                                                : addAudienceBy
                                                        }
                                                        label={SOURCE}
                                                        textField="type"
                                                        dataItemKey="typeId"
                                                        required
                                                        rules={{
                                                            validate: (value) =>
                                                                value?.typeId > 0 && value?.type?.trim?.()?.length > 0
                                                                    ? true
                                                                    : SELECT_SOURCE,
                                                        }}
                                                        handleOnBlur={() => void trigger('audienceBy')}
                                                        isLoading={importSourceAPI?.isLoading}
                                                        disabled={ !!listType ||
                                                            state?.from === 'targetList' && state?.mode === 'inputList'
                                                        }
                                                        handleChange={({ value }) => {
                                                            if (
                                                                value?.typeId === 32 &&
                                                                checkIsBrandExists(departmentId)
                                                            ) {
                                                                setModal({ show: true, type: 'brand' });
                                                            }
                                                            setCurrentComponent(value?.type?.toLowerCase());
                                                            const { audienceBy, ...formState } =
                                                                FORM_INITIAL_STATE.defaultValues;

                                                            reset((form) => ({
                                                                ...form,
                                                                ...formState,
                                                            }));
                                                            dispatch(resetCsvFiles());
                                                        }}
                                                    />
                                                    </Suspense>
                                                </Col>
                                                {audienceBy?.type && !listType && !state?.isDataExchange && (
                                                    <Col md={1} className="pl0">
                                                        <RSTooltip
                                                            position="top"
                                                            className="d-inline-flex lh0 position-relative top6"
                                                            text={RESET}
                                                        >
                                                            <i
                                                                id="rs_data_refresh"
                                                                className={`${restart_medium} icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                    setIsReset({
                                                                        show: true,
                                                                    });
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>

                                        {
                                            <RenderComponent
                                                currentComponent={currentComponent}
                                                audRefData={audRefData}
                                                listType={listType}
                                                fetchAudienceInsight={fetchAudienceInsight}
                                            />
                                        }
                                    </div>
                                    {renderInsights()}
                                    {currentComponent === 'remote data source' && <RemoteDataSource />}
                                    {!fromTLSLML &&
                                    audienceBy?.typeId &&
                                    audienceBy?.typeId !== 3 &&
                                    (audienceBy?.typeId === 32 || listType) ? (
                                        <Row>
                                            <Col sm={12}>
                                                <div className="d-flex align-items-center mt3">
                                                    <h4 className="mt15 mb5 mr10">{IMPORT_PREFERENCES}</h4>
                                                    {((audienceBy?.typeId === 32 && isManualEntryConfigured) ||
                                                        listType) && (
                                                        <Suspense fallback={null}>
                                                            <ConfigureDedupeSettings />
                                                        </Suspense>
                                                    )}
                                                    {(audienceBy?.type === 'Manual entry' ||
                                                        audienceBy?.type === 'CSV') && (
                                                        <RSPPophover
                                                            position="top"
                                                            pophover={
                                                                audienceBy?.type === 'CSV'
                                                                    ? ENSURE_THE_FIRST_ROW_OF_YOUR_FILE_CSV
                                                                    : ENSURE_THE_FIRST_ROW_OF_YOUR_FILE
                                                            }
                                                            className="modalOverlayZindexCSS"
                                                        >
                                                            <i
                                                                className={`${circle_question_mark_medium} icon-md color-primary-blue cursor-pointer mt5`}
                                                            ></i>
                                                        </RSPPophover>
                                                    )}
                                                    {audienceBy?.type === 'Manual entry' && (
                                                        <div
                                                            className="no-hover flex-vertical-center float-start cp float-end ms-auto"
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                const content = sampleDownloadContent;
                                                                const file = new Blob([content.join('\n')], {
                                                                    type: 'text/plain',
                                                                });
                                                                file.text().then((x) => {});
                                                                link.href = URL.createObjectURL(file);
                                                                link.download = 'sample.txt';
                                                                link.click();
                                                                URL.revokeObjectURL(link.href);
                                                            }}
                                                        > <small className="color-primary-grey mr5">
                                                                {DOWNLOAD_SAMPLE}
                                                            </small>
                                                               <i
                                                                id="rs_data_download"
                                                                className={`${download_medium} icon-md color-primary-blue`}
                                                            ></i>
                                                           
                                                         
                                                        </div>
                                                    )}
                                                </div>
                                                <RSRadioButton
                                                    control={control}
                                                    name="isImportPreference"
                                                    id="rs_AddAudience_importpreference_new"
                                                    labelName={IMPORT_PREFERENCE_LABEL}
                                                    rules={{
                                                        required: SELECT_IMPORT_PREFERENCE,
                                                    }}
                                                />
                                                <RSRadioButton
                                                    control={control}
                                                    name="isImportPreference"
                                                    id="rs_AddAudience_importpreference_old"
                                                    labelName={IMPORT_PRESERVE_PREFERENCE_LABEL}
                                                    rules={{
                                                        required: SELECT_IMPORT_PREFERENCE,
                                                    }}
                                                />
                                                {audienceBy?.type === 'Manual entry' || audienceBy?.type === 'CSV' ? (
                                                    <ul>
                                                        <li className="color-primary-black mt5">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                {' '}
                                                                {/* <div className="d-flex align-items-center">
                                                                // {NOTE}:
                                                                <i
                                                                    className={`${circle_info_mini} icon-xs color-primary-blue mr10 cursor-default`}
                                                                ></i>
                                                                <small>
                                                                    {audienceBy?.type === 'CSV'
                                                                        ? ENSURE_THE_FIRST_ROW_OF_YOUR_FILE_CSV
                                                                        : ENSURE_THE_FIRST_ROW_OF_YOUR_FILE}
                                                                </small>
                                                            </div> */}
                                                            </div>
                                                        </li>
                                                        {/* <li className="my5 ml20">
                                                    <small>
                                                        {ENSURE_THE_FIRST_ROW_OF_YOUR_FILE}
                                                    </small>
                                                </li> */}
                                                        <li className="ml20">
                                                            <small />
                                                        </li>
                                                    </ul>
                                                ) : null}
                                            </Col>
                                        </Row>
                                    ) : null}
                                    {currentComponent !== 'remote data source' &&
                                        currentComponent !== '' &&
                                        currentComponent !== undefined && (
                                            <div className="buttons-holder">
                                                <RSSecondaryButton
                                                    blockInteraction={audienceSubmitAPI.isLoading}
                                                    onClick={() => {
                                                        if (state?.from === 'targetList') {
                                                            let url = '/audience';
                                                            const state = { index: 1 };
                                                            const encryptState = encodeUrl(state);
                                                            navigate(`${url}?q=${encryptState}`, {
                                                                state: {
                                                                    index: 1,
                                                                },
                                                            });
                                                        }
                                                        setCurrentComponent('');
                                                        dispatch(resetCsvFiles());
                                                        reset(resetColumnFields);
                                                    }}
                                                    id="rs_AddAudience_secondary"
                                                >
                                                    {CANCEL}
                                                </RSSecondaryButton>
                                                <RSPrimaryButton
                                                    disabledClass={`${handleConfirmButtonClass()} ${
                                                        hasErrorExceptFilenameExist || audienceSubmitAPI.isLoading
                                                            ? 'pe-none click-off'
                                                            : ''
                                                    }`}
                                                    type="submit"
                                                    id="rs_AddAudience_primary"
                                                    isLoading={audienceSubmitAPI.isLoading}
                                                    blockBodyPointerEvents={audienceSubmitAPI.isLoading}
                                                   
                                                >
                                                    {currentComponent !== 'sftp'
                                                        ? `${UPLOAD}`
                                                        : `${CONNECT}`}
                                                </RSPrimaryButton>
                                            </div>
                                        )}
                                    </>
                                    )}
                                </form>
                            </Container>
                        </div>
                    </Container>
                </FormProvider>
            ) : (
                <RenderDataExchage state={state?.type ?? state?.data?.type?.type} />
            )}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
            {modal.show && (
                <Suspense fallback={null}>
                    <ConfirmationPopup
                    show={modal.show}
                    type={modal.type}
                    handleClose={() => {
                        setModal({ show: false, type: null });
                    }}
                    handleConfirm={() => setModal({ show: false, type: null })}
                />
                </Suspense>
            )}
            {isReset?.show && (
                <RSConfirmationModal
                    header={RESET}
                    show={isReset?.show}
                    isCloseButton={false}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    handleConfirm={(status) => {
                        if (status) {
                            reset(FORM_INITIAL_STATE.defaultValues);
                            setCurrentComponent('');
                            dispatch(resetCsvFiles());
                            setIsReset({
                                show: false,
                            });
                        }
                    }}
                    handleClose={() => {
                        setIsReset({
                            show: false,
                        });
                    }}
                />
            )}
        </div>
    );
};

export default AddAudience;
