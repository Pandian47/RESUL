import { EXPIRE_CONFIG } from '../../../../constant';
import { MAX_LENGTH100 } from 'Constants/GlobalConstant/Regex';
import { ADD_CUSTOM_ALERT_SOUND, ENTER_NEW_ALERT_SOUND, ENTER_TITLE_TEXT, EXCEED_EXPIRY_TIME, SELECT_ALERT_SOUND, SELECT_EXPIRY_TIME, SELECT_EXPIRY_VALUE, SELECT_IMPRESSIONS, SELECT_PRIORITY } from 'Constants/GlobalConstant/ValidationMessage';
import { ALERT_SOUND, ENTER_VALUE, EXPIRY, EXPIRY_POPHOVER_TEXT, HASHTAG, HASHTAG_15_CHARACTERS, HASHTAG_COMMS_SEPARATOR, IMPRESSIONS, INTERACTIVITY, MAKE_ALERT, PRIORITY, SUPPORT_TEAM, Short_DESCRIPTION, TITLE_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_medium, circle_question_mark_mini, close_mini, save_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';
import Interactivity from '../Interactivity/Interactivity';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';

import { onlyNumbers } from 'Utils/modules/inputValidators';
import { numberOfDaysValidtorMobilePush } from 'Utils/HookFormValidate';
import RSTagsComponent from 'Components/RSTagsComponent';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getAudioListByApp } from 'Reducers/communication/createCommunication/Create/request';
import { updateNotificationMobile } from 'Reducers/communication/createCommunication/Create/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import RSTooltip from 'Components/RSTooltip';
import RSPPophover from 'Components/RSPPophover';
import Import from '../../Import/Import';

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

