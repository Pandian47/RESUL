import { FRIENDLY_NAME_COMMA_SEPARATOR, MAX_100_OPTIONS, MAX_12_OPTIONS, MAX_7_OPTIONS } from 'Constants/GlobalConstant/Placeholders';
import RSInput from 'Components/FormFields/RSInput';
import RSTagsComponent from 'Components/RSTagsComponent';

function TagFields({ control, elementType, fieldName, tagValue, setTagValue, errorMessage = '', isRefreshTooltip = '' }) {
    // Set size limits based on element type
    const getSizeLimit = (elementType) => {
        switch (elementType) {
            case 'radio':
                return 7; // max 7 for radio buttons
            case 'checkbox':
                return 12; // max 12 for checkboxes
            case 'combobox':
                return 100; // max 100 for combobox
            default:
                return 100;
        }
    };

    return (
        <div className="rsfb-settings-selectbox">
            {elementType === 'combobox' && (
                <div className="form-group">
                    <RSInput
                        control={control}
                        //handleOnBlur={(e) => setInputField(e.target.value)}
                        name={fieldName + 'tagsLabelName'}
                        defaultValue={'Select'}
                        placeholder={'Combo box label name'}
                    />
                </div>
            )}
            <div className="">
                <RSTagsComponent
                    tags={tagValue}
                    size={getSizeLimit(elementType)}
                    updatedTags={(tags) => {
                        setTagValue(tags);
                    }}
                    elementType={elementType}
                    errorMessage={errorMessage}
                    isRefreshTooltip={isRefreshTooltip}
                    isallowSpecialCharacter={true}
                    isLocalization
                    customTagClass='rs-tags-wrapper-scroll rs-tags-wrapper-big'
                    isRefreshWarning={true}
                    // cssScrollbar
                    ignoreLength={true}
                    fromForms={true}
                    minChars={2}
                />
                <small className="small-text-space-top"> {FRIENDLY_NAME_COMMA_SEPARATOR}</small>
                {elementType === 'radio' && (
                    <small className="small-text-space-top"> {MAX_7_OPTIONS}</small>
                )}
                {elementType === 'checkbox' && (
                    <small className="small-text-space-top"> {MAX_12_OPTIONS}</small>
                )}
                {elementType === 'combobox' && (
                    <small className="small-text-space-top"> {MAX_100_OPTIONS}</small>
                )}
            </div>
        </div>
    );
}

export default TagFields;
