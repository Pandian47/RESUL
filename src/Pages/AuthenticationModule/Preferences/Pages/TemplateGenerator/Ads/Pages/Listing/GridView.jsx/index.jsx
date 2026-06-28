import { truncateTitle } from 'Utils/modules/displayCore';
import { circle_plus_fill_edge_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { GetDigiPop_grid } from 'Reducers/preferences/CommunicationSettings/request';

import { AdsListingProvider } from '..';
import { useNavigate } from 'react-router-dom';
import { AdsProvider } from '../../..';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';

const AdsGridView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const contextAds = useContext(AdsProvider);
    const contextListing = useContext(AdsListingProvider);

    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const { payload, setPayload, initialPagination, setInitialPagination } = contextListing;

    const [gridData, setGridData] = useState({
        gridData: [],
        totalRows: 0,
    });

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
        if (payload && payload?.userId >= 0) {
            getDigipopGrid();
        }
    }, [JSON.stringify(payload)]);



    // useEffect(() => {
    //     setPayload((pre) => ({
    //         ...pre,
    //         userId: contextAds?.updateUserId,
    //     }));
    // }, [contextAds?.updateUserId]);

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
        
    };

    return (
        <>
        {gridData?.gridData?.length ? (
            <KendoGrid
                data={gridData?.gridData}
                noBoxShadow
                settings={{ total: gridData?.totalRows }}
                isFailure={!gridData?.gridData?.length}
                column={[
                    {
                        field: 'requestBody.name',
                        title: 'Name',
                        filter:'text',
                        cell: ({ dataItem }) => {
                            const fullText = dataItem?.requestBody.name || '';
                            return (
                                <td>
                                    {fullText?.length > 100 ? (
                                        <RSTooltip
                                            text={fullText}
                                            position="top"
                                            className="d-inline-block"
                                            innerContent={false}
                                        >
                                            <span>{truncateTitle(fullText, 100)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span>{fullText}</span>
                                    )}
                                </td>
                            );
                        },
                    },
                    // {
                    //     field: 'requestBody',
                    //     title: 'Description',
                    //     cell: ({ dataItem }) => {
                    //         const fullText = dataItem?.requestBody.description || '';

                    //         return (
                    //             <td>
                    //                 {fullText?.length > 20 ? (
                    //                     <RSTooltip
                    //                         text={fullText}
                    //                         position="top"
                    //                         className="d-inline-block"
                    //                         innerContent={false}
                    //                     >
                    //                         <span>{truncateTitle(fullText, 20)}</span>
                    //                     </RSTooltip>
                    //                 ) : (
                    //                     <span>{fullText}</span>
                    //                 )}
                    //             </td>
                    //         );
                    //     },
                    // },
                    {
                        field: 'requestBody.type',
                        title: 'Type',
                        width:200,
                        filter:'text',
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
                                <ul className="rs-list-inline rli-space-5 grid-view-icons">
                                    <li
                                        onClick={() => {
                                            if(updateAccess){
                                                navigate('create_ads', {
                                                    state: {
                                                        currentEditId: dataItem?.id ?? null,
                                                    },
                                                });
                                            }
                                        }}
                                    >
                                        <RSTooltip text="Edit" position="top">
                                            <div className={`${pencil_edit_medium} icon-md color-primary-blue ${
                                                    !updateAccess ? 'pe-none click-off' : ''
                                                }`}>
                                            <i
                                                id="rs_data_pencil_edit"
                                                className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                            ></i></div>
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
            ):(
                <div className='box-design'>
                     <RSSkeletonTable
                                        text
                                        message={
                                            <>
                                                Click
                                                 <i
                                                    className={`${circle_plus_fill_edge_medium} icon-md mx5 color-primary-blue icon-hover-shadow-primary`}
                                                    onClick={() => {
                                                        if(addAccess){
                                                            navigate('create_ads', {
                                                                state: {
                                                                    currentEditId: null,
                                                                },
                                                            });
                                                        }
                                                    }}
                                                    id="rs_data_circle_plus_fill_edge"
                                                ></i>
                                               to create your first ad banner template.
                                            </>
                                        }
                                        isCustombox
                                        isAlertIcon={false}
                                    />
                </div>
            )}
        </>
    );
};

export default AdsGridView;
