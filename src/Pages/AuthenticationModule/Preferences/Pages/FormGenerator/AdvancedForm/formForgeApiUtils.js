const SKIP_FIELD_TYPES = new Set(['system_field', 'captcha', 'section', 'html_block']);

/** Map API response to field details (supports legacy `fields` labels-only responses). */
export const normalizeFieldDetails = (apiData = {}) => {
    const rawDetails =
        apiData.fieldDetails || apiData.field_details || apiData.FieldDetails || [];
    if (rawDetails.length) {
        return rawDetails
            .map((field) => ({
                field_key: field.field_key || field.fieldKey,
                label: field.label,
                field_type: field.field_type || field.fieldType,
            }))
            .filter((field) => field.field_key && field.label);
    }

    const fields = apiData.fields || [];
    return fields
        .map((field) => {
            if (field && typeof field === 'object') {
                const fieldKey = field.field_key || field.fieldKey;
                const label = field.label;
                if (!fieldKey || !label) return null;
                return {
                    field_key: fieldKey,
                    label,
                    field_type: field.field_type || field.fieldType,
                };
            }
            return null;
        })
        .filter(Boolean);
};

export const parseFormForgeUrls = (publishedUrl) => {
    const fallback = { tenantSlug: 'default', apiBaseUrl: 'https://fmb.resul.team/api/v1' };
    if (!publishedUrl || typeof publishedUrl !== 'string') return fallback;

    try {
        const url = new URL(publishedUrl.trim());
        const parts = url.pathname.split('/').filter(Boolean);
        const tenantSlug = parts[0] === 'f' && parts[1] ? parts[1] : 'default';
        return {
            tenantSlug,
            apiBaseUrl: `${url.origin}/api/v1`,
        };
    } catch {
        return fallback;
    }
};

export const getSubmittableFields = (fieldDetails = []) =>
    (fieldDetails || []).filter(
        (field) =>
            field?.field_key &&
            field?.label &&
            !SKIP_FIELD_TYPES.has(field?.field_type),
    );

const getApiFieldName = (field) => String(field?.label || field?.field_key || '').trim();

/** Classic-style GET URL (same layout as formapi IndexInsertAPI). */
export const buildApiRequestText = ({
    formId,
    tenantSlug,
    apiBaseUrl,
    fieldDetails,
    notifyStatus = false,
}) => {
    const params = new URLSearchParams();
    getSubmittableFields(fieldDetails).forEach((field) => {
        params.append(getApiFieldName(field), 'value');
    });
    params.set('formId', String(formId));
    params.set('tenant_slug', tenantSlug);
    params.set('SourceURL', 'Value');
    params.set('pagereferrerurl', 'Value');
    params.set('rid', 'Value');
    params.set('cid', 'Value');
    params.set('pagetitle', 'Value');
    params.set('notifyStatus', String(notifyStatus));
    return `${apiBaseUrl}/forms/${formId}/submissions/insert?${params.toString()}`;
};
