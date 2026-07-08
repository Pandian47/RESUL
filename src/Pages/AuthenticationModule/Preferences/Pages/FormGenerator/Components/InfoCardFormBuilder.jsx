import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { collapse_large, expand_large, eye_large, progressive_profile_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RSTooltip from 'Components/RSTooltip';
import { useDispatch } from 'react-redux';

import { ResulticksLogoBl } from 'Assets/Images';
import useQueryParams from 'Hooks/useQueryParams';


const InfoCardFormBuilder = ({ data, onPreviewClick, onProgressiveProfilingClick, formFieldsLength, formType = '' }) => {
    const state = useQueryParams('/preferences/form-generator/add-form-generator');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleFullScreen = () => {
        if (!isFullScreen) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullScreen(!isFullScreen);
    };

    const handlePreview = () => {
        if (onPreviewClick) {
            onPreviewClick();
        }
    };

    const handleProgressiveProfiling = () => {
        if (onProgressiveProfilingClick) {
            onProgressiveProfilingClick();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                handleFullScreen();
            }
        };

        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };

    }, []);

    return (
        <>
            <ul className="d-flex rsp-header-band form-generator-header-band bg-white">
                <li>
                    <img src={ResulticksLogoBl} alt="RESUL" className="mdc-logo-contain" />
                </li>
                {state?.formName && (
                    <li>
                        <small>Form name :</small>

                        {state?.formName?.length < 40 ? (
                            <h4>
                                {state?.formName}
                            </h4>
                        ) : (
                            <RSTooltip
                                text={state?.formName}
                                position="bottom"
                            >
                                <h4>
                                    {truncateTitle(state?.formName, 40)}
                                </h4>
                            </RSTooltip>
                        )}
                    </li>
                )}
                {state?.createdDate && (
                    <li>
                        <small>Created date:</small>
                        <h4>
                            {getUserCurrentFormat(state?.createdDate)?.dateFormat || 'NA'}
                        </h4>
                    </li>
                )}
                {state?.formType && (
                    <li>
                        <small>Form type :</small>
                        <h4>
                            {state?.formType}
                        </h4>
                    </li>
                )}
                {formType !== 'tellAFriend' && (
                    <li className="position-absolute right110">
                        <RSTooltip
                            text={'Progressive profiling settings'}
                            position="left"
                            className="lh0 d-flex align-items-center h32"
                            innerContent={false}
                        >
                            <i
                                onClick={handleProgressiveProfiling}
                                className={`${formFieldsLength < 2
                                    ? `click-off ${progressive_profile_large} icon-lg color-primary-blue`
                                    : `${progressive_profile_large} icon-lg color-primary-blue cursor-pointer`
                                    }`}
                            />
                        </RSTooltip>
                    </li>
                )}

                <li className= {` position-absolute ${formType !== 'tellAFriend' ? 'right60': 'right65'} `}>
                    <RSTooltip
                        text={'Preview'}
                        position="bottom"
                        className="lh0 d-flex align-items-center h32"
                        innerContent={false}
                    >
                        <i
                            onClick={handlePreview}
                            className={`${eye_large} icon-lg color-primary-blue cursor-pointer`}
                        />
                    </RSTooltip>

                </li>
                <li className= {` position-absolute ${formType !== 'tellAFriend' ? 'right10': 'right15'} `}>
                    <RSTooltip
                        text={isFullScreen ? 'Exit full screen' : 'Full screen'}
                        position="bottom"
                        className="lh0 d-flex align-items-center h32"
                        innerContent={false}
                    >
                        <i
                            onClick={handleFullScreen}
                            className={`${isFullScreen ? collapse_large : expand_large} icon-lg color-primary-blue cursor-pointer`}
                        />
                    </RSTooltip>
                </li>
            </ul>
        </>
    );
};

export default InfoCardFormBuilder;

