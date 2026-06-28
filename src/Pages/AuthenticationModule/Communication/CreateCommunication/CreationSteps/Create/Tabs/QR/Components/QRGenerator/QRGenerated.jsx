import { DOWNLOAD_QR_POPHOVER_TEXT, QR_POPHOVER_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, copy_medium, download_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { QRCodeCanvas } from 'qrcode.react';
import RSPPophover from 'Components/RSPPophover';
import BootstrapDropdown from 'Components/FormFields/RSBootstrapdown';
import RSTooltip from 'Components/RSTooltip';
import RSSwitch from 'Components/FormFields/RSSwitch';
import *  as placeholder  from 'Constants/GlobalConstant/Placeholders';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

const QRGenrated = ({
    range,
    show,
    value,
    logo,   
    getBase_QR,
    short_url,
    download_pdf,
    download_img,
    cmnURL,
    cmnsURLSML = '',
    tab,
}) => {
    const { control, register, setValue, watch } = useFormContext();
    const [shortURL, setShortURL] = useState(short_url);
    const [isCopied, setIsCopied] = useState(false);
    const [processedLogo, setProcessedLogo] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [localRange, setLocalRange] = useState(range || 200);
    const qrRef = useRef(null);
    const debounceTimer = useRef(null);
    
    // Fixed preview size - QR code preview will always be this size
    const previewSize = 200;
    
    // Watch the range value from the form
    const watchedRange = watch('range');
    const currentRange = watchedRange || localRange || 200;

    // Improved logo processing function
  const processLogoForQR = async (logoUrl, qrSize) => {
        if (!logoUrl || !qrSize || qrSize <= 0) {
            return null;
        }

        return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const timeout = setTimeout(() => {
            resolve(null);
            }, 10000);
        
        img.onload = () => {
            clearTimeout(timeout);
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
              const logoSize = Math.floor(qrSize * 0.15);
                const padding = Math.floor(logoSize * 0.4); // Increased padding for better separation
                const totalSize = logoSize + (padding * 2);
                canvas.width = totalSize;
                canvas.height = totalSize;
                
                    // Create white background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, totalSize, totalSize);
                
                    // Draw logo centered
                ctx.drawImage(img, padding, padding, logoSize, logoSize);
                
                const result = canvas.toDataURL('image/png');
                resolve(result);
            } catch (error) {
                resolve(null);
            }
        };
        
        img.onerror = (error) => {
            clearTimeout(timeout);
            resolve(null);
        };
        
        // Handle different image formats
        try {
            if (logoUrl.startsWith('data:')) {
                img.src = logoUrl;
            } else if (isBase64(logoUrl)) {
                    // Try different image formats for base64
                    const formats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
                    let formatFound = false;
                    
                    for (const format of formats) {
                        try {
                            img.src = `data:${format};base64,${logoUrl}`;
                            formatFound = true;
                            break;
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (!formatFound) {
                        img.src = `data:image/png;base64,${logoUrl}`;
                    }
            } else {
                img.src = logoUrl;
            }
        } catch (error) {
            clearTimeout(timeout);
            resolve(null);
        }
    });
};

    const getImageBase64 = () => {
        if (qrRef.current) {
            const canvas = qrRef.current.querySelector('canvas');
            return canvas ? canvas.toDataURL() : null;
        }
        return null;
    };


    // Debounced QR generation function
    const generateQRWithDebounce = (delay = 300) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        
        debounceTimer.current = setTimeout(() => {
            if (getBase_QR && (value || cmnsURLSML) && !isGenerating) {
                setIsGenerating(true);
                const base64 = getImageBase64();
                if (base64) {
                    getBase_QR(base64);
                }
                setIsGenerating(false);
            }
        }, delay);
    };

    // Process logo for preview (always use preview size)
    useEffect(() => {
        const processPreviewLogo = async () => {
            if (logo && previewSize > 0) {
                const processed = await processLogoForQR(logo, previewSize);
                setPreviewLogo(processed);
            } else {
                setPreviewLogo(null);
            }
        };
        
        const timer = setTimeout(processPreviewLogo, 200);
        return () => clearTimeout(timer);
    }, [logo]);

    // Process logo for download (use current range)
    useEffect(() => {
        const processDownloadLogo = async () => {
            if (logo && currentRange && currentRange > 0) {
                const processed = await processLogoForQR(logo, currentRange);
                setProcessedLogo(processed);
            } else {
                setProcessedLogo(null);
            }
        };
        
        const timer = setTimeout(processDownloadLogo, 200);
        return () => clearTimeout(timer);
    }, [logo, currentRange]);

    // Generate QR base64 when content changes (debounced)
    useEffect(() => {
        if (getBase_QR && (value || cmnsURLSML)) {
            generateQRWithDebounce(500);
        }
    }, [value, cmnsURLSML, processedLogo, getBase_QR]);

    // Generate QR when range changes (with longer debounce for slider)
    useEffect(() => {
        if (getBase_QR && (value || cmnsURLSML)) {
            generateQRWithDebounce(800);
        }
    }, [currentRange]);

    const isBase64 = (str) => {
        try {
            const decodedString = atob(str);
            const encodedString = btoa(decodedString);
            return encodedString === str;
        } catch (error) {
            return false;
        }
    };

    const convertCanvasToEPS = () => {
        if (!qrRef.current) return null;
        
        const canvas = qrRef.current.querySelector('canvas');
        if (!canvas) return null;

        // Use the actual range for download, not preview size
        const actualSize = currentRange || 200;
        
        // Create a temporary canvas with the desired size
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = actualSize;
        tempCanvas.height = actualSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw the QR code at the desired size
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, actualSize, actualSize);
        tempCtx.drawImage(canvas, 0, 0, actualSize, actualSize);
        
        const width = tempCanvas.width;
        const height = tempCanvas.height;
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // EPS Header
        let eps = '%!PS-Adobe-3.0 EPSF-3.0\n';
        eps += `%%BoundingBox: 0 0 ${width} ${height}\n`;
        eps += '%%Creator: Resulticks QR Code Generator\n';
        eps += '%%Title: QR Code\n';
        eps += `%%CreationDate: ${new Date().toISOString()}\n`;
        eps += '%%Pages: 1\n';
        eps += '%%EndComments\n';
        eps += '%%BeginProlog\n';
        eps += '%%EndProlog\n';
        eps += '%%Page: 1 1\n\n';
        
        // Save graphics state
        eps += 'gsave\n\n';
        
        // Position and scale
        eps += `${width} ${height} scale\n`;
        
        // Define the image
        eps += `${width} ${height} 8\n`;
        eps += `[${width} 0 0 -${height} 0 ${height}]\n`;
        eps += `{currentfile ${width * 3} string readhexstring pop}\n`;
        eps += 'false 3\n';
        eps += 'colorimage\n\n';

        // Convert pixel data to hex format (RGB)
        let hexData = '';
        let lineLength = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i].toString(16).padStart(2, '0');
            const g = data[i + 1].toString(16).padStart(2, '0');
            const b = data[i + 2].toString(16).padStart(2, '0');
            hexData += r + g + b;
            lineLength += 6;
            
            // Break line every 60 characters for readability
            if (lineLength >= 60) {
                hexData += '\n';
                lineLength = 0;
            }
        }
        
        eps += hexData;
        if (!hexData.endsWith('\n')) eps += '\n';
        
        // Restore graphics state
        eps += '\ngrestore\n';
        eps += 'showpage\n';
        eps += '%%Trailer\n';
        eps += '%%EOF\n';

        return eps;
    };

    const downloadEPS = () => {
        const epsContent = convertCanvasToEPS();
        if (!epsContent) {
            return;
        }

        try {
            const blob = new Blob([epsContent], { type: 'application/postscript' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QRCode_${currentRange || 200}px_${Date.now()}.eps`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
        }
    };

    useEffect(() => {
        if (tab === 'sms') {
            setValue('short_url', true);
            setShortURL(true);
        } else {
            if (!download_img && !download_pdf) {
                setValue('short_url', false);
            }
        }
    }, [tab, setValue, download_img, download_pdf]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);
    return (
        <div
            className={`bg-tertiary-blue p10 theme-radius ${
                tab === 'url' ? (!cmnURL && !value ? 'click-off' : '') : !value ? 'click-off' : ''
            }`}
        >
            <figure ref={qrRef} style={{ textAlign: 'center', marginTop: '1rem' }}>
                <QRCodeCanvas
                    id="myQR"
                    value={value || cmnsURLSML}
                    size={previewSize}
                    bgColor="#ffffff"
                    fgColor="#000"
                    level="L"
                    includeMargin={false}
                    imageSettings={previewLogo ? {
                        src: previewLogo,
                        height: Math.floor(previewSize * 0.2),
                        width: Math.floor(previewSize * 0.2),
                        excavate: true,
                    } : undefined}
                />
                {short_url && <figcaption>{cmnsURLSML || cmnURL}</figcaption>}
            </figure>
            <hr></hr>
            <div className="my30">
                <div className='align-items-center d-flex mb15'>
                    <span className="mr10">Short URL</span>
                    <div className={`d-flex align-items-center ${tab === 'sms' ? 'click-off pe-none' : ''}`}>
                        <RSSwitch
                            control={control}
                            name="short_url"
                            className={`mr10 top-1`}
                            // handleChange={(e) => {
                            //     if (!e) {
                            //         reset(
                            //             (formState) => ({
                            //                 ...formState,
                            //                 kyc: false,
                            //                 qrShow: false,
                            //                 email_check: false,
                            //                 mobile_number_check: false,
                            //                 kycType: '',
                            //                 statement: '',
                            //             }),
                            //             {
                            //                 keepDirty: true,
                            //             },
                            //         );
                            //     }
                            // }}
                        />
                        {/* <RSPPophover pophover={'Selected short URL included to download as format.'}>
                            <i className={`${circle_question_mark_mini} icon-xs color-primary-blue`} id='circle_question_mark'></i>
                        </RSPPophover> */}

                      
                    </div>
                    <RSPPophover
                            pophover={
                                <ul>
                                    <li>
                                        <span>{QR_POPHOVER_TEXT}</span>
                                    </li>
                                </ul>
                            }
                        >
                            <i
                                className={`${circle_question_mark_mini} icon-xs color-primary-blue lh0`}
                                id="circle_question_mark"
                            ></i>
                        </RSPPophover>
                </div>

                {/* <Row className="pb10">
                <Col sm={12}>
                    <div className="rs-qr-link-ellipsis fs15">
                        <RSCheckbox
                            // labelName={cmnURL ? cmnURL : value}
                            labelName={cmnsURLSML ? cmnsURLSML : cmnURL}
                            name={'short_url'}
                            checked={shortURL}
                            control={control}
                            handleChange={(e) => {
                                // setShortURL(!shortURL);
                                setShortURL(e.target.checked);
                            }}
                        />
                    </div>
                </Col>
            </Row> */}
                {short_url && (
                    <div className="d-flex align-items-center justify-content-between mb15 p0">
                        <Col sm={10} className='border-secondary border-bottom pr0'>
                            {/* {short_url && !isCopied && <span>{cmnsURLSML ? cmnsURLSML : cmnURL}</span>} */}
                            {short_url &&
                                !isCopied &&
                                 <TruncatedCell value={cmnsURLSML ? cmnsURLSML : cmnURL} noTable={true} />
                               }
                            {isCopied && <small className="color-primary-green lh20">Copied successfully</small>}
                        </Col>
                        <Col sm={2} className="text-right">
                            <div className="rs-qr-link-copy position-relative right8 top4">
                                {/* Copy{' '} */}
                                <RSTooltip text={'Copy'} className="lh0">
                                    <i
                                        onClick={async () => {
                                            if ('clipboard' in navigator) {
                                                try {
                                                    await navigator.clipboard
                                                        .writeText(cmnsURLSML ? cmnsURLSML : cmnURL)
                                                        .then(() => {
                                                            // let temp = { ...state };
                                                            // temp.smartLinks[linkIndex].isCopied = true;
                                                            // UpdateState(setState, 'smartLinks', temp.smartLinks);
                                                            setIsCopied(true);
                                                            setTimeout(() => {
                                                                // temp.smartLinks[linkIndex].isCopied = false;
                                                                // UpdateState(setState, 'smartLinks', temp.smartLinks);
                                                                setIsCopied(false);
                                                            }, 1500);
                                                        });
                                                } catch (err) {
                                                                                                    }
                                            }
                                        }}
                                        className={`${copy_medium} color-primary-blue icon-md`}
                                    ></i>
                                </RSTooltip>
                            </div>
                        </Col>
                    </div>
                )}
            </div>
            <div className="d-flex align-items-center">
                <span className="mr5">Image size</span>
                {/* <RSPPophover pophover={'Specify the pixel dimensions for the download'}>
                    <i className={`${circle_question_mark_mini} icon-xs  color-primary-blue`} id='circle_question_mark'></i>
                </RSPPophover> */}
            </div>
            <Col sm={10} className="position-relative">
                <input
                    type="range"
                    min="200"
                    max="1000"
                    className="pr0 pl15"
                    value={currentRange}
                    onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        setLocalRange(newValue);
                        setValue('range', newValue);
                    }}
                />
                <RSPPophover
                    pophover={
                        <span>
                            {DOWNLOAD_QR_POPHOVER_TEXT}
                        </span>
                    }
                >
                    <i
                        className={`${circle_question_mark_mini} icon-xs color-primary-blue position-absolute mt8 right-23`}
                        id="circle_question_mark"
                    ></i>
                </RSPPophover>
            </Col>
            <small className="position-relative top-10 text-center">{currentRange || 200}px</small>
            {show && !!download_img && !!download_pdf && (
                <div style={{ textAlign: 'center' }}>
                    <ul className="rs-list-inline rli-space-5">
                        <li>Download </li>
                        <li>
                            <BootstrapDropdown
                                data={['PNG', 'PDF', 'EPS']}
                                showUpdate={false}
                                alignRight
                                className="no_caret"
                                onSelect={(e) => {
                                    if (e === 'PDF') {
                                        downloadFileObject(
                                            download_pdf,
                                            `QRCode_${currentRange || 200}px_${Date.now()}.pdf`,
                                        );
                                    } else if (e === 'PNG') {
                                        downloadFileObject(
                                            download_img,
                                            `QRCode_${currentRange || 200}px_${Date.now()}.png`,
                                        );
                                    } else if (e === 'EPS') {
                                        downloadEPS();
                                    }

                                    async function downloadFileObject(fileUrl, fileName) {
                                        try {
                                            const response = await fetch(fileUrl);
                                            const blob = await response.blob();

                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = fileName;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);

                                            window.URL.revokeObjectURL(url);
                                        } catch (error) {
                                        }
                                    }
                                }}
                                defaultItem={
                                    <i
                                        id="rs_data_download"
                                        className={`${download_medium} icon-md color-primary-blue position-relative top5`}
                                    />
                                }
                            />
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default QRGenrated;
