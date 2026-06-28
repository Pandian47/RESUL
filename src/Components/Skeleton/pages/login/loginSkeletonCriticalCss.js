/** Login card layout — safe before app.scss (matches Login/index.jsx + _login.scss). */
export const loginSkeletonCriticalCss = `
.login-skeleton-scope {
    width: 100%;
    box-sizing: border-box;
}
.login-skeleton-scope .login-resul-logo {
    display: flex;
    align-items: center;
    justify-content: center;
}
.login-skeleton-scope .login-skeleton-logo {
    display: block;
    width: 378px;
    max-width: calc(100vw - 32px);
    height: 55px;
    margin: 0 auto;
    border-radius: 4px;
    background-color: #e2e7ee;
}
.login-skeleton-scope .loginTabs-container {
    max-width: 440px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}
.login-skeleton-scope .login-info-container {
    margin-top: 30px;
    width: 100%;
}
.login-skeleton-scope .login-skeleton-tab-head {
    background-color: #0043ff;
    width: 100%;
    min-height: 68px;
    padding: 30px 23px;
    border-radius: 5px 5px 0 0;
    box-sizing: border-box;
    flex-shrink: 0;
}
.login-skeleton-scope .login-cont {
    background-color: #fff;
    border: 1px solid #c2cfe3;
    border-top: 0;
    border-radius: 0 0 5px 5px;
    box-shadow: rgba(0, 0, 0, 0.3) 0 25px 20px -20px;
    box-sizing: border-box;
    margin-top: 0;
}
.login-skeleton-scope .login-skeleton-form {
    padding: 19px;
    box-sizing: border-box;
}
.login-skeleton-scope .login-skeleton-field {
    width: 100%;
    height: 32px;
    margin-bottom: 21px;
    border-bottom: 1px solid #e9e9e9;
    box-sizing: border-box;
}
.login-skeleton-scope .login-skeleton-field--dropdown {
    height: 36px;
    margin-bottom: 24px;
}
.login-skeleton-scope .login-skeleton-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 12px;
}
.login-skeleton-scope .login-skeleton-remember {
    width: 108px;
    height: 14px;
    border-radius: 4px;
}
.login-skeleton-scope .login-skeleton-forgot {
    width: 96px;
    height: 14px;
    border-radius: 4px;
}
.login-skeleton-scope .login-skeleton-submit {
    width: 100%;
    height: 36px;
    border-radius: 4px;
}
.login-skeleton-scope .login-skeleton-new-user {
    display: block;
    width: 72px;
    height: 14px;
    margin: 15px auto 0;
    border-radius: 4px;
}
.login-skeleton-scope .skeleton-shimmer {
    position: relative;
    overflow: hidden;
    background-color: #e2e7ee;
    display: block;
    box-sizing: border-box;
}
.login-skeleton-scope .skeleton-shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    animation: loginSkeletonShimmer 1.6s infinite;
}
@keyframes loginSkeletonShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
@media only screen and (min-width: 1367px) {
    .login-skeleton-scope .login-skeleton-logo {
        width: 300px;
        height: 60px;
    }
    .login-skeleton-scope .login-skeleton-tab-head {
        min-height: 64px;
        padding: 28px 23px;
    }
}
`;
