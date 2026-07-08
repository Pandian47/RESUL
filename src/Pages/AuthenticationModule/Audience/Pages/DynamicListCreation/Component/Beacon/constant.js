import { getBeaconLists } from 'Reducers/preferences/CommunicationSettings/Beacons/request';

export const BEACON_ACTION_DATA = [{ value: 'In' }, { value: 'Out' }];

const beaconsSessionCache = new Map();
const beaconsInFlightRequests = new Map();

export const isActiveBeacon = (item) => {
    if (typeof item?.isActive === 'boolean') {
        return item.isActive;
    }
    const status = item?.statusID ?? item?.statusId;
    if (status == null || status === '') {
        return true;
    }
    return Number(status) === 1;
};

export const normalizeBeaconListItem = (item, index = 0) => {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const id = item.id ?? item.beaconId ?? index + 1;

    return {
        ...item,
        id,
        name: item.name ?? item.beaconName ?? `Beacon ${id}`,
    };
};

export const normalizeBeaconList = (list) => {
    if (!Array.isArray(list)) {
        return [];
    }

    const seenIds = new Set();
    return list
        .map((item, index) => normalizeBeaconListItem(item, index))
        .filter(Boolean)
        .filter(isActiveBeacon)
        .map((item, index) => {
            let id = item.id;
            const idKey = String(id);
            if (seenIds.has(idKey)) {
                id = `${idKey}-${index}`;
            }
            seenIds.add(String(id));
            return id === item.id ? item : { ...item, id };
        });
};

export const extractBeaconLists = (response) => {
    if (!response) {
        return [];
    }
    if (Array.isArray(response)) {
        return normalizeBeaconList(response);
    }

    const status = response?.status ?? response?.data?.status;
    if (status === false) {
        return [];
    }

    const payload = response?.data;
    if (Array.isArray(payload)) {
        return normalizeBeaconList(payload);
    }
    if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.beaconLists)) {
            return normalizeBeaconList(payload.beaconLists);
        }
        if (Array.isArray(payload.data)) {
            return normalizeBeaconList(payload.data);
        }
        if (Array.isArray(payload.list)) {
            return normalizeBeaconList(payload.list);
        }
        if (Array.isArray(payload.items)) {
            return normalizeBeaconList(payload.items);
        }
    }
    return [];
};

export const loadBeaconsFullList = async (dispatch, { departmentId } = {}) => {
    const sessionKey = String(departmentId ?? '');

    if (beaconsSessionCache.has(sessionKey)) {
        return beaconsSessionCache.get(sessionKey);
    }

    if (beaconsInFlightRequests.has(sessionKey)) {
        return beaconsInFlightRequests.get(sessionKey);
    }

    const requestPromise = (async () => {
        try {
            const response = await dispatch(
                getBeaconLists({
                    departmentId,
                    pagination: {
                        pageNo: 1,
                        recordLimit: 500,
                    },
                }),
            );
            const extracted = extractBeaconLists(response);
            const result = extracted.length
                ? extracted
                : dispatch((_, getState) => {
                      const reduxList = getState()?.beaconReducer?.list;
                      return normalizeBeaconList(Array.isArray(reduxList) ? reduxList : []);
                  });

            beaconsSessionCache.set(sessionKey, result);
            return result;
        } catch {
            return [];
        } finally {
            beaconsInFlightRequests.delete(sessionKey);
        }
    })();

    beaconsInFlightRequests.set(sessionKey, requestPromise);
    return requestPromise;
};

export const clearBeaconsListSessionCache = () => {
    beaconsSessionCache.clear();
    beaconsInFlightRequests.clear();
};

export const matchesBeaconId = (left, right) => String(left ?? '') === String(right ?? '');

export const buildBeaconFromEditRule = (ruleAttribute, beaconList = []) => {
    const beaconId = ruleAttribute?.BeaconId;
    if (!beaconId) {
        return null;
    }

    const matchedBeacon = beaconList.find((item) => matchesBeaconId(item?.id ?? item?.beaconId, beaconId));
    return (
        matchedBeacon || {
            id: beaconId,
            name: ruleAttribute?.AttributeName || '',
        }
    );
};

export const resolveInOutValue = (value) => {
    if (value == null || value === '') {
        return '';
    }
    if (typeof value === 'object') {
        return value?.value ?? '';
    }
    return String(value);
};
