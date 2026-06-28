
import { mandatory_mini, mark_as_submit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState, useEffect } from 'react';
import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';

import { calculateCharLimit } from './constant';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
const BrandownFormTable = ({ webFieldTableData }) => {
    const [tableData, setTableData] = useState(webFieldTableData);
    useEffect(() => {
        const normalizedData = webFieldTableData?.map(item => ({
            ...item,
            elementtype: item?.elementtype || item?.trackingType
        }));
        setTableData(normalizedData);
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
                noBoxShadow
                column={[
                    {
                        field: 'eventname',
                         filter: 'text',
                        title: 'Friendly name',
                        cell: ({ dataItem }) => {
                            const charLimit = calculateCharLimit(320, dataItem?.mandatory);
                            return (
                                <td>
                                    <div className="d-flex align-items-center">
                                        <TruncatedCell value={dataItem?.eventname || '-'} noTable={true} />
                                        {dataItem?.mandatory && (
                                            <RSTooltip text="Mandatory" position="top" className='ml10 position-relative top-5 lh0' innerContent={false}>
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
                        field: 'attributeType.attributeName',
                         filter: 'text',
                        title: 'Attribute name',
                        cell: ({ dataItem }) => {
                            return (
                                <td>
                                    <TruncatedCell value={dataItem?.attributeType?.attributeName || '-'} noTable={true} />
                                </td>
                            );
                        },
                    },
                    {
                        field: 'elementtype',
                        title: 'Capture type',
                        filter:'text',
                        cell: ({ dataItem }) => {
                                                        const captureType = dataItem?.elementtype;
                            return (
                                <td>
                                    <TruncatedCell value={captureType || ''} noTable={true} />
                                </td>
                            );
                        },
                    },
                    {
                        field: 'actions',
                        title: 'Action',
                        width: 150,
                        cell: ({ dataItem }) => (
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
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default BrandownFormTable;
