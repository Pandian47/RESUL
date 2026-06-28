import { encodeUrl } from 'Utils/modules/crypto';
import { addTabKey } from '../../constants';
import { MAX_LENGTH75, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_SNAPSHOT_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { download_medium, goals_benchmark_large, pdf_download_large, snapshot_large, star_fill_large, star_large } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useMemo, useState } from 'react';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _filter from 'lodash/filter';
import RSTooltip from 'Components/RSTooltip';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { ANALYSIS_PERFORMANCE_DATA } from '../../constants';
import { useDispatch, useSelector } from 'react-redux';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Col, Row } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useForm } from 'react-hook-form';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { saveSnapshots, getSnapNameList } from 'Reducers/analytics/analyticsSummary/request';
import RSConfirmationModal from 'Components/ConfirmationModal';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';

import { AnalyticsReportProvider } from '../..';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
const PDF_LAYOUT_SETTLE_MS = 2000;
const PDF_EXPORT_WINDOW_MS = 8000;

const HeaderIcons = ({
    summary,
    golden,
    getGoldenCampaign,
    setGolden,
    benchRef,
    isPDF,
    isDownloadUI,
    snapshotList,
    onPdfExportStart,
    onPdfExportEnd,
}) => {
    const dispatch = useDispatch();
    const goldenCampaignLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
    });
    const pdfDownloadLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
    });
    const snapshotSaveLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
    });
    const { control, getValues, setValue, setError, clearErrors, trigger, formState: { errors } } = useForm();


   const { lastUpdateMetaDataSnapshotRef } = useContext(AnalyticsReportProvider);
    // const { state } = useLocation();
    const state = useQueryParams('/analytics/analytics-report');
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    // const state = { from: 7635 };
    
    // Build dropdown list with dynamic snapshot names only (footer will have "Take a snapshot")
    const snapshotDropdownList = useMemo(() => {
        const dynamicItems = Array.isArray(snapshotList) 
            ? snapshotList.map(item => item.snapshotName).filter(Boolean)
            : [];
        return dynamicItems;
    }, [snapshotList]);

    const [snapshotStatus, setSnapshotStatus] = useState({
        dropdownList: snapshotDropdownList,
        TASstatus: false,
        success: false,
        status: false
    });

    // Update dropdown list when snapshotList changes
    useEffect(() => {
        setSnapshotStatus((prev) => ({
            ...prev,
            dropdownList: snapshotDropdownList,
        }));
    }, [snapshotDropdownList]);

    useEffect(() => {
        if (snapshotStatus?.success) {
            const timer = setTimeout(() => {
                setSnapshotStatus((pre) => ({ ...pre, success: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [snapshotStatus?.success]);

    const handleCloseSnapshotModal = () => {
        if (snapshotSaveLoader.isFetching) return;
        setSnapshotStatus((pre) => ({ ...pre, TASstatus: false }));
        snapshotSaveLoader.reset();
    };

    const handleSaveSnapshot = async () => {
        if (snapshotSaveLoader.isFetching) return;

        const isValid = await trigger('snapshotName');
        if (!isValid) {
            return;
        }

        const snapshotName = getValues('snapshotName');
        if (!snapshotName || snapshotName.trim() === '') {
            setError('snapshotName', { type: 'manual', message: 'Enter snapshot name' });
            return;
        }

        if (snapshotName.trim().length < MIN_LENGTH) {
            setError('snapshotName', { type: 'manual', message: 'Min. 3 char' });
            return;
        }

        const nameExists =
            Array.isArray(snapshotList) &&
            snapshotList.some((item) => item.snapshotName?.toLowerCase() === snapshotName.trim().toLowerCase());

        if (nameExists) {
            setError('snapshotName', { type: 'manual', message: 'Snapshot name already exists' });
            return;
        }

        let filterModals = _filter(Object.entries(_get(summary, 'factModel', {})), ([_, value]) => value !== null);
        filterModals = addTabKey(Object.fromEntries(filterModals));
        const ChannelDetailID = _map(Object.values(filterModals)?.flat(), (list) => list?.channelDetailid || 0);
        const channelDetailIds = ChannelDetailID.flat();
        const refMeta = lastUpdateMetaDataSnapshotRef?.current ?? {};
        const dateRange = refMeta.communicationAnalysisDateRange;
        const channelMeta = refMeta.communicationAnalysisChannelId;

        const getMetricTypeId = (displayName) => {
            const found = ANALYSIS_PERFORMANCE_DATA.find((item) => item.name === displayName);
            return found?.id ?? displayName;
        };

        const totalReachPercentage = _get(summary, 'channelReachInfo.reachPercentage');
        const totalEngagementPercentage = _get(summary, 'channelEngagementInfo.engagementPercentage');
        const totalConversionPercentage = _get(summary, 'channelConversionInfo.conversionPercentage');

        const getGoalPercentageByMode = (mode) => {
            switch (mode) {
                case 1:
                    return totalReachPercentage;
                case 2:
                    return totalEngagementPercentage;
                case 3:
                    return totalConversionPercentage;
                default:
                    return totalReachPercentage;
            }
        };

        const mode = refMeta.benchmarkMode ?? 1;

        const payload = {
            snapshotName,
            campaignId: state?.from,
            analyticsType: 1,
            userId,
            clientId,
            departmentId,
            subSegmentLevel: state?.subSegmentLevel || 0,
            channelId: Array.isArray(channelMeta?.channelId) ? channelMeta.channelId : summary?.channelList || [],
            levelNumber: 1,
            ChannelDetailID: channelDetailIds,
            mode,
            benchmark: refMeta.myBenchmarkId ?? 1,
            clientBenchmark: refMeta.industryBenchmarkId ?? 0,
            jobDateTime: summary?.jobDateTime || '',
            goalPercentage: getGoalPercentageByMode(mode),
            startDate: dateRange?.startDate ?? summary?.startDate ?? '',
            endDate: dateRange?.endDate ?? summary?.endDate ?? '',
            metricType: getMetricTypeId(refMeta.communicationAnalysisMetricType ?? 'Reach'),
            chartType: refMeta.communicationAnalysisChartType ?? 'line',
            channelName: channelMeta?.channelName ?? 'All channels',
            channelIndex: refMeta?.communicationAnalysisTabIndex ?? 0,
        };

        const response = await snapshotSaveLoader.refetch({
            fetcher: async ({ payload: savePayload }) => {
                const saveResponse = await dispatch(saveSnapshots({ payload: savePayload }));
                if (saveResponse?.status === true) {
                    await dispatch(
                        getSnapNameList({
                            payload: {
                                campaignId: state?.from,
                                clientId,
                                departmentId,
                                userId,
                            },
                            loading: false,
                        }),
                    );
                }
                return saveResponse;
            },
            params: { payload },
        });

        if (response?.status === true) {
            setSnapshotStatus((pre) => ({ ...pre, TASstatus: false, success: true, status: true }));
        } else {
            setSnapshotStatus((pre) => ({ ...pre, TASstatus: false, success: true, status: false }));
        }
    };

    return (
        <div className="over-group-icon">
            <ul className="d-flex justify-content-evenly align-items-center theme-radius">
                <li className="position-relative">
                    {goldenCampaignLoader.isLoading ? (
                        <div className="gallery-list__field-loader" aria-hidden="true">
                            <span className="segment_loader" />
                        </div>
                    ) : null}
                    <RSTooltip
                        position="top"
                        text={golden.status ? 'Golden communication' : 'Set as golden communication'}
                    >
                        <i
                            className={`${golden.status ? star_fill_large : star_large}  ${
                                golden.status ? 'color-yellow-medium' : ''
                            } ${summary?.isFromSnapshot || goldenCampaignLoader.isLoading ? 'click-off pe-none' : ''} icon-lg`}
                            id="rs_HeaderIcons_starfill"
                            onClick={async () => {
                                if (summary?.isFromSnapshot || goldenCampaignLoader.isFetching) return;
                                const payload = {
                                    campaignId: state?.from,
                                    IsGolden: !golden.status,
                                    departmentId,
                                    clientId,
                                    userId,
                                };
                                const response = await goldenCampaignLoader.refetch({
                                    fetcher: ({ payload: goldenPayload }) =>
                                        dispatch(getGoldenCampaign({ payload: goldenPayload })),
                                    params: { payload },
                                });
                                if (!response?.status) return;
                                if (golden.status) setGolden((prev) => ({ ...prev, modal: false, status: false }));
                                else setGolden((prev) => ({ ...prev, modal: !prev.modal, status: !prev.status }));
                            }}
                        />
                    </RSTooltip>
                </li>
                <li>
                    <RSTooltip position="top" text="Benchmark">
                        <i
                            className={`${goals_benchmark_large} icon-lg`}
                            id="rs_HeaderIcons_goals_benchmark"
                            onClick={() => {
                                benchRef.current.scrollIntoView({
                                    behavior: 'smooth',
                                });
                            }}
                        />
                    </RSTooltip>
                </li>
                <li className="">
                    {snapshotStatus?.dropdownList?.length > 0 ? (
                        <BootstrapDropdown
                            data={snapshotStatus?.dropdownList}
                            flatIcon
                            defaultItem={
                                <RSTooltip position="top" text="Snapshot">
                                    <i className={`${snapshot_large} icon-lg`} id="rs_HeaderIcons_snapshot" />
                                </RSTooltip>
                            }
                            showUpdate={false}
                            isTooltip={true}
                            tooltipThreshold={13}
                            className={`no_caret snapshot-dropdown ${summary?.isFromSnapshot ? 'click-off' : ''}`}
                            alignRight
                            footer={
                                <RSDropdownFooterBtn
                                    title="Take a snapshot"
                                    handleClick={() => {
                                        setValue('snapshotName', '');
                                        clearErrors('snapshotName');
                                        setSnapshotStatus((pre) => ({ ...pre, TASstatus: true }));
                                    }}
                                />
                            }
                            onSelect={(e) => {
                                // User clicked on a snapshot name - open in new tab
                                const selectedSnapshot = Array.isArray(snapshotList) 
                                    ? snapshotList.find(item => item.snapshotName === e)
                                    : null;
                                
                                if (selectedSnapshot) {
                                    // Build URL with current state and snapshot parameters
                                    const urlState = {
                                        from: state?.from,
                                        campaignName: state?.campaignName || summary?.campaignName,
                                        isGolden: state?.isGolden || summary?.isGoldenCampaign,
                                        startDate: state?.startDate || summary?.startDate,
                                        endDate: state?.endDate || summary?.endDate,
                                        campaignTypeValue: state?.campaignTypeValue || summary?.campaignTypeValue,
                                        channelId: state?.channelId || summary?.channelList?.[0],
                                        subSegmentFriendlyName: state?.subSegmentFriendlyName,
                                        subSegmentLevel: state?.subSegmentLevel,
                                        // Add snapshot parameters
                                        snapshotId: selectedSnapshot.snapshotId,
                                        snapshotName: selectedSnapshot.snapshotName,
                                        createdDate: selectedSnapshot.createdDate,
                                    };
                                    const encryptState = encodeUrl(urlState);
                                    const url = `/analytics/analytics-report?q=${encryptState}`;
                                    // Open in new tab
                                    window.open(url, '_blank');
                                }
                            }}
                        />
                    ) : (
                        <RSTooltip position="top" text="Snapshot">
                            <i 
                                className={`${snapshot_large} icon-lg ${summary?.isFromSnapshot ? 'click-off' : ''}`} 
                                id="rs_HeaderIcons_snapshot"
                                onClick={() => {
                                    if (!summary?.isFromSnapshot) {
                                        setValue('snapshotName', '');
                                        clearErrors('snapshotName');
                                        setSnapshotStatus((pre) => ({ ...pre, TASstatus: true }));
                                    }
                                }}
                            />
                        </RSTooltip>
                    )}
                </li>
                <li className="position-relative pdf-download-action">
                    <RSTooltip position="top" text="Download">
                        <i
                            className={`${pdf_download_large} icon-lg ${
                                summary?.isFromSnapshot || pdfDownloadLoader.isFetching ? 'click-off pe-none' : ''
                            }`}
                            id="rs_HeaderIcons_download"
                            onClick={() => {
                                if (summary?.isFromSnapshot || pdfDownloadLoader.isFetching) return;

                                onPdfExportStart?.();
                                pdfDownloadLoader.refetch({
                                    fetcher: async () => {
                                        isDownloadUI(true);
                                        await new Promise((resolve) => {
                                            setTimeout(resolve, PDF_LAYOUT_SETTLE_MS);
                                        });
                                        isPDF?.();
                                        await new Promise((resolve) => {
                                            setTimeout(resolve, PDF_EXPORT_WINDOW_MS);
                                        });
                                        return { status: true };
                                    },
                                    onSettled: () => {
                                        isDownloadUI(false);
                                        onPdfExportEnd?.();
                                    },
                                });
                            }}
                        />
                    </RSTooltip>
                    {/* <RequestDownload icon={download_medium} size="md" color="color-whites" /> */}
                </li>
            </ul>

            {snapshotStatus.TASstatus && (
                <RSModal
                    show={snapshotStatus.TASstatus}
                    isBorder
                    handleClose={handleCloseSnapshotModal}
                    lockBackground={snapshotSaveLoader.isLoading}
                    isCloseDisabled={snapshotSaveLoader.isLoading}
                    bodyClassName={snapshotSaveLoader.isLoading ? 'pe-none' : ''}
                    size="md"
                    header="Snapshot"
                    footer={
                        <span>
                            <RSSecondaryButton
                                onClick={handleCloseSnapshotModal}
                                blockInteraction={snapshotSaveLoader.isLoading}
                                id="rs_HeaderIcons_Cancel"
                            >
                                Cancel
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                onClick={handleSaveSnapshot}
                                id="rs_HeaderIcons_Select"
                                isLoading={snapshotSaveLoader.isLoading}
                                blockBodyPointerEvents
                                disabledClass={errors?.snapshotName ? 'pe-none click-off' : ''}
                            >
                                Save
                            </RSPrimaryButton>
                        </span>
                    }
                    body={
                        <Row>
                            {/* <Col sm={5}>
                                <span>Name your snapshot</span>
                            </Col> */}
                            <Col sm={12}>
                                <RSInput
                                    name="snapshotName"
                                    control={control}
                                    placeholder={'Snapshot name'}
                                    handleOnchange={() => {
                                        clearErrors('snapshotName');
                                    }}
                                    handleOnBlur={async () => {
                                        await trigger('snapshotName');
                                    }}
                                    maxLength={MAX_LENGTH75}
                                    minLength={MIN_LENGTH}
                                    required
                                    rules={{
                                        required: ENTER_SNAPSHOT_NAME,
                                        minLength: {
                                            value: MIN_LENGTH,
                                            message: 'Min. 3 char',
                                        },
                                    }}
                                />
                            </Col>
                            <small className='text-end'>Max. 75 characters</small>
                        </Row>
                    }
                />
            )}
             {snapshotStatus?.success && (
                    <RSConfirmationModal
                        show={snapshotStatus?.success}
                        header="Info"
                        text={snapshotStatus?.status ? `Snapshot saved successfully` : 'Failed to save snapshot'}
                        primaryButtonText="OK"
                        handleClose={() => setSnapshotStatus((pre) => ({ ...pre, success: false }))}
                        handleConfirm={() => setSnapshotStatus((pre) => ({ ...pre, success: false }))}
                        secondaryButton={false}
                        primaryButton={false}
                    />
                )}
        </div>
    );
};

export default HeaderIcons;
