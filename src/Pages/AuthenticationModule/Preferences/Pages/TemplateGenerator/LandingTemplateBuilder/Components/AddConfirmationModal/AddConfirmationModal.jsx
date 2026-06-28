import { useContext } from 'react';
import { CANCEL, LANDING_PAGE_NAME, SAVE, TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import { useFormContext } from 'react-hook-form';
import { ENTER_TEMPLATE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { useNavigate } from 'react-router-dom';
import { baseURL, LANDING_BUILDER_REDIRECT_URL } from 'Constants/EndPoints';
import { getSessionId } from 'Reducers/globalState/selector';
import { useSelector } from 'react-redux';
const AddConfirmationModal = ({ show, handleClose }) => {
    const { control, watch, trigger } = useFormContext();
    // const { setAddTemplate } = useContext(LandingTemplateContext);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const navigate = useNavigate();
    const [landingPageName] = watch(['landingPageName']);
    const handleDirect = () => {
        const tenantId = localStorage.getItem('uuiD') || '';
        let params = {
            templateName: landingPageName || '',
            channelId: '32',
            catagoryId: '6',
            templateId: 0,
            departmentId,
            clientId,
            userId,
        };
        let channelDetails = JSON.stringify(params);
        const token = localStorage.getItem('accessToken');
        const jwtToken = localStorage.getItem('jwtToken');
        let domain = location.origin + '/';
        const apiBaseURL = baseURL;

        window.location.href = `${LANDING_BUILDER_REDIRECT_URL}?secretKey=${encodeURIComponent(
            token,
        )}&channelDetails=${btoa(channelDetails)}&clientId=${encodeURIComponent(clientId)}&userId=${encodeURIComponent(
            userId,
        )}&departmentId=${encodeURIComponent(departmentId)}&tenantId=${encodeURIComponent(tenantId)}&templateId=${encodeURIComponent(
            0,
        )}&mode=add&jwtToken=${encodeURIComponent(jwtToken || '')}&baseURL=${encodeURIComponent(
            apiBaseURL,
        )}&from=${domain}`;
    };

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={LANDING_PAGE_NAME}
            size="md"
            className="rs-landingpage-builder-add-modal"
            body={
                <div className="form-group mb0">
                    <RSInput
                        control={control}
                        name="landingPageName"
                        required
                        label={TEMPLATE_NAME}
                        rules={{
                            required: ENTER_TEMPLATE_NAME,
                        }}
                    />
                </div>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={() => handleClose()}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        // type="submit"
                        onClick={() => {
                            handleDirect();

                            // if (!!landingPageName) {
                            //     console.log('Page name :: ', landingPageName);
                            //     let url = '/preferences/template-gallery/landingpage-builder';
                            //     const encryptState = encodeUrl({
                            //         name: landingPageName,
                            //     });
                            //     navigate(`${url}?q=${encryptState}`, {
                            //         state: {},
                            //     });
                            //     handleClose();
                            // } else trigger();
                        }}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default AddConfirmationModal;

