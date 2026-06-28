import { MAX_LENGTH10 } from 'Constants/GlobalConstant/Regex';
import { ENTER_TEMPLATE_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { ACTION, FREQUENCY } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSCheckbox from 'Components/FormFields/RSCheckbox';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';

const LifetimeCap = () => {
    const { control } = useForm();
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};

    return (
        <Fragment>
            <>
                <div className="rs-sub-heading">
                    <div className="rss-left">
                        <h4>Lifetime cap</h4>
                    </div>
                </div>
                <div className="form-group mb0">
                    <Row>
                        <Col sm={6}>
                            <RSKendoDropDownList
                                control={control}
                                name="action"
                                label={ACTION}
                                data={['Undelivered', 'Not engaged']}
                                required
                            />
                            <small className="mt10">
                                Note: DND/Unsubscription will be auto-scrubbbed during the communication blast process.
                            </small>
                        </Col>
                        <Col sm={6}>
                            <Row>
                                <Col sm={11}>
                                    <RSInput
                                        control={control}
                                        name={'frequency'}
                                        placeholder={FREQUENCY}
                                        maxLength={MAX_LENGTH10}
                                        required
                                        rules={{
                                            required: ENTER_TEMPLATE_ID,
                                        }}
                                    />
                                </Col>
                                <Col sm={1} className="fg-icons-wrapper pl0">
                                    <div className="fg-icons">
                                        <RSTooltip position="top" text="Add">
                                            <i
                                                className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue`}
                                                id="rs_data_circle_plus_fill_edge"
                                            />
                                        </RSTooltip>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p className="mt20 mb20">
                                The rule will only be applicable to bulk and promotional communications.
                            </p>
                            <RSCheckbox
                                control={control}
                                name={`transactionCommunication`}
                                defaultValue={true}
                                labelName={'Apply to transactional communications.'}
                            />
                        </Col>
                    </Row>
                </div>
            </>

            <div className="buttons-holder">
                <RSSecondaryButton type="button">Cancel</RSSecondaryButton>
                {addAccess && <RSPrimaryButton>Save</RSPrimaryButton>}
            </div>
        </Fragment>
    );
};

export default LifetimeCap;
