import { decryptWithAES } from 'Utils/modules/crypto';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { useForm } from 'react-hook-form';
import {
    get_InstagramPages,
    getDataExchangeElements,
    save_SocialUserSetup,
} from 'Reducers/preferences/DataExchange/request';
import { useNavigate } from 'react-router-dom';

import { parseDecryptedAudienceQuery } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { navigateBackToCommunicationSocialPostAsync } from 'Pages/AuthenticationModule/Communication/CreateCommunication/communicationDefaults';
let socialMediaList = [],
    socialMedia_LinkedInData = {},
    socialMedia_TwitterData = {},
    socialMedia_InstaData = {},
    socialMedia_facebookData = {};

const SocialMedia = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { control, handleSubmit, watch, setValue } = useForm();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const {
        integratedSystem,
        addCard,
        socialMediaImg,
        socialMediaFlag,
        socialMediaFlag_fb,
        getFBPages,
        socialMediaFlag_linkedin,
        getLinkedinPages,
        socialMediaFlag_twitter,
        getTwitterPages,
        socialMediaFlag_insta,
        getInstaPages,
        getPinterestPages,
        socialMediaFlag_pinterest,
        socialMediaFlag_fbads,
        getFBads,
        socialMediaFlag_Gads,
        getGads,
        socialMediaFlag_Youtube,
        getYoutube
    } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);

    const [pageList, setPageList] = useState([]);

    const closeModal = () => {
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: false }));
        dispatch(updateIntegartedSytem({ field: 'getFBPages', data: [] }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_fb', data: false }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_linkedin', data: false }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_twitter', data: false }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_insta', data: false }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_pinterest', data: false }));
        dispatch(updateIntegartedSytem({ field: 'getLinkedinPages', data: {} }));
        dispatch(updateIntegartedSytem({ field: 'getTwitterPages', data: [] }));
        dispatch(updateIntegartedSytem({ field: 'getInstaPages', data: {} }));
        dispatch(updateIntegartedSytem({ field: 'getPinterestPages', data: {} }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_fbads', data: false }));
        dispatch(updateIntegartedSytem({ field: 'getFBads', data: {} }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_Gads', data: false }));
        dispatch(updateIntegartedSytem({ field: 'getGads', data: {} }));
        dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_Youtube', data: false }));
        dispatch(updateIntegartedSytem({ field: 'getYoutube', data: {} }));
        setState(0);
        navigate('/preferences/data-exchange');
        localStorage.removeItem('socialPostQuery')
    };
    const handleSave = async (data) => {
                var res;
        if (
            socialMediaFlag_fbads ||
            socialMediaFlag_fb ||
            socialMediaFlag_linkedin ||
            socialMediaFlag_insta ||
            socialMediaFlag_pinterest
        ) {
            let socialPageList = socialMediaFlag_insta ? pageList?.map(({ accountId, ...rest }) => rest) : pageList;
            let payload = {
                departmentId,
                clientId,
                userId,
                socialMediaSetupList: socialPageList,
            };
            res = await dispatch(save_SocialUserSetup(payload));
        }
        if (socialMediaFlag_Gads) {
            let socialPageList = socialMediaFlag_Gads
                ? pageList?.map(({ accountId, pageName, pageId, ...rest }) => ({
                      //   ...rest,
                      socialMediaChannelId: 11,
                      //   developerToken: getGads?.apiRes.data[0]?.developerToken,
                      token: getGads?.token,
                      expires_in: getGads?.apiRes.data[0]?.expires_in,
                      refreshToken: getGads?.apiRes.data[0]?.refreshToken,
                      refreshTokenexpiresin: getGads?.apiRes.data[0]?.refreshTokenexpiresin,
                      pageName: pageName,
                      pageId: pageId,
                      isTracking: true,
                  }))
                : pageList;
            let payload = {
                departmentId,
                socialMediaSetupList: socialPageList,
            };
            res = await dispatch(save_SocialUserSetup(payload));
        }
        if (socialMediaFlag_Youtube) {
            
            let socialPageList = socialMediaFlag_Youtube
                ? pageList?.map(({ accountId, pageName, pageId, ...rest }) => ({
                      //   ...rest,
                      socialMediaChannelId: 13,
                      token: getYoutube?.token,
                      expires_in: getYoutube?.apiRes.data[0]?.expires_in,
                      refreshToken: getYoutube?.apiRes.data[0]?.refreshToken,
                      refreshTokenexpiresin: getYoutube?.apiRes.data[0]?.refreshTokenexpiresin,
                      pageName: pageName,
                      pageId: pageId,
                      isTracking: true,
                  }))
                : pageList;
            let payload = {
                departmentId,
                socialMediaSetupList: socialPageList,
            };
            res = await dispatch(save_SocialUserSetup(payload));
        }

        if (res?.status) {
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: false }));
            dispatch(updateIntegartedSytem({ field: 'getFBPages', data: [] }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_fb', data: false }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_linkedin', data: false }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_twitter', data: false }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_insta', data: false }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_pinterest', data: false }));
            dispatch(updateIntegartedSytem({ field: 'getLinkedinPages', data: {} }));
            dispatch(updateIntegartedSytem({ field: 'getTwitterPages', data: [] }));
            dispatch(updateIntegartedSytem({ field: 'getInstaPages', data: {} }));
            dispatch(updateIntegartedSytem({ field: 'getPinterestPages', data: {} }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_fbads', data: false }));
            dispatch(updateIntegartedSytem({ field: 'getFBads', data: {} }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_Gads', data: false }));
            dispatch(updateIntegartedSytem({ field: 'getGads', data: {} }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag_Youtube', data: false }));
            dispatch(updateIntegartedSytem({ field: 'getYoutube', data: {} }));
            if(!res?.data?.isExist){
                let socialPostQuery = localStorage.getItem('socialPostQuery');
                const quries = parseDecryptedAudienceQuery(socialPostQuery, decryptWithAES, null);
                if (quries?.fromCommunication) {
                    navigateBackToCommunicationSocialPostAsync(dispatch, navigate, quries);
                } else {
                    navigate('/preferences/data-exchange');
                }
                
            }else{
                dispatch(updateIntegartedSytem({ field: 'alreadyIntegrated', data: true }));
            }
            const payload = {
                    departmentId,
                    clientId,
                    userId,
                };
                dispatch(getDataExchangeElements(payload, false, [], !res?.data?.isExist ? true : false));
        }else{
            localStorage.removeItem('socialPostQuery')
        }
        //dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: false }));
        // dispatch(updateIntegartedSytem({ field: 'connectFields', data: addCard }));
    };

    const [state, setState] = useState(0);

    const handlePlus = () => {
        if (socialMediaImg?.length - 1 === state) {
            let _integratedSystem = [...integratedSystem];
            _integratedSystem.push(addCard);
            dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: _integratedSystem }));
            dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: false }));
            setState(0);
        } else {
            setState(state + 1);
        }
    };

    const hanldeMinus = () => {
        if (state !== 0) setState(state - 1);
    };
    useEffect(() => {
        //  dispatch(updateIntegartedSytem({ field: 'socialMediaFlag', data: true }));
    }, []);
    // useEffect(() => {
    //     socialMedia_LinkedInData = getLinkedinPages;
    // }, [getLinkedinPages]);

    // console.log('socialMedia_LinkedInData: ', socialMedia_LinkedInData);
    return (
        <>
            <RSModal
                show={socialMediaFlag}
                // isBorder={false}
                size="md"
                header={
                    socialMediaFlag_fb
                        ? 'Facebook page(s)'
                        : socialMediaFlag_insta
                        ? 'Account detail(s)'
                        : socialMediaFlag_linkedin
                        ? 'Linkedin page(s)'
                        : socialMediaFlag_twitter
                        ? 'Twitter page(s)'
                        : socialMediaFlag_pinterest
                        ? 'Pinterest page(s)'
                        : socialMediaFlag_fbads
                        ? 'Facebook ads page(s)'
                        : socialMediaFlag_Gads
                        ? 'Google ads account(s)'
                        :  socialMediaFlag_Youtube
                        ? 'Youtube account(s)' 
                        : ''
                }
                handleClose={closeModal}
                body={
                    <>
                        <form onSubmit={handleSubmit((data) => handleSave(data))} className="form-group mb20">
                            {socialMediaFlag_fb &&
                                getFBPages?.length > 0 &&
                                getFBPages.map((fbPage, index) => {
                                    return (
                                        <RSCheckbox
                                            key={index}
                                            control={control}
                                            labelName={fbPage.name}
                                            data-id={fbPage?.id}
                                            data-access_token={fbPage?.access_token}
                                            name={fbPage.name}
                                            handleChange={(e) => {
                                                const pageId = e.target.dataset.id;
                                                const accessToken = e.target.dataset.access_token;
                                                if (e.target.checked) {
                                                    setPageList((prevPageList) => [
                                                        ...prevPageList,
                                                        {
                                                            pageName: e.target.id,
                                                            pageId: pageId,
                                                            token: accessToken,
                                                            isTracking: true,
                                                            socialMediaChannelId: 1,
                                                        },
                                                    ]);
                                                } else {
                                                    setPageList((prevPageList) =>
                                                        prevPageList?.filter((item) => item?.pageId !== pageId),
                                                    );
                                                }
                                            }}
                                        />
                                    );
                                })}
                            {socialMediaFlag_insta &&
                                getInstaPages?.pages?.length > 0 &&
                                getInstaPages?.pages?.map((instaPage, index) => {
                                    const pageId = instaPage?.instagram_business_account?.id;
                                    const matchingPage = pageList?.find((p) => p?.pageId === pageId);
                                    return (
                                        <>
                                            <RSCheckbox
                                                key={index}
                                                control={control}
                                                labelName={instaPage.name}
                                                data-id={instaPage?.instagram_business_account?.id}
                                                data-access_token={getInstaPages?.token}
                                                name={instaPage.name}
                                                handleChange={async (e) => {
                                                    const accountId = e.target.dataset.id;
                                                    const accessToken = e.target.dataset.access_token;
                                                    if (e.target.checked) {
                                                        let payload = {
                                                            accountId: accountId,
                                                            accessToken: accessToken,
                                                        };

                                                        let { status, data } = await dispatch(
                                                            get_InstagramPages(payload),
                                                        );
                                                        if (status) {
                                                            setPageList((prevPageList) => [
                                                                ...prevPageList,
                                                                {
                                                                    pageName: data?.name,
                                                                    pageId: data?.id,
                                                                    token: accessToken,
                                                                    isTracking: true,
                                                                    socialMediaChannelId: 6,
                                                                    accountId: accountId,
                                                                },
                                                            ]);
                                                        } else {
                                                            setValue(instaPage.name, false);
                                                        }
                                                    } else {
                                                        setPageList((prevPageList) =>
                                                            prevPageList?.filter(
                                                                (item) => item?.accountId !== accountId,
                                                            ),
                                                        );
                                                    }

                                                    // socialMediaList.push({
                                                    //     pageName: e.target.id,
                                                    //     pageurl: e.target.dataset.id + '_' + e.target.dataset.access_token,
                                                    //     isTracking: true,
                                                    //     socialMediaChannelId: 6,
                                                    // });
                                                    // console.log(e.target.dataset, e.target.id);
                                                    // console.log(socialMediaList, 'socialMediaList');
                                                }}
                                            />
                                            {matchingPage && <div>{matchingPage.pageName}</div>}
                                        </>
                                    );
                                })}

                            {socialMediaFlag_linkedin &&
                                getLinkedinPages?.pages?.length > 0 &&
                                getLinkedinPages?.pages?.map((linkedinPage, index) => {
                                    return (
                                        <RSCheckbox
                                            key={index}
                                            control={control}
                                            labelName={linkedinPage?.name}
                                            data-id={linkedinPage?.id}
                                            data-access_token={getLinkedinPages?.token}
                                            name={linkedinPage?.name}
                                            handleChange={(e) => {
                                                const pageId = e.target.dataset.id;
                                                const accessToken = e.target.dataset.access_token;
                                                if (e.target.checked) {
                                                    setPageList((prevPageList) => [
                                                        ...prevPageList,
                                                        {
                                                            pageName: e.target.id,
                                                            pageId: pageId,
                                                            token: accessToken,
                                                            isTracking: true,
                                                            socialMediaChannelId: 8,
                                                        },
                                                    ]);
                                                } else {
                                                    setPageList((prevPageList) =>
                                                        prevPageList?.filter((item) => item?.pageId !== pageId),
                                                    );
                                                }
                                                // socialMediaList.push({
                                                //     pageName: e.target.id,
                                                //     pageurl: e.target.dataset.id + '_' + e.target.dataset.access_token,
                                                //     isTracking: true,
                                                //     socialMediaChannelId: 8,
                                                // });
                                                // console.log(e.target.dataset, e.target.id);
                                                // console.log(socialMediaList, 'socialMediaList');
                                            }}
                                        />
                                    );
                                })}
                            {socialMediaFlag_pinterest &&
                                getPinterestPages?.pages?.length > 0 &&
                                getPinterestPages?.pages?.map((pinterestPage, index) => {
                                    return (
                                        <RSCheckbox
                                            key={index}
                                            control={control}
                                            labelName={pinterestPage?.name}
                                            data-id={pinterestPage?.id}
                                            data-access_token={getPinterestPages?.token}
                                            name={pinterestPage?.name}
                                            handleChange={(e) => {
                                                const pageId = e.target.dataset.id;
                                                const accessToken = e.target.dataset.access_token;
                                                const refreshToken = getPinterestPages?.refreshToken;
                                                if (e.target.checked) {
                                                    setPageList((prevPageList) => [
                                                        ...prevPageList,
                                                        {
                                                            pageName: e.target.id,
                                                            pageId: pageId,
                                                            token: accessToken,
                                                            isTracking: true,
                                                            socialMediaChannelId: 5,
                                                            refreshToken: refreshToken,
                                                        },
                                                    ]);
                                                } else {
                                                    setPageList((prevPageList) =>
                                                        prevPageList?.filter((item) => item?.pageId !== pageId),
                                                    );
                                                }
                                                // socialMediaList.push({
                                                //     pageName: e.target.id,
                                                //     pageurl: e.target.dataset.id + '_' + e.target.dataset.access_token,
                                                //     isTracking: true,
                                                //     socialMediaChannelId: 8,
                                                // });
                                                // console.log(e.target.dataset, e.target.id);
                                                // console.log(socialMediaList, 'socialMediaList');
                                            }}
                                        />
                                    );
                                })}

                            {socialMediaFlag_fbads &&
                                getFBads?.pages?.length > 0 &&
                                getFBads.pages?.map((fbPage, index) => {
                                    return (
                                        <RSCheckbox
                                            key={index}
                                            control={control}
                                            labelName={fbPage.name}
                                            data-id={fbPage?.id}
                                            data-access_token={getFBads.token}
                                            name={fbPage.name}
                                            handleChange={(e) => {
                                                const pageId = e.target.dataset.id;
                                                const accessToken = e.target.dataset.access_token;
                                                if (e.target.checked) {
                                                    setPageList((prevPageList) => [
                                                        ...prevPageList,
                                                        {
                                                            pageName: e.target.id,
                                                            pageId: pageId,
                                                            token: accessToken,
                                                            isTracking: true,
                                                            socialMediaChannelId: 10,
                                                        },
                                                    ]);
                                                } else {
                                                    setPageList((prevPageList) =>
                                                        prevPageList?.filter((item) => item?.pageId !== pageId),
                                                    );
                                                }
                                            }}
                                        />
                                    );
                                })}

                            {socialMediaFlag_Gads &&
                                getGads?.pages?.length > 0 &&
                                getGads.pages?.map((gPage, index) => {
                                    return (
                                        <RSCheckbox
                                            key={index}
                                            control={control}
                                            labelName={gPage.customer.descriptiveName}
                                            data-id={gPage?.customer?.id}
                                            data-access_token={getGads.token}
                                            name={gPage.customer.descriptiveName}
                                            handleChange={(e) => {
                                                const pageId = e.target.dataset.id;
                                                const accessToken = e.target.dataset.access_token;
                                                if (e.target.checked) {
                                                    setPageList((prevPageList) => [
                                                        ...prevPageList,
                                                        {
                                                            pageName: e.target.id,
                                                            pageId: pageId,
                                                            token: accessToken,
                                                            isTracking: true,
                                                            socialMediaChannelId: 11,
                                                        },
                                                    ]);
                                                } else {
                                                    setPageList((prevPageList) =>
                                                        prevPageList?.filter((item) => item?.pageId !== pageId),
                                                    );
                                                }
                                            }}
                                        />
                                    );
                                })}

                                
                            {socialMediaFlag_Youtube &&
                                getYoutube?.pages?.length > 0 &&
                                getYoutube.pages?.map((yPage, index) => {
                                    return (
                                        <RSCheckbox
                                            key={index}
                                            control={control}
                                            labelName={yPage.kind}
                                            data-id={yPage?.id}
                                            data-access_token={getYoutube.token}
                                            name={yPage.kind}
                                            handleChange={(e) => {
                                                const pageId = e.target.dataset.id;
                                                const accessToken = e.target.dataset.access_token;
                                                if (e.target.checked) {
                                                    setPageList((prevPageList) => [
                                                        ...prevPageList,
                                                        {
                                                            pageName: e.target.id,
                                                            pageId: pageId,
                                                            token: accessToken,
                                                            isTracking: true,
                                                            socialMediaChannelId: 13,
                                                        },
                                                    ]);
                                                } else {
                                                    setPageList((prevPageList) =>
                                                        prevPageList?.filter((item) => item?.pageId !== pageId),
                                                    );
                                                }
                                            }}
                                        />
                                    );
                                })}

                            {/* (
                                // <p>asdsdf</p>
                                <Col sm={12} className="text-center">
                                    <img src={socialMediaImg[state]} />
                                </Col>
                            ) */}
                        </form>
                        {/* {socialMediaImg?.length === 1 ? (
                            <Col sm={12} className="text-right mt30">
                                <RSSecondaryButton onClick={closeModal} className="mr15">
                                    {'Cancel'}
                                </RSSecondaryButton>
                                <RSPrimaryButton onClick={handleSave}>{'Log In'}</RSPrimaryButton>
                            </Col>
                        ) : (
                            <Col sm={12} className="text-right mt30">
                                <RSSecondaryButton onClick={hanldeMinus} className="mr15">
                                    {'Cancel'}
                                </RSSecondaryButton>
                                <RSPrimaryButton onClick={handlePlus}>{'Next'}</RSPrimaryButton>
                            </Col>
                        )} */}
                    </>
                }
                footer={
                    <div className="btn-container d-flex justify-content-end m0">
                        <RSSecondaryButton
                            onClick={() => {
                                closeModal();
                            }}
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton type="submit" onClick={handleSubmit((data) => handleSave(data))}>
                            Add
                        </RSPrimaryButton>
                    </div>
                }
            />
        </>
    );
};

export default SocialMedia;
