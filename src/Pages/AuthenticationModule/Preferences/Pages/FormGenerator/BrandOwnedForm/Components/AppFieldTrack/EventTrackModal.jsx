import { truncateTitle } from 'Utils/modules/displayCore';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { FORM_INITIAL_STATE, TRACKING_TYPE } from './constant';
import { AndoridShake } from 'Assets/Images';
import { MAX_LENGTH45 } from 'Constants/GlobalConstant/Regex';
import { DIGIPOP_ATTRIBUTE, FRIENDLY_NAME as FRIENDLY_NAME_MSG, SELECT_TRACKING_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { ACTIONS, ADD_FORM_ELEMENT, ANOTHER_INSTANCE_OF_BROWSER, APP_FIELD_TRACKING_SETUP, CANCEL, CLICK_EVENT_SHOULD_BE, CONFIRMATION, DELETE, EDIT_EVENT, ESTABLISHING_CONNECTION, FORM_FIELDS, FRIENDLY_NAME, MANDATORY, MARK_AS_SUBMIT, NEW_ATTRIBUTE, NOTE_THE_CONNECTION_WILL_NOT_BE, NO_EVENTS_FOUND, SAVE, SOCKET_CONNECT_SUCCESSFULY, TRACKING_ACTION, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { alert_large, delete_medium, event_tracking_medium, mandatory_mini, mark_as_submit_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { AlertBlock } from 'Assets/Images';
import { calculateCharLimit } from './constant';

import RSAlert from 'Components/RSAlert';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTimer from 'Components/RSTimer';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import NewAttributeFormBtn from '../../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import RSTooltip from 'Components/RSTooltip';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { getSessionId } from 'Reducers/globalState/selector';
import { getAttribute } from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/constant';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { mapToItemRender } from 'Pages/AuthenticationModule/Components/NewAttributeModal/constant';
import { FriendlyNameDuplicateValidate } from '../WebFieldTrackModal/constant';
import KendoGrid from 'Components/RSKendoGrid';

import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'
var socket;

const EventTrackModal = ({
    show,
    defaultEvents = {},
    handleClose = () => {},
    onSave = () => {},
    type = 'web',
    appDetails,
    isAppEdit,
}) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);

    const { control, reset, trigger, handleSubmit, formState, watch, clearErrors, setValue } = useForm(FORM_INITIAL_STATE);
    const [isClickAlert, setClickAlert] = useState(false);

    const [isSaved, setSaved] = useState(false);
    const [events, setEvents] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [eventsSocket, setEventsSocket] = useState({ authCode: '', showAuthCode: false });
    const [attributeList, setAttributeList] = useState([]);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isDisableForm, setDisableForm] = useState(false);
    const [currentAttrList, setCurrentAttrList] = useState([]);
    const [isShowNewAttrModal, setShowNewAttrModal] = useState(false);
    const [newlyCreatedAttrName, setNewlyCreatedAttrName] = useState('');
    const [mandatoryEnabled, setMandatoryEnabled] = useState(false);
    const [showMarkAsSubmitAlert, setShowMarkAsSubmitAlert] = useState(false);
    const [showMandatoryAlert, setShowMandatoryAlert] = useState(false);
    const [showMaxEventsAlert, setShowMaxEventsAlert] = useState(false);
    // console.log(`dataCatalogueAttrs`, dataCatalogueAttrs);
    const currentFormState = watch();
    useEffect(() => {
        if (dataCatalogueAttrs?.length) {
            let output = [];
            let orderDataAttribute = dataCatalogueAttrs
                .map((attribute) => getAttribute(attribute))
                .filter((item) => item.attributeName)
                .sort((a, b) => (a.attributeName.toLowerCase() > b.attributeName.toLowerCase() ? 1 : -1));

            // for (let item of orderDataAttribute) {
            //     // output.push(item.uIPrintableName);
            //     output.push(item.attributeName);
            // }
            setAttributeList(orderDataAttribute);
            setCurrentAttrList(orderDataAttribute);
        }
    }, [dataCatalogueAttrs]);

    useEffect(() => {
        if (!newlyCreatedAttrName || !attributeList?.length) return;
        const normalizedNewName = newlyCreatedAttrName?.toLowerCase()?.trim();
        const matchedAttribute = attributeList.find(
            (item) => item?.attributeName?.toLowerCase()?.trim() === normalizedNewName,
        );
        if (matchedAttribute) {
            setValue('attribute', matchedAttribute, {
                shouldDirty: true,
                shouldValidate: true,
            });
            setNewlyCreatedAttrName('');
        }
    }, [newlyCreatedAttrName, attributeList, setValue]);

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
    const [deviceInfomation, setDeviceInformation] = useState(null);

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        const rslt = dispatch(getDataAttributes(payload, true, false, 'BrandForm'));
            }, [departmentId, clientId, userId]);

    useEffect(() => {
        setDisableForm(true);
    }, []);
    // useEffect(() => {
    //     if (editTrackData?.eventsSocketData && isAppEdit) {
    //         setEventsSocketData(editTrackData?.eventsSocketData);

    //         setEvents(editTrackData?.events);
    //     }
    // }, [editTrackData?.eventsSocketData]);
    const socketConnection = () => {
        var receiverInfo = {};
        receiverInfo.userName = 'Browser';
        var deviceOs = appData?.platform?.toLowerCase().includes('an') ? 'Android' : 'iOS';
                var appId = appData?.appGuid;
        //'7def9b46-cb52-48c7-a858-5213b2cb5e72';
        var platform = appData?.platform; //'Android phone';

        if (appId === null || appId === undefined) {
            return;
        }

        receiverInfo.appId = String(deviceOs + platform + appId).replace(/ /g, ''); //"iOSiPhone7def9b46-cb52-48c7-a858-5213b2cb5e72";
                socket = window.io.connect('https://mobsoc.resu.io/', {
            reconnection: true,
        });

        var json = JSON.stringify(receiverInfo);
        socket.on('connect', () => {
                        socket.emit('receiver-handshake-request', receiverInfo);
                    });
        socket.on('client-handshake-request', (data) => {
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

            // setEventsSocketData((prev) => ({
            //     ...prev,
            //     currentActivity: obj.mainScreenName,
            //     currentImg: obj.imageData,
            //     imageData: obj,
            // }));

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
            socket.off('show-auth-code');
            if (deviceInfomation !== null) {
                return false;
            }
            socket.off('show-auth-code');
            let jData = JSON.parse(data);
                        setDeviceInformation(jData);

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
                        // setEventsSocket({ authCode: '', showAuthCode: false });
        });
        socket.on('disconnect', (data) => {
            // console.log('disconnect');
            // var receiverInfo = {};
            // var deviceOs = appData?.platform?.toLowerCase().includes('an') ? 'Android' : 'iOS';
            // console.log(deviceOs, 'deviceOs');
            // var appId = appData?.appGuid;
            // //'7def9b46-cb52-48c7-a858-5213b2cb5e72';
            // var platform = appData?.platform; //'Android phone';
            // receiverInfo.appId = String(deviceOs + platform + appId).replace(/ /g, '');
            // console.log('disconnect receiver', receiverInfo);
            // socket?.emit('disconnect-receiver', JSON.stringify(receiverInfo));
            // socket.off('receiver-handshake-response');
            // socket.off('client-information');
            // socket.off('message-from-client-image');
            // socket.off('message-from-client-data');
            // socket.off('receiver-handshake-response');
            // socket.off('show-auth-code');
        });
    };

    const marketerAcceptance = () => {
        // this.setState({ deviceInformation: null, showAuthCode: true })
        // setDeviceInformation(null);
        setEventsSocket({ ...eventsSocket, showAuthCode: true });
        var receiverInfo = {};
        var deviceOs = appData?.platform?.toLowerCase().includes('an') ? 'Android' : 'iOS';
                var appId = appData?.appGuid;
        //'7def9b46-cb52-48c7-a858-5213b2cb5e72';
        var platform = appData?.platform; //'Android phone';
        receiverInfo.appId = String(deviceOs + platform + appId).replace(/ /g, ''); //"iOSiPhone7def9b46-cb52-48c7-a858-5213b2cb5e72";
        var json = JSON.stringify(receiverInfo);
                socket.emit('marketer-acceptance-message', json);
        setTimeout(() => {
            setEventsSocket({ authCode: '', showAuthCode: false });
        }, 120000);
    };
    const createSingleMobileField = (item, index, ftime = false, offsetTop = 0, offsetLeft = 0) => {
        var itemTop = item.top + (item.translationY || 0) - (item.scrollY || 0);
        var itemLeft = item.left + (item.translationX || 0) - (item.scrollX || 0);
        var screenTop = offsetTop + itemTop;
        var screenLeft = offsetLeft + itemLeft;
        var divwidth = item.width;
        var divheight = item.height;

        if (item.isShow === false) {
            if (!item.subviews?.length) return null;
            return (
                <Fragment key={item.id}>
                    {item.subviews.map((sitem) => {
                        let arr = eventsSocketData.controlsArray.filter(
                            (obj) => obj.id.toString() === sitem.toString(),
                        );
                        if (arr?.length > 0) {
                            return arr.map((aitem, aindex) =>
                                createSingleMobileField(aitem, aindex, ftime, screenTop, screenLeft),
                            );
                        } else {
                            return (
                                <div key={`array${sitem}`} id={`array${sitem.toString()}`} viewId={sitem.toString()}></div>
                            );
                        }
                    })}
                </Fragment>
            );
        }

        var itemId = 'array' + item.id;
        if (document.getElementById(itemId) !== null) {
            var elem = document.getElementById(itemId);
            elem.setAttribute('data-viewId', item.viewId);
            elem.setAttribute('data-viewType', item.viewType);
        }
        return (
            <div
                key={item.id}
                className={`C fieldTracking ${item?.viewId} ${
                    item?.click === true && screenTop >= 70 ? 'fieldTrackingClick' : ''
                } ${item?.select === true && screenTop >= 70 ? 'fieldTrackingSelect' : ''}`}
                id={item.id}
                data={item}
                style={{ position: 'absolute', top: screenTop, left: screenLeft, width: divwidth, height: divheight }}
                onClick={(e) => {
                    clearErrors();
                    let temp = [...eventsSocketData.controlsArray];

                    let ele = e.target;
                    let se = null;
                    temp.map((newItem) => {
                        return (newItem.click = false);
                    });
                    let fItem = temp.filter((obj) => String(obj.id) === ele.id);

                    if (!fItem.length || fItem[0].isShow === false || screenTop < 100) {
                        return;
                    }

                    if (fItem[0]?.select === true) {
                        setClickAlert(false);
                        setDisableForm(true);
                        setIsUpdate(false);
                        setMandatoryEnabled(false);
                        return;
                    }

                    if (
                        fItem[0].viewType !== 'Others' &&
                        events.filter((obj) => obj.trackingType !== 'Click')?.length > 24
                    ) {
                        setShowMaxEventsAlert(true);
                        return;
                    } else {
                        setShowMaxEventsAlert(false);

                        setDisableForm(false);
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
                                trackingType:
                                    se.viewType === 'Others' ? 'Click' : se.viewType === 'EditText' ? '' : '',
                                inputType: se.viewType === 'Others' ? 'Yes / No' : '',
                                description: '',
                                markAsGoal: false,
                            },
                        }));
                    }
                }}
            />
        );
    };
    const getDeviceType = (type) => {
        switch (type) {
            case 'Android phone':
                return (
                    <div className="andriod-wrapper">
                        <div class="andriod-mobile">
                            <div className="inner"></div>
                            <div className="overflow">
                                <div className="shadow"></div>
                            </div>
                            <div className="speaker"></div>
                            <div className="sensors"></div>
                            <div className="more-sensors"></div>
                            <div className="camera"></div>
                        </div>
                    </div>
                );
            case 'iPhone':
                return (
                    <div className="iphone-mobile">
                        <div className="top-bar"></div>
                        <div className="camera"></div>
                        <div className="sensor"></div>
                        <div className="speaker"></div>
                        <div className="screen"></div>
                        <div className="home"></div>
                        <div className="bottom-bar"></div>
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
        // if (show && defaultEvents?.length) {
        //     setEvents(defaultEvents);
        // }
        if (show && !isAppEdit) {
            // socketConnection();
        } else if (isAppEdit && defaultEvents?.eventsSocketData) {
            setEvents(defaultEvents?.eventsSocketData?.events || []);
            setEventsSocketData((prev) => ({
                ...prev,
                // imageData: defaultEvents?.eventsSocketData?.eventsSocketData?.imageData,
                // controlsArray: defaultEvents?.eventsSocketData?.eventsSocketData?.controlsArray,
                ...defaultEvents?.eventsSocketData?.eventsSocketData,
            }));
            setDisableForm(true);
        }
    }, [show, appData, defaultEvents, isAppEdit]);

    // useEffect(() => {
    //     return () => {
    //         socket?.disconnect();
    //     };
    // }, []);

    useEffect(() => {
        if (!socket?.connected) {
            socketConnection();
        }
    }, [appData]);

    useEffect(() => {
        // console.log(appDetails);
        setappData({
            AppName: appDetails?.appName || appDetails?.AppName,
            platform: appDetails?.deviceType?.id || appDetails?.platform,
            appGuid: appDetails?.appId || appDetails?.appGuid,
            platformName: appDetails?.deviceType?.value || appDetails?.platformName,
        });
    }, [appDetails]);

    useEffect(() => {
        if (!attributeList?.length) {
            setCurrentAttrList([]);
            return;
        }
        let eventNameList = events.map((item) => item?.attribute?.dataAttributeId).filter(Boolean);
        let attrList = attributeList.filter((item) => !eventNameList.includes(item?.dataAttributeId));
        const editingAttrId = currentFormState?.attribute?.dataAttributeId;
        if (isUpdate && editingAttrId) {
            const editingAttr = attributeList.find((item) => item?.dataAttributeId === editingAttrId);
            if (editingAttr && !attrList.some((item) => item?.dataAttributeId === editingAttrId)) {
                attrList = [...attrList, editingAttr];
            }
        }
        attrList.sort((a, b) => (a.attributeName.toLowerCase() > b.attributeName.toLowerCase() ? 1 : -1));
        setCurrentAttrList(attrList);
    }, [attributeList, events, isUpdate, currentFormState?.attribute?.dataAttributeId]);
    // console.log('eventsSocketData: ', eventsSocketData);

    const handleModalClose = (e) => {
        if (!isSaved && !isAppEdit) {
            reset();
            setEvents([]);
        }
        if (!isAppEdit) {
            var receiverInfo = {};
            var deviceOs = appData?.platform?.toLowerCase().includes('an') ? 'Android' : 'iOS';
                        var appId = appData?.appGuid;
            //'7def9b46-cb52-48c7-a858-5213b2cb5e72';
            var platform = appData?.platform; //'Android phone';

            receiverInfo.appId = String(deviceOs + platform + appId).replace(/ /g, '');
                        socket?.emit('disconnect-receiver', JSON.stringify(receiverInfo));

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
            const createdAttrName = data?.name || data?.uIPrintableName || data?.attributeName || '';
            let attr = await dispatch(saveDataAttribute(data));
            if (attr.status) {
                setNewlyCreatedAttrName(createdAttrName);
                setShowNewAttrModal(false);
                const payload = {
                    departmentId,
                    clientId,
                    userId,
                };
                await dispatch(getDataAttributes(payload, true, false, 'BrandForm'));
            }
            return attr;
        } catch (error) {
            return { status: false };
        }
    };
    return (
        <RSModal
            show={show}
            handleClose={handleModalClose}
            header={appData?.AppName}
            // noBottomBorder
            size="fullscreen"
            closeTooltipPosition
            // isHeaderTitle={false}
            // headerTitleClass='p0 pt0'
            // size="xxlg"
            className="px0 fullscreen_popup border-0"
            headerClassName='py10'
            isCloseButton={false}
            bodyClassName={'heightFix'}
            body={
                <Fragment>
                    <Row className="mr0">
                        <Col sm={8}>
                            <div className="brandform-leftview">
                                {/* <div className="border-bottom p-2 top-heading">
                                    <h2 className="color-primary-blue">
                                        {appData?.platform?.charAt(0)?.toUpperCase() + appData?.platform?.slice(1)} {APP_FIELD_TRACKING_SETUP}
                                    </h2>
                                </div> */}
                                {/* {!isEdit ? ( */}
                                <>
                                    {eventsSocketData?.controlsArray?.length > 0 ? (
                                        <>
                                            <div className="leftside-wrapper brandform-leftview mobile bg-white">
                                                {/* <h2 className=" text-center mb10">{appData?.platform} app event tracking setup</h2> */}
                                                <div
                                                    className="device-screen m-auto css-scrollbar pr0 w-100 body-image"
                                                    style={{ width: eventsSocketData?.imageData?.width || 380 }}
                                                >
                                                    <div
                                                        className={`${
                                                            appData?.platform === 'iPhone' ? 'iphone-wrapper' : ''
                                                        }`}
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
                                                                    overflow: 'hidden',
                                                                    position: 'relative',
                                                                }}
                                                            >
                                                                <div
                                                                    className={`${
                                                                        appData?.platform === 'iPhone'
                                                                            ? 'iphone-wrapper'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className="P mx-auto"
                                                                        style={{
                                                                            width:
                                                                                eventsSocketData?.imageData?.width || 0,
                                                                            height:
                                                                                eventsSocketData?.imageData?.height ||
                                                                                0,
                                                                            backgroundImage: `url(${eventsSocketData?.imageData?.imageData})`,
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                width:
                                                                                    eventsSocketData?.imageData
                                                                                        ?.width || 0,
                                                                                height:
                                                                                    eventsSocketData?.imageData
                                                                                        ?.height || 0,
                                                                                position: 'relative',
                                                                                overflow: 'hidden',
                                                                            }}
                                                                        >
                                                                            {eventsSocketData?.controlsArray?.length >
                                                                                0 &&
                                                                                createSingleMobileField(
                                                                                    eventsSocketData?.controlsArray[0],
                                                                                    eventsSocketData?.controlsArray[0]
                                                                                        .id,
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
                                            <div className={`leftside-wrapper brandform-leftview mobile bg-white ${!eventsSocket?.showAuthCode ? '' : 'd-flex align-items-center justify-content-center'}`} style={!eventsSocket?.showAuthCode ? {} : { minHeight: '100%' } }>
                                                <div className="text-center">
                                                    {!eventsSocket?.showAuthCode ? (
                                                        <>
                                                            {/* <h2 className="color-secondary-blue mb20">
                                                    <span style={{ textTransform: 'uppercase' }}></span>
                                                        {appData?.platformName?.charAt(0)}
                                                    </span>
                                                    <span style={{ textTransform: 'lowercase' }}>
                                                        {appData?.platformName?.slice(1)}
                                                    </span>{' '}
                                                    app event tracking setup
                                                </h2> */}
                                                            <img
                                                                src={AndoridShake}
                                                                alt={'Android shake'}
                                                                className="brandform-mobile-img mt30"
                                                            />
                                                            <h2 className="color-secondary-blue mt20 mb10">
                                                                {ESTABLISHING_CONNECTION}
                                                            </h2>
                                                            <p className="mb10">
                                                                Open {appData?.AppName} and flip your mobile phone 6
                                                                times as shown above
                                                            </p>
                                                            <small>{NOTE_THE_CONNECTION_WILL_NOT_BE}</small>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h2 className={`color-secondary-blue ${appData?.appName?.length ? 'mb20': ''}`}>
                                                                {appData?.appName}{' '}
                                                                {/* {APP_FIELD_TRACKING_SETUP} */}
                                                            </h2>
                                                            <p>
                                                                {SOCKET_CONNECT_SUCCESSFULY}{' '}
                                                                {eventsSocket?.authCode}
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
                        <Col sm={4} className="position-relative pr0">
                            {/* {isClickAlert && (
                                <h6 className="color-primary-red text-center">{CLICK_EVENT_SHOULD_BE}</h6>
                            )} */}
                            <div className={``}>
                                <div>
                                    <h2 className="color-secondary-blue pb8">
                                        <i
                                            className={`${event_tracking_medium} icon-md color-primary-blue mr5`}
                                        />
                                        {ADD_FORM_ELEMENT}
                                    </h2>
                                </div>
                                <div className={`box-design no-box-shadow overflow-x-visible field-tracking-form-view css-scrollbar mb19 ${!eventsSocketData?.selectElement && !isUpdate ? 'pe-none click-off' : ''} ${
                                            isDisableForm ? 'pe-none click-off' : ''
                                        }`}>
                                    <div
                                        className={``}
                                    >
                                        <div className="form-group mt10">
                                            <RSInput
                                                control={control}
                                                name={'eventname'}
                                                required
                                                placeholder={FRIENDLY_NAME}
                                                maxLength={MAX_LENGTH45}
                                                rules={{
                                                    required: FRIENDLY_NAME_MSG,
                                                    validate: (value) => {
                                                        return FriendlyNameDuplicateValidate(
                                                            value,
                                                            events,
                                                            currentFormState,
                                                            isUpdate,
                                                        );
                                                    },
                                                }}
                                                isFormMandatoryTooltip
                                                iconPlaceholderText={MANDATORY}
                                                iconName={mandatory_mini}
                                                customTooltipClassName='top5'
                                                iconPlaceholder={true}
                                                handlePlaceholderIconClick={() => setMandatoryEnabled((prev) => !prev)}
                                                iconColor={mandatoryEnabled ? 'color-primary-red' : ''}
                                                iconSize={'icon-xs'}
                                            />
                                        </div>
                                        {/* <div className={` form-group`}>
                                            <RSKendoDropDownList
                                                control={control}
                                                name={'attribute'}
                                                data={currentAttrList}
                                                label={'Select attribute'}
                                                required
                                                rules={{
                                                    required: ATTRIBUTE,
                                                }}
                                            />
                                            <RSKendoDropdown
                                                name={`attribute`}
                                                data={currentAttrList}
                                                isCustomRender
                                                itemRender={(ele, props) => mapToItemRender(ele, props, [])}
                                                control={control}
                                                required
                                                textField={'attributeName'}
                                                dataItemKey={'dataAttributeId'}
                                                label={'Select attribute'}
                                                popupSettings={{
                                                    popupClass: `addImportAudienceDropdownListContainer`,
                                                }}
                                                //   handleChange={handleChangeAtt}
                                                footer={
                                                    <NewAttributeFormBtn
                                                        title={NEW_ATTRIBUTE}
                                                        handleModalAttribute={() => setShowNewAttrModal(true)}
                                                    />
                                                }
                                            />
                                        </div> */}
                                        <Row>
                                            <Col sm={6}>
                                                <div className="form-group mb0">
                                                    <RSKendoDropDown
                                                        name={`attribute`}
                                                        data={currentAttrList}
                                                        isCustomRender
                                                        itemRender={(ele, props) => mapToItemRender(ele, props, [])}
                                                        control={control}
                                                        required
                                                        textField={'attributeName'}
                                                        dataItemKey={'dataAttributeId'}
                                                        label={'Select attribute'}
                                                        rules={{
                                                            required: DIGIPOP_ATTRIBUTE,
                                                        }}
                                                        // popupSettings={{
                                                        //     popupClass: `addImportAudienceDropdownListContainer`,
                                                        // }}
                                                        //   handleChange={handleChangeAtt}
                                                        footer={
                                                            <NewAttributeFormBtn
                                                                title={NEW_ATTRIBUTE}
                                                                handleModalAttribute={() => setShowNewAttrModal(true)}
                                                            />
                                                        }
                                                    />
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <div
                                                    className={`${
                                                        eventsSocketData?.selectElement?.viewType === 'Others'
                                                            ? 'pe-none click-off'
                                                            : ''
                                                    } form-group mb0`}
                                                >
                                                    <RSKendoDropDownList
                                                        control={control}
                                                        name={'trackingType'}
                                                        data={
                                                            eventsSocketData?.selectElement?.viewType === 'EditText'
                                                                ? ['Value', 'Length']
                                                                : TRACKING_TYPE
                                                        }
                                                        label={'Capture type'}
                                                        required
                                                        rules={{
                                                            required: SELECT_TRACKING_TYPE,
                                                        }}
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
                                                        labelName={MARK_AS_SUBMIT}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="buttons-holder pr0 right0">
                                        <RSSecondaryButton
                                            onClick={() => {
                                                reset({
                                                    eventname: '',
                                                    trackingType: '',
                                                    inputType: '',
                                                    description: '',
                                                    markAsGoal: false,
                                                });
                                                setIsUpdate(false);
                                                setDisableForm(true);
                                                setMandatoryEnabled(false);
                                            }}
                                        >
                                            {CANCEL}
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            onClick={handleSubmit((formState) => {
                                                                                                if (!isUpdate) {
                                                    const eventId = uuid(); // Generate ONE ID for this event
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
                                                        //eventTracking: eventsSocketData?.event,
                                                        eventTracking: {
                                                            id: eventId, // Use same ID
                                                            ...formState,
                                                            mandatory: mandatoryEnabled,
                                                            viewId: selectField?.viewId,
                                                        },
                                                        eventTrackingTemp: {
                                                            id: eventId, // Use same ID
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
                                                            mandatory: mandatoryEnabled,
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
                                                    setEvents((prev) => {
                                                        // If new event has markAsGoal=true, clear it from existing events
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
                                                                id: eventId, // Use same ID
                                                                ...formState,
                                                                mandatory: mandatoryEnabled,
                                                                viewId: selectField?.viewId,
                                                            },
                                                        ];
                                                    });
                                                } else if (isUpdate) {
                                                    setEvents((prev) => {
                                                        let update = prev.map((item) =>
                                                            item.id === formState?.id
                                                                ? { ...item, ...formState, mandatory: mandatoryEnabled }
                                                                : formState?.markAsGoal === true
                                                                    ? { ...item, markAsGoal: false } // Clear markAsGoal from other events
                                                                    : { ...item },
                                                        );
                                                        return update;
                                                    });
                                                    
                                                    // Update elementArray as well
                                                    setEventsSocketData((prev) => {
                                                        let updatedElementArray = prev?.elementArray?.map((item) =>
                                                            item?.eventTracking?.id === formState?.id
                                                                ? {
                                                                      ...item,
                                                                      eventTracking: {
                                                                          ...item.eventTracking,
                                                                          ...formState,
                                                                          mandatory: mandatoryEnabled,
                                                                      },
                                                                      eventTrackingTemp: {
                                                                          ...item.eventTrackingTemp,
                                                                          ...formState,
                                                                          mandatory: mandatoryEnabled,
                                                                      },
                                                                  }
                                                                : formState?.markAsGoal === true
                                                                    ? {
                                                                          ...item,
                                                                          eventTracking: {
                                                                              ...item.eventTracking,
                                                                              markAsGoal: false,
                                                                          },
                                                                          eventTrackingTemp: {
                                                                              ...item.eventTrackingTemp,
                                                                              markAsGoal: false,
                                                                          },
                                                                      }
                                                                    : item,
                                                        );
                                                        
                                                        // Check if any event has markAsGoal after update
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
                                                    
                                                    setIsUpdate(false);
                                                }
                                                reset({
                                                    eventname: '',
                                                    trackingType: [],
                                                    inputType: [],
                                                    description: '',
                                                    markAsGoal: false,
                                                });
                                                setDisableForm(true);
                                                setMandatoryEnabled(false);
                                            })}
                                            className={`${events?.length === 25 && !isUpdate ? 'click-off' : ''}`}
                                        >
                                            {isUpdate ? 'Update' : 'Add'}
                                        </RSPrimaryButton>
                                    </div>
                                </div>
                            </div>
                                <div className={`${isUpdate ? 'pe-none click-off' : ''} mb19`}>
                                    <h2 className="color-secondary-blue pb8">
                                        <i
                                            className={`${event_tracking_medium} icon-md color-primary-blue mr5`}
                                        />
                                        {FORM_FIELDS}
                                    </h2>
                                    <div
                                        className={
                                            isClickAlert
                                                ? 'rs-cc-events-tracking-list-error'
                                                : 'rs-cc-event-tracking-list'
                                        }
                                    >
                                        {events?.length ? (
                                            <KendoGrid
                                                data={events}
                                                settings={{
                                                    total: events?.length,
                                                }}
                                               hidePaginationInfo
                                            hideFirstLastNav
                                                column={[
                                                    {
                                                        field: 'eventname',
                                                        title: FRIENDLY_NAME,
                                                        // filter: 'text',
                                                        width: '100px',
                                                        cell: ({ dataItem }) => {
                                                            const charLimit = calculateCharLimit(100, dataItem?.mandatory);
                                                            
                                                            return (
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                            {/* {dataItem?.eventname?.length > charLimit ? (
                                                                                <RSTooltip text={dataItem?.eventname} position="top">
                                                                                    <span>
                                                                                        {truncateTitle(dataItem?.eventname, charLimit)}
                                                                                    </span>
                                                                                </RSTooltip>
                                                                            ) : (
                                                                                <span>{dataItem?.eventname}</span>
                                                                            )} */}
                                                                            <TruncatedCell value={dataItem?.eventname} noTable={true} />
                                                                        {dataItem?.mandatory && (
                                                                            <RSTooltip text="Mandatory" position="top" className='position-relative top-5 lh0' innerContent={false}>
                                                                                <i
                                                                                    className={`${mandatory_mini} font-xxs color-primary-red cursor-default ml5`}
                                                                                ></i>
                                                                            </RSTooltip>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        },
                                                    },
                                                    {
                                                        field: 'attribute.attributeName',
                                                        title: TRACKING_ACTION,
                                                        // filter: 'text',
                                                        width: '100px',
                                                        cell: ({ dataItem }) => {
                                                            // const charLimit = calculateCharLimit(100);
                                                            
                                                            return (
                                                                <td>
                                                                    {/* {dataItem?.attribute?.attributeName?.length > charLimit ? (
                                                                        <RSTooltip text={dataItem?.attribute?.attributeName} position="top">
                                                                            <span>
                                                                                {truncateTitle(dataItem?.attribute?.attributeName, charLimit)}
                                                                            </span>
                                                                        </RSTooltip>
                                                                    ) : (
                                                                        <span>{dataItem?.attribute?.attributeName}</span>
                                                                    )} */}
                                                                    <div>
                                                                    <TruncatedCell value={dataItem?.attribute?.attributeName} noTable={true} />
                                                                    </div>
                                                                </td>
                                                            );
                                                        },
                                                    },
                                                    {
                                                        title: ACTIONS,
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
                                                                                setCurrentAttrList((prev = []) => {
                                                                                    const selectedAttr =
                                                                                        dataItem?.attribute;
                                                                                    if (!selectedAttr?.dataAttributeId) {
                                                                                        return prev;
                                                                                    }
                                                                                    const isAlreadyAvailable = prev.some(
                                                                                        (item) =>
                                                                                            item?.dataAttributeId ===
                                                                                            selectedAttr?.dataAttributeId,
                                                                                    );
                                                                                    if (isAlreadyAvailable) {
                                                                                        return prev;
                                                                                    }
                                                                                    return [...prev, selectedAttr].sort(
                                                                                        (a, b) =>
                                                                                            a?.attributeName
                                                                                                ?.toLowerCase()
                                                                                                ?.localeCompare(
                                                                                                    b?.attributeName?.toLowerCase?.() ||
                                                                                                        '',
                                                                                                ) || 0,
                                                                                    );
                                                                                });
                                                                                reset(dataItem);
                                                                                setDisableForm(false);
                                                                                setShowMaxEventsAlert(false);
                                                                                setIsUpdate(true);
                                                                                setMandatoryEnabled(!!dataItem?.mandatory);
                                                                            }}
                                                                        />
                                                                    </RSTooltip>
                                                                  
                                                                    {dataItem?.markAsGoal && (
                                                                        <RSTooltip
                                                                            text={MARK_AS_SUBMIT}
                                                                            position="top"
                                                                            className="lh0 mr10"
                                                                        >
                                                                            <i
                                                                                className={`${mark_as_submit_medium} icon-md color-primary-green cursor-default`}
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
                                                                                    let filterElementAry =
                                                                                        prev?.elementArray?.filter(
                                                                                            (item) =>
                                                                                                item?.eventTracking
                                                                                                    ?.viewId !==
                                                                                                dataItem?.viewId,
                                                                                        );

                                                                                    let filterSelectControls =
                                                                                        prev?.selectControls?.filter(
                                                                                            (item) =>
                                                                                                item?.viewId !==
                                                                                                dataItem?.viewId,
                                                                                        );
                                                                                    let filterControlsArry =
                                                                                        prev?.controlsArray?.map(
                                                                                            (item) => {
                                                                                                return item?.viewId ===
                                                                                                    dataItem?.viewId
                                                                                                    ? {
                                                                                                          ...item,
                                                                                                          select: false,
                                                                                                          click: false,
                                                                                                      }
                                                                                                    : { ...item };
                                                                                            },
                                                                                        );

                                                                                    return {
                                                                                        ...prev,
                                                                                        controlsArray:
                                                                                            filterControlsArry,
                                                                                        elementArray: filterElementAry,
                                                                                        selectControls:
                                                                                            filterSelectControls,
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
                                                pageable={true}
                                                sortable={true}
                                                filterable={true}
                                                noRecords={{
                                                    template: () => (
                                                        <h4 className="mb0 flex flex-center pt30 pb20 color-primary-grey box-design">
                                                            {NO_EVENTS_FOUND}
                                                        </h4>
                                                    ),
                                                }}
                                            />
                                        ) : (
                                            <h4 className="mb0 flex flex-center pt30 pb20 color-primary-grey box-design">
                                                {NO_EVENTS_FOUND}
                                            </h4>
                                        )}
                                    </div>
                                  
                                </div>
                                  <div className={`modal-footer position-absolute bottom0 right0 pb0 pr0`}>
                                        <RSSecondaryButton onClick={handleModalClose}>
                                            {CANCEL}
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            type="submit"
                                            className={`${!events?.length ? 'click-off pe-none' : ''}`}
                                            onClick={() => {
                                                if (events?.length) {
                                                    const hasMarkAsGoal = events.some(event => event.markAsGoal === true);
                                                    if (!hasMarkAsGoal) {
                                                        setShowMarkAsSubmitAlert(true);
                                                        return;
                                                    }
                                                    const hasMandatory = events.some(event => event.mandatory === true);
                                                    if (!hasMandatory) {
                                                        setShowMandatoryAlert(true);
                                                        return;
                                                    }
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
                        </Col>
                    </Row>

                    <RSAlert
                        show={showAlert}
                        body={
                            <Fragment>
                                <div className="d-flex align-items-center justify-content-center mr30">
                                    <div>
                                        <img src={AlertBlock} alt="alertBlock" width={60} height={60} />
                                        {/* <i className={`${alert_large} icon-lg color-white cursor-normal`} /> */}
                                    </div>
                                    <div className="my20">
                                        <h1 className="mb0">{ANOTHER_INSTANCE_OF_BROWSER}</h1>
                                    </div>
                                </div>
                            </Fragment>
                        }
                        footer
                        isMobileFieldTrackClass
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
                        show={showMarkAsSubmitAlert}
                        header={CONFIRMATION}
                        size="md"
                        body={
                            <p className="text-center">Mark as submit must be enabled in at least one of the fields</p>
                        }
                        footer
                        isMobileFieldTrackClass
                        handleConfirm={() => {
                            setShowMarkAsSubmitAlert(false);
                        }}
                        handleClose={() => {
                            setShowMarkAsSubmitAlert(false);
                        }}
                    />
                    <RSModal
                        show={showMandatoryAlert}
                        header={CONFIRMATION}
                        size="md"
                        body={
                            <p className="text-center">Mandatory must be enabled in at least one of the fields</p>
                        }
                        footer
                        isMobileFieldTrackClass
                        handleConfirm={() => {
                            setShowMandatoryAlert(false);
                        }}
                        handleClose={() => {
                            setShowMandatoryAlert(false);
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
                                });
                                setMandatoryEnabled(false);
                            }}
                            handleClose={() => {
                                setShowMaxEventsAlert(false);
                                reset({
                                    eventname: '',
                                    trackingType: '',
                                    inputType: '',
                                    description: '',
                                    markAsGoal: false,
                                });
                                setMandatoryEnabled(false);
                            }}
                        />
                    )}
                    {/* {deviceInfomation !== null && (
                        <RSAlert
                            show={true}
                            body={
                                <Fragment>
                                    <i className={`${alert_large} icon-md color-white cursor-normal`} />
                                    <span>Connect</span>
                                </Fragment>
                            }
                            footer
                            handleConfirm={() => {
                                // setDeviceInformation(null);
                                marketerAcceptance();
                            }}
                            handleClose={() => {
                                setDeviceInformation(null);
                            }}
                        />
                    )} */}
                    {isShowNewAttrModal && (
                        <NewAttributeModal
                            show={isShowNewAttrModal}
                            handleClose={(status) => {
                                setShowNewAttrModal(status);
                            }}
                            handleSaveAttribute={(data) => {
                                handleNewAttributeSave(data);
                            }}
                            // editData={{}}
                            //catType={{}}
                            addAudience={false}
                        />
                    )}
                </Fragment>
            }
            // footer={
            //     <Fragment>
            //         <RSSecondaryButton onClick={handleModalClose}>Cancel</RSSecondaryButton>
            //         <RSPrimaryButton
            //             type="submit"
            //             onClick={() => {
            //                 if (events?.length) {
            //                     onSave(events, eventsSocketData);
            //                     setSaved(true);
            //                 } else {
            //                     trigger();
            //                 }
            //             }}
            //         >
            //             Save
            //         </RSPrimaryButton>
            //     </Fragment>
            // }
        />
    );
};

EventTrackModal.propTypes = {
    show: PropTypes.bool.isRequired,
    events: PropTypes.object,
    onSave: PropTypes.func,
    handleClose: PropTypes.func,
};

export default memo(EventTrackModal);
