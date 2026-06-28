import { BORDER_LIST, FONT_FAMILY, FONT_WEIGHT_DATA, VALUE_EXTENSIONS } from './constants';
import { NUMBER_REGEX } from 'Constants/GlobalConstant/Regex';
import { circle_plus_edge_medium, colorpicker_bg_medium, colorpicker_text_medium, minus_mini, plus_mini } from 'Constants/GlobalConstant/Glyphicons';
import RSColorPicker from 'Components/ColorPicker';
import RSInput from 'Components/FormFields/RSInput';
import { useContext } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import ShadowBox from './Components/ShadowBox';
import BackgroundImageBox from './Components/BackgroundImageBox';
import TabContent from './Components/TabContent';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const OpenStyleManager = () => {
    const { control, setValue, resetField, watch, getValues } = useFormContext();
    const { element, setElement, tagName, setTagName } = useContext(LandingTemplateContext);
    // console.log('context :::: ', element);
    const [shadowText, boxShadowValues, bgValues] = watch([
        `${element}.shadowText`,
        `${element}.boxShadowValues`,
        `${element}.backgroundValues`,
    ]);
    const {
        fields: textShadow,
        append: textAppend,
        remove: textRemove,
    } = useFieldArray({ name: `${element}.shadowText`, control });
    const {
        fields: boxFields,
        append: boxAppend,
        remove: boxRemove,
    } = useFieldArray({ name: `${element}.boxShadowValues`, control });
    const {
        fields: bgFields,
        append: bgAppend,
        remove: bgRemove,
    } = useFieldArray({ name: `${element}.backgroundValues`, control });

    return (
        <div className="rsbstc-settings-style">
            {element !== 'default' ? (
                <>
                    <h2>{tagName}</h2>
                    {/* {tabContent()} */}
                    <TabContent />
                    {tagName !== 'Icons' && tagName !== 'Divider' && tagName !== 'Image' && tagName !== 'Video' && (
                        <>
                            {/* <div className="rsbstc-settings-block">
                                <div className="form-group mt10">
                                    <RSInput name={'pageTitle'} control={control} placeholder={'Page title'} />
                                </div>
                            </div> */}
                            <div className="rsbstc-settings-block">
                                <div className="form-group mt10">
                                    <div className="rs-builder-settings-elements-text">
                                        <div className="rsbset-fontfamily">
                                            <RSKendoDropdown
                                                name={`${element}.fontStyle`}
                                                data={FONT_FAMILY}
                                                dataItemKey={'id'}
                                                textField={'label'}
                                                control={control}
                                                label={'Font family'}
                                            />
                                        </div>
                                        <div className="rsbset-fontsize">
                                            <RSInput
                                                name={`${element}.fontSizeValue`}
                                                control={control}
                                                type={'number'}
                                                defaultValue={''}
                                                placeholder={'Size'}
                                                handleOnBlur={(e) => {
                                                    if (getValues(`${element}.fontSizeExt`) === undefined) {
                                                        setValue(`${element}.fontSize`, e.target.value + 'px');
                                                    } else
                                                        setValue(
                                                            `${element}.fontSize`,
                                                            e.target.value + getValues(`${element}.fontSizeExt`),
                                                        );
                                                }}
                                            />
                                        </div>
                                        <div className="rsbset-font-extension">
                                            <RSKendoDropdown
                                                name={`${element}.fontSizeExt`}
                                                control={control}
                                                data={VALUE_EXTENSIONS}
                                                defaultValue={'px'}
                                            />
                                        </div>
                                        <div className="rsbset-font-color">
                                            <RSColorPicker
                                                icon={`${colorpicker_text_medium} icon-md`}
                                                onSelect={(e) => {
                                                                                                        setValue(`${element}.fontColor`, e);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="rsbstc-settings-block">
                                <div className="form-group">
                                    <RSKendoDropdown
                                        name={`${element}.fontWeight`}
                                        control={control}
                                        data={FONT_WEIGHT_DATA}
                                        dataItemKey={'id'}
                                        textField={'label'}
                                        defaultValue={'Normal'}
                                        label={'Font weight'}
                                    />
                                </div>
                            </div>

                            <div className="rsbstc-settings-block">
                                <div className="settings-block-wrapper">
                                    <div className="sbw-label">Line height</div>
                                    <div className="sbw-content">
                                        <div className="rs-builder-settings-input-counter">
                                            <div className="rsbsic-icon rsbsic-icon-minus">
                                                <i
                                                    className={`${minus_mini} icon-mini color-white`}
                                                    onClick={() => {
                                                        if (
                                                            getValues(`${element}.lineHeight`) === undefined &&
                                                            getValues(`${element}.lineHeightExt`) === undefined
                                                        ) {
                                                            setValue(`${element}.lineHeight`, 25 - 1 + 'px');
                                                            setValue(`${element}.lineHeightExt`, 'px');
                                                        } else
                                                            setValue(
                                                                `${element}.lineHeight`,
                                                                Number(getValues(`${element}.lineHeight`)) - 1,
                                                            );
                                                    }}
                                                />
                                            </div>
                                            <div className="rsbsic-input">
                                                <RSInput
                                                    name={`${element}.lineHeight`}
                                                    control={control}
                                                    type={'number'}
                                                    defaultValue={'25'}
                                                />
                                            </div>
                                            <div className="rsbsic-extension">
                                                <RSKendoDropdown
                                                    control={control}
                                                    data={VALUE_EXTENSIONS}
                                                    name={`${element}.lineHeightExt`}
                                                    defaultValue={'px'}
                                                />
                                            </div>
                                            <div className="rsbsic-icon rsbsic-icon-plus">
                                                <i
                                                    id='rs_data_plus'
                                                    className={`${plus_mini} icon-mini`}
                                                    onClick={() => {
                                                        if (
                                                            getValues(`${element}.lineHeight`) === undefined &&
                                                            getValues(`${element}.lineHeightExt`) === undefined
                                                        ) {
                                                            setValue(`${element}.lineHeight`, 25 + 1);
                                                            setValue(`${element}.lineHeightExt`, 'px');
                                                        } else
                                                            setValue(
                                                                `${element}.lineHeight`,
                                                                Number(getValues(`${element}.lineHeight`)) + 1,
                                                            );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rsbstc-settings-block">
                                <div className="settings-block-wrapper">
                                    <div className="sbw-label">Letter spacing</div>
                                    <div className="sbw-content">
                                        <div className="rs-builder-settings-input-counter">
                                            <div className="rsbsic-icon rsbsic-icon-minus click-off">
                                                <i
                                                    className={`${minus_mini} icon-mini color-white`}
                                                    onClick={() => {
                                                        if (
                                                            getValues(`${element}.letterSpacing`) === undefined &&
                                                            getValues(`${element}.letterSpacingExt`) === undefined
                                                        ) {
                                                            setValue(`${element}.letterSpacing`, 25 - 1 + 'px');
                                                            setValue(`${element}.letterSpacingExt`, 'px');
                                                        } else
                                                            setValue(
                                                                `${element}.letterSpacing`,
                                                                Number(getValues(`${element}.letterSpacing`)) - 1,
                                                            );
                                                    }}
                                                />
                                            </div>
                                            <div className="rsbsic-input">
                                                <RSInput
                                                    name={`${element}.letterSpacingValue`}
                                                    control={control}
                                                    type={'number'}
                                                    handleOnBlur={(e) => {
                                                        if (getValues(`${element}.letterSpacingExt`) === undefined) {
                                                            setValue(`${element}.letterSpacing`, e.target.value + 'px');
                                                        } else
                                                            setValue(
                                                                `${element}.letterSpacing`,
                                                                e.target.value +
                                                                    getValues(`${element}.letterSpacingExt`),
                                                            );
                                                    }}
                                                    defaultValue={'0'}
                                                />
                                            </div>
                                            <div className="rsbsic-extension">
                                                <RSKendoDropdown
                                                    control={control}
                                                    data={VALUE_EXTENSIONS}
                                                    name={`${element}.letterSpacingExt`}
                                                    defaultValue={'px'}
                                                    placeholder={'Number'}
                                                />
                                            </div>
                                            <div className="rsbsic-icon rsbsic-icon-plus click-off">
                                                <i
                                                    id='rs_data_plus'
                                                    className={`${plus_mini} icon-mini`}
                                                    onClick={() => {
                                                        if (
                                                            getValues(`${element}.letterSpacing`) === undefined &&
                                                            getValues(`${element}.letterSpacingExt`) === undefined
                                                        ) {
                                                            setValue(`${element}.letterSpacing`, 25 + 1);
                                                            setValue(`${element}.letterSpacingExt`, 'px');
                                                        } else
                                                            setValue(
                                                                `${element}.letterSpacing`,
                                                                Number(getValues(`${element}.letterSpacing`)) + 1,
                                                            );
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <Row className="mb30">
                                <Col sm={3}>
                                    <span>Letter spacing</span>
                                </Col>
                                <Col sm={5}>
                                    <RSInput
                                        name={`${element}.letterSpacingValue`}
                                        control={control}
                                        type={'number'}
                                        handleOnBlur={(e) => {
                                            if (getValues(`${element}.letterSpacingExt`) === undefined) {
                                                setValue(`${element}.letterSpacing`, e.target.value + 'px');
                                            } else
                                                setValue(
                                                    `${element}.letterSpacing`,
                                                    e.target.value + getValues(`${element}.letterSpacingExt`),
                                                );
                                        }}
                                    />
                                </Col>
                                <Col sm={3}>
                                    <RSKendoDropdown
                                        name={`${element}.letterSpacingExt`}
                                        control={control}
                                        defaultValue={'px'}
                                        data={VALUE_EXTENSIONS}
                                    />
                                </Col>
                            </Row> */}
                            <Row className="mb30">
                                <Col sm={3}>
                                    <span>Text align</span>
                                </Col>
                                <Col sm={9}>
                                    <Row>
                                        <Col sm={3} onClick={() => setValue(`${element}.textAlign`, 'left')}>
                                            Left
                                        </Col>
                                        <Col sm={3} onClick={() => setValue(`${element}.textAlign`, 'center')}>
                                            Center
                                        </Col>
                                        <Col sm={3} onClick={() => setValue(`${element}.textAlign`, 'right')}>
                                            Right
                                        </Col>
                                        <Col sm={3} onClick={() => setValue(`${element}.textAlign`, 'justify')}>
                                            Justify
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="mb30">
                                <Col sm={3}>
                                    <span>Text shadow</span>
                                </Col>
                                <Col sm={9} className="d-flex justify-content-flex-end">
                                    <i
                                        id='rs_data_circle_plus_edge'
                                        className={`${circle_plus_edge_medium} icon-md color-primary-blue ${
                                            shadowText?.length < 2 ? '' : 'click-off'
                                        }`}
                                        onClick={() => {
                                            textAppend({
                                                shadowRight: '',
                                                shadowBottom: '',
                                                shadowSpread: '',
                                                shadowColor: '',
                                            });
                                        }}
                                    />
                                </Col>
                                {textShadow.map((field, idx) => {
                                    return (
                                        <ShadowBox
                                            key={idx + 'shdwTxt'}
                                            rowName={`${element}.shadowText`}
                                            remove={textRemove}
                                            idx={idx}
                                            element={`${element}.textShadow`}
                                            shadowText={shadowText}
                                        />
                                    );
                                })}
                            </Row>
                        </>
                    )}
                    <Row className="mb30">
                        <Col sm={3}>
                            <span>Margin</span>
                        </Col>
                        <Col sm={9}>
                            <Row>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.marginTop`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={'0'}
                                    />
                                    <small>Top</small>
                                </Col>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.marginRight`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={'0'}
                                    />
                                    <small>Right</small>
                                </Col>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.marginBottom`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={'0'}
                                    />
                                    <small>Bottom</small>
                                </Col>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.marginLeft`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={'0'}
                                    />
                                    <small>Left</small>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mb30">
                        <Col sm={3}>
                            <span>Padding</span>
                        </Col>
                        <Col sm={9}>
                            <Row>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.paddingTop`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={tagName === 'Buttons' ? '8' : '0'}
                                    />
                                    <small>Top</small>
                                </Col>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.paddingRight`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={tagName === 'Buttons' ? '16' : '0'}
                                    />
                                    <small>Right</small>
                                </Col>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.paddingBottom`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={tagName === 'Buttons' ? '8' : '0'}
                                    />
                                    <small>Bottom</small>
                                </Col>
                                <Col sm={3}>
                                    <RSInput
                                        name={`${element}.paddingLeft`}
                                        control={control}
                                        type={'number'}
                                        defaultValue={tagName === 'Buttons' ? '16' : '0'}
                                    />
                                    <small>Left</small>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mb30">
                        <Col sm={3}>
                            <span>Width</span>
                        </Col>
                        <Col sm={5}>
                            <RSInput
                                name={`${element}.widthValue`}
                                control={control}
                                handleOnBlur={(e) => {
                                    let temp = e.target.value;
                                    if (NUMBER_REGEX.test(temp)) {
                                        setValue(
                                            `${element}.width`,
                                            temp +
                                                (getValues(`${element}.widthExt`) === undefined
                                                    ? 'px'
                                                    : getValues(`${element}.widthExt`)),
                                        );
                                        setValue(`${element}.widthValue`, temp);
                                    } else {
                                        setValue(`${element}.width`, 'auto');
                                        setValue(`${element}.widthValue`, 'auto');
                                    }
                                }}
                            />
                        </Col>
                        <Col sm={2}>
                            <RSKendoDropdown
                                name={`${element}.widthExt`}
                                control={control}
                                data={['px', '%', 'vw']}
                                defaultValue={'px'}
                                handleChange={(e) => {
                                    if (
                                        getValues(`${element}.widthValue`) === undefined ||
                                        getValues(`${element}.widthValue`) === 'auto'
                                    )
                                        setValue(`${element}.width`, 'auto');
                                    else setValue(`${element}.width`, getValues(`${element}.widthValue`) + 'px');
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb30">
                        <Col sm={3}>
                            <span>Height</span>
                        </Col>
                        <Col sm={5}>
                            <RSInput
                                name={`${element}.heightValue`}
                                control={control}
                                handleOnBlur={(e) => {
                                    let temp = e.target.value;
                                    if (NUMBER_REGEX.test(temp)) {
                                        setValue(
                                            `${element}.height`,
                                            temp +
                                                (getValues(`${element}.heightExt`) === undefined
                                                    ? 'px'
                                                    : getValues(`${element}.heightExt`)),
                                        );
                                        setValue(`${element}.heightValue`, temp);
                                    } else {
                                        setValue(`${element}.height`, 'auto');
                                        setValue(`${element}.heightValue`, 'auto');
                                    }
                                }}
                            />
                        </Col>
                        <Col sm={2}>
                            <RSKendoDropdown
                                name={`${element}.heightExt`}
                                control={control}
                                data={['px', '%', 'vw']}
                                defaultValue={'px'}
                                handleChange={(e) => {
                                    if (
                                        getValues(`${element}.heightValue`) === undefined ||
                                        getValues(`${element}.heightValue`) === 'auto'
                                    )
                                        setValue(`${element}.height`, 'auto');
                                    else setValue(`${element}.height`, getValues(`${element}.heightValue`) + 'px');
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb30">
                        <Col sm={3}>
                            <span>Max width</span>
                        </Col>
                        <Col sm={5}>
                            <RSInput
                                name={`${element}.maxWidthValue`}
                                control={control}
                                handleOnBlur={(e) => {
                                    let temp = e.target.value;
                                    if (NUMBER_REGEX.test(temp)) {
                                        setValue(
                                            `${element}.maxWidth`,
                                            temp +
                                                (getValues(`${element}.maxWidthExt`) === undefined
                                                    ? 'px'
                                                    : getValues(`${element}.maxWidthExt`)),
                                        );
                                        setValue(`${element}.maxWidthValue`, temp);
                                    } else {
                                        setValue(`${element}.maxWidth`, 'auto');
                                        setValue(`${element}.maxWidthValue`, 'auto');
                                    }
                                }}
                            />
                        </Col>
                        <Col sm={2}>
                            <RSKendoDropdown
                                name={`${element}.maxWidthExt`}
                                control={control}
                                data={['px', '%', 'vw']}
                                defaultValue={'px'}
                                handleChange={(e) => {
                                    if (
                                        getValues(`${element}.maxWidthValue`) === undefined ||
                                        getValues(`${element}.maxWidthValue`) === 'auto'
                                    )
                                        setValue(`${element}.maxWidth`, 'auto');
                                    else setValue(`${element}.maxWidth`, getValues(`${element}.maxWidthValue`) + 'px');
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb30">
                        <Col sm={3}>
                            <span>Min height</span>
                        </Col>
                        <Col sm={5}>
                            <RSInput
                                name={`${element}.minHeightValue`}
                                control={control}
                                handleOnBlur={(e) => {
                                    let temp = e.target.value;
                                    if (NUMBER_REGEX.test(temp)) {
                                        setValue(
                                            `${element}.minHeight`,
                                            temp +
                                                (getValues(`${element}.minHeightExt`) === undefined
                                                    ? 'px'
                                                    : getValues(`${element}.minHeightExt`)),
                                        );
                                        setValue(`${element}.minHeightValue`, temp);
                                    } else {
                                        setValue(`${element}.minHeight`, 'auto');
                                        setValue(`${element}.minHeightValue`, 'auto');
                                    }
                                }}
                            />
                        </Col>
                        <Col sm={2}>
                            <RSKendoDropdown
                                name={`${element}.minHeightExt`}
                                control={control}
                                data={['px', '%', 'vw']}
                                defaultValue={'px'}
                                handleChange={(e) => {
                                    if (
                                        getValues(`${element}.minHeightValue`) === undefined ||
                                        getValues(`${element}.minHeightValue`) === 'auto'
                                    )
                                        setValue(`${element}.minHeight`, 'auto');
                                    else
                                        setValue(`${element}.minHeight`, getValues(`${element}.minHeightValue`) + 'px');
                                }}
                            />
                        </Col>
                    </Row>
                    <Row className="mb30">
                        <Col sm={3}>
                            <span>Background color</span>
                        </Col>
                        <Col sm={9} className="d-flex justify-content-flex-end">
                            <RSColorPicker
                                icon={`${colorpicker_bg_medium}`}
                                onSelect={(e) => setValue(`${element}.backgroundColor`, e)}
                            />
                        </Col>
                    </Row>
                    {tagName !== 'Divider' && (
                        <>
                            <Row className="mb30">
                                <Col sm={3}>
                                    <span>Background image</span>
                                </Col>
                                <Col sm={9} className="d-flex justify-content-flex-end">
                                    <i
                                        id='rs_data_circle_plus_edge'
                                        className={`${circle_plus_edge_medium} icon-md color-primary-blue  ${
                                            bgValues?.length < 2 ? '' : 'click-off'
                                        }`}
                                        onClick={() => {
                                            bgAppend({
                                                imageSrc: '',
                                                size: '',
                                                repeat: '',
                                                position: '',
                                                attachment: '',
                                            });
                                        }}
                                    />
                                </Col>

                                {bgFields.map((field, idx) => {
                                    return (
                                        <BackgroundImageBox
                                            key={idx + 'bgImg'}
                                            rowName={`${element}.backgroundValues`}
                                            remove={bgRemove}
                                            idx={idx}
                                            bgValues={bgValues}
                                            element={element}
                                        />
                                    );
                                })}
                            </Row>

                            <Row className="mb30">
                                <Col sm={3}>
                                    <span>Box shadow</span>
                                </Col>
                                <Col sm={9} className="d-flex justify-content-flex-end">
                                    <i
                                        id='rs_data_circle_plus_edge'
                                        className={`${circle_plus_edge_medium} icon-md color-primary-blue ${
                                            boxShadowValues?.length < 2 ? '' : 'click-off'
                                        }`}
                                        onClick={() => {
                                            boxAppend({
                                                shadowRight: '',
                                                shadowBottom: '',
                                                shadowSpread: '',
                                                shadowColor: '',
                                            });
                                        }}
                                    />
                                </Col>
                                {boxFields.map((fieldData, index) => {
                                    return (
                                        <ShadowBox
                                            key={idx + 'shdwBx'}
                                            element={`${element}.boxShadow`}
                                            rowName={`${element}.boxShadowValues`}
                                            remove={boxRemove}
                                            idx={index}
                                            shadowText={boxShadowValues}
                                        />
                                    );
                                })}
                            </Row>
                            <Row className="mb30">
                                <Col sm={3}>
                                    <span>Border</span>
                                </Col>
                                <Col sm={9}>
                                    <Row>
                                        <Col sm={3}>
                                            <RSInput
                                                control={control}
                                                name={`${element}.borderSize`}
                                                type={'number'}
                                                handleOnBlur={(e) => {
                                                    if (getValues(`${element}.borderStyle`) === undefined) {
                                                        if (getValues(`${element}.borderColor`) === undefined) {
                                                            setValue(
                                                                `${element}.border`,
                                                                (tagName === 'Buttons' ? '1px' : e.target.value) +
                                                                    'px ' +
                                                                    'none' +
                                                                    ' ' +
                                                                    'black',
                                                            );
                                                        } else {
                                                            setValue(
                                                                `${element}.border`,
                                                                e.target.value +
                                                                    'px ' +
                                                                    'none' +
                                                                    ' ' +
                                                                    getValues(`${element}.borderColor`),
                                                            );
                                                        }
                                                    } else {
                                                        if (getValues(`${element}.borderColor`) === undefined) {
                                                            setValue(
                                                                `${element}.border`,
                                                                e.target.value +
                                                                    'px ' +
                                                                    getValues(`${element}.borderStyle`) +
                                                                    ' ' +
                                                                    'black',
                                                            );
                                                        } else {
                                                            setValue(
                                                                `${element}.border`,
                                                                e.target.value +
                                                                    'px ' +
                                                                    getValues(`${element}.borderStyle`) +
                                                                    ' ' +
                                                                    getValues(`${element}.borderColor`),
                                                            );
                                                        }
                                                    }
                                                }}
                                                defaultValue={tagName === 'Buttons' ? '1' : '0'}
                                            />
                                        </Col>
                                        <Col sm={5}>
                                            <RSKendoDropdown
                                                control={control}
                                                data={BORDER_LIST}
                                                name={`${element}.borderStyle`}
                                                defaultValue={tagName === 'Buttons' ? 'solid' : 'none'}
                                                handleChange={(e) => {
                                                    if (getValues(`${element}.borderSize`) === undefined) {
                                                        if (getValues(`${element}.borderColor`) === undefined) {
                                                            setValue(
                                                                `${element}.border`,
                                                                (tagName === 'Buttons'
                                                                    ? '1px'
                                                                    : getValues(`${element}.borderSize`)) +
                                                                    'px ' +
                                                                    e.value +
                                                                    ' ' +
                                                                    'black',
                                                            );
                                                        } else {
                                                            setValue(
                                                                `${element}.border`,
                                                                getValues(`${element}.borderSize`) +
                                                                    e.value +
                                                                    ' ' +
                                                                    getValues(`${element}.borderColor`),
                                                            );
                                                        }
                                                    } else {
                                                        if (getValues(`${element}.borderColor`) === undefined) {
                                                            setValue(
                                                                `${element}.border`,
                                                                getValues(`${element}.borderSize`) +
                                                                    e.value +
                                                                    ' ' +
                                                                    'black',
                                                            );
                                                        } else {
                                                            setValue(
                                                                `${element}.border`,
                                                                getValues(`${element}.borderSize`) +
                                                                    e.value +
                                                                    ' ' +
                                                                    getValues(`${element}.borderColor`),
                                                            );
                                                        }
                                                    }
                                                }}
                                            />
                                        </Col>
                                        <Col sm={4}>
                                            <RSColorPicker
                                                icon={`${colorpicker_bg_medium}  icon-md`}
                                                onSelect={(e) => setValue(`${element}.borderColor`, e)}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="mb30">
                                <Col sm={3}>
                                    <span>Border radius</span>
                                </Col>
                                <Col sm={9}>
                                    <Row>
                                        <Col sm={3}>
                                            <RSInput
                                                name={`${element}.borderRadiusTop`}
                                                control={control}
                                                defaultValue={tagName === 'Buttons' ? '4.8' : '0'}
                                            />
                                            <small>Top</small>
                                        </Col>
                                        <Col sm={3}>
                                            <RSInput
                                                name={`${element}.borderRadiusRight`}
                                                control={control}
                                                defaultValue={tagName === 'Buttons' ? '4.8' : '0'}
                                            />
                                            <small>Right</small>
                                        </Col>
                                        <Col sm={3}>
                                            <RSInput
                                                name={`${element}.borderRadiusBottom`}
                                                control={control}
                                                defaultValue={tagName === 'Buttons' ? '4.8' : '0'}
                                            />
                                            <small>Bottom</small>
                                        </Col>
                                        <Col sm={3}>
                                            <RSInput
                                                name={`${element}.borderRadiusLeft`}
                                                control={control}
                                                defaultValue={tagName === 'Buttons' ? '4.8' : '0'}
                                            />
                                            <small>Left</small>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </>
                    )}
                </>
            ) : (
                <p>Select an element before using style manager</p>
            )}
        </div>
    );
};

export default OpenStyleManager;
