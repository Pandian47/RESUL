import { standardizeDateFormat } from 'Utils/modules/dateTime';
import { INFO_CONTENT_CHARTDATA } from '../../constant';
import { columnChartOptions } from 'Constants/Charts';
import { CLOSE, DOWNLOAD_CSV, SEND_TIME_PROPENSITY, SPLIT_SCHEDULE_EQYAL, SPLIT_SCHEDULE_INCREMENTAL } from 'Constants/GlobalConstant/Placeholders';
import { circle_close_medium, close_medium, csv_download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSHighchartsContainer from 'Components/Highcharts';
import KendoGrid from 'Components/RSKendoGrid';

import { LIMIT_LIST_COLUMN_DATA } from '../../constant';
import RSIcon from 'Components/RSIcon';
import RSTooltip from 'Components/RSTooltip';
import useQueryParams from 'Hooks/useQueryParams';
import moment from 'moment';
const InfoContent = ({ show, handleClose, tab }) => {
    const state = useQueryParams('/communication');
    const { watch } = useFormContext();
    const [rawAudienceTimeData, volumeType] = watch([`${tab}.audienceTimeData`, `${tab}.volumeType`]);
    const audienceTimeData = Array.isArray(rawAudienceTimeData) ? rawAudienceTimeData : [];
    const hasAudienceTimeData = audienceTimeData.length > 0;

    const downloadAudienceTimeData = () => {
        if (!hasAudienceTimeData) return;

        // const csvContent = [
        //     ['Day', 'Date', 'Audience count'],
        //     ...audienceTimeData.map((item) => [item.day, new Date(item.date).toDateString(), item.audienceCount]),
        // ]
        const csvContent = [
            ['Day', 'Date', 'Audience count'],
            ...audienceTimeData.map((item) => {
                const standardized = standardizeDateFormat();
                const formattedDate = standardized ? moment(standardized).format('ddd MMM DD YYYY') : 'Invalid Date';
                return [item.day, item?.date, item.audienceCount];
            }),
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = state?.campaignName + new Date().toLocaleTimeString() + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        <>
            {hasAudienceTimeData ? (
                <div>
                    <Row className="mb10">
                        <Col sm={10}>
                        <div className='d-flex gap-2 align-items-center'>
                            <h4 className='mb0'>
                                {volumeType === 'Equal' ? SPLIT_SCHEDULE_EQYAL : SPLIT_SCHEDULE_INCREMENTAL}
                            </h4>
                             <RSTooltip text={DOWNLOAD_CSV} position="top" className="bottom3 lh0 position-relative">
                                <i
                                    className={`${csv_download_medium} icon-md color-primary-blue`}
                                    onClick={() => downloadAudienceTimeData()}
                                ></i>
                            </RSTooltip>
                            </div>
                        </Col>

                        <Col sm={2}>
                            <RSTooltip text={CLOSE} position="top" className="lh0 position-absolute right7 top7">
                                <i
                                    className={`${circle_close_medium} icon-md color-primary-blue`}
                                    onClick={() => handleClose()}
                                ></i>
                            </RSTooltip>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="limitaudiencetime">
                            <KendoGrid
                                data={audienceTimeData}
                                noBoxShadow={true}
                                column={LIMIT_LIST_COLUMN_DATA}
                                pageable={false}
                                // settings={{ total: audienceTimeData?.length }}
                                isFullData
                            />
                        </Col>
                    </Row>
                </div>
            ) : (
                <div>
                    <Row
                        className="mb20 position-relative"
                        style={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                        <Col sm={6}>
                            <h3>{SEND_TIME_PROPENSITY}</h3>
                        </Col>

                        {/* <Col sm={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <i
                                className={`${close_medium} icon-md color-primary-blue`}
                                onClick={() => handleClose()}
                            ></i>
                        </Col> */}
                        <Col sm={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div onClick={() => handleClose()} className="position-absolute right-2 top-18">
                                <RSIcon className={'icon-md color-primary-blue '} />
                            </div>
                        </Col>
                    </Row>
                    <div className="portlet-body ">
                        <RSHighchartsContainer
                            options={columnChartOptions(INFO_CONTENT_CHARTDATA)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default InfoContent;
