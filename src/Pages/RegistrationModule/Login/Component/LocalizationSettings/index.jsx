import { SELECT_CURRENCY, SELECT_DATE_FORMAT, SELECT_LANGUAGE, SELECT_TIMEZONE, SELECT_TIME_FORMAT } from 'Constants/GlobalConstant/ValidationMessage';
import { BACK, SUBMIT } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect } from 'react';
import { get as _get, find as _find } from 'Utils/modules/lodashReplacements';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import mapOptions from 'Constants/Charts/mapOptions';
import RSHighchartsContainer from 'Components/Highcharts';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

import { buildPayload } from './constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { update_new_company_data, update_company_data } from 'Reducers/companySetup/reducer';
import { clientCreation, getCountryCoordinates, agencyClientCreation } from 'Reducers/login/newUser/request';
import { addCompany } from 'Reducers/preferences/Companies/request';
import { getmasterData } from 'Utils/modules/masterData';
import { getSessionId } from 'Reducers/globalState/selector';
import { GetClientPaymentDetails } from 'Reducers/preferences/Licence/request';
import { update_newUser_data } from 'Reducers/login/newUser/reducer';

const ACCOUNT_SETUP_FIELD_LOADER = {
    create: LOADER_TYPE.FIELD,
    edit: LOADER_TYPE.FIELD,
};

