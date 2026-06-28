import RSModal from 'Components/RSModal';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { RSPrimaryButton } from 'Components/Buttons';
import { useForm } from 'react-hook-form';

const text =
    ' <a title="Real Time Web Analytics" href="https://clicky.com/100642641"><img alt="Real Time Web Analytics" src="//static.getclicky.com/media/links/badge.gif" border="0"></a><script src="//static.getclicky.com/js"></script><script>try{clicky.init(100642641);}catch (e) {}</script><noscript><img alt="Clicky" width="1" height="1" src="//in.getclicky.com/100642641ns.gif"></noscript>';

const ViewEyeModel = ({ show, handleClose }) => {
    const { control } = useForm();

    return (
        <RSModal
            show={show}
            size="md"
            header={'Generated code'}
            handleClose={handleClose}
            body={
                <div className="form-group">
                    <RSTextarea control={control} rows={5} name="viewText" defaultValue={text} />
                </div>
            }
            footer={
                <div className="btn-container d-flex justify-content-end mt0">
                    <RSPrimaryButton onClick={() => handleClose()}>Copy</RSPrimaryButton>
                </div>
            }
        />
    );
};
export default ViewEyeModel;
