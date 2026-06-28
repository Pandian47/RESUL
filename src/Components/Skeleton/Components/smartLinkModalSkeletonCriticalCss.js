/** Scoped styles for Smart Link modal loading skeleton (Create → SmartLinkModal). */
export const smartLinkModalSkeletonCriticalCss = `
.smartlink-modal-skeleton-scope {
    padding: 0 10px 10px;
    box-sizing: border-box;
}
.smartlink-modal-skeleton-scope .skeleton-shimmer {
    display: block;
    border-radius: 4px;
}
.smartlink-modal-skeleton__tab-bar {
    display: flex;
    align-items: flex-end;
    gap: 5px;
    background: #e2e7ee;
    padding: 7px 10px 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    margin-bottom: 7px;
}
.smartlink-modal-skeleton__tab {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 108px;
    min-height: 38px;
    padding: 10px 21px;
    background: #fff;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    border-bottom: 5px solid #fff;
    margin-bottom: 0;
}
.smartlink-modal-skeleton__tab--active .skeleton-shimmer {
    margin: 0 auto;
}
.smartlink-modal-skeleton__tab-add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    min-height: 38px;
    padding: 11px 0;
    margin-bottom: 7px;
    background: #fff;
    border-radius: 5px;
}
.smartlink-modal-skeleton__friendly-name {
    padding: 35px 0 35px 30px;
}
.smartlink-modal-skeleton__friendly-name .skeleton-shimmer {
    max-width: 50%;
    height: 32px;
}
.smartlink-modal-skeleton__accordion-row {
    margin-left: 0;
    margin-right: 0;
}
.smartlink-modal-skeleton__accordion {
    border-radius: 5px;
    overflow: hidden;
    box-shadow: none;
}
.smartlink-modal-skeleton__accordion-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #e2e7ee;
    border: 1px solid #e2e7ee;
    border-bottom: none;
}
.smartlink-modal-skeleton__accordion-body {
    padding: 20px 16px 16px;
    background: #fff;
    border: 1px solid #e2e7ee;
    border-top: none;
    border-radius: 0 0 5px 5px;
}
.smartlink-modal-skeleton__url-field {
    width: 100%;
    height: 34px;
    margin-bottom: 16px;
}
.smartlink-modal-skeleton__accordion-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.smartlink-modal-skeleton__utm {
    display: flex;
    align-items: center;
}
.smartlink-modal-skeleton__add-platform {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    width: 40px;
    flex: 0 0 40px;
}
.smartlink-modal-skeleton__generate-btn {
    width: 96px !important;
    height: 36px !important;
    border-radius: 4px !important;
}
`;
