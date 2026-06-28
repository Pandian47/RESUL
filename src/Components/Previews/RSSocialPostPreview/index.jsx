import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { pinterestBg, userImg } from 'Assets/Images';
import { circle_menu_dot_horizontal_medium, facebook_comment_medium, facebook_like_medium, facebook_share_medium, instagram_like_medium, instagram_reply_medium, instagram_share_medium, linkedin_comment_medium, linkedin_like_medium, linkedin_repost_medium, linkedin_send_medium, pinterest_like_medium, pinterest_reply_medium, pinterest_share_medium, social_facebook_medium, social_instagram_medium, social_linkedin_medium, social_pinterest_medium, social_twitter_medium, social_twitter_tag_medium, x_like_medium, x_reply_medium, x_repost_medium, x_share_medium, x_view_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, memo, useMemo, useState } from 'react';
import { SHOW_LESS, SHOW_MORE } from 'Constants/GlobalConstant/Placeholders';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import facebookMediumIcon from 'Assets/Images/SocilaIcons/Medium/rs-facebook-medium.svg';
import instagramMediumIcon from 'Assets/Images/SocilaIcons/Medium/rs-instagram-medium.svg';
import linkedinMediumIcon from 'Assets/Images/SocilaIcons/Medium/rs-linkedin-medium.svg';
import xMediumIcon from 'Assets/Images/SocilaIcons/Medium/rs-x-medium.svg';

const PLATFORM_BADGE_ICON_SRC_BY_TYPE = {
    facebook: facebookMediumIcon,
    instagram: instagramMediumIcon,
    linkedIn: linkedinMediumIcon,
    twitter: xMediumIcon,
};

const PlatformBadge = ({ socialPostType, fallbackIconClass, className = '' }) => {
    const src = PLATFORM_BADGE_ICON_SRC_BY_TYPE[socialPostType];
    return (
        <div className={`rs-social-preview-platform-badge ${className}`.trim()} aria-hidden="true">
            {src ? <img src={src} alt="" /> : <i className={`${fallbackIconClass} icon-md`} />}
        </div>
    );
};

const PreviewMenuSlot = ({ isGallery, socialPostType, fallbackIconClass, className }) => {
    if (isGallery) {
        return (
            <span className={className}>
                <PlatformBadge socialPostType={socialPostType} fallbackIconClass={fallbackIconClass} />
            </span>
        );
    }

    return (
        <span className={className}>
            <i className={`${circle_menu_dot_horizontal_medium} icon-md color-secondary-grey cursor-default`} aria-hidden />
        </span>
    );
};

const NoPreviewAvailable = () => (
    <div className="d-flex justify-content-center align-items-center flex-grow-1 h-100 w-100 color-secondary-grey">
        No preview available
    </div>
);

const getPlainText = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html || '';
    return temp.textContent || temp.innerText || '';
};

const processTextForStyling = (text) => {
    if (!text) return [];
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const hashtagPattern = /#[\w]+/g;
    const allMatches = [];
    let match;

    while ((match = urlPattern.exec(text)) !== null) {
        allMatches.push({
            type: 'url',
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
        });
    }
    while ((match = hashtagPattern.exec(text)) !== null) {
        allMatches.push({
            type: 'hashtag',
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
        });
    }
    allMatches.sort((a, b) => a.start - b.start);

    const filteredMatches = [];
    for (let i = 0; i < allMatches.length; i++) {
        const current = allMatches[i];
        const overlaps = filteredMatches.some(
            (m) =>
                (current.start >= m.start && current.start < m.end) ||
                (current.end > m.start && current.end <= m.end) ||
                (current.start <= m.start && current.end >= m.end),
        );
        if (!overlaps) {
            filteredMatches.push(current);
        }
    }

    const parts = [];
    let lastIndex = 0;
    for (const m of filteredMatches) {
        if (m.start > lastIndex) {
            parts.push({ type: 'text', text: text.substring(lastIndex, m.start) });
        }
        parts.push({ type: m.type, text: m.text });
        lastIndex = m.end;
    }
    if (lastIndex < text.length) {
        parts.push({ type: 'text', text: text.substring(lastIndex) });
    }
    return parts.length > 0 ? parts : [{ type: 'text', text }];
};

const formatTextWithLineBreaks = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, lineIndex, array) => {
        const parts = processTextForStyling(line);
        return (
            <Fragment key={lineIndex}>
                {parts.map((part, partIndex) => {
                    if (part.type === 'url' || part.type === 'hashtag') {
                        return (
                            <span key={partIndex} style={{ color: '#1877f2' }}>
                                {part.text}
                            </span>
                        );
                    }
                    return <Fragment key={partIndex}>{part.text}</Fragment>;
                })}
                {lineIndex < array.length - 1 && <br />}
            </Fragment>
        );
    });
};

