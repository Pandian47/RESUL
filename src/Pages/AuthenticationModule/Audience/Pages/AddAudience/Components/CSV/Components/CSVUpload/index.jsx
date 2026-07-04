import { getErrorMessage } from '../../constant';
import { getBrandNameUIPrintable } from 'Utils/modules/brandStorage';
import { BRAND_ID_CHECK } from 'Utils/modules/communicationChannels';
import { getCsvListType } from 'Utils/modules/browserUtils';
import { getEnvironment } from 'Utils/modules/environment';
import { formatBytes } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { ADHOCATTRIBUTES, FILECOUNT, FILECOUNT_TL, MATCHLISTATTRIBUTES, SEEDLISTATTRIBUTES, SEEDLISTAUDIENCE } from 'Constants/GlobalConstant/Regex';
import { CONTAINS_INVALID_FILES, FILENAME_EXIST, FIRST_ROW_COLUMN_HEADER, HEADERS_NOT_MATCHED, MAX_ADHOC_COLUMNS, MAX_CSV_FILES, MAX_CSV_FILES_ADHOCLIST, MAX_CSV_FILES_MATCHINPUTLIST, MAX_CSV_FILES_SEEDLIST, MAX_CSV_FILES_SUPPRESSIONINPUTLIST, MAX_CSV_FILES_TARGETLIST, MAX_MATCH_SUPPRESSION_COLUMNS, MAX_SEED_AUDIENCE_LIST, MAX_SEED_COLUMNS, MAX_TARGET_COLUMNS } from 'Constants/GlobalConstant/ValidationMessage';
import { ACCEPTS_ONLY_CSV, ADD_FILE, ARE_YOU_SURE_WANT_TO_RESET, CHOOSE_YOUR_FILE, COLUMN_HEADER_POPOVER, DELETE, DOWNLOAD_SAMPLE, FIRSTROW_COLUMN_HEADER, RESET, SELECT_CSV_FILES } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_close_fill_medium, circle_info_medium, circle_plus_medium, circle_question_mark_mini, circle_tick_medium, csv_download_medium, delete_medium, popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import RSPPophover from 'Components/RSPPophover';


import RSIcon from 'Components/RSIcon';

import RSTooltip from 'Components/RSTooltip';
import RSFileUpload from 'Components/FormFields/RSFileUpload';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    deleteCsvFiles,
    resetCsvFiles,
    updateHeaderColumns,
    updateListAnalysisData,
    updateResponseHeader,
} from 'Reducers/audience/addAudience/reducer';
import { checkFileNameExists, validateCsvFile } from 'Reducers/audience/addAudience/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx';
import useQueryParams from 'Hooks/useQueryParams';
import { sampleDownloadContent } from '../../../../constants';
import ListAnalysis from '../../../../../AddImportAudience/Components/ListAnalysis';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';

