import { UpdateState } from 'Utils/modules/misc';
import { ENTER_TAGS } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, FRIENDLY_NAME_COMMA_SEPARATOR, MAXIMUM5_FRIENDLY_NAME_ALLOWED, SAVE, TAGS } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';
import RSTagsComponent from 'Components/RSTagsComponent';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';


const TagsModal = ({ tags = [], show, handleClose, onSubmit, reducerState }) => {
    const [isShow, setIsShow] = useState(false);
    const [isEnableSave, setIsEnableSave] = useState(false);
    const [keyword, setKeyword] = useState({
        tags: tags,
        errorMessage: '',
    });

    // useEffect(() => {
    //     setIsShow(show);
    // }, [show]);

    const onSave = () => {
        // if (!keyword.tags?.length && isRequired) {
        //     UpdateState(setKeyword, 'errorMessage', ENTER_TAGS);
        //     return;
        // }
        onSubmit(keyword.tags);
        if (keyword.tags) {
            setIsEnableSave(true);
        } else {
            setIsEnableSave(false);
        }
    };

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
                        isLocalization = {true}
                        customTagClass='rs-tags-wrapper-scroll'
                        updatedTags={(tags) => UpdateState(setKeyword, ['tags', 'errorMessage'], [tags, ''])}
                        size={5}
                    />
                    {/* <div className="mr25 mt5">{TAGS_SMALL}</div> */}
                    {/* <small className="small-text-space-top">
                    {FRIENDLY_NAME_COMMA_SEPARATOR}</small> */}
                    <small className="small-text-space-top">  {MAXIMUM5_FRIENDLY_NAME_ALLOWED}</small>
                    
                </Fragment>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={handleClose} >{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton disabledClass={isEnableSave ? '' : 'pe-none click-off'} onClick={onSave}>
                    {SAVE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default TagsModal;
