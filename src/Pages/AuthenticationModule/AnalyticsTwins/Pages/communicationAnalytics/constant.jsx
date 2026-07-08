import { getChannelId } from 'Utils/modules/communicationChannels';
import { getCommunicationType } from 'Utils/modules/communicationStatus';
import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { get as _get } from 'Utils/modules/lodashReplacements';
import RSTooltip from 'Components/RSTooltip';

export function normalizeSummaryCommunicationTypeToIds(value, attributeRows = []) {
    if (value == null || value === '') return '';
    const s = String(value).trim();
    if (!s) return '';
    const compact = s.replace(/\s/g, '');
    if (/^-?\d+(,-?\d+)*$/.test(compact)) {
        return compact;
    }
    const rows = Array.isArray(attributeRows) ? attributeRows : [];
    const idKeys = ['campaignAttributeId', 'CampaignAttributeId', 'CampaignAttributeID', 'id', 'ID'];
    const nameOf = (row) =>
        String(_get(row, 'attributename', '') || _get(row, 'attributeName', '') || _get(row, 'AttributeName', ''))
            .trim()
            .toLowerCase();
    const numericIdOf = (row) => {
        for (const k of idKeys) {
            const v = _get(row, k);
            const t = v !== undefined && v !== null && v !== '' ? String(v).trim() : '';
            if (t && /^-?\d+$/.test(t) && t !== '0') {
                return t;
            }
        }
        return '';
    };
    const parts = [];
    for (const segment of s.split(',')) {
        const nm = segment.trim();
        if (!nm) continue;
        const low = nm.toLowerCase();
        const row = rows.find((r) => nameOf(r) === low);
        let id = row ? numericIdOf(row) : '';
        if (!id) {
            const utilId = getCommunicationType(low, { communicationType: rows });
            const cand = utilId !== undefined && utilId !== null && utilId !== 0 ? String(utilId).trim() : '';
            if (cand && /^-?\d+$/.test(cand) && cand !== '0') {
                id = cand;
            }
        }
        if (!id) {
            const utilId2 = getCommunicationType(low, { communicationType: [] });
            const cand2 = utilId2 !== undefined && utilId2 !== null && utilId2 !== 0 ? String(utilId2).trim() : '';
            if (cand2 && /^-?\d+$/.test(cand2) && cand2 !== '0') {
                id = cand2;
            }
        }
        if (id) parts.push(id);
    }
    return [...new Set(parts)].join(',');
}

export const SEARCH_CONFIG = (attributesData, productType) => [
    {
        type: 'input',
        label: 'Communication name',
        config: {
            name: 'communication_name',
        },
    },
    {
        type: 'dropdown',
        label: 'Delivery type',
        className: 'searchType',
        config: {
            name: 'delivery_type',
            data: ['All', 'Single dimension', 'Multi dimension', 'Event trigger'],
        },
    },
    {
        type: 'dropdown',
        label: 'Communication type',
        fieldKey: 'attributename',
        config: {
            name: 'communication_type',
            data: [{ attributename: 'All', campaignAttributeId: '0' }, ...attributesData],
            textField: 'attributename',
            dataItemKey: 'campaignAttributeId',
        },
    },
    {
        type: 'dropdown',
        label: 'Product type',
        fieldKey: 'categoryname',
        config: {
            name: 'product_type',
            data: productType,
            textField: 'categoryname',
            dataItemKey: 'categoryId',
        },
    },
    // {
    //     type: 'datepicker',
    //     label: 'Start Date',
    //     config: {
    //         name: 'start_date',
    //     },
    // },
    // {
    //     type: 'datepicker',
    //     label: 'End Date',
    //     config: {
    //         name: 'end_date',
    //     },
    // },
];

export const SEARCH_FORM_STATE = {
    communication_name: '',
    delivery_type: '',
    communication_type: '',
    product_type: '',
    status: '',
    channel_type: '',
    tags: '',
    start_date: '',
    end_date: '',
    created_by: '',
};

