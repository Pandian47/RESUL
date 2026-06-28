import { SELECTED_ATTRIBUTE, SELECTED_KPI_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { CONDITION_ATTRIBUTE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_medium, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { KPI_TYPES } from '../constant';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RenderInputs from './RenderInputs';

const KPIData = ({ isUpdate }) => {
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);

    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name: 'kpiConditions' });
    const kpiCondition = useWatch({
        control,
        name: 'kpiConditions',
    });

    return (
        <Fragment>
            <div className="rs-form-element-wrapper rsfch-multi-middle mb30 pr0">
                <div className="rs-form-content-holder">
                    <div className="rsfch-label">Condition:</div>
                </div>

                <div className="rs-form-properties-holder">
                    <i
                        id="rs_data_circle_plus_fill_edge"
                        className={`${circle_plus_fill_edge_medium} ${isUpdate ? 'click-off' : ''}
                                icon-md color-primary-blue position-relative top4 ${
                                    fields?.length >= 4 ? 'click-off' : ''
                                }`}
                        onClick={() => {
                            if (!isUpdate) append({ attribute: '', value: '' });
                        }}
                    />
                </div>
            </div>
            {fields.map((condition, ind) => {
                const data = kpiCondition[ind];
                return (
                    <div key={condition.id} className="form-group">
                        <Row className=" ">
                            <Col sm={4}>
                                <RSKendoDropdown
                                    // className={'top-15'}
                                    name={`kpiConditions.${ind}.attribute`}
                                    control={control}
                                    data={dataCatalogueAttrs}
                                    filterName={'attributeName'}
                                    required
                                    textField={'uIPrintableName'}
                                    dataItemKey={'dataAttributeId'}
                                    label={CONDITION_ATTRIBUTE}
                                    disabled={isUpdate}
                                    rules={{ required: SELECTED_ATTRIBUTE }}
                                />
                            </Col>

                            <Col sm={8} className="d-flex pr13">
                                <div className="mr15 w-100">
                                    <RenderInputs attr={data} isUpdate={isUpdate} ind={ind} />
                                </div>
                                {/* </Col> */}
                                {/* <Col sm={1} className="pl10"> */}
                                {/* <div className="rs-form-properties-holder pl15"> */}
                                <div>
                                    <div className="rsfph-icons ">
                                        <i
                                            id="rs_data_circle_minus_fill_edge"
                                            className={`mr2 ${circle_minus_fill_edge_medium} ${
                                                fields?.length === 1 || ind === 0 ? 'click-off' : ''
                                            } ${
                                                isUpdate ? 'click-off' : ''
                                            } icon-md color-primary-red position-relative top5`}
                                            onClick={() => {
                                                if (!isUpdate) remove(ind);
                                            }}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                );
            })}
            <div className="form-group">
                <label>KPI Type: </label>
                <ul className="rs-list-inline">
                    {KPI_TYPES.map((kpiType, index) => (
                        <li key={kpiType}>
                            {/* <RSRadioButton
                                id={kpiType}
                                disabled={isUpdate}
                                control={control}
                                name={'kpiType'}
                                labelName={kpiType}
                                rules={index === 0 ? { required: SELECTED_KPI_TYPE } : {}}
                            /> */}
                            <RSRadioButton
                                name="kpiType"
                                labelName={kpiType}
                                disabled={isUpdate}
                                {...(index === 0
                                    ? {
                                          control,
                                          rules: { required: SELECTED_KPI_TYPE },
                                      }
                                    : {})}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </Fragment>
    );
};

export default memo(KPIData);
