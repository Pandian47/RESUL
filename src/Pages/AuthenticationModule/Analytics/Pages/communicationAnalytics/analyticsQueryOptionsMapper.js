import _orderBy from 'lodash/orderBy';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import {
    EMPTY_ANALYTICS_FILTER_OPTIONS,
    normalizeAnalyticsFilterOptions,
} from '../../analyticsDefaults';

/**
 * Maps `GetAnalyticsQueryOptions` response + user list into advance-search `filterOptions` shape.
 * Lives under Analytics only — Communication List / Gallery keep their own tag loading path.
 */
export function mapAnalyticsQueryOptionsResponseToOptionsState(
    analyticsApiBody,
    users,
    { dedupeUsers = false } = {},
) {
    const temp = { ...EMPTY_ANALYTICS_FILTER_OPTIONS };
    if (analyticsApiBody?.status && analyticsApiBody?.data) {
        const dRoot = analyticsApiBody.data;
        const d = dRoot?.data && typeof dRoot.data === 'object' ? dRoot.data : dRoot;
        const attributeNames = d?.attributeNames ?? d?.attributenames ?? d?.attributes ?? [];
        const productTypes = d?.productTypes ?? d?.producttypes ?? d?.productType ?? [];
        const tagsRaw = d?.tags ?? d?.tagNames ?? d?.tagnames ?? [];

        temp.communicationType = _orderBy(Array.isArray(attributeNames) ? attributeNames : [], 'attributename', 'asc');
        temp.productType = Array.isArray(productTypes) ? productTypes : [];

        let tagsList = [];
        if (Array.isArray(tagsRaw)) {
            tagsList = tagsRaw;
        } else if (typeof tagsRaw === 'string') {
            const s = tagsRaw.trim();
            if (s) {
                const parsed = safeParseJSON(s, null);
                tagsList = Array.isArray(parsed)
                    ? parsed
                    : s.includes(',')
                      ? s.split(',').map((v) => v.trim()).filter(Boolean)
                      : [s];
            }
        }

        if (tagsList.length > 0) {
            temp.tags = _orderBy(
                tagsList.map((t) =>
                    typeof t === 'string' ? { tags: t } : t && typeof t === 'object' ? t : { tags: String(t ?? '') },
                ),
                'tags',
                'asc',
            );
        }
    }
    if (users?.status) {
        const ordered = _orderBy(users?.data || [], 'firstName', 'asc');
        if (dedupeUsers) {
            const seenUserIds = new Set();
            temp.users = ordered.filter((u) => {
                const id = u?.userId;
                if (id === '' || id == null) return true;
                const key = String(id);
                if (seenUserIds.has(key)) return false;
                seenUserIds.add(key);
                return true;
            });
        } else {
            temp.users = ordered;
        }
    }
    return normalizeAnalyticsFilterOptions(temp);
}
