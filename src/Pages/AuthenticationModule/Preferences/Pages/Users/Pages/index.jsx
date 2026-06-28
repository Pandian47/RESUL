import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Container, Col, Row } from 'react-bootstrap';

import RSPageHeader from 'Components/RSPageHeader';
import RenderComponent from './Component/RenderComponent/RenderComponent';

import { mainHeading } from './constants';

import { useDispatch, useSelector } from 'react-redux';
const AddUserComponent = () => {
    const dispatch = useDispatch();
    const { clientId, deparmentId, departmentList, company_clientId } = useSelector(({ globalstate }) => globalstate);
    const methods = useForm();
    const location = useLocation();
    const mode = location?.state?.mode;
    const [currentPage, setCurrentPage] = useState('ADDUSER'); // useState('ADDUSER'); // useState('ASSIGNROLE');
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
    return (
        // Contend holder starts
        <FormProvider {...methods}>
            <div className="page-content-holder">
                {/* Main page heading block starts */}
                <RSPageHeader
                    title={`${mode === 'edit' ? 'Edit user' : mainHeading[currentPage]?.main}`}
                    isHeaderLine={true}
                    hideBU={mainHeading[currentPage]?.main === 'Add a new user' || mainHeading[currentPage]?.main === 'Assign role to users' ? true : false}
                    isCompany
                    hideCompany={mainHeading[currentPage]?.main === 'Assign role to users' ? true : false}
                    isAgencyDisabled={false}
                    // isBuDisabled
                    // isAgency
                    isBack
                    backPath="/preferences/users" // As per vinoth feedback and enable client details and disabled. Sanjeev confirm
                    formAssignRole
                />
                {/* Main page heading block ends */}
                {/* Main page content block starts */}
                <Container fluid>
                    <div className="page-content">
                        <Container className="px0">
                            <Row>
                                <Col sm={12}>
                                    {/* <div className="box-design rs-box"> */}
                                    <RenderComponent
                                        currentPage={currentPage}
                                        nextScreen={(screenName) => setCurrentPage(screenName)}
                                        back={(screenName) => setCurrentPage(screenName)}
                                        c_clientId={company_clientId?.clientId}
                                        currentLicenseTypeId={parseInt(location?.state?.licenseTypeId, 10)}
                                    />
                                    {/* </div> */}
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </Container>
                {/* Main page content block ends */}
            </div>
        </FormProvider>
        // Content holder ends
    );
};

export default AddUserComponent;
