import content from 'Constants/GlobalConstant/Content/content.json';

export const LOGIN_DATA = [
    content.loginPage.loginDropdownItems.resul,
    content.loginPage.loginDropdownItems.adfs,
    content.loginPage.loginDropdownItems.ldap,
];
export const FORM_INITIAL_STATE = {
    defaultValues: { 
        loginControl: content.loginPage.loginDropdownItems.resul,
        rememberme: false,
        emailId: '',
        password: ''
     },
    mode: 'onTouched',
};
