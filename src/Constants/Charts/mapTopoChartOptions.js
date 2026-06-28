import { chartSizing } from 'Constants/Charts/commonFunction';
import proj4 from 'proj4';
import mapDataIE from '@highcharts/map-collection/custom/world.topo.json';
// import mapDataIENM from '@highcharts/map-collection/custom/north-america.geo.json';

const mapTopoChartOptions = (data, type = 'North America') => {
    return {
        chart: {
            map: mapDataIE,
            proj4,
            height: data?.height ?? chartSizing['map'],
            animation: false,
            margin: 1
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
                width: 32,
                height: 32,
                padding: 4,
                theme: {
                    fill: '#ffffff',
                    stroke: '#e2e8f0',
                    'stroke-width': 1,
                    r: 0,
                    states: {
                        hover: {
                            fill: '#f8fafc',
                            stroke: '#e2e8f0',
                        },
                        select: {
                            fill: '#f8fafc',
                            stroke: '#e2e8f0',
                        },
                    },
                    style: {
                        color: '#374151',
                        fontSize: '18px',
                        fontWeight: '400',
                    },
                },
            },
            buttons: {
                zoomIn: {
                    x: -8,
                    y: 8,
                },
                zoomOut: {
                    x: -8,
                    y: 40,
                },
            },
        },

        mapView: {
            // padding: [0, 0, 85, 0]
        },
        tooltip: {
            enabled: true,
            headerFormat: '',
            formatter: function() {
                let tooltipText = '';
                if (this.point.stat) {
                    tooltipText += `${this.point.stat}, `;
                }
                tooltipText += `${this.point.name}<br>Lat: ${this.point.lat}, Lon: ${this.point.lon}`;
                return tooltipText;
            },
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
            // backgroundColor: '#ffffffcc'
        },
        plotOptions: {
            mappoint: {
                keys: ['id', 'lat', 'lon', 'name', 'stat', 'y'],
                marker: {
                    lineWidth: 1,
                    lineColor: '#fff',
                    symbol: 'mapmarker',
                    radius: 8,
                    // symbol: `url(${MarkerIcon})`,
                },
                dataLabels: {
                    enabled: false,
                    align: 'left',
                    x: 5,
                    verticalAlign: 'middle',
                },
            },
        },
        series: [
            {
                allAreas: true,
                name: 'Coastline',
                states: {
                    inactive: {
                        opacity: 0.2
                    }
                },
                dataLabels: {
                    enabled: false
                },
                enableMouseTracking: false,
                showInLegend: false,
                borderColor: 'blue',
                nullColor: '#749bf0',
                opacity: 0.3,
                borderWidth: 0
            }, {
                allAreas: true,
                name: 'Countries',
                states: {
                    inactive: {
                        opacity: 1
                    }
                },
                dataLabels: {
                    enabled: false
                },
                enableMouseTracking: false,
                showInLegend: false,
                nullColor: '#749bf0',
                borderColor: '#fff'
            },
            {
                type: 'mappoint',
                name: 'Cities',
                color: '#fc6a00',
                data: (data?.series ?? []).map((item, index) => {
                    return [
                        index,
                        Number(item?.lat),
                        Number(item?.lon),
                        item.country,
                        item.state,
                        0
                    ]
                }),
            },
        ],
    };
};

export default mapTopoChartOptions;
