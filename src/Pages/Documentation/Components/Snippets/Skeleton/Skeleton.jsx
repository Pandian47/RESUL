import { ActiveUsersSkeleton, AttributeUtilisationSkeleton, AudienceSummarySkeleton, BubbleChartSkeleton, CSROverviewPopupSkeleton, CampaignDeliveryMethodSkeleton, CampaignPerformanceSkeleton, CampaignStatusSkeleton, CampaignSummarySkeleton, ColumnChartSkeleton, HorizontalSkeleton, KeyMetricsSmallSkeleton, NoData, OverviewSkeleton, PieChartSkeleton, PlatformUitlizationSkeleton, SankeyChartSkeleton, SemiPieChartSkeleton, SkeletonNoData, SkeletonPlanning, TopCampaignTypesSkeleton, TopProductTypesSkeleton, TopProductTypesSkeletonChartData, TopProductTypesSkeletonTableData, TrafficBreakdownSkeleton, UserStatusSkeleton } from 'Components/Skeleton/Skeleton';
import { Col, Row } from 'react-bootstrap';
export const SkeletonSnippets = (props) => {
    return (
        <Row>
            <SkeletonsComponent />
        </Row>
    )
}

const SkeletonsComponent = (props) => {
    return (
        <>
            <Row>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>SkeletonNoData</h3>
                        <SkeletonNoData />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>CampaignSummarySkeleton</h3>
                        <CampaignSummarySkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>AudienceSummarySkeleton</h3>
                        <AudienceSummarySkeleton />
                    </div>
                </Col>
                <Col md={12} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>CampaignStatusSkeleton</h3>
                        <CampaignStatusSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>AttributeUtilisationSkeleton</h3>
                        <AttributeUtilisationSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>TopProductTypesSkeleton</h3>
                        <TopProductTypesSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>TopProductTypesSkeletonChartData</h3>
                        <TopProductTypesSkeletonChartData />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>TopProductTypesSkeletonTableData</h3>
                        <TopProductTypesSkeletonTableData />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>TopCampaignTypesSkeleton</h3>
                        <TopCampaignTypesSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>CampaignDeliveryMethodSkeleton</h3>
                        <CampaignDeliveryMethodSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>PlatformUitlizationSkeleton</h3>
                        <PlatformUitlizationSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>CampaignPerformanceSkeleton</h3>
                        <CampaignPerformanceSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>UserStatusSkeleton</h3>
                        <UserStatusSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>KeyMetricsSmallSkeleton</h3>
                        <KeyMetricsSmallSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>ActiveUsersSkeleton</h3>
                        <ActiveUsersSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>OverviewSkeleton</h3>
                        <OverviewSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>HorizontalSkeleton</h3>
                        <HorizontalSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>TrafficBreakdownSkeleton</h3>
                        <TrafficBreakdownSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>CSROverviewPopupSkeleton</h3>
                        <CSROverviewPopupSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>PieChartSkeleton</h3>
                        <PieChartSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>SemiPieChartSkeleton</h3>
                        <SemiPieChartSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>BubbleChartSkeleton</h3>
                        <BubbleChartSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>ColumnChartSkeleton</h3>
                        <ColumnChartSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>SankeyChartSkeleton</h3>
                        <SankeyChartSkeleton />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>NoData</h3>
                        <NoData />
                    </div>
                </Col>
                <Col md={6} className='mb20'>
                    <div className='box-design position-relative height-100per'>
                        <h3 className='mb15'>SkeletonPlanning</h3>
                        <SkeletonPlanning />
                    </div>
                </Col>
            </Row>
        </>
    )
}