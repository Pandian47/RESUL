import { truncateTitle } from 'Utils/modules/displayCore';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { INPUT_TYPE, screenTrackingLengthOptions, screenTrackingMinutesOptions, TRACKING_TYPE } from './constant';
import { ENTER_DESCRIPTION, ENTER_EVENT_NAME, SELECT_INPUT_TYPE, SELECT_TRACKING_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_EVENTS, DESCRIPTION, EVENT_NAME, INPUT_TYPE as INPUT_TYPE_PH, MIN_DURATION_TEXT, MIN_LENGTH_TEXT, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { delete_medium, event_tracking_medium, goal_achieved_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSInput from 'Components/FormFields/RSInput';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTooltip from 'Components/RSTooltip';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import useQueryParams from 'Hooks/useQueryParams';
import RSKendoGrid from 'Components/RSKendoGrid';


import { checkCategoryType } from './constant';

const EventNameDuplicateValidate = (value, events, currentFormState, isEditEvent) => {
    if (!value) return true;
    
    const trimmedValue = value.trim().toLowerCase();
    const isDuplicate = events.some((event) => {
        if (isEditEvent && event.id === currentFormState?.id) {
            return false;
        }
        return event.eventname?.trim().toLowerCase() === trimmedValue;
    });
    
    return !isDuplicate || 'Event name already exists';
};

const WebFieldTrack = ({ show, onWebFieldTrackSubmit, editEventList, handleModalClose }) => {
    var socket;
    var client;
    const locationState = useQueryParams('/communication');
    const removeWebftParam = () => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('webft')) {
            params.delete('webft');
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }
    };

    const { control, formState, handleSubmit, setValue, reset, watch } = useForm();

    const screenTrackMinutes = watch('screenTrackMinutes');
    const screenTrackLength = watch('screenTrackLength');
    const screenFilter = watch('screenFilter');

    const [isClickAlert, setClickAlert] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [isRenderWebField, setRenderWebField] = useState(false);
    const [isShowModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [isEditEvent, setEditEvent] = useState(false);
    const [isDisableForm, setDisableForm] = useState(false);
    const [showMaxEventsAlert, setShowMaxEventsAlert] = useState(false);
    const [showMarkAsGoalAlert, setShowMarkAsGoalAlert] = useState(false);
    const [imageDetails, setImageDetails] = useState({
        currentActivity: '',
        currentImg: '',
        imageData: '',
        controlsArray: [],
        selectControls: [],
        selectElement: null,
        elementArray: [],
        screenTracking: {
            minDuration: '',
            screenTrackCond: 'And',
            minLength: '',
        },
        event: {},
    });
    const currentFormState = watch();
    // const [eventsSocketData, setEventsSocketData] = useState({
    //     currentActivity: '',
    //     currentImg: '',
    //     imageData: '',
    //     selectControls: [],
    //     clientData: '',
    //     controlsArray: '',
    //     selectElement: null,
    //     elementArray: [],
    //     screenTracking: {
    //         minDuration: '',
    //         screenTrackCond: 'And',
    //         minLength: '',
    //     },
    //     event: {
    //         eventname: '',
    //         trackingType: '',
    //         inputType: '',
    //         description: '',

    //         markAsGoal: false,
    //     },

    //     IsmarkAsGoal: false,
    // });
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get('webft');
        
        if (show) {
            if (editEventList?.jsondata) {
                const apiData = editEventList.jsondata;
                const fieldTrackData = apiData?.fieldTrackInfo || apiData?.fieldsInfo;
                let transformedEvents = [];
                if (fieldTrackData?.fieldCaptureList?.length) {
                    transformedEvents = fieldTrackData.fieldCaptureList.map((item, index) => {
                        return {
                            id: item.id || uuid(),
                            eventname: item.eventname || item.eventName || '',
                            trackingType: item.trackingType || item.captureType || '',
                            inputType: item.inputType || item.elementaction || '',
                            description: item.description || '',
                            markAsGoal: item.markAsGoal || false,
                            viewId: item.viewId || '',
                        };
                    });
                    setEvents(transformedEvents);
                }
                const controlsArray = Array.isArray(fieldTrackData?.pageContent?.controls) 
                    ? fieldTrackData.pageContent.controls 
                    : [];
                const screenTrackingData = {
                    minDuration: fieldTrackData?.minDuration || '',
                    screenTrackCond: fieldTrackData?.screenfilter || 'And',
                    minLength: fieldTrackData?.minLength || '',
                };
                const elementArrayData = transformedEvents.map((event) => {
                    const field = controlsArray.find(control => control.viewId === event.viewId) || {};
                    
                    return {
                        field: field,
                        eventTracking: {
                            id: event.id,
                            eventname: event.eventname,
                            trackingType: event.trackingType,
                            inputType: event.inputType,
                            description: event.description,
                            markAsGoal: event.markAsGoal,
                            viewId: event.viewId,
                        },
                        eventTrackingTemp: {
                            id: event.id,
                            eventname: event.eventname,
                            trackingType: event.trackingType,
                            inputType: event.inputType,
                            description: event.description,
                            markAsGoal: event.markAsGoal,
                        },
                    };
                });
                setImageDetails({
                    currentActivity: apiData?.imageData?.mainScreenName || '',
                    currentImg: apiData?.imageData?.imageData || '',
                    imageData: apiData?.imageData || {},
                    controlsArray: controlsArray,
                    selectControls: [],
                    selectElement: null,
                    elementArray: elementArrayData,
                    screenTracking: screenTrackingData,
                    event: {},
                });
            }
            else if (editEventList?.['elementArray']?.length) {
                const eventList = editEventList['elementArray'];
                const transformedElementArray = eventList.map((event) => {
                    const field = editEventList.controlsArray?.find(
                        control => control.viewId === event.viewId
                    ) || {};
                    
                    return {
                        field: field,
                        eventTracking: {
                            id: event.id,
                            eventname: event.eventname,
                            trackingType: event.trackingType || event.elementtype,
                            inputType: event.inputType || event.elementaction,
                            description: event.description,
                            markAsGoal: event.markAsGoal,
                            viewId: event.viewId,
                        },
                        eventTrackingTemp: {
                            id: event.id,
                            eventname: event.eventname,
                            trackingType: event.trackingType || event.elementtype,
                            inputType: event.inputType || event.elementaction,
                            description: event.description,
                            markAsGoal: event.markAsGoal,
                        },
                    };
                });
                
                setImageDetails({
                    ...editEventList,
                    elementArray: transformedElementArray,
                });
                setEvents(eventList);
            }
            else if (myParam) {
                webSocketInit();
            }
        }
    }, [show]);
    useEffect(() => {
        if (imageDetails?.controlsArray?.length) {
            setRenderWebField(true);
        }
    }, [imageDetails?.controlsArray?.length]);

    useEffect(() => {
        if (checkCategoryType(imageDetails?.selectElement?.category) === 2 && !isEditEvent) {
            setValue('elementtype', 'Click');
            setValue('elementaction', 'Yes');
        }
    }, [imageDetails?.selectElement?.category, isEditEvent, setValue]);
    
    useEffect(() => {
        if (imageDetails?.screenTracking && show) {
            if (imageDetails.screenTracking.minDuration) {
                setValue('screenTrackMinutes', imageDetails.screenTracking.minDuration);
            }
            if (imageDetails.screenTracking.minLength) {
                setValue('screenTrackLength', imageDetails.screenTracking.minLength);
            }
            if (imageDetails.screenTracking.screenTrackCond) {
                setValue('screenFilter', imageDetails.screenTracking.screenTrackCond === 'And');
            }
        }
    }, [imageDetails?.screenTracking?.minDuration, imageDetails?.screenTracking?.minLength, imageDetails?.screenTracking?.screenTrackCond, show, setValue]);
    
    useEffect(() => {
        if (screenTrackMinutes || screenTrackLength || screenFilter !== undefined) {
            setImageDetails((prev) => ({
                ...prev,
                screenTracking: {
                    minDuration: screenTrackMinutes || prev.screenTracking?.minDuration || '',
                    screenTrackCond: screenFilter !== undefined ? (screenFilter ? 'And' : 'Or') : prev.screenTracking?.screenTrackCond || 'And',
                    minLength: screenTrackLength || prev.screenTracking?.minLength || '',
                },
            }));
        }
    }, [screenTrackMinutes, screenTrackLength, screenFilter]);
    
    useEffect(() => {
        setShowModal(show);
    }, [show]);
    const createSingleWebField = (item, index) => {
        var top = item.top;
        var left = item.left;
        var divwidth = item.width;
        var divheight = item.height;
        var itemId = 'array' + index;
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
                style={{ position: 'absolute', top: top, left: left, width: divwidth, height: divheight }}
                onClick={(e) => {
                    if (item?.select === true) {
                        setClickAlert(false);
                        return;
                    }
                    if (events?.length >= 25) {
                        setShowMaxEventsAlert(true);
                        return;
                    }
                    setClickAlert(true);
                    setDisableForm(false);
                    let temp = [...imageDetails.controlsArray];
                    let ele = e.target;
                    let se = null;
                    temp.map((newItem) => {
                        newItem.click = false;
                    });
                    // let index = temp.indexOf(item);
                    // temp[index].click = true
                    let fItem = temp.filter((obj) => String(obj.id) === ele.id);
                    fItem[0].click = true;
                    se = fItem[0];
                    let _tempSelect = [...imageDetails.selectControls];
                    _tempSelect = _tempSelect.filter((obj) => obj.select === true);
                    _tempSelect.push(fItem[0]);
                    _tempSelect = _tempSelect.filter(
                        (value, index, self) =>
                            index === self.findIndex((t) => t.viewId === value.viewId && t.viewId === value.viewId),
                    );
                    // this.setState({
                    //     selectControls: _tempSelect,
                    //     controlsArray: temp,
                    //     selectElement: se,
                    //     event: {
                    //         eventName: '',
                    //         eventType: '',
                    //         eventDescription: '',
                    //     },
                    // });
                    setImageDetails({
                        ...imageDetails,
                        selectControls: _tempSelect,
                        controlsArray: temp,
                        selectElement: se,
                        event: {
                            eventName: '',
                            eventType: '',
                            eventDescription: '',
                        },
                    });

                    window.scrollTo(0, 0);
                    document.querySelector('.field-tracking-form-view').scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });

                    document.querySelector('.modal-body').scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                }}
            >
                {(() => {
                    const subviews = safeParseJSON(item?.subviews, []);
                    if (!Array.isArray(subviews) || subviews.length === 0) return null;
                    return subviews.map((sitem) => {
                        // let s = remSpace(sitem).replace('[', '')
                        // s = s.replace(']', '')
                        let arr = this.state.controlsArray.filter((obj) => obj.id.toString() === sitem.toString());
                        if (arr?.length > 0) {
                            return arr.map((aitem, aindex) => {
                                return this.createSingleWebField(aitem, aitem.id);
                            });
                        } else {
                            return <div id={`array${sitem.toString()}`} viewId={sitem.toString()}></div>;
                        }
                    });
                })()}
            </div>
        );
    };
    const CreateWebField = () => {
        let array = imageDetails?.controlsArray;
        return array.map((item, index) => {
            return createSingleWebField(item, index);
        });
    };
    const webSocketInit = () => {
        let temp = localStorage.getItem('fdomain') || '';
        let url = new URL(temp);
        let domainName = url?.origin || '';
        //const parsed = queryString.parse(this.props.history?.location?.search);

        // let parsedCid = parsed.cId !== undefined ? parsed.cId : 0;
        //   let parsedCid = _get(locationState, 'campaignId', 0);
        const searchParams = new URLSearchParams(url.search);
        const param = searchParams.get('_sdxId');
        let parsedCid = atob(param);
        socket = window.io.connect('https://mobsoc.resu.io/', {
            reconnection: true,
        });

        window.addEventListener('beforeunload', function () {
            // if (this.selfClose === true) {
            //     socket.emit("closed", { userName: 'fieldtrack', domainName: domainName, appId: parseInt(parsedCid), status: true });
            //     socket.emit("close", { userName: 'fieldtrack', domainName: domainName, appId: parseInt(parsedCid), status: true });
            // } else {
            socket.emit('closed', {
                userName: 'fieldtrack',
                domainName: domainName,
                appId: parseInt(parsedCid, 10),
                status: false,
            });
            socket.emit('close', {
                userName: 'fieldtrack',
                domainName: domainName,
                appId: parseInt(parsedCid, 10),
                status: false,
            });
            // }
        });

        socket.on('connect', () => {
            socket.emit('new_user', { userName: 'fieldtrack', domainName: domainName, appId: parseInt(parsedCid, 10) });
        });
        socket.on('closed', (data) => {
            try {
                client.close();
                if (status) {
                    alert('Field track enabled successfully!');
                } else {
                    alert('Client closed unexpectedly!');
                }
            } catch (error) {
            }
        });
        socket.on('data_post', (data) => {
            // this.context.globalStateData.setIsLoadingData(false);
            if (!imageDetails.controlsArray?.length === 0) {
                let imageData = {
                    imageData: data?.data?.PageScreenShot,
                    width: data.data?.Width || 0,
                    height: data.data?.Height || 0,
                };
                // this.setState({ currentActivity: data.domainName, currentImg: imageData.imageData, imageData: imageData });

                //this.props.domainName(data.domainName)
                data.data.PageContentJson.map((item, index) => {
                    item.id = index + 1;
                    item.viewId = index + 1;
                    item.isShow = true;
                    item.category = item.tagname;
                });
                // this.setState({ controlsArray: PageContentJson });
                setImageDetails({
                    ...imageDetails,
                    currentActivity: data.domainName,
                    currentImg: imageData.imageData,
                    imageData: imageData,
                    controlsArray: data.data.PageContentJson,
                });
                // receiverInfo.PageContentJson.forEach(el => {
                //     const marker = document.createElement('div');
                //     marker.classList.add('marker');
                //     marker.setAttribute("style", `height: ${el.height}px;width: ${el.width}px;left: ${el.left}px;top:${el.top}px;`);
                //     marker.setAttribute("res-data", `{"tagname": "${el.tagname}";"tagtype": "${el.tagtype}";"viewid": "${el.viewid}";"viewname": "${el.viewname}";}`);
                //     marker.onclick = function (el) {
                //         marker.classList.add("selected");
                //         let data = marker.getAttribute("res-data");
                //         console.log(data)
                //         document.getElementById("el_details").innerText = JSON.stringify(data,null,4)
                //     }
                //     document.querySelector("#display_wrapper").appendChild(marker);
                // });
                // document.querySelector("img#captured_img").src = image;
                // document.querySelector("img#captured_img").style.display = "block";
            }
        });
        socket.on('data_receive', (data) => {
            socket.off('data_receive');
            if (imageDetails?.controlsArray?.length === 0) {
                let imageData = {
                    imageData: data?.data?.PageScreenShot || data?.data?.image,
                    width: data.data?.Width || 0,
                    height: data.data?.Height || 0,
                };

                //this.props.domainName(data.domainName)
                data.data.PageContentJson.map((item, index) => {
                    item.id = index + 1;
                    item.viewId = index + 1;
                    item.isShow = true;
                    item.category = item.tagname;
                });
                // this.setState({ controlsArray: PageContentJson });
                setImageDetails({
                    ...imageDetails,
                    currentActivity: data.domainName,
                    currentImg: imageData.imageData,
                    imageData: imageData,
                    controlsArray: data.data.PageContentJson,
                });
            }
        });
    };
    return (
        isShowModal && (
            <>
                <RSModal
                    show={isShowModal}
                    handleClose={() => {
                        removeWebftParam();
                        handleModalClose();
                    }}
                    header={'Field tracking'}
                    isHeaderTitle
                    closeTooltipPosition
                    size="fullscreen"
                    className="px0 fullscreen_popup border-0"
                    bodyClassName={'heightFix'}
                    headerClassName='pt5 pb0'
                    isCloseButton={false}
                    noBottomBorder
                    customContentClassName='bg-body-bg-color'
                    body={
                        <Row className="mr0">
                            <Col sm={8}>
                                <div className='brandform-leftview web-field-track-modal-leftview'>
                                    <div className='top-heading web-top-heading'></div>
                                    <div
                                        className={`${isEditEvent ? 'click-off' : ''} css-scrollbar pr0 w-100 body-image`}
                                >
                                    <div
                                        className="P mx-auto"
                                        style={{
                                            width: '100%',
                                            height: imageDetails?.imageData?.height || 0,
                                            backgroundImage: `url(${imageDetails?.imageData?.imageData})`,
                                            zoom: 0.65,
                                                position: 'relative',
                                                backgroundSize: 'cover',
                                        }}
                                    >
                                        {isRenderWebField && <CreateWebField />}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={4} className='d-flex flex-column pr0 position-relative css-scrollbar web-field-track-form-view'>
                            <span className='web-field-track-form-view css-scrollbar'>

                                <div className="align-items-center border-blr0 border-bottom-0 border-brr0 box-design d-flex justify-content-between py5">
                                    <h4 className="m0 lh0">
                                        {/* <i className={`${event_tracking_medium} icon-md color-primary-blue mr5`} /> */}
                                        {ADD_EVENTS}
                                    </h4>
                                    <div className="d-flex align-items-center">
                                        <RSSecondaryButton
                                            className={`mr10 ${!(isClickAlert || isEditEvent) ? 'click-off' : ''}`}
                                            onClick={() => {
                                                if (isClickAlert || isEditEvent) {
                                                    reset({
                                                        eventname: '',
                                                        trackingType: '',
                                                        inputType: '',
                                                        description: '',
                                                        markAsGoal: false,
                                                    });
                                                    setEditEvent(false);
                                                    setClickAlert(true);
                                                    setDisableForm(true);
                                                }
                                            }}
                                        >
                                            Cancel
                                        </RSSecondaryButton>
                                        <RSPrimaryButton
                                            className={`${!(isClickAlert || isEditEvent) || (events?.length === 25 && !isEditEvent) ? 'click-off' : ''} fs6 px15 py2`}
                                            onClick={handleSubmit((formState) => {
                                                if ((isClickAlert || isEditEvent) && !(events?.length === 25 && !isEditEvent)) {
                                                        // console.log('formState: ', formState);
                                                        if (!isEditEvent) {
                                                            const eventId = uuid(); // Generate ONE ID for this event
                                                            
                                                        
                                                            const trackingTypeValue = formState?.elementtype || formState?.trackingType;
                                                            const inputTypeValue = formState?.elementaction || formState?.inputType;
                                                            
                                                            let temp = [...imageDetails?.controlsArray];
                                                            let selectField = {};
                                                            temp.map((item) => {
                                                                if (item.viewId === imageDetails?.selectElement?.viewId) {
                                                                    item.select = true;
                                                                    selectField = item;
                                                                }
                                                            });
                                                            let stemp = [...imageDetails?.selectControls];
                                                            stemp.map((item) => {
                                                                if (item.viewId === imageDetails?.selectElement?.viewId) {
                                                                    item.select = true;
                                                                    item.click = true;
                                                                    selectField = item;
                                                                }
                                                            });
                                                            let eleArray = [...imageDetails?.elementArray];
                                                            let obj = {
                                                                field: selectField,
                                                                //eventTracking: eventsSocketData?.event,
                                                                eventTracking: {
                                                                    id: eventId, 
                                                                    eventname: formState?.eventname,
                                                                    trackingType: trackingTypeValue,
                                                                    inputType: inputTypeValue,
                                                                    description: formState?.description,
                                                                    markAsGoal: formState?.markAsGoal,
                                                                    viewId: selectField?.viewId,
                                                                },
                                                                eventTrackingTemp: {
                                                                    id: eventId, // Use same ID
                                                                    eventname: formState?.eventname,
                                                                    trackingType: trackingTypeValue,
                                                                    inputType: inputTypeValue,
                                                                    description: formState?.description,
                                                                    markAsGoal: formState?.markAsGoal,
                                                                },
                                                            };
                                                            eleArray.push(obj);
                                                            // console.log('eleArray: ', eleArray);
                                                            var markAsGoal = false;
                                                            eleArray.map((item) => {
                                                                if (item?.eventTracking?.markAsGoal === true) {
                                                                    markAsGoal = true;
                                                                }
                                                            });
                                                            setImageDetails((prev) => ({
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
                                                            setEvents((prev) => [
                                                                ...prev,
                                                                {
                                                                    id: eventId, // Use same ID
                                                                    eventname: formState?.eventname,
                                                                    trackingType: trackingTypeValue,
                                                                    inputType: inputTypeValue,
                                                                    description: formState?.description,
                                                                    markAsGoal: formState?.markAsGoal,
                                                                    viewId: selectField?.viewId,
                                                                },
                                                            ]);
                                                            reset({
                                                                eventname: '',
                                                                trackingType: [],
                                                                inputType: [],
                                                                description: '',
                                                                markAsGoal: false,
                                                                screenTrackMinutes: '',
                                                                screenTrackLength: '',
                                                                screenFilter: false,
                                                            });
                                                            setEditEvent(false);
                                                        } else if (isEditEvent) {
                                                            // Handle different field names for Click vs other types
                                                            const trackingTypeValue = formState?.elementtype || formState?.trackingType;
                                                            const inputTypeValue = formState?.elementaction || formState?.inputType;
                                                            
                                                            setEvents((prev) => {
                                                                let update = prev.map((item) =>
                                                                    item.id === formState?.id
                                                                        ? {
                                                                              ...item,
                                                                              eventname: formState?.eventname,
                                                                              trackingType: trackingTypeValue,
                                                                              inputType: inputTypeValue,
                                                                              description: formState?.description,
                                                                              markAsGoal: formState?.markAsGoal,
                                                                          }
                                                                        : { ...item },
                                                                );
                                                                return update;
                                                            });
                                                            
                                                            // Update elementArray as well
                                                            setImageDetails((prev) => {
                                                                let updatedElementArray = prev?.elementArray?.map((item) =>
                                                                    item?.eventTracking?.id === formState?.id
                                                                        ? {
                                                                              ...item,
                                                                              eventTracking: {
                                                                                  ...item.eventTracking,
                                                                                  eventname: formState?.eventname,
                                                                                  trackingType: trackingTypeValue,
                                                                                  inputType: inputTypeValue,
                                                                                  description: formState?.description,
                                                                                  markAsGoal: formState?.markAsGoal,
                                                                              },
                                                                              eventTrackingTemp: {
                                                                                  ...item.eventTrackingTemp,
                                                                                  eventname: formState?.eventname,
                                                                                  trackingType: trackingTypeValue,
                                                                                  inputType: inputTypeValue,
                                                                                  description: formState?.description,
                                                                                  markAsGoal: formState?.markAsGoal,
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
                                                            
                                                            reset({
                                                                eventname: '',
                                                                trackingType: [],
                                                                inputType: [],
                                                                description: '',
                                                                markAsGoal: false,
                                                            });
                                                            setEditEvent(false);
                                                        }
                                                        setDisableForm(true);
                                                    }
                                                })}
                                        >
                                            {isEditEvent ? 'Update' : 'Add'}
                                        </RSPrimaryButton>
                                    </div>
                                </div>
                                <div className={`box-design no-box-shadow ${isEdit ? 'pe-none click-off' : ''} overflow-x-visible field-tracking-form-view css-scrollbar border-tlr0 border-trr0`}>
                                    <div className={`${!isClickAlert && !isEditEvent ? 'pe-none click-off' : ''} ${isDisableForm ? 'pe-none click-off' : ''}`}>
                                        <div>
                                            <h4 className="mb15">
                                                {/* <i
                                                    className={`${event_tracking_medium} icon-md color-primary-blue`}
                                                />{' '} */}
                                                Screen track
                                            </h4>
                                            <Row>
                                                <Col sm={5}>
                                            <RSKendoDropDownList
                                                control={control}
                                                required
                                                name={'screenTrackMinutes'}
                                                data={screenTrackingMinutesOptions || []}
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
                                        {/* )} */}
                                        <h4 className="mt15 mb0">
                                            {/* <i
                                                className={`${event_tracking_medium} icon-md color-primary-blue`}
                                            />{' '} */}
                                            Event
                                        </h4>
                                        <div
                                            className={`${
                                                imageDetails?.selectControls?.length > 0 ? '' : 'pe-none click-off'
                                            }`}
                                        >
                                            <div className="form-group mt15">
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
                                                                isEditEvent,
                                                            );
                                                        },
                                                    }}
                                                />
                                            </div>
                                            {checkCategoryType(imageDetails?.selectElement?.category) === 2 && (
                                                <>
                                                    <Row>
                                                        <Col sm={6}>
                                                    <div className="form-group">
                                                        <RSInput
                                                            control={control}
                                                            name={'elementtype'}
                                                            label={'Capture type'}
                                                            required
                                                            className={'click-off'}
                                                        />
                                                    </div>
                                                        </Col>
                                                        <Col sm={6}>
                                                    <div className="form-group">
                                                        <RSInput
                                                            control={control}
                                                            name={'elementaction'}
                                                            label={'Element action'}
                                                            required
                                                            className={'click-off'}
                                                        />
                                                    </div>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}
                                            {checkCategoryType(imageDetails?.selectElement?.category) === 1 && (
                                                <>
                                                    <Row
                                                        className={`${
                                                            imageDetails?.selectElement?.viewType === 'Others'
                                                                ? 'click-off'
                                                                : ''
                                                        }`}
                                                    >
                                                        <Col sm={6}>
                                                            <div className="form-group">
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
                                                            <div className="form-group">
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
                                                </>
                                            )}
                                            <div className="form-group mb0">
                                                <RSTextarea
                                                    control={control}
                                                    name={'description'}
                                                    placeholder={DESCRIPTION}
                                                    maxLength="250"
                                                    className='addEventTextarea'
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
                                                    labelName={'Mark as goal'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${isEditEvent ? 'click-off' : ''}`}>
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
                                                    title: 'Event name',
                                                    width: 130,
                                                    cell: ({ dataItem }) => {
                                                        const charLimit = 15;
                                                        
                                                        return (
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="mr10">
                                                                        {dataItem?.eventname?.length > charLimit ? (
                                                                            <RSTooltip
                                                                                text={dataItem?.eventname}
                                                                                position="top"
                                                                            >
                                                                                <span>{truncateTitle(dataItem?.eventname, charLimit)}</span>
                                                                </RSTooltip>
                                                                        ) : (
                                                                            <span>{dataItem?.eventname}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        );
                                                    },
                                                },
                                                {
                                                    field: 'trackingType',
                                                    title: 'Action',
                                                    width: 100,
                                                    cell: ({ dataItem }) => {
                                                        const charLimit = 12;
                                                        const value = dataItem?.elementtype || dataItem?.trackingType || '';
                                                        
                                                        return (
                                                            <td>
                                                                {value?.length > charLimit ? (
                                                                    <RSTooltip
                                                                        text={value}
                                                                        position="top"
                                                                    >
                                                                        <span>{truncateTitle(value, charLimit)}</span>
                                                                    </RSTooltip>
                                                                ) : (
                                                                    <span>{value}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    },
                                                },
                                                {
                                                    field: 'actions',
                                                    title: 'Actions',
                                                    width: 100,
                                                    cell: ({ dataItem, dataIndex }) => (
                                                        <td>
                                                            <div className="d-flex justify-content-end align-items-center">
                                                                <RSTooltip
                                                                    text="Edit event"
                                                                    position="top"
                                                                    className="lh0 mr10"
                                                                >
                                                                    <i
                                                                        id="rs_data_circle_pencil"
                                                                        className={`${pencil_edit_medium} icon-md color-primary-blue `}
                                                                        onClick={(e) => {
                                                                            const eventData = events[dataIndex];
                                                                            
                                                                            // Find element to determine category type
                                                                            let temp = [
                                                                                ...imageDetails.controlsArray,
                                                                            ];

                                                                            let se = {};
                                                                            let eleId =
                                                                                editEventList?.['elementArray']?.[
                                                                                    dataIndex
                                                                                ]?.['field']?.['id'];

                                                                            let fItem = temp.filter(
                                                                                (obj) => obj.id === eleId,
                                                                            );
                                                                            se = fItem[0];
                                                                            const isClickType = checkCategoryType(se?.category) === 2;
                                                                            const trackingValue = dataItem?.elementtype || eventData?.trackingType;
                                                                            const inputValue = dataItem?.elementaction || eventData?.inputType;
                                                                            reset({
                                                                                ...eventData,
                                                                                ...(isClickType ? {
                                                                                    elementtype: trackingValue,
                                                                                    elementaction: inputValue,
                                                                                } : {
                                                                                    trackingType: trackingValue,
                                                                                    inputType: inputValue,
                                                                                }),
                                                                            });
                                                                            
                                                                            setEditEvent(true);
                                                                            setDisableForm(false);
                                                                            
                                                                            setImageDetails({
                                                                                ...imageDetails,
                                                                                selectElement: se,
                                                                                event: {
                                                                                    eventname: eventData?.eventname || '',
                                                                                    trackingType: trackingValue || '',
                                                                                    inputType: inputValue || '',
                                                                                    description: eventData?.description || '',
                                                                                    markAsGoal: eventData?.markAsGoal || false,
                                                                                },
                                                                            });
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                                {dataItem?.markAsGoal && (
                                                                    <RSTooltip
                                                                        text="Mark as goal"
                                                                        position="top"
                                                                        className="mr10 lh0"
                                                                    >
                                                                        <i
                                                                            className={`${goal_achieved_medium} icon-md color-primary-green cursor-default`}
                                                                        />
                                                                    </RSTooltip>
                                                                )}
                                                               
                                                                <RSTooltip
                                                                    text="Delete"
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

                                                                            setImageDetails((prev) => {
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
                                                                                    ...(dataItem?.markAsGoal && {
                                                                                        IsmarkAsGoal: false,
                                                                                    }),
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
                            <div className='modal-footer position-absolute bottom18 right25 pb0 pr0 mr-10'>
                            <RSSecondaryButton onClick={() => {
                                removeWebftParam();
                                handleModalClose();
                            }}>Cancel</RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                        className={`${!events?.length ? 'click-off' : ''}`}
                                onClick={() => {
                                            if (events?.length) {
                                                const hasMarkAsGoal = events?.some(event => event?.markAsGoal === true);
                                                if (!hasMarkAsGoal) {
                                                    setShowMarkAsGoalAlert(true);
                                                    return;
                                                }
                                                removeWebftParam();
                                                onWebFieldTrackSubmit(imageDetails, events);
                                            }
                                }}
                            >
                                Save
                            </RSPrimaryButton>
                        </div>

                        </Row>
                    }
                />
                {showMaxEventsAlert &&
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
                    }}
                />
                }
                {showMarkAsGoalAlert && 
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
                }
            </>
        )
    );
};

export default WebFieldTrack;
