import { charNumUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { buildPayload, FORMAT_DATE, getChars, getOneEightyDays, getSateObject, INITIAL_STATE, OFFER_CODE, RESET_ADDOFFER_FROM, RESET_DDL_CHANGE, RESET_FIELDS, RESET_FILE_NAME, RESET_OFFERTYPES, RESETCOMMON } from '../constant';
import { MAX_LENGTH100, MAX_LENGTH15, MAX_LENGTH5, MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { ADD_OFFER_CODE as ADD_OFFER_CODE_MSG, CODE_PATTERN as CODE_PATTERN_MSG, COMPOSE_USING as COMPOSE_USING_MSG, ENTER_DESCRIPTION, LENGTH as LENGTH_MSG, NAME, OFFER_CODE as OFFER_CODE_MSG, OFFER_CODE_TYPE as OFFER_CODE_TYPE_MSG, OFFER_TYPE as OFFER_TYPE_MSG, SELECT_COMMUNICATION_TYPE, SELECT_END_DATE, SELECT_FILE, SELECT_PRODUCT_TYPE, SELECT_START_DATE, VOLUME as VOLUME_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { ADD_OFFER_CODE, ADD_OFFER_CODE_FORM, ADD_OFFER_FORMAT, ARE_YOU_SURE_WANT_TO_RESET, BAR_CODE, CANCEL, CHOOSE_YOUR_FILE, CODE_LENGTH, CODE_PATTERN, COMMON_TEXT, COMMUNICATIONTYPE, COMMUNIITON_PRODUCT_POPHOVER_TEXT, COMPOSE_USING, DISPLAY_AS, DOWNLOAD_CSV, END_DATE, ENTER_VALUES_LESS_THAN_EQUAL, GENERATE_CSV, HASHES_CHARACTERS, IMPORT_DESCRIPTION, LENGTH, MIN_3_CHARACTERS, NAME_OF_OFFER, OFFER_CODE as OFFER_CODE_PH, OFFER_CODE_TYPE, OFFER_DURATION, OFFER_NAME, OFFER_TYPE, PREVIEW, PRODUCT_TYPE, PRODUCTType, QR_CODE, RESET, SAVE, SELECT_ATLEAST_ONE, START_DATE, TEXT, THE_NUMBER_OF_OFFERS, UNIQUE_TEXT, UPDATE, VOLUME } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_medium, circle_question_mark_mini, download_medium, restart_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSDatePicker from 'Components/FormFields/RSDatePicker';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSPageHeader from 'Components/RSPageHeader';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSTextarea from 'Components/FormFields/RSTextarea';
import RSFileUpload from 'Components/FormFields/RSFileUpload';

import { Barcode, QRcode } from 'Assets/Images';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import { useNavigate } from 'react-router-dom';
import RSPPophover from 'Components/RSPPophover';
import RSTooltip from 'Components/RSTooltip';
import {
    checkOfferNameExists,
    getCouponCode,
    getCouponCode_CSV,
    getOfferById,
    getOfferType,
    saveOffer,
    saveOfferCodeFile,
} from 'Reducers/preferences/OfferManagements/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { clearOfferManageMent, getOfferManagement } from 'Reducers/preferences/OfferManagements/reducer';
import {
    communicationAttributes,
    getCommunicationProductsList,
} from 'Reducers/analytics/communicationAnalytics/request';
import useQueryParams from 'Hooks/useQueryParams';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import ListNameExists from 'Components/ListNameExists';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
var existingListName = '';

const CreateOffer = () => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const { getOfferTypeData, getCommunicationType, getProductType, getEditedData } = useSelector(
        (state) => state.offerMangementReducer,
    );
    const offerId = useQueryParams('/preferences');
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const editDataObj = Array.isArray(getEditedData) ? getEditedData[0] : getEditedData;
    const editName = editDataObj?.OfferName || editDataObj?.offerModel?.offerName || '';
    const methods = useForm(INITIAL_STATE);
    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        resetField,
        trigger,
        clearErrors,
        setFocus,
        setError,
        getValues,
        formState: { errors },
    } = methods;
    const navigate = useNavigate();
    const offerNameError = Object.hasOwn(errors, 'offerName');
    const [
        offerCodeType,
        addOfferCode,
        length,
        formatCapital,
        formatSmall,
        formatNumber,
        offerDurationStartDate,
        offerDurationEndDate,
        display,
        codePattern,
        volume,
        offerType,
        previewData,
        composeUsing,
        csvLink,
        csvFileName,
        importFile,
        importDescription,
    ] = watch([
        'offerCodeType',
        'addOfferCode',
        'length',
        'formatCapital',
        'formatSmall',
        'formatNumber',
        'offerDurationStartDate',
        'offerDurationEndDate',
        'display',
        'codePattern',
        'volume',
        'offerType',
        'previewData',
        'composeUsing',
        'csvLink',
        'csvFileName',
        'importFile',
        'importDescription',
    ]);
    const [csvData, setCSVData] = useState({
        status: false,
        message: '',
        csvVolume: '',
    });
    const [isReset, setIsReset] = useState({
            show: false,
            type: ''
    });
    const [isNotEditable, setIsNotEditable] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [generateFlag, setGenerateFlag] = useState(false);


    const handleSave = async (data) => {
        let formId = offerId?.offerId || 0;
        let payload = {
            departmentId,
            clientId,
            userId,
        };
        let payloadData = { ...payload, ...buildPayload(data, formId, refreshFlag) };
        let res = await dispatch(saveOffer(payloadData));
        if (res?.status) {
            navigate('/preferences/offer-management');
        } else {
            dispatch(
                update_failures_API_Errors({
                    field: 'SaveOffer',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    useEffect(() => {
        async function fetchDetails() {
            let payload = { departmentId, clientId, userId };
            let offerTypeRes = await dispatch(getOfferType(payload));
            let productTypeRes = await dispatch(getCommunicationProductsList(payload));
            let communicationTypeRes = await dispatch(communicationAttributes(payload));
            dispatch(
                getOfferManagement({ field: 'getOfferTypeData', data: offerTypeRes?.status ? offerTypeRes?.data : [] }),
            );
            dispatch(
                getOfferManagement({
                    field: 'getProductType',
                    data: productTypeRes?.status ? productTypeRes?.data : [],
                }),
            );
            dispatch(
                getOfferManagement({
                    field: 'getCommunicationType',
                    data: communicationTypeRes?.status ? communicationTypeRes?.data : [],
                }),
            );
        }
        fetchDetails();
    }, []);

    useEffect(() => {
        async function getEdit() {
            let payload = { departmentId, clientId, userId, offerId: offerId?.offerId };
            if (offerId?.offerId) {
                let { data, status, message = 'No data available' } = await dispatch(getOfferById(payload));
                if (status) {
                    dispatch(
                        getOfferManagement({
                            field: 'getEditedData',
                            data: data,
                        }),
                    );
                    setIsNotEditable(false);
                } else {
                    dispatch(
                        getOfferManagement({
                            field: 'getEditedData',
                            data: {},
                        }),
                    );
                    dispatch(
                        update_failures_API_Errors({
                            field: 'GetOfferByID',
                            message: message || 'No data available',
                        }),
                    );
                    setIsNotEditable(true);
                }
            }
        }
        getEdit();
    }, [offerId?.offerId]);
    useEffect(() => {
        function editedValues() {
            if (!!Object.keys(getEditedData)?.length) {
                let obj = getSateObject({
                    getEditedData,
                    getOfferTypeData,
                    getCommunicationType,
                    getProductType,
                });
                for (let [key, val] of Object.entries(obj)) {
                    setValue(key, val);
                }
                if (obj?.composeUsing) setRefreshFlag(true);
            }
        }
        if (offerId?.offerId) editedValues();
    }, [offerId?.offerId, getEditedData, getOfferTypeData, getCommunicationType, getProductType]);

    // useEffect(() => {
    //     const usFormat = numberWithCommas('' + volume?.split(',')?.join(''));
    //     setValue('volume', usFormat);
    // }, [volume]);

    const hanldeFormatRefresh = () => {
        setRefreshFlag(!refreshFlag);
        setGenerateFlag(false);
        RESET_FIELDS.forEach((e) => resetField(e));
        //setGenerateCode('');
        setValue('previewData', '');
        reset((formState) => ({
            ...formState,
            composeUsing: '',
            codePattern: '',
        }));
    };
    const hanldeOfferCodeRefresh = () => {
        reset((formState) => ({
            ...formState,
            ...RESET_OFFERTYPES,
        }));
    };
    const handleVolumeRefresh = () => {
        reset((formState) => ({
            ...formState,
            ...RESET_ADDOFFER_FROM,
        }));
        setGenerateFlag(false);
        setRefreshFlag(false);
    };
    useEffect(() => {
        return () => {
            dispatch(clearOfferManageMent());
        };
    }, []);

    const handleChange = (event) => {
        const {
            target: { name, value },
        } = event;
        if (value === 'Common') {
            RESETCOMMON.forEach((e) => resetField(e));
            return;
        }
        if (value === 'Unique') {
            resetField('offerCode');
        }
        setGenerateFlag(false);
    };
    const handleChangeDisplay = (event) => {
        const {
            target: { name, value },
        } = event;
        if (!formatCapital && !formatSmall && !formatNumber && !refreshFlag) {
            reset((formState) => ({
                ...formState,
                display: '',
            }));
            setError('formatCapital', {
                type: 'custom',
                message: SELECT_ATLEAST_ONE,
            });
        } else if (Number(length) > 12) {
            reset((formState) => ({
                ...formState,
                display: '',
            }));
            setError('length', {
                type: 'custom',
                message: ENTER_VALUES_LESS_THAN_EQUAL,
            });
            setFocus('length');
        }else if(refreshFlag && (!composeUsing || !codePattern)){
            trigger('composeUsing');
            trigger('codePattern');
            reset((formState) => ({
                ...formState,
                display: '',
            }));
        } else {
            clearErrors('formatCapital');
            if (value === 'Text') {
                getPreviewData();
            }
        }
    };

    const getPreviewData = async () => {
        let payload = {
            chars: getChars({ formatCapital, formatSmall, formatNumber }),
            vol: +volume,
            length: +length,
            flag: !refreshFlag ? 1 : 2,
            composeVal: refreshFlag ? composeUsing : '',
            patternVal: refreshFlag ? codePattern : '',
            csvVal: 0,
        };

        let { status, data, message = 'No data available' } = await dispatch(getCouponCode(payload));
        if (status) {
            setGenerateFlag(true);
            setValue('previewData', data?.preview_data);
        } else {
            setRefreshFlag(false);
            setGenerateFlag(false);
            reset((formState) => ({
                ...formState,
                formatCapital: false,
                formatNumber: false,
                formatSmall: false,
                display: '',
                length: '',
                codePattern: '',
                composeUsing: ''
            }));
            setValue('previewData', '');
        }
    };
    const handleUploadCSV = async ({ target }) => {
        let file = target.files[0];
        let imageFormat = file.name.substr(file.name.lastIndexOf('.') + 1);
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            if (reader.result) {
                let encodedData = reader.result.split(',')[1];
                const lines = window.atob(encodedData).split('\n');
                const trimEmptyRows = lines.reduce((acc, i) => (i ? [...acc, i] : acc), []);
                const numberOfRecords = trimEmptyRows?.length;
                const base64String = reader.result.replace(/^data:text\/[a-z]+;base64,/, '');
                let payload = {
                    userId,
                    clientId,
                    departmentId,
                    base64file: base64String,
                    vol: +volume,
                    fileName: file.name,
                };
                let { status, data, message } = await dispatch(saveOfferCodeFile(payload));
                //debugger
                if (status) {
                    setValue('csvLink', data);
                    setValue('csvFileName', payload.fileName);
                    // if (Number(volume) < numberOfRecords) {
                    //     setCSVData({
                    //         status: true,
                    //         message:
                    //             'The number of offer codes in the uploaded file exceeds the entered volume. Would you like to proceed?',
                    //         csvVolume: numberOfRecords,
                    //     });
                    // } else if (Number(volume) > numberOfRecords) {
                    //     setCSVData({
                    //         status: true,
                    //         message:
                    //             'The number of offer codes in the uploaded file is less than the entered volume. Would you like to proceed?',
                    //         csvVolume: numberOfRecords,
                    //     });
                    // }
                } else {
                    setValue('csvLink', '');
                    setValue('csvFileName', '');
                    setValue('importFile', '');
                    setCSVData({
                        status: true,
                        message: message,
                    });
                }
            } else {
            }
        };
        reader.onerror = (error) => {
        };
    };
    useEffect(() => {
        if (volume?.length > 0) clearErrors('volume');
    }, [volume]);
    const handleGenerate = async () => {
        let payload = {
            userId,
            clientId,
            departmentId,
            flag: !refreshFlag ? 1 : 2,
            chars: getChars({ formatCapital, formatSmall, formatNumber }),
            vol: +volume,
            length: +length,
            composeVal: refreshFlag ? composeUsing : '',
            patternVal: refreshFlag ? codePattern : '',
        };

        let { status, data, message = 'No data available' } = await dispatch(getCouponCode_CSV(payload));
        if (status) {
            setValue('csvLink', data);
            setValue('csvFileName', data?.split('\\').slice(-1)[0]);
        } else {
            setValue('csvLink', '');
            setValue('csvFileName', '');
            dispatch(
                update_failures_API_Errors({
                    field: 'csvGenerationForCouponCode',
                    message: message || 'No data available',
                }),
            );
        }
    };


    return (
        // Contend holder starts
        <FormProvider {...methods}>
            <div className="page-content-holder">
                <RSPageHeader
                    title={offerId?.offerId ? 'Edit offer' : 'Add offer'}
                    isBack
                    backPath="/preferences/offer-management"
                    isHeaderLine
                    rightCommonMenus
                    isBuDisabled={true}
                    isAgencyDisabled={true}
                />

                <Container className="page-content px0">
                    <form onSubmit={handleSubmit(handleSave)}>
                        <div className={`box-design rs-box py40 mt40 ${isNotEditable ? 'click-off' : ''}`}>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">{OFFER_NAME}</label>
                                    </Col>
                                    <Col sm={7}>
                                        <ListNameExists
                                            name={'offerName'}
                                            field={'offerName'}
                                            apiCallback={checkOfferNameExists}
                                            condition={(status) => {
                                                return !status?.status;
                                            }}
                                            maxLength={MAX_LENGTH75}
                                            placeholder={NAME_OF_OFFER}
                                            rules={{
                                                required: NAME,
                                            }}
                                            currentValue={editName}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">{OFFER_TYPE}</label>
                                    </Col>
                                    <Col sm={7} id="rs_CreateOffer_offerType">
                                        <RSKendoDropdown
                                            name="offerType"
                                            data={getOfferTypeData}
                                            textField="offerName"
                                            dataItemKey="offerTypeId"
                                            control={control}
                                            required
                                            label={OFFER_TYPE}
                                            rules={{
                                                required: OFFER_TYPE_MSG,
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>

                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">{OFFER_DURATION}</label>
                                    </Col>
                                    <Col sm={7}>
                                        <Row>
                                            <Col sm={6} id="rs_CreateOffer_newdate">
                                                <RSDatePicker
                                                    name="offerDurationStartDate"
                                                    control={control}
                                                    // required
                                                    min={new Date()}
                                                    format={FORMAT_DATE}
                                                    max={getOneEightyDays(new Date())}
                                                    rules={{
                                                        required: SELECT_START_DATE,
                                                    }}
                                                    placeholder={START_DATE}
                                                />
                                            </Col>
                                            <Col sm={6} id="rs_CreateOffer_Enddate">
                                                <RSDatePicker
                                                    name="offerDurationEndDate"
                                                    control={control}
                                                    // required
                                                    format={FORMAT_DATE}
                                                    disabled={!offerDurationStartDate}
                                                    min={offerDurationStartDate || new Date()}
                                                    max={
                                                        (offerDurationStartDate &&
                                                            getOneEightyDays(offerDurationStartDate)) ||
                                                        new Date()
                                                    }
                                                    rules={{
                                                        required: SELECT_END_DATE,
                                                    }}
                                                    placeholder={END_DATE}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">{PRODUCT_TYPE}</label>
                                    </Col>
                                    <Col sm={7}>
                                        <Row>
                                            <Col sm={6} id="rs_CreateOffer_communicationType">
                                                <RSMultiSelect
                                                    name="communicationType"
                                                    data={getCommunicationType}
                                                    textField="attributename"
                                                    dataItemKey="campaignAttributeId"
                                                    control={control}
                                                    required
                                                    label={COMMUNICATIONTYPE}
                                                    rules={{
                                                        required: SELECT_COMMUNICATION_TYPE,
                                                    }}
                                                />
                                            </Col>
                                            <Col sm={6} id="rs_CreateOffer_productType">
                                                <RSMultiSelect
                                                    name="productType"
                                                    control={control}
                                                    data={getProductType}
                                                    textField="categoryname"
                                                    dataItemKey="categoryId"
                                                    required
                                                    label={PRODUCTType}
                                                    rules={{
                                                        required: SELECT_PRODUCT_TYPE,
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col sm={1} className='pl0 position-relative top8'>
                                      <RSPPophover position={'top'} pophover={COMMUNIITON_PRODUCT_POPHOVER_TEXT}>
                                            <i
                                                className={`${circle_question_mark_mini} color-primary-blue icon-xs`}
                                                id="circle_question_mark"
                                            />
                                     </RSPPophover>
                                    </Col>
                                </Row>
                            </div>
                            <div className="form-group">
                                <Row>
                                    <Col sm={4} className="text-right">
                                        <label className="control-label-left">{OFFER_CODE_TYPE}</label>
                                    </Col>
                                    <Col sm={7}>
                                        <ul className="position-relative rs-list-inline top-5 d-flex align-items-center">
                                            <div className={offerCodeType ? 'click-off' : ''}>
                                                <li>
                                                    <RSRadioButton
                                                        name="offerCodeType"
                                                        id="rs_CreateOffer_common"
                                                        control={control}
                                                        //value={'common'}
                                                        labelName={'Common'}
                                                        placeholder={OFFER_CODE_TYPE}
                                                        required
                                                        rules={{
                                                            required: OFFER_CODE_TYPE_MSG,
                                                        }}
                                                        handleChange={handleChange}
                                                    />
                                                </li>
                                                <li>
                                                    <RSRadioButton
                                                        name="offerCodeType"
                                                        //value={'unique'}
                                                        control={control}
                                                        id="rs_CreateOffer_unique"
                                                        labelName={'Unique'}
                                                        placeholder={OFFER_CODE_TYPE}
                                                        required
                                                        rules={{
                                                            required: OFFER_CODE_TYPE_MSG,
                                                        }}
                                                        handleChange={handleChange}
                                                    />
                                                </li>
                                            </div>
                                              <RSPPophover position={'top'}  className="rs-tooltip-text-multi"  text={
                                                <>
                                                    <ul>
                                                        <li>{COMMON_TEXT}</li>
                                                        <li>
                                                            {UNIQUE_TEXT}
                                                        </li>
                                                    </ul>
                                                </>
                                            }
                                        >
                                            <i
                                                className={`${circle_question_mark_mini} color-primary-blue icon-xs mr15 position-relative top1`}
                                                id="circle_question_mark"
                                            />
                                     </RSPPophover>
                                            {offerCodeType && !addOfferCode && (
                                                <li>
                                                    <RSTooltip
                                                        className="lh0 rs-tooltip-wrapper top1"
                                                        text={RESET}
                                                        position="top"
                                                    >
                                                        <i
                                                            className={`${restart_medium} icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                 setIsReset({
                                                                    show: true,
                                                                    type: 'offerType'
                                                                });
                                                            }}
                                                        ></i>
                                                    </RSTooltip>
                                                </li>
                                            )}
                                        </ul>
                                    </Col>
                                </Row>
                            </div>
                            {offerCodeType === 'Common' ? (
                                <div className="form-group">
                                    <Row>
                                        <Col sm={4} className="text-right">
                                            <label className="control-label-left">{OFFER_CODE_PH}</label>
                                        </Col>
                                        <Col sm={7}>
                                            <RSInput
                                                name="offerCode"
                                                control={control}
                                                id="rs_CreateOffer_offercode"
                                                required
                                                placeholder={OFFER_CODE}
                                                maxLength={MAX_LENGTH15}
                                                rules={{
                                                    required: OFFER_CODE_MSG,
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ) : offerCodeType === 'Unique' ? (
                                <>
                                    <div className="form-group">
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">{VOLUME}</label>
                                            </Col>
                                            <Col sm={7} className={addOfferCode ? 'click-off' : ''}>
                                                <RSInput
                                                    name="volume"
                                                    id="rs_CreateOffer_volume"
                                                    control={control}
                                                    required
                                                    placeholder={VOLUME}
                                                    onKeyDown={onlyNumbers}
                                                    rules={{
                                                        required: VOLUME_MSG,
                                                        validate: (value) => {
                                                            return Number(value) === 0 ? 'Enter valid volume' : true;
                                                        },
                                                    }}
                                                    maxLength={MAX_LENGTH5}
                                                    handleOnBlur={({ target: { value } }) => {
                                                        Number(value) === 0 &&
                                                            setError('volume', {
                                                                type: 'custom',
                                                                message: 'Enter valid volume',
                                                            });
                                                    }}
                                                />
                                            </Col>
                                            <Col sm={1} className="fg-icons-wrapper pl0">
                                                <div className="fg-icons">
                                                    <RSPPophover text={THE_NUMBER_OF_OFFERS}>
                                                        <i
                                                            className={`${circle_question_mark_medium} color-primary-blue icon-md`}
                                                            id="circle_question_mark"
                                                        ></i>
                                                    </RSPPophover>
                                                    {addOfferCode && (
                                                        <RSTooltip
                                                            className="lh0 rs-tooltip-wrapper top1"
                                                            text={RESET}
                                                            position="top"
                                                        >
                                                            <i
                                                                className={`${restart_medium} icon-md color-primary-blue`}
                                                                onClick={() => {
                                                                    setIsReset({
                                                                        show: true,
                                                                        type: 'volume'
                                                                    });
                                                                }}
                                                            ></i>
                                                        </RSTooltip>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className={`form-group ${volume > 0 ? '' : 'click-off'}`}>
                                        <Row>
                                            <Col sm={4} className="text-right">
                                                <label className="control-label-left">{ADD_OFFER_CODE_FORM}</label>
                                            </Col>
                                            <Col
                                                sm={7}
                                                id="rs_CreateOffer_addOffercode"
                                                className={importFile ? 'click-off' : ''}
                                            >
                                                <RSKendoDropdown
                                                    name="addOfferCode"
                                                    control={control}
                                                    data={OFFER_CODE}
                                                    textField="name"
                                                    dataItemKey="id"
                                                    placeholder={ADD_OFFER_CODE}
                                                    label={'Offer code from'}
                                                    required
                                                    rules={{
                                                        required: ADD_OFFER_CODE_MSG,
                                                    }}
                                                    handleChange={() => {
                                                        // const {volume, addOfferCode, ...others} = RESET_ADDOFFER_FROM
                                                        // reset( {...RESET_DDL_CHANGE}    )
                                                        //resetField('importDescription')
                                                        RESET_DDL_CHANGE.map((e) => resetField(e));
                                                        RESET_FILE_NAME.map((e) => setValue(e, ''));
                                                        setGenerateFlag(false);
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    {addOfferCode?.id == 1 && (
                                        <>
                                            {/* <div className="form-group">
                                                <Row>
                                                    <Col sm={4} className="text-right">
                                                        <label className="control-label-left">Import description</label>
                                                    </Col>
                                                    <Col sm={7} className={importFile ? 'click-off' : ''}>
                                                        <RSInput
                                                            name="importDescription"
                                                            id="rs_CreateOffer_importDescription"
                                                            control={control}
                                                            placeholder={IMPORT_DESCRIPTION}
                                                            required
                                                            rules={{
                                                                required: ENTER_DESCRIPTION,
                                                            }}
                                                            onKeyDown={charNumUnderScore}
                                                        />
                                                    </Col>
                                                </Row>
                                            </div> */}
                                            <div className="form-group">
                                                <Row>
                                                    <Col sm={4} className="text-right">
                                                        <label className="control-label-left">
                                                           {CHOOSE_YOUR_FILE}
                                                        </label>
                                                    </Col>
                                                    <Col sm={7} >
                                                        <RSFileUpload
                                                            name="importFile"
                                                            id="rs_CreateOffer_importFile"
                                                            control={control}
                                                            required
                                                            text={'Browse'}
                                                            rules={{
                                                                required: SELECT_FILE,
                                                            }}
                                                            accept={'.csv'}
                                                            labelName={'Select the csv file'}
                                                            clearErrors={clearErrors}
                                                            handleChange={handleUploadCSV}
                                                            placeholder={csvFileName || 'Choose file'}
                                                            isbase64
                                                            watch={watch}
                                                            setError={setError}
                                                            size={2097152}
                                                            isOffer
                                                        />
                                                    </Col>
                                                </Row>
                                            </div>
                                        </>
                                    )}
                                    {addOfferCode?.id == 2 && (
                                        <>
                                            <div className={previewData ? 'click-off' : ''}>
                                                <div className="form-group">
                                                    <Row>
                                                        <Col sm={4} className="text-right">
                                                            <label className="control-label-left">{LENGTH}</label>
                                                        </Col>
                                                        <Col sm={7}>
                                                            <RSInput
                                                                name="length"
                                                                id="rs_CreateOffer_length"
                                                                control={control}
                                                                required
                                                                rules={{
                                                                    required: LENGTH_MSG,
                                                                    validate: (value) => {
                                                                        return Number(value) === 0
                                                                            ? 'Enter valid length'
                                                                            : Number(value) > 12
                                                                            ? 'Enter value less than or equal to 12'
                                                                            : true;
                                                                    },
                                                                }}
                                                                placeholder={CODE_LENGTH}
                                                                onKeyDown={onlyNumbers}
                                                                maxLength={2}
                                                                handleOnchange={() => {
                                                                    setValue('codePattern', '');
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </div>
                                                <div className={`form-group ${length > 0 ? '' : 'click-off'}`}>
                                                    <Row>
                                                        <Col sm={4} className="text-right">
                                                            <label className="control-label-left">{ADD_OFFER_FORMAT}</label>
                                                        </Col>
                                                        <Col sm={7}>
                                                            <ul className="rs-list-inline">
                                                                <li>
                                                                    <RSCheckbox
                                                                        name="formatCapital"
                                                                        control={control}
                                                                        disabled={refreshFlag}
                                                                        required
                                                                        labelName={'ABC'}
                                                                        handleChange={handleChange}
                                                                    />
                                                                </li>
                                                                <li>
                                                                    <RSCheckbox
                                                                        name="formatSmall"
                                                                        control={control}
                                                                        disabled={refreshFlag}
                                                                        required
                                                                        labelName={'abc'}
                                                                        isError={false}
                                                                        handleChange={handleChange}
                                                                    />
                                                                </li>
                                                                <li>
                                                                    <RSCheckbox
                                                                        name="formatNumber"
                                                                        control={control}
                                                                        disabled={refreshFlag}
                                                                        required
                                                                        labelName={'123'}
                                                                        isError={false}
                                                                        handleChange={handleChange}
                                                                    />
                                                                </li>
                                                                <li
                                                                    className={`position-relative top5 ${
                                                                        length > 12 ? 'click-off' : ''
                                                                    }`}
                                                                >
                                                                    <RSTooltip
                                                                        text={`${refreshFlag ? 'Reset' : 'Settings'}`}
                                                                        position="top"
                                                                    >
                                                                        <i
                                                                            className={`${
                                                                                refreshFlag
                                                                                    ? restart_medium
                                                                                    : settings_medium
                                                                            } icon-md color-primary-blue`}
                                                                            onClick={hanldeFormatRefresh}
                                                                        ></i>
                                                                    </RSTooltip>
                                                                </li>
                                                            </ul>
                                                        </Col>
                                                    </Row>
                                                </div>
                                                {refreshFlag && (
                                                    <>
                                                        <div className="form-group">
                                                            <Row>
                                                                <Col sm={4} className="text-right">
                                                                    <label className="control-label-left">
                                                                       {COMPOSE_USING}
                                                                    </label>
                                                                </Col>
                                                                <Col sm={7}>
                                                                    <RSTextarea
                                                                        name="composeUsing"
                                                                        id="rs_CreateOffer_composeUsing"
                                                                        control={control}
                                                                        required
                                                                        rules={{
                                                                            required: COMPOSE_USING_MSG,
                                                                            validate: (value) => {
                                                                                return value?.length < 3 ? MIN_3_CHARACTERS : true;
                                                                            },
                                                                        }}
                                                                        placeholder={COMPOSE_USING}
                                                                        handleChange={handleChange}
                                                                        maxLength={MAX_LENGTH100}
                                                                        onKeyDown={charNumUnderScore}
                                                                    />
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        <div className="form-group">
                                                            <Row>
                                                                <Col sm={4} className="text-right">
                                                                    <label className="control-label-left">
                                                                        {CODE_PATTERN}
                                                                    </label>
                                                                </Col>
                                                                <Col sm={7}>
                                                                    <RSInput
                                                                        name="codePattern"
                                                                        id="rs_CreateOffer_codePattern"
                                                                        control={control}
                                                                        required
                                                                        rules={{
                                                                            required: CODE_PATTERN_MSG,
                                                                        }}
                                                                        placeholder={CODE_PATTERN}
                                                                        handleChange={handleChange}
                                                                        maxLength={Number(length)}
                                                                    />
                                                                    <small>
                                                                        {HASHES_CHARACTERS}
                                                                    </small>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    </>
                                                )}

                                                <div className={`form-group ${length > 0 ? '' : 'click-off'}`}>
                                                    <Row>
                                                        <Col sm={4} className="text-right">
                                                            <label className="control-label-left">{DISPLAY_AS}</label>
                                                        </Col>
                                                        <Col sm={7}>
                                                            <ul className="rs-list-inline">
                                                                <li>
                                                                    <RSRadioButton
                                                                        id="rs_CreateOffer_text"
                                                                        name="display"
                                                                        control={control}
                                                                        labelName={TEXT}
                                                                        required
                                                                        handleChange={handleChangeDisplay}
                                                                    />
                                                                </li>
                                                                <li>
                                                                    <RSRadioButton
                                                                        name="display"
                                                                        labelName={QR_CODE}
                                                                        id="rs_CreateOffer_qrcode"
                                                                        control={control}
                                                                        required
                                                                        disabled={true}
                                                                        isError={false}
                                                                        handleChange={handleChangeDisplay}
                                                                    />
                                                                </li>
                                                                <li>
                                                                    <RSRadioButton
                                                                        name="display"
                                                                        id="rs_CreateOffer_Barcode"
                                                                        labelName={BAR_CODE}
                                                                        disabled={true}
                                                                        control={control}
                                                                        required
                                                                        isError={false}
                                                                        handleChange={handleChangeDisplay}
                                                                    />
                                                                </li>
                                                            </ul>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </div>
                                            {(generateFlag || !!previewData) && (
                                                <div className="form-group">
                                                    <Row>
                                                        {display === 'QR code' && (
                                                            <Col sm={7}>
                                                                <Card className="rs-offer-box rob-qrcode">
                                                                    <img src={QRcode} alt="QR code" />
                                                                </Card>
                                                            </Col>
                                                        )}
                                                        {display === 'Bar code' && (
                                                            <Col sm={7}>
                                                                <Card className="rs-offer-box rob-barcode">
                                                                    <img src={Barcode} alt="Bar code" />
                                                                </Card>
                                                            </Col>
                                                        )}
                                                        <Col sm={4} className="text-right">
                                                            <label className="control-label-left">{PREVIEW}</label>
                                                        </Col>
                                                        <Col sm={2}>
                                                            <Card className="rs-offer-box width100p rob-text">
                                                                {previewData && previewData}
                                                            </Card>
                                                        </Col>
                                                        {display === 'Text' && !!csvLink && !!csvFileName && (
                                                            <Col
                                                                sm={2}
                                                                className="d-flex align-items-center gap-1 cp"
                                                                onClick={() => {
                                                                    csvlinkDownload(csvLink, csvFileName);
                                                                }}
                                                            >
                                                               {DOWNLOAD_CSV}
                                                                <i
                                                                    className={`${download_medium} icon-md color-primary-blue `}
                                                                    id="rs_data_download"
                                                                />
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </div>
                                            )}
                                            {display &&
                                                (codePattern || formatCapital || formatSmall || formatNumber) && (
                                                    <div className="form-group mb0">
                                                        <Row>
                                                            <Col sm={{ offset: 4, span: 7 }}>
                                                                <RSPrimaryButton
                                                                    type="button"
                                                                    className={length > 0 ? '' : 'click-off'}
                                                                    onClick={handleGenerate}
                                                                >
                                                                    {GENERATE_CSV}
                                                                </RSPrimaryButton>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="buttons-holder">
                            <RSSecondaryButton
                                onClick={() => {
                                    reset();
                                    navigate('/preferences/offer-management');
                                }}
                                id="rs_CreateOffer_Cancel"
                            >
                                {CANCEL}
                            </RSSecondaryButton>
                            <RSPrimaryButton
                                type="submit"
                                id="rs_CreateOffer_Save"
                                disabledClass={
                                    isNotEditable
                                        ? 'pe-none click-off'
                                        : offerCodeType === 'Common'
                                        ? ''
                                        : importFile
                                        ? ''
                                        : !previewData
                                        ? 'pe-none click-off'
                                        : ''
                                }
                            >
                                {offerId?.offerId ? UPDATE : SAVE}
                            </RSPrimaryButton>
                        </div>
                    </form>

                    <WarningPopup
                        show={csvData?.status}
                        handleClose={(status) => {
                            if (status === 0) {
                                reset((formState) => ({
                                    ...formState,
                                    csvLink: '',
                                    csvFileName: '',
                                    importFile: '',
                                }));
                            }
                                                        setCSVData((prev) => ({
                                ...prev,
                                status: false,
                            }));
                        }}
                        text={csvData?.message}
                        showCancel={true}
                        isPrimary={false}
                        isCloseButton={false}
                    />
                    {isReset?.show && 
                    <RSConfirmationModal
                        show={isReset?.show}
                        header={RESET}
                        isCloseButton={false}
                        text={ARE_YOU_SURE_WANT_TO_RESET}
                        handleConfirm={(status) => {
                            if (status) {
                                if(isReset?.type === 'offerType'){
                                    hanldeOfferCodeRefresh()
                                }else{
                                    handleVolumeRefresh()

                                }
                                setIsReset({
                                    show: false,
                                    type: ''
                                });
                            }
                        }}
                        handleClose={() => {
                             setIsReset({
                                    show: false,
                                    type: ''
                                });
                        }}
                    />}
                    {getWarningPopupMessage(failureApiErrors, dispatch)}
                </Container>
            </div>
        </FormProvider>
    );
};

export default CreateOffer;
