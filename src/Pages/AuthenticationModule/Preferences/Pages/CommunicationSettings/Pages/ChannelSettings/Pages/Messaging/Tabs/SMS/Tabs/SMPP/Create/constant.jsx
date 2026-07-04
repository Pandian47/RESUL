import { formatFieldToTitle } from 'Utils/modules/stringUtils';

export const formatLabel = (key = '') =>
  key
    .replace(/_/g, ' ')   // "_" → space
    .toLowerCase()        // normalize
    .replace(/^./, c => c.toUpperCase()); // capitalize first letter only
export const RenderVendors = (provider) => {
    const { country = [], credentials = [] } = provider?.configuration || {};

    const fields = [];
    credentials.forEach((cred) => {
        const key = cred.key;
        const label = formatLabel(key) || '';
        fields.push({
            name: key,
            type: label?.toLowerCase().includes('password') ? 'password' : 'text',
            placeHolder: !key?.includes('_') ?  formatFieldToTitle(key?.toLowerCase()) : formatLabel(key),
            value: '',
            required: `Enter ${label?.toLocaleLowerCase()}`,
            viewEye: label?.toLowerCase().includes('password'),
        });
    });
    return {
        fields,
        countryOptions: country.map((c) => ({
            label: c.countryName,
            value: c.countryCode,
        })),
    };
};
