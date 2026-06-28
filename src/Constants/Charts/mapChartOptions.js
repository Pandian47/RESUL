import { chartSizing } from 'Constants/Charts/commonFunction';
import proj4 from 'proj4';
import mapDataIE from '@highcharts/map-collection/custom/world.geo.json';

const mapChartOptions = (data, type = 'North America', isCustomTooltip = true) => {
    return {
        chart: {
            map: type === 'World' ? 'custom/world' : 'custom/north-america',
            proj4,
            height: data?.height ?? chartSizing['map'],
            animation: false,
        },
        title: {
            text: '',
        },
        credits: {
            enabled: false,
        },
        navigation: {
            buttonOptions: {
                enabled: false,
            },
        },
        mapNavigation: {
            enabled: true,
            buttonOptions: {
                align: 'right',
                verticalAlign: 'top',
                width: 24,
                height: 24,
                padding: 5,
                theme: {
                    fill: '#ffffff',
                    stroke: '#ced4da',
                    'stroke-width': 1,
                    r: 3,
                    states: {
                        hover: {
                            fill: '#f8f9fa',
                            stroke: '#adb5bd',
                        },
                        select: {
                            fill: '#f8f9fa',
                            stroke: '#adb5bd',
                        },
                    },
                    style: {
                        color: '#6c757d',
                        fontSize: '16px',
                        fontWeight: '600',
                    },
                },
            },
            buttons: {
                zoomIn: {
                    x: -10,
                    y: 2,
                },
                zoomOut: {
                    x: -10,
                    y: 30,
                },
            },
        },
        tooltip: {
            enabled: true,
            headerFormat: '<span>Location</span>',
            pointFormat: isCustomTooltip
                ? '<span>{point.name}</span><br>Lat: {point.lat}, Lon: {point.lon}'
                : '<span> : {point.country}</span><br>Value :  {point.value}',
            useHTML: true,
            shared: true,
            backgroundColor: '#333',
            borderWidth: 0,
            shadow: false,
            style: {
                color: '#fefefe',
                cursor: 'default',
                fontSize: '13px',
                whiteSpace: 'nowrap',
            },
        },
        legend: {
            enabled: false,
        },
        plotOptions: {
            mappoint: {
                marker: {
                    fillColor: '#ff6600',
                    lineWidth: 1,
                    lineColor: '#ffffff', 
                    radius: 7 ,
                    symbol: 'mapmarker',
                },
                dataLabels: {
                    align: 'left',
                    x: 5,
                    verticalAlign: 'middle',
                },
            },
        },
        series: [
            {
                name: 'Basemap',
                mapData: mapDataIE,
                borderColor: '#ffffff',
                nullColor: '#749bf0',
                showInLegend: false,
            },
            {
                name: 'Separators',
                type: 'mapline',
                nullColor: '#707070',
                showInLegend: false,
                enableMouseTracking: false,
            },
            {
                type: 'mappoint',
                name: 'Cities',
                joinBy: null,
                boostThreshold: Number.MAX_SAFE_INTEGER,
                turboThreshold: Number.MAX_SAFE_INTEGER,
                data: (data?.series ?? [])
                    ?.filter((item) => Number(item?.value) > 0)
                    ?.map((item) => {
                        return {
                            name: item.name,
                            lat: Number(item?.lat),
                            lon: Number(item?.lon),
                            value: Number(item?.value),
                            country: item?.country,
                            // zoomLevel: 10,
                            // id: 'India',
                        };
                    }),
            },
        ],
    };
};

export default mapChartOptions;
