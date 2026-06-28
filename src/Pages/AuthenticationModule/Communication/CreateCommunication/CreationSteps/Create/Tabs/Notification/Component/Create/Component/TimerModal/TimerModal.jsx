import { DATE_TIME, SELECT_TIMER } from 'Constants/GlobalConstant/Placeholders';
import { colorpicker_bg_medium, colorpicker_text_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
import RSModal from 'Components/RSModal';
import useQueryParams from 'Hooks/useQueryParams';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import _get from 'lodash/get';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSColorPicker from 'Components/ColorPicker';
import RSTooltip from 'Components/RSTooltip';
const TimerModal = ({ show, handleClose, isSplit, fieldName }) => {
    const { control, watch, setValue } = useFormContext();
    const state = useQueryParams('/communication');
    const { startDate, endDate } = {
        startDate: _get(state, 'startDate', new Date()),
        endDate: _get(state, 'endDate', new Date()),
    };
    const defaultValues = new Date();

    const timerName = isSplit ? `${fieldName}.timer` : 'timer';
    const remainingTimeName = isSplit ? `${fieldName}.remainingTime` : 'remainingTime';
    const timerTextColorName = isSplit ? `${fieldName}.timerTextColor` : 'timerTextColor';
    const timerBgColorName = isSplit ? `${fieldName}.timerBgColor` : 'timerBgColor';

    const [timer, remainingTime, timerTextColor, timerBgColor] = watch([
        timerName,
        remainingTimeName,
        timerTextColorName,
        timerBgColorName,
    ]);

    const caluculateTimer = (data) => {
        let currentDate = new Date().getTime();
        let selectedDate = new Date(data).getTime();
        var differenceInHours = (selectedDate - currentDate) / (1000 * 60 * 60);
        var days = Math.floor(differenceInHours / 24);

        // Calculate remaining hours
        var remainingHours = differenceInHours % 24;

        // Calculate remaining minutes and seconds
        var totalMinutes = remainingHours * 60;
        var minutes = Math.floor(totalMinutes % 60);
        var seconds = Math.floor((totalMinutes * 60) % 60);

        var result = days + ':' + Math.floor(remainingHours) + ':' + minutes + ':' + seconds;
        setValue(remainingTimeName, result);
        return result;
    };

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={'Timer'}
            body={
                <div className="form-group mb0">
                    <div className="form-group">
                        <Row>
                            <Col sm={3}>
                                <label className="control-label-left">{SELECT_TIMER}</label>
                            </Col>
                            <Col sm={6}>
                                <RSDatetimePicker
                                    control={control}
                                    name={timerName}
                                    placeholder={DATE_TIME}
                                    min={new Date(startDate)}
                                    minTime={
                                        new Date(startDate).getDate() === new Date().getDate()
                                            ? defaultValues
                                            : new Date(startDate)
                                    }
                                    //if Time changes to 12 hrs format change HH to hh in the date format
                                    defaultValue={timer || ''}
                                    format={'dd MMM, yyyy HH:mm a'}
                                    steps={{
                                        minute: 5,
                                        second: 10,
                                    }}
                                    rules={{
                                        required: 'Select date/time',
                                    }}
                                    handleChange={(e) => {
                                        caluculateTimer(e.value);
                                    }}
                                />
                            </Col>
                            {!!timer && !!remainingTime && (
                                <Col sm={3} className="d-flex align-items-center">
                                    <span
                                        className="mr10"
                                        style={{ color: timerTextColor, backgroundColor: timerBgColor }}
                                    >
                                        {remainingTime}
                                    </span>
                                    <RSTooltip text={'Reset'} position="top" className="lh0">
                                        <i
                                            id="rs_data_refresh"
                                            className={`${restart_medium} icon-md color-primary-blue`}
                                            onClick={() => {
                                                setValue(timerName, '');
                                                setValue(remainingTimeName, '');
                                            }}
                                        />
                                    </RSTooltip>
                                </Col>
                            )}
                        </Row>
                    </div>
                    {/* {!!timer && ( */}
                    <div className="form-group mb0">
                        <Row>
                            <Col sm={3}>
                                <label className="control-label-left">Customize</label>
                            </Col>
                            <Col sm={9} className="d-flex">
                                <RSTooltip text={'Background color'} position="top" className="mr15">
                                    <RSColorPicker
                                        icon={colorpicker_bg_medium}
                                        onSelect={(color) => setValue(timerBgColorName, color)}
                                        initColor={timerBgColor}
                                    />
                                </RSTooltip>
                                <RSTooltip text={'Text color'} position="top">
                                    <RSColorPicker
                                        icon={colorpicker_text_medium}
                                        onSelect={(color) => setValue(timerTextColorName, color)}
                                        initColor={timerTextColor}
                                        defaultIconColor = {'#000000'}
                                    />
                                </RSTooltip>
                            </Col>
                        </Row>
                    </div>
                    {/* )} */}
                </div>
            }
            footer={
                <div className="buttons-holder">
                    <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton onClick={() => handleClose(true)}>Insert</RSPrimaryButton>
                </div>
            }
        />
    );
};

export default TimerModal;
