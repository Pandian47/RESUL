import { EditorTools } from '@progress/kendo-react-editor';
import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';

const {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    OrderedList,
    UnorderedList,
    FormatBlock,
    Link,
    Unlink,
    InsertImage,
} = EditorTools;

const DEFAULT_TOOLS = [
    FormatBlock,
    [Bold, Italic, Underline],
    [Link, InsertImage],
    [OrderedList, UnorderedList],
    [AlignLeft, AlignCenter, AlignRight, AlignJustify],
];

const TextEditor = ({
    onBlurHandler = () => {},
    onChange = () => {},
    tools = DEFAULT_TOOLS,
    defaultContent = '<p>Hello</p>',
    ...rest
}) => (
    <ResTextEditor
        tools={tools}
        defaultContent={defaultContent}
        height={200}
        onBlur={onBlurHandler}
        onChange={(html) => onChange(html)}
        {...rest}
    />
);

export default TextEditor;
