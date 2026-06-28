import { encodeUrl } from 'Utils/modules/crypto';
import { circle_plus_fill_edge_medium, user_call_center_xlarge, webhook_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import { Card, Col } from 'react-bootstrap';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { dataExchangeSector } from '../../../constant';
import Image_placeholder from 'Assets/Images/data_exchange/image-placeholder.svg';

import { adobeTabManagement, resulticksAnalytics } from '../DataExchangeModals/Common/constants';
import { getImage } from '../DataExchangeModals/SocialMedia/constants';

import { getTableColumnDetails, getTableDropDown, versiumDataUpdate } from 'Reducers/RemoteDataSource/reducer';
import {
    dataExchange_connection_blackbaud_login,
    dataExchange_connection_Webinar_login,
} from 'Reducers/remoteDataSource/request';
import { getAccessTokens_Twitter, getSocialMediaOauthUrl } from 'Reducers/preferences/DataExchange/request';
import usePermission from 'Hooks/usePersmission';
import { BI_DIRECTION_ENABLED_IDS } from '../../../../../../../Audience/Pages/AddAudience/Components/RemoteDataSourceNew/Components/constants';
const ViewDataComponent = ({ dataExchange }) => {
    const openInNewTab = (url) => {
        window.location.href = url;
        //window.open(url, '_blank', 'noopener,noreferrer');
        // window.open(url, null, 'height=600,width=900,status=yes,toolbar=no,menubar=no,location=no');
    };
    const { permissionList, permissions } = usePermission();
    const { addAccess } = permissions || {};
    const navigate = useNavigate();
    const location = useLocation();
    const pathName = location?.pathname?.split('/')?.pop();
    const dispatch = useDispatch();
    const { integratedSystem } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const blackBaudLogin = async () => {
        const response = await dispatch(
            dataExchange_connection_blackbaud_login({
                payload: { redirectUrl: window.location.origin + window.location.pathname + '?crm=blackbaud' },
            }),
        );

        if (response?.status) {
            let url = response?.data?.loginUrl;
            // 'https://app.blackbaud.com/oauth/authorize?client_id=bd052b97-d4ce-41bc-aea3-ff489ae3c548&response_type=code&redirect_uri=https%3a%2f%2flocalhost:4000%2fpreferences%2fdata-exchange%3fcrm%3dblackbaud';
            //  https://app.blackbaud.com/oauth/authorize?client_id=bd052b97-d4ce-41bc-aea3-ff489ae3c548&response_type=code&redirect_uri=https%3a%2f%2freacuixstg.resul.io%2fpreferences%2fdata-exchange%3fcrm%3dblackbaud
            openInNewTab(url);
        }
    };
    const webMediaData = {
        gotowebinar: { Name: 'Resulticks-GoToWebinar', WebMediaTypeID: 158 },
        webex: { Name: 'Resulticks-Webex', WebMediaTypeID: 106 },
        gotomeeting: { Name: 'Resulticks-GoToMeeting', WebMediaTypeID: 107 },
    };
    const WebLogin = async (ele) => {
        const response = await dispatch(
            dataExchange_connection_Webinar_login({
                payload: {
                    remoteDataSourceID: webMediaData[ele?.sourceName?.toLowerCase()]?.WebMediaTypeID,
                    remoteDataSourceName: webMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                    redirectUrl:
                        window.location.origin +
                        window.location.pathname +
                        `?webinar=${ele?.remoteDataSourceID === 158 ? 'gotowebinar' : 'webex'}`,
                    // redirectUrl: 'https://reacuix.resul.io/preferences/data-exchange?webinar=gotomeeting',
                },
            }),
        );
        if (response?.status) {
            let url = response?.data;
            openInNewTab(url);
        }
    };
    const socialMediaData = {
        facebook: { Name: 'Resulticks-Facebook', SocialMediaTypeID: 1 },
        twitter: { Name: 'Resulticks-Twitter', SocialMediaTypeID: 3 },
        linkedin: { Name: 'Resulticks-Linkedin', SocialMediaTypeID: 8 },
        instagram: { Name: 'Resulticks-Instagram', SocialMediaTypeID: 6 },
        pinterest: { Name: 'Resulticks-Pinterest', SocialMediaTypeID: 5 },
        'facebook ads': { Name: 'Resulticks-FacebookAds', SocialMediaTypeID: 10 },
        'google ads': { Name: 'Resulticks-GoogleAds', SocialMediaTypeID: 11 },
        youtube: { Name: 'Resulticks-Youtube', SocialMediaTypeID: 13 },
    };
    const socialMediaLogin = async (ele) => {
        if (ele?.remoteDataSourceID === 24) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 157) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl:
                    window.location.origin +
                    window.location.pathname +
                    `?socialpage=${ele?.sourceName?.toLowerCase()?.replace(/\s+/g, '')}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                // openInNewTab(url);
                window.location.href = url;
            }
        } else if (ele?.remoteDataSourceID === 26) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getAccessTokens_Twitter(payload));

            if (response?.status) {
                let url = response?.data?.authTokenUrl;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 82) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl: window.location.origin + window.location.pathname + `-${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;

                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 83) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 85) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl:
                    window.location.origin + window.location.pathname + `?socialpage=${ele?.sourceName?.toLowerCase()}`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 89) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl: window.location.origin + window.location.pathname + `?paidmedia=googleads`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        } else if (ele?.remoteDataSourceID === 84) {
            let payload = {
                socialMediaTypeId: socialMediaData[ele?.sourceName?.toLowerCase()]?.SocialMediaTypeID,
                socialMediaTypeName: socialMediaData[ele?.sourceName?.toLowerCase()]?.Name,
                redirectUrl: window.location.origin + window.location.pathname + `?socialpage=youtube`,
            };
            const response = await dispatch(getSocialMediaOauthUrl({ payload }));
            if (response?.status) {
                let url = response?.data;
                openInNewTab(url);
            }
        }
    };
    const handleNavigate = (type, data, connectionType) => {
        const enableBiDirection = BI_DIRECTION_ENABLED_IDS.has(data?.remoteDataSourceID);

        const updatedData = enableBiDirection ? data : { ...data, connectionType: 0 };

        const state = {
            isAudience: pathName === 'add-audience',
            from: 'data_exchange',
            type,
            data: updatedData,
            connectionType: enableBiDirection ? connectionType : false,
        };

        const encryptState = encodeUrl(state);

        navigate(`/audience/add-audience?q=${encryptState}`, {
            state,
        });
    };
    const handleCardAdd = (ele) => {
        if (ele?.remoteDataSourceID === 55) {
            blackBaudLogin();
            return;
        } else if (
            ele?.remoteDataSourceID === 158 ||
            ele?.remoteDataSourceID === 106 ||
            ele?.remoteDataSourceID === 107
        ) {
            WebLogin(ele);
            return;
        } else if (ele?.remoteDataSourceID === 89 || ele?.remoteDataSourceID === 84) {
            socialMediaLogin(ele);
            return;
        }

        let connectionType = ele?.connectionType === 1 ? true : false;
        dispatch(updateIntegartedSytem({ field: 'addCard', data: ele }));
        let sourceName = ele.sourceName;
        switch (sourceName) {
            case 'RESUL':
                dispatch(updateIntegartedSytem({ field: 'resulAnalyticsFlag', data: true }));
                dispatch(updateIntegartedSytem({ field: 'resulGenerateCodewithInputs', data: resulticksAnalytics }));
                break;
            case 'AdobeAnalytics':
                dispatch(updateIntegartedSytem({ field: 'analytics', data: dataExchangeSector?.adobeAnalitycs }));
                dispatch(updateIntegartedSytem({ field: 'adobeAnalyticFlag', data: true }));
                break;
            case 'WebTrends':
                dispatch(updateIntegartedSytem({ field: 'analytics', data: dataExchangeSector?.webTrends }));
                dispatch(updateIntegartedSytem({ field: 'adobeAnalyticFlag', data: true }));
                break;
            case 'TagAdobe':
            case 'bbc':
            case 'abcnews':
                dispatch(updateIntegartedSytem({ field: 'resulAnalyticsFlag', data: true }));
                dispatch(updateIntegartedSytem({ field: 'resulGenerateCodewithInputs', data: adobeTabManagement }));
                break;
            case 'siebel':
            case 'SalesForce':
            case 'BigCommerce':
            case 'Magento':
            case 'Commercetools':
            case 'WooCommerce':
            case 'Wix':
            case 'Shopify':
            case 'Databricks':
            case 'Pipedrive':
            case 'Cassandra':
            case 'Aerospike':
            case 'LeadsquaredCRM':
            case 'Insightly':
            case 'Storehippo':
            case 'PrestaShop':
            case 'Oracle':
            case 'Postgresql':
            case 'MySQL':
            case 'PrestoDB':
            case 'MSSQL':
            case 'Snowflake':
            case 'Dynamic CRM':
            case 'Hubspot':
            case 'Bigquery':
            case 'Mongodb':
            case 'Google Sheets':
            case 'C&L':
                handleNavigate(sourceName?.toLowerCase(), ele, connectionType);
                break;
            case 'sugarcrm':
            case 'saphybris':
            case 'vuer':
            case 'adobeaudiencemanager':
            case 'neustar':
            case 'kbm':
            case 'bluekai':
            case 'lotame':
            case 'exelate':
            case 'acxiom':
            case 'dataaxle':
            case 'liveramp':
            case 'versium':
            case 'Versium':
                const stateversim = { from: 'data_exchange', type: 'versium', data: ele };
                dispatch(versiumDataUpdate({}));
                dispatch(getTableColumnDetails([]));
                dispatch(getTableDropDown([]));
                const encryptstateversim = encodeUrl(stateversim);
                navigate(`/audience/add-audience?q=${encryptstateversim}`, {
                    state: stateversim,
                });
                break;
            case 'webex':
            case 'gotomeeting':
            case 'Eventbrite':
                // const stateEventbrite = { from: 'data_exchange', type: 'eventbrite', data: ele };
                // const encryptStateEventbrite = encodeUrl(stateEventbrite);
                // navigate(`/audience/add-audience?q=${encryptStateEventbrite}`, {
                //     state: stateEventbrite,
                // });
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'eventBrite' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'Google Analytics':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'googleanalytics' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'Google Tag Manager':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'GoogleTagManager' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'Matomo':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'matomo' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'Eventzilla':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'eventZilla' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'informatica':
            case 'reversand':
            case 'stibosystem':
            case 'orchestra':
            case 'pimcore':
            case 'enterworks':
            case 'marcomcentral':
            case 'workfront':
            case 'webdam':
            case 'widen':
            case 'bynder':
            case 'drupal':
            case 'sitecore':
            case 'kentico':
            case 'opentext':
            case 'sdl':
            case 'adobexperiencemanager':
            case 'hotjar':
            case 'unbounce':
            case 'webhook':
            case 'Webhook':
            case 'Callcenter':
            case 'Zero bounce':            
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'mysql' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'api':
            case 'microsoftazure':
            case 'calendly':
            case 'kiosk':
            case 'pos':
            case 'mqtt':
            case 'cnn':
            case 'toi':
            case 'thehindu':
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'Facebook app':
            case 'facebook':
            case 'Facebook':
                // socialMediaLogin(ele);
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'Facebook' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));

                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_fb', data: true }));
                // let url =
                //     'https://www.facebook.com/v16.0/dialog/oauth?app_id=386495268226000&scope=public_profile, email, pages_manage_metadata, pages_messaging';
                // let redirectURL = window.location.origin + window.location.pathname + '?socialPage=facebook'; // window.location.href;
                // openInNewTab(url + '&redirect_uri=' + redirectURL + '&response_type=token');
                // dispatch(updateIntegartedSytem({ field: 'socialMediaImg', data: getImage(ele.name) }));
                break;
            case 'twitter':
            case 'Twitter':
                socialMediaLogin(ele);
                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_twitter', data: true }));
                // let urltwitter = 'https://twitter.com/oauth/authorize?oauth_token=S-yAzAAAAAABnb4SAAABjoit9rE';
                // let redirectURLtwitter = window.location.origin + window.location.pathname + '?socialPage=twitter'; //window.location.href;
                // openInNewTab(urltwitter + '&redirect_uri=' + redirectURLtwitter + '&response_type=token');
                // dispatch(updateIntegartedSytem({ field: 'socialMediaImg', data: getImage(ele.name) }));
                break;
            case 'pinterest':
            case 'Pinterest':
                socialMediaLogin(ele);
                break;
            case 'instagram':
            case 'Instagram':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'Instagram' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
                // socialMediaLogin(ele);
                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_insta', data: true }));
                // let urlInsta =
                //     'https://www.facebook.com/v18.0/dialog/oauth?client_id=386495268226000&scope=pages_show_list, ads_management, business_management, instagram_basic, instagram_manage_comments, instagram_manage_insights, instagram_content_publish, pages_read_engagement, public_profile';
                // let redirectURLInsta = window.location.origin + window.location.pathname + '?socialPage=insta'; //window.location.href;
                // openInNewTab(urlInsta + '&redirect_uri=' + redirectURLInsta + '&response_type=token');
                // dispatch(updateIntegartedSytem({ field: 'socialMediaImg', data: getImage(ele.name) }));
                break;
            case 'youtube':
                break;
            case 'Linkedin':
                socialMediaLogin(ele);
                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                // dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_linkedin', data: true }));
                // let urlLinkedIn =
                //     'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86ih8m7kithqym';
                // let redirectURLLinkedIn = window.location.origin + window.location.pathname + '?socialPage=linkedin'; //window.location.href;
                // let redirectURLLinkedIn = window.location.origin + window.location.pathname; //window.location.href;
                // openInNewTab(
                //     urlLinkedIn +
                //         '&redirect_uri=' +
                //         redirectURLLinkedIn +
                //         '&scope=r_organization_social r_1st_connections_size r_ads_reporting rw_organization_admin r_basicprofile r_ads rw_ads w_member_social w_organization_social',
                // );
                //navigate(`/preferences/data-exchange-linked?socialPage=linkedin`);
                // dispatch(updateIntegartedSytem({ field: 'socialMediaImg', data: getImage(ele.name) }));
                break;
            case 'ads data hub':
            case 'display & video 360':
            case 'google ads':
            case 'search ads':
            case 'google ads manager':
            case 'Facebook Ads':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'Facebook Ads' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'facebook exchange':
                dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
                void getImage(ele.name).then((data) => {
                    dispatch(updateIntegartedSytem({ field: 'socialMediaImg', data }));
                });
                break;
            case 'ftp':
            case 'SFTP':
                const stateftp = {
                    from: 'master-data',
                    type: 'SFTP',
                    data: ele,
                    isDataExchange: pathName === 'data-exchange',
                };
                const encryptStateftp = encodeUrl(stateftp);
                navigate(`/audience/add-audience?q=${encryptStateftp}`, {
                    state: stateftp,
                });
                // navigate(`/audience/add-audience`, {
                //     state: { from: 'master-data', type: 'SFTP', data: ele },
                // });
                break;
            case 'Digipop':
                const stateDigipop = { from: 'data_exchange', type: 'digipop', data: ele };
                // dispatch(versiumDataUpdate({}));
                // dispatch(getTableColumnDetails([]));
                // dispatch(getTableDropDown([]));
                const encryptstateDigipop = encodeUrl(stateDigipop);
                navigate(`/audience/add-audience?q=${encryptstateDigipop}`, {
                    state: stateDigipop,
                });
                break;
            // navigate(`/preferences/data-exchange`, {
            //     state: { from: 'data_exchange', type: 'digipop' },
            // });
            // dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
            // break;
            case 'Mixpanel':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'mixpanel' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'Vimeo':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'vimeo' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            case 'Wistia':
                navigate(`/preferences/data-exchange`, {
                    state: { from: 'data_exchange', type: 'wistia' },
                });
                dispatch(updateIntegartedSytem({ field: 'connectFields', data: ele }));
                break;
            default:
                let _integratedSystem = [...integratedSystem];
                _integratedSystem.push(ele);
                dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: _integratedSystem }));
                break;
        }
    };

    return (
        <Fragment>
            {dataExchange?.map((item, index) => {
                //
                return (
                    <Col md={4} key={index}>
                        <Card className={`${item?.remoteDataSourceID} pointer-event-none`}>
                            <Card.Body>
                                {!!item?.imagePath ? (
                                    <img
                                        variant="top"
                                        src={
                                            `/src/Assets/Images/data_exchange/` +
                                            item.sourceGroupName.toLowerCase().replaceAll(/ /g, '_') +
                                            `/` +
                                            item?.imagePath
                                        }
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = Image_placeholder;
                                        }}
                                    />
                                ) :
                                item?.sourceName === 'Webhook' ? (
                                        <i className={`${webhook_xlarge} icon-xlg fs80 wer`}></i>
                                ) : item?.sourceName === 'Callcenter' ? (
                                    <i className={`${user_call_center_xlarge} icon-xlg fs80`}></i> 
                                ) : (
                                    <h2>{item?.sourceName}</h2>
                                )}
                                {!!item?.icon && <i className={item?.icon}></i>}
                                <div className={`${addAccess ? 'pe-auto cursor-pointer' : 'click-off'} addPlusIcon `}>
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`}
                                        onClick={() => {
                                            if (addAccess) {
                                                handleCardAdd(item);
                                            }
                                        }}
                                    ></i>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Fragment>
    );
};

export default ViewDataComponent;
