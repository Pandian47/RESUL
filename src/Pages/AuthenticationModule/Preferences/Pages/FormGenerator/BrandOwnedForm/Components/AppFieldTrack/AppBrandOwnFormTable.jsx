
import { mandatory_mini, mark_as_submit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useEffect } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import { calculateCharLimit } from './constant';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
const AppBrandownFormTable = ({ eventData, onDelete }) => {
    const [tableData, setTableData] = useState(eventData);
    useEffect(() => {
        setTableData(eventData);
    }, [eventData]);
    return (
        <div className="mt41">
            {/* filter value ["text","numeric","boolean","date"]. */}
            <KendoGrid
                settings={{
                    total: tableData?.length,
                }}
                noBoxShadow
                //  isDataStateRequired
                //   onDataStateChange={(data) => handlePageChange(data)}
                data={tableData}
                column={[
                    {
                        field: 'eventname',
                        filter: 'text',
                        title: 'Friendly name',
                        isTooltip: true,
                        titleLength: 10,
                        cell: ({ dataItem }) => {
                            const charLimit = calculateCharLimit(100, dataItem?.mandatory);
                            
                            return (
                                <td>
                                    <div className="d-flex align-items-center">
                                            <TruncatedCell value={dataItem?.eventname || '-'} noTable={true} />
                                        {dataItem?.mandatory && (
                                            <RSTooltip text="Mandatory" position="top" className='position-relative top-5 lh0 ml2' innerContent={false}>
                                                <i
                                                    className={`${mandatory_mini} font-xxs color-primary-red cursor-default `}
                                                ></i>
                                            </RSTooltip>
                                        )}
                                    </div>
                                </td>
                            );
                        },
                    },
                    {
                        field: 'attribute.attributeName',
                        filter: 'text',
                        isTooltip: true,
                        titleLength: 12,
                        title: 'Attribute name',
                        width: 150,
                        cell: ({ dataItem }) => {
                            const charLimit = calculateCharLimit(150);
                            
                            return (
                                <td>
                                    <TruncatedCell value={dataItem?.attribute?.attributeName || '-'} noTable={true} />
                                </td>
                            );
                        },
                    },
                    {
                        field: 'trackingType',
                        title: 'Capture type',
                        filter: 'text',
                        isTooltip: true,
                        titleLength: 12,
                        width: 130,
                        cell: ({ dataItem }) => {
                            const charLimit = calculateCharLimit(130);
                            
                            return (
                                <td>
                                        <TruncatedCell value={dataItem?.trackingType || '-'} noTable={true} />
                                </td>
                            );
                        },
                    },
                    {
                        field: 'action',
                        title: 'Action',
                        width: 100,
                        cell: ({ dataItem }) => {
                            return (
                                <td style={{ overflow: 'inherit' }} className="px15">
                                    <ul className="rs-list-inline rli-space-15">
                                        {dataItem?.markAsGoal && (
                                            <li>
                                                <RSTooltip text="Mark as submit" position="top" className="lh0">
                                                    <i
                                                        id="rs_data_pencil_edit"
                                                        className={`${mark_as_submit_medium} icon-md color-primary-blue cursor-default`}
                                                    ></i>
                                                </RSTooltip>
                                            </li>
                                        )}
                                    </ul>
                                </td>
                            );
                        },
                    },
                ]}
            />
        </div>
    );
};

export default AppBrandownFormTable;
