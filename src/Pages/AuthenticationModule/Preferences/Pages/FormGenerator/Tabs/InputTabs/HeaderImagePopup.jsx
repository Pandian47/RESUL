import { CHOOSE_ALIGNMENT, CLOSE, HEADER_IMAGE_SETTINGS, IMAGE_LOAD_ERROR, NO_HEADER_IMAGE } from 'Constants/GlobalConstant/Placeholders';
import { editor_align_center_medium, editor_align_left_medium, editor_align_right_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
const ALIGNMENT_OPTIONS = [
    {
        value: 'left',
        label: 'Align Left',
        icon: editor_align_left_medium,
    },
    {
        value: 'center',
        label: 'Align Center',
        icon: editor_align_center_medium,
    },
    {
        value: 'right',
        label: 'Align Right',
        icon: editor_align_right_medium,
    },
];

const HeaderImagePopup = ({ show, onHide = () => {}, index, headerImageUrl: headerImageUrlRaw }) => {
    const { setValue, getValues } = useFormContext();
    const fieldName = `formGenerator[${index}].settings.`;
    const currentAlign = getValues(fieldName + 'headerImageAlign') || 'left';
    const [align, setAlign] = useState(currentAlign);

    // Extract URL string from headerImageUrl (handle both string and object cases)
    const headerImageUrl = useMemo(() => {
        if (!headerImageUrlRaw) return '';
        if (typeof headerImageUrlRaw === 'string') return headerImageUrlRaw;
        // If it's an object, try to extract the URL from common properties
        if (typeof headerImageUrlRaw === 'object') {
            return headerImageUrlRaw.url || headerImageUrlRaw.imageUrl || headerImageUrlRaw.inputUrl || headerImageUrlRaw.data || '';
        }
        return '';
    }, [headerImageUrlRaw]);

    useEffect(() => {
        if (!show) return;
        setAlign(currentAlign);
    }, [show, currentAlign]);

    if (!show) return null;

    const handleAlignmentChange = (value) => {
        setAlign(value);
        setValue(fieldName + 'headerImageAlign', value, { shouldValidate: true, shouldDirty: true });
    };

    return (
        <RSModal
            show={show}
            header={HEADER_IMAGE_SETTINGS || 'Header image settings'}
            isCloseButton
            handleClose={onHide}
            className="header-image-modal"
            body={
                <div className="rs-header-image-modal" style={{justifyContent:align}}>
                    <div className="rs-header-image-preview">
                        {headerImageUrl ? (
                            <img 
                                src={headerImageUrl} 
                                alt="Header preview"
                                onError={(e) => {
                                    const target = e.target;
                                    target.style.display = 'none';
                                    // Show error message if image fails to load
                                    const emptyDiv = target.parentElement?.querySelector('.rs-header-image-empty');
                                    if (emptyDiv) {
                                        emptyDiv.textContent = IMAGE_LOAD_ERROR || 'Failed to load image';
                                        emptyDiv.style.display = 'block';
                                    }
                                }}
                            />
                        ) : null}
                        {!headerImageUrl && (
                            <div className="rs-header-image-empty">{NO_HEADER_IMAGE || 'No header image configured'}</div>
                        )}
                    </div>
                    <div className="rs-header-image-align-section">
                        <p>{CHOOSE_ALIGNMENT || 'Choose alignment'}</p>
                        <div className="rs-header-image-toolbar">
                            {ALIGNMENT_OPTIONS.map((option) => (
                                <button
                                    type="button"
                                    key={option.value}
                                    className={`btn btn-light btn-sm ${align === option.value ? 'active' : ''}`}
                                    onClick={() => handleAlignmentChange(option.value)}
                                    title={option.label}
                                >
                                    <i className={`${option.icon} icon-md`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <RSPrimaryButton onClick={onHide}>{CLOSE || 'Close'}</RSPrimaryButton>
                    </div>
                </div>
            }
        />
    );
};

export default memo(HeaderImagePopup);