import { truncateTitle } from 'Utils/modules/displayCore';
import { ACTION, DOUBLE_OPT_IN_LIST, EDIT } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import { DoubleOptInProvider } from '../..';
import usePermission from 'Hooks/usePersmission';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getDoubleOptInData } from 'Reducers/preferences/CommunicationSettings/request';

import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';

const DoubleOptInGrid = () => {
    const context = useContext(DoubleOptInProvider);
    const {
        permissions: { updateAccess, addAccess },
    } = usePermission();
    const { clientId, userId } = useSelector((state) => getSessionId(state));
    const [gridData, setGridData] = useState({
        gridData: [],
        totalRows: 0,
    });

    const dispatch = useDispatch();

    const getDoubleOptIn = async () => {
        const payload = {
            userId,
            clientId,
        };
        const { status, data, totalRows } = await dispatch(getDoubleOptInData(payload));
        if (status) {
            // console.log('Data ::::::::: ', data);
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
        getDoubleOptIn();
    }, []);

    return (
        <>
        {gridData?.gridData?.length ? (
            <KendoGrid
                data={gridData?.gridData}
                noBoxShadow
                settings={{ total: gridData?.totalRows }}
                isFailure={!gridData?.gridData?.length}
                isCustomBox
                column={[
                    {
                        field: 'doubleOptIntext',
                        title: DOUBLE_OPT_IN_LIST,
                        filter:'text',
                        cell: ({ dataItem }) => {
                            const fullText = dataItem?.doubleOptIntext || '';

                            return (
                                <td>
                                    {fullText?.length > 50 ? (
                                        <RSTooltip
                                            text={fullText}
                                            position="top"
                                            className="d-inline-block"
                                            innerContent={false}
                                        >
                                            <span>{truncateTitle(fullText, 50)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span>{fullText}</span>
                                    )}
                                </td>
                            );
                        },
                    },
                    {
                        field: 'action',
                        title: ACTION,
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
                                                    doubleOptAction: {
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
                                        <RSTooltip text={EDIT} position="top">
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
            />
            ):(
                <RSSkeletonTable
                    text={true}
                    count={5}
                    isCustombox
                    isAlertIcon={false}
                    message={
                        <>
                        Click
                            <span
                                onClick={() => {
                                    if (addAccess) {
                                        context.setGridCreate((prev) => ({
                                            ...prev,
                                            showGrid: false,
                                            doubleOptAction: {
                                                edit: {
                                                    editState: [],
                                                    isEdit: false,
                                                },
                                                create: true,
                                            },
                                        }));
                                    }
                                }}
                            >
                                    <i
                                        id='rs_data_circle_plus_fill_edge'
                                        className={`icon-md color-primary-blue icon-hover-shadow-primary mx5 ${
                                            circle_plus_fill_edge_medium
                                        } ${!addAccess ? 'click-off' : ''} position-relative top4`}
                                    ></i>
                            </span>
                            to create your first double-opt in message.
                        </>
                    }
                />
            )}
        </>
    );
};

export default DoubleOptInGrid;
