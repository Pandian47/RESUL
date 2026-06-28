import { numberWithCommas } from 'Utils/modules/formatters';
import { analyticsDeviceDesktop, analyticsDeviceMobile, analyticsDeviceTab, newContactsImage, thumbsUp } from 'Assets/Images';
import { meterChartOptionsSmall, pieChartOptions } from 'Constants/Charts';
import { CSV_DOWNLOAD } from 'Constants/GlobalConstant/Placeholders';
import { arrow_left_medium, arrow_right_medium, csv_download_medium, female_large, male_large, user_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import _get from 'lodash/get';
import _map from 'lodash/map';
import RSHighchartsContainer from 'Components/Highcharts';
import { useDispatch, useSelector } from 'react-redux';
import { getIndustry, getKnownToUnknown, getSummaryList } from 'Reducers/analyticsTwins/analyticsSummary/selector';
import { getNewContactList, getTopDeviceInfo } from 'Reducers/analyticsTwins/analyticsSummary/request';
import { getSessionId } from 'Reducers/globalState/selector';

import { PieChartSkeleton } from 'Components/Skeleton/Skeleton';
import { CSRDeviceSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';
import useQueryParams from 'Hooks/useQueryParams';
import { AnalyticsReportProvider } from '../../../..';
import RSTooltip from 'Components/RSTooltip';
import { useForm } from 'react-hook-form';
import { FORM_INITIAL_STATE } from './Constants';
import CSVModal from 'Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Components/CSVModal';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

export const handleCountPercent = (yValue, type) => {
    let chartValue = (yValue / type) * 100;
    return chartValue;
};

const OverviewGrid = ({ data, handleChange, downloadUI }) => {
    const [isExpand, setExpand] = useState(false);
    const dispatch = useDispatch();
    // const state = { from: 65889 };
    // const { state } = useLocation();
    const state = useQueryParams('/analyticsTwins/analytics-report');
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { overviewGrid } = useSelector(({ analyticsReportReducer }) => analyticsReportReducer);
    const summary = useSelector((state) => getSummaryList(state));
    const { channelList } = summary;
    const industry = useSelector((state) => getIndustry(state));
    const knownToUnknown = useSelector((state) => getKnownToUnknown(state));
    const isBusiness1 = summary?.businessType === 1;
    const [newContacts, setNewContacts] = useState('');
    const [newContacts_FormId, setNewContacts_FormId] = useState(0);
    const { refAPIStatus } = useContext(AnalyticsReportProvider);
    const { summaryLoading } = useSelector((state) => state.analyticsReportReducer);
    const topDeviceLoader = useApiLoader({ autoFetch: false, loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG });
    const newContactLoader = useApiLoader({ autoFetch: false, loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG });

    const [isShow, setIsShow] = useState({
        isCSV: false,
        isPublish: false,
        isCSS: false,
        isDelete: false,
        isDuplicate: false,
        confirmationModal: false,
        tableConfig: {},
        isPreview: false,
    });
            const methods = useForm(FORM_INITIAL_STATE);
            const disPatch = useDispatch();
            const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
            const {
                control,
                handleSubmit,
                watch,
                resetField,
                reset,
                setValue,
                getValues,
                setError,
                formState: { errors, isValid, isDirty },
            } = methods;    
    const shouldFetchGridData =
        Boolean(state?.from) &&
        Object.keys(summary || {}).length > 0 &&
        !refAPIStatus?.current?.preventOtherApiCall &&
        !summary?.isFromSnapshot;

    const gridPayload = useMemo(
        () => ({
            campaignId: state?.from,
            clientId,
            userId,
            departmentId,
        }),
        [state?.from, clientId, userId, departmentId],
    );

    const isDeviceCardLoading =
        summaryLoading ||
        (shouldFetchGridData && (topDeviceLoader.isFetching || topDeviceLoader.isIdle));

    const isNewContactCardLoading =
        summaryLoading ||
        (shouldFetchGridData && (newContactLoader.isFetching || newContactLoader.isIdle));

    useEffect(() => {
        if (summary?.campaignName) {
            setValue('communicationName', summary?.campaignName);
        }
    }, [summary?.campaignName, setValue]);

    useEffect(() => {
        if (!shouldFetchGridData) return;

        topDeviceLoader.refetch({
            fetcher: ({ payload }) => dispatch(getTopDeviceInfo({ payload })),
            params: { payload: gridPayload },
        });

        newContactLoader.refetch({
            fetcher: async ({ payload }) => {
                const result = await dispatch(getNewContactList({ payload }));
                if (result?.status) {
                    setNewContacts(result.data);
                    setNewContacts_FormId(result.formId);
                } else {
                    setNewContacts('');
                    setNewContacts_FormId(0);
                }
                return result;
            },
            params: { payload: gridPayload },
        });
    }, [shouldFetchGridData, gridPayload]);

    useEffect(
        () => () => {
            topDeviceLoader.reset();
            newContactLoader.reset();
        },
        [],
    );

    const industryChart = useMemo(() => {
        const industryGraphDataJson = _get(industry, 'industryGraphDataJson[0]', {});
        return _map(industryGraphDataJson?.data ?? [], (res, index) => ({
            name: res.name,
            // y: handleCountPercent(res.y, summary?.channelReachInfo?.totalReachCount),
            y: res.y,
            color: industryGraphDataJson.colors[index],
        }));
    }, [industry]);

    const knowUnknown = useMemo(() => {
        return _map(knownToUnknown, (res, index) => ({
            name: res.name,
            y: res.intValue,
        }));
    }, [knownToUnknown]);
    // console.log('knowUnknown: ', knowUnknown);

    const segmentChart = useMemo(() => {
        const segmentGraphDataJson = _get(industry, 'segmentGraphDataJson[0]', {});
        return _map(segmentGraphDataJson.data, (res, index) => ({
            name: res.name,
            y: res.y,
            color: segmentGraphDataJson.colors[index],
        }));
    }, [industry]);

    const brandPerceptionTempData = {
        height: 140,
        width: 140,
        // value: 66
    };

    const deviceName = {
        desktop: analyticsDeviceDesktop,
        mobile: analyticsDeviceMobile,
        phone: analyticsDeviceMobile,
        tab: analyticsDeviceTab,
    };

    return (
        <Row className={`grid-main-wrapper ${downloadUI ? 'download-page-setup-detail' : ''}`}>
            {/* Device */}
            <Col md={6} className="mb30">
                <div className="grid-lists grid-device position-relative">
                    {topDeviceLoader.isLoading ? (
                        <div className="gallery-list__field-loader" aria-hidden="true">
                            <span className="segment_loader" />
                        </div>
                    ) : null}
                    <h4 className="mb0">Device</h4>
                    {!!overviewGrid?.topDeviceValue ? (
                        <Row className={`d-flex mt35 ${overviewGrid?.topDeviceValue ? 'mt20-del' : 'mt40-del'}`}>
                            <Col md={7}>
                                <img
                                    src={deviceName[overviewGrid?.topDeviceName?.toLowerCase()]}
                                    className="device-img"
                                    alt="Device"
                                />
                            </Col>
                            <Col md={5} className="pl0">
                                <div className="d-flex  align-items-baseline">
                                    {overviewGrid.topDeviceValue ? (
                                        <>
                                            <h1 className="font-bold">{overviewGrid.topDeviceValue}</h1>
                                            <span className="color-primary-black font-bold font-md position-relative lh0">
                                                %
                                            </span>
                                        </>
                                    ) : null}
                                </div>
                                <small className="font-xsm lh21">{overviewGrid.topDeviceName}</small>
                            </Col>
                        </Row>
                    ) : (
                        <CSRDeviceSkeleton nodata={!isDeviceCardLoading} />
                    )}
                </div>
            </Col>

            {/* Industry / Brand perceptions */}
            <Col md={6} className="mb30">
                <div className="grid-lists grid-brand">
                    <h4 className="mb0">{isBusiness1 ? 'Industry' : 'Brand perceptions'}</h4>
                    {isBusiness1 ? (
                        <>
                            {industryChart?.length ? (
                                <Row className="d-flex mt15">
                                    <Col md={6} className="p0 position-relative">
                                        <div className="sm-portlet-chart">
                                            <RSHighchartsContainer
                                                options={pieChartOptions({
                                                    height: 130,
                                                    width: 130,
                                                    legend: {
                                                        enabled: false,
                                                    },
                                                    dataLabels: {
                                                        enabled: false,
                                                    },
                                                    // innerSize: '53%',
                                                    series: industryChart,
                                                })}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={6} className={`pl0`}>
                                        <div className="d-flex align-items-center mt10">
                                            <h1 className="font-bold">65</h1>
                                            <span className="color-primary-black font-bold font-md">%</span>
                                        </div>
                                        <small className="font-xsm color-secondary-black lh21">
                                            Highest reach by known
                                        </small>
                                    </Col>
                                </Row>
                            ) : (
                                <CSRDeviceSkeleton nodata={!summaryLoading} />
                            )}
                        </>
                    ) : (
                        <>
                            {!!brandPerceptionTempData?.value ? (
                                <Row className="brand-wrapper mt30">
                                    <Col md={7} className="p0 ">
                                        <div className="small-custom-gauge">
                                            {/* <img src={thumbsUp} className='thumbsup-icon' alt='thumbsup' /> */}
                                            <RSHighchartsContainer
                                                options={meterChartOptionsSmall(brandPerceptionTempData)}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={5} className="p0 pl4">
                                        <div className="small-content">
                                            <div className="d-flex align-items-center">
                                                <h1 className="font-bold">65</h1>
                                                <span className="color-primary-black font-bold font-md">%</span>
                                            </div>
                                            <small className="font-xsm color-secondary-black lh21">
                                                Positive mentions
                                            </small>
                                        </div>
                                    </Col>
                                </Row>
                            ) : (
                                <CSRDeviceSkeleton nodata={!summaryLoading} />
                            )}
                        </>
                    )}
                </div>
            </Col>

            {/* Segment / By audience type */}
            <Col md={6} className="mb30">
                <div className="grid-lists grid-audience">
                    <h4 className="mb0">{isBusiness1 ? 'Segment' : 'Demography'}</h4>
                    {isBusiness1 ? (
                        <>
                            {/* // TODO {Pandian}: Donut chart */}
                            {/* <ul className='male-female'>
                                    {
                                        segmentChart?.map((item, index) => {
                                            return (
                                                <li className={`${index === 0 ? 'bg-blue-medium' : 'bg-orange-medium'}`} style={{ height: `${item?.y}%` }}>
                                                    <label>{item?.name}</label>
                                                    <div className='d-flex align-items-center mt5'>
                                                        <h1 className='font-bold'>{item?.y}</h1>
                                                        <sub>%</sub>
                                                    </div>
                                                    <i className={`${user_medium} icon-md`}></i>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>

                                <small className='color-secondary-black'>Highest reach by Known</small> */}
                            {segmentChart && segmentChart?.length ? (
                                <RSHighchartsContainer
                                    options={pieChartOptions({
                                        height: 150,
                                        legend: {
                                            enabled: false,
                                        },
                                        dataLabels: {
                                            enabled: false,
                                        },
                                        innerSize: '53%',
                                        series: segmentChart,
                                    })}
                                />
                            ) : (
                                <Row className="d-flex height96p">
                                    <Col>
                                        <PieChartSkeleton className="mt0" noLegend size={100} nodata={!summaryLoading} />
                                    </Col>
                                </Row>
                            )}
                        </>
                    ) : (
                        <>
                            {summary?.demographic?.malePercent > 0 || summary?.demographic?.femaleCount > 0 ? (
                                <Row>
                                    <ul className="male-female">
                                        <li
                                            className={'bg-male'}
                                            style={{ height: `${summary?.demographic?.malePercent > 45 ? summary?.demographic?.malePercent * 1.2 : 55}%` }}

                                        >
                                            <div className="d-flex align-items-center mt5 justify-content-center">
                                                <h1 className="font-bold">{summary?.demographic?.malePercent}</h1>
                                                <sub>%</sub>
                                            </div>
                                            <i className={`${male_large} icon-md`}></i>
                                        </li>

                                        <li
                                            className={'bg-female'}
                                            style={{ height: `${summary?.demographic?.femalePercent > 45 ? summary?.demographic?.femalePercent * 1.2 :  55 }%` }}

                                        >
                                            <div className="d-flex align-items-center mt5 justify-content-center">
                                                <h1 className="font-bold">{summary?.demographic?.femalePercent}</h1>
                                                <sub>%</sub>
                                            </div>
                                            <i className={`${female_large} icon-md`}></i>
                                        </li>
                                    </ul>
                                    <small className="color-secondary-black text-center">
                                        Highest reach by{' '}
                                        {summary?.demographic?.maleCount >= summary?.demographic?.femaleCount
                                            ? 'Male'
                                            : 'Female'}
                                    </small>
                                </Row>
                            ) : (
                                <Row className="d-flex height96p">
                                    <Col>
                                        <PieChartSkeleton className="mt0" noLegend size={100} nodata={!summaryLoading} />
                                    </Col>
                                </Row>
                            )}
                        </>
                    )}
                </div>
            </Col>

            {/* New contacts */}
            <Col md={6} className="mb30">
                <div className="grid-lists grid-contacts position-relative">
                    {newContactLoader.isLoading ? (
                        <div className="gallery-list__field-loader" aria-hidden="true">
                            <span className="segment_loader" />
                        </div>
                    ) : null}
                    <div className='d-flex gap-8 justify-content-between'> 
                    <h4 className="mb0">New contacts</h4>
                    {newContacts ?  
                        <div className='d-flex gap-2 justify-content-end'>
                                <RSTooltip text={CSV_DOWNLOAD}>
                              
                                     <i
                                        id="rs_FormGenerator_CSV"
                                        className={`${csv_download_medium} icon-md color-primary-blue`}
                                        onClick={() =>{ 
                                            let getRecipientFormId = newContacts_FormId || 0; 
                                            setIsShow((pre) => ({ ...pre, isCSV: true , tableConfig: {recipientFormId : getRecipientFormId}}))}}
                                    ></i>
                                </RSTooltip>
                            </div>
                            :
                            null
                    }                    
                </div>
                    {newContacts ? (
                        <Row className="d-flex align-items-center mt25">
                            <Col md={5}>
                                <img src={newContactsImage} alt="new contacts" className="width90" />
                            </Col>
                            <Col md={7} className="p0">
                                <div className="mt4">
                                    <h1 className="font-bold">{numberWithCommas(newContacts)} </h1>
                                    <small className="font-xsm color-secondary-black lh21">
                                        Acquired in this communication
                                    </small>
                                </div>
                            </Col>
                        </Row>
                    ) : (
                        <CSRDeviceSkeleton nodata={!isNewContactCardLoading} />
                    )}

                    <div className="new-contact-expand">
                        <RSTooltip text={isExpand ? 'Collapse' : 'Expand'}>
                        <i
                            className={`${isExpand ? arrow_left_medium : arrow_right_medium} icon-md`}
                            onClick={async () => {
                                await handleChange(!isExpand);
                                setExpand(!isExpand);
                            }}
                        />
                        </RSTooltip>
                    </div>
                </div>
            </Col>
            {isShow.isCSV && (
                <CSVModal                
                    show={isShow.isCSV}
                    handleActions={(status) => {
                        setIsShow((pre) => ({ ...pre, isCSV: status }));
                    }}
                    data={isShow.tableConfig}
                    communicationName = {summary?.campaignName}
                    campaignId = {state?.from}
                    fromAnalyticsReport={true}
                />
            )}
        </Row>
    );
};

export default memo(OverviewGrid);
