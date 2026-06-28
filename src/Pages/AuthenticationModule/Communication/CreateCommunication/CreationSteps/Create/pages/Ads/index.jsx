import { useDispatch, useSelector } from 'react-redux';
import RSTabbar from 'Components/RSTabber';

import { ADS_TAB_CONFIG } from '../../constant';
import { updateTab } from 'Reducers/communication/createCommunication/Create/reducer';

const Ads = () => {
    const dispatch = useDispatch();
    const {
        tabsState: {
            ads: { currentIndex },
        },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={currentIndex}
            tabData={ADS_TAB_CONFIG()}
            isTabChangeConfirmation={isDirty}
            callBack={(tabs, index) => {
                if (currentIndex !== index) {
                    dispatch(
                        updateTab({
                            field: 'ads',
                            data: {
                                tabName: tabs.id ?? 'google',
                                currentIndex: index,
                            },
                        }),
                    );
                }
            }}
        />
    );
};

export default Ads;
