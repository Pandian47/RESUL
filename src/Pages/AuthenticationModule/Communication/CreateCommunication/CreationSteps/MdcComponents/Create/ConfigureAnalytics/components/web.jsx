import { encodeUrl } from 'Utils/modules/crypto';
import { ENTER_VALID_WEBSITE } from 'Constants/GlobalConstant/ValidationMessage';
import { circle_minus_fill_edge_medium, circle_plus_fill_edge_medium, circle_tick_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import {
    CONVERSION_CATEGORY,
    SUBSCRIPTION_FORM,
    CONVERSION_URL,
    DURATION,
    MINUTES,
    SECONDS,
} from 'Constants/GlobalConstant/Placeholders';
import { WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { DURATION_FIELD_RULE, buildPayload } from './constant';
import { SELECT_CONVERSION_CATEGORY, SELECT_SUBSCRPTION_FORM } from 'Constants/GlobalConstant/ValidationMessage';
import {
    getSubscriptionActiveForm,
    getConversionCategory,
    SetLandingPage,
    GetLandingPage,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { validateWebsite } from 'Reducers/login/newUser/request';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import {
    CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG,
} from './LandingAnalyticsSkeletons';
import {
    getAuthoringSaveButtonType,
    useAuthoringChannelSaveLoader,
} from 'Components/Skeleton/pages/communication/authoring';

import { ConfigureAnalyticsProvider } from '..';
import { handleTabNavigationFlow } from '../../constant';

const web = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const location = useLocation();
    const location = useQueryParams('/communication');
    const {
        control,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
        setValue,
        getValues,
    } = useForm({
        defaultValues: { conversionUrl: [{ url: '', valid: false }] },
        mode: 'onTouched',
    });
    const { fields, append, remove, update, replace } = useFieldArray({ control, name: 'conversionUrl' });

    // const {
    //     state: { campaignId, mdcContentSetupDetails },
    // } = location;
    const [mdcContentSetupDetails, setMdcContentSetupDetails] = useState({});
    const [levelNumber, setLevelNumber] = useState(1);
    const [actionId, setActionId] = useState(0);
    const [mdcChannelDetailId, setMdcChannelDetailId] = useState(0);
    const [campaign, setCampaign] = useState({});
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [subscriptionForms, setSubscriptionForm] = useState([]);
    const [conversionCategory, setConversionCategory] = useState([]);
    const conversionCategoryLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const subscriptionFormLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const editDetailsLoader = useApiLoader({ autoFetch: false, loaderConfig: CONFIGURE_ANALYTICS_FIELD_LOADER_CONFIG });
    const { runSave, isSaveLoading, isNextLoading } = useAuthoringChannelSaveLoader();
    const loadRequestIdRef = useRef(0);
    const channelId = _get(location, 'mdcContentSetupDetails.channelId', 0);
    const shouldHydrateSavedLandingPage =
        (location?.mode === 'edit' || location?.mode === 'update') && Boolean(channelId);
    const isDropdownLoading =
        conversionCategoryLoader.isLoading || subscriptionFormLoader.isLoading;
    const { setDefaultTabIndex } = useContext(ConfigureAnalyticsProvider);

    useEffect(() => {
        const campaign = {
            campaignId: _get(location, 'campaignId', 0),
            campaignType: _get(location, 'campaignType', 'S'),
        };
        const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
        const levelNumber = _get(mdcContentSetupDetails, 'levelNumber', 1);
        const actionId = _get(mdcContentSetupDetails, 'actionId', 0);
        const mdcChannelDetailId = _get(mdcContentSetupDetails, 'channelDetailId', 0);
        setCampaign(campaign);
        setMdcContentSetupDetails(mdcContentSetupDetails);
        setLevelNumber(levelNumber);
        setActionId(actionId);
        setMdcChannelDetailId(mdcChannelDetailId);
    }, [location]);

    const fetchConversionCategory = async (payload) => {
        payload = { ...payload, conversionTypeId: 1, campaignId: _get(location, 'campaignId', 0) };
        return await dispatch(getConversionCategory({ payload, loading: false }));
    };
    const fetchActiveForm = async (payload) => {
        return await dispatch(getSubscriptionActiveForm({ payload, loading: false }));
    };
    useEffect(() => {
        if (!location || !Object.keys(location)?.length) return;
        if (!clientId || !userId || !departmentId) return;

        const requestId = loadRequestIdRef.current + 1;
        loadRequestIdRef.current = requestId;

        const loadLandingPageData = async () => {
            const payload = { clientId, userId, departmentId };

            const [result1, result2] = await Promise.all([
                conversionCategoryLoader.refetch({
                    fetcher: () => fetchConversionCategory(payload),
                }),
                subscriptionFormLoader.refetch({
                    fetcher: () => fetchActiveForm(payload),
                }),
            ]);

            if (requestId !== loadRequestIdRef.current) return;

            const categoryList = result1?.status ? result1?.data?.category ?? [] : [];
            if (categoryList.length) {
                setConversionCategory(categoryList);
            }
            if (result2?.status) {
                setSubscriptionForm(result2.data);
            }

            if (shouldHydrateSavedLandingPage) {
                const goalType =
                    channelId === 'goal001' ? 'g1' : channelId === 'goal002' ? 'g2' : null;
                const landingPayload = {
                    clientId,
                    userId,
                    departmentId,
                    goalType,
                    campaignId: _get(location, 'campaignId', 0),
                };
                const response = await editDetailsLoader.refetch({
                    fetcher: () => dispatch(GetLandingPage({ payload: landingPayload, loading: false })),
                });

                if (requestId !== loadRequestIdRef.current) return;

                if (response?.status) {
                    const { categoryId, duration, formId, url } = response.data ?? {};
                    if (categoryList.length) {
                        const category = categoryList.find(
                            (item) => item.conversionCategoryId === categoryId,
                        );
                        if (category) {
                            setValue('category', category);
                        }
                    }

                    if (result2?.data?.length) {
                        const form = result2.data.find((item) => item.formId === formId);
                        if (form) {
                            setValue('subscriptionFormName', form);
                        }
                    }
                    if (duration) {
                        const [min, sec] = duration.split(':');
                        setValue('minutes', min);
                        setValue('seconds', sec);
                    }
                    if (url?.length) {
                        replace(url.map((item) => ({ url: item, valid: true })));
                    } else {
                        replace([{ url: '', valid: false }]);
                    }
                }
            }
        };

        loadLandingPageData().catch(() => {});
    }, [location, clientId, userId, departmentId, shouldHydrateSavedLandingPage, channelId]);

    const handleAddConversionUrlList = () => {
        append({ url: '', valid: false });
    };
    const handleRemoveConversionUrlList = (removeIndex) => {
        // const urls = conversionUrls.filter((item, index) => index !== removeIndex);
        remove(removeIndex);
    };
    const handleFormSubmit = async (data, type) => {
        const invalidUrls = fields.some((field, index) => {
            const urlValue = data.conversionUrl?.[index]?.url?.trim();
            if(urlValue && !field.valid){
                setError(`conversionUrl.${index}.url`, {
                    type: 'submit', 
                    message: 'Invalid website',
                });
            }
            return urlValue && !field.valid;
        });
        
        const hasFormErrors = Object.keys(errors)?.length > 0 || 
                             _get(errors, 'conversionUrl')?.length > 0 ||
                             fields.some((_, index) => _get(errors, `conversionUrl.${index}.url`)) ||
                             invalidUrls;

        
        
        if (hasFormErrors || invalidUrls) {
            return;
        }

        if (parseInt(data?.minutes) === 0 || parseInt(data?.seconds) < 10) {
            if (parseInt(data?.minutes) === 0) {
                setError('minutes', {
                    type: 'custom',
                    message: 'Enter valid value',
                });
            }
            if (parseInt(data?.seconds) < 10) {
                setError('seconds', {
                    type: 'custom',
                    message: 'Enter Min. value 10',
                });
            }
            return;
        }
        const userData = { clientId, userId, departmentId };
        const payload = buildPayload({
            data,
            userData,
            mdcContentSetupDetails,
            campaignId: _get(location, 'campaignId', 0),
        });

        const response = await runSave(getAuthoringSaveButtonType(type), () =>
            dispatch(SetLandingPage({ payload, loading: false })),
        );
        const status = response?.status;
        const channelResponseDetailId = response?.data?.conversiontrackId;

        if (status) {     
            // navigate('/communication/mdc-workflow', {
            //     ...location,
            //     state: { ...location.state, channelResponseDetailId, mode: 'update' },
            // });
            const tabStatus = await handleTabNavigationFlow(location, 0);
            if (tabStatus?.status && type !== 'save') {
                setDefaultTabIndex(tabStatus?.tabIndex);
            } else {
                const mdcCanvasUrl = `/communication/mdc-workflow`;
                const state = { ...location, channelResponseDetailId, mode: `update` };
                const encryptState = encodeUrl(state);
                channelResponseDetailId &&
                    navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
                        state,
                    });
            }
        }
    };
    const handleMdcCancel = () => {
        const mdcCanvasUrl = `/communication/mdc-workflow`;
        const state = { ...location };
        delete state.mdcContentSetupDetails;

        const encryptState = encodeUrl(state);
        navigate(`${mdcCanvasUrl}?q=${encryptState}`, {
            state,
        });
    };
    const tabStatus = location ? handleTabNavigationFlow(location, 0) : { status: false, tabIndex: 0 };
    return (
        <form
            onSubmit={handleSubmit((data) => {
                handleFormSubmit(data, 'next');
            })}
        >
            <div className={`box-design bd-top-border`}>
                <div className="form-group">
                    <Row>
                        <Col sm={4} className="text-right">
                            <label className="control-label-left">{CONVERSION_CATEGORY}</label>
                        </Col>
                        <Col sm={7}>
                            <RSKendoDropDownList
                                data={conversionCategory}
                                textField="categoryName"
                                dataItemKey="conversionCategoryId"
                                control={control}
                                name="category"
                                label={CONVERSION_CATEGORY}
                                required
                                isLoading={isDropdownLoading}
                                disabled={isDropdownLoading}
                                rules={{ required: SELECT_CONVERSION_CATEGORY }}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="form-group">
                    <Row>
                        <Col sm={4} className="text-right">
                            <label className="control-label-left">{SUBSCRIPTION_FORM}</label>
                        </Col>
                        <Col sm={7}>
                            <RSKendoDropDownList
                                data={subscriptionForms}
                                textField="formName"
                                dataItemKey="formId"
                                control={control}
                                name="subscriptionFormName"
                                label={SUBSCRIPTION_FORM}
                                required
                                isLoading={isDropdownLoading}
                                disabled={isDropdownLoading}
                                rules={{ required: SELECT_SUBSCRPTION_FORM }}
                            />
                        </Col>
                    </Row>
                </div>

                {fields.map((item, index) => {
                    return (
                        <div className={`form-group`} key={item.id}>
                            <Row>
                                {index === 0 && (
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">{CONVERSION_URL}</label>
                                    </Col>
                                )}
                                <Col sm={index === 0 ? { span: 7 } : { span: 7, offset: 4 }}>
                                    <RSInput
                                        name={`conversionUrl.${index}.url`}
                                        placeholder={CONVERSION_URL}
                                        control={control}
                                        // required
                                        rules={{
                                            pattern: {
                                                value: WEBSITE_REGEX,
                                                message: ENTER_VALID_WEBSITE,
                                            },
                                        }}
                                        handleOnBlur={async ({ target: { value } }) => {
                                            const trimmedValue = value?.trim() || '';
                                            if (!trimmedValue) {
                                                update(index, { url: trimmedValue, valid: false });
                                                return;
                                            }

                                            WEBSITE_REGEX.lastIndex = 0;
                                            const isValidUrlFormat = WEBSITE_REGEX.test(trimmedValue);

                                            if (!isValidUrlFormat) {
                                                setError(`conversionUrl.${index}.url`, {
                                                    type: 'custom',
                                                    message: ENTER_VALID_WEBSITE,
                                                });
                                                update(index, { url: trimmedValue, valid: false });
                                                return; 
                                            }

                                            const { status } = await dispatch(
                                                validateWebsite({
                                                    payload: { Website: trimmedValue },
                                                    setError,
                                                    name: `conversionUrl.${index}.url`,
                                                    loading: false,
                                                }),
                                            );

                                            if (status) {
                                                clearErrors(`conversionUrl.${index}.url`);
                                                update(index, { url: trimmedValue, valid: true });
                                            } else {
                                                update(index, { url: trimmedValue, valid: false });
                                            }
                                        }}
                                        handleOnchange={() => {
                                            clearErrors(`conversionUrl.${index}.url`);
                                        }}
                                    />
                                </Col>
                                <Col sm={1} className="fg-icons-wrapper pl0">
                                    <div className="fg-icons d-flex">
                                        <RSTooltip text={`${index === 0 ? 'Add new tracking domain' : 'Remove'}`}>
                                            {index === 0 ? (
                                                <i
                                                    id="rs_data_circle_plus_fill_edge"
                                                    className={`${
                                                        circle_plus_fill_edge_medium
                                                    } icon-md color-primary-blue ${
                                                        fields?.length >= 5 ||  _get(errors, 'conversionUrl')?.length  ? 'click-off' : ''
                                                    }`}
                                                    onClick={handleAddConversionUrlList}
                                                />
                                            ) : (
                                                <i
                                                    id="rs_data_circle_minus_fill_edge"
                                                    className={`${circle_minus_fill_edge_medium} icon-md color-primary-red `}
                                                    onClick={() => handleRemoveConversionUrlList(index)}
                                                />
                                            )}
                                        </RSTooltip>
                                        {item['valid'] && (
                                            <RSTooltip text="Valid URL">
                                                <i
                                                    className={`${circle_tick_mini} icon-md color-dark-green cp`}
                                                />
                                            </RSTooltip>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    );
                })}

                <div className={`form-group`}>
                    <Row>
                        <Col sm={4} className="text-right">
                            <label className="control-label-left">{DURATION}</label>
                        </Col>
                        <Col sm={3}>
                            <RSInput
                                name="minutes"
                                placeholder={MINUTES}
                                control={control}
                                // required
                                rules={DURATION_FIELD_RULE('minutes')}
                                type={'number'}
                                handleOnchange={() => {}}
                            />
                            {/* <RSCheckbox control={control} name="enableAnalytics" labelName="Enable analytics" /> */}
                        </Col>
                        <Col sm={4}>
                            <RSInput
                                name="seconds"
                                placeholder={SECONDS}
                                control={control}
                                // required
                                rules={DURATION_FIELD_RULE('seconds')}
                                type={'number'}
                                handleOnchange={() => {}}
                            />
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="buttons-holder">
                <RSSecondaryButton onClick={handleMdcCancel}>Cancel</RSSecondaryButton>

                {tabStatus?.status ? (
                    <RSSecondaryButton
                        className={`color-primary-blue`}
                        isLoading={isSaveLoading}
                        onClick={handleSubmit((data) => {
                            handleFormSubmit(data, 'save');
                        })}
                    >
                        Save
                    </RSSecondaryButton>
                ) : (
                    <RSPrimaryButton
                        isLoading={isSaveLoading}
                        onClick={handleSubmit((data) => {
                            handleFormSubmit(data, 'save');
                        })}
                    >
                        Save
                    </RSPrimaryButton>
                )}
                {tabStatus?.status && (
                    <RSPrimaryButton type="submit" isLoading={isNextLoading}>
                        Next
                    </RSPrimaryButton>
                )}
            </div>
        </form>
    );
};

export default web;
