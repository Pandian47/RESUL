import { NOT_VERIFIED, SDK_ENABLED, SDK_ENABLED_LINKS, VERIFIED } from 'Constants/GlobalConstant/Placeholders';
import { bold_close_medium, checkbox_medium, link_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import RSTooltip from 'Components/RSTooltip/index.jsx';
const LinkVerification = ({ tab, value, setInfoToggle }) => {
    const links = value?.links;
    const sdkStatus = value?.sdkStatus;
    const [status, setStatus] = useState('');

    useEffect(() => {
        let allemaillinks = false;
        if (links?.length !== 0) {
            for (var i = 0; i < links?.length; i++) {
                allemaillinks = links[i]?.isValid;
            }
            if (sdkStatus && allemaillinks) {
                setStatus({status: true, message: SDK_ENABLED});
            } else if (sdkStatus && !allemaillinks) {
                setStatus({status: false, message:SDK_ENABLED_LINKS});
            } else if (!sdkStatus && allemaillinks) {
                setStatus({status: false, message:SDK_ENABLED});
            } else {
                setStatus({status: false, message:SDK_ENABLED_LINKS});
            }
        }
    }, [tab]);

    return (
        // <li>
        //     <h5 className="m0">{'Link verification'}</h5>
        //     <i className={`${link_medium} icon-md color-primary-red pl15 pr5`} />
        //     <a href="javascript:void(0);" className="font-xsm">
        //         {status}
        //     </a>
        // </li>
        <li>
                {links?.length > 1 ? (
                    <>
                    <div className="d-flex">

                        <i
                            className={`${link_medium} icon-md color-primary-blue mr5 cursor-default`}
                        />
                        <a
                            href="javascript:void(0);"
                            onClick={() => setInfoToggle(true)}
                            className={`font-xsm ellispis color-primary-blue cp`}
                        >
                            {status?.message}
                        </a>
                         <RSTooltip text={!status.status  ? VERIFIED : NOT_VERIFIED} position="top" className="bottom1 lh0 ml10 position-relative">
                                    <i
                                        className={
                                            !status.status
                                                ? `${checkbox_medium} color-primary-green icon-md cursor-default`
                                                : `${bold_close_medium} color-primary-red icon-md cursor-default`
                                        }
                                    />
                                </RSTooltip>
                    </div>
                    </>
                ) : (
                    <>
                        {links?.map(({ link, isValid }, idx) => (
                            <div className="d-flex" key={idx}>
                                <i className={`${link_medium} icon-md color-primary-blue cursor-default  mr5`} />
                                <a href="javascript:void(0);"  className="ellispis cursor-default color-primary-blue">
                                    {link}{' '}
                                </a>
                                <RSTooltip text={isValid ? VERIFIED : NOT_VERIFIED} position="top" className="bottom1 lh0 ml10 position-relative">
                                    <i
                                        className={
                                            isValid
                                                ? `${checkbox_medium} color-primary-green icon-md cursor-default`
                                                : `${bold_close_medium} color-primary-red icon-md cursor-default`
                                        }
                                    />
                                </RSTooltip>
                            </div>
                        ))}
                    </>
                )}
        </li>
    );
};

export default LinkVerification;
