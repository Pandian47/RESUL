import { encodeUrl } from 'Utils/modules/crypto';
import { NO_SPECIAL_CHARS } from 'Constants/GlobalConstant/Regex';
import { ATLEAST_ONE_ROW, HEADERS_MAXLENGTH, MANDATORY_FIELDS as MANDATORY_FIELDS_MESSAGE, NO_SPECIAL_CHARS as NO_SPECIAL_CHARS_MESSAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { DEFAULT_IMPORT_PREFERENCE } from './importPreferenceDefault';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
const MANDATORY_FIELD_KEYS = [
    'mail',
    'email',
    'email address',
    'emailaddress',
    'mobile number',
    'mobilenumber',
    'emailid',
    'mobile no',
    'mobileno',
    'mobilephone',
    'mobile',
    'phone',
    'phone number',
    'phonenumber',
    'phone no',
    'phoneno',
    'pan number',
    'pannumber',
    'pan',
];

export const MANDATORY_FIELDS = MANDATORY_FIELD_KEYS;
let url = '/audience/add-import-audience';
const audienceUpload = (data, setError, setValue, navigate) => {
    const { audienceBy, manualEntry, CSV, FTP } = data;
    if (audienceBy.type?.toLowerCase()?.includes('manual entry')) {
        validateAudienceManual(manualEntry, setError, navigate);
    } else if (audienceBy.type.toLowerCase().includes('csv')) {
        validateAudienceCSV(CSV, setError, navigate);
    } else if (audienceBy.type?.toLowerCase()?.includes('sftp')) {
        validateAudienceFTP(FTP, setValue, navigate);
    }
};

const validateAudienceManual = (manualEntry, setError, navigate) => {
    const audienceData = manualEntry.audienceData?.split('\n')?.filter((item) => item !== '');
    const firstRow = audienceData[0];
    const firstRowLength = firstRow?.split(',')?.filter((item) => item !== '')?.length;
    const isMandatoryFields = firstRow?.split(',')?.some((item) => MANDATORY_FIELD_KEYS?.includes(item?.toLowerCase()));
    if (firstRowLength > 5) {
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
            message: MANDATORY_FIELDS_MESSAGE,
        });
        return;
    }
    const state = { from: 'manual entry', data: { audienceCount: audienceData?.length, audienceData: audienceData } };
    const encryptState = encodeUrl(state);
    navigate(`${url}?q=${encryptState}`, {
        state,
    });
    // navigate(`/audience/add-import-audience`, {
    //     state: { from: 'manual entry', data: { audienceCount: audienceData?.length, audienceData: audienceData } },
    // });
    // audienceManualUpload();
};

const validateAudienceCSV = (csv, setError, navigate) => {
    const audienceData = ['Name, Age, Email', 'TestName, 35, testemail@gmail.com'];
    const state = { from: 'csv', data: { audienceData: audienceData } };
    const encryptState = encodeUrl(state);
    navigate(`${url}?q=${encryptState}`, {
        state,
    });
    // navigate(`/audience/add-import-audience`, {
    //     state: { from: 'csv', data: { audienceData: audienceData } },
    // });
};

const validateAudienceFTP = (FTP, setValue, navigate) => {
    setValue(`isConnected`, true);
    setTimeout(() => {
        setValue(`isConnected`, false);
        const url = '/audience';
        const index = 0;
        const state1 = { index };
        const encryptState = encodeUrl(state1);
        navigate(`${url}?q=${encryptState}`, {
            state: { index },
        });
    }, 2000);
};

export const getImportPreferenceVisible = (getValues) => {
    const { audienceBy, listType } = getValues();
    const updateListType = listType?.toLowerCase()?.replaceAll(' ', '');
    const audience = audienceBy?.type || false;
    const visibileLists = ['Manual entry', 'CSV'];
    if (!audience) return false;
    let isValid = true;
    if (!visibileLists.includes(audience)) return false;
    if (audience === 'CSV') {
        if (!updateListType) isValid = false;
        else if (updateListType === 'targetlist') {
            isValid = true;
        } else {
            isValid = false;
        }
        // else if (updateListType === 'ad-hoclist') {
        //     isValid = false;
        // } else if (updateListType === 'matchinputlist') {
        //     isValid = false;
        // } else if (updateListType === 'suppressioninputlist') {
        //     isValid = false;
        // } else if (updateListType === 'seedlist') {
        //     isValid = false;
        // }
    }
    return isValid;
};
const FORM_INITIAL_STATE = {
    defaultValues: {
        isColumnHeader: true,
        isImportPreference: true,
        audienceBy: {
            type: '',
            typeId: 0,
        },
        listType: '',
        catType: '',
        categoryTypeText: '',
        categoryType: '',
        friendlyName: '',
        ipAddress: '',
        portNumber: '',
        userName: '',
        password: '',
        folderPath: '',
        updatedCycle: '',
        manualEntry: {
            importDescription: '',
            isColumnHeader: true,
            audienceData: '',
            isImportPreference: false,
        },
        CSV: {
            listType: '',
            listName: '',
            csvInput: '',
            csvFiles: '',
            isColumnHeader: true,
            isImportPreference: true,
            audienceData: [],
        },
        FTP: {
            source: 'FTP',
            listType: '',
            friendlyName: '',
            ipAddress: '',
            portNumber: '',
            userName: '',
            password: '',
            folderPath: '',
            isConnected: false,
            friendlyNameLoading: false,
        },
        RDS: {},
        isImportPreference: DEFAULT_IMPORT_PREFERENCE,
        settings: [],
        single: 0.7,
        combined: 0.7,
        excelFiles: []
    },
    mode: 'onChange',
};

