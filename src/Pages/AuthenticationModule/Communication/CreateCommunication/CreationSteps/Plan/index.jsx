import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { CHOOSE_DELIVERY_METHOD, DELIVERY_METHOD, SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import _isNil from 'lodash/isNil';
import _get from 'lodash/get';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    COMMUNICATION_CREATION_SKELETON_PHASE,
    CommunicationCreationPlanLoadingBlock,
    getCommunicationCreationSkeletonPhase,
    getDeliverySkeletonTypeFromTab,
} from 'Components/Skeleton/pages/communication/creation';
import RSProgressSteps from 'Components/ProgressSteps';
import RSTabbar from 'Components/RSTabber';
import RSPageHeader from 'Components/RSPageHeader';
import { resetSmartLink } from 'Reducers/communication/createCommunication/smartlink/reducer';

import { planningSteps, DELIVERY_TYPE_TAB_CONFIG } from './constants';
import { resetCommunicationPlan, updateCommunicationData, updateSaveChannelsId } from 'Reducers/communication/createCommunication/plan/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';

import RSConfirmationModal from 'Components/ConfirmationModal';

const Planning = ({ permissions }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const navigationState = location.state || {};
    // console.log('navigationState: ', navigationState);
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const { addAccess } = permissions || {};
    const editState = useSelector((state) => state.communicationPlanReducer?.editState) || state;
    const isEditMode = editState?.mode === 'edit' || _get(state, 'mode', '') === 'edit';
    const planSkeletonPhase = getCommunicationCreationSkeletonPhase(location.search);
    const hasEditQuery = planSkeletonPhase === COMMUNICATION_CREATION_SKELETON_PHASE.DELIVERY;

    // Initialize currentTab based on editState
    const [currentTab, setCurrentTab] = useState(
        state?.mode === 'edit' ? state?.currentTab || editState.currentTab : null
    );
    const showEditPlanSkeleton = hasEditQuery && isEditMode && _isNil(currentTab);
    const { ...rest } = useSelector((state) => getSessionId(state));
    const { licenseTypeId } = getUserDetails();
    const [config_Tab, setConfig_tab] = useState(DELIVERY_TYPE_TAB_CONFIG);
    const [confirmationModal, setConfimrationModal] = useState(false);

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
            setCurrentTab(tab);
            dispatch(updateCommunicationData({ field: 'editState', data: state }));
            if (state.savedChannelsId) {
                dispatch(updateSaveChannelsId(state.savedChannelsId));
            }
        } else {
            setCurrentTab(null);
            dispatch(resetCommunicationPlan());
            setConfig_tab(DELIVERY_TYPE_TAB_CONFIG);
        }
    }, [state]);

    useEffect(() => {
        const currentPath = window.location.pathname;

        return () => {
            if (currentPath !== '/communication/create-communication') {
                // dispatch(resetCommunicationPlan());
            }
        }
    }, []);

    const getDisable = (cond) => {
        setConfimrationModal(!!cond);
        let temp = [...config_Tab].map((e, i) => {
            return {
                ...e,
                disable: !!cond,
            };
        });
        setConfig_tab(temp);
    };

    useEffect(() => {
        dispatch(resetSmartLink());
        if (licenseTypeId == '3' && rest?.departmentName?.toLowerCase() === 'all') {
            getDisable(1);
        } else {
            getDisable(0);
        }
    }, [licenseTypeId, rest?.departmentName]);

    const handleProgress = () => {
        return currentTab !== null || (state?.currentTab && currentTab);
    };

    const handlePlanRefresh = () => {
        dispatch(resetCommunicationPlan());
        setCurrentTab(null);
    };


    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="Communication creation"
                isHeaderLine
                rightCommonMenus
                isAgencyDisabled={currentTab !== null}
                isBuDisabled={currentTab !== null}
                isBack={_isNil(currentTab)}
                backPath="/communication"
                state={{
                    index:
                        navigationState.current === 'gallery'
                            ? 1
                            : navigationState.current === 'communication'
                                ? 0
                                : navigationState.current === 'planner'
                                    ? 2
                                    : 0,
                }}
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className='page-content'>
                    <Container className="px0 d-grid">
                        <div className="planning-layout">
                            {handleProgress() ? <RSProgressSteps stepsData={planningSteps} /> : null}
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
                                            dynamicTab={`rs-content-tabs dm-tabs ${currentTab !== null || (state?.currentTab && currentTab)
                                                    ? 'col-sm-9 no-border-bottom'
                                                    : ''
                                                }`}
                                            activeClass={`active`}
                                            tabData={config_Tab}
                                            cTabsBig
                                            isCreateCommunication={true}
                                            defaultTab={currentTab}
                                            isHeadingBlock
                                            heading={
                                                _isNil(currentTab) && _isNil(state?.currentTab && currentTab ? currentTab : null)
                                                    ? CHOOSE_DELIVERY_METHOD
                                                    : DELIVERY_METHOD
                                            }
                                            refresh={!isEditMode}
                                            isRefreshConfirmation
                                            onRefresh={handlePlanRefresh}
                                            disableOtherTabs
                                            callBack={(_, currentIndex) => setCurrentTab(currentIndex)}
                                            leftspace
                                            deliverytext_center={true}
                                            extraClassName={'row'}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Container>
                </div>
            </Container>
            {/* Main page content block ends */}
            <RSConfirmationModal
                show={confirmationModal}
                text={SELECT_BU}
                handleClose={() => {
                    setConfimrationModal(false);
                }}
                handleConfirm={() => {
                    setConfimrationModal(false);
                }}
                secondaryButton={false}
            />
        </div>
        // Content holder ends
    );
};

export default Planning;
