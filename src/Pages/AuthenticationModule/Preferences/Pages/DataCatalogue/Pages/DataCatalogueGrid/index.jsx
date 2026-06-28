import { CARD_VIEW, DOWNLOAD_LINK_DATA_SHORTLY, THANK_YOU_YOUR_REQUEST } from 'Constants/GlobalConstant/Placeholders';
import { circle_grid_fill_edge_large, csv_download_large, data_attributes_schema_large, list_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row } from 'react-bootstrap';

import RSPageHeader from 'Components/RSPageHeader';
import CustomKendoGrid from 'Components/RSCustomKendoGrid';
import { DataCatalogueGridTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { DATACATALOGUE_GRID_COLUMN } from '../../constant';
import { dataCatalogueGrid } from 'Reducers/preferences/datacatalogue/request';
import { getSessionId } from 'Reducers/globalState/selector';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import { useWindowSize } from 'Hooks/useWindowSize';
import useSkipFirstRender from 'Hooks/useSkipFirstRender';
import { resetOtpState } from 'Reducers/Preferences/MyProfile/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { downloadTargetListFiles } from 'Reducers/audience/targetList/request';
import ConfigureDedupeSettings from 'Pages/AuthenticationModule/Audience/Pages/AddAudience/Components/ConfigureDedupeSettings/ConfigureDedupeSettings';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { FormProvider, useForm } from 'react-hook-form';
import SyncHistoryPipeline from 'Pages/AuthenticationModule/Audience/Pages/SyncHistory/Components/SyncHistoryPipeline/SyncHistoryPipeline';
import SynchistoryContext from 'Pages/AuthenticationModule/Audience/Pages/SyncHistory/context';
import { SOURCE_FILTER_DEFAULT } from 'Pages/AuthenticationModule/Audience/Pages/SyncHistory/constants';
import { AUDIENCE_LIST_LAST_30_DAYS_OFFSET } from 'Pages/AuthenticationModule/Audience/audienceModuleDefaults';
import { getDateWithDaynoFormat } from 'Utils/modules/dateTime';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const DataCatalogueGrid = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const methods = useForm();
    const [otpModal, setOtpModal] = useState(false);
    const [otpSuccessModal, setOtpSuccessModal] = useState(false);
    const [allData, setAllData] = useState([]);
    const [gridReady, setGridReady] = useState(false);
    const [initialPagination, setInitialPagination] = useState(false);
    const [graphToggle, setGraphToggle] = useState(true);
    const [pipelinePayload, setPipelinePayload] = useState(null);
    const [pipelineDates] = useState(() => ({
        startDate: getDateWithDaynoFormat(AUDIENCE_LIST_LAST_30_DAYS_OFFSET),
        endDate: new Date(),
        selectedDateText: 'Last 30 days',
    }));
    const syncHistoryContextValue = useMemo(
        () => ({
            dates: pipelineDates,
            pipelinePayload,
            setPipelinePayload,
            payload: { sourceFilter: SOURCE_FILTER_DEFAULT },
        }),
        [pipelineDates, pipelinePayload],
    );
    const { pageSize } = useWindowSize();
    const gridLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });

    const [dataState, setDataState] = useState({
        skip: 0,
        take: pageSize,
    });

    const loadGridData = useCallback(() => {
        if (!clientId || !departmentId || !userId) {
            return undefined;
        }
        const payload = { departmentId, clientId, userId };
        setInitialPagination(true);
        return gridLoadApi.refetch({
            fetcher: () => dispatch(dataCatalogueGrid({ payload })),
            onSuccess: ({ data, status }) => {
                if (status) {
                    const parsedData = parseAudienceJsonArray(data, []);
                    const sortedData = parsedData.sort((a, b) => {
                        const nameA = a.friendly_name ? a.friendly_name.toLowerCase() : '';
                        const nameB = b.friendly_name ? b.friendly_name.toLowerCase() : '';
                        if (nameA < nameB) return -1;
                        if (nameA > nameB) return 1;
                        return 0;
                    });
                    setAllData(sortedData);
                } else {
                    setAllData([]);
                }
            },
            onError: () => {
                setAllData([]);
            },
            onSettled: () => {
                setGridReady(true);
            },
        });
    }, [clientId, departmentId, userId, dispatch, gridLoadApi.refetch]);

    useEffect(() => {
        setGridReady(false);
        loadGridData();
    }, [loadGridData]);

    useSkipFirstRender(() => {
        setGridReady(false);
        setDataState({
            skip: 0,
            take: pageSize,
        });
        setInitialPagination(true);
        loadGridData();
    }, [departmentId, clientId]);

    const handlePagerChange = (data) => {
        const { skip, take } = data?.dataState ?? {};
        setDataState({ skip, take });
        setInitialPagination(false);
    };

    const handlePageSizeChange = (dataState) => {
        const { skip, take } = dataState;
        setDataState({ skip, take });
    };

    const handleDownloadCSV = async (keyData) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            sentMailList: keyData,
            ismailsendrequest: 1,
        };
        const { status } = await dispatch(downloadTargetListFiles(payload));

        if (status) {
            dispatch(resetOtpState());
            setOtpModal(false);
            setOtpSuccessModal(true);
        } else {
            setOtpModal(true);
        }
    };

    const paginatedData = useMemo(() => {
        const { skip, take } = dataState;
        return allData.slice(skip, skip + take);
    }, [allData, dataState]);

    const showGridSkeleton = graphToggle && (!gridReady || gridLoadApi.isFetching);

    return (
        <FormProvider {...methods}>
            <div className="page-content-holder">
                <RSPageHeader title="Data catalog" isBack rightCommonMenus backPath="/preferences/data-catalogue" />
                <Container fluid>
                    <div className="page-content pc-data-catalogue">
                        <Container className="px0">
                            <div className="d-flex align-items-center justify-content-end mb19">
                                <ConfigureDedupeSettings type="catalogue" />
                                <RSTooltip text={!graphToggle ? 'List view' : 'Pipeline details'} className="lh0 mr15">
                                    <i
                                        className={`${
                                            graphToggle ? data_attributes_schema_large : list_large
                                        } icon-lg color-primary-blue`}
                                        onClick={() => setGraphToggle(!graphToggle)}
                                    />
                                </RSTooltip>
                                <RSTooltip text={'Download CSV'} className="lh0 mr15">
                                    <i
                                        onClick={() => {
                                            setOtpModal(true);
                                        }}
                                        className={`${csv_download_large} icon-lg color-primary-blue`}
                                    />
                                </RSTooltip>
                                <RSTooltip position="top" text={CARD_VIEW} className="lh0">
                                    <i
                                        onClick={() => navigate('/preferences/data-catalogue')}
                                        className={`${circle_grid_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                    />
                                </RSTooltip>
                            </div>
                            {!graphToggle ? (
                                <div className="box-design">
                                    <SynchistoryContext.Provider value={syncHistoryContextValue}>
                                        <SyncHistoryPipeline isActive />
                                    </SynchistoryContext.Provider>
                                </div>
                            ) : showGridSkeleton ? (
                                <DataCatalogueGridTableSkeleton rows={dataState.take || pageSize || 10} />
                            ) : (
                                <Row>
                                    <CustomKendoGrid
                                        data={paginatedData}
                                        noBoxShadow={true}
                                        column={DATACATALOGUE_GRID_COLUMN()}
                                        scrollable={'scrollable'}
                                        settings={{
                                            total: allData?.length,
                                        }}
                                        isDataStateRequired
                                        onDataStateChange={(data) => handlePagerChange(data)}
                                        pagerChange={initialPagination}
                                        setInitialPagination={setInitialPagination}
                                        filterable={true}
                                        onPageSizeChange={handlePageSizeChange}
                                        isLoading={false}
                                    />
                                </Row>
                            )}
                        </Container>
                    </div>
                </Container>

                <DownloadCSV
                    show={otpModal}
                    isDataCatalogue
                    handleClose={() => setOtpModal(false)}
                    onSuccess={(keyData) => {
                        handleDownloadCSV(keyData);
                    }}
                />
                {otpSuccessModal && (
                    <RSConfirmationModal
                        show={otpSuccessModal}
                        htmlContent={
                            <p className="text-center">
                                {THANK_YOU_YOUR_REQUEST}
                                <br />
                                {DOWNLOAD_LINK_DATA_SHORTLY}
                            </p>
                        }
                        secondaryButton={false}
                        primaryButton={false}
                        handleClose={() => {
                            setOtpSuccessModal(false);
                        }}
                    />
                )}
            </div>
        </FormProvider>
    );
};

export default DataCatalogueGrid;
