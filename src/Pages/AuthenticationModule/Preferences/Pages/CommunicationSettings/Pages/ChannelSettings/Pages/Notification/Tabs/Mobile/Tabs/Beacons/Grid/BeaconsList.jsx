import React from 'react';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';

import * as icons from 'Constants/GlobalConstant/Glyphicons';
import * as placeholder from 'Constants/GlobalConstant/Placeholders';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import RSConfirmationModal from 'Components/ConfirmationModal';
import KendoGrid from 'Components/RSKendoGrid';
import RSModal from 'Components/RSModal';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import RSSwitch from 'Components/FormFields/RSSwitch/index.jsx';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { getSessionId } from 'Reducers/globalState/selector';
import { beaconSelector } from 'Reducers/preferences/CommunicationSettings/Beacons/selector';
import { getBeaconLists, updateBeaconStatus } from 'Reducers/preferences/CommunicationSettings/Beacons/request';
import BeaconsCreate from '../Create/BeaconsCreate';

const BeaconsList = () => {
    const dispatch = useDispatch();
    const { departmentId } = useSelector(getSessionId);
    const { list, totalCount } = useSelector(beaconSelector);
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const { control, setValue } = useForm();

    const [data, setData] = React.useState([]);
    const [isAdd, setIsAdd] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [pageInitialValue, setPageInitialValue] = React.useState({
        take: 5,
        skip: 0,
        initialPagination: false,
    });
    const [confirmOff, setConfirmOff] = React.useState({ show: false, id: null });
    const [confirmEdit, setConfirmEdit] = React.useState({ show: false, id: null });
    const [linkedCommunicationModal, setLinkedCommunicationModal] = React.useState({
        show: false,
        rowData: null,
    });

    const fetchBeaconLists = React.useCallback(
        async (skipValue = 0, pageSizeValue = 5) => {
            setIsLoading(true);
            const pageNo = skipValue === 0 ? 1 : skipValue / pageSizeValue + 1;
            const response = await dispatch(
                getBeaconLists({
                    departmentId,
                    pagination: {
                        pageNo,
                        recordLimit: pageSizeValue,
                    },
                }),
            );
            setIsLoading(false);
            return response;
        },
        [departmentId, dispatch],
    );

    React.useEffect(() => {
        setPageInitialValue({ take: 5, skip: 0, initialPagination: true });
        fetchBeaconLists(0, 5);
    }, [departmentId, fetchBeaconLists]);

    React.useEffect(() => {
        if (list && list.length > 0) {
            const transformedData = list.map((item) => {
                const normalizedLinkedCommunication = Array.isArray(item?.linkedCommunication)
                    ? item.linkedCommunication
                    : Array.isArray(item?.linkedCommunications)
                      ? item.linkedCommunications
                      : [];
                const isActive =
                    typeof item?.isActive === 'boolean'
                        ? item.isActive
                        : item?.statusId === 1 || item?.statusID === 1;

                return {
                    ...item,
                    linkedCommunication: normalizedLinkedCommunication,
                    linkedCommunicationsText: normalizedLinkedCommunication?.[0]?.campaignName || 'NA',
                    statusName: isActive ? 'Active' : 'Inactive',
                    statusId: isActive ? 1 : 2,
                    statusID: isActive ? 1 : 2,
                };
            });
            setData(transformedData);
        } else {
            setData([]);
        }
    }, [list]);

    React.useEffect(() => {
        data.forEach((item) => {
            const beaconId = item?.id ?? item?.beaconId;
            if (beaconId == null) {
                return;
            }
            const isActive =
                item?.statusID === 1 ||
                item?.statusId === 1 ||
                item?.isActive === true;
            setValue(`beaconStatus_${beaconId}`, isActive, { shouldDirty: false });
        });
    }, [data, setValue]);

    const handlePaginationChange = async (data) => {
        const nextState = data?.dataState ? data.dataState : data;
        const newSkip = nextState?.skip || 0;
        const newPageSize = nextState?.take || pageInitialValue?.take || 5;

        setPageInitialValue({ skip: newSkip, take: newPageSize, initialPagination: false });
        await fetchBeaconLists(newSkip, newPageSize);
    };

    const tryToggle = (dataItem, nextChecked) => {
        const beaconId = dataItem?.id ?? dataItem?.beaconId;

        if (!nextChecked) {
            setConfirmOff({ show: true, id: beaconId });
        } else {
            dispatch(updateBeaconStatus({ id: beaconId, isActive: true }));
        }
    };

    
    const handleSaveSuccess = async () => {
        setIsAdd(false);
        setPageInitialValue({ take: pageInitialValue.take, skip: 0, initialPagination: true });
        await fetchBeaconLists(0, pageInitialValue.take);
        window.history.replaceState({}, '');
    };

    const handleCancel = () => {
        setIsAdd(false);
        window.history.replaceState({}, '');
    };

    if (isAdd) {
        return <BeaconsCreate onSave={handleSaveSuccess} onCancel={handleCancel} />;
    }

    return (
        <>
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <div className="d-flex align-items-center">
                        <h4 className="mb0 mr10">{placeholder.BEACONS_HEADING}</h4>
                    </div>
                    <RSTooltip position="top" text={placeholder.ADD} className="lh0">
                        <i
                            onClick={() => {
                                if (addAccess !== false) {
                                    setIsAdd(true);
                                }
                            }}
                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${icons.circle_plus_fill_edge_large} ${
                                addAccess === false ? 'click-off' : ''
                            }`}
                            id="rs_beacons_circle_plus_fill_edge"
                            role="button"
                            tabIndex={0}
                        />
                    </RSTooltip>
                </div>
            </div>

            <div className="rsgdv-plain">
                <KendoGrid
                    key={`beacons-grid-${totalCount}-${pageInitialValue.skip}-${pageInitialValue.take}`}
                    data={data}
                    noBoxShadow
                    settings={{
                        total: totalCount,
                    }}
                    isCustomBox
                    isLoading={isLoading}
                    change={handlePaginationChange}
                    flag={true}
                    isDataStateRequired
                    config={pageInitialValue}
                    pagerChange={pageInitialValue.initialPagination}
                    pageable={totalCount > 5}
                    noDataShowIcon={false}
                    noDataText={
                        <>
                            Click
                            <i
                                onClick={() => {
                                    if (addAccess !== false) {
                                        setIsAdd(true);
                                    }
                                }}
                                className={`icon-md color-primary-blue icon-hover-shadow-primary ${icons.circle_plus_fill_edge_medium} ${
                                    addAccess === false ? 'click-off' : ''
                                } mx5`}
                                id="rs_beacons_nodata_plus"
                                role="button"
                                tabIndex={0}
                            />
                            to configure your beacon.
                        </>
                    }
                    column={[
                        {
                            field: 'name',
                            title: placeholder.BEACON_NAME,
                        },
                        {
                            field: 'linkedCommunicationsText',
                            title: placeholder.LINKED_COMMUNICATION,
                            filter: 'text',
                            width: 230,
                            cell: ({ dataItem }) => {
                                const campaigns = Array.isArray(dataItem?.linkedCommunication)
                                    ? dataItem.linkedCommunication
                                    : [];

                                if (campaigns.length === 0) {
                                    return (
                                        <td>
                                            <span className="m0">NA</span>
                                        </td>
                                    );
                                }

                                const firstName = campaigns[0]?.campaignName || 'NA';
                                const moreCount = campaigns.length - 1;

                                return (
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                            <TruncatedCell value={firstName} noTable={true} />
                                            {moreCount > 0 && (
                                                <span
                                                    className="color-primary-blue cursor-pointer"
                                                    style={{ whiteSpace: 'nowrap', marginLeft: '4px' }}
                                                    onClick={() => {
                                                        setLinkedCommunicationModal({
                                                            show: true,
                                                            rowData: dataItem,
                                                        });
                                                    }}
                                                >
                                                    & {moreCount} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                );
                            },
                        },
                        {
                            field: 'createdDate',
                            title: placeholder.CREATE_DATE,
                            cell: (props) => (
                                <td>
                                    {moment(props.dataItem?.createdDate).isValid() && (
                                        <span className="rctcb-by-date">
                                            {getUserCurrentFormat(props?.dataItem?.createdDate)?.dateTimeFormat}
                                        </span>
                                    )}
                                </td>
                            ),
                        },
                        {
                            field: 'statusName',
                            title: placeholder.STATUS,
                            filter: 'text',
                            cell: (props) => (
                                <td>
                                    <span className="rctcb-by-date">{props?.dataItem?.statusName}</span>
                                </td>
                            ),
                        },
                        {
                            field: 'action',
                            title: placeholder.ACTIONS,
                            width: '150px',
                            cell: (props) => {
                                const linkedCommunications = Array.isArray(props?.dataItem?.linkedCommunication)
                                    ? props.dataItem.linkedCommunication
                                    : [];
                                const hasLinkedCommunications = linkedCommunications.length > 0;
                                const beaconId = props?.dataItem?.id ?? props?.dataItem?.beaconId;
                                const isActive =
                                    props?.dataItem?.statusID === 1 ||
                                    props?.dataItem?.statusId === 1 ||
                                    props?.dataItem?.isActive === true;

                                return (
                                    <td>
                                        <ul className="align-content-center d-flex rli-space-15 rs-list-inline">
                                            <li>
                                                <div className="switchBlock">
                                                    <RSSwitch
                                                        key={`beaconStatus_${beaconId}_${isActive}`}
                                                        control={control}
                                                        name={`beaconStatus_${beaconId}`}
                                                        defaultValue={isActive}
                                                        onLabel="ON"
                                                        offLabel="OFF"
                                                        handleChange={(val) => {
                                                            tryToggle(props.dataItem, val);
                                                        }}
                                                    />
                                                </div>
                                            </li>
                                            <li>
                                                <RSTooltip text={placeholder.EDIT} position="top">
                                                    <i
                                                        onClick={() => {
                                                            if (updateAccess !== false && !hasLinkedCommunications) {
                                                                setConfirmEdit({ show: true, id: beaconId });
                                                            }
                                                        }}
                                                        className={`${icons.pencil_edit_medium} icon-md color-primary-blue ${
                                                            updateAccess === false || hasLinkedCommunications
                                                                ? 'click-off'
                                                                : ''
                                                        }`}
                                                        role="button"
                                                        tabIndex={0}
                                                    />
                                                </RSTooltip>
                                            </li>
                                        </ul>
                                    </td>
                                );
                            },
                        },
                    ]}
                />
            </div>

            <RSConfirmationModal
                show={confirmOff.show}
                text={placeholder.BEACON_CONFIRM_DEACTIVATE}
                handleClose={() => setConfirmOff({ show: false, id: null })}
                handleConfirm={(ok) => {
                    const id = confirmOff.id;
                    setConfirmOff({ show: false, id: null });
                    if (ok && id != null) {
                        dispatch(updateBeaconStatus({ id, isActive: false }));
                    }
                }}
            />
            <RSConfirmationModal
                show={confirmEdit.show}
                text={placeholder.BEACON_CONFIRM_EDIT}
                handleClose={() => setConfirmEdit({ show: false, id: null })}
                handleConfirm={(ok) => {
                    const id = confirmEdit.id;
                    setConfirmEdit({ show: false, id: null });
                    if (ok && id != null) {
                        setIsAdd(true);
                        window.history.replaceState({ beaconId: id }, '');
                    }
                }}
            />
            <RSModal
                size="md"
                show={linkedCommunicationModal.show}
                handleClose={() =>
                    setLinkedCommunicationModal({
                        show: false,
                        rowData: null,
                    })
                }
                header={placeholder.LINKED_COMMUNICATION}
                body={
                    <ul className="rs-list-alt-bg forms-linkedcomm-popup css-scrollbar">
                        {(linkedCommunicationModal?.rowData?.linkedCommunication || []).map((item, index) => (
                            <li key={`${item?.campaignId || item?.campaignName || 'campaign'}-${index}`}>
                                <TruncatedCell value={item?.campaignName || 'NA'} noTable={true} />
                            </li>
                        ))}
                    </ul>
                }
            />
        </>
    );
};

export default BeaconsList;
