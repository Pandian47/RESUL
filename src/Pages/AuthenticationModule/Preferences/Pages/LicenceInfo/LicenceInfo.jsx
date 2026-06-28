
import { eye_hide_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RSPageHeader from 'Components/RSPageHeader';
import { Container, Row , Col } from 'react-bootstrap';
import { getLicenseInfo, getLicenceKey, GetClientPaymentDetails } from 'Reducers/preferences/Licence/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';

import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { PREFERENCES_SUBPAGE_VARIANT } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import SubscriptionPlans from './Components/SubscriptionPlans';
import {
    updateCurrentPageConfig,
} from 'Reducers/globalState/reducer';
import RSTooltip from 'Components/RSTooltip';
import { maskEmailTwoCharsBeforeAndAfterDomain, maskPhoneTwoDigitsInMiddle } from 'Utils/modules/masking';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { SpinnerLoader } from 'Components/Skeleton/Components/common';

const LicenseInfo = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { clientId, departmentId, userId, isAgency } = useSelector((state) => getSessionId(state));
    const [responseData, setResponseData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // License key visibility state
    const [showLicenseKey, setShowLicenseKey] = useState(false);
    const [licenseKeyValue, setLicenseKeyValue] = useState('');
    const [showOTPModal, setShowOTPModal] = useState(false);

    // Subscription plans modal state
    const [showPlansModal, setShowPlansModal] = useState(false);
    const licenseKeyLoader = useApiLoader({ autoFetch: false });
    const paymentLoader = useApiLoader({ autoFetch: false });
    const isLicenseKeyLoading = licenseKeyLoader.isLoading;
    const isPaymentLoading = paymentLoader.isLoading;
    const [loadingPlanName, setLoadingPlanName] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const payload = {
                    clientId: clientId,
                };
                const responseData = await dispatch(getLicenseInfo({ payload }));
                setResponseData(responseData.data);
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [clientId]);

    // Handle eye icon click - open OTP modal or hide license key
    const handleShowLicenseKeyClick = () => {
        if (isLicenseKeyLoading) return;

        if (showLicenseKey) {
            // If already showing, hide it
            setShowLicenseKey(false);
            setLicenseKeyValue('');
            return;
        }

        // Open OTP modal
        setShowOTPModal(true);
    };

    // Handle OTP verification success - call GetLicenceKey API
    const handleOTPSuccess = () => {
        setShowOTPModal(false);
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        licenseKeyLoader.refetch({
            fetcher: () => dispatch(getLicenceKey({ payload, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
            onSuccess: (response) => {
                if (response?.data?.licenseKey || response?.licenseKey) {
                    setLicenseKeyValue(response?.data?.licenseKey || response?.licenseKey);
                    setShowLicenseKey(true);
                }
            },
        });
    };

    // Close OTP modal
    const handleCloseModal = () => {
        setShowOTPModal(false);
    };

    // Handle Discover Subscription Plans click
    const handleDiscoverPlans = () => {
        setShowPlansModal(true);
    };

    // Map plan names to API values
    const getPlanApiValue = (planName) => {
        const planMap = {
            Professional: 'Pro',
            Enterprise: 'Ent',
        };
        return planMap[planName] || planName.toLowerCase();
    };

    // Handle plan selection - call UpgradeAccount API for Professional plan
    const handlePlanSelect = (planName) => {
        const isProfessional = planName.toLowerCase() === 'professional' || planName.toLowerCase() === 'pro';
        if (isProfessional) {
            if (isPaymentLoading) return;

            const upgradePayload = {
                Upgradefrom: responseData?.licenseType?.toLowerCase() || '',
                Upgrade: getPlanApiValue(planName),
                clientId: clientId,
                userId: userId,
                isAgency: isAgency || false,
            };

            setLoadingPlanName(planName);
            paymentLoader.refetch({
                fetcher: () =>
                    dispatch(
                        GetClientPaymentDetails(
                            {
                                payload: {
                                    clientId: upgradePayload.clientId,
                                    LicensingTypeID: responseData?.licensetypeId,
                                    userId,
                                },
                                loading: false,
                            },
                            navigate,
                            upgradePayload,
                        ),
                    ),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
                onSettled: () => setLoadingPlanName(null),
            });
            return;
        }

        setShowPlansModal(false);
        const state = {
            mode: 'create',
            page: 'NEW_COMPANY',
            upgradeLicense: true,
            upgradeLicenseId: 3,
        };
        navigate('/preferences/company-list/add-companies', {
            state: state,
        });
        dispatch(updateCurrentPageConfig({ state: state }));
    };

    return (
        // Contend holder starts
        <div className="page-content-holder rs-licence-info-wrapper">
            {/* Main page heading block starts */}
            <RSPageHeader title="License info" isBack backPath="/preferences" isHeaderLine rightCommonMenus hideBU />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <div className="mt30">
                        <PreferencesSubPageSkeletonGate
                            variant={PREFERENCES_SUBPAGE_VARIANT.LICENSE_INFO}
                            isLoading={isLoading}
                            className="rs-licence-info-wrapper"
                            ariaLabel="Loading license info"
                        >
                                <div className="box-design p0">
                                    <h4 className="border-bottom mb0 pb13 pt19 px19">Account information</h4>

                                    <div className="account-info">
                                        <div className="d-flex gap-4">
                                            {/* Column 1 */}
                                            <div className="flex-1">
                                                <div className="info-row">
                                                    <span className="label fs-14">Key contact person</span>
                                                    <span className="value">{responseData?.firstName}</span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="label fs-14">Mobile number</span>
                                                    <span className="value">
                                                        {maskPhoneTwoDigitsInMiddle(responseData?.phoneNo)}
                                                    </span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="label fs-14">Email</span>
                                                    <span className="value">
                                                        {maskEmailTwoCharsBeforeAndAfterDomain(responseData?.emailId)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Column 2 */}
                                            <div className="flex-1">
                                                <div className="info-row">
                                                    <span className="label fs-14">Start date</span>
                                                    <span className="value">
                                                        {responseData?.startDate}
                                                    </span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="label fs-14">End date</span>
                                                    <span className="value"> {responseData?.endDate}</span>
                                                </div>

                                                <div className="info-row">
                                                    <span className="label fs-14">Subscription type</span>
                                                    <span className="value">{responseData?.subscriptionType}</span>
                                                </div>
                                            </div>

                                            {/* Column 3 */}
                                            <div className="flex-1">
                                                <div className="info-row">
                                                    <span className="label fs-14">License key</span>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`value ${showLicenseKey ? '' : 'position-relative top5'}`}>
                                                            {showLicenseKey
                                                                ? licenseKeyValue
                                                                : maskingString(
                                                                    responseData?.licenseKey,
                                                                    0,
                                                                    responseData?.licenseKey?.length || 0,
                                                                )}
                                                        </span>
                                                       <RSTooltip
                                                            text={
                                                                isLicenseKeyLoading
                                                                    ? 'Loading...'
                                                                    : showLicenseKey
                                                                      ? 'Hide license key'
                                                                      : 'Show license key'
                                                            }
                                                            className={'lh0'}
                                                            position="top"
                                                        >
                                                            <span
                                                                className={`d-inline-flex align-items-center justify-content-center icon-md lh0 ${
                                                                    isLicenseKeyLoading ? 'pe-none click-off' : 'cp'
                                                                }`}
                                                                onClick={
                                                                    isLicenseKeyLoading
                                                                        ? undefined
                                                                        : handleShowLicenseKeyClick
                                                                }
                                                            >
                                                                {isLicenseKeyLoading ? (
                                                                    <SpinnerLoader ariaLabel="Loading license key" />
                                                                ) : (
                                                                    <i
                                                                        className={`${
                                                                            showLicenseKey
                                                                                ? eye_medium
                                                                                : eye_hide_medium
                                                                        } icon-md ${
                                                                            showLicenseKey
                                                                                ? 'color-primary-blue'
                                                                                : 'color-primary-grey'
                                                                        }`}
                                                                    />
                                                                )}
                                                            </span>
                                                        </RSTooltip>
                                                    </div>
                                                </div>

                                                <div className="info-row">
                                                    <span className="label fs-14">Current plan</span>
                                                    <span className="value">{responseData?.licenseType}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="label fs-14">Payment Due</span>
                                                    <span className="value">{responseData?.paymentDue}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {responseData?.licenseType !== 'Enterprise' && (
                                    <div className="buttons-holder gap-0 justify-content-end">
                                        <RSSecondaryButton onClick={handleDiscoverPlans}>
                                            Discover subscription plans
                                        </RSSecondaryButton>
                                        {/* <RSPrimaryButton onClick={handleDiscoverPlans}>Upgrade</RSPrimaryButton> */}
                                    </div>
                                )}
                        </PreferencesSubPageSkeletonGate>
                        </div>
                    </Container>
                </div>
            </Container>
            {showPlansModal && (
                <Container fluid>
                    <div className='page-content'>
                        <Container className="my30 px0">
                            <Row>
                                <Col sm={12}>
                                    <SubscriptionPlans
                                        onPlanSelect={handlePlanSelect}
                                        currentPlan={responseData?.licenseType}
                                        lisenceId={responseData?.licensetypeId}
                                        isPaymentLoading={isPaymentLoading}
                                        loadingPlanName={loadingPlanName}
                                    />
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Container>
            )}
            {/* Main page content block ends */}

            {/* OTP Modal using DownloadCSV component */}
            <DownloadCSV
                show={showOTPModal}
                handleClose={handleCloseModal}
                title="Verify OTP to view License Key"
                onSuccess={handleOTPSuccess}
                requestOtpExtraPayload={{
                    requestfrom: 'licensekey',
                }}
            />

            {/* Subscription Plans Modal */}
            {/* <SubscriptionPlans
                show={showPlansModal}
                handleClose={() => setShowPlansModal(false)}
                onPlanSelect={handlePlanSelect}
                currentPlan={responseData?.licenseType}
                lisenceId={responseData?.licensetypeId}
            /> */}
        </div>
        // Content holder ends
    );
};

export default LicenseInfo;
