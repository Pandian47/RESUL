import { useEffect } from 'react';
import { getSessionId } from 'Reducers/globalState/selector';

import { useDispatch, useSelector } from 'react-redux';
import { getPersonalizationFields } from 'Reducers/communication/createCommunication/Create/request';
import { getOfferType, getOfferNameList } from 'Reducers/preferences/OfferManagements/request';
import { getOfferManagement } from 'Reducers/preferences/OfferManagements/reducer';

const AILandingPageBuilder = () => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { personalization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);

    const { getOfferTypeData, getOfferNameListData = [] } = useSelector((state) => state.offerMangementReducer);
    async function fetchDetails(payload) {
        let offerTypeRes = await dispatch(getOfferType(payload));
        if (offerTypeRes?.status) {
            dispatch(getOfferManagement({ field: 'getOfferTypeData', data: offerTypeRes?.data }));
        } else {
            dispatch(getOfferManagement({ field: 'getOfferTypeData', data: [] }));
        }
    }
    useEffect(() => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        dispatch(getPersonalizationFields({ payload }));
        fetchDetails(payload);
    }, []);
    const offerCallback = async (offerCode = 'Common', offerType = 0) => {
                const payload = {
            departmentId,
            clientId,
            userId,
            offerTypeId: offerType,
            offerCodeType: offerCode === 'Common' ? 0 : 1,
        };
        let { status, data } = await dispatch(getOfferNameList(payload));
        if (status) {
            dispatch(getOfferManagement({ field: 'getOfferNameListData', data: data }));
        } else {
            dispatch(getOfferManagement({ field: 'getOfferNameListData', data: [] }));
        }
    };
    return (
        <div>
            <iframe
                style={{ width: '100%', height: '85vh', top: 80, position: 'relative' }}
                src="https://clever-mermaid-cdd833.netlify.app/?builder=landing"
            ></iframe>
        </div>
    );
};

export default AILandingPageBuilder;
