import { useState } from 'react';
import RSModal from 'Components/RSModal';
import { useFormContext } from 'react-hook-form';
import ReactDOM from 'react-dom';

const CodePreviewModal = ({ show, handleClose, data }) => {
    const { getValues } = useFormContext();
    // var data = getValues('codeData');
    // const [data, setData] = useState(<div>{getValues('codeData')}</div>);
    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header={'Preview'}
            body={<div id={'codeDataValues'}>{ReactDOM.render(data)}</div>}
        />
    );
};

export default CodePreviewModal;
