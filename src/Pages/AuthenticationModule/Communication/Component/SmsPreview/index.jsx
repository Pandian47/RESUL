import { getUserDetails } from 'Utils/modules/crypto';
import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { arrow_left_mini } from 'Constants/GlobalConstant/Glyphicons';
import parse from 'html-react-parser';
import { useSelector } from 'react-redux';

const SmsPreview = ({ date = new Date(), content, name, senderId, smssenderName, className, isPreview, channelId, scheduleDate


}) => {
    const currTime = scheduleDate ?? new Date();
    const { firstName } = getUserDetails();
    const { clientId } = useSelector(({ globalstate }) => globalstate);
    return (
        <div className={className}>
            <div className="rs-preview-content ">
                {channelId === 14 ? (
                    <div className="css-scrollbar mobilepush">
                        <div className="d-flex justify-content-center ">
                            <img alt={''} src={`data:image/jpeg;base64,${content}`} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="rspc-top-info">
                            <div className="rspctib-sms">
                                <span className="align-items-center d-flex font-xxs">
                                    <i className={`${arrow_left_mini}`}></i>
                                    <small className="font-xxs">Back</small>
                                </span>
                                <div className="font-xxs color-primary-blue text-center" style={{ width: '235px' }}>
                                    {clientId?.clientName ||  firstName || ''}
                                </div>
                                <span className="position-relative right10">
                                    <small className="font-xxs">Contact</small>
                                </span>
                            </div>
                        </div>
                        <div className="rspc-content">
                            <div className="rspcc-block-sms css-scrollbar">
                                {isPreview && (
                                    <div className="rsm-message-content-info">
                                        SMS
                                        {/* <div className="date">{getUserDateTimeFormat(currTime, 'formatDateTime')}</div> */}
                                        <div className="date">{getUserCurrentFormat(currTime)?.dateTimeFormat}</div>
                                    </div>
                                )}

                                <div className="message pe-none">{content ? parse(content) : null}</div>
                            </div>
                        </div>
                        {!isPreview && (
                            <span className="rspc-bottom-info">
                                {/* {getUserDateTimeFormat(currTime, 'formatDateTime')} */}
                                {getUserCurrentFormat(currTime)?.dateTimeFormat}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmsPreview;
