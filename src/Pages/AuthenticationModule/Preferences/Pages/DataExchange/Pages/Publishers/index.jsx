import { circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTabbar from 'Components/RSTabber';
import { VERTICAL_TAB_CONFIG_PUBLISH } from '../constant';

const Publishers = () => {
    return (
        <div className="mt21 dataExchangePageCSS">
            <div className="rs-vertical-tabs-wrapper">
                <RSTabbar
                    dynamicTab="vertical-tabs rsv-tabs-list"
                    activeClass="active"
                    tabData={VERTICAL_TAB_CONFIG_PUBLISH}
                    defaultTab={0}
                />
            </div>
        </div>
    );
};

export default Publishers;

// import React from 'react';

// // import { publishersList } from './constant';
// import { Card } from 'react-bootstrap';

// import TableAttributes from '../DataIngestion/Components/DataExchangeModals/Common/TableAttributes';
// import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
// import { useDispatch } from 'react-redux';

// const Publishers = () => {
//     const dispatch = useDispatch();
//     return (
//         <div className="tabs-content">
//             <h3>Integrated systems</h3>
//             <div className="card-body border-primary text-center">
//                 <p className="card-text py100">No systems have been connected. Click the + icon to link the system.</p>
//             </div>
//             {publishersList?.map(({ id, src }) => {
//                 return (
//                     <Card key={id}>
//                         <Card.Body>
//                             <img variant="top" src={src} />
//                             <div className="addPlusIcon">
//                                 <i
//                                     className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`}
//                                     onClick={() => {
//                                         dispatch(
//                                             updateIntegartedSytem({
//                                                 field: 'connectFields',
//                                                 data: {
//                                                     name: 'mqtt',
//                                                     fields: [
//                                                         {
//                                                             name: 'Client name',
//                                                             placeHolder: 'Client name',
//                                                             value: '',
//                                                             type: 'text',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'Client ID',
//                                                             placeHolder: 'Client ID',
//                                                             value: '',
//                                                             type: 'text',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'protocal',
//                                                             placeHolder: '-- Protocol --',
//                                                             value: '',
//                                                             type: 'dropdown',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'Hostname',
//                                                             placeHolder: 'Hostname',
//                                                             value: '',
//                                                             type: 'text',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'User name',
//                                                             placeHolder: 'User name',
//                                                             value: '',
//                                                             type: 'text',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'password',
//                                                             placeHolder: 'password',
//                                                             value: '',
//                                                             type: 'password',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'KeepAlive (seconds)',
//                                                             placeHolder: 'KeepAlive (seconds)',
//                                                             value: '',
//                                                             type: 'text',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'Connect timeout (milliseconds)',
//                                                             placeHolder: 'Connect timeout (milliseconds)',
//                                                             value: '',
//                                                             type: 'text',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'Reconnect period (milliseconds)',
//                                                             placeHolder: 'Reconnect period (milliseconds)',
//                                                             value: '',
//                                                             type: 'text',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'Auto connect on app launch',
//                                                             placeHolder: 'Auto connect on app launch',
//                                                             value: '',
//                                                             type: 'checkbox',
//                                                             size: 4,
//                                                         },
//                                                         {
//                                                             name: 'Broker is MQTT v3.1.1 compliant',
//                                                             placeHolder: 'Broker is MQTT v3.1.1 compliant',
//                                                             value: '',
//                                                             type: 'checkbox',
//                                                             size: 4,
//                                                         },
//                                                     ],
//                                                 },
//                                             }),
//                                         );
//                                     }}
//                                 ></i>
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 );
//             })}
//             {/* <TableAttributes /> */}
//         </div>
//     );
// };

// export default Publishers;
