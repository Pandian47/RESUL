import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { LAST30DAYS_DATEFILTER } from 'Constants/GlobalConstant/Regex';
import { createContext, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getSessionId } from 'Reducers/globalState/selector';
export const StateContext = createContext();

export const PushBuilderStateProvider = ({ children, channelId }) => {
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [title, setTitle] = useState(
        `${channelId === 14 ? 'Mobile push template gallery' : 'Web push template gallery'}`,
    );
    const [payload, setPayload] = useState({
        departmentId,
        clientId,
        userId: 0,
        channelId,
        templatecategory: 'All template',
        pagination: {
            pageNo: 1,
            recordLimit: 4,
        },
        isFilter: true,
        filteration: {
            templateName: '',
            startDate: getYYMMDD(getDateWithDaynoFormat(LAST30DAYS_DATEFILTER)),
            endDate: getYYMMDD(new Date()),
            templateCategoryId: '',
        },
    });
    const location = useLocation();
    const { state } = location;
    const dispatch = useDispatch();
    return (
        <StateContext.Provider
            value={{ payload, setPayload, title, departmentId, clientId, userId, location, state, dispatch }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const usePushBuilderStateContext = () => useContext(StateContext);
