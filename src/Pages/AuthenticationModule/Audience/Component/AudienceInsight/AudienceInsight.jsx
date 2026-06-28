import { getChartColor } from 'Utils/modules/charts';
import { numberWithCommas } from 'Utils/modules/formatters';
import { truncateTitle } from 'Utils/modules/displayCore';
import { Progressbar } from 'Constants/Charts/pieChartPercentage';
import RSTooltip from 'Components/RSTooltip';

const AudienceInsight = ({ insightData = {} }) => {
    return (
        <div className="box-design no-box-shadow col-card css-scrollbar m0">
            <h3 className="mb20">{`${insightData?.column?.slice(0, 1)?.toUpperCase()}${insightData?.column?.slice(
                1,
            )}`}</h3>
            {insightData?.values?.length ? (
                insightData?.values?.map((item, index) => {
                    return (
                        <div className="progressbar" key={index}>
                            {item?.label && item?.label?.length > 25 ? (
                                <small>
                                    <RSTooltip position="bottom" text={item?.label}>
                                        {truncateTitle(item?.label, 15)}
                                    </RSTooltip>
                                </small>
                            ) : (
                                <small>{item?.label}</small>
                            )}
                            <small className="percentage">{item?.percentage}%</small>
                            <Progressbar
                                bgcolor={getChartColor()}
                                progress={item?.percentage}
                                height={10}
                                width={'100%'}
                                icon={<i className={`${getChartColor()} icon-lg color-primary-blue`}></i>}
                                isDetailStatus={true}
                            />
                            <p className="text-right font-bold">{numberWithCommas(item?.count)}</p>
                        </div>
                    );
                })
            ) : (
                <p>No data Available</p>
            )}
        </div>
    );
};

export default AudienceInsight;
