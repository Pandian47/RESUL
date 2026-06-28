import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { useEffect, useState } from 'react';
import RSTabbarFluid from 'Components/RSTabberFluid';
import { tabData } from './constants';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { templateGalleryListApi_AI, templateCategoryListApi_AI } from 'Reducers/preferences/EmailBuilder/request';

import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { usePushBuilderStateContext } from './Pages/Contex';
import { getSessionId } from 'Reducers/globalState/selector';

const PushBuilderHome = () => {
    const locationHook = useLocation();
    const ctx = usePushBuilderStateContext();

    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const channelIdFromPath = locationHook?.pathname?.includes('mobile-builder-gallery') ? 14 : 8;
    const titleLocal = channelIdFromPath === 14 ? 'Mobile push template gallery' : 'Web push template gallery';

    const [payloadLocal, setPayloadLocal] = useState({
        departmentId,
        clientId,
        userId: 0,
        channelId: channelIdFromPath,
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

    // If the route wrapper is missing (can happen on refresh), render using local fallback.
    const payload = ctx?.payload ?? payloadLocal;
    const setPayload = ctx?.setPayload ?? setPayloadLocal;
    const title = ctx?.title ?? titleLocal;
    const resolvedDepartmentId = ctx?.departmentId ?? departmentId;
    const resolvedClientId = ctx?.clientId ?? clientId;
    const resolvedUserId = ctx?.userId ?? userId;
    const state = ctx?.state ?? locationHook?.state;
    const dispatchFinal = ctx?.dispatch ?? dispatch;

    const [categoriesData, setCategoriesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const handleTemplate = async (value) => {
        let updatedPayload = {
            ...payload,
            userId: value.text === 'My templates' ? resolvedUserId : 0,
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
            await dispatchFinal(
                templateGalleryListApi_AI({ ...payload, departmentId: resolvedDepartmentId, clientId: resolvedClientId }),
            );
            setIsLoading(false);
        };
        fetchData();
        handleCategories(payload?.templatecategory);
    }, [payload]);
    // console.log(state);
    const handleCategories = async (dataCatageory) => {
        const payload = {
            departmentId: resolvedDepartmentId,
            clientId: resolvedClientId,
            userId: resolvedUserId,
        };
        let { status, data } = await dispatchFinal(templateCategoryListApi_AI(payload));
        if (status) {
            if (dataCatageory === 'My template' || dataCatageory === 'All template') {
                let myTemplateCategory = {
                    categoryName: 'All',
                    templateCategoryId: resolvedUserId,
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
            <RSPageHeader title={title} isTabber rightCommonMenus isBack backPath="/preferences/template-gallery" />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <div className="pc-tabs-wrapper">
                <div className="page-content pc-communication-plan">
                    <Container fluid>
                        <div className="page-content">
                            <RSTabbarFluid
                                defaultClass={`col-md-4`}
                                dynamicTab={`mb0 mini rst-left-space`}
                                activeClass={`active`}
                                tabData={tabData(payload, setPayload, categoriesData, userId, handleCategories, isLoading)}
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

export default PushBuilderHome;
