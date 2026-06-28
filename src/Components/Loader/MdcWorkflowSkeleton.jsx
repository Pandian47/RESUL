import { Fragment, memo } from 'react';
const mdcWorkflowSkeletonCriticalCss = `
.mdc-workflow-skeleton{height:100vh;padding:0;background:#f5f8fe}
.mdc-workflow-skeleton .mdc-slider-wrapper{margin:0;overflow:hidden;display:flex;flex-wrap:nowrap}
.mdc-workflow-skeleton .mdc-left-wrapper{width:183px;flex:0 0 183px;padding:0 0 0 10px}
.mdc-workflow-skeleton .mdc-right-wrapper{padding:0;margin:0 10px;flex:1 1 auto;min-width:0}
.mdc-workflow-skeleton .mdc-aside-left,.mdc-workflow-skeleton #main-canvas{height:calc(100vh - 95px)}
.mdc-workflow-skeleton .box-design{background:#fff;border:1px solid #c2cfe3;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,.08)}
.mdc-workflow-skeleton .card{background:#fff;border:1px solid #c2cfe3;border-radius:5px}
.mdc-workflow-skeleton .card-body{padding:0}
.mdc-workflow-skeleton .expand-icon{position:absolute;right:-16px;top:50%;width:17px;height:40px;margin-top:-20px;background:#6975f5;z-index:1;border-radius:0 5px 5px 0}
.mdc-workflow-skeleton .skeleton-shimmer{position:relative;overflow:hidden;background:#e2e7ee;border-radius:5px}
.mdc-workflow-skeleton .skeleton-shimmer:after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,#eef2f9,transparent);animation:mdcWorkflowSkeletonShimmer 1.6s infinite}
.mdc-workflow-skeleton__header{height:59px;margin:10px;padding:9px 14px;display:flex;align-items:center;gap:22px;background:#fff}
.mdc-workflow-skeleton__brand{width:165px;height:34px;flex:0 0 auto}
.mdc-workflow-skeleton__header-group{width:220px;display:flex;flex-direction:column;gap:8px;flex:0 0 auto}
.mdc-workflow-skeleton__header-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
.mdc-workflow-skeleton__line{display:block;height:10px}
.mdc-workflow-skeleton__line.w-70{width:70%}.mdc-workflow-skeleton__line.w-60{width:60%}.mdc-workflow-skeleton__line.w-45{width:45%}.mdc-workflow-skeleton__line.w-35{width:35%}
.mdc-workflow-skeleton__circle{display:block;width:28px;height:28px;border-radius:50%}
.mdc-workflow-skeleton__button{display:block;width:96px;height:32px}
.mdc-workflow-skeleton__sidebar{padding:0;overflow:hidden}
.mdc-workflow-skeleton__sidebar-section{border-bottom:1px solid #c2cfe3}
.mdc-workflow-skeleton__sidebar-section:last-child{border-bottom:0}
.mdc-workflow-skeleton__sidebar-heading{height:17px;width:88px;margin:10px auto 9px}
.mdc-workflow-skeleton__sidebar-heading.is-wide{width:128px}
.mdc-workflow-skeleton__sidebar-grid{display:grid;grid-template-columns:1fr 1fr;column-gap:10px;row-gap:9px;padding:0 16px 11px}
.mdc-workflow-skeleton__sidebar-grid.is-audience{padding-bottom:13px}
.mdc-workflow-skeleton__sidebar-tile{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.mdc-workflow-skeleton__sidebar-icon{display:block;width:55px;height:55px;}
.mdc-workflow-skeleton__sidebar-icon.is-round{width:62px;height:62px;border-radius:50%}
.mdc-workflow-skeleton__sidebar-label{display:block;width:48px;height:8px}
.mdc-workflow-skeleton__sidebar-label.is-long{width:58px}
.mdc-workflow-skeleton__sidebar-icon.tone-1{background:#d6e4f5}.mdc-workflow-skeleton__sidebar-icon.tone-2{background:#ead7ec}.mdc-workflow-skeleton__sidebar-icon.tone-3{background:#ffe1ca}.mdc-workflow-skeleton__sidebar-icon.tone-4{background:#fae8ac}.mdc-workflow-skeleton__sidebar-icon.tone-5{background:#d8edc8}.mdc-workflow-skeleton__sidebar-icon.tone-6{background:#d7f0a5}.mdc-workflow-skeleton__sidebar-icon.tone-7{background:#cce0fb}.mdc-workflow-skeleton__sidebar-icon.tone-8{background:#c8e9fa}.mdc-workflow-skeleton__sidebar-icon.tone-9{background:#d8d8dd}.mdc-workflow-skeleton__sidebar-icon.tone-10{background:#c9f4dc}.mdc-workflow-skeleton__sidebar-icon.tone-11{background:#cde7fb}.mdc-workflow-skeleton__sidebar-icon.tone-12{background:#d5dcf0}
.mdc-workflow-skeleton__canvas{position:relative;min-height:100%;height:100%;overflow:hidden;background-color:#f8fbff;background-image:radial-gradient(#d9e6f7 1px,transparent 1px);background-size:18px 18px;border-radius:4px;}
.mdc-workflow-skeleton__mini-map{position:absolute!important;right:15px;top:15px;width:264px;height:178px;border:1px solid #c2cfe3;background:#fff;z-index:1}
.mdc-workflow-skeleton__flow{position:relative;height:100%;min-height:410px}
.mdc-workflow-skeleton__node{position:absolute;width:94px;display:flex;flex-direction:column;align-items:center;gap:10px}
.mdc-workflow-skeleton__node.node-1{left:12%;top:45%}.mdc-workflow-skeleton__node.node-2{left:30%;top:45%}.mdc-workflow-skeleton__node.node-3{left:48%;top:45%}.mdc-workflow-skeleton__node.node-4{left:66%;top:45%}
.mdc-workflow-skeleton__node-icon{display:block;width:66px;height:66px}
.mdc-workflow-skeleton__node-label{display:block;width:86px;height:10px}
.mdc-workflow-skeleton__connector{position:absolute;top:calc(45% + 33px);width:12%;height:2px}
.mdc-workflow-skeleton__connector.connector-1{left:18%}.mdc-workflow-skeleton__connector.connector-2{left:36%}.mdc-workflow-skeleton__connector.connector-3{left:54%}
.mdc-workflow-skeleton__footer-button{display:inline-block;width:76px;height:32px;margin-left:1rem;vertical-align:middle}
.mdc-workflow-skeleton .rs-mdc-bottom-buttons{padding:10px;text-align:right;border-top:1px solid #e1edff}
@keyframes mdcWorkflowSkeletonShimmer{0%{left:-100%}100%{left:100%}}
`;

