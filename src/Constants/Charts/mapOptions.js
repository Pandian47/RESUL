import { chartSizing } from 'Constants/Charts/commonFunction';
import proj4 from 'proj4';
import mapDataIE from '@highcharts/map-collection/custom/world.geo.json';

const mapOptions = (data) => {
    return {
        chart: {
            map: 'custom/world',
            proj4,
            height: data?.height ?? chartSizing['map'],
            animation: false,
        },
        title: {
            text: ' ',
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
            enabled: false,
        },
        tooltip: {
            enabled: false,
            headerFormat: '',
            pointFormat: '<span>{point.name}</span><br>Lat: {point.lat}, Lon: {point.lon}',
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
                data: data,
            },
        ],
    };
};

export default mapOptions;
