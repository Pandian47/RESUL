import { baseURL } from 'Constants/EndPoints';
import { ALLOWED_FORMATS, FILE_NAME_EXTENSIONS_JPG_PNG_JPEG_1, FILE_SIZE500KB } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium, circle_pencil_medium, circle_plus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { get as _get } from 'Utils/modules/lodashReplacements';
import PropTypes from 'prop-types';

import { IMG_SIZE_500KB, INVALID_FORMAT } from 'Constants/GlobalConstant/ValidationMessage';
import { getFileToBase64 } from 'Utils/base64';
import { userImg } from 'Assets/Images';
import { Building } from 'Assets/Images';
import RSTooltip from 'Components/RSTooltip';

const RSImageUpload = ({
    className = '',
    name,
    errors,
    rules,
    control,
    defaultValue = null,
    labelName,
    newImg = null,
    tooltipText = 'image',
    text = 'Edit profile picture',
    alt = 'picture',
    setError,
    clearErrors,
    setValue,
    required,
    note = true,
    isUser = false,
    isPreview = false,
    ...rest
}) => {
    const [profileImg, setProfileImg] = useState(Building);
    const [profileTooltip, setProfileTooltip] = useState(false);
    useEffect(() => {
        if (isUser) setProfileImg(userImg);
    }, [isUser]);
    return (
        <Controller
            rules={rules}
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field: { onChange, value, ...restField }, fieldState: { error } }) => {
                const isBase64Includes = value?.includes('base64') || false;
                let imageSrc;
                if (isBase64Includes) {
                    imageSrc = value;
                } else if (value?.includes('Uploads')) {
                    imageSrc = baseURL + value;
                } else {
                    imageSrc = `data:image/png;base64,${value}`;
                }
                const _isEmpty = _get(error, 'message', '')?.length > 0;
                return (
                    <>
                        <div
                            className={`picture ${className} ${_isEmpty ? 'errorContainer' : ''} ${
                                required ? 'required' : 'optional'
                            }`}
                        >
                            {/* <RSTooltip
                                text={
                                    value?.length
                                        ? `Update ${tooltipText ? 'profile' : ''} image`
                                        : `Upload / Add ${tooltipText ? 'profile' : ''} image`
                                }
                                position="top"
                            > */}
                            <figure className="">
                                <img src={!!value?.length && value !== null ? imageSrc : profileImg} alt={alt} />
                            </figure>

                            <div className={`picture-choose-file ${!!value?.length && value !== null ? 'valid-image': ''}`}>
                                <span className="info">
                                    <RSTooltip
                                        text={value?.length ? `Update ${tooltipText}` : `Upload ${tooltipText}`}
                                        position="top"
                                        show={profileTooltip}
                                    >
                                        <span
                                            onMouseEnter={() => {
                                                setProfileTooltip(true);
                                            }}
                                            onMouseLeave={() => {
                                                setProfileTooltip(false);
                                            }}
                                        >
                                            <input
                                                id="rs_Imageupload_plus"
                                                type="file"
                                                accept=".jpg,.png,.jpeg,.JPG,.JPEG,.PNG"
                                                {...restField}
                                                {...rest}
                                                onChange={(e) => {
                                                    const imgFile = e.target.files[0];
                                                    // console.log('imgFile', imgFile.name);
                                                    var idxDot = imgFile?.name.split('.')[1].toLocaleLowerCase();
                                                    let imageFormat = false;
                                                    if (
                                                        idxDot === 'jpg' ||
                                                        idxDot === 'jpeg' ||
                                                        idxDot === 'JPG' ||
                                                        idxDot === 'JPEG' ||
                                                        idxDot === 'PNG' ||
                                                        idxDot === 'png'
                                                    )
                                                        imageFormat = true;
                                                    else imageFormat = false;
                                                    // console.log('imageFormat', imageFormat);
                                                    if (imgFile?.size / 1024 <= 512 && imageFormat) {
                                                        getFileToBase64(
                                                            imgFile,
                                                            (data) => {
                                                                clearErrors(name);
                                                                onChange(data);
                                                            },
                                                            (err) => {},
                                                        );
                                                    } else {
                                                        imageFormat
                                                            ? setError(name, {
                                                                  type: 'custom',
                                                                  message: IMG_SIZE_500KB,
                                                              })
                                                            : setError(name, {
                                                                  type: 'custom',
                                                                  message: INVALID_FORMAT,
                                                              });
                                                    }
                                                    e.target.value = null;
                                                }}
                                                className="btn"
                                                name={name}
                                                title=""
                                            ></input>
                                        </span>
                                    </RSTooltip>
                                    {!isPreview && (
                                        <>
                                            {value?.length && value !== null ? (
                                                <>
                                                    <span className="pcf-remove-icon">
                                                        <RSTooltip text={`Remove ${tooltipText}`} position="top">
                                                            <i
                                                                id="rs_RSImageUpload_circle_minus_fill"
                                                                className={`${circle_minus_fill_medium} color-primary-red icon-md`}
                                                                onClick={() => {
                                                                    setValue(name, null);
                                                                }}
                                                                //title={`Remove ${tooltipText}`}
                                                            ></i>
                                                        </RSTooltip>
                                                    </span>{' '}
                                                    <i
                                                        className={`${circle_pencil_medium} color-primary-blue icon-md`}
                                                        id="rs_data_circle_pencil"
                                                    />
                                                </>
                                            ) : (
                                                <i
                                                    className={`${circle_plus_fill_medium} color-primary-blue icon-md`}
                                                    id="rs_data_circle_plus_fill"
                                                />
                                            )}
                                        </>
                                    )}
                                    <span className="pcf-label">{text}</span>
                                </span>
                            </div>
                            {/* </RSTooltip> */}
                            {!!_isEmpty && <div className="validation-message">{_get(error, 'message', '')}</div>}
                        </div>
                        {note && (
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
            }}
        />
    );
};

RSImageUpload.propTypes = {
    alt: PropTypes.string,
    className: PropTypes.string,
    clearErrors: PropTypes.func.isRequired,
    control: PropTypes.object.isRequired,
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    labelName: PropTypes.string,
    name: PropTypes.string.isRequired,
    rules: PropTypes.object,
    setError: PropTypes.func.isRequired,
    setValue: PropTypes.func.isRequired,
    newImg: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null, undefined])]),
    tooltipText: PropTypes.string,
    text: PropTypes.string,
    required: PropTypes.bool,
    note: PropTypes.bool,
    isUser: PropTypes.bool,
    isPreview: PropTypes.bool,
};

export default memo(RSImageUpload);
