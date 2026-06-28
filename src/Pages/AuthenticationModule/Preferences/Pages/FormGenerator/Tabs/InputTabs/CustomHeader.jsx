import { SETTINGS, UPLOAD_LOGO } from 'Constants/GlobalConstant/Placeholders';
import { memo, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import RSTooltip from 'Components/RSTooltip';
import SettingsPopup from './SettingsPopup';
import HeaderImagePopup from './HeaderImagePopup';
import { BODYCONFIG, SETTINGS_ICON_MD } from '../../constant';
const CustomHeader = ({ index, labelName, mandatory, preview }) => {
    const { control } = useFormContext();
    const watcher = useWatch({ control, name: `formGenerator[${index}]` });
    const settings = watcher?.settings || {};

    const [settingsPopup, setSettingsPopup] = useState(false);
    const [imagePopup, setImagePopup] = useState(false);

    const bgColor = settings?.bgColor || '';
    const useGradient = !!settings?.useGradient;
    const gradientStart = settings?.gradientStart || bgColor;
    const gradientEnd = settings?.gradientEnd || bgColor;
    const bgImageUrl = settings?.bgImageUrl || '';
    const headerImageUrlRaw = settings?.headerImageUrl || '';
    const headerImageAlign = settings?.headerImageAlign || 'left';
    const labelInitial = watcher?.tinyMceLableMain ?? labelName;

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

    const backgroundStyle = useMemo(() => {
        const layers = [];
        if (useGradient) {
            layers.push(`linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`);
        }
        if (bgImageUrl) {
            layers.push(`url(${bgImageUrl})`);
        }
        if (layers.length) {
            return { backgroundImage: layers.join(', '), backgroundSize: 'cover', backgroundPosition: 'center' };
        }
        return { backgroundColor: bgColor };
    }, [useGradient, gradientStart, gradientEnd, bgImageUrl, bgColor]);

  

    const containerClass = preview ? 'fbc-preview' : 'form-builder-component';

    return (
        <div className={`textForm ${containerClass}`} style={{ ...backgroundStyle }}>
            <div className="rs-form-element-wrapper">
                <div className="rs-form-content-holder" style={{ width: '100%' }}>
                    <div className="rsfch-label" style={{ width: '100%' }}>
                        {headerImageAlign === 'center' ? (
                            <div className="rsch-row" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="d-flex justify-content-center align-items-center">
                                    <div className="rsch-image-col text-center" style={{ textAlign: 'center' }}>
                                        {headerImageUrl ? (
                                            <img
                                                className="rsch-label-image cp"
                                                src={headerImageUrl}
                                                alt="Header"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImagePopup(true);
                                                }}
                                            />
                                        ) : (
                                            false && (
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-sm"
                                                    onClick={(e) => {
                                                        setSettingsPopup(true)
                                                    }}
                                                >
                                                    {UPLOAD_LOGO}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-center">
                                    <div className="rsch-editor-col flex-grow-1" style={{ textAlign: 'center' }}>
                                        <div className="text-editor-container" style={{ width: '100%' }}>
                                    <RSEditorPopup
                                        name={`formGenerator[${index}].tinyMceLableMain`}
                                        control={control}
                                        initialValue={labelInitial}
                                        init={BODYCONFIG}
                                        disabled={preview}
                                        required={false}
                                    />
                                        </div>
                                        {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                                    </div>
                                </div>
                                {!preview && (
                                    <div className="rsch-settings-col d-flex justify-content-end align-items-center">
                                        <RSTooltip position="top" text={SETTINGS} className="lh0">
                                            <i
                                                className={`${SETTINGS_ICON_MD} icon-md color-primary-blue cp`}
                                                onClick={() => setSettingsPopup(true)}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={`${preview ?'' : 'rsch-row'}`} style={{ display: 'flex', flexDirection: 'row' }}>
                                {headerImageAlign !== 'right' && (
                                    <div className="rsch-image-col text-center" style={{ textAlign: 'left' }}>
                                        {headerImageUrl ? (
                                            <img
                                                className="rsch-label-image cp"
                                                src={headerImageUrl}
                                                alt="Header"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImagePopup(true);
                                                }}
                                            />
                                        ) : (
                                            false && (
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-sm"
                                                    onClick={(e) => {
                                                        setSettingsPopup(true)
                                                    }}
                                                >
                                                    {UPLOAD_LOGO}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                                <div className="rsch-editor-col flex-grow-1 ">
                                    <div className="text-editor-container" style={{ width: '100%' }}>
                                            <RSEditorPopup
                                                name={`formGenerator[${index}].tinyMceLableMain`}
                                                control={control}
                                                initialValue={labelInitial}
                                                init={BODYCONFIG}
                                                disabled={preview}
                                                required={false}
                                            />
                                    </div>
                                    {mandatory && preview && <span className="rs-form-mandatory">*</span>}
                                </div>
                                {headerImageAlign === 'right' && (
                                    <div className="rsch-image-col text-center" style={{ textAlign: 'right' }}>
                                        {headerImageUrl ? (
                                            <img
                                                className="rsch-label-image cp"
                                                src={headerImageUrl}
                                                alt="Header"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImagePopup(true);
                                                }}
                                            />
                                        ) : (
                                            false && (
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-sm"
                                                    onClick={(e) => {
                                                        setSettingsPopup(true)
                                                    }}
                                                >
                                                    {UPLOAD_LOGO}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                                {!preview && (
                                    <div className="rsch-settings-col d-flex justify-content-end align-items-center">
                                        <RSTooltip position="top" text={SETTINGS} className="lh0">
                                            <i
                                                className={`${SETTINGS_ICON_MD} icon-md color-primary-blue cp`}
                                                onClick={() => setSettingsPopup(true)}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {settingsPopup && (
                    <SettingsPopup
                        show={settingsPopup}
                        onHide={() => setSettingsPopup(false)}
                        type={'customHeader'}
                        header={'Custom header settings'}
                        setFieldSettings={() => {}}
                        fieldSettings={{}}
                        placeHolder={''}
                        control={control}
                        index={index}
                        setSettingsPopup={setSettingsPopup}
                        elementType={'customHeader'}
                    />
                )}
                {imagePopup && (
                    <HeaderImagePopup
                        show={imagePopup}
                        onHide={() => setImagePopup(false)}
                        index={index}
                        headerImageUrl={headerImageUrl}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(CustomHeader);