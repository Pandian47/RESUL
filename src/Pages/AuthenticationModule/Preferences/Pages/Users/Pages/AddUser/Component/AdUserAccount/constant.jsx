import ADFS from './Component/ADFS';
import AZURE from './Component/AZURE';
import LDAP from './Component/LDAP';

export const tabData = (handleClose) => [
    { id: 1001, text: 'ADFS', disable: true, component: () => <ADFS handleClose={handleClose} /> },
    { id: 1002, text: 'AZURE', disable: false, component: () => <AZURE handleClose={handleClose} /> },
    { id: 1003, text: 'LDAP', disable: true, component: () => <LDAP handleClose={handleClose} /> },
];
