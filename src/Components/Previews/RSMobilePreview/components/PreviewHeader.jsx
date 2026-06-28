import { userImg } from 'Assets/Images';
import { arrow_left_mini, menu_dot_mini } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
const PreviewHeader = ({
    channelType = 'sms',
    displayName = '',
    senderName = '',
    logoPath = '',
    imageError = false,
    onImageError = () => {},
}) => {
    const isWhatsApp = channelType?.toLowerCase() === 'whatsapp'
    return (
        <>
            <div className="header-left">
                <span className="back-arrow lh0">
                    <i className={`${arrow_left_mini} icon-xs ${!isWhatsApp ? 'color-primary-black' : 'white'} `}></i>
                </span>
                <div className="avatar lh0">
                    {logoPath && !imageError ? (
                        <img
                            src={logoPath.startsWith('data:') ? logoPath : `data:image/jpeg;base64,${logoPath}`}
                            alt="preview"
                            className="border-r100"
                            width={24}
                            height={24}
                            onError={onImageError}
                        />
                    ) : (
                        <img src={userImg} alt="" width={24} height={24} className="border-r100" />
                    )}
                </div>
                <span className={`sender-name ${isWhatsApp ? 'd-flex flex-column white lh-sm text-left' : ''}`}>
                    {channelType === 'sms' || channelType === 'rcs' ? (
                        <span className="font-xxs text-center color-primary-black">{displayName}</span>
                    ) : <span className={`${isWhatsApp ? 'white' : ''}`}>
                        {senderName || displayName}
                    </span>}
                    {!['sms', 'rcs'].includes(channelType) && (
                        <>
                            <small className="status white d-block fs7">online</small>
                        </>
                    )}
                </span>
            </div >
            {
                !isWhatsApp ? <div className="header-right">
                    <div className="menu-dots lh0">
                        <i className={`${menu_dot_mini} icon-xs ${!isWhatsApp ? 'color-primary-black' : 'white'}`}></i>
                    </div>
                </div> : null
            }
        </>
    )
};


PreviewHeader.propTypes = {
    channelType: PropTypes.oneOf(['sms', 'mms', 'whatsapp', 'rcs', 'line', 'viber']),
    displayName: PropTypes.string,
    senderName: PropTypes.string,
    logoPath: PropTypes.string,
    imageError: PropTypes.bool,
    onImageError: PropTypes.func,
};

export default PreviewHeader;
