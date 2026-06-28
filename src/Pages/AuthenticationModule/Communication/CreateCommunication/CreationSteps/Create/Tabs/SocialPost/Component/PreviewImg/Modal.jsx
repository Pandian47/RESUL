import RSModal from 'Components/RSModal';
import RSSocialPostPreview from 'Components/Previews/RSSocialPostPreview';
import Preview from 'Components/Previews/SocialPostMediaPreview/Preview';

/**
 * Modal uses the same preview stack as the editor column (RSSocialPostPreview + Preview)
 * so layout, empty state, and media sizing stay consistent.
 */
const PreviewModal = ({
    type,
    previewFlag,
    setPreviewFlage,
    previewImage = '',
    editorText,
    mode,
    galleryImages = [],
    previewLayout,
    previewMediaType = 'image',
    scheduleDate,
}) => {
    const resolvedLayout =
        previewLayout ||
        (type === 'instagram'
            ? 'instagram'
            : type === 'facebook'
              ? 'facebook'
              : type === 'linkedIn'
                ? 'linkedIn'
                : 'default');

    const trimmedPrimary = typeof previewImage === 'string' ? previewImage.trim() : '';
    const hasGallery = Array.isArray(galleryImages) && galleryImages.length > 0;
    const showPreviewMedia = hasGallery || trimmedPrimary.length > 0;

    return (
        <RSModal
            size="md"
            className="Socialpost-preview-modal"
            show={previewFlag}
            handleClose={() => {
                setPreviewFlage(false);
            }}
            isBorder
            header={`${type.replace(/^./, type[0].toUpperCase())}  preview`}
            body={
                <RSSocialPostPreview socialPostType={type} editorText={editorText} scheduleDate={scheduleDate}>
                    {showPreviewMedia ? (
                        <Preview
                            previewImage={trimmedPrimary}
                            galleryImages={galleryImages}
                            previewLayout={resolvedLayout}
                            previewMediaType={previewMediaType}
                            mode={mode}
                        />
                    ) : null}
                </RSSocialPostPreview>
            }
        />
    );
};

export default PreviewModal;
