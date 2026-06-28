import { editor_personalize_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import { useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import RSTooltip from 'Components/RSTooltip';
import { handlePersonalization } from '../../constant';
import { useFormContext } from 'react-hook-form';
import useQueryParams from 'Hooks/useQueryParams';

const Personalize = (props) => {
    const { view, onEditorMaxLen, maxLength = 350 } = props;
    const { personalization,listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams('/communication');
    const methods = useFormContext();
    return (
        <div className="rs-editor-custom-icon editor-custom-personalize rseci-icon">
            <RSBootstrapdown
                data={handlePersonalization(
                    personalization,
                    location?.audience?.length ? location?.audience : (methods?.watch('audience')?.length ? methods?.watch('audience') : (methods?.getValues()?.audience || [])),
                    listTypeWisePersonlization,
                )}
                flatIcon
                isObject
                fieldKey="key"
                defaultItem={{
                    key: (
                        <RSTooltip text="Personalization" className="lh0" trigger={['hover', 'focus']}>
                            <i className={`${editor_personalize_medium} icon-md`} />{' '}
                        </RSTooltip>
                    ),
                }}
                showUpdate={false}
                name="sendernamePicker"
                className="no_caret"
                onSelect={({ personalizationKey }) => {
                    const state = view.state;
                    const tr = state.tr;
                    const markType = state.schema.marks.style;
                    const mark = markType.create({ class: 'personalize' });
                    const currentText = state.doc.textContent || '';
                    const currentLength = currentText.length;
                    const contentText = ' ' + personalizationKey + ' ';
                    const content = state.schema.text(contentText);
                    if (currentLength + contentText?.length > maxLength) {
                        if (onEditorMaxLen) {
                            onEditorMaxLen(true)
                            setTimeout(() => {
                                onEditorMaxLen(false)
                            },3000)
                            return;
                        }
                    }
                    tr.addStoredMark(mark);
                    tr.replaceSelectionWith(content, true);
                    view.dispatch(tr);
                    view.focus();
                }}
                showSearch
            />
        </div>
    );
};

export default Personalize;
