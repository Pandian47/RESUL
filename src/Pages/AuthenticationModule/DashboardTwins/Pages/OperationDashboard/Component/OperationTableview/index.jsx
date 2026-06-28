import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';

const OperationTableview = ({ tableHeader = [], tableBody = [], striped = true }) => {
    return (
        // <Table className='opd-table text-center-ex-1' striped={striped}>
        //     <thead>
        //         <tr>
        //             {tableHeader.map((header) => (
        //                 <th  key={header}>{header}</th>
        //             ))}
        //         </tr>
        //     </thead>
        //     <tbody>
        //         {tableBody.map((body) => (
        //             <tr key={body.communicationName}>
        //                 <td>{body.communicationName}</td>
        //                 <td>{body.targetAudience}</td>
        //                 <td>{body.campaigns}</td>
        //             </tr>
        //         ))}
        //     </tbody>
        // </Table>
        <div className="tabs-content rs-table-wrapper shadow-none">
            <Table className="m0">
                <thead>
                    <tr>
                        {tableHeader.map((header) => (
                            <th key={header}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableBody.map((body) => (
                        <tr key={body.communicationName}>
                            <td>{body.communicationName}</td>
                            <td className="text-right">{body.targetAudience}</td>
                            <td className="text-right">{body.campaigns}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

OperationTableview.propTypes = {
    tableHeader: PropTypes.array.isRequired,
    tableBody: PropTypes.array.isRequired,
    striped: PropTypes.bool,
};

export default OperationTableview;
