import { useFormContext } from 'react-hook-form';
const Preview = ({ fieldName, type = 'image', size }) => {
    const { watch } = useFormContext();
    const watchImage = watch(fieldName);
    // const watchImageSize = watch(`${fieldName}.size.size`);
    const getImageDimensions = (size) => {
        if (!size) return null;
        const match = size.match(/^(\d+)x(\d+)$/);
        return match ? { width: `${match[1]}px`, height: `${match[2]}px` } : null;
    };
    const imageStyles = getImageDimensions(size);

    return (
        <div className="digipop-preview">
            <>
                {watchImage && (watchImage[type] || (watchImage[`${type}Url`] && watchImage?.isPreviewImageUrl)) && (
                    <div className={`digipop-preview-text d-flex justify-content-end pr0`}>
                        <div className="rsamp-text">Preview</div>
                    </div>
                )}

                {watchImage && (watchImage[type] || (watchImage[`${type}Url`] && watchImage?.isPreviewImageUrl)) && (
                    <div className=" mt10 image-preview d-flex justify-content-center p19">
                        <div className=" m-auto css-scrollbar">
                            {type === 'video' ? (
                                <video
                                    src={watchImage?.videoType === 'URL' ? watchImage?.videoUrl : watchImage?.video}
                                    controls
                                    className="w-100"
                                />
                            ) : type === 'audio' ? (
                                <audio
                                    src={watchImage?.audioType === 'URL' ? watchImage?.audioUrl : watchImage?.audio}
                                    controls
                                />
                            ) : (
                                <>
                                    <img
                                        alt=""
                                        src={
                                            watchImage?.imageType === 'URL'
                                                ? watchImage?.imageUrl
                                                : `${watchImage?.image}`
                                        }
                                        style={imageStyles}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </>
            {watchImage && (watchImage[type] || (watchImage[`${type}Url`] && watchImage?.isPreviewImageUrl)) && (
                <small className="text-end">Varies by device</small>
            )}
        </div>
    );
};

export default Preview;
