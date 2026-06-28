import { RSPrimaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import { Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { sub_payload, sub_qos } from 'Pages/AuthenticationModule/Preferences/Pages/DataExchange/data';

const Subscribe = ({ getCard }) => {
    const { control } = useForm();
    return (
        <>
            <Container style={{ borderStyle: 'groove' }}>
                <span>
                    <h6>Topic to subscribe</h6>
                </span>
                <Row className="mt60">
                    <Col sm={4}>
                        <RSInput control={control} name={'name'} placeholder={'Topic name'}  id="rs_subscribe_Topicname" />
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDown
                            control={control}
                            name="qos"
                            data={sub_qos}
                            textField="type"
                            dataItemKey="typeId"
                            defaultValue={sub_qos[0]}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSCheckbox control={control} name="Retain" labelName={'Retain'}  id="rs_subscribe_checkbox"/>
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropDown
                            control={control}
                            name="payload"
                            data={sub_payload}
                            textField="type"
                            dataItemKey="typeId"
                            defaultValue={sub_payload[0]}
                        />
                    </Col>
                    <Col sm={4}>
                        <RSTextarea defaultValue="" control={control} name={'payloads'} placeholder={'payload'}  id="rs_subscribe_payload" />
                    </Col>
                </Row>
            </Container>
            <Row>
                <Col>
                    <RSPrimaryButton onClick={getCard}  id="rs_Subscribe_primarysub">{'Subscribe'}</RSPrimaryButton>
                </Col>
            </Row>
        </>
    );
};

export default Subscribe;