const MdcWorkflowSkeleton = ({ collapse = true }) => {
    const audienceItems = Array.from({ length: 2 });
    const channelItems = Array.from({ length: 14 });
    const goalItems = Array.from({ length: 2 });
    const canvasNodes = Array.from({ length: 4 });

    return (
        <div className="container-fluid mdc-wrapper mdc-workflow-skeleton" aria-busy="true" aria-label="Loading workflow">
            <style>{mdcWorkflowSkeletonCriticalCss}</style>
            <div className="mdc-workflow-skeleton__header box-design">
                <div className="mdc-workflow-skeleton__brand skeleton-shimmer" />
                <div className="mdc-workflow-skeleton__header-group">
                    <span className="mdc-workflow-skeleton__line skeleton-shimmer w-70" />
                    <span className="mdc-workflow-skeleton__line skeleton-shimmer w-45" />
                </div>
                <div className="mdc-workflow-skeleton__header-group">
                    <span className="mdc-workflow-skeleton__line skeleton-shimmer w-60" />
                    <span className="mdc-workflow-skeleton__line skeleton-shimmer w-35" />
                </div>
                <div className="mdc-workflow-skeleton__header-actions">
                    <span className="mdc-workflow-skeleton__circle skeleton-shimmer" />
                    <span className="mdc-workflow-skeleton__circle skeleton-shimmer" />
                    <span className="mdc-workflow-skeleton__button skeleton-shimmer" />
                </div>
            </div>
            <div className={`row mdc-slider-wrapper ${collapse ? 'mdc-pannel-show' : 'mdc-pannel-hide'}`}>
                <div className="mdc-left-wrapper w-auto-del position-relative">
                    <div className="box-design css-scrollbar mdc-aside-left p0">
                        <div className="mdc-workflow-skeleton__sidebar">
                            <div className="mdc-workflow-skeleton__sidebar-section">
                                <div className="mdc-workflow-skeleton__sidebar-heading skeleton-shimmer" />
                                <div className="mdc-workflow-skeleton__sidebar-grid is-audience">
                                    {audienceItems.map((_, index) => (
                                        <div className="mdc-workflow-skeleton__sidebar-tile" key={`mdc-audience-skeleton-${index}`}>
                                            <span className={`mdc-workflow-skeleton__sidebar-icon is-round tone-${index + 1} skeleton-shimmer`} />
                                            <span className="mdc-workflow-skeleton__sidebar-label skeleton-shimmer" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mdc-workflow-skeleton__sidebar-section">
                                <div className="mdc-workflow-skeleton__sidebar-heading skeleton-shimmer" />
                                <div className="mdc-workflow-skeleton__sidebar-grid">
                                    {channelItems.map((_, index) => (
                                        <div className="mdc-workflow-skeleton__sidebar-tile" key={`mdc-channel-skeleton-${index}`}>
                                            <span className={`mdc-workflow-skeleton__sidebar-icon tone-${(index % 12) + 3} skeleton-shimmer`} />
                                            <span className={`mdc-workflow-skeleton__sidebar-label ${index % 3 === 0 ? 'is-long' : ''} skeleton-shimmer`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mdc-workflow-skeleton__sidebar-section">
                                <div className="mdc-workflow-skeleton__sidebar-heading is-wide skeleton-shimmer" />
                                <div className="mdc-workflow-skeleton__sidebar-grid is-audience">
                                    {goalItems.map((_, index) => (
                                        <div className="mdc-workflow-skeleton__sidebar-tile" key={`mdc-goal-skeleton-${index}`}>
                                            <span className={`mdc-workflow-skeleton__sidebar-icon is-round tone-${index + 11} skeleton-shimmer`} />
                                            <span className="mdc-workflow-skeleton__sidebar-label skeleton-shimmer" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="expand-icon primary-box-shadow" />
                </div>
                <div className="col mdc-right-wrapper" id="main-canvas">
                    <div className="card box-design position-relative p0" style={{ height: '100%' }}>
                        <div className="card-body p0">
                            <div className="mdc-workflow-skeleton__canvas">
                                <div className="mdc-workflow-skeleton__mini-map skeleton-shimmer" />
                                <div className="mdc-workflow-skeleton__flow">
                                    {canvasNodes.map((_, index) => (
                                        <Fragment key={`mdc-canvas-node-skeleton-${index}`}>
                                            <div className={`mdc-workflow-skeleton__node node-${index + 1}`}>
                                                <span className="mdc-workflow-skeleton__node-icon skeleton-shimmer" />
                                                <span className="mdc-workflow-skeleton__node-label skeleton-shimmer" />
                                            </div>
                                            {index < canvasNodes.length - 1 && (
                                                <span className={`mdc-workflow-skeleton__connector connector-${index + 1} skeleton-shimmer`} />
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="rs-mdc-bottom-buttons">
                            <span className="mdc-workflow-skeleton__footer-button skeleton-shimmer" />
                            <span className="mdc-workflow-skeleton__footer-button skeleton-shimmer" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(MdcWorkflowSkeleton);
