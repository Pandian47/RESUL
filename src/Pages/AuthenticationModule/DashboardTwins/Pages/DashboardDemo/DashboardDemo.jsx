import { DATA_STRUCTURE } from './constant/chart_structure';
import { areaChartOptions, areasplineChartOptions, barChartOptions, bubbleChartOptions, columnChartOptions, gaugeChartOptions, mapChartOptions, pieChartOptions, pyramidChartOptions, radarChartOptions, sankeyChartOptions, variablePieChartOptions } from 'Constants/Charts';
import { Col, Row, Container } from 'react-bootstrap';
import { DATA_STRUCTURE_CODE } from './constant/chart_structure_code';
import { ChartTabDemoComponent, CommonChartDemoComponent } from './Components';

const DashboardDemo = () => {
    return (
        <div className="page-content-holder">
            <Container className="page-content px0">
                <Row>
                    <Col md={12}>
                        <h1 className="mb10">Chart structure</h1>
                    </Col>
                </Row>

                <Row>
                    {commonPortlet.map((item) => {
                        return (
                            <Col md={item?.size ?? 6}>
                                {item?.tab ? (
                                    <ChartTabDemoComponent
                                        title={item.title}
                                        chartData1={item.chartData1}
                                        chartData2={item.chartData2}
                                        codeData={item.codeData}
                                        smallText={item.smallText}
                                    />
                                ) : (
                                    <CommonChartDemoComponent
                                        title={item.title}
                                        type={item.type}
                                        chartData={item.chartData}
                                        codeData={item.codeData}
                                        smallText={item.smallText}
                                    />
                                )}
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </div>
    );
};

export default DashboardDemo;

const commonPortlet = [
    // {
    //     title: 'Column multi color',
    //     chartData: columnChartOptions(DATA_STRUCTURE?.st_column_test_structure),
    //     codeData: DATA_STRUCTURE_CODE?.ch_column_structure_code,
    //     size: 12
    // },
    // {
    //     title: 'Chart tab',
    //     tab: true,
    //     chartData1: pieChartOptions(DATA_STRUCTURE?.st_pie_structure),
    //     chartData2: pieChartOptions(DATA_STRUCTURE?.st_pie2_structure),
    //     codeData: DATA_STRUCTURE_CODE?.ch_tab_chart_structure_code,
    // },
    {
        title: 'Radar',
        chartData: radarChartOptions(DATA_STRUCTURE?.st_radar_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_radar_structure_code,
    },
    {
        title: 'Bubble',
        chartData: bubbleChartOptions(DATA_STRUCTURE?.st_bubble_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_bubble_structure_code,
    },
    {
        title: 'Sankey',
        chartData: sankeyChartOptions(DATA_STRUCTURE?.st_sankey_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_sankey_structure_code,
    },
    {
        title: 'Area',
        chartData: areaChartOptions(DATA_STRUCTURE?.st_area_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_area_structure_code,
    },
    {
        title: 'Area Spline One',
        chartData: areasplineChartOptions(DATA_STRUCTURE?.st_area_spline_one_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_area_spline_structure_one_code,
    },
    {
        title: 'Area Spline',
        chartData: areasplineChartOptions(DATA_STRUCTURE?.st_area_spline_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_area_spline_structure_code,
    },
    {
        title: 'Area Spline / Legend',
        chartData: areasplineChartOptions(DATA_STRUCTURE?.st_area_spline_legend_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_area_spline_structure_legend_code,
    },
    {
        title: 'Area Spline / Legend / Small text',
        chartData: areasplineChartOptions(DATA_STRUCTURE?.st_area_spline_legend_smalltext_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_area_spline_structure_code,
        smallText: 'Last 28 days',
    },
    {
        title: 'Bar',
        chartData: barChartOptions(DATA_STRUCTURE?.st_bar_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_bar_structure_code,
    },
    {
        title: 'Bar multi',
        chartData: barChartOptions(DATA_STRUCTURE?.st_bar_multi_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_bar_multi_structure_code,
    },
    {
        title: 'Bar multi mini',
        chartData: barChartOptions(DATA_STRUCTURE?.st_bar_multi_mini_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_bar_multi_mini_structure_code,
    },
    {
        title: 'Pyramid',
        chartData: pyramidChartOptions(DATA_STRUCTURE?.st_pyramid_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_pyramid_structure_code,
    },
    {
        title: 'Pyramid Reverse',
        chartData: pyramidChartOptions(DATA_STRUCTURE?.st_pyramid_reverse_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_pyramid_reverse_structure_code,
    },
    {
        title: 'Column multi color',
        chartData: columnChartOptions(DATA_STRUCTURE?.st_column_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_column_structure_code,
    },
    {
        title: 'Column single color',
        chartData: columnChartOptions(DATA_STRUCTURE?.st_column_single_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_column_single_structure_code,
    },
    {
        title: 'Column multi data',
        chartData: columnChartOptions(DATA_STRUCTURE?.st_column_multi_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_column_multi_structure_code,
    },
    {
        title: 'Column stacked',
        chartData: columnChartOptions(DATA_STRUCTURE?.st_column_stacked_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_column_stacked_structure_code,
    },
    {
        title: 'Column stacked inside data',
        chartData: columnChartOptions(DATA_STRUCTURE?.st_column_stacked_inside_data_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_column_stacked_inside_data_structure_code,
    },
    {
        title: 'Column stacked Multi level',
        chartData: columnChartOptions(DATA_STRUCTURE?.st_column_multi_lvl_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_column_multi_lvl_structure_code,
    },
    {
        title: 'Column stacked color',
        chartData: columnChartOptions(DATA_STRUCTURE?.st_column_multi_stacked_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_column_multi_stacked_structure_code,
    },
    {
        title: 'Pie',
        chartData: pieChartOptions(DATA_STRUCTURE?.st_pie_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_pie_structure_code,
    },
    {
        title: 'Variable Pie value',
        chartData: variablePieChartOptions(DATA_STRUCTURE?.st_variable_pie_value_data_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_variable_pie_value_structure_code,
    },
    {
        title: 'Variable Pie image',
        chartData: variablePieChartOptions(DATA_STRUCTURE?.st_variable_pie_img_data_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_variable_pie_img_structure_code,
    },
    {
        title: 'Gauge',
        chartData: gaugeChartOptions(DATA_STRUCTURE?.st_gauge_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_gauge_structure_code,
    },
    {
        title: 'Map',
        type: 'mapChart',
        chartData: mapChartOptions(DATA_STRUCTURE?.st_map_structure),
        codeData: DATA_STRUCTURE_CODE?.ch_map_structure_code,
    },
];

{
    /*
    CHART TAB
    BUBBLE
    SANKEY
    AREA
    AREA SPLINE
    BAR
    PYRAMID
    PYRAMID REVERSE
    COLUMN MULTI COLOR
    COLUMN SINGLE COLOR
    COLUMN MULTI DATA
    COLUMN STACKED
    COLUMN STACKED INSIDE DATA
    PIE
    GAUGE
    MAP
*/
}

// import RSChartPortletTab, { RSChartPortletTab2 } from 'Components/RSChartPortletTab/RSChartPortletTab';
// import RSHighchartsContainer from 'Components/Highcharts'

// const [tabSampleIndex, setTabSampleIndex] = useState(0)

// <Row className='d-none'>
// <Col md={6}>
//     <div className="portlet-container portlet-md">
//         <div className="portlet-header">
//             <h4>BUBBLE</h4>
//             <RSChartPortletTab2
//                 data={[
//                     { text: 'tab 01' },
//                     { text: 'tab 02' }
//                 ]}
//                 callBack={(item, index) => {
//                     setTabSampleIndex(index)
//                 }}
//             />
//         </div>
//         <div className="portlet-body">

//             {
//                 tabSampleIndex === 0
//                     ? <div className="portlet-chart">
//                         <RSHighchartsContainer
//                             options={bubbleChartOptions(DATA_STRUCTURE.st_bubble_structure)}
//                         />
//                     </div>
//                     : <div className="portlet-chart">
//                         <RSHighchartsContainer
//                             options={pieChartOptions(DATA_STRUCTURE.st_pie_structure)}
//                         />
//                     </div>
//             }

//         </div>
//     </div>
// </Col>

// <Col md={6}>
//     <RSChartPortletTab
//         title="Pie chart"
//         data={
//             [
//                 {
//                     id: 1,
//                     tab: 'Tab 1',
//                     chartComponent: <RSHighchartsContainer options={pieChartOptions(DATA_STRUCTURE.st_pie_structure)} />
//                 },
//                 {
//                     id: 2,
//                     tab: 'Tab 2',
//                     chartComponent: <RSHighchartsContainer options={pieChartOptions(DATA_STRUCTURE.st_pie2_structure)} />
//                 }
//             ]
//         }
//     />
// </Col>

// <Col md={6}>
//     <RSChartPortletTab
//         title="Column chart"
//         data={
//             [
//                 {
//                     id: 3,
//                     tab: 'Tab 1',
//                     chartComponent: <RSHighchartsContainer options={pieChartOptions(DATA_STRUCTURE?.st_pie2_structure)} />
//                 },
//                 {
//                     id: 4,
//                     tab: 'Tab 2',
//                     chartComponent: <RSHighchartsContainer options={pyramidChartOptions(DATA_STRUCTURE?.st_pyramid_reverse_structure)} />
//                 }
//             ]
//         }
//     />
// </Col>

// </Row>
