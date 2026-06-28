import { getErrorMessage } from '../../constant';
import { getBrandNameUIPrintable } from 'Utils/modules/brandStorage';
import { BRAND_ID_CHECK } from 'Utils/modules/communicationChannels';
import { getCsvListType } from 'Utils/modules/browserUtils';
import { getEnvironment } from 'Utils/modules/environment';
import { formatBytes } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { ADHOCATTRIBUTES, FILECOUNT, FILECOUNT_TL, MATCHLISTATTRIBUTES, SEEDLISTATTRIBUTES, SEEDLISTAUDIENCE } from 'Constants/GlobalConstant/Regex';
import { CONTAINS_INVALID_FILES, FILENAME_EXIST, FIRST_ROW_COLUMN_HEADER, HEADERS_NOT_MATCHED, MAX_ADHOC_COLUMNS, MAX_CSV_FILES_ADHOCLIST, MAX_CSV_FILES_MATCHINPUTLIST, MAX_CSV_FILES_SEEDLIST, MAX_CSV_FILES_SUPPRESSIONINPUTLIST, MAX_CSV_FILES_TARGETLIST, MAX_MATCH_SUPPRESSION_COLUMNS, MAX_SEED_AUDIENCE_LIST, MAX_SEED_COLUMNS, MAX_TARGET_COLUMNS } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_FILE, CHOOSE_YOUR_FILE, COLUMN_HEADER_POPOVER, DELETE, FIRSTROW_COLUMN_HEADER, SELECTED_FILE } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_close_fill_medium, circle_info_medium, circle_plus_medium, circle_question_mark_mini, circle_tick_medium, csv_download_medium, delete_medium, equal_to_medium, popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _find from 'lodash/find';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Papa from 'papaparse';

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
    updateExcelFilesData,
} from 'Reducers/audience/addAudience/reducer';
import { checkFileNameExists, validateCsvFile } from 'Reducers/audience/addAudience/request';
// import { ADHOCATTRIBUTES, FILECOUNT } from './Components/ConfirmationPopup/constant';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx';
import ListAnalysis from '../../../../../AddImportAudience/Components/ListAnalysis';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';

