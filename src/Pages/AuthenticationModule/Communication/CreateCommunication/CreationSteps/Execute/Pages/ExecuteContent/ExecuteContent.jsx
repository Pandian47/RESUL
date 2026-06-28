import { getEnvironment } from 'Utils/modules/environment';
import { CANCEL, NEXT } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import List from '../../Components/List/List';
import Content from '../../Components/Content/Content';
import PredictiveAnalysis from '../../Components/PredictiveAnalysis/PredictiveAnalysis';
import ApprovalStatus from '../../Components/ApprovalStatus/ApprovalStatus';
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
