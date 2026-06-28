import { DIGIPOP_ACTION, DIGIPOP_AUDIO_URL, DIGIPOP_CLICK_URL, DIGIPOP_COMPANION_HEIGHT, DIGIPOP_COMPANION_URL, DIGIPOP_COMPANION_WIDTH, DIGIPOP_DESCRIPTION, DIGIPOP_DURATION, DIGIPOP_IMAGE_SIZE, DIGIPOP_PIXELURL, DIGIPOP_RATING, DIGIPOP_RESPONSIVE_SIZE, DIGIPOP_TEXT, DIGIPOP_THUMBNAIL_URL, DIGIPOP_TITLE, DIGIPOP_VIDEO_URL, URL } from 'Constants/GlobalConstant/Placeholders';
import { useFormContext } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { commonResolutionPreview } from 'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Ads/Tabs/Digipop/constant';
import RSInput from 'Components/FormFields/RSInput';
import RSModal from 'Components/RSModal';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { MetaSettingResolution } from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/Ads/constant';

const Preview = ({ show, handleClose, fieldName, type = '', source = '', title = '' }) => {
    const { watch, control } = useFormContext();
    
    const watchImage = watch(fieldName);
    let nativeSource = [];
    let pushNotifySource = [];
    let metaSource = [];
    if (type === 'pushnotif' || type === 'native') {
        for (let i = 0; i < commonResolutionPreview?.length; i++) {
            let size = commonResolutionPreview[i]?.size;
            let srcIcon = source?.[`icon${size}`];
            let srcImg = source?.[`image${size}`];
            if (srcIcon) {
                nativeSource.push({
                    size: `icon${size}`,
                    img: srcIcon,
                });
                pushNotifySource.push({
                    size: `icon${size}`,
                    img: srcIcon,
                });
            }
            if (srcImg) {
                nativeSource.push({
                    size: `image${size}`,
                    img: srcImg,
                });
                pushNotifySource.push({
                    size: `image${size}`,
                    img: srcImg,
                });
            }
        }
        nativeSource = nativeSource.filter(Boolean);
        pushNotifySource = pushNotifySource.filter(Boolean);
    }else if(type === 'meta'){
        for (let i = 0; i < MetaSettingResolution?.length; i++) {
            let size = MetaSettingResolution[i]?.name?.toLowerCase();
            let metaImg = source?.[size];
            if(metaImg){
                metaSource.push({
                    size: MetaSettingResolution[i]?.name,
                    img: metaImg,
                })
            }
        }
    }

    return (
        <RSModal
            show={show}
            size="xxlg"
            header={title + ' settings preview'}
            handleClose={handleClose}
            closeTooltipPosition={true}
            body={
                <div>
                    {source && (
                        <>
                            <Row>
                                <Col sm={6} className="m-auto digipopup-preview">
                                    <div className="digipopup-preview">
                                        <div className="rs-browser-content-section d-flex css-scrollbar">
                                            <div className="">
                                                {type === 'video' ? (
                                                    <>
                                                        <Col sm={12} className={``}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.videoSource}
                                                                placeholder={DIGIPOP_VIDEO_URL}
                                                                name={`video.source`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.duration}
                                                                placeholder={DIGIPOP_DURATION}
                                                                name={`video.duration`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                       
                                                        <video
                                                            src={
                                                                source?.videoSource?.startsWith('http')
                                                                    ? source.videoSource
                                                                    : `data:video/mp4;base64,${source?.videoSource}`
                                                            }
                                                            // style={{
                                                            //     height: '200px',
                                                            //     width: '100%',
                                                            //     objectFit: 'contain',
                                                            // }}
                                                            autoPlay
                                                            controls
                                                            className='mt30'
                                                        />
                                                         <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.companionHeight}
                                                                placeholder={DIGIPOP_COMPANION_HEIGHT}
                                                                name={`video.companionHeight`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.companionWidth}
                                                                placeholder={DIGIPOP_COMPANION_WIDTH}
                                                                name={`video.companionWidth`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.companionUrl}
                                                                placeholder={DIGIPOP_COMPANION_URL}
                                                                name={`video.companionUrl`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        {source?.companionBanner &&
                                                            <img
                                                                alt=""
                                                                src={source?.companionBanner}
                                                                className='mt30'
                                                                // style={{
                                                                //     height: '200px',
                                                                //     width: '100%',
                                                                //     objectFit: 'cover',
                                                                // }}
                                                            />
                                                        }
                                                        {source?.companionHtml &&
                                                            <div dangerouslySetInnerHTML={{ __html: source?.companionHtml }} />
                                                        }
                                                        
                                                    </>
                                                ) : type === 'native' ? (
                                                    <>
                                                        <Col sm={12} className={``}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.title}
                                                                placeholder={DIGIPOP_TITLE}
                                                                name={`native.title`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.text}
                                                                placeholder={DIGIPOP_TITLE}
                                                                name={`native.text`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.action}
                                                                placeholder={DIGIPOP_ACTION}
                                                                name={`native.action`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        {source?.rating && (
                                                            <Col sm={12} className={`mt30`}>
                                                                <RSInput
                                                                    control={control}
                                                                    defaultValue={source?.rating}
                                                                    name={`native.rating`}
                                                                    placeholder={DIGIPOP_RATING}
                                                                    handleOnchange={(e) => {}}
                                                                    disabled
                                                                />
                                                            </Col>
                                                        )}
                                                        {nativeSource.map((item, index) => (
                                                            <>
                                                                <Col sm={12} className={`mt30`}>
                                                                    <RSInput
                                                                        control={control}
                                                                        defaultValue={item?.size}
                                                                        placeholder={DIGIPOP_IMAGE_SIZE}
                                                                        name={`native[${index}].size`}
                                                                        handleOnchange={(e) => {}}
                                                                        disabled
                                                                    />
                                                                </Col>
                                                                <img
                                                                    alt=""
                                                                    src={item.img}
                                                                    className='mt30'
                                                                    // style={{
                                                                    //     height: '200px',
                                                                    //     width: '100%',
                                                                    //     objectFit: 'cover',
                                                                    // }}
                                                                />
                                                            </>
                                                        ))}
                                                    </>
                                                ) : type === 'audio' ? (
                                                    <>
                                                        <Col sm={12} className={``}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.audioSource}
                                                                placeholder={DIGIPOP_AUDIO_URL}
                                                                name={`audio.source`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <audio
                                                            src={
                                                                source?.audioSource?.startsWith('http')
                                                                    ? source.audioSource
                                                                    : `data:video/mp4;base64,${source?.audioSource}`
                                                            }
                                                            autoPlay
                                                            controls
                                                            className='mt30'
                                                        />
                                                    </>
                                                ) : type === 'html' ? (
                                                    <>
                                                        <label className="control-label-left">Mraid</label>
                                                        <RSSwitch
                                                            control={control}
                                                            name={`html.mraid`}
                                                            defaultValue={JSON.parse(source?.isMraid)}
                                                            disabled
                                                            className=""
                                                        />
                                                        <label className="control-label-left">Secure</label>
                                                        <RSSwitch
                                                            control={control}
                                                            name={`html.secure`}
                                                            defaultValue={JSON.parse(source?.isSecure)}
                                                            disabled
                                                            className="mt30"
                                                        />
                                                        <label className="control-label-left">Responsive</label>
                                                        <RSSwitch
                                                            control={control}
                                                            name={`html.responsive`}
                                                            defaultValue={JSON.parse(source?.isResponsive)}
                                                            disabled
                                                            className="mt30"
                                                        />
                                                        <RSInput
                                                            control={control}
                                                            defaultValue={source?.thumbnailUrl}
                                                            placeholder={DIGIPOP_THUMBNAIL_URL}
                                                            name={`html.thumbnailUrl`}
                                                            handleOnchange={(e) => {}}
                                                            disabled
                                                            className="mt30"
                                                        />

                                                        {JSON.parse(source?.isResponsive) && (
                                                            <RSMultiSelect
                                                                control={control}
                                                                name={`html.responsiveSize`}
                                                                defaultValue={source?.responsiveSizes?.responsiveSizes}
                                                                label={DIGIPOP_RESPONSIVE_SIZE}
                                                                handleChange={(e) => {}}
                                                                disabled
                                                                className="mt30"
                                                            />
                                                        )}
                                                        <div dangerouslySetInnerHTML={{ __html: source?.html }} />
                                                    </>
                                                ) : type === 'pushnotif' ? (
                                                    <>
                                                        <Col sm={12} className={``}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.title}
                                                                placeholder={DIGIPOP_TITLE}
                                                                name={`pushNotif.title`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.description}
                                                                placeholder={DIGIPOP_DESCRIPTION}
                                                                name={`pushNotif.description`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.clickUrl}
                                                                placeholder={DIGIPOP_CLICK_URL}
                                                                name={`pushNotif.clickUrl`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>

                                                        {pushNotifySource?.map((item, index) => (
                                                            <>
                                                                <Col sm={12} className={`mt30`}>
                                                                    <RSInput
                                                                        control={control}
                                                                        defaultValue={item?.size}
                                                                        name={`pushNotify.${item?.size}`}
                                                                        handleOnchange={(e) => {}}
                                                                        disabled
                                                                    />
                                                                </Col>
                                                                <img key={index} alt="" src={item?.img} className='mt30'/>
                                                            </>
                                                        ))}
                                                    </>
                                                ) :type === 'meta' ? (
                                                    <>
                                                        <Col sm={12} className={``}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.title}
                                                                placeholder={DIGIPOP_TITLE}
                                                                name={`meta.title`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.clickUrl}
                                                                placeholder={DIGIPOP_CLICK_URL}
                                                                name={`meta.clickUrl`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.pixelUrl}
                                                                placeholder={DIGIPOP_PIXELURL}
                                                                name={`meta.pixelUrl`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>

                                                        {metaSource?.map((item, index) => (
                                                            <>
                                                                <Col sm={12} className={`mt30`}>
                                                                    <RSInput
                                                                        control={control}
                                                                        defaultValue={item?.size}
                                                                        name={`meta.${item?.size}`}
                                                                        handleOnchange={(e) => {}}
                                                                        disabled
                                                                    />
                                                                </Col>
                                                                <img key={index} alt="" src={item?.img} />
                                                            </>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Col sm={12} className={``}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.title}
                                                                placeholder={DIGIPOP_TITLE}
                                                                name={`image.title`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.text}
                                                                placeholder={DIGIPOP_TEXT}
                                                                name={`image.text`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.action}
                                                                placeholder={URL}
                                                                name={`image.action`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>
                                                        <Col sm={12} className={`mt30`}>
                                                            <RSInput
                                                                control={control}
                                                                defaultValue={source?.imageSize}
                                                                placeholder={DIGIPOP_IMAGE_SIZE}
                                                                name={`image.size`}
                                                                handleOnchange={(e) => {}}
                                                                disabled
                                                            />
                                                        </Col>

                                                        <img
                                                            alt=""
                                                            src={source.image}
                                                            // style={{
                                                            //     height: '200px',
                                                            //     width: '100%',
                                                            //     objectFit: 'cover',
                                                            // }}
                                                            className='mt30'
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    )}
                </div>
            }
        />
    );
};

export default Preview;
