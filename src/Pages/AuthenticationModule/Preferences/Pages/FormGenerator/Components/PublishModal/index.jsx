import { COPIED_SUCCESSFULLY, COPY, PUBLISH_URL } from 'Constants/GlobalConstant/Placeholders';
import { copy_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty as _isEmpty } from 'Utils/modules/lodashReplacements';
import { getSessionId } from 'Reducers/globalState/selector';
import { useForm } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';

const PublishModal = ({ show, handleActions, data, handleClose }) => {
    const methods = useForm();
    const { control, setValue } = methods;
    const dispatch = useDispatch();
    const [publishUrl, setPublishUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));


    const handleSubmit = () => {
        handleActions(!show);
    };

    const copyToClipboard = async () => {
        if (publishUrl) {
            try {
                await navigator.clipboard.writeText(publishUrl);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 1500);
            } catch (err) {
            }
        }
    };

    // const publishData = async () => {
    //     const payload = {
    //         departmentId,
    //         clientId,
    //         userId,
    //         recipientFormId: data?.formId ?? data?.recipientFormId,
    //     };
    //     let res = await dispatch(publishFormbyID(payload));
    //     if (res?.status) {
    //         const url = res?.data?.publishUrl;
    //         setPublishUrl(url);
    //         setValue('url', url);
    //         localStorage.setItem(LOCAL_STORAGE_KEY, url);
    //     } else {
    //         setPublishUrl('');
    //         setValue('url', '');
    //         localStorage.removeItem(LOCAL_STORAGE_KEY);
    //     }
    // };

    useEffect(() => {
        if (!_isEmpty(data)) {
            setPublishUrl(data?.publishUrl);
        }else{
            setPublishUrl('');
        }
    }, [data?.publishUrl]);

    return (
        <div className="form-group mt20">
            <h4 className="mb20">{PUBLISH_URL}</h4>
            <div className="d-flex align-items-center justify-content-between mb15 p0">
                <div className="d-flex align-items-center justify-content-between border-secondary border-bottom w-100">
                    <span className="pe-none" style={{ userSelect: 'none' }}>
                        {publishUrl}
                    </span>
                    {isCopied && <span className="color-primary-green">{COPIED_SUCCESSFULLY}</span>}
                </div>
                <RSTooltip text={COPY} position="top" className="lh0 ml11">
                    <i
                        className={`${copy_medium} icon-md color-primary-blue cursor-pointer`}
                        onClick={copyToClipboard}
                    />
                </RSTooltip>
            </div>
            {/* <RSInput
                name="url"
                control={control}
                placeholder={PUBLISH_URL}
                disabled
                iconName={copy_medium}
                iconPlaceholder={true}
                iconColor="color-primary-blue"
                handlePlaceholderIconClick={copyToClipboard}
                iconSize="icon-sm"
            />
            {isCopied && (
                <small className="color-primary-green lh0 position-absolute right27 bottom11">
                    {COPIED_SUCCESSFULLY}
                </small>
            )} */}
        </div>
    );
};

export default PublishModal;
