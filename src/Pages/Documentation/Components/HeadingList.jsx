import Alert from 'react-bootstrap/Alert';
import TableComponent from './Snippets/Table/TableComponent';
import { CustomCode } from "./Snippets/Code/CustomCode"

const HeaderList = ({ data, selectPage }) => {
    return (
        <>
            {
                data[selectPage].map((item, index) => {
                    const title1Id = item.type === 'title1' && item.value;
                    const title2Id = item.type === 'title2' && item.value;
                    const title3Id = item.type === 'title3' && item.value;
                    // console.log('iteml1', item.type === 'list' ? item.value : '');
                    return (
                        <div className="headerlist-wrapper" id={item.id}>
                            {item.type === 'title1' && <h1 className='anchor' id={`${title1Id}`}>{item.value}</h1>}
                            {item.type === 'title2' && <h2 className='anchor' id={`${title2Id}`}>{item.value}</h2>}
                            {item.type === 'title3' && <h3 className='anchor' id={`${title3Id}`}>{item.value}</h3>}
                            {item.type === 'body' && <p>{item.value}</p>}
                            {item.type === 'table' && <TableComponent data={item?.value} />}
                            {item.type === 'note' && <Alert variant='warning'><Alert.Link href="#">Note:</Alert.Link> {item.value}</Alert>}
                            {item.type === 'note2' && <Alert variant='primary'><Alert.Link href="#">Reference</Alert.Link> {item.value}</Alert>}
                            {item.type === 'code' && <CustomCode value={item.value}></CustomCode>}
                            {item.type === 'list' && item.value?.length > 0 && <List data={item.value}></List>}
                            {item.type === 'component' && item.value}
                        </div>
                    )
                })
            }
        </>
    )
}

export default HeaderList

const List = ({data}) => {
    return (
        <>
            <ul className='list-wrapper'>
                {
                    data.map((item, index) => {
                        return <li>{item}</li>
                    })
                }
            </ul>
        </>
    )
}