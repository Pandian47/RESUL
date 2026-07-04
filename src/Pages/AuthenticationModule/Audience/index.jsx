import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';

import { SELECT_BU } from 'Constants/GlobalConstant/Placeholders';
import { createContext, useEffect, useMemo, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { Container } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RSTabbarFluid from 'Components/RSTabberFluid';
import RSPageHeader from 'Components/RSPageHeader';
import { AUDIENCE_TAB_CONFIG } from './constants';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { getIsPartnerDataEnable } from 'Reducers/audience/masterdata/request';
import { updateCurrTabConfig } from 'Reducers/globalState/reducer';
import { DDL_AUDIENCE_DATA } from 'Components/RSPageHeader/constant';
import RSConfirmationModal from 'Components/ConfirmationModal';

import usePartnerDataEnabled from 'Hooks/usePartnerDataEnabled';
import useQueryParams from 'Hooks/useQueryParams';
export const AudienceListProvider = createContext({});

const Audience = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const location = useQueryParams('/audience');
    const tabIndex = location ? location?.index : 0;
    const dispatch = useDispatch();
    const { licenseTypeId } = getUserDetails();
    const { t } = useTranslation();
    const [confirmationModal, setConfimrationModal] = useState(false);
    const { userId, clientId, departmentId, departmentName } = useSelector((state) => getSessionId(state));
    const { currentTabConfig: { audienceType = 'Brand audience' } = {} } = useSelector(
        ({ globalstate }) => globalstate,
    );
    const isPartnerDataEnabled = usePartnerDataEnabled(departmentId);
    const [config_Tab, setConfig_tab] = useState(AUDIENCE_TAB_CONFIG);
    const [config_TabURL, setConfig_tabURL] = useState(tabIndex);
    const [isCompanyBUDisable, setIsCompanyBUDisable] = useState(false);

    const audienceDropdownData = useMemo(
        () => (isPartnerDataEnabled ? DDL_AUDIENCE_DATA : ['Brand audience']),

        [isPartnerDataEnabled],
    );

    useEffect(() => {
        const cliId = clientId?.clientId ?? clientId;
        const userDetails = getUserDetails();
        const cachedByDepartment =
            userDetails?.isPartnerDataEnabled != null &&
            typeof userDetails?.isPartnerDataEnabled === 'object' &&
            !Array.isArray(userDetails?.isPartnerDataEnabled)
                ? userDetails.isPartnerDataEnabled
                : {};
        if (Object.prototype.hasOwnProperty.call(cachedByDepartment, departmentId)) {
            return;
        }

        dispatch(getIsPartnerDataEnable({ departmentId: departmentId, clientId: cliId, userId }));
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        if (!isPartnerDataEnabled && audienceType !== 'Brand audience') {
            dispatch(updateCurrTabConfig({ field: 'audienceType', data: 'Brand audience' }));
        }
    }, [isPartnerDataEnabled, audienceType]);

    const isInternalOrPartner = audienceType === 'Internal audience' || audienceType === 'Partner audience';

    const getDisable = (cond, tabOverrides) => {
        setConfimrationModal(!!cond);
        let temp = (tabOverrides ?? [...config_Tab]).map((e, i) => {
            const disableByAudienceType = isInternalOrPartner && i > 1;
            return {
                ...e,
                disable: !!cond || disableByAudienceType,
            };
        });
        setConfig_tab(temp);
    };

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            getDisable(1, AUDIENCE_TAB_CONFIG);
        } else {
            getDisable(0, AUDIENCE_TAB_CONFIG);
        }
    }, [departmentName, licenseTypeId, audienceType]);

    useEffect(() => {
        if (typeof state === 'object' && state !== null) {
            setConfig_tabURL(_get(state, 'index', 0));
        } else if (typeof location === 'object' && location !== null) {
            setConfig_tabURL(_get(location, 'index', 0));
        }
    }, [state, location]);

    useEffect(() => {
        if (isInternalOrPartner && config_TabURL === 2) {
            setConfig_tabURL(0);

            const state1 = { index: 0 };

            const encryptState = encodeUrl(state1);

            navigate(`/audience?q=${encryptState}`, { state: { index: 0 } });
        }
    }, [isInternalOrPartner, config_TabURL, navigate]);

    const contextValue = {
        setIsCompanyBUDisable: setIsCompanyBUDisable,
    };

    return (
        <AudienceListProvider.Provider value={contextValue}>
            <div className="page-content-holder">
                <RSPageHeader
                    issubHeading
                    subHeading={isPartnerDataEnabled ? audienceType : ''}
                    subHeadingDropdownData={isPartnerDataEnabled ? audienceDropdownData : undefined}
                    issubHeadingDropDown={isPartnerDataEnabled}
                    title={t('Audience')}
                    isTabber
                    rightCommonMenus
                    isAgencyDisabled={isCompanyBUDisable}
                    isBuDisabled={isCompanyBUDisable}
                    onSubheadingChange={(item) => dispatch(updateCurrTabConfig({ field: 'audienceType', data: item }))}
                />

                <Container fluid>
                    <div className="page-content">
                        <RSTabbarFluid
                            defaultClass={`col-md-4 col-sm-4`}
                            dynamicTab={`mb0 mini`}
                            activeClass={`active`}
                            tabData={config_Tab}
                            className="rs-tabs row rst-left-space"
                            defaultTab={config_TabURL}
                            callBack={(_, index) => {
                                const url = '/audience';

                                const state1 = { index: Number(index) };

                                const encryptState = encodeUrl(state1);

                                navigate(`${url}?q=${encryptState}`, {
                                    state: { index },
                                });
                            }}
                        />
                    </div>
                </Container>

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
        </AudienceListProvider.Provider>
    );
};

export default Audience;
