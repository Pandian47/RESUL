import { gridColumnData, gridData } from './constants';
import { ADVANCED_ANALYTICS, ANALYTICS, CHART_VIEW, CLOSE, DOWNLOAD } from 'Constants/GlobalConstant/Placeholders';
import { analytics_mini, circle_close_edge_mini, download_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import KendoGrid from 'Components/RSKendoGrid';

const SankeyGridView = ({ gridView, chartView, cls }) => {
    const { control } = useForm();
    return (
        <div className={`additional-info-wrapper mt15 ${cls}`}>
            <Row>
                <Col>
                    <h4 className="m0">{ADVANCED_ANALYTICS}</h4>
                </Col>
                <Col>
                    <ul className="d-flex float-end">
                        <li className="mr15">
                            <RSTooltip text={CHART_VIEW} position="top">
                                <i
                                    className={`${analytics_mini} icon-md color-primary-blue`}
                                    onClick={() => {
                                        gridView(false);
                                        chartView(true);
                                    }}
                                />
                            </RSTooltip>
                        </li>
                        <li className="mr15">
                            <RSTooltip text={DOWNLOAD} position="top">
                                <i className={`${download_mini} icon-md color-primary-blue`} id='rs_data_download' />
                            </RSTooltip>
                        </li>
                        <li>
                            <div onClick={() => gridView(false)}>
                                <RSTooltip text={CLOSE} position="top">
                                    <i className={`${circle_close_edge_mini} icon-md color-primary-blue`} />
                                </RSTooltip>
                            </div>
                        </li>
                    </ul>
                </Col>
            </Row>

            <Row>
                <Col className="mt10 mb15">
                    <RSMultiSelect
                        control={control}
                        name={'analytics'}
                        label={ANALYTICS}
                        allowCustom
                        data={['Membership', 'Product', 'City']}
                    />
                </Col>
            </Row>

            <Row>
                <Col>
                    <KendoGrid data={gridData} column={gridColumnData} />
                </Col>
            </Row>
        </div>
    );
};

export default SankeyGridView;
