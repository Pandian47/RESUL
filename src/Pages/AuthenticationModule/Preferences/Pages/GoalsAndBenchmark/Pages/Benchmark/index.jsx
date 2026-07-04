import { getUserDetails } from 'Utils/modules/crypto';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { getmasterData } from 'Utils/modules/masterData';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { MAX_LENGTH150, MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { BENCHMARK_NAME as BENCHMARK_NAME_MSG, ENTER_DESCRIPTION, SELECT_COMMUNICATION_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { BENCHMARK_NAME, COMMUNICATIONTYPE } from 'Constants/GlobalConstant/Placeholders';
import { close_mini, communication_target_large, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { Col, Container, Row } from 'react-bootstrap';

import RSTabber from 'Components/RSTabber';
import RSPageHeader from 'Components/RSPageHeader';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';

import { FORM_INITIAL_STATE, getVerticalTabConfig } from './constant';
import { getBenchmarkSaveChannelName, getBenchmarkSaveOrder } from './BenchmarkTabs/constant';
import { CheckAccountAttributeExists, CheckIsNameExit, SaveBenchmark, communicationAttributesBenchmark, communicationAttributes_ADD, getBenchMarkAndGoalsList } from 'Reducers/preferences/GoalsAndBenchmark/request';
import { communicationNamevalidtor } from 'Utils/HookFormValidate';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import { find as _find } from 'Utils/modules/lodashReplacements';
import ListNameExists from 'Components/ListNameExists';
import NewAttributeBtn from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/Components/CustomHeaderColumn/NewAttributeBtn';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import {
    resolveBenchmarkCellValue,
    findFirstInvalidBenchmarkChannel,
    findFirstBenchmarkErrorInFormState,
    channelHasBenchmarkRows,
    compareChannelToBaseline,
    hasAnyBenchmarkChannelChanges,
    buildOverviewAndBaselineFromBenchmarkResponse,
    resolveBenchmarkOverviewFields,
    scrollToFirstBenchmarkFormError,
} from './benchmarkFormUtils';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { CommunicationSettingsGoalsBenchmarkEditSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';



const ChannelBenchmark = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const methods = useForm(FORM_INITIAL_STATE);
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { state } = useLocation();
    const { clientCountryId, industryId, businessTypeId } = getUserDetails();
    const { control, reset, setError, setValue, clearErrors, watch, getValues, setFocus, trigger } = methods;

    const { attributesData } = useSelector(({ benchmarkOverview }) => benchmarkOverview);
    const attributesDataRef = useRef(attributesData);
    attributesDataRef.current = attributesData;
    const [benchmarkListData, setBenchmarkListData] = useState([]);
    const listName = useMemo(
        () => Object.keys(benchmarkListData).filter((key) => Array.isArray(benchmarkListData[key])),
        [benchmarkListData],
    );
    const [clickOff, setClickOff] = useState(false);
    const [ getBenchmarkFail, setGetBenchmarkFail ] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const attributesList = attributesData?.length === 0 ? [] : attributesData;
    const masterData = useMemo(() => getmasterData(), []);
    const { industryList, countryMasterList, businessTypeList } = masterData || {};
    const baselineRangesRef = useRef({});
    const [nameExists, setNameExists] = useState(true);
    const [isCommType, setIsCommType] = useState(false);
    const [tabs, setTabs] = useState(0);
    const sessionReady = Boolean(clientId && userId != null && departmentId != null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const benchmarkDetailApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const lastBootstrapKeyRef = useRef(null);
    const isEditMode = state?.mode === 'edit';
    const [subTabIndexByGroup, setSubTabIndexByGroup] = useState({});
    const verticalTabs = useMemo(
        () =>
            getVerticalTabConfig(listName, {
                subTabIndexByGroup,
                onSubTabChange: (groupId, index) => {
                    setSubTabIndexByGroup((prev) => ({ ...prev, [groupId]: index }));
                },
            }),
        [listName, subTabIndexByGroup],
    );

    const sortedCountryList = useMemo(() => {
        const list = Array.isArray(countryMasterList) ? [...countryMasterList] : [];
        return list.sort((a, b) => (String(a?.country || '').toLowerCase() > String(b?.country || '').toLowerCase() ? 1 : -1));
    }, [countryMasterList]);

    const sortedIndustryList = useMemo(() => {
        const list = Array.isArray(industryList) ? [...industryList] : [];
        return list.sort((a, b) =>
            String(a?.industryName || '').toLowerCase() > String(b?.industryName || '').toLowerCase() ? 1 : -1,
        );
    }, [industryList]);

    const sortedBusinessTypeList = useMemo(() => {
        const list = Array.isArray(businessTypeList) ? [...businessTypeList] : [];
        return list.sort((a, b) =>
            String(a?.businessType || '').toLowerCase() > String(b?.businessType || '').toLowerCase() ? 1 : -1,
        );
    }, [businessTypeList]);

    useEffect(() => {
        const currentVertical = verticalTabs?.[tabs];
        const currentGroupId = currentVertical?.id;
        const currentSubIdx = Number.isFinite(subTabIndexByGroup?.[currentGroupId])
            ? subTabIndexByGroup[currentGroupId]
            : 0;
        const subTabKeys = Array.isArray(currentVertical?.__subTabKeys) ? currentVertical.__subTabKeys : [];
        const listFilteredSubKeys = subTabKeys.filter((k) => {
            if (k === 'MobilePush') return listName.includes('MobilePushAndroid') || listName.includes('MobilePushIos');
            return listName.includes(k);
        });
        const canGoNextSubTab = listFilteredSubKeys.length > 1 && currentSubIdx < listFilteredSubKeys.length - 1;
        const hasNextStep = canGoNextSubTab || verticalTabs?.length > tabs + 1;
        const isOverallStep =
            (verticalTabs?.length ?? 0) > 0 &&
            tabs >= verticalTabs.length - 1 &&
            !canGoNextSubTab;

        const activeSubKey = listFilteredSubKeys?.[currentSubIdx];
        const activeChannelKey =
            activeSubKey === 'MobilePush'
                ? listName.includes('MobilePushAndroid')
                    ? 'MobilePushAndroid'
                    : 'MobilePushIos'
                : activeSubKey;

        const prev = getValues('navMeta') || {};
        if (
            prev?.hasNextStep !== hasNextStep ||
            prev?.activeChannelKey !== activeChannelKey ||
            prev?.isOverallStep !== isOverallStep
        ) {
            setValue('navMeta', { hasNextStep, activeChannelKey, isOverallStep }, { shouldDirty: false });
        }
    }, [tabs, subTabIndexByGroup, verticalTabs, listName, setValue, getValues]);

    const handleCommunicationList = (atte) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            campaignAttributeId: atte.value.campaignAttributeId,
            benchmarkId: state?.mode === 'create' ? 0 : state?.benchmarkOverView?.benchMarkId,
        };
        benchmarkDetailApi.refetch({
            fetcher: () => updateViewBenchmarkRef.current(payload),
            loaderConfig: fieldLoaderConfig,
            mode: state?.mode === 'edit' ? 'edit' : 'create',
        });
    };

    const handleTabUpdate = (tab, index) => {
        setTabs(index);
    };

    const handleFormUpdate = useCallback((benchmarkValue) => {
        const { overviewList, baseline } = buildOverviewAndBaselineFromBenchmarkResponse(benchmarkValue);
        baselineRangesRef.current = baseline;
        setValue('saveEnabledActiveChannel', false, { shouldDirty: false });
        setValue('saveEnabledAnyChannel', false, { shouldDirty: false });

        const { resolvedBenchMarkName, resolvedBenchmarkDesc } = resolveBenchmarkOverviewFields(benchmarkValue);

        reset((pre) => ({
            ...pre,
            ...overviewList,
            saveEnabledActiveChannel: false,
            saveEnabledAnyChannel: false,
            countryDetails: _find(countryMasterList, ['countryID', benchmarkValue?.countryId]),
            industry: _find(industryList, ['industryID', benchmarkValue?.industryId]),
            businessType: _find(businessTypeList, ['businessTypeID', benchmarkValue?.businessTypeId]),
            description: resolvedBenchmarkDesc,
            ...(state?.mode === 'edit'
                ? {
                      name: resolvedBenchMarkName,
                      communicationType: {
                          attributename: _find(attributesDataRef.current, [
                              'campaignAttributeId',
                              state?.benchmarkOverView?.campaignAttributeId,
                          ])?.attributename,
                          campaignAttributeId: state?.benchmarkOverView?.campaignAttributeId,
                      },
                  }
                : {}),
        }));
    }, [
        countryMasterList,
        industryList,
        businessTypeList,
        state?.mode,
        state?.benchmarkOverView?.campaignAttributeId,
        reset,
        setValue,
    ]);

    const updateViewBenchmark = useCallback(
        async (payload) => {
            const res = await dispatch(getBenchMarkAndGoalsList({ payload }));
            if (res?.status) {
                setBenchmarkListData(res.data);
                handleFormUpdate(res.data);
            } else {
                setBenchmarkListData([]);
                setGetBenchmarkFail(true);
            }
        },
        [dispatch, handleFormUpdate],
    );

    const updateViewBenchmarkRef = useRef(updateViewBenchmark);
    updateViewBenchmarkRef.current = updateViewBenchmark;

    const editBenchMarkId = state?.benchmarkOverView?.benchMarkId;
    const editCampaignAttributeId = state?.benchmarkOverView?.campaignAttributeId;
    const routeMode = state?.mode;

    useEffect(() => {
        if (!sessionReady || routeMode == null) return;

        const bootstrapKey =
            routeMode === 'edit' ? `edit:${editBenchMarkId}:${editCampaignAttributeId}` : 'create';
        if (lastBootstrapKeyRef.current === bootstrapKey) return;
        lastBootstrapKeyRef.current = bootstrapKey;

        const attributePayload = { departmentId, clientId, userId };
        const shouldLoadBenchmark = routeMode === 'edit' && Boolean(editCampaignAttributeId);

        pageLoadApi.refetch({
            fetcher: async () => {
                await dispatch(communicationAttributesBenchmark(attributePayload));
                if (shouldLoadBenchmark && editCampaignAttributeId) {
                    await updateViewBenchmarkRef.current({
                        departmentId,
                        clientId,
                        userId,
                        campaignAttributeId: editCampaignAttributeId,
                        benchmarkId: editBenchMarkId,
                    });
                }
            },
            loaderConfig: fieldLoaderConfig,
            mode: isEditMode ? 'edit' : 'create',
        });
    }, [
        sessionReady,
        routeMode,
        editBenchMarkId,
        editCampaignAttributeId,
        clientId,
        userId,
        departmentId,
        dispatch,
        isEditMode,
    ]);

    useEffect(
        () => () => {
            lastBootstrapKeyRef.current = null;
        },
        [],
    );

    const bootstrapFieldLoading = pageLoadApi.isLoading;
    const communicationFieldLoading = bootstrapFieldLoading || benchmarkDetailApi.isLoading;

    const navMetaForSave = watch('navMeta');
    const watchedBenchStartRangesKey = listName
        .flatMap((k) => [
            watch(`${k}[0].startRange`),
            watch(`${k}[1].startRange`),
            watch(`${k}[2].startRange`),
        ])
        .join('|');
    const activeChannelKeyForSave = navMetaForSave?.activeChannelKey;
    useEffect(() => {
        const baseline = baselineRangesRef.current || {};
        const isCreate = state?.mode === 'create';
        const hasAnyChannelChanges = hasAnyBenchmarkChannelChanges(listName, baseline, getValues);
        const activeKey = activeChannelKeyForSave;
        const activeChannelChanged = activeKey ? compareChannelToBaseline(activeKey, baseline, getValues) : false;

        const hasLoadedActiveChannel = activeKey && channelHasBenchmarkRows(activeKey, getValues);
        const hasLoadedAnyChannel = listName.some((k) => channelHasBenchmarkRows(k, getValues));

        const allowSaveAny = hasAnyChannelChanges || (isCreate && hasLoadedAnyChannel);
        const allowSaveActive = activeChannelChanged || (isCreate && hasLoadedActiveChannel);

        const prevAny = !!getValues('saveEnabledAnyChannel');
        if (prevAny !== allowSaveAny) {
            setValue('saveEnabledAnyChannel', allowSaveAny, { shouldDirty: false });
        }
        const prevActive = !!getValues('saveEnabledActiveChannel');
        if (prevActive !== allowSaveActive) {
            setValue('saveEnabledActiveChannel', allowSaveActive, { shouldDirty: false });
        }
    }, [watchedBenchStartRangesKey, listName, activeChannelKeyForSave, getValues, setValue, state?.mode]);

    const navigateToChannel = useCallback(
        (channelKey) => {
            if (!channelKey) return;
            for (let vIdx = 0; vIdx < (verticalTabs || []).length; vIdx++) {
                const vt = verticalTabs[vIdx];
                const groupId = vt?.id;
                const subs = Array.isArray(vt?.__subTabKeys) ? vt.__subTabKeys : [];
                const normalizedKey =
                    channelKey === 'MobilePushAndroid' || channelKey === 'MobilePushIos' ? 'MobilePush' : channelKey;
                const sIdx = subs.findIndex((k) => k === normalizedKey);
                if (sIdx >= 0) {
                    setTabs(vIdx);
                    if (groupId) setSubTabIndexByGroup((prev) => ({ ...prev, [groupId]: sIdx }));
                    return;
                }
            }
        },
        [verticalTabs],
    );

    const navMeta = watch('navMeta');
    useEffect(() => {
        const ch = navMeta?.activeChannelKey;
        if (!ch) return;
        trigger([`${ch}[0].startRange`, `${ch}[1].startRange`, `${ch}[2].startRange`], { shouldFocus: false });
    }, [navMeta?.activeChannelKey, trigger]);

    const handleExistName = (value) => {
        if (state?.mode === 'edit') {
            const { benchMarkname } = state?.benchmarkOverView;
            if (value?.toLowerCase().trim() === benchMarkname?.toLowerCase().trim()) {
                setNameExists(true);
            } else {
                setNameExists(false);
            }
        } else {
            setNameExists(false);
        }
    };

    const computeStepMeta = useCallback(() => {
        const currentVertical = verticalTabs?.[tabs];
        const currentGroupId = currentVertical?.id;
        const currentSubIdx = Number.isFinite(subTabIndexByGroup?.[currentGroupId])
            ? subTabIndexByGroup[currentGroupId]
            : 0;
        const subTabKeys = Array.isArray(currentVertical?.__subTabKeys) ? currentVertical.__subTabKeys : [];

        const availableSubKeys = subTabKeys.filter((k) => {
            if (k === 'MobilePush') return listName.includes('MobilePushAndroid') || listName.includes('MobilePushIos');
            return listName.includes(k);
        });

        const canGoNextSubTab = availableSubKeys.length > 1 && currentSubIdx < availableSubKeys.length - 1;
        const hasNextVertical = verticalTabs?.length > tabs + 1;
        const isOverallStep =
            (verticalTabs?.length ?? 0) > 0 &&
            tabs >= verticalTabs.length - 1 &&
            !canGoNextSubTab;

        const activeSubKey = availableSubKeys?.[currentSubIdx];
        const activeChannelKey =
            activeSubKey === 'MobilePush'
                ? listName.includes('MobilePushAndroid')
                    ? 'MobilePushAndroid'
                    : 'MobilePushIos'
                : activeSubKey;

        return {
            currentVertical,
            currentGroupId,
            currentSubIdx,
            availableSubKeys,
            canGoNextSubTab,
            hasNextVertical,
            isOverallStep,
            activeChannelKey,
        };
    }, [tabs, verticalTabs, subTabIndexByGroup, listName]);

    const submitBenchmarkForm = async (e) => {
        e.preventDefault();
        if (getValues('benchmarkSubmitting')) return;

        const submitAction = getValues('submitAction');
        if (submitAction !== 'save' && submitAction !== 'next') return;

        const meta = computeStepMeta();
        const validateAll =
            (submitAction === 'save' && meta.isOverallStep) ||
            (submitAction === 'next' && !meta.canGoNextSubTab && !meta.hasNextVertical);

        const headerFields = [
            'name',
            'description',
            'countryDetails',
            'industry',
            'businessType',
            ...(isCommType ? ['campaignName'] : ['communicationType']),
        ];
        const headerValid = await trigger(headerFields);
        if (!headerValid) {
            scrollToFirstBenchmarkFormError(methods.formState.errors, setFocus);
            return;
        }

        if (submitAction === 'next' && !validateAll) {
            const ch = meta.activeChannelKey;
            if (ch && !channelHasBenchmarkRows(ch, getValues)) {
                if (meta.canGoNextSubTab && meta.currentGroupId) {
                    setSubTabIndexByGroup((prev) => ({ ...prev, [meta.currentGroupId]: meta.currentSubIdx + 1 }));
                } else if (meta.hasNextVertical) {
                    setTabs(tabs + 1);
                }
                return;
            }
        }

        const orderedKeys = getBenchmarkSaveOrder(listName);

        if (validateAll) {
            const firstInvalid = findFirstInvalidBenchmarkChannel(orderedKeys, getValues);
            if (firstInvalid) {
                navigateToChannel(firstInvalid.key);
                await new Promise((r) => setTimeout(r, 150));
                const okBench = await trigger(
                    [
                        `${firstInvalid.key}[0].startRange`,
                        `${firstInvalid.key}[1].startRange`,
                        `${firstInvalid.key}[2].startRange`,
                    ],
                    { shouldFocus: true },
                );
                if (!okBench) {
                    scrollToFirstBenchmarkFormError(methods.formState.errors, setFocus);
                }
                return;
            }

            const allPaths = orderedKeys.flatMap((k) => {
                const rows = getValues(k);
                if (!Array.isArray(rows) || rows.length < 3) return [];
                return [`${k}[0].startRange`, `${k}[1].startRange`, `${k}[2].startRange`];
            });
            if (allPaths.length > 0) {
                const okAll = await trigger(allPaths, { shouldFocus: false });
                if (!okAll) {
                    await Promise.resolve();
                    const errs = methods.formState.errors;
                    const fromErrs = findFirstBenchmarkErrorInFormState(errs, orderedKeys);
                    if (fromErrs) {
                        navigateToChannel(fromErrs.key);
                        await new Promise((r) => setTimeout(r, 150));
                        await trigger(
                            [
                                `${fromErrs.key}[0].startRange`,
                                `${fromErrs.key}[1].startRange`,
                                `${fromErrs.key}[2].startRange`,
                            ],
                            { shouldFocus: true },
                        );
                    }
                    scrollToFirstBenchmarkFormError(methods.formState.errors, setFocus);
                    return;
                }
            }
        } else {
            const ch = meta.activeChannelKey;
            if (!ch) return;
            const ok = await trigger(
                [`${ch}[0].startRange`, `${ch}[1].startRange`, `${ch}[2].startRange`],
                { shouldFocus: true },
            );
            if (!ok) {
                scrollToFirstBenchmarkFormError(methods.formState.errors, setFocus);
                return;
            }
        }

        const formState = getValues();

        if (submitAction === 'save') {
            const exitOnSuccess = meta.isOverallStep;
            await handleSaveDetail(formState, { exitOnSuccess,submitAction });
            return;
        }

        if (submitAction === 'next') {
            const exitOnSuccess = !meta.canGoNextSubTab && !meta.hasNextVertical;
            const saved = await handleSaveDetail(formState, { exitOnSuccess ,submitAction});
            if (!saved) return;
            if (exitOnSuccess) return;

            if (meta.canGoNextSubTab && meta.currentGroupId) {
                setSubTabIndexByGroup((prev) => ({ ...prev, [meta.currentGroupId]: meta.currentSubIdx + 1 }));
            } else if (meta.hasNextVertical) {
                setTabs(tabs + 1);
            }
        }
    };

    const handleSaveDetail = async (formState, { exitOnSuccess = true,submitAction } = {}) => {
        setValue('benchmarkSubmitting', true, { shouldDirty: false });
        try {
            let orderValue = [];
            const orderedKeys = getBenchmarkSaveOrder(listName);
            const baseline = baselineRangesRef.current || {};
            orderedKeys?.forEach((res) => {
                const rows = formState?.[res];
                if (!Array.isArray(rows) || rows.length < 3) return;
                const r0 = resolveBenchmarkCellValue(rows[0], 0, res, baseline);
                const r1 = resolveBenchmarkCellValue(rows[1], 1, res, baseline);
                const r2 = resolveBenchmarkCellValue(rows[2], 2, res, baseline);
                if (r0 === null || r1 === null || r2 === null) return;
                orderValue.push({
                    reachValue: Number(parseFloat(r0).toFixed(2)),
                    engagement: Number(parseFloat(r1).toFixed(2)),
                    conversion: Number(parseFloat(r2).toFixed(2)),
                    channelName: getBenchmarkSaveChannelName(res),
                });
            });
            const payload = {
                benchmarkId: state?.mode === 'edit' ? state?.benchmarkOverView?.benchMarkId : 0,
                benchMarkname: formState?.name,
                benchMarkdesc: formState?.description,
                campaignAttributeId: formState?.communicationType?.campaignAttributeId,
                // productTypeId: removed from UI and payload (benchmark no longer tied to product type)
                orderNo: orderValue,
            };
            let loading = true
            const res =  await dispatch(SaveBenchmark(payload,loading));
            if (res?.status) {
                if (exitOnSuccess) {
                    reset();
                    navigate('/preferences/communication-settings', {
                        state: { tab: 2, from: 'benchmark' },
                    });
                }
                return true;
            }
            return false;
        } finally {
            setValue('benchmarkSubmitting', false, { shouldDirty: false });
        }
    };
    useEffect(() => {
        const businessType = _find(businessTypeList, ['businessTypeID', businessTypeId || 2]);
        const companyIndustry = _find(industryList, ['industryID', industryId || 1]);
        const companyCountry = _find(countryMasterList, (country) => country.countryID === clientCountryId);
        reset((pre) => ({
            ...pre,
            countryDetails: companyCountry,
            industry: companyIndustry,
            businessType: businessType,
        }));
    }, [clientCountryId]);
    const handleCommName = async (name) => {
                const payload = {
            userId,
            campaignName: name,
            departmentId,
            clientId,
        };
        const validationMsg = communicationNamevalidtor(name);
        if (validationMsg === undefined) {
            const res = await dispatch(CheckAccountAttributeExists(payload))

            //const res = await dispatch(communicationAttributes_ADD(payload));
            if (!res?.status) {
                setClickOff(true);
            } else {
                setClickOff(false);
                setError(`campaignName`, {
                    type: 'custom',
                    message: res?.message,
                });
            }
        }
    };
    const saveComm_Data = async () => {
        const payload = {
            userId,
            campaignName: watch('campaignName'),
            departmentId,
            clientId,
        };
        const saveResponse = await dispatch(communicationAttributes_ADD(payload));
        if (saveResponse?.status) {
            setClickOff(false);
            setValue('campaignName', '');
            await dispatch(communicationAttributesBenchmark( {userId,departmentId,clientId}));
            setIsCommType(false);
        }else{
            setError('campaignName', {
                type: 'custom',
                message: saveResponse?.message
            });
        }
       
    };
    const handleErrClose = () => {
        if(getBenchmarkFail && state?.mode !== 'edit'){
            navigate('/preferences/communication-settings', {
                state: { tab: 2, from: 'benchmark' },
            });
        }
        setGetBenchmarkFail(false);
    }
    return (
        // Contend holder starts
        <FormProvider {...methods}>
            <form className="page-content-holder" onSubmit={submitBenchmarkForm}>
                {/* Main page heading block starts */}
                <RSPageHeader
                    title={state?.mode !== 'edit' ? 'Benchmark' : 'Edit goals & benchmark'}
                    isBack
                    backPath="/preferences/communication-settings?isBenchMark=true"
                    rightCommonMenus
                    isAgencyDisabled
                    isBuDisabled
                />
                {/* Main page heading block ends */}

                {/* Main page content block starts */}
                <Container fluid>
                    <div className='page-content isVerticalTabbar'>
                        <Container className="px0">
                            <div className="flex-row mt0 top-sub-heading">
                                <div className="fr flex-right tsh-icons">
                                    <ul className="rs-list-group-horizontal jc-right">
                                        <li onClick={() => navigate('/preferences/goals-and-benchmark/channel-goals', {
                                            state: state,
                                        })}>
                                            Communication goals
                                            <i
                                                id="rs_ChannelBenchmark_communicationtarget"
                                                className={`${communication_target_large} icon-lg color-primary-blue ml5`}
                                            ></i>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <CommunicationSettingsGoalsBenchmarkEditSkeletonGate
                                isLoading={pageLoadApi.isFetching}
                                isEditMode={isEditMode}
                            >
                            <div className="box-design">
                                <div className="form-group mt25">
                                    <Row>
                                        {/* Row 1: three fields — Benchmark name, Communication type, Business type */}
                                        <Col sm={4}>
                                            <ListNameExists
                                                name="name"
                                                id="rs_ChannelBenchmark_BenchmarkName"
                                                field="benchMarkname"
                                                onValid={(valid) => { }}
                                                apiCallback={CheckIsNameExit}
                                                condition={(data) => {
                                                    const { status } = data;
                                                    return !status;
                                                }}
                                                onBlur={(e) => handleExistName(e.target.value)}
                                                nameExists={nameExists}
                                                onChange={(e) => handleExistName(e.target.value)}
                                                customError="Benchmark name already exists"
                                                rules={LIST_NAME_RULES(BENCHMARK_NAME_MSG)}
                                                customErrorMessage={BENCHMARK_NAME_MSG}
                                                placeholder={BENCHMARK_NAME}
                                            />
                                        </Col>
                                        <Col sm={4} id="rs_ChannelBenchmark_communicationType" className="position-relative">
                                            {isCommType ? (
                                                <Fragment>
                                                    <RSInput
                                                        name={'campaignName'}
                                                        control={control}
                                                        placeholder={'New communication type'}
                                                        required
                                                        className='pr55'
                                                        onKeyDown={charNumUnderScore}
                                                        rules={{
                                                            required: 'Enter a communication type',
                                                            validate: (value) => {
                                                                if (communicationNamevalidtor(value) !== undefined) {
                                                                    return communicationNamevalidtor(value);
                                                                } else {
                                                                    return true
                                                                }
                                                            },
                                                        }}
                                                        maxLength={MAX_LENGTH50}
                                                        handleOnBlur={(e) => {
                                                            if (e.target.value !== '' && !methods?.formState?.errors?.campaignName) {
                                                                handleCommName(e.target.value);
                                                            }
                                                        }}
                                                    />
                                                    <div className="position-absolute right16 d-flex top0 z-3">
                                                        <RSTooltip position="top" text="Save" className="mr15">
                                                            <i
                                                                onClick={() => {
                                                                    saveComm_Data();
                                                                }}
                                                                className={`${save_mini} ${clickOff && !methods?.formState?.errors?.campaignName ? '' : 'click-off'
                                                                    } icon-xs color-primary-blue`}
                                                            ></i>
                                                        </RSTooltip>
                                                        <RSTooltip position="top" text={'Cancel'}>
                                                            <i
                                                                className={`${close_mini}  color-primary-red icon-xs`}
                                                                onClick={() => {
                                                                    setValue('campaignName', '');
                                                                    setIsCommType(false);
                                                                    clearErrors('campaignName', '');
                                                                    clearErrors('communicationType');
                                                                    setClickOff(false);
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </Fragment>
                                            ) : (
                                                <RSKendoDropdown
                                                    name={'communicationType'}
                                                    data={attributesList}
                                                    control={control}
                                                    textField="attributename"
                                                    dataItemKey="campaignAttributeId"
                                                    handleChange={handleCommunicationList}
                                                    label={COMMUNICATIONTYPE}
                                                    required
                                                    isLoading={communicationFieldLoading}
                                                    rules={{
                                                        required: SELECT_COMMUNICATION_TYPE,
                                                    }}
                                                    popupSettings={{
                                                        popupClass: `addImportAudienceDropdownListContainer`,
                                                    }}
                                                    // footer={
                                                    //     <NewAttributeBtn
                                                    //         title="Add communication type"
                                                    //         handleModalAttribute={() => {
                                                    //             setValue('campaignName', '');
                                                    //             setValue('communicationType', '');
                                                    //             setIsCommType(true);
                                                    //         }}
                                                    //     />
                                                    // }
                                                />
                                            )}
                                        </Col>
                                        <Col sm={4} id="rs_ChannelBenchmark_businessType">
                                            <RSKendoDropDownList
                                                control={control}
                                                name={'businessType'}
                                                data={sortedBusinessTypeList}
                                                textField="businessType"
                                                required
                                                disabled
                                                dataItemKey={'businessTypeID'}
                                                label={'Business type'}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                        {/* Row 2: three fields — Country, Industry, Description */}
                        <div className="form-group mb0">
                            <Row>
                                <Col sm={4} id="rs_ChannelBenchmark_countryDetails">
                                    <RSKendoDropDownList
                                        control={control}
                                        name={'countryDetails'}
                                        data={sortedCountryList}
                                        textField="country"
                                        required
                                        disabled
                                        dataItemKey={'countryID'}
                                        label={'Country'}
                                    />
                                </Col>
                                <Col sm={4} id="rs_ChannelBenchmark_industryname">
                                    <RSKendoDropDownList
                                        name={'industry'}
                                        data={sortedIndustryList}
                                        control={control}
                                        required
                                        disabled
                                        textField={'industryName'}
                                        dataItemKey={'industryID'}
                                        label={'Industry'}
                                    />
                                </Col>
                                <Col sm={4}>
                                    <RSTextarea
                                        control={control}
                                        className={'text mb10'}
                                        name={'description'}
                                        row={3}
                                        required
                                        rules={{
                                            required: ENTER_DESCRIPTION,
                                        }}
                                        maxLength={MAX_LENGTH150}
                                        placeholder={'Description'}
                                    />
                                </Col>
                            </Row>
                        </div>

                    </div>
                    {listName?.length !== 0 && !!getValues('communicationType') && (
                        <div className="rs-vertical-tabs-wrapper mt21">
                            <RSTabber
                                dynamicTab="vertical-tabs rsv-tabs-list"
                                activeClass="active"
                                tabData={verticalTabs}
                                defaultTab={tabs}
                                callBack={handleTabUpdate}
                            />
                        </div>
                    )}
                            </CommunicationSettingsGoalsBenchmarkEditSkeletonGate>
                </Container>
                </div>
               </Container>

                {/* Main page content block ends */}
            </form>
            {getWarningPopupMessage(failureApiErrors, dispatch, handleErrClose)}
        </FormProvider>
        // Content holder ends
    );
};

export default ChannelBenchmark;
