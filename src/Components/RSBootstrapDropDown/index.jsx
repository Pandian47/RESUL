import { useEffect, useState, cloneElement, isValidElement } from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import Proptypes from 'prop-types';
import RSTooltip from '../RSTooltip';
import { normalizeDisplayText } from 'Utils/modules/stringUtils';

const SafeDropdownTitle = ({ children, eventKey, className = '', ...rest }) => (
    <span className={`rs-dropdown-title ${className}`.trim()} {...rest}>
        {children}
    </span>
);

const sanitizeDropdownTitle = (title) => {
    if (title == null || title === '') {
        return <SafeDropdownTitle>{''}</SafeDropdownTitle>;
    }

    if (!isValidElement(title)) {
        if (typeof title === 'object') {
            return <SafeDropdownTitle>{''}</SafeDropdownTitle>;
        }
        return <SafeDropdownTitle>{title}</SafeDropdownTitle>;
    }

    const titleProps = title.props ?? {};
    const TitleType = title.type;

    if (typeof TitleType === 'string') {
        return <SafeDropdownTitle {...titleProps}>{titleProps.children}</SafeDropdownTitle>;
    }

    if (
        TitleType &&
        (TitleType.displayName === 'RSSecondaryButton' ||
            TitleType.name === 'RSSecondaryButton' ||
            TitleType.displayName === 'RSButton' ||
            TitleType.name === 'RSButton')
    ) {
        return cloneElement(title, { as: SafeDropdownTitle });
    }

    return <SafeDropdownTitle {...titleProps}>{titleProps.children}</SafeDropdownTitle>;
};

export const BootstrapDropdown = ({
    data = [],
    onSelect = () => {},
    defaultItem = '',
    className = '',
    fontSize = '',
    fieldKey,
    alignRight,
    disbleItems = [],
    errorMessage,
    showUpdate = true,
    flatIcon = false,
    containerClass = '',
    isObject,
    iconFlag = false,
    isCustomToggle = false,
    show = false,
    footer = null,
    isTooltip = false,
    tooltipThreshold = 13,
    isScroll = true,
    ...props
}) => {
    const getDisplayValue = (item) => normalizeDisplayText(String(item ?? ''));
    const getObjectDisplayValue = (item) => getDisplayValue(item?.[fieldKey]);
    const normalizeTitle = (item) => {
        if (typeof item === 'string') return getDisplayValue(item);
        if (isValidElement(item)) return item;
        if (item == null) return '';
        return getDisplayValue(item);
    };

    const safeData = Array.isArray(data) ? data.filter((item) => item != null) : [];
    const safeDisabledItems = Array.isArray(disbleItems) ? disbleItems : [];
    const isItemDisabled = (item) => safeDisabledItems.includes(item);

    const [title, setTitle] = useState(() => normalizeTitle(defaultItem));

    useEffect(() => {
        setTitle(normalizeTitle(defaultItem));
    }, [defaultItem, disbleItems]);

    return (
        <div
            className={`rs-bootstrap-dropdown ${flatIcon ? 'rs-bootstrap-dropdown-with-icon' : ''} ${containerClass}`}
            style={{ '--rs-dropdown-item-count': safeData.length }}
        >
            {errorMessage && <div className="validation-message">{errorMessage}</div>}
            <DropdownButton
                align={`${alignRight ? 'end' : 'start'}`}
                variant=""
                className={`rs-dropdown ${className} ${fontSize}`}
                title={sanitizeDropdownTitle(title)}
                renderMenuOnMount
                {...(isCustomToggle && { show: show, onClick: props.handleClick })}
            >
                <div className={isScroll ? 'css-scrollbar custome-dropdown-scroll' : ''}>
                    {safeData.map((item, index) => {
                        return (
                            <div
                                key={index}
                                className={`${isItemDisabled(item) ? 'pe-none click-off' : ''}`}
                                style={{ '--rs-dropdown-item-index': index }}
                            >
                                {isObject ? (
                                    <Dropdown.Item
                                        key={index}
                                        onClick={() => {
                                            if (showUpdate) {
                                                setTitle(getObjectDisplayValue(item));
                                            }
                                            onSelect(item, index);
                                        }}
                                        disabled={item?.disabled ? item.disabled : false}
                                        className={item?.disabled ? `click-off` : ''}
                                    >
                                        {isTooltip && getObjectDisplayValue(item)?.length > tooltipThreshold ? (
                                            <RSTooltip position="top" text={getObjectDisplayValue(item)}>
                                                {`${getObjectDisplayValue(item).substring(0, tooltipThreshold)}...`}
                                            </RSTooltip>
                                        ) : (
                                            getObjectDisplayValue(item)
                                        )}
                                    </Dropdown.Item>
                                ) : (
                                    <Dropdown.Item
                                        key={index}
                                        disabled={isItemDisabled(item)}
                                        onClick={() => {
                                            if (isItemDisabled(item)) return;
                                            if (showUpdate) {
                                                setTitle(getDisplayValue(item));
                                            }
                                            onSelect(item, index);
                                        }}
                                    >
                                        {isTooltip && getDisplayValue(item)?.length > tooltipThreshold ? (
                                            <RSTooltip position="top" text={getDisplayValue(item)}>
                                                {`${getDisplayValue(item).substring(0, tooltipThreshold)}...`}
                                            </RSTooltip>
                                        ) : (
                                            getDisplayValue(item)
                                        )}
                                    </Dropdown.Item>
                                )}
                            </div>
                        );
                    })}
                </div>
                {footer && (
                    <>
                        <Dropdown.Divider className='bg-quaternary-blue mx-5 mb5' />
                        {footer}
                    </>
                )}
            </DropdownButton>
        </div>
    );
};

BootstrapDropdown.propTypes = {
    data: Proptypes.array.isRequired,
    onSelect: Proptypes.func,
    defaultItem: Proptypes.oneOfType([Proptypes.string, Proptypes.object]),
    className: Proptypes.string,
    fontSize: Proptypes.string,
    fieldKey: Proptypes.string,
    alignRight: Proptypes.bool,
    disbleItems: Proptypes.array,
    errorMessage: Proptypes.string,
    flatIcon: Proptypes.bool,
    iconFlag: Proptypes.bool,
    containerClass: Proptypes.string,
    isCustomToggle: Proptypes.bool,
    show: Proptypes.bool,
    footer: Proptypes.node,
    isTooltip: Proptypes.bool,
    tooltipThreshold: Proptypes.number,
    isScroll: Proptypes.bool,
};
