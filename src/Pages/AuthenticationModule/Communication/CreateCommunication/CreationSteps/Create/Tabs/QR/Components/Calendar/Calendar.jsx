import { DateTimePicker } from '@progress/kendo-react-dateinputs';
import { Col, Row } from 'react-bootstrap';
import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';

const Calendar = ({ name, control }) => {
    return (
        <div>
            <Row>
                <Col sm={4}>
                    <label>Event name</label>
                </Col>
                <Col sm={8}>
                    <RSInput name={'event_name'} control={control} />
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <label>Start date and time</label>
                </Col>
                <Col sm={8}>
                    <RSDatetimePicker control={control} name="start" />
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <label>End date and time</label>
                </Col>
                <Col sm={8}>
                    {/* <RSDatetimePicker control={control} name="end" /> */}
                    <DateTimePicker name="end" control={control} format="MMM dd, yyyy:hh:mm:ss" />
                </Col>
            </Row>
            <Row>
                <Col sm={4}>
                    <label>Time Zone</label>
                </Col>
                <Col sm={8}>
                    <RSKendoDropdown name={'time_zone'} control={control} data={['Central Daylight Time']} />
                </Col>
            </Row>
        </div>
    );
};

export default Calendar;
