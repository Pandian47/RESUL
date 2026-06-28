import PropTypes from 'prop-types';
import CompanyInfo from 'Pages/AuthenticationModule/Preferences/Pages/Companies/AddCompanies/Tabs/CompanyInfo.jsx';
import LocalizationSettings from 'Pages/RegistrationModule/Login/Component/LocalizationSettings';
import AssignRole from 'Pages/AuthenticationModule/Preferences/Pages/Companies/AddCompanies/Tabs/UserCreation.jsx';
import CompaniesLocalization from 'Pages/AuthenticationModule/Preferences/Pages/Companies/AddCompanies/Tabs/LocalizationSettings/localizationSettings.jsx';
import Licensetype from 'Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseType';
import AddUser from '../../../Users/Pages/AddUser';

const RenderComponent = ({
    currentPage,
    nextScreen,
    back,
    type,
    isEdit,
    setCurrentTitle,
    clientId,
    isAgencyValue,
    currentLicenseTypeId,
    fromAccountSettings = false,
    accountBootstrap = null,
    fromCompanies = false,
    setCurrentUserPage,
    fromLicenseUpgrade = false,
    upgradedLicenseId = null
}) => {
    // console.log('clientId: @@@@', clientId);
    switch (currentPage) {
        case 'NEW_COMPANY':
            return (
                <CompanyInfo
                    type={type}
                    nextScreen={(screenName) => nextScreen(screenName)}
                    back={(screenName, type) => back(screenName, type)}
                    currentPage={currentPage}
                    isAgencyValue={isAgencyValue}
                    fromCompanies= {fromCompanies}
                    fromAccountSettings={fromAccountSettings}
                    accountBootstrap={accountBootstrap}
                />
            );
        case 'ASSIGN_ROLE':
            return (
                <AssignRole
                    isEdit={isEdit}
                    type={type}
                    nextScreen={(screenName) => nextScreen(screenName)}
                    back={(screenName, type) => back(screenName, type)}
                    companies
                    c_clientId={clientId}
                    setCurrentTitle={setCurrentTitle}
                    isAgencyValue={isAgencyValue}
                    currentLicenseTypeId={currentLicenseTypeId}
                    setCurrentUserPage={setCurrentUserPage}
                >
                    Assign role
                </AssignRole>
            );
        case 'ACCOUNT_TYPE':
            return (
                <Licensetype
                    type={type}
                    nextScreen={(screenName, type) => nextScreen(screenName, type)}
                    back={(screenName, type) => back(screenName, type)}
                    companies="companies"
                />
            );
        case 'LOCALIZATION_SETTINGS':
            return <LocalizationSettings type={type} back={(screenName) => back(screenName)} pageType={'COMPANIES'} fromLicenseUpgrade={fromLicenseUpgrade}/>;
        // return <CompaniesLocalization type={type} back={(screenName) => back(screenName)} pageType={'COMPANIES'} />;

        case 'COMPANY_LOCALIZATION':
            return (
                <CompaniesLocalization
                    isAgencyValue={isAgencyValue}
                    type={type}
                    back={(screenName) => back(screenName)}
                    pageType={'LOCALIZATION'}
                    companies
                />
            );
        case 'ADD_USERS':
            return (
                <AddUser
                    // companyBack={companyBack}
                    // campanyEdit={campanyEdit}
                    currentPage={currentPage}
                    back={(screenName) => {
                        back(screenName);
                    }}
                    nextScreen={(screenName) => {
                        nextScreen(screenName);
                    }}
                    // setEditCurrentPage={setEditCurrentPage}
                    companies
                    isAgencyValue={isAgencyValue}
                />
            );

        // default:
        //     return <CompanyInfo nextScreen={(screenName, type) => nextScreen(screenName, type)} />;
    }
};

RenderComponent.propTypes = {
    currentPage: PropTypes.string.isRequired,
    nextScreen: PropTypes.func.isRequired,
    back: PropTypes.func,
};

export default RenderComponent;
