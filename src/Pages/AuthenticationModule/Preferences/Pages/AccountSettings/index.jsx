import { getPermissions, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { NO_DATA_AVAILABEL } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useMemo, useState } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import { find as _find, isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';

import RSPageHeader from 'Components/RSPageHeader';
import RSProgressSteps from 'Components/ProgressSteps';

import { MAIN_HEADING, pages, EDIT_MAIN_HEADING, pagesEdit } from '../Companies/constants';
import RenderComponent from '../Companies/Component/RenderComponent';
import { buildCompanyProgressSteps } from '../Companies/AddCompanies/constant';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getCompanyClientDetails } from 'Reducers/preferences/Companies/request';
import { getDepartmentLimit } from 'Reducers/preferences/accountSettings/request';
import { getCrossBUStatus } from 'Reducers/communication/createCommunication/Create/request';
import { updateCurrentPageConfig } from 'Reducers/globalState/reducer';
import { updateClientDetails } from 'Reducers/preferences/Companies/reducer';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import { persistCompanyWizardPage, resolveCompanyFlowSkeletonVariant } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
const AccountSettings = ({ props }) => {
    const { licenseTypeId, isEnterprisePlus, isAgency, clientId: agencyClientId } = getUserDetails();
    const { company_clientId, currentPageConfig } = useSelector(({ globalstate }) => globalstate);
    const { userId, departmentId, clientId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const dispatch = useDispatch();

    const defaultPage = 'NEW_COMPANY';
    const location = !_isEmpty(currentPageConfig)
        ? {
              ...currentPageConfig,
              state: {
                  clientId,
                  mode: 'edit',
                  clientName: '',
                  licenseTypeId,
                  ...currentPageConfig?.state,
                  page: currentPageConfig?.state?.page || defaultPage,
              },
          }
        : {
              state: {
                  clientId,
                  mode: 'edit',
                  clientName: '',
                  licenseTypeId: licenseTypeId,
                  page: defaultPage,
              },
          };

    const [currentTitle, setCurrentTitle] = useState(MAIN_HEADING);
    const [editCurrentPage, setEditCurrentPage] = useState('NEW_COMPANY');
    const [type, setType] = useState('');
    const [isLicenseType, setIsLicenseType] = useState(1);
    const [currentUserPage, setCurrentUserPage] = useState('ASSIGNROLE');
    const isEdit = location?.state?.mode === 'edit';

    const accountApi = usePreferencesSubPageApi({
        mode: 'edit',
        deps: [agencyClientId, clientId, userId, isAgency, licenseTypeId],
        fetcher: async () => {
            const detailsPayload = {
                clientId: isAgency ? agencyClientId : clientId,
                userId,
                departmentId: 0,
            };
            const crossBUPayload = { clientId, departmentId, userId };
            const licenseId = Number(licenseTypeId);
            const isEnterpriseEdit = licenseId === 3;
            const shouldFetchDepartmentLimit = isEnterpriseEdit && !isAgency;

            const requests = [
                dispatch(
                    getCompanyClientDetails({ payload: detailsPayload, isAgency, loading: false }),
                ),
                dispatch(getCrossBUStatus({ payload: crossBUPayload, loading: false })),
            ];

            if (shouldFetchDepartmentLimit) {
                requests.push(
                    dispatch(
                        getDepartmentLimit({
                            payload: {
                                licenseTypeId: licenseId,
                                licenseFeatureId: 40,
                            },
                            loading: false,
                        }),
                    ),
                );
            }

            const [clientRes, crossBURes, departmentLimitRes] = await Promise.all(requests);

            if (!clientRes?.status) {
                throw new Error(clientRes?.message || NO_DATA_AVAILABEL);
            }

            setIsLicenseType(clientRes?.data?.clientBranchTypeId);

            return { clientRes, crossBURes, departmentLimitRes };
        },
    });

    const showAccountCompanySkeleton =
        editCurrentPage === 'NEW_COMPANY' || editCurrentPage === 'ACCOUNT_TYPE';
    const showAccountNoData = accountApi.isError;
    const showAccountSkeleton =
        showAccountCompanySkeleton && (accountApi.isPageLoading || showAccountNoData);
    const permissionList = getPermissions();
    const { viewAccess: userViewAccess} = _find(permissionList, { featureId: 12 });
    const showProgressSteps = isAgency || (!isEnterprisePlus && licenseTypeId !== 3);
    const progressSteps = useMemo(() => {
        const stepsList = isEdit && userViewAccess ? pagesEdit() : pages();
        return buildCompanyProgressSteps(stepsList, editCurrentPage);
    }, [editCurrentPage, isEdit, userViewAccess]);
    useEffect(() => {
        const page = location?.state?.page || defaultPage;
        if (isEdit) {
            setCurrentTitle(EDIT_MAIN_HEADING);
        }
        const resolvedPage = page === 'ACCOUNT_TYPE' ? 'ACCOUNT_TYPE' : page;
        setEditCurrentPage(resolvedPage);
        persistCompanyWizardPage(resolvedPage);
        let LocationState = {
            clientId,
            mode: 'edit',
            clientName: '',
            licenseTypeId: licenseTypeId,
            page: 'NEW_COMPANY',
            isEnterprisePlus: isEnterprisePlus,
        }
        if(_isEmpty(currentPageConfig)){
            dispatch(updateCurrentPageConfig({state: LocationState}));
        }
    }, []);

    // const isLicenseType = location?.state?.page === 'ACCOUNT_TYPE' && editCurrentPage === 'ACCOUNT_TYPE';
    // console.log('currentTitle[editCurrentPage]?.main: ', currentTitle[editCurrentPage]?.main);

    useEffect(() => {
        return () => { 
            dispatch(updateCurrentPageConfig({}));
            dispatch(updateClientDetails({}));
        }
    }, [])
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={currentTitle[editCurrentPage]?.main}
                isBack
                backPath={'/preferences'}
                isCompany
                hideCompany={currentTitle[editCurrentPage]?.main === 'Edit company account' || isAgency ? true : false}
                hideBU={
                    currentTitle[editCurrentPage]?.main === 'Add a user' ||
                    currentTitle[editCurrentPage]?.main === 'Edit company account' ||
                    currentTitle[editCurrentPage]?.main === 'Localization settings' ||
                    currentTitle[editCurrentPage]?.main === 'Assign role to users' ||
                    currentUserPage === 'USERGRID' ||
                    isAgency ||
                    licenseTypeId !== '3'
                        ? true
                        : false
                }
                isAccountSettings
            />
            {/* Main page heading block ends */}
                {/* Main page content block starts */}
                <Container fluid>
                    <div className="page-content">
                        <Container className="px0">
                            <Row>
                                <Col sm={12}>
                                    {showProgressSteps && <RSProgressSteps customSteps={progressSteps} />}
                                    <PreferencesSubPageSkeletonGate
                                        variant={resolveCompanyFlowSkeletonVariant(editCurrentPage)}
                                        isLoading={showAccountSkeleton}
                                        showNoData={showAccountNoData && showAccountCompanySkeleton}
                                    >
                                    <RenderComponent
                                        isEdit={true}
                                        currentPage={editCurrentPage || defaultPage}
                                        type={type}
                                        isAgencyValue={isAgency}
                                        clientId={company_clientId?.clientId}
                                        setCurrentUserPage={setCurrentUserPage}
                                        nextScreen={(screenName, type) => {
                                            screenName = ['KEY_INFO', 'LICENSE_TYPE'].includes(screenName)
                                                ? 'NEW_COMPANY'
                                                : screenName;
                                            if (isEdit && screenName === 'LOCALIZATION_SETTINGS')
                                                screenName = 'COMPANY_LOCALIZATION';
                                            setEditCurrentPage(screenName);
                                            persistCompanyWizardPage(screenName);
                                            dispatch(updateCurrentPageConfig({state: {...currentPageConfig?.state, page: screenName}}));
                                            if (type?.length) setType(type);
                                        }}
                                        back={(screenName, type) => {
                                            //console.log('check acc:::: ', screenName);
                                            setEditCurrentPage(screenName);
                                            persistCompanyWizardPage(screenName);
                                            dispatch(updateCurrentPageConfig({state: {...currentPageConfig?.state, page: screenName}}));
                                            if (type === '') setType(type);
                                        }}
                                        setEditCurrentPage={setEditCurrentPage}
                                        currentLicenseTypeId={parseInt(location?.state?.licenseTypeId, 10)}
                                        fromAccountSettings={true}
                                        accountBootstrap={accountApi.data}
                                        setCurrentTitle={setCurrentTitle}
                                    />
                                    </PreferencesSubPageSkeletonGate>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Container>
            {/* Main page content block ends */}
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </div>
        // Content holder ends
    );
};

export default AccountSettings;
