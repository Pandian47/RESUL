import { UpdateState } from 'Utils/modules/misc';
import { CANCEL, MAXIMUM5_FRIENDLY_NAME_ALLOWED, SAVE, TAGS } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';
import RSTagsComponent from 'Components/RSTagsComponent';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';


const TagsModal = ({ tags = [], show, handleClose, onSubmit, reducerState, viewOnly = false }) => {
    const [isEnableSave, setIsEnableSave] = useState(false);
    const [keyword, setKeyword] = useState({
        tags: tags,
        errorMessage: '',
    });

    const onSave = () => {
        onSubmit(keyword.tags);
        if (keyword.tags) {
            setIsEnableSave(true);
        } else {
            setIsEnableSave(false);
        }
    };

    useEffect(() => {
        if (show) {
            setKeyword({ tags, errorMessage: '' });
        }
    }, [show, tags]);

    useEffect(() => {
        if (reducerState?.tags?.length || keyword.tags?.length) {
            setIsEnableSave(true);
        } else {
            setIsEnableSave(false);
        }
    }, [reducerState?.tags, keyword.tags]);

    return (
        <RSModal
            show={show}
            size="md"
            header={TAGS}
            handleClose={handleClose}
            body={
                <Fragment>
                    <RSTagsComponent
                        errorMessage={keyword.errorMessage}
                        tags={tags}
                        disabled={viewOnly}
                        isLocalization={true}
                        customTagClass="rs-tags-wrapper-scroll"
                        updatedTags={(nextTags) =>
                            UpdateState(setKeyword, ['tags', 'errorMessage'], [nextTags, ''])
                        }
                        size={5}
                    />
                    <small className="small-text-space-top">{MAXIMUM5_FRIENDLY_NAME_ALLOWED}</small>
                </Fragment>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                    {!viewOnly && (
                        <RSPrimaryButton
                            disabledClass={isEnableSave ? '' : 'pe-none click-off'}
                            onClick={onSave}
                        >
                            {SAVE}
                        </RSPrimaryButton>
                    )}
                </>
            }
        />
    );
};

export default TagsModal;
