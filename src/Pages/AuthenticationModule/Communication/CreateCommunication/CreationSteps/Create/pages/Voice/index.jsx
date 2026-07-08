import { useDispatch, useSelector } from 'react-redux';
import RSTabbar from 'Components/RSTabber';

import { VOICE_TAB_CONFIG, shouldShowAuthoringTabChangeConfirmation } from '../../constant';
import { updateTab } from 'Reducers/communication/createCommunication/Create/reducer';

const Voice = () => {
    const dispatch = useDispatch();
    const {
        tabsState: {
            voice: { currentIndex },
        },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={currentIndex}
            tabData={VOICE_TAB_CONFIG}
            isTabChangeConfirmation={shouldShowAuthoringTabChangeConfirmation(isDirty)}
            callBack={(tabs, index) => {
                if (currentIndex !== index) {
                    dispatch(
                        updateTab({
                            field: 'voice',
                            data: {
                                tabName: tabs.id ?? 'vms',
                                currentIndex: index,
                            },
                        }),
                    );
                }
            }}
        />
    );
};

export default Voice;
