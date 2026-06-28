import { useState } from 'react';
import RSHighchartsContainer from 'Components/Highcharts'
import { CustomCode } from 'Components/CodeViewer/Common';

const CommonChartDemoComponent = ({ chartData, codeData, title, type, smallText }) => {

    const [selected, setSelected] = useState(0)
    const tabData = ['Chart', 'Code', 'Data']

    const selectedIndex = (index) => {
        setSelected(index)
    }
    const selectedClass = (index) => {
        if (selected === index) {
            return 'active'
        }
    }

    const tabComponent = {
        0: <ChartTabbar title={title} chartData={chartData} type={type} smallText={smallText} />,
        1: <CustomCode value={(codeData?.data[0])?.value ?? ''}></CustomCode>,
        2: <CustomCode value={(codeData?.data[1])?.value ?? ''}></CustomCode>
    }

    return (
        <>
            <div className='d-flex align-items-center justify-content-between'>
                <h3 className='code-title'>{title}</h3>
                <ul className='simple-tab'>
                    {
                        tabData.map((item, index) => {
                            return <li key={index} onClick={() => selectedIndex(index)} className={`${selectedClass(index)}`}>{item}</li>
                        })
                    }
                </ul>
            </div>

            {tabComponent[selected]}
        </>
    )
}
export default CommonChartDemoComponent;


const ChartTabbar = (props) => {
    return <div className="portlet-container portlet-md">
        <div className="portlet-header">
            <h4>{props.title}</h4>
        </div>
        <div className="portlet-body">
            <RSHighchartsContainer
                constructorType={props.type}
                options={props.chartData}
            />
            {props.smallText ? <small className="portlet-info-text">{props.smallText}</small> : null}
        </div>
    </div>
}