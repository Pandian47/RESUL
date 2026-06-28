/**
 * Extracts the base64 payload from a FileReader data URL.
 * Handles application/json with or without charset, application/octet-stream, etc.
 * @param {string} value - Stored form value (data URL or raw base64)
 * @returns {string | null}
 */
export function extractBase64PayloadFromDataUrl(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed.startsWith('data:')) {
        return trimmed.length > 0 ? trimmed : null;
    }
    const marker = 'base64,';
    const idx = trimmed.indexOf(marker);
    if (idx === -1) {
        return null;
    }
    return trimmed.slice(idx + marker.length);
}

/**
 * Validates a Firebase service account JSON string (FCM / V1 HTTP flows).
 * @param {string} jsonContent - Raw file text
 * @returns {{ valid: true, data: object } | { valid: false, error: string }}
 */
export function validateFirebaseServiceAccountJson(jsonContent) {
    try {
        const parsed = JSON.parse(jsonContent);

        const requiredFields = [
            'type',
            'project_id',
            'private_key_id',
            'private_key',
            'client_email',
            'client_id',
            'auth_uri',
            'token_uri',
            'auth_provider_x509_cert_url',
            'client_x509_cert_url',
        ];

        const missingFields = requiredFields.filter((field) => !parsed[field]);

        if (missingFields.length > 0) {
            return {
                valid: false,
                error: `Invalid Firebase service account JSON. Missing fields: ${missingFields.join(', ')}`,
            };
        }

        if (parsed.type !== 'service_account') {
            return {
                valid: false,
                error: 'Invalid Firebase service account JSON. Type must be "service_account"',
            };
        }

        return {
            valid: true,
            data: parsed,
        };
    } catch {
        return {
            valid: false,
            error: 'Invalid JSON format. Please upload a valid Firebase service account JSON file.',
        };
    }
}
