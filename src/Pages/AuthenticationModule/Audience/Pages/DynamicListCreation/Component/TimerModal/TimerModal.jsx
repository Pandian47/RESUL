import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSDatePicker from 'Components/FormFields/RSDatePicker';

import { getDateBasedOnDay } from 'Components/RSDateRangePicker/constants';

const getRecencyDateRange = (recencyValue) => {
    if (!recencyValue || recencyValue === 'Custom range') return null;

    if (recencyValue === 'Last 1 day') {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate());
        return { start, end };
    }

    return getDateBasedOnDay(recencyValue);
};

const TimerModal = ({ show, handleClose, name }) => {
    const {
        control,
        watch,
        setValue,
        getValues,
        setError,
        clearErrors,
    } = useFormContext();

    const recency = watch(`${name}.recency`);
    const timeForm = watch(`${name}.TimerFrom`);
    const timerTo = watch(`${name}.TimerTo`);

    const handleDate = () => {
        if (timeForm > timerTo) {
            setError(`${name}.TimerTo`, {
                type: 'custom',
                message: 'Enter the greater value ',
            });
            return true;
        } else {
            clearErrors([`${name}.TimerTo`, `${name}.TimerFrom`]);
        }
    };

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            size="md"
            header="Recency & Frequency"
            body={
                <div>
                    <div className="form-group mt20">
                        <RSKendoDropdown
                            control={control}
                            name={`${name}.recency`}
                            data={['Last 1 day', 'Last 7 days', 'Last 30 days', 'Custom range']}
                            label={'Recency'}
                        />
                    </div>
                    {recency === 'Custom range' && (
                        <Row className="form-group recency-time-date align-items-end">
                            <Col>
                                <RSDatePicker
                                    control={control}
                                    name={`${name}.TimerFrom`}
                                    label="Start date"
                                    placeholder="DD-MM-YYYY"
                                />
                            </Col>
                            <Col sm={1} className="text-center recency-date-separator">
                                <span>to</span>
                            </Col>
                            <Col className="timermodal-date-timer">
                                <RSDatePicker
                                    control={control}
                                    name={`${name}.TimerTo`}
                                    label="End date"
                                    placeholder="DD-MM-YYYY"
                                />
                            </Col>
                        </Row>
                    )}

                    <Row className="align-items-end">
                        <Col sm={5} className="pr0">
                            <RSKendoDropdown
                                control={control}
                                name={`${name}.frequency`}
                                data={['1', '2', '3', '4', '5', '6']}
                                label={'Frequency'}
                            />
                        </Col>
                        <Col sm={4} className="d-flex align-items-center">/ Times</Col>
                    </Row>
                </div>
            }
            footer={
                <div className="buttons-holder m0">
                    <RSSecondaryButton
                        onClick={() => {
                            // setDeleteRule(false);
                            handleClose();
                        }}
                        id="rs_TimerModal_Cancel"
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            // setDeleteRule(true);
                            // if (!isCount && value !== 'Select Form before Attributes') removeRule();
                            let temp = '';
                            if (recency === 'Custom range') {
                                // temp =
                                //     getMMMDDYYYY(getValues(`${name}.TimerFrom`)) +
                                //     ' - ' +
                                //     getMMMDDYYYY(getValues(`${name}.TimerTo`)) +
                                //     ', ' +
                                //     getValues(`${name}.frequency`) +
                                //     ' times';
                                temp =
                                    getUserCurrentFormat(getValues(`${name}.TimerFrom`))?.dateFormat +
                                    ' - ' +
                                    getUserCurrentFormat(getValues(`${name}.TimerTo`))?.dateFormat +
                                    ', ' +
                                    getValues(`${name}.frequency`) +
                                    ' times';
                            } else {
                                const tempDate = getRecencyDateRange(recency);
                                // temp =
                                //     getMMMDDYYYY(tempDate.start) +
                                //     ' - ' +
                                //     getMMMDDYYYY(tempDate.end) +
                                //     ', ' +
                                //     getValues(`${name}.frequency`) +
                                //     ' times';
                                temp =
                                    getUserCurrentFormat(tempDate.start)?.dateFormat +
                                    ' - ' +
                                    getUserCurrentFormat(tempDate.end)?.dateFormat +
                                    ', ' +
                                    getValues(`${name}.frequency`) +
                                    ' times';
                                setValue(`${name}.TimerFrom`, new Date(tempDate.start));
                                setValue(`${name}.TimerTo`, new Date(tempDate.end));
                            }
                            setValue(`${name}.recencyData`, temp);
                            const status = handleDate();
                            !status && handleClose();
                        }}
                        id="rs_TimerModal_Select"
                    >
                        Select
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default TimerModal;
