import { cloneDeep as _cloneDeep, filter as _filter, get as _get, isEmpty as _isEmpty, map as _map } from 'Utils/modules/lodashReplacements';
import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';

import { circle_minus_fill_medium, circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ADD_SMART_LINK_POPUP, CANCEL, SAVE, SMART_LINK_POPUP } from 'Constants/GlobalConstant/Placeholders';
import { MAX_SMART_LINKS } from 'Constants/GlobalConstant/InputLimit';

import RSModal from 'Components/RSModal';
import SmartLinkProvider from './context';
import GenerateSmartLink from './Component/GenerateSmartLink';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';

import { FORM_INITIAL_STATE, isSmartLinkViewOnly } from './constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { getMobileApps, getSmartUrl } from 'Reducers/communication/createCommunication/smartlink/request';
import {
    getGeneratedFlag,
    getGeneratedLink,
    getMobileAppIdFromEditFlow,
    getSmartLinkFriendlyName,
    isSmartLinkCacheValid,
    smartlinkEdit,
} from 'Reducers/communication/createCommunication/smartlink/selectors';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import {
    deleteGeneratedSmartLink,
    showTabsSmartlink,
    updateEditFlow,
    updateMobileAppId,
    updateSmartLinkFriendlyName,
} from 'Reducers/communication/createCommunication/smartlink/reducer';
import useQueryParams from 'Hooks/useQueryParams';


import RSTabSlide from 'Components/RSTabSlide'
import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import SmartLinkModalSkeleton from 'Components/Skeleton/Components/SmartLinkModalSkeleton';
// import { DUPLICATE_VALUE } from 'Constants/GlobalConstant/ValidationMessage';


const EDITABLE_STATUS_IDS = [7, 54, 6];
const excludedChannelIds = [6, 16];

const getSmartLinkTabMeta = (index) => ({
    id: `smartLink${index + 1}`,
    text: '',
    text2: `Smart Link ${index + 1}`,
    friendlyName: '',
    ...(index !== MAX_SMART_LINKS - 1 ? { add: circle_plus_medium } : {}),
});

