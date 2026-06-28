import { getPermissions, getUserDetails } from 'Utils/modules/crypto';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Col, Row } from 'react-bootstrap';
import _find from 'lodash/find';
import _isEmpty from 'lodash/isEmpty';
import RSPageHeader from 'Components/RSPageHeader';
import RSProgressSteps from 'Components/ProgressSteps';

import { MAIN_HEADING, pages, EDIT_MAIN_HEADING, pagesEdit } from '../constants';
import RenderComponent from '../Component/RenderComponent';
import { buildCompanyProgressSteps } from './constant';
import { updateBUByClientCompany, updateCurrentPageConfig, updatedisLicenseId } from 'Reducers/globalState/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import { updateClientDetails } from 'Reducers/preferences/Companies/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { persistCompanyWizardPage } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
const AddCompanies = ({ props }) => {
    
    
    const dispatch = useDispatch();
    const [currentTitle, setCurrentTitle] = useState(MAIN_HEADING);
    const [editCurrentPage, setEditCurrentPage] = useState('');
    const {
        failureApiErrors,
        company_clientId,
        updatedLicenseId,
        clientId: currClient,
        departmentId: currDepartment,
        departmentList,
        currentPageConfig
    } = useSelector(({ globalstate }) => globalstate);
    const queryData = useQueryParams('/dashboard');
    const needBus = queryData?.needBUs && queryData?.fromLogin || false;
    const { isFailure } = useSelector(({ companiesReducer }) => companiesReducer);
    let location;;
    location = !_isEmpty(currentPageConfig) 
    ? currentPageConfig 
    : useLocation();
    const fromUpgrade = location?.state?.upgradeLicense || false
    const upgradedLicenseId = location?.state?.upgradeLicenseId || null
    const [type, setType] = useState('');
    const [currentUserPage, setCurrentUserPage] = useState('ASSIGNROLE');
    const { licenseTypeId } = getUserDetails();

    const { userId, departmentId, clientId, departmentName } = useSelector((state) => getSessionId(state));
    const isEdit = location?.state?.mode === 'edit';
    const permissionList = getPermissions();
    const { viewAccess: userViewAccess} = _find(permissionList, { featureId: 12 });
    const progressSteps = useMemo(() => {
        const stepsList = isEdit && userViewAccess ? pagesEdit() : pages();
        return buildCompanyProgressSteps(stepsList, editCurrentPage);
    }, [editCurrentPage, isEdit, userViewAccess]);
    useEffect(() => {
        if (isEdit) {
            setCurrentTitle(EDIT_MAIN_HEADING);
            setEditCurrentPage(location?.state?.page);
        }
        const page =
            location?.state?.page === 'ACCOUNT_TYPE' ? 'ACCOUNT_TYPE' : location?.state?.page || 'NEW_COMPANY';
        setEditCurrentPage(page);
        persistCompanyWizardPage(page);
    }, []);
    // useEffect(() => {
    //     return () => {
    //         dispatch(
    //             updateBUByClientCompany({
    //                 company_clientId: clientId,
    //                 company_departmentId: deparmentId,
    //                 company_departmentList: departmentList,
    //             }),
    //         );
    //     };
    // }, []);
    //     const getBuByClient = async(currClientId, currDepId) => {
    //         let fromCompanies = true;
    //         const result = await dispatch(getBUList({ userId, clientId:currClientId }, location?.state?.currClient, false, currDepId, fromCompanies));

    //     }
    // useEffect(() => {
    //     return () => {
    //         //dispatch(updateBUByClientCompany({ company_departmentId: company_departmentList?.[0] }));
    //         if(location?.state?.currClientId && location?.state?.currClientId !== clientId){
    //             getBuByClient(location?.state?.currClientId , location?.state?.currDepartmentId)
    //         }
    //     };
    // },[])
    const latestCompanyClientId = useRef(company_clientId);
    useEffect(() => {
        latestCompanyClientId.current = company_clientId;
    }, [company_clientId]);
    useEffect(() => {
        return () => {
            //dispatch(updateBUByClientCompany({ company_departmentId: company_departmentList?.[0] }));
            if (
                latestCompanyClientId?.current?.clientId !== currClient?.clientId &&
                updatedLicenseId !== Number(licenseTypeId)
            ) {
                dispatch(updatedisLicenseId(Number(licenseTypeId)));
            }
            if (updatedLicenseId === 3 && latestCompanyClientId?.current?.clientId !== currClient?.clientId) {
                dispatch(
                    updateBUByClientCompany({
                        company_departmentId: currDepartment,
                        company_clientId: currClient,
                        company_departmentList: [
                            { clientId: currClient?.clientId, departmentId: 0, departmentName: 'All' },
                            ...departmentList,
                        ],
                    }),
                );
            }
            dispatch(updateCurrentPageConfig({}));
            dispatch(updateClientDetails({}));
        };
    }, []);
    const isLicenseType = location?.state?.page === 'ACCOUNT_TYPE' && editCurrentPage === 'ACCOUNT_TYPE';
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title={currentTitle[editCurrentPage]?.main}
                isBack={!needBus}
                isCompany
                isAgencyDisabled={currentTitle[editCurrentPage]?.main === 'Add a new user'}
                hideCompany={
                    //currentTitle[editCurrentPage]?.main === 'Add a new user' ||
                    currentTitle[editCurrentPage]?.main === 'Select license type' ||
                    currentTitle[editCurrentPage]?.main === 'Add a new company account' ||
                    currentTitle[editCurrentPage]?.main === 'Edit company account' ||
                    currentTitle[editCurrentPage]?.main === 'Localization settings' ||
                    currentTitle[editCurrentPage]?.main === 'Assign role to users' ||
                    Number(location?.state?.licenseTypeId) !== 3
                        ? true
                        : false
                }
                hideBU={
                    currentTitle[editCurrentPage]?.main === 'Add a new user' ||
                    currentTitle[editCurrentPage]?.main === 'Select license type' ||
                    currentTitle[editCurrentPage]?.main === 'Add a new company account' ||
                    currentTitle[editCurrentPage]?.main === 'Edit company account' ||
                    currentTitle[editCurrentPage]?.main === 'Localization settings' ||
                    currentTitle[editCurrentPage]?.main === 'Assign role to users' ||
                    currentUserPage === 'USERGRID' ||
                    Number(location?.state?.licenseTypeId) !== 3
                        ? true
                        : false
                }
                backPath={'/preferences/company-list'}
                // rightCommonMenus={
                //     currentTitle[editCurrentPage]?.main === 'Assign role to users' ||
                //     currentTitle[editCurrentPage]?.main === 'Add a new user'
                //         ? true
                //         : false
                // }
                // isBuDisabled={currentTitle[editCurrentPage]?.main === 'Add a new user' ? true : false}
                //    rightCommonMenus={currentTitle[editCurrentPage]?.main === 'Add a new user' ? true : false}
                //  isAgencyDisabled
                // isBuDisabled={currentTitle[editCurrentPage]?.main === 'Add a new user' ? false : true}
            />
            {/* Main page heading block ends */}
            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <Row className="mt21">
                            <Col sm={12}>
                                {!isLicenseType && <RSProgressSteps customSteps={progressSteps} />}
                                <RenderComponent
                                    isEdit={true}
                                    currentPage={editCurrentPage}
                                    type={type}
                                    clientId={location?.state?.clientId}
                                    setCurrentTitle={setCurrentTitle}
                                    setCurrentUserPage={setCurrentUserPage}
                                    nextScreen={(screenName, type) => {
                                        screenName = ['KEY_INFO', 'LICENSE_TYPE'].includes(screenName)
                                            ? 'NEW_COMPANY'
                                            : screenName;
                                        if (isEdit && screenName === 'LOCALIZATION_SETTINGS')
                                            screenName = 'COMPANY_LOCALIZATION';
                                        dispatch(updateCurrentPageConfig({state: {...currentPageConfig?.state, page: screenName}}));
                                        setEditCurrentPage(screenName);
                                        persistCompanyWizardPage(screenName);
                                        if (type?.length) setType(type);
                                    }}
                                    back={(screenName, type) => {
                                        setEditCurrentPage(screenName);
                                        persistCompanyWizardPage(screenName);
                                        dispatch(updateCurrentPageConfig({state: {...currentPageConfig?.state, page: screenName}}));
                                        if (type === '') setType(type);
                                    }}
                                    currentLicenseTypeId={parseInt(location?.state?.licenseTypeId, 10)}
                                    fromCompanies={true}
                                    fromLicenseUpgrade={fromUpgrade}
                                    upgradedLicenseId={upgradedLicenseId}
                                />
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

export default AddCompanies;
