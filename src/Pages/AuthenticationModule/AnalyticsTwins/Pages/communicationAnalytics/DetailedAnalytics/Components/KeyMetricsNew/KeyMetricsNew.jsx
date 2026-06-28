import { formatNumber } from 'Utils/modules/campaignUtils';
import { getUserDetails } from 'Utils/modules/crypto';
import { numberWithCommas } from 'Utils/modules/formatters';
import { getmasterData } from 'Utils/modules/masterData';
import { DetailKeyMetricSkeleton } from 'Components/Skeleton/Skeleton';
import { circle_info_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { clsName, InfoComponent, INITIAL_STATE, keyMetricsColors, keyMetricsColorsLastData } from './constants';

import RSTooltip from 'Components/RSTooltip';

const KeyMetricsNew = ({ data, infoIcon = true, middleDataHeader = true, pdfDownload, type, isChartExpanded }) => {
    // console.log('data: KeyMetricsNew', data);
    const [isOpenInfo, setIsOpenInfo] = useState(INITIAL_STATE);
    const [totalSentInfo, setTotalSentInfo] = useState([]);
    const [cindex, setCindex] = useState(0);
    const [lastPopupData, setLastPopupData] = useState([]);
    const [titleVal, setTitleVal] = useState('');

    useEffect(() => {
        if (isChartExpanded) {
            setIsOpenInfo(INITIAL_STATE);
        }
    }, [isChartExpanded]);
    const { currencyMasterList } = getmasterData();
    const { currencyId } = getUserDetails();
    let currsymbol = '₹';
    const matchingCurrency = currencyMasterList?.find((currency) => currency.currencyID === currencyId);
    currsymbol = matchingCurrency ? matchingCurrency.currenySymbol : currsymbol;

    return (
        <div className="csr-chart-portlet keymetrics-portlet portlet-container portlet-md p0">
            <h4>Key metrics</h4>
            {!!data && data?.length === 0 ? (
                <div className="p19">
                    <DetailKeyMetricSkeleton nodata={true} />
                </div>
            ) : (
                <>
                    <ul className="keymetrics-list key-border">
                        {data?.firstData?.map((item, index) => {
                            item.isOpen = false;
                            return (
                                <li key={`${item?.name ?? 'metric'}-${item?.value}-${index}`}>
                                        <div
                                            className={`text-black d-flex ${
                                                pdfDownload ? 'align-items-baseline' : 'align-items-center'
                                            }`}
                                        >
                                            {typeof item?.value === 'number' && item?.value > 1000 ? (
                                                <RSTooltip
                                                    text={numberWithCommas(item?.value || '0')}
                                                    position="top"
                                                >
                                                    <h3 className="pr5">{formatNumber(item?.value || 0)}</h3>
                                                </RSTooltip>
                                            ) : (
                                                <h3 className="pr5">{formatNumber(item?.value || 0)}</h3>
                                            )}
                                            {infoIcon && (
                                             
                                                <RSTooltip
                                                    className="lh0"
                                                    text={
                                                        item?.name === 'Total sent'
                                                            ? 'Scrubbed details'
                                                            : 'Delivered details'
                                                    }
                                                    position="top"
                                                >
                                                    {item?.infoPopup && (
                                                           <div   className={`${
                                                                item?.value === 0 ? 'pe-none click-off' : ''
                                                            } ${pdfDownload ? 'd-none' : ''}`}>
                                                        <i
                                                            id="rs_data_circle_info"
                                                            className={`${
                                                                circle_info_medium
                                                            } icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                item.isOpen = true;
                                                                setTitleVal(
                                                                    item?.name === 'Total sent'
                                                                        ? 'Pre-communication scrubbed before publish'
                                                                        : 'Still under delivery / Undelivered',
                                                                );
                                                                setIsOpenInfo((prevState) => {
                                                                    return {
                                                                        ...prevState,
                                                                        totalSentInfo: totalSentInfo,
                                                                        conversionInfo: false,
                                                                        setCindex: index,
                                                                    };
                                                                });
                                                                setTotalSentInfo(item?.infoPopup);
                                                                setCindex(index);
                                                            }}
                                                        />
                                                        </div>
                                                    )}
                                                </RSTooltip>
                                            )}
                                        </div>
                                        <span className="mt-3">{item?.name}</span>
                                    </li>
                            );
                        })}
                        {isOpenInfo.totalSentInfo && (
                            <InfoComponent
                                title={titleVal}
                                keyMetrics={totalSentInfo}
                                tootipSide={clsName[cindex]}
                                handleClose={() =>
                                    setIsOpenInfo((prevState) => ({
                                        ...prevState,
                                        totalSentInfo: false,
                                    }))
                                }
                            />
                        )}
                    </ul>

                    {middleDataHeader && <p className="text-center blue_medium">{data?.middleDataTitle}</p>}

                    <ul className="keymetrics-list keymetrics-theme ml2 mr2 mb2">
                        {data?.middleDataBg.map((item, index) => {
                            return (
                                <li
                                    className={`${
                                        data?.middleDataBg?.length === 1 ? 'bg-male' : keyMetricsColors[index]
                                    }`}
                                    key={`${item?.name ?? 'mid'}-${item?.value}-${index}`}
                                >
                                    {typeof item?.value === 'number' && item?.value > 1000 ? (
                                        <RSTooltip
                                            text={numberWithCommas(item?.value || '0')}
                                            position="top"
                                        >
                                            <h3>
                                                {formatNumber(item?.value || 0)}
                                                {item?.value2 && <small>{item?.value2}</small>}
                                            </h3>
                                        </RSTooltip>
                                    ) : (
                                        <h3>
                                            {formatNumber(item?.value || 0)}
                                            {item?.value2 && <small>{item?.value2}</small>}
                                        </h3>
                                    )}
                                  
                                    <span className="white mt-3">
                                        <small>{item?.name}</small>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    <ul className="keymetrics-list key-border">
                        {data?.lastData.map((item, index) => {
                            //debugger
                            return (
                                <li key={`${item?.name ?? 'last'}-${index}`}>
                                    <div
                                        className={`text-black d-flex ${
                                            pdfDownload ? 'align-items-baseline' : 'align-items-center'
                                        }`}
                                    >
                                        {typeof item?.value === 'number' && item?.value > 1000 ? (
                                            <RSTooltip
                                                text={
                                                    item?.value
                                                        ? numberWithCommas(item?.value || '0')
                                                        : item?.currency !== undefined && item?.currency !== null
                                                        ? item?.name === 'Conversion value'
                                                            ? numberWithCommas(Math.round(item.currency || 0))
                                                            : numberWithCommas(item.currency)
                                                        : numberWithCommas(item?.percent || '0')
                                                }
                                                position="top"
                                            >
                                                <h3 className="text-black d-flex align-items-center pr5">
                                                    {item?.name === 'Conversion value' && currsymbol}
                                                    {item?.value ? <>{typeof item?.value === 'number' ? formatNumber(item?.value) : item?.value}</> : null}
                                                    <>
                                                        {item?.currency !== undefined && item?.currency !== null
                                                            ? item?.name === 'Conversion value'
                                                                ? numberWithCommas(Math.round(item.currency || 0))
                                                                : formatNumber(item.currency)
                                                            : !item?.value
                                                            ? formatNumber(item?.percent || 0)
                                                            : null}
                                                        {item?.percent ? <span className="font-xsm">%</span> : null}
                                                    </>
                                                </h3>
                                            </RSTooltip>
                                        ) : (
                                            <h3 className="text-black d-flex align-items-center pr5">
                                                {item?.name === 'Conversion value' && currsymbol}
                                                {item?.value ? <>{typeof item?.value === 'number' ? formatNumber(item?.value) : item?.value}</> : null}
                                                <>
                                                    {item?.currency !== undefined && item?.currency !== null
                                                        ? item?.name === 'Conversion value'
                                                            ? numberWithCommas(Math.round(item.currency || 0))
                                                            : formatNumber(item.currency)
                                                        : !item?.value
                                                        ? formatNumber(item?.percent || 0)
                                                        : null}
                                                    {item?.percent ? <span className="font-xsm">%</span> : null}
                                                </>
                                            </h3>
                                        )}
                                        {infoIcon && item?.infoPopup && (
                                            <div
                                                className={`${
                                                    item?.infoPopup?.length === 0 || item?.currency === 0
                                                        ? 'pe-none click-off'
                                                        : ''
                                                } ${pdfDownload ? 'd-none' : ''} lh0`}
                                            >
                                                <i
                                                    id="rs_data_circle_info"
                                                    className={`${circle_info_medium} icon-md color-primary-blue`}
                                                    onClick={() => {
                                                        setIsOpenInfo((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                conversionInfo: true,
                                                            };
                                                        });
                                                        setLastPopupData(item?.infoPopup);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <span className="mt-3">{item?.name}</span>
                                    {item?.subName ? <p className="mb5">{item?.subName}</p> : null}
                                </li>
                            );
                        })}
                        {isOpenInfo.conversionInfo && (
                            <InfoComponent
                                title="Conversion value"
                                keyMetrics={lastPopupData}
                                tootipSide={'conversionuparrow'}
                                currencySymbol={currsymbol}
                                handleClose={() =>
                                    setIsOpenInfo((prevState) => ({
                                        ...prevState,
                                        conversionInfo: false,
                                    }))
                                }
                            />
                        )}
                    </ul>

                    <p className={`text-center ${data?.lastDataTitle === "Top location of participants" ? '' : 'red_medium' }`}>{data?.lastDataTitle}</p>

                    <ul className="keymetrics-list keymetrics-theme br-b-r br-b-l ml2 mr2 mb2">
                        {data?.lastDataBg.map((item, index) => {
                            return (
                                <li
                                    className={`${
                                        data?.lastDataBg?.length === 1
                                            ? 'bg-red-medium'
                                            : keyMetricsColorsLastData[index]
                                    } p-0 pt5`}
                                    key={`${item?.name ?? 'lastbg'}-${index}`}
                                >
                                    {typeof item?.value === 'number' && item?.value > 1000 ? (
                                        <RSTooltip
                                            text={numberWithCommas(item?.value || '0')}
                                            position="top"
                                        >
                                            <h3>
                                                {typeof item?.value === 'string' && item?.value.includes('%') 
                                                    ? item?.value 
                                                    : numberWithCommas(item?.value || '0')}
                                                {type === 'Qr code' && <small>%</small>}
                                            </h3>
                                        </RSTooltip>
                                    ) : (
                                        <h3>
                                            {typeof item?.value === 'string' && item?.value.includes('%') 
                                                ? item?.value 
                                                : numberWithCommas(item?.value || '0')}
                                            {type === 'Qr code' && <small>%</small>}
                                        </h3>
                                    )}
                                    <span className="white mt-3">
                                        <small>{item?.name === 'NotRegistered' ? 'Not Registered' : item?.name}</small>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
};

export default KeyMetricsNew;
