import { columnChartOptions } from 'Constants/Charts';
import { ENTER_VALID_DAYS, ENTER_VALID_DURATION, ENTER_VALID_POS_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { DURATION, POS_DATA, PRETEST_START_DATE } from 'Constants/GlobalConstant/Placeholders';
import { csv_medium } from 'Constants/GlobalConstant/Glyphicons';
import { RSSecondaryButton } from 'Components/Buttons';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSInput from 'Components/FormFields/RSInput';
import RSHighchartsContainer from 'Components/Highcharts';
import RSCard from 'Components/RSCard/RSCard';
import { useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import { uploadList } from '../../constants';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import { map as _map } from 'Utils/modules/lodashReplacements';
import DownloadCSV from 'Pages/AuthenticationModule/Components/DownloadCSV/DownloadCSV';
const hideColor = '#e9e9eb';

const CommunicationImpact = (props) => {
    const [uploadStatus, setUploadStatus] = useState(false);
    const uploadChart = uploadList;
    const { control, setError, clearErrors, watch } = useForm();

    const [isCampaignCSVModal, setIsCampaignCSVModal] = useState(false);

    const uploadChartStatus = useMemo(() => {
        const chart = uploadChart?.chartType;
        const chartSeries = chart?.series || [];
        const chartData = {
            categories: chart?.categories,
            xAxis: {
                title: 'Date',
                labels: true,
            },
            yAxis: {
                title: 'Count',
                labels: true,
            },
            legend: {
                enabled: true,
            },
            series: _map(chartSeries, (bench) => ({
                name: bench.name,
                data: bench.data?.map((val) => +val),
                color: bench.color,
                className: bench.color === hideColor ? 'd-none' : '',
            })),
        };
        return chartData;
    }, [uploadChart]);

    return (
        <Row className={`${props?.disable ? 'd-none' : ''}`}>
            <Col md={12}>
                <RSCard className="portlet-container">
                    <div className="portlet-header">
                        <h4>Communication impact</h4>
                    </div>

                    {/* Third Row */}
                    <FormProvider>
                        <form>
                            <Row>
                                <Col>
                                    <RSDatePicker
                                        required
                                        type={'date'}
                                        name="primarygoalPercentage"
                                        placeholder={PRETEST_START_DATE}
                                        control={control}
                                        maxLength={5}
                                        rules={{
                                            required: 'Days',
                                            minLength: {
                                                value: 2,
                                                message: ENTER_VALID_DAYS,
                                            },
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <RSInput
                                        required
                                        name="primarygoalPercentage"
                                        placeholder={`${DURATION}(in days)`}
                                        control={control}
                                        maxLength={5}
                                        rules={{
                                            required: 'Duration',
                                            minLength: {
                                                value: 2,
                                                message: ENTER_VALID_DURATION,
                                            },
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <RSInput
                                        required
                                        name="primarygoalPercentage"
                                        placeholder={POS_DATA}
                                        control={control}
                                        maxLength={5}
                                        rules={{
                                            required: 'POS data',
                                            minLength: {
                                                value: 2,
                                                message: ENTER_VALID_POS_DATA,
                                            },
                                        }}
                                    />
                                    <div
                                        className="align-items-center cp d-flex lh0 mt15"
                                        onClick={() => setIsCampaignCSVModal(true)}
                                    >
                                        <i className={`${csv_medium} icon-md color-primary-blue `}></i>
                                        <span className="ml5 inline">Download CSV</span>
                                    </div>
                                </Col>
                                <Col>
                                    <RSFileUpload
                                        containerClass="top-7"
                                        reportUpload
                                        fileClass="d-none"
                                        btnCol={12}
                                        clearErrors={() => {}}
                                        setError={() => {}}
                                        control={control}
                                        name="apnsFilePath"
                                        text="Browse"
                                        watch={watch}
                                        required
                                    >
                                        <RSSecondaryButton
                                            className="color-secondary-blue ml15"
                                            onClick={() => setUploadStatus(!uploadStatus)}
                                            type="button"
                                        >
                                            Upload
                                        </RSSecondaryButton>
                                    </RSFileUpload>
                                </Col>
                            </Row>
                        </form>
                    </FormProvider>
                    <DownloadCSV
                        show={isCampaignCSVModal}
                        handleClose={() => {
                            setIsCampaignCSVModal(false);
                        }}
                        confirm={(s) => {
                            setIsCampaignCSVModal(false);
                        }}
                    />
                    {uploadStatus && <RSHighchartsContainer options={columnChartOptions(uploadChartStatus)} />}
                </RSCard>
            </Col>
        </Row>
    );
};

export default CommunicationImpact;
