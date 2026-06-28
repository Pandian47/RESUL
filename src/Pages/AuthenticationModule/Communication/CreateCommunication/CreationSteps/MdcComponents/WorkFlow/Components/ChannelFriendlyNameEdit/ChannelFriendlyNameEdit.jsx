import { circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import CanvasWarning from '../Modal/CanvasWarning';
import CreateWorkFlowContext from '../../context';
import { getModule } from '../../constant';

const ChannelFriendlyNameEdit = memo(function ChannelFriendlyNameEdit({
    friendlyName,
    updateFriendlyName,
    data,
    onOpenFriendlyNamePopup,
}) {
    const isPopupMode = typeof onOpenFriendlyNamePopup === 'function';
    const [name, setFriendlyName] = useState(friendlyName);
    const [enableStyle, setenableStyle] = useState(false);
    const [fName, setFname] = useState(friendlyName);
    const [isShowWarning, setShowWarning] = useState({
        status: false,
        message: '',
        id: 0,
    });
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);

    const str = useRef(friendlyName);
    const friendlyNameRef = useRef(null);
    const handleChange = (e) => {
        if (isPopupMode) return;
        setFriendlyName(e.target.value);
    };
    const handleOnFocus = (_) => {
        if (isPopupMode) return;
        setenableStyle(true);
    };
    const handlePopupActivate = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onOpenFriendlyNamePopup(name);
    };
    const handlePopupKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handlePopupActivate(e);
        }
    };
    const focusInput = () => {
        friendlyNameRef.current?.focus();
        const focusTimer = setTimeout(() => {
            if (document.activeElement !== friendlyNameRef.current) {
                friendlyNameRef.current?.focus();
            }
        }, 10);
        return () => clearTimeout(focusTimer);
    };
    const handleOnBlur = (e) => {
        if (isPopupMode) return;
        if(str?.current === name) return
        if (!name?.trim()) {
            focusInput();
            /// friendlyNameRef.current.focus();
            setShowWarning({
                status: true,
                message: `Value should not be empty`,
                id: 1,
            });
        } else if (name === 'Enter friendly Name' && friendlyName === name)  {
             setShowWarning({
                status: true,
                message: `Default name not allowed. Use another.`,
                id: 1,
            });
        }
         else {
            let names = [];
            let rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], data.nodeId);
            if(rslt){
                const { ChannelDetailID, DomId } = rslt['value'];
                function extractChannelNames(channels) {
                    for (let i = 0; i < channels?.length; i++) {
                        let channelName = channels[i]?.ChannelFriendlyName;
                        let channelDomId = channels[i]?.DomId;
                        if (channelName && channelDomId !== DomId) {
                            names.push(channelName?.trim());
                        }
                        if (channels[i]?.activeChannel?.length) {
                            extractChannelNames(channels[i].activeChannel);
                        }
                    }
                }
                extractChannelNames(canvasState['Campaign']['CanvasChannel']['activeChannel']);
            }
            canvasState.subSegment?.subSegmentList?.forEach((segment) => {
                if (segment.id !== data.currentWindowId) {
                    names.push(segment.data.friendlyName);
                }
            });
            if (names?.includes(e?.target.value?.trim())) {
                setShowWarning({
                    status: true,
                    message: `Duplicate friendly name not allowed`,
                    id: 2,
                });
                //setFriendlyName('');
                focusInput();
            } else {
                setFname(name);
                setenableStyle(false);
            }
        }
    };

    useEffect(() => {
        if (name !== str.current) {
            str.current = name;
            updateFriendlyName(name);
                    }
    }, [fName]);

    useEffect(() => {
        setFriendlyName(friendlyName ?? '');
    }, [friendlyName]);

    return (
        <>
            <div className="flex-list">
                <input
                    ref={friendlyNameRef}
                    type="text"
                    readOnly={isPopupMode}
                    value={name}
                    className={`friendly-name ${enableStyle ? 'active' : ''} ${isPopupMode ? 'cursor-pointer' : ''}`}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                    onChange={handleChange}
                    onClick={isPopupMode ? handlePopupActivate : undefined}
                    onKeyDown={isPopupMode ? handlePopupKeyDown : undefined}
                    title={name}
                />
                {/* {enableStyle && (
                    <i
                        id="rs_data_circle_tick_medium"
                        className={`${circle_tick_medium} icon-md ml5 mt-2 color-green-dark `}
                        onClick={() => {
                            setFname(name);
                            setenableStyle(false);
                        }}
                    ></i>
                )} */}
            </div>
            {isShowWarning?.status && (
                <CanvasWarning
                    warnText={isShowWarning?.message}
                    show={isShowWarning?.status}
                    handleClose={() => {
                        if (isShowWarning?.id === 2) {
                            setFriendlyName('');
                            focusInput();
                        }
                        setShowWarning({
                            status: false,
                            message: '',
                            id: 0,
                        });
                    }}
                />
            )}
        </>
    );
});

export default ChannelFriendlyNameEdit;