export const resetColumnFields = {
    audienceBy: null,
    importDescription: '',
    listName: '',
    csvInput: '',
    csvFiles: '',
    isColumnHeader: true,
    isImportPreference: true,
    audienceData: [],
    source: 'FTP',
    listType: '',
    friendlyName: '',
    ipAddress: '',
    portNumber: '',
    userName: '',
    password: '',
    folderPath: '',
    isConnected: false,
};

export { FORM_INITIAL_STATE, audienceUpload };

export const sampleDownloadContent = [
    'Name,EmailID,MobileNo,Age,City',
    'Alice johnson,johnsonalice.johnson@example.com,1234567890,28,New York',
    'Bob smith,bob.smith@example.com,2345678901,35,Los Angeles',
    'Charlie brown,charlie.brown@example.com,3456789012,22,Chicago',
    'David lee,david.lee@example.com,4567890123,40,Houston',
    'Emma watson,emma.watson@example.com,5678901234,30,San Francisco',
];

 export const generateFrontendBindJson = (csvFilesArray, pathArray, fileWiseListAnalysis, columnHeaders, excelFileData = null) => {
        if (!csvFilesArray?.length || !pathArray?.length) {
            return [];
        }
        let parsedHeaders = [];
        if (Array.isArray(columnHeaders)) {
            parsedHeaders = columnHeaders;
        } else if (typeof columnHeaders === 'string' && columnHeaders.trim() !== '') {
            try {
                const parsed = parseAudienceJsonArray(columnHeaders, []);
                parsedHeaders = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                parsedHeaders = columnHeaders.split(',').map((h) => h.trim()).filter(Boolean);
            }
        }

        return csvFilesArray.map((file, index) => {
            const filePath = pathArray[index] || file?.encodedData || '';
            const fileName = file?.fileName || '';
            
            const listAnalysis = fileWiseListAnalysis?.[fileName] || null;
            
            let columnHeader = parsedHeaders;
            
            if (!columnHeader?.length) {
                if (file?.columnHeader) {
                    if (Array.isArray(file.columnHeader)) {
                        columnHeader = file.columnHeader;
                    } else if (typeof file.columnHeader === 'string') {
                        try {
                            const parsed = parseAudienceJsonArray(file.columnHeader, []);
                            columnHeader = Array.isArray(parsed) ? parsed : [parsed];
                        } catch {
                            columnHeader = file.columnHeader.split(',').map((h) => h.trim()).filter(Boolean);
                        }
                    }
                }
            }

            const frontendBindItem = {
                filename: fileName,
                columnHeader: columnHeader || [],
                path: filePath,
                fileSize: file?.fileSize || 0,
            };
            if(excelFileData){
                frontendBindItem.excelFileData = excelFileData;
            }
            if (listAnalysis) {
                frontendBindItem.listAnalysis = listAnalysis;
            }

            return frontendBindItem;
        });
    };

 export const handleKendoGridData = (audienceData) => {
       if (!audienceData || !audienceData.trim()) {
                return { gridColumns: [], gridData: [] };
            }
    
            try {
                const lines = audienceData
                    .split(/\r?\n/)
                    .map(line => line.replace(/\r$/, '').trim())
                    .filter(line => line.length > 0);
                
                if (lines.length < 2) {
                    return { gridColumns: [], gridData: [] };
                }
    
                const parseCSVLine = (line) => {
                    const values = [];
                    let current = '';
                    let inQuotes = false;
                    
                    for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            values.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    values.push(current.trim());
                    return values;
                };
    
                const headers = parseCSVLine(lines[0]);
                
                const columns = headers.map((header, index) => ({
                    field: `col_${index}`,
                    title: header || `Column ${index + 1}`,
                    width: 150,
                }));
    
                const data = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    const row = {};
                    headers.forEach((header, index) => {
                        row[`col_${index}`] = values[index] || '';
                    });
                    data.push(row);
                }
    
                return { gridColumns: columns, gridData: data };
            } catch (error) {
                return { gridColumns: [], gridData: [] };
            }
    
}