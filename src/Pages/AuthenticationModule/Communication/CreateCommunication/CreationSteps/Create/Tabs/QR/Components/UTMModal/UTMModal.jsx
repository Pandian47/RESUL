import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import UTMParameters from '../../../../Component/SmartLinkModal/Component/GenerateSmartLink/UTMParameter/UTMParameters';
import { useFormContext } from 'react-hook-form';

const UTMModal = ({ show, setUTMModal, submitParams }) => {
    const { watch } = useFormContext();
    const watchLink = watch();
    const bodyData = (
        <div>
            <h3 className="mb30">UTM Parameter</h3>
            <UTMParameters fieldArrayName={''} fieldInsertName={''} modal={true} />
        </div>
    );

    const footerData = (
        <div className="buttons-holder">
            <RSSecondaryButton type={'button'} onClick={() => setUTMModal(false)}>
                Cancel
            </RSSecondaryButton>
            <RSPrimaryButton
                type={'button'}
                onClick={(e) => {
                    setUTMModal(false);
                    submitParams();
                }}
            >
                Submit
            </RSPrimaryButton>
        </div>
    );
    return (
        <div>
            <RSModal
                show={show}
                header={'URL Settings'}
                body={bodyData}
                footer={footerData}
                handleClose={() => setUTMModal(false)}
            />
            {/* <p>ahsda</p> */}
        </div>
    );
};

export default UTMModal;
