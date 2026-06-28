import _orderBy from 'lodash/orderBy';
import {
    EMPTY_LISTING_FILTER_OPTIONS,
    normalizeListingFilterOptions,
    parseListingJsonArray,
} from './communicationListingDefaults';

import {
    fetchAllRequest,
    getCommunicationAttributes,
    getCommunicationProducts,
} from 'Reducers/communication/createCommunication/plan/request';
import {
    commListingUserList,
    getSearchDropdownDataCommunicationTags,
} from 'Reducers/communication/listing/request';
import { getAnalyticsQueryOptions } from 'Reducers/analytics/communicationAnalytics/request';

/** Per client/user/department: reuse tags + user-list responses across List / Gallery / Analytics. */
const listingAuxCache = new Map();

function scopeKey(scope) {
    return `${Number(scope.clientId)}\0${Number(scope.userId)}\0${Number(scope.departmentId)}`;
}

function getAuxSlot(scope) {
    const k = scopeKey(scope);
    if (!listingAuxCache.has(k)) {
        listingAuxCache.set(k, {});
    }
    return listingAuxCache.get(k);
}

export function matchesPlanDropdownScope(fetchedFor, scope) {
    if (!fetchedFor || !scope) return false;
    return (
        Number(fetchedFor.clientId) === Number(scope.clientId) &&
        Number(fetchedFor.userId) === Number(scope.userId) &&
        Number(fetchedFor.departmentId) === Number(scope.departmentId)
    );
}

/** Reuse communication type + product dropdowns in Redux; skips duplicate API calls per scope. */
export async function ensureCommunicationPlanDropdowns(dispatch, getState, scope) {
    const state = typeof getState === 'function' ? getState() : getState;
    const { communicationOptions = {}, planDropdownsFetchedFor } = state?.communicationPlanReducer || {};
    const attrs = communicationOptions.attributes;
    const products = communicationOptions.product;

    if (
        matchesPlanDropdownScope(planDropdownsFetchedFor, scope) &&
        Array.isArray(attrs) &&
        attrs.length > 0 &&
        Array.isArray(products) &&
        products.length > 0
    ) {
        return { cached: true, communication: { status: true, data: attrs }, productType: { status: true, data: products } };
    }

    const [communication, productType] = await Promise.all([
        dispatch(getCommunicationAttributes({ payload: scope, loading: false })),
        dispatch(getCommunicationProducts({ payload: scope, isLoading: false })),
    ]);

    if (communication?.status && productType?.status) {
        await dispatch(
            fetchAllRequest([Promise.resolve(productType), Promise.resolve(communication)], scope),
        );
    }

    return { cached: false, communication, productType };
}

/**
 * Loads (or reuses) communication type, product type, tags, and created-by user list for advance search.
 * Skips attribute + product requests when Redux already holds them for this scope (same as plan `fetchAllRequest`).
 * Tags and users are cached in memory per scope so tab switches (List ↔ Gallery) do not refetch.
 */
export async function fetchCommunicationListingFilterOptionResponses(dispatch, scope, planState) {
    const { communicationOptions = {}, planDropdownsFetchedFor } = planState || {};
    const attrs = communicationOptions.attributes;
    const products = communicationOptions.product;

    let communication;
    let productType;

    if (
        matchesPlanDropdownScope(planDropdownsFetchedFor, scope) &&
        Array.isArray(attrs) &&
        attrs.length > 0 &&
        Array.isArray(products) &&
        products.length > 0
    ) {
        communication = { status: true, data: attrs };
        productType = { status: true, data: products };
    } else {
        [communication, productType] = await Promise.all([
            dispatch(getCommunicationAttributes({ payload: scope, loading: false })),
            dispatch(getCommunicationProducts({ payload: scope, isLoading: false })),
        ]);
        if (communication?.status && productType?.status) {
            await dispatch(
                fetchAllRequest(
                    [Promise.resolve(productType), Promise.resolve(communication)],
                    scope,
                ),
            );
        }
    }

    const slot = getAuxSlot(scope);

    const tagProm =
        slot.tagsResponse !== undefined
            ? Promise.resolve(slot.tagsResponse)
            : dispatch(
                  getSearchDropdownDataCommunicationTags({ payload: scope, loading: false }),
              ).then((r) => {
                  if (r?.status) {
                      slot.tagsResponse = r;
                  }
                  return r;
              });

    const userProm =
        slot.usersResponse !== undefined
            ? Promise.resolve(slot.usersResponse)
            : dispatch(commListingUserList({ payload: scope, loading: false })).then((r) => {
                  if (r?.status) {
                      slot.usersResponse = r;
                  }
                  return r;
              });

    const [tags, users] = await Promise.all([tagProm, userProm]);

    return { communication, productType, tags, users };
}

export function mapFilterResponsesToOptionsState(
    { communication, productType, tags, users },
    { dedupeUsers = false } = {},
) {
    const temp = { ...EMPTY_LISTING_FILTER_OPTIONS };
    if (communication?.status) {
        const attrs = Array.isArray(communication?.data) ? communication.data : [];
        temp.communicationType = _orderBy(attrs, 'attributename', 'asc');
    }
    if (productType?.status) {
        temp.productType = Array.isArray(productType?.data) ? productType.data : [];
    }
    if (tags?.status) {
        const tagRows = parseListingJsonArray(tags?.data, []);
        temp.tags = _orderBy(tagRows, 'tags', 'asc');
    }
    if (users?.status) {
        const userRows = Array.isArray(users?.data) ? users.data : [];
        const ordered = _orderBy(userRows, 'firstName', 'asc');
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
    return normalizeListingFilterOptions(temp);
}

export async function fetchAnalyticsAdvanceFilterOptions(dispatch, scope) {
    const slot = getAuxSlot(scope);
    const userProm =
        slot.usersResponse !== undefined
            ? Promise.resolve(slot.usersResponse)
            : dispatch(commListingUserList({ payload: scope, loading: false })).then((r) => {
                  if (r?.status) {
                      slot.usersResponse = r;
                  }
                  return r;
              });

    const [analyticsApiBody, users] = await Promise.all([
        dispatch(getAnalyticsQueryOptions({ payload: scope, loading: false })),
        userProm,
    ]);

    return { analyticsApiBody, users };
}
