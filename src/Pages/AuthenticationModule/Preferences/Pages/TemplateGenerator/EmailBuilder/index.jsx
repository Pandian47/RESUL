import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { useEffect, useState } from 'react';
import RSTabbarFluid from 'Components/RSTabberFluid';
import { useLocation } from 'react-router-dom';
import { tabData } from './constants';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { templateGalleryListApi_AI, templateCategoryListApi_AI } from 'Reducers/preferences/EmailBuilder/request';
import { getSessionId } from 'Reducers/globalState/selector';

import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
// import '@resulticks/email-builder/dist/style.css';

const EmailBuilderHome = () => {
    const location = useLocation();
    const { state } = location;
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [categoriesData, setCategoriesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [payload, setPayload] = useState({
        departmentId,
        clientId,
        userId: 0,
        channelId: 1,
        templatecategory: 'All template',
        pagination: {
            pageNo: 1,
            recordLimit: 4,
        },
        isFilter: true,
        filteration: {
            templateName: '',
            startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: getYYMMDD(new Date()),
            templateCategoryId: '',
        },
    });

    const handleTemplate = async (value) => {
        let updatedPayload = {
            ...payload,
            userId: value.text === 'My templates' ? userId : 0,
            templatecategory: value.text === 'My templates' ? 'My template' : 'All template',
            pagination: {
                pageNo: 1,
                recordLimit: 4,
            },
            filteration: {
                templateName: '',
                startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
                endDate: getYYMMDD(new Date()),
                templateCategoryId: '',
            },
        };

        setPayload(updatedPayload);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const payloadForApi = {
                ...payload,
                departmentId: departmentId,
                clientId: clientId,
                filteration: {
                    ...payload?.filteration,
                    templateCategoryId: payload?.filteration?.templateCategoryId || '',
                },
            };
            await dispatch(templateGalleryListApi_AI(payloadForApi));
            setIsLoading(false);
        };
        fetchData();
        handleCategories(payload?.templatecategory);
    }, [payload]);
    // console.log(state);
    const handleCategories = async (dataCatageory) => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        let { status, data } = await dispatch(templateCategoryListApi_AI(payload));
        if (status) {
            if (dataCatageory === 'My template' || dataCatageory === 'All template') {
                let myTemplateCategory = {
                    categoryName: 'All',
                    templateCategoryId: userId,
                };
                setCategoriesData([myTemplateCategory, ...data]);
            } else {
                setCategoriesData(data);
            }
        } else {
            setCategoriesData([]);
        }
    };
    return (
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="Email template gallery"
                isTabber
                rightCommonMenus
                isBack
                backPath="/preferences/template-gallery"
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <div className="pc-tabs-wrapper">
                <div className="page-content pc-communication-plan">
                    <Container fluid>
                        <div className="page-content">
                            <RSTabbarFluid
                                defaultClass={`col-md-4 col-sm-4`}
                                dynamicTab={`mb0 mini rst-left-space`}
                                activeClass={`active`}
                                tabData={tabData(
                                    payload,
                                    setPayload,
                                    categoriesData,
                                    userId,
                                    handleCategories,
                                    isLoading,
                                )}
                                //defaultTab={tabData[2]}
                                className="rs-tabs row"
                                defaultTab={state?.index ?? 0}
                                callBack={handleTemplate}
                            />
                        </div>
                    </Container>
                </div>
            </div>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default EmailBuilderHome;
