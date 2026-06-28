import PropTypes from 'prop-types';

import { useSelector } from 'react-redux';
import AddUser from '../../AddUser';
import AssignRole from '../../AssignRole';
import UserListing from '../UserGrid/UserGrid';

const RenderComponent = ({
    currentPage,
    nextScreen,
    back,
    companies,
    campanyEdit,
    companyBack,
    setCurrentTitle,
    c_clientId,
    isAgencyValue,
    currentLicenseTypeId,
    setCurrentPage,
    onAssignRolePageLoadingChange,
}) => {
    const { company_clientId } = useSelector(({ globalstate }) => globalstate);
    switch (currentPage) {
        case 'ADDUSER':
            return (
                <AddUser
                    companyBack={companyBack}
                    campanyEdit={campanyEdit}
                    currentPage={currentPage}
                    back={(screenName) => {
                        back(screenName);
                    }}
                    nextScreen={(screenName) => {
                        nextScreen(screenName);
                    }}
                    setCurrentTitle={setCurrentTitle}
                    companies={companies}
                    isAgencyValue={isAgencyValue}
                />
            );
        case 'ASSIGNROLE':
            return (
                // <div className="box-design rs-box">
                <AssignRole
                    currentPage={currentPage}
                    nextScreen={(screenName) => {
                        nextScreen(screenName);
                    }}
                    back={(screenName) => {
                        back(screenName);
                    }}
                    c_clientId={c_clientId === undefined ? company_clientId?.clientId : c_clientId}
                    companies={companies}
                    companyBack={companyBack}
                    isAgencyValue={isAgencyValue}
                    currentLicenseTypeId={currentLicenseTypeId}
                    setCurrentPage={setCurrentPage}
                    onAssignRolePageLoadingChange={onAssignRolePageLoadingChange}
                />
                // </div>
            );
        case 'USERGRID':
            return (
                <div className="box-design rs-box">
                    <UserListing
                        nextScreen={(screenName) => {
                            nextScreen(screenName);
                        }}
                        back={(screenName) => {
                            back(screenName);
                        }}
                        companies={companies}
                        isAgencyValue={isAgencyValue}
                    />
                </div>
            );
    }
};
RenderComponent.propTypes = {
    currentPage: PropTypes.string.isRequired,
    nextScreen: PropTypes.func.isRequired,
    back: PropTypes.func,
};
export default RenderComponent;
