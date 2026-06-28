
export const formatLabel = (key = '') =>
    key
        .replace(/_/g, ' ') // "_" → space
        .toLowerCase() // normalize
        .replace(/\b\w/g, (c) => c.toUpperCase());
export const RenderVendors = (provider) => {
    const { country = [], credentials = [] } = provider?.configuration || {};

    const fields = [];
    credentials.forEach((cred) => {
        const key = cred.key;
        const label = formatLabel(key) || '';
        fields.push({
            name: key,
            type: label?.toLowerCase().includes('password') ? 'password' : 'text',
            placeHolder: !key?.includes('_') ?  formatFieldToTitle(key) : formatLabel(key),
            value: '',
            required: `Enter ${label?.toLocaleLowerCase()}`,
            viewEye: label?.toLowerCase().includes('password'),
        });
    });
    if (country.length > 0) {
        fields.push({
            name: 'countryCode',
            type: 'dropdown',
            placeHolder: 'Select Country',
            value: '',
            required: 'Country is required',
            options: country.map((c) => ({
                label: c.countryName,
                value: c.countryCode,
            })),
        });
    }
    return { fields };
};
