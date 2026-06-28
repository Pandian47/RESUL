import { showPercentage } from 'Utils/modules/formatters';
import { PieChartSkeleton, ReachChannelSkeleton } from 'Components/Skeleton/Skeleton';
import { ch_email, ch_facebook, ch_paid_media, ch_qR_code, ch_website } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { female_large, female_medium, male_large, male_medium, user_mini, user_question_mark_edge_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { getIndustryTopGraphChart, getSummaryList } from 'Reducers/analyticsSSR/analyticsSummary/selector';

const reachChannel = [
    {
        name: 'Known audience of',
        y: 65,
        icon: user_mini,
        data: [
            {
                name: 'Email',
                y: 42,
            },
            {
                name: 'Facebook',
                y: 38,
            },
            {
                name: 'Paid media',
                y: 20,
            },
        ],
    },
    {
        name: 'Unknown audience of',
        y: 35,
        icon: user_question_mark_edge_mini,
        data: [
            {
                name: 'Paid media',
                y: 47,
            },
            {
                name: 'QR code',
                y: 33,
            },
            {
                name: 'Website',
                y: 20,
            },
        ],
    },
];

const reachChannelColor = {
    Email: ch_email,
    Facebook: ch_facebook,
    'Paid media': ch_paid_media,
    'QR code': ch_qR_code,
    Website: ch_website,
};

const ReachByChannel = ({ date }) => {
    const summary = useSelector((state) => getSummaryList(state));
    const isBusiness1 = summary?.businessType === 1;
    const industryChart = useSelector((state) => getIndustryTopGraphChart(state));

    const getPercent = (val) => showPercentage((val / summary?.channelReachInfo?.totalReachCount) * 100);

    return (
        <Col md={6}>
            <div className="portlet-container portlet-sm">
                <div className="portlet-header">
                    <Row className="m0 w-100">
                        <Col>
                            <h4 className="mb0"> {isBusiness1 ? 'Industry' : 'Demography'} </h4>
                        </Col>
                        {!isBusiness1 ? (
                            <Col>
                                <h4 className="mb0">By age</h4>
                            </Col>
                        ) : null}
                    </Row>
                </div>
                <div className="portlet-body">
                    <div className="progressbar-list d-flex flex-column justify-content-center">
                        {!isBusiness1 ? (
                            summary?.demographic?.maleCount > 0 || summary?.demographic?.femaleCount > 0 ? (
                                <Row>
                                    <Col className="position-relative">
                                        <div className="left0 m-auto position-absolute right0 bottom10">
                                            <ul className="male-female">
                                                <li
                                                    className={'bg-male'}
                                                    style={{
                                                        height: `${Math.max(
                                                            summary?.demographic?.malePercent * 2,
                                                            65,
                                                        )}%`,
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center mt5 justify-content-center">
                                                        <h1 className="font-bold">
                                                            {summary?.demographic?.malePercent}
                                                        </h1>
                                                        <sub>%</sub>
                                                    </div>
                                                    <i className={`${male_large} icon-md`}></i>
                                                </li>

                                                <li
                                                    className={'bg-female'}
                                                    style={{
                                                        height: `${Math.max(
                                                            summary?.demographic?.femalePercent * 2,
                                                            65,
                                                        )}%`,
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center mt5 justify-content-center">
                                                        <h1 className="font-bold">
                                                            {summary?.demographic?.femalePercent}
                                                        </h1>
                                                        <sub>%</sub>
                                                    </div>
                                                    <i className={`${female_large} icon-md`}></i>
                                                </li>
                                            </ul>
                                            <small className="color-secondary-black text-center">
                                                Majority of audiences:{' '}
                                                {summary?.demographic?.maleCount >= summary?.demographic?.femaleCount
                                                    ? 'Male'
                                                    : 'Female'}
                                            </small>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="industry-legend">
                                            <ul className="d-flex flex-column">
                                                <li>
                                                    <div
                                                        className={`d-flex float-start justify-content-end bgGreen-medium bg-chart`}
                                                    >
                                                        <span className="white">0 - 18</span>
                                                        <i className={`${male_large} icon-md white`}></i>
                                                        <i className={`${female_large} icon-md ml-11 white`}></i>
                                                    </div>
                                                    <div
                                                        className={`d-flex float-start justify-content-end percent-infoBox percent bg-chart `}
                                                    >
                                                        {summary?.demographic?.under18Percent}
                                                        <small className="font-xxs position-relative top1">%</small>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div
                                                        className={`d-flex float-start justify-content-end bgBlue-medium  bg-chart`}
                                                    >
                                                        <span className="white">19 -30</span>
                                                        <i className={`${male_large} icon-md white`}></i>
                                                        <i className={`${female_large} icon-md ml-11 white`}></i>
                                                    </div>
                                                    <div
                                                        className={`d-flex float-start justify-content-end percent-infoBox percent bg-chart`}
                                                    >
                                                        {summary?.demographic?.nineteento30Percent}
                                                        <small className="font-xxs position-relative top1">%</small>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div
                                                        className={`d-flex float-start justify-content-end bgMaroon-medium  bg-chart`}
                                                    >
                                                        <span className="white">31 - 45</span>
                                                        <i className={`${male_medium} icon-md white`}></i>
                                                        <i className={`${female_medium} icon-md ml-11 white`}></i>
                                                    </div>
                                                    <div
                                                        className={`d-flex float-start justify-content-end percent-infoBox percent bg-chart`}
                                                    >
                                                        {summary?.demographic?.thirtyOneto45Percent}
                                                        <small className="font-xxs position-relative top1">%</small>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div
                                                        className={`d-flex float-start justify-content-end bgYellow-medium bg-chart`}
                                                    >
                                                        <span className="white">Others</span>
                                                        <i className={`${male_large} icon-md white`}></i>
                                                        <i className={`${female_large} icon-md ml-11 white`}></i>
                                                    </div>
                                                    <div
                                                        className={`d-flex float-start justify-content-end percent-infoBox  percent bg-chart`}
                                                    >
                                                        {summary?.demographic?.above45Percent}
                                                        <small className="font-xxs position-relative top1">%</small>
                                                    </div>
                                                </li>
                                                {/* ); */}
                                                {/* })} */}
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                            ) : (
                                <ReachChannelSkeleton className="mt-30" isError={true} />
                            )
                        ) : !!industryChart && industryChart?.length !== 0 ? (
                            <>
                                {industryChart?.map((item, index) => {
                                    return (
                                        <Fragment key={item?.name + index}>
                                            <h5 className="mb10">
                                                {item?.name}{' '}
                                                {item?.y ? (
                                                    <span className="font-bold">
                                                        {item?.y}
                                                        <sub>%</sub>
                                                    </span>
                                                ) : (
                                                    '0'
                                                )}
                                            </h5>
                                            <div className="progressbar mb2">
                                                <div className="progressbar-legend">
                                                    <div className="progressbar-dum">
                                                        {item?.data?.map((items, i) => {
                                                            return (
                                                                <Fragment key={'reactbychannel' + i}>
                                                                    <div
                                                                        className={`progressbar-percent`}
                                                                        style={{
                                                                            width: items?.y + '%',
                                                                            backgroundColor:
                                                                                reachChannelColor[items?.name] ??
                                                                                '#e7f2f8',
                                                                        }}
                                                                    >
                                                                        {i === 0 ? (
                                                                            <i className={item?.icon}></i>
                                                                        ) : null}
                                                                        <label>
                                                                            {items?.y}
                                                                            <sub className="font-xs">%</sub>
                                                                        </label>
                                                                    </div>
                                                                </Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pro-legend-title mb20">
                                                {item?.data?.map((items) => {
                                                    return (
                                                        <div style={{ width: items?.y + '%' }} key={items?.name}>
                                                            <small className="color-secondary-black">
                                                                {items?.name}
                                                            </small>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Fragment>
                                    );
                                })}
                            </>
                        ) : (
                            <PieChartSkeleton size={160} className="mt-15" nodata={true} />
                        )}
                    </div>
                    {!!industryChart && industryChart?.length !== 0 ? (
                        <small className="portlet-info-text">{`(As on: ${date})`}</small>
                    ) : null}
                </div>
            </div>
        </Col>
    );
};

export default ReachByChannel;
