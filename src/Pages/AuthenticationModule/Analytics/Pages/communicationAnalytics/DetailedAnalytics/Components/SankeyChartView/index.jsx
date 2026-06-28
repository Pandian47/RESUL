import { LEVEL_CONFIG, SANKEY_CHART } from './constants';
import { ENTER_LEVELS } from 'Constants/GlobalConstant/Placeholders';
import { analytics_mini, download_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSInput from 'Components/FormFields/RSInput';
import RSPTooltip from 'Components/RSTooltip';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { useLocation } from 'react-router-dom';

const SankeyChartView = ({ gridView, chartView, cls }) => {
    const { control } = useForm();
    const [chartDropdownItem, setChartDropdownItem] = useState('1 Level');
    const { state } = useLocation();
    return (
        <div className={`additional-info-wrapper mt15 ${cls}`}>
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="m0">{SANKEY_CHART}</h4>

                <div className="d-flex float-end align-items-center">
                    <BootstrapDropdown
                        data={LEVEL_CONFIG}
                        defaultItem={chartDropdownItem}
                        customAlignRight
                        className="arrowdropdown mr15"
                        onSelect={(item) => setChartDropdownItem(item)}
                    />

                    <RSPTooltip text="Table view" position="top">
                        <i
                            className={`${analytics_mini} icon-md color-primary-blue mr15`}
                            onClick={() => {
                                chartView(false);
                                gridView(true);
                            }}
                        />
                    </RSPTooltip>
                    <RSPTooltip text="Download" position="top">
                        <i className={`${download_mini} icon-md color-primary-blue`} id="rs_data_download" />
                    </RSPTooltip>
                </div>
            </div>
            <Row className="pt15">
                <Col>
                    <RSMultiSelect
                        control={control}
                        name={'level1'}
                        label={'-- Select --'}
                        allowCustom
                        data={['Region', 'Account type']}
                    />
                </Col>
                <Col>
                    <RSMultiSelect
                        control={control}
                        name={'level2'}
                        label={'-- Select --'}
                        allowCustom
                        data={['Account type', 'Membership']}
                    />
                </Col>
                <Col>
                    <RSMultiSelect
                        control={control}
                        name={'level3'}
                        label={'-- Select --'}
                        allowCustom
                        data={['Membership', 'Content target']}
                    />
                </Col>
            </Row>

            <Row className="pt20">
                <Col>
                    <label className="pb5">Level 1 filter</label>
                    <RSInput control={control} name={'level1filter'} placeholder={ENTER_LEVELS} />
                </Col>
                <Col>
                    <label className="pb5">Level 2 filter</label>
                    <RSInput control={control} name={'level2filter'} placeholder={ENTER_LEVELS} />
                </Col>
                <Col>
                    <label className="pb5">Level 3 filter</label>
                    <RSInput control={control} name={'level3filter'} placeholder={ENTER_LEVELS} />
                </Col>
            </Row>
        </div>
    );
};

export default SankeyChartView;
