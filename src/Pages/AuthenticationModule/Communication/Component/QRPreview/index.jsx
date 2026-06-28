import { placeholderImage } from 'Assets/Images';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';



const QRPreview = ({ content }) => {
    return (
        <div className="rs-preview-content">
            <div className="rspc-content">
                <div className="text-center">
                    <div className="message">
                        {content ? <img
                            src={`data:image/png;base64,${content}`}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = placeholderImage;
                            }}
                        /> :
                            <NoDataAvailableRender />}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRPreview;