const SmartLink = ({ handleClose, show, statusId, openWithAddNewTab = false }) => {
    const dispatch = useDispatch();
    const store = useStore();
    const { pathname } = useLocation();
    const state = useQueryParams('/communication');
    const isViewOnly = isSmartLinkViewOnly(pathname);
    const { savedChannelStatusId, exisingLinks } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const campaignId = _get(state, 'campaignId', 0);
    const campaignType = _get(state, 'campaignType', 'S');
    const { canEditExistingSmartLink, canAddnewSmartLink } = useMemo(() => {
         let list = Array.isArray(savedChannelStatusId) ? savedChannelStatusId : [];
         list = list.filter(
            (item) => !excludedChannelIds.includes(Number(item?.channelId))
            );
         const fallback = statusIdCheck(statusId);
         if (list.length === 1) {
            const statusIdToCheck = list[0]?.statusId ?? statusId;
            const campDetails = {content: [{statusId: statusIdToCheck}], triggerPlayPauseStatus: list[0]?.triggerPlayPauseStatus}
            const canEdit = statusIdCheck(statusIdToCheck);
            const canAdd = statusIdCheck(statusIdToCheck, campaignType, campDetails);
            return { canEditExistingSmartLink: canEdit, canAddnewSmartLink: canAdd };
        }
        if (list.length > 1) {
            let canEdiExisting;
            let canAddNew;
            if(!fallback){
                canEdiExisting = list.every((s) => EDITABLE_STATUS_IDS.includes(Number(s?.statusId)));
                canAddNew = true //list.some((s) => EDITABLE_STATUS_IDS.includes(Number(s?.statusId)));
            }else{
                canEdiExisting = true
                canAddNew = true
            }
            return { canEditExistingSmartLink: canEdiExisting, canAddnewSmartLink: canAddNew };
        }
        
        return { canEditExistingSmartLink: fallback, canAddnewSmartLink: fallback };
    }, [savedChannelStatusId, statusId, show]);
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    
    const TAB_CONFIG = [
        {
            id: 'smartLink1',
            text2: 'Smart Link 1',
            text: '',
            friendlyName: '',
            component: () => (
                <GenerateSmartLink
                    key="smartLink1"
                    fieldName="smartLink1"
                    tab={TAB_CONFIG}
                    isEdit={false}
                    canEditExistingSmartLink={canEditExistingSmartLink}
                    canAddnewSmartLink={canAddnewSmartLink}
                />
            ),
            add: circle_plus_medium,
            isAdd: true,
        },
    ];

    const [tab, setTab] = useState(TAB_CONFIG);
    const [tabState, setTabState] = useState({
        currentTab: 0,
        tabList: ['smartLink1', 'smartLink2'],
    });
    const edit = useSelector((state) => smartlinkEdit(state));
    const generateFlag = useSelector((state) => getGeneratedFlag(state));
    const { isSmartLinkDetailFetched, fetchedCampaignId } = useSelector(isSmartLinkCacheValid);
    const isCacheValidForCampaign =
        isSmartLinkDetailFetched && Number(fetchedCampaignId) === Number(campaignId);
    const { isSmartLinkCreated } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    const smartLink = useSelector((state) => getGeneratedLink(state));
    const smartLinkFriendlyNames = useSelector((state) => getSmartLinkFriendlyName(state));
    const { customFields, mobileApps, screenList, subScreenList } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);        

    const methods = useForm(FORM_INITIAL_STATE);

    useComponentWillUnmount(() => {
        //dispatch(resetSmartLink());
        dispatch(updateSmartLinkModalState(false));
    });

    const { handleSubmit, reset, resetField, setValue, watch, clearErrors } = methods;
    const [count, saveFlag, formGenerateFlag] = watch(['count', 'saveFlag', 'generateFlag']);
    const isSaveReady = Boolean(formGenerateFlag || saveFlag );

    const SMARTLINK_NAME = {};

    for (let i = 0; i < MAX_SMART_LINKS; i++) {
        SMARTLINK_NAME[i] = getSmartLinkTabMeta(i);
    }
    useEffect(() => {
        // reset(_cloneDeep(FORM_INITIAL_STATE.defaultValues));
        return () => {
            // dispatch(resetSmartLink());
            //  dispatch(updateSmartLinkModalState(false));
        };
    }, [show]);

    useEffect(() => {
        const smarlinkEntries = Object.entries(smartLink);
        // debugger;
        const newTabState = tab.map((tabs, index) => {
            if (index > 0) {
                const [key = '', value = ''] = smarlinkEntries?.[index] || [];
                tabs.isAdd = value === '';
            } else {
                tabs.isAdd = smarlinkEntries?.[0]?.[1] === '';
            }
            return tabs;
        });
        setTab(newTabState);
    }, [smartLink, count]);

    const pendingAutoAddRef = useRef(false);

    const buildTabsFromEdit = useCallback(
        (editData, { applyPendingAutoAdd = false } = {}) => {
            const tempTabState = [];
            Object.entries(editData)?.forEach((entry, index, total) => {
                const [tabId, linkArray] = entry;
                const { id, text2 } = getSmartLinkTabMeta(index);
                const storeFriendly =
                    typeof smartLinkFriendlyNames?.[tabId] === 'object'
                        ? String(smartLinkFriendlyNames[tabId]?.label ?? '').trim()
                        : '';
                const friendlyName =
                    String(linkArray?.[0]?.smartlinkFriendlyname ?? '').trim() || storeFriendly;
                setValue(`${id}_friendlyName`, friendlyName);
                tempTabState.push({
                    id,
                    text2,
                    text: friendlyName || '',
                    friendlyName: friendlyName || '',
                    component: () => (
                        <GenerateSmartLink
                            fieldName={id}
                            key={id}
                            tab={tab}
                            statusId={statusId}
                            isEdit={true}
                            canEditExistingSmartLink={canEditExistingSmartLink}
                            canAddnewSmartLink={canAddnewSmartLink}
                        />
                    ),
                    ...(total?.length < MAX_SMART_LINKS &&
                        total?.length - 1 === index && {
                            isAdd: !canAddnewSmartLink,
                            add: circle_plus_medium,
                        }),
                    ...(index !== 0 &&
                        index === total?.length - 1 && {
                            remove: circle_minus_fill_medium,
                            isRemove: !canEditExistingSmartLink,
                        }),
                });
            });

            if (
                applyPendingAutoAdd &&
                pendingAutoAddRef.current &&
                tempTabState.length < MAX_SMART_LINKS &&
                !isViewOnly
            ) {
                pendingAutoAddRef.current = false;
                const newIdx = tempTabState.length;
                const newSmartlink = getSmartLinkTabMeta(newIdx);
                delete tempTabState[tempTabState.length - 1].add;
                delete tempTabState[tempTabState.length - 1].remove;
                tempTabState.push({
                    ...newSmartlink,
                    friendlyName: '',
                    component: () => (
                        <GenerateSmartLink
                            fieldName={newSmartlink.id}
                            key={newSmartlink.id}
                            tab={[]}
                            isEdit={false}
                            canEditExistingSmartLink={canEditExistingSmartLink}
                            canAddnewSmartLink={canAddnewSmartLink}
                        />
                    ),
                    remove: circle_minus_fill_medium,
                    isAdd: true,
                });
                setValue('count', tempTabState.length);
                setValue('saveFlag', false);
                setTabState({
                    tabList: _map(tempTabState, 'id'),
                    currentTab: tempTabState.length - 1,
                });
            }

            return tempTabState;
        },
        [tab, statusId, canEditExistingSmartLink, canAddnewSmartLink, setValue, smartLinkFriendlyNames, isViewOnly],
    );

    const syncFormToReducer = useCallback(
        (formState) => {
            const tabList = _filter(tabState.tabList, (name) => {
                const isLinkValid = _get(formState[name]?.[0], 'domain', '');
                return isLinkValid;
            });
            const editPayload = {};
            const friendlyNameMap = {};

            tabList.forEach((tabId, index) => {
                if (!formState[tabId]) return;

                const trimmedFriendly = String(formState[`${tabId}_friendlyName`] ?? '').trim();
                const linkData = _cloneDeep(formState[tabId]);
                if (linkData[0]) {
                    linkData[0] = {
                        ...linkData[0],
                        smartlinkFriendlyname: trimmedFriendly,
                    };
                }
                editPayload[tabId] = linkData;

                const url = smartLink[tabId] || smartLinkFriendlyNames[tabId]?.url || '';
                if (url) {
                    friendlyNameMap[tabId] = {
                        url,
                        goalNo: index + 1,
                        ...(trimmedFriendly ? { label: trimmedFriendly } : {}),
                    };
                }
            });

            if (!_isEmpty(editPayload)) {
                const { generatedLink: latestLinks, generateFlag: latestGenerateFlag } =
                    store.getState().smartLinkReducer;
                dispatch(
                    updateEditFlow({
                        edit: editPayload,
                        generatedLink: latestLinks,
                        generateFlag: formState.generateFlag ?? latestGenerateFlag,
                    }),
                );
                const resolvedMobileAppId = getMobileAppIdFromEditFlow(editPayload);
                dispatch(updateMobileAppId(resolvedMobileAppId || ''));
            }

            if (!_isEmpty(friendlyNameMap)) {
                dispatch(updateSmartLinkFriendlyName(friendlyNameMap));
            }

            setTab((prev) =>
                prev.map((tabItem) => {
                    if (!(tabItem.id in editPayload)) return tabItem;
                    const trimmed = String(formState[`${tabItem.id}_friendlyName`] ?? '').trim();
                    return { ...tabItem, text: trimmed, friendlyName: trimmed };
                }),
            );
        },
        [tabState.tabList, smartLink, smartLinkFriendlyNames, store, dispatch],
    );

    const hydrateModalFromEdit = useCallback(
        (editData, currentGenerateFlag, { applyPendingAutoAdd = false } = {}) => {
            if (_isEmpty(editData)) return false;

            const friendlyFields = {};
            Object.entries(editData).forEach(([tabId, linkArray]) => {
                const storeFriendly =
                    typeof smartLinkFriendlyNames?.[tabId] === 'object'
                        ? String(smartLinkFriendlyNames[tabId]?.label ?? '').trim()
                        : '';
                const friendlyName =
                    String(linkArray?.[0]?.smartlinkFriendlyname ?? '').trim() || storeFriendly;
                if (friendlyName) {
                    friendlyFields[`${tabId}_friendlyName`] = friendlyName;
                }
            });

            reset(
                {
                    ..._cloneDeep(FORM_INITIAL_STATE.defaultValues),
                    ...editData,
                    ...friendlyFields,
                    generateFlag: currentGenerateFlag,
                },
                { keepDefaultValues: false },
            );
            const tempTabState = buildTabsFromEdit(editData, { applyPendingAutoAdd });
            setTab(tempTabState);
            return true;
        },
        [buildTabsFromEdit, reset, smartLinkFriendlyNames],
    );

    useEffect(() => {
        if (!_isEmpty(edit)) {
            hydrateModalFromEdit(edit, generateFlag, { applyPendingAutoAdd: true });
        }
    }, [edit]);

    useEffect(() => {
        if (show && openWithAddNewTab && !isViewOnly) {
            pendingAutoAddRef.current = true;
            dispatch(updateSmartLinkAutoAdd(false));
        }
        if (!show) {
            pendingAutoAddRef.current = false;
        }
    }, [show, openWithAddNewTab, isViewOnly]);

    const mobileAppsLoader = useApiLoader();
    const smartLinkDetailLoader = useApiLoader({ autoFetch: false });
    const generateSmartLinkLoader = useApiLoader({ autoFetch: false });
    const isSmartLinkDetailFetching = smartLinkDetailLoader.isFetching;
    const isGeneratingSmartLink = generateSmartLinkLoader.isFetching;
    const isModalLocked = isSmartLinkDetailFetching || isGeneratingSmartLink;

    useEffect(() => {
        async function onModalOpen() {
            const canHydrateFromCache =
                isCacheValidForCampaign && (!_isEmpty(edit) || !smartLink1);

            if (canHydrateFromCache) {
                if (!_isEmpty(edit)) {
                    hydrateModalFromEdit(edit, generateFlag, { applyPendingAutoAdd: true });
                }
            } else {
                const { status } =
                    (await smartLinkDetailLoader.refetch({
                        fetcher: () =>
                            dispatch(
                                getSmartUrl({
                                    payload: { ...payload, campaignId },
                                    listData: { mobileApps, personalization },
                                    screenListObj: { screenList, subScreenList },
                                    loading: false,
                                }),
                            ),
                        mode: 'create',
                        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    })) || {};
                if (!status) {
                    reset(_cloneDeep(FORM_INITIAL_STATE.defaultValues));
                    if (isSmartLinkCreated) {
                        handleClose();
                        dispatch(showTabsSmartlink(true));
                    }
                }
            }

            if (!personalization.length) {
                dispatch(getPersonalizationFields({ payload, loading: false }));
            }

            if (!mobileApps?.length) {
                await mobileAppsLoader.refetch({
                    fetcher: ({ payload: requestPayload } = {}) =>
                        dispatch(getMobileApps({ payload: requestPayload, loading: false })),
                    mode: 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload },
                });
            }
        }
        if (show) {
            onModalOpen();
        } else {
            mobileAppsLoader.reset();
            smartLinkDetailLoader.reset();
            generateSmartLinkLoader.reset();
        }
    }, [show]);

    const isSaveDisabled = isModalLocked || !isSaveReady || isViewOnly;

    const onSubmit = (formState) => {
        if (isModalLocked || isViewOnly) return;
        syncFormToReducer(formState);
        dispatch(updateSmartLinkModalState(false));
        setValue('saveFlag', false);
    };
    const updateTabChange = (temp) => {
        setTab(temp);
        setTabState({
            tabList: _map(temp, 'id'),
            currentTab: temp?.length - 1,
        });
    };

    const onAddTab = (index) => {
        if (isViewOnly) return;
        if (smartLink[`smartLink${index}`] == '') return;
        const getSmartlink = SMARTLINK_NAME[index];
        const temp = [...tab];
        delete temp[temp?.length - 1].add;
        delete temp[temp?.length - 1].remove;
        temp.push({
            ...getSmartlink,
            friendlyName: '',
            component: () => (
                <GenerateSmartLink
                    fieldName={getSmartlink.id}
                    key={getSmartlink.id}
                    tab={tab}
                    isEdit={false}
                    canEditExistingSmartLink={canEditExistingSmartLink}
                    canAddnewSmartLink={canAddnewSmartLink}
                />
            ),
            remove: circle_minus_fill_medium,
            isAdd: true,
        });
        setValue('count', temp?.length);
        setValue('saveFlag', false);

        updateTabChange(temp);
    };

    const onRemoveTab = () => {
        if (isViewOnly) return;
        const temp = [...tab];
        if (temp?.length === 1) return;
        const removedItem = temp.pop();
        dispatch(deleteGeneratedSmartLink(removedItem.id));
        resetField(removedItem.id);
        setValue(removedItem.id, [
            {
                type: 'WEB',
                domain: '',
                adaptiveUrl: '',
                utmParameters: false,
                all: false,
                isAndroid: false,
                isIOS: false,
                customAppScreen: false,
                parameters: [{ tags: '', tagValue: '', isUTMParameterInput: false, customValue: '' }],
            },
        ]);
        temp[temp?.length - 1] = {
            ...temp[temp?.length - 1],
            add: circle_plus_medium,
            ...(temp?.length > 1 && { remove: circle_minus_fill_medium }),
        };
        updateTabChange(temp);
        // let tempIdx = temp?.[temp?.length - 1]?.id;
        setValue('saveFlag', true);
        // dispatch(deleteGeneratedSmartLink(removedItem?.id));
    };

    const value = useMemo(
        () => ({
            tabs: tabState.tabList,
            allTabs: tab,
            setAllTabs: setTab,
            currentTabIndex: tabState.currentTab,
            isMobileAppsLoading: mobileAppsLoader.isLoading,
            generateSmartLinkLoader,
            onSyncFormToReducer: syncFormToReducer,
            isSmartLinkViewOnly: isViewOnly,
        }),
        [tabState.tabList, tab, tabState.currentTab, mobileAppsLoader.isLoading, generateSmartLinkLoader, syncFormToReducer, isViewOnly],
    );

    const displayTabs = useMemo(() => {
        if (!isViewOnly) return tab;
        return tab.map((tabItem) => ({
            ...tabItem,
            isAdd: tabItem.add ? true : tabItem.isAdd,
            isRemove: tabItem.remove ? true : tabItem.isRemove,
        }));
    }, [tab, isViewOnly]);

    // Tab labels are controlled by the "smart link name" input inside each tab.

    const handleSmartLinkReset = () => {
        setTabState((pre) => ({
            ...pre,
            currentTab: 0,
        }));
        if (!_isEmpty(edit)) {
            hydrateModalFromEdit(edit, generateFlag);
        } else {
            reset(() => ({
                ...FORM_INITIAL_STATE.defaultValues,
            }));
        }
        clearErrors();
    };

    return (
        <>
            <RSModal
                className="smartLinkModal-CSS"
                show={show}
                // show
                size="xlg"
                header={SMART_LINK_POPUP}
                lockBackground={isModalLocked}
                isCloseDisabled={isModalLocked}
                handleClose={() => {
                    if (isModalLocked) return;
                    handleSmartLinkReset();
                    handleClose();
                }}
                isFailuremodal
                // closeTooltipPosition={true}
                body={
                    isSmartLinkDetailFetching ? (
                        <SmartLinkModalSkeleton />
                    ) : (
                    <FormProvider {...methods}>
                        <SmartLinkProvider.Provider value={value}>
                            <RSTabSlide
                                dynamicTab={`res-content-tabs-split model_smartlink`}
                                activeClass={`active`}
                                    flatTabs
                                tabData={displayTabs}
                                isRemoveConfirmation
                                defaultTab={tabState.currentTab}
                                callBack={(_, index, isForceUpdate) => {
                                    setTabState((prev) => ({ ...prev, currentTab: index }));
                                }}
                                onAddMenu={(index) => onAddTab(index)}
                                onRemoveMenu={onRemoveTab}
                                customTooltipName={ADD_SMART_LINK_POPUP}
                                    enableTabLabelEdit={false}
                                    subText
                                    tabSubTextFirst
                                    tabLabelsExternallyControlled
                            />
                        </SmartLinkProvider.Provider>
                    </FormProvider>
                    )
                }
                footer={
                    <Fragment>
                        <RSSecondaryButton
                            onClick={() => {
                                if (isModalLocked) return;
                                handleSmartLinkReset();
                                handleClose();
                            }}
                            blockInteraction={isModalLocked}
                            id="rs_SmartLink_Cancel"
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            id="rs_SmartLink_save"
                            onClick={handleSubmit(onSubmit)}
                            disabledClass={isSaveDisabled ? 'pe-none click-off' : ''}
                            blockBodyPointerEvents
                        // className={!(smartLink1 || smartLink2) ? 'click-off' : ''}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    </Fragment>
                }
            />
            {/* <WarningPopup
                show={isFailure}
                handleClose={() => {
                    setIsFailure(false);
                }}
                text={'There is no mobile apps in this BU'}
                isPrimary={false}
            /> */}
        </>
    );
};

export default SmartLink;
