import { SELECT_PROPER_VALUES } from 'Constants/GlobalConstant/ValidationMessage';
import { settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSTagsComponent from 'Components/RSTagsComponent';
import RSModal from 'Components/RSModal';
import RSTooltip from 'Components/RSTooltip';
import SpinnerLoader from 'Components/Skeleton/Components/common/SpinnerLoader';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getGeoFencesLists as getGeoFencesListsFromCS, getGeoFenceDetailsById } from 'Reducers/preferences/CommunicationSettings/Geofencing/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { ACTION_DATA } from './contant';
import { parseRuleJSON } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { buildFieldTriggerValuesKey } from '../../constant';

import { DynamicListCreateContext } from '../..';

const geoFencesSessionCache = new Map();
const geoFencesInFlightRequests = new Map();

const isActiveGeoFence = (item) => {
    const status = item?.statusID ?? item?.statusId;
    if (status == null || status === '') {
        return true;
    }
    return Number(status) === 1;
};

export const resolveSelectedPageId = (pages) => {
    if (!pages) {
        return '';
    }
    if (typeof pages === 'string' || typeof pages === 'number') {
        return String(pages);
    }
    return String(
        pages?.id ??
            pages?.appId ??
            pages?.AppId ??
            pages?.appID ??
            pages?.recipientFormId ??
            '',
    );
};

export const resolveSelectedPageName = (pages) => {
    if (!pages || typeof pages !== 'object') {
        return '';
    }
    return String(pages?.value ?? pages?.appName ?? pages?.name ?? '').trim();
};

export const normalizeGeoFenceListItem = (item, index = 0) => {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const firstApp = Array.isArray(item.apps) ? item.apps[0] : null;
    const geoFenceId =
        item.geoFenceId ??
        item.geofenceId ??
        item.GeofenceId ??
        firstApp?.geoFenceId ??
        firstApp?.geofenceId ??
        (typeof item.id === 'number' ? item.id : null) ??
        index + 1;

    return {
        ...item,
        geoFenceId,
        identifier:
            item.identifier ??
            item.name ??
            item.clusterName ??
            item.Identifier ??
            firstApp?.identifier ??
            firstApp?.appName ??
            `Cluster ${geoFenceId}`,
        statusID: item.statusID ?? item.statusId,
        apps:
            item.apps ??
            (item.appId
                ? [
                      {
                          appId: item.appId,
                          appName: item.appName,
                          geoFenceId,
                      },
                  ]
                : []),
    };
};

export const normalizeGeoFencesList = (list) => {
    if (!Array.isArray(list)) {
        return [];
    }

    const seenIds = new Set();
    return list
        .map((item, index) => normalizeGeoFenceListItem(item, index))
        .filter(Boolean)
        .map((item, index) => {
            let geoFenceId = item.geoFenceId;
            if (geoFenceId == null || geoFenceId === '') {
                geoFenceId = index + 1;
            }
            const idKey = String(geoFenceId);
            if (seenIds.has(idKey)) {
                geoFenceId = `${idKey}-${index}`;
            }
            seenIds.add(String(geoFenceId));
            return geoFenceId === item.geoFenceId ? item : { ...item, geoFenceId };
        });
};

export const extractGeoFencesList = (response) => {
    if (!response) {
        return [];
    }
    if (Array.isArray(response)) {
        return normalizeGeoFencesList(response);
    }

    const status = response?.status ?? response?.data?.status;
    if (status === false) {
        return [];
    }

    const payload = response?.data;
    if (Array.isArray(payload)) {
        return normalizeGeoFencesList(payload);
    }
    if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.data)) {
            return normalizeGeoFencesList(payload.data);
        }
        if (Array.isArray(payload.list)) {
            return normalizeGeoFencesList(payload.list);
        }
        if (Array.isArray(payload.geoFencesList)) {
            return normalizeGeoFencesList(payload.geoFencesList);
        }
        if (Array.isArray(payload.items)) {
            return normalizeGeoFencesList(payload.items);
        }
    }
    return [];
};

export const loadGeoFencesFullList = async (dispatch, { departmentId, clientId, userId } = {}) => {
    const sessionKey = `${clientId ?? ''}-${departmentId ?? ''}-${userId ?? ''}`;

    if (geoFencesSessionCache.has(sessionKey)) {
        return geoFencesSessionCache.get(sessionKey);
    }

    if (geoFencesInFlightRequests.has(sessionKey)) {
        return geoFencesInFlightRequests.get(sessionKey);
    }

    const requestPromise = (async () => {
        try {
            const response = await dispatch(
                getGeoFencesListsFromCS({ departmentId, clientId, userId, skip: 0, take: 500 }),
            );
            const extracted = extractGeoFencesList(response);
            const result = extracted.length ? extracted : [];
            geoFencesSessionCache.set(sessionKey, result);
            return result;
        } catch {
            return [];
        } finally {
            geoFencesInFlightRequests.delete(sessionKey);
        }
    })();

    geoFencesInFlightRequests.set(sessionKey, requestPromise);
    return requestPromise;
};

