import { truncateTitle } from 'Utils/modules/displayCore';
import { mark_as_submit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useEffect } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

const EventTrackingTable = ({ webFieldTableData }) => {
    const [tableData, setTableData] = useState(webFieldTableData);
    useEffect(() => {
        setTableData(webFieldTableData);
    }, [webFieldTableData]);
    return (
        <div className="mt41">
            {/* filter value ["text","numeric","boolean","date"]. */}
            <KendoGrid
                settings={{
                    total: tableData?.length,
                }}
                //  isDataStateRequired
                //   onDataStateChange={(data) => handlePageChange(data)}
                data={tableData}
                column={[
                    {
                        field: 'eventname',
                          filter: 'text',
                        title: 'Event name',
                        cell: ({ dataItem }) => (
                            <td>
                                {dataItem?.eventname?.length > 30 ? (
                                    <RSTooltip
                                        text={dataItem?.eventname}
                                        position="top"
                                        className="d-inline-block"
                                    >
                                        <span className="m0">
                                            {truncateTitle(dataItem?.eventname, 30)}
                                        </span>
                                    </RSTooltip>
                                ) : (
                                    <span className="m0">{dataItem?.eventname}</span>
                                )}
                            </td>
                        ),
                    },

                    {
                        field: 'action',
                        title: 'Input type',
                        cell: ({ dataItem }) => {
                                                        let inputType =
                                dataItem?.elementaction || dataItem?.inputType;
                            return (
                                <td>
                                    {inputType?.length > 30 ? (
                                        <RSTooltip text={inputType} position="top" className="d-inline-block">
                                            <span className="m0">{truncateTitle(inputType, 30)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span className="m0">{inputType}</span>
                                    )}
                                </td>
                            );
                        },
                    },

                    {
                        field: 'attributeType',
                          filter: 'text',
                        title: 'Description',
                        cell: ({ dataItem }) => (
                            <td>
                                {dataItem?.description?.length > 30 ? (
                                    <RSTooltip
                                        text={dataItem?.description}
                                        position="top"
                                        className="d-inline-block"
                                    >
                                        <span className="m0">
                                            {truncateTitle(dataItem?.description, 30)}
                                        </span>
                                    </RSTooltip>
                                ) : (
                                    <span className="m0">{dataItem?.description}</span>
                                )}
                            </td>
                        ),
                    },
                    {
                        field: 'attributeType',
                        //  filter: 'text',
                        title: 'Action',
                        cell: ({ dataItem }) => (
                            <td style={{ overflow: 'inherit' }} className="px15">
                                <ul className="rs-list-inline rli-space-15">
                                    {dataItem?.markAsGoal && (
                                        <li>
                                            <RSTooltip text="Mark as submit" position="top">
                                                <i
                                                    id="rs_data_pencil_edit"
                                                    className={`${mark_as_submit_medium} icon-md color-primary-blue`}
                                                ></i>
                                            </RSTooltip>
                                        </li>
                                    )}
                                </ul>
                            </td>
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default EventTrackingTable;
