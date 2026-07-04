import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function downloadZIPfilewithCSV(data, fileName) {
    const zip = new JSZip();
    zip.file(fileName, data);
    zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, fileName.split('.')[0] + '_' + new Date().toDateString().replaceAll(' ', '_') + '.zip');
    });
}

function convertToCSV(data) {
    if (typeof data === 'string') return data;
    if (!Array.isArray(data) || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
}

export function downloadCSV(data, filename) {
    const blob = new Blob([convertToCSV(data)], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
// download .csv file
export function csvlinkDownload(csvLink, csvFileName) {
    //debugger;
    let url = baseURL + csvLink;
    let a = document.createElement('a');
    a.href = url;
    a.download = csvFileName || '';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}
export function csvlinkDownloadWithoutBaseUrl(csvLink, csvFileName) {
    let url = csvLink;
    let a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = csvFileName || '';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}
export function downloadCSVcommasFile(data, filename = 'csvfile') {
    let csvContent;
    if (Array.isArray(data)) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((obj) => Object.values(obj).join(','));
        csvContent = [headers, ...rows].join('\n');
    } else {
        csvContent = data;
    }
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', filename + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
export function downloadCSVcommasFileLangSupport(data, filename = 'csvfile') {
    let csvContent;
    if (Array.isArray(data)) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map((obj) => Object.values(obj).join(','));
        csvContent = [headers, ...rows].join('\n');
    } else {
        csvContent = data;
    }

    // Parse CSV and convert to tab-delimited format for UTF-16 LE Excel compatibility
    // This must handle multi-line fields (newlines within quoted fields)
    const convertToTabDelimited = (csv) => {
        let result = '';
        let insideQuotes = false;

        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];
            const nextChar = csv[i + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    // Escaped quote - keep both
                    result += '""';
                    i++;
                } else {
                    // Toggle quote state
                    insideQuotes = !insideQuotes;
                    result += char;
                }
            } else if (char === ',' && !insideQuotes) {
                // Delimiter comma outside quotes - replace with tab
                result += '\t';
            } else {
                // Everything else (including newlines inside quotes)
                result += char;
            }
        }

        return result;
    };

    csvContent = convertToTabDelimited(csvContent);

    // Use UTF-16 LE encoding for Excel Unicode compatibility (Hindi, Tamil, etc.)
    const BOM = new Uint8Array([0xff, 0xfe]); // UTF-16 LE BOM

    // Convert string to UTF-16 LE encoding
    const utf16leArray = [];
    for (let i = 0; i < csvContent.length; i++) {
        const charCode = csvContent.charCodeAt(i);
        // Little Endian: low byte first, then high byte
        utf16leArray.push(charCode & 0xff);
        utf16leArray.push((charCode >> 8) & 0xff);
    }

    const contentBytes = new Uint8Array(utf16leArray);

    // Combine BOM and content
    const fullContent = new Uint8Array(BOM.length + contentBytes.length);
    fullContent.set(BOM, 0);
    fullContent.set(contentBytes, BOM.length);

    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-16le;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
export function array_to_Object(arr, mapKey, mapValue = (i) => i) {
    return Object.fromEntries(arr.map((el, i, arr) => [mapKey(el, i, arr), mapValue(el, i, arr)]));
}

