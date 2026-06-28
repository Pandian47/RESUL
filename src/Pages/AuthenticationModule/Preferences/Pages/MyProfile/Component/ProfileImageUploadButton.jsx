import { ALLOWED_FORMATS, EDIT_PROFILE_PICTURE, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, FILE_SIZE500KB, REMOVE_PROFILE_PICTURE, UPDATE_PROFILE_PICTURE, UPLOAD_PROFILE_PICTURE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_pencil_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import { userImg } from 'Assets/Images';
export const ProfileImageUploadButton = ({ value, onClick, onRemove, onEdit, error }) => {
    const [tooltip, setTooltip] = useState(false);
    const [removeTooltip, setRemoveTooltip] = useState(false);

    const isBase64Includes = value?.includes('base64') || false;
    let imageSrc;
    if (isBase64Includes) {
        imageSrc = value;
    } else if (value) {
        imageSrc = `data:image/png;base64,${value}`;
    } else {
        imageSrc = userImg;
    }

    return (
        <>
            <div className={`picture rs-picture mt20 ${error ? 'errorContainer' : ''} required`}>
                <figure>
                    <img src={imageSrc} alt="profile picture" />
                </figure>
                <div className={`picture-choose-file ${value ? 'valid-image' : ''}`}>
                    <span className="info">
                        <RSTooltip
                            text={value ? UPDATE_PROFILE_PICTURE : UPLOAD_PROFILE_PICTURE}
                            position="top"
                            show={tooltip}
                        >
                            <span
                                onMouseEnter={() => setTooltip(true)}
                                onMouseLeave={() => setTooltip(false)}
                                onClick={onClick}
                                style={{ cursor: 'pointer' }}
                            >
                                {value ? (
                                    <>
                                        <span className="pcf-remove-icon">
                                            <RSTooltip
                                                text={REMOVE_PROFILE_PICTURE}
                                                position="top"
                                                show={removeTooltip}
                                            >
                                                <i
                                                    className={`${circle_minus_fill_medium} color-primary-red icon-md`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemove();
                                                    }}
                                                    onMouseEnter={() => {
                                                        setRemoveTooltip(true);
                                                        setTooltip(false);
                                                    }}
                                                    onMouseLeave={() => setRemoveTooltip(false)}
                                                ></i>
                                            </RSTooltip>
                                        </span>
                                        <i
                                            className={`${circle_pencil_medium} color-primary-blue icon-md`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit && onEdit();
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </>
                                ) : (
                                    <i className={`${circle_plus_fill_medium} color-primary-blue icon-md`} />
                                )}
                            </span>
                        </RSTooltip>
                        <span className="pcf-label">{EDIT_PROFILE_PICTURE}</span>
                    </span>
                </div>
                {error && <div className="validation-message">{error}</div>}
            </div>
            {!value && (
                <div className="alert alert-warning d-block mt30 py10 border-r5">
                    <small className="text-center d-flex flex-column">
                        <span>{ALLOWED_FORMATS}</span>
                        <span>{FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1}</span>
                        <span>{FILE_SIZE500KB}</span>
                    </small>
                </div>
            )}
        </>
    );
};
