import { createCommunicationSettingsNavState, NOTIFICATION_TAB_ID } from 'Utils/modules/navigation';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { CANCEL, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import { Col, Container, Row } from 'react-bootstrap';
import _map from 'lodash/map';
import { pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import useQueryParams from 'Hooks/useQueryParams';
import RSPageHeader from 'Components/RSPageHeader';
import WebPermissionGrid from './Component/grid';
import SelectAttributeListboxModal from 'Components/SelectAttributeListboxModal';
import RSTagsComponent from 'Components/RSTagsComponent';
import { CommunicationSettingsWebPermissionsSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';

import { INITIAL_STATE, INITIAL_STATE_FORM, buildPayload } from './constant';

import { getSessionId } from 'Reducers/globalState/selector';
import { getWebPushSettingData, UpsertWebPushPermission } from 'Reducers/preferences/CommunicationSettings/request';
import { updateWepAppPermissionData } from 'Reducers/preferences/CommunicationSettings/reducer';


const NAVIGATION_STATE = createCommunicationSettingsNavState('notification', {
    subfrom: 'WP',
    notificationTabId: NOTIFICATION_TAB_ID.WEB,
});

const BACK_PATH = '/preferences/communication-settings';


const WebAppPermission = () => {
    const location = useQueryParams('/communication');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { clientId, userId, departmentId } = useSelector(getSessionId);
    const { wepAppPermissionData } = useSelector(({ communicationSettingsReducer }) => communicationSettingsReducer);

    const [state, setState] = useState(INITIAL_STATE);
    const [gridData, setGridData] = useState({});
    const [tempAttributes, setTempAttributes] = useState({});
    const [tempAttrAssign, setTempAttrAssign] = useState([]);
    const [tempAttrAvail, setTempAttrAvail] = useState([]);
    const [tempEventsAssign, setTempEventsAssign] = useState([]);
    const [tempEventsAvail, setTempEventsAvail] = useState([]);
    const [inboxActive, setInboxActive] = useState(false);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;

    const methods = useForm(INITIAL_STATE_FORM);
    const { handleSubmit, control, setValue, watch } = methods;
    const [pageGrid, inboxClassification] = watch(['pageGrid', 'inboxClassification']);

    // Memoized helper function
    const resetSelection = useCallback((arr) => arr.map((item) => ({ ...item, selected: false })), []);

    // Navigate to settings page
    const navigateToSettings = useCallback(() => {
        navigate(BACK_PATH, { state: NAVIGATION_STATE });
    }, [navigate]);

    const applyPermissionData = useCallback(
        (data) => {
            dispatch(updateWepAppPermissionData({ field: 'wepAppPermissionData', payload: data }));

            const classificationIds = data.inboxClassification?.map((e) => e.classificationId) || [];

            const leftEvents =
                data.events?.available.filter(
                    (item1) => !data.events?.assigned.some((item2) => item1.eventId === item2.eventId),
                ) || [];

            const leftAttributes =
                data.attributes?.additional?.available.filter(
                    (item1) =>
                        !data.attributes?.additional?.assigned.some(
                            (item2) => item1.attributeId === item2.attributeId,
                        ),
                ) || [];

            const sortedLeftAttributes = resetSelection(leftAttributes).sort((a, b) =>
                a.attributeName.toLowerCase().localeCompare(b.attributeName.toLowerCase()),
            );

            setGridData(data);
            setTempAttributes(data.attributes || {});
            setTempAttrAvail(sortedLeftAttributes);
            setTempAttrAssign(resetSelection(data.attributes?.additional?.assigned || []));
            setTempEventsAvail(resetSelection(leftEvents));
            setTempEventsAssign(resetSelection(data.events?.assigned || []));
            setValue('pageGrid', data.appPermission || []);
            setValue('inboxClassification', classificationIds);
            setInboxActive(data.inboxActive || false);
        },
        [dispatch, resetSelection, setValue],
    );

    const resetPermissionState = useCallback(() => {
        setGridData({});
        setTempAttributes({});
        setTempAttrAvail([]);
        setTempAttrAssign([]);
        setTempEventsAvail([]);
        setTempEventsAssign([]);
        setValue('pageGrid', []);
        setValue('inboxClassification', []);
        setInboxActive(false);
    }, [setValue]);

    const bootstrapPage = useCallback(() => {
        if (!location?.id || !clientId || !userId || !departmentId) {
            return undefined;
        }
        return pageLoadApi.refetch({
            fetcher: () =>
                dispatch(
                    getWebPushSettingData({
                        clientId,
                        userId,
                        departmentId,
                        webnotifySettingId: location?.id,
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
        pageLoadApi.refetch,
        applyPermissionData,
        resetPermissionState,
    ]);

    useEffect(() => {
        bootstrapPage();
    }, [bootstrapPage]);

    // Handle save
    const handleSave = useCallback(async (data) => {
        if (saveApi.isFetching) return;

        const collectData = {
            clientId,
            userId,
            departmentId,
            webnotifySettingId: location?.id,
            createdBy: userId,
            AppPermission: pageGrid,
            Attributes: tempAttrAssign,
            Events: tempEventsAssign,
            WhitelistThrottling: gridData.whitelistThrottling,
            InboxClassification: data.inboxClassification,
            inboxActive: data.inboxSwitch,
        };

        const payload = buildPayload(collectData, wepAppPermissionData);
        const res = await saveApi.refetch({
            fetcher: () => dispatch(UpsertWebPushPermission(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });

        if (res?.status) {
            navigateToSettings();
        }
    }, [clientId, userId, departmentId, location?.id, pageGrid, tempAttrAssign, tempEventsAssign, gridData, wepAppPermissionData, dispatch, navigateToSettings, saveApi.refetch, saveApi.isFetching]);

    // Handle modal open/close
    const handleModalOpen = useCallback((assignState, availState, modalKey) => {
        UpdateState(setState, modalKey, true);
        return { prevAssign: [...assignState], prevAvail: [...availState] };
    }, []);

    const handleModalClose = useCallback((modalKey, assignState, availState, setAssign, setAvail) => {
        setAssign(resetSelection(assignState));
        setAvail(resetSelection(availState));
        UpdateState(setState, modalKey, false);
    }, [resetSelection]);

    const hasData = useMemo(() => Object.keys(gridData).length > 0, [gridData]);
    const showEmptyState = !pageLoadApi.isFetching && !hasData;

    return (
        <div className="page-content-holder">
            <RSPageHeader
                title="Settings"
                rightCommonMenus
                isBuDisabled
                isAgencyDisabled
                backPath={BACK_PATH}
                isBack
                state={NAVIGATION_STATE}
            />

            <Container className="page-content px0 alertsAndNotificationCSS">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(handleSave)}>
                        <CommunicationSettingsWebPermissionsSkeletonGate
                            isLoading={pageLoadApi.isFetching}
                        >
                        {hasData ? (
                            <>
                                <div className="rs-table-with-heading mt20">
                                    <div className="rs-kendo-table-hide-header rskt-width-90-10 pushPermissions">
                                        <h3 className="mb15">Web app permissions</h3>

                                        {/* App Permission Grid */}
                                        {gridData.appPermission?.length > 0 && (
                                            <div className="app-permission-value">
                                                <WebPermissionGrid
                                                    setValue={setValue}
                                                    control={control}
                                                    loaddata={gridData.appPermission}
                                                />
                                            </div>
                                        )}

                                        <Row>
                                            {/* Attributes Section */}
                                            <Col md={6}>
                                                <AttributesSection
                                                    tempAttributes={tempAttributes}
                                                    tempAttrAssign={tempAttrAssign}
                                                    onEdit={() => {
                                                        const { prevAssign, prevAvail } = handleModalOpen(
                                                            tempAttrAssign,
                                                            tempAttrAvail,
                                                            'showAttributesModal',
                                                        );
                                                        setTempAttrAssign(prevAssign);
                                                        setTempAttrAvail(prevAvail);
                                                    }}
                                                />
                                            </Col>

                                            {/* Events Section */}
                                            <Col md={6}>
                                                <EventsSection
                                                    tempEventsAssign={tempEventsAssign}
                                                    onEdit={() => {
                                                        const { prevAssign, prevAvail } = handleModalOpen(
                                                            tempEventsAssign,
                                                            tempEventsAvail,
                                                            'showEventsModal',
                                                        );
                                                        setTempEventsAssign(prevAssign);
                                                        setTempEventsAvail(prevAvail);
                                                    }}
                                                />
                                            </Col>

                                            {/* Inbox Classification */}
                                            <Col md={12}>
                                                <InboxClassificationSection
                                                    control={control}
                                                    inboxActive={inboxActive}
                                                    inboxClassification={inboxClassification}
                                                    setValue={setValue}
                                                    onToggle={setInboxActive}
                                                />
                                            </Col>
                                        </Row>

                                        {/* Attributes Modal */}
                                        <SelectAttributeListboxModal
                                            header="Add attributes"
                                            leftAttributes={tempAttrAvail}
                                            rightAttributes={tempAttrAssign}
                                            textField="attributeName"
                                            show={state.showAttributesModal}
                                            getSelectedData={(data) => {
                                                setTempAttrAssign(resetSelection(data.rightAttributes));
                                                setTempAttrAvail(resetSelection(data.leftAttributes));
                                                UpdateState(setState, ['showAttributesModal', 'sel_attributes'], [
                                                    false,
                                                    _map(data.rightAttributes, 'attributeName'),
                                                ]);
                                            }}
                                            handleClose={() => handleModalClose(
                                                'showAttributesModal',
                                                tempAttrAssign,
                                                tempAttrAvail,
                                                setTempAttrAssign,
                                                setTempAttrAvail,
                                            )}
                                        />

                                        {/* Events Modal */}
                                        <SelectAttributeListboxModal
                                            header="Add events"
                                            leftAttributes={tempEventsAvail}
                                            rightAttributes={tempEventsAssign}
                                            listBoxHeader="events"
                                            textField="eventName"
                                            show={state.showEventsModal}
                                            getSelectedData={(data) => {
                                                setTempEventsAssign(resetSelection(data.rightAttributes));
                                                setTempEventsAvail(resetSelection(data.leftAttributes));
                                                UpdateState(setState, ['showEventsModal', 'sel_events'], [
                                                    false,
                                                    _map(data.rightAttributes, 'eventName'),
                                                ]);
                                            }}
                                            handleClose={() => handleModalClose(
                                                'showEventsModal',
                                                tempEventsAssign,
                                                tempEventsAvail,
                                                setTempEventsAssign,
                                                setTempEventsAvail,
                                            )}
                                        />
                                    </div>
                                </div>

                                <ActionButtons onCancel={navigateToSettings} isSaveLoading={isSaveLoading} />
                            </>
                        ) : showEmptyState ? (
                            <>
                                <div className="pref-cs-web-permissions-empty text-center py40">
                                    <p className="mb0 color-secondary-grey">No data available</p>
                                </div>
                                <ActionButtons onCancel={navigateToSettings} showSave={false} isSaveLoading={isSaveLoading} />
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

// Sub-components for better organization
const AttributesSection = ({ tempAttributes, tempAttrAssign, onEdit }) => (
    <div>
        <SectionHeader title="Attributes" onEdit={onEdit} tooltipText="Edit attributes" />
        <div className="tag-list-block box-design no-box-shadow">
            <div>
                <h5 className="mb10">
                    Default
                    <span className="badge badge-round bg-secondary ml5">
                        {tempAttributes?.default?.length || 0}
                    </span>
                </h5>
                <ul className="rs-attr-sep css-scrollbar mb8">
                    {tempAttributes?.default?.map((attr) => (
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
    </div>
);

const EventsSection = ({ tempEventsAssign, onEdit }) => (
    <div>
        <SectionHeader title="Events" onEdit={onEdit} tooltipText="Edit events" />
        <div className="tag-list-block box-design no-box-shadow">
            <ul>
                {tempEventsAssign?.map((event) => (
                    <li key={event.eventId}>{event.eventName}</li>
                ))}
            </ul>
        </div>
    </div>
);

const InboxClassificationSection = ({ control, inboxActive, inboxClassification, setValue, onToggle }) => (
    <div>
        <div className="clearfix mt30 mb10">
            <h4 className="m0 float-start">Inbox classification</h4>
            <div className="float-end">
                <RSSwitch
                    control={control}
                    name="inboxSwitch"
                    defaultValue={inboxActive}
                    handleChange={onToggle}
                />
            </div>
        </div>
        <div className={`mb30 mt30 no-box-shadow ${!inboxActive ? 'pe-none click-off' : ''}`}>
            <RSTagsComponent
                isNoOfCharacters={false}
                updatedTags={(tags) => setValue('inboxClassification', tags)}
                tags={inboxClassification}
                isRefresh={inboxClassification.length ? true : false}
            />
        </div>
    </div>
);

const SectionHeader = ({ title, onEdit, tooltipText }) => (
    <div className="clearfix mt30 mb10">
        <i className="icon-md float-start mt-2 mr5"></i>
        <h4 className="m0 float-start">{title}</h4>
        <div className="float-end">
            <RSTooltip text={tooltipText} position="top">
                <i
                    onClick={onEdit}
                    className={`icon-md color-primary-blue float-end mt-2 ${pencil_edit_medium}`}
                    id="rs_data_pencil_edit"
                />
            </RSTooltip>
        </div>
    </div>
);

const ActionButtons = ({ onCancel, showSave = true, isSaveLoading = false }) => (
    <div className="buttons-holder pref-cs-buttons-outside">
        <RSSecondaryButton type="button" onClick={onCancel} blockInteraction={isSaveLoading}>
            {CANCEL}
        </RSSecondaryButton>
        {showSave && (
            <RSPrimaryButton type="submit" isLoading={isSaveLoading} blockBodyPointerEvents>
                {SAVE}
            </RSPrimaryButton>
        )}
    </div>
);

export default WebAppPermission;