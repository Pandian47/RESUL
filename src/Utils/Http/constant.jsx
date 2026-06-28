import { formatName } from '..';
export const content = ({ url, message }) => (
    <div className="custom_toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="custom_toast-header">
            <h4 className=" fs16 fst-italic mb0">{url?.split('/')[1]}</h4>
        </div>
        <div className="custom_toast-body">
            <p className="fs15">{message}</p>
        </div>
    </div>
);

const endPointsUrlData = [
    {
        name: 'Audience/GetAudienceDashBoardandGridjson',
        friendlyName: 'DashBoardandGridjson',
    },
    {
        name: 'Audience/BindAudienceChart',
        friendlyName: 'BindAudienceChart',
    },
    {
        name: 'Audience/GetDynamicList',
        friendlyName: 'Dynamic listing',
    },
];
export const getEndpointFriendlyName = (endpoints) => {
    const updatedUrlName = formatName(endpoints);
    let finalName;
    const findEndPoint = endPointsUrlData?.find((endpoint) => formatName(endpoint?.name) == updatedUrlName);
    if (findEndPoint) {
        finalName = findEndPoint?.friendlyName;
    } else {
        finalName = endpoints;
    }
    return finalName;
};
