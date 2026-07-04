import { getIndexBasedOnCampaign } from 'Utils/modules/communicationStatus';
import { GENERATE_SMART_LINK } from 'Constants/GlobalConstant/Placeholders';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { collapse_large, communication_edit_large, events_large, expand_large, restart_large, smart_link_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useLocation, useNavigate } from 'react-router-dom';

import RSTooltip from 'Components/RSTooltip';
import SmartLink from '../../Create/Component/SmartLinkModal';


import { useDispatch, useSelector } from 'react-redux';
import { updateSmartLinkModalState } from 'Reducers/communication/createCommunication/Create/reducer';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';

import useQueryParams from 'Hooks/useQueryParams';
import { updateMobileChangeConfirm } from 'Reducers/communication/createCommunication/smartlink/reducer';
import { updateCommunicationData } from 'Reducers/communication/createCommunication/plan/reducer';
import *  as placeholder  from 'Constants/GlobalConstant/Placeholders';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'

const CampaignInfoCard = ({
    type,
    canvasReset,
    TemplateList,
    PotentialAudienceList,
    alignToGrid,
    className,
    tooltipPosition,
}) => {
    const location = useLocation();
    const pathName = location.pathname;
    // const { state } = useLocation();
    const state = useQueryParams('/communication');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showSmartLink, smartLinkAutoAdd } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    const { smartLinkShow } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const { eventTrackData, mobileChangeConfirm, isSmartLinkDetailLoading } = useSelector(
        ({ smartLinkReducer }) => smartLinkReducer,
    );

    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const smartLink = useSelector((state) => getGeneratedLink(state));

    // console.log('smartLink1: ', !!smartLink1);

    const [isFullScreen, setFullScreen] = useState(false);
    const [smartLinkColor, setsmartLinkColor] = useState(false);
    // useEffect(() => {
    //     if (isFullScreen && !document.fullscreenElement) {
    //         document.body.requestFullscreen();
    //     } else if (isFullScreen && document.webkitIsFullScreen) {
    //         document.body.requestwebkitFullscreen();
    //     } else if (!isFullScreen && document.webkitIsFullScreen) {
    //         document.webkitCancelFullScreen();
    //     } else if (!isFullScreen && document.fullscreenElement) {
    //         document.exitFullscreen();
    //     }
    // }, [isFullScreen]);
    useEffect(() => {
        const enterFullScreen = (element) => {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };

        const exitFullScreen = () => {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        };

        if (
            isFullScreen &&
            !document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement
        ) {
            enterFullScreen(document.body);
        } else if (
            !isFullScreen &&
            (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)
        ) {
            exitFullScreen();
        }
    }, [isFullScreen]);

    useEffect(() => {
        window.addEventListener('resize', fullscreenchanged);
        return () => {
            window.removeEventListener('resize', fullscreenchanged);
        };
    }, []);
    useEffect(() => {
        setsmartLinkColor(!!smartLink1);
    }, [smartLink1]);

    const fullscreenchanged = () => {
        if (document.webkitIsFullScreen) {
            setFullScreen(true);
        } else {
            setFullScreen(false);
        }
    };
    // useEffect(() => {
    //     if (!state) {
    //         navigate('/communication', {
    //             state: { index: 0 },
    //         });
    //     }
    // }, []);

    const { campaignName, startDate, endDate, communicationType, primaryGoal, campaignType } = {
        campaignName: _get(state, 'campaignName'),
        startDate: _get(state, 'startDate'),
        endDate: _get(state, 'endDate'),
        communicationType: _get(state, 'communicationType'),
        primaryGoal: _get(state, 'primaryGoal'),
        campaignType: _get(state, 'campaignType'),
    };
    const isDisplayEditCommunication =
        (campaignType === 'M' && pathName === '/communication/execute') || campaignType !== 'M' ? true : false;
    const isExecutePage = pathName === '/communication/execute';
    const isCompletedCampaign = Number(state?.statusId) === 9;
    const hasSmartLink = Boolean(smartLink1 && Object.values(smartLink || {})[0]);
    const isSmartLinkIconDisabled = isExecutePage && isCompletedCampaign && !hasSmartLink;
    // const period = `${getDateWithDay(startDate)} - ${getDateWithDay(endDate)}`;
    const period = `${getUserCurrentFormat(startDate)?.dateFormat} - ${getUserCurrentFormat(endDate)?.dateFormat}`;
    return (
        <Fragment>
            {/* Start */}
            <div
                className={`rs-columns-block mdc-header d-flex mb21 position-relative justify-content-between py5 px10 ${
                    className ?? ''
                }`}
            >
                <div className="d-flex align-items-center justify-content-between w-100">
                    {/* {type === 'canvas' && (
                        <div className="mdc-logo-contain">
                            <img src={ResulticksLogoBl} alt="RESUL" />
                        </div>
                    )} */}
                    <div className="w-100">
                        <ul className={`d-flex align-items-center justify-content-between w-100`}>
                            <li style={{ flex: '1' }} className={`rs-mdc-border-none rs-first-col`}>
                                <small>Name:</small>
                                <h4>
                                     <TruncatedCell value = {campaignName} noTable= {true}/>
                                </h4>
                            </li>
                            <li style={{ flex: '1' }}>
                                <small>Period:</small>
                                <h4>
                                    <TruncatedCell value = {period} noTable= {true}/>
                                </h4>
                            </li>
                            <li style={{ flex: '1' }}>
                                <small>Type:</small>
                                <h4>
                                     <TruncatedCell value = {communicationType} noTable= {true}/>
                                </h4>
                            </li>
                            <li style={{ flex: '1' }}>
                                <small>Primary goal:</small>
                                 <h4>
                                     <TruncatedCell value = {primaryGoal} noTable= {true}/>
                                </h4>
                            </li>
                            {/* {type === 'canvas' && (
                                <Fragment>
                                    <li>
                                        <small>Potential audience:</small>
                                        {PotentialAudienceList}
                                    </li>
                                </Fragment>
                            )} */}
                            {campaignType === 'M' && pathName !== '/communication/execute' && (
                                <li style={{ flex: '1' }} className="fullWidth">
                                    <small>Potential audience:</small>
                                    {PotentialAudienceList}
                                </li>
                            )}

                            <li className="sdc-icons d-flex justify-content-end rs-mdc-border-none">
                                {isDisplayEditCommunication && (
                                    <span className="mr10 bg-primary-blue">
                                        <RSTooltip
                                            text="Edit communication"
                                            position={`${tooltipPosition ?? 'top'}`}
                                            innerContent={false}
                                        >
                                            <i
                                                className={`${communication_edit_large} icon-lg white p4 position-relative right1`}
                                                onClick={() => {
                                                    const newState = {
                                                        currentTab: getIndexBasedOnCampaign(state.campaignType),
                                                        ...state,
                                                        mode: 'edit',
                                                        // isEditable: true,
                                                        // isEditable: state?.statusId !== 9 && state?.statusId !== 5,
                                                        isEditable: state?.isEditable,
                                                    };
                                                    const encryptState = encodeUrl(newState);
                                                    dispatch(updateCommunicationData({ field: 'editState', data: newState }));
                                                    navigate({
                                                        pathname: '/communication/communication-creation',
                                                        search: `?q=${encryptState}`,
                                                    });
                                                }}
                                                id="rs_CampaignInfoCard_Communicationedit"
                                            ></i>
                                        </RSTooltip>
                                    </span>
                                )}
                                <span
                                    className={`campaign-info-smartlink-icon ${
                                        isSmartLinkDetailLoading
                                            ? 'campaign-info-smartlink-icon--loading'
                                            : !!smartLink1
                                              ? 'bg-primary-green'
                                              : 'bg-secondary-grey'
                                    } ${isSmartLinkIconDisabled ? 'pe-none click-off' : ''}`}
                                >
                                    {isSmartLinkDetailLoading ? (
                                        <span
                                            className="campaign-info-smartlink-icon__loader"
                                            aria-hidden="true"
                                            aria-busy="true"
                                        >
                                            <span className="segment_loader" />
                                        </span>
                                    ) : (
                                    <RSTooltip
                                        text={GENERATE_SMART_LINK}
                                        position={`${tooltipPosition ?? 'top'}`}
                                        innerContent={false}
                                    >
                                        <i
                                            className={`${smart_link_large} icon-lg white p4 ${
                                                isSmartLinkIconDisabled ? 'cursor-default' : 'cp'
                                            }`}
                                            onClick={
                                                isSmartLinkIconDisabled
                                                    ? undefined
                                                    : () => dispatch(updateSmartLinkModalState(true))
                                            }
                                            id="rs_CampaignInfoCard_Smartlink"
                                        ></i>
                                    </RSTooltip>
                                    )}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* <ul className="d-flex align-items-center ">
                    {type === 'canvas' && (
                        <li>
                            <img src={PoweredBy} alt="RESUL" style={{ maxWidth: '60px' }} />
                        </li>
                    )}
                    <li className="col-sm-2">
                        <small>Name:</small>
                        <RSTooltip text={campaignName} position="top">
                            <h4>{campaignName}</h4>
                        </RSTooltip>
                    </li>
                    <li className={`col-sm-${type === 'canvas' ? 2 : 3}`}>
                        <small>Period:</small>
                        <RSTooltip text={period} position="top">
                            <h4>{period}</h4>
                        </RSTooltip>
                    </li>
                    <li className={`col-sm-${type === 'canvas' ? 2 : 2}`}>
                        <small>Type:</small>
                        <RSTooltip text={communicationType} position="top" >
                            <h4>{communicationType}</h4>
                        </RSTooltip>
                    </li>
                    <li className={`col-sm-${type === 'canvas' ? 2 : 3}`}>
                        <small>Primary communication goal:</small>
                        <RSTooltip text={primaryGoal} position="top">
                            <h4>{primaryGoal}</h4>
                        </RSTooltip>
                    </li>
                    {type === 'canvas' && (
                        <Fragment>
                            <li className="col-sm-2">
                                <small>Potential audience:</small>
                                {PotentialAudienceList}
                            </li>
                        </Fragment>
                    )}
                </ul>
                <ul className="position-absolute d-flex justify-content-end right15 align-items-center top0 bottom0">
                    {type === 'canvas' && (
                        <Fragment>
                            <li className="mdc-header-icon click-off">
                                <Icon
                                    icon={events_large}
                                    tooltip="Align to grid"
                                    position="top"
                                    size="lg"
                                    color="white"
                                    mainClass="color-blue"
                                    iconClass=""
                                    // callBack={() => {
                                    //     handleCanvasReset();
                                    // }}
                                />
                            </li>
                            <li className="mdc-header-icon"> {TemplateList}</li>

                            <li className="mdc-header-icon">
                                <Icon
                                    icon={smart_link_large}
                                    tooltip="Create SmartLink"
                                    position="top"
                                    size="lg"
                                    color="white"
                                    mainClass="color-blue"
                                    iconClass=""
                                    // callBack={() => {
                                    //     handleCanvasReset();
                                    // }}
                                />
                            </li>
                            <li className="mdc-header-icon">
                                <Icon
                                    icon={restart_large}
                                    tooltip="Reset canvas"
                                    position="top"
                                    size="lg"
                                    color="white"
                                    mainClass="color-blue"
                                    iconClass=""
                                    callBack={() => {
                                        handleCanvasReset();
                                    }}
                                />
                            </li>
                            <li className="mdc-header-icon">
                                <Icon
                                    icon={isFullScreen ? collapse_large : expand_large}
                                    tooltip="Full screen"
                                    position="top"
                                    size="lg"
                                    color="white"
                                    mainClass="color-blue"
                                    iconClass=""
                                    callBack={() => {
                                        setFullScreen(!isFullScreen);
                                    }}
                                />
                            </li>
                        </Fragment>
                    )}
                    {type !== 'canvas' && (
                        <li className="sdc-icons d-flex">
                            <span style={{ backgroundColor: '#26ade0' }}>
                                <RSTooltip text="Edit communication" position="top">
                                    <i
                                        className={`${communication_edit_large} icon-lg white`}
                                        onClick={() => {
                                            // const isEditable = statusId !== 9 && statusId !== 5;
                                            navigate('/communication/communication-creation', {
                                                state: {
                                                    mode: 'edit',
                                                    currentTab: getIndexBasedOnCampaign(state.campaignType),
                                                    ...state,
                                                    // isEditable,
                                                    // statusId,
                                                },
                                            });
                                        }}
                                    ></i>
                                </RSTooltip>
                            </span>
                            <span style={{ background: smartLink1 || smartLink2 ? '#5ba529' : 'grey' }}>
                                <RSTooltip text="Generate SmartLink" position="top">
                                    <i
                                        className={`${smart_link_large} icon-lg white`}
                                        onClick={() => dispatch(updateSmartLinkModalState(true))}
                                    ></i>
                                </RSTooltip>
                            </span>
                        </li>
                    )}
                </ul> */}
            </div>
            {/* End */}

            {/* Modals */}
            {showSmartLink && !isSmartLinkIconDisabled && <SmartLink
                statusId={state?.statusId}
                show={showSmartLink}
                openWithAddNewTab={smartLinkAutoAdd}
                handleClose={() => {
                    //  dispatch(resetSmartLink());
                    dispatch(updateSmartLinkModalState(false));
                    if (Object.values(eventTrackData)[0]?.length || Object.values(eventTrackData)[1]?.length) {
                        if (!mobileChangeConfirm?.isConfirmSaved) {
                            dispatch(
                                updateMobileChangeConfirm({
                                    field: 'isConfirmNotSaved',
                                    data: false,
                                }),
                            );
                        } else {
                            dispatch(
                                updateMobileChangeConfirm({
                                    field: 'isConfirmNotSaved',
                                    data: true,
                                }),
                            );
                        }
                    }
                }}
            />}
        </Fragment>
    );
};

export default CampaignInfoCard;
