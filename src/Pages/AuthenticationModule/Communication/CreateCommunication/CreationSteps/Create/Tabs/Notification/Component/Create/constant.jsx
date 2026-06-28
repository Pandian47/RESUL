import { cloneElement } from 'react';
import { circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { EditorTools, EditorUtils } from '@progress/kendo-react-editor';
const { ForeColor, BackColor } = EditorTools;
import RSTooltip from 'Components/RSTooltip';

export const renderItem = (li) => {
    const isExpectedItem = li.props.children[0]?.props?.children.includes('Custom action');
    return cloneElement(
        li,
        li.props,
        <span className="d-flex justify-content-between w-100 px-10">
            {li.props.children}
            {isExpectedItem && (
                <i
                    className={`${circle_plus_fill_medium} icon-md color-primary-blue`}
                    id="rs_data_circle_plus_fill"
                ></i>
            )}
        </span>,
    );
};

export const CustomBackColor = (props) => {
    return (
        <RSTooltip text="Back color">
            <div className="CustomForeColor_bg">
                <BackColor
                    colorPickerProps={{
                        view: 'palette',
                        iconClassName: 'icon-rs-editor-color-picker-medium icon-md',
                        onActiveColorClick: (e) => {
                                                    },
                        onChange: (e) => {
                                                        const hex = GetHexColorFormat(e.value);
                            const { view } = props;
                            if (view) {
                                EditorUtils.applyInlineStyle(view, {
                                    style: 'background-color',
                                    value: hex,
                                });
                            }
                        },
                    }}
                />
            </div>
        </RSTooltip>
    );
};

export const CustomForeColor = (props) => {
    return (
        <div className="CustomForeColor_bg">
            <RSTooltip text="Font color">
                <BackColor
                    colorPickerProps={{
                        view: 'palette',
                        iconClassName: 'icon-rs-editor-text-color-medium icon-md',
                        onActiveColorClick: (e) => {
                                                    },
                        onChange: (e) => {
                                                        const hex = GetHexColorFormat(e.value);
                            const { view } = props;
                            if (view) {
                                EditorUtils.applyInlineStyle(view, {
                                    style: 'color',
                                    value: hex,
                                });
                            }
                        },
                    }}
                />
            </RSTooltip>
        </div>
    );
};

const GetHexColorFormat = (rgb) => {
    const parts = rgb
        .replace(/^rgba\(/, '')
        .replace(/\)$/, '')
        .split(',');
    const hex = parts
        .slice(0, 3)
        .map((x) => parseInt(x, 10).toString(16).padStart(2, '0'))
        .join('');
    const alpha = Math.round(parseFloat(parts[3]) * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${hex}`;
};
