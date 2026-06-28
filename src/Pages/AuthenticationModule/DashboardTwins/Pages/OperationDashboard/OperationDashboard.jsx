import { OPERATION_DASHBOARD_DATA, TOP_COMMUNICATIONS_AND_PRODUCTTYPE_TAB_CONFIG, UNIQUE_AUDIENCE_DROPDOWN } from './constant.jsx';
import { activeUser, audienceImage, campaignImage, concurrentUser, eventtrigger, inactiveUser, liveUserIcon } from 'Assets/Images';
import { areasplineChartOptions, columnChartOptions, pieChartOptions } from 'Constants/Charts';
import { arrow_up_bold_medium, circle_info_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Col, Row, Table } from 'react-bootstrap';
import { deliveryMethod } from '../../ChartOptions';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSHighchartsContainer from 'Components/Highcharts';
import RSTabbar from 'Components/RSTabber';


const progressbarData = [
    { name: 'Executed', value: 15, cls: 'executed' },
    { name: 'Pending', value: 25, cls: 'pending' },
    { name: 'Rejected', value: 10, cls: 'rejected' },
    { name: 'Scheduled', value: 50, cls: 'scheduled' },
];

const OperationDashboard = () => {
    return (
        <>
            <div className="operaction-dashboard mt30">
                <Row>
                    <Col md={6}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h4>Communication summary</h4>
                            </div>
                            <div className="portlet-body">
                                <Row>
                                    <Col md={6} className="com-summary left-bar">
                                        <div className="d-flex align-items-center">
                                            <div className="text-center">
                                                <img
                                                    src={campaignImage}
                                                    alt="Communication"
                                                    width={100}
                                                    height={100}
                                                ></img>
                                            </div>
                                            <div className="ml15">
                                                <p>Number of</p>
                                                <h5 className="font-md">
                                                    scheduled
                                                    <br />
                                                    communications
                                                </h5>
                                                <h2 className="font-xl font-bold">43</h2>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6} className="com-summary right-bar">
                                        <ul className="avr-listing">
                                            <li>
                                                <div className="user-count">
                                                    <h2 className="font-lg font-bold">43</h2>
                                                    <p>Last 30 days average communication</p>
                                                </div>
                                                <div className="percentage">
                                                    <p>7.5%</p>
                                                    <i
                                                        className={`${arrow_up_bold_medium} icon-lg color-secondary-green`}
                                                    />
                                                </div>
                                            </li>
                                            <li>
                                                <div className="user-count">
                                                    <h2 className="font-lg font-bold">30</h2>
                                                    <p>Yesterday's communications</p>
                                                </div>
                                                <div className="percentage">
                                                    <p>43%</p>
                                                    <i
                                                        className={`${arrow_up_bold_medium} icon-lg color-secondary-green`}
                                                    />
                                                </div>
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <div className="progressbar mt15 mb15">
                                            <ul className="d-flex text-center">
                                                {progressbarData.map((item, index) => {
                                                    return (
                                                        <li
                                                            key={index}
                                                            className={`${item.cls}-status`}
                                                            style={{ width: `${item?.value}%` }}
                                                        >
                                                            {item?.value}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                        <div className="legendList position-relative">
                                            <ul className="d-flex justify-content-center">
                                                {progressbarData.map((item, index) => {
                                                    return (
                                                        <li className={`${item.cls}-legend`} key={index}>
                                                            {item.name}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="portlet-container portlet-md position-relative">
                            <div className="portlet-header">
                                <h4>Audience summary</h4>
                            </div>
                            <div className="portlet-body">
                                <div className="row">
                                    <div className="col-md-6 d-flex align-items-lg-center justify-content-around com-summary   zIndex1">
                                        <div className="mt40">
                                            <img
                                                src={audienceImage}
                                                alt="audience communication"
                                                width={100}
                                                height={100}
                                            ></img>
                                            <h2 className="font-bold font-lg">17,448,276</h2>
                                            <p>Potential target audience</p>
                                        </div>
                                    </div>
                                    <div className="position-absolute od-audiencesummary">
                                        {/* <RSHighchartsContainer options={Charts.audienceSummary()} /> */}
                                        <RSHighchartsContainer
                                            options={pieChartOptions(
                                                OPERATION_DASHBOARD_DATA.audience_summary_chartData,
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h4>No. of communications by delivery method</h4>
                                <BootstrapDropdown
                                    data={['SDC', 'MDC', 'Event Trigger']}
                                    alignRight
                                    defaultItem={'SDC'}
                                    customAlignRight={true}
                                    className="float-end"
                                />
                            </div>
                            <div className="portlet-body">
                                <div className="row mb30">
                                    <BootstrapDropdown
                                        data={[
                                            'No. of SDC communications using this channel for delivery',
                                            'No. of channels used vs no. of Communications',
                                        ]}
                                        alignRight
                                        defaultItem={'No. of SDC communications using this channel for delivery'}
                                        customAlignRight={true}
                                        className=""
                                    />
                                </div>
                                <RSHighchartsContainer options={deliveryMethod()} />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h4>Event trigger communications</h4>
                            </div>
                            <div className="portlet-body">
                                <div className="portlet-chart row">
                                    <div className="col-md-5 d-flex align-items-lg-center justify-content-around com-summary">
                                        <div>
                                            <img
                                                src={eventtrigger}
                                                alt="audience communication"
                                                width={100}
                                                height={100}
                                            ></img>
                                            <h4 className="m0">Average</h4>
                                            <h3>Audience targeted</h3>
                                            <h2 className="font-bold font-lg">45,675</h2>
                                            <small className="font-xxs position-absolute mt10">
                                                Data: Average last 30 days
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        {/* <RSHighchartsContainer options={Charts.eventTriggerCommunication()} /> */}
                                        <RSHighchartsContainer
                                            options={columnChartOptions(
                                                OPERATION_DASHBOARD_DATA.event_trigger_chartData,
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <div className="portlet-container">
                            <div className="portlet-body">
                                <RSTabbar
                                    dynamicTab={`mb0 mini`}
                                    defaultClass={`tabTransparent`}
                                    activeClass={`active`}
                                    tabData={TOP_COMMUNICATIONS_AND_PRODUCTTYPE_TAB_CONFIG}
                                    className="rs-tabs row"
                                    componentClassName={'mt10'}
                                />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="portlet-container">
                            <div className="portlet-header">
                                <h4>Unique audience vs communication frequency (MTD)</h4>
                                <div className="float-end">
                                    <BootstrapDropdown
                                        data={UNIQUE_AUDIENCE_DROPDOWN}
                                        alignRight
                                        customAlignRight
                                        className=""
                                        defaultItem={'Email'}
                                        onSelect={(item, index) => {}}
                                    />
                                </div>
                            </div>
                            <div className="portlet-body">
                                <div className="mt-3">
                                    {/* <Table striped className='opd-table'>
                                        <thead>
                                            <tr>
                                               
                                                {['Unique audiences', 'Targeted by'].map((header) => (
                                                    <th  key={header}>{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { uniqueAudience: '2,214,162', targetBy: '> 35 Communications' },
                                                { uniqueAudience: '2,134,162', targetBy: '> 25 Communications' },
                                                { uniqueAudience: '5,446,825', targetBy: '> 15 Communications' },
                                                { uniqueAudience: '8,452,627', targetBy: '> 10 Communications' },
                                                { uniqueAudience: '9,276,421', targetBy: '> 5 Communications' },
                                            ].map((body, index) => (
                                                <tr key={body.uniqueAudience + index}>
                                                    <td>
                                                        <h4 className='font-bold mb0'>{body.uniqueAudience}</h4>
                                                    </td>
                                                    <td>
                                                        <div className='d-flex align-items-center'>
                                                            <p>{body.targetBy}</p>
                                                            <i className={`${circle_info_mini} color-primary-blue ml5`} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table> */}
                                    <div className="tabs-content rs-table-wrapper shadow-none">
                                        <Table className="m0">
                                            <thead>
                                                <tr>
                                                    {['Targeted by', 'Unique audiences'].map((header) => (
                                                        <th key={header}>{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    {
                                                        uniqueAudience: '2,214,162',
                                                        targetBy: '> 35 Communications',
                                                    },
                                                    {
                                                        uniqueAudience: '2,134,162',
                                                        targetBy: '> 25 Communications',
                                                    },
                                                    {
                                                        uniqueAudience: '5,446,825',
                                                        targetBy: '> 15 Communications',
                                                    },
                                                    {
                                                        uniqueAudience: '8,452,627',
                                                        targetBy: '> 10 Communications',
                                                    },
                                                    {
                                                        uniqueAudience: '9,276,421',
                                                        targetBy: '> 5 Communications',
                                                    },
                                                ].map((body, index) => (
                                                    <tr key={body.uniqueAudience + index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <p>{body.targetBy}</p>
                                                                {/* <i className={`${circle_info_mini} color-primary-blue ml5`} /> */}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <h4 className="mb0 text-right">{body.uniqueAudience}</h4>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row className="mb30">
                    {/* <Col md={6}>
                        <div className="box-design p15">
                            <div className="chart-titleblock mb16">
                                <h4 >Platform utillisation</h4>
                            </div>
                            <div className="platform-util-list">
                                <ul className="row align-items-md-center">
                                    <li className="col-md-6 position-relative">
                                        <span className="status-indicator"></span>
                                        <div className="row fill-border-status">
                                            <div className="col-sm-4 text-center px0 d-flex align-items-center justify-content-center">
                                                <img
                                                    src={liveUserIcon}
                                                    alt="Live user"
                                                    width={48}
                                                    height={48}
                                                ></img>
                                            </div>
                                            <div className="col-sm-2 px0 d-flex align-items-center justify-content-center">
                                                <h1 className="user-count">23</h1>
                                            </div>
                                            <div className="col-sm-6 position-relative px0 d-flex align-items-center justify-content-start">
                                                <div>
                                                    <p>Live users</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="col-md-6 position-relative">
                                        <span className="status-indicator"></span>
                                        <div className="row fill-border-status">
                                            <div className="col-sm-4 text-center px0 d-flex align-items-center justify-content-center">
                                                <img
                                                    src={concurrentUser}
                                                    alt="Concurrent user"
                                                    width={48}
                                                    height={48}
                                                ></img>
                                            </div>
                                            <div className="col-sm-2 px0 d-flex align-items-center justify-content-center">
                                                <h1 className="user-count">54</h1>
                                            </div>
                                            <div className="col-sm-6 position-relative px0 d-flex align-items-center justify-content-start">
                                                <div>
                                                    <p>Concurrent users</p>
                                                    <small className="font-xxs position-absolute font-bold">
                                                        Data: Average last 30 days
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="col-md-6 position-relative">
                                        <span className="status-indicator"></span>
                                        <div className="row fill-border-status">
                                            <div className="col-sm-4 text-center px0 d-flex align-items-center justify-content-center">
                                                <img
                                                    src={activeUser}
                                                    alt="Active user"
                                                    width={48}
                                                    height={48}
                                                ></img>
                                            </div>
                                            <div className="col-sm-2 px0 d-flex align-items-center justify-content-center">
                                                <h1 className="user-count">16</h1>
                                            </div>
                                            <div className="col-sm-6 position-relative px0 d-flex align-items-center justify-content-start">
                                                <div>
                                                    <p>Active users</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="col-md-6 position-relative">
                                        <span className="status-indicator"></span>
                                        <div className="row fill-border-status">
                                            <div className="col-sm-4 text-center px0 d-flex align-items-center justify-content-center">
                                                <img
                                                    src={inactiveUser}
                                                    alt="Inactive user"
                                                    width={48}
                                                    height={48}
                                                ></img>
                                            </div>
                                            <div className="col-sm-2 px0 d-flex align-items-center justify-content-center">
                                                <h1 className="user-count">0</h1>
                                            </div>
                                            <div className="col-sm-6 position-relative px0 d-flex align-items-center justify-content-start">
                                                <div>
                                                    <p>Inactive users</p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Col> */}

                    <Col md={6}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h4>Platform utilization</h4>
                            </div>
                            <div className="portlet-body">
                                <RSHighchartsContainer
                                    options={columnChartOptions(
                                        OPERATION_DASHBOARD_DATA.Platform_utillisation_chartData,
                                    )}
                                />
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h3>Last 7 days communication performance</h3>
                                <div className="d-flex">
                                    {/* <BootstrapDropdown
                                        data={['Mutual fund', 'Credit card', 'Fixed deposit', 'Loans', 'Personal loan']}
                                        alignRight
                                        customAlignRight
                                        className="mr15"
                                        defaultItem={'All products'}
                                        onSelect={(item, index) => { }}
                                    /> */}
                                    <BootstrapDropdown
                                        data={['Email', 'Messaging', 'Notifications', 'Social post', 'Ads']}
                                        alignRight
                                        customAlignRight
                                        className="mr15 top1"
                                        defaultItem={'All channels'}
                                        onSelect={(item, index) => {}}
                                    />
                                    {/* <BootstrapDropdown
                                        data={['Awareness', 'Greetings', 'New product launch', 'Promotion, Sale']}
                                        alignRight
                                        customAlignRight
                                        className="top1"
                                        defaultItem={'All communication types'}
                                        onSelect={(item, index) => {}}
                                    /> */}
                                </div>
                            </div>
                            <div className="portlet-body">
                                <RSHighchartsContainer
                                    pClassName={'x-axis-labels-performance'}
                                    options={areasplineChartOptions(
                                        OPERATION_DASHBOARD_DATA.communication_performance_chartData,
                                    )}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default OperationDashboard;
