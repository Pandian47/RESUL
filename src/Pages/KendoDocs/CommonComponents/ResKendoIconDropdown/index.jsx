import { memo } from 'react';
import PropTypes from 'prop-types';
import { get } from 'Utils/modules/lodashReplacements';
import { Controller } from 'react-hook-form';
import { DropDownButton } from '@progress/kendo-react-buttons';

import { RES_KENDO_ICON_DD_CLASS as ICON_DD, RES_KENDO_ICON_DD_VARIANT as ICON_DD_VARIANT } from '../../kendoDocsPrefix.config';
import './resKendoIconDropdown.scss';

const resolvePopupClass = (...classNames) => {
    const tokens = [ICON_DD.popup, ...classNames]
        .filter(Boolean)
        .join(' ')
        .split(/\s+/)
        .filter(Boolean);

    return [...new Set(tokens)].join(' ');
};

const resolveItemRenderProps = (li, itemProps) => {
    if (itemProps?.item != null) return itemProps;
    if (li?.item != null) return li;
    return itemProps ?? li;
};

const ResKendoIconDropdown = ({
    control,
    name,
    rules,
    defaultValue,
    errorMessage,
    isError = true,
    data = [],
    className = '',
    icon,
    popupClass = '',
    variant = '',
    dir = 'ltr',
    onItemClick,
    itemRender,
    textField,
    popupSettings,
    containerClass = '',
    required,
    ...rest
}) => {
    const variantPopupClass = ICON_DD_VARIANT[variant] ?? '';

    const renderDropdown = (fieldProps = {}, fieldError = null) => {
        const errMsg = errorMessage ?? get(fieldError, 'message', '');
        const showError = isError && errMsg?.length > 0;
        const { popupClass: settingsPopupClass, ...restPopupSettings } = popupSettings ?? {};

        return (
            <div className={[ICON_DD.wrapper, containerClass].filter(Boolean).join(' ')}>
                {showError && <div className="validation-message">{errMsg}</div>}
                <DropDownButton
                    className={[ICON_DD.base, className].filter(Boolean).join(' ')}
                    items={data}
                    textField={textField}
                    icon={icon}
                    popupSettings={{
                        animate: true,
                        ...restPopupSettings,
                        popupClass: resolvePopupClass(variantPopupClass, popupClass, settingsPopupClass),
                    }}
                    itemRender={
                        itemRender ? (li, itemProps) => itemRender(resolveItemRenderProps(li, itemProps)) : undefined
                    }
                    dir={dir}
                    onItemClick={(e) => onItemClick?.(e)}
                    {...fieldProps}
                    {...rest}
                />
            </div>
        );
    };

    if (control && name) {
        return (
            <Controller
                control={control}
                rules={rules}
                name={name}
                defaultValue={defaultValue}
                render={({ field, fieldState: { error } }) => renderDropdown(field, error)}
            />
        );
    }

    return renderDropdown();
};

ResKendoIconDropdown.propTypes = {
    control: PropTypes.object,
    name: PropTypes.string,
    rules: PropTypes.object,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    errorMessage: PropTypes.string,
    isError: PropTypes.bool,
    data: PropTypes.array,
    className: PropTypes.string,
    icon: PropTypes.string,
    popupClass: PropTypes.string,
    variant: PropTypes.oneOf(['aa360Communication']),
    dir: PropTypes.string,
    onItemClick: PropTypes.func,
    itemRender: PropTypes.func,
    textField: PropTypes.string,
    popupSettings: PropTypes.object,
    containerClass: PropTypes.string,
    required: PropTypes.bool,
};

export default memo(ResKendoIconDropdown);
