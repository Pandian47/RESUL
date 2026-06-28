import { SELECT_DEVICE_TYPE, SELECT_MOBILE_APP } from 'Constants/GlobalConstant/ValidationMessage';
import { CLICK_TO_CONFIGURE, DEVICE_TYPE, EDIT, MOBILE_APP, RESET } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_down_medium, circle_arrow_up_medium, circle_plus_fill_edge_medium, event_tracking_medium, pencil_edit_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Accordion, Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';

import EventTrackModal from './EventTrackModal';
import AppBrandownFormTable from './AppBrandOwnFormTable';
const AppFieldTrack = ({ updateData, appDeviceList, appList, isAppEdit, editData, onRefresh }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const [isShow, setShow] = useState(false);
    const [showEvent, setShowEvent] = useState([]);
    const [selectedApp, setSelectedApp] = useState([]);
    const [deviceTypeName, setDeviceTypeName] = useState('');
    const [eventsSocketData, setEventSocketData] = useState({});
    const { control, setValue, getValues, reset, resetField, watch } = useFormContext();

    const { fields, append } = useFieldArray({ control, name: 'mobileForm' });
    useEffect(() => {
        if (editData?.eventsSocketData) {
            setEventSocketData(editData.eventsSocketData);
        }
        if (editData?.events) {
            setShowEvent(editData.events);
        }
    }, [editData]);

    useEffect(() => {
        return () => {
            resetField('deviceType');
            resetField('appName');
        };
    }, []);

    const accordianIcon = (index) => {
        return activeIndex === index
            ? `${circle_arrow_up_medium} icon-md rs-accordion-icon-collapse`
            : `${circle_arrow_down_medium} icon-md rs-accordion-icon-expand`;
    };
    // const EventTrack = useMemo(() => {
    //     if (isShow) {
    //         return (

    //         );
    //     }
    // }, [isShow]);
    const handleDelete = (deleteItem) => {
                const fileteItem = showEvent.filter((item) => item.id !== deleteItem.id);
        setShowEvent(fileteItem);
        updateData({ eventsSocketData: eventsSocketData?.eventsSocketData, events: fileteItem });
    };
    return (
        <>
            <Accordion className="form-group no-box-shadow" defaultActiveKey="0">
                {fields.map((fields, index) => {
                    return (
                        <Accordion.Item eventKey="0" key={index}>
                            <Accordion.Header 
                            
                                onClick={() => {
                                   setActiveIndex(activeIndex === index ? null : index);
                                }}
                            >
                                <i className={accordianIcon(index)} />
                                <span>
                                    {getValues(`mobileForm[${index}].deviceType`)?.value
                                        ? getValues(`mobileForm[${index}].deviceType`)?.value
                                        : 'Device type'}
                                </span>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={3}>
                                            <label className="control-label-left">{DEVICE_TYPE}</label>
                                        </Col>
                                        <Col md={7} className='pr0'>
                                            <RSKendoDropDownList
                                                control={control}
                                                name={`mobileForm[${index}].deviceType`}
                                                data={appDeviceList}
                                                dataItemKey={'id'}
                                                textField={'value'}
                                                label={DEVICE_TYPE}
                                                required
                                                rules={{ required: SELECT_DEVICE_TYPE }}
                                                handleChange={({ value }) => {
                                                    setValue(`mobileForm[${index}].appName`, {});
                                                    setDeviceTypeName(value?.value);
                                                    setSelectedApp([]);
                                                }}
                                                disabled={
                                                    isAppEdit || getValues(`mobileForm[${index}].events`)?.length
                                                        ? true
                                                        : false
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <div className="form-group mb0">
                                    <Row >
                                        <Col sm={3}>
                                            <label className="control-label-left">{MOBILE_APP}</label>
                                        </Col>
                                        <Col md={7} className='pr0'>
                                            <RSKendoDropDownList
                                                control={control}
                                                name={`mobileForm[${index}].appName`}
                                                data={appList}
                                                dataItemKey={'appId'}
                                                textField={'appName'}
                                                label={MOBILE_APP}
                                                required
                                                rules={{ required: SELECT_MOBILE_APP }}
                                                handleChange={({ value }) => {
                                                                                                        setSelectedApp(value);
                                                }}
                                                disabled={
                                                    isAppEdit || getValues(`mobileForm[${index}].events`)?.length
                                                        ? true
                                                        : false
                                                }
                                            />
                                        </Col>
                                        <Col sm={1} className={`fg-icons-wrapper d-flex`}>
                                            {isAppEdit || getValues(`mobileForm[${index}].events`)?.length ? (
                                                <div className="fg-icons d-flex mr15">
                                                    <RSTooltip text={EDIT} className='lh0'>
                                                        <i
                                                            className={`${pencil_edit_medium} icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                
                                                                // setShow(true);
                                                                setValue(`mobileForm[${index}].modalShow`, true);
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                </div>
                                            ) : null}
                                            <div className="fg-icons d-flex">
                                                {isAppEdit || getValues(`mobileForm[${index}].events`)?.length ? (
                                                    <RSTooltip text={RESET}>
                                                        <i
                                                            className={`${restart_medium} icon-md color-primary-blue `}
                                                            onClick={() => {
                                                                                                                                onRefresh();
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                ) : (
                                                    <RSTooltip text={CLICK_TO_CONFIGURE} className='lh0'>
                                                        <div
                                                            className={`${
                                                                !watch(`mobileForm[${index}].appName`)
                                                                    ? 'pe-none click-off'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <i
                                                                className={`${event_tracking_medium} icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                                                                                        // setShow(true);
                                                                    setValue(`mobileForm[${index}].modalShow`, true);
                                                                }}
                                                            />
                                                        </div>
                                                    </RSTooltip>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                {getValues(`mobileForm[${index}].events`)?.length ? (
                                    <AppBrandownFormTable
                                        eventData={getValues(`mobileForm[${index}].events`)}
                                        // onDelete={(item) => handleDelete(item)}
                                    />
                                ) : null}
                            </Accordion.Body>
                            {watch(`mobileForm[${index}].modalShow`) && (
                                <EventTrackModal
                                    show={getValues(`mobileForm[${index}].modalShow`)}
                                    type="mobile"
                                    defaultEvents={{
                                        eventsSocketData: {
                                            eventsSocketData: getValues(`mobileForm[${index}].data`),
                                            events: getValues(`mobileForm[${index}].events`),
                                        },
                                    }}
                                    appDetails={{
                                        ...(isAppEdit || getValues(`mobileForm[${index}].events`)?.length 
                                            ? getValues(`mobileForm[${index}].appName`) 
                                            : selectedApp),
                                        deviceType: getValues(`mobileForm[${index}].deviceType`),
                                    }}
                                    isAppEdit={
                                        isAppEdit || getValues(`mobileForm[${index}].events`)?.length ? true : false
                                    }
                                    handleClose={(e) => {
                                        // setShow(false);
                                        // setValue(`${name}.show`, false);
                                        setValue(`mobileForm[${index}].modalShow`, false);
                                    }}
                                    onSave={(events, eventsSocketData) => {
                                                                                                                        // setValue(`primaryGoal[0].events`, events);
                                        // setValue(`${name}.events`, events);
                                        // setValue(`${name}.eventstemp`, eventstemp);
                                        // setValue(`engagementPrimaryGoal[0].events`, events);
                                        // setValue(`engagementPrimaryGoal[0].eventstemp`, eventstemp);
                                        // setValue(`primaryGoal[0].eventstemp`, eventsSocketData);

                                        setShowEvent(events);
                                        setEventSocketData(eventsSocketData);
                                        updateData({ eventsSocketData, events });
                                        // setValue(`${name}.show`, true);
                                        // setShow(false);
                                        setValue(`mobileForm[${index}].data`, eventsSocketData);
                                        setValue(`mobileForm[${index}].events`, events);
                                        setValue(`mobileForm[${index}].modalShow`, false);
                                    }}
                                />
                            )}
                        </Accordion.Item>
                    );
                })}
                {/* <RSTooltip
                    text="Add mobile device"
                    position="top"
                    className="rs-sl-add-icon position-absolute  right15 lh0"
                >
                    <i
                        id="rs_data_circle_plus_fill_edge"
                        className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue ${
                            !watch(`mobileForm[0].data`) ? 'click-off' : ''
                        }`}
                        onClick={() => {
                            append({ deviceType: '', appName: '', data: {}, events: {}, modalShow: false });
                        }}
                    />
                </RSTooltip> */}
            </Accordion>

            {/* {isShow && EventTrack} */}
        </>
    );
};

export default AppFieldTrack;
