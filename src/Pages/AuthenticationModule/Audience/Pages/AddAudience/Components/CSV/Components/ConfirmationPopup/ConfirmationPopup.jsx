import { AUDIENCE_UPLOAD_LIST_LABELS } from 'Pages/AuthenticationModule/Audience/audienceUploadListLabels';
import { AUDIENCE_GLYPH as G } from 'Pages/AuthenticationModule/Audience/audienceGlyphs';
import { Fragment, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RSAlert from 'Components/RSAlert';
import { ListComponent, getListsConstant } from './constant';
import useQueryParams from 'Hooks/useQueryParams';
const ConfirmationPopup = ({ show, handleClose, handleConfirm, type = 'adhoclist', csvType = 'CSV' }) => {
    const state = useQueryParams('/audience');
    const navigate = useNavigate();
    const dynamicListsConstant = getListsConstant(csvType);
    const { options = [], title, footerText, footerAlert = false } = dynamicListsConstant[type] || {};
    const isBrandModal = type === 'brand';
    const originalOverflow = useRef(document.body.style.overflow);

    useEffect(() => {
        if (show) {
            originalOverflow.current = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = originalOverflow.current;
        }
        return () => {
            document.body.style.overflow = originalOverflow.current;
        };
    }, [show]);

    return (
        <RSAlert
            show={show}
            customClassName={title === AUDIENCE_UPLOAD_LIST_LABELS.AD_HOC_LIST ? 'pt60' : ''}
            body={
                <Fragment>
                    {isBrandModal ? (
                        <ul>
                            <li>
                                <i className={`${G.circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                                <span>
                                    BrandID refers to a unique identifier assigned to individual business unit within
                                    the platform.
                                </span>
                            </li>
                            <li>
                                <i className={`${G.circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                                <span> Proceed to assign BrandID</span>
                            </li>
                        </ul>
                    ) : (
                        <>
                            <h1 className="mb15">{title}</h1>
                            <ul>
                                <ListComponent options={options} />
                                {footerText && (
                                    <p>
                                        {footerAlert && (
                                            <i
                                                className={` ${G.alert_medium} icon-md color-white cursor-normal mr5`}
                                            />
                                        )}
                                        {footerText}
                                    </p>
                                )}
                            </ul>
                            {}
                        </>
                    )}
                </Fragment>
            }
            footer
            footerClass="mt30"
            primaryButtonText={isBrandModal ? 'Proceed' : 'Agree & proceed'}
            secondaryButtonText={isBrandModal || (state && state?.from === 'targetList') ? '' : 'Cancel'}
            handleClose={handleClose}
            handleConfirm={() => {
                if (isBrandModal) {
                    navigate('/preferences/data-catalogue', {
                        state: { add: true, from: 'MDM' },
                    });
                } else {
                    handleConfirm();
                }
            }}
        />
    );
};

export default ConfirmationPopup;