const MobilePreviewConfig = ({ fieldName = '', isSplit = false, index = 0, variant = 'splitAB' }) => {
    const isImport = variant === 'import';
    const labelCol = isImport ? { sm: 3 } : { sm: { offset: 1, span: 2 } };
    const valueCol = isImport ? { sm: 9 } : { sm: 6 };
    const dispatch = useDispatch();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));

    const [audioList, setAudioList] = useState([]);
    const [clickOff, setClickOff] = useState(true);
    const [newlyAddedSoundName, setNewlyAddedSoundName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { personalization, notification } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const audioSounds = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer?.notification?.mobile?.audioSounds,
    );

    const location = useQueryParams('/communication') || {};

    const {
        control,
        formState: { errors },
        watch,
        setValue,
        getValues,
        setError,
        clearErrors,
        resetField,
    } = useFormContext();

    const [layoutPosition] = watch(['layoutPosition']);

    const currentTabName = isSplit ? `${fieldName}.currentTabIndex` : 'currentTabIndex';

    useEffect(() => {
        const qparam = new URLSearchParams(window.location.search);
        if (qparam.get('typeId')?.length > 0) {
            setValue(currentTabName, parseInt(qparam.get('typeId'), 10));
        }
        if (isSplit) {
            dispatch(
                updateNotificationMobile({
                    data: fieldName,
                    field: 'fieldNameIndex',
                }),
            );
        }
    }, []);

    const expiryName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiry` : 'expiry';
    const titleName = isSplit ? `${fieldName}.title.text` : 'title.text';
    const colorPickerName = isSplit ? `${fieldName}.title.fontColor` : 'title.fontColor';
    const shortDescName = isSplit ? `${fieldName}.shortDesc.text` : 'shortDesc.text';
    const shortDescColorPickerName = isSplit ? `${fieldName}.shortDesc.fontColor` : 'shortDesc.fontColor';
    const interactivityName = isSplit ? `${fieldName}.interactivity` : 'interactivity';
    const bgOverlayName = isSplit ? `${fieldName}.bgOverlay` : 'bgOverlay';
    const bgOverlayColorName = isSplit ? `${fieldName}.bgOverlayColor` : 'bgOverlayColor';
    const makeAlertName = isSplit ? `${fieldName}.makeAlert` : 'makeAlert';
    const thumbnailName = isSplit ? `${fieldName}.thumbnailUrl` : 'thumbnailUrl';
    const buttonTextName = isSplit ? `${fieldName}.buttonText` : 'buttonText';
    const expiryTimeName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryTime` : 'expiryTime';
    const expiryValueName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.expiryValue` : 'expiryValue';
    const hashTagName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.hashtag` : 'hashtag';
    const contentInputName = isSplit ? `${fieldName}.contentInput` : 'contentInput';
    const alertSoundName = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.alertSound` : 'alertSound';
    const alertSoundValueName =
        isSplit && layoutPosition?.id !== 4 ? `${fieldName}.alertSoundValue` : 'alertSoundValue';
    const newAlertSound = isSplit && layoutPosition?.id !== 4 ? `${fieldName}.newAlertSound` : 'newAlertSound';
    const newAlertSoundName =
        isSplit && layoutPosition?.id !== 4 ? `${fieldName}.newAlertSoundName` : 'newAlertSoundName';
    const impressionsName = isSplit ? `${fieldName}.impressions` : 'impressions';
    const priorityName = isSplit ? `${fieldName}.priority` : 'priority';

    const [
        deliveryType,
        interactivity,
        _bgOverLay,
        _bgOverlayColor,
        expiry,
        currentPage = null,
        hashTag,
        makeAlert,
        alertSound,
        mobileApp,
        contentInput,
        titleColor,
        shortDescColor,
        // layoutPosition,
        newAlert,
        expiryTimeType,
        _alertSoundValue,
        _impressions,
        _priority,
    ] = watch([
        'deliveryType',
        interactivityName,
        bgOverlayName,
        bgOverlayColorName,
        expiryName,
        currentTabName,
        hashTagName,
        makeAlertName,
        alertSoundName,
        'mobileApp',
        contentInputName,
        colorPickerName,
        shortDescColorPickerName,
        // 'layoutPosition',
        newAlertSound,
        expiryTimeName,
        alertSoundValueName,
        impressionsName,
        priorityName,
    ]);

    const hastTagErrorMessage = _get(errors, `${hashTagName}.message`, null);

    const getAlertSoundValues = async (newName, edit) => {
        setIsLoading(true);
        const payload = {
            departmentId,
            userId,
            clientId,
            appId: mobileApp?.appGuId,
            audioName: !!newName ? newName : '',
            isInsertaudioName: edit === 'save' ? true : false,
        };
        const res = await dispatch(getAudioListByApp({ payload, edit, loading: false }));
        setIsLoading(false);
        // debugger;
        if (res?.status) {
            if (!!newName && res?.message !== 'Audio Name is insereted successfully') {
                setError(newAlertSoundName, {
                    type: 'custom',
                    message: 'Alert sound name already exists',
                });
                setClickOff(true);
            } else if (res?.message === 'Audio Name is insereted successfully') {
                clearErrors(newAlertSoundName);
                setValue(newAlertSound, false);
                setValue(newAlertSoundName, '');
                setNewlyAddedSoundName(newName);
                getAlertSoundValues(undefined, undefined);
                setClickOff(true);
                // return res?.data;
            } else setAudioList(res?.data);
        } else {
            if (edit === 'not save') setClickOff(false);
        }
        // if (res?.status && !newName) {
        //     setAudioList(res?.data);
        // } else if (!!newName && res?.message !== 'Alert sound name inserted successfully') {
        //     setError(newAlertSoundName, {
        //         type: 'custom',
        //         message: 'Alert sound name already exists',
        //     });
        //     setClickOff(true);
        // } else {
        //     setClickOff(false);
        // }
    };

    useEffect(() => {
        if (alertSound && !audioSounds?.length) {
            getAlertSoundValues();
        } else {
            setAudioList(audioSounds || []);
        }
    }, [alertSound]);

    useEffect(() => {
        if (deliveryType?.id === 5) {
            const inPageBanner = notification?.mobile?.inPageBanner;
            if (inPageBanner && inPageBanner?.bannerName && inPageBanner.bannerName.length > 0) {
                setValue(currentTabName, 1);
                setValue(contentInputName, 'import');
            }
        }
    }, [deliveryType, notification]);

    // Handle selection of newly added sound
    useEffect(() => {
        if (newlyAddedSoundName && audioList.length > 0) {
            const newlyAddedSound = audioList.find((sound) => sound.AudioName === newlyAddedSoundName);
            if (newlyAddedSound) {
                setValue(alertSoundValueName, newlyAddedSound);
                setNewlyAddedSoundName(''); // Reset after selection
            }
        }
    }, [audioList, newlyAddedSoundName, setValue, alertSoundValueName]);


    const showOuter = !isImport ? contentInput !== 'import' : true;
    const showInPageBlock = deliveryType?.id === 5 && (isImport || contentInput !== 'import');
    const showImportExpiryAlert =
    isImport &&
    deliveryType?.id !== 5 &&
    contentInput === 'import' &&
    layoutPosition?.id !== 4 &&
    layoutPosition?.id !== 3 &&
    layoutPosition?.id !== 1;
    
    const showCarouselBlock =
        layoutPosition?.id === 4 && (isImport ? contentInput === 'import' : contentInput === 'create');

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
        setValue(`${fieldName}.rating`, '');
        setValue(`${fieldName}.frequency`, '');
    };

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

    const renderImportExpiryAndAlertSoundFragment = ({ labelCol: lc, valueCol: vc }) => (
        <>
            <div className="form-group">
                <Row>
                    <Col {...lc}>
                        <label className="control-label-left">{EXPIRY}</label>
                    </Col>
                    <Col {...vc}>
                        <Row>
                            <Col sm={12}>
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
                            {expiry && (
                                <Row className="mt41 position-relative ">
                                    <Col sm={6}>
                                        <RSKendoDropdown
                                            control={control}
                                            name={expiryTimeName}
                                            label="Expires in"
                                            data={EXPIRE_CONFIG}
                                            textField={'text'}
                                            dataItemKey={'id'}
                                            numberOfDaysValidtor
                                            rules={{
                                                required: SELECT_EXPIRY_TIME,
                                            }}
                                            handleChange={() => {
                                                resetField(expiryValueName);
                                                setValue(expiryValueName, '');
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={expiryValueName}
                                            placeholder={ENTER_VALUE}
                                            onKeyDown={onlyNumbers}
                                            maxLength={3}
                                            rules={{
                                                required: SELECT_EXPIRY_VALUE,
                                                validate: (value) => {
                                                    let startDate = _get(location, 'startDate', '');
                                                    let endDate = _get(location, 'endDate', '');

                                                    return numberOfDaysValidtorMobilePush(
                                                        value,
                                                        EXCEED_EXPIRY_TIME,
                                                        expiryTimeType,
                                                        startDate,
                                                        endDate,
                                                    );
                                                },
                                            }}
                                        />
                                    </Col>
                                </Row>
                            )}
                        </Row>
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col {...lc} className={isImport ? 'pr0' : undefined}>
                        <label className="control-label-left">{ALERT_SOUND}</label>
                    </Col>
                    <Col {...vc}>
                        <Row>
                            <Col sm={12}>
                                <RSSwitch
                                    control={control}
                                    name={alertSoundName}
                                    handleChange={(e) => {
                                        if (!e) {
                                            resetField(alertSoundName);
                                            setValue(alertSoundValueName, '');
                                        }
                                    }}
                                />
                            </Col>
                            {alertSound && (
                                <Row className="mt41 position-relative ">
                                    <Col sm={12}>
                                        <RSKendoDropdown
                                            control={control}
                                            name={alertSoundValueName}
                                            label="Alert sound"
                                            data={audioList}
                                            textField={'AudioName'}
                                            dataItemKey={'PushNotifyAudioID'}
                                            rules={{
                                                required: SELECT_ALERT_SOUND,
                                            }}
                                        />
                                    </Col>
                                </Row>
                            )}
                        </Row>
                    </Col>
                </Row>
            </div>
        </>
    );

    const renderMakeAlertTitleShortFragment = ({ labelCol: lc, valueCol: vc }) => (
        <>
            {contentInput === 'import' &&
                ((isSplit && layoutPosition?.value === 'Carousel' && index === 0) ||
                    (isSplit && layoutPosition?.value !== 'Carousel') ||
                    !isSplit) && (
                    <div className="form-group">
                        <Row>
                            <Col {...lc}>
                                <label className="control-label-left">{MAKE_ALERT}</label>
                            </Col>
                            <Col {...vc}>
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
            {makeAlert && (
                <>
                    <div className={`form-group ${isImport ? 'mt41 mobileImportConfig' : ''}`}>
                        <Row>
                            <Col {...lc}>
                                <label className="control-label-left">Title text</label>
                            </Col>
                            <Col {...vc} className="position-relative">
                                <RSEmojiPickerInput
                                    inputName={titleName}
                                    isColorPicker={contentInput !== 'import'}
                                    initColor={titleColor}
                                    placeholder={TITLE_TEXT}
                                    colorPickerName={colorPickerName}
                                    required
                                    rules={{
                                        required: ENTER_TITLE_TEXT,
                                    }}
                                    personalizeData={personalization}
                                    personalizationSettings={{
                                        dataItemKey: 'dataAttributeId',
                                        textField: 'attributeName',
                                    }}
                                    maxLength={100}
                                />
                                <small className="position-absolute right15 top30">
                                    {watch(titleName)?.length} / {MAX_LENGTH100}
                                </small>
                            </Col>

                            {contentInput === 'import' && (
                                <Import fieldName={thumbnailName} type="image" CustomType={'thumbnail'} />
                            )}
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col {...lc}>
                                <label className="control-label-left">{Short_DESCRIPTION}</label>
                            </Col>
                            <Col {...vc} className="position-relative">
                                <RSEmojiPickerInput
                                    inputName={shortDescName}
                                    isColorPicker={contentInput !== 'import'}
                                    initColor={shortDescColor}
                                    placeholder={'Short description'}
                                    colorPickerName={shortDescColorPickerName}
                                    personalizeData={personalization}
                                    personalizationSettings={{
                                        dataItemKey: 'dataAttributeId',
                                        textField: 'attributeName',
                                    }}
                                    maxLength={100}
                                />
                                <small className="position-absolute right15 top30">
                                    {watch(shortDescName)?.length} / {MAX_LENGTH100}
                                </small>
                            </Col>
                        </Row>
                    </div>
                </>
            )}
        </>
    );

    const renderAlertSoundMiddleSection = ({ labelCol: lc, valueCol: vc }) => (
        <div className="form-group">
            <Row>
                <Col {...lc}>
                    <label className="control-label-left">{ALERT_SOUND}</label>
                </Col>
                <Col {...vc}>
                    <Row>
                        <Col sm={isImport ? 12 : 2}>
                            <RSSwitch
                                control={control}
                                name={alertSoundName}
                                handleChange={(e) => {
                                    if (!e) {
                                        setValue(newAlertSoundName, '');
                                        setValue(newAlertSound, false);
                                        setClickOff(true);
                                        resetField(alertSoundValueName);
                                    }
                                }}
                            />
                        </Col>
                        {alertSound && (
                            <Col sm={isImport ? 12 : 10} className={isImport ? 'mt41' : ''}>
                                <div className="position-relative">
                                    {newAlert ? (
                                        <>
                                            <RSInput
                                                name={newAlertSoundName}
                                                required
                                                isLoading={isLoading}
                                                label={'New alert sound'}
                                                className={'pr53'}
                                                isCustomDoubleIcon={true}
                                                rules={{
                                                    required: ENTER_NEW_ALERT_SOUND,
                                                    validate: {
                                                        mustSaveBeforeProceeding: () => {
                                                            return 'Please save the alert sound before proceeding';
                                                        },
                                                    },
                                                }}
                                                handleOnchange={() => {
                                                    setClickOff(true);
                                                    clearErrors(newAlertSoundName);
                                                }}
                                                handleOnBlur={(e) => {
                                                    if (!!e.target.value) {
                                                        getAlertSoundValues(e.target.value, 'not save');
                                                    }
                                                }}
                                            />
                                            {!isLoading && (
                                                <div className="form-field-icon">
                                                    <div className="align-items-center d-flex justify-content-between">
                                                        <RSTooltip position="top" text="Save" className="mr11">
                                                            <i
                                                                onClick={() => {
                                                                    getAlertSoundValues(
                                                                        getValues(newAlertSoundName),
                                                                        'save',
                                                                    );
                                                                }}
                                                                className={`${save_mini} ${
                                                                    clickOff ? 'click-off' : ''
                                                                } icon-xs color-primary-blue`}
                                                            ></i>
                                                        </RSTooltip>
                                                        <RSTooltip position="top" text="Clear">
                                                            <i
                                                                className={`${close_mini} color-primary-red icon-xs`}
                                                                onClick={() => {
                                                                    setValue(newAlertSound, false);
                                                                    setClickOff(true);
                                                                    setValue(alertSoundValueName, '');
                                                                    clearErrors(newAlertSoundName);
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="align-items-center d-flex justify-content-between mt5 position-absolute right0 zIndex2">
                                                <RSPPophover
                                                    pophover={SUPPORT_TEAM}
                                                    popover_overlay_class={'modalOverlayZindexCSS'}
                                                >
                                                    <i
                                                        className={`${circle_question_mark_mini} icon-xs color-primary-blue cp`}
                                                        id="circle_question_mark"
                                                    ></i>
                                                </RSPPophover>
                                            </div>
                                        </>
                                    ) : (
                                        <RSKendoDropdown
                                            control={control}
                                            name={alertSoundValueName}
                                            label={ALERT_SOUND}
                                            required
                                            isLoading={isLoading}
                                            data={audioList}
                                            textField={'AudioName'}
                                            dataItemKey={'PushNotifyAudioID'}
                                            rules={{
                                                required: SELECT_ALERT_SOUND,
                                            }}
                                            footer={
                                                <RSDropdownFooterBtn
                                                    title={ADD_CUSTOM_ALERT_SOUND}
                                                    handleClick={() => {
                                                        setValue(newAlertSoundName, '');
                                                        setValue(newAlertSound, true);
                                                        clearErrors(alertSoundValueName);
                                                    }}
                                                />
                                            }
                                        />
                                    )}
                                </div>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>
        </div>
    );

    const renderExpiryFormGroupWithPopover = ({ labelCol: lc, valueCol: vc, popoverColClassName }) => (
        <div className="form-group">
            <Row>
                <Col {...lc}>
                    <label className="control-label-left">{EXPIRY}</label>
                </Col>
                <Col {...vc}>
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
                        {expiry && (
                            <Col sm={isImport ? 12 : 10}>
                                <Row
                                    className={
                                        isImport
                                            ? 'mt41 position-relative'
                                            : 'align-items-baseline position-relative'
                                    }
                                >
                                    <Col sm={6}>
                                        <RSKendoDropdown
                                            control={control}
                                            name={expiryTimeName}
                                            label="Expires in"
                                            data={EXPIRE_CONFIG}
                                            textField={'text'}
                                            dataItemKey={'id'}
                                            rules={{
                                                required: SELECT_EXPIRY_TIME,
                                            }}
                                            required
                                            handleChange={() => {
                                                resetField(expiryValueName);
                                                setValue(expiryValueName, '');
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={expiryValueName}
                                            placeholder={ENTER_VALUE}
                                            onKeyDown={onlyNumbers}
                                            maxLength={3}
                                            required
                                            rules={{
                                                required: SELECT_EXPIRY_VALUE,
                                                validate: (value) => {
                                                    let startDate = _get(location, 'startDate', '');
                                                    let endDate = _get(location, 'endDate', '');

                                                    return numberOfDaysValidtorMobilePush(
                                                        value,
                                                        EXCEED_EXPIRY_TIME,
                                                        expiryTimeType,
                                                        startDate,
                                                        endDate,
                                                    );
                                                },
                                            }}
                                        />
                                    </Col>
                                    <Col sm={4} className={popoverColClassName}>
                                        <RSPPophover position="top" text={EXPIRY_POPHOVER_TEXT}>
                                            <i
                                                className={`${circle_question_mark_medium} icon-md color-primary-blue`}
                                                id="circle_question_mark"
                                            ></i>
                                        </RSPPophover>
                                    </Col>
                                </Row>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>
        </div>
    );

    const renderHashtagFormGroup = ({ labelCol: lc, valueCol: vc, tagsKey }) => (
        <div className="form-group">
            <Row>
                <Col {...lc}>
                    <label className="control-label-left">#{HASHTAG}</label>
                </Col>
                <Col {...vc}>
                    <div className="rs-tags-container">
                        <RSTagsComponent
                            isNoOfCharacters={false}
                            key={tagsKey}
                            isRefresh={false}
                            tags={hashTag}
                            placeholder={HASHTAG}
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
                    </div>
                     
                    <small>{HASHTAG_15_CHARACTERS}</small>
                    <small>{HASHTAG_COMMS_SEPARATOR}</small>
                    
                </Col>
            </Row>
        </div>
    );

    return (
        <Fragment>
            {showOuter && (
                <>
                    {showInPageBlock ? (
                        <>
                            {renderInteractivityBlock({
                                labelCol,
                                valueCol,
                                onInteractivityOff: (e) => {
                                    if (!e) resetInteractivityButtons();
                                },
                            })}
                            {renderImpressionsPriorityBlock({ labelCol, valueCol })}
                        </>
                    ) : (
                        <div>
                            {showImportExpiryAlert ? (
                                renderImportExpiryAndAlertSoundFragment({ labelCol, valueCol })
                            ) : (
                                <>
                                    {renderMakeAlertTitleShortFragment({ labelCol, valueCol })}
                                    {currentPage !== null && (
                                        <>
                                            {renderInteractivityBlock({
                                                labelCol,
                                                valueCol,
                                                onInteractivityOff: (e) => {
                                                    if (!e) resetInteractivityButtons();
                                                },
                                            })}
                                            {(layoutPosition?.id !== 4 || layoutPosition?.value === 'Carousel') &&
                                                renderAlertSoundMiddleSection({ labelCol, valueCol })}
                                            {layoutPosition?.id !== 4 && (
                                                <>
                                                    {' '}
                                                    {(isImport || contentInput !== 'import') &&
                                                        renderExpiryFormGroupWithPopover({
                                                            labelCol,
                                                            valueCol,
                                                            popoverColClassName:
                                                                'd-flex fg-icons-wrapper position-absolute fg-mobile-wrap Left100 pl0  top7',
                                                        })}
                                                    {renderHashtagFormGroup({ labelCol, valueCol, tagsKey: fieldName })}
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    {showCarouselBlock && (
                        <>
                            {' '}
                            {(isImport ? contentInput === 'import' : contentInput !== 'import') &&
                                renderExpiryFormGroupWithPopover({
                                    labelCol,
                                    valueCol,
                                    popoverColClassName:
                                        'd-flex fg-icons-wrapper position-absolute fg-mobile-wrap Left100 pl0 top7',
                                })}
                            {renderHashtagFormGroup({ labelCol, valueCol, tagsKey: fieldName })}
                        </>
                    )}
                </>
            )}
        </Fragment>
    );
};

MobilePreviewConfig.propTypes = {
    isSplit: PropTypes.bool,
    fieldName: PropTypes.string,
    index: PropTypes.number,
    variant: PropTypes.oneOf(['splitAB', 'import']),
};

export default MobilePreviewConfig;
