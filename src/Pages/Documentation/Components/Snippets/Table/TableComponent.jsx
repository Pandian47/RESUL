import { Table } from 'react-bootstrap';
const TableComponent = ({ data }) => {
    return (
        <div className="table-wrapper">
            <Table> {/* striped */}
                <thead>
                    <tr>
                        <th>{data?.head?.key}</th>
                        <th>{data?.head?.value}</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data?.body?.map((item, index) => {
                            return <tr>
                                <td>{item?.key}</td>
                                <td>{item?.value}</td>
                            </tr>
                        })
                    }
                </tbody>
            </Table>

        </div>
    )
}

export default TableComponent