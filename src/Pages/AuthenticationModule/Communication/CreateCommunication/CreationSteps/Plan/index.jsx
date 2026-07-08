import { CHOOSE_DELIVERY_METHOD, DELIVERY_METHOD, SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSPageHeader from 'Components/RSPageHeader';
import RSTabbar from 'Components/RSTabber';
import RSProgressSteps from 'Components/ProgressSteps';
import {
    COMMUNICATION_CREATION_SKELETON_PHASE,
    CommunicationCreationPlanLoadingBlock,
    getCommunicationCreationSkeletonPhase,
    getDeliverySkeletonTypeFromTab,
} from 'Components/Skeleton/pages/communication/creation';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import useQueryParams from 'Hooks/useQueryParams';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { get as _get, isNil as _isNil } from 'Utils/modules/lodashReplacements';

import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { resetSmartLink } from 'Reducers/communication/createCommunication/smartlink/reducer';
import {
    resetCommunicationPlan,
    updateCommunicationData,
    updateSaveChannelsId,
} from 'Reducers/communication/createCommunication/plan/reducer';
import { getSessionId } from 'Reducers/globalState/selector';

import { DELIVERY_TYPE_TAB_CONFIG, planningSteps } from './constants';

const EMPTY_QUERY_STATE = {};

const Planning = ({ permissions }) => {
    // Selectors
    const navigate = useNavigate();
    const location = useLocation();
    const navigationState = location?.state || {};
    const dispatch = useDispatch();
    const state = useQueryParams('/communication') || EMPTY_QUERY_STATE;
    const { addAccess } = permissions || {};
    const editState = useSelector((reduxState) => reduxState?.communicationPlanReducer?.editState) || state;
    const isEditMode = editState?.mode === 'edit' || _get(state, 'mode', '') === 'edit';
    const planSkeletonPhase = getCommunicationCreationSkeletonPhase(location?.search);
    const hasEditQuery = planSkeletonPhase === COMMUNICATION_CREATION_SKELETON_PHASE.DELIVERY;
    const sessionData = useSelector((reduxState) => getSessionId(reduxState)) ?? {};
    const { licenseTypeId } = getUserDetails() || {};
    const { departmentName } = sessionData;

    // Refs
    const { isMounted } = useComponentWillUnmount();

    // State
    const [currentTab, setCurrentTab] = useState(
        state?.mode === 'edit' ? state?.currentTab || editState?.currentTab : null,
    );
    const [config_Tab, setConfig_tab] = useState(DELIVERY_TYPE_TAB_CONFIG);
    const [confirmationModal, setConfimrationModal] = useState(false);

    const hasSelectedDeliveryTab = !_isNil(currentTab);

    const showEditPlanSkeleton = hasEditQuery && isEditMode && !hasSelectedDeliveryTab;

    const getDisable = (cond) => {
        if (!isMounted.current) return;
        setConfimrationModal(!!cond);
        const temp = [...config_Tab].map((e) => ({
            ...e,
            disable: !!cond,
        }));
        setConfig_tab(temp);
    };

    // Effects
    useEffect(() => {
        if (!addAccess) {
            // navigate('/dashboard');
            const encryptState = encodeUrl({ index: 0 });
            (`${'/dashboard'}?q=${encryptState}`, {
                state: {
                    index: 0,
                },
            });
            return;
        }
    }, [addAccess, navigate]);

    useEffect(() => {
        if (_get(state, 'mode') === 'edit') {
            const tab = _get(state, 'currentTab', '');
            if (!isMounted.current) return;
            setCurrentTab(tab);
            dispatch(updateCommunicationData({ field: 'editState', data: state }));
            if (state?.savedChannelsId) {
                dispatch(updateSaveChannelsId(state.savedChannelsId));
            }
        }
    }, [state?.mode, state?.currentTab, state?.savedChannelsId]);

    useEffect(() => {
        if (_get(state, 'mode') === 'edit') return;
        dispatch(resetCommunicationPlan());
        setConfig_tab(DELIVERY_TYPE_TAB_CONFIG);
    }, []);


    useEffect(() => {
        dispatch(resetSmartLink());
        if (licenseTypeId == '3' && departmentName?.toLowerCase() === 'all') {
            getDisable(1);
        } else {
            getDisable(0);
        }
    }, [licenseTypeId, departmentName]);

    // Handlers
    const handleProgress = () => hasSelectedDeliveryTab;

    const handlePlanRefresh = () => {
        dispatch(resetCommunicationPlan());
        setCurrentTab(null);
    };

    const handleConfirmationClose = () => {
        if (!isMounted.current) return;
        setConfimrationModal(false);
    };

    const handleTabChange = (_, currentIndex) => {
        if (!isMounted.current) return;
        setCurrentTab(currentIndex);
    };

    // JSX
    return (
        <div className="page-content-holder">
            <RSPageHeader
                title="Communication creation"
                isHeaderLine
                rightCommonMenus
                isAgencyDisabled={hasSelectedDeliveryTab}
                isBuDisabled={hasSelectedDeliveryTab}
                isBack={!hasSelectedDeliveryTab}
                backPath="/communication"
                state={{
                    index:
                        navigationState?.current === 'gallery'
                            ? 1
                            : navigationState?.current === 'communication'
                              ? 0
                              : navigationState?.current === 'planner'
                                ? 2
                                : 0,
                }}
            />

            <Container fluid>
                <div className="page-content">
                    <Container className="px0 d-grid">
                        <div className="planning-layout">
                            {/*
                             * RSProgressSteps: animate height + opacity so the space it
                             * occupies expands/collapses smoothly instead of the element
                             * being removed from the DOM instantly (which caused the jerk).
                             */}
                            <AnimatePresence initial={false}>
                                {handleProgress() && (
                                    <motion.div
                                        key="progress-steps"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="d-flex justify-content-center">
                                            <RSProgressSteps stepsData={planningSteps} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="communication-create clearfix">
                                {showEditPlanSkeleton ? (
                                    <CommunicationCreationPlanLoadingBlock
                                        phase={COMMUNICATION_CREATION_SKELETON_PHASE.DELIVERY}
                                        deliveryType={getDeliverySkeletonTypeFromTab(_get(state, 'currentTab'))}
                                        activeTabIndex={
                                            typeof _get(state, 'currentTab') === 'number' ? _get(state, 'currentTab') : 0
                                        }
                                    />
                                ) : (
                                    <div className="rs-camp-tabs-holder">
                                        <RSTabbar
                                            dynamicTab={`rs-content-tabs dm-tabs ${
                                                hasSelectedDeliveryTab ? 'col-sm-9 no-border-bottom' : ''
                                            }`}
                                            activeClass="active"
                                            tabData={config_Tab}
                                            cTabsBig
                                            isCreateCommunication={true}
                                            defaultTab={currentTab}
                                            isHeadingBlock
                                            heading={
                                                hasSelectedDeliveryTab ? DELIVERY_METHOD : CHOOSE_DELIVERY_METHOD
                                            }
                                            refresh={!isEditMode}
                                            isRefreshConfirmation
                                            onRefresh={handlePlanRefresh}
                                            disableOtherTabs
                                            callBack={handleTabChange}
                                            leftspace
                                            deliverytext_center={true}
                                            extraClassName="row"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Container>
                </div>
            </Container>
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={handleConfirmationClose}
                handleConfirm={handleConfirmationClose}
                secondaryButton={false}
            />
        </div>
    );
};

export default Planning;
