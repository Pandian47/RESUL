export const FORM_INITIAL_STATE = {
    defaultValues: {
        smtpType: '',
        drpsenderdomainname: '',
        clientSetupSmtpServer: '',
        clientSetupSmtpPort: '',
        clientSetupSmtpUser: '',
        clientSetupSmtpPassword: '',
        clientSetupServerFromMail: '',
        clientSetupServerBounceEmail: '',
        clientSetupDkeyRecord: '',
        transactionCommunication: false,
        drpthrottlesetting: '',
        smtpType: '',
        smtphousing: '',
        clientSetup: {
            domainKey: '',
            spfRecord: '',
        },
        smtpServerSettings: {
            credentials: [
                {
                    userName: '',
                    password: '',
                },
            ],
            serverNameIP: '',
            portNumber: '',
            checkSMTPConfiguration: true,
        },
    },
    mode: 'onTouched',
};
