import { AndoridShake } from 'Assets/Images';
import { FORM_INITIAL_STATE, INPUT_TYPE, TRACKING_TYPE, screenTrackingLengthOptions, screenTrackingMinutesOptions } from './constant';
import { ENTER_DESCRIPTION, ENTER_EVENT_NAME, SELECT_INPUT_TYPE, SELECT_TRACKING_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { DESCRIPTION, EVENT_NAME, INPUT_TYPE as INPUT_TYPE_PH, MIN_DURATION, MIN_LENGTH } from 'Constants/GlobalConstant/Placeholders';
import { alert_large, circle_minus_fill_medium, circle_pencil_medium, event_tracking_medium, goal_achieved_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import RSAlert from 'Components/RSAlert';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTimer from 'Components/RSTimer';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
// import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSTooltip from 'Components/RSTooltip';
import { useFormContext } from 'react-hook-form';
import { smartlinkEdit } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSSwitch from 'Components/FormFields/RSSwitch';
var socket;
const EventTrackModal = ({
    show,
    events: defaultEvents = [],
    handleClose = () => {},
    onSave = () => {},
    type = 'web',
}) => {
    const edit = useSelector((state) => smartlinkEdit(state));
    const { control, getValues, setValue, formState } = useFormContext();
    // const { control, reset, trigger, handleSubmit } = useForm(FORM_INITIAL_STATE);
    const [isSaved, setSaved] = useState(false);
    const [events, setEvents] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [eventsSocket, setEventsSocket] = useState({ authCode: '', showAuthCode: false });
    const [eventsSocketData, setEventsSocketData] = useState({
        currentActivity: '',
        currentImg: '',
        imageData: '',
        selectControls: [],
        clientData: '',
        controlsArray: '',
        selectElement: null,
        elementArray: [],
        screenTracking: {
            minDuration: '',
            screenTrackCond: 'And',
            minLength: '',
        },
        event: {
            eventname: '',
            trackingType: '',
            inputType: '',
            description: '',

            markAsGoal: false,
        },

        IsmarkAsGoal: false,
    });
    const [appData, setappData] = useState();
    const socketConnection = () => {
        var receiverInfo = {};
        receiverInfo.userName = 'Browser';
        var deviceOs = appData?.platform?.toLowerCase().includes('an') ? 'Android' : 'iPhone';
        var appId = '7def9b46-cb52-48c7-a858-5213b2cb5e72';
        var platform = appData?.platform; //'Android phone';

        receiverInfo.appId = String(deviceOs + platform + appId).replace(/ /g, ''); //"iOSiPhone7def9b46-cb52-48c7-a858-5213b2cb5e72";

        socket = window.io.connect('https://mobsoc.resu.io/', {
            reconnection: true,
        });

        var json = JSON.stringify(receiverInfo);
        socket.on('connect', () => {
            socket.emit('receiver-handshake-request', receiverInfo);
        });
        socket.on('receiver-handshake-response', (data) => {
            try {
                if (data) {
                    // console.log(data);
                    if (data == 'Another instance of browser is waiting to connect with the same App Id') {
                        // alert(data);
                        setShowAlert(true);
                        // socket.disconnect();
                        // socket = window.io.connect('https://mobsoc.resu.io/', {
                        //     reconnection: true,
                        // });
                    }
                } else {
                }
            } catch (error) {
            }
        });

        socket.on('message-from-client-image', (data) => {
            socket.off('show-auth-code');
            setEventsSocket({ authCode: '', showAuthCode: false });
            let obj = JSON.parse(data);
            // console.log('obj: message-from-client-image ', obj);

            setEventsSocketData((prev) => ({
                ...prev,
                currentActivity: obj.mainScreenName,
                currentImg: obj.imageData,
                imageData: obj,
            }));

            if (eventsSocketData.currentActivity !== obj.mainScreenName) {
                setEventsSocketData((prev) => ({
                    ...prev,
                    currentActivity: obj.mainScreenName,
                    currentImg: obj.imageData,
                    imageData: obj,
                }));
            }
        });
        socket.on('message-from-client-data', (data) => {
            socket.off('show-auth-code');
            let obj = JSON.parse(data);
            // console.log('obj: message-from-client-data ', obj);
            let controlArray = JSON.parse(obj.controls);

            let _temp = eventsSocketData?.selectControls.map((obj) => {
                controlArray.map((fobj) => {
                    if (obj.viewId === fobj.viewId) {
                        fobj.click = true;
                        fobj.select = obj?.select || false;
                    }
                });
            }); 


            if (events?.length === 0 && eventsSocketData.controlsArray?.length === 0) {
                controlArray.map((item) => {
                    let subView = [];
                    if (item.subviews?.length > 0 && JSON.parse(item.subviews)?.length > 0) {
                        subView = JSON.parse(item.subviews);
                    }
                    item.subviews = subView;
                });
                setEventsSocketData((prev) => ({ ...prev, clientData: obj, controlsArray: controlArray }));
            }
        });
        //iOS
        socket.on('client-auth-code', (data) => {
            let jData = JSON.parse(data);
            setEventsSocket({ authCode: jData?.oAuthCode, showAuthCode: true });

            var receiverInfo = new Object();
            receiverInfo.appId = String(deviceOs + platform + appId).replace(/ /g, ''); //"iOSiPhone7def9b46-cb52-48c7-a858-5213b2cb5e72";
            var json = JSON.stringify(receiverInfo);
            socket.emit('marketer-acceptance-message', json);

            setTimeout(() => {
                setEventsSocket({ authCode: '', showAuthCode: false });
            }, 120000);
        });
        socket.on('show-auth-code', (data) => {
            let jData = JSON.parse(data);

            setEventsSocket({ authCode: jData?.oAuthCode, showAuthCode: true });

            var receiverInfo = new Object();
            receiverInfo.appId = String(deviceOs + platform + appId).replace(/ /g, ''); //"iOSiPhone7def9b46-cb52-48c7-a858-5213b2cb5e72";
            var json = JSON.stringify(receiverInfo);
            socket.emit('marketer-acceptance-message', json);

            setTimeout(() => {
                setEventsSocket({ authCode: '', showAuthCode: false });
            }, 120000);
        });
        socket.on('message-client-disconnect', (data) => {
            setEventsSocket({ authCode: '', showAuthCode: false });
        });
        socket.on('disconnect', (data) => {
            socket.off('receiver-handshake-response');
            socket.off('client-information');
            socket.off('message-from-client-image');
            socket.off('message-from-client-data');
            socket.off('receiver-handshake-response');
            socket.off('show-auth-code');
        });
    };
    const createSingleMobileField = (item, index, ftime = false) => {
        // console.log('item: ', item);
        var top = item.top + item.translationY - item.scrollY;
        var left = item.left + item.translationX - item.scrollX;
        var divwidth = item.width;
        var divheight = item.height;
        var itemId = 'array' + item.id;
        if (document.getElementById(itemId) !== null) {
            var elem = document.getElementById(itemId);
            elem.setAttribute('data-viewId', item.viewId);
            elem.setAttribute('data-viewType', item.viewType);
        }
        return (
            <div
                className={`C ${item.isShow === true ? 'fieldTracking' : ''} ${item?.viewId} ${
                    item?.click === true ? 'fieldTrackingClick' : ''
                } ${item?.select === true ? 'fieldTrackingSelect' : ''}`}
                id={item.id}
                data={item}
                style={{ position: 'absolute', top: top, left: left, width: divwidth, height: divheight }}
                onClick={(e) => {
                    let temp = [...eventsSocketData.controlsArray];

                    let ele = e.target;
                    let se = null;
                    temp.map((newItem) => {
                        newItem.click = false;
                    });
                    // let index = temp.indexOf(item);
                    // temp[index].click = true
                    let fItem = temp.filter((obj) => String(obj.id) === ele.id);

                    if (fItem[0].isShow === false) {
                        return;
                    }

                    fItem[0].click = true;
                    se = fItem[0];
                    let _tempSelect = [...eventsSocketData.selectControls];
                    _tempSelect = _tempSelect.filter((obj) => obj.select === true);
                    _tempSelect.push(fItem[0]);
                    _tempSelect = _tempSelect.filter(
                        (value, index, self) =>
                            index === self.findIndex((t) => t.viewId === value.viewId && t.viewId === value.viewId),
                    );
                    setEventsSocketData((prev) => ({
                        ...prev,
                        selectControls: _tempSelect,
                        controlsArray: temp,
                        selectElement: se,

                        IsmarkAsGoal: events.map((a) => a.markAsGoal).includes(true),
                        event: {
                            eventname: '',
                            trackingType: se.viewType === 'Others' ? 'Click' : '',
                            inputType: se.viewType === 'Others' ? 'Yes / No' : '',
                            description: '',
                            markAsGoal: false,
                        },
                    }));
                }}
            >
                {item.isShow === false &&
                    item.subviews?.length > 0 &&
                    item?.subviews?.map((sitem) => {
                        // let s = remSpace(sitem).replace('[', '')
                        // s = s.replace(']', '')
                        let arr = eventsSocketData.controlsArray.filter(
                            (obj) => obj.id.toString() === sitem.toString(),
                        );
                        if (arr?.length > 0) {
                            return arr.map((aitem, aindex) => {
                                return createSingleMobileField(aitem, aindex, ftime);
                            });
                        } else {
                            return <div id={`array${sitem.toString()}`} viewId={sitem.toString()}></div>;
                        }
                    })}
            </div>
        );
    };
    const getDeviceType = (type) => {
        switch (type) {
            case 'Android phone':
                return (
                    <div className="andriod-wrapper">
                        <div class="andriod-mobile">
                            <div class="inner"></div>
                            <div class="overflow">
                                <div class="shadow"></div>
                            </div>
                            <div class="speaker"></div>
                            <div class="sensors"></div>
                            <div class="more-sensors"></div>
                            <div class="camera"></div>
                        </div>
                    </div>
                );
            case 'iPhone':
                return (
                    <div class="iphone-mobile">
                        <div class="top-bar"></div>
                        <div class="camera"></div>
                        <div class="sensor"></div>
                        <div class="speaker"></div>
                        <div class="screen"></div>
                        <div class="home"></div>
                        <div class="bottom-bar"></div>
                    </div>
                );
        }
    };
    useEffect(() => {
        reset({
            eventname: '',
            trackingType: eventsSocketData?.event?.trackingType,
            inputType: eventsSocketData?.event?.inputType,
            description: '',
            markAsGoal: false,
            screenTrackMinutes: eventsSocketData?.screenTracking?.minDuration,
            screenFilter: eventsSocketData?.screenTracking?.screenTrackCond,
            screenTrackLength: eventsSocketData?.screenTracking?.minLength,
        });
    }, [eventsSocketData?.selectControls]);
    useEffect(() => {
        if (show && defaultEvents?.length) {
            setEvents(defaultEvents);
        }
        if (show) {
            socketConnection();
        }
    }, [show]);
    useEffect(() => {
        let tempObject = edit?.smartLink1?.slice(1);
        // console.log('tempObject: ', tempObject);

        setappData({ AppName: tempObject[0]?.mobileApp?.appName, platform: tempObject[0]?.mobilePlatform });
        //  return socket.disconnect();
    }, []);

    // console.log('eventsSocketData: ', eventsSocketData);
    const handleModalClose = (e) => {
        if (!isSaved) {
            reset();
            setEvents([]);
        }
        socket.off('receiver-handshake-response');
        socket.off('client-information');
        socket.off('message-from-client-image');
        socket.off('message-from-client-data');
        socket.off('receiver-handshake-response');
        socket.off('show-auth-code');
        socket.disconnect();

        handleClose();
    };

    return (
        <RSModal
            show={show}
            handleClose={handleModalClose}
            header={'Event track'}
            size="xlg"
            body={
                <Fragment>
                    <Row className="mt-20">
                        <Col sm={7}>
                            {eventsSocketData?.controlsArray?.length > 0 ? (
                                <>
                                    <h2 className=" text-center">{appData?.platform} app event tracking setup</h2>
                                    <div
                                        className="device-screen m-auto"
                                        style={{ width: eventsSocketData?.imageData?.width || 380 }}
                                    >
                                        <div className={`${appData?.platform === 'iPhone' ? 'iphone-wrapper' : ''}`}>
                                            {getDeviceType(appData?.platform)}
                                            <div
                                                className="device-image-render"
                                                style={{
                                                    width: eventsSocketData?.imageData?.width || 380,
                                                }}
                                            >
                                                <div
                                                    className="device-image-inner css-scrollbar"
                                                    style={{
                                                        width: eventsSocketData?.imageData?.width || 380,
                                                    }}
                                                >
                                                    <div
                                                        className={`${
                                                            appData?.platform === 'iPhone' ? 'iphone-wrapper' : ''
                                                        }`}
                                                    >
                                                        <div
                                                            className="P mx-auto"
                                                            style={{
                                                                width: eventsSocketData?.imageData?.width || 0,
                                                                height: eventsSocketData?.imageData?.height || 0,
                                                                backgroundImage: `url(${eventsSocketData?.imageData?.imageData})`,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: eventsSocketData?.imageData?.width || 0,
                                                                    height: eventsSocketData?.imageData?.height || 0,
                                                                    position: 'relative',
                                                                }}
                                                            >
                                                                {eventsSocketData?.controlsArray?.length > 0 &&
                                                                    createSingleMobileField(
                                                                        eventsSocketData?.controlsArray[0],
                                                                        eventsSocketData?.controlsArray[0].id,
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center mt20">
                                    {!eventsSocket?.showAuthCode ? (
                                        <>
                                            <h2 className="color-secondary-blue mb20">
                                                Android app event tracking setup
                                            </h2>
                                            <img src={AndoridShake} alt={'Android shake'} />
                                            <h2 className="color-secondary-blue mt20 mb10">Establishing connection</h2>
                                            <p className="mb10">
                                                Open {appData?.AppName} and flip your mobile phone 6 times as shown
                                                above
                                            </p>
                                            <small>
                                                Note - The connection will not be established if the SDK is
                                                missing/broken in the mobile app
                                            </small>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="color-secondary-blue mb20">
                                                {appData?.platform} app event tracking setup
                                            </h2>
                                            <p>
                                                Socket connect successfully your auth code is {eventsSocket?.authCode}
                                            </p>
                                            <RSTimer isEventSetup={true} initialTime={120} />
                                        </>
                                    )}
                                </div>
                            )}
                        </Col>
                        <Col sm={5}>
                            <div className="grey-box height-100per">
                                <form
                                    onSubmit={handleSubmit((formState) => {
                                        // console.log('formState: ', formState);
                                        let temp = [...eventsSocketData?.controlsArray];
                                        let selectField = {};
                                        temp.map((item) => {
                                            if (item.viewId === eventsSocketData?.selectElement.viewId) {
                                                item.select = true;
                                                selectField = item;
                                            }
                                        });
                                        let stemp = [...eventsSocketData?.selectControls];
                                        stemp.map((item) => {
                                            if (item.viewId === eventsSocketData?.selectElement.viewId) {
                                                item.select = true;
                                                item.click = true;
                                                selectField = item;
                                            }
                                        });

                                        let eleArray = [...eventsSocketData?.elementArray];
                                        let obj = {
                                            field: selectField,
                                            screenTracking: {
                                                minDuration: formState?.screenTrackMinutes,
                                                screenTrackCond: formState?.screenFilter ? 'And' : 'Or',
                                                minLength: formState?.screenTrackLength,
                                            },
                                            //eventTracking: eventsSocketData?.event,
                                            eventTracking: { id: uuid(), ...formState },
                                            eventTrackingTemp: {
                                                id: uuid(),
                                                eventname: formState?.eventname,
                                                trackingType: formState?.trackingType,
                                                inputType: formState?.inputType,
                                                description: formState?.description,
                                                markAsGoal: formState?.markAsGoal,
                                                screenTracking: {
                                                    minDuration: formState?.screenTrackMinutes,
                                                    screenTrackCond: formState?.screenFilter ? 'And' : 'Or',
                                                    minLength: formState?.screenTrackLength,
                                                },
                                            },
                                        };
                                        eleArray.push(obj);
                                        // console.log('eleArray: ', eleArray);
                                        var markAsGoal = false;
                                        eleArray.map((item) => {
                                            if (item?.eventTracking.markAsGoal === true) {
                                                markAsGoal = true;
                                            }
                                        });
                                        setEventsSocketData((prev) => ({
                                            ...prev,
                                            IsmarkAsGoal: markAsGoal,
                                            selectControls: stemp,
                                            elementArray: eleArray,
                                            selectElement: [],
                                            event: {},
                                            markAsGoal: markAsGoal,
                                            screenTracking: {
                                                minDuration: formState?.screenTrackMinutes,
                                                screenTrackCond: formState?.screenFilter ? 'And' : 'Or',
                                                minLength: formState?.screenTrackLength,
                                            },
                                        }));
                                        setEvents((prev) => [...prev, { id: uuid(), ...formState }]);
                                        reset({
                                            eventname: '',
                                            trackingType: [],
                                            inputType: [],
                                            description: '',
                                            markAsGoal: false,
                                        });
                                    })}
                                >
                                    {/* {type === 'web' && ( */}
                                    <div>
                                        <h4 className="color-secondary-blue mb10">
                                            <i
                                                className={`${event_tracking_medium} icon-md color-primary-blue`}
                                            />{' '}
                                            Screen track
                                        </h4>
                                        <RSKendoDropDownList
                                            control={control}
                                            required
                                            name={'screenTrackMinutes'}
                                            data={screenTrackingMinutesOptions}
                                            label={MIN_DURATION}
                                            rules={{
                                                required: 'Select',
                                            }}
                                        />
                                        <div className="text-center my15">
                                            <RSSwitch control={control} name={'screenFilter'} />
                                        </div>
                                        <RSKendoDropDownList
                                            control={control}
                                            data={screenTrackingLengthOptions}
                                            name={'screenTrackLength'}
                                            required
                                            label={MIN_LENGTH}
                                            rules={{
                                                required: 'Select',
                                            }}
                                        />
                                    </div>
                                    {/* )} */}
                                    <h4 className="color-secondary-blue mb10 mt20">
                                        <i className={`${event_tracking_medium} icon-md color-primary-blue`} />{' '}
                                        Add Add Event
                                    </h4>
                                    <div
                                        className={`box-design no-box-shadow ${
                                            eventsSocketData?.selectControls?.length > 0 ? '' : 'click-off'
                                        }`}
                                    >
                                        <div className="form-group">
                                            <RSInput
                                                control={control}
                                                name={'eventname'}
                                                required
                                                placeholder={EVENT_NAME}
                                                rules={{
                                                    required: ENTER_EVENT_NAME,
                                                }}
                                            />
                                        </div>
                                        <div
                                            className={`${
                                                eventsSocketData?.selectElement?.viewType === 'Others'
                                                    ? 'click-off'
                                                    : ''
                                            } form-group`}
                                        >
                                            <RSKendoDropDownList
                                                control={control}
                                                name={'trackingType'}
                                                data={TRACKING_TYPE}
                                                label={'Tracking type'}
                                                required
                                                rules={{
                                                    required: SELECT_TRACKING_TYPE,
                                                }}
                                            />
                                        </div>
                                        <div
                                            className={`${
                                                eventsSocketData?.selectElement?.viewType === 'Others'
                                                    ? 'click-off'
                                                    : ''
                                            } form-group`}
                                        >
                                            <RSKendoDropDownList
                                                control={control}
                                                name={'inputType'}
                                                data={INPUT_TYPE}
                                                label={INPUT_TYPE_PH}
                                                required
                                                rules={{
                                                    required: SELECT_INPUT_TYPE,
                                                }}
                                            />
                                        </div>
                                        <div className="form-group mb0">
                                            <RSTextarea
                                                control={control}
                                                name={'description'}
                                                required
                                                placeholder={DESCRIPTION}
                                                maxLength="250"
                                                rules={{
                                                    required: ENTER_DESCRIPTION,
                                                }}
                                            />
                                        </div>
                                        <div className={`${eventsSocketData?.IsmarkAsGoal ? 'click-off' : ''}`}>
                                            <RSCheckbox
                                                control={control}
                                                name="markAsGoal"
                                                labelName={'Mark as goal'}
                                            />
                                        </div>
                                    </div>
                                    <div className="buttons-holder">
                                        <RSSecondaryButton
                                            onClick={() => {
                                                reset({
                                                    eventname: '',
                                                    trackingType: '',
                                                    inputType: '',
                                                    description: '',
                                                    markAsGoal: false,
                                                });
                                            }}
                                        >
                                            Cancel
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            type="submit"
                                            className={`${events?.length === 5 ? 'click-off' : ''}`}
                                        >
                                            Add
                                        </RSPrimaryButton>
                                    </div>
                                </form>
                                <div>
                                    <h4 className="color-secondary-blue mb10">
                                        <i className={`${event_tracking_medium} icon-md color-primary-blue`} />{' '}
                                        Events
                                    </h4>
                                    <div className="rs-events-tracking-list-box">
                                        <ol className="rs-cc-event-tracking-list">
                                            {events?.length ? (
                                                events.map((event, index) => (
                                                    <li key={event.id}>
                                                        <p>
                                                            Event name: <span>{event?.eventname}</span>
                                                        </p>
                                                        <p>
                                                            Tracking type: <span>{event?.trackingType}</span>
                                                        </p>
                                                        <p>
                                                            Input type: <span>{event?.inputType}</span>
                                                        </p>
                                                        <p>
                                                            Description: <span>{event?.description}</span>
                                                        </p>
                                                        <div className="rsccetl-icons">
                                                            <RSTooltip text="Remove event" position="top">
                                                                <i
                                                                    className={`${circle_minus_fill_medium} icon-md color-primary-red mr5`}
                                                                    onClick={() =>
                                                                        setEvents((prev) => {
                                                                            const temp = [...prev];
                                                                            temp.splice(index, 1);
                                                                            return temp;
                                                                        })
                                                                    }
                                                                />
                                                            </RSTooltip>
                                                            <RSTooltip text="Edit event" position="top">
                                                                <i
                                                                    id="rs_data_circle_pencil"
                                                                    className={`${circle_pencil_medium} icon-md color-primary-blue`}
                                                                    onClick={(e) => {
                                                                        reset(events[index]);
                                                                        setEvents((prev) => {
                                                                            const temp = [...prev];
                                                                            temp.splice(index, 1);
                                                                            return temp;
                                                                        });
                                                                    }}
                                                                />
                                                            </RSTooltip>
                                                            {event?.markAsGoal && (
                                                                <RSTooltip text="Goal" position="top">
                                                                    <i
                                                                        className={`${goal_achieved_medium} icon-md color-primary-green`}
                                                                    />
                                                                </RSTooltip>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <h4 className="mb0 flex flex-center pt30 pb20 color-primary-grey">
                                                    No events found.
                                                </h4>
                                            )}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <RSAlert
                        show={showAlert}
                        body={
                            <Fragment>
                                <i className={`${alert_large} icon-md color-white cursor-normal`} />
                                <span>Another instance of browser is waiting to connect with the same App Id</span>
                            </Fragment>
                        }
                        footer
                        handleConfirm={() => {
                            socket.off('receiver-handshake-response');
                            socket.off('client-information');
                            socket.off('message-from-client-image');
                            socket.off('message-from-client-data');
                            socket.off('receiver-handshake-response');
                            socket.off('show-auth-code');
                            setShowAlert(false);
                        }}
                        handleClose={() => {
                            socket.off('receiver-handshake-response');
                            socket.off('client-information');
                            socket.off('message-from-client-image');
                            socket.off('message-from-client-data');
                            socket.off('receiver-handshake-response');
                            socket.off('show-auth-code');
                            setShowAlert(false);
                        }}
                    />
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton onClick={handleModalClose}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton
                        // type="submit"
                        onClick={() => {
                            if (events?.length) {
                                onSave(events, eventsSocketData);
                                setSaved(true);
                            } else {
                                trigger();
                            }
                        }}
                    >
                        Save
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

EventTrackModal.propTypes = {
    show: PropTypes.bool.isRequired,
    events: PropTypes.array,
    onSave: PropTypes.func,
    handleClose: PropTypes.func,
};

export default memo(EventTrackModal);
