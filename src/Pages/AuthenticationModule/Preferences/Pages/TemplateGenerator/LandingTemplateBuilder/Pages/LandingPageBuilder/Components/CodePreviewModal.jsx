import RSModal from 'Components/RSModal';
import { useFormContext } from 'react-hook-form';

const CodePreviewModal = ({ show, handleClose, data }) => {
    const { getValues } = useFormContext();
    // var data = getValues('codeData');
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={'Preview'}
            body={<div id={'codeDataValues'}>{data}</div>}
        />
    );
};

export default CodePreviewModal;
