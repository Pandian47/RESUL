
import RSEmojiPicker from 'Components/EmojiPicker';

const EditorEmojiPicker = (props) => {
    // console.log('props: ', props);
    const { view } = props;
    return (
        <RSEmojiPicker
            onEmojiSelect={(emoji) => {
                const state = view.state;
                const tr = state.tr;
                const markType = state.schema.marks.style;
                const mark = markType.create({ class: 'personalize' });
                const content = state.schema.text(emoji?.native);
                tr.addStoredMark(mark);
                tr.replaceSelectionWith(content, true);
                view.dispatch(tr);
            }}
            iconClass={''}
        />
    );
};

export default EditorEmojiPicker;
