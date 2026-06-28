import { useState } from 'react';
import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
import { CustomCode } from 'Components/CodeViewer/Common';

export const ChartTabDemoComponent = ({ chartData1, chartData2, codeData, title }) => {
    const [selected, setSelected] = useState(0);
    const tabData = ['Chart', 'Code', 'Data'];

    const selectedIndex = (index) => {
        setSelected(index);
    };
    const selectedClass = (index) => {
        if (selected === index) {
            return 'active';
        }
    };

    const tabComponent = {
        0: () => <ChartTabbar title={title} chartData1={chartData1} chartData2={chartData2} />,
        1: () => <CustomCode value={codeData?.data[0]?.value ?? ''}></CustomCode>,
        2: () => <CustomCode value={codeData?.data[1]?.value ?? ''}></CustomCode>,
    };

    return (
        <>
            <div className="d-flex align-items-center justify-content-between">
                <h3 className="code-title">{title}</h3>
                <ul className="simple-tab">
                    {tabData.map((item, index) => {
                        return (
                            <li key={index} onClick={() => selectedIndex(index)} className={`${selectedClass(index)}`}>
                                {item}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {tabComponent[selected]}
        </>
    );
};
export default ChartTabDemoComponent;

const ChartTabbar = (props) => {
    return (
        <RSChartTabbar
            chartHeading={props.title}
            dynamicTab="mb0 mini"
            defaultClass="tabTransparent pt0"
            activeClass="active"
            expandView
            tabData={[
                {
                    text: 'PIE 1',
                    textClass: 'font-sm',
                    component: () => (
                        <div className="portlet-chart">
                            <RSHighchartsContainer options={props.chartData1} />
                        </div>
                    ),
                },
                {
                    text: 'PIE 2',
                    textClass: 'font-sm',
                    component: () => (
                        <div className="portlet-chart">
                            <RSHighchartsContainer options={props.chartData2} />
                        </div>
                    ),
                },
            ]}
            className="rs-tabs row"
            componentClassName="mt30"
        />
    );
};
