import { cloneElement } from 'react';
import { circle_plus_fill_medium, editor_color_picker_medium, editor_text_color_medium } from 'Constants/GlobalConstant/Glyphicons';
import { EditorTools, EditorUtils } from '@progress/kendo-react-editor';
const { ForeColor, BackColor } = EditorTools;
import RSColorPicker from 'Components/ColorPicker';

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
        <div className="rs-builder-colorpicker-container text_editor_icon">
            <RSColorPicker
                icon={editor_color_picker_medium}
                tooltipText="Back color"
                isToolTip
                onSelect={(color) => {
                    const { view } = props;
                    if (view) {
                        EditorUtils.applyInlineStyle(view, {
                            style: 'background-color',
                            value: color,
                        });
                    }
                }}
            />
        </div>
    );
};

export const CustomForeColor = (props) => {
    return (
        <div className="rs-builder-colorpicker-container text_editor_icon">
            <RSColorPicker
                icon={editor_text_color_medium}
                tooltipText="Font color"
                isToolTip
                isOpacity={true}
                onSelect={(e) => {
                    let colorValue;
                    if (typeof e === 'object' && e.color && e.opacity !== undefined) {
                        // Handle opacity - convert to hex and append to color
                        const alpha = Math.round(e.opacity * 255);
                        const hexOpacity = alpha.toString(16).padStart(2, '0').toUpperCase();
                        colorValue = `${e.color}${hexOpacity}`;
                    } else {
                        // Handle simple color selection without opacity
                        colorValue = e;
                    }
                    
                    const { view } = props;
                    if (view) {
                        EditorUtils.applyInlineStyle(view, {
                            style: 'color',
                            value: colorValue,
                        });
                    }
                }}
            />
        </div>
    );
};
