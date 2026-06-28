import { circle_plus_fill_edge_medium, delete_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getSessionId } from 'Reducers/globalState/selector';
import { getCSFrequencyCap } from 'Reducers/preferences/CommunicationSettings/request';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { CommunicationSettingsFrequencyCapTableSkeleton } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';

import { FrequencyProvider } from '../..';
import RSConfirmationModal from 'Components/ConfirmationModal';

const FrequencyGrid = ({ setGridCreate }) => {
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [initialPagination, setInitialPagination] = useState(false);
    const [gridData, setGridData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(FrequencyProvider);
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const [isDelete, setIsDelete] = useState({
        show: false,
        data: {},
    });

    const getData = async () => {
        setIsLoading(true);
        setInitialPagination(true);
        const { status, data } = await dispatch(getCSFrequencyCap({ clientId, userId, departmentId }));
        if (status) {
            setGridData(data);
        } else {
            setGridData([]);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        getData();
    }, [departmentId]);

    if (isLoading) {
        return <CommunicationSettingsFrequencyCapTableSkeleton />;
    }

    return (
        <>
            <KendoGrid
                data={gridData}
                settings={{
                    total: gridData?.length,
                }}
                isLoading={false}
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
                                        setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: false,
                                            frequencyAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: true,
                                            },
                                        }));
                                    }
                                }}
                                className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${!addAccess ? ' click-off' : ''}`}
                                id="rs_frequencycap_nodata_plus"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && addAccess) {
                                        e.preventDefault();
                                        setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: false,
                                            frequencyAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: true,
                                            },
                                        }));
                                    }
                                }}
                            />
                        </span>
                        {' '}
                        to create your frequency cap rule.
                    </>
                }
                column={[
                    {
                        field: 'name',
                        title: 'Name',
                        filter:'text'
                    },
                    {
                        field: 'frequency',
                        title: 'Frequency',
                        filter:'text'
                    },
                    {
                        field: 'action',
                        title: 'Action',
                        width: '165px',
                        sortable: false,
                        cell: ({ dataItem }) => (
                            <td>
                                <ul className="rs-list-inline rli-space-15 grid-view-icons">
                                    <li
                                        onClick={() => {
                                            if (updateAccess) {
                                                context.setGridCreate((prev) => ({
                                                    ...prev,
                                                    showGrid: false,
                                                    frequencyAction: {
                                                        edit: {
                                                            editState: dataItem,
                                                            isEdit: true,
                                                        },
                                                        create: false,
                                                    },
                                                }));
                                            }
                                        }}
                                    >
                                        <RSTooltip text="View" position="top">
                                            <div  className={`${
                                                    !updateAccess ? 'pe-none click-off' : ''
                                                }`}>
                                            <i
                                                className={`${eye_medium} icon-md color-primary-blue`}
                                                id="rs_data_pencil_edit"
                                            ></i></div>
                                        </RSTooltip>
                                    </li>
                                    {/* <li>
                                        <RSTooltip text="Delete" position="top">
                                            <i
                                                className={`${delete_medium} icon-md color-primary-blue ${
                                                    !deleteAccess ? 'click-off' : ''
                                                }`}
                                                id="rs_data_delete"
                                                onClick={ () => {
                                                    setIsDelete({
                                                    show: true,
                                                    data: dataItem,
                                                });
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </li> */}
                                </ul>
                            </td>
                        ),
                    },
                ]}
                pagerChange={initialPagination}
                setInitialPagination={setInitialPagination}
            />
            <RSConfirmationModal
                show={isDelete?.show}
                handleConfirm={(status) => {
                    if (status) {
                        setIsDelete({
                            show: false,
                            data: {},
                        });
                    }
                }}
                handleClose={() => {
                    setIsDelete({
                        show: false,
                        data: {},
                    });
                }}
            />
        </>
    );
};

export default FrequencyGrid;
