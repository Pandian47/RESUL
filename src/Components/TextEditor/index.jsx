import PropTypes from 'prop-types';

import ResTextEditor from 'Pages/KendoDocs/CommonComponents/ResTextEditor';
import { EditorTools } from '@progress/kendo-react-editor';
import ImageUpload from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/ImageUpload/ImageUpload';

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
    Link,
    Unlink,
} = EditorTools;

const DEFAULT_TOOLS = [
    [Bold, Italic, Underline],
    [Link, Unlink, ImageUpload],
    [UnorderedList, OrderedList],
    [AlignLeft, AlignCenter, AlignRight, AlignJustify],
];

const TextEditor = ({
    onBlurHandler = () => {},
    onChange,
    tools = DEFAULT_TOOLS,
    content,
    style = { height: 200 },
    defaultContent = '',
    value,
    onFocus,
    ...rest
}) => {
    const resolvedValue = content ?? value;

    const handleChange = (html, e) => {
        onChange?.(e ?? { html });
    };

    return (
        <ResTextEditor
            tools={tools}
            value={resolvedValue}
            defaultContent={defaultContent}
            height={style?.height ?? 200}
            contentStyle={style}
            onBlur={onBlurHandler}
            onChange={handleChange}
            onFocus={onFocus}
            {...rest}
        />
    );
};

TextEditor.propTypes = {
    tools: PropTypes.array,
    style: PropTypes.object,
    value: PropTypes.string,
    content: PropTypes.string,
    defaultContent: PropTypes.string,
    onBlurHandler: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
};

export default TextEditor;
