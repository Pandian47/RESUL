import { showPercentage } from 'Utils/modules/formatters';
import { PieChartSkeleton, ReachChannelSkeleton } from 'Components/Skeleton/Skeleton';
import { variablePieChartOptions } from 'Constants/Charts';
import { ch_email, ch_facebook, ch_paid_media, ch_qR_code, ch_website } from 'Constants/GlobalConstant/Colors/colorsVariable';
import { female_large, female_medium, male_large, male_medium, user_mini, user_question_mark_edge_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { getIndustryTopGraphChart, getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';

import RSHighchartsContainer from 'Components/Highcharts';

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
    const { segmentIndustry = {} } = summary || {};
    const industryResult = segmentIndustry?.industryResult || [];
    const getPercent = (val) => showPercentage((val / summary?.channelReachInfo?.totalReachCount) * 100);

    const processedIndustryData = useMemo(() => {
        const dataToProcess =
            industryResult?.length > 0
                ? industryResult.map((i) => ({
                      name: i.industryName,
                      y: i.industry_cnt,
                      z: i.industry_cnt,
                      isCount: true,
                  }))
                : (industryChart || []).map((i) => ({
                      name: i.name || i.industryName,
                      y: i.y || i.industry_cnt,
                      z: i.z || i.y || i.industry_cnt,
                      isCount: false,
                  }));

        if (dataToProcess.length === 0) return [];

        const aggregated = dataToProcess.reduce((acc, curr) => {
            const existing = acc.find((item) => item.name === curr.name);
            if (existing) {
                existing.y += curr.y;
                existing.z += curr.z;
            } else {
                acc.push({ ...curr });
            }
            return acc;
        }, []);

        const sorted = aggregated.sort((a, b) => b.y - a.y);
        const top4 = sorted.slice(0, 4);
        const remaining = sorted.slice(4);

        let finalData = [...top4];
        if (remaining.length > 0) {
            const othersCount = remaining.reduce((sum, item) => sum + item.y, 0);
            const othersZ = remaining.reduce((sum, item) => sum + (item.z || 0), 0);
            finalData.push({
                name: 'Others',
                y: othersCount,
                z: othersZ,
                isCount: sorted[0]?.isCount,
            });
        }

        const total =
            summary?.channelReachInfo?.totalReachCount ||
            aggregated.reduce((sum, item) => sum + item.y, 0);

        return finalData.map((item) => ({
            ...item,
            y: item.isCount ? (total > 0 ? parseFloat(((item.y / total) * 100).toFixed(2)) : 0) : item.y,
            z: item.z || item.y,
        }));
    }, [industryResult, industryChart, summary?.channelReachInfo?.totalReachCount]);

    const finalIndustryChart = processedIndustryData;

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
                        ) : !!finalIndustryChart && finalIndustryChart?.length !== 0 ? (
                            <div className="portlet-chart">
                                <RSHighchartsContainer
                                    key={'Industry'}
                                    smallText={`As on (${date})`}
                                    type='pie'
                                    options={variablePieChartOptions({
                                        height: 220,
                                        series: finalIndustryChart,
                                    })}
                                />
                            </div>
                        ) : (
                            <PieChartSkeleton size={160} className="mt-25" nodata={true} />
                        )}
                    </div>
                </div>
            </div>
        </Col>
    );
};

export default ReachByChannel;
