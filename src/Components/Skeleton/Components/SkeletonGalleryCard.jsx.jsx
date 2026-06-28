import { scolor1, scolor2 } from './constants';
import { Col } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { resolveTemplateCardHeight } from 'CommonComponents/ResTemplateCard/resTemplateCardUtils';
const SkeletonGalleryCard = ({
    isNoDataAvailable = false,
    isLoading = false,
    text = null,
    col = 3,
    cardHeight = null,
    cardMinHeight = 280,
    cardPadding = 19,
    previewHeight = 298,
    hideBottomAccent = false,
}) => {
    const resolvedCardHeight =
        cardHeight ?? (hideBottomAccent ? resolveTemplateCardHeight(col) : null);
    const isTemplateFixedCard = Boolean(hideBottomAccent && resolvedCardHeight);

    const skeletonCardStyles = {
        background: 'white',
        borderRadius: '8px',
        boxShadow: hideBottomAccent ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: `${cardPadding}px`,
        position: 'relative',
        marginBottom: 0,
        ...(resolvedCardHeight
            ? { height: `${resolvedCardHeight}px`, minHeight: `${resolvedCardHeight}px` }
            : { minHeight: `${cardMinHeight}px` }),
        ...(isTemplateFixedCard
            ? {
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
              }
            : {}),
    };

    const skeletonUlStyles = {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        ...(isTemplateFixedCard
            ? {
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
              }
            : {}),
    };

    const skeletonFlexRowStyles = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
    };

    const templateHeaderRowStyles = {
        position: 'relative',
        marginBottom: 0,
        alignItems: 'flex-start',
    };

    const skeletonMenuIconStyles = {
        marginLeft: 'auto',
    };

    const skeletonContentStyles = hideBottomAccent
        ? {
              background: scolor1,
              border: `1px solid ${scolor1}`,
              borderRadius: '10px',
              padding: 0,
              marginBottom: 0,
              ...(isTemplateFixedCard
                  ? {
                        flex: 1,
                        minHeight: 0,
                        height: 'auto',
                    }
                  : {
                        height: `${previewHeight}px`,
                    }),
              position: 'relative',
              boxSizing: 'border-box',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
          }
        : {
              background: scolor1,
              border: `1px solid ${scolor1}`,
              borderRadius: '10px',
              padding: '12px',
              marginBottom: hideBottomAccent ? '0' : '12px',
              height: `${previewHeight}px`,
              position: 'relative',
          };

    const skeletonPreviewContentStyles = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between'
    };

    const skeletonPreviewBodyStyles = {
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '8px 0'
    };

    const skeletonInfoIconStyles = {
        display: 'flex',
        justifyContent: 'flex-end'
    };

    const skeletonBottomAccentStyles = {
        position: 'absolute',
        bottom: '2px',
        left: '1%',
        right: '1%',
        width: '98%',
        height: '5px',
        background: scolor1,
        borderRadius: '0 0 7px 7px',
    };

    /** Same chrome as real template cards — removes global .gallery-list bottom ::before bar. */
    const templateFlowClasses = hideBottomAccent
        ? 'email-template-grid no-box-shadow ai-gallery-gird communication p10'
        : '';

    return (
        <Col sm={col}>
            <div
                className={['gallery-list', 'skeleton', templateFlowClasses, isNoDataAvailable ? 'no-data-available' : '']
                    .filter(Boolean)
                    .join(' ')}
                style={skeletonCardStyles}
            >
                <ul style={skeletonUlStyles}>
                    <div
                        className={`gl-top${isTemplateFixedCard ? '' : ' mt7'}`}
                        style={
                            isTemplateFixedCard
                                ? {
                                      flex: 1,
                                      minHeight: 0,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      marginBottom: 0,
                                  }
                                : undefined
                        }
                    >
                        {isTemplateFixedCard ? (
                            <div className="flex-row" style={templateHeaderRowStyles}>
                                <div
                                    className="fr flex-left d-inline"
                                    style={{ minWidth: 0, paddingRight: 22 }}
                                >
                                    <Skeleton
                                        enableAnimation={isLoading}
                                        width="100%"
                                        height={9}
                                        baseColor={scolor1}
                                        highlightColor={scolor2}
                                    />
                                </div>
                                <div
                                    className="d-flex flex-column align-items-end targetList-skeleton-card-info"
                                    style={{ position: 'absolute', right: 0, top: 2, gap: 0 }}
                                >
                                    <Skeleton
                                        enableAnimation={isLoading}
                                        width={5}
                                        height={3}
                                        circle
                                        baseColor={scolor1}
                                        highlightColor={scolor2}
                                    />
                                    <Skeleton
                                        enableAnimation={isLoading}
                                        width={5}
                                        height={3}
                                        circle
                                        baseColor={scolor1}
                                        highlightColor={scolor2}
                                    />
                                    <Skeleton
                                        enableAnimation={isLoading}
                                        width={5}
                                        height={3}
                                        circle
                                        baseColor={scolor1}
                                        highlightColor={scolor2}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={skeletonFlexRowStyles}>
                                <div className="fr  d-inline mt-11">
                                    <Skeleton enableAnimation={isLoading}  
                                        width={180}
                                        height={16}
                                        baseColor={scolor1}
                                        highlightColor={scolor2}
                                    />
                                </div>
                                <div
                                    className="d-flex flex-column align-items-end targetList-skeleton-card-info "
                                    style={{ gap: '0px', marginTop: '-13px' }}
                                >
                                    <Skeleton enableAnimation={isLoading}  
                                        width={5}
                                        height={5}
                                        circle
                                        baseColor={scolor1}
                                        highlightColor={scolor2}

                                    />
                                    <Skeleton enableAnimation={isLoading}  
                                        width={5}
                                        height={5}
                                        circle
                                        baseColor={scolor1}
                                        highlightColor={scolor2}
                                    />
                                    <Skeleton enableAnimation={isLoading}  
                                        width={5}
                                        height={5}
                                        circle
                                        baseColor={scolor1}
                                        highlightColor={scolor2}

                                    />
                                </div>
                            </div>
                        )}
                        <div
                            className="rsg-campaign-name text-left"
                            style={
                                isTemplateFixedCard
                                    ? { lineHeight: 1, marginTop: 2, marginBottom: 0 }
                                    : { marginTop: '-21px' }
                            }
                        >
                            <Skeleton enableAnimation={isLoading} 
                                width={isTemplateFixedCard ? '72%' : 120}
                                height={isTemplateFixedCard ? 10 : 14}
                                baseColor={scolor1}
                                highlightColor={scolor2}
                            />
                        </div>

                        {isTemplateFixedCard ? (
                            isNoDataAvailable && text ? (
                                <div
                                    className="gl-body mt10 listing-preview-scroll listing-preview-skeleton h-262 px0 border-0"
                                    style={{...skeletonContentStyles, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', flex: 1, minHeight: 0 }}
                                >
                                    <div style={{textAlign: 'center'}}>
                                        {text}
                                    </div>
                                </div>
                            ) : (
                                <div className="gl-body mt10 border-0" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                    <div
                                        className={`listing-preview-scroll listing-preview-skeleton px0 ${hideBottomAccent ? '' : 'h-262'}`}
                                        style={skeletonContentStyles}
                                    >
                                        <div
                                            className={`gl-img border-r10 border-0 ${hideBottomAccent ? '' : ' top-13'}`}
                                            style={
                                                hideBottomAccent
                                                    ? { flex: 1, minHeight: 0, width: '100%' }
                                                    : { height: `${previewHeight}px` }
                                            }
                                        >
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : null}
                    </div>

                    {!isTemplateFixedCard &&
                        (isNoDataAvailable && text ? (
                            <div className="listing-preview-scroll listing-preview-skeleton h-262 px0" style={{...skeletonContentStyles, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
                                <div style={{textAlign: 'center'}}>
                                    {text}
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`listing-preview-scroll listing-preview-skeleton px0 ${hideBottomAccent ? '' : 'h-262'}`}
                                style={skeletonContentStyles}
                            >
                                <div
                                    className={`gl-img border-r10${hideBottomAccent ? '' : ' top-13'}`}
                                    style={
                                        hideBottomAccent
                                            ? { flex: 1, minHeight: 0, width: '100%' }
                                            : { height: `${previewHeight}px` }
                                    }
                                >
                                </div>
                            </div>
                        ))}

                </ul>
                {!hideBottomAccent && (
                    <div className="skeleton-bottom-accent" style={skeletonBottomAccentStyles}></div>
                )}
            </div>
        </Col>
    );
};

export default SkeletonGalleryCard;