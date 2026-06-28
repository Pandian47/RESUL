import RSModal from 'Components/RSModal';

const PreviewModal = ({ show = false, handleClose = ()=>{}, data= '', title = 'Preview' }) => {
        const nonClickableHTML = `
        <style>
            a, button, input, textarea, select, img {
                pointer-events: none !important;
            }
        </style>
        ${data}
    `;

    return (
        <RSModal
            show={show}
            size={'xxlg'}
            handleClose={handleClose}
            header={title}
            className='Preview_emailbuilder'
            closeTooltipPosition={true}
            bodyClassName='custom_modal_tableTop'
            body={
                    <iframe 
                        srcDoc={nonClickableHTML}
                        className='w-100 h-100 border-0' 
                        style={{
                            minHeight: '400px'
                        }}
                    />
            }
        />
    );
};

export default PreviewModal;
