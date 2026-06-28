import { truncateTitle } from 'Utils/modules/displayCore';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { TRACKING_TYPE } from './constant';
import { MAX_LENGTH45 } from 'Constants/GlobalConstant/Regex';
import { DIGIPOP_ATTRIBUTE, FRIENDLY_NAME as FRIENDLY_NAME_MSG, SELECT_TRACKING_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_FORM_ELEMENT, FRIENDLY_NAME, MANDATORY, WARNING } from 'Constants/GlobalConstant/Placeholders';
import { delete_medium, event_tracking_medium, mandatory_mini, mark_as_submit_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { Row, Col } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';

import RSModal from 'Components/RSModal';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropDown';
import NewAttributeFormBtn from '../../../Components/NewAttributeFormBtn/NewAttributeFormBtn';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';

import RSInput from 'Components/FormFields/RSInput';

import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTooltip from 'Components/RSTooltip';
import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import useQueryParams from 'Hooks/useQueryParams';

import { checkCategoryType, FriendlyNameDuplicateValidate, calculateCharLimit } from './constant';

import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { getDataAttributes, saveDataAttribute } from 'Reducers/preferences/datacatalogue/request';
import { getAttribute } from 'Pages/AuthenticationModule/Audience/Pages/AddImportAudience/constant';

import { mapToItemRender } from 'Pages/AuthenticationModule/Components/NewAttributeModal/constant';
import RSKendoGrid from 'Components/RSKendoGrid';

const WebFieldTrack = ({ show, onWebFieldTrackSubmit, editEventList, handleModalClose }) => {
    var socket;
    var client;
    const locationState = useQueryParams('/communication');
    const searchParam = useSearchParams();
    const dispatch = useDispatch();
    const { control, formState, handleSubmit, setValue, reset, watch, clearErrors } = useForm();

    const [isClickAlert, setClickAlert] = useState(false);
    const [attributeList, setAttributeList] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [isRenderWebField, setRenderWebField] = useState(false);
    const [isShowModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [isEditEvent, setEditEvent] = useState(false);
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

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { dataCatalogueAttrs } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);
    const [currentAttrList, setCurrentAttrList] = useState([]);
    const [isShowNewAttrModal, setShowNewAttrModal] = useState(false);
    const [mandatoryEnabled, setMandatoryEnabled] = useState(false);
    const [isDisableForm, setDisableForm] = useState(false);
    const [showMarkAsSubmitAlert, setShowMarkAsSubmitAlert] = useState(false);
    const [showMandatoryAlert, setShowMandatoryAlert] = useState(false);
    const [showMaxEventsAlert, setShowMaxEventsAlert] = useState(false);
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
        if (events?.length) {
            let eventNameList = events.map((item) => item.attributeType?.dataAttributeId);
                        let attrList = attributeList.filter((item) => !eventNameList.includes(item?.dataAttributeId));
                        setCurrentAttrList(attrList);
        }
    }, [events?.length, dataCatalogueAttrs]);
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
        if (myParam) webSocketInit();
        else {
            setImageDetails(editEventList);
            const eventList = editEventList?.eventList;
            setEvents(eventList);
        }
    }, [locationState, editEventList]);
    useEffect(() => {
                if (imageDetails?.controlsArray?.length) {
            setRenderWebField(true);
        }
    }, [imageDetails?.controlsArray?.length]);

    useEffect(() => {
        if (checkCategoryType(imageDetails?.selectElement?.category) === 2) {
            setValue('elementtype', 'Click');
            setValue('elementaction', 'Yes');
        }
    }, [imageDetails?.selectElement?.category, isEditEvent]);
    useEffect(() => {
        setShowModal(show);
    }, [show]);

    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        const rslt = dispatch(getDataAttributes(payload, true, false, 'BrandForm'));
            }, [departmentId, clientId, userId]);
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
                    clearErrors();
                    if (item?.select === true) {
                        setClickAlert(false);
                        reset({
                            eventname: '',
                            attributeType: null,
                            trackingType: '',
                            inputType: '',
                            description: '',
                            markAsGoal: false,
                            screenTrackMinutes: '',
                            screenFilter: false,
                            screenTrackLength: '',
                        });
                        setMandatoryEnabled(false);
                        setEditEvent(false);
                        return;
                    }
                    if (events?.length >= 25) {
                        setShowMaxEventsAlert(true);
                        return;
                    }
                    setClickAlert(true);
                    setDisableForm(false);
                    clearErrors();
                    reset({
                        eventname: '',
                        attributeType: null,
                        trackingType: '',
                        inputType: '',
                        description: '',
                        markAsGoal: false,
                        screenTrackMinutes: '',
                        screenFilter: false,
                        screenTrackLength: '',
                    });
                    setMandatoryEnabled(false);
                    setEditEvent(false);
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
        const param = searchParams.get('_sdxFormId');
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
                if (data.status) {
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
                // this.setState({ controlsArray: data.data.PageContentJson });
                setImageDetails({
                    ...imageDetails,
                    currentActivity: data.domainName,
                    currentImg: imageData.imageData,
                    imageData: imageData,
                    controlsArray: data.data.PageContentJson,
                });
                // data.data.receiverInfo.PageContentJson.forEach(el => {
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
                // document.querySelector("img#captured_img").src = data.image;
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
                // this.setState({ controlsArray: data.data.PageContentJson });
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
        isShowModal && (
            <>
                <RSModal
                    show={isShowModal}
                    handleClose={handleModalClose}
                    header={'Brand owned form'}
                    // noBottomBorder
                    isHeaderTitle
                    closeTooltipPosition
                    // isHeaderTitle={false}
                    size="fullscreen"
                    className="px0 fullscreen_popup border-0"
                    bodyClassName={'heightFix'}
                    headerClassName='py10'
                    isCloseButton={false}
                    body={
                        <Row className="mr0">
                            <Col sm={8}>
                      <div className='brandform-leftview'>
                      <div className='top-heading web-top-heading'>
                            {/* <h2 className='color-primary-blue'>Brand-owned form</h2> */}
                          </div>
                                <div
                                    className={`${isEditEvent ? 'click-off' : ''} css-scrollbar pr0 w-100 body-image`}
                                    // style={{
                                    //     height: '74vh',
                                    //     // height: '98vh',
                                    // }}
                                >
                                    <div
                                        className="P mx-auto"
                                        //style={{ width: this.state?.imageData?.width || 0, height: this.state?.imageData?.height || 0, backgroundImage: `url(${this.state?.imageData?.imageData})` }}
                                        style={{
                                            width: '100%',
                                            height: imageDetails?.imageData?.height || 0,
                                            backgroundImage: `url(${imageDetails?.imageData?.imageData})`,
                                            zoom: 0.65,
                                            position: 'relative',
                                            backgroundSize: 'cover',
                                            // backgroundPosition: '-8px 3px',
                                            // marginTop: '29px',
                                        }}
                                        // style={{ width: '100%', height: 680, backgroundImage: `url(${this.state?.imageData?.imageData})`,backgroundSize:'cover',backgroundRepeat:'no-repeat',position:'relative' }}
                                    >
                                        {isRenderWebField && <CreateWebField />}
                                    </div>
                                </div>
                      </div>
                            </Col>

                            <Col
                                sm={4}
                                className='d-flex flex-column pr0 position-relative'
                            >
                                {/* {isClickAlert && (
                                    <h4 className="color-primary-red text-center mt18 mb10">
                                        Click event should be two
                                    </h4>
                                )} */}
                                   <div>
                                           <h2 className="color-secondary-blue pb8">
                                                                                <i
                                                                                    className={`${event_tracking_medium} icon-md color-primary-blue mr5`}
                                                                                />
                                                                                {ADD_FORM_ELEMENT}
                                                                            </h2>
                                        </div>
                                <div className={`box-design no-box-shadow ${isEdit ? 'pe-none click-off' : ''} overflow-x-visible field-tracking-form-view css-scrollbar`}>
                                    <div
                                        className={`${!isClickAlert && !isEditEvent ? 'pe-none click-off' : ''} ${
                                            isDisableForm ? 'pe-none click-off' : ''
                                        }`}
                                    >
                                       
                                        <div
                                            className={`${
                                                imageDetails?.selectControls?.length > 0 ? '' : 'pe-none click-off'
                                            }`}
                                        >
                                            <div className="form-group mt10">
                                                <RSInput
                                                    control={control}
                                                    name={'eventname'}
                                                    required
                                                    isFormMandatoryTooltip
                                                    iconPlaceholderText={MANDATORY}
                                                    placeholder={FRIENDLY_NAME}
                                                    maxLength={MAX_LENGTH45}
                                                    customTooltipClassName='top5'
                                                    rules={{
                                                        required: FRIENDLY_NAME_MSG,
                                                        validate: (value) => {
                                                            return FriendlyNameDuplicateValidate(
                                                                value,
                                                                events,
                                                                currentFormState,
                                                                isEditEvent,
                                                            );
                                                        },
                                                    }}
                                                    // customIconClassname='position-absolute top5'
                                                    iconName={`${mandatory_mini} `}
                                                    iconPlaceholder={true}
                                                    handlePlaceholderIconClick={() =>
                                                        setMandatoryEnabled((prev) => !prev)
                                                    }
                                                    iconColor={mandatoryEnabled ? 'color-primary-red' : ''}
                                                    iconSize={'icon-xs'}
                                                />
                                            </div>
                                            <Row>
                                                <Col sm={6}>
                                                 <div className="form-group mb0">
                                                {/* <RSKendoDropDown */}
                                                <RSKendoDropDown
                                                    name={`attributeType`}
                                                    data={currentAttrList}
                                                    isCustomRender
                                                    itemRender={(ele, props) => mapToItemRender(ele, props, [])}
                                                    control={control}
                                                    required
                                                    textField={'attributeName'}
                                                    dataItemKey={'dataAttributeId'}
                                                    label={'Attribute'}
                                                    // popupSettings={{
                                                    //     popupClass: `addImportAudienceDropdownListContainer`,
                                                    // }}
                                                    rules={{
                                                        required: DIGIPOP_ATTRIBUTE,
                                                    }}
                                                    //   handleChange={handleChangeAtt}
                                                    footer={
                                                        <NewAttributeFormBtn
                                                            title="New attribute"
                                                            handleModalAttribute={() => setShowNewAttrModal(true)}
                                                        />
                                                    }
                                                />
                                            </div>
                                                </Col>

                                           
                                            <Col sm={6}>
                                            {checkCategoryType(imageDetails?.selectElement?.category) === 2 && (
                                                <>
                                                    <div className="form-group mb0">
                                                        <RSInput
                                                            control={control}
                                                            name={'elementtype'}
                                                            label={'Capture type'}
                                                            required
                                                            className={'click-off'}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            {checkCategoryType(imageDetails?.selectElement?.category) === 1 && (
                                                <>
                                                    <div
                                                        className={`${
                                                            imageDetails?.selectElement?.viewType === 'Others'
                                                                ? 'click-off'
                                                                : ''
                                                        } form-group mb0`}
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
                                                            imageDetails?.selectElement?.viewType === 'Others'
                                                                ? 'click-off'
                                                                : ''
                                                        } form-group mb0`}
                                                    ></div>
                                                </>
                                            )}

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
                                                    labelName={'Mark as submit'}
                                                />
                                            </div>
                                            </Col>
                                            </Row>
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
                                                    clearErrors();
                                                    setEditEvent(false);
                                                    setClickAlert(true);
                                                    setDisableForm(true);
                                                    setMandatoryEnabled(false);
                                                }}
                                            >
                                                Cancel
                                            </RSSecondaryButton>
                                            <RSPrimaryButton
                                                onClick={handleSubmit((formState) => {
                                                    // console.log('formState: ', formState);
                                                    if (!isEditEvent) {
                                                        const eventId = uuid(); // Generate ONE ID for this event
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
                                                                    screenTrackCond: formState?.screenFilter
                                                                        ? 'And'
                                                                        : 'Or',
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
                                                        // setEventsSocketData((prev) => ({
                                                        //     ...prev,
                                                        //     IsmarkAsGoal: markAsGoal,
                                                        //     selectControls: stemp,
                                                        //     elementArray: eleArray,
                                                        //     selectElement: [],
                                                        //     event: {},
                                                        //     markAsGoal: markAsGoal,
                                                        //     screenTracking: {
                                                        //         minDuration: formState?.screenTrackMinutes,
                                                        //         screenTrackCond: formState?.screenFilter ? 'And' : 'Or',
                                                        //         minLength: formState?.screenTrackLength,
                                                        //     },
                                                        // }));
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
                                                                ...formState,
                                                                mandatory: mandatoryEnabled,
                                                                viewId: selectField?.viewId,
                                                            },
                                                        ]);
                                                        reset({
                                                            eventname: '',
                                                            trackingType: [],
                                                            inputType: [],
                                                            description: '',
                                                            markAsGoal: false,
                                                        });
                                                        clearErrors();
                                                        setEditEvent(false);
                                                    } else if (isEditEvent) {
                                                        setEvents((prev) => {
                                                            let update = prev.map((item) =>
                                                                item.id === formState?.id
                                                                    ? {
                                                                          ...item,
                                                                          ...formState,
                                                                          mandatory: mandatoryEnabled,
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
                                                                              ...formState,
                                                                              mandatory: mandatoryEnabled,
                                                                          },
                                                                          eventTrackingTemp: {
                                                                              ...item.eventTrackingTemp,
                                                                              ...formState,
                                                                              mandatory: mandatoryEnabled,
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
                                                        clearErrors();
                                                        setEditEvent(false);
                                                    }
                                                    setDisableForm(true);
                                                    setMandatoryEnabled(false);
                                                })}
                                                className={`${events?.length === 25 && !isEditEvent ? 'click-off' : ''}`}
                                            >
                                                {isEditEvent ? 'Update' : 'Add'}
                                            </RSPrimaryButton>
                                        </div>
                                    </div>
                                </div>
                               <div className={`${isEditEvent ? 'click-off' : ''}`}> {events.length > 0 && (
                                        <RSKendoGrid
                                            data={events}
                                            isCustomClass='mt20 grid-table css-scrollbar'
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
                                                    width: 110,
                                                    cell: ({ dataItem }) => {
                                                        const charLimit = calculateCharLimit(110, dataItem?.mandatory);
                                                        
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
                                                                    {dataItem?.mandatory && (
                                                                        <RSTooltip text="Mandatory" position="top" className='ml-8 position-relative top-5 lh0' innerContent={false}>
                                                                            <i
                                                                                className={`${mandatory_mini} font-xxs color-primary-red cursor-default `}
                                                                            ></i>
                                                                        </RSTooltip>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    },
                                                },
                                                {
                                                    field: 'attributeType.attributeName',
                                                    title: 'Attribute',
                                                    width: 90,
                                                    cell: ({ dataItem }) => {
                                                        const charLimit = calculateCharLimit(90);
                                                        
                                                        return (
                                                            <td>
                                                                {dataItem?.attributeType?.attributeName?.length > charLimit ? (
                                                                    <RSTooltip
                                                                        text={dataItem?.attributeType.attributeName}
                                                                        position="top"
                                                                    >
                                                                        <span>{truncateTitle(dataItem?.attributeType.attributeName, charLimit)}</span>
                                                                    </RSTooltip>
                                                                ) : (
                                                                    <span>{dataItem?.attributeType.attributeName}</span>
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
                                                                            reset({
                                                                                ...eventData,
                                                                                trackingType: dataItem?.elementtype || eventData?.trackingType,
                                                                            });
                                                                            clearErrors();
                                                                            setEditEvent(true);
                                                                            setDisableForm(false);
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
                                                                            setImageDetails({
                                                                                ...imageDetails,
                                                                                selectElement: se,
                                                                                event: {
                                                                                    eventname: eventData?.eventname || '',
                                                                                    trackingType: dataItem?.elementtype || eventData?.trackingType || '',
                                                                                    inputType: dataItem?.elementaction || eventData?.inputType || '',
                                                                                    description: eventData?.description || '',
                                                                                    markAsGoal: eventData?.markAsGoal || false,
                                                                                },
                                                                            });
                                                                            if (dataItem?.mandatory) {
                                                                                setMandatoryEnabled(true);
                                                                            }
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                                {dataItem?.markAsGoal && (
                                                                    <RSTooltip
                                                                        text="Mark as submit"
                                                                        position="top"
                                                                        className="mr10 lh0"
                                                                    >
                                                                        <i
                                                                            className={`${mark_as_submit_medium} icon-md color-primary-blue`}
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
                                                                            clearErrors();
                                                                        }}
                                                                    />
                                                                </RSTooltip>
                                                            </div>
                                                        </td>
                                                    ),
                                                },
                                            ]}
                                        />
                                    )}</div>
                               <div className='modal-footer position-absolute bottom0 right0 pb0 pr0'>
                               <RSSecondaryButton onClick={handleModalClose}>Cancel</RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                className={`${!events?.length ? 'click-off' : ''}`}
                                onClick={() => {
                                    if (events?.length) {
                                        const hasMarkAsGoal = events?.some(event => event?.markAsGoal === true);
                                        if (!hasMarkAsGoal) {
                                            setShowMarkAsSubmitAlert(true);
                                            return;
                                        }
                                        const hasMandatory = events?.some(event => event?.mandatory === true);
                                        if (!hasMandatory) {
                                            setShowMandatoryAlert(true);
                                            return;
                                        }
                                        onWebFieldTrackSubmit({ ...imageDetails, eventList: events });
                                    }
                                }}
                            >
                                Save
                            </RSPrimaryButton>
                               </div>
                            </Col>
                        </Row>
                    }
                    // footer={
                    //     <>
                    //         <RSSecondaryButton onClick={handleModalClose}>Cancel</RSSecondaryButton>
                    //         <RSPrimaryButton
                    //             type="submit"
                    //             className={`${!events?.length ? 'click-off' : ''}`}
                    //             onClick={() => {
                    //                 onWebFieldTrackSubmit({ ...imageDetails, eventList: events });
                    //             }}
                    //         >
                    //             Save
                    //         </RSPrimaryButton>
                    //     </>
                    // }
                />
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
                {showMarkAsSubmitAlert && 
                <RSModal
                    show={showMarkAsSubmitAlert}
                    header={WARNING}
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
                }
                {showMandatoryAlert && 
                <RSModal
                    show={showMandatoryAlert}
                    header={WARNING}
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
                }
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
                }
            </>
        )
    );
};

export default WebFieldTrack;
