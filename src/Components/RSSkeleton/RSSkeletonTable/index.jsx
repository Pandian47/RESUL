import { RETRY, UNEXPECTED_ERROR_HAPPENED } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect } from 'react';
import { Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { RSSecondaryButton } from 'Components/Buttons';
import { skeletonType } from './Constant';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
const RSSkeletonTable = ({
    count = 7,
    message = 'No data available',
    isError = false,
    retryHandler = () => {},
    text = false,
    type = 'grid',
    isHTML = false,
    isTargetInfo,
    isCustombox=false,
    onMessageClick = null,
    noDataCustomClass ='',
    containerClassName='',
    isAlertIcon = true,
    animation,
    stopAnimation: stopAnimationProp,
    noBoxShadow = true,
    fillHeight = false,
}) => {
    const navigate = useNavigate();
    const {loading} = useSelector(({ globalstate }) => globalstate);
    const shouldAnimate = animation ?? !text;

    function removeTitleFromSkeleton() {
        const skeletonEls = document.querySelectorAll('.skeleton');
        if (skeletonEls?.length > 0) {
            skeletonEls?.forEach((skeletonEl) => {
                const titleEl = skeletonEl.querySelector('title');
                if (titleEl) {
                    titleEl.remove();
                }
            });
        }
    }

    useEffect(() => {
        removeTitleFromSkeleton();
    }, [count]);

    const showNoDataMessage = text && !!message && !loading;
    const stopAnimation = showNoDataMessage || stopAnimationProp;

    return (
        <div className={`no-data-container  ${!fillHeight && !isTargetInfo ? 'h-100' : ''} flex--center flex-column ${isCustombox ? '' : 'box-design'} ${noBoxShadow ? 'no-box-shadow' : ''} ${fillHeight ? 'rs-skeleton-table--fill-height' : ''} ${containerClassName}`}>
            <Fragment>
                {(text && !loading) && (
                    <div className={`${noDataCustomClass ? `${noDataCustomClass} nodata-bar` : 'nodata-bar'}`}>
                        {isHTML ? (
                            <div
                                onClick={onMessageClick}
                            >
                                {message}
                            </div>
                        ) : (
                            <>
                            {isAlertIcon &&
                                <i
                                    className={`${alert_medium} pointer-event-none icon-md color-primary-orange mr5`}
                                ></i>
                            }
                                <p>{message || <NoDataAvailableRender />}</p>
                            </>
                        )}
                    </div>
                )}
                <div className= {`${ type !== 'tag' ? "rs-skeleton-table__bars" :  ''}`}>
                    {Array(count)
                        .fill(0)
                        .map((_, index) => (
                            <Fragment key={index}>{skeletonType(type, stopAnimation, shouldAnimate)}</Fragment>
                        ))}
                </div>
            </Fragment>
            {isError && (
                <Fragment>
                    <Row>
                        <p className="px20">{UNEXPECTED_ERROR_HAPPENED}</p>
                    </Row>
                    <Row className="w-100">
                        <div className="text-end">
                            <RSSecondaryButton onClick={retryHandler}>{RETRY}</RSSecondaryButton>
                        </div>
                    </Row>
                </Fragment>
            )}
        </div>
    );
};

RSSkeletonTable.propTypes = {
    count: PropTypes.number,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    isHTML: PropTypes.bool,
    error: PropTypes.bool,
    retryHandler: PropTypes.func,
    isError: PropTypes.bool,
    text: PropTypes.bool,
    type: PropTypes.string,
    isAlertIcon: PropTypes.bool,
    animation: PropTypes.bool,
    fillHeight: PropTypes.bool,
};
export default RSSkeletonTable;