export const DROPDOWN_LIST = [
    {
        field: 'campaignName',
        title: 'Communication name',
        width: 190,
        filter: 'text',
        cell: ({ dataItem }) => {
            return (
                <td>
                    {dataItem?.campaignName?.length > 12 ? (
                        <RSTooltip className="truncate" text={dataItem?.campaignName} innerContent={false}>
                            {truncateTitle(dataItem?.campaignName, 12)}
                        </RSTooltip>
                    ) : (
                        dataItem?.campaignName
                    )}
                </td>
            );
        },
    },
    {
        field: 'campaignTypeValue',
        title: 'Delivery method',
        filter: 'text',
    },
    {
        field: '',
        title: 'Channel',
        cell: ({ dataItem }) => {
            const channelIds = Array.isArray(dataItem?.channelId) ? dataItem?.channelId : [dataItem?.channelId];

            return (
                <td className="d-flex gap-2">
                    {channelIds.map((id) => {
                        const channel = getChannelId(id);
                        return (
                            <div
                                key={id}
                                className="text-center border-0 social-icon pt3 cursor-default"
                                style={{ backgroundColor: `${channel?.color}` }}
                            >
                                <RSTooltip text={channel?.label} innerContent={false}>
                                    <i className={`${channel?.icon} icon-md white cursor-default`}></i>
                                </RSTooltip>
                            </div>
                        );
                    })}
                </td>
            );
        },
    },
    {
        field: 'totalSent',
        title: 'Total sent',
        filter: 'numeric',
        cell: ({ dataItem }) => {
            const value = dataItem?.totalSent;
            const hasValue = value !== null && value !== undefined;
            return hasValue ? <td className="text-end">{numberWithCommas(value)}</td> : <td className="text-end">-</td>;
        },
    },
    {
        field: 'deliveredCount',
        title: 'Delivered',
        filter: 'numeric',
        cell: ({ dataItem }) => {
            const value = dataItem?.deliveredCount;
            const hasValue = value !== null && value !== undefined;
            return hasValue ? <td className="text-end">{numberWithCommas(value)}</td> : <td className="text-end">-</td>;
        },
    },
    {
        field: 'reachCount',
        title: 'Reach',
        filter: 'numeric',
        cell: ({ dataItem }) => {
            const value = dataItem?.reachCount;
            const hasValue = value !== null && value !== undefined;
            return hasValue ? <td className="text-end">{numberWithCommas(value)}</td> : <td>-</td>;
        },
    },
    {
        field: 'engegementCount',
        title: 'Engagement',
        filter: 'numeric',
        cell: ({ dataItem }) => {
            const value = dataItem?.engegementCount;
            const hasValue = value !== null && value !== undefined;
            return hasValue ? <td className="text-end">{numberWithCommas(value)}</td> : <td className="text-end">-</td>;
        },
    },
    {
        field: 'conversionCount',
        title: 'Conversion',
        filter: 'numeric',
        cell: ({ dataItem }) => {
            const value = dataItem?.conversionCount;
            const hasValue = value !== null && value !== undefined;
            return hasValue ? <td className="text-end">{numberWithCommas(value)}</td> : <td className="text-end">-</td>;
        },
    },
];

export const handleDeliveryTypeId = (type) => {
    switch (type) {
        case 'All':
            return 0;
        case 'Single dimension':
            return 1;
        case 'Multi dimension':
            return 2;
        case 'Event trigger':
            return 3;
        default:
            return 0;
    }
};

export const COMMUNICATION_SUMMARY_REQUEST_KEYS = [
    'clientId',
    'userId',
    'departmentId',
    'deliveryMethod',
    'communicationType',
    'startDate',
    'endDate',
    'productType',
    'searchCommunicationName',
    'statusId',
    'tags',
    'channelType',
    'createdBy',
    'sortBy',
    'timezoneid',
    'pagination',
    'isGoldenCampaign',
];

export function pickCommunicationSummaryRequestPayload(p) {
    if (!p || typeof p !== 'object') return {};
    const out = {};
    for (const key of COMMUNICATION_SUMMARY_REQUEST_KEYS) {
        if (Object.prototype.hasOwnProperty.call(p, key)) {
            out[key] = p[key];
        }
    }
    delete out.productCategoryId;

    const toInt = (val) => {
        if (val === 0 || val === null || val === undefined || val === '') {
            return '';
        }
        const parsed = Number(val);
        return Number.isFinite(parsed) ? parsed : '';
    };

    const getDeliveryMethodId = (val) => {
        if (val === 0 || val === null || val === undefined || val === '') return '';
        const s = String(val).toLowerCase();
        if (s === '1' || s === 's' || s.includes('single')) return 1;
        if (s === '2' || s === 'm' || s.includes('multi')) return 2;
        if (s === '3' || s === 't' || s.includes('trigger') || s.includes('event')) return 3;
        return '';
    };

    out.deliveryMethod = getDeliveryMethodId(out.deliveryMethod);
    out.communicationType = toInt(out.communicationType);
    out.channelType = toInt(out.channelType);
    out.statusId = toInt(out.statusId);
    out.productType = toInt(out.productType);
    out.isGoldenCampaign = Boolean(out.isGoldenCampaign);

    return out;
}