export const clearGeoFencesListSessionCache = () => {
    geoFencesSessionCache.clear();
    geoFencesInFlightRequests.clear();
};

export const matchesGeoFenceId = (left, right) => String(left ?? '') === String(right ?? '');

export const buildGeofenceComparisonFromEditRule = (ruleAttribute, clusterList = []) => {
    const geofenceId = ruleAttribute?.GeofenceId;
    if (!geofenceId) {
        return null;
    }

    const matchedCluster = clusterList.find((item) => matchesGeoFenceId(item?.geoFenceId, geofenceId));
    const cluster = Array.isArray(ruleAttribute?.AttributeValue) ? ruleAttribute.AttributeValue : [];

    return {
        ...(matchedCluster ?? {}),
        geoFenceId: matchedCluster?.geoFenceId ?? geofenceId,
        identifier: matchedCluster?.identifier ?? ruleAttribute?.AttributeName ?? '',
        cluster,
    };
};

export const filterGeoFencesByPage = (fullList, pages) => {
    const normalizedList = normalizeGeoFencesList(fullList);
    if (!normalizedList.length) {
        return [];
    }

    const activeList = normalizedList.filter(isActiveGeoFence);
    const pagesId = resolveSelectedPageId(pages);
    const pagesName = resolveSelectedPageName(pages);

    if (!pagesId && !pagesName) {
        return activeList;
    }

    const matchesPageId = (item) => {
        if (!pagesId) {
            return false;
        }
        if (item?.apps?.length > 0) {
            return item.apps.some((app) => String(app?.appId ?? app?.id ?? '') === pagesId);
        }
        return [item?.appId, item?.id, item?.AppId].some((candidate) => String(candidate ?? '') === pagesId);
    };

    const matchesPageName = (item) => {
        if (!pagesName) {
            return false;
        }
        const normalizedName = pagesName.toLowerCase();
        if (item?.apps?.length > 0) {
            return item.apps.some(
                (app) => String(app?.appName ?? app?.value ?? '').trim().toLowerCase() === normalizedName,
            );
        }
        return String(item?.appName ?? item?.value ?? '').trim().toLowerCase() === normalizedName;
    };

    const filtered = activeList.filter((item) => matchesPageId(item) || matchesPageName(item));
    return filtered.length ? filtered : activeList;
};

const findGeofenceAttrFromEditList = (editList, currentRuleIndex, index, attribute) => {
    if (!editList?.dynamiclist?.length) {
        return null;
    }
    const ruleGroupIndex = currentRuleIndex !== undefined ? currentRuleIndex : 0;
    const ruleGroupKey = `RuleGroup${ruleGroupIndex + 1}`;

    const currentItem = editList.dynamiclist.find((item) => item?.ruleJSON) ?? editList.dynamiclist[0];
    if (!currentItem?.ruleJSON) {
        return null;
    }
    const parsed = parseRuleJSON(currentItem.ruleJSON, {});
    const ruleAttributes = parsed?.[ruleGroupKey]?.RuleAttributes;
    if (!ruleAttributes?.length) {
        return null;
    }

    let currentAttr = null;
    if (index >= 0 && index < ruleAttributes.length) {
        currentAttr = ruleAttributes[index];
        if (
            currentAttr &&
            currentAttr?.AttributeName !== 'Geofence' &&
            !currentAttr?.GeofenceId &&
            attribute?.attributeName?.value
        ) {
            currentAttr = ruleAttributes.find((attr) => attr?.AttributeName === attribute.attributeName.value);
        }
    } else if (attribute?.attributeName?.value) {
        currentAttr = ruleAttributes.find((attr) => attr?.AttributeName === attribute.attributeName.value);
    }
    if (!currentAttr?.GeofenceId) {
        currentAttr = ruleAttributes.find((attr) => attr?.GeofenceId !== undefined && attr?.GeofenceId > 0);
    }
    if (!currentAttr?.GeofenceId || currentAttr.GeofenceId <= 0) {
        return null;
    }
    return currentAttr;
};

