
const ImagePreview = ({ content, name, from, previewImage = '' }) => {
    return (
        <>
            {from === 'Analytics' ? (
                <div className="rs-preview-content" dangerouslySetInnerHTML={{ __html: content }} />
            ) : previewImage ? (
                <div className="rs-preview-content css-scrollbar">
                    <img alt="" src={previewImage} />
                </div>
            ) : (
                <div className="rs-preview-content css-scrollbar">
                    <img alt="" src={`data:image/jpeg;base64,${content}`} />
                </div>
            )}
        </>
    );
};

export default ImagePreview;
