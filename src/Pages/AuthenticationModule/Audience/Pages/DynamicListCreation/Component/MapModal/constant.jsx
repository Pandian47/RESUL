import { Circle, Marker, Polygon, Polyline } from '@react-google-maps/api';
export const mapShapes = (item, idx, options) => {
    switch (item.shape) {
        case 'Polygon':
            var temp = item.value.split(';');
            var polygonOptions = [];
            for (let i = 0; i < temp?.length; i++) {
                polygonOptions.push({
                    lat: parseFloat(temp[i].split(',')[0]),
                    lng: parseFloat(temp[i].split(',')[1]),
                });
            }
            // return <Polygon key={idx} path={polygonOptions} options={options} />;
            break;
        case 'Polyline':
            var temp1 = item.value.split(';');
            var polylineOptions = [];
            for (let i = 0; i < temp1?.length; i++) {
                polylineOptions.push({
                    lat: parseFloat(temp1[i].split(',')[0]),
                    lng: parseFloat(temp1[i].split(',')[1]),
                });
            }
            // return <Polyline key={idx} path={polylineOptions} options={options} />;
            break;
    }
    var returnObj = {
        Circle: (
            <Circle
                key={idx}
                center={{
                    lat: parseFloat(item.value?.split(',')[0]),
                    lng: parseFloat(item.value?.split(',')[1]),
                }}
                radius={parseFloat(item.value?.split(',')[2])}
                options={{
                    fillColor: 'blue',
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: 'blue',
                    clickable: false,
                    editable: true,
                    zIndex: 1,
                }}
            />
        ),
        Marker: (
            <Marker
                key={idx}
                position={{
                    lat: parseFloat(item.value?.split(',')[0]),
                    lng: parseFloat(item.value?.split(',')[1]),
                }}
            />
        ),
        Polygon: <Polygon key={idx} path={polygonOptions} options={options} />,
        Polyline: <Polyline key={idx} path={polylineOptions} options={options} />,
    };
    return returnObj[item.shape];
};

export const googleAPIKey = 'AIzaSyDj7twdQi-yUVtKQ81sejzNonVKUhvcNt8';
