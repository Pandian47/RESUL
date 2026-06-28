import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { useEffect, useState } from 'react';
import RSTabbarFluid from 'Components/RSTabberFluid';
import { useLocation } from 'react-router-dom';
import { tabData } from './constants';
import { Container } from 'react-bootstrap';
import RSPageHeader from 'Components/RSPageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import AddConfirmationModal from './Components/AddConfirmationModal/AddConfirmationModal';

import { getSessionId } from 'Reducers/globalState/selector';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { templateGalleryListApi_AI } from 'Reducers/preferences/EmailBuilder/request';

const LandingTemplateBuilder = () => {
    const methods = useForm();
    const dispatch = useDispatch();
    const location = useLocation();
    const { state } = location;
    const [addModalShow, setAddModalShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [payload, setPayload] = useState({
        departmentId,
        clientId,
        userId: 0,
        channelId: 32,
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
            },
        };

        setPayload(updatedPayload);
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const payloadForApi = {
                ...payload,
                departmentId,
                clientId,
            };
            await dispatch(templateGalleryListApi_AI(payloadForApi));
            setIsLoading(false);
        };
        fetchData();
    }, [payload, departmentId, clientId, dispatch]);

    return (
        <FormProvider {...methods}>
            <>
                {/* Main page heading block starts */}
                {/* <LandingTemplateContext.Provider value={value}> */}
                {/* {addTemplate ? (
                        <>
                            <LandingPageBuilder name={landingPageName} />
                        </>
                    ) : ( */}
                <div className="page-content-holder">
                    <RSPageHeader
                        title="Landing page template gallery"
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
                                        defaultClass={`col-md-4`}
                                        dynamicTab={`mb0 mini rst-left-space`}
                                        activeClass={`active`}
                                        tabData={tabData(setAddModalShow, payload, setPayload, isLoading)}
                                        className="rs-tabs row"
                                        defaultTab={state?.index ?? 0}
                                        callBack={handleTemplate}
                                    />
                                </div>
                            </Container>
                        </div>
                    </div>
                </div>
                {/* )} */}
                <AddConfirmationModal show={addModalShow} handleClose={() => setAddModalShow(false)} />
                {/* Main page content block ends */}
                {/* </LandingTemplateContext.Provider> */}
            </>
        </FormProvider>
        // Content holder ends
    );
};

export default LandingTemplateBuilder;