const ExcelUpload = ({ isValidListname, uploadType, fetchAudienceInsight }) => {
    const dispatch = useDispatch();
          const env = getEnvironment();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [listAnalysisInfoModal, setListAnalysisInfoModal] = useState({
        show: false,
        fileName: '',
    });
    const [isDelete, setIsDelete] = useState({
        show: false,
        deleteIndex: null,
        data: {},
    });

    const [invalidFiles, setInvalidFiles] = useState([]);
    const [uploadingSkeletonCount, setUploadingSkeletonCount] = useState(0);
    const isFileUploadLoading = uploadingSkeletonCount > 0;
    const { csvFiles, path, headerColumns, responseHeaders, fileWiseListAnalysisData, excelFilesData } = useSelector(
        ({ addAudienceReducer }) => addAudienceReducer,
    );
            const hasUploadError = !!_find(csvFiles, ['isValid', false]) || false;

    const {
        control,
        setValue,
        setError,
        clearErrors,
        watch,
        reset,
        getValues,
        setFocus,
        formState: { errors },
    } = useFormContext();
    const { fields, append, remove, update, replace } = useFieldArray({
        control,
        name: `excelFiles`,
    });
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
            //dispatch(updateExcelFilesData([]));
            setValue('excelFiles', []);
            clearErrors('excelFiles');
        };
    }, []);

    const isExcelFile = (file) => {
        return (
            file.type === 'application/vnd.ms-excel' ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.name.toLowerCase().endsWith('.xls') ||
            file.name.toLowerCase().endsWith('.xlsx')
        );
    };

    const validateAndFilterFiles = async (files) => {
        const validFiles = [];
        const invalidFilesList = [];

        if (!files || files.length === 0) {
            return { validFiles, invalidFiles: invalidFilesList };
        }

        // Filter out non-Excel files
        const excelFiles = Array.from(files).filter((file) => isExcelFile(file));
        const nonExcelFiles = Array.from(files).filter((file) => !isExcelFile(file));

        // Mark non-Excel files as invalid
        nonExcelFiles.forEach((file) => {
            invalidFilesList.push({
                fileName: file.name,
                reason: 'Only Excel files (.xlsx, .xls) are allowed',
            });
        });

        if (excelFiles.length === 0) {
            return { validFiles, invalidFiles: invalidFilesList };
        }

        // Allow multiple Excel files
        files = excelFiles;

        const type = getCsvListType(listType);
        const existingFileCount = excelFilesData?.length || 0;
        const newFileCount = files.length || 0;
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
            setFocus('csvFiles');
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 3 && totalCount > 1) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_SEEDLIST });
            setFocus('csvFiles');
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 5 && totalCount > 6) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_TARGETLIST });
            setFocus('csvFiles');
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 2 && totalCount > 6) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_MATCHINPUTLIST });
            setFocus('csvFiles');
            return { validFiles, invalidFiles: invalidFilesList };
        }
        if (type === 4 && totalCount > 6) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES_SUPPRESSIONINPUTLIST });
            setFocus('csvFiles');
            return { validFiles, invalidFiles: invalidFilesList };
        }

        // Process Excel files only - extract sheet names for each file
        const excelFilesForHeader = Array.from(files).filter((file) => isExcelFile(file));

        // Check for duplicate files (already in excelFilesData or csvFiles, or within the same batch)
        const filesToProcess = [];
        const duplicateFiles = [];
        const seenInBatch = new Set(); // Track files seen in current batch

        excelFilesForHeader.forEach((excelFile, index) => {
            const fileKey = `${excelFile.name}_${excelFile.size}`;

            // Check for duplicates within the same upload batch
            if (seenInBatch.has(fileKey)) {
                duplicateFiles.push({
                    fileName: excelFile.name,
                    reason: 'File already uploaded',
                });
                return;
            }
            seenInBatch.add(fileKey);

            // Check if file already exists in excelFilesData (waiting for sheet selection)
            const existsInExcelFilesData = excelFilesData.some(
                (fileData) => fileData.file.name === excelFile.name && fileData.file.size === excelFile.size,
            );

            // Check if file already exists in csvFiles (already validated)
            // const existsInCsvFiles = csvFiles.some((list) => {
            //     // Check if the fileName starts with the excel file name (since we use "fileName - sheetName" format)
            //     return list.fileName && list.fileName.startsWith(excelFile.name);
            // });

            if (existsInExcelFilesData) {
                duplicateFiles.push({
                    fileName: excelFile.name,
                    reason: 'File already uploaded',
                });
            } else {
                filesToProcess.push(excelFile);
            }
        });

        // Add duplicate files to invalid files list
        invalidFilesList.push(...duplicateFiles);

        // Excel files will be processed after sheet selection, so don't add to validFiles yet

        // Handle multiple Excel files - extract sheet names for each
        if (filesToProcess.length > 0) {
            const fileProcessingPromises = filesToProcess.map(async (excelFile) => {
                try {
                    const XLSXModule = await import('xlsx').catch(() => null);
                    if (!XLSXModule) {
                        invalidFilesList.push({
                            fileName: excelFile.name,
                            reason: 'Error reading file',
                        });
                        return { success: false, fileName: excelFile.name };
                    }
                    const XLSX = XLSXModule.default || XLSXModule;
                    const reader = new FileReader();
                    return new Promise((resolve) => {
                        reader.onload = (e) => {
                            try {
                                const data = new Uint8Array(e.target.result);
                                const workbook = XLSX.read(data, { type: 'array' });
                                const sheetNames = workbook.SheetNames || [];

                                if (sheetNames.length > 0) {
                                    resolve({
                                        success: true,
                                        file: excelFile,
                                        sheetNames: sheetNames,
                                        selectedSheets: [], // Array for multiple sheet selection
                                    });
                                } else {
                                    invalidFilesList.push({
                                        fileName: excelFile.name,
                                        reason: 'Excel file has no sheets',
                                    });
                                    resolve({ success: false, fileName: excelFile.name });
                                }
                            } catch (error) {
                                invalidFilesList.push({
                                    fileName: excelFile.name,
                                    reason: 'Unable to read file',
                                });
                                resolve({ success: false, fileName: excelFile.name });
                            }
                        };
                        reader.onerror = () => {
                            invalidFilesList.push({
                                fileName: excelFile.name,
                                reason: 'Error reading file',
                            });
                            resolve({ success: false, fileName: excelFile.name });
                        };
                        reader.readAsArrayBuffer(excelFile);
                    });
                } catch (error) {
                    invalidFilesList.push({
                        fileName: excelFile.name,
                        reason: 'Error processing Excel file: ' + error.message,
                    });
                    return { success: false, fileName: excelFile.name };
                }
            });

            // Use Promise.allSettled to handle all promises even if some fail
            const fileResults = await Promise.allSettled(fileProcessingPromises);
            const validFileResults = fileResults
                .filter((result) => {
                    // Handle both Promise.allSettled format and direct results
                    if (result.status === 'fulfilled') {
                        return result.value?.success === true;
                    }
                    return false;
                })
                .map((result) => result.value)
                .filter((result) => result !== null && result.success === true);

            if (validFileResults.length > 0) {
                const files = [...excelFilesData, ...validFileResults];
                dispatch(updateExcelFilesData(files));
                validFileResults.forEach((fileData) => {
                    append({
                        ...fileData,
                        excelSheetSelection: fileData.selectedSheets || [],
                    });
                });
            }
        }

        return { validFiles, invalidFiles: invalidFilesList };
    };

    const handleExcelSheetSelection = async (fileIndex, selectedSheets) => {
        if (fileIndex < 0 || fileIndex >= excelFilesData.length) {
            return;
        }
        const previousSelection = getValues(`excelFiles.${fileIndex}.excelSheetSelection`) || [];
        const isDeleting = previousSelection?.length > selectedSheets?.length;

        const fileData = excelFilesData[fileIndex];
        if (!fileData || !fileData.file) return;
        const fileName = fileData.file.name;

        // Handle deletion - remove sheets that were deselected
        if (isDeleting) {
            const deletedSheets =
                fileData?.selectedSheets?.filter(
                    (sheetItem) => !selectedSheets.some((sel) => sel.sheetName === sheetItem.sheetName),
                ) || [];

            // Remove each deleted sheet from csvFiles
            deletedSheets.forEach((deletedSheet) => {
                const deletedSheetName = `${deletedSheet?.fileName || fileName} - ${deletedSheet?.sheetName}`;
                const deleteIndex = csvFiles?.findIndex((sheetItem) => sheetItem?.fileName === deletedSheetName);
                if (deleteIndex !== -1) {
                    removeUploadedFile(deleteIndex, csvFiles[deleteIndex]);
                }
            });
        }

        if (!Array.isArray(selectedSheets)) {
            selectedSheets = [];
        }

        // Filter out sheets that have already been validated
        const sheetsToProcess = selectedSheets.filter((sheetItem) => {
            const sheetName = sheetItem?.sheetName || sheetItem;
            if (!sheetName) return false;
            const uniqueFileName = `${fileName} - ${sheetName}`;
            // Check if this sheet has already been validated (exists in csvFiles)
            const alreadyValidated = csvFiles.some((list) => list.fileName === uniqueFileName);
            return !alreadyValidated;
        });

        // If all sheets are already validated, no need to process
        if (sheetsToProcess.length === 0) {
            // Clear any existing errors since all sheets are validated
            const fieldName = `excelFiles.${fileIndex}.excelSheetSelection`;
            clearErrors(fieldName);
            // Update selected sheets in state but don't process
            const updated = [...excelFilesData];
            updated[fileIndex] = {
                ...updated[fileIndex],
                selectedSheets: selectedSheets,
            };
            dispatch(updateExcelFilesData(updated));
            update(fileIndex, {
                ...updated[fileIndex],
                excelSheetSelection: selectedSheets,
            });
            return;
        }

        // Validate max file length using common function
        const currentFileCount = csvFiles?.length || 0;
        const {
            itemsThatFit: sheetsThatFit,
            itemsThatExceed: sheetsThatExceed,
            maxFileError,
            hasExceeded,
        } = validateMaxFileLength(sheetsToProcess, currentFileCount, CSVLength, listType);

        // Add exceeding sheets to invalidFiles with appropriate error message
        // if (hasExceeded) {
        //     const exceededFilesList = sheetsThatExceed.map((sheetItem) => {
        //         const sheetName = sheetItem?.sheetName || sheetItem;
        //         const uniqueFileName = `${fileName} - ${sheetName}`;
        //         return {
        //             fileName: uniqueFileName,
        //             reason: maxFileError,
        //         };
        //     });

        //     // Add to existing invalidFiles, filtering out duplicates
        //     setInvalidFiles((prevInvalidFiles) => {
        //         const filteredPrev = prevInvalidFiles.filter(
        //             (existing) => !exceededFilesList.some((exceeded) => exceeded.fileName === existing.fileName),
        //         );
        //         return [...filteredPrev, ...exceededFilesList];
        //     });
        // }

        // Process only sheets that fit within the limit
        const processingPromises = sheetsThatFit.map(async (sheetItem) => {
            const sheetName = sheetItem?.sheetName || sheetItem;
            if (!sheetName) {
                return {
                    success: false,
                    fileName: fileName,
                    sheetName: 'Unknown',
                    reason: 'Invalid sheet name',
                };
            }
            return await validateAndUploadFile(fileData.file, sheetName);
        });

        setUploadingSkeletonCount(sheetsThatFit.length);
        let results = [];
        try {
            results = await Promise.all(processingPromises);
        } finally {
            setUploadingSkeletonCount(0);
        }

        // Clear errors for this multiselect field first
        const fieldName = `excelFiles.${fileIndex}.excelSheetSelection`;
        clearErrors(fieldName);

        // Separate successful and failed results
        const successfulResults = results.filter((result) => result.success);
        const failedResults = results.filter((result) => !result.success);

        // Build error messages for form validation
        const errorMessages = [];

        // Add error messages for sheets that exceeded max length
        if (hasExceeded) {
            sheetsThatExceed.forEach((sheetItem) => {
                const sheetName = sheetItem?.sheetName || sheetItem;
                errorMessages.push(`${sheetName}: ${maxFileError}`);
            });
        }

        // Add error messages for failed validations
        if (failedResults.length > 0) {
            failedResults.forEach((result) => {
                const sheetName = result.fileName || 'Unknown sheet';
                errorMessages.push(`${sheetName}: ${result.reason || 'Error processing Excel file'}`);
            });
        }

        // Set error if there are any error messages
        if (errorMessages.length > 0) {
            setError(fieldName, {
                type: 'custom',
                message: errorMessages.join('; '),
            });
        }

        // Only update selectedSheets in excelFilesData if there are successful validations
        // or if all sheets are already validated (handled above)
        if (successfulResults.length > 0 || failedResults.length === 0) {
            const updated = [...excelFilesData];
            updated[fileIndex] = {
                ...updated[fileIndex],
                selectedSheets: selectedSheets,
            };
            dispatch(updateExcelFilesData(updated));
            // Update field array
            update(fileIndex, {
                ...updated[fileIndex],
                excelSheetSelection: selectedSheets,
            });
            if (successfulResults.length > 0) {
                handleInsightAPICall(successfulResults);
            }
        }
    };

    const validateAndUploadFile = async (file, selectedSheetName = null) => {
        return new Promise(async (resolve) => {
            // Check if file is Excel format
            const isExcel = isExcelFile(file);

            if (isExcel) {
                // Handle Excel files
                try {
                    const XLSXModule = await import('xlsx').catch(() => null);
                    if (!XLSXModule) {
                        resolve({
                            success: false,
                            fileName: file.name,
                            reason: 'Error reading file',
                        });
                        return;
                    }
                    const XLSX = XLSXModule.default || XLSXModule;

                    const reader = new FileReader();
                    reader.onload = async function (e) {
                        try {
                            const data = new Uint8Array(e.target.result);
                            const workbook = XLSX.read(data, { type: 'array' });
                            const sheetName = selectedSheetName || workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];

                            if (!worksheet) {
                                resolve({
                                    success: false,
                                    fileName: file.name,
                                    reason: `Sheet "${sheetName}" not found in Excel file`,
                                });
                                return;
                            }

                            // Convert Excel to CSV format
                            const csvText = XLSX.utils.sheet_to_csv(worksheet, { defval: '' });

                            // Check if CSV text is empty
                            if (!csvText || csvText.trim().length === 0) {
                                resolve({
                                    success: false,
                                    fileName: sheetName,
                                    sheetName: sheetName,
                                    reason: 'Selected sheet is empty',
                                });
                                return;
                            }

                            // Continue with existing CSV validation logic
                            await processCsvContent(csvText, file, resolve, sheetName);
                        } catch (error) {
                            resolve({
                                success: false,
                                fileName: file.name,
                                reason: 'Unable to read file',
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
                    reader.readAsArrayBuffer(file);
                } catch (error) {
                    resolve({
                        success: false,
                        fileName: file.name,
                        reason: 'Error processing Excel file: ' + error.message,
                    });
                }
            } else {
                // Not an Excel file - should not reach here if validation is correct
                resolve({
                    success: false,
                    fileName: file.name,
                    reason: 'Only Excel files are allowed',
                });
            }
        });
    };

    const processCsvContent = async (csvText, file, resolve, sheetName = null) => {
        try {
            const type = getCsvListType(listType);
            const MAX_FILE_SIZE = 10485760; // 10MB

            // Create unique identifier: fileName - sheetName (if sheetName exists)
            const uniqueFileName = sheetName ? `${file.name} - ${sheetName}` : file.name;
            const resolveFileName = sheetName || file.name;

            if (file.size > MAX_FILE_SIZE) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1048576}MB`,
                });
                return;
            }

            const validFileNamePattern = /^[a-zA-Z0-9\s\-_]+\.(xlsx|xls)$/i;
            if (!validFileNamePattern.test(file.name)) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: 'File name contains invalid characters or unsupported file extension',
                });
                return;
            }

            // Check for duplicate using unique identifier (fileName - sheetName)
            const fileNameExists = csvFiles.some((list) => list.fileName === uniqueFileName);
            if (fileNameExists) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: FILENAME_EXIST,
                });
                return;
            }

            if (csvFiles?.length >= 6 && [2, 4, 5].includes(type)) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: MAX_CSV_FILES_TARGETLIST,
                });
                return;
            }
            if (csvFiles?.length >= 5 && [1].includes(type)) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: MAX_CSV_FILES_ADHOCLIST,
                });
                return;
            }

            // if (hasUploadError) {
            //     resolve({
            //         success: false,
            //         fileName: uniqueFileName,
            //         reason: CONTAINS_INVALID_FILES,
            //     });
            //     return;
            // }

            // Parse CSV using Papa Parse
            const parseResult = Papa.parse(csvText, {
                header: false,
                skipEmptyLines: true,
            });
            const lines = parseResult?.data?.map((row) => row.join(','));

            if (lines.length === 0) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: CONTAINS_INVALID_FILES,
                });
                return;
            }

            const firstRow = lines[0];
            const firstRowArr = parseResult.data[0] || [];

            if (firstRowArr?.length === 0 || firstRow === '' || firstRowArr[0] === '') {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: CONTAINS_INVALID_FILES,
                });
                return;
            }

            // Brand validation in header
            if (!isAdHocList && BRAND_ID_CHECK.includes(listType)) {
                const brandName = getBrandNameUIPrintable(departmentId);
                if (!firstRowArr.includes(brandName)) {
                    resolve({
                        success: false,
                        fileName: resolveFileName,
                        reason: `Invalid upload: Brand Id [${brandName}] missing in the file`,
                    });
                    return;
                }
            }

            if (firstRowArr?.length > 25 && type === 5) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: MAX_TARGET_COLUMNS,
                });
                return;
            }

            if (type === 3 && lines.length - 1 > SEEDLISTAUDIENCE) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: MAX_SEED_AUDIENCE_LIST,
                });
                return;
            }

            if (headerColumns !== firstRow && headerColumns?.length > 0) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: HEADERS_NOT_MATCHED,
                });
                return;
            }
            // else if (csvFiles?.length && headerColumns !== firstRow) {
            //     resolve({
            //         success: false,
            //         fileName: uniqueFileName,
            //         reason: HEADERS_NOT_MATCHED,
            //     });
            //     return;
            // }
            if (isAdHocList && firstRowArr?.length > ADHOCATTRIBUTES) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: MAX_ADHOC_COLUMNS,
                });
                return;
            }

            if (type === 3 && firstRowArr?.length > SEEDLISTATTRIBUTES) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: MAX_SEED_COLUMNS,
                });
                return;
            }

            if ((type === 2 || type === 4) && firstRowArr?.length > MATCHLISTATTRIBUTES) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: MAX_MATCH_SUPPRESSION_COLUMNS,
                });
                return;
            }

            const fSize = _get(file, 'size') || 0;
            const encodedData = btoa(csvText);
            const payload = {
                name: uniqueFileName,
                size: fSize,
                encodedData,
                departmentId,
                clientId,
                userId,
                type,
                path,
                isExcel: true,
                excelFileName: file.name,
                excelSheetName: sheetName || '',
            };

            if (type === 5) {
                const fileNamePayload = {
                    filenameDescription: uniqueFileName,
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
                        fileName: resolveFileName,
                        reason: 'File name already exists',
                    });
                    return;
                }
            }

            const result = await dispatch(
                validateCsvFile(payload, clearErrors, responseHeaders, csvFiles?.length, false),
            );
            const { status } = result || {};

            if (!status) {
                resolve({
                    success: false,
                    fileName: resolveFileName,
                    reason: result?.errorMsg || result?.message || CONTAINS_INVALID_FILES,
                });
                return;
            }

            if (status && headerColumns?.length == 0) {
                dispatch(updateHeaderColumns(firstRow));
            }
            setValue('csvFiles', null);
            resolve({ success: true, fileName: uniqueFileName, data: result?.data });
        } catch (err) {
            const resolveFileName = sheetName || file.name;
            resolve({
                success: false,
                fileName: resolveFileName,
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

    // Common function to get max file error message based on list type
    const getMaxFileErrorMessage = (listTypeValue) => {
        const type = getCsvListType(listTypeValue);
        if (type === 1) {
            return MAX_CSV_FILES_ADHOCLIST;
        } else if (type === 3) {
            return MAX_CSV_FILES_SEEDLIST;
        } else if (type === 5) {
            return MAX_CSV_FILES_TARGETLIST;
        } else if (type === 2) {
            return MAX_CSV_FILES_MATCHINPUTLIST;
        } else if (type === 4) {
            return MAX_CSV_FILES_SUPPRESSIONINPUTLIST;
        } else {
            return 'Maximum file count exceeded';
        }
    };

    // Common function to validate max file length and split items into those that fit and exceed
    const validateMaxFileLength = (itemsToAdd, currentCount, maxLength, listTypeValue) => {
        const remainingSlots = maxLength - currentCount;
        const itemsThatFit = remainingSlots > 0 ? itemsToAdd.slice(0, remainingSlots) : [];
        const itemsThatExceed = remainingSlots > 0 ? itemsToAdd.slice(remainingSlots) : itemsToAdd;
        const maxFileError = getMaxFileErrorMessage(listTypeValue);

        return {
            itemsThatFit,
            itemsThatExceed,
            maxFileError,
            hasExceeded: itemsThatExceed.length > 0,
        };
    };

    const removeUploadedFile = async (deleteIndex, data = {}) => {
        const fileToDelete = csvFiles[deleteIndex];
        const fileName = data?.excelFileName || '';
        const currSheet = data?.excelSheetName;

        const cuuForm = getValues('excelFiles');

        if (fileName && currSheet) {
            const excelFileIndex = excelFilesData.findIndex((fileData) => fileData?.file?.name === fileName);
            if (excelFileIndex !== -1) {
                const currentSelection = getValues(`excelFiles.${excelFileIndex}.excelSheetSelection`) || [];

                const updatedSelection = currentSelection.filter((sheet) => {
                    const currentSheetName = sheet?.sheetName || sheet;
                    return currentSheetName !== currSheet;
                });

                const updated = [...excelFilesData];
                updated[excelFileIndex] = {
                    ...updated[excelFileIndex],
                    selectedSheets: updatedSelection,
                };
                dispatch(updateExcelFilesData(updated));

                update(excelFileIndex, {
                    ...updated[excelFileIndex],
                    excelSheetSelection: updatedSelection,
                });

                clearErrors(`excelFiles.${excelFileIndex}.excelSheetSelection`);
            }
        }

        const isLastFile = csvFiles?.length <= 1;
        const remainingPaths =
            path?.filter((_, index) => index !== deleteIndex).filter(Boolean) ?? [];

        dispatch(deleteCsvFiles(deleteIndex));

        dispatch(
            updateListAnalysisData({
                fileName,
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

    const ExcelFileCardLoadingSkeleton = () => (
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
                            <div className="d-flex align-items-center flex-shrink-0 mr10 gap-2">
                                <CommonSkeleton width={20} height={20} circle stopAnimation />
                                <CommonSkeleton width={16} height={14} box stopAnimation />
                            </div>
                        </div>
                    </div>
                </div>
            </Col>
        );


    const processSelectedExcelFiles = async (files) => {
        if (!files || files.length === 0) return;
        setInvalidFiles([]);

        const excelFileCount = Array.from(files).filter((file) => isExcelFile(file)).length;
        if (excelFileCount > 0) {
            setUploadingSkeletonCount(excelFileCount);
        }

        try {
            const { invalidFiles: headerInvalidFiles } = await validateAndFilterFiles(files);

            if (headerInvalidFiles.length > 0) {
                setInvalidFiles(headerInvalidFiles);
            }
        } finally {
            setUploadingSkeletonCount(0);
        }
    };

    // File Upload Card Skeleton (matches the image)
    const FileUploadCardSkeleton = () => (
        <Col sm={4} className="position-relative">
            <div className="rsfb-valid rs-file-box create-new-skeleton px10 pt10 pb2  d-flex justify-content-around">
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
                <div className="mt21 align-items-baseline d-flex flex-column justify-content-center">
                    <span>
                        {/* <RSTooltip text={ADD_FILE} position="top" className="lh0"> */}
                        <RSFileUpload
                            containerClass={
                                csvFiles?.length === CSVLength ||
                                !isValidListname ||
                                excelFilesData?.length === CSVLength ||
                                hasListTypeError
                                    ? // (isSeedList && csvFiles?.length === 1) ||
                                      //  (listType === 'Target list' && csvFiles?.length === 6)
                                      getValues('validatedImportDescriptionName')
                                        ? ''
                                        : 'pe-none click-off'
                                    : ''
                            }
                            disabled={hasListTypeError}
                            isLoading={isFileUploadLoading}
                            id="rs_CSV_Browsefiles"
                            control={control}
                            name="csvFiles"
                            text="Browse"
                            accept={'.xlsx,.xls'}
                            placeholder="Select Excel file(s)"
                            clearErrors={clearErrors}
                            setError={setError}
                            customInputClass="audience_browser_btn"
                            required
                            handleChange={async (e) => {
                                await processSelectedExcelFiles(e?.target?.files);
                            }}
                            onClick={(event) => {
                                event.target.value = null;
                            }}
                            watch={watch}
                            size={10485760}
                            labelInputClassName="d-none"
                            isCustomElement={
                                <i className={`${circle_plus_medium}  color-primary-blue icon-md `}></i>
                            }
                            moreFiles={isSeedList ? false : true}
                        />
                        {/* </RSTooltip> */}
                    </span>
                    <p className="">{ADD_FILE}</p>
                </div>
            </div>
        </Col>
    );

    const handleInsightAPICall = async (validationResults) => {
        const successfulResults = validationResults?.filter((result) => result?.success) ?? [];
        if (successfulResults.length === 0) return;

        const pathData = [
            ...path,
            ...successfulResults.map((result) => result?.data?.path || ''),
        ];
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
                                containerClass={
                                    csvFiles?.length === CSVLength ||
                                    !isValidListname ||
                                    excelFilesData?.length === CSVLength ||
                                    hasListTypeError
                                        ? // (isSeedList && csvFiles?.length === 1) ||
                                          //  (listType === 'Target list' && csvFiles?.length === 6)
                                          getValues('validatedImportDescriptionName')
                                            ? ''
                                            : 'pe-none click-off'
                                        : ''
                                }
                                disabled={hasListTypeError}
                                isLoading={isFileUploadLoading}
                                id="rs_CSV_Browsefiles"
                                control={control}
                                name="csvFiles"
                                text="Browse"
                                accept={'.xlsx,.xls'}
                                placeholder="Choose excel file(s)"
                                clearErrors={clearErrors}
                                setError={setError}
                                required
                                handleChange={async (e) => {
                                    await processSelectedExcelFiles(e?.target?.files);
                                }}
                                onClick={(event) => {
                                    event.target.value = null;
                                }}
                                watch={watch}
                                size={10485760}
                                moreFiles={isSeedList ? false : true}
                            />

                            {/* {listType != 'Seed list' && ( */}
                            <ul className="d-flex align-items-center rs-list-inline position-relative col-sm-9">
                                <li>
                                    <small className="small-text-space-top">
                                        {`Accepts only excel files (.xlsx, .xls). Maximum ${(() => {
                                            if (listType === 'Ad-hoc list') return FILECOUNT;
                                            if (listType === 'Seed list') return 1;
                                            return FILECOUNT_TL;
                                        })()} file(s) allowed`}
                                    </small>
                                </li>
                            </ul>
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
                {fields?.length > 0 && (
                    <div className="form-group">
                        {fields?.map((field, fileIndex) => {
                            const fileData = field;
                            if (!fileData.file || !fileData.sheetNames || fileData.sheetNames.length === 0) {
                                return null;
                            }
                            const fieldName = `excelFiles.${fileIndex}`;
                            const sheetSelectData = fileData.sheetNames.map((sheet) => ({
                                sheetName: sheet,
                                fileName: fileData.file?.name || '',
                            }));
                            return (
                                <div key={field.id} className="form-group">
                                    <Row>
                                        <Col sm={{ span: 3, offset: 1 }} className="text-right">
                                            <label className="control-label-left">
                                                {SELECTED_FILE} {fileIndex + 1}
                                            </label>
                                        </Col>
                                        <Col sm={6}>
                                            <Row>
                                                <Col sm={8}>
                                                    <RSMultiSelect
                                                        name={`${fieldName}.excelSheetSelection`}
                                                        control={control}
                                                        data={sheetSelectData}
                                                        textField="sheetName"
                                                        dataItemKey="sheetName"
                                                        label="Select sheet(s)"
                                                        placeholder="Select sheet(s)"
                                                        variant="checkbox"
                                                        showCheckboxFooter
                                                        selectAllLabel="Select all"
                                                        checkboxSaveLabel="OK"
                                                        checkboxCancelLabel="Cancel"
                                                        handleChange={({ value }) => {
                                                            void handleExcelSheetSelection(fileIndex, value ?? []);
                                                        }}
                                                    />
                                                </Col>
                                                <Col sm={4} className="d-flex align-items-end pl0">
                                                    <RSTooltip text={DELETE} className="lh0 d-inline-flex">
                                                        <i
                                                            className={`${delete_medium} icon-md color-primary-red`}
                                                            onClick={async () => {
                                                                const fileToDelete = excelFilesData[fileIndex];
                                                                if (
                                                                    fileToDelete?.file &&
                                                                    fileToDelete?.selectedSheets
                                                                ) {
                                                                    const fileName = fileToDelete.file.name;
                                                                    const indexesToDelete = csvFiles
                                                                        .map((item, index) =>
                                                                            item.excelFileName === fileName
                                                                                ? index
                                                                                : -1,
                                                                        )
                                                                        .filter((index) => index !== -1)
                                                                        .reverse();

                                                                    const remainingPaths =
                                                                        path
                                                                            ?.filter(
                                                                                (_, index) =>
                                                                                    !indexesToDelete.includes(index),
                                                                            )
                                                                            .filter(Boolean) ?? [];
                                                                    const isRemovingAllCsvFiles =
                                                                        csvFiles.length <= indexesToDelete.length;

                                                                    indexesToDelete.forEach((index) => {
                                                                        dispatch(deleteCsvFiles(index));
                                                                    });

                                                                    if (isRemovingAllCsvFiles) {
                                                                        dispatch(resetCsvFiles());
                                                                    } else if (remainingPaths.length > 0) {
                                                                        handleFetchAudienceInsight(remainingPaths.join(','));
                                                                    }
                                                                    // // Find all indices of sheets from this file in csvFiles
                                                                    // const indicesToDelete = fileToDelete.selectedSheets
                                                                    //     .map((sheetItem) => {
                                                                    //         const sheetName =
                                                                    //             sheetItem?.sheetName || sheetItem;
                                                                    //         const deletedSheetName = `${fileName} - ${sheetName}`;
                                                                    //         return csvFiles?.findIndex(
                                                                    //             (csvFile) =>
                                                                    //                 csvFile?.fileName ===
                                                                    //                 deletedSheetName,
                                                                    //         );
                                                                    //     })
                                                                    //     .filter((index) => index !== -1);

                                                                    // // Remove in reverse order to maintain correct indices
                                                                    // indicesToDelete.reverse().forEach((deleteIndex) => {
                                                                    //     if (deleteIndex !== -1) {
                                                                    //         removeUploadedFile(
                                                                    //             deleteIndex,
                                                                    //             csvFiles[deleteIndex],
                                                                    //         );
                                                                    //     }
                                                                    // });
                                                                }

                                                                // dispatch(
                                                                //     updateListAnalysisData({
                                                                //         fileName: fileName,
                                                                //         data: {},
                                                                //     }),
                                                                // );
                                                                // Remove the file from excelFilesData and field array in parallel
                                                                const updatedExcelFilesData = excelFilesData.filter(
                                                                    (_, index) => index !== fileIndex,
                                                                );

                                                                // Use useFieldArray's remove() to handle index shifting automatically
                                                                // This prevents error messages from shifting to wrong indices
                                                                remove(fileIndex);

                                                                // Update excelFilesData after removing from field array
                                                                dispatch(updateExcelFilesData(updatedExcelFilesData));
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                </Col>
                                            </Row>
                                            <ul className="d-flex align-items-center rs-list-inline position-relative">
                                                <li>
                                                    <small className="small-text-space-top">
                                                        {fileData.file.name.length > 55 ? (
                                                            <RSTooltip
                                                                text={fileData.file.name}
                                                                className="lh0 d-inline-flex"
                                                            >
                                                                {truncateTitle(fileData.file.name, 55)}
                                                            </RSTooltip>
                                                        ) : (
                                                            fileData.file.name
                                                        )}
                                                    </small>
                                                </li>
                                            </ul>
                                        </Col>
                                    </Row>
                                </div>
                            );
                        })}
                    </div>
                )}
                {invalidFiles.length > 0 && (
                    <Row>
                        <Col>
                            <div className="p10 bg-secondary-red rounded invalidCsvWrapper">
                                <div className="d-flex justify-content-between mb15">
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
                                            <li key={idx} className="mb5 d-flex">
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
                                                                {truncateTitle(invalid.fileName, 50)}
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
                            {_map(csvFiles, (list, listIndex) => {
                                return (
                                    <Col sm={4} key={list.fileName}>
                                        <div
                                            className={`${list.isValid ? 'rsfb-valid' : 'rsfb-invalid'} rs-file-box`}
                                            key={listIndex}
                                        >
                                            <div className="rsfb-file-info">
                                                <div className='d-flex justify-content-between '>
                                                {list?.fileName &&
                                                 <TruncateCell value={list?.fileName} noTable ={true} truncateClassName="lh24 h24"/>
                                                    }
                                                          
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
                                                        <RSTooltip text={DELETE} className="lh0 ml10 position-relative bottom1">
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
                                            <div className="rsfb-file-status d-flex align-items-center justify-content-between py1">
                                               <TruncateCell
                                                    value={
                                                        list.isValid
                                                            ? 'Verified - Valid'
                                                            : getErrorMessage(list?.errorMsg)
                                                    }
                                                    noTable={true}
                                                    truncateClassName="pl0 flex-grow-1 min-w-0"
                                                />
                                                <div className="rsfb-file-status__actions d-flex align-items-center flex-shrink-0 mr10 gap-2">
                                                    <div
                                                        className="lh0 rsfb-file-status__info"
                                                        onClick={() => {
                                                            setListAnalysisInfoModal({
                                                                show: true,
                                                                fileName: list?.fileName,
                                                            });
                                                        }}
                                                    >
                                                        <i
                                                            className={`${circle_info_medium} icon-md color-primary-white`}
                                                        />
                                                    </div>
                                                    <div className="lh0 rsfb-file-status__drag cursor-grab">
                                                        <i
                                                            className={`${equal_to_medium} icon-md color-primary-white`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
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
                            {Array.from({ length: uploadingSkeletonCount }).map((_, index) => (
                                <ExcelFileCardLoadingSkeleton key={`excel-upload-skeleton-${index}`} />
                            ))}
                            {csvFiles?.length > 0 &&
                                CSVLength !== csvFiles?.length &&
                                uploadingSkeletonCount === 0 && <FileUploadCardSkeleton />}
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
                    dispatchState={() => {}}
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

export default ExcelUpload;