const LocalizationSettings = ({ back = () => {}, type, pageType, fromLicenseUpgrade = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { handleSubmit, control, reset, watch, setValue, clearErrors } = useForm();
    const countryDetailsLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: ACCOUNT_SETUP_FIELD_LOADER,
        mode: 'create',
    });
    const submitLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: ACCOUNT_SETUP_FIELD_LOADER,
        mode: 'create',
    });
    const showFieldLoader = countryDetailsLoader.isLoading;
    const showMapLoader = countryDetailsLoader.isFetching;
    const isSubmitLoading = submitLoader.isLoading;
    
    const mode = _get(location, 'state.mode', 'new');
    const { clientId , userId} = useSelector((state) => getSessionId(state));
    const { currencyMasterList = [], languageMasterList = [], dateFormatList = [], timeFormatList = [], timeZoneList = [] } =
        getmasterData() || {};

    const {
        currency,
        langauge,
        dateFormat,
        timeFormat,
        timezone,
        country,
        state: selectedState,
        countryLocation,
        companyCountry,
        isAgencyBrand,
        isNotify,
        ...rest
    } = useSelector(({ newUserReducer, companyCreation }) => {
        if (pageType === 'ACCOUNT_CREATION') {
            return newUserReducer;
        } else {
            return companyCreation;
        }
    });

    const cooridnations = {
        zoomLevel: 10,
        id: _get(countryLocation, 'country', 'India'),
        name: _get(countryLocation, 'country', 'India'),
        lat: Number(_get(countryLocation, 'latitude', 13.0187)),
        lon: Number(_get(countryLocation, 'longitude', 80.2032)),
    };

    useEffect(() => {
        const countryID =
            pageType === 'ACCOUNT_CREATION' ? _get(country, 'countryID', 0) : _get(companyCountry, 'countryID', 0);
        const stateID = _get(selectedState, 'stateID', 0) ?? 0;
        const existingCountryId = _get(countryLocation, 'countryID', 0);
        const existingStateId =
            _get(countryLocation, 'stateID', 0) ?? _get(countryLocation, 'stateId', 0) ?? 0;

        if (!countryID) return;

        const shouldFetch =
            countryLocation === null ||
            countryID !== existingCountryId ||
            String(stateID) !== String(existingStateId);

        if (shouldFetch) {
            countryDetailsLoader.refetch({
                fetcher: () => dispatch(getCountryCoordinates({ countryID, stateID, loading: false })),
                loaderConfig: ACCOUNT_SETUP_FIELD_LOADER,
                mode: 'create',
            });
        }
    }, []);

    useEffect(() => {
        try {
            if (Object.keys(countryLocation || {})?.length) {
                const {
                    currencyID,
                    defaultDateformatID,
                    defaultLanguageID,
                    defaultTimeFormatID,
                    defaultTimeZoneID,
                } = countryLocation;
                const currency = _find(currencyMasterList, ['currencyID', currencyID]);
                const dateFormat = _find(dateFormatList, ['dateFormatID', defaultDateformatID]);
                const langauge = _find(languageMasterList, ['languageID', defaultLanguageID]);
                const timeFormat = _find(timeFormatList, ['timeFormatID', defaultTimeFormatID]);
                const timezone = _find(timeZoneList, ['timeZoneID', defaultTimeZoneID]);
                reset({
                    currency,
                    langauge,
                    dateFormat,
                    timeFormat,
                    timezone,
                });
            } else {
                const ipAddressData = JSON.parse(localStorage.getItem('ipAddressData') || '{}');
                const { currencyID, defaultDateformatID, defaultLanguageID, defaultTimeFormatID, defaultTimeZoneID } =
                    ipAddressData;
                const currency = _find(currencyMasterList, ['currencyID', currencyID]);
                const dateFormat = _find(dateFormatList, ['dateFormatID', defaultDateformatID]);
                const langauge = _find(languageMasterList, ['languageID', defaultLanguageID]);
                const timeFormat = _find(timeFormatList, ['timeFormatID', defaultTimeFormatID]);
                const timezone = _find(timeZoneList, ['timeZoneID', defaultTimeZoneID]);
                reset({
                    currency,
                    langauge,
                    dateFormat,
                    timeFormat,
                    timezone,
                });
            }
        } catch (error) {
            // Fallback to default values if there's an error
            const defaultCurrency = currencyMasterList?.[0];
            const defaultDateFormat = dateFormatList?.[0];
            const defaultLanguage = languageMasterList?.[0];
            const defaultTimeFormat = timeFormatList?.[0];
            const defaultTimezone = timeZoneList?.[0];

            reset({
                currency: defaultCurrency,
                langauge: defaultLanguage,
                dateFormat: defaultDateFormat,
                timeFormat: defaultTimeFormat,
                timezone: defaultTimezone,
            });
        }

        //  }
    }, [countryLocation]);

    const handleFormSubmit = async (formState) => {
        if (isSubmitLoading || showFieldLoader) return;

        await submitLoader.refetch({
            fetcher: async () => {
                if (pageType === 'ACCOUNT_CREATION') {
                    const payload = buildPayload(
                        { ...formState, ...companyCountry, isAgencyBrand, ...rest, countryLocation: country, isNotify },
                        type,selectedState
                    );
                    if (isAgencyBrand) {
                        await dispatch(agencyClientCreation({ payload, type, navigate, loading: false }));
                    } else {
                        await dispatch(clientCreation({ payload, type, navigate, loading: false }));
                    }
                } else if (pageType === 'COMPANIES') {
                    const payload = buildPayload({ ...rest,...companyCountry,  ...formState, clientId, countryLocation }, 'company', selectedState);

                    if (fromLicenseUpgrade) {
                        const upgradePayload = {
                            ...payload,
                            Upgradefrom: 'Pro',
                            Upgrade: 'Ent',
                            clientId: payload?.parentClientId,
                        };
                        await dispatch(
                            GetClientPaymentDetails(
                                {
                                    payload: {
                                        clientId: payload?.parentClientId,
                                        LicensingTypeID: rest?.licenseTypeId,
                                        userId,
                                    },
                                    loading: false,
                                },
                                navigate,
                                upgradePayload,
                            ),
                        );
                    } else {
                        await dispatch(addCompany(payload, navigate));
                    }
                } else if (mode === 'edit') {
                    navigate('/preferences/company-list');
                } else {
                    dispatch(update_new_company_data(formState));
                    navigate('/setup-complete', { state: { status: 'success', isSignUp: true } });
                }
                return true;
            },
            loaderConfig: ACCOUNT_SETUP_FIELD_LOADER,
            mode: 'create',
        });
    };

    const handleFormBack = () => {
        if (pageType === 'ACCOUNT_CREATION') {
            dispatch(update_newUser_data({ field: 'isBack', data: true }));
            back(type === 'agency' ? 'AGENCY_DETAILS' : 'BRAND_DETAILS');
        } else if (mode === 'edit') {
            back('ASSIGN_ROLE');
        } else {
            dispatch(update_company_data({field: 'isBack' , data: true}))
            back('NEW_COMPANY');
        }
    };

    return (
        <Fragment>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div
                    className={`box-design rs-box rs-box-min-height py40 ${
                        isSubmitLoading ? 'pe-none click-off opacity-75' : ''
                    }`}
                >
                    <Row className="res-gx-2">
                        <Col md={6} sm={6}>
                            <div className="ml-19">
                                {showMapLoader ? (
                                    <span
                                        className="skeleton-shimmer d-block account-setup-map-skeleton ml30"
                                        style={{ height: '335px', borderRadius: '10px' }}
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <RSHighchartsContainer
                                        constructorType={'mapChart'}
                                        options={mapOptions([cooridnations])}
                                        height="335px"
                                    />
                                )}
                            </div>
                        </Col>
                        <Col md={6} sm={6} className="box-left-border d-flex align-items-center">
                            <Row>
                                <Col md={6} sm={6}>
                                    <div className="form-group" id="rs_LocalizationSettings_currency">
                                        <RSKendoDropDownList
                                            // data={currencyMasterList}
                                            data={currencyMasterList
                                                .filter(
                                                    (c) =>
                                                        c?.currencyName &&
                                                        ['indian rupee', 'u.s. dollar', 'us dollar'].includes(
                                                            c.currencyName.toLowerCase(),
                                                        ),
                                                )
                                                .sort((a, b) =>
                                                    String(a?.currencyName ?? '').toLowerCase() >
                                                    String(b?.currencyName ?? '').toLowerCase()
                                                        ? 1
                                                        : -1,
                                                )}
                                            control={control}
                                            name={'currency'}
                                            label={'Currency'}
                                            dataItemKey={'currencyID'}
                                            textField={'currencyName'}
                                            isLoading={showFieldLoader}
                                            required
                                            rules={{
                                                required: SELECT_CURRENCY,
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={6} sm={6}>
                                    <div className="form-group" id="rs_LocalizationSettings_langauge">
                                        <RSKendoDropDownList
                                            // data={languageMasterList}
                                            data={[...languageMasterList].sort((a, b) =>
                                                String(a?.languageName ?? '').toLowerCase() >
                                                String(b?.languageName ?? '').toLowerCase()
                                                    ? 1
                                                    : -1,
                                            )}
                                            control={control}
                                            name={'langauge'}
                                            label={'Language'}
                                            dataItemKey={'languageID'}
                                            textField={'languageName'}
                                            isLoading={showFieldLoader}
                                            required
                                            rules={{
                                                required: SELECT_LANGUAGE,
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={6} sm={6}>
                                    <div className="form-group" id="rs_LocalizationSettings_dateFormat">
                                        <RSKendoDropDownList
                                            // data={dateFormatList}
                                            data={[...dateFormatList].sort((a, b) =>
                                                String(a?.dateformat ?? '').toLowerCase() >
                                                String(b?.dateformat ?? '').toLowerCase()
                                                    ? 1
                                                    : -1,
                                            )}
                                            control={control}
                                            name={'dateFormat'}
                                            label={'Date format'}
                                            dataItemKey={'dateFormatID'}
                                            textField={'dateformat'}
                                            isLoading={showFieldLoader}
                                            required
                                            rules={{
                                                required: SELECT_DATE_FORMAT,
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={6} sm={6}>
                                    <div className="form-group" id="rs_LocalizationSettings_timeFormat">
                                        <RSKendoDropDownList
                                            // data={timeFormatList}
                                            data={[...timeFormatList].sort((a, b) =>
                                                String(a?.timeformat ?? '').toLowerCase() >
                                                String(b?.timeformat ?? '').toLowerCase()
                                                    ? 1
                                                    : -1,
                                            )}
                                            control={control}
                                            name={'timeFormat'}
                                            label={'Time format'}
                                            dataItemKey={'timeFormatID'}
                                            textField={'timeformat'}
                                            isLoading={showFieldLoader}
                                            required
                                            rules={{
                                                required: SELECT_TIME_FORMAT,
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={12} sm={12}>
                                    <div className="form-group m0" id="rs_LocalizationSettings_timezone">
                                        <RSKendoDropDownList
                                            // data={timeZoneList}
                                            data={[...timeZoneList].sort((a, b) =>
                                                String(a?.timeZoneName ?? '').toLowerCase() >
                                                String(b?.timeZoneName ?? '').toLowerCase()
                                                    ? 1
                                                    : -1,
                                            )}
                                            control={control}
                                            name={'timezone'}
                                            label={'Time zone'}
                                            dataItemKey={'timeZoneID'}
                                            textField={'timeZoneName'}
                                            isLoading={showFieldLoader}
                                            required
                                            rules={{
                                                required: SELECT_TIMEZONE,
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <div className="buttons-holder">
                    <RSSecondaryButton onClick={handleFormBack} disabled={isSubmitLoading || showFieldLoader}>
                        {BACK}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        isLoading={isSubmitLoading}
                        blockBodyPointerEvents={isSubmitLoading}
                        className={showFieldLoader ? 'click-off' : ''}
                    >
                        {SUBMIT}
                    </RSPrimaryButton>
                </div>
            </form>
        </Fragment>
    );
};

export default LocalizationSettings;
