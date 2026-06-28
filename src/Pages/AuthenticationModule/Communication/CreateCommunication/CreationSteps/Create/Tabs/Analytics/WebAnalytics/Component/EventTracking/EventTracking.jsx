import { findDuplicates } from 'Utils/modules/dateTime';
import { selectIcon } from 'Utils/modules/display';
import { WEBSITE_REGEX } from 'Constants/GlobalConstant/Regex';
import { DUPLICATE_VALUE, ENTER_CONVERSION_URL, ENTER_VALID_CONVERSION_URL } from 'Constants/GlobalConstant/ValidationMessage';
import { event_tracking_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useState } from 'react';
import _map from 'lodash/map';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';

import usePermission from 'Hooks/usePersmission';
import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';

import { updateAnalytics } from 'Reducers/communication/createCommunication/Create/reducer';
import { useDispatch, useSelector } from 'react-redux';
var socket;
const EventTracking = ({ events, setEvents, handleSubmit, setAlert_flag }) => {
    const { control, getFieldState, formState, trigger } = useFormContext();
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const dispatch = useDispatch();
    // const { invalid, isDirty, isTouched } = getFieldState('conversionUrl', formState);
    // const isConversionUrlValid = !invalid && isDirty && isTouched;
    let isConversionUrlValid = false;
    const { analytics } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const [eventTrackingActions, setEventTrackingActions] = useState([]);
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'eventTracking',
    });
    const eventTrackingWatch = useWatch({
        control,
        name: 'eventTracking',
    });
    const addEventTracking = (index) => {
        if (index === 0) {
            const WebEventTrackcAnalyticsSettingsState = getFieldState(`eventTracking`);
            let validationState = eventTrackingWatch.findIndex((list) => {
                let values = Object.values(list);
                // console.log('values: ', WEBSITE_REGEX.test(list?.conversionUrl));
                // console.log('eventTrackingWatch[index].conversionUrl: ', eventTrackingWatch[index].conversionUrl);
                if (list.conversionUrl === '') {
                    return true;
                } else {
                    return false;
                }
                if (WEBSITE_REGEX.test(list?.conversionUrl)) {
                    return false;
                }
            });
            if (validationState === -1 && !WebEventTrackcAnalyticsSettingsState.invalid) {
                append({ conversionUrl: '', isDelete: false });
            } else {
                trigger(`eventTracking[${validationState}]`);
            }
        } else {
            let temp = eventTrackingWatch[index];
            temp.isDelete = true;

            setEventTrackingActions(temp.hasOwnProperty('lifeTimeCapUniqueId') && [...lifeTimeActions, temp]);

            remove(index);
        }
    };

    return (
        <Fragment>
            <div className="form-group">
                <Row>
                    <Col sm={4} className="text-right">
                        <label className="control-label-left">Conversion URL</label>
                    </Col>
                    {fields.map((field, index) => {
                        const goalType = eventTrackingWatch[index];

                        return (
                            <div key={index} className="col-sm-8">
                                <Col sm={10} className={`${index > 0 ? 'offset-4 mt41' : ''}`}>
                                    <RSInput
                                        control={control}
                                        name={`eventTracking[${index}].conversionUrl`}
                                        // name={`conversionUrl`}
                                        label={'Conversion URL'}
                                        required
                                        rules={{
                                            required: ENTER_CONVERSION_URL,
                                            pattern: {
                                                value: WEBSITE_REGEX,
                                                message: ENTER_VALID_CONVERSION_URL,
                                            },
                                            validate: () => {
                                                const [status, _] = findDuplicates(eventTrackingWatch, 'conversionUrl');
                                                return status ? DUPLICATE_VALUE : true;
                                            },
                                        }}
                                    />
                                </Col>
                                <Col sm={1} className={`fg-icons-wrapper pl0 ${index > 0 ? 'mt41' : ''}`}>
                                    <div className="fg-icons d-flex">
                                        {index == 0 && (
                                            <RSTooltip text={'Event tracking'}>
                                                <i
                                                    className={`${
                                                        event_tracking_medium
                                                    } icon-md color-primary-blue ${
                                                        WEBSITE_REGEX.test(eventTrackingWatch[0]?.conversionUrl)
                                                            ? ''
                                                            : 'click-off'
                                                    } ${eventTrackingWatch?.length > 1 ? 'click-off' : ''}`}
                                                    onClick={handleSubmit}
                                                />
                                            </RSTooltip>
                                        )}

                                        <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                            <i
                                                onClick={() => {
                                                    if (addAccess) addEventTracking(index);
                                                }}
                                                className={`${selectIcon(index)} icon-md cp ${
                                                    fields?.length > 4 && index == 0 ? 'click-off' : ''
                                                } ${!addAccess ? 'click-off' : ''}`}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                </Col>
                            </div>
                        );
                    })}
                </Row>
            </div>
            {!!events?.length && (
                <Row>
                    <Col md={{ offset: 4 }} className="bg-primary-grey">
                        <ul>
                            {_map(events, ({ eventname }) => (
                                <li>{eventname}</li>
                            ))}
                        </ul>
                        <span>
                            <i
                                id="rs_data_pencil_edit"
                                className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                onClick={(e) => {
                                    let payload = { field: 'webft', data: true };
                                    dispatch(updateAnalytics(payload, 'webft'));
                                }}
                            />
                        </span>
                    </Col>
                </Row>
            )}
            {/* Modals*/}
            {/* <EventTrackModal
                show={analytics?.webft}
                events={events}
                handleClose={() => {
                    let payload = { field: 'webft', data: false };
                    dispatch(updateAnalytics(payload, 'webft'));
                }}
                onSave={(events) => {
                    setEvents(events);

                    let payload = { field: 'webft', data: false };
                    dispatch(updateAnalytics(payload, 'webft'));
                }}
            /> */}
        </Fragment>
    );
};

export default EventTracking;
