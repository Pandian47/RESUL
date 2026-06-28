import { truncateTitle } from 'Utils/modules/displayCore';
import { pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import { DigipopProvider } from '../..';
import usePermission from 'Hooks/usePersmission';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { GetDigiPop_grid } from 'Reducers/preferences/CommunicationSettings/request';


const DigiPopGrid = () => {
    const context = useContext(DigipopProvider);
    const {
        permissions: { updateAccess },
    } = usePermission();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState({
        gridData: [],
        totalRows: 0,
    });
    const {payload, setPayload, initialPagination, setInitialPagination} = context;
    const dispatch = useDispatch();
   
    const getDigipopGrid = async () => {
 
        const { status, data, totalRows } = await dispatch(GetDigiPop_grid(payload));
        if (status) {
                        setGridData({
                gridData: data,
                totalRows: totalRows,
            });
        } else {
            setGridData({
                gridData: [],
                totalRows: 0,
            });
        }
    };

    useEffect(() => {
        getDigipopGrid();
    }, [departmentId, payload]);

    const handlePageChange = (data) => {
        let { take, skip } = data?.dataState;
        const size = skip === 0 ? 1 : skip / take + 1;
        setPayload((pre) => ({
            ...pre,
            pagination: {
                pageNo: size,
                recordLimit: take,
            },
        }));
        setInitialPagination(true);
    };
    return (
        <>
            <KendoGrid
                data={gridData?.gridData}
                noBoxShadow
                settings={{ total: gridData?.totalRows }}
                isFailure={!gridData?.gridData?.length}
                column={[
                    {
                        field: 'requestBody',
                        title: 'Name',
                        cell: ({ dataItem }) => {
                            const fullText = dataItem?.requestBody.name || '';
                            return (
                                <td>
                                    {fullText?.length > 20 ? (
                                        <RSTooltip
                                            text={fullText}
                                            position="top"
                                            className="d-inline-block"
                                            innerContent={false}
                                        >
                                            <span>{truncateTitle(fullText, 20)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span>{fullText}</span>
                                    )}
                                </td>
                            );
                        },
                    },
                    {
                        field: 'requestBody',
                        title: 'Description',
                        cell: ({ dataItem }) => {
                            const fullText = dataItem?.requestBody.description || '';

                            return (
                                <td>
                                    {fullText?.length > 20 ? (
                                        <RSTooltip
                                            text={fullText}
                                            position="top"
                                            className="d-inline-block"
                                            innerContent={false}
                                        >
                                            <span>{truncateTitle(fullText, 20)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span>{fullText}</span>
                                    )}
                                </td>
                            );
                        },
                    },
                    {
                        field: 'requestBody',
                        title: 'Type',
                        cell: ({ dataItem }) => {
                            return (
                                <td>
                                    <span>{dataItem?.requestBody?.type}</span>
                                </td>
                            );
                        },
                    },
                    {
                        field: 'action',
                        title: 'Action',
                        width: 165,
                        cell: ({ dataItem }) => (
                            <td>
                                <ul className="rs-list-inline rli-space-5">
                                    <li
                                        onClick={() => {
                                            if (updateAccess) {
                                                context.setGridCreate((prev) => ({
                                                    ...prev,
                                                    showGrid: false,
                                                    digipopAction: {
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
                                        <RSTooltip text="Edit" position="top">
                                            <i
                                                id="rs_data_pencil_edit"
                                                className={`${pencil_edit_medium} icon-md color-primary-blue ${
                                                    !updateAccess ? 'click-off' : ''
                                                }`}
                                            ></i>
                                        </RSTooltip>
                                    </li>
                                </ul>
                            </td>
                        ),
                    },
                ]}
                isDataStateRequired
                onDataStateChange={(data) => handlePageChange(data)}
                pagerChange={initialPagination}
                setInitialPagination={setInitialPagination}
            />
        </>
    );
};

export default DigiPopGrid;
