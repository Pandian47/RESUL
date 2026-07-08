import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import {
    PREFERENCES_SUBPAGE_VARIANT,
    resolvePreferencesSubPageVariant,
    MyProfileFormSkeleton,
    CompanyClientDetailsFormSkeleton,
    UsersListSkeleton,
    UsersAddEditFormSkeleton,
    RolesListSkeleton,
    RolesPermissionsEditFormSkeleton,
    AlertsNotificationsListSkeleton,
    NotificationsGridSkeleton,
    CompaniesListSkeleton,
    CompanyAssignRoleSkeleton,
    CompanyLocalizationSkeleton,
    OfferManagementSkeleton,
    CreateOfferFormSkeleton,
    CreateBrandFormSkeleton,
    CreateShopFormSkeleton,
    DiscoverOffersSkeleton,
    TemplateGallerySkeleton,
    TemplateGalleryInnerTabbedSkeleton,
    TemplateGalleryLandingInnerSkeleton,
    TemplateGalleryFormGeneratorSkeleton,
    FormGeneratorListSkeleton,
    FormGeneratorEditorSkeleton,
    FormGeneratorAddSkeleton,
    BrandOwnedFormSkeleton,
    TemplateGalleryAdsSkeleton,
    TemplateGalleryWhatsappSkeleton,
    DataCatalogueRouteSkeleton,
    ConsumptionsPageSkeleton,
    ConsumptionChannelPageSkeleton,
    CommunicationSettingsRouteSkeleton,
    NewAttributeModalFormSkeleton,
    InvoiceListGridSkeleton,
    LicenceInfoSkeleton,
} from './PreferencesSubPageRouteSkeleton';
import { skeletonShellSharedCriticalCss } from './common';
import {
    communicationSettingsSkeletonCriticalCss,
    consumptionChannelSkeletonCriticalCss,
    preferencesSkeletonCriticalCss,
} from './preferencesSkeletonCriticalCss';

const DefaultFormSkeleton = () => (
    <div className="box-design bd-top-border pref-subpage-skeleton-panel py40" aria-hidden="true">
        <div className="form-group pref-subpage-form-row">
            <span className="skeleton-shimmer d-block" style={{ height: 22, width: '100%' }} />
        </div>
        <div className="form-group pref-subpage-form-row">
            <span className="skeleton-shimmer d-block" style={{ height: 22, width: '80%' }} />
        </div>
        <div className="form-group pref-subpage-form-row">
            <span className="skeleton-shimmer d-block" style={{ height: 22, width: '100%' }} />
        </div>
    </div>
);

