export const getFileToBase64 = (file, success, failure, isRaw = false) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (reader.result) {
            const result = isRaw ? reader.result : reader.result.replace(/^data:image\/[a-z]+;base64,/, '');
            success(result);
        } else {
            failure('Problem with converting file to base64');
        }
    };
    reader.onerror = (error) => {
        failure(error);
    };
};

/** Safely decodes a base64 string; returns the original value when input is empty or invalid. */
export function decodeBase64(value) {
    if (value == null || value === '') return '';
    try {
        return atob(value);
    } catch {
        return value;
    }
}