const DynamicListGeoFencing = ({
    attribute,
    className,
    index,
    name,
    pages,
    setDuplicateRule,
    handleDuplicateCheck,
    checkValidCondition,
    currentRuleIndex,
}) => {
    const { control, setValue, watch, getValues } = useFormContext();
    const dispatch = useDispatch();
    const { ListState } = useContext(DynamicListCreateContext);
    const geofenceListFromStore = useSelector((state) => state.geofenceReducer?.list);
    const [showRegionsModal, setShowRegionsModal] = useState(false);
    const [tempRegions, setTempRegions] = useState([]);
    const clusterDetailsAPI = useApiLoader({
        autoFetch: false,
        mode: 'create',
        loaderConfig: fieldLoaderConfig,
    });
    const isClusterDetailsLoading = clusterDetailsAPI.isLoading;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const pagesId = resolveSelectedPageId(pages);
    const pagesName = resolveSelectedPageName(pages);
    const attributeLabel = attribute?.attributeName?.value ?? 'Geofence';
    const geofenceFieldKey = buildFieldTriggerValuesKey(name, '2D', 1);
    const fieldTriggerState = ListState?.fieldTriggerValues?.[geofenceFieldKey];
    const isClusterListLoading = fieldTriggerState?.isLoading ?? false;
    const geofenceListFromField =
        fieldTriggerState?.triggerValues?.[attributeLabel] ??
        fieldTriggerState?.triggerValues?.Geofence;

    const clusterList = useMemo(() => {
        const fullList =
        geofenceListFromField ??
        (Array.isArray(geofenceListFromStore) ? geofenceListFromStore : null);
        const pageFilter =
        pagesId || pagesName ? { id: pagesId, appId: pagesId, value: pagesName } : pages;
        return filterGeoFencesByPage(fullList, pageFilter).filter(
            (item) => item?.geoFenceId != null && item?.geoFenceId !== '',
        );
    }, [geofenceListFromField, geofenceListFromStore, pagesId, pagesName]);

    const attributeComparisonValue = watch(`${name}.attributeComparison`);

    const regions = useMemo(() => {
        if (!attributeComparisonValue || typeof attributeComparisonValue !== 'object') {
            return [];
        }
        return Array.isArray(attributeComparisonValue.cluster) ? attributeComparisonValue.cluster : [];
    }, [attributeComparisonValue]);

    const clearClusterSelection = useCallback(() => {
        setValue(`${name}.attributeComparison`, '', { shouldDirty: false });
        setValue(`${name}.attributeValue`, []);
    }, [name, setValue]);

    const resetClusterIfNotInList = useCallback(() => {
        if (!clusterList.length) {
            return;
        }
        const currentComparison = getValues(`${name}.attributeComparison`);
        if (!currentComparison || typeof currentComparison !== 'object') {
            return;
        }
        const currentKey = currentComparison?.geoFenceId;
        if (currentKey == null || currentKey === '') {
            return;
        }
        const isInList = clusterList.some((item) => matchesGeoFenceId(item?.geoFenceId, currentKey));
        if (!isInList) {
            clearClusterSelection();
        }
    }, [clearClusterSelection, clusterList, getValues, name]);

  

    const handleClusterChange = async (e) => {
        const selectedValue = e?.value ?? e?.target?.value;
        const selectedGeoFenceId = selectedValue?.geoFenceId || selectedValue;

        if (!selectedValue || selectedValue === '' || !selectedGeoFenceId) {
            clearClusterSelection();
            setDuplicateRule({
                show: false,
                index: 0,
            });
            return;
        }

        const isInList = clusterList.some((item) => matchesGeoFenceId(item?.geoFenceId, selectedGeoFenceId));
        if (!isInList) {
            clearClusterSelection();
            setDuplicateRule({
                show: false,
                index: 0,
            });
            return;
        }

        setValue(`${name}.attributeComparison`, selectedValue);
        setValue(`${name}.attributeValue`, []);

        const response = await clusterDetailsAPI.refetch({
            fetcher: () =>
                dispatch(
                    getGeoFenceDetailsById({
                        geoFenceId: selectedGeoFenceId,
                        departmentId,
                        clientId,
                        userId,
                    }),
                ),
            mode: 'create',
            loaderConfig: fieldLoaderConfig,
            params: { geoFenceId: selectedGeoFenceId },
        });

        if (response?.status) {
            const clusterData = response?.data?.data?.cluster || response?.data?.cluster || [];
            setValue(`${name}.attributeComparison`, {
                ...selectedValue,
                cluster: clusterData,
            });
        } else {
            setValue(`${name}.attributeComparison`, {
                ...selectedValue,
                cluster: [],
            });
        }

        setDuplicateRule({
            show: false,
            index: 0,
        });
    };

    const handleActionChange = () => {
        const currentValue = getValues(`${name}.attributeValue`);
        if (currentValue === '' || currentValue == null) {
            setValue(`${name}.attributeValue`, []);
        }
        setDuplicateRule({
            index: 0,
            show: false,
        });
    };

    const handleRemoveRegion = (removedTag) => {
        if (tempRegions.length <= 1) {
            return;
        }
        const removedTagName = typeof removedTag === 'object' ? removedTag.placeName : removedTag;
        const updatedRegions = tempRegions.filter((region) => region.placeName !== removedTagName);
        setTempRegions(updatedRegions);
    };

    const handleUpdateTags = (updatedTags) => {
        const updatedTagNames = updatedTags.map((tag) => (typeof tag === 'object' ? tag.placeName : tag));
        const existingRegions = tempRegions.filter((region) => updatedTagNames.includes(region.placeName));
        const existingPlaceNames = tempRegions.map((region) => region.placeName);
        const newTagNames = updatedTagNames.filter((tagName) => !existingPlaceNames.includes(tagName));
        const newRegions = newTagNames.map((tagName) => ({
            placeName: tagName,
        }));
        setTempRegions([...existingRegions, ...newRegions]);
    };

    const handleOpenModal = () => {
        setTempRegions([...regions]);
        setShowRegionsModal(true);
    };

    const handleSaveRegions = () => {
        const currentComparison = watch(`${name}.attributeComparison`);
        if (currentComparison) {
            setValue(`${name}.attributeComparison`, {
                ...currentComparison,
                cluster: tempRegions,
            });
        }
        setShowRegionsModal(false);
    };

    const handleCloseModal = () => {
        setShowRegionsModal(false);
        setTempRegions([]);
    };

    return (
        <>
            <Row className={className}>
                <Col sm={6}>
                    <RSKendoDropDown
                        control={control}
                        name={`${name}.attributeComparison`}
                        handleChange={handleClusterChange}
                        label="Cluster list"
                        isLoading={isClusterListLoading}
                        data={clusterList}
                        textField="identifier"
                        dataItemKey="geoFenceId"
                        required={checkValidCondition()}
                        rules={
                            checkValidCondition()
                                ? {
                                      required: SELECT_PROPER_VALUES,
                                  }
                                : {}
                        }
                        handleOnBlur={() => {
                            resetClusterIfNotInList();
                            handleDuplicateCheck && handleDuplicateCheck();
                        }}
                    />
                </Col>
                {(regions.length > 0 || isClusterDetailsLoading) && (
                    <Col sm={1} className="pl0">
                        <div className="position-relative top6">
                            {isClusterDetailsLoading ? (
                                <SpinnerLoader className="float-start" />
                            ) : (
                                <RSTooltip position="top" text="Settings" className="lh0 d-inline-block">
                                    <i
                                        className={`${settings_medium} icon-md color-primary-blue cp`}
                                        onClick={handleOpenModal}
                                    />
                                </RSTooltip>
                            )}
                        </div>
                    </Col>
                )}
                <Col sm={5}>
                    <RSMultiSelect
                        control={control}
                        name={`${name}.attributeValue`}
                        label="Action"
                        data={ACTION_DATA}
                        textField="value"
                        dataItemKey="value"
                        required={checkValidCondition()}
                        rules={
                            checkValidCondition()
                                ? {
                                      required: SELECT_PROPER_VALUES,
                                  }
                                : {}
                        }
                        handleChange={handleActionChange}
                        handleOnBlur={() => {
                            handleDuplicateCheck && handleDuplicateCheck();
                        }}
                    />
                </Col>
            </Row>
            <RSModal
                show={showRegionsModal}
                handleClose={handleCloseModal}
                header="Region Settings"
                size="md"
                body={
                    <div>
                        <RSTagsComponent
                            tags={tempRegions.map((region) => ({
                                placeName: region.placeName,
                                disabled: tempRegions.length === 1,
                            }))}
                            updatedTags={handleUpdateTags}
                            removedTags={handleRemoveRegion}
                            disabled={false}
                            placeholder=""
                            isRefresh={false}
                            isObject={true}
                            fieldItemKey="placeName"
                            preventSingleTagDeletion={true}
                        />
                        <small className="mt5">Minimum 1 region required</small>
                    </div>
                }
                footer={
                    <>
                        <RSSecondaryButton onClick={handleCloseModal}>Cancel</RSSecondaryButton>
                        <RSPrimaryButton onClick={handleSaveRegions}>Save</RSPrimaryButton>
                    </>
                }
            />
        </>
    );
};

export default memo(DynamicListGeoFencing);
