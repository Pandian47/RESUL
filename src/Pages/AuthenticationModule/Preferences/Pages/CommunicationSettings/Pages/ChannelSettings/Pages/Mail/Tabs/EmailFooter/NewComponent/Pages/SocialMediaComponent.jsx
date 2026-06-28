import { useSelectedComponent } from './SelectedComponentContext';
import ToggleMenuBar from './Component/ToggleMenuBar';
import { SOCIAL_CONFIG } from '../Utils/functions';
import { SocialLogoIcons } from './Component/SocialIcons';

// SocialMediaComponent for rendering social media icons in an email footer
const SocialMediaComponent = ({
    id,
    socialIcon = 'RoundedColorLogos',
    addIcon,
    deleteIcon,
    alignment = 'left',
    SpaceBetweenIcons = 10,
    ItemTypes = {},
    item = {},
    onEdit,
    onDelete,
    size = 30,
    socialAltTexts,
    disable = false,
    onDuplicate,
    socialLinks = ['facebook', 'twitter', 'instagram'],
}) => {
    const { selectedComponent, setSelectedComponent } = useSelectedComponent();
    const {
        isborder,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        borderthickness,
        borderColor,
        borderStyle,
        borderRadius,
    } = item || {};

    const { top = 0, right = 0, bottom = 0, left = 0 } = item?.padding || {};

    // Alignment style for icons
    const alignmentStyle =
        {
            left: 'flex-start',
            center: 'center',
            right: 'flex-end',
        }[alignment] || 'center';

    // Get the icon set based on the selected style
    const selectedIconSet = SocialLogoIcons.find((set) => set.style === socialIcon)?.icons || [];

    // Filter icons to render, ensuring only valid icons are shown
    const filteredIcons = socialLinks
        .map((label) => selectedIconSet.find((icon) => icon.label.toLowerCase() === label.toLowerCase()))
        .filter((icon) => icon !== undefined)
        .slice(0, SOCIAL_CONFIG.MAX_SOCIAL_LINKS);

    // Background size calculation
    const isWidthKeyword = ['contain', 'cover', 'auto'].includes(item.bgWidth);
    const isHeightKeyword = ['contain', 'cover', 'auto'].includes(item.bgHeight);
    const bgSize = isWidthKeyword && isHeightKeyword ? 'contain' : `${item.bgWidth} ${item.bgHeight}`;

    return (
        <div
            key={id}
            className={`no-border tooltip-container menu-child-section w-100 ${
                selectedComponent?.id === id ? 'card-active' : ''
            }`}
            style={{ border: 'unset', position: 'relative' }}
            onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
            }}
        >
            <div
                className="social-media-content"
                style={{
                    display: 'flex',
                    gap: `${SpaceBetweenIcons}px`,
                    padding: '10px',
                    borderTop: isborder && borderTop
                        ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                        : 'unset',
                    borderRight: isborder && borderRight
                        ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                        : 'unset',
                    borderBottom: isborder && borderBottom
                        ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                        : 'unset',
                    borderLeft: isborder && borderLeft
                        ? `${borderthickness || 2}px ${borderStyle?.value || 'solid'} ${borderColor || 'black'}`
                        : 'unset',
                    borderRadius: `${borderRadius}px` || '0',
                    backgroundColor: item.bgColor ? item.bgColor : 'unset',
                    backgroundImage: `url(${item.bgImage})`,
                    backgroundRepeat: item.bgRepeat,
                    backgroundPosition: `${item.bgPositionX} ${item.bgPositionY}`,
                    backgroundSize: bgSize,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: alignmentStyle,
                    paddingTop: `${top}px`,
                    paddingRight: `${right}px`,
                    paddingBottom: `${bottom}px`,
                    paddingLeft: `${left}px`,
                }}
            >
                {filteredIcons.length > 0 ? (
                    filteredIcons.map((icon, index) => (
                        <a
                            key={index}
                            href={item[socialLinks[index]] || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ lineHeight: 0 }}
                        >
                            <img
                                src={icon.iconSrc}
                                alt={socialAltTexts?.[icon.id] || icon.label}
                                width={size}
                                height={size}
                                style={{ display: 'block' }}
                            />
                        </a>
                    ))
                ) : (
                    <span>No valid social icons selected.</span>
                )}
            </div>

            <ToggleMenuBar item={item} onDuplicate={onDuplicate} onDelete={onDelete} />
        </div>
    );
};

export default SocialMediaComponent;