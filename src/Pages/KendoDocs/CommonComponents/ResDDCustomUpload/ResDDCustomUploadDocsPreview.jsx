import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import ResDDCustomUpload, { FILE_TYPE_PRESETS } from './index';

/**
 * KendoDocs preview — ResDDCustomUpload variations (multi/single, URL field, image, video, csv).
 */
const ResDDCustomUploadDocsPreview = () => {
    const { control } = useFormContext();
    const [multiImageFiles, setMultiImageFiles] = useState([]);
    const [singleImageFile, setSingleImageFile] = useState(null);
    const [singleWithUrlFile, setSingleWithUrlFile] = useState(null);
    const [videoFiles, setVideoFiles] = useState([]);
    const [csvFiles, setCsvFiles] = useState([]);

    const DemoVariation = ({ label, children }) => (
        <div className="kendo-docs-variation">
            <span className="kendo-docs-variation__label">{label}</span>
            <div className="kendo-docs-variation__body">{children}</div>
        </div>
    );

    const appendValidFiles = (setter) => (_results, { validFiles }) => {
        if (!validFiles?.length) return;
        setter((prev) => [...prev, ...validFiles]);
    };

    const makeMultiHandlers = (setter) => ({
        onFilesSelect: appendValidFiles(setter),
        onRemoveFile: (_file, index) => setter((prev) => prev.filter((_, i) => i !== index)),
        onClear: () => setter([]),
    });

    const makeSingleHandlers = (setFile) => ({
        isMultiFileUpload: false,
        onFileSelect: (file, { isValid } = {}) => {
            if (isValid) setFile(file);
        },
        onClear: () => setFile(null),
    });

    return (
        <div className="kendo-docs-custom-upload-demo">
            <p className="font-sm color-primary-grey mb15">
                <code>isShowUrl</code> defaults to <code>false</code>. Enable the <strong>or</strong> divider and URL
                field with <code>isShowUrl</code> + <code>control</code> + <code>urlName</code>.
            </p>
            <div className="kendo-docs-variations">
                <DemoVariation label="With Image URL (isShowUrl)">
                    <ResDDCustomUpload
                        inputId="docs_dd_upload_with_url"
                        fileType="image"
                        isMultiFileUpload={false}
                        isShowUrl
                        control={control}
                        urlName="docs_upload_image_url"
                        maxSize={10 * 1024 * 1024}
                        selectedFile={singleWithUrlFile}
                        {...makeSingleHandlers(setSingleWithUrlFile)}
                    />
                </DemoVariation>

                <DemoVariation label="Multi-file images (default)">
                    <ResDDCustomUpload
                        inputId="docs_dd_upload_multi_image"
                        fileType="image"
                        maxFiles={5}
                        selectedFiles={multiImageFiles}
                        {...makeMultiHandlers(setMultiImageFiles)}
                    />
                </DemoVariation>

                <DemoVariation label="Single image">
                    <ResDDCustomUpload
                        inputId="docs_dd_upload_single_image"
                        fileType="image"
                        selectedFile={singleImageFile}
                        {...makeSingleHandlers(setSingleImageFile)}
                    />
                </DemoVariation>

                <DemoVariation label="Multi-file video">
                    <ResDDCustomUpload
                        inputId="docs_dd_upload_multi_video"
                        fileType="video"
                        maxSize={50 * 1024 * 1024}
                        selectedFiles={videoFiles}
                        {...makeMultiHandlers(setVideoFiles)}
                    />
                </DemoVariation>

                <DemoVariation label="Multi-file CSV">
                    <ResDDCustomUpload
                        inputId="docs_dd_upload_multi_csv"
                        fileType="csv"
                        maxSize={10 * 1024 * 1024}
                        selectedFiles={csvFiles}
                        {...makeMultiHandlers(setCsvFiles)}
                    />
                </DemoVariation>

                <DemoVariation label="Processing state">
                    <ResDDCustomUpload inputId="docs_dd_upload_processing" fileType="image" isProcessing />
                </DemoVariation>
            </div>

            <ul className="kendo-docs-custom-upload-demo__props font-xs color-secondary-grey mt15 mb0">
                <li>
                    <code>isShowUrl</code> — default <code>false</code>; shows <strong>or</strong> divider + URL input
                    (requires <code>control</code> + <code>urlName</code>)
                </li>
                <li>
                    <code>urlPlaceholder</code> — auto from <code>fileType</code> preset (e.g. Image URL, Video URL)
                </li>
                <li>
                    <code>isMultiFileUpload</code> — default <code>true</code>; pass <code>false</code> for single-file
                </li>
                <li>
                    <code>showMaxSizeHint</code> — shows &quot;Maximum file size: NMB&quot; under supported formats
                </li>
            </ul>
        </div>
    );
};

export { FILE_TYPE_PRESETS };
export default ResDDCustomUploadDocsPreview;
