import { getmasterData } from 'Utils/modules/masterData';
import { restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { AnnotationPreview } from 'Assets/Images';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSInput from 'Components/FormFields/RSInput';
import RSDatetimePicker from 'Components/FormFields/RSDatetimePicker';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { getFileToBase64 } from 'Utils/base64';
import { useFormContext, useWatch } from 'react-hook-form';

const GooglePromoAnnotationModal = ({ show: showModal, handleClose, confirm }) => {
    const { control, watch, register, setValue } = useFormContext();
    const senderLogo = useRef();
    const { timeZoneList } = getmasterData() || {};
    const promoImage = useRef();

    const [show, setShow] = useState(false);
    const [error, setError] = useState('');

    const {
        promoImage: { isPromoImage, src: promoSrc, path: promoPath },
        offerBadge: { isofferBadge, text },
        offerEndDate: { isOfferEndDate, date },
        promoCode: { isPromoCode, text: promoText, image },
        senderLogo: { isSenderLogo, src, path },
    } = useWatch({
        control,
        name: 'googleAnnotation',
    });

    useEffect(() => {
        setShow(showModal);
    }, [showModal]);

    return (
        <RSModal
            show={show}
            size="lg"
            handleClose={() => {
                handleClose(false);
                setError('');
            }}
            header={'Google promo annotations'}
            body={
                <Container className="d-flex">
                    <div className="position-relative">
                        <img src={AnnotationPreview} alt="google annotation" />
                        <div className="position-absolute d-flex">
                            <img src={src} />
                            <div>
                                <div className="d-flex justify-content-between">
                                    <span>RESUL</span>
                                    <span>Expires in 2 days</span>
                                </div>
                                <div>
                                    <span>Best Email,SMS marketin, online Reputataion Management</span>
                                </div>
                                <div>
                                    <span>{isofferBadge ? text : ''}</span>
                                    Code <span>RES-20%OFF</span>
                                </div>
                                <div>
                                    <img src={promoSrc} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-50">
                        <h5>Annotation Settings</h5>
                        {!!error?.length && <div className="color-primary-red">{error}</div>}
                        <div className="mb15">
                            <div className="d-flex justify-content-between">
                                <label>Offer badge</label>
                                <RSSwitch
                                    control={control}
                                    name={'googleAnnotation.offerBadge.isofferBadge'}
                                    handleChange={(e) => {
                                        setError('');
                                    }}
                                />
                            </div>
                            {isofferBadge && (
                                <RSInput
                                    control={control}
                                    name={'googleAnnotation.offerBadge.text'}
                                    placeholder={'15% OFF'}
                                />
                            )}
                        </div>
                        <div className="mb15">
                            <div className="d-flex justify-content-between">
                                <label>Promo code</label>
                                <RSSwitch
                                    control={control}
                                    name={'googleAnnotation.promoCode.isPromoCode'}
                                    handleChange={(e) => {
                                        setError('');
                                    }}
                                />
                            </div>
                            {isPromoCode && (
                                <RSInput
                                    control={control}
                                    name={'googleAnnotation.promoCode.text'}
                                    placeholder={'RES-20% OFF'}
                                />
                            )}
                        </div>
                        <div className="mb15">
                            <div className="d-flex justify-content-between">
                                <label>Offer discount end date</label>
                                <RSSwitch
                                    control={control}
                                    name={'googleAnnotation.offerEndDate.isOfferEndDate'}
                                    handleChange={(e) => {
                                        setError('');
                                    }}
                                />
                            </div>
                            {isOfferEndDate && (
                                <>
                                    <RSDatetimePicker control={control} name={'googleAnnotation.offerEndDate.date'} />
                                    <span>Time zone</span>
                                    {/* <RSKendoDropDownList
                                        data={timeZoneList}
                                        control={control}
                                        name={'googleAnnotation.offerEndDate.timezone'}
                                        textField="timezoneName"
                                        dataItemKey={'timezoneId'}
                                        label={'Time zone'}
                                    /> */}
                                    <RSKendoDropDownList
                                        data={timeZoneList}
                                        control={control}
                                        name={'googleAnnotation.offerEndDate.timezone'}
                                        label={'Time zone'}
                                        dataItemKey={'timeZoneID'}
                                        textField={'timeZoneName'}
                                    />
                                </>
                            )}
                        </div>
                        <div className="mb15">
                            <div className="d-flex justify-content-between">
                                <label>Sender logo</label>
                                <RSSwitch
                                    control={control}
                                    name={'googleAnnotation.senderLogo.isSenderLogo'}
                                    handleChange={(e) => {
                                        setError('');
                                    }}
                                />
                            </div>
                            {isSenderLogo && (
                                <div>
                                    {src === '' ? (
                                        <input
                                            type="file"
                                            {...register('googleAnnotation.senderLogo.image', {
                                                onChange: (e) => {
                                                    const imgFile = e.target.files[0];
                                                    if (imgFile.size <= 18225) {
                                                        getFileToBase64(
                                                            imgFile,
                                                            (data) => {
                                                                setValue(
                                                                    'googleAnnotation.senderLogo.src',
                                                                    'data:image/png;base64,' + data,
                                                                );
                                                                setValue(
                                                                    'googleAnnotation.senderLogo.path',
                                                                    e.target.value,
                                                                );
                                                            },
                                                            (err) => {},
                                                        );
                                                    }
                                                },
                                            })}
                                            accept=".jpg,.png,.jpeg"
                                        />
                                    ) : (
                                        <>
                                            <img src={src} />
                                            <span>{path}</span>
                                            <i
                                                id='rs_data_refresh'
                                                className={`${restart_medium} icon-md cp`}
                                                onClick={(e) => {
                                                    setValue('googleAnnotation.senderLogo.src', '');
                                                    setValue('googleAnnotation.senderLogo.path', '');
                                                    setValue('googleAnnotation.senderLogo.image', {});
                                                }}
                                            ></i>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mb15">
                            <div className="d-flex justify-content-between">
                                <label>Promo image</label>
                                <RSSwitch
                                    control={control}
                                    name={'googleAnnotation.promoImage.isPromoImage'}
                                    handleChange={(e) => {
                                        setError('');
                                    }}
                                />
                            </div>
                            {isPromoImage && (
                                <div>
                                    {promoSrc === '' ? (
                                        <input
                                            type="file"
                                            {...register('googleAnnotation.promoImage.image', {
                                                onChange: (e) => {
                                                    const imgFile = e.target.files[0];
                                                    if (imgFile.size <= 18225) {
                                                        getFileToBase64(
                                                            imgFile,
                                                            (data) => {
                                                                setValue(
                                                                    'googleAnnotation.promoImage.src',
                                                                    'data:image/png;base64,' + data,
                                                                );
                                                                setValue(
                                                                    'googleAnnotation.promoImage.path',
                                                                    e.target.value,
                                                                );
                                                            },
                                                            (err) => {},
                                                        );
                                                    }
                                                    // e.target.value = null;
                                                },
                                            })}
                                            accept=".jpg,.png,.jpeg"
                                        />
                                    ) : (
                                        <>
                                            <img src={promoSrc} />
                                            <span>{promoPath}</span>
                                            <i
                                                id='rs_data_refresh'
                                                className={`${restart_medium} icon-md cp`}
                                                onClick={(e) => {
                                                    setValue('googleAnnotation.promoImage.src', '');
                                                    setValue('googleAnnotation.promoImage.path', '');
                                                    setValue('googleAnnotation.promoImage.image', {});
                                                }}
                                            ></i>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            }
            footer={
                <>
                    <RSSecondaryButton
                        onClick={(e) => {
                            handleClose(false);
                            setError('');
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>

                    <RSPrimaryButton
                        onClick={(e) => {
                            if (isPromoImage || isOfferEndDate || isPromoCode || isofferBadge || isSenderLogo) {
                                confirm(true);
                            } else {
                                setError('Please select any one of field to proceed');
                            }
                        }}
                    >
                        Save
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default GooglePromoAnnotationModal;
