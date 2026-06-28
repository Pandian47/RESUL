import { numberWithCommas, showPercentage } from 'Utils/modules/formatters';
import { arrow_down_bold_medium, arrow_up_bold_medium, arrow_up_bold_mini, circle_info_medium, communication_target_xlarge, conversion_xlarge, engagement_xlarge } from 'Constants/GlobalConstant/Glyphicons';
import { Col, Row } from 'react-bootstrap';
import RSPPophover from 'Components/RSPPophover';
import Icon from 'Components/Icon/Icon';
import useQueryParams from 'Hooks/useQueryParams';

const CSR_BACKGROUND = {
    Reach: 'reach-bg',
    'Form views': 'reach-bg',
    Engagement: 'engagement-bg',
    'Form engagement': 'engagement-bg',
    'Form starts': 'engagement-bg',
    Conversion: 'conversion-bg',
    'Form submissions': 'conversion-bg',
    Comparison: 'conversion-bg',
    CTR: 'conversion-bg'
};
const BG_IMAGE = {
    Reach: `${communication_target_xlarge}`,
    'Form views': `${communication_target_xlarge}`,
    Engagement: `${engagement_xlarge}`,
    'Form engagement': `${engagement_xlarge}`,
    'Form starts': `${engagement_xlarge}`,
    Conversion: `${conversion_xlarge}`,
    'Form submissions': `${conversion_xlarge}`,
    Comparison: `${conversion_xlarge}`,
    CTR: `${conversion_xlarge}`
};

const OverviewList = ({ dataObj, isFooter = true }) => {
    const {channelId} = useQueryParams();
    return (
        <>
        <Row>
            {dataObj?.map((item, index) => {
                return (
                    <Col key={item?.name + index}>
                        <div className="csr-reach-portlet">
                            <div className="portlet-count-top">
                                <div className="campaignimage">
                                    <Icon
                                        icon={BG_IMAGE[item?.name]}
                                        size="xl"
                                        color="color-secondary-grey mr10"
                                        nocp
                                    />
                                    <h3>{item?.name}</h3>
                                    {/* <img
                                            src={BG_IMAGE[item?.name]}
                                            alt="Communication Communication"
                                            width={85}
                                            height={85}
                                        ></img> */}
                                </div>
                                <div className="campaign-portlet-data">
                                    <h1 className="font-bold">{item?.isDynamicZone ? '' : numberWithCommas(item?.value || 0)}</h1>
                                </div>
                            </div>

                            <div className={`portlet-count-middle ${channelId ===6 ? 'webanalytics-middle':''}`}>
                                <ul className="">
                                    {item?.lists?.map((list) => {
                                        const isPercentMetric = list?.percent || list?.percent === 0;
                                        const displayValue = isPercentMetric
                                            ? list?.hidePercent
                                                ? numberWithCommas(list?.percent || 0)
                                                : numberWithCommas(showPercentage(list?.percent || 0, 1))
                                            : list?.hidePercent
                                              ? numberWithCommas(list?.value || 0)
                                              : numberWithCommas(showPercentage(list?.value || 0, 1));

                                        return (
                                        <li key={list?.text} className="pl0">
                                            <p className="">{list?.text}</p>
                                            <div className="d-flex">
                                                <h3 className="total-count">{displayValue}</h3>
                                                {!list?.hidePercent && (
                                                    <span className="color-primary-black font-xsm font-bold">%</span>
                                                )}
                                            </div>

                                            {/* {list?.value && (
                                                <span className="ml10">
                                                    <span className="total-count">
                                                        {list?.value}
                                                        {numberWithCommas(list?.value)}{' '}
                                                    </span>
                                                </span>
                                            )} */}
                                            {list?.info && (
                                                <RSPPophover
                                                    text={list.info.map((item, index) => {
                                                        return (
                                                            <div key={item?.text}>
                                                                <span>{item?.text}: </span>
                                                                <span>{numberWithCommas(item?.value) || 0}</span>
                                                            </div>
                                                        );
                                                    })}
                                                    position="top"
                                                >
                                                    <i
                                                        id="rs_data_circle_info"
                                                        className={`${circle_info_medium} icon-md color-primary-blue ml5`}
                                                    ></i>
                                                </RSPPophover>
                                            )}
                                        </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            {isFooter && <div className={`${CSR_BACKGROUND[item?.name]} portlet-count-bottom`}>
                                <div>
                                    <span className="previous">
                                        {item?.footer?.name ? `${item.footer.name} ` : 'Previous day comparison'}
                                    </span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="total-value">
                                        {item?.footer?.value && item?.footer?.value !== 'NA'
                                            ? <>{item?.footer?.value}<span className='font-xsm'>%</span> </>
                                            : item?.footer?.value === 'NA'
                                                ? item?.footer?.value
                                                : 'N/A'}
                                        <i
                                            className={`${arrow_up_bold_mini} icon-sm white position-relative  cursor-default`}
                                        ></i>
                                    </span>
                                    {item?.footer?.value !== 'NA' ||
                                        ((item?.footer?.value === undefined || item?.footer?.value === null) && (
                                            <small className="d-inline-block white font-xsm position-relative top1">
                                                %
                                            </small>
                                        ))}
                                    {item?.footer?.value === 'NA' ||
                                        item?.footer?.value === '' ||
                                        item?.footer?.value === undefined ||
                                        item?.footer?.value === null ? null : (
                                        <>
                                            {item?.performance ? (
                                                <i
                                                    className={`${arrow_up_bold_medium} icon-md white position-relative top-1 cursor-default`}
                                                ></i>
                                            ) : (
                                                <i
                                                    className={`${arrow_down_bold_medium} icon-md white position-relative top-1 cursor-default`}
                                                ></i>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>}
                        </div>
                    </Col>
                );
            })}
            </Row>
        </>

    );
};

export default OverviewList;
