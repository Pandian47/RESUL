import { getUserDetails } from 'Utils/modules/crypto';
import { getYYMMDD, getDateBasedonDay } from 'Utils/modules/dateTime';
import { LIST_ACQUISITON_INFO, NOTES } from 'Constants/GlobalConstant/Placeholders';
import { bookmark_medium, circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { getRecepientAcquisitions, getListAcquisition } from 'Reducers/audience/masterdata/request';

import useApiLoader, { resetAbortableRequests } from 'Hooks/useApiLoader';
import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSTabbar from 'Components/RSTabber';
import { getSessionId } from 'Reducers/globalState/selector';

import Notes from './Components/Notes';
import { ACTIVITY_TYPE_MAP } from './constant';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import Charts from './Components/Charts';
import RSTooltip from 'Components/RSTooltip';
import _isEmpty from 'lodash/isEmpty';
import _groupBy from 'lodash/groupBy';

import { ensureArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const ListActivity = ({ show = {}, setIsShow = () => {} }) => {
    const { listAcquisitionChart = {} } = useSelector(
        (state) => state?.masterDataReducer ?? {},
    );
    const allImportedSources = ensureArray(listAcquisitionChart?.allImportedSources);
    const { createdDate, isAgency } = getUserDetails() ?? {};
    const currentDate = new Date();
    const initialFromDate = getDateBasedonDay(30, currentDate, true);
    const [attrs, setAttrs] = useState({
        startDate: initialFromDate,
        endDate: currentDate,
        type: '',
    });
    const [currentTab, setCurrentTab] = useState(0);
    const [showFallbackView, setShowFallbackView] = useState(false);
    const { accountAdmin, company_clientId } = useSelector((state) => state?.globalstate ?? {});
    const isAgencyAccountAdmin =
        isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state)) ?? {};

    const sources = useMemo(
        () =>
            allImportedSources
                .map((source) => {
                    if (typeof source !== 'string') return null;
                    const [id, name] = source.split(':');
                    return { id, name };
                })
                .filter((item) => item?.name && item.name.trim() !== ''),
        [allImportedSources],
    );

    const canFetchListAcquisition = !isAgencyAccountAdmin && Boolean(departmentId && clientId && userId);

    const listAcquisitionRequest = useApiLoader({
        actionCreator: getListAcquisition,
    });
    const recipientAcquisitionRequest = useApiLoader({
        actionCreator: getRecepientAcquisitions,
    });
    const apiRefs = useRef({ listAcquisitionRequest, recipientAcquisitionRequest });
    apiRefs.current = { listAcquisitionRequest, recipientAcquisitionRequest };

    const { isMounted } = useComponentWillUnmount(() => {
        const { listAcquisitionRequest: listAcquisition, recipientAcquisitionRequest: recipientAcquisition } =
            apiRefs.current;
        resetAbortableRequests(listAcquisition, recipientAcquisition);
    });

    const fromDate = useMemo(() => getYYMMDD(attrs?.startDate), [attrs?.startDate]);
    const toDate = useMemo(() => getYYMMDD(attrs?.endDate), [attrs?.endDate]);
    const activityType = ACTIVITY_TYPE_MAP[currentTab] || 'activity';

    useEffect(() => {
        if (!canFetchListAcquisition) return;

        const sourceName = attrs?.type
            ? sources.find((s) => s?.id === attrs.type)?.name || 'allsources'
            : 'allsources';

        const fetchChartData = async () => {
            try {
                await listAcquisitionRequest.refetch({
                    departmentId,
                    clientId,
                    userId,
                    activityType,
                    fromDate,
                    toDate,
                    sourceId: attrs?.type ? parseInt(attrs.type, 10) : 0,
                    sourceName,
                });

                const isPageMounted = isMounted.current;
                if (!isPageMounted) return;

                await recipientAcquisitionRequest.refetch({
                    departmentId,
                    clientId,
                    userId,
                    activityType,
                    fromDate,
                    toDate,
                });
            } catch {
                // Request aborted or failed
            }
        };

        void fetchChartData();
    }, [
        canFetchListAcquisition,
        currentTab,
        fromDate,
        toDate,
        attrs?.type,
        departmentId,
        clientId,
        userId,
        sources,
        listAcquisitionRequest.refetch,
        recipientAcquisitionRequest.refetch,
    ]);

    const tabConfig = useMemo(
        () => [
            {
                id: 'listActivity',
                text: 'List activity',
                component: () => (
                    <Charts
                        type="LIST_ACTIVITY"
                        chartType="LIST_ACTIVITY"
                        activityType={ACTIVITY_TYPE_MAP[0]}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                ),
            },
            {
                id: 'listAcquisition',
                text: 'List acquisition',
                component: () => (
                    <Charts
                        type="LIST_ACQUISITION"
                        chartType="LIST_ACQUISITION"
                        activityType={ACTIVITY_TYPE_MAP[1]}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                ),
            },
            {
                id: 'listAttrition',
                text: 'List attrition',
                component: () => (
                    <Charts
                        type="LIST_ATTRITION"
                        chartType="LIST_ATTRITION"
                        activityType={ACTIVITY_TYPE_MAP[2]}
                        fromDate={fromDate}
                        toDate={toDate}
                    />
                ),
            },
        ],
        [fromDate, toDate],
    );
    const { recipientAcquisition = [] } = useSelector(
        (state) => state?.masterDataReducer ?? {},
    );
    const finalListGroup = useMemo(() => {
        return _groupBy(ensureArray(recipientAcquisition), 'eventChannelName');
    }, [recipientAcquisition]);

    return (
        <Row className="mb25">
            <Col md={12}>
                <div className="box-design position-relative pageSub_tab x-axis-labels-performance mdm-list-activity-portlet">
                    {!showFallbackView ? (
                        <RSTabbar
                            defaultTab={currentTab}
                            defaultClass={`col-md-2 tabTransparent`}
                            dynamicTab={`mb0 mini`}
                            activeClass={`active`}
                            tabData={tabConfig}
                            className="rs-tabs row"
                            componentClassName={'mt30'}
                            callBack={(tab, index) => {
                                const isPageMounted = isMounted.current;
                                if (!isPageMounted) return;
                                setCurrentTab(index);
                            }}
                        />
                    ) : (
                        <>
                            <h4 className="mb31 d-flex align-items-center gap-2">
                                List acquisition
                                <RSTooltip text={LIST_ACQUISITON_INFO} position="top">
                                    <i className={`${circle_info_mini} icon-xs color-primary-blue`} />
                                </RSTooltip>
                            </h4>
                            <Charts type="LIST_ACQUISITION" chartType="LIST_ACQUISITION" />
                        </>
                    )}

                    <div className="float-end position-absolute right19 top15">
                        <ul className="rs-list-group-horizontal jc-right">
                            <li className="d-block text-right mr15">
                                <div
                                    className={
                                        _isEmpty(finalListGroup)
                                            ? 'cp font-sm notesHoverCSS click-off'
                                            : 'cp font-sm notesHoverCSS'
                                    }
                                    onClick={() => {
                                        setIsShow((prev) => ({ ...prev, notesEnable: !show?.notesEnable }));
                                    }}
                                >
                                    <i
                                        className={`position-relative top4 mr5 color-primary-blue icon-md ${bookmark_medium} `}
                                        id="rs_data_bookmark"
                                    ></i>
                                    <span className="position-relative top-1" id="rs_ListActivity_Notes">
                                        {NOTES}
                                    </span>
                                </div>

                                {show?.notesEnable && (
                                    <div className="note-accordion box-design res-audience-notes">
                                        <Notes
                                            handleClose={(status) => {
                                                if (!status)
                                                    setIsShow((prev) => ({
                                                        ...prev,
                                                        notesEnable: !show?.notesEnable,
                                                    }));
                                            }}
                                        />
                                    </div>
                                )}
                            </li>
                            <li className="mr15">
                                <div>
                                    <RSDateRangePicker
                                        startDate={attrs.startDate}
                                        endDate={attrs.endDate}
                                        onDatePickerClosed={(date) => {
                                            const isPageMounted = isMounted.current;
                                            if (!isPageMounted || !date) return;
                                            setAttrs((prev) => ({
                                                ...prev,
                                                startDate: date?.startDate ?? prev?.startDate,
                                                endDate: date?.endDate ?? prev?.endDate,
                                            }));
                                        }}
                                    />
                                </div>
                            </li>
                            <li>
                                <div id="rs_ListActivity_Allsources">
                                    <RSBootstrapdown
                                        fieldKey="name"
                                        isObject
                                        data={[{ id: '', name: 'All sources' }, ...sources]}
                                        alignRight
                                        isActive
                                        defaultItem={
                                            sources.find((item) => item.id === attrs.type) || {
                                                id: '',
                                                name: 'All sources',
                                            }
                                        }
                                        customAlignRight={true}
                                        className="mr0 mt0"
                                        onSelect={(item) => {
                                            const isPageMounted = isMounted.current;
                                            if (!isPageMounted) return;
                                            setAttrs((prev) => ({ ...prev, type: item?.id ?? '' }));
                                        }}
                                    />
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default memo(ListActivity);
