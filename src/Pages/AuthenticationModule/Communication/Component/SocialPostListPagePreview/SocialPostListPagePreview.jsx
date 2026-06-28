
import { memo, useMemo } from 'react';

import RSSocialPostPreview from 'Components/Previews/RSSocialPostPreview';
import Preview from 'Components/Previews/SocialPostMediaPreview';
import { resolveGalleryMediaForSocialPreview, resolveStringifiedMediaUrlList } from '../../utils/galleryBannerMedia';

const getChannelType = (socialPostChannelId) => {
    const id = Number(socialPostChannelId);
    if (!Number.isFinite(id)) return 'facebook';
    switch (id) {
        case 1:
            return 'facebook';
        case 3:
            return 'twitter';
        case 5:
            return 'pinterest';
        case 6:
            return 'instagram';
        case 8:
            return 'linkedIn';
        default:
            return 'facebook';
    }
};

const getPreviewLayout = (socialPostType) => {
    if (socialPostType === 'instagram' || socialPostType === 'pinterest') return 'instagram';
    if (socialPostType === 'facebook') return 'facebook';
    if (socialPostType === 'linkedIn') return 'linkedIn';
    return 'default';
};

/** When primary `imageUrl` is shown in `Preview`, strip duplicate embeds from HTML caption (listing / gallery). */
const stripEmbeddedMediaFromHtml = (html) => {
    if (typeof document === 'undefined' || !html || typeof html !== 'string') return html;
    try {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        temp.querySelectorAll('img,video,iframe,object,embed').forEach((el) => el.remove());
        return temp.innerHTML;
    } catch {
        return html;
    }
};

const SocialPostListPagePreview = ({ data }) => {
    const socialPostType = getChannelType(data?.socialPostChannelId);
    const content = data?.content || data?.contentJson || '';
    const isGallery = data?.isGallery || false;
    const postName = data?.postName || data?.name || '';

    /** Stringified JSON array of URLs from listing APIs → drive carousel via `galleryImages`. */
    const pathUrlList = useMemo(
        () => resolveStringifiedMediaUrlList(data?.imagePath ?? data?.imageUrl ?? ''),
        [data?.imagePath, data?.imageUrl],
    );

    const mergedGalleryImages = useMemo(() => {
        const gp = Array.isArray(data?.galleryImages) ? data.galleryImages : [];
        if (pathUrlList.length > 1) return pathUrlList;
        if (gp.length > 0) return gp;
        if (pathUrlList.length === 1) return pathUrlList;
        return [];
    }, [pathUrlList, data?.galleryImages]);

    const primaryMediaUrl = useMemo(() => {
        const gp = Array.isArray(data?.galleryImages) ? data.galleryImages : [];
        if (pathUrlList.length > 1) return '';
        if (pathUrlList.length === 1 && gp.length === 0) return pathUrlList[0];
        return resolveGalleryMediaForSocialPreview(data);
    }, [data, pathUrlList]);

    const hasContent =
        content?.length > 0 ||
        primaryMediaUrl.length > 0 ||
        mergedGalleryImages.length > 0 ||
        String(postName)?.length > 0;

    const editorText = useMemo(() => {
        if (!content) return '';
        if (!primaryMediaUrl) return content;
        return stripEmbeddedMediaFromHtml(content);
    }, [content, primaryMediaUrl]);

    const previewLayout = getPreviewLayout(socialPostType);
    if (!hasContent) {
        return <div className={isGallery ? 'gallery-preview border-0 p0' : ''} />;
    }

    return (
        <div className={isGallery ? 'gallery-preview border-0 p0' : ''}>
            <RSSocialPostPreview
                socialPostType={socialPostType}
                editorText={editorText}
                scheduleDate={data?.scheduleTime || data?.scheduledDate || data?.schedule || data?.scheduleDateTime || data?.scheduleDate}
                isGallery={isGallery}
                contentClassName={
                    isGallery
                        ? 'border-tlr10 border-trr10 border-blr10 border-brr10 gallery-content css-scrollbar'
                        : 'css-scrollbar'
                }
            >
                {primaryMediaUrl || mergedGalleryImages.length > 0 ? (
                    <Preview
                        previewImage={primaryMediaUrl}
                        galleryImages={mergedGalleryImages}
                        previewLayout={previewLayout}
                        previewMediaType="image"
                        mode={false}
                    />
                ) : null}
            </RSSocialPostPreview>
        </div>
    );
};

export default memo(SocialPostListPagePreview);
