import { getmasterData } from 'Utils/modules/masterData';
import { onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits } from 'Utils/modules/inputValidators';
import { ENTER_CUSTOM_VALUE, ENTER_VALID_PERCENTAGE, SELECT_CONVERSION_CATEGORY } from 'Constants/GlobalConstant/ValidationMessage';
import { CLOSE, CONVERSION, CONVERSION_TYPE, CONVERSION_VALUE, ENGAGEMENT, ENGAGEMENT_TYPE, ENTER_CUSTOM, SELECT_CURRENCY_TYPE, SELECT_THE_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { close_mini, event_tracking_medium, goal_achieved_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useState } from 'react';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import RenderInput from '../RenderInput/RenderInput';
import { getInputType } from '../../constant';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import useQueryParams from 'Hooks/useQueryParams';
import GoalDetails from '../../../AppAnalytics/Component/GoalDetails/GoalDetails';

import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import EventTrackingTable from '../EventTracking/EventTrackingTable';

import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';
import useOnlyDepChangeEffect from 'Hooks/useOnlyDepChangeEffect';
import { webAnalyticsContext } from '../../WebAnalytics';

const GoalContent = ({
    name,
    goal,
    conversionData,
    url,
    contentTypes,
    setContentTypes,
    isAppAnalytics,
    editEventList,
    handleEditEvent,
}) => {
    const { control, watch, setValue, getValues, resetField } = useFormContext();
    const state = useQueryParams('/communication');
    const smartLink = useSelector((state) => getGeneratedLink(state));
    const waContext = useContext(webAnalyticsContext);
    const goalTypeLoading = waContext?.goalTypeLoader?.isLoading;
    const [pagesList, setPagesList] = useState([]);
    const [webFieldTrackEventList, setWebFieldTrackEventList] = useState([]);
    // const [contentTypes, setContentTypes] = useState({
    //     engagement: [],
    //     conversion: [],
    // });
    const [nameType = [], isEdit, customEvents = [], manualType, formValues = []] = watch([
        `${name}Type`,
        'isEdit',
        `${name}CustomEvents`,
        `${name}ManualType`,
        `${name}FormValues`,
    ]);
    const { currencyMasterList } = getmasterData();
    let tempCurrentyData = currencyMasterList?.map((e) => e.currencyName + ' (' + e.currencyFormat + ')');

    const currencyObjects = tempCurrentyData?.map((currency, index) => {
        return {
            id: index + 1,
            currency: currency,
        };
    });

    const {
        tabsState: { analytics: tabAnalyticsState },
        activeTabs,
        isDirty,
        WebAnalytics,
        analytics,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    // console.log('name type ::::: ', state);
    useEffect(() => {
        const smarlinkEntries = Object.entries(smartLink);
                let temp = smarlinkEntries?.map((item, idx) => {
            return {
                url: item?.[1],
            };
        });
                // resetField(`${name}Pages`);
        // setValue(`${name}Pages`, temp);
        setPagesList(temp);
        // debugger;
        // const newTabState = tab.map((tabs, index) => {
        //     if (index > 0) {
        //         const [key = '', value = ''] = smarlinkEntries?.[index] || [];
        //         tabs.isAdd = value === '';
        //         console.log('value: ', value);
        //     } else {
        //         tabs.isAdd = smarlinkEntries?.[0]?.[1] === '';
        //     }
        //     return tabs;
        // });
    }, [smartLink, nameType]);
    useEffect(() => {
        function setValues(goalType) {
            if (!!goalType && (goal?.E || goal?.C) && !isEdit) {
                let temp = goalType?.split(',');
                if (name === 'engagement') {
                    let tempGoal = [];
                    let tempData = goal?.E?.map((item) => {
                        for (let i = 0; i < temp?.length; i++) {
                            if (item?.ConversionName === temp[i]) {
                                tempGoal?.push(item);
                            }
                        }
                    });
                    setValue(`${name}Type`, tempGoal);
                    let tempContent = getInputType(tempGoal?.map((item) => item?.ConversionName));
                    setContentTypes((prev) => ({
                        ...prev,
                        [name]: tempContent,
                    }));
                } else {
                    // debugger;
                    let tempGoal = [];
                    let tempData = goal?.C?.map((item) => {
                        for (let i = 0; i < temp?.length; i++) {
                            if (item?.ConversionName === temp[i]) {
                                tempGoal?.push(item);
                            }
                        }
                    });
                    setValue(`${name}Type`, tempGoal);
                    let tempContent = getInputType(tempGoal?.map((item) => item?.ConversionName));

                    setContentTypes((prev) => ({
                        ...prev,
                        [name]: tempContent,
                    }));
                }
            }
        }
        if (!!state) {
            // debugger;
            if (!!state?.primaryGoalType || !!state?.secondaryGoalType) {
                let goalTypeValue = '';
                if (
                    (state?.primaryGoal === 'Engagement' && name === 'engagement') ||
                    (state?.primaryGoal === 'Conversion' && name === 'conversion')
                ) {
                    goalTypeValue = state?.primaryGoalType;
                } else if (
                    (state?.secondaryGoal === 'Engagement' && name === 'engagement') ||
                    (state?.secondaryGoal === 'Conversion' && name === 'conversion')
                ) {
                    goalTypeValue = state?.secondaryGoalType;
                }
                setValues(goalTypeValue);
            }
        }
    }, [state, goal, name]);
    // console.log('Check ::::::::: ', contentTypes);
    useEffect(() => {
        setWebFieldTrackEventList(editEventList);
    }, [editEventList]);
    const handleUpdateWebFieldTrackEventData = (data) => {
        setWebFieldTrackEventList(data['elementArray']);
    };
    useOnlyDepChangeEffect(() => {
        const types = [{ type: 'URL', name: 'Pages' }, { type: 'Forms', name: 'SubscriptionForm' }, { type: 'Custom events', name: 'CustomEvents' }, { type: 'Forms', name: 'Action' }]
        const res = nameType?.length ? getInputType(nameType?.map((item) => item?.ConversionName)) : []
        const filteredNames = types?.filter(item => !res?.includes(item.type))?.map(item => item.name);
        if (filteredNames?.includes("SubscriptionForm")) {
            setValue(`${name}FormValues`, [])
            // setValue(`${name}CustomEventsValue`,'')
        }
        filteredNames.forEach((e) => resetField(`${name}${e}`));
    }, [nameType])
    const enabletheOfflineConversionTab = () => {
        
    }
    return (
        <Fragment>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">
                            {name === 'engagement' ? ENGAGEMENT : CONVERSION} type
                        </label>
                    </Col>
                    <Col sm={6}>
                        <RSMultiSelect
                            control={control}
                            name={`${name}Type`}
                            label={name === 'conversion' ? CONVERSION_TYPE : ENGAGEMENT_TYPE}
                            textField={'FriendlyName'}
                            dataItemKey={'ConversionTypeID'}
                            defaultValue={[]}
                            required
                            isLoading={goalTypeLoading}
                            rules={{
                                required: `Select ${name === 'conversion' ? 'conversion' : 'engagement'} type`,
                            }}
                            data={name === 'engagement' ? goal?.E : goal?.C}
                            handleChange={(e) => {

                                let temp = getInputType(e?.value?.map((item) => item?.ConversionName));

                                if (e?.value?.ConversionTypeID === 6) {
                                    // Enable the offline conversion tab in analytics
                                    enabletheOfflineConversionTab();

                                }
                                setContentTypes((prev) => ({
                                    ...prev,
                                    [name]: temp,

                                }));
                            }}
                        />
                    </Col>
                </Row>
            </div>
            {/* <div className="form-group">
                <Row>
                    <Col sm={4} className="text-right">
                        <label className="control-label-left">
                            {name === 'engagement' ? 'Engagement' : 'Conversion'} category
                        </label>
                    </Col>
                    <Col sm={7}>
                        <RSKendoDropDownList
                            control={control}
                            name={`${name}Category`}
                            label={'Engagement category'}
                            textField={'categoryName'}
                            dataItemKey={'conversionCategoryId'}
                            required
                            rules={{
                                required: SELECT_CONVERSION_CATEGORY,
                            }}
                            data={conversionData?.length > 0 ? conversionData : []}
                        />
                    </Col>
                </Row>
            </div> */}

            {/* {nameType?.length !== 0 && contentTypes?.[name].includes('Forms') && (
                <div className="form-group">
                    <Row>
                        <Col sm={4} className="text-right">
                            <label className="control-label-left">Action</label>
                        </Col>
                        <Col sm={7}>
                            <RSKendoDropDownList
                                control={control}
                                name={`${name}Action`}
                                label={'Select action'}
                                rules={{
                                    required: 'Select action',
                                }}
                                required
                                data={['Opened', 'Dismiss', 'Partially submitted']}
                            />
                        </Col>
                    </Row>
                </div>
            )} */}
            {nameType?.length !== 0 &&
                contentTypes?.[name]?.map((item, index) => (
                    <Fragment key={`${name}-${item}-${index}`}>
                        <RenderInput
                            type={item}
                            url={getValues('domain')}
                            nameType={nameType}
                            name={name}
                            isAppAnalytics={isAppAnalytics}
                            pagesList={pagesList}
                            updateWebFieldTrackEventData={(data) => {
                                handleUpdateWebFieldTrackEventData(data);
                            }}
                            webFieldTrackEventList={webFieldTrackEventList}
                        />
                        {index === 0 && webFieldTrackEventList?.length ? (
                            // <div className="row col-12">
                            //     <h4 className="color-secondary-blue mb10">
                            //         <i className={`${event_tracking_medium} icon-md color-primary-blue`} /> Events
                            //     </h4>
                            //     <div className="rs-events-tracking-list-box col-7">
                            //         <ol className="rs-cc-event-tracking-list">
                            //             {webFieldTrackEventList?.map((event, index) => (
                            //                 <li key={event.id}>
                            //                     <p>
                            //                         Event name: <span>{event?.eventTracking?.eventname}</span>
                            //                     </p>
                            //                     <p>
                            //                         Action :
                            //                         <span>
                            //                             {event?.eventTracking?.elementtype ||
                            //                                 event?.eventTracking?.trackingType}
                            //                         </span>
                            //                     </p>
                            //                     <p>
                            //                         Input type:
                            //                         <span>
                            //                             {event?.eventTracking?.elementaction ||
                            //                                 event?.eventTracking?.inputType}
                            //                         </span>
                            //                     </p>
                            //                     <p>
                            //                         Description: <span>{event?.eventTracking?.description}</span>
                            //                     </p>
                            //                     <div className="rsccetl-icons">
                            //                         {event?.markAsGoal && (
                            //                             <RSTooltip text="Goal" position="top">
                            //                                 <i
                            //                                     className={`${goal_achieved_medium} icon-md color-primary-green`}
                            //                                 />
                            //                             </RSTooltip>
                            //                         )}
                            //                     </div>
                            //                 </li>
                            //             ))}
                            //         </ol>
                            //     </div>
                            //     <div className="col-1">
                            //         <RSTooltip text="Edit event" position="top">
                            //             <i
                            //                 id="rs_data_circle_pencil"
                            //                 className={`${pencil_edit_medium} icon-md color-primary-blue`}
                            //                 onClick={(e) => {
                            //                     handleEditEvent(e);
                            //                 }}
                            //             />
                            //         </RSTooltip>
                            //     </div>
                            // </div>
                            <EventTrackingTable webFieldTableData={webFieldTrackEventList} />
                        ) : null}
                    </Fragment>
                ))}
            {name === 'conversion' && (
                <div className="form-group mt30">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{CONVERSION_VALUE}</label>
                        </Col>
                        <Col sm={3} className="position-relative conversionvalues">
                            {manualType ? (
                                <Fragment>
                                    <RSInput
                                        control={control}
                                        name={`${name}ManualValue`}
                                        label={ENTER_CUSTOM}
                                        onKeyDown={(e) => onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits(e)}
                                        //required
                                        // rules={{
                                        //     required: ENTER_CUSTOM_VALUE,
                                        //     validate: (data) => {
                                        //         const value = parseFloat(data);
                                        //         return value === 0 || value > 100 ? ENTER_VALID_PERCENTAGE : true;
                                        //     },
                                        // }}
                                    />
                                    {/* <RSTooltip
                                        text={CLOSE}
                                        position="top"
                                        className="lh0 position-absolute right16 top3 z-2"
                                        innerContent={false}
                                    >
                                        <i
                                            className={`${close_mini} icon-sm color-primary-red `}
                                            id="rs_GoalContent_close"
                                            onClick={() => {
                                                setValue(`${name}ManualType`, false);
                                                setValue(`${name}CustomEventsValue`, []);
                                                unregister(`${name}ManualValue`);
                                            }}
                                        />
                                    </RSTooltip> */}
                                </Fragment>
                            ) : (
                                <RSKendoDropDownList
                                    control={control}
                                    name={`${name}CustomEventsValue`}
                                    label={SELECT_THE_ATTRIBUTES}
                                    allowCustom
                                    // rules={{
                                    //     required: 'Select custom value',
                                    // }}
                                    // required
                                    data={
                                        formValues?.length !== 0
                                            ? [...customEvents, ...formValues]
                                            : [...customEvents]
                                    }
                                    footer={
                                        <RSDropdownFooterBtn
                                            title="Enter value manually"
                                            handleClick={() => {
                                                setValue(`${name}ManualType`, true);
                                                setValue(`${name}CustomValueType`, 'manualValue');
                                            }}
                                        />
                                    }
                                    handleChange={(e) => {
                                        if (formValues.includes(e?.value)) {
                                            setValue(`${name}CustomValueType`, 'Form');
                                        } else {
                                            setValue(`${name}CustomValueType`, 'customevent');
                                        }
                                    }}
                                />
                            )}
                        </Col>
                        <Col sm={3}>
                            <RSKendoDropDownList
                                control={control}
                                name={`${name}Pricing`}
                                label={SELECT_CURRENCY_TYPE}
                                // rules={{
                                //     required: 'Select pricing',
                                // }}
                                // required
                                data={currencyMasterList}
                                dataItemKey={'currencyID'}
                                textField={'currencyName'}
                            // data={currencyObjects}
                            // dataItemKey={'id'}
                            // textField={'currency'}
                            />
                        </Col>
                    </Row>
                </div>
            )}

            <Fragment>
                {isAppAnalytics && contentTypes?.[name]?.includes('URL') && (
                    <GoalDetails fieldName={`${name}PrimaryGoal`} key="primaryGoal" name={name} />
                )}
            </Fragment>
        </Fragment>
    );
};

export default GoalContent;
