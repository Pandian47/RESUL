import { template_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useState } from 'react';
import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const InsertTemplate = (props) => {
    const { view } = props;
    const [showTemplateModal, setTemplateModal] = useState(false);
    return (
        <Fragment>
            <i
                className={`${template_medium} icon-md cp`}
                onClick={() => {
                    setTemplateModal(true);
                }}
            />
            <RSModal
                show={showTemplateModal}
                handleClose={() => setTemplateModal(false)}
                header={'My SMS template'}
                body={'Template Modal'}
                footer={
                    <Fragment>
                        <RSSecondaryButton
                            onClick={() => {
                                setTemplateModal(false);
                            }}
                        >
                            Close
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="button"
                            onClick={() => {
                                const state = view.state;
                                const tr = state.tr;
                                const markType = state.schema.marks.style;
                                const mark = markType.create({ class: 'personalize' });
                                const content = state.schema.text('Template');
                                tr.addStoredMark(mark);
                                tr.replaceSelectionWith(content, true);
                                view.dispatch(tr);
                                setTemplateModal(false);
                            }}
                        >
                            Select
                        </RSPrimaryButton>
                    </Fragment>
                }
            />
        </Fragment>
    );
};

export default InsertTemplate;
