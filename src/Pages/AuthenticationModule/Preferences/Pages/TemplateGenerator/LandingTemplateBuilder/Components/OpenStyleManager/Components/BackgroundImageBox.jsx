import { close_medium, restart_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { BG_IMAGE_POSITION_DATA } from '../constants';
import { RSPrimaryButton } from 'Components/Buttons';
import AddImageModal from './AddImageModal';

const BackgroundImageBox = ({ rowName, remove, idx, element, bgValues }) => {
    const { control, setValue } = useFormContext();
    const [addImage, setAddImage] = useState(false);
    const setBackgroundValues = () => {
        var sizeValues = '';
        var repeatValues = '';
        var positionValues = '';
        var attachmentValues = '';
        var imageValues = '';
        for (var i = 0; i < bgValues?.length; i++) {
            sizeValues += bgValues[i].size || 'auto';
            repeatValues += bgValues[i].repeat || 'repeat';
            positionValues += bgValues[i].position || 'left top';
            attachmentValues += bgValues[i].attachement || 'scroll';
            imageValues += 'url(' + bgValues[i].imageSrc + ')' || '';
            if (i !== bgValues?.length - 1) {
                sizeValues += ', ';
                repeatValues += ', ';
                positionValues += ', ';
                attachmentValues += ', ';
                imageValues += ', ';
            }
        }
        if (element !== 'page') {
                        setValue(`${element}.backgroundImage`, imageValues);
            setValue(`${element}.backgroundSize`, sizeValues);
            setValue(`${element}.backgroundAttachment`, attachmentValues);
            setValue(`${element}.backgroundRepeat`, repeatValues);
            setValue(`${element}.backgroundPosition`, positionValues);
        } else {
            setValue(`${element}BackgroundImage`, imageValues);
            setValue(`${element}BackgroundSize`, sizeValues);
            setValue(`${element}BackgroundAttachment`, attachmentValues);
            setValue(`${element}BackgroundRepeat`, repeatValues);
            setValue(`${element}BackgroundPosition`, positionValues);
        }
        // console.log('Bg values .... :::: ', imageValues);
    };
    return (
        <Row
            className="mb30"
            style={{ display: 'flex', justifyContent: 'flex-end' }}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('bgRow', 'bgLayer' + idx)}
        >
            <Row>
                <Col>
                    <i className={`${settings_medium}`} />
                    <span>{'Layer ' + idx + 1}</span>
                </Col>
                <Col style={{ display: 'contents' }}>
                    <i
                        className={`${close_medium}`}
                        onClick={() => {
                            remove(idx);
                            if (element !== 'page') {
                                setValue(`${element}.backgroundImage`, '');
                                setValue(`${element}.backgroundSize`, '');
                                setValue(`${element}.backgroundAttachment`, '');
                                setValue(`${element}.backgroundRepeat`, '');
                                setValue(`${element}.backgroundPosition`, '');
                            } else {
                                setValue(`${element}BackgroundImage`, '');
                                setValue(`${element}BackgroundSize`, '');
                                setValue(`${element}BackgroundAttachment`, '');
                                setValue(`${element}BackgroundRepeat`, '');
                                setValue(`${element}BackgroundPosition`, '');
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row className="mb30">
                {bgValues[idx]?.imageSrc !== '' && (
                    <div className="mb30">
                        <img src={bgValues[idx]?.imageSrc} alt={'Image' + idx} height={'100px'} width={'100px'} />
                        <i
                            id='rs_data_refresh'
                            className={`${restart_medium} icon-md color-primary-blue`}
                            onClick={() => setValue(`${rowName}[${idx}].imageSrc`, '')}
                        />
                    </div>
                )}
                <RSPrimaryButton onClick={() => setAddImage(true)}>Select Image</RSPrimaryButton>
            </Row>
            {addImage && (
                <AddImageModal
                    show={addImage}
                    handleClose={() => setAddImage(false)}
                    name={`${rowName}[${idx}].imageSrc`}
                />
            )}
            <Row>
                <Col>
                    <small>Size</small>
                    <RSKendoDropdown
                        name={`${rowName}[${idx}].size`}
                        control={control}
                        data={['auto', 'contain', 'cover']}
                        handleChange={() => {
                            setBackgroundValues();
                        }}
                        defaultValue={'auto'}
                    />
                </Col>
                <Col>
                    <small>Repeat</small>
                    <RSKendoDropdown
                        name={`${rowName}[${idx}].repeat`}
                        control={control}
                        data={['repeat', 'no-repeat', 'repeat-x', 'repeat-y']}
                        handleChange={() => {
                            setBackgroundValues();
                        }}
                        defaultValue={'repeat'}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <small>Position</small>
                    <RSKendoDropdown
                        name={`${rowName}[${idx}].position`}
                        control={control}
                        data={BG_IMAGE_POSITION_DATA}
                        handleChange={() => {
                            setBackgroundValues();
                        }}
                        defaultValue={'left top'}
                    />
                </Col>
                <Col>
                    <small>Attachment</small>
                    <RSKendoDropdown
                        name={`${rowName}[${idx}].attachment`}
                        control={control}
                        data={['scroll', 'fixed', 'local']}
                        handleChange={() => {
                            setBackgroundValues();
                        }}
                        defaultValue={'scroll'}
                    />
                </Col>
            </Row>
        </Row>
    );
};

export default BackgroundImageBox;
