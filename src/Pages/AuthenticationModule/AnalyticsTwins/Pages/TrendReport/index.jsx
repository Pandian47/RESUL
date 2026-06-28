import { selectIcon } from 'Utils/modules/display';
import { CREDIT_CARD, SELECT as SELECT_MSG, SELECT_CAMPAIN } from 'Constants/GlobalConstant/ValidationMessage';
import { ALL_TIME, CHOOSE_CAMPAIN, COMPARE, CREDIT_CARD_ACQUISTION, DAYS, ENGAGEMENT_CREDIT_CARD, INSIGHTS_CREDIT_CARD, LESSER_THAN, MONTH, NOTES, REACH_GROW_YOUR_WEALTH, SELECT, SELECT_COMMUNICATION_TO_COMPARE, WEEK } from 'Constants/GlobalConstant/Placeholders';
import { arrow_down_bold_medium, bookmark_medium, circle_minus_fill_medium, circle_plus_fill_medium, email_large, mobile_sms_large, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Button, ButtonGroup, Card, Col, Container, Row } from 'react-bootstrap';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSPageHeader from 'Components/RSPageHeader';
import { RSPrimaryButton } from 'Components/Buttons';
import RSHighchartsContainer from 'Components/Highcharts';
import Notes from 'Pages/AuthenticationModule/Audience/Pages/MasterData/Component/ListActivity/Components/Notes';
import optionChart from './ChartOptions/option';


import { CHOOSE_CAMPAIGN, CREDIT_CARD_ACQUISION, INITIAL_STATE, NOTESDATA, PERIOD } from './constants';

