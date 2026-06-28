import { mapImage } from 'Assets/Images';
import { textFormatter } from 'Utils/modules/stringUtils';
import { ENTER_WA_FOOTER, ENTER_WA_HEADER } from 'Constants/GlobalConstant/ValidationMessage';
import { ENTER__FOOTER, ENTER_HEADER, INTERACTIVITY } from 'Constants/GlobalConstant/Placeholders';
import { import_file_edge_large, link_mini, map_medium, template_edge_large, text_document_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useRef, useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import { Carousel, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import RSInput from 'Components/FormFields/RSInput';
import Interactivity from '../Interactivity/Interactivty';
import MessagingContext from '../../context';
import Editor from './Editor';
import useQueryParams from 'Hooks/useQueryParams';

import { isCustomParmIncluded, validateCurlyBraces, handlePersonalization } from '../../../../constant';
import LivePreviewModal from '../LivePreviewModal/LivePreviewModal';
import Import from './Import';
import LocationMapModal from '../LocationMapModal';
import { locationPreview } from '../../constant';

const WATextEditor = ({
    templateResponse,
    isCarousel = false,
    fieldName = '',
    isSplitTabs = false,
    index = null,
    splitName = '',
}) => {
    const context = useContext(MessagingContext);
    const inputRef = useRef();
    const { personalization, listTypeWisePersonlization } = useSelector(
        ({ createCommunicationReducer }) => createCommunicationReducer,
    );
    const { userOTPInfo } = useSelector(({ globalstate }) => globalstate);
    const [selectedCarousel, setSelectedCarousel] = useState(index ?? 0);
    const [showLocationMapModal, setShowLocationMapModal] = useState(false);
    const {
        control,
        getValues,
        watch,
        setError,
        setValue,
        formState: { errors },
        handleSubmit,
        clearErrors
    } = useFormContext();
    const location = useQueryParams('/communication');

    const waEditorText = isCarousel || isSplitTabs ? `${fieldName}.editorText` : 'editorText';
    const interactivityName = isCarousel || isSplitTabs ? `${fieldName}.interactivity` : 'interactivity';
    const actionsName = isCarousel || isSplitTabs ? `${fieldName}.actions` : 'actions';
    const previewImageName = isCarousel || isSplitTabs ? `${fieldName}.previewImage` : 'previewImage';
    const headerTypeName = isSplitTabs ? `${fieldName}.headerType` : 'headerType';
    const headerName = isSplitTabs ? `${fieldName}.header` : 'header';
    const footerName = isSplitTabs ? `${fieldName}.footer` : 'footer';
    const templateFieldName = isSplitTabs ? `${fieldName}.templateName` : 'templateName';
    const [editorText, previewImage, actions, header, footer, schedule, locationName, locationAddress] = watch([
        waEditorText,
        previewImageName,
        actionsName,
        headerName,
        footerName,
        'schedule',
        `${headerTypeName}.locationName`,
        `${headerTypeName}.locationAddress`,
    ]);
    const noOfSms = Math.floor(editorText?.length / 161);
    const additionalNo = noOfSms === 3 ? 0 : 1;
    const {
        bodyMaxLength,
        bodyTags,
        carousel,
        footerMaxLength,
        footerTags,
        headerMaxLength,
        headerTags,
        isAction,
        isBodyEditable,
        isFooter,
        isFooterEditable,
        isHeader,
        isHeaderType,
        isHeaderEditable,
        isMedia,
        isMediaTypeEditable,
        isUnicode,
        languageId,
        mediaSizeInMB,
        mediaType,
        mediaURL,
        mediaURLTags,
        mediaUrlMaxLength,
        templateContent,
        templateName,
        templateType,
        waTemplateId,
        currData,
    } = templateResponse;

    const effectiveHeaderType = mediaType === 'location' ? 'location' : isHeaderType;

    // const handleConfig = () => {
    //     const {
    //         bodyTags,
    //         cardBody,
    //         cardIndex,
    //         isCardBodyEditable,
    //         isMedia,
    //         isMediaTypeEditable,
    //         mediaType,
    //         mediaValue,
    //     } = templateResponse.carouselValue;
    // };

    const getActionBtnContent = (isCarousel, carouselActions) => {
        let action = isCarousel ? carouselActions : actions;
        if (!action?.length) return null;

        return (
            <div className="d-flex flex-column text-center">
                {action?.map((item, index) => {
                    return (
                        <div className="whatsapp-cta align-items-center d-flex justify-content-center">
                            {<i
                                className={`${link_mini} icon-xs`}
                            />} {item?.actionName}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getCarouselRenderContent = () => {
        const mapKey = isSplitTabs ? context?.carouselTabs?.[splitName] : context?.carouselTabs?.['carousel'];
        if (!mapKey?.length) return null;
        return (
            <Carousel
                interval={context?.isClickOff ? 4000 : null}
                controls={true}
                indicators={false}
                className="carousel-simple left0"
                wrap={true}
                activeIndex={selectedCarousel}
                onSelect={(selectedIndex) => {
                    setSelectedCarousel(selectedIndex);
                }}
            >
                {mapKey?.map((key, index) => {
                    const item = isSplitTabs
                        ? getValues(`${key?.splitName}.${key?.carouselName}`)
                        : getValues(`${key?.carouselName}`);
                    const isImage = currData?.mediaType === 'image';

                    return (
                        <Carousel.Item key={index} className="wbrw-content">
                            {isImage ? (
                                <img
                                    className="d-block"
                                    style={{
                                        width: '200px',
                                        height: 'auto',
                                        margin: '0 auto',
                                    }}
                                    src={item?.previewImage}
                                    alt={`carousel-img-${index}`}
                                />
                            ) : (
                                <video
                                    className="d-block"
                                    style={{
                                        width: '200px',
                                        height: 'auto',
                                        margin: '0 auto',
                                    }}
                                    src={item?.previewImage}
                                    controls
                                    alt={`carousel-video-${index}`}
                                />
                            )}

                            {(item?.header || item?.editorText) && (
                                <div
                                    className="carousel-text"
                                    dangerouslySetInnerHTML={{
                                        __html: `${item?.header ? `${textFormatter(item?.header || '')}<br/><br/>` : ''
                                            }${textFormatter(item?.editorText || '')}`,
                                    }}
                                />
                            )}

                            {getActionBtnContent?.(true, item?.actions)}
                        </Carousel.Item>
                    );
                })}
            </Carousel>
        );
    };
    const getHeaderType = (headerType) => {
        switch (headerType) {
            case 'video':
                return 'Header video URL';
            case 'image':
                return 'Header image URL';
            case 'pdf':
                return 'Header document URL';
            case 'location':
                return 'Location (map)';
            default:
                return 'text';
        }
    };
    const getExtension = (headerType) => {
        switch (headerType) {
            case 'video':
                return '.mp4';
            case 'image':
                return '.jpg,.jpeg';
            case 'pdf':
                return '.pdf';
            case 'location':
                return '';
            default:
                return '.jpg';
        }
    };

    const LOCATION_NAME_MAX = 75;
    const LOCATION_ADDRESS_MAX = 200;
    const LOCATION_MAP_PREVIEW_IMAGE = mapImage;

    const getLocationPreviewContent = (actionList) => (
        <>
            <div className="mb15 text-center">
                <img
                    src={LOCATION_MAP_PREVIEW_IMAGE}
                    alt="Location"
                    className='mx-auto'
                    width={'45'}
                />
            </div>

            {isFooter ? <small className='mb15'>{isFooter ? footer : ''}</small> : null}
            {((locationName != null && locationName !== '') || (locationAddress != null && locationAddress !== '')) && (
                <div className="pe-none mb15">
                    {locationName != null && locationName !== '' && (
                        <div className="fw-medium mb5 fs14">
                            {locationName}
                        </div>
                    )}
                    {locationAddress != null && locationAddress !== '' && (
                        <div className="text-muted" style={{ fontSize: '12px' }}>
                            {`${locationAddress?.slice(0, 40)}...`}
                        </div>
                    )}
                </div>
            )}
            <p className='mb15'>{editorText}</p>
            {actionList}
        </>
    );

    const renderBubbleContent = () => {
        if (isCarousel || !editorText?.length) return "";

        let html = "";

        if (isHeader && effectiveHeaderType === "text") {
            html += `<p class="mb10"><strong>${header}</strong></p><br/>`;
        }

        if (effectiveHeaderType !== "location") {
            html += `<p>${editorText}</p>`;
        }

        if (isFooter && effectiveHeaderType !== "location") {
            html += `<p class="mt10"><small>${footer}</small></p>`;
        }

        return html;
    };

    const previewContent = () => {
        return (
            <Col sm={4} className="pr0 ml10">
                {/* <div
                    className={`${!editorText?.length ? 'rs-mobile-preview-disable' : 'rs-mobile-preview-enable'
                        } preview-mobile-bg`}
                > */}
                <RSMobilePreview
                    previewSource={PREVIEW_SOURCE.AUTHORING}
                    bubbleType={context}
                    bubbleContent={
                        renderBubbleContent()
                    }
                    schedule={context?.levelNumber < 2 ? schedule : ''}
                    previewImage={previewImage}
                    formErrors={errors}
                    customRenderContent={
                        !isCarousel &&
                        (effectiveHeaderType === 'location' ? locationPreview({
                            locationName,
                            locationAddress,
                            editorText,
                            footer,
                            isFooter,
                            actionList: getActionBtnContent(),
                            isTimeStamp: true,
                            schedule,
                            isCarousel
                        }) : getActionBtnContent())
                    }
                    caruoselContent={isCarousel && getCarouselRenderContent()}
                    headerContent={
                        isCarousel
                            ? isSplitTabs
                                ? getValues(`${splitName}.editorText`)
                                : getValues(`editorText`)
                            : ''
                    }
                    customRenderClassName={effectiveHeaderType === 'location' ? '' : 'mb5'}
                    mediaType={effectiveHeaderType}
                // senderName={senderName?.senderName}
                />
                {/* </div> */}
            </Col>
        );
    };
    const livePreviewProps = {
        show: context?.preview,
        type: context.type,
        audience: getValues('audience'),
        previewImage: previewImage,
        handleClose: () => context?.setPreview(false),
        sendPreview: async (e) => {
            await handleSubmit(async (data) => {
                await context.formSubmitHandler(data, 'live', false, true, e);
            })();
            context?.setPreview(false);
            context.setSmsPreview(true);
        },
        dataSource: context?.dataSource,
        headerContent: isCarousel ? (isSplitTabs ? getValues(`${splitName}.editorText`) : getValues(`editorText`)) : '',
        carouselContent: (() => {
            const mapKey = isSplitTabs ? context?.carouselTabs?.[splitName] : context?.carouselTabs?.['carousel'];
            return Array.isArray(mapKey)
                ? mapKey.map((key, ind) =>
                    isSplitTabs
                        ? getValues(`${key?.splitName}.${key?.carouselName}`)
                        : getValues(`${key?.carouselName}`),
                )
                : [];
        })(),
        currData: currData,
        actions: actions,
        isCarousel: isCarousel,
        editorText: editorText,
        header: header,
        footer: footer,
        mediaType: effectiveHeaderType,
        isFooter,
        locationDetails: {
            locationName,
            locationAddress
        }
    };
    const headerTabs = (fieldName) => [
        {
            id: 'image',
            text: 'Image',
            iconLeft: `${text_document_edge_large} icon-lg `,
            component: () => <Import fieldName={'headerType'} type={'image'} />,
        },
        {
            id: 'video',
            text: 'Video',
            iconLeft: `${import_file_edge_large} icon-lg `,
            component: () => (
                // <Import fieldName={'headerType'} type={'video'} />
                <></>
            ),
        },
        {
            id: 'document',
            text: 'Document',
            iconLeft: `${template_edge_large} icon-lg `,
            component: () => (
                // <Import fieldName={'headerType'} type={'document'} />
                <></>
            ),
            disable: true,
        },
    ];

    const handleHeaderDefaultTab = () => {
        switch (effectiveHeaderType) {
            case 'image':
                return 0;
            case 'video':
                return 1;
            case 'document':
                return 2;
            case 'location':
                return 3;
            default:
                return 0;
        }
    };

    return (
        <>
            <div>
                <Row>
                    <Col sm={{ offset: 1, span: 10 }}>
                        <div className="rs-live-preview-wrapper mt30">
                            <div className="rsamp-text">Preview</div>
                        </div>
                    </Col>
                </Row>
                <div
                    className={`form-group  ${(isCarousel && getValues('editorText')) ||
                        (isSplitTabs && getValues(`${splitName}.editorText`) && isCarousel)
                        ? 'whatsapp-carousel-wrapper'
                        : ''
                        }`}
                >
                    <Row>
                        {/* Left column starts */}
                        <Col sm={{ offset: 1, span: 6 }}>
                            {isHeader && (
                                <div className="form-group whatsapp-image-upload-wrapper">
                                    <Row>
                                        <Col>
                                            {effectiveHeaderType !== 'text' && (
                                                mediaType ? <label className="control-label-left">{`Header (${mediaType})`}</label> : <label className="control-label-left">{`Header`}</label>
                                            )}
                                            {effectiveHeaderType !== 'text' ? (
                                                <>
                                                    {/* <RSTabber
                                                        dynamicTab={`rs-content-tabs-flat col-sm-9`}
                                                        extraClassName={'col-sm-10 offset-sm-1'}
                                                        activeClass={`active`}
                                                        heading="Media type"
                                                        flatTabs
                                                        //refresh={isClickOff ? false : true}
                                                        disableOtherTabs
                                                        isRefreshConfirmation
                                                        // ccTabs
                                                        defaultTab={handleHeaderDefaultTab(effectiveHeaderType)}
                                                        tabData={headerTabs}
                                                    /> */}
                                                    <Import
                                                        key={`${headerTypeName}-${effectiveHeaderType}`}
                                                        fieldName={headerTypeName}
                                                        type={effectiveHeaderType}
                                                        isSplitFieldName={fieldName}
                                                        isSplitTabs={isSplitTabs}
                                                    />

                                                    {/* <RSInput
                                                    //className={`${isHeaderEditable ? '' : 'click-off'}`}
                                                    name={'header'}
                                                    control={control}
                                                    placeholder={getHeaderType(effectiveHeaderType)}
                                                /> */}
                                                    {/* <small>{getExtension(isHeaderType)}</small> */}
                                                </>
                                            ) : (
                                                <RSEmojiPickerInput
                                                    inputName={headerName}
                                                    isHighlight={true}
                                                    rules={{
                                                        required: ENTER_WA_HEADER,
                                                        validate: (inputValue) => {
                                                            return !!inputValue && templateResponse?.header
                                                                ? validateCurlyBraces(
                                                                    inputValue,
                                                                    templateResponse?.header,
                                                                )
                                                                : true;
                                                        },
                                                    }}
                                                    placeholder={ENTER_HEADER}
                                                    personalizationSettings={{
                                                        data: handlePersonalization(
                                                            personalization,
                                                            location?.audience?.length
                                                                ? location?.audience
                                                                : watch('audience')?.length
                                                                    ? watch('audience')
                                                                    : getValues()?.audience,
                                                            listTypeWisePersonlization,
                                                        ),
                                                        dataItemKey: 'dataAttributeId',
                                                        textField: 'key',
                                                    }}
                                                    maxLength={headerMaxLength}
                                                    required
                                                    isEmoji={false}
                                                    isClickOff={!isCustomParmIncluded(templateResponse?.header)}
                                                    isClickOffInput={!isCustomParmIncluded(templateResponse?.header)}
                                                    iconTopspace
                                                    customRender={
                                                        <>
                                                            {' '}
                                                            {effectiveHeaderType === 'text' && (
                                                                <small className="text-end float-right ">
                                                                    {header?.length}/ 60
                                                                </small>
                                                            )}
                                                        </>
                                                    }
                                                />
                                            )}
                                            {/* <RSFileUpload   /> */}
                                        </Col>
                                    </Row>

                                    {/* <Row>
                                    <Col>
                                        <CustomParams fieldName={'headerParams'} isCarousel={false} />
                                    </Col>
                                </Row> */}
                                </div>
                            )}

                            {watch(templateFieldName) && watch(templateFieldName)?.mediaType === 'location' ? (
                                <div>
                                    <h3 className="mb30">{`Header (${watch(templateFieldName)?.mediaType})`}</h3>
                                    <Row>
                                        <Col sm={12} className="form-group d-flex">
                                            <RSInput
                                                control={control}
                                                name={`${headerTypeName}.locationName`}
                                                placeholder="Place name"
                                                maxLength={LOCATION_NAME_MAX}
                                                required
                                                rules={{
                                                    required: 'Enter place name',
                                                    maxLength: {
                                                        value: LOCATION_NAME_MAX,
                                                        message: `Max ${LOCATION_NAME_MAX} characters`,
                                                    },
                                                }}
                                            />
                                            <RSTooltip
                                                text={'Pick from map'}
                                                position="top"
                                                className="align-items-end d-flex lh0 position-relative rs-tooltip-wrapper top1 ml5 right-5"
                                                innerContent={false}
                                            >
                                                <i
                                                    className={`${map_medium} icon-md color-primary-blue`}
                                                    onClick={() => setShowLocationMapModal(true)}
                                                    id="rs_map_modal"
                                                />
                                            </RSTooltip>
                                        </Col>
                                        {/* <Col sm={2} className="form-group">
                                            <RSTooltip
                                                text={'Add place'}
                                                position="top"
                                                className="lh0 d-flex align-items-center h32 borderL"
                                                innerContent={false}
                                            >
                                                <i
                                                    className={`${map_medium} icon-md color-primary-blue`}
                                                    onClick={() => setShowLocationMapModal(true)}
                                                    id="rs_map_modal"
                                                />
                                            </RSTooltip>

                                        </Col> */}
                                        <Col sm={12} className="form-group">
                                            <RSInput
                                                control={control}
                                                name={`${headerTypeName}.locationAddress`}
                                                placeholder="Address"
                                                maxLength={LOCATION_ADDRESS_MAX}
                                                required
                                                rules={{
                                                    required: 'Enter address',
                                                    maxLength: {
                                                        value: LOCATION_ADDRESS_MAX,
                                                        message: `Max ${LOCATION_ADDRESS_MAX} characters`,
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col sm={6} className="form-group">
                                            <RSInput
                                                control={control}
                                                name={`${headerTypeName}.latitude`}
                                                placeholder="Latitude"
                                                required
                                                rules={{
                                                    required: 'Enter latitude',
                                                    validate: (v) => {
                                                        const num =
                                                            v !== '' && v !== null && v !== undefined ? Number(v) : NaN;
                                                        if (isNaN(num)) return 'Latitude must be numeric.';
                                                        if (num < -90 || num > 90) return 'Latitude range is -90 and 90';
                                                        return true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                        <Col sm={6} className="form-group">
                                            <RSInput
                                                control={control}
                                                name={`${headerTypeName}.longitude`}
                                                placeholder="Longitude"
                                                required
                                                rules={{
                                                    required: 'Enter longitude',
                                                    validate: (v) => {
                                                        const num =
                                                            v !== '' && v !== null && v !== undefined ? Number(v) : NaN;
                                                        if (isNaN(num)) return 'Longitude must be numeric.';
                                                        if (num < -180 || num > 180) return 'Longitude range is -180 to 180';
                                                        return true;
                                                    },
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            ) : null}

                            <div className={`${isHeader && isFooter ? 'isheaderfooter' : ''}`}>
                                <Editor
                                    templateResponse={{ ...templateResponse, currData: templateResponse?.currData }}
                                    fieldName={fieldName}
                                    isCarousel={isCarousel}
                                    isSplitTabs={isSplitTabs}
                                />
                            </div>

                            {isFooter && (
                                <div className="form-group mt20">
                                    <Row>
                                        <Col>
                                            <RSEmojiPickerInput
                                                inputName={footerName}
                                                rules={{
                                                    //required: ENTER_WA_FOOTER,
                                                    validate: (inputValue) => {
                                                        return !!inputValue && templateResponse?.footer
                                                            ? validateCurlyBraces(inputValue, templateResponse?.footer)
                                                            : true;
                                                    },
                                                }}
                                                placeholder={ENTER__FOOTER}
                                                personalizationSettings={{
                                                    data: handlePersonalization(
                                                        personalization,
                                                        location?.audience?.length
                                                            ? location?.audience
                                                            : watch('audience')?.length
                                                                ? watch('audience')
                                                                : getValues()?.audience,
                                                        listTypeWisePersonlization,
                                                    ),
                                                    dataItemKey: 'dataAttributeId',
                                                    textField: 'key',
                                                }}
                                                maxLength={footerMaxLength}
                                                //required
                                                isPersonalize={false}
                                                isEmoji={false}
                                                isClickOff={!isCustomParmIncluded(templateResponse?.footer)}
                                                isClickOffInput={!isCustomParmIncluded(templateResponse?.footer)}
                                                iconTopspace
                                            />
                                            {/* <RSInput
                                            name={'footer'}
                                            className={`${isFooterEditable ? '' : 'click-off'}`}
                                            control={control}
                                            placeholder={ENTER__FOOTER}
                                        />
                                        <CustomParams fieldName={'footerParams'} isSplitAB={true} isCarousel={false} /> */}
                                            <small className="text-end float-right">{footer?.length}/ 60</small>
                                        </Col>
                                    </Row>
                                </div>
                            )}
                        </Col>

                        {/* {isAction && <Interactivity isCarousel={isCarousel} fieldName={fieldName} />} */}

                        {/* /Left column ends */}
                        {/* Right column starts */}

                        {previewContent()}
                        {/* /Right column ends */}

                        {getValues(interactivityName) && (
                            <div className="form-group">
                                <Row>
                                    <Col sm={{ offset: 1, span: 2 }}>
                                        <label className="control-label-left">{INTERACTIVITY}</label>
                                    </Col>
                                    {/* <Col sm={6}>
                                    <Row>
                                        <Col sm={2} className="pe-none click-off">
                                            <RSSwitch
                                                control={control}
                                                name={interactivityName}
                                                handleChange={(e) => {
                                                    if (e) {
                                                        // setValue('actions', [
                                                        //     {
                                                        //         actionName: '',
                                                        //         actionType: '',
                                                        //     },
                                                        // ]);
                                                    }
                                                }}
                                            />
                                        </Col>
                                        
                                    </Row>
                                </Col> */}
                                    <Col sm={6}>
                                        <Interactivity
                                            isCarousel={isCarousel}
                                            fieldName={fieldName}
                                            isSplitTabs={isSplitTabs}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Row>
                </div>
            </div>
            {context?.preview && <LivePreviewModal {...livePreviewProps} />}
            <LocationMapModal
                show={showLocationMapModal}
                handleClose={() => setShowLocationMapModal(false)}
                initialValues={{
                    latitude: getValues(`${headerTypeName}.latitude`),
                    longitude: getValues(`${headerTypeName}.longitude`),
                    locationName: getValues(`${headerTypeName}.locationName`),
                    locationAddress: getValues(`${headerTypeName}.locationAddress`),
                }}
                onSave={({ latitude, longitude, regionName, address }) => {
                    setValue(`${headerTypeName}.latitude`, latitude);
                    setValue(`${headerTypeName}.longitude`, longitude);
                    if (regionName != null && regionName !== '') {
                        setValue(`${headerTypeName}.locationName`, regionName);
                    }
                    if (address != null && address !== '') {
                        setValue(`${headerTypeName}.locationAddress`, address);
                    }
                    setShowLocationMapModal(false);
                    clearErrors()
                }}
            />
        </>
    );
};

export default WATextEditor;
