import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { ACTIONS, ADD, APP_NAME, CLUSTER_NAME, CREATE_DATE, EDIT, GEOFENCE_LOCATION_CLUSTER, LINKED_COMMUNICATION, STATUS } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_plus_fill_edge_medium, circle_question_mark_mini, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';

import { useSelector, useDispatch } from 'react-redux';


import GeofencingCreate from '../Create/GeofencingCreate.jsx';
import GeoFenceInfo from '../Info/GeoFenceInfo.jsx';
import { getGeoFencesLists, syncGeoFenceStatus } from 'Reducers/preferences/CommunicationSettings/Geofencing/request.js';
import { geofenceSelector } from 'Reducers/preferences/CommunicationSettings/Geofencing/selector.js';
import RSConfirmationModal from 'Components/ConfirmationModal';
import moment from 'moment';

import RSSwitch from 'Components/FormFields/RSSwitch/index.jsx';
import { useForm } from 'react-hook-form';
import { getSessionId } from 'Reducers/globalState/selector';
import KendoGrid from 'Components/RSKendoGrid';
import RSModal from 'Components/RSModal';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
const GeofencingList = () => {

    const [data, setData] = useState([]);

    const [initialPagination, setInitialPagination] = useState(false);
    const [pageSize, setPageSize] = useState(3);
    const [skip, setSkip] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const [isAdd, setIsAdd] = useState(false);
    const [editGeoFenceId, setEditGeoFenceId] = useState(0);
    const { control, watch, setValue } = useForm();
    const [isLoading, setIsLoading] = useState(false);


    const dispatch = useDispatch();

    const { list } = useSelector(geofenceSelector);

    const [confirmOff, setConfirmOff] = useState({ show: false, id: null });
    const [confirmEdit, setConfirmEdit] = useState({ show: false, id: null });
    const [confirmExpired, setConfirmExpired] = useState({ show: false, id: null });
    const [showGeoFenceInfo, setShowGeoFenceInfo] = useState(false);
    const [linkedCommunicationModal, setLinkedCommunicationModal] = useState({
        show: false,
        rowData: null,
    });
    const { departmentId, userId, clientId, isAgency, departmentName } = useSelector(getSessionId);

    useEffect(() => {
        const fetchGeoFences = async () => {
            try {
                setIsLoading(true);
                setInitialPagination(true);
                const response = await dispatch(getGeoFencesLists({
                    departmentId,
                    skip: 0,
                    take: pageSize
                }));

                // ✅ Only proceed after successful API response
                if (response?.status) {
                    setTotalRecords(response?.data?.totalCount || response?.data?.length || 0);
                }
                const hasVisitedGeofencing = localStorage.getItem('hasVisitedGeofencing');
                if (!hasVisitedGeofencing) {
                    const timer = setTimeout(() => {
                        setShowGeoFenceInfo(true);
                        localStorage.setItem('hasVisitedGeofencing', 'true');
                    }, 1000);
                    return () => clearTimeout(timer);
                }
            } catch (error) {
            } finally {
                setIsLoading(false);
            }
        };

        fetchGeoFences();
    }, [departmentId, dispatch, pageSize]);

    const getGeoFencesListsData = async (skipValue = 0, pageSizeValue = pageSize) => {
        setIsLoading(true);
        setInitialPagination(true);
        let response = await dispatch(getGeoFencesLists({
            "departmentId": departmentId,
            "skip": skipValue,
            "take": pageSizeValue
        }));
        setIsLoading(false);
        return response;
    }

    // Show geofence info modal on first visit
    // useEffect(() => {
    //     let glist =  getGeoFencesListsData()
    //     const hasVisitedGeofencing = localStorage.getItem('hasVisitedGeofencing');
    //     if (!hasVisitedGeofencing) {
    //         // Show info modal after a short delay to ensure page is loaded
    //         const timer = setTimeout(() => {
    //             setShowGeoFenceInfo(true);
    //             localStorage.setItem('hasVisitedGeofencing', 'true');
    //         }, 1000);
    //         return () => clearTimeout(timer);
    //     }
    // }, []);

    useEffect(() => {
        if (list && list.length > 0) {
            const transformedData = list.map(item => {
                const normalizedLinkedCommunication = Array.isArray(item?.linkedCommunication)
                    ? item.linkedCommunication
                    : [];

                return {
                    ...item,
                    appNames: item.apps?.map(app => app.appName).join(', ') || '',
                    linkedCommunication: normalizedLinkedCommunication,
                    linkedCommunicationsText: normalizedLinkedCommunication?.[0]?.campaignName || 'NA',
                    statusName: item.statusID === 1 ? 'Active' : 'Inactive'
                };
            });
            setData(transformedData);
        } else {
            setData([]);
        }
    }, [list]);


    const handlePaginationChange = async (event) => {
        const newSkip = event?.skip || 0;
        const newPageSize = event?.take || pageSize;
        setSkip(newSkip);
        setPageSize(newPageSize);
        await getGeoFencesListsData(newSkip, newPageSize);
    };

    const tryToggle = (dataItem, nextChecked) => {
        const nextStatusId = nextChecked ? 1 : 2;
        const geoId = dataItem?.geoFenceId || dataItem?.id;

        if (nextStatusId === 2) {
            setConfirmOff({ show: true, id: geoId });
        } else {
            // Before activating, check if custom date range has expired
            if (dataItem?.isAllTime === 0 && dataItem?.endDate) {
                const endDate = new Date(dataItem?.endDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                if (endDate < today) {
                    // End date has passed — show expired popup with Edit option
                    setConfirmExpired({ show: true, id: geoId });
                    return;
                }
            }
            dispatch(syncGeoFenceStatus({ geoFenceId: geoId, statusId: 1 }));
        }
    };

    const handleSaveSuccess = async (response) => {
        setIsAdd(false);
        setEditGeoFenceId(0);
        setIsLoading(true);
        await dispatch(getGeoFencesLists({
            "departmentId": departmentId
        }));
        setIsLoading(false);
    };

    const handleCancel = () => {
        setIsAdd(false);
        setEditGeoFenceId(0);
    };

    return (
        <>
            {isAdd === true ?
                <GeofencingCreate
                    geoFenceId={editGeoFenceId}
                    onSave={handleSaveSuccess}
                    onCancel={handleCancel}
                />
                : <>
                    <div className="rs-sub-heading">
                        <div className="align-items-center d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                                <h4 className="mb0 mr10">{GEOFENCE_LOCATION_CLUSTER}</h4>
                                <RSTooltip position="top" text="Geofencing information" className="lh0">
                                    <i
                                        onClick={() => setShowGeoFenceInfo(true)}
                                        className={`icon-sm color-primary-blue  ${circle_question_mark_mini} cursor-pointer`}
                                        id="rs_geofence_info_button"
                                    />
                                </RSTooltip>
                            </div>
                            <RSTooltip position="top" text={ADD} className="lh0">
                                <i
                                    onClick={() => {
                                        if (addAccess) {
                                            setEditGeoFenceId(0);
                                            setIsAdd(true);
                                        }

                                    }}
                                    className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large
                                        } ${!addAccess ? 'click-off' : ''}`}
                                    id="rs_data_circle_plus_fill_edge"
                                ></i>
                            </RSTooltip>
                        </div>
                    </div>

                    <div className="rsgdv-plain">
                        <KendoGrid
                            data={data}
                            noBoxShadow
                            settings={{
                                total: data?.length,
                            }}
                            isCustomBox
                            isLoading={isLoading}
                            onPaginationChange={handlePaginationChange}
                            pagerChange={initialPagination}
                            setInitialPagination={setInitialPagination}
                            noDataShowIcon={false}
                            noDataText={
                                <>
                                    Click{' '}
                                    <span
                                        className={`rs-nodata-icon-wrap position-relative bottom1 mx5${!addAccess ? ' cursor-not-allowed' : ''}`}
                                    >
                                        <i
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                if (addAccess) {
                                                    setEditGeoFenceId(0);
                                                    setIsAdd(true);
                                                }
                                            }}
                                            className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${!addAccess ? ' click-off' : ''}`}
                                            id="rs_geofence_nodata_plus"
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if ((e.key === 'Enter' || e.key === ' ') && addAccess) {
                                                    e.preventDefault();
                                                    setEditGeoFenceId(0);
                                                    setIsAdd(true);
                                                }
                                            }}
                                        />
                                    </span>
                                    {' '}
                                    to configure your location cluster.
                                </>
                            }
                            column={[
                                    {
                                        field: 'identifier',
                                        title: CLUSTER_NAME,
                                        width:200
                                    },
                                    {
                                        field: 'appNames',
                                        title: APP_NAME,
                                        filter: 'text',
                                        width: 170,
                                        // cell: ({ dataItem }) => (
                                        //     <td>
                                        //         {dataItem?.appNames && (
                                        //             <span>{truncateTitle(dataItem?.appNames, 15)}</span>
                                        //         )}
                                        //     </td>
                                        // ),
                                    },
                                    {
                                        field: 'createdDate',
                                        title: CREATE_DATE,
                                        width:200,
                                        cell: (props) => {
                                            return (
                                                <td>
                                                    {moment(props.dataItem?.createdDate).isValid() && (
                                                        <span className="rctcb-by-date">
                                                            {getUserCurrentFormat(props?.dataItem?.createdDate)?.dateTimeFormat}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        },
                                    },
                                    {
                                        field: 'linkedCommunicationsText',
                                        title: 'Linked communications',
                                        filter: 'text',
                                        width: 150,
                                        cell: ({ dataItem }) => {
                                            const campaigns = Array.isArray(dataItem?.linkedCommunication)
                                                ? dataItem?.linkedCommunication
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
                                        field: 'statusName',
                                        title: STATUS,
                                        filter: 'text',
                                        width:200,
                                        cell: (props) => {
                                            return (
                                                <td>
                                                    <span className="rctcb-by-date">
                                                        {props?.dataItem?.statusName}
                                                    </span>
                                                </td>
                                            );
                                        },
                                    },
                                    {
                                        field: 'action',
                                        title: ACTIONS,
                                        width: '150px',
                                        sortable: false,
                                        cell: (props) => {
                                            const linkedCommunications = Array.isArray(props?.dataItem?.linkedCommunication)
                                                ? props?.dataItem?.linkedCommunication
                                                : [];
                                            const hasLinkedCommunications = linkedCommunications.length > 0;
                                            
                                            return (
                                                <td>
                                                    <ul className="align-content-center d-flex rli-space-15 rs-list-inline">
                                                        <li>
                                                            <div className="switchBlock">
                                                                <RSSwitch
                                                                    control={control}
                                                                    name={`Status`}
                                                                    checked={props?.dataItem?.statusID == 1 ? true : false}
                                                                    onLabel="ON"
                                                                    offLabel="OFF"
                                                                    handleChange={(val) => {
                                                                        tryToggle(props.dataItem, val);
                                                                    }}
                                                                />
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <RSTooltip text={EDIT} position="top">
                                                                <i
                                                                    onClick={() => {
                                                                        if (updateAccess && !hasLinkedCommunications) {
                                                                            setConfirmEdit({ show: true, id: props?.dataItem?.geoFenceId || props?.dataItem?.id });
                                                                        }
                                                                    }}
                                                                    className={`${pencil_edit_medium
                                                                        }  icon-md color-primary-blue ${!updateAccess || hasLinkedCommunications ? 'click-off' : ''}`}
                                                                ></i>
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
                        text={'Deactivating the cluster will affect scheduled communications. Are you sure you want to proceed?'}
                        handleClose={() => setConfirmOff({ show: false, id: null })}
                        handleConfirm={(ok) => {
                            const id = confirmOff.id;
                            setConfirmOff({ show: false, id: null });
                            if (ok && id) {
                                dispatch(syncGeoFenceStatus({ geoFenceId: id, statusId: 2 }))
                            }
                        }}
                    />
                    <RSConfirmationModal
                        show={confirmEdit.show}
                        text={'Editing this cluster will affect scheduled communications. Are you sure you want to proceed?'}
                        handleClose={() => setConfirmEdit({ show: false, id: null })}
                        handleConfirm={(ok) => {
                            const id = confirmEdit.id;
                            setConfirmEdit({ show: false, id: null });
                            if (ok && id) {
                                setEditGeoFenceId(id);
                                setIsAdd(true);
                            }
                        }}
                    />
                    <RSConfirmationModal
                        show={confirmExpired.show}
                        text={'The end date for this cluster has already passed. Please edit the cluster and update the date range before activating.'}
                        handleClose={() => setConfirmExpired({ show: false, id: null })}
                        primaryButtonText={'Edit'}
                        handleConfirm={(ok) => {
                            const id = confirmExpired.id;
                            setConfirmExpired({ show: false, id: null });
                            if (ok && id) {
                                setEditGeoFenceId(id);
                                setIsAdd(true);
                            }
                        }}
                    />
                    <RSModal
                        size={'md'}
                        show={linkedCommunicationModal.show}
                        handleClose={() =>
                            setLinkedCommunicationModal({
                                show: false,
                                rowData: null,
                            })
                        }
                        header={LINKED_COMMUNICATION}
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
                </>}

            {/* Geofence Info Modal */}
            <GeoFenceInfo
                show={showGeoFenceInfo}
                handleClose={() => setShowGeoFenceInfo(false)}
            />

        </>
    );
};

export default GeofencingList;
