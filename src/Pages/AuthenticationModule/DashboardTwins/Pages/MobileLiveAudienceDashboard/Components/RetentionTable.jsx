import { formatNumber } from 'Utils/modules/campaignUtils';
import { numberWithCommas } from 'Utils/modules/formatters';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import Table from 'react-bootstrap/Table';

import RSTooltip from 'Components/RSTooltip';

const RetentionTable = ({ tableHeader, tableBody, striped }) => {
    const renderValueWithTooltip = (value) =>
        value >= 1000 ? (
            <RSTooltip text={numberWithCommas(value)}>{formatNumber(value)}</RSTooltip>
        ) : (
            formatNumber(value)
        );
    return (
        // <Table className="m0" striped={striped}>
        //     <thead>
        //         <tr>
        //             {tableHeader.map((header) => (
        //                 <th  key={header}>
        //                     {header}
        //                 </th>
        //             ))}
        //         </tr>
        //     </thead>
        //     <tbody>
        //         {tableBody.map((item, index) => (
        //             <tr key={index}>
        //                 <td>{item.date}</td>
        //                 <td>{item.known}</td>
        //                 <td>{item.day1}</td>
        //                 <td>{item.day2}</td>
        //                 <td>{item.day3}</td>
        //                 <td>{item.day4}</td>
        //                 <td>{item.day5}</td>
        //                 <td>{item.day6}</td>
        //             </tr>
        //         ))}
        //     </tbody>
        // </Table>
        <>
            {tableBody?.length || tableBody > 0 ? (
                <div className="portlet-box-theme border">
                    <div className="tabs-content rs-table-wrapper shadow-none border-0">
                        <Table className="m0">
                            <thead>
                                <tr>
                                    {tableHeader.map((header) => (
                                        <th key={header}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                            {tableBody.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px5 py14">{item?.date}</td>
                                        <td className="px5 py14">{renderValueWithTooltip(item?.known)}</td>
                                        <td className="px5 py14">{renderValueWithTooltip(item?.day1)}</td>
                                        <td className="px5 py14">{renderValueWithTooltip(item?.day2)}</td>
                                        <td className="px5 py14">{renderValueWithTooltip(item?.day3)}</td>
                                        <td className="px5 py14">{renderValueWithTooltip(item?.day4)}</td>
                                        <td className="px5 py14">{renderValueWithTooltip(item?.day5)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            ) : (
                <HorizontalSkeleton isError={true} />
            )}
        </>
    );
};

export default RetentionTable;
