import RSAlert from 'Components/RSAlert';
import { ScriptBlock } from 'Assets/Images';
import { Container } from 'react-bootstrap';
import { RSPrimaryButton } from 'Components/Buttons';
import content from 'Constants/GlobalConstant/Content/content.json';
import { updateSessionModal } from 'Reducers/globalState/reducer';
import { useDispatch } from 'react-redux';

const DisablePluginModal = ({ show, handleConfirm }) => {
    const dispatch = useDispatch();
    const handleProceed = () => {
        localStorage.setItem('disable_plugin_last_shown', new Date());
        handleConfirm();
        localStorage.setItem('sessionModal', false);
        dispatch(updateSessionModal(false));
    };

    return (
        <div className="rs-homepage-alert-wrapper">
            <RSAlert
                show={show}
                header={false}
                body={
                    <Container>
                        <div className="d-flex align-items-center justify-content-center">
                            <div>
                                <img src={ScriptBlock} alt="scriptBlock" width={120} height={120} />
                            </div>
                            <div>
                                <h3>{content.loginPage.disablePluginText}</h3>
                            </div>
                            <div>
                                <RSPrimaryButton id="rs_DisablePluginModal_proceed" onClick={handleProceed}>
                                    {content.proceed}
                                </RSPrimaryButton>
                            </div>
                        </div>
                    </Container>
                }
            />
        </div>
    );
};

export default DisablePluginModal;
