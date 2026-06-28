import PropTypes from 'prop-types';

import KeyContactInfo from 'Pages/RegistrationModule/Login/Component/KeyContactInfo';
import AgencyDetails from 'Pages/RegistrationModule/Login/Component/AgencyDetails';
import LocalizationSettings from 'Pages/RegistrationModule/Login/Component/LocalizationSettings';
import AccountType from '../../../AccountType';
import BrandDetails from 'Pages/RegistrationModule/Login/Component/BrandDetails';
import Licensetype from 'Pages/RegistrationModule/Login/Pages/NewUser/Pages/LicenseType';

const RenderComponent = ({ currentPage, nextScreen, back, type }) => {
    switch (currentPage) {
        case 'ACCOUNT_TYPE':
            return <AccountType nextScreen={(screenName, type) => nextScreen(screenName, type)} />;
        case 'KEY_INFO':
            return (
                <KeyContactInfo
                    type={type}
                    nextScreen={(screenName) => nextScreen(screenName)}
                    back={(screenName, type) => back(screenName, type)}
                />
            );
        case 'AGENCY_DETAILS':
            return (
                <AgencyDetails
                    nextScreen={(screenName) => nextScreen(screenName)}
                    back={(screenName) => back(screenName)}
                />
            );

        case 'BRAND_DETAILS':
            return (
                <BrandDetails
                    nextScreen={(screenName) => nextScreen(screenName)}
                    back={(screenName) => back(screenName)}
                />
            );
        case 'LOCALIZATION_SETTINGS':
            return (
                <LocalizationSettings type={type} back={(screenName) => back(screenName)} pageType="ACCOUNT_CREATION" />
            );

        case 'LICENSE_TYPE':
            return (
                <Licensetype
                    type={type}
                    nextScreen={(screenName, type) => nextScreen(screenName, type)}
                    back={(screenName, type) => back(screenName, type)}
                />
            );
        default:
            return <AccountType nextScreen={(screenName, type) => nextScreen(screenName, type)} />;
    }
};

RenderComponent.propTypes = {
    currentPage: PropTypes.string.isRequired,
    nextScreen: PropTypes.func.isRequired,
    back: PropTypes.func,
};

export default RenderComponent;
