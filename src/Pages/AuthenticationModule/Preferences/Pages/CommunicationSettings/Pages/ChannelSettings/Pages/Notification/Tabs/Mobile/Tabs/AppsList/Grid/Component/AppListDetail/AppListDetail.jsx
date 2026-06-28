import { delete_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import ResNoDataAvailable from 'Pages/KendoDocs/CommonComponents/ResNoDataAvailable';
import { LIST_DETAIL_EMPTY_MESSAGES } from 'Pages/KendoDocs/CommonComponents/ResGrid/config';
import usePermission from 'Hooks/usePersmission';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { remove_AppStore } from 'Reducers/preferences/CommunicationSettings/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

const AppListDetail = ({ dataItem, getData, onCollapse }) => {
    // let detailItem = dataItem?.mobilepushdeviceinfo;
    let detailItem = dataItem?.device;
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));

    const {
        permissions: { deleteAccess },
    } = usePermission();
    const [isDelete, setIsDelete] = useState({
        show: false,
        data: {},
    });
    const detailStatusClass =
        dataItem?.isEnabled === 'Active' || dataItem?.isEnabled === true
            ? 'status-inprogress'
            : 'status-draft';
    const hasDevices = detailItem !== undefined && detailItem?.length > 0;

    const handleDelete = async (data) => {
        const payload = {
            clientId,
            userId,
            departmentId,
            pushNotifySettingId: data?.pushNotifySettingId,
            pushNotifyappstoreId: data?.pushNotifyappstoreId,
        };
        const res = await dispatch(remove_AppStore({ payload }));
        if (res?.status) {
            getData();
            setIsDelete({
                show: false,
                data: {},
            });
        } else {
            setIsDelete({
                show: false,
                data: {},
            });
        }
    };
    return (
        <div className={`rs-grid-detail-view channel-settings ${detailStatusClass}`}>
            <table className="grid-detail-content">
                <thead>
                    <tr>
                        <th>Mobile platform</th>
                        <th>Language</th>
                        <th>Analytics platform</th>
                        <th className="text-end">Action</th>
                    </tr>
                </thead>
                {hasDevices && (
                    <tbody>
                        {detailItem.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <p>{item?.appDevice}</p>
                                </td>
                                <td>
                                    <p>{item.language || 'Native'}</p>
                                </td>
                                <td>
                                    <p>{item.analyticsPlatforms || 'NA'}</p>
                                </td>
                                <td>
                                    <ul>
                                        <li className="position-relative d-flex justify-content-end">
                                            <RSTooltip text="Delete" position="top" innerContent={false} className="lh-base">
                                                <div className={`${!deleteAccess ? 'click-off' : ''}`}>
                                                    <i
                                                        id="rs_data_delete"
                                                        className={`${delete_medium} icon-md color-primary-red`}
                                                        onClick={() => {
                                                            setIsDelete({
                                                                show: true,
                                                                data: {
                                                                    ...dataItem,
                                                                    pushNotifyappstoreId: item?.pushNotifyappstoreId,
                                                                },
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </RSTooltip>
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>

            {!hasDevices && (
                <div className="resgrid-detail-empty">
                    <ResNoDataAvailable message={LIST_DETAIL_EMPTY_MESSAGES.appDevices} />
                </div>
            )}

            <div className={`${detailStatusClass} expand-plus`}>
                <ul className="camp-icon-pannel">
                    <li>
                        <i
                            className="k-icon k-i-minus cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => onCollapse?.(dataItem)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onCollapse?.(dataItem);
                                }
                            }}
                            aria-label="Collapse row"
                        />
                    </li>
                </ul>
            </div>

            <RSConfirmationModal
                show={isDelete?.show}
                handleConfirm={(status) => {
                    if (status) {
                        if (deleteAccess) handleDelete(isDelete?.data);
                    }
                }}
                handleClose={() => {
                    setIsDelete({
                        show: false,
                        data: {},
                    });
                }}
            />
        </div>
    );
};

export default AppListDetail;
