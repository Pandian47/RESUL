
import { useContext, useState } from 'react';
// import Alert from 'react-bootstrap/Alert';
// import TableComponent from './TableComponent';
// import * as code from "./CustomCode"
import { GlobalContext } from './Body';

const Pagination = ({ data, setSelected, next, prev }) => {
    const { selected, setPrev, setNext } = useContext(GlobalContext)
    const [nextClick, setNextClick] = useState()
    // console.log("prev", prev);
    return (
        <div className='d-flex justify-space-betweeen navigation-wrapper'>
            <div className={`navigation-page ${!prev ? 'click-off' : ''}`} onClick={() => {
                const keys = Object.keys(data);
                const currentIndex = keys.indexOf(selected) - 1
                // console.log(currentIndex)
                setPrev(keys[currentIndex -1])
                setNext(keys[currentIndex + 1 ])
                setSelected(keys[currentIndex])
                // setSelected(prev)
            }}>
                <div className='nav-button'>Prev</div>
                <small>{prev}</small>
            </div>
            <div className={`navigation-page ${next === undefined ? 'click-off' : ''}`} onClick={() => {
                const keys = Object.keys(data);
                const currentIndex = keys.indexOf(selected) + 1;
                setPrev(keys[currentIndex - 1])
                setNext(keys[currentIndex + 1 ])
                setSelected(keys[currentIndex])
                // console.log("::dcIndex::", dcIndex)
                // setSelected(next)
            }}>
                <div className='nav-button'>Next</div>
                <small>{next}</small>
            </div>
        </div>
    )
}

export default Pagination