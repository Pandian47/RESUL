import { createContext, useState } from 'react';
import { Container, Row } from "react-bootstrap"
import BodyComponent from "./BodyComponent"
import SideBarLeft from "./Wrapper/SideBarLeft/SideBarLeft"
import SideBarRight from "./Wrapper/SideBarRight/SideBarRight"

export const GlobalContext = createContext()

const Body = ({data}) => {
    const keys = Object.keys(data)
    const [selected, setSelected] = useState('Introduction')
    const [prev, setPrev] = useState('')
    const [next, setNext] = useState(Object.keys(data)[1])
    const [globalCreate, setGlobalCreate] = useState({
        selectIndex: 0,
        selectText: ''
    })
    const value = { setGlobalCreate, setSelected, selected, setNext, setPrev }
    return (
        <GlobalContext.Provider value={value}>
            <Container fluid className="body-wrapper">
                <Row>
                    <SideBarLeft 
                        data={data} 
                        next={val => setNext(val)}
                        prev={val => setPrev(val)}
                        // onSelect={(page) => setSelected(page)} 
                    />
                    <BodyComponent 
                        data={data} 
                        selectedPage={selected}
                        nextIndex={next}
                        prevIndex={prev}
                        setSelected={val => setSelected(val)}
                        // selectedPage={selected} 
                    />
                    <SideBarRight 
                        data={data} 
                        selectedPage={selected} 
                    />
                </Row>
            </Container>
        </GlobalContext.Provider>
    )
}

export default Body