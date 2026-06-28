import { close_medium, colorpicker_bg_large } from 'Constants/GlobalConstant/Glyphicons';
import { useContext } from 'react';
import RSColorPicker from 'Components/ColorPicker';
import { Col, Row } from 'react-bootstrap';
import { EmailBuilderContext } from '../../Context/context';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { useFormContext } from 'react-hook-form';
import BackgroundImageStyle from '../BackgroundImageStyle';

const RowStyle = () => {
    const { setEmailSettingModal, emailSettingModal, setViewInBrowserColor } = useContext(EmailBuilderContext);
    const { control, watch } = useFormContext();
    const { rowStyle } = emailSettingModal;
    const rowBackgroundImage = watch('rowBackgroundImage');
    const contentBackgroundImage = watch('contentBackgroundImage');

    const handleClose = () => {
        setEmailSettingModal((pre) => ({
            ...pre,
            emailSettingToggle: true,
            rowStyle: {
                modal: false,
            },
        }));
    };

    return (
        <section>
            <div>
                <p>Row Style</p>
                <i className={`${close_medium} icon-md color-white`} onClick={handleClose}></i>
            </div>
            {rowStyle?.type === 'emailBrowserStyle' ? (
                <div>
                    <Row>
                        <Col>Background color</Col>
                        <Col>
                            <RSColorPicker
                                icon={colorpicker_bg_large}
                                tooltipText={'Font color'}
                                onSelect={(color) => {
                                    setViewInBrowserColor({
                                        backgroundColor: color,
                                    });
                                }}
                                isToolTip
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>Content color</Col>
                        <Col>
                            <RSColorPicker
                                icon={colorpicker_bg_large}
                                onSelect={(color) => {
                                    setViewInBrowserColor({
                                        backgroundColorContent: color,
                                    });
                                }}
                                tooltipText={'Font color'}
                                isToolTip
                                defaultIconColor = {'#000000'}
                            />
                        </Col>
                    </Row>
                </div>
            ) : (
                <div>
                    <Row>
                        <Col>Background color</Col>
                        <Col>
                            <RSColorPicker
                                icon={colorpicker_bg_large}
                                tooltipText={'Font color'}
                                onSelect={(color) => {}}
                                isToolTip
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>Content color</Col>
                        <Col>
                            <RSColorPicker
                                icon={colorpicker_bg_large}
                                onSelect={(color) => {}}
                                tooltipText={'Font color'}
                                isToolTip
                                defaultIconColor = {'#000000'}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>Row background image</Col>
                        <Col>
                            <RSSwitch control={control} name={'rowBackgroundImage'} />
                        </Col>
                    </Row>
                    {rowBackgroundImage && <BackgroundImageStyle name={'rowBackgroundImage'} />}
                    <Row>
                        <Col> Content background image</Col>
                        <Col>
                            <RSSwitch control={control} name={'contentBackgroundImage'} />
                        </Col>
                    </Row>
                    {contentBackgroundImage && <BackgroundImageStyle name={'contentBackgroundImage'} />}
                </div>
            )}
        </section>
    );
};

export default RowStyle;
