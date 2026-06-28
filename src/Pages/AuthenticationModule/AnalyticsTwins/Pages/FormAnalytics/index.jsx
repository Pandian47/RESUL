import { getFileDownloadDateTime, getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { PDFExport } from '@progress/kendo-react-pdf';
import { FormProvider } from 'react-hook-form';

import RSPageHeader from 'Components/RSPageHeader';
import { getFormAnalytics } from 'Reducers/analyticsTwins/details/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { resetAnalyticsDetailState } from 'Reducers/analyticsTwins/details/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { SkeletonTable } from 'Components/Skeleton/Skeleton';


import FormAnalyticsContent from './Components/FormAnalyticsContent';
import { getFormProgressiveProfile } from 'Reducers/analyticsTwins/details/request';
import RSTooltip from 'Components/RSTooltip';


const FormAnalytics = () => {
    const dispatch = useDispatch();
    const locationData = useQueryParams('/preferences/template-gallery/form-analytics');

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { formAnalytics, isLoading } = useSelector(({ analyticsDetails }) => analyticsDetails);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);

    const pdfExportComponent = useRef(null);
    const isAlreadyCalledAPi = useRef({
        status: false,
    });

    const exportPDFWithComponent = () => {
        if (pdfExportComponent.current) {
            pdfExportComponent.current.save();
            setTimeout(() => {
                pdfExportComponent?.current?.rootElForPDF.querySelectorAll('*').forEach((element) => {
                    if (
                        element.getAttribute('style')?.trim() ===
                        'transform: none !important; transition: none !important;'
                    ) {
                        element.removeAttribute('style');
                    }
                });
            }, 5000);
        }
    };

    const getFormAnalyticsData = async () => {
        if (!locationData?.formId) {
            return;
        }

        const payload = {
            clientId,
            userId,
            departmentId,
            formId: locationData?.formId,
        };

        const { status, data } = await dispatch(getFormAnalytics({ payload }));
    };
    const getProgressiveProfile = async () => {
        if (!locationData?.formId) {
            return;
        }
        const payload = {
            clientId,
            userId,
            departmentId,
            formId: locationData?.formId,
        };
        const { status, data } = await dispatch(getFormProgressiveProfile({ payload }));
    };
    

    useEffect(() => {
        if (locationData !== null && !isAlreadyCalledAPi?.current?.status && locationData?.formId) {
            dispatch(resetAnalyticsDetailState());
            getFormAnalyticsData();
            getProgressiveProfile();
            isAlreadyCalledAPi.current.status = true;
        }
    }, [locationData]);

    useEffect(() => {
        return () => {
            dispatch(resetAnalyticsDetailState());
        };
    }, []);

    const dateField =
        formAnalytics?.startDate && formAnalytics?.endDate
            ? `${getUserCurrentFormat(formAnalytics?.startDate)?.dateFormat} - ${getUserCurrentFormat(formAnalytics?.endDate)?.dateFormat
            }`
            : '';

    const formName = locationData?.formName || formAnalytics?.formName || 'Form Analytics';

    return (
        <FormProvider>
            <PDFExport
                keepTogether="p"
                margin="1cm"
                ref={pdfExportComponent}
                paperSize="auto"
                fileName={`${formName} Analytics for ${getFileDownloadDateTime()}`}
                author="RESUL"
            >
                <div className="page-content-holder">
                    <RSPageHeader
                        title={
                            <>
                                {formName?.length > 40 ? (
                                   <RSTooltip text= {formName} position='bottom'>
                                     <span className="repo-label">{truncateTitle(formName, 40)}</span>
                                   </RSTooltip>
                                ) : (
                                    <span className="repo-label">{formName}</span>
                                )}
                            </>
                        }
                        pageClass="mb0"
                        titleCls="repo-title"
                        date={dateField}
                        isBuDisabled={true}
                        isAgencyDisabled={true}
                        isBack
                        backPath={locationData?.fromPath ? '/preferences/template-gallery/form-generator' : '/analytics'}
                        isBackAsLink
                        rightCommonMenus
                    />

                    {!isLoading && formAnalytics && Object.keys(formAnalytics).length ? (
                        <Container fluid>
                            <div className="page-content">
                                <Container className="px0">
                                    <FormAnalyticsContent formAnalytics={formAnalytics} /></Container>
                            </div>
                        </Container>
                    ) : (
                        <Container fluid>
                            <div className="page-content">
                                <Container className="px0">
                              <div className="box-design">
                                {isLoading ? <SkeletonTable /> : <SkeletonTable isError={true} />}
                            </div>
                        </Container>
                        </div>
                        </Container>
                    )}
                </div>
            </PDFExport >
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </FormProvider >
    );
};

export default FormAnalytics;
