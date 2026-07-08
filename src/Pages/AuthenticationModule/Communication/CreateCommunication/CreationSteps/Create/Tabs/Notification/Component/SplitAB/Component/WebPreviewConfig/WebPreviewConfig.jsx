import { EXPIRE_CONFIG, EXPIRE_CONFIG_FOR_MOBILE } from '../../../../constant';
import { ENTER_EXPIRY_TIME, ENTER_TITLE_TEXT, EXCEED_EXPIRY_TIME, SELECT_EXPIRY_TIME, SELECT_EXPIRY_VALUE, SELECT_IMPRESSIONS, SELECT_PRIORITY } from 'Constants/GlobalConstant/ValidationMessage';
import { BACKGROUND_COLOR, BACKGROUND_OVERLAY, ENTER_VALUE, EXPIRES_IN, EXPIRY, HASHTAG, HASHTAG_15_CHARACTERS, HASHTAG_COMMS_SEPARATOR, IMPRESSIONS, INTERACTIVITY, MAKE_ALERT, PRIORITY, Short_DESCRIPTION, TITLE_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { colorpicker_bg_medium } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSSwitch from 'Components/FormFields/RSSwitch';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import RSColorPicker from 'Components/ColorPicker';
import RSTagsComponent from 'Components/RSTagsComponent';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import Interactivity from '../Interactivity/Interactivity';
import useQueryParams from 'Hooks/useQueryParams';
import { onlyNumbers } from 'Utils/modules/inputValidators';
import { numberOfDaysValidtorMobilePush } from 'Utils/HookFormValidate';
import { useSelector } from 'react-redux';
import Import from '../../../../../MobileNotification/Component/SplitAB/Import/Import';
import { handlePersonalization } from '../../../../../../../Create/constant';

const IMPRESSIONS_DROPDOWN_DATA = [
    { id: 1, value: '1' },
    { id: 2, value: '2' },
    { id: 3, value: '3' },
    { id: 4, value: '4' },
    { id: 5, value: '5' },
    { id: 6, value: '6' },
    { id: 7, value: '7' },
    { id: 8, value: '8' },
    { id: 9, value: '9' },
    { id: 10, value: '10' },
];

const PRIORITY_DROPDOWN_DATA = [
    { id: 1, value: '1' },
    { id: 2, value: '2' },
    { id: 3, value: '3' },
    { id: 4, value: '4' },
    { id: 5, value: '5' },
    { id: 6, value: '6' },
    { id: 7, value: '7' },
];

const getAudienceForPersonalization = (location, watch, getValues) =>
    location?.audience?.length
        ? location?.audience
        : watch('audience')?.length
        ? watch('audience')
        : getValues()?.audience;

const WebPreviewConfig = ({ fieldName = '', isSplit = false, variant = 'splitAB', index = 0 }) => {
    const isImport = variant === 'import';
    const location = useQueryParams('/communication') || {};
    const {
        control,
        formState: { errors },
        watch,
        setValue,
        getValues,
        resetField,
        clearErrors,
    } = useFormContext();

    const { personalization, listTypeWisePersonlization } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );

    const [layoutPosition] = watch(['layoutPosition']);

    const titleName = isSplit ? `${fieldName}.title.text` : 'title.text';
    const colorPickerName = isSplit ? `${fieldName}.title.fontColor` : 'title.fontColor';
    const shortDescName = isSplit ? `${fieldName}.shortDesc.text` : 'shortDesc.text';
    const shortDescColorPickerName = isSplit ? `${fieldName}.shortDesc.fontColor` : 'shortDesc.fontColor';
    const makeAlertName = isSplit ? `${fieldName}.makeAlert` : 'makeAlert';
    const thumbnailName = isSplit ? `${fieldName}.thumbnailUrl` : 'thumbnailUrl';

    const interactivityName = isSplit ? `${fieldName}.interactivity` : 'interactivity';
    const bgOverlayName = isSplit ? `${fieldName}.bgOverlay` : 'bgOverlay';
    const bgOverlayColorName = isSplit ? `${fieldName}.bgOverlayColor` : 'bgOverlayColor';
    const currentTabName = isSplit ? `${fieldName}.currentTabIndex` : 'currentTabIndex';
    const buttonTextName = isSplit ? `${fieldName}.buttonText` : 'buttonText';
    const expiryName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiry` : 'expiry';
    const expiryTimeName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryTime` : 'expiryTime';
    const expiryValueName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryValue` : 'expiryValue';
    const hashTagName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.hashtag` : 'hashtag';
    const contentInputName = isSplit ? `${fieldName}.contentInput` : 'contentInput';
    const impressionsName = isSplit ? `${fieldName}.impressions` : 'impressions';
    const priorityName = isSplit ? `${fieldName}.priority` : 'priority';

    const hastTagErrorMessage = _get(errors, `${hashTagName}.message`, null);

    const [
        deliveryType,
        interactivity,
        bgOverLay,
        bgOverlayColor,
        expiry,
        currentPage = null,
        hashTag,
        contentInput,
        expiryTimeType,
        makeAlert,
        titleColor,
        shortDescColor,
    ] = watch([
        'deliveryType',
        interactivityName,
        bgOverlayName,
        bgOverlayColorName,
        expiryName,
        currentTabName,
        hashTagName,
        contentInputName,
        expiryTimeName,
        makeAlertName,
        colorPickerName,
        shortDescColorPickerName,
    ]);

    const showInPageBlock =
        deliveryType?.id === 5 && (isImport ? contentInput === 'import' : contentInput !== 'import');

    const showMiddleBlock = isImport
        ? currentPage !== null && !showInPageBlock
        : currentPage !== null &&
          contentInput !== 'import' &&
          contentInput !== 'template' &&
          !showInPageBlock;

    const showCarouselBlock = isImport
        ? layoutPosition?.id === 4
        : layoutPosition?.id === 4 && contentInput === 'create';

    const resetInteractivityButtons = () => {
        resetField(buttonTextName);
        setValue(buttonTextName, [
            {
                type: 'Button',
                text: '',
                customText: '',
                link: '',
                fontColor: '',
                backgroundColor: '',
                isNewLink: false,
                show: false,
            },
        ]);
    };

    const labelCol = isImport ? { sm: 3 } : { sm: { offset: 1, span: 2 } };
    const valueCol = isImport ? { sm: 9 } : { sm: 6 };

    const showImportMakeAlertSection = isImport && !(deliveryType?.id === 5 && contentInput === 'import');

    const audienceForPersonalization = getAudienceForPersonalization(location, watch, getValues);

    const expireData =
        layoutPosition?.value === 'Carousel' ? EXPIRE_CONFIG_FOR_MOBILE : EXPIRE_CONFIG;


    const renderInteractivityBlock = ({ labelCol: lc, valueCol: vc, onInteractivityOff }) => (
        <div className="form-group">
            <Row>
                <Col {...lc}>
                    <label className="control-label-left">{INTERACTIVITY}</label>
                </Col>
                <Col {...vc}>
                    <Row>
                        <Col sm={isImport ? 12 : 2}>
                            <RSSwitch control={control} name={interactivityName} handleChange={onInteractivityOff} />
                        </Col>
                        {interactivity && (
                            <Col sm={isImport ? 12 : 10} className={isImport ? 'mt41' : ''}>
                                <Interactivity
                                    fieldName={fieldName}
                                    isSplit={isSplit}
                                    interColumnSplit
                                    pushType={deliveryType?.value}
                                    isFromImport={isImport}
                                />
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>
        </div>
    );

    const renderImpressionsPriorityBlock = ({ labelCol: lc, valueCol: vc }) => (
        <div className="form-group">
            <Row>
                <Col {...lc}>
                    <label className="control-label-left">{IMPRESSIONS}</label>
                </Col>
                <Col {...vc}>
                    <Row>
                        <Col sm={6}>
                            <RSKendoDropdown
                                control={control}
                                name={impressionsName}
                                label={IMPRESSIONS}
                                data={IMPRESSIONS_DROPDOWN_DATA}
                                textField="value"
                                dataItemKey="id"
                                required
                                rules={{
                                    required: SELECT_IMPRESSIONS || 'Select impressions',
                                }}
                            />
                        </Col>
                        <Col sm={6}>
                            <RSKendoDropdown
                                control={control}
                                name={priorityName}
                                label={PRIORITY}
                                data={PRIORITY_DROPDOWN_DATA}
                                textField="value"
                                dataItemKey="id"
                                required
                                rules={{
                                    required: SELECT_PRIORITY || 'Select priority',
                                }}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );

    const renderBackgroundOverlayBlock = ({ labelCol: lc, valueCol: vc }) => (
        <div className="form-group ">
            <Row>
                <Col {...lc}>
                    <label className="control-label-left">{BACKGROUND_OVERLAY}</label>
                </Col>
                <Col {...vc}>
                    <Row>
                        <Col sm={isImport ? 3 : 2} className={isImport ? '' : 'pr0'}>
                            <RSSwitch
                                control={control}
                                name={bgOverlayName}
                                handleChange={(e) => {
                                    if (!e) {
                                        resetField(bgOverlayColorName);
                                        setValue(bgOverlayColorName, '');
                                    }
                                }}
                            />
                        </Col>
                        {bgOverLay && (
                            <Col sm={2}>
                                <RSColorPicker
                                    icon={colorpicker_bg_medium}
                                    tooltipText={BACKGROUND_COLOR}
                                    isOpacity
                                    isToolTip
                                    onSelect={(e) => {
                                        const bgColor = { opacity: e.opacity, color: e.color };
                                        if (isSplit) setValue(`${fieldName}.bgOverlayColor`, bgColor);
                                        else setValue('bgOverlayColor', bgColor);
                                    }}
                                    initColor={bgOverlayColor}
                                    colorValue={bgOverlayColor?.color ?? bgOverlayColor}
                                    wrapperClass="d-inline-block bg-overlay-colorpicker"
                                />
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>
        </div>
    );

    const renderTitleShortDescBlock = ({ labelCol: lc, valueCol: vc }) => (
        <>
            <div className="form-group mt41">
                <Row>
                    <Col {...lc}>
                        <label className="control-label-left">{TITLE_TEXT}</label>
                    </Col>
                    <Col {...vc}>
                        <RSEmojiPickerInput
                            inputName={titleName}
                            isColorPicker={false}
                            initColor={titleColor}
                            placeholder={TITLE_TEXT}
                            colorPickerName={colorPickerName}
                            required
                            rules={{
                                required: ENTER_TITLE_TEXT,
                            }}
                            personalizeData={handlePersonalization(
                                personalization,
                                audienceForPersonalization,
                                listTypeWisePersonlization,
                            )}
                            personalizationSettings={{
                                dataItemKey: 'dataAttributeId',
                                textField: 'attributeName',
                            }}
                            maxLength={100}
                        />
                    </Col>
                    {contentInput === 'import' && (
                        <Import fieldName={thumbnailName} type="image" CustomType={'thumbnail'} isRequired={false} />
                    )}
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col {...lc}>
                        <label className="control-label-left">{Short_DESCRIPTION}</label>
                    </Col>
                    <Col {...vc}>
                        <RSEmojiPickerInput
                            inputName={shortDescName}
                            isColorPicker={false}
                            initColor={shortDescColor}
                            placeholder={Short_DESCRIPTION}
                            colorPickerName={shortDescColorPickerName}
                            personalizeData={handlePersonalization(
                                personalization,
                                audienceForPersonalization,
                                listTypeWisePersonlization,
                            )}
                            personalizationSettings={{
                                dataItemKey: 'dataAttributeId',
                                textField: 'attributeName',
                            }}
                            maxLength={100}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );

    const renderExpiryTimeDropdown = () => (
        <RSKendoDropdown
            control={control}
            name={expiryTimeName}
            label={EXPIRES_IN}
            data={expireData}
            textField="text"
            dataItemKey="id"
            rules={{
                required: SELECT_EXPIRY_TIME,
            }}
            required
            handleChange={() => {
                resetField(expiryValueName);
                setValue(expiryValueName, '');
            }}
        />
    );

    const renderExpiryValueInput = ({ requiredError, inputId }) => (
        <RSInput
            control={control}
            name={expiryValueName}
            id={inputId}
            placeholder={ENTER_VALUE}
            onKeyDown={onlyNumbers}
            maxLength={3}
            required
            rules={{
                required: requiredError,
                validate: (value) =>
                    numberOfDaysValidtorMobilePush(
                        value,
                        EXCEED_EXPIRY_TIME,
                        expiryTimeType,
                        _get(location, 'startDate', ''),
                        _get(location, 'endDate', ''),
                    ),
            }}
        />
    );

    const renderHashtagBlock = ({ labelCol: lc, valueCol: vc, wrapInContainer, tagsKeySuffix }) => {
        const tagsInput = (
            <RSTagsComponent
                isNoOfCharacters={false}
                key={tagsKeySuffix ? `${fieldName}-${tagsKeySuffix}` : fieldName}
                isRefresh={false}
                tags={hashTag}
                placeholder={HASHTAG}
                id={tagsKeySuffix ? undefined : 'rs_SplitAB_Hashtag'}
                isHash
                size={5}
                errorMessage={hastTagErrorMessage}
                updatedTags={(tags) => {
                    setValue(hashTagName, tags);
                    if (hastTagErrorMessage !== null) {
                        clearErrors(hashTagName);
                    }
                }}
                isHashTag
            />
        );
        const hints = (
            <>
           
                <small>{HASHTAG_15_CHARACTERS}</small>
                <small>{HASHTAG_COMMS_SEPARATOR}</small>
               
            </>
        );
        return (
            <div className="form-group">
                <Row>
                    <Col {...lc}>
                        <label className="control-label-left">#{HASHTAG}</label>
                    </Col>
                    <Col {...vc}>
                        {wrapInContainer ? <div className="rs-tags-container">{tagsInput}</div> : tagsInput}
                        {hints}
                    </Col>
                </Row>
            </div>
        );
    };

    const renderCarouselImportExpiryRow = () => (
        <Row className="mt41 position-relative ">
            <Col sm={6}>{renderExpiryTimeDropdown()}</Col>
            <Col sm={6}>{renderExpiryValueInput({ requiredError: SELECT_EXPIRY_VALUE })}</Col>
        </Row>
    );

    const renderCarouselSplitExpiryRow = () => (
        <>
            <Col sm={5}>{renderExpiryTimeDropdown()}</Col>
            <Col sm={5}>{renderExpiryValueInput({ requiredError: SELECT_EXPIRY_VALUE })}</Col>
        </>
    );

    return (
        <>
            {showInPageBlock && (
                <>
                    {renderInteractivityBlock({
                        labelCol,
                        valueCol,
                        onInteractivityOff: (e) => {
                            if (!e) {
                                resetInteractivityButtons();
                                if (deliveryType?.id === 5) {
                                    setValue(`${fieldName}.rating`, '');
                                    setValue(`${fieldName}.frequency`, '');
                                }
                            }
                        },
                    })}
                    {renderImpressionsPriorityBlock({ labelCol, valueCol })}
                </>
            )}

            {showImportMakeAlertSection && (
                <>
                    {contentInput === 'import' &&
                        ((isSplit && layoutPosition?.value === 'Carousel' && index === 0) ||
                            (isSplit && layoutPosition?.value !== 'Carousel') ||
                            !isSplit) && (
                            <div className="form-group">
                                <Row>
                                    <Col {...labelCol}>
                                        <label className="control-label-left">{MAKE_ALERT}</label>
                                    </Col>
                                    <Col {...valueCol}>
                                        <RSSwitch
                                            control={control}
                                            name={makeAlertName}
                                            handleChange={() => {
                                                setValue(thumbnailName, {
                                                    selectImport: false,
                                                });
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    {makeAlert && renderTitleShortDescBlock({ labelCol, valueCol })}
                </>
            )}

            {showMiddleBlock && (
                <>
                    {deliveryType?.id !== 1 && renderBackgroundOverlayBlock({ labelCol, valueCol })}
                    {renderInteractivityBlock({
                        labelCol,
                        valueCol,
                        onInteractivityOff: (e) => {
                            if (!e) resetInteractivityButtons();
                        },
                    })}
                    {layoutPosition?.id !== 4 && (
                        <>
                            <div className="form-group">
                                <Row>
                                    <Col {...labelCol}>
                                        <label className="control-label-left">{EXPIRY}</label>
                                    </Col>
                                    <Col {...valueCol}>
                                        <Row>
                                            <Col
                                                sm={isImport ? 12 : 2}
                                                className={isImport && expiry ? 'form-group' : undefined}
                                            >
                                                <RSSwitch
                                                    control={control}
                                                    id="rs_SplitAB_expiryname"
                                                    name={expiryName}
                                                    handleChange={(e) => {
                                                        if (!e) {
                                                            resetField(expiryTimeName);
                                                            resetField(expiryValueName);
                                                            setValue(expiryValueName, '');
                                                        }
                                                    }}
                                                />
                                            </Col>
                                            {expiry && (
                                                <>
                                                    <Col
                                                        sm={isImport ? (expiryTimeType?.value ? 6 : 12) : 5}
                                                        id="rs_SplitAB_Expires"
                                                        className='splitab-expirydropdown'
                                                    >
                                                        {renderExpiryTimeDropdown()}
                                                    </Col>
                                                    {(!isImport || expiryTimeType?.value) && (
                                                        <Col sm={isImport ? 6 : 5}>
                                                            {renderExpiryValueInput({
                                                                requiredError: ENTER_EXPIRY_TIME,
                                                                inputId: 'rs_SplitAB_value',
                                                            })}
                                                        </Col>
                                                    )}
                                                </>
                                            )}
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                            {renderHashtagBlock({
                                labelCol,
                                valueCol,
                                wrapInContainer: true,
                                tagsKeySuffix: '',
                            })}
                        </>
                    )}
                </>
            )}

            {showCarouselBlock && (
                <>
                    <div className="form-group">
                        <Row>
                            <Col {...labelCol}>
                                <label className="control-label-left">{EXPIRY}</label>
                            </Col>
                            <Col {...valueCol}>
                                <Row>
                                    <Col sm={isImport ? 12 : 2}>
                                        <RSSwitch
                                            control={control}
                                            name={expiryName}
                                            handleChange={(e) => {
                                                if (!e) {
                                                    resetField(expiryTimeName);
                                                    resetField(expiryValueName);
                                                }
                                            }}
                                        />
                                    </Col>
                                    {expiry &&
                                        (isImport ? renderCarouselImportExpiryRow() : renderCarouselSplitExpiryRow())}
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    {renderHashtagBlock({
                        labelCol,
                        valueCol,
                        wrapInContainer: false,
                        tagsKeySuffix: 'carousel',
                    })}
                </>
            )}
        </>
    );
};

WebPreviewConfig.propTypes = {
    fieldName: PropTypes.string,
    isSplit: PropTypes.bool,
    variant: PropTypes.oneOf(['splitAB', 'import']),
    index: PropTypes.number,
};

export default WebPreviewConfig;
