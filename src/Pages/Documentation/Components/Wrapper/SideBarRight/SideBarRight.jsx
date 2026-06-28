import { useState } from 'react';
import { Col } from 'react-bootstrap';
const SideBarRight = ({ data, selectedPage }) => {
    const [selectedLink, setSelectLink] = useState('')
    const [selectedLink2, setSelectLink2] = useState('')
    const [selectedLink3, setSelectLink3] = useState('')
    return (
        <Col md={2} className="sidebar-right-wrapper">
            <div className="listview-wrap">
                <ul className="listview">
                    {
                        data[selectedPage].map((item, index) => {
                            const title1Id = item.type === 'title1' && item.value;
                            const title2Id = item.type === 'title2' && item.value;
                            const title3Id = item.type === 'title3' && item.value;
                            return (
                                <>
                                    {
                                        item.type === 'title1' 
                                        && <li 
                                                onClick={()=> {setSelectLink(title1Id)}}
                                                className={`${selectedLink === title1Id ? 'active' : ''}`}
                                            > 
                                                <span><a href={`#${title1Id}`}>{title1Id}</a></span>
                                        </li>
                                    }
                                    { 
                                        item.type === 'title2' 
                                        && <li 
                                                style={{marginLeft: 20}}
                                                onClick={()=> {setSelectLink2(title2Id)}}
                                                className={`${selectedLink2 === title2Id ? 'active' : ''}`}
                                            >
                                            <span><a href={`#${title2Id}`}>{title2Id}</a></span>
                                        </li>
                                    }
                                    {
                                        item.type === 'title3' 
                                        && <li 
                                                style={{marginLeft: 40}}
                                                onClick={()=> {setSelectLink3(title3Id)}}
                                                className={`${selectedLink3 === title3Id ? 'active' : ''}`}
                                            >
                                            <span><a href={`#${title3Id}`}>{title3Id}</a></span>
                                        </li>
                                    }
                                </>
                            )
                        })
                    }
                </ul>
            </div>
        </Col>
    )
}

export default SideBarRight