import { bubbleChartOptions, pieChartOptions } from 'Constants/Charts';
import { BY_MOBILE_NOTIFICATION, BY_WEB_NOTIFICATION, WEB_AND_NOTIFICATIONS } from 'Constants/GlobalConstant/Placeholders';
import { useMemo } from 'react';
import RSModal from 'Components/RSModal';
import { Col, Row } from 'react-bootstrap';

import RSHighchartsContainer from 'Components/Highcharts';

import { ensureArray, sanitizeMdmChartValue, sanitizeMdmMetric } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { MDM_COUNT_LIST_SECTION_CONFIG } from 'Pages/AuthenticationModule/Audience/Pages/MasterData/constant';
import { MdmCountListSections } from '../CountListSection';

const NotificationInfo = ({show=false, handleClose=()=>{}, chartData = {}, chartType='' }) => {
    const webData = ensureArray(chartData?.webNotifcation);
    const mobData = ensureArray(chartData?.mobileNotifcation);

    const data = useMemo(() => {
        function mergeArrays(webItems, mobileItems) {
            const mergedArray = [];

            webItems.forEach((item1) => {
                const existingItemIndex = mergedArray.findIndex((item) => item.name === item1?.name);
                const itemValue = sanitizeMdmMetric(item1?.value);
                if (existingItemIndex !== -1) {
                    mergedArray[existingItemIndex].value += itemValue;
                } else {
                    mergedArray.push({ ...item1, value: itemValue });
                }
            });

            mobileItems.forEach((item2) => {
                const existingItemIndex = mergedArray.findIndex((item) => item.name === item2?.name);
                const itemValue = sanitizeMdmMetric(item2?.value);
                if (existingItemIndex !== -1) {
                    mergedArray[existingItemIndex].value += itemValue;
                } else {
                    mergedArray.push({ ...item2, value: itemValue });
                }
            });

            return mergedArray;
        }

        const merged = mergeArrays(webData, mobData).filter((notification) => sanitizeMdmMetric(notification?.value) > 0);
        const tmpChartData = {};
        tmpChartData.series = merged.map((notification) => ({
            name: notification?.name,
            y: sanitizeMdmChartValue(notification?.value),
            value: sanitizeMdmChartValue(notification?.value),
        }));
        tmpChartData.angle = 90;
        return tmpChartData;
    }, [webData, mobData]);

    return (
        <RSModal
            show={Boolean(show)}
            size="xxlg"
            handleClose={() => handleClose(false)}
            header={WEB_AND_NOTIFICATIONS}
            body={
                <div className="master-recip-data-popup">
                    <Row>
                        <Col md={6} className="">
                            {chartType === 'MultiChart' ? (
                                <RSHighchartsContainer key="bubble" options={bubbleChartOptions(data)} />
                            ) : (
                                <RSHighchartsContainer key="pie" options={pieChartOptions(data)} />
                            )}
                        </Col>
                        <Col md={6} className="borderleft">
                            <MdmCountListSections
                                sections={[
                                    {
                                        title: BY_WEB_NOTIFICATION,
                                        items: webData,
                                        wrapPercentageInParens: false,
                                    },
                                    {
                                        title: BY_MOBILE_NOTIFICATION,
                                        items: mobData,
                                        wrapPercentageInParens: false,
                                        headingClassName: MDM_COUNT_LIST_SECTION_CONFIG.secondaryHeadingClassName,
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                </div>
            }
        />
    );
};

export default NotificationInfo;
