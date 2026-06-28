import RSTabbar from 'Components/RSTabber';
import { SOCIAL_POST_TAB_CONFIG } from '../../constant';
import { useDispatch, useSelector } from 'react-redux';
import { updateTab } from 'Reducers/communication/createCommunication/Create/reducer';

const SocialPost = () => {
    const dispatch = useDispatch();
    const {
        tabsState: {
            socialPost: { currentIndex },
        },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    return (
        <RSTabbar
            dynamicTab={`rs-sub-tabs rs-cc-sub-tabs`}
            activeClass={`active`}
            defaultTab={currentIndex}
            tabData={SOCIAL_POST_TAB_CONFIG}
            isTabChangeConfirmation={isDirty}
            callBack={(tabs, index) => {
                if (currentIndex !== index) {
                    dispatch(
                        updateTab({
                            field: 'socialPost',
                            data: {
                                tabName: tabs.id ?? 'facebook',
                                currentIndex: index,
                            },
                        }),
                    );
                }
            }}
        />
    );
};

export default SocialPost;
