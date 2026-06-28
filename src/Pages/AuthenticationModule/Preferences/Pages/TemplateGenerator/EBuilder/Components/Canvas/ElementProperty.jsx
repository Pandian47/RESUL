import { colorpicker_bg_large, question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useContext } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import { useFormContext } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSColorPicker from 'Components/ColorPicker';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSPPophover from 'Components/RSPPophover';
import { EmailBuilderContext } from '../../Context/context';

const ElementProperty = () => {
    const { control, watch, setValue } = useFormContext();

    const { email_width, embed_attachment } = watch();

    const { setBuilderBodyColor } = useContext(EmailBuilderContext);

    const emailWidth = Number(email_width);

    return (
        <div className="bg-secondary">
            <header>Email Settings </header>
            <Row>
                <Col>
                    <p>Email Width</p>
                </Col>
                <Col>
                    <InputGroup className="mb5">
                        <Button
                            variant={emailWidth <= 1 ? 'secondary' : 'outline-secondary'}
                            onClick={(e) =>
                                emailWidth > 1 ? setValue('email_width', emailWidth - 1) : e.preventDefault()
                            }
                            disabled={emailWidth <= 1}
                        >
                            -
                        </Button>
                        <RSInput
                            control={control}
                            name="email_width"
                            type="number"
                            defaultValue={'600'}
                            aria-describedby="email_width"
                        />
                        {/* <Form.Control
                                aria-label="Example text with button addon"
                                aria-describedby="basic-addon1"
                            /> */}
                        <Button
                            variant={emailWidth >= 600 ? 'secondary' : 'outline-secondary'}
                            onClick={(e) =>
                                emailWidth < 600 ? setValue('email_width', emailWidth + 1) : e.preventDefault()
                            }
                            disabled={emailWidth >= 600}
                        >
                            +
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col>View in browser</Col>
                <Col>
                    <RSSwitch control={control} name={'ruleCondition'} />
                </Col>
            </Row>

            <Row>
                <Col sm={12}>
                    <span>Inbox first line preview</span>
                    <RSPPophover position="top" text={'Previewing the first line of the message content in your inbox'}>
                        <i className={`${question_mark_mini} icon-md color-primary-blue`}></i>
                    </RSPPophover>
                </Col>
                <Col>
                    <InputGroup size="sm" className="mb-3">
                        <InputGroup.Text>Message</InputGroup.Text>
                        <RSInput control={control} placeholder={'Enter Message'} name={'message'} />
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col>Background color</Col>
                <Col>
                    <RSColorPicker
                        icon={colorpicker_bg_large}
                        tooltipText={'Font color'}
                        onSelect={(color) => {
                            setBuilderBodyColor({
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
                            setBuilderBodyColor({
                                backgroundColorContent: color,
                            });
                        }}
                        tooltipText={'Font color'}
                        isToolTip
                        defaultIconColor = {'#000000'}
                    />
                </Col>
            </Row>
            <Row>
                <Col sm={6}>Embed attachment</Col>
                <Col sm={6}>
                    <RSSwitch control={control} name={'embed_attachment'} />
                </Col>
                {embed_attachment && (
                    <Col sm={12}>
                        <RSFileUpload
                            control={control}
                            name="embededAttachment"
                            setError={() => {}}
                            clearErrors={() => {}}
                            required
                            watch={watch}
                        />
                    </Col>
                )}
            </Row>

            <Row>
                <Col>Themes</Col>
                <Col>
                    <RSSwitch control={control} name={'theme'} />
                </Col>
            </Row>
            <Row>
                <Col>Google promo annotations</Col>
                <Col>
                    <RSSwitch control={control} name={'googleAnnotation'} />
                </Col>
            </Row>
            <Row>
                <Col style={{ color: '#856404' }}>
                    <p>
                        This option works in Gmail on mobile devices only and is meant for email messages that get to
                        the "Promotions" folder.
                        <a target="_blank" href="https://developers.google.com/gmail/promotab/troubleshooting">
                            Learn more
                        </a>
                    </p>
                </Col>
            </Row>
        </div>
    );
};

export default ElementProperty;
