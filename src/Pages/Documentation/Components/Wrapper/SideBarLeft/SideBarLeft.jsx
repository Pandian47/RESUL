import { useContext, useState } from 'react';
import { Col } from "react-bootstrap"
// import { GlobalContext } from "../../Body"

const SideBarLeft = ({ data, onSelect, next, prev }) => {
    const keys = Object.keys(data)
    // const [selected, setSelected] = useState(false)
    const {setSelected, selected} = useContext(GlobalContext)
    const [selectList, setSelectList] = useState(0)
    
    return (
        <Col md={2} className="sidebar-wrapper">
            {/* <input type='text' placeholder="Search.." /> */}
            <div className="listview-wrap">
                <ul className="listview">
                    {
                        keys.map((item, index) => {
                            return (
                                <li 
                                    onClick={(i, ind) => {
                                        // onSelect(item)
                                        next(keys[index + 1])
                                        prev(keys[index - 1])
                                        setSelected(item)
                                        setSelectList(index)
                                        // setSelected(!selected[index])
                                    }} 
                                    key={item.key} 
                                    className={`${selectList === index ? 'active' : ''}`}
                                >
                                    {item}
                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </Col>
    )
}

export default SideBarLeft