const PreferencesSubPageFormSkeleton = ({ variant, showNoData = false }) => {
    if (variant === PREFERENCES_SUBPAGE_VARIANT.MY_PROFILE) return <MyProfileFormSkeleton showNoData={showNoData} />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ACCOUNT_SETTINGS) {
        return <CompanyClientDetailsFormSkeleton showNoData={showNoData} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_CLIENT_DETAILS) {
        return <CompanyClientDetailsFormSkeleton showNoData={showNoData} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.USERS) return <UsersListSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.USERS_ADD_EDIT) {
        return <UsersAddEditFormSkeleton showNoData={showNoData} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ROLES) return <RolesListSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ROLES_PERMISSIONS_EDIT) {
        return <RolesPermissionsEditFormSkeleton showNoData={showNoData} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.ALERTS_NOTIFICATIONS) {
        return <AlertsNotificationsListSkeleton showNoData={showNoData} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.NOTIFICATIONS_LIST) return <NotificationsGridSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_LIST) {
        return <CompaniesListSkeleton showNoData={showNoData} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_CLIENT_DETAILS) return <AccountSettingsFormSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_ASSIGN_ROLE) return <CompanyAssignRoleSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMPANY_LOCALIZATION) {
        return <CompanyLocalizationSkeleton showNoData={showNoData} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.OFFER_MANAGEMENT) {
        return <OfferManagementSkeleton tabIndex={0} />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CREATE_OFFER) return <CreateOfferFormSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CREATE_BRAND) return <CreateBrandFormSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CREATE_SHOP) return <CreateShopFormSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.OFFER_DISCOVER) return <DiscoverOffersSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TEMPLATE_GALLERY) return <TemplateGallerySkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_TABBED_GALLERY) return <TemplateGalleryInnerTabbedSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_LANDING_GALLERY) return <TemplateGalleryLandingInnerSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_FORM_GENERATOR) return <TemplateGalleryFormGeneratorSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR) return <FormGeneratorListSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_EDITOR) return <FormGeneratorEditorSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.FORM_GENERATOR_ADD) return <FormGeneratorAddSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.BRAND_OWNED_FORM) return <BrandOwnedFormSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_ADS) return <TemplateGalleryAdsSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.TG_WHATSAPP) return <TemplateGalleryWhatsappSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE) return <DataCatalogueRouteSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CONSUMPTIONS) return <ConsumptionsPageSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.CONSUMPTION_CHANNEL) return <ConsumptionChannelPageSkeleton />;
    if (variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS) {
        return <CommunicationSettingsRouteSkeleton />;
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.INVOICE_LIST) {
        return (
            <Container className="page-content px0 mt-50">
                <InvoiceListGridSkeleton rows={5} />
            </Container>
        );
    }
    if (variant === PREFERENCES_SUBPAGE_VARIANT.LICENSE_INFO) {
        return (
            <div className="rs-licence-info-wrapper rs-licence-info-skeleton-scope">
                <LicenceInfoSkeleton />
            </div>
        );
    }
    return <DefaultFormSkeleton />;
};

export { NewAttributeModalFormSkeleton };

/**
 * Shows a layout-matched skeleton while `isLoading` (field loader / usePreferencesSubPageApi).
 * Renders `children` when not loading.
 */
export const PreferencesSubPageSkeletonGate = ({
    variant: variantProp,
    isLoading = false,
    showNoData = false,
    children = null,
    className = '',
    ariaLabel = 'Loading',
}) => {
    const { pathname, search } = useLocation();
    const variant = variantProp ?? resolvePreferencesSubPageVariant(pathname, search);

    if (!isLoading) {
        return children;
    }

    const isConsumptionChannel = variant === PREFERENCES_SUBPAGE_VARIANT.CONSUMPTION_CHANNEL;
    const isCommunicationSettings = variant === PREFERENCES_SUBPAGE_VARIANT.COMMUNICATION_SETTINGS;
    const isDataCatalogue = variant === PREFERENCES_SUBPAGE_VARIANT.DATA_CATALOGUE;

    const isMyProfile = variant === PREFERENCES_SUBPAGE_VARIANT.MY_PROFILE;

    return (
        <div
            className={`preferences-skeleton-scope preferences-subpage-skeleton-scope pref-subpage-skeleton-gate-host${
                showNoData ? ' pref-subpage-skeleton--no-data' : ''
            } ${isCommunicationSettings ? 'communication-settings' : ''} ${isDataCatalogue ? 'data-catalogue' : ''} ${isMyProfile ? 'pref-my-profile-skeleton-host' : ''} ${className}`.trim()}
            aria-busy={!showNoData}
            aria-label={showNoData ? 'No data available' : ariaLabel}
        >
            <style>{skeletonShellSharedCriticalCss}</style>
            <style>{preferencesSkeletonCriticalCss}</style>
            {isConsumptionChannel ? <style>{consumptionChannelSkeletonCriticalCss}</style> : null}
            {isCommunicationSettings ? <style>{communicationSettingsSkeletonCriticalCss}</style> : null}
            <PreferencesSubPageFormSkeleton variant={variant} showNoData={showNoData} />
        </div>
    );
};

PreferencesSubPageSkeletonGate.propTypes = {
    variant: PropTypes.oneOf(Object.values(PREFERENCES_SUBPAGE_VARIANT)),
    isLoading: PropTypes.bool,
    showNoData: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    ariaLabel: PropTypes.string,
};

export default PreferencesSubPageSkeletonGate;
