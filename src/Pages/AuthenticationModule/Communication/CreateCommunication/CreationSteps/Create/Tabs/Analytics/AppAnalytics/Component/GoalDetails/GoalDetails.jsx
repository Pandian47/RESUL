import { truncateTitle } from 'Utils/modules/displayCore';
import { MARK_AS_GOAL, NO_EVENTS_FOUND } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_plus_fill_medium, close_mini, event_tracking_medium, goal_achieved_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { Accordion, Row, Col } from 'react-bootstrap';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import EventTrackModal from '../../../../../Component/EventTrackModal';
import RSInput from 'Components/FormFields/RSInput';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    subScreenlistSelector,
    screenListSelector,
} from 'Reducers/communication/createCommunication/smartlink/selectors';
import { getSubScreenList } from 'Reducers/communication/createCommunication/smartlink/request';
import { getAnalyticsCaptureData } from 'Reducers/communication/createCommunication/Create/request';
import RSTooltip from 'Components/RSTooltip';
import RSKendoGrid from 'Components/RSKendoGrid';

import useQueryParams from 'Hooks/useQueryParams';
const GoalDetails = ({ fieldName }) => {
    const [isShow, setShow] = useState(false);
    const [isShowEvent, setShowEvent] = useState([]);
    const [editEventData, setEditEventData] = useState(null);
    const dispatch = useDispatch();
    const state = useQueryParams('/communication');
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { eventTrackData } = useSelector(({ smartLinkReducer }) => smartLinkReducer);
    const subScreenListTemp = useSelector((state) => subScreenlistSelector(state));
    const screenListTemp = useSelector((state) => screenListSelector(state));
    const getDeviceType = (device) => {
        if (device.startsWith('Android')) {
            return 'Android';
        }
        return 'iOS';
    };

    const handleEditEvents = async (mobileAppData) => {
        try {
            const deviceOs = getDeviceType(mobileAppData.mobilePlatform);
            
            const goalType = fieldName?.toLowerCase().includes('primary') ? 'P' : 'S';
            
            const payload = {
                campaignId: state?.campaignId?.toString() || '',
                deviceOs: deviceOs,
                deviceType: mobileAppData?.mobilePlatform,
                goalType: goalType
            };

            
            const response = await dispatch(getAnalyticsCaptureData({ payload }));
            
            if (response?.status && response?.data && response?.data?.length > 0) {
                // Parse the jsondata string and wrap it
                const apiDataItem = response?.data[0];
                const parsedJsonData = typeof apiDataItem.jsondata === 'string' 
                    ? JSON.parse(apiDataItem.jsondata) 
                    : apiDataItem.jsondata;
                
                setEditEventData({
                    jsondata: parsedJsonData
                });
                setShow(true);
            } else {
                // Still open the modal even if API fails
                setShow(true);
            }
        } catch (error) {
            // Still open the modal even if API fails
            setShow(true);
        }
    };

    const { control, setValue, getValues } = useFormContext();

    const [activeIndex, setActiveIndex] = useState(0);

    const { fields } = useFieldArray({
        name: fieldName,
        control,
    });

    const goals = useWatch({
        control,
        name: fieldName,
    });

    const accordianIcon = (index) =>
        activeIndex === index
            ? `${circle_minus_fill_medium} icon-md rs-accordion-icon-collapse`
            : `${circle_plus_fill_medium} icon-md rs-accordion-icon-expand`;

    // useEffect(() => {
    //     // setValue(`${name}.events`, eventTrackData[fieldName]);
    // setValue(`${fieldName}[0].events`, eventTrackData[fieldName]);
    // console.log('eventTrackData: ', eventTrackData);
    // }, [eventTrackData[fieldName]]);

    return (
        <Accordion activeKey={activeIndex} className="my20 offset-3 w-50">
            {fields.map((field, index) => {
                const name = `${fieldName}[${index}]`;
                const tempeventGoal = isShowEvent?.length > 0 ? isShowEvent : field.events;
                // console.log('tempeventGoal: ', tempeventGoal);
                // const tempeventGoal = eventTrackData[fieldName];
                //  setValue(`${fieldName}[${index}].events`, tempeventGoal);
                {
                    /* const { show, events, appScreen, appSubScreen, appGuid, eventstemp } = goals[index]; */
                }
                {
                    /* console.log('appScreens: ', subScreenListTemp[field.appScreen.screenName]); */
                }
                let ScreenList = screenListTemp[field.appGuid];
                const tempScreen = ScreenList ? [...ScreenList , { activityName: 0, screenName: 'Enter a new screen name' } ] : []
                return (
                    <Fragment key={field.id}>
                        <Accordion.Item eventKey={index}>
                            <Accordion.Header
                                onClick={() => {
                                    if (activeIndex === index) setActiveIndex(null);
                                    else setActiveIndex(index);
                                }}
                            >
                                <i className={accordianIcon(index)} />
                                <span>{field.mobilePlatform} </span>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className="form-group">
                                    <Row>
                                        <Col sm={5} className="text-right">
                                            <label className="control-label-left">Mobile platform</label>
                                        </Col>
                                        <Col md={5}>
                                            <RSKendoDropdown
                                                control={control}
                                                name={`${name}.mobilePlatform`}
                                                data={[]}
                                                required
                                                disabled
                                            />
                                            {/* <RSInput control={control} name={platform} disabled required /> */}
                                        </Col>
                                    </Row>
                                </div>
                                <div className={`form-group ${!field.appScreen? 'mb0':''}`}>
                                    <Row className="mt15">
                                        <Col sm={5} className="text-right">
                                            <label className="control-label-left">Mobile app</label>
                                        </Col>
                                        <Col md={5}>
                                            <RSKendoDropdown
                                                control={control}
                                                name={`${name}.mobileApp`}
                                                data={[]}
                                                required
                                                disabled
                                            />
                                            {/* <RSInput control={control} name={appName} disabled required /> */}
                                        </Col>
                                        <Col md={1}>
                                                {index === 0  && (
                                                    <div className="d-flex align-items-center">
                                                        {!(goals[0]?.events?.length > 0) && (
                                                        <RSTooltip text={'Event track'}>
                                                            <i
                                                                className={`${event_tracking_medium} icon-md color-primary-blue cursor-pointer`}
                                                                onClick={() => setShow(true)}
                                                            />
                                                        </RSTooltip>
                                                        )}
                                                        {goals[0]?.events?.length > 0 && (
                                                            <RSTooltip text={'Edit events'} className="ml10">
                                                                <i
                                                                    className={`${pencil_edit_medium} icon-md color-primary-blue cursor-pointer`}
                                                    onClick={() => handleEditEvents(goals[0])}
                                                                />
                                                            </RSTooltip>
                                                        )}
                                                    </div>
                                                )}
                                            </Col>
                                    </Row>
                                </div>
                                {field.appScreen && (
                                    <div className="form-group mb0">
                                        <Row className="mt15">
                                            <Col sm={5} className="text-right">
                                                <label className="control-label-left">Screen</label>
                                            </Col>
                                            <Col md={5}>
                                                {getValues(`${name}.customAppScreen`) ? (
                                                    <Fragment>
                                                        <RSInput
                                                            control={control}
                                                            name={`${name}.appScreenNew`}
                                                            required
                                                            rules={{
                                                                required: 'Enter a new screen name',
                                                            }}
                                                            className='pr25'
                                                        />
                                                        <RSTooltip text={'Close'} className='position-absolute right85 top5' innerContent={true}>
                                                        <i
                                                            id="rs_GoalDetails_close"
                                                            className={`${close_mini} icon-sm color-primary-red`}
                                                            onClick={() => {
                                                                setValue(`${name}.customAppScreen`, false);
                                                                setValue(`${name}.appScreen`, '');
                                                            }}
                                                        />
                                                        </RSTooltip>
                                                    </Fragment>
                                                ) : (
                                                    <RSKendoDropdown
                                                        control={control}
                                                        name={`${name}.appScreen`}
                                                        data={tempScreen}
                                                        required
                                                        dataItemKey={'activityName'}
                                                        textField={'screenName'}
                                                        handleChange={({ value }) => {
                                                            if (value?.screenName === 'Enter a new screen name') {
                                                                setValue(`${name}.customAppScreen`, true);
                                                            } else {
                                                                const payload = {
                                                                    userId,
                                                                    clientId,
                                                                    departmentId,
                                                                    mobileAppId: field.appGuid,
                                                                    deviceType: getDeviceType(
                                                                        getValues(`${name}.mobilePlatform`),
                                                                    ),
                                                                    screenName: value.screenName,
                                                                    mobileType: getValues(`${name}.mobilePlatform`),
                                                                };
                                                                dispatch(
                                                                    getSubScreenList({
                                                                        payload,
                                                                        field: value.screenName,
                                                                    }),
                                                                );
                                                            }
                                                        }}
                                                        //  disabled
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                                {field.appSubScreen && (
                                    <div
                                        className={`form-group ${
                                            field.mobilePlatform === 'iPad' || field.mobilePlatform === 'iPhone'
                                                ? 'd-none'
                                                : 'd-block'
                                        } `}
                                    >
                                        <Row className="mt15">
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">Sub screen</label>
                                            </Col>
                                            <Col md={6}>
                                                {getValues(`${name}.customAppScreen`) ? (
                                                    <Fragment>
                                                        <RSInput
                                                            control={control}
                                                            name={`${name}.subappScreenNew`}
                                                            placeholder={'Enter new sub screen'}
                                                            handleOnBlur={(e) => {
                                                                let temp = {
                                                                    subScreenName: e.target.value,
                                                                    deepLinkURL: '',
                                                                };
                                                                setValue(`${name}.subappScreen`, temp);
                                                            }}
                                                            // rules={{
                                                            //     required:
                                                            //         'Enter new sub screen',
                                                            // }}
                                                        />
                                                    </Fragment>
                                                ) : (
                                                    <RSKendoDropdown
                                                        control={control}
                                                        name={`${name}.appSubScreen`}
                                                        //  data={subScreentList}
                                                        // textField={'subScreenName'}
                                                        // required
                                                        data={subScreenListTemp[field.appScreen.screenName]}
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                )}
                                {/* {isShowEvent?.length > 0 ||
                                    (field.events?.length > 0 && (  */}
                                {goals[0].events?.length && index === 0  ? (
                                    <div className="form-group">
                                        <Row className="mt15">
                                            {/* <Col sm={4} className="text-right">
                                                <label className="control-label-left">Field track</label>
                                            </Col> */}
                                            <Col md={12}>
                                                <RSKendoGrid
                                                    data={tempeventGoal || []}
                                                    isCustomClass='webfieldtrack-grid-table css-scrollbar'
                                                    noBoxShadow
                                                    hidePaginationInfo={true}
                                                    hideFirstLastNav={true}
                                                    pageable={{
                                                        pageSizes: false,
                                                        buttonCount: 5,
                                                        info: false,
                                                    }}
                                                    settings={{
                                                        total: tempeventGoal?.length || 0,
                                                        skip: 0,
                                                        take: tempeventGoal?.length || 10,
                                                    }}
                                                    noRecords={
                                                        <div className="d-flex align-items-center justify-content-center h-100 w-100">
                                                            <h4 className="mb0 flex flex-center pt30 pb20 color-primary-grey">
                                                                {NO_EVENTS_FOUND}
                                                            </h4>
                                                        </div>
                                                    }
                                                    column={[
                                                        {
                                                            field: 'eventname',
                                                            title: 'Friendly name',
                                                            width: '100px',
                                                            isTooltip: true,
                                                            titleLength: 10,
                                                            cell: ({ dataItem }) => (
                                                                <td>
                                                                    {dataItem?.eventname ? (
                                                                        dataItem?.eventname.length > 10 ? (
                                                                            <RSTooltip text={dataItem?.eventname} position="top">
                                                                                <span>{truncateTitle(dataItem?.eventname, 10)}</span>
                                                                            </RSTooltip>
                                                                        ) : (
                                                                            <span>{dataItem?.eventname}</span>
                                                                        )
                                                                    ) : (
                                                                        <span>-</span>
                                                                    )}
                                                                </td>
                                                            ),
                                                        },
                                                        {
                                                            field: 'attribute.attributeName',
                                                            title: 'Attribute',
                                                            width: '100px',
                                                            cell: ({ dataItem }) => (
                                                                <td>
                                                                    {dataItem?.attribute?.attributeName ? (
                                                                        dataItem?.attribute.attributeName.length > 10 ? (
                                                                            <RSTooltip text={dataItem?.attribute.attributeName} position="top">
                                                                                <span>{truncateTitle(dataItem?.attribute.attributeName, 10)}</span>
                                                                            </RSTooltip>
                                                                        ) : (
                                                                            <span>{dataItem?.attribute.attributeName}</span>
                                                                        )
                                                                    ) : (
                                                                        <span>-</span>
                                                                    )}
                                                                </td>
                                                            ),
                                                        },
                                                        {
                                                            field: 'trackingType',
                                                            title: 'Capture type',
                                                            width: '100px',
                                                            isTooltip: true,
                                                            titleLength: 10,
                                                            cell: ({ dataItem }) => (
                                                                <td>
                                                                    {dataItem?.trackingType ? (
                                                                        dataItem?.trackingType.length > 10 ? (
                                                                            <RSTooltip text={dataItem?.trackingType} position="top">
                                                                                <span>{truncateTitle(dataItem?.trackingType, 10)}</span>
                                                                            </RSTooltip>
                                                                        ) : (
                                                                            <span>{dataItem?.trackingType}</span>
                                                                        )
                                                                    ) : (
                                                                        <span>-</span>
                                                                    )}
                                                                </td>
                                                            ),
                                                        },
                                                        {
                                                            title: 'Actions',
                                                            width: '80px',
                                                            cell: ({ dataItem }) => (
                                                                <td>
                                                                    <div className="d-flex">
                                                                        {dataItem?.markAsGoal && (
                                                                            <RSTooltip
                                                                                text={MARK_AS_GOAL}
                                                                                position="top"
                                                                                className="lh0"
                                                                            >
                                                                                <i
                                                                                    className={`${goal_achieved_medium} icon-md color-primary-green cursor-default`}
                                                                                />
                                                                            </RSTooltip>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            ),
                                                        },
                                                    ]}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                ): null}
                            </Accordion.Body>
                        </Accordion.Item>
                        {/* Modals */}
                        <EventTrackModal
                            show={isShow}
                            type="mobile"
                            fieldName={fieldName}
                            events={
                                isShow
                                    ? editEventData?.jsondata?.fieldsInfo?.fieldCaptureList || goals?.[0]?.events || []
                                    : []
                            }
                            handleClose={(e) => {
                                setShow(false);
                                setValue(`${name}.show`, false);
                                setEditEventData(null);
                            }}
                            onSave={(events, eventsSocketData) => {
                                // console.log('eventsSocketData: ', eventsSocketData);
                                // console.log('events: ', events);
                                
                                setValue(`${fieldName}[0].events`, events);
                                
                                if (eventsSocketData) {
                                    setValue(`${fieldName}[0].eventstemp`, eventsSocketData);
                                }
                                
                                setShowEvent(events);
                                setValue(`${name}.show`, true);
                                setShow(false);
                                setEditEventData(null);
                            }}
                            mobileAppDetail={{
                                type: goals[0].mobilePlatform,
                                mobileAppId: goals[0].appGuid,
                            }}
                            editData={editEventData}
                        />
                    </Fragment>
                );
            })}
        </Accordion>
    );
};

export default GoalDetails;
