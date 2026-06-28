import { colorpicker_bg_fill_medium, delete_medium, refresh_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { uploadImageCommunicationFile } from 'Reducers/communication/createCommunication/Create/request';
import RSColorPicker from 'Components/ColorPicker';
import { Form } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import { useSelectedComponent } from '../SelectedComponentContext';

const BackgroundProperties = ({
    selectedComponent,
    handleChange,
    horizontalAlignmentOptions,
    verticleAlignmentOptions,
    control,
    clearErrors,
    setError,
    watch,
}) => {
    
    const { setComponents, components} = useSelectedComponent();
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const imagFile = async (base64Image, imageFormat) => {
        try {
            if (!base64Image || !imageFormat) {
                throw new Error('Base64 image or format is missing');
            }

            const validFormats = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validFormats.includes(imageFormat)) {
                throw new Error('Unsupported image format. Use JPEG, PNG, or GIF.');
            }
            const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

            const payload = {
                clientId,
                userId,
                departmentId,
                base64Image: base64Data,
                imageFormat: imageFormat.split('/')[1],
            };

            const { data, status } = await dispatch(uploadImageCommunicationFile({ payload }));
            if (status) {
                return data;
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <>
            <div className=" items-padding">
                <Form.Group className="d-flex justify-content-between align-items-center">
                    <Form.Label className='d-flex align-items-center'>
                        {'Background color'}
                        {selectedComponent && selectedComponent.bgColor && (
                            <>
                                <RSTooltip text={'Refres'} position="top" className="lh0 ml5">
                                    <i
                                        className={`${refresh_mini} icon-xs color-primary-blue`}
                                        onClick={() => handleChange('bgColor', null)}
                                    />
                                </RSTooltip>
                            </>
                        )}
                    </Form.Label>

                    <RSColorPicker
                        icon={colorpicker_bg_fill_medium}
                        tooltipText="Background color"
                        initColor={selectedComponent.bgColor || '#333333'}
                        colorValue={selectedComponent.bgColor}
                        onSelect={(e) => {
                            handleChange('bgColor', e);
                        }}
                    />
                </Form.Group>
            </div>
            {/* <div className="items-padding">
            <Form.Group>
                    <Row>
                        <Form.Label className="mb5">{'Container background'}</Form.Label>
                        <RSFileUpload
                            isbase64
                            control={control}
                            name={'src'}
                            accept=".jpg,jpeg,.png,svg"
                            isPrefix
                            clearErrors={clearErrors}
                            setError={setError}
                            size={2000000}
                            rules={{
                                required: UPLOAD_FILE,
                            }}
                            watch={watch}
                            handleChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                                    if (!validTypes.includes(file.type)) {
                                        setError('src', {
                                            type: 'manual',
                                            message: 'Invalid file type. Use JPEG, PNG, or GIF.',
                                        });
                                        return;
                                    }

                                    try {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file);
                                        await new Promise((resolve, reject) => {
                                            reader.onload = () => resolve();
                                            reader.onerror = () => reject(new Error('Failed to read file'));
                                        });

                                        const base64Image = reader.result;
                                        const imageFormat = file.type;
                                        const imageUrl = await imagFile(base64Image, imageFormat);
                                        if (imageUrl) {
                                            handleChange('bgImage', imageUrl);
                                            setValue('src', imageUrl, { shouldValidate: true });
                                            clearErrors('src');
                                        }
                                        const img = new Image();
                                        img.src = imageUrl;
                                        await new Promise((resolve, reject) => {
                                            img.onload = () => resolve();
                                            img.onerror = () => reject(new Error('Failed to load image'));
                                        });
                                        
                                        let columnWidth = 200; 
                                        if (selectedComponent?.grid_data_id) {
                                            for (const component of components) {
                                                if (component.column) {
                                                    for (const column of component.column) {
                                                        if (column.children) {
                                                            const imageChild = column.children.find(
                                                                child => child.grid_data_id === selectedComponent.grid_data_id
                                                            );
                                                            if (imageChild) {
                                                                columnWidth = column.width;
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        handleChange('bgWidth', columnWidth);
                                        setValue('bgWidth', columnWidth);
                                        
                                    } catch (error) {
                                        setError('src', {
                                            type: 'manual',
                                            message: error.message || 'Failed to upload image',
                                        });
                                    }
                                }
                            }}
                            customEmailFooterText={
                                <>
                                    <div className="flex flex-col items-center">
                                        <h6>Click here to upload image</h6>
                                        <small>Not more than 2MB</small>
                                        <small>.png, .jpg, .jpeg, .gif only</small>
                                    </div>
                                </>
                            }
                            containerClass="rs-image-upload-properties"
                        />

                        <Col>
                            {selectedComponent.bgImage && (
                                <div className="pt20">
                                    <>
                                        <div className="d-flex image-preview-rgt-contoller justify-content-between items-padding border-bottom-0 mb0">
                                            <img
                                                src={selectedComponent.bgImage}
                                                alt="Preview"
                                                style={{
                                                    // maxWidth: '250px',
                                                    maxHeight: '250px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <RSTooltip
                                                text={'Delete'}
                                                position="top"
                                                className="lh0 position-absolute right5 top5 bg-white p5 image-delete"
                                            >
                                                <i
                                                    className={`${delete_medium} icon-md color-primary-red`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleChange('bgImage', null);
                                                    }}
                                                />
                                            </RSTooltip>
                                        </div>
                                    </>
                                </div>
                            )}
                        </Col>
                    </Row>
                
            </Form.Group>
            {selectedComponent && selectedComponent?.bgImage && (
                <>
                    <Form.Group className="d-flex justify-content-between align-items-center items-padding border-bottom-0 mb0">
                        <Form.Label>{'Background image repeat'}</Form.Label>
                        <RSSwitch
                            name={`bgRepeat-${selectedComponent.id}`}
                            control={control}
                            handleChange={(chk) => {
                                if (chk) {
                                    handleChange('bgRepeat', 'repeat');
                                } else {
                                    handleChange('bgRepeat', 'no-repeat');
                                }
                            }}
                        />
                    </Form.Group>

                    <Form.Group className="items-padding border-bottom-0 mb0">
                        <PositionControllerWithLabel
                        className="align-items-center d-flex justify-content-between"
                            label="Horizontal"
                            options={horizontalAlignmentOptions}
                            name="horizontalPosition"
                            selectedValue={selectedComponent.bgPositionX}
                            onChange={(value) => handleChange('bgPositionX', value)}
                        />
                    </Form.Group>

                    <Form.Group className="items-padding border-bottom-0 mb0">
                        <PositionControllerWithLabel
                        className="align-items-center d-flex justify-content-between"
                            label="Vertical"
                            options={verticleAlignmentOptions}
                            name="verticalPosition"
                            selectedValue={selectedComponent.bgPositionY}
                            onChange={(value) => handleChange('bgPositionY', value)}
                        />
                    </Form.Group>

                    <Form.Group className="items-padding border-bottom-0 mb0">
                        <WidthHeightLabel
                            label="Width"
                            targetName="bgWidth"
                            value={selectedComponent.bgWidth}
                            step={1}
                            defaultValue={100}
                            onValueChange={(finalValue) => {
                                handleChange('bgWidth', finalValue);
                            }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <WidthHeightLabel
                            label="Height"
                            targetName="bgHeight"
                            value={selectedComponent.bgHeight}
                            step={1}
                            defaultValue={100}
                            onValueChange={(finalValue) => {
                                handleChange('bgHeight', finalValue);
                            }}
                        />
                    </Form.Group>
                </>
            )}
            </div> */}
        </>
    );
};

export default BackgroundProperties;
