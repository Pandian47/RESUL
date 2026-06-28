import { AndoridShake } from 'Assets/Images';
import { truncateTitle } from 'Utils/modules/displayCore';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { FORM_INITIAL_STATE, INPUT_TYPE, TRACKING_TYPE, screenTrackingLengthOptions, screenTrackingMinutesOptions } from './constant';
import { DIGIPOP_ATTRIBUTE, ENTER_DESCRIPTION, ENTER_EVENT_NAME, SELECT_INPUT_TYPE, SELECT_TRACKING_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_EVENTS, ANOTHER_INSTANCE_OF_BROWSER, CANCEL, CLICK_EVENT_SHOULD_BE, DELETE, DESCRIPTION, EDIT_EVENT, ESTABLISHING_CONNECTION, EVENT_NAME, INPUT_TYPE as INPUT_TYPE_PH, MARK_AS_GOAL, MIN_DURATION_TEXT, MIN_LENGTH_TEXT, NOTE_THE_CONNECTION_WILL_NOT_BE, SAVE, SCREEN_TRACK, SOCKET_CONNECT_SUCCESSFULY, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { alert_large, delete_medium, goal_achieved_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import RSAlert from 'Components/RSAlert';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTimer from 'Components/RSTimer';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
// import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSTooltip from 'Components/RSTooltip';
import { smartlinkEdit } from 'Reducers/communication/createCommunication/smartlink/selectors';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { getAppAnalytics } from 'Reducers/communication/createCommunication/Create/selectors';
import { updateEventTrack } from 'Reducers/communication/createCommunication/smartlink/reducer';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import NewAttributeFormBtn from 'Pages/AuthenticationModule/Preferences/Pages/FormGenerator/Components/NewAttributeFormBtn/NewAttributeFormBtn';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import RSKendoGrid from 'Components/RSKendoGrid';

import { getSessionId } from 'Reducers/globalState/selector';
import { getAttribute } from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/constant';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { mapToItemRender } from 'Pages/AuthenticationModule/Components/NewAttributeModal/constant';
import { saveMobileAppAnalyticsCaptureFields } from 'Reducers/communication/createCommunication/Create/request';
import useQueryParams from 'Hooks/useQueryParams';
var socket;

// Duplicate event name validation
const EventNameDuplicateValidate = (value, events, currentFormState, isEditMode) => {
    if (!value) return true;
    
    const trimmedValue = value.trim().toLowerCase();
    const isDuplicate = events.some((event) => {
        if (isEditMode && event.id === currentFormState?.id) {
            return false;
        }
        return event.eventname?.trim().toLowerCase() === trimmedValue;
    });
    
    return !isDuplicate || 'Event name already exists';
};

// Calculate character limit
const calculateCharLimit = (columnWidth) => {
    return Math.floor(columnWidth / 8);
};
const EventTrackModal = ({
    show,
    events: defaultEvents = [],
    handleClose = () => {},
    onSave = () => {},
    type = 'web',
    mobileAppDetail = {},
    fieldName,
    editData = null,
}) => {
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const edit = useSelector((state) => smartlinkEdit(state));
    // console.log('eventTrackData: ', eventTrackData);
    const { MobileAnalytics } = useSelector((state) => getAppAnalytics(state));
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);
    
    const { control, reset, trigger, handleSubmit, watch } = useForm(FORM_INITIAL_STATE);
    const [isClickAlert, setClickAlert] = useState(false);
    const [isEdit, setIsEdit] = useState(MobileAnalytics?.appConvTrackId > 0 ? true : false);
    const [isEditMode, setEditMode] = useState(false);
    const [isSaved, setSaved] = useState(false);
    const [events, setEvents] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [eventsSocket, setEventsSocket] = useState({ authCode: '', showAuthCode: false });
    const [attributeList, setAttributeList] = useState([]);
    const [currentAttrList, setCurrentAttrList] = useState([]);
    const [isShowNewAttrModal, setShowNewAttrModal] = useState(false);
    const [showMarkAsGoalAlert, setShowMarkAsGoalAlert] = useState(false);
    const [showMaxEventsAlert, setShowMaxEventsAlert] = useState(false);
    const currentFormState = watch();
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

    // Load and manage data catalogue attributes
    useEffect(() => {
        if (dataCatalogueAttrs?.length) {
            let orderDataAttribute = dataCatalogueAttrs
                .map((attribute) => getAttribute(attribute))
                .sort((a, b) => (a.attributeName.toLowerCase() > b.attributeName.toLowerCase() ? 1 : -1));

            setAttributeList(orderDataAttribute);
            setCurrentAttrList(orderDataAttribute);
        }
    }, [dataCatalogueAttrs]);

    useEffect(() => {
        if (events?.length) {
            let eventNameList = events.map((item) => item.attribute?.dataAttributeId);
            let attrList = attributeList.filter((item) => !eventNameList.includes(item?.dataAttributeId));
            setCurrentAttrList(attrList);
        } else {
            setCurrentAttrList(attributeList);
        }
    }, [events?.length, attributeList]);
    
    useEffect(() => {
        if (events?.length && attributeList?.length) {
            const updatedEvents = events.map(event => {
                if (!event.attribute && event.dataAttributeId) {
                    const foundAttribute = attributeList.find(attr => attr.dataAttributeId === event.dataAttributeId);
                    if (foundAttribute) {
                        return { ...event, attribute: foundAttribute };
                    }
                }
                return event;
            });
            
            const hasChanges = updatedEvents.some((updated, index) => {
                const original = events[index];
                return (updated.attribute?.dataAttributeId || null) !== (original.attribute?.dataAttributeId || null);
            });
            
            if (hasChanges) {
                setEvents(updatedEvents);
            }
        }
    }, [attributeList?.length]);

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        dispatch(getDataAttributes(payload, true, false, 'BrandForm'));
    }, [departmentId, clientId, userId]);

    const socketConnection = () => {
        var receiverInfo = {};
        receiverInfo.userName = 'Browser';
        var deviceOs = appData?.platform?.toLowerCase().includes('an') ? 'Android' : 'iOS';
        var appId = appData?.appGuid;
        //'7def9b46-cb52-48c7-a858-5213b2cb5e72';
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
            let controlArray = safeParseJSON(obj?.controls, []);
            if (!Array.isArray(controlArray)) controlArray = [];

            if (eventsSocketData.currentActivity !== obj.mainScreenName) {
                if (events?.length === 0 && eventsSocketData?.controlsArray?.length === 0) {
                    controlArray.map((item) => {
                        let subView = [];
                        const parsedSubviews = safeParseJSON(item?.subviews, []);
                        if (Array.isArray(parsedSubviews) && parsedSubviews.length > 0) {
                            subView = parsedSubviews;
                        }
                        item.subviews = subView;
                    });
                    setEventsSocketData((prev) => {
                        let _temp = prev?.selectControls.map((obj) => {
                            controlArray.map((fobj) => {
                                if (obj.viewId === fobj.viewId) {
                                    fobj.click = true;
                                    fobj.select = obj?.select || false;
                                }
                            });
                        });
                        return {
                            ...prev,
                            clientData: obj,
                            controlsArray: controlArray,
                            currentActivity: obj.mainScreenName,
                        };
                    });
                }
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
                        return (newItem.click = false);
                    });
                    // let index = temp.indexOf(item);
                    // temp[index].click = true
                    let fItem = temp.filter((obj) => String(obj.id) === ele.id);

                    if (fItem[0].isShow === false) {
                        return;
                    }

                    // if (
                    //     fItem[0].viewType === 'Others' &&
                    //     events.filter((obj) => obj.trackingType === 'Click')?.length > 1
                    // ) {
                    //     // setClickAlert(true);
                    //     return;
                    // } else if (
                    //     fItem[0].viewType !== 'Others' &&
                    //     events.filter((obj) => obj.trackingType !== 'Click')?.length > 4
                    // ) {
                    //     // setClickAlert(true);
                    //     return;
                    // } else 
                    {
                        // setClickAlert(false);

                        fItem[0].click = true;
                        se = fItem[0];
                        let _tempSelect = [...eventsSocketData.selectControls];
                        _tempSelect = _tempSelect.filter((obj) => obj.select === true);
                        _tempSelect.push(fItem[0]);
                        _tempSelect = _tempSelect.filter(
                            (value, index, self) =>
                                index === self.findIndex((t) => t.viewId === value.viewId),
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
                    }
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
        if (defaultEvents[0]?.screenTrackLength || defaultEvents[0]?.screenTrackMinutes) {
            reset((formstate) => ({
                ...formstate,
                screenTrackMinutes: defaultEvents[0]?.screenTrackMinutes,
                screenTrackLength: defaultEvents[0]?.screenTrackLength,
            }));
        }
    }, [defaultEvents]);

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
        if (show) {
            if (editData?.jsondata) {
                const apiData = editData.jsondata;
                let transformedEvents = [];
                if (apiData?.fieldsInfo?.fieldCaptureList?.length) {
                    transformedEvents = apiData.fieldsInfo.fieldCaptureList.map((item) => {
                        let attribute = null;
                        let dataAttributeId = null;
                        if (item.attribute) {
                            attribute = item.attribute;
                            dataAttributeId = item.attribute?.dataAttributeId || item.dataAttributeId || null;
                        } 
                        else if (item.dataAttributeId) {
                            dataAttributeId = item.dataAttributeId;
                            if (attributeList?.length) {
                                attribute = attributeList.find(attr => attr.dataAttributeId === item.dataAttributeId) || null;
                            }
                        }
                        return {
                            id: item.id || uuid(),
                            eventname: item.eventName || item.eventname || '',
                            trackingType: item.viewType || item.trackingType || item.captureType || '',
                            inputType: item.inputType || item.elementaction || '',
                            description: item.description || '',
                            markAsGoal: item.markAsGoal || false,
                            identifier: item.viewId || item.screenName || '',
                            screenTrackMinutes: item.minDuration || apiData.fieldsInfo.minDuration || '',
                            screenTrackLength: item.minLength || apiData.fieldsInfo.minLength || '',
                            screenFilter: item.screenfilter || apiData.fieldsInfo.screenfilter || 'And',
                            attribute: attribute,
                            dataAttributeId: dataAttributeId,
                            mobileAppDetail: mobileAppDetail,
                        };
                    });
                    setEvents(transformedEvents);
                }
                const controlsArray = Array.isArray(apiData?.fieldsInfo?.pageContent?.controls) 
                    ? apiData.fieldsInfo.pageContent.controls 
                    : [];
                const screenTrackingData = {
                    minDuration: apiData?.fieldsInfo?.minDuration || '',
                    screenTrackCond: apiData?.fieldsInfo?.screenfilter || 'And',
                    minLength: apiData?.fieldsInfo?.minLength || '',
                };
                const elementArrayData = transformedEvents.map((event) => {
                    const field = controlsArray.find(control => control.viewId === event.identifier) || {};
                    
                    return {
                        field: field,
                        eventTracking: {
                            id: event.id,
                            eventname: event.eventname,
                            trackingType: event.trackingType,
                            inputType: event.inputType,
                            description: event.description,
                            markAsGoal: event.markAsGoal,
                            identifier: event.identifier,
                            attribute: event.attribute,
                        },
                        eventTrackingTemp: {
                            id: event.id,
                            eventname: event.eventname,
                            trackingType: event.trackingType,
                            inputType: event.inputType,
                            description: event.description,
                            markAsGoal: event.markAsGoal,
                        },
                        screenTracking: screenTrackingData,
                    };
                });
                setEventsSocketData({
                    currentActivity: apiData?.imageData?.mainScreenName || '',
                    currentImg: apiData?.imageData?.imageData || '',
                    imageData: apiData?.imageData || {},
                    controlsArray: controlsArray,
                    selectControls: [],
                    clientData: '',
                    selectElement: null,
                    elementArray: elementArrayData,
                    screenTracking: screenTrackingData,
                    event: {},
                    IsmarkAsGoal: transformedEvents.some(e => e.markAsGoal === true),
                });
                if (apiData?.fieldsInfo?.minDuration || apiData?.fieldsInfo?.minLength) {
                    reset((formstate) => ({
                        ...formstate,
                        screenTrackMinutes: apiData.fieldsInfo.minDuration,
                        screenTrackLength: apiData.fieldsInfo.minLength,
                        screenFilter: apiData.fieldsInfo.screenfilter === 'And',
                    }));
                }
            }
            else if (defaultEvents?.length) {
            setEvents(defaultEvents);
        }
            if (show && !isEdit) {
            socketConnection();
            } else if (isEdit && !editData?.jsondata) {
            setEventsSocketData((prev) => ({
                ...prev,
                imageData: MobileAnalytics?.eventGoalData?.imageData,
                controlsArray: MobileAnalytics?.eventGoalData?.fieldsInfo?.pageContent?.controls,
            }));
        }
        }
    }, [show]);
    useEffect(() => {
        let tempObject = edit?.smartLink1?.slice(1);

        setappData({
            AppName: tempObject[0]?.mobileApp?.appName,
            platform: tempObject[0]?.mobilePlatform,
            appGuid: tempObject[0]?.mobileApp?.appGuid,
        });
        return () => {
            socket?.disconnect();
        };
    }, []);

    const handleModalClose = (e) => {
        if (!isSaved && !isEdit) {
            reset();
            setEvents([]);
        }
        if (!isEdit) {
            socket.off('receiver-handshake-response');
            socket.off('client-information');
            socket.off('message-from-client-image');
            socket.off('message-from-client-data');
            socket.off('receiver-handshake-response');
            socket.off('show-auth-code');
            socket.disconnect();
        }
        handleClose();
    };
    
    const handleNewAttributeSave = async (data) => {
        try {
            let attr = await dispatch(saveDataAttribute(data));
            if (attr.status) {
                setShowNewAttrModal(false);
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                };
                await dispatch(getDataAttributes(payload, true, false, 'BrandForm'));
            }
        } catch (error) {
        }
    };

    return (
        <RSModal
            show={show}
            handleClose={handleModalClose}
            header={'Event track'}
            size="fullscreen"
            closeTooltipPosition
            className="px0 fullscreen_popup border-0"
            headerClassName='pt8 pb0'
            isCloseButton={false}
            bodyClassName={'heightFix'}
            noBottomBorder
            customContentClassName='bg-body-bg-color'
            body={
                <Fragment>
                    <Row className="mr0">
                        <Col sm={8}>
                            <div className="brandform-leftview mobile-field-track-modal-leftview">
                            {/* {!isEdit ? ( */}
                            <>
                                {eventsSocketData?.controlsArray?.length > 0 ? (
                                    <>
                                        <div className="leftside-wrapper brandform-leftview mobile bg-white">
                                        <div
                                            className="device-screen m-auto css-scrollbar pr0 w-100 body-image"
                                            style={{ width: eventsSocketData?.imageData?.width || 380 }}
                                        >
                                            <div
                                                className={`${appData?.platform === 'iPhone' ? 'iphone-wrapper' : ''}`}
                                            >
                                                {getDeviceType(appData?.platform)}
                                                <div
                                                    className="device-image-render mx-auto"
                                                    style={{
                                                        width: eventsSocketData?.imageData?.width || 380,
                                                    }}
                                                >
                                                    <div
                                                        className="mobile-device-image-inner overflow-x-hidden overflow-y-hidden"
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
                                                                        height:
                                                                            eventsSocketData?.imageData?.height || 0,
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
                                        </div>
                                    </>
                                ) : (
                                    <>
                                    <div className={`leftside-wrapper brandform-leftview mobile bg-white ${!eventsSocket?.showAuthCode ? '' : 'd-flex align-items-center justify-content-center'}`} style={!eventsSocket?.showAuthCode ? {} : { minHeight: '100%' }}>
                                    <div className="text-center">
                                        {!eventsSocket?.showAuthCode ? (
                                            <>
                                                <img
                                                    src={AndoridShake}
                                                    alt={'Android shake'}
                                                    className="brandform-mobile-img mt30"
                                                />
                                                <h2 className="color-secondary-blue mt20 mb10">
                                                    {ESTABLISHING_CONNECTION}
                                                </h2>
                                                <p className="mb10">
                                                    Open {appData?.AppName} and flip your mobile phone 6 times as shown above
                                                </p>
                                                <small>{NOTE_THE_CONNECTION_WILL_NOT_BE}</small>
                                            </>
                                        ) : (
                                            <>
                                                <h2 className={`color-secondary-blue ${appData?.appName?.length ? 'mb20': ''}`}>
                                                            {appData?.appName}
                                                </h2>
                                                <p>
                                                            {SOCKET_CONNECT_SUCCESSFULY} {eventsSocket?.authCode}
                                                </p>
                                                <RSTimer isEventSetup={true} initialTime={120} />
                                            </>
                                        )}
                                    </div>
                                    </div>
                                    </>
                                )}{' '}
                            </>
                            {/* ) : (
                                'asd'
                            )} */}
                            </div>
                        </Col>
                        <Col sm={4} className='d-flex flex-column pr0 position-relative css-scrollbar'>
                            {/* {isClickAlert && (
                                <h4 className="color-primary-red text-center">{CLICK_EVENT_SHOULD_BE}</h4>
                            )} */}
                            <span className='web-field-track-form-view css-scrollbar'>

                                <div className="align-items-center border-blr0 border-bottom-0 border-brr0 box-design d-flex justify-content-between py5">
                                    <h4 className="m0 lh0">
                                        {ADD_EVENTS}
                                    </h4>
                                    <div className="d-flex align-items-center">
                                        <RSSecondaryButton
                                            className={`mr10 ${!(eventsSocketData?.selectControls?.length > 0 || isEditMode) ? 'click-off' : ''}`}
                                            onClick={() => {
                                                if (eventsSocketData?.selectControls?.length > 0 || isEditMode) {
                                                reset({
                                                    eventname: '',
                                                    trackingType: '',
                                                    inputType: '',
                                                    description: '',
                                                    markAsGoal: false,
                                                    screenTrackMinutes: screenTrackingMinutesOptions[0],
                                                    screenFilter: false,
                                                    screenTrackLength: screenTrackingLengthOptions[0],
                                                });
                                                    setEditMode(false);
                                                }
                                            }}
                                        >
                                            Cancel
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            className={`${!(eventsSocketData?.selectControls?.length > 0 || isEditMode) || (events?.length === 25 && !isEditMode) ? 'click-off' : ''} fs6 px15 py2`}
                                            onClick={
                                                handleSubmit((formState) => {
                                                if ((eventsSocketData?.selectControls?.length > 0 || isEditMode) && !(events?.length === 25 && !isEditMode)) {
                                                    if (!isEditMode) {
                                                        const eventId = uuid();
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
                                                        
                                                        if (formState?.markAsGoal === true) {
                                                            eleArray = eleArray.map((item) => ({
                                                                ...item,
                                                                eventTracking: {
                                                                    ...item.eventTracking,
                                                                    markAsGoal: false,
                                                                },
                                                                eventTrackingTemp: {
                                                                    ...item.eventTrackingTemp,
                                                                    markAsGoal: false,
                                                                },
                                                            }));
                                                        }
                                                        
                                            let obj = {
                                                field: selectField,
                                                screenTracking: {
                                                    minDuration: formState?.screenTrackMinutes,
                                                    screenTrackCond: formState?.screenFilter ? 'And' : 'Or',
                                                    minLength: formState?.screenTrackLength,
                                                },
                                                            eventTracking: { 
                                                                id: eventId, 
                                                                ...formState, 
                                                                viewId: selectField?.viewId 
                                                            },
                                                eventTrackingTemp: {
                                                                id: eventId,
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
                                                        
                                                        setEvents((prev) => {
                                                            let updatedPrev = prev;
                                                            if (formState?.markAsGoal === true) {
                                                                updatedPrev = prev.map((item) => ({
                                                                    ...item,
                                                                    markAsGoal: false,
                                                                }));
                                                            }
                                                            
                                                            return [
                                                                ...updatedPrev,
                                                                { 
                                                                    id: eventId, 
                                                                    ...formState, 
                                                                    mobileAppDetail, 
                                                                    identifier: selectField?.viewId 
                                                                },
                                                            ];
                                                        });
                                                    } else if (isEditMode) {
                                                        setEvents((prev) => {
                                                            let update = prev.map((item) =>
                                                                item.id === formState?.id
                                                                    ? {
                                                                    ...item,
                                                                          eventname: formState?.eventname,
                                                                          trackingType: formState?.trackingType,
                                                                          inputType: formState?.inputType,
                                                                          description: formState?.description,
                                                                          markAsGoal: formState?.markAsGoal,
                                                                          attribute: formState?.attribute,
                                                                      }
                                                                    : { ...item },
                                                            );
                                                            return update;
                                                        });
                                                        
                                                        setEventsSocketData((prev) => {
                                                            let updatedElementArray = prev?.elementArray?.map((item) =>
                                                                item?.eventTracking?.id === formState?.id
                                                                    ? {
                                                                    ...item,
                                                                    eventTracking: {
                                                                        ...item.eventTracking,
                                                                              eventname: formState?.eventname,
                                                                              trackingType: formState?.trackingType,
                                                                              inputType: formState?.inputType,
                                                                              description: formState?.description,
                                                                              markAsGoal: formState?.markAsGoal,
                                                                              attribute: formState?.attribute,
                                                                    },
                                                                    eventTrackingTemp: {
                                                                        ...item.eventTrackingTemp,
                                                                              eventname: formState?.eventname,
                                                                              trackingType: formState?.trackingType,
                                                                              inputType: formState?.inputType,
                                                                              description: formState?.description,
                                                                              markAsGoal: formState?.markAsGoal,
                                                                    },
                                                                      }
                                                                    : item,
                                                            );
                                                            
                                                            var markAsGoal = false;
                                                            updatedElementArray.forEach((item) => {
                                                                if (item?.eventTracking?.markAsGoal === true) {
                                                                    markAsGoal = true;
                                                                }
                                                            });
                                                            
                                                            return {
                                                ...prev,
                                                                elementArray: updatedElementArray,
                                                                IsmarkAsGoal: markAsGoal,
                                                            };
                                                        });
                                                        
                                                        setEditMode(false);
                                                    }
                                            reset({
                                                eventname: '',
                                                trackingType: [],
                                                inputType: [],
                                                description: '',
                                                markAsGoal: false,
                                                screenTrackMinutes: screenTrackingMinutesOptions[0],
                                                screenFilter: false,
                                                screenTrackLength: screenTrackingLengthOptions[0],
                                            });
                                                }
                                        })}
                                    >
                                            {isEditMode ? 'Update' : 'Add'}
                                    </RSPrimaryButton>
                                </div>
                                </div>
                                <div className={`box-design no-box-shadow overflow-x-visible border-tlr0 border-trr0`}>
                                    <div className={`${!(eventsSocketData?.selectControls?.length > 0 || isEditMode) ? 'pe-none click-off' : ''}`}>
                                <div>
                                            <h4 className="mb15">
                                                {SCREEN_TRACK}
                                    </h4>
                                            <Row>
                                                <Col sm={5}>
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        required
                                                        name={'screenTrackMinutes'}
                                                        data={screenTrackingMinutesOptions}
                                                        label={MIN_DURATION_TEXT}
                                                        rules={{
                                                            required: 'Select',
                                                        }}
                                                    />
                                                </Col>
                                                <Col sm={2} className="d-flex align-items-end justify-content-center pb10">
                                                    <RSSwitch control={control} name={'screenFilter'} />
                                                </Col>
                                                <Col sm={5}>
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        data={screenTrackingLengthOptions}
                                                        name={'screenTrackLength'}
                                                        required
                                                        label={MIN_LENGTH_TEXT}
                                                        rules={{
                                                            required: 'Select',
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <h4 className="mt15 mb0">
                                            Event
                                        </h4>
                                        <div
                                            className={`${
                                                (eventsSocketData?.selectControls?.length > 0 || isEditMode) ? '' : 'pe-none click-off'
                                            }`}
                                        >
                                            <div className="form-group mt15 mb30">
                                            <RSInput
                                                control={control}
                                                name={'eventname'}
                                                required
                                            placeholder={EVENT_NAME}
                                                rules={{
                                                required: ENTER_EVENT_NAME,
                                                    validate: (value) => {
                                                    return EventNameDuplicateValidate(
                                                            value,
                                                            events,
                                                            currentFormState,
                                                        isEditMode,
                                                        );
                                                    },
                                                }}
                                            />
                                        </div>
                                    <div className="form-group mb30">
                                                    <RSKendoDropDown
                                                        name={`attribute`}
                                                        data={currentAttrList}
                                                        isCustomRender
                                                        itemRender={(ele, props) => mapToItemRender(ele, props, [])}
                                                        control={control}
                                                        required
                                                        textField={'attributeName'}
                                                        dataItemKey={'dataAttributeId'}
                                                        label={'Attribute'}
                                                        rules={{
                                                            required: DIGIPOP_ATTRIBUTE,
                                                        }}
                                                        footer={
                                                            <NewAttributeFormBtn
                                                                title="New attribute"
                                                                handleModalAttribute={() => setShowNewAttrModal(true)}
                                                            />
                                                        }
                                                    />
                                                </div>
                                            <Row
                                                className={`${
                                                    eventsSocketData?.selectElement?.viewType === 'Others'
                                                        ? 'click-off'
                                                        : ''
                                                }`}
                                            >
                                                <Col sm={6}>
                                                    <div className="form-group mb30">
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
                                                </Col>
                                                <Col sm={6}>
                                                    <div className="form-group mb30">
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
                                                </Col>
                                            </Row>
                                            <div className="form-group mb0">
                                        <RSTextarea
                                            control={control}
                                            name={'description'}
                                            // required
                                            placeholder={DESCRIPTION}
                                            className='addEventTextarea'
                                            maxLength="250"
                                            // rules={{
                                            //     required: ENTER_DESCRIPTION,
                                            // }}
                                        />
                                    </div>
                                                <div className={`${
                                                    (() => {
                                                        const hasOtherMarkAsGoal = events?.some(
                                                            (event) => 
                                                                event.markAsGoal === true && 
                                                                event.id !== currentFormState?.id
                                                        );
                                                        return hasOtherMarkAsGoal ? 'click-off pe-none' : '';
                                                    })()
                                                }`}>
                                                    <RSCheckbox
                                                        control={control}
                                                        name="markAsGoal"
                                            labelName={MARK_AS_GOAL}
                                                    />
                                                </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {events.length > 0 && (
                                        <RSKendoGrid
                                            data={events}
                                            isCustomClass='mt20 webfieldtrack-grid-table css-scrollbar'
                                            noBoxShadow
                                            hidePaginationInfo={true}
                                            hideFirstLastNav={true}
                                            settings={{
                                                total: events.length,
                                            }}
                                            column={[
                                                                    {
                                                                        field: 'eventname',
                                                                        title: 'Friendly name',
                                                                        width: '100px',
                                                                        cell: ({ dataItem }) => {
                                                            const charLimit = calculateCharLimit(100);
                                                            
                                                            return (
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        {dataItem?.eventname?.length > charLimit ? (
                                                                            <RSTooltip text={dataItem?.eventname} position="top">
                                                                                <span>{truncateTitle(dataItem?.eventname, charLimit)}</span>
                                                            </RSTooltip>
                                                                        ) : (
                                                                            <span>{dataItem?.eventname}</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        },
                                                    },
                                                    {
                                                        field: 'attribute.attributeName',
                                                        title: 'Attribute',
                                                        width: '100px',
                                                        cell: ({ dataItem }) => {
                                                            const charLimit = calculateCharLimit(100);
                                                            
                                                            return (
                                                                <td>
                                                                    {dataItem?.attribute?.attributeName?.length > charLimit ? (
                                                                        <RSTooltip text={dataItem?.attribute?.attributeName} position="top">
                                                                            <span>{truncateTitle(dataItem?.attribute?.attributeName, charLimit)}</span>
                                                                        </RSTooltip>
                                                                    ) : (
                                                                        <span>{dataItem?.attribute?.attributeName || '-'}</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        },
                                                    },
                                                    {
                                                        title: 'Actions',
                                                        width: '80px',
                                                        cell: ({ dataItem, dataIndex }) => (
                                                            <td>
                                                                <div className="d-flex">
                                                                    <RSTooltip
                                                                        text={EDIT_EVENT}
                                                                        position="top"
                                                                        className="lh0 mr10"
                                                                    >
                                                                <i
                                                                    id="rs_data_circle_pencil"
                                                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                                    onClick={(e) => {
                                                                                const eventData = events[dataIndex];
                                                                                let attribute = eventData?.attribute;
                                                                                if (!attribute) {
                                                                                    const elementItem = eventsSocketData?.elementArray?.find(
                                                                                        item => item?.eventTracking?.id === eventData?.id
                                                                                    );
                                                                                    attribute = elementItem?.eventTracking?.attribute || null;
                                                                                }
                                                                                reset({
                                                                                    ...eventData,
                                                                                    trackingType: eventData?.trackingType,
                                                                                    inputType: eventData?.inputType,
                                                                                    attribute: attribute,
                                                                                });
                                                                                setEditMode(true);
                                                                                setShowMaxEventsAlert(false);
                                                                    }}
                                                                />
                                                            </RSTooltip>
                                                                  
                                                                    {dataItem?.markAsGoal && (
                                                                        <RSTooltip
                                                                            text={MARK_AS_GOAL}
                                                                            position="top"
                                                                            className="lh0 mr10"
                                                                        >
                                                                    <i
                                                                                className={`${goal_achieved_medium} icon-md color-primary-green cursor-default`}
                                                                    />
                                                                </RSTooltip>
                                                            )}
                                                                    <RSTooltip
                                                                        text={DELETE}
                                                                        position="top"
                                                                        className="lh0"
                                                                    >
                                                                        <i
                                                                            className={`${delete_medium} icon-md color-primary-blue`}
                                                                            onClick={() => {
                                                                                setEvents((prev) => {
                                                                                    const temp = [...prev];
                                                                                    temp.splice(dataIndex, 1);
                                                                                    return temp;
                                                                                });
                                                                                
                                                                                setEventsSocketData((prev) => {
                                                                                    const fieldIdentifier = dataItem?.identifier || dataItem?.viewId;
                                                                                    const filterElementAry = prev?.elementArray?.filter(
                                                                                        (item) => item?.eventTracking?.id !== dataItem?.id
                                                                                    );
                                                                                    const filterSelectControls = prev?.selectControls?.filter(
                                                                                        (item) => item?.viewId !== fieldIdentifier
                                                                                    );
                                                                                    const filterControlsArry = prev?.controlsArray?.map((item) => {
                                                                                        return item?.viewId === fieldIdentifier
                                                                                            ? {
                                                                                                  ...item,
                                                                                                  select: false,
                                                                                                  click: false,
                                                                                              }
                                                                                            : { ...item };
                                                                                    });
                                                                                    const hasMarkAsGoal = filterElementAry?.some(
                                                                                        (item) => item?.eventTracking?.markAsGoal === true
                                                                                    );
                                                                                    
                                                                                    return {
                                                                                        ...prev,
                                                                                        controlsArray: filterControlsArry,
                                                                                        elementArray: filterElementAry,
                                                                                        selectControls: filterSelectControls,
                                                                                        IsmarkAsGoal: hasMarkAsGoal,
                                                                                    };
                                                                                });
                                                                            }}
                                                                        />
                                                                    </RSTooltip>
                                                        </div>
                                                            </td>
                                                        ),
                                                    },
                                            ]}
                                        />
                                            )}
                                    </div>
                            </span>

                             
                        </Col>
                        <div className='bottom17 modal-footer mr-10 pb0 position-absolute pr0 right25'>
                        <RSSecondaryButton onClick={handleModalClose}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        type="submit"
                        className={`${!events?.length ? 'click-off pe-none' : ''}`}
                        onClick={async () => {
                            if (events?.length) {
                                const hasMarkAsGoal = events.some(event => event.markAsGoal === true);
                                if (!hasMarkAsGoal) {
                                    setShowMarkAsGoalAlert(true);
                                    return;
                                }
                                const deviceOs = appData?.platform?.toLowerCase().includes('an') ? 'Android' : 'iOS';
                                const fieldCaptureList = events.map(event => {
                                    let eventAttribute = event.attribute || null;
                                    if (!eventAttribute && event.dataAttributeId && attributeList?.length) {
                                        eventAttribute = attributeList.find(attr => attr.dataAttributeId === event.dataAttributeId) || null;
                                    }
                                    
                                    return {
                                        id: event.id || uuid(),
                                    screenName: event.identifier || event.viewId || '',
                                    eventName: event.eventname || '',
                                    viewType: event.trackingType || '',
                                    viewId: event.identifier || event.viewId || '',
                                    scrollX: 0,
                                    scrollY: 0,
                                    width: event.width || 0,
                                    height: event.height || 0,
                                    translationX: 0,
                                    translationY: 0,
                                    top: event.top || 0,
                                    left: event.left || 0,
                                    captureType: 'Click',
                                    inputType: event.inputType || 'Yes / No',
                                    description: event.description || '',
                                    mainScreenName: eventsSocketData?.imageData?.mainScreenName || '',
                                    activityName: eventsSocketData?.clientData?.activityName || '',
                                    minDuration: event.screenTrackMinutes?.text || eventsSocketData?.screenTracking?.minDuration || '',
                                    minLength: event.screenTrackLength?.text || eventsSocketData?.screenTracking?.minLength || '',
                                    markAsGoal: event.markAsGoal || false,
                                        screenfilter: eventsSocketData?.screenTracking?.screenTrackCond || 'AND',
                                        attribute: eventAttribute,
                                        dataAttributeId: eventAttribute?.dataAttributeId || event.dataAttributeId || null,
                                        fieldType: eventAttribute?.attrName || null,
                                        fieldName: eventAttribute?.attributeName || null,
                                        fieldAttName: eventAttribute?.attrName || null
                                    };
                                });

                                const payload = {
                                    campaignId: state?.campaignId?.toString() || '',
                                    appId: appData?.appGuid || '',
                                    deviceType: appData?.platform || '',
                                    deviceOs: deviceOs,
                                    imageData: {
                                        imageData: eventsSocketData?.imageData?.imageData || '',
                                        mainScreenName: eventsSocketData?.imageData?.mainScreenName || '',
                                        manufacture: eventsSocketData?.imageData?.manufacture || '',
                                        deviceModel: eventsSocketData?.imageData?.deviceModel || '',
                                        deviceType: appData?.platform || '',
                                        deviceOs: deviceOs,
                                        height: eventsSocketData?.imageData?.height || 0,
                                        width: eventsSocketData?.imageData?.width || 0,
                                        isDialog: eventsSocketData?.imageData?.isDialog || false,
                                        appId: `${deviceOs}${appData?.platform || ''}${appData?.appGuid || ''}`.replace(/ /g, ''),
                                        deviceId: eventsSocketData?.imageData?.deviceId || ''
                                    },
                                    goalType: 'P',
                                    fieldsInfo: {
                                        campaignStartDate: state?.startDate || '',
                                        campaignEndDate: state?.endDate || '',
                                        fieldCaptureList,
                                        minDuration: eventsSocketData?.screenTracking?.minDuration || 'min',
                                        minLength: eventsSocketData?.screenTracking?.minLength || 'minlength',
                                        screenfilter: eventsSocketData?.screenTracking?.screenTrackCond || 'AND',
                                        pageContent: {
                                            controls: (Array.isArray(eventsSocketData?.controlsArray) && eventsSocketData?.controlsArray?.length > 0) 
                                                ? eventsSocketData.controlsArray 
                                                : [{}]
                                        }
                                    }
                                };

                                await dispatch(saveMobileAppAnalyticsCaptureFields({ payload }));
                                dispatch(updateEventTrack({ field: fieldName, data: events }));
                                onSave(events, eventsSocketData);
                                setSaved(true);
                            } else {
                                trigger();
                            }
                        }}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                        </div>
                    </Row>

                    <RSAlert
                        show={showAlert}
                        body={
                            <Fragment>
                                <i className={`${alert_large} icon-md color-white cursor-normal`} />
                                <span>{ANOTHER_INSTANCE_OF_BROWSER}</span>
                            </Fragment>
                        }
                        footer
                        handleConfirm={() => {
                            socket.off('receiver-handshake-response');
                            socket.off('client-information');
                            socket.off('message-from-client-image');
                            socket.off('message-from-client-data');
                            socket.off('show-auth-code');
                            setShowAlert(false);
                        }}
                        handleClose={() => {
                            socket.off('receiver-handshake-response');
                            socket.off('client-information');
                            socket.off('message-from-client-image');
                            socket.off('message-from-client-data');
                            socket.off('show-auth-code');
                            setShowAlert(false);
                        }}
                    />
                    <RSModal
                        show={showMarkAsGoalAlert}
                        header={WARNING}
                        size="md"
                        body={
                            <p className="text-center">Mark as goal must be enabled in at least one of the fields</p>
            }
                        footer
                        isMobileFieldTrackClass
                        handleConfirm={() => {
                            setShowMarkAsGoalAlert(false);
                        }}
                        handleClose={() => {
                            setShowMarkAsGoalAlert(false);
                        }}
                    />
                    {showMaxEventsAlert && (
                        <RSModal
                            show={showMaxEventsAlert}
                            header={WARNING}
                            size="md"
                            body={
                                <p className="text-center">Maximum 25 events allowed.</p>
                            }
                            footer
                            isMobileFieldTrackClass
                            handleConfirm={() => {
                                setShowMaxEventsAlert(false);
                                reset({
                                    eventname: '',
                                    trackingType: '',
                                    inputType: '',
                                    description: '',
                                    markAsGoal: false,
                                    screenTrackMinutes: screenTrackingMinutesOptions[0],
                                    screenFilter: false,
                                    screenTrackLength: screenTrackingLengthOptions[0],
                                });
                            }}
                            handleClose={() => {
                                setShowMaxEventsAlert(false);
                                reset({
                                    eventname: '',
                                    trackingType: '',
                                    inputType: '',
                                    description: '',
                                    markAsGoal: false,
                                    screenTrackMinutes: screenTrackingMinutesOptions[0],
                                    screenFilter: false,
                                    screenTrackLength: screenTrackingLengthOptions[0],
                                });
                            }}
                        />
                    )}
                    {isShowNewAttrModal && (
                        <NewAttributeModal
                            show={isShowNewAttrModal}
                            handleClose={(status) => {
                                setShowNewAttrModal(status);
                            }}
                            handleSaveAttribute={(data) => {
                                handleNewAttributeSave(data);
                            }}
                            addAudience={false}
                        />
                    )}
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
