import { overallData } from './constant';
import { Component } from 'react';
import Body from './Components/Body';
import Header from './Components/Wrapper/Header/Header';
import './Documentation.scss'

class Documentation extends Component {
    render() {
        return (
            <>
                <Header disable />
                <Body data={overallData} />
            </>
        );
    }
}

export default Documentation;