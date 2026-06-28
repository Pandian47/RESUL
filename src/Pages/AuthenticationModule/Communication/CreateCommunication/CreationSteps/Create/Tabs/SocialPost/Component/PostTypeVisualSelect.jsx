import { RESET } from 'Constants/GlobalConstant/Placeholders';
import { editor_image_medium, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTooltip from 'Components/RSTooltip';
import { getResolvedPostTypeCardCopy, POST_TYPE_ICON_BY_ID, isPostTypeOptionSelectable } from '../constant';

/**
 * Card-based post type picker (Facebook / Instagram / LinkedIn / Twitter when used). Updates form `postType` via `onSelect`.
 */
function PostTypeVisualSelect({
    options,
    value,
    onSelect,
    lockOtherOptions = false,
    showReset = false,
    onReset,
}) {
    if (!options?.length) {
        return null;
    }

    const countClass = `rs-social-post-type-select--count-${options.length}`;

    return (
        <div className={`rs-social-post-type-select ${countClass}`}>
            <div className="rs-social-post-type-cards__list" role="radiogroup" aria-label="Post type">
                {options.map((opt) => {
                    const isSelected = value?.id === opt.id;
                    const isLockedOut = lockOtherOptions && value?.id && !isSelected;
                    const isEnabled = isPostTypeOptionSelectable(opt) && !isLockedOut;
                    const iconClass = POST_TYPE_ICON_BY_ID[opt.id] || editor_image_medium;
                    const iconSizeClass =
                        opt.id === 'instagram_carousel' ||
                        opt.id === 'pinterest_carousel_pin' ||
                        opt.id === 'linkedin_single_image'
                            ? 'icon-lg'
                            : 'icon-xl';
                    const copy = getResolvedPostTypeCardCopy(opt.id);
                    const title = copy?.title || opt.label;
                    const description = copy?.description ?? '';
                    const badge = copy?.badge ?? '';
                    const iconSrc = copy?.iconSrc;

                    return (
                        <button
                            key={opt.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-disabled={!isEnabled}
                            disabled={!isEnabled}
                            aria-label={`${title}${description ? `. ${description}` : ''}${!isEnabled ? ' (not available)' : ''}`}
                            className={`rs-social-post-type-card${isSelected ? ' is-selected' : ''}${!isEnabled ? ' is-disabled' : ''}${isLockedOut ? ' is-locked click-off' : ''}`}
                            onClick={() => {
                                if (isEnabled) {
                                    onSelect(opt);
                                }
                            }}
                        >
                            <span className="rs-social-post-type-card__visual">
                                {badge ? (
                                    <span
                                        className={`rs-social-post-type-card__badge${
                                            isSelected ? ' rs-social-post-type-card__badge--on' : ''
                                        }`}
                                    >
                                        {badge}
                                    </span>
                                ) : null}
                                <span className="rs-social-post-type-card__icon">
                                    {iconSrc ? (
                                        <img src={iconSrc} alt="" className="rs-social-post-type-card__icon-img" />
                                    ) : (
                                        <i className={`${iconClass} ${iconSizeClass}`} aria-hidden />
                                    )}
                                </span>
                            </span>
                            <span className="rs-social-post-type-card__body">
                                <span className="rs-social-post-type-card__title font-bold">{title}</span>
                                {description ? (
                                    <span className="rs-social-post-type-card__description">{description}</span>
                                ) : null}
                            </span>
                        </button>
                    );
                })}
            </div>
            {showReset && typeof onReset === 'function' ? (
                <RSTooltip
                    position="top"
                    text={RESET}
                    wrapperTag="span"
                    className="rs-social-post-type-reset"
                >
                    <button
                        type="button"
                        className="rs-social-post-type-reset__btn"
                        aria-label={RESET}
                        onClick={onReset}
                    >
                        <i className={`${restart_medium} color-primary-blue icon-md`} aria-hidden />
                    </button>
                </RSTooltip>
            ) : null}
        </div>
    );
}

export default PostTypeVisualSelect;
