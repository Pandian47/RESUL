import { ENTER_TAGS } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, ENTER_VALUES_WITH_COMMA_SEPARATOR, INTREST_TYPE, REASON_TYPE, SAVE, SUBSCRIPTION } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import RSTagsComponent from 'Components/RSTagsComponent';
import RSModal from 'Components/RSModal';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { UpdateState } from 'Utils/modules/misc';

const OthersModal = ({ tags = '', show, isEditContent, handleClose, onSubmit, modalName }) => {
    const [isShow, setIsShow] = useState(false);
    const { control, setValue } = useFormContext();

    const [keyword, setKeyword] = useState({
        tags: tags,
        errorMessage: '',
    });

    useEffect(() => {
        setIsShow(!!show);
    }, [show]);

    useEffect(() => {
        // UpdateState(setKeyword, 'tags', tags);
        let temp = tags?.filter((item) => item.toLowerCase() !== 'others');
        setKeyword((pre) => ({ ...pre, tags: temp }));
        setValue('Others', tags?.filter((item) => item == 'Others')?.length != 0);
    }, [tags]);
    const handleCloseAction = () => {
        setKeyword((pre) => ({ ...pre, tags: tags }));
        handleClose();
    };
    const onSave = () => {
        if (!keyword.tags?.length) {
            UpdateState(setKeyword, 'errorMessage', ENTER_TAGS);
            return;
        } else {
            UpdateState(setKeyword, 'errorMessage', '');
            onSubmit(keyword.tags);
        }
    };
    let Others = tags?.filter((item) => item == 'Others')?.length != 0;
    return (
        <RSModal
            show={isShow}
            size="lg"
            header={modalName.toLowerCase() === SUBSCRIPTION ? INTREST_TYPE : REASON_TYPE}
            handleClose={handleCloseAction}
            body={
                <>
                    <RSTagsComponent
                        errorMessage={keyword.errorMessage}
                        tags={
                            keyword.tags?.length > 0 && keyword.tags[0] !== ''
                                ? keyword.tags?.filter((item) => item !== 'Others')
                                : []
                        }
                        updatedTags={(tags) => UpdateState(setKeyword, ['tags', 'errorMessage'], [tags, ''])}
                    />
                    <small>{ENTER_VALUES_WITH_COMMA_SEPARATOR}</small>
                    <RSCheckbox
                        control={control}
                        name="Others"
                        labelName=" Enable others"
                        containerClass="mt19"
                        //checked={tags.filter((item) => item == 'others')?.length != 0}
                    />
                </>
            }
            footer={
                <div className="btn-container d-flex justify-content-end mt0">
                    <RSSecondaryButton
                        onClick={() => {
                            handleCloseAction();
                            // setKeyword((pre) => ({ ...pre, tags: [] }));
                            // handleClose();
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton onClick={() => onSave()}>{SAVE}</RSPrimaryButton>
                </div>
            }
        />
    );
};

export default OthersModal;
