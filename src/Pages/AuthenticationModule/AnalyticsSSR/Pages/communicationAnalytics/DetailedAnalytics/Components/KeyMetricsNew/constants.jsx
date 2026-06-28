import { numberWithCommas } from 'Utils/modules/formatters';
import RSIcon from 'Components/RSIcon';

import RSTooltip from 'Components/RSTooltip';

export const InfoComponent = ({ keyMetrics, title, tootipSide, handleClose, currencySymbol = '' }) => {
    return (
        <div className={`key-info-popup ${tootipSide}`}>
            <div className="d-flex justify-content-between align-items-center">
                <h3 className="white font-sm">{title}</h3>
                <RSIcon handleClose={() => handleClose()} />
            </div>
            <ul className="info-spam-list">
                {keyMetrics?.map((item, index) => {
                    const valueNum = Number(item?.value);
                    const hasValue = item?.value !== undefined && item?.value !== null;
                    const isConversion = title === 'Conversion value';
                    const roundedValue = Number.isFinite(valueNum) ? Math.round(valueNum) : item?.value;
                    const showValueTooltip =
                        isConversion && Number.isFinite(valueNum) && Math.abs(valueNum) >= 1000;

                    return (
                        <li key={index}>
                            <p className="spam-text font-xsm">{item.text}</p>
                            {hasValue && (
                                <p className="font-xsm">
                                    {isConversion ? (
                                        showValueTooltip ? (
                                            <RSTooltip
                                                text={`${currencySymbol}${numberWithCommas(roundedValue)}`}
                                                position="top"
                                            >
                                                <span>{`- ${currencySymbol}${numberWithCommas(roundedValue)}`}</span>
                                            </RSTooltip>
                                        ) : (
                                            `- ${currencySymbol}${numberWithCommas(roundedValue)}`
                                        )
                                    ) : (
                                        `- ${numberWithCommas(item.value)}`
                                    )}
                                </p>
                            )}
                            {!isConversion && <p className="font-xsm">{`- ${numberWithCommas(item.count)}`}</p>}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export const INITIAL_STATE = {
    totalSentInfo: false,
    deliveredInfo: false,
    conversionInfo: false,
};

export const clsName = {
    0: 'totalSentuparrow',
    1: 'delivereduparrow',
};
export const keyMetricsColors = {
    0: 'bg-blue-light',
    1: 'bg-blue-medium',
    2: 'bg-blue-dark',
    3: 'bg-blue-heavy-dark',
};
export const keyMetricsColorsLastData = {
    0: 'bg-red-light',
    1: 'bg-red-medium',
    2: 'bg-red-dark',
    3: 'bg-red-heavy-dark',
};
