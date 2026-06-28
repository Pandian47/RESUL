import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { getPermissions } from 'Utils/modules/crypto';
import { userRolePermissions } from './../Hoc/constant';
import { authState } from 'Reducers/globalState/selector';
import { resetGlobalState } from 'Reducers/globalState/reducer';
import { encodeUrl } from 'Utils/modules/crypto';

const usePermission = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuth = useSelector((state) => authState(state));
    const permissionList = getPermissions();
    const permissions = userRolePermissions(permissionList);

    useEffect(() => {
        if (isAuth) {
            if (Object.keys(permissionList)?.length) {
                if (permissions) {
                    const { viewAccess } = permissions ?? {};
                    if (!viewAccess) {
                        // navigate('/dashboard');
                         let url = '/dashboard';
                            const state1 = { index: 1 };
                                const encryptState = encodeUrl(state1);
                                navigate(`${url}?q=${encryptState}`, {
                                state: {
                                        index: 0,
                               },
                               });
                    }
                }
            } else {
                const tempMasterData = localStorage.getItem('masterData');
                const tempipAddressData = localStorage.getItem('ipAddressData');
                const tempdisable_plugin_last_shown = localStorage.getItem('disable_plugin_last_shown');
                const temp_session_credentials = localStorage.getItem('sessionCredentials');
                 const tempNewVersionConfirm = localStorage.getItem('newVersionConfirm');
                localStorage.clear();
                if (tempMasterData !== null) {
                    localStorage.setItem('masterData', tempMasterData);
                    localStorage.setItem('ipAddressData',  tempipAddressData);  
                    localStorage.setItem('disable_plugin_last_shown', tempdisable_plugin_last_shown);
                }
                if(temp_session_credentials) {
                    localStorage.setItem('sessionCredentials', temp_session_credentials);
                }
                localStorage.setItem('newVersionConfirm', tempNewVersionConfirm);
                dispatch(resetGlobalState());
                navigate('/');
            }
        }
    }, []);

    return { permissions, permissionList };
};

export default usePermission;

// {
//     "featureID": 1,
//     "viewAccess": true,
//     "addAccess": false,
//     "updateAccess": false,
//     "deleteAccess": false
// }
