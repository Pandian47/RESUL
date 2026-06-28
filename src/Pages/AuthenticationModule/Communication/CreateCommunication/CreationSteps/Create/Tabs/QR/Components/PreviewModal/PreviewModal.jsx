import { useFormContext } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { useSelector } from 'react-redux';

const PreviewModal = ({ preview, setPreview }) => {
    const { control } = useFormContext();
    const { qr } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    const footerData = (
        <div className="buttons-holder mt0">
            <RSSecondaryButton onClick={() => setPreview(false)}>Cancel</RSSecondaryButton>
            <RSPrimaryButton type={'submit'}>Submit</RSPrimaryButton>
        </div>
    );
    return (
        <div>
            <RSModal
                show={preview}
                handleClose={() => {
                    setPreview(false);
                }}
                header={'Form preview'}
                body={
                    <iframe
                        title="Form preview"
                        srcDoc={qr?.url?.getKYClistID[0]?.htmlcodeclient || null}
                        style={{ width: '100%', minHeight: '500px' }}
                    ></iframe>
                }
                footer={footerData}
            />
        </div>
    );
};

export default PreviewModal;
