import { statusIdCheck } from 'Utils/modules/campaignUtils';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import _cloneDeep from 'lodash/cloneDeep';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';

import { circle_minus_fill_medium, circle_plus_medium } from 'Constants/GlobalConstant/Glyphicons';
import { ADD_SMART_LINK_POPUP, CANCEL, SAVE, SMART_LINK_POPUP } from 'Constants/GlobalConstant/Placeholders';
import { MAX_SMART_LINKS } from 'Constants/GlobalConstant/InputLimit';

import RSModal from 'Components/RSModal';
import SmartLinkProvider from './context';
import GenerateSmartLink from './Component/GenerateSmartLink';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';

import { FORM_INITIAL_STATE, buildSmartLinkPayload } from './constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { getMobileApps, getSmartUrl, saveSmartLink } from 'Reducers/communication/createCommunication/smartlink/request';
import {
    getGeneratedFlag,
    getGeneratedLink,
    smartlinkEdit,
} from 'Reducers/communication/createCommunication/smartlink/selectors';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import { deleteGeneratedSmartLink, showTabsSmartlink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import useQueryParams from 'Hooks/useQueryParams';


import RSTabSlide from 'Components/RSTabSlide'
import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG, AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import SmartLinkModalSkeleton from 'Components/Skeleton/Components/SmartLinkModalSkeleton';
// import { DUPLICATE_VALUE } from 'Constants/GlobalConstant/ValidationMessage';


const EDITABLE_STATUS_IDS = [7, 54, 6];
const excludedChannelIds = [6, 16];

const SmartLink = ({ handleClose, show, statusId, openWithAddNewTab = false }) => {
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
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
    const { isSmartLinkCreated } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    const { eventTrackData } = useSelector(({ smartLinkReducer }) => smartLinkReducer);
    const smartLink = useSelector((state) => getGeneratedLink(state));
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
    const [count, saveFlag] = watch(['count', 'saveFlag']);


    const SMARTLINK_NAME = {};

    for (let i = 0; i < MAX_SMART_LINKS; i++) {
        SMARTLINK_NAME[i] = {
            id: `smartLink${i + 1}`,
            text: '',
            text2: `Smart Link ${i + 1}`,
            friendlyName: '',
        };

        // Add the icon to all except the first and last items
        if (i !== MAX_SMART_LINKS - 1) {
            SMARTLINK_NAME[i].add = circle_plus_medium;
        }
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

    // console.log('Smart link :::::: ', smartLink);
    useEffect(() => {
        if (!_isEmpty(edit)) {
            reset((formState) => ({ ...formState, ...edit, generateFlag }));
            const tempTabState = [];
            Object.entries(edit)?.forEach((link, index, total) => {
                const { id, text2 } = SMARTLINK_NAME[index];
                const friendlyName = link?.[1]?.[0]?.smartlinkFriendlyname || ''
                setValue(`${id}_friendlyName`, friendlyName)
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

            if (pendingAutoAddRef.current && tempTabState.length < MAX_SMART_LINKS) {
                pendingAutoAddRef.current = false;
                const newIdx = tempTabState.length;
                const newSmartlink = SMARTLINK_NAME[newIdx];
                if (newSmartlink) {
                    // Strip add/remove icons from the last existing tab
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
            }

            setTab(tempTabState);
        }
    }, [edit]);

    useEffect(() => {
        if (show && openWithAddNewTab) {
            pendingAutoAddRef.current = true;
            dispatch(updateSmartLinkAutoAdd(false));
        }
        if (!show) {
            pendingAutoAddRef.current = false;
        }
    }, [show, openWithAddNewTab]);

    const mobileAppsLoader = useApiLoader();
    const smartLinkDetailLoader = useApiLoader({ autoFetch: false });
    const smartLinkSaveApi = useApiLoader({ autoFetch: false });
    const generateSmartLinkLoader = useApiLoader({ autoFetch: false });
    const isSmartLinkDetailFetching = smartLinkDetailLoader.isFetching;
    const isSavingSmartLink = smartLinkSaveApi.isFetching;
    const isGeneratingSmartLink = generateSmartLinkLoader.isFetching;
    const isModalLocked = isSmartLinkDetailFetching || isSavingSmartLink || isGeneratingSmartLink;

    useEffect(() => {
        async function fetchSmartLink() {
            if (!!smartLink1) {
                const { status, message } =
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
            fetchSmartLink();
        } else {
            mobileAppsLoader.reset();
            smartLinkDetailLoader.reset();
            smartLinkSaveApi.reset();
            generateSmartLinkLoader.reset();
        }
    }, [show]);

    const onFormSubmit = async (formState) => {
        if (isSavingSmartLink) return;
        formState = {
            ...formState,
            ...payload,
            campaignId,
            tabs: tabState.tabList,
            allTabs: tab,
        };
        let isEventTrack = Object.values(eventTrackData)[0]?.length || Object.values(eventTrackData)[1]?.length;
        const formPayload = buildSmartLinkPayload(formState, isEventTrack);
        const res = await smartLinkSaveApi.refetch({
            fetcher: ({ payload: savePayload } = {}) =>
                dispatch(saveSmartLink({ payload: savePayload, loading: false })),
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            params: { payload: formPayload },
        });
        if (res?.status) {
            dispatch(updateSmartLinkModalState(false));
            setValue('saveFlag', false);
            setValue('generateFlag', false);
        }
    };

    const onSubmit = async (formState) => {
        if (isModalLocked) return;
        await onFormSubmit(formState);
    };
    const updateTabChange = (temp) => {
        setTab(temp);
        setTabState({
            tabList: _map(temp, 'id'),
            currentTab: temp?.length - 1,
        });
    };

    const onAddTab = (index) => {
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
        }),
        [tabState.tabList, tab, tabState.currentTab, mobileAppsLoader.isLoading, generateSmartLinkLoader],
    );

    // Tab labels are controlled by the "smart link name" input inside each tab.

    const handleSmartLinkReset = () => {
        setTabState((pre) => ({
            ...pre,
            currentTab: 0,
        }));
        reset(() => ({
            ...FORM_INITIAL_STATE.defaultValues,
        }));
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
                                tabData={tab}
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
                            isLoading={isSavingSmartLink}
                            disabledClass={
                                isModalLocked || !saveFlag ? 'pe-none click-off' : ''
                            }
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
