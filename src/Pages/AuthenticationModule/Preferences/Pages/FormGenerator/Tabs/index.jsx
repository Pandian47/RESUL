import { getEnvironment } from 'Utils/modules/environment';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import _isNil from 'lodash/isNil';
import _get from 'lodash/get';
import useQueryParams from 'Hooks/useQueryParams';
import RSPageHeader from 'Components/RSPageHeader';
import RSTabbar from 'Components/RSTabber';
import { ADD_FORM_TYPES } from '../constant';

// import { useSelector } from 'react-redux';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { LANDING_BUILDER_REDIRECT_URL, baseURL } from 'Constants/EndPoints';

const AddFormGenerator = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useQueryParams('/preferences/form-generator/add-form-generator');
    const isEditMode = parseInt(location?.recipientFormId, 10) > 0;
    const env = getEnvironment();
    const isRunEnv = env === 'RUN' || false;
    const [currentTab, setCurrentTab] = useState(() => {
        if (parseInt(location?.recipientFormId, 10) > 0) {
            return _get(location, 'from', null) ?? null;
        }
        return null;
    });

    // Update URL when tab is selected
    useEffect(() => {
        if (currentTab !== null) {
            searchParams.set('tabSelected', 'true');
            setSearchParams(searchParams, { replace: true });
        } else {
            searchParams.delete('tabSelected');
            setSearchParams(searchParams, { replace: true });
        }
    }, [currentTab]);

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const token = localStorage.getItem('accessToken');
    const jwtToken = localStorage.getItem('jwtToken');

    const handleBack = () => {
        if (location?.isPushBuilder) {
            const backState = location?.backState?.state || {};
            const templateId = backState?.templateId || location?.recipientFormId || location?.templateId;

            let decodedDetails = {};
            if (location?.getUrlParams?.channelDetails) {
                try {
                    decodedDetails = JSON.parse(atob(location.getUrlParams.channelDetails));
                } catch (error) {
                }
            }

            let params = {
                templateName: decodedDetails?.name || location?.templateName || '',
                channelId: decodedDetails?.channelId || location?.channelId,
                catagoryId: location?.categoryId,
                templateId: templateId,
                departmentId: decodedDetails?.departmentId || departmentId,
                clientId: decodedDetails?.clientId || clientId,
                userId: decodedDetails?.userId || userId,
            };

            let channelDetails = JSON.stringify(params);
            const domain = window.location.origin;
            const builderType = location?.getUrlParams?.builderType || location?.builderType;

            const redirectUrl = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
                token,
            )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(
                clientId,
            )}&userId=${encodeURIComponent(userId)}&departmentId=${encodeURIComponent(
                departmentId,
            )}&templateId=${templateId}&mode=edit&jwtToken=${encodeURIComponent(
                jwtToken || '',
            )}&baseURL=${encodeURIComponent(baseURL)}&from=${domain}&builderType=${builderType}${
                backState?.triggerComponentId ? `&formId=${backState.triggerComponentId}` : ''
            }`;

            window.location.href = redirectUrl;
        } else {
            navigate(location?.isPushBuilder ? location.backPath : '/preferences/form-generator');
        }
    };
    return (
        <>
            <div className={`page-content-holder ${_isNil(currentTab) ? '' : 'pt0'}`}>
                {/* Main page heading block starts */}
                {_isNil(currentTab) && (
                    <RSPageHeader
                        title={
                            isEditMode
                                ? `Edit form${location?.formName ? `: ${location?.formName}` : ''}`
                                : 'Create new form'
                        }
                        isBack
                        // backPath="/preferences/form-generator"
                        onBack={handleBack}
                        backPath={location?.isPushBuilder ? location.backPath : '/preferences/form-generator'}
                        rightCommonMenus
                        isHeaderLine
                        backAction={location?.isPushBuilder ? location?.backState?.state : undefined}
                    />
                )}

                {/* Info Card Builder for Form Generator */}

                {/* Main page content block starts */}
                <div className="page-content">
                    <div className="planning-layout fromGenerator">
                        <div className="communication-create clearfix">
                            <div className="rs-camp-tabs-holder">
                                {' '}
                                <RSTabbar
                                    dynamicTab={`rs-content-tabs dm-tabs ${
                                        !_isNil(currentTab) ? 'col-sm-9 no-border-bottom' : ''
                                    }`}
                                    activeClass={`active`}
                                    tabData={ADD_FORM_TYPES(setCurrentTab, isRunEnv)}
                                    cTabsBig
                                    defaultTab={currentTab}
                                    isHeadingBlock
                                    refresh={isEditMode ? false : true}
                                    isRefreshConfirmation={true}
                                    disableOtherTabs
                                    isFormRefresh
                                    heading={'Select the form type'}
                                    callBack={(_, currentIndex) => setCurrentTab(currentIndex)}
                                />
                            </div>{' '}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddFormGenerator;

