import { getIndexBasedOnCampaign } from 'Utils/modules/communicationStatus';
import { encodeUrl } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';

import { collapse_large, expand_large, restart_large } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from 'Components/Icon/Icon';

import RSTooltip from 'Components/RSTooltip';
import SmartLink from '../../Create/Component/SmartLinkModal';


import { useDispatch, useSelector } from 'react-redux';
import { updateSmartLinkModalState } from 'Reducers/communication/createCommunication/Create/reducer';
import { getGeneratedLink } from 'Reducers/communication/createCommunication/smartlink/selectors';

import { ResulticksLogoBl } from 'Assets/Images';
import useQueryParams from 'Hooks/useQueryParams';
import CreateWorkFlowContext from '../../MdcComponents/WorkFlow/context';
import { updateCommunicationData } from 'Reducers/communication/createCommunication/plan/reducer';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'

const CampaignInfoCardMdcCanvas = ({ TemplateList, PotentialAudienceList, canvasReset }) => {
    // const { state } = useLocation();
    const state = useQueryParams('/communication');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const { state } = useLocation();
    const { showSmartLink } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { smartLinkShow } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const { savedChannelStatusId } = useSelector(({ communicationPlanReducer }) => communicationPlanReducer);
    const { smartLink1, smartLink2 } = useSelector((state) => getGeneratedLink(state));
    const [isFullScreen, setFullScreen] = useState(false);
    const { canvasState } = useContext(CreateWorkFlowContext);
    const {
        Campaign: {
            CanvasChannel: { activeChannel },
        },
    } = canvasState;

    const firstLevelActiveChannel = activeChannel;

    const isCompletedOneChannel = !savedChannelStatusId?.length
        ? false
        : savedChannelStatusId?.some((savedChannel) => {
              const findActiveChannel = firstLevelActiveChannel?.find(
                  (activeChannel) => activeChannel?.ChannelDetailID === savedChannel.channelDetailId,
              );
              if (findActiveChannel) {
                  // completed , onhold , alert , inprogress
                  if (
                      savedChannel.statusId === 5 ||
                      savedChannel.statusId === 9 ||
                      savedChannel.statusId === 52 ||
                      savedChannel.statusId === 12
                  ) {
                      return true;
                  }
              } else {
                  return false;
              }
          });

    useEffect(() => {
        if (isFullScreen && !document.fullscreenElement) {
            document.body.requestFullscreen();
        } else if (isFullScreen && document.webkitIsFullScreen) {
            document.body.requestwebkitFullscreen();
        } else if (!isFullScreen && document.webkitIsFullScreen) {
            document.webkitCancelFullScreen();
        } else if (!isFullScreen && document.fullscreenElement) {
            document.exitFullscreen();
        }
    }, [isFullScreen]);

    useEffect(() => {
        window.addEventListener('resize', fullscreenchanged);
        return () => {
            window.removeEventListener('resize', fullscreenchanged);
        };
    }, []);

    const fullscreenchanged = () => {
        if (document.webkitIsFullScreen || document.fullscreen) {
            setFullScreen(true);
        } else {
            setFullScreen(false);
        }
    };
    const handleCanvasReset = () => {
        canvasReset(true);
    };

    const { campaignName, startDate, endDate, communicationType, primaryGoal, campaignType } = {
        campaignName: state?.campaignName,
        startDate: state?.startDate,
        endDate: state?.endDate,
        communicationType: state?.communicationType,
        primaryGoal: state?.primaryGoal,
        campaignType: state?.campaignType,
    };

    // const period = `${getDateWithDay(startDate)} - ${getDateWithDay(endDate)}`;
    const period = `${getUserCurrentFormat(startDate)?.dateFormat} - ${getUserCurrentFormat(endDate)?.dateFormat}`;
    return (
        <Fragment>
            {/* Start */}
            <div className="rs-columns-block mdc-header d-flex my5 position-relative justify-content-between">
                <ul className={`d-flex align-items-center justify-content-between mr20`}>
                    <li className="mdc-logo-contain">
                        <img src={ResulticksLogoBl} alt="RESUL" />
                    </li>
                    <li className="widthSizeMedium">
                        <small>Communication name:</small>
                         <h4><TruncatedCell value = {campaignName} noTable= {true}/></h4>
                    </li>
                    <li className="widthSizeMedium">
                        <small>Period:</small>
                         <h4><TruncatedCell value = {period} noTable= {true}/></h4>
                    </li>
                    <li className="widthSizeMedium">
                        <small>Type:</small>
                        <h4><TruncatedCell value = {communicationType} noTable= {true}/></h4>
                    </li>
                    <li className="widthSizeMedium">
                        <small>Primary goal:</small>
                         <h4><TruncatedCell value = {primaryGoal} noTable= {true}/></h4>
                    </li>
                    <li className="widthSizeMedium">
                        <small>Potential audience:</small>
                        {PotentialAudienceList}
                    </li>
                </ul>

                <ul className="d-flex justify-content-end right15 align-items-center top0 bottom0">
                    <Fragment>
                        <li>
                            <RSTooltip text="Edit communication" position="left">
                                <i
                                    className="icon-rs-communication-edit-large icon-lg color-primary-blue"
                                    onClick={() => {
                                        const newState = {
                                            
                                            ...state,
                                            mode: 'edit',
                                            currentTab: getIndexBasedOnCampaign(state.campaignType),
                                            // isEditable: true,
                                        };
                                        const encryptState = encodeUrl(newState);
                                        dispatch(updateCommunicationData({ field: 'editState', data: newState }));
                                        navigate({
                                            pathname: '/communication/communication-creation',
                                            search: `?q=${encryptState}`,
                                        });
                                    }}
                                ></i>
                            </RSTooltip>
                        </li>
                        <li className={`mdc-header-icon ${isCompletedOneChannel ? 'click-off' : ''} `}>
                            <RSTooltip text="Templates" position="left">
                                {' '}
                                {TemplateList}{' '}
                            </RSTooltip>
                        </li>
                        <li
                            className={`mdc-header-icon ${
                                isCompletedOneChannel || canvasState?.nodeState?.length === 0 ? 'click-off' : ''
                            } `}
                        >
                            <Icon
                                icon={restart_large}
                                tooltip="Clear canvas"
                                position="left"
                                size="lg"
                                color="primary-color"
                                callBack={() => {
                                    handleCanvasReset();
                                }}
                            />
                        </li>
                        <li className="mdc-header-icon">
                            <Icon
                                icon={isFullScreen ? collapse_large : expand_large}
                                tooltip={isFullScreen ? 'Exit full screen' : 'Full screen'}
                                position="left"
                                size="lg"
                                color="primary-color"
                                callBack={() => {
                                    setFullScreen(!isFullScreen);
                                }}
                            />
                        </li>
                    </Fragment>
                </ul>
            </div>
            {/* End */}

            {/* Modals */}
            <SmartLink
                show={showSmartLink}
                handleClose={() => {
                    dispatch(updateSmartLinkModalState(false));
                }}
            />
        </Fragment>
    );
};

export default CampaignInfoCardMdcCanvas;