const TrendReports = () => {
    const {
        control,
        handleSubmit,
        watch,
        trigger,
        formState: { isValid },
    } = useForm(INITIAL_STATE);
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'acquisition',
    });

    const acquisitionWatch = useWatch({
        control,
        name: 'acquisition',
    });

    const [campaingnOne, campaingnTwo] = watch(['campaingnOne', 'campaingnTwo']);
    const [addCampaignFlag, setAddCampaignFlag] = useState(false);
    const [settingsFlag, setSettingsFlag] = useState(false);
    const [show, setIsShow] = useState(false);
    const [showChatFlag, setShowChatFlag] = useState(false);
    const [btnGroup, setBtnGroup] = useState('');

    const handleUpload = (data) => setShowChatFlag(true);

    const addAcquisition = (index) => {
        if (acquisitionWatch?.length < 5) {
            if (index === 0) {
                let validationState = acquisitionWatch.findIndex((list) => {
                    let values;
                    if (campaingnTwo?.name) {
                        values = Object.values(list);
                    } else {
                        values = Object.values(list).slice(0, Object.values(list)?.length - 1);
                    }
                    return values.includes('');
                });
                if (validationState === -1 && isValid) {
                    append({ acquisition: '', acquisitionOne: '', acquisitionTwo: '' });
                } else {
                    trigger();
                }
            } else {
                remove(index);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(handleUpload)}>
            <div className="page-content-holder analyticsListingTrendComparisonPageCSS">
                <RSPageHeader title={'Trend comparison'} rightCommonMenus />
                <Container className="page-content px0">
                    <Row className='mb10'>
                        <Col className='trendComparison-header'>
                            <h3 className='float-start '>{SELECT_COMMUNICATION_TO_COMPARE}</h3>
                        </Col>
                    </Row>

                    <div className="portlet-container p0 mb0">
                        <div className={`columnCenterDividerThird ${campaingnTwo?.name || addCampaignFlag ? 'active' : 'inactive'}`}>
                            <div className="columnCenterDivider">
                                <div className="bg-tertiary-blue p20 pt40">
                                    <Row>
                                        <Col md={5}>
                                            <p>{CREDIT_CARD_ACQUISTION}</p>
                                        </Col>
                                        <Col md={3}>
                                            <RSKendoDropdown
                                                data={CHOOSE_CAMPAIGN}
                                                name="campaingnOne"
                                                textField="name"
                                                dataItemKey="id"
                                                groupField="position"
                                                label={CHOOSE_CAMPAIN}
                                                rules={{
                                                    required: SELECT_CAMPAIN,
                                                }}
                                                control={control}
                                                className=""
                                                popupSettings={{
                                                    popupClass: `trendReportDropdownListContainer`,
                                                }}
                                            />
                                        </Col>
                                        {addCampaignFlag && (
                                            <Col md={{ span: 3, offset: 0 }}>
                                                <RSKendoDropdown
                                                    name="campaingnTwo"
                                                    data={CHOOSE_CAMPAIGN}
                                                    textField="name"
                                                    dataItemKey="id"
                                                    groupField="position"
                                                    control={control}
                                                    className="ml40"
                                                    label={CHOOSE_CAMPAIN}
                                                    rules={{
                                                        required: SELECT_CAMPAIN,
                                                    }}
                                                />
                                            </Col>
                                        )}
                                        <Col md={1} className="mt7 ">
                                            <i
                                                className={
                                                    !addCampaignFlag
                                                        ? `${circle_plus_fill_medium} color-primary-blue icon-md `
                                                        : `${circle_minus_fill_medium} color-red-medium icon-md `
                                                }
                                                onClick={() => setAddCampaignFlag(!addCampaignFlag)}
                                            ></i>
                                        </Col>
                                    </Row>
                                </div>

                                {campaingnOne?.name &&
                                    fields.map((ele, index) => {
                                        let tempData = acquisitionWatch[index]?.acquisition;
                                        return (
                                            <div className='p20' >
                                                <Row key={ele.id}>
                                                    <Col md={2}>
                                                        <RSKendoDropdown
                                                            className={'text-capitalize'}
                                                            name={`acquisition[${index}].acquisition`}
                                                            data={CREDIT_CARD_ACQUISION}
                                                            textField="name"
                                                            dataItemKey="id"
                                                            control={control}
                                                            label={SELECT}
                                                            rules={{
                                                                required: CREDIT_CARD,
                                                            }}
                                                        />
                                                    </Col>
                                                    {tempData?.name && (
                                                        <>
                                                            <Col md={2}>
                                                                <RSKendoDropdown
                                                                    name={`acquisition[${index}].acquisitionOne`}
                                                                    data={tempData?.value}
                                                                    textField="name"
                                                                    dataItemKey="id"
                                                                    control={control}
                                                                    label={`Select ${tempData?.name || ''}`}
                                                                    rules={{
                                                                        required: `Select ${tempData?.name || ''}`,
                                                                    }}
                                                                />
                                                            </Col>
                                                            <Col md={1} className="mt7">
                                                                <i
                                                                    onClick={() => addAcquisition(index)}
                                                                    className={`${selectIcon(index)} icon-md cp ${fields?.length > 4 && index == 0
                                                                        ? 'click-off'
                                                                        : ''
                                                                        }`}
                                                                ></i>
                                                            </Col>
                                                            <Col md={{ span: 3 }}>
                                                                <RSKendoDropdown
                                                                    name={`acquisition[${index}].acquisitionTwo`}
                                                                    data={tempData?.value}
                                                                    textField="name"
                                                                    dataItemKey="id"
                                                                    control={control}
                                                                    label={`Select ${tempData?.name || ''}`}
                                                                    rules={{
                                                                        required: `Select ${tempData?.name}`,
                                                                    }}
                                                                />
                                                            </Col>
                                                        </>
                                                    )}

                                                    {tempData?.value?.length > 0 && (campaingnTwo?.name || addCampaignFlag) && (
                                                        <Col md={{ span: 3, offset: 0 }}>
                                                            <RSKendoDropdown
                                                                className="text-capitalize ml40"
                                                                name={`acquisition[${index}].acquisitionThree`}
                                                                data={tempData?.value}
                                                                textField="name"
                                                                dataItemKey="id"
                                                                control={control}
                                                                label={`Select ${tempData?.name || ''}`}
                                                                rules={{
                                                                    required: `Select ${tempData?.name}`,
                                                                }}
                                                            />
                                                        </Col>
                                                    )}
                                                </Row>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                        {campaingnOne?.name && (
                            <Row>
                                <Col className="mb10 mt20 ml30 d-flex justify-content-center">
                                    <ButtonGroup onClick={(e) => setBtnGroup(e.target.value)} className="report-buttongrp bg-tertiary-grey p0 my19 ">
                                        <Button
                                            variant=''
                                            className={`${btnGroup === 'allTime' ? 'activebtn' : ''} ${settingsFlag && btnGroup === 'allTime' ? 'btnbefore' : ''
                                                }`}
                                            value="allTime"
                                        >
                                            {ALL_TIME}
                                        </Button>
                                        <Button variant='' className={`${btnGroup === 'day' ? 'activebtn' : ''} ${settingsFlag && btnGroup === 'day' ? 'btnbefore' : ''
                                            }`} value="day">
                                            {DAYS}
                                        </Button>
                                        <Button variant='' className={`${btnGroup === 'week' ? 'activebtn' : ''} ${settingsFlag && btnGroup === 'week' ? 'btnbefore' : ''
                                            }`} value="week">
                                            {WEEK}
                                        </Button>
                                        <Button variant='' className={`${btnGroup === 'month' ? 'activebtn' : ''} ${settingsFlag && btnGroup === 'month' ? 'btnbefore' : ''
                                            }`} value="month">
                                            {MONTH}
                                        </Button>
                                    </ButtonGroup>
                                    <i
                                        className={
                                            settings_medium + ' ml10 icon-md color-secondary-blue pt27'
                                        }
                                        onClick={() => setSettingsFlag(!settingsFlag)}
                                    ></i>
                                </Col>
                            </Row>
                        )}
                        {settingsFlag && (
                            <div className="reportdrop mb28 mt-10">
                                <ul className=" d-flex justify-content-evenly pb5">
                                    <li className="">
                                        <RSKendoDropdown
                                            control={control}
                                            rules={{
                                                required: SELECT_MSG,
                                            }}
                                            name="periodOne"
                                            data={PERIOD}
                                        />
                                    </li>
                                    <li className="">
                                        <span>vs</span>
                                    </li>
                                    <li className="">
                                        <RSKendoDropdown
                                            control={control}
                                            rules={{
                                                required: SELECT_MSG,
                                            }}
                                            name="periodTwo"
                                            data={PERIOD}
                                        />
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-end py25">
                        <RSPrimaryButton type="submit">{COMPARE}</RSPrimaryButton>
                    </div>
                    {showChatFlag && (
                        <>
                            <div className="box-design">
                                <div className="float-end">
                                    <ul className="rs-list-group-horizontal jc-right">
                                        <li className="d-block">
                                            <div
                                                className="cp float-end mr10 mt4"
                                                onClick={() => {
                                                    setIsShow(!show);
                                                }}
                                            >
                                                <i
                                                    className={`float-left mr5 mt2 color-primary-blue icon-md ${bookmark_medium}`}
                                                    id="rs_data_bookmark"
                                                ></i>
                                                {NOTES}
                                            </div>

                                            {show && (
                                                <div className="box-design mt35 note-accordion position-absolute right-0 z-1">
                                                    <Notes
                                                        data={NOTESDATA}
                                                        handleClose={(status) => {
                                                            if (!status) setIsShow(false);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    </ul>
                                </div>
                                <div className="card-body">
                                    <RSHighchartsContainer options={optionChart()} className="commoncharts-cenetr" />
                                </div>
                            </div>
                            <Card mb={'30'} className="my25">
                                <div className="card-title pl30 pt15">{INSIGHTS_CREDIT_CARD}</div>
                                <div className="mt7 ">
                                    <Row className="  bg-tertiary-blue m0">
                                        <Col
                                            sm={5}
                                            className="d-flex justify-content-center align-items-center gap-2 "
                                        >
                                            <i className={`${email_large}  color-email icon-lg `}></i>
                                            {REACH_GROW_YOUR_WEALTH} (52%)
                                        </Col>
                                        <Col  className="text-center white p15 insights-comparision"
                                            sm={2}>
                                                  <p className="white d-flex justify-content-center align-items-center gap-1">
                                            <span className="fs27">
                                              15<sub>%</sub>
                                                </span>
                                                    <i className={`${arrow_down_bold_medium} icon-md`}></i>
                                            <span className="ml2">{LESSER_THAN}</span>
                                            </p>
                                        </Col>
                                        <Col
                                            sm={5}
                                            className="d-flex justify-content-center align-items-center gap-2"
                                        >
                                            <i className={`${mobile_sms_large} color-sms icon-lg `}></i>
                                            {ENGAGEMENT_CREDIT_CARD} (67%)
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </>
                    )}
                </Container>
            </div>
        </form>
    );
};

export default TrendReports;
