import { createCommunicationSettingsNavState, NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import _map from 'lodash/map';
import { Switch } from '@progress/kendo-react-inputs';
import { Row, Container, Col } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';

import RSTagsComponent from 'Components/RSTagsComponent';
import RSPageHeader from 'Components/RSPageHeader';
import MobilePermissionGrid from './Component/grid';

import SelectAttributeListboxModal from 'Components/SelectAttributeListboxModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { INITIAL_STATE, INITIAL_STATE_FORM, buildPayload } from './constant';
import RSTooltip from 'Components/RSTooltip';
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    getMobilePushSettingData,
    UpsertMobilePushPermission,
} from 'Reducers/preferences/CommunicationSettings/request';
import { updateMobilePermissionData } from 'Reducers/preferences/CommunicationSettings/reducer';
import { CommunicationSettingsWebPermissionsSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';




// Constants
const NAVIGATION_STATE = createCommunicationSettingsNavState('notification', {
    subfrom: 'MP',
    notificationTabId: NOTIFICATION_TAB_ID.MOBILE,
});

const NAVIGATION_PATH = '/preferences/communication-settings';

const PushAppPermissions = () => {
    const location = useQueryParams('/communication');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Selectors
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { clientId, userId, departmentId } = useSelector(getSessionId);
    const { mobileAppPermissionData } = useSelector(
        ({ communicationSettingsReducer }) => communicationSettingsReducer
    );

    // Form setup
    const methods = useForm(INITIAL_STATE_FORM);
    const { handleSubmit, setValue, watch } = methods;
    const [pageGrid, inboxClassification] = watch(['pageGrid', 'inboxClassification']);

    // State
    const [state, setState] = useState(INITIAL_STATE);
    const [gridData, setGridData] = useState({});
    const [tempattributes, settempAttributes] = useState({});
    const [tempAttrAssign, settempAttrAssign] = useState([]);
    const [tempAttrAvail, settempAttrAvail] = useState([]);
    const [tempeventsAssign, settempEventsAssign] = useState([]);
    const [tempeventsAvail, settempEventsAvail] = useState([]);
    const [inboxClassificationON, setInboxClassificationON] = useState(false);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;

    const hasData = useMemo(() => Object.keys(gridData).length > 0, [gridData]);
    const showEmptyState = !pageLoadApi.isFetching && !hasData;

    const resetSelections = useCallback((arr) => arr.map((ele) => ({ ...ele, selected: false })), []);

    const resetPermissionState = useCallback(() => {
        setGridData({});
        settempAttributes({});
        settempAttrAvail([]);
        settempAttrAssign([]);
        settempEventsAvail([]);
        settempEventsAssign([]);
        setValue('pageGrid', []);
        setValue('inboxClassification', []);
        setInboxClassificationON(false);
    }, [setValue]);

    const applyPermissionData = useCallback(
        (data) => {
            dispatch(updateMobilePermissionData({ field: 'mobileAppPermissionData', payload: data }));

            const leftEvents = data?.events?.available.filter(
                (item1) => !data?.events?.assigned.some((item2) => item1.eventId === item2.eventId),
            );

            const leftAttributes = data?.attributes?.additional?.available.filter(
                (item1) =>
                    !data?.attributes?.additional?.assigned.some(
                        (item2) => item1.attributeId === item2.attributeId,
                    ),
            );

            const classificationIds = data?.inboxClassification?.map((e) => e.classificationId) || [];

            setGridData(data);
            settempAttributes(data?.attributes);
            settempAttrAvail(
                resetSelections(leftAttributes).sort((a, b) =>
                    a.attributeName.toLowerCase().localeCompare(b.attributeName.toLowerCase()),
                ),
            );
            settempAttrAssign(resetSelections(data?.attributes?.additional?.assigned || []));
            settempEventsAvail(resetSelections(leftEvents));
            settempEventsAssign(resetSelections(data?.events?.assigned || []));
            setValue('pageGrid', data?.appPermission || []);
            setValue('inboxClassification', classificationIds);
            setInboxClassificationON(classificationIds.length > 0);
        },
        [dispatch, resetSelections, setValue],
    );

    const bootstrapPage = useCallback(() => {
        if (!location?.id || !clientId || !userId || !departmentId) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: () =>
                dispatch(
                    getMobilePushSettingData({
                        clientId,
                        userId,
                        departmentId,
                        pushNotifySettingId: location?.id,
                    }),
                ),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
            onSuccess: (res) => {
                if (res?.status && res?.data) {
                    applyPermissionData(res.data);
                } else {
                    resetPermissionState();
                }
            },
            onError: () => {
                resetPermissionState();
            },
        });
    }, [
        location?.id,
        clientId,
        userId,
        departmentId,
        dispatch,
        applyPermissionData,
        resetPermissionState,
    ]);

    const bootstrapPageRef = useRef(bootstrapPage);
    bootstrapPageRef.current = bootstrapPage;

    useEffect(() => {
        if (!location?.id || !clientId || !userId || !departmentId) {
            return undefined;
        }
        bootstrapPageRef.current();
    }, [location?.id, clientId, userId, departmentId]);

    // Modal handling
    const handleModalOpen = useCallback((assignState, availState, modalKey) => {
        const prevAssign = [...assignState];
        const prevAvail = [...availState];
        UpdateState(setState, modalKey, true);
        return { prevAssign, prevAvail };
    }, []);

    // Save handler
    const handleSave = useCallback(
        async (data) => {
            if (saveApi.isFetching) return;

            const collectData = {
                clientId,
                userId,
                departmentId,
                pushNotifySettingId: location?.id,
                createdBy: userId,
                AppPermission: pageGrid,
                Attributes: tempAttrAssign,
                Events: tempeventsAssign,
                WhitelistThrottling: gridData?.whitelistThrottling,
                InboxClassification: data?.inboxClassification,
            };

            const payload = buildPayload(collectData, mobileAppPermissionData);
            const { status } = await saveApi.refetch({
                fetcher: () => dispatch(UpsertMobilePushPermission(payload, false)),
                loaderConfig: fieldLoaderConfig,
                mode: 'create',
            });

            if (status) {
                navigate(NAVIGATION_PATH, { state: NAVIGATION_STATE });
            }
        },
        [
            clientId,
            userId,
            departmentId,
            location?.id,
            pageGrid,
            tempAttrAssign,
            tempeventsAssign,
            gridData?.whitelistThrottling,
            mobileAppPermissionData,
            dispatch,
            navigate,
            saveApi.refetch,
            saveApi.isFetching,
        ]
    );

    // Navigation handler
    const handleCancel = useCallback(() => {
        navigate(NAVIGATION_PATH, { state: NAVIGATION_STATE });
    }, [navigate]);

    // Modal handlers
    const handleAttributesModalOpen = useCallback(() => {
        const { prevAssign, prevAvail } = handleModalOpen(tempAttrAssign, tempAttrAvail, 'showAttributesModal');
        settempAttrAssign(prevAssign);
        settempAttrAvail(prevAvail);
    }, [tempAttrAssign, tempAttrAvail, handleModalOpen]);

    const handleEventsModalOpen = useCallback(() => {
        const { prevAssign, prevAvail } = handleModalOpen(tempeventsAssign, tempeventsAvail, 'showEventsModal');
        settempEventsAssign(prevAssign);
        settempEventsAvail(prevAvail);
    }, [tempeventsAssign, tempeventsAvail, handleModalOpen]);

    const handleAttributesModalClose = useCallback(() => {
        const { prevAssign, prevAvail } = handleModalOpen(tempAttrAssign, tempAttrAvail, 'showAttributesModal');
        settempAttrAssign(resetSelections(prevAssign));
        settempAttrAvail(resetSelections(prevAvail));
        UpdateState(setState, 'showAttributesModal', false);
    }, [tempAttrAssign, tempAttrAvail, handleModalOpen, resetSelections]);

    const handleEventsModalClose = useCallback(() => {
        const { prevAssign, prevAvail } = handleModalOpen(tempeventsAssign, tempeventsAvail, 'showEventsModal');
        settempEventsAssign(resetSelections(prevAssign));
        settempEventsAvail(resetSelections(prevAvail));
        UpdateState(setState, 'showEventsModal', false);
    }, [tempeventsAssign, tempeventsAvail, handleModalOpen, resetSelections]);

    const handleAttributesSelect = useCallback(
        (data) => {
            const resetAssign = resetSelections(data.rightAttributes);
            const resetAvail = resetSelections(data.leftAttributes);
            settempAttrAssign(resetAssign);
            settempAttrAvail(resetAvail);
            UpdateState(
                setState,
                ['showAttributesModal', 'sel_attributes'],
                [false, _map(data.rightAttributes, 'attributeName')]
            );
        },
        [resetSelections]
    );

    const handleEventsSelect = useCallback(
        (data) => {
            const resetAssign = resetSelections(data.rightAttributes);
            const resetAvail = resetSelections(data.leftAttributes);
            settempEventsAssign(resetAssign);
            settempEventsAvail(resetAvail);
            UpdateState(
                setState,
                ['showEventsModal', 'sel_events'],
                [false, _map(data.rightAttributes, 'eventName')]
            );
        },
        [resetSelections]
    );

    return (
        <div className="page-content-holder">
            <RSPageHeader
                title="Settings"
                rightCommonMenus
                isAgencyDisabled
                isBuDisabled
                backPath={NAVIGATION_PATH}
                isBack
                state={NAVIGATION_STATE}
            />

            <Container className="page-content px0">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(handleSave)}>
                        <CommunicationSettingsWebPermissionsSkeletonGate
                            isLoading={pageLoadApi.isFetching}
                        >
                        {hasData ? (
                            <>
                                <div className="rs-table-with-heading mt20">
                                    <div className="rs-kendo-table-hide-header rskt-width-90-10 pushPermissions">
                                        <h3 className="mb15">Mobile app permissions</h3>

                                        {gridData?.appPermission?.length > 0 && (
                                            <MobilePermissionGrid
                                                setValue={setValue}
                                                control={methods.control}
                                                loaddata={gridData.appPermission}
                                            />
                                        )}

                                        <Row>
                                            {/* Attributes Section */}
                                            <Col md={6}>
                                                <div className="clearfix mt30 mb10">
                                                    <h4 className="m0 float-start">Attributes</h4>
                                                    <div className="float-end">
                                                        <RSTooltip text="Edit attributes" position="top">
                                                            <i
                                                                onClick={handleAttributesModalOpen}
                                                                className={`icon-md color-primary-blue float-end mt-2 ${pencil_edit_medium}`}
                                                                id="rs_data_pencil_edit"
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                </div>
                                                <div className="tag-list-block box-design no-box-shadow">
                                                    <div>
                                                        <h5 className="mb10">
                                                            Default
                                                            <span className="badge badge-round bg-secondary ml5">
                                                                {tempattributes?.default?.length || 0}
                                                            </span>
                                                        </h5>
                                                        <ul className="rs-attr-sep css-scrollbar mb8">
                                                            {tempattributes?.default?.map((attr) => (
                                                                <li key={attr.attributeId}>{attr.attributeName}</li>
                                                            ))}
                                                        </ul>
                                                        <h5 className="mb10">
                                                            Additional
                                                            <span className="badge badge-round bg-secondary ml5">
                                                                {tempAttrAssign?.length || 0}
                                                            </span>
                                                        </h5>
                                                        <ul>
                                                            {tempAttrAssign?.map((attr) => (
                                                                <li key={attr.attributeId}>{attr.attributeName}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Col>

                                            {/* Events Section */}
                                            <Col md={6}>
                                                <div className="clearfix mt30 mb10">
                                                    <h4 className="m0 float-start">Events</h4>
                                                    <div className="float-end">
                                                        <RSTooltip text="Edit events" position="top">
                                                            <i
                                                                onClick={handleEventsModalOpen}
                                                                className={`icon-md color-primary-blue float-end mt-2 ${pencil_edit_medium}`}
                                                                id="rs_data_pencil_edit"
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                </div>
                                                <div className="tag-list-block box-design no-box-shadow">
                                                    <ul>
                                                        {tempeventsAssign?.map((event) => (
                                                            <li key={event.eventId}>{event.eventName}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </Col>

                                            {/* Inbox Classification Section */}
                                            <Col md={12}>
                                                <div className="clearfix mt30 mb10">
                                                    <h4 className="m0 float-start">Inbox classification</h4>
                                                    <div className="float-end">
                                                        <Switch
                                                            checked={inboxClassificationON}
                                                            onChange={(e) => setInboxClassificationON(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div
                                                    className={`tag-list-block box-design no-box-shadow ${!inboxClassificationON ? 'click-off' : ''
                                                        }`}
                                                >
                                                    <ul>
                                                        <RSTagsComponent
                                                            isNoOfCharacters={false}
                                                            updatedTags={(tags) => setValue('inboxClassification', tags)}
                                                            tags={inboxClassification}
                                                            isRefresh={inboxClassification.length ? true : false}
                                                        />
                                                    </ul>
                                                </div>
                                            </Col>
                                        </Row>

                                        {/* Modals */}
                                        <SelectAttributeListboxModal
                                            header="Add attributes"
                                            leftAttributes={tempAttrAvail}
                                            rightAttributes={tempAttrAssign}
                                            getSelectedData={handleAttributesSelect}
                                            textField="attributeName"
                                            show={state.showAttributesModal}
                                            handleClose={handleAttributesModalClose}
                                        />

                                        <SelectAttributeListboxModal
                                            header="Add events"
                                            leftAttributes={tempeventsAvail}
                                            rightAttributes={tempeventsAssign}
                                            getSelectedData={handleEventsSelect}
                                            listBoxHeader="events"
                                            textField="eventName"
                                            show={state.showEventsModal}
                                            handleClose={handleEventsModalClose}
                                        />
                                    </div>
                                </div>

                                <div className="buttons-holder pref-cs-buttons-outside">
                                    <RSSecondaryButton type="button" onClick={handleCancel} blockInteraction={isSaveLoading}>
                                        Cancel
                                    </RSSecondaryButton>
                                    <RSPrimaryButton type="submit" isLoading={isSaveLoading} blockBodyPointerEvents>
                                        Save
                                    </RSPrimaryButton>
                                </div>
                            </>
                        ) : showEmptyState ? (
                            <>
                                <div className="pref-cs-web-permissions-empty text-center py40">
                                    <p className="mb0 color-secondary-grey">No data available</p>
                                </div>
                                <div className="buttons-holder pref-cs-buttons-outside">
                                    <RSSecondaryButton type="button" onClick={handleCancel} blockInteraction={isSaveLoading}>
                                        Cancel
                                    </RSSecondaryButton>
                                </div>
                            </>
                        ) : null}
                        </CommunicationSettingsWebPermissionsSkeletonGate>
                    </form>
                </FormProvider>
            </Container>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </div>
    );
};

export default PushAppPermissions;