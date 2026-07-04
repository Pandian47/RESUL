import PropTypes from 'prop-types';

import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const SKELETON_BG = '#e2e7ee';
const SKELETON_BORDER = '#e0e5eb';
const SKELETON_DIVIDER = '#e2e7ee';
const CARD_HEIGHT = 240;
const COLUMNS_PER_ROW = 3;

export const audienceTargetListCardCriticalCss = `
.aud-sk-target-list-card-col {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    padding-left: 0;
    padding-right: 0;
}
@media (min-width: 576px) {
    .aud-sk-target-list-card-col {
        max-width: 100%;
    }
}
.aud-sk-target-list-card-col--pl0 {
    padding-left: 0;
}
.aud-sk-target-list-card-col--pr0 {
    padding-right: 0;
}
.aud-sk-target-list-card {
    position: relative;
    width: 100%;
    min-width: 0;
    height: ${CARD_HEIGHT}px;
    padding: 1px 15px 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: hidden;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid ${SKELETON_BORDER};
    border-radius: 8px;
    font-size: 13px;
}
.aud-sk-target-list-card-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.aud-sk-target-list-card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}
.aud-sk-target-list-card-meta-line {
    flex: 1;
    min-width: 0;
}
.aud-sk-target-list-card-stats-row {
    display: flex;
    align-items: center;
    gap: 4px;
    height:23px;
}
.aud-sk-target-list-card-stats-divider {
    width: 1px;
    height: 70%;
    margin-top: 0;
    background: ${SKELETON_DIVIDER};
    flex-shrink: 0;
}
.aud-sk-target-list-card-body {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.aud-sk-target-list-card-body-left {
    flex: 1;
    min-width: 0;
}
.aud-sk-target-list-card-tag {
    margin-bottom: 5px;
    padding-top:5px
}
.aud-sk-target-list-card-title-row {
    display: flex;
    align-items: center;
    margin-top: 37px;
    margin-bottom: 5px;
    gap: 5px;
}
.aud-sk-target-list-card-audience {
    margin-bottom: 8px;
}
.aud-sk-target-list-card-body-right {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    margin-right: 21px;
    text-align: right;
}
.aud-sk-target-list-card-reach-box {
    position: relative;
    top: 17px;
    padding: 10px;
    border-left: 1px solid ${SKELETON_DIVIDER};
}
.aud-sk-target-list-card-reach-value {
    margin-bottom: 5px;
}
.aud-sk-target-list-card-info {
    margin-top: auto;
    align-self: flex-end;
    margin-right: -28px;
    margin-top:13px
}
.aud-sk-target-list-card-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 30px;
    padding-right: 15px;
    gap: 5px;
    background: ${SKELETON_BG};
    border-radius: 0 0 8px 8px;
}
.aud-sk-target-list-card .aud-sk-block {
    flex-shrink: 0;
}
`;

const skeletonBlockStyle = ({ width, height, circle = false, radius = 4 }) => ({
    width,
    height,
    backgroundColor: SKELETON_BG,
    borderRadius: circle ? '50%' : radius,
});

const resolveTargetListColClass = (index) => {
    if (index == null) return '';
    const columnIndex = index % COLUMNS_PER_ROW;
    if (columnIndex === 0) return 'aud-sk-target-list-card-col--pl0';
    if (columnIndex === COLUMNS_PER_ROW - 1) return 'aud-sk-target-list-card-col--pr0';
    return '';
};

const SkeletonTargetListCard = ({
    index,
    isNoData = false,
    isNoDataAvailable = true,
    injectCriticalCss = true,
}) => (
    <div className={`aud-sk-target-list-card-col ${resolveTargetListColClass(index)}`.trim()}>
        {injectCriticalCss ? <style>{audienceTargetListCardCriticalCss}</style> : null}
        <div className="aud-sk-target-list-card">
            {isNoData ? (
                <div className="aud-sk-target-list-card-empty">
                    <NoDataAvailableRender />
                </div>
            ) : (
                <>
                    <div className="aud-sk-target-list-card-meta">
                        <div className="aud-sk-target-list-card-meta-line" style={{height:"31px"}}>
                            <div className="aud-sk-block" style={skeletonBlockStyle({ width: 280, height: 24, })} />
                        </div>
                    </div>
                    <div className="aud-sk-target-list-card-stats-row">
                        <div className="aud-sk-block" style={skeletonBlockStyle({ width: 135, height: 15 })} />
                        <span className="aud-sk-target-list-card-stats-divider" aria-hidden="true" />
                        <div className="aud-sk-block" style={skeletonBlockStyle({ width: 135, height: 15 })} />
                    </div>
                    <div className="aud-sk-target-list-card-body">
                        <div className="aud-sk-target-list-card-body-left">
                            <div className="aud-sk-target-list-card-tag">
                                <div className="aud-sk-block" style={skeletonBlockStyle({ width: 40, height: 20, radius: 4 })} />
                            </div>
                            <div className="aud-sk-target-list-card-title-row">
                                <div className="aud-sk-block" style={skeletonBlockStyle({ width: 150, height: 18 })} />
                                <div className="aud-sk-block" style={skeletonBlockStyle({ width: 18, height: 18, circle: true })} />
                            </div>
                            <div className="aud-sk-target-list-card-audience">
                                <div className="aud-sk-block" style={skeletonBlockStyle({ width: 150, height: 18 })} />
                            </div>
                        </div>
                        <div className="aud-sk-target-list-card-body-right">
                            <div className="aud-sk-target-list-card-reach-box">
                                <div className="aud-sk-target-list-card-reach-value">
                                    <div className="aud-sk-block" style={skeletonBlockStyle({ width: 70, height: 20 })} />
                                </div>
                                <div className="aud-sk-block" style={skeletonBlockStyle({ width: 70, height: 60 })} />
                            </div>
                            <div className="aud-sk-target-list-card-info">
                                <div className="aud-sk-block" style={skeletonBlockStyle({ width: 20, height: 20, circle: true })} />
                            </div>
                        </div>
                    </div>
                    <div className="aud-sk-target-list-card-footer">
                        <div className="aud-sk-block" style={skeletonBlockStyle({ width: 16, height: 16, circle: true })} />
                        <div className="aud-sk-block" style={skeletonBlockStyle({ width: 16, height: 16, circle: true })} />
                        <div className="aud-sk-block" style={skeletonBlockStyle({ width: 16, height: 16, circle: true })} />
                    </div>
                </>
            )}
        </div>
    </div>
);

SkeletonTargetListCard.propTypes = {
    index: PropTypes.number,
    isNoData: PropTypes.bool,
    isNoDataAvailable: PropTypes.bool,
    injectCriticalCss: PropTypes.bool,
};

export default SkeletonTargetListCard;
