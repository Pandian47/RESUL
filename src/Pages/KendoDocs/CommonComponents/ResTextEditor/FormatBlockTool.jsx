/**
 * FormatBlockTool — Paragraph / Heading selector for ResTextEditor toolbar.
 * Uses ResKendoDropdown instead of Kendo's built-in FormatBlock DropDownList.
 */
import { cloneElement, memo, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { EditorUtils } from '@progress/kendo-react-editor';

import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';

const FORMAT_BLOCK_COMMAND = 'FormatBlock';

export const FORMAT_BLOCK_ITEMS = [
    { text: 'Paragraph', value: 'p', style: { display: 'block', marginLeft: 0 } },
    { text: 'Heading 1', value: 'h1', style: { display: 'block', fontSize: '2em', marginLeft: 0, fontWeight: 'bold' } },
    { text: 'Heading 2', value: 'h2', style: { display: 'block', fontSize: '1.5em', marginLeft: 0, fontWeight: 'bold' } },
    { text: 'Heading 3', value: 'h3', style: { display: 'block', fontSize: '1.17em', marginLeft: 0, fontWeight: 'bold' } },
    { text: 'Heading 4', value: 'h4', style: { display: 'block', fontSize: '1em', marginLeft: 0, fontWeight: 'bold' } },
    { text: 'Heading 5', value: 'h5', style: { display: 'block', fontSize: '0.83em', marginLeft: 0, fontWeight: 'bold' } },
    { text: 'Heading 6', value: 'h6', style: { display: 'block', fontSize: '0.67em', marginLeft: 0, fontWeight: 'bold' } },
];

const formatItemRender = (li, itemProps) => {
    const { dataItem } = itemProps;
    const style = dataItem?.style;

    return cloneElement(
        li,
        {
            ...li.props,
            title: dataItem?.text,
        },
        style ? (
            <span className="list-item" style={style}>
                {dataItem.text}
            </span>
        ) : (
            <span className="list-item">{li.props.children}</span>
        ),
    );
};

const FormatBlockTool = ({ view }) => {
    const viewRef = useRef(view);
    viewRef.current = view;

    const { control, setValue } = useForm({
        defaultValues: { formatBlock: null },
    });

    const selectedItem = useMemo(() => {
        if (!view?.state) return null;

        const activeFormats = EditorUtils.getBlockFormats(view.state);
        if (new Set(activeFormats).size !== 1) return null;

        const activeValue = activeFormats[0];
        return FORMAT_BLOCK_ITEMS.find((item) => item.value === activeValue) ?? null;
    }, [view?.state]);

    useEffect(() => {
        setValue('formatBlock', selectedItem, { shouldDirty: false });
    }, [selectedItem, setValue]);

    return (
        <div
            className="rs-editor-format-block-tool"
            onMouseDown={(event) => {
                event.preventDefault();
            }}
        >
            <ResKendoDropdown
                control={control}
                name="formatBlock"
                data={FORMAT_BLOCK_ITEMS}
                textField="text"
                dataItemKey="value"
                isError={false}
                useErrorContainer={false}
                noBottomBorder
                filterable={false}
                isCustomRender
                itemRender={formatItemRender}
                handleChange={(event) => {
                    const editorView = viewRef.current;
                    const item = event?.value;
                    if (!editorView || !item?.value) return;

                    EditorUtils.formatBlockElements(editorView, item.value, FORMAT_BLOCK_COMMAND);
                    editorView.focus();
                }}
            />
        </div>
    );
};

FormatBlockTool.displayName = 'ResTextEditorFormatBlockTool';
FormatBlockTool.propTypes = {
    view: PropTypes.object,
};

export default memo(FormatBlockTool);
