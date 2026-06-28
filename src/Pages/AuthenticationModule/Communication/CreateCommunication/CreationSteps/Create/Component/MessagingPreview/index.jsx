import { eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const MessagingPreview = (props) => {
    const { view } = props;
    const [showPreview, setPreview] = useState(false);
    return (
        <div>
            <i
                  id='rs_data_eye'
                className={`${eye_medium} icon-md cp`}
                onClick={(e) => {
                    setPreview(true);
                }}
            />
            <RSModal
                show={showPreview}
                handleClose={(e) => {
                    setPreview(false);
                }}
                header={'Preview'}
                body={<>Preview Modal</>}
                footer={
                    <>
                        <RSSecondaryButton
                            onClick={(e) => {
                                setPreview(false);
                            }}
                        >
                            Close
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={(e) => {
                                const state = view.state;
                                const tr = state.tr;
                                const markType = state.schema.marks.style;
                                const mark = markType.create({ class: 'personalize' });
                                const content = state.schema.text('Template');
                                tr.addStoredMark(mark);
                                tr.replaceSelectionWith(content, true);
                                view.dispatch(tr);
                                setPreview(false);
                            }}
                            type="button"
                        >
                            Send to me
                        </RSPrimaryButton>
                    </>
                }
            />
        </div>
    );
};

export default MessagingPreview;
