import { DATA_STRUCTURE } from './chart_structure';
import { areaChartOptions, areasplineChartOptions, barChartOptions, bubbleChartOptions, columnChartOptions, gaugeChartOptions, mapChartOptions, pieChartOptions, pyramidChartOptions, radarChartOptions, sankeyChartOptions, variablePieChartOptions } from 'Constants/Charts';
export const code_tab_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
import RSChartTabbar from 'Components/RSChartTabber';
const ch_data1 = pieChartOptions(DATA_STRUCTURE.pie_structure)
const ch_data2 = pieChartOptions(DATA_STRUCTURE.pie2_structure)

<RSChartTabbar
    chartHeading='PIE TAB'
    dynamicTab='mb0 mini'
    defaultClass='tabTransparent pt0'
    activeClass='active'
    expandView
    tabData={[
        {
            text: 'PIE 1',
            textClass: 'font-sm',
            component: () =>(
                <div className='portlet-chart'>
                    <div className='portlet-chart'>
                        <RSHighchartsContainer options={ch_data1} />
                    </div>
                </div>
            )
        },
        {
            text: 'PIE 2',
            textClass: 'font-sm',
            component: () => (
                <div className='portlet-chart'>
                    <div className='portlet-chart'>
                        <RSHighchartsContainer options={ch_data2} />
                    </div>
                </div>
            )
        }
    ]}
    className='rs-tabs row'
    componentClassName='mt30'
/>`;

export const code_area_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = areaChartOptions(DATA_STRUCTURE.area_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Area</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_bubble_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = bubbleChartOptions(DATA_STRUCTURE.bubble_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Bubble</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_radar_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = radarChartOptions(DATA_STRUCTURE.radar_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Bubble</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_area_spline_chart_one_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = areasplineChartOptions(DATA_STRUCTURE.areaspline_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Bar</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_bar_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = barChartOptions(DATA_STRUCTURE.bar_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Bar</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_bar_multi_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = barChartOptions(DATA_STRUCTURE.bar_multi_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Bar multi</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_bar_multi_mini_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = barChartOptions(DATA_STRUCTURE.bar_multi_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Bar multi mini</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_column_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = columnChartOptions(DATA_STRUCTURE.column_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Column multi color</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_column_single_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = columnChartOptions(DATA_STRUCTURE.column_single_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Column single color</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_column_multi_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = columnChartOptions(DATA_STRUCTURE.column_multi_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Column multi color</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_column_multi_lvl_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = columnChartOptions(DATA_STRUCTURE.column_multi_lvl_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Column multi level</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_column_multi_stacked_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = columnChartOptions(DATA_STRUCTURE.column_multi_stacked_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Column multi level</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_column_stacked_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = columnChartOptions(DATA_STRUCTURE.column_stacked_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Column stacked</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_column_stacked_inside_data_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = columnChartOptions(DATA_STRUCTURE.column_stacked_inside_data_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Column stacked inside data</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_pyramid_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = pyramidChartOptions(DATA_STRUCTURE.pyramid_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Pyramid</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_pyramid_reverse_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = pyramidChartOptions(DATA_STRUCTURE.pyramid_reverse_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Pyramid Reverse</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_pie_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = pieChartOptions(DATA_STRUCTURE.pie_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Pie</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_variable_pie_value_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = variablePieChartOptions(DATA_STRUCTURE.st_variable_pie_value_data_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Variable Pie Value</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_variable_pie_icon_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = variablePieChartOptions(DATA_STRUCTURE.st_variable_pie_icon_data_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Variable Pie icon</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_variable_pie_img_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = variablePieChartOptions(DATA_STRUCTURE.st_variable_pie_img_data_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Variable Pie Image</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_gauge_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = gaugeChartOptions(DATA_STRUCTURE.gauge_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Gauge</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer options={ch_data} />
        </div>
    </div>
</div>`;

export const code_map_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = mapChartOptions(DATA_STRUCTURE.map_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Map</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer constructorType='mapChart' options={ch_data} />
        </div>
    </div>
</div>`;

export const code_sankey_chart_code = `import RSHighchartsContainer from 'Components/Highcharts';
const ch_data = sankeyChartOptions(DATA_STRUCTURE.sankey_structure;

<div className='portlet-container portlet-md'>
    <div className='portlet-header'>
        <h4>Sankey</h4>
    </div>
    <div className='portlet-body'>
        <div className='portlet-chart'>
            <RSHighchartsContainer constructorType='mapChart' options={ch_data} />
        </div>
    </div>
</div>`;