const formatTextForHTML = (text) => {
    if (!text) return '';
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };
    const lines = text.split('\n');
    const processedLines = lines.map((line) => {
        const parts = processTextForStyling(line);
        return parts
            .map((part) => {
                if (part.type === 'url' || part.type === 'hashtag') {
                    return `<span style="color: #1877f2;">${escapeHtml(part.text)}</span>`;
                }
                return escapeHtml(part.text);
            })
            .join('');
    });
    return processedLines.join('<br>');
};

/** Truncated / expandable caption (plain text derived from editor HTML). */
const PostCaption = ({ editorText, isTwitter, className = '', contentClassName = 'post-content' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const plainText = useMemo(() => getPlainText(editorText), [editorText]);
    const maxLength = isTwitter ? 60 : 80;
    const shouldTruncate = plainText.length > maxLength;
    const truncatedText = shouldTruncate ? `${plainText.substring(0, maxLength)}...` : plainText;

    if (!editorText && plainText.length === 0) {
        return null;
    }

    return (
        <div className={`${contentClassName} ${className}`.trim()}>
            {isExpanded ? (
                <span className="show-more-open" dangerouslySetInnerHTML={{ __html: formatTextForHTML(plainText) }} />
            ) : (
                <span className="show-less-close">{formatTextWithLineBreaks(truncatedText)}</span>
            )}
            {shouldTruncate ? (
                <button
                    type="button"
                    className="see-more-toggle border-0 bg-transparent p0 d-inline"
                    onClick={() => setIsExpanded((p) => !p)}
                >
                    {isExpanded ? ` ${SHOW_LESS}` : ` ${SHOW_MORE}`}
                </button>
            ) : null}
        </div>
    );
};

const useProfile = (scheduleDate) => {
    const date = useMemo(() => (scheduleDate ? new Date(scheduleDate) : new Date()), [scheduleDate]);
    const { firstName, profileImage } = getUserDetails();
    const profilePicture = profileImage ? `data:image/png;base64,${profileImage}` : userImg;
    const displayName = firstName || '';
    const metaTime = getUserCurrentFormat(date)?.dateTimeFormat || '';
    return { profilePicture, displayName, metaTime };
};

const FacebookPreviewCard = ({ editorText, children, scheduleDate, isGallery = false }) => {
    const { profilePicture, displayName, metaTime } = useProfile(scheduleDate);
    const hasText = Boolean(getPlainText(editorText || '').trim());
    const hasMedia = hasRenderableChildren(children);
    return (
        <div className="rs-facebook-preview-card">
            <div className="rs-facebook-preview-card__header">
                {!isGallery ? (
                    <PlatformBadge
                        socialPostType="facebook"
                        fallbackIconClass={social_facebook_medium}
                        className="mb10"
                    />
                ) : null}
                <div className="rs-facebook-preview-card__profile">
                    <div className="rs-facebook-preview-card__avatar fts-pic">
                        <img src={profilePicture} alt="" />
                    </div>
                    <div className="fts-info-wrapper">
                        <div className="name">
                            <div className="font-semi-bold fs15"> <TruncateCell value={displayName || '—'} noTable ={true}/></div>
                            
                        </div>
                        <div className="meta-line">
                            <span className="time">{metaTime}</span>
                        </div>
                    </div>
                    <PreviewMenuSlot
                        isGallery={isGallery}
                        socialPostType="facebook"
                        fallbackIconClass={social_facebook_medium}
                        className="rs-facebook-preview-card__menu"
                    />
                </div>
            </div>

            <div className="rs-facebook-preview-card__main css-scrollbar">
                {!hasText && !hasMedia ? (
                    <NoPreviewAvailable />
                ) : (
                    <>
                        {hasText ? (
                            <PostCaption
                                editorText={editorText}
                                isTwitter={false}
                                contentClassName="rs-facebook-preview-card__caption post-content"
                            />
                        ) : null}
                        {hasMedia ? <div className="rs-facebook-preview-card__media">{children}</div> : null}
                    </>
                )}
            </div>

            <div className="rs-facebook-preview-actions post-bottom-section post-bottom-section--facebook">
                <ul>
                    <li>
                        <i className={`${facebook_like_medium} icon-md`} aria-hidden />
                        <span className="fs12">Like</span>
                    </li>
                    <li>
                        <i className={`${facebook_comment_medium} icon-md`} aria-hidden />
                        <span className="fs12">Comment</span>
                    </li>
                    <li>
                        <i className={`${facebook_share_medium} icon-md`} aria-hidden />
                        <span className="fs12">Share</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const LinkedInPreviewCard = ({ editorText, children, scheduleDate, isGallery = false }) => {
    const { profilePicture, displayName, metaTime } = useProfile(scheduleDate);
    const hasText = Boolean(getPlainText(editorText || '').trim());
    const hasMedia = hasRenderableChildren(children);
    return (
        <div className="rs-linkedin-preview-card">
            {!isGallery ? (
                <PlatformBadge
                    socialPostType="linkedIn"
                    fallbackIconClass={social_linkedin_medium}
                    className="mb10"
                />
            ) : null}
            <div className="rs-linkedin-preview-card__topbar">
                <div className="rs-linkedin-preview-card__profile">
                    <div className="rs-linkedin-preview-card__avatar fts-pic">
                        <img src={profilePicture} alt="" className='bo'/>
                    </div>
                    <div className="fts-info-wrapper">
                        <div className="name">
                            <p className="font-semi-bold fs15"> <TruncateCell value={displayName || '—'} noTable ={true}/></p>
                        </div>
                        <div className="meta-line">
                            <span className="time">{metaTime}</span>
                        </div>
                    </div>
                </div>
                <PreviewMenuSlot
                    isGallery={isGallery}
                    socialPostType="linkedIn"
                    fallbackIconClass={social_linkedin_medium}
                    className="rs-linkedin-preview-card__menu"
                />
            </div>

            <div className="rs-linkedin-preview-card__scroll css-scrollbar">
                {!hasText && !hasMedia ? (
                    <NoPreviewAvailable />
                ) : (
                    <>
                        {hasText ? (
                            <PostCaption
                                editorText={editorText}
                                isTwitter={false}
                                contentClassName="rs-linkedin-preview-card__body post-content"
                            />
                        ) : null}
                        {hasMedia ? <div className="rs-linkedin-preview-card__media">{children}</div> : null}
                    </>
                )}
            </div>

            <div className="rs-linkedin-preview-card__actions post-bottom-section post-bottom-section--linkedin">
                <ul>
                    <li>
                        <i className={`${linkedin_like_medium} icon-md`} aria-hidden />
                        <span className="fs12">Like</span>
                    </li>
                    <li>
                        <i className={`${linkedin_comment_medium} icon-md`} aria-hidden />
                        <span className="fs12">Comment</span>
                    </li>
                    <li>
                        <i className={`${linkedin_repost_medium} icon-md`} aria-hidden />
                        <span className="fs12">Repost</span>
                    </li>
                    <li>
                        <i className={`${linkedin_send_medium} icon-md`} aria-hidden />
                        <span className="fs12">Send</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const InstagramPreviewCard = ({ editorText, children, scheduleDate, isGallery = false }) => {
    const { profilePicture, displayName } = useProfile(scheduleDate);
    const hasText = Boolean(getPlainText(editorText || '').trim());
    const hasMedia = hasRenderableChildren(children);
    return (
        <div className="rs-instagram-preview-card">
            {!isGallery ? (
                <PlatformBadge
                    socialPostType="instagram"
                    fallbackIconClass={social_instagram_medium}
                    className="mb10"
                />
            ) : null}
            <div className="rs-instagram-preview-card__header">
                <div className="rs-instagram-preview-card__avatar fts-pic">
                    <img src={profilePicture} alt="" />
                </div>
                <div className="rs-instagram-preview-card__header-main">
                    <div className="name">
                         <p className="font-semi-bold fs15"> <TruncateCell value={displayName || '—'} noTable ={true}/></p>
                    </div>
                </div>
                <PreviewMenuSlot
                    isGallery={isGallery}
                    socialPostType="instagram"
                    fallbackIconClass={social_instagram_medium}
                    className="rs-instagram-preview-card__menu"
                />
            </div>

            <div className="rs-instagram-preview-card__scroll css-scrollbar">
                {!hasText && !hasMedia ? (
                    <NoPreviewAvailable />
                ) : (
                    <>
                        {hasText ? (
                            <PostCaption
                                editorText={editorText}
                                isTwitter={false}
                                contentClassName="rs-instagram-preview-card__caption post-content"
                            />
                        ) : null}
                        {hasMedia ? <div className="rs-instagram-preview-card__media">{children}</div> : null}
                    </>
                )}
            </div>

            <div className="rs-instagram-preview-card__toolbar">
                <div className="rs-instagram-preview-card__toolbar-left">
                    <i className={`${instagram_like_medium} icon-md`} aria-hidden />
                    <i className={`${instagram_reply_medium} icon-md`} aria-hidden />
                    <i className={`${instagram_share_medium} icon-md`} aria-hidden />
                    <i className={`${linkedin_repost_medium} icon-md`} aria-hidden />
                </div>
                <i className={`${social_twitter_tag_medium} icon-md`} aria-hidden />
            </div>
        </div>
    );
};

const TwitterPreviewCard = ({ editorText, children, scheduleDate, isGallery = false }) => {
    const { profilePicture, displayName, metaTime } = useProfile(scheduleDate);
    const hasText = Boolean(getPlainText(editorText || '').trim());
    const hasMedia = hasRenderableChildren(children);

    return (
        <>
            <div className={`rs-twitter-preview__header post-top-section mb10${isGallery ? ' rs-twitter-preview__header--gallery' : ''}`}>
                {!isGallery ? (
                    <PlatformBadge
                        socialPostType="twitter"
                        fallbackIconClass={social_twitter_medium}
                        className="mb10"
                    />
                ) : null}
                <ul className="rs-list-inline">
                    <li>
                        <div className="fts-pic">
                            <img src={profilePicture} alt="" />
                        </div>
                    </li>
                    <li className="rs-twitter-preview__info">
                        <div className="fts-info-wrapper">
                            <div className="name">
                                <TruncateCell value={displayName || '—'} noTable={true} />
                            </div>
                            <span className="time">
                                {isGallery ? (
                                    <TruncateCell value={scheduleDate ? metaTime : 'now'} noTable={true} />
                                ) : (
                                    `· ${scheduleDate ? metaTime : 'now'}`
                                )}
                            </span>
                        </div>
                    </li>
                </ul>
                {isGallery ? (
                    <PreviewMenuSlot
                        isGallery={isGallery}
                        socialPostType="twitter"
                        fallbackIconClass={social_twitter_medium}
                        className="rs-twitter-preview-card__menu"
                    />
                ) : null}
            </div>
            <div className="rs-twitter-preview__scroll css-scrollbar text-left">
                {!hasText && !hasMedia ? (
                    <NoPreviewAvailable />
                ) : (
                    <>
                        {hasText ? <PostCaption editorText={editorText} isTwitter contentClassName="post-content" /> : null}
                        {hasMedia ? children : null}
                    </>
                )}
            </div>
            <div className="rs-twitter-preview__footer post-bottom-section">
                <ul className="d-flex flex-wrap align-items-center gap-2">
                    <li>
                        <i className={`${x_reply_medium} icon-md color-primary-white`} aria-hidden />
                    </li>
                    <li>
                        <i className={`${x_repost_medium} icon-md color-primary-white`} aria-hidden />
                    </li>
                    <li>
                        <i className={`${x_like_medium} icon-md color-primary-white`} aria-hidden />
                    </li>
                    <li>
                        <i className={`${x_view_medium} icon-md color-primary-white`} aria-hidden />
                    </li>
                    <li>
                        <i className={`${social_twitter_tag_medium} icon-md color-primary-white`} aria-hidden />
                    </li>
                    <li>
                        <i className={`${x_share_medium} icon-md color-primary-white`} aria-hidden />
                    </li>
                </ul>
            </div>
        </>
    );
};

const PinterestPreviewCard = ({ editorText, children, contentdata, scheduleDate, isGallery = false }) => {
    const { profilePicture, displayName } = useProfile(scheduleDate);
    const hasText = Boolean(getPlainText(editorText || '').trim());
    const hasMedia = hasRenderableChildren(children);

    return (
        <>
            {isGallery ? (
                <div className="rs-pinterest-preview-card__topbar d-flex justify-content-end mb10">
                    <PlatformBadge socialPostType="pinterest" fallbackIconClass={social_pinterest_medium} />
                </div>
            ) : (
                <PlatformBadge
                    socialPostType="pinterest"
                    fallbackIconClass={social_pinterest_medium}
                    className="mb10"
                />
            )}
            <div className="rs-pinterest-preview__scroll css-scrollbar">
                {!hasText && !hasMedia ? (
                    <NoPreviewAvailable />
                ) : (
                    <>
                        {hasText ? (
                            <div
                                className="post-content whitespace-pre-wrap pe-none"
                                dangerouslySetInnerHTML={{ __html: formatTextForHTML(getPlainText(editorText)) }}
                            />
                        ) : null}
                        {hasMedia ? children : null}
                    </>
                )}
            </div>
            <div className="rs-pinterest-preview__footer post-bottom-section">
                <ul className="justify-content-start">
                    <li>
                        <i className={`${pinterest_like_medium} icon-md color-primary-white mr10`} aria-hidden />
                    </li>
                    <li>
                        <i className={`${pinterest_reply_medium} icon-md color-primary-white mr10`} aria-hidden />
                    </li>
                    <li>
                        <i className={`${pinterest_share_medium} icon-md color-primary-white mr10`} aria-hidden />
                    </li>
                    <li className="color-secondary-grey mt-10">...</li>
                </ul>
            </div>
        </>
    );
};

function hasRenderableChildren(children) {
    if (!children) return false;
    if (children.props && children.props.children !== undefined) {
        const fragmentChildren = children.props.children;
        if (Array.isArray(fragmentChildren)) {
            return fragmentChildren.some((child) => {
                if (!child) return false;
                if (child.props && 'previewImage' in child.props) {
                    return !!(child.props.previewImage && String(child.props.previewImage).length > 0);
                }
                if (child.props && Array.isArray(child.props.galleryImages) && child.props.galleryImages.length > 0) {
                    return true;
                }
                return true;
            });
        }
        if (fragmentChildren && fragmentChildren.props) {
            if ('previewImage' in fragmentChildren.props) {
                return !!(fragmentChildren.props.previewImage && String(fragmentChildren.props.previewImage).length > 0);
            }
            if (
                Array.isArray(fragmentChildren.props.galleryImages) &&
                fragmentChildren.props.galleryImages.length > 0
            ) {
                return true;
            }
        }
        return !!fragmentChildren;
    }
    return !!children;
}

/**
 * @param {string} socialPostType
 * @param {React.ReactNode} children — e.g. Preview with uploaded image / carousel
 * @param {string} [editorText]
 * @param {object} [contentdata] — optional sector/template content (Pinterest, etc.)
 */
const RSSocialPostPreview = ({
    socialPostType,
    children,
    editorText,
    contentdata,
    scheduleDate,
    wrapperClassName = '',
    contentClassName = '',
    isGallery = false,
}) => {
    const isFacebook = socialPostType === 'facebook';
    const isInstagram = socialPostType === 'instagram';
    const isLinkedin = socialPostType === 'linkedIn';
    const isTwitter = socialPostType === 'twitter';
    const isPinterest = socialPostType === 'pinterest';

    const hasText = Boolean(getPlainText(editorText || '').trim());
    const hasChildren = hasRenderableChildren(children);

    const outerClass = ['rs-social-post-live-preview-wrapper', `wrapper-${socialPostType}`, wrapperClassName]
        .filter(Boolean)
        .join(' ')
        .trim();
    const innerClass = ['social-post-content', socialPostType, isPinterest ? 'p10' : '', contentClassName]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
        <div className={outerClass}>
            <div className={innerClass}>
                {isFacebook ? (
                    <FacebookPreviewCard editorText={editorText} scheduleDate={scheduleDate} isGallery={isGallery}>
                        {children}
                    </FacebookPreviewCard>
                ) : isInstagram ? (
                    <InstagramPreviewCard editorText={editorText} scheduleDate={scheduleDate} isGallery={isGallery}>
                        {children}
                    </InstagramPreviewCard>
                ) : isLinkedin ? (
                    <LinkedInPreviewCard editorText={editorText} scheduleDate={scheduleDate} isGallery={isGallery}>
                        {children}
                    </LinkedInPreviewCard>
                ) : isTwitter ? (
                    <TwitterPreviewCard editorText={editorText} scheduleDate={scheduleDate} isGallery={isGallery}>
                        {children}
                    </TwitterPreviewCard>
                ) : isPinterest ? (
                    <PinterestPreviewCard
                        editorText={editorText}
                        contentdata={contentdata}
                        scheduleDate={scheduleDate}
                        isGallery={isGallery}
                    >
                        {children}
                    </PinterestPreviewCard>
                ) : (
                    <>
                        <DisplayContent socialContent={socialPostType} contentdata={contentdata} />
                        {!hasText && !hasChildren ? <NoPreviewAvailable /> : hasChildren ? children : null}
                    </>
                )}
            </div>
        </div>
    );
};

const DisplayContent = ({ socialContent, contentdata }) => {
    switch (socialContent) {
        case 'facebook':
        case 'instagram':
        case 'linkedIn':
        case 'twitter':
            return null;
        case 'pinterest':
            return (
                <div className="image-bg">
                    <img src={pinterestBg} alt="" />
                </div>
            );
        default:
            return null;
    }
};

export default memo(RSSocialPostPreview);
