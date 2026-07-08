import { getEnvironment } from 'Utils/modules/environment';
import {
    APPROVAL_STATUS,
    CANCEL,
    CONTENT,
    LIST,
    NEXT,
    PRE_COMMUNICATION_ANALYTICS,
} from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import List from '../../Components/List/List';
import Content from '../../Components/Content/Content';
import PredictiveAnalysis from '../../Components/PredictiveAnalysis/PredictiveAnalysis';
import ApprovalStatus from '../../Components/ApprovalStatus/ApprovalStatus';
import {
    ApprovalStatusSkeleton,
    HorizontalSkeleton,
    PredictiveAnalysisSkeleton,
} from 'Components/Skeleton/Skeleton';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import { resetCreateCommunication } from 'Reducers/communication/createCommunication/create/reducer';
import { useDispatch } from 'react-redux';

const ExecuteContent = ({ 
    tab, 
    tabConfig, 
    subSegLevel,
    validateCGTGForAllChannels,
    setShowCGTGWarning,
    setPendingCGTGChannel,
    setDefaultTab,
    setTabData,
    handleCGTGValidated,
    isEmptyChannelData = false,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const handleNextClick = () => {
        const validation = validateCGTGForAllChannels();
        let checkIsValidChannelEnv =  true;//getEnvironment() === 'RUN' && ['whatsapp','rcs']?.includes(tab?.toLowerCase())  ? false : true
        if (!validation.isValid && checkIsValidChannelEnv) {
            setPendingCGTGChannel(validation.firstChannelNeedingAction);
            setShowCGTGWarning(true);
            return;
        }
        
        dispatch(resetCreateCommunication());
        navigate('/communication', {
            index: 0,
        });
    };
    
    if (isEmptyChannelData) {
        return (
            <div className="mt26 precommunicationAnalytics">
                <Row>
                    <Col sm={6}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h4>{LIST}</h4>
                            </div>
                            <HorizontalSkeleton isError />
                        </div>
                    </Col>
                    <Col sm={6}>
                        <div className="portlet-container portlet-md">
                            <div className="portlet-header">
                                <h4>{CONTENT}</h4>
                            </div>
                            <HorizontalSkeleton isError />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="portlet-container portlet-md mb20">
                            <div className="portlet-header">
                                <h4>{PRE_COMMUNICATION_ANALYTICS}</h4>
                            </div>
                            <PredictiveAnalysisSkeleton isError />
                        </div>
                    </Col>
                    <Col>
                        <div className="portlet-container portlet-md p0 mb20">
                            <div className="portlet-header p19 mb0" style={{ height: 'auto' }}>
                                <h4>{APPROVAL_STATUS}</h4>
                            </div>
                            <ApprovalStatusSkeleton isError selectedTab="Communication" />
                        </div>
                    </Col>
                </Row>
                <div className="buttons-holder mt0">
                    <RSSecondaryButton
                        onClick={() => {
                            dispatch(resetCreateCommunication());
                            navigate('/communication', {
                                index: 0,
                            });
                        }}
                        id="rs_ExecuteContent_Cancel"
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton onClick={handleNextClick} id="rs_ExecuteContent_Next">
                        {NEXT}
                    </RSPrimaryButton>
                </div>
            </div>
        );
    }

    return (
        <div className="mt26 precommunicationAnalytics">
            <Row>
                <Col sm={6}>
                    <List tab={tab} tabConfig={tabConfig} handleCGTGValidated={handleCGTGValidated} />
                </Col>
                <Col sm={6}>
                    <Content tab={tab} subSegLevel={subSegLevel} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <PredictiveAnalysis tab={tab} />
                </Col>
                {tab !== 'QR' && (
                    <Col>
                        <ApprovalStatus tab={tab} />
                    </Col>
                )}
            </Row>
            <div className="buttons-holder mt0">
                <RSSecondaryButton
                    onClick={() => {
                        dispatch(resetCreateCommunication());
                        navigate('/communication', {
                            index: 0,
                        });
                    }}
                    id="rs_ExecuteContent_Cancel"
                >
                    {CANCEL}
                </RSSecondaryButton>
                <RSPrimaryButton
                    onClick={handleNextClick}
                    id="rs_ExecuteContent_Next"
                >
                    {NEXT}
                </RSPrimaryButton>
            </div>
        </div>
    );
};

export default ExecuteContent;
