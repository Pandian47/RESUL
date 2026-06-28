import { logoVisionBankWhiteFilled } from 'Assets/Images';
import { truncateTitle } from 'Utils/modules/displayCore';
import { close_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import _map from 'lodash/map';
import _get from 'lodash/get';
import parse from 'html-react-parser';
import { selectTitleText } from './constant';
import RSTooltip from 'Components/RSTooltip';

import RSWebPreview from 'Pages/AuthenticationModule/Communication/Component/RSWebPreview';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'

const PreviewOld = ({
    type = 'chrome',
    previewImage,
    previewVideo,
    title,
    subtitle,
    editorText,
    interactivity,
    buttonText,
    customization,
    style,
    remainingTime,
    timerBgColor,
    timerTextColor,
    previewActive = '',
    channelType,
    deliveryType,
}) => {
    const { logo, name } = selectTitleText(type);
    //   console.log('Type : ', type);
    const titleText = _get(title, 'text', null);
    const titleColor = _get(title, 'fontColor', null);
    const editorBackground = _get(customization, 'background', null);
    const editorColor = _get(customization, 'color', null);
    // console.log('Preview active state : ', editorBackground, editorColor, style, customization);

    return (
        <Fragment>
            <Fragment>
                <div
                    className={`emojifont ${
                        previewActive ? 'preview-active' : 'preview-inactive'
                    }`}
                >
                    <div className="rs-web-content-holder">
                        <div className="rswch-content css-scrollbar top0 position-static Web-notification-block">
                            <div className="top-section">
                                <img src={logo} alt={'Logo'} className="rs-browser-logo" />
                                <div className="rs-browser-name top-2 whitespace-no-wrap">{name}</div>
                                <div className="rs-browser-close">
                                    <i className={`${close_mini} icon-mini`} id="rs_Preview_close" />
                                </div>
                            </div>
                            <div
                                className="rs-browser-content-section d-flex css-scrollbar p0"
                                style={{ backgroundColor: editorBackground }}
                            >
                                {/* <div className="rs-browser-brand-logo mb5">
                                    <img src={logoVisionBankWhiteFilled} alt="Logo" />
                                </div> */}
                                <div className="rsbcs-text">
                                    {titleText && (
                                        <h4
                                            className="rsb-title fs15 font-bold mt0 mb10 w-100"
                                            style={{
                                                color: titleColor ?? 'inherit',
                                            }}
                                        >
                                            {/* {titleText?.length > 30 ? (
                                                <RSTooltip text={titleText} innerContent={false}>{truncateTitle(titleText, 30)}</RSTooltip>
                                            ) : (
                                                titleText
                                            )} */}
                                            <TruncatedCell value={titleText} noTable={true} />
                                        </h4>
                                    )}
                                    {/* {type !== 'firefox' && previewImage && !previewVideo && <img src={previewImage} />} */}
                                    {previewImage && !previewVideo && <img src={previewImage} />}

                                    {previewVideo && (
                                        <video height={'150px'} width={'auto'} controls autoPlay>
                                            <source src={previewVideo}></source>
                                        </video>
                                    )}

                                    {remainingTime && (
                                        <p
                                            style={{
                                                background: timerBgColor,
                                                color: timerTextColor,
                                                float: 'right',
                                            }}
                                        >
                                            {remainingTime}
                                        </p>
                                    )}
                                    {subtitle && (
                                        <p
                                            className={`rsb-content-subtitle fs11 ${
                                                type === 'andriod' ? 'subtitle_android' : ''
                                            }`}
                                        >
                                            {subtitle}
                                        </p>
                                    )}
                                    {editorText && (
                                        <div
                                            className="rsb-content fs11 whitespace-pre-wrap"
                                            style={{
                                                // background: editorBackground,
                                                color: editorColor,
                                                // ...style,
                                            }}
                                        >
                                            {parse(editorText)}
                                        </div>
                                    )}
                                    {interactivity && (
                                        <div className="rswbpc-buttons">
                                            {_map(buttonText, ({ text, customText, ...rest }) => {
                                                const backgroundColor = _get(rest, 'backgroundColor', 'inherit');
                                                const color = _get(rest, 'fontColor', 'inherit');
                                                const button =customText || text?.value;
                                                return (
                                                    <Fragment key={button}>
                                                        {(text?.length > 0  || customText?.length > 0) && (
                                                            <button
                                                                type="button"
                                                                key={text?.value}
                                                                style={{
                                                                    backgroundColor,
                                                                    color,
                                                                }}
                                                            >
                                                                {button}
                                                            </button>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`${
                        channelType === 'web'
                            ? 'rs-editor-bottom-message web'
                            : 'rs-editor-bottom-message web mobile_varies'
                    }`}
                >
                    <div className="editor-message-right">
                        <small>
                            <span className="emr-length mandatory">
                                {channelType === 'web' ? 'Varies by browser' : 'Varies by device'}
                            </span>
                        </small>
                    </div>
                </div>
            </Fragment>
        </Fragment>
    );
};

const Preview = (props) => <RSWebPreview variant="authoring" {...props} />;

export default Preview;
