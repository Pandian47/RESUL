import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import RSTabbar from 'Components/RSTabber';

import { QR_TAB_CONFIG, UPDATE_QR_TAB_CONFIG } from '../../constant';
import { updateQr, updateQREnableTab, updateTab } from 'Reducers/communication/createCommunication/Create/reducer';

const QR = () => {
    const dispatch = useDispatch();
    const {
        tabsState: {
            qr: { currentIndex },
        },
        isDirty,
        enableTab,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { tabName } = enableTab;
    const [updateCurrentIndex, setUpdateCurrentIndex] = useState(currentIndex);

    useEffect(() => {
        if (!tabName) {
            setUpdateCurrentIndex(currentIndex < 0 ? 0 : currentIndex);
        } else {
            switch (tabName) {
                case 'url':
                    setUpdateCurrentIndex(0);
                    break;
                case 'sms':
                    setUpdateCurrentIndex(4);
                    break;
            }
        }
    }, [tabName, currentIndex]);

    return (
        <>
            <RSTabbar
                dynamicTab={`rs-sub-tabs rs-cc-sub-tabs rs-refresh-tab-spacing`}
                activeClass={`active`}
                className='MDC-subtab-tip'
                defaultTab={updateCurrentIndex}
                tabData={!tabName ? QR_TAB_CONFIG : UPDATE_QR_TAB_CONFIG(tabName)}
                isTabChangeConfirmation={isDirty}
                clear
                onClear={(ind) => {
                    dispatch(
                        updateQr({
                            field: 'isClear',
                            data: true,
                        }),
                    );
                    dispatch(
                        updateQREnableTab({
                            tabName: '',
                            refreshStatus: false,
                        }),
                    );
                    dispatch(
                        updateTab({
                            field: 'qr',
                            data: {
                                tabName: 'url',
                                currentIndex: 0,
                            },
                        }),
                    );
                }}
                callBack={(tabs, index) => {
                    if (currentIndex !== index) {
                        dispatch(
                            updateTab({
                                field: 'qr',
                                data: {
                                    tabName: tabs.id ?? 'email',
                                    currentIndex: index,
                                },
                            }),
                        );
                    }
                }}
            />
        </>
    );
};

export default QR;