const CSVUpload = ({ isValidListname, fetchAudienceInsight }) => {
    const state = useQueryParams('/audience');
    const env = getEnvironment();

      const dispatch = useDispatch();
      const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [uploadingSkeletonCount, setUploadingSkeletonCount] = useState(0);
    const isFileUploadLoading = uploadingSkeletonCount > 0;
      const [listAnalysisInfoModal, setListAnalysisInfoModal] = useState({
            show: false,
            fileName: '',
      });
      const [isDelete, setIsDelete] = useState({
            show: false,
            deleteIndex: null,
            data: {},
      });
      const [isReset, setIsReset] = useState({
            show: false,
      });
      const [invalidFiles, setInvalidFiles] = useState([]);
      const { csvFiles, path, headerColumns, responseHeaders, fileWiseListAnalysisData } = useSelector(
            ({ addAudienceReducer }) => addAudienceReducer,
      );

    const hasUploadError = !!csvFiles?.find((item) => item?.isValid === false) || false;

    const {
        control,
        setValue,
        setError,
        clearErrors,
        watch,
        reset,
        getValues,
        formState: { errors },
    } = useFormContext();
    const [listType, attributeMapping, categoryType] = watch(['listType', 'attributeMapping', 'categoryType']);
    const hasListTypeError = Object.hasOwn(errors, 'listType');
    const isAdHocList = listType === 'Ad-hoc list';
    const isSeedList = listType === 'Seed list';
    const isTargetList = listType === 'Target list';
    const isMatchList = listType === 'Match input list';
    const isSuppressionList = listType === 'Suppression input list';
    // console.log('csvFiles: ', csvFiles?.length);
    // console.log('listType: ', listType);
    // useComponentWillUnmount(() => {
    //     dispatch(resetCsvFiles());
    // });
    useEffect(() => {
        // reset((formState) => ({
        //     ...formState,
        //     listType: '',
        //     attributeMapping: '',
        //     listName: '',
        //     categoryTypeText: '',
        //     csvFiles: null,
        //     isColumnHeader: true,
        // }));
        return () => {
            dispatch(updateResponseHeader([]));
            dispatch(resetCsvFiles());
        };
    }, []);
    useEffect(() => {
        if (attributeMapping === 'Parent') {
            reset((formState) => ({
                ...formState,
                categoryType: '',
                categoryTypeText: '',
            }));
        }
    }, [attributeMapping]);

    const readFileHeader = async (file) => {
        return new Promise(async (resolve, reject) => {
            // Handle CSV files only
            const reader = new FileReader();
            reader.onload = function () {
                try {
                    const csvText = reader.result;
                    const lines = [];
                    let lineStart = 0;
                    for (let i = 0; i < csvText.length; i++) {
                        if (csvText[i] === '\n') {
                            const line = csvText.slice(lineStart, i).trim();
                            if (line) lines.push(line);
                            lineStart = i + 1;
                        }
                    }
                    const lastLine = csvText.slice(lineStart).trim();
                    if (lastLine) lines.push(lastLine);

                    const firstRow = lines[0];
                    if (firstRow) {
                        resolve(firstRow);
                    } else {
                        reject(new Error('Empty file'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = function () {
                reject(new Error('Error reading file'));
            };
            reader.readAsText(file);
        });
    };

    const validateAndFilterFiles = async (files) => {
        const validFiles = [];
        const invalidFilesList = [];

        if (!files || files.length === 0) {
            return { validFiles, invalidFiles: invalidFilesList };
        }

        // Filter out non-CSV files
        const csvFilesArray = Array.from(files).filter((file) => {
            const isCsv = file.name.toLowerCase().endsWith('.csv');
            if (!isCsv) {
                invalidFilesList.push({
                    fileName: file.name,
                    reason: 'Only CSV files are allowed',
                });
            }
            return isCsv;
        });

        if (csvFilesArray.length === 0) {
            return { validFiles, invalidFiles: invalidFilesList };
        }

        const type = getCsvListType(listType);
        const existingFileCount = csvFiles?.length || 0;
        const newFileCount = csvFilesArray.length || 0;
        const totalCount = existingFileCount + newFileCount;

        if (attributeMapping === '' && type === 5) {
            setError('attributeMapping', { type: 'custom', message: 'Select attribute mapping' });
            return { validFiles, invalidFiles: invalidFilesList };
        } else if (attributeMapping === 'Child' && categoryType === '' && type === 5) {
            setError('categoryType', { type: 'custom', message: 'Select category' });
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 1 && totalCount > 5) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_ADHOCLIST });
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 3 && totalCount > 1) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_SEEDLIST });
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 5 && totalCount > 6) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_TARGETLIST });
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 2 && totalCount > 6) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_MATCHINPUTLIST });
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 4 && totalCount > 6) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_SUPPRESSIONINPUTLIST });
            return { validFiles, invalidFiles: invalidFilesList };
        }

        // Read headers for CSV files
        const fileHeaderPromises = csvFilesArray.map(async (file) => {
            try {
                const header = await readFileHeader(file);
                return { file, header, success: true };
            } catch (error) {
                return { file, header: null, success: false, error: message };
            }
        });

        const fileHeaderResults = await Promise.all(fileHeaderPromises);

        let refHeader = headerColumns?.length > 0 ? headerColumns : null;
        let refFileIndex = -1;

        if (!refHeader) {
            for (let i = 0; i < fileHeaderResults.length; i++) {
                const result = fileHeaderResults[i];
                if (result.success) {
                    refHeader = result.header;
                    refFileIndex = i;
                    break;
                }
            }

            if (!refHeader) {
                fileHeaderResults.forEach((result) => {
                    invalidFilesList.push({
                        fileName: result.file.name,
                        reason: 'Unable to read file header',
                    });
                });
                setError('csvFiles', {
                    type: 'custom',
                    message: 'No valid file header found. Unable to read any file headers.',
                });
                return { validFiles, invalidFiles: invalidFilesList };
            }
        }

        if (!isAdHocList && BRAND_ID_CHECK.includes(listType) && fileHeaderResults?.length > 0) {
            const refHeaderArr = refHeader.replace(/(\r\n|\n|\r)/gm, '')?.split(',');
            const brandName = getBrandNameUIPrintable(departmentId);

            if (!refHeaderArr.includes(brandName)) {
                const reason = `Invalid upload: Brand Id [${brandName}] missing in reference file`;
                fileHeaderResults.forEach((result) => {
                    invalidFilesList.push({
                        fileName: result.file.name,
                        reason: reason,
                    });
                });
                setError('csvFiles', {
                    type: 'custom',
                    message: reason,
                });
                return { validFiles, invalidFiles: invalidFilesList };
            }
        }

        // Process CSV files
        fileHeaderResults.forEach((result, index) => {
            if (!result.success) {
                invalidFilesList.push({
                    fileName: result.file.name,
                    reason: 'Unable to read file header',
                });
            } else if (result.header !== refHeader) {
                invalidFilesList.push({
                    fileName: result.file.name,
                    reason:
                        refFileIndex >= 0 && index === refFileIndex
                            ? 'Header columns do not match other files'
                            : 'Header columns do not match the reference file',
                });
            } else {
                validFiles.push(result.file);
            }
        });

        return { validFiles, invalidFiles: invalidFilesList };
    };

    const validateAndUploadFile = async (file) => {
        return new Promise(async (resolve) => {
            // Handle CSV files only
            const reader = new FileReader();
            reader.readAsText(file);

            reader.onload = async function () {
                try {
                    const csvText = reader.result;
                    await processCsvContent(csvText, file, resolve);
                } catch (error) {
                    resolve({
                        success: false,
                        fileName: file.name,
                        reason: message || 'Error processing file',
                    });
                }
            };
            reader.onerror = function () {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: 'Error reading file',
                });
            };
        });
    };

    const processCsvContent = async (csvText, file, resolve) => {
        try {
            const type = getCsvListType(listType);
            const MAX_FILE_SIZE = 10485760; // 10MB

            if (file.size > MAX_FILE_SIZE) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1048576}MB`,
                });
                return;
            }

            const validFileNamePattern = /^[a-zA-Z0-9\s\-_]+\.csv$/i;
            if (!validFileNamePattern.test(file.name)) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: 'File name contains invalid characters or unsupported file extension',
                });
                return;
            }

            const fileNameExists = csvFiles.some((list) => list.fileName === file.name);
            if (fileNameExists) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: FILENAME_EXIST,
                });
                return;
            }

            if (csvFiles?.length >= 6 && [2, 4, 5].includes(type)) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: MAX_CSV_FILES,
                });
                return;
            }

            if (hasUploadError) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: CONTAINS_INVALID_FILES,
                });
                return;
            }

            const lines = [];
            let lineStart = 0;
            for (let i = 0; i < csvText.length; i++) {
                if (csvText[i] === '\n') {
                    const line = csvText.slice(lineStart, i).trim();
                    if (line) lines.push(line);
                    lineStart = i + 1;
                }
            }
            const lastLine = csvText.slice(lineStart).trim();
            if (lastLine) lines.push(lastLine);

            const firstRow = lines[0];
            const firstRowArr = firstRow.replace(/(\r\n|\n|\r)/gm, '')?.split(',');

            if (firstRowArr?.length === 0 || firstRow === '' || firstRowArr[0] === '') {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: CONTAINS_INVALID_FILES,
                });
                return;
            }

            if (firstRowArr?.length > 25 && type === 5) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: MAX_TARGET_COLUMNS,
                });
                return;
            }

            if (type === 3 && lines.length - 1 > SEEDLISTAUDIENCE) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: MAX_SEED_AUDIENCE_LIST,
                });
                return;
            }

            if (headerColumns !== firstRow && headerColumns?.length > 0) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: HEADERS_NOT_MATCHED,
                });
                return;
            } else if (csvFiles?.length && headerColumns !== firstRow) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: HEADERS_NOT_MATCHED,
                });
                return;
            }

            if (isAdHocList && firstRowArr?.length > ADHOCATTRIBUTES) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: MAX_ADHOC_COLUMNS,
                });
                return;
            }

            if (type === 3 && firstRowArr?.length > SEEDLISTATTRIBUTES) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: MAX_SEED_COLUMNS,
                });
                return;
            }

            if ((type === 2 || type === 4) && firstRowArr?.length > MATCHLISTATTRIBUTES) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: MAX_MATCH_SUPPRESSION_COLUMNS,
                });
                return;
            }

            const fSize = file?.size || 0;
            const encodedData = btoa(csvText);
            const payload = {
                name: file?.name,
                size: fSize,
                encodedData,
                departmentId,
                clientId,
                userId,
                type,
                path,
            };

                  if (type === 5) {
                        const fileNamePayload = {
                              filenameDescription: file?.name,
                              listType: type,
                              departmentId,
                              clientId,
                              userId,
                        };
                        const { status: fileNameStatus } = await dispatch(
                    checkFileNameExists({ payload: fileNamePayload, loading: false }),
                );
                        if (fileNameStatus) {
                              resolve({
                                    success: false,
                                    fileName: file.name,
                                    reason: 'File name already exists',
                              });
                              return;
                        }
                  }

            const result = await dispatch(
                validateCsvFile(payload, clearErrors, responseHeaders, csvFiles?.length, false),
            );
            const { status, data } = result || {};

            if (!status) {
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: result?.errorMsg || result?.message || CONTAINS_INVALID_FILES,
                });
                return;
            }

            if (headerColumns?.length == 0) {
                dispatch(updateHeaderColumns(firstRow));
            }
            setValue('csvFiles', null);
            resolve({ success: true, fileName: file.name, apiResponseData: data });
        } catch (err) {
            resolve({
                success: false,
                fileName: file.name,
                reason: err.message || CONTAINS_INVALID_FILES,
            });
        }
    };

    let CSVLength = 0;
    if (isTargetList) CSVLength = FILECOUNT_TL;
    else if (isAdHocList) CSVLength = FILECOUNT;
    else if (isSeedList) CSVLength = 1;
    else if (isMatchList) CSVLength = FILECOUNT_TL;
    else if (isSuppressionList) CSVLength = FILECOUNT_TL;

    const removeUploadedFile = (deleteIndex, data = {}) => {
        const isLastFile = csvFiles?.length <= 1;
        const remainingPaths = path?.filter((_, index) => index !== deleteIndex).filter(Boolean) ?? [];

        dispatch(deleteCsvFiles(deleteIndex));
        dispatch(
            updateListAnalysisData({
                fileName: data?.fileName,
                data: {},
            }),
        );

        if (isLastFile) {
            dispatch(resetCsvFiles());
            return;
        }

        if (remainingPaths.length > 0) {
            handleFetchAudienceInsight(remainingPaths.join(','));
        }
    };

    const handleFetchAudienceInsight = (encodedData) => {
        if (!fetchAudienceInsight) return;
        return fetchAudienceInsight(encodedData);
    };

    const CsvFileCardLoadingSkeleton = () => (
        <Col sm={4}>
            <div className="rsfb-valid rs-file-box" aria-hidden="true">
                <div className="rsfb-file-info">
                    <div className="align-items-center d-flex justify-content-between">
                        <div className="flex-grow-1 min-w-0 pe-2">
                            <CommonSkeleton width="100%" height={17} box stopAnimation />
                        </div>
                        <div className="rsfb-status-icon position-static flex-shrink-0">
                            <div className="d-flex align-items-center">
                                <CommonSkeleton width={24} height={24} circle stopAnimation />
                                <CommonSkeleton
                                    width={24}
                                    height={24}
                                    circle
                                    stopAnimation
                                    mainClass="ml10"
                                />
                            </div>
                        </div>
                    </div>
                    <CommonSkeleton width={50} height={12} box stopAnimation mainClass="mt-5" />
                </div>
                <div className=" rsfb-file-status rsfb-skeleton py1">
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <CommonSkeleton width={110} height={14} box stopAnimation mainClass="pl10" />
                        <CommonSkeleton width={20} height={20} circle stopAnimation mainClass="mr10 flex-shrink-0" />
                    </div>
                </div>
            </div>
        </Col>
    );

    const processSelectedFiles = async (files) => {
        if (!files || files.length === 0) return;
        setInvalidFiles([]);

        const { validFiles, invalidFiles: headerInvalidFiles } = await validateAndFilterFiles(files);
        const allInvalidFiles = [...headerInvalidFiles];

        if (validFiles.length > 0) {
            setUploadingSkeletonCount(validFiles.length);
            let validationResults = [];
            try {
                validationResults = await Promise.all(validFiles.map((file) => validateAndUploadFile(file)));
                validationResults.forEach((result) => {
                    if (!result.success) {
                        allInvalidFiles.push({
                            fileName: result.fileName,
                            reason: result.reason,
                        });
                    }
                });
            } finally {
                setUploadingSkeletonCount(0);
            }
            const successfulResults = validationResults.filter((result) => result?.success);
            if (successfulResults.length > 0) {
                handleInsightAPICall(successfulResults);
            }
        }

        if (allInvalidFiles.length > 0) {
            setInvalidFiles(allInvalidFiles);
        }

        if (validFiles.length === 0 && files.length > 0 && csvFiles?.length === 0) {
            setError('csvFiles', {
                type: 'custom',
                message: 'Invalid files',
            });
        }
    };

    // File Upload Card Skeleton (matches the image)
    const FileUploadCardSkeleton = () => (
        <Col sm={4} className="position-relative">
            <div className="rsfb-valid rs-file-box create-new-skeleton px10 pb2  d-flex justify-content-around">
                {/* Top two lines and right circles */}
                {/* <div style={{ display: 'flex', alignItems: 'center', position: 'relative', top: '-4px' }}>
           <Skeleton width={120} height={17} style={{ marginRight: 8 }} enableAnimation={false} />
           <div style={{ flex: 1 }} />
           <Skeleton circle width={24} height={24} style={{ marginRight: 10, borderRadius: 7 }} enableAnimation={false}/>
           <Skeleton circle width={24} height={24} enableAnimation={false}/>
        </div> */}
                {/* <Skeleton width={80} height={15} style={{ marginBottom: 12, position: 'relative', top: '-4px' }} enableAnimation={false}/> */}
                {/* <div style={{ flex: 1 }} /> */}
                {/* Bottom bar */}
                {/* <Skeleton
           width={379}
           height={28}
           style={{
               borderRadius: 0,
               borderBottomLeftRadius: 7,
               borderBottomRightRadius: 7,
               marginBottom: 0,
               marginLeft: -9,
               marginRight: -9,
               marginTop: 0,
           }}
           enableAnimation={false}
        /> */}
                {/* Plus icon at bottom right */}
                <div className="align-items-baseline d-flex flex-column justify-content-center pt5">
                    <span>
                        {/* <RSTooltip text={ADD_FILE} position="top" className="lh0"> */}
                        <RSFileUpload
                            className={
                                hasUploadError || !isValidListname || csvFiles?.length === CSVLength
                                    ? // (isSeedList && csvFiles?.length === 1) ||
                                    //  (listType === 'Target list' && csvFiles?.length === 6)
                                    getValues('validatedImportDescriptionName')
                                        ? ''
                                        : 'pe-none click-off'
                                    : ''
                            }
                            customInputClass={`${hasUploadError || !isValidListname || csvFiles?.length === CSVLength
                                ? // (isSeedList && csvFiles?.length === 1) ||
                                //  (listType === 'Target list' && csvFiles?.length === 6)
                                getValues('validatedImportDescriptionName')
                                    ? ''
                                    : 'pe-none click-off'
                                : ''
                                } audience_browser_btn`}
                            disabled={hasUploadError}
                            isLoading={isFileUploadLoading}
                            id="rs_CSV_Browsefiles"
                            control={control}
                            name="csvFiles"
                            text="Browse"
                            accept={'.csv'}
                            placeholder={SELECT_CSV_FILES}
                            clearErrors={clearErrors}
                            setError={setError}
                            required
                            handleChange={async (e) => {
                                await processSelectedFiles(e?.target?.files);
                            }}
                            onClick={(event) => {
                                event.target.value = null;
                            }}
                            watch={watch}
                            size={10485760}
                            labelInputClassName="d-none"
                            isCustomElement={
                                <i className={`${circle_plus_medium} color-primary-blue icon-md lh0 `}></i>
                            }
                        />

                        {/* </RSTooltip> */}
                    </span>
                    <p>{ADD_FILE}</p>
                </div>
            </div>
        </Col>
    );

    const handleInsightAPICall = async (validationResults) => {
        const successfulResults = validationResults?.filter((result) => result?.success) ?? [];
        if (successfulResults.length === 0) return;

        const pathData = [...path, ...successfulResults.map((result) => result?.apiResponseData?.path || '')];
        const allPathJoin = pathData.filter(Boolean).join(',');
        if (!allPathJoin) return;
        await handleFetchAudienceInsight(allPathJoin);
    };
    return (
        <>
            <Fragment>
                <div className="form-group">
                    <Row>
                        <Col sm={{ span: 3, offset: 1 }} className="text-right">
                            <label className="control-label-left">{CHOOSE_YOUR_FILE}</label>
                        </Col>
                        <Col sm={5} className="widthCustomizeFileUpload">
                            <RSFileUpload
                                className={
                                    hasUploadError ||
                                        !isValidListname ||
                                        csvFiles?.length === CSVLength ||
                                        hasListTypeError
                                        ? // (isSeedList && csvFiles?.length === 1) ||
                                        //  (listType === 'Target list' && csvFiles?.length === 6)
                                        getValues('validatedImportDescriptionName')
                                            ? ''
                                            : 'pe-none click-off'
                                        : ''
                                }
                                customInputClass={
                                    hasUploadError ||
                                        !isValidListname ||
                                        csvFiles?.length === CSVLength ||
                                        hasListTypeError
                                        ? // (isSeedList && csvFiles?.length === 1) ||
                                        //  (listType === 'Target list' && csvFiles?.length === 6)
                                        getValues('validatedImportDescriptionName')
                                            ? ''
                                            : 'pe-none click-off'
                                        : ''
                                }
                                disabled={hasUploadError || hasListTypeError}
                                isLoading={isFileUploadLoading}
                                id="rs_CSV_Browsefiles"
                                control={control}
                                name="csvFiles"
                                text="Browse"
                                accept={'.csv'}
                                placeholder={SELECT_CSV_FILES}
                                clearErrors={clearErrors}
                                setError={setError}
                                required
                                handleChange={async (e) => {
                                    await processSelectedFiles(e?.target?.files);
                                }}
                                onClick={(event) => {
                                    event.target.value = null;
                                }}
                                watch={watch}
                                size={10485760}
                                moreFiles={isSeedList ? false : true}
                                customRenderText={
                                    <div className="align-items-center d-flex justify-content-between">
                                        <div className="align-items-baseline d-flex">
                                            <small className="mr5">
                                                {ACCEPTS_ONLY_CSV(
                                                    listType === 'Ad-hoc list'
                                                        ? FILECOUNT
                                                        : listType === 'Seed list'
                                                            ? 1
                                                            : FILECOUNT_TL,
                                                )}
                                            </small>
                                            {listType !== 'Seed list' && (
                                                <RSPPophover
                                                    position="top"
                                                    text={COLUMN_HEADER_POPOVER(
                                                        listType === 'Ad-hoc list'
                                                            ? FILECOUNT
                                                            : FILECOUNT_TL,
                                                        listType !== 'Seed list ',
                                                    )}
                                                >
                                                    <i
                                                        className={`${circle_question_mark_mini} icon-xs color-primary-blue`}
                                                        id="circle_question_mark"
                                                    ></i>
                                                </RSPPophover>
                                            )}
                                        </div>
                                        <RSTooltip
                                            text={DOWNLOAD_SAMPLE}
                                            position="top"
                                            className="lh0 position-relative top3"
                                        >
                                            <i
                                                className={`${csv_download_medium} color-primary-blue icon-md `}
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    const content = sampleDownloadContent;
                                                    const file = new Blob([content.join('\n')], { type: 'text/plain' });
                                                    file.text().then((x) => { });
                                                    link.href = URL.createObjectURL(file);
                                                    link.download = 'sample.csv';
                                                    link.click();
                                                    URL.revokeObjectURL(link.href);
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                }
                            />

                            {/* {listType != 'Seed list' && ( */}

                            {/* )} */}
                        </Col>
                    </Row>
                    {/* // TODO {Rizwan}: Work on download sample format csv file */}
                    {/* <div className="form-group mb0">
                   <Row className="d-flex mt11">
                       <Col sm={{ span: 8, offset: 4 }} className="d-flex mb7">
                           <Row>
                               <Col sm={10}>
                                   <RSCheckbox
                                       control={control}
                                       name="isColumnHeader"
                                       labelName={FIRSTROW_COLUMN_HEADER}
                                       rules={{
                                           required: FIRST_ROW_COLUMN_HEADER,
                                       }}
                                       // popover={listType === 'Seed list' ? false : true}
                                       // popover_icon={`${circle_question_mark_mini} icon-xs color-primary-blue top2`}
                                       // popover_position="top"
                                       // popover_content={COLUMN_HEADER_POPOVER(
                                       //     listType === 'Ad-hoc list' ? FILECOUNT : FILECOUNT_TL,
                                       // )}
                                   />
                               </Col>
                           </Row>
                       </Col>
                   </Row>
               </div> */}
                </div>
                {invalidFiles.length > 0 && (
                    <Row>
                        <Col>
                            <div className="p10 bg-secondary-red rounded invalidCsvWrapper">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <i className={`${alert_medium} icon-md color-primary-red mr5`}></i>
                                        <h3 className="color-primary-red">Invalid files</h3>
                                    </div>
                                    <RSIcon
                                        className="icon-md color-primary-red"
                                        // closeTooltipPosition={'top'}
                                        defaultItem={popup_close_circle_medium}
                                        hoverItem={popup_close_circle_fill_medium}
                                        handleClose={() => setInvalidFiles([])}
                                    />

                                    {/* <i 
                         onClick={() => setInvalidFiles([])}
                         className={`${circle_close_fill_medium} icon-md color-primary-blue`}
                     ></i> */}
                                </div>
                                <ol className="mb0 pl30" style={{ listStyle: 'auto' }}>
                                    {invalidFiles.map((invalid, idx) => {
                                        return (
                                            <li key={idx} className="d-flex">
                                                {invalid.fileName?.length < 50 ? (
                                                    <>
                                                        <span className="font-bold">{invalid.fileName}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="font-bold">
                                                            <RSTooltip
                                                                text={invalid.fileName}
                                                                position="top"
                                                                innerContent={false}
                                                            >
                                                                {truncateTitle(invalid.fileName, 2505)}
                                                            </RSTooltip>
                                                        </span>
                                                    </>
                                                )}
                                                <span className="pl5">{':'}</span>
                                                <span className="pl5">{invalid.reason}</span>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </div>
                        </Col>
                    </Row>
                )}
                {csvFiles?.length > 0 || uploadingSkeletonCount > 0 ? (
                    <div className="form-group mb0">
                        <Row>
                            {csvFiles?.map((list, listIndex) => {
                                return (
                                    <Col sm={4} key={list.fileName}>
                                        <div
                                            className={`${list.isValid ? 'rsfb-valid' : 'rsfb-invalid'} rs-file-box`}
                                            key={listIndex}
                                        >
                                            <div className="rsfb-file-info">
                                                <div className="d-flex justify-content-between">
                                                    {list?.fileName && (
                                                        <TruncateCell value={list?.fileName} noTable={true} truncateClassName="lh24 h24"/>
                                                    )}
                                                    <div className="rsfb-status-icon position-static">
                                                        <div className="d-flex">
                                                            {list?.isValid ? (
                                                                <RSTooltip text={'Success'} className="lh0">
                                                                    <i
                                                                        className={`${circle_tick_medium} icon-md`}
                                                                        id="rs_data_circle_tick_medium"
                                                                    />
                                                                </RSTooltip>
                                                            ) : (
                                                                <RSTooltip text={list?.errorMsg} className="lh0">
                                                                    <i className={`${alert_medium} icon-md`} />
                                                                </RSTooltip>
                                                            )}
                                                            <RSTooltip
                                                                text={DELETE}
                                                                className="lh0 ml10 position-relative"
                                                            >
                                                                <i
                                                                    className={`${delete_medium} icon-md color-primary-red`}
                                                                    onClick={() => {
                                                                        setIsDelete({
                                                                            show: true,
                                                                            deleteIndex: listIndex,
                                                                            data: list,
                                                                        });
                                                                        //removeUploadedFile(listIndex)
                                                                    }}
                                                                    id="rs_data_delete"
                                                                />
                                                            </RSTooltip>
                                                        </div>
                                                    </div>
                                                </div>
                                                <small className="rsfb-file-size">{formatBytes(list?.fileSize)}</small>
                                            </div>
                                            <div className="rsfb-inprogress rsfb-file-status d-flex align-items-center justify-content-between py1">
                                                {/* <span>
                        </span> */}
                                                <TruncateCell
                                                    value={
                                                        list.isValid
                                                            ? 'Verified - Valid'
                                                            : getErrorMessage(list?.errorMsg)
                                                    }
                                                    noTable={true}
                                                    truncateClassName="lh28 h28 res-csv-file-details"
                                                />
                                                <div
                                                    className="lh0 mr10"
                                                    onClick={() => {
                                                        setListAnalysisInfoModal({
                                                            show: true,
                                                            fileName: list?.fileName,
                                                        });
                                                    }}
                                                >
                                                     <RSTooltip text={"List analysis"} className="lh0">
                                                    <i
                                                        className={`${circle_info_medium} icon-md color-primary-white`}
                                                    /></RSTooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                            {Array.from({ length: uploadingSkeletonCount }).map((_, index) => (
                                <CsvFileCardLoadingSkeleton key={`csv-upload-skeleton-${index}`} />
                            ))}
                            {/* <Col sm={{ span: 4, offset: 4 }} className="d-flex">
                 <RSTooltip text={'Download sample format'} position="top" className="lh0 ml20">
                     <i className={`${csv_download_medium} color-primary-blue icon-lg `}
                     onClick={() => {
                         const link = document.createElement('a');
                         const content = [
                             'EmailID,FirstName,LastName,MobileNo,Gender,Age,City,Occupation,Interests,NickName',
                             'mailto:alex@hotmail.com,Alex,Turner,13125550187,Male,28,Chicago,Software engineer,Technology,Alex',
                             'mailto:sophi.bro@yahoo.com,Sophia,Brown,16025550248,Female,36,Arizona,Therapist,Food,Sophi',
                             'mailto:john.leo@gmail.com,John,Leo,13055550196,Male,42,Florida,Marketing manager,Travel,Leo',
                         ];
                         const file = new Blob([content.join('\n')], { type: 'text/plain' });
                                     file.text().then((x) => {})
                         link.href = URL.createObjectURL(file);
                         link.download = 'sample.csv';
                         link.click();
                         URL.revokeObjectURL(link.href);
                     }}
                     ></i>
                 </RSTooltip>
              </Col> */}
                            {csvFiles?.length > 0 && CSVLength !== csvFiles?.length && uploadingSkeletonCount === 0 && (
                                <FileUploadCardSkeleton />
                            )}
                        </Row>
                    </div>
                ) : null}
            </Fragment>
            {/* Modals */}

            <RSConfirmationModal
                show={isDelete?.show}
                isCloseButton={false}
                handleConfirm={(status) => {
                    if (status) {
                        removeUploadedFile(isDelete?.deleteIndex, isDelete?.data);
                        setIsDelete({
                            show: false,
                            deleteIndex: null,
                            data: {},
                        });
                        setInvalidFiles([]);
                    }
                }}
                handleClose={() => {
                    setIsDelete({
                        show: false,
                        deleteIndex: null,
                        data: {},
                    });
                    setInvalidFiles([]);
                }}
            />

            {isReset?.show && (
                <RSConfirmationModal
                    header={RESET}
                    show={isReset?.show}
                    isCloseButton={false}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    handleConfirm={(status) => {
                        if (status) {
                            reset((formState) => ({
                                ...formState,
                                listType: '',
                                attributeMapping: '',
                                listName: '',
                                categoryTypeText: '',
                                categoryType: '',
                                csvFiles: null,
                                isColumnHeader: true,
                            }));
                            dispatch(updateResponseHeader([]));
                            dispatch(updateHeaderColumns(''));
                            dispatch(resetCsvFiles());
                            setIsReset({
                                show: false,
                            });
                            setInvalidFiles([]);
                        }
                    }}
                    handleClose={() => {
                        setIsReset({
                            show: false,
                        });
                        setInvalidFiles([]);
                    }}
                />
            )}
            {listAnalysisInfoModal?.show && (
                <ListAnalysis
                    type={'addAudience'}
                    close={() => {
                        setListAnalysisInfoModal({
                            show: false,
                            fileName: '',
                        });
                    }}
                    show={listAnalysisInfoModal?.show}
                    dispatchState={() => { }}
                    isProceed={false}
                    listAnalysisData={
                        fileWiseListAnalysisData[listAnalysisInfoModal?.fileName]
                            ? fileWiseListAnalysisData[listAnalysisInfoModal?.fileName]
                            : {}
                    }
                    listType={listType}
                />
            )}
        </>
    );
};

export default CSVUpload;
