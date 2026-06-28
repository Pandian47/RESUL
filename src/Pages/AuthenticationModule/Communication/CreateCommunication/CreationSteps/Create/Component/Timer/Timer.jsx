import { editor_timer_medium } from 'Constants/GlobalConstant/Glyphicons';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSTooltip from 'Components/RSTooltip';

const Timer = (props) => {
    const { view } = props;
    return (
        <div className="rs-editor-custom-icon editor-custom-timer rseci-icon">
            
            <BootstrapDropdown
                data={['1 sec', '2 sec', '3 sec', '4 sec', '5 sec']}
                flatIcon
                defaultItem={ <RSTooltip text="Timer" className="lh0"><i  className={`${editor_timer_medium} icon-md`} /></RSTooltip>}
                showUpdate={false}
                className="no_caret"
                onSelect={(e) => {
                    const state = view.state;
                    const tr = state.tr;
                    const markType = state.schema.marks.style;
                    const mark = markType.create({ class: 'timer' });
                    const content = state.schema.text(`{{BRT="${e.split(' ')[0]}s"}}`);
                    tr.addStoredMark(mark);
                    tr.replaceSelectionWith(content, true);
                    view.dispatch(tr);
                }}
            />
            
        </div>
    );
};

export default Timer;
