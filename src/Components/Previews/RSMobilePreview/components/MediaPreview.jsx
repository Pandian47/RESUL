import { placeholderImage } from 'Assets/Images';
import { pdf_download_large } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
import { normalizePreviewSrc } from 'Components/Previews/SocialPostMediaPreview/Preview';
import { toEmbedUrl } from '../utils';

const MediaPreview = ({
    urlFormat = '',
    previewImage = '',
    hasError = false,
    onImageError = () => {},
}) => {
    if (!urlFormat || !previewImage) return null;

    const resolvedSrc = urlFormat === 'image' ? normalizePreviewSrc(previewImage, false) : previewImage;

    return (
        <div className="mb10">
            {urlFormat === 'image' && (
                !hasError ? (
                    <img src={resolvedSrc} alt="preview" onError={onImageError} />
                ) : (
                    <img src={placeholderImage} alt="placeholder" />
                )
            )}
            {urlFormat === 'video' && (
                <video height="auto" width="100%" controls>
                    <source src={previewImage} />
                </video>
            )}
            {urlFormat === 'embed' && (
                <div className="video-embed-wrapper">
                    <iframe
                        width="100%"
                        height="auto"
                        src={toEmbedUrl(previewImage)}
                        style={{ pointerEvents: 'none' }}
                        title="video"
                    />
                </div>
            )}
            {urlFormat === 'doc' && (
                <i className={`${pdf_download_large} icon-lg color-primary-blue pe-none`} />
            )}
        </div>
    );
};

MediaPreview.propTypes = {
    urlFormat: PropTypes.oneOf(['', 'image', 'video', 'embed', 'doc']),
    previewImage: PropTypes.string,
    hasError: PropTypes.bool,
    onImageError: PropTypes.func,
};

export default MediaPreview;
