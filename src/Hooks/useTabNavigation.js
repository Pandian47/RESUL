import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateCurrTabConfig } from 'Reducers/globalState/reducer';
export const useTabNavigation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return ({ field, data, route = '', state = {}, onSuccess }) => {
        dispatch(updateCurrTabConfig({ field, data }));
        if (route) {
            navigate(route, { state });
        }
        if (typeof onSuccess === 'function') {
            onSuccess();
        }
    };
};
