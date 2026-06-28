import { UpdateState } from 'Utils/modules/misc';
import { GenerateCsvContent, GetChartData, GetLastDays, noOfDays, PATH_CONVERSION_BAR_CHART_HEIGHT, pathTypes, platform } from '../../constants';
import { ENTER_LIST_NAME as ENTER_LIST_NAME_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { columnChartOptions } from 'Constants/Charts';
import { AA360_RETARGET_NOTE_TEXT, AUDIENCE, CANCEL, CSV_DOWNLOAD, ENTER_LIST_NAME, RETARGET_LIST_NAME_TEXT, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { coloum_chart_medium, csv_download_large, trend_report_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';

import RSTooltip from 'Components/RSTooltip';
import RSHighchartsContainer from 'Components/Highcharts';
import RSFlowChart from 'Components/RSFlowChart';
import RSModal from 'Components/RSModal';
import ListNameExists from 'Components/ListNameExists';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import PersonaMainChart from 'Assets/Images/audienceAnalytics360/persona-graph-min.png';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import { aa_GetWebNotifyGoalSetting, aa_GetGoalPathConversionData, aa_SavetargetList } from 'Reducers/analytics/aa360/request';
import { checkTargetListName } from 'Reducers/audience/targetListCreation/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { PathtoConversionColumnSkeleton, PathToConversionFlowChartSkeleton } from 'Components/Skeleton/Components/SkeletonOverall.jsx'

const transformGoalPathPercentages = (goalOutputJson) => {
    if (!goalOutputJson || typeof goalOutputJson !== 'object') return goalOutputJson;
    const dayKeys = ['Day30', 'Day60', 'Day90'];
    const next = { ...goalOutputJson };
    dayKeys.forEach((key) => {
        const period = next[key];
        if (!period?.Parent || !Array.isArray(period.Child) || period.Child.length === 0) return;
        const first = period?.Child[0];
        const Parent = { ...period.Parent };
        if (first?.FailPercentage !== undefined && first?.FailPercentage !== null) {
            Parent.FailPercentage = first.FailPercentage;
        }
        const origChild = period.Child.map((c, index) => {
            const childList = period.Child
            const nextChild = childList[index + 1]
            return { ...c, FailPercentage: nextChild?.FailPercentage || '' }
        });

        next[key] = { ...period, Parent, Child: origChild };
    });
    return next;
};

const PersonPathConversion = () => {
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [state, setState] = useState({
        pathConversion: 'Path to conversion (Goal)',
        selectedCardType: '',
        selectedPlatform: platform[0],
        selectedDays: noOfDays[0],
        audienceData: {},
    });
    const [selectedChart, setSelectedChart] = useState('flow');
    const isBarViewDeferred = useDeferredValue(selectedChart === 'bar');
    const { isAgency } = getUserDetails();
    const {accountAdmin, company_clientId} = useSelector(({ globalstate }) => globalstate);
    const {  goalPathConversionData_loading, webNotifyGoalSetting_loading } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const [popup, setPopup] = useState(false);
    const methods = useForm();
    const { control, handleSubmit, setValue } = methods;
    const [isDownloadCSV, setDownloadCSV] = useState(false);
    const [goalPathLastUpdatedDate, setGoalPathLastUpdatedDate] = useState('Date');
    const [flowChartData, setFlowChartData] = useState({});
    const [flowChartFullListData, setFlowChartFullListData] = useState({});
    const [golSettingList, setGoalSettingList] = useState([]);
    const [golSettingAry, setGoalSettingAry] = useState([]);
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const [isListNameValid, setIsListNameValid] = useState(false);

    const barChartOptions = useMemo(() => {
        if (selectedChart !== 'bar' && !isBarViewDeferred) return null;
        const days = GetLastDays(state.selectedDays);
        const rawChartData = GetChartData(flowChartFullListData[days]);
        if (!rawChartData || !Object.keys(rawChartData).length) return null;
        return columnChartOptions({
            ...rawChartData,
            height: PATH_CONVERSION_BAR_CHART_HEIGHT,
        });
    }, [selectedChart, isBarViewDeferred, state.selectedDays, flowChartFullListData]);

    const hasBarChartData = barChartOptions?.series?.some((series) =>
        series?.data?.some((point) => point?.y != null && point.y > 0),
    );
    const isBarChartLoading =
        isLocalLoading || goalPathConversionData_loading || webNotifyGoalSetting_loading;

    const handleReTargetListPopup = (data,flowChartData) => {
        const parentValue = flowChartData.Parent
        const mergeParentAndChild = [parentValue,...flowChartData?.Child]
        const nextChildData = mergeParentAndChild?.find((item)=> parseInt(item?.WindowID,10) === parseInt(data?.WindowID,10)+1)
        setPopup(true);
        setState({ ...state, audienceData: { ...data },nextChildData });
        setIsListNameValid(false);
    };

    const handleClosePopup = () => {
        setPopup(false);
        setValue('retarget_list', '');
        setIsListNameValid(false);
    };

    // useEffect(() => {
    //     const payload = {
    //         departmentId: `${departmentId}`,
    //         clientId,
    //         userId,
    //         deviceType: state.selectedPlatform.toLocaleLowerCase(),
    //     };
    //     dispatch(aa_GetWebNotifyGoalSetting({ payload })).then((result) => {
    //         console.log('aa_GetWebNotifyGoalSettingresult', result);
    //         const { status, data } = result;
    //         let ary = [];
    //         if (status && data) {
    //             data?.forEach((item) => {
    //                 ary = [...ary, item.webNotifYGoalName];
    //             });
    //             setGoalSettingList(data);
    //             setGoalSettingAry(ary);
    //         }
    //     });
    // }, [departmentId, clientId]);

    useEffect(() => {
        let days = GetLastDays(state.selectedDays);
        setFlowChartData(flowChartFullListData[days]);
        let formattedDate = flowChartFullListData?.[days]?.['LastRunDateTime']
            // ? getDateWithDayfullFormat(flowChartFullListData[days]['LastRunDateTime'])
            ? getUserCurrentFormat(flowChartFullListData[days]['LastRunDateTime'])?.dateTimeFormat
            : '';
        setGoalPathLastUpdatedDate(formattedDate);
    }, [state.selectedDays, departmentId, clientId, flowChartFullListData]);

    useEffect(() => {
        if(!isAgencyAccountAdmin){
            const payload = {
                departmentId: `${departmentId}`,
                clientId,
                userId,
                deviceType: state.selectedPlatform.toLocaleLowerCase(),
            };
            dispatch(aa_GetWebNotifyGoalSetting({ payload })).then((result) => {
                // console.log('aa_GetWebNotifyGoalSettingresult', result);
                const { status, data } = result ?? {};
                let ary = [];
                data?.forEach((item) => {
                    ary = [...ary, item?.webNotifYGoalName];
                });
                setGoalSettingList(data);
                setGoalSettingAry(ary);
                if (ary?.length > 0 && !state?.selectedCardType) {
                    UpdateState(setState, 'selectedCardType', ary[0]);
                }

                let goalSettingId = data?.[0]?.['webNotifyGoalSettingID'];
                if (goalSettingId) {
                    const payload = {
                        departmentId,
                        clientId,
                        userId,
                        goalSettingID: `${goalSettingId}`,
                        deviceType: state.selectedPlatform.toLocaleLowerCase(),
                    };
                    dispatch(aa_GetGoalPathConversionData({ payload })).then((result) => {
                        const { status, data } = result ?? {};
                        if (status && data) {
                            let goalOutputJson = data?.[0]?.['goalOutputJson'];
                            // console.log('goalOutputJson', JSON.parse(goalOutputJson));
                            goalOutputJson = transformGoalPathPercentages(safeParseJSON(goalOutputJson, {}));
                            setFlowChartFullListData(goalOutputJson);
                            let days = GetLastDays(state.selectedDays);
                            setFlowChartData(goalOutputJson[days]);
                            let formattedDate = goalOutputJson?.[days]?.['LastRunDateTime']
                                // ? getDateWithDayfullFormat(goalOutputJson[days]['LastRunDateTime'])
                                ? getUserCurrentFormat(goalOutputJson[days]['LastRunDateTime'])?.dateTimeFormat
                                : '';
                            setGoalPathLastUpdatedDate(formattedDate);
                            setIsLocalLoading(false);   
                        }else{
                            setIsLocalLoading(false);
                            setFlowChartFullListData({});
                            setFlowChartData({});
                        }
                    });
                } else {
                    setFlowChartFullListData({});
                    setFlowChartData({});
                    setIsLocalLoading(false);
                }
            });
        }
    }, [state.selectedPlatform, departmentId, clientId]);
 
    useEffect(() => {
        if (!isAgencyAccountAdmin) {
            let goalSettingId = golSettingList?.filter((item) => item?.webNotifYGoalName === state.selectedCardType);
            goalSettingId = goalSettingId?.[0]?.['webNotifyGoalSettingID'];
            // console.log('goalSettingId', goalSettingId);
            if (goalSettingId) {
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                    goalSettingID: `${goalSettingId}`,
                    deviceType: state.selectedPlatform.toLocaleLowerCase(),
                };
                dispatch(aa_GetGoalPathConversionData({ payload })).then((result) => {
                    // console.log('goal path conversion', result);
                    const { status, data } = result ?? {};
                    if (status && data) {
                        let goalOutputJson = data?.[0]?.['goalOutputJson'];
                        goalOutputJson = transformGoalPathPercentages(safeParseJSON(goalOutputJson, {}));
                        setFlowChartFullListData(goalOutputJson);
                        let days = GetLastDays(state.selectedDays);
                        setFlowChartData(goalOutputJson[days]);
                        let formattedDate = goalOutputJson?.[days]?.['LastRunDateTime']
                            ? // ? getDateWithDayfullFormat(goalOutputJson[days]['LastRunDateTime'])
                            getUserCurrentFormat(goalOutputJson[days]['LastRunDateTime'])?.dateTimeFormat
                            : '';
                        setGoalPathLastUpdatedDate(formattedDate);
                        setIsLocalLoading(false);
                    } else {
                        setFlowChartFullListData({});
                        setFlowChartData({});
                    }
                    setIsLocalLoading(false);
                });
            } else {
                setFlowChartFullListData({});
                setFlowChartData({});
                setIsLocalLoading(false);
            }
        }
    }, [state.selectedCardType, departmentId, clientId]);

    const handleCsvDownload = () => {
        let filename = state.selectedCardType;
        let csvContent = GenerateCsvContent(flowChartFullListData, state.selectedDays);
        let content = `Worksheet :\n${csvContent}`;
        // const encodedUri = encodeURI(csvContent);
        // const link = document.createElement('a');
        // link.setAttribute('href', encodedUri);
        // link.setAttribute('download', filename);
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);

        const blob = new Blob([content], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };
     const isPathConversionNoData =
        !webNotifyGoalSetting_loading &&
        !goalPathConversionData_loading &&
        !isLocalLoading &&
        (!flowChartData || !Object.keys(flowChartData)?.length);
    const hasFlowChartData = Object.keys(flowChartFullListData)?.length > 0;

    const handleSaveRetargetList = (formData) => {
        const payload = {
            segmentationName: formData.retarget_list,
            HSearchExpression:  state?.nextChildData?.Queries || state?.nextChildData?.Query ||  state?.audienceData?.Queries ||  state?.audienceData?.Query || '',
            RecipientCount: state?.audienceData?.ActualCount || 0,
            departmentId,
            clientId,
            userId
        };
        dispatch(aa_SavetargetList({ payload })).then((result) => {
            if (result?.status) {
                handleClosePopup();
            }else{
                handleClosePopup();
            }
        });
    };
    return (
        <div className="portlet-container portlet-md h-auto pathConversion">
            <div className="portlet-header">
                <h4 className="d-flex">
                    {' '}
                    {/* <BootstrapDropdown
                        data={pathTypes}
                        alignRight
                        defaultItem={pathTypes?.[1]}
                        customAlignRight={true}
                        onSelect={(path) => {
                            UpdateState(setState, 'pathConversion', path);
                        }}
                        showUpdate={true}
                        // isCustomDefaultIcon
                    /> */}
                    <span>{pathTypes}</span>
                    {goalPathLastUpdatedDate && <small className="ml10">(As on:{goalPathLastUpdatedDate})</small>}
                </h4>

                {state.pathConversion === 'Path to conversion (Goal)' && (
                    <div className="d-flex align-items-center">
                        {webNotifyGoalSetting_loading || isLocalLoading ? (
                            <HorizontalSkeleton height={32} />
                        ) : (
                             golSettingAry?.length > 0 && (
                                <BootstrapDropdown
                                    data={golSettingAry}
                                    alignRight
                                    defaultItem={state?.selectedCardType || golSettingAry?.[0]}
                                    customAlignRight={true}
                                    className="mr15 "
                                    //fieldKey={'webNotifYGoalName'}
                                    onSelect={(cardType) => {
                                        setIsLocalLoading(true);
                                        UpdateState(setState, 'selectedCardType', cardType);
                                    }}
                                    showUpdate={true}
                                    isActive
                                />
                            )
                        )}
                        <BootstrapDropdown
                            data={platform}
                            alignRight
                            defaultItem={state.selectedPlatform}
                            customAlignRight={true}
                            className="mr15"
                            onSelect={(platform) => {
                                setIsLocalLoading(true);
                                UpdateState(setState, 'selectedPlatform', platform);
                            }}
                            showUpdate={true}
                            isCustomDefaultIcon
                        />
                        <BootstrapDropdown
                            data={noOfDays}
                            alignRight
                            defaultItem={state.selectedDays}
                            customAlignRight={true}
                            className="mr15"
                            onSelect={(noOfDays) => {
                                UpdateState(setState, 'selectedDays', noOfDays);
                            }}
                            showUpdate={true}
                            isCustomDefaultIcon
                        />
                        <RSTooltip text={CSV_DOWNLOAD} className="lh0">
                            <span className={!hasFlowChartData ? 'pe-none click-off lh0' : 'lh0'}>
                                <i
                                    className={`icon-lg color-primary-blue ${csv_download_large}`}
                                    id="rs_PersonPathConversion_download"
                                    onClick={() => {
                                        if (hasFlowChartData) {
                                            handleCsvDownload();
                                        }
                                    }}
                                />
                            </span>
                        </RSTooltip>
                    </div>
                )}
            </div>
            <div className="portlet-body h-auto d-block">
                {state.pathConversion !== 'Path to conversion (Goal)' ? (
                    <div className="text-center mt15">
                        <img src={PersonaMainChart} alt="Perna Main Chart" />
                    </div>
                ) : (
                    <Fragment>
                        <ul className="pathConversionIconList d-flex align-items-center lh0">
                            <li
                                className={`${selectedChart === 'flow' ? 'active' : ''}`}
                                onClick={() => setSelectedChart('flow')}
                            >
                                <RSTooltip position="top" text="Flow chart" className={'lh0'}>
                                    <i
                                        className={`${trend_report_medium} icon-md`}
                                        id="rs_PersonPathConversion_trendreport"
                                    ></i>
                                </RSTooltip>
                            </li>
                            <li
                                className={`${selectedChart === 'bar' ? 'active' : ''}`}
                                onClick={() => setSelectedChart('bar')}
                            >
                                <RSTooltip position="top" text="Bar chart" className={'lh0'}>
                                    <i
                                        className={`${coloum_chart_medium} icon-md`}
                                        id="rs_PersonPathConversion_columnchart"
                                    ></i>
                                </RSTooltip>
                            </li>
                        </ul>
                       <div className='mt21'>
                         {selectedChart === 'flow' ? (
                            flowChartData && Object.keys(flowChartData)?.length && !isLocalLoading ? (
                                <RSFlowChart
                                    chartData={flowChartData}
                                    actionMenus={['Retarget list']}
                                    onEdgeClick={(val) => {
                                        handleReTargetListPopup(val,flowChartData);
                                    }}
                                />
                            ) : (
                                <div className="position-relative mt15">
                                    <PathToConversionFlowChartSkeleton isError={isPathConversionNoData} />
                                </div>
                            )
                        ) : !isBarViewDeferred || isBarChartLoading ? (
                                <div className="barChart">
                                    <PathtoConversionColumnSkeleton />
                                </div>
                            ) : isPathConversionNoData || !hasBarChartData ? (
                                <div className="barChart">
                                    <PathtoConversionColumnSkeleton isError />
                                </div>
                            ) : (
                                <div className="barChart">
                                    <RSHighchartsContainer
                                        options={barChartOptions}
                                        type="pathToConversion"
                                        height={`${PATH_CONVERSION_BAR_CHART_HEIGHT}px`}
                                        isError={false}
                                    />
                                </div>
                            )}
                       </div>
                    </Fragment>
                )}
            </div>
            {isDownloadCSV && (
                <DownloadCSV
                    show={isDownloadCSV}
                    handleClose={() => setDownloadCSV(false)}
                    onSuccess={() => setDownloadCSV(false)}
                    // title="Request to download CSV"
                />
            )}
           {popup && (
                <RSModal
                    show={popup ? true : false}
                    handleClose={handleClosePopup}
                    isBorder
                    size='md'
                    header="Retarget list"
                    // headerRightContent={`Audience : ${state?.audienceData?.AudienceCount}`}
                    footer={
                        <span>
                            <RSSecondaryButton onClick={handleClosePopup}>{CANCEL}</RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                onClick={handleSubmit((data) => {
                                    handleSaveRetargetList(data);
                                })}
                                className={!isListNameValid ? 'click-off':''}
                            >
                                {SAVE}
                            </RSPrimaryButton>
                        </span>
                    }
                    body={
                        <FormProvider {...methods}>
                            <form>
                                <div className='d-flex justify-content-end mt-9'>
                                    <span>{AUDIENCE} : <span className='font-bold fs19'>{state?.audienceData?.AudienceCount}</span></span>
                                </div>
                                <div>
                                    <p className='mb15'>{RETARGET_LIST_NAME_TEXT}</p>
                                    <ListNameExists
                                        name="retarget_list"
                                        field="listName"
                                        placeholder={ENTER_LIST_NAME}
                                        apiCallback={checkTargetListName}
                                        condition={({ status }) => !status}
                                        rules={{ required: ENTER_LIST_NAME_MSG }}
                                        customErrorMessage={ENTER_LIST_NAME_MSG}
                                        extraPayload={{ listId: 0 }}
                                        onValid={(status) => {
                                            setIsListNameValid(status);
                                        }}
                                        callback={(value) => {
                                            if (!value || value.trim().length === 0) {
                                                setIsListNameValid(false);
                                            }
                                        }}
                                    />
                                    <small>
                                        {AA360_RETARGET_NOTE_TEXT}
                                    </small>
                                </div>
                            </form>
                        </FormProvider>
                    }
                />
            )}
        </div>
    );
};

export default PersonPathConversion;